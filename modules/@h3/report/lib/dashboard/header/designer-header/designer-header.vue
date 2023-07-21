<template>
  <report-header :class="prefixCls">
    <!-- 图表工具栏 -->
    <div :class="[prefixCls + '__toolbar']">
      <a-tooltip
        v-for="(item, index) in chartList"
        :key="index"
        :placement="placement"
        :getPopupContainer="getPopupContainer"
      >
        <template slot="title">
          <span>{{ item.chartName }}</span>
          <br/>
          <span v-html="item.chartNotice"></span>
        </template>
        <a
          :id="`h3-report-intro-${item.type}`"
          :class="`h3-report-intro-${item.type}`"
          @mousedown="addLayoutChart(item.type, item.chartName, item.iconFont)"
        >
          <!-- <i :class="['h3yun_All', item.iconFont]"></i> -->
          <h3-svg :name="item.iconFont"></h3-svg>
        </a>
      </a-tooltip>
    </div>
    <div :class="[prefixCls + '__borderLeft']"></div>
    <!-- 筛选器、文本编辑器 -->
    <div :class="[prefixCls + '__middleToolbar']">
      <a-tooltip
        class="h3-report-i-btn"
        v-for="(item, index) in moduleToolList"
        :key="index"
        :placement="placement"
        :getPopupContainer="getPopupContainer"
      >
        <template slot="title">
          <span>{{ item.label }}</span>
        </template>
        <a @mousedown="addLayoutChart(item.type, item.label, item.iconFont)" :class="item.type">
          <i class="h3yun_All" :class="item.icon"></i>
          {{ item.label }}
        </a>
      </a-tooltip>
    </div>
    <!-- 右侧按钮 -->
    <div :class="[`${prefixCls}__btns`]">
      <a :class="[prefixCls + '__preview', `${prefixCls}__btn`]" @click="reportPreview">
        预览仪表盘
      </a>
      <a-button
        type="primary"
        :class="[prefixCls + '__save', `${prefixCls}__btn`]"
        @click="save"
      >
        <i class="h3yun_All save-o"></i>保存
      </a-button>
    </div>
  </report-header>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { Tooltip, Button } from "@h3/antd-vue";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/dashboard/types";
import { ChartNotice } from "@h3/report/basics/enum/chart-type";
import ReportHeader from "../header.vue";
import Svg from "@h3/report/basics/components/icon-svg/index";

const ReportPro = namespace("report");
@Component({
  name: "h3-report-designer-header",
  components: {
    ReportHeader,
    AButton: Button,
    ATooltip: Tooltip,
    H3Svg: Svg
  }
})
export default class ReportDesignerHeader extends Vue {
  @Prop({ default: false }) previewStatus!: boolean; // 预览状态
  @ReportPro.State("corpId") corpId!: string;
  @ReportPro.State("modules") modules!: { [key: string]: H3.ReportModules.ChartModules };
  @ReportPro.Action(ReportAction.GETDATASOURCELIST) getDataSourceList!: Function;
  @ReportPro.Action(ReportAction.ADDELEMENT) addElement!: Function;
  @ReportPro.Mutation(ReportMutation.SETDRAGCHART) setDragChart!: Function;
  prefixCls = "h3-report-designer-header";
  dragItem: any;
  dragChart: any;
  placement: string = "bottomLeft";
  // 图表列表
  chartList: any[] = [
    {
      type: "bar",
      iconFont: "Histogram",
      chartName: "柱状图",
      chartNotice: ChartNotice.BAR
    },
    {
      type: "stripe",
      iconFont: "Barchart",
      chartName: "条形图",
      chartNotice: ChartNotice.STRIPE
    },
    {
      type: "pie",
      iconFont: "Piechart",
      chartName: "饼图",
      chartNotice: ChartNotice.PIE
    },
    {
      type: "area",
      iconFont: "Areachart",
      chartName: "面积图",
      chartNotice: ChartNotice.AREA
    },
    {
      type: "radar",
      iconFont: "Radarchart",
      chartName: "雷达图",
      chartNotice: ChartNotice.RADAR
    },
    {
      type: "table",
      iconFont: "fluoroscopy",
      chartName: "透视图",
      chartNotice: ChartNotice.TABLE
    },
    {
      type: "list",
      iconFont: "list",
      chartName: "明细表",
      chartNotice: ChartNotice.LIST
    },
    {
      type: "card",
      iconFont: "Indicatorchart",
      chartName: "指标图",
      chartNotice: ChartNotice.CARD
    },
    {
      type: "line",
      iconFont: "linechart",
      chartName: "折线图",
      chartNotice: ChartNotice.LINE
    },
    {
      type: "funnel",
      iconFont: "Funnelchart",
      chartName: "漏斗图",
      chartNotice: ChartNotice.FUNNEL
    },
    {
      type: "pileBar",
      iconFont: "Stackedchart",
      chartName: "堆叠柱状图",
      chartNotice: ChartNotice.PILEBAR
    },
    {
      type: "scatter",
      iconFont: "Bubblechart",
      chartName: "散点图",
      chartNotice: ChartNotice.SCATTER
    },
    {
      type: "biax",
      iconFont: "Biaxialplot",
      chartName: "双轴图",
      chartNotice: ChartNotice.BIAX
    }
  ];
  // 组件工具列表
  moduleToolList: any[] = [
    { label: "筛选器", type: "filterPicker", icon: "filter-o", click: Function },
    { label: "文本", type: "longText", icon: "text-file-o", click: Function },
    { label: "图片轮播", type: "picPlay", icon: "jpg-file-o", click: Function },
    { label: "视频", type: "videoPlay", icon: "add-file-o", click: Function },
    { label: "iframe", type: "iframePlay", icon: "link-o", click: Function },
  ];

  async addLayoutChart(elementType: H3.Report.ElementType, chartName: string, iconType: string) {
    this.dragChart = await this.addElement({ elementType });
    this.dragChart.class = "h3-report-container__dragging";
    this.dragItem = document.createElement("div");
    this.dragItem.className = "h3-report__drag";
    this.dragItem.innerHTML = `<i class="h3-report-designer-header__icon h3yun_All ${iconType}"></i><span class="text">${chartName}</span>`;
    document.body.appendChild(this.dragItem);
    document.body.addEventListener("mouseup", this.mouseupBody, false);
    document.body.addEventListener("mousemove", this.mousemoveBody, false);
    this.$emit("dragStart", this.dragChart);
    this.setDragChart(this.dragChart);
  }

  mousemoveBody(e: MouseEvent) {
    this.dragItem.style.top = `${e.pageY - 40 / 2}px`;
    this.dragItem.style.left = `${e.pageX - 124 / 2}px`;
  }
  mouseupBody(e) {
    document.body.removeChild(this.dragItem);
    this.$delete(this.dragChart, "class");
    this.$delete(this.dragChart, "addStatus");
    document.body.removeEventListener("mouseup", this.mouseupBody, false);
    document.body.removeEventListener("mousemove", this.mousemoveBody, false);
    this.$emit("dragEnd");
    this.setDragChart(null);
  }
  reportOutPreview() {
    this.$emit("update-preview-status", false);
  }

  reportPreview() {
    this.$emit("update-preview-status", true);
  }
  save() {
    this.$emit("save-report");
  }

  getPopupContainer() {
    return this.$el;
  }
}
</script>
<style lang="less">
.h3-report-designer-header {
  position: relative;
  padding-left: 22px;
  .icon {
    width: 26px;
    height: 26px;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
  &__btns {
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: auto;
  }
  &__toolbar {
    display: flex;
    align-items: center;
    a {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      width: 32px;
      height: 32px;
      cursor: move;
      border-radius: 4px;
      border: 1px solid rgba(237, 242, 247, 1);
      i {
        font-size: x-large;
      }
    }
    a:last-child {
      margin: 0;
    }
  }
  &__borderLeft {
    width: 1px;
    height: 24px;
    background: rgba(237, 242, 247, 1);
    margin: 0 16px;
  }
  &__middleToolbar {
    height: 32px;
    display: flex;
    align-items: center;
    text-align: center;
    .h3-report-i-btn {
      color: #107fff !important;
    }
    .filterPicker {
      width: 86px;
      border: 1px solid rgba(237, 242, 247, 1);
      border-radius: 4px;
      margin-right: 8px;
    }
    .longText {
      width: 70px;
      border: 1px solid rgba(237, 242, 247, 1);
      border-radius: 4px;
      margin-right: 8px;
    }
    .picPlay {
      width: 96px;
      border: 1px solid rgba(237, 242, 247, 1);
      border-radius: 4px;
      margin-right: 8px;
    }
    .videoPlay {
      width: 70px;
      border: 1px solid rgba(237, 242, 247, 1);
      border-radius: 4px;
      margin-right: 8px;
    }
    .iframePlay {
       width: 70px;
       border: 1px solid rgba(237, 242, 247, 1);
       border-radius: 4px;
     }

    a {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      line-height: 32px;
      cursor: move;
      > i {
        padding-right: 4px;
      }
    }
  }
  &__icon {
    display: inline-block;
  }
  &__btn {
    height: 100% !important;
    display: inline-block;
    text-align: center;
    font-size: 14px;
    font-weight: 400;
    border-radius: 0 !important;
    i {
      font-size: 12px;
      margin-right: 6px;
    }
  }
  &__save {
    width: 132px;
    border-radius: 0;
  }
  &__preview {
    line-height: 40px;
    color: #107fff;
    margin-right: 32px;
  }
  &__exit-preview {
    position: absolute;
    right: 0;
    line-height: 40px;
    margin-right: 29px;
    i {
      font-size: 15px;
      color: #8893a7;
      margin-right: 0;
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
}
.h3-report__drag {
  position: absolute;
  display: flex;
  justify-items: center;
  align-items: center;
  width: 124px;
  height: 40px;
  background: rgba(240, 248, 254, 1);
  box-shadow: 0 0 14px 0 rgba(76, 107, 173, 0.2);
  border-radius: 4px;
  border: 1px dashed rgba(16, 127, 255, 1);
  z-index: 100;
  color: #107fff;
  cursor: move;
  .h3-report-designer-header__icon {
    border: 0;
    margin: 0 5px;
    font-size: 26px;
  }
  .text {
    line-height: 40px;
  }
}
</style>
