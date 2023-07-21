/*
 * @Date: 2020-06-22 13:47:15
 * @LastEditors: zhuqiu
 * @LastEditTime: 2020-07-15 17:39:04
 * @FilePath: \h3-forms\src\form-control\tab-control.ts
 */ 
import {
    FormControl, FormControlOptions, FormControlErrorCodes, FormControlType
} from './form-control';

import { ContainerLike } from "../container-like";

import {
    ExpressionParser
} from '../expression';

export interface TabControlOptions extends FormControlOptions<any> {
    /**
    * 切换条件
    */
    changeFormula?: any;
}

export class TabControl extends FormControl<any>{
    constructor(options?: TabControlOptions) {
        super(options);
    }

    get type() {
        return FormControlType.Tab;
    }

    get options() {
        return this._options as TabControlOptions;
    }

    init(root: ContainerLike, parent: ContainerLike) {
        super.init(root, parent);
        
        if (this.options) {
          this.subscribeTabRefs(root,parent);
        }
      }
    
      update(noInitValue?: boolean) {
        super.update(noInitValue);
    
        if (this.options && this.options.changeFormula) {
          this.calculateChangeFormulaValue(this.options.changeFormula);
        }
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

    protected subscribeTabRefs(root: ContainerLike, parent?: ContainerLike) {
        const formula = this.options.changeFormula;
        if(!formula){
            return
        }
        const keys: Array<any> = [];
        for(const key in formula){
            const formulaReult = ExpressionParser.parseConditionExp(formula[key]);
            if(formulaReult){
                keys.push(...formulaReult.keys); 
            }
        }
        const _this = this;
        const func = () => {
            _this.calculateChangeFormulaValue(formula);
        };
        this.subscribeControlValueChange(keys, root, parent, func);
    }

    /**
   * 计算切换表达式属性的值
   */
    
    protected calculateChangeFormulaValue(formula: any) {
        if (!this._options) {
            return;
        }
        if(!this._refControls){
            return;
        }
        for(const key in this._refControls){
            const control = this._refControls[key] as any;
            control.valueChange.subscribe((change: any) => {
                if(change){
                    for(const formulaKey in formula){
                        //获取与当前值改变的控件相关的表达式
                        if(formula[formulaKey].indexOf(key) > -1){
                            const formulaReult = ExpressionParser.parseConditionExp(formula[formulaKey]);
                            if(formulaReult){
                                const val = super.callCalculateFunc(formulaReult);
                                if(val){
                                    this.value = formulaKey;
                                    break;
                                }
                            }
                       }
                    }
                }
            })
        }
        
    } 
}