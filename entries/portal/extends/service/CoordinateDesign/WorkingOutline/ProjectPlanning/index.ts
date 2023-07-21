import {HttpResponse} from "@cloudpivot/api/src/response";
import Axios from "axios";
import { DesignPersonGroup,ChiefOpinion,ModelAttachment } from "../../../../type";

export interface BizObject{
  id:string,
  data: {
    XTSJ_design_person:{
      id:string,
      offical_outline:"是"|"否",
      project_major:string
    }[]|null,
    XTSJ_workoutline_para: any[];
    attachment:any[]|null,
    chief_feedback:string|null,
    company_chief:{id: string,type: number}[]|null,
    company_manager:{id: string,type: number}[]|null,
    engineering_location:string|null,
    engineering_name: string|null,
    engineering_number:string|null,
    engineering_stage: string|null,
    feedback_creater: string|null,
    industryType: string|null,
    manufacturer:{id: string,type: number}[]|null,
    manufacturer_chief:{id: string,type: number}[]|null,
    manufacturer_manager:{id: string,type: number}[]|null,
    projectType:string|null,
    project_begin_time:string|null,
    project_end_time:string|null,
    project_level:string|null,
    project_manager:{id: string,type: number}[]|null,
    signed_ids:string[]|null,
    task_type:string|null,
    unsigned_ids:string[]|null,
    modelReviewFlag:string|null,
    modelAttachment:any[]|null,
    modelers:{id: string,type: number}[]|null,
    id: string,
    project_id:{},
    modelType: string,
    engineeringType: string;
    manufacturer_chief_engineer: string
  },
  schemaCode: "XTSJ_xmsqb",
  sheetCode: "XTSJ_xmsqb",
  workflowInstanceId: string|null
}
//导出工作大纲-设计人员信息模板-blob
export const exportWorkOutlineInfoTemplate: (params: {
  departmentId: string;
  projectId: string;
  appCode: string;
  projectName: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/workoutline/exportWorkOutlineInfoTemplate', params,{responseType:'blob'})
}
//导入设计人员信息
export const importWorkOutlineInfoTemplate: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/xtsjProject/workoutline/importWorkOutlineInfoTemplate', params, fileHeader);
}
//合并工作大纲说明书章节
export const mergeWorkOutlinePara: (params: {
  appCode: string;
  workOutlineId: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.get('/api/xtsjProject/workoutline/mergeWorkOutlinePara', {params});
}
//获取调整工作大纲变更权限按钮权限
export const getWorkOutlineAdjustPermission: (params: {
  id: string;
  appCode: string;
}) => Promise<HttpResponse<{
  activityCode: string;
  adjust: boolean;
  workflowInstanceId: string;
}>> = params => {
  return Axios.get('/api/xtsjProject/workoutline/getWorkOutlineAdjustPermission', {params});
}
//变更更新工作大纲状态及节点
export const updateWorkOutlineStatus: (params: {
  id: string;
  appCode: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.get('/api/xtsjProject/workoutline/updateWorkOutlineStatus', {params});
}
//一键导出设计人员组
export const exportDesignPersonGroup: (params: {
  appCode: string;
  professionTask: DesignPersonGroup[];
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/workoutline/exportProfessionTaskList', params,{responseType:'blob'})
}
//开启变更权限
export const triggerProfessionTask: (params: {
  appCode: string;
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/designTaskManage/triggerProfessionTask', { params })
}
//变更节点
export const activateActivity: (params: {
  activityCode: string;
  workflowInstanceId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/xtsjProject/taskManage/activeActivity', { params })
}
//TODO START 总工意见
//查询总工意见列表
export const getChiefOpinion: (params: {
  appCode: string;
  workoutlineId: string
}) => Promise<HttpResponse<ChiefOpinion[]>> = params => {
  return Axios.get('/api/xtsjProject/workoutline/getChiefOpinion', { params })
}
//专业负责人签收总工意见
export const signChiefOpinion: (params: {
  appCode: string;
  workoutlineId: string;
  id: string
}) => Promise<HttpResponse<ChiefOpinion[]>> = params => {
  return Axios.put('/api/xtsjProject/workoutline/signChiefOpinion',  {...params})
}
//保存总工意见
export const saveChiefOpinion: (params: {
  appCode: string;
  workoutlineId: string;
  opinion: string;
  title: string;//'生产单位分管总工'|'公司主管总工'; //职称
  type: string;//'同意'|'驳回'; //意见类型
  userId: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/workoutline/saveChiefOpinion', params)
}
//TODO END
//TODO START 模型审查
//获取转换结果接口
export const getModelTransGeneral: (params: {
  appCode: string;
  schemaCode: string;
  relatedId: string;
  refId:string
}) => Promise<HttpResponse<ModelAttachment[]>> = params => {
  return Axios.get('/api/xtsjProject/systemManage/getModelTransGeneral', { params })
}
//保存模型/图纸成果文件
export const saveDesignFile: (params: {
  appCode: string;
  refId: string[];
  relatedId: string;
  schemaCode: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/workoutline/saveDesignFile', params)
}
//二三维模型转换接口
export const transferModelGeneral: (params: {
  appCode: string;
  url: string;
  name: string;
  vaultId: string;
  fileId: string;
  schemaCode: string;//工作大纲-模型附件-XTSJ_xmsqb；设计任务单-设计成果-XTSJ_design_file
  force: boolean;
  userId: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.get('/api/xtsjProject/systemManage/transferModelGeneral', { params })
}
//TODO END
