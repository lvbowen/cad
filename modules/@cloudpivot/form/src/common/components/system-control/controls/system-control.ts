/*
 * @Author: your name
 * @Date: 2020-04-22 16:49:33
 * @LastEditTime: 2020-04-22 17:40:03
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\common\components\system-control\controls\system-control.ts
 */

import {
    RendererFormControl,
    StyleControlOptions,
    FormControlType,
    CreatedTimeOptions
  } from "@cloudpivot/form/src/typings";
  
  import { BaseControl } from "@cloudpivot/form/src/common/controls/base-control";
  
  import { dateFormatter } from '@cloudpivot/form/utils';

export class SystemControl extends BaseControl<StyleControlOptions> {

    get text() {
        let val = this.ctrl.value;
        const ct = this.control.type;
        if (
          ct === FormControlType.CreatedTime ||
          ct === FormControlType.ModifiedTime
        ) {
          if (!val) {
            val = new Date();
          }
          const format = (this.controlOpts as CreatedTimeOptions).format;
          return dateFormatter(val, format);
        }
    
        if (Array.isArray(val)) {
          return val.length > 0 ? val[0].name : "";
        }else if (val && typeof val === "object") {
          return val.name;
        } else {
          return val || this.$t('cloudpivot.form.runtime.biz.systemValue');
        }
    }

    get tips() {
      const { tips } = this.control.options;
      return tips;
    }
  }