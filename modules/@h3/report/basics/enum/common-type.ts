// eslint-disable-next-line no-shadow
export enum PositionType {
  Top = 'top', // 顶部
  Bottom = 'bottom', // 底部
  Left = 'left', // 左边
  Right = 'right', // 右边
}
// eslint-disable-next-line no-shadow
export enum  DirectionType {
  Crosswise = 'crosswise', // 横向
  Endwise = 'endwise', // 纵向
  LeftBank = 'leftBank', //  左倾斜
  RightBank = 'rightBank', // 右倾斜
}
// eslint-disable-next-line no-shadow
export enum  RelationType {
  Left = 'left', // 左连接
  Right = 'right', // 右链接
  Inner = 'inner', //  内连接
}
export const PositionList = [
  { label: '底部', value: PositionType.Bottom },
  { label: '顶部', value: PositionType.Top },
  { label: '左边', value: PositionType.Left },
  { label: '右边', value: PositionType.Right },
];
export const DirectionList = [
  { label: '横向', value: DirectionType.Crosswise },
  { label: '纵向', value: DirectionType.Endwise },
  { label: '左倾斜', value: DirectionType.LeftBank },
  { label: '右倾斜', value: DirectionType.RightBank },
];
export const RelationTypeList = [
  { label: '左连接', value: RelationType.Left },
  { label: '右链接', value: RelationType.Right },
  { label: '内连接', value: RelationType.Inner },
];

