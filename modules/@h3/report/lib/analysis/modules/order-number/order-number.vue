<template>
  <row-radio
    :title="moduleOptions.title"
    :options="DataLabelOptions"
    :value="innerValue.checked ? 1 : 0"
    @change="change"
  ></row-radio>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch, Mixins } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import RowRadio from '../../component/row-radio';
import ModulesMixin from '../../mixins/modules-mixins';
import { NumberTagOptions } from '../../config/static-option';

@Component({
  name: 'h3-analysis-order-number',
  components: {
    RowRadio,
  }
})

export default class AnalysisOrderNumber extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!:H3.Analysis.OrderNumberModule;
  // 模块值
  @Prop({ default: true }) value!: H3.Report.OrderNumber

  prefixCls: string = 'h3-analysis-order-number';

  innerValue : H3.Report.OrderNumber = this.value;

  // 选项
  DataLabelOptions: Array<{value:string | number, label:string}> = NumberTagOptions;

  change(val) {
    this.innerValue.checked = !!val;
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }

}
</script>