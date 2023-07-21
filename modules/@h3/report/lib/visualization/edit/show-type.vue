<template>
  <div :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>图表类型</label>
    </div>
    <a-radio-group
      :value="type"
      :class="[`${prefixCls}__body`, `${comPrefixCls}__body`]"
      @change="chartChange"
    >
      <a-tooltip
        v-for="(item, index) in chartShowType"
        :key="index"
        :visible="item.visible"
        :class="`${prefixCls}__chart--${item.type}`"
        :placement="getTipType(index)"
        :getPopupContainer="getPopupContainer"
      >
        <template slot="title">
          <div class="title">{{ item.title }}</div>
          <div class="content" v-html="item.content"></div>
        </template>
        <a-radio-button
          :value="item.type"
          :disabled="item.isDisabled"
          :class="{ 'h3-report-easy-edit-show-type__chart-btn': true, 'h3-report-easy-edit-show-type__chart-disabled': item.isDisabled }"
          @mouseenter="mouseenter(item)"
          @mouseleave="mouseleave(item)"
        >
        </a-radio-button>
      </a-tooltip>
    </a-radio-group>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Radio, Tooltip } from '@h3/antd-vue';
@Component({
  name: 'h3-report-easy-edit-show-type',
  components: {
    ATooltip: Tooltip,
    ARadioGroup: Radio.Group,
    ARadioButton: Radio.Button,
  }
})
export default class ReportEasyEdit extends Vue {
  @Prop() comPrefixCls!: string;
  @Prop() type!: string;
  prefixCls = 'h3-report-easy-edit-show-type';
  tipLabels = {
    label1: '0个维度、1个指标<br>1个维度、1个指标',
    label2: '1个维度、1个指标',
    label3: '1个维度、1个或多个指标<br>2个维度、1个指标',
    label4: '1个维度、1个或多个指标<br>多个维度、1个或多个指标'
  };
  chartShowType = [
    {
      type: 'table',
      title: '透视图',
      dimension: 20,
      groupDimension: 20,
      metric: 20,
      isDisabled: false,
      content: this.tipLabels.label4,
      visible: false
    }, {
      type: 'pie',
      title: '饼图',
      dimension: 1,
      metric: 1,
      isDisabled: false,
      content: this.tipLabels.label2,
      visible: false
    }, {
      type: 'bar',
      title: '柱状图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      content: this.tipLabels.label3,
      visible: false
    }, {
      type: 'radar',
      title: '雷达图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      content: this.tipLabels.label3,
      visible: false
    }, {
      type: 'line',
      title: '折线图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      content: this.tipLabels.label3,
      visible: false
    }, {
      type: 'stripe',
      title: '条形图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      content: this.tipLabels.label3,
      visible: false
    }, {
      type: 'card',
      title: '指标图',
      dimension: 1,
      metric: 1,
      isDisabled: false,
      content: this.tipLabels.label1,
      visible: false
    }, {
      type: 'funnel',
      title: '漏斗图',
      dimension: 1,
      metric: 1,
      isDisabled: false,
      content: this.tipLabels.label2,
      visible: false
    }, {
      type: 'area',
      title: '面积图',
      dimension: 2,
      metric: 20,
      isDisabled: false,
      content: this.tipLabels.label3,
      visible: false
    }
  ];

  /**
   * 图表change
   * @param e
   */
  chartChange(e: Event) {
    this.$emit('chartChange', (e.target as HTMLInputElement).value as H3.Report.ElementType);
  }

  /**
   * 判断维度
   * @param dataGroup
   */
  judgeDimension(dataGroup: H3.Report.ChartDataGroup) {
    const disabledCharts: Array<number> = [];
    let dimension:any[] = [];
    let metric:any[] = [];
    let groupDimension:any[] = [];
    // 过滤dimension、metric、groupDimension中的type
    if (dataGroup.dimension) {
      dimension = dataGroup.dimension.filter((item)=> item.type);
    }
    if (dataGroup.metric) {
      metric = dataGroup.metric.filter((item)=> item.type);
    }
    if (dataGroup.groupDimension) {
      groupDimension = dataGroup.groupDimension.filter((item)=> item.type);
    }

    if (!dataGroup.groupDimension) {
      if (dimension.length === 2 || metric.length >= 2) {
        // 2维1指标 or 1维多指标
        disabledCharts.push(6, 1, 7);
      }
    } else {
      if (((dimension.length + groupDimension.length) === 2 && metric.length <= 1) || ((dimension.length + groupDimension.length) <= 1 && metric.length >= 2)) {
        // 2维1指标 or 1维多指标
        disabledCharts.push(6, 1, 7);
      }
      else if ((dimension.length + groupDimension.length) > 2 || ((dimension.length + groupDimension.length) === 2 && metric.length >= 2)) {
        // 多维 or 2维多指标
        disabledCharts.push(1, 2, 3, 4, 5, 6, 7, 8);
      }
    }
    this.chartShowType.forEach((type: any, index: number) => {
      type.isDisabled = disabledCharts.includes(index);
    });
  }

  /**
   * 获取提示类型
   * @param index
   */
  getTipType(index: number) {
    const tipIndex = index % 3;
    switch (tipIndex) {
      case 0:
        return 'right';
      case 1:
        return 'bottom';
      case 2:
        return 'left';
      default:
        return 'left';
    }
  }

  /**
   * 鼠标移入
   * @param item
   */
  mouseenter(item: any) {
    item.visible = true;
  }

  /**
   * 鼠标移出
   * @param item
   */
  mouseleave(item: any) {
    item.visible = false;
  }


  getPopupContainer() {
    return this.$el;
  }
}
</script>

<style lang="less">
@chartType: card, line, pie, bar, area, funnel, table, stripe, radar;
.chartBg-url(@imgName) {
  &__chart--@{imgName},
  .h3-report-easy-edit-show-type__chart--@{imgName}
  {
    background: url('~@h3/report/basics/assets/chart-icon/@{imgName}.svg');
  }
  &__chart--@{imgName}:hover,.ant-radio-button-wrapper-checked.h3-report-easy-edit-show-type__chart--@{imgName} {
    background: url('~@h3/report/basics/assets/chart-icon/@{imgName}-select.svg');
  }
 &__chart--@{imgName},
  .ant-radio-button-wrapper-disabled.h3-report-easy-edit-show-type__chart--@{imgName}
  {
    background: url('~@h3/report/basics/assets/chart-icon/@{imgName}-disabled.svg');
  }
}

.workflowActionLoop(@i) when (@i < (length(@chartType) + 1)) {
  .chartBg-url(extract(@chartType, @i));
  .workflowActionLoop(@i+1);
}

.h3-report-easy-edit-show-type {
  padding-top: 16px !important;
  .ant-radio-group {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 0 20px 0 16px;
  }

  .ant-radio-button-wrapper + .ant-radio-button-wrapper {
    margin-left: 52px;
  }
  .ant-radio-button-wrapper:nth-child(3n+1) {
    margin-left: 0;
  }

  .ant-radio-button-wrapper:nth-last-child(-n+3) {
    margin-bottom: 0;
  }

  .ant-radio-button-wrapper {
    flex: 0 0 60px;
    width: 60px;
    height: 60px;
    margin-bottom: 22px;
    box-shadow: none !important;
    border: 0 !important;
    border-radius: 0;

    &:before {
      display: none !important;
    }
  }
  .workflowActionLoop(1);

  .ant-tooltip-placement-right .ant-tooltip-arrow {
    border-right-color: #FFF;
  }

  .ant-tooltip-placement-bottom .ant-tooltip-arrow {
    border-bottom-color: #FFF;
  }

  .ant-tooltip-placement-left .ant-tooltip-arrow {
    border-left-color: #FFF;
  }
  .ant-tooltip {
    .ant-tooltip-inner{
      background: #FFF;
      box-shadow:0 2px 8px 0 rgba(0,0,0,0.15);
      div{
        color: #304265;
      }
    }
  }
}
</style>
