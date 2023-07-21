
import { Observable } from 'rxjs';

// eslint-disable-next-line no-shadow
export enum ControlStatus {
    /**
     * 原始的
     */
    Pristine = 'pristine',

    Pending = 'pending',

    /**
     * 有效的，校验成功
     */
    Valid = 'valid',

    /**
     * 无效的，校验失败
     */
    Invalid = 'invalid',

    /**
     * 脏的，值被改变还未触发校验
     */
    Dirty = 'dirty',

    Disabled = 'disabled'
}

// eslint-disable-next-line no-shadow
export enum PropertyNames {

    Display = 'display',

    Value = 'value',

    Required = 'required',

    Min = 'min',

    Max = 'max',

    Errors = 'errors',

    Disabled = 'disabled',

    Readonly = 'readonly',

}


export interface ControlValueChange {

    value: any

    oldValue?: any
}


export interface ControlPropertyChange extends ControlValueChange {

    name: PropertyNames

}

export interface FormControlLike {

    value: any

    type: string

    valueChange: Observable<ControlPropertyChange>

}