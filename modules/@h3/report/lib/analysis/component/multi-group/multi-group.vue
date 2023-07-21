<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__head`">
      <div :class="`${prefixCls}__head-title`" v-html="title"></div>
      <div :class="`${prefixCls}__head-tip`">
        <a-tooltip placement="top">
          <span slot="title" v-html="tip"></span>
          <i v-if="tip" class="iconfont iconquestion-circle-o"></i>
        </a-tooltip>
      </div>
      <div :class="`${prefixCls}__head-extra`">
        <slot name="extra"></slot>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { Tooltip } from "@h3/antd-vue";

@Component({
  name: "h3-multi-group",
  components: {
    ATooltip: Tooltip
  }
})
export default class MultiGroup extends Vue {
  @Prop({ default: "" }) title!: string;
  @Prop({ default: "" }) tip!: string;

  prefixCls: string = "h3-multi-group";
}
</script>

<style lang="less" scoped>
.h3-multi-group {
  margin-bottom: 24px;
  &__head {
    padding: 0 16px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    &-title {
      font-size: 14px;
      font-weight: 600;
      color: rgba(15, 28, 53, 1);
      line-height: 22px;
      margin-right: 4px;
    }
    &-tip {
      color: #b6bcc6;
      cursor: pointer;
      .iconfont {
        font-size: 14px;
      }
    }
    &-extra {
      flex: 1;
      text-align: right;
    }
  }
}
.h3-multi-group:first-child {
  margin-top: 12px;
}</style
>>
