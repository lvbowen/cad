<template>
  <div :class="prefixCls">
    <a-select
      showSearch
      placeholder="请选择字段"
      :class="[`${prefixCls}__input`]"
      :value= "value"
      @change="changeField"
    >
      <a-select-option
        v-for="(field,i) in fields"
        :key="i"
        :value= "field.id"
      >
        <i :class="[`${prefixCls}__icon`,`h3-report-icon ${field.type}`]"></i>{{ field.text }}
      </a-select-option>
    </a-select>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Select } from '@h3/antd-vue';

@Component({
  name: 'h3-report-source-field-select',
  components: {
    ASelect: Select,
    ASelectOptGroup: Select.OptGroup,
    ASelectOption: Select.Option
  }
})
export default class ReportSourceFieldSelect extends Vue {
  @Prop({ default: () => '请选择' }) placeholder!: string;
  @Prop({ default: () => -1 }) index!: number;
  @Prop({ default: () => '' }) nodeId!: string;
  @Prop({ default: () => ({}) }) fields!: Array<H3.Falls.Field>;
  @Prop({ default: () => ('') }) value!: string;
  prefixCls = '.h3-report-source-field-select';

  
  /**
   * 修改字段
   * @param val
   */
  changeField(val:string) {
    let tmpField = this.fields.find(item=> val===item.id);
    if(tmpField) {
      this.$emit('change-field', tmpField,this.index,this.nodeId);
    }
  }
}
</script>
<style lang="less">
  .h3-report-source-field-select{
   
  }
</style>
