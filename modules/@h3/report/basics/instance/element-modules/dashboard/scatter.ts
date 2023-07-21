import BaseChartModules from './base';
import Modules from '../../modules';
export default class ScatterChartModules extends BaseChartModules {
  constructor(chart: H3.Report.Chart, modules ? : H3.Report.Global) {
    super(chart, modules);
    if (this.data.dimension) {
      // 维度条数限制
      this.data.dimension.max = 2;
    }
    if (this.data.metric) {
      // 指标条数限制
      this.data.metric.max = 3;
    }
    // 图例设置
    this.styles.legend = new Modules.Legend();
    // 图表联动
    this.styles.linkage = new Modules.Linkage();
    // 自定义指标范围 - 气泡图 （气泡图展示不做自定义指标范围）
    // this.styles.multiRange = new Modules.MultiRange();
    // this.styles.multiRange.data[0].title = '坐标X轴';
    // this.styles.multiRange.data[1].title = '坐标Y轴';
    // 散点图不需要数据显示设置功能
    delete this.data.limit;
    this.handleModules(chart, modules);
  }
}
