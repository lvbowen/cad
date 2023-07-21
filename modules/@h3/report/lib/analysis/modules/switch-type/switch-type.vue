<template>
  <multi-group :title="moduleOptions.title">
    <div :class="prefixCls">
      <div
        v-for="(type, index) in typeOption"
        :class="[
          `${prefixCls}__item`,
          { [`${prefixCls}__item--selected`]: type.type === innerValue },
          { [`${prefixCls}__item--disable`]: type.disable }
        ]"
        :key="type.type"
        @click="onChangeChartType(type)"
      >
        <a-tooltip
          :getPopupContainer="getPopupContainer"
          :placement="index < 5 ? (index === 4 ? 'topRight' : 'top') : 'bottom'"
        >
          <div slot="title" v-html="`${type.label}<br>${type.tip}`"></div>
          <div class="iconwrap">
            <h3-svg :name="`${type.icon}${type.disable ? '-' : ''}`"></h3-svg>
          </div>
        </a-tooltip>
      </div>
    </div>
  </multi-group>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { Tooltip } from "@h3/antd-vue";
import MultiGroup from "../../component/multi-group";
import ModulesMixin from "../../mixins/modules-mixins";
import { ElementCNType, ElementType, ChartNotice } from "@h3/report/basics/enum/chart-type";
import { chartDMLimit, getMainType } from "@h3/report/basics/instance/help/getModules";
import Svg from "@h3/report/basics/components/icon-svg/index";
import "@h3/report/basics/assets/icon-3.0/iconfont.js";
import { ModuleType } from "@h3/report/basics/enum/chart-modules-type";

@Component({
  name: "h3-analysis-switch-type",
  components: {
    MultiGroup,
    ATooltip: Tooltip,
    H3Svg: Svg
  }
})
export default class AnalysisSwitchType extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.ChartSwitchModule;

  get innerValue() {
    return getMainType(this.chart.type);
  }

  /**
   * 图表类型切换配置
   */
  get typeOption() {
    let opt = [
      {
        type: ElementType.BAR,
        icon: "iconHistogram",
        selected: true,
        disable: false
      },
      {
        type: ElementType.LINE,
        icon: "iconlinechart",
        selected: false,
        disable: false
      },
      {
        type: ElementType.PIE,
        icon: "iconPiechart",
        selected: false,
        disable: false
      },
      {
        type: ElementType.RADAR,
        icon: "iconRadarchart",
        selected: false,
        disable: false
      },
      {
        type: ElementType.TABLE,
        icon: "iconfluoroscopy",
        selected: false,
        disable: false
      },
      {
        type: ElementType.CARD,
        icon: "iconIndicatorchart",
        selected: false,
        disable: false
      },
      {
        type: ElementType.FUNNEL,
        icon: "iconFunnelchart",
        selected: false,
        disable: false
      },
      {
        type: ElementType.SCATTER,
        icon: "iconBubblechart",
        selected: false,
        disable: false
      },
      {
        type: ElementType.BIAX,
        icon: "iconBiaxialplot",
        selected: false,
        disable: false
      },
      {
        type: ElementType.MAP,
        icon: "iconmap_area",
        selected: false,
        disable: false
      }
    ];
    let dl = this.dimensionLength;
    let ml = this.getDataLength(ModuleType.Metric);
    opt = opt.map(item => {
      let dLimit = chartDMLimit[this.dimensionLength]
        ? chartDMLimit[this.dimensionLength]
        : chartDMLimit[chartDMLimit.length - 1];
      let mLimit = dLimit[ml] ? dLimit[ml] : dLimit[dLimit.length - 1];
      return {
        ...item,
        disable: !mLimit.includes(item.type),
        label: ElementCNType[item.type.toUpperCase()],
        tip: ChartNotice[item.type.toUpperCase()]
      };
    });

    return opt;
  }

  prefixCls: string = "h3-analysis-switch-type";

  /**
   * 选择更改时
   */
  onChangeChartType(item) {
    if (this.chart.type === item.type || item.disable) return;
    this.onModulesChange(this.chart, "type", item.type);
  }

  getPopupContainer(trigger) {
    return document.querySelector(".h3-analysis-modules");
  }

  mounted() {
    console.log("=====2", this.moduleOptions);
  }
}
</script>

<style lang="less" scoped>
.h3-analysis-switch-type {
  display: flex;
  flex-wrap: wrap;
  &__item {
    width: 56px;
    height: 56px;
    margin-left: 16px;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid transparent;
    &:hover:not(.h3-analysis-switch-type__item--disable):not(.h3-analysis-switch-type__item--selected) {
      .iconfont {
        color: #2565f1;
        transform: scale(1.05);
      }
      // transition: all 0.3s linear;
    }
    &--selected {
      background: rgba(255, 255, 255, 1);
      border-color: #2565f1;
      transition: all 0.3s;
    }
    .iconwrap {
      padding: 6px;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      svg {
        height: 100%;
        width: 100%;
      }
    }
    .iconfont {
      font-size: 40px;
      color: #2565f1;
      transition: all 0.1s ease;
    }
    &--disable {
      .iconfont {
        color: #b6bcc6;
      }
    }
  }
}
</style>
