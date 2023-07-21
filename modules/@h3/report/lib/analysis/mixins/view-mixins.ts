import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-view-mixins"
})
export default class AnalysisViewMixin extends Vue {
  /**
   * 新增图表
   * @param isAdd 是否能新增
   */
  addChart(isAdd: boolean = true) {
    this.$emit("add-chart", isAdd);
  }
  /**
   * 编辑图表
   */
  editChart() {
    this.$emit("edit-chart");
  }
  /**
   * 预览图表
   */
  previewChart(status) {
    this.$emit("preview-chart", status);
  }
}
