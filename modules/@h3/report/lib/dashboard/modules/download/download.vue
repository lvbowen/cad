<!-- 图表联动 -->
<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
      <a-checkbox
        :class="[`${prefixCls}__checkbox`]"
        :checked="data"
        @change="change"
      ></a-checkbox>
      <label class="label-value">允许导出</label>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Checkbox } from '@h3/antd-vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-download-module',
  components: {
    ACheckbox: Checkbox,
  }
})
export default class ReportChartDownload extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Download;
  @Prop({ default: true }) data!: boolean
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = 'h3-report-download-module';

  /**
   * onchange事件
   * @param e
   */
  change(e) {
    this.$set(this.chart.styles, 'download', e.target.checked);
  }
}
</script>
<style lang='less'>
  .h3-report-download-module {
    &__body {
      margin-top: 8px;
      .label-value {
        color: #304265;
        font-size: 14px;
        margin-left: 10px;
      }
    }
    border-bottom: none !important;
  }
</style>
