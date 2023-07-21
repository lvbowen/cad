<template>
  <div :class="[prefixCls, 'h3-report-layout']">
    <report-container
      v-if="!loading"
      :status="getReportStateDashboard"
      :layoutOptions="layoutOptions"
    />
    <h3-loading v-else/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { message } from "@h3/antd-vue";
import ReportShowHeader from "./header/show-header";
import ReportContainer from "./container";
import { getNewReportState } from "@h3/report/basics/store/dashboard";
import { ReportMutation, ReportAction } from "@h3/report/basics/store/dashboard/types";
import H3Loading from "@h3/report/basics/components/loading";
import options from "@h3/report/dist/options";
import { compare } from "@h3/report/basics/utils/object";
import { ReportState } from "@h3/report/basics/enum/report-state";
import { dispatch } from "@h3/report/basics/utils/events";

options.message = message;

const ReportPro = namespace("report");
@Component({
  name: "h3-report-show",
  components: {
    ReportShowHeader,
    ReportContainer,
    H3Loading
  }
})
export default class ReportShow extends Vue {
  @Prop({ default: null }) value!: string; // 报表标题
  @Prop({ default: null }) corpId!: string; // 公司Id
  @Prop({ default: null }) reportId!: string; // 报表Id
  @Prop({ default: () => null }) limit!: any; // 图表指标、行、列限制
  @Prop({ default: () => ({}) }) config!: any; // 业务配置
  @Prop({ default: () => null }) integrateComponents!: Function; // 业务整合的服务
  @Prop({ default: () => null }) classification!: Function; // 字段类型分类
  @Prop({ default: () => null }) header!: any; // 头部控件
  @ReportPro.State("title") title!: string;
  @ReportPro.Mutation(ReportMutation.SETREPORTTOP) setReportTop!: Function;
  @ReportPro.Mutation(ReportMutation.INITREPORT) initReport!: Function;
  @ReportPro.Action(ReportAction.GETREPORT) getReport!: Function;
  @ReportPro.Mutation(ReportMutation.SETREPORTOPTIONS) setReportOptions!: Function;
  prefixCls = "h3-report-show";
  loading = true;
  layoutOptions = {
    draggable: false,
    showGridLine: false,
    editState: false,
    mask: false,
    resizable: false
  };
  @Watch("corpId", { deep: true })
  async watchCorpId() {
    await this.loadReport();
  }
  @Watch("reportId")
  async watchReportId() {
    await this.loadReport();
  }

  get getReportStateDashboard() {
    return ReportState.DASHBOARD;
  }

  /**
   * 触发添加高级数据源
   */
  @Provide()
  addDataSource() {
    this.$emit("addDataSource");
  }
  /**
   * 触发下钻功能（目前只支持明细表）
   */
  @Provide()
  drillDown(data) {
    console.log("触发drillDowns", data);
    this.$emit("drillDown", data);
  }

  /**
   * 设置仪表盘配置项
   */
  setDashboardOptions() {
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
    if (this.limit) {
      compare(options.charts, this.limit);
      console.log(options.charts);
    }
    this.setReportOptions(Object.assign({}, options, dashboardOptions));
  }

  async loadReport() {
    this.initReport();
    this.loading = true;
    this.setDashboardOptions();
    await this.getReport({
      corpId: this.corpId,
      reportId: this.reportId,
      type: ReportState.DASHBOARD
    }).catch(() => {});
    this.$emit("report-loaded");
    this.loading = false;
  }
  refreshTop() {
    this.setReportTop(this.$el.getBoundingClientRect().top);
    this.$nextTick(() => {
      dispatch(window, "resize");
    });
  }
  async created() {
    if (!this.$store.state.report) {
      this.$store.registerModule("report", getNewReportState());
    }
    await this.loadReport();
  }
  updated() {
    this.refreshTop();
  }
  mounted() {
    this.refreshTop();
  }
  destroyed() {
    // this.$store.unregisterModule('report');
  }
}
</script>
<style lang="less">
@import "~@h3/report/basics/styles/index";
@import "~@h3/report/basics/styles/paint-coat";
.h3-report-show {
  display: flex;
  flex-direction: column;
}
</style>
