<template>
  <h3-formula
    v-if="showFormula"
    :filter="filter"
    :status="status"
    :class="prefixCls"
    @change-filter= "changeFilter"
  ></h3-formula>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ElementType } from '@h3/report/basics/enum/chart-type';
import H3Formula from '@h3/report/basics/components/filter/filter-formula.vue';


const ReportPro = namespace('report');
  @Component({
    name: 'h3-design-header-formula',
    components: {
      H3Formula
    }
  })
export default class FilterFormula extends Vue {
    @Prop({ default: () => {} }) chart!: H3.Report.FilterPicker;
    @Prop({ default: 'design' }) status!: 'design' | 'report' | 'preview';
    prefixCls = 'h3-design-header-formula';

    // 展示过滤公式
    get showFormula(){
      return this.chart.type === ElementType.FILTERPICKER;
    }
    // 过滤参数
    get filter(){
      if (this.chart.type === ElementType.FILTERPICKER) {
        return {
          field: ((this.chart as H3.Report.FilterPicker).dataSources.length && (this.chart as H3.Report.FilterPicker).dataSources[0].field) ? (this.chart as H3.Report.FilterPicker).dataSources[0].field : (this.chart as H3.Report.FilterPicker).field,
          formula: (this.chart as H3.Report.FilterPicker).formula,
          text: (this.chart as H3.Report.FilterPicker).text
        };
      }
    }
    
    /**
     * 更改过滤条件
     *  filter 字段过滤参数
     */
    changeFilter(filter: H3.Report.FilterFieldColumn) {
      (this.chart as H3.Report.FilterPicker).formula = filter.formula;
      (this.chart as H3.Report.FilterPicker).text = filter.text;
    }
}
</script>
<style lang="less">
  .h3-design-header-formula {
    display: flex;
    margin-left: 15px;
    .ant-select-selection{
      background:rgba(240,248,254,1);
      border-radius: 4px;
      width: 140px;
      border: none;
    }
    .ant-select-selection__rendered {
      line-height: 32px;
    }
    .ant-select-selection .ant-select-selection--single {
      height: 100%;
    }
    .ant-select-focused .ant-select-selection, .ant-select-selection:focus, .ant-select-selection:active{
      box-shadow: none;
    }
    .ant-select-open .ant-select-selection{
      box-shadow: none;
    }
  }
</style>
