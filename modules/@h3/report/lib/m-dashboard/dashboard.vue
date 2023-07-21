<template>
  <div :class="getClass" :style="getStyle">
    <div
      v-if="!loading && charts.length"
      v-h3-lazy-load="{ selector: `.${prefixCls}__item`, callback: lazyLoadChart, delay: 500 }"
      :class="getCanvasClass"
    >
      <h3-report-element
        v-for="chart in getCharts"
        :key="chart.uid"
        :element="chart"
        :global="global"
        :refresh="false"
        :data-id="chart.uid"
        :comPrefixCls="prefixCls"
        @full-screen="fullScreen"
      />
      <backdoor><br/></backdoor>
      <filter-entry v-if="showFilter" :comPrefixCls="prefixCls"/>
      <full-screen
        ref="fullScreen"
        v-if="fullScreenChart"
        :comPrefixCls="prefixCls"
        :theme="getStyle"
        :global="global"
        :element="fullScreenChart"
        @full-screen="fullScreen"
      />
    </div>
    <div
      v-else-if="!loading && !charts.length"
      :class="[`${prefixCls}__canvas`, `${prefixCls}__canvas--empty`]"
    >
      <img src="@h3/report/basics/assets/m-empty.svg"/>
      <label>当前页无图表，请先在电脑端配置图表</label>
    </div>
    <h3-loading v-else/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide } from "vue-property-decorator";
import { namespace } from "vuex-class";
import "@h3/thinking-ui/dist/index.css";
import H3ReportElement from "./element";
import FilterEntry from "./filter-picker";
import FullScreen from "./full-screen.vue";
import { getNewReportState } from "@h3/report/basics/store/dashboard";
import { ReportMutation, ReportAction } from "@h3/report/basics/store/dashboard/types";
import H3Loading from "@h3/report/basics/components/loading";
import { judgeMobile } from "@h3/report/basics/utils/browser";
import H3LazyLoad from "@h3/report/basics/directives/lazy-load";
import { Color, paints } from "@h3/report/basics/enum/paint";
import options from "@h3/report/dist/options";
import { ReportState } from "@h3/report/basics/enum/report-state";
import Backdoor from "@h3/report/basics/components/mobile-backdoor";

const ReportPro = namespace("report");
@Component({
  name: "h3-dashboard-mobile",
  components: {
    H3ReportElement,
    FullScreen,
    H3Loading,
    FilterEntry,
    Backdoor
  },
  directives: {
    H3LazyLoad
  }
})
export default class DashboardMobile extends Vue {
  @Prop({ default: null }) value!: string; // 报表标题
  @Prop({ default: null }) corpId!: string; // 公司Id
  @Prop({ default: null }) reportId!: string; // 报表Id
  @Prop({ default: () => ({}) }) config!: any; // 业务配置
  @Prop({ default: () => null }) integrateComponents!: Function; // 业务整合的服务
  @Prop({ default: () => null }) classification!: Function; // 字段类型分类
  @Prop({ default: () => null }) header!: any; // 头部控件
  @ReportPro.State("global") global!: H3.Report.Global;
  @ReportPro.State("charts") charts!: Array<H3.Report.Chart>;
  @ReportPro.Action(ReportAction.GETREPORT) getReport!: Function;
  @ReportPro.Mutation(ReportMutation.INITREPORT) initReport!: Function;
  @ReportPro.Mutation(ReportMutation.SETREPORTOPTIONS) setReportOptions!: Function;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;

  @Provide() isMobile = true;
  prefixCls = "h3-dashboard-mobile";
  loading = true;
  fullScreenChart: H3.Report.Chart | null = null;

  /**
   * 是否展示过滤器
   */
  get showFilter() {
    return options.mobile && options.mobile.filter;
  }
  /**
   * 获取图表集合
   */
  get getCharts() {
    let charts: Array<H3.Report.Chart> = this.charts.filter(
      (item: H3.Report.Chart | H3.Report.FilterPicker) => {
        return item.type !== "filterPicker";
      }
    );
    return charts.sort((chart1: H3.Report.Chart, chart2: H3.Report.Chart) => {
      if (chart1.y < chart2.y || (chart1.y === chart2.y && chart1.x < chart2.x)) {
        return -1;
      }
      return 1;
    });
  }
  /**
   * 获取筛选器集合
   */
  get getFilters() {
    return this.charts.filter((item: H3.Report.Chart | H3.Report.FilterPicker) => {
      return item.type === "filterPicker";
    });
  }
  /**
   * 获取class
   */
  get getClass() {
    return {
      [this.prefixCls]: true,
      [judgeMobile() as string]: true,
      "h3-report-paint": this.global.styles.paintCoatTheme !== "default",
      [this.global.styles.paintCoatTheme]: true
    };
  }
  get getCanvasClass() {
    return {
      [`${this.prefixCls}__canvas`]: true,
      [`${this.prefixCls}__canvas--full`]: this.fullScreenChart
    };
  }
  /**
   * 获取样式
   */
  get getStyle() {
    if (this.global.styles) {
      const paint = paints[this.global.styles.paintCoatTheme];
      if (paint) {
        if (paint.paintCoatType === "bgPicture") {
          return `background:url(${paint.paintCoatValue}) no-repeat center center`;
        } else {
          return `background-color:${this.global.styles.paintCoat.value}`;
        }
      }
    }
    return null;
  }

  /**
   * 设置仪表盘配置项
   */
  setDashboardOptions(): void {
    const dashboardOptions: any = {};
    if (this.corpId) {
      dashboardOptions.corpId = this.corpId;
    }
    if (this.reportId) {
      dashboardOptions.reportId = this.reportId;
    }
    if (this.config) {
      dashboardOptions.config = this.config;
    }
    if (this.integrateComponents) {
      dashboardOptions.integrateComponents = this.integrateComponents;
    }
    if (this.classification) {
      dashboardOptions.classification = this.classification;
    }
    this.setReportOptions(Object.assign({}, options, dashboardOptions));
  }

  /** 图表懒加载
   * @param entries
   */
  lazyLoadChart(entries: Array<IntersectionObserverEntry>) {
    entries.forEach((entry: IntersectionObserverEntry) => {
      const chart: string = entry.target.getAttribute("data-id") as string;
      const type: string = !entry || entry.isIntersecting ? "load" : "";
      this.resizeChartView && this.resizeChartView({ chart, type });
    });
  }
  /**
   * 加载仪表盘
   */
  async loadDashboard() {
    this.loading = true;
    this.setDashboardOptions();
    this.getReport({ corpId: this.corpId, reportId: this.reportId, type: ReportState.DASHBOARD })
      .then(res => {
        this.$emit("report-loaded");
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
  }

  fullScreen({ element, fullScreenStatus }) {
    if (!fullScreenStatus) {
      this.fullScreenChart = element;
    } else {
      this.fullScreenChart = null;
    }
    (this.$el as HTMLDivElement).classList.toggle(`${this.prefixCls}__full`);
  }
  async created() {
    if (!this.$store.state.report) {
      this.$store.registerModule("report", getNewReportState());
    } else {
      this.initReport();
    }
    await this.loadDashboard();
  }

  destroyed(): void {
    //this.$store.unregisterModule('report');
  }
}
</script>
<style lang="less">
@import "./style/index.less";
</style>
