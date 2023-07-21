import Vue, { VNode } from "vue";
import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
import { formatterValueToSetStatus } from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";

export default {
  groups: {
    controller: {
      label: "控制属性",
      keys: ["heads","tabDefaultValue"],
    },
  },
  properties: {
    // 显示条件
    heads: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/tabs-heads-setting.vue"),
      options: {
        formatter: formatterValueToSetStatus,
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: Vue
        ) => {
          const field: string = attr.attrType;
          if (!!field) {
            callback(field, data.default);
          }
          // 设置tab标签页默认选项的值
          const source: any = attrs.find((a: any) => a.field === "heads");
          const tabs: any = attrs.find((a: any) => a.field === "tabDefaultValue");
          if(source && tabs){
            const keys: any = data.value.find((d: any) => d.key === tabs.value);
            if(!keys){
              tabs.value = "";
            }
          }
          vm.$emit("change", "tabDefaultValue", tabs.value);
          return data && data.value ? data.value : "";
        }
      }
    },
    tabDefaultValue: {
      inputMethod: ControlAttributeType.Dropdown,
      value: "",
      options: {
        allowClear: true,
        list: (attrs: any) => {
          return attrs.options.heads.map((p: any) => {
            return {
              value: p.key,
              label: p.title
            }
          });
        }
      }
    }
  },
} as ControllerConduct;
