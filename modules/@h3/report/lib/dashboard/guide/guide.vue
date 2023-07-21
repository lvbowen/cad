<script lang='ts'>
import { Component, Prop, Vue, Watch, Provide } from 'vue-property-decorator';
import { CreateElement } from 'vue';
import H3Yun from './h3yun-2.0';

@Component({
  name: 'h3-report-guide',
  components: {
  
  }
})
export default class ReportGuide extends Vue {
  @Prop({ default: null }) step!: number;
  @Prop({ default: null }) container!: HTMLElement;
  prefixCls = 'h3-report-guide';

  @Provide() innerStep: number = 0;

  mounted() {
  }
  
  render(h: CreateElement) {
    const guideEl = this.container.cloneNode(true) as HTMLDivElement;
    const canvas = guideEl.querySelector('.h3-report-container__canvas');
    
    const position = this.container.getBoundingClientRect();
    if (canvas) {
      canvas.innerHTML = '';
    }
    return h('div', {
      class: {
        [this.prefixCls]: true
      },
      style: {
        top: `${position.top}px`,
        left: `${position.left}px`,
        bottom: `${document.body.clientHeight - position.bottom}px`,
        right: `${document.body.clientWidth - position.right}px`
      }
    }, [
      h('div', {
        class: {},
        style: {
         height: '100%'
        },
        domProps: {
          innerHTML: guideEl.outerHTML
        }
      }),
      h(H3Yun, {
        props: {
          step: this.step,
          container: this.container
        },
        on: {
          change: (step) => {
            this.$emit('change', step);
          }
        }
      })
    ]);
  }
}
</script>
