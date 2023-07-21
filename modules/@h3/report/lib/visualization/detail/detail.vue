<template>
  <div v-if="chart && chart.data" :class="detailPrefixCls">
    <div :class="[`${prefixCls}__header`, `${detailPrefixCls}__header`]">
      <label :class="[`${prefixCls}__title`]">{{ chart.title }}</label>
      <div class="h3-report-i-btns">
        <a-tooltip class="h3-report-i-btn" placement="bottom">
          <template slot="title">
            <span>刷新</span>
          </template>
          <a @click="refreshChart"><i class="h3yun_All reload-o"></i></a>
        </a-tooltip>
        <a-tooltip class="h3-report-i-btn" placement="bottom">
          <template slot="title">
            <span>恢复</span>
          </template>
          <a @click="zoom('report')"><i class="h3yun_All fullscreen-restore-o"></i></a>
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
          <a @click="removeItem()"><i class="h3yun_All delete-o"></i></a>
        </a-tooltip>
      </div>
    </div>
    <div :class="[`${prefixCls}__body`, `${detailPrefixCls}__body`]">
      <h3-easy-chart-warp
        ref="chart"
        :class="[`${detailPrefixCls}__chart`]"
        :refresh="refresh"
        :chart="chart"
        :global="global"
      >
      </h3-easy-chart-warp>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import H3Draggable from 'vuedraggable';
import {Action, namespace} from 'vuex-class';
import { Tooltip, Modal } from '@h3/antd-vue';
import H3EasyChartWarp from '../chart-warp';
import { ReportAction } from '@h3/report/basics/store/visualization/types';

const Visualization = namespace('visualization');
@Component({
  name: 'h3-report-easy-detail',
  components: {
    ATooltip: Tooltip,
    H3Draggable,
    H3EasyChartWarp
  }
})
export default class ReportEasyDetail extends Vue {
  @Prop({ default: () => '' }) prefixCls !: string;
  @Prop({ default: () => ({}) }) chart !: H3.Report.Chart;
  @Prop({ default: () => false }) refresh !: boolean;
  @Prop() global!: H3.Report.Global;
  @Inject() handleScreen!: Function;

  @Visualization.Action(ReportAction.REMOVECHART) removeChart!: Function;

  detailPrefixCls = 'h3-report-easy-detail';

  removeItem() {
    const modalConfirm = Modal.confirm({
      title: '删除提示',
      content: '删除图表后，数据不可恢复，是否要删除该图表？',
      okText: '确定',
      cancelText: '取消',
      destroyOnClose: true,
      width: 433,
      visible: false,
      centered: true,
      confirmLoading: true,
      iconType: 'close-circle',
      onOk: (e) => {
        // 删除图表
        this.removeChart(this.chart);
        this.zoom('report');
        modalConfirm.destroy();
      }
    });
  }
  async refreshChart() {
    await (this.$refs.chart as any).refreshChartData();
  }
  zoom(type: string, chart?: H3.Report.Chart) {
    if (chart) {
      chart = JSON.parse(JSON.stringify(chart));
    }
    this.handleScreen(type === 'edit', type, chart);
  }
}
</script>
<style lang="less">
  .h3-report-easy-detail{
    &__header{
      padding-right: 20px !important;
    }
    &__body{
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden !important;
    }
    &__chart{
      width: 1000px !important;
      height: 80%;
    }
  }
</style>
