<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div
      v-for="(item, mainIndex) of module.data"
      :key="`Type${mainIndex}`"
      :class="`${prefixCls}__part`"
    >
      <div :class="`${prefixCls}__title`"> {{ item.title }}</div>
      <div :class="`${prefixCls}__icon`">
        <div
          v-for="(option, index) of item.options"
          :key="index"
          :class="getIconClass(mainIndex, option)"
          @click="change(mainIndex, option)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang=ts>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-multiple-type-module',
})
export default class MultiMetricType extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.MultiMetricType;
  @Prop() data!: Array<'bar' | 'line' | 'area' | 'pileBar'>;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = 'h3-report-multi-type-module';

  /**
   * 获取当前类型图标及其状态
   */
  getIconClass(index, icon) {
    let disabled = this.getState(index, icon);
    let iconState = this.data[index] === icon ? '-selected' : disabled && index !== 0 ? '-disabled' : '';
    return `${this.prefixCls}__icon-item h3-report-chart__logo${iconState}--${icon}`
  }

  /**
   * 计算是否是不可点击类型
   */
  getState(index, icon) {
    return this.data.some((i, iconIndex) => {
      return i === icon && index !== iconIndex
    });
  }

  /**
   * onchange事件
   * @param index
   * @param icon
   */
  change(index, icon: 'bar' | 'line' | 'area' | 'pileBar') {
    let hasType = this.getState(index, icon);
    if(index && hasType) return ;
    if(!index && hasType) {
      this.data.forEach((i, iconIndex) => {
       if(index !== iconIndex) {
         this.$set(this.data, iconIndex, this.module.data[iconIndex].options.find((key: string) => key !== icon));
       }
      });
    }
    this.$set(this.data, index, icon);
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
}
</script>

<style lang='less'>
 @import "~@h3/report/basics/styles/index";
.h3-report-multi-type-module{
  border-bottom: none !important;
  &__part {
    margin-bottom: 16px;
    &:last-child{
      margin-bottom: 0;
    }
  }
  &__title{
    color: #304265;
    font-size: 14px;
    line-height: 22px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  &__icon{
    display: flex;
    &-item{
      margin: 0 0 0 19px;
    }
    &-item:nth-child(4n + 1) {
      margin-left: 0;
    }
  }
  @chartType: bar, area, pileBar, line;
  .workflowActionLoop(1);

}
</style>
