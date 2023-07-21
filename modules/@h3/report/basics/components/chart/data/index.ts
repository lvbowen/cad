import singleCharts from './single';
import compositeCharts from './composite';
import chartDataOptions from './options';


/**
 * 处理所有图表数据
 * @param options
 */
function handleData(options: H3.Chart.ChartOptions): H3.Chart.ChartData | Array<H3.Chart.ChartData> {
  const date = new Date().getTime();
  options.data = JSON.parse(JSON.stringify(options.data));
  let chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData>;
  options.data = JSON.parse(JSON.stringify(options.data));
  chartDataOptions.maxDimension = options.maxDimension || 10;
  chartDataOptions.maxDimensionColumns = options.maxDimensionColumns || 50;
  // eslint-disable-next-line prefer-const
  chartData = Object.assign({},singleCharts, compositeCharts)[options.type](options);
  console.log('CHART HANDLE DATA:', new Date().getTime() - date, 'ms', chartData);
  return chartData;
}

export {
  handleData,
}

export default {
  handleData
}
