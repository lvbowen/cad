import { Vue } from "vue-property-decorator";
import moment from "moment";

// eslint-disable-next-line no-shadow
export enum TaskManualEnum {
    //自动
    auto = 0,
    //手动
    manual = 1
}

// eslint-disable-next-line no-shadow
export enum ConstraintType {
    //越早越好
    ASAP = 0,

    //越晚越好
    ALAP = 1,

    //必须开始于
    MSW = 2,

    //必须完成于
    MFW = 3,

    //不得早于开始
    NETS = 4,

    //不得晚于开始
    NLTS = 5,

    //不得早于完成
    NETF = 6,

    //不得晚于完成
    NLTF = 7,

}

// eslint-disable-next-line no-shadow
export enum GanttViewEventType {
    'drawcell' = 'drawcell',
    'drawitem' = 'drawitem',
    'taskclick' = 'taskclick',
    'taskdblclick' = 'taskdblclick',
    'taskdragdrop' = 'taskdragdrop',
    'cellbeginedit' = 'cellbeginedit',
    'CellCommitEdit' = 'CellCommitEdit',
    'itemdragstart' = 'itemdragstart',
    'itemdragcomplete' = 'itemdragcomplete'
}

export interface Predecessor {
    PredecessorUID: number;
    Type: number;
    LinkLag: number;
}

export interface Assignment {
    ResourceUID: number;
    Units: number;
}

export interface GanttCalendars {
    UID: number;
    Name: string;
    WeekDays: Array<{
        //工作周(1-7)
        DayType?: number;
        //工作日1 非工作日0
        DayWorking?: number;
        //名称
        Name?: string;
        //workingTime
        WorkingTimes?: Array<{ fromTime: string; toTime: string }>
        //例外的日期范围
        TimePeriod?: {
            FromDate: string;
            ToDate: string;
        }
    }>;
    Exceptions?: Array<GanttCalendars['WeekDays']>;
}

export interface GanttTaskBasic<T> {

    UID: string;
    //任务名称
    Name: string;
    //开始日期
    Start: string | moment.Moment | Date;
    //完成日期
    Finish: string | moment.Moment | Date;
    //工期
    Duration: number;
    //进度
    PercentComplete: number;
    //模式
    Manual: TaskManualEnum;
    //限制类型
    ConstraintType: ConstraintType;
    //限制日期
    ConstraintDate: string | Date;
    //是否固定日期（仅限于摘要任务使用）
    FixedDate: 0 | 1;
    //序号
    ID: number;
    //父任务UID
    ParentTaskUID: string | -1;
    //树层级和序号
    OutlineNumber: string;
    //层级
    OutlineLevel: number;
    //工时
    Work: number;
    //权重
    Weight: number;
    //里程碑
    Milestone: 0 | 1;
    //摘要任务
    Summary: 0 | 1;
    //关键任务
    Critical: 0 | 1;
    //重要级别
    Priority: number;
    //任务备注
    Notes: string;
    //前置任务
    PredecessorLink: Array<Predecessor>;
    //资源分配关系
    Assignments: Array<Assignment>;
    //部门
    Department: string;
    //负责人
    Principal: string;
    //任务名称
    taskName: string;
    //自定义属性
    tempData: boolean;
    edited?: boolean;
    codeValue: string | number;
    //MBS排序
    bsSort: number;
    //分类
    subPlanType: string;
    codeType: string;
    //子级
    //children: Array<GanttTask<T>>;
}

export type GanttTask<T> = T & GanttTaskBasic<T>;

// export type GanttTask<T extends GanttTaskBasic> = {
//     [key in keyof T | keyof GanttTaskBasic]:valueOf<T|GanttTaskBasic>;
// }

// export type GanttTask<T> = T extends GanttTaskBasic;

export interface Resource {
    UID: number;
    Name: string;
}

export interface Department {
    UID: number;
    Name: string;
}

export interface Principal {
    UID: number;
    Name: string;
    Department: number;
}

export interface GanttDataType<T> {
    UID: number;
    Name: string;
    StartDate: string | Date;
    FinishDate: string | Date;
    CalendarUID: number;
    Calendars: Array<GanttCalendars>;
    //任务集合
    Tasks: Array<GanttTask<T>>;
    //资源集合
    Resources: Array<Resource>;
    //部门集合
    Departments: Array<Department>;
    //负责人集合
    Principals: Array<Principal>;
}

/*export interface GanttTimeLine {
    data: Date;
    text: string;
    style?: string;
}*/

type valueOf<T> = T[keyof T];

// export interface updateTaskProperty<T> extends Partial<GanttTask<T>> {
// }
export type updateTaskProperty<T> = GanttTask<T>;

export interface GanttViewInstance {
    bottomTimeScale: {
        width: number;
    }
}

export interface Gantt<T> {

    new(componentInstance?: Vue): Gantt<T>;

    render(el: HTMLElement): void;

    orderProject(): void;

    setContextMenu(menu: any): void;

    //ganttView
    ganttView: GanttViewInstance;

    //自动排程
    allowOrderProject: boolean;

    // 是否显示
    readonly visible: boolean;

    //宽度
    readonly width: number;

    //高度
    readonly height: number;

    //是否显示任务表格
    readonly showTableView: boolean;

    //是否显示条形图
    readonly showGanttView: boolean;

    //是否显示箭头连线
    readonly showLinkLines: boolean;

    //是否显示关键路径
    readonly showCriticalPath: boolean;

    //是否显示条形图表格线
    readonly showGridLines: boolean;

    //时间线数组
    readonly timeLines: Array<GanttTimeLines>;

    //行高
    readonly rowHeight: number;

    //是否允许任务行拖拽
    readonly allowDragDrop: boolean;

    //是否允许多选任务
    readonly multiSelect: boolean;

    //设置样式
    setStyle: (style: string) => void;

    //加载项目数据
    loadData: (sources: GanttDataType<T>) => void;

    //返回项目数据
    getData: () => GanttDataType<T>;

    //返回被删除的任务集合
    getRemovedTasks: () => Array<GanttTask<T>>;

    //创建项目
    newProject: () => void;

    //设置表格列集合
    setColumns: (columns: Array<GanttColumn<T>>) => void;

    //设置树形节点列
    setTreeColumn: (columnField: string) => void;

    //返回符合条件的任务集合
    findTasks: (field: keyof GanttTask<T>, value: valueOf<GanttTask<T>>) => Array<GanttTask<T>>;

    //根据任务UID获取任务
    getTask: (taskUID: number) => GanttTask<T>;

    //根据任务ID获取任务
    getTaskByID: (taskId: number) => GanttTask<T>;

    //取消过滤任务
    clearFilter: () => void;

    //获取选中的任务。
    getSelected(): GanttTask<T>;

    //获取选中的任务集合。
    getSelecteds(): Array<GanttTask<T>>;

    //判断是否选中任务。
    isSelected(task: GanttTask<T>)

    //
    select(task: GanttTask<T>)

    //取消选中任务。
    deselect(task: GanttTask<T>)

    //选中多个任务。
    selects(Array): void;

    //取消选中多个任务。
    deselects(Array): void;

    //选中所有任务。
    selectAll(): void;

    //取消选中所有任务。
    deselectAll(): void;

    //获取父任务对象。
    getParentTask(task: GanttTask<T>): GanttTask<T>;

    //获取子任务数组。
    //下一级任务
    getChildTasks(task: GanttTask<T>): GanttTask<T>;

    //获取所有子任务数组。
    getAllChildTasks(task: GanttTask<T>): Array<GanttTask<T>>;

    //获取父级任务数组。
    getAncestorTasks(task: GanttTask<T>): Array<GanttTask<T>>;

    //判断两任务之间是否有父子关系。
    isAncestor(parentTask: GanttTask<T>, task: GanttTask<T>): boolean;

    //遍历下一级子节点
    eachChild(task: GanttTask<T>, fn): Array<GanttTask<T>>;

    //遍历所有子节点。
    cascadeChild(task: GanttTask<T>, fn): Array<GanttTask<T>>;

    //遍历父级子节点。
    bubbleParent(task: GanttTask<T>, fn): Array<GanttTask<T>>;

    //新建任务。此时并没有加入到项目中。
    newTask(): GanttTask<T>;

    //新建任务
    addTask(task: GanttTask<T>): void;

    //新增任务
    addTask(task: GanttTask<T>, index: number): void;

    //新增任务
    addTask(task: GanttTask<T>, action?: 'before' | 'after' | 'add', parentTask?: GanttTask<T>): void;

    //删除任务
    removeTask(task: GanttTask<T>): void;

    //更新任务属性
    // updateTask(task: GanttTask<T>, property: string, value: keyof GanttTask<T>): void;
    updateTask(task: GanttTask<T>, property: string, value: valueOf<GanttTask<T>>): void;

    //更新任务属性
    // updateTask(task: GanttTask<T>, keyValues: updateTaskProperty<T>): void;
    updateTask(task: GanttTask<T>, keyValues: {
        // [key in keyof GanttTask<T>]:valueOf<GanttTask<T>>
        [key: string]: any
    }): void;

    //移动任务
    moveTask(task: GanttTask<T>, targetTask: GanttTask<T>, action: 'before' | 'after' | 'add'): void;

    //升级任务。
    upgradeTask: (task: GanttTask<T>) => void;

    //降级任务。
    downgradeTask: (task: GanttTask<T>) => void;

    //批量新增任务
    addTasks(tasks: Array<GanttTask<T>>, index: number, parentTasks: Array<GanttTask<T>>): void;

    //批量删除任务。
    addTasks(tasks: Array<GanttTask<T>>, action: 'before' | 'after' | 'add', parentTasks: Array<GanttTask<T>>): void;

    //批量删除任务
    removeTasks: (tasks: Array<GanttTask<T>>) => void;

    //批量修改任务
    updateTasks: (tasks: Array<GanttTask<T>>, keyValues: updateTaskProperty<T>) => void;

    //折叠所有任务。
    collapseAll: () => void;

    //展开所有任务。
    expandAll: () => void;

    //折叠某层级任务。
    collapseLevel: (Number: number) => void;

    //展开某层级任务。
    expandLevel: (Number: number) => void;

    //折叠任务。
    collapse: (task: GanttTask<T>) => void;

    //展开任务。
    expand: (task: GanttTask<T>) => void;

    //设置表格是否显示。
    setShowTableView: (Boolean: boolean) => void;

    //设置条形图是否显示。
    setShowGanttView: (Boolean: boolean) => void;

    //设置表格折叠。
    setTableViewExpanded: (Boolean: boolean) => void;

    //设置条形图折叠。
    setGanttViewExpanded: (Boolean: boolean) => void;

    //设置表格宽度。
    setTableViewWidth: (Number: number) => void;

    //设置条形图宽度。
    setGanttViewWidth: (Number: number) => void;

    //设置是否显示箭头连线。
    setShowLinkLines: (Boolean: boolean) => void;

    //设置是否显示关键路径
    setShowCriticalPath: (Boolean: boolean) => void;

    //设置是否显示条形图背景表格线。
    setShowGridLines: (Boolean: boolean) => void;

    //设置项目时间线。
    setTimeLines: (timeLines: Array<GanttTimeLines>) => void;

    //设置行高。
    setRowHeight: (Number: number) => void;

    //设置是否多选任务。
    setMultiSelect: (Boolean: boolean) => void;

    //设置是否允许任务行拖拽。
    setAllowDragDrop: (Boolean: boolean) => void;

    //时间刻度。
    setTopTimeScale: (timeScale: 'year' | 'halfyear' | 'quarter' | 'month' | 'week' | 'day' | 'hour') => void;

    //设置底层时间刻度。（底层必须比顶层要小）
    setBottomTimeScale: (timeScale: 'year' | 'halfyear' | 'quarter' | 'month' | 'week' | 'day' | 'hour') => void;

    //放大时间刻度
    zoomIn: () => void;

    //缩小时间刻度
    zoomOut: () => void;

    //定位显示任务。
    scrollIntoView: (task: GanttTask<T>) => void;


    //获取项目日历集合。
    getCalendars: () => Array<GanttCalendars>;

    //设置项目日历集合。
    setCalendars: (calendars: Array<GanttCalendars>) => void;


    //切换项目日历。
    setCalendarUID: (calendarUID: number) => void;

}

type drawCellParams<T> = {
    source: Gantt<T>;
    record: GanttTask<T>;
    column: GanttColumn<T>;
    field: string;
    value: valueOf<GanttTask<T>>;
    cellHtml: string;
}

type drawItem<T> = {
    source: Gantt<T>;
    item: GanttTask<T>;
    itemBox: unknown;
    itemHtml: string;
}

type taskClick<T> = {
    source: Gantt<T>;
    task: GanttTask<T>;
}

type taskDragDrop<T> = {
    source: Gantt<T>;
    task: GanttTask<T>;
    targetTask: GanttTask<T>;
    action: 'before' | 'after' | 'append',
    cancel: boolean;
}

type cellEdit<T> = {
    source: Gantt<T>;
    record: GanttTask<T>;
    column: GanttColumn<T>;
    field: string;
    value: valueOf<GanttTask<T>>;
    cancel: boolean;
    task: T | GanttTask<T>;
}

type itemDrag<T> = {
    source: Gantt<T>;
    item: GanttTask<T>;
    action: 'move' | 'start' | 'finish' | 'percentcomplete',
    cancel: boolean;
}

export interface GanttEvent<T> {
    drawCellParamsType: drawCellParams<T>;
    drawItemType: drawItem<T>;
    taskClickType: taskClick<T>;
    taskDragDropType: taskDragDrop<T>;
    cellEditType: cellEdit<T>;
    itemDragType: itemDrag<T>;
    drawcell: (params: drawCellParams<T>) => void;
    drawitem: (params: drawItem<T>) => void;
    taskclick: (params: taskClick<T>) => void;
    taskdblclick: (params: taskClick<T>) => void;
    taskdragdrop: (params: taskDragDrop<T>) => void;
    cellbeginedit: (params: cellEdit<T>) => void;
    CellCommitEdit: (params: cellEdit<T>) => void;
    itemdragstart: (params: itemDrag<T>) => void;
    itemdragcomplete: (params: itemDrag<T>) => void;
}

// interface GanttColumnField<T> extends GanttTask<T>{}

export interface GanttColumn<T> {
    field: keyof T | keyof GanttTask<T> | string;
    text: string;
    name?: string;
    width: number | string;
    header?: string;
    align?: 'center' | 'left' | 'right';
    editor?: {
        type?: 'textbox' | 'datepicker' | 'spinner';
    };

    formatDate?(date: Date): string;

    renderer?: (cell: GanttMiniCell<T>, projectInstance: Gantt<T>) => string;
}

export interface GanttMiniUI<T> {
    copyTo(columns: GanttColumn<T>, options?: string): GanttColumn<T>;

    //decode string to Date
    decode(data: GanttDataType<T>): GanttDataType<T>;
}

export interface GanttMiniCell<T> {
    autoEscape: undefined;
    cellCls: string;
    cellHtml: string;
    cellStyle: string;
    column: T;
    columnIndex: number;
    field: string;
    record: GanttTask<T>;
    rowCls: null;
    rowIndex: number;
    rowStyle: null;
    // sender: mini.SuperTree {…}
    // source: mini.SuperTree {…}
    task: GanttTask<T>;
    type: keyof GanttEvent<T>;
    value: undefined;
}

export interface GanttViewItem<T> {
    item: GanttTask<T>;
    itemBox: {
        left: number;
        right: number;
        top: number;
        bottom: number;
        width: number;
        height: number;
    }
    baseline: boolean;
    itemCls?: string;
    itemHtml?: string;
    itemStyle?: string;
    label: GanttTask<T>['Name'];
    labelAlign: 'left' | 'right';
    labelField: "Name"
    sender: Gantt<T>;
    showLabel: boolean;
    source: Gantt<T>;
    task: GanttTask<T>;
    type: GanttViewEventType;
}

export interface GanttTabsMenus {
    key: string;
    name: string;
    component?: unknown;
}

export interface GanttTimeLine {
    date: Date;
    text: string;
    position?: 'top' | 'bottom';
}

export interface GanttTimeLinePos {
    left: number;
    top: number | null;
    height: number | null;
}

export interface GanttTimeLines {
    date: Date;
    text: string;
    position?: 'top' | 'bottom';
    render?: (timeLine: GanttTimeLine, pos: GanttTimeLinePos) => string;
    renderTitle?: (timeLine: GanttTimeLine, pos: GanttTimeLinePos) => string;
}
