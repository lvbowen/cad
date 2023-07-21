/**
 * 数据项类型
 */
// eslint-disable-next-line no-shadow
export enum DataItemType {
  /**
   * 短文本
   */
  ShortText = 0,

  /**
   * 长文本
   */
  LongText = 1,

  /**
   * 数值
   */
  Number = 2,

  /**
   * 日期
   */
  Date = 3,

  /**
   * 逻辑
   */
  Logic = 4,

  /**
   * 选人控件
   */
  StaffSelector = 5,

  /**
   * 附件
   */
  Attachment = 6,

  /**
   * 审批意见
   */
  ApprovalOpinion = 7,

  /**
   * 子表
   */
  Sheet = 8,

  /**
   * 关联单选
   */
  RelevanceForm = 9,

  /**
   * 地理位置
   */
  Address = 10,

  /**
   * 关联多选
   */
  RelevanceFormEx = 11,
}

interface kf {
  [key: string]: (val: any, type: any) => any;
}

export const DataItemTypeValue: kf = {
  ShortText(val: any, type: string) {
    return str(val, type);
  },
  LongText(val: any, type: string) {
    return str(val, type);
  },
  Number(val: any, type: string) {
    if (typeof val === "number") {
      return val;
    } else if (/^[0-9]+.?[0-9]*$/.test(val)) {
      return +val;
    }
    valError(val, type, "数值");
  },
  Logic(val: any, type: string) {
    if (typeof val === "boolean") {
      return val;
    } else if (val === "true") {
      valError(val, type, "逻辑");
      return true;
    } else if (val === "false") {
      valError(val, type, "逻辑");
      return false;
    }
  },
  Date(val: any, type: string) {
    if (val instanceof Date) {
      return val;
    } else if (typeof val === "string" && val) {
      try {
        // eslint-disable-next-line no-shadow
        const str = val
          .replace(/-/g, "/") // iOS兼容
          .replace(/T/g, " "); //修复2019-09-17T06:21:07.000字符不能new Date的问题

        const date = new Date(str);
        if (date.getFullYear() > 0) {
          return date;
        }
      } catch {}
    }
    valError(val, type, "日期");
  },
  StaffSelector(val: string, type: string) {
    return strOrArray(val, type);
  },
  Attachment(val: string, type: string) {
    return strOrArray(val, type);
  },
  ApprovalOpinion(val: string, type: string) {},
  Sheet(val: string, type: string) {
    return strOrArray(val, type);
  },
  RelevanceForm(val: string, type: string) {
    return strOrObject(val, type);
  },
  Address(val: string, type: string) {
    return strOrObject(val, type);
  },
};

function str(val: string, type: string) {
  if (typeof val === "string") {
    return val;
  } else if (typeof val === "number") {
    return "" + val;
  }
  valError(val, type, "字符串");
}

function strOrArray(val: string, type: string) {
  if (typeof val === "string") {
    try {
      val = JSON.parse(val);
    } catch {
      console.log(`${type} 类型值解析错误! 值是: ${val}`);
    }
  }
  if (Array.isArray(val) && val.some((x) => typeof x === "object")) {
    return val;
  }
}

function strOrObject(val: string, type: string) {
  if (typeof val === "string") {
    try {
      val = JSON.parse(val);
    } catch {
      console.log(`${type} 类型值解析错误! 值是: ${val}`);
    }
  }
  if (typeof val === "object") {
    return val;
  }
}

function valError(val: string, type: string, valType: string) {
  console.error(
    `${type} 类型的控件值应该 ${valType}类型,但是它现在是 ${typeof val}`
  );
}
