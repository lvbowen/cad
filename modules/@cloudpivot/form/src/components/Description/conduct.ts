import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
import { formatterValueToSetStatus } from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";

export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "style"],
    },
    controller: {
      label: "控制属性",
      keys: ["align", "displayFormula"],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
    },
    style: {
      ...baseAttribute.style,
    },
    align: {
      inputMethod: ControlAttributeType.Dropdown,
      value: "left",
      options: {
        list: [
          {
            value: "left",
            label: "左",
          },
          {
            value: "center",
            label: "中",
          },
          {
            value: "right",
            label: "右",
          },
        ],
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
  },
} as ControllerConduct;
