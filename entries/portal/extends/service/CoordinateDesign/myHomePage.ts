import * as Type from "../../type";
import {HttpResponse} from "@cloudpivot/api/src/response";
import Axios from "axios";
import {MyWorkItemsNewV2, WorkItem} from './TaskCenter'
import {HitsTable, HomeBaseTaskQuery, WorkItemsNumber} from "../../type";
//获取首页统计信息
export const queryMyTaskInfo: (params: {
  appCode: string;
}) => Promise<HttpResponse<Type.HomePageStatistics>> = (params) => {
  return Axios.get('/api/xtsjProject/workbenchCenter/queryMyTaskInfo',{ params })
}
//获取首页我的待办信息
export const queryMyWorkItemsNew: (params: {
  appCode: string;
}) => Promise<HttpResponse<Array<WorkItem>>> = (params) => {
  return Axios.get('/api/xtsjProject/workbenchCenter/queryMyWorkItemsNew',{ params })
}
//获取首页我的待办信息-新
export const queryMyWorkItemsNewV2: (params: {
  appCode: string;
}) => Promise<HttpResponse<MyWorkItemsNewV2>> = (params) => {
  return Axios.get('/api/xtsjProject/workbenchCenter/queryMyWorkItemsNewV2',{ params })
}
//获取首页我的项目列表
export const queryMyProjectsNew: (params: {
  appCode: string;
  projectId: string;
  xmsqbId: string;
  zyrwdId: string;
}) => Promise<HttpResponse<Array<any>>> = (params) => {
  return Axios.get('/api/xtsjProject/workbenchCenter/queryMyProjectsNew',{ params })
}

interface Project{
  id:string;
  engineeringLocation:string;
  engineeringName:string;
  engineeringNumber:string;
  projectType:string,
  industryType:string;
  mainManufacturer:string,
  year:string
  favorite:boolean;
  picUrl:string;
  produceTasks:{
    id:string,
    engineeringStage:string;
    manufactureStatus:string;
    planDuration:number;
    planEndTime:string;
    planStartTime:string;
    projectRatio:number;
  }[],
}
export const queryMyProjects:(params:{appCode: string,})=>Promise<HttpResponse<Project[]>> = params =>{
  return Axios.get("/api/xtsjProject/workbenchCenter/queryMyProjectsNew1",{params});
}
//TODO 首页改版 start
//我的待办列表
export const queryMyWorkItemsNewV3:(params: Type.HomeTaskQuery)=> Promise<HttpResponse<Type.HitsTable<Array<Type.ToDoWorksItem>>>> = params => {
  return Axios.get('/api/xtsjProject/workbenchCenter/queryMyWorkItemsNewV3',{ params })
}
//已办列表接口
export const queryMyCompletedWorkItemsV2:(params: Type.HomeTaskQuery)=> Promise<HttpResponse<Type.HitsTable<Array<Type.DoneWorksItem>>>> = params => {
  return Axios.get('/api/xtsjProject/workbenchCenter/queryMyCompletedWorkItemsV2',{ params })
}
//我的未办列表接口
export const queryMyOutstandingItems:(params: Type.HomeBaseTaskQuery )=> Promise<HttpResponse<Type.HitsTable<Array<Type.DoingWorksItem>>>> = params => {
  return Axios.get('/api/xtsjProject/workbenchCenter/queryMyOutstandingItems',{ params })
}
//我的待办列表-总数统计
export const queryMyWorkItemsNumber:(params: {
  appCode: string
} )=> Promise<HttpResponse<WorkItemsNumber>> = params => {
  return Axios.get('/api/xtsjProject/workbenchCenter/queryMyWorkItemsNumber',{ params })
}
//我的待办列表-总数统计
export const queryMyCompletedWorkNumber:(params: {
  appCode: string
} )=> Promise<HttpResponse<WorkItemsNumber>> = params => {
  return Axios.get('/api/xtsjProject/workbenchCenter/queryMyCompletedWorkNumber',{ params })
}
//我的项目项目列表表格模式接口
export const queryProjectListV4:(params: {
  appCode: string;
  type: number;// MY_PROJECT(1, "我的项目")、ALL_PROJECT(2, "全部项目")、MY_FAVORITE(3, "我的收藏")
  engineeringName: string;
  dynamicColumnType: number; //1 2  ……
} )=> Promise<HttpResponse<Array<Type.ProjectTreeTable>>> = params => {
  return Axios.get('/api/xtsjProject/projectManage/queryProjectListV4',{ params })
}
//TODO end
