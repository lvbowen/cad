/*
 * @Author: Fan
 * @Date: 2020-04-13 17:06:58
 * @LastEditTime: 2020-07-06 18:13:20
 * @LastEditors: zhuqiu
 * @Description:
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\RelevanceFormMulti\conduct.ts
 */
import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
// import { DataItemType } from "../../typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
// import RequiredCondition from "@cloudpivot/form/src/common/components/required-condition.vue";
import { FormControlType, DataItemType } from "@cloudpivot/form/schema";

import { listApi } from "@cloudpivot/api";
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "visible", "style", "tips", "dataItemName", "widgetType"],
    },
    controller: {
      label: "控件属性",
      keys: [
        "displayFormula",
        "requiredFormula",
        "schemaCode",
        "queryCode",
        "displayField",
        "mappings",
        "conditions",
        "mobileConditions",
        "linkMode",
        "selectMode",
        "showField",
        "isAuthorize",
        "defaultVal",
        "isScan",
        "dataLinkage",
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
      value: "关联多选",
    },
    // 显示条件
    displayFormula: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "showRule",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 是否必填
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
    schemaCode: {
      inputMethod: ControlAttributeType.Tree,
      options: {
        formatter: formatterRequiredFormula,
        hideField: (value: string) => {
          return !value ? ["queryCode"] : [];
        },
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          vm.updateAttribute(key, "queryCode", "");
          vm.updateAttribute(key, "displayField", "name");
          vm.updateAttribute(key, "showField", []);
          vm.updateAttribute(key, "conditions", "");
          vm.updateAttribute(key, "mappings", "");
        },
      },
    },
    queryCode: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        dataList: (attr: any, attrs: any, vm: any) => {
          const appCode = vm.$route.params.appCode; // 集成组要求 加入当前应用code
          const schemaCode = attrs.find((a: any) => a.field === "schemaCode")
            .value;
          return listApi.getListConfigList(schemaCode, undefined, appCode).then(
            (res) => {
              if (res.errcode === 0) {
                const d = res.data
                  .filter((l: any) => l.publish)
                  .map((x: any) => ({
                    value: x.code,
                    label: x.name,
                  }));
                // if (d.length && !attr.value) {
                //   attr.value = d[0].value;
                // }
                return d;
              }
              return [];
            },
            () => Promise.resolve([])
          );
        },
        hideField: (value: string) => {
          return !value ? ["conditions"] : [];
        },
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          vm.updateAttribute(key, "conditions", "");
        },
      },
    },
    displayField: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        dataList(attr: any, attrs: any) {
          const schemaCode = attrs.find((a: any) => a.field === "schemaCode")
            .value;
          const { dataItem } = attr;
          if (
            dataItem.relativePropertyCode &&
            attr.value !== dataItem.relativePropertyCode
          ) {
            attr.value = dataItem.relativePropertyCode;
          }
          if (schemaCode) {
            return listApi
              .getDataItemList({
                schemaCode,
                isPublish: true,
              })
              .then(
                (res) => {
                  let isDefault = false;
                  if (res.errcode === 0) {
                    const d: any[] = [];
                    const ignoreDateItem = [
                      DataItemType.Attachment,
                      DataItemType.Sheet,
                      DataItemType.RelevanceForm,
                      DataItemType.RelevanceFormEx,
                    ];
                    for (const item of res.data) {
                      if (
                        !~ignoreDateItem.indexOf(item.propertyType) &&
                        item.code !== "ownerDeptQueryCode"
                      ) {
                        d.push({
                          value: item.code,
                          label: item.name,
                        });
                      }
                      // 判断关联的显示字段是否被删除
                      if (item.code === attr.value) {
                        isDefault = true;
                      }
                    }
                    if (!isDefault) attr.value = "name";
                    if (!attr.value) attr.value = "name";
                    if (d.length === 0){
                      d.push({
                        label: "数据标题",
                        value: "name"
                      })
                    }
                    return d;
                  }
                  return [];
                },
                () => {
                  attr.value = "";
                  return Promise.resolve([]);
                }
              );
          } else {
            attr.value = "";
            return Promise.resolve([]);
          }
        },
      },
    },
    mappings: {
      modalType: "mapping",
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/query-condition.vue"),
      options: {
        importModal: (attr: any, attrs: any) => {
          const queryCodeAttr = attrs.find((a: any) => a.field === "queryCode");
          const queryCode = queryCodeAttr.value;
          const schemaCode = attrs.find((a: any) => a.field === "schemaCode")
            .value;
          const query = attrs.find((a: any) => a.field === "conditions").value;

          return {
            schemaCode,
            queryCode,
            dataItem: queryCodeAttr.dataItem,
            type: "mapping",
            value: {
              query: query,
              mapping: attr.value,
            },
          };
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: any
        ) => {
          vm.$emit("change", "conditions", data.value.query); //改变属性需要提交
          //
          return data.value.mapping;
        },
        formatter: formatterValueToSetStatus,
      },
    },
    conditions: {
      modalType: "query",
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/query-condition.vue"),
      options: {
        importModal: (attr: any, attrs: any) => {
          const queryCodeAttr = attrs.find((a: any) => a.field === "queryCode");
          const queryCode = queryCodeAttr.value;
          const schemaCode = attrs.find((a: any) => a.field === "schemaCode")
            .value;
          const mapping = attrs.find((a: any) => a.field === "mappings").value;

          return {
            schemaCode,
            queryCode,
            dataItem: queryCodeAttr.dataItem,
            type: "query",
            value: {
              query: attr.value,
              mapping: mapping,
            },
          };
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: any
        ) => {
          vm.$emit("change", "mappings", data.value.mapping); //改变属性需要提交
          //
          return data.value.query;
        },
        formatter: formatterValueToSetStatus,
      },
    },
    mobileConditions: {
      modalType: "onlyQuery",
      clientType: "APP",
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/query-condition.vue"),
      options: {
        importModal: (attr: any, attrs: any) => {
          const queryCodeAttr = attrs.find((a: any) => a.field === "queryCode");
          const queryCode = queryCodeAttr.value;
          const schemaCode = attrs.find((a: any) => a.field === "schemaCode")
            .value;
          // const mapping = attrs.find((a: any) => a.field === 'mappings').value;

          return {
            schemaCode,
            queryCode,
            dataItem: queryCodeAttr.dataItem,
            type: "onlyQuery",
            clientType: "APP",
            value: {
              query: attr.value,
              // mapping: mapping
            },
          };
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: any
        ) => {
          return data.value.query;
        },
        formatter: formatterValueToSetStatus,
      },
    },
    selectMode: {
      inputMethod: ControlAttributeType.Dropdown,
      value: "popup",
      options: {
        hideField: (value: string) => {
          return value === "dropdown" ? ["showField"] : [];
        },
        list: [
          {
            value: "popup",
            label: "弹出框",
          },
          {
            value: "dropdown",
            label: "下拉框",
          },
        ],
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          const showField = attrs.find((a: any) => a.field === "showField")
            .value;
          vm.updateAttribute(
              key,
              "showField",
              showField && showField.length > 0
                  ? showField
                  : []
          );
        },
      },
    },
    showField: {
      value: [],
      type: ControlAttributeType.Array,
      options: {
        dataList(attr: any, attrs: any) {
          const schemaCode = attrs.find((a: any) => a.field === "schemaCode")
              .value;
          if (schemaCode) {
            return listApi
                .getDataItemList({
                  schemaCode,
                  isPublish: true,
                })
                .then(
                    (res) => {
                      if (res.errcode === 0) {
                        const queryCopy = res.data
                            ? JSON.parse(JSON.stringify(res.data))
                            : [];
                        return queryCopy
                            .map((x: any, i: any) => x)
                            .filter((x: any, i: any) => {
                        const ignoreType = [1, 6, 7]; // type代表控件类型: 屏蔽长文本、附件、审批意见、子表
                        return !ignoreType.includes(x.type);
                      });
                  }
                  return [];
                },
                () => {
                  attr.value = "";
                  return Promise.resolve([]);
                }
              );
          } else {
            attr.value = "";
            return Promise.resolve([]);
          }
        },
      },
      label: "弹出框字段",
    },
    defaultVal: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import(
          "@cloudpivot/form/src/common/components/relevance-form-default-value.vue"
        ),
      options: {
        importModal: (attr: any, attrs: any) => {
          const queryCodeAttr = attrs.find((a: any) => a.field === "queryCode");
          const queryCode = queryCodeAttr.value;
          const schemaCode = attrs.find((a: any) => a.field === "schemaCode")
            .value;
          // const query = attrs.find((a: any) => a.field === "conditions").value;

          return {
            schemaCode,
            queryCode,
            dataItem: queryCodeAttr.dataItem,
            type: "mapping",
            value: {
              query: attr.value,
              // mapping: attr.value
            },
          };
        },
      },
    },
  },
} as ControllerConduct;
