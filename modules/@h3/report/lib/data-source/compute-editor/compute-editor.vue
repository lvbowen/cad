<template>
  <div :class="prefixCls">
    <div :class="[`${prefixCls}__title`]">
      <a-input 
        ref="title" 
        v-model="innerTitle"
        placeholder="请输入计算字段名称"
        @change="titleChange"
      ></a-input>
    </div>
    <div ref="editorWarp" :class="[`${prefixCls}__formula`, 'ant-input']">
      <div :class="[`${prefixCls}__formula-header`]">
        表达式 =
      </div>
      <formula-editor
        ref="editor"
        :options="formulaOptions"
      >
      </formula-editor>
    </div>
    <div :class="[`${prefixCls}__operate`]">
      <compute-fields
        :fields="fields"
        :comPrefixCls="prefixCls"
        @select-field="insertField"
      ></compute-fields>
      <compute-func
        :comPrefixCls="prefixCls"
        @insert-formula="insertFormula"
        @show-formula-doc="showFormulaDoc"
      ></compute-func>
      <compute-doc
        :comPrefixCls="prefixCls"
        :formulaDoc="formulaDoc"
      ></compute-doc>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Input } from '@h3/antd-vue';
import FormulaEditor from '@h3/report/basics/components/formula-editor';
import ComputeFields from './fields.vue';
import ComputeFunc from './func.vue';
import ComputeDoc from './document.vue';
import formulaTypes,{ FormulaDocument } from './formula-type';
@Component({
  name: 'h3-compute-editor',
  components: {
    AInput: Input,
    FormulaEditor,
    ComputeFields,
    ComputeFunc,
    ComputeDoc
  }
})
export default class ComputeEditor extends Vue {
  @Prop({ default: () => null }) title: string;
  @Prop({ default: () => null }) formula: string;
  @Prop({ default: () => [] }) fields: Array<H3.FormulaEditor.Field>;
  prefixCls: string = 'h3-compute-editor';
  innerTitle = this.title;
  formulaDoc: FormulaDocument | null = null;
  formulaOptions: H3.FormulaEditor.Options = {
    keywords: [],
    fields: [],
    fieldRegex:/(\@\@[0-9a-zA-Z._#@]+)/g,
    change: this.formulaChange
  };
  
  @Watch('fields', { immediate: true, deep: true })
  watchFields() {
    this.formulaOptions.fields = this.fields;
  }
  /**
   * 设置公式值
   */
  setValue(formula: string) {
    return (this.$refs.editor as any).setValue(formula);
  }
  /**
   * 获取公式值
   */
  getValue() {
    return (this.$refs.editor as any).getValue();
  }
  /**
   * 添加字段
   */
  insertField(field: H3.FormulaEditor.Field) {
    (this.$refs.editor as any).insertField(field);
  }

  /**
   * 插入公式字段
   * @param formula
   */
  insertFormula(formula: string) {
    (this.$refs.editor as any).insertFormula(formula);
  }

  /**
   * 展示说明文档
   * @param doc
   */
  showFormulaDoc(doc: FormulaDocument) {
    this.formulaDoc = doc;
  }

  /**
   * 计算公式检验
   */
  checkValidate() {
    this.$el.querySelectorAll('.input-error').forEach((ele: HTMLElement) => { ele.classList.remove('input-error'); });
    if (!this.innerTitle || this.innerTitle === '') {
      (this.$refs.title as Vue).$el.classList.add('input-error');
      (this.$refs.title as Vue).$el.focus();
      return {code: 'title-error', message: '请输入计算字段名称'};
    } else {
      const ret = (this.$refs.editor as any).checkValidate();
      if(ret.code !== 'success') {
        (this.$refs.editorWarp as HTMLDivElement).classList.add('input-error');
        (this.$refs.editor as any).focus();
      }
      return (this.$refs.editor as any).checkValidate();
    }
  }

  /**
   * 公式改变事件
   */
  formulaChange() {
    if((this.$refs.editorWarp as HTMLDivElement).classList.contains('input-error')) {
      (this.$refs.editorWarp as HTMLDivElement).classList.remove('input-error');
    }
  }

  /**
   * 标题改变事件
   */
  titleChange() {
    if((this.$refs.title as Vue).$el.classList.contains('input-error')) {
      (this.$refs.title as Vue).$el.classList.remove('input-error');
    }
  }

  created() {
    Object.values(formulaTypes).forEach((formulaType: {[key: string]: string | HTMLElement}) => {
      this.formulaOptions.keywords.push(...Object.keys(formulaType));
    });
  }
  mounted() {
    if (!this.innerTitle || this.innerTitle === '') {
      (this.$refs.title as HTMLInputElement).focus();
    }
    if(this.formula) {
      this.setValue(this.formula);
    }
  }
}
</script>
