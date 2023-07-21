import FieldMapping from "./field-mapping";

/**
 * 指标实例
 */
export default class ReportMetricModule extends FieldMapping implements H3.ReportModules.Metric {
  title = "指标";
  display = true;
  max = 0;
  default: Array<H3.Report.FieldColumn> = [];
  constructor(def?: H3.Analysis.MetricModule) {
    super();
    if (def) {
      Object.keys(def).forEach(i => {
        this[i] = def[i];
      });
    }
  }
  /**
   * 处理图表数据
   * @param chart
   */
  handleChartData(chart: H3.Report.Chart): void {
    const chartData: H3.Report.ChartDataGroup = chart.data;
    if (chartData) {
      if (!chartData.metric) {
        chartData.metric = this.default;
      } else if (this.max && chartData.metric) {
        if (chartData.metric.length > this.max) {
          chartData.metric = chartData.metric.slice(0, this.max);
        }
        chartData.metric = chartData.metric.filter((field: H3.Report.FieldColumn) =>
          this.supportedTypes.includes(field.type)
        );
      }
    }
  }
}
