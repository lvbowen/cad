import { HttpResponse } from "@cloudpivot/api/src/response";
import Axios, { AxiosPromise } from "axios";
// import env from '@/config/env';
// @ts-ignore
import {
  initCardParams,
  getSubTabParams,
  getAllCardDataParams,
  getMeasureCardParams,
  getColumnsParams,
  initCardRes,
  getSubTabRes,
  getAllCardDataRes,
  getMeasureCardRes,
  getFormUrlParams,
  getQualityCardParams,
  getQualityCardRes,
} from './type/type'
import {BimModelAttribute} from '../../../type'

export const initCard: ( params: initCardParams ) => Promise<HttpResponse<initCardRes>> = ( params ) => {
  return Axios.get( '/bim/data/initCard', { params } );
}

export const getSubTab: ( params: getSubTabParams ) => Promise<HttpResponse<getSubTabRes>> = ( params ) => {
  return Axios.get( '/bim/data/getSubTab', { params } );
}

export const getAllCardData: ( params: getAllCardDataParams ) => Promise<HttpResponse<getAllCardDataRes>> = ( params ) => {
  return Axios.post( '/bim/data/getCardTable', params );
}

export const getMeasureCardV3: ( params: getMeasureCardParams ) => Promise<HttpResponse<getMeasureCardRes>> = ( params ) => {
  return Axios.post( '/bim/measure/v3/getMeasureCard', params );
}

export const getMeasureCardV2: ( params: getMeasureCardParams ) => Promise<HttpResponse<getMeasureCardRes>> = ( params ) => {
  return Axios.post( '/bim/measure/getMeasureCard', params );
}

export const getScheduleCardV3: ( params: getMeasureCardParams ) => Promise<HttpResponse<getMeasureCardRes>> = ( params ) => {
  return Axios.post( '/bim/wbs/getScheduleCardV3', params );
}

export const getScheduleCardV2: ( params: getMeasureCardParams ) => Promise<HttpResponse<getMeasureCardRes>> = ( params ) => {
  return Axios.post( '/bim/wbs/getScheduleCard', params );
}

export const getQualityCard: ( params: getQualityCardParams ) => Promise<HttpResponse<getQualityCardRes>> = ( params ) => {
  return Axios.get( '/api/quality/v2/analyse/bim/mbs/bizs', { params } );
}

export const getColumns: ( params: getColumnsParams ) => Promise<HttpResponse<any>> = ( params ) => {
  return Axios.get( '/api/app/query/get', { params } );
}

export const getFormUrl: ( params ) => AxiosPromise<string> = ( params ) => {
  return Axios.get( '/api/runtime/form/get_form_url', { params } );
}
//
// export const getAllListData: (params:{
//   schemaCode:string,
//   projectName:string,
//   keyWord:string,
// }) => Promise<HttpResponse<any>> = (params) => {
//   return Axios.get('/bim/analysis/getAllListData', {params});
// }

//查询列表配置信息
export const queryGet: ( params: {
  schemaCode: string,
  code: string,
  source: number,
  viewSource?: boolean,
  clientType?: string
} ) => Promise<HttpResponse<any>> = ( params ) => {
  return Axios.get( '/api/app/query/get', { params } );
}

//获取表单关联数据
export const getCardTableData: ( params: {
  appCode: string,
  projectName: string,
  smid: string,
  dataSource: Array<any>,
  schemaCode: string,
  keyWord?: string,
  modelType: string;
  codeValue: string;
} ) => Promise<HttpResponse<any>> = ( params ) => {
  return Axios.get( '/bim/data/getCardTableData', { params } );
}

//获取bim弹窗类库属性
export const getModelPropertyBimCard: ( params: {
  appCode: string;
  projectName: string;
  projectId: string;
  bimCardId: string;
  modelType: string;
  smid: string;
  dataSource: string;
  codeValue: string;
} ) => Promise<HttpResponse<Array<BimModelAttribute>>> = ( params ) => {
  return Axios.post( '/api/deliveryLibrary/modelPropertyBimCard',  params );
}
