<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
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
      <label>显示前</label>
      <a-input
        placeholder="请输入数字"
        :class="[`${prefixCls}__input`]"
        :value="data"
        @change="change"
      ></a-input>
      <label>条数据</label>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Input, Tooltip } from '@h3/antd-vue';

@Component({
  name: 'h3-report-easy-limit-module',
  components: {
    AInput: Input,
    ATooltip: Tooltip,
  }
})
export default class ReportEasyLimitModule extends Vue {
  prefixCls = 'h3-report-easy-limit-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Limit;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => null }) data!: number | null;
  // 数据显示设置tip
  tipLabel = '显示前N条数据';

  change(e: any) {
    if (/^[0-9]+$/.test(e.data) || !e.data) {
      const limit = parseInt(e.target.value, 10);
      this.chart.data.limit = isNaN(limit) ? null : limit;
    }
  }

  getPopupContainer() {
    return this.$el;
  }
}
</script>
<style lang="less">
.h3-report-easy-limit-module{
  &__body{
    display: flex;
    align-items: center;
    label {
      font-weight: normal !important;
    }
  }
  &__input {
    width: 180px !important;
    margin: 0 8px !important;
  }
  &__input::-webkit-input-placeholder {
    color: #C9CCD8;
  }
  &__icon{
    margin-left: 6px;
    color: #8893A7;
  }
  .ant-tooltip-placement-right .ant-tooltip-arrow{
    border-right-color: #FFF;
  }
  .ant-tooltip {
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
