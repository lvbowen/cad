<template>
  <div :class="prefixCls">
    <!-- 返回按钮 -->
    <div :class="`${prefixCls}-back`" v-if="isDesign">
      <i class="iconfont iconleft" @click="back"></i>
    </div>
    <!-- 装饰 -->
    <div :class="`${prefixCls}__decorator`" v-if="isPreview"></div>
    <!-- 修改名称 -->
    <edit-input
      ref="inputTitle"
      :inputValue="chartTitle"
      :minWidthValue="100"
      :maxWidthValue="190"
      :maxLength="50"
      :inputID="`d-${chart.uid}`"
      :edit="editTitle"
      :class="[`${prefixCls}__editInput`]"
      @inputBlur="inputBlur"
      @inputFocus="inputFocus"
    >
    </edit-input>
    <!-- 工具栏 -->
    <div :class="`${prefixCls}__tool`" v-if="isPreview">
      <toolbar :options="toolbar" @click="clickOption">
        <!-- tool额外注入内容 -->
        <template :slot="ToolsBarType.SORT" v-if="visibleSort">
          <a-popover
            :placement="toolbar.length > 4 ? 'bottom' : 'bottomRight'"
            :overlayClassName="`h3-analysis-sort__pop`"
            :arrowPointAtCenter="true"
            trigger="click"
          >
            <template slot="content">
              <div>
                <sort-model
                  :chart="chart"
                  :value="sortValue"
                  @change-sort="changeSort"
                >
                </sort-model>
              </div>
            </template>
            <div>
              <AIcon
                :class="`${prefixCls}__icon-wrap`"
                :option="sortOption"
                :getContainer="getContainer"
              ></AIcon>
            </div>
          </a-popover>
        </template>
        <template slot="extra">
          <div :class="`${prefixCls}__toolbar-line`"></div>
          <div :class="`${prefixCls}__narrow-wrap`" @click="back()">
            <i :class="[`${prefixCls}__icon`, 'iconfont', narrowOption.icon]"></i>
            <span> {{ narrowOption.label }}</span>
          </div>
        </template>
      </toolbar>
    </div>
    <!-- 保存 -->
    <div :class="`${prefixCls}__save`" v-if="isDesign">
      <a-button type="primary" @click="save">
        保存
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { analysisApi } from "@h3/report/basics/service/analysis/index.ts";
import EditInput from "@h3/report/basics/components/edit-input";
import { Button, Popover } from "@h3/antd-vue";
import SortModel from "../sort-model";
import { ToolsBarType } from "@h3/report/basics/enum/element-tools";
import Toolbar from "../../component/toolbar";
import { ToolBarMaps } from "../../config/static-option";
import { ModuleState } from "@h3/report/basics/enum/module-state";
import ToolsMixins from "../../mixins/tools-mixins";
import TitleMixins from "../../mixins/title-mixins";
import Icon from "../../component/icon";

@Component({
  name: "h3-analysis-design-head",
  components: {
    EditInput,
    Toolbar,
    AButton: Button,
    AIcon: Icon,
    APopover: Popover,
    SortModel
  }
})
export default class DesignHead extends Mixins(ToolsMixins, TitleMixins) {
  // 状态控制
  @Prop({ default: ModuleState.DESIGN }) status!: ModuleState.PREVIEW | ModuleState.DESIGN;
  // 是否可以修改title
  @Prop({ default: true }) editTitle!: boolean;

  prefixCls: string = "h3-analysis-design__head";
  // 缩小功能配置的映射
  narrowOption = ToolBarMaps[ToolsBarType.NARROW];
  // 排序功能的映射
  sortOption = ToolBarMaps[ToolsBarType.SORT];
  ToolsBarType = ToolsBarType;
  // 保存刷新的标识
  saveRefresh: boolean = false;

  get chartTitle() {
    return this.chart.title;
  }
  get isDesign() {
    return this.status === ModuleState.DESIGN;
  }
  get isPreview() {
    return this.status === ModuleState.PREVIEW;
  }
  /**
   * 获取弹窗排序的容器
   */
  getContainer() {
    return this.$el;
  }

  /**
   * 输入框失去焦点事件
   */
  inputBlur(value) {
    if (this.lastTitle !== value) {
      this.chart.title = value;
      this.saveRefresh = true;
      this.save();
    }
    this.lastTitle = "";
  }

  save() {
    // 保存接口
    this.$emit("save");
  }
  back() {
    this.$emit("back", this.saveRefresh);
  }
}
</script>

<style lang="less" scoped>
.h3-analysis-design__head {
  flex: 0 0 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 48px;
  border-bottom: 1px solid #e7e9ed;
  position: relative;
  &__decorator {
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, rgba(37, 182, 255, 1) 0%, rgba(16, 127, 255, 1) 100%);
    border-radius: 2px;
  }
  &-back {
    .iconfont {
      color: #0f1c35;
      font-size: 20px;
    }
  }
  &__editInput {
    padding-left: 12px;
    color: #0f1c35;
  }
  &__save {
    flex: auto;
    text-align: right;
  }
  &__tool {
    position: absolute;
    right: 12px;
  }
  &__toolbar-line {
    width: 1px;
    height: 16px;
    background: rgba(227, 230, 236, 1);
    display: inline-block;
    text-align: center;
    margin: 2px 12px 0 12px;
  }
  &__icon-wrap {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    &:hover {
      background: #ecf0f6;
      border-radius: 50%;
      transition: all 0.3s;
    }
  }
  &__icon {
    font-size: 20px;
    color: #777f8d;
    margin-right: 6px;
  }
  &__narrow-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    height: 32px;
    line-height: 32px;
    width: 96px;
    cursor: pointer;
    &:hover {
      background: #ecf0f6;
      border-radius: 4px;
      transition: all 0.3s;
    }
  }
}
</style>
