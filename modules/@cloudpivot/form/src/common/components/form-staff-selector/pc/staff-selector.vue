<!--
 * @Author: your name
 * @Date: 2020-04-22 14:02:14
 * @LastEditTime: 2020-05-21 15:15:09
 * @LastEditors: Fan
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\common\components\form-staff-selector\pc\staff-selector.vue
 -->

<template>

  <SmartOrg
    :org="org"
    :isExport="options.isExport"
    :isDisplayRoot="options.isDisplayRoot"
    :selectOrg="options.selectOrg"
    :selectUser="options.selectUser"
    :showModel="options.showModel"
    :showSelect="options.showSelect"
    :isMulpitle="options.mulpitle"
    :title="options.title"
    :keepDeptIds="keepDeptIds"
    :selectedData="selected"
    :searchData="searchList"
    :departmentsTotal="departmentsTotal"
    :usersTotal="usersTotal"
    :orgName="options.key"
    :selectPlaceholder="options.placeholder || placeholder"
    :placeholder="SearchPlaceholder"
    :showPart="onlyForm"
    :allowRecursion="false"
    :locale="locale"
    :disabled="disabled"
    :showLoading="showLoading"
    :isDisableClick="isDisableClick"
    :projectId="options.projectId"
    :majors="options.majors"
    :certifications="options.certifications"
    @focus="treeFocus"
    @onClickBreadcrumb="onClickBreadcrumb"
    @change="onChange"
    @onSearch="onSearch"
    @onClickTrunBack="onClickTrunBack"
    @onClickNextHierarchy="onClickNextHierarchy"
    @ok="onOk"
    @cancle="onCancle"
    @changeRoles="changeRoles"
  ></SmartOrg>

</template>

<script lang="ts">
import { Component } from "vue-property-decorator";

import SmartOrg from "./smart-org/smartOrg.vue";

import { StaffSelectorBase } from "../staff-selector-base";

@Component({
  name: "staff-selector",
  components: {
    SmartOrg,
  },
  model: {
    event: "change",
    prop: "value",
  },
})
export default class StaffSelector extends StaffSelectorBase {
  get SearchPlaceholder() {
    let output = "";
    if (this.options.selectOrg) {
      output = "搜索组织";
    }
    if (this.options.selectUser) {
      output = "搜索姓名/账号";
    }
    if (this.options.selectOrg && this.options.selectUser) {
      output = "搜索组织、姓名";
    }
    return output;
  }

  treeFocus() {
    super.treeFocus();
  }

  // 树-返回
  onClickTrunBack() {
    super.onClickTrunBack();
  }

  // 树-下一级
  onClickNextHierarchy(val: any) {
    super.onClickNextHierarchy(val);
  }

  onClickBreadcrumb(val: any) {
    super.onClickBreadcrumb(val);
  }

  onChange(items: any[]) {
    super.onChange(items);
  }

  async onOk(items: any[]) {
    super.onOk(items);
  }

  onCancle() {
    super.onCancle();
  }

  onSearch(name: string) {
    super.onSearch(name);
  }
  changeRoles(obj:any) {
    Object.assign(this.options,obj)
  }
}
</script>

<style lang="less" scoped>
</style>

