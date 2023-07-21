<template>
  <div :class="prefixCls">
    <view-head>
      <slot name="center">
        <radio-button
          v-model="activeTab"
          :options="tabList"
          :tip="tabTip"
          @change="changeTab"
        ></radio-button>
      </slot>
    </view-head>
    <!-- 设计器头部 -->
    <template v-if="!loading">
      <view-body
        :active="activeTab"
        :showAdd="canAdd"
        :toolOptions="toolOptions"
        :editTitle="editTitle"
        @add-chart="addChart"
        @edit-chart="editChart"
        @preview-chart="previewChart"
      ></view-body>
    </template>
    <loading v-else></loading>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject, Provide, Mixins } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { TabState } from "@h3/report/basics/enum/module-state";
import Loading from "@h3/report/basics/components/loading";
import { TabOptions } from "../config/static-option";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/analysis/types";
import ViewHead from "../business/view-head";
import ViewBody from "../business/view-body";
import RadioButton from "../component/radio-button/index";
import ViewMixin from "../mixins/view-mixins";
import RoleMixin from "../mixins/role-mixins";

const Analysis = namespace("analysisState");

@Component({
  name: "h3-analysis-view",
  components: {
    ViewHead,
    RadioButton,
    Loading,
    ViewBody
  }
})
export default class AnalysisView extends Mixins(ViewMixin, RoleMixin) {
  @Prop({ default: () => {} }) animations!: H3.Report.AnimationGroup; // 注入动画
  @Prop({ default: () => false }) refresh!: boolean; // 是否刷新
  @Prop({ default: () => [] }) filters!: Array<H3.Yun.Filter>; // 外部传入的筛选条件
  @Analysis.State("activeChart") activeChart!: H3.Report.Chart; // 当前激活图表
  @Analysis.State("charts") charts!: Array<H3.Report.Chart>; // 图表集合
  @Analysis.State("chartsInfo") chartsInfo!: Array<{ [key: string]: any }>; // 图表私人信息的集合
  @Analysis.Action(ReportAction.GETREPORT) getReport!: Function; // 获取报表信息
  @Analysis.Mutation(ReportMutation.SETACTIVETAB) setActiveTab!: Function; // 设置统计分析激活模块
  @Analysis.Mutation(ReportMutation.SETGLOBALFILTER) setGlobalFilter!: Function; // 设置全局筛选
  @Analysis.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function; // 刷新图表
  @Analysis.Mutation(ReportMutation.SETCHARTS) setCharts!: Function; // 更新图表

  prefixCls: string = "h3-analysis-view";
  loading: boolean = false;
  // 时间变量做防抖
  loadTimer: any = null;
  // Tab配置
  tabList: Array<H3.RadioButton.Options> = TabOptions;
  /**
   * 监听外部筛选条件，更新图表
   * @param filters
   */
  @Watch("filters", { deep: true })
  watchFilters(filters: Array<H3.Yun.Filter>) {
    if (filters) {
      this.setGlobalFilter(filters);
    }
    this.updateAllChartData();
  }

  @Watch("refresh")
  toRefreshCharts(value: boolean) {
    if (value) {
      this.getAnalysisReport();
    }
  }
  /**
   * Tab提示（红点）
   */
  get tabTip() {
    let hasView;
    if (this.activeTab === TabState.PUBLIC && this.chartsInfo) {
      hasView = Object.values(this.chartsInfo).find(item => {
        return item.viewStatus === 0;
      });
      return hasView ? TabState.PUBLIC : null;
    }
  }
  /**
   *  公共区域非管理员的排序信息替换个人排序信息
   */
  updateCharts() {
    if (!this.editTitle && this.activeTab === TabState.PUBLIC && this.chartsInfo) {
      let charts = this.charts.map(item => {
        if (
          item.data.sort &&
          this.chartsInfo[item.uid] &&
          this.chartsInfo[item.uid].content &&
          this.chartsInfo[item.uid].content.sort
        ) {
          item.data.sort = this.chartsInfo[item.uid].content.sort;
        }
        if (
          item.styles.dataZoom &&
          this.chartsInfo[item.uid] &&
          this.chartsInfo[item.uid].content &&
          this.chartsInfo[item.uid].content.dataZoom
        ) {
          item.styles.dataZoom = this.chartsInfo[item.uid].content.dataZoom;
        }
        return item;
      });
      this.setCharts(charts);
    }
  }

  /**
   * 更新每个图表的数据
   */
  updateAllChartData() {
    this.charts.forEach(chart => {
      this.resizeChartView({ chartId: "view" + chart.uid, type: "data" });
    });
  }

  /**
   * 获取统计分析数据
   * @param state 0 表示请求个人 1表示公共
   */
  getAnalysisReport(state?: TabState) {
    this.loading = true;
    clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => {
      this.getReport(state)
        .then(() => {
          this.loading = false;
          this.updateCharts();
          this.$emit("refresh-end");
          // 动画
          if (this.animations && this.animations.zoomIn) {
            this.animations.zoomIn();
          }
        })
        .catch(() => {
          // 默认激活公共
          this.loading = false;
        });
    }, 500);
  }

  /**
   * 切换个人/公共
   * @param value
   */
  @Provide()
  changeTab(value: TabState) {
    this.setActiveTab(value);
    this.getAnalysisReport(value);
  }

  created() {
    this.getAnalysisReport();
  }

  destoryed() {
    clearTimeout(this.loadTimer);
    if (this.animations && this.animations.zoomOut) {
      this.animations.zoomOut();
    }
  }
}
</script>
