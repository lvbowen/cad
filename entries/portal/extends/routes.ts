import { CustomerComponentRouters } from "./type";

import list from '@cloudpivot/list/pc';
import site from "@/config/site";

// @ts-ignore
export default <CustomerComponentRouters>{
  RelayRoute: {
    path: '/RelayRoute',
    name: 'RelayRoute',
    component: () => import('./businessComponent/CoordinateDesign/relayRoute/RelayRoute.vue')
  },
  //模型批注
  ModelAnnotation: {
    name: "/ModelAnnotation",
    path: "/ModelAnnotation",
    component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/modelAnnotation/index.vue"),
  },
  ModelAnnotationLogin: {
    name: "/ModelAnnotationLogin",
    path: "/ModelAnnotationLogin",
    component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/modelAnnotation/login.vue"),
  },
  formDetail: {
    path: '/form/detail',
    name: 'form-detail',
    component: () => import('@/views/form/form-detail.vue')
  },
  login: {
    path: '/login',
    name: 'login',
    component: () => import('./basicCustomComponent/login/login')
  },
  loginExternal: {
    path: '/loginExternal',
    name: 'loginExternal',
    meta: { title: window.localStorage.getItem('projectTitle') },
    component: () => import('./businessComponent/CoordinateDesign/External/Login/index.vue')
  },
  ProjectTask: {
    path: '/ProjectTask',
    name: 'ProjectTask',
    // component: () => import('./businessComponent/CoordinateDesign/External/ProjectTask/index.vue')
    component: () => import('./businessComponent/CoordinateDesign/External/v2/ProjectTaskList.vue')
  },
  Home: {
    path: '/Home',
    name: 'Home',
    redirect: '/ProjectItem',
    component: () => import('./businessComponent/CoordinateDesign/External/v3/home.vue'),
    children: [
      {
        path: '/ProjectTaskList',
        name: 'ProjectTaskList',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/ProjectTask/index.vue')
      },
      {
        path: '/ProjectItem',
        name: 'ProjectItem',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/ProjectItem/index.vue'),
      },
      {
        path: '/ProjectItem/Design',
        name: 'Design',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/ProjectItem/common/Design.vue')
      },
      {
        path: '/ProjectItem/DesignReceived',
        name: 'DesignReceived',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/ProjectItem/common/DSubmitted/index.vue')
      },
      {
        path: '/ProjectItem/Design/Detail',
        name: 'Detail',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/ProjectItem/common/DSubmitted/textDetail.vue')
      },
      {
        path: '/ProjectItem/WithdrawalFunds',
        name: 'WithdrawalFunds',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/ProjectItem/common/WithdrawalFunds.vue')
      },
      {
        path: '/ProjectItem/FinishProduct',
        name: 'FinishProduct',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/ProjectItem/common/FinishProduct.vue')
      },
      {
        path: '/ProjectItem/Plot',
        name: 'Plot',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/ProjectItem/common/Plot.vue')
      },
      {
        path: '/ProjectItem/Information',
        name: 'Information',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/ProjectItem/common/Information.vue')
      },
      {
        path: '/WorkingArea',
        name: 'WorkingArea',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/WorkingArea/index.vue')
      },
      {
        path: '/RecycleBin',
        name: 'RecycleBin',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/RecycleBin/index.vue')
      },
      {
        path: '/KnowledgeBase',
        name: 'KnowledgeBase',
        component: () => import('./businessComponent/CoordinateDesign/External/v3/KnowledgeBase/index.vue')
      }
    ]
  },


  OldProjectTask: {
    path: '/OldProjectTask',
    name: 'OldProjectTask',
    component: () => import('./businessComponent/CoordinateDesign/External/ProjectTask/index.vue')
  },
  OldProjectItemList: {
    path: '/OldProjectItemList',
    name: 'OldProjectItemList',
    component: () => import('./businessComponent/CoordinateDesign/External/ProjectItemList/index.vue'),
    props: route => ({ projectId: route.query.projectId, projectName: route.query.projectName })
  },
  ProjectItemList: {
    path: '/ProjectItemList',
    name: 'ProjectItemList',
    component: () => import('./businessComponent/CoordinateDesign/External/v2/DesignTaskList.vue'),
    props: route => ({
      taskName: route.query.taskName,
      designTaskId: route.query.designTaskId,
      productionId: route.query.productionId,
      clientId: route.query.clientId
    })
  },
  Annotation: {
    name: 'Annotation',
    path: '/Annotation',
    component: () => import('./businessComponent/CoordinateDesign/External/v2/Comment.vue'),
    props: route => ({
      id: route.query.id,
      title: route.query.title,
      comment: route.query.comment,
      capturePicUrl: route.query.capturePicUrl,
      bimUrl: route.query.bimUrl,
      auditor: route.query.auditor,
      auditTime: route.query.auditTime,
    })
  }
  ,
  InformationPortal: {
    path: '/InformationPortal',
    name: 'InformationPortal',
    component: () => import('./businessComponent/InformationPortal/InformationPortal')
  },
  BIMPlatform: {
    path: '/BIMPlatform',
    name: 'BIMPlatform',
    component: () => import('./businessComponent/BIMPlatform/BIMPlatForm.vue')
  },
  BIMView: {
    path: '/BIMView',
    name: 'BIMView',
    component: () => import('./businessComponent/BIMView/BIMView.vue')
  },
  HelpDoc: {
    path: '/HelpDoc',
    name: 'HelpDoc',
    component: () => import('./businessComponent/helpDoc/HelpDoc.vue')
  },
  GlobalSearch: {
    path: '/GlobalSearch',
    name: 'GlobalSearch',
    component: () => import('./businessComponent/GlobalSearch/GlobalSearch.vue')
  },
  MonitorPlatform: {
    path: '/MonitorPlatform',
    name: 'MonitorPlatform',
    component: () => import('./businessComponent/MonitorPlatform/index.vue')
  },
  DataHome: {
    path: "/DataHome",
    name: "DataHome",
    component: () => import('./businessComponent/dataHome/DataHomeV2.vue'),
  },
  DigitalView: {
    path: '/DigitalView',
    name: 'DigitalView',
    component: () => import('./businessComponent/DigitalView/DigitalView.vue')
  },
  multiProject: {
    path: '/multiProject',
    name: 'multiProject',
    component: () => import('./businessComponent/DigitalView/multiProject.vue')
  },
  application: {
    codeManage: {
      path: "code-manage-list",
      name: "codeManageList",
      component: () => import('./businessComponent/codeManage/codeManagement.vue')
    },
    ganttVue: {
      //编码管理（甘特图）
      path: "/ganttVue",
      name: "ganttVue",
      component: () => import('./businessComponent/codeManage/list.vue')
    },
    contractConfiguration: {
      //合同配置
      path: "contractConfiguration",
      name: "contractConfiguration",
      component: () => import("./businessComponent/measurePayment/contractConfiguration.vue")
    },
    measurePayment: {
      //清单管理
      path: "measurePayment",
      name: "measurePayment",
      component: () => import("./businessComponent/measurePayment/contractMeasure.vue")
    },
    billQuantity: {
      //清单管理编辑界面
      path: "/billQuantity",
      name: "billQuantity",
      component: () => import("./businessComponent/measurePayment/subPage/billQuantity.vue")
    },
    midMeasure: {
      //中间计量
      path: "midMeasure",
      name: "midMeasure",
      component: () => import("./businessComponent/measurePayment/midMeasure.vue")
    },
    cbsCount: {
      //中间计量编辑界面
      path: "/cbsCount",
      name: "cbsCount",
      component: () => import("./businessComponent/measurePayment/subPage/cbsCount.vue")
    },
    measureSummary: {
      //计量汇总
      path: "measureSummary",
      name: "measureSummary",
      component: () => import("./businessComponent/measurePayment/measureSummary.vue")
    },
    summaryEdit: {
      //计量汇总（编辑）
      path: "/summaryEdit",
      name: "summaryEdit",
      component: () => import("./businessComponent/measurePayment/subPage/summaryEdit.vue")
    },
    paySummary: {
      //支付汇总
      path: "paySummary",
      name: "paySummary",
      component: () => import("./businessComponent/measurePayment/paySummary.vue")
    },
    paymentEdit: {
      //支付汇总（编辑）
      path: "/paymentEdit",
      name: "paymentEdit",
      component: () => import("./businessComponent/measurePayment/subPage/paymentEdit.vue")
    },
    //计量支付V3
    measurePaymentV3: {
      //清单管理
      path: "measurePaymentV3",
      name: "measurePaymentV3",
      component: () => import("./businessComponent/measurePaymentV3/measurePaymentV3.vue")
    },
    billQuantityV3: {
      //清单管理
      path: "/billQuantityV3",
      name: "billQuantityV3",
      component: () => import("./businessComponent/measurePaymentV3/subPage/billQuantityV3.vue")
    },
    midMeasureV3: {
      //中间计量
      path: "midMeasureV3",
      name: "midMeasureV3",
      component: () => import("./businessComponent/measurePaymentV3/midMeasureV3.vue")
    },
    measureSummaryV3: {
      //计量汇总
      path: "measureSummaryV3",
      name: "measureSummaryV3",
      component: () => import("./businessComponent/measurePaymentV3/measureSummaryV3.vue")
    },
    paymentSummaryV3: {
      //支付汇总
      path: "paymentSummaryV3",
      name: "paymentSummaryV3",
      component: () => import("./businessComponent/measurePaymentV3/paySummaryV3.vue")
    },
    summaryEditV3: {
      //计量汇总（编辑）
      path: "/summaryEditV3",
      name: "summaryEditV3",
      component: () => import("./businessComponent/measurePaymentV3/subPage/summaryEditV3.vue")
    },
    paymentEditV3: {
      //支付汇总（编辑）
      path: "/paymentEditV3",
      name: "paymentEditV3",
      component: () => import("./businessComponent/measurePaymentV3/subPage/payEditV3.vue")
    },
    investmentOverviewV3: {
      //投资总览（计量）
      path: "investmentOverviewV3",
      name: "investmentOverviewV3",
      component: () => import("./businessComponent/measurePaymentV3/investOverviewV3.vue")
    },
    planMeasureV3: {
      //计划计量（计量）
      path: "planMeasureV3",
      name: "planMeasureV3",
      component: () => import("./businessComponent/measurePaymentV3/planMeasurev3.vue")
    },
    //over
    investmentOverview: {
      //投资总览（计量）
      path: "investmentOverview",
      name: "investmentOverview",
      component: () => import("./businessComponent/measurePayment/subPage/investmentOverview.vue")
    },
    //进度日志
    progressLog: {
      path: '/progressLog',
      name: 'progressLog',
      component: () => import('./businessComponent/ProgressFillRecordV2/ProgressFillRecordV2')
    },
    progressSummary: {
      path: 'progressSummary',
      name: 'progressSummary',
      component: () => import('./businessComponent/ProgressSummary/ProgressSummary')
    },
    progressSummaryV3: {
      path: 'progressSummaryV3',
      name: 'progressSummaryV3',
      component: () => import('./businessComponent/ProgressSummary/ProgressSummaryV3')
    },
    /* end */
    overAllPlan: {
      path: 'overAllPlan',
      name: 'overAllPlan',
      component: () => import('./businessComponent/overAllPlan/overAllPlan.vue')
    },
    flatMenu: {
      path: '/flatMenu',
      name: 'flatMenu',
      component: () => import('./basicCustomComponent/FlatMenu/FlatMenu')
    },
    //施工总计划
    constructionPlan: {
      path: 'constructionPlan',
      name: 'constructionPlan',
      component: () => import('./businessComponent/constructionPlan/ConstructionPlan')
    },
    constructionPlanV3: {
      path: 'constructionPlanV3',
      name: 'constructionPlanV3',
      component: () => import('./businessComponent/constructionPlanV3/ConstructionPlan')
    },
    constructionList: {
      path: 'constructionList',
      name: 'constructionList',
      component: () => import('./businessComponent/constructionPlan/ConstructionList')
    },
    constructionListV3: {
      path: 'constructionListV3',
      name: 'constructionListV3',
      component: () => import('./businessComponent/constructionPlanV3/ConstructionList')
    },
    constructionFill: {
      path: 'constructionFill',
      name: 'constructionFill',
      // component: () => import('./businessComponent/constructionPlan/ConstructionFill')
      component: () => import('./businessComponent/ProgressFillV2/ProgressFill')
    },
    constructionFillV2: {
      path: 'constructionFillV2',
      name: 'constructionFillV2',
      // component: () => import('./businessComponent/constructionPlan/ConstructionFill')
      component: () => import('./businessComponent/ProgressFillV2/ProgressFillV2')
    },
    constructionFillV3: {
      path: 'constructionFillV3',
      name: 'constructionFillV3',
      // component: () => import('./businessComponent/constructionPlan/ConstructionFill')
      component: () => import('./businessComponent/ProgressFillV3/ProgressFill')
    },
    progressAnalysis: {
      path: 'progressAnalysis',
      name: 'progressAnalysis',
      component: () => import('./businessComponent/progressAnalysis/progressAnalysis.vue')
    },
    ScheduleOperation: {
      path: 'ScheduleOperation',
      name: 'ScheduleOperation',
      component: () => import('./businessComponent/progressAnalysis/ScheduleOperation.vue')
    },
    ScheduleOperationV3: {
      path: 'ScheduleOperationV3',
      name: 'ScheduleOperationV3',
      component: () => import('./businessComponent/progressAnalysisV3/ScheduleOperation.vue')
    },
    ScheduleDeviationAnalysis: {
      path: 'ScheduleDeviationAnalysis',
      name: 'ScheduleDeviationAnalysis',
      component: () => import('./businessComponent/progressAnalysis/scheduleDeviationAnalysis.vue')
    },
    ScehduleCorrectionRecord: {
      path: 'ScehduleCorrectionRecord',
      name: 'ScehduleCorrectionRecord',
      component: () => import('./businessComponent/progressAnalysis/scehduleCorrectionRecord.vue')
    },
    scheduleDeviationDetail: {
      path: "/scheduleDeviationDetail",
      name: "scheduleDeviationDetail",
      component: () => import("./businessComponent/progressAnalysis/scheduleDeviationDetail.vue")
    },
    SelectProject: {
      path: 'SelectProjectOperation',
      name: 'SelectProjectOperation',
      component: () => import('./businessComponent/progressAnalysis/SelectProjectOperation.vue')
    },
    SelectProjectsAnalysis: {
      path: 'SelectProjectsAnalysis',
      name: 'SelectProjectsAnalysis',
      component: () => import('./businessComponent/progressAnalysis/SelectProjectsAnalysis.vue')
    },
    //报表测试勿动
    IndependentReport: {
      path: '/IndependentReport',
      name: 'IndependentReport',
      //component: () => import('./basicCustomComponent/IndependentReport/index')
      component: () => import('./basicCustomComponent/IndependentReport/testContainer')
    },
    //全景视图
    panoramicView: {
      path: 'panoramicView',
      name: 'panoramicView',
      //component: () => import('./basicCustomComponent/IndependentReport/index')
      component: () => import('./businessComponent/panoramic/panoramicView.vue')
    },
    //质量检测
    QualityInspection: {
      path: 'QualityInspection',
      name: 'QualityInspection',
      component: () => import('./businessComponent/qualityModule/QualityInspection')
      //component: () => import('./basicCustomComponent/IndependentReport/index')
      //component: () => import('./businessComponent/qualityInspection/QualityInspection.vue')
    },
    //质量检测选择项目
    SelectProjecetInspection: {
      path: 'SelectProjecetInspection',
      name: 'SelectProjecetInspection',
      component: () => import('./businessComponent/qualityInspection/SelectProjecetInspection.vue')
    },
    //质量
    QualityModule: {
      path: 'QualityModule',
      name: 'QualityModule',
      component: () => import('./businessComponent/qualityModule/qualityModule')
    },
    QualityDB: {
      path: 'QualityDB',
      name: 'QualityDB',
      component: () => import('./businessComponent/qualityModule/QualityDB')
    },
    QualityManage: {
      path: 'qualityManage',
      name: 'qualityManage',
      component: () => import('./businessComponent/qualityManage/qualityManage.vue')
    },
    QualityRelevance: {
      path: 'qualityRelevance',
      name: 'QualityRelevance',
      component: () => import('./businessComponent/qualityModule/QualityRelevance')
    },
    ManageHelpDoc: {
      path: 'ManageHelpDoc',
      name: 'ManageHelpDoc',
      component: () => import('./businessComponent/manageHelpDoc/ManageHelpDoc.vue')
    },
    //数据总览
    componentOverview: {
      path: 'componentOverview',
      name: 'componentOverview',
      component: () => import('./businessComponent/dataOverview/componentOverview.vue')
    },
    //我的项目圈
    ProjectCircle: {
      path: 'ProjectCircle',
      name: 'ProjectCircle',
      component: () => import('./businessComponent/ProjectCircle/ProjectCircle.vue')
    },
    //企业图书馆
    docManagement: {
      path: 'docManagement',
      name: 'docManagement',
      //component: () => import('./basicCustomComponent/IndependentReport/index')
      component: () => import('./businessComponent/docManage/docManagement.vue')
    },
    //图纸资料
    DrawingDatabase: {
      path: 'DrawingDatabase',
      name: 'DrawingDatabase',
      component: () => import('./businessComponent/DrawingDatabase/DrawingDatabase.vue')
    },
    //岗位责任
    MultiRole: {
      path: 'MultiRole',
      name: 'MultiRole',
      component: () => import('./businessComponent/multiRole/MultiRole.vue')
    },
    //项目责任
    ProjectRole: {
      path: 'ProjectRole',
      name: 'ProjectRole',
      component: () => import('./businessComponent/ProjectRole/ProjectRole.vue')
    },
    //教育培训
    EducationTraining: {
      name: 'EducationTraining',
      path: 'EducationTraining',
      component: () => import('./businessComponent/educationTraining/EducationTraining.vue')
    },
    //隐患统计分析
    AnalysisOfHiddenDangers: {
      name: 'AnalysisOfHiddenDangers',
      path: 'AnalysisOfHiddenDangers',
      component: () => import('./businessComponent/analysisOfHiddenDangers/AnalysisOfHiddenDangers.vue')
    },
    //风险清单
    RiskListReport: {
      name: 'RiskListReport',
      path: 'RiskListReport',
      component: () => import('./businessComponent/riskListReport/RiskListReport.vue')
    },
    //安全分解目标
    SafetyObjDec: {
      name: 'SafetyObjDec',
      path: 'SafetyObjDec',
      component: () => import('./businessComponent/safetyObjDec/SafetyObjDec.vue')
    },
    //法律法规清单
    lawsAndRegulations: {
      name: 'lawsAndRegulations',
      path: 'lawsAndRegulations',
      component: () => import('./businessComponent/riskListReport/lawsAndRegulations.vue')
    },
    //安全经费使用台账
    securityExpensesUseLedger: {
      name: 'securityExpensesUseLedger',
      path: 'securityExpensesUseLedger',
      component: () => import('./businessComponent/riskListReport/securityExpensesUseLedger.vue')
    },
    //安全管理(看板)
    safetyManageView: {
      path: 'safetyManageView',
      name: 'safetyManageView',
      component: () => import('./businessComponent/dataHome/safetyManagement/safetyManageView.vue')
    },
    //人员管理
    PersonManagement: {
      path: 'PersonManagement',
      name: 'PersonManagement',
      component: () => import('./businessComponent/dataHome/personManagement/index.vue')
    },
    //技术交底
    TechnicalDisclosure: {
      path: 'TechnicalDisclosure',
      name: 'TechnicalDisclosure',
      component: () => import('./businessComponent/dataHome/technicalDisclosure/TechnicalDisclosure.vue')
    },
    //人员管理(看板)
    personManageView: {
      path: 'personManageView',
      name: 'personManageView',
      component: () => import('./businessComponent/dataHome/personManagement/personManageView.vue')
    },
    //进度管理
    ProgressOverview: {
      path: 'ProgressOverview',
      name: 'ProgressOverview',
      component: () => import('./businessComponent/dataHome/ProgressOverview/ProgressOverview.vue')
    },
    //人员管理看板(新)
    personViewNew: {
      path: 'personViewNew',
      name: 'personViewNew',
      component: () => import('./businessComponent/dataHome/personManagement/personViewNew.vue')
    },
    //设备管理
    DeviceManagement: {
      path: 'DeviceManagement',
      name: 'DeviceManagement',
      component: () => import('./businessComponent/dataHome/deviceManagement/index.vue')
    },
    //设备管理(看板)
    equipManageView: {
      path: 'equipManageView',
      name: 'equipManageView',
      component: () => import('./businessComponent/dataHome/deviceManagement/equipManageView.vue')
    },
    GeneralEquipment: {//一般陆地机械设备
      path: 'GeneralEquipment',
      name: 'GeneralEquipment',
      component: () => import('./businessComponent/dataHome/deviceManagement/GeneralEquipment.vue')
    },
    SpecialEquipment: {//特种设备
      path: 'SpecialEquipment',
      name: 'SpecialEquipment',
      component: () => import('./businessComponent/dataHome/deviceManagement/SpecialEquipment.vue')
    },
    ElectricalEquipment: {//临时用电设备
      path: 'ElectricalEquipment',
      name: 'ElectricalEquipment',
      component: () => import('./businessComponent/dataHome/deviceManagement/ElectricalEquipment.vue')
    },
    EnvironmentalMonitoring: {
      path: 'EnvironmentalMonitoring',
      name: 'EnvironmentalMonitoring',
      component: () => import('./businessComponent/dataHome/environmentalMonitoring/EnvironmentalMonitoring.vue')
    },
    //环境监测 山东青岛LNG
    EnvironmentalSeaport: {
      path: 'EnvironmentalSeaport',
      name: 'EnvironmentalSeaport',
      component: () => import('./businessComponent/dataHome/environmentalMonitoring/EnvironmentalSeaport.vue')
    },
    Equipmentoverview: {//设备总览
      path: 'Equipmentoverview',
      name: 'Equipmentoverview',
      component: () => import('./businessComponent/dataHome/deviceManagement/Equipmentoverview.vue')
    },
    //物资看板
    MateriaManagement: {
      path: 'MateriaManagement',
      name: 'MateriaManagement',
      component: () => import('./businessComponent/dataHome/MateriaManagement/MateriaManagement.vue')
    },
    //设备统计
    EquipmentStatistics: {
      path: 'EquipmentStatistics',
      name: 'MateriaManEquipmentStatisticsagement',
      component: () => import('./businessComponent/dataHome/EquipmentStatistics/index.vue')
    },
    AIAnalyse: {
      path: 'AIAnalyse',
      name: 'AIAnalyse',
      component: () => import('./businessComponent/dataHome/AIAnalyse/AIAnalyse.vue')
    },
    AINew: {
      path: 'AINew',
      name: 'AINew',
      component: () => import('./businessComponent/dataHome/AIAnalyse/AIAnalyseNew.vue')
    },
    AllMap: {//地图
      path: 'AllMap',
      name: 'AllMap',
      component: () => import('./businessComponent/dataHome/deviceManagement/AllMap.vue')
    },
    ShipView: {//船舶
      path: 'ShipView',
      name: 'ShipView',
      component: () => import('./businessComponent/dataHome/deviceManagement/ShipView.vue')
    },
    //应急装备和物资登记台账
    EmergencyEquAndMat: {
      path: 'EmergencyEquAndMat',
      name: 'EmergencyEquAndMat',
      component: () => import('./businessComponent/emergencyEquAndMat/index.vue')
    },
    systemConfig: {
      path: 'systemConfig',
      name: 'systemConfig',
      component: () => import('./businessComponent/systemConfig/index.vue')
    },
    CodeMbsManagement: {
      path: 'CodeMbsManagement',
      name: 'CodeMbsManagement',
      component: () => import('./businessComponent/qualityModule/CodeMbsManagement')
    },
    HiddenDangerCorrelation: {
      path: 'HiddenDangerCorrelation',
      name: 'HiddenDangerCorrelation',
      component: () => import('./businessComponent/RiskManagement/HiddenDangerCorrelation.vue')
    },
    Organizational: {
      path: 'Organizational',
      name: 'Organizational',
      component: () => import('./businessComponent/Organizational/Organizational.vue')
    },
    ProjectLocation: {
      path: 'ProjectLocation',
      name: 'ProjectLocation',
      component: () => import('./businessComponent/RiskManagement/ProjectLocation.vue')
    },
    OrganizationView: {
      path: 'OrganizationView',
      name: 'OrganizationView',
      component: () => import('./businessComponent/systemConfig/OrganizationView/OrganizationView.vue')
    },
    EngineeringArchives: {//工程档案
      path: 'EngineeringArchives',
      name: 'EngineeringArchives',
      component: () => import('./businessComponent/engineeringArchives/EngineeringArchives.vue')
    },
    PersonnelAttendance: {
      path: 'PersonnelAttendance',
      name: 'PersonnelAttendance',
      component: () => import('./businessComponent/PersonnelAttendance/PersonnelAttendance.vue')
    },
    ContractOverview: {
      path: 'ContractOverview',
      name: 'ContractOverview',
      component: () => import('./businessComponent/ContractManage/contractOverview.vue')
    },
    //物资计划
    MaterialPlan: {
      path: 'MaterialPlan',
      name: 'MaterialPlan',
      component: () => import('./businessComponent/Material/MaterialPlan.vue')
    },
    //编辑计划
    EditPlan: {
      path: 'EditPlan',
      name: 'EditPlan',
      component: () => import('./businessComponent/Material/EditPlan.vue')
    },
    //库存统计
    InventoryStatistics: {
      path: 'InventoryStatistics',
      name: 'InventoryStatistics',
      component: () => import('./businessComponent/Material/InventoryStatistics.vue')
    },
    //盘点核销
    InventoryVerification: {
      path: 'InventoryVerification',
      name: 'InventoryVerification',
      component: () => import('./businessComponent/Material/InventoryVerification.vue')
    },
    IntelligenceEquipmentBoard: {
      path: "/IntelligenceEquipmentBoard",
      name: "IntelligenceEquipmentBoard",
      component: () => import('./businessComponent/dataHome/IntelligenceEquipmentBoard/IntelligenceEquipmentBoard.vue'),
    },
    ClassLibraryDefine: {
      path: 'ClassLibraryDefine',
      name: 'ClassLibraryDefine',
      component: () => import('./businessComponent/classLibrary/ClassLibraryDefine.vue')
    },
    ClassLibraryRef: {
      path: 'ClassLibraryRef',
      name: 'ClassLibraryRef',
      component: () => import('./businessComponent/classLibrary/ClassLibraryRef.vue')
    },
    ClassModelAttribute: {
      path: 'ClassModelAttribute',
      name: 'ClassModelAttribute',
      component: () => import('./businessComponent/classLibrary/ModelAttribute.vue')
    },
    DeviceStandingBook: {
      path: 'DeviceStandingBook',
      name: 'DeviceStandingBook',
      component: () => import('./businessComponent/deviceManagement/DeviceStandingBook.vue'),
    },
    EquipmentMaintenance: {//设备保养统计
      path: 'EquipmentMaintenance',
      name: 'EquipmentMaintenance',
      component: () => import('./businessComponent/EquipmentStatistics/EquipmentMaintenance/index.vue')
    },
    EquipmentRepair: {//设备维修统计
      path: 'EquipmentRepair',
      name: 'EquipmentRepair',
      component: () => import('./businessComponent/EquipmentStatistics/EquipmentRepair/index.vue')
    },
    EquipmentUsed: {
      path: "EquipmentUsed",
      name: "EquipmentUsed",
      component: () => import("./businessComponent/EquipmentStatistics/EquipmentUsed")
    },
    EquipmentInspection: {
      path: "EquipmentInspection",
      name: "EquipmentInspection",
      component: () => import("./businessComponent/EquipmentStatistics/EquipmentInspection")
    },
  },
  workbench: {
    root: {
      name: "Workbench",
      path: "/Workbench",
      component: () => import('./businessComponent/CoordinateDesign/index.vue'),
      // redirect: { name: 'TaskCenter' }
      redirect: { name: 'NewHomePage' }
    },
    NewHomePage: {
      name: 'NewHomePage',
      path: 'NewHomePage',
      component: () => import('./businessComponent/CoordinateDesign/homePage/NewHomePage.vue')
    },
    //任务中心
    TaskCenter: {
      name: "TaskCenter",
      path: "TaskCenter",
      component: () => import("./businessComponent/CoordinateDesign/TaskCenter"),
    },
  },
  Project: {
    root: {
      name: "Project",
      path: "/Project",
      meta: {
        leftMenuShow: true,
      },
      component: () => import('./businessComponent/CoordinateDesign/index.vue'),
    },
    //项目列表
    ProjectList: {
      path: 'ProjectList',
      name: 'ProjectList',
      meta: {
        leftMenuShow: true,
      },
      component: () => import('./businessComponent/CoordinateDesign/ProjectList')
    },
    //项目统计
    ProjectStatics: {
      path: 'ProjectStatics',
      name: 'ProjectStatics',
      meta: {
        leftMenuShow: true,
      },
      component: () => import('./businessComponent/CoordinateDesign/ProjectStatics')
    },
    //工作大纲
    WorkingOutline: {
      path: 'WorkingOutline',
      name: 'WorkingOutline',
      component: () => import('./businessComponent/CoordinateDesign/WorkingOutline/index/index.vue'),
      props: route => ({
        projectId: route.query.projectId,
        isBack: route.params.isBack === "true" ? true : false,
      }),
      children: [
        //云枢列表
        {
          path: 'application-list/:schemaCode',
          name: 'ApplicationList',
          component: list.components.ApplicationList
        },
        //云枢详情
        {
          path: 'form/detail',
          name: 'formDetail',
          component: () => import('@/views/form/form-detail.vue')
        },
        //empty
        {
          path: 'empty',
          name: 'empty',
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/index/empty.vue"),
        },
        //项目策划
        {
          path: "ProjectPlanning",
          name: "ProjectPlanning",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProjectPlanning/index.vue"),
          props: route => ({ projectId: route.query.projectId }),
        },
        //专业任务
        {
          path: "ProfessionalTask",
          name: "ProfessionalTask",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProfessionalTask/index/index.vue"),
          props: route => ({ projectId: route.query.projectId }),
        },
        //设计任务
        {
          path: "DesignTask",
          name: "DesignTask",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/DesignTask/index.vue"),
          props: route => ({ projectId: route.query.projectId }),
        },
        //专业任务大纲
        {
          path: "ProfessionalDesignOutline",
          name: "ProfessionalDesignOutline",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignOutline"),
          props: route => ({
            projectId: route.query.projectId,
            zyrwdId: route.query.id,
            isCreate: route.query.isCreate ? true : false
          })
        },
        //流程跟踪
        {
          name: "workflow",
          path: "workflow-track/:workflowInstanceId/:workItemId",
          meta: { title: `${!site.title ? '' : site.title + '-'}流程跟踪` },
          component: () => import('@/views/form/workflow-track/workflow-track.vue')
        },
        //设计任务单
        {
          name: "ProfessionalDesignTask",
          path: "ProfessionalDesignTask",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignTask"),
          props: route => ({
            projectId: route.query.projectId,
            sjrwdId: route.query.id,
            isCreate: route.query.isCreate ? true : false,
            isBack: route.params.isBack === "true" ? true : false,
          })
        },
        //中间资料
        {
          path: "IntermediateData",
          name: "IntermediateData",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/IntermediateData/index.vue"),
        },
        //项目成员
        {
          path: "ProjectMember",
          name: "ProjectMember",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProjectMember/index.vue"),
        },
        //项目运行
        {
          name: "ProjectTrack",
          path: "ProjectTrack",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProjectTrack")
        },
        //设计成果
        {
          name: "DesignAchievement",
          path: "DesignAchievement",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/DesignAchievement"),
          props: route => ({ projectId: route.query.projectId }),
        },
        //生产任务单
        {
          name: "ProductionTaskList",
          path: "ProductionTaskList",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProductionTaskList"),
          props: route => ({ projectId: route.query.projectId })
        },
        //设计评审新页面
        {
          name: "DesignReview",
          path: "DesignReview",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProjectReview/DesignReview.vue"),
          props: route => ({ projectId: route.query.projectId })
        },
        // 设计评审详情页
        {
          name: "OneReviewDetail",
          path: "OneReviewDetail",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProjectReviewDetail/OneReviewDetail.vue"),
          props: route => ({ projectId: route.query.projectId, isCreate: route.query.isCreate, deviewId: route.query.id })
        },
        //技术评审详情页
        {
          name: "ArtReviewDetail",
          path: "ArtReviewDetail",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProjectReviewDetail/ArtReviewDetail.vue"),
          props: route => ({ projectId: route.query.projectId, isCreate: route.query.isCreate, deviewId: route.query.id })
        },
        // 技术方案
        {
          name: "TechnicalProtocols",
          path: "TechnicalProtocols",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProjectReview/TechnicalProtocols.vue"),
          props: route => ({ projectId: route.query.projectId })
        },
        //项目进度
        {
          name: "ProjectSchedule",
          path: "ProjectSchedule",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ProjectSchedule/index.vue"),
          props: route => ({ projectId: route.query.projectId })
        },
        {//批复资料
          name: "PreviousApprovalData",
          path: "PreviousApprovalData",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ApprovalData/ApprovalData.vue"),
          props: route => ({ projectId: route.query.projectId })
        },
        {//批复资料
          name: "LaterApprovalData",
          path: "LaterApprovalData",
          component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/ApprovalData/ApprovalData.vue"),
          props: route => ({ projectId: route.query.projectId })
        }
      ]
    },
  },
  ETaskList: {
    name: 'ETaskList',
    path: '/ETaskList',
    component: () => import('./businessComponent/CoordinateDesign/EDMPTaskList/ETaskList.vue')
  },
  //数字移交
  DigitalHandover: {
    root: {
      name: "DigitalHandover",
      path: "/DigitalHandover",
      component: () => import('./businessComponent/CoordinateDesign/index.vue'),
    },
    DigitalDelivery: {
      name: "DigitalDelivery",
      path: "DigitalDelivery",
      component: () => import("./businessComponent/CoordinateDesign/DigitalDelivery/DigitalDelivery.vue"),
    },
  },
  //数据中心
  DataHomepage: {
    root: {
      name: "DataHomepage",
      path: "/DataHomepage",
      component: () => import('./businessComponent/CoordinateDesign/index.vue'),
    },
    DataHomePage: {
      name: "DataHomePage",
      path: "DataHomePage",
      component: () => import("./businessComponent/CoordinateDesign/DataHomePage/DataHomePage.vue"),
    },
  },
  SystemManagement: {
    root: {
      name: "SystemManagement",
      path: "/SystemManagement",
      component: () => import('./businessComponent/CoordinateDesign/index.vue'),
    },
    //empty
    Empty: {
      path: 'Empty',
      name: 'Empty',
      component: () => import("./businessComponent/CoordinateDesign/WorkingOutline/index/empty.vue"),
    },
    Qualifications: {
      name: "Qualifications",
      path: "Qualifications",
      component: () => import("./businessComponent/CoordinateDesign/Qualifications"),
    },
    TaskList: {
      name: "TaskList",
      path: "TaskList",
      component: () => import("./businessComponent/CoordinateDesign/TaskList/TaskList.vue"),
    },
    DocumentLibrary: {
      name: 'DocumentLibrary',
      path: 'DocumentLibrary',
      component: () => import('./businessComponent/CoordinateDesign/documentLibrary/DocumentLibrary.vue')
    },
    CommonOpinions: {
      name: 'CommonOpinions',
      path: 'CommonOpinions',
      component: () => import('./businessComponent/CoordinateDesign/CommonOpinions/index.vue')
    }
  },
};
