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

@Component({
  name: 'h3-report-easy-dimension-limit-module',
  components: {
    AInput: Input,
  }
})
export default class ReportEasyDimensionLimitModule extends Vue {
  prefixCls = 'h3-report-easy-limit-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.DimensionLimit;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => null }) data!: number | null;
  change(e: any) {
    if (/^[0-9]+$/.test(e.data) || !e.data) {
      const limit = parseInt(e.target.value, 10);
      this.chart.styles.dimensionLimit = isNaN(limit) ? null : limit;
    }
  }
}
</script>
<style lang="less">

</style>
