import BaseChartModules from "./base";
import Modules from "../../modules";
import { handleDimensionsAndMetric } from "./utils";
export default class StripeChartModules extends BaseChartModules {
  constructor(chart: H3.Report.Chart, modules?: H3.Report.Global) {
    super(chart, modules);

    this.styles.dataZoom = new Modules.DataZoom();
    this.styles.linkage = new Modules.Linkage();
    this.styles.direction = new Modules.Direction();
    this.styles.metricRange = new Modules.MetricRange();
    this.styles.legend = new Modules.Legend();
    this.styles.axisX = new Modules.AxisX();
    this.styles.warningLine = new Modules.WarningLine();
    handleDimensionsAndMetric(this, chart);
    this.handleModules(chart, modules);
    chart.styles.direction = "right";
  }
}
