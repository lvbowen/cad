import axios from 'axios';
import env from '@/config/env'

//获取项目树
export const getTreeData = params => {
  return axios.get(env.apiHost + "/api/groupView/getProjectTree", { params })
}
// 获取快捷入口数据
export const getQuickNonFolder = params => {
  return axios.get(env.apiHost + "/api/quickEntry/queryQuickNonFolder", { params })
}
//获取快捷入口所有数据
export const getAllEntryData = params => {
  return axios.get(env.apiHost + "/api/quickEntry/listFunctionsByAppCode", { params })
}
//编辑（快捷入口+应用）
export const editEntryData = params => {
  return axios.post(env.apiHost + "/api/quickEntry/refresh", params)
}
//获取常见应用
export const getCommonApps = params => {
  return axios.get(env.apiHost + '/api/quickEntry/queryQuickFolder',{params})
}
//获取全部应用(仅一级目录)
export const getAllApps = params => {
  return axios.get(env.apiHost + "/api/quickEntry/listFolderByAppCode", {params})
}
//获取全部应用（所有）
export const appListApps = params => {
  return axios.get(env.apiHost + "/api/runtime/app/list_functions_by_appcode", {params})
}
//获取720全景
export const getPanoramicManage = params => {
  return axios.get(env.apiHost + "/api/panoramicManage/panoramic720", {params})
}
