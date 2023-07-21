import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/bar";
import "echarts/lib/chart/line";
import "echarts/lib/chart/pie";
import "echarts/lib/chart/funnel";
import "echarts/lib/chart/radar";
import "echarts/lib/chart/scatter";
import "echarts/lib/chart/map";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/component/legend";
import "echarts/lib/component/markLine";
import "echarts/lib/component/legendScroll";
import "echarts/lib/component/dataZoom";
import "echarts/lib/component/visualMap";
import "echarts/lib/component/graphic";

import { handleData } from "../data";
import {
  legendSetting,
  analysisChartData,
  viewOptions,
  handleBigData,
  newDataZoomEvent,
  getMapJson,
  checkChartClick
} from "../utils/view";
import { ElementType } from "@h3/report/basics/enum/chart-type";
import singeCharts from "./single";
import compositeCharts from "./composite";
import localstorage from "@h3/report/basics/instance/localforage";

/**
 * 获取图表实例
 * @param container
 * @param options
 * @param vm
 * @param showDataZoom  // 获取默认是否大数据配置 todo 老统计分析不上datazoom 后期可以优化掉
 */
export const chartView = async (
  container: HTMLDivElement,
  options: H3.Chart.ChartOptions,
  vm: any,
  showDataZoom: boolean = true
) => {
  let extendData: any;

  // 地图 todo 先判断缓存有没有，有则拿缓存信息
  if (options.mapSource && isMapType(options)) {
    const { name, code } = options.mapSource;
    const mapJson = await getMapJsonByStorage(vm.api, code);
    //@ts-ignore
    echarts.registerMap(name, mapJson);
  }
  const chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData> = handleData(options);
  // 获取默认是否大数据配置 todo 老统计分析不上datazoom 后期可以优化掉
  let isBigData: boolean = false;
  if (!showDataZoom) {
    const bigDataOption = getDefaultBigData(chartData, options);
    const { animate, isScrollY, isScrollX } = bigDataOption;
    isBigData = bigDataOption.isBigData;
    (vm as any).isScrollY = isScrollY;
    (vm as any).isScrollX = isScrollX;
  }
  return new Promise(resolve => {
    vm.$nextTick(() => {
      if (!vm.$refs.chartBody) return;
      const echart = getEchart(vm, showDataZoom, chartData, isBigData, options);
      resolve(echart);
    });
  });
};

/**
 * 获取地图json
 * @param name
 * @param code
 */
async function getMapJsonByStorage(fetchApi, code) {
  let mapJson = await localstorage.getItem(code);
  if (!mapJson) {
    mapJson = await getMapJson(fetchApi, code);
    localstorage.setItem(code, mapJson);
  }
  return mapJson;
}

/**
 * 生成echart实例
 * @param vm
 * @param showDataZoom
 * @param chartData
 * @param isBigData
 * @param options
 */
function getEchart(vm, showDataZoom, chartData, isBigData, options) {
  //@ts-ignore
  const echart = echarts.init(vm.$refs.chartBody, null, { renderer: "canvas" });
  const defaultOptions = getDefaultOptions(true, chartData, options);
  const chartsMap = Object.assign({}, singeCharts, compositeCharts);
  const chartOptions = chartsMap[options.type](defaultOptions, options, chartData, vm);

  if (!showDataZoom && isBigData) {
    handleBigData(
      echart,
      chartOptions,
      (vm.$refs.scroll as any).$el.querySelector(".h3-scroll__content") as HTMLDivElement,
      chartData,
      options
    );
  }
  if (chartOptions) {
    echart.setOption(chartOptions);
  }

  echart.on("click", (params: any) => {
    if (checkChartClick(params)) {
      (vm as any).clickChart(analysisChartData(params, options), params);
    }
    // 解析图表数据
  });
  // 图表滚动条的保存提供数据
  if (!showDataZoom) {
    echart.on("datazoom", params => {
      options.uid && newDataZoomEvent(options.uid, params);
    });
  }

  return echart;
}

/**
 * 获取图表的默认参数
 * @param animate
 * @param chartData
 * @param options
 */
function getDefaultOptions(
  animate,
  chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData>,
  options: H3.Chart.ChartOptions
) {
  const defaultOptions: any = viewOptions(options, chartData, {
    grid: "default",
    legend: "default",
    dataset: "default",
    color: "default",
    animation: animate
  });
  legendSetting(defaultOptions, options); // 图例设置
  return defaultOptions;
}

/**
 * 获取大数据的默认配置参数
 * @param chartData 图标数据
 * @param options 图标配置项
 */
function getDefaultBigData(
  chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData>,
  options: H3.Chart.ChartOptions
) {
  const isArray = chartData instanceof Array;
  // 如果是数组的话先判断第一个是否超出, 未超出的话
  const targetChartData = isArray ? chartData[0] : chartData;
  let animate = true;
  let isBigData = false;
  let isScrollY = true;
  let isScrollX = true;
  // 类型包含
  if (
    [
      ElementType.BAR,
      ElementType.STRIPE,
      ElementType.LINE,
      ElementType.AREA,
      ElementType.BIAX
    ].includes(options.type) &&
    targetChartData.dimensionLength > targetChartData.maxDimension
  ) {
    animate = false;
    isBigData = true;
  } else {
    isScrollY = false;
    isScrollX = false;
  }
  if (![ElementType.TABLE, ElementType.LIST, ElementType.CARD].includes(options.type)) {
    isScrollY = false;
  }
  return {
    animate,
    isBigData,
    isScrollY,
    isScrollX
  };
}

/**
 * 依据当前数据，判断是否为地图类型
 * @param options
 */
const isMapType = options => {
  return options.type === "map";
};

export default chartView;
