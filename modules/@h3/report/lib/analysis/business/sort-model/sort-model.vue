<template>
  <div :class="`${prefixCls}`">
    <sort-list
      :chart="chart"
      :value="innerValue"
      @change-sort="changeSort"
    > </sort-list>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import RowRadio from "../../component/row-radio";
import MultiGroup from "../../component/multi-group";
import SortList from "../sort-list";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-sort-model",
  components: {
    SortList
  }
})
export default class AnalysisSortList extends Vue {
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => [] }) value!: Array<H3.Report.FieldColumn>; // 默认值
  prefixCls: string = "h3-analysis-sort-model";

  innerValue: Array<H3.Report.FieldColumn> = this.value;

  /**
   * 修改排序
   */
  changeSort(value) {
    this.innerValue = value;
    this.$emit("change-sort", value);
  }

  mounted() {}
}
</script>

<style lang="less">
@import "~@h3/report/basics/styles/components.less";
.h3-analysis-sort-model {
  .vertical-scrollbar();
  max-width: 300px;
  width: 270px;
  max-height: 210px;

  .h3-row-radio {
    .h3-row {
      padding: 0;
    }
    .h3-row__title {
      width: 98px;
      font-size: 12px;
      color: #0f1c35;
      text-align: left;
      padding-left: 16px;
    }
    .h3-row__content {
      height: 24px;
      .ant-radio-group {
      }
      .ant-radio-button-wrapper:focus-within {
        outline: none;
      }
      .ant-radio-button-wrapper {
        width: 52px;
        height: 24px;
        line-height: 22px;
        font-size: 12px;
      }
      .ant-radio-button-wrapper-checked {
        background: rgba(243, 245, 248, 1);
        color: #0f1c35;
        box-shadow: none;
        border-color: #d4d7e0;
      }
      .ant-radio-button-wrapper:first-child {
        border-radius: 12px 0 0 12px;
      }
      .ant-radio-button-wrapper:last-child {
        border-radius: 0 12px 12px 0;
      }
    }
  }
}
</style>
