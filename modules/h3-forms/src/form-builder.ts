

import { Control, ControlOptions } from './control';

import {
    FormControlType, FormControlFactory, FormControlCreateOptions
} from './form-control';

import { FormGroup, FormArray, FormSheetOptions, FormSheet } from './container';


export type BuildOptions = FormControlBuildOptions | FormSheetOptions | FormGroupBuildOptions | FormArrayBuildOptions;


export interface FormControlBuildOptions {

    type: FormControlType,

    options?: FormControlCreateOptions

}

export interface FormGroupBuildOptions extends ControlOptions {

    children: {
        [key: string]: BuildOptions
    }

}

export interface FormArrayBuildOptions extends ControlOptions {

    children: BuildOptions[];

}

export interface FormBuildOptions {

    [key: string]: BuildOptions;

}



export abstract class FormBuilder {


    static build(options: FormBuildOptions) {

        const group = FormBuilder.buildGroup({
            children: options
        });

        group.init(group);

        group.update();

        return group;
    }


    static buildWhen(options: BuildOptions) {
        const controlOpts = options as FormControlBuildOptions;
        const sheetOpts = options as FormSheetOptions;
        const groupOpts = options as FormGroupBuildOptions;
        const arrayOpts = options as FormArrayBuildOptions;

        let control: Control;

        if (controlOpts.type) {
            control = FormControlFactory.create(controlOpts.type, controlOpts.options) as Control;
        } else if (sheetOpts.columns) {
            control = new FormSheet(sheetOpts);
        } else if (groupOpts.children) {
            if (Array.isArray((options as any).children)) {
                control = FormBuilder.buildArray(arrayOpts);
            } else {
                control = FormBuilder.buildGroup(groupOpts);
            }
        } else {
            throw new Error('options');
        }

        return control;
    }


    static buildArray(options: FormArrayBuildOptions): FormArray {

        const children = options.children.map(c => FormBuilder.buildWhen(c));

        const opts = Object.assign({}, options);
        // @ts-ignore
        delete opts.children;

        return new FormArray(children, opts);
    }


    static buildGroup(options: FormGroupBuildOptions): FormGroup {

        const children: { [key: string]: Control } = {};

        for (const key in options.children) {
            const control = FormBuilder.buildWhen(options.children[key]);
            control.id = key;
            children[key] = control;
        }

        const opts = Object.assign({}, options);
        // @ts-ignore
        delete opts.children;

        return new FormGroup(children, opts);
    }

}