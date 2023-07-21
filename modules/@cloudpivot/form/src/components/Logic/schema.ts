import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { editableControlOptions } from "@cloudpivot/form/component-schema";
export default {
  $id: "logic",
  type: DataType.Object,
  $ref: editableControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: "控件类型",
    },
    defaultValue: {
      type: DataType.Boolean,
      title: "默认值",
      default: true,
    },
    dataLinkage: {
      type: DataType.String,
      title: "数据联动",
    },
  },
} as ObjectPropertyInfo;
