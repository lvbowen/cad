import Axios from "axios";
import {HttpResponse} from "@cloudpivot/api/src/response";
import * as Type from '../type';
import {GanttClass} from "@ctesi/component";
import {ProjectLevel} from "../constant";
import * as ConfigType from "../businessComponent/systemConfig/type";
import {
  DesignPersonGroup,
  WorkOutlineContentItemRule,
  WorkOutlineModel,
  WorkOutlineSourceList
} from "../type";
import {AddDigitalDeliveryParam} from "../type";

//根据日期查询产值
export const getProgressPlanCalender: (params: Type.ProgressPlanOverview) => Promise<HttpResponse<Type.ProgressPlanOverviewRes>> = (params) => {
  return Axios.get('/api/schedule_log/query_amount', {params});
}

//日志接口
export const getProgressLogList: (params: Type.ProgressLogList) => Promise<HttpResponse<Type.ProgressLogListRes>> = (params) => {
  return Axios.get('/api/schedule_log/page_list', {params});
}

//新增日志
export const addProgressLogList: (params: Type.ProgressLogRes) => Promise<HttpResponse<Type.ProgressLogListRes>> = (params) => {
  return Axios.post('/api/schedule_log/add', params);
}

//更新日志
export const updateProgressLogList: (params: Type.ProgressLogRes) => Promise<HttpResponse<Type.ProgressLogListRes>> = (params) => {
  return Axios.post('/api/schedule_log/update', {params});
}

//批量更新日志
export const batchUpdateProgressLogList: (list: Array<Type.ProgressLogRes>, projectCode?: string) => Promise<HttpResponse<Type.ProgressLogListRes>> = (list, projectCode) => {
  return Axios.post('/api/schedule_log/refesh_list', {list: list, projectCode: projectCode})
}

//删除日志
export const deleteProgressLogList: (params: [{ id: string }], projectCode?: string) => Promise<HttpResponse<Type.ProgressLogListRes>> = (params, projectCode) => {
  return Axios.post('/api/schedule_log/deleteById', {params, projectCode: projectCode});
}

//批量删除日志
export const batchDeleteProgressLogList: (list: Array<string>, projectCode?: string) => Promise<HttpResponse<Type.ProgressLogListRes>> = (list, projectCode) => {
  return Axios.post('/api/schedule_log/del_list', {list: list, projectCode: projectCode});
}

//合同接口
export const getContractList: (params: any) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/schedule_contract/list', {params});
}

//工作明细接口
export const getWorkDetailOld: (params: { id: string, projectCode?: string }) => Promise<HttpResponse<Array<Type.WBSreport>>> = (params) => {
  return Axios.get('/api/schedule_report_wbs/list', {params});
}
//工作明细接口含WBS
export const getWorkDetail: (params: { id: string, projectCode?: string }) => Promise<HttpResponse<Array<Type.WBSreport>>> = (params) => {
  return Axios.get('/api/schedule_report_wbs/list_ext', {params});
}

//工作明细更细
export const batchUpdateWorkDetail: (list: Array<Type.WBSreport>, projectCode?: string) => Promise<HttpResponse<Array<Type.WBSreport>>> = (list, projectCode) => {
  return Axios.post('/api/schedule_report_wbs/refesh_list', {
    list: list,
    projectCode: projectCode
  });
}

//工作明细删除
export const batchDeleteWorkDetail: (list: Array<string>, projectCode?: string) => Promise<HttpResponse<Array<Type.WBSreport>>> = (list, projectCode) => {
  return Axios.post('/api/schedule_report_wbs/del_list', {
    list: list,
    projectCode: projectCode
  });
}

//WBS查询MBS
export const getWBSndMBS: (params: Type.MbsReq) => Promise<HttpResponse<Type.PageTableRes<Type.WBSconnectMBS>>> = (params) => {
  return Axios.get('/api/schedule_report_mbs/mbs_page_list', {params});
}

//WBSMBS更新
export const updateWBSndMBS: (params: Array<Type.WBSconnectMBS>, projectCode?: string) => Promise<HttpResponse<Type.WBSconnectMBS>> = (params, projectCode) => {
  return Axios.post('/api/schedule_report_mbs/refesh_list', {
    list: params,
    projectCode: projectCode
  });
}

//MBS查询构建
export const getMBSBuild: (params: { id: string, projectCode?: string }) => Promise<HttpResponse<Array<Type.MBSBuild>>> = (params) => {
  return Axios.get('/api/schedule_report_mbs/list', {params});
}

//MBS构建更新
export const updateMBSBuild: (list: Array<Type.MBSBuild>, projectCode?: string) => Promise<HttpResponse<Type.MBSBuild>> = (list, projectCode) => {
  return Axios.post('/api/schedule_report_mbs/refesh_list', {
    list: list,
    projectCode: projectCode
  });
}

//MBS批量删除
export const batchDeleteMBSBuild: (list: Array<string>, projectCode?: string) => Promise<HttpResponse<Type.MBSBuild>> = (list, projectCode) => {
  return Axios.post('/api/schedule_report_mbs/del_list', {
    list: list,
    projectCode: projectCode
  });
}

//查询WBS列表
export const getWBSTree: (params: { id: string, projectCode?: string }) => Promise<HttpResponse<Array<Type.WBSreport>>> = (params) => Axios.get('/api/schedule_report_wbs/tree_list', {params})


//获取qbs树
export const getSimplifiedTree: (params: { appCode?: string, projectName?: string }) => Promise<HttpResponse<Array<GanttClass.GanttTask<Type.WBSNdMBS>>>> = (params) => {
  return Axios.get('/api/quality/v2/qbs/simplifiedTree', {params});
}
//只查顶级
export const getWBSTop: (params: { id: string, projectCode?: string }) => Promise<HttpResponse<Array<Type.WBSreport>>> = (params) => {
  return Axios.get('/api/schedule_report_wbs/tree_top_list', {params});
}
//只查顶级
export const getMBSTop: (params: { projectCode?: string }) => Promise<HttpResponse<Array<GanttClass.GanttTask<Type.WBSNdMBS>>>> = (params) => {
  return Axios.get('/api/code_mbs/top_mbs_tree_list', {params});
}

//只查子级
export const getWBSChild: (params: { id: string, projectCode?: string }) => Promise<HttpResponse<Array<Type.WBSreport>>> = (params) => {
  return Axios.get('/api/schedule_report_wbs/tree_child_list', {params});
}

//只查子级(MBS)
export const getMBSChild: (params: { id: string, projectCode?: string }) => Promise<HttpResponse<Array<Type.WBSreport>>> = (params) => {
  return Axios.get('/api/code_mbs/child_mbs_tree_list', {params});
}

//根据ID查最底层
export const getWBSBottom: (params: { id: string, projectCode?: string }) => Promise<HttpResponse<Array<Type.WBSreport>>> = (params) => {
  return Axios.get('/api/schedule_report_wbs/tree_bottom_list', {params});
}

//根据ID查最底层(MBS)
export const getMBSBottom: (params: { currentId: string, projectCode?: string }) => Promise<HttpResponse<Array<GanttClass.GanttTask<Type.WBSNdMBS>>>> = (params) => {
  return Axios.get('/api/code_mbs/getLeafs', {params});
}


//search user's contract
export const getContractByUser: (params: Type.TableReqConfig) => Promise<HttpResponse<Type.TableRes<Array<Type.ContractModel>>>> = (params) => {
  return Axios.get('/api/schedule_contract/list', {params});
}


//standardPrint
export const getStandardTemplate: (params: { schemaCode: string }) => Promise<HttpResponse<Type.SchemaCodeTemplate>> = (params) => {
  return Axios.get('/api/standardPrint/getModel', {params});
}

//打印预览
export const getPrintView: (params: { schemaCode: string, id: string }) => Promise<HttpResponse<Type.SchemaCodeTemplate>> = (params) => {
  return Axios.get('/api/standardPrint/printView', {params});
}

//获取项目配置
export const getProjectConfig: (params: { path: string }) => Promise<HttpResponse<Type.ThemeConfig>> = (params) => {
  return Axios.get('/api/iconManage/getSystemConfig', {params});
}

//检验ProjectCode是否合法
export const verifyProjectCode: (params: { projectCode: string }) => Promise<HttpResponse<unknown>> = (params) => {
  return Axios.get('/api/iconManage/checkProjectCode', {params});
}

//get RichText
export const getArticleDetail: (params: Type.ArticleDetailQuery) => Promise<HttpResponse<Type.ArticleDetailResult>> = params => {
  return Axios.get('/api/portal/getTabDataDoc', {params})
}

//set RichText
export const setArticleDetail: (params: Type.ArticleDetailUpdate) => Promise<HttpResponse<Type.ArticleDetailResult>> = params => {
  return Axios.put('/api/portal/updateTabDataDoc', {...params});
}

//get VideoConfig
export const getVideoConfig: (params: Type.VideoConfigQuery) => Promise<HttpResponse<Array<Type.VideoConfigResult>>> = params => {
  return Axios.get('/bim/device/listDevice', {params});
}

//get BIMProject
export const getBIMProject: (params: Type.BIMProjectQuery) => Promise<HttpResponse<Array<Type.BIMProjectResult>>> = params => {
  return Axios.get('/api/groupView/bimTree', {params})
}
//get rdpReport
export const getBimViewRdpReport: (params: Type.RdpReportQuery) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/report/getBimViewRdpReport', {params})
}


export const filterBimTreeFilter: (params: Type.BimTreeFilterQuery) => Promise<HttpResponse<Array<Type.BIMProjectResult>>> = params => {
  return Axios.post('/api/groupView/bimTreeFilter', params)
}

/* schedulePlan */
//添加WBS数据
export const addSchedulePlanDetail: (params: Type.WBSNdMBS) => Promise<HttpResponse<unknown>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/addPredecessorTask', params);
}

//添加WBS前置任务
export const addPreTask: (params: Type.AddPredecessorTask) => Promise<HttpResponse<unknown>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/addPredecessorTask', params);
}

//删除WBS前置任务
export const deletePreTask: (params: Type.SchedulePlanChildListQuery) => Promise<HttpResponse<unknown>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/deletePredecessorTask', params);
}

//直接计算
export const directSum: (params: Type.DirectSum) => Promise<HttpResponse<unknown>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/directSumPlan', params);
}

//查询WBS或MBS ById
export const queryById: (params: Type.SchedulePlanChildListQuery) => Promise<HttpResponse<Type.WBSNdMBS | Array<Type.WBSNdMBS>>> = params => {
  return Axios.get('/api/schedulePlanDetailV2/queryById', {params});
}

//添加WBS与MBS的关联数据
export const refreshMBSList: (params: {
  list: Array<Type.WBSNdMBS>
}) => Promise<HttpResponse<unknown>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/refreshMBSList', params);
}

//批量增加修改删除WBS
export const refreshWBSList: (params: Type.BatchOptionWBS) => Promise<HttpResponse<unknown>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/refreshWBSList', params);
}

//批量增加修改删除WBSV2
export const refreshWBSList2: (params: Type.BatchOptionWBS) => Promise<HttpResponse<unknown>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/refreshWBSList2', params);
}

//批量增加修改删除WBSV3
export const refreshWBSListV3: (params: Type.BatchOptionWBSV3) => Promise<HttpResponse<unknown>> = params => {
  return Axios.post('/api/schedulePlanDetailV3/refreshBSList', params);
}

//获取非WBS节点的叶子节点数据
export const noWBSLeafList: (params: Type.NoWBSLeafListData) => Promise<HttpResponse<unknown>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/noWBSLeafList', params);
}

//获取进度明细计划下一层级
export const getTreeChildList: (params: Type.SchedulePlanChildListQuery) => Promise<HttpResponse<Array<Type.WBSNdMBS>>> = params => {
  return Axios.get('/api/schedulePlanDetailV2/treeChildList', {params});
}

//获取所有WBS树及MBS树
export const getTreeList: (params: Partial<Type.WBSNdMBSGet>) => Promise<HttpResponse<Array<Type.WBSNdMBS>>> = params => {
  return Axios.get('/api/schedulePlanDetailV2/treeList', {params});
}

//获取进度计划列表
export const getSchedulePlanDetailList: (params: Partial<Type.WBSNdMBSGet>) => Promise<Type.HttpRes<Array<Type.WBSNdMBS>>> = params => {
  return Axios.get('/api/schedulePlanDetailV2/schedulePlanDetailList', {params});
}

//获取所有WBS树及MBS树V3
export const getTreeListV3: (params: Partial<Type.WBSNdMBSGet>) => Promise<HttpResponse<Array<Type.WBSNdMBS>>> = params => {
  return Axios.get('/api/schedulePlanDetailV3/treeList', {params});
}

//修改WBS数据或MBS
export const updateTree: (params: Type.WBSNdMBS) => Promise<HttpResponse<Type.PlanState>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/update', params);
}

//修改WBS前置任务
export const updatePredecessorTask: (params: Type.WBSPredecessorTask) => Promise<HttpResponse<Type.PlanState>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/updatePredecessorTask', params);
}

//新增施工总进度计划
export const addSchedulePlan: (params: Type.SchedulePlan) => Promise<HttpResponse<Type.PlanState>> = params => {
  return Axios.post('/api/schedulePlanV2/add', params);
}

//删除施工总进度计划
export const deleteSchedulePlan: (params: Type.PlanState) => Promise<HttpResponse<Type.PlanState>> = params => {
  return Axios.post('/api/schedulePlanV2/deleteById', params);
}

//施工总进度计划分页
export const getScheduleList: (params: Type.SchedulePageQuery) => Promise<HttpResponse<Array<Type.SchedulePlan>>> = params => {
  return Axios.get('/api/schedulePlanV2/list', {params});
}

//施工总进度计划详情 ById
export const getSchedulePlanById: (params: Type.PlanState) => Promise<HttpResponse<Type.SchedulePlan>> = params => {
  return Axios.get('/api/schedulePlanV2/queryById', {params});
}

//根据进度ID查询进度计划年区间
export const getYearsById: (params: Type.PlanState) => Promise<HttpResponse<Array<string>>> = params => {
  return Axios.get('/api/schedulePlanV2/queryYearsById', {params});
}

//切换计划状态
export const switchScheduleState: (params: Type.PlanState) => Promise<HttpResponse<Type.PlanState>> = params => {
  return Axios.post('/api/schedulePlanV2/switch', params);
}

//修改施工总进度计划
export const updateSchedulePlan: (params: Type.SchedulePlan) => Promise<HttpResponse<Type.SchedulePlan>> = params => {
  return Axios.post('/api/schedulePlanV2/update', params);
}

//施工总进度计划发起流程
export const launchSchedulePlanProcess: (params: Type.PlanState) => Promise<HttpResponse<Type.PlanState>> = params => {
  return Axios.post('/api/schedulePlanV2/startWorkFlow', params);
}

//施工进度计划分页查询
export const schedulePlanListQuery: (params: {
  projectCode: string;
  pageNum: number;
  pageSize: number;
  projectName?: string;
  planSchemeName?: string;
  schemeState?: string;
}) => Promise<HttpResponse<Type.SchedulePlanListResult>> = params => {
  return Axios.get('/api/schedulePlanV2/list', {params});
}

//施工进度计划切换
export const schedulePlanSwitch: (params: {
  projectCode: string;
  schedulePlanId: string;
}) => Promise<HttpResponse<Type.SchedulePlan>> = params => {
  return Axios.post('/api/schedulePlanV2/switch', params);
}

//获取ProjectName
export const getProjectName: (params: { projectCode: string }) => Promise<HttpResponse<Array<string>>> = params => {
  return Axios.get('/api/schedulePlanV2/getProjectName', {params});
}

//获取进度日志ById
export const getLogById: (params: {
  projectCode: string;
  id: string;
}) => Promise<HttpResponse<Type.LogResult>> = params => {
  return Axios.get('/api/scheduleLogV2/queryById', {params});
}

//进度计划变更
export const changeWBSPlan: (params: {
  projectCode: string;
  schedulePlanId: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/schedulePlanV2/changeSchedulePlan', {params});
}

//更新进度日志
export const updateLogById: (params: {
  id?: string;
  projectCode: string;
  journalTitle: string;
  projectName: string;
  scheduleDate: string;
  remark: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/scheduleLogV2/update', params);
}

//获取进度日志的树
export const getLogWBSTree: (params: {
  projectName: string;
  scheduleLogId?: string;
  projectCode?: string
}) => Promise<HttpResponse<Array<Type.WBSTreeDataResult>>> = params => {
  return Axios.get('/api/scheduleReportBSV2/treeList', {params});
}

//更新进度填报BS
export const updateLogWBS: (params: {
  projectCode: string;
  list: Array<any>;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/scheduleReportBSV2/refreshList', params);
}

//进度计划日历金额
export const getListPlanAmount: (params: {
  projectCode: string;
  projectName: string;
  startDate: string;
  endDate: string;
  workMonth: string;
}) => Promise<HttpResponse<Type.ProgressPlanOverviewRes>> = params => {
  return Axios.get('/api/scheduleLogV2/queryAmount', {params});
}

//进度日志查询V2
export const getLogQuery: (params: {
  projectCode: string;
  scheduleDate: string | undefined;
  projectName: string;
  pageSize: number;
  pageNum: number;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/scheduleLogV2/pageList', {params});
}

//进度日志查询V2.0
export const getLogQueryV2: (params: {
  projectCode: string;
  projectName: string;
  pageSize: number;
  pageNum: number;
  queryStartDate: string;
  queryEndDate: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.ProgressLogV2>>>> = params => {
  return Axios.get('/api/scheduleLogV2/pageLogPC', {params});
}

//进度填报工作明细V2.0
export const getFillWorkDetailV2: (params: {
  projectCode: string;
  pageNum: number;
  pageSize: number;
  id: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.WBSTreeV2>>>> = params => {
  return Axios.get('/api/scheduleReportBSV2/pageReportBSByLogId', {params});
}

//进度日志删除
export const deletePlanLog: (params: {
  projectCode: string;
  idList: Array<string>;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/scheduleLogV2/delete', params);
}

//进度日志删除V2.0
export const deleteProgressLog: (params: {
  idList: Array<string>;
  projectCode: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/scheduleLogV2/deleteByIdList', params);
}

//根据进度日志ID查询BS
export const getBSListQuery: (params: {
  projectCode: string;
  id: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/scheduleReportBSV2/listExt', {params});
}

//WBS导入
export const importWBSData: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/schedulePlanDetailV2/upload_bs_file', params, fileHeader);
}

//WBS导入
export const importWBSDataV3: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/schedulePlanDetailV3/uploadSchedulePlanDetailFile', params, fileHeader);
}
//获取下载二维码链接
export const getQrCode: (params: {
  appCode: string;
  appType: string;
}) => Promise<HttpResponse<unknown>> = params => {
  return Axios.get('/api/mobile/package/getDownloadUrl', {params});
}

//WBS导出
export const exportWBSData: (params: {
  projectName: string;
  projectCode: string;
  schedulePlanId: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/download_bs_file', params);
}

//WBS导出
export const exportWBSDataV3: (params: {
  projectName: string;
  projectCode: string;
  schedulePlanId: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/schedulePlanDetailV3/downloadSchedulePlanDetailFile', params);
}

//进度填报上传
export const importReportBSData: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/scheduleReportBSV2/upload_reportbs_file', params, fileHeader);
}

//进度填报模版下载v2
export const downloadBSDataTemplateV2: () => Promise<HttpResponse<string>> = () => {
  return Axios.post('/api/scheduleReportBSV2/download_reportbs_templet_v2');
}
//进度填报模版下载v2
export const downloadBSDataTemplateV3: () => Promise<HttpResponse<string>> = () => {
  return Axios.post('/api/scheduleReportBSV3/download_reportbs_templet_v3');
}

//进度填报文件下载v2
export const downloadBSDataFileV2: (params: {
  projectCode: string;
  projectName: string;
  queryEndDate: string;
  queryStartDate: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/scheduleReportBSV2/download_reportbs_file_v2', params);
}

//进度填报文件下载v2
export const downloadBSDataFileV3: (params: {
  projectCode: string;
  projectName: string;
  queryEndDate: string;
  queryStartDate: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/scheduleReportBSV3/download_reportbs_file_v3', params);
}

//进度日志上传
export const importReportBSData2: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/scheduleReportBSV2/upload_reportbs_file_v2', params, fileHeader);
}

//进度日志上传
export const importReportBSData3: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/scheduleReportBSV3/upload_reportbs_file_v3', params, fileHeader);
}

//获取前置任务
export const getPreTasks: (params: {
  projectCode: string;
  planDetailId: string
}) => Promise<HttpResponse<Array<Type.PreTask>>> = params => {
  return Axios.get('/api/schedulePlanDetailV2/queryPredecessorTask', {params});
}

//新增前置任务
export const addPreTasks: (params: Array<Type.PreTask>) => Promise<HttpResponse<Type.PreTask>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/addPredecessorTask', params);
}

//修改前置任务
export const updatePreTasks: (params: Array<Type.PreTask>) => Promise<HttpResponse<Type.PreTask>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/updatePredecessorTask', params);
}

//删除前置任务
export const deletePreTasks: (params: Array<Type.PreTask>) => Promise<HttpResponse<Type.PreTask>> = params => {
  return Axios.post('/api/schedulePlanDetailV2/deletePredecessorTask', params);
}

//进度填报 lazyLoad
export const getLazyTreeNode: (params: {
  projectCode: string;
  scheduleLogId?: string;
  projectName?: string;
  id?: string;
}) => Promise<HttpResponse<Array<Type.WBSTreeDataResult>>> = params => {
  return Axios.get('/api/scheduleReportBSV2/treeChildList', {params});
}

//进度填报 查询所有子节点
export const getAllChild: (params: {
  projectCode?: string;
  scheduleLogId?: string;
  projectName?: string;
  id?: string;
  pageSize?: number;
  pageNum?: number;
}) => Promise<HttpResponse<Type.WBSTreeTableResult<Type.WBSTreeDataResult>>> = params => {
  //return Axios.get('/api/scheduleReportBSV2/pageLeafList',{params});
  return Axios.get('/api/scheduleReportBSV2/pageChildList', {params});
}

//进度计划 模板下载
export const getProgressBSTemplate: () => Promise<HttpResponse<string>> = () => {
  return Axios.post('/api/schedulePlanDetailV2/download_bs_templet');
}

//进度计划 模板下载
export const getProgressBSTemplateV3: () => Promise<HttpResponse<string>> = () => {
  return Axios.post('/api/schedulePlanDetailV3/downloadSchedulePlanDetailTemplet');
}

//进度填报 模板下载
export const getProgressFillTemplate: () => Promise<HttpResponse<string>> = () => {
  return Axios.post('/api/scheduleReportBSV2/download_reportbs_templet');
}

//报表 ———— ConfigValue
export const getReportConfigValue: (params: {
  code: string;
}) => Promise<HttpResponse<Type.ReportConfigValue>> = params => {
  return Axios.get('/api/report/frontget', {params});
}

//报表 ———— Config
export const getReportConfig: (params: {
  corpId: string;
  objectId: string;
  config: {
    token: string;
    reportCode: string;
    appCode: string
  }
}) => Promise<HttpResponse<Type.ChartConfigResult>> = params => {
  return Axios.post('/dashboard/v1/report/config', params);
}

//报表 ———— DataSource
export const getDataSource: (params: {
  dataSourceInfos: Array<{
    dataSourceId: string;
    useType: number;
  }>;
  corpId: string;
  config: {
    token: string;
    reportCode: string;
    appCode: string
  }
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/dashboard/v1/report/v2/datasource', params);
}

//报表 ———— ChartData
export const getChartData: (params: {
  chart: Type.ChartConfigRequest;
  dataSourceId: string;
  corpId: string;
  config: {
    token: string;
    reportCode: string;
    appCode: string
  }
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/dashboard/v1/report/v3/chartData', params);
}

/* quality */
export const queryQualityTable: (params: {
  appCode: string;
  projectName: string;
  name?: string;
  // nodeId?: string;
  qbsId?: string;
  level: number;
}) => Promise<HttpResponse<Array<Type.QualityTable>>> = params => {
  return Axios.get('/api/quality/v2/qbs/treeList', {params});
}

export const queryQualityBizSheetList: (params: {
  appCode: string;
  projectName: string;
  mbsCode: string;
  qbsId: string;
  type: string;
  qbsCode?: string;
  name?: string;
  hasMbs?: boolean;
  currentPage?: number;
  pageNum?: number;
  level?: number;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.QualityQBS>>>> = params => {
  return Axios.get('/api/quality/v2/qbs/bizsheet/bind', {params});
}

export const queryQualityBizSheetListV2: (params: {
  qbsId: string;
  jbsId: string;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.QualityQBS>>>> = params => {
  return Axios.get('/api/quality/v2/qbs/bizsheet/bind', {params});
}

export const batchBindOptBizSheet: (params: {
  appCode: string;
  projectName: string;
  qbsNodeId: string;
  type: string;
  addNodes: Array<Type.bindBizSheetDTO>
  delNodes?: Array<{ id: string }>
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/quality/v2/qbs/bizsheet/edit', params);
}

export const qbsImportPart: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/quality/v2/qbs/excel/import/part', params, fileHeader);
}

export const qbsTemplateImportPart: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/quality/v2/qbs/excel/importTemplate/part', params, fileHeader);
}

export const qbsImportGlobal: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/quality/v2/qbs/excel/import/total', params, fileHeader);
}

export const qbsTemplateImportGlobal: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/quality/v2/qbs/excel/importTemplate/total', params, fileHeader);
}


export const qbsOneKeyImport: (params: FormData) => Promise<HttpResponse<any>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/quality/v2/qbs/import/mbs', params, fileHeader);
}

export const queryUnbindQBSTree: (params: {
  appCode: string,
  projectName: string,
  level: number,
  qbsNodeId: string,
  type: string,
  mbsNodeId?: string,
  name?: string
}) => Promise<HttpResponse<Array<Type.QualityTable>>> = params => {
  return Axios.get('/api/quality/v2/qbs/mbs/unbind', {params});
}

export const queryAllQualitySheet: (params: {
  appCode: string;
  projectName: string;
  qbsId: string;
  type: string;
  hasMbs: boolean;
  qbsCode?: string;
  name?: string;
  currentPage?: number;
  pageNum?: number;
  mbsCode?: string;
  level?: number;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.QualityQBS>>>> = params => {
  return Axios.get('/api/quality/v2/qbs/bizsheet/bind', {params});
}

export const queryAllQualitySheetUnbind: (params: {
  appCode: string;
  projectName: string;
  qbsCode?: string;
  qbsId: string;
  type: string;
  level?: number;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.QualityQBS>>>> = params => {
  return Axios.get('/api/quality/v2/qbs/bizsheet/unbind', {params});
}

export const getModuleConfig: (params: {
  appCode: string;
  projectName: string;
  moduleCode: string;
}) => Promise<HttpResponse<boolean>> = params => {
  return Axios.get('/api/moduleConfig/get', {params});
}

//添加QBS节点
export const addQBSNode: (params: {
  name: string,
  appCode: string,
  projectName: string,
  parentName: string,
  parentId: string,
  qbsCode: string,
  level: number,
  parentLevel: number,
  parentQbsCode: string,
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/quality/v2/qbs/add', params);
}

//删除QBS节点
export const removeQBSNode: (params: {
  appCode: string;
  projectName: string;
  nodeId: string;
  type: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.delete('/api/quality/v2/qbs/delete', {params})
}

//添加MBS节点
export const batchOptMBSNode: (params: {
  appCode: string,
  projectName: string,
  level: number,
  qbsNodeId: string,
  type: string,
  addNodes: Array<Type.MbsDTO>,
  delNodes: Array<Type.MbsDTO>
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/quality/v2/qbs/mbs/edit', params);
}

//一键导入
export const setOneKeyImport: (params: {
  appCode: string;
  projectName: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.put('/api/quality/v2/qbs/import/mbs', params)
}
//质量树导入确认
export const QBSTreeImportConfirm: (params: {
  appCode: string,
  projectName: string,
  nodes: Type.QualityTable[],
  parentQbsCode?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/quality/v2/qbs/excel/import/confirm', params);
}
//qbs树操作日志
export const QBSLog: (params: {
  appCode: string,
  projectName: string,
  type?: string,
  keyWord?: string,
  startTime?: string,
  endTime?: string,
  pageNum: number,
  pageSize: number,
  timeAscFlag?: boolean
}) => Promise<HttpResponse<Type.QBSLog>> = params => {
  return Axios.get('/api/quality/v2/qbs/log', {params});
}
export const deleteQBSLog: (params: {
  ids: string[]
}) => Promise<HttpResponse<string>> = params => {
  return Axios.put('/api/quality/v2/qbs/log', params);
}

//jbs
export const queryJBSTree: (params: {
  /*excludeJbsCodes:Array<string>,*/
  //查树自身关系用nodeId
  nodeId?: string,
  qbsId?: string,
  appCode?: string,
  /*//查工序关系用jbsCode
  jbsCode?:string,*/
  name?: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/quality/v2/jbs/node', {params});
}


export const optJBSTree: (params: {
  bizSchemaCodes?: Array<string>,
  id?: string,
  jbsCode: string,
  name: string,
  opreateType: string,
  parentId: string,
  parentJbsCode: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.put('/api/quality/v2/jbs/edit', params);
}

export const queryBizJBSTree: (params: {
  nodeId?: string;
  name?: string;
}) => Promise<HttpResponse<Array<Type.JBSBizDTO>>> = params => {
  return Axios.get('/api/quality/v2/jbs/node', {params});
}

export const getJBSBiz: (params: {
  schemaCode?: string;
  jbsCode?: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/quality/v2/jbs/biz', {params});
}

export const getStructureOptions: (params: {
  nodeId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/quality/v2/jbs/node', {params})
}

export const updateQBSNodeInfo: (params: {
  appCode: string;
  jbsCode: string;
  name: string;
  nodeId: string;
  projectName: string;
  type: 'MBS' | 'QBS';
}) => Promise<HttpResponse<void>> = params => {
  return Axios.put('/api/quality/v2/qbs/edit', params);
}

export const getWorkFlowFormDetailUrl: (params: {
  bizObjectId: string;
  schemaCode: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.get('/api/runtime/form/get_form_url', {params});
}

/*------------  进度填报V2  ------------*/
export const getWBSTreeV2: (params: {
  projectCode: string;
  projectName: string;
  wbsIds?: Array<string>;
  wbsMbsIds?: Array<string>;
  parentId?: string;
  reportState?: number;
  planDetailName?: string;
  userId?: string;
}) => Promise<HttpResponse<Array<Type.WBSTreeV2>>> = params => {
  /* treeListWBS */
  return Axios.post('/api/scheduleReportBSV2/modelTreeListWBS ', params);
}

export const getWBSTreeV3: (params: {
  projectCode: string;
  projectName: string;
  wbsIds?: Array<string>;
  wbsMbsIds?: Array<string>;
  parentId?: string;
  reportState?: number;
  planDetailName?: string;
  userId?: string;
}) => Promise<HttpResponse<Array<Type.WBSTreeV2>>> = params => {
  /* treeListWBS */
  return Axios.get('/api/scheduleReportBSV2/treeListWBS', {params});
}

export const getFillDetailV2: (params: {
  projectCode: string;
  projectName: string;
  wbsIds?: Array<string>;
  wbsMbsIds?: Array<string>;
  parentId?: string;
  reportState?: number;
  planDetailName?: string;
  userId?: string;
}) => Promise<HttpResponse<Array<Type.WBSTreeV2>>> = params => {
  /* leafList */
  return Axios.post('/api/scheduleReportBSV2/modelLeafList', params);
}

export const getFillDetailV3: (params: {
  projectCode: string;
  projectName: string;
  wbsIds?: Array<string>;
  wbsMbsIds?: Array<string>;
  parentId?: string;
  reportState?: number;
  planDetailName?: string;
  userId?: string;
}) => Promise<HttpResponse<Array<Type.WBSTreeV2>>> = params => {
  /* leafList */
  return Axios.get('/api/scheduleReportBSV2/leafList', {params});
}

export const deleteFillDetailV2: (params: {
  idList: Array<string>;
  projectCode: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/scheduleReportBSV2/deleteList', params);
}

export const getPercentConfig: (params: {
  projectCode: string;
  projectName: string;
}) => Promise<HttpResponse<Array<number>>> = params => {
  return Axios.get('/api/scheduleReportBSV2/getReportRatio', {params})
}

export const getFillDetailWithIDs: (params: {
  projectCode: string;
  id: string;
}) => Promise<HttpResponse<Type.WBSTreeV2>> = params => {
  return Axios.get('/api/scheduleReportBSV2/getReportInfo', {params});
}

export const submitFillDetail: (params: {
  idList: Array<string>;
  projectCode: string;
  ratio: number;
  reportDate: string;
  reportBsId?: string;
  scheduleReportMbsCmdList?: Array<any>;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/scheduleReportBSV2/addList', params);
}

export const updateFillDetail: (params: {
  idList: Array<string>;
  projectCode: string;
  ratio: number;
  reportDate?: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.put('/api/scheduleReportBSV2/updateList', params);
}

export const getMultipleFillDetail: (params: {
  idList: Array<string>;
  projectCode: string;
  ratio?: number;
}) => Promise<HttpResponse<Type.WBSTreeV2>> = params => {
  return Axios.post('/api/scheduleReportBSV2/getMultipleReportDetail', params);
}

export const getRecordWithId: (params: {
  projectCode: string;
  id: string;
}) => Promise<HttpResponse<Array<Type.WBSRecordV2>>> = params => {
  return Axios.get('/api/scheduleReportBSV2/getReportInfo', {params});
}

export const getPageOrigin: (params: {
  reportCode: string;
  appCode?: string;
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/define/function/getPageOrigin', {params});
}

export const getBimTabsWithReport: (params: {
  projectName: string;
  projectId: string;
  appCode: string;
  parentId: string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/bim/tab/getBimTabsWithReport', {params});
}

export const getBoatFence: (params: {
  projectName: string;
  appCode: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/bim/boat/getBoatFence', {params});
}

export const listAllDevice: (params: {
  projectId: string;
  appCode: string;
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/bim/device/listAllDevice', {params});
}

//根据表格数据获取BIM-MBS
export const getSelectedModel: (params: {
  appCode: string;
  idList: Array<any>;
  projectName: string;
  tabName: string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.post('/bim/data/getSelectedModel', params);
}

export const getBimModelDataV2: (params: {
  dataList?: Array<any>;
  detailId: string;
  projectCode: string;
  projectName: string;
  select: string;
  selectedState?: string;
  stateCode: string;
  tabName: string;
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.post('/bim/data/getBimModelDataV2', params);
}

export const getBimModelData: (params: {
  dataList: Array<any>;
  projectCode: string;
  projectName: string;
  select: string;
  selectedState?: string;
  stateCode: string;
  tabName: string;
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.post('/bim/data/getBimModelData', params);
}

export const RDPView: (params: {
  reportCode: string;
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/standardPrint/page/view', {params});
}

export const deviceDetail: (params: { currentLevel: ProjectLevel | string; current: number; size: number; appCode: string | undefined; id: any; currentProjectName: string }) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/video/deviceDetail', {params});
}

export const deviceTreeNew: (params: {
  appCode: string;
  currentProjectName: string;
  currentLevel: string;
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/video/deviceTree', {params});
}

//质量V2
export const getQBSTree: (params: {
  appCode: string;
  projectName: string;
  name?: string;
  qbsId?: string;
  status?: number,
  flag?: boolean
}) => Promise<HttpResponse<Array<Type.QualityTable>>> = params => {
  // return Axios.get( '/api/quality/v2/qbs/treeList', { params } );
  return Axios.post('/api/quality/v2/analyse/node', params);
}
//确认质检完成
export const qbsDone: (params: {
  qbsId?: string
}) => Promise<HttpResponse<void>> = params => {
  return Axios.put('/api/quality/v2/qbs/complete', {...params})
}
//质检计划树(全量)
export const getQBSTreeComplete: (params: {
  appCode: string;
  projectName: string
}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/quality/v2/qbs/complete/tree', {params});
}

export const getMBSTree: (params: {
  qbsId?: string;
  name?: string;
  mbsId?: string;
  bind?: boolean;
  appCode?: string,
  projectName?: string
}) => Promise<HttpResponse<Array<Type.MBSTable>>> = params => {
  return Axios.get('/api/quality/v2/qbs/mbs/tree', {params});
}

export const importQBSTree: (params: FormData) => Promise<HttpResponse<void>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  // return Axios.post('/api/quality/v2/qbs/excel/import', params, fileHeader);
  return Axios.post('/api/quality/v2/qbs/excel/preImport', params, fileHeader);
}

export const importMBSTree: (params: FormData) => Promise<HttpResponse<void>> = params => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/code_mbs/data_import', params, fileHeader);
}

export const exportQBSTemplate: (params: {}) => void = params => {
  return window.open('/api/api/quality/v2/qbs/excel/importTemplate');
}

export const exportQBSTree: (params: {
  appCode: string;
  projectName: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.get('/api/quality/v2/qbs/export', {params});
}

export const mountQBSTree: (params: {
  qbsId: string;
  appCode: string;
  projectName: string;
  addNodes: Array<{
    codeValue: string;
    taskName: string;
    modelTypeId: string
  }>
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/quality/v2/qbs/mbs/edit', params);
}

export const editQBSTreeNode: (params: {
  appCode?: string;
  projectName?: string;
  qbsId?: string;
  qbsCode?: string;
  name?: string;
  //mbsCode?: string;
  mbsCodes?: Array<string>;
  modelTypeId?: string;
  jbsId?: string;
  level?: number;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.put('/api/quality/v2/qbs/edit', {...params});
}

export const addQBSTreeNode: (params: {
  parentId?: string;
  qbsCode: string;
  name: string;
  appCode?: string;
  projectName?: string;
  level?: number;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/quality/v2/qbs/add', params);
}

export const removeQBSTreeNode: (params: {
  appCode: string;
  projectName: string;
  //qbsId: string; QualityVersion 3.0.0
  qbsIds: Array<string>;
}) => Promise<HttpResponse<{contents: string[],title: string}>> = params => {
  return Axios.post('/api/quality/v2/qbs/delete', params);
}

export const getMBSModelList: (params: {
  qbsId: string;
}) => Promise<HttpResponse<Array<Type.MBSModelNode>>> = params => {
  return Axios.get('/api/quality/v2/qbs/mbs/list', {params});
}

export const getBindBizSheet: (params: {
  qbsIds?: Array<string>;
  qbsId?: string;
  currentPage: number;
  pageNum: number;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.QualityQBS>>>> = params => {
  return Axios.post('/api/quality/v2/qbs/bizsheet/bind', params);
}

export const getUnbindBizSheet: (params: {
  //qbsId: string;
  qbsJbsId: string;
  currentPage: number;
  pageNum: number;
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.QualityQBS>>>> = params => {
  return Axios.get('/api/quality/v2/qbs/bizsheet/unbind', {params});
}

export const editBindBizSheet: (params: {
  delNodes: Array<{ id: string }>;
  addNodes: Array<{
    bizId: string;
    jbsId: string;
    appCode: string;
    schemaCode: string;
  }>;
  /* jbsId: string;
   qbsId: string;*/
  qbsJbsId: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/quality/v2/qbs/bizsheet/edit', params);
}

export const getQbsListByMbsId: (params: {
  appCode: string;
  projectName: string;
  nodeId: string;
}) => Promise<HttpResponse<Array<Type.QualityTable>>> = params => {
  return Axios.get('/api/quality/v2/mbs/qbs/list',{params})
}

export const editJBSNode: (params: {}) => Promise<HttpResponse<void>> = params => {
  return Axios.put('/api/quality/v2/jbs/edit', {...params});
}

export const getSystemQualitySheet: (params: {
  appCode: string;
}) => Promise<HttpResponse<Array<Type.SheetNode>>> = params => {
  return Axios.get('/api/quality/v2/system/jbsBiz/list', {params});
}

export const getSystemBizTree: (params: {
  appCode: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/quality/v2/system/jbsBiz/tree', {params});
}

export const getSystemJBSTree: (params: {
  appCode: string;
  geoCode: string;
  fieldCode: string;
}) => Promise<HttpResponse<Array<Type.SystemTree>>> = params => {
  return Axios.get('/api/quality/v2/system/jbsBiz/baseTree', {params});
}

export const syncBisSheet: (params: {
  appCode: string;
  fieldCode: string;
  geoCode: string;
  nodes: Array<Type.SyncSheetNode>
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/quality/v2/system/jbsBiz/sync', params);
}

export const getJBSNodes: (params: { qbsId: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/quality/v2/qbs/jbs', {params});
}
export const editJBSNodes: (params: {
  appCode: string;
  jbsId: string;
  projectName: string;
  qbsId: string;
  qbsJbsId: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.put('/api/quality/v2/qbs/jbs', params);
}
export const addJBSNodes: (params: {
  appCode: string;
  jbsId: string;
  projectName: string;
  qbsId: string;
  qbsJbsId?: string;
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/api/quality/v2/qbs/jbs', params);
}
export const deleteJBSNode: (params: {
  appCode: string;
  //jbsId: string;
  projectName: string;
  qbsId: string;
  //qbsJbsId: string;
  qbsJbsIds?: Array<string>;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/quality/v2/qbs/jbs/delete', params);
}

//统计分析
export const getAnalyseNode: (params: {
  projectName: string;
  appCode: string;
  name?: string;
  qbsId?: string;
  status?: number
}) => Promise<HttpResponse<Array<Type.AnalyseQuality>>> = params => {
  return Axios.post('/api/quality/v2/analyse/node', params);
}

export const getAnalyseLineCharts: (params: {
  projectName: string;
  appCode: string;
  nodeId?: string;
  startTime: string;
  endTime: string;
}) => Promise<HttpResponse<Type.AnalyseLineData>> = params => {
  return Axios.get('/api/quality/v2/analyse/biz/handle', {params});
}
export const getAnalyseProject: (params: {
  appCode: string;
  projectName: string;
}) => Promise<HttpResponse<Type.AnalyseQualityProject>> = params => {
  return Axios.get('/api/quality/v2/analyse/project', {params});
}

export const getHighLightModel: (params: {
  projectName: string;
  appCode: string;
  nodeId?: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/quality/v2/analyse/bim/mbs/list', {params});
}


export const getbimPersonList: (params: {
  projectName: string;
  appCode: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/person/bimPersonList', {params});
}

//获取所有围栏
export const getAllFence: (params: {
  projectName: string;
  appCode: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/fence/getAllFence', {params});
}

//保存或更新围栏预警信息
export const updateAlertInfo: (params: {
  alertInfo: string;
  alertLimit: number;
  remindInfo: string;
  remindLimit: number;
  managerNames: string;
  managerPhones: number;
  appCode: string;
  fenceId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/securityManage/fence/updateAlertInfo', params);
}

//删除电子围栏
export const deleteFence: (params: {
  fenceId: string;
  appCode: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/fence/deleteFence', {params});
}

//获取设备树信息
export const getEquipmentGroup: (params: {
  projectName: string;
  projectCode: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/equipment/EquipmentGroup', {params});
}

//保存或更新围栏基本信息
export const saveOrUpdateBaseInfo: (params: {
  projectName: string;
  appCode: string;
  fenceManage: any;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/securityManage/fence/saveOrUpdateBaseInfo', params);
}

//更新电子围栏坐标
export const updateFenceCoor: (params: {
  coorList: string;
  appCode: string;
  fenceId: any;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/securityManage/fence/updateFenceCoor', params);
}

//获取人员轨迹
export const bimPersonLocus: (params: {
  endTime: string;
  appCode: string;
  idList: Array<string>;
  startTime: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/securityManage/person/bimPersonLocus', params);
}

//获取设备定位信息
export const getbimEquipList: (params: {
  projectName: string;
  appCode: string;
  type: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/equipment/bimEquipList', {params});
}

//获取船舶轨迹
export const bimEquipLocus: (params: {
  endTime: string;
  appCode: string;
  idList: Array<string>;
  startTime: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/securityManage/equipment/bimEquipLocus', params);
}

//更新人员定位
export const updateBimPersonLocation: (params: {
  appCode: string;
  dataList: Array<any>;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/securityManage/person/updateBimPersonLocation', params);
}

//更新设备定位
export const updateBimEquipLocation: (params: {
  appCode: string;
  dataList: Array<any>;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/securityManage/equipment/updateBimEquipLocation', params);
}

export const getQualityEnum: (params: {}) => Promise<HttpResponse<Type.QualityEnum>> = params => {
  return Axios.get('/api/define/function/getBaseEnums', {params});
}

//ModelFIll
export const getModelTree: (params: {
  projectName: string;
  appCode: string;
}) => Promise<HttpResponse<Array<Type.ModelFIllWBSTreeNode>>> = params => {
  return Axios.get('/bim/fill/getWholeModelTree', {params});
}

export const getModelCode: (params: {
  projectName: string;
  appCode: string;
  dataSource: Array<any>;
  smid: string;
}) => Promise<HttpResponse<{ id: string; mbsCode: string; name: string }>> = params => {
  return Axios.get('/api/bim/fill/getModelCodeFromBim', {params});
}

export const delMyFillList: (params: {
  id: string
}) => Promise<HttpResponse<void>> = params => {
  return Axios.delete('/bim/fill/delMySelectModel', {params})
}

export const saveMyFillList: (params: {
  appCode: string;
  name: string;
  projectName: string;
  userId: string;
  modelSelects: Array<Type.ModelSelect>;
  selectId?: string
}) => Promise<HttpResponse<void>> = params => {
  return Axios.post('/bim/fill/saveMySelectModel', params);
}

export const getMyFillList: (params: {
  appCode: string;
  projectName: string;
  userId: string;
}) => Promise<HttpResponse<Array<Type.MyFillList>>> = params => {
  return Axios.get('/bim/fill/getMyModelSelectList', {params});
}

export const getFillListDetail: (params: {
  id: string;
}) => Promise<HttpResponse<Array<Type.FillListDetail>>> = params => {
  return Axios.get('/bim/fill/getModelSelectDetail', {params});
}

export const getModelCodeFromBim: (params: {
  appCode: string; datas: Array<any>; projectName: string
}) => Promise<HttpResponse<Array<Type.ModelCodeDetail>>> = params => {
  return Axios.post('/bim/fill/getModelCodeFromBim', params);
}

export const getModelInfo: (params: {
  appCode: string;
  projectName: string;
  modelSelects: Array<Type.ModelSelect>;
}) => Promise<HttpResponse<Type.ModelFillInfo>> = params => {
  return Axios.post('/bim/fill/getModelSelectModuleData', params);
}

export const getListBIMInfo: (params: {
  appCode: string;
  projectName: string;
  mbsIds: Array<string>;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/bim/fill/getBimDatas', params);
}

export const setStorge: (params: {
  content: string;
  keyPrefix: string;
  expireTimeStamp?: number
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/localStorge/setStorge', params);
}

//获取安全组织架构图
export const getSevurityArch: (params: { appCode: string | undefined; projectName: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/getSevurityArch', {params});
}

//获取安全岗位信息
export const getJobInfo: (params: { appCode: string | undefined; projectName: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/getJobInfo', {params});
}

//获取安全岗位内容
export const getJobDescrib: (params: { appCode: string | undefined; id: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/getJobDescrib', {params});
}

//获取菜单列表
export const getAppList: (params: { isMobile: boolean; appCode: string | undefined }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/runtime/app/list_functions_by_appcode', {params});
}

//获取安全检查统计数据
export const getSecurityProblem: (params: { appCode: string | undefined; projectName: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/getSecurityProblem', {params});
}

//获取安全检查统计数据
export const getReportUrl: (params: { schemaCode: string; appCode: string | undefined; projectName: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/standardPrint/getReportUrl', {params});
}

//获取班组树
export const getPersonTeamList: (params: { projectCode: string; projectName: string | null | undefined }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/person/PersonTeamList', {params});
}

//获取班组信息
export const getPersonTeamTree: (params: { projectCode: string; projectName: string }) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/person/getTeamTree', {params});
}

//获取人员信息
export const getPersonByTeamAndLike: (params: { appCode: string, teamId: string, like?: string }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/securityManage/person/getPersonByTeamAndLike', {params});
}

//获取考勤分析人员信息
export const getUserAttendance: (params: { appCode: string, projectName: string, teamNodeId: string,date:string }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/securityManage/v2/getUserAttendance', {params});
}

//获取考勤分析公司纬度信息
export const getCompanyAttendance: (params: { appCode: string, projectName: string }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/securityManage/v2/getCompanyAttendance', {params});
}

//删除人员信息
export const deletePersonById: (params: { appCode: string, idList: Array<string> }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/securityManage/person/deletePersonById', params);
}

//删除树节点(人员)
export const deleteTeamTreePerson: (params: { id: string, appCode: string }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/securityManage/person/deleteTeamTree', {params});
}
//编辑树节点(人员)
export const editTeamTreePerson: (params: { teamDTO: any, appCode: string }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/securityManage/person/editTeamTree', params);
}

//新增树节点(人员)
export const insertTeamTreePerson: (params: { teamDTO: any, appCode: string }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/securityManage/person/insertTeamTree', params);
}

//获取人员看板数据
export const getPersonView: (params: { appCode: string, projectName: string }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/securityManage/person/getPersonView', {params});
}
//获取安全看板数据
export const getSafetyView: (params: { appCode:string, projectName: string  }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/securityManage/securityReport', {params});
}
//获取安全看板整改清单
export const getRectificationNotice: (params: { appCode:string, projectName: string, pageNum: number, pageSize: number, keyWord: string, startTime: string, endTime: string}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/securityManage/rectificationNotice', {params});
}
//获取设备看板数据
export const getEquipView: (params: { appCode: string, projectName: string }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/securityManage/equipment/getEquipView', {params});
}

//获取百度地图人员轨迹
export const getLocusPerson: (params: { appCode: string, idList: Array<any>, startTime: string, endTime: string }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/securityManage/person/getLocus', params);
}

//获取百度地图设备轨迹
export const getLocusEquip: (params: { appCode: string, idList: Array<any>, startTime: string, endTime: string }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/securityManage/equipment/getLocus', params);
}

//获取子表数据
export const getChildTableData: (params: Type.QueryLayer) => Promise<HttpResponse<Type.QueryLayer>> = (params) => {
  return Axios.get('/api/runtime/form/load', {params});
}

//获取子表数据
export const getTableList: (params: Type.QueryObjectId) => Promise<HttpResponse<Type.QueryObjectId>> = (params) => {
  return Axios.post('/api/runtime/query/list', params);
}

//获取人员培训信息
export const getPersonTraining: (params: {
  phoneNumber: string,
  currentPage: number,
  pageSize: number
}) => Promise<any> = (params) => {
  return Axios.get('/api/securityManage/person/getUserPlanRecordFromNXB', {params});
}

//获取班组信息(设备)
export const getTeamTreeEquip: (params: {
  projectCode: string,
  projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/equipment/getTeamTree', {params});
}

//新增树节点(设备)
export const insertTeamTreeEquip: (params: {
  appCode: string,
  teamDTO: any
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/securityManage/equipment/insertTeamTree', params);
}

//编辑树节点(设备)
export const editTeamTreeEquip: (params: {
  appCode: string,
  teamDTO: any
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/securityManage/equipment/editTeamTree', params);
}

//删除树节点(设备)
export const deleteTeamTreeEquip: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/equipment/deleteTeamTree', {params});
}

//获取设备信息(设备)
export const getEquipByTeamAndLike: (params: {
  appCode: string,
  teamId: string,
  like?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/equipment/getEquipByTeamAndLike', {params});
}

//删除设备信息(设备)
export const deleteEquipById: (params: {
  appCode: string,
  idList: Array<string>,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/securityManage/equipment/deleteEquipById', params);
}

//获取mbsKey对应的内容
export const getStorge: (params: {
  key: string
}) => Promise<HttpResponse<string>> = params => {
  return Axios.get('/api/localStorge/getStorge', {params});
}

//查看对应模块关联的上级模块编码
export const getUpperCode: (params: {
  appCode: string; projectName: string; moduleCode?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/moduleConfig/getUpperCode', {params});
}

//获取工程量清单细项及状态，树形，异步
export const getChildsWithState: (params: {
  projectCode: string; schemeId: string; parentId: string; projectName?: string; multiProjectFlag?: boolean
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/contractDetail/getChildsWithState', {params});
}

//根据cbs细项批量计量
export const banchRecord: (params: {
  cbsIdList: Array<string>; detailId: string; projectCode: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/cbsMeasure/banchRecord', params);
}

//保存cbs计量记录
export const cbsMeasureInsert: (params: {
  objList: any; projectCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/cbsMeasure/insert', params);
}

//根据CBS细项id获取对应的计量记录
export const cbsMeasureGet: (params: {
  cbsId: string; projectCode: string; periodId?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/cbsMeasure/getByCBSId', {params});
}

//删除cbs计量记录
export const cbsMeasureDel: (params: {
  cbsId: string; projectCode: string; periodId?: string; ids: Array<string>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/cbsMeasure/delete', params);
}

//批量填报下获取cbs细项,分页,获取进度模块关联状态
export const getModelCbsWithState: (params: {
  cbsMbsIds: Array<string> | undefined; detailId: string; like: string; page: number; projectCode: string; size: number; cbsIds?: Array<string> | undefined
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/cbs/getModelCbsWithState', params);
}

//获取工程量清单细项及状态，树形，异步
export const getModelChildsWithState: (params: {
  cbsMbsIds?: Array<string> | undefined; multiProjectFlag: boolean; parentId: string; projectCode: string; projectName: string; schemeId: string; cbsIds: Array<string> | undefined
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/contractDetail/getModelChildsWithState', params);
}

//清空工程量清单明细
export const deleteAllContractDetail: (params: {
  projectCode: string; schemaId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/measurePayment/contractDetail/deleteAll', {params});
}

//删除工程量清单
export const schemeManageDel: (params: {
  projectCode: string; schemeId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/measurePayment/schemeManage/delete', {params});
}

//保存工程量清单
export const schemeManageInsert: (params: {
  projectCode: string; objList: Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/schemeManage/insert', params);
}

//将方案设为当前版本
export const setCurrentVersion: (params: {
  projectCode: string; schemaId: string; contractNum: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/schemeManage/v3/setCurrentVersion', {params});
}

//调用云枢方法保存计量汇总
export const measureTotalInsert: (params: {
  projectCode: string; objList: Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/measure/insertMeasurePeriod', params);
}

//删除计量周期
export const measureTotalDel: (params: {
  projectCode: string; id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/measurePayment/measure/deleteMeasurePeriod', {params});
}

//根据查询条件查询计量汇总
export const queryMeasure: (params: {
  contractNum: string; measurePeriod: string; page: number; payPeriod: string; projectCode: string; projectName?: string; size: number
}) => Promise<any> = params => {
  return Axios.post('/api/measurePayment/measure/queryMeasure', params);
}

//获取项目名称
export const getProjectNameMeasure: (params: {
  appCode: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measureView/getProjectName', {params});
}

//删除合同信息
export const contractManageDelete: (params: {
  projectCode: string; contractNum: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/measurePayment/contractManage/delete', {params});
}

//删除清单类型
export const deleteSchemaType: (params: {
  projectCode: string; id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/measurePayment/contractManage/deleteSchemaType', {params});
}

//根据合同编号获取清单类型
export const getSchemeType: (params: {
  projectCode: string; contractNum: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/contractManage/getSchemeType', {params});
}

//根据合同编号获取支付类型
export const getPayType: (params: {
  projectCode: string; contractNum: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/contractManage/getPayType', {params});
}

//删除支付类型
export const deletePayType: (params: {
  projectCode: string; id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/measurePayment/contractManage/deletePayType', {params});
}

//保存合同信息
export const contractManageInsert: (params: {
  projectCode: string; objList: Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/contractManage/insert', params);
}

//保存清单类型
export const insertSchemaType: (params: {
  projectCode: string; objList: Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/contractManage/insertSchemaType', params);
}

//保存支付费用类型
export const insertPayType: (params: {
  projectCode: string; objList: Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/contractManage/insertPayType', params);
}

//删除支付周期
export const deletePayPeriod: (params: {
  projectCode: string; periodId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/measurePayment/payManage/deletePayPeriod', {params});
}

//根据查询条件查询支付周期
export const queryPay: (params: {
  contractNum: string; measurePeriod: string; page: number; payPeriod: string; projectCode: string; projectName?: string; size: number
}) => Promise<any> = params => {
  return Axios.post('/api/measurePayment/payManage/queryPay', params);
}

//保存支付周期
export const insertPayPeriod: (params: {
  objList: Array<any>; projectCode: string;
}) => Promise<any> = params => {
  return Axios.post('/api/measurePayment/payManage/insertPayPeriod', params);
}

//查询组织机构的子组织
export const contractOrg: (params: {
  deptId: string; filterType: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/organization/department/childs', {params});
}


//系统配置-start
//获取项目对应非工序节点默认评定表
export const getQbsSheetConfig: (params: {
  appCode: string,
  projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/qbsSheet/config', {params});
}
//删除项目对应非工序节点默认评定表
export const delectQbsSheetConfig: (params: {
  appCode: string,
  projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/qbsSheet/config', {params})
}
//修改或者新增项目对应非工序节点默认评定表
export const updateQbsSheetConfig: (params: {
  appCode: string,
  projectName: string,
  dwpd: string,
  dxpd: string,
  fbpd: string,
  fxpd: string,
  bwpd: string,
  id?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.put('/api/sysConfig/qbsSheet/config', params);
}
//获取表单地址
export const getFormUrl: (params: {
  bizObjectId: string,
  schemaCode: string,
  formCode?: string
}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.get('/api/runtime/form/get_form_url', {params});
}
//获取项目架构配置详情
export const getSystemProjectConfig: (params: {
  appCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/projectConfig', {params});
}
//获取图层管理列表
export const getLayerManagement: (params: {
  appCode: string,
  projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/getModelLayerData', {params});
}

//保存修改拖拽排序
export const saveModelLayerData: (params: {
  appCode: string,
  projectName: string,
  modelConfigLayerDataList:Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/saveModelLayerData?appCode='+params.appCode+'&projectName='+params.projectName, params.modelConfigLayerDataList);
}

//多项目-新建项目架构树节点
export const addProjectNode: (params: {
  appCode: string,
  name: string,
  parentId: string | null,
  projectId: string | null
  type: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/projectNode/add', params);
}
//多项目-删除项目架构树节点
export const deleteProjectNode: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/projectNode/del', {params});
}
//多项目-单个节点修改
export const updateProjectNode: (params: {
  appCode: string,
  id: string,
  name: string,
  platformFlag: any,
  appKey?:string|null,
  appSecret?:string|null,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/projectNode/update', params);
}
//多项目-获取可关联项目列表
export const getRefProject: (params: {
  appCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/project', {params});
}
//多项目-公司关联项目
export const addRefProject: (params: {
  appCode: string,
  parentId: string,
  projectIds: string[]
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/projectNode/addPros', params);
}
//拖拽排序
export const saveProjectSort: (params: {
  appCode: string,
  projectName: string,
  multi:Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/saveProjectSort?appCode='+params.appCode+'&projectName='+params.projectName, params.multi);
}

//获取BIM菜单配置详情
export const getBIMMenuConfig: (params: {
  appCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/getBIMTabConfig', {params});
}
//获取BIM弹窗配置详情
export const getBIMModalConfig: (params: {
  appCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/getBIMFrameConfig', {params});
}
//删除BIM菜单配置
export const deleteBIMMenu: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/delBIMTab', {params});
}
//删除BIM弹窗配置
export const deleteBIMModal: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/delBIMFrame', {params});
}
//
//获取某项目下BIM平台配置详情
export const getBIMPlatformConfig: (params: {
  appCode: string,
  projectId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/getBIMConfig', {params});
}
//获取某项目下业务模块关联配置
export const getBusModuleConfig: (params: {
  appCode: string,
  projectId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/getModuleConfig', {params});
}
//修改某项目下业务模块关联配置
export const updateBusModuleConfig: (params: {
  appCode: string,
  projectId: string,
  nodes: ConfigType.ModuleConfig[]
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/updatetModuleConfig', params);
}
//系统配置风险推送管理
//获取系统风险配置
export const getSystemRiskConfig: (params: {
  appCode: string,
  projectName: string,
  type: string
}) => Promise<HttpResponse<ConfigType.RiskData>> = params => {
  return Axios.get('/api/sysConfig/pushing/config', {params});
}
//修改系统风险配置
export const updateRiskConfig: (params: {
  appCode: string,
  projectName: string,
  id?: string,
  period: number,
  type: string,
  periodType: string,
  users: {
    userId: string,
    userName: string
  }[]
}) => Promise<HttpResponse<any>> = params => {
  return Axios.put('/api/sysConfig/pushing/config', params);
}
//删除系统风险配置
export const deleteRiskConfig: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/pushing/config', {params});
}
//组织架构
//获取组织机构查看及编辑权限组
export const getDepartmentAuthGroups: (params: {
  appCode: string,
}) => Promise<HttpResponse<Array<ConfigType.Org>>> = params => {
  return Axios.get('/api/define/department/getDepartmentAuthGroups', {params});
}
//新增或修改组织机构查看及编辑权限组
export const updateDepartmentAuthGroup: (params: {
  appCode: string,
  deptId: string,
  editFlag: boolean,
  id?: string | null,
  userDeptIds: string[],
  userIds: string[]
}) => Promise<HttpResponse<any>> = params => {
  return Axios.put('/api/define/department/saveOrUpdateDepartmentAuthGroup', {...params});
}
//删除组织机构查看及编辑权限组
export const deleteDepartmentAuthGroup: (params: {
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/define/department/delDepartmentAuthGroup', {params});
}
//获取组织架构
export const getDepartments: (params: {
  appCode: string,
}) => Promise<HttpResponse<Array<ConfigType.Department>>> = params => {
  return Axios.get('/api/define/department/getDepartments', {params});
}
//删除部门
export const deleteDepInfo: (params: {
  appCode: string,
  deptId: string
}) => Promise<HttpResponse<string>> = params => {
  return Axios.delete('/api/define/department/delDepartment', {params});
}
//获取组织机构下人员
export const getDepartmentUsers: (params: {
  appCode: string,
  deptId: string,
  pageNum: number,
  pageSize: number
}) => Promise<HttpResponse<ConfigType.DepartmentUser>> = params => {
  return Axios.get('/api/define/department/getDepartmentUsers', {params});
}
//新增人员
export const addDepartmentUser: (params: {
  appCode: string,
  deptId: string,
  user: ConfigType.AddUserRequestParams
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/define/department/addDepartmentUser', {...params});
}
//删除人员
export const deleteUserInfo: (params: {
  appCode: string,
  deptId: string,
  userId: string
}) => Promise<HttpResponse<string>> = params => {
  return Axios.delete('/api/define/department/delDepartmentUser', {params});
}
//修改人员信息
export const updataDepartmentUser: (params: {
  appCode: string,
  deptId: string,
  user: ConfigType.AddUserRequestParams
}) => Promise<HttpResponse<string>> = params => {
  return Axios.put('/api/define/department/updateDepartmentUser', {...params});
}
//获取用户信息 by id
export const getUserInfoById: (params: {
  id: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/organization/user/info', {params});
}
//获取组织树每个节点和子部门信息
export const getDeptInfo: (params: {
  deptId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/organization/department/get_dept_info', {params});
}
//新增组织机构
export const addDepartment: (params: {
  appCode: string;
  departmentName: string,
  deptId?: string
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/define/department/addDepartment', {...params});
}
//获取登录配置信息
export const getLoginConfig: (params: {
  appCode: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/loginConfig', {params});
}
//修改安装包信息
export const updatePackageInfo: (params: {
  appCode: string,
  androidUrl: string,
  iosUrl: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.put('/api/sysConfig/updatePackage', {...params});
}
//删除默认页配置
export const deleteDefaultPages: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/delDefaultPage', {params});
}
//新增或者保存默认页配置
export const updateDefaultPagesConfig: (params: { id?: string, pages: any; appCode: string; deptIds: string[] }) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/saveOrUpdateDefaultPage', {...params});
}
//修改平台登录页信息
export const updateIconTheme: (params: FormData) => Promise<HttpResponse<unknown>> = (params) => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.put('/api/sysConfig/updateTheme', params, fileHeader);
}
//获取图标列表
export const getIconList: (params: {
  appCode: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/iconBase/icons', {params});
}
//新增或者修改图标
// export const : (params: FormData) => Promise<HttpResponse<any>> = params => {
//   return Axios.post( '/api/sysConfig/iconBase/icon', { ...params },{
//     headers: { 'Content-Type': 'multipart/form-data' }
//   } );
// }
export const updateIcon: (params: FormData) => Promise<HttpResponse<unknown>> = (params) => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/sysConfig/iconBase/icon', params, fileHeader);
}
//删除图标
export const deleteIcon: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/iconBase/icon', {params});
}
//获取数据字典类别组
export const getDicGroup: (params: {
  appCode: string,
}) => Promise<HttpResponse<Array<ConfigType.DicGroups>>> = params => {
  return Axios.get('/api/sysConfig/dataDic/groups', {params});
}
//新增数据字典类别组
export const addDicGroup: (params: {
  name: string,
  appCode: string,
  userDeptIds: string[];
  userIds: string[]
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/sysConfig/dataDic/group', {...params});
}
//修改数据字典类别组
export const updateDicGroup: (params: {
  appCode: string;
  name: string;
  userDeptIds: string[];
  userIds: string[]
})=> Promise<HttpResponse<string>> = params => {
  return Axios.put('/api/sysConfig/dataDic/group',params)
}
//删除数据字典类别组
export const deleteDicGroup: (params: {
  appCode: string,
  name: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/dataDic/group', {params});
}
//获取数据字典节点树
export const getDicTree: (params: {
  appCode: string,
  name: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/dataDic/nodes', {params});
}
//新增数据字典节点
export const addDicTreeNode: (params: {
  name: string,
  appCode: string,
  groupName: string,
  parentId?: string,
  code: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/dataDic/node', {...params});
}
//删除数据字典节点
export const deleteDicTreeNode: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/dataDic/node', {params});
}
//获取720全景列表
export const getPanoramic: (params: {
  appCode: string,
  projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/720/scenses', {params});
}
//删除720全景记录
export const deletePanoramic: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/720/scense', {params});
}
//获取监控中心项目分组混合树
export const getMonitoringCenterTree: (params: {
  appCode: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/videoCenter/groups', {params});
}
//新增监控中心项目分组混合树
export const addMonitorProGroup: (params: {
  id?: string,
  name: string,
  appCode: string,
  parentId: string,
  parentType: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/videoCenter/group', {...params});
}
//删除监控分组
export const deleteMonitorProGroup: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/videoCenter/group', {params});
}
//获取监控中心项目摄像头列表
export const getCameraList: (params: {
  appCode: string,
  id: string,
  type: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/videoCenter/carames', {params});
}
//删除摄像头
export const deleteCamera: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/videoCenter/carame', {params});
}
//获取数据中心配置项目组
export const getDataCenterGroups: (params: {
  appCode: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/dataCenter/groups', {params});
}
//获取类组可选项目列表
export const getDataCenterProList: (params: {
  appCode: string,
  type: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/dataCenter/selectGroup', {params});
}
//数据中心-新增项目组
export const addProGroup: (params: {
  appCode: string,
  projectIds: Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/dataCenter/addGroup', {...params});
}
//数据中心-新增项目
export const addPro: (params: {
  appCode: string,
  projectIds: Array<any>,
  id:string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/dataCenter/group/addPro', {...params});
}
//删除项目组
export const deleteProGroup: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/dataCenter/delGroup', {params});
}
//删除项目
export const delPro: (params: {
  appCode: string,
  id:string
  projectName:String
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/dataCenter/group/delPro', {params});
}
//获取特定项目组下RDP列表
export const getRdpList: (params: {
  appCode: string,
  id: string,
  tabId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/dataCenter/group/rdp', {params});
}
//新增/修改菜单rdp配置
export const updateRdp: (params: {
  appCode: string,
  id?: string,
  projectGroupId: string,
  tabId: string,
  allRdp: {
    name: string | null,
    schemaCode: string
  },
  rightRdp: {
    name: string | null,
    schemaCode: string
  },
  upRdp: {
    name: string | null,
    schemaCode: string
  },
  isRdp: boolean;
  routing: {
    name: string, schemaCode: string
  } | null
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/dataCenter/group/saveOrUpdateRdp', {...params});
}
//删除菜单rdp配置
export const deleteRdp: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/dataCenter/group/delRdp', {params});
}
//获取数据中心菜单树
export const getMenuTree: (params: {
  appCode: string
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/dataCenter/group/tabs', {params});
}
//新增或修改数据中心菜单树
export const updateMenuTree: (params: {
  id?: string;
  name: string;
  appCode: string;
  parentId?: string;
  icon?: string;
  deptIds: string[];
  userIds: string[];
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/sysConfig/dataCenter/group/tab', {...params});
}

//删除中心菜单树
export const deleteMenu: (params: {
  appCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/sysConfig/dataCenter/group/tab', {params});
}
//获取项目icon
export const getIcons: () => Promise<HttpResponse<Array<ConfigType.IconDataType>>> = () => {
  return Axios.get('/api/iconManage/getIcons');
}
//自定义上传项目icon
export const addIcon: (params: FormData) => Promise<HttpResponse<unknown>> = (params) => {
  const fileHeader = {
    headers: {'Content-Type': 'multipart/form-data'}
  };
  return Axios.post('/api/iconManage/addIcon', params, fileHeader);
}
//获取数据中心Report列表
export const getReportList: (params: {
  appCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/sysConfig/dataCenter/rdps', {params});
}
//获取路由列表
export const getRouteList: (params: {
  appCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/groupControlCenter/rdp/getCustomPage', {params});
}
//
export const getFolders: (params: {
  appCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/app/apppackage/folders', {params});
}
/* 新增报表 */
export const addAppReport: (params: { mobileAble: boolean; code: any; name: any; icon: any; reportOrigin: any; id: any; appCode: string; pcAble: boolean; parentId: any }) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/report/create', {...params});
}
//查看报表关联的大屏服务类型
export const changePageOrigin: (params: {
  origin: string,
  reportCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/define/function/changePageOrigin', {...params});
}
//end


//计量支付V3
//cbs关联qbs
export const createCbsQbsRelate: (params: {
  cbsToRelate: any,
  projectCode: string,
  qbsList: Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/schemeManage/v3/createCbsQbsRelate', {...params});
}

//获取不带工序的质量简化树
export const simplifiedTree: (params: {
  appCode: string,
  projectName: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/quality/v2/qbs/simplifiedTree', {params});
}

//工程量清单数据同步
export const updateContractDetail: (params: {
  projectCode: string,
  schemaId: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/schemeManage/v3/updateContractDetail', {params});
}


//批量删除cbsqbs关联关系
export const deleteCbsQbsRelate: (params: {
  projectCode: string,
  ids: Array<string>,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/schemeManage/v3/deleteCbsQbsRelate', params);
}

//获取工程量清单细项，树形，异步
export const contractDetailGetChilds: (params: {
  projectCode: string,
  schemeId: string,
  parentId: string,
  projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/contractDetail/getChilds', {params});
}

//批量更新cbsqbs关联关系
export const updateCbsQbsRelate: (params: {
  projectCode: string,
  qbsCbsList: Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/schemeManage/v3/updateCbsQbsRelate', params)
}

//删除工程量清单项
export const deleteSingleContractDetail: (params: {
  projectCode: string,
  schemaId: string,
  cbsCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/schemeManage/v3/deleteSingleContractDetail', {params})
}

//获取cbsQbs细项,分页
export const getCbsQbsPage: (params: {
  projectCode: string,
  schemaId: string,
  size: number,
  current: number,
  cbsCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/schemeManage/v3/getCbsQbsPage', {params})
}

//插入树节点
export const contractDetailInsert: (params: {
  projectCode: string,
  objList: Array<any>,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/contractDetail/insert', {...params})
}

//示例文件下载
export const exportTemplate: (params: {
  queryCode: string,
  schemaCode: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/runtime/query/export_template', {...params}, {responseType: "arraybuffer"})
}

//获取工程量清单+qbs树，同步
export const getContractDetailTree: (params: {
  projectCode: string,
  projectName: string,
  multiProjectFlag: boolean,
  parentId?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/midMeasure/v3/getContractDetailTree', {params})
}

//获取cbs下所有计量记录
export const getByCBSV3: (params: {
  cbsCode: string,
  schemaId: string,
  periodName?: string,
  projectCode: string,
  like?: string,
  page?: number,
  periodId?: string,
  size?: number
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/cbsMeasure/v3/getByCBS', {params})
}

//删除未提交汇总的中间计量记录
export const deleteV3: (params: {
  cbsMeasureIdList: Array<string>,
  periodId?: string,
  periodName?: string,
  projectCode: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/cbsMeasure/v3/delete', params)
}

//保存中间计量记录
export const insertV3: (params: {
  objList: Array<any>,
  projectCode: string,
  periodId?: string,
  periodName?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/cbsMeasure/v3/insert', params)
}

//一键添加中间计量
export const selectAllCBSMeasureV3: (params: {
  projectCode: string,
  schemaId: string,
  periodName: string,
  periodId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measure/v3/selectAllCBSMeasure', {params})
}

//清空计量清单
export const deleteMeasureDetailV3: (params: {
  projectCode: string,
  periodId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measure/v3/deleteMeasureDetail', {params})
}

//获取计量清单，异步，带筛选
export const getMeasureDetailChildsV3: (params: {
  projectCode: string,
  projectName: string,
  periodId: string,
  schemaId?: string,
  parentId?: string,
  value?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measure/v3/getMeasureDetailChilds', {params})
}

//根据id获取计量周期
export const getMeasurePeriod: (params: {
  projectCode: string,
  id: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measure/getMeasurePeriod', {params})
}

//获取本计量周期的中间计量数据,模糊搜索及统计结果
export const getByCBSAndPeriodPageV3: (params: {
  projectCode: string,
  periodId: string,
  cbsCode: string,
  schemaId: string,
  like?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measure/v3/getByCBSAndPeriodPage', {params})
}

//导入合同清单项
export const importMeasureDetailV3: (params: {
  contractNum: string,
  lastMeasurePeriodId: string,
  measurePeriodId: string,
  projectCode: string,
  schemaId: string,
  projectName?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/measure/v3/importMeasureDetail', params)
}

//批量移除计量本期关联的计量记录
export const removeCBSMeasureV3: (params: {
  cbsMeasureIdList: Array<string>,
  periodId: string,
  periodName: string,
  projectCode: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/measure/v3/removeCBSMeasure', params)
}

//启动计量周期流程
export const measureTotalStartWorkflow: (params: {
  objList: Array<any>,
  projectCode: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/measure/startWorkflow', params)
}

//更新计量清单明细
export const updateMeasureDetailV3: (params: {
  lastPeriodId: string;
  periodId: string;
  schemaId: string;
  projectCode: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measure/v3/updateMeasureDetail', {params})
}

//清空费用项
export const deletePayDetail: (params: {
  gpayper: any,
  projectCode: string,
  objList: Array<string>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/payManage/deletePayDetail', params)
}

//根据id获取支付周期方案
export const getPayPeriod: (params: {
  projectCode: string,
  id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/payManage/getPayPeriod', {params})
}

//获取支付明细
export const getPayDetail: (params: {
  projectCode: string,
  periodId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/payManage/getPayDetail', {params})
}

//导入支付明细项
export const importPayDetail: (params: {
  contractNum: string,
  id: string,
  lastPaymentFK: string,
  projectCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/payManage/importPayDetail', params)
}

//获得当前计量期号的费用
export const selectMeasurePeriodV3: (params: {
  objList: Array<any>,
  projectCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/pay/v3/selectMeasurePeriod', params)
}

//启动支付周期流程
export const payManageStartWorkflow: (params: {
  objList: Array<any>,
  projectCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/payManage/startWorkflow', params)
}

//支付汇总数据更新
export const updatePayDetailV3: (params: {
  gpayper: any,
  objList: Array<any>,
  projectCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/pay/v3/updatePayDetail', params)
}

//计算要添加的计量记录并返回给前段，此时不绑定周期，不存数据库，设置标识符
export const getCbsToMeasureV3: (params: {
  schemaId: string, cbsCode: string, projectName: string, projectCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/cbs/v3/getCbsToMeasure', {params})
}

//获取cbs下未绑定的计量记录
export const getUnrelateByCBSV3: (params: {
  projectCode: string, schemaId: string, cbsCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measure/v3/getUnrelateByCBS', {params})
}

//将中间计量记录关联到指定计量周期
export const selectCBSMeasureV3: (params: {
  projectCode: string, cbsMeasureIdList: Array<string>, periodId: string, periodName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/measure/v3/selectCBSMeasure', params)
}

//获取最新的计量清单明细
export const getLatestCBSV3: (params: {
  appCode: string, projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measureView/v3/getLatestCBS', {params})
}

//根据计量明细获取每期统计
export const getCbsStaticsV3: (params: {
  appCode: string, cbsCode: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measureView/v3/getCbsStatics', {params})
}

//根据计量周期获取计量清单明细
export const getCBSByPeriodV3: (params: {
  appCode: string, projectName: string, period: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measureView/v3/getCBSByPeriod', {params})
}


//获取所有计量周期
export const getAllPeriodV3: (params: {
  appCode: string, projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measureView/v3/getAllPeriod', {params})
}

//删除计量周期
export const deleteMeasurePeriodV3: (params: {
  projectCode: string, id: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/measurePayment/measure/v3/deleteMeasurePeriod', {params})
}

//获取计量支付看板
export const getViewV3: (params: {
  appCode: string, projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/bim/measure/v3/getView', {params})
}

//获取计划计量的cbs树
export const getPlanCbsV3: (params: {
  appCode: string, projectName: string, multiProjectFlag: boolean
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/cbs/v3/getPlanCbs', {params})
}


//获取同步树上所有可计量的节点的计量值，返回前端，不保存
export const generateCbsMeasureByCbsV3: (params: {
  appCode: string, cbsNodeList: Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/cbs/v3/generateCbsMeasureByCbs', params)
}

//获取所有清单
export const getAllSchemaV3: (params: {
  appCode: string, projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/bim/measure/v3/getAllSchema', {params})
}

//获取所有清单
export const getAllPeriodBySchemaV3: (params: {
  appCode: string, schemaId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/bim/measure/v3/getAllPeriodBySchema', {params})
}

//在bim中展示本期计量
export const showCbsMeasureV3: (params: {
  appCode: string, dataList?: Array<any>, projectName: string, dataListV3?: Array<any>
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/bim/measure/v3/showCbsMeasure', params)
}

//获取工程量清单细项下的所有MBS及状态
export const getAllMBS: (params: {
  projectCode: string, detailId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/bim/measure/getAllMBS', {params})
}

//获取工程量清单细项，树形，异步
export const getCBS: (params: {
  projectCode: string, projectName: string, parentId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/bim/measure/getCBS', {params})
}

//根据关键字搜索树
export const getCBSByName: (params: {
  projectCode: string, projectName: string, name: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/bim/measure/getCBSByName', {params})
}

//获取工程量清单下的所有Qbs及状态
export const getAllQbsV3: (params: {
  projectCode: string, detailId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/bim/measure/v3/getAllQbs', {params})
}

//不同状态的cbs在bim中显示
export const getBimCbsByStateV3: (params: {
  projectCode: string,
  projectName: string,
  tabName: string,
  stateCode: string,
  select: string,
  detailId?: string,
  dataList?: Array<any>,
  selectedState?: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/bim/measure/v3/getBimCbsByState', params)
}

//获取工程量清单树，同步
export const getCbsTreeSyncV3: (params: {
  projectCode: string,
  schemaId: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/schemeManage/v3/getCbsTreeSync', {params})
}

//cbs关联qbs
export const createQbsCbsRelateV3: (params: {
  cbsToRelateList: Array<any>,
  projectCode: string,
  qbsDTO: any,
  schemaId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/schemeManage/v3/createQbsCbsRelate', params)
}

//cbs关联qbs
export const mbsInfo: (params: {
  appCode: string,
  projectName: string,
  qbsCodes: Array<string>,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/quality/v2/qbs/mbsInfo', params)
}

//获取部位码关联的mbs
export const getMbsRecordV3: (params: {
  projectCode: string,
  cbsMeasureId: string,
  schemaId: string,
  cbsQbsCode: string,
  projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/cbsMeasure/v3/getMbsRecord', {params})
}

//保存mbs记录
export const saveOrUpdateMbsRecordV3: (params: {
  appCode: string,
  cbsMeasureId: string,
  schemaId: string,
  mbsRecordList: Array<any>,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/cbsMeasure/v3/saveOrUpdateMbsRecord', params)
}

//根据查询条件查询计量汇总
export const uploadFileMeasure: (params: {
  attachmentModelList: Array<any>,
  appCode: string,
  periodId: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/measurePayment/measure/uploadFile', params)
}

//删除图片或附件
export const deleteFileMeasure: (params: {
  fileId: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measure/deleteFile', {params})
}

//获取图表所有附件
export const getAllFileMeasure: (params: {
  periodId: string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measure/getAllFile', {params})
}
//over

//获取环境监测树信息
export const getEnvironmentTree: (params: {
  projectCode: string, projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/environmentManage/getEnvironmentTree', {params})
}

//获取监控设备树
export const getBimVideoTree: (params: {
  appCode: string, projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/bim/smartConstruction/getBimVideoTree', {params})
}

//获取bim智慧工地人员看板
export const getBimPersonData: (params: {
  appCode: string, projectName: string, groupId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/bim/smartConstruction/getBimPersonData', {params})
}

//获取bim智慧工地设备看板
export const getBimEquipData: (params: {
  appCode: string, projectName: string, groupId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/bim/smartConstruction/getBimEquipData', {params})
}

//获取bim智慧工地环境数据看板
export const getBimEnvironmentData: (params: {
  appCode: string, projectName: string, groupId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/bim/smartConstruction/getBimEnvironmentData', {params})
}

//获取BIM智慧工地视频看板
export const getBimVideoData: (params: {
  appCode: string, projectName: string, groupId: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/bim/smartConstruction/getBimVideoData', {params})
}

//根据元素类别获取趋势分析
export const getEnvironmentDataTrend: (params: {
  projectCode: string, projectName: string, elementType: string, time: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/environmentManage/environmentDataTrend', {params})
}

//获取某个设备或人员的状态信息
export const getSingleData: (params: {
  appCode: string, id: string, type: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/bim/smartConstruction/getSingleData', {params})
}

//考勤分析-start
//获取参建单位考勤汇总信息
export const getProjectAttendanceStatistic: (params: {
  appCode: string,
  projectName:string,
  date:string
}) => Promise<Type.HttpRes<Type.AttendanceStatisticTotal>> = params => {
  return Axios.get('/api/securityManage/getProjectAttendanceStatistic', {params})
}
//获取岗位分析/考勤分析/考勤统计信息
export const getCompanyAttendanceStatistic: (params: {
  appCode: string,
  projectName:string,
  date:string,
  company: string
}) => Promise<Type.HttpRes<Type.CompanyAttendanceStatistic>> = params => {
  return Axios.get('/api/securityManage/getCompanyAttendanceStatistic', {params})
}
//获取人员考勤有关信息
export const getCompanyUserStatistic: (params: {
  appCode: string,
  projectName:string,
  date:string,
  company: string
}) => Promise<Type.HttpRes<Type.UserStatistic>> = params => {
  return Axios.get('/api/securityManage/getCompanyUserStatistic', {params})
}
//end

//全文搜索
export const getPageOrFormList: (params: {
  appCode: string,
  keyword: string,
  startTime: string,
  endTime: string,
  status: number,//0-进行中;1-已完成;-1-全部
  type: number,//0-菜单页面;1-数据标题;-1-全部
  currentPage: number,//默认0
  pageNum: number
}) => Promise<HttpResponse<Type.SearchNodeRes>> = params => {
  return Axios.get('/api/searchManage/search', {params})
}

//获取个人工作所有方案
export const getAllPlan: (params: { appCode: string }) => Promise<HttpResponse<Type.PlatformConfigPlan[]>> = params => {
  return Axios.get("/api/workTable/getAllPlan", {params});
}

//根据id个人工作删除方案
export const deletePlanById: (params: { appCode: string, id: string }) => Promise<HttpResponse<boolean>> = params => {
  return Axios.delete("/api/workTable/deleteById", {params});
}

export const getCbsByProjectName: (params: {
  appCode: string, projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/measurePayment/measureView/v3/getCbsByProjectName', {params})
}
//获取动态列表-分页
export const getProjectMomentV2: (params: {
  appCode: string,
  projectName: string,
  page: number,
  size: number,
}) => Promise<HttpResponse<Type.HitsTable<Type.ProjectMomentRecord>>> = params => {
  return Axios.get('/api/projectMoments/v2/getProjectMoment', {params})
}
//删除动态
export const deleteProjectMoment: (params: {
  appCode: string,
  projectMomentId: string
}) => Promise<HttpResponse<boolean>> = params => {
  return Axios.delete('/api/projectMoments/v2/deleteProjectMoment', {params})
}
//点赞、评论动态
export const doLikeOrComment: (params: {
  appCode: string,
  projectName: string,
  beCommentPersonId: string,
  commentContent: string,
  likeOrComment: string,
  noticePersonId: string,
  projectMomentId: string,
}) => Promise<HttpResponse<boolean>> = params => {
  return Axios.post('/api/projectMoments/v2/doLikeOrComment', params)
}
//取消点赞
export const cancelLike: (params: {
  appCode: string,
  projectMomentId: string
}) => Promise<HttpResponse<boolean>> = params => {
  return Axios.delete('/api/projectMoments/v2/cancelLike', {params})
}

//获取合同统计数据
export const getContractOverview: (params: {
  appCode: string,
  projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/contract/getContractOverview', {params})
}

//所有可选年份
export const getAllYear: (params: {
  appCode: string,
  projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/contract/getAllYear', {params})
}

//付款统计
export const getContractPayDetail: (params: {
  appCode: string,
  projectName: string,
  year: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/contract/getPayDetail', {params})
}

//获取我的消息列表
export const getMyMessage: (params: {
  projectName: string,
  projectCode: string,
  userId?: string,
  periodType?: string,
  messageType?: string | number,
  isRead?: boolean | string,
  page: number,
  size: number
}) => Promise<HttpResponse<Type.HitsTable<Array<Type.MyMessage>>>> = params => {
  return Axios.get('/api/ticketMessage/v2/getMessageRecord', {params});
}

//工程档案配置可添加的文档树
export const getAvailableSheetTree:(params: {
  appCode: string,
  isMobile:boolean,
  projectName: string
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/doc/getAvailableSheetTree', {params})
}
//工程档案配置一键导入文件夹
export const importFromSystem:(params: {
  appCode: string,
  projectName:string,
  isMobile:boolean
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/doc/importFromSystem', {params})
}
//获取文档目录树
export const getDirectoryList:(params: {
  appCode: string,
  projectName:string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/doc/treeList', {params})
}
//指定文档树节点导入表单
export const loadToDocTree:(params) => Promise<HttpResponse<any>> = params => {
  return Axios.put('/api/doc/loadToDocTree', params)
}
//新增
export const addTreeNode:(params) => Promise<HttpResponse<any>> = params => {
  return Axios.post('/api/doc/add', params)
}
//修改
export const updateTreeNode:(params) => Promise<HttpResponse<any>> = params => {
  return Axios.put('/api/doc/update', params)
}
//删除
export const delTreeNode: (params: {
  appCode: string;
  projectName: string;
  id: string;
}) => Promise<HttpResponse<any>> = params => {
  return Axios.delete('/api/doc/delete', {params})
}
//获取推送人员列表
export const getpushList: (params: {
  appCode: string;
  projectName: string;
  type: string;
}) => Promise<HttpResponse<ConfigType.RiskData>> = params => {
  return Axios.get('/api/sysConfig/pushing/config', {params})
}


//获取视频服务器基础配置(青柿)
export const getBaseConfigQingVideo: (params: {}) => Promise<HttpResponse<Type.QingShiBasicData>> = params => {
  return Axios.get('/api/qingVideo/getBaseConfig', {});
}

//获取节点下绑定的设备(青柿)
export const getByParentIdQingVideo: (params: { appCode: string, parentId: string, projectName: string, refreshState: boolean,currentLevel:string }) => Promise<HttpResponse<Array<Type.QingShiDeviceData>>> = params => {
  return Axios.get('/api/qingVideo/getByParentId', {params});
}

//设备解绑(青柿)
export const unBindDeviceQingVideo: (params: { appCode: string, id: string}) => Promise<HttpResponse<boolean>> = params => {
  return Axios.get('/api/qingVideo/unBindDevice', {params});
}

//绑定设备(青柿)
export const bindDeviceQingVideo: (params: { appCode: string, groupId: string,projectName:string,dataToBind:Type.QingShiDeviceData[]}) => Promise<HttpResponse<boolean>> = params => {
  return Axios.post('/api/qingVideo/bind', params);
}

//设备排序(青柿)
export const sortDeviceQingVideo: (params: { appCode: string, id: string,parentId:string,sortKey:number,moveUp:boolean}) => Promise<HttpResponse<boolean>> = params => {
  return Axios.get('/api/qingVideo/sortDevice', {params});
}

//获取所有未绑定设备(青柿)
export const getNoneBindVideoQingVideo: (params: { appCode: string, projectName: string}) => Promise<HttpResponse<Array<Type.QingShiDeviceData>>> = params => {
  return Axios.get('/api/qingVideo/getNoneBindVideo', {params});
}

//修改设备参数(青柿)
export const modifyDevicePropertyQingVideo: (params: { altitude?: string, appCode: string,channelId:string,deviceId:string,id:string,modifyCode:number,modifyValue:string|number}) => Promise<HttpResponse<Array<Type.QingShiDeviceData>>> = params => {
  return Axios.post('/api/qingVideo/modifyDeviceProperty', params);
}

//获取应用的视频配置(青柿/萤石云)
export const getVideoTypeQingVideo: (params: { appCode:string}) => Promise<HttpResponse<number>> = params => {
  return Axios.get('/api/qingVideo/getVideoType', {params});
}

//改变应用的视频配置(青柿/萤石云)
export const changeVideoTypeQingVideo: (params: { appCode:string,type:number}) => Promise<HttpResponse<boolean>> = params => {
  return Axios.get('/api/qingVideo/changeVideoType', {params});
}

//获取视频监控混合树
export const getDeviceTreeQingVideo: (params: { appCode:string,currentProjectName:string}) => Promise<HttpResponse<Array<any>>> = params => {
  return Axios.get('/api/qingVideo/getDeviceTree', {params});
}

//实时直播 - 开始直播(青柿)
export const startQingVideo: (params: { serial:string,code:string}) => Promise<any> = params => {
  return Axios.get('/QingLive/api/v1/stream/start', {params});
}

// //实时直播 - 开始直播(青柿——本地测试)
// export const startQingVideo: (params: { serial:string,code:string}) => Promise<any> = params => {
//   return Axios.get('/api/qingVideo/getVideoStartMsg', {params});
// }



// //云台控制(青柿-本地测试)
// export const videoControlQingVideo: (params: { deviceId:string,channelId:string,command:string}) => Promise<HttpResponse<string>> = params => {
//   return Axios.get('/api/qingVideo/videoControl', {params});
// }

// 云台控制(青柿-上线)
export const videoControlQingVideo: (params: { deviceId:string,channelId:string,command:string}) => Promise<HttpResponse<string>> = params => {
  return Axios.get('/QingLive/api/v1/control/ptz?serial='+params.deviceId+'&code='+params.channelId+'&command='+params.command, {});
}
//权限配置（青柿/萤石云）
export const getVideoAuth: (params: { appCode:string,projectName:string}) => Promise<any> = params => {
  return Axios.get('/api/sysConfig/videoCenter/getVideoAuth', {params});
}

//智慧互联start
//获取点位信息
export const getDevicesPosition: (params: {
  appCode:string,
  projectName:string
}) => Promise<HttpResponse<Type.DevicePosition>> = params => {
  return Axios.get('/api/iotManage/getDevices', {params});
}
//修改点位信息
export const updateDevicesPosition: (params: {
  appCode: string;
  id:string;
  height:number;
  width:number;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.put('/api/iotManage/updateDevice', params);
}
//获取ai识别信息
export const getAIRecognitionInfo: (params: {
  appCode:string,
  projectName:string,
  date:string
}) => Promise<HttpResponse<Type.AIRecognitionnNodes>> = params => {
  return Axios.get('/api/iotManage/report/AI', {params});
}
//获取车辆抓拍看板数据
export const getCarCapturedList: (params: {
  appCode:string,
  projectName:string,
  date:string
}) => Promise<HttpResponse<Type.CarNodes>> = params => {
  return Axios.get('/api/iotManage/report/car', {params});
}
//获取临边防护看板数据
export const getEdgeProtectInfo: (params: {
  appCode:string,
  projectName:string,
  date:string
}) => Promise<HttpResponse<Type.EdgeProtectData>> = params => {
  return Axios.get('/api/iotManage/report/edgeProtect', {params});
}
//获取预警螺母数据
export const getNutRisk: (params: {
  appCode:string,
  projectName:string,
  date:string
}) => Promise<HttpResponse<Type.EdgeProtectData>> = params => {
  return Axios.get('/api/iotManage/report/nutRisk', {params});
}
//获取水表信息
export const getWaterMeterInfo: (params: {
  appCode:string,
  projectName:string,
  date:string,
  deviceSn:string
}) => Promise<HttpResponse<Type.WaterMeterInfo>> = params => {
  return Axios.get('/api/iotManage/report/watermeter', {params});
}
//获取安全用电看板数据
export const getElecSaftyData: (params: {
  appCode:string,
  projectName:string,
  date:string,
  deviceSn:string,
  type:string //A相/B相/C相
}) => Promise<HttpResponse<Type.ElecSaftyInfo>> = params => {
  return Axios.get('/api/iotManage/report/elecsafty', {params});
}
//获取智能电表看板数据
export const getElecMeterData: (params: {
  appCode:string,
  projectName:string,
  date:string,
  deviceSn:string
}) => Promise<HttpResponse<Type.ElecMeterInfo>> = params => {
  return Axios.get('/api/iotManage/report/elecmeter', {params});
}
//获取卸料平台看板数据
export const getDischargeDataInfo: (params: {
  appCode:string,
  projectName:string,
  date:string,
  deviceSn:string
}) => Promise<HttpResponse<Type.DischargeDataInfo>> = params => {
  return Axios.get('/api/iotManage/report/discharge', {params});
}

//获取钓鱼考勤信息的班组树
export const getTeamTreeWithAttandance: (params: {
  projectCode:string,
  projectName:string,
}) => Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/securityManage/person/getTeamTreeWithAttandance', {params});
}
//end

//获取项目组织架构图
export const getProjectArch: (params: { appCode: string; projectName: string }) => Promise<HttpResponse<string[]>> = params => {
  return Axios.get('/api/securityManage/getSevurityArch', {
    params:{
      appCode:params.appCode,
      projectName:params.projectName,
      type:1
    }
  });
}

//获取项目岗位信息
export const getProjectJobInfo: (params: { appCode: string; projectName: string }) => Promise<HttpResponse<{gw:string,id:string,personList:string[]}[]>> = params => {
  return Axios.get('/api/securityManage/getJobInfo', {
    params:{
      appCode:params.appCode,
      projectName:params.projectName,
      type:1
    }
  });
}

//获取项目岗位内容
export const getProjectJobDescrib: (params: { appCode: string; id: string }) => Promise<HttpResponse<string[]>> = params => {
  return Axios.get('/api/securityManage/getJobDescrib', {    params:{
    appCode:params.appCode,
    id:params.id,
    type:1
  }});
}

//获取盘点核销信息
export const getMaterialManageAnalyse: (params: {
  appCode: string;
  projectName: string;
  dateType?: '年'|'月';
  singleProject: boolean;
  date?: string;
  startMonth?: string;
  endMonth?: string;
  payType?:string
})=>Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/materialManage/analyse',{params})
}

//获取库存
export const getStockList: (params: {
  codeId:string;
  appCode: string;
  schemaCode:string;
  projectName: string;
  multiProjectFlag: boolean;
  codeValue: string;
  page: number;
  size: number;
  filters: {
    propertyCode: string;
    propertyType: string;
    propertyValue: string;
  }[]
})=> Promise<HttpResponse<any>> = params => {
  return Axios.post('/dataManage/treeComponet/getListDataV2',params)
}

//盘点核销
export const exportAnalyse: (params: {
  appCode: string;
  projectName: string;
  singleProject: boolean;
  dateType: string;
  year: string;
  startMonth:string;
  endMonth:string;
})=> Promise<HttpResponse<any>> = params => {
  return Axios.get('/api/materialManage/exportAnalyse',{params})
}

//获取出入库表单编码
export const getReserveSchema: (params: {
  appCode: string
})=> Promise<HttpResponse<Type.MaterialReserveSchema>> = params => {
  return Axios.get('/api/materialManage/getReserveSchema',{params})
}

//查询摄像头是否有ai功能
export const videoHasAi: (params: {
  deviceSn: string,channelNo:string
})=> Promise<HttpResponse<boolean>> = params => {
  return Axios.get('/api/video/hasAi',{params})
}

//查询摄像头ai历史记录
export const videoGetAiHistory: (params: {
  appCode:string,deviceSn: string,channelNo:string,page:number,size:number
})=> Promise<HttpResponse<boolean>> = params => { return Axios.get('/api/video/getAiHistory',{params}) }

//获取ai报警详细数据
export const videoGetAiMessageById: (params: {
  appCode:string,id: string
})=> Promise<HttpResponse<boolean>> = params => { return Axios.get('/api/video/getAiMessageById',{params}) }

//模型分析板块获取数据
export const getAllListData: (params: {
  schemaCode:string,projectName:string
})=> Promise<HttpResponse<any>> = params => { return Axios.get('/bim/analysis/getAllListData', {params}) }

//获取响应和突发预警数量
export const getResponseCount: (params: {
  projectCode:string,projectName: string
})=> Promise<HttpResponse<any>> = params => { return Axios.get('/api/xyhProject/responseRecord/count',{params}) }

export const getCardTableByCodeValue: ( params: {
  appCode: string;
  projectName: string;
  bimCardId: string;
  codeValue: string;
  projectId: string;
} ) => Promise<HttpResponse<any>> = params => { return Axios.post( '/bim/data/getCardTableByCodeValue', params ) }

export const getDesignDataByCodeValue: ( params: {
  appCode: string;
  projectName: string;
  bimCardId?: string;
  codeValue: string;
  projectId: string;
} ) => Promise<HttpResponse<any>> = params => { return Axios.post( '/bim/data/getDesignDataByCodeValue', params ) }

export const getIOTUrl: ()=> Promise<HttpResponse<string>> = () => { return Axios.get('/api/waterInd/devOp/redirectUrl') }

export const getDevicesWaterInd: ( params: {
  appCode: string;
  projectName: string;
} ) => Promise<HttpResponse<any>> = params => { return Axios.get( '/api/waterInd/devOp/getDevices', {params} ) }

//运维标注点拖拽
export const updateNodePosition: (params: {
  appCode: string;
  projectName: string;
  id:string;
  deviceType:string;
  top:string;
  outTop:string;
  left:string;
  outLeft:string;
}) => Promise<HttpResponse<string>> = params => { return Axios.put('/api/waterInd/devOp/updateNodePosition', params) }

//根据MBS的ID获取MBS数据
export const getQueryById: (params: {
  appCode: string; id:string;
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/codeManage/queryById', {params}) }

//设备保养统计
export const deviceMaintain: (params: {
  appCode: string; projectName:string;
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/analyse/deviceManage/rest/deviceMaintain', {params}) }
//获取保养任务列表
export const getDeviceMaintainTasks: (params: {
  appCode: string; projectName:string;pageNum:number;pageSize:number
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/deviceManage/rest/getDeviceMaintainTasks', {params}) }

//设备故障统计
export const deviceRepair: (params: {
  appCode: string; projectName:string;
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/analyse/deviceManage/rest/deviceRepair', {params}) }
//获取维修任务列表
export const getDeviceRepairTasks: (params: {
  appCode: string; projectName:string;pageNum:number;pageSize:number
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/deviceManage/rest/getDeviceRepairTasks', {params}) }

//公司及设备汇总统计
export const companyAnalyse: (params: {
  appCode: string; projectName:string;
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/analyse/deviceManage/rest/companyAnalyse', {params}) }

/*二三维协调*/
//获取工作大纲基本信息及权限
export const getWorkOutlineInfo: (params: {
  appCode: string; projectId:string|null;
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/workoutline/getWorkOutlineInfo', {params}) }

//新建工作大纲基础信息
export const createWorkOutline: (params: {
  appCode: string; projectId:string|null;
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/workoutline/createWorkOutline', {params}) }

//当前流程状态查询接口
export const getInstanceBaseinfo: (params: {
  workflowInstanceId: string|null;
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/runtime/workflow/get_instance_baseinfo', {params}) }

//获取重放校验码
export const getReplayToken: (params: {
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/runtime/form/getReplayToken', {params}) }

//load 暂存接口
export const loadSave: (params: { bizObject: object, replayToken?: string, workItemId?: string|null, workflowCode?: string|null, workflowInstanceId?:string|null }) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/runtime/form/save', params);
}

//load 提交待办任务接口  签收 同意
export const loadSubmit: (params: { workItemSubmit: object}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/runtime/form/submit', params);
}

//load 驳回待办任务接口
export const loadRejectWorkItem: (params: { workItemReject: object}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/runtime/workflow/reject_workItem', params);
}

//任务大纲获取项目流程状态接口
export const queryProjectNodeInfo: (params: {
  appCode : string,projectId : string
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/projectManage/queryProjectNodeInfo', {params}) }

//中间资料列表接口
export const intermediateDataList: (params: {
  appCode : string;
  projectId: string
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/designTaskManage/v2/intermediateDataList', {params}) }

//项目成员获取是否有变更权限
export const getAuthOfChangeMember: (params: {
  appCode : string,projectId : string
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/projectMember/getAuthOfChangeMember', {params}) }

//获取项目成员列表
export const getProjectMemberList: (params: {
  appCode : string,projectId : string
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/projectMember/getProjectMemberList', {params}) }

//变更项目成员
export const changeMember: (params: { appCode : string,projectId : string,originMemberId : string,newMemberId : string}) => Promise<HttpResponse<any>> = (params) => {
  return Axios.post('/api/xtsjProject/projectMember/changeMember', params);
}

//项目进度页面
export const scheduleInfo: (params: {
  appCode : string,projectId : string
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/schedule/info', {params}) }

//一键生成成果文件 -start
//获取大纲成果文件绑定情况
export const getWorkOutlineBindModel: (params: {
  appCode: string,
  workOutlineId : string
}) => Promise<HttpResponse<Type.WorkOutlineModel>> = params => { return Axios.get('/api/xtsjProject/workoutline/getWorkOutlineBindModel', {params}) }
//获取工作大纲可使用的模板文件列表
export const getWorkOutlineModels: (params: {
  appCode: string,
  workOutlineId : string
}) => Promise<HttpResponse<Array<Type.WorkOutlineTemplate>>> = params => { return Axios.get('/api/xtsjProject/workoutline/getWorkOutlineModels', {params}) }
//选定模板后获取绑定模板对象
export const selectWorkOutlineModel: (params: {
  appCode: string;
  projectName: string;
  modelId: string;
  workOutlineId: string;
}) => Promise<HttpResponse<Type.WorkOutlineModel>> = params => {
  return Axios.post('/api/xtsjProject/workoutline/selectWorkOutlineModel', params)
}
//获取知识工程筛选项
export const getContentItemRule: (params: {
  appCode: string
}) => Promise<HttpResponse<Type.WorkOutlineContentItemRule>> = params => { return Axios.get('/api/xtsjProject/systemManage/getContentItemRule', {params}) }
//选定模板后获取资料列表
export const searchContentItem: (params: {
  appCode: string;
  // workOutlineId: string;
  projectName: string;
  keyWord: string;
  bussiness: string;
  fileType: string;
  professionType: string;
  projectState: string;

}) => Promise<HttpResponse<Array<Type.WorkOutlineSourceList>>> = params => {
  return Axios.post('/api/xtsjProject/workoutline/searchContentItem', params) }
//一键生成
export const getWorkOutlineConfirmModel: (params: {
  appCode: string,
  workOutlineId : string
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/workoutline/confirmModel', {params}) }
//end

//在线协同编辑  - start

//end



//获取数字中心列表
export const getDigitalDeliveryByProject: (params: {
  appCode : string,projectName?: string|null
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/designTaskManage/getDigitalDeliveryByProject', {params}) }

//项目下拉框
export const getProjectDropBox: (params: {
  appCode : string;
  lotus: boolean;
  hasModel: boolean
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/designTaskManage/getProjectDropBox', {params}) }

//查询下方筛选后的成果文件
export const getAchievementsByProjectId: (params: {
  appCode : string,projectId:string,achievementName:string|null
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/designTaskManage/getAchievementsByProjectId', {params}) }

//查询下方筛选后的成果文件
export const addDigitalDelivery: (params: Type.AddDigitalDeliveryParam) => Promise<HttpResponse<any>> = params => { return Axios.post('/api/xtsjProject/designTaskManage/addDigitalDelivery', params) }

//删除数据交付
export const deleteDigitalDeliveryById: (params: {
  id:string
}) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/designTaskManage/deleteDigitalDeliveryById', {params}) }
// //项目策划批量新增（项目专业）
// export const getContentItemRule: (params: {
//   appCode : string,
// }) => Promise<HttpResponse<any>> = params => { return Axios.get('/api/xtsjProject/workoutline/getContentItemRule', {params}) }

export const workflowInstanceFlag:(params:{id:string,projectId:string,workflowInstanceId:string,schemaCode:string,appCode:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/projectManage/workflowInstanceFlag",{params});
}

export const getProfessionalTask:(params:{projectId:string,appCode:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/projectManage/getProfessionalTask",{params});
}

export const getTaskSheetStandardLibraryList:(params:{pid:string,appCode:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/projectManage/getTaskSheetStandardLibraryList",{params});
}

export const createDesignTask:(params:{projectId:string,appCode:string,professionalTask:string,id:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/projectManage/createDesignTask",{params});
}

export const getPermissionById:(params:{id:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/getPermissionById",{params});
}

export const validateDigitalDelivery:(params:{id:string,uname:string,key:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/validateDigitalDelivery",{params});
}

/*常用回复语*/
export const getCommonReplys:(params:{appCode:string,schemaCode:string,type:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/systemManage/getCommonReplys",{params});
}

/*常用回复语删除*/
export const deleteCommonReply:(params:{appCode:string,id:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/public/deleteCommonReply",{params});
}

/*常用意见弹窗列表查询*/
export const queryMyReplyTemplates:(params:{appCode:string,id:string,pageNum:number,pageSize:number})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/public/queryMyReplyTemplates",{params});
}

/*常用意见弹窗列表删除意见*/
export const deleteMyReplyTemplate:(params:{appCode:string,ids:Array<any>,type:string,})=>Promise<HttpResponse<any> > =params=>{
  return Axios.post("/api/xtsjProject/public/deleteMyReplyTemplate",params);
}

/*常用意见弹窗列表新增*/
export const addMyReplyTemplates:(params:{appCode:string,id:string,commonReply:Array<any>})=>Promise<HttpResponse<any> > =params=>{
  return Axios.post("/api/xtsjProject/public/addMyReplyTemplates",params);
}
/*移交资料左侧树*/
export const loadDigitalDeliveryTree:(params:{appCode:string,projectId:string,})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/loadDigitalDeliveryTree", {params});
}

/*移交资料列表*/
export const getDeliveryMaterial:(params:{appCode:string,projectId?:string,zyrwdId?:string,taskType?:string,achievementName?:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.get("/api/xtsjProject/designTaskManage/getDeliveryMaterial", {params});
}
//TODO START 交建通小程序+消息对接
//获取真实地址
export const getRealUrl:(params:{appCode:string,param:string;client:string})=>Promise<HttpResponse<any> > =params=>{
  return Axios.post("/api/xtsjProject/systemManage/parseEncodeParam",params);
}
//TODO END
export const exportDesignFile: (params: {
  appCode: string;
  projectId: string;
}) => Promise<HttpResponse<string>> = params => {
  return Axios.post('/api/xtsjProject/designTaskManage/exportDesignFile', params,{responseType:'arraybuffer'})
}
