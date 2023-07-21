export const operator = {
  ASSIGN_REGEX: />=|<=|==|!=/,
  PUNC_REGEX: /[(){},:+\-*%^\/><=]/,
  KEY_WORDS: {'by':'BY','in':'IN','or':'OR','if':'IF','asc':'ASC','not':'NOT','and':'AND','let':'LET','then':'THEN','else':'ELSE','case':'CASE','when':'WHEN','desc':'DESC','fixed':'FIXED','along':'ALONG','order':'ORDER'},
  AGGREGATORS: {'SUM':'SUM','AVG':'AVG','MIN':'MIN','MAX':'MAX','COUNT':'COUNT','COUNTD':'COUNTD','ATTR':'ATTR'},
};

/**
 * 
 */
export class FormulaScanner {
  source: string = '';
  start: number = 0;
  current: number = 0;
  constructor(source?: string) {
    if(source) {
      this.source = source;
    }
  }

  /**
   * 初始化函数
   */
  private init() {
    this.start = 0;
    this.current = 0;
  }
  /**
   * 游标是否是最后
   */
  private isEnd() : boolean {
    return this.current >= this.source.length
  }
  /**
   * 获取当前游标指向的字节
   */
  private currentChart() : string{
    return this.source[this.current]
  }

  /**
   * 是否id字节
   * @param str
   */
  private static isIdChart(str: string) :boolean{
    return FormulaScanner.isLetter(str) || FormulaScanner.isDigit(str) || '_' === str
  }

  /**
   * 是否是字母
   * @param str
   */
  private static isLetter(str: string) :boolean{
    return 'a' <= str && str <= 'z' || 'A' <= str && str <= 'Z'
  }
  /**
   * 判断是否是十六进制的数字
   * @param str
   */
  private static isHexDigit(str: string) :boolean{
    return 'a' <= str && str <= 'f' || 'A' <= str && str <= 'F' || '0' <= str && str <= '9'
  }
  /**
   * 是否是空格
   * @param str
   */
  private static isSpace(str: string) :boolean{
    return str < '!';
  }

  /**
   * 是否是数字
   * @param str
   */
  private static isDigit(str: string) {
    return '0' <= str && str <= '9'
  }
  /**
   * 处理空格
   */
  private lexSpaces() {
    while (FormulaScanner.isSpace(this.currentChart())) this.current++;
    return ['spaces', null, this.lexeme()]
  }
  /**
   * 处理数字
   */
  lexNumber () {
    let str = '';
    const numberWhile = () => {
      while (FormulaScanner.isDigit(this.currentChart())) {
        this.current++;
      }
    };
    let float = false;
    numberWhile();
    if('.' === this.currentChart() && FormulaScanner.isDigit(this.source[this.current + 1])) {
      float = true;
      this.current++;
    }
    numberWhile();
    str = this.lexeme();
    if(float) {
      return ['float', parseFloat(str), str];
    }
    return ['integer', parseInt(str), str];
  }
  /**
   * 处理字符串
   */
  private lexString() {
    let str = '';
    let start = this.source[this.current];
    let tmp = '';
    while (!this.isEnd()) {
      tmp = this.source[this.current++];
      if(tmp === start) {
        start = '';
        break
      }
      str += tmp;
    }
    return '' !== start ? ['tail', str, str] : ['string', str, str];
  }

  /**
   * 处理标识符 bool SUM ...
   */
  private lexIdentifier() {
    let str = '';
    let key = '';
    let aggregators = '';
    let tmpCurrent = 0;
    let tmpStr = '';
    while (FormulaScanner.isIdChart(this.currentChart())) this.current++;
    str = this.lexeme();
    key = str.toLowerCase();
    switch (str) {
      case 'true':
        return ['boolean', !0, str];
      case 'false':
        return ['boolean', !1, str];
    }
    aggregators = str.toUpperCase();
    if (operator.KEY_WORDS[str]) return ['special', operator.KEY_WORDS[key], str];
    tmpCurrent = this.current;
    while (FormulaScanner.isSpace(this.currentChart())) {
      this.current++;
    }
    tmpStr = this.source[this.current];
    this.current = tmpCurrent;
    return '(' === tmpStr ?
      (operator.AGGREGATORS[aggregators] ? ['aggregator', aggregators, str] : ['fname', aggregators, str]) :
      ['alias', str, str]
  }

  /**
   * 字符截断
   * @param num
   */
  private lookahead(num: number = 1) {
    return this.source.substr(this.current, num);
  }
  /**
   * 处理字段截断
   */
  private lexeme() {
    return this.source.substring(this.start, this.current);
  }
  /**
   * 失败的截断
   */
  private lexFail() {
    this.current = this.source.length;
    return ['tail', null, this.source.substr(this.start)];
  }

  /**
   * 处理下一个
   */
  private nextToken(){
    if (this.isEnd()) return null;
    let chart: string =  this.currentChart();
    this.start = this.current;
    switch (!1) {
      case !(chart <= ' '):
        return this.lexSpaces();
      case '\"' !== chart:
      case '\'' !== chart:
        return this.lexString();
      case !('0' <= chart && chart <= '9'):
        return this.lexNumber();
      case !('a' <= chart && chart <= 'z' || 'A' <= chart && chart <= 'Z'):
        return this.lexIdentifier();
      // case '[' !== chart:
      //   return this.lexAliasSquare();
      case !operator.ASSIGN_REGEX.test(this.lookahead(2)):
        chart = this.lookahead(2);
        this.current += 2;
        return ['special', chart, chart];
      case !operator.PUNC_REGEX.test(chart):
        this.current++;
        return ['special', chart, chart];
      default:
        return this.lexFail()
    }
  }

  /**
   * 分析函数
   */
  public analyse(source?: string) {
    if(source) {
      this.source = source;
    }
    const tokenList: any = [];
    while (!this.isEnd()) {
      tokenList.push(this.nextToken());
    } 
    this.init();
    return tokenList;
  }
}
