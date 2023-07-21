<template>
  <div :class="prefixCls">
    <row :title="title">
      <a-select
        :placeholder="placeholder"
        v-model="innerValue"
        :options="options"
      ></a-select>
    </row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import Row from "../../component/row";
import { Input, Select } from "@h3/antd-vue";

@Component({
  name: "h3-row-select",
  components: {
    Row,
    ASelect: Select
  }
})
export default class RowSelect extends Vue {
  @Prop({ default: "" }) title!: string;
  @Prop({ default: "请选择" }) placeholder!: string;
  @Prop({ default: "" }) value!: string;
  @Prop({ default: () => [] }) options!: Array<{ value: string; label: string }>;

  prefixCls: string = "h3-row-select";

  get innerValue() {
    return this.value;
  }

  set innerValue(val) {
    this.$emit("input", val);
    this.$emit("change", val);
  }
}
</script>
