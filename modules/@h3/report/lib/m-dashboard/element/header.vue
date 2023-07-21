<template>
  <div :class="`${comPrefixCls}__item-header`" :style="{ color: titleColor }">
    <slot name="title">
      <label :style="getStyles">{{ element.title }}</label>
    </slot>
    <slot name="extra">
      <div :class="[`${comPrefixCls}__btns`]">
        <a
          @click="refresh(element)"
          :class="[`${comPrefixCls}__btns-item`]"
          :style="getStyles"
        ><i class="h3yun_All reload-o"></i></a>
        <a
          @click="fullScreen(element)"
          :class="[`${comPrefixCls}__btns-item`]"
          :style="getStyles"
        ><i :class="fullScreenClass"></i></a>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { ReportMutation, ReportAction } from "@h3/report/basics/store/dashboard/types";

const ReportPro = namespace("report");
@Component({
  name: "h3-dashboard-element-header"
})
export default class DashboardElementHeader extends Vue {
  @Prop({
    default: ""
  })
  element!: H3.Report.BaseElement; // 图表
  @Prop({
    default: false
  })
  fullScreenStatus!: boolean; // 是否全屏
  @Prop({
    default: "h3-report-element"
  })
  comPrefixCls!: string;
  @Prop() global!: H3.Report.Global;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;

  get getStyles() {
    let styles: any = "";
    const chart: H3.Report.Chart = this.element as H3.Report.Chart;
    const color =
      (chart.styles.fontSetting && chart.styles.fontSetting.titleColor) ||
      this.global.styles.fontSetting.titleColor;
    styles += `color:${color}`;
    return styles;
  }

  get titleColor() {
    const chart: H3.Report.Chart = this.element as H3.Report.Chart;
    return (
      (chart.styles.fontSetting && chart.styles.fontSetting.titleColor) ||
      this.global.styles.fontSetting.titleColor
    );
  }
  /**
   *是否全屏样式
   */

  get fullScreenClass() {
    return {
      h3yun_All: true,
      "fullscreen-o": !this.fullScreenStatus,
      "fullscreen-restore-o": this.fullScreenStatus
    };
  }
  /**
   * 刷新图表
   */
  refresh(element: H3.Report.BaseElement) {
    this.resizeChartView({ chart: element, type: "data" });
  }

  /**
   * 全屏预览功能
   */
  fullScreen(element: H3.Report.BaseElement) {
    this.$emit("full-screen", {
      element,
      fullScreenStatus: this.fullScreenStatus
    });
  }
}
</script>
