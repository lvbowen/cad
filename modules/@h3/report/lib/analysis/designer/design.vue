<template>
  <div :class="prefixCls">
    <!-- 设计器头部 -->
    <design-head
      v-if="innerChart"
      ref="designHead"
      :chart="innerChart"
      :status="status"
      :editTitle="editTitle"
      :toolOptions="toolOptions"
      @remove="remove"
      @edit="edit"
      @back="back($event)"
      @save="save"
    />
    <div :class="`${prefixCls}__body`" v-if="innerChart">
      <!-- 图表展示组件 -->
      <chart-detail
        v-if="refreshChart"
        :chart="innerChart"
        :class="chartDetailClass"
        :moduleState="status"
        @change-columns="changeColumns"
      >
        <ChartType
          slot="head"
          :chart="innerChart"
          v-if="showModules"
        ></ChartType>
      </chart-detail>
      <!-- 图表模块区 -->
      <transition name="slide-fade">
        <design-modules
          v-if="showModules"
          :chart="innerChart"
          :modules="innerChartModules"
        />
      </transition>
      <!-- 展示区swipper -->
      <design-swiper
        v-if="showSwiper"
        @last="last"
        @next="next"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins, Inject, Provide } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { message } from "@h3/antd-vue";
import Swiper from "../component/swiper/index";
import Head from "../business/head";
import DesignModules from "../business/design-modules";
import ChartDetail from "../business/chart-detail";
import { ModuleState } from "@h3/report/basics/enum/module-state";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/analysis/types";
import Transition from "@h3/report/basics/mixins/transition-mixins";
import ChartModules from "@h3/report/basics/instance/element-modules/analysis";
import { getBaseModules } from "@h3/report/basics/instance/help/getModules";
import ChartType from "../modules/chart-type/index";
import RoleMixin from "../mixins/role-mixins";
import { handleLinkage } from "../help/handleLinkage";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-design",
  components: {
    ChartDetail,
    ChartType,
    DesignModules,
    DesignSwiper: Swiper,
    DesignHead: Head
  }
})
export default class DesignWrap extends Mixins(Transition, RoleMixin) {
  // 图表实例
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  // 图表数据实例
  @Prop({ default: () => [] }) charts!: Array<H3.Report.Chart>;

  @Analysis.State("dataSources") dataSources!: { [dataSourceId: string]: H3.Report.DataSource };
  @Analysis.State("dataSourceId") dataSourceId!: string;
  @Analysis.Action(ReportAction.LOADDATASOURCE) loadDataSource!: Function; // 保存统计分析配置信息
  @Analysis.Action(ReportAction.SAVECHART) saveChart!: Function; // 保存报表
  @Analysis.Action(ReportAction.UPDATECHART) updateChart!: Function; // 更新图表实例
  @Analysis.Action(ReportAction.ADDCHART) addChart!: Function; // 新增报表
  @Analysis.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function; // 设置当前激活图表
  @Analysis.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function; // 刷新
  @Analysis.Mutation(ReportMutation.RESETACTIVECHART) reSetActiveChart!: Function; // 为保存的时候返回重置图表信息

  // 设置激活模块
  @Inject() setActiveStatus!: Function;
  // 主样式名
  prefixCls: string = "h3-analysis-design";
  // 记录上一次的状态
  lastStatus: ModuleState = ModuleState.VIEW;
  // 内部图表势力
  innerChartModules = {};
  // 是否开启展示上一个下一个图表的动画
  showNextChart: boolean = false;
  showLastChart: boolean = false;
  // 重新加载图表 todo 后期优化
  refreshChart: boolean = true;
  // 保存刷新的标识
  saveRefresh: boolean = false;
  // 防抖
  timer: any = null;

  innerChart: H3.Report.Chart = this.chart;
  /**
   * 更新返回刷新状态
   */
  @Provide()
  updateRefreshStatus(isRefresh: boolean) {
    this.saveRefresh = isRefresh;
  }
  // 是否显示模块
  get showModules() {
    return this.status === ModuleState.DESIGN && !!this.innerChart;
  }

  // 是否左右滑动
  get showSwiper() {
    return this.status === ModuleState.PREVIEW && this.charts && this.charts.length > 1;
  }

  // 获取当前图表的
  get currentIndex() {
    return this.charts && this.innerChart && this.showSwiper
      ? this.charts.findIndex(i => this.innerChart && i.uid === this.innerChart.uid)
      : 0;
  }

  // 动态的获取当前的图表详情样式
  get chartDetailClass() {
    return {
      "h3-analysis-chart-detail--edit": this.showModules,
      "h3-report-slide-right": this.showNextChart,
      "h3-report-slide-left": this.showLastChart
    };
  }

  /**
   * 联动
   */
  @Provide()
  async onModulesChange(chart, moduleKey: string, value) {
    let oldChart = JSON.parse(JSON.stringify(chart));

    // data联动，一般会重新进行请求
    if (chart && chart.data.hasOwnProperty(moduleKey)) {
      chart.data[moduleKey] = value;
      handleLinkage(oldChart, chart, moduleKey, value);
      this.setActiveChartModules(chart, moduleKey);
      this.resizeChartView({ chartId: chart.uid, type: "data" });

      // 样式联动，一般只刷新图表
    } else if (chart && chart.styles.hasOwnProperty(moduleKey)) {
      chart.styles[moduleKey] = value;
      handleLinkage(oldChart, chart, moduleKey, value);

      this.setActiveChartModules(chart, moduleKey);
      this.resizeChartView({ chartId: chart.uid, type: "view" });

      // 图表类型联动切换
    } else if (chart && chart.hasOwnProperty(moduleKey)) {
      chart[moduleKey] = value;
      this.updateChart({
        elementType: value,
        oldElement: chart
      }).then(() => {
        handleLinkage(oldChart, chart, moduleKey, value);
        this.setActiveChartModules(chart);
      });
      this.resizeChartView({ chartId: chart.uid, type: "data" });
    }
    console.log(chart, module, moduleKey, value);
  }

  /**
   * 返回上一个状态
   */
  back(refresh: boolean) {
    this.setActiveStatus(this.lastStatus);
    // 如果返回到展示器,重置当前激活图表
    if (this.lastStatus === ModuleState.VIEW) {
      this.$emit("back", refresh || this.saveRefresh);
      setTimeout(() => {
        this.setActiveChartModules(null);
      }, 500);
    }
    // 如果是从预览状态返回 则下一次返回需要返回到展示器
    if (this.lastStatus === ModuleState.PREVIEW) {
      // 刷新滚动条
      this.resizeChartView({ chartId: this.chart.uid, type: "view" });
      // 如果没有保存的话需要将图表还原成备份
      this.lastStatus = ModuleState.VIEW;
      this.reSetActiveChart();
    }
  }
  /**
   * 保存
   */
  save(chart) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.saveChart(chart ? chart : this.innerChart)
        .then(res => {
          this.saveRefresh = true;
          message.success("保存成功");
        })
        .catch(res => {
          message.error("保存失败");
        });
    }, 500);
  }
  /**
   * 编辑
   */
  edit() {
    this.lastStatus = this.status;
    this.setActiveStatus(ModuleState.DESIGN);
    this.resizeChartView({ chartId: this.chart.uid, type: "view" });
  }
  /**
   * 改变列宽
   */
  changeColumns(element) {
    if (this.$refs.designHead) {
      (this.$refs.designHead as any).changeColumns(element);
    }
  }
  /**
   * 删除图表
   */
  remove() {
    // 如果是预览的时候删除图表则轮播到下一个图表 删除到最后一个时 返回到首页
    if (this.status === ModuleState.PREVIEW && this.charts.length > 0) {
      this.next();
    } else {
      this.back(true);
    }
  }
  /**
   * 轮播下一个
   */
  next() {
    this.showNextChart = true;
    setTimeout(() => {
      this.showNextChart = false;
      this.refreshChart = false;
      const activeIndex =
        this.currentIndex + 1 > this.charts.length - 1 ? 0 : this.currentIndex + 1;
      this.setActiveChartModules(this.charts[activeIndex]);
      this.$nextTick(() => {
        this.refreshChart = true;
      });
    }, 500);
  }
  /**
   * 轮播上一个
   */
  last() {
    this.showLastChart = true;
    setTimeout(() => {
      this.showLastChart = false;
      this.refreshChart = false;
      const activeIndex =
        this.currentIndex - 1 > -1 ? this.currentIndex - 1 : this.charts.length - 1;
      this.setActiveChartModules(this.charts[activeIndex]);
      this.$nextTick(() => {
        this.refreshChart = true;
      });
    }, 500);
  }

  /**
   * 当激活图表的时候更新图表模块实例
   */
  setActiveChartModules(chart, moduleKey?: string, value?) {
    this.setActiveChart(chart);
    this.innerChart = chart;
    this.innerChartModules = chart ? getBaseModules(chart.type) : {};
    if (moduleKey) {
      this.innerChartModules[moduleKey] && this.innerChartModules[moduleKey].change
        ? this.innerChartModules[moduleKey].change(chart, this.innerChartModules)
        : null;
    } else {
      Object.keys(this.innerChartModules).forEach(k => {
        this.innerChartModules[k] && this.innerChartModules[k].change
          ? this.innerChartModules[k].change(chart, this.innerChartModules)
          : null;
      });
    }
  }

  async created() {
    // 获取数据源
    if (!Object.keys(this.dataSources).length) {
      // todo 新增loading动画
      await this.loadDataSource();
    }
    // 新增
    if (!this.chart) {
      let newChart = await this.addChart({ elementType: "bar" });
      newChart.dataSourceId = this.dataSourceId;
      this.setActiveChartModules(newChart);
    } else {
      // 编辑
      let tmpChart = JSON.parse(JSON.stringify(this.chart));
      this.updateChart({ elementType: tmpChart.type, oldElement: tmpChart }).then(chart => {
        this.setActiveChartModules(this.chart);
      });
    }
  }

  destoryed() {
    // 动画
    if (this.animations && this.animations.zoomOut) {
      this.animations.zoomOut();
    }
  }
}
</script>
