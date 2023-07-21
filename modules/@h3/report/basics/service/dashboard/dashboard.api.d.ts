declare namespace H3 {
  namespace DashboardAPI {
    /**
     * Schema数据模型
     */
    export interface SchemaModel {
      schema: Schema; // 主数据模型
      relationSchemas: Array<Schema> | null; // 子表或者关联表数据模型
    }
    /**
     * 数据源列表
     */
    export interface DataSourceNode {
      dataSourceId: string;
      displayName: string;
      nodeType: number; // 0 文件夹 1是节点
      useType?: H3.Report.ChartUseType;
      objectId: string;
      parentObjectId: string;
      corpId: string;
      status: number | null;
      // children?: Array<DataSourceNode>
    }
    /**
     * Schema
     */
    export interface Schema {
      dataSourceId: string; // 数据源Id
      schemaCode: string; // 模型Id
      displayName: string; // 显示名称
      tableName: string; // 表名称
      parentSchemaCode: string; // 夫模型Id
      properties: Array<Properties>; // 表字段集
      visible: boolean; // 是否展示
    }

    /**
     * 模型字段
     */
    export interface Properties {
      name: string; //名称
      visible: boolean; // 是否显示
      type: string; // 字段类型
      displayName: string; //显示名称
      dataType: number; // 数据类型
      needAlias: boolean; // 是否需要别名
      associationCode: string; // 关联SchemaCode
    }

    /**
     * 图表数据 todo注释
     */
    interface ReportData {
      attributes: string;
      charts: Array<ChartViewData>;
      corpId: string;
      global: string;
      objectId: string;
      title: string;
    }
    /**
     * 图表数据 todo注释
     */
    interface ChartViewData {
      content: string;
      corpId: string;
      objectId: string;
      uuid: string;
    }
    /**
     * 图表数据 todo注释
     */
    interface ChartRealData {
      alias?: { [key: string]: string };
      originDatas?: Array<{ [key: string]: any }>;
      series: any;
      tableHeaders?: Array<TableHeaders>;
      total?: number;
      source?: any;
    }
    /**
     * 表格头部数据 todo注释
     */
    interface TableHeaders {
      driveTable: boolean;
      id: string;
      name: string;
      parentId: string;
      tableHeaders: Array<TableHeaders>;
      total: number;
    }
  }
}
