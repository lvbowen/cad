<template>
  <!-- <h3-scroll
    ref="scroll"
    :scrollXBtn="false"
    :buttonColor="'rgba(0, 0, 0, 0.45)'"
    :class="[`${prefixCls}__scroll`]"
  > -->
  <div :class="prefixCls">
    <div :class="[`${prefixCls}__header`]">
      <backdoor><label>仪表盘设置</label></backdoor>
    </div>
    <div :class="[`${prefixCls}__modules`]">
      <label>仪表盘名称</label>
      <a-input
        placeholder="仪表盘名称"
        :value="title"
        @change="change"
      ></a-input>
    </div>
    <!-- 全局颜色设置 -->
    <paint-wrap></paint-wrap>
  </div>
  <!-- </h3-scroll> -->
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { Input } from "@h3/antd-vue";
import { ReportMutation } from "@h3/report/basics/store/dashboard/types";
import paintWrap from "./pain-wrap.vue";
import H3Scroll from "@h3/report/basics/components/scroll";
import Backdoor from "@h3/report/basics/components/backdoor";

const ReportPro = namespace("report");
@Component({
  name: "h3-report-global",
  components: {
    AInput: Input,
    paintWrap,
    H3Scroll,
    Backdoor
  }
})
export default class ReportModels extends Vue {
  @ReportPro.State("title") title!: H3.Report.Chart;
  @ReportPro.State("global") global!: H3.Report.Global;
  @ReportPro.Mutation(ReportMutation.SETREPORTTITLE) setReportTitle!: Function;
  prefixCls = "h3-report-global";
  change(e: Event) {
    this.setReportTitle((e.target as any).value);
    this.$emit("input", (e.target as any).value);
  }

  /**
   * 更新滚动条
   */
  refreshScroll() {
    this.$nextTick(() => {
      if (this.$refs.scroll) {
        (this.$refs.scroll as any).setScrollBar();
      }
    });
  }

  mounted() {
    this.refreshScroll();
  }

  updated() {
    this.refreshScroll();
  }
}
</script>
<style lang="less">
@import "~@h3/report/basics/styles/index";
.h3-report-global {
  width: 420px;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  padding-bottom: 40px;
  .vertical-scrollbar();
  &__scroll {
    background-color: #fff;
  }
  > div {
    margin: 0 12px;
  }
  &__header {
    flex: 0 0 44px;
    height: 44px;
    line-height: 44px;
    font-weight: bold;
    border-bottom: 1px solid @report-border-line-color;
  }
  &__modules {
    padding-bottom: 16px;
    border-bottom: 1px solid @report-border-line-color;
    label {
      display: block;
      padding: 18px 0 6px;
      font-weight: bold;
    }
  }
}
</style>
