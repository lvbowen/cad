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