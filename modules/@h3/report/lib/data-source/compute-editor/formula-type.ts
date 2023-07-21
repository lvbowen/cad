export interface FormulaDocument {
  formula: string;
  doc: string | HTMLElement;
}

// const formulas: { [key in '文本函数' | '数字函数' | '日期函数' | '逻辑函数'] } = {
const formulas = {
  文本函数: {
    LEN: "<span>LEN(text)\t返回文本字符串text中的字符个数</span>",
    LOWER: "LOWER(text)	将文本字符串text中所有大写字母转换为小写",
    UPPER: "UPPER(text)	将文本字符串text中所有小写字母转换为大写",
    TRIM: "TRIM(text)	去掉文本字符串text中的首尾空格",
    CONCATENATE:
      "CONCATENATE(text1,[text2], …)	将多个可用变量（字符串、时间戳、数字）合并成一个文本字符串。示例：CONCATENATE(A,B,C)，即返回值为ABC，字段或者函数之间，用逗号隔开。如果是字符串，需要用引号包裹起来"
    // TEXT: 'TEXT(num) 将数字转化成文本 ',
    // VALUE: 'VALUE(text)将文本转化为数字'
  },
  数字函数: {
    ABS: "ABS(number)	返回数字number的绝对值",
    COS: "COS(A)	返回-1到1之间的余弦值，参数A为弧度，弧度=角度*π/180",
    INT: "INT(number)	将数字number向下取整为最接近的整数",
    // ROW_MAX: 'ROW_MAX(num1,num2,num3,...)	返回一行数据中几个数值字段中的最大值',
    // ROW_MIN: 'ROW_MIN(num1,num2,num3,...)	返回一行数据中几个数值字段中的最小值',
    MOD: "MOD(number,divisor)	返回两数相除的余数，参数number是被除数，divisor是除数",
    PI: "PI()	圆周率3.1415…",
    ROUND:
      "ROUND(number,num_digits)	将数字四舍五入到指定的位数，number为要处理的数字，num_digits为指定小数位数",
    SIN: "SIN(A)	返回-1到1之间的正弦值，参数A为弧度，弧度=角度*π/180",
    SQRT: "SQRT(number)	开平方，参数number为非负数",
    // ROW_AVERAGE: 'ROW_AVERAGE(num1,num2,num3,...)	返回一行数据中几个数值字段中的平均值',
    // SUM: 'SUM(v)	统计输入参数的数值之和，参数v是子表的某一个数字控件',
    // UPPERMONEY: 'UPPERMONEY(数字)	将数值转为中文大写金额',
    // LARGE: 'LARGE(array,k)	"返回数据集中第k个最大值',
    // Array: '需要确定第k个最大值的数组或数据区域；k: 返回值在数组中的位置（从大到小排）',
    LOG:
      'LOG(number, [base])	"根据指定底数返回数字的对数\nnumber: 想要计算其对数的正实数；base: 对数的底数；如果省略 base，则假定其值为 10',
    // POWER: 'POWER(number, power)	"返回数字乘幂的结果\nnumber: 基数，可为任意实数；power: 基数乘幂运算的指数',
    RAND: "RAND()	返回大于等于 0 且小于 1 的均匀分布随机实数，每一次触发计算都会变化"
  },
  日期函数: {
    // YEARS: 'YEARS(end_date,start_date) 返回两个日期之间的年数差值，精确到两位小数。end_date为结束日期，start_date为开始日期',
    // DAYS:'DAYS(end_date,start_date) 返回两个日期之间的天数差值，精确到两位小数。end_date为结束日期，start_date为开始日期',
    // HOURS:'HOURS(end_time,start_time) 返回两个时间之间的小时数，精确到两位小数。end_time为结束时间，start_time为开始时间',
    // MINUTES:'MINUTES(end_time,start_time) 返回两个时间之间的分钟数，精确到两位小数。end_time为结束时间，start_time为开始时间',
    NOW: "NOW() 返回当前时间，精确到时分秒，格式为yyyy-MM-dd hh:mm:ss",
    ADDDAY:
      "ADDDAY(date,days) 将指定日期加/减指定天数，date为指定日期，days为指定天数，当为负数时在date上减去此天数",
    ADDMONTH:
      "ADDMONTH(date,months) 将指定日期加/减指定月数，date为指定日期，months为指定月数，当为负数时在此date上减去此月数",
    ADDYEAR:
      "ADDYEAR(date,years) 将指定日期加/减指定年数，date为指定日期，years为指定年数，当为负数时在此date上减去此年数",
    // DATE:'DATE(year,month,day,[hour,minute,second]) 将年月日时分秒转换为日期',
    YEAR: "YEAR(date) 返回日期date的年份",
    MONTH: "MONTH(date) 返回日期date月份，值为介于1到12之间的整数",
    DAY: "DAY(date) 返回日期date的天数，值为介于1到31之间的整数",
    HOUR: "HOUR(time) 返回日期time的小时部分",
    MINUTE: "MINUTE(time) 返回日期time的分钟部分",
    QUARTER: "QUARTER(date) 返回日期date的所属季度，值为介于1到4的整数",
    TODAY: "TODAY() 返回今天的日期，格式为:yyyy-MM-dd",
    WEEKDAY: "WEEKDAY(date) 返回指定日期date为星期几",
    WEEKNUM: "WEEKNUM(date) 返回一个数字，该数字代表指定日期date是一年中的第几周",
    TIMESTAMP: "TIMESTAMP(date) 将日期对象转换成时间戳",
    SECOND: "SECOND(date) 返回某日期的秒数"
    // WORKDAY:'WORKDAY(start_date, days, [holidays]) 返回在某日期（起始日期）之前或之后、与该日期相隔指定工作日的某一日期的日期值。 工作日不包括周末和专门指定的假日\n' +
    //   'Start_date: 一个代表开始日期的日期\n' +
    //   'Days: start_date 之前或之后不含周末及节假日的天数。 Days 为正值将生成未来日期；为负值生成过去日期\n' +
    //   'Holidays: 一个可选参数，其中包含需要从工作日历中排除的一个或多个日期，例如各种省/市/自治区和国家/地区的法定假日及非法定假日。该列表可以是由日期所构成的数组常量',
    // DATEDELTA:'DATEDELTA(timestamp, deltadays) 将指定日期加/减指定天数。\n' +
    //   'timestamp: 初始日期\n' +
    //   'deltadays: 需要加减的天数。正数为增加，负数为减少'
  }
  // '逻辑函数': {
  // IF: 'IF(A,B,C)	如果满足条件A，则返回B，否则返回C，支持多层嵌套IF函数',
  // AND: '表达式1 AND 表达式2	多个用AND连接的表达式,当所有表达式均为true时，表达式返回true，否则返回False',
  // OR: '表达式1 OR 表达式2	多个用OR连接的表达式，只要有一个表达式为true，表达式返回true',
  // IFS: 'IFS( logical_1, value_if_true_1, logical_2, value_if_true_2, … ,logical_n, value_if_true_n)	检查是否满足一个或多个条件，且返回符合第一个 TRUE 条件的值。 IFS 可以取代多个嵌套 IF 语句，并且有多个条件时更方便阅读',
  // }
};

export default formulas;
