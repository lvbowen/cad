<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="`h3-report-multi-range-module__title`">{{ module.title }}</div>
    <template v-for="(rangeModule, index) in module.data">
      <H3MetricRange
        :comPrefixCls="prefixCls"
        :key="index"
        :chart="chart"
        :module="rangeModule"
        :data="data[index]"
        :showToolTip="false"
        @change="change(index, $event)"
      ></H3MetricRange>
    </template>
  </div>
</template>

<script lang=ts>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';
import MetricRange from '../metric-range'

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-multi-range-module',
  components: {
    H3MetricRange: MetricRange,
  }
})
export default class MultiRange extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.MultiRange;
  @Prop() data!: Array<H3.Report.MetricRange>
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = 'h3-report-multi-range-module';

  

  /**
   * onchange事件
   * @param e
   * @param value
   */
  change(index, paramer) {
    console.log(index, paramer);
    this.$set((this.chart.styles as any).multiRange, index, paramer);
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
}
</script>

<style lang='less'>
.h3-report-multi-range-module{
  border-bottom: none !important;
  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #304265;
    margin-bottom: 16px;
  }
  &__header label{
    color: #8893A7 !important;
  }

}
</style>
