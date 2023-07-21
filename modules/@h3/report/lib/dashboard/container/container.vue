<template>
  <div :class="[prefixCls, 'h3-report-paint', global.styles.paintCoatTheme]">
    <!-- 仪表盘背景颜色设置 -->
    <div
      ref="globolMark"
      :class="`${prefixCls}__mark`"
      :style="getStyles"
    ></div>
    <div ref="canvas" :class="[prefixCls + '__canvas']">
      <h3-grid-layout
        ref="gridLayout"
        :layout="charts"
        :reserveHeight="getReserveHeight"
        :colNum="getLayoutOptions.colNum"
        :rowHeight="getLayoutOptions.rowHeight"
        :margin="getLayoutOptions.margin"
        :showGridLine="getLayoutOptions.showGridLine"
        :isDraggable="getLayoutOptions.draggable"
        :isResizable="getLayoutOptions.resizable"
        :verticalCompact="true"
        :useCssTransforms="true"
        :responsive="getLayoutOptions.responsive"
      >
        <h3-grid-item
          v-for="(item, i) in charts"
          :style="getItemStyles"
          :class="[prefixCls + '__item', item.class]"
          :key="item.uid"
          :id="item.dataSourceId"
          :data-id="item.uid"
          :handleActive="item.handleActive"
          :tabindex="i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :minH="item.minH"
          :minW="item.minW"
          :maxH="item.maxH"
          :maxW="item.maxW"
          dragAllowFrom=".h3-report-elementWrap__header,.h3-report-long-text-wrap"
          dragIgnoreFrom=".h3-report-long-text-edit"
          @move="changeScroll"
          @resize="changeScroll"
          @focus="focus(item)"
          @resized="chartResized(item)"
        >
          <!-- 图表内容 -->
          <element-wrap
            ref="elementWrap"
            :element="item"
            :global="global"
            :refresh="false"
            :status="status"
            :elementIndex="i"
            @change-picker="changeFilterPicker"
            @full-screen="fullScreen"
          />
        </h3-grid-item>
        <div v-if="!charts.length" :class="[`${prefixCls}__empty`]">
          <template v-if="status === getReportStateDesign">
            <img src="@h3/report/basics/assets/pro/design-bg.png"/>
            <label>拖入顶部图表类型新建仪表盘</label>
          </template>
          <template v-else>
            <img src="@h3/report/basics/assets/pro/report-bg.png"/>
            <label>暂无图表数据</label>
          </template>
        </div>
      </h3-grid-layout>
    </div>
    <!-- 筛选器弹窗 -->
    <filter-picker
      v-if="showFilterPicker"
      v-model="showFilterPicker"
      :filterPicker="activeChart"
      @filter-cancel="cancelFilterPicker"
      @filter-sure="sureFilterPicker"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch, Inject } from "vue-property-decorator";
import { Modal, Popconfirm, Tooltip } from "@h3/antd-vue";
import { namespace } from "vuex-class";
import { H3GridLayout } from "@h3/awesome-ui";
import H3Scroll from "@h3/report/basics/components/scroll";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/dashboard/types";
import { ElementType } from "@h3/report/basics/enum/chart-type";
import { closest } from "@h3/report/basics/utils/dom";
import FilterPicker from "../modules/filter-picker";
import DataSourceModal from "../models/data-source-modal";
import confirm from "@h3/report/basics/components/confirm";
import ElementWrap from "../element";
import LazyLoad from "@h3/report/basics/utils/lazy-load";
import { CreateElement } from "vue";
import { ReportState } from "@h3/report/basics/enum/report-state";
import { ResizeSensor } from "css-element-queries";
import FullScreen from "../full-screen";
const ReportPro = namespace("report");
@Component({
  name: "h3-report-container",
  components: {
    ATooltip: Tooltip,
    APopconfirm: Popconfirm,
    AModal: Modal,
    H3GridLayout,
    H3GridItem: H3GridLayout.Item,
    H3Scroll,
    FilterPicker,
    ElementWrap
  }
})
export default class ReportContainer extends Vue {
  @Prop({ default: () => ({}) }) layoutOptions: any;
  @Prop({ default: ReportState.DESIGN }) status!: ReportState;
  @ReportPro.State("charts") charts!: Array<H3.Report.Chart>;
  @ReportPro.State("global") global!: H3.Report.Global;
  @ReportPro.State("activeChart") activeChart!: H3.Report.Chart;
  @ReportPro.State("dragChart") dragChart!: H3.Report.Chart;
  @ReportPro.State("dragField") dragField!: H3.Report.FieldColumn;
  @ReportPro.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function;
  @ReportPro.Mutation(ReportMutation.CLEARACTIVECHART) clearActiveChart!: Function;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  @ReportPro.Action(ReportAction.GETDATASOURCELIST) getDataSourceList!: Function;
  @Provide() @ReportPro.Mutation(ReportMutation.SETTABLEEXPORTDATA) setTableExportData!: Function;
  @Inject({ default: () => {} }) addDataSource!: Function;

  prefixCls = "h3-report-container";
  resizeSensor: ResizeSensor | null = null;
  showFilterPicker: boolean = false;
  addFilterPicker: boolean = false;
  innerChart!: H3.Report.Chart;
  lazyLoadCharts: { [chartId: string]: any } = {}; //搜集已加载的图表
  // 数据源列表弹窗实例
  dataListConfirm: any = null;
  containerHeight = 0;
  timer: any = 0;

  get getReportStateDesign() {
    return ReportState.DESIGN;
  }

  get getReserveHeight() {
    return this.status !== ReportState.DESIGN ? 0 : 200;
  }

  get getItemStyles() {
    if (this.global.styles.paintCoatTheme === "default") {
      return { backgroundColor: this.global.styles.elementCoat.value };
    } else {
      return { backgroundColor: "transparent" };
    }
  }

  /**
   * 获取仪表盘背景色
   */
  get getStyles() {
    if (!this.global.styles.paintCoatTheme) return true;
    const paintCoat: H3.Report.PaintCoat = this.global.styles.paintCoat;
    let picOpt: any;
    if (this.global.styles.paintCoatTheme === "default") {
      if (paintCoat.type === "bgColor") {
        picOpt = { backgroundColor: paintCoat.value };
      } else if (this.global.styles.paintCoat.type === "bgPicture") {
        picOpt = { backgroundImage: "url(" + paintCoat.value + ")" };
      }
    } else {
      const bgUrl: string = require("@h3/report/basics/assets/color-setting/theme/" +
        this.global.styles.paintCoatTheme +
        "-bg.png");
      picOpt = { backgroundImage: "url(" + bgUrl + ")" };
    }
    return picOpt;
  }

  get getLayoutOptions() {
    return Object.assign(
      {
        draggable: true,
        margin: [8, 8],
        showGridLine: false,
        mask: true,
        editState: true,
        resizable: true,
        responsive: false,
        colNum: 32,
        rowHeight: 32
      },
      this.layoutOptions
    );
  }

  chartMask(chart) {
    if ((chart.type === "longText" ||chart.type==='picPlay'||chart.type==='videoPlay'||chart.type==='iframePlay')&& chart.edit) {
      return false;
    }
    return true;
  }

  mousemoveLayout(e: MouseEvent) {
    if (this.dragChart) {
      e.stopPropagation();
      e.preventDefault();
      const gridLayout = this.$refs.gridLayout as any;
      const rect = gridLayout.$el.getBoundingClientRect();
      const colWidth = (rect.width - gridLayout.margin[0]) / gridLayout.colNum;
      const colHeight = gridLayout.rowHeight + gridLayout.margin[1];
      let x = Math.round((e.pageX - rect.left - (this.dragChart.w * colWidth) / 2) / colWidth);
      let y = Math.round((e.pageY - rect.top - (this.dragChart.h * colHeight) / 2) / colHeight);
      if (x < -6 || x > 22 || y < -3) return;
      if (!this.dragChart.addStatus) {
        if (this.activeChart) this.activeChart.handleActive = false;
        this.dragChart.addStatus = true;
        this.dragChart.handleActive = true;
        this.charts.push(this.dragChart);
        this.innerChart = this.dragChart;
        this.setActiveChart();
        document.body.addEventListener("mouseup", this.addElementEnd, false);
      }
      if (x < 0) {
        x = 0;
      } else if (x > Math.round(gridLayout.colNum - this.dragChart.w)) {
        x = Math.round(gridLayout.colNum - this.dragChart.w);
      }
      if (y < 0) {
        y = 0;
      }
      this.dragChart.x = x;
      this.dragChart.y = y;
      gridLayout.compact();
    }
  }

  /**
   * 图表获取焦点
   * @param chart
   */
  @Provide()
  focus(chart: H3.Report.Chart) {
    if (
      (this.activeChart && this.activeChart.uid === chart.uid) ||
      this.status !== ReportState.DESIGN
    )
      return;
    if (this.activeChart) {
      this.charts.forEach((charts: any) => {
        charts.handleActive = false;
        if (charts.edit) charts.edit = false;
      });
    }
    chart.handleActive = true;
    this.setActiveChart(chart);
  }

  /**
   * 显示数据源弹窗
   */
  showDataSourceModal() {
    this.dataListConfirm = confirm({
      title: "数据源选择",
      store: this.$store,
      width: 386,
      wrapClassName: "h3-report-datasource-modal",
      content: (h: CreateElement) =>
        h(DataSourceModal, {
          props: {
            activeChart: this.innerChart,
            addDataSource: this.addDataSource
          }
        }),
      ok: async (e: any) => {
        return await (e.contentVNode as any).check();
      },
      cancel: (e: Event) => {
        this.cancelDataSourceModal();
      }
    });
  }

  /**
   * 取消选择数据源列表弹窗
   */
  cancelDataSourceModal() {
    const dataSourceModalIndex = this.charts.findIndex(item => {
      return item.uid === this.innerChart.uid;
    });
    this.charts.splice(dataSourceModalIndex, 1);
  }

  /**
   * 关闭数据源弹窗
   * @param value
   */
  changeFilterPicker(value: boolean) {
    this.showFilterPicker = value;
  }
  /**
   * 添加元件结束事件
   */
  addElementEnd() {
    if (
      !(
        this.innerChart.type === (ElementType.FILTERPICKER as H3.Report.ElementType) ||
        this.innerChart.type === (ElementType.LONGTEXT as H3.Report.ElementType)||
        this.innerChart.type === (ElementType.PICPLAY as H3.Report.ElementType)||
        this.innerChart.type === (ElementType.VIDEOPLAY as H3.Report.ElementType)||
        this.innerChart.type === (ElementType.IFRAMEPLAY as H3.Report.ElementType)
      )
    ) {
      this.showDataSourceModal();
    } else if (this.innerChart.type === (ElementType.FILTERPICKER as H3.Report.ElementType)) {
      this.addFilterPicker = true;
      this.setActiveChart(this.innerChart);
      this.showFilterPicker = true;
    }
    document.body.removeEventListener("mouseup", this.addElementEnd, false);
  }
  /**
   * 筛选确认
   */
  sureFilterPicker(chart: H3.Report.FilterPicker) {
    Object.assign(this.activeChart, chart);
    this.addFilterPicker = false;
  }
  // 筛选取消
  cancelFilterPicker() {
    if (this.addFilterPicker) {
      this.charts.splice(this.charts.indexOf(this.activeChart), 1);
      this.addFilterPicker = false;
    }
  }
  /**
   * 图表失去焦点
   * @param e
   */
  @Provide()
  blur(e: Event) {
    if (this.dragField || this.dragChart) return;
    if (
      this.activeChart &&
      !closest(
        e.target as HTMLElement,
        ".vue-grid-item, " +
          ".h3-report-attributes," +
          ".h3-report-tools, " +
          ".h3-report-models, " +
          ".ant-modal-centered, " +
          ".ant-modal," +
          ".sortModal, " +
          ".ant-select-dropdown," +
          ".h3-report-filter-modal," +
          ".ant-calendar-picker-container," +
          ".ant-tooltip,.h3-report-designer-header__save," +
          ".h3-report-models," +
          ".introjs-overlay," +
          ".introjs-helperLayer," +
          ".introjs-tooltipReferenceLayer"
      )
    ) {
      this.charts.forEach((chart: any) => {
        chart.handleActive = false;
        if (chart.edit) chart.edit = false;
      });
      this.setActiveChart(null);
    }
  }
  /**
   * 图表移动中
   */
  changeScroll() {
    // (this.$refs.scroll as any).setScrollBar();
  }

  /**
   * 图表改变形状之后
   * @param chart
   */
  chartResized(chart: H3.Report.Chart) {
    this.resizeChartView({ chart, type: "view" });
  }

  /**
   * 图表懒加载
   * @param entries
   */
  lazyLoadChart(entries: Array<IntersectionObserverEntry>) {
    entries.forEach((entry: IntersectionObserverEntry) => {
      const chart: string = entry.target.getAttribute("data-id") as string;
      if (this.lazyLoadCharts[chart]) {
        this.lazyLoadCharts[chart].isIntersecting = entry.isIntersecting;
      }
    });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      Object.keys(this.lazyLoadCharts).forEach((chartId: string) => {
        const lazyLoadChart = this.lazyLoadCharts[chartId];
        if (lazyLoadChart.isIntersecting && !lazyLoadChart.loaded) {
          lazyLoadChart.loaded = true;
          this.resizeChartView(lazyLoadChart.resize);
        }
      });
    }, 300);
  }
  /**
   * 注册懒加载事件
   * @param e
   */
  registerLazyLoad(e: TransitionEvent) {
    if ((e.target as HTMLDivElement).classList.contains(`${this.prefixCls}__item`)) {
      const chart = (e.target as HTMLDivElement).getAttribute("data-id") as string;
      this.lazyLoadCharts[chart] = {
        resize: { chart, type: "load" },
        isIntersecting: false,
        loaded: false
      };
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        new LazyLoad(this.$el as HTMLDivElement, {
          selector: `.${this.prefixCls}__item`,
          callback: this.lazyLoadChart
        });
      }, 100);
    }
  }
  /**
   * 全屏事件
   * @param element
   * @param elementIndex
   */
  fullScreen({ element, elementIndex, status }) {
    if (status) {
      FullScreen({
        store: this.$store,
        el: this.$el as HTMLElement,
        element,
        elementIndex,
        global: this.global,
        refresh: false,
        status: this.status as any,
        narrow: this.fullScreen
      });
    } else {
      let uid = element.uid.replace("full-", "");
      let fullChart = element;
      let chartIndex = this.charts.findIndex((chart: H3.Report.Chart, index: number) => {
        return chart.uid === uid;
      });
      fullChart.uid = uid;
      this.charts.splice(chartIndex, 1, fullChart);
    }
  }

  mounted() {
    document.body.addEventListener("mousedown", this.blur, false);
    document.body.addEventListener("mousemove", this.mousemoveLayout, false);
    //        v-h3-lazy-load="{selector: `.${prefixCls}__item`, callback: lazyLoadChart, delay: 500}"
    this.$el.addEventListener("transitionend", this.registerLazyLoad, false);
    this.containerHeight = this.$el.clientHeight;
    this.resizeSensor = new ResizeSensor(
      (this.$refs.gridLayout as Vue).$el as HTMLDivElement,
      e => {
        if (e.height !== this.containerHeight) {
          this.changeScroll();
        }
      }
    );
  }
  destroyed() {
    document.body.removeEventListener("mousedown", this.blur, false);
    document.body.removeEventListener("mousemove", this.mousemoveLayout, false);
    this.$el.removeEventListener("transitionend", this.registerLazyLoad, false);
    if (this.resizeSensor) {
      this.resizeSensor.detach();
    }
  }
}
</script>
<style lang="less">
.h3-report-container {
  display: flex;
  flex-direction: column;
  background-color: #f3f5f8;
  overflow: hidden;
  position: relative;
  z-index: 0;
  &__mark {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
    background-repeat: no-repeat;
    background-size: cover;
  }
  &__toolbar {
    flex: 0 0 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #ddd;
  }
  &__tools {
    a {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      border: 0;
      height: 36px;
      width: 36px;
      border-radius: 2px;
      margin-right: 12px;
    }
    a:hover {
      background-color: #ddd;
    }
    i {
      color: rgba(0, 0, 0, 0.54);
      font-size: 20px;
      font-weight: bold;
    }
  }
  &__canvas {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 5px;
    min-height: 100% !important;
    height: 100%;
    z-index: 2;
  }
  &__item {
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #fff;
    box-shadow: 1px 1px 5px #ddd;
    border-radius: 4px;
  }
  &__item:hover,
  &__item:active,
  &__item:focus {
    z-index: 1000;
  }

  &__item.filterPicker {
    .h3-report-container-header__title-line {
      display: none;
    }
  }
  &__empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    label {
      margin-top: 20px;
      color: #8893a7;
      margin-bottom: 0;
      font-weight: 100;
      max-width: none;
    }
  }
  &__mask {
    z-index: 99;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    opacity: 0;
  }
  &__dragging {
    outline: none !important;
    .h3-report-container__mask {
      background: rgba(213, 232, 255, 1);
      border-radius: 4px;
      border: 1px solid rgba(16, 127, 255, 1);
      z-index: 101;
      opacity: 1;
    }
    .vue-resizable-handle {
      z-index: 102;
      border-color: transparent #107fff #107fff transparent;
    }
  }
  .vue-grid-layout {
    min-height: 100%;
  }
}
</style>
