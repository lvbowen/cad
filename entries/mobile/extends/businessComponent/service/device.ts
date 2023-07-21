import * as Type from "../../type";
import {HttpResponse} from "@cloudpivot/api/src/response";
import Axios from "axios";

//获取个人相关巡检任务
export const getInspectTasks: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceInspectTasks>>> = (params) => {
  return Axios.get('/api/mobile/deviceManage/rest/getInspectTasks',{ params })
}

//获取个人相关巡检计划
export const getInspectPlans: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.DeviceInspectPlans>>> = (params) => {
  return Axios.get('/api/mobile/deviceManage/rest/getInspectPlans',{ params })
}
