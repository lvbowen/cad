import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";
import { FormControlType } from "@cloudpivot/form/schema";
import { QualificationConfig } from "../../type";
//获取UUID
export const UUID:()=>Promise<string>=async()=>{
  try {
    const res = await Axios.get("/api/xtsjProject/systemManage/getUUID");
    const {errcode,errmsg,data} = res as HttpResponse<string>;
    if(errcode) return "";
    return data??""
  } catch (error) {
    return ""
  }
}

//获取replayToken
export const replayToken:()=>Promise<string>=async()=>{
  try {
    const res = await Axios.get('/api/runtime/form/getReplayToken');
    const {errcode,errmsg,data} = res as HttpResponse<string>;
    if(errcode) return "";
    return data??""
  } catch (error) {
    return ""
  }
}

//上传文件
export const uploadFile:(params:{files:{[fileName:string]:File},data?:{[key:string]:string}})=>Promise<HttpResponse<any>>=params=>{
  const formData = new FormData();
  for (const fileName in params.files) {
    if (Object.prototype.hasOwnProperty.call(params.files, fileName)) {
      formData.append(fileName,params.files[fileName]);
    }
  }
  for (const dataName in params.data) {
    if (Object.prototype.hasOwnProperty.call(params.data, dataName)) {
      formData.append(dataName,params.data[dataName]);
    }
  }
  return Axios.post("/api/aliyun/upload",formData);
}

export const workflowInstanceFlag:(params:{id:string,projectId:string,workflowInstanceId:string,schemaCode:string,appCode:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/projectManage/workflowInstanceFlag",{params});
}

//提交数据
export const submit:<T>(params:{workItemId:string|null,workflowInstanceId:string|null,bizObject:T,departmentId:string,replayToken:string,workflowCode:string|null})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/runtime/form/submit",{...params,agree:"true",actionCode:"submit",formType:"1"});
}

//暂存操作
export const save:<T>(params:{workflowCode:string,workItemId:string|null,workflowInstanceId:string|null,bizObject:T,departmentId?:string,replayToken:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/runtime/form/save",params);
}

//同意操作
interface AgreeApproval{
  id?: string,
  createdTime?: string,
  deleted?: false,
  createdBy?: string,
  workflowInstanceId: string,
  content: string,
  activityCode: string,
  activityName: string,
  workItemId: string,
  commentTime: string,
  workflowTokenId: string,
  creater?: {
    imgUrl: string|null,
    name: string,
    id: string,
    type: number
  },
}
interface ProductionTaskAgreeApproval{
  content: string,
  workItemId: string,
  workflowInstanceId: string,
  workflowTokenId: string,
  activityCode: string,
  activityName: string,
  result: 1
}
export const agree:<T>(params:{workItemId:string,workflowInstanceId:string,bizObject:T,replayToken:string,approval:AgreeApproval|ProductionTaskAgreeApproval,workflowCode:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/runtime/form/submit",{...params,approval:{...params.approval,bizPropertyCode: "x_placeholder_comment_",actionType: 1,result: 1,},agree:"true",actionCode:"agree",formType:"1"});
}

//驳回操作
interface RejectApproval{
  content: string,
  workItemId: string,
  workflowInstanceId: string,
  workflowTokenId: string,
  activityCode: string,
  activityName: string,
  result: null
}
export const reject:<T>(params:{workItemId:string,workflowInstanceId:string,bizObject:T,replayToken:string,approval:RejectApproval,workflowCode:string,rejectToActivityCode:string})=>Promise<HttpResponse<any>>=params=>{
  return Axios.post("/api/runtime/workflow/reject_workItem",{...params,submitToReject:false,formType:"1"});
}

//云枢获取表单数据
export interface SheetData<T>{
  activityCode:string
  activityName:string
  workItemId:string
  workflowTokenId:string
  workflowInstanceId:string
  bizObject:{
    id:string
    data:T
  },
  formPermission:{
    actionPermission:{
      [key:string]:boolean|string,
    },
    dataPermissions:{
      [key:string]:DataPermissions
    }
  }
}

interface DataPermissions {
  v:boolean,e:boolean,r:boolean,subDataPermission:DataPermissions[],propertyCode:string
}

export const loadSheetData:<T>(params:{workflowInstanceId:string,workitemId?:string}|{startWorkflowCode:string})=>Promise<HttpResponse<SheetData<T>>>=params=>{
  if(Object.keys(params).includes("workitemId")){
    Object.defineProperty(params,"isWorkFlow",{
      value:true,
      enumerable:true,
    })
  }
  return Axios.get("/api/runtime/form/load",{params});
}

//云枢获取表单字段设置
export interface SheetConfig{
  [key:string]:{
    type:number,
    parentKey:string,
    visible:boolean,
    readonly:boolean,
    required:boolean,
    placeholder?:string,
    multi:boolean,
    name:string,
    options?:string,
    displayFormula:string,
    defaultValue:any,
    defaultValueType?:string,
    requiredFormula:string,
    roles?:{value:string,label:string},
    orgRoot?:{id:string}[]|string,
    orgRootValueType?:""|"ref"|"originatorDept",
    deptVisible?:"user"|"org",
    format?:string,
    schemaCode?:string,
    queryCode?:string,
    displayField?:string,
    mappings?:string,
    conditions?:string,
    linkMode?:string,
    selectMode?:string;
    majors?:string;
    jobs?:string;
    certifications?:string
  }
}
interface RawSheetConfig{
  [key:string]:{
    type:number,
    parentKey: string,
    key:string,
    columns:any[];
    options:{
      visible:boolean,
      readonlyFormula:boolean,
      requiredFormula:string,
      displayFormula:string,
      name:string,
      placeholder?:string,
      multi?:string|boolean,// 'true'|'false'|true|false,
      emptyValue?:string,
      options?:string,
      defaultValue:any,
      defaultValueType?:string,
      roles?:string,
      orgRoot?:{id:string}[]|string,
      orgRootValueType?:""|"ref"|"originatorDept",
      deptVisible?:"user"|"org",
      format?:string,
      schemaCode?:string,
      queryCode?:string,
      displayField?:string,
      mappings?:string,
      conditions?:string,
      linkMode?:string,
      selectMode?:string
    }
  }
}

export const sheetConfig:(params:{schemaCode:string,sheetCode:string;appCode?:string})=>Promise<SheetConfig|string>=async params=>{
  try {
    const {errcode,errmsg,data} = <HttpResponse<{id:string,publishedAttributesJson:string}>>await Axios.get("/api/app/bizsheet/get",{params});
    if(errcode) return `${errmsg}`;
    // @ts-ignore
    const {errcode:errcode2,errmsg:errmsg2,data:data2 } = <HttpResponse<QualificationConfig[]>>await Axios.get("/api/xtsjProject/systemManage/getJobQualificationConfig",{params});
    if(errcode2) return `${errmsg2}`;
    if(data?.publishedAttributesJson){
      // console.log("publishedAttributesJson",JSON.parse(data.publishedAttributesJson));
      const rawConfig = <RawSheetConfig>JSON.parse(data.publishedAttributesJson);
      const config:SheetConfig = {};
      for (const key in rawConfig) {
        if (Object.prototype.hasOwnProperty.call(rawConfig, key)) {
          const element = rawConfig[key];
          const roleItem: QualificationConfig[] = data2?.filter((qc)=> qc.param===key) as QualificationConfig[];
          config[key]={
            type:element.type,
            parentKey: element.parentKey,
            visible:element.options.visible,
            readonly:element.options.readonlyFormula,
            placeholder:element.options.placeholder?element.options.placeholder:element.options.emptyValue,
            multi:["true",true].includes(element.options.multi as string|boolean),
            name:element.options.name,
            displayFormula:element.options.displayFormula,
            defaultValue:element.options.defaultValue,
            requiredFormula: element.options.requiredFormula,
            required:false,
            orgRootValueType:element.options.orgRootValueType,
            deptVisible:element.options.deptVisible,
            format:element.options.format,
            schemaCode: element.options?.schemaCode??'',
            queryCode: element.options?.queryCode??'',
            displayField: element.options?.displayField??'',
            mappings: element.options?.mappings??'',
            conditions: element.options?.conditions??'',
            linkMode: element.options?.linkMode??'',
            selectMode: element.options?.selectMode??'',
            jobs: roleItem.length && element.type===50?roleItem[0].jobs.join(','):undefined,
            majors: roleItem.length && element.type===50?roleItem[0].majors.join(','):undefined,
            certifications: roleItem.length && element.type===50?roleItem[0].certifications.join(','):undefined
          }
          if(element.options.options){
            config[key].options = element.options.options;
          }
          if(element.options.defaultValueType){
            config[key].defaultValueType = element.options.defaultValueType;
          }
          if(element.options.orgRoot){
            config[key].orgRoot = element.options.orgRoot;
          }
          if(element.options.roles){
            config[key].roles = <{value:string,label:string}>JSON.parse(element.options.roles);
          }
          //子表处理  待处理：重名子表字段处理？
          if(element.type===FormControlType.Sheet) {
            if(element.columns) {
              element.columns.map((eSheet) => {
                config[eSheet.key]={
                  type:eSheet.type,
                  parentKey: eSheet.parentKey,
                  visible:eSheet.options.visible,
                  readonly:eSheet.options.readonlyFormula,
                  placeholder:eSheet.options.placeholder?eSheet.options.placeholder:eSheet.options.emptyValue,
                  multi:["true",true].includes(eSheet.options.multi as string|boolean),
                  name:eSheet.options.name,
                  displayFormula:eSheet.options.displayFormula,
                  defaultValue:eSheet.options.defaultValue,
                  requiredFormula: eSheet.options.requiredFormula,
                  required:false,
                  orgRootValueType:eSheet.options.orgRootValueType,
                  deptVisible:eSheet.options.deptVisible,
                  schemaCode: eSheet.options?.schemaCode??'',
                  queryCode: eSheet.options?.queryCode??'',
                  displayField: eSheet.options?.displayField??'',
                  mappings: eSheet.options?.mappings??'',
                  conditions: eSheet.options?.conditions??'',
                  linkMode: eSheet.options?.linkMode??'',
                  selectMode: eSheet.options?.selectMode??''
                }
                if(eSheet.options.options){
                  config[eSheet.key].options = eSheet.options.options;
                }
                if(eSheet.options.defaultValueType){
                  config[eSheet.key].defaultValueType = eSheet.options.defaultValueType;
                }
                if(eSheet.options.orgRoot){
                  config[eSheet.key].orgRoot = eSheet.options.orgRoot;
                }
                if(eSheet.options.roles){
                  config[eSheet.key].roles = <{value:string,label:string}>JSON.parse(eSheet.options.roles);
                }
              })
            }
          }
        }
      }
      return config;
    }else{
      return " ";
    }
  } catch (error) {
    return `${error}`;
  }
}

export const sheetConfigFromDataManage:(params:{publishedAttributesJson:string})=>Promise<SheetConfig|string>=async params=>{
  try {
    const {errcode,errmsg,data} = <HttpResponse<{publishedAttributesJson:string}>>await Axios.post("/dataManage/form/load",params);
    if(errcode) return `${errmsg}`;
    if(!data?.publishedAttributesJson) return "";
    const rawConfig = <RawSheetConfig>JSON.parse(data.publishedAttributesJson);
    // console.log("RawConfig",rawConfig);
    const config:SheetConfig = {};
    for (const key in rawConfig) {
      if (Object.prototype.hasOwnProperty.call(rawConfig, key)) {
        const element = rawConfig[key];
        config[key]={
          type:element.type,
          parentKey: element.parentKey,
          visible:element.options.visible,
          readonly:element.options.readonlyFormula,
          placeholder:element.options.placeholder?element.options.placeholder:element.options.emptyValue,
          multi:["true",true].includes(element.options.multi as string|boolean),
          name:element.options.name,
          displayFormula:element.options.displayFormula,
          defaultValue:element.options.defaultValue,
          requiredFormula: element.options.requiredFormula,
          required:false,
        }
        if(element.options.options){
          config[key].options = element.options.options;
        }
        if(element.options.defaultValueType){
          config[key].defaultValueType = element.options.defaultValueType;
        }
        if(element.options.orgRoot){
          config[key].orgRoot = element.options.orgRoot;
        }
        if(element.options.roles){
          config[key].roles = <{value:string,label:string}>JSON.parse(element.options.roles);
        }
      }
    }
    return config;
  } catch (error) {
    return `${error}`;
  }
}

/* 系统Options */
const systemOptions:(params:{appCode:string})=>Promise<HttpResponse<{[key:string]:string[]}>>=params=>{
  return Axios.get("/api/xtsjProject/systemManage/getContentItemRule",{params});
}

/* 项目阶段Options */
export const engineeringStageOptions:(params:{appCode:string})=>Promise<string[]|null>=async params=>{
  try {
    const {errcode,data} = await systemOptions(params);
    if(errcode){
      return null
    }
    return data?.['projectStates']??null;
  } catch (error) {
    return null;
  }
}

/* 专业名称Options */
export const professionNameOptions:(params:{appCode:string})=>Promise<string[]|null>=async params=>{
  try {
    const {errcode,data} = await systemOptions(params);
    if(errcode){
      return null
    }
    return data?.['professionTypes']??null;
  } catch (error) {
    return null;
  }
}
