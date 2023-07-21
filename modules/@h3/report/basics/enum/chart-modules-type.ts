/**
 * 图表类型枚举
 */

export enum ModuleType {
  ChartSwitch = "chartSwitch", // 图表切换
  MultiMetricType = "multiMetricType",
  GroupDimension = "groupDimension", // 维度(列维度)
  Dimension = "dimension", // 维度(行维度)
  Metric = "metric", // 指标
  MetricGroup = "metricGroup", // 多个指标
  Sort = "sort", // 排序
  Limit = "limit", // 数据保留多少
  Filter = "filter", // 过滤
  DataLabel = "dataLabel", // 数值显示/数值标签
  Theme = "theme", // 图表配色
  OrderNumber = "orderNumber", // 序号相关
  FreezeHead = "freezeHead", // 冻结相关
  Legend = "legend", // 图例
  AxisX = "axisX", // X轴相关
  MultipleDataLabel = "multipleDataLabel", // 多种类数值显示
  MetricRange = "metricRange", // 指标范围（Y轴最大值最小值）
  AxisYSet = "axisYSet", // Y轴相关(目前就Y轴显示隐藏)
  axisSet = "axisSet", // 坐标轴相关(目前就显示隐藏坐标轴功能，X和Y轴同时设置)
  SplitLine = "splitLine", //网格线
  DimensionLimit = "dimensionLimit", // 维度保留功能 （饼图的数据保留）
  DataZoom = "dataZoom", // 缩略轴功能
  MapTheme = "mapTheme", // 地图配色
  MapArea = "mapArea", // 地图显示范围
  MapDrill = "mapDrill", // 地图钻取设置
  MapDigitalSet = "mapDigitalSet" //数值标签显示设置

  // 新统计分析新增 Y轴坐标轴相关 以及网格线功能 新增时补齐
}
