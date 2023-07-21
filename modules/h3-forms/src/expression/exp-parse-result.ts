
/**
 * 聚合函数类型
 */
// eslint-disable-next-line no-shadow
export enum AggregateFuncType {

    Sum = 'sum',

    Max = 'max',

    Min = 'min',

    /**
     * 平均值
     */
    Avg = 'avg',

    /**
     * 计数
     */
    Count = 'count'

}

/**
 * 聚合函数描述
 */
export interface AggregateFunc {

    type: AggregateFuncType

    keys: Array<string | number>

}


/**
 * 表达式解析结果
 */
export interface ExpParseReuslt {

    exp: string

    keys: string[]

    func: Function
}


/**
 * 值表达式解析结果
 */
export interface ValueExpParseReuslt {
    /**
     * 主函数
     */
    func: Function

    /**
     * 依赖的控件ID列表
     */
    keys: string[]

    /**
     * 主函数非聚合函数参数
     */
    args: { [key: string]: string }

    /**
     * 聚合函数
     */
    aggs: { [key: string]: AggregateFunc }


}