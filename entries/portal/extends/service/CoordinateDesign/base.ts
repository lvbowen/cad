import * as Type from "../../type";
import {HttpResponse} from "@cloudpivot/api/src/response";
import Axios from "axios";
import {DesignAchievementsTree} from "../../type";

//获取审批资料form参数信息及权限信息
export const getApprovalInstancePermission: (params: {
  appCode: string;
  projectId: string;
  baseType: string; //前期资料 批复验收
}) => Promise<HttpResponse<Type.ApprovalPermissionRes>> = (params) => {
  return Axios.get('/api/xtsjProject/systemManage/getApprovalInstancePermission',{ params })
}
export const getPreConfig: () => Promise<HttpResponse<{idocvServiceUrl:string;isOpen:string}>> = () => {
  return Axios.get('/api/system/get_idocv_config' )
}
//TODO 中心文件夹  start
//获取中心文件夹配置
export const getCenterFiles: (params:{
  appCode: string;
  taskId: string
}) => Promise<HttpResponse<Type.CenterFiles>> = (params) => {
  return Axios.get('/api/xtsjProject/taskManage/getDesignDirectoryConfig' ,{ params })
}
//创建或更新中心文件夹
export const updateCenterFiles: (params: {
  appCode: string;
  taskId: string
}) => Promise<HttpResponse<Type.CenterFiles>> = (params) => {
  return Axios.get('/api/xtsjProject/taskManage/saveOrUpdateDesignDirectory' ,{ params })
}
//TODO end
export const getDecryptFile: (params: {
  appCode: string;
  fileName: string;
  refId: string;
})=> Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/systemManage/getDecryptUrl',params)
}
export const getFiledDesignAchievements: (params: {
  appCode: string;
  projectId: string
}) => Promise<HttpResponse<Array<Type.DesignAchievementsTree>>> = (params) => {
  return Axios.get('/api/xtsjProject/designTaskManage/getFiledDesignAchievements' ,{ params })
}
