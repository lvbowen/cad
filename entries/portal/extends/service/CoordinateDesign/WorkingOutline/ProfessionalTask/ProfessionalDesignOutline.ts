import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";

//查看时否具有编辑、暂存、提交、驳回、签收权限
export interface DesignOutline{
  id:string;
  rejectButton:boolean;
  retainButton:boolean;
  submitButton:boolean;
  agreeButton:boolean;
  engineeringName:string;//项目名称
  engineeringStage:string;//项目阶段
  achievementName:string;//成果名称
  manufacturer:{id:string,type:number}[]|string;//生产单位
  taskName:string;//任务名称
  taskNumber:string;//任务编号
  professionName:string//专业名称
  professionCode:string//专业编号
  achievementNumber:string//自动成果编号
  versionNumber:string//版本编号
  specialNumber:string//特殊编号
  taskType:string//任务类型
  projectLevel:string//项目级别
  professionPerson:{id:string,type:number}[]|string//专业负责人
  professionPersonName:string;
  currentStatus:string;//当前状态
  outlineAuditor:{id:string,type:number}[]|string//专业提纲审核人
  companyChiefEngineerFlag:string;//公司主管总工审核
  projectManager:{id:string,type:number}[]|string//指定项目经理
  readDesigner:{id:string,type:number}[]|string//可阅读设计人员
  manufacturerChief:{id:string,type:number}[]|string//生产单位主管总工
  companyChief:{id:string,type:number}[]|string//公司主管总工
  attachment:any[];
  workItemId:string;
  workflowInstanceId:string;
  workflowTokenId?:string;
  activityCode?:string;
  activityName?:string;
  rejectToActivityCode?:string;
  bizObject?:BizObject;
}
export const QuerryPermissions:(params:{appCode:string,projectId:string,zysjtgId:string})=>Promise<HttpResponse<DesignOutline>>=params=>{
  return Axios.get("/api/xtsjProject/taskManage/getProfessionOutline",{params});
}
//新增时否具有编辑、暂存、提交、驳回、签收权限
export const CreatePermissions:(params:{appCode:string,projectId:string,zyrwdId:string})=>Promise<HttpResponse<DesignOutline>>=params=>{
  return Axios.get("/api/xtsjProject/taskManage/createProfessionOutline",{params});
}


//提交操作
export interface BizObject{
  id:string,
  data: {
    attachment: any[]|null,
    XTSJ_profession_para: any[];
    company_chief: {id: string,type: number}[]|null,
    company_chief_engineer_flag: string|null,
    engineering_location:string|null,
    engineering_name: string|null,
    engineering_number:string|null,
    engineering_stage: string|null,
    industryType:string|null,
    manufacturer: {id: string,type: number}[]|null,
    manufacturer_chief: {id: string,type: number}[]|null,
    outline_auditor: {id: string,type: number}[]|null,
    profession_name: string|null,
    profession_person: {id: string,type: number}[]|null,
    projectType:string|null,
    project_level: string|null,
    project_manager: {id: string,type: number}[]|null,
    read_designer: {id: string,type: number}[]|null,
    task_type:string|null,
    zyrwd_id: string,
    xmlb_id: any,
    id: string,
    modelType: string;
    engineeringType: string;
  },
  schemaCode: "XTSJ_zysjtg",
  sheetCode: "XTSJ_zysjtg",
  workflowInstanceId: string|null
}

//上传文件
export const uploadFile:(params:{files:{[fileName:string]:File},data?:{[key:string]:string}})=>Promise<HttpResponse<any>>=params=>{
  const formData = new FormData();
  for (const fileName in params.files) {
    if (Object.prototype.hasOwnProperty.call(params.files, fileName)) {
      formData.append(fileName,params.files[fileName]);
    }
  }
  for (const dataName in params.data) {
    if (Object.prototype.hasOwnProperty.call(params.data, dataName)) {
      formData.append(dataName,params.data[dataName]);
    }
  }
  return Axios.post("/api/aliyun/upload",formData);
}

//流程状态查询
export interface WorkFlowInfo{
  startTime:string,
  status:string,
  usedTime:number
  participants:{
    activityName:string;
    participants:{name:string}[],
  }[],
}
export const workflowBaseInfo:(params:{workflowInstanceId:string})=>Promise<HttpResponse<WorkFlowInfo>>=params=>{
  return Axios.get("/api/runtime/workflow/get_instance_baseinfo",{params});
}

