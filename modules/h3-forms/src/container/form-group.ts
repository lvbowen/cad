

import { Control, ControlOptions } from '../control';


import { ControlContainer } from './control-container';
import { FormControlType } from '../form-control';


export interface FormGroupChildren {

    [key: string]: Control

}


export class FormGroup extends ControlContainer {

    private _children: FormGroupChildren;

    constructor(
        children: FormGroupChildren | Control[],
        options?: ControlOptions
    ) {
        super(options);

        if (!children) {
            throw new Error('contrls is invalid');
        }

        if (Array.isArray(children)) {
            const map: any = {};
            children.forEach(c => {
                if (c.id) {
                    map[c.id] = c;
                }
            });
            this._children = map;
        } else {
            this._children = children;
        }
    }

    get children() {
        return this._children;
    }

    eachChildren(func: (control: Control) => void) {
        for (const key in this._children) {
            func(this._children[key]);
        }
    }

    // get errors() {
    //     const obj: any = {};
    //     this.eachChildren(c => {
    //         if (c.invalid) {
    //             const errors = (c as any).errors;
    //             obj[<any>c.id] = errors;
    //         }
    //     });
    //     return obj;
    // }

    get value() {
        const obj: any = {};
        this.eachChildren(c => {
            // if (c.display && c.id) {
            if (c.id) {
                obj[c.id] = c.value;
            }
        });
        return obj;
    }

    set value(val: { [key: string]: any }) {
        this.eachChildren(c => {
            if (c.id && val[c.id] !== undefined) {
                c.value = val[c.id];
            }
        });
    }

    append(controls: FormGroupChildren) {

        const keys = Object.keys(controls);

        if (keys.some(k => !!this._children[k])) {
            throw new Error(`FormGroup append: control already exist`);
        }

        for (const key of keys) {
            this._children[key] = controls[key];
        }

        keys.forEach(k => this._children[k].init(this._root as any, this));

        keys.forEach(k => this._children[k].update());
    }

    remove(...keys: string[]) {

        for (const key of keys) {

            const child = this._children[key];
            if (!child) {
                continue;
            }

            child.destroy();
            delete this._children[key];
        }

    }

}