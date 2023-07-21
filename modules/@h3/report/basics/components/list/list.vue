<!--明细表-->
<template>
  <div
    ref="list"
    :class="prefixCls"
    :style="`color: ${fontColor}`"
  >
    <div :class="`${prefixCls}__loading`" v-if="false">
      <Loading/>
    </div>
    <div :class="`${prefixCls}__content`" :style="{ color: `${fontColor} !important` }">
      <div
        :class="`${prefixCls}__static`"
        :style="staticStyle"
        v-if="freezeHead.column && freezeHead.columnNumber && isPc"
      >
        <H3Head
          :column="formatColumns"
          :sortColumn="sortColumn"
          :allowDrag="allowDragColumn"
          :style="`color: ${fontColor}`"
          @start-drag="startDrag($event)"
          @change-columns="columnAdaptSize($event)"
        ></H3Head>
        <template v-if="!refresh">
          <H3Body
            :sortColumn="sortColumn"
            :alias="alias"
            :datasource="innerDatasource"
            :pageParams="pageParams"
            :style="staticBodyStyle"
            @drill-down="drillDown"
          ></H3Body>
        </template>
      </div>
      <div :class="`${prefixCls}__pane`" ref="listPane">
        <H3Head
          ref="listHead"
          :column="formatColumns"
          :sortColumn="sortColumn"
          :style="staticHeadStyle"
          :allowDrag="allowDragColumn"
          @change-columns="columnAdaptSize($event)"
          @start-drag="startDrag($event)"
        ></H3Head>
        <Loading v-if="refresh"/>
        <template v-else>
          <H3Scroll
            ref="scroll"
            :class="`${prefixCls}__body-warp`"
            :style="scrollStyle"
            :buttonColor="'rgba(0,0,0,0.45)'"
            @scroll="scroll"
          >
            <H3Body
              :sortColumn="sortColumn"
              :alias="alias"
              :datasource="innerDatasource"
              :pageParams="pageParams"
              :style="`color: ${fontColor}`"
              @drill-down="drillDown"
            ></H3Body>
          </H3Scroll>
        </template>
      </div>
      <div
        v-if="allowDrag"
        class="column-resize-line"
        ref="resize-line"
      ></div>
    </div>
    <div :class="`${prefixCls}__tool`">
      <h3-pagination
        :showTotal="total => `共 ${total} 条`"
        :total="total"
        @change="changePage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Pagination from "./components/pagination.vue";
import ReportListHead from "./components/head.vue";
import ReportListBody from "./components/body.vue";
import H3Scroll from "../scroll/scroll.vue";
import Loading from "../loading";
import { isMobile } from "../../utils/browser";
import { convertNumber } from "../../utils/number";
import { convertDate } from "../../utils/date";
import getAliaValue from "../../utils/alias";
import { getStrLen } from "@h3/report/basics/utils/string";

const prefix = "h3-report";
const orderKey = "h3-report-list-order";
const minWidth = 80;
@Component({
  name: "h3-report-list",
  components: {
    H3Head: ReportListHead,
    H3Body: ReportListBody,
    H3Pagination: Pagination,
    H3Scroll,
    Loading
  }
})
export default class ReportList extends Vue {
  // 数据
  @Prop({ default: () => [] }) datasource!: Array<any>;
  // 别名系统
  @Prop({ default: () => {} }) alias!: any;
  // 表头
  @Prop({ default: () => [] }) columns!: Array<H3.Report.FieldColumn>;
  // 表格列宽等配置项
  @Prop({ default: () => [] }) columnsSetting!: Array<H3.List.columnSetting>;
  // 固定前几列
  @Prop({ default: 0 }) staticColumn!: number;
  // 是否显示序号
  @Prop({ default: () => {} }) orderNumber!: H3.Report.OrderNumber;
  // 是否刷新
  @Prop({ default: false }) refresh!: boolean;
  // 数据总条数
  @Prop({ default: 0 }) total!: number;
  // 冻结列配置信息
  @Prop({ default: () => {} }) freezeHead!: H3.Report.FreezeHead;
  // 字体颜色
  @Prop({ default: () => "" }) fontColor!: string;
  // 是否允许拖拽
  @Prop({ default: true }) allowDrag!: string;

  @Watch("freezeHead", { deep: true })
  onFreezeHeadChange(val) {
    if (val.column && val.columnNumber) {
      let staticNum = val.columnNumber;
      let targetColumns = this.visibleColumns.slice(0, staticNum);
      this.staticSortColumn = this.calculateHead(targetColumns, true);
    }
  }

  @Watch("datasource", { deep: true })
  ondataChange(val) {
    this.innerDatasource = JSON.parse(JSON.stringify(val));
    this.initList();
  }

  prefixCls: string = `${prefix}-list`;

  pageParams: H3.List.pageOptions = {
    pageSize: 10, // 页数大小
    pageIndex: 1 // 第几页
  };
  // 排序渲染的列信息
  sortColumn: Array<H3.List.SortHeadOptions> = [];
  // 排序渲染的列信息 冻结部分
  staticSortColumn: Array<H3.List.SortHeadOptions> = this.sortColumn;

  // 表格滚动区域高度
  height: number = 100;

  // 固定的头部的滚动距离 和表体的滚动距离
  headScrollLeft: number = 0;
  headScrollTop: number = 0;

  // 平均宽度
  averageWidth: number = 1;

  // 客户端判断
  isPc: boolean = true;

  // 内部数据源 处理数值格式和日期格式
  innerDatasource: Array<any> = JSON.parse(JSON.stringify(this.datasource));
  // 拖拽列宽的线
  dragLine: any;
  // 初始化拖拽时需要用的属性
  dragOptions: any = null;
  // 内部数据，表格属性
  innerColumnsSetting: Array<H3.List.columnSetting> = this.columnsSetting;
  // 映射字段列宽
  mapColumnsWidth: { [key: string]: number } = {};
  wrapWidth!: number;

  get allowDragColumn() {
    return this.isPc && this.allowDrag;
  }
  /**
   * 固定的头部的滚动距离样式
   */
  get staticHeadStyle() {
    return {
      transform: `translateX(-${this.headScrollLeft}px)`,
      color: `${this.fontColor}`
    };
  }

  /**
   * 固定的表格标题部分
   */
  get staticBodyStyle() {
    return {
      transform: `translateY(-${this.headScrollTop}px)`,
      color: `${this.fontColor}`
    };
  }

  /**
   * 分层格式化表头渲染信息 目前业务最多只有两层表头 todo: 多层表头循环
   */
  get formatColumns() {
    return this.calcuateColumns();
  }

  /**
   * 分层格式化表头渲染信息 目前业务最多只有两层表头 todo: 多层表头循环
   */
  get staticFormatColumns() {
    let targetColumns = this.visibleColumns;
    if (this.freezeHead.column && this.freezeHead.columnNumber) {
      let staticNum = this.freezeHead.columnNumber;
      targetColumns = this.visibleColumns.slice(0, staticNum);
    }
    return this.calcuateColumns(targetColumns);
  }

  /**
   * 滑动面板的样式
   */
  get scrollStyle() {
    return {
      height: `${this.height}px`
    };
  }

  /**
   * 筛选可显示的字段
   */
  get visibleColumns() {
    return this.columns.filter(i => !i.options.hidden);
  }

  /**
   * 计算固定列的宽度
   */
  get staticStyle() {
    let width = 0;
    if (this.staticSortColumn && this.staticSortColumn.length > 0) {
      width = this.staticSortColumn.reduce((total, current) => {
        return total + current.width;
      }, 0);
    }
    return {
      overflow: "hidden",
      width: `${width}px`
    };
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
  startDrag(option: { e: Event; row: H3.List.TitleOptions }) {
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
      this.initList();
    }
    this.dragOptions = null;
    document.body.removeEventListener("mouseup", this.dragMouseup, false);
    document.body.removeEventListener("mousemove", this.dragMousemove, false);
  }

  /**
   *  计算列表配置信息
   */
  countColumns(targetColumns: Array<any>) {
    let calculateCols = targetColumns.map(col => {
      let width = this.virtualDom({ uid: col.uid, name: col.alias ? col.alias : col.name });
      return {
        key: col.uid,
        width: width,
        needAlias: col.needAlias,
        options: col.options,
        type: col.type
      };
    });
    if (this.orderNumber.checked) {
      let orderWidth = this.virtualDom({ uid: orderKey, name: "序号" }, true);
      calculateCols.unshift({
        key: orderKey,
        width: orderWidth,
        needAlias: false,
        options: {},
        type: "string"
      });
    }
    return calculateCols;
  }
  /**
   * 格式化表头配置信息
   * @param  targetColumns  列
   * @param  isAdapt  是否自适应
   */
  calculateHead(
    targetColumns: Array<any> = this.visibleColumns,
    isAdapt: boolean = false
  ): Array<H3.List.SortHeadOptions> {
    let calculateCols = this.countColumns(targetColumns);
    // 生成冻结列时，不计算
    if (!isAdapt) {
      let realWidth = 0;
      if (calculateCols && calculateCols.length > 0) {
        realWidth = calculateCols.reduce((total, current) => {
          return total + current.width;
        }, 0);
      }
      let lastCol = calculateCols[calculateCols.length - 1];
      // 宽度不够时，最后一个补齐
      if (realWidth < this.wrapWidth && calculateCols.length > 1) {
        calculateCols[calculateCols.length - 1].width =
          lastCol.width + (this.wrapWidth - realWidth);
      }
    }
    return calculateCols;
  }

  /**
   * 计算渲染的表头信息
   */
  calcuateColumns(targetColumns: Array<any> = this.visibleColumns) {
    let firstRow: Array<any> = [];
    let secondRow: Array<any> = [];
    let childLeafNum: number = 1;
    targetColumns.forEach((col, index) => {
      if (!col.relation) {
        firstRow.push({
          alias: col.alias,
          name: col.name,
          key: col.uid,
          allowDrag: index !== targetColumns.length - 1,
          isLeaf: !col.relation
        });
      } else {
        let childTitle = {
          alias: col.tableName,
          name: col.tableName,
          key: `${col.tableId}-${index}`,
          isLeaf: !col.relation,
          allowDrag: false,
          leafNum: 1
        };

        if (index && col.tableId === targetColumns[index - 1].tableId) {
          firstRow[firstRow.length - 1].leafNum += 1;
        } else {
          firstRow.push(childTitle);
        }

        secondRow.push({
          alias: col.alias,
          name: col.name,
          key: col.uid,
          isLeaf: col.relation,
          allowDrag: index !== targetColumns.length - 1
        });
      }
    });

    if (this.orderNumber.checked) {
      firstRow.unshift({
        alias: this.orderNumber.orderName,
        name: this.orderNumber.orderName,
        key: orderKey,
        isLeaf: true,
        allowDrag: true
      });
    }

    return [firstRow, secondRow];
  }

  /**
   * 虚拟dom计算宽度
   * @param option
   * @param isSerialNum 是否是序号列
   * @param isOriginal 是否求原始值
   */
  virtualDom(option: any, isSerialNum: boolean = false, isOriginal: boolean = false) {
    let dw = this.isPc ? 0 : 20;
    let width = minWidth + dw;
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.fontSize = "12px";
    span.style.display = "inline-block";
    document.body.appendChild(span);
    span.innerText = option.name;
    let fieldWidth = span.clientWidth + 30 + dw;
    if (isSerialNum) {
      span.innerText = this.orderNumber.orderName || "序号";
      width =
        !isOriginal && this.mapColumnsWidth[option.uid]
          ? this.mapColumnsWidth[option.uid]
          : Math.max(span.clientWidth + 24 + dw, minWidth, this.averageWidth);
    } else {
      this.innerDatasource.forEach(row => {
        if (Array.isArray(row[option.uid])) {
          // 数组取最大的那个数据做处理
          let maxSpan = "";
          let arr = row[option.uid] && row[option.uid].length > 0 ? row[option.uid] : [];
          arr.forEach(element => {
            if (element && element !== "" && getStrLen(element) > getStrLen(maxSpan)) {
              maxSpan = element;
            }
          });
          span.innerText = maxSpan;
        } else {
          span.innerText = row[option.uid];
        }
        width = this.mapColumnsWidth[option.uid]
          ? this.mapColumnsWidth[option.uid]
          : Math.max(span.clientWidth + 30 + dw, width, minWidth, this.averageWidth, fieldWidth);
      });
    }
    document.body.removeChild(span);
    return width;
  }

  /**
   * 面板滚动
   * @param e 滚动event
   */
  scroll(e: any) {
    this.headScrollLeft = e.x;
    this.headScrollTop = e.y;
    this.$emit("bodyScroll", {
      left: e.x,
      top: e.y
    });
  }

  /**
   * 初始化列表样式
   */
  initList() {
    this.innerDatasource = JSON.parse(JSON.stringify(this.datasource));
    this.dragLine = this.$refs["resize-line"] as HTMLElement;
    this.handleColumns();
    this.handleData();
    const listpane = this.$refs.listPane as HTMLElement;
    const listHead = this.$refs.listHead as Vue;
    this.wrapWidth = listpane.clientWidth;
    if (listpane && listHead) {
      let realColNum = this.orderNumber.checked
        ? this.visibleColumns.length + 1
        : this.visibleColumns.length;
      // 平均宽度
      this.averageWidth = listpane.clientWidth / realColNum || minWidth;
      this.height = listpane.clientHeight - listHead.$el.clientHeight;
    }
    this.sortColumn = this.calculateHead();

    if (this.freezeHead.column && this.freezeHead.columnNumber) {
      let staticNum = this.freezeHead.columnNumber;
      let targetColumns = this.visibleColumns.slice(0, staticNum);
      this.staticSortColumn = this.calculateHead(targetColumns, true);
    }
    if (this.$refs.scroll) {
      (this.$refs.scroll as any).setScrollBar();
    }
  }
  /**
   * 列宽自适应
   * @param option
   */
  columnAdaptSize(option: { e: Event; row: H3.List.TitleOptions }) {
    // let width: number = this.orderNumber.checked ? this.virtualDom(orderKey,true,true) : this.virtualDom(option.row.key,true,true);
    let tmpIndex = this.innerColumnsSetting.findIndex(item => item.key === option.row.key);
    if (tmpIndex > -1) {
      this.innerColumnsSetting.splice(tmpIndex, 1);
      this.$emit("change-columns", this.innerColumnsSetting);
      this.initList();
    }
  }
  /**
   * 过滤不存在的字段
   */
  handleColumns() {
    this.innerColumnsSetting = this.innerColumnsSetting.filter(item => {
      return (
        item.key === orderKey ||
        this.visibleColumns.find(field => {
          return field.uid === item.key;
        })
      );
    });
    this.mapColumnsWidth = {};
    this.innerColumnsSetting.forEach(item => {
      this.mapColumnsWidth[item.key] = item.width;
    });
  }
  /**
   * 更新分页数据
   */
  changePage(params: H3.List.pageOptions) {
    this.pageParams = params;
    this.$emit("changePage", params);
  }
  /**
   * 下钻
   */
  drillDown(data) {
    this.$emit("drill-down", data);
  }
  /**
   * 格式化数值格式
   */
  formateNumber(
    value: number | string | Array<number | string>,
    NumberFormat: H3.Report.NumberFormat
  ) {
    if (!NumberFormat || !value || value === "") return value;
    let val = value;
    if (value instanceof Array) {
      // 如果是字表如果是数组则递归
      return value.map(d => {
        return d ? this.formateNumber(d, NumberFormat) : "";
      });
    } else {
      val = convertNumber(value, NumberFormat);
    }
    return val;
  }
  /**
   * 格式化日期
   */
  formatDate(value: string | Array<string>, dateFormat: H3.Report.DateFormat) {
    if (!dateFormat || !value || value === "") return value;

    let date = value;

    if (value instanceof Array) {
      // 如果是字符串数组 那么递归返回
      return value.map(d => {
        return d ? (this.formatDate(d, dateFormat) as string) : "";
      });
    } else {
      date = convertDate(value, dateFormat);
    }
    return date;
  }

  /**
   * 处理数据
   */
  handleData() {
    let rules = this.columns
      .filter(i => {
        return (
          (i.options.numberFormat && i.type === "number") ||
          (i.options.dateFormat && i.type === "date") ||
          i.needAlias
        );
      })
      .map(m => {
        return {
          uid: m.uid,
          numberFormat:
            m.type === "number" && m.options.numberFormat ? m.options.numberFormat : null,
          dateFormat: m.type === "date" && m.options.dateFormat ? m.options.dateFormat : null,
          needAlias: m.needAlias || false
        };
      });
    rules.forEach(rule => {
      this.innerDatasource.forEach((d, index) => {
        if (rule.dateFormat) {
          this.innerDatasource[index][rule.uid] = this.formatDate(
            this.datasource[index][rule.uid],
            rule.dateFormat
          );
        }
        if (rule.numberFormat) {
          this.innerDatasource[index][rule.uid] = this.formateNumber(
            this.datasource[index][rule.uid],
            rule.numberFormat
          );
        }
        if (rule.needAlias) {
          if (this.datasource[index][rule.uid] instanceof Array) {
            this.innerDatasource[index][rule.uid] = this.datasource[index][rule.uid].map(m => {
              return getAliaValue(rule.uid, m, this.alias);
            });
          } else {
            this.innerDatasource[index][rule.uid] = getAliaValue(
              rule.uid,
              this.innerDatasource[index][rule.uid],
              this.alias
            );
          }
        }
      });
    });
  }

  created() {
    this.isPc = !isMobile;
  }

  mounted() {
    this.initList();
  }
}
</script>

<style lang="less" scoped>
@import "./styles/index.less";
</style>
