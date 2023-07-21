import { CAProviderAuthEnum } from "./enum";
// import { ProjectController } from "./Project/decorator";

export interface EachAppMenu {
    appCode: string;
    children: null | Array<EachAppMenu>
    code: string;
    createdBy: string | null;
    createdTime: string | null;
    deleted: boolean;
    icon: string | null;
    id: string;
    mobileAble: boolean;
    mobileUrl: string | null;
    modifiedBy: string | null;
    modifiedTime: string | null;
    name: string;
    name_i18n: string;
    openMode: null
    parentId: string;
    pcAble: true
    pcUrl: null
    published: null
    remarks: null
    sortKey: number;
    type: string;
}

export interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}

export interface HttpResponse<T> {
    errcode?: number
    errmsg?: string
    data?: T
}

export interface ThemeConfig {
    id: string;
    path: string;
    logo: string;
    background: string;
    title: string;
    port: number;
    portList: Array<number>;
}

export interface ProjectConfig {
    authorized: boolean;
    whiteList: Array<string>;
    project?: string;
    AuthChange?: ( status: CAProviderAuthEnum ) => void;
}

export interface TableColumn<T> {
    title?: string;
    dataIndex?: string;
    align?: string;
    ellipsis?: boolean;
    key?: string;
    customRender?: ( text: string | T, record: T, index: number ) => JSX.Element | Array<JSX.Element>;
    width?: string | number;
    type?: string;
    rowType?: string;
    unit?: string;
    editCmpnt?: string | Function;
    render?: Function;
    treeNode?: boolean;
}

export interface ProjectType {

}