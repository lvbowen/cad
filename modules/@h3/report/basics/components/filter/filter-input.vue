<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { CreateElement } from 'vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { Select } from '@h3/antd-vue';
import FilterTypes from '@h3/report/basics/enum/filter-type';
import H3FilterElement from './filter-element.vue';
import H3FilterFormula from './filter-formula.vue';

  @Component({
    name: 'h3-report-filter-input',
    components: {
      ASelect: Select,
      H3FilterFormula,
      H3FilterElement
    }
  })
export default class FilterInput extends Vue {
    @Prop({ default: {} }) filter!: H3.Report.FilterFieldColumn;
    @Prop({ default: '' }) format!: string; // 筛选方式
    @Prop({ default: false }) checkEmpty!: boolean; // 检测空值
    @Prop({ default: '' }) status?: 'design' | 'report' | 'preview'; // 状态
    @Prop() global!: H3.Report.Global;
    
    prefixCls = 'h3-report-filter-input';
    activeType:string = '';
    // 过滤公式集合
    formulaOptions: Array<string> = [];
    formulaLabel:string = '';

    // 当前弹窗的过滤条件
    tmpFilter: H3.Report.FilterFieldColumn = JSON.parse(JSON.stringify(this.filter));
    @Watch('filter', { immediate: true, deep: true })
    changeFilterPicker(value:H3.Report.FilterFieldColumn) {
      this.tmpFilter = Object.assign(this.tmpFilter, value);
      if (value.field) {
        this.activeType = value.field.type;
        this.formulaLabel = FilterTypes[this.activeType].find((item:{label:string, value: string}) => item.value === this.tmpFilter.formula).label;
      } else {
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
      this.formulaOptions = value ? FilterTypes[value] : [];
    }
    /**
     *  更改筛选逻辑
     * @param filter 
     */
    changeFilter(filter: H3.Report.FilterFieldColumn) {
      this.tmpFilter = filter;
      this.$emit('change-filter', this.tmpFilter);
    }
    /**
     *  更改筛选条件
     * @param value 值
     */
    valueChange(value:Array<any>) {
      this.tmpFilter.text = value;
      this.$emit('change-filter', this.tmpFilter);
    }
    render(h: CreateElement) {
      const Formula = h(H3FilterFormula, {
        class: `${this.prefixCls}__formula`,
        props: {
          filter: this.tmpFilter
        },
        on: {
          'change-filter': this.changeFilter
        }
      });
      const filterElement = h(H3FilterElement, {
        props: {
          filter: this.tmpFilter,
          format: this.format,
          status: this.status,
        },
        on: {
          'change-value': this.valueChange
        }
      });
      return h('div', {
        class: this.prefixCls,
      }, [Formula, filterElement
      ]);
    }
}
</script>
<style lang="less">
  .h3-report-filter-input {
    &__formula {
      width: 100%;
      margin-top: 10px;
    }
  }
  .filterPicker {
    .h3-report-filter-input {
      padding: 3px 15px 0;
    }
  }
</style>
