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
      keys: ["format"],
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
      value: "修改时间",
    },
    format: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
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
        ],
      },
    },
  },
} as ControllerConduct;
