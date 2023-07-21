import Module from './module';

/**
 * 图表联动模块
 */
export default class ReportChartLinkageModule extends Module implements H3.ReportModules.Linkage{
  title: string = '图表联动';
  display: boolean = true;
  handleChartData(chart: H3.Report.Chart): void {
    const chartStyles: H3.Report.ChartStyleGroup = chart.styles;
    if (chartStyles && chartStyles.linkage === undefined) {
      chartStyles.linkage = [];
    }
  }
}
