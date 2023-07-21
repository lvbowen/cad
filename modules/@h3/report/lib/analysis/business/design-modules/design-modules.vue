<template>
  <div :class="prefixCls">
    <div :class="[`${prefixCls}__wrap`]">
      <template v-for="(m, k) of formateModules">
        <template v-if="!m.isGroup">
          <component
            v-if="m.display"
            :is="`h3-${k}`"
            :key="k"
            :chart="chart"
            :value="getModuleData[k]"
            :moduleKey="k"
            :moduleOptions="m"
          ></component>
        </template>
        <MultiGroup
          v-if="m.isGroup && getShowGroup(m.childModules)"
          :key="k"
          :title="m.title"
        >
          <template v-for="(childModule, ck) in m.childModules">
            <component
              v-if="childModule.display"
              :is="`h3-${ck}`"
              :key="ck"
              :chart="chart"
              :value="getModuleData[ck]"
              :moduleKey="ck"
              :moduleOptions="childModule"
            ></component>
          </template>
        </MultiGroup>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import Modules from "../../modules/index";
import MultiGroup from "../../component/multi-group";
import { getBaseModules, getChartModulesGroups } from "@h3/report/basics/instance/help/getModules";

@Component({
  name: "h3-analysis-modules",
  components: {
    ...Modules,
    MultiGroup
  }
})
export default class AnalysisModules extends Vue {
  // 图表实例
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  // 模块
  @Prop({ default: () => ({}) }) modules!: H3.Analysis.ChartModules;

  prefixCls: string = "h3-analysis-modules";

  /**
   * 动态获取模型配置
   */
  get innerModules() {
    let modules = this.chart && this.chart.type ? getBaseModules(this.chart.type) : {};
    return modules;
  }
  /**
   * 格式化以后的模块组合
   */
  get formateModules() {
    return getChartModulesGroups(this.modules);
  }

  /**
   * 获取模块数据
   */
  get getModuleData() {
    return this.chart
      ? Object.assign({}, this.chart.data, this.chart.styles, { chartTitle: this.chart.title })
      : {};
  }

  /**
   * 是否显示分组
   */
  getShowGroup(group: H3.Analysis.ChartModules) {
    return Object.keys(group).some(i => group[i].display);
  }

  mounted() {}

  updated() {}
}
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
