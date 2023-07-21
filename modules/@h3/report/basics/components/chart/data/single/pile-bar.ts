import { maxDimension, maxGroup } from "../options";

/**
 * 堆叠图
 * @param options
 */
function handlePileBarData(options: H3.Chart.ChartOptions): H3.Chart.ChartData {
  let data: any;
  let dimensionLength = 0;
  let dimensionArray: any = {};
  let groupArray: any = [];
  let maxMetric: number = 0;
  let minMetric: number = 0;
  let groupNameArray: any = null;
  let groupLength = 0;
  let metricRangeData;
  let total: any;
  if (options.groupDimension && options.groupDimension.field && options.metric.length) {
    const group = {};
    const mergeGroup: Array<string> = [];
    const fields: any = {};
    let field: any = {};
    let dimension;
    let groupName;
    total = {};
    options.data.forEach((item: any) => {
      // 最小值
      minMetric = Math.min(minMetric, item[options.metric[0].uid] || 0);
      // 计算数值总和
      item[options.dimension.uid] = item[options.dimension.uid] || "未知";
      dimension = "tmp_" + item[options.dimension.uid];
      if (!fields[dimension]) fields[dimension] = {};
      item[options.groupDimension.uid] = item[options.groupDimension.uid] || "未知";
      groupName = item[options.groupDimension.uid];

      if (!Object.keys(group).includes(groupName)) {
        if (Object.keys(group).length < maxGroup - 1) {
          group[groupName] = 0;
        } else if (!mergeGroup.includes(groupName)) {
          mergeGroup.push(groupName);
        }
      }
      field = fields[dimension];
      if (mergeGroup.includes(groupName)) {
        groupName = "其他";
      }
      field[groupName] = field[groupName] || 0;
      field[groupName] += item[options.metric[0].uid];
      total[dimension] = total[dimension] || 0;
      total[dimension] += item[options.metric[0].uid];
    });
    Object.keys(total).forEach(key => {
      // 最大值
      maxMetric = Math.max(maxMetric, total[key]);
    });

    if (mergeGroup.length) {
      group["其他"] = 0;
    }
    groupArray = Object.keys(group).map(key => key.replace("tmp_", ""));
    groupLength = groupArray.length;
    dimensionArray = Object.keys(fields).map(key => key.replace("tmp_", ""));
    dimensionLength = dimensionArray.length;
    metricRangeData = Array.from({ length: Object.keys(fields).length }, () => []);
    data = dimensionArray.map((key: string, rowIndex: number) => {
      // 堆叠图暂时关闭自定义范围功能 - 如果开启后，需要把if,else注释打开
      if (options.metricRange) {
        return [
          key,
          ...Object.values(Object.assign({}, group, fields["tmp_" + key])).map(
            (metric: number, index: number) => {
              metricRangeData[rowIndex][index] = metric;
              if (
                options.metricRange &&
                options.metricRange.max !== null &&
                metric > (options.metricRange as any).max
              ) {
                return options.metricRange.max;
              } else if (
                options.metricRange &&
                options.metricRange.min !== null &&
                metric < (options.metricRange as any).min
              ) {
                return options.metricRange.min;
              }
              return metric;
            }
          )
        ];
      } else {
        Object.values(Object.assign({}, group, fields["tmp_" + key])).map(
          (metric: number, index: number) => {
            metricRangeData[rowIndex][index] = metric;
          }
        );
        return [key, ...Object.values(Object.assign({}, group, fields["tmp_" + key]))];
      }
    });
  } else {
    groupNameArray = {};
    total = [];
    groupArray = options.metric.map((field: H3.Report.FieldColumn) => {
      groupNameArray[field.uid] = field.alias || field.name;
      return field.uid;
    });

    metricRangeData = {};
    const fields = {};
    let dimension;
    options.data.forEach((item: any, rowIndex: number) => {
      item[options.dimension.uid] = item[options.dimension.uid] || "未知";
      // 为了解决数字维度带来的Object对象自动排序
      dimension = "tmp_" + item[options.dimension.uid];
      if (!fields[dimension]) fields[dimension] = [dimension];
      dimensionArray[dimension] = null;
      options.metric.forEach((metric: H3.Report.FieldColumn, index: number) => {
        const num = item[metric.uid];
        // 计算数值绝对值总和
        total[index] = total[index] || 0;
        total[index] += num;
        metricRangeData[dimension] = metricRangeData[dimension] || [];
        metricRangeData[dimension][index] = metricRangeData[dimension][index] || 0;
        metricRangeData[dimension][index] += num;
        fields[dimension][index + 1] = fields[dimension][index + 1] || 0;
        fields[dimension][index + 1] += num;
      });
    });
    data = Object.values(fields).map((item: Array<any>) => {
      item[0] = item[0].replace("tmp_", "");
      return item;
    });
    dimensionLength = data.length;
    metricRangeData = Object.values(metricRangeData);
    data.forEach((item: any, rowIndex: number) => {
      let maxMetricSum: number = 0;
      item.forEach((cell: number, index: number) => {
        if (typeof cell === "number") {
          // 堆叠图最大值需要累加计算
          maxMetricSum += item[index] || 0;
          minMetric = Math.min(minMetric, item[index] || 0);
        }
        // 堆叠图暂时没有自定义范围功能，底下代码注释
        // if (typeof cell ==='number' && options.metricRange) {
        //   if (options.metricRange && options.metricRange.max !== null && cell > (options.metricRange as any).max) {
        //     item[index] = options.metricRange.max;
        //   } else if (options.metricRange && options.metricRange.min !== null && cell < (options.metricRange as any).min) {
        //     item[index] = options.metricRange.min;
        //   }
        //   maxMetric = Math.max(maxMetric, item[index] || 0);
        //   minMetric = Math.min(minMetric, item[index] || 0);
        // }
      });
      maxMetric = Math.max(maxMetric, maxMetricSum);
    });
    dimensionArray = Object.keys(dimensionArray);
  }
  return {
    dimensionLength,
    dimensionArray,
    groupLength,
    groupArray,
    groupNameArray,
    maxMetric,
    minMetric,
    data,
    index: 0,
    metricRangeData,
    maxDimension,
    total
  };
}

export default handlePileBarData;
