<template>
  <div :class="[prefixCls, comPrefixCls]">
    <div :class="`${prefixCls}__header`">
      <label>图表配色</label>
    </div>
    <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
      <label>图表配色</label>
      <color-select
        :value="themeType"
        @change="onChange"
      ></color-select>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';
import colors from '@h3/report/basics/enum/colors';
import ColorSelect from '@h3/report/basics/components/color-select/index';

const ReportPro = namespace('report');

@Component({
  name: 'h3-report-theme-module',
  components: {
    ColorSelect
  }
})
export default class ReportThemeModule extends Vue {
  prefixCls = 'h3-report-theme-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) modules!: H3.ReportModules.ChartModules;
  @Prop({ default: () => ([]) }) data!: H3.Report.Theme;
  @ReportPro.State('global') global!: H3.Report.Global;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  themes: Array<any> = colors;

  get themeType() {
    return this.data.type !== '' ? this.data.type : (this.global.styles.theme as any).type;
  }

  getPopupContainer() {
    return this.$el;
  }

  onChange(values: any) {
    (this.chart.styles.theme as any).type = values;
    for (let i of colors) {
      if (i.type === values) {
        (this.chart.styles.theme as any).colors = i.colors;
      }
    }
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
}
</script>

<style lang="less">
 .h3-report-theme-module{
    border-bottom: none !important;
   &__header {
     label {
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      margin-bottom: 0;
      color: #304265;
     }
   }
   &__body{
    padding-top: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    label {
      color: #304265;
      font-size: 14px;
    }
  }
  .h3-report-color-select {
    width: 118px;
    height: 32px;
  }
 }
</style>
