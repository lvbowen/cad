<template>
  <div
    v-h3-lazy-load="{ selector: `.h3-report-elementWrap`, callback: lazyLoadChart, delay: 500 }"
    :class="getClass"
    :style="getStyles"
  >
    <h3-loading v-if="loading"/>
    <element-wrap
      v-else
      ref="elementWrap"
      :element="element"
      :corpId="corpId"
      :global="global"
      :refresh="true"
      :status="'report'"
      :data-id="element && element.uid"
      @full-screen="fullScreen"
    >
      <slot slot="title" name="title"/>
      <slot slot="extra" name="extra"/>
    </element-wrap>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import { message } from "@h3/antd-vue";
import H3Loading from "@h3/report/basics/components/loading";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/dashboard/types";
import { namespace } from "vuex-class";
import options from "@h3/report/dist/options";
import ElementWrap from "./element";
import H3LazyLoad from "@h3/report/basics/directives/lazy-load";
import SingleChartMixins from "@h3/report/basics/mixins/single-chart-mixins";
import FullScreen from "./full-screen";
options.message = message;
const ReportPro = namespace("report");
@Component({
  name: "h3-single-chart",
  components: {
    ElementWrap,
    H3Loading
  },
  directives: {
    H3LazyLoad
  }
})
export default class ReportShow extends Mixins<SingleChartMixins>(SingleChartMixins) {
  @ReportPro.Action(ReportAction.GETREPORTDETAIL) getReportDetail!: Function;
  @ReportPro.Mutation(ReportMutation.SETREPORTOPTIONS) setReportOptions!: Function;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  /**
   * 全屏事件
   */
  fullScreen() {
    if (this.fullScreenElement) {
      this.fullScreenElement.close();
      this.fullScreenElement = null;
    } else {
      this.fullScreenElement = FullScreen({
        scopedSlots: this.$scopedSlots,
        corpId: this.corpId,
        store: this.$store,
        element: this.element,
        global: this.global,
        refresh: false,
        status: "single" as any,
        narrow: this.fullScreen
      });
    }
  }
}
</script>
<style lang="less">
.h3-single-chart {
  display: flex;
  height: 100%;
  background: #ffffff;
  .h3-report-elementWrap {
    width: 100%;
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
