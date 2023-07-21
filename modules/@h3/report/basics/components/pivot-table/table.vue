<template>
  <div
    ref="pivotTable"
    :class="getTableClass"
    :style="getTableStyle"
  >
    <div :class="`${prefixCls}__view`" ref="tableView">
      <h3-table-header
        v-if="getTableRows.length && fixedColHead && !isMobile"
        ref="header"
        :prefixCls="prefixCls"
        :rows="rows"
        :alias="alias"
        :tableRows="getTableRows"
        :tableColumnsWidths="tableColumnsWidths"
        :scrollLeft="bodyWScroll.left"
        :allowDrag="allowDrag"
        @cell-click="cellClick"
        @start-drag="startDrag"
        @change-columns="columnAdaptSize($event)"
      ></h3-table-header>
      <h3-table-body
        v-if="getTableColumns.length"
        :prefixCls="prefixCls"
        :alias="alias"
        :tableColumnsWidths="tableColumnsWidths"
        :bodyRows="bodyRows"
        :columns="columns"
        :metric="metric"
        :summary="summary"
        :tableColumns="tableColumns"
        :height="bodyHeight"
        :fixedColHead="fixedColHead && !isMobile"
        :showOrderNo="showOrderNo"
        :rows="rows"
        :tableRows="getTableRows"
        :fullScreen="fullScreen"
        :allowDrag="allowDrag"
        @bodyScroll="bodyScroll"
        @start-drag="startDrag"
        @change-columns="columnAdaptSize($event)"
      >
        <h3-table-footer
          ref="footer"
          v-if="summary.length"
          :prefixCls="prefixCls"
          :summary="summary"
          :tableColumnsWidths="tableColumnsWidths"
        >
        </h3-table-footer>
      </h3-table-body>
      <div
        v-if="allowDrag"
        class="column-resize-line"
        ref="resize-line"
      ></div>
      <!-- 固定 -->
      <div
        :class="`${prefixCls}__fixed`"
        :style="{ width: getFixedLeftWidth + 'px' }"
        v-if="fixedRowHead && !isMobile"
      >
        <div :style="{ width: tableWidth + 'px' }">
          <h3-table-header
            v-if="getTableRows.length && fixedColHead && !isMobile"
            :prefixCls="prefixCls"
            :rows="rows"
            :alias="alias"
            :tableRows="getTableRows"
            :tableColumnsWidths="tableColumnsWidths"
            fix="left"
            :allowDrag="allowDrag"
            @cell-click="cellClick"
            @start-drag="startDrag"
            @change-columns="columnAdaptSize($event)"
          ></h3-table-header>
          <h3-table-body
            v-if="getTableColumns.length"
            :prefixCls="prefixCls"
            :alias="alias"
            :tableColumnsWidths="tableColumnsWidths"
            :bodyRows="bodyRows"
            :columns="columns"
            :metric="metric"
            :summary="summary"
            :tableColumns="tableColumns"
            :height="bodyHeight"
            :scrollTop="bodyWScroll.top"
            fix="left"
            :fixedColHead="fixedColHead && !isMobile"
            :showOrderNo="showOrderNo"
            :rows="rows"
            :allowDrag="allowDrag"
            :tableRows="getTableRows"
            :fullScreen="fullScreen"
            @start-drag="startDrag"
            @change-columns="columnAdaptSize($event)"
          >
            <h3-table-footer
              v-if="summary.length"
              :prefixCls="prefixCls"
              :summary="summary"
              :tableColumnsWidths="tableColumnsWidths"
              fix="left"
            >
            </h3-table-footer>
          </h3-table-body>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Provide, Inject } from "vue-property-decorator";
import H3TableHeader from "./header.vue";
import H3TableBody from "./scroll.vue";
import H3TableFooter from "./footer.vue";
import { isMobile } from "../../utils/browser";
import { convertNumber } from "../../utils/number";
import { handleTableData } from "./utils";
import { StringType } from "../../enum/filter-type";
import getAliaValue from "../../utils/alias";
@Component({
  name: "h3-pivot-table",
  components: {
    H3TableHeader,
    H3TableBody,
    H3TableFooter
  }
})
export default class ReportPivotTable extends Vue implements H3.PivotTable.Table {
  @Prop({ default: () => [] }) refresh!: boolean;
  @Prop({ default: () => [] }) columns!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => [] }) rows!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => [] }) metric!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => [] }) alias!: any;
  @Prop({ default: () => false }) isNo!: boolean;
  @Prop({ default: () => true }) allowDrag!: boolean;
  @Prop({ default: () => 0 }) height!: number;
  @Prop({ default: () => 0 }) width!: number;
  @Prop({ default: () => ({}) }) data!: H3.PivotTable.Data;
  @Prop({ default: () => false }) fixedColHead!: boolean;
  @Prop({ default: () => false }) fixedRowHead!: boolean;
  @Prop({ default: () => "" }) uid!: string;
  @Prop({ default: () => "" }) title!: string;
  @Prop({ default: () => "" }) fontColor!: string;
  // 表格列宽等配置项
  @Prop({ default: () => [] }) columnsSetting!: Array<H3.PivotTable.columnSetting>;

  @Inject({ default: () => {} }) setTableExportData!: Function;
  prefixCls = "h3-pivot-table";
  isMobile = isMobile;
  bodyHeight: number = 0;
  bodyWScroll = {};
  summary: Array<number> = [];
  bodyRows: Array<any> = [];
  tableColumns: Array<any> = [];
  tableColumnsWidths: Array<number> = [];
  tableRows: Array<any> = [];
  headerRows: Array<any> = [];
  footerRows: Array<any> = [];
  fixedWidth: number = 0;
  tableWidth: number = 0;
  fullScreen: boolean = false;
  loaded = false;
  // 拖拽列宽的线
  dragLine: any;
  // 初始化拖拽时需要用的属性
  dragOptions: any = null;
  // 映射字段列宽
  mapColumnsWidth: { [key: string]: number } = {};
  // 内部数据，表格属性
  innerColumnsSetting: Array<H3.List.columnSetting> = this.columnsSetting;
  // 平均宽度
  averageWidth: number = 0;
  // 图表宽度
  wrapWidth: number = 0;

  @Watch("refresh")
  watchRefresh() {
    if (!this.loaded && this.refresh) {
      this.loaded = true;
      this.initTableData();
    }
  }
  @Watch("data")
  watchData() {
    this.initTableData();
  }
  /**
   * 监听序号变化
   */
  @Watch("isNo")
  watchIsNo() {
    this.initTableData();
  }
  /**
   * 下传是否有序号
   */
  get showOrderNo() {
    return this.isNo;
  }
  get getTableClass() {
    return {
      [this.prefixCls]: true,
      [`${this.prefixCls}__theme`]: !!this.fontColor
    };
  }
  /**
   * 设置表格样式
   */
  get getTableStyle() {
    return {
      width: this.width ? `${this.width}px` : null,
      color: this.fontColor + " !important"
    };
  }
  get getTableColumns() {
    return this.tableColumns && this.tableColumns.length
      ? this.bodyRows.map((row: Array<any>, index: number) => this.tableColumns[index].concat(row))
      : this.bodyRows;
  }

  get getTableRows() {
    return this.rows.length && this.tableRows.length
      ? this.tableRows.map((row: Array<string>, index: number) =>
          this.headerRows[index].concat(row, this.footerRows[index])
        )
      : this.tableRows;
  }

  get getColumns() {
    return this.columns;
  }
  get getFixedLeftWidth() {
    return this.fixedWidth + this.columns.length + 2;
  }
  /**
   * 刷新透视表
   */
  refreshTable() {
    this.initTableData();
  }
  /**
   * 获取表体高度
   */
  getBodyHeight() {
    // 每个单元格的高度是36px + 1px 边距 底部边框是上下2px 38px
    const bodyHeight = this.height || this.$el.clientHeight - 18; // 12px的下padding
    if (this.fixedColHead && !this.isMobile) {
      this.bodyHeight = bodyHeight - this.tableRows.length * 37;
    } else {
      this.bodyHeight = bodyHeight;
    }
  }
  @Provide()
  setFixedWidth(width: number) {
    this.fixedWidth = width;
  }
  @Provide()
  setTableWidth(width: number) {
    if (this.$refs.pivotTable) {
      // 宽度超出滚动距离时用图表的宽度
      this.tableWidth = Math.max((this.$refs.pivotTable as any).clientWidth - 32, width);
    }
  }
  /**
   * 监听表体滚动
   */
  bodyScroll(bodyScroll: any) {
    this.bodyWScroll = bodyScroll;
  }
  /**
   * 初始化位置,及可拖动范围
   * @param container 外层容器
   * @param option 拖拽列表传出的属性
   */
  initDragOptions(container, option) {
    const wrapRect = this.$el.getBoundingClientRect();
    const thRect = option.e.target.parentElement.getBoundingClientRect();
    const wp = 16; // 容器padding
    let min: number | null = null;
    let max: number | null = null;
    let wrapLeft = wrapRect.left + wp;
    let cellW = thRect.width;

    min = Math.round(thRect.left - wrapLeft + 30); // 格子最小30px
    min = min < 2 ? 2 : min; // 左边界预留2px
    max = wrapRect.width - wp * 2 - 5; // 右边边界预留5px
    let cur = option.e.pageX - wrapLeft; // 当前线的位置
    return {
      cur, // 当前位置
      min, // 可移动区域的最小值
      max, // 可移动区域的最大值
      cellW, // 格子宽度
      wrapLeft, // list容器距离屏幕边缘的距离，可与鼠标位置配合算出线的位置
      option // 表格属性
    };
  }
  /**
   * 拖拽列宽开始
   */
  startDrag(option: { e: Event; row: any }) {
    this.dragOptions = this.initDragOptions(this.$el, option);
    this.dragLine.style.left = this.dragOptions.cur + "px";
    this.dragLine.classList.add("dragged");
    document.body.addEventListener("mousemove", this.dragMousemove, false);
    document.body.addEventListener("mouseup", this.dragMouseup, false);
  }

  /**
   * 列宽拖拽中
   */
  dragMousemove(e) {
    let { min, max, wrapLeft } = this.dragOptions;
    let offset =
      e.pageX - wrapLeft < min ? min : e.pageX - wrapLeft > max ? max : e.pageX - wrapLeft;
    this.dragLine.style.left = offset + "px";
  }
  /**
   * 列宽拖拽结束
   */
  dragMouseup(e) {
    this.dragLine.classList.remove("dragged");
    let { cur, min, max, cellW, wrapLeft, option } = this.dragOptions;
    let offset =
      e.pageX - wrapLeft < min ? min : e.pageX - wrapLeft > max ? max : e.pageX - wrapLeft;
    // 没移动,兼容双击事件
    if (cur !== offset) {
      let tmpIndex = this.innerColumnsSetting.findIndex(item => {
        return item.key === option.row.key;
      });
      this.mapColumnsWidth[option.row.key] = cellW - (cur - offset);
      if (tmpIndex > -1) {
        this.innerColumnsSetting[tmpIndex].width = cellW - (cur - offset);
      } else {
        this.innerColumnsSetting.push({
          width: cellW - (cur - offset),
          key: option.row.key
        });
      }
      this.$emit("change-columns", this.innerColumnsSetting);
      this.initTableData();
    }
    this.dragOptions = null;
    document.body.removeEventListener("mouseup", this.dragMouseup, false);
    document.body.removeEventListener("mousemove", this.dragMousemove, false);
  }

  /**
   * 初始化数据
   */
  initData() {
    this.bodyHeight = 0;
    this.bodyWScroll = {};
    this.summary = [];
    this.bodyRows = [];
    this.tableColumns = [];
    this.tableColumnsWidths = [];
    this.tableRows = [];
    this.headerRows = [];
    this.footerRows = [];
  }
  initTableData() {
    this.dragLine = this.$refs["resize-line"] as HTMLElement;
    // 没有行维度时
    if (this.data.summary && !this.data.data) this.data.data = [this.data.summary];
    if (!this.data.data) return;
    this.initData();
    const data = handleTableData(this.getColumns, this.rows, this.metric, this.data, this.isNo);
    const numberFormats: Array<H3.Report.NumberFormat> = [];
    this.bodyRows = JSON.parse(JSON.stringify(this.data.data));
    this.tableColumns = data.columns;
    this.summary = JSON.parse(JSON.stringify(this.data.summary));
    this.tableRows = data.rows;
    // 取出数据格式
    this.metric.forEach((metric: H3.Report.FieldColumn, index: number) => {
      numberFormats.push(metric.options.numberFormat as any);
    });
    // 数值格式化
    if (numberFormats.length) {
      [...this.bodyRows, this.summary].forEach((row: any) => {
        row.forEach((cell: any, index: number) => {
          if (
            toString.call(cell) === "[object Number]" &&
            numberFormats[index % numberFormats.length]
          ) {
            row[index] = convertNumber(cell, numberFormats[index % numberFormats.length]);
          }
        });
      });
    }
    if (this.rows && this.rows.length) {
      let headerRow: Array<any> = [];
      this.tableRows.forEach((row: Array<string>, index: number) => {
        if (index === 0) {
          this.footerRows.push([
            {
              label: "汇总",
              rowspan: this.rows.length || null,
              colspan: this.metric.length || null
            }
          ]);
        } else if (index === this.tableRows.length - 1) {
          this.footerRows.push([
            ...this.metric.map((metric: H3.Report.FieldColumn) => {
              return {
                label: metric.alias || metric.name,
                key: `汇总_${metric.uid}#${metric.alias || metric.name}`
              };
            })
          ]);
        } else {
          this.footerRows.push([]);
        }
        headerRow = [];
        if (index < this.rows.length) {
          headerRow.unshift({
            label: this.rows[index].alias || this.rows[index].name,
            colspan: this.getColumns.length || null
          });
        } else if (this.getColumns && this.getColumns.length) {
          headerRow.unshift(
            ...this.getColumns.map((item: H3.Report.FieldColumn) => {
              return {
                label: item.alias || item.name,
                key: `${item.uid}#${item.alias || item.name}`
              };
            })
          );
        } else {
          headerRow.unshift("");
        }
        this.headerRows.push(headerRow);
      });
    } else {
      this.headerRows = this.tableRows;
    }
    if (this.isNo && this.getColumns.length) {
      this.headerRows.forEach((rows: Array<any>) => {
        if (rows[0].key) {
          rows.unshift({
            label: "序号",
            colspan: 1,
            key: "orderNumber"
          });
        } else {
          rows[0].colspan += 1;
        }
      });
    }
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.fontSize = "12px";
    span.style.display = "inline-block";
    (this.$refs.pivotTable as HTMLDivElement).appendChild(span);
    let lastRow: any;
    if (this.tableColumns.length) {
      lastRow = this.tableColumns[this.tableColumns.length - 1].concat(this.summary);
    } else {
      lastRow = this.summary;
    }

    if (this.$refs.tableView) {
      this.wrapWidth = (this.$refs.tableView as HTMLDivElement).clientWidth;
    }
    this.averageWidth = Math.round(this.wrapWidth / lastRow.length) || 80; // 平均宽度
    this.tableColumnsWidths = Array(lastRow.length).fill(this.averageWidth); // 最小值
    [...this.getTableColumns, lastRow].forEach((rows: Array<any>) => {
      rows.forEach((row: any, index: number) => {
        let realIndex = this.isNo ? index - 1 : index;
        let realName = row;
        let aliaName = row;
        if (row || row === "") {
          if (typeof row !== "object") {
            realName = row;
          } else {
            realName = row.label;
          }
          aliaName = this.getColumns[realIndex]
            ? getAliaValue(this.getColumns[realIndex].uid, aliaName, this.alias)
            : "";

          span.innerText = aliaName || realName;
          this.tableColumnsWidths[index] = Math.max(
            span.clientWidth + 28,
            this.tableColumnsWidths[index],
            80
          );
          // 初始化最大宽度为300，即双击显示最多三百的宽度。
          this.tableColumnsWidths[index] =
            this.tableColumnsWidths[index] > 300 ? 300 : this.tableColumnsWidths[index];
        }
      });
    });
    // const fields = [...this.getColumns,...this.metric || [],...this.metric || []];
    // this.tableColumnsWidths.forEach((item,index)=> {
    //   let tmpField = fields[index];
    //   let fieldName = tmpField.alias ?  tmpField.alias : tmpField.name;
    //   span.innerText = fieldName;
    //   let fieldWidth = span.clientWidth + 28;
    //   if(fieldWidth > item) {
    //     this.tableColumnsWidths[index] = fieldWidth > 300 ? 300 : fieldWidth;
    //   }
    // });
    if (this.isNo) {
      this.tableColumnsWidths[0] = 50;
    }
    (this.$refs.pivotTable as HTMLDivElement).removeChild(span);
    this.$nextTick(() => {
      this.getBodyHeight();
      this.fullScreen = !this.fullScreen;
    });

    this.handleColumnsWidth();
    this.setTableExportData &&
      this.setTableExportData({
        uid: this.uid,
        data: {
          colWidth: this.tableColumnsWidths,
          headRows: this.getTableRows,
          headColumns: this.tableColumns,
          bodyRows: this.bodyRows,
          summary: this.summary,
          alias: this.alias,
          title: this.title,
          columns: this.columns,
          metric: this.metric,
          rows: this.rows
        }
      });
  }
  /**
   * 列宽自适应
   * @param option
   */
  columnAdaptSize(option: { e: Event; row: H3.List.TitleOptions }) {
    let tmpIndex = this.innerColumnsSetting.findIndex(item => item.key === option.row.key);
    if (tmpIndex > -1) {
      this.innerColumnsSetting.splice(tmpIndex, 1);
      this.$emit("change-columns", this.innerColumnsSetting);
      this.initTableData();
    }
  }

  /**
   * 处理图表列宽
   */
  handleColumnsWidth() {
    this.innerColumnsSetting = this.innerColumnsSetting.filter(item => {
      return this.getTableRows[this.getTableRows.length - 1].find((row, index) => {
        if (item.key === row.key) {
          this.tableColumnsWidths[index] = item.width;
        }
        return item.key === row.key;
      });
    });

    // 生成冻结列时，不计算
    let realWidth = 0;
    if (this.tableColumnsWidths && this.tableColumnsWidths.length > 0) {
      realWidth = this.tableColumnsWidths.reduce((total, current) => {
        return total + current;
      }, 0);
    }
    // 宽度不够时，最后一个补齐
    if (realWidth < this.wrapWidth && this.tableColumnsWidths.length > 1) {
      this.tableColumnsWidths[this.tableColumnsWidths.length - 1] =
        this.tableColumnsWidths[this.tableColumnsWidths.length - 1] + (this.wrapWidth - realWidth);
    }
    this.mapColumnsWidth = {};
    this.innerColumnsSetting.forEach(item => {
      this.mapColumnsWidth[item.key] = item.width;
    });
  }

  /**
   * 设置数据格式
   * @param value
   * @param index
   */
  setNumberFormat(value: any, index: number) {
    if (index >= this.metric.length && value) {
      const metric = this.metric[index % this.metric.length];
      if (metric.options.numberFormat instanceof Object) {
        value = convertNumber(value, metric.options.numberFormat);
      }
    }
    return value;
  }
  /**
   * 获取一行的行维度的筛选条件
   */
  getRowsFilters(options: any): Array<H3.Report.FilterFieldColumn> {
    const filters: Array<H3.Report.FilterFieldColumn> = [];
    this.columns.forEach((field: H3.Report.FieldColumn, index: number) => {
      if (options.data.index >= (this.isNo ? index + 1 : index)) {
        filters.push({
          formula: StringType.Equal,
          field,
          text: [options.data.row[this.isNo ? index + 1 : index]]
        });
      }
    });
    return filters;
  }
  /**
   * 获取一列的行维度筛选条件
   */
  getColumnFilters(cellIndex: number): Array<H3.Report.FilterFieldColumn> {
    const filters: Array<H3.Report.FilterFieldColumn> = [];
    let len = 0;
    let rowCell: any;
    this.tableRows.forEach((row: Array<any>, index: number) => {
      len = this.columns.length || 1;
      rowCell = row.find((cell: any) => {
        if (cell instanceof Object) {
          len += cell.colspan;
        } else {
          len += 1;
        }
        return cellIndex < len;
      });
      if (rowCell && index < this.rows.length) {
        filters.push({
          formula: StringType.Equal,
          field: this.rows[index],
          text: rowCell instanceof Object ? [rowCell.label] : [rowCell]
        });
      }
    });
    return filters;
  }

  /**
   *  针对头部尾部的点击筛选
   * @param cellIndex
   * @param rowIndex
   * @param type
   */
  getColumnOtherFilters(
    cellIndex: number,
    rowIndex: number,
    type: string
  ): Array<H3.Report.FilterFieldColumn> {
    const cell = (this.tableRows[rowIndex] as Array<any>)
      .slice(0, cellIndex)
      .reduce((accumulator, currentValue) => {
        const num = currentValue instanceof Object ? currentValue.colspan : 1;
        return num + accumulator;
      }, 0);
    if (type === "header") {
      return this.getColumnFilters(cell + this.columns.length - 1).slice(0, rowIndex + 1);
    } else {
      return this.getColumnFilters(cell + this.columns.length - 1);
    }
  }

  /**
   *  单元格点击事件
   * @param options
   */
  @Provide()
  cellClick(options: any) {
    const cellIndex = options.data.index;
    const realIndex = this.isNo ? cellIndex - 1 : cellIndex;
    if (this.isNo && cellIndex === 0) return;
    if (options.data.data === "汇总" && options.type === "header") return;
    const filters: Array<H3.Report.FilterFieldColumn> = [];
    switch (options.type) {
      case "header":
        filters.push(...this.getColumnOtherFilters(cellIndex, options.data.rowIndex, options.type));
        break;
      case "footer":
        if (this.rows.length && cellIndex <= this.summary.length - this.metric.length) {
          filters.push(
            ...this.getColumnOtherFilters(cellIndex, options.data.rowIndex, options.type)
          );
        }
        break;
      default:
        if (!this.columns.length) {
          if (realIndex <= this.summary.length - this.metric.length) {
            filters.push(...this.getColumnFilters(realIndex));
          }
        } else if (!this.rows.length) {
          filters.push(...this.getRowsFilters(options));
        }
        // 点击行维度
        else if (realIndex < this.columns.length) {
          filters.push(...this.getRowsFilters(options));
        }
        // 点击汇总单元
        else if (realIndex >= options.data.row.length - this.metric.length) {
          filters.push(...this.getRowsFilters(options));
        } else {
          filters.push(...this.getRowsFilters(options));
          filters.push(...this.getColumnFilters(realIndex));
        }
        break;
    }
    this.$emit("click", { filters });
  }

  mounted() {
    if (this.refresh) {
      this.loaded = true;
      this.initTableData();
    } else {
      this.loaded = false;
    }
  }
}
</script>
<style lang="less">
@import "table";
</style>
