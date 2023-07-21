<!-- 图表内容 -->
<template>
  <div :class="prefixCls" :style="getStyles">
    <!-- 图表header -->
    <tools
      :class="`${prefixCls}__header`"
      :element="element"
      :fixed="fixed"
      :status="status"
      :global="global"
      :toolbars="toolbars"
      @tools-click="toolsClick"
    >
      <slot name="title" slot="title"/>
      <slot name="extra" slot="extra"/>
    </tools>
    <!-- 图表 -->
    <chart-wrap
      :class="`${prefixCls}__chart-wrap`"
      :chart="element"
      :status="status"
      :global="global"
      :refresh="refresh"
      @change="changeChart"
      @click-chart="clickChart"
      @register-refresh="registerRefresh"
      @update-charts-data="updateChartsData"
      @drill-down="chartDrillDown"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/dashboard/types";
import Tools from "./tools.vue";
import ChartWrap from "@h3/report/basics/components/element-wrap";
import { ElementType } from "@h3/report/basics/enum/chart-type";
import { ReportState } from "@h3/report/basics/enum/report-state";
import ChartMixins from "@h3/report/basics/mixins/chart-mixins";
import ToolsMixins from "./tools-mixins";
import { ToolsBarType } from "@h3/report/basics/enum/element-tools";

const ReportPro = namespace("report");

@Component({
  name: "h3-report-elementWrap",
  components: {
    Tools,
    ChartWrap
  }
})
export default class ElementWrap extends Mixins(ChartMixins, ToolsMixins) {
  @Prop({ default: null }) element!: H3.Report.BaseElement;
  @Prop({ default: null }) global!: H3.Report.Global;
  @Prop({ default: null }) corpId!: string;
  @Prop({ default: true }) refresh!: boolean;
  @Prop({ default: ReportState.DESIGN }) status!: ReportState;
  @Prop({ default: false }) fullScreen!: boolean;
  @Prop({ default: 0 }) elementIndex!: number;
  @ReportPro.State("charts") charts!: Array<H3.Report.BaseElement>;
  @ReportPro.State("chartsData") chartsData!: Object;
  @ReportPro.State("chartViewStatus") chartViewStatus!: { [chartUuid: string]: any };
  @ReportPro.Mutation(ReportMutation.CLEARACTIVECHART) clearActiveChart!: Function;
  @ReportPro.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  @ReportPro.Mutation(ReportMutation.SETCHARTSDATA) setChartsData!: Function;
  @ReportPro.Action(ReportAction.SETFILTERPICKER) setFilterPicker!: Function;
  @ReportPro.Action(ReportAction.REMOVEFILTERPICKER) removeFilterPicker!: Function;
  @ReportPro.Action(ReportAction.SETCHARTLINKAGE) setChartLinkage!: Function;
  @Inject({ default: () => {} }) drillDown!: Function;

  prefixCls: string = "h3-report-elementWrap";
  timer: any = null; // 定时器，延时触发change事件

  @Watch("global.styles.fontSetting.fontColor", { deep: true })
  watchGlobal(val: string, oVal: string) {
    // 监听全局字体设置刷新图表
    const chart = this.element as H3.Report.Chart;
    if (
      chart.styles &&
      chart.styles.fontSetting &&
      !chart.styles.fontSetting.fontColor &&
      val !== oVal
    ) {
      this.resizeChartView({ chart: this.element, type: "view" });
    }
  }
  /**
   * chartHeader修改
   */
  get fixed() {
    if (this.element &&(this.element.type === "longText"||this.element.type ==='picPlay'||this.element.type ==='videoPlay'||this.element.type ==='iframePlay') ) {
      return true;
    }
    return false;
  }
  /**
   * 图表是否有数据
   */

  get hasTableData() {
    if (this.element.type !== "table" && this.element.type !== "list") return false;
    let tableData = this.chartsData[this.element.uid];
    tableData =
      this.element.type === "table"
        ? tableData && (tableData.data || tableData.summary)
        : tableData;
    return tableData && tableData.length;
  }
  /**
   * 显示元素头部toolbar
   */
  get toolbars() {
    const element = this.element;
    const tools: string[] = [];
    if (!element || !element.type) return tools;
    let data: H3.Report.ChartDataGroup;
    switch (element.type) {
      case `${ElementType.LONGTEXT}`:
      case `${ElementType.PICPLAY}`:
      case `${ElementType.VIDEOPLAY}`:
      case `${ElementType.IFRAMEPLAY}`:
      case `${ElementType.FILTERPICKER}`:
        if (this.status === ReportState.DESIGN) {
          tools.push(ToolsBarType.EDIT);
        }
        break;
      case `${ElementType.FUNNEL}`:
        tools.push(ToolsBarType.REFRESH);
        break;
      case `${ElementType.TABLE}`:
        tools.push(ToolsBarType.REFRESH, ToolsBarType.SORT);
        break;
      case `${ElementType.CARD}`:
        if ((element as H3.Report.Chart).data.dimension.length) {
          tools.push(ToolsBarType.SORT);
        }
        tools.push(ToolsBarType.REFRESH);
        break;
      case `${ElementType.SCATTER}`:
        tools.push(ToolsBarType.REFRESH);
        break;
      default:
        data = (element as H3.Report.Chart).data as H3.Report.ChartDataGroup;
        if (
          [...data.dimension, ...data.metric, ...(data.groupDimension ? data.groupDimension : [])]
            .length
        ) {
          tools.push(ToolsBarType.SORT);
        }
        tools.push(ToolsBarType.REFRESH);
        break;
    }
    if (this.status === ReportState.DESIGN) {
      tools.push(ToolsBarType.REMOVE);
    } else {
      // 雷达图暂时关闭图表联动功能
      if (
        element.type !== (ElementType.CARD as any) &&
        element.type !== (ElementType.RADAR as any)
      ) {
        if (
          (element as H3.Report.Chart).styles &&
          (element as H3.Report.Chart).styles.linkage &&
          ((element as H3.Report.Chart).styles as any).linkage.length
        ) {
          tools.push(ToolsBarType.LINKAGE);
        }
      }
      if (element.type !== (ElementType.FILTERPICKER as any)) {
        tools.push(this.fullScreen ? ToolsBarType.NARROW : ToolsBarType.FULLSCREEN);
      }
      if (element.type === (ElementType.TABLE as any)) {
        if ((element as H3.Report.Chart).styles.download) {
          this.hasTableData && this.ifShowTable(element as any) && tools.push(ToolsBarType.EXPORT);
        }
      }
      if (element.type === (ElementType.LIST as any)) {
        // icons.sort = false;
        if ((element as H3.Report.Chart).styles.download) {
          this.hasTableData && tools.push(ToolsBarType.EXPORT);
        }
      }
    }
    return tools;
  }
  /**
   * 组件背景颜色设置
   */
  get getStyles() {
    const chart = this.element as H3.Report.Chart;
    const globalCoat =
      this.global && this.global.styles.elementCoat ? this.global.styles.elementCoat : null;
    let chartCoat;
    if (chart && chart.styles && chart.styles.elementCoat) {
      chartCoat = chart.styles.elementCoat ? chart.styles.elementCoat : null;
    }
    if(globalCoat?.type==="bgColor")     return {backgroundColor: chartCoat && chartCoat.value ? chartCoat.value : globalCoat && globalCoat.value};
    if(globalCoat?.type==="bgPicture") return {backgroundImage: 'url(' + globalCoat.value + ')', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat'}
  }
  /**
   * 更新图表数据
   */
  updateChartsData(data: any) {
    this.setChartsData({ key: this.element.uid, data: data });
  }
  /**
   * 下钻
   */
  chartDrillDown(data) {
    if (this.drillDown) {
      this.drillDown(data);
    }
  }
  /**
   * 图表注册刷新事件
   */
  registerRefresh({ data, view, load, refreshViewStyles }) {
    this.chartViewStatus[this.element.uid] = {
      data: data || (() => {}),
      view: view || (() => {}),
      load: load || (() => {}),
      refreshViewStyles: refreshViewStyles || (() => {})
    };
  }
  /**
   * 点击图表
   */
  clickChart(option: { filters: Array<H3.Report.FieldColumn>; params: any }) {
    // 雷达图暂时关闭图表联动功能
    if (this.element.type !== (ElementType.RADAR as any) && option.filters) {
      this.setChartLinkage({ chart: this.element, filters: option.filters, mode: "linkage" });
    }
  }
  /**
   * 处理图表改变
   */
  changeChart(element: H3.Report.FilterPicker | H3.Report.LongText | H3.Report.PicPlay| H3.Report.VideoPlay| H3.Report.IframePlay | H3.Report.Chart) {
    switch (element && element.type) {
      case `${ElementType.LONGTEXT}`:
        break;
      case `${ElementType.PICPLAY}`:
        break;
      case `${ElementType.VIDEOPLAY}`:
        break;
      case `${ElementType.IFRAMEPLAY}`:
        break;
      case `${ElementType.LIST}`:
      case `${ElementType.TABLE}`:
        this.setActiveChart(element);
        break;
      case `${ElementType.FILTERPICKER}`:
        this.setFilter(element as H3.Report.FilterPicker);
      default:
    }
  }
  /**
   * 变更筛选器时做筛选
   */
  setFilter(filter: H3.Report.FilterPicker) {
    clearTimeout(this.timer);
    // 公式 为空不为空去筛选，范围时都有值去筛选，其他的公式都是有值去筛选
    if (
      ["None", "NotNone"].includes(filter.formula) ||
      (filter.formula === "Range" && filter.text[0] && filter.text[1]) ||
      (filter.formula !== "Range" && filter.text[0])
    ) {
      this.timer = setTimeout(() => {
        this.setFilterPicker({ filterPicker: filter });
      }, 500);
    } else {
      this.removeFilterPicker(filter);
    }
  }

  /**
   * 处理头部工具栏事件
   * @param type
   * @param element
   */
  toolsClick({ type, element }) {
    if (this[type] instanceof Function) {
      this[type]();
    }
  }
  /**
   * 缩略轴变化时事件
   */
  onDatazoomChange(event) {
    let start = 0;
    let end = 100;
    const e = event.detail;
    if (e.end) {
      start = e.start.toFixed(2);
      end = e.end.toFixed(2);
    } else if (e.batch) {
      start = e.batch[0].start.toFixed(2);
      end = e.batch[0].end.toFixed(2);
    }
    let chart = this.element as H3.Report.Chart;
    if (chart && chart.styles && chart.styles.dataZoom) {
      chart.styles.dataZoom.start = start;
      chart.styles.dataZoom.end = end;
    }
  }

  mounted() {
    window.addEventListener(`DatazoomChange-${this.element.uid}`, this.onDatazoomChange);
  }

  destroyed() {
    window.removeEventListener(`DatazoomChange-${this.element.uid}`, this.onDatazoomChange);
  }
}
</script>
