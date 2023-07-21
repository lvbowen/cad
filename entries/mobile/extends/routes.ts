import type {CustomerComponentRouters} from './type';

// @ts-ignore
export default <CustomerComponentRouters>{
  myIndex: {
    path: '/MyIndex/MyIndex',
    name: 'myIndex',
    isNav: true,
    locale:'languages.common.my',
    navIndex:3,
    component: () => import('./businessComponent/MyIndex/MyIndex')
  },
  BIM:{
    path:'/Bim/Bim',
    name:'bim',
    isNav:true,
    locale:'languages.common.bim',
    navIndex:2,
    component: () => import('./businessComponent/BIM/BIM')
  },
  MailList: {
    path: '/mailList',
    name:'mailList',
    isNav: true,
    component: () => import('./businessComponent/MailList/index.vue'),
  },
  ProjectCircle: {
    path: '/ProjectCircle',
    name:'ProjectCircle',
    isNav: true,
    component: () => import('./businessComponent/ProjectCircle/index.vue'),
  },
  Contacts: {
    path: '/contacts',
    name:'contacts',
    isNav: true,
    component: () => import('./businessComponent/MailList/contacts.vue'),
  },
  HomePage: {
    path: '/homePage',
    name:'homePage',
    isNav: true,
    component: () => import('./businessComponent/HomePage/index.vue'),
  },
  AboutMeMoment:{
    path: '/AboutMeMoment',
    name:'AboutMeMoment',
    isNav: true,
    component: () => import('./businessComponent/HomePage/AboutMeMoment.vue'),
  },
  AboutMeDetail:{
    path: '/AboutMeDetail',
    name:'AboutMeDetail',
    isNav: true,
    component: () => import('./businessComponent/HomePage/AboutMeDetail.vue'),
  },
  Notice: {
    path: '/notice',
    name:'notice',
    isNav: true,
    component: () => import('./businessComponent/Notice/index.vue'),
  },
  DesignTaskDetail: {
    path: '/DesignTaskDetail',
    name: 'DesignTaskDetail',
    component: ()=> import('./businessComponent/designTaskDetail/DesignTaskDetail.vue'),
    props: route => ({
      sjrwdId: route.query.sjrwdId
    })
  },
  Annotation: {
    path: '/Annotation',
    name: 'Annotation',
    component: ()=> import('./businessComponent/designTaskDetail/Annotation.vue')
  },
  TodoWorks: {
    path: '/TodoWorks',
    name: 'TodoWorks',
    component: ()=> import('./businessComponent/designTaskDetail/TodoWorks.vue')
  },
  AddAnnotation: {
    path: '/AddAnnotation',
    name: 'AddAnnotation',
    component: ()=> import('./businessComponent/designTaskDetail/AddAnnotation.vue')
  },
  MobileRelayRoute: {
    path: '/MobileRelayRoute',
    name: 'MobileRelayRoute',
    component: ()=> import('./businessComponent/designTaskDetail/MobileRelayRoute.vue')
  },
  RedirectPc: {
    path: '/RedirectPc',
    name: 'RedirectPc',
    component: ()=> import('./businessComponent/designTaskDetail/RedirectPc.vue')
  },
  Business: {
    path: '/business',
    name:'business',
    isNav: true,
    locale:'languages.common.business',
    navIndex:1,
    component: () => import('./businessComponent/business/index.vue'),
  },
  quickEntrance: {
    path: '/business/quickEntrance',
    name: 'quickEntrance',
    component: () => import('./businessComponent/QuickEntrance/index.vue'),
    meta: {
      hideFootbar: true
    }
  },
  editAllApplication: {
    path: '/business/editAllApplication',
    name: 'editAllApplication',
    component: () => import('./businessComponent/EditAllApplication/index.vue'),
    meta: {
      hideFootbar: true
    }
  },
  allApplication: {
    path: '/business/allApplication',
    name: 'allApplication',
    component: () => import('./businessComponent/AllApplication/index.vue'),
    meta: {
      hideFootbar: true
    }
  },
  panoramicView: {
    path: '/panoramicView',
    name: 'panoramicView',
    component: () => import('./businessComponent/PanoramicView/index.vue')
  },
  details: {
    path: '/business/app/:id',
    name: 'details',
    component: () => import('./businessComponent/AllApplication/Details.vue'),
    meta: {
      hideFootbar: true
    }
  },
  ScheduleDetails: {
    path: '/apps/ScheduleDetails',
    name: 'ScheduleDetails',
    component: () => import('./businessComponent/Schedule/ScheduleDetails.vue')
  },
  ScheduleRecord: {
    path: '/apps/ScheduleRecord',
    name: 'ScheduleRecord',
    component: () => import('./businessComponent/Schedule/ScheduleRecord.vue')
  },
  ScheduleTask: {
    path: '/apps/ScheduleTask',
    name: 'ScheduleTask',
    component: () => import('./businessComponent/Schedule/ScheduleTask.vue')
  },
  ScheduleReport: {
    path: '/apps/ScheduleReport',
    name: 'ScheduleReport',
    component: () => import('./businessComponent/Schedule/ScheduleReport.vue')
  },
  ScheduleReportV2: {
    path: '/apps/ScheduleReportV2',
    name: 'ScheduleReportV2',
    component: () => import('./businessComponent/Schedule/ScheduleReportV2.vue')
  },
  ScheduleTree: {
    path: '/apps/ScheduleTree',
    name: 'ScheduleTree',
    component: () => import('./businessComponent/Schedule/ScheduleTree.vue')
  },
  ScheduleSituationV2: {
    path: '/apps/ScheduleSituationV2',
    name: 'ScheduleSituationV2',
    component: () => import('./businessComponent/Schedule/ScheduleSituationV2.vue')
  },
  ScheduleSituation: {
    path: '/apps/ScheduleSituation',
    name: 'ScheduleSituation',
    component: () => import('./businessComponent/Schedule/ScheduleSituation.vue')
  },
  qyLibrary: {
    path: '/qyLibrary',
    name: 'qyLibrary',
    component: () => import('./businessComponent/qyLibrary/index.vue'),
    meta: {
      hideFootbar: true
    }
  },
  ProgressAnalysis: {
    path: '/apps/ProgressAnalysis',
    name: 'ProgressAnalysis',
    component: () => import('./businessComponent/Schedule/ProgressAnalysis.vue')
  },
  ProgressAnalysisV3: {
    path: '/apps/ProgressAnalysisV3',
    name: 'ProgressAnalysisV3',
    component: () => import('./businessComponent/Schedule/ProgressAnalysisV3.vue')
  },
  ProgressSummary: {
    path: '/apps/ProgressSummary',
    name: 'ProgressSummary',
    component: () => import('./businessComponent/Schedule/ProgressSummary.vue')
  },
  ProgressDetails: {
    path: '/apps/ProgressDetails',
    name: 'ProgressDetails',
    component: () => import('./businessComponent/Schedule/ProgressDetails.vue')
  },
  QualityFill:{
    path: '/apps/QualityFill',
    name: 'QualityFill',
    component: () => import('./businessComponent/Quality/qualityFill.vue')
  },
  QualityDataBase:{
    path: '/apps/QualityDataBase',
    name: 'QualityDataBase',
    component: () => import('./businessComponent/Quality/qualityDataBase.vue'),
    meta: {
      hideFootbar: true
    }
  },
  InspectionAcceptance: {
    path: '/apps/InspectionAcceptance',
    name: 'InspectionAcceptance',
    component: () => import('./businessComponent/Quality/InspectionAcceptance.vue')
  },
  QualityOverview:{
    path:'/apps/QualityOverview',
    name:'QualityOverview',
    component: () => import('./businessComponent/Quality/qualityOverview.vue'),
  },
  HiddendangerStatistics: {
    path: '/apps/HiddendangerStatistics',
    name: 'HiddendangerStatistics',
    component: () => import('./businessComponent/Security/HiddendangerStatistics.vue')
  },
  HiddenDangerSummary: {
    path: '/apps/HiddenDangerSummary',
    name: 'HiddenDangerSummary',
    component: () => import('./businessComponent/Security/HiddenDangerSummary.vue')
  },
  HiddenDangerDetails: {
    path: '/apps/HiddenDangerDetails',
    name: 'HiddenDangerDetails',
    component: () => import('./businessComponent/Security/HiddenDangerDetails.vue')
  },
  HiddenDangerLog: {
    path: '/apps/HiddenDangerLog',
    name: 'HiddenDangerLog',
    component: () => import('./businessComponent/Security/HiddenDangerLog.vue')
  },
  QualityInspectionSummary: {
    path: '/apps/QualityInspectionSummary',
    name: 'QualityInspectionSummary',
    component: () => import('./businessComponent/Quality/QualityInspectionSummary.vue')
  },
  QualityInspectionDetails: {
    path: '/apps/QualityInspectionDetails',
    name: 'QualityInspectionDetails',
    component: () => import('./businessComponent/Quality/QualityInspectionDetails.vue')
  },
  QualityInspectionLog: {
    path: '/apps/QualityInspectionLog',
    name: 'QualityInspectionLog',
    component: () => import('./businessComponent/Quality/QualityInspectionLog.vue')
  },
  PersonnelFiles: {
    path: '/apps/PersonnelFiles',
    name: 'PersonnelFiles',
    component: () => import('./businessComponent/Security/PersonnelFiles.vue')
  },
  PersonDetail: {
    path: '/apps/PersonDetail',
    name: 'PersonDetail',
    component: () => import('./businessComponent/Security/PersonDetail.vue')
  },
  MeasurementPayment: {
    path: '/apps/MeasurementPayment',
    name: 'MeasurementPayment',
    component: () => import('./businessComponent/Metering/MeasurementPayment.vue')
  },
  environmental: {
    path: '/apps/environmental',
    name: 'environmental',
    component: () => import('./businessComponent/environmental/index.vue')
  },
  securityoverview: {//安全总览
    path: '/apps/securityoverview',
    name: 'securityoverview',
    component: () => import('./businessComponent/securityoverview/index.vue')
  },
  //图纸资料
  drawingDatabaseAll: {
    path: '/drawingDatabaseAll',
    name: 'drawingDatabaseAll',
    component: () => import('./businessComponent/DrawingDatabaseAll/index.vue')
  },
  //设置
  setUp: {
    path: '/setUp',
    name: 'setUp',
    component: () => import('./businessComponent/MyIndex/setUp.vue')
  },
  //视频监控
  VideoSurveillance: {
    path: '/apps/VideoSurveillance',
    name: 'VideoSurveillance',
    component: () => import('./businessComponent/VideoSurveillance/index.vue')
  },
  yingShiYunDetail: {
    path: '/apps/yingShiYunDetail',
    name: 'yingShiYunDetail',
    component: () => import('./businessComponent/VideoSurveillance/yingShiYunDetail.vue')
  },
  QingshiDetail: {
    path: '/apps/QingshiDetail',
    name: 'QingshiDetail',
    component: () => import('./businessComponent/VideoSurveillance/qingShiDetail.vue')
  },
  appRdp: {
    path: '/appRdp',
    name: 'appRdp',
    isNav: true,
    component: ()=>import('./businessComponent/AllApplication/mobileRdp.vue')
  },
  AppMaterialManage: {
    path: '/AppMaterialManagement',
    name: 'AppMaterialManagement',
    component: ()=>import('./businessComponent/appMaterialManage/AppMaterialManagement.vue')
  },
  EquipmentRegistration: {
    path: '/apps/EquipmentRegistration',
    name: 'EquipmentRegistration',
    component: ()=>import('./businessComponent/Equipment/EquipmentRegistration.vue')
  },
  EquipmentDetails: {
    path: '/EquipmentDetails',
    name: 'EquipmentDetails',
    component: ()=>import('./businessComponent/Equipment/EquipmentDetails.vue')
  },
  MaintenancePlan: {
    path: '/MaintenancePlan',
    name: 'MaintenancePlan',
    component: ()=>import('./businessComponent/Equipment/MaintenancePlan.vue')
  },
  MaintainDetails: {
    path: '/MaintainDetails',
    name: 'MaintainDetails',
    component: ()=>import('./businessComponent/Equipment/MaintainDetails.vue')
  },
  RepairWorkOrder: {
    path: '/RepairWorkOrder',
    name: 'RepairWorkOrder',
    component: ()=>import('./businessComponent/Equipment/RepairWorkOrder.vue')
  },
  InspectTasks: {
    path: '/apps/InspectTasks',
    name: 'InspectTasks',
    component: ()=>import('./businessComponent/Equipment/InspectTasks.vue')
  },
  InspectPlans: {
    path: '/apps/InspectPlans',
    name: 'InspectPlans',
    component: ()=>import('./businessComponent/Equipment/InspectPlans.vue')
  },
};
