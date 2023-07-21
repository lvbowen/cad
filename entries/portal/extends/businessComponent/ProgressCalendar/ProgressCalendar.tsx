import { Vue, Prop, InjectReactive, Component } from 'vue-property-decorator';
import Class from './ProgressCalendar.module.less';
import { ZhCNEx } from "../../locales/zh-CN-ex";
import * as Type from "../../type";
import * as tsx from "vue-tsx-support";

import ProgressPlan from "./progressPlan/progressPlan";


@Component({
  name: 'ProgressCalendar'
})
export default class ProgressCalendar extends Vue {

  _tsx!: tsx.DeclareProps<Pick<ProgressCalendar, 'className' | 'activeDate' | 'selectDate'>>

  @InjectReactive('locale')
  private locale?: typeof ZhCNEx;

  @InjectReactive('projectConfig')
  private projectConfig?: Type.ProjectConfig;

  @InjectReactive('project')
  private projectCode?: string;

  @Prop()
  public className?: string;

  @Prop()
  public activeDate?: string;

  @Prop()
  public selectDate?: Function;

  render() {
    const { locale, className } = this;
    return (
      <article class={`${Class.main} ${className}`}>
        <main class={Class.mainContainer}>
          <section class={Class.container}>
            <nav>
              <span>{locale?.Progress.FillCalendar}</span>
            </nav>
            <article>
              <ProgressPlan
                hideTotal={true}
                activeDate={this.activeDate}
                selectDate={this.selectDate}
              />
            </article>
          </section>
        </main>
      </article>
    );
  }
}
