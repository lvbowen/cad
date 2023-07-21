<!-- 图表内容 -->
<template>
  <div :class="prefixCls">
    <!-- 图表额外 切换图表的按钮等-->
    <slot name="head"/>
    <!-- 图表 -->
    <chart-wrap
      ref="chartWrap"
      :class="`${prefixCls}__chart-wrap`"
      :api="api"
      :chart="chart"
      :status="status"
      :global="global"
      :refresh="refresh"
      :filters="globalFilters"
      :delay="0"
      :edit="edit"
      @refresh-end="refreshEnd"
      @register-refresh="registerRefresh"
      @change="changeChart"
      @click-chart="clickChart"
    />

    <!-- 展示区脚部 -->
    <slot name="footer"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/analysis/types";
import { ReportState } from "@h3/report/basics/enum/report-state";
import { TabState } from "@h3/report/basics/enum/module-state";
import ChartWrap from "@h3/report/basics/components/element-wrap";
import { ElementType } from "@h3/report/basics/enum/chart-type";
import ChartMixins from "@h3/report/basics/mixins/chart-mixins";
import ChangeChartMixin from "../../mixins/change-chart-mixins";
import { analysisApi } from "@h3/report/basics/service/analysis";
import { ModuleState } from "@h3/report/basics/enum/module-state";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-chart-detail",
  components: {
    ChartWrap
  }
})
export default class ElementWrap extends Mixins(ChartMixins, ChangeChartMixin) {
  // @Prop({ default: null }) status!: ReportState;
  @Prop({ default: ModuleState.VIEW }) moduleState!: ModuleState;
  @Prop({ default: true }) refresh!: boolean;
  @Prop({ default: true }) edit!: boolean;
  @Analysis.State("chartViewStatus") chartViewStatus!: { [chartUuid: string]: any };
  @Analysis.State("global") global!: any;
  @Analysis.State("activeTab") activeTab!: TabState;
  @Analysis.State("globalFilters") globalFilters!: Array<H3.Report.FilterFieldColumn>; // 全局筛选器
  @Analysis.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function;
  @Analysis.Action(ReportAction.SAVEOWNERCHART) saveOwnerChart!: Function;
  @Analysis.Action(ReportAction.SAVECHART) saveChart!: Function;

  prefixCls: string = "h3-analysis-chart-detail";
  api = analysisApi;
  // 时间变量做防抖
  loadTimer: any = null;
  source: H3.Report.MapColumn | null = null;
  /**
   * 图表加载完的时机
   */
  refreshEnd() {
    if (
      this.chart.type === ElementType.BAR ||
      this.chart.type === ElementType.LINE ||
      this.chart.type === ElementType.STRIPE ||
      this.chart.type === ElementType.BIAX
    ) {
      if (this.chart.data && this.chart.data.dimension && this.chart.data.sort) {
        let firstField = this.chart.data.dimension[0]; // 一级维度
        let sortField = this.chart.data.sort.find(field => {
          return field.uid === firstField.uid;
        });
        if (
          sortField &&
          sortField.options &&
          sortField.options.order === "asc" &&
          firstField.type === "date"
        ) {
          // 滚动条是异步加载的
          setTimeout(() => {
            this.$nextTick(() => {
              let vnode = this.findVnode(this.$refs.chartWrap, "scroll");
              if (vnode) {
                vnode.setForceScroll(vnode.maxX, 0);
              }
            });
          }, 400);
        }
      }
    }
  }
  /**
   * 点击图表
   */
  clickChart(option: { filters: Array<H3.Report.FieldColumn>; params: any }) {
    if (this.chart.type === (ElementType.MAP as any) && option.params) {
      // this.mapDrill({ chart: this.chart, params: option.params, });
    }
  }
  /**
   * 处理图表改变
   */
  changeChart(element: H3.Report.Chart) {
    switch (element && element.type) {
      case `${ElementType.TABLE}`:
        this.setActiveChart(element);
        this.$emit("change-columns", element);
        break;
      default:
    }
  }

  /**
   * 图表注册刷新事件
   */
  registerRefresh({ data, view, load }) {
    this.chartViewStatus[
      this.moduleState === ModuleState.VIEW ? "view" + this.chart.uid : this.chart.uid
    ] = {
      data: data || (() => {}),
      view: view || (() => {}),
      load: load || (() => {})
    };
  }
  /**
   * 递归查找所需Vnode
   */
  findVnode(vnodeWrap, name) {
    if (vnodeWrap.$refs && vnodeWrap.$refs[name]) {
      return vnodeWrap.$refs[name];
    } else {
      if (vnodeWrap.$children && vnodeWrap.$children.length) {
        for (let child of vnodeWrap.$children) {
          let vnode = this.findVnode(child, name);
          if (vnode) return vnode;
        }
      }
    }
  }

  /**
   * 缩略轴变化时事件
   */
  onDatazoomChange(event) {
    let start = 0;
    let end = 100;
    const e = event.detail;
    if (e.end) {
      start = e.start.toFixed(2);
      end = e.end.toFixed(2);
    } else if (e.batch) {
      start = e.batch[0].start.toFixed(2);
      end = e.batch[0].end.toFixed(2);
    }
    let chart = this.chart as H3.Report.Chart;
    if (chart && chart.styles && chart.styles.dataZoom) {
      chart.styles.dataZoom.start = start;
      chart.styles.dataZoom.end = end;
    }
    console.log("start", start, "end", end);
    clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => {
      // this.$emit("change-datazoom", {
      //   show: true,
      //   start,
      //   end
      // });
      this.changeDataZoom({
        show: true,
        start,
        end
      });
    }, 500);
  }

  mounted() {
    window.addEventListener(`DatazoomChange-${this.chart.uid}`, this.onDatazoomChange);
  }
  created() {}

  destroyed() {
    window.removeEventListener(`DatazoomChange-${this.chart.uid}`, this.onDatazoomChange);
  }
}
</script>
