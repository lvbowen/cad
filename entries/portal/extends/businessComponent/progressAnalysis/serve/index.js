import axios from "axios";
import env from '@/config/env';
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
export const getscheduleAnalyseStateV3 = (projectCode, nodeId, projectName, model) =>
axios.get(
    env.apiHost + "/api/scheduleAnalyse/V3/state", {
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
//根据状态获取wbs树
export const getscheduleAnalyseTree = (projectCode, progressState, startWorkState, endWorkState, nodeId, projectName, name) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/tree", {
        params: {
            projectCode: projectCode,
            progressState: progressState,
            startWorkState: startWorkState,
            endWorkState: endWorkState,
            nodeId: nodeId,
            projectName: projectName,
            name: name,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );

//选择项目

export const getProjectName = (projectCode) =>
    axios.get(
        env.apiHost + "/api/schedulePlanV2/getProjectName", {
        params: {
            projectCode: projectCode,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//项目圈
export const getProjectMoments = (projectCode, projectName, userId) =>
    axios.get(
        env.apiHost + "/api/projectMoments/projectMoments", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
            userId: userId,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    )

//项目圈(Pagination)
export const getProjectMomentsPagination = (projectCode, projectName, page,size) =>
    axios.get(
        env.apiHost + "/api/projectMoments/v2/getProjectMoment", {
        params: {
            appCode: projectCode,
            projectName: projectName,
            page,
            size
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    )

    
export const getMonthPlanReport = (projectCode, projectName) =>
axios.get(
    env.apiHost + "/api/epcc/schedule/monthPlanReport", {
    params: {
        projectCode: projectCode,
        projectName: projectName,
    }
}, {
    headers: { "X-Access-Token": window.localStorage.getItem("token") }
}
)
