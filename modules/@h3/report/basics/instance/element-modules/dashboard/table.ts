import BaseChartModules from './base';
import Modules from '../../modules';
import options from "@h3/report/dist/options";

export default class TableModules extends BaseChartModules {
  constructor(chart: H3.Report.Chart, modules ?: H3.Report.Global) {
    super(chart, modules);
    const dataSort: any = {
      dimension: null,
      groupDimension: null,
      metric: null,
      sort: null
    };
    let dimensionArr:any = [];
    let groupDimensionArr:any[] = [];

    this.data = Object.assign(dataSort, this.data, {groupDimension: new Modules.GroupDimension()});

    // 是否需要导出
    if(options.download.pivotTable) {
      this.styles.download = new Modules.Download();
    }
    this.styles.orderNumber = new Modules.OrderNumber();
    this.styles.freezeHead = new Modules.FreezeHead();
    this.styles.linkage = new Modules.Linkage();
    this.styles.freezeHead.displayRow = true;
    this.styles.freezeHead.displayColumn = true;
    // 透视图没有图表配色
    delete this.styles.theme;
    
    if (this.data.dimension) {
      this.data.dimension.supportedTypes = ['string', 'date'];
      this.data.dimension.max = 20;
      this.data.dimension.title = '行维度';
    }
    if (chart.data.dimension) {
      dimensionArr = chart.data.dimension.filter((item)=> item.type);
      const removeIndex: Array<number> = [];
      const numberFields = chart.data.dimension.filter((field: H3.Report.FieldColumn, index:
        number) => {
        if (field.type === 'number') {
          removeIndex.push(index);
          return true;
        }
        return false;
      });
      if (chart.data.metric) {
        chart.data.metric.push(...numberFields);
      }
      chart.data.dimension = chart.data.dimension.filter((field: H3.Report.FieldColumn, index:
        number) => !removeIndex.includes(index));
    }
    if (this.data.groupDimension) {
      this.data.groupDimension.supportedTypes = ['string', 'date'];
      this.data.groupDimension.max = 20;
      this.data.groupDimension.title = '列维度';
    }
    if (chart.data.groupDimension) {
      groupDimensionArr = chart.data.groupDimension.filter((item)=> item.type);
    }
    // 透视图隐藏数据显示设置功能
    if (this.data.limit) {
      this.data.limit.display = false;
      chart.data.limit = null;
    }
    if (this.data.metric) {
      this.data.metric.max = 20;
    }
    // 隐藏dimensionLimit - 维度数据设置
    if (this.styles.dimensionLimit) {
      this.styles.dimensionLimit.display = false;
      chart.styles.dimensionLimit = null;
    }
    if(this.data.dimension && this.data.metric && this.data.groupDimension) {
      this.data.groupDimension.change = (data: any) => this.initDimensionsAndMetric(this ,chart, data);
      this.data.dimension.change = (data: any) => this.initDimensionsAndMetric(this,chart, data);
      this.data.metric.change = (data: any) => this.initDimensionsAndMetric(this,chart, data);
    }
    if(this.data.sort) {
      this.data.sort.moduleTypes = ['dimension', 'groupDimension'];
    }

    this.handleModules(chart, modules);
  }

  /**
   * 处理基本两维一指标 or 一维多指标
   * @param modules
   * @param chart
   * @param data
   */
  initDimensionsAndMetric(modules: TableModules, chart: H3.Report.Chart, data: any) {
    if(chart.data.dimension && chart.data.groupDimension) {
      // 透视图隐藏数据显示设置功能
      if (modules.data.limit) {
        modules.data.limit.display = false;
      }
    }
    return modules;
  }
}


