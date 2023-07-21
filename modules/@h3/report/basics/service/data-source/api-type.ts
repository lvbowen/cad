export enum DataSourceApis {
  GETDATASOURCENODES = 'getDataSourceNodes', // 获取数据源列表
  MOVEDATASOURCENODE = 'moveDataSourceNode',
  UPDATEDATASOURCENODESORT = 'updateDataSourceNodeSort',
  REMOVEDATASOURCENODE = 'removeDataSourceNode',
  UPDATEDATASOURCENAME = 'updateDataSourceName',
  ADDDATASOURCEGROUP = 'addDataSourceGroup',
  PREVIEWADVANCEDDATA = 'previewAdvancedData',
  GETMODELLIST = 'getModelList',
  GETMODELINFO = 'getModelInfo',
  GETDATASOURCENODEINFO = 'getDataSourceNodeInfo',
  SAVEDATASOURCESETTING = 'saveDataSourceSetting',
  GETSTAGEMODELINFO = 'getStageModelInfo',
  CHECKCOMPUTE = 'checkCompute'
}

export default DataSourceApis;
