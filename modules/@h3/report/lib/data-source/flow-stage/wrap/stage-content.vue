<template>
  <div :class="prefixCls">
    <div v-if="!errorKey" :class="`${prefixCls}__wrap`">
      <component
        v-if="node && activeStage === stageStatus.setting"
        :nodeRelationField="nodeRelationField"
        :source="source"
        :node="node"
        :is="`stage-${node.type}`"
        :key="node.id"
      ></component>
      <!--      <preview-list-->
      <!--        v-if="activeStage ===stageStatus.preview"-->
      <!--        :node="node"-->
      <!--      >-->
      <!--      </preview-list>-->
    </div>
    <div v-else :class="`${prefixCls}__warn`">
      <img
        :src="require(`@h3/report/basics/assets/data-source/${errorKey}.png`)"
        :class="`${prefixCls}__warn-img`"
      />
      <div :class="[`${prefixCls}__warn-label`, `${errorKey}`]">
        {{ warnStatus[errorKey] }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Stage from "./";
import { Tooltip, Button, Tabs, message } from "@h3/antd-vue";
import PreviewList from "../preview";
import options from "@h3/report/dist/options.js";
import { stageStatus, StageType } from "../../enum/stage";
import { NodeErrorCode, NodeErrorMessage, NodeType, NodeToStageType } from "../../enum/node";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/data-source/types";
import { handleNodeValidate, getNodeModel } from "../../help/node";
const ReportDataSource = namespace("dataSource");
@Component({
  name: "h3-report-stage-content",
  components: {
    AButton: Button,
    ATooltip: Tooltip,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    PreviewList,
    ...Stage
  }
})
export default class ReportStageContent extends Vue {
  @Prop() node!: H3.Falls.Node;
  @Prop({ default: () => "setting" }) activeStage!: string;
  @ReportDataSource.State("edges") edges!: Array<H3.Falls.Edge>;
  @ReportDataSource.State("nodes") nodes!: Array<H3.Falls.Node>;
  @ReportDataSource.State("merges") merges!: Array<H3.Falls.Merge>;
  @ReportDataSource.State("models") models!: Array<H3.Falls.Model>;
  @ReportDataSource.State("relations") relations!: Array<H3.Falls.Relation>;
  @ReportDataSource.State("computes") computes!: Array<H3.Falls.Compute>;
  @ReportDataSource.Action(ReportAction.GETSTAGEMODELINFO) getStageModelInfo!: Function; // 阶段性获取模型
  @ReportDataSource.Mutation(ReportMutation.UPDATESETTING) updateSetting!: Function; // 设置合并节点
  prefixCls: string = "h3-report-stage-content";
  // 校验返回结果
  nodeRelationResult: H3.Falls.NodeRelationResult | null = null;
  // 出问题的nodeId集合
  errorNodeIds: Array<string> = [];
  // 节点内容状态预留
  stageStatus: { [key in stageStatus]: string } = stageStatus;
  // 节点错误状态
  errorKey: string | null = null;
  // 关联字段
  nodeRelationField: Array<H3.Falls.NodeRelationField> = [];
  // 警告状态列表
  warnStatus: { [key in NodeErrorCode]: string } = {
    [NodeErrorCode.RELATIONTARGETEDGES]: NodeErrorMessage.RELATIONTARGETEDGES,
    [NodeErrorCode.BEFOREGROUPS]: NodeErrorMessage.BEFOREGROUPS,
    [NodeErrorCode.RELATIONREPEATEDMODEL]: NodeErrorMessage.RELATIONREPEATEDMODEL,
    [NodeErrorCode.MERGETARGETEDGES]: NodeErrorMessage.MERGETARGETEDGES,
    [NodeErrorCode.OUTPUTEMPTY]: NodeErrorMessage.OUTPUTEMPTY
  };

  get source() {
    return {
      edges: this.edges,
      nodes: this.nodes,
      models: this.models,
      merges: this.merges,
      relations: this.relations,
      computes: this.computes
    };
  }

  // 发送校验请求，把当前节点之前的链接节点信息做参数传给后台
  @Watch("node", { immediate: true, deep: true })
  async watchActiveNodeId(node: H3.Falls.Node) {
    this.errorKey = null;
    this.errorNodeIds = [];
    this.nodeRelationField = [];
    // 节点校验
    this.nodeRelationResult = handleNodeValidate(node.id, this.source);
    if (this.nodeRelationResult.code === "success") {
      // 获取当前节点model的字段集
      this.nodeRelationField = getNodeModel(node.id, this.source);
      console.log(this.nodeRelationField, "nodeRelationField");
      // 发送校验接口，获取最新的源字段模型,校验保存的源字段存不存在，不存在则删除保存的字段。
      // let stageModelInfo: H3.Falls.Model = await this.getStageModelInfo({
      //   nodeId: node.id,
      //   source: this.nodeRelationResult.ret
      // });
      // if(stageModelInfo &&this.nodeRelationResult.ret && (this.nodeRelationResult.ret as H3.Falls.Source).models) {
      //   this.handleModelValidate(node, (this.nodeRelationResult.ret as H3.Falls.Source).models,stageModelInfo);
      // }
    } else {
      if ((this.nodeRelationResult.ret as H3.Falls.NodeValidateMessage).repeated) {
        this.$emit("changeNode", (this.nodeRelationResult.ret as any).repeated.flat(Infinity));
      }

      this.errorKey = (this.nodeRelationResult.ret as any).message.key;
      this.errorNodeIds.push((this.nodeRelationResult.ret as any).nodeId);
      // 相同数据源不能关联，抛出异常nodeId集合
      if (this.errorKey === NodeErrorCode.RELATIONREPEATEDMODEL) {
        (this.nodeRelationResult.ret as any).repeated.forEach((item: string[]) => {
          this.errorNodeIds.push(...item);
        });

        this.errorNodeIds = Array.from(new Set(this.errorNodeIds));
      }
    }
  }

  /**
   *  获取配置
   * @param node
   */
  getSetting(node: H3.Falls.Node) {
    if (node.type !== NodeType.OUTPUT) {
      let setting = this[NodeToStageType[node.type]].find((item: any) => {
        return node.id === item.id;
      });
      return setting;
    }
  }

  created() {}
}
</script>

<style lang="less">
@import "~@h3/report/basics/styles/index";
.h3-report-stage-content {
  background: #fff;
  width: 100%;
  overflow: hidden;
  &__wrap {
    height: 100%;
  }
  &__warn {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    &-img {
    }
    &-label {
      padding-top: 24px;
      color: #8893a7;
    }
    &-label.relationRepeatedModel {
      color: #ff4384;
    }
  }
}
</style>
