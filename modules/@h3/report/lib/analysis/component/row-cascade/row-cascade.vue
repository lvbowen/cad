<template>
  <div :class="prefixCls">
    <row :title="title">
      <a-cascade
        :placeholder="placeholder"
        v-model="innerValue"
        :options="options"
        :displayRender="displayRender"
        :getPopupContainer="getPopupContainer"
      ></a-cascade>
    </row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import Row from "../../component/row";
import { Input, Cascader } from "@h3/antd-vue";

@Component({
  name: "h3-row-cascade",
  components: {
    Row,
    ACascade: Cascader
  }
})
export default class RowCascade extends Vue {
  @Prop({ default: "" }) title!: string;
  @Prop({ default: "请选择" }) placeholder!: string;
  @Prop({ default: "" }) value!: string;
  @Prop({ default: () => document.body }) getPopupContainer!: Function;
  @Prop({ default: () => {} }) displayRender!: Function;
  @Prop({ default: () => [] }) options!: Array<any>;

  prefixCls: string = "h3-row-cascade";

  get innerValue() {
    return this.value;
  }

  set innerValue(val) {
    this.$emit("input", val);
    this.$emit("change", val);
  }
}
</script>
