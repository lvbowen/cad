import { Component, Prop, Vue } from "vue-property-decorator";
import { message } from "@h3/antd-vue";
import { namespace } from "vuex-class";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/analysis/types";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-title-mixins"
})
export default class AnalysisTitleMixin extends Vue {
  @Prop({ default: null }) chart!: H3.Report.Chart;
  @Analysis.Action(ReportAction.SAVECHART) saveChart!: Function;

  lastTitle: string = "";

  /**
   *  保存图表
   */
  toSaveChart(chart: H3.Report.Chart) {
    this.saveChart(chart)
      .then(() => {
        message.success("保存成功");
      })
      .catch(() => {});
  }
  /**
   * 输入框失去焦点事件
   */
  inputBlur(value) {
    if (this.lastTitle !== value) {
      this.chart.title = value;
      this.toSaveChart(this.chart);
    }
    this.lastTitle = "";
  }
  /**
   * 输入框聚焦事件
   */
  inputFocus(value) {
    this.lastTitle = value;
  }
}
