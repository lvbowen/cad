import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { styleControlOptions } from "@cloudpivot/form/component-schema";
export default {
  $id: "createdDeptId",
  type: DataType.Object,
  $ref: styleControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: "控件类型",
    },
  },
} as ObjectPropertyInfo;
