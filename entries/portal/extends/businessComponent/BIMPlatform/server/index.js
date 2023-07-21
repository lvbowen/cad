import axios from "axios";
import env from '@/config/env';

//获取节点下进度运行状态
export const getscheduleAnalyseState = (projectCode, nodeId, projectName) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/state", {
            params: {
                projectCode: projectCode,
                nodeId: nodeId,
                projectName: projectName,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//获取节点下进度运行状态
export const getscheduleAnalyseStateV3 = (projectCode, nodeId, projectName,model) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/V3/bim/analyseState", {
            params: {
                projectCode: projectCode,
                nodeId: nodeId,
                projectName: projectName,
                model: model,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//BIM视图显示进度产值概览
export const getscheduleAnalyseValue = (projectCode, periodType, projectName) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/bim/value", {
            params: {
                projectCode: projectCode,
                periodType: periodType,
                projectName: projectName,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//BIM视图显示进度产值概览
export const getscheduleAnalyseValueV3 = (projectCode, periodType, projectName) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/V3/bim/value", {
            params: {
                projectCode: projectCode,
                periodType: periodType,
                projectName: projectName,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//BIM视图显示进度填报及预警概览
export const getscheduleAnalyseBimState = (projectCode, projectName) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/bim/state", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//BIM视图显示进度填报及预警概览
export const getscheduleAnalyseBimStateV3 = (projectCode, projectName) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/V3/bim/state", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );

//甘特图 4d5d
export const getscheduleAnalyseDeviation = (projectCode, projectName, nodeId, periodType, start, end) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/deviation", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
                nodeId: nodeId,
                periodType: periodType,
                start: start,
                end: end,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//4d5d模拟
export const getscheduleAnalyseBimview = (projectCode, projectName, nodeId, periodType, start, end) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/bim/view", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
                nodeId: nodeId,
                periodType: periodType,
                start: start,
                end: end,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//4d5d模拟
export const getscheduleAnalyseBimviewV3 = (projectCode, projectName, nodeId, periodType, start, end) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/V3/bim/view", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
                nodeId: nodeId,
                periodType: periodType,
                start: start,
                end: end,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//获取叶子节点数据分页
export const getPageLeafList = (projectCode, projectName, id, progressState,pageNum, pageSize) =>
    axios.get(
        env.apiHost + "/api/scheduleReportBSV2/pageLeafList", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
                id: id,
                progressState: progressState,
                pageNum: pageNum,
                pageSize: pageSize,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//qbs混合树获取节点下业务表单统计数据
export const getAnalyseNode = (appCode, projectName, bimFlag, name, nodeId,level) =>
    axios.get(
        env.apiHost + "/api/quality/analyse/node", {
            params: {
                appCode: appCode,
                projectName: projectName,
                bimFlag: bimFlag,
                name: name,
                nodeId: nodeId,
                level: level,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//质量管理BIM质检验收折线图
export const getAnalyseHandle = (appCode, projectName, nodeId, type , startTime , endTime) =>
    axios.get(
        env.apiHost + "/api/quality/analyse/biz/handle", {
            params: {
                appCode: appCode,
                projectName: projectName,
                nodeId: nodeId,
                type: type,
                startTime: startTime,
                endTime: endTime,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//质量管理BIM质检验收———模型交互
export const getMbsList= (appCode, projectName, nodeId, type,qbsCode) =>
    axios.get(
        env.apiHost + "/api/quality/analyse/bim/mbs/list", {
            params: {
                appCode: appCode,
                projectName: projectName,
                nodeId: nodeId,
                type: type,
                qbsCode: qbsCode,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );

    export const getWisdomSite = (projectCode, projectName) =>
    axios.get(
        env.apiHost + "/api/epcc/wisdomSite/getWisdomSite", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );


//进度管理BIM质检验收———模型交互
export const getModel= (appCode, projectName, nodeId) =>
    axios.get(
        env.apiHost + "/api/schedulePlanDetailV2/getModel", {
            params: {
                appCode: appCode,
                projectName: projectName,
                nodeId: nodeId,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//进度管理根据时间筛选的模型高亮
export const getStateByReportDate= (projectCode, projectName, nodeId, startTime, endTime) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/bim/stateByReportDate", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
                nodeId: nodeId,
                startTime: startTime,
                endTime: endTime,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );

//进度管理根据时间筛选的模型高亮
export const getStateByReportDateV3= (projectCode, projectName, nodeId, startTime, endTime) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/V3/bim/stateByReportDate", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
                nodeId: nodeId,
                startTime: startTime,
                endTime: endTime,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );


    export const getWisdomSitePhoto = (projectCode, projectName, queryDay) =>
    axios.get(
        env.apiHost + "/api/epcc/wisdomSite/getWisdomSitePhoto", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
            queryDay: queryDay,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );  