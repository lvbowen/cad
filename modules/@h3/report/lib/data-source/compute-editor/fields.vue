<template>
  <div :class="[`${prefixCls}-warp`]">
    <div :class="[`${prefixCls}-header`]">
      <label>可用变量</label>
    </div>
    <div :class="prefixCls">
      <div 
        :class="[`${prefixCls}-item`]"
        v-for="(field, i) in fields"
        :key="i"
        @click="selectField(field)"
      >
        <label>{{ field.title }}</label>
        <div class="capsule">
          <span :class="`type-${field.type}`">{{ typeName[field.type] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Prop, Vue} from 'vue-property-decorator';

  @Component({
    name: 'h3-compute-editor-fields'
  })
  export default class ComputeEditorFields extends Vue {
    @Prop({ default: null }) comPrefixCls: string;
    @Prop({ default: () => [] }) fields: Array<H3.FormulaEditor.Field>;
    prefixCls: string = `${this.comPrefixCls}__fields`;
    
    typeName = {
      number: '数字',
      date: '时间戳',
      string: '字符串'
    };
    selectField(field: H3.FormulaEditor.Field) {
      this.$emit('select-field', field);
    }
  }
</script>
