import introJs from 'intro.js';
import 'intro.js/introjs.css';
import '../style/h3-intro.less';

function stepTemplate({ title = '', content }) {
  return `<div class="bubble-box">
            ${title ? `
              <h3>${title}</h3>
            `:''}
            <p class="bubble-content">
              ${content}
            </p>
          </div>`;
}

export default function h3Intro(options) {
  const intro = introJs();
  const defaultOptions = {
    showStepNumbers: false,
    showProgress: false,
    showBullets: false,
    showButtons: true,
    overlayOpacity: 0.6,
    disableInteraction: true,
    exitOnOverlayClick: false,
    exitOnEsc: false,
    tooltipClass: 'h3-report-intro-bubble',
    tooltipPosition: 'bottom-middle-aligned',
    helperElementPadding:0,
    noPrev: true,
    hideNext: true,
    skipLabel: '跳过',
    prevLabel: '上一步',
    nextLabel: '下一步',
    doneLabel: '我知道了',
    hasOverlay: true,
    offsetX: 0,
    offsetY: 0,
    hideHelperLayer: false,
    showRippleAnimation: true,
    rippleOffsetX: 10, 
    rippleOffsetY: 10,
    scrollToElement: true,
    keyboardNavigation:false  
  };
  const introOptions = Object.assign(defaultOptions, options);
  if (!introOptions.steps) {
    const stepData = introOptions.stepData;
    const steps = stepData.map(step => {
      return {
        element: step.element,
        intro: stepTemplate(step),
        position: step.position,
      };
    });
    introOptions.steps = steps;

  }
  intro.setOptions(introOptions);
  return {
    addStep(h3Step) {
      intro.addStep({
        element: h3Step.element,
        intro: stepTemplate(h3Step),
      });
      return this;
    },
    start() {
      intro.start();
      return this;
    },
    exit() {
      intro.exit();
      return this;
    },
    onComplete(providedCallback) {
      intro.oncomplete(providedCallback);
      return this;
    },
    onSkip(providedCallback) {
      intro.onskip(providedCallback);
      return this;
    },
    onChange(providedCallback){
      intro.onchange(providedCallback);
      return this;
    },
    setOptions(providedCallback){
      intro.setOptions(providedCallback);
      return this;
    },
    nextStep(providedCallback){
      intro.nextStep(providedCallback);
      return this;
    },
    goToStep(providedCallback){
      intro.goToStep(providedCallback);
      return this;
    },
    refresh(providedCallback){
      intro.refresh(providedCallback);
      return this;
    },
    addHinit() {
      intro.addHints();
      return this;
    }
  };
}
