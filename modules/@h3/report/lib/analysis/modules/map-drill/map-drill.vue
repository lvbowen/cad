<template>
  <row-select
    :title="moduleOptions.title"
    :placeholder="placeholder"
    :options="options"
    v-model="selectValue"
    @change="change"
  ></row-select>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import RowSelect from "../../component/row-select";
import ModulesMixin from "../../mixins/modules-mixins";
import { mapDrill } from "@h3/report/basics/enum/map";

@Component({
  name: "h3-analysis-map-drill",
  components: {
    RowSelect
  }
})
export default class AnalysisMapDrill extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.MapDrillModule;
  // 模块值
  @Prop({ default: () => {} }) value!: H3.Report.MapDrill;

  @Prop({ default: "请选择" }) placeholder!: string;

  prefixCls: string = "h3-analysis-map-drill";

  innerValue = this.value;

  get selectValue() {
    return this.value && this.value.drill ? this.value.drill : "disabled";
  }
  set selectValue(val) {
    this.innerValue.drill = val;
  }
  /**
   * 获取可选择钻取范围
   */
  get options() {
    let drill: Array<{ value: string; label: string }> = [];
    if (
      this.chart &&
      this.chart.styles &&
      this.chart.data.mapArea &&
      this.chart.data.mapArea.area
    ) {
      switch (this.chart.data.mapArea.area) {
        case "all":
          drill = [...mapDrill];
          break;
        case "province":
          drill = mapDrill.slice(1, 3);
          break;
        case "city":
          drill = mapDrill.slice(2, 3);
          break;
      }
    }
    return drill;
  }

  change(val) {
    this.innerValue.drill = val;
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }
  created() {}
}
</script>
