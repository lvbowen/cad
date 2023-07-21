import {HttpResponse} from "@cloudpivot/api/src/response";
import * as Type from "../type"
import Axios from "axios";
import {AnnotationAttachment} from "../type";

//获取项目配置
export const getProjectConfig: (params: { path: string }) => Promise<HttpResponse<Type.SystemConfig>> = (params) => {
  return Axios.get('/api/iconManage/getSystemConfig', {params});
}

//BIM模型使用
export const getObjectId:(params:Type.QueryObjectId) =>Promise<HttpResponse<Type.QueryObjectId>> = (params)=>{
  return Axios.post('/api/runtime/query/list',{params});
}

//获取子表数据
export const getChildTableData:(params:Type.QueryLayer) =>Promise<HttpResponse<Type.QueryLayer>> = (params)=>{
  return Axios.get('/api/runtime/form/load',{params});
}

//获取构建设计信息
export const getBuildDesignInfo:(params:Type.QueryDesignInfo) =>Promise<HttpResponse<{[propsName:string]:Array<{[props:string]:string}>}>> = (params) =>{
  return Axios.get('/bim/data/getCardData', {params});
}

//获取构建施工信息
export const getBuildRoadWork:(params:Type.QueryRoadWork) =>Promise<HttpResponse<{[propsName:string]:string}>> = (params) =>{
  return Axios.get('/bim/data/getConstructData', {params});
}

//获取项目信息
export const getBimTree:(params:Type.bimTreeInfo) =>Promise<HttpResponse<{[propsName:string]:string}>> = (params) =>{
  return Axios.get('/api/groupView/bimTree', {params});
}

//获取BIM项目信息
export const getProjectTree:(params:Type.bimProjectInfo) =>Promise<HttpResponse<Array<{ [propsName: string]: string }|null>>> = (params) =>{
  return Axios.get('/api/groupView/getProjectTree', {params});
}

export const initCard: (params: Type.initCardParams) => Promise<HttpResponse<Type.initCardRes>> = (params) => {
  return Axios.get('/bim/data/initCard', {params});
}

export const getSubTab: (params: Type.getSubTabParams) => Promise<HttpResponse<Type.getSubTabRes>> = (params) => {
  return Axios.get('/bim/data/getSubTab', {params});
}

export const getAllCardData: (params: Type.getAllCardDataParams) => Promise<HttpResponse<Type.getAllCardDataRes>> = (params) => {
  return Axios.post('/bim/data/getAllCardData', params);
}

export const getMeasureCard: (params: Type.getMeasureCardParams) => Promise<HttpResponse<Type.getMeasureCardRes>> = (params) => {
  return Axios.post('/bim/measure/v3/getMeasureCard', params);
}

export const getScheduleCard: (params: Type.getMeasureCardParams) => Promise<HttpResponse<Type.getMeasureCardRes>> = (params) => {
  return Axios.post('/bim/wbs/getScheduleCardV3', params);
}


export const getColumns: (params: Type.getColumnsParams) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/app/query/get', {params});
}

export const getFormUrl: (params: {
  bizObjectId: string;
  schemaCode?: string;
  formCode?: string
}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/runtime/form/get_form_url', {params});
}

export const getQBSTree: (params:Type.getQBSTreeParams) => Promise<HttpResponse<Array<Type.QualityTable>>> = (params) => {
  return Axios.post('/api/quality/v2/analyse/node', params);
}
export const queryQualityBizSheetList: (params: {
  currentPage: number;
  pageNum: number;
  qbsIds?: Array<string>;
  qbsId?: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/quality/v2/qbs/bizsheet/bind', params);
}

export const getWorkFlowFormDetailUrl: (params: {
  bizObjectId: string;
  schemaCode: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/runtime/form/get_form_url', {params});
}

//统计项目质量情况
export const getAnalyseProject: (params: {
  appCode: string,
  projectName: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/quality/v2/analyse/project',{params})}
//统计文档已填报折线图
  export const getBizHandle: (params: {
    appCode: string,
    projectName: string,
    startTime?: string,
    endTime?: string,
  }) => Promise<HttpResponse<any>> = params => {
    return Axios.get('/api/quality/v2/analyse/biz/handle',{params})}

//获取组织架构
export const getDepartments: (params: {
  appCode: string,
}) => Promise<HttpResponse<Array<Type.Department>>> = params => {
  return Axios.get('/api/define/department/getDepartments', {params});
}

//获取组织架构
export const userByDepId: (params: {
  deptId: string,page:number,size:number
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/contacts/userByDepId', {params});
}

//质量总览
export const getQualityView: (params: {
  appCode: string,
  projectName: string,
}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/mobile/qualityCheck/getQualityView', {params});
}

//获取bim智慧工地环境数据看板
export const getBimEnvironmentData: (params: {
  appCode: string,projectName:string,groupId:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/bim/smartConstruction/getBimEnvironmentData', {params})
}

//根据元素类别获取趋势分析
export const getEnvironmentDataTrend: (params: {
  projectCode: string,projectName:string,elementType:string,time:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/environmentManage/environmentDataTrend', {params})}

//获取所有的隐患日志
export const getAllDangerLog: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/mobile/danger/getAll', {params});
}

//获取按照日期分类统计的隐患日志
export const getByDate: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/mobile/danger/getByDate', {params});
}

//获取按照日期和地区分类统计的隐患日志
export const getByDateAndArea: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/mobile/danger/getByDateAndArea', {params});
}

//分页进度日志查询APP端V2.0
export const getQueryLog: (params: {
  projectCode: string,projectName:string,queryStartDate?:string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/scheduleLogV2/queryLogAPP', {params});
}

//根据进度日志id 查询进度bs列表(分页)V2.0
export const getPageReport: (params: {
  projectCode: string,pageNum:number,pageSize?:number,id: string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/scheduleReportBSV2/pageReportBSByLogId', {params});
}

//获取评论，分页
export const getCommentListPage: (params: {
  appCode: string,projectName:string,type:string,checkDate:string,checkArea:string,schedulePlanId?:string,current:number,size:number
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/mobile/comment/getCommentListPage', {params});
}

//新增评论
export const insertComment: (params: {
  appCode: string,commentRecord:any
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.post('/api/mobile/comment/insertComment', params);
}

//删除评论
export const deleteComment: (params: {
  appCode: string,dataId:string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/mobile/comment/deleteComment', {params});
}

//获取所有的质检日志
export const getAllQualityCheck: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/mobile/qualityCheck/getAll', {params});
}

//获取按照日期分类统计的质检日志
export const getByDateQualityCheck: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/mobile/qualityCheck/getByDate', {params});
}

//获取按照日期和地区分类统计的质检日志
export const getByDateAndAreaQualityCheck: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/mobile/qualityCheck/getByDateAndArea', {params});
}

//获取安全看板
export const getSecurityData: (params: {
  appCode: string,projectName:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/securityReport', {params})
}

//获取所有的巡检日志
export const getAllXcxj: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/mobile/danger/getAllXcxj', {params})
}

//获取按照日期分类统计的巡检日志
export const getXcxjByDate: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/mobile/danger/getXcxjByDate', {params})
}

//获取按照日期和地区分类统计的巡检日志
export const getXcxjByDateAndArea: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/mobile/danger/getXcxjByDateAndArea', {params})
}

//获取所有的质量验收日志
export const getAllZlys: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/mobile/qualityCheck/getAllZlys', {params})
}

//获取按照日期分类统计的质量验收日志
export const getZlysByDate: (params: {
  appCode: string,projectName:string,date?:string,area?:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/mobile/qualityCheck/getZlysByDate', {params})
}

export const getRdpView: (params: {
  reportCode: string, appCode: string, projectName: string,type: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/report/getRdpView', {params})
}

//获取未读消息数量
export const getUnReadMessageCount: (params: {
  projectCode: string,projectName:string,periodType?:string,userId?:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/ticketMessage/v2/getUnReadMessageCount', {params})
}

//查询用户信息
export const getSearchUser: (params: {
  wd: string,page:number,size:number,corpId:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/contacts/searchUser', {params})
}
//获取组织机构下人员
export const searchDepartmentUsers: (params: {
  appCode: string,
  deptId: string,
  keyword: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/define/department/searchUser', {params});
}

export const getMoblieFrontPage720: (params: {
  projectName: string,
  projectCode: string,
  userId: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/moblieFrontPage/moblieFrontPage', {params});
}

//获取我的消息列表
export const getMyMessage: (params: {
  projectName: string,
  projectCode: string,
  userId?: string,
  periodType?:string,
  messageType?:string,
  isRead?:boolean,
  page: number,
  size: number
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.MyMessage>>>> = params => {
  return Axios.get('/api/ticketMessage/v2/getMessageRecord', {params});
}

//设置为已读信息
export const addUserMessageRelatio: (params: {
  projectCode:string,
  projectName:string,
  isRead:boolean,
  messageId: string,
  messageType:number,
  periodType?:number,
  userId:string
}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/ticketMessage/addUserMessageRelatio', params);
}

//获取应用的视频配置(青柿/萤石云)
export const getVideoType: (params: {
  appCode:string,
}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/qingVideo/getVideoType', {params});
}

//根据项目名称获取设备,分页(青柿)
export const getDevicePageByProjectNameQingShi: (params: {
  appCode:string,projectName:string,page:number,size:number
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.QingShiDeviceData>>>> = (params) => {
  return Axios.get('/api/qingVideo/getDevicePageByProjectName', {params});
}


//获取设备截图(青柿)
export const getChannelSnapQingVideo: (params: {
  deviceId:string,channelId:string
}) => Promise<HttpResponse<string>> = (params) => {
  return Axios.get('/api/qingVideo/getChannelSnap', {params});
}

// 云台控制(青柿-上线)
export const videoControlQingVideo: (params: { deviceId:string,channelId:string,command:string,_:string}) => Promise<HttpResponse<string>> = params => {
  return Axios.get('/QingLive/api/v1/control/ptz?serial='+params.deviceId+'&code='+params.channelId+'&command='+params.command, {});
}

// //云台控制(青柿-本地测试)
// export const videoControlQingVideo: (params: { deviceId:string,channelId:string,command:string,_:string}) => Promise<HttpResponse<string>> = params => {
//   return Axios.get('/api/qingVideo/videoControl', {params});
// }


//实时直播 - 开始直播(青柿)
export const startQingVideo: (params: { serial:string,code:string}) => Promise<any> = params => {
  return Axios.get('/QingLive/api/v1/stream/start', {params});
}

// //实时直播 - 开始直播(青柿——本地测试)
// export const startQingVideo: (params: { serial:string,code:string}) => Promise<any> = params => {
//   return Axios.get('/api/qingVideo/getVideoStartMsg', {params});
// }

//standardPrint
export const getStandardTemplate: (params: { schemaCode: string }) => Promise<HttpResponse<Type.SchemaCodeTemplate>> = (params) => {
  return Axios.get('/api/standardPrint/getModel', {params});
}

//打印预览
export const getPrintView: (params: { schemaCode: string, id: string }) => Promise<HttpResponse<Type.SchemaCodeTemplate>> = (params) => {
  return Axios.get('/api/standardPrint/printView', {params});
}

export const getPageOrigin: (params: {
  reportCode: string;
  appCode: string;
}) => Promise<HttpResponse<Array<Type.ReportPageOrigin>>> = (params)=> {
  return Axios.get('/api/define/function/getPageOrigin',{params})
}

export const getMaterialInfo: (params:Type.GetMaterialInfoParams) => Promise<HttpResponse<Type.MaterialInfo>> = (params ) => {
  return Axios.get('/api/materialManage/report',{ params })
}
//TODO START 拍照批注
export const getMyDesignTaskToDoList: (params:{
  appCode: string;
  pageNum: number;
  pageSize: number;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.TodoWorkItem>>>> = (params ) => {
  return Axios.get('/api/xtsjProject/designTaskManage/getMyDesignTaskToDoList',{ params })
}
//获取设计任务单详情基本信息接口
export const getDesignTaskInfoByH5: (params:{
  appCode: string;
  id: string;
  personId: string;
}) => Promise<HttpResponse<Type.DesignTaskInfo>> = (params ) => {
  return Axios.get('/api/xtsjProject/designTaskManage/getDesignTaskInfoByH5',{ params })
}
//获取成果文件展示批注列表
export const getAnnotationListByDesignFileH5: (params:{
  appCode: string;
  id: string;
  designFileId: string;
  personId: string;
}) => Promise<HttpResponse<Type.AnnotationList>> = (params ) => {
  return Axios.get('/api/xtsjProject/designTaskManage/getAnnotationListByDesignFileH5',{ params })
}
//删除批注
export const deleteAnnotation: (params: {
  appCode: string;
  id: string;
  personId: string
})=> Promise<HttpResponse<string>> = (params) => {
  return  Axios.delete('/api/xtsjProject/designTaskManage/deleteAnnotationByH5', { params })
}
//校审意见
export const submitDesignTaskWorkflowH5: (params: {
  appCode: string;
  sjrwdId:string;
  desc:string;
}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/xtsjProject/designTaskManage/submitDesignTaskWorkflowH5', params);
}
//驳回
export const rejectDesignTaskWorkflowH5: (params: {
  id:string;
  appCode:string;
  workflowInstanceId: string;
  comment: string;
}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/xtsjProject/taskManage/rejectDesignTaskWorkflowH5', params);
}
//根据批注id查询批注详情
export const getAnnotationByAnnotationIdH5: (params:{
  appCode: string;
  annotationId: string;
}) => Promise<HttpResponse<Type.AnnotationDetails>> = (params ) => {
  return Axios.get('/api/xtsjProject/designTaskManage/getAnnotationByAnnotationIdH5',{ params })
}
//云枢文件上传
export const yunFileUpload: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/aliyun/upload', params, fileHeader);
}
//保存手工批注接口
export const saveAnnotationH5: (params: {
  appCode: string;
  id:string;
  sjrwdId:string;
  personId:string;
  annotationName: string;
  annotationDesc: string;
  attachmentList: Type.AnnotationAttachment[]
}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/xtsjProject/designTaskManage/saveAnnotationH5', params);
}
//获取真实地址
export const getRealUrl:(params:{
  client:string;
  appCode:string;
  param:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.post("/api/xtsjProject/systemManage/parseEncodeParam",params);
}
//TODO END
