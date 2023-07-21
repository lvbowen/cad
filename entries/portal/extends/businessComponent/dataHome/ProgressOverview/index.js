import axios from "axios";
import env from '@/config/env';

//根据节点获取偏差分析数据
export const getdeviation = (projectCode, nodeId, projectName) =>
  axios.get(
    env.apiHost + "/api/scheduleAnalyse/deviation", {
      params: {
        projectCode: projectCode,
        // nodeId: nodeId,
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
      // nodeId: nodeId,
      projectName: projectName,
    }
  }, {
    headers: { "X-Access-Token": window.localStorage.getItem("token") }
  }
);
//进度统计时间
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
