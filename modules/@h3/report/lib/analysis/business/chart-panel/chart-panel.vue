<template>
  <div :class="prefixCls">
    <div :class="[`${prefixCls}__header`]">
      <div :class="`${prefixCls}__header-left`">
        <rename
          ref="inputTitle"
          :edit="editTitle"
          :inputValue="chartTitle"
          :inputID="`v-${chart.uid}`"
          :minWidthValue="100"
          :maxWidthValue="190"
          :maxLength="50"
          :class="[`${prefixCls}__editInput`]"
          @inputBlur="inputBlur($event)"
          @inputFocus="inputFocus($event)"
        />
        <img
          v-if="showNewTip"
          :class="`${prefixCls}__new`"
          :src="require('@h3/report/basics/assets/analysis/new.svg')"
          alt="未读标签"
        />
      </div>
      <toolbar
        :class="`${prefixCls}__header-right`"
        :options="toolbar"
        :container="getContainer"
        @click="clickOption"
      >
        <template :slot="ToolsBarType.SORT" v-if="visibleSort">
          <a-popover
            :placement="toolbar.length > 4 ? 'bottom' : 'bottomRight'"
            :overlayClassName="`h3-analysis-sort__pop`"
            :arrowPointAtCenter="true"
            :getPopupContainer="getSortContainer"
            trigger="click"
          >
            <template slot="content">
              <div>
                <sort-model
                  :chart="chart"
                  :value="sortValue"
                  @change-sort="changeSort"
                >
                </sort-model>
              </div>
            </template>
            <div>
              <AIcon
                :class="`${prefixCls}__icon-wrap`"
                :option="sortOption"
                :getContainer="getContainer"
              ></AIcon>
            </div>
          </a-popover>
        </template>

        <template :slot="ToolsBarType.DRAG">
          <div :class="`${prefixCls}__drag-wrap`">
            <div :class="`${prefixCls}__toolbar-line`"></div>
            <div @mousedown="mousedown(chartIndex, $event)">
              <AIcon
                :class="`${prefixCls}__icon-wrap`"
                :option="dragOption"
                :getContainer="getContainer"
              ></AIcon>
            </div>
          </div>
        </template>
      </toolbar>
    </div>
    <div>
      <chart-detail
        :class="`${prefixCls}__body`"
        :chart="chart"
        :moduleState="status"
        :refresh="refresh"
        @change-datazoom="changeDataZoom"
        @change-columns="changeColumns"
        :edit="editTitle"
        status="preview"
      >
        <div slot="footer" :class="[`${prefixCls}__footer`]">
          <span>修改时间: {{ updateDate }} </span>
          <span v-if="showChangeText">修改人: {{ chartInfo.updateUserName }} </span>
        </div>
      </chart-detail>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/analysis/types";
import { message, Tooltip, Popover } from "@h3/antd-vue";
import ChartDetail from "../chart-detail";
import SortModel from "../sort-model";
import Toolbar from "../../component/toolbar";
import ToolsMixins from "../../mixins/tools-mixins";
import TitleMixins from "../../mixins/title-mixins";

import Rename from "@h3/report/basics/components/edit-input";
import Icon from "../../component/icon";
import { TabState } from "@h3/report/basics/enum/module-state";
import { ToolsBarType } from "@h3/report/basics/enum/element-tools";
import { ToolBarMaps } from "../../config/static-option";
import { ModuleState } from "@h3/report/basics/enum/module-state";
import day from "dayjs";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-chart-panel",
  components: {
    Toolbar,
    Rename,
    ChartDetail,
    ATooltip: Tooltip,
    APopover: Popover,
    AIcon: Icon,
    SortModel
  }
})
export default class H3ChartPanel extends Mixins(ToolsMixins, TitleMixins) {
  @Prop({ default: -1 }) chartIndex!: number;
  @Prop({ default: true }) refresh!: boolean;
  @Prop({ default: true }) editTitle!: boolean;
  @Analysis.State("charts") charts!: Array<H3.Report.Chart>;
  @Analysis.State("activeTab") activeTab!: TabState; // 公共或者个人区域
  @Analysis.Action(ReportAction.SAVECHART) saveChart!: Function;
  @Analysis.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function; // 刷新图表

  ToolsBarType = ToolsBarType;
  prefixCls: string = "h3-chart-panel";
  // 拖拽功能配置的映射
  dragOption = ToolBarMaps[ToolsBarType.DRAG];
  sortOption = ToolBarMaps[ToolsBarType.SORT];

  /**
   *  图表title
   */
  get chartTitle() {
    return this.chart.title;
  }

  /**
   *  toolbar禁用功能
   */
  get disableList() {
    let list: Array<string> = [];
    if (this.charts.length === 1) {
      list.push(ToolsBarType.DRAG);
    }
    return list;
  }
  /**
   * 排序气泡框挂载容器
   */
  getSortContainer() {
    return document.querySelector(".h3-analysis-view-body__contains");
  }
  /**
   * 气泡框挂载位置
   */
  getContainer() {
    return document.querySelector(".h3-analysis-view");
  }
  /**
   * 格式化上次更新时间
   */
  get updateDate() {
    if (this.chartInfo && this.chartInfo.updateDate) {
      return day(this.chartInfo.updateDate).format("YYYY/MM/DD HH:mm");
    }
    return "";
  }
  /**
   *  是否展示未读标签
   */
  get showNewTip() {
    return this.chartInfo && this.chartInfo.viewStatus === 0;
  }
  /**
   * 是否显示修改时间
   */
  get showChangeText() {
    return this.activeTab === TabState.PUBLIC;
  }
  /**
   * tooltip挂载容器
   */
  getPopupContainer() {
    let wrapDom = document.querySelector(".h3-analysis-view");
    return wrapDom;
  }
  /**
   *  按下
   */
  mousedown(index, e: Event) {
    this.$emit("drag", index, e);
  }
}
</script>

<style lang="less">
@import "./index.less";
</style>
