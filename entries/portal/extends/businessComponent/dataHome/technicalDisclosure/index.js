import axios from "axios";
import env from '@/config/env';
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
