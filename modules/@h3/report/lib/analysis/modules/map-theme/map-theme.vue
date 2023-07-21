<template>
  <row :title="moduleOptions.title">
    <a-select
      placeholder="请选择图表配色"
      notFoundContent="无匹配结果"
      :class="`${prefixCls}__select`"
      :value="selectValue"
      :getPopupContainer="getPopupContainer"
      @change="change"
    >
      <a-select-option v-for="item in options" :key="item.value">
        <div
          :value="item.value"
          :class="`${prefixCls}__color`"
          :style="getLinearGradient(item)"
        ></div>
      </a-select-option>
    </a-select>
  </row>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import ModulesMixin from "../../mixins/modules-mixins";
import { mapTheme, mapColor, mapColorOptions, getColorByTheme } from "@h3/report/basics/enum/map";
import { Select } from "@h3/antd-vue";
import Row from "../../component/row";

@Component({
  name: "h3-analysis-map-theme",
  components: {
    Row,
    ASelect: Select,
    ASelectOption: Select.Option
  }
})
export default class AnalysisMapTheme extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.MapThemeModule;
  // 模块值
  @Prop({ default: () => {} }) value!: H3.Report.MapTheme;

  @Prop({ default: "请选择" }) placeholder!: string;

  prefixCls: string = "h3-analysis-map-theme";
  // 地图颜色
  mapColor = mapColor;
  // 默认图例的选择配置项
  options: Array<{ value: string; label: string }> = [...mapTheme];

  selectValue = this.value.theme;
  innerValue = this.value;

  getPopupContainer() {
    return this.$el;
  }
  // 渐变颜色
  getLinearGradient(item) {
    return {
      background:
        "linear-gradient(270deg," +
        mapColor[item.value][0] +
        " 0%," +
        mapColor[item.value][1] +
        " 100%)"
    };
  }

  mounted() {}

  change(val) {
    this.selectValue = val;
    this.innerValue.theme = val;
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }
}
</script>

<style lang="less">
.h3-analysis-map-theme {
  &__select {
  }
  &__color {
    width: 143px;
    height: 24px;
    margin-top: 3px;
  }
}
</style>
