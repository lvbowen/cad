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
    const schemaCode = item.associationCode;
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
      visible: item.visible,
      specialType: item.specialType || "",
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
