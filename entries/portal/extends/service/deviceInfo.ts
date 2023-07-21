import * as Type from "../type";
import {HttpResponse} from "@cloudpivot/api/src/response";
import Axios from "axios";
import {DeviceInspectPlans} from "../type";

//通过id获取设备详情信息
export const getDeviceInfoById: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceInfo>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceInfoById',{ params })
}
//获取设备汇总信息
export const getDeviceInfoSummaryById: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceInfoSummaryInfo>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceInfoSummaryById',{ params })
}
//获取使用工单的筛选项
export const getDeviceApplySearchRule: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceFilterInfo>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceApplySearchRule',{ params })
}
//通过项目名称获取设备使用工单（分页）
export const getDeviceApplyByProjectNamePage: (params: {
  appCode: string;
  projectName: string;
  id: string;
  pageNum: number;
  pageSize: number;
  keyWord: string;
  manager: string;
  creater: string;
  state: string;
  auditResult: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.UsedRecordInfo>>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceApplyByProjectNamePage',{ params })
}
//获取设备入离场的筛选项
export const getDevicePresentSearchRule: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceFilterInfo>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDevicePresentSearchRule',{ params })
}
//获取设备入离场列表
export const getDevicePresentRecords: (params: {
  appCode: string;
  projectName: string;
  id: string;
  pageNum: number;
  pageSize: number;
  keyWord: string; //编号
  inOrOut: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.AttendanceRecordInfo>>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDevicePresentRecords',{ params })
}
//获取巡检（计划）任务的筛选项
export const getDeviceInspectSearchRule: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceFilterInfo>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceInspectSearchRule',{ params })
}
//获取巡检计划列表
export const getDeviceInspectPlans: (params: {
  appCode: string;
  projectName: string;
  id: string;
  pageNum: number;
  pageSize: number;
  keyWord: string; //计划名称
  planType: string;
  checker: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.DeviceInspectPlans>>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceInspectPlans',{ params })
}
//获取巡检任务列表
export const getDeviceInspectTasks: (params: {
  appCode: string;
  projectName: string;
  id: string;
  pageNum: number;
  pageSize: number;
  keyWord: string; //工单编号
  result: string;
  checker: string;
  planId: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.DeviceInspectTasks>>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceInspectTasks',{ params })
}
//获取保养（计划）任务的筛选项
export const getDeviceMaintainSearchRule: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceFilterInfo>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceMaintainSearchRule',{ params })
}
//获取保养任务列表
export const getDeviceMaintainTasks: (params: {
  appCode: string;
  projectName: string;
  id: string;
  pageNum: number;
  pageSize: number;
  keyWord: string; //工单编号
  maintainer: string;
  planId: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.DeviceMaintainTasks>>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceMaintainTasks',{ params })
}
//获取保养计划列表
export const getDeviceMaintainPlans: (params: {
  appCode: string;
  projectName: string;
  id: string;
  pageNum: number;
  pageSize: number;
  keyWord: string; //计划名称
  maintainLevel: string;
  maintainFreq: string;
  maintainer: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.DeviceMaintainPlans>>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceMaintainPlans',{ params })
}
//获取维修工单的筛选项
export const getDeviceRepairSearchRule: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceFilterInfo>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceRepairSearchRule',{ params })
}
//获取维修任务列表
export const getDeviceRepairTasks: (params: {
  appCode: string;
  projectName: string;
  id: string;
  pageNum: number;
  pageSize: number;
  keyWord: string; //工单编号
  checkPlanId: string;
  maintainPlanId: string;
  creater: string;
  repairor: string;
  state: string;
  scrapFlag: boolean|undefined;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.DeviceRepairTasks>>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceRepairTasks',{ params })
}
//获取转交工单的筛选项
export const getDeviceTransferSearchRule: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceFilterInfo>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceTransferSearchRule',{ params })
}
//获取转交工单列表
export const getDeviceTransferTasks: (params: {
  appCode: string;
  projectName: string;
  id: string;
  pageNum: number;
  pageSize: number;
  keyWord: string; //工单编号
  oldManager: string;
  newManager: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.DeviceTransferTasks>>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceTransferTasks',{ params })
}
//获取报废工单的筛选项
export const getDeviceScrapSearchRule: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceFilterInfo>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceScrapSearchRule',{ params })
}
//获取报废工单列表
export const getDeviceScrapTasks: (params: {
  appCode: string;
  projectName: string;
  id: string;
  pageNum: number;
  pageSize: number;
  keyWord: string; //工单编号
  creater: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.DeviceScrapTasks>>>> = (params) => {
  return Axios.get('/api/deviceManage/rest/getDeviceScrapTasks',{ params })
}
