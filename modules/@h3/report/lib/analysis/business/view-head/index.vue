<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__title`" slot="header">
      <backdoor>统计分析</backdoor>
    </div>
    <slot></slot>
    <div :class="`${prefixCls}__right`" slot="right">
      <a-tooltip :class="`${prefixCls}__close`" placement="bottom">
        <template slot="title">
          <span>关闭</span>
        </template>
        <div @click="clickClose()"><i class="iconfont iconclose-o"></i></div>
      </a-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { Tooltip } from "@h3/antd-vue";
import Backdoor from "@h3/report/basics/components/backdoor";

@Component({
  name: "h3-analysis-view-head",
  components: {
    ATooltip: Tooltip,
    Backdoor
  }
})
export default class ViewHead extends Vue {
  prefixCls: string = "h3-analysis-view-head";
  @Inject() close!: Function;

  clickClose() {
    this.close();
  }
}
</script>

<style lang="less">
@import "./index.less";
</style>
