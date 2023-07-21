import Vue from "vue";
import Vuex from "vuex";
import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";
import initGlobal from "@h3/report/basics/instance/modules/global";
Vue.use(Vuex);

export class ReportProState implements H3.Report.ReportProState {
  corpId = "";
  title = "";
  reportTop = 0;
  activeChart: H3.Report.Chart | null = null;
  activeModules: H3.ReportModules.ChartModules | null = null; // 当前激活的图表模块
  chartsAlias: { [key: string]: { [key: string]: string } } = {};
  chartsData: { [key: string]: Array<any> } = {};
  objectId: string = "";
  reports: any = {};
  charts: Array<H3.Report.BaseElement> = [];
  global: H3.Report.Global = initGlobal({
    styles: {}
  } as any).global;
  globalModules: H3.ReportModules.GlobalModules = {
    styles: {}
  };
  globalFilters: Array<H3.Report.FilterFieldColumn> = [];
  dragChart: H3.Report.Chart | null = null;
  dragField: H3.Report.FieldColumn | null = null;
  dataSources: { [dataSourceId: string]: H3.Report.DataSource } = {};
  dataSourceList: Array<H3.ReportAPI.DataSourceNode> | null = null;
  config: any = {};
  integrateComponent: Function | null = null;
  linkage: any = {};
  chartViewStatus: { [chartUuid: string]: any } = {}; // 图表视图更新状态
  lastDataSourceNode: H3.ReportAPI.DataSourceNode | null = null; // 记录上一次选择数据源的Node
  tableExportData: { [chartUuid: string]: any } = {}; // 透视表导出预处理数据
  showAdvancedDataSource: boolean = false; // 是否显示高级数据源
}
const state = new ReportProState();

export let reportState = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};

/**
 * 获取新的状态
 * @param clone 是否需要克隆到reportState
 */
export function getNewReportState(clone = true) {
  const state = {
    namespaced: true,
    state: new ReportProState(),
    mutations,
    actions,
    getters
  };
  if (clone) reportState = state;
  return state;
}
