import { Component, Prop, Vue, Inject } from "vue-property-decorator";
import { message } from "@h3/antd-vue";
import { namespace } from "vuex-class";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/analysis/types";
import { ToolsBarType } from "@h3/report/basics/enum/element-tools";
import { TabState } from "@h3/report/basics/enum/module-state";
import { ModuleState } from "@h3/report/basics/enum/module-state";
import { ElementType } from "@h3/report/basics/enum/chart-type";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-toolbar-event-mixins"
})
export default class AnalysisToolbarEventMixin extends Vue {
  @Prop({ default: null }) chart!: H3.Report.Chart;
  @Prop({ default: -1 }) chartIndex!: number;
  @Prop({ default: true }) editTitle!: boolean; // 是否可以编辑
  @Prop({ default: () => [] }) toolOptions!: Array<string>;
  @Prop({ default: ModuleState.VIEW }) status!: ModuleState;
  @Analysis.State("charts") charts!: Array<H3.Report.BaseElement>;
  @Analysis.State("activeTab") activeTab!: TabState;
  @Analysis.State("chartsInfo") chartsInfo!: TabState;
  @Analysis.Action(ReportAction.REMOVECHART) removeChart!: Function; // 删除图表
  @Analysis.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function; // 刷新图表
  @Analysis.Action(ReportAction.SAVEOWNERCHART) saveOwnerChart!: Function;
  @Analysis.Action(ReportAction.SAVECHART) saveChart!: Function;
  @Analysis.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function; // 设置当前激活的图表

  // 更新返回刷新状态
  @Inject({ default: () => {} }) updateRefreshStatus!: Function;

  get chartInfo() {
    return this.chartsInfo[this.chart.uid];
  }

  get sortValue() {
    if (
      this.chartInfo &&
      this.chartInfo.content &&
      this.chartInfo.content.sort &&
      this.activeTab === TabState.PUBLIC
    ) {
      return this.chartInfo.content.sort;
    } else {
      return this.chart.data.sort;
    }
  }
  /**
   * 过滤后的排序配置
   */
  get toolbar() {
    let toolArray = this.toolOptions;
    if (
      this.chart.type === ElementType.FUNNEL ||
      this.chart.type === ElementType.SCATTER ||
      (this.chart.type === ElementType.CARD &&
        this.chart.data &&
        this.chart.data.dimension &&
        !this.chart.data.dimension.length)
    ) {
      toolArray = toolArray.filter(item => item !== ToolsBarType.SORT);
    }
    if (this.charts && this.charts.length === 1) {
      toolArray = toolArray.filter(item => item !== ToolsBarType.DRAG);
    }
    return toolArray;
  }
  /**
   * 是否显示排序
   */
  get visibleSort() {
    return !(
      this.chart.type === ElementType.FUNNEL ||
      this.chart.type === ElementType.SCATTER ||
      (this.chart.type === ElementType.CARD &&
        this.chart.data &&
        this.chart.data.dimension &&
        !this.chart.data.dimension.length)
    );
  }
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
    console.log("changeDataZoom");
    if (this.chart as H3.Report.Chart) {
      // (this.chart as H3.Report.Chart).styles.dataZoom = res;
    }
    this.changeOwnerInfo({ dataZoom: res });
  }
  /**
   * 设置图表列宽
   */
  changeColumns(element) {
    this.changeOwnerInfo({ dataZoom: { columns: element.columnsSetting } });
  }
  /**
   * 图表刷新
   */
  [ToolsBarType.REFRESH]() {
    this.resizeChartView({
      chartId: this.status === ModuleState.VIEW ? "view" + this.chart.uid : this.chart.uid,
      type: "data"
    });
  }
  /**
   * 全屏
   */
  [ToolsBarType.FULLSCREEN]() {
    this.$emit("preview", true);
    this.setActiveChart(this.chart);
  }
  /**
   * 取消全屏
   */
  [ToolsBarType.NARROW]() {
    this.$emit("preview", false);
    this.setActiveChart({});
  }

  /**
   * 排序功能
   */
  [ToolsBarType.SORT](item, e: Event) {}

  /**
   * 删除图表
   */
  [ToolsBarType.REMOVE]() {
    this.removeChart(this.chart.uid)
      .then(res => {
        this.$emit("remove");
      })
      .catch(() => {
        message.error("未删除成功");
      });
  }

  /**
   * 编辑
   */
  [ToolsBarType.EDIT]() {
    console.log("编辑");
    this.$emit("edit");
    this.setActiveChart(this.chart);
  }

  /**
   *  点击tool的回调
   */
  clickOption(item: H3.Toolbar.Options, e?: Event) {
    console.log("测试click", item);
    // 如果有传入的回调
    if (item.fn) {
      item.fn();
    }
    if (item.callBackName && this[item.callBackName]) {
      this[item.callBackName](item, e);
    }
    this.$emit(item.value, this.chart);
  }
}
