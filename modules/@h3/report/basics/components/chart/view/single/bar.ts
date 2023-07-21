import {
  viewOptions,
  fontSetting,
  numericalFormatting,
  warningLine,
  getDataZoom
} from "../../utils/view";
import { tooltipShadowColor } from "../options";

/**
 * 绘制柱状图表
 * @param chartOptions
 * @param options
 * @param chartData
 */
function barChartOptions(
  chartOptions: any,
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData
) {
  const { xAxis, yAxis, tooltip, series }: any = viewOptions(options, chartData, {
    xAxis: "default",
    yAxis: "default",
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

  Object.assign(chartOptions, {
    xAxis,
    yAxis,
    tooltip,
    series,
    dataZoom
  });

  // 警戒线功能
  warningLine(chartOptions, chartData, options);
  return chartOptions;
}
/**
 * 获取系列列表，每个系列通过 type 决定自己的图表类型
 * @param options
 * @param chartData
 */
function getSeries(options: H3.Chart.ChartOptions, chartData: H3.Chart.ChartData) {
  return chartData.groupArray.map((group: string) => {
    // 9.27 间距改为20%
    // const max = Math.max(
    //   (100 - chartData.groupArray.length * 5) / chartData.groupArray.length,
    //   3.5
    // );
    const optionData: any = {
      name: group,
      type: "bar",
      barGap: "20%",
      // barWidth: max + "%",
      barMinHeight: 1,
      barCategoryGap: "20%",
      label: {
        // 数值显示开关
        show: options.dataLabel === null ? true : options.dataLabel,
        position: "top",
        color: fontSetting(options),
        formatter: (params: any) => {
          // 数值格式设置
          return numericalFormatting(params, chartData, options);
        }
      }
    };
    return optionData;
  });
}

export default barChartOptions;
