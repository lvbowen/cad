<template>
  <h3-report-element
    :class="[`${comPrefixCls}__item`, `${comPrefixCls}__item--full`]"
    :style="getFullScreenElementStyle"
    :fullScreenStatus="fullScreenStatus"
    :element="getFullScreenElement"
    :global="global"
    :comPrefixCls="comPrefixCls"
    @full-screen="fullScreen"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide } from "vue-property-decorator";
import { namespace } from "vuex-class";
import H3ReportElement from "./element";
import { Color } from "@h3/report/basics/enum/paint";

const ReportPro = namespace("report");
@Component({
  name: "h3-dashboard-mobile-full-screen",
  components: {
    H3ReportElement
  }
})
export default class DashboardMobileFullScreen extends Vue {
  @Prop({
    default: "h3-report-mobile"
  })
  comPrefixCls!: string; // 父级样式
  @Prop({
    default: () => ({})
  })
  element!: H3.Report.BaseElement; // 图表

  @Prop({
    default: null
  })
  theme!: string; // 图表背景

  @Prop({ default: null }) global!: H3.Report.Global;

  fullScreenStatus: boolean = true; // 全部状态

  @Provide() landscape: boolean = true;
  @Provide() isMobile = true;

  fullScreen(res: any) {
    this.$emit("full-screen", res);
  }
  /**
   * 获取全屏图表样式
   */
  get getFullScreenElementStyle() {
    let itemStyle = "";
    if (this.getFullScreenElement) {
      itemStyle = this.getItemStyle(this.getFullScreenElement);
    }
    return itemStyle.indexOf(Color.THEMEELEMENTCOATVALUE) > -1 ? this.theme : itemStyle;
  }
  /**
   * 获取全屏图表
   */
  get getFullScreenElement() {
    let element: H3.Report.BaseElement = JSON.parse(JSON.stringify(this.element));
    element.uid = `screen-${element.uid}`;
    return element;
  }

  /**
   * 获取图表样式
   */
  getItemStyle(element: H3.Report.BaseElement): string {
    const chart: H3.Report.Chart = element as H3.Report.Chart;
    const value =
      (chart.styles && chart.styles.elementCoat && chart.styles.elementCoat.value) ||
      this.global.styles.elementCoat.value;
    return `background-color:${value}`;
  }
}
</script>
