<!-- 数据显示设置 -->
<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`, `${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="[`${prefixCls}__body`, `${comPrefixCls}__body`]">
      <div :class="[`${prefixCls}__checkbox-wrap`]">
        <a-checkbox
          :class="[`${prefixCls}__checkbox`]"
          :checked="data.show"
          @change="change"
        ></a-checkbox>
        <label class="label-value">显示缩略轴</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Checkbox, Select } from "@h3/antd-vue";
import { Mutation, Action, State, namespace } from "vuex-class";
import { ReportMutation } from "@h3/report/basics/store/dashboard/types";

const ReportPro = namespace("report");
@Component({
  name: "h3-report-datazoom-module",
  components: {
    ACheckbox: Checkbox
  }
})
export default class ReportLegendModule extends Vue {
  @Prop({ default: () => "" }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.DataZoom;
  @Prop({ default: true }) data!: H3.Report.DataZoom;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = "h3-report-datazoom-module";

  /**
   * 显示图例位置
   * @param value
   */
  change(value) {
    this.$set(this.chart.styles.dataZoom, "show", value.target.checked);
    if (!value.target.checked) {
      this.$set(this.chart.styles.dataZoom, "start", 0);
      this.$set(this.chart.styles.dataZoom, "end", 100);
    }
    this.resizeChartView({ chart: this.chart, type: "view" });
  }
}
</script>

<style lang="less">
.h3-report-datazoom-module {
  border-bottom: none !important;
  color: #304265;
  &__checkbox-wrap {
    display: flex;
    align-items: center;
    padding-top: 8px;
    .label-value {
      color: #304265;
      font-size: 14px;
      margin-left: 8px;
    }
    label {
      font-weight: normal !important;
    }
  }
}
</style>
