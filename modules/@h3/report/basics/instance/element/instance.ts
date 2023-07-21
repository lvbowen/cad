import {guid} from '../../utils/uid';
import {ElementType} from '../../enum/chart-type';

let charNum = new Date().getTime();

class BaseInstance implements H3.Report.BaseElement {
    uid: string;// 图表UID
    title = '未命名的图表'; // 图表标题
    type: ElementType; // 图表类型
    i: number; // z-index
    x: number = 0; // 坐标X
    y: number = 0; // 坐标Y
    w: number = 16; // 宽度
    h: number = 8; // 高度
    minW = 8; // 最小宽度
    minH = 6; // 最小长度
    handleActive = false; // 是否被激活
    constructor(type: ElementType, oldChart?: H3.Report.BaseElement) {
        this.type = type;
        this.i = charNum++;
        this.uid = guid();
    }
}

/**
 * 富文本实例类
 */
class LongTextInstance extends BaseInstance implements H3.Report.LongText {
    edit: boolean = false;
    content: string = '';
    // 临时使用，过后删除
    minH = 2; // 最小高度
    constructor(type: H3.Report.ElementType, oldChart?: H3.Report.LongText) {
        super(type, oldChart);
        this.title = '未命名的文本';
        if (oldChart) {
            Object.assign(this, oldChart);
        }
    }
}

/**
 * 过滤器实例类
 */
class FilterInstance extends BaseInstance implements H3.Report.FilterPicker {
    w: number = 12; // 宽度
    h: number = 3; // 高度
    minH = 3; // 最小长度
    chartIds: Array<string> = [];
    dataSources: Array<any> = [];
    format: string = '';
    formula: string = '';
    field!: H3.Report.FieldColumn;
    text: Array<string | number | any> = [];

    constructor(type: H3.Report.ElementType, oldChart?: H3.Report.FilterPicker) {
        super(type, oldChart);
        this.title = '';
        if (oldChart) {
            Object.assign(this, oldChart);
        }
    }
}

//NEW ADD
/**
 * 图片轮播实例类
 */
class PicPlayInstance extends BaseInstance implements H3.Report.PicPlay {
    edit: boolean = false;
    content: string = '';
    // 临时使用，过后删除
    minH = 2; // 最小高度
    constructor(type: H3.Report.ElementType, oldChart?: H3.Report.PicPlay) {
        super(type, oldChart);
        this.title = '未命名的文本';
        if (oldChart) {
            Object.assign(this, oldChart);
        }
    }
}

//NEW ADD
/**
 * 视频实例类
 */
class VideoPlayInstance extends BaseInstance implements H3.Report.VideoPlay {
    edit: boolean = false;
    content: string = '';
    // 临时使用，过后删除
    minH = 2; // 最小高度
    constructor(type: H3.Report.ElementType, oldChart?: H3.Report.VideoPlay) {
        super(type, oldChart);
        this.title = '未命名的文本';
        if (oldChart) {
            Object.assign(this, oldChart);
        }
    }
}

/**
 * Iframe实例类
 */
class IframePlayInstance extends BaseInstance implements H3.Report.IframePlay {
    edit: boolean = false;
    content: string = '';
    // 临时使用，过后删除
    minH = 2; // 最小高度
    constructor(type: H3.Report.ElementType, oldChart?: H3.Report.IframePlay) {
        super(type, oldChart);
        this.title = '未命名的文本';
        if (oldChart) {
            Object.assign(this, oldChart);
        }
    }
}

/**
 * 图表基础实例类
 */
export default class ChartBaseInstance extends BaseInstance implements H3.Report.Chart {
    resize = false; // 是否在resize
    data: H3.Report.ChartDataGroup = {} as any;
    styles: H3.Report.ChartStyleGroup = {};
    authorization: number = 1;
    dataSourceId: string | null = null;
    useType: number | null = null;
    linkageFilter: Array<H3.Report.FilterFieldColumn> = [];
    filterPicker: { [FilterPickerId: string]: Array<H3.Report.FilterFieldColumn> } = {};
    constructor(type: H3.Report.ElementType, oldChart?: H3.Report.Chart) {
        super(type, oldChart);
        if (oldChart) {
            Object.assign(this, oldChart, {
                type
            });
        }
        if (this.useType === null) {
            this.useType = 1;
        }
    }
}

/**
 * 创建元件实例
 * @param elementType 元件类型
 * @param oldElement 旧元件
 */
export function createElementInstance(elementType: H3.Report.ElementType, oldElement?: H3.Report.BaseElement) {
    let element: H3.Report.Chart | H3.Report.FilterPicker | H3.Report.LongText | H3.Report.VideoPlay | H3.Report.PicPlay| H3.Report.IframePlay;
    switch (elementType) {
        case ElementType.LONGTEXT:
            element = new LongTextInstance(elementType, oldElement as H3.Report.LongText);
            break;
        case ElementType.FILTERPICKER:
            element = new FilterInstance(elementType, oldElement as H3.Report.FilterPicker);
            break;
        //NEW ADD
        case ElementType.PICPLAY:
            element = new PicPlayInstance(elementType, oldElement as H3.Report.PicPlay);
            break;
        case ElementType.VIDEOPLAY:
            element = new VideoPlayInstance(elementType, oldElement as H3.Report.VideoPlay);
            break;
        case ElementType.IFRAMEPLAY:
            element = new IframePlayInstance(elementType, oldElement as H3.Report.IframePlay);
            break;
        default:
            element = new ChartBaseInstance(elementType, oldElement as H3.Report.Chart);
            break;
    }
    return element;
}

export {
    LongTextInstance,
    FilterInstance,
    //NEW ADD
    VideoPlayInstance,
    PicPlayInstance,
    IframePlayInstance,
    ChartBaseInstance
}


