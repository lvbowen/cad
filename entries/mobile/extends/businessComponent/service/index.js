import axios from "axios";
import env from '@/config/env';

//获取所有WBS数据（树）V2.0
export const getTreeListWBS = (projectCode, projectName, reportState, planDetailName) =>
    axios.get(
        env.apiHost + "/api/scheduleReportBSV2/treeListWBS", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
            reportState: reportState,
            planDetailName: planDetailName,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//获取叶子节点数据V2.0
export const getLeafList = (projectCode, projectName, parentId, reportState, planDetailName) =>
    axios.get(
        env.apiHost + "/api/scheduleReportBSV2/leafList", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
            parentId: parentId,
            reportState: reportState,
            planDetailName: planDetailName,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );

//根据id获取填报记录V2.0
export const getReportInfo = (projectCode, id) =>
    axios.get(
        env.apiHost + "/api/scheduleReportBSV2/getReportInfo", {
        params: {
            projectCode: projectCode,
            id: id,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//进度日志查询手机端V2.0.0
export const getListLogMobile = (projectCode, projectName, queryStartDate, queryEndDate) =>
    axios.get(
        env.apiHost + "/api/scheduleLogV2/listLogMobile", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
            queryStartDate: queryStartDate,
            queryEndDate: queryEndDate,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//根据进度日志id 查询进度bs列表V2.0
export const getReportBSByLogId = (projectCode, id) =>
    axios.get(
        env.apiHost + "/api/scheduleReportBSV2/reportBSByLogId", {
        params: {
            projectCode: projectCode,
            id: id,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//获取填报百分比V2.0
export const getReportRatio = (projectCode, projectName) =>
    axios.get(
        env.apiHost + "/api/scheduleReportBSV2/getReportRatio", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );

//根据idList获取多个填报明细的信息V2.0
export const getMultipleReportDetail = (scheduleReportAddCmd) =>
    axios.post(
        env.apiHost + "/api/scheduleReportBSV2/getMultipleReportDetail", scheduleReportAddCmd
        , {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );
//报数据添加V2.0
export const getAddList = (scheduleReportAddCmd) =>
    axios.post(
        env.apiHost + "/api/scheduleReportBSV2/addList", scheduleReportAddCmd
        , {
            headers: { "X-Access-Token": window.localStorage.getItem("token") }
        }
    );

//获取手机端计量统计
export const getMeasureMobile = (appCode, projectName) =>
    axios.get(
        env.apiHost + "/api/measurePayment/measureView/getMeasureMobile", {
        params: {
            appCode: appCode,
            projectName: projectName,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//手机端进度统计时间
export const getScheduleAnalyseDate = (projectCode, projectName) =>
    axios.get(
        env.apiHost + "/api/scheduleAnalyse/date", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );



//获取第一级节点
export const getdepartmenttree = (corpId, deptIds) =>
    axios.get(
        env.apiHost + "/api/organization/department/tree", {
        params: {
            corpId: corpId,
            deptIds: deptIds,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//组织机构
export const getDepartmentUsers = (filterType, deptId, page, size) =>
    axios.get(
        env.apiHost + "/api/organization/department/users", {
        params: {
            filterType: filterType,
            deptId: deptId,
            page: page,
            size: size,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//720全景管理数据
export const getPanoramic720 = (projectName, projectCode, multiProjectFlag) =>
    axios.get(
        env.apiHost + "/api/panoramicManage/panoramic720", {
        params: {
            projectName: projectName,
            projectCode: projectCode,
            multiProjectFlag: multiProjectFlag,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//首页信息
export const getMoblieFrontPage = (projectName, projectCode, userId) =>
    axios.get(
        env.apiHost + "/api/moblieFrontPage/moblieFrontPage", {
        params: {
            projectName: projectName,
            projectCode: projectCode,
            userId: userId,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );

export const get_form_url = (bizObjectId, schemaCode) =>
    axios.get(
        env.apiHost + "/api/runtime/form/get_form_url", {
        params: {
            bizObjectId: bizObjectId,
            schemaCode: schemaCode,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//更新项目预警信息
export const getrefreshProjectWarningNotice = (projectCode) =>
    axios.post(
        env.apiHost + "/api/ticketMessage/refreshProjectWarningNotice?projectCode=" + projectCode, {
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
    );
//搜索组织架构人员
export const getTreeSearch = (name, filterType, sourceType) =>
    axios.get(
        env.apiHost + "/api/organization/user/tree/search", {
        params: {
            name: name,
            filterType: filterType,
            sourceType: sourceType,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//搜索组织架构人员
export const getUserByDepId = (deptId, page, size) =>
    axios.get(
        env.apiHost + "/api/contacts/userByDepId", {
        params: {
            deptId: deptId,
            page: page,
            size: size,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//搜索组织架构人员
export const getSearchUser = (wd, page, size, corpId) =>
    axios.get(
        env.apiHost + "/api/contacts/searchUser", {
        params: {
            wd: wd,
            page: page,
            size: size,
            corpId: corpId,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );

//标记已读
export const getAddUserMessageRelatio = (cmd) =>
    axios.post(
        env.apiHost + "/api/ticketMessage/addUserMessageRelatio", cmd, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
export const getUpload = (cmd) =>
    axios.post(
        env.apiHost + "/api/aliyun/upload", cmd, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//标记已读
export const getInfo_login = () =>
    axios.get(
        env.apiHost + "/api/organization/user/info_login", {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );
//标记已读
export const getmodify_user_password = (corpId, oldPassword, newPassword, username) =>
    axios.put(
        env.apiHost + "/api/user/modify_user_password", {
        corpId: corpId,
        oldPassword: oldPassword,
        newPassword: newPassword,
        username: username,
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );

export const getUserModify = (departmentId, id, imgUrl, imgUrlId, mobile, name, username, deptIds, roleIds, officePhone, email, employeeNo, entryTime, userUnion) =>
    axios.post(
        env.apiHost + "/api/contacts/modifyWithoutPerm", {
        departmentId: departmentId,
        id: id,
        imgUrl: imgUrl,
        imgUrlId: imgUrlId,
        mobile: mobile,
        name: name,
        username: username,
        deptIds: deptIds,
        roleIds: roleIds,
        officePhone: officePhone,
        email: email,
        employeeNo: employeeNo,
        entryTime: entryTime,
        userUnion: userUnion,
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    )

export const getPersonTeamList = (projectCode, projectName) =>
    axios.get(
        env.apiHost + "/api/securityManage/person/PersonTeamList", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );;

export const getLoad = (sheetCode, objectId, schemaCode) =>
    axios.get(
        env.apiHost + "/api/runtime/form/load", {
        params: {
            sheetCode: sheetCode,
            objectId: objectId,
            schemaCode: schemaCode,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );;
export const getUserPlanRecordFromNXB = (phoneNumber, currentPage, pageSize) =>
    axios.get(
        env.apiHost + "/api/securityManage/person/getUserPlanRecordFromNXB", {
        params: {
            phoneNumber: phoneNumber,
            currentPage: currentPage,
            pageSize: pageSize,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );;
export const getStatisticalData = (projectCode, projectName) =>
    axios.get(
        env.apiHost + "/api/mobileSecurityManage/statisticalData", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );;
export const getReportUrl = (schemaCode, appCode, projectName) =>
    axios.get(
        env.apiHost + "/api/standardPrint/getReportUrl", {
        params: {
            schemaCode: schemaCode,
            appCode: appCode,
            projectName: projectName,
        }
    }, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );;
export const getList = (obj) =>
    axios.post(
        env.apiHost + "/api/runtime/query/list", obj, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );;
export const getUpdateImage = (obj) =>
    axios.post(
        env.apiHost + "/api/video/updateImage", obj, {
        headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
    );

    //云台控制
export const getPtzStart = (accessToken, deviceSerial, channelNo, direction, speed) =>
axios.get("https://standard.wisdombim.com.cn/api/api/video/controlStart",
  {
    params: {
      accessToken: accessToken,
      deviceSerial: deviceSerial,
      channelNo: channelNo,
      direction: direction,
      speed: speed,
    }
  },
);

//云台控制停止
export const getPtzStop = (accessToken, deviceSerial, channelNo, direction) =>
  axios.get("https://standard.wisdombim.com.cn/api/api/video/controlStop",
    {
      params: {
        accessToken: accessToken,
        deviceSerial: deviceSerial,
        channelNo: channelNo,
        direction: direction,
      }
    }
  );

//获取当日计划
export const getTodayPlan = (projectCode, projectName, planDate) =>
  axios.get(env.apiHost + "/api/schedulePlanDetailV3/todayPlan",
    {
      params: {
        projectCode: projectCode,
        projectName: projectName,
        planDate: planDate,
      }
    }
  );

//获取当日计划
export const getMobileHomePagePicture = (projectCode, projectName) =>
  axios.get(env.apiHost + "/api/moblieFrontPage/mobileHomePagePicture",
    {
      params: {
        projectCode: projectCode,
        projectName: projectName,
      }
    }
  );

//查询项目圈动态接口
export const getProjectMoment = (appCode, projectName, page, size) =>
  axios.get(env.apiHost + "/api/projectMoments/v2/getProjectMoment",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        page:page,
        size:size,
      }
    }
  );
//查询项目圈提醒状态接口
export const getProjectMomentStatus = (appCode, projectName) =>
  axios.get(env.apiHost + "/api/projectMoments/v2/getProjectMomentStatus",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
      }
    }
  );
//查询未读与我相关接口
export const getAboutMeMoment = (appCode, projectName) =>
  axios.get(env.apiHost + "/api/projectMoments/v2/getAboutMeMoment",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
      }
    }
  );
//对动态进行点赞和评论
export const doLikeOrComment = (likeOrCommentSaveVO) =>
  axios.post(
    env.apiHost + "/api/projectMoments/v2/doLikeOrComment", likeOrCommentSaveVO, {
      headers: { "X-Access-Token": window.localStorage.getItem("token") }
    }
  );
//取消点赞
export const cancelLike = (appCode, projectMomentId) =>
  axios.delete(env.apiHost + "/api/projectMoments/v2/cancelLike",
    {
      params: {
        appCode: appCode,
        projectMomentId: projectMomentId,
      }
    }
  );
//删除评论
export const deleteComment = (appCode, commentId) =>
  axios.delete(env.apiHost + "/api/projectMoments/v2/deleteComment",
    {
      params: {
        appCode: appCode,
        commentId: commentId,
      }
    }
  );
//删除指定项目圈，并删除评论和点赞
export const deleteProjectMoment = (appCode, projectMomentId) =>
  axios.delete(env.apiHost + "/api/projectMoments/v2/deleteProjectMoment",
    {
      params: {
        appCode: appCode,
        projectMomentId: projectMomentId,
      }
    }
  );
//根据id获取指定项目圈，并设置为已读
export const getMomentById = (appCode, projectMomentId, dataId) =>
  axios.get(env.apiHost + "/api/projectMoments/v2/getMomentById",
    {
      params: {
        appCode: appCode,
        projectMomentId: projectMomentId,
        dataId: dataId,
      }
    }
  );
//将所有未读的与我相关变为已读
export const markAboutMeAsRead = (appCode, projectName) =>
  axios.get(env.apiHost + "/api/projectMoments/v2/markAboutMeAsRead",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
      }
    }
  );
export const getMyProjectMoment = (appCode, projectName, page, size) =>
  axios.get(env.apiHost + "/api/projectMoments/v2/getMyProjectMoment",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        page:page,
        size:size,
      }
    }
  );

//设备台账搜索设备列表
export const getSearchDevice = (appCode, projectName, keyword, type, person, state,startEntryDate,endEntryDate,relatedFlag) =>
  axios.get(env.apiHost + "/api/mobile/deviceManage/rest/searchDevice",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        keyword:keyword,
        type:type,
        person:person,
        state:state,
        startEntryDate:startEntryDate,
        endEntryDate:endEntryDate,
        relatedFlag:relatedFlag,
      }
    }
  );
//获取移动端设备台账搜索项
export const getSearchRule = (appCode, projectName) =>
  axios.get(env.apiHost + "/api/mobile/deviceManage/rest/getSearchRule",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
      }
    }
  );
//设备详情
export const getDeviceDetail = (appCode, projectName, id) =>
  axios.get(env.apiHost + "/api/mobile/deviceManage/rest/getDeviceDetail",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        id: id,
      }
    }
  );
//获取个人相关保养计划
export const getMaintainPlans = (appCode, projectName, id) =>
  axios.get(env.apiHost + "/api/mobile/deviceManage/rest/getMaintainPlans",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        id: id,
      }
    }
  );

//获取个人相关保养任务
export const getMaintainTasks = (appCode, projectName, id) =>
  axios.get(env.apiHost + "/api/mobile/deviceManage/rest/getMaintainTasks",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        id: id,
      }
    }
  );

//获取个人相关维修任务
export const getRepairTasks = (appCode, projectName, id) =>
  axios.get(env.apiHost + "/api/mobile/deviceManage/rest/getRepairTasks",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        id: id,
      }
    }
  );
