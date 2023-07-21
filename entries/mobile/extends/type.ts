import {ProjectLevel} from "./constant";
import {saveAnnotationH5} from "./service/api";

// import {BizSheet, MBSNode, QualityAttachment} from "../../portal/extends/type";

export interface CustomerRouter {
  name: string;
  path: string;
  isNav?: boolean;
  locale?: string;
  navIndex?: number;
  component: () => Promise<any>
}

/* quality */
export interface BizSheet {
  appCode: string;
  attachments: Array<QualityAttachment>;
  bizAppCode: string;
  bizId: string;
  bizObjId: string;
  createTime: string;
  id: string;
  jbsBizId: string;
  jbsId: string;
  mbsCode: string;
  modifyTime: string;
  projectName: string;
  qbsBizId: string;
  qbsCode: string;
  qbsId: string;
  schemaCode: string;
  sequenceNo: string;
  sheetName: string;
  status: string;
  userId: string;
  workFlowCode: string;
}

export interface MBSNode {
  id: string;
  qbsId: string;
  mbsCode: string;
  appCode: string;
  projectName: string;
  mbsId: string;
}

export interface CustomerComponentRouters {
  [propsName: string]: CustomerRouter | CustomerComponentRouters;
}

export interface QualityAttachment {
  downloadUrl: string;
  name: string;
  previewUrl: string;
}

export interface userInfo {
  active: boolean;
  admin: boolean;
  agentId: string;
  appellation: string;
  birthday: string;
  boss: boolean;
  corpId: string;
  createdBy: string;
  createdTime: string;
  deleted: boolean;
  departmentId: string;
  departmentName: string;
  departmentNames: string;
  departureDate: string;
  deptIds: string;
  dingUserJson: string;
  dingtalkId: string;
  email: string;
  employeeNo: string;
  employeeRank: string;
  entryDate: string;
  entryTime: string;
  extend1: string;
  extend2: string;
  extend3: string;
  extend4: string;
  extend5: string;
  gender: string;
  id: string;
  identityNo: string;
  imgUrl: string;
  imgUrlId: string;
  isAuthUser: boolean;
  isHomeSchool: string;
  isImport: boolean;
  leader: boolean;
  logoUrl: string;
  mainDepartmentName: string;
  manager: string;
  managerId: string;
  managerName: string;
  mobile: string;
  mobileServerUrl: string;
  modifiedBy: string;
  modifiedTime: string;
  name: string;
  officePhone: string;
  parentDepartmentName: string;
  pcServerUrl: string;
  permissions: Array<string>;
  pinYin: string;
  position: string;
  privacyLevel: string;
  relatedOrgType: string;
  relatedSyncType: string;
  relatedType: string;
  remarks: string;
  roleIds: string;
  roleName: string;
  secretaryId: string;
  secretaryName: string;
  shortPinYin: string;
  sortKey: string;
  sourceId: string;
  status: string;
  unitType: number;
  userId: string;
  username: string;
}

export interface SystemConfig {
  multiProjectFlag: any;
  id: string;
  path: string;
  logo: string;
  background: string;
  port: number;
  title: string;
  corpId: string;
  single: boolean;
  host: string;
  bimUrl: string;
}

interface ObjectIdQuery {
  propertyCode: string;
  propertyType: number;
  propertyValue: string;
  propertyValueName: string;
}

interface ObjectIdRes {
  createdTime?: string;
  data?: unknown;
  id?: string;
  loadedFromDb?: boolean;
  modifiedTime?: string;
  name?: string;
  ownerDeptQueryCode?: string;
  sequenceNo?: string;
  sequenceStatus?: string;
  sheetCode?: string;
  status?: string;
  workflowInstanceId?: string;
}

export interface QueryObjectId {
  filters: Array<ObjectIdQuery>,
  mobile: boolean; //0
  page: number; //0
  queryCode: string; //CH_model_config
  schemaCode: string; //CH_model_confg
  size: number; //0
  //res
  content?: Array<ObjectIdRes>
}

export interface QueryLayer {
  sheetCode: string;
  objectId: string;
  schemaCode: string;
  bizObject?: {
    data: LayerStandardData
  };
}

export interface LayerDataSources {
  Pkid: string;
  pid: string;
  layerType: string;
  layerName: string;
  dataSourceName: string;
  indexOrder: number;
}

export interface ProjectConfig {
  projectName: string | null;
  projectLevel: ProjectLevel | null;
  projectKey: string | null;
  multiProjectFlag: boolean;
  readonly updateProjectConfig: (n: ProjectConfig["projectName"], l: ProjectConfig["projectLevel"], k: ProjectConfig["projectKey"]) => void;
}

export interface ThemeConfig {
  id: string;
  path: string;
  logo: string;
  background: string;
  port: number;
  title: string;
  corpId: string;
  single: boolean;
  host: string;
  bimUrl: string;
  multiProjectFlag: boolean;
}

export interface LayerStandardData {
  Pkid: string;
  ownerProject: string;
  modelName: string;
  modelDesc: string;
  modelLng: number;
  modelLat: number;
  modelAlt: number;
  D3Server: string;
  sceneServer: string;
  dataServer: string;
  SGCompany: string;
  JLCompany: string;
  indexOrder: number
  dataSources: Array<LayerDataSources>
}

export interface LayerSettled {
  id: string;
  response: LayerOriginData;
}

export interface LayerOriginDataSources {
  id: string;
  parentId: string;
  layer_type: string;
  layer_name: string;
  dataSource_name: string;
  sort_num: number;
}

export interface LayerOriginData {
  d3_server: string;
  sceneServer: string;
  sj_company: string;
  sg_company: string;
  data_server: string;
  dataSources: Array<LayerOriginDataSources>;
  index_order: number;
  model_alt: number;
  model_desc: string;
  model_lat: number;
  model_lng: number;
  model_name: string;
  owner_project: string;
}

export interface QueryBuildInfo {
  appCode: string;
  projectName: string;
  smid: string;
  dataSource: string;
}

export interface QueryDesignInfo extends QueryBuildInfo {
  stage: string;
}

export interface QueryRoadWork extends QueryBuildInfo {
}

export interface QueryOperation extends QueryBuildInfo {
}

export interface bimTreeInfo {
  appCode: string;
  currentProjectName: string;
  currentLevel: string;
}

export interface bimProjectInfo {
  appCode: string;
}

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
  smid: string
}

export interface getMeasureCardParams {
  appCode: string;
  projectId: string;
  projectName: string;
  bimCardId: string;
  dataSource: string;
  smid: string
}

export interface getColumnsParams {
  code: string;
  schemaCode: string;
  source: number
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

export interface AppItem {
  appCode: string;
  children: Array<any> | null;
  code: string;
  createdBy: string;
  createdTime: string;
  deleted: boolean;
  icon: string;
  id: string;
  mobileAble: boolean;
  mobileUrl: string;
  modifiedBy: string;
  modifiedTime: string;
  name: string;
  name_i18n: string;
  openMode: string;
  parentId: string;
  pcAble: boolean;
  pcUrl: string;
  published: boolean;
  remarks: string;
  sortKey: number;
  type: string
}

export interface ProjectConfig {
  projectName: string | null;
  projectLevel: ProjectLevel | null;
  projectKey: string | null;
  multiProjectFlag: boolean;
  readonly updateProjectConfig: (n: ProjectConfig["projectName"], l: ProjectConfig["projectLevel"], k: ProjectConfig["projectKey"]) => void;
}

export interface getMeasureCardRes {
  dataDisplay: string;
  tableDatas: object
}

export interface getQBSTreeParams {
  appCode: string;
  projectName: string;
  name?: string;
  qbsId?: string;
  flag?: boolean;
  status?: number;
  selectIds?: string[]
}

export interface QualityTable {
  checked: boolean;
  appCode: string;
  attachments: Array<QualityAttachment>
  childs: Array<QualityTable>;
  datas?: Array<BizSheet>
  id: string;
  ids: Array<string>;
  jbsCode: string;
  jbs: Array<any>;
  jbsId: string;
  leaf: boolean;
  level: number;
  mbsCode: string;
  mbsId: string;
  mbs: Array<MBSNode>;
  modelTypeId: string;
  parent: string;
  parentId: string;
  parentName: string;
  progressState: string;
  projectName: string;
  qbsCode: string;
  qbsName: string;
  root: boolean;
  status: number;
  doneNum: number;
  doingNum: number;
  totalNum: number;
}

export interface QualityQBS {
  appCode: string;
  bizId: string;
  bizSheetName: string;
  sheetName: string;
  attachments: Array<QualityAttachment>;
  datas?: Array<BizSheet>

  id: string;
  projectName: string;
  qbsCode: string;
  qbsId: string;
  qbsName: string;
  recordId: string;
  status: string;
  schemaCode: string;
  sheetCode: string;
  others?: QualityQBS;
  workFlowCode?: string;
}

export interface TableColumn<T> {
  title?: string;
  dataIndex?: string;
  align?: string;
  ellipsis?: boolean;
  key?: string;
  customRender?: (text: string | T, record: T, index: number) => JSX.Element | Array<JSX.Element>;
  width?: string | number;
  type?: string;
  rowType?: string;
  unit?: string;
  editCmpnt?: string | Function;
  render?: Function;
  treeNode?: boolean;
}

/* quality */
export interface BizSheetC {
  appCode: string;
  attachments: Array<QualityAttachment>;
  bizAppCode: string;
  bizId: string;
  bizObjId: string;
  createTime: string;
  id: string;
  jbsBizId: string;
  jbsId: string;
  mbsCode: string;
  modifyTime: string;
  projectName: string;
  qbsBizId: string;
  qbsCode: string;
  qbsId: string;
  schemaCode: string;
  sequenceNo: string;
  sheetName: string;
  status: string;
  userId: string;
  workFlowCode: string;
}

export interface MyMessage {
  id: string;
  createdTime: string;
  imageList: any[];
  isRead: boolean;
  noticeContent: string;
  noticeSort: number;
  noticeTitle: string;
  projectName: string;
  uploadTime: string;
  uploader: string;
  url: string;
}

export interface HitsTable<T> {
  current: number,
  hitCount: boolean,
  pages: number,
  records: T,
  searchCount: boolean,
  size: number,
  total: number
}

export interface UrlDetail {
  sheetCode?: string;
  objectId?: string;
  schemaCode?: string;
  isWorkFlow?: string | boolean,
  return?: string;
  workflowInstanceId?: string
}

export interface QingShiDeviceData {
  altitude: number,
  audioEnable: number,
  channel: number,
  channelId: string,
  channelName: string,
  cloudRecord: number,
  consoleControl: number,
  customType: number,
  deviceId: string,
  deviceOnline: number,
  id: string,
  latitude: number,
  longitude: number,
  manufacturer: string,
  ondemand: number,
  parentId: string,
  projectName: string,
  shared: number,
  sortKey: number,
  symbolId: string,
  snapUrl?: string
}

export interface Department {
  id: string,
  name: string,
  editFlag: boolean,
  children: Department[],
  parent: string,
  parentId: string
}

export interface SchemaCodeTemplate {
  fileName?: string;
  data?: string;
  id?: string;
  schemaCode?: string;
}

export interface ReportPageOrigin {
  id: string;
  code: string;
  origin: string;
}

export interface MaterialInfo {
  types: MaterialInfoTypes[];
}

export interface MaterialInfoTypes {
  type: string;
  totalDesignValue: number;
  registers:MaterialInfoTypesRegisters[]
}

export interface MaterialInfoTypesRegisters {
  code: string;
  designValue: number;
  materialName: string;
  payType: string;
  registerId: string;
  specification: string;
  totalQuit: number;
  totalSave: number;
  unit: string;
}

export interface GetMaterialInfoParams {
  appCode: string;
  projectName: string;
  singleProject: boolean;
  payType: string;
  dateType: string;
  year: string;
  startMonth: string | Date;
  endMonth: string | Date;
}

export interface DeviceInspectTasks {
  checkTime: string;
  checker: string;
  color: string;
  deviceName: string;
  id: string;
  name: string;
  status: string;
}

export interface DeviceInspectPlans {
  completeNum: string;
  id: string;
  inspectContent: string;
  leftNum: string;
  name: string;
  type: string;
}

export interface DesignTaskInfo {
  id: string;
  professionName: string;
  designFlag: string;
  proofreadLevel: string;
  countersignFlag: string;
  projectManagerAudit: string;
  designer: string;
  designerName: string;
  designGuider: string;
  designGuiderName: string;
  auditor: string;
  auditorName: string;
  checker: string;
  checkerName: string;
  taskTime: string;
  planStartTime: string;
  planEndTime: string;
  planDuration: string;
  workContent: string;
  attachmentList: Attachment[];
  modelType: string;
  checkButton: boolean;
  rejectButton: boolean;
  workflowInstanceId: string;
  professionTaskName: string
}
export interface Attachment {
  id: string;
  refId: string;
  name: string;
  fileSize: string;
  traceId: string;
}

export interface AnnotationList {
  id: string;
  annotationList: Annotation[]
}
export interface Annotation {
  id: string;
  createdTime: string;
  instanceName: string;
  annotationName: string;
  annotationDesc: string;
  thumbnail: string;
  fileName: string;
  pictureAnnotations: PictureAnnotations[]
}
export interface PictureAnnotations {
  refId: string;
  downloadUrl: string;
  previewUrl: string
}
export interface AnnotationDetails extends Annotation {
  fileType: string;
  checker: string;
  checkerName: string;
  checkTime: string;
}
export interface YunAttachmentFile {
  id: string;
  bizObjectId: string;
  bizPropertyCode: string;
  createdTime: string;
  creater: string;
  fileExtension: string;
  fileSize: number;
  base64ImageStr: string;
  mimeType: number;
  name: string;
  parentBizObjectId: string;
  parentSchemaCode: string;
  refId: string;
  schemaCode: string;
  onlinePrewView: string;
  download: string;
  engineProjectId:string;
  engineModelId: string;
  engineFileName: string;
}
export interface AnnotationAttachment {
  refId: string;
  name: string;
  id: string;
  mimeType: string;
  fileSize: string
}
export interface TodoWorkItem {
  id: string;
  checkerName: string;
  engineeringName: string;
  professionName: string;
  professionTaskName: string;
  createrName: string;
  createdTime: string;
  workflowNode: string
}
