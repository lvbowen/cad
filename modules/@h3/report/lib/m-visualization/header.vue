<template>
  <div :class="`${comPrefixCls}__item-header`">
    <slot name="title">
      <label>{{ chart.title }}</label>
    </slot>
    <div :class="[`${comPrefixCls}__btns`]">
      <a @click="refresh(chart)"><i class="h3yun_All reload-o"></i></a>
      <a @click="fullScreen(chart)"><i :class="fullScreenStyles"></i></a>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { ReportMutation, ReportAction } from '@h3/report/basics/store/dashboard/types';

const ReportPro = namespace('visualization');

@Component({
  name: 'h3-dashboard-element-header'
})
export default class DashboardElementHeader extends Vue {
  @Prop({
    default: ()=> ({})
  }) chart!: H3.Report.Chart; // 图表
  @Prop({
    default: false
  }) fullScreenStatus!: boolean; // 是否全屏
  @Prop({
    default: 'h3-report-element'
  }) comPrefixCls!: string;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  
  /**
   *是否全屏样式
   */ 
  get fullScreenStyles() {
    return {
      'h3yun_All': true,
      'fullscreen-o': !this.fullScreenStatus,
      'fullscreen-restore-o': this.fullScreenStatus
    };
  }
  /**
   * 刷新图表
   */
  refresh(chart: H3.Report.Chart) {
    this.resizeChartView({chart, type: 'data'});
  }

  /**
   * 全屏预览功能
   */
  fullScreen(chart: H3.Report.Chart) {
    this.$emit('full-screen', {
      chart,
      fullScreenStatus: this.fullScreenStatus
    });
  }
}
</script>
