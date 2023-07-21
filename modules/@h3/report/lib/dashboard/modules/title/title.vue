<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`, `${comPrefixCls}__header`]">
      <label :class="[`${prefixCls}__title`]">{{ module.title }}</label>
    </div>
    <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
      <a-input
        :value="data"
        :defaultValue="data"
        @change="change($event)"
        placeholder="图表标题"
      />
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
import {
  Input,
  Tooltip,
} from '@h3/antd-vue';
import { namespace } from 'vuex-class';
const ReportPro = namespace('report');

@Component({
  name: 'h3-report-title-module',
  components: {
    AInput: Input
  }
})
export default class ReportChartTitle extends Vue {
  prefixCls = 'h3-report-title-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.ChartTitle;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => '' }) data!: string;

  /**
   * 输入框change事件
   * @param e
   */
  change(e) {
    this.chart.title = e.target.value;
  }
}
</script>
<style lang="less">
 .h3-report-title-module{
  border-bottom: none !important;
  &__body {
    margin-top: 8px;
  }
  input{
    width: 100%;
    height: 32px;
    padding: 6px 8px;
    color: #304265;
    border-radius: 4px;
    border:1px solid rgba(212,215,224,1);
    font-size:14px;
    font-weight:400;
    line-height:20px;
  }
  input::placeholder{
    color: #C9CCD8;
  }
 }
</style>
