import mxgraph from './graph';

const {
  mxGraph,
  mxVertexHandler,
  mxConstants,
  mxCellState,
  mxPerimeter,
  mxCellEditor,
  mxGraphHandler,
  mxEvent,
  mxEdgeHandler,
  mxShape,
  mxConnectionConstraint,
  mxPoint,
  mxEventObject,
  mxConstraintHandler,
  mxEllipse,
  mxImage
} = mxgraph;

Object.assign(mxEvent, {
  EDGE_START_MOVE: 'edgeStartMove',
  VERTEX_START_MOVE: 'vertexStartMove',
});
 
export class Graph extends mxGraph {

  static getCellPosition(cell) {
  }

  constructor(container) {
    super(container);
    this._init();
  }

  _init() {
    this._setDefaultConfig();
    this._configConstituent();
    this._putVertexStyle();
    this._setDefaultEdgeStyle();
    this._setAnchors();
    this._configCustomEvent();
  }

  _configConstituent() {
    // Redirects selection to parent
    this.selectCellForEvent = (...args) => {
      const [cell] = args;
      if (this.isPart(cell)) {
        args[0] = this.model.getParent(cell);
        mxGraph.prototype.selectCellForEvent.call(this, args);
        return;
      }

      mxGraph.prototype.selectCellForEvent.apply(this, args);
    };

    /**
     * Redirects start drag to parent.
     */
    const graphHandlerGetInitialCellForEvent = mxGraphHandler.prototype.getInitialCellForEvent;
    mxGraphHandler.prototype.getInitialCellForEvent = function getInitialCellForEvent(...args) {
      // this 是 mxGraphHandler
      let cell = graphHandlerGetInitialCellForEvent.apply(this, args);
      if (this.graph.isPart(cell)) {
        cell = this.graph.getModel().getParent(cell);
      }

      return cell;
    };
  }
  /**
   * 设置默认配置 初始化
   */
  _setDefaultConfig() {
    this.setConnectable(true);
    mxEvent.disableContextMenu(this.container);

    // 固定节点大小
    this.setCellsResizable(false);

    // 禁止节点折叠
    this.foldingEnabled = false;
    // 文本包裹效果必须开启此配置
    this.setHtmlLabels(true);

    // 拖拽过程对齐线
    mxGraphHandler.prototype.guidesEnabled = true;
    mxGraphHandler.GUIDE_COLOR = '#107FFF';
    mxGraphHandler.prototype.previewColor = '#107FFF';

    // 禁止游离线条
    this.setDisconnectOnMove(false);
    this.setAllowDanglingEdges(false);
    mxGraph.prototype.isCellMovable = cell => !cell.edge;

    // 禁止调整线条弯曲度
    this.setCellsBendable(false);

    // 禁止从将label从线条上拖离
    mxGraph.prototype.edgeLabelsMovable = false;
    // 禁止编辑
    mxGraph.prototype.cellsEditable = false;
  }

  /**
   * 设置节点样式
   */
  _putVertexStyle() {
    const normalTypeStyle = {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_IMAGE,
      [mxConstants.STYLE_PERIMETER]: mxPerimeter.RectanglePerimeter,
    };
    this.getStylesheet().putCellStyle('normalType', normalTypeStyle);

    const nodeStyle = {

      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_LABEL,
      [mxConstants.STYLE_PERIMETER]: mxPerimeter.RectanglePerimeter,
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 2, // 设置圆角程度

      [mxConstants.STYLE_STROKECOLOR]: 'none', 
      [mxConstants.STYLE_FONTCOLOR]: '#304265',
      [mxConstants.STYLE_FILLCOLOR]: '#ffffff',
      [mxConstants.STYLE_SHADOW]: true,
      [mxConstants.STYLE_OVERFLOW]: 'hidden',
      [mxConstants.STYLE_TEXT_OVERFLOW]: 'ELLIPSIS',

      [mxConstants.STYLE_ALIGN]: mxConstants.ALIGN_LEFT,
      [mxConstants.STYLE_VERTICAL_ALIGN]: mxConstants.ALIGN_MIDDLE,

      [mxConstants.STYLE_SPACING_LEFT]: '16',
      [mxConstants.STYLE_SPACING_RIGHT]: '16',

    };
    this.getStylesheet().putCellStyle('h3-report-node', nodeStyle);

    const errorNodeStyle = {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_LABEL,
      [mxConstants.STYLE_PERIMETER]: mxPerimeter.RectanglePerimeter,
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 6, // 设置圆角程度

      [mxConstants.STYLE_STROKECOLOR]: '#FF4384', 
      [mxConstants.STYLE_FONTCOLOR]: '#304265',
      [mxConstants.STYLE_FILLCOLOR]: '#ffe6eb',
      [mxConstants.STYLE_SHADOW]: true,
      [mxConstants.STYLE_OVERFLOW]: 'hidden',
      [mxConstants.STYLE_TEXT_OVERFLOW]: 'ELLIPSIS',

      [mxConstants.STYLE_ALIGN]: mxConstants.ALIGN_LEFT,
      [mxConstants.STYLE_VERTICAL_ALIGN]: mxConstants.ALIGN_MIDDLE,

      [mxConstants.STYLE_SPACING_LEFT]: '16',
      [mxConstants.STYLE_SPACING_RIGHT]: '16',
      
    }
    this.getStylesheet().putCellStyle('h3-report-node--error', errorNodeStyle);


    // 选中节点/线的颜色 类型
    mxConstants.VERTEX_SELECTION_COLOR = '#107FFF'
    mxConstants.VERTEX_SELECTION_DASHED = false
    mxConstants.EDGE_SELECTION_COLOR = '#107FFF'
    mxConstants.EDGE_SELECTION_STROKEWIDTH = '2'
    mxConstants.EDGE_SELECTION_DASHED = false
    // 连接的矫正线颜色
    mxConstants.VALID_COLOR = '#107FFF' // 有效的链接
    mxConstants.INVALID_COLOR = '#107FFF' // 无效的链接
    // 节点阴影
    mxConstants.SHADOWCOLOR = '#E0E5F0'
    mxConstants.SHADOW_OFFSET_X = '0'
    mxConstants.SHADOW_OFFSET_Y = '0'
    mxConstants.SHADOW_OPACITY = '0.8'


    // 设置选中状态节点的边角为圆角，默认是直角
    const oldCreateSelectionShape = mxVertexHandler.prototype.createSelectionShape;
    mxVertexHandler.prototype.createSelectionShape = function createSelectionShape(...args) {
      const res = oldCreateSelectionShape.apply(this, args);
      res.isRounded = true;
      // style 属性来自 mxShape , mxRectangle 继承自 mxShape
      res.style = {
        arcSize: 6,
      };
      return res;
    };
  }

  /**
   * 设置链接线样式
   */
  _setDefaultEdgeStyle() {
    const style = this.getStylesheet().getDefaultEdgeStyle();
    Object.assign(style, {
      [mxConstants.STYLE_ROUNDED]: true, // 设置线条拐弯处为圆角
      [mxConstants.STYLE_STROKEWIDTH]: '2',
      [mxConstants.STYLE_STROKECOLOR]: '#8893A7',
      [mxConstants.STYLE_EDGE]: mxConstants.EDGESTYLE_ORTHOGONAL,
      [mxConstants.STYLE_FONTCOLOR]: '#107FFF',
    });
    // 设置拖拽线的过程出现折线，默认为直线
    this.connectionHandler.createEdgeState = () => {
      const edge = this.createEdge();
      return new mxCellState(this.view, edge, this.getCellStyle(edge));
    };
  }

  _setAnchors() {
    // 禁止从节点中心拖拽出线条
    this.connectionHandler.isConnectableCell = () => false;
    mxEdgeHandler.prototype.isConnectableCell = () => false;

    // 重写每个节点的连接点
    mxGraph.prototype.getAllConnectionConstraints = (terminal) => {
      const cell = terminal['cell']
      const constraints = cell['constraints']

      if (constraints instanceof Array && constraints.length > 0) {

        return constraints.map((constraint) => {
          return new mxConnectionConstraint(new mxPoint(constraint['x'], constraint['y']), constraint['perimeter'])
        })
      } else {
        if (terminal.shape.stencil) {
          return terminal.shape.stencil.constraints
        } else if (terminal.shape.constraints) {
          return terminal.shape.constraints
        }
      }
      return null;
    };

    const pointImg = require('./point.gif');
    mxConstraintHandler.prototype.pointImage = new mxImage(pointImg, 10, 10);

    mxConstraintHandler.prototype.createHighlightShape = function () {
      return new mxEllipse(null, '#107fff', '#107fff', 3)
    }

  }

  _configCustomEvent() {
    const graph = this;
    const oldStart = mxEdgeHandler.prototype.start;
    mxEdgeHandler.prototype.start = function start(...args) {
      oldStart.apply(this, args);
      graph.fireEvent(new mxEventObject(mxEvent.EDGE_START_MOVE,
        'edge', this.state.cell,
        'source', this.isSource,
      ));
    };


    const oldCreatePreviewShape = mxGraphHandler.prototype.createPreviewShape;
    mxGraphHandler.prototype.createPreviewShape = function createPreviewShape(...args) {
      graph.fireEvent(new mxEventObject(mxEvent.VERTEX_START_MOVE));
      return oldCreatePreviewShape.apply(this, args);
    };
    
  }

  getDom(cell) {
    const state = this.view.getState(cell);
    return state.shape.node;
  }

  setStyle(cell, key, value) {
    const styleDict = Graph.getStyleDict(cell);
    styleDict[key] = value;
    const style = Graph.convertStyleToString(styleDict);
    this.getModel().setStyle(cell, style);
  }

  setPoint(input, output) {
    // Defines the default constraints for all shapes
    if (input && output) {
      mxShape.prototype.constraints = [
        new mxConnectionConstraint(new mxPoint(0, 0.5), true, 'input'),
        new mxConnectionConstraint(new mxPoint(1, 0.5), true, 'output'),
      ]
      return
    }
    if (input) {
      mxShape.prototype.constraints = [
        new mxConnectionConstraint(new mxPoint(0, 0.5), true, 'input'),
      ]
      return
    }
    if (output) {
      mxShape.prototype.constraints = [
        new mxConnectionConstraint(new mxPoint(1, 0.5), true, 'output'),
      ]

    }
    
  }

  isPart(cell) {
    const state = this.view.getState(cell);
    const style = (state != null) ? state.style : this.getCellStyle(cell);
    return style.constituent === 1;
  }

  deleteSubtree(cell) {
    const cells = [];
    this.traverse(cell, true, (vertex) => {
      cells.push(vertex);
      return true;
    });
    this.removeCells(cells);
  }

  /**
   * Function: distributeCells
   * 
   * Distribuets the centers of the given cells equally along the available
   * horizontal or vertical space.
   * 
   * Parameters:
   * 
   * horizontal - Boolean that specifies the direction of the distribution.
   * cells - Optional array of <mxCells> to be distributed. Edges are ignored.
   */
  distributeCells(horizontal, cells) {
    if (cells == null)
    {
      cells = this.getSelectionCells();
    }
    
    if (cells != null && cells.length > 1)
    {
      var vertices = [];
      var max = null;
      var min = null;
      
      for (var i = 0; i < cells.length; i++)
      {
        if (this.getModel().isVertex(cells[i]))
        {
          var state = this.view.getState(cells[i]);
          
          if (state != null)
          {
            var tmp = (horizontal) ? state.getCenterX() : state.getCenterY();
            max = (max != null) ? Math.max(max, tmp) : tmp;
            min = (min != null) ? Math.min(min, tmp) : tmp;
            
            vertices.push(state);
          }
        }
      }
      
      if (vertices.length > 2)
      {
        vertices.sort(function(a, b)
        {
          return (horizontal) ? a.x - b.x : a.y - b.y;
        });
  
        var t = this.view.translate;
        var s = this.view.scale;
        
        min = min / s - ((horizontal) ? t.x : t.y);
        max = max / s - ((horizontal) ? t.x : t.y);
        
        this.getModel().beginUpdate();
        try
        {
          var dt = (max - min) / (vertices.length - 1);
          var t0 = min;
          
          for (var i = 1; i < vertices.length - 1; i++)
          {
            var pstate = this.view.getState(this.model.getParent(vertices[i].cell));
            var geo = this.getCellGeometry(vertices[i].cell);
            t0 += dt;
            
            if (geo != null && pstate != null)
            {
              geo = geo.clone();
              
              if (horizontal)
              {
                geo.x = Math.round(t0 - geo.width / 2) - pstate.origin.x;
              }
              else
              {
                geo.y = Math.round(t0 - geo.height / 2) - pstate.origin.y;
              }
              
              this.getModel().setGeometry(vertices[i].cell, geo);
            }
          }
        }
        finally
        {
          this.getModel().endUpdate();
        }
      }
    }
    
    return cells;
  }


}

let graph = {};

export const destroyGraph = () => {
  graph.destroy();
  graph = {};
};

export const genGraph = (container) => {
  graph = new Graph(container);
  return graph;
};

export const getGraph = () => graph;
