<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
      <label>显示前</label>
      <a-input
        placeholder="请输入数字"
        :class="[`${prefixCls}__input`]"
        :value="data"
        @change="change"
      ></a-input>
      <label>个维度</label>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Input } from '@h3/antd-vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';
const ReportPro = namespace('report');
@Component({
  name: 'h3-report-dimension-limit-module',
  components: {
    AInput: Input,
  }
})
export default class ReportEasyDimensionLimitModule extends Vue {
  prefixCls = 'h3-report-dimension-limit-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.DimensionLimit;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => null }) data!: number | null;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  change(e: any) {
    if (/^[0-9]+$/.test(e.data) || !e.data) {
      const limit = parseInt(e.target.value, 10);
      this.chart.styles.dimensionLimit = isNaN(limit) ? null : limit;
      this.resizeChartView({ chart: this.chart, type: 'data' });
    }
  }
}
</script>
<style lang="less">
.h3-report-dimension-limit-module{
  border-bottom: none !important;
  &__header {
    margin-bottom: 8px;
  }
  &__body{
    display: flex;
    align-items: center;
    label {
      font-size:14px;
      font-weight:400;
      color:rgba(48,66,101,1);
      line-height:20px;
      white-space: pre;
    }
    input {
      width:94px;
      height:32px;
      margin: 0 8px;
      padding: 6px 8px;
      font-size: 14px;
      color: #304265;
    }
    input::placeholder {
      color: #C9CCD8;
      font-size: 14px;
    }
  }
}
</style>
