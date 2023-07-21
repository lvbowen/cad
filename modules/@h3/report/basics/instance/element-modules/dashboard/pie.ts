import BaseChartModules from './base';
import Modules from '../../modules';
export default class PieChartModules extends BaseChartModules {
  constructor(chart: H3.Report.Chart, modules?: H3.Report.Global) {
    super(chart, modules);
    this.styles.linkage = new Modules.Linkage();
    this.styles.dimensionLimit = new Modules.DimensionLimit();
    this.styles.multipleDataLabel = new Modules.MultipleDataLabel();
    this.styles.legend = new Modules.Legend();
    if(this.data.groupDimension){
      delete this.data.groupDimension;
      delete chart.data.groupDimension;
    }
    // 隐藏limit - 数据显示设置
    if(this.data.limit){
      delete this.data.limit;
      delete chart.data.limit;
    }
    if(this.data.metric){
      this.data.metric.max = 1;
    }
    this.handleModules(chart, modules);
  }
}
