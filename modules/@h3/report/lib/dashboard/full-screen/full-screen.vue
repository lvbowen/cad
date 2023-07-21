<template>
  <element-wrap
    :class="prefixCls"
    ref="elementWrap"
    :style="getFullScreenElementStyle"
    :element="fullScreenElement"
    :global="global"
    :status="status"
    :fullScreen="true"
    :elementIndex="elementIndex"
    @narrow="narrow"
  >
    <slot slot="title" name="title"/>
    <slot slot="extra" name="extra"/>
  </element-wrap>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide } from "vue-property-decorator";
import { namespace } from "vuex-class";
import ElementWrap from "../element";
import { ReportState } from "@h3/report/basics/enum/report-state";
import { Color } from "@h3/report/basics/enum/paint";

const ReportPro = namespace("report");
@Component({
  name: "h3-dashboard-full-screen",
  components: {
    ElementWrap
  }
})
export default class DashboardFullScreen extends Vue {
  @Prop({ default: null }) element!: H3.Report.BaseElement;
  @Prop({ default: null }) global!: H3.Report.Global;
  @Prop({ default: null }) corpId!: string;
  @Prop({ default: true }) refresh!: boolean;
  @Prop({ default: ReportState.DESIGN }) status!: ReportState;
  @Prop({ default: 0 }) elementIndex!: number;
  prefixCls = "h3-dashboard-full-screen";

  get fullScreenElement() {
    const element = JSON.parse(JSON.stringify(this.element));
    element.uid = `full-${element.uid}`;
    return element;
  }
  /**
   * 缩小
   */
  narrow(obj) {
    this.$emit("narrow", obj);
    this.$emit("destroy");
  }
  /**
   * 获取全屏图表样式
   */
  get getFullScreenElementStyle() {
    return this.getItemStyle.indexOf(Color.THEMEELEMENTCOATVALUE) > -1
      ? this.getStyles
      : this.getItemStyle;
  }

  /**
   * 获取图表样式
   */
  get getItemStyle(): string {
    const chart: H3.Report.Chart = this.element as H3.Report.Chart;
    const value =
      (chart.styles && chart.styles.elementCoat && chart.styles.elementCoat.value) ||
      this.global.styles.elementCoat.value;
    return `background-color:${value}`;
  }
  /**
   * 获取仪表盘背景色
   */
  get getStyles() {
    if (!this.global || !this.global.styles.paintCoatTheme) return true;
    const paintCoat: H3.Report.PaintCoat = this.global.styles.paintCoat;
    let picOpt: any;
    if (this.global.styles.paintCoatTheme === "default") {
      if (paintCoat.type === "bgColor") {
        picOpt = { backgroundColor: paintCoat.value };
      } else if (this.global.styles.paintCoat.type === "bgPicture") {
        picOpt = {
          backgroundImage: "url(" + paintCoat.value + ")",
          backgroundSize: "100% 100%"
        };
      }
    } else {
      const bgUrl: string = require("@h3/report/basics/assets/color-setting/theme/" +
        this.global.styles.paintCoatTheme +
        "-bg.png");
      picOpt = {
        backgroundImage: "url(" + bgUrl + ")",
        backgroundSize: "100% 100%"
      };
    }

    return picOpt;
  }
}
</script>
