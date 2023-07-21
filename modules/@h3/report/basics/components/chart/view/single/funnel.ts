import { fontSetting, numericalFormatting, viewOptions } from "../../utils/view";
import { convertNumber } from "@h3/report/basics/utils/number";
import getAliaValue from "@h3/report/basics/utils/alias";

/**
 * 绘制漏斗图
 * @param chartOptions
 * @param options
 * @param chartData
 */
function funnelChartOptions(
  chartOptions: any,
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData
) {
  const { tooltip, series }: any = viewOptions(options, chartData, {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        // 数值格式设置
        return params.marker + funnelNumberFormat(options, params);
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
  return {
    name: options.dimension.alias || options.dimension.name,
    type: "funnel",
    min: 0,
    minSize: "0%",
    maxSize: "100%",
    left: options.legend && options.legend.position === "left" ? 125 : 80,
    right: options.legend && options.legend.position === "right" ? 125 : 80,
    label: {
      show:
        options.dataLabel === null || options.dataLabel === undefined ? true : options.dataLabel,
      position: "inside",
      formatter: (params: any) => {
        // 数值格式设置
        return funnelNumberFormat(options, params);
      }
    },
    labelLine: {
      length: 10,
      lineStyle: {
        width: 1,
        type: "solid"
      }
    },
    itemStyle: {
      borderColor: "#fff",
      borderWidth: 1
    },
    emphasis: {
      label: {
        fontSize: 20
      }
    },
    data: chartData.data.map((item: any) => ({
      name: item[options.dimension.uid],
      value: item[options.metric[0].uid]
    }))
  };
}
/**
 * 格式化显示
 * @param options
 * @param params
 */
function funnelNumberFormat(options: H3.Chart.ChartOptions, params: any) {
  // 数值格式设置
  const aliaName = options.dimension
    ? getAliaValue(options.dimension.uid, params.name, options.dataAlias)
    : "";
  const name = aliaName || params.name;
  const value = params.value ? params.value : 0;
  let res;
  options.metric.forEach((metric, index) => {
    if (params.componentIndex === index) {
      // 数值格式设置
      if (metric.options.numberFormat as H3.Report.NumberFormat) {
        res =
          name + "：" + convertNumber(value, metric.options.numberFormat as H3.Report.NumberFormat);
      } else {
        res = name + "：" + value;
      }
    }
  });
  return res;
}
export default funnelChartOptions;
