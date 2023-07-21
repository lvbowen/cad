<template>
  <h3-card
    ref="card"
    :delay="delay"
    v-if="chart.type === 'card'"
    :refresh="refresh"
    :class="[`${prefixCls}__body`]"
    :options="cardInstance"
  >
  </h3-card>
  <List
    ref="list"
    v-else-if="chart.type === 'list'"
    :total="dataTotal"
    :delay="delay"
    :alias="listInstance.alias"
    :datasource="listInstance.data"
    :columns="listInstance.columns"
    :fontColor="listInstance.fontColor"
    :columnsSetting="listInstance.columnsSetting"
    :staticColumn="listInstance.freezeHead.columnNumber"
    :orderNumber="listInstance.orderNumber"
    :freezeHead="listInstance.freezeHead"
    :refresh="refreshListLoading"
    :class="[`${prefixCls}__body`]"
    @changePage="refreshListData"
    @change-columns="changeColumns"
    @drill-down="drillDown"
  >
  </List>
  <Chart
    ref="chart"
    :delay="delay"
    v-else-if="chart.type !== 'table'"
    :refresh="true"
    :class="[`${prefixCls}__body`]"
    :options="chartInstance"
    :api="api"
    @click="clickChart"
    @refresh-end="refreshEnd"
  />
  <h3-pivot-table
    v-else
    ref="table"
    :delay="delay"
    :class="[`${prefixCls}__body`]"
    :data="tableInstance.data"
    :alias="tableInstance.alias"
    :columns="tableInstance.columns"
    :rows="tableInstance.rows"
    :fontColor="tableInstance.fontColor"
    :metric="tableInstance.metric"
    :isNo="tableInstance.orderNumber.checked"
    :columnsSetting="tableInstance.columnsSetting"
    :fixedColHead="tableInstance.freezeHead.column"
    :fixedRowHead="tableInstance.freezeHead.row"
    :uid="tableInstance.uid"
    :title="tableInstance.title"
    @click="clickChart"
    @change-columns="changeColumns"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Mixins } from "vue-property-decorator";
import Loading from "../loading";
import Chart from "../chart";
import List from "../list";
import H3Card from "../card";
import H3PivotTable from "../pivot-table";
import ChartMixins from "../../mixins/chart-mixins";
import { dashboardApi } from "../../service/dashboard/";

@Component({
  name: "h3-report-chart-wrap",
  components: {
    Chart,
    H3Card,
    Loading,
    H3PivotTable,
    List
  }
})
export default class ReportChartWrap extends Mixins<ChartMixins>(ChartMixins) {
  @Prop({ default: null }) chart!: H3.Report.Chart;
  @Prop({ default: null }) global!: H3.Report.Global;
  @Prop({ default: null }) dataAlias!: { [key: string]: string }[];
  @Prop({ default: null }) data!: any;
  @Prop({ default: null }) source!: H3.Report.MapColumn | null;
  @Prop({ default: 200 }) delay!: number;
  @Prop({ default: 0 }) dataTotal!: number; // 明细表的总条数 其他图表暂时没有
  @Prop({ default: false }) refresh!: boolean;
  @Prop({ default: () => dashboardApi }) api!: H3.ReportAPI.Instance; // 请求实例

  prefixCls = "h3-report-chart";
  defaultListPageOption: H3.List.pageOptions = {
    pageSize: 10, // 页数大小
    pageIndex: 1 // 第几页
  };

  // 明细表局部loading
  refreshListLoading: boolean = false;

  /**
   * 字体颜色对比
   */
  get fontColorSetting() {
    const globalFont = this.global.styles.fontSetting;
    const chartFont = this.chart.styles.fontSetting
      ? this.chart.styles.fontSetting
      : {
          titleColor: null,
          fontColor: null
        };
    return {
      titleColor: chartFont.titleColor || globalFont.titleColor,
      fontColor: chartFont.fontColor || globalFont.fontColor
    };
  }

  /**
   * 获取明细表实例
   */
  get listInstance() {
    let dimension: Array<H3.Report.FieldColumn> = [];
    if (this.chart.data.dimension) {
      dimension = this.chart.data.dimension.filter((item: H3.Report.FieldColumn) => item.type);
    }
    return {
      data: this.data,
      alias: this.dataAlias,
      columns: dimension,
      orderNumber: this.chart.styles.orderNumber || {},
      freezeHead: this.chart.styles.freezeHead || {},
      columnsSetting: this.chart.columnsSetting || [],
      uid: this.chart.uid,
      fontColor: this.fontColorSetting.fontColor
    };
  }
  /**
   * 获取图表实例
   * 后续使用时，改用chartOptions
   */
  get chartInstance() {
    const colors = this.global.styles.theme ? this.global.styles.theme.colors : [];
    let dimension: Array<H3.Report.FieldColumn> = [];
    if (this.chart.data.dimension) {
      dimension = this.chart.data.dimension.filter((item: H3.Report.FieldColumn) => item.type);
    }
    let metric: Array<H3.Report.FieldColumn> = [];
    if (this.chart.data.metric) {
      metric = this.chart.data.metric.filter((item: H3.Report.FieldColumn) => item.type);
    }
    return {
      type: this.chart.type,
      uid: this.chart.uid,
      data: this.data,
      mapSource: this.source,
      dataAlias: this.dataAlias,
      dimension: dimension ? dimension[0] : null,
      groupDimension: dimension ? dimension[1] : null,
      dimensionLimit: this.chart.styles.dimensionLimit,
      metric,
      metricGroup: this.chart.data.metricGroup,
      multiMetricType: this.chart.styles.multiMetricType,
      limit: this.chart.data.limit,
      linkage: this.chart.styles.linkage,
      colors:
        this.chart.styles.theme &&
        this.chart.styles.theme.colors &&
        this.chart.styles.theme.colors.length
          ? this.chart.styles.theme.colors
          : colors,
      direction: this.chart.styles.direction ? this.chart.styles.direction : null,
      metricRange: this.chart.styles.metricRange,
      multiRange: this.chart.styles.multiRange,
      dataLabel: this.chart.styles.dataLabel,
      multipleDataLabel: this.chart.styles.multipleDataLabel,
      legend: this.chart.styles.legend,
      axisX: this.chart.styles.axisX,
      axisYSet: this.chart.styles.axisYSet,
      splitLine: this.chart.styles.splitLine,
      chartSwitch: this.chart.data.chartSwitch,
      warningLine: this.chart.styles.warningLine,
      elementCoat: this.chart.styles.elementCoat,
      fontColor: this.fontColorSetting.fontColor,
      DataZoom: this.chart.styles.dataZoom,
      mapDrill: this.chart.styles.mapDrill,
      mapArea: this.chart.data.mapArea,
      mapTheme: this.chart.styles.mapTheme,
      mapDigitalSet: this.chart.styles.mapDigitalSet
    };
  }
  /**
   * 图表加载完
   */
  refreshEnd() {
    this.$emit("refresh-end");
  }
  /**
   * 获取图表实例
   */
  get cardInstance() {
    return {
      data: this.data,
      dataAlias: this.dataAlias,
      dimension: this.chart.data.dimension ? this.chart.data.dimension[0] : null,
      metric: this.chart.data.metric ? this.chart.data.metric[0] : null,
      limit: this.chart.data.limit,
      fontColor: this.fontColorSetting.fontColor
    };
  }
  /**
   * 下钻
   */
  drillDown(data) {
    this.$emit("drill-down", data);
  }
  /**
   * 获取表格实例
   */
  get tableInstance() {
    let dimension: Array<H3.Report.FieldColumn> = [];
    if (this.chart.data.dimension) {
      dimension = this.chart.data.dimension.filter((item: H3.Report.FieldColumn) => item.type);
    }
    let groupDimension: Array<H3.Report.FieldColumn> = [];
    if (this.chart.data.groupDimension) {
      groupDimension = this.chart.data.groupDimension.filter(
        (item: H3.Report.FieldColumn) => item.type
      );
    }
    let metric: Array<H3.Report.FieldColumn> = [];
    if (this.chart.data.metric) {
      metric = this.chart.data.metric.filter((item: H3.Report.FieldColumn) => item.type);
    }
    return {
      data: this.data,
      alias: this.dataAlias,
      columns: dimension,
      rows: groupDimension,
      metric,
      orderNumber: this.chart.styles.orderNumber || {},
      freezeHead: this.chart.styles.freezeHead || {},
      columnsSetting: this.chart.columnsSetting || [],
      uid: this.chart.uid,
      title: this.chart.title,
      fontColor: this.fontColorSetting.fontColor
    };
  }
  /**
   * 图表点击
   * @param option  { filters, params }
   */
  clickChart(option: { filters: Array<H3.Report.FieldColumn>; params: any }) {
    if (this.chart.type === "map" && option.params && option.params.data) {
      let data = option.params.data;
      let obj = {
        mapDrill: data
      };
      if (data.code && data.code.slice(4, 6) === "00") {
        this.refreshMapData(obj);
      }
    }
    this.$emit("click-chart", option);
  }
  /**
   * 刷新地图数据
   */
  refreshMapData(params) {
    this.$emit("load-chart-data", {
      isLoading: true, // 需要loading更新
      params,
      callback: () => {}
    });
  }
  /**
   * 刷新明细表分页数据
   */
  refreshListData(params) {
    this.defaultListPageOption = params;
    this.refreshListLoading = true;
    this.$emit("load-chart-data", {
      isLoading: false,
      params,
      callback: () => {
        this.refreshListLoading = false;
      }
    });
  }
  /**
   * 明细表/透视表 列宽更改
   */
  changeColumns(options) {
    this.chart.columnsSetting = options;
    this.$emit("change", this.chart);
  }
  /**
   * 刷新图表视图样式
   */
  refreshViewStyles() {
    if (this.$refs.chart) {
      (this.$refs.chart as any).refreshChartStyles();
    }
    if (this.$refs.table) {
      (this.$refs.table as any).refreshTable();
    }
  }
  /**
   * 刷新图表视图
   */
  refreshChartView() {
    const chart: any = this.$refs.chart as Vue;
    const table: any = this.$refs.table as Vue;
    const card: any = this.$refs.card as Vue;
    const list: any = this.$refs.list as Vue;
    if (chart) {
      chart.delayInitChart();
    } else if (table) {
      (this.$refs.table as any).initTableData();
    } else if (card) {
      (this.$refs.card as any).initCard();
    } else if (list) {
      (this.$refs.list as any).initList();
    }
  }
}
</script>
