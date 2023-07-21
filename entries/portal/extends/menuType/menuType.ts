export interface MenuItemType {
  appCode: string;
  children: Array<MenuItemType>;
  code: string;
  createdBy: string;
  createdTime: string;
  deleted: boolean;
  icon:string;
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
