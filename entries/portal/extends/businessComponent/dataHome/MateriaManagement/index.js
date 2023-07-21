import axios from "axios";
import env from '@/config/env';
//智慧工地看板
export const getReport = (appCode, projectName, dateType, date,singleProject,startMonth,endMonth) =>
    axios.get(
        env.apiHost + "/api/materialManage/report", {
            params: {
                appCode: appCode,
                projectName: projectName,
                dateType: dateType,
                year: date,
                singleProject: singleProject,
                startMonth: startMonth,
                endMonth: endMonth
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
