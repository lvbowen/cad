/* eslint-disable */

export interface FormControlOptions {


    [key: string]: any

    // /**
    //  * 控件名称 | 标题
    //  */
    // name: string = ''
}


export class StyleControlOptions implements FormControlOptions {

    /**
     * 控件名称
     */
    name: string = ''

    /**
     * 多语言
     */
    name_i18n: { [key: string]: string } | null = null

    /**
     * 是否可见
     */
    visible: boolean = true

    /**
     * 控件样式
     */
    style: string | null = null
    /**
     * tip提示
     */
    tips: string = ''
}


export class EditableControlOptions extends StyleControlOptions {

    /**
     * 显示条件
     */
    displayFormula = ''

    /**
     * 变更事件
     */
    onChange: string | null = null

}


export class InputControlOptions extends EditableControlOptions {

    /**
     * 必填条件
     */
    requiredFormula = ''

    /**
     * 是否只读
     */
    readonlyFormula = false

}

/**
 * 数字格式化类型
 */
export enum NumberFormatType {

    /**
     * 空
     */
    None = 'none',

    /**
     * 整数 200
     */
    Int = 'integer',

    /**
     * 十分位 2,000.0
     */
    Tenths = 'tenths',
    /**
     * 两位小数点 2,000.00
     */
    Decimal = 'percentile',
    /**
     * 三位小数点 2,000.000
     */
    Decimal2 = 'Millimeter',
    /**
     * 四位小数点 2,000.0000
     */
    Decimal3 = 'tenThousand',
    /**
     * 五位小数点 2,000.00000
     */
    Decimal4 = 'hundredThousand',
    /**
     * 六位小数点 2,000.000000
     */
    Decimal5 = 'millionDecimals',
    /**
     * 七位小数点 2,000.0000000
     */
    Decimal6 = 'tenMillionDecimals',
    /**
     * 八位小数点 2,000.00000000
     */
    Decimal7 = 'billionDecimals',

    /**
     * 百分比 20%
     */
    Ratio = 'ratio',

    /**
     * 百分比单小数点 20.0%
     */
    Ratio2 = 'ratio.tenths',

    /**
     * 百分比双小数点 20.00%
     */
    Ratio3 = 'ratio.percentile',
    /**
     * 百分比三个小数点 20.000%
     */
    Ratio4 = 'ratio.Millimeter',

    /**
     * 百分比四个小数点 20.0000%
     */
    Ratio5 = 'ratio.tenThousand',

    /**
     * 百分比五个小数点 20.00000%
     */
    Ratio6 = 'ratio.hundredThousand',

    /**
     * 百分比六个小数点 20.000000%
     */
    Ratio7 = 'ratio.millionDecimals',

    /**
     * 百分比七个小数点 20.0000000%
     */
    Ratio8 = 'ratio.tenMillionDecimals',

    /**
     * 百分比八个小数点 20.00000000%
     */
    Ratio9 = 'ratio.billionDecimals',

    /**
     * 货币-人民币 ￥2,000.00
     */
    CurrencyRMB = 'RMB.percentile',

    /**
     * 货币-人民币 ￥2,000.000
     */
    CurrencyRMB2 = 'RMB.Millimeter',

    /**
     * 货币-人民币 ￥2,000.0000
     */

    CurrencyRMB3 = 'RMB.tenThousand',

    /**
     * 货币-人民币 ￥2,000.00000
     */

    CurrencyRMB4 = 'RMB.hundredThousand',

    /**
     * 货币-人民币 ￥2,000.000000
     */

    CurrencyRMB5 = 'RMB.millionDecimals',

    /**
     * 货币-人民币 ￥2,000.0000000
     */

    CurrencyRMB6 = 'RMB.tenMillionDecimals',

    /**
     * 货币-人民币 ￥2,000.00000000
     */

    CurrencyRMB7 = 'RMB.billionDecimals',

    /**
     * 货币-美元 $2,000.00
     */
    CurrencyDollar = 'dollar.percentile',

    /**
     * 货币-美元 $2,000.000
     */

    CurrencyDollar2 = 'dollar.Millimeter',

    /**
     * 货币-美元 $2,000.0000
     */

    CurrencyDollar3 = 'dollar.tenThousand',

    /**
     * 货币-美元 $2,000.00000
     */

    CurrencyDollar4 = 'dollar.hundredThousand',

    /**
     * 货币-美元 $2,000.000000
     */

    CurrencyDollar5 = 'dollar.millionDecimals',

    /**
     * 货币-美元 $2,000.0000000
     */

    CurrencyDollar6 = 'dollar.tenMillionDecimals',

    /**
     * 货币-美元 $2,000.00000000
     */

    CurrencyDollar7 = 'dollar.billionDecimals',

    /**
     * 货币-欧元 €2,000.00
     */
    CurrencyEuro = 'euro.percentile',
    CurrencyEuro2 = 'euro.Millimeter',
    CurrencyEuro3 = 'euro.tenThousand',
    CurrencyEuro4 = 'euro.hundredThousand',
    CurrencyEuro5 = 'euro.millionDecimals',
    CurrencyEuro6 = 'euro.tenMillionDecimals',
    CurrencyEuro7 = 'euro.billionDecimals',

    /**
     * 货币-港币 HK$2,000.00
     */
    CurrencyHK = 'HK.percentile',
    CurrencyHK2 = 'HK.Millimeter',
    CurrencyHK3 = 'HK.tenThousand',
    CurrencyHK4 = 'HK.hundredThousand',
    CurrencyHK5 = 'HK.millionDecimals',
    CurrencyHK6 = 'HK.tenMillionDecimals',
    CurrencyHK7 = 'HK.billionDecimals',

}

export enum DateValueType {
    /**
     * 空
     */
    None = 'none',
    /**
     * 当前时间
     */
    Current = 'current',

    /**
     *  使用数据项的默认值
     */
    DataItemDefault = 'dataItemDefault'
}

export enum LocationType {
    Area = 'pp-cc-aa',
    City = 'pp-cc',
    Province = 'pp'
}

export enum TextAreaType {
    LongText = 'longText',
    Editor = 'Editor'
}
