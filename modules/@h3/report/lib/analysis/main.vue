<template>
  <div :class="getClass">
    <template>
      <h3-view-wrap
        ref="viewWrap"
        :animations="animations"
        :refresh="refresh"
        :filters="innerFilters"
        :authority="roleAuthority"
        :status="activeModule"
        @add-chart="addChart"
        @edit-chart="editChart"
        @preview-chart="previewChart"
        @refresh-end="refreshEnd"
      />
      <h3-design-wrap
        v-if="showDesign"
        ref="designWrap"
        :authority="roleAuthority"
        :animations="animations"
        :status="activeModule"
        :charts="charts"
        :chart="activeChart"
        @back="back"
      >
      </h3-design-wrap>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Provide, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import ViewWrap from "./viewer";
import Design from "./designer";
import Loading from "@h3/report/basics/components/loading";
import options from "@h3/report/dist/options";
import { ModuleState } from "@h3/report/basics/enum/module-state";
import { ReportMutation } from "@h3/report/basics/store/analysis/types";
import Transition from "@h3/report/basics/mixins/transition-mixins";
import { message } from "@h3/antd-vue";
import { analysisState } from "@h3/report/basics/store/analysis";
import { role } from "@h3/report/basics/instance/help/getModules";

options.message = message;

const Analysis = namespace("analysisState");

@Component({
  name: "h3-analysis-modal",
  components: {
    H3ViewWrap: ViewWrap,
    H3DesignWrap: Design,
    Loading
  }
})
export default class ReportAnalysisModal extends Mixins(Transition) {
  @Prop({ default: null }) config!: any;
  @Prop({ default: null }) corpId!: string;
  @Prop({ default: null }) ownerId!: string;
  @Prop({ default: null }) dataSourceId!: string;
  @Prop({ default: () => [] }) filters!: H3.Yun.Filter[];
  @Prop({ default: "" }) fullScreenClassName!: string;

  @Analysis.State("activeChart") activeChart!: H3.Report.Chart;
  @Analysis.State("charts") charts!: Array<H3.Report.Chart>;
  @Analysis.Mutation(ReportMutation.SETANALYSISINFO) setAnalysisInfo!: Function; // 保存统计分析配置信息
  @Analysis.Mutation(ReportMutation.RESETGLOBALFILTER) reSetGlobalFilter!: Function; // 重置全局筛选信息
  @Analysis.Mutation(ReportMutation.RESETREPORT) resetReport!: Function; // 重置报表

  innerFilters: H3.Yun.Filter[] = [];
  // 此参数用于标志统计分析窗口是否展开 用于toggle方法 以及相关样式
  showWindow = false;
  // 刷新
  refresh: boolean = false;
  prefixCls = "h3-analysis-model";
  loading = false;
  // 当前激活的模块类型
  activeModule: ModuleState = ModuleState.VIEW;

  // 静态角色
  role: "admin" | "member" = "member";

  options: H3.Analysis.OptionCallbacks = {
    closeCallback: null,
    addCallback: null,
    backCallback: null,
    editCallback: null,
    detailCallback: null
  };
  @Watch("config")
  watchConfig() {
    this.setOptions();
  }

  @Watch("corpId")
  watchCorpId() {
    this.setOptions();
  }

  @Watch("ownerId")
  watchOwnerId() {
    this.setOptions();
  }

  @Watch("dataSourceId")
  watchDataSourceId() {
    this.setOptions();
  }

  @Watch("filters")
  watchFilters(val: H3.Yun.Filter[]) {
    this.innerFilters = val ? val : [];
  }

  /**
   * 触发关闭
   */
  @Provide()
  close(animate: boolean = true, destroy = false) {
    this.hide(animate, destroy);
  }

  /**
   * 角色权限
   */
  @Provide()
  get roleAuthority() {
    const r = role.find(i => i.key === this.role);
    return r ? r.authority : null;
  }

  /**
   * 统计分析信息
   */
  @Provide()
  handleSetting() {}

  /**
   * 设置当前激活模块及图表
   */
  @Provide()
  setActiveStatus(status: ModuleState) {
    this.activeModule = status;
  }

  get getClass() {
    return {
      [this.prefixCls]: true,
      [this.prefixCls + "--window"]: this.showWindow,
      [this.prefixCls + "--animation"]: this.animations,
      [this.prefixCls + "__fullscreen"]: this.showDesign,
      [this.fullScreenClassName]: this.showDesign
    };
  }

  /**
   * 是否显示展示区域
   */
  get showView() {
    return this.activeModule === ModuleState.VIEW;
  }
  /**
   * 是否显示设计区域
   */
  get showDesign() {
    return this.activeModule === ModuleState.DESIGN || this.activeModule === ModuleState.PREVIEW;
  }
  /**
   * 请求刷新完成
   */
  refreshEnd() {
    this.refresh = false;
  }
  /**
   * 切换统计分析显示关闭
   * @param obj
   * @param filter
   */
  toggle(obj: H3.Analysis.AccessCondition, filter?: Array<H3.Yun.Filter>) {
    if (this.showWindow) {
      this.hide();
      this.showWindow = false;
    } else {
      this.show(obj, filter);
      this.showWindow = true;
    }
    return this.showWindow;
  }

  /**
   * 刷新统计分析数据
   */
  update() {
    this.refresh = true;
  }

  /**
   * 变更筛选条件
   * @param filter
   */
  filter(filter?: Array<H3.Yun.Filter>) {
    if (filter) {
      this.innerFilters = filter;
    }
  }

  /**
   * 显示统计分析
   * @param obj
   * @param filter
   */
  async show(obj: H3.Analysis.AccessCondition, filter?: Array<H3.Yun.Filter>) {
    this.showWindow = true;
    this.refresh = true;
    this.filter(filter);
    this.setAnalysisInfo(obj);
    this.setRole(obj);
    setTimeout(() => {
      this.zoomIn();
    }, 10);
  }

  /**
   * 关闭统计分析
   * @param animate 是否开启动效
   */
  hide() {
    // 关闭动画 可以选择性替换
    this.zoomOut();
    if (this.options.closeCallback instanceof Function) {
      this.options.closeCallback();
    }
    setTimeout(() => {
      this.resetReport(true);
      // 解绑vuex实例
      this.$store.unregisterModule("analysisState");
      this.$destroy();
    }, 200);
  }

  /**
   * 新增图表事件
   * @param isAdd
   */
  addChart(isAdd: boolean = true) {
    if (this.charts.length >= 20 || !isAdd) {
      message.warn("最多可创建20个图表", 3);
    } else {
      // 显示设计器模块
      if (this.options.addCallback instanceof Function) {
        this.options.addCallback();
      }
      this.setActiveStatus(ModuleState.DESIGN);
    }
  }

  /**
   * 放大图表详情
   */
  previewChart() {
    if (this.options.detailCallback instanceof Function) {
      this.options.detailCallback();
    }
    // 显示设计器模块
    this.setActiveStatus(ModuleState.PREVIEW);
  }

  /**
   * 编辑图表
   */
  editChart() {
    if (this.options.editCallback instanceof Function) {
      this.options.editCallback();
    }
    // 显示设计器模块
    this.activeModule = ModuleState.DESIGN;
    this.setActiveStatus(ModuleState.DESIGN);
  }

  /**
   * 从design返回
   * @param value 刷新标识
   */
  back(value: boolean) {
    this.refresh = value;
    if (this.options.backCallback instanceof Function) {
      this.options.backCallback();
    }
  }

  /**
   * 映射权限
   */
  setRole(obj) {
    if (obj && obj.config && obj.config.IsAdmin) {
      this.role = "admin";
    }
  }

  setOptions() {
    let accessCondition: any = {};
    if (this.corpId) {
      accessCondition.corpId = this.corpId;
    }
    if (this.ownerId) {
      accessCondition.ownerId = this.ownerId;
    }
    if (this.config) {
      accessCondition.config = this.config;
    }
    if (this.dataSourceId) {
      accessCondition.dataSourceId = this.dataSourceId;
    }
    this.setAnalysisInfo(accessCondition);
  }

  created() {
    if (!this.$store.state.analysisState) {
      this.$store.registerModule("analysisState", analysisState);
    }
    this.setOptions();
  }

  mounted() {}

  destroyed() {
    this.$emit("destroy");
  }
}
</script>

<style lang="less">
@import "./style/index.less";
</style>
