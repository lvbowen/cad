declare namespace H3 {
  namespace Falls {
    export enum NodeErrorCode {
      RELATIONTARGETEDGES = 'relationTargetEdges',
      BEFOREGROUPS = 'beforeGroups',
      RELATIONREPEATEDMODEL = 'relationRepeatedModel',
      MERGETARGETEDGES = 'mergeTargetEdges',
      OUTPUTEMPTY = 'outputEmpty',
      ISOLATEDNODE = "isolatedNode"
  }

    export enum NodeErrorMessage {
      RELATIONTARGETEDGES = '请将 2 个节点连接至本节点',
      BEFOREGROUPS = '请先完成前面节点的配置',
      RELATIONREPEATEDMODEL = '同一来源的数据无法进行关联',
      MERGETARGETEDGES = '追加合并只支持2-10个节点',
      OUTPUTEMPTY = '请将 1 个节点连接至本节点',
      ISOLATEDNODE = "当前存在孤立节点"
    }
    interface NodeErrorOption {
      key: NodeErrorCode,
      message: NodeErrorMessage
    }
    interface NodeRelationResult {
      code: 'success' | 'fail',
      ret: H3.Falls.Source | NodeValidateMessage // 返回结果
      source?: Array<NodeRelationField>
    }

    interface NodeRelationField {
      id: string // 节点id
      text: string, // 节点名称
      type: string // 节点类型
      fields: Array<H3.Falls.Field> // 字段 <id : UUID >
    }

    interface NodeValidateMessage {
      nodeId?: string // 节点id
      message?: NodeErrorOption //错误消息
      repeated?: Array<Array<string>> // 重复的模型 [ [%1, %2],[%3, %4]] 重复模型的分组
    }
   
    export enum ModelErrorCode {
      SUCCESS = 'success',
      MISSFORM = "missForm",
      MISSFIELD = "missField",
    }
    export enum ModelErrorMessage {
      SUCCESS = '校验模型一致',
      MISSFORM= "保存表单缺失，请重新配置输入节点数据源",
      MISSFIELD= "保存表单字段缺失",
    }
    interface ModelValidateMessage {
      nodeIds?: Array<string> // 节点id
      message?: ModelErrorOption //错误消息
    }
    interface ModelErrorOption {
      key: ModelErrorCode,
      message: ModelErrorMessage
    }
    interface ModelRelationResult{
      code: 'success' | 'fail',
      res?: ModelValidateMessage,
      source: H3.Falls.Source
    }
    
  }
}
