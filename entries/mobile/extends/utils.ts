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
    const url = window.location.search;
    const theRequest = {} as UrlParam;
    if (url.indexOf("?") != -1) {
      const str = url.substr(1), strs = str.split("&");
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
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

}

export default Utils;
