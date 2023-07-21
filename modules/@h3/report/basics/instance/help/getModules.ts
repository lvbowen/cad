import { ElementType } from "@h3/report/basics/enum/chart-type";
import { ModuleType } from "@h3/report/basics/enum/chart-modules-type";
import { anaiysisColors } from "@h3/report/basics/enum/colors";
import { ToolsBarType } from "@h3/report/basics/enum/element-tools";
import { getColorByTheme } from "@h3/report/basics/enum/map";

/**
 * 获取基础图表类型的配置项
 * @param chartType 图表类型
 */
export const getBaseModules = (
  chartType: ElementType = ElementType.BAR
): H3.Analysis.ChartModules => {
  const moduleOptions = JSON.parse(JSON.stringify(BaseModules));
  const realType = getMainType(chartType);
  chartModulesName[realType].forEach(m => {
    if (defaultOptions[m]) {
      moduleOptions[m] = JSON.parse(JSON.stringify(defaultOptions[m]));
    }
  });
  switch (realType) {
    // 柱状图 折线图
    case ElementType.BAR:
    case ElementType.LINE:
      break;
    // 饼图
    case ElementType.PIE:
      // moduleOptions[ModuleType.Legend].default ={}
      break;
    // 雷达图
    case ElementType.RADAR:
      break;
    // 透视图
    case ElementType.TABLE:
      moduleOptions[ModuleType.Dimension].title = "行维度";
      moduleOptions[ModuleType.Dimension].tip = "【行维度】是对透视表行数据做分类的依据";
      break;
    // 指标图
    case ElementType.CARD:
      const dataChange = (chart: H3.Report.Chart, chartModules) => {
        if (chart.data.dimension.length === 0) {
          if (chartModules[ModuleType.Limit]) {
            chartModules[ModuleType.Limit].display = false;
          }
          if (chartModules[ModuleType.Limit]) {
            chartModules[ModuleType.Sort].display = false;
          }
        } else {
          chartModules[ModuleType.Limit].display = true;
          chartModules[ModuleType.Sort].display = true;
        }
      };
      moduleOptions[ModuleType.Dimension].change = dataChange;
      moduleOptions[ModuleType.Metric].change = dataChange;
      break;
    // 漏斗图
    case ElementType.FUNNEL:
      moduleOptions[ModuleType.Sort].display = false;
      break;
    // 气泡图
    case ElementType.SCATTER:
      break;
    // 双轴图
    case ElementType.BIAX:
      break;

    case ElementType.MAP:
      moduleOptions[ModuleType.Dimension].supportedTypes = ["address"];
      // console.log("mapOptions:", moduleOptions[ModuleType.ChartSwitch]);
      break;

    default:
      break;
  }
  return moduleOptions;
};

/**
 * 各个图表所拥有的模块
 * 格式说明:
 */
const chartModulesName: { [key: string]: Array<ModuleType> } = {
  [ElementType.BAR]: [
    ModuleType.ChartSwitch,
    ModuleType.Dimension,
    ModuleType.Metric,
    ModuleType.Sort,
    ModuleType.Theme,
    ModuleType.Legend,
    ModuleType.Limit,
    ModuleType.DataLabel,
    ModuleType.AxisX,
    ModuleType.MetricRange,
    ModuleType.AxisYSet,
    ModuleType.SplitLine,
    ModuleType.DataZoom
  ],
  [ElementType.LINE]: [
    ModuleType.ChartSwitch,
    ModuleType.Dimension,
    ModuleType.Metric,
    ModuleType.Sort,
    ModuleType.Theme,
    ModuleType.Legend,
    ModuleType.Limit,
    ModuleType.DataLabel,
    ModuleType.AxisX,
    ModuleType.MetricRange,
    ModuleType.AxisYSet,
    ModuleType.SplitLine,
    ModuleType.DataZoom
  ],
  [ElementType.PIE]: [
    ModuleType.ChartSwitch,
    ModuleType.Dimension,
    ModuleType.Metric,
    ModuleType.Sort,
    ModuleType.Theme,
    ModuleType.Legend,
    ModuleType.DimensionLimit,
    ModuleType.MultipleDataLabel
  ],
  [ElementType.RADAR]: [
    ModuleType.ChartSwitch,
    ModuleType.Dimension,
    ModuleType.Metric,
    ModuleType.Sort,
    ModuleType.Theme,
    ModuleType.Legend,
    ModuleType.Limit,
    ModuleType.DataLabel,
    ModuleType.MetricRange
  ],
  [ElementType.TABLE]: [
    ModuleType.ChartSwitch,
    ModuleType.Dimension,
    ModuleType.GroupDimension,
    ModuleType.Metric,
    ModuleType.Sort,
    ModuleType.OrderNumber,
    ModuleType.FreezeHead
  ],
  [ElementType.CARD]: [
    ModuleType.ChartSwitch,
    ModuleType.Dimension,
    ModuleType.Metric,
    ModuleType.Sort,
    ModuleType.Limit
  ],
  [ElementType.FUNNEL]: [
    ModuleType.ChartSwitch,
    ModuleType.Dimension,
    ModuleType.Metric,
    ModuleType.Theme,
    ModuleType.Sort,
    ModuleType.Legend,
    ModuleType.Limit,
    ModuleType.DataLabel
  ],
  [ElementType.SCATTER]: [
    ModuleType.ChartSwitch,
    ModuleType.Dimension,
    ModuleType.Metric,
    ModuleType.Theme,
    ModuleType.Legend,
    ModuleType.AxisYSet,
    ModuleType.SplitLine
  ],
  [ElementType.BIAX]: [
    ModuleType.ChartSwitch,
    ModuleType.MultiMetricType,
    ModuleType.Dimension,
    ModuleType.MetricGroup,
    ModuleType.Sort,
    ModuleType.Theme,
    ModuleType.Legend,
    ModuleType.AxisX,
    ModuleType.AxisYSet,
    ModuleType.SplitLine,
    ModuleType.DataZoom
  ],
  [ElementType.MAP]: [
    ModuleType.ChartSwitch,
    ModuleType.Dimension,
    ModuleType.Metric,
    ModuleType.MapTheme,
    ModuleType.MapArea,
    ModuleType.MapDrill,
    ModuleType.MapDigitalSet
  ]
};
/**
 * 初始化示例
 */
const BaseModules: H3.Analysis.ChartModules | any = {
  chartSwitch: {
    display: true
  }
};

/**
 * 获取模块组
 */
const getModulesGroup = (title, childModules) => {
  return {
    title: title,
    display: true,
    isGroup: true,
    childModules: childModules
  };
};

/***
 * 获取按照模块分组以后的功能模块模块群
 */
export const getChartModulesGroups = (modules: H3.Analysis.ChartModules) => {
  // todo 外抛此配置
  const groupOtions = [
    {
      title: "样式配置",
      key: "styleOption",
      childModules: [
        ModuleType.Theme,
        ModuleType.Legend,
        ModuleType.Limit,
        ModuleType.DataLabel,
        ModuleType.MultipleDataLabel
      ]
    },
    {
      title: "X轴",
      key: "axisXOption",
      childModules: [ModuleType.AxisX]
    },
    {
      title: "Y轴",
      key: "axisYOption",
      childModules: [ModuleType.MetricRange, ModuleType.AxisYSet, ModuleType.SplitLine]
    },
    {
      title: "数值标签显示设置",
      key: "mapDigitalDisplaySet",
      childModules: [ModuleType.MapDigitalSet]
    }
  ];

  const formateGroupModules:
    | { [key: string]: H3.Analysis.ModuleGroup }
    | H3.Analysis.ChartModules = JSON.parse(JSON.stringify(modules));

  groupOtions.forEach(g => {
    if (g.childModules) {
      const childModules: H3.Analysis.ChartModules = {};
      g.childModules.forEach(m => {
        if (formateGroupModules[m]) {
          childModules[m] = formateGroupModules[m];
          delete formateGroupModules[m];
        }
      });
      if (Object.keys(childModules).length > 0) {
        formateGroupModules[g.key] = getModulesGroup(g.title, childModules);
      }
    }
  });

  return formateGroupModules;
};
/**
 * 每个功能模块的默认配置值
 */
export const defaultOptions: H3.Analysis.ChartModules = {
  [ModuleType.ChartSwitch]: {
    display: true,
    title: "图表类型",
    default: ElementType.BAR,
    parentNodeKey: "styles",
    disabled: []
  },
  [ModuleType.Dimension]: {
    display: true,
    title: "维度",
    tip: "【维度】是对数据做分类的依据",
    max: 20, // 最大行数
    min: 0, // 最小行数
    supportedTypes: ["string", "date"], // 支持字段类型
    disabled: false, // 是否可选
    default: [],
    parentNodeKey: "data"
  },
  [ModuleType.GroupDimension]: {
    display: true,
    title: "列维度",
    tip: "【列维度】是对透视表列数据做分类的依据",
    max: 20, // 最大行数
    min: 0, // 最小行数
    supportedTypes: ["string", "date"], // 支持字段类型
    disabled: false, // 是否可选
    default: [],
    parentNodeKey: "data"
  },
  [ModuleType.Metric]: {
    display: true,
    title: "指标",
    tip: "【指标】是要统计的数据，会根据【维度】中设置的分组方式进行汇总计算",
    max: 20, // 最大行数
    min: 0, // 最小行数
    supportedTypes: ["string", "number", "date"], // 支持字段类型
    disabled: false, // 是否可选
    default: [],
    parentNodeKey: "data"
  },
  [ModuleType.MetricGroup]: {
    display: true,
    title: "指标组合",
    tip: "指标描述",
    max: 2, // 最大指标组数量
    data: [
      {
        display: true,
        title: "指标（左）",
        max: 20, // 最大数
        min: 0, // 最小数
        supportedTypes: ["string", "number", "date"]
      },
      {
        display: true,
        title: "指标（右）",
        max: 20, // 最大数
        min: 0, // 最小数
        supportedTypes: ["string", "number", "date"]
      }
    ],
    default: [[], []],
    parentNodeKey: "data"
  },
  [ModuleType.Sort]: {
    display: true,
    title: "排序",
    tip: "排序描述",
    max: 20, // 最大行数
    min: 0, // 最小行数
    moduleTypes: ["dimension", "groupDimension", "metric"],
    supportedTypes: ["string", "number", "date"], // 支持字段类型
    disabled: false, // 是否可选
    default: [],
    parentNodeKey: "data"
  },
  [ModuleType.Theme]: {
    display: true,
    title: "配色",
    default: anaiysisColors[0],
    parentNodeKey: "styles"
  },
  [ModuleType.Legend]: {
    display: true,
    title: "图例",
    checked: true,
    position: "bottom",
    parentNodeKey: "styles",
    default: {
      checked: true,
      position: "bottom"
    }
  },
  [ModuleType.Limit]: {
    display: true,
    title: "数据保留",
    default: null,
    parentNodeKey: "data"
  },
  [ModuleType.DimensionLimit]: {
    display: true,
    title: "数据保留",
    default: null,
    parentNodeKey: "styles"
  },
  [ModuleType.DataLabel]: {
    display: true,
    title: "数值标签",
    default: true,
    parentNodeKey: "styles"
  },
  [ModuleType.AxisX]: {
    display: true,
    title: "X轴",
    axisXTitle: "坐标轴",
    directionTitle: "文字方向",
    parentNodeKey: "styles",
    default: {
      displayAxisX: true, // 显示坐标轴
      displayLabel: true, // 显示标签
      direction: "crosswise" // 方向
    }
  },
  [ModuleType.MetricRange]: {
    display: true,
    title: "y轴最大值最小值",
    maxTitle: "最大值",
    minTitle: "最小值",
    parentNodeKey: "styles",
    default: {
      max: null, // 最大值
      min: null // 最小值
    }
  },
  [ModuleType.OrderNumber]: {
    display: true,
    title: "序号",
    displayOrderName: false,
    checked: true,
    parentNodeKey: "styles",
    default: {
      checked: true, // 是否勾选
      orderName: "序号" // 序号别名
    }
  },
  [ModuleType.FreezeHead]: {
    display: true,
    title: "冻结相关",
    rowTitle: "冻结行维度",
    columnTitle: "冻结列维度",
    displayRow: true,
    displayColumn: true,
    displayColumnNumber: false,
    parentNodeKey: "styles",
    default: {
      row: true, // 行冻结
      column: true, // 列冻结
      columnNumber: 0 // 列冻结数量
    }
  },
  [ModuleType.MultipleDataLabel]: {
    display: true,
    title: "多种数值格式设置",
    dimensionLabelTitle: "维度标签",
    metricLabelTitle: "数值标签",
    percentLabelTitle: "占比标签",
    parentNodeKey: "styles",
    default: {
      dimensionLabel: true,
      metricLabel: true,
      percentLabel: true
    }
  },
  [ModuleType.SplitLine]: {
    display: true,
    title: "网格线",
    default: true,
    parentNodeKey: "styles"
  },
  [ModuleType.AxisYSet]: {
    display: true,
    title: "坐标轴",
    default: true,
    parentNodeKey: "styles"
  },
  [ModuleType.MultiMetricType]: {
    display: true,
    title: "多种数据类型",
    default: ["bar", "line"],
    parentNodeKey: "styles",
    data: [
      {
        title: "左轴",
        options: ["bar", "line", "area", "pileBar"]
      },
      {
        title: "右轴",
        options: ["bar", "line", "area", "pileBar"]
      }
    ]
  },
  [ModuleType.DataZoom]: {
    display: false,
    title: "是否显示缩略轴",
    default: {
      show: true,
      start: 0,
      end: 100
    },
    parentNodeKey: "styles"
  },

  [ModuleType.MapTheme]: {
    display: true,
    title: "地图配色",
    default: {
      theme: "pro"
    },
    parentNodeKey: "styles"
  },

  [ModuleType.MapArea]: {
    display: true,
    title: "显示范围",
    default: {
      area: "all"
    },
    parentNodeKey: "data"
  },

  [ModuleType.MapDrill]: {
    display: true,
    title: "地图钻取",
    default: {
      drill: "province"
    },
    parentNodeKey: "styles"
  },

  [ModuleType.MapDigitalSet]: {
    display: true,
    title: "数值标签显示设置",
    dimensionTitle: "显示维度值",
    metricTitle: "显示指标值",
    default: {
      displayDimension: true,
      displayMetric: true
    },
    parentNodeKey: "styles"
  }
};
/**
 * 数据限制
 * [[[0],[1]],[[2],[3]]] 表示0维0指标及0维1指标，1维0指标及1维1指标
 */
export const chartDMLimit = [
  [
    [
      ElementType.BAR,
      ElementType.LINE,
      ElementType.PIE,
      ElementType.RADAR,
      ElementType.TABLE,
      ElementType.CARD,
      ElementType.FUNNEL,
      ElementType.SCATTER,
      ElementType.BIAX,
      ElementType.MAP
    ],
    [
      ElementType.BAR,
      ElementType.LINE,
      ElementType.PIE,
      ElementType.RADAR,
      ElementType.TABLE,
      ElementType.CARD,
      ElementType.FUNNEL,
      ElementType.SCATTER,
      ElementType.BIAX,
      ElementType.MAP
    ],
    [
      ElementType.BAR,
      ElementType.LINE,
      ElementType.RADAR,
      ElementType.TABLE,
      ElementType.SCATTER,
      ElementType.BIAX
    ],
    [
      ElementType.BAR,
      ElementType.LINE,
      ElementType.RADAR,
      ElementType.TABLE,
      ElementType.SCATTER,
      ElementType.BIAX,
      ElementType.MAP
    ]
  ],
  [
    [
      ElementType.BAR,
      ElementType.LINE,
      ElementType.PIE,
      ElementType.RADAR,
      ElementType.TABLE,
      ElementType.CARD,
      ElementType.FUNNEL,
      ElementType.SCATTER,
      ElementType.BIAX,
      ElementType.MAP
    ],
    [
      ElementType.BAR,
      ElementType.LINE,
      ElementType.PIE,
      ElementType.RADAR,
      ElementType.TABLE,
      ElementType.CARD,
      ElementType.FUNNEL,
      ElementType.SCATTER,
      ElementType.BIAX,
      ElementType.MAP
    ],
    [
      ElementType.BAR,
      ElementType.LINE,
      ElementType.RADAR,
      ElementType.TABLE,
      ElementType.SCATTER,
      ElementType.BIAX
    ],
    [
      ElementType.BAR,
      ElementType.LINE,
      ElementType.RADAR,
      ElementType.TABLE,
      ElementType.SCATTER,
      ElementType.BIAX
    ],
    [ElementType.BAR, ElementType.LINE, ElementType.RADAR, ElementType.TABLE, ElementType.BIAX]
  ],
  [
    [
      ElementType.BAR,
      ElementType.LINE,
      ElementType.RADAR,
      ElementType.TABLE,
      ElementType.SCATTER,
      ElementType.BIAX
    ],
    [
      ElementType.BAR,
      ElementType.LINE,
      ElementType.RADAR,
      ElementType.TABLE,
      ElementType.SCATTER,
      ElementType.BIAX
    ],
    [ElementType.TABLE, ElementType.SCATTER],
    [ElementType.TABLE, ElementType.SCATTER],
    [ElementType.TABLE]
  ],
  [[ElementType.TABLE], [ElementType.TABLE], [ElementType.TABLE], [ElementType.TABLE]]
];

export const role: Array<H3.Licence.Role> = [
  {
    // 角色键值
    key: "admin",
    // 角色名称
    name: "管理员",
    // 角色权重
    weight: 1,
    // 角色模块权限
    authority: {
      view: {
        Public: {
          add: true,
          rename: true,
          tool: [
            ToolsBarType.REFRESH,
            ToolsBarType.SORT,
            ToolsBarType.FULLSCREEN,
            ToolsBarType.EDIT,
            ToolsBarType.REMOVE,
            ToolsBarType.DRAG
          ]
        },
        Person: {
          add: true,
          rename: true,
          tool: [
            ToolsBarType.REFRESH,
            ToolsBarType.SORT,
            ToolsBarType.FULLSCREEN,
            ToolsBarType.EDIT,
            ToolsBarType.REMOVE,
            ToolsBarType.DRAG
          ]
        }
      },
      design: {
        Public: {
          rename: true,
          tool: [ToolsBarType.REFRESH, ToolsBarType.SORT, ToolsBarType.EDIT, ToolsBarType.REMOVE]
        },
        Person: {
          rename: true,
          tool: [ToolsBarType.REFRESH, ToolsBarType.SORT, ToolsBarType.EDIT, ToolsBarType.REMOVE]
        }
      }
    }
  },
  {
    // 角色键值
    key: "member",
    // 角色名称
    name: "成员",
    // 角色权重
    weight: 0,
    // 角色模块权限
    authority: {
      view: {
        Public: {
          add: false,
          rename: false,
          tool: [ToolsBarType.REFRESH, ToolsBarType.SORT, ToolsBarType.FULLSCREEN]
        },
        Person: {
          add: true,
          rename: true,
          tool: [
            ToolsBarType.REFRESH,
            ToolsBarType.SORT,
            ToolsBarType.FULLSCREEN,
            ToolsBarType.EDIT,
            ToolsBarType.REMOVE,
            ToolsBarType.DRAG
          ]
        }
      },
      design: {
        Public: {
          rename: false,
          tool: [ToolsBarType.REFRESH, ToolsBarType.SORT]
        },
        Person: {
          rename: true,
          tool: [ToolsBarType.REFRESH, ToolsBarType.SORT, ToolsBarType.EDIT, ToolsBarType.REMOVE]
        }
      }
    }
  }
];

/**
 * 获取主图表类型
 * @param t 图表类型
 */
export const getMainType = t => {
  let type = t;
  switch (type) {
    case ElementType.BAR:
    case ElementType.PILEBAR:
    case ElementType.STRIPE:
      type = ElementType.BAR;
      break;
    case ElementType.LINE:
    case ElementType.AREA:
      type = ElementType.LINE;
      break;
    default:
      break;
  }
  return type;
};

export default getBaseModules;
