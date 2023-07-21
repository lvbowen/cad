import {
  viewOptions,
  fontSetting,
  numericalFormatting,
  warningLine,
  getDataZoom
} from "../../utils/view";
import { tooltipShadowColor } from "../options";

/**
 * 绘制条形图表
 * @param chartOptions
 * @param options
 * @param chartData
 */
function stripeChartOptions(
  chartOptions: any,
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData
) {
  const { xAxis, yAxis, tooltip, series, grid }: any = viewOptions(options, chartData, {
    xAxis: {
      inverse: true
    },
    yAxis: {
      position: "top"
    },
    grid: {
      right: "10%"
    },
    tooltip: {
      axisPointer: {
        type: "shadow",
        shadowStyle: {
          color: tooltipShadowColor
        }
      }
    },
    series: getSeries(options, chartData)
  });

  const dataZoom = getDataZoom(options, chartData);

  warningLine({ xAxis, yAxis, series }, chartData, options, "y");
  // x轴和y轴互换
  Object.assign(chartOptions, {
    xAxis: yAxis,
    yAxis: xAxis,
    tooltip,
    series,
    grid,
    dataZoom
  });
  return chartOptions;
}
/**
 * 获取系列列表，每个系列通过 type 决定自己的图表类型
 * @param options
 * @param chartData
 */
function getSeries(options: H3.Chart.ChartOptions, chartData: H3.Chart.ChartData) {
  return chartData.groupArray.map((group: string) => {
    const max = Math.max(
      (100 - chartData.groupArray.length * 5) / chartData.groupArray.length,
      3.5
    );
    const optionData: any = {
      name: group,
      type: "bar",
      barGap: "20%",
      // barWidth: max + "%",
      barMinWidth: 1,
      barCategoryGap: "20%",
      label: {
        // 数值显示开关
        show: options.dataLabel === null ? true : options.dataLabel,
        position: "insideRight",
        offset: [30, 0],
        color: fontSetting(options),
        formatter: (params: any) => {
          // 数值格式设置
          return numericalFormatting(params, chartData, options);
        }
      },
      barMinHeight: 1
      // barCategoryGap: "22px"
    };

    return optionData;
  });
}
export default stripeChartOptions;
