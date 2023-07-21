<template>
  <div :class="prefixCls">
    <row :title="title">
      <a-radio-group :value="value" @change="change">
        <a-radio-button
          :value="o.value"
          v-for="o in options"
          :key="o.value"
        >
          {{ o.label }}
        </a-radio-button>
      </a-radio-group>
    </row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import Row from "../../component/row";
import { Radio } from "@h3/antd-vue";

@Component({
  name: "h3-row-radio",
  components: {
    Row,
    ARadioGroup: Radio.Group,
    ARadioButton: Radio.Button
  }
})
export default class RowRadio extends Vue {
  @Prop({ default: "" }) title!: string;
  @Prop({ default: [] }) options!: Array<{ label: string; value: string | number }>;
  @Prop({ default: "" }) value!: string;

  prefixCls: string = "h3-row-radio";

  change(val) {
    this.$emit("change", val.target.value);
  }
}
</script>

<style lang="less">
.h3-row-radio {
  .ant-radio-group {
    display: flex;
    .ant-radio-button-wrapper {
      flex: 1;
      text-align: center;
    }
  }
}
</style>
