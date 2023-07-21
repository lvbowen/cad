/*
 * @Author: Fan
 * @Date: 2020-04-19 20:11:49
 * @description:
 * @LastEditors: Fan
 */
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import {
  inputControlOptions,
  NumberFormatType,
} from "@cloudpivot/form/component-schema";
export default {
  $id: "number",
  type: DataType.Object,
  $ref: inputControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: "控件类型",
    },
    defaultValue: {
      type: DataType.String,
      title: "默认值",
      default: "",
    },
    placeholder: {
      type: DataType.String,
      title: "提示文字",
      default: "请输入",
    },
    format: {
      type: DataType.String,
      title: "数值格式",
      default: NumberFormatType.Int,
    },
    computeFormula: {
      type: DataType.String,
      title: "计算规则",
    },
    verifyFormula: {
      type: DataType.String,
      title: "提交校验规则",
    },
    dataLinkage: {
      type: DataType.String,
      title: "数据联动",
    },
  },
} as ObjectPropertyInfo;
