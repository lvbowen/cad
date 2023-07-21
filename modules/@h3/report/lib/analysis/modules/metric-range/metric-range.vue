<template>
  <div>
    <row-number
      :title="moduleOptions.maxTitle"
      :placeholder="placeholder"
      :value="value ? value.max : null"
      @change="maxChange"
      @blur="change"
    ></row-number>
    <row-number
      :title="moduleOptions.minTitle"
      :placeholder="placeholder"
      :value="value ? value.min : null"
      @change="minChange"
      @blur="change"
    ></row-number>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import RowNumber from "../../component/row-number";
import ModulesMixin from "../../mixins/modules-mixins";
import { NumberTagOptions } from "../../config/static-option";
import { DirectionList } from "@h3/report/basics/enum/common-type";

@Component({
  name: "h3-analysis-metric-range",
  components: {
    RowNumber
  }
})
export default class AnalysisMetricRange extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.MetricRangeModule;
  // 模块值
  @Prop({ default: () => {} }) value!: H3.Report.MetricRange;
  @Prop({ default: "请输入数值" }) placeholder!: string;

  prefixCls: string = "h3-analysis-metric-range";

  // 内部值
  innerValue: H3.Report.MetricRange = this.value;

  /**
   * 最大值变化时
   */
  maxChange(val) {
    this.innerValue.max = val;
  }
  /**
   * 最小值
   */
  minChange(val) {
    this.innerValue.min = val;
  }

  change() {
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }
}
</script>
