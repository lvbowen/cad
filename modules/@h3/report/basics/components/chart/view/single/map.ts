import { convertNumber } from "@h3/report/basics/utils/number";
import {
  viewOptions,
  getAddressLink,
} from "../../utils/view";
import {
  black,
  fontColor
} from "../options";
import { StringType } from "@h3/report/basics/enum/filter-type";
import { getStrLen } from "@h3/report/basics/utils/string";
import addresses from "@h3/report/basics/enum/pca-code";
import { mapColorOptions } from "@h3/report/basics/enum/map";

/**
 * 绘制地图图表
 * @param chartOptions
 * @param options
 * @param chartData
 * @param vm
 */
function mapOptions(
  chartOptions: any,
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData,
  vm: any = null
) {
  const metricFormatOptions =
    options.metric && options.metric[0] && options.metric[0].options && options.metric[0].options.numberFormat ?
      options.metric[0].options.numberFormat : { comma: false, fraction: 0,percent: false} ;
  const { tooltip, series }: any = viewOptions(options, chartData, {
    tooltip: {
      trigger: "item",
      formatter:  (params)=> {
        const name = options.mapDigitalSet.displayDimension ? params.name : "";
        let value = options.mapDigitalSet.displayMetric ? params.value : 0;
        value = convertNumber(value,metricFormatOptions);
        return `${value} <br /> ${name} `;
      } 
    },
    series: getSeries(options, chartData)
  });

  Object.assign(chartOptions, {
    tooltip,
    series,
    visualMap: getVisualMap(options, chartData),
    graphic: getGraphic(options, chartData, vm)
  });

  delete chartOptions.dataset;
  delete chartOptions.color;
  delete chartOptions.legend;
  // 警戒线
  return chartOptions;
}
/**
 * 获取映射
 * @param options
 * @param chartData
 * @param vm
 */
function getGraphic(options, chartData, vm) {
  const country = { code: "100000", name: "全国" };
  // 面包屑
  const link: Array<any> =
    options.mapSource.code === country.code
      ? [country]
      : getAddressLink(addresses, options.mapSource, country);

  const textList: any = [];

  let leftLength = 0;
  link.forEach((item, index) => {
    const name = (index === 0 ? "" : " / ") + item.name;
    const textItem = {
      type: "text",
      left: (index === 2 ? leftLength - 5 : leftLength) + "px",
      top: 0,
      style: {
        text: name,
        textAlign: "center",
        fill: link.length === index + 1 ? fontColor : "#107FFF",
        font: '12px "Microsoft YaHei", sans-serif'
      },
      onclick: function() {
        if (link.length !== index + 1) {
          (vm as any).clickChart(
            [
              {
                field: options.dimension,
                formula: StringType.Equal,
                text: item.code
              }
            ],
            {
              data: item
            }
          );
        }
      }
    };
    leftLength += getStrLen(name) * 6; // 计算
    textList.push(textItem);
  });
  return [
    {
      type: "group",
      left: "center",
      top: 10,
      children: textList.length > 1 ? textList : []
      // children: textList
    }
  ];
}
/**
 * 获取映射
 * @param options
 * @param chartData
 */
function getVisualMap(options: H3.Chart.ChartOptions, chartData: H3.Chart.ChartData) {
  const { mapArea, mapDigitalSet, mapDrill, mapTheme } = options;
  const { maxMetric, minMetric } = chartData;
  
  const max = minMetric === maxMetric ? (maxMetric ? maxMetric : 0) + 1 : maxMetric;
  const min = minMetric ? minMetric : 0;
  return {
    type: "continuous",
    min: min,
    max: max,
    top: 0,
    text: [max, min],
    show: true,
    realtime: false,
    calculable: true,
    inRange: {
      color: mapColorOptions[mapTheme.theme]
        ? mapColorOptions[mapTheme.theme].mainColor
        : mapColorOptions.pro.mainColor
    }
  };
}
/**
 * 获取系列列表，每个系列通过 type 决定自己的图表类型
 * @param options
 * @param chartData
 */
function getSeries(options: H3.Chart.ChartOptions, chartData: H3.Chart.ChartData) {
  const { mapName, data, dimensionArray, mapJson, maxDimension, maxMetric, minMetric } = chartData;
  const { mapArea, mapDigitalSet, mapDrill, mapTheme } = options;
  const theme = mapColorOptions[mapTheme.theme]
    ? mapColorOptions[mapTheme.theme]
    : mapColorOptions.pro.mainColor;
  const metricFormatOptions =
    options.metric && options.metric[0] && options.metric[0].options && options.metric[0].options.numberFormat ?
      options.metric[0].options.numberFormat : { comma: false, fraction: 0,percent: false} ;
  const optionData: any = [
    {
      type: "map",
      roam: true,
      mapType: mapName,
      data: data,
      layoutCenter: ["50%", "50%"], //地图位置
      label: {
        show: true,
        formatter: params => {
          const name = options.mapDigitalSet.displayDimension ? params.name : "";
          let value = options.mapDigitalSet.displayMetric ? params.value : 0;
           value = convertNumber(value,metricFormatOptions);
          return `${value} \n ${name} `;
        }
      },
      itemStyle: {
        borderColor: theme.borderColor,
        areaColor: theme.mainColor,
        borderWidth: theme.borderWidth
      },
      emphasis: {
        label: {
          show: true,
          color: black
        },
        itemStyle: {
          areaColor: theme.hoverColor,
          borderWidth: theme.hoverBorderWidth,
          borderColor: theme.hoverBorderColor
        }
      }
    }
  ];
  return optionData;
}

export default mapOptions;
