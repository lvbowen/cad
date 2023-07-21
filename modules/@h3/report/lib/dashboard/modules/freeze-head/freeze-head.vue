<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`, `${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
      <a-tooltip
        placement="top"
        :title="tipLabel"
        :class="[`${prefixCls}__icon`]"
        :getPopupContainer="getPopupContainer"
      >
        <i class="h3yun_All question-circle-o" v-if="module.displayColumnNumber"></i>
      </a-tooltip>
    </div>
    <div :class="[`${prefixCls}__body`, `${comPrefixCls}__body`]">
      <div v-if="module.displayRow" :class="`${prefixCls}__line`">
        <a-checkbox
          :class="[`${prefixCls}__checkbox`]"
          :checked="data.row"
          @change="changeRow($event)"
        ></a-checkbox>
        <label class="label-value">冻结行维度</label>
      </div>

      <div v-if="module.displayColumn" :class="`${prefixCls}__line`">
        <a-checkbox
          :class="[`${prefixCls}__checkbox`]"
          :checked="data.column"
          @change="changeColumn($event)"
        ></a-checkbox>
        <label class="label-value">冻结列维度</label>
      </div>

      <div v-if="module.displayColumnNumber" :class="`${prefixCls}__line`">
        <a-checkbox
          :class="[`${prefixCls}__checkbox`]"
          :checked="data.column"
          @change="changeColumn"
        ></a-checkbox>
        <label class="label-value">
          冻结前
          <a-input-number
            :min="0"
            :max="5"
            @change="formatter"
            :disabled="!data.column"
            :value="data.columnNumber"
          />
          列
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Checkbox, InputNumber, Tooltip } from "@h3/antd-vue";
import { Mutation, Action, State, namespace } from "vuex-class";
import { ReportMutation } from "@h3/report/basics/store/dashboard/types";

const ReportPro = namespace("report");
@Component({
  name: "h3-report-freeze-head-module",
  components: {
    ACheckbox: Checkbox,
    AInputNumber: InputNumber,
    ATooltip: Tooltip
  }
})
export default class Home extends Vue {
  @Prop({ default: () => "" }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.FreezeHead;
  @Prop({ default: () => ({}) }) data!: H3.Report.FreezeHead;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = "h3-report-freeze-head-module";

  tipLabel: string = "最多允许冻结前5列";

  /**
   * onchange事件
   * @param e
   */
  changeRow(e) {
    this.$set(this.chart.styles.freezeHead, "row", e.target.checked);
    this.resizeChartView({ chart: this.chart, type: "view" });
  }
  changeColumn(e) {
    this.$set(this.chart.styles.freezeHead, "column", e.target.checked);
    this.resizeChartView({ chart: this.chart, type: "view" });
  }
  /**
   * 格式化数值输入框
   */
  formatter(value) {
    let val = value;
    val = value > 0 ? (val > 5 ? 5 : val) : 0;
    this.$set(this.chart.styles.freezeHead, "columnNumber", val);
  }

  getPopupContainer() {
    return this.$el;
  }
}
</script>

<style lang="less">
.h3-report-freeze-head-module {
  border-bottom: none !important;
  &__body {
    display: flex;
    flex-direction: column;
    padding-top: 8px;
    label {
      font-weight: normal !important;
    }
    .label-value {
      color: #304265;
      font-size: 14px;
      margin-left: 6px;
      .ant-input-number {
        margin: 0 6px;
        width: 80px;
      }
    }
  }
  &__line {
    display: block;
  }
  /** ant-design tooltip样式 **/
  .ant-tooltip-placement-bottom,
  .ant-tooltip-placement-bottomLeft,
  .ant-tooltip-arrow {
    border-bottom-color: #304265;
  }
  .ant-tooltip-placement-top,
  .ant-tooltip-arrow {
    border-top-color: #304265;
  }
  .ant-tooltip {
    .ant-tooltip-content {
      .ant-tooltip-inner {
        background-color: #304265;
      }
    }
  }
}
</style>
