<template>
  <div :class="prefixCls" v-if="showSelf">
    <a-radio-group :value="innerValue" @change="change">
      <a-radio-button
        :value="o.value"
        v-for="o in options"
        :key="o.value"
        :disabled="o.disabled"
      >
        {{ o.label }}
      </a-radio-button>
    </a-radio-group>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Provide, Mixins } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import { Radio } from "@h3/antd-vue";
import { ElementCNType, ElementType } from "@h3/report/basics/enum/chart-type";
import ModulesMixin from "../../mixins/modules-mixins";
import { getMainType } from "@h3/report/basics/instance/help/getModules";

/**
 * 此组件是对图表进行切换图表类型 与 设置模块中的图表类型 不一样的是这些图表类型是没有在基础图表类型中可选择的
 */
@Component({
  name: "h3-analysis-chart-switch-type",
  components: {
    ARadioGroup: Radio.Group,
    ARadioButton: Radio.Button
  }
})
export default class AnalysisChartSwitch extends Mixins(ModulesMixin) {
  prefixCls: string = "h3-analysis-chart-switch-type";

  // 只有柱状图和折线图有这个功能（包含被切换的图表）
  get showSelf() {
    return (
      this.chart.type === ElementType.BAR ||
      this.chart.type === ElementType.LINE ||
      this.chart.type === ElementType.AREA ||
      this.chart.type === ElementType.PILEBAR ||
      this.chart.type === ElementType.STRIPE
    );
  }

  // 是否是一维一指标
  get simple() {
    return this.dimensionLength < 2 && this.metricLength < 2;
  }

  // 主类型
  get mainType() {
    let type = getMainType(this.chart.type);
    return type;
  }

  // 内部值
  get innerValue() {
    return this.chart.type;
  }

  get options(): Array<any> {
    let options = {
      [ElementType.BAR]: [
        {
          label: ElementCNType.BAR,
          value: ElementType.BAR
        },
        {
          label: ElementCNType.STRIPE,
          value: ElementType.STRIPE
        },
        {
          label: ElementCNType.PILEBAR,
          value: ElementType.PILEBAR,
          disabled: this.simple
        }
      ],
      [ElementType.LINE]: [
        {
          label: ElementCNType.LINE,
          value: ElementType.LINE
        },
        {
          label: ElementCNType.AREA,
          value: ElementType.AREA,
          disabled: this.simple
        }
      ]
    };

    return options[this.mainType];
  }

  change(e) {
    this.onModulesChange(this.chart, "type", e.target.value);
  }

  mounted() {}

  updated() {}
}
</script>

<style lang="less" scoped>
.h3-analysis-chart-switch-type {
  position: absolute;
  top: 24px;
  right: 40px;
  z-index: 100;
}
</style>
