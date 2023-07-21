<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`, `${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="[`${prefixCls}__body`, `${comPrefixCls}__body`]">
      <a-checkbox
        :class="[`${prefixCls}__checkbox`]"
        :checked="data.checked"
        @change="change"
      ></a-checkbox>
      <label class="label-value">显示序号</label>
      <div v-if="module.displayOrderName" :class="`${prefixCls}__orderName`">
        序号显示名
        <a-input
          v-model="data.orderName"
          :disabled="!data.checked"
          style="width: 86px"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Checkbox, Input } from "@h3/antd-vue";
import { Mutation, Action, State, namespace } from "vuex-class";
import { ReportMutation } from "@h3/report/basics/store/dashboard/types";

const ReportPro = namespace("report");
@Component({
  name: "h3-report-order-number-module",
  components: {
    ACheckbox: Checkbox,
    AInput: Input
  }
})
export default class OrderNumber extends Vue {
  @Prop({ default: () => "" }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.OrderNumber;
  @Prop({ default: () => ({}) }) data!: H3.Report.OrderNumber;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = "h3-report-order-number-module";

  /**
   * onchange事件
   * @param e
   */
  change(e) {
    this.$set(this.chart.styles.orderNumber, "checked", e.target.checked);
    this.resizeChartView({ chart: this.chart, type: "view" });
  }
}
</script>

<style lang="less">
.h3-report-order-number-module {
  border-bottom: none !important;
  &__body {
    padding-top: 8px;
    label {
      font-weight: normal !important;
    }
    .label-value {
      color: #304265;
      font-size: 14px;
      margin-left: 10px;
    }
  }
  &__orderName {
    margin-top: 8px;
    input {
      margin-left: 10px;
    }
  }
}
</style>
