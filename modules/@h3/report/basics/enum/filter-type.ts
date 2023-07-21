// eslint-disable-next-line no-shadow
export enum StringType {
  Equal = "Equal", // 等于
  NotEqual = "NotEqual", // 不等于
  StartWith = "StartWith", // 开头为
  In = "In", // 包含
  NotIn = "NotIn", // 不包含
  None = "None", // 为空
  NotNone = "NotNone", // 不为空
  Match = "Match", // 模糊匹配 包含
  NotMatch = "NotMatch" // 模糊匹配 不包含
}
// eslint-disable-next-line no-shadow
export enum DateType {
  Equal = "Equal", // 等于
  NotEqual = "NotEqual", // 不等于
  Range = "Range", // 范围
  Above = "Above", // 大于
  NotBelow = "NotBelow", // 大于等于
  Below = "Below", // 小于
  NotAbove = "NotAbove", // 小于等于
  None = "None", // 为空
  NotNone = "NotNone" // 不为空
}
// eslint-disable-next-line no-shadow
export enum NumberType {
  Equal = "Equal", // 等于
  NotEqual = "NotEqual", // 不等于
  Range = "Range", // 范围
  Above = "Above", // 大于
  NotBelow = "NotBelow", // 大于等于
  Below = "Below", // 小于
  NotAbove = "NotAbove", // 小于等于
  None = "None", // 为空
  NotNone = "NotNone" // 不为空
}
// eslint-disable-next-line no-shadow
export enum DateFilterType {
  Custom = "Custom",
  Today = "Today",
  Yesterday = "Yesterday",
  ThisWeek = "ThisWeek",
  LastWeek = "LastWeek",
  ThisMonth = "ThisMonth",
  LastMonth = "LastMonth"
}

// eslint-disable-next-line no-shadow
export enum FormatDateType {
  Date = "Date",
  Time = "Time"
}
export const dateFilterType = [
  { label: "自定义", value: DateFilterType.Custom },
  { label: "今天", value: DateFilterType.Today },
  { label: "昨天", value: DateFilterType.Yesterday },
  { label: "本周", value: DateFilterType.ThisWeek },
  { label: "上周", value: DateFilterType.LastWeek },
  { label: "本月", value: DateFilterType.ThisMonth },
  { label: "上月", value: DateFilterType.LastMonth }
];
export const dateFilterTypeList = {
  Today: "今天",
  Yesterday: "昨天",
  ThisWeek: "本周",
  LastWeek: "上周",
  ThisMonth: "本月",
  LastMonth: "上月",
  Custom: "自定义"
};
export const formatDataList = [
  { label: "日期", value: FormatDateType.Date },
  { label: "日期和时间", value: FormatDateType.Time }
];

export default {
  string: [
    { label: "等于", value: StringType.Equal },
    { label: "不等于", value: StringType.NotEqual },
    // { label: '开头为', value: StringType.StartWith },
    { label: "等于任意一个", value: StringType.In },
    { label: "不等于任意一个", value: StringType.NotIn },
    { label: "为空", value: StringType.None },
    { label: "不为空", value: StringType.NotNone }
  ],
  date: [
    { label: "等于", value: DateType.Equal },
    { label: "不等于", value: DateType.NotEqual },
    { label: "范围", value: DateType.Range },
    { label: "大于", value: DateType.Above },
    { label: "大于等于", value: DateType.NotBelow },
    { label: "小于", value: DateType.Below },
    { label: "小于等于", value: DateType.NotAbove },
    { label: "为空", value: DateType.None },
    { label: "不为空", value: DateType.NotNone }
  ],
  number: [
    { label: "等于", value: NumberType.Equal },
    { label: "不等于", value: NumberType.NotEqual },
    { label: "范围", value: NumberType.Range },
    { label: "大于", value: NumberType.Above },
    { label: "大于等于", value: NumberType.NotBelow },
    { label: "小于", value: NumberType.Below },
    { label: "小于等于", value: NumberType.NotAbove },
    { label: "为空", value: NumberType.None },
    { label: "不为空", value: NumberType.NotNone }
  ]
};
