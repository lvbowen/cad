<template>
  <div>
    <div v-if="module.operation" :class="[prefixCls, comPrefixCls]">
      <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
        <label>{{ module.operation.title }}</label>
      </div>
      <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
        <a-checkbox
          :class="[`${prefixCls}__checkbox`]"
          :checked="data.operation.export"
          @change="change($event, 'export')"
        ></a-checkbox>
        <label class="label-value">允许导出</label>
      </div>
    </div>
    
    <div v-if="module.order" :class="[prefixCls, comPrefixCls]">
      <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
        <label>{{ module.order.title }}</label>
      </div>
      <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
        <a-checkbox
          :class="[`${prefixCls}__checkbox`]"
          :checked="data.order.display"
          @change="change($event, 'order')"
        ></a-checkbox>
        <label class="label-value">显示序号</label>
      </div>
    </div>
    
    <div v-if="module.freeze" :class="[prefixCls, comPrefixCls]">
      <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
        <label>{{ module.freeze.title }}</label>
      </div>
      <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
        <a-checkbox
          :class="[`${prefixCls}__checkbox`]"
          :checked="data.freeze.row"
          @change="change($event, 'row')"
        ></a-checkbox>
        <label class="label-value">冻结行维度</label>
      </div>
      
      <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
        <a-checkbox
          :class="[`${prefixCls}__checkbox`]"
          :checked="data.freeze.column"
          @change="change($event, 'column')"
        ></a-checkbox>
        <label class="label-value">冻结列维度</label>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Checkbox } from '@h3/antd-vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-special-module',
  components: {
    ACheckbox: Checkbox,
  }
})
export default class ReportChartLinkage extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Linkage;
  @Prop({ default: () => {} }) data!: any;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = 'h3-report-special-module';

  /**
   * onchange事件
   * @param e
   */
  change(e, key) {
    switch (key) {
      case 'export':
        this.$set(this.chart.styles.special.operation, key, e.target.checked);
        break;
      case 'order':
        this.$set(this.chart.styles.special.order, 'display', e.target.checked);
        break;
      case 'row':
        this.$set(this.chart.styles.special.freeze, key, e.target.checked);
        break;
      case 'column':
        this.$set(this.chart.styles.special.freeze, key, e.target.checked);
        break;
    }
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }
}
</script>
<style lang='less'>
.h3-report-special-module {
  &__body {
    margin-top: 8px;
    .label-value {
      color: #304265;
      font-size: 14px;
      margin-left: 10px;
    }
  }
}
.h3-report-special-module.report-modules{
  border-bottom: none;
}
</style>
