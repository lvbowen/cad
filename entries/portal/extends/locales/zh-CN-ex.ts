/* eslint-disable no-shadow */
export namespace ZhCNEx {
  export namespace Common {
    export enum Table {
      prev = '上一页',
      next = '下一页',
      goTo = '跳转到',
      goToView = '跳转查看',
      goToEdit = '填报',
      noClick = '不可填报/查看'
    }

    export enum Action {
      add = '新增',
      append = '添加',
      edit = '编辑',
      remove = '删除',
      confirmRemove = '确认删除',
      view = '查看',
      ok = '确认',
      cancel = '取消',
      save = '保存',
      options = '操作',
      submit = '提交',
      import = '导入',
      export = '导出',
      optional = '选填',
      goBack = '返回',
      modify = '修改',
      next = '下一步',
      reset = '重置'
    }

    export enum System {
      parseConfigFailed = '配置格式化失败',
      empty = '空'
    }
  }

  export enum Geo {
    GB = '国标',
    BJ = '北京',
    TJ = '天津',
    SH = '上海',
    CQ = '重庆',
    HEB = '河北',
    SX = '山西',
    LN = '辽宁',
    JL = '吉林',
    HLJ = '黑龙江',
    JS = '江苏',
    ZJ = '浙江',
    AH = '安徽',
    FJ = '福建',
    JX = '江西',
    SD = '山东',
    HEN = '河南',
    HUB = '湖北',
    HUN = '湖南',
    GD = '广东',
    HAN = '海南',
    SC = '四川',
    GZ = '贵州',
    YN = '云南',
    SNX = '陕西',
    GS = '甘肃',
    QH = '青海',
    TW = '台湾',
    NM = '内蒙古',
    GX = '广西',
    XZ = '西藏',
    NX = '宁夏',
    XJ = '新疆',
    XG = '香港',
    AM = '澳门',
    ZDY = '自定义',
  }

  export enum Industry {
    SY = '水运',
    GL = '公路',
    QL = '桥梁',
    TL = '铁路',
    ZDY = '自定义',
  }

  export enum Engineering {
    searchPlaceHolder = '请输入名称',
    optionsFn = '操作功能',
    changeJBSType = '修改JBS类型',
    choseJBSType = '选择JBS类型',
    JBSTypeRequired = '请选择JBS类型',
    listConfig = '清单配置',
    title = '工程划分',
    unit = '工程单位',
    code = '编码',
    name = '名称',
    status = '状态',
    progressState = '进度状态',
    type = '划分类别',
    codeType = '编码类别',
    templateConfig = '模板配置',
    oneKeyImport = '一键导入',
    tableImport = '请选择导入类型',
    globalImport = '全量导入',
    deltaImport = '增量导入',
    templateExport = '模板导出',
    globalTemplateExport = '全量导入模板下载',
    deltaTemplateExport = '增量导入模板下载',
    addChild = '新增子项',
    addTemplate = '添加模板',
    modalTitle = '新增子项信息',
    engineeringParts = '工程部位',
    engineeringPartsRequired = '请输入工程部位',
    correspondingCode = '对应编码',
    correspondingCodeRequired = '请输入对应编码',
    dividedCategories = '划分分类',
    dividedCategoriesRequired = '请选择划分分类',
    associationMBS = '关联MBS',
    associationMBSRequired = '请输入关联MBS',
    associationJBS = '关联JBS',
    associationJBSRequired = '请输入关联JBS',
    fileName = '文件名称',
    prepareDate = '编制日期',
    preparer = '编制人',
    currentWorkflow = '当前流程',
    filingDate = '归档日期',
    view = '跳转查看',
    qbsTree = 'QBS架构树',
    qualityDB = '质检资料库',
    fileDB = '文件资料库',
    UNIT_PRO_PROJECT = '单项工程',
    UNIT_PROJECT = '单位工程',
    SUB_UNIT_PROJECT = '子单位工程',
    PARTITION_PROJECT = '分部工程',
    SUB_PARTITION_PROJECT = '子分部工程',
    ITEM_PROJECT = '分项工程',
    SUB_ITEM_PROJECT = '子分项工程',
    INSPECTION_LOT = '具体部位',
    MODEL = '构件',
    CHECK_POINT = '评定表',
    CHECK_STEP = '工序',

    projectCategory = '工程类别',
    structureCategory = '结构类别',
    structureCategoryRequired = '请选择结构类别',
    processCategory = '工序类别',
    processCategoryRequired = '请选择结构类别',

    qbsCode = '部位码',
    partCode = 'QBS编码',
    taskName = '任务名称',
    taskNameRequired = '请输入任务名称',
    mbsCode = 'MBS编码',
    mount = '挂载',
    confirmMount = '确认挂载',
    relevance = '关联',
    confirmRelevance = '确认关联',
    qbsImport = '导入',
    qbsImportTitle = '导入数据',
    qbsExport = '导出',
    qbsImportTips = '为确保上传数据与列表内容匹配，请先',
    qbsImportDownloadTemplate = '下载示例文件',
    qbsImportLocal = '上传本地文件',
    qbsImportFileInput = '点击或拖拽上传',
    qbsRemove = '确定删除此QBS节点？',
    qbsRemoveDescriptions = '如果有子节点会连同子节点一起删除',
    editTitle = '修改数据',
    addTitle = '新增数据',
    baseInfo = '基本信息',
    inspectionLot = '具体部位信息',
    isInspectionLot = '是否是具体部位',
    qbsHasJbsTips = '当前选中QBS项已绑定JBS编码',
    qbsHasntJbsTips = '当前选中QBS未绑定JBS编码',
    editJBSBindShip = '编辑JBS选项',
    allOptionsRequired = '所有选项需要选择',
    batchFill = '批量填报',
    batchFillTypeError = '该节点不属于同一类型',
    relevanceSet = '关联设置',

    stateless = '无状态',
    undo = '未填报',
    doing = '审核中',
    done = '已归档',

    addSync = '新增同步',
    mySheet = '我的表单',
    sheetLibrary = '表单库',
    syncNodeRequired = '没有勾选表单节点',
    fileRequired = '请上传文件!',
    syncing = '表单同步中...',
    syncSuccess = '表单同步成功!',
    syncFail = '表单同步失败',

    QualityInspection = '质量检验',
    QINumberStatistical = '质量数量统计',
    QIStatusStatistical = '质量状态统计',
    QIWorkStatistical = '质量工作统计',
    QIDoneNumberStatistical = '质量验收数量统计',
    Parts = '工程部位',
    FormTotal = '总表单数',
    FormUndo = '未填报表单',
    FormDoing = '审核中表单',
    FormDone = '已归档表单',
    ProgressDone = '已填报进度',
    DateLatitude = '日期纬度',
    DateRange = '日期区间',
    To = '至',
    AcceptanceOfToday = '今日验收数',
    AcceptanceNumber = '已验收数',
    AcceptanceTotal = '总验收数',
    AcceptanceReady = '待验收数',
    NumberOfPending = '待审批数',
    Number = '个数',
    ModelName = '构建名称',
    QBSNodeSelectedRequired = '还未选择QBS节点',
    EmptyMBSNode = '没有符合要求的节点',
    OnlyOneMBSNode = '只能关联一个节点',

    HasRelevance = '已关联',
    NoRelevance = '未关联',

    CurrentPosition = '当前位置',
    Accessory = '附件',

    JBSNodeSelectedRequired = '还未选择JBS节点',
    QBDone = '质检完成'
  }

  export enum Progress {
    FillTitle = '进度填报',
    ProgressCodeTree = '进度编码树',
    EngineeringParts = '工程部位',
    Status = '状态',
    SearchPlaceholder = '请输入关键字进行搜索',
    All = '全部',
    OnGoing = '进行中',
    NotStarted = '未开始',
    Done = '已完成',
    NotFinished = '未完成',
    OneKeyDone = '一键完成',
    BatchFill = '批量填报',
    BatchFillSummary = '批量填报汇总',
    FillQuestTodoList = '填报任务清单',
    FillDetail = '填报明细',
    FillRecord = '填报记录',
    BaseInfo = '基本信息',
    QuestName = '任务名称',
    AccumulateProportion = '累计填报比例',
    UnitPrice = '单价',
    PlanNumber = '计划数量',
    PlanProduction = '计划产值',
    ResidualValue = '剩余数量',
    CompleteNumber = '完成数量',
    CompleteProduction = '完成产值',
    ResidualProduction = '剩余产值',
    FillContent = '填报内容',
    Filler = '填报人',
    FillDate = '填报日期',
    FillCalendar = '填报日历',
    FillDepartment = '填报部门',
    FillProduction = '填报产值',
    NowFillProduction = '本次填报产值',
    FillAllProduction = '填报总产值',
    FillPercent = '填报比例',
    FillWorkDetail = '填报工作明细',
    TaskNumber = '任务数量',
    TaskName = '任务名称',
    ProductionUnit = '元',
    IdsRequired = '请先选择填报项！',
    DateRequired = '请先选择填报日期！',
    ProductionRequired = '请先选择填报产值！',
    RecordDate = '日期',
    RecordOperator = '操作人',
    RecordPercent = '完成比例',
    //Log
    Log = '进度日志',
    LogSummary = '填报记录汇总',
    NewFillRecord = '新增填报',
    DataEdit = '数据修改',
    DataEditLabel = '填报比例修改为',
    PercentRequired = '请先选择填报比例！',
    docName = '文档名称'
  }

  export enum BIMModelFill {
    Title = '模型填报',
    AddToList = '添加到清单',
    ModelOperation = '模型操作',
    ModelList = '模型清单',
    ModelHighLight = '模型高亮',
    MyList = '我的清单',
    Empty = '清空',
    Save = '保存',
    Collect = '收藏',
    Cancel = '取消',
    Progress = '进度管理',
    ProgressFill = '进度填报',
    ProgressFillAside = '对选中的构件进行施工进度完成情况的数据填报',
    Quality = '质量管理',
    QualityInspection = '质量巡检',
    QualityInspectionAside = '对选中的构件进行质量巡检发现情况的问题填报',
    QualityFillAside = '对选中的构件进行质检验收相关报告的资料填报',
    Measure = '投资管理',
    MeasureSecTitle = '中间计量',
    MeasureAside = '对选中的构件进行进度计量完成情况的数据填报',
    Security = '安全管理',
    SecurityCheck = '安全检查',
    SecurityCheckAside = '对选中的构件进行安全问题检查情况的问题填报',
    BizFil = '业务填报',
    InputListName = '请输入清单名称',
    WaitToLoadForm = '请等待表单加载完',
    noneProgressData = '没有进度数据',
    nonePaymentData = '没有计量数据',
    NoMBSIds = '没有添加到清单的MBS节点',
    ConfirmDeleteList = '确定删除该清单项?'
  }
}
