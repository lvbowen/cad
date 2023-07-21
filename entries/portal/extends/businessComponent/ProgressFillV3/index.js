import axios from "axios";
import env from '@/config/env';

//通过填报部位码ID查看MBS记录
export const getReportMBSInfo = (projectCode, projectName, reportBsId) =>
    axios.get(
        env.apiHost + "/api/scheduleReportBSV3/getReportMBSInfo", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
                reportBsId: reportBsId,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//通过MBS查看MBS记录
export const getReportMBSList = (projectCode, projectName, wbsId, mbs) =>
    axios.get(
        env.apiHost + "/api/scheduleReportBSV3/getReportMBSList", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
                wbsId: wbsId,
                mbs: mbs,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );

//通过MBS查看MBS记录
export const getAddMBSList = (scheduleReportAddCmd) =>
    axios.post(
        env.apiHost + "/api/scheduleReportBSV3/addMBSList", scheduleReportAddCmd, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );