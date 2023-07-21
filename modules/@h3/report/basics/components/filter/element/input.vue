<template>
  <div :class="`${prefixCls}`">
    <h3-input
      v-model="inputValue"
      :placeholder = "placeholderText"
      @input = "changeText($event)"
      :maxlength = "200"
    />
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch,Mixins } from 'vue-property-decorator';
import FilterMixins from '@h3/report/basics/mixins/filter-mixins';
import { Input } from '@h3/antd-vue';
import Regexp from '@h3/report/basics/utils/regexp';

@Component({
  name: 'h3-report-element-filter-input',
  components: {
    H3Input: Input
  }
})
export default class ReportElementFilterInput extends Mixins<FilterMixins>(FilterMixins) {
    prefixCls = `${this.comPrefixCls}__input`;
    _inputValue: string = ''; // 实际值
    /**
     * 获取输入值
     */
    get inputValue() {
      return this.value.length ? this.value[0] : '';
    }
    /**
     * 设置输入值
     */
    set inputValue(value) {
      this._inputValue = value;
    }
    /**
     * 输入框空状态提示
     */
    get placeholderText() {
      return this.field.type === 'number'? '请输入数值' : '请输入';
    }
    /**
     * 修改值
     * @param text
     */
    changeText(text: any) {
      if(this.field.type === 'number') {
        if (!Regexp('NUMBER', text.target.value, true)) return;
      }
      this._inputValue = text.target.value;
      this.emitValue(this._inputValue.trim())
    }
    
    created() {
      
    }
}
</script>
<style lang="less">
</style>


