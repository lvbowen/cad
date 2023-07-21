import BaseChartModules from "./base";
import Modules from "../../modules";
import { handleDimensionsAndMetric } from "./utils";
export default class BarChartModules extends BaseChartModules {
  constructor(chart: H3.Report.Chart, modules?: H3.Report.Global) {
    super(chart, modules);
    this.styles.dataZoom = new Modules.DataZoom();
    this.styles.linkage = new Modules.Linkage();
    this.styles.legend = new Modules.Legend();
    this.styles.axisX = new Modules.AxisX();
    this.styles.warningLine = new Modules.WarningLine();
    // 堆叠图暂时关闭自定义范围功能
    // this.styles.metricRange = new Modules.MetricRange();
    handleDimensionsAndMetric(this, chart);
    this.handleModules(chart, modules);
  }
}
