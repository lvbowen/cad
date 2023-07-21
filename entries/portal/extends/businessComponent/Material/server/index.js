import axios from "axios";
import env from '@/config/env';

//获取物资计划年月列表
export const getPlanDates = (appCode, projectName,singleProject) =>
    axios.get(
        env.apiHost + "/api/materialManage/getPlanDates", {
        params: {
            appCode: appCode,
            projectName: projectName,
            singleProject: singleProject
        }
    }
    );

//获取物资计划明细
export const getPlanDetail = (appCode, projectName, dateType, date,singleProject,payType) =>
    axios.get(
        env.apiHost + "/api/materialManage/getPlanDetail", {
        params: {
            appCode: appCode,
            projectName: projectName,
            dateType: dateType,
            date: date,
            singleProject: singleProject,
            payType: payType
        }
    }
    );

//获取新增或者编辑计划时项目下所有登记物资列表
export const getRegisters = (appCode, projectName, dateType, date) =>
    axios.get(
        env.apiHost + "/api/materialManage/getRegisters", {
        params: {
            appCode: appCode,
            projectName: projectName,
            dateType: dateType,
            date: date,
        }
    }
    );

//新增或者保存物资计划
export const updateOrSavePlanDetail = (cmd) =>
    axios.post(
        env.apiHost + "/api/materialManage/updateOrSavePlanDetail", cmd
    );

//获取列表树，懒加载
export const getListTree = (appCode, projectName, schemaCode, multiProjectFlag) =>
    axios.get(
        env.apiHost + "/dataManage/treeComponet/getListTree", {
        params: {
            appCode: appCode,
            projectName: projectName,
            schemaCode: schemaCode,
            multiProjectFlag: multiProjectFlag,
        }
    }
    );
//获取库存明细
export const getReserveDetail = (appCode, projectName, id) =>
    axios.get(
        env.apiHost + "/api/materialManage/getReserveDetail", {
        params: {
            appCode: appCode,
            projectName: projectName,
            id: id,
        }
    }
    );

