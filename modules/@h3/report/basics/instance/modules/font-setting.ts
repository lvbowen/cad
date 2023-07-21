import Module from './module';
import { recursion, compare } from '../../utils/object-key-compare';

const defaultFontSetting: H3.Report.FontSetting = {
  titleColor: null,
  fontColor: null
};

/**
 * 数据显示设置模块
 */
export default class ReportFontSettingModule extends Module implements H3.ReportModules.FontSetting {
  title: string = '字体设置';
  display: boolean = true;
  handleChartData(chart: H3.Report.Chart): void {
    const chartStyles: H3.Report.ChartStyleGroup = chart.styles;
    if (!chartStyles.fontSetting) {
      chartStyles.fontSetting = Object.assign({}, defaultFontSetting);
    } else {
      // 对比 - 对象中的key并赋值初始值
      recursion(defaultFontSetting, compare, [], defaultFontSetting, chartStyles.fontSetting);
    }
  }
}
