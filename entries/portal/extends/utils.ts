import {v} from "vxe-table";
import {getFormUrl} from "./service/api";
import onActionClick from "@cloudpivot/list/src/components/pc/scripts/onActionClick";
import env from "@/config/env";
interface UrlParam {
  [propsName: string]: string;
}


class Utils {

  static cnReg = /[\u2E80-\u2EFF\u2F00-\u2FDF\u3000-\u303F\u31C0-\u31EF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FBF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]+/g;

  static deepFind<T>(arrData: Array<T>, condition: (item, i, level) => boolean, children: string) {
    const main: Array<T> = []
    try {
      (function poll(arr, level) {
        if (!Array.isArray(arr)) return
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i]
          main[level] = item
          const isFind = condition && condition(item, i, level) || false
          if (isFind) {
            throw Error
          } else if (children && item[children] && item[children].length) {
            poll(item[children], level + 1)
          } else if (i === arr.length - 1) {
            main.length = main.length - 1
          }
        }
      })(arrData, 0)
    } catch (err) {
    }
    return main
  }

  static GetRequest(): UrlParam {
    const url = decodeURIComponent(window.location.search);
    const theRequest = {} as UrlParam;
    if (url.indexOf("?") != -1) {
      const str = url.substr(1), strs = str.split("&");
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].substring(strs[i].split("=")[0].length+1));
      }
    }
    return theRequest;
  }

  static uuid(): string {
    const s: Array<string | number> = [], hexDigits: string = "0123456789abcdef";
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = parseInt(String(10 * Math.random()), 10);
    s[19] = hexDigits.substr((s[19] as string & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    const uuid = s.join("");
    return s.join("");
  }

  static getFullHeight(Element: CSSStyleDeclaration, unit: string, way: 'add' | 'minus'): number {
    if (!Element || !Element.height) return 0;
    switch (way) {
      case "add":
        return Number(Element.height.split(unit)[0]) +
          Number(Element.marginTop.split(unit)[0]) +
          Number(Element.paddingTop.split(unit)[0]) +
          Number(Element.paddingBottom.split(unit)[0]) +
          Number(Element.marginBottom.split(unit)[0]);
      case "minus":
        return Number(Element.height.split(unit)[0]) -
          Number(Element.paddingTop.split(unit)[0]) -
          Number(Element.paddingBottom.split(unit)[0]);
      default:
        return 0;
    }
  }

  static debounce: (fn, ms: number) => Function = (fn, ms = 500) => {
    let timeoutId;
    return function (...rest) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        //@ts-ignore
        fn.apply(this, rest);
      }, ms);
    };
  }

  static debounceFn: (fn, wait: number) => Function = (fn, wait = 500) => {
    let timeoutId;
    // eslint-disable-next-line no-shadow
    return (v) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        fn(v);
      }, wait)
    }
  }

  static isAmount: (value: string) => false | number = (value) => {
    const reg = /^(([1-9]{1}\d*)|(0{1}))(\.\d{1,5})?$/;
    if (!value || value?.length < 1) return 0;
    if (reg.test(value)) {
      return Number(value);
    } else {
      return false;
    }
  }

  static generateXTableColumns: <T>(columns: Array<T>) => Array<T> = <T>(columns) => {
    if (!columns || !columns.length) return [];
    return columns.map((item, index) => {
      if (!item.type) {
        return {
          title: item.title,
          field: item.dataIndex,
          treeNode: item.treeNode,
          align: item.align,
          slots: item.customRender && {
            default: ({ row }) => [ item.customRender?.(row, row, index) ]
          } || undefined
        }
      } else {
        return {
          type: item.type,
          title: item.title,
          treeNode: item.treeNode,
          width: item.width,
          align: item.align
        };
      }
    });
  }

  static getFnName: (fucName: string) => string = fucName => {
    return fucName.split('bound')[1]?.trim() ?? "";
  }

  static getTreeParentKey: <T>(tree:Array<T>,attChildren:string,key:string,value:string) => string = <T>( tree,attChildren='children',key,value ) =>{
    let parentKey;
    for ( let i = 0; i < tree.length; i++ ) {
      const node = tree[i];
      if ( node[attChildren] ) {
        if ( node[attChildren].some( item => item[key] === value ) ) {
          parentKey = node[key];
        } else {
          if ( Utils.getTreeParentKey(node[attChildren], attChildren,key,value) ) {
            parentKey = Utils.getTreeParentKey(node[attChildren], attChildren,key,value);
          }
        }
      }
    }
    return parentKey;
  }
  //TODO  跳转表单  注意：vm（this）必须包含projectCode
  // @ts-ignore
  static goForm: <T>(vm:any,businessType:'add'|'edit',addFormQuery?:T,isDingTalk: boolean,bizObjectId?:string,schemaCode?:string)=> void = <T>(vm,businessType,addFormQuery,isDingTalk,bizObjectId,schemaCode) => {
    switch (businessType) {
      case "add":
        const routeData = vm.$router.resolve({
          name: 'form-detail',
          query: addFormQuery
        })
        isDingTalk?vm.$router.push(routeData.route.fullPath):window.open(routeData.href,'_blank')
        break;
      case "edit":
        getFormUrl({
          bizObjectId: bizObjectId??'',
          schemaCode: schemaCode??''
        }).then((res) => {
          // 如果报错, 会返回一个对象
          if (typeof res === "object" && res.errcode !== 0) {
            return vm.$message.error(res.errmsg as string, 3);
          }
          // 否则返回一个字符串
          else if (typeof res === "string") {
            let search = location.search;
            search = search
              ? `${search}&iframeAction=detail`
              : `?iframeAction=detail`;
            let url:string = '';
            if(isDingTalk) {
              // @ts-ignore
              const projectLength:number = window.config.project.length;
              // @ts-ignore
              const pathName =  location.pathname.substring(location.pathname.search(window.config.project) + projectLength,location.pathname.length);
              url = `${ res }&return=${ pathName + encodeURIComponent( search )}`;
            }else{
              url = `${ res }&return=${ location.pathname + encodeURIComponent( search )}`;
            }
            if(isDingTalk) {
              vm.$router.push(url)
            }else{
              vm.projectCode = env.project;
              const formUrl = onActionClick.getFormRealUrl(vm, url);
              window.open(formUrl);
            }
          }
        })
        break;
    }
  }
  /**
   * 数组对象根据对象中指定的属性去重
   * @param arr 元素为对象的数组
   * @param u_key 指定属性
   * @returns {[]}
   */
  static unique: <T>(arr:T[],u_key:string) => T[] = <T>(arr,u_key)=> {
    const obj = {};
    const result:T[] = [];
    arr.forEach((item) => {
      const typeof_key = typeof item[u_key] + item[u_key];
      obj[typeof_key] = item;
    });
    for (const key in obj) {
      result.push(obj[key]);
    }
    return result;
  }
  //TODO 简单数组去重  string []、number[]、boolean[]
  static simpleUnique: <T>(arr:T[]) => T[] = <T>(arr)=> {
    const newArr:T[]= [];
    for (let i = 0; i<arr.length; i++){
      if(newArr.indexOf(arr[i])===-1){
        newArr.push(arr[i]);
      }
    }
    return newArr;
  }
  //TODO 下载文件流
  static downloadFile: (type:string, name:string, data:any)=> void = (type, name, data)=> {
    const link = document.createElement("a");
    const blob = new Blob([data]);
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", name.indexOf(type)>-1?name:`${name}.` + type);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  static calcUsedTime(startTime:string):string{
    const now = +new Date();
    const start = +new Date(startTime);
    const timestamp=(now-start)/1000;
    const days = parseInt(timestamp/60/60/24+'');
    const hours = parseInt(timestamp/60/60%24+'');
    const minutes = parseInt(timestamp/60%60+'');
    let str:string="";
    if(days){
      str+=`${days}天`;
    }
    if(hours){
      str+=`${hours}小时`;
    }
    if(minutes){
      str+=`${minutes}分`;
    }
    return str;
  }
}

export default Utils;
