export interface FilesMenu {
  key: string,
  name: string,
  childs: FilesMenu [],
  isRelated:boolean,
  parentId:string,
  schemaCode:string,
  scopedSlots:object,
  sort:number,
  type:number,
}

export interface PartCode {
  id: string,
  title: string,
  children: PartCode []
}

export interface DocList {
  createTime: string,
  creator: string,
  index:number,
  modifier: string,
  modifyTime: string,
  objectId: string,
  schemaCode: string,
  sheetCode: string,
  title: string,
  workflowCode: string,
  workflowId: any,
  attachments:any,
}
