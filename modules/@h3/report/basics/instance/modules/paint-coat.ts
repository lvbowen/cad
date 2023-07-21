import Module from './module';
import { recursion, compare } from '../../utils/object-key-compare';

const defaultPaintCoat: H3.Report.PaintCoat = {
  type: 'bgColor',
  value: '#F3F5F8'
};

/**
 * 数据显示设置模块
 */
export default class ReportPaintCoatModule extends Module implements H3.ReportModules.PaintCoat {
  display: boolean = true;
  title: string = '';
  handleChartData(chart: H3.Report.Chart): void {
    //@ts-ignore
    const chartStyles: H3.Report.GlobalCoatGroup = chart.styles;
    if (!chartStyles.paintCoat) {
      chartStyles.paintCoat = Object.assign({}, defaultPaintCoat);
    } else {
      // 对比 - 对象中的key并赋值初始值
      recursion(defaultPaintCoat, compare, [], defaultPaintCoat, chartStyles.paintCoat);
    }
  }
}
