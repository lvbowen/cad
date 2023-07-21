
/**
 * 处理折线图表数据
 * @param options
 */
function handleMapData(options: H3.Chart.ChartOptions): H3.Chart.ChartData {
  const data = options.data;
  const dimensionLength: number = 0;
  const dimensionArray: any = [];
  const maxDimension: any = 20;
  const groupArray: any = [];
  const groupLength = 0;
  let maxMetric = 0;
  let minMetric = 0;
  
  const mapName = options.mapSource && options.mapSource.name ? options.mapSource.name : "";
  
  if (data && data.length) {
    maxMetric = data[0].value;
    minMetric = data[data.length - 1].value;
  }
  

  return {
    dimensionLength,
    dimensionArray,
    maxDimension,
    groupArray,
    groupLength,
    mapName,
    maxMetric,
    minMetric,
    data,
  };
}

export default handleMapData;
