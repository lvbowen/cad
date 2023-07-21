import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import Class from './Panel.module.less';
import * as tsx from 'vue-tsx-support';

import Icon from "../../../basicCustomComponent/icon/icon";
import {PanelData} from "../../../type";

@Component({
  name: 'Panel',
  components: {
    Icon,
  }
})
export default class Panel<T> extends Vue {
  _tsx!: tsx.DeclareProps<Pick<Panel<T>, 'prevEvent' | 'nextEvent' | 'dataSources' | 'enablePage'>>

  @Prop() enablePage?: boolean;
  @Prop() prevEvent?: Function;
  @Prop() nextEvent?: Function;
  @Prop() dataSources?: Array<PanelData<T>>
  @Prop() pageSize?: number;
  @Prop() current?: number;

  private size: number = 7;
  private index: number = 1;
  private total: number = 0;

  @Watch('dataSources', {immediate: true})
  dataSourceListener(value: Array<PanelData<T>>) {
    console.log('======dataSources======', value);
    const {size, $props} = this, {enablePage} = $props;
    this.data = value;
    if (enablePage) this.total = Math.ceil(value.length / size)
  }

  @Watch('pageSize')
  pageSizeListener(value: number) {
    if (value) this.size = value;
  }

  @Watch('current')
  currentListener(value: number) {
    if (value) this.index = value;
  }

  @Watch('total')
  totalListener(value: number) {
    if (value) this.total = value;
  }

  private data: Array<PanelData<T>> = [];

  private movement(container: HTMLElement, target: HTMLElement, distance: number, way: 'prev' | 'next') {
    const
      mainWidth = container.getBoundingClientRect().width,
      targetWidth = target.getBoundingClientRect().width,
      targetLeft = target.style.marginLeft.split('px')[0];
    let targetLeftDistance;
    try {
      targetLeftDistance = Number(targetLeft);
    } catch (e) {
      return e;
    }
    switch (way){
      case "next":
        if(targetLeftDistance + targetWidth <= mainWidth){
          return
        }else {
          targetLeftDistance = targetLeftDistance + (-distance);
        }
        break;
      case "prev":
        if (way === 'prev' && targetLeftDistance >= 0){
          return
        }else{
          targetLeftDistance = targetLeftDistance + distance;
        }
        break;
    }
    target.style.marginLeft = `${targetLeftDistance}px`;
  }

  private prevChange() {
    const {total, index, $props, $nextTick, $refs, movement} = this, {
      prevEvent,
      enablePage
    } = $props, {Main, DS} = $refs, num = index - 1;
    if (enablePage) {
      if (num < 0 || num === total) return;
      this.index = num;
      $nextTick().then(prevEvent?.(num));
    } else {
      movement((Main as HTMLElement), (DS as HTMLElement), 256, 'prev');

    }

  }

  private nextChange() {
    const {total, index, $props, $nextTick, $refs, movement} = this, {
      nextEvent,
      enablePage
    } = $props, {Main, DS} = $refs, num = index + 1;
    if (enablePage) {
      if (num > total) return;
      this.index = num;
      $nextTick().then(nextEvent?.(num));
    } else {
      movement((Main as HTMLElement), (DS as HTMLElement), 256, 'next');
    }
  }

  private renderPanelData(data: Array<PanelData<T>>): Array<JSX.Element> {
    console.log('====inRenderPanelData====', data);
    return data.map(item =>
      <div class={Class.panelCard}>
        <Icon src={item.icon} class={Class.panelCardIcon}/>
        <span>{item.name}</span>
      </div>
    )
  }


  render() {
    const {renderPanelData, data, prevChange, nextChange, index} = this;
    return (
      <article ref={'Main'} class={Class.main}>
        <icon nativeOnClick={prevChange} src={'left'} class={Class.leftBtn}/>
        <div ref={'DS'} class={Class.DS}>
          {renderPanelData(data)}
        </div>
        <icon nativeOnClick={nextChange} src={'right'} class={Class.rightBtn}/>
      </article>
    );
  }
}

