<template>
  <multi-group :title="moduleOptions.title">
    <div
      slot="extra"
      :class="`${prefixCls}__expend`"
      v-show="showExtra"
    >
      <span @click="toggle">
        {{ wrapText }}
        <i :class="['iconfont', isOpen ? 'iconup' : 'icondown']"></i>
      </span>
    </div>
    <sort-list
      :class="`${prefixCls}__wrap`"
      :chart="chart"
      :value="innerValue"
      :limit="isOpen ? null : 2"
      @change-sort="changeSort"
    >
    </sort-list>
  </multi-group>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import MultiGroup from "../../component/multi-group";
import SortList from "../../business/sort-list";
import ModulesMixin from "../../mixins/modules-mixins";
import { sortOptions } from "../../config/static-option";
import { getSelectFields } from "../../help/handleLinkage";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-sort",
  components: {
    MultiGroup,
    SortList
  }
})
export default class AnalysisSort extends Mixins(ModulesMixin) {
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.SortModule; // 排序模块
  @Prop({ default: () => [] }) value!: Array<H3.Report.FieldColumn>; // 模块值

  prefixCls: string = "h3-analysis-sort";

  // 是否展开
  isOpen: boolean = false;

  // 保存的排序值
  get innerValue() {
    return this.value;
  }

  get showExtra() {
    let selectFields = getSelectFields(this.chart);
    return this.chart && selectFields ? selectFields.length > 2 : false;
  }
  get wrapText() {
    return this.isOpen ? "折叠" : "展开";
  }

  /**
   * 切换是否展开排序字段详情
   */
  toggle() {
    this.isOpen = !this.isOpen;
  }

  /**
   * 改变排序
   */
  changeSort(value) {
    this.onModulesChange(this.chart, this.moduleKey, value);
    this.$emit("change-sort", this.innerValue);
  }

  mounted() {}
}
</script>

<style lang="less" scoped>
.h3-analysis-sort {
  &__expend {
    color: #777f8d;
    font-size: 14px;
    cursor: pointer;
    .iconfont {
      color: #b6bcc6;
      font-size: 12px;
    }
  }
  &__wrap {
    height: 100%;
    transition: height 0.5s;
  }
}</style
>>
