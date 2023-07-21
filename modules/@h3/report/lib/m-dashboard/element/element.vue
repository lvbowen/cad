<template>
  <div
    :class="[`${comPrefixCls}__item`]"
    :style="getItemStyle(element)"
  >
    <element-wrap-header
      v-if="element && element.type !== 'longText'"
      :fullScreenStatus="fullScreenStatus"
      :element="element"
      :global="global"
      :comPrefixCls="comPrefixCls"
      @full-screen="fullScreen"
    >
      <slot name="title" slot="title"/>
      <slot name="extra" slot="extra"/>
    </element-wrap-header>
    <element-wrap
      :chart="element"
      :status="'report'"
      :global="global"
      :refresh="refresh"
      @register-refresh="registerRefresh"
      @update-charts-data="updateChartsData"
    />
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Provide } from 'vue-property-decorator';
import { Mutation,namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';
import ElementWrap from '@h3/report/basics/components/mobile-element-wrap';
import ElementWrapHeader from './header.vue';
import {Color} from "@h3/report/basics/enum/paint";

const ReportPro = namespace('report');
@Component({
  name: 'h3-dashboard-mobile-element',
  components: {
    ElementWrapHeader,
    ElementWrap
  }
})
export default class DashboardMobileElement extends Vue {
  @Prop({
    default: 'h3-report-mobile'
  }) comPrefixCls!: string; // 父级样式
  @Prop({
    default: () => null
  }) element!: H3.Report.BaseElement; // 图表

  @Prop({ default: true }) refresh!: boolean;

  @Prop({ default: null}) global!: H3.Report.Global;

  @Prop({ default: false }) fullScreenStatus!: H3.Report.Global;
  
  @ReportPro.Mutation(ReportMutation.SETCHARTSDATA) setChartsData!: Function;
  @ReportPro.State('chartViewStatus') chartViewStatus!: { [chartUuid: string]: any };

  /**
   * 获取图表样式
   */
  getItemStyle(chart: H3.Report.Chart): string{
    const value = chart && (chart.styles && chart.styles.elementCoat && chart.styles.elementCoat.value) || this.global && this.global.styles.elementCoat.value;
    return `background-color:${value}`;
  }
  /**
   * 更新图表数据
   */
  updateChartsData(data: any) {
    this.setChartsData( { key: this.element.uid, data: data });
  }
  /**
   * 图表注册刷新事件
   */
  registerRefresh({ data, view, load, refreshViewStyles }) {
    this.chartViewStatus[this.element.uid] = {
      data: data || (()=> {}),
      view:view || (()=> {}),
      load:load || (()=> {}),
      refreshViewStyles: refreshViewStyles || (()=> {})
    };
  }
  /**
   * 传递全屏事件
   * @param chart
   * @param fullScreenStatus
   */
  fullScreen({ element, fullScreenStatus }) {
    this.$emit('full-screen', { element, fullScreenStatus });
  }

}
</script>
