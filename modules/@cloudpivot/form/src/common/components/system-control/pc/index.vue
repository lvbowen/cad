<!--
 * @Author: your name
 * @Date: 2020-04-22 13:53:21
 * @LastEditTime: 2020-06-10 20:16:03
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\common\components\system-control\pc\index.vue
 -->

<template>
  <div class="field">
    <div class="field__label" :style="style">
      {{ label }}
      <a-tooltip
        placement="top"
        v-if="tips"
        style="margin: 5px 0 0 2px;"
      >
        <template slot="title">
          <span>{{ tips }}</span>
        </template>
        <a-icon type="question-circle"/>
      </a-tooltip>
    </div>
    <div class="field__control">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import { Icon, Tooltip } from "@h3/antd-vue";

import { SystemControl } from "../controls/system-control";

import { userApi } from "@cloudpivot/api";

import { StaffSelectorMapping } from '@cloudpivot/form/src/common/components/form-staff-selector/staff-selector-mappings';

@Component({
  name: "system-control",
  components: {
    AIcon: Icon,
    ATooltip: Tooltip
  }
})
export default class PcSystemControl extends SystemControl {
  
  created() {
    this.getUserInfo();
  }
  
  async getUserInfo(){
    // 修改人、创建人 支持属性映射功能-- 获取当前人的用户信息
    let mappings: string = this.control.options.mappings || "";
    let value: any = this.control.value;
    let query: any = this.$route.query;
    if(mappings && value && Array.isArray(value)){
      // 流程表单状态不执行映射
      if(query.isWorkFlow || query.edit){
        return;
      }
      if(this.control.writable){
        let { data } = await userApi.getUserInfo(value[0].id);
        this.ctrl.value = [data];
        StaffSelectorMapping.mappingOperate(this.ctrl.value,mappings,this);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.field.system > .field__label {
  // justify-content: flex-end;
  position: relative;
  flex: 0 0 102px;
}
.field__label,
.field__control {
  color: rgba(0, 0, 0, 0.45);
}

.ant-col > div.field.system.vertical .field__label {
  padding-left: 12px;
  font-size: 12px;
  font-weight: 900;
}

.ant-col > div.field.system.vertical .field__control {
  padding-left: 20px;
  padding-top: 5px;
}

.field__label::after {
  // content: ":";
}
i > svg {
  margin-top: -2px;
}
</style>
