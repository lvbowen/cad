import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";


interface BaseParams{
  projectCode:string;
  projectName:string;
  userName:string;
  phone:string;
}

interface PersonIdParams{
  personId:string;
}

interface TypeParams{
  type:1|2;
}

/* 人员档案获取安全/项目岗位内容 */
export interface JobDescribe{
  projectJobDescribe:string[];
  safeJobDescribe:string[];
}
export const getJobDescribeByName:(params:BaseParams)=>Promise<HttpResponse<JobDescribe>>=params=>{
  return Axios.get("/api/securityManage/getJobDescribeByName",{params});
}

/* 人员档案获取安全培训岗位内容 */
export interface TrainingData{
  id:string;
  content:string;
  subjectName:string;
  trainingDate:string;
  trainingHour:number;
  trainingPurpose:string
  url:string;
}
export const getPersonTrainingByName:(params:BaseParams & PersonIdParams & TypeParams)=>Promise<HttpResponse<TrainingData[]>>=params=>{
  return Axios.get("/api/securityManage/getPersonTrainingByName",{params});
}

/* 人员档案获取技术交底内容 */
export interface TechnicalDisclosureData{
  id:string;
  content:string;
  disclosurDate:string;
  url:string;
}
export const getTechnicalDisclosureByName:(params:BaseParams & TypeParams)=>Promise<HttpResponse<TechnicalDisclosureData[]>>=params=>{
  return Axios.get("/api/securityManage/getTechnicalDisclosureByName",{params})
}

/* 人员档案获取安全整改内容 */
export interface SafeRectificationData{
  id:string;
  url:string;
  noticeDate:string;
  rectificationDate:string;
  hazardType:string;
  hazardClassification:string;
  hazardContent:string;
  result:string;
}
export const getSafeRectificationByName:(params:BaseParams & PersonIdParams & TypeParams)=>Promise<HttpResponse<SafeRectificationData[]>>=params=>{
  return Axios.get("/api/securityManage/getSafeRectificationByName",{params});
}
