<template>
  <div :class="[prefixCls]">
    <a-select
      :showSearch="showSearch"
      :placeholder="placeholder"
      :class="[`${prefixCls}__field`]"
      :disabled="disabled"
      :notFoundContent="notFoundContent"
      :value="selectValue"
      :filterOption="filterOption"
      @change="schemaChange"
    >
      <a-select-opt-group
        v-for="(schemas, key) in getSchema"
        :class="[`${prefixCls}__group`]"
        :key="key"
      >
        <span slot="label" :class="[`${prefixCls}__group--label`]"><i :class="[`${prefixCls}__icon`,'h3yun_All table-o']"></i>{{ key }}</span>
        <a-select-option
          v-for="(schema, i) in schemas"
          :key="i"
          :disabled="schema.disabled"
          :value="`${schema.tableId}-${schema.field}`"
        >
          <i :class="[`${prefixCls}__icon`,`h3-report-icon ${schema.type}`]"></i>{{ schema.name }}
        </a-select-option>
      </a-select-opt-group>
    </a-select>
    <a-select
      v-if="dateOptionStatus && isExistSchema"
      :key="'dateType'"
      :disabled="disabled"
      :class="[`${prefixCls}__options`]"
      :defaultValue="field.options.format || 'Y'"
      :value="field.options.format || 'Y'"
      :options="dateType"
      @change="dateOptionChange"
    >
    </a-select>
    <a-select
      v-else-if="numberStatus && isExistSchema"
      :key="'numberAggregateType'"
      :disabled="disabled"
      :class="[`${prefixCls}__options`]"
      :defaultValue="field.options.aggregateType || 'SUM'"
      :value="field.options.aggregateType || 'SUM'"
      :options="numberAggregateType"
      @change="numberOptionChange"
    >
    </a-select>
    <a-select
      v-else-if="stringStatus && isExistSchema"
      :key="'stringAggregateType'"
      :disabled="disabled"
      :class="[`${prefixCls}__options`]"
      :defaultValue="field.options.aggregateType || 'COUNT'"
      :value="field.options.aggregateType || 'COUNT'"
      :options="stringAggregateType"
      @change="stringOptionChange"
    >
    </a-select>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Select } from '@h3/antd-vue';

@Component({
  name: 'h3-report-easy-field-select',
  components: {
    ASelect: Select,
    ASelectOptGroup: Select.OptGroup,
    ASelectOption: Select.Option
  }
})
export default class ReportEasyFieldSelect extends Vue {
  prefixCls = 'h3-report-easy-field-select';
  @Prop({ default: () => -1 }) index!: number;
  @Prop({ default: () => '请选择' }) placeholder!: string;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => ['string', 'date', 'number'] }) schemaType!: Array<string>;
  @Prop({ default: () => ({}) }) field !: H3.Report.FieldColumn;
  @Prop({ default: false }) disabled!: boolean;
  @Prop({ default: () => true }) showSearch!: boolean;
  // 配置总开关
  @Prop({ default: () => true }) allOptions!: boolean;
  // 扩展开关(日期)
  @Prop({ default: () => false }) extOptions!: boolean;
  // 聚合开关(数值、字符串)
  @Prop({ default: () => false }) aggregateOptions!: boolean;
  @Prop({ default: () => '无搜索结果' }) notFoundContent!: string;

  dateType: Array<any> = [
    { label: '年', value: 'Y' },
    { label: '年-季度', value: 'YQ' },
    { label: '年-月', value: 'YM' },
    { label: '年-周', value: 'YW' },
    { label: '年-月-日', value: 'YMD' }
  ];
  numberAggregateType: Array<any> = [
    { label: '总和值', value: 'SUM' },
    { label: '平均值', value: 'AVG' },
    { label: '最大值', value: 'MAX' },
    { label: '最小值', value: 'MIN' },
    { label: '计数', value: 'COUNT' },
  ];
  stringAggregateType: Array<any> = [
    { label: '计数', value: 'COUNT' },
  ];
  /**
   * 字段是否存在Schema
   */
  get isExistSchema() {
    if (this.field && this.field.uid) {
      const index = this.schemas.findIndex((field: H3.Report.FieldColumn) =>
        field.schemaCode === this.field.schemaCode &&
        field.field === this.field.field && field.visible);
      return index > -1;
    }
    return false;
  }

  /**
   * 获取日期配置项状态
   */
  get dateOptionStatus() {
    return this.extOptions && this.field.type === 'date';
  }

  /**
   * 获取数值配置项状态
   */
  get numberStatus() {
    return this.aggregateOptions && this.field.type === 'number';
  }

  /**
   * 获取字符串配置项状态
   */
  get stringStatus() {
    if (this.aggregateOptions) {
      if (this.field.type === 'string' || this.field.type === 'date') {
        return true;
      }
    }
    return false;
  }

  get selectValue() {
    return this.isExistSchema && this.field && this.field.tableId ? `${this.field.tableId}-${this.field.field}` : undefined;
  }

  get getSchema() {
    const schemas: { [key: string]: Array<H3.Report.FieldColumn> } = {};
    this.schemas.forEach((field: H3.Report.FieldColumn) => {
      if (this.schemaType.includes(field.type) && field.visible) {
        if (!schemas[field.tableName]) schemas[field.tableName] = [];
        schemas[field.tableName].push(field);
      }
    });
    return schemas;
  }

  schemaChange(value: string) {
    const keys: string[] = value.split('-');
    const schema: H3.Report.FieldColumn = JSON.parse(JSON.stringify(this.schemas.find((field: H3.Report.FieldColumn) => field.tableId === keys[0] && field.field === keys[1])));
    // 判断扩展开关
    if (this.extOptions) {
      if (schema.type === 'date') {
        // 默认选年
        schema.options.format = 'Y';
      }
    }
    // 判断聚合开关
    if (this.aggregateOptions) {
      if (schema.type === 'string') {
        schema.options.aggregateType = 'COUNT';
      } else if (schema.type === 'number') {
        schema.options.aggregateType = 'SUM';
      } else if (schema.type === 'date') {
        schema.options.aggregateType = 'COUNT';
      }
    }
    this.$emit('fieldChange', schema, this.index);
  }

  /**
   * 下拉选择器 - 是否根据输入项进行筛选
   * @param input
   * @param option
   */
  filterOption(input, option) {
    if (option.componentOptions.children[1].text.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
      return true;
    }
  }

  /**
   * 日期配置项选择
   * @param value
   */
  dateOptionChange(value: string) {
    if (this.field.options && this.dateType.findIndex((item: any) => item.value === value) > -1) {
      this.field.options.format = value;
      this.$emit('fieldChange', this.field, this.index);
    }
  }

  /**
   * 数值配置项选择
   * @param value
   */
  numberOptionChange(value: string) {
    if (this.field.options && this.numberAggregateType.findIndex((item: any) => item.value === value) > -1) {
      this.field.options.aggregateType = value;
      this.$emit('fieldChange', this.field, this.index);
    }
  }

  /**
   * 字符串配置项选择
   * @param value
   */
  stringOptionChange(value: string) {
    if (this.field.options && this.numberAggregateType.findIndex((item: any) => item.value === value) > -1) {
      this.field.options.aggregateType = value;
      this.$emit('fieldChange', this.field, this.index);
    }
  }
}
</script>
<style lang="less">
  .h3-report-easy-field-select{
    display: flex;
    &__field{
      flex: 1;
      overflow: hidden;
    }
    &__field + &__options {
      margin-left: 8px;
    }
    &__options {
      flex: 0 0 120px;
      width: 120px;
    }
    &__icon{
      margin-right: 2px;
    }
    &__group--label{
      font-size: 14px;
    }
  }
  .ant-select-dropdown-menu-item-disabled {
    color: #C9CCD8;
    &:hover {
      color: #C9CCD8;
    }
  }
  .ant-select-selection__placeholder {
    color: #C9CCD8;
  }
</style>
