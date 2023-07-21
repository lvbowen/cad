import BaseChartModules from './base';
import Modules from '../../modules';

export default class CardModules extends BaseChartModules {
  constructor(chart: H3.Report.Chart, modules?: H3.Report.Global) {
    super(chart, modules);
    if(this.data.metric) {
      this.data.metric.max = 1;
    }
    // 明细表没有图表配色
    delete this.styles.theme;
    this.handleDimensionAndMetric(chart);
    this.handleModules(chart, modules);
  }
  /**
   * 初始化
   * @param chart
   */
  handleDimensionAndMetric(chart) {
    if (chart.data.dimension) {
      if (chart.data.dimension.length === 0) {
        (this.data.limit as any).display = false;
        chart.data.limit = null;
      } else {
        (this.data.limit as any).display = true;
      }
    }
    (this.data.dimension as any).change = (result: any) => {
      if (result.dimension.length === 0) {
        (this.data.limit as any).display = false;
        chart.data.limit = null;
      } else {
        (this.data.limit as any).display = true;
      }
    };
    (this.data.metric as any).change = (result: any) => {
      if ((chart.data.dimension.length + result.metric.length) < 2) {
        (this.data.limit as any).display = false;
        chart.data.limit = null;
      } else {
        (this.data.limit as any).display = true;
      }
    };
  }
}
