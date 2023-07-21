import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { TabOptions } from "../config/static-option";
import { TabState } from "@h3/report/basics/enum/module-state";
import { ModuleState } from "@h3/report/basics/enum/module-state";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-role-mixins"
})
export default class AnalysisRoleMixin extends Vue {
  @Analysis.State("activeTab") activeTab!: TabState; // 当前激活的标签（个人或公共）
  // 模块权限
  @Prop({ default: () => {} }) authority!: H3.Licence.Authority;
  // 状态控制
  @Prop({ default: ModuleState.DESIGN }) status!: ModuleState;

  /**
   * 模块键值
   */
  get moduleKey() {
    return this.status === ModuleState.VIEW ? "view" : "design";
  }
  /**
   * 模块权限
   */
  get moduleAuthority() {
    const tabItem = TabOptions.find(i => i.value === this.activeTab);
    const stateKey = tabItem ? tabItem.key : "Person";
    return this.authority &&
      stateKey &&
      this.moduleKey &&
      this.authority[this.moduleKey] &&
      (this.authority[this.moduleKey] as H3.Licence.moduleAuthority)[stateKey]
      ? (this.authority[this.moduleKey] as H3.Licence.moduleAuthority)[stateKey]
      : null;
  }
  /**
   * 当前激活模块知否可以新增图表
   */
  get canAdd() {
    return this.moduleAuthority ? this.moduleAuthority.add : false;
  }

  /**
   * 当前激活模块的图表配置
   */
  get toolOptions() {
    return this.moduleAuthority && this.moduleAuthority.tool ? this.moduleAuthority.tool : [];
  }

  /**
   * 是否可以修改title
   */
  get editTitle() {
    return this.moduleAuthority ? this.moduleAuthority.rename : false;
  }
}
