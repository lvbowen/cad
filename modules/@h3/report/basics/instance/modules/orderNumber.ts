import Module from "./module";

/**
 * 数据显示设置模块
 */
export default class ReportOrderNumberModule extends Module
  implements H3.ReportModules.OrderNumber {
  title: string = "序号显示设置";
  display: boolean = true;
  displayOrderName: boolean = false;
  checked: boolean = false;
  orderName: string = "序号";

  default: H3.Report.OrderNumber = {
    checked: false,
    orderName: "序号"
  };

  constructor(def?: H3.Analysis.OrderNumberModule) {
    super();
    if (def) {
      Object.keys(def).forEach(i => {
        this[i] = def[i];
      });
    }
  }

  handleChartData(chart: H3.Report.Chart): void {
    const chartStyles: H3.Report.ChartStyleGroup = chart.styles;
    if (chartStyles && chartStyles.orderNumber === undefined) {
      chartStyles.orderNumber = this.default;
    }
  }
}
