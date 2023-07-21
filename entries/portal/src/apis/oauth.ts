import Axios from 'axios';
import env from '@/config/env';
import qs from 'qs';

import * as Common from '@/typings/common';
import {HttpResponse} from "@cloudpivot/api/src/response";


const loginUrl = `${env.apiHost}/login/Authentication/get_code`;
const getTokenUrl = `${env.apiHost}/login/Authentication/get_token`;

const refreshTokenUrl = `${env.apiHost}/login/Authentication/get_refresh_token`;

const oAuthTokenUrl = `${env.oauthHost}/oauth/token`;
const userInfoUrl = `${env.apiHost}/api/organization/user/info_login`;
const oauthLogin: string = `${env.oauthHost}/login/mobile/ajax`;
const formUrl = `${env.apiHost}/api/runtime/form/get_message_form_url`;
const configUrl = `${env.apiHost}/public/system/config`;
const getProjectTree = `${env.apiHost}/api/groupView/getProjectTree`;
const getLoginPage = `${env.apiHost}/api/groupView/getLoginPage`
const getPageOriginUrl = `${env.apiHost}/api/define/function/getPageOrigin`;
const rdpView = `${env.apiHost}/api/report/getRdpView`;
const getRdpReport = `${env.apiHost}/api/define/function/getRdpReport`;
const getRouteList = `${env.apiHost}/api/groupControlCenter/rdp/getCustomPage`;
const listPages = `${env.apiHost}/api/define/function/listPages`;
const getProjectInfoUrl: string = `${env.apiHost}/api/groupView/getProjectInfo`;
const signDingTalkUrl: string = `${env.oauthHost}/api/dingtalk/sign`;
const deviationAnalysisTree: string = `${env.apiHost}/api/scheduleAnalyse/deviationAnalysisTree`;
const addDeviationDetail: string = `${env.apiHost}/api/scheduleAnalyse/addDeviationDetail`;
const deviationAnalysisPage: string = `${env.apiHost}/api/scheduleAnalyse/deviationAnalysisPage`;
const deleteDeviationDetail: string = `${env.apiHost}/api/scheduleAnalyse/deleteDeviationDetail`;
const updateDeviationDetail: string = `${env.apiHost}/api/scheduleAnalyse/updateDeviationDetail`;

//模型管理
const getMBSData: string = `${env.apiHost}/bim/data/getMBSData`;
const getByCodeName: string = `${env.apiHost}/api/code_mbs/getByCodeName`;
const topTreeList: string = `${env.apiHost}/api/code_mbs/top_tree_list`;
const childTreeList: string = `${env.apiHost}/api/code_mbs/child_tree_list`;
const engineerCalculation: string = `${env.apiHost}/bim/data/treeNode/engineerCalculation`;


export default {
  getLogin(params: {
    username: string;
    password: string;
  }): Promise<Common.Data> {
    return Axios.get(`/api/xtsjProject/ldap/ldapCheck`, {
      params
    });
  },
  /**
   * 获取钉钉签名信息
   * @param params {url:string} 当前获取签名的url
   */
  getDingTalkSignature(params: {
    url: string
  }): Promise<Common.Data> {
    return Axios.get(`${signDingTalkUrl}`, {
      params
    });
  },
  getSSOToken(params: OAuth.RequestParams): Promise<OAuth.Response> {
    // 解决跨端口访问时跨域的问题
    return Axios.post(`${oAuthTokenUrl}`, qs.stringify(params), {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  },
  getRefreshToken(params: OAuth.GetTokenParams): Promise<OAuth.Config> {
    return Axios.get(`${refreshTokenUrl}`, {params});
  },
  getUserInfo(): Promise<Common.Data> {
    return Axios.get(`${userInfoUrl}`, {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  },
  login(params: OAuth.LoginParams): Promise<any> {
    return Axios.post(`${loginUrl}`, params);
  },
  getToken(params: OAuth.GetTokenParams): Promise<OAuth.Config> {
    return Axios.get(`${getTokenUrl}`, {params});
  },
  //获取项目树
  getProjectTree(params: { appCode: string }): Promise<Common.Data> {
    return Axios.get(`${getProjectTree}`, {params});
  },
  //根据登录用户获取初始展示页
  getLoginPage(params: { appCode: string, level: number | undefined }): Promise<HttpResponse<any>> {
    return Axios.get(`${getLoginPage}`, {params});
  },
  getProjectInfo(params: { appCode: string | undefined; projectName: any }): Promise<any> {
    return Axios.get(`${getProjectInfoUrl}`, {params});
  },
  /**
   * 获取系统环境配置
   */
  getSystemConfig(): Promise<any> {
    return Axios.get(`${configUrl}`, {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }) as any;
  },
  /**
   * 使用钉钉授权码进行登陆
   * @param params
   */
  oauthLogin(params: OAuth.LoginRequestParams): Promise<OAuth.LoginResponse | any> {
    return Axios.get(`${oauthLogin}`, {
      params
    });
  },

  /**
   * 获取消息打开表单跳转地址
   * @param params
   */
  getFormUrl(params: OAuth.FormUrlParams): any {
    return Axios.get(`${formUrl}`, {
      params
    });
  },
  /**
   * 获取加密公钥
   */
  getRsaKey(): Promise<any> {
    return Axios.get(`${env.apiHost}/public/getKey`);
  },

  /**
   * 修改用户密码
   * @param params
   */
  changePassword(params: OAuth.PasswordParams): any {
    return Axios.put('/api/user/modify_user_password', params);
  },

  /**
   * 退出登录
   */
  logout(params: OAuth.LogoutParams): Promise<Common.Data> {
    return Axios.post('/logout', params, {
      headers: {
        Authentication: `Bearer ${params.access_token}`
      }
    });
  },

  getDepts(): Promise<any> {
    return Axios.get(`${env.apiHost}/public/relatedcorp/all_corp_info`)
  },

  getPageOrigin(params: { reportCode: string, appCode: string }): Promise<any> {
    return Axios.get(`${getPageOriginUrl}`, {params});
  },
  getRdpView(params: { reportCode: string, appCode: string, projectName: string }): Promise<any> {
    return Axios.get(`${rdpView}`, {params});
  },

  listPages(params: { appCode: string }): Promise<any> {
    return Axios.get(`${listPages}`, {params});
  },

  getRdpReport(params: { appCode: string }): Promise<any> {
    return Axios.get(`${getRdpReport}`, {params});
  },
  getRouteList(params: { appCode: string }): Promise<any> {
    return Axios.get(`${getRouteList}`, {params});
  },
  deviationAnalysisTree(params: { projectCode: string, projectName?: string, nodeId?: string }): Promise<any> {
    return Axios.get(`${deviationAnalysisTree}`, {params});
  },

  addDeviationDetail(params: { projectCode: string, projectName?: string, scheduleDeviationdetail: any }): Promise<any> {
    return Axios.post(`${addDeviationDetail}`, params);
  },

  deviationAnalysisPage(params: { projectCode: string, projectName?: string, pageNum: number, pageSize: number }): Promise<any> {
    return Axios.get(`${deviationAnalysisPage}`, {params});
  },

  deleteDeviationDetail(params: { projectCode: string, projectName?: string, scheduleDeviationdetail: any }): Promise<any> {
    return Axios.delete(`${deleteDeviationDetail}`, {data: params});
  },

  updateDeviationDetail(params: { projectCode: string, projectName?: string, scheduleDeviationdetail: any }): Promise<any> {
    return Axios.post(`${updateDeviationDetail}`, params);
  },

  //根据MBS树获取BIM-MBS
  getMBSData(params: { projectCode: string, projectName: string, mbsId: string }): Promise<any> {
    return Axios.get(`${getMBSData}`, {params});
  },

  //根据名字筛选树
  getByCodeName(params: { projectCode: string, projectName: string, codeType: string, name: string, multiProjectFlag?: boolean }): Promise<any> {
    return Axios.get(`${getByCodeName}`, {params});
  },

  //queryTopTreeList
  topTreeList(params: { projectCode: string, projectName: string, codeType: string, name?: string, code?: string, projectId?: string, multiProjectFlag?: boolean }): Promise<any> {
    return Axios.get(`${topTreeList}`, {params});
  },

  //根据MBS树（懒加载）
  childTreeList(params: { projectCode: string, projectName: string, codeType: string, name?: string, code?: string, projectId?: string, multiProjectFlag?: boolean, id: string }): Promise<any> {
    return Axios.get(`${childTreeList}`, {params});
  },

  engineerCalculation(params: { appCode: string, projectName: string, mbsId: string, pageNum?: number, pageSize?: number }): Promise<any> {
    return Axios.get(`${engineerCalculation}`, {params});
  },
  getTheme(params: { appCode: string }): Promise<any> {
    // return Axios.get(`http://10.20.90.213/api/api/groupView/getTheme`, {params});
    return Axios.get(`${env.apiHost}/api/groupView/getTheme`, {params});
  },
  updateTheme(params: { appCode: string, id: string, themeCode: string }): Promise<any> {
    return Axios.post(`${env.apiHost}/api/groupView/updateTheme`, params);
  },


};
