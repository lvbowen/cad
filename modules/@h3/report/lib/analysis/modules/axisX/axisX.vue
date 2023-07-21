<template>
  <div>
    <row-radio
      :title="moduleOptions.axisXTitle"
      :options="axisOptions"
      :value="innerAxisValue"
      @change="axisChange"
    ></row-radio>
    <row-select
      :title="moduleOptions.directionTitle"
      :placeholder="placeholder"
      :options="directionOptions"
      :value="innerDirectionValue"
      @change="directionChange"
    ></row-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import RowSelect from "../../component/row-select";
import RowRadio from "../../component/row-radio";
import ModulesMixin from "../../mixins/modules-mixins";
import { NumberTagOptions } from "../../config/static-option";
import { DirectionList } from "@h3/report/basics/enum/common-type";

@Component({
  name: "h3-analysis-axisx",
  components: {
    RowSelect,
    RowRadio
  }
})
export default class AnalysisAxisx extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.AxisXModule;
  // 模块值
  @Prop({ default: () => {} }) value!: H3.Report.AxisX;
  @Prop({ default: "请选择" }) placeholder!: string;

  prefixCls: string = "h3-analysis-axisx";

  // 坐标轴选项
  axisOptions: Array<{ value: string | number; label: string }> = NumberTagOptions;
  // 坐标轴选项
  directionOptions: Array<{ label: string; value: string }> = [
    {
      value: "hide",
      label: "隐藏"
    },
    ...DirectionList
  ];
  // 内部值
  innerValue: H3.Report.AxisX = this.value;

  // 内部方向的值
  get innerDirectionValue() {
    return this.value && this.value.displayLabel ? this.value.direction : "hide";
  }
  // 内部方向的值
  get innerAxisValue() {
    return this.value && this.value.displayAxisX ? 1 : 0;
  }

  /**
   * 坐标轴
   */
  axisChange(val) {
    this.innerValue.displayAxisX = !!val;
    this.change();
  }
  /**
   * 方向
   */
  directionChange(val) {
    if (val === "hide") {
      this.innerValue.displayLabel = false;
    } else {
      this.innerValue.displayLabel = true;
      this.innerValue.direction = val;
    }
    this.change();
  }

  change() {
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }
}
</script>
