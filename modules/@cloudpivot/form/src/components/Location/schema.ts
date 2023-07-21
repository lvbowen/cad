/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:13
 * @description:
 * @LastEditors: Fan
 */
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import {
  inputControlOptions,
  TextAreaType,
} from "@cloudpivot/form/component-schema";
export default {
  $id: "location",
  type: DataType.Object,
  $ref: inputControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.Number,
      title: "控件类型",
    },
    range: {
      type: DataType.String,
      title: "精确范围",
    },
    displayMode: {
      type: DataType.String,
      title: "显示模式",
      default: "accurate",
    },
    autoGetLocation: {
      type: DataType.String,
      title: "自动获取位置",
      default: "false",
    },
  },
} as ObjectPropertyInfo;
