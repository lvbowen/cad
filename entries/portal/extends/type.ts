import FlvJs from "flv.js";
import moment from "moment";
import { ProjectLevel } from "./constant";
import { initCardRes } from "./businessComponent/BIMPlatform/infoPop/type/type";
import { Attachemnt } from "@cloudpivot/api/src/form-comment.params";
import { projectListV2 } from "./service/CoordinateDesign/ProjectList";
import { getFiledDesignAchievements } from "./service/CoordinateDesign/base";
import { queryMyWorkItemsNumber } from "./service/CoordinateDesign/myHomePage";
declare interface CustomerRouter {
  name: string;
  path: string;
  component: () => Promise<any>
}

export type ValueOf<T> = T[keyof T];

export interface TreeNodeProps {
  title: string;
  key: string;
  children?: Array<TreeNodeProps>
}

export interface HttpRes<T> {
  errcode?: number
  errmsg?: string
  data?: T
}

export interface HitsTable<T> {
  current: number,
  hitCount: boolean,
  pages: number,
  records: T,
  searchCount: boolean,
  size: number,
  total: number,
  totalMoney?: number
}

export interface CustomerComponentRouters {
  [propsName: string]: CustomerRouter | CustomerComponentRouters;
}

export interface ApiResponse<T> {
  data: null | Array<T>;
  errcode: number;
  errmsg: string;
  traceId?: string;
}

export interface CKEditorUploadAdapter {
  loader: {
    file?: Promise<File>;
  };
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
  scopedSlots?: object
}
export interface TableConfig<T> {
  dataSource: Array<T>,
  total: number;
  pageNum?: number;
  current: number;
  pageSize: number;
}

export interface TableReqConfig {
  pageNum: number;
  pageSize: number;
  projectCode?: string | undefined;
}

export interface HitsTable<T> {
  hits: T;
  nextPage: number;
  pageNum: number;
  totalHits: number;
  totalPage: number;
}

interface EditTable {
  cid?: string;
  edited?: boolean;
}

export interface ProgressPlanOverview {
  workmonth: string;
  startdate: string;
  enddate: string;
  contractnum?: string;
  projectCode?: string | undefined;
}

export interface ProgressPlanList {
  totalMoney: number;
  scheduleDate: string;
}

export interface ProgressPlanOverviewRes {
  workmonth: string,
  workstart: string,
  workend: string,
  totalMoney: number,
  monthMoney: number,
  yearMoney: number,
  list: Array<ProgressPlanList>
}

export interface ProgressLogList extends TableReqConfig {
  projectCode?: string;
  contractnum?: string; //合同编号
  scheduledate?: string;//日期
}

export interface ProgressLogRes {
  contractnum: string;
  contractorgname: string;
  contractorgoid: string;
  humidity: string;
  id: string;
  journalamount: number;
  journalmoney: number;
  journaltitle: string;
  scheduledate: string;
  temperature: string;
  weather: string;
  winddirection: string;
  windspeed: string;
  workend: string;
  workstart: string;
  //选择的合同的id
  cid?: string;
  //是否编辑
  edited?: boolean;
  //临时数据标识
  tempId?: number;
}

export interface ProgressLogListRes {
  data: Array<ProgressLogRes>;
  pageNum: number;
  pageSize: number;
  totalSize: number;
}

export interface TableRes<T> {
  data: T;
  pageNum: number;
  pageSize: number;
  totalSize: number;
}

export interface PageTableRes<T> {
  data: Array<T>;
  pageNum: number;
  pageSize: number;
  totalSize: number;
}

export interface WBSreport {
  id?: string;
  reportwbs: string;
  worknamewbs: string;
  metricwbs: string;
  unitpricewbs: number;
  planamountwbs: number;
  planmoneywbs: number;
  reportamountwbs: number;
  reportmoneywbs: number;
  finishstatewbs: string;
  state: string;
  th04aPlandetailFk: string;
  th04bSchedulejournalFk: string
  //选择编辑用
  cid?: string;
  edited?: boolean;
  //联合查询
  plandetailstart?: string;
  plandetailend?: string;
  planedTimeLimit?: string;
  //tree
  children?: Array<WBSreport>;
  childCount?: number;
}
export interface WBSreportV3 {
  id?: string;
  qbsCode?: string;
  reportwbs: string;
  worknamewbs: string;
  qbsName: string;
  metricwbs: string;
  unitpricewbs: number;
  planamountwbs: number;
  planmoneywbs: number;
  reportamountwbs: number;
  reportmoneywbs: number;
  finishstatewbs: string;
  state: string;
  th04aPlandetailFk: string;
  th04bSchedulejournalFk: string
  //选择编辑用
  cid?: string;
  edited?: boolean;
  //联合查询
  plandetailstart?: string;
  plandetailend?: string;
  planedTimeLimit?: string;
  //tree
  children?: Array<WBSreportV3>;
  childCount?: number;
}

export interface WBSconnectMBS extends EditTable {
  id: string;
  relateddetailwbs: string;
  wbsname: string;
  wbsplanstart: string;
  wbsplanend: string;
  relatedmbs: string;
  mbsname: string;
  mbsmoney: number;
  mbsamount: number;
  state: string;
  finishstatembs: string;
  th04aPlandetailFk: string;
  ta01CodeFk: string;
  //设置实际开始日期
  workStartDate: string;
}

export interface MBSBuild extends EditTable {
  id: string;
  mbs: string;
  mbsname: string;
  reportdatembs: string;
  planamountmbs: number;
  planmoneymbs: number;
  reportamountmbs: number;
  reportmoneymbs: number;
  finishstatembs: string;
  state: string;
  th04bReportwbsFk: string;
  th04aWbsmbsrelaFk: string;
  //
  tempData?: boolean;
}

export interface ContractModel {
  id: string;
  contractnum: string;
  projectname: string;
  contractname: string;
  contracttotalmoney: string;
  sgcompany: string;
  sgdelegate: string;
  jlcompany: string;
  jldelegate: string;
  yzcompany: string;
  yzdelegate: string;
  contractorgname: string;
  contractorgoid: string;
  relcontractorgoid: string;
}

export interface AggregationTable<K, V> {
  leftDataSource?: Array<K>,
  leftTempData?: Array<K>,
  rightDataSource?: Array<V>,
  rightTempData?: Array<V>
}

export interface MbsReq extends TableReqConfig {
  id?: string;
  projectCode?: string;
}

export interface SchemaCodeTemplate {
  fileName?: string;
  data?: string;
  id?: string;
  schemaCode?: string;
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
  simpleQualityFlag: boolean;
}

export interface PanelData<T> {
  name: string;
  icon: string;
  extra?: T
}

export interface tabData<T> {
  name: string;
  key: number | string;
  extra?: T
}

export interface DataTable<T> {
  title: string;
  tabs: Map<number | string, tabData<T>>
}

export interface News {
  id?: string | number;
  img?: string;
  title?: string;
  aside?: string;
  date?: string;
}

export interface ArticleDetailQuery {
  tabDataId: string;
  appCode: string;
  tabId?: string;
}

export interface ArticleDetailUpdate {
  id?: string;
  tabDataId?: string;
  content?: string;
}

export interface ArticleDetailResult {
  appCode: string;
  data: {
    id: string;
    content: string;
    tabId: string;
  };
  isAsc: boolean;
  nextTabData: News | null;
  prevTabData: News | null;
  sortKey: string;
  title: string;
}


//components
export type OriginData = Array<any>;

export interface DTreeComponent<T> {

  /* 是否启用搜索框 */
  enableSearch: boolean;

  /* 默认选中节点key */
  defaultSelect?: Array<string>;

  /* 默认展开的节点keys */
  defaultExpanded?: Array<string>;

  /* 树节点数据源 */
  originSources?: Array<T>;

  /* 获取树选择的key */
  getSelectKeys: () => Array<string>;

  /*获取树展开的key*/
  getExpendedKeys: () => Array<string>;

}

export interface DevicesProps {
  id: string;
  type: string;
  name: string;
  url: string;
}

//BIMproject
export interface BIMProjectQuery {
  appCode: string;
  currentProjectName: string;
  currentLevel: string;
}
export interface BimTreeFilterQuery {
  bimTreeCodeList: Array<any>;
  currentNodeName: string
}


//RdpReport
export interface RdpReportQuery {
  appCode: string;
  projectName: string;
}

export interface BimTreeFilterQuery {
  bimTreeCodeList: Array<any>;
  currentNodeName: string
}

export interface BIMProjectResult {
  appKey: string | null;
  appSecret: string | null;
  childCount: number;
  codeSortByValue: number;
  codeType: string;
  codeValue: string;
  id: string;
  jldw1: string;
  key: string;
  modelLat: number;
  modelLng: number;
  name: string;
  nodeName: string;
  ownerProject: string;
  parentId: string;
  projectId: string;
  projectName: string;
  sequenceStatus: string;
  sgdw1: string;
  xmjc1: string;
  xmjl1: string;
  xmzj1: string;
  zgant_show_child: boolean;
  children: Array<BIMProjectResult>;
}

//video

export interface LiveStreamComponent {

  /* 播放器实例 */
  player?: FlvJs.Player

  /* 是否自动播放 */
  autoPlay: boolean;

  /* 流地址 */
  streamUrl: string;

  /* 播放 */
  play: () => void;

  /* 暂停 */
  pause: () => void;

  /* 初始化 */
  init: () => void;

  /* 销毁 */
  destroy: () => void;

}

export interface VideoConfig {
  type: string;
  url: string;
}

export interface VideoConfigQuery {
  projectId: string;
  appCode: string;
}

export interface VideoDevice {
  id: string;
  name: string;
  channel: number;
  sn: string;
  type: string;
  longitude: string;
  latitude: string;
  altitude: string;
  url: string;
  projectName: string;
  projectId: string;
  groupName: string;
  groupId: string;
  isDevice: boolean;
  isShow: boolean;
}

export interface VideoConfigResult {
  id: string;
  projectName: string;
  projectId: string;
  groupType: string;
  name: string;
  totalNum: number;
  subGroups: Array<VideoConfigResult> | null;
  devices: Array<VideoDevice>;
}

/* 默认载入地图项目marker */
export interface LoadMarker {
  id: string;
  type?: 'default' | 'active';
  lng: number;
  lat: number;
  projectInfo: {
    projectName: string;
    sgdw1: string;
    jldw1: string;
    xmjl1: string;
    xmzj1: string;
  }
}

/* 激活地图项目marker */
export interface ActiveMarker {
  id: string;
  type: 'active',
  lng: number;
  lat: number;
}

/* schedulePlan V2 */

// eslint-disable-next-line no-shadow
export enum SchedulePlanBizState {
  Unaudited = '未审核',
  Audit = '审核中',
  Audited = '已审核'
}

export interface SchedulePlan {
  planSchemeName: string;
  projectCode: string;
  projectName: string;
  remarks: string;
  schedulePlanId?: string;
  schemeMoney: number;
  schemePeriod: number;
  schemePlanAmount: number;
  schemePlanEnd: string | moment.Moment | Date;
  schemePlanStart: string | moment.Moment | Date;
  state?: string;
  //流程状态
  businessState?: string;
  ownerName?: string;
  modifiedTime?: string;
  ownerDeptName?: string;
  id?: string;
}

export interface PlanState {
  projectCode: string;
  schedulePlanId: string;
}

export interface SchedulePageQuery {
  projectCode: string;
  pageNum: number;
  pageSize: number;
  projectName: string;
  planSchemeName: string;
  schemeState: string;
}

export interface WBSPredecessorTask {
  id: string;
  lagDays: number;
  predecessorBS: string;
  predecessorId: string;
  predecessorName: string;
  projectCode: string;
  th04aPlandetailFk: string;
  type: string;
}

export interface WBSNdMBS {
  bs: string;
  wbs?: string;
  codeType: string;
  critical: string;
  id: string;
  milestone: string;
  warningProportion: number;
  planDetailAmount: number;
  planDetailEnd: string;
  planDetailMoney: number;
  planDetailName: string;
  planDetailPeriod: number;
  planDetailStart: string;
  planDetailUnit: string;
  planDetailUnitPrice: number;
  projectCode: string;
  remarks: string;
  state: 'add' | 'refresh' | 'exist';
  ta01CodeFk: string;
  th04aPlandetailFk: string;
  th04aPlanschemeFk: string;
  childCount?: number;
  Start?: string;
  Finish?: string;
  children?: Array<WBSNdMBS>;
  completeRatio?: number;
}

export interface WBSNdMBSV3 {
  bs: string;
  codeType: string;
  qbsName: string;
  critical: string;
  id: string;
  milestone: string;
  warningProportion: number;
  planDetailAmount: number;
  planDetailEnd: string;
  planDetailMoney: number;
  planDetailName: string;
  planDetailPeriod: number;
  planDetailStart: string;
  planDetailUnit: string;
  planDetailUnitPrice: number;
  projectCode: string;
  remarks: string;
  state: 'add' | 'refresh' | 'exist';
  ta01CodeFk: string;
  th04aPlandetailFk: string;
  qbsCode: string;
  projectName: string;
  childCount?: number;
  childs?: Array<WBSNdMBSV3>;
}

export interface WBSNdMBSGet {
  schedulePlanId: string;
  wbs: string;
  planDetailName: string;
  year: number;
  season: number;
  month: number;
  critical: string | number;
  milestone: string | number;
  predecessor: string;
  projectCode?: string;
  leaf?: string;
  startWorkState: string;
  endWorkState: string;
  progressState: string;
}

export interface SchedulePlanChildListQuery {
  projectCode: string;
  schedulePlanId: string;
  model: string;
  id: string;
}

export interface SchedulePlanListResult {
  countId?: string;
  current: number;
  hitCount: boolean;
  maxLimit?: number;
  optimizeCountSql: boolean;
  orders: Array<string>;
  pages: number;
  dataSources?: Array<SchedulePlan>;
  pageSize: number,
  records: Array<SchedulePlan>;
  searchCount: boolean;
  size: number;
  total: number;
}

export interface BatchOptionWBS {
  list: Array<any>;
  listRemove: Array<string>;
  projectCode: string;
}
export interface BatchOptionWBSV3 {
  list: Array<any>;
  listRemove: Array<string>;
  projectCode: string;
  reqDto?: object
}
export interface NoWBSLeafListData {
  projectCode: string;
  planId: string;
  parentId: string;
}

export interface DirectSum {
  projectCode: string;
  schedulePlanId: string;
}

export interface AddPredecessorTask {
  id: string;
  lagDays: number;
  predecessorBS: string;
  predecessorId: string;
  predecessorName: string;
  projectCode: string;
  th04aPlandetailFk: string;
  type: string;
}

export interface WBSTreeDataResult {
  childType?: string;
  bs: string;
  bsSort: number;
  children?: Array<WBSTreeDataResult>;
  codeType: string;
  critical: number;
  dayReportDetailAmount: string | number;
  dayReportDetailMoney: string | number;
  endWorkState: string;
  id: string;
  leaf: string | number;
  milestone: number;
  planDetailAmount: string | number;
  planDetailEnd: string;
  planDetailMoney: number | number;
  planDetailName: string;
  planDetailPeriod: number;
  planDetailStart: string;
  planDetailUnit: string;
  planDetailUnitPrice: string;
  predecessorLink: string;
  progressState: string;
  projectCode: string;
  remarks: string;
  reportBSId: string;
  reportDetailAmount: string | number;
  reportDetailMoney: string | number;
  reportEnd: string;
  reportStart: string;
  startWorkState: string;
  subPlanType: string;
  surplusAmount: number;
  surplusMoney: number;
  ta01CodeFk: string;
  th04aPlandetailFk: string;
  th04aPlanschemeFk: string;
  warningProportion: number;
}

export interface LogResult {
  id?: string;
  journalTitle?: string | null;
  projectName?: string | null;
  scheduleDate?: string | null;
  remark?: string | null;
  ownerName?: string | null;
  ownerDeptName?: string | null;
}

export interface PreTask {
  id?: string;
  lagDays?: number;
  predecessorBS?: string;
  predecessorId?: string;
  predecessorName?: string;
  projectCode?: string;
  th04aPlandetailFk?: string;
  type?: string;
}

export interface ChartDimension {
  uid: string;
  schemaCode: string;
  tableName: string;
  tableId: string;
  field: string;
  name: string;
  dataType: number;
  visible: boolean;
  specialType: string;
  type: string;
  alias: string;
  needAlias: boolean;
  relation: boolean;
  options: {};
  isRemove: boolean;
}

export interface ChartMetric {
  uid: string;
  schemaCode: string;
  tableName: string;
  tableId: string;
  field: string;
  name: string;
  dataType: number;
  visible: boolean;
  specialType: string;
  type: string;
  alias: string;
  needAlias: boolean;
  relation: boolean;
  options: {
    aggregateType: string;
    percent: string;
    numberFormat: {
      comma: boolean;
      percent: boolean;
      fraction: boolean;
    }
  },
  isRemove: boolean;
}

export interface ChartConfigRequest {
  title: string;
  authorization: number;
  dataSourceId: string;
  useType: number;
  type: string;
  dimension?: Array<ChartDimension>;
  metric?: Array<ChartMetric>;
  filter?: Array<unknown>;
  sort?: Array<unknown>;
  limit?: unknown;
}

export interface ChartConfig {
  title: string;
  authorization: number;
  dataSourceId: string;
  useType: number;
  type: string;
  data: {
    dimension: Array<ChartDimension>;
    metric: Array<ChartMetric>;
    filter: Array<unknown>;
    sort: Array<unknown>;
    limit: unknown;
  };
  w?: number;
  x?: number;
  y?: number;
  h?: number;
  handleActive?: boolean;
  i?: number;
  minH?: number;
  minW?: number;
}

export interface ChartGlobal {
  styles: {
    theme: {
      type: string;
      colors: Array<string>;
    },
    paintCoatTheme: string;
    paintCoat: {
      type: string;
      value: string;
    },
    elementCoat: {
      type: string;
      value: string;
    },
    fontSetting: {
      titleColor: string;
      fontColor: string;
    }
  }
}

export interface WBSTreeTableResult<T> {
  data: Array<T>;
  total?: number;
  totalSize?: number;
  pageSize?: number;
  pageNum?: number;
}

export interface ChartConfigResult {
  attributes: {};
  charts: Array<{
    content: string;//Array<ChartConfig>
    corpId: string;
    uuid: string;
  }>;
  corpId: string;
  global: ChartGlobal;
  objectId: string;
  title: string;
}

export interface ReportSettledResult {
  alias: null | unknown;
  originDatas: null | unknown;
  series: Array<{ [key: string]: string }>;
  source: null | unknown;
  tableHeaders: null | unknown;
  total: null | unknown;
}

export interface ReportConfigValue {
  appCode: string;
  code: string;
  createdBy: string;
  createdTime: string;
  deleted: boolean;
  folderList: string;
  icon: string;
  id: string;
  mobileAble: boolean;
  modifiedBy: string;
  modifiedTime: string;
  name: string;
  name_i18n: string;
  pcAble: boolean;
  remarks: string;
  reportObjectId: string;
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

export interface QualityTable {
  checked: boolean;
  appCode: string;
  attachments: Array<QualityAttachment>
  childs: Array<QualityTable>;
  datas?: Array<BizSheet>
  id: string;
  ids: Array<string>;
  jbs: Array<any>;
  jbsCode: string;
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
  progressState: string | number;
  projectName: string;
  qbsCode: string;
  qbsName: string;
  root: boolean;
  status: number | string;
  doingNum: number,
  doneNum: number,
  totalNum: number,
  done: boolean | null,
  modelType: null | string,
  levelOption?: {
    key: number,
    value: number,
    text: string
  }[]
}

//quality V2
export interface MBSTable {
  checked?: boolean;
  leaf?: boolean;
  alertEndTime: string;
  alertStartTime: string;
  bimQuantity: string;
  bsCode: string;
  checkStatus: boolean;
  childCount: number;
  children: Array<MBSTable>,
  cmClass: string;
  cmCode: string;
  cmCollection: string;
  cmDatasource: string;
  cmId: string;
  codeSort: number;
  codeType: string;
  codeValue: string;
  constractPrice: number;
  constructionOrg: string;
  constructionStatus: string;
  contractQuantity: number;
  costListId: string;
  costListType: string;
  createddeptid: string;
  createdtime: string;
  creater: string;
  dwgQuantity: string;
  id: string;
  mark: boolean;
  meterQuantity: string;
  meterRemark: string;
  meterStatus: string;
  modifiedtime: string;
  modifier: string;
  name: string;
  owner: string;
  ownerdeptid: string;
  ownerdeptquerycode: string;
  parentId: string;
  payMoney: number;
  payStatus: string;
  planDuration: number;
  planEndTime: string;
  planStartTime: string;
  preTask: string;
  price: number;
  projectId: string;
  qbsCode: string;
  realDuration: number;
  realEndTime: string;
  realStartTime: string;
  safeStatus: string;
  sequenceno: string;
  sequencestatus: string;
  taskName: string;
  unit: string;
  workflowinstanceid: string;
  simplifiedCodeValue: string,
  bindQbsFlag: string;
}

//qbs log
export interface QBSLog {
  hits: QBSLogHits[],
  nextPage: number,
  pageNum: number,
  totalHits: number,
  totalPage: number
}

export interface QBSLogHits {
  appCode: string,
  content: string,
  id: string,
  projectName: string,
  type: string,
  userId: string,
  userName: string,
  time: string
}

export interface QualityQBSBiz {
  id: string;
  qbsId: string;
  jbsId: string;
  qbsBizId: string;
  jbsBizId: string;
  bizId: string;
  schemaCode: string;
  sheetCode: string;
  appCode: string;
  bizObjId: string;
  mbsCode: string;
  projectName: string;
  time: string;
  sequenceNo: string;
  userId: string;
  bizAppCode: string;
  status: string;
  qbsCode: string;
  sheetName: string;
  datas: Array<QualityQBSBiz>;
  workFlowCode: string;
  others?: QualityQBSBiz;
}

export interface QualityAttachment {
  downloadUrl: string;
  name: string;
  previewUrl: string;
}

export interface QualityQBS {
  appCode: string;
  bizId: string;
  bizSheetName: string;
  bizObjId?: string,
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

export interface MbsDTO {
  id: string;
  name?: string;
  projectName?: string;
  parentId?: string;
  qbsCode?: string;
  level?: number;
  mbsCode?: string;
  mbsName?: string;
}

export interface bindBizSheetDTO {
  bizSheetName: string;
  projectName: string;
  //recordId:string;
  schemaCode: string;
  sheetCode: string;
  qbsName: string;
  qbsId: string;
  qbsCode: string;
}

export interface JBSBizDTO {
  bizSchemaCodes: Array<string>;
  childs: null | Array<JBSBizDTO>;
  id: string;
  jbsCode: string;
  leaf: boolean;
  level: number;
  levelName: string;
  name: string
  parentId: null | string;
}

export interface ProjectConfig {
  projectName: string | null;
  projectLevel: ProjectLevel | null;
  projectKey: string | null;
  multiProjectFlag: boolean;
  simpleQualityFlag: boolean;
  readonly updateProjectConfig: (n: ProjectConfig["projectName"], l: ProjectConfig["projectLevel"], k: ProjectConfig["projectKey"]) => void;
}

export interface WBSTreeV2 {
  bs: string;
  childCount: number;
  children: Array<WBSTreeV2>;
  codeType: string;
  cumulativeReportRatio: number;
  department: string;
  id: string;
  leaf: boolean;
  planDetailAmount: number;
  planDetailEnd: string;
  planDetailMoney: number;
  planDetailName: string;
  planDetailPeriod: number;
  planDetailStart: string;
  planDetailUnit: string;
  planDetailUnitPrice: number;
  progressState: string;
  remarks: string;
  reportDetailAmount: number;
  reportDetailMoney: number;
  reportEnd: string;
  reportRatio: number;
  reportStart: string;
  reportState: number;
  surplusAmount: number;
  surplusMoney: string;
  ta01CodeFk: string;
  th04aPlandetailFk: string;
  th04aPlanschemeFk: string;
  userName: string;
  warningProportion: number;
  taskNum?: number;
  mbsNum?: number;
}

export interface WBSRecordV2 {
  cumulativeReportRatio: number;
  id: string;
  reportDate: string;
  reportRatio: string;
  reportState: number;
  userName: string;
}

export interface ProgressLogV2 {
  id: string,
  journalAmount: number,
  journalMoney: number,
  ownerDeptName: string,
  ownerName: string,
  projectName: string,
  scheduleDate: string
}

export interface MBSModelNode {
  childCount: number;
  children: null
  codeValue: string;
  createdtime: string;
  id: string;
  leaf: boolean;
  mark: null;
  parentId: string;
  taskName: string;
}

export interface basicInfoItem {
  name: string,
  key: string,
  value: string
}

export interface QueryLayer {
  workitemId?: string,
  workflowInstanceId?: string,
  startWorkflowCode?: string,
  objectId?: string,
  schemaCode?: string,
  sheetCode?: string,
  ssc?: string,
  relevanceInfo?: string,
  return?: string,
  perms?: string,
  tempAuthSheetId?: string,
  tempAuthPropertyCode?: string,
  tempAuthObjectId?: string,
  simulative?: string,
  fieldParam1?: string
}
export interface Attence {
  personName?: string,
  InOrOut?: string,
  InorOutDate?: string,
  place?: string
}

export interface Training {
  personName?: string,
  subjectName?: string,
  type?: string,
  trainingDate?: string,
  trainingHour?: string,
  trainingAttachment?: any
}

export interface AcceptanceCheck {
  acceptDate?: string,
  acceptOpinion?: string,
  qualifiedCertificate?: string,
  checkManufacturer?: string,
  equipmentId?: string,
  equipmentName?: string,
  equipmentSelect?: string,
}

export interface InOrOut {
  personName?: string,
  portal?: string,
  place?: string,
  equipmentId?: string,
  equipmentSelect?: string,
  InOrOutDate?: string,
  InOrOut?: string,
}

export interface Curing {
  maintainDate?: string,
  type?: string,
  content?: string,
  person?: string,
  Money?: string,
  phone?: string,
  equipmentId?: string,
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

interface ObjectIdRes {
  createdTime?: string;
  data?: any;
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


export interface SystemTree {
  leaf: boolean;
  appCode: string;
  bindType: number;
  bizSchemaCode: string;
  children: Array<SystemTree>;
  code: string;
  createdBy: string;
  createdTime: string;
  deleted: boolean;
  fieldCode: string;
  icon: null
  id: string;
  jbsCode: null
  jbsId: string;
  jbsName: null
  mobileAble: boolean;
  mobileUrl: null
  modifiedBy: null
  modifiedTime: string;
  moduleCode: string;
  name: string;
  name_i18n: string;
  openMode: null
  parentId: string;
  pcAble: boolean;
  pcUrl: null
  published: null
  remarks: null
  sortKey: number;
  type: string;
}

export interface SheetNode {
  appCode: string;
  base: boolean;
  bizId: string;
  id: string;
  jbsId: string;
  reportId: string;
  schemaCode: string;
  sheetName: string;
  leaf: boolean;
}

export interface SyncSheetNode {
  bindType: number;
  leaf: boolean;
  child: Array<SyncSheetNode>;
  code: string;
  id: string;
  jbsId: string;
  name: string;
  parentId: string;
  type: 'Folder' | 'BizModel';
}

//quality Analyse
export interface AnalyseQualityProject {
  dayCount: number;
  doneCount: number;
  totalCount: number;
  undoCount: number;
  doingCount: number;
}

export interface AnalyseQuality {
  appCode: string;
  childs: Array<AnalyseQuality>;
  // childs: null;
  undoNodes: object
  undoNum: number;
  undoRatio: number;
  doingNodes: object;
  doingNum: number;
  doingRatio: number;
  doneNodes: object;
  doneNum: number;
  doneRatio: number;
  id: string;
  ids: Array<string>;
  jbsCode: string;
  jbsId: string;
  leaf: boolean;
  level: null
  mbsCode: string;
  mbsId: string;
  modelTypeId: string;
  parent: string;
  parentId: string;
  parentName: string;
  progressState: number;
  projectName: string;
  qbsCode: string;
  qbsName: string;
  root: boolean;
  status: number;
  totalNum: number;
}

export interface AnalyseLineData {
  timeCount: Array<{ time: string, num: number }>;
  undoCount: number;
  undoNodes: any;
  doingCount: number;
  doingNodes: any;
  doneCount: number;
  doneNodes: any
}


export interface Attence {
  personName?: string,
  InOrOut?: string,
  InorOutDate?: string,
  place?: string
}

export interface Training {
  planName: string,
  planStatus: number,
  progressPercentage: number,
  beginTime: string,
  endTime: string
}

export interface AcceptanceCheck {
  acceptDate?: string,
  acceptOpinion?: string,
  qualifiedCertificate?: string,
  checkManufacturer?: string,
  equipmentId?: string,
  equipmentName?: string,
  equipmentSelect?: string,
}

export interface InOrOut {
  personName?: string,
  portal?: string,
  place?: string,
  equipmentId?: string,
  equipmentSelect?: string,
  InOrOutDate?: string,
  InOrOut?: string,
}

export interface Curing {
  maintainDate?: string,
  type?: string,
  content?: string,
  person?: string,
  Money?: string,
  phone?: string,
  equipmentId?: string,
}

export interface basicInfoItem {
  name: string,
  key: string,
  value: string
}

export interface QueryLayer {
  workitemId?: string,
  workflowInstanceId?: string,
  startWorkflowCode?: string,
  objectId?: string,
  schemaCode?: string,
  sheetCode?: string,
  ssc?: string,
  relevanceInfo?: string,
  return?: string,
  perms?: string,
  tempAuthSheetId?: string,
  tempAuthPropertyCode?: string,
  tempAuthObjectId?: string,
  simulative?: string,
}

export interface QueryObjectId {
  filters: Array<ObjectIdQuery>,
  mobile: boolean; //0
  page: number; //0
  queryCode: string; //CH_model_config
  schemaCode: string; //CH_model_confg
  size: number; //0
  customized?: boolean;
  //res
  content?: Array<ObjectIdRes>,
  totalElements?: number
}

export interface ObjectIdQuery {
  propertyCode: string;
  propertyType: number;
  propertyValue: string;
  propertyValueName: string;
}

interface ObjectIdRes {
  createdTime?: string;
  data?: any;
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

export interface QualityEnum {
  fields: Array<{ fieldCode: string; jbsCode: string; name: string; name_zh: string }>;
  geos: Array<{ geoCode: string; name: string; name_zh: string }>;
  modules: Array<{ moduleCode: string; name: string; name_zh: string }>;
}

export interface QualityEnumInstance {
  Industry: { [key: string]: string } | null;
  Geo: { [key: string]: string } | null;
}

export interface ModelFIllWBSTreeNode {
  listId?: string;
  selectId?: string;
  childCount?: number;
  children?: Array<ModelFIllWBSTreeNode>,
  codeValue: string;
  createdtime?: string;
  id: string;
  leaf?: boolean;
  mark?: boolean;
  parentId?: string;
  taskName: string;
  checked?: boolean;
}

export interface ModelSelect {
  id?: string;
  modelCode: string;
  modelCodeId: string;
  name: string;
  selectId?: string;
}

export interface MyFillList {
  appCode: string;
  id: string;
  name: string;
  projectName: string;
  userId: string;
}

export interface FillListDetail {
  id: string;
  modelCode: string;
  modelCodeId: string;
  name: string;
  selectId: string;
}

export interface ModelFillInfoPayment {
  cbsIds: Array<string>;
  cbsMbsIds: Array<string>;
}

export interface ModelFillInfoProgress {
  wbsIds: Array<string>;
  wbsMbsIds: Array<string>;
}

export interface ModelCodeDetail {
  modelCode: string;
  modelCodeId: string;
  name: string
}

export interface ModelFillInfoQuality {
  id: string;
  projectName: string;
  appCode: string;
  schemaCode: string;
  bizId: string;
  qbsId: string;
  jbsId: string;
  bizAppCode: string;
  qbsCode: string;
  sheetName: string;
  datas: Array<any> | null;
  status: number;
  qbs: Array<any>;
  workFlowCode: string | null;
  mbsIds: Array<string>;
  completeFraction: string,
  dataSizes: number | null,
  dataStatus: number | null
}

export interface ModelFillInfo {
  appCode: string;
  paymentData: ModelFillInfoPayment;
  progressData: ModelFillInfoProgress;
  projectName: string;
  qualityControlData: ModelFillInfoQuality;
  saftyData: ModelFillInfoQuality;
  qualityData: {
    qbsBizs: Array<ModelFillInfoQuality> | null
  }
}
export interface MountQBSTable {
  codeValue: string;
  taskName: string;
  modelTypeId: string;
  level: number;
  childs: MountQBSTable[]
}

export interface SearchNode {
  searchKey: string;
  startTime: string;
  endTime: string;
  loading: boolean;
  total: number | string;
  pageSize: number;
  currentPage: number;
  activeStatusType: number;
  activeSearchType: number;
  dataSource: SearchList[]
}

export interface SearchNodeRes {
  datas: SearchList[];
  doingHits: number;
  doneHits: number;
  menuHits: number;
  tableHits: number;
  totalHits: number;
  pageNum: number;
  nextPage: number;
  totalPage: number;
  overWindowFlag: boolean;
}

export interface SearchList {
  id: string;
  appCode: string;
  schemaCode: string;
  objectId: string;
  name: string;
  creator: string;
  createTime: string;
  type: number; //0-菜单；1-表单
  menuType: number; //3-自定义页面；4-报表；2-表单  -- 1-自定义目录
  menuName: string, //菜单名称-数据标题
  parentId: string;
  status: number;//1-进行中；3-已完成  --  0-草稿；2-已取消；4-已作废
  path: string;//菜单路径
  pcAble: boolean;
  mobileAble: boolean;
  openMode: number;//打开方式：0-iframe;1-vue;2-blank
  pcUrl: string;
  mobileUrl: string;
}

export interface AttendanceStatistic {
  company: string,
  in: number,
  present: number,
  total: number
}

export interface AttendanceStatisticTotal {
  total: AttendanceStatistic,
  childs: AttendanceStatistic[]
}

export interface CompanyAttendanceStatistic {
  attendances: BaseStatistic[],
  axis: BaseStatistic[],
  workTypes: BaseStatistic[],
}

export interface BaseStatistic {
  key: string,
  value: number
}

export interface UserStatistic {
  users: UserStatisticItem[],
}

export interface UserStatisticItem {
  id: string,
  attendances: {
    id: string,
    inOrOut: string,
    temperature: string,
    time: string,
    currentDayFlag: boolean,
    imgUrl: string
  }[],
  company: string,
  dayDuration: string,
  monthDuration: string,
  username: string,
  weekDuration: string,
  workType: string
}
export interface PlatformConfigPlan {
  id: string;
  moduleSelect: string;
  planName: string;
  relatePerson: string
}

export interface ProjectMomentRecord {
  businessSegments: string;
  canDelete: boolean;
  commentList: ProjectComment[];
  dataUrl: string;
  date: string;
  dynamicContent: string;
  hasLike: string;
  id: string;
  imageList: any[];
  likeList: DoLike[];
  position: PersonLocation[];
  projectName: string;
  userInfo: ProjectCommentPerson;
  videoList: any[]
}
export interface ProjectComment {
  beCommentPerson: ProjectCommentPerson;
  canDelete: boolean;
  commentContent: string;
  commentPerson: ProjectCommentPerson;
  createdTime: string;
  id: string;
}

export interface ProjectCommentPerson {
  department
}
export interface DoLike {
  createdTime: string;
  id: string;
  personId: string;
  personName: string;
  projectMomentId: string;
  projectName: string
}
export interface PersonLocation {
  adcode: string;
  address: string;
  cityAdcode: string;
  cityName: string;
  districtAdcode: string;
  districtName: string;
  lat: string;
  lng: string;
  provinceAdcode: string;
  provinceName: string;
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
export interface UrlDetail {
  sheetCode?: string;
  objectId?: string;
  schemaCode?: string;
  isWorkFlow?: string | boolean,
  return?: string;
  workflowInstanceId?: string
}


export interface QingShiBasicData {
  APIAuth: boolean,
  AckTimeout: number,
  AllowStreamStartByURL: boolean,
  BlackIPList: string,
  BlackUAList: string,
  DevicePassword: number,
  DropChannelType: string,
  GlobalChannelAudio: boolean,
  GlobalChannelShared: boolean,
  GlobalDeviceAlarmSubscribeInterval: number,
  GlobalDeviceCatalogSubscribeInterval: number,
  GlobalDevicePositionSubscribeInterval: number,
  HTTPSCertFile: string,
  HTTPSKeyFile: string,
  HTTPSPort: number,
  Host: string,
  KeepaliveTimeout: number,
  Port: number,
  PreferStreamFmt: string,
  Realm: number,
  SIPLog: boolean,
  Serial: number,
  TimeServer: string
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
  manufacturer: string | null,
  ondemand: number,
  parentId: string,
  projectName: string,
  shared: number,
  sortKey: number,
  symbolId: string,
  snapUrl?: string,
  videoUrl: string | null,
  token: string | null,
}
export interface DefineTypes {
  text: string,
  key: number,
  value: number,
  isShow?: boolean,
  field?: string,
  dw?: string,
  img?: string,
  options?: any[],
  selected?: string,
  type?: string,
  disabled?: boolean;
  showSearch?: boolean
}


export interface DevicePosition {
  nodes: DevicePositionNodes[];
  types: {
    desc: string;
    type: string;
  }[];
  backImageUrl: string;
  markAuth: boolean;
}
export interface DevicePositionNodes {
  id: string;
  marked: boolean;
  type: string;//AI-AI识别/CAR-车辆抓拍/DISCHARGE-卸料平台/EDGEPROTECT-临边防护/ELECSAFTY-用电安全/ELECMETER-智能电表/NUTRISK-预警螺母/WATERMETER-智能水表
  height: number;
  width: number;
  appCode: string;
  projectName: string;
  desc: string;
  deviceCode: string;
  deviceName: string;
  devicePosition: string;
}
export interface AIRecognitionnNodes {
  alarmNum: number;
  personNum: number;
  alarmTypes: {
    type: string;
    ratio: string;
    num: number;
  }[];
  dates: string[];
  nums: number[];
  details: {
    key: string,
    value: AIRecognitionnNodesDetails[]
  }[]
}
export interface AIRecognitionnNodesDetails {
  deviceName: string;
  type: string;
  num: number;
  time: string;
  imgUrl: string;
}

export interface CarNodes {
  totalNum: number;
  alarmNum: number;
  alarmTypes: TypesItem[];
  dates: string[];//yyyy-MM-dd
  dateTotalNums: number[];
  dateTotalAlarmNums: number[];
  times: string[];//HH:mm:ss
  timeTotalNums: number[];
  timeTotalAlarmNums: number[];
  details: {
    key: string;
    value: CarNodesDetails[]
  }[]
}

export interface CarNodesDetails {
  inTime: string;
  outTime: string;
  carPlate: string;
  carPlateColor: string;
  deviceSn: string;
  type: string;
  imgUrl: string;
}

export interface EdgeProtectData {
  deviceTotal?: DefineTypes[];
  totalNum?: number;
  onlineNum?: string;
  alarmNum?: string;
  types: TypesItem[];
  details: DeviceHistory[]
}

export interface TypesItem {
  type: string;
  ratio: string;
  num: number;
}

export interface WaterMeterInfo {
  total: number;
  today: number;
  dates: string[];
  time: string;
  watermeters: number[];
  historys: DeviceHistory[]
}

export interface DeviceHistory {
  time: string;
  deviceName: string;
  deviceSn: string;
  total: string;
}

export interface ElecSaftyInfo {
  elecTotal?: DefineTypes[];
  historys: ElecSaftyHistory[];
  latest: ElecSaftyHistory
}

export interface ElecSaftyHistory {
  ampere: number;
  deviceName: string;
  deviceSn: string;
  frequency: number;
  temperature: number;
  time: string;
  voltage: number;
}

export interface ElecMeterInfo {
  total: number;
  today: number;
  dates: string[];
  elecmeters: number[];
  time: string;
  historys: DeviceHistory[]
}

export interface DischargeDataInfo {
  dischargeTotal?: DefineTypes[];
  historys: DischargeHistory[];
  latest: DischargeHistory
}
export interface DischargeHistory {
  deviceName: string;
  deviceSn: string;
  limitWeight: number;
  overWeightPercentage: number;
  positiveAngle: number;
  sideAngle: string;
  time: string;
  totalAlarmNum: number;
  totalWeight: number;
  totalWorkNum: number;
}

export interface MaterialReserveSchema {
  payTypes: string[];
  quitSchemaCode: string;
  quitworkflowCode: string;
  saveSchemaCode: string;
  saveWorkflowCode: string;
}

//标准类库 -start
export interface CriterionPageParams {
  keyWords: string;
  pageNum: number;
  pageSize: number;
  loading?: boolean;
}

export interface StandardClass {
  id: string;
  index: string;
  criterionName: string;
  area: string;
  industryCategory: string;
  updateTime: string;
  isUsing: boolean;
  state: number;
}

export interface Record<T> {
  current: number;
  hitCount: number;
  pages: number;
  records: T[];
  searchCount: number;
  size: number;
  total: number;
  editable?: boolean;
}

export interface BaseOptionType {
  value?: string | number;
  title?: any;
  label?: any;
  key?: string;
  children?: BaseOptionType[];
}
export interface ClassLibraryTree {
  id: string;
  code: string;
  name: string;
  parentId: string;
  // properties: ClassLibraryTreeProperties[];
  childs: ClassLibraryTree[];
  editable?: boolean

}
export interface ClassLibraryTreeProperties {
  id: string;
  classLibraryId: string;
  deliveryLevel: string;//必要信息,可选信息
  englishName: string;
  isDefault: number;
  // name: string;
  propertyName: string;
  type: string;//字符,数值
  // stage: string;
  stageId: string;
  stageName: string;
  unit: string;
  isEdit: boolean
  editable?: boolean;
}

export interface RelationModelPage {
  id: string;
  classLibraryId: string;
  codeName: string;
  codeValue: string;
  index: number;
  projectName: string;
}

export interface CodeTree {
  id: string;
  childCount: number;
  codeType: string;
  codeValue: string;
  hasChild: boolean;
  isRelated: boolean;
  parentId: string;
  taskName: string;
  children: CodeTree[];
  classLibraryName: string;
  checked?: boolean
}

export interface AddModelRelationsParams {
  codeValue: string;
  codeName: string;
}

export interface ClassLibraryModelProperty {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyContent: string;
  // propertyStage: string;
  propertyStageId: string;
  propertyStageName: string;
  propertyType: string;
  attachments: ModelPropertyAttachment[];
  resetAttachments?: any[]
}

export interface ModelPropertyAttachment {
  base64ImageStr: string;
  createdBy: string;
  createdTime: string;
  deleted: boolean;
  fileExtension: string;
  fileSize: number;
  id: string;
  mimeType: string;
  modifiedBy: string;
  modifiedTime: string;
  name: string;
  refId: string;
  remarks: string;
  schemaCode: string;
}

export interface ModelImgs {
  id: string;
  codeName: string;
  codeValue: string;
  projectName: string;
  // schemaCode: string;
  // urls: string[]
  attachments: ModelPropertyAttachment[]
}
//标准类库-end

export interface ButtonDetail {
  analysisColumn: string;
  codeType: string;
  componentCode: string;
  departmentSelect: string | null;
  icon: string | null;
  id: string;
  parentTabName: string;
  projectBelong: string;
  projectSelect: string;
  tabCode: string;
  tabLevel: number;
  tabName: string;
  tabSort: number;
  rdpReport?: string | null;
  reportCode?: string | null;
}


export interface BimCardMenu extends initCardRes {
  moduleVersion: string;
}

export interface BimModelAttribute extends ClassLibraryModelProperty {
  codeName: string;
  codeValue: string;
}


export interface DeviceInfo {
  id: string;
  deviceSn: string;
  deviceName: string;
  deviceState: string;
  deviceTypeId: string;
  deviceType: string;
  deviceTypeCode: string;
  deviceDesc: string;
  registerDate: string;
  manager: string;
  industry: string;
  birth: string;
  appCode: string;
  projectName: string;
  lastMaintainDate: string;
  lastCheckTime: string;
  qrCodeUrl: string;
  project: string;
  projectCompleteName: string;
  producer: string;
  phone: string;
  pics: any[]
}

export interface DeviceInfoSummaryInfo {
  records: string;
  list: DeviceInfoSummaryItem[]
}

export interface DeviceInfoSummaryItem {
  id: string;
  dateTime: string;
  month: string;
  deviceState: string;
  name: string;
  schemaModelName: string;
  url: string;
  userName: string;
}

export interface AttendanceRecordInfo {
  checker: string;
  checkerOpinion: string;
  creater: string;
  id: string;
  inOrOut: string;
  inOrOutDate: string;
  manager: string;
  pics: AttendanceRecordPic[];
  registerDate: string;
  sequenceNo: string;
}

export interface AttendanceRecordPic {
  name: string;
  url: string;
}

export interface DeviceFilterInfo {
  name: string;
  time: string;
  value: any
}

export interface UsedRecordInfo {
  auditResult: string;
  createdTime: string;
  creater: string;
  endDate: string;
  id: string;
  manager: string;
  purpose: string;
  sequenceNo: string;
  startDate: string;
}

export interface DeviceInspectPlans {
  checkEndDate: string;
  checkItemsNum: string;
  checkStartDate: string;
  checkStatus: string;
  checker: string;
  id: string;
  num: string;
  period: string;
  planName: string;
  planType: string;
}

export interface DeviceInspectTasks {
  checkItemsNum: string;
  checker: string;
  id: string;
  inspectCode: string;
  planName: string;
  sequenceNo: string;
  pics: Pics[];
  repair: Repair
}

export interface Pics {
  name: string;
  url: string;
}

export interface Repair {
  displayName: string;
  id: string;
  schemaCode: string;
  sequenceStatus: string;
}

export interface DeviceMaintainTasks {
  deviceName: string;
  id: string;
  maintainDate: string;
  maintainDesc: string;
  maintainer: string;
  planName: string;
  sequenceNo: string;
  spareParts: Repair;
  pics: Pics[];
  repair: Repair;
}

export interface DeviceMaintainPlans {
  id: string;
  lastMaintainDate: string;
  maintainDesc: string;
  maintainFreq: string;
  maintainLevel: string;
  maintainNum: string;
  maintainer: string;
  nextMaintainDate: string;
  planName: string;
}

export interface DeviceTransferTasks {
  auditOpinion: string;
  deviceMajor: string;
  id: string;
  manager: string;
  newManager: string;
  sequenceNo: string;
  transferDate: string;
  transferReason: string;
}

export interface DeviceRepairTasks {
  creater: string;
  id: string;
  pics: Pics[];
  scrap: Repair;
  repairDesc: string;
  repairTime: string;
  repairor: string;
  scrapDesc: string;
  sequenceNo: string;
  sourceType: string;
  inspectPlanName: string;
  maintainPlanName: string;
}

export interface DeviceScrapTasks {
  creater: string;
  id: string;
  scrapDate: string;
  scrapReason: string;
  sequenceNo: string;
  pics: Pics[]
}

export interface HomePageStatistics {
  productionTaskCount: number;
  workOutlineCount: number;
  professionTaskCount: number;
  designTaskCount: number;
}

export interface WorkOutlineTemplate {
  bussiness: string;
  downloadUrl: string;
  fileName: string;
  id: string;
  previewUrl: string;
  projectType: string;
}

export interface WorkOutlineModel {
  id: string;
  editorUrl: string;
  refId: string;
  workOutline: string;
  //新增  筛选条件
  fileType: string;
  bussiness: string;
  projectType: string;
  projectState: string;
  professionType: string;
  defaultTitle?: string;
  fileName?: string; //用于保存
  tmpFileName?: string //用于删除
}

export interface WorkOutlineContentItemRule {
  bussinesses: string[];
  fileTypes: string[];
  professionTypes: string[];
  projectStates: string[];
  projectTypes: DeviceFilterInfo[]
}

export interface WorkOutlineSourceList {
  id: string;
  title: string;
  bussiness: string;
  projectType: string;
  fileType: string;
  professionType: string;
  projectState: string;
  paragraph: string;
  attachmentName: string;
  childNum: number;
  createdTime: string;
  creator: string;
  downloadUrl: string;
  fileName: string;
  parentFlag: boolean;
  previewUrl: string;
  refId: string;
  province: string;
}

export interface AddDigitalDeliveryParam {
  operator: string,
  operatorName: string,
  projectName: string,
  projectId: string,
  account: string,
  password: string,
  loginFlag: string,
  effectiveFlag: string,
  achievementAmount: string,
  effectiveTime: string,
  expiredTime: string,
  designFileId: string
}

export interface AchievementModel {
  id: string;
  attachmentName: string;
  avaliable: boolean;
  bussiness: string;
  projectType: string;
  createdTime: string;
  creator: string;
  downloadUrl: string;
  fileName: string;
  previewUrl: string;
  professionType: string;
  projectState: string;
  refId: string;
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
  engineProjectId: string;
  engineModelId: string;
  engineFileName: string;
}

export interface ApprovalPermissionRes {
  projectId: string;
  objectId: string;
  schemaCode: string;
  sheetCode: string;
  permit: boolean
}

export interface ApprovalRes {
  typeId: any;
  business: string;
  projectType: string;
  projectState: string;
  XTSJ_approval_instance: any[]
}

export interface ApprovalRow {
  essential: string;
  selected: string;
  description: string;
  itemType: string;
  fzcx: any;
  id?: string;
}

export interface RelevanceConditions extends ObjectIdQuery {
  label: string;
  options: any
}
export interface WorkOutlineChapter {
  id: string;
  sortNum: number;
  attach: YunAttachmentFile[];
  title: string;
}

export interface EDMPProject {
  projectId: string;
  projectUNID: string;
  projectName: string;
  projectlocation: string;
  constructionPhase: string;
  serviceType: string;
  projectCategory: string;
  // countryOfProject: string;
  // provinceOfProject: string;
  // cityOfProject: string;
  // engineeringType: string;
  industryType: string;
  projectType: string;
  year: string;
  accessToken?: string
}

export interface ModelTypeConfig {
  modelType: string;
  tableCode: string;
  propertyCode: string;
  appearance: string
}

export interface ProjectConditionItem {
  location: string[];
  industryType: string[];
  year: string[];
  departments: string[];
  states: string[]
}

export interface CenterFiles {
  editFlag: boolean;
  operator: string;
  path: string;
  time: string
}

export interface QualificationConfig {
  schemaCode: string;
  param: string;
  majors: string[];
  jobs: string[];
  certifications: string[];
}

export interface StandardTemplate {
  type: string;
  taskType: string;
  profession: string;
}

export interface StandardTemplateRes {
  previewUrl: string;
  downloadUrl: string;
  attachmentName: string;
  refId: string;
  type: string;
  taskType: string;
  profession: string;

}

export interface DesignPersonGroup {
  project_major: string;
  userName?: string;
  official_manager: PersonItem[];
  plan_begin_time: string;
  plan_end_time: string;
  plan_duration: string;
  offical_outline: string
}
//云枢-人员/部门
export interface PersonItem {
  id: string;
  name: string;
  type: string;
}

export interface ChiefOpinion {
  id: string;
  workoutlineId: string;
  createdTime: string;
  userId: string;
  userName: string;
  opinion: string;
  signFlag: string;
  signers: string[];
  unsigners: string[];
  type: string;
  title: string;
}
export interface ModelAttachment {
  id: string;
  createdTime: string;
  creater: string;
  lightweightAddress: string;
  modelId: string;
  name: string;
  refId: string;
  status: string;
  vaultId: string;
  url: string;
}
export interface UserConfig {
  clientId: string;
  themeType: string;
}
export interface Projects {
  id: string;
  taskName: string;
  professions: Professions[]
}
export interface Professions {
  profession: string;
  outlinePreviewUrl: string;
  outlineExist: boolean;
  outlineDownloadUrl: string;
  designTasks: DesignTasks[]
}
export interface DesignTasks {
  id: string;
  state: string;
  taskName: string
}
export interface DesignTask {
  id: string;
  state: '待接收' | '设计中' | '提交中' | '';
  taskName: string;
  achievements: Achievement[];
  isDesigner: boolean;
  designer: string;
  designerName: string;
}
export interface Achievement {
  id: string;
  type: 'dwg' | 'rvt' | '';
  refId: string;
  path: string;
  fileName: string;
  lightStates: string;
  comments: Comments[];
  expand?: boolean;
}
export interface Comments {
  id: string;
  title: string;
  comment: string;
  capturePicUrl: string;
  bimUrl: string;
  auditor: string;
  auditTime: string;
}
export interface Achievements {
  id: string;//设计成果文件表id
  taskId: string;
  files: AchievementFile[]
}
export interface AchievementFile {
  downloadUrl: string;
  featureExtension: string;
  fileName: string;
  fileType: string;
  id: string;
  lightweightUrl: string;
  parentId: string;
  path: string;
  previewUrl: string;
  refId: string;
  status: string;
  uploadTime: string;
  workload: string;
  sequenceStatus: string;
  sjrwdId: string;
  schemaCode: string;
  fileSize: string;
  mergeAttachment: YunAttachmentFile;
  spinFlag?: boolean
}
export interface Annotation {
  title: string;
  id: string;
  annotationProps: string;
  checkTime: string;
  checkor: string;
  checkorId: string;
  desc: string;
  designFileId: string;
  featureExtension: string;
  imgUrl: string;
  refId: string;
  layerId: string;
  lightweightUrl: string;
  position: any;
  target: string;
}
export interface ProjectListConditions {
  appCode: string;
  year: string[];
  location: string[];
  industryType: string[];
  departments: string[];
  states: string[];
  lotus: boolean | null;
  engineeringName: string;
  pageNum: number;
  pageSize: number;
  condition: boolean;
}
export interface ReviewList {
  id: string;
  engineeringNumber: string;
  engineeringName: string;
  engineeringStage: string;
  reviewType: string;
  creater: string;
  createrTime: string;
  processState: string;
  workflowInstanceId: string;
  workitemId: string;
}
export interface DesignAchievementsTree {
  profession: string;
  professioner: string;
  types: AchievementTypes[]
}
export interface AchievementTypes {
  designType: string;
  tasks: TaskType[];
}
export interface TaskType {
  designer: string;
  fileTime: string;
  taskName: string;
  taskNo: string;
  files: AchievementFile[];
  taskId: string
}
export interface AchievementFile {
  downloadUrl: string;
  fileName: string;
  fileType: string;
  id: string;
  previewUrl: string;
  refId: string
}
export interface TableConfiguration<T> {
  rowKey: string;
  loading: boolean;
  dataSource: T;
  columns: TableColumn<any>[];
  tabKey?: number;
  pagination?: PaginationClass | false;
  defaultExpandKeys?: string[];
  defaultExpandAllRows?: boolean
}
export interface PaginationClass {
  current: number;
  pageSize: number;
  showQuickJumper: true;
  total: number;
  showTotal: (total: number, range) => string, onChange: (page: number, pageSize: number) => void
}

export interface CommentItem {
  id: string;
  engineeringName: string;
  workflowName: string;
  projectManager: string;
  activityName: string;
  startTime: string;
  pendingType: string;
  projectId: string;
  extendId: string;
  workflowCode: string;
}
export interface ToDoWorksItem extends CommentItem {
}
export interface DoneWorksItem extends CommentItem {
  participantName: string
}
export interface DoingWorksItem extends CommentItem {
  participantName
}
export interface WorkItemsNumber {
  projectNumber: number;
  outlinesNumber: number;
  professionTaskNumber: number;
  professionOutlineNumber: number;
  designTaskNumber: number;
  externalMaterialNumber: number;
  designReviewName: number;
  technicalSchemeName: number;
  allTaskName: number;
}
export interface HomeTaskQuery extends HomeBaseTaskQuery {
  type: string;//allTask urgencyTask  xmlb   xmsqb  zyrwd    zysjtg  sjrwd  wlzl
}
export interface HomeBaseTaskQuery {
  appCode: string;
  pageNum: number;
  pageSize: number;
  searchName: string;
  activityName: string;
}
export interface WorkItemsNumber {
  appCode: string;
  pageNum: number;
  pageSize: number;
}
export interface ProjectTreeTable {
  id: string;
  dynamicColumnType: number;
  dynamicColumn: string;
  isLeafNode: boolean;
  count: number;
  glid: string;
  engineeringStage: string;
  projectManager: string;
  manufactureStatus: string;
  manufacturer: string;
  currentHandler: string;
  planStartTime: string;
  planEndTime: string;
  planDuration: string;
  notesURL: string;
  industryType: string;
  workflowInstanceId: string;
  dynamicColumnList: ProjectTreeTable[]
}

// 任务
export interface ProjectTaskList {
  id: string;
  lastParticipant: string;
  lastParticipantName: string;
  startTime: string;
  taskName: string;
  taskNumber: string
  urgentFlag: boolean;
  usedTime: number;
  activityCode?: string;
  bizType?: number;
  bizId?: string
}

export interface TaskSort {
  activityCode?: string;
  bizType?: number;
  bizId?: string
}

export interface ProjectTaskType {
  id: string;
  engineeringName: string;
  productionNumber: string;
  clientTaskList: ProjectTaskList[]
}

// 项目
export interface ProjectList {
  id: string;
  engineeringName: string;
  projectManager: string;
  year: string;
  engineeringStage: string;
  engineeringLocation: string;
  productionNumber?: number | any;
  // 生成任务单编号 类型：string
  //  productionNumber?: number | string;
  clientTaskList?: any;
  // 项目下的设计任务 类型 array
  // clientTaskList?: ProjectList[];
  // 专业任务单 类型：array
  // clientProfessionTaskList?: ProjectList[]
  clientProfessionTaskList?: any
}

// 路由菜单
export interface RouteMenuChild {
  path: string;
  name: string;
  icon?: string;
}
export interface RouteMenu {
  path: string;
  name: string;
  icon?: string;
  children?: RouteMenuChild[]
}