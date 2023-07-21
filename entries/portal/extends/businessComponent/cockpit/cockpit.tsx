import {Component, Vue} from "vue-property-decorator";
import Class from './cockpit.module.less';
import {CockPitConfig} from '../../config/config';
import {Icon} from '../../basicCustomComponent';


@Component({
  name: 'Cockpit'
})
export default class Cockpit extends Vue {

  activeIndex: number = 0;

  public go2page(routeName: string): void {
    this.$router.push({name: routeName}).catch((err) => {
      //TODO:全局捕获错误插件完成之前先替代
    });
  }

  public renderCard(index: number): Array<JSX.Element> {
    const
      vDom: Array<JSX.Element> = [],
      {activeIndex, go2page} = this;
    CockPitConfig.forEach((item, index) => {
      vDom.push(
        <div
          onClick={() => go2page(item.routeName)}
          class={`${Class.card} ${activeIndex === index && Class.active || ''}`}
          onMouseover={()=>this.activeIndex=index}
        >
          <main class={Class.carContent}>
            <Icon className={Class.sysIcon} src={item.icon} external/>
            <aside class={`${Class.cardSpan} ${activeIndex === index && Class.spanActive || ''}`}>
              <span>
                {item.name}
              </span>
            </aside>
          </main>
        </div>
      )
    });
    return vDom;
  }

  render() {
    const {activeIndex, renderCard} = this;
    return (
      <article class={Class.main}>
        {renderCard(activeIndex)}
      </article>
    );
  }
}
