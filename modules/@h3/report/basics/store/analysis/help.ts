import { TabState } from "@h3/report/basics/enum/module-state";
import { createNewChart } from "../../instance/element-modules/analysis/create-chart";

/**
 * 处理返回数据
 * @param report
 */
export const handleAnalysisResponse = (report: H3.AnalysisAPI.reportInfo) => {
  const elements: Array<H3.Report.Chart> = [];
  const chartsInfo: { [key: string]: any } = {};
  if (report.charts && report.charts.length) {
    report.charts.forEach((chart: any) => {
      let element: H3.Report.Chart = chart.content;
      let chartInfo: H3.Analysis.ChartInfo = {};
      chartInfo = Object.assign(
        {
          updateDate: chart.updateDate,
          updateUser: chart.updateUser,
          updateUserName: chart.updateUserName
        },
        chart.ownerChartInfo ? chart.ownerChartInfo : {}
      );
      chartsInfo[element.uid] = chartInfo;
      element = createNewChart(element.type, element) as H3.Report.Chart;
      elements.push(element);
    });
  }

  console.log("chartsInfo", chartsInfo);

  return {
    objectId: report.objectId,
    elements,
    reqGlobal: report.global.trim(),
    share: report.shareStatus,
    chartsInfo
  };
};

let relationFields: Array<H3.Report.FieldColumn> = [];
let schemaCodes: Array<string> = [];
/**
 * 数据分组
 * @param schema 表数据
 * @param relationSchemas 关联表数据
 * @param tableName  显示表名称
 * @param relation  是否关联表
 */
const groupSchema = (
  schema: H3.ReportAPI.Schema,
  relationSchemas: Array<H3.ReportAPI.Schema>,
  tableName: string | null = null,
  relation = false
) => {
  const fields: Array<H3.Report.FieldColumn> = [];
  schemaCodes.push(schema.schemaCode);
  schema.properties.forEach((item: H3.ReportAPI.Properties) => {
    const schemaCode = item.associationCode || item.name;
    if (schemaCodes.includes(schemaCode)) return;
    const relationSchema = relationSchemas.find(
      (oRelation: H3.ReportAPI.Schema) => oRelation.schemaCode === schemaCode
    );
    if (relationSchema) {
      relationFields.push(...groupSchema(relationSchema, relationSchemas, item.displayName, true));
    }
    const field: H3.Report.FieldColumn = {
      uid: "",
      schemaCode: schema.schemaCode,
      tableName: tableName || schema.displayName,
      tableId: schema.tableName,
      field: item.name,
      name: item.displayName,
      dataType: item.dataType,
      specialType: item.specialType || "",
      visible: item.visible,
      type: item.type.toLocaleLowerCase(),
      alias: "",
      needAlias: item.needAlias,
      relation,
      options: {}
    };
    fields.push(field);
  });
  return fields;
};

/**
 * 处理数据
 * @param schemaModel 数据模型
 */
export const handleSchemaModal = (schemaModel: H3.ReportAPI.SchemaModel) => {
  relationFields = [];
  schemaCodes = [];
  let fields = groupSchema(schemaModel.schema, schemaModel.relationSchemas || []);
  relationFields.sort((prvField: H3.Report.FieldColumn, nextField: H3.Report.FieldColumn) =>
    prvField.tableName.localeCompare(nextField.tableName)
  );
  fields = fields.concat(relationFields);
  return fields;
};
/**
 * 处理过滤条件
 */
export function handleFilters(
  schemas: Array<H3.Report.FieldColumn>,
  filters: Array<H3.Yun.Filter>
): Array<H3.Report.FilterFieldColumn> {
  const globalFilters: Array<H3.Report.FilterFieldColumn> = [];
  let filterItem: H3.Report.FilterFieldColumn;
  filters.forEach((param: H3.Yun.Filter) => {
    const field = schemas.find(
      (schema: H3.Report.FieldColumn) =>
        schema.schemaCode === param.schemaCode && schema.field === param.field
    );
    if (field) {
      filterItem = {
        field: JSON.parse(JSON.stringify(field)),
        formula: param.formula,
        text: param.value
      };
      globalFilters.push(filterItem);
    }
  });
  return globalFilters;
}

/**
 * 处理图表字段同步数据源的字段默认值
 * @param elements
 * @param dataSources
 */
export function handleChartFieldDefaultValues(
  elements: H3.Report.Chart[],
  dataSources: { [dataSourceId: string]: H3.Report.DataSource }
) {
  elements.forEach((element: H3.Report.BaseElement) => {
    const chart = element as H3.Report.Chart;
    const chartData: H3.Report.ChartDataGroup = chart.data;
    const chartFields: H3.Report.FieldColumn[] = [];
    if (chart.dataSourceId && dataSources[chart.dataSourceId]) {
      const dataSourceFields: H3.Report.FieldColumn[] = dataSources[chart.dataSourceId].properties;
      if (chartData.dimension && chartData.dimension.length) {
        chartFields.push(...chartData.dimension);
      }
      if (chartData.groupDimension && chartData.groupDimension.length) {
        chartFields.push(...chartData.groupDimension);
      }
      if (chartData.metric && chartData.metric.length) {
        chartFields.push(...chartData.metric);
      }
      if (chartData.sort && chartData.sort.length) {
        chartFields.push(...chartData.sort);
      }
      if (chartData.metricGroup && chartData.metricGroup.length) {
        chartData.metricGroup.forEach((metric: H3.Report.FieldColumn[]) => {
          chartFields.push(...metric);
        });
      }
      if (chartData.filter && chartData.filter.length) {
        chartData.filter.forEach((filter: H3.Report.FilterFieldColumn) => {
          chartFields.push(filter.field);
        });
      }
      dataSourceFields.forEach((dataSourceField: H3.Report.FieldColumn) => {
        chartFields.forEach((chartField: H3.Report.FieldColumn, index: number) => {
          if (
            chartField.field === dataSourceField.field &&
            chartField.schemaCode === dataSourceField.schemaCode
          ) {
            Object.assign(chartField, dataSourceField, {
              uid: chartField.uid,
              alias: chartField.alias,
              options: chartField.options
            });
          }
        });
      });
    }
  });
}

/**
 * 获取完数据源之后处理全局筛选器
 * @param globalFilter
 * @param dataSources
 */
export function handleGlobalFilter(
  globalFilter: Array<H3.Report.FilterFieldColumn>,
  dataSources: H3.Report.DataSource
) {
  return globalFilter.filter(i => {
    return dataSources.properties.find(d => {
      return d.schemaCode === i.field.schemaCode && d.field === i.field.field;
    });
  });
}
