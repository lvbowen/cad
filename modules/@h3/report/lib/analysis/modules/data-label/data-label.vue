<template>
  <row-radio
    :title="moduleOptions.title"
    :options="DataLabelOptions"
    :value="innerValue"
    @change="change"
  ></row-radio>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import RowRadio from "../../component/row-radio";
import ModulesMixin from "../../mixins/modules-mixins";
import { NumberTagOptions } from "../../config/static-option";

@Component({
  name: "h3-analysis-data-label",
  components: {
    RowRadio
  }
})
export default class AnalysisDataLabel extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.DataLabelModule;
  // 模块值
  @Prop({ default: true }) value!: boolean;

  prefixCls: string = "h3-analysis-data-label";
  // 选项
  DataLabelOptions: Array<{ value: any; label: string }> = NumberTagOptions;

  get innerValue() {
    return this.value ? 1 : 0;
  }

  change(val) {
    const v = val !== 0;
    this.onModulesChange(this.chart, this.moduleKey, v);
  }
}
</script>
