import axios from "axios";
import env from '@/config/env';

//统计项目质量情况
export const getAnalyseProject = (appCode, projectName) =>
    axios.get(
        env.apiHost + "/api/quality/analyse/project", {
            params: {
                appCode: appCode,
                projectName: projectName,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//统计文档已填报折线图
export const getBizHandle = (appCode, projectName,startTime,endTime) =>
    axios.get(
        env.apiHost + "/api/quality/analyse/biz/handle", {
            params: {
                appCode: appCode,
                projectName: projectName,
                startTime: startTime,
                endTime: endTime,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//qbs混合树获取节点下业务表单统计数据
export const getAnalyseNode = (appCode, projectName,name,nodeId,level) =>
    axios.get(
        env.apiHost + "/api/quality/analyse/node", {
            params: {
                appCode: appCode,
                projectName: projectName,
                name: name,
                nodeId: nodeId,
                level: level,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
