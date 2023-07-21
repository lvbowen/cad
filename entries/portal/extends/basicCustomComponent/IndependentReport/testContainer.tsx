import {Component, InjectReactive, Vue} from 'vue-property-decorator';
import IndependentReportControl from "./IndependentReportControl";
import Class from './testContainer.module.less';

@Component({
  name:'testContainer'
})
export default class TestContainer extends Vue {

  @InjectReactive('project') projectCode?:string;

  private reportControl:IndependentReportControl = new IndependentReportControl(this);

  mounted(){
    const { reportControl,$el } = this;
    reportControl.setOptions({
      projectCode: this.projectCode as string,
      reportCode: "CH_report",
      element:$el
    })
  }

  render() {
    const { reportControl } = this;
    console.log('inContainer',this.$createElement);
    return (
      <article class={Class.main}>
        {reportControl.render()}
      </article>
    );
  }
}
