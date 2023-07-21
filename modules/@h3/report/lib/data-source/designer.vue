<template>
  <div :class="prefixCls">
    <h3-loading v-if="loading"></h3-loading>
    <template v-else>
      <h3-flow-side
        :outPutActived="outPutActived"
        @addCell="addCell"
        @addOutPut="outPutActived = true"
      >
      </h3-flow-side>
      <div :class="`${prefixCls}__pane`">
        <h3-flow-tools
          @save="save"
          @toolAction="toolAction"
          :comPrefixCls="prefixCls"
        ></h3-flow-tools>
        <div :class="[`${prefixCls}__main`]">
          <h3-flow-canvas
            v-if="afterInit"
            ref="canvas"
            :comPrefixCls="prefixCls"
            :nodes="nodes"
            :edges="edges"
            :action="actionName"
            :payload="payload"
            :connectValidation="connectValidation"
            :makeValue="makeValue"
            :setNodeConstraints="setNodeConstraints"
            :needLimit="needLimit"
            @afterAction="afterAction"
            @nodeBlue="nodeBlue"
            @activeNode="nodeFocus"
            @delete="deleteOutput"
            @change="canvasChange"
            @addEdges="addEdges"
            @afterAddNode="addNodes"
          ></h3-flow-canvas>
          <h3-flow-stage
            v-if="showFlow"
            :activeNode="activeNode"
            :source="source"
            @changeNode="changeNode"
          >
          </h3-flow-stage>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Provide, Mixins } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import { H3FlowSide, H3FlowTools, H3FlowCanvas } from "./design/index";
import H3Loading from "@h3/report/basics/components/loading";
import H3FlowStage from "./flow-stage";
import {
  CanvasAction,
  NodeType,
  nodeIcon,
  NodeToStageType,
  NodeErrorCode,
  NodeErrorMessage
} from "./enum/node";
import ResponseCode from "@h3/report/basics/enum/response-code";
import { clearStageSetting, handleModelValidate } from "./help/node";
import { validateNodes, verify } from "./help/verify-node";
import { handleNodeValidate, getNodeModel } from "./help/node";
import { ReportMutation, ReportAction } from "@h3/report/basics/store/data-source/types";
import DataSourceOptionsMixin from "./mixins/options";
import options from "@h3/report/dist/options.js";
import { PerformanceLimit } from "./enum/node";
import { message } from "@h3/antd-vue";
import { log, debug } from "util";

// message限制
const optMessage: any = options.message ? options.message : (options.message = message);
optMessage.config &&
  optMessage.config({
    maxCount: 3
  });

const ReportDataSource = namespace("dataSource");

@Component({
  name: "h3-flow-designer",
  components: {
    H3FlowSide,
    H3FlowTools,
    H3FlowCanvas,
    H3FlowStage,
    H3Loading
  }
})
export default class h3FlowDesigner extends Mixins(DataSourceOptionsMixin) {
  @Prop({ default: null }) value!: string; // 高级数据源
  @Prop({ default: true }) needLimit!: string; // 是否开启限制
  @ReportDataSource.State("originalNodes") originalNodes!: any;
  @ReportDataSource.State("originalEdges") originalEdges!: any;
  @ReportDataSource.State("nodes") nodes!: Array<H3.Falls.Node>;
  @ReportDataSource.State("edges") edges!: Array<H3.Falls.Edge>;
  @ReportDataSource.State("merges") merges!: Array<H3.Falls.Merge>;
  @ReportDataSource.State("models") models!: Array<H3.Falls.Model>;
  @ReportDataSource.State("computes") computes!: Array<H3.Falls.Compute>;
  @ReportDataSource.State("relations") relations!: Array<H3.Falls.Relation>;
  @ReportDataSource.State("title") title!: string;
  @ReportDataSource.State("dataSourceId") storeDataSourceId!: string;
  @ReportDataSource.Action(ReportAction.GETDATASOURCENODEINFO) getDataSourceNodeInfo!: Function; // 获取高级数据源信息
  @ReportDataSource.Action(ReportAction.SAVEDATASOURCESETTING) saveDataSourceSetting!: Function; // 保存高级数据源信息
  @ReportDataSource.Action(ReportAction.GETSTAGEMODELINFO) getStageModelInfo!: Function; // 阶段性获取模型
  @ReportDataSource.Mutation(ReportMutation.UPDATECANVAS) updateCanvas!: Function; // 更新画布
  @ReportDataSource.Mutation(ReportMutation.SETDATASOURCETITLE) setDataSourceTitle!: Function; // 更新title
  @ReportDataSource.Mutation(ReportMutation.UPDATESETTING) updateSetting!: Function; // 更新单个节点配置
  @ReportDataSource.Mutation(ReportMutation.UPDATESTAGE) updateStage!: Function; // 更新所有节点配置

  prefixCls: string = "h3-flow-designer";
  actionName: string = "";
  activeNode: any = {};
  showFlow: boolean = false;
  payload: any = null;
  loading = true;
  outPutActived: boolean = true;
  afterInit: boolean = false;

  // 监听title
  @Watch("value")
  watchTitle(val: string) {
    this.setDataSourceTitle(val);
  }

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

  /**
   * 获取output节点
   */
  getOutputNode() {
    return this.nodes.find((node: H3.Falls.Field) => node.type === NodeType.OUTPUT);
  }

  /**
   * 转换节点
   */
  makeNode(cell): H3.Falls.Node {
    return {
      id: cell.id,
      type: cell.data ? cell.data.type : "",
      text: cell.data ? cell.data.text : "",
      x: cell.geometry.x,
      y: cell.geometry.y,
      w: cell.geometry.width,
      h: cell.geometry.height
    };
  }

  /**
   * 转换线条
   */
  makeEdge(cell): H3.Falls.Edge | null {
    let edgeParams: any = {};
    if (cell.style) {
      const style = cell.style.split(";");
      style.forEach(s => {
        if (s && s !== "") {
          let data = s.split("=");
          edgeParams[data[0]] = parseFloat(data[1]);
        }
      });
    }
    return {
      source: cell.source.id, // 源节点ID
      target: cell.target.id, // 目标节点ID
      exitX: edgeParams.exitX || 1, // 源连接点的X坐标
      exitY: edgeParams.exitY || 0.5, // 源连接点的y坐标
      entryX: edgeParams.entryX || 0, // 目标连接点的y坐标
      entryY: edgeParams.entryY || 0.5, // 目标连接点的y坐标
      style: cell.style // 目标连接点的y坐标
    };
  }

  /**
   * 节点icon
   */
  makeValue(node: H3.Falls.DragNode) {
    const iconColor =
      node.type === NodeType.INPUT
        ? "#00D495"
        : node.type === NodeType.OUTPUT
        ? "#FFCA00"
        : "#8893A7";
    return `<div class="node" title="${node.text}"><i class="h3yun_All ${
      nodeIcon[node.type]
    }" style="margin-right: 8px; color:${iconColor}; font-size: 14px;"></i> ${node.text}</div>`;
  }

  /**
   * 设置输入节点的状态
   */
  setOutputNodeActived(nodes, res: boolean = false) {
    // 如果删除了输出节点 恢复输出节点可用
    let outputNode = nodes.find(n => n.type === NodeType.OUTPUT);
    if (outputNode) {
      this.outPutActived = res;
    }
  }

  /**
   * 拖入一个节点
   */
  addCell(params) {
    const { e, node } = params;
    const canAdd = this.needLimit ? this.checkInput(this.nodes, this.edges, params.node) : true;
    if (canAdd) {
      (this.$refs.canvas as any).insertVertex(e.layerX, e.layerY, node);
    } else {
      optMessage.error(`配置的输入节点数超过限制`);
    }
  }
  /**
   * 校验输入节点个数
   */
  checkInput(nodes, edges, newNode) {
    // TODO: node抽象出来做订阅，规则也可以独立做成配置化，目前先暂时这样写
    let nums = {
      input: 0,
      output: 0,
      union: 0,
      compute: 0
    };

    nodes.forEach(element => {
      nums[element.type]++;
    });

    if (newNode.type === "input" && nums.input >= PerformanceLimit.INPUTNODELIMIT) {
      return false;
    }

    return true;
  }
  /**
   * 新增节点
   */
  addNodes(cells) {
    let nodes = cells.map(cell => {
      return this.makeNode(cell);
    });
    nodes.forEach((node: H3.Falls.Node) => {
      this.updateSetting({ stage: node, stageType: NodeToStageType[node.type] });
    });
  }
  /**
   * 当前操作名称
   */
  toolAction(action) {
    this.actionName = action.type;
  }

  /**
   * 操作完回调
   */
  afterAction() {
    this.actionName = "";
  }

  /**
   * 节点失焦后
   */
  nodeBlue() {
    this.showFlow = false;
    this.payload = null;
  }

  /**
   * 节点聚焦事件
   */
  nodeFocus(cell) {
    let params: H3.Falls.Node = this.makeNode(cell);
    this.activeNode = params;
    this.showFlow = true;
  }

  /**
   * 修改节点
   * @param type
   * @param param
   */
  changeNode(type: string, param?: any) {
    switch (type) {
      case CanvasAction.UPDATENODE:
        this.payload = param;
        this.actionName = CanvasAction.UPDATENODE;
        this.$emit("change-status", "edit");
        console.log("修改节点");
        break;
      case CanvasAction.SETERRORSTYLE:
        this.payload = param;
        this.actionName = CanvasAction.SETERRORSTYLE;
        break;
      case CanvasAction.RESETSTYLE:
        this.payload = param;
        this.actionName = CanvasAction.RESETSTYLE;
        break;
      case CanvasAction.BLUR:
        this.actionName = CanvasAction.BLUR;
        break;
      default:
        break;
    }
  }

  /**
   * 画布删除了输出节点
   */
  deleteOutput(selectCells) {
    // 删除任何节点 会不存在聚焦节点 需要 关闭操作面板
    this.showFlow = false;
    const { nodes, edges } = this.translateCells(selectCells);
    let tmpNodes: Array<H3.Falls.Node> = [];
    let tmpEdges: Array<H3.Falls.Edge> = [];
    let tmpNode: H3.Falls.Node;

    // 如果删除了输出节点 恢复输出节点可用
    this.setOutputNodeActived(nodes, true);

    nodes.forEach((node: H3.Falls.Node) => {
      let tmpEdge = this.source.edges.find((item: H3.Falls.Edge) => node.id === item.source);
      if (tmpEdge) {
        tmpEdges.push(tmpEdge);
      }
    });
    tmpEdges = tmpEdges.concat(...edges);
    tmpEdges.forEach((edge: H3.Falls.Edge) => {
      tmpNode = this.source.nodes.find(
        (item: H3.Falls.Node) => item.id === edge.target
      ) as H3.Falls.Node;
      if (tmpNode) {
        tmpNodes.push(tmpNode);
      }
    });
    let obj: any = {};
    // 去重求node集合
    tmpNodes = tmpNodes.reduce((item: Array<H3.Falls.Node>, next: H3.Falls.Node) => {
      obj[next.id] ? "" : (obj[next.id] = true && item.push(next));
      return item;
    }, []);
    // 当前节点更改，对后面连接的节点的配置做初始化
    tmpNodes.forEach((node: H3.Falls.Node) => {
      let tmpSource = clearStageSetting(node, this.source);
      this.updateStage({
        models: tmpSource.models,
        merges: tmpSource.merges,
        relations: tmpSource.relations,
        computes: tmpSource.computes
      });
    });
    // 删除当前配置
    nodes.forEach((node: H3.Falls.Node) => {
      this.updateSetting({ stage: node, stageType: NodeToStageType[node.type], isDelete: true });
    });
  }

  /**
   * 新增一条线
   */
  addEdges(cells) {
    let edges: Array<H3.Falls.Edge> = [];
    cells.forEach(edge => {
      let tmpEdge = this.makeEdge(edge);
      if (tmpEdge) {
        edges.push(tmpEdge);
      }
    });
    edges.forEach((edge: H3.Falls.Edge) => {
      let tmpNode = this.nodes.find((node: H3.Falls.Node) => {
        return edge.target === node.id;
      });
      if (tmpNode) {
        let tmpSource = clearStageSetting(tmpNode, this.source);
        this.updateStage({
          models: tmpSource.models,
          merges: tmpSource.merges,
          relations: tmpSource.relations,
          computes: tmpSource.computes
        });
      }
    });
  }

  /**
   * 转换节点和线
   * 由cells输出nodes及edges
   */
  translateCells(cells) {
    let originalNodes: Array<any> = [];
    let originalEdges: Array<any> = [];

    let nodes: Array<H3.Falls.Node> = [];
    let edges: Array<H3.Falls.Edge> = [];

    for (const key in cells) {
      if (!!cells[key].vertex) {
        originalNodes.push(cells[key]);
      } else if (!!cells[key].edge) {
        originalEdges.push(cells[key]);
      }
    }

    nodes = originalNodes.map(node => {
      return this.makeNode(node);
    });

    originalEdges.map(edge => {
      let tmpEdge = this.makeEdge(edge);
      if (tmpEdge) {
        edges.push(tmpEdge);
      }
    });
    return {
      originalNodes,
      originalEdges,
      nodes,
      edges
    };
  }

  /**
   * 画布改变
   */
  canvasChange(cells) {
    const translateData = this.translateCells(cells);
    const { originalNodes, originalEdges, nodes, edges } = translateData;
    this.setOutputNodeActived(nodes);
    // 请在更改之前做操作 或查询 非全局操作请慎用change事件
    this.updateCanvas({
      originalNodes,
      originalEdges,
      nodes,
      edges
    });
    this.$emit("change-status", "edit");
  }

  /**
   * 画布连接时的校验 返回boolean
   */
  connectValidation(source, target): boolean {
    const sourceData = source.data;
    const targetData = target.data;
    // 先校验源节点
    verify.isConnecting = true;
    const souseres = verify[sourceData.type].validate(source, target);

    if (souseres.success) {
      // 源节点校验成功 校验目标节点
      const targetres = verify[targetData.type].validate(target);
      return targetres.success;
    } else {
      return souseres.success;
    }
  }

  /**
   * 设置节点的连接点
   */
  setNodeConstraints(node) {
    const type = node.data.type;
    if (type === NodeType.INPUT) {
      return [{ x: 1, y: 0.5, perimeter: true }];
    }

    if (type === NodeType.OUTPUT) {
      return [{ x: 0, y: 0.5, perimeter: true }];
    }

    return [
      { x: 1, y: 0.5, perimeter: true },
      { x: 0, y: 0.5, perimeter: true }
    ];
  }
  /**
   * 保存高级数据源画布配置
   */
  async save() {
    // 校验画布
    if (this.nodes.length === 0 || this.edges.length === 0) {
      optMessage.error("请配置数据流");
      return;
    }
    let errorNodeIds: Array<string> = [];
    let isolatedNode: Boolean = false;
    this.nodes.forEach((node: H3.Falls.Field) => {
      let res: H3.Falls.NodeRelationResult = handleNodeValidate(node.id, this.source, "save");
      if (res.code === "fail") {
        if ((res.ret as any).message.key === NodeErrorCode.ISOLATEDNODE) {
          isolatedNode = true;
        }
        errorNodeIds.push((res.ret as any).nodeId);
      }
    });

    //校验是否有表单或字段被删除
    let outputNode = this.getOutputNode();
    let checkModelMessage = null;
    if (outputNode) {
      let result = await this.getStageModelInfo({
        nodeId: outputNode.id,
        source: this.source
      });
      if (result) {
        const res = this.getModelValidateRes(result);
        checkModelMessage = res.message;
        if (res.nodeIds && res.nodeIds.length) {
          errorNodeIds = [...(errorNodeIds as [string]), ...(res.nodeIds as [string])];
        }
      }
    }

    if (errorNodeIds.length) {
      this.changeNode(CanvasAction.SETERRORSTYLE, errorNodeIds);
      if (checkModelMessage && checkModelMessage !== "success") {
        optMessage.error(checkModelMessage);
      } else if (isolatedNode) {
        optMessage.error(NodeErrorMessage.ISOLATEDNODE);
      } else {
        optMessage.error("当前数据流配置有误");
      }
      return false;
    }

    let tmpNode = this.getOutputNode();
    if (tmpNode) {
      await this.saveDataSourceSetting(tmpNode.id)
        .then(() => {
          optMessage.success("高级数据源保存成功");
          this.$emit("change-status", "saved", this.storeDataSourceId);
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      optMessage.error("当前数据流没有输出节点");
    }
  }
  /**
   * 根据stageModelInfo，是否有表单或字段被删除
   */
  getModelValidateRes(res) {
    let checkResult: H3.Falls.ModelRelationResult = handleModelValidate(this.source, res);
    if (checkResult && checkResult.code === "fail") {
      const { message: msg, nodeIds } = checkResult.res;
      return {
        message: msg.message,
        nodeIds: Array.from(new Set(nodeIds))
      };
    }
    return {
      message: "success",
      nodeIds: []
    };
  }
  /**
   *  校验节点模型及字段
   */
  checkStageModel() {
    let outputNode = this.getOutputNode();
    if (outputNode) {
      this.getStageModelInfo({
        nodeId: outputNode.id,
        source: this.source
      }).then((res: Array<H3.DataSourceAPI.Model>) => {
        if (res) {
          const { message: msg, nodeIds } = this.getModelValidateRes(res);
          if (nodeIds && nodeIds.length) {
            this.changeNode(CanvasAction.SETERRORSTYLE, nodeIds);
            optMessage.error(msg);
          }
        }
      });
    }
  }
  /**
   *  初始化
   */
  async initDesigner() {
    await this.getDataSourceNodeInfo();
    await this.checkStageModel();
    this.$emit("change-title", this.title);
    // 设置输出节点状态
    this.setOutputNodeActived(this.nodes);
    // 渲染画布
    this.loading = false;
    this.$emit("loaded");
    this.afterInit = true;
  }

  created() {
    this.initDesigner();
  }
}
</script>
<style lang="less">
@import "./style/designer.less";

.node {
  width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
