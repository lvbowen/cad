declare namespace H3 {
  namespace Analysis {
    /**
     * 元件类型枚举
     */
    export enum ChartType {
      BAR = "bar", // 柱状图
      LINE = "line", // 折线图
      PILEBAR = "pileBar", // 堆叠柱状图
      STRIPE = "stripe", // 条形图
      AREA = "area", // 面积图
      PIE = "pie", // 饼图
      FUNNEL = "funnel", // 漏斗图
      RADAR = "radar", // 雷达图
      TABLE = "table", // 透视图
      LIST = "list", // 明细表
      CARD = "card", // 指标图
      BIAX = "biax", // 双轴图
      SCATTER = "scatter", // 散点图（气泡图）
      MAP = "map" //地图
    }

    /**
     * 图表设置模型枚举
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
      DataZoom = "dataZoom", // 缩略轴
      MapTheme = "mapTheme", // 地图配色
      MapArea = "mapArea", // 地图显示范围
      MapDrill = "mapDrill", // 地图钻取范围
      MapDigitalSet = "mapDigitalSet" //地图数值设置
    }
    /**
     * 展示池模块基础能力
     */
    interface ViewBase {
      // 是否可新增
      add?: boolean;
      // 工具
      tool?: Array<string>;
      // 修改名称
      rename?: boolean;
    }
    /**
     * 公共模块
     */
    interface PublicView extends ViewBase {}
    /**
     * 个人模块
     */
    interface PersionView extends ViewBase {}

    /**
     * 图表模块
     */
    interface ChartController {
      // 柱状
      bar?: ChartAuthority;
      // 折线
      line?: ChartAuthority;
      // 堆叠柱状图
      PILEBAR?: ChartAuthority;
      // 条形图
      STRIPE?: ChartAuthority;
      // 面积图
      AREA?: ChartAuthority;
      // 饼图
      PIE?: ChartAuthority;
      // 漏斗图
      FUNNEL?: ChartAuthority;
      // 雷达图
      RADAR?: ChartAuthority;
      // 双轴图
      BIAX?: ChartAuthority;
      // 透视图
      TABLE?: ChartAuthority;
      // 散点图（气泡图）
      SCATTER?: ChartAuthority;
      // 指标图
      CARD?: ChartAuthority;
      // 地图
      MAP?: ChartAuthority;
    }

    /**
     * 设计器模块
     */
    interface Design {
      // swipper
      // edit
      // 工具
      tool?: ToolBar;
    }

    /**
     * 公共工具栏
     */
    interface ToolBar {
      // 按钮配置
      buttonArray: Array<"edit" | "filter" | "delete">;
      // 只能是方向
      direction?: string;
    }

    /**
     * 图表权限
     */
    interface ChartAuthority {
      // 新增
      add: boolean;
      // 更改
      update: boolean;
      // 模块权限
      modules: ChartModules;
    }
    /**
     * 图表模块权限
     */
    interface ChartModules {
      // 图表切换
      [ModuleType.ChartSwitch]?: any;
      // 纬度
      [ModuleType.Metric]?: MetricModule;
      // 指标
      [ModuleType.Dimension]?: DimensionModule;
      // 维度组
      [ModuleType.GroupDimension]?: GroupDimensionModule;
      // 指标组
      [ModuleType.MetricGroup]?: MetricGroupModule;
      // 排序
      [ModuleType.Sort]?: SortModule;
      // 配色
      [ModuleType.Theme]?: ThemeModule;
      // 图例
      [ModuleType.Legend]?: LegendModule;
      // 数据保留
      [ModuleType.Limit]?: LimitModule;
      // 数值标签
      [ModuleType.DataLabel]?: DataLabelModule;
      // x轴 组标轴 && x轴 文字方向
      [ModuleType.AxisX]?: AxisXModule;
      // y轴 最大值 && y轴 最小值
      [ModuleType.MetricRange]?: MetricRangeModule;
      // 坐标轴
      [ModuleType.AxisYSet]?: AxisYSetModule;
      // 网格线
      [ModuleType.SplitLine]?: SplitLineModule;
      // 序号
      [ModuleType.OrderNumber]?: OrderNumberModule;
      // 冻结行维度 && 冻结列纬度
      [ModuleType.FreezeHead]?: FreezeHeadModule;
      // 多个数据标签设置 饼图
      [ModuleType.MultipleDataLabel]?: MultipleDataLabelModule;
      // 多轴图图表类型
      [ModuleType.MultiMetricType]?: MultiMetricTypeModule;

      [ModuleType.DimensionLimit]?: DimensionLimitModule;
      // 缩略轴类型
      [ModuleType.DataZoom]?: DataZoomModule;
      // 地图配色
      [ModuleType.MapTheme]?: MapThemeModule;
      // 地图显示范围
      [ModuleType.MapArea]?: MapAreaModule;
      // 地图钻取范围
      [ModuleType.MapDrill]?: MapDrillModule;
      // 地图数值设置
      [ModuleType.MapDigitalSet]?: MapDigitalSetModule;
    }

    /**
     * 模块群类型
     */
    interface ModuleGroup {
      title: string;
      display: boolean;
      isGroup: boolean;
      childModules: ChartModules;
    }

    interface ChartModulesGroups extends ChartModules {}

    /**
     * 模块基础配置
     */
    interface ModulesBase<T> {
      // 是否显示
      display?: boolean;
      // 提示语
      tip?: string;
      // 默认值
      default?: T;
      // 父集合key值 目前所有的模块都放在 data 和styles 目录下
      parentNodeKey?: string;
    }

    /**
     * 纬度指标模型
     */
    interface ChartSwitchModule extends H3.ReportModules.ChartSwitch, ModulesBase<string> {
      disabled?: Array<ChartType>;
    }

    /**
     * 纬度指标模型
     */
    interface MetricModule
      extends H3.ReportModules.Metric,
        ModulesBase<Array<H3.Report.FieldColumn>> {}
    /**
     * 纬度指标模型
     */
    interface DimensionModule
      extends H3.ReportModules.Dimension,
        ModulesBase<Array<H3.Report.FieldColumn>> {}
    /**
     * 纬度指标模型
     */
    interface GroupDimensionModule
      extends H3.ReportModules.GroupDimension,
        ModulesBase<Array<H3.Report.FieldColumn>> {}

    /**
     * 指标组模型
     */
    interface MetricGroupModule
      extends H3.ReportModules.MetricGroup,
        ModulesBase<Array<Array<H3.Report.FieldColumn>>> {}

    /**
     * 图例模块
     */
    interface LegendModule extends H3.ReportModules.Legend, ModulesBase<H3.Report.Legend> {}

    /**
     * 维度数据保留
     */
    interface DimensionLimitModule
      extends H3.ReportModules.DimensionLimit,
        ModulesBase<number | null> {}
    /**
     * 序号模块
     */
    interface OrderNumberModule
      extends H3.ReportModules.OrderNumber,
        ModulesBase<H3.Report.OrderNumber> {}
    /**
     * 配色模块
     */
    interface ThemeModule extends H3.ReportModules.Theme, ModulesBase<H3.Report.Theme> {}
    /**
     * 地图配色模块
     */
    interface MapThemeModule extends H3.ReportModules.MapTheme, ModulesBase<H3.Report.MapTheme> {}

    interface MapAreaModule extends H3.ReportModules.MapArea, ModulesBase<H3.Report.MapArea> {}

    interface MapDrillModule extends H3.ReportModules.MapDrill, ModulesBase<H3.Report.MapDrill> {}

    interface MapDigitalSetModule
      extends H3.ReportModules.MapDigitalSet,
        ModulesBase<H3.Report.MapDigitalSet> {
      dimensionTitle: string;
      metricTitle: string;
    }

    /**
     * 数据保留多少
     */
    interface LimitModule extends H3.ReportModules.Limit, ModulesBase<number | null> {}
    /**
     * 数据标签是否显示
     */
    interface DataLabelModule extends H3.ReportModules.DataLabel, ModulesBase<boolean | null> {}
    /**
     * Y坐标轴设置（显示隐藏）
     */
    interface AxisYSetModule extends H3.ReportModules.AxisYSet, ModulesBase<boolean | null> {}
    /**
     * X轴相关设置
     */
    interface AxisXModule extends H3.ReportModules.AxisX, ModulesBase<H3.Report.AxisX> {
      axisXTitle?: string;
      directionTitle?: string;
    }

    /**
     * 缩略轴DataZoomModule
     */
    interface DataZoomModule extends H3.ReportModules.DataZoom, ModulesBase<H3.Report.DataZoom> {}
    /**
     * 最大值最小值
     */
    interface MetricRangeModule
      extends H3.ReportModules.MetricRange,
        ModulesBase<H3.Report.MetricRange> {
      maxTitle?: string;
      minTitle?: string;
    }
    /**
     * 最大值最小值
     */
    interface MultipleDataLabelModule
      extends H3.ReportModules.MultipleDataLabel,
        ModulesBase<H3.Report.MultipleDataLabel> {
      dimensionLabelTitle?: string;
      metricLabelTitle?: string;
      percentLabelTitle?: string;
    }
    /**
     * 最大值最小值
     */
    interface FreezeHeadModule
      extends H3.ReportModules.FreezeHead,
        ModulesBase<H3.Report.FreezeHead> {
      rowTitle?: string;
      columnTitle?: string;
    }
    /**
     * 排序
     */
    interface SortModule extends H3.ReportModules.Sort, ModulesBase<Array<H3.Report.FieldColumn>> {}

    /**
     * y轴网格线
     */
    interface SplitLineModule extends H3.ReportModules.SplitLine, ModulesBase<boolean | null> {}

    /**
     * 多轴图多种数据类型
     */
    interface MultiMetricTypeModule
      extends H3.ReportModules.MultiMetricType,
        ModulesBase<Array<"bar" | "line" | "area" | "pileBar"> | null> {}

    /**
     * 访问参数模型
     */
    interface AccessCondition {
      config: any;
      corpId: String;
      ownerId: String;
      dataSourceId: String;
    }
    /**
     * 回调参数
     */
    interface OptionCallbacks {
      closeCallback: null | Function;
      addCallback: null | Function;
      backCallback: null | Function;
      editCallback: null | Function;
      detailCallback: null | Function;
    }
    /**
     * 图表个人信息
     */
    interface ChartInfo {
      chartId?: string;
      content?: any; // 排序信息
      viewStatus?: 0 | 1; //0表示没查看过，1表示查看过
      updateDate?: string; // 更新时间
      updateUser?: string;
      updateUserName?: string; // 更新人
    }
  }
}
