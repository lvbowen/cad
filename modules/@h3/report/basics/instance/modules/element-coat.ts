import Module from './module';
import { recursion, compare } from '../../utils/object-key-compare';

const defaultElementCoat: H3.Report.ElementCoat = {
  type: null,
  value: ''
};

/**
 * 数据显示设置模块
 */
export default class ReportElementCoatModule extends Module implements H3.ReportModules.ElementCoat {
  title: string = '组件背景';
  display: boolean = true;
  handleChartData(chart: H3.Report.Chart): void {
    const chartStyles: H3.Report.ChartStyleGroup = chart.styles;
    if (!chartStyles.elementCoat) {
      chartStyles.elementCoat = Object.assign({}, defaultElementCoat);
    } else {
      // 对比 - 对象中的key并赋值初始值
      recursion(defaultElementCoat, compare, [], defaultElementCoat, chartStyles.elementCoat);
    }
  }
}
