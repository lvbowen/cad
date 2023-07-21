import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";
import * as Type from '../type';

//获取组件下的所有表单
export const getAllTableAnalysis: (params: {
  appCode:string,componetCode:string
}) => Promise<HttpResponse<{[propsName: string]: string;}>> = (params) => { return Axios.get('/bim/analysis/getAllTable', {params}) }

//获取表单所有分析列和选项
export const getAllOptionsAnalysis: (params: {
  appCode:string,schemaCode:string
}) => Promise<HttpResponse<{[propsName: string]: any}>> = (params) => { return Axios.get('/bim/analysis/getAllOptions', {params}) }

//获取列表所有数据
export const getAllListDataAnalysis: (params: {
  schemaCode:string,projectName:string,keyWord?:string
}) => Promise<HttpResponse<{[propsName: string]: any}>> = (params) => { return Axios.get('/bim/analysis/getAllListData', {params}) }

//获取列表统计数据某类值在bim中的位置
export const showStaticDataAnalysis: (params: {
  appCode:string,dataList:Array<any>,optionCode:string,optionValue:string,preUrl:string,projectName:string,schemaCode:string,token:string
}) => Promise<HttpResponse<{[propsName: string]: any}>> = (params) => { return Axios.post('/bim/analysis/showStaticData', params) }

//在bim中展示表格数据定位或关联模型
export const showTableDataAnalysis: (params: {
  appCode:string,dataList:Array<any>,optionCode:string,optionValue?:string,preUrl:string,projectName:string,schemaCode:string,token?:string
}) => Promise<HttpResponse<{[propsName: string]: any}>> = (params) => { return Axios.post('/bim/analysis/showTableData', params) }

//筛选所有坐标数据
export const filterAllCoorDataAnalysis: (params: {
  appCode?:string,dataList:Array<any>,filterValue:string,propertyCode:string
}) => Promise<HttpResponse<Array<any>>> = (params) => { return Axios.post('/bim/analysis/filterAllCoorData', params) }

//根据条件筛选数据,适配树组件
export const filterDataAnalysis: (params: {
  appCode?:string,dataList:Array<any>,filterValue:string,propertyCode:string
}) => Promise<HttpResponse<Array<any>>> = (params) => { return Axios.post('/bim/analysis/filterDataV2', params) }

//筛选所有模型数据
export const filterAllModelDataAnalysis: (params: {
  appCode?:string,dataList:Array<any>,filterValue:string,propertyCode:string
}) => Promise<HttpResponse<Array<any>>> = (params) => { return Axios.post('/bim/analysis/filterAllModelData', params) }

//获取列表统计数据
export const getStaticDataAnalysis: (params: {
  appCode:string,dataList:Array<any>,optionCode:string,optionValue?:string,preUrl?:string,projectName:string,schemaCode:string,token?:string
}) => Promise<HttpResponse<Array<any>>> = (params) => { return Axios.post('/bim/analysis/getStaticData', params) }

//获取数据关联模型或坐标
export const getDataRelateAnalysis: (params: {
  appCode:string,data:any
}) => Promise<HttpResponse<any>> = (params) => { return Axios.post('/bim/analysis/getDataRelate', params) }

//更新数据关联模型或坐标
export const updateDataRelateAnalysis: (params: {
  projectName:string,appCode:string,schemaCode:string,codeValue:string,dataId:string,longitude:number,latitude:number,altitude:number
}) => Promise<HttpResponse<number>> = (params) => { return Axios.post('/bim/analysis/updateDataRelate', params) }

//获取列表统计数据某类值在bim中的位置
export const showStaticDataDigital: (params: {
  appCode:string,dataList: Array<any>,optionCode:string,optionValue?:string,preUrl?:string,projectName:string,schemaCode:string,token?:string
})=> Promise<HttpResponse<any>> = params => { return Axios.post('/api/unity/analysis/showStaticData',params) }

//在bim中展示表格数据定位或关联模型
export const showTableDataDigital: (params: {
  appCode:string,dataList: Array<any>,optionCode:string,preUrl?:string,projectName:string,schemaCode:string
})=> Promise<HttpResponse<any>> = params => { return Axios.post('/api/unity/analysis/showTableData',params) }


//获取模型组
export const getGroupSymbol: (params: {
  appCode: string, projectName:string,groupOnwer:string
}) => Promise<HttpResponse<Array<{ [propsName: string]: any }>>> = params => { return Axios.get('/bim/symbol/getGroup', {params}) }

//根据项目获取模型列表
export const getSymbolList: (params: {
  appCode: string, projectName:string,geometryTypes:string
}) => Promise<HttpResponse<Array<{ [propsName: string]: any }>>> = params => { return Axios.get('/bim/symbol/getSymbolList', {params}) }

//更新模型列表
export const updateSymbolList: (params: {
  appCode: string, symbolList:any
}) => Promise<HttpResponse<Array<{ [propsName: string]: any }>>> = params => { return Axios.post('/bim/symbol/updateSymbolList', params) }

//保存模型列表
export const saveSymbolList: (params: {
  appCode: string, symbolList:any
}) => Promise<HttpResponse<Array<{ [propsName: string]: any }>>> = params => { return Axios.post('/bim/symbol/saveSymbolList', params) }

//删除模型列表
export const deleteSymbolList: (params: {
  appCode: string, id:string
}) => Promise<HttpResponse<Array<{ [propsName: string]: any }>>> = params => { return Axios.get('/bim/symbol/deleteSymbolList', {params}) }

//通过坐标点获取弹窗数据
export const getDataFromCoordinate: (params: {
  appCode: string, schemaCode:string,dataId:string
}) => Promise<HttpResponse<Array<{ [propsName: string]: any }>>> = params => { return Axios.get('/bim/analysis/getDataFromCoordinate', {params}) }

//获取模型自定义属性
export const getSymbolListSelfMsg: (params: {
  appCode: string, symbolId:string
}) => Promise<HttpResponse<{ [propsName: string]: any }>> = params => { return Axios.get('/bim/symbol/getSymbolListSelfMsg', {params}) }

//删除图片或附件
export const deleteFile: (params: {
  appCode: string, symbolId:string,refId:string
}) => Promise<HttpResponse<boolean>> = params => { return Axios.get('/bim/symbol/deleteFile', {params}) }

//保存模型自定义属性
export const saveSymbolListSelfMsg: (params: {
  appCode: string, symbolListSelfMsg:any
}) => Promise<HttpResponse<boolean>> = params => { return Axios.post('/bim/symbol/saveSymbolListSelfMsg', params) }
