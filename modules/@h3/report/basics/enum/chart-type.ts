/**
 * 图表类型枚举
 */

// eslint-disable-next-line no-shadow
export enum ElementType {
    MAP = "map", // 地图
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
    SCATTER = "scatter", // 散点图（气泡图）
    BIAX = "biax", // 双轴图
    LONGTEXT = "longText", // 文本图
    FILTERPICKER = "filterPicker",// 过滤器
    //NEW ADD
    PICPLAY = "picPlay", // 图片轮播
    VIDEOPLAY = "videoPlay",// 视频
    IFRAMEPLAY = "iframePlay", // iframe
}

/**
 * 图表类型枚举
 */

// eslint-disable-next-line no-shadow
export enum ElementCNType {
    MAP = "地图", // 地图
    BAR = "柱状图", // 柱状图
    PILEBAR = "堆叠柱状图", // 堆叠柱状图
    STRIPE = "条形图", // 条形图
    LINE = "折线图", // 折线图
    AREA = "面积图", // 面积图
    PIE = "饼图", // 饼图
    FUNNEL = "漏斗图", // 漏斗图
    RADAR = "雷达图", // 雷达图
    TABLE = "透视图", // 透视图
    LIST = "明细表", // 明细表
    CARD = "指标图", // 指标图
    SCATTER = "散点图", // 散点图（气泡图）
    BIAX = "双轴图", // 双轴图
    LONGTEXT = "文本图", // 文本图
    FILTERPICKER = "过滤器", // 过滤器
    //NEW ADD
    PICPLAY = "图片轮播", // 图片轮播
    VIDEOPLAY = "图片轮播", // 图片轮播
    IFRAMEPLAY = "IFRAME",// IFRAME

}

/**
 * 图表连接关系
 */

// eslint-disable-next-line no-shadow
export enum ChartUseType {
    CONNECT = 1,
    ETL = 100
}

/**
 * 图表tooltip 的HTML
 */

// eslint-disable-next-line no-shadow
export enum ChartNotice {
    MAP = "", //地图
    BAR = "1个维度、1个或多个指标<br>2个维度、1个指标", // 柱状图
    PILEBAR = "1个维度、1个或多个指标<br>2个维度、1个指标", // 堆叠柱状图
    STRIPE = "1个维度、1个或多个指标<br>2个维度、1个指标", // 条形图
    LINE = "1个维度、1个或多个指标<br>2个维度、1个指标", // 折线图
    AREA = "1个维度、1个或多个指标<br>2个维度、1个指标", // 面积图
    PIE = "1个维度、1个指标", // 饼图
    FUNNEL = "1个维度、1个指标", // 漏斗图
    RADAR = "1个维度、1个或多个指标<br>2个维度、1个指标", // 雷达图
    TABLE = "1个维度、1个或多个指标<br>多个维度、1个或多个指标", // 透视图
    LIST = "多个列", // 明细表
    CARD = "0个维度、1个指标<br>1个维度、1个指标", // 指标图
    SCATTER = "1个维度、2个或3个指标<br/>2个维度、2个或3个指标", // 散点图（气泡图）
    BIAX = "1个维度、1个或多个指标<br>2个维度、1个指标" // 双轴图
}
