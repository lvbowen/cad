<template>
  <row :title="moduleOptions.title">
    <color-select
      :value="value && value.type ? value.type : ''"
      colorSize="medium"
      :colorArray="anaiysisColors"
      @onChange="change"
    ></color-select>
  </row>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import Row from "../../component/row";
import ColorSelect from "@h3/report/basics/components/color-select/index";
import ModulesMixin from "../../mixins/modules-mixins";
import { anaiysisColors } from "@h3/report/basics/enum/colors";

@Component({
  name: "h3-analysis-theme",
  components: {
    Row,
    ColorSelect
  }
})
export default class AnalysisTheme extends Mixins(ModulesMixin) {
  //
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.ThemeModule;
  // 模块值
  @Prop({ default: () => {} }) value!: H3.Report.Theme;

  prefixCls: string = "h3-analysis-theme";

  innerValue: H3.Report.Theme = this.value;

  anaiysisColors = anaiysisColors;

  change(val) {
    this.innerValue = val;
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }
}
</script>
