import {HttpResponse} from "@cloudpivot/api/src/response";
import Axios from "axios";
import {SystemConfig} from "../../type";

//获取图纸资料目录
export const getpdbsTree: (params: {
  projectCode: string,
  projectName: string,
  userId?: string
}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/ebim/drawingLibrary/pdbsTree', {params});
}
//获取文件列表
export const getList: (params: {
  projectCode: string,
  projectName: string,
  userId?: string,
  pdbsId: string,
  queryKeyword: string,
  pageNum: number,
  pageSize: number
})=> Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/ebim/DrawingList/drawingListIPage', {params});
}
//获取项目树
export const getProTree: (params: {
  appCode: string
})=> Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/groupView/getProjectTree', {params});
}
//获取项目配置
export const getSystemConfig: (params: { path: string }) => Promise<HttpResponse<SystemConfig>> = (params) => {
  return Axios.get('/api/iconManage/getSystemConfig', {params});
}
//获取构件信息
export const getBimCardData: (params: {
  appCode: string,
  dataSource: string,
  projectName: string,
  smid: string
}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/ebim/bimCardData/getBimCardData', params);
}
//获取项目树
// export const getColumns: (params: getColumnsParams) => Promise<HttpResponse<any>> = (params) => {
//   return Axios.post('/api/app/query/get', params);
// }

//
