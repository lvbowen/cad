import axios from "axios";
import env from '@/config/env';
//根据Qbs编码查询关联隐患清单
export const getRiskListByQbs = (appCode, projectName, qbsId, pageNum, pageSize,isRelated,keyWords) =>
  axios.get(env.apiHost +  "/api/riskManagement/riskListByQbs",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        qbsId: qbsId,
        pageNum: pageNum,
        pageSize: pageSize,
        isRelated: isRelated,
        keyWords: keyWords,
      }
    },
  );

//获取不带工序的质量简化树
export const getSimplifiedTree = (appCode, projectName) =>
  axios.get(env.apiHost +  "/api/quality/v2/qbs/simplifiedTree",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
      }
    },
  );

//创建关联
export const getAddQbsDangerRelation = (cmd) =>
  axios.post(env.apiHost +  "/api/riskManagement/addQbsDangerRelation",cmd,
  );
//创建关联
export const getupdateQbsDangerRelation = (cmd) =>
  axios.post(env.apiHost +  "/api/riskManagement/updateQbsDangerRelation",cmd,
  );

//删除关联
export const DeleteQbsDangerRelation = (appCode, projectName, idList) =>
  axios.delete(env.apiHost +  "/api/riskManagement/deleteQbsDangerRelation",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        idList: idList,
      }
    },
  );

//未处理的简化树
export const getUnProcessQbsTree = (appCode, projectName, isAllDisplay) =>
  axios.get(env.apiHost +  "/api/riskManagement/unProcessQbsTree",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        isAllDisplay: isAllDisplay,
      }
    },
  );

//分页查询隐患列表
export const getqbsDangerSchedule = (appCode, projectName, qbsId, qbsCode, pageNum, pageSize, startTime, endTime, isAllDisplay, keyWords) =>
  axios.get(env.apiHost +  "/api/riskManagement/qbsDangerSchedule",
    {
      params: {
        appCode: appCode,
        projectName: projectName,
        qbsId: qbsId,
        qbsCode: qbsCode,
        pageNum: pageNum,
        pageSize: pageSize,
        startTime: startTime,
        endTime: endTime,
        isAllDisplay: isAllDisplay,
        keyWords: keyWords,
      }
    },
  );
