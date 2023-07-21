
import { Subscription, Subject, Observable, asyncScheduler, ReplaySubject } from 'rxjs';

import { observeOn } from 'rxjs/operators';

import {
    PropertyNames, ControlPropertyChange, ControlStatus, FormControlLike
} from './control-like';

import { ContainerLike } from './container-like';

import { ContainerHelper } from './container-helper';

import {
    ExpressionParser, ExpParseReuslt, ValueExpParseReuslt
} from './expression';


/**
 * 验证触发类型
 */
// eslint-disable-next-line no-shadow
export enum ValidateTriggerType {

    /**
     * 不自动触发
     */
    None,

    /**
     * 失焦
     */
    Blur,

    /**
     * 值变化时
     */
    Change

}


/**
 * 控件属性
 */
export interface ControlOptions {

    id?: string

    name?: string

    /**
     * 显示
     */
    display?: string | boolean

    /**
     * 禁用的
     */
    disabled?: string | boolean

    /**
     * 只读的
     */
    readonly?: string | boolean

    /**
     * 是否在子表中
     */
    inSheet?: boolean

    /**
     * 所在子表的行索引
     */
    rowIndex?: number

    /**
     * 格式化函数
     */
    formatter?: (control: Control) => string
}



/**
 * 控件命令
 */
export interface ControlCommand {

    /**
     * 命令名称
     */
    name: string

    /**
     * 命令参数
     */
    args?: any

}


export interface PropertyExpReusltMap {

    [key: string]: ExpParseReuslt

}


export interface PropertyValueExpReusltMap {

    [key: string]: ValueExpParseReuslt

}


export abstract class Control {

    id?: string;

    name?: string;

    protected _disabled = false;

    protected _readonly = false;

    private _status: ControlStatus;

    private _subscriptions?: Subscription[];

    protected _display = true;

    protected _options?: ControlOptions;

    protected _propertyChangeSubject?: Subject<ControlPropertyChange>;

    protected _propertyChange !: Observable<ControlPropertyChange>;

    protected _commander?: Subject<ControlCommand>;

    protected _refControls?: { [key: string]: Control };

    protected _expReusltMap?: PropertyExpReusltMap;

    protected _valueExpReusltMap?: PropertyValueExpReusltMap;

    constructor(options?: ControlOptions) {
        this._status = ControlStatus.Pristine;

        if (options) {
            this._options = options;

            this.id = options.id;
            this.name = options.name;

            if (typeof options.readonly === 'boolean') {
                this._readonly = options.readonly;
            }

            if (typeof options.disabled === 'boolean') {
                this._disabled = options.disabled;
            }

            if (typeof options.display === 'boolean') {
                this._display = options.display;
            }
        }
    }


    abstract init(root: ContainerLike, parent?: ContainerLike): void;

    abstract update(noInitValue?: boolean): void;

    abstract destroy(): void;

    /**
     * 校验表单
     */
    abstract validate(): boolean;

    clearError?(): void;

    abstract value: any;

    get options() {
        return this._options;
    }

    /**
     * 属性变化
     */
    get propertyChange() {
        if (!this._propertyChangeSubject) {
            this._propertyChangeSubject = new Subject();
            this._propertyChange = this._propertyChangeSubject.pipe(
                observeOn(asyncScheduler)
            );
        }
        return this._propertyChange;
    }

    /**
     * 命令发送器
     */
    get commander() {
        if (!this._commander) {
            this._commander = new ReplaySubject(1);
        }
        return this._commander;
    }

    get status() {
        return this._status;
    }

    protected setStatus(val: ControlStatus) {
        if (this._status === val) {
            return;
        }

        this._status = val;
    }

    /**
     * 原始的
     */
    get pristine() {
        return this._status === ControlStatus.Pristine;
    }

    get pending() {
        return this._status === ControlStatus.Pending;
    }

    /**
     * 有效的，校验成功
     */
    get valid() {
        return this._status === ControlStatus.Valid;
    }

    /**
     * 无效的，校验失败
     */
    get invalid() {
        return this._status === ControlStatus.Invalid;
    }

    /**
     * 脏的，值被改变还未触发校验
     */
    get dirty() {
        return this._status === ControlStatus.Dirty;
    }

    get display() {
        return this._display;
    }

    set display(val: boolean) {
        if (val === this._display) {
            return;
        }

        this._display = val;
        this.emitPropertyChange(PropertyNames.Display, val);

        if (this.clearError) {
            this.clearError();
        }
    }

    get disabled() {
        return this._disabled;
    }

    set disabled(val: boolean) {
        if (val === this._disabled) {
            return;
        }

        this._disabled = val;
        this.emitPropertyChange(PropertyNames.Disabled, val);
    }

    get readonly() {
        return this._readonly;
    }

    set readonly(val: boolean) {
        if (val === this._readonly) {
            return;
        }

        this._readonly = val;
        this.emitPropertyChange(PropertyNames.Readonly, val);
    }

    /**
     * 是否在子表中
     */
    get inSheet() {
        return !!(this._options && this._options.inSheet);
    }

    isNullOrUndefined(val: any) {
        return val === null || val === undefined;
    }

    /**
     * 触发属性变化
     * @param name 
     * @param value 
     * @param oldValue 
     */
    protected emitPropertyChange(name: PropertyNames, value: any, oldValue?: any) {
        if (this._propertyChangeSubject) {
            this._propertyChangeSubject.next({
                name,
                value,
                oldValue
            });
        }
    }


    /**
     * 订阅控件的值变化事件
     * @param contorlIds
     * @param contorlKeys
     */
    protected subscribeControlValueChange(
        keys: string[],
        root: ContainerLike,
        parent: ContainerLike | undefined,
        func: (change: ControlPropertyChange) => void
    ) {
        if (!keys || keys.length === 0) {
            return;
        }

        if (!this._refControls) {
            this._refControls = {};
        }

        if (!this._subscriptions) {
            this._subscriptions = [];
        }


        for (const key of keys) {

            const control = ContainerHelper.find(key, this.inSheet, root, parent);

            if (!control) {
                continue;
            }

            this._refControls[key] = control;

            const c = control as any as FormControlLike;

            if (c.valueChange) {
                const sub = c.valueChange.subscribe(func, undefined, () => {
                    // 当控件被移除时，移除引用
                    delete (this._refControls as any)[key];
                });
                this._subscriptions.push(sub);
            }
        }

    }


    /**
     * 解析条件表达式
     * @param name 
     */
    protected parseConditionExp(name: PropertyNames, exp: any) {
        // const exp = (this._options as any)[name];

        if (typeof exp !== 'string' || !exp) {
            return;
        }

        if (!this._expReusltMap) {
            this._expReusltMap = {};
        }

        let expParseReuslt = this._expReusltMap[name];

        if (expParseReuslt) {
            return expParseReuslt;
        }

        expParseReuslt = ExpressionParser.parseConditionExp(exp);

        this._expReusltMap[name] = expParseReuslt;

        return expParseReuslt;
    }


    /**
     * 解析值表达式
     * @param name 
     */
    protected parseValueExp(name: PropertyNames, exp: any) {
        // const exp = (this._options as any)[name];

        if (typeof exp !== 'string' || !exp) {
            return;
        }

        if (!this._valueExpReusltMap) {
            this._valueExpReusltMap = {};
        }

        let valueExpParseReuslt = this._valueExpReusltMap[name];

        if (valueExpParseReuslt) {
            return valueExpParseReuslt;
        }

        valueExpParseReuslt = ExpressionParser.parseValueExp(exp);

        this._valueExpReusltMap[name] = valueExpParseReuslt;

        return valueExpParseReuslt;
    }


    /**
     * 订阅显示表达式引用的控件
     * @param controlKey 
     * @param value 
     */
    protected subscribeDisplayRefs(root: ContainerLike, parent?: ContainerLike) {
        this.subscribePropertyRefs(PropertyNames.Display, root, parent);
    }


    /**
     * 计算display
     */
    protected calculateDisplay() {
        this.calculatePropertyValue(PropertyNames.Display);
    }


    /**
     * 订阅表达式属性引用的控件
     * @param controlKey 
     * @param value 
     */
    protected subscribePropertyRefs(name: PropertyNames, root: ContainerLike, parent?: ContainerLike) {
        if (!this._options) {
            return;
        }
        const expString = (this._options as any)[name];
        const expParseReuslt = this.parseConditionExp(name, expString);
        if (!expParseReuslt) {
            return;
        }

        const _this = this;

        const func = (change: ControlPropertyChange) => {
            _this.calculatePropertyValue(name);
        };

        this.subscribeControlValueChange(expParseReuslt.keys, root, parent, func);
    }


    /**
     * 计算逻辑表达式属性的值
     */
    protected calculatePropertyValue(name: PropertyNames) {
        if (!this._options) {
            return;
        }
        const expString = (this._options as any)[name];
        const expParseReuslt = this.parseConditionExp(name, expString);
        if (expParseReuslt) {
            const val = this.callCalculateFunc(expParseReuslt);
            (this as any).display = !!val;
        }
    }


    callCalculateFunc(expParseReuslt: ExpParseReuslt) {
        const controls = this._refControls;
        if (controls) {
            const arg: any = {};

            expParseReuslt.keys.filter(k => k.indexOf('.') > -1)
                .forEach(k => {
                    const arr = k.split('.');
                    if (arg[arr[0]] === undefined) {
                        arg[arr[0]] = {};
                    }
                    arg[arr[0]][arr[1]] = controls[k] ? controls[k].value : null;
                });

            expParseReuslt.keys.filter(k => k.indexOf('.') === -1)
                .forEach(k => arg[k] = controls[k] ? controls[k].value : null);

            try {
                const result = expParseReuslt.func(arg);
                return !!result;
            } catch (error) {
                console.info('callCalculateFunc:' + error);
                //throw error;
            }
        }
    }


    toString(formatter?: (control: Control) => string) : string {
        if (!formatter && this._options) {
            formatter = this._options.formatter;
        }

        if (formatter) {
            return formatter(this);
        } else {
            return this.value ? this.value.toString() : '';
        }
    }


    protected _destroy() {
        this.unsubscribe();

        if (this._propertyChangeSubject) {
            this._propertyChangeSubject.complete();
        }

        if (this._commander) {
            this._commander.complete();
        }
    }

    protected unsubscribe() {
        if (this._subscriptions) {
            this._subscriptions.map(s => s.unsubscribe());
            this._subscriptions = undefined;
        }
    }


}