<template>
  <div :class="`${prefixCls}`">
    <MultiGroup
      v-for="(item, mainIndex) in moduleOptions.data"
      :key="`Type${mainIndex}`"
      :title="item.title"
    >
      <div :class="`${prefixCls}__icons`">
        <div
          v-for="(option, index) of item.options"
          :key="index"
          :class="getIconClass(mainIndex, option)"
          @click="change(mainIndex, option)"
        >
          <a-tooltip :title="iconClass[option].tip" placement="top">
            <i :class="`iconfont ${iconClass[option].icon}`"></i>
          </a-tooltip>
        </div>
      </div>
    </MultiGroup>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import ModulesMixin from "../../mixins/modules-mixins";
import MultiGroup from "../../component/multi-group";
import { Tooltip } from "@h3/antd-vue";
import { ElementType, ElementCNType } from "@h3/report/basics/enum/chart-type";

@Component({
  name: "h3-analysis-multi-metric-type",
  components: {
    MultiGroup,
    ATooltip: Tooltip
  }
})
export default class AnalysisMultiMetricType extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: null }) moduleOptions!: H3.Analysis.MultiMetricTypeModule;
  // 模块值
  @Prop({ default: null }) value!: Array<"bar" | "line" | "area" | "pileBar">;

  prefixCls: string = "h3-analysis-multi-metric-type";

  /**
   * 字体图标
   */
  get iconClass() {
    return {
      [ElementType.BAR]: {
        icon: "iconHistogram",
        tip: ElementCNType.BAR
      },
      [ElementType.LINE]: {
        icon: "iconlinechart",
        tip: ElementCNType.LINE
      },
      [ElementType.AREA]: {
        icon: "iconAreachart",
        tip: ElementCNType.AREA
      },
      [ElementType.PILEBAR]: {
        icon: "iconStackedchart",
        tip: ElementCNType.PILEBAR
      }
    };
  }

  /**
   * 获取当前类型图标及其状态
   */
  getIconClass(index, icon) {
    let itemClass = `${this.prefixCls}__icons--item`;
    let disabled = this.getDisabledState(index, icon);
    let iconState =
      this.value && this.value[index] === icon
        ? itemClass + "--selected"
        : disabled
        ? itemClass + "--disabled"
        : "";
    return `${itemClass} ${iconState}`;
  }

  /**
   * 计算是否是不可点击类型
   */
  getDisabledState(index, icon) {
    return this.value
      ? this.value.some((i, iconIndex) => {
          return i === icon && index !== iconIndex;
        })
      : false;
  }

  // 当值发生变化时
  change(index, icon) {
    let disabled = this.getDisabledState(index, icon);
    // 如果是右轴且是补课点击的就不可点击
    if (index && disabled) return;
    let val = this.value ? [...this.value] : [];
    if (!index && disabled) {
      // 如果是左轴点击了不可点击的图表 就将右轴切换到对应的其他图表
      let rightType = this.value[1];
      rightType =
        this.moduleOptions.data[index].options.find((key: string) => key !== icon) || rightType;
      val.splice(1, 1, rightType);
    }
    val.splice(index, 1, icon);
    this.onModulesChange(this.chart, this.moduleKey, val);
  }
}
</script>

<style lang="less" scoped>
.h3-analysis-multi-metric-type {
  &__icons {
    display: flex;
    &--item {
      margin-left: 16px;
      width: 40px;
      height: 40px;
      border-radius: 4px;
      line-height: 40px;
      text-align: center;
      cursor: pointer;
      .iconfont {
        color: #2565f1;
        font-size: 32px;
      }

      &--selected {
        background: #fff;
        border: 2px solid #2565f1;
      }
      &--disabled {
        .iconfont {
          color: #8893a7 !important;
        }
      }
    }
  }
}
</style>
