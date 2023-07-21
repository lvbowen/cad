import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";
import {queryMyWorkItemsNewV2} from "../myHomePage";

/* 获取我的待办数据(分页) */
interface QueryWorkItem {
  content:WorkItem[]
  totalElements:number
}
export interface WorkItem {
  id:string
  extendId:string
  projectId:string
  pendingType:string
  instanceName:string//流程名称
  activityName:string//当前节点
  originatorName:string//发起人
  participantName:string//处理人
  startTime:string//发起时间
  workflowCode: string;
}
export interface MyWorkItemsNewV2 {
  projects: WorkItem[];
  workOutlines: WorkItem[];
  professionTasks: WorkItem[];
  professionOutlines: WorkItem[];
  designTasks: WorkItem[];
  externalMaterials: WorkItem[]
}
export const myWorkItems:(params:{appCode:string,pageNum:number,pageSize:number;startDate:string;endDate:string;workflowName:string;name:string})=>Promise<HttpResponse<QueryWorkItem>>=params=>{
  return Axios.get("/api/xtsjProject/workbenchCenter/queryMyWorkItems",{params})
}

/* 获取我的已办办数据(分页) */
export const myCompletedWorkItems:(params:{appCode:string,pageNum:number,pageSize:number;startDate:string;endDate:string;workflowName:string;name:string})=>Promise<HttpResponse<QueryWorkItem>>=params=>{
  return Axios.get("/api/xtsjProject/workbenchCenter/queryMyCompletedWorkItems",{params})
}


/* 获取我的项目 */
export interface Project{
  id:string,
  workflowInstanceId:string,
  xmlbId:string,
  zyrwdId:string,
  engineeringName:string,

  currentStatus:string,
  currentAuditorName:string|null,
  planStartTime:string,
  planEndTime:string,
  taskRatio:string|number,
}
export const myProjects:(params:{appCode:string})=>Promise<HttpResponse<{[key:string]:{[key:string]:{[key:string]:Project[]}}}>>=params=>{
  return Axios.get("/api/xtsjProject/workbenchCenter/queryMyProjects",{params})
}
