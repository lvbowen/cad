declare namespace H3 {
  namespace Falls {
    /**
     * 流程源
     */
    interface Source {
      nodes: Array<Node>; // 流程节点集合
      edges: Array<Edge>; // 流程关系
      models: Array<Model>; // 模型
      merges: Array<Merge>; // 追加合并
      relations: Array<Relation>; // 关联
      computes?: Array<Compute>; // 字段设置
    }

    /**
     * 流程节点
     */
    interface Node {
      id: string; // 节点ID
      type: string; // 节点类型
      text: string; // 节点文本
      x: number; // 节点X坐标
      y: number; // 节点Y坐标
      w: number; // 节点宽度
      h: number; // 节点高度
    }

    /**
     * 舞台超类
     */
    interface Stage {
      id: string; // 源节点ID
    }

    /**
     *  链接关系
     */
    interface Edge {
      source: string; // 源节点ID
      target: string; // 目标节点ID
      exitX: number; // 源连接点的X坐标
      exitY: number; // 源连接点的y坐标
      entryX: number; // 目标连接点的y坐标
      entryY: number; // 目标连接点的y坐标
      style: string; // 连接线的样式
      anchors?: Array<string>; // 锚点
      shape?: any; // 连接形态
    }

    /**
     * 模型
     */
    interface Model extends Stage {
      main: ModelGroup;
      sub: ModelGroup | null;
    }

    /**
     * 模型组
     */
    interface ModelGroup {
      displayName: string; // 表单名称
      schemaCode: string; // schemaCode
      connId: string; // 后台冗余字段
      refName: string; // 后台冗余字段
      fields: Array<H3.Falls.Field>; // 字段集合
    }

    /**
     * 合并追加
     */
    interface Merge extends Stage {
      groups: [DynamicField];
    }

    /**
     * 动态字段
     */
    interface DynamicField {
      id: string;
      text: string;
      type: string;
      source: { [sourceID: string]: string }; // 字段UUID关联或者模型需要带上#模型ID 计算字段时：key为字符串formula，value为计算表达式
    }

    /**
     * 字段设置
     */
    interface Compute extends Stage {
      fields: Array<DynamicField>;
    }
    /**
     * 字段设置
     */
    interface computeField {
      id: string;
      title: string;
      type: string;
      formula?: string;
      content?: string;
    }
    /**
     * 关联
     */
    interface Relation extends Stage {
      join: string; // 关系
      groups: [RelationGroup];
    }

    interface RelationGroup {
      type: string; // 字段类型
      source: {
        [sourceID: string]: string; // 字段UUID关联或者模型需要带上#模型ID
      };
    }

    /**
     * 画布拖拽节点
     */
    interface DragNode {
      text: string;
      icon?: string;
      type: string;
      disabled?: boolean;
    }
    /**
     * 字段
     */
    interface Field {
      id: string;
      text: string;
      type: string;
      source?: Array<string>; // 模型的ID field#schemaCode
    }

    /**
     * 获取的模型列表
     */
    interface SourceModel {
      corpId: string;
      displayName: string;
      nodeType: 0 | 1;
      objectId: string;
      parentObjectId: string | null;
      schemaCode: string | null;
    }

    /**
     * 画布校验结果
     */
    interface ValidatedResult {
      success: boolean;
      message: string;
      errorNode?: any;
    }
    /**
     * 自定义配置
     */
    interface CustomOptions {
      height?: number; // 底下设置区域的高度
    }

    interface NodesOptions {
      [key: string]: NodeOption;
    }
    interface NodeOption {
      rule: Function; // 规则检查
      model: Function; // 模型检查
    }

    interface MXCell {
      id: string;
      value?: any;
      geometry?: any;
      style?: string;
      vertex?: boolean;
      edge?: boolean;
      parent?: any;
      source: any;
      target: any;
      children?: any;
      edges?: Array<any>;
    }
  }
}
