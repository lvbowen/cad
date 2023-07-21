<template>
  <div :class="prefixCls">
    <div
      :class="`${prefixCls}__wrap`"
      :key="index"
      v-for="(item, index) in toolbarArray"
    >
      <template v-if="$slots[item.value]">
        <slot :name="item.value"></slot>
      </template>
      <template v-else>
        <a-popconfirm
          v-if="item.confirm"
          :title="item.confirm.title"
          :okText="item.confirm.okText"
          :arrowPointAtCenter="true"
          :cancelText="item.confirm.cancelText"
          placement="bottomRight"
          @confirm="click(item)"
        >
          <AIcon
            :class="`${prefixCls}__icon-wrap`"
            :option="item"
            :getContainer="getContainer"
          >
          </AIcon>
        </a-popconfirm>
        <AIcon
          v-else
          :class="`${prefixCls}__icon-wrap`"
          :option="item"
          :getContainer="getContainer"
          @click="click(item, $event)"
          @mousedown="mousedown(item, $event)"
        >
        </AIcon>
      </template>
    </div>
    <slot name="extra"> </slot>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { ToolsBarType } from "@h3/report/basics/enum/element-tools";
import { Tooltip, Popconfirm, Popover } from "@h3/antd-vue";
import { ToolBarMaps } from "../../config/static-option";
import Icon from "../icon";

@Component({
  name: "h3-tool-bar",
  components: {
    ATooltip: Tooltip,
    APopconfirm: Popconfirm,
    APopover: Popover,
    AIcon: Icon
  }
})
export default class H3ToolBar extends Vue {
  // 工具栏配置
  @Prop({ default: () => [] }) options!: Array<H3.Toolbar.Options | string>;
  // 提供禁用的功能（隐藏）
  @Prop({ default: () => [] }) disableList!: Array<string>;
  // 挂载容器
  @Prop({ default: null }) getContainer!: () => HTMLDivElement;

  prefixCls: string = "h3-tool-bar";

  /**
   * 实际的工具栏数据
   */
  get toolbarArray() {
    let toolbar: Array<H3.Toolbar.Options> = [];
    this.options.forEach((item: H3.Toolbar.Options | string) => {
      let isDisabled = !!this.disableList.find(disItem => {
        if (typeof item === "string") {
          return disItem === item;
        }
      });
      if (!isDisabled) {
        if (typeof item === "string") {
          ToolBarMaps[item] && toolbar.push(ToolBarMaps[item]);
        } else {
          // 如果是对象的话
          const tool = item.value && ToolBarMaps[item.value] ? ToolBarMaps[item.value] : item;
          const newTool = Object.assign({}, tool, item);
          toolbar.push(newTool as H3.Toolbar.Options);
        }
      }
    });
    return toolbar;
  }

  /**
   * 触发点击事件
   */
  click(item: H3.Toolbar.Options, e?: Event) {
    this.$emit("click", item, e);
  }
  /**
   * 触发按钮下压事件
   */
  mousedown(item: H3.Toolbar.Options, e?: Event) {
    this.$emit("mousedown", item, e);
  }
  created() {}
}
</script>

<style lang="less">
@import "./index.less";
</style>
