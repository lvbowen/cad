/**
 * 处理图表请求后台参数
 * @param chart
 * @param params
 */
function handleChartRequestParams(
  chart: H3.Report.Chart,
  params?: { [key: string]: string },
  globalFilters?: Array<H3.Report.FilterFieldColumn>
): H3.ReportAPI.Chart {
  const oChart: H3.Report.Chart = JSON.parse(JSON.stringify(chart));
  if (oChart.type === "list") {
    oChart.pageSize = oChart.pageSize ? oChart.pageSize : 10;
    oChart.pageIndex = oChart.pageIndex ? oChart.pageIndex : 0;
  }
  const sendChart: H3.ReportAPI.Chart = {
    title: oChart.title,
    authorization: oChart.authorization,
    dataSourceId: oChart.dataSourceId,
    useType: oChart.useType,
    type: oChart.type as any,
    dimension: oChart.data.dimension,
    groupDimension: oChart.data.groupDimension,
    metric: oChart.data.metric,
    filter: oChart.data.filter,
    sort: oChart.data.sort,
    limit: oChart.data.limit,
    pageSize: oChart.pageSize,
    pageIndex: oChart.pageIndex
  };
  if (oChart.type === "map") {
    if (oChart.data && oChart.data.mapArea) {
      sendChart.mapArea = oChart.data.mapArea;
    }
  }
  if (params) {
    Object.assign(sendChart, params);
  }
  if (oChart.data.metricGroup && oChart.data.metricGroup.length) {
    // todo: 可能不兼容 IE11 和 edge
    let realMetric: Array<H3.Report.FieldColumn> = [];
    oChart.data.metricGroup.forEach(m => {
      realMetric = [...realMetric, ...m];
    });
    sendChart.metric = realMetric;
  }
  if (globalFilters) {
    console.log("globalFilters", globalFilters);
    sendChart.filter = [...(sendChart.filter || []), ...globalFilters];
  }
  if (sendChart.filter) {
    sendChart.filter = sendChart.filter.concat(
      chart.linkageFilter || [],
      ...Object.values(chart.filterPicker || {})
    );
    sendChart.filter.forEach((filter: H3.Report.FilterFieldColumn) => {
      filter.text = filter.text.map((item: any) => (item instanceof Object ? item.value : item));
    });
  }
  return sendChart;
}

export { handleChartRequestParams };

export default {
  handleChartRequestParams
};
