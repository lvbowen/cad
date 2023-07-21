/*
 * @Author: Fan
 * @Date: 2020-04-16 20:44:03
 * @description:
 * @LastEditors: Fan
 */
import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
import { FormControlType } from "@cloudpivot/form/schema";
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "visible", "style", "tips", "dataItemName", "widgetType"],
    },
    controller: {
      label: "控制属性",
      keys: [
        "defaultValue",
        "displayFormula",
        "requiredFormula",
        "options",
        "direction",
        "dataLinkage",
        "displaySetting"
      ],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
    },
    dataItemName: {
      ...baseAttribute.dataItemName,
    },
    style: {
      ...baseAttribute.style,
    },
    widgetType: {
      inputMethod: ControlAttributeType.Dropdown,
      value: FormControlType.Checkbox,
      options: {
        // Todo 将控件编码 换成 说明文字, 创建所有组件的 编码说明文件
        list: [
          {
            value: 1,
            label: "单行文本",
          },
          {
            value: 5,
            label: "单选框",
          },
          {
            value: 6,
            label: "复选框",
          },
          {
            value: 7,
            label: "下拉框",
          },
          // {
          //   value: '11',
          //   label: '位置'
          // }
        ],
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          const opts = vm.controlAttributeColumns.find((res: any) => {
            return res.field === "options";
          });
          if (opts) {
            try {
              if (vm.allControls.control.type !== 7) {
                JSON.parse(opts.value);
                vm.allControls.control.options.options = "选项1;选项2;选项3";
              }
            } catch {}
          }
        },
      },
    },
    // 显示条件
    displayFormula: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "showRule",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 是否必填
    requiredFormula: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterRequiredFormula,
      },
    },
    // 默认值
    defaultValue: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: "长度不能超过200字节",
          },
        },
      },
    },
    // 选项
    options: {
      inputMethod: ControlAttributeType.Modal,
      attrType: "checkboxOption",
      inputComponent: () =>
        import(
          "@cloudpivot/form/src/common/components/add-checkbox-opiton.vue"
        ),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    dataLinkage: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/data-linkage.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    direction: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "horizontal",
            label: "横向",
          },
          {
            value: "vertical",
            label: "纵向",
          },
        ],
      },
    },
    // 显示设置
    displaySetting: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "showSelected",
            label: "勾选项",
          },
          {
            value: "showAllOption",
            label: "全部项",
          },
        ],
      },
    }
  },
} as ControllerConduct;
