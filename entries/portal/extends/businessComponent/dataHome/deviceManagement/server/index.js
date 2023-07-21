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

//智慧工地-设备管理-塔吊趋势图
export const getTowerCraneTrend = (projectCode, projectName, elementType, time,deviceNum) =>
    axios.get(
        env.apiHost + "/api/zhgd/getTowerCraneTrend", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
                elementType: elementType,
                time: time,
                deviceNum: deviceNum,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );