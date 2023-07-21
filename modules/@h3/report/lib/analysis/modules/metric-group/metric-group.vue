<template>
  <div v-if="moduleOptions.display" :class="[prefixCls]">
    <template v-for="(metric, index) in moduleOptions.data">
      <H3Metric
        :key="index"
        :chart="chart"
        moduleKey="metric"
        :module="metric"
        :moduleOptions="metric"
        :value="value[index]"
        :autoChange="false"
        @change="change($event, index)"
      ></H3Metric>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { ReportMutation } from "@h3/report/basics/store/dashboard/types";
import Metric from "../dimension";
import ModulesMixin from "../../mixins/modules-mixins";

@Component({
  name: "h3-analysis-metric-group",
  components: {
    H3Metric: Metric
  }
})
export default class AnalysisMetricGroup extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.MetricGroupModule;
  // 模块值
  @Prop({ default: () => [[], []] }) value!: Array<Array<H3.Report.FieldColumn>>;

  prefixCls: string = "h3-analysis-metric-group";

  change(value, index) {
    let val = JSON.parse(JSON.stringify(this.value));
    val[index] = [...value];

    this.onModulesChange(this.chart, this.moduleKey, val);
  }
}
</script>
