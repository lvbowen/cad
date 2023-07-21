<template>
  <row-number
    :title="moduleOptions.title"
    :min="1"
    :precision="0"
    placeholder="请输入正数"
    v-model="innerValue"
    @change="change"
    @blur="blur"
  >
  </row-number>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/analysis/types";
import RowNumber from "../../component/row-number";
import ModulesMixin from "../../mixins/modules-mixins";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-limit",
  components: {
    RowNumber
  }
})
export default class AnalysisLimit extends Mixins(ModulesMixin) {
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.LimitModule;
  @Prop({ default: () => {} }) value!: number; // 模块值

  prefixCls: string = "h3-analysis-limit";
  innerValue: number = this.value;

  change(val) {
    this.innerValue = val === 0 || val ? val : null;
  }
  blur() {
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }
}
</script>
