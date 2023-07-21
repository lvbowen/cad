<!-- 数据显示设置 -->
<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
      <div :class="[`${prefixCls}__checkbox-wrap`]">
        <a-checkbox
          :class="[`${prefixCls}__checkbox`]"
          :checked="data.displayAxisX"
          @change="changeDisplayAxisX"
        ></a-checkbox>
        <label class="label-value">显示坐标轴</label>
      </div>
      <div :class="[`${prefixCls}__checkbox-wrap`]">
        <a-checkbox
          :class="[`${prefixCls}__checkbox`]"
          :checked="data.displayLabel"
          @change="changeDisplayLabel"
        ></a-checkbox>
        <label class="label-value">显示标签</label>
      </div>
      <div :class="`${prefixCls}__select-wrap`" v-show="data.displayLabel">
        <span>文字方向</span>
        <a-select
          :class="`${prefixCls}__select`"
          :options="directionList"
          :value="data.direction"
          placeholder="请选择"
          @change="changeDirection"
        ></a-select>
      </div>
    </div>
  </div>
</template>

<script lang=ts>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Checkbox, Select } from '@h3/antd-vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';
import { DirectionList } from '@h3/report/basics/enum/common-type';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-legend-module',
  components: {
    ACheckbox: Checkbox,
    ASelect: Select,
  }
})
export default class ReportLegendModule extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Legend;
  @Prop({ default: true }) data!: H3.Report.Legend;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = 'h3-report-axis-x-module';
  directionList: Array<{label: string,value: string}> = DirectionList;
  

  /**
   * 显示坐标轴
   * @param e
   */
  changeDisplayAxisX(e) {
    this.$set(this.chart.styles.axisX, 'displayAxisX', e.target.checked);
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
  /**
   * 显示标签
   * @param e
   */
  changeDisplayLabel(e) {
    this.$set(this.chart.styles.axisX, 'displayLabel', e.target.checked);
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
  /**
   * 显示图例位置
   * @param value
   */
  changeDirection(value) {
    console.log('改变位置',value);
    this.$set(this.chart.styles.axisX, 'direction', value);
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
}
</script>

<style lang='less'>
.h3-report-axis-x-module{
  border-bottom: none !important;
  color: #304265;
  &__checkbox-wrap {
    display: flex;
    align-items: center;
    padding-top: 8px;
    .label-value {
      color: #304265;
      font-size: 14px;
      margin-left: 8px;
    }
    label {
      font-weight: normal !important;
    }
  }
  &__select-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }
  &__select {
    width: 118px;
  }
}
</style>
