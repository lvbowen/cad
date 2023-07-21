<template>
  <div :class="`${prefixCls}`">
    <h3-radio-group
      v-model="filter.formula"
      layout="vertical"
      @change="changeFormula"
    >
      <h3-radio
        :key="item.value"
        v-for="item in formulaList"
        :value="item.value"
        :label="item.label"
      />
    </h3-radio-group>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { H3Radio  } from '@h3/thinking-ui';
import FilterTypes from '@h3/report/basics/enum/filter-type';

const ReportPro = namespace('report');
  @Component({
    name: 'h3-report-filter-formula',
    components: {
      H3Radio,
      H3RadioGroup: H3Radio.Group,
    }
  })
export default class ReportFilterFormula extends Vue {
    @Prop({ default: {} }) filter!: H3.Report.FilterPicker;
    prefixCls = 'h3-report-filter-formula';
    
    get formulaList() {
      return FilterTypes[this.filter.field.type]
    }
    /**
     *  公式改变时的处理
     * @param value
     */
    changeFormula(value: string) {
      this.filter.formula = value;
      if (this.filter.field.type === 'date' && this.filter.formula === 'Equal') {
        this.filter.text.splice(0, this.filter.text.length, 'Today');
      } else {
        this.filter.text.splice(0, this.filter.text.length);
      }
      
      this.$emit('change', this.filter);
    }
}
</script>
<style lang="less">
  .h3-report-filter-formula {
    padding: 0 16px;
  }
</style>
