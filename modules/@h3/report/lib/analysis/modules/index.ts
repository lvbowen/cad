// 设计器模块的
import SwitchType from "./switch-type";
import Dimension from "./dimension";
import Legend from "./legend";
import Sort from "./sort";
import Theme from "./theme";
import Limit from "./limit";
import DataLabel from "./data-label";
import AxisX from "./axisX";
import MetricRange from "./metric-range";
import OrderNumber from "./order-number";
import FreezeHead from "./freeze-head";
import MultipleDataLabel from "./multiple-data-label";
import MultiMetricType from "./multi-metric-type";
import MetricGroup from "./metric-group";
import MapArea from "./map-area";
import MapDrill from "./map-drill";
import MapTheme from "./map-theme";
import MapDigitalSet from "./map-digital";

export default {
  H3MapArea: MapArea,
  H3MapDrill: MapDrill,
  H3MapTheme: MapTheme,
  H3MapDigitalSet: MapDigitalSet,
  H3ChartSwitch: SwitchType,
  H3Dimension: Dimension,
  H3Metric: Dimension,
  H3GroupDimension: Dimension,
  H3Sort: Sort,
  H3Theme: Theme,
  H3Legend: Legend,
  H3Limit: Limit,
  // 维度保留（饼图的数据保留）
  H3DimensionLimit: Limit,
  H3DataLabel: DataLabel,
  H3AxisX: AxisX,
  H3MetricRange: MetricRange,
  H3OrderNumber: OrderNumber,
  H3FreezeHead: FreezeHead,
  // 网格线
  H3SplitLine: DataLabel,
  // 坐标轴
  H3AxisYSet: DataLabel,
  // 纬度占比数值标签显示 用于饼图
  H3MultipleDataLabel: MultipleDataLabel,
  // 多轴图 的多种类型选择
  H3MultiMetricType: MultiMetricType,
  // 多轴图 的指标组合
  H3MetricGroup: MetricGroup
};
