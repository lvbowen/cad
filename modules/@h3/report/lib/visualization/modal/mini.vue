<template>
  <div :class="[prefixCls]">
    <div ref="mask" :class="[`${prefixCls}__mask`]"></div>
    <div
      style="transform: translate3d(100%, 0, 0);"
      ref="report"
      :class="contentClass"
    >
      <template v-if="!loading">
        <h3-report-easy
          v-show="module === 'report'"
          :refresh="module === 'report'"
          :class="[`${prefixCls}__warp`]"
          :prefixCls="prefixCls"
          @close="close"
          @add-chart="addChart"
          @edit-chart="editChart"
          @detail-chart="detailChart"
        />
        <h3-report-easy-detail
          v-if="module === 'detail'"
          :refresh="module === 'detail'"
          :class="[`${prefixCls}__warp`]"
          :chart="activeChart"
          :global="global"
          :prefixCls="prefixCls"
        />
        <h3-report-easy-edit
          v-if="module === 'edit'"
          :refresh="module === 'edit'"
          :class="[`${prefixCls}__warp`]"
          :chart="activeChart"
          :global="global"
          :prefixCls="prefixCls"
          @back="back"
        />
      </template>
      <Loading v-else/>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Watch, Provide } from 'vue-property-decorator';
import {State, Action, Mutation, namespace} from 'vuex-class';
import H3ReportEasy from '../report';
import H3ReportEasyDetail from '../detail';
import H3ReportEasyEdit from '../edit';
import Loading from '@h3/report/basics/components/loading';
import { dispatch } from '@h3/report/basics/utils/events';
import { ReportMutation, ReportAction } from '@h3/report/basics/store/visualization/types';
import { message } from "@h3/antd-vue";
import options from '@h3/report/dist/options';

options.message = message;

const Visualization = namespace('visualization');

@Component({
  name: 'h3-report-easy-modal',
  components: {
    H3ReportEasy,
    H3ReportEasyDetail,
    H3ReportEasyEdit,
    Loading
  }
})
export default class ReportEasyModal extends Vue {
  @Visualization.State('charts') charts!: Array<H3.Report.Chart>;
  @Visualization.State('global') global!: H3.Report.Global;
  @Visualization.State('chartsData') chartsData!: { [key: string]: any };
  @Visualization.State('activeChart') activeChart!: H3.Report.Chart;
  @Visualization.Action(ReportAction.GETREPORT) getReport!: Function;
  @Visualization.Mutation(ReportMutation.SETGLOBALFILTER) setGlobalFilter!: Function;
  @Visualization.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function;
  @Visualization.Mutation(ReportMutation.RESETREPORT) resetReport!: Function;
  prefixCls = 'h3-report-easy-modal';
  schemaCode: string = '';
  module = 'report';
  fullScreen: boolean = false;
  initState = false;
  loading = false;
  showState = 'hidden';
  preModule = '';
  preFullScreen = false;
  preChart: H3.Report.Chart | undefined;
  options: any = {
    closeCallback: null,
    addCallback:null,
    backCallback:null,
    editCallback: null,
    detailCallback: null
  };

  get contentClass() {
    return {
      'h3-report-easy-modal__content': true,
      'h3-report-easy-modal__report': this.module === 'report',
    };
  }

  @Watch('fullScreen')
  watchFullScreen(val: boolean) {
    this.$el.classList.toggle(`${this.prefixCls}--full`, val);
  }
  /**
   * 处理放大缩小
   * @param fullScreen
   * @param module
   * @param chart
   * @param isAdd
   */
  @Provide()
  handleScreen(fullScreen: boolean, module: string, chart: H3.Report.Chart, isAdd = false) {
    if (module) {
      this.preModule = this.module;
      this.preFullScreen = this.fullScreen;
      this.preChart = chart;
      this.module = module;
      this.fullScreen = fullScreen;
    } else {
      this.module = this.preModule;
      module = this.preModule;
      this.fullScreen = this.preFullScreen;
      chart = this.charts.find((oChart: H3.Report.Chart) => oChart.uid === (this.preChart as any).uid) as any;
    }
    if (chart) {
      this.setActiveChart(chart);
    } else {
      this.setActiveChart();
    }
  }
  
  close() {
    this.hide();
    (this.$refs.mask as HTMLDivElement).removeEventListener('click', this.bodyClick, false);
  }
  // option集成新增图表事件
  addChart() {
    if (this.options.addCallback instanceof Function) {
      this.options.addCallback();
    }
  }
  /**
   * 放大图表详情
   */
  detailChart() {
    if (this.options.detailCallback instanceof Function) {
      this.options.detailCallback();
    }
  }
  /**
   * 编辑图表
   */
  editChart() {
    if (this.options.editCallback instanceof Function) {
      this.options.editCallback();
    }
  }
  // option集成编辑返回事件
  back() {
    if (this.options.backCallback instanceof Function) {
      this.options.backCallback();
    }
  }

  toggle(schemaCode: string, filter?:H3.Yun.Filter) {
    if (this.showState === 'show') {
      this.hide();
      return false;
    }
    this.show(schemaCode, filter);
    return true;
  }

  /**
   * 变更筛选条件
   * @param filter
   */
  filter(filter?:H3.Yun.Filter) {
    if (filter) {
      this.setGlobalFilter(filter);
    }
  }

  /**
   * 显示报表
   * @param schemaCode
   * @param filter
   */
  show(schemaCode: string, filter?:H3.Yun.Filter) {
    this.schemaCode = schemaCode;
    this.module = 'report';
    this.fullScreen = false;
    const report = this.$refs.report as HTMLDivElement;
    (this.$el as HTMLDivElement).style.display = 'block';
    report.classList.remove('h3-report-easy-modal--out');
    report.classList.add('h3-report-easy-modal--in');
    setTimeout(() => {
      report.setAttribute('style', 'transform:translate3d(0, 0, 0);');
      (this.$refs.mask as HTMLDivElement).addEventListener('click', this.bodyClick, false);
      this.loading = true;
      setTimeout(() => {
        (this.getReport(this.schemaCode) as Promise<any>).then(() => {
          if (filter) {
            this.setGlobalFilter(filter);
          }
          this.loading = false;
        }).catch(() => {
        });
      }, 300);
    }, 50);
    this.showState = 'show';
    this.$emit('show');
  }
  hide(animate:boolean = true) {
    const report = this.$refs.report as HTMLDivElement;
    report.classList.remove('h3-report-easy-modal--in');
    report.classList.add('h3-report-easy-modal--out');
    if (animate) {
      report.setAttribute('style', 'transform:translate3d(100%, 0, 0);');
    } else {
      report.setAttribute('style', 'display: none;transform:translate3d(100%, 0, 0);');
      this.resetReport();
    }
    this.showState = 'hidden';
    if (this.options.closeCallback instanceof Function) {
      this.options.closeCallback();
    }
  }
  transitionend(e: TransitionEvent) {
    const el = e.target as HTMLDivElement;
    if (el.classList.contains('h3-report-easy-modal--out')) {
      (this.$el as HTMLDivElement).style.display = 'none';
      this.resetReport();
    }
    if (e.propertyName === 'width') {
      dispatch(window, 'resize');
    }
  }
  bodyClick(e: Event) {
    this.close();
  }
  mounted() {
    this.$el.addEventListener('transitionend', this.transitionend as EventListenerOrEventListenerObject, false);
  }
  destroyed() {
    this.$el.removeEventListener('transitionend', this.transitionend as EventListenerOrEventListenerObject, false);
  }
}
</script>
<style lang="less">
@import "../style/index.less";
</style>
