/**
 * 字符串
 */
// eslint-disable-next-line no-shadow
export enum StringType {
  COUNT = 'COUNT'
}

/**
 * 数值
 */
// eslint-disable-next-line no-shadow
export enum NumberType {
  SUM = 'SUM',
  AVG = 'AVG',
  MAX = 'MAX',
  MIN = 'MIN',
  COUNT = 'COUNT',
}

/**
 * 日期
 */
// eslint-disable-next-line no-shadow
export enum DateType {
  Y = 'Y',
  YQ = 'YQ',
  YM = 'YM',
  YW = 'YW',
  YMD = 'YMD',
}

/**
 * 聚合类型
 */
// eslint-disable-next-line no-shadow
export enum AggregateResultType {
  DEFAULT = 'DEFAULT',
  PERCENT = 'PERCENT'
}

export default {
  string: [
    { label: '计数', value: StringType.COUNT }
  ],
  number: [
    { label: '总和值', value: NumberType.SUM },
    { label: '平均值', value: NumberType.AVG },
    { label: '最大值', value: NumberType.MAX },
    { label: '最小值', value: NumberType.MIN },
    { label: '计数', value: NumberType.COUNT }
  ],
  date: [
    { label: '年', value: DateType.Y },
    { label: '年-季度', value: DateType.YQ },
    { label: '年-月', value: DateType.YM },
    { label: '年-周', value: DateType.YW },
    { label: '年-月-日', value: DateType.YMD }
  ],
  aggregateResult: [
    { label: '显示为实际值', value: AggregateResultType.DEFAULT },
    { label: '显示为占比', value: AggregateResultType.PERCENT },
  ]
}
