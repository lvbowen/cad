<template>
  <div :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
      <a-tooltip
        placement="right"
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
      <div :class="[`${prefixCls}__row`]">
        <label>最大值</label>
        <a-input
          placeholder="请输入数字"
          :value="data.max"
          @change="change($event,'max')"
          @blur="blur($event,'max')"
          @focus="focus($event,'max')"
        >
        </a-input>
      </div>
      <div :class="[`${prefixCls}__row`]">
        <label>最小值</label>
        <a-input
          placeholder="请输入数字"
          :value="data.min"
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
@Component({
  name: 'h3-report-easy-metric-range-module',
  components: {
    AInput: Input,
    ATooltip: Tooltip,
  }
})

export default class ReportEasyMetricRangeModule extends Vue {
  prefixCls = 'h3-report-easy-metric-range-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.MetricRange;
  @Prop({ default: () => ({}) }) data!: H3.Report.MetricRange;
  oldValue: string = '';
  // 数据显示设置tip
  tipLabel = '设置纵坐标、坐标Y轴最大值及最小值';

  /**
   * 值改变事件
   * @param e
   * @param type
   */
  change(e: any, type: string) {
    if (/^-?[0-9]*$/.test(e.data) || !e.data) {
      if (this.chart.styles.metricRange) {
        this.chart.styles.metricRange[type] = e.target.value as any;
      }
    }
  }

  focus(e: any, type: string) {
    this.oldValue = (this.chart.styles as any).metricRange[type];
  }
  /**
   * 焦点离开事件
   */
  blur(e: any, type: string) {
    const max = parseInt((this.chart.styles.metricRange as any).max, 10);
    const min = parseInt((this.chart.styles.metricRange as any).min as any, 10);
    (this.chart.styles.metricRange as any).max = isNaN(max) ? null : max;
    (this.chart.styles.metricRange as any).min = isNaN(min) ? null : min;
    if (this.oldValue === (this.chart.styles.metricRange as any)[type]) return;
    if (this.chart.styles.metricRange) {
      if (this.oldValue === this.chart.styles.metricRange[type]) return;
      if (this.chart.styles.metricRange.min !== null && this.chart.styles.metricRange.max !== null) {
        if (min >= max) {
          message.warn('最大值不能比最小值小');
          this.chart.styles.metricRange[type === 'max' ? 'min' : 'max'] = null;
        }
      }
      this.chart.styles.metricRange = JSON.parse(JSON.stringify(this.chart.styles.metricRange));
    }
  }

  getPopupContainer() {
    return this.$el;
  }
}
</script>

<style lang="less">
  .h3-report-easy-metric-range-module{
    &__row{
      display: flex;
      label {
        flex: 0 0 42px;
        margin-right: 8px;
        line-height: 32px;
        font-weight: normal !important;
      }
      input::-webkit-input-placeholder {
        color: #C9CCD8;
      }
    }
    &__row + &__row{
      margin-top: 10px;
    }
    &__icon{
      margin-left: 6px;
      color: #8893A7;
    }
    .ant-tooltip-placement-right .ant-tooltip-arrow{
      border-right-color: #FFF;
    }
    .ant-tooltip {
      width: 180px;
      .ant-tooltip-content {
        .ant-tooltip-inner{
          padding: 8px 10px;
          background: #FFF;
          box-shadow:0 2px 8px 0 rgba(0,0,0,0.15);
          span{
            color: #304265;
          }
        }
      }
    }
  }
</style>
