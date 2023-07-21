import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";

//设备使用分析
interface DeviceUse{
  deviceUseNum:{
    deviceNames:string[],
    num:number[],
  },
  deviceUseProportion:{
    deviceType:string,
    num:number,
    proportion:number
  }[]
}
export const deviceUse:(params:{appCode:string,projectName:string,periodType:0|1|3})=>Promise<HttpResponse<DeviceUse>>=params=>{
  return Axios.get("/api/analyse/deviceManage/rest/deviceUse",{params});
}

//获取设备使用工单
interface DeviceApply{
  size:number,
  total:number,
  pages:number,
  records:DeviceApplyRecord[],
}
export interface DeviceApplyRecord{
  id:string,
  auditResult:string,
  createdTime:string,
  creater:string,
  endDate:string,
  manager:string,
  purpose:string,
  sequenceNo:string,
  startDate:string
}
export const deviceApply:(params:{appCode:string,projectName:string,pageNum:number,pageSize:number,
  id?:string,keyWord?:string,creater?:string,manager?:string,state?:string,auditResult?:string})=>Promise<HttpResponse<DeviceApply>>=params=>{
  return Axios.get("/api/deviceManage/rest/getDeviceApplyByProjectNamePage",{params});
}

//设备巡检统计
interface DeviceInspect{
  deviceInspectCount:{
    date:string[]|null,
    num:number[]|null,
  },
  deviceInspectNum:{
    monthChecked:number,
    monthUncheked:number,
    todayChecked:number,
    todayUncheked:number,
  },
  todayUncheck:{
    deviceType:string,
    num:number,
  }[]
}
export const deviceInspect:(params:{appCode:string,projectName:string})=>Promise<HttpResponse<DeviceInspect>>=params=>{
  return Axios.get("/api/analyse/deviceManage/rest/deviceInspect",{params});
}

//获取巡检任务列表
interface DeviceInspectTasks{
  size:number,
  total:number,
  pages:number,
  records:DeviceInspectTaskRecord[],
}
export interface DeviceInspectTaskRecord{
  id:string,
  checkItemsNum:number,
  checker:string,
  inspectCode:string,
  pics:{
    name:string,
    url:string,
  }[],
  planName:string,
  repair:{
    id:string,
    displayName:string,
    schemaCode:string,
    sequenceStatus:string,
    sequenceNo:string
  }
}
export const deviceInspectTasks:(params:{appCode:string,projectName:string,pageNum:number,pageSize:number,
  id?:string,keyWord?:string,planId?:string,checker?:string,result?:string})=>Promise<HttpResponse<DeviceInspectTasks>>=params=>{
  return Axios.get("/api/deviceManage/rest/getDeviceInspectTasks",{params})
}


