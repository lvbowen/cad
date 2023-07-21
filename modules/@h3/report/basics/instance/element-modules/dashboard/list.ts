import BaseChartModules from './base';
import Modules from '../../modules';
import options from '@h3/report/dist/options';
/**
 * 明细表
 */
export default class ListModules extends BaseChartModules {
  constructor(chart: H3.Report.Chart, modules ? : H3.Report.Global) {
    super(chart, modules);
    // 设置行
    if(this.data.dimension) {
      this.data.dimension.title = '列';
      this.data.dimension.max = 20;
      this.data.dimension.supportedTypes = ['string', 'date', 'number'];
      this.data.dimension.batch = true;
    }
    // 隐藏指标
    if(this.data.metric) {
      this.data.metric.display = false;
    }
    // 隐藏数据条数限制
    if(this.data.limit){
      delete this.data.limit;
      delete chart.data.limit;
    }
    // 是否需要导出
    if(options.download.list) {
      this.styles.download = new Modules.Download();
    }
    
    this.styles.orderNumber = new Modules.OrderNumber();
    this.styles.orderNumber.displayOrderName = true;
    // 从透视图切换成明细表时 带上序号
    if (chart.styles.orderNumber && chart.styles.orderNumber.checked && !chart.styles.orderNumber.orderName) {
      chart.styles.orderNumber.orderName = chart.styles.orderNumber.orderName ? chart.styles.orderNumber.orderName :'序号';
    }

    this.styles.freezeHead = new Modules.FreezeHead();
    this.styles.freezeHead.displayColumnNumber = true;
    this.styles.freezeHead.columnNumber = 0;
    // 从透视图切换成明细表时 带上固定列
    if (chart.styles.freezeHead && chart.styles.freezeHead.column) {
      chart.styles.freezeHead.columnNumber = chart.styles.freezeHead.columnNumber ? chart.styles.freezeHead.columnNumber : 0;
    }
    // 明细表没有图表配色
    delete this.styles.theme;

    if(modules) {
      if(modules.data) {
        if(modules.data.dimension) {
          chart.data.dimension = [...modules.data.dimension];
        }
        if(modules.data.groupDimension && modules.data.groupDimension.length > 0) {
          chart.data.dimension.push(...modules.data.groupDimension);
          chart.data.groupDimension = []
        }
        if(modules.data.metric && modules.data.metric.length > 0) {
          chart.data.dimension.push(...modules.data.metric.map((metric) => { delete metric.options.aggregateType; return metric;}));
          chart.data.metric = []
        }
        // 零时处理 日期字段 统一为年月日
        chart.data.dimension.forEach( d => {
          if (d.type === 'date') {
            d.options.format = 'YMDHMS';
          }
          if (d.type !== 'number' && d.options.numberFormat) {
            // 使用于切换图表时 产生的数字格式设置
            delete d.options.numberFormat;
          }
        })
      }
    }
    this.handleModules(chart, modules);
  }
}
