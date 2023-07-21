import axios from "axios";
import env from '@/config/env';
import {HttpResponse} from "@cloudpivot/api/src/response";

//根据项目名称获取环境数据、空气质量
export const getEnvironmentAndAir:(projectCode:string, projectName:string) => Promise<HttpResponse<any>> =(projectCode, projectName)=>{
  return axios.get(
    env.apiHost + "/api/environmentManage/v2/environmentAndAir", {
    params: {
        projectCode: projectCode,
        projectName: projectName,
    }
  });
}

//根据元素类别获取趋势分析
export const getEnvironmentDataTrend:(projectCode:string, projectName:string, elementType:number, time:string)=>Promise<HttpResponse<any>>=(projectCode, projectName, elementType, time)=>{
  return axios.get(
    env.apiHost + "/api/environmentManage/environmentDataTrend", {
    params: {
        projectCode: projectCode,
        projectName: projectName,
        elementType: elementType,
        time: time,
    }
  });
}

//分页查询历史记录
export const getEnvironmentDataPage:(projectCode:string, projectName:string, pageNum:number, pageSize:number,date:string)=>Promise<HttpResponse<any>>=(projectCode, projectName, pageNum, pageSize,date)=>{
  return axios.get(
    env.apiHost + "/api/environmentManage/v2/environmentDataPage", {
    params: {
        projectCode: projectCode,
        projectName: projectName,
        pageNum: pageNum,
        pageSize: pageSize,
        date:date
    }
  });
}
//获取天气
export const getProjectCityWeather:(projectCode:string, projectName:string)=>Promise<HttpResponse<any>>=(projectCode,projectName)=>{
  return axios.get(
    env.apiHost + "/api/environmentManage/projectCityWeather", {
    params: {
        projectCode: projectCode,
        projectName: projectName,
    }
  });
}

//分页查询历史记录(港口)
export const getEnvironmentDataPageSeaPort:(projectCode:string, projectName:string, pageNum:number, pageSize:number,date:string)=>Promise<HttpResponse<any>>=(projectCode, projectName, pageNum, pageSize,date)=>{
  return axios.get(
    env.apiHost + "/api/environmentManage/v2/environmentDataPortPage", {
    params: {
        projectCode: projectCode,
        projectName: projectName,
        pageNum: pageNum,
        pageSize: pageSize,
        date:date
    }
  });
}
