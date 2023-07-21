
/**
 * 阶段状态
 */
export enum stageStatus{
  // 列表展示
  preview = 'preview',
  // 配置
  setting='setting'
}
/**
 * 节点类型枚举
 */
export enum StageType {
  models = 'models',
  output = 'output',
  merges = 'merges',
  relations = 'relations',
  computes = 'computes',
  groups = 'groups',
  filters = 'filters',
  uniqs = 'uniqs'
}
