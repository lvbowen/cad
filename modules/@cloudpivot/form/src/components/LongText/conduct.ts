/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:29
 * @description:
 * @LastEditors: zhuqiu
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
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "visible", "style", "tips", "dataItemName", "widgetType"],
    },
    controller: {
      label: "控件属性",
      keys: [
        "defaultValue",
        "displayFormula",
        "requiredFormula",
        "readonlyFormula",
        "textAreaType",
        "maxLength",
        "placeholder",
        "currentMaxLength",
        "dataLinkage"
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
      value: 2,
      options: {
        list: [
          {
            value: 2,
            label: "长文本",
          },
          {
            value: 7,
            label: "下拉框",
          },
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
        regexps: {
          maxLength: {
            len: 2000,
            message: "长度不能超过2000字节",
          },
        },
      },
    },
    // 提示文字
    placeholder: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: "长度不能超过200字节",
          },
        },
      },
    },
    // 文本最大长度
    maxLength: {
      options: {
        regexps: {
          required: "最大长度不能为空",
          regexps: [
            {
              regexp: /^[1-9]\d*$/,
              message: "只能输入正整数",
            },
            {
                regexp: (value: string) => parseFloat(value) <= 2000,
                message: "最大长度不能超过2000",
              },
            ],
          },
        },
      },
    // 富文本最大字数限制
    currentMaxLength: {
      options: {
        regexps: {
          required: "字数限制不能为空",
          regexps: [
            {
              regexp: /^[1-9]\d*$/,
              message: "只能输入正整数",
            },
            {
              regexp: (value: string) => parseFloat(value) <= 2e7,
              message: "最大字数不能超过" + 2e7,
            },
          ],
        },
      },
    },
    textAreaType: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "longText",
            label: "多行文本",
          },
          {
            value: "current",
            label: "富文本",
          },
        ],
        hideField: (attr: any) => {
          if (!attr || attr === "longText") {
            return ["currentMaxLength"];
          } else {
            return ["placeholder", "maxLength"];
          }

          // (attr ? [] : ["imageQuality"])
        },
      },
    },
  },
} as ControllerConduct;
