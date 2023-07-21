<template>
  <div :class="prefixCls">
    <a-select
      :class="`${this.prefixCls}__select`"
      :options="formulaList"
      :value="formulaLabel"
      placeholder="请设置过滤条件"
      @change="changeFormula"
    ></a-select>
    <div :class="`${this.prefixCls}__mask`" v-show="prevent"></div>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { Select } from '@h3/antd-vue';
import FilterTypes from '@h3/report/basics/enum/filter-type';

@Component({
  name: 'h3-report-filter-formula',
  components: {
    ASelect: Select,
  }
})
export default class FilterFormula extends Vue {
    prefixCls = 'h3-report-filter-formula';
    @Prop({ default: '' }) status!: 'design' | 'report' | 'preview';
    @Prop({ default: {} }) filter!: H3.Report.FilterFieldColumn;
    // 过滤逻辑集合
    formulaList: Array<string> = [];
    // 过滤逻辑展示值
    formulaLabel:string = '';
    activeType: 'date' | 'number' | 'string' | string = '';
    // 当前弹窗的过滤条件
    tmpFilter: H3.Report.FilterFieldColumn = JSON.parse(JSON.stringify(this.filter));
    
    get prevent() {
      return (this.status === 'design')
    }
    @Watch('filter', { immediate: true, deep: true })
    changeFilterPicker(value:H3.Report.FilterFieldColumn) {
      this.tmpFilter = Object.assign(this.tmpFilter, value);
      if (value.field) {
        this.activeType = value.field.type;
        this.formulaLabel = FilterTypes[value.field.type].find((item:{label:string, value: string}) => item.value === this.tmpFilter.formula).label;
      } else {
        // 兼容字段被删除后的反显
        for (const i in FilterTypes) {
          if (FilterTypes[i].find((item:{label:string, value: string}) => item.value === this.tmpFilter.formula)) {
            this.formulaLabel = FilterTypes[i].find((item:{label:string, value: string}) => item.value === this.tmpFilter.formula).label;
            return;
          }
        }
      }
      this.tmpFilter.formula = this.tmpFilter.formula ? this.tmpFilter.formula : 'Equal';
    }
    @Watch('activeType', { immediate: true })
    changeFilterType(value:string) {
      this.formulaList = value ? FilterTypes[value] : [];
    }
    
    /**
     *  公式改变时的处理
     * @param value
     */
    changeFormula(value: string) {
      this.tmpFilter.formula = value;
      this.tmpFilter.text = [''];
      this.formulaLabel = FilterTypes[this.activeType].find((item:any) => item.value === this.tmpFilter.formula).label;
      if (['None', 'NotNone','In', 'NotIn'].includes(value)) {
        this.tmpFilter.text = [];
      }
      this.$emit('change-filter', this.tmpFilter);
    }
}
</script>
<style lang="less">
  .h3-report-filter-formula {
    position: relative;
    &__select {
      width: 100%;
    }
    &__mask {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
</style>
