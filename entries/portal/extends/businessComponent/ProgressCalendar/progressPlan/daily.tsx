import { Component, Prop, Vue, Ref } from "vue-property-decorator";
import Class from './progressPlan.module.less';
import { Moment } from "moment";
import * as tsx from "vue-tsx-support";

interface ActiveSize {
  width: number;
  height: number;
}

@Component({
  name: 'daily'
})
export default class Daily extends Vue {

  _tsx!: tsx.DeclareProps<Pick<Daily, 'date' | 'clickEvent' | 'format' | 'className' | 'customContent' | 'active'>>

  @Prop() date!: Moment;
  @Prop() clickEvent?: MouseEvent;
  @Prop() format?: 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD' | 'MM-DD' | 'DD' | string | undefined;
  @Prop() className?: string;
  @Prop() customContent?: Array<JSX.Element> | JSX.Element;
  @Prop() active?: boolean;
  @Ref() Container?: HTMLElement;

  private activeSize: ActiveSize = {
    height: 0,
    width: 0
  }

  public calcSize() {
    const { Container } = this;
    if (!Container) return;
    const { width, height } = Container.getClientRects()[0];
    this.activeSize.height = height;
    this.activeSize.width = width;
  }

  mounted() {
    const { calcSize, activeSize } = this;
    calcSize();
    window.addEventListener('resize', calcSize);
  }

  destroyed() {
    const { calcSize } = this;
    window.removeEventListener('resize', calcSize);
  }

  render() {
    const
      { $props, active, activeSize } = this,
      { date, clickEvent, format, className, customContent } = $props;
    return (
      <div ref={'Container'} class={className && className}>
        {
          <div class={Class.dailyBox}>
            {
              !active && !customContent ? date ? date.format(format) : date.format('YYYY-MM-DD') : undefined
            }
            {
              !active && customContent && customContent
            }
          </div>
        }
        {
          active &&
          <div
            style={{ width: `${activeSize.width*1.8}px`, height: `${activeSize.height*1.8}px`,marginTop:`-${activeSize.height/3}px` }}
            class={Class.top}
          >
            {
              !customContent ? date ? date.format(format) : date.format('YYYY-MM-DD') : undefined
            }
            {
              customContent && customContent
            }
          </div>
        }
      </div>
    );
  }
}
