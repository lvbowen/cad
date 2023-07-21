<template>
  <div>
    <a-tooltip placement="top" title="新手引导">
      <div
        class="h3-report-guide-entry"
        @click="startUserGuide(1)"
      >
        <span class="h3yun_All bulb-o"></span>
      </div>
    </a-tooltip>

    <div
      v-if="innerStep"
      class="h3-report-guide-exit"
      @click="startUserGuide(0)"
    >
      <i class="h3yun_All poweroff-o"></i>
      退出新手指引
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch, Provide, Mixins } from 'vue-property-decorator';
import { State, Action, Mutation, namespace } from 'vuex-class';
import {
  Tooltip,
} from '@h3/antd-vue';
import Guide from './index';


@Component({
  name: 'h3-report-guide-entry',
  components: {
    ATooltip: Tooltip,
  }
})
export default class ReportGuideEntry extends Vue {
  @Prop({ default: null }) container!: HTMLElement;
  @Prop({ default: () => {} }) config!: H3.Intro.config;

  innerStep: number = 0

  guide: any = null;

  @Watch('container')
  watchConfig(val, oldval) {
    if (val && !oldval && this.config.primaryGuide && !this.guide) {
      this.$nextTick(() => {
        this.startUserGuide(1);
      })
    }
  }

  /**
   * 开始新手引导
   */
  startUserGuide(step: number = 1) {
    if (step === 1) {
      this.setZindex();
      this.$emit('update-guide', 'primaryGuide');
    }

    this.innerStep = step;
    if (step === 0 && this.guide) {
      // 关闭新手引导
      this.resetZindex();
      // console.log(this.guide);
      // console.log(window.introHelper);
      // window.introHelper.exit();
      // window.introHelper = null;
      this.guide.close();
      return;
    }
    if (this.container) {
      this.guide = Guide({
        container: this.container,
        step: step,
        store: this.$store,
        change: this.changeStep
      });
    }
  }

  /**
   * 步数更改回掉
   */
  changeStep(step: number) {
    this.innerStep = step;
    if (!step) {
      this.startUserGuide(0);
    }
  }

  /**
   * 递归去掉层级
   */
  setZindex() {
    // 强制格式化 报表的层级
    const dom = document.getElementsByClassName('h3-report-designer') as HTMLCollection;
    const design = dom[0];
    if (design) {
      let parent = design.parentElement as HTMLElement;
      while (parent.tagName !== 'BODY') {
        let zindex = window.getComputedStyle(parent).zIndex;
        if (zindex !== '' && zindex !== 'auto') {
          console.log(parent.style.zIndex);
          parent.className += '  h3-report-introjs-parentIndex  '
        }
        parent = parent.parentElement as HTMLElement;
      }
    }
  }

  /**
   * 重置样式层级
   */
  resetZindex() {
    // 第二步之后移除格式化样式
    const domList = document.getElementsByClassName('h3-report-introjs-parentIndex');
    if (domList && domList.length > 0) {
      for (let i = 0; i < domList.length; i++) {
        domList[i].classList.remove("h3-report-introjs-parentIndex");
      }
    }

  }

  mounted() {
  }

}
</script>

<style lang="less">
  @import "~@h3/report/basics/styles/index";
  .h3-report-introjs-parentIndex {
    z-index: auto !important;
    .h3-report-designer-header{
      z-index: auto !important;
    }
  }
  .h3-report-guide-entry {
    position: fixed;
    bottom: 24px;
    right: 446px;
    width: 32px;
    height: 32px;
    line-height: 32px;
    border-radius: 100%;
    background: linear-gradient(
      44deg,
      rgba(37, 82, 255, 1) 0%,
      rgba(57, 149, 255, 1) 100%
    );
    opacity: 0.2;
    text-align: center;
    z-index: 98;
    cursor: pointer;
    span {
      color: #fff;
    }
    &:hover {
      width: 32px;
      height: 32px;
      opacity: 0.8;
      background: linear-gradient(
        44deg,
        rgba(80, 117, 255, 1) 0%,
        rgba(96, 171, 255, 1) 100%
      );
      box-shadow: 0px 0px 7px 0px rgba(29, 73, 172, 0.22);
    }
  }

  .h3-report-guide-exit {
    position: fixed;
    z-index: 9999999;
    top: 32px;
    right: 48px;
    width: 138px;
    height: 40px;
    line-height: 40px;
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    border: 1px solid rgba(203, 208, 216, 1);
    color: #304265;
    text-align: center;
    cursor: pointer;
  }
</style>
