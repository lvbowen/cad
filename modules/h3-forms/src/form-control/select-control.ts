
import { PropertyNames } from '../control-like';

import {
    FormControl, FormControlOptions, FormControlErrorCodes, FormControlType
} from './form-control';


export interface SelectControlOptions extends FormControlOptions<any[]> {

    /**
     * 最小数量
     */
    minCount?: number

    /**
     * 最大数量
     */
    maxCount?: number

    // options : string[] | Array<{
    //     label : string
    //     value : any
    // }>

}


export class SelectControl extends FormControl<any[]>{

    minCount?: number

    maxCount?: number

    constructor(options?: SelectControlOptions) {
        super(options);

        if (options) {
            this.minCount = options.minCount;
            this.maxCount = options.maxCount;
        }
    }

    get type() {
        return FormControlType.Select;
    }

    get options() {
        return this._options as SelectControlOptions;
    }

    canSetValue(val: any[] | null) {
        const can = super.isNullOrUndefined(val) || Array.isArray(val);
        return can;
    }

    validateCore(required?: boolean) {
        this._errors = [];

        if (!this.disabled) {

            if (required && !this.validateRequired()) {
                return false;
            }

            if (!this.validateMinCount()) {
                return false;
            }

            if (!this.validateMaxCount()) {
                return false;
            }

        }

        return true;
    }

    validateRequired() {
        if (this.required && (!this._value || this._value.length === 0)) {

            super.setError(FormControlErrorCodes.Required);

            return false;
        }

        return true;
    }

    validateMinCount() {
        if (this._value) {

            if (typeof this.minCount === 'number' && this._value.length < this.minCount) {

                super.setError(FormControlErrorCodes.MinCount);

                return false;
            }

        }

        return true;
    }

    validateMaxCount() {
        if (this._value) {

            if (typeof this.maxCount === 'number' && this._value.length > this.maxCount) {

                super.setError(FormControlErrorCodes.MaxCount);

                return false;
            }
        }

        return true;
    }

}
