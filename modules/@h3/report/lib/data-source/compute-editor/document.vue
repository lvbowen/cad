<template>
  <div :class="[`${prefixCls}-warp`]">
    <div :class="prefixCls">
      <template v-if="formulaDoc">
        <div :class="[`${prefixCls}-title`]">
          {{ formulaDoc.formula }}
        </div>
        <div :class="[`${prefixCls}-content`]" v-html="formulaDoc.doc"></div>
      </template>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import { FormulaDocument } from './formula-type';
  @Component({
    name: 'h3-compute-editor-doc'
  })
  export default class ComputeEditorDoc extends Vue {
    @Prop({ default: null }) comPrefixCls: string;
    @Prop({ default: null }) formulaDoc: FormulaDocument;
    prefixCls: string = `${this.comPrefixCls}__doc`;
  }
</script>
