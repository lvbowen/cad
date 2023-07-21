<template>
  <div :class="prefixCls">
    <row-radio
      :title="moduleOptions.dimensionTitle"
      :options="options"
      :value="innerDisplayDimension"
      @change="change($event,'displayDimension')"
    ></row-radio>
    <row-radio
      :title="moduleOptions.metricTitle"
      :options="options"
      :value="innerDisplayMetric"
      @change="change($event,'displayMetric')"
    ></row-radio>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import RowSelect from "../../component/row-select";
import RowRadio from "../../component/row-radio";
import ModulesMixin from "../../mixins/modules-mixins";
import { NumberTagOptions } from "../../config/static-option";

@Component({
  name: "h3-analysis-map-digital-set",
  components: {
    RowSelect,
    RowRadio
  }
})
export default class AnalysisMapDigitalSet extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.MapDigitalSetModule;
  // 模块值
  @Prop({ default: () => {} }) value!: H3.Report.MapDigitalSet;
  @Prop({ default: "请选择" }) placeholder!: string;

  prefixCls: string = "h3-analysis-map-digital-set";
  options: Array<{ value: string | number; label: string }> = NumberTagOptions;
  // 内部值
  innerValue: H3.Report.MapDigitalSet = this.value;

  get innerDisplayDimension() {
    return this.value && this.value.displayDimension ? 1 : 0;
  }
  get innerDisplayMetric() {
    return this.value && this.value.displayMetric ? 1 : 0;
  }

  /**
   * 值改变
   * @param val
   * @param type
   */
  change(val,type) {
    this.innerValue[type] = val !== 0;
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }
}
</script>
