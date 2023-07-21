import Axios from "axios";
import { HttpResponse } from "@cloudpivot/api/src/response";
import * as Type from "../../../type";

/* 获取项目清单 */
interface Project {
  id: string,
  name: string,
  engineeringName: string,
  engineeringStage: string,
  manufactureStatus: string,
  planStartTime: string,
  planEndTime: string,
  workflowInstanceId: string,
}
export const projectByPC: (params: { appCode: string, projectName?: string | null }) => Promise<HttpResponse<Project[]>> = params => {
  return Axios.get("/api/xtsjProject/designTaskManage/queryProjectByPC", { params });
}

/* 获取项目详情 */
export const professionTaskRecursive: (params: { appCode: string, projectId: string, [key: string]: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get("/api/xtsjProject/designTaskManage/queryProfessionTaskRecursive", { params })
}


//获取校验码
export const replayToken: () => Promise<HttpResponse<string>> = () => {
  return Axios.get('/api/runtime/form/getReplayToken');
}


export interface Retain {
  replayToken: string | null,
  bizObject: {
    data: {
      version: string,
      XTSJ_rwsjcg_file: []
      XTSJ_design_file: {
        file_name: string,
        attachments: any[],
      }
    }
  }
}
/* 获取暂存 */
export const retainByPc: (params: { appCode: string, sjrwdId: string }) => Promise<HttpResponse<Retain>> = params => {
  return Axios.get("/api/xtsjProject/designTaskManage/getDesignTaskRetainByPC", { params });
}

/* 保存暂存 */
export const save: (params: object) => Promise<HttpResponse<any>> = params => {
  return Axios.post("/api/runtime/form/save", params);
}

export interface SubmitData {
  replayToken: string | null,
  bizObject: {
    data: {
      version: string,
      XTSJ_rwsjcg_file: []
      XTSJ_design_file: {
        file_name: string,
        attachments: any[],
      }
    }
  }
}
/* 获取提交数据模板 */
export const designTaskSubmitData: (params: { appCode: string, sjrwdId: string }) => Promise<HttpResponse<SubmitData>> = params => {
  return Axios.get("/api/xtsjProject/designTaskManage/getDesignTaskSubmitByPC", { params });
}

/* 提交文件 */
export const submit: (params: object) => Promise<HttpResponse<any>> = params => {
  return Axios.post("/api/runtime/form/submit", params);
}

/* 获取提交流程数据模板 */
export interface DesignTaskInfo {
  replayToken: string | null,
}
export const designTaskInfo: (params: { appCode: string, sjrwdId: string }) => Promise<HttpResponse<DesignTaskInfo>> = params => {
  return Axios.get("/api/xtsjProject/designTaskManage/getDesignTaskInfoByPC", { params })
}
//TODO START v2
//获取个人登录后相关配置
export const getUserConfig: () => Promise<HttpResponse<Type.UserConfig>> = () => { return Axios.get('/api/xtsjProject/client/getUserConfig') }
//修改客户端皮肤
export const updateClientTheme: (params: {
  themeType: string//''
}) => Promise<HttpResponse<string>> = params => {
  return Axios.put('/api/xtsjProject/client/updateClientTheme', params);
}
//获取个人工作任务列表
export const getDesignTasks: (params: {
  appCode: string
}) => Promise<HttpResponse<Type.Projects[]>> = params => {
  return Axios.get('/api/xtsjProject/client/getDesignTasks', { params });
}
//获取设计任务详情
export const getDesignTask: (params: {
  appCode: string;
  id: string
}) => Promise<HttpResponse<Type.DesignTask>> = params => {
  return Axios.get('/api/xtsjProject/client/getDesignTask', { params });
}
//接收任务
export const receiveDesignTask: (params: {
  appCode: string;
  id: string
}) => Promise<HttpResponse<string>> = params => {
  return Axios.put('/api/xtsjProject/client/receiveDesignTask', params);
}
//任务成果轻量化
export const lightDesignAcheivement: (params: {
  appCode: string;
  id: string;
  taskId: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/client/lightDesignAcheivement', params)
}
//TODO END

//TODO START v3
//任务
export const toBeAccepted: (params: {
  activityCode: string,
  appCode: string,
  searchName: string
}) => Promise<HttpResponse<any>> = params => { return Axios.post('/api/xtsjProject/client/task/taskList', params) }
//任务数量
export const getTaskCount: (params: {
  activityCode?: string,
  appCode: string
}) => Promise<HttpResponse<any>> = params => { return Axios.post('/api/xtsjProject/client/task/taskCount', params) }
// 保存任务排序 
export const updateSortTask: (params: any) => Promise<HttpResponse<any>> = params => { return Axios.post('/api/xtsjProject/client/task/taskSort', params) }
// 任务获取设计数据
export const taskGetDesign: (params: any) => Promise<HttpResponse<Type.ArticleDetailResult>> = params => {
  return Axios.put('/api/xtsjProject/client/task/receiveDesignTasks', params);
}
// 接收任务
export const receiveTask: (params: any) => Promise<HttpResponse<Type.ArticleDetailResult>> = params => {
  return Axios.put('/api/xtsjProject/client/task/receiveDesignTasks', params);
}
// 任务成果
export const taskResult: (params: {
  appCode: string,
  taskId: string,
}) => Promise<HttpResponse<Type.ArticleDetailResult>> = params => {
  return Axios.get('/api/xtsjProject/client/project/achievementList', {params});
}
// 删除任务成果 
export const deleteResult: (params: {
  appCode: string,
  designFileId: string,
}) => Promise<HttpResponse<Type.ArticleDetailResult>> = params => {
  return Axios.get('/api/xtsjProject/client/project/deleteAchievement', {params});
}
// 重命名成果
export const renameResult: (params: {
  appCode: string,
  fileName: string,
  id: string,
  lastModifiedTime: string,
  path: string,
  taskId: string,
  type: string,
  workload: string,
}) => Promise<HttpResponse<Type.ArticleDetailResult>> = params => {
  return Axios.post('/api/xtsjProject/client/project/renameAchievement', {params});
}
// 出图
export const outImgResult: (params: {
  file:string,
  appCode: string,
  typeCode: string,
  designField: string,
}) => Promise<HttpResponse<Type.ArticleDetailResult>> = params => {
  return Axios.post('/api/xtsjProject/client/project/saveDrawingRecord', {params});
}
// 云保存
export const cloudSaveResult: (params: {
  file:string,
  appCode: string,
  designField: string,
}) => Promise<HttpResponse<Type.ArticleDetailResult>> = params => {
  return Axios.put('/api/xtsjProject/client/project/saveDesignAcheivement', {params});
}

// 获取项目数据
export const getProjectData: (params: {
  activityCode: string,
  appCode: string,
  engineeringLocation: string,
  engineeringStage: string,
  searchName: string,
  year: string
}) => Promise<HttpResponse<any>> = params => { return Axios.post('/api/xtsjProject/client/project/projectList', params) }
// 获取项目阶段 
export const getProjectStage: (params: {
  activityCode: string,
  appCode: string,
  engineeringLocation: string,
  engineeringStage: string,
  searchName: string,
  year: string
}) => Promise<HttpResponse<any>> = params => { return Axios.post('/api/runtime/query/listSkipQueryList', params) }

// 根据项目获取设计数据 /api/xtsjProject/client/project/projectTaskList
export const getProjectDesign: (params: {
  appCode: string,
  projectId: string,
  searchName: string
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/client/project/projectTaskList', { params }) }



//TODO END
