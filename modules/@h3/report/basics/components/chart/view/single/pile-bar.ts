import {
  fontSetting,
  numericalFormatting,
  warningLine,
  viewOptions,
  getDataZoom
} from "../../utils/view";
import { tooltipShadowColor } from "@h3/report/basics/components/chart/view/options";

/**
 * 绘制堆叠柱状图表
 * @param chartOptions
 * @param options
 * @param chartData
 */
function pileBarChartOptions(
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
  // 堆叠图处理负数值 - 临时方案（等Echart更新修复BUG后，需要去除该方法）
  handlePileBarValue(chartData, chartOptions);
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
      barCategoryGap: "20%",
      stack: "堆叠柱状图stack"
    };
    optionData.label = {
      color: fontSetting(options),
      // 数值显示开关
      show: options.dataLabel === null ? true : options.dataLabel,
      position: "inside",
      formatter: (params: any) => {
        // 数值格式设置
        return numericalFormatting(params, chartData, options);
      }
    };
    // 柱条最小高度
    optionData.barMinHeight = 1;
    // 柱子间距
    optionData.barCategoryGap = "22px";
    return optionData;
  });
}
/**
 * 堆叠图处理负数值
 * @param chartData
 * @param publicOptions
 */
function handlePileBarValue(chartData: H3.Chart.ChartData, publicOptions: any) {
  if (chartData.data.length === 1) {
    let count: any = null;
    chartData.data.forEach((item: number, index: number) => {
      if (index !== 0 && item < 0) {
        count !== null ? (count > item ? (count = item) : count) : (count = item);
      }
    });
    publicOptions.yAxis.min = count;
  } else {
    let count: any = null;
    const arr: Array<number> = [];
    let min: any;
    chartData.data.forEach((data: Array<any>) => {
      if (data.length > 2) {
        data.forEach((item: any, index: number) => {
          if (index !== 0 && item < 0) {
            count += item;
            if (index === data.length - 1) {
              arr.push(count);
            }
          }
        });
      }
    });
    if (arr.length !== 0) {
      min = Math.min.apply(null, arr);
      publicOptions.yAxis.min = min;
    } else {
      publicOptions.yAxis.max = publicOptions.yAxis.max || null;
      publicOptions.yAxis.min = publicOptions.yAxis.min || null;
    }
  }
}

export default pileBarChartOptions;
