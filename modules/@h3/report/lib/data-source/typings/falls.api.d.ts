declare namespace H3 {
  namespace FallsAPI {
    export interface DataSource extends H3.Falls.Source {
      nodeId: string; // 节点Id，保存时为输出节点
      objectId: string; // 项目Id
      groupObjectId: string; // 组Id
      title: string; // 高级数据源标题
      options: H3.Falls.CustomOptions; // 自定义配置
    }
  }
}
