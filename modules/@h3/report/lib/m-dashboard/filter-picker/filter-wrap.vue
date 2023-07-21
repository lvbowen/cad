<template>
  <h3-accordion :class="prefixCls">
    <h3-accordion-item
      v-for="(item,index) in filters"
      :key="index"
      position="right"
      icon="right"
    >
      <div slot="title" :class="`${prefixCls}__title-wrap`">
        <span :class="`${prefixCls}__title`"> {{ item.title }} </span>
        <span :class="`${prefixCls}__tip`"> {{ isSetFilter(item) }} </span>
      </div>
      <h3-accordion>
        <h3-accordion-item
          position="right"
          icon="right"
        >
          <div slot="title" :class="`${prefixCls}__title-wrap`">
            <span> 筛选逻辑 </span>
            <span :class="`${prefixCls}__tip`">  {{ getFormulaLabel(item) }} </span>
          </div>
          <div :class="`${prefixCls}__item`">
            <filter-formula
              :filter="item"
              @change="changeFilter"
            >
            </filter-formula>
          </div>
        </h3-accordion-item>
        <h3-accordion-item
          v-if="!['None', 'NotNone'].includes(item.formula)"
          position="right"
          icon="right"
        >
          <div slot="title" :class="`${prefixCls}__title-wrap`">
            <span> 筛选条件 </span>
            <span :class="`${prefixCls}__tip`">  {{ isSetFilterText(item) }} </span>
          </div>
          <div :class="`${prefixCls}__item`">
            <filter-element
              :filter="item"
              @change="changeFilter"
            >
            </filter-element>
          </div>
        </h3-accordion-item>
      </h3-accordion>
    </h3-accordion-item>
  </h3-accordion>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { H3Accordion  } from '@h3/thinking-ui';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ElementType } from '@h3/report/basics/enum/chart-type';
import FilterTypes from '@h3/report/basics/enum/filter-type';
import FilterFormula from './filter-formula.vue';
import FilterElement from './filter-element.vue';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-filter-wrap',
  components: {
    H3Accordion,
    H3AccordionItem: H3Accordion.Item,
    FilterFormula,
    FilterElement
  }
})
export default class ReportFilterWrap extends Vue {
  @Prop({ default: () => false }) value!: boolean;
  @Prop({ default: () => [] }) filters!: Array<H3.Report.FilterPicker>;
  prefixCls:string = 'h3-report-mobile-filter-wrap';

  isSetFilter(filter: H3.Report.FilterPicker) {
    if(filter.formula &&(['None', 'NotNone'].includes(filter.formula) ||(filter.formula === 'Range' && filter.text[0] && filter.text[1]) || (filter.formula !== 'Range' && filter.text[0]))) {
      return '已设置'
    } 
    return ''
  }
  
  isSetFilterText(filter: H3.Report.FilterPicker){
    return ((filter.formula === 'Range' && filter.text[0] && filter.text[1]) || (filter.formula !== 'Range' && filter.text[0])) ? '已设置': '';
  }

  /**
   *  获取公式显示字段
   *  @filter
   */
  getFormulaLabel(filter: H3.Report.FilterPicker) {
    return FilterTypes[filter.field.type].find((item:{label:string, value: string}) => item.value === filter.formula).label;
  }

  /**
   *  更改筛选
   *  @filter
   */
  changeFilter(filter: H3.Report.FilterPicker) {
    let index = this.filters.findIndex((item: H3.Report.FilterPicker)=> {
      return item.uid === filter.uid;
    });
    if(index) {
      this.$set(this.filters,index,filter);
      this.$emit('change', this.filters);
    }
  }
  
  created() {}
  destroyed() {}
}
</script>
<style lang="less">
  .h3-report-mobile-filter-wrap {
    &__title-wrap{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    &__title {
      max-width: 80%;
      overflow: hidden;
    }
    &__tip{
      color: #107FFF;
      font-size: 12px;
    }
    &__item{
      background:rgba(245,247,249,1);
    }
    .h3think-accordion{
      .h3think-accordion-item__header {
        margin-left: 16px;
      }
    }
  }
</style>
