import axios from "axios";
import env from '@/config/env';

//智慧工地-设备管理
export const getEquipmentScreenInfo = (projectCode, projectName, projectLevel, deviceType) =>
  axios.get(
    env.apiHost + "/api/zhgd/getEquipmentScreenInfo", {
      params: {
        projectCode: projectCode,
        projectName: projectName,
        projectLevel: projectLevel,
        deviceType: deviceType,
      }
    }, {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );

//根据节点获取偏差分析数据
export const getdeviation = (projectCode, nodeId, projectName) =>
  axios.get(
    env.apiHost + "/api/scheduleAnalyse/deviation", {
      params: {
        projectCode: projectCode,
        nodeId: nodeId,
        projectName: projectName,
      }
    }, {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );

//根据节点获取进度统计数据
export const getscheduleAnalyse = (projectCode, nodeId, projectName) =>
  axios.get(
    env.apiHost + "/api/scheduleAnalyse/project", {
      params: {
        projectCode: projectCode,
        nodeId: nodeId,
        projectName: projectName,
      }
    }, {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );

//手机端进度统计时间
export const getScheduleAnalyseDate = (projectCode, projectName) =>
  axios.get(
    env.apiHost + "/api/scheduleAnalyse/date", {
      params: {
        projectCode: projectCode,
        projectName: projectName,
      }
    }, {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );


export const getSjjdList = (projectCode, projectName) =>
  axios.get(
    env.apiHost + "/api/trainingRecord/getSjjdList", {
      params: {
        projectCode: projectCode,
        projectName: projectName,
      }
    }, {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );

export const getStatistical = (projectCode,id, schemaCode) =>
  axios.get(
    env.apiHost + "/api/trainingRecord/statistical", {
      params: {
        projectCode: projectCode,
        id: id,
        schemaCode: schemaCode,
      }
    }, {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );
