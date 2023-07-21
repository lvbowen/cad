<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__wrap`">
      <div :class="`${prefixCls}__wrap-header`">
        <div :class="`${prefixCls}__wrap-title`">示例图表名称</div>
        <img
          :class="`${prefixCls}__wrap-tip`"
          :src="require('@h3/report/basics/assets/analysis/example-tip.png')"
          alt="示例标签"
        />
      </div>
      <div :class="`${prefixCls}__wrap-content`">
        <img
          :src="require('@h3/report/basics/assets/analysis/example.svg')"
          :draggable="false"
          alt="示例图片"
        />
      </div>
    </div>
    <div :class="`${prefixCls}__footer`">
      <div :class="`${prefixCls}__footer-text`" v-html="addText"></div>
      <div :class="`${prefixCls}__footer-button`" @click="addChart">{{ buttonText }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { TabState } from "@h3/report/basics/enum/module-state";

const Analysis = namespace("analysisState");

@Component({
  name: "h3-analysis-view-empty",
  components: {}
})
export default class ViewEmpty extends Vue {
  prefixCls: string = "h3-analysis-view-empty";
  @Analysis.State("activeTab") activeTab!: TabState;

  @Prop({ default: false }) allowEdit!: boolean;
  @Prop({ default: false }) allowAdd!: boolean;

  // tip文案
  get addText() {
    if (this.activeTab === TabState.PUBLIC) {
      const tip = this.allowAdd
        ? "您可以创建属于该数据表的公共图表"
        : "管理员还未设置公共图表，您可以去设置个人图表";
      return tip;
    }
    if (this.activeTab === TabState.PERSON) {
      return "您可以创建个人图表";
    }
    return "";
  }

  // 按钮文案
  get buttonText() {
    return this.activeTab === TabState.PUBLIC && !this.allowAdd ? "设置个人图表" : "新增图表";
  }

  /**
   * 点击新增图表
   */
  addChart() {
    this.$emit("add-chart", {
      tabState: this.activeTab,
      allAdd: this.allowAdd
    });
  }
}
</script>

<style lang="less"></style>>
