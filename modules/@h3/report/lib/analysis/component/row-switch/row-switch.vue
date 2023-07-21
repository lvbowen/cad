<template>
  <div :class="prefixCls">
    <row :title="title">
      <a-switch :checked="value" @change="change"/>
    </row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import Row from "../../component/row";
import { Switch } from "@h3/antd-vue";

@Component({
  name: "h3-row-switch",
  components: {
    Row,
    ASwitch: Switch
  }
})
export default class RowSwitch extends Vue {
  @Prop({ default: "" }) title!: string;
  @Prop({ default: "" }) value!: string;
  prefixCls: string = "h3-row-switch";

  change(checked: Boolean) {
    this.$emit("change", checked);
  }
}
</script>

<style lang="less">
.h3-row-switch {
  .ant-radio-group {
    display: flex;
    .ant-radio-button-wrapper {
      flex: 1;
      text-align: center;
    }
  }
}
</style>
