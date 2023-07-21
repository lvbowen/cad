import * as Type from "../type";
import {HttpResponse} from "@cloudpivot/api/src/response";
import Axios from "axios";
import {AddModelRelationsParams, ClassLibraryModelProperty, RelationModelPage} from "../type";
//标准类库-start
//获取标准类库列表
export const getCriterionPage: (params: {
  appCode: string;
  projectName: string;
}) => Promise<HttpResponse<Array<Type.StandardClass>>> = (params) => {
  return Axios.get('/api/deliveryLibrary/criterionName',{ params })
}
//添加或更新项目标准
export const addOrUpdateCriterionPro: (params: {
  criterionId: string;
  appCode: string;
  projectName: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/deliveryLibrary/addOrUpdateCriterionPro', params)
}
//项目类库树导出
export const exportClasslibraryTree: (params: {
  appCode: string;
  projectName: string;
  criterionId: string;
}) => Promise<HttpResponse<string>> = (params) => {
  return Axios.get('/api/deliveryLibrary/exportClasslibraryTree',{ params })
}
//获取类库树
export const getClassLibraryTree: (params: {
  criterionId: string;
  appCode: string;
  projectName: string;
}) => Promise<HttpResponse<Array<Type.ClassLibraryTree>>> = params => {
  return Axios.get('/api/deliveryLibrary/classlibraryProTree', {params});
}
//新增或修改类库树名称
export const addOrUpdateClassLibrary: (params: {
  appCode: string;
  projectName: string;
  classLibrary: {
    criterionId: string;
    name: string;
    parentId: string;
    property?: string;
    id?:string;
    code?: string;
  }
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/deliveryLibrary/addOrUpdateClasslibraryPro', params)
}
//删除类库
export const deleteClassLibrary: (params: {
  appCode: string;
  projectName: string;
  classLibraryId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/deliveryLibrary/deleteClasslibraryPro', {params});
}

//获取属性
export const getPropertises:(params: {
  appCode: string;
  projectName: string;
  classLibraryId: string;
  stageId: string;
}) => Promise<HttpResponse<Array<Type.ClassLibraryTreeProperties>>> = params => {
  return Axios.get('/api/deliveryLibrary/propertisesPro', {params});
}
//新增或修改属性
export const addOrUpdateProperty: (params: {
  appCode: string;
  projectName: string;
  property: {
    classLibraryId: string;
    deliveryLevel: string;
    englishName: string;
    // stage: string;
    stageId: string;
    stageName: string;
    isDefault: number;
    // name:string;
    propertyName: string;
    unit: string;
    type: string;
    isEdit: boolean;
    id?:string;
  }
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/deliveryLibrary/addOrUpdatePropertyPro', params)
}
//删除属性
export const deleteProperty: (params: {
  appCode: string;
  projectName: string;
  deleteIds: string[]
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/deliveryLibrary/deletePropertyPro', params)
}
//导入类库
export const importClassLibrary: (params: FormData) => Promise<HttpResponse<string>> = (params) => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/deliveryLibrary/importClasslibraryPro', params, fileHeader);
}
//获取关联模型列表
export const relationModelPage:(params: {
  appCode: string;
  projectName: string;
  classLibraryId: string;
  keyWords: string;
  pageNum: number;
  pageSize: number;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.RelationModelPage>>>> = params => {
  return Axios.get('/api/deliveryLibrary/relationModelPage', {params});
}
//删除关联模型列表
export const deleteRalation: (params: {
  appCode: string;
  projectName: string;
  deleteIds: string[]
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/deliveryLibrary/deleteRalation', params)
}
//获取模型树
export const getCodeTree:(params: {
  appCode: string;
  projectName: string;
  classLibraryId: string;
  taskName: string;
}) => Promise<HttpResponse<Type.CodeTree>> = params => {
  return Axios.get('/api/deliveryLibrary/codeTree', {params});
}
//新增关联项（类库和codeTree）
export const addRelationOfClassLibrary: (params: {
  appCode: string;
  projectName: string;
  classLibraryId: string;
  addModelRelations: Type.AddModelRelationsParams[]
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/deliveryLibrary/addRelation', params)
}
//获取模型属性
export const getModelProperty:(params: {
  appCode: string;
  projectName: string;
  codeValue: string;
  codeName: string;
  propertyStageId: string;
}) => Promise<HttpResponse<Array<Type.ClassLibraryModelProperty>>> = params => {
  return Axios.get('/api/deliveryLibrary/modelProperty', {params});
}
//更新模型属性
export const updateModelProperty: (params: {
  appCode: string;
  projectName: string;
  updateContents: Type.ClassLibraryModelProperty[]
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/deliveryLibrary/updateModelProperty', params)
}
//获取模型图片
export const getModelImg: (params: {
  appCode: string;
  projectName: string;
  codeValue: string;
  codeName: string;
  // propertyStage: string;
  propertyStageId: string
}) => Promise<HttpResponse<Type.ModelImgs>> = params => {
  return Axios.get('/api/deliveryLibrary/modelPictures', { params })
}

//修改模型图片
export const updateModelPictures: (params: {
  appCode: string;
  projectName: string;
  updateModelPics: Type.ModelImgs
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/deliveryLibrary/updateModelPictures', params)
}

//获取一级BIM弹窗目录
export const getTopBimCard: (params: {
  appCode: string;
  projectName: string;
})=> Promise<HttpResponse<Array<Type.BimCardMenu>>> = params => {
  return Axios.get('/api/deliveryLibrary/topBimCard', { params })
}

//获取二级BIM弹窗目录
export const getSubBimCard: (params: {
  appCode: string;
  projectName: string;
  fatherTabId: string;
})=> Promise<HttpResponse<Array<Type.BimCardMenu>>> = params => {
  return Axios.get('/api/deliveryLibrary/subBimCard', { params })
}

//BIM弹窗目录列表
export const getBimCards: (params: {
  appCode: string;
  projectName: string;
})=> Promise<HttpResponse<Array<Type.BimCardMenu>>> = params => {
  return Axios.get('/api/deliveryLibrary/bimCards', { params })
}

//附件上传
export const uploadFile: (params: FormData) => Promise<HttpResponse<any>> = (params) => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/aliyun/upload', params, fileHeader);
}
//标准类库-end


//模型属性内容导入
export const importPropertyValue: (params: FormData) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/deliveryLibrary/importPropertyValue',params);
}
