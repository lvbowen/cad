import axios from "axios";
import env from '@/config/env';
//云台控制
export const getPtzStart = (accessToken, deviceSerial, channelNo, direction, speed) =>
  axios.get(env.apiHost + "/api/video/controlStart",
    {
      params: {
        accessToken: accessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        direction: direction,
        speed: speed,
      }
    },
  );

//云台控制停止
export const getPtzStop = (accessToken, deviceSerial, channelNo, direction) =>
  axios.get(env.apiHost + "/api/video/controlStop",
    {
      params: {
        accessToken: accessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        direction: direction,
      }
    }
  );

//根据项目编码值获取设备详情列表
export const getdeviceDetails = (appCode, currentProjectName, currentLevel, id) =>
  axios.get(env.apiHost + "/api/video/deviceDetails",
    {
      params: {
        appCode: appCode,
        currentProjectName: currentProjectName,
        currentLevel: currentLevel,
        id: id,
      }
    }
  );


//更新设备位置
export const getupdateDevice = (cmd) =>
  axios.post(
    env.apiHost + "/api/video/updateDevice", cmd
    , {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );

//更新设备位置
export const getQingupdateDevice = (cmd) =>
  axios.post(
    env.apiHost + "/api/qingVideo/updateDevice", cmd
    , {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );


export const getBackGround = (appCode, projectName) =>
  axios.get(env.apiHost + "/api/sysConfig/videoCenter/backGround",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
      }
    }
  );

  
//调用预置点
export const getPresetMove = (accessToken, deviceSerial, channelNo, index) =>
axios.get(env.apiHost + "/api/video/resetPreset",
  {
    params: {
      accessToken: accessToken,
      deviceSerial: deviceSerial,
      channelNo: channelNo,
      index: index,
    }
  }
);
