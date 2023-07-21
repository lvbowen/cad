import { convertNumber, stringNumber } from "@h3/report/basics/utils/number";
import { tooltipBgColor, lineColor, tooltipShadowColor } from "../view/options";
import { subStr, getStrLen, makeStr } from "@h3/report/basics/utils/string";
import { StringType } from "@h3/report/basics/enum/filter-type";
import getAliaValue from "../../../utils/alias";
import { message } from "@h3/antd-vue";

/**
 * 生成图表配置
 * @param options
 * @param chartData
 * @param config  对图表属性做配置,提供7个默认配置tooltip，xAxis，yAxis，legend，dataset，color，grid
 *  例： {
 *           tooltip: 'default',             // ‘default’使用tooltip默认配置
 *           xAxis: {
 *               axisLine: {  show: false } // 在提供默认的配置上扩展 axisLine: {  show: false }，已有这个属性，则会覆盖掉
 *              }，
 *           radar: {
 *                radius: '55%'             // 新增radar配置
 *           }
 *        }
 */
function viewOptions(
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData>,
  config: any
) {
  const chartOptions: any = {};
  const chartConfigMap = {
    tooltip: getTooltip(options, chartData),
    xAxis: getXAxis(options, chartData as H3.Chart.ChartData),
    yAxis: getYAxis(options, chartData as H3.Chart.ChartData),
    legend: getLegend(options, chartData),
    dataset: getDataset(options, chartData),
    color: options.colors,
    grid: getGrid(options, chartData)
  };
  // await setLegendTooltip(chartConfigMap.legend);
  Object.keys(config).forEach((key: string) => {
    // config { key : value}  1. value为'default'，用默认的配置 2 .value 等于Object，扩展默认配置 3. value为其它类型，以其它为准
    if (chartConfigMap[key]) {
      chartOptions[key] =
        config[key] === "default"
          ? chartConfigMap[key]
          : Object.prototype.toString.call(config[key]) === "[object Object]"
          ? Object.assign(chartConfigMap[key], config[key])
          : config[key];
    } else {
      chartOptions[key] = config[key];
    }
  });
  return chartOptions;
}

/**
 *  获取tooltip
 * @param options
 * @param chartData
 */
function getTooltip(
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData>
) {
  return {
    trigger: "axis",
    backgroundColor: tooltipBgColor,
    extraCssText: "padding: 10px;border-radius: 4px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);",
    textStyle: {
      color: "#fff",
      fontSize: 12
    },
    position: (pos, params, dom, rect, size) => {
      // 0.05为grid.right边距的值
      const pw = size.viewSize[0] - pos[0] - size.contentSize[0] * 0.05;
      const x =
        pw >= size.contentSize[0]
          ? pos[0]
          : size.viewSize[0] - size.contentSize[0] - size.contentSize[0] * 0.1;
      const y =
        pos[1] >= size.contentSize[1]
          ? pos[1] - size.contentSize[1] * 0.92
          : size.contentSize[1] * 0.08;
      return [x, y];
    },
    formatter: (params: any) => {
      // 类别与X轴的别名取相同
      const aliaName = options.dimension
        ? getAliaValue(options.dimension.uid, params[0].name, options.dataAlias)
        : "";
      const name = aliaName || params[0].name;
      let seriesName;
      let value;
      let res = name + "<br/>";
      params.forEach((item: any) => {
        const aliaValueName = options.groupDimension
          ? getAliaValue(options.groupDimension.uid, item.seriesName, options.dataAlias)
          : "";
        seriesName = (chartData as H3.Chart.ChartData).groupNameArray
          ? (chartData as any).groupNameArray[item.seriesName]
          : aliaValueName || item.seriesName;
        value = numericalFormatting(item, chartData as H3.Chart.ChartData, options);
        res += item.marker + seriesName + "：" + value + "<br/>";
      });
      return res;
    },
    axisPointer: {
      shadowStyle: {
        color: tooltipShadowColor
      }
    }
  };
}

/**
 *  获取tooltip
 * @param options
 * @param chartData
 */
function getDataZoom(
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData>
) {
  let axisx: any = {
    xAxisIndex: [0],
    bottom: 0,
    height: "24px"
  };
  if (options.type === "stripe") {
    axisx = {
      yAxisIndex: [0]
    };
  }

  return [
    {
      type: "slider",
      start: options.DataZoom ? options.DataZoom.start : 0,
      end: options.DataZoom ? options.DataZoom.end : 100,
      ...axisx,
      show: options.DataZoom ? options.DataZoom.show : false,
      backgroundColor: "#ffffff",
      borderColor: "rgba(231, 231, 231, 1)",
      fillerColor: "rgba(80, 130, 228, 0.05)",
      labelFormatter: value => {
        const tmpValue = (chartData instanceof Array ? chartData[0] : chartData).data[value][0];
        const aliaName = options.dimension
          ? getAliaValue(options.dimension.uid, tmpValue, options.dataAlias)
          : "";
        const dataAlias = aliaName || tmpValue;
        return dataAlias;
      },
      dataBackground: {
        lineStyle: {
          color: "rgba(231, 231, 231, 1)",
          opacity: 1
        },
        areaStyle: {
          color: "#F1F1F1",
          opacity: 0.5
        }
      },
      handleStyle: {
        color: "rgba(192, 200, 203, 1)"
      }
      // handleIcon:
      //   "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
      // handleSize: "80%",
      // handleStyle: {
      //   color: "#fff",
      //   shadowBlur: 3,
      //   shadowColor: "rgba(0, 0, 0, 0.6)",
      //   shadowOffsetX: 2,
      //   shadowOffsetY: 2
      // }
    },
    {
      type: "inside",
      ...axisx,
      disabled: options.DataZoom ? !options.DataZoom.show : true
    }
  ];
}
/**
 *  获取xAxis
 * @param options
 * @param chartData
 */
function getXAxis(
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData>
) {
  let axisLineShow: boolean = true;
  let axisLabelShow: boolean = true;
  if (options.axisX) {
    axisLineShow = options.axisX.displayAxisX === null ? true : options.axisX.displayAxisX;
    axisLabelShow = options.axisX.displayLabel === null ? true : options.axisX.displayLabel;
  }

  return {
    type: "category",
    axisLabel: {
      formatter: (value: string, index) => {
        // x轴永远是dimension的值 使用dimension的uid拼value取别名
        const aliaName = options.dimension
          ? getAliaValue(options.dimension.uid, value, options.dataAlias)
          : "";
        const dataAlias = aliaName || value;
        const limitDataAlias = subStr(dataAlias, 14, true);
        // 刻度竖直显示时，限制高度，保证图表的正常显示
        return options.axisX && options.axisX.direction === "endwise"
          ? limitDataAlias.split("").join("\n")
          : dataAlias;
      },
      color: fontSetting(options),
      rotate: mapAxisRotate(options),
      show: axisLabelShow
    },

    axisTick: {
      alignWithLabel: true,
      lineStyle: {
        color: lineColor
      }
    },
    axisLine: {
      lineStyle: {
        color: lineColor
      },
      show: axisLineShow
    }
  };
}
/**
 *  计算坐标轴刻度角度
 * @param options
 */
function mapAxisRotate(options: H3.Chart.ChartOptions): number {
  let rotate: number = 0;
  if (options.axisX && options.axisX.direction) {
    if (options.axisX.direction === "leftBank") {
      rotate = 45;
    } else if (options.axisX.direction === "rightBank") {
      rotate = -45;
    }
  }
  return rotate;
}
/**
 *  获取yAxis
 * @param options
 * @param chartData
 */
function getYAxis(options: H3.Chart.ChartOptions, chartData: H3.Chart.ChartData) {
  const rangeData = metricRangeMatrixing(options, chartData);
  return {
    type: "value",
    axisLabel: {
      formatter: (value: any) => {
        // 数值显示功能以第一个指标的设置为主
        const numberFormat = options.metric[0].options.numberFormat as H3.Report.NumberFormat;
        if (numberFormat) {
          value = convertNumber(value, numberFormat as any);
        }
        if (!numberFormat || (!numberFormat.fraction && !numberFormat.percent)) {
          value = stringNumber(value);
        }
        return value;
      },
      color: fontSetting(options),
      rotate: 0
    },
    min: rangeData.min,
    max: rangeData.max,
    axisTick: {
      show: false
    },
    axisLine: {
      show: options.axisYSet === undefined ? true : !!options.axisYSet,
      lineStyle: {
        color: lineColor
      }
    },
    splitLine: {
      show: options.splitLine === undefined ? true : !!options.splitLine,
      lineStyle: {
        color: lineColor,
        type: "dashed"
      }
    }
  };
}

/**
 *  获取gird
 * @param options
 * @param chartData
 */
function getGrid(
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData>
) {
  return {
    top: "10%",
    right: "5%",
    left: "4%",
    bottom: 64,
    containLabel: true // 区域是否包含坐标轴的刻度标签
  };
}
/**
 *  获取dataset
 * @param options
 * @param chartData
 */
function getDataset(
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData>
) {
  let dataSource;
  const realSource: Array<any> = [];
  const datas: Array<any> = [];
  if (chartData instanceof Array) {
    chartData.forEach((chart: H3.Chart.ChartData) => {
      datas.push(chart.data);
    });
    const length = datas.length;
    if (length > 0) {
      datas[0].forEach((d, index) => {
        let item = [...d];
        let i = 1;
        while (i < length) {
          const splice = datas[i][index].slice(1, datas[i][index].length);
          item = [...item, ...splice];
          i += 1;
        }
        realSource.push(item);
      });
    }
    dataSource = realSource;
  } else {
    dataSource = (chartData as H3.Chart.ChartData).data;
  }
  return {
    source: dataSource
  };
}
/**
 *  获取异步设置Legend
 */
function setLegendTooltip(legend) {
  setTimeout(() => {
    if (legend.maxLength && legend.maxLength >= 12) {
      legend.tooltip.show = true;
    }
  }, 0);
}
/**
 *  获取Legend
 * @param options
 * @param chartData
 */
function getLegend(
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData | Array<H3.Chart.ChartData>
) {
  let groupArray: Array<any> = [];
  let groupNameArray: any = {};
  let maxLength: number = 0;
  if (chartData instanceof Array) {
    chartData.forEach((chart: H3.Chart.ChartData) => {
      groupArray.push(...chart.groupArray);
      groupNameArray = Object.assign(groupNameArray, chart.groupNameArray);
    });
  } else {
    groupNameArray = (chartData as H3.Chart.ChartData).groupNameArray;
    groupArray = (chartData as H3.Chart.ChartData).groupArray;
  }
  return {
    textStyle: {
      color: fontSetting(options)
    },
    type: "scroll",
    bottom: 0,
    data: groupArray,
    formatter: (value: string) => {
      const legendValue = getLengedValue(value, options, groupNameArray);
      const strLength = getStrLen(legendValue);
      maxLength = maxLength < strLength ? strLength : maxLength;
      return subStr(legendValue, 12, true);
    },
    show: options.legend ? (options.legend.checked === null ? true : options.legend.checked) : true,
    tooltip: {
      show: true,
      formatter: (obj: any) => {
        return getLengedValue(obj.name, options, groupNameArray);
      },
      confine: true
    }
  };
}
/**
 * 图例格式化
 * @param value
 */
function getLengedValue(value, options, groupNameArray) {
  // 二唯一指标时value为 具体值，需要通过groupDimension 次纬度的uid_value去拿到别名
  // 一唯一指标和一纬多指标时，value为Uid，没有groupDimension 次纬度，通过groupNameArray[uid]拿值
  // 漏斗图/饼图只有一唯一指标所以用 options.dimension作为纬度图例
  const realName = options.groupDimension
    ? getAliaValue(options.groupDimension.uid, value, options.dataAlias)
    : options.dimension
    ? getAliaValue(options.dimension.uid, value, options.dataAlias)
    : "";
  const legendValue: string =
    groupNameArray && groupNameArray[value] ? groupNameArray[value] : realName ? realName : value;
  return legendValue;
}
/**
 * 图例设置
 * @param chartOptions
 * @param options
 */
function legendSetting(chartOptions: any, options: H3.Chart.ChartOptions) {
  if (options.legend) {
    const position = options.legend.position;
    if (options.legend.checked) {
      chartOptions.legend[position] = position;
      if (position === "top" || position === "bottom") {
        chartOptions.legend.orient = "horizontal";
      } else {
        chartOptions.legend.top = "middle";
        chartOptions.legend.orient = "vertical";
      }
      switch (position) {
        case "top":
          break;
        case "bottom":
          chartOptions.legend.bottom = options.DataZoom && options.DataZoom.show ? "36" : "10";
          // chartOptions.legend.bottom = 0;
          break;
        case "left":
          chartOptions.grid.left = "120";
          break;
        case "right":
          chartOptions.grid.right = "125";
          break;
        default:
          break;
      }
    }
  }
}

/**
 * 自定义范围数值换算
 * @param options
 * @param chartData
 * @param isGetOriginal 是否取原始值
 */
function metricRangeMatrixing(
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData,
  isGetOriginal: boolean = false
) {
  let min: any;
  let max: any;
  if (isGetOriginal) {
    min = options.metricRange
      ? options.metricRange.min || chartData.minMetric
      : chartData.minMetric;
    max = options.metricRange
      ? options.metricRange.max || chartData.maxMetric
      : chartData.maxMetric;
  } else {
    min = options.metricRange ? options.metricRange.min : null;
    max = options.metricRange ? options.metricRange.max : null;
  }
  if (
    options.multiMetricType &&
    options.multiMetricType.length > 0 &&
    options.multiRange &&
    options.multiRange.length > 0
  ) {
    const index = options.multiMetricType.findIndex(i => i === options.type);
    min = options.multiRange[index] ? options.multiRange[index].min : null;
    max = options.multiRange[index] ? options.multiRange[index].max : null;
  }
  if (min && !max) {
    const numLen =
      parseInt((chartData.maxMetric as any).toString().replace("-", ""), 10).toString().length -
        1 || 1;
    max = Math.ceil((chartData.maxMetric as any) / Math.pow(10, numLen)) * Math.pow(10, numLen);
    if (max <= min) {
      const minLen = parseInt(min.toString().replace("-", ""), 10).toString().length - 1 || 1;
      max = (Math.ceil((min as any) / Math.pow(10, minLen)) + 1) * Math.pow(10, minLen);
    }
  } else if (max < 0 && !min && max) {
    const numLen = parseInt(max.toString().replace("-", ""), 10).toString().length - 1 || 1;
    min = (Math.floor((max as any) / Math.pow(10, numLen)) - 1) * Math.pow(10, numLen);
  } else if (max === 0) {
    min = -100;
  }
  // 判断输入的最小值如果比原始值还大，则最小值变为原始值
  if (chartData.minMetric && min > chartData.minMetric) {
    min = chartData.minMetric;
  }
  return { max, min };
}

/**
 * 获取最大指标的显示值
 * @param chartOptions
 * @param options
 * @param chartData
 */
function getMaxMetricLength(
  chartOptions: any,
  options: H3.Chart.ChartOptions,
  chartData: H3.Chart.ChartData
) {
  let length = 0;
  const numberFormat = options.metric[0].options.numberFormat as H3.Report.NumberFormat;
  if (numberFormat && (numberFormat.fraction || numberFormat.percent) && chartData.maxMetric) {
    if (chartData.maxMetric) {
      const pow = Math.pow(10, Math.ceil(chartData.maxMetric).toString().length - 1);
      const maxMetricLabel = chartOptions.yAxis.axisLabel.formatter(
        Math.ceil(chartData.maxMetric / pow) * pow
      );
      const span = document.createElement("span");
      span.innerText = maxMetricLabel;
      document.body.appendChild(span);
      length = span.offsetWidth + 10;
      document.body.removeChild(span);
    }
  }
  return length;
}

/**
 * 数值格式设置
 * @param params
 * @param chartData
 * @param options
 * @param beforeIndex 真实数据index的前置index  用于复合图表-双轴图
 *   ['bar', 'stripe', 'area', 'line', 'pileBar']
 */
function numericalFormatting(
  params: any,
  chartData: H3.Chart.ChartData,
  options: H3.Chart.ChartOptions,
  beforeIndex: number = 0
) {
  const groupData = chartData.metricRangeData[chartData.index + params.dataIndex] || [];
  let value = groupData[params.componentIndex - beforeIndex];
  let metricGroupItem: Array<H3.Report.FieldColumn> = [];
  if (!value && value !== 0) {
    value = groupData[params.componentIndex - beforeIndex + 1] || 0;
  }
  if (options.metricGroup && options.metricGroup.length) {
    metricGroupItem = beforeIndex > 0 ? options.metricGroup[1] : options.metricGroup[0];
    metricGroupItem.forEach((item, index) => {
      // beforeIndex 正对于双轴图 多轴计算第几个指标
      if (
        params.componentIndex - beforeIndex === index &&
        (item.options.numberFormat as H3.Report.NumberFormat)
      ) {
        value = convertNumber(value, item.options.numberFormat as H3.Report.NumberFormat);
      }
    });
  } else {
    options.metric.forEach((item, index) => {
      if (item.options.numberFormat) {
        if (options.metric.length > 1) {
          if (params.componentIndex === index) {
            value = convertNumber(value, item.options.numberFormat as H3.Report.NumberFormat);
          }
        } else {
          // 等一个指标
          value = convertNumber(value, item.options.numberFormat as H3.Report.NumberFormat);
        }
      }
    });
  }
  return value;
}

/**


 
/**
 * 处理警戒线自定义指标范围，
 * @param options
 * @param chartData
 * @param chartOptions
 * @param line
 */
function handleMarkLineMetricRange(
  chartData: H3.Chart.ChartData,
  chartOptions: any,
  options: H3.Chart.ChartOptions,
  line: H3.Report.WarningLine
) {
  let labelValue; // label展示值
  let axisValue; // 坐标刻度的值
  if (line.type === "dynamic") {
    axisValue = getMarkLineValue(chartData, options, line);
    labelValue = axisValue;
    options.metric.forEach(item => {
      if (line.field === item.uid && item.options && item.options.percent === "PERCENT") {
        labelValue = Number(labelValue) * 100 + "%";
      }
    });
  } else {
    labelValue = line.value;
    if (/%$/.test(`${line.value}`)) {
      axisValue = Number(`${line.value}`.replace("%", "")) / 100;
    } else {
      axisValue = labelValue;
    }
  }

  // 取整数，echart对某些太精确的小数位，坐标轴刻度自动计算会有问题。
  const rangeAxisValue = axisValue < 0 ? Math.floor(axisValue) : Math.ceil(axisValue);
  if (
    axisValue > (chartData as any).maxMetric &&
    !(options.metricRange && options.metricRange.max)
  ) {
    if (chartOptions.yAxis.max) {
      chartOptions.yAxis.max =
        chartOptions.yAxis.max > axisValue ? chartOptions.yAxis.max : rangeAxisValue;
    } else {
      chartOptions.yAxis.max = rangeAxisValue;
    }
  }
  if (
    axisValue < (chartData as any).minMetric &&
    !(options.metricRange && options.metricRange.min)
  ) {
    if (chartOptions.yAxis.min) {
      chartOptions.yAxis.min =
        chartOptions.yAxis.min < axisValue ? chartOptions.yAxis.min : rangeAxisValue;
    } else {
      chartOptions.yAxis.min = rangeAxisValue;
    }
  }
  if (options.metricRange) {
    if (options.metricRange.max && axisValue > options.metricRange.max) {
      axisValue = options.metricRange.max;
    }
    if (options.metricRange.min && axisValue < options.metricRange.min) {
      axisValue = options.metricRange.min;
    }
  }
  return { axisValue, labelValue };
}
/**
 * 动态模式计算警戒线值
 * @param chartData
 * @param line
 * @param options
 */
function getMarkLineValue(
  chartData: H3.Chart.ChartData,
  options: H3.Chart.ChartOptions,
  line: H3.Report.WarningLine
) {
  let markLineValue;
  let fieldData = [];

  if (options.groupDimension && options.groupDimension.field && options.metric.length) {
    for (const value of chartData.metricRangeData) {
      fieldData = fieldData.concat(value);
    }
  } else {
    const tmpIndex = chartData.groupArray.findIndex((uid: string) => line.field === uid);
    if (tmpIndex === 0 || tmpIndex) {
      fieldData = chartData.metricRangeData.map(data => {
        return data[tmpIndex];
      });
    }
  }
  switch (line.aggregate) {
    case "max":
      markLineValue = Math.max(...fieldData);
      break;
    case "min":
      markLineValue = Math.min(...fieldData);
      break;
    case "average":
      let total = 0;
      fieldData.forEach(num => {
        total += num;
      });
      markLineValue = total / fieldData.length;
      break;
    default:
      break;
  }
  return markLineValue;
}
/**
 * 构造警戒线data数据
 * @param chartOptions
 * @param line
 * @param chartData
 * @param options
 * @param axis
 */
function createWarningLineData(
  chartOptions: any,
  line: H3.Report.WarningLine,
  chartData: H3.Chart.ChartData,
  options: H3.Chart.ChartOptions,
  axis: "x" | "y"
) {
  const { axisValue, labelValue } = handleMarkLineMetricRange(chartData, chartOptions, options, line);
  const optJson: any = {
    lineStyle: {
      normal: {
        width: 1,
        type: "dashed",
        color: line.color
      }
    },
    label: {
      formatter: param => {
        const value: number = labelValue;
        if (line.is_title && line.is_value) {
          return line.title + "：" + value;
        } else {
          return line.is_title ? line.title : value;
        }
      }
    }
  };
  if (axis === "x") {
    optJson.yAxis = axisValue;
  } else {
    optJson.xAxis = axisValue;
  }
  return optJson;
}

/**
 * 警戒线配置
 * @param chartOptions
 * @param chartData
 * @param options
 * @param axis 警戒线在x轴/y轴
 */
function warningLine(
  chartOptions: any,
  chartData: H3.Chart.ChartData,
  options: H3.Chart.ChartOptions,
  axis: "x" | "y" = "x"
) {
  const warningOpt: any = {
    silent: true, // 关闭响应和触发鼠标事件
    symbol: [], // 去除箭头
    label: {
      position: "middle" // 数值显示在中间
    },
    data: []
  };
  // 判断存在字段，列表分析没有该字段和警戒线功能
  if (options.warningLine) {
    options.warningLine.forEach((item: H3.Report.WarningLine) => {
      // 警戒线markLine属性添加在series[0]中
      const dateItem = createWarningLineData(chartOptions, item, chartData, options, axis);
      if (!chartOptions.series[0].markLine) {
        // 警戒线前置配置
        chartOptions.series[0].markLine = warningOpt;
      }
      chartOptions.series[0].markLine.data.push(dateItem);
    });
  }
}

/**
 * 字体设置
 * @param options
 */
function fontSetting(options: H3.Chart.ChartOptions) {
  const defaultColor: string = "#304265";
  return options.fontColor ? options.fontColor : defaultColor;
}

/**
 * 处理大数据
 * @param chart
 * @param chartOptions
 * @param container
 * @param chartDatas
 * @param options
 */
function handleBigData(
  chart: any,
  chartOptions: any,
  container: HTMLDivElement,
  chartDatas: H3.Chart.ChartData | Array<H3.Chart.ChartData>,
  options: H3.Chart.ChartOptions
) {
  const isArray = chartDatas instanceof Array;
  let chartData: H3.Chart.ChartData;
  const otherChartData: H3.Chart.ChartData = isArray ? chartDatas[1] : null;
  // eslint-disable-next-line prefer-const
  chartData = isArray ? chartDatas[0] : chartDatas;
  chartData.data = chartOptions.dataset.source;

  if (chartData.dimensionLength > chartData.maxDimension) {
    container.style.position = "relative";
    const div = document.createElement("div");
    let scrollDirection = "X";
    // 判断是否为横向出现滚动条
    if (!options.direction || ["bottom", "top"].includes(options.direction)) {
      div.style.width = (chartData.dimensionLength / chartData.maxDimension) * 100 + "%";
      div.style.height = "1px";
      scrollDirection = "X";
    } else {
      div.style.height = (chartData.dimensionLength / chartData.maxDimension) * 100 + "%";
      div.style.width = "1px";
      scrollDirection = "Y";
    }
    div.style.position = "absolute";
    div.style.top = "0px";
    div.style.left = "0px";
    div.style.zIndex = "-1";
    container.appendChild(div);
    const warp = container.firstChild as HTMLDivElement;
    warp.style.position = "absolute";
    warp.style.top = "0px";
    warp.style.left = "0px";
    // 监听滚动条方向
    let pi: number = 0;
    container.addEventListener(
      "scroll",
      (e: Event) => {
        // 判断滚动条生成方向，X or Y方向
        if (scrollDirection == "X") {
          const left = container.scrollLeft;
          const width = (e.target as HTMLDivElement).clientWidth;
          warp.style.left = left + "px";
          pi = Math.round((left / width) * chartData.maxDimension);
          pi = isNaN(pi) ? 0 : pi;
          chartOptions.dataset.source = chartData.data.slice(pi, chartData.maxDimension + pi);
        } else {
          const top = container.scrollTop;
          const height = (e.target as HTMLDivElement).clientHeight;
          warp.style.top = top + "px";
          pi = Math.round((top / height) * chartData.maxDimension);
          pi = isNaN(pi) ? 0 : pi;
          chartOptions.dataset.source = chartData.data.slice(pi, chartData.maxDimension + pi);
        }
        chartData.index = pi;
        if (otherChartData) {
          otherChartData.index = pi;
        }
        chart.setOption(chartOptions);
      },
      false
    );
  }
  chartOptions.dataset.source = chartData.data.slice(0, chartData.maxDimension);
}

/**
 * 解析图表数据
 */
function analysisChartData(params: any, options: H3.Chart.ChartOptions) {
  const linkageList: any[] = [];
  const dimensionData: H3.Report.FilterFieldColumn = {
    field: options.dimension,
    formula: StringType.Equal,
    text: params.name === "未知" ? [""] : [params.name]
  };
  if (params.componentSubType === "scatter") {
    dimensionData.text = params.value.slice(-2, -1);
  }
  linkageList.push(dimensionData);
  // 判断是否有groupDimension，有则为2维，无则1维
  if (options.groupDimension) {
    const groupDimensionData = {
      field: options.groupDimension,
      formula: StringType.Equal,
      text: params.seriesName === "未知" ? [""] : [params.seriesName]
    };
    linkageList.push(groupDimensionData);
  }
  return linkageList;
}
/**
 * 获取图表数据
 */
function getMapJson(api: any, code: string | number) {
  // 不足六位，补齐0
  const key = makeStr(code, "0", 6);
  return new Promise<any>((resolve, reject) => {
    api
      .getMapJson(key)
      .then((res: Object) => {
        resolve(res);
      })
      .catch(res => {})
      .finally(() => {});
  });
}

/**
 * 根据指定地址，获取地址面包屑
 * @param list
 * @param target
 * @param top
 */
function getAddressLink(list, target, top) {
  top.level = 0;
  const his: any = [top]; // 缓存数据,减少循环
  let flag: boolean = false;
  const rev = (data, size, parent) => {
    for (let i = 0, length = data.length; i < length; i++) {
      if (flag) return;
      const item = data[i];
      item.level = parent.level + 1;
      if (item.code == size.code) {
        his.splice(parent.level + 1, his.length);
        his.push({ code: item.code, name: item.name });
        flag = true;
        return;
      } else {
        if (!!item.children) {
          his[item.level] = { code: item.code, name: item.name };
          rev(item.children, size, item);
        }
      }
    }
  };
  rev(list, target, top);
  return his;
}
/**
 * 检查图表全局点击事件是否需要处理--预留方法
 * @param params
 */
function checkChartClick(params) {
  let res: boolean = true;
  switch (params.componentType) {
    case "graphic":
      res = false;
      break;
    default:
      break;
  }
  return res;
}

/**
 *
 * 设置全局windos时间监听
 */
function newDataZoomEvent(uid: string, params: any) {
  const myEvent = new CustomEvent(`DatazoomChange-${uid}`, {
    detail: params
  });
  // 随后在对应的元素上触发该事件
  if (window.dispatchEvent) {
    window.dispatchEvent(myEvent);
  } else {
    (window as any).fireEvent(myEvent);
  }
}

// function () {}

/**
 * 节流
 */
// function

export {
  viewOptions, // 统一初始化配置方法
  legendSetting, // 图例设置
  metricRangeMatrixing, // 计算指标范围
  numericalFormatting, // 数值格式设置
  warningLine, // 警戒线设置
  fontSetting, // 字体设置
  handleBigData, // 处理大数据情况
  analysisChartData, // 解析图表数据
  getMaxMetricLength, // 获取最大指标的显示值
  getDataZoom, // echarts滚动条
  newDataZoomEvent, // 缩略轴变动时出发自定义事件
  getMapJson, // 获取地图Json
  getAddressLink, // 获取地图Json
  checkChartClick // 检查有效性
};

export default {
  viewOptions, // 统一初始化配置方法
  legendSetting, // 图例设置
  metricRangeMatrixing, // 计算指标范围
  numericalFormatting, // 数值格式设置
  warningLine, // 警戒线设置
  fontSetting, // 字体设置
  handleBigData, // 处理大数据情况
  analysisChartData, // 解析图表数据
  getMaxMetricLength, // 获取最大指标的显示值
  getDataZoom, // echarts滚动条
  newDataZoomEvent, // 缩略轴变动时出发自定义事件
  getMapJson, // 获取地图Json
  getAddressLink, // 获取地址链路
  checkChartClick // 检查有效性
};
