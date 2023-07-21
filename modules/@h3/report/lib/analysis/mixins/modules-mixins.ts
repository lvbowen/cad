import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";

@Component({
  name: "h3-analysis-modules-mixins"
})
export default class AnalysisModulesMixin extends Vue {
  // 模块key值
  @Prop({ default: "" }) moduleKey!: string;
  // 当前图表
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  // 模块配置
  // @Prop({ default: () => {} }) moduleOptions!:H3.Analysis.LegendModule;
  // 模块值
  // @Prop({ default: () => {} }) value!: H3.Report.MetricRange

  // 设置激活模块
  @Inject() onModulesChange!: Function;

  /**
   * 获取纬度数量
   */
  get dimensionLength() {
    return this.chart && this.chart.data.dimension ? this.chart.data.dimension.length : 0;
  }

  /**
   * 获取指标数量
   */
  get metricLength() {
    return this.chart && this.chart.data.metric ? this.chart.data.metric.length : 0;
  }

  /**
   * 获取数据字段数量
   */
  getDataLength(key) {
    return this.chart && this.chart.data[key] && this.chart.data[key].length
      ? this.chart.data[key].length
      : 0;
  }
}
