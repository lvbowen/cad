import axios from "axios";
import env from '@/config/env';

//获取人员考勤
export const getPersonAttendance = (appCode, projectName, teamId, attendanceDate, like) =>
    axios.get(
        env.apiHost + "/api/securityManage/person/getPersonAttendance", {
            params: {
                appCode: appCode,
                projectName: projectName,
                teamId: teamId,
                attendanceDate: attendanceDate,
                like: like,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );

//导出人员考勤
export const downloadPersonAttendanceInfo = (appCode, projectName, teamId, attendanceDate, like) =>
    axios.get(
        env.apiHost + "/api/securityManage/person/downloadPersonAttendanceInfo", {
            params: {
                appCode: appCode,
                projectName: projectName,
                teamId: teamId,
                attendanceDate: attendanceDate,
                like: like,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );

//人员树
export const getTeamTree = (projectCode, projectName) =>
    axios.get(
        env.apiHost + "/api/securityManage/person/getTeamTree", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );