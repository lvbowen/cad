import { ElementType } from "@h3/report/basics/enum/chart-type";
import { ModuleType } from "@h3/report/basics/enum/chart-modules-type";

/**
 * 处理模块的数据联动
 *   @param chart  change之前未改变的chart
 *   @param newChart
 *   @param key
 *   @param value
 */
export const handleLinkage = (
  chart: H3.Report.Chart,
  newChart: H3.Report.Chart,
  key: string,
  value: any
) => {
  switch (key) {
    case "dimension":
    case "metric":
    case "groupDimension":
    case "metricGroup":
      linkageSort(chart, newChart, key, value);
      break;
    case "type":
      linkageSwitchMap(chart, newChart, key, value);
      linkageSort(chart, newChart, key, value);
      break;
    case "mapArea":
      linkageDrill(chart, newChart);
    default:
      break;
  }
};
/**
 *  钻取联动
 *  当显示范围为全国时，钻取范围可选择到市区，当显示范围为省时，钻取范围可选择到区
 *  @param oldChart
 *  @param newChart
 */
const linkageDrill = (oldChart: H3.Report.Chart, newChart: H3.Report.Chart) => {
  if (
    newChart &&
    newChart.data &&
    newChart.styles &&
    newChart.data.mapArea &&
    newChart.styles.mapDrill
  ) {
    if (
      newChart.data.mapArea.area === "province" &&
      newChart.styles.mapDrill.drill === "province"
    ) {
      newChart.styles.mapDrill.drill = "city";
    }
    if (newChart.data.mapArea.area === "city" && newChart.styles.mapDrill.drill !== "disabled") {
      newChart.styles.mapDrill.drill = "disabled";
    }
  }
};
/**
 *  切换地图联动
 *  切换地图，清空维度
 *  @param oldChart
 *  @param newChart
 */
const linkageSwitchMap = (oldChart: H3.Report.Chart, newChart: H3.Report.Chart, key, value) => {
  if (newChart.type === ElementType.MAP || oldChart.type === ElementType.MAP) {
    newChart.data.dimension.splice(0, newChart.data.dimension.length);
  }
};

/**
 *  排序联动
 *  @param oldChart
 *  @param newChart
 *  @param type
 *  @param fields
 */
const linkageSort = (oldChart: H3.Report.Chart, newChart: H3.Report.Chart, type, fields) => {
  if (newChart.data.sort) {
    // 排序字段
    let sortList: Array<H3.Report.FieldColumn> = [];
    // 上一次的排序字段
    const oldSortList: Array<H3.Report.FieldColumn> =
      oldChart.data && oldChart.data.sort ? oldChart.data.sort : [];

    const oldFieldsLength = getFieldsLength(oldChart);
    const newFieldsLength = getFieldsLength(newChart);
    // 比较差值
    if (oldFieldsLength > newFieldsLength) {
      const selectFields = getSelectFields(newChart);
      selectFields.forEach((field: H3.Report.FieldColumn) => {
        const tmpSort = oldSortList.find((sortItem: H3.Report.FieldColumn) => {
          return (
            sortItem.field === field.field &&
            sortItem.schemaCode === field.schemaCode &&
            sortItem.uid === field.uid
          );
        });
        if (tmpSort) {
          // 添加已排序字段
          sortList.push(tmpSort);
        }
      });
    } else if (oldFieldsLength === newFieldsLength) {
      sortList = generateDefaultSort(newChart);
    } else {
      sortList = generateDefaultSort(newChart);
      // let oldDefaultSortList = generateDefaultSort(oldChart);
      // let oldLength = 0;
      // oldSortList.forEach(item => {
      //   oldDefaultSortList.forEach(oldField => {
      //     if (item.options.order === oldField.options.order) {
      //       oldLength += 1;
      //     }
      //   });
      // });
      // //  旧默认排序与旧排序字段排序无有更改，比较行为，若更改则按旧排序，否则生成新默认排序
      // if (oldLength === oldDefaultSortList.length && newChart.type !== ElementType.TABLE) {
      //   sortList = generateDefaultSort(newChart);
      //   newChart.data.sort.splice(0, newChart.data.sort.length, ...sortList);
      // }
    }
    newChart.data.sort.splice(0, newChart.data.sort.length, ...sortList);
  }
};

export const getFieldsLength = (chart: H3.Report.Chart) => {
  const groupDimension: Array<H3.Report.FieldColumn> = chart.data.groupDimension || [];
  const dimension: Array<H3.Report.FieldColumn> = chart.data.dimension || [];
  const metric: Array<H3.Report.FieldColumn> = chart.data.metric || [];
  let biaxMetric: Array<H3.Report.FieldColumn> = [];
  if (chart.type === ElementType.BIAX && chart.data.metricGroup.length) {
    biaxMetric = [...chart.data.metricGroup[0], ...chart.data.metricGroup[1]];
  }
  return [...dimension, ...groupDimension, ...metric, ...biaxMetric].length;
};

export const getSelectFields = (chart: H3.Report.Chart) => {
  let selectFields: Array<any> = [];
  const tmpList: Array<string> = [
    ElementType.BAR,
    ElementType.LINE,
    ElementType.AREA,
    ElementType.STRIPE,
    ElementType.RADAR,
    ElementType.PILEBAR,
    ElementType.BIAX
  ];
  const groupDimension: Array<H3.Report.FieldColumn> = chart.data.groupDimension || [];
  const dimension: Array<H3.Report.FieldColumn> = chart.data.dimension || [];
  const metric: Array<H3.Report.FieldColumn> = chart.data.metric || [];
  let biaxMetric: Array<H3.Report.FieldColumn> = [];
  if (chart.type === ElementType.BIAX && chart.data.metricGroup.length) {
    biaxMetric = [...chart.data.metricGroup[0], ...chart.data.metricGroup[1]];
  }
  // 上述7个图表 + 2维1标，排序只显示维度字段
  if (dimension.length === 2 && tmpList.includes(chart.type)) {
    selectFields = [...dimension, ...groupDimension];
  } else {
    if (chart.type === ElementType.TABLE && !dimension.length) {
      // 判断是否存在行维度，如果不存在，则排序数据中不显示指标字段
      selectFields = [...groupDimension];
    } else {
      selectFields = [...dimension, ...groupDimension, ...metric, ...biaxMetric];
    }
  }
  // 过滤空字段
  return selectFields;
};

/**
 * 生成默认排序
 * 1.柱状图、折线图、条形图、堆叠柱状图、面积图、雷达图
 *   (1)1维1指标或1维多指标：若维度字段为日期字段，则默认排序为维度升序；若维度字段不为日期字段，则默认排序为第一个指标降序；
 *   (2)2维1指标：两个维度升序
 *2.饼图、指标图: 1维1指标-指标降序
 *3.透视表:默认不排序
 *4.漏斗图:默认为指标降序 且不可调整（显示指标降序，但不可调整，提示：漏斗图暂不支持自定义排序）
 *5.双轴图:1维：若维度字段为日期字段，则默认排序为维度升序；若维度字段不为日期字段，则默认排序为左
 *
 */
export const generateDefaultSort = chart => {
  const deepChart = JSON.parse(JSON.stringify(chart));
  let metric: Array<H3.Report.FieldColumn> = deepChart.data.metric || [];
  const dimension: Array<H3.Report.FieldColumn> = deepChart.data.dimension || [];
  let biaxMetric: Array<H3.Report.FieldColumn> = [];
  if (deepChart.type === ElementType.BIAX && deepChart.data.metricGroup) {
    deepChart.data.metricGroup.forEach(m => {
      biaxMetric = [...biaxMetric, ...m];
    });
    metric = biaxMetric;
  }
  const defaultSort: Array<H3.Report.FieldColumn> = [];
  const tmpList: Array<string> = [
    ElementType.BAR,
    ElementType.LINE,
    ElementType.AREA,
    ElementType.STRIPE,
    ElementType.RADAR,
    ElementType.PILEBAR,
    ElementType.BIAX
  ];
  // 上述7个图表 + 2维1标，排序只显示维度字段
  if (dimension.length === 2 && tmpList.includes(chart.type)) {
    dimension.forEach(item => {
      item.options.order = "asc";
      defaultSort.push(item);
    });
  } else {
    if (tmpList.includes(chart.type) && dimension[0]) {
      // 1维1标、1维多标显示全部字段
      if (dimension[0].type === "date") {
        dimension[0].options.order = "asc";
        defaultSort.push(dimension[0]);
      } else if (metric[0] && metric[0].options) {
        metric[0].options.order = "desc";
        defaultSort.push(metric[0]);
      }
    } else if (
      [ElementType.FUNNEL, ElementType.PIE, ElementType.CARD].includes(chart.type) &&
      metric[0]
    ) {
      metric[0].options.order = "desc";
      defaultSort.push(metric[0]);
    }
  }
  return defaultSort;
};

export default handleLinkage;
