export interface BIMModelConfig {
  id?: string,
  name: string,
  parentId: string,
  projects: Array<any>,
  children: null | Array<any>
}

export interface ProjectPro {
  id: string,
  xmmc: string,
  xmjc: string
}

export interface CodeConfig {
  id: string,
  xmmc: string,
  xmjc: string,
  createTime: string
}

export interface ReportConfig {
  id: string,
  page: string,
  bimTab: string,
  bimTabCode: string,
  reportType: string
}

export interface ModelConfig {
  id: string,
  xmjc: string,
  modelName: string,
  appCode: string,
  longtitude: string,
  latitude: string,
  altitude: string,
  height: string,
  localCache: string,
  scenceUrl: string
}

export interface MultiPro {
  id: string,
  name: string,
  parentId: string | null,
  platformFlag: any,
  type: string,
  children: any[],
  editable?: boolean
}

// eslint-disable-next-line no-shadow
export enum AddProjectType {
  group = '集团',
  company = '公司',
  pro = '项目'
}

export interface RefProList {
  id: string,
  xmjc: string,
  xmmc: string
}

export interface bimModal {
  id: string,
  name: string,
  parentId: string | null,
  projects: any[],
  children: any[],
  sort: number
}

export interface ModuleConfig {
  id: string,
  flag?: boolean,
  name: string,
  preId: string | null,
  leftFlag?: boolean,
  rightFlag?: boolean
}

export interface PackageInfo {
  type: string,
  url: string,
  qr: string,
  editable?:boolean
}

export interface DefaultPages {
  id?: string,
  pages: any,
  departments: {
    id: string,
    name: string,
    type: number
  }[],
  plainOptions?: any,
  defaultCheckedValue?: any,
  editable?:boolean
}

export interface LoginInfoT {
  background: string,
  bimUrl: string,
  corpId: string,
  editTime: string,
  host: string,
  id: string,
  logo: string,
  multiProjectFlag: boolean,
  path: string,
  port: number,
  portList: any[],
  simpleQualityFlag: boolean,
  single: boolean,
  title: string
}

export interface Icons {
  iconName: string,
  iconUrl: string,
  id?: string,
  name: string,
  seqNo: string,
  editable?: boolean
}
export interface DicGroups {
  dicName: string;
  userDepths: Depth[]
  users: User[]
}
export interface Dictionary {
  id?:string,
  name: string,
  editable?: boolean,
  userDepths: Depth[],
  users: User[]
}
export interface DictionaryNode {
  id: string,
  name: string,
  parentId: string|null,
  sortCode: number,
  children: DictionaryNode[]
}

export interface Panoramic {
  id: string,
  date: string,
  name: string,
  url: string,
  capturePicUrl: string
}

export interface MonitoringCenterTree {
  id:string,
  name: string,
  type: string,//group/company/upPro/pro
  parentId: string|null,
  projectId: string,
  children: MonitoringCenterTree[],
  projectName?:string,
  slots?: {
    icon: string
  }
}

export interface CameraList {
  id: string,
  appKey: string,
  appSecret: string,
  channelNo: string,
  name: string,
  serialNo: string,
  url: string
}

export interface DataCenterPro {
  id:string,
  names:string,
  type:string,
  flag?: boolean,
  disabled?: boolean,
  childrens?: DataCenterPro[]
}
export interface DataCenterGroups {
  defaultType: string,
  companys: DataCenterPro[],
  groups: DataCenterPro[],
  projects: DataCenterPro[]
}

export interface CenterPro {
  id: string,
  name: string,
  parentId: string,
  platformFlag: any,
  sortKey: string,
  type: string,
  children?: CenterPro[]
}

export interface Rdp {
  id: string,
  tabId: string,
  tabName: string,
  allRdp: {
    name: string | null,
    schemaCode: string | null
  },
  rightRdp: {
    name: string | null,
    schemaCode: string | null
  },
  upRdp: {
    name: string | null,
    schemaCode: string | null
  },
  editable?: boolean,
  isRdp: boolean,
  routing: { name:string,schemaCode:string} | null,
  plainOptions?: any,
  defaultCheckedValue?: any,
}

export interface CenterMenu {
  id?: string,
  name: string,
  parentId: string | null,
  sortCode?: number,
  children: CenterMenu [],
  icon: string| null,
  slots?: any;
  editable?: boolean;
  users: User[],
  deptIds: Depth[]
}

export interface FormItemLayout {
  labelCol: {
    span: number
  },
  wrapperCol: {
    span: number
  }
}

export interface Routes {
  name: string,
  pcUrl: string,
  appCode: string
}

export interface RiskData {
  id?:string,
  period?:number,
  periodType: string,
  type: string,
  users: any[]
}

export interface IconDataType{
  createTime: string;
  creater: string;
  icon: string;
  id: string;
  name: string;
}

export interface Org {
  id: string,
  editFlag: boolean,
  depth: Depth|null,
  users: User[],
  userDepths: Depth[],
  editable?:boolean
}
export interface Depth {
  id: string,
  name: string
}
export interface User {
  id:string,
  employeeNo:string,
  name: string
}

export interface Department {
  id:string,
  name: string,
  editFlag: boolean,
  children: Department[],
  parent:string,
  parentId:string
}

export interface DepartmentUser {
  content:DepUser[],
  size:number,
  totalPages:number,
  totalElements:number
}

export interface DepUser {
  id:string,
  name: string,
  appellation?: string,
  mobile?: string,
  email?:string
}

export interface AddUserRequestParams {
  departmentId: string;
  deptIds: Array<string>;
  roleIds: Array<string>;
  username: string;
  name: string;
  mobile: string;
  officePhone: string;
  email: string;
  employeeNo: string;
  entryDate: string;
  entryTime?: string;
  imgUrl: string;
  imgUrlId: string;
  id?: string;
}
