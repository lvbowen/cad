<template>
  <div :class="prefixCls">
    <template v-if="displayStage">
      <div :class="`${prefixCls}__drag`" @mousedown="headerMousedown($event)"></div>
      <h3-stage-header
        v-if="activeNode"
        :node="activeNode"
        :activeStage="stageKey"
        @input-change="inputChange"
        @change-status="changeStatus"
        @change-tab="changeTab"
      ></h3-stage-header>
      <h3-stage-content
        :node="activeNode"
        :activeStage="stageKey"
        :style="`height: ${wrapHeight}px`"
        @changeNode="changeNodeStyle"
      ></h3-stage-content>
    </template>
    <h3-source-model
      v-model="showSourceModel"
      :model="model"
      :node="activeNode"
      :destroyOnClose="true"
      @change-model="changeModel"
    >
    </h3-source-model>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Provide, Inject } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Loading from "@h3/report/basics/components/loading";
import List from "@h3/report/basics/components/list";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/data-source/types";

import { ResponseCode } from "@h3/report/basics/enum/response-code";
import H3StageHeader from "./stage-header.vue";
import H3StageContent from "./stage-content.vue";
import H3SourceModel from "../source-model";
import { clearStageSetting } from "../../help/node";
import { stageStatus, StageType } from "../../enum/stage";
import { CanvasAction, NodeType } from "../../enum/node";

const ReportDataSource = namespace("dataSource");
@Component({
  name: "h3-report-flow-stage",
  components: {
    List,
    H3StageHeader,
    H3StageContent,
    H3SourceModel
  }
})
export default class ReportFlowStage extends Vue {
  @Prop() activeNode!: H3.Falls.Node;
  @Prop() source!: H3.Falls.Source;
  @ReportDataSource.State("options") options!: H3.Falls.CustomOptions;
  @ReportDataSource.Mutation(ReportMutation.UPDATESETTING) updateSetting!: Function;
  @ReportDataSource.Mutation(ReportMutation.UPDATESTAGE) updateStage!: Function; // 更新所有节点配置
  @ReportDataSource.Mutation(ReportMutation.UPDATEOPTIONS) updateOptions!: Function; // 更新自定义配置
  @ReportDataSource.State("models") models!: Array<H3.Falls.Model>;
  prefixCls: string = "h3-report-flow-stage";
  // 当前输入节点的源
  model: H3.Falls.Model | null = null;
  // 配置/浏览 预留给列表预览
  stageKey: string = stageStatus.setting;
  // 展示更改数据源弹窗
  showSourceModel: boolean = false;
  // 容器拖拽高度
  wrapHeight: number = 0;

  @Watch("activeNode", { immediate: true, deep: true })
  watchActiveNode(node: H3.Falls.Node) {
    this.initStageStatus();
    this.$emit(
      "changeNode",
      CanvasAction.RESETSTYLE,
      this.source.nodes.map((item: H3.Falls.Node) => {
        return item.id;
      })
    );
  }

  /**
   * 是否显示节点内容
   */
  get displayStage() {
    let tmpModel = this.models.find((item: H3.Falls.Model) => {
      return item.id === this.activeNode.id;
    });
    return this.activeNode.type !== NodeType.INPUT || (tmpModel && tmpModel.main);
  }
  /**
   * 改变model
   * @param model
   */
  changeModel(model: H3.Falls.Model) {
    this.updateSetting({ stage: model, stageType: StageType.models });
    this.activeNode.text = model.main.displayName;
    this.$emit("changeNode", CanvasAction.UPDATENODE, this.activeNode);
    this.model = model;
    let tmpSource = clearStageSetting(this.activeNode, this.source, true);
    this.updateStage({
      models: tmpSource.models,
      merges: tmpSource.merges,
      relations: tmpSource.relations,
      computes: tmpSource.computes
    });
  }
  /**
   * 鼠标按下
   *  @param e  鼠标事件
   */
  headerMousedown(e: MouseEvent) {
    document.body.addEventListener("mouseup", this.headerMouseupBody, false);
    document.body.addEventListener("mousemove", this.headerMouseMoveBody, false);
  }
  /**
   * 鼠标移动
   *  @param e  鼠标事件
   *  高度最大500，最小100
   */
  headerMouseMoveBody(e: MouseEvent) {
    let tmpHeight = document.body.clientHeight - e.clientY - 44;
    this.wrapHeight = tmpHeight > 500 ? 500 : tmpHeight < 100 ? 100 : tmpHeight;
  }
  /**
   * 鼠标抬起
   *  @param e  鼠标事件
   */
  headerMouseupBody(e: MouseEvent) {
    this.changeHeight(this.wrapHeight);
    document.body.removeEventListener("mouseup", this.headerMouseupBody, false);
    document.body.removeEventListener("mousemove", this.headerMouseMoveBody, false);
  }
  /**
   * 改变配置区域高度
   * @param val 高度
   */
  changeHeight(val: number) {
    this.updateOptions(val);
  }
  /**
   * 点击完成/更改数据源
   */
  changeStatus() {
    if (this.activeNode.type === NodeType.INPUT) {
      this.showSourceModel = true;
    } else {
      this.$emit("changeNode", CanvasAction.BLUR);
    }
  }
  /**
   * 切换配置/预览
   * @param key setting/preview 配置/预览
   */
  changeTab(key: string) {
    this.stageKey = key;
  }
  /**
   * 改变节点样式
   * @param nodeIds  Node的Id集合
   */
  changeNodeStyle(nodeIds) {
    this.$emit("changeNode", CanvasAction.SETERRORSTYLE, nodeIds);
  }
  /**
   * 初始化状态，检查是否配置过数据源
   */
  initStageStatus() {
    this.stageKey = stageStatus.setting;
    if (this.activeNode.type === NodeType.INPUT) {
      let tmpModel = this.models.find((item: H3.Falls.Model) => {
        return item.id === this.activeNode.id;
      });
      if (tmpModel) {
        this.model = tmpModel;
        this.showSourceModel = !tmpModel.main;
      }
    }
  }

  /**
   * 节点名称改变
   * @param val 节点名称
   */
  inputChange(val: string) {
    this.activeNode.text = val;
    this.$emit("changeNode", CanvasAction.UPDATENODE, this.activeNode);
  }
  created() {
    this.wrapHeight = this.options && this.options.height ? this.options.height : 350;
  }
}
</script>

<style lang="less">
@import "~@h3/report/basics/styles/index";

.h3-report-flow-stage {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 8px 0 rgba(224, 229, 240, 1);
  border-top: 1px solid #e0e5f0;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  .input-stage {
    color: #00d495;
  }
  .output-stage {
    color: #ffca00;
  }
  &__drag {
    height: 8px;
    cursor: ns-resize;
  }
}
</style>
