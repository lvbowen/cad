<template>
  <div class="role-selector__wrap">
    <!-- 输入框 -->
    <div
      class="role-selector__input"
      :class="multiple ? 'auto' : 'fix'"
      @click="focusInput"
      @mouseenter="hoverInput"
      @mouseleave="blurInput"
    >
      <span
        v-show="!selectedRoles.length"
        class="role-selector__input--placeholder"
        @click="focusInput"
      >{{ placeholder }}</span>

      <ul
        v-if="selectedRoles.length"
        :class="{'multiple':multiple}"
        class="role-selector__input--tags"
        @click.self="focusInput"
      >
        <li
          v-for="(role,index) in selectedRoles"
          :key="index"
          class="role-selector__span"
          :title="getRoleName(role)"
        >
          <i class="aufontAll h-icon-all-user-o"></i>
          <span>{{ getRoleName(role) }}</span>
          <i v-if="multiple" @click.stop="removeRole(role)" class="aufontAll h-icon-all-close"></i>
        </li>
      </ul>

      <i
        v-if="multiple && showClear && selectedRoles.length"
        class="aufontAll h-icon-all-close-circle clearer"
        @click.stop="clear"
      ></i>
    </div>
    <!-- 弹窗 -->
    <role-selector
      v-model="selectedRoles"
      ref="roleSelector"
      :title="title"
      :visible="visible"
      :multiple="multiple"
      :allowEmpty="allowEmpty"
      :expandAll="expandAll"
      :filterKey="filterKey"
      :filterDD="filterDD"
      :params="params"
      :keepRoles="keepRoles"
      @hide="hide"
      @clearBlocked="clearBlocked"
      @selectBlocked="selectBlocked"
      @input="submit"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import RoleSelector from './role-selector.vue';

import * as RoleSelectorTypings from './role-selector.typings';

import { RoleService } from './role-selector.service';

@Component({
  name: "role-select",
  components: {
    RoleSelector
  }
})
export default class RoleSelect extends Vue {

  @Prop() defaultValue?: any;
  @Prop() params?: any;

  @Prop() title?: string;
  // 关联组织新增加角色需要过滤钉钉角色
  @Prop() filterDD?: boolean;

  @Prop({
    default: false
  }) multiple?: boolean;

  @Prop({
    default: false
  }) expandAll?: boolean;

  @Prop({
    default: 'id'
  }) filterKey?: string; // 删除角色时依据

  @Prop({
    default: 'code'
  }) defaultValueKey?: string; // 回显角色时依据

  @Prop({
    default: true
  }) showParent?: boolean;

  @Prop({
    default: true
  }) allowEmpty?: boolean; // 是否允许选择结果置空

  @Prop({
    default: () => []
  }) keepRoles?: Array<string>; // 需要保留的角色id/code列表，取决于filterKey

  placeholder: string = '请选择';

  visible: boolean = false;

  showClear: boolean = false;

  selectedRoles: Array<RoleSelectorTypings.RoleItem> = [];

  /**
   * 删除已选角色
   */
  removeRole(role: RoleSelectorTypings.RoleItem) {
    if (!this.multiple) {
      this.focusInput();
      return;
    }

    if (role.name === '部门主管') return;

    const { filterKey,keepRoles } = this;

    if (Array.isArray(keepRoles) && keepRoles.length) {
      if (keepRoles.some((item:any) => item[filterKey as string]===role[filterKey as string])) {
        this.selectBlocked(role);
        return;
      }
    }

    let roles: Array<RoleSelectorTypings.RoleItem> = [];
    roles = this.selectedRoles.filter((item: any) => item[filterKey as string] !== role[filterKey as string]);
    this.selectedRoles = roles;
    if (!roles.length && !this.allowEmpty) {
      this.clearBlocked();
      return;
    }
    this.$emit('select', this.selectedRoles);
  }

  /**
   * 清空已选角色
   */
  clear() {
    if (!this.allowEmpty) {
      this.clearBlocked();
      return;
    }

    const { filterKey,keepRoles,selectedRoles } = this;

    if (Array.isArray(keepRoles) && keepRoles.length) {
      const hasKeepRole:boolean = keepRoles.some((item:any) => {
        if (selectedRoles.some((role:any) => item[filterKey as string]===role[filterKey as string])){
          return true;
        }
        return false;
        })
      if (hasKeepRole) {
        this.selectBlocked(selectedRoles);
        return;
      }
    }
    this.selectedRoles = [];
    this.$emit('select', this.selectedRoles);
  }

  /**
   * 单击输入框，弹出选择角色
   */
  focusInput() {
    this.visible = true;
  }

  /**
   * 鼠标移入输入框
   */
  hoverInput() {
    this.showClear = true;
  }

  /**
   * 鼠标移出输入框
   */
  blurInput() {
    this.showClear = false;
  }

  /**
   * 取消选择，隐藏弹窗
   */
  hide() {
    this.visible = false;
  }

  /**
   * 清除被拦截
   */
  clearBlocked() {
    this.$emit('clearBlocked');
  }

  selectBlocked(payload: any) {
    this.$emit('selectBlocked',payload);
  }

  /**
   * 选择角色完毕
   */
  submit(roles: Array<RoleSelectorTypings.RoleItem>) {
    this.$emit('select', roles);
    this.visible = false;
  }

  /**
   * 渲染默认值
   *
   * ① 传入对象数组：Array<RoleSelectorTypings.RoleItem>
   * ② 传入code字符串数组：Array<string>
   * ③ 传入单个角色code: string
   */
  async initialSelected(payload?: any) {
    const value: any = payload || this.defaultValue;
    this.selectedRoles = [];
    if (!value) {
      return;
    }

    if (typeof value === 'string') {
      // 只传入了角色code
      let roleInfo: any = null;
      if (this.defaultValueKey === 'id') {
        roleInfo = await RoleService.getRoleInfoByID(value);
      } else {
        roleInfo = await RoleService.getRoleInfoByCode(value);
      }

      if (!roleInfo) {
        return;
      }
      this.selectedRoles = [roleInfo];
      return;
    }

    // 传入的是完整的角色对象数组
    if (Array.isArray(value) && value.length) {
      value.forEach(async (item: any) => {
        if (typeof item === 'string') {
          let roleInfo: any = null;
          if (this.defaultValueKey === 'id') {
            roleInfo = await RoleService.getRoleInfoByID(item);
          } else {
            roleInfo = await RoleService.getRoleInfoByCode(item);
          }
          if (roleInfo) {
            this.selectedRoles.push(roleInfo);
          }
        } else if (['name', 'id', 'code', 'groupId'].every((key: string) => item.hasOwnProperty(key))) {
          this.selectedRoles.push(item);
        }
      });
    }

  }

  getRoleName(role: any) {
    return this.showParent ? role.groupName + ' / ' + role.name : role.name;
  }
  mounted() {
    this.initialSelected();
  }

  @Watch('defaultValue')
  onValueChange() {
    this.initialSelected();
  }

}
</script>

<style lang="less" scoped>
.role-selector {
  &__wrap {
    display: inline-block;
  }
  &__input {
    display: inline-block;
    min-width: 180px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 0;
    cursor: pointer;
    position: relative;
    &.fix {
      height: 32px;
      padding: 0 10px;
    }
    &.auto {
      min-height: 32px;
      max-height: 180px;
      padding: 0 5px 4px 5px;
      overflow-y: auto;
      /deep/.role-selector__input--placeholder {
        margin-top: 5px;
        margin-left: 6px;
      }
      /deep/.role-selector__span {
        margin-top: 4px;
        margin-right: 8px;
      }
    }
    &::after {
      content: "";
      display: inline-block;
      width: 0;
      height: 100%;
      vertical-align: middle;
    }
    &:hover,
    &:focus {
      border-color: @primary-color;
    }
    &:focus {
      box-shadow: 0 0 0 2px @primary-light-color;
      outline: 0;
    }
    &--tags {
      display: inline-block;
      vertical-align: middle;
      margin-right: 12px;
      font-size: 0;
      &:not(.multiple) {
        /deep/.role-selector__span {
          background: none;
          border: none;
          padding: 0;
          i {
            display: none;
          }
          span {
            font-size: 14px;
          }
        }
      }
    }
    &--placeholder {
      display: inline-block;
      vertical-align: middle;
      color: rgba(0, 0, 0, 0.25);
      font-size: 14px;
      line-height: 1.5;
    }
    .clearer {
      position: absolute;
      z-index: 9;
      right: 10px;
      top: 6px;
      display: inline-block;
      vertical-align: middle;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.25);
      line-height: 1.5;
      &:hover {
        color: #666;
      }
    }
  }
}
</style>

<style lang="less">
.role-selector__span {
  display: inline-block;
  vertical-align: middle;
  height: 22px;
  line-height: 22px;
  padding-left: 8px;
  padding-right: 8px;
  white-space: nowrap;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fafafa;
  font-size: 0;
  cursor: pointer;
  > i {
    display: inline-block;
    vertical-align: middle;
    font-size: 12px;
    color: #bfbfbf;
  }
  > span {
    display: inline-block;
    vertical-align: middle;
    max-width: 160px;
    margin-left: 4px;
    margin-right: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    line-height: 22px;
  }
}
</style>
