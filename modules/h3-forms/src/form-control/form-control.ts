import { filter } from "rxjs/operators";

import { Control, ControlOptions, ValidateTriggerType } from "../control";

import {
  FormControlLike,
  ControlPropertyChange,
  PropertyNames,
  ControlStatus,
} from "../control-like";

import { ContainerLike } from "../container-like";

// eslint-disable-next-line no-shadow
export enum FormControlType {
  Number = "number",

  Date = "date",

  Text = "text",

  Select = "select",

  Radio = "radio",

  Tab = "tab"
}

// eslint-disable-next-line no-shadow
export enum FormControlErrorCodes {
  Pattern = "pattern",

  Required = "required",

  Min = "min",

  Max = "max",

  MinCount = "minCount",

  MaxCount = "maxCount",

  MinLength = "minLength",

  MaxLength = "maxLength",
}

export abstract class ValidatorLike<T> {
  abstract code: string;

  abstract validate(formControl: FormControl<T>): boolean;
}

export abstract class AsyncValidatorLike<T> {
  readonly async = true;

  abstract code: string;

  abstract validate(formControl: FormControl<T>): Promise<boolean>;
}

export interface FormControlOptions<T> extends ControlOptions {
  /**
   * 初始值
   */
  value?: T;

  /**
   * 必填的
   */
  required?: string | boolean;
  /**
   * 是否触发计算规则
   */
  triggerComputeFormula?: boolean;
  /**
   * 控件原本的值. (默认值或非新建模式下的值)
   */
  originalValue?: T;

  /**
   * 是否有计算规则
   */
  computeFormula?: boolean;

  /**
   * 校验触发类型
   */
  validateTriggerType?: ValidateTriggerType;

  /**
   * 自定义校验器，通过使用相同的code可覆盖内置的
   */
  validators?: Array<ValidatorLike<T> | AsyncValidatorLike<T>>;
}

export abstract class FormControl<T> extends Control
  implements FormControlLike {
  abstract readonly type: FormControlType;

  abstract canSetValue(val: T | null): boolean;

  abstract validateCore(required?: boolean): boolean;

  protected _required = false;

  protected _value: T | null = null;

  protected _errors: FormControlErrorCodes[] = [];

  protected _valueCache?: { [key: string]: number };

  constructor(options?: FormControlOptions<T>) {
    super(options);

    if (options) {
      if (typeof options.required === "boolean") {
        this._required = options.required;
      }
    }
  }

  get options() {
    return this._options as FormControlOptions<T>;
  }

  get required() {
    return this._required;
  }

  set required(val: boolean) {
    if (val === this._required) {
      return;
    }

    this._required = val;

    super.emitPropertyChange(PropertyNames.Required, val);

    this.removeError(FormControlErrorCodes.Required);
  }

  get value(): T | null {
    return this._value;
  }

  set value(val: T | null) {
    if (val === this._value) {
      return;
    }

    if (!this.canSetValue(val)) {
      return;
    }

    const old = this._value;

    this._value = val;

    super.setStatus(ControlStatus.Dirty);

    super.emitPropertyChange(PropertyNames.Value, val, old);

    const vtt = this.options ? this.options.validateTriggerType : undefined;
    if (
      vtt === ValidateTriggerType.Change ||
      vtt === undefined ||
      this.hasError
    ) {
      this.validate(false);
    }
  }

  /**
   * 属性-值变化
   */
  get valueChange() {
    return this.propertyChange.pipe(filter((c) => c.name === "value"));
  }

  /**
   * value不为null、undefined
   */
  get hasValue() {
    return this._value !== null && this._value !== undefined;
  }

  get errors() {
    return this._errors;
  }

  get hasError() {
    return this._errors.length > 0;
  }

  protected setError(code: FormControlErrorCodes) {
    // if (val === this._errors) {
    //     return;
    // }

    this._errors.push(code);

    super.emitPropertyChange(PropertyNames.Errors, this._errors);
  }

  protected removeError(code: FormControlErrorCodes) {
    const idx = this._errors.findIndex((e) => e === code);

    if (idx > -1) {
      this._errors.splice(idx, 1);
      if (this._errors.length === 0) {
        this.setStatus(ControlStatus.Valid);
      }
      super.emitPropertyChange(PropertyNames.Errors, this._errors);
    }
  }

  clearError() {
    this._errors = [];
    this.setStatus(ControlStatus.Valid);
    super.emitPropertyChange(PropertyNames.Errors, this._errors);
  }

  validate(required = true) {
    if (this.disabled || this.display === false) {
      return true;
    }

    const valid = this.validateCore(required);
    super.setStatus(valid ? ControlStatus.Valid : ControlStatus.Invalid);
    return valid;
  }

  init(root: ContainerLike, parent: ContainerLike) {
    // this._parent = parent;

    if (this.options) {
      super.subscribeDisplayRefs(root, parent);
      this.subscribeRequiredRefs(root, parent);
      this.subscribePropertyRefs(PropertyNames.Disabled, root, parent);
      this.subscribePropertyRefs(PropertyNames.Readonly, root, parent);
    }
  }

  update(noInitValue?: boolean) {
    if (this.options) {
      if (!noInitValue) {
        const val = this.options.value;

        if (val !== undefined) {
          this.value = val;
        }
      }

      super.calculateDisplay();
      this.calculateRequired();
      super.calculatePropertyValue(PropertyNames.Disabled);
      super.calculatePropertyValue(PropertyNames.Readonly);
    }
  }

  destroy() {
    super._destroy();
  }

  protected subscribeRequiredRefs(root: ContainerLike, parent?: ContainerLike) {
    const expParseReuslt = this.parseConditionExp(
      PropertyNames.Required,
      this.options.required
    );
    if (!expParseReuslt) {
      return;
    }

    const _this = this;

    const func = (change: ControlPropertyChange) => {
      _this.calculateRequired();
    };

    this.subscribeControlValueChange(expParseReuslt.keys, root, parent, func);
  }

  protected calculateRequired() {
    const expParseReuslt = this.parseConditionExp(
      PropertyNames.Required,
      this.options.required
    );
    if (expParseReuslt) {
      const val = this.callCalculateFunc(expParseReuslt);
      this.required = !!val;
    }
  }
}
