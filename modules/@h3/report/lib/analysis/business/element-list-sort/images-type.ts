import { ElementType } from "@h3/report/basics/enum/chart-type";
const images: { [key in ElementType]: Function } = {
  [ElementType.BAR]: () => require("./images/optimize/bar.svg"),
  [ElementType.BIAX]: () => require("./images/optimize/biax.svg"),
  [ElementType.CARD]: () => require("./images/optimize/card.svg"),
  [ElementType.FUNNEL]: () => require("./images/optimize/funnel.svg"),
  [ElementType.LINE]: () => require("./images/optimize/line.svg"),
  [ElementType.PIE]: () => require("./images/optimize/pie.svg"),
  [ElementType.RADAR]: () => require("./images/optimize/radar.svg"),
  [ElementType.SCATTER]: () => require("./images/optimize/scatter.svg"),
  [ElementType.TABLE]: () => require("./images/optimize/table.svg"),
  [ElementType.MAP]: () => require("./images/optimize/map.svg"),
  [ElementType.PILEBAR]: () => {
    /** 堆叠柱状图 */
  },
  [ElementType.STRIPE]: () => {
    /** 条形图 */
  },
  [ElementType.AREA]: () => {
    /** 面积图 */
  },
  [ElementType.LIST]: () => {
    /** 明细表 */
  },
  [ElementType.LONGTEXT]: () => {
    /** 长文本 */
  },
  [ElementType.FILTERPICKER]: () => {
    /** 筛选器 */
  }
};

export default images;
