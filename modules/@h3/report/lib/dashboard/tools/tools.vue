<template>
  <div :class="prefixCls">
    <a-tabs
      class="tab-nav"
      :activeKey="activeKey"
      @change="tabChange"
      v-if="activeChart && activeChart.data"
    >
      <a-tab-pane
        v-for="(item, index) in tabList"
        :key="item.key"
        :tab="item.value"
      >
        <div :class="[`${prefixCls}__wrap`]">
          <!-- <h3-scroll
            ref="scroll"
            :scrollXBtn="false"
            :buttonColor="'rgba(0, 0, 0, 0.45)'"
            :class="[`${prefixCls}__scroll`]"
          > -->
          <template v-for="(module, k) in dataSelect(index)">
            <component
              v-if="module"
              @refreshScroll="refreshScroll"
              :is="`h3-${k}`"
              :key="k"
              :comPrefixCls="'report-modules'"
              :module="module"
              :chart="activeChart"
              :data="getModuleData[k]"
            ></component>
          </template>
          <!-- </h3-scroll> -->
          <div
            v-if="activeKey === 'data'"
            :class="[`${prefixCls}__wrap--help`]"
            @click="onClickHelp"
          >
            详细了解维度、指标和过滤条件
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
    <div :class="[`${prefixCls}__empty`]" v-if="!activeChart">
      <img :src="require(`@h3/report/basics/assets/pro/empty-tool.svg`)" alt=""/>
      <label>请先拖入或选中图表</label>
    </div>

    <help-modal
      v-model="showHelpModal"
      :options="helpOptions"
      :title="helpTitle"
    ></help-modal>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import H3Scroll from "@h3/report/basics/components/scroll";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/dashboard/types";
import HelpModal from "@h3/report/basics/components/help-modal";

import { Input, Tabs } from "@h3/antd-vue";
import Modules from "../modules";

const ReportPro = namespace("report");

@Component({
  name: "h3-report-tools",
  components: {
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ...Modules,
    H3Scroll,
    HelpModal
  }
})
export default class ReportAttributes extends Vue {
  @ReportPro.State("global") global!: H3.Report.Global;
  @ReportPro.State("schemas") schemas!: Array<H3.Report.FieldColumn>;
  @ReportPro.State("activeChart") activeChart!: H3.Report.Chart;
  @ReportPro.State("activeModules") activeModules!: H3.ReportModules.ChartModules;

  prefixCls: string = "h3-report-tools";
  // tab初始状态
  activeKey = "data";
  // tab数据集
  tabList: Array<any> = [
    { key: "data", value: "数据设置" },
    { key: "styles", value: "显示设置" }
  ];
  // 是否展示新手引导卡片
  showGuideCard: boolean = false;
  // 是否显示帮助弹窗
  showHelpModal: boolean = false;
  // 帮助文档参数
  helpOptions: Array<any> = [];
  // 帮助文档标题
  helpTitle: string = "帮助文档";

  /**
   * 获取模块数据
   */
  get getModuleData() {
    return this.activeChart
      ? Object.assign({}, this.activeChart.data, this.activeChart.styles, {
          chartTitle: this.activeChart.title
        })
      : {};
  }

  /**
   * 隐藏卡片
   */
  hideGuideCard() {
    this.showGuideCard = false;
  }

  /**
   * 点击帮助
   */
  onClickHelp() {
    this.helpTitle = "功能说明";
    this.helpOptions = [
      {
        label: "维度",
        value: "dimension",
        contentHtml: `<img src="${require(`@h3/report/basics/assets/dimension.png`)}">`
      },
      {
        label: "指标",
        value: "metric",
        contentHtml: `<img src="${require(`@h3/report/basics/assets/metric.png`)}">`
      },
      {
        label: "过滤条件",
        value: "filter",
        contentHtml: `<img src="${require(`@h3/report/basics/assets/filter.png`)}">`
      }
    ];

    this.showHelpModal = true;
  }

  /**
   * 获取数据模块
   */
  getDataModules() {
    const chartDataModules: H3.ReportModules.ChartDataModules = this.activeModules.data as any;
    const chartStylesModules: H3.ReportModules.ChartStylesModules = this.activeModules
      .styles as any;
    if (!chartDataModules) return null;
    return {
      chartSwitch: chartDataModules.chartSwitch,
      multiMetricType: chartStylesModules.multiMetricType,
      dimension: chartDataModules.dimension,
      groupDimension: chartDataModules.groupDimension,
      metric: chartDataModules.metric,
      metricGroup: chartDataModules.metricGroup,
      filter: chartDataModules.filter
    };
  }

  /**
   * 获取样式模块
   */
  getStylesModules() {
    const chartDataModules: H3.ReportModules.ChartDataModules = this.activeModules.data as any;
    const chartStylesModules: H3.ReportModules.ChartStylesModules = this.activeModules
      .styles as any;
    if (!chartDataModules) return null;
    return {
      chartTitle: chartDataModules.chartTitle,
      theme: chartStylesModules.theme,
      elementCoat: chartStylesModules.elementCoat,
      fontSetting: chartStylesModules.fontSetting,
      limit: chartDataModules.limit,
      dimensionLimit: chartStylesModules.dimensionLimit,
      metricRange: chartStylesModules.metricRange,
      multiRange: chartStylesModules.multiRange,
      dataLabel: chartStylesModules.dataLabel,
      multipleDataLabel: chartStylesModules.multipleDataLabel,
      download: chartStylesModules.download,
      orderNumber: chartStylesModules.orderNumber,
      freezeHead: chartStylesModules.freezeHead,
      legend: chartStylesModules.legend,
      axisX: chartStylesModules.axisX,
      dataZoom: chartStylesModules.dataZoom,
      linkage: chartStylesModules.linkage,
      warningLine: chartStylesModules.warningLine
    };
  }

  /**
   * tab数据选择
   * @param index
   */
  dataSelect(index: number) {
    return index === 0 ? this.getDataModules() : this.getStylesModules();
  }

  /**
   * 更新滚动条
   */
  refreshScroll() {
    this.$nextTick(() => {
      if (this.$refs.scroll) {
        let flagNumber: number = this.activeKey === "data" ? 0 : 1;
        (this.$refs.scroll as any)[flagNumber].setScrollBar();
      }
    });
  }

  /**
   * tab切换
   * @param tabKey
   */
  tabChange(tabKey: string) {
    this.activeKey = tabKey;
  }

  mounted() {
    // 更新滚动条
    if (this.activeChart) this.refreshScroll();
  }

  updated() {
    // 更新滚动条
    if (this.activeChart) this.refreshScroll();
  }
}
</script>

<style lang="less">
@import "~@h3/report/basics/styles/index";
.h3-report-tools {
  width: 220px;
  border-left: 2px solid @report-border-line-color;
  background: rgba(255, 255, 255, 1);
  overflow: hidden;
  &__intro {
    position: absolute;
    z-index: 9999999999;
    width: 30px;
    height: 30px;
    top: 0;
    right: 70px;
    &-arrow {
      border: 10px solid transparent;
      content: "";
      position: absolute;
      top: 110%;
      right: 0;
      border-bottom-color: white;
      z-index: 2;
    }
    &-card {
      position: absolute;
      width: 200px;
      top: 170%;
      right: -60px;
      height: 110px;
      padding: 16px 12px;
      display: flex;
      background: rgba(255, 255, 255, 1);
      box-shadow: 0px 2px 14px 0px rgba(52, 94, 184, 0.2);
      img {
        height: 20px;
        margin-right: 12px;
      }
    }
  }
  &__wrap {
    height: 100%;
    overflow-x: hidden;
    padding-bottom: 40px;
    .vertical-scrollbar();
    &--help {
      font-size: 12px;
      color: #107fff;
      text-decoration: underline;
      text-align: center;
      padding: 16px 0;
      margin-bottom: 40px;
      cursor: pointer;
    }
  }
  &__scroll {
    height: 100%;
  }
  &__title {
    height: 44px;
    padding: 12px;
    font-size: 14px;
    font-weight: 400;
    color: rgba(48, 66, 101, 1);
    line-height: 20px;
    border-bottom: 2px solid @report-border-line-color;
  }
  &__empty {
    height: calc(100% + 54px);
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    img {
      margin-bottom: 18px;
    }
    label {
      font-size: 14px;
      font-weight: 400;
      color: #8893a7;
    }
  }
  /** ant-design tooltip样式 **/
  .ant-tooltip-placement-bottom,
  .ant-tooltip-placement-bottomLeft,
  .ant-tooltip-arrow {
    border-bottom-color: #304265;
  }
  .ant-tooltip-placement-top,
  .ant-tooltip-arrow {
    border-top-color: #304265;
  }
  .ant-tooltip {
    .ant-tooltip-content {
      .ant-tooltip-inner {
        background-color: #304265;
      }
    }
  }
  .tab-nav {
    height: 100%;
    display: flex;
    flex-direction: column;
    .ant-tabs-content-animated {
      height: calc(100% - 44px);
    }
    .ant-tabs-tabpane {
      height: 100%;
    }
    .ant-tabs-bar {
      margin: 0;
      border-bottom: 2px solid @report-border-line-color;
      height: 44px;
    }
    .ant-tabs-nav-animated {
      width: 100%;
      div {
        width: 100%;
      }
      .ant-tabs-ink-bar {
        width: 56px !important;
        height: 3px;
        left: 27px;
      }
    }
    .ant-tabs-nav {
      .ant-tabs-tab {
        width: 50%;
        margin: 0;
        text-align: center;
        padding: 12px 27px;
        color: #304265;
        font-size: 14px;
        font-weight: 400;
        height: 44px;
      }
    }
  }
  .ant-tabs {
    overflow: inherit;
  }
}
</style>
