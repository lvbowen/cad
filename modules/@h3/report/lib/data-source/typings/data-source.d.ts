declare namespace H3 {
  namespace DataSource {
    /**
     * 数据源表格
     */
    interface DataSourceTable {
      title: string // 数据源名称
      creator: string // 创建者
      total: number // 总数据条数
      actual: number // 实际数据条数
      lastTime: string // 最后更新时间
    }

    /**
     * 数据源组节点
     */
    interface DataSourceGroup {
      corpId: string // 所属应用的uuid
      displayName: string // 名称
      objectId: string // 子节点Id
      parentObjectId: string // 父节点Id
    }
    
    /**
     * 子节点
     */
    interface FunctionNode {
      displayName: string // 名称
      corpId: string // 所属应用的uuid
      objectId: string // 子节点Id
      parentObjectId: string // 父编码Id
      status: number // 分组节点状态 0-表示正常，1-表示异常
      nodeType: number // 分组节点类型 0-表示分组信息，1-表示具体节点
      creationDate: string // 创建日期
      updateDate: string // 更新日期
      children?: Array<FunctionNode> | null // children
    }
  }
}
