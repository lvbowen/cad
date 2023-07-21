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
          :checked="data.checked"
          @change="changeDisplay"
        ></a-checkbox>
        <label class="label-value">显示图例</label>
      </div>
      <div :class="`${prefixCls}__select-wrap`" v-show="data.checked">
        <span>图例显示</span>
        <a-select
          :class="`${prefixCls}__select`"
          :options="positionList"
          :value="data.position"
          placeholder="请选择"
          @change="changePosition"
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
import { PositionList } from '@h3/report/basics/enum/common-type';

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
  prefixCls = 'h3-report-legend-module';
  positionList: Array<{label: string,value: string}> = PositionList;
  

  /**
   * 显示图例
   * @param e
   */
  changeDisplay(e) {
    this.$set(this.chart.styles.legend, 'checked', e.target.checked);
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
  /**
   * 显示图例位置
   * @param value
   */
  changePosition(value) {
    this.$set(this.chart.styles.legend, 'position', value);
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
}
</script>

<style lang='less'>
.h3-report-legend-module{
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
  &__checkbox {
    margin-bottom: 2px;
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
