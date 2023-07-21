import { Component, Prop, Vue, Inject } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/analysis/types";
import { TabState } from "@h3/report/basics/enum/module-state";
import { ModuleState } from "@h3/report/basics/enum/module-state";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-change-chart-mixins"
})
export default class AnalysisChangeChartMixin extends Vue {
  @Prop({ default: null }) chart!: H3.Report.Chart;
  @Prop({ default: true }) editTitle!: boolean; // 是否可以编辑
  @Prop({ default: ModuleState.VIEW }) status!: ModuleState;
  @Analysis.State("charts") charts!: Array<H3.Report.BaseElement>;
  @Analysis.State("activeTab") activeTab!: TabState;
  @Analysis.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function; // 刷新图表
  @Analysis.Action(ReportAction.SAVEOWNERCHART) saveOwnerChart!: Function;
  @Analysis.Action(ReportAction.SAVECHART) saveChart!: Function;

  // 更新返回刷新状态
  @Inject({ default: () => {} }) updateRefreshStatus!: Function;

  /**
   * 改变字段排序
   */
  changeSort(list: Array<H3.Report.FieldColumn>) {
    // loadChartData查询条件是chart.data.sort,
    if (this.chart as H3.Report.Chart) {
      (this.chart as H3.Report.Chart).data.sort = list;
    }
    this.changeOwnerInfo({ sort: list });
    this.resizeChartView({
      chartId: this.status === ModuleState.VIEW ? "view" + this.chart.uid : this.chart.uid,
      type: "data"
    });
  }

  /**
   * 更改图表个人信息（缩略轴位置,列宽位置，字段排序）
   */
  changeOwnerInfo(option) {
    const self = this;
    if (this.activeTab === TabState.PUBLIC && !this.editTitle) {
      this.saveOwnerChart({ chart: this.chart, content: option })
        .then(() => {
          self.updateRefreshStatus(true);
        })
        .catch(() => {});
    } else {
      this.saveChart(this.chart)
        .then(() => {
          self.updateRefreshStatus(true);
        })
        .catch(() => {});
    }
  }
  /**
   * 改变缩略轴起始位置 缩略轴更改后触发的保存
   */
  changeDataZoom(res) {
    console.log("changeDataZoom", this);
    if (this.chart as H3.Report.Chart) {
      // (this.chart as H3.Report.Chart).styles.dataZoom = res;
    }
    this.changeOwnerInfo({ dataZoom: res });
  }
  /**
   * 设置图表列宽
   */
  changeColumns(element) {
    this.changeOwnerInfo({ columns: element.columnsSetting });
  }
}
