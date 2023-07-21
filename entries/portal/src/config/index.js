import axios from "axios";
import env from '@/config/env';

//更新项目预警信息
export const getrefreshProjectWarningNotice = (projectCode) =>
  axios.post(
    env.apiHost + "/api/ticketMessage/refreshProjectWarningNotice?projectCode=" + projectCode, {
      headers: {"X-Access-Token": window.localStorage.getItem("token")}
    }
  );

//标记已读
export const getAddUserMessageRelatio = (cmd) =>
  axios.post(
    env.apiHost + "/api/ticketMessage/addUserMessageRelatio", cmd, {
      headers: {"X-Access-Token": window.localStorage.getItem("token")}
    }
  );

//工单消息
export const getCode = (appCode) =>
  axios.get(
    env.apiHost + "/api/workTable/getCodeByUserId", {
      params: {
        appCode: appCode,
      }
    }, {
      headers: {"X-Access-Token": window.localStorage.getItem("token")}
    }
  );
//更新未归档信息
export const getUnfiled = (projectCode, projectName) =>
  axios.get(
    env.apiHost + "/api/doc/unfiled", {
      params: {
        appCode: projectCode,
        projectName: projectName,
      }
    }, {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );
