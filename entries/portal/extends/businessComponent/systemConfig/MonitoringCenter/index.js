import axios from "axios";
import env from '@/config/env';

export const DelBackGround = (appCode, id) =>
  axios.delete(env.apiHost + "/api/sysConfig/videoCenter/delBackGround",
    {
      params: {
        appCode: appCode,
        id: id,
      }
    },
  );
export const getbackGround = (appCode, projectName) =>
  axios.get(env.apiHost + "/api/sysConfig/videoCenter/backGround",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
      }
    },
  );


export const getAddBackGround = (cmd) =>
  axios.post(
    env.apiHost + "/api/sysConfig/videoCenter/addBackGround", cmd
    , {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );


