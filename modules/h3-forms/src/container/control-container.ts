import { Subscription } from "rxjs";

import {
  ControlStatus,
  ControlPropertyChange,
  FormControlLike
} from "../control-like";

import { Control } from "../control";

import { ContainerLike } from "../container-like";

import { ContainerHelper } from "../container-helper";
import { FormControlType } from "../form-control";
import { FormSheet } from "./form-sheet";

export abstract class ControlContainer extends Control
  implements ContainerLike {
  private _mappings?: { [id: string]: { [key: string]: string | string[] } };

  private _mappingsSubscriptions?: Subscription[];

  protected _root?: ContainerLike;

  abstract eachChildren(func: (control: Control, index?: number) => void): void;

  abstract children: { [key: string]: Control } | Control[];

  get status() {
    const statuses: ControlStatus[] = [];
    this.eachChildren(c => statuses.push(c.status));
    const status = this.calculateStatus(statuses);
    super.setStatus(status);
    return status;
  }

  get errors() {
    const obj: any = {};
    this.eachChildren((c, i) => {
      if (c.invalid) {
        const errors = (c as any).errors;
        obj[<any>c.id || i] = errors;
      }
    });
    return obj;
  }

  /**
   * 无效的，校验失败
   */
  get invalid() {
    return this.status === ControlStatus.Invalid;
  }

  init(root: ContainerLike, parent?: ContainerLike) {
    this._root = root;
    // this._parent = parent;

    if (this.options) {
      this.subscribeDisplayRefs(root, parent);
    }

    this.eachChildren(c => {
      if (c.options && (c.options as any).mappings && c.id) {
        if (!this._mappings) {
          this._mappings = {};
        }
        this._mappings[c.id] = (c.options as any).mappings;
      }
      c.init(root, this);
    });
  }

  findChild(key: string | number, rowIndex?: number) {
    if (Array.isArray(this.children)) {
      if (typeof key === "number") {
        return this.children[key];
      } else {
        return this.children.find(c => c.id === key);
      }
    } else {
      if (typeof key === "string" && key.includes(".")) {
        const [_sheetKey, _rowKey] = key.split(".");
        const _rowIndex = rowIndex || 0;
        const _sheet = this.children[_sheetKey];
        return (_sheet as FormSheet).children[_rowIndex].children[_rowKey];
      } else {
        return this.children[key];
      }
    }
  }

  subscribeMapping() {
    if (!this._mappings) {
      return;
    }

    const _this = this;

    this._mappingsSubscriptions = Object.keys(this._mappings)
      .map(k => this.findChild(k))
      .filter(c => c && (c as any).valueChange)
      .map(c => {
        return ((c as any) as FormControlLike).valueChange.subscribe(change =>
          _this.handleMapping(<any>c, change)
        );
      });
  }

  handleMapping(control: Control, change: ControlPropertyChange) {
    if (!this._root || !this._mappings || !control.id) {
      return;
    }

    const mapping = this._mappings[control.id];
    if (!mapping) {
      return;
    }

    const mapto = (sourceKey: string, targetKey: string) => {
      const c = ContainerHelper.find(
        targetKey,
        this.inSheet,
        this._root as any,
        this
      );
      // const c = this.findChild(targetKey);

      if (!c) {
        return;
      }

      let val = change.value;

      if (Array.isArray(val) && val.length > 0) {
        val = val[0];
      }

      if (typeof val === "object") {
        const hasValue = !(
          this.isNullOrUndefined(val) || this.isNullOrUndefined(val[sourceKey])
        );
        c.value = hasValue ? val[sourceKey] : null;
      }
    };

    for (const key in mapping) {
      const target = mapping[key];

      if (Array.isArray(target)) {
        target.filter(k => k).forEach(k => mapto(key, k));
      } else {
        mapto(key, target);
      }
    }
  }

  update(noInitValue = false) {
    this.eachChildren(c => c.update(noInitValue));

    // 字段映射得在值初始化后
    this.subscribeMapping();

    if (this.options) {
      super.calculateDisplay();
    }
  }

  destroy() {
    this.eachChildren(c => c.destroy());
    this.unsubscribe();
  }

  protected unsubscribe() {
    super.unsubscribe();
    if (this._mappingsSubscriptions) {
      this._mappingsSubscriptions.forEach(s => s.unsubscribe());
      this._mappingsSubscriptions = undefined;
    }
  }

  /**
   * 校验
   * @param excludes 不校验的控件集合
   */
  validate(excludes?: string[]) {
    if (this.disabled || this.display === false) {
      return true;
    }

    const results: boolean[] = [];
    this.eachChildren(c => {
      if (excludes && c.id && excludes.indexOf(c.id) > -1) {
        return;
      }
      results.push(c.validate());
    });
    return results.every(x => x);
  }

  calculateStatus = (statuses: ControlStatus[]) => {
    if (statuses.some(s => s === ControlStatus.Pending)) {
      return ControlStatus.Pending;
    }

    if (statuses.some(s => s === ControlStatus.Invalid)) {
      return ControlStatus.Invalid;
    }

    if (statuses.some(s => s === ControlStatus.Dirty)) {
      return ControlStatus.Dirty;
    }

    if (
      statuses.every(
        s => s === ControlStatus.Pristine || s === ControlStatus.Disabled
      )
    ) {
      return ControlStatus.Pristine;
    }

    if (
      statuses.every(
        s => s === ControlStatus.Valid || s === ControlStatus.Disabled
      )
    ) {
      return ControlStatus.Valid;
    }

    return ControlStatus.Pristine;
  };
}
