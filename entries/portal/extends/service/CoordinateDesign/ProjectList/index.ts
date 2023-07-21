import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";
import {HitsTable, ProjectConditionItem,ProjectListConditions} from "../../../type";

/*  */
interface SearchMenu{
  code:string;
  name:string;
}
export const searchMenu:()=>Promise<HttpResponse<SearchMenu[]>>=()=>{
  return Axios.get("/api/xtsjProject/projectManage/querySearchMenu");
}

/* 获取项目视图 */
interface ProjectListView{
  total:number;
  records:Project[];
}
export const projectListView:(params:{appCode:string,engineeringStage:string,pageNum:number,pageSize:number,engineeringName?:string,manufactureStatus?:number})=>Promise<HttpResponse<ProjectListView>>=params=>{
  return Axios.post("/api/xtsjProject/projectManage/projectListView",params);
}

/* 获取项目列表层级 */
interface ProjectLevel{
  year:string;
  departments:Department[];
}
interface Department{
  children:any[];
  id:string;
  extend1:string;
  name:string;
}
export const projectLevel:(appCode:string)=>Promise<HttpResponse<ProjectLevel[]>>=appCode=>{
  return Axios.post("/api/xtsjProject/projectManage/queryLevel",{appCode});
}

/* 获取项目列表 */
interface ProjectList{
  [key:string]:Project[];
}
export interface Project{
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
    notesURL: string;
  }[],
}
// export const projectList:(params:{appCode:string,year:string,departmentId:string,queryCondition:string,manufactureStatus?:number})=>Promise<HttpResponse<ProjectList>>=params=>{
//   return Axios.post("/api/xtsjProject/projectManage/projectList",params);
// }

export const projectListV1:(params:{appCode:string,queryCode:string,engineeringName?:string})=>Promise<HttpResponse<Array<Project>>>=params=>{
  return Axios.post("/api/xtsjProject/projectManage/queryProjectListV1",params);
}

// export const projectListV2:(params:{appCode:string,queryCode:string,engineeringName?:string})=>Promise<HttpResponse<Array<Project>>>=params=>{
//   return Axios.post("/api/xtsjProject/projectManage/queryProjectListV2",params);
// }
export const projectListV2: (params: ProjectListConditions) => Promise<HttpResponse<HitsTable<Array<Project>>>> = params => {
  return Axios.post('/api/xtsjProject/projectManage/queryProjectListV3', params);
}

const favoriteOrRecentUse:(params:{appCode:string,flag:boolean,add:boolean,id:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/xtsjProject/projectManage/addFavoriteOrRecentUse",params);
}
/* 收藏 */
export const favorite:(params:{appCode:string,add:boolean,id:string})=>Promise<HttpResponse<any>>=params=>{
  return favoriteOrRecentUse({
    appCode:params.appCode,
    flag:true,
    add:params.add,
    id:params.id
  });
}
/* 最近使用 */
export const recentUse:(params:{appCode:string,id:string})=>Promise<HttpResponse<any>>=params=>{
  return favoriteOrRecentUse({
    appCode:params.appCode,
    flag:false,
    add:true,
    id:params.id
  });
}

/* 查询收藏 */
// export const queryFavorite:(params:{appCode:string,queryCode:string,engineeringName?:string})=>Promise<HttpResponse<Array<Project>>>=params=>{
//   return Axios.get("/api/xtsjProject/projectManage/queryMyFavoriteV1",{params:{...params,type:'我的收藏'}});
// }
export const queryFavorite:(params:{appCode:string,queryCode:string,engineeringName?:string})=>Promise<HttpResponse<Array<Project>>>=params=>{
  return Axios.get("/api/xtsjProject/projectManage/queryMyFavoriteV2",{params:{...params,type:'我的收藏'}});
}

/* 查询最近使用 */
// export const queryRecentUse:(params:{appCode:string,queryCode:string,engineeringName?:string})=>Promise<HttpResponse<ProjectList>>=params=>{
//   return Axios.get("/api/xtsjProject/projectManage/queryRecentUse",{params});
// }

// export const queryRecentUse:(params:{appCode:string,queryCode:string,engineeringName?:string})=>Promise<HttpResponse<Array<Project>>>=params=>{
//   return Axios.get("/api/xtsjProject/projectManage/queryMyFavoriteV2",{params:{...params,type:'最近使用'}});
// }
export const queryRecentUse:(params:{appCode:string,queryCode:string,engineeringName?:string})=>Promise<HttpResponse<Array<Project>>>=params=>{
  return Axios.get("/api/xtsjProject/projectManage/queryMyFavoriteV2",{params:{...params,type:'最近使用'}});
}
//获取项目管理查询条件列表
export const queryDropBox: (params: {
  appCode: string;
  condition: boolean;
}) => Promise<HttpResponse<ProjectConditionItem>> = params => {
  return Axios.post('/api/xtsjProject/projectManage/queryDropBox', params);
}
