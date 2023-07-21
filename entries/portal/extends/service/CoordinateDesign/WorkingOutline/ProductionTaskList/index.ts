import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";
import * as Type from '../../../../type';

export interface BizObject{
  id:string
  data:{
    glid:any;
    sequenceNo: string;
    engineeringType: string;
    constructionPhase: any;
    engineering_name:string|null
    engineering_location:string|null
    industryType:string|null,
    projectType:string|null,
    engineering_stage:string|null
    modelType: string;
    engineering_number:string|null
    manufacturer_admin:{id:string,type:number}[]|null
    manufacturer_depart_manager:{id:string,type:number}[]|null
    manufacturer:{id:string,type:number}[]|null
    manufacturer_manager:{id:string,type:number}[]|null
    collaboration:{id:string,type:number}[]|null
    collaboration_manager:{id:string,type:number}[]|null
    company_manager:{id:string,type:number}[]|null
    archivist:{id:string,type:number}[]|null
    actual_contract_money:number|null
    evaluation_contract_money:number|null
    evaluation_contract_remark:string|null
    company_chief_engineer:{id:string,type:number}[]|null
    project_level:string|null
    company_review_flag:string|null
    manufacturer_chief_engineer:{id:string,type:number}[]|null
    project_manager:{id:string,type:number}[]|null
    manufacturer_vice_manager:{id:string,type:number}[]|null
    manufacturer_vice_engineer:{id:string,type:number}[]|null
    year:string|null
    quarter:string|null
    task_priority:string|null
    risk_level:string|null
    plan_start_time:string|null
    plan_end_time:string|null
    plan_duration:string|null
    actual_end_time:string|null
    warning_date1:string|null
    warning_date2:string|null
    work_content:string|null
    schedule:string|null
    scattered_contract_flag:string|null
    manufacture_status:string|null
    task_type:string|null
    remark:string|null
    remaining_problem:string|null
    current_person:{id:string,type:number}[]|null
    departHeaders:{id:string,type:number}[]|null
    picture:any[]|null,
    workday_duration:string|null,
    project_ratio:null
    id:string
  },
  schemaCode:"XTSJ_xmlb",
  sheetCode:"XTSJ_xmlb",
  workflowInstanceId:string|null,
}

//获取生成任务单
interface ProductionTask{
  id:string
  workItemId:string,
  workflowTokenId:string,
  workflowInstanceId:string,
  engineeringName:string,
  engineeringLocation:string,
  engineeringStage:string,
  engineeringNumber:string,
  manufacturerAdmin:string,
  manufacturerDepartManager:string,
  manufacturer:string,
  manufacturerManager:string,
  collaboration:string,
  collaborationManager:string,
  companyManager:string,
  archivist:string,
  actualContractMoney:string,
  evaluationContractMoney:string,
  evaluationContractRemark:string,
  companyChiefEngineer:string,
  projectLevel:string,
  companyReviewFlag:string,
  manufacturerChiefEngineer:string,
  projectManager:string,
  manufacturerViceManager:string,
  manufacturerViceEngineer:string,
  year:string,
  quarter:string,
  taskPriority:string,
  riskLevel:string,
  planStartTime:string,
  planEndTime:string,
  planDuration:string,
  actualEndTime:string,
  warningDate1:string,
  warningDate2:string,
  workContent:string,
  schedule:string,
  scatteredContractFlag:string,
  manufactureStatus:string,
  taskType:string,
  remark:string,
  remainingProblem:string,
  currentPerson:string,
  submitButton:boolean,
  retainButton:boolean,
  receiveButton:boolean,
  agreeButton:boolean,
  rejectButton:boolean
  activityCode:string,
  activityName:string,
  rejectToActivityCode:string,
}
export const productionTask:(params:{appCode:string,projectId:string})=>Promise<HttpResponse<ProductionTask> > =params=>{
  return Axios.get("/api/xtsjProject/projectManage/getProductionTask",{params});
}

export const workflowInstanceFlag:(params:{id:string,projectId:string,workflowInstanceId:string,schemaCode:string,appCode:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/projectManage/workflowInstanceFlag",{params});
}

//edmp-创建/更新项目
export const createProject: (params: Type.EDMPProject) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsj/xtsjProject/outer/createProject', {params}) }
