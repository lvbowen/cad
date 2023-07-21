/*
 * @Date: 2020-06-22 10:20:19
 * @LastEditors: zhuqiu
 * @LastEditTime: 2020-06-22 17:33:01
 * @FilePath: \h3-forms\src\form-control\form-control-factory.ts
 */ 

import { FormControlType, FormControlOptions } from './form-control';

import { DateControl, NumberControl, NumberControlOptions, DateControlOptions } from './value-control';

import { TextControl, TextControlOptions } from './text-control';

import { SelectControl, SelectControlOptions } from './select-control';

import { RadioControl, RadioControlOptions } from './radio-control';

import { TabControl, TabControlOptions } from './tab-control';


export type FormControlCreateOptions = NumberControlOptions | DateControlOptions | TextControlOptions | SelectControlOptions | RadioControlOptions | TabControlOptions;

export type OneFormControl = DateControl | NumberControl | TextControl | SelectControl | RadioControl | TabControl;

export abstract class FormControlFactory {

    static create(type: FormControlType, options?: FormControlCreateOptions) {
        switch (type) {
            case FormControlType.Date:
                return new DateControl(options as DateControlOptions);

            case FormControlType.Number:
                return new NumberControl(options as NumberControlOptions);

            case FormControlType.Text:
                return new TextControl(options as TextControlOptions);

            case FormControlType.Select:
                return new SelectControl(options as SelectControlOptions);

            case FormControlType.Radio:
                return new RadioControl(options as RadioControlOptions);
            case FormControlType.Tab:
                return new TabControl(options as TabControlOptions);
        }
    }

}