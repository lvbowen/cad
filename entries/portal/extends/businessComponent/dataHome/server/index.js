import axios from "axios";
import env from '@/config/env';

//可配置化的菜单栏
export const getMenuById = (projectCode, parentMenuId,projectName) =>
    axios.get(
        env.apiHost + "/api/groupControlCenter/menu/getMenuById", {
            params: {
                projectCode: projectCode,
                parentMenuId: parentMenuId,
                projectName:projectName
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//项目、菜单栏下的RDP
export const getRdpByProjectNameAndTabName = (projectCode, projectName, menuId, parentMenuId) =>
    axios.get(
        env.apiHost + "/api/groupControlCenter/rdp/getRdpByProjectNameAndTabName", {
            params: {
                projectCode: projectCode,
                projectName: projectName,
                menuId: menuId,
                parentMenuId: parentMenuId,
            }
        }, {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
