import {listApi, listParams} from '@cloudpivot/api';
import {HttpResponse} from "@cloudpivot/api/src/response";

export interface masterAppMenu {
  agentId: number | string;
  appKey: number | string;
  appSecret: string;
  children: null | Array<EachAppMenu>;
  code: string;
  content: null | string;
  createdBy: string | null;
  createdTime: string | null;
  deleted: boolean;
  enabled: boolean;
  id: string;
  logoUrl: string;
  logoUrlId: number | string;
  modifiedBy: string | null;
  modifiedTime: string | null;
  name: string;
  name_i18n: string;
  remarks: null;
  sortKey: number;
  type?: string;
  icon?: string | null;
}

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

export interface AppMenu extends Partial<EachAppMenu>, Partial<masterAppMenu> {

}


interface settledTarget {
  appCode: string;
  response: HttpResponse<Array<EachAppMenu>>
}

const generateAppsMenu: (isMobile?: boolean, isPortal?: boolean, isFlatMenu?: boolean,projectCode?:string,appCode?:string) => Promise<Map<string | number, masterAppMenu>> = async (isMobile, isPortal, isFlatMenu,projectCode,appCode) => {
  if(!projectCode){
    return new Promise<Map<string | number, masterAppMenu>>(async (resolve, reject) => {
      const res: HttpResponse<Array<masterAppMenu>> = await listApi.list({
        isMobile: isMobile || false,
        isPortal: isPortal || false
      });
      const firstLevelMap: Map<string | number, masterAppMenu> = new Map();
      const appsPromise: Array<Promise<settledTarget>> = [];
      if (res.errcode === 0) {
        res.data?.forEach((item) => {
          firstLevelMap.set(item.code, item);
          if (isFlatMenu) return;
          if(appCode && item.code!==appCode) {
            return;
          }
          appsPromise.push(
            new Promise<settledTarget>((resolve1, reject1) => {
              listApi.getFolder({
                appCode: item.code,
                isMobile: isMobile || false
              }).then((folderRes) => {
                if (folderRes.errcode === 0) {
                  resolve1({
                    appCode: item.code,
                    response: folderRes
                  })
                } else {
                  reject('error')
                }
              })
            }));
        });
        if (isFlatMenu) resolve(firstLevelMap);
        Promise.allSettled(appsPromise).then((settledRes) => {
          settledRes.forEach((item) => {
            if (item.status !== "rejected") {
              const firstLevel = firstLevelMap.get(item.value.appCode);
              if (firstLevel && item.value.response.data) {
                firstLevel.type = 'Folder';
                firstLevel.children = item.value.response.data;
              }
            }
          });
          resolve(firstLevelMap);
        })
      } else {
        reject('netWork error!');
      }
    })
  }else{
    return new Promise<Map<string|number,masterAppMenu>>((resolve, reject) => {
      listApi.getFolder({
        appCode:projectCode,
        isMobile:isMobile||false
      }).then((folderRes)=>{
        if (folderRes.errcode === 0) {
          resolve(new Map([
            [projectCode,folderRes.data]
          ]))
        } else {
          reject('error')
        }
      })
    })
  }


}


export default generateAppsMenu;
