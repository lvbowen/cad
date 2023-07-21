<template>
  <div :class="`${prefixCls}`">
    <a-tooltip
      :placement="placement"
      :getPopupContainer="getContainer"
      :arrowPointAtCenter="true"
    >
      <template slot="title" v-if="option.label">
        <span>{{ option.label }}</span>
      </template>
      <i
        @click="click(option, $event)"
        @mousedown="mousedown(option, $event)"
        :class="[`${prefixCls}__self`, 'iconfont', option.icon ? option.icon : '']"
        :style="{ color: option.color | '#777F8D' }"
      ></i>
    </a-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { Tooltip } from "@h3/antd-vue";

@Component({
  name: "h3-analysis-icon",
  components: {
    ATooltip: Tooltip
  }
})
export default class AnalysisIcon extends Vue {
  @Prop({ default: {} }) option!: H3.Toolbar.Options;
  @Prop({ default: null }) getContainer!: () => HTMLDivElement;
  @Prop({ default: "top" }) placement!: string;
  prefixCls: string = "h3-analysis-icon";

  /**
   * 触发点击事件
   */
  click(option: H3.Toolbar.Options, e?: Event) {
    this.$emit("click", option, e);
  }
  /**
   * 触发按钮下压事件
   */
  mousedown(option: H3.Toolbar.Options, e?: Event) {
    this.$emit("mousedown", option, e);
  }
}
</script>

<style lang="less" scrop>
.h3-analysis-icon {
  font-size: 13px;
  color: #777f8d;
  &__self {
    padding: 6px;
  }
}
</style>
