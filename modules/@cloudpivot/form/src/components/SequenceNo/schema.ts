import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { styleControlOptions } from "@cloudpivot/form/component-schema";
export default {
  $id: "sequenceNo",
  type: DataType.Object,
  $ref: styleControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: "控件类型",
    },
    prefix: {
      type: DataType.String,
      title: "流水号编码",
    },
    maxLength: {
      type: DataType.String,
      title: "最大长度",
      default: "6",
    },
    resetDate: {
      type: DataType.String,
      title: "重置策略时间",
      default: "YEAR", //'none' | 'year' | 'month' | 'week' | 'day'
    },
    delimiter: {
      type: DataType.String,
      title: "连接符",
      default: "mark1", // '-' | '#' | '、' | '_' |
    },
  },
} as ObjectPropertyInfo;
