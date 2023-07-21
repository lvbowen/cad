
import { PropertyNames } from '../control-like';

import {
    FormControl, FormControlOptions, FormControlErrorCodes, FormControlType
} from './form-control';


export interface RadioControlOptions extends FormControlOptions<any> {

    /**
     * 值映射
     */
    mappings?: { [key: string]: string | string[] };

}


export class RadioControl extends FormControl<any>{

    constructor(options?: RadioControlOptions) {
        super(options);
    }

    get type() {
        return FormControlType.Radio;
    }

    canSetValue(val: any) {
        return true;
    }

    validateCore(required?: boolean) {
        this._errors = [];

        if (!this.disabled) {

            if (required && !this.validateRequired()) {
                return false;
            }

        }

        return true;
    }

    validateRequired() {
        if (this.required) {

            if (this._value === null || this._value === undefined
                || (typeof this._value === 'string' && this._value.trim().length === 0)
                || (Array.isArray(this._value) && this._value.length === 0)
                || (typeof this._value === 'object' && Object.keys(this._value).length === 0)
            ) {

                super.setError(FormControlErrorCodes.Required);

                return false;
            }
        }

        return true;
    }

}
