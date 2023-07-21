<template>
  <component
    :is="getElementType"
    :chart="chart"
    :status="status"
    :refresh="refresh"
    :global="global"
    :corpId="corpId"
    :api="api"
    :delay="delay"
    :filters="filters"
    @change="change"
    @click-chart="clickChart"
    @register-refresh="registerRefresh"
    @update-charts-data="updateChartsData"
    @refresh-end="refreshEnd"
    @drill-down="drillDown"
  />
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import ChartWrap from "../chart-wrap";
import FilterPicker from "../filter-picker";
import LongText from "../long-text/long-text.vue";
import {ReportState} from "@h3/report/basics/enum/report-state";
import PicPlay from "../carousel/carousel.vue";
import VideoPlay from "../video/video.vue";
import IframePlay from "../iframe/iframe.vue"
@Component({
  name: "h3-report-element-wrap",
  components: {
    ChartWrap,
    FilterPicker,
    LongText,
    PicPlay,
    VideoPlay,
    IframePlay
  }
})
export default class ReportElementWrap extends Vue {
  @Prop({default: null}) chart!: H3.Report.Chart;
  @Prop({default: null}) global!: H3.Report.Global;
  @Prop({default: 200}) delay!: number;
  @Prop() api!: H3.ReportAPI.Instance;
  @Prop() corpId!: string;
  @Prop({default: ReportState.DESIGN}) status!: ReportState;
  @Prop({default: true}) refresh!: boolean;
  @Prop({default: () => []}) filters!: Array<H3.Report.FilterFieldColumn>; // 外部传入的筛选条件

  /**
   * 获取元件类型
   */
  get getElementType() {
    switch (this.chart && this.chart.type) {
      case "longText":
        return "long-text";
      case "filterPicker":
        return "filter-picker";
      case "picPlay":
        return "pic-play";
      case "videoPlay":
        return "video-play";
      case "iframePlay":
        return "iframe-play";
      default:
        return "chart-wrap";
    }
  }

  /**
   * 图表加载完
   */
  refreshEnd() {
    this.$emit("refresh-end");
  }

  /**
   * 修改chart
   * @param chart
   */
  change(chart: H3.Report.FilterPicker | H3.Report.LongText | H3.Report.PicPlay | H3.Report.IframePlay | H3.Report.VideoPlay| H3.Report.Chart) {
    this.$emit("change", chart);
  }

  /**
   * 图表点击
   *    * @param option  { filter, params }
   */
  clickChart(option: { filters: Array<H3.Report.FieldColumn>; params: any }) {
    this.$emit("click-chart", option);
  }

  /**
   * 图表注册刷新事件
   */
  updateChartsData(data: any) {
    this.$emit("update-charts-data", data);
  }

  /**
   * 下钻
   */
  drillDown(data) {
    this.$emit("drill-down", data);
  }

  /**
   * 图表注册刷新事件
   */
  registerRefresh(events) {
    this.$emit("register-refresh", events);
  }
}
</script>
