<template>
  <div
    :class="getClass"
    v-h3-lazy-load="{ selector: `.h3-dashboard-mobile__item`, callback: lazyLoadChart, delay: 500 }"
    :style="getStyles"
  >
    <h3-loading v-if="loading"/>
    <h3-report-element
      v-else
      :corpId="corpId"
      :element="element"
      :global="global"
      :refresh="true"
      :data-id="element && element.uid"
      :status="'report'"
      :comPrefixCls="mobilePrefixCls"
      @full-screen="fullScreen"
    >
      <slot name="title" slot="title"/>
      <slot name="extra" slot="extra"/>
    </h3-report-element>
    <full-screen
      ref="fullScreen"
      v-if="fullScreenElement"
      :comPrefixCls="mobilePrefixCls"
      :theme="getStyles"
      :global="global"
      :element="fullScreenElement"
      @full-screen="fullScreen"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Provide } from "vue-property-decorator";
import H3Loading from "@h3/report/basics/components/loading";
import H3ReportElement from "./element";
import FullScreen from "./full-screen.vue";
import H3LazyLoad from "@h3/report/basics/directives/lazy-load";
import SingleChartMixins from "@h3/report/basics/mixins/single-chart-mixins";

@Component({
  name: "h3-single-chart",
  components: {
    H3ReportElement,
    FullScreen,
    H3Loading
  },
  directives: {
    H3LazyLoad
  }
})
export default class ReportShow extends Mixins<SingleChartMixins>(SingleChartMixins) {
  mobilePrefixCls = "h3-dashboard-mobile";
  fullScreenElement: H3.Report.BaseElement | null = null;

  @Provide() isMobile = true;
  /**
   * 全屏回调事件
   * @param chart
   * @param fullScreenStatus
   */
  fullScreen({ element, fullScreenStatus }) {
    if (!fullScreenStatus) {
      this.fullScreenElement = element;
    } else {
      this.fullScreenElement = null;
    }
    (document.body as HTMLDivElement).classList.toggle(`${this.mobilePrefixCls}__full`);
    this.$emit("full-screen", !fullScreenStatus);
  }
}
</script>
<style lang="less">
@import "./style/index.less";
.h3-single-chart {
  display: flex;
  height: 100%;
  background: #ffffff;
  .h3-dashboard-mobile__item {
    flex: 1;
    height: 100%;
    width: 100%;
    margin: 0;
    border-radius: 0;
  }
  *,
  :after,
  :before {
    box-sizing: border-box;
  }
  .h3-report-chart__placeholder {
    width: 100%;
    background: #ffffff;
  }
}
</style>
