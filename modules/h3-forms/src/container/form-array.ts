
import { Control, ControlOptions } from '../control';

import { ControlContainer } from './control-container';
import { FormControlType } from '../form-control';


export class FormArray extends ControlContainer {

    private _children: Control[];

    constructor(
        children: Control[],
        options?: ControlOptions
    ) {
        super(options);

        if (!children) {
            throw new Error('contrls is invalid');
        }

        this._children = children;
    }

    get children() {
        return this._children;
    }

    get value() {
        const vals = this._children.map(c => c.value);
        return vals;
    }

    set value(vals: any[]) {
        for (let i = 0; i < vals.length; i++) {

            if(vals[i] === undefined){
                continue;
            }
            
            const c = this._children[i];
            c.value = vals[i];
        }
    }

    // get errors() {
    //     const obj: any = {};
    //     this._children.filter(c => c.invalid).forEach((c, i) => {
    //         const errors = (c as any).errors;
    //         obj[i.toString()] = errors;
    //     });
    //     return obj;
    // }

    eachChildren(func: (control: Control) => void) {
        this._children.forEach(func);
    }

    insert(index: number, control: Control) {
        if (index < 0) {
            return;
        }
        this.children.splice(index, 0, control);
        if (this._root) {
            control.init(this._root, this);
        }
        control.update();
    }


    /**
     * 追加
     * @param control 
     * @param index 位置
     */
    append(control: Control) {
        const idx = this.children.length;
        this.insert(idx, control);
    }

    /**
     * 删除
     * @param index 
     */
    remove(index: number) {

        const control = this.children[index];

        if (!control) {
            return;
        }

        control.destroy();
        this.children.splice(index, 1);
    }
}