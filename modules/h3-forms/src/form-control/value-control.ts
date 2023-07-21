import { PropertyNames } from "../control-like";

import { ContainerLike } from "../container-like";

import {
  FormControl,
  FormControlOptions,
  FormControlErrorCodes,
  FormControlType,
} from "./form-control";

import { ContainerHelper } from "../container-helper";

import { ColumnValueChange, FormSheetLike } from "../form-sheet-like";

import { ExpressionParser, ValueExpParseReuslt } from "../expression";

export interface ValueControlOptions<T> extends FormControlOptions<T> {
  /**
   * 初始值
   */
  value?: any;

  /**
   * 最小值
   */
  min?: T | string;

  /**
   * 最大值
   */
  max?: T | string;
}

export abstract class ValueControl<T> extends FormControl<T> {
  protected _min: T | null = null;

  protected _max: T | null = null;

  /**
   * 比较大小
   * @param a
   * @param b
   * @returns 0一样，1 a大于b，-1 a小于b
   */
  abstract compare(a: T | null, b: T | null): number;

  get options() {
    return this._options as ValueControlOptions<T>;
  }

  get min(): T | null {
    return this._min;
  }

  set min(val: T | null) {
    if (val === this._min) {
      return;
    }

    this._min = val;

    super.emitPropertyChange(PropertyNames.Min, val);

    this.removeError(FormControlErrorCodes.Min);
  }

  get max(): T | null {
    return this._max;
  }

  set max(val: T | null) {
    if (val === this._max) {
      return;
    }

    this._max = val;

    super.emitPropertyChange(PropertyNames.Max, val);

    this.removeError(FormControlErrorCodes.Max);
  }

  init(root: ContainerLike, parent: ContainerLike) {
    super.init(root, parent);

    if (this.options) {
      this.subscribeValueRefs(root, parent);
      this.subscribeMinRefs(root, parent);
      this.subscribeMaxRefs(root, parent);
    }
  }

  update(noInitValue?: boolean) {
    super.update(noInitValue);

    if (this.options) {
      this.calculateValue(noInitValue);
      this.calculateMin();
      this.calculateMax();
    }
  }

  validateCore(required?: boolean) {
    this._errors = [];

    if (!this.disabled) {
      if (required && !this.validateRequired()) {
        return false;
      }

      if (!this.validateMin()) {
        return false;
      }

      if (!this.validateMax()) {
        return false;
      }
    }

    return true;
  }

  validateRequired() {
    if (this.required && !this.hasValue) {
      super.setError(FormControlErrorCodes.Required);

      return false;
    }

    return true;
  }

  validateMin() {
    if (
      this.hasValue &&
      !this.isNullOrUndefined(this._min) &&
      this.compare(this._value, this._min) === -1
    ) {
      super.setError(FormControlErrorCodes.Min);

      return false;
    }

    return true;
  }

  validateMax() {
    if (
      this.hasValue &&
      !this.isNullOrUndefined(this._max) &&
      this.compare(this._value, this._max) === 1
    ) {
      super.setError(FormControlErrorCodes.Max);

      return false;
    }

    return true;
  }

  protected subscribeMinRefs(root: ContainerLike, parent?: ContainerLike) {
    const valueExpParseReuslt = this.parseValueExp(
      PropertyNames.Min,
      this.options.min
    );
    if (!valueExpParseReuslt) {
      return;
    }

    const keys = valueExpParseReuslt.keys;

    const _this = this;

    const func = () => {
      _this.calculateMin();
    };

    this.subscribeValueChange(func, valueExpParseReuslt, keys, root, parent);
  }

  protected calculateMin() {
    const valueExpParseReuslt = this.parseValueExp(
      PropertyNames.Min,
      this.options.min
    );
    if (valueExpParseReuslt) {
      const val = this.calculateValueOf(valueExpParseReuslt);
      if (this.canSetValue(val)) {
        this.min = val;
      }
    }
  }

  protected subscribeMaxRefs(root: ContainerLike, parent?: ContainerLike) {
    const valueExpParseReuslt = this.parseValueExp(
      PropertyNames.Max,
      this.options.max
    );
    if (!valueExpParseReuslt) {
      return;
    }

    const keys = valueExpParseReuslt.keys;

    const _this = this;

    const func = () => {
      _this.calculateMax();
    };

    this.subscribeValueChange(func, valueExpParseReuslt, keys, root, parent);
  }

  protected calculateMax() {
    const valueExpParseReuslt = this.parseValueExp(
      PropertyNames.Max,
      this.options.max
    );
    if (valueExpParseReuslt) {
      const val = this.calculateValueOf(valueExpParseReuslt);
      if (this.canSetValue(val)) {
        this.max = val;
      }
    }
  }

  protected subscribeValueRefs(root: ContainerLike, parent?: ContainerLike) {
    const valueExpParseReuslt = this.parseValueExp(
      PropertyNames.Value,
      this.options.value
    );
    if (!valueExpParseReuslt) {
      return;
    }

    const keys = valueExpParseReuslt.keys;

    const _this = this;

    const func = () => {
      _this.calculateValue();
    };

    if (
      this.options.triggerComputeFormula ||
      !("triggerComputeFormula" in this.options)
    ) {
      this.subscribeValueChange(func, valueExpParseReuslt, keys, root, parent);
    } else {
      setTimeout(() => {
        this.subscribeValueChange(
          func,
          valueExpParseReuslt,
          keys,
          root,
          parent
        );
      }, 500);
    }
  }

  protected calculateValue(noInitValue = false) {
    const { triggerComputeFormula } = this.options;
    if (triggerComputeFormula || !("originalValue" in this.options)) {
      const valueExpParseReuslt = this.parseValueExp(
        PropertyNames.Value,
        this.options.value
      );
      // 向子表插入不重新计算
      if (valueExpParseReuslt && !noInitValue) {
        const val = this.calculateValueOf(valueExpParseReuslt);
        if (this.canSetValue(val)) {
          this.value = val;
        }
      }
    } else {
      this.value = this.options.originalValue || null;
      if (!this.options.triggerComputeFormula) {
        this.options.triggerComputeFormula = true;
        if ("originalValue" in this.options) {
          delete this.options.originalValue; // 只有第一次初时化的时候需要
        }
      }
    }
  }

  protected subscribeValueChange(
    func: () => void,
    parseResult: ValueExpParseReuslt,
    keys: string[],
    root: ContainerLike,
    parent?: ContainerLike
  ) {
    if (this.inSheet) {
      this.subscribeControlValueChange(keys, root, parent, func);
    } else {
      const sheetKeys = keys.filter((k) => k.indexOf(".") > -1);
      if (sheetKeys.length > 0) {
        const _this = this;
        const handler = (change: ColumnValueChange) => {
          const go = _this.handleColumnChange(change, parseResult);
          const { oldValue, rowIndex } = change;
          if (
            oldValue &&
            oldValue[rowIndex] === undefined &&
            !!_this.options.computeFormula
          ) {
            return;
          }
          if (go) {
            func();
          }
        };
        for (const key of sheetKeys) {
          const sheet = ContainerHelper.find(key, this.inSheet, root, parent);
          if (sheet) {
            const id = key.substr(key.lastIndexOf(".") + 1);
            const subject = ((sheet as any) as FormSheetLike).getColumnValueChange(
              id
            );
            if (subject) {
              subject.subscribe(handler);
            }
          }
        }
      }

      const otherKeys = keys.filter((k) => k.indexOf(".") === -1);
      this.subscribeControlValueChange(otherKeys, root, parent, func);
    }
  }

  private handleColumnChange(
    change: ColumnValueChange,
    parseResult: ValueExpParseReuslt
  ): boolean {
    if (!parseResult || !change.value) {
      return false;
    }

    const aggs = parseResult.aggs;

    const cache: any = {};

    let go = false;

    for (const key in aggs) {
      const agg = aggs[key];

      if (
        !agg ||
        !agg.keys.some(
          (k) =>
            typeof k === "string" &&
            k.endsWith(`${change.parentKey}.${change.key}`)
        )
      ) {
        continue;
      }

      go = true;

      const cacheKey = agg.type + "-" + key;
      if (!cache[cacheKey]) {
        cache[cacheKey] = ExpressionParser.aggregate(agg.type, change.value);
      }
    }

    if (!this._valueCache) {
      this._valueCache = {};
    }

    for (const key in cache) {
      this._valueCache[key] = cache[key];
    }

    // console.log(this.id, this._valueCache);

    return go;
  }

  protected calculateValueOf(parseResult?: ValueExpParseReuslt) {
    if (!parseResult) {
      return;
    }

    const controls = this._refControls;

    const argu: any = {};

    const aggs = parseResult.aggs;

    for (const key in aggs) {
      const agg = aggs[key];
      const cache = this._valueCache
        ? this._valueCache[agg.type + "-" + key] || null
        : null;
      if (cache !== null) {
        argu[key] = cache || 0;
      } else {
        if (controls) {
          const values = agg.keys.map((k) => {
            if (typeof k === "number") {
              return k;
            } else {
              return controls[k] ? controls[k].value : null;
            }
          });
          argu[key] = ExpressionParser.aggregate(agg.type, values);
        } else {
          argu[key] = 0;
        }
      }
    }

    if (controls) {
      const args = parseResult.args;
      for (const key in args) {
        const control = controls[args[key]];
        if (!control) {
          return;
        }
        argu[key] = control.value;
      }
    }

    // // 避免null自动转换为0计算出结果
    // for (const key in argu) {
    //     if (argu[key] === null) {
    //         argu[key] = undefined;
    //     }
    // }

    try {
      let val = parseResult.func(argu);
      if (typeof val === "number") {
        val = Math.round(val * 100000) / 100000;
      } else if (val instanceof Date) {
        val = new Date(val);
      }
      return val;
    } catch (error) {
      console.info("calculateValue:" + error);
      //throw error;
    }
  }
}

export interface NumberControlOptions extends ValueControlOptions<number> {}

export class NumberControl extends ValueControl<number> {
  constructor(options?: NumberControlOptions) {
    super(options);

    if (options) {
      if (typeof options.min === "number") {
        this.min = options.min;
      }

      if (typeof options.max === "number") {
        this.max = options.max;
      }
    }
  }

  get type() {
    return FormControlType.Number;
  }

  compare(a: number | null, b: number | null) {
    const aNot = typeof a !== "number";
    const bNot = typeof b !== "number";

    if (aNot && bNot) {
      return 0;
    }

    if (aNot) {
      return -1;
    }

    if (bNot) {
      return 1;
    }

    if (a === b) {
      return 0;
    }
    if (<number>a > <number>b) {
      return 1;
    }
    return -1;
  }

  canSetValue(val: number | null) {
    if (super.isNullOrUndefined(val)) {
      return true;
    }

    if (typeof val === "number" && !Number.isNaN(val) && Number.isFinite(val)) {
      return true;
    }

    return false;

    // if (this.isNullOrUndefined(val)) {
    //     return true;
    // } else {
    //     if (typeof val === 'number' && !Number.isNaN(val)) {
    //         if (!this.isNullOrUndefined(this._max)) {
    //             if (this.compare(val, this._max) === 1) {
    //                 return false;
    //             }
    //             if (this.compare(val, this._min) === -1) {
    //                 return false;
    //             }
    //         }
    //         return true;
    //     }
    // }

    // return false;
  }
}

export interface DateControlOptions extends ValueControlOptions<Date> {}

export class DateControl extends ValueControl<Date> {
  constructor(options?: DateControlOptions) {
    super(options);

    if (options) {
      if (options.min && options.min instanceof Date) {
        this.min = options.min;
      }

      if (options.max && options.max instanceof Date) {
        this.max = options.max;
      }
    }
  }

  get type() {
    return FormControlType.Date;
  }

  compare(a: Date | null, b: Date | null) {
    if (!a && !b) {
      return 0;
    }

    if (!a) {
      return -1;
    }

    if (!b) {
      return 1;
    }

    const at = a.getTime();
    const bt = b.getTime();
    if (at === bt) {
      return 0;
    }
    if (at > bt) {
      return 1;
    }
    return -1;
  }

  canSetValue(val: Date | null) {
    const can = super.isNullOrUndefined(val) || val instanceof Date;
    return can;
  }
}
