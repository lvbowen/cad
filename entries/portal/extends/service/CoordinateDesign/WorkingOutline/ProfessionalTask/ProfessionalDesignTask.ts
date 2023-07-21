import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";
import {WorkOutlineModel, WorkOutlineTemplate, YunAttachmentFile} from "../../../../type";

//获取设计任务单
interface SelectOption{
  id:string,
  type:number
}
interface DesignTask{
  submitButton:boolean
  retainButton:boolean
  agreeButton:boolean
  rejectButton:boolean
  receiveButton:boolean
  achievementSubmitButton:boolean
  achievementRetainButton:boolean
  id:string
  workflowInstanceId:string
  workItemId:string
  xmlbId:string
  zyrwdId:string
  taskNumber:string
  engineeringName:string
  engineeringStage:string
  professionName:string
  achievementNameprofessionTaskName:string
  achievementName:string
  manufacturer:string|SelectOption[]
  achievementNumber:string
  specialNumber:string
  versionNumber:string
  useSoftwareName:string
  taskType:string
  proofreadFlag:string//是否需要审核
  proofreadLevel:string//审核级别
  designGuiderFlag:string//是否需要指导
  countersignFlag:string//是否需要会签
  projectManagerAudit:string//项目经理审核
  designer:string|SelectOption[]//设计人
  designGuider:string|SelectOption[]//设计指导
  checker:string|SelectOption[]//校核人
  auditor:string|SelectOption[]//审核人
  projectManager:string|SelectOption[]//项目经理
  countersigned:string|SelectOption[]//会签人
  departmentChief:string|SelectOption[]//部门主管总工
  companyChief:string|SelectOption[]//院主管总工
  taskTime:string|null//任务下达时间
  planStartTime:string|null//计划开始时间
  planEndTime:string|null//计划结束时间
  planDuration:string//计划工期
  workContent:string//工作类容及要求
  signSubject:string//签收专业
  signer:string|SelectOption[]//签收人
  taskRatio:string|number
  unsignedPerson:string|SelectOption[]//未签收人员
  signedPerson:string|SelectOption[]//已签收人员
  profession:string
  workflowTokenId:string;
  activityCode:string;
  activityName:string;
  rejectToActivityCode:string;
}

export const designTask:(params:{appCode:string,projectId:string,sjrwdId:string})=>Promise<HttpResponse<DesignTask>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/getDesignTask",{params});
}

//新增设计任务单
export const createDesignTask:(params:{appCode:string,projectId:string,zyrwdId:string})=>Promise<HttpResponse<DesignTask>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/createDesignTask",{params});
}

export interface BizObject{
  id:string,
  data: {
    auditor:{id: string,type: number}[]|null,
    checker:{id: string,type: number}[]|null,
    chief_engineer:{id: string,type: number}[]|null,
    collaborate_flag:string|null|null,
    company_chief:{id: string,type: number}[]|null,
    company_chief_engineer:{id: string,type: number}[]|null,
    company_manager:{id: string,type: number}[]|null,
    countersign_flag:string|null|null,
    add_signer_flag: string;
    countersigned:{id: string,type: number}[]|null,
    currentStatus: string|null,
    department_chief:{id: string,type: number}[]|null,
    design_guider:{id: string,type: number}[]|null,
    design_guider_flag:string|null,
    designer:{id: string,type: number}[]|null,
    add_signer:{id: string,type: number}[],
    engineering_location:string|null,
    engineering_name: string|null,
    engineering_number:string|null,
    engineering_stage: string|null,
    industryType: string|null,
    manufacturer:{id: string,type: number}[]|null,
    manufacturer_chief_engineer:{id: string,type: number}[]|null,
    manufacturer_vice_engineer:{id: string,type: number}[]|null,
    manufacturer_vice_manager:{id: string,type: number}[]|null,
    partners:{id: string,type: number}[]|null,
    plan_duration:string|number|null
    plan_end_time:string|null
    plan_start_time:string|null
    profession:{id: string,type: number}[]|null,
    profession_name:string|null,
    profession_task_name:string|null,
    projectType:string|null,
    project_level:string|null,
    project_manager:{id: string,type: number}[]|null,
    project_manager_audit:string|null,
    proofread_flag:string|null,
    proofread_level:string|null,
    sign_subject:string|null
    signed_person:{id: string,type: number}[]|null,
    signer:{id: string,type: number}[]|null,
    task_ratio:string|null
    task_time:string|null
    task_type:string|null,
    unsigned_person:{id: string,type: number}[]|null,
    use_software_name:string|null,
    work_content:string|null

    zyrwd_id:string,
    xmlb_id:string,
    id: string,
    XTSJ_design_para: any[],
    modelType: string;
    engineeringType: string;
    achievement_number: string;
    task_number: string;
    fieldParam1: string;
    projectId: string
  },
  schemaCode: "XTSJ_sjrwd",
  sheetCode: "XTSJ_sjrwd",
  workflowInstanceId: string|null
}


//查询任务成果版本数
export const designAchievementCount:(params:{appCode:string,sjrwdId:string})=>Promise<HttpResponse<{release:number,total:number}>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/countDesignAchievement",{params});
}

//查询任务成果版本类容
export const designAchievement:(params:{appCode:string,sjrwdId:string,version:number})=>Promise<HttpResponse<any>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/getDesignAchievement",{params});
}

//附件提交操作
export interface AchievementbizObject{
  id:string,
  data: {
    version:string,
    attachment:{
      id:string|null,
      remarks:string|null,
      createdTime:string,
      modifiedTime:string|null,
      deleted:false,
      createdBy:string|null,
      modifiedBy:string|null,
      refId:string,
      schemaCode:string|null,
      name:string,
      fileExtension:string|null,
      fileSize:number,
      mimeType:string,
      base64ImageStr:string,
    }[],
    attachment_amount:string,
    XTSJ_rwsjcg_file:[],
    XTSJ_design_file: {
      engine_file_name: string|null,
      engine_model_id: string|null,
      engine_project_id: string|null,
      file_address: string|null,
      file_name:string|null,
      file_type: string|null,
      id: string|null,
      lightweight_address: string|null,
      upload_date: string|null,
      attachments:any
    }[],
    id:string,
    sjrwd_id:string,
  },
  schemaCode: "XTSJ_rwsjcg",
  sheetCode: "XTSJ_rwsjcg",
  workflowInstanceId: string|null
}
export const achievementSubmit:(params:{bizObject:AchievementbizObject,departmentId:string,replayToken:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/runtime/form/submit",{...params,workflowCode:null,workItemId:null,workflowInstanceId:null,agree:"true",actionCode:"submit",formType:"2"});
}

//附件暂存操作
export const achievementSave:(params:{bizObject:AchievementbizObject,departmentId:string,replayToken:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/runtime/form/save",{...params,workflowCode:null});
}

//获取批注列表筛选条件
export const getAnnotationFilter:(params:{appCode:string,versionId:string,})=>Promise<HttpResponse<any>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/getAnnotationFilter",{params});
}

//获取批注列表
export const getAnnotationList:(params:{appCode:string,versionId:string,checkerId:string, workflowNode:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/getAnnotationList",{params});
}

//轻量化转换
export const getTransferModel: (params: {
  appCode: string;
  url: string;
  name: string;
  vaultId: string;
  filed: string;
}) => Promise<HttpResponse<string>> = (params) => {
  return Axios.get('/api/xtsjProject/systemManage/transferModel',{ params })
}
//刷新状态
export const getModelTrans: (params: {
  appCode: string;
  id: string;
}) => Promise<HttpResponse<string>> = (params) => {
  return Axios.get('/api/xtsjProject/systemManage/getModelTrans',{ params })
}
//修改设计说明书子表数据
export const updateDesignSpecificationParagraph: (params: {
  appCode: string;
  id: string;
  designPerson: string;
  professionTaskId: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/xtsjProject/designTaskManage/updateDesignSpecificationParagraph', params);
}
//一键创建设计说明书子任务
export const createDesignSpecificationSubTask: (params: {
  appCode: string;
  id: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/xtsjProject/designTaskManage/createDesignSpecificationSubTask', params);
}
//在线编辑文档-start
//创建在线编辑文件
export const createOnlineWebFile: (params: {
  id: string;
  schemaCode: string;
  refId: string;
}) => Promise<HttpResponse<WorkOutlineModel>> = (params) => {
  return Axios.get('/api/xtsjProject/systemManage/createOnlineWebFile',{ params })
}
//保存在线编辑文件
export const saveOnlineWebFile: (params: {
  fileName: string;
  tmpFileName: string;
}) => Promise<HttpResponse<YunAttachmentFile>> = (params) => {
  return Axios.get('/api/xtsjProject/systemManage/saveOnlineWebFile',{ params })
}
//删除在线编辑文件
export const delOnlineWebFile: (params: { tmpFileName: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/xtsjProject/systemManage/delOnlineWebFile', {params})
}
//end
//TODO 合并专业提纲章节
export const mergeProfessionePara: (params: {
  appCode: string;
  professionOutlineId: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.get('/api/xtsjProject/taskManage/mergeProfessionePara', {params});
}
//获取自动成果编号
export const getDesignTaskAchievementCode: (params: {
  appCode: string;
  projectId: string;
  engineeringName: string;
  taskNumber: string;
  professionName: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.get('/api/xtsjProject/designTaskManage/getDesignTaskAchievementCode', {params});
}
