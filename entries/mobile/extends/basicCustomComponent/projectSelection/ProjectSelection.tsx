import {Component, Prop, Vue} from 'vue-property-decorator';
import {LayerStandardData} from "../../type";
import * as tsx from 'vue-tsx-support';
import Class from './ProjectSelection.module.less';

@Component({
  name: 'ProjectSelection'
})
export default class ProjectSelection extends Vue {

  _tsx!:tsx.DeclareProps<Pick<ProjectSelection, 'sourcesList'|'selectEvent'>>

  @Prop() sourcesList?: Array<LayerStandardData>;

  @Prop() selectEvent?: Function;

  private renderList(layerArray:Array<LayerStandardData>) {
    const {selectEvent} = this;
    return layerArray.map(item=>{
      return <span onClick={()=>selectEvent?.(item.Pkid)}>{item.ownerProject}</span>
    })
  }

  render() {
    const {renderList, sourcesList} = this;
    return (
      <article class={Class.main}>
        <nav>选择项目</nav>
        <section class={Class.list}>
          {sourcesList && renderList(sourcesList)}
        </section>
      </article>
    );
  }
}
