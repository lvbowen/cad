/*
 * @Author: Fan
 * @Date: 2020-04-19 19:31:21
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
import { utils } from "@cloudpivot/common";

const DateHandle = utils.DateHandle;
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
        "format",
        "verifyFormula",
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
      ...baseAttribute.widgetType,
      value: "日期",
    },
    defaultValue: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "none",
            label: "空",
          },
          {
            value: "current",
            label: "当前时间",
          },
          {
            value: "dataItemDefault",
            label: "数据项默认值",
          },
        ],
      },
    },
    displayFormula: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "showRule",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
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
    format: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          // {
          //   value: "YYYY",
          //   label: DateHandle.dateFormat(new Date(), "YYYY"),
          // },
          {
            value: "YYYY-MM",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM"),
          },
          // {
          //   value: "MM-DD",
          //   label: DateHandle.dateFormat(new Date(), "MM-DD"),
          // },
          {
            value: "YYYY-MM-DD",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD"),
          },
          {
            value: "YYYY-MM-DD HH:mm",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD HH:mm"),
          },
          {
            value: "YYYY-MM-DD HH:mm:ss",
            label: DateHandle.dateFormat(new Date(), "YYYY-MM-DD HH:mm:ss"),
          },
          // {
          //   value: "HH:mm",
          //   label: DateHandle.dateFormat(new Date(), "HH:mm"),
          // },
          // {
          //   value: "HH:mm:ss",
          //   label: DateHandle.dateFormat(new Date(), "HH:mm:ss"),
          // },
        ],
      },
    },
    verifyFormula: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import(
          "@cloudpivot/form/src/common/components/verify-formula-date.vue"
        ),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
  },
} as ControllerConduct;
