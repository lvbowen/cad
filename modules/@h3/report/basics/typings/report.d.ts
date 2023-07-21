declare namespace H3 {
  /**
   * API
   */
  namespace Report {
    /**
     * 报表4种状态
     */

    export enum State {
      DESIGN = "design", // 设计器状态
      DASHBOARD = "dashboard", // 报表展示状态
      PREVIEW = "preview", // 预览状态
      SINGLE = "single" // 单例图表状态
    }
    /**
     * 元件类型枚举
     */
    export enum ElementType {
      BAR = "bar", // 柱状图
      PILEBAR = "pileBar", // 堆叠柱状图
      STRIPE = "stripe", // 条形图
      LINE = "line", // 折线图
      AREA = "area", // 面积图
      PIE = "pie", // 饼图
      FUNNEL = "funnel", // 漏斗图
      RADAR = "radar", // 雷达图
      TABLE = "table", // 透视图
      LIST = "list", // 明细表
      CARD = "card", // 指标图
      BIAX = "biax", // 双轴图
      SCATTER = "scatter", // 散点图（气泡图）
      LONGTEXT = "longText", // 文本图
      FILTERPICKER = "filterPicker", // 过滤器
      //NEW ADD
      PICPLAY="picPlay",//图片轮播
      VIDEOPLAY='videoPlay',//视频
      IFRAMEPLAY='iframePlay',//iframe
      MAP = "map" //地图
    }

    /**
     * 图表连接关系
     */
    export enum ChartUseType {
      CONNECT = 1,
      ETL = 100
    }
    /**
     * 双轴图可选图形
     */
    export enum BiaxChartType {
      BAR = "bar", // 柱状图
      PILEBAR = "pileBar", // 堆叠柱状图
      LINE = "line", // 折线图
      AREA = "area" // 面积图
    }
    /**
     * 报表配置
     */
    export interface Report {
      attributes?: string; // 报表预览属性
      title?: string; // 报表名称
      objectId?: string; // 报表ID
      global: Global | string; // 报表默认配置
      charts: Array<Chart | FilterPicker | LongText| PicPlay| VideoPlay| IframePlay> | string; // 报表所有图表
    }
    export interface Global {
      data?: H3.Report.ChartDataGroup; // 数据模块
      styles: H3.Report.GlobalCoatGroup; // 样式模块
    }
    /**
     * 数据源列表
     */
    export interface DataSourceList {
      displayName: string; // 一级菜单名称
      children: Array<FieldColumnList>; // 二级菜单数据集
    }
    /**
     * 数据源
     */
    export interface DataSource {
      dataSourceId: string; // 数据源ID
      displayName: string; // 数据源名称
      properties: Array<FieldColumn>; // 数据源字段
    }
    /**
     * 基础元件属性
     */
    export interface BaseElement {
      uid: string; // 图表UID
      title: string; // 图表标题
      type: ElementType; // 元件类型
      x: number; // 坐标X
      y: number; // 坐标Y
      w: number; // 宽度
      h: number; // 高度
      i: number; // 排序位置
      handleActive?: Boolean; // 是否被激活
      addStatus?: boolean; // 添加状态
    }
    /**
     * 图表属性
     */
    export interface Chart extends BaseElement {
      edit?: boolean; // 是否编辑过，编辑状态使用
      handleActive?: Boolean; // 是否被激活
      data: H3.Report.ChartDataGroup; // 数据模块
      styles: H3.Report.ChartStyleGroup; // 样式模块
      dataSourceId: string | null; // 数据源Id
      useType: ChartUseType | null; // /使用类型，1-表示直连数据库，100-表示ETL
      authorization: number; // 数据权限 0, 1
      linkageFilter?: Array<H3.Report.FilterFieldColumn>;
      filterPicker?: { [FilterPickerId: string]: Array<H3.Report.FilterFieldColumn> };
      pageSize?: number; // 分页大小 保存时要删掉
      pageIndex?: number; // 获取第几页 保存时要删掉
      mapSource?: H3.Report.MapColumn; // 保存时删除 地图请求
      columnsSetting?: Array<H3.List.columnSetting>; // 明细表表格列宽等配置信息
    }
    /**
     * 筛选器
     */
    export interface FilterPicker extends BaseElement {
      chartIds: Array<string>; // 图表ids
      dataSources: Array<FilterDataSource>; // 数据类型
      format: string; // 筛选格式
      field: H3.Report.FieldColumn;
      formula: string; // 筛选公式
      text: Array<string | number>; // 筛选文本
    }
    /**
     * 富文本编辑器
     */
    export interface LongText extends BaseElement {
      edit: boolean; // 是否编辑过，编辑状态使用
      content: string; // 文本内容
    }

    /**
     * 图片轮播编辑器
     */
    export interface PicPlay extends BaseElement {
      edit: boolean; // 是否编辑过，编辑状态使用
      content: string; // 文本内容
    }

    /**
     * 视频编辑器
     */
    export interface VideoPlay extends BaseElement {
      edit: boolean; // 是否编辑过，编辑状态使用
      content: string; // 文本内容
    }

    /**
     * iframe编辑器
     */
    export interface IframePlay extends BaseElement {
      edit: boolean; // 是否编辑过，编辑状态使用
      content: string; // 文本内容
    }

    /**
     * 图表属性
     */
    export interface ActiveChart {
      chart?: Chart; // 图表属性
      modules?: H3.ReportModules.ChartModules; // 图表模块
    }

    /**
     * 多种类数值标签显示
     */
    export interface MultipleDataLabel {
      dimensionLabel: boolean | null;
      metricLabel: boolean | null;
      percentLabel: boolean | null;
    }

    /**
     * 警戒线
     */
    export interface WarningLine {
      title: string; // 名称
      type: string; // 类型：fixed(固定值)、dynamic(动态值)
      field?: string; // 指标uuid、唯一标识
      aggregate?: string; // 警戒线值类型 max min average
      value?: number | string; // 警戒线值
      is_title: boolean; // 显示内容：是否为名称
      is_value: boolean; // 显示内容：是否为数值
      color: string; // 警戒线颜色
    }

    /**
     * 仪表盘全局涂层
     */
    export interface GlobalCoatGroup extends ChartStyleGroup {
      paintCoatTheme: string; // 仪表盘 - 主题 default/theme1/theme2/theme3/theme4/...
      paintCoat: PaintCoat; // 仪表盘 - 背景色设置
      elementCoat: ElementCoat; // 仪表盘 - 组件背景色设置
      fontSetting: FontSetting; // 字体设置
    }

    /**
     * 仪表盘背景色设置
     */
    export interface PaintCoat {
      type?: string; // 'bgColor', 'bgPicture'
      value?: string; // '#F3F5F8', 'A/B/C.PNG'
    }

    /**
     * 组件背景色设置
     */
    export interface ElementCoat {
      type?: string | null; // 'bgColor', 'bgPicture'
      value?: string | null; // '#ffffff', 'A/B/C.PNG'
    }

    /**
     * 字体设置
     */
    export interface FontSetting {
      titleColor: string | null; // 标题颜色
      fontColor: string | null; // 字体颜色
      // size: string // 字体大小
      // type: string // 字体类型 例：宋体、雅黑...
    }

    /**
     * 图表样式模块分组
     */
    export interface ChartStyleGroup {
      elementCoat?: ElementCoat | null; // 组件背景色设置(单个图表背景色设置)
      theme?: Theme; // 主题
      metricRange?: MetricRange; // 指标范围
      dimensionLimit?: number | null; // 维度显示
      direction?: "top" | "bottom" | "left" | "right"; // 滚动条方向
      dataLabel?: boolean | null; // 数值显示
      multipleDataLabel?: MultipleDataLabel; // 多种类数值显示
      multiMetricType?: Array<"bar" | "line" | "area" | "pileBar"> | null; // 多指标图标类型
      multiRange?: Array<MetricRange> | null; // 多组极限值
      linkage?: Array<string>; // 图表联动 图表ID
      download?: boolean | null; // 操作设置-导出
      orderNumber?: OrderNumber; // 配置序号
      freezeHead?: FreezeHead; // 配置冻结
      legend?: Legend;
      axisX?: AxisX;
      warningLine?: Array<WarningLine>; // 警戒线
      chartColor?: string; // 图表配色类型
      fontSetting?: FontSetting | null; // 字体设置
      splitLine?: boolean | null; // 网格线设置
      axisYSet?: boolean | null; // Y轴显示隐藏设置
      dataZoom?: DataZoom; // 缩略轴设置
      mapTheme?: MapTheme; // 地图配色
      mapDrill?: MapDrill; // 地图钻取范围
      mapDigitalSet?: MapDigitalSet; //地图数值标签显示设置
    }
    export interface MapTheme {
      theme: string; // 地图配色类型
    }

    export interface MapArea {
      area: "all" | "province" | "city"; // 显示范围
      province?: {
        code: string | number;
        name: string;
      }; // 显示范围的省
      city?: {
        code: string | number;
        name: string;
      }; // 显示范围的城市
    }

    export interface MapDrill {
      drill: "province" | "city" | "disabled"; // 钻取到的级别
    }

    export interface MapDigitalSet {
      displayDimension: boolean; // 显示维度值
      displayMetric: boolean; // 显示指标值
    }

    /**
     *  X坐标设置
     */
    export interface AxisX {
      displayAxisX: boolean; // 显示坐标轴
      displayLabel: boolean; // 显示标签
      direction: "crosswise" | "endwise" | "leftBank" | "rightBank"; // 方向
    }

    /**
     * 过滤器数据源
     */
    export interface FilterDataSource {
      dataSourceId: string; // 数据源ID
      field: FieldColumn | null;
    }
    /**
     * 图表数据模块分组
     */
    export interface ChartDataGroup {
      dimension: Array<FieldColumn>; // 维度(行维度)
      groupDimension?: Array<FieldColumn>; // 维度(列维度)
      metric: Array<FieldColumn>; // 指标
      metricGroup: Array<Array<FieldColumn>>; // 多组指标
      sort: Array<FieldColumn>; // 排序
      filter?: Array<FilterFieldColumn>; // 过滤
      limit?: number | null; // 数据显示
      chartSwitch: string; // 图表切换
      mapArea?: MapArea; // 地图显示范围
    }

    /**
     * 通用字段属性
     */
    export interface FieldColumn {
      uid: string; // uid
      schemaCode: string; // 模型code
      tableId: string; //  列表ID
      tableName: string; // 列表名称
      field: string; // 绑定字段
      name: string; // 字段名称
      type: string; // 字段类型
      alias?: string; // 字段别名
      needAlias?: boolean; // 是否是别名字段
      dataType: number; // 数据库字段类型
      options: FieldColumnOptions; // 配置项
      visible: boolean; // 是否显示
      isRemove?: boolean; // 是否被删除
      relation: boolean; // 是否是关联表
      specialType?: string;
    }

    /**
     * 通用字段 - 数据源列表
     */
    export interface FieldColumnList {
      displayName: string; // 二级菜单值名称
      dataSourceId: string; // 二级菜单值ID
    }

    /*
     * 字段显示模型
     */
    export interface FieldDisplay {
      displayName: string;
      field: FieldColumn | FilterFieldColumn;
    }
    /**
     * 过滤字段属性
     */
    export interface FilterFieldColumn {
      formula: string; // 过滤公式
      field: FieldColumn; // 过滤字段
      text: Array<string | number | any>; // 过滤条件
    }
    /**
     * 地图通用属性
     */
    export interface MapColumn {
      code: string | number;
      name: string;
    }

    export interface FieldColumnOptions {
      format?: string; // 日期格式
      order?: "asc" | "desc"; // 升序或者降序
      aggregateType?: string; // 聚合运算
      percent?: "DEFAULT" | "PERCENT"; // 汇总结果显示 DEFAULT || PERCENT
      ratio?: number; // 同/环比分析
      numberFormat?: NumberFormat; // 数值格式
      resultFilter?: ResultFilter; // 结果筛选器
      hidden?: boolean; // 隐藏字段
      dateFormat?: DateFormat; // 明细表日期格式
      dateComplete?: number; // 日期自动补全
    }
    export interface NumberFormat {
      comma: boolean; // 千分符
      percent: boolean; // 百分比
      fraction: boolean | number; // 小数位数 默认0
    }
    export interface ResultFilter {
      display: boolean; // 是否开启
      logic: string; // 筛选逻辑
      condition: number | string | null; // 筛选条件
    }
    export interface DateFormat {
      formatType: string; // 格式话枚举
      isCustom: boolean; // 是否自定义
      customFormat: string; // 自定义格式内容
    }
    export interface ResultFilterOption {
      uid: string; // 字段uid
      options: ResultFilter; // 结果筛选器配置
    }
    export interface Theme {
      type?: string; // 类型
      colors: Array<string>; // 颜色
    }

    export interface MetricRange {
      max?: number | null; // 最大值
      min?: number | null; // 最小值
    }
    export interface Legend {
      checked: boolean;
      position: "top" | "bottom" | "left" | "right";
    }

    export interface OrderNumber {
      checked: boolean; // 是否勾选
      orderName?: string; // 序号别名
    }

    export interface FreezeHead {
      row?: boolean; // 行冻结
      column?: boolean; // 列冻结
      columnNumber?: number; // 列冻结数量
    }

    export interface DataZoom {
      show: boolean; // 是否显示滚动条
      start: number; // 起始位置
      end: number; // 结束位置
    }
  }
}
