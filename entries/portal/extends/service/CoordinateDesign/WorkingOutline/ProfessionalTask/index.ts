import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";
import { StandardTemplate,StandardTemplateRes } from "../../../../type";

//专业任务列表
export interface ProfessionTask{
  id:string;
  taskNumber:string;
  professionName:string;
  currentStatus:string;
  currentAuditorName:string;
  professionManagerName:string;
  planStartTime:string;
  planEndTime:string;
  planDuration:string;
  outlineFlag:string;
  calculationFlag:string;
  rejectButton:boolean;
  submitButton:boolean;
  workflowInstanceId:string;
  xmlbId:string
}
export const professionTaskList:(params:{appCode:string,pageNum:number,pageSize:number,projectId:string,professionManagerId:string})=>Promise<HttpResponse<{total:number,size:number,records:ProfessionTask[]}>>=params=>{
  return Axios.get("/api/xtsjProject/taskManage/professionTaskList",{params});
}

//根据ID获取专业任务
export const getProfessionTaskById:(params:{appCode:string,id:string})=>Promise<HttpResponse<ProfessionTask>>=params=>{
  return Axios.get("/api/xtsjProject/taskManage/queryProjectInfoById",{params})
}

//专业设计提纲
interface ProfessionOutline{
  id:string;
  engineeringName:string;
  taskNumber:string;
  currentStatus:string;
}
export const professionOutlineList:(params:{appCode:string,zyrwdId?:string})=>Promise<HttpResponse<{[key:string]:ProfessionOutline[]}>>=params=>{
  return Axios.get("/api/xtsjProject/taskManage/v2/professionOutlineList",{params});
}

//专业任务提交
export const submitProfessionTask:(params:{appCode:string,id:string,workflowInstanceId:string,comment:string,agree:string,projectId:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/xtsjProject/taskManage/submitProfessionTask",params);
}
//专业任务驳回
export const rejectProfessionTask:(params:{appCode:string,id:string,workflowInstanceId:string,comment:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/xtsjProject/taskManage/rejectProfessionTask",params);
}

//获取设计任务单
interface DesignTask{
  id:string
  workflowInstanceId:string
  xmlbId:string
  zyrwdId:string
  createButton:boolean
  taskNumber:string
  engineeringName:string
  achievementNumber:string
  currentStatus:string
  specialNumber:string
  professionTaskName:string
  currentAuditorName:string
  auditorName:string
  planStartTime:string
  planEndTime:string
  planDuration:string
}
export const designTaskList:(params:{appCode:string,zyrwdId?:string})=>Promise<HttpResponse<{[key:string]:DesignTask[]}>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/designTaskList",{params})
}

//获取设计任务单权限
export const designTaskPermission:(params:{appCode:string,zyrwdId:string})=>Promise<HttpResponse<boolean>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/getDesignTaskPermission",{params});
}

//获取设计任务列表
export const getDesignTaskList:(params:{appCode:string,zyrwdId?:string,projectId?:string,self?:boolean})=>Promise<HttpResponse<boolean>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/v2/designTaskList",{params});
}

//获取专业任务V2
export const designTaskListV2:(params:{appCode:string,zyrwdId?:string,projectId?:string,self?:boolean})=>Promise<HttpResponse<any>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/v3/designTaskList",{params})
}

//据专业任务一键生产设计任务单（不落库）
export const produceDesignTask:(params:{appCode:string,projectId:string,id:string,professionalTask:string})=>Promise<HttpResponse<any>> = params=>{
  return Axios.get("/api/xtsjProject/projectManage/produceDesignTask",{params});
}

//根据专业任务一键一键下达
export interface DesignTaskV2{
  zyrwdId:string
  professionName:string
  professionTaskName:string
  taskType:string
  proofreadFlag:string
  proofreadLevel:string
  designGuiderFlag:string
  countersignFlag:string
  collaborateFlag:string
  projectManagerAudit:string
  designer:string
  designGuider:string
  partners:string
  checker:string
  auditor:string
  projectManager:string
  countersigned:string
  departmentChief:string
  companyChief:string
  planStartStr:string
  planEndStr:string;
  errorMsg?:string;
  id:string;
  achievementNumber: string
}
export const createDesignTaskV2:(params:{appCode:string,projectId:string,zyrwdId:string,professionalTask:string,designTaskList:DesignTaskV2[]}) =>Promise<HttpResponse<{flag:boolean,designTaskList:DesignTaskV2[]}>> = params =>{
  return Axios.post("/api/xtsjProject/projectManage/createDesignTaskV2",params);
}
//设计任务单-导入模板
export const exportDesignTaskTemplate: (params: {
  departmentId: string;
  appCode: string;
  zyrwdId: string;
})=> Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/designTaskManage/exportDesignTaskTemplate',params,{ responseType:'blob' })
}
//设计任务单-导入接口
export const importDesignTaskInfoTemplate: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/xtsjProject/designTaskManage/importDesignTaskTemplate', params, fileHeader);
}
//获取标准模板地址
export const getStandardTemplateApi: (params: StandardTemplate) => Promise<HttpResponse<StandardTemplateRes>> = params => {
  return Axios.get("/api/xtsjProject/systemManage/getStandardTaskTemplate",{params})
}
//设计任务单-导出
export const exportDesignTaskList: (params: {
  appCode: string;
  zyrwdId: string;
})=> Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/designTaskManage/exportDesignTaskList',params,{ responseType:'blob' })
}
