import { Vue, Component, Prop } from 'vue-property-decorator';
import Class from './qualityModule.module.less';
import { Icon } from '@ctesi/component';
import * as Type from '../../type';
import QualityRadio from "./QualityRadio";
import * as tsx from 'vue-tsx-support';

@Component( {
  name: 'QualityTemplate'
} )
export default class QualityTemplate extends Vue {

  _tsx!: tsx.DeclareProps<Pick<QualityTemplate, 'editMode' | 'titleEvent' | 'select' | 'removeEvent' | 'source'>>

  static QualityRadio: any = QualityRadio;

  @Prop() editMode?: boolean;

  @Prop() titleEvent?: Function;

  @Prop() select?: Function;

  @Prop() removeEvent?: Function;

  /*@Prop() source?: Type.QualityQBS;*/
  @Prop() source?: Type.QualityQBS | { bizSheetName: string, others: any };


  render() {
    const { source, editMode, titleEvent, removeEvent, select } = this;
    return (
      <div
        class={ `${ Class.templateRow } ${ select?.( source ) ? Class.templateRowSelected : '' }` }>
        <Icon clickEvent={ e => titleEvent?.( source ) } src={ 'doc' } className={ Class.doc }/>
        <span onClick={ e => titleEvent?.( source ) }
              class={ Class.templateName }>{ source?.bizSheetName }</span>
        {
          editMode &&
          <Icon clickEvent={ e => removeEvent?.( source ) } src={ 'removeDoc' }
                className={ Class.doc }/>
        }
      </div>
    );
  }
}
