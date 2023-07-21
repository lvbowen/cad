/*
 * @Author: zhuqiu
 * @Date: 2020-05-19 13:53:54
 * @LastEditTime: 2020-06-02 13:47:07
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\Owner\schema.ts
 */ 
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { styleControlOptions } from "@cloudpivot/form/component-schema";
export default {
  $id: "ownerId",
  type: DataType.Object,
  $ref: styleControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: "控件类型",
    },
    mappings: {
      type: DataType.String,
      title: "映射关系",
    }
  },
} as ObjectPropertyInfo;
