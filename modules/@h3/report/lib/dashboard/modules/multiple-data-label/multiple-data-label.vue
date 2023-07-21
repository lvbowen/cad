<!-- 多类型数据显示设置 -->
<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div
      :key="index"
      v-for="(item, index) in labelList"
      :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]"
    >
      <a-checkbox
        :class="[`${prefixCls}__checkbox`]"
        :checked="data[item.label]"
        @change="change($event, item.label)"
      ></a-checkbox>
      <label class="label-value">{{ item.value }}</label>
    </div>
  </div>
</template>

<script lang=ts>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Checkbox } from '@h3/antd-vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-data-label-module',
  components: {
    ACheckbox: Checkbox,
  }
})
export default class Home extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.MultipleDataLabel;
  @Prop() data!: boolean
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = 'h3-report-data-label-module';
  labelList: Array<any> = [
    {
      label: 'dimensionLabel',
      value: '显示维度值'
    },
    {
      label: 'metricLabel',
      value: '显示指标值'
    },
    {
      label: 'percentLabel',
      value: '显示百分比'
    }
  ];

  /**
   * onchange事件
   * @param e
   * @param value
   */
  change(e: any, label: string) {
    this.$set((this.chart.styles as any).multipleDataLabel, label, e.target.checked);
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
}
</script>

<style lang='less'>
.h3-report-data-label-module{
  border-bottom: none !important;
  &__body{
    display: flex;
    align-items: center;
    padding-top: 8px;
    &__checkbox {
      margin-bottom: 2px;
    }
    label {
      font-weight: normal !important;
    }
    .label-value {
      color: #304265;
      font-size: 14px;
      margin-left: 10px;
    }
  }
}
</style>
