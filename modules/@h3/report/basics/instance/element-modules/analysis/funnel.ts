import BaseChartModules from "./base";

export default class FunnelChartModules extends BaseChartModules {
  constructor(
    chart: H3.Report.Chart,
    modules?: H3.Report.Global,
    defaultOptions?: H3.Analysis.ChartModules
  ) {
    super(chart, modules, defaultOptions);
    this.handleModules(chart, modules);
  }
}
