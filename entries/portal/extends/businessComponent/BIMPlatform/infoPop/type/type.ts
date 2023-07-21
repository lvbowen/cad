
export interface initCardParams {
  appCode: string;
  projectId: string
}

export interface getSubTabParams {
  appCode: string;
  projectId: string;
  fatherTabId: string
}

export interface getAllCardDataParams {
  appCode: string;
  projectId: string;
  projectName: string;
  bimCardId: string;
  dataSource: string;
  smid: string;
  modelType: string;
  codeValue: string;
}

export interface getMeasureCardParams {
  appCode: string;
  projectId: string;
  projectName: string;
  bimCardId: string;
  dataSource: string;
  smid: string;
  modelType: string;
  codeValue: string;
}
export interface getQualityCardParams {
  appCode: string;
  projectName: string;
  smid: string;
  dataSource: string;
  modelType: string;
  codeValue: string;
}

export interface getColumnsParams {
  code: string;
  schemaCode: string;
  source:number
}

export interface getFormUrlParams {
  bizObjectId: string;
  schemaCode: string;
}

export interface initCardRes {
  buttonLevel: string;
  buttonName: string;
  buttonSort: number;
  dataDisplay: string;
  designData: number;
  fatherSelect: string;
  id: string;
  projectList: string;
  selected: number;
  showControl: number;
}

export interface getSubTabRes {
  buttonLevel: string;
  buttonName: string;
  buttonSort: number;
  dataDisplay: string;
  designData: number;
  fatherSelect: string;
  id: string;
  projectList: string;
  selected: number;
  showControl: number;
}

export interface getAllCardDataRes {
  dataDisplay: string;
  tableDatas: object
}

export interface getMeasureCardRes {
  dataDisplay: string;
  tableDatas: object
}

export interface getQualityCardRes {
  errmsg: string;
  data: object
}

export interface QbsBiz {
  id: string,
  projectName: string,
  appCode: string,
  schemaCode: string,
  bizId: string,
  qbsId: string,
  jbsId: string,
  bizAppCode: string,
  qbsCode: string,
  sheetName: string,
  workFlowCode: string | null,
  datas: any,
  status: null | number,
  qbs:string | null,
  dataSizes: number | null,
  completeFraction: string
}
