import { ActionTree } from "vuex";
import { ReportProState } from ".";
import { dashboardApi } from "@h3/report/basics/service/dashboard/index";
import { ReportAction, ReportMutation } from "./types";
import InitGlobal from "../../instance/modules/global";
import { handleSchemaModal } from "./help";
import { guid } from "../../utils/uid";
import { dateCNFormat } from "../../utils/date";
import { ElementType } from "@h3/report/basics/enum/chart-type";
import { ReportState } from "@h3/report/basics/enum/report-state";
import {
  handleChartFieldDefaultValues,
  registerElement,
  handleReportResponse
} from "../utils/help";

const loadReportList: any = {};

const actions: ActionTree<ReportProState, ReportProState> = {
  /**
   * 保存报表
   * @param commit
   * @param state
   * @param chartType
   */
  async [ReportAction.SAVEREPORT]({ commit, dispatch, state }) {
    const charts: Array<any> = [];
    const filterPickers: Array<H3.Report.FilterPicker> = [];
    if (!state.title) {
      state.title = "未命名的仪表盘";
    }
    state.charts.forEach((chart: H3.Report.Chart) => {
      if (chart.type === ElementType.FILTERPICKER) {
        filterPickers.push(chart as any);
      }
      chart.handleActive = false;
      delete chart.linkageFilter;
      delete chart.filterPicker;
      // 明细表的分页信息 不保存
      // delete chart.pageSize;
      delete chart.pageIndex;
      delete chart.mapSource;
      if (chart.edit) chart.edit = false;
      charts.push({
        uuid: chart.uid,
        content: JSON.stringify(chart),
        corpId: state.corpId,
        objectId: state.objectId
      });
    });
    const report: H3.Report.Report = {
      objectId: state.objectId,
      title: state.title,
      attributes: "{}",
      charts,
      global: JSON.stringify(state.global)
    };
    filterPickers.forEach((filterPicker: H3.Report.FilterPicker) => {
      dispatch(ReportAction.SETFILTERPICKER, { filterPicker, isRefresh: false });
    });
    return dashboardApi.saveReport(report);
  },

  /**
   * 新增元件
   * @param commit
   * @param state
   * @param elementType 元件类型
   * @param oldElement 旧的元件（是否需要使用旧元件数据）
   */
  [ReportAction.ADDELEMENT]({ commit, state }, { elementType, oldElement }) {
    return registerElement(elementType, oldElement);
  },
  /**
   * 获取仪表盘配置信息
   * @param commit
   * @param dispatch
   * @param state
   * @param corpId
   * @param reportId
   * @param type
   */
  async [ReportAction.GETREPORT]({ commit, dispatch, state }, { corpId, reportId, type }) {
    if (reportId) {
      return new Promise((resolve, reject) => {
        loadReportList[reportId] = loadReportList[reportId] || [];
        dashboardApi.setConfig({ corpId });
        dashboardApi
          .getReport(corpId, reportId)
          .then((res: H3.DashboardAPI.ReportData) => {
            const {
              title,
              objectId,
              elements,
              reqGlobal,
              schemaCodes,
              filterPickers
            } = handleReportResponse(res);
            const { global, modules } = InitGlobal(
              (JSON.parse(reqGlobal as string) as H3.Report.Global) ||
                (JSON.parse(JSON.stringify(state.global)) as H3.Report.Global)
            );
            elements.forEach(element => {
              state.chartViewStatus[element.uid] = state.chartViewStatus[element.uid] || {};
            });
            filterPickers.forEach((filterPicker: H3.Report.FilterPicker) => {
              dispatch(ReportAction.SETFILTERPICKER, { filterPicker, charts: elements });
            });
            state.globalModules = modules;
            state.global = global;
            state.reports[reportId] = {
              elements,
              global
            };
            // 处理请求之后的⌚️
            const handleLoaded = () => {
              //判断当前加载的报表配置信息是否被多个单例图表引用，如果引用调用回调函数执行方法
              while (loadReportList[reportId] && loadReportList[reportId].length) {
                loadReportList[reportId].shift()(state.reports[reportId]);
              }
              delete loadReportList[reportId];
              handleChartFieldDefaultValues(elements, state.dataSources);
              state.reports[reportId] = {
                elements,
                global
              };
              state.title = title;
              state.objectId = objectId;
              state.charts.push(...elements);
              resolve(state.reports[reportId]);
            };
            if (Object.values(schemaCodes).length) {
              dispatch(ReportAction.LOADDATASOURCE, Object.values(schemaCodes))
                .then(() => {
                  handleLoaded();
                })
                .catch(() => {
                  reject(false);
                });
            } else {
              handleLoaded();
            }
          })
          .catch(res => {
            console.log("catch", res, loadReportList[reportId]);
            if (loadReportList[reportId]) {
              loadReportList[reportId] = null;
            }
            reject(res);
          });
      });
    } else {
      state.title = "未命名的仪表盘";
      state.objectId = `u${guid()}`.replace(/-/gi, "");
      return null;
    }
  },
  /**
   * 获取仪表盘明细
   * @param commit
   * @param dispatch
   * @param state
   * @param corpId
   * @param reportId
   * @param type
   */
  async [ReportAction.GETREPORTDETAIL](
    { commit, dispatch, state },
    { corpId, reportId, type = ReportState.DESIGN }
  ) {
    let res;
    // 判断是否有加载完毕的报表配置
    if (state.reports[reportId]) {
      res = state.reports[reportId];
    }
    // 判断是否有加载中的报表配置
    else if (loadReportList[reportId]) {
      return new Promise<any>((resolve, reject) => {
        loadReportList[reportId].push(resolve);
      });
    } else {
      return new Promise<any>((resolve, reject) => {
        dispatch(ReportAction.GETREPORT, { corpId, reportId, type })
          .then(result => {
            resolve(result);
          })
          .catch(() => {
            resolve(false);
          });
      });
    }
    return res;
  },
  /**
   * 获取数据源列表
   * @param state
   * @param dispatch
   * @param corpId
   */
  async [ReportAction.GETDATASOURCELIST]({ dispatch, state }) {
    if (!state.dataSourceList) {
      await dashboardApi
        .getDataSourceList()
        .then((res: Array<H3.DashboardAPI.DataSourceNode>) => {
          state.dataSourceList = res;
        })
        .catch(() => {
          state.dataSourceList = [];
        });
    }
    return state.dataSourceList;
  },
  /**
   * 获取数据源
   * @param state
   * @param dispatch
   * @param chart
   */
  async [ReportAction.GETDATASOURCE]({ dispatch, state }, chart: H3.Report.Chart) {
    if (chart.dataSourceId) {
      if (!state.dataSources[chart.dataSourceId]) {
        await dispatch(ReportAction.LOADDATASOURCE, [
          {
            dataSourceId: chart.dataSourceId,
            useType: chart.useType
          }
        ]);
      }
      return state.dataSources[chart.dataSourceId];
    }
    return null;
  },
  /**
   * 获取数据源
   * @param state
   * @param dispatch
   * @param dataSourceIds
   */
  async [ReportAction.LOADDATASOURCE]({ dispatch, state }, dataSourceIds: Array<string>) {
    return new Promise<any>((resolve, reject) => {
      dashboardApi
        .getDataSource(dataSourceIds)
        .then((res: Array<H3.DashboardAPI.SchemaModel>) => {
          res.forEach((schema: H3.ReportAPI.SchemaModel) => {
            state.dataSources[schema.schema.dataSourceId] = {
              dataSourceId: schema.schema.dataSourceId,
              displayName: schema.schema.displayName,
              properties: handleSchemaModal(schema)
            };
          });
          resolve(true);
        })
        .catch(res => {
          reject(res.code);
        });
    });
  },
  /**
   * 设置图表联动
   * @param state
   * @param dispatch
   * @param chart
   * @param filters H3.Report.FilterFieldColumn
   * @param mode  params: linkage clear
   */
  [ReportAction.SETCHARTLINKAGE](
    { commit, dispatch, state },
    { chart, filters = [], mode = "linkage" }
  ) {
    let res = false;
    if (mode === "linkage") {
      state.linkage[chart.uid] = "filters";
      res = true;
    } else {
      if (state.linkage[chart.uid]) {
        delete state.linkage[chart.uid];
        res = true;
      }
    }
    filters.forEach((filter: H3.Report.FilterFieldColumn) => {
      if (filter.field.type == "date") {
        filter.text = dateCNFormat(filter.text[0]);
        filter.formula = "Range";
      }
    });
    if (res) {
      state.charts.forEach((linkageChart: H3.Report.Chart) => {
        if (chart.styles.linkage.includes(linkageChart.uid)) {
          linkageChart.linkageFilter = filters;
          commit(ReportMutation.RESIZECHARTVIEW, { chart: linkageChart, type: "data" });
        }
      });
    }
    return res || false;
  },
  /**
   * 设置筛选器
   * @param dispatch
   * @param state
   * @param filterPicker
   * @param charts
   */
  [ReportAction.SETFILTERPICKER](
    { commit, state },
    { filterPicker, charts = state.charts, isRefresh = true }
  ) {
    const filters: { [dataSoureId: string]: Array<H3.Report.FilterFieldColumn> } = {};
    // 获取每个源的筛选字段
    filterPicker.dataSources.forEach((filterDataSource: any) => {
      if (filterDataSource.field) {
        filters[filterDataSource.dataSourceId] = filters[filterDataSource.dataSourceId] || [];
        if (
          ["None", "NotNone"].includes(filterPicker.formula) ||
          (filterPicker.formula === "Range" && filterPicker.text[0] && filterPicker.text[1]) ||
          (filterPicker.formula !== "Range" && filterPicker.text[0])
        ) {
          filters[filterDataSource.dataSourceId].push({
            field: filterDataSource.field,
            formula: filterPicker.formula,
            text:
              filterPicker.text[0] && filterPicker.text[0] instanceof Object
                ? filterPicker.text.map(item => item.value)
                : filterPicker.text
          });
        }
      }
    });
    // 设置每个图表对应源的过滤字段
    filterPicker.chartIds.forEach((chartId: string) => {
      const chart = charts.find((item: H3.Report.Chart) => item.uid === chartId) as H3.Report.Chart;
      if (chart && !chart.filterPicker) {
        chart.filterPicker = {};
      }
      if (chart && chart.filterPicker) {
        chart.filterPicker[filterPicker.uid] = chart.dataSourceId
          ? filters[chart.dataSourceId]
            ? filters[chart.dataSourceId]
            : []
          : [];
        if (isRefresh) {
          commit(ReportMutation.RESIZECHARTVIEW, { chart, type: "data" });
        }
      }
    });
  },
  /**
   * 删除筛选器条件
   * @param dispatch
   * @param state
   * @param filterPicker
   */
  [ReportAction.REMOVEFILTERPICKER]({ commit, state }, filterPicker: H3.Report.FilterPicker) {
    filterPicker.chartIds.forEach((chartId: string) => {
      const chart = state.charts.find(
        (item: H3.Report.Chart) => item.uid === chartId
      ) as H3.Report.Chart;
      if (chart && chart.filterPicker) {
        if (chart.filterPicker[filterPicker.uid] && chart.filterPicker[filterPicker.uid].length) {
          chart.filterPicker[filterPicker.uid] = [];
          commit(ReportMutation.RESIZECHARTVIEW, { chart, type: "data" });
        }
      }
    });
  }
};

export default actions;
