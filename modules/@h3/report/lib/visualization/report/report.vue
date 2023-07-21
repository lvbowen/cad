<template>
  <div :class="easyPrefixCls">
    <div :class="[`${prefixCls}__header`]">
      <label :class="[`${prefixCls}__title`]">
        <backdoor>统计分析</backdoor>
        <a-tooltip
          v-if="charts.length"
          class="h3-report-i-btn"
          placement="bottom"
        >
          <template slot="title">
            <span>全部刷新</span>
          </template>
          <a @click="refreshAllChart"><i class="h3yun_All reload-o"></i></a>
        </a-tooltip>
      </label>
      <div class="h3-report-i-btns">
        <a
          v-if="charts.length"
          :class="[`${prefixCls}__add`]"
          @click="addNewChart"
        >
          <i class="h3yun_All plus-o"></i>新增图表
        </a>
        <a-tooltip :class="['h3-report-i-btn', `${prefixCls}__close`]" placement="bottom">
          <template slot="title">
            <span>关闭</span>
          </template>
          <a @click="close"><i class="h3yun_All close"></i></a>
        </a-tooltip>
      </div>
    </div>
    <h3-scroll
      ref="scroll"
      v-if="charts.length"
      :class="[`${prefixCls}__body`, `${easyPrefixCls}__body`]"
      :resize="refresh"
      :buttonColor="'rgba(0, 0, 0, 0.45)'"
    >
      <h3-draggable
        handle=".item"
        :value="charts"
        :options="dragOptions"
        @end="sortEnd"
        @input="draggableSort"
      >
        <div
          v-for="(chart, i) in charts"
          :class="[`${easyPrefixCls}__chart`]"
          :key="i"
        >
          <div :class="[`${easyPrefixCls}__chart-header`]">
            <inputTitle
              ref="inputTitle"
              :inputValue="chart.title"
              :inputID="'report-' + i"
              :class="[`${easyPrefixCls}__editInput`]"
              @inputFun="inputChange($event, chart)"
              @inputBlur="inputBlur(chart)"
              @inputFocus="inputFocus(chart)"
            >
            </inputTitle>
            <div class="h3-report-i-btns">
              <a-tooltip class="h3-report-i-btn" placement="bottom">
                <template slot="title">
                  <span>刷新</span>
                </template>
                <a @click="refreshChart(i)"><i class="h3yun_All reload-o"></i></a>
              </a-tooltip>
              <a-tooltip class="h3-report-i-btn" placement="bottom">
                <template slot="title">
                  <span>全屏</span>
                </template>
                <a @click="zoom('detail', chart)"><i class="h3yun_All fullscreen-o"></i></a>
              </a-tooltip>
              <a-tooltip class="h3-report-i-btn" placement="bottom">
                <template slot="title">
                  <span>设置</span>
                </template>
                <a @click="zoom('edit', chart)"><i class="h3yun_All setting-o"></i></a>
              </a-tooltip>
              <a-tooltip class="h3-report-i-btn" placement="bottom">
                <template slot="title">
                  <span>删除</span>
                </template>
                <a @click="removeItem(i)"><i class="h3yun_All delete-o"></i></a>
              </a-tooltip>
              <a-tooltip class="h3-report-i-btn" placement="bottom">
                <template slot="title">
                  <span>拖动</span>
                </template>
                <a class="item"><i class="h3yun_All drag"></i></a>
              </a-tooltip>
            </div>
          </div>
          <h3-easy-chart-warp
            ref="chart"
            :computedStyle="{ width: 548, height: 388 }"
            :refresh="refresh"
            :chart="chart"
            :global="global"
            :class="[`${easyPrefixCls}__chart-body`]"
          >
          </h3-easy-chart-warp>
        </div>
      </h3-draggable>
    </h3-scroll>
    <div v-else :class="`${easyPrefixCls}__empty`">
      <img :src="require(`@h3/report/basics/assets/bar-blue.png`)"/>
      <a-button
        type="primary"
        @click="addNewChart"
        class="addChartBtnClass"
      >新增图表 </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import { Tooltip, Button, message, Modal } from "@h3/antd-vue";
import H3Draggable from "vuedraggable";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/visualization/types";
import H3EasyChartWarp from "../chart-warp";
import inputTitle from "../rename/rename.vue";
import H3Scroll from "@h3/report/basics/components/scroll";
import Backdoor from "@h3/report/basics/components/backdoor";

const Visualization = namespace("visualization");

@Component({
  name: "h3-report-easy",
  components: {
    ATooltip: Tooltip,
    AButton: Button,
    H3Draggable,
    H3EasyChartWarp,
    inputTitle,
    H3Scroll,
    Backdoor
  }
})
export default class ReportEasy extends Vue {
  @Prop({ default: () => "" }) prefixCls!: string;
  @Prop({ default: () => false }) refresh!: boolean;
  @Inject() handleScreen!: Function;
  @Visualization.State("chartsData") chartsData!: { [key: string]: Array<any> };
  @Visualization.State("charts") charts!: Array<H3.Report.Chart>;
  @Visualization.State("global") global!: H3.Report.Global;
  @Visualization.State("activeChart") activeChart!: H3.Report.Chart;
  @Visualization.Action(ReportAction.REMOVECHART) removeChart!: Function;
  @Visualization.Action(ReportAction.ADDCHART) addChart!: Function;
  @Visualization.Action(ReportAction.SAVECHARTS) saveCharts!: Function;
  @Visualization.Action(ReportAction.SAVECHART) saveChart!: Function;
  @Visualization.Mutation(ReportMutation.UPDATECHARTS) updateCharts!: Function;
  easyPrefixCls = "h3-report-easy";
  dragOptions = {
    animation: 150,
    ghostClass: `${this.easyPrefixCls}__chart--drag`
  };
  // 保存图表名称
  storeTitle = "";

  /**
   * 拖动排序
   * @param charts
   */
  draggableSort(charts: Array<H3.Report.Chart>) {
    this.updateCharts(charts);
  }
  /**
   * 关闭弹窗
   */
  close() {
    this.$emit("close");
  }

  /**
   * 删除图表
   * @param index
   */
  async removeItem(index: number) {
    Modal.confirm({
      class: "test-confirm",
      title: "删除提示",
      content: "删除图表后，数据不可恢复，是否要删除该图表？",
      okText: "确定",
      cancelText: "取消",
      destroyOnClose: true,
      width: 433,
      visible: false,
      centered: true,
      confirmLoading: true,
      iconType: "close-circle",
      onOk: async e => {
        // 删除图表
        await this.removeChart(this.charts[index]);
        this.$nextTick(() => {
          if (this.$refs.scroll) {
            (this.$refs.scroll as any).setScrollBar();
          }
        });
      }
    });
  }

  /**
   * 刷新图表
   * @param index
   */
  async refreshChart(index: number) {
    await (this.$refs.chart as any)[index].refreshChartData();
  }
  /**
   * 刷新全部图表
   */
  refreshAllChart() {
    if (this.$refs.chart) {
      (this.$refs.chart as any).forEach((item: any) => {
        item.refreshChartData();
      });
    }
  }

  /**
   *  窗体转换
   * @param type
   * @param chart
   */
  zoom(type: string, chart: H3.Report.Chart) {
    if (type === "edit") {
      this.$emit("edit-chart");
    } else if (type === "detail") {
      this.$emit("detail-chart");
    }
    const activeChart: H3.Report.Chart = JSON.parse(JSON.stringify(chart));
    this.handleScreen(true, type, activeChart);
  }

  /**
   * 新增图表
   */
  addNewChart() {
    this.$emit("add-chart");
    (this.addChart("table") as Promise<H3.Report.Chart>).then((chart: H3.Report.Chart) => {
      this.handleScreen(true, "edit", chart);
    });
  }

  /**
   * 排序结束
   */
  sortEnd(e: any) {
    if (e.oldIndex !== e.newIndex) {
      this.charts.forEach((chart: H3.Report.Chart, index: number) => {
        chart.i = this.charts.length - index + 1;
      });
      this.saveCharts();
    }
  }

  /**
   *  保存 - 输入框title
   */
  async save(chart: H3.Report.Chart) {
    const res = await this.saveChart(chart);
    if (res) {
      message.success("保存成功");
    }
  }

  /**
   * 输入框失去焦点事件
   */
  inputBlur(chart: H3.Report.Chart) {
    if (this.storeTitle !== chart.title) {
      // 保存 - 输入框title
      this.save(chart);
    }
    this.storeTitle = null;
  }

  /**
   * 输入框获取焦点事件
   */
  inputFocus(chart: H3.Report.Chart) {
    // 保存图表名称
    this.storeTitle = chart.title;
  }

  /**
   * 监听input事件
   */
  inputChange(val, chart: H3.Report.Chart) {
    Vue.set(chart, "title", val);
  }

  updated() {
    if (!this.storeTitle) {
      if (this.$refs.inputTitle) {
        (this.$refs.inputTitle as any).forEach((title: any) => {
          title.handleInputWidth();
        });
      }
      if (this.$refs.chart) {
        (this.$refs.chart as any).forEach((item: any) => {
          item.refreshChart();
        });
      }
    }
  }
}
</script>

<style lang="less">
.h3-report-easy {
  &__chart--drag {
    background-color: #f9f9f9 !important;
  }
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 20px;
    color: #ddd;
    border: 0 !important;
    a {
      margin-top: 40px;
    }
    .addChartBtnClass {
      margin-top: 35px;
    }
  }
  &__chart,
  &__empty {
    display: flex;
    flex-direction: column;
    margin: 20px;
    margin-bottom: 0;
    height: 440px;
    background: rgba(255, 255, 255, 1);
    border-radius: 8px;
    border: 1px solid rgba(231, 233, 237, 1);
    .h3-report-i-btns {
      transition: opacity 0.2s, box-shadow 0.2s;
      opacity: 0;
      .h3yun_All {
        color: #8893a7;
        &:hover {
          color: #68758e;
        }
      }
    }
  }
  &__chart:last-child {
    margin: 20px;
  }
  &__chart:hover {
    box-shadow: 0 0 10px 0 rgba(48, 66, 101, 0.1);
    .h3-report-i-btns {
      opacity: 1;
    }
  }
  &__chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px 0 16px;
    flex: 0 0 50px;
    z-index: 10;
    .h3-report-i-btns {
      padding-right: 0;
    }
  }
  &__editInput {
    display: flex;
    padding: 0 0 0 11px;
    flex: auto;
  }
  &__chart-title {
    font-size: 16px;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__chart-body {
    flex: 1;
  }
  .h3-pivot-table {
    overflow: hidden;
    border-left: 0;
    border-radius: 0 0 8px 8px;
    &:after {
      width: 0 !important;
    }
    td:last-child,
    th:last-child {
      border-right: 0;
    }
  }
  .h3-easy-report-chart__body {
    flex: 0 0 388px;
    height: 388px;
  }
}
.h3-report-easy-modal {
  &__header {
    justify-content: space-between;
    .h3-report-i-btns {
      padding-right: 0;
    }
  }
  &__title {
    margin-left: 24px;
    display: flex;
  }
  &__warp {
    position: relative;
  }
}
</style>
