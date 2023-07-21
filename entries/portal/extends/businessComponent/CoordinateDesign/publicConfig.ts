import { DefineTypes } from "../../type";

export const statisticsConfig  = [
  {
    text: '我的生产任务单',
    field: 'productionTaskCount',
    key: 1,
    value: 0,
    dw: '个',
    img: 'p1_icon1'
  },
  {
    text: '我的工作大纲',
    field: 'workOutlineCount',
    key: 2,
    value: 0,
    dw: '个',
    img: 'p1_icon2'
  },
  {
    text: '我的专业任务单',
    field: 'professionTaskCount',
    key: 3,
    value: 0,
    dw: '个',
    img: 'p1_icon3'
  },
  {
    text: '我的设计任务单',
    field: 'designTaskCount',
    key: 4,
    value: 0,
    dw: '个',
    img: 'p1_icon4'
  }
]
export const projectLevelConfig = [
  {
    text: '全部项目',
    key: 1,
    value: 0,
    field: '全部项目'
  },
  {
    text: '',
    key: 2,
    value: 0,
    field: ''
  },
  {
    text: '',
    key: 3,
    value: 0,
    field: ''
  },
  {
    text: '',
    key: 4,
    value: 0,
    field: ''
  }
]
export const conditionConfig = [
  {
    text: '工作类型',
    key: 1,
    value: 1,
    field: 'fileTypes',
    options: [],
    selected: '',
    type: 'select',
    showSearch: true
  },
  {
    text: '工程分类',
    key: 2,
    value: 2,
    field: 'bussinesses',
    options: [],
    selected: '',
    type: 'select',
    showSearch: true
  },
  {
    text: '工程类型',
    key: 10,
    value: 10,
    field: 'projectTypes',
    options: [],
    selected: '',
    type: 'select',
    disabled: true,
    showSearch: true
  },
  {
    text: '工程阶段',
    key: 3,
    value: 3,
    field: 'projectStates',
    options: [],
    selected: '',
    type: 'select',
    showSearch: true
  },
  {
    text: '专业阶段',
    key: 4,
    value: 4,
    field: 'professionTypes',
    options: [],
    selected: '',
    type: 'select',
    showSearch: true
  }
]

export const extendConditionConfig = [
  {
    text: '标题(精确)',
    key: 5,
    value: 5,
    field: 'title',
    selected: '',
    type: 'input'
  },
  {
    text: '省份',
    key: 6,
    value: 6,
    field: 'province',
    selected: '',
    type: 'input'
  },
  {
    text: '生产单位',
    key: 7,
    value: 7,
    field: 'department',
    selected: '',
    type: 'input'
  },
  {
    text: '起始年份',
    key: 8,
    value: 8,
    field: 'startYear',
    selected: '',
    type: 'inputNumber'
  },
  {
    text: '截止年份',
    key: 9,
    value: 9,
    field: 'endYear',
    selected: '',
    type: 'inputNumber'
  }
]
export const toWorksConfig = [
  {
    text: '生产任务单',
    field: 'projects',
    key: 1,
    value: 0,
    img: 'appstore'
  },
  {
    text: '工作大纲',
    field: 'workOutlines',
    key: 2,
    value: 0,
    img: 'file-word'
  },
  {
    text: '专业任务',
    field: 'professionTasks',
    key: 3,
    value: 0,
    img: 'credit-card'
  },
  {
    text: '专业提纲',
    field: 'professionOutlines',
    key: 4,
    value: 0,
    img: 'database'
  },
  {
    text: '设计任务',
    field: 'designTasks',
    key: 5,
    value: 0,
    img: 'project'
  },
  {
    text: '外来资料',
    field: 'externalMaterials',
    key: 6,
    value: 0,
    img: 'audit'
  }
]
export const designTaskMapping = {
  proofreadLevel:"proofread_level",
  professionName: "profession_name", //专业名称
  taskName:"profession_task_name", //拆分取最后的任务单名称
  taskType: "task_type",
  auditor:"auditor",
  checkor:"checker",
  countersigned:"countersigned",
  days:"plan_duration",
  designGuider:"design_guider",
  designer:"designer",
  endTime:"plan_end_time",
  projectManager:"project_manager",
  startTime:"plan_start_time",
  designGuiderFlag:"design_guider_flag",
  countersignFlag:"countersign_flag",
  projectManagerAudit:"project_manager_audit",
  checker:"checker",
  departmentChief:"department_chief",
  companyChief:"company_chief",
  planStartStr:"plan_start_time",
  planEndStr:"plan_end_time",
  modelType: 'modelType',
  manufacturer: 'manufacturer',
  engineeringName: 'engineering_name',
  engineeringStage: 'engineering_stage',
  useSoftwareName: 'use_software_name',
  // taskTime: 'task_time',
  taskTimeStr: 'task_time',
  achievementNumber: 'achievement_number',
  taskNumber: 'task_number'
}
export const achievementFormatConfig = '.xmcd,.mcd,.yjk,.dwg,.jws,.mgb,.dxf,.bdls,.gbq,.gbq6,.out,.mcb,.dbr,.qlt,.rtf,.wd3,.sl,.spw,.hwt,.pj,.dt,.kj,.zls,.hl,.tp,.mb,.zh,.pj3,.kj3,.dt3,.zls3,.tpdb,.fbd,.zlbz,.in,.syqd19,.syqd,.crjj,.ipj,.ipt,.iam,.idw,.ipn,.opt,.bth,.vsl,.rtd,.faj,.C2,.HPL,.nwc,.nwd,.rvt,.rfa,.fbx,.sdf,.csv,.eps,.imp,.dwf,.dwt,.bak,.bmp,.wmf,.emf,.svg,.sat,.sld,.epct,.st,.cg,.dmx,.epm,.icd,.jd,.kzd,.sqx,.rte,.dwfx,.dgn,.xml,.targa,.ifc,.html,.pcp,.wps,.mv,.id'
export const taskTypes:DefineTypes[] = [
  {
    text: '全部待办',
    key: 1,
    value: 0,
    field: 'allTaskName',
    type: 'allTask',
    selected: 'todo'
  },
  {
    text: '全部已办',
    key: 2,
    value: 0,
    field: 'allTaskName',
    type: 'allTask',
    selected: 'done'
  },
  // {
  //   text: '紧急催办',
  //   key: 2,
  //   value: 0,
  //   field: '',
  //   type: 'urgencyTask'
  //   selected: 'todo;done'
  // },
  {
    text: '生产任务单',
    key: 3,
    value: 0,
    field: 'projectNumber',
    type: 'xmlb',
    selected: 'todo;done'
  },
  {
    text: '工作大纲',
    key: 4,
    value: 0,
    field: 'outlinesNumber',
    type: 'xmsqb',
    selected: 'todo;done'
  },
  {
    text: '专业任务',
    key: 5,
    value: 0,
    field: 'professionTaskNumber',
    type: 'zyrwd',
    selected: 'todo;done'
  },
  {
    text: '专业提纲',
    key: 6,
    value: 0,
    field: 'professionOutlineNumber',
    type: 'zysjtg',
    selected: 'todo;done'
  },
  {
    text: '设计任务',
    key: 7,
    value: 0,
    field: 'designTaskNumber',
    type: 'sjrwd',
    selected: 'todo;done'
  },
  {
    text: '外来资料',
    key: 8,
    value: 0,
    field: 'externalMaterialNumber',
    type: 'wlzl',
    selected: 'todo;done'
  },
  {
    text: '设计评审',
    key: 9,
    value: 0,
    field: 'designReviewName',
    type: 'sjps',
    selected: 'todo;done'
  },
  {
    text: '技术方案',
    key: 10,
    value: 0,
    field: 'technicalSchemeName',
    type: 'jsfa',
    selected: 'todo;done'
  }
]
export const homeRouterKeyValue:{[key:string]:string}={
  sjrwd:"ProfessionalDesignTask",//设计任务单
  zysjtg:"ProfessionalDesignOutline",//专业任务大纲
  xmlb:"ProductionTaskList",//生产任务单
  zyrwd:"ProfessionalTask",//专业任务
  xmsqb:"ProjectPlanning",//项目策划
  sjps:'OneReviewDetail',//设计评审
  jsfa:'ArtReviewDetail'//技术评审
}
export const projectLevelSort: DefineTypes[] = [
  {
    text: '年度-省份',
    key:0,
    value: 1
  },
  {
    text: '年度-状态-生产单位',
    key:1,
    value: 2
  },
  {
    text: '年度-阶段-状态',
    key:2,
    value: 3
  },
  // {
  //   text: '年度-省份-项目项目项目项目项目项目项目项目项目项目项目项目项目项目项目项目',
  //   key:1,
  //   value: 2
  // }
]
