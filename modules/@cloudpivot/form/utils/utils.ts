export const getRealLength = (str: any) => {
    if (!str) {
        return 0;
    }
    let realLength: number = 0;
    const len: number = str.length;
    let charCode: number = -1;
    for (let i: number = 0; i < len; i += 1) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) {
            realLength += 1;
        } else {
            realLength += 2;
        }
    }
    return realLength;
};

export const parseUrlParam = (urls: string, param?: string) => {
    let url = urls;
    const searchIndex = url.indexOf("?");
    const jhIndex = url.indexOf("#");
    if (jhIndex > -1) {
        url = url.substr(0, jhIndex);
    }
    const allParam: any = {}
    const searchParams = url.slice(searchIndex + 1).split("&");
    for (let i = 0; i < searchParams.length; i += 1) {
        if (searchParams[i].indexOf('=') === -1) {
            continue
        }
        const items = searchParams[i].split("=");
        if (param && items[0].trim().toLowerCase() === param.toLowerCase()) {
            return items[1].trim();
        }
        allParam[items[0].trim()] = items[1].trim();
    }
    if (!param) {
        return allParam;
    }
    return null;
};

export const parseSearch = (search: string) => {
    search = search.substr(1);
    const obj: any = {};
    search.split("&").forEach(arr => {
        const [key, value] = arr.split("=");
        obj[key] = value;
    });
    return obj;
};

/* 正则规则 */
export const pattern = (type: string) => {
    switch (type) {
        case "code":
            /* 以字母开头不超过28个字符，仅支持字母、数字、下划线 */
            return /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/;
        case "modelcode":
            /* 以字母开头不超过26个字符，仅支持字母、数字、下划线 */
            return /^[a-zA-Z][a-zA-Z0-9_]{0,25}$/;
        case "name":
            /* 仅限50个字符以内，并不能以空格开头 */
            return /^\S(.{0,49})?$/;
        default:
            break;
    }
};

export const nameValidator = (rules: any, value: any, callback: any, length: number) => {
    const reg = /^ /;
    const len = getRealLength(value);
    if (reg.test(value) || len > (length | 50)) {
        callback("");
    }
    callback();
};
export const bizModelNameValidator = (rules: any, value: any, callback: any, length: number) => {
    const reg = /^ /;
    const reg2 = /^_/;
    const reg3 = /[^\u4e00-\u9fa5a-zA-Z\d-_]+/; // 模型名称 只能匹配 汉字英文字符数字和‘-’、‘_’字符 字符之间不能输入空格!
    const len = getRealLength(value);
    if (reg.test(value) || len > (length | 50) || reg2.test(value) || reg3.test(value)) {
        callback("");
    }
    callback();
};
export const sliceString = (value: any, length: number) => {
    // const reg = /^ /;
    if (!value) {
        return "";
    }
    let charCode = -1;
    let realLength: number = 0;
    const len: number = value.length;
    for (let i: number = 0; i < len; i += 1) {
        charCode = value.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) {
            realLength += 1;
        } else {
            realLength += 2;
        }
        if (realLength > length) {
            return value.substring(0, i);
        }
    }
    return value;
};

export const deepCopy = (value: any): any => {
    if (Array.isArray(value)) {
        return value.map(res => {
            if (typeof res === 'object') {
                return deepCopy(res);
            } else {
                return res;
            }
        })
    }
    if (Object.prototype.toString.call(value) === '[object Object]') {
        const copyObj: any = {};
        for (const item in value) {
            if (typeof value[item] === 'object') {
                copyObj[item] = deepCopy(value[item]);
            } else {
                copyObj[item] = value[item];
            }
        }
        return copyObj;
    }
    return value
}

let index = 0

// make unique code
export const uid = () => {
    const now = +(new Date())
    return `h3-upload-${now}-${++index}`
}

export class StaticUtils {
    private static _flag: number = 0;

    /**
     * 防抖
     * @param fun 要执行的方法
     * @param time
     */
    static debound(fun: Function, time: number = 500) {
        if (StaticUtils._flag !== null && StaticUtils._flag !== undefined) {
            window.clearTimeout(StaticUtils._flag);
        }
        StaticUtils._flag = window.setTimeout(function () {
            fun();
            if (StaticUtils._flag !== null && StaticUtils._flag !== undefined) {
                window.clearTimeout(StaticUtils._flag);
            }
            StaticUtils._flag = 0;
        }, time);
    }
}

export const treeArrFilter = (arr:any[] = [], attChildren = 'children', key:any,callback:any) => {
    let finalArr:any[] = [];
    arr.map((item:any) => {
        if (callback(item)) {
            //@ts-ignore
            finalArr.push(item.id);
        }
        if (item[attChildren]) {
            const p = treeArrFilter(item[attChildren], attChildren, key,callback);
            finalArr = finalArr.concat(p)
        }
    });
    return finalArr;
}