<template>
  <div :class="prefixCls" v-if="charts">
    <a-checkbox-group
      :class="[`${prefixCls}__group`]"
      :value="chartIds"
      @change="onChange"
    >
      <a-checkbox
        v-for="(item, index) in getCharts"
        :key="index"
        :value="item.uid"
      >{{ item.title }}
      </a-checkbox>
    </a-checkbox-group>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { Checkbox } from '@h3/antd-vue';
import H3Scroll from '@h3/report/basics/components/scroll';
import { ElementType } from '@h3/report/basics/enum/chart-type';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-set-chart',
  components: {
    H3Scroll,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group
  }
})
export default class SetChart extends Vue {
  @Prop({ default: () => ([]) }) chartIds!: Array<string>;
  @ReportPro.State('charts') charts!: Array<H3.Report.Chart>;
  prefixCls:string = 'h3-report-set-chart';
  
  get getCharts() {
    return this.charts.filter(item => !(item.type === ElementType.FILTERPICKER || item.type === ElementType.LONGTEXT));
  }
  
  onChange(value: Array<string>) {
    this.$emit('change-chart-ids', value);
  }
}
</script>
<style lang="less">
  @import "~@h3/report/basics/styles/index";

  .h3-report-set-chart {
    display: flex;
    flex-direction: column;
    &__group{
      display: flex;
      flex-direction: column;
      .ant-checkbox-wrapper{
        margin: 5px 0 5px 12px;
      }
    }
  }
</style>
