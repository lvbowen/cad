import { Component, InjectReactive, Prop, Vue, Watch } from "vue-property-decorator";
import { Calendar } from "../../../antdVrewrite";
import Class from './progressPlan.module.less';
import * as Type from '../../../type';
import * as tsx from 'vue-tsx-support';

import Daily from "./daily";
import { getListPlanAmount, getProgressPlanCalender } from '../../../service/api';
import { ProgressPlanList, ProgressPlanOverviewRes } from '../../../type';
import moment, { Moment } from "moment";
import 'moment/locale/zh-cn';
import Utils from "../../../utils";

import Badge from 'ant-design-vue/lib/badge';
import 'ant-design-vue/lib/badge/style/index.css';
import { Icon } from "../../../../../../modules/@ctesi/component";

import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';


@Component( {
  name: 'progressPlan',
  components: {
    ACalendar: Calendar,
    Daily: Daily
  }
} )
export default class ProgressPlan extends Vue {

  _tsx!: tsx.DeclareProps<Pick<ProgressPlan, 'hideTotal' | 'activeDate' | 'selectDate'>>

  @InjectReactive( 'project' ) projectCode?: string;

  @InjectReactive( 'projectConfig' ) projectConfig?: Type.ProjectConfig;

  @Prop()
  public hideTotal?: boolean;

  @Prop()
  public selectDate?: Function;

  @Prop()
  public activeDate?: string;

  private calendarDataMap: Map<string, ProgressPlanList> | boolean = false;
  private totalMoney: string | number = 0;
  private monthMoney: string | number = 0;
  private yearMoney: string | number = 0;
  private contractnum: string | null = null; //合同编号
  private workMonth: string | null = null; //当前月
  private startOfMonth: Moment | null = null;
  private endOfMonth: Moment | null = null;
  private toDay: Moment = moment( new Date() );
  private currentDate: Moment = moment( new Date() );

  @Watch( 'activeDate' )
  activeDateListener( dateString: string ) {
    if ( !dateString ) return;
    this.toDay = moment( dateString );
    this.startOfMonth = moment( dateString ).startOf( 'month' );
    this.endOfMonth = moment( dateString ).endOf( 'month' );
  }

  renderContent( date: Moment, active: boolean ): Array<JSX.Element> | JSX.Element {
    const { startOfMonth, endOfMonth, calendarDataMap, contractnum, hideTotal } = this;
    const { projectName } = Utils.GetRequest();
    const vDom: Array<JSX.Element> = [];
    let duringMonth: boolean = true;
    if ( date.isBefore( startOfMonth ) || date.isAfter( endOfMonth ) ) duringMonth = false;
    const money = calendarDataMap && (calendarDataMap as Map<string, ProgressPlanList>).get( date.format( 'YYYY-MM-DD' ) )?.totalMoney;
    const content = [
      // (
      //   <aside>
      //     {
      //       money&&
      //       <span>
      //         <Badge color={'#FFBC09'}/>
      //         {/* <span>产值:{money}</span> */}
      //       </span>
      //       ||
      //       undefined
      //     }
      //   </aside>
      // ),
      (<nav style={{color: money? '#25c974': ''}}>{ date.format( 'DD' ) }</nav>)
    ];
    //!hideTotal
    if ( hideTotal && active ) {
      content.push(
        <aside class={ Class.moneyTips }>
          {/* {
            money &&
            <span>
              <Badge color={'#FFBC09'}/>
              <span>产值:{money}</span>
            </span>
            ||
            undefined
          } */}
          <span>
              <Badge color={ '#FFBC09' }/>
              <span>产值:</span>
            </span>
          <Tooltip title={ money ?? 0 }>
            <span>{ money ?? 0 }</span>
          </Tooltip>
        </aside>
      );
    }
    vDom.push(
      <div onClick={ () => {
        //window.open(`${window.config.portalHost}/progressLog?scheduledate=${date.format('YYYY-MM-DD')}&&contractnum=${contractnum}`);
        if ( hideTotal ) {
          this.selectDate?.( date );
          return;
        }
        this.$router.push( {
          name: 'progressLog',
          query: {
            scheduledate: date.format( 'YYYY-MM-DD' ),
            projectName: projectName
          }
        } )
      } } class={ `${ Class.dailyContent } ${ duringMonth && Class.duringMonth }` }>
        { duringMonth && content }
      </div>
    )
    return vDom;
  }

  calendarPanelChange( date: Moment , isDatePick?: any): void {
    console.log( 'calendarPanelChange', moment( date ).format( 'YYYY-MM-DD' ) );
    this.calendarDataMap = false;
    //this.toDay = date.clone();
    this.currentDate = date.clone();
    this.workMonth = date.clone().format( 'YYYY-MM' );
    this.endOfMonth = date.clone().endOf( 'month' );
    if(isDatePick == 1) return 
    this.startOfMonth = date.clone().startOf( 'month' );
  }

  generateCalendarMap( startDate: Moment ): Map<string, ProgressPlanList> {
    const
      calcStartDate: Moment = moment( startDate ),
      calendarMap: Map<string, ProgressPlanList | {}> = new Map();
    let index: number = 0;
    while ( index < 42 ) {
      calendarMap.set( calcStartDate.format( 'YYYY-MM-DD' ), { totalMoney: 0 } );
      calcStartDate.add( 1, 'day' );
      index++;
    }
    return calendarMap as Map<string, ProgressPlanList>;
  }

  @Watch( 'startOfMonth' )
  setDaily(): void {
    const { startOfMonth, endOfMonth, generateCalendarMap, projectConfig } = this, {
      contractnum,
      projectName
    } = Utils.GetRequest();
    
    if ( !startOfMonth ) return;
    const calendarMap = generateCalendarMap( startOfMonth );
    this.calendarPanelChange(startOfMonth,1)
    //getListPlanAmount getProgressPlanCalender
    getListPlanAmount( {
      workMonth: this.workMonth as string,
      startDate: startOfMonth?.format( 'YYYY-MM-DD' ) ?? '',
      endDate: endOfMonth?.format( 'YYYY-MM-DD' ) ?? '',
      /*contractnum: contractnum,*/
      // projectName:decodeURIComponent(projectName),
      projectName: projectConfig?.projectName as string,
      projectCode: this.projectCode as string
    } ).then( ( res ) => {
      if ( res.errcode !== 0 ) return;
      const { list, totalMoney, monthMoney, yearMoney } = res.data as ProgressPlanOverviewRes;
      list.forEach( ( item ) => {
        calendarMap.set( item.scheduleDate, item )
      } );
      this.totalMoney = totalMoney;
      this.monthMoney = monthMoney;
      this.yearMoney = yearMoney;
      this.calendarDataMap = calendarMap;
      // this.contractnum = contractnum;
    } );
  }

  mounted() {
    moment.locale( 'zh-cn', {
      // weekdaysMin: [ "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六" ]
      weekdaysMin: [ "日", "一", "二", "三", "四", "五", "六" ]
    } );
    this.startOfMonth = moment( new Date() ).startOf( 'month' );
    this.endOfMonth = moment( new Date() ).endOf( 'month' );
    this.workMonth = moment( new Date() ).format( 'YYYY-MM' );
  }

  beforeDestroy() {
    moment.locale( 'zh-cn', {
      weekdaysMin: [ "日", "一", "二", "三", "四", "五", "六" ]
    } );
  }

  render() {
    const {
      renderContent,
      calendarPanelChange,
      totalMoney,
      yearMoney,
      monthMoney,
      headerRender,
      toDay,
      hideTotal
    } = this;
    return (
      <article class={ Class.main }>
        <a-calendar
          // value={toDay}
          value={ this.currentDate }
          onPanelChange={ calendarPanelChange }
          headerRender={ headerRender }
          class={ Class.calendar }
          dateFullCellRender={
            ( date: Moment ) =>
              <Daily
                className={ `${ Class.daily } ${ date.format( 'YYYY-MM-DD' ) === moment( toDay ).format( 'YYYY-MM-DD' ) && Class.today }` }
                date={ date }
                active={ date.format( 'YYYY-MM-DD' ) === moment( toDay ).format( 'YYYY-MM-DD' ) }
                customContent={ renderContent( date, date.format( 'YYYY-MM-DD' ) === moment( toDay ).format( 'YYYY-MM-DD' ) ) }
              />
          }
        />
         {
          // !hideTotal &&
          <div class={ Class.moneyPanel }>
            <aside>开累产值:{ (totalMoney as number / 10000)?.toFixed(2) }万元</aside>
            <aside>本年产值:{ (yearMoney as number / 10000)?.toFixed(2)}万元</aside>
            <aside>本月产值:{ (monthMoney as number / 10000)?.toFixed(2)}万元</aside>
          </div>
        }
      </article>
    );
  }

  /*private headerRender({ value, type, onChange, onTypeChange }) {
    const { toDay } = this;
    return (
      <nav class={Class.calendarHeader}>
        <div onClick={e => onChange(toDay.subtract(1, 'month'))} class={Class.prevMonth}/>
        <span role={'calendarHeaderSpan'}
              class={Class.calendarHeaderSpan}>{toDay.format('YYYY 年 MM 月')}</span>
        <div onClick={e => onChange(toDay.add(1, 'month'))} class={Class.nextMonth}/>
      </nav>
    )
  }*/
  private headerRender( { value, type, onChange, onTypeChange } ) {
    const { currentDate } = this;
    return (
      <nav class={ Class.calendarHeader }>
        <div onClick={ e => onChange( currentDate.subtract( 1, 'month' ) ) }
             class={ Class.prevMonth }/>
        <span role={ 'calendarHeaderSpan' }
              class={ Class.calendarHeaderSpan }>{ currentDate.format( 'YYYY 年 MM 月' ) }</span>
        <div onClick={ e => onChange( currentDate.add( 1, 'month' ) ) } class={ Class.nextMonth }/>
      </nav>
    )
  }
}
