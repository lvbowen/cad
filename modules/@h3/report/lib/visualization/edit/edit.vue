<template>
  <div v-if="chart && chart.data">
    <div :class="[`${prefixCls}__header`, `${editPrefixCls}__header`]">
      <div :class="[`${editPrefixCls}__returnDiv`]">
        <i class="h3yun_All arrow-left-o" @click="zoom()"></i>
      </div>
      <inputTitle
        :class="[`${editPrefixCls}__editInput`]"
        :inputValue="chart.title"
        :inputID="'edit-input'"
        @inputFun="inputChange"
      >
      </inputTitle>
      <div class="h3-report-i-btns" style="margin-right: 26px;">
        <a-button
          type="primary"
          :class="[`${editPrefixCls}__editSaveBtnClass`]"
          :loading="loading"
          @click="save"
        >保存
        </a-button>
      </div>
    </div>
    <div :class="[`${prefixCls}__body`, editPrefixCls]">
      <div :class="[`${editPrefixCls}__left`]">
        <h3-easy-chart-warp
          ref="chart"
          :class="[`${editPrefixCls}__chart`]"
          :delay="500"
          :refresh="refresh"
          :chart="chart"
          :global="global"
          :mode="true"
        >
        </h3-easy-chart-warp>
      </div>
      <h3-scroll
        ref="scroll"
        :class="[`${editPrefixCls}__right`]"
        :buttonColor="'rgba(0, 0, 0, 0.45)'"
      >
        <div :class="[`${editPrefixCls}__right-body`]">
          <show-type
            ref="showType"
            :comPrefixCls="'report-easy-modules'"
            :type="chart.type"
            @chartChange="chartChange"
          >
          </show-type>
          <!-- 数据模块 -->
          <template v-for="(module, k) in innerChartsModules.data">
            <component
              v-if="k !== 'chartTitle'"
              :is="`h3-${k}`"
              :key="k"
              :comPrefixCls="'report-easy-modules'"
              :module="module"
              :chart="chart"
              :data="chart.data[k]"
              :schemas="schemas"
              @changeChartsModules="changeChartsModules"
            ></component>
          </template>
          <!-- 样式模块 -->
          <template v-for="(module, k) in innerChartsModules.styles">
            <component
              :is="`h3-${k}`"
              v-if="k !== 'theme' && k !== 'direction'"
              :key="k"
              :comPrefixCls="'report-easy-modules'"
              :module="module"
              :chart="chart"
              :data="chart.styles[k]"
              @changeChartsModules="changeChartsModules"
            ></component>
          </template>
        </div>
      </h3-scroll>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import {Mutation, Action, State, namespace} from 'vuex-class';
import H3Draggable from 'vuedraggable';
import { message, Button } from '@h3/antd-vue';
import H3EasyChartWarp from '../chart-warp';
import { ReportAction, ReportMutation } from '@h3/report/basics/store/visualization/types';
import Modules from '../modules';
import inputTitle from '../rename/rename.vue';
import ChartModules from '@h3/report/basics/instance/element-modules/visualization';
import ShowType from './show-type.vue';
import H3Scroll from '@h3/report/basics/components/scroll';

const Visualization = namespace('visualization');
@Component({
  name: 'h3-report-easy-edit',
  components: {
    H3Draggable,
    H3EasyChartWarp,
    ...Modules,
    inputTitle,
    ShowType,
    AButton: Button,
    H3Scroll
  }
})
export default class ReportEasyEdit extends Vue {
  @Prop({ default: () => '' }) prefixCls !: string;
  @Prop({ default: () => ({}) }) chart !: H3.Report.Chart;
  @Prop({ default: () => false }) refresh !: boolean;
  @Prop() global!: H3.Report.Global;
  @Inject() handleScreen!: Function;
  @Visualization.State('schemas') schemas!: Array<H3.Report.FieldColumn>;
  @Visualization.State('activeChart') activeChart!: H3.Report.Chart;
  @Visualization.State('chartsData') chartsData!: any;
  @Visualization.Action(ReportAction.SAVECHART) saveChart!: Function;
  @Visualization.Action(ReportAction.REMOVECHART) removeChart!: Function;
  @Visualization.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function;
  loading = false;
  editPrefixCls = 'h3-report-easy-edit';
  innerChartsModules = {};
  /**
   * 监听组件模块
   * @param modules
   * @param chart
   */
  changeChartsModules({ modules, dataGroup }: any) {
    this.innerChartsModules = modules;
    (this.$refs.showType as any).judgeDimension(dataGroup);
    this.$nextTick(() => {
      (this.$refs.scroll as any).setScrollBar();
    });
  }

  /**
   * 选择图表类型
   * @param type
   */
  chartChange(type: string) {
    this.chart.type = type as H3.Report.ElementType;
    const chart = JSON.parse(JSON.stringify(this.chart));
    this.innerChartsModules = ChartModules(chart);
    (this.$refs.chart as any).refreshChartData();
    this.setActiveChart(chart);
    (this.$refs.showType as any).judgeDimension(chart.data);
    this.$nextTick(() => {
      (this.$refs.scroll as any).setScrollBar();
    });
  }
  removeItem() {
    this.removeChart(this.chart);
    this.zoom();
  }
  /**
   * 返回
   */
  zoom() {
    this.$emit('back');
    delete this.chartsData[`edit${this.activeChart.uid}`];
    this.handleScreen(false);
  }

  /**
   *  保存
   */
  async save() {
    this.loading = true;
    this.chartsData[this.activeChart.uid] = this.chartsData[`edit${this.activeChart.uid}`];
    const res = await this.saveChart(this.activeChart);
    if (res) {
      this.loading = false;
      message.success('保存成功');
    }
  }

  /**
   * 监听input事件
   */
  inputChange(val) {
    this.chart.title = val;
  }
  mounted() {
    this.innerChartsModules = ChartModules(this.chart);
    (this.$refs.showType as any).judgeDimension(this.chart.data);
  }
}
</script>

<style lang="less">
  .h3-report-easy-edit {
    display: flex;
    justify-content: flex-end;
    &__title {
      max-width: 180px;
      border: 0;
      border-bottom: 1px dotted #2d7fff;
      outline: none;
    }

    &__left {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 500px;
      width: 100%;
      overflow: hidden;
    }

    &__chart {
      width: 80% !important;
      height: 80%;
    }

    &__right {
      display: flex;
      flex-direction: column;
      flex: 0 0 388px;
      width: 388px;
      overflow: hidden;
      overflow-y: auto;
    }

    &__right-header {
      flex: 0 0 44px;
      padding: 0 24px;
      >label {
        display: block;
        margin: 0 -24px;
        padding: 10px 24px;
        height: 44px;
        font-size: 16px;
        border-bottom: 1px solid rgba(231, 233, 237, 1);
      }
    }

    &__right-body {
      flex: 1;
      padding-bottom: 20px;
      background: #f7f9fc;
      min-height: 100%;
    }

    &__right-footer {
      display: flex;
      flex: 0 0 64px;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #E7E9ED;
    }

    &__returnDiv {
      display: flex;
      width: 52px;
      height: 100%;
      border-right: 1px solid #E0E3E9;
      opacity: 0.7;
      .arrow-left-o {
        font-size: 19px;
        margin: auto;
        color: #8893A7;
        cursor: pointer;
        line-height: 14px;
        &:hover {
          color: #68758E;
        }
      }
    }

    &__editInput {
      display: flex;
      padding: 0 0 0 11px;
      flex: auto;
    }
  }
  .ant-select-selection-selected-value {
    line-height: 30px;
  }
</style>
