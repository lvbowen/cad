<template>
  <row-select
    :title="moduleOptions.title"
    :placeholder="placeholder"
    :options="options"
    v-model="selectVaule"
    @change="change"
  ></row-select>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import RowSelect from "../../component/row-select";
import ModulesMixin from "../../mixins/modules-mixins";
import { PositionList } from "@h3/report/basics/enum/common-type";

@Component({
  name: "h3-analysis-legend",
  components: {
    RowSelect
  }
})
export default class AnalysisLegend extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.LegendModule;
  // 模块值
  @Prop({ default: () => {} }) value!: H3.Report.Legend;
  @Prop({ default: "请选择" }) placeholder!: string;

  prefixCls: string = "h3-analysis-legend";

  // 默认图例的选择配置项
  options: Array<{ value: string; label: string }> = [
    {
      value: "hide",
      label: "隐藏"
    },
    ...PositionList
  ];

  selectVaule = !this.value.checked ? "hide" : this.value.position;
  innerVaule = this.value;

  change(val) {
    if (val === "hide") {
      this.innerVaule.checked = false;
    } else {
      this.innerVaule.checked = true;
      this.innerVaule.position = val;
    }
    this.onModulesChange(this.chart, this.moduleKey, this.innerVaule);
  }
}
</script>
