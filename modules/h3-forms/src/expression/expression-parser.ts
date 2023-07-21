import {
  AggregateFunc,
  ExpParseReuslt,
  ValueExpParseReuslt,
  AggregateFuncType,
} from "./exp-parse-result";

import { TextFnProvider } from "./text-fn-provider";

const arg_key = "$fn_arg";

const reg_agg = /(?:avg|sum|max|min|count)\((?:\{\w+(\.\w+)*\}|\d+)+(?:,(\{\w+\}|\d+))*\)/;

const reg_value_exp = /\{(\w+(?:\.\w+)*)\}/;

const key_reg = "\\w+\\d*\\w*(?:\\.\\w+\\d*\\w*)*";
const reg_condition_exp = new RegExp(`\{(${key_reg})\}`);

const reg_time_unit = "[yMdhms]{1}";
const reg_datedif = new RegExp(
  `datedif\\((\\s*\{${key_reg}\}\\s*,\\s*\{${key_reg}\}\\s*,\\s*(?:'${reg_time_unit}')|(?:"${reg_time_unit}")\\s*)\\)`
);

const reg_year = new RegExp(`\\byear\\((\\s*\{${key_reg}\}\\s*)\\)`);
const reg_month = new RegExp(`\\bmonth\\((\\s*\{${key_reg}\}\\s*)\\)`);
const reg_day = new RegExp(`\\bday\\((\\s*\{${key_reg}\}\\s*)\\)`);
const reg_week_num = new RegExp(`\\bweeknum\\((\\s*\{${key_reg}\}\\s*)\\)`);
const reg_quarter = new RegExp(`\\bquarter\\((\\s*\{${key_reg}\}\\s*)\\)`);
const reg_hour = new RegExp(`\\bhour\\((\\s*\{${key_reg}\}\\s*)\\)`);
const reg_minute = new RegExp(`\\bminute\\((\\s*\{${key_reg}\}\\s*)\\)`);
const reg_second = new RegExp(`\\bsecond\\((\\s*\{${key_reg}\}\\s*)\\)`);
const reg_substring = new RegExp(
  `\\bsubstring\\((\\s*\\S*(?:\\s*,\\s*\\S*)*\\s*)\\)`
);
const reg_string = new RegExp(
  `\\bstring\\((\\s*'?(?:\\S|\\s)+'?(?:\\s*,\\s*'?(?:\\S|\\s)+'?)*\\s*)\\)`
);
const reg_min = new RegExp(`\\bmin\\((\\s*'?(?:\\S|\\s)+'?(?:\\s*,\\s*'?(?:\\S|\\s)+'?)*\\s*)\\)`)
const reg_max = new RegExp(`\\bmax\\((\\s*'?(?:\\S|\\s)+'?(?:\\s*,\\s*'?(?:\\S|\\s)+'?)*\\s*)\\)`)
const reg_ip = new RegExp(`\\bip\\(\\)`)
const reg_left = new RegExp(`\\bleft\\((\\s*([^,])+(\\s*,\\s*\\d+)?\\s*)\\)`)
// 在设置显示条件时，以前显示符号的label全部换成中文符， 如 == 需换成 等于 ，则正则需做到两者兼容。
const key_reg2 = `(\{${key_reg}\})`;
const reg_is_null = new RegExp(`${key_reg2}\\s为空`);
const reg_is_not_null = new RegExp(`${key_reg2}\\s不为空`);

const reg_contains = new RegExp(`${key_reg2}\\s包含\\s('?\\S+'?)`);
const reg_not_contains = new RegExp(`${key_reg2}\\s不包含\\s('?\\S+'?)`);

const reg_in = new RegExp(`${key_reg2}\\s位于\\s('?\\S+'?)`);
const reg_not_in = new RegExp(`${key_reg2}\\s不位于\\s('?\\S+'?)`);

const reg_of = new RegExp(`${key_reg2}\\s属于\\s('?\\S+'?)`);
const reg_not_of = new RegExp(`${key_reg2}\\s不属于\\s('?\\S+'?)`);

const reg_have = new RegExp(`${key_reg2}\\s拥有\\s('?\\S+'?)`);
const reg_not_have = new RegExp(`${key_reg2}\\s不拥有\\s('?\\S+'?)`);


const reg_equal = new RegExp(`${key_reg2}\\s==\\s('?\\S+'?)`);
const reg_equal_new = new RegExp(`${key_reg2}\\s等于\\s('?\\S+'?)`);
const reg_not_equal = new RegExp(`${key_reg2}\\s!=\\s('?\\S+'?)`);
const reg_not_equal_new = new RegExp(`${key_reg2}\\s不等于\\s('?\\S+'?)`);

const reg_greater_than = new RegExp(`${key_reg2}\\s>\\s('?\\S+'?)`);
const reg_greater_than_new = new RegExp(`${key_reg2}\\s大于\\s('?\\S+'?)`);
const reg_greater_than_equal = new RegExp(`${key_reg2}\\s>=\\s('?\\S+'?)`);
const reg_greater_than_equal_new = new RegExp(`${key_reg2}\\s大于等于\\s('?\\S+'?)`);

const reg_less_then = new RegExp(`${key_reg2}\\s<\\s('?\\S+'?)`);
const reg_less_then_new = new RegExp(`${key_reg2}\\s小于\\s('?\\S+'?)`);
const reg_less_then_equal = new RegExp(`${key_reg2}\\s<=\\s('?\\S+'?)`);
const reg_less_then_equal_new = new RegExp(`${key_reg2}\\s小于等于\\s('?\\S+'?)`);

let textFnProvider: TextFnProvider | null = null;

export interface LogicFnProvider {
  contains(arg: any, arg1: any): boolean;

  notContains(arg: any, arg1: any): boolean;

  in(arg: any, arg1: any): boolean;

  notIn(arg: any, arg1: any): boolean;

  isNull(arg: any): boolean;

  isNotNull(arg: any): boolean;

  of(arg: any, arg1: any): boolean;

  notOf(arg: any, arg1: any): boolean;

  have(arg: any, arg1: any): boolean;

  notHave(arg: any, arg1: any): boolean;

  equal(arg: any, arg1: any): boolean;

  notEqual(arg: any, arg1: any): boolean;

  greaterThan(arg: any, arg1: any): boolean;

  greaterThanOrEqual(arg: any, arg1: any): boolean;

  lessThan(arg: any, arg1: any): boolean;

  lessThanOrEqual(arg: any, arg1: any): boolean;
}

export class DefaultLogicFnProvider implements LogicFnProvider {
  isDate(arg: any) {
    return arg instanceof Date;
  }

  getTimeOf(arg: any) {
    let time: number | null = null;
    if (typeof arg === "string") {
      // arg1.replace(/-/g, "/") iOS兼容
      time = new Date(arg.replace(/-/g, "/")).getTime();
    } else if (this.isDate(arg)) {
      time = arg.getTime();
    }
    return time;
  }

  contains(arg: any, arg1: any): boolean {
    if (Array.isArray(arg)) {
      if (
        Array.isArray(arg1) &&
        typeof arg[0] === "object" &&
        typeof arg[0] === "object"
      ) {
        const ids = arg.map((x) => x.id);
        return arg1.every((x) => ids.indexOf(x.id) > -1);
      } else if (typeof arg[0] === "string" && typeof arg1 === "string") {
        for (const a of arg) {
          if (a && a.includes(arg1)) {
            return true;
          }
        }
        return false;
      }
    } else if (typeof arg === "string" && typeof arg1 === "string") {
      return arg.includes(arg1) && !!arg1.length;
    } else if (typeof arg === "string" && Array.isArray(arg1)) {
      // 包含 多选
      for (const a1 of arg1) {
        if (a1 && arg.includes(a1)) {
          return true;
        }
      }
      return false;
    }
    return false;
  }
  // 位于
  beLocated(arg: any, superset: any): boolean {
    if (typeof superset === "string") {
      if (typeof arg === "string" && !!arg) {
        return superset.includes(arg);
      } else if (Array.isArray(arg)) {
        if (typeof arg[0] === "string") {
          const t = arg.join(";");
          return superset.includes(t) && !!t;
        }
      }
    } else if (Array.isArray(superset)) {
      if (Array.isArray(arg)) {
        if (superset[0] && typeof superset[0] === "object") {
          const _supersetId = superset.map((v) => v.id);
          const _argId = arg.map((v) => v.id);
          for (const _id of _argId) {
            if (!~_supersetId.indexOf(_id) || !_id) {
              return false;
            }
          }
          return true;
        }
      }
    }
    return false;
  }

  notContains(arg: any, arg1: any): boolean {
    return !this.contains(arg, arg1);
  }

  in(arg: any, superset: any): boolean {
    return this.beLocated(arg, superset);
  }

  notIn(arg: any, arg1: any): boolean {
    return !this.in(arg, arg1);
  }

  isNull(arg: any): boolean {
    return arg === undefined || arg === null || arg === "";
  }

  isNotNull(arg: any): boolean {
    return !this.isNull(arg);
  }

  of(arg: any, arg1: any): boolean {
    if (Array.isArray(arg) && Array.isArray(arg1)) {
      const ids = arg1.map((x) => x.id);
      return arg.every((x) => {
        if (Array.isArray(x.parentId)) {
          return x.parentId.some((pid: string) => ids.indexOf(pid) > -1);
        } else if (typeof x.parentId === "string") {
          return ids.indexOf(x.parentId) > -1;
        }
        return false;
      });
    }
    return false;
  }

  notOf(arg: any, arg1: any): boolean {
    return !this.of(arg, arg1);
  }

  have(arg: any, arg1: any): boolean {
    return this.of(arg1, arg);
  }

  notHave(arg: any, arg1: any): boolean {
    return !this.have(arg, arg1);
  }

  equal(arg: any, arg1: any): boolean {
    if (Array.isArray(arg) && Array.isArray(arg1)) {
      if(arg.length === arg1.length){
        const ids = arg.map((x) => x.id);
        return arg1.every((x) => ids.indexOf(x.id) > -1);
      }
      return false;
    }

    const types = [typeof arg, typeof arg1];

    if (this.isDate(arg)) {
      const time2 = this.getTimeOf(arg1);
      return arg.getTime() === time2;
    }

    return arg == arg1;
  }

  notEqual(arg: any, arg1: any): boolean {
    return !this.equal(arg, arg1);
  }

  greaterThan(arg: any, arg1: any): boolean {
    const types = [typeof arg, typeof arg1];

    if (types.some((t) => t === "object")) {
      if (this.isDate(arg)) {
        const time2 = this.getTimeOf(arg1);

        if (time2 !== null) {
          return arg.getTime() > time2;
        }
      }
      return false;
    } else {
      return arg > arg1;
    }
  }

  greaterThanOrEqual(arg: any, arg1: any): boolean {
    const types = [typeof arg, typeof arg1];

    if (types.some((t) => t === "object")) {
      if (this.isDate(arg)) {
        const time2 = this.getTimeOf(arg1);

        if (time2 !== null) {
          return arg.getTime() >= time2;
        }
      }
      return false;
    } else {
      return arg >= arg1;
    }
  }

  lessThan(arg: any, arg1: any): boolean {
    const types = [typeof arg, typeof arg1];

    if (types.some((t) => t === "object")) {
      if (this.isDate(arg)) {
        const time2 = this.getTimeOf(arg1);

        if (time2 !== null) {
          return arg.getTime() < time2;
        }
      }
      return false;
    } else {
      return arg < arg1;
    }
  }

  lessThanOrEqual(arg: any, arg1: any): boolean {
    const types = [typeof arg, typeof arg1];

    if (types.some((t) => t === "object")) {
      if (this.isDate(arg)) {
        const time2 = this.getTimeOf(arg1);

        if (time2 !== null) {
          return arg.getTime() <= time2;
        }
      }
      return false;
    } else {
      return arg <= arg1;
    }
  }
}

const logicFnProvider: LogicFnProvider = new DefaultLogicFnProvider();

export class ExpressionParser {
  static parseAggregate(exp: string): AggregateFunc {
    const idx = exp.indexOf("(");
    const type = exp.substring(0, idx) as any;
    const keys = exp
      .substring(idx + 1, exp.length - 1)
      .split(",")
      .map((key) => {
        if (/^\d+$/.test(key)) {
          return Number(key);
        }
        return key.replace(/\{|\}/g, "");
      });
    return { keys, type };
  }

  /**
   * 解析值表达式
   * @param exp
   */
  static parseValueExp(exp: string): ValueExpParseReuslt {
    const aggs: { [key: string]: AggregateFunc } = {};
    const args: { [key: string]: string } = {};
    const keys: string[] = [];
    let result: RegExpExecArray | null;
    let i = 0;

    while (((result = reg_agg.exec(exp)), result !== null)) {
      const key = "exp" + i;
      const agg = ExpressionParser.parseAggregate(result[0]);
      aggs[key] = agg;
      agg.keys.forEach((k) => {
        if (typeof k === "string" && keys.indexOf(k) === -1) {
          keys.push(k);
        }
      });
      i++;
      exp = exp.replace(reg_agg, `${arg_key}.${key}`);
    }

    const reg = /\./g;
    while (((result = reg_value_exp.exec(exp)), result !== null)) {
      if (keys.indexOf(result[1]) === -1) {
        keys.push(result[1]);
      }
      const key = result[1].replace(reg, "_");
      exp = exp.replace(reg_value_exp, `${arg_key}.${key}`);
      args[key] = result[1];
    }

    if (/\{.+\..+\}/.test(exp)) {
      exp = "";
    }

    const func = new Function(arg_key, "return " + exp) as any;

    return {
      func,
      aggs,
      args,
      keys,
    };
  }

  /**
   * 聚合函数
   * @param type
   * @param values
   */
  static aggregate(type: string, values: number[]) {
    if (type === AggregateFuncType.Count) {
      return values.length;
    }

    const vals = values.filter((v) => typeof v === "number");

    if (vals.length === 0) {
      return null;
    }

    let val = 0;

    const multiple = 100000;

    const sumFn = () => {
      vals.forEach((v) => (val += v * multiple));
      val = Math.round(val) / multiple;
    };

    switch (type) {
      case AggregateFuncType.Sum:
        sumFn();
        break;
      case AggregateFuncType.Min:
        if (values.some((v) => v === null)) {
          return null;
        }
        val = vals.sort((a, b) => a - b).shift() as number;
        break;
      case AggregateFuncType.Max:
        val = vals.sort((a, b) => a - b).pop() as number;
        break;
      case AggregateFuncType.Avg:
        sumFn();
        val = val / vals.length;
        break;
    }

    return val;
  }

  /**
   * 解析条件表达式
   * @param exp
   */
  static parseConditionExp(exp: string): ExpParseReuslt {
    const keys: string[] = [];

    let result: RegExpExecArray | null;

    while (reg_contains.test(exp)) {
      exp = exp.replace(reg_contains, "this.contains($1, $2)");
    }

    while (reg_not_contains.test(exp)) {
      exp = exp.replace(reg_not_contains, "this.notContains($1, $2)");
    }

    while (reg_in.test(exp)) {
      exp = exp.replace(reg_in, "this.in($1, $2)");
    }

    while (reg_not_in.test(exp)) {
      exp = exp.replace(reg_not_in, "this.notIn($1, $2)");
    }

    while (reg_of.test(exp)) {
      exp = exp.replace(reg_of, "this.of($1, $2)");
    }

    while (reg_not_of.test(exp)) {
      exp = exp.replace(reg_not_of, "this.notOf($1, $2)");
    }

    while (reg_have.test(exp)) {
      exp = exp.replace(reg_have, "this.have($1, $2)");
    }

    while (reg_not_have.test(exp)) {
      exp = exp.replace(reg_not_have, "this.notHave($1, $2)");
    }

    while (reg_is_null.test(exp)) {
      exp = exp.replace(reg_is_null, "this.isNull($1)");
    }

    while (reg_is_not_null.test(exp)) {
      exp = exp.replace(reg_is_not_null, "this.isNotNull($1)");
    }

    while (reg_equal.test(exp)) {
      exp = exp.replace(reg_equal, "this.equal($1, $2)");
    }

    while (reg_equal_new.test(exp)) {
      exp = exp.replace(reg_equal_new, "this.equal($1, $2)");
    }

    while (reg_not_equal.test(exp)) {
      exp = exp.replace(reg_not_equal, "this.notEqual($1, $2)");
    }

    while (reg_not_equal_new.test(exp)) {
      exp = exp.replace(reg_not_equal_new, "this.notEqual($1, $2)");
    }

    while (reg_greater_than.test(exp)) {
      exp = exp.replace(reg_greater_than, "this.greaterThan($1, $2)");
    }

    while (reg_greater_than_new.test(exp)) {
      exp = exp.replace(reg_greater_than_new, "this.greaterThan($1, $2)");
    }

    while (reg_greater_than_equal.test(exp)) {
      exp = exp.replace(
        reg_greater_than_equal,
        "this.greaterThanOrEqual($1, $2)"
      );
    }

    while (reg_greater_than_equal_new.test(exp)) {
      exp = exp.replace(
        reg_greater_than_equal_new,
        "this.greaterThanOrEqual($1, $2)"
      );
    }

    while (reg_less_then.test(exp)) {
      exp = exp.replace(reg_less_then, "this.lessThan($1, $2)");
    }

    while (reg_less_then_new.test(exp)) {
      exp = exp.replace(reg_less_then_new, "this.lessThan($1, $2)");
    }

    while (reg_less_then_equal.test(exp)) {
      exp = exp.replace(reg_less_then_equal, "this.lessThanOrEqual($1, $2)");
    }

    while (reg_less_then_equal_new.test(exp)) {
      exp = exp.replace(reg_less_then_equal_new, "this.lessThanOrEqual($1, $2)");
    }

    while (((result = reg_condition_exp.exec(exp)), result !== null)) {
      if (keys.indexOf(result[1]) === -1) {
        keys.push(result[1]);
      }
      exp = exp.replace(reg_condition_exp, `${arg_key}.$1`);
    }

    const fnBody = "return " + exp;

    const func = new Function(arg_key, fnBody);

    // func.bind(logicFnProvider);

    const obj = Object.setPrototypeOf(
      {
        exp,
        keys,
        func,
      },
      logicFnProvider
    );

    return obj;
  }

  /**
   * 解析条件表达式
   * @param exp
   */
  static parseTextExp(exp: string): ExpParseReuslt {
    // debugger
    const keys: string[] = [];

    let result: RegExpExecArray | null;

    while (reg_max.test(exp)) {
      exp = exp.replace(reg_max,"this.mathMax($1)");
    }

    while (reg_min.test(exp)) {
      exp = exp.replace(reg_min, "this.mathMin($1)");
    }

    while (reg_ip.test(exp)) {
      exp = exp.replace(reg_ip, "this.getIP()");
    }

    while (reg_left.test(exp)) {
      exp = exp.replace(reg_left,"this.subStringLeft($1)");
    }

    while (reg_substring.test(exp)) {
      exp = exp.replace(reg_substring, "this.substr($1)");
    }

    while (reg_string.test(exp)) {
      exp = exp.replace(reg_string, "this.concat($1)");
    }

    while (reg_datedif.test(exp)) {
      exp = exp.replace(reg_datedif, "this.dateDiff($1)");
    }

    while (reg_year.test(exp)) {
      exp = exp.replace(reg_year, "this.dateYear($1)");
    }

    while (reg_month.test(exp)) {
      exp = exp.replace(reg_month, "this.dateMonth($1)");
    }

    while (reg_day.test(exp)) {
      exp = exp.replace(reg_day, "this.dateDay($1)");
    }

    while (reg_week_num.test(exp)) {
      exp = exp.replace(reg_week_num, "this.dateWeekNum($1)");
    }

    while (reg_quarter.test(exp)) {
      exp = exp.replace(reg_quarter, "this.dateQuarter($1)");
    }

    while (reg_hour.test(exp)) {
      exp = exp.replace(reg_hour, "this.dateHour($1)");
    }

    while (reg_minute.test(exp)) {
      exp = exp.replace(reg_minute, "this.dateMinute($1)");
    }

    while (reg_second.test(exp)) {
      exp = exp.replace(reg_second, "this.dateSecond($1)");
    }

    while (((result = reg_condition_exp.exec(exp)), result !== null)) {
      if (keys.indexOf(result[1]) === -1) {
        keys.push(result[1]);
      }
      exp = exp.replace(reg_condition_exp, `${arg_key}.$1`);
    }

    const fnBody = "return " + exp;

    // console.log(fnBody);
    // debugger

    const func = new Function(arg_key, fnBody);

    // func.bind(logicFnProvider);
    if (!textFnProvider) {
      textFnProvider = new TextFnProvider();
    }

    const obj = Object.setPrototypeOf(
      {
        exp,
        keys,
        func,
      },
      textFnProvider
    );

    return obj;
  }
}
