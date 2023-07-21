import axios from "axios";
import env from "@/config/env";
//获取文档档案树
export const getDirectoryList = (appCode, projectName) =>
  axios.get(
    env.apiHost + "/api/doc/treeList",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
      },
    },
    {
      headers: { "X-Access-Token": window.localStorage.getItem("token") },
    }
  );
//获取部位树
export const getAreaCodeTree = (scheduleReportAddCmd) =>
  axios.post(env.apiHost + "/api/quality/v2/analyse/node", scheduleReportAddCmd, {
    headers: { "X-Access-Token": window.localStorage.getItem("token") },
  });
//获取文档列表
export const getDocListByKeywordList = (params) =>
  axios.post(env.apiHost + "/api/doc/files", params, {
    headers: { "X-Access-Token": window.localStorage.getItem("token") },
  });
