import Modules from '../../modules';
import {ElementType} from '@h3/report/basics/enum/chart-type';
import options from '@h3/report/dist/options';

export default class BaseChartModules implements H3.ReportModules.ChartModules {
  data: H3.ReportModules.ChartDataModules = {};
  styles: H3.ReportModules.ChartStylesModules = {};
  showDataList: H3.ReportModules.Modules = {};    // 数据显示的展示模型
  showStylesList: H3.ReportModules.Modules = {};  // 样式显示的展示模型
  /**
   * 构建函数
   * @param chart
   * @param modules
   */
  constructor(chart: H3.Report.Chart, modules?: H3.Report.Global) {
    // 初始化渲染data模块
    const dataModules = ['chartTitle', 'chartSwitch', 'dimension', 'metric', 'sort', 'limit', 'filter'];
    const stylesModules = ['theme', 'elementCoat', 'fontSetting'];
    this.initModules(chart, 'data', dataModules);
    this.initModules(chart, 'styles', stylesModules);
  }

  /**
   * 注册模块
   * @param chart
   * @param type
   * @param moduleKeys
   */
  initModules(chart: H3.Report.Chart, type: string, moduleKeys: string[]) {
    moduleKeys.forEach((moduleKey: string) => {
      // @ts-ignore
      this[type][moduleKey] = new Modules[moduleKey.replace(moduleKey[0], moduleKey[0].toLocaleUpperCase())]();
    });
  }

  /**
   * 处理模块初始化之后数据
   * @param chart
   * @param oModules 旧模块
   */
  handleModules(chart: H3.Report.Chart, oModules?: H3.Report.Global) {
    const dataKeys = Object.keys(this.data);
    const styleKeys = Object.keys(this.styles);
    Object.keys(chart.data).forEach((key: string) => {
      if (!dataKeys.includes(key) && key !== 'title') {
        delete chart.data[key];
      }
    });
    Object.keys(chart.styles).forEach((key: string) => {
      if (!styleKeys.includes(key)) {
        delete chart.styles[key];
      }
    });
    const modules = Object.assign({}, this.data, this.styles);
    Object.keys(modules).forEach((key: string) => {
      // 只针对明细表和透视表行列做控制
      if (
        [ElementType.LIST, ElementType.TABLE].includes(chart.type) &&
        options.charts[chart.type] &&
        options.charts[chart.type][key] &&
        modules[key].max) {
        modules[key].max = options.charts[chart.type][key];
      }
      modules[key].handleChartData(chart);
    });
    if (oModules) {
      Object.keys(oModules).forEach((moduleType: string) => {
        Object.keys(oModules[moduleType]).forEach((module: string) => {
          chart[moduleType][module] = oModules[moduleType][module];
        });
      });
    }
  }
}
