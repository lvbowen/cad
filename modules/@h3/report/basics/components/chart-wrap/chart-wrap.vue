<template>
  <div :class="prefixCls" >
    <loading v-if="loading"/>
    <template v-else>
      <chart-wrap-placeholder
        v-if="showPlaceholder"
        :chart="chart"
        :comPrefixCls="prefixCls"
        :data="isData"
        :errorMsg="errMsg"
        :isLoadData="isLoadData"
      />
      <chart
        v-else
        ref="chart"
        :chart="chart"
        :global="global"
        :dataAlias="dataAlias"
        :data="innerData"
        :source="source"
        :api="api"
        :delay="delay"
        :data-total="dataTotal"
        :refresh="refresh"
        @click-chart="clickChart"
        @refresh-end="refreshEnd"
        @load-chart-data="loadChartData"
        @change="changeChart"
        @drill-down="drillDown"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins, InjectReactive } from "vue-property-decorator";
import Loading from "../loading";
import {dashboardApi} from "../../service/dashboard/";
import ChartMixins from "../../mixins/chart-mixins";
import {ReportState} from "../../enum/report-state";
import {ResizeSensor} from "css-element-queries";
import ChartWrapPlaceholder from "./placeholder.vue";
import Chart from "./chart.vue";
import {ElementType} from "@h3/report/basics/enum/chart-type";

import {handleChartRequestParams} from "../../utils/report-element";
import {resultFilterData} from "../../utils/result-filter";
import axios from "axios";
import env from "../../../../../../entries/portal/src/config/env";
// import env from "../../../../../../entries/admin/src/env";
@Component({
  name: "h3-report-chart-wrap",
  components: {
    Chart,
    Loading,
    ChartWrapPlaceholder
  }
})
export default class ReportChartWrap extends Mixins<ChartMixins>(ChartMixins) {
  @Prop({default: null}) chart!: H3.Report.Chart;
  @Prop({default: null}) global!: H3.Report.Global;
  @Prop({default: () => dashboardApi}) api!: H3.ReportAPI.Instance;
  @Prop({default: ReportState.DESIGN}) status!: ReportState;
  @Prop({default: false}) refresh!: boolean;
  @Prop({default: null}) computedStyle!: any;
  @Prop({default: 200}) delay!: number;
  @Prop({default: null}) corpId!: string;
  @Prop({default: null}) data!: any;
  @InjectReactive('projectConfig') projectConfig?:any;

  prefixCls = "h3-report-chart";
  dataAlias = {};
  source: H3.Report.MapColumn | null = null; // 数据来源，暂时只有地图类型有
  innerData: any = null;
  updateTimer: any = 0;
  loading = false;
  errMsg: string | boolean = false;
  // 明细表的总条数 其他图表暂时没有
  dataTotal: number = 0;
  isLoadData = false;
  wrapWidth = 0;
  resizeSensor: ResizeSensor | null = null;

  @Watch("data", {immediate: true})
  watchData() {
    if (this.data) {
      this.isLoadData = true;
      this.innerData = this.data;
    }
  }

  /**
   * 是否展示占位图
   */
  get showPlaceholder() {
    let show = true;
    if (
        this.chart &&
        this.checkChart &&
        this.isLoadData &&
        !this.errMsg &&
        this.isData &&
        this.isData.length
    ) {
      show = false;
    }
    return show;
  }

  /**
   * 获取图表wrap样式
   */
  // get getStyle() {
    // const paintCoatTheme = this.global && this.global.styles.paintCoatTheme;
    // const style: any = {};
    // if (this.computedStyle) {
    //   if (this.computedStyle.height) {
    //     style.height = `${this.computedStyle.height}px`;
    //   }
    //   if (this.computedStyle.width) {
    //     style.width = `${this.computedStyle.width}px`;
    //   }
    // }
    // style.backgroundColor = paintCoatTheme === "default" ? "inherit" : "transparent";
    // return style;
  // }

  /**
   * 判断图表是否有数据
   */
  get isData() {
    let data: any = null;
    if (this.innerData) {
      if (this.chart.type === "table") {
        if (this.innerData.data || this.innerData.summary) {
          data = this.innerData.data || this.innerData.summary;
        }
      } else {
        data = this.innerData;
      }
    }

    return data;
  }

  /**
   * 表格列宽改变
   */
  changeChart(chart: H3.Report.Chart) {
    this.$emit("change", chart);
  }

  /**
   * 下钻
   */
  drillDown(data) {
    this.$emit("drill-down", data);
  }

  /**
   * 图表加载完
   */
  refreshEnd() {
    this.$emit("refresh-end");
  }

  /**
   * 图表点击
   *    * @param option  { filter, params }
   */
  clickChart(option: { filters: Array<H3.Report.FieldColumn>; params: any }) {
    this.$emit("click-chart", option);
  }

  /**
   * 刷新图表视图
   */
  refreshChartView() {
    if (this.$refs.chart) {
      (this.$refs.chart as any).refreshChartView();
    }
  }

  /**
   * 加载图表数据
   */
  loadChartData({isLoading, params, callback}: any = {isLoading: true}) {
    if (!this.checkChart) return;
    clearTimeout(this.updateTimer);
    this.loading = isLoading;
    this.updateTimer = setTimeout(async () => {
      this.handleChartData(params, callback);
    }, this.delay);
  }

  /**
   * 只刷新图表视图渲染
   */
  refreshViewStyles() {
    if (this.$refs.chart) {
      (this.$refs.chart as any).refreshViewStyles();
    }
  }

  /**
   * 加载图表数据
   */
  async handleChartData(params?: any, callback?: Function) {
    const tempt = window.location.hash;
    const schemaCode: string = this.chart.data.dimension[0].schemaCode;
    const appCode: string = (env.project ?? tempt.substring(tempt.indexOf('s/') + 2, tempt.indexOf('/r')))??'';
    const projectName: any = this.$route.query?.projectName ?? this.projectConfig?.projectName ??'';
    const levelName: string = this.projectConfig?.key?.split('-')[1]??'项目';
    let filterName: Array<string> = [];
    await axios
        .get(`${env.apiHost}` + `/api/report/getFilterProject`, {
          params: {
            schemaCode: schemaCode, appCode: appCode, projectName: projectName, level: levelName
          }
        })
        .then(res => {
          //@ts-ignore
          if (res.errcode === 0) {
            filterName = res.data
          }
        })
    let sendChart: H3.ReportAPI.Chart = handleChartRequestParams(
        this.chart,
        params,
        this.filters
    );
    let copySendChart = JSON.parse(JSON.stringify(sendChart));
    if(this.projectConfig?.multiProjectFlag){
    copySendChart.dimension[0].name = '项目简称';
    copySendChart.dimension[0].field = 'xmjc_1';
    }
    if (filterName.length !== 0) {
      sendChart.filter?.push({field: copySendChart.dimension[0], formula: "In", text: filterName})
    }
    this.api
        .getChartData(sendChart, this.corpId)
        .then((res: H3.DashboardAPI.ChartRealData) => {
          this.errMsg = false;
          this.innerData = resultFilterData(res.series, this.chart) || [];
          this.dataAlias = res.alias || {};
          this.dataTotal = res.total || 0;
          this.loading = false;
          this.source = res.source || null;
          callback && callback();
          res && this.$emit("update-charts-data", this.innerData);
        })
        .catch(res => {
          this.errMsg = res.code;
          this.innerData = [];
          this.dataAlias = {};
          this.dataTotal = 0;
          this.loading = false;
          callback && callback();
        })
        .finally(() => {
          this.isLoadData = true;
        });
  }

  /**
   * 刷新图表
   */
  refreshChart() {
    if (!this.checkChart) return;
    if (this.isLoadData) {
      this.refreshChart();
    } else {
      this.loadChartData();
    }
  }

  /**
   * 只加载一次图表
   */
  onlyLoadChart() {
    if (!this.isLoadData) {
      this.loadChartData();
    }
  }

  /**
   * 注册函数
   */
  registerFun() {
    if (this.chart) {
      this.$emit("register-refresh", {
        data: this.loadChartData,
        view: this.refreshChartView,
        load: this.onlyLoadChart,
        refreshViewStyles: this.refreshViewStyles
      });
    }
  }

  created() {
    this.registerFun();
  }

  mounted() {
    this.$emit("show");
    if (this.refresh) {
      this.refreshChart();
    }
    this.wrapWidth = this.$el.clientWidth;
    this.resizeSensor = new ResizeSensor(this.$el as HTMLDivElement, e => {
      if (e.width !== this.wrapWidth) {
        this.wrapWidth = e.width;
        this.refreshViewStyles();
      }
    });
  }

  destroyed() {
    if (this.resizeSensor) {
      this.resizeSensor.detach();
    }
  }
}
</script>
