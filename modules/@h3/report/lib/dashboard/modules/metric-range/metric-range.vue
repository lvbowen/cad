<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header ${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
      <a-tooltip
        placement="top"
        :class="[`${prefixCls}__icon`]"
        :getPopupContainer="getPopupContainer"
      >
        <template slot="title">
          <span v-html="tipLabel"></span>
        </template>
        <i class="h3yun_All question-circle-o" v-if="showToolTip"></i>
      </a-tooltip>
    </div>
    <div :class="[`${prefixCls}__body`, `${comPrefixCls}__body`]">
      <div :class="[`${prefixCls}__row`]">
        <label>最大值:</label>
        <a-input
          placeholder="输入数值"
          :value="innerData.max"
          @change="change($event,'max')"
          @blur="blur($event,'max')"
          @focus="focus($event,'max')"
        >
        </a-input>
      </div>
      <div :class="[`${prefixCls}__row`]">
        <label>最小值:</label>
        <a-input
          placeholder="输入数值"
          :value="innerData.min"
          @change="change($event,'min')"
          @blur="blur($event,'min')"
          @focus="focus($event,'min')"
        >
        </a-input>
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Input, message, Tooltip } from '@h3/antd-vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-metric-range-module',
  components: {
    AInput: Input,
    ATooltip: Tooltip,
  }
})
export default class ReportEasyMetricRangeModule extends Vue {
  prefixCls = 'h3-report-metric-range-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.MetricRange;
  @Prop({ default: () => ({}) }) data!: H3.Report.MetricRange;
  @Prop({ default: true }) showToolTip!: boolean;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  oldValue: string = '';
  // 数据显示设置tip
  tipLabel = '设置纵坐标、坐标Y轴<br>最大值及最小值';

  // innerData: H3.Report.MetricRange = this.data;
  
  get innerData(){
    return this.data;
  }
  
  /**
   * 值改变事件
   * @param e
   * @param type
   */
  change(e: any, type: string) {
    if (/^-?[0-9]*$/.test(e.target.value) || !e.target.value) {
      // if (this.chart.styles.metricRange) {
        this.innerData[type] = e.target.value as any;
      // }
    }
  }

  /**
   * focus
   * @param e
   * @param type
   */
  focus(e: any, type: string) {
    this.oldValue = this.innerData[type];
  }
  
  /**
   * 焦点离开事件
   */
  blur(e: any, type: string) {
    const max = parseInt((this.innerData as any).max, 10);
    const min = parseInt((this.innerData as any).min as any, 10);
    (this.innerData as any).max = isNaN(max) ? null : max;
    (this.innerData as any).min = isNaN(min) ? null : min;
    if (this.oldValue === this.innerData[type]) return;
    if (this.innerData) {
      if (this.oldValue === this.innerData[type]) return;
      if (this.innerData.min !== null && this.innerData.max !== null) {
        if (min >= max) {
          message.warn('最大值不能比最小值小');
          this.innerData[type === 'max' ? 'min' : 'max'] = null;
        }
      }
      // this.innerData = JSON.parse(JSON.stringify(this.innerData));
    }
    if (this.chart.styles.metricRange) {
      this.$set(this.chart.styles, 'metricRange', this.innerData);
    }
    
    this.$emit('change', this.innerData);
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }

  getPopupContainer() {
    return this.$el;
  }
}
</script>

<style lang="less">
  .h3-report-metric-range-module{
    border-bottom: none !important;
    &__header {
      margin-bottom: 8px;
      label {
        font-size:14px;
        font-weight:600;
        color:rgba(48,66,101,1);
        line-height:20px;
      }
    }
    &__row {
      display: flex;
      align-content: center;
      margin-top: 8px;
      label {
        font-size:14px;
        font-weight:400;
        white-space: pre;
        line-height: 32px;
        margin-right: 22px;
        margin-bottom: 0;
        color:rgba(48,66,101,1);
      }
      input {
        width: 118px;
        font-size:14px;
        padding: 5px 8px;
        color: #304265;
      }
      input::placeholder {
        font-size:14px;
        font-weight:400;
        color:rgba(201,204,216,1);
      }
    }
  }
</style>
