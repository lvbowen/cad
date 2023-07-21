import Axios from "axios";
import { HttpResponse } from "@cloudpivot/api/src/response";
import * as Type from "../../../type";
import {ReviewList} from "../../../type";
//获取下载插件 icon url 和 版本信息
// interface Project{
//   execFile:string,
//   icon:string,
//   type:string,
//   version:string,
// }
export interface Revit {
  execFile: string;
  icon: string;
  id: string;
  type: string;
  version: string;
}
export interface DownLoad {
  name: string,
  url: string
}

export interface ProjectImp {
  Revit: Array<Revit>
  AutoCAD: Array<Revit>
}

export interface ProjectDel {

}
//插件下载接口
export const pluginsDownload: (params: { appCode: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/workbenchCenter/pluginsDownload', { params });
}
//TODO 设计评审 start
//设计评审页面列表接口
export const designReviewList: (params: { appCode: string, page: any, size: any, scrwdId: string; }) => Promise<HttpResponse<Type.HitsTable<Array<Type.ReviewList>>>> = params => {
  return Axios.get('/api/xtsjProject/designReview/designReviewList', { params });
}
//设计评审列表页 新增删除按钮权限控制接口
export const designReviewAuth: (params: { appCode: string, scrwdId: string }) => Promise<HttpResponse<string>> = params => {
  return Axios.get('/api/xtsjProject/designReview/designReviewAuth', { params });
}
//设计评审详情页导出接口
export const selectDesignReviewModel: (params: { appCode: string, designReviewId: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/designReview/selectDesignReviewModel', { params,responseType:'arraybuffer' });
}
//设计评审导出权限接口
export const exportAuthority: (params: { appCode: string, designReviewId: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/designReview/exportAuthority', { params });
}
//查找设计评审单接口
export const findDesignReview: (params: { appCode: string, designReviewId: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/designReview/findDesignReview', { params });
}
//TODO 设计评审 end
//TODO 技术方案 start
//技术方案页面列表接口
export const technicalSchemeList: (params: { appCode: string, page: any, size: any, scrwdId: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/technicalScheme/technicalSchemeList', { params });
}
//技术方案列表页 新增删除按钮权限控制接口
export const technicalSchemeAuth: (params: { appCode: string, scrwdId: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/technicalScheme/technicalSchemeAuth', { params });
}
//查找技术方案单接口
export const findTechnicalScheme: (params: { appCode: string, technicalSchemeId: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/technicalScheme/findTechnicalScheme', { params });
}
//技术方案导出权限接口
export const exportAuth: (params: { appCode: string, technicalSchemeId: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/technicalScheme/exportAuth', { params});
}
//技术方案导出接口
export const selectTechnicalSchemeModel: (params: { appCode: string, technicalSchemeId: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/technicalScheme/selectTechnicalSchemeModel', { params,responseType:'arraybuffer' });
}
//TODO 技术方案 end
