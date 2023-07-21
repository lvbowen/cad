import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";

interface QualificationList{
  total:number
  records:Qualification[]
}
export interface Qualification{
  id:string
  name:string
  userName:string
  userId:string
  departmentId:string
  departmentName:string
  role:string
  auditFlag:"0"|"1"
  checkFlag:"0"|"1"
  designFlag:"0"|"1"
  projectManagerFlag:"0"|"1"
  reviewFlag:"0"|"1"
  validationFlag:"0"|"1"
}
export const qualificationList:(params:{appCode:string,pageNum:number,pageSize:number})=>Promise<HttpResponse<QualificationList>>=params=>{
  return Axios.get("/api/xtsjProject/systemManage/getQualificationList",{params});
}

//获取UUID
export const UUID:()=>Promise<HttpResponse<string>>=()=>{
  return Axios.get("/api/xtsjProject/systemManage/getUUID");
}

//获取重放校验码
export const replayToken: () => Promise<HttpResponse<string>> = () => {
  return Axios.get('/api/runtime/form/getReplayToken');
}

//提交数据
export interface BizObject{
  id:string,
  data: {
    department_id:{id:string,type:number}[],
    role:string,
    user_id:{id:string,type:number}[],
    design_flag:"0"|"1",
    check_flag:"0"|"1",
    audit_flag:"0"|"1",
    project_manager_flag:"0"|"1",
    review_flag:"0"|"1",
    validation_flag:"0"|"1",
    id: string,
  },
  schemaCode: "XTSJ_rzzg",
  sheetCode: "XTSJ_rzzg",
  workflowInstanceId: string|null
}
export const submit:(params:{workItemId:string|null,workflowInstanceId:string|null,bizObject:BizObject,departmentId:string,replayToken:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/runtime/form/submit",{...params,workflowCode:null,agree:"true",actionCode:"submit",formType:"2"});
}

//删除数据
export const deleteQulifacationById:(params:{appCode:string,id:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/xtsjProject/systemManage/deleteQulifacationById",params);
}

//修改数据
export const updateQualificationById:(params:{id:string,auditFlag:"0"|"1",checkFlag:"0"|"1",designFlag:"0"|"1",projectManagerFlag:"0"|"1",reviewFlag:"0"|"1",validationFlag:"0"|"1",
  role:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/xtsjProject/systemManage/updateQualificationById",params)
}
