export enum NodeErrorCode {
  RELATIONTARGETEDGES = "relationTargetEdges",
  BEFOREGROUPS = "beforeGroups",
  RELATIONREPEATEDMODEL = "relationRepeatedModel",
  MERGETARGETEDGES = "mergeTargetEdges",
  OUTPUTEMPTY = "outputEmpty",
  ISOLATEDNODE = "isolatedNode"
}

export enum NodeErrorMessage {
  RELATIONTARGETEDGES = "请将 2 个节点连接至本节点",
  BEFOREGROUPS = "请先完成前面节点的配置",
  RELATIONREPEATEDMODEL = "同一来源的数据无法进行关联",
  MERGETARGETEDGES = "追加合并只支持2-10个节点",
  OUTPUTEMPTY = "请将 1 个节点连接至本节点",
  ISOLATEDNODE = "当前存在孤立节点"
}
export enum ModelErrorCode {
  MISSFORM = "missForm",
  MISSFIELD = "missField"
}
export enum ModelErrorMessage {
  MISSFORM = "表单不存在",
  MISSFIELD = "表单字段不存在"
}

/**
 * node类型隐射Stage类型
 */
export const NodeToStageType: { [key in NodeType]: string | any } = {
  input: "models",
  output: "output",
  union: "merges",
  join: "relations",
  group: "groups",
  filter: "filters",
  uniq: "uniqs",
  compute: "computes"
};
/**
 * 节点类型枚举
 */
export enum NodeType {
  // 输入
  INPUT = "input",
  // 输出
  OUTPUT = "output",
  // 合并
  UNION = "union",
  // 关联
  JOIN = "join",
  // 分组汇总
  GROUP = "group",
  // 过滤
  FILTER = "filter",
  // 删除重复项
  UNIQ = "uniq",
  // 字段设置
  COMPUTE = "compute"
}
/**
 * 画布动作
 */
export enum CanvasAction {
  // 撤回
  UNDO = "undo",
  // 返撤回
  REDO = "redo",
  // 插入节点
  INSERT = "insert",
  // 删除节点
  DELETE = "delete",
  // 等大小
  SAMESIZE = "same-size",
  // 垂直等距
  VERTICAL = "vertical",
  // 水平等距
  HORIZONTAL = "horizontal",
  // 垂直对齐
  VERTICALALIGN = "vertical-alignment",
  // 水平对齐
  HORIZONTALALIGN = "horizontal-alignment",
  // 更新节点信息
  UPDATENODE = "update-node",
  // 手动失焦所有节点
  BLUR = "blur",
  // 设置样式
  SETERRORSTYLE = "setErrorStyle",
  // 设置样式
  RESETSTYLE = "reSetStyle"
}

/**
 * 画布校验错误信息
 */
export enum errorMsgType {}

/**
 * 节点ICON信息
 */
export enum nodeIcon {
  // 输入
  input = "input",
  // 输出
  output = "output",
  // 合并
  union = "merge-o",
  // 关联
  join = "confluence-o",
  // 分组汇总
  group = "list-o",
  // 过滤
  filter = "filter-o",
  // 删除重复项
  uniq = "delete-o"
}

/**
 * 高级数据源节点性能限制
 */
export enum PerformanceLimit {
  // 输入节点个数
  INPUTNODELIMIT = 4,

  // 层级数量
  DEEPTHLimit = 3
}
