export enum ReportAction {
  GETREPORT = "getReport", // 获取报表信息，自动识别个人和公共
  GETPERSONALREPORT = "getPersonalReport", // 获取个人报表信息
  GETPUBLICREPORT = "getPublicReport", // 获取公共报表信息
  GETCHARTDATA = "getChartData", // 获取图表数据
  SAVECHARTS = "saveCharts", // 批量保存
  SAVECHART = "saveChart", // 保存图表
  REMOVECHART = "removeChart", // 删除图表
  LOADDATASOURCE = "loadDataSource", // 获取数据源
  ADDCHART = "addChart", // 新增图表
  UPDATECHART = "updateChart", // 更新图表
  GETOBJECTID = "getObjectId", // 获取ObjectId
  GETCHARTSLENGTH = "getChartsLength", // 获取图表长度
  SAVEOWNERCHART = "saveOwnerChart" // 保存图表偏好
}

export enum ReportMutation {
  SETANALYSISINFO = "setAnalysisInfo", // 设置统计分析配置信息
  SETACTIVETAB = "setActiveTab", // 设置统计分析激活的区域 个人/公共
  RESIZECHARTVIEW = "resizeChartView", // 刷新图表
  SETACTIVECHART = "setActiveChart", // 设置激活的图表
  DRAGCHARTS = "dragCharts", // 拖动图表排序
  RESETREPORT = "resetReport", // 重置的报表
  SETGLOBALFILTER = "setGlobalFilter", //设置全局筛选条件
  SETCHARTS = "setCharts", // 拖动图表排序
  RESETACTIVECHART = "reSetActiveChart", // 重置激活图表
  RESETGLOBALFILTER = "reSetGlobalFilter" // 重置全局筛选条件
}
