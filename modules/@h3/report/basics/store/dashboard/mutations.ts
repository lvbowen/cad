import Vue from "vue";
import { MutationTree } from "vuex";
import { ReportProState } from ".";
import { ReportMutation } from "./types";
import ProChartModules from "../../instance/element-modules/dashboard";
import { dashboardApi } from "@h3/report/basics/service/dashboard/index";

const mutations: MutationTree<ReportProState> = {
  /**
   * 初始化报表数据
   * @param state
   */
  [ReportMutation.INITREPORT](state) {
    Object.assign(state, new ReportProState());
  },
  /**
   * 设置仪表盘标题
   * @param state
   * @param title
   */
  [ReportMutation.SETREPORTTITLE](state, title: string) {
    state.title = title;
  },
  /**
   * 设置仪表盘Top
   * @param state
   * @param top
   */
  [ReportMutation.SETREPORTTOP](state, top: number) {
    state.reportTop = top;
  },
  /**
   * 设置仪表盘图表
   * @param state
   * @param charts
   */
  [ReportMutation.SETCHARTS](state, charts: Array<H3.Report.Chart>) {
    state.charts = charts;
  },
  /**
   * 设置仪表盘全局设置
   * @param state
   * @param global
   */
  [ReportMutation.SETGLOBAL](state, global: H3.Report.Global) {
    state.global = global;
  },
  /**
   * 设置仪表盘objectId
   * @param state
   * @param objectId
   */
  [ReportMutation.SETOBJECTID](state, objectId: string) {
    state.objectId = objectId;
  },
  /**
   * 设置标题
   * @param state
   * @param title
   */
  [ReportMutation.SETTITLE](state, title: string) {
    state.title = title;
  },
  /**
   * 删除指标触发事件
   * @param state
   * @param activeChart
   */
  [ReportMutation.DELETEMETRIC](state, activeChart: H3.Report.Chart) {
    // 删除指标，需要更新警戒线配置属性
    state.activeChart = activeChart;
    const warningLine = state.activeChart.styles.warningLine;
    let metric: H3.Report.FieldColumn | undefined;
    if (state.activeChart && warningLine) {
      warningLine.forEach((item: H3.Report.WarningLine, index: number) => {
        // 判断删除最后一个指标的情况
        if ((state.activeChart as any).data.metric.length > 0) {
          metric = (state.activeChart as any).data.metric.find((oMetric: H3.Report.FieldColumn) => {
            if (item.field === oMetric.uid) return true;
            return false;
          });
          if (metric === undefined) {
            delete (state.activeChart as any).styles.warningLine[index];
          }
        } else {
          delete (state.activeChart as any).styles.warningLine[index];
        }
      });
      // 过滤underfined值
      (state.activeChart as any).styles.warningLine = (state.activeChart as any).styles.warningLine.filter(
        item => item !== undefined
      );
    }
  },
  /**
   * 设置激活的图表
   * @param state
   * @param activeChart
   */
  [ReportMutation.SETACTIVECHART](state, activeChart: H3.Report.Chart) {
    state.activeChart = activeChart;
    state.activeModules = !activeChart || ProChartModules(activeChart);
    return state.activeChart;
  },
  /**
   * 清空激活的图表
   * @param state
   */
  [ReportMutation.CLEARACTIVECHART](state) {
    state.activeChart = null;
  },
  /**
   * 处理排序字段
   * （如果其他字段变更，查找排序字段是否存在，不存在就删除）
   * @param state
   * @param chart
   */
  [ReportMutation.HANDLESORT](state, chart: H3.Report.Chart) {
    if (state.activeChart && state.activeChart.data.sort && state.activeChart.data.sort.length) {
      const sortArr = state.activeChart.data.sort;
      let objArr: Array<H3.Report.FieldColumn> = [];
      if (state.activeChart.data.dimension) {
        objArr = objArr.concat(state.activeChart.data.dimension);
      }
      if (state.activeChart.data.groupDimension) {
        objArr = objArr.concat(state.activeChart.data.groupDimension);
      }
      if (state.activeChart.data.metric) {
        objArr = objArr.concat(state.activeChart.data.metric);
      }
      if (state.activeChart.data.metricGroup) {
        const metrics: Array<H3.Report.FieldColumn> = [];
        state.activeChart.data.metricGroup.forEach(m => {
          metrics.push(...m);
        });
        objArr = objArr.concat(metrics);
      }

      sortArr.forEach((sort: H3.Report.FieldColumn, index: number) => {
        const objIndex = objArr.findIndex(
          (obj: H3.Report.FieldColumn) =>
            obj.uid === sort.uid && obj.schemaCode === sort.schemaCode && obj.field === sort.field
        );
        if (objIndex < 0) {
          sortArr.splice(index, 1);
        } else {
          objArr[objIndex].options.order = sortArr[index].options.order;
          sortArr.splice(index, 1, objArr[objIndex]);
        }
      });
      // 解决二维一指标切换顺序的排序问题
      // if (state.activeChart.type !== 'list' && sortArr.length > 1) {
      //   sortArr.sort((last, current) => {
      //     let lastIndex: number = objArr.findIndex(i => i.uid === last.uid) || 0;
      //     let currentIndex: number = objArr.findIndex(i => i.uid === current.uid) || 0;
      //     return lastIndex - currentIndex;
      //   });
      //
      // }
    }
  },
  /**
   * 设置新增拖动的图表
   * @param state
   * @param chart
   */
  [ReportMutation.SETDRAGCHART](state, chart: H3.Report.Chart) {
    state.dragChart = chart;
  },
  /**
   * 保存上一次数据源ID
   * @param state
   * @param lastDataSourceNode
   */
  [ReportMutation.SETLASTDATASOURCE](state, lastDataSourceNode) {
    state.lastDataSourceNode = lastDataSourceNode;
  },
  /**
   * 设置拖动的字段
   * @param state
   * @param field
   */
  [ReportMutation.SETDRAGFIELD](state, field: H3.Report.FieldColumn) {
    state.dragField = field;
  },
  /**
   * 清空图表关系
   * @param state
   * @param chart
   */
  [ReportMutation.CLEARCHARTRELATION](state, chart) {
    let uid;
    let chartIds;
    let oldDataSources;
    const dataSources = new Set();
    let difSourceId;
    const tmpDataSource = {
      dataSourceId: "",
      field: null
    };
    // 清空图表联动关系
    if (chart.styles && chart.styles.linkage) {
      chart.styles.linkage = [];
    }
    state.charts.forEach((item: any) => {
      if (item.styles && item.styles.linkage) {
        uid = item.styles.linkage.filter((param: any) => param !== chart.uid);
        item.styles.linkage = uid;
      }
      // 变更筛选联动关系
      if (item.type === "filterPicker" && item.chartIds.includes(chart.uid)) {
        chartIds = item.chartIds.filter((param: string) =>
          state.charts.find((data: any) => data.uid === param)
        );
        chartIds
          .map((chartId: string) => state.charts.find((param: any) => param.uid === chartId))
          .forEach(data => {
            if (data.dataSourceId) dataSources.add(data.dataSourceId);
          });
        oldDataSources = new Set(
          item.dataSources.map((param: H3.Report.FilterDataSource) => param.dataSourceId)
        );
        // 减少数据源时，删除差集的数据源；
        if (oldDataSources.size > dataSources.size) {
          difSourceId = Array.from(oldDataSources).find(data => !dataSources.has(data));
          const tmpChart = state.charts.find(
            (data: any) => data.dataSourceId === chart.dataSourceId && data.uid !== chart.uid
          );
          if (tmpChart) {
            chart.filterPicker = (tmpChart as any).filterPicker;
          }
          item.dataSources.splice(
            item.dataSources.findIndex(data => data.dataSourceId === difSourceId),
            1
          );
        } else if (oldDataSources.size === dataSources.size) {
          difSourceId = Array.from(oldDataSources).find(data => !dataSources.has(data));
          if (difSourceId) {
            tmpDataSource.dataSourceId = chart.dataSourceId;
            chart.filterPicker = [];
            // 更改数据源时，替换当前字段，如果更改第一个，清空所有
            if (item.dataSources.findIndex(data => data.dataSourceId === difSourceId) === 0) {
              item.dataSources.forEach((data: any) => {
                data.field = null;
              });
            }
            item.dataSources.splice(
              item.dataSources.findIndex(data => data.dataSourceId === difSourceId),
              1,
              tmpDataSource
            );
          }
        } else {
          // 新增数据源， 新增字段
          difSourceId = Array.from(dataSources).find(data => !oldDataSources.has(data));
          if (difSourceId) {
            tmpDataSource.dataSourceId = chart.dataSourceId;
            tmpDataSource.dataSourceId = difSourceId;
            item.dataSources.push(tmpDataSource);
          }
        }
        item.chartIds = chartIds;
      }
    });
  },
  /**
   * 设置报表服务配置项
   * @param state
   * @param field
   */
  [ReportMutation.SETREPORTOPTIONS](state, { corpId, reportId, config, integrate }) {
    if (corpId) {
      state.corpId = corpId;
    }
    if (reportId) {
      state.objectId = reportId;
    }
    state.config = config;
    state.integrateComponent = integrate;
    dashboardApi.setConfig({ corpId, config });
  },
  /**
   * 更新图表视图
   * @param state
   * @param field
   */
  [ReportMutation.RESIZECHARTVIEW](state, { chart, type }) {
    const chartId = typeof chart === "string" ? chart : chart.uid;
    const viewStatus: any = state.chartViewStatus[chartId];
    if (!viewStatus) return;
    const fun: Function | undefined = viewStatus[type];
    if (fun instanceof Function) {
      viewStatus[type]();
    }
  },
  [ReportMutation.SETNUMBERFORMAT](state, { numberFormat, metricIndex, groupIndex }) {
    if (state.activeChart) {
      if (state.activeChart.type === "list") {
        // 明细表只有dimension
        state.activeChart.data.dimension[metricIndex].options.numberFormat = numberFormat;
      } else if (state.activeChart.type === "biax") {
        // 双轴图的数据是在metricGroup中处理
        state.activeChart.data.metricGroup[groupIndex][
          metricIndex
        ].options.numberFormat = numberFormat;
      } else {
        state.activeChart.data.metric[metricIndex].options.numberFormat = numberFormat;
      }
    }
  },
  /**
   * 设置结果筛选器
   * @param state
   * @param metricIndex 字段index
   * @param resultFilter 结果筛选器的数据
   */
  [ReportMutation.SETRESULTFILTER](state, { resultFilter, metricIndex, groupIndex }) {
    if (state.activeChart) {
      if (state.activeChart.type === "list") {
        // 明细表只有dimension
        state.activeChart.data.dimension[metricIndex].options.resultFilter = resultFilter;
      } else if (state.activeChart.type === "biax") {
        // 双轴图的数据是在metricGroup中处理
        state.activeChart.data.metricGroup[groupIndex][
          metricIndex
        ].options.resultFilter = resultFilter;
      } else {
        state.activeChart.data.metric[metricIndex].options.resultFilter = resultFilter;
      }
    }
  },
  /**
   * 设置结果筛选器
   * @param state
   * @param metricIndex 字段index
   * @param resultFilter 结果筛选器的数据
   */
  [ReportMutation.SETDATEFORMAT](state, { dateFormat, dimensionIndex }) {
    if (state.activeChart) {
      if (state.activeChart.type === "list") {
        state.activeChart.data.dimension[dimensionIndex].options.dateFormat = dateFormat;
      }
    }
  },
  /**
   * 设置导出透视表预处理数据
   * @param state
   * @param field
   */
  [ReportMutation.SETTABLEEXPORTDATA](state, { uid, data }) {
    state.tableExportData[uid] = data;
  },
  /**
   * 设置图表数据
   * @param state
   * @param key
   * @param data
   */
  [ReportMutation.SETCHARTSDATA](state, { key, data }) {
    Vue.set(state.chartsData, key, data);
  },
  /**
   * 设置是否显示高级数据源
   * @param state
   * @param data
   */
  [ReportMutation.SETADVANCEDATASOURCE](state, data) {
    state.showAdvancedDataSource = data;
  }
};

export default mutations;
