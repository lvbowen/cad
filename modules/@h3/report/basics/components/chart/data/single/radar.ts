import { maxGroup } from "../options";

/**
 * 处理雷达图图表
 * @param options
 */
function handleRadarData(options: H3.Chart.ChartOptions): H3.Chart.ChartData {
  let metricRangeData: any = [];
  let data: any = [];
  let dimensionLength = 0;
  let dimensionArray: any = {};
  let groupArray: any = [];
  let maxMetric: number = 0;
  let minMetric: number = 0;
  let groupNameArray: any = null;
  let groupLength = 0;
  const maxDimension = 20;
  let total = 0;
  if (options.groupDimension && options.groupDimension.field && options.metric.length) {
    const group = {};
    const mergeGroup: any = {};
    let dimension: any;
    let groupDimension: any;
    let metric: any;
    options.data.forEach((item: any, index: number) => {
      // 计算数值总和
      total += item[options.metric[0].uid];
      dimension = item[options.dimension.uid];
      groupDimension = item[options.groupDimension.uid];
      metric = item[options.metric[0].uid];
      if (
        Object.keys(dimensionArray).length > maxDimension - 2 &&
        !Object.keys(dimensionArray).includes(dimension)
      ) {
        dimension = "其他";
      }
      dimensionArray[dimension] = 0;

      if (!group[groupDimension]) {
        if (Object.keys(group).length < maxGroup - 1) {
          group[groupDimension] = {};
        } else {
          mergeGroup[groupDimension] = 0;
        }
      }
      if (Object.keys(mergeGroup).includes(groupDimension)) {
        group["其他"] = group["其他"] || {};
        group["其他"][dimension] = group["其他"][dimension] || 0;
        group["其他"][dimension] += metric;
      } else {
        group[groupDimension][dimension] = metric;
      }
    });
    data = Object.keys(group).map((keys: string) =>
      Object.values(Object.assign({}, dimensionArray, group[keys]))
    );
    groupArray = Object.keys(group);
    groupLength = groupArray.length;
    dimensionArray = Object.keys(dimensionArray);
    dimensionLength = dimensionArray.length;
  } else {
    groupNameArray = {};
    groupArray = options.metric.map((field: H3.Report.FieldColumn) => {
      groupNameArray[field.uid] = field.alias || field.name;
      return field.uid;
    });
    dimensionLength = options.data.length;
    let dimension;
    options.data.forEach((item: any, rowIndex: number) => {
      if (rowIndex < maxDimension - 1) {
        // 为了解决数字维度带来的Object对象自动排序
        dimension = item[options.dimension.uid] ? "tmp" + item[options.dimension.uid] : "未知";
        dimensionArray[dimension] = 0;
        options.metric.forEach((metric: H3.Report.FieldColumn, index: number) => {
          if (!data[index]) data[index] = [];
          data[index].push(item[metric.uid]);
          // 计算数值总和
          total += Number(metric.uid);
        });
      } else {
        dimensionArray["其他"] = 0;
        options.metric.forEach((metric: H3.Report.FieldColumn, index: number) => {
          // 计算数值总和
          total += Number(metric.uid);
          data[index][maxDimension - 1] = data[index][maxDimension - 1] || 0;
          data[index][maxDimension - 1] += item[metric.uid];
        });
      }
    });
    dimensionArray = Object.keys(dimensionArray).map(item => {
      const value = item.replace("tmp", "");
      return value;
    });
  }
  metricRangeData = JSON.parse(JSON.stringify(data));
  data.forEach((item: Array<number>, rowIndex: number) => {
    let metricIndex = rowIndex;
    if (!options.groupDimension) {
      total = item.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    } else {
      metricIndex = 0;
    }
    item.forEach((metric: number, index: number) => {
      if (
        options.metricRange &&
        options.metricRange.max !== null &&
        metric > (options.metricRange as any).max
      ) {
        (item[index] as any) = options.metricRange.max;
      } else if (
        options.metricRange &&
        options.metricRange.min !== null &&
        metric < (options.metricRange as any).min
      ) {
        (item[index] as any) = options.metricRange.min;
      }
      maxMetric = Math.max(maxMetric, item[index] || 0);
      minMetric = Math.min(minMetric, item[index] || 0);
    });
  });
  return {
    dimensionLength,
    dimensionArray,
    groupLength,
    groupArray,
    groupNameArray,
    maxMetric,
    minMetric,
    data,
    maxDimension,
    metricRangeData,
    total
  };
}

export default handleRadarData;
