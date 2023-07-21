<template>
  <div :class="[`${comPrefixCls}__canvas`]">
    <div :class="[`${comPrefixCls}__empty`]" v-show="existNode.length === 0">
      <div
        :class="[`${comPrefixCls}__empty-item`]"
        v-for="(i, index) in emptyItem"
        :key="index"
      >
        <img :src="i.img"/>
        {{ i.des }}
      </div>
    </div>

    <div :class="[`${comPrefixCls}__plumb`]" :id="`${comPrefixCls}__plumb`"></div>

    <div :class="[`${comPrefixCls}__zoom`]">
      <i
        class="h3yun_All minus-circle-o"
        title="缩小"
        @click="zoomout"
      ></i>
      <span class="twig">
        <span class="circle" :style="circleStyle"></span>
        {{ scaleNumber }}%
      </span>
      <i
        class="h3yun_All plus-circle-o"
        title="放大"
        @click="zoomin"
      ></i>
      <!-- <i class="h3yun_All scan-o" title="缩略图" @click="showOutLine = !showOutLine"></i> -->
    </div>

    <!-- <div :class="[`${comPrefixCls}__outline`]" v-show="showOutLine">
      <h4>导航器</h4>
      <div
        :class="[`${comPrefixCls}__outline-pane`]"
        :id="`${comPrefixCls}__outline`"></div>
    </div> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import mxgraph from "@h3/report/lib/data-source/help/graph";
import { genGraph } from "@h3/report/lib/data-source/help/graph-options";
import { CanvasAction } from "@h3/report/lib/data-source/enum/node";
import { uuid } from "@h3/report/basics/utils/uid";
import { PerformanceLimit } from "../enum/node";
import { message } from "@h3/antd-vue";

const {
  mxGraph,
  mxOutline,
  mxEvent,
  mxCell,
  mxGeometry,
  mxUtils,
  mxEventObject,
  mxConnectionHandler,
  mxUndoManager,
  mxRubberband,
  mxConstants,
  mxPoint,
  mxGraphView,
  mxCellState
} = mxgraph;

let graph: any = null;
let outline = null;
let undoMng: any = null;
let rubberBand: any = null;

const CanvasEvent = {
  Change: "change", // 模型改变事件
  NodeBlue: "nodeBlue", // 节点失焦事件
  AfterAction: "afterAction", // 主动出发事件 执行完的回调
  Delect: "delete", // 删除事件
  ActiveNode: "activeNode", // 激活单一节点事件
  BeforeAddNode: "beforeAddNode", // 新增节点之前的事件
  AfterAddNode: "afterAddNode", // 新增节点之后的事件
  AddEdges: "addEdges" // 新增一个线
};

@Component({
  name: "h3-flow-canvas",
  components: {}
})
export default class H3FlowCanvas extends Vue {
  @Prop({
    default: "h3-flow-designer"
  })
  comPrefixCls!: string;

  @Prop({
    default: true
  })
  needLimit!: boolean;

  // 节点
  @Prop({
    default: () => []
  })
  nodes!: Array<H3.Falls.Node>;

  // 连接线
  @Prop({
    default: () => []
  })
  edges!: Array<H3.Falls.Edge>;

  // 画布可主动激活的事件
  @Prop({
    default: () => []
  })
  action!: string;

  // 激活事件时的携带参数
  @Prop({
    default: () => {}
  })
  payload!: any;

  // 自定义校验规则
  @Prop({
    default: () => {
      return true;
    }
  })
  connectValidation!: Function;

  // 自定义校验规则
  @Prop({
    default: () => {
      return (node: H3.Falls.DragNode) => {
        return node && node.text ? node.text : "";
      };
    }
  })
  makeValue!: Function;

  // 节点宽度
  @Prop({
    default: 160
  })
  nodeWidth!: number;

  @Prop({
    default: 38
  })
  nodeHeight!: number;

  // 结束新增节点之后的主动触发函数
  @Prop({
    default: null
  })
  afterAddNode!: Function;

  // 新增节点之前主动触发的函数 返回true 执行新增操作
  @Prop({
    default: () => {
      return () => true;
    }
  })
  beforeAddNode!: Function;

  // 新增节点之前主动触发的函数 返回true 执行新增操作
  @Prop({
    default: () => {
      return node => {
        return [
          { x: 1, y: 0.5, perimeter: true },
          { x: 0, y: 0.5, perimeter: true }
        ];
      };
    }
  })
  setNodeConstraints!: Function;

  // 画布最小缩放倍数
  @Prop({
    default: 50
  })
  minScaleNumber!: number;

  // 画布最大缩放倍数
  @Prop({
    default: 250
  })
  maxScaleNumber!: number;

  emptyItem: Array<any> = [
    {
      des: "1.拖放“输入”，选中数据",
      img: require(`@h3/report/basics/assets/data-source/step1.png`)
    },
    {
      des: "2.拖放转换操作，并接连输入",
      img: require(`@h3/report/basics/assets/data-source/step2.png`)
    },
    {
      des: "3.连接并为输出数据命名",
      img: require(`@h3/report/basics/assets/data-source/step3.png`)
    }
  ];

  showOutLine: boolean = true;

  existNode: Array<H3.Falls.Node> = this.nodes;

  scaleNumber: number = 100;

  init: boolean = true;

  @Watch("action")
  eventHandle(val, oldVal) {
    if (val === "") return;
    switch (val) {
      case CanvasAction.UNDO:
        this.undo();
        break;
      case CanvasAction.REDO:
        this.redo();
        break;
      case CanvasAction.INSERT:
        break;
      case CanvasAction.DELETE:
        this.delete();
        break;
      case CanvasAction.HORIZONTALALIGN:
      case CanvasAction.HORIZONTAL:
      case CanvasAction.VERTICALALIGN:
      case CanvasAction.VERTICAL:
        this.align(val);
        break;
      case CanvasAction.UPDATENODE:
        this.updateNode();
        break;
      case CanvasAction.BLUR:
        this.canvasBlur();
        break;
      case CanvasAction.SETERRORSTYLE:
      case CanvasAction.RESETSTYLE:
        let error = val === CanvasAction.SETERRORSTYLE;
        this.setCellsStyle(error);
        break;
      default:
        console.log("不存在type类型");
        break;
    }
    this.$emit(CanvasEvent.AfterAction);
  }

  /**
   * 缩放的进度条
   */
  get circleStyle() {
    return {
      left: `${((this.scaleNumber - this.minScaleNumber) /
        (this.maxScaleNumber - this.minScaleNumber)) *
        100}%`
    };
  }

  /**
   * 撤回
   */
  undo() {
    if (!undoMng) {
      throw new Error("mxUndoManager 没有初始化");
    }
    undoMng.undo();
  }

  /**
   * 返撤回
   */
  redo() {
    if (!undoMng) {
      throw new Error("mxUndoManager 没有初始化");
    }
    undoMng.redo();
  }

  /**
   * 删除节点
   */
  delete() {
    const selectCells = graph.getSelectionCells();
    if (selectCells.length > 0) {
      this.$emit(CanvasEvent.Delect, selectCells);
      graph.removeCells(selectCells, true);
    }
  }

  /**
   * 居中处理
   */
  align(type) {
    let alignType = "";
    const selectCells = graph.getSelectionCells();
    switch (type) {
      case CanvasAction.HORIZONTALALIGN:
        graph.distributeCells(true);
        break;
      case CanvasAction.HORIZONTAL:
        alignType = mxConstants.ALIGN_MIDDLE;
        break;
      case CanvasAction.VERTICALALIGN:
        graph.distributeCells(false);
        break;
      case CanvasAction.VERTICAL:
        alignType = mxConstants.ALIGN_CENTER;
        break;
      default:
        console.log("不存在type类型");
        break;
    }
    if (selectCells.length > 0 && alignType !== "") {
      // 垂直对齐 ALIGN_CENTER
      graph.alignCells(alignType, selectCells);
    }
  }

  /**
   * 画布缩小
   */
  zoomout() {
    if (this.scaleNumber < this.minScaleNumber + 1) return;
    graph.zoomTo((this.scaleNumber - 10) / 100);
    // this.scaleNumber = parseInt(`${graph.view.scale * 100}`);
    this.scaleNumber = this.scaleNumber - 10;
  }

  /**
   * 画布放大
   */
  zoomin() {
    console.log(this.scaleNumber);
    if (this.scaleNumber + 10 > this.maxScaleNumber + 1) return;
    graph.zoomTo((this.scaleNumber + 10) / 100);
    // this.scaleNumber = parseInt(`${graph.view.scale * 100}`);
    this.scaleNumber = this.scaleNumber + 10;
  }

  /**
   * 更新节点信息
   */
  updateNode() {
    let node = this.payload;
    if (this.payload) {
      if (node.id) {
        let cell = graph.model.cells[node.id];
        let reg = "/" + `${cell.data.text}` + "/g";
        let val = cell.value.replace(eval(reg), node.text);
        // 更新节点的信息
        cell.setValue(val);
        graph.labelChanged(cell, val);
        cell.data.text = node.text;
        this.$emit(CanvasEvent.Change, graph.model.cells);
      }
    }
  }

  /**
   * 失焦事件
   */
  canvasBlur() {
    graph.setSelectionCells([]);
    this.$emit(CanvasEvent.NodeBlue);
  }

  /**
   * 设置error样式/重制样式
   */
  setCellsStyle(setError) {
    const styleName = setError ? "h3-report-node--error" : "h3-report-node";
    const cellsId = this.payload || [];

    let cellsObj = graph.getModel().cells;
    let cells: Array<any> = [];
    cellsId.forEach(id => {
      cells.push(cellsObj[id]);
    });

    graph.setCellStyle(styleName, cells);
  }

  /**
   * 激活数据操作面板
   */
  activeNode(cell) {
    this.$emit(CanvasEvent.ActiveNode, cell);
  }

  /**
   * 检讨模型改变事件
   */
  handleModelChange(params) {
    if (this.init) return;
    const cells = params.cells;
    this.$emit(CanvasEvent.Change, cells);
  }

  /**
   * 当添加一个元素的时候
   */
  handleCellsAdd(sender, evt) {
    if (this.init) return;
    const cell = evt.properties.cells[0];

    if (cell.edge) {
      this.$emit(CanvasEvent.AddEdges, [cell]);
    }
  }

  /**
   * 校验链接
   */
  initConnectValidation() {
    mxGraph.prototype.isValidConnection = (source, target) => {
      // 不可连接线
      if (target.edge) {
        return false;
      }

      // 自定义校验
      if (this.connectValidation) {
        return this.connectValidation(source, target);
      }

      return true;
    };
  }

  /**
   * 初始化undo
   */
  initUndoManager() {
    undoMng = new mxUndoManager();

    let listen = (sender, evt) => {
      undoMng.undoableEditHappened(evt.getProperty("edit"));
    };

    graph.getModel().addListener(mxEvent.UNDO, listen);
    graph.getView().addListener(mxEvent.UNDO, listen);
  }

  /**
   * 初始化缩略图
   */
  initOutLine() {
    outline = new mxOutline(graph, document.getElementById(`${this.comPrefixCls}__outline`));
  }

  /**
   * 初始化局部选中
   */
  initRubberBand() {
    mxRubberband.prototype.fadeOut = true;
    rubberBand = new mxRubberband(graph);

    graph.setConnectable(true);
  }

  /**
   * 初始化事件绑定
   */
  initEventBand() {
    graph.addListener(mxEvent.CLICK, (sender, evt) => {
      const cell = evt.properties.cell;

      if (!cell || cell.edge) {
        // 没有cell选中 或者 单点击线的话
        this.$emit(CanvasEvent.NodeBlue);
        return;
      }
      this.activeNode(cell);
    });

    // 监听 mxGraph 事件
    const mxGraphModel = graph.getModel();
    mxGraphModel.addListener(mxEvent.CHANGE, this.handleModelChange);
    graph.addListener(mxEvent.ADD_CELLS, this.handleCellsAdd);
    graph.addListener(mxEvent.CELLS_ADDED, this.handleCellsAdded);
  }

  handleCellsAdded(e, eventObj) {
    const properties = eventObj.properties;
    console.log(properties, properties.source);
    if (properties.source && properties.target && this.needLimit) {
      let maxDeepth = this.checkDeepth(properties.source, properties.target);
      if (maxDeepth > PerformanceLimit.DEEPTHLimit) {
        graph.removeCells(properties.cells, true);
        message.error(`配置的节点深度超过${PerformanceLimit.DEEPTHLimit}层限制`);
      }
      console.log(maxDeepth);
    }
  }

  /**
   * 校验层级
   */
  checkDeepth(source, target) {
    let outputIndex: any = null;
    const nodes = this.nodes;
    const edges = this.edges.map((edge, index) => {
      let sourceType,
        targetType,
        result = {
          source: edge.source,
          target: edge.target,
          sourceType: null,
          targetType: null
        };
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === edge.source) {
          sourceType = nodes[i].type;
        }
        if (nodes[i].id === edge.target) {
          targetType = nodes[i].type;
        }
        if (targetType === "output") {
          outputIndex = index;
        }
        if (sourceType && targetType) {
          result.sourceType = sourceType;
          result.targetType = targetType;
          break;
        }
      }
      return result;
    });

    edges.push({
      source: source.id,
      target: target.id,
      sourceType: source.data.type,
      targetType: target.data.type
    });

    if (target.data.type === "output") {
      outputIndex = edges.length - 1;
    }

    let startNode = edges[outputIndex];
    let maxDeepth = 0;

    if (!startNode) {
      return 0;
    }
    const getDepth = (node, depth) => {
      let children = edges.filter(item => {
        return item.target === node.source;
      });
      if (children.length > 0) {
        depth++;
        children.forEach(child => {
          getDepth(child, depth);
        });
      } else {
        maxDeepth = depth + 1 > maxDeepth ? depth + 1 : maxDeepth;
      }
    };

    getDepth(startNode, 0);

    return maxDeepth;
  }

  /**
   * 创建节点
   */
  insertVertex(x: number, y: number, node: H3.Falls.DragNode) {
    const parent = graph.getDefaultParent();
    // 画布的偏移量 和画布缩放的比例
    const ty = graph.view.translate.y;
    const tx = graph.view.translate.x;
    const scale = graph.view.scale;

    let dx = x / scale - tx;
    let dy = y / scale - ty;

    const nodeGeometry = new mxGeometry(
      x / scale - tx,
      y / scale - ty,
      this.nodeWidth,
      this.nodeHeight
    );

    let realValue = this.makeValue(node);
    let id = `DS_${uuid(8, 16)}`;

    const nodeRootVertex = new mxCell(realValue, nodeGeometry, "h3-report-node");
    // const nodeRootVertex = graph.insertVertex(parent, id, name, dx, dy, this.nodeWidth, this.nodeHeight, 'h3-report-node');
    nodeRootVertex.vertex = true;
    nodeRootVertex.id = id;
    nodeRootVertex.data = { ...node };
    // 设置节点的连接点
    nodeRootVertex["constraints"] = this.setNodeConstraints(nodeRootVertex);
    this.existNode.push(nodeRootVertex);
    // graph.setPoint(true, true);
    // 向画布中插入节点 并提供新增节点之前的生命周期钩子
    this.$emit(CanvasEvent.BeforeAddNode, nodeRootVertex);
    if (this.beforeAddNode([nodeRootVertex])) {
      graph.addCell(nodeRootVertex);
      // 新增节点之后的事件
      if (this.afterAddNode) {
        this.afterAddNode([nodeRootVertex]);
      } else {
        // 选中改节点
        graph.setSelectionCells([nodeRootVertex]);
        this.activeNode(nodeRootVertex);
      }
      this.$emit(CanvasEvent.AfterAddNode, [nodeRootVertex]);
    }
  }

  /**
   * 初始化画布
   */
  initOpinions() {
    const parent = graph.getDefaultParent();
    if (this.nodes.length > 0 && this.edges.length > 0) {
      let mxNodes = {};
      let mxEdges = {};
      this.nodes.forEach(node => {
        let name = this.makeValue(node);
        mxNodes[node.id] = graph.insertVertex(
          parent,
          node.id,
          name,
          node.x,
          node.y,
          node.w,
          node.h,
          "h3-report-node"
        );
        mxNodes[node.id].data = {
          text: node.text,
          type: node.type
        };
        mxNodes[node.id]["constraints"] = this.setNodeConstraints(mxNodes[node.id]);
      });

      this.edges.forEach(edge => {
        graph.insertEdge(
          parent,
          null,
          null,
          mxNodes[edge.source],
          mxNodes[edge.target],
          edge.style
        );
      });
    }
  }

  mounted() {
    const container = document.getElementById(`${this.comPrefixCls}__plumb`);
    graph = genGraph(container);
    (window as any).graph = graph;
    // this.initOutLine(); // 导航图
    this.initUndoManager();
    this.initRubberBand();
    this.initEventBand();
    this.initConnectValidation();
    this.initOpinions();

    this.init = false;
  }
}
</script>
