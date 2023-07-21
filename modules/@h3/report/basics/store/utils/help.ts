import {ElementType} from '../../enum/chart-type';
import {createElementInstance} from "@h3/report/basics/instance/element/instance";
import ProChartModules from "@h3/report/basics/instance/element-modules/dashboard";

/**
 * 注册仪表盘元件
 *  主要是支持元件的数据升级
 * @param elementType
 * @param oldElement
 */
function registerElement(elementType: H3.Report.ElementType, oldElement?: H3.Report.BaseElement) : H3.Report.BaseElement{
  let newChart: H3.Report.Chart | H3.Report.FilterPicker | H3.Report.LongText| H3.Report.PicPlay| H3.Report.VideoPlay| H3.Report.IframePlay;
  // eslint-disable-next-line prefer-const
  newChart = createElementInstance(elementType, oldElement);
  ProChartModules(newChart as any, oldElement);
  return newChart;
}

/**
 * 处理报表请求
 * @param report
 */
function handleReportResponse(report: H3.DashboardAPI.ReportData) {
  const schemaCodes: any = {};
  const filterPickers : Array<H3.Report.FilterPicker> = [];
  const elements: Array<H3.Report.BaseElement> = [];

  report.charts.forEach((rChart: any) => {
    let element: H3.Report.BaseElement = JSON.parse(rChart.content);
    element = registerElement(element.type, element);
    elements.push(element);
    const chart = (element as H3.Report.Chart);
    if (chart.dataSourceId) {
      schemaCodes[chart.dataSourceId] = {
        dataSourceId: chart.dataSourceId,
        useType: chart.useType
      };
    } else if (element.type === ElementType.FILTERPICKER) {
      filterPickers.push(element as H3.Report.FilterPicker);
    }
  });
  return {
    title: report.title,
    objectId: report.objectId,
    elements,
    reqGlobal : report.global,
    schemaCodes,
    filterPickers
  }
}

/**
 * 处理图表字段同步数据源的字段默认值
 * @param elements
 * @param dataSources
 */
function handleChartFieldDefaultValues(elements: H3.Report.BaseElement[], dataSources:{ [dataSourceId: string]: H3.Report.DataSource }) {
  elements.forEach((element: H3.Report.BaseElement)=> {
    if(![ElementType.LONGTEXT, ElementType.PICPLAY,ElementType.VIDEOPLAY,ElementType.IFRAMEPLAY,ElementType.FILTERPICKER].includes(element.type)) {
      const chart = (element as H3.Report.Chart);
      const chartData: H3.Report.ChartDataGroup = chart.data;
      const chartFields: H3.Report.FieldColumn[] = [];
      if(chart.dataSourceId && dataSources[chart.dataSourceId]) {
        const dataSourceFields: H3.Report.FieldColumn[] = dataSources[chart.dataSourceId].properties;
        if(chartData.dimension && chartData.dimension.length) {
          chartFields.push(...chartData.dimension);
        }
        if(chartData.groupDimension && chartData.groupDimension.length) {
          chartFields.push(...chartData.groupDimension);
        }
        if(chartData.metric && chartData.metric.length) {
          chartFields.push(...chartData.metric);
        }
        if(chartData.sort && chartData.sort.length) {
          chartFields.push(...chartData.sort);
        }
        if(chartData.metricGroup && chartData.metricGroup.length) {
          chartData.metricGroup.forEach((metric: H3.Report.FieldColumn[]) => {
            chartFields.push(...metric);
          });
        }
        if(chartData.filter && chartData.filter.length) {
          chartData.filter.forEach((filter: H3.Report.FilterFieldColumn)=> {
            chartFields.push(filter.field);
          });
        }
        dataSourceFields.forEach((dataSourceField: H3.Report.FieldColumn)=> {
          chartFields.forEach((chartField: H3.Report.FieldColumn, index:number)=> {
            if(chartField.field === dataSourceField.field && chartField.schemaCode === dataSourceField.schemaCode) {
              Object.assign(chartField , dataSourceField, {
                uid: chartField.uid,
                alias: chartField.alias,
                options: chartField.options
              });
            }
          });
        });
      }
    }else if(element.type === ElementType.FILTERPICKER){
      const filter = (element as H3.Report.FilterPicker);
      if(filter.dataSources.length) {
        filter.dataSources.forEach((dataSource)=> {
          if(dataSource.dataSourceId && dataSources[dataSource.dataSourceId]) {
            const dataSourceFields: H3.Report.FieldColumn[] = dataSources[dataSource.dataSourceId].properties;
            dataSourceFields.forEach((dataSourceField: H3.Report.FieldColumn)=> {
              if(dataSource.field && dataSource.field.field === dataSourceField.field && dataSource.field.schemaCode === dataSourceField.schemaCode) {
                Object.assign(dataSource.field , dataSourceField, {
                  uid: dataSource.field.uid,
                  alias: dataSource.field.alias,
                  options: dataSource.field.options
                });
              }
              if(filter.field.field === dataSourceField.field && filter.field.schemaCode === dataSourceField.schemaCode) {
                Object.assign(filter.field , dataSourceField, {
                  uid: filter.field.uid,
                  alias: filter.field.alias,
                  options: filter.field.options
                });
              }
            });
          }
        });
      }
    }
  });
}

export {
  handleChartFieldDefaultValues,
  registerElement,
  handleReportResponse
}

export default {
  handleChartFieldDefaultValues,
  registerElement,
  handleReportResponse
}
