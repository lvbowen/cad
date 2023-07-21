import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { styleControlOptions } from "@cloudpivot/form/component-schema";
export default {
  $id: "modifiedTime",
  type: DataType.Object,
  $ref: styleControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: "控件类型",
    },
    format: {
      type: DataType.String,
      title: "显示格式",
      default: "YYYY-MM-DD HH:mm:ss",
    },
  },
} as ObjectPropertyInfo;
