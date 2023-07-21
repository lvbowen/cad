<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__title`">{{ title }}</div>
    <div :class="`${prefixCls}__content`">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";

@Component({
  name: "h3-row",
  components: {}
})
export default class H3Row extends Vue {
  @Prop({ default: "" }) title!: string;
  @Prop({ default: "" }) tip!: string;

  prefixCls: string = "h3-row";
}
</script>

<style lang="less" scoped>
.h3-row {
  display: flex;
  padding: 0 16px;
  align-items: center;
  margin-bottom: 12px;
  &__title {
    width: 146px;
    height: 22px;
    line-height: 22px;
    margin-right: 8px;
    font-size: 14px;
    font-weight: 400;
    color: #777f8d;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &__content {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    & > * {
      width: 100%;
    }
  }
}</style
>>
