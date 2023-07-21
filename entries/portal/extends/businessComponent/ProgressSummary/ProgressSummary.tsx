import { Vue, Prop, Ref, InjectReactive, Component } from 'vue-property-decorator';
import Class from './ProgressSummary.module.less';
import { Icon } from "@ctesi/component";
import { ZhCNEx } from "../../locales/zh-CN-ex";
import * as Type from "../../type";
import moment, { Moment } from "moment";

import ProgressFillRecordV2 from '../ProgressFillRecordV2/ProgressFillRecordV2';
import ProgressCalendar from "../ProgressCalendar/ProgressCalendar";
import ProgressFillDetailV2 from "../ProgressFillDetailV2/ProgressFillDetailV2";


@Component( {
  name: 'ProgressSummary'
} )
export default class ProgressSummary extends Vue {

  @InjectReactive( 'locale' )
  private locale?: typeof ZhCNEx;

  @InjectReactive( 'projectConfig' )
  private projectConfig?: Type.ProjectConfig;

  @InjectReactive( 'project' )
  private projectCode?: string;

  @Ref()
  private ProgressFillRecordV2?: ProgressFillRecordV2;

  @Ref()
  private ProgressFillDetailV2?: ProgressFillDetailV2;

  private activeRecord: Type.ProgressLogV2 | null = null;

  private viewDate: string | null = null;

  private receiveDate: Moment | null = null;

  render() {
    const { locale, activeRecord } = this;
    return (
      <article class={ Class.main }>
        <nav class={ Class.nav }>
          <Icon src={ 'goBack' } className={ Class.goBack }
                clickEvent={ e => this.$router.go( -1 ) }/>
          <span>{ locale?.Progress.Log }</span>
        </nav>
        <main class={ Class.mainContainer }>
          <ProgressFillRecordV2
            ref={ 'ProgressFillRecordV2' }
            className={ Class.fillRecord }
            selectRowFn={ this.selectRecord }
            startDateChange={ this.startDateChange }
            receiveDate={ this.receiveDate }
            getLogListCb={ this.triggerDetailInit }
          />
          <ProgressCalendar
            className={ Class.progressCalendar }
            activeDate={ this.viewDate ?? undefined }
            selectDate={ this.calendarSelectDate }
          />
          <ProgressFillDetailV2
            ref={ 'ProgressFillDetailV2' }
            className={ Class.progressFillDetail }
            recordId={ activeRecord?.id ?? undefined }
            successCb={ this.triggerRecordFetch }
          />
        </main>
      </article>
    );
  }

  private selectRecord( row: Type.ProgressLogV2 ) {
    this.activeRecord = row;
  }

  private startDateChange( dateString: string ) {
    this.viewDate = dateString;
  }

  private triggerRecordFetch() {
    this.ProgressFillRecordV2?.getLogList();
  }

  private triggerDetailInit() {
    this.ProgressFillDetailV2?.initFillDetailList();
    this.activeRecord = null;
  }

  private calendarSelectDate( selectDate: Moment ) {
    console.log( 'selectDate====>', selectDate );
    this.receiveDate = selectDate.clone();
    //cleanup ids
    this.ProgressFillRecordV2?.initCheckIds();
  }
}
