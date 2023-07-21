<template>
  <div :class="[prefixCls, global.styles.paintCoatTheme]">
    <h3-grid-layout
      ref="gridLayout"
      :layout="charts"
      :reserveHeight="200"
      :colNum="getLayoutOptions.colNum"
      :rowHeight="getLayoutOptions.rowHeight"
      :margin="getLayoutOptions.margin"
      :showGridLine="getLayoutOptions.showGridLine"
      :isDraggable="getLayoutOptions.draggable"
      :isResizable="getLayoutOptions.resizable"
      :verticalCompact="true"
      :useCssTransforms="true"
      :responsive="getLayoutOptions.responsive"
    >
      <h3-grid-item
        :style="getItemStyles"
        :data-id="item.uid"
        :handleActive="item.handleActive"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :minH="item.minH"
        :minW="item.minW"
      >
        <div v-if="showInitChart || step > 1" :class="`${prefixCls}-chart`">
          <div class="h3-dashboard-element-tools h3-report-elementWrap__header" :style="`color: ${titleColor}`">
            <div class="h3-dashboard-element-tools__title-wrap">
              <i class="h3-dashboard-element-tools__title-line"></i> 
              <div class="h3-dashboard-element-tools__title" :style="`color: ${titleColor}`">未命名的图表</div> 
            </div>
            <div class="h3-dashboard-element-tools__icon-wrap">
              <a class="h3-report-i-btn"><i class="h3yun_All reload-o" :style="`color: ${titleColor}`"></i></a>
              <a class="h3-report-i-btn"><i class="h3yun_All rank-o" :style="`color: ${titleColor}`"></i></a>
              <a class="h3-report-i-btn"><i class="h3yun_All delete-o" :style="`color: ${titleColor}`"></i></a>
            </div>
          </div>
          <div :class="`${prefixCls}-chart-content`">
            <img v-if="step < 5" :src="require('@h3/report/basics/assets/bar-blue.png')"/>
            <div v-if="step > 4" :class="`${prefixCls}-data`">
              <img :src="require('@h3/report/basics/assets/intro-bar.png')"/>
            </div>
          </div>
        </div>
      </h3-grid-item>
    </h3-grid-layout>

    <div class="h3-report-container__empty" v-if="!(this.dragChart && this.showDragingChart) && step === 1">
      <img :src="require('@h3/report/basics/assets/pro/design-bg.png')">
      <label>拖入顶部图表类型新建仪表盘</label>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Provide, Vue, Watch, Inject } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { Modal, Popconfirm, Tooltip } from '@h3/antd-vue';
import { H3GridLayout } from '@h3/awesome-ui';
const ReportPro = namespace('report');

@Component({
  name: 'h3-yun-guide-step-1',
  components: {
    H3GridLayout,
    H3GridItem: H3GridLayout.Item,
  },
})
export default class ReportStep extends Vue {
  @ReportPro.State('global') global!: H3.Report.Global;
  @Prop({ default: 0 })  step!: number;
  @Inject({ default: () => {} }) setStep!: Function;

  prefixCls = 'h3-yun-guide-step-1';

  // 虚拟图表数据
  charts: Array<any> = []
  // 是否有拖拽图表
  dragChart: boolean = false;
  // 是否现实拖拽时的图表外壳
  showDragingChart: boolean = false;
  // 是否现实初始化图表
  showInitChart: boolean = false;

  /**
   * 拖拽布局信息
   */
  get getLayoutOptions() {
    return {
      draggable: false,
      margin: [8, 8],
      showGridLine: false,
      mask: true,
      editState: true,
      resizable: false,
      responsive: false,
      colNum: 32,
      rowHeight: 32
    };
  }

  /**
   * 拖拽元素的
   */
  get item() {
    return {
        x: 0,
        y: 0,
        w: 16,
        h: 8,
        i: 95,
        minH: 6,
        minW: 8,
    }
  }

  /**
   * 模块样式
   */
  get getItemStyles() {
    let defaultBg = 'transparent';
    defaultBg = this.global.styles.elementCoat.value || 'transparent'

    const bgc = this.dragChart && this.showDragingChart ? '#EBF4FF' : this.showInitChart ? defaultBg : 'transparent';
    const borderStyle = this.dragChart && this.showDragingChart ? 'solid' :  'none';
    return { 
      backgroundColor: bgc,
      border: `1px ${borderStyle} #1070ff` };
  }

  /**
   * 全局标题样式
   */
  get titleColor() {
    const globalFont = this.global && this.global.styles.fontSetting ? this.global.styles.fontSetting : null;
   
    return globalFont ? globalFont.titleColor : '#304265';
  }

  /**
   * 鼠标移动事件
   */
  mousemove(e) {
    const isPane = e.target.className && typeof e.target.className === 'string' ? e.target.className.indexOf('vue-grid-item') > -1 : false;
    if (this.dragChart && isPane) {
      // 如果正在拖动图表 切移动到了画布中激活画布颜色
      // 在画布中添加空白图表 
      this.showDragingChart = true;
      e.stopPropagation();
      e.preventDefault();
      // gridLayout.compact();
    }
  }

  /**
   * 鼠标按下事件
   */
  mousedown(e) {
    // 判断按下时间聚焦的是否是icon
    const isChartIcon = e.path ? (e.path as Array<HTMLElement>).find(i => {
      return i.tagName === 'A' && i.className.indexOf('h3-report-intro-bar') > -1;
    }) : e.target.tagName === 'svg' || e.target.className.indexOf('h3-report-intro-bar') > -1;
    if (isChartIcon) {
      this.dragChart = true;
    }
  }

  /**
   * 鼠标抬起事件
   */
  mouseup(e: MouseEvent) {
    if (this.dragChart && this.showDragingChart) {
      // 展示默认图表 并弹出选择数据源弹窗
      this.showInitChart = true;
      this.dragChart = false;
      this.showDragingChart = false;

      // 关闭第一步新手引导 弹出第一部弹窗 聚焦第二步
      this.setStep(2);
      // 事件注销
      document.body.removeEventListener('mousedown', this.mousedown, false);
      // document.body.removeEventListener('mouseup', this.mouseup, false);
      document.body.removeEventListener('mousemove', this.mousemove, false);
    } 
    this.dragChart = false;

  }

  mounted() {
    // 挂载时监听事件
    document.body.addEventListener('mousedown', this.mousedown, false);
    document.body.addEventListener('mouseup', this.mouseup, false);
    document.body.addEventListener('mousemove', this.mousemove, false);
  }

  destroyed() {
    // 事件注销
    document.body.removeEventListener('mousedown', this.mousedown, false);
    document.body.removeEventListener('mouseup', this.mouseup, false);
    document.body.removeEventListener('mousemove', this.mousemove, false);
  }
}
</script>
<style lang="less">
.h3-yun-guide-step-1{
  height: 100%;
  width: calc(100% - 420px);
  position: relative;
  &-chart{
    height: 100%;
    &-content{
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(100% - 54px) !important;
      img{
        width: 80px;
        height: 80px;
      }
    }
  }
  &-data{
    width: 100%;
    height: 100%;
    padding: 8px 16px;
    img{
      width: 100%;
      height: 100%;
    }
  }

  .h3-report-container__empty{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
