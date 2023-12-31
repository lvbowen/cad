import Module from "./module";

/**
 * 组件标题实例
 */
export default class ReportChartTitle extends Module implements H3.ReportModules.ChartTitle {
  title = '图表标题';
  display: boolean = true;
  /**
   * 处理图表数据
   * @param chart
   */
  handleChartData(chart: H3.Report.Chart): void {
    if(!chart.title && chart.title !== ''){
      chart.title = '未命名图表';
    }
  }
}
