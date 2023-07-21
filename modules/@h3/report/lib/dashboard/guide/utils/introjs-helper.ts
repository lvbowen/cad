import h3Intro from './intro';


export default class IntroHelper {
  intro: any = null;

  exitCallBack?:Function | null = null

  steps: H3.IntroJsHelper.Step[] = [];
  introOption = {
    hasOverlay: true,
    showButtons: false,
    showStepNumbers: false,
    disableInteraction: false,
    exitOnOverlayClick: false,
    hideHelperLayer: true,
    tooltipPosition: 'right',
    steps: [],
    stepData: [],
    showHighLightContent: false
  };

  introManage: any = {
    focusElementId: null,
    focusElementClass: '',
    step: 0,
    show: false,
    introOption: null,
    introInstance: null,
    subStep: 0,
  };
  
  constructor(steps?: any) {
    this.steps = steps;
  }
  private createIntroBullets (num: number, actIndex: number) {
    if (!num) return '';
    let htmlBullets = '<div class="h3-introl-bullets">';
    let div = '<div class=\'bullet-body\'>';
    for (let i = 1; i <= num; i++) {
      div += `<div class="bullet-item ${i === actIndex ? 'active-bullet' : ''} "></div>`;
    }
    div += '</div>';
    htmlBullets += div + '</div>';
    return htmlBullets;
  }
  /**
   * 创建光标
   * @param rippleOffsetX
   * @param rippleOffsetY
   */
 private createRippleLayer(rippleOffsetX: number = 20, rippleOffsetY: number = 20) {
    return `<div class="introjs-rippleLayer" style="top: ${rippleOffsetX}px; left: ${rippleOffsetY}px">  </div>`

  }

  /**
   * 创建高亮部分
   * @param title
   * @param content
   */
  private createHighlightContent(title, content) {
    return `<div class="introjs-helper-highlight">
                <div class="introjs-helper-highlight__title">${title}</div>
                <div class="introjs-helper-highlight__content">${content}</div>
            </div>`
  }

  /**
   * 创建高亮部分
   * @param content
   */
  private createMainContent(content) {
    return `<div class="intro-helper-main">
                ${content}
            </div>`
  }

  /**
   * 设置配置
   * @param elId
   * @param stepText
   * @param text
   * @param popPosition
   * @param step
   * @param options
   * @param textAlign
   */
  private setIntroHelper (elId: string | HTMLElement, stepText: string, text: string, popPosition: string
    , step: number, options: any, textAlign: string = 'left') {
    this.exit();
    
    let op: any = {};
    if (options) {
      op = Object.assign(this.introOption, options);
    }
    const bulletHtml = this.createIntroBullets(op.subTotal || 0, op.subStep || 0);
    let rippleHtml = '';
    let highLightHtml = '';
    let mainContentHtml = '';
    if (op.showRippleAnimation) {
      rippleHtml = this.createRippleLayer(op.rippleOffsetX, op.rippleOffsetY);
    }
    if (op.showHighLightContent) {
      highLightHtml = this.createHighlightContent(op.highTitle, op.highContent);
    }
    if (op.mainContent) {
      mainContentHtml = this.createMainContent(op.mainContent);
    }

    op.steps = [{
      element: elId,
      intro: `${rippleHtml}
              <div class="h3-intro-top">
                ${bulletHtml}
              </div>
              <div class="intro-helper-report-content" style="text-align:${textAlign}" >
                <span class="intro-helper-step" >${stepText}</span>
                <span class="intro-helper-title">${text}</span>
                ${mainContentHtml}
                ${highLightHtml}
              </div>`,
      position: popPosition,
    }];
    const v = this;
    const t = setTimeout(() => {
      v.intro = h3Intro(op);
      v.intro.onSkip(() => {
        this.exit();
      });
      v.intro.onComplete(() => {
       this.exit();
      });
      v.intro.start();
      v.introManage.introInstance = v.intro;
      v.introManage.show = true;
      v.introManage.subStep = options.subStep || 0;
      v.introManage.focusElementId = elId;
      v.introManage.step = step;
      window.clearTimeout(t);
    }, 500);
  }

  /**
   * 转到第几步引导
   * @param step
   * @param stepOptions
   */
  public goToStep(step: number, stepOptions?: H3.IntroJsHelper.Step) {
    const num = step -1;
    const stepIns = stepOptions || this.steps[num];
    const opt = {
      showRippleAnimation: true,
      rippleOffsetY: stepIns.rippleOffsetY,
      rippleOffsetX: stepIns.rippleOffsetX,
      showHighLightContent: stepIns.showHighLightContent,
      highTitle: stepIns.highTitle ||' ',
      highContent: stepIns.highContent ||' ',
      mainContent: stepIns.mainContent || '',
      showButtons: stepIns.showButtons || false
    };

    this.setIntroHelper(
      stepIns.el,
      stepIns.step,
      stepIns.describe,
      stepIns.position,
      step,
      opt
    );
  }
  
  public exit() {
    if (this.intro) {
      this.intro.exit();
      !!this.exitCallBack && this.exitCallBack(this.introManage.step);
      this.intro = null;
    }
  }

  
}

