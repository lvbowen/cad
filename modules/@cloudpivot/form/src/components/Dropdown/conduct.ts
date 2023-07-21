import {
  ControllerConduct,
  ControlAttributeType,
  DataType,
} from "@cloudpivot/form/typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from "@cloudpivot/form/utils";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
import ShortText from "../ShortText";
import Radio from "../Radio";
import Checkbox from "../Checkbox";
import Dropdown from "./index";
import LongText from "../LongText";
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
        "readonlyFormula",
        "options",
        "displayEmpty",
        "emptyValue",
        "multi",
        "dataLinkage",
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
      value: FormControlType.Dropdown,
      options: {
        // Todo 将控件编码 换成 说明文字, 创建所有组件的 编码说明文件
        list: (DT: number, DataItem: any, Control: any) => {
          if (DT === DataItemType.ShortText) {
            return [
              {
                value: ShortText.info.formControllerType,
                label: ShortText.info.title,
              },
              {
                value: Radio.info.formControllerType,
                label: Radio.info.title,
              },
              {
                value: Checkbox.info.formControllerType,
                label: Checkbox.info.title,
              },
              {
                value: Dropdown.info.formControllerType,
                label: Dropdown.info.title,
              },
              // {
              //   value: '11',
              //   label: '位置'
              // }
            ];
          } else {
            return [
              {
                value: LongText.info.formControllerType,
                label: LongText.info.title,
              },
              {
                value: Dropdown.info.formControllerType,
                label: Dropdown.info.title,
              },
            ];
          }
        },
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
    dataLinkage: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/data-linkage.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 默认值
    defaultValue: {
      options: {
        transaction({ attr, attrs, displayFields }: any) {
          // const type = 0;
          if (attr.dataItem && attr.dataItem.type === 1) {
            delete attr.options.regexps;
          }
          // debugger;
        },
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
      inputComponent: () =>
        import(
          "@cloudpivot/form/src/common/components/add-checkbox-opiton.vue"
        ),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 是否显示空选项
    displayEmpty: {
      options: {
        hideField: (value: string) => {
          if (!value) {
            return ["emptyValue"];
          } else {
            return [];
          }
        },
      },
    },
    // 空选项显示值
    emptyValue: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: "长度不能超过200字节",
          },
        },
      },
    },
    // 是否多选
    multi: {
      options: {
        transaction: ({ attr, attrs }: any) => {
          const optionsAttr = attrs.find((_attr: any) => {
            return _attr.field == "options";
          });

          // if (attr.value) {
          //   try {
          //     JSON.parse(optionsAttr.value);
          //     optionsAttr.value = "";
          //   } catch {}
          // }
          optionsAttr.attrType = attr.value
            ? "checkboxOption"
            : "bizRadioOption";
          optionsAttr.options.inputComponent = () =>
                import(
                  "@cloudpivot/form/src/common/components/biz-radio-option.vue"
                );
          // optionsAttr.options.inputComponent = attr.value
          //   ? () =>
          //       import(
          //         "@cloudpivot/form/src/common/components/add-checkbox-opiton.vue"
          //       )
          //   : () =>
          //       import(
          //         "@cloudpivot/form/src/common/components/biz-radio-option.vue"
          //       );
        },
      },
    },
  },
} as ControllerConduct;
