import Vue, { VNode } from "vue";
import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
import { FormControlType } from "@cloudpivot/form/schema";
import {
  StaffSelectorSelectType,
  StaffSelectorValueType,
  DisplayType,
} from "@cloudpivot/form/src/common/component-schema/complex-control-options";
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "visible", "style", "tips", "dataItemName", "widgetType"],
    },
    controller: {
      label: "控制属性",
      keys: [
        "displayFormula",
        "requiredFormula",
        "readonlyFormula",
        "multi",
        "deptVisible",
        "defaultValue",
        "defaultValueType",
        "orgRoot",
        "orgRootValueType",
        "recursive",
        "roles",
        "mappings",
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
      value: "选人控件",
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
    // 是否必填
    requiredFormula: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterRequiredFormula,
      },
    },
    //是否多选
    multi: {
      inputMethod: ControlAttributeType.Dropdown,
      value: "false",
      options: {
        list: [
          {
            value: "false",
            label: "单选",
          },
          {
            value: "true",
            label: "多选",
          },
        ],
        // fieldDisplay: [["mappings"], []],
        hideField: (val: string) => {
          if (val === "true") {
            return ["mappings"];
          }
          return [];
        },
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
    //可选类型
    deptVisible: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "all",
            label: "全部",
          },
          {
            value: "user",
            label: "用户",
          },
          {
            value: "org",
            label: "组织",
          },
        ],
        transaction: ({ attr, attrs, displayFields }: any) => {
          const defaultValueType = attrs.find(
            (attrItem: any) => attrItem.field === "defaultValueType"
          );
          if (attr.value == "user") {
            // displayFields.push(...['orgRoot', 'recursive']);
            defaultValueType.options.list = [
              {
                value: "",
                label: "空",
              },
              {
                value: "originator",
                label: "发起人",
              },
            ];
          } else if (attr.value == "org") {
            displayFields.push(...["roles", "mappings"]);
            defaultValueType.options.list = [
              {
                value: "",
                label: "空",
              },
              {
                value: "originatorDept",
                label: "发起人部门",
              },
            ];
          }
        },
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          vm.updateAttribute(key, "defaultValueType", "");
        },
      },
    },
    defaultValueType: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "UserSelectValueSetting",
      inputComponent: () =>
        import(
          "@cloudpivot/form/src/common/components/user-select-value-setting.vue"
        ),
      options: {
        hideField: ["defaultValue"],
        importModal: (attr: any, attrs: any) => {
          const opts: any = {};

          attrs.forEach((attrItem: any) => {
            opts[attrItem.field] = attrItem.value;
          });

          return opts;
        },
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          const val =
            attr.value === StaffSelectorValueType.None
              ? attrs.find((a: any) => a.field === "defaultValue").value
              : null;
          vm.updateAttribute(key, "defaultValue", val);
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: Vue
        ) => {
          const val =
            data.type === StaffSelectorValueType.None ? data.value : null;
          vm.$emit("change", "defaultValue", val);
          return data.type;
        },
        formatter: (valueType: string, attrs: any) => {
          let text = "";

          switch (valueType) {
            case StaffSelectorValueType.None:
              let staff = attrs.find((a: any) => a.field === "defaultValue")
                .value;
              if (staff) {
                if (typeof staff === "string") {
                  staff = JSON.parse(staff);
                }
                text = staff.map((x: any) => x.name).join(";");
              }
              break;
            case StaffSelectorValueType.Originator:
              text = "创建人";
              break;
            case StaffSelectorValueType.OriginatorDept:
              text = "创建人部门";
              break;
          }

          return text;
        },
      },
    },
    orgRootValueType: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "UserSelectOrgValueSetting",
      inputComponent: () =>
        import(
          "@cloudpivot/form/src/common/components/user-select-value-setting.vue"
        ),
      options: {
        hideField: ["orgRoot"],
        importModal: (attr: any, attrs: any) => {
          const opts: any = {};

          attrs.forEach((attrItem: any) => {
            opts[attrItem.field] = attrItem.value;
          });

          return opts;
        },
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          const val = attrs.find((a: any) => a.field === "orgRoot").value;
          vm.updateAttribute(key, "orgRoot", val);
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: Vue
        ) => {
          const val = data.value;
          vm.$emit("change", "orgRoot", val);
          return data.type;
        },
        formatter: (valueType: string, attrs: any) => {
          let orgRoot = attrs.find((a: any) => a.field === "orgRoot").value;

          let text = "";

          switch (valueType) {
            case StaffSelectorValueType.None:
              if (orgRoot) {
                if (typeof orgRoot === "string") {
                  orgRoot = JSON.parse(orgRoot);
                }
                text = orgRoot.map((x: any) => x.name).join(";");
              }
              break;
            case StaffSelectorValueType.OriginatorDept:
              text = "创建人部门";
              break;
            case StaffSelectorValueType.Ref:
              if (typeof orgRoot === "string") {
                text = orgRoot;
              }
              break;
          }

          return text;
        },
      },
    },
    roles: {
      inputMethod: ControlAttributeType.SelectTree,
    },
    mappings: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/user-selection-map.vue"),
      options: {},
    },
  },
} as ControllerConduct;
