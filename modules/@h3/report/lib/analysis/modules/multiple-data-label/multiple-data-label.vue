<template>
  <div>
    <template v-for="(v, key) of value">
      <row-radio
        :key="key"
        :title="moduleOptions[`${key}Title`]"
        :options="DataLabelOptions"
        :value="v ? 1 : 0"
        @change="subChange($event, key)"
      ></row-radio>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import RowRadio from "../../component/row-radio";
import ModulesMixin from "../../mixins/modules-mixins";
import { NumberTagOptions } from "../../config/static-option";

@Component({
  name: "h3-analysis-multiple-data-label",
  components: {
    RowRadio
  }
})
export default class AnalysisMultipleDataLabel extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.MultipleDataLabelModule;
  // 模块值
  @Prop({ default: true }) value!: H3.Report.MultipleDataLabel;

  prefixCls: string = "h3-analysis-multiple-data-label";

  innerValue: H3.Report.MultipleDataLabel = this.value;
  // 选项
  DataLabelOptions: Array<{ value: string | number; label: string }> = NumberTagOptions;

  /**
   * 每个节点发生变化时
   */
  subChange($event, key) {
    this.innerValue[key] = !!$event;
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }
}
</script>
