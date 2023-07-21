<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
      <a-tooltip
        placement="top"
        :class="[`${prefixCls}__icon`]"
        :getPopupContainer="getPopupContainer"
      >
        <template slot="title">
          <span>{{ tipLabel }}</span>
        </template>
        <i class="h3yun_All question-circle-o"></i>
      </a-tooltip>
    </div>
    <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
      <label>显示前</label>
      <a-input
        placeholder="输入数值"
        :class="[`${prefixCls}__input`]"
        :value="data"
        @change="change"
      ></a-input>
      <label>条数据</label>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Input, Tooltip } from '@h3/antd-vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-limit-module',
  components: {
    AInput: Input,
    ATooltip: Tooltip,
  }
})
export default class ReportLimitModule extends Vue {
  prefixCls = 'h3-report-limit-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Limit;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => null }) data!: number | null;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  // 数据显示设置tip
  tipLabel = '显示前N条数据';

  change(e: any) {
    if (/^[0-9]+$/.test(e.target.value) || !e.target.value) {
      const limit = parseInt(e.target.value, 10);
      if (this.chart.data.limit !== limit) {
        this.chart.data.limit = isNaN(limit) ? null : limit;
        this.resizeChartView({chart: this.chart, type: 'data' });
      }
    }
  }

  getPopupContainer() {
    return this.$el;
  }
}
</script>
<style lang="less">
.h3-report-limit-module{
  border-bottom: none !important;
  &__body{
    display: flex;
    align-items: center;
    margin-top: 8px;
    label {
      font-size:14px;
      font-weight:400;
      color:rgba(48,66,101,1);
      line-height:20px;
      white-space: pre;
      margin-bottom: 0;
    }
    input {
      width: 86px;
      height: 32px;
      margin: 0 8px;
      padding: 6px 12px;
      font-size: 14px;
      color: #304265;
    }
    input::placeholder {
      color: #C9CCD8;
      font-size: 14px;
      font-weight:400;
    }
  }
}
</style>
