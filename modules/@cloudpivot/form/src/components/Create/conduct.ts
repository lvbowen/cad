/*
 * @Author: zhuqiu
 * @Date: 2020-05-19 13:53:54
 * @LastEditTime: 2020-06-02 13:45:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\Create\conduct.ts
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
      label: "控制属性",
      keys: [
        "mappings"
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
      ...baseAttribute.widgetType,
      value: "创建人",
    },
    mappings: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/user-selection-map.vue"),
      options: {},
    },
  },
} as ControllerConduct;
