import axios from "axios";
import env from '@/config/env';
import {HttpResponse} from "@cloudpivot/api/src/response";
import Axios from "axios";

//今日告警
export const getTodayAlarm:(projectCode:string, projectName:string,alarmType:string)=>Promise<HttpResponse<any>>=(projectCode,projectName,alarmType)=>{
  return axios.get(
    env.apiHost + "/open/todayAlarm",{
      params:{
        appCode:projectCode,
        projectName:projectName,
        alarmType:alarmType
      }
    }
  );
}

//今日告警类型分析
export const getAlarmTypeStatistics:(projectCode:string, projectName:string)=>Promise<HttpResponse<any>>=(projectCode,projectName)=>{
  return axios.get(
    env.apiHost + "/open/alarmTypeStatistics",{
      params:{
        appCode:projectCode,
        projectName:projectName
      }
    }
  );
}

//告警趋势
export const getAlarmTrend:(projectCode:string, projectName:string,alarmType:string,timeType:number)=>Promise<HttpResponse<any>>=(projectCode,projectName,alarmType,timeType)=>{
  return axios.get(
    env.apiHost + "/open/alarmTrend",{
      params:{
        appCode:projectCode,
        projectName:projectName,
        alarmType,
        timeType
      }
    }
  );
}

//今日告警类型分析
export const getAlarmTypeStatisticsNew: (params: {
  appCode:string,projectName: string
})=> Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/video/alarmTypeStatistics',{params})
}

//告警趋势
export const getAlarmTrendNew: (params: {
  appCode:string,projectName: string,alarmType:string,timeType:number
})=> Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/video/alarmTrend',{params})
}

//获取最近告警
export const getRecentAlarm: (params: {
  appCode:string,projectName: string,deviceSn?:string,deviceChannel?:string,alarmType?:string
})=> Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/video/recentAlarm',{params})
}

//根据项目名获取摄像头
export const getVideoByProjectName: (params: {
  appCode:string,projectName: string
})=> Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/video/getVideoByProjectName',{params})
}

//获取ai报警详细数据
export const videoGetAiMessageById: (params: {
  appCode:string,id: string
})=> Promise<HttpResponse<boolean>> = params => {
  return Axios.get('/api/video/getAiMessageById',{params})
}
