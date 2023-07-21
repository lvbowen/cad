import FieldMapping from "./field-mapping";

/**
 * 维度实例
 */
export default class ReportDimensionModule extends FieldMapping
  implements H3.ReportModules.Dimension {
  default: Array<H3.Report.FieldColumn> = [];

  constructor(def?: H3.Analysis.DimensionModule) {
    super("维度");
    this.supportedTypes = ["string", "date"];
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
      if (!chartData.dimension) {
        chartData.dimension = this.default;
      } else if (chartData.dimension) {
        if (chartData.dimension.length > this.max) {
          chartData.dimension = chartData.dimension.slice(0, this.max);
        }
        chartData.dimension = chartData.dimension.filter((field: H3.Report.FieldColumn) =>
          field.specialType
            ? this.supportedTypes.includes(field.specialType)
            : this.supportedTypes.includes(field.type)
        );
      }
    }
  }
}
