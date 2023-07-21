import handleChartModules from './charts';
import LongTextModules from './long-text';
import FilterModules from './filter-picker';
import PicPlayModules from './pic-play';
import IframePlayModules from './iframe';
import VideoPlayModules from './video-play';
import { ElementType } from '@h3/report/basics/enum/chart-type';

export default (element : H3.Report.BaseElement, 
                oldChart ? : H3.Report.BaseElement) => {
  let chartModules;
  switch (element.type) {
    case ElementType.BAR:
    case ElementType.PILEBAR:
    case ElementType.STRIPE:
    case ElementType.LINE:
    case ElementType.AREA:
    case ElementType.PIE:
    case ElementType.FUNNEL:
    case ElementType.RADAR:
    case ElementType.TABLE:
    case ElementType.LIST:
    case ElementType.CARD:
    case ElementType.SCATTER:
    case ElementType.BIAX:
      chartModules = handleChartModules(element as H3.Report.Chart, oldChart as H3.Report.Chart);
      break;
    case ElementType.FILTERPICKER:
      chartModules = new FilterModules(element as H3.Report.FilterPicker);
      break;
    case ElementType.LONGTEXT:
      chartModules = new LongTextModules(element as H3.Report.LongText);
      break;
    //  NEW ADD
    case ElementType.PICPLAY:
      chartModules = new PicPlayModules(element as H3.Report.PicPlay);
      break;
    case ElementType.VIDEOPLAY:
      chartModules = new VideoPlayModules(element as H3.Report.VideoPlay);
      break;
    case ElementType.IFRAMEPLAY:
      chartModules = new IframePlayModules(element as H3.Report.IframePlay);
      break;
    default:
      break;
  }
  return chartModules as H3.ReportModules.ChartModules;
};
