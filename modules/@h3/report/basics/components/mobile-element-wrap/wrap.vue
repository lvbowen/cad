<template>
  <component
    :is="getElementType"
    :corpId="corpId"
    :chart="chart"
    :status="status"
    :refresh="refresh"
    :global="global"
    :api="api"
    @click-chart="clickChart"
    @register-refresh="registerRefresh"
    @update-charts-data="updateChartsData"
  />
</template>

<script lang="ts">
// 移除了antd的所有引用
import { Component, Prop, Vue } from "vue-property-decorator";
import ChartWrap from "../chart-wrap";
import LongText from "../long-text/long-text.vue";

@Component({
  name: "h3-report-element-wrap",
  components: {
    ChartWrap,
    LongText
  }
})
export default class ReportElementWrap extends Vue {
  @Prop({ default: null }) corpId!: string;
  @Prop() api!: H3.ReportAPI.Instance;
  @Prop({ default: null }) chart!: H3.Report.Chart;
  @Prop({ default: null }) global!: H3.Report.Global;
  @Prop({ default: "design" }) status!: "design" | "report" | "preview";
  @Prop({ default: true }) refresh!: boolean;
  /**
   * 获取元件类型
   */
  get getElementType() {
    if (this.chart && this.chart.type === "longText") {
      return "long-text";
    } else {
      return "chart-wrap";
    }
  }
  /**
   * 图表注册刷新事件
   */
  updateChartsData(data: any) {
    this.$emit("update-charts-data", data);
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
  registerRefresh(events) {
    this.$emit("register-refresh", events);
  }
}
</script>
