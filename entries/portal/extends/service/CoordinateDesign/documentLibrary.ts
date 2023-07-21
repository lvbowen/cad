import * as Type from "../../type";
import {HttpResponse} from "@cloudpivot/api/src/response";
import Axios from "axios";
import {Record} from "../../type";
//搜索获取文档模板库模板列表
export const searchAchievementModel: (params: {
  appCode: string;
  bussiness: string;
  projectType: string;
  projectState: string;
  modelType: string;
  // avaliable: boolean;
  keyword: string;
  pageNum: number;
  pageSize: number;
}) => Promise<HttpResponse<Type.Record<Type.AchievementModel>>> = (params) => {
  return Axios.get('/api/xtsjProject/systemManage/searchAchievementModel',{ params })
}
//改文档模板库模板（启用非启用）
export const updateAchievementModel: (params: {
  id: string;
  avaliable: boolean,
  appCode: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.put('/api/xtsjProject/systemManage/updateAchievementModel', params);
}
//删除文档模板库模板
export const deleteAchievementModel: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/xtsjProject/systemManage/deleteAchievementModel', {params});
}
//云枢文件上传
export const yunFileUpload: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/aliyun/upload', params, fileHeader);
}
//新增文档模板库模板
export const addAchievementModel: (params: {
  appCode: string;
  avaliable: boolean;
  bussiness: string;
  projectType: string;
  fileName: string;
  modelType: string;
  professionType: string;
  projectState: string;
  // fileType?:string;
  refId: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/systemManage/addAchievementModel', params);
}
//查询素材内容
export const searchContentItem: (params: {
  appCode: string;
  keyWord: string;
  bussiness: string;
  projectType: string;
  fileType: string;
  professionType: string;
  projectState: string;
  pageNum: number;
  pageSize: number;
  title?: string;
  department?: string;
  province?: string;
  startYear?: string;
  endYear?: string;
  parentId?:string;
  childFlag?:boolean;
}) => Promise<HttpResponse<Type.Record<Type.WorkOutlineSourceList>>> = params => {
  return Axios.get('/api/xtsjProject/systemManage/searchContentItem', {params}) }
//上传内容素材文件
export const uploadContentFile: (params: {
  appCode: string;
  // avaliable: boolean;
  fileType: string;
  bussiness: string;
  projectType: string;
  fileName: string;
  // modelType: string;
  professionType: string;
  projectState: string;
  refId: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/systemManage/uploadContentFile', params);
}
//删除内容素材或者文件
export const deleteContentItem: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/xtsjProject/systemManage/deleteContentItem', {params});
}
