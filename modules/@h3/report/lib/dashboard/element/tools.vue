<template>
  <div
    :style="{ color: titleColor }"
    :class="[`${prefixCls}`, fixed ? `header-fixed` : '']"
    v-if="!(fixed && ((element && !element.handleActive) || element.edit))"
  >
    <!-- title -->
    <slot name="title" >
      <div :class="[`${prefixCls}__title-wrap`]" >
        <i :class="[`${prefixCls}__title-line`]"></i>
        <a-tooltip
          placement="bottom"
          :class="[`${prefixCls}__title`]"
          :getPopupContainer="getPopupContainer"
        >
          <template slot="title">
            <span>{{ element && element.title }}</span>
          </template>
          <div :style="{ color: titleColor }">{{ element && element.title }}</div>
        </a-tooltip>
        <formula
          v-if="element"
          :chart="element"
          :status="status"
        />
      </div>
    </slot>

    <slot name="extra">
      <!-- icon-wrap -->
      <div :class="[`${prefixCls}__icon-wrap`]">
        <a-tooltip
          placement="bottom"
          class="h3-report-i-btn"
          v-for="(item, index) in toolsButtons"
          :key="index"
          :getPopupContainer="getPopupContainer"
        >
          <template slot="title">
            <span>{{ item.label }}</span>
          </template>
          <a @click="clickToolsButton(item)">
            <i
              class="h3yun_All"
              :class="item.icon"
              :style="{ color: titleColor }"
            />
          </a>
        </a-tooltip>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Formula from "../modules/filter-picker/design-header-formula.vue";
import { Tooltip } from "@h3/antd-vue";
import { ToolsBarType } from "@h3/report/basics/enum/element-tools";
import { ReportState } from "@h3/report/basics/enum/report-state";

@Component({
  name: "h3-dashboard-element-tools",
  components: {
    ATooltip: Tooltip,
    Formula
  }
})
export default class ReportContainerHeader extends Vue {
  @Prop({ default: null }) element!: H3.Report.BaseElement;
  @Prop({ default: null }) global!: H3.Report.Global;
  @Prop({ default: false }) fixed!: boolean; // 是否固定头部
  @Prop({ default: false }) disabled!: boolean;
  @Prop({ default: ReportState.DESIGN }) status!: ReportState;
  @Prop({
    default: () => []
  })
  toolbars!: H3.Element.ToolsBarType[];
  prefixCls = "h3-dashboard-element-tools";

  // todo 后期要提取成配置
  buttons: H3.Element.ToolsBar[] = [
    { label: "导出Excel", key: ToolsBarType.EXPORT as H3.Element.ToolsBarType, icon: "download-o" },
    {
      label: "取消联动",
      key: ToolsBarType.LINKAGE as H3.Element.ToolsBarType,
      icon: "disconnect-o"
    },
    { label: "刷新", key: ToolsBarType.REFRESH as H3.Element.ToolsBarType, icon: "reload-o" },
    {
      label: "缩小",
      key: ToolsBarType.NARROW as H3.Element.ToolsBarType,
      icon: "fullscreen-restore-o"
    },
    {
      label: "全屏",
      key: ToolsBarType.FULLSCREEN as H3.Element.ToolsBarType,
      icon: "fullscreen-o"
    },
    { label: "排序", key: ToolsBarType.SORT as H3.Element.ToolsBarType, icon: "rank-o" },
    { label: "编辑", key: ToolsBarType.EDIT as H3.Element.ToolsBarType, icon: "edit-o" },
    { label: "删除", key: ToolsBarType.REMOVE as H3.Element.ToolsBarType, icon: "delete-o" }
  ];
  /**
   * 组件背景颜色设置
   */
  get getStyles() {
    const chart = this.element as H3.Report.Chart;
    const globalCoat =
      this.global && this.global.styles.elementCoat ? this.global.styles.elementCoat : null;
    let chartCoat;
    if (chart && chart.styles && chart.styles.elementCoat) {
      chartCoat = chart.styles.elementCoat ? chart.styles.elementCoat : null;
    }
    return (
      this.fixed && {
        backgroundColor:
          chartCoat && chartCoat.value ? chartCoat.value : globalCoat && globalCoat.value
      }
    );
  }
  /**
   * 获取工具栏显示按钮
   */
  get toolsButtons() {
    return this.buttons.filter((btn: H3.Element.ToolsBar) => this.toolbars.includes(btn.key));
  }

  /**
   * 获取图表颜色
   */
  get titleColor() {
    const globalFont =
      this.global && this.global.styles && this.global.styles.fontSetting
        ? this.global.styles.fontSetting
        : null;
    const chart = this.element as H3.Report.Chart;
    let chartFont;
    if (chart && chart.styles) {
      chartFont = chart.styles.fontSetting ? chart.styles.fontSetting : null;
    }
    return chartFont && chartFont.titleColor
      ? chartFont.titleColor
      : globalFont && globalFont.titleColor
      ? globalFont.titleColor
      : null;
  }

  /**
   * 元件工具栏事件总控
   * @param btn
   */
  clickToolsButton(btn: H3.Element.ToolsBar) {
    if (!this.disabled) {
      this.$emit("tools-click", { type: btn.key, element: this.element });
    }
  }

  getPopupContainer() {
    return this.$el;
  }
}
</script>
