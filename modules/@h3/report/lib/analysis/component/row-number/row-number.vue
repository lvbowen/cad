<template>
  <div :class="prefixCls">
    <row :title="title">
      <a-input-number
        :min="min"
        :max="max"
        :precision="precision"
        :placeholder="placeholder"
        v-model="innerValue"
        @blur="onBlur"
      />
    </row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import Row from "../../component/row";
import { InputNumber } from "@h3/antd-vue";

@Component({
  name: "h3-row-number",
  components: {
    Row,
    AInputNumber: InputNumber
  }
})
export default class RowNumber extends Vue {
  @Prop({ default: "" }) title!: string;
  @Prop({ default: "请输入" }) placeholder!: string;
  @Prop({ default: "" }) value!: number;
  @Prop({ default: -Infinity }) min!: number; // 最小值
  @Prop({ default: Infinity }) max!: number; // 最大值
  @Prop({ default: null }) precision!: number; // 精度位数

  prefixCls: string = "h3-row-number";

  // isFocus: boolean = false;

  get innerValue() {
    return this.value;
  }

  set innerValue(val) {
    this.$emit("input", val);
    this.$emit("change", val);
    // this.$nextTick(() => {
    //   if (!this.isFocus) {
    //     this.onBlur(val);
    //   }
    // });
  }

  /**
   * 失去焦点
   */
  onBlur(e) {
    this.$emit("blur", e.target.value);
  }
}
</script>
