import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";

/* 查询数据指标 */
interface ProjectTargetInfo{
  totalAmount:number
  runAmount:number
  pauseAmount:number
  archiveAmount:number
  terminatedAmount:number
}
export const projectTargetInfo:(params:{appCode:string})=>Promise<HttpResponse<ProjectTargetInfo>>=params=>{
  return Axios.get("/api/xtsjProject/projectStatistics/getProjectTargetInfo",{params});
}

/* 查询可用年份 */
export const years:(params:{appCode:string})=>Promise<HttpResponse<string[]>>=params=>{
  return Axios.get("/api/xtsjProject/projectStatistics/getQueryYear",{params})
}

/* 查询数据分析数据 */
export const projectInfoByLineChar:(params:{appCode:string,year:string})=>Promise<HttpResponse<{[key:string]:{[key:string]:number}}>>=params=>{
  return Axios.get("/api/xtsjProject/projectStatistics/getProjectInfoByLineChart",{params});
}

/* 查询数据汇总数据(pieChart) */
export const projectInfoByPieChart:(params:{appCode:string})=>Promise<HttpResponse<{[key:string]:number}>>=params=>{
  return Axios.get("/api/xtsjProject/projectStatistics/getProjectInfoByPieChart",{params});
}

/* 查询数据汇总数据(barChart) */
export const projectInfoByHistogram:(params:{appCode:string})=>Promise<HttpResponse<{[key:string]:number}>>=params=>{
  return Axios.get("/api/xtsjProject/projectStatistics/getProjectInfoByHistogram",{params});
}
