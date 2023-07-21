<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <template v-for="(metric, index) in module.data">
      <H3Metric
        :comPrefixCls="prefixCls"
        :key="index"
        :sourceName="`metric-${index}`"
        :chart="chart"
        :module="metric"
        :data="data[index]"
        :showToolTip="false"
        @change="change(index, $event)"
      ></H3Metric>
    </template>
  </div>
</template>

<script lang=ts>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';
import Metric from '../metric'

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-metric-group-module',
  components: {
    H3Metric: Metric,
  }
})
export default class MetricGroup extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.MetricGroup;
  @Prop() data!:Array<Array<H3.Report.FieldColumn>>;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = 'h3-report-metric-group-module';

  

  /**
   * onchange事件
   * @param e
   * @param value
   */
  change(index, $event) {
    if (this.module.change) {
      this.module.change({ metricGroup: this.data });
    }
    this.$set((this.chart.data as any).metricGroup, index, $event);
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
}
</script>

<style lang='less'>
.h3-report-metric-group-module{
  border-bottom: none !important;
}
</style>
