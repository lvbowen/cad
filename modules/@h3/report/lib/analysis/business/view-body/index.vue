<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__contains`" ref="wrap">
      <template v-if="charts.length">
        <chart-panel
          v-for="(chart, index) in charts"
          :class="`${prefixCls}__item`"
          :key="chart.uid"
          :chart="chart"
          :chartIndex="index"
          :index="index"
          :toolOptions="toolOptions"
          :editTitle="editTitle"
          @edit="editChart"
          @preview="previewChart"
          @drag="dragStart"
        >
        </chart-panel>
      </template>

      <view-empty
        v-else
        :allowAdd="showAdd"
        @add-chart="emptyAddChart"
      ></view-empty>
    </div>
    <div
      :class="`${prefixCls}__btn`"
      @click="addChart"
      v-if="showAdd && charts.length"
    >
      新增图表
    </div>
    <div ref="warp" :class="listSortClass">
      <element-list-sort
        key="listSort"
        @end="dragEnd"
        ref="elementListSort"
        v-model="innCharts"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Prop, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import ElementListSort from "../element-list-sort";
import ViewEmpty from "./empty.vue";
import ChartPanel from "../chart-panel/index";
import ViewMixin from "../../mixins/view-mixins";
import { TabState } from "@h3/report/basics/enum/module-state";
import { scrollTop } from "@h3/report/basics/utils/scroll";
import { closest } from "@h3/report/basics/utils/dom";
import { ReportMutation, ReportAction } from "@h3/report/basics/store/analysis/types";
import { analysisApi } from "@h3/report/basics/service/analysis";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-view-body",
  components: {
    ViewEmpty,
    ChartPanel,
    ElementListSort
  }
})
export default class ViewBody extends Mixins(ViewMixin) {
  prefixCls: string = "h3-analysis-view-body";
  @Prop({ default: true }) showAdd!: boolean; // 是否展示新增
  @Prop({ default: () => [] }) toolOptions!: Array<string>; // 图表的工具栏配置
  @Prop({ default: true }) editTitle!: boolean; // 是否可以修改图表
  @Analysis.State("charts") charts!: Array<H3.Report.Chart>;
  @Analysis.State("chartsInfo") chartsInfo!: Array<{ [key: string]: H3.Analysis.ChartInfo }>;
  @Analysis.Mutation(ReportMutation.SETCHARTS) setCharts!: Function;
  @Analysis.Mutation(ReportMutation.SETACTIVETAB) setActiveTab!: Function; // 设置统计分析激活模块
  @Analysis.Action(ReportAction.SAVECHARTS) saveCharts!: Function;
  @Analysis.Action(ReportAction.GETCHARTSLENGTH) getChartsLength!: Function;
  @Analysis.Action(ReportAction.GETOBJECTID) getObjectId!: Function;
  @Analysis.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function; // 刷新

  // 拖拽排序是否显示
  sortShow = false;

  get innCharts() {
    return this.charts;
  }
  /**
   * 拖拽排序样式
   */
  get listSortClass() {
    return {
      "list-sort-wrap": true,
      "list-sort-wrap--in": this.sortShow
    };
  }

  set innCharts(val) {
    this.setCharts(val);
  }

  /**
   * 没有图表的时候
   */
  emptyAddChart(parms) {
    const { tabState, allAdd } = parms;
    if (!allAdd && tabState === TabState.PUBLIC) {
      this.getChartsLength()
        .then((res: number) => {
          if (res && res > 20) {
            this.addChart(false);
          } else {
            this.setActiveTab(TabState.PERSON);
            // 更新objectId
            this.getObjectId(TabState.PERSON);
            this.addChart();
          }
        })
        .catch(() => {});
    } else {
      this.addChart();
    }
  }
  /**
   * 开始拖拽
   */
  dragStart(index, e: MouseEvent) {
    const parent = closest(e.target as HTMLElement, `.${this.prefixCls}__item`);
    if (parent && e.button === 0) {
      const rect = parent.getBoundingClientRect();
      this.sortShow = true;
      this.$nextTick(() => {
        (this.$refs.elementListSort as any).setActive({
          x: e.clientX,
          y: e.clientY,
          element: index,
          top: rect.top
          // delay: 200
        });
      });
    }
  }
  /**
   * 结束拖拽
   */
  dragEnd(evt: H3.Draggable.Event) {
    this.sortShow = false;
    if (evt.hasOwnProperty("newIndex")) {
      this.$nextTick(() => {
        const rect = this.$el.getBoundingClientRect();
        const wrap = this.$refs.wrap as HTMLElement;
        const elRect = (wrap.childNodes[
          (evt as any).newIndex
        ] as HTMLDivElement).getBoundingClientRect();

        scrollTop(wrap, wrap.scrollTop + elRect.top - rect.top - 12, 300);

        if (evt.oldIndex !== evt.newIndex && typeof evt.newIndex === "number") {
          this.innCharts.forEach((chart: H3.Report.Chart, index: number) => {
            chart.i = this.innCharts.length - index + 1;
          });
          // 兼容日期滚动到最后的问题
          this.resizeChartView({
            chartId: "view" + this.innCharts[evt.newIndex].uid,
            type: "view"
          });
          this.saveCharts(this.innCharts)
            .then(() => {})
            .catch(() => {});
        }
      });
    }
  }

  created() {}
}
</script>

<style lang="less">
@import "./index.less";
</style>
