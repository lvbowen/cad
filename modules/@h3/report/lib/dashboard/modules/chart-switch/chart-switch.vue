<!-- 图表切换 -->
<template>
  <div :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="`${prefixCls}__switch`" @click="iconSelect">
      <img v-if="chartType !== ''" :src="require(`@h3/report/basics/assets/chart-switch/${chartType}.png`)"/>
      <label>{{ chartName }}</label>
      <i :class="['h3yun_All', iconChange ? 'up-o' : 'down-o']"></i>
    </div>
    <div :class="`${prefixCls}__chart-list`" v-show="iconChange">
      <a-tooltip
        v-for="(item, index) in chartList"
        :key="index"
      >
        <template slot="title">
          <span>{{ item.title }}</span>
          <br/>
          <span v-html="item.chartNotice"></span>
        </template>
        
        <div
          :class="getChartClass(item)"
          @click="changeChart($event, item)"
        >
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Mutation, namespace } from 'vuex-class';
import { ReportMutation, ReportAction } from '@h3/report/basics/store/dashboard/types';
import { ChartNotice } from '@h3/report/basics/enum/chart-type'
import {
  Tooltip,
} from '@h3/antd-vue';

const ReportPro = namespace('report');
@Component({
  components: {
    ATooltip: Tooltip,
  }
})

export default class ChartSwitchModule extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.ChartSwitch;
  @ReportPro.State('charts') charts : Array<H3.Report.Chart>;
  @ReportPro.Action(ReportAction.ADDELEMENT) addElement!: Function;
  @ReportPro.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls: string = 'h3-report-chart-switch-module';
  // icon切换
  iconChange: boolean = false;
  // 图表列表
  chartList: Array<any> = [
    {
      chartIndex: 0,
      type: 'bar',
      title: '柱状图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.BAR,
    },
    {
      chartIndex: 1,
      type: 'pie',
      title: '饼图',
      dimension: 1,
      metric: 1,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.PIE,
    },
    {
      chartIndex: 2,
      type: 'radar',
      title: '雷达图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.RADAR,
    },
    {
      chartIndex: 3,
      type: 'pileBar',
      title: '堆叠柱状图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.PILEBAR,
    },
    {
      chartIndex: 4,
      type: 'funnel',
      title: '漏斗图',
      dimension: 1,
      metric: 1,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.FUNNEL,
    },
    {
      chartIndex: 5,
      type: 'card',
      title: '指标图',
      dimension: 1,
      metric: 1,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.CARD,
    },
    {
      chartIndex: 6,
      type: 'table',
      title: '透视图',
      dimension: 20,
      groupDimension: 20,
      metric: 20,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.TABLE,
    },
    {
      chartIndex: 7,
      type: 'line',
      title: '折线图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.LINE,
    },
    {
      chartIndex: 8,
      type: 'stripe',
      title: '条形图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.STRIPE,
    },
    {
      chartIndex: 9,
      type: 'list',
      title: '明细表',
      dimension: 20,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.LIST,
    },
    {
      chartIndex: 10,
      type: 'area',
      title: '面积图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.AREA,
    },
    {
      chartIndex: 11,
      type: 'scatter',
      title: '散点图',
      dimension: 2,
      metric: 3,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.SCATTER,
    },
    {
      chartIndex: 12,
      type: 'biax',
      title: '双轴图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      isSelected: false,
      visible: false,
      chartNotice: ChartNotice.BIAX,
    }
  ];
  // 图表类型
  chartType: string = '';
  // 图表名称
  chartName: string = '';
  // 保存上一次图表类型
  storeChartType: string = '';

  /**
   * dimension/groupDimension/metric/type都会发生改变，需要监听chart
   */
  @Watch('chart', { deep: true })
  watchChart() {
    // 获取图表名称、类型
    this.getChartNameType();
    // 判断维度、指标
    this.judgeDimensionMetric();
    // 保存上一次图表类型
    this.storeChartType = this.chart.type;
  }

  /**
   * 获取图标样式
   */
  getChartClass(item) {
    let disabled = item.isDisabled ? `${this.prefixCls}__chart-disabled--${item.type}` : ''
    let selected = !item.isDisabled && item.isSelected ? `${this.prefixCls}__chart-selected--${item.type}` : `${this.prefixCls}__chart--${item.type}`;
    return `chart-class ${disabled} ${selected}`;
  }

  /**
   * 获取图表名称、类型
   */
  getChartNameType() {
    // 恢复默认
    this.resetData();
    // 赋值
    for (let i of this.chartList) {
      if (i.type === this.chart.type) {
        this.chartName = i.title;
        this.chartType = i.type;
        i.isSelected = true;
        break;
      }
    }
  }

  /**
   * 显示图表切换icon
   */
  iconSelect() {
    this.iconChange = !this.iconChange;
    // 更新滚动条
    this.$emit('refreshScroll');
  }

  /**
   * 恢复默认
   */
  resetData() {
    for (let i of this.chartList) {
      if (i.title === this.chartName && i.type === this.chartType) {
        i.isSelected = false;
      }
    }
  }

  /**
   * 判断维度、指标
   */
  judgeDimensionMetric() {
    let disabledCharts: Array<number> = [];
    let dimension:any[] = [];
    let metric:any[] = [];
    let groupDimension:any[] = [];
    // 过滤dimension、metric、groupDimension中的type。注：因为空字段没有type，需要过滤空字段的情况
    if (this.chart.data.dimension) {
      dimension = this.chart.data.dimension.filter((item)=> item.type);
    }
    if (this.chart.data.metric) {
      metric = this.chart.data.metric.filter((item)=> item.type);
    }
    if (this.chart.data.groupDimension) {
      groupDimension = this.chart.data.groupDimension.filter((item)=> item.type);
    }
    // groupDimension存在则为透视图
    if (this.chart.data.groupDimension) {
      const dimensionSum: number = dimension.length + groupDimension.length;
      // 维度+指标 > 20
      if ((dimensionSum + metric.length) > 20) {
        // 只存在透视图
        disabledCharts.push(0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12);
      } else {
        if (dimensionSum < 2) {
          // 1维多指标（不存在饼图、漏斗图、指标图）
          if (metric.length > 1) disabledCharts.push(1, 4, 5);
        } else if (dimensionSum > 2) {
          // 存在透视图、明细表
          disabledCharts.push(0, 1, 2, 3, 4, 5, 7, 8, 10, 11, 12);
        } else {
          if (metric.length < 2) {
            // 2维1指标（不存在饼图、漏斗图、指标图）
            disabledCharts.push(1, 4, 5);
          } else if (metric.length > 1 && metric.length < 4) {
            // 存在透视图、明细表、气泡图
            disabledCharts.push(0, 1, 2, 3, 4, 5, 7, 8, 10, 12);
          } else if (metric.length > 3) {
            // 存在透视图、明细表、双轴图
            disabledCharts.push(0, 1, 2, 3, 4, 5, 7, 8, 10, 11);
          }
        }
      }
    } else {
      // 判断维度中存在数值类型，则只能切换到明细表
      const numberDimension = dimension.find((item: any) => item.type === 'number');
      if (numberDimension) {
        disabledCharts.push(0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12);
      } else {
        if (dimension.length < 2 && metric.length > 1) {
          // （不存在饼图、漏斗图、指标图）
          disabledCharts.push(1, 4, 5);
        } else if (dimension.length === 2) {
          // 2维1标
          if (metric.length < 2) {
            // （不存在饼图、漏斗图、指标图）
            disabledCharts.push(1, 4, 5);
          } else {
            // 存在散点图、透视图、明细表
            disabledCharts.push(0, 1, 2, 3, 4, 5, 7, 8, 10, 12);
          }
        } else if (dimension.length > 2) {
          // 存在明细表、透视图
          disabledCharts.push(0, 1, 2, 3, 4, 5, 7, 8, 10, 11, 12);
        }
      }
    }
    this.chartList.forEach((chart: any, index: number) => {
      // 控制是否可选
      chart.isDisabled = disabledCharts.includes(index);
    });
  }

  /**
   * 图表切换
   * @param e
   * @param chart
   */
  async changeChart(e: any, chart: any) {
    // 相同类型的图表点击切换不刷新数据
    if (this.storeChartType === chart.type) return;
    // 阻止冒泡事件
    if (chart.isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // 上一次切换的值 - 恢复默认
    this.resetData();
    // 修改显示值
    this.chartName = chart.title;
    this.chartType = chart.type;
    chart.isSelected = true;
    // 修改charts的当前图表
    const index = this.charts.findIndex((tChart: H3.Report.Chart) => tChart.uid === this.chart.uid);
    const addElement = await this.addElement({ oldElement: JSON.parse(JSON.stringify(this.chart)), elementType: chart.type });
    this.charts.splice(index, 1, addElement);
    this.setActiveChart(this.charts[index]);
    this.$nextTick(()=> {
      this.resizeChartView({ chart:this.charts[index], type: 'data' });
    });
  }

  mounted() {
    // 获取图表名称、类型
    this.getChartNameType();
    // 判断维度、指标
    this.judgeDimensionMetric();
    // 保存上一次图表类型
    this.storeChartType = this.chart.type;
  }
}
</script>

<style lang='less'>
  .h3-report-chart-switch-module {
    &__switch {
      display: flex;
      align-items: center;
      position: relative;
      margin: 12px 0 20px 0;
      cursor: pointer;
      label {
        font-size:14px;
        font-weight:400;
        color:rgba(48,66,101,1);
        margin-left: 8px;
        cursor: pointer;
      }
      i {
        font-size: 12px;
        color: #8792A7;
        margin-left: auto;
        // transition: all 1s ease-out;
      }
      i.up-o {
        // transform: rotate(180deg);
      }
      i.down-o {
        // transform: rotate(0deg);
      }
    }
    &__chart-list {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-bottom: 8px;
      .workflowActionLoop(1);
    }
  }

  @chartType: bar, pie, radar, pileBar, funnel, card, table, line, stripe, list, area, scatter, biax;
  .chartBg-url(@imgName) {
    // default
    &__chart--@{imgName},
    .h3-report-chart-switch-module__chart--@{imgName}
    {
      background: url('~@h3/report/basics/assets/chart-switch/@{imgName}.png');
    }
    // selected
    &__chart--@{imgName},
    .h3-report-chart-switch-module__chart-selected--@{imgName} {
      background: url('~@h3/report/basics/assets/chart-switch/@{imgName}-select.png');
    }
    // disabled
    &__chart--@{imgName},
    .h3-report-chart-switch-module__chart-disabled--@{imgName}
    {
      cursor: not-allowed;
      background: url('~@h3/report/basics/assets/chart-switch/@{imgName}-disabled.png');
    }
  }

  .workflowActionLoop(@i) when (@i < (length(@chartType) + 1)) {
    .chartBg-url(extract(@chartType, @i));
    .workflowActionLoop(@i+1);
  }

  .chart-class {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    cursor: pointer;
    margin: 0 0 8px 19px;
  }
  .chart-class:nth-child(4n + 1) {
    margin-left: 0;
  }

</style>
