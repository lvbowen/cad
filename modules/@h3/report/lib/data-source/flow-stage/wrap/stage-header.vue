<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__name`">
      <i :class="[`${prefixCls}__icon`, `h3-report-icon ${node.type}-stage`]"></i>
      <input
        ref="rename-input"
        type="text"
        maxlength="20"
        :value="node.text"
        :class="`${prefixCls}__name-input`"
        :disabled="getDisabled"
        @blur="inputFun($event)"
      />
    </div>
    <!--      输出节点没有tab-->
    <!--        <div :class="`${prefixCls}__middle`">-->
    <!--      <a-tabs-->
    <!--        class="tab-nav"-->
    <!--        :activeStage="activeStage"-->
    <!--        @change="changeTab"-->
    <!--      >-->
    <!--        <a-tab-pane-->
    <!--          v-for="(item) in tabData"-->
    <!--          :key="item.key"-->
    <!--          :tab="item.value"-->
    <!--        >-->
    <!--        </a-tab-pane>-->
    <!--      </a-tabs>-->
    <!--        </div>-->
    <div
      v-if="showStatusBtn"
      :class="`${prefixCls}__right`"
      @click="changeStatus"
    >
      {{ headerBtnText }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { stageStatus } from "../../enum/stage";
import { NodeType } from "../../enum/node";
import { Tabs, Tooltip } from "@h3/antd-vue";

const ReportDataSource = namespace("dataSource");
@Component({
  name: "h3-report-stage-header",
  components: {
    ATooltip: Tooltip,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane
  }
})
export default class ReportStageHeader extends Vue {
  @Prop() node!: H3.Falls.Node;
  @Prop() activeStage!: string;
  prefixCls: string = "h3-report-stage-header";
  // tab数据集 预览浏览
  tabData: Array<any> = [
    { key: stageStatus.setting, value: "配置" },
    { key: stageStatus.preview, value: "预览" }
  ];

  // 输入节点禁止改名
  get getDisabled() {
    // return this.node.type===NodeType.INPUT
    return false;
  }
  // 输入节点按钮文字更改
  get headerBtnText() {
    return this.node.type === NodeType.INPUT ? "更改数据源" : "完成";
  }

  // 浏览时不要按钮
  get showStatusBtn() {
    return !(this.activeStage === stageStatus.preview);
  }

  /**
   * 更改节点名称
   * @param e
   */
  inputFun(e: Event) {
    // 设置空名字时还原上次保存名字
    let value = (e.target as HTMLInputElement).value.length
      ? (e.target as HTMLInputElement).value
      : this.node.text;
    // 去除空格
    this.$emit("input-change", value.replace(/\s/g, ""));
  }
  /**
   * 更改stage状态
   */
  changeStatus() {
    this.$emit("change-status");
  }
  /**
   * tab更改stage状态
   */
  changeTab(key: string) {
    this.activeStage = key;
    this.$emit("change-tab", key);
  }
  created() {}
}
</script>

<style lang="less">
@import "~@h3/report/basics/styles/index";
.h3-report-stage-header {
  height: 38px;
  border-bottom: 1px solid #e0e3e9;
  line-height: 30px;
  display: flex;
  justify-content: center;
  position: relative;
  &__icon {
    padding-right: 8px;
  }
  &__icon.input-stage {
    color: #00d495;
  }
  &__icon.output-stage {
    color: #ffca00;
  }
  &__name {
    display: flex;
    position: absolute;
    left: 0;
    align-items: center;
    padding: 0 8px 8px 8px;
    height: 100%;
    min-width: 50px;
    max-width: 200px;
    &-input {
      width: auto;
      min-width: 50px;
      max-width: 200px;
      height: 22px;
      padding: 0 2px;
      font-size: 14px;
      color: #1f2d3d;
      outline: 0;
      border: none;
      box-shadow: none;
      background: 0 0;
      border-bottom: dashed 1px #bababa;
      -webkit-border-radius: 0;
      -moz-border-radius: 0;
      border-radius: 0;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__right {
    position: absolute;
    right: 0;
    height: 38px;
    line-height: 30px;
    padding: 0 16px;
    color: #107fff;
  }
}
</style>
