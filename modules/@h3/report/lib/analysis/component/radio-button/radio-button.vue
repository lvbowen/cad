<template>
  <div :class="prefixCls">
    <div
      v-for="(item, index) in options"
      :key="index"
      :class="[`${prefixCls}__item`, item.value === value ? 'active' : '']"
      @click="change(item)"
    >
      <div :class="`${prefixCls}__label`">
        {{ item.label }}
        <span :class="`${prefixCls}__tip`" v-if="item.value === tip"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";

@Component({
  name: "h3-radio-button",
  components: {}
})
export default class RadioButton extends Vue {
  @Prop({ default: "" }) value!: any; // 默认值
  @Prop({ default: "" }) tip!: any; // 红点提示
  @Prop({ default: [] }) options!: Array<H3.RadioButton.Options>; // tab配置项

  prefixCls: string = "h3-radio-button";

  /**
   * 更改值
   */
  change(item: H3.RadioButton.Options) {
    this.$emit("change", item.value);
  }
}
</script>

<style lang="less">
@import "./index.less";
</style>
