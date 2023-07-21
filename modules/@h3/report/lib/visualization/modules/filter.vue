<template>
  <div v-if="false" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
      <div
        v-for="(filter, i) in data"
        :class="[`${prefixCls}__filter`]"
        :key="i"
      >
        <div :class="[`${prefixCls}__field`]">
          <h3-report-field-select
            :class="[`${prefixCls}__select`]"
            :key="i"
            :index="i"
            :placeholder="'请选择筛选条件'"
            :schemas="schemas"
            :schemaType="['string', 'date', 'number']"
            :field="filter.field"
            :isOptions="false"
            @fieldChange="fieldChange"
          ></h3-report-field-select>
          <a-select
            style="width: 150px"
            :class="[`${prefixCls}__formula`]"
            :value="filter.formula"
            :options="filter.field ? formulaOptions[filter.field.uid] : []"
            @change="optionsChange($event, i)"
          ></a-select>
        </div>
        <div :class="[`${prefixCls}__options`]">
          <div :class="[`${prefixCls}__text`]">
            <template v-if="filter.field && filter.field.type && !['EMPTY', 'NOEMPTY'].includes(filter.formula)">
              <a-input @input="formulaTextChange($event, filter)" v-if="filter.field.type === 'string' "></a-input>
              <template v-else-if="filter.field.type === 'date'">
                <a-range-picker @change="formulaTextChange($event, filter)" v-if="filter.formula === '~'"/>
                <a-date-picker @change="formulaTextChange($event, filter)" v-else/>
              </template>
              <template v-else-if="filter.field.type === 'number'">
                <div :class="[`${prefixCls}__range`, 'ant-input']" v-if="filter.formula === '~'">
                  <a-input @input="formulaTextChange($event, filter, 0)"></a-input>
                  <span>~</span>
                  <a-input @input="formulaTextChange($event, filter, 1)"></a-input>
                </div>
                <a-input v-else @input="formulaTextChange($event, filter)"></a-input>
              </template>
            </template>
          </div>
          <div :class="[`${prefixCls}__remove`]">
            <a @click="removeFilter(i)">
              <i class="h3-report-icon delete"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
    <div :class="[`${prefixCls}__add`]">
      <a @click="addFilter">
        <i class="h3-report-icon add"></i>筛选条件
      </a>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { uuid } from '@h3/report/basics/utils/uid';
import moment, { Moment } from 'moment';
import { Select, Input, DatePicker, RangePicker } from '@h3/antd-vue';
import H3ReportFieldSelect from './field-select.vue';

@Component({
  name: 'h3-report-easy-filter-module',
  components: {
    H3ReportFieldSelect,
    ADatePicker: DatePicker,
    ARangePicker: DatePicker.RangePicker,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option
  }
})
export default class ReportEasyFilterModule extends Vue {
  prefixCls = 'h3-report-easy-filter-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Filter;
  @Prop({ default: () => ({}) }) data!: Array<H3.Report.FilterFieldColumn>;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;

  formulaOptions: any = {};
  formulaType: any = {
    string: [
      { label: '等于', value: 'Equal' },
      { label: '不等于', value: 'NotEqual' },
      { label: '开头为', value: 'StartWith' },
      { label: '包含', value: 'In' },
      { label: '不包含', value: 'NotIn' },
      { label: '为空', value: 'None' },
      { label: '不为空', value: 'NotNone' },
    ],
    date: [
      { label: '等于', value: 'Equal' },
      { label: '不等于', value: 'NotEqual' },
      { label: '范围', value: 'Range' },
      { label: '大于', value: 'Above' },
      { label: '大于等于', value: 'NotBelow' },
      { label: '小于', value: 'Below' },
      { label: '小于等于', value: 'NotAbove' },
      { label: '为空', value: 'None' },
      { label: '不为空', value: 'NotNone' },
    ],
    number: [
      { label: '等于', value: 'Equal' },
      { label: '不等于', value: 'NotEqual' },
      { label: '范围', value: 'Range' },
      { label: '大于', value: 'Above' },
      { label: '大于等于', value: 'NotBelow' },
      { label: '小于', value: 'Below' },
      { label: '小于等于', value: 'NotAbove' },
      { label: '为空', value: 'None' },
      { label: '不为空', value: 'NotNone' },
    ]
  };

  /**
   * 是否能添加指标
   */
  get isAddFilter() {
    return !this.module.max || this.getData.length < this.module.max;
  }
  /**
   * 获取数据
   */
  get getData() {
    return Object.assign([{}], this.data);
  }
  /**
   * 字段改变
   * @param filed
   * @param index
   */
  fieldChange(filed: H3.Report.FieldColumn, index: number) {
    filed.uid = uuid(8, 16);
    this.formulaOptions[filed.uid] = this.formulaType[filed.type];
    this.data.splice(index, 1, { field: filed, formula: 'EMPTY', text: [] });
  }
  optionsChange(value: string, index: number) {
    this.data[index].formula = value;
  }
  /**
   * 新增指标
   */
  addFilter() {
    this.data.push({} as H3.Report.FilterFieldColumn);
  }
  /**
   * 删除指标
   * @param index
   */
  removeFilter(index: number) {
    this.data.splice(index, 1);
  }

  formulaTextChange(value: any, filter: H3.Report.FilterFieldColumn, index?: number) {
    switch (filter.field.type) {
      case 'string':
        console.log('string', value.target.value);
        break;
      case 'date':
        if (value instanceof Array) {
          filter.text = [];
          value.forEach((date: Moment) => {
            filter.text.push(date.format('YYYY-DD-MM'));
          });
        } else {
          filter.text.push((value as Moment).format('YYYY-DD-MM'));
        }
        break;
      case 'number':
        console.log('number', value.target.value, index);
        break;
      default:
        break;
    }
    console.log('formulaTextChange', value, filter);
  }

  mounted() {
    this.data.forEach((filter: H3.Report.FilterFieldColumn) => {
      this.formulaOptions[filter.field.uid] = this.formulaType[filter.field.type];
    });
  }
}
</script>
<style lang="less">
  .h3-report-easy-filter-module{
    &__field,&__options{
      display: flex;
    }
    &__select, &__text{
      flex: 0 0 211px;
    }
    &__filter + &__filter,
    &__field + &__options{
      margin-top: 8px;
    }
    &__select + &__formula,
    &__text + &__remove{
      margin-left: 8px;
    }
    &__formula, &__remove
    {
      flex: 0 0 120px;
    }
    &__remove{
      display: flex;
      height: 32px;
      padding-right: 10px;
      justify-content: flex-end;
      align-items: center;
    }
    &__add{
      margin-top: 20px;
      i{
        margin-right: 5px;
      }
      text-align: center;
    }
    &__range{
      display: flex;
      align-items: center;
      padding: 0;
      overflow: hidden;
      input{
        border: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
    }
  }
</style>
