<script lang="ts">
import { CreateElement, VNode } from "vue";
import { Component, Vue, Prop, Watch, Provide } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import { message } from "@h3/antd-vue";
import ReportDesignerHeader from "./header/designer-header";
import ReportContainer from "./container";
import ReportTools from "./tools";
import ReportModels from "./models";
import ReportGlobal from "./global";
import ReportPreview from "./preview";
import ReportGuide from "./guide/entry.vue";
import H3Loading from "@h3/report/basics/components/loading";
import { dispatch } from "@h3/report/basics/utils/events";
import { ReportMutation, ReportAction } from "@h3/report/basics/store/dashboard/types";
import { getNewReportState } from "@h3/report/basics/store/dashboard";
import options from "@h3/report/dist/options";
import { compare } from "@h3/report/basics/utils/object";
import { ResponseCode } from "@h3/report/basics/enum/response-code";
import { ReportState } from "@h3/report/basics/enum/report-state";
const ReportPro = namespace("report");

options.message = message;

@Component({
  name: "h3-report-designer",
  components: {
    ReportDesignerHeader,
    ReportContainer,
    ReportTools,
    ReportModels
  }
})
export default class ReportDesign extends Vue {
  @Prop({ default: null }) value!: string; // 报表标题
  @Prop({ default: null }) corpId!: string; // 公司Id
  @Prop({ default: null }) reportId!: string; // 报表Id
  @Prop({ default: () => ({}) }) config!: any; // 业务配置
  @Prop({
    default: () => {
      return {
        primaryGuide: false,
        displaySetting: false,
        chartAuthority: false
      };
    }
  })
  guideConfig!: H3.Intro.config; // 展示引导配置
  @Prop({ default: true }) showGuide!: boolean; // 是否显示新手引导
  @Prop({ default: () => null }) integrateComponents!: Function; // 业务整合的服务
  @Prop({ default: () => null }) classification!: Function; // 字段类型分类
  @Prop({ default: () => null }) limit!: any; // 图表指标、行、列限制
  @Prop({ default: () => null }) header!: any; // 头部控件
  @Prop({ default: () => true }) saveMessageShow!: boolean; // 是否显示保存提示
  @Prop({ default: () => false }) showAdvancedDataSource!: boolean; // 是否在数据源中显示高级数据源
  @ReportPro.State("title") title!: string;
  @ReportPro.State("objectId") objectId!: string;
  @ReportPro.State("charts") charts!: Array<H3.Report.Chart>;
  @ReportPro.State("global") global!: H3.Report.Global;
  @ReportPro.State("reportTop") reportTop!: number;
  @ReportPro.State("chartsData") chartsData!: { [key: string]: any };
  @ReportPro.State("activeChart") activeChart!: H3.Report.Chart;
  @ReportPro.Action(ReportAction.GETREPORT) getReport!: Function;
  @ReportPro.Action(ReportAction.SAVEREPORT) saveReport!: Function;
  @ReportPro.Action(ReportAction.GETDATASOURCELIST) getDataSourceList!: Function;
  @ReportPro.Mutation(ReportMutation.INITREPORT) initReport!: Function;
  @ReportPro.Mutation(ReportMutation.SETREPORTTOP) setReportTop!: Function;
  @ReportPro.Mutation(ReportMutation.SETREPORTTITLE) setReportTitle!: Function;
  @ReportPro.Mutation(ReportMutation.SETREPORTOPTIONS) setReportOptions!: Function;
  @ReportPro.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function;
  @ReportPro.Mutation(ReportMutation.SETOBJECTID) setObjectId!: Function;
  @ReportPro.Mutation(ReportMutation.SETADVANCEDATASOURCE) setAdvancedDataSource!: Function;

  prefixCls = "h3-report-designer";
  previewStatus = false; // 预览状态
  loading = true;

  @Watch("value")
  watchTitle(val: string) {
    this.setReportTitle(val);
  }
  @Watch("corpId", { deep: true })
  async watchCorpId() {
    await this.loadReport();
  }

  @Watch("reportId", { deep: true })
  async watchReportId(val: string) {
    if (val !== this.objectId) {
      await this.loadReport();
    }
  }
  @Watch("config", { deep: true })
  async watchConfig() {
    await this.loadReport();
  }
  @Watch("showAdvancedDataSource", { deep: true })
  async watchShowAdvancedDataSource() {
    await this.loadReport();
  }
  /**
   * 触发添加高级数据源
   */
  @Provide()
  addDataSource() {
    console.log("addDataSource");
    this.$emit("addDataSource");
  }
  /**
   * 报表保存
   */
  async reportSave() {
    this.setActiveChart();
    await this.saveReport()
      .then(() => {
        if (this.saveMessageShow) message.success("仪表盘保存成功");
        this.$emit("report-save", { title: this.title, reportId: this.objectId });
      })
      .catch(res => {
        message.error("仪表盘保存失败");
      });
  }
  /**
   * 关闭方法
   */
  closePreview() {
    ReportPreview.close();
  }
  /**
   * 修改预览状态
   */
  updatePreviewStatus(previewStatus: boolean) {
    if (!previewStatus) {
      ReportPreview.destroy();
    } else {
      ReportPreview.show(this.$store, {
        el: this.$el,
        charts: JSON.parse(JSON.stringify(this.charts)),
        global: this.global,
        top: this.reportTop,
        objectId: this.objectId,
        title: this.title
      });
    }
    this.$emit("dashboard-preview", previewStatus);
  }

  /**
   * 修改标题
   */
  updateTitle(title: string) {
    this.setReportTitle(title);
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
    if (this.classification) {
      dashboardOptions.classification = this.classification;
    }
    if (this.limit) {
      compare(options.charts, this.limit);
    }
    if (this.showAdvancedDataSource) {
      console.log("展示高级数据源");
      this.setAdvancedDataSource(this.showAdvancedDataSource);
    }
    this.setReportOptions(Object.assign({}, options, dashboardOptions));
  }

  refreshTop() {
    this.setReportTop(this.$el.getBoundingClientRect().top);
    this.$nextTick(() => {
      dispatch(window, "resize");
    });
  }
  /**
   * 设置报表Id
   * @param reportId
   */
  setReportId(reportId: string) {
    this.setObjectId(reportId);
  }

  updated() {
    this.refreshTop();
  }

  async loadReport() {
    this.initReport();
    this.loading = true;
    this.setDashboardOptions();
    await this.getReport({
      corpId: this.corpId,
      reportId: this.reportId,
      type: ReportState.DESIGN
    }).catch(() => {});
    // 获取数据源列表
    await this.getDataSourceList().catch(() => {});

    if (this.value) {
      this.setReportTitle(this.value);
    }
    this.loading = false;
    this.$emit("report-loaded");
    this.$emit("input", this.value || this.title);
  }
  async created() {
    if (!this.$store.state.report) {
      this.$store.registerModule("report", getNewReportState());
    }
    await this.loadReport();
  }
  mounted() {
    // Guide({
    //   container: this.$el
    // });

    this.refreshTop();
  }
  destroyed() {
    ReportPreview.destroy();
    // this.$store.unregisterModule('report');
  }
  render(h: CreateElement) {
    const mainChildren = [
      h(ReportContainer, {
        props: {
          charts: this.charts
        }
      })
    ];
    if (!this.previewStatus) {
      if (this.activeChart && this.activeChart.data) {
        mainChildren.push(h(ReportModels), h(ReportTools));
      } else {
        mainChildren.push(
          h(ReportGlobal, {
            on: {
              input: (val: string) => {
                this.$emit("input", val);
              }
            }
          })
        );
      }
    }
    let children: any = null;
    if (this.loading && !this.guideConfig.primaryGuide) {
      children = [h(H3Loading)];
    } else {
      children = [
        h(this.header || ReportDesignerHeader, {
          props: {
            previewStatus: this.previewStatus,
            title: this.title
          },
          on: {
            "update-preview-status": this.updatePreviewStatus,
            "update-title": this.updateTitle,
            "save-report": this.reportSave
          }
        }),
        h(
          "div",
          {
            class: {
              "h3-report-main": true
            }
          },
          mainChildren
        )
      ];
    }

    if (!this.previewStatus && this.showGuide) {
      children.push(
        h(ReportGuide, {
          props: {
            container: this.$el,
            config: this.guideConfig
          },
          on: {
            "update-guide": (val: string) => {
              console.log("update-guide", val);
              this.$emit("update-guide", val);
            }
          }
        })
      );
    }

    return h(
      "div",
      {
        class: {
          "h3-report-designer": true,
          "h3-report-layout": true
        }
      },
      children
    );
  }
}
</script>
<style lang="less">
@import "~@h3/report/basics/styles/index";
@import "~@h3/report/basics/styles/paint-coat";
@import "./style/design";
</style>
