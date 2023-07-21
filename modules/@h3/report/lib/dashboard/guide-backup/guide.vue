<template>
  <div>
    <a-tooltip placement="top" title="新手引导">
      <div
        class="h3-report-guide"
        @click="startUserGuide(1)"
      >
        <span class="h3yun_All bulb-o"></span>
      </div>
    </a-tooltip>

    <div
      v-if="introStep"
      class="h3-report-guide-exit" 
      @click="setIntroState(0)"
    >
      <i class="h3yun_All poweroff-o"></i>
      退出新手指引
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch, Provide, Mixins } from 'vue-property-decorator';
import { State, Action, Mutation, namespace } from 'vuex-class';
import IntrojsManagerMixin from '@h3/report/basics/mixins/introjs-manager'
import { ReportAction, ReportMutation } from '@h3/report/basics/store/dashboard/types';
import {
  Tooltip,
} from '@h3/antd-vue';
import { introDataSourceId } from '@h3/report/basics/mixins/intro-data'

const ReportPro = namespace('report');
const contentID = [
  {
    id: '',
    discribe: '',
    textAlign: '',
    rippleOffsetX: 0,
    rippleOffsetY: -30,
    showHighLightContent: false,
    step: '0'
  },
  {
    id: '#h3-report-intro-bar',
    discribe: '拖动柱状图图表控件到画布区域',
    textAlign: 'right',
    rippleOffsetX: 0,
    rippleOffsetY: -30,
    step: `1/7`,
  },
  {
    id: '.h3-report-data-source-modal .h3-tree .h3-menu-tree',
    discribe: '选择需要分析展示的数据源',
    textAlign: 'left',
    rippleOffsetX: 250,
    rippleOffsetY: 660,
    step: `2/7`,
  },
  {
    id: '#h3-report-data-source__field-1',
    discribe: '拖动字段到【维度】区域',
    textAlign: 'left',
    rippleOffsetX: 0,
    rippleOffsetY: 260,
    showHighLightContent: true,
    highTitle:'维度',
    highContent:'是对数据做分类的依据',
    step: `3/7`,
  },
  {
    id: '#h3-report-data-source__field-3',
    discribe: '拖动字段到【指标】区域',
    textAlign: 'left',
    rippleOffsetX: 0,
    rippleOffsetY: 270,
    showHighLightContent: true,
    highTitle:'指标',
    highContent:'是要统计的数据，会根据【维度】中设置的分组方式进行汇总计算',
    step: `4/7`,
  },
  {
    id: '#h3-report-data-source__field-7',
    discribe: '拖动字段到【过滤条件】区域',
    textAlign: 'left',
    rippleOffsetX: 0,
    rippleOffsetY: 300,
    showHighLightContent: true,
    highTitle:'过滤条件',
    highContent:'是一种利用对某一字段的限制，过滤出该图表所需要展示数据的机制',
    step: `5/7`,
  },
  {
    id: '.h3-report-modules-filter-model-intro .ant-modal-content .ant-btn-primary',
    discribe: '设置过滤条件',
    textAlign: 'right',
    rippleOffsetX: 0,
    rippleOffsetY: -30,
    step: `6/7`,
  },
  {
    id: `#${introDataSourceId}`,
    discribe: '您已成功创建了一个仪表盘图表！',
    textAlign: 'right',
    rippleOffsetX: 170,
    rippleOffsetY: 220,
    step: `<img src="${require('@h3/report/basics/assets/complete.png')}"  style='margin-right: -4px; margin-top: -4px'>`,
    showButtons: true,
    mainContent: '该柱状图为我们展示了：深圳奥力给各分区店第三季度的营业额情况。其中第三季度营业额最高的是南山店￥700,000，次之是福田店￥550,000；最低的是光明店￥150,000。'
  },
 
]

@Component({
  name: 'h3-report-guide',
  components: {
    ATooltip: Tooltip,
  }
})
export default class ReportGuide extends Mixins(IntrojsManagerMixin) {
  @ReportPro.State('introStep') introStep!: number;
  @ReportPro.State('showDisplaySettingIntro') showDisplaySettingIntro!: number;
  @ReportPro.State('showChartAuthorityIntro') showChartAuthorityIntro!: number;
  @ReportPro.Mutation(ReportMutation.SERINTROSTATE) setIntroState!: Function;

  @Watch('introStep')
  watchIntroStep(val, oldval) {
    this.cancelHelpTask();
    if (val > 1 ) {
      if (val === 2 || val === 6) {
        setTimeout(()=> {
          this.startUserGuide(val);
        }, 100);
        if (val === 2) {
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
      } else {
        this.startUserGuide(val);
      }
    }
    if (oldval === 2) {
      // 第二步之后移除格式化样式
      const domList = document.getElementsByClassName('h3-report-introjs-parentIndex');
      if (domList && domList.length > 0) {
        for (let i = 0; i < domList.length; i++) {
          domList[i].classList.remove("h3-report-introjs-parentIndex");
        }
      }
    }
  }
  @Watch('showDisplaySettingIntro')
  watchChartAuthorityIntro(val, oldval) {
    if (!val && oldval) {
      this.$emit('update-guide', 'chartAuthority');
    }
   
  }
  @Watch('showChartAuthorityIntro')
  watchDisplaySettingIntro(val, oldval) {
    if (!val && oldval) {
      this.$emit('update-guide', 'displaySetting');
    }
    
  }

  /**
   * 开始新手引导
   */
  startUserGuide(step: number = 1) {
    if (step === 1) {
      this.$emit('update-guide', 'primaryGuide');
    }
    if (this.introStep !== step) {
      this.setIntroState(step);
    }
    const opt = {
      showRippleAnimation: true,
      rippleOffsetY: contentID[step].rippleOffsetY,
      rippleOffsetX: contentID[step].rippleOffsetX,
      showHighLightContent: contentID[step].showHighLightContent,
      highTitle: contentID[step].highTitle ||' ',
      highContent: contentID[step].highContent ||' ',
      mainContent: contentID[step].mainContent || '',
      showButtons: contentID[step].showButtons || false
    };

    this.setIntroHelper(
      contentID[step].id,
      contentID[step].step,
      contentID[step].discribe,
      contentID[step].textAlign,
      step,
      opt
    );
  }

  mounted() {
    if (this.introStep) {
      this.startUserGuide(this.introStep);
    }
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
  .h3-report-guide {
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
