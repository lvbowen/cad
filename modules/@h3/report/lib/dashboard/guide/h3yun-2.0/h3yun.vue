<script lang='ts'>
import { Component, Prop, Vue, Provide, Watch } from 'vue-property-decorator';
import { CreateElement } from 'vue';
import IntroHelper from '../utils/introjs-helper';
import Container from './container.vue';

@Component({
  name: 'h3-yun-report-guide',
  components: {

  }
})
export default class ReportGuide extends Vue {
  @Prop({ default: null }) step!: number;
  @Prop({ default: null }) container!: HTMLElement;
  prefixCls = 'h3-yun-report-guide';
  introHelper!: IntroHelper;
  
  steps: H3.IntroJsHelper.Step[] = [
    {
      el: '.h3-report-guide #h3-report-intro-bar',
      describe: '拖动柱状图图表控件到画布区域',
      position: 'right',
      rippleOffsetX: 0,
      rippleOffsetY: -50,
      step: `1/7`,
      tools: this.setExtraHightLight
    },
    {
      el: '.h3-yun-guide-step-2 .h3-menu-tree',
      describe: '选择需要分析展示的数据源',
      position: 'left',
      rippleOffsetX: 256,
      rippleOffsetY: 702,
      step: `2/7`,
    },
    {
      el: '.h3-yun-guide-step-3 #h3-report-data-source__field-1',
      describe: '拖动字段到【维度】区域',
      position: 'left',
      rippleOffsetX: 0,
      rippleOffsetY: 300,
      showHighLightContent: true,
      highTitle:'维度',
      highContent:'是对数据做分类的依据',
      step: `3/7`,
    },
    {
      el: '.h3-yun-guide-step-3 #h3-report-data-source__field-3',
      describe: '拖动字段到【指标】区域',
      position: 'left',
      rippleOffsetX: 0,
      rippleOffsetY: 300,
      showHighLightContent: true,
      highTitle:'指标',
      highContent:'是要统计的数据，会根据【维度】中设置的分组方式进行汇总计算',
      step: `4/7`,
    },
    {
      el: '.h3-yun-guide-step-3 #h3-report-data-source__field-7',
      describe: '拖动字段到【过滤条件】区域',
      position: 'left',
      rippleOffsetX: 0,
      rippleOffsetY: 330,
      showHighLightContent: true,
      highTitle:'过滤条件',
      highContent:'是一种利用对某一字段的限制，过滤出该图表所需要展示数据的机制',
      step: `5/7`,
    },
    {
      el: '.h3-yun-guide-step-4 .ant-modal .ant-modal-content',
      describe: '设置过滤条件',
      position: 'right',
      rippleOffsetX: 215,
      rippleOffsetY: -83,
      step: `6/7`,
    },
    {
      el: `.h3-report-guide .h3-yun-guide-step-1-chart`,
      describe: '您已成功创建了一个仪表盘图表！',
      position: 'right',
      rippleOffsetX: 165,
      rippleOffsetY: 250,
      step: `<img src="${require('@h3/report/basics/assets/complete.png')}"  style='margin-right: -4px; margin-top: -4px'>`,
      showButtons: true,
      mainContent: '该柱状图为我们展示了：深圳奥力给各分区店第三季度的营业额情况。其中第三季度营业额最高的是南山店￥700,000，次之是福田店￥550,000；最低的是光明店￥150,000。'
    },

  ];

  innerStep: number = 0;

  @Provide() initStep!: number;
  @Provide() 
  setStep(step: number) {
    if (this.introHelper) this.introHelper.exit();
    this.innerStep = step;
    this.$emit('change', this.innerStep);
    if (step > 0) this.openIntro(this.innerStep);
  };
  /**
   * 设置其他高光部分
   */
  setExtraHightLight() {
    let content = document.getElementsByClassName('h3-report-container');
    // 给面板加上高亮
    for (let i = 0; i < content.length ; i++) {
      if (content[i].offsetParent.className.indexOf('h3-report-guide') > -1) {
        content[i].className += ' introjs-showElement introjs-relativePosition ';
      }
    }
  }

  /**
   *
   */
  openIntro(step: number) {
    if (!step) return;
    this.introHelper.goToStep(step, this.steps[step -1]);
    this.$nextTick(() => {
      if (this.steps[step -1] && this.steps[step -1].tools) {
        this.steps[step -1].tools();
      }
    })
  }

  /**
   * 退出回掉
   */
  exitCallBack(step) {
    if (step === 7) {
      this.innerStep = 0;
      this.$emit('change', this.innerStep);
    }
  }

  created() {
    this.introHelper = new IntroHelper();
    // (window as any).introHelper = this.introHelper;
    this.introHelper.exitCallBack = this.exitCallBack;
  }
  mounted() {
    this.setStep(this.step);
  }
  destroyed() {
    this.introHelper.exit();
  }
  render(h: CreateElement) {
    return h('div', {
      class: {
        [this.prefixCls]: true
      }
    }, [
      h(Container, {
        props: {
          container: this.container,
          step: this.innerStep
        }
      })
    ]);
  }
}
</script>
