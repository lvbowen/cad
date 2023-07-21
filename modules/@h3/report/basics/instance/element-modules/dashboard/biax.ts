import BaseChartModules from "./base";
import Modules from "../../modules";
import { handleDimensionsAndMetricGroup } from "./utils";
/**
 * 双轴图
 */
export default class BiaxModules extends BaseChartModules {
  constructor(chart: H3.Report.Chart, modules?: H3.Report.Global) {
    super(chart, modules);
    // 设置维度
    if (this.data.dimension) {
      this.data.dimension.title = "维度";
      this.data.dimension.max = 2;
      // this.data.dimension.supportedTypes = ['string', 'date', 'number'];
    }
    // 隐藏指标
    if (this.data.metric) {
      this.data.metric.display = false;
    }
    // 隐藏数据条数限制
    if (this.data.limit) {
      delete this.data.limit;
      delete chart.data.limit;
    }
    // 开启缩略轴
    this.styles.dataZoom = new Modules.DataZoom();

    // 开启图标联动
    this.styles.linkage = new Modules.Linkage();
    // 开启坐标X轴设置
    this.styles.axisX = new Modules.AxisX();
    // 开启图例设置
    this.styles.legend = new Modules.Legend();

    // 开启双轴设置
    this.styles.multiMetricType = new Modules.MultiMetricType();

    // 开启双轴极限值配置
    this.styles.multiRange = new Modules.MultiRange();

    // 开启多维度
    this.data.metricGroup = new Modules.MetricGroup();

    handleDimensionsAndMetricGroup(this, chart);
    this.handleModules(chart, modules);
  }
}
