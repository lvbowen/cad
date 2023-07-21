// eslint-disable-next-line no-shadow
export enum ReportAction {
  ADDELEMENT = "addElement", // 新增图表
  GETREPORTDETAIL = "getReportDetail", // 获取仪表盘明细
  GETREPORT = "getReport", // 获取仪表盘
  SAVEREPORT = "saveReport", // 报错仪表盘
  GETDATASOURCELIST = "getDataSourceList", // 获取数据源列表
  GETDATASOURCE = "getDataSource", // 获取数据源
  LOADDATASOURCE = "loadDataSource", // 加载数据源
  LOADCHARTDATA = "loadChartData", // 加载仪表盘图表数据
  SETCHARTLINKAGE = "setChartLinkage", // 设置图表联动
  SETFILTERPICKER = "setFilterPicker", // 设置过滤器条件
  REMOVEFILTERPICKER = "removeFilterPicker" // 删除过滤器条件
}

// eslint-disable-next-line no-shadow
export enum ReportMutation {
  INITREPORT = "initReport", //初始化报表数据
  SETCHARTS = "setCharts", // 设置图表
  SETGLOBAL = "setGlobal", // 设置仪表盘全局配置
  SETOBJECTID = "setObjectId", // 设置objectId
  SETTITLE = "setTitle", // 设置title
  SETREPORTTOP = "setReportTop", // 设置仪表盘的通用TOP
  SETREPORTTITLE = "setReportTitle", // 设置仪表盘标题
  SETACTIVECHART = "setActiveChart", // 设置激活的图表
  CLEARACTIVECHART = "clearActiveChart", // 清空激活的图表
  SETGLOBALFILTER = "setGlobalFilter", // 设置全局筛选条件
  HANDLESORT = "handleSort", // 处理排序字段
  SETDRAGCHART = "setDragChart", // 设置新增的图表实例
  SETDRAGFIELD = "setDragField", // 设置拖动中的字段
  SETREPORTOPTIONS = "setReportOptions", // 设置报表配置项
  CLEARCHARTRELATION = "clearChartRelation", // 清空图表关系
  RESIZECHARTVIEW = "resizeChartView", // 刷新图表
  SETNUMBERFORMAT = "setNumberFormat", // 设置数据格式
  SETRESULTFILTER = "setResultFilter", // 设置结果筛选器
  SETDATEFORMAT = "setDateFormat", // 设置明细表日期字段格式化
  SETLASTDATASOURCE = "setLastDataSource", // 保存上一次数据源ID
  SETTABLEEXPORTDATA = "setTableExportData", // 保存透视表导出预处理数据
  DELETEMETRIC = "deleteMetric", // 删除指标
  SERINTROSTATE = "setIntroState", // 设置是否在新手新到
  SETCHARTSDATA = "setChartsData", // 设置图表数据
  SETADVANCEDATASOURCE = "setAdvancedDataSource" // 设置是否显示高级数据源
}
