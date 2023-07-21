import { fontSetting, viewOptions } from "../../utils/view";
import { lineColor } from "../options";
import { convertNumber } from "@h3/report/basics/utils/number";
import getAliaValue from "@h3/report/basics/utils/alias";

/**
 * 绘制圆饼图表
 * @param chartOptions
 * @param options
 * @param chartData
 */
function pieChartOptions(
  chartOptions: any,
  options: H3.Chart.PieChartOptions,
  chartData: H3.Chart.ChartData
) {
  const { tooltip, series }: any = viewOptions(options, chartData, {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        // 饼图数值格式设置options
        return pieMultipleDataLabel(params, chartData, options, 0);
      }
    },
    series: getSeries(options, chartData)
  });
  Object.assign(chartOptions, {
    tooltip,
    series
  });
  return chartOptions;
}

/**
 * 获取系列列表，每个系列通过 type 决定自己的图表类型
 * @param options
 * @param chartData
 */
function getSeries(options: H3.Chart.ChartOptions, chartData: H3.Chart.ChartData) {
  let seriesCenter = ["50%", "50%"];
  if (options.legend && options.legend.position === "left") {
    seriesCenter = ["60%", "50%"];
  } else if (options.legend && options.legend.position === "right") {
    seriesCenter = ["40%", "50%"];
  }
  return {
    name: options.dimension.alias || options.dimension.name,
    type: "pie",
    center: seriesCenter,
    radius: [0, "50%"],
    itemStyle: {
      borderColor: "#FFF"
    },
    // selectedMode: 'single',
    label: {
      color: fontSetting(options),
      // 数值显示控制
      show: options.multipleDataLabel
        ? !!(
            options.multipleDataLabel.dimensionLabel ||
            options.multipleDataLabel.metricLabel ||
            options.multipleDataLabel.percentLabel
          )
        : true,
      formatter: (params: any) => {
        // 饼图数值格式设置options
        return pieMultipleDataLabel(params, chartData, options, 1);
      }
    },
    labelLine: {
      lineStyle: {
        color: lineColor
      }
    },
    data: chartData.data.map((item: any) => ({
      name: item[options.dimension.uid],
      value: Math.abs(item[options.metric[0].uid]),
      actualValue: item[options.metric[0].uid]
    }))
  };
}
/**
 * 饼图数值格式设置options
 * @param params
 * @param chartData
 * @param options
 * @param type
 */
function pieMultipleDataLabel(
  params: any,
  chartData: H3.Chart.ChartData,
  options: H3.Chart.ChartOptions,
  type: number
) {
  // 注：百分数计算方式（绝对值/绝对值总和）,value还是显示原始值
  let percent: any = Number((Math.abs(params.value) / (chartData.total as any)) * 100);
  percent = isNaN(percent) ? 0 : percent.toFixed(2);

  const aliaName = options.dimension
    ? getAliaValue(options.dimension.uid, params.name, options.dataAlias)
    : "";
  const name = aliaName || params.name;
  let res: string = "";
  let count: number = 0;
  let changeValue: any;
  // 没有勾选显示指标的时候，tooltip也要显示指标值
  const hideValue: any = convertNumber(
    params.data.actualValue,
    (options.metric[0].options.numberFormat as H3.Report.NumberFormat) || {}
  );
  // 0-tooltip-format、1-series-label-format
  type === 0 ? (res = params.marker) : "";
  // 存在则为仪表盘、
  if (options.multipleDataLabel) {
    // 显示维度值
    if (options.multipleDataLabel.dimensionLabel) {
      res += name;
      count += 1;
    }
    // 显示指标值
    if (options.multipleDataLabel.metricLabel) {
      changeValue = convertNumber(
        params.data.actualValue,
        (options.metric[0].options.numberFormat as H3.Report.NumberFormat) || {
          comma: false, // 千分符
          percent: false, // 百分比
          fraction: 0 // 小数位数 默认0
        }
      );
      count === 1 ? (res += "：" + changeValue) : (res += changeValue);
      count += 1;
    }
    // 显示百分比
    if (options.multipleDataLabel.percentLabel) {
      count === 0 ? (res += `${percent}%`) : (res += ` (${percent}%)`);
      count += 1;
    }
    // tooltip显示全部内容
    if (type === 0) {
      return (res =
        params.marker +
        name +
        "<br/>" +
        (changeValue ? changeValue : hideValue) +
        "<br/>" +
        `${percent}%`);
    }
    return res;
  } else {
    return (res += name + "：" + params.data.actualValue + ` (${percent}%)`);
  }
}

export default pieChartOptions;
