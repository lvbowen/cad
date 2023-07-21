/**
* 错误信息提示
*/
export enum errorMsg {
  SingleNode = '当前流程存在孤立节点',
  MissOutput = '没有输出节点',
  BothInput = '源节点和目标节点都是输入',
  CannotConnecteInput = '不可连接输入节点',
  RepeatedConnection = '重复的连接',
  CannotConnecteOutput = '不可连接输出节点',
  OnlyOneSource = '输出节点只允许一个源',
  AtMostTwoSources = '关联的源头 多余2条',
  ErrorNode = '节点异常, 请删除后重试',
}
