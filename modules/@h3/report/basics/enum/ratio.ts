/**
 * 同/环比
 * inc = increase增长
 */
// eslint-disable-next-line no-shadow
export enum Ratio {
  INCVALUE = 1, // 环比增长值
  INCRATE = 2, // 环比增长率
  LASTYEARINCVALUE = 3, // 上年同比增长值
  LASTYEARINCRATE = 4, // 上年同比增长率
  LASTMONTHINCVALUE = 5, // 上月同比增长值
  LASTMONTHINCRATE = 6, // 上月同比增长率
  LASTWEEKINCVALUE = 7, // 上周同比增长值
  LASTWEEKINCRATE = 8 // 上周同比增长率
}
export const analysisRatio = {
  // 年
  Y: [
    { label: "环比增长值", value: Ratio.INCVALUE },
    { label: "环比增长率", value: Ratio.INCRATE }
  ],
  // 年-季
  YQ: [
    { label: "环比增长值", value: Ratio.INCVALUE },
    { label: "环比增长率", value: Ratio.INCRATE },
    { label: "上年同比增长值", value: Ratio.LASTYEARINCVALUE },
    { label: "上年同比增长率", value: Ratio.LASTYEARINCRATE }
  ],
  // 年-月
  YM: [
    { label: "环比增长值", value: Ratio.INCVALUE },
    { label: "环比增长率", value: Ratio.INCRATE },
    { label: "上年同比增长值", value: Ratio.LASTYEARINCVALUE },
    { label: "上年同比增长率", value: Ratio.LASTYEARINCRATE }
  ],
  // 年-周
  YW: [
    { label: "环比增长值", value: Ratio.INCVALUE },
    { label: "环比增长率", value: Ratio.INCRATE },
    { label: "上年同比增长值", value: Ratio.LASTYEARINCVALUE },
    { label: "上年同比增长率", value: Ratio.LASTYEARINCRATE }
  ],
  // 年-月-日
  YMD: [
    { label: "环比增长值", value: Ratio.INCVALUE },
    { label: "环比增长率", value: Ratio.INCRATE },
    { label: "上年同比增长值", value: Ratio.LASTYEARINCVALUE },
    { label: "上年同比增长率", value: Ratio.LASTYEARINCRATE },
    { label: "上月同比增长值", value: Ratio.LASTMONTHINCVALUE },
    { label: "上月同比增长率", value: Ratio.LASTMONTHINCRATE },
    { label: "上周同比增长值", value: Ratio.LASTWEEKINCVALUE },
    { label: "上周同比增长率", value: Ratio.LASTWEEKINCRATE }
  ]
};
export default {
  // 年
  Y: [
    { label: "无", value: undefined },
    { label: "环比增长值", value: Ratio.INCVALUE },
    { label: "环比增长率", value: Ratio.INCRATE }
  ],
  // 年-季
  YQ: [
    { label: "无", value: undefined },
    { label: "环比增长值", value: Ratio.INCVALUE },
    { label: "环比增长率", value: Ratio.INCRATE },
    { label: "上年同比增长值", value: Ratio.LASTYEARINCVALUE },
    { label: "上年同比增长率", value: Ratio.LASTYEARINCRATE }
  ],
  // 年-月
  YM: [
    { label: "无", value: undefined },
    { label: "环比增长值", value: Ratio.INCVALUE },
    { label: "环比增长率", value: Ratio.INCRATE },
    { label: "上年同比增长值", value: Ratio.LASTYEARINCVALUE },
    { label: "上年同比增长率", value: Ratio.LASTYEARINCRATE }
  ],
  // 年-周
  YW: [
    { label: "无", value: undefined },
    { label: "环比增长值", value: Ratio.INCVALUE },
    { label: "环比增长率", value: Ratio.INCRATE },
    { label: "上年同比增长值", value: Ratio.LASTYEARINCVALUE },
    { label: "上年同比增长率", value: Ratio.LASTYEARINCRATE }
  ],
  // 年-月-日
  YMD: [
    { label: "无", value: undefined },
    { label: "环比增长值", value: Ratio.INCVALUE },
    { label: "环比增长率", value: Ratio.INCRATE },
    { label: "上年同比增长值", value: Ratio.LASTYEARINCVALUE },
    { label: "上年同比增长率", value: Ratio.LASTYEARINCRATE },
    { label: "上月同比增长值", value: Ratio.LASTMONTHINCVALUE },
    { label: "上月同比增长率", value: Ratio.LASTMONTHINCRATE },
    { label: "上周同比增长值", value: Ratio.LASTWEEKINCVALUE },
    { label: "上周同比增长率", value: Ratio.LASTWEEKINCRATE }
  ]
};
