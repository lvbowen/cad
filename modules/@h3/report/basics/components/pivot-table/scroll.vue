<template>
  <h3-scroll
    ref="scroll"
    :class="`${this.prefixCls}__body-warp`"
    :style="`height: ${height}px`"
    :buttonColor="'rgba(0,0,0,0.45)'"
    :scrollYBtn="this.fix ? true : true"
    :scrollXBtn="this.fix ? false : true"
    @scroll="scroll"
  >
    <div
      :class="`${prefixCls}__mask`"
      :style="
        `height: ${bodyRows.length * staticCellHeight +
          (!fixedColHead ? (rows.length + 1) * staticCellHeight : 0)}px`
      "
    ></div>
    <table-warp
      ref="tableBody"
      :alias="alias"
      :rowNum="rowNum"
      :tableColumnsWidths="tableColumnsWidths"
      :rowIndex="rowIndex"
      :columnsLen="columnsLen"
      :innerData="innerData"
      :data="data"
      :index="index"
      :columns="columns"
      :summary="summary"
      :metric="metric"
      :fixedColHead="fixedColHead"
      :showOrderNo="showOrderNo"
      :tableRows="tableRows"
      :rows="rows"
      :allowDrag="allowDrag"
      @start-drag="startDrag"
      @change-columns="columnAdaptSize($event)"
    ></table-warp>
    <slot></slot>
  </h3-scroll>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import H3Scroll from "../../components/scroll";
import TableWarp from "./body.vue";
import { handleBodyRows } from "./utils";
@Component({
  name: "h3-pivot-table-scroll",
  components: {
    TableWarp,
    H3Scroll
  }
})
export default class ReportPivotTableScroll extends Vue implements H3.PivotTable.TableScroll {
  @Prop({ default: () => "h3-table" }) prefixCls!: string;
  @Prop({ default: () => {} }) alias!: any;
  @Prop({ default: () => [] }) tableColumnsWidths!: Array<number>;
  @Prop({ default: () => [] }) tableColumns!: Array<any>;
  @Prop({ default: () => [] }) bodyRows!: Array<any>;
  @Prop({ default: () => [] }) summary!: Array<any>;
  @Prop({ default: () => 0 }) height!: number;
  @Prop({ default: () => [] }) columns!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => [] }) metric!: Array<H3.Report.FieldColumn>;
  @Prop({ default: "" }) fix!: string;
  @Prop({ default: 0 }) scrollTop!: number;
  @Prop({ default: () => false }) fixedColHead!: boolean;
  @Prop({ default: () => false }) showOrderNo!: boolean;
  @Prop({ default: () => [] }) tableRows!: Array<Array<string>>;
  @Prop({ default: () => [] }) rows!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => false }) fullScreen!: boolean;
  @Prop({ default: () => true }) allowDrag!: boolean;

  y = 0;
  index = 0;
  rowIndex = 0;
  innerData: Array<any> = [];
  data: Array<any> = [];
  rowNum = 30;
  columnsLen = 0;

  @Provide()
  staticCellHeight: number = 37;

  @Watch("bodyRows", { immediate: true })
  watchData() {
    this.setInnerData(0, 2);
  }
  @Watch("scrollTop", { immediate: true })
  watchScrollTop(top) {
    this.$refs.scroll && (this.$refs.scroll as any).setScroll(0, top);
  }
  @Watch("fullScreen", { immediate: true })
  watchFullScreen() {
    this.toogleScreen();
  }
  /**
   * 拖拽列宽
   */
  startDrag(option: { e: Event; row: any }) {
    this.$emit("start-drag", option);
  }

  setInnerData(pre: number, next: number) {
    let columns = this.tableColumns.slice(pre * this.rowNum, next * this.rowNum);
    const bodyRows = this.bodyRows.slice(pre * this.rowNum, next * this.rowNum);
    this.data = columns.map((col: any, index) => col.concat(bodyRows[index]));
    let rows: any = [];
    if (columns.length) {
      this.columnsLen = columns[0].length;
      if (this.columnsLen > 0) {
        // 让所有行表头变为对象
        let tmpCols: any = [];
        const tmpColIndex = {};
        columns.forEach((cols: Array<any>) => {
          tmpCols = null;
          cols.forEach((col: any, index: number) => {
            col = " " + col; // 暂时解决数字key乱序的问题
            if (!tmpCols) {
              if (!tmpColIndex[col]) {
                tmpColIndex[col] = index < cols.length - 2 ? {} : [];
              }
              tmpCols = tmpColIndex[col];
            } else if (tmpCols) {
              if (tmpCols instanceof Array) {
                tmpCols.push(col);
              } else {
                if (!tmpCols[col]) {
                  tmpCols[col] = index < cols.length - 2 ? {} : [];
                }
                tmpCols = tmpCols[col];
              }
            }
          });
        });
        columns = [];
        handleBodyRows(tmpColIndex, columns);
      }
      columns.forEach((cols: Array<any>, colIndex: number) => {
        rows.push(cols.concat(bodyRows[colIndex]));
      });
    } else {
      rows = bodyRows;
    }
    this.innerData = rows;
  }
  setSplice(y) {
    const index = Math.floor((y + this.$el.clientHeight) / this.staticCellHeight / this.rowNum);
    if (index !== this.index) {
      this.index = index;
      const pre = index - 1 > 0 ? index - 1 : 0;
      const next = pre + 2;
      this.rowIndex = pre * this.rowNum;
      this.setInnerData(pre, next);
    }
  }
  scroll(e: any) {
    this.setSplice(e.y);
    this.$emit("bodyScroll", {
      left: e.x,
      top: e.y
    });
  }
  /**
   * 双击格子自适应
   */
  columnAdaptSize(e) {
    this.$emit("change-columns", e);
  }

  toogleScreen() {
    this.$refs.scroll && (this.$refs.scroll as any).setScrollBar();
  }
}
</script>
<style lang="less"></style>
