import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";
import * as Type from "../../../type";

/* 查询设计成果 */
interface DesignAchievement{
  achievementNumber:string,
  designerName:string,
  professionName:string,
  professionTaskName:string,
  projectId:string,
  sjrwdId:string,
  version:string,
  attachments?:{
    id:string,
    refId:string,
    name:string,
    download:string,
    onlinePrewView:string,
    fileExtension:string,
  }[]
}
export const designAchievements:(params:{appCode:string,projectId:string,achievementName?:string})=>Promise<HttpResponse<{[key:string]:DesignAchievement[]}>>=params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/queryDesignAchievements",{params});
}
//TODO START 成果文件(无版本)
//获取设计任务成果列表(无版本处理)
export const getNewDesignAchievements: (params: {
  appCode: string;
  taskId: string;
}) => Promise<HttpResponse<Type.Achievements>> = (params) => {
  return Axios.get('/api/xtsjProject/designTaskManage/getDesignAchievements',{ params })
}
//获取设计任务成果批注(无版本处理)
export const getDesignAnnotations: (params: {
  appCode: string;
  designFileId: string;
  pageNum: number;
  pageSize: number;
  keyword: string;
  nodeName: string;
}) => Promise<HttpResponse<Type.Record<Type.Annotation>>> = (params) => {
  return Axios.get('/api/xtsjProject/designTaskManage/getDesignAnnotations',{ params })
}
//获取转换结果接口
export const getNewModelTransGeneral: (params: {
  appCode: string;
  refId: string;
  relatedId: string;
  schemaCode: string;
}) => Promise<HttpResponse<Type.ModelAttachment>> = (params) => {
  return Axios.get('/api/xtsjProject/systemManage/getModelTransGeneral',{ params })
}
//新增或者修改成果文件(无版本处理)
// export const uploadDesignFile: (params: {
//   appCode: string;
//   designAchieveId: string;
//   designFileId: string;
//   file:any
// }) => Promise<HttpResponse<void>> = params => {
//   return Axios.put('/api/xtsjProject/designTaskManage/uploadDesignFile', params)
// }
export const uploadDesignFile: (params: FormData) => Promise<HttpResponse<Type.AchievementFile>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.put('/api/xtsjProject/designTaskManage/uploadDesignFile', params, fileHeader);
}
//删除成果文件(无版本处理)
export const deleteDesignFile: (params: {
  appCode: string;
  designFileId: string;
  force: boolean
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/xtsjProject/designTaskManage/delDesignFile', {params});
}
//TODO END
