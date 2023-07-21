/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import { Vue, Prop, Component, InjectReactive, Ref } from 'vue-property-decorator';
import Class from './qualityModule.module.less';
import { ZhCNEx } from "../../locales/zh-CN-ex";
import * as Type from '../../type';
import * as Api from '../../service/api';
import { Utils } from '@ctesi/core';
import { Icon, SyncVisualTable, Charts } from '@ctesi/component';

import QualityPreview from "./QualityPreview";

import type { EChartOption, ECharts } from 'echarts';

import DatePicker from 'ant-design-vue/lib/date-picker';
import 'ant-design-vue/lib/date-picker/style/index.css';

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';

import moment, { Moment } from 'moment';
import {Table as VXETable} from "vxe-table/types/table";

interface OverView {
  acceptanceOfToday: number;
  acceptanceNumber: number;
  acceptanceTotal: number;
  acceptanceReady: number;
  numberOfPending: number;
}

interface QINumberTotal {
  chartConfig: EChartOption | null;
  startDate: Moment | string;
  endDate: Moment | string;
}

interface QIStatusTotal {
  chartConfig: EChartOption | null;
  centerData: Array<{ value: number, name: string }>;
}

interface QIWork<T> {
  loading: boolean;
  dataSources: Array<T>;
  conditions: string | null;
}

@Component( {
  name: 'QualityInspection'
} )
export default class QualityInspection extends Vue {

  @InjectReactive( 'project' )
  public projectCode!: string;

  @InjectReactive( 'projectConfig' )
  public projectConfig!: Type.ProjectConfig;

  @InjectReactive( 'locale' )
  public locale!: typeof ZhCNEx;

  @Ref()
  public ProgressTree!: SyncVisualTable<any>;

  public static QualityPreview: QualityPreview;

  private overView: OverView = {
    acceptanceNumber: 0,
    acceptanceOfToday: 0,
    acceptanceReady: 0,
    acceptanceTotal: 0,
    numberOfPending: 0
  }

  private qiNumberTotal: QINumberTotal = {
    chartConfig: null,
    //startDate: moment( new Date() ),
    startDate: moment( new Date( new Date().setDate( new Date().getDate() - 7 ) ) ),
    //endDate: moment( new Date( new Date().setDate( new Date().getDate() + 7 ) ) )
    endDate: moment( new Date() )
  }

  private qiStatusTotal: QIStatusTotal = {
    chartConfig: null,
    centerData: [],
  }

  private qiWork: QIWork<Type.AnalyseQuality> = {
    conditions: null,
    dataSources: [],
    loading: false
  }

  private colorMap: Map<number, { front: string, backend: string }> = new Map( [
    [ 0, { front: "#e6e6e6", backend: "#e6e6e6" } ],
    [ 0.00001, { front: "#f0c148", backend: "#e6e6e6" } ],
    [ 1, { front: "#00c567", backend: "#e6e6e6" } ]
  ] )

  private renderPTNav() {
    const { qiWork, locale } = this;
    return [
      <Input.Search
        class={ `${ Class.searchInput } ${ Class.qiWorkSearch }` }
        placeholder={ locale?.Engineering.searchPlaceHolder }
        loading={ qiWork.loading }
        value={ qiWork.conditions }
        onChange={ e => this.qiWork.conditions = e.target.value }
        enterButton
        onSearch={ e => this.getQIWorkTree() }
      />
    ]
  }

  private getQIWorkProgressColumns( locale?: typeof ZhCNEx ): Array<Type.TableColumn<Type.AnalyseQuality>> {
    if ( !locale ) return [];
    return [
      {
        title: locale.Engineering.Parts,
        align: 'left',
        treeNode: true,
        dataIndex: 'qbsName',
        ellipsis: true,
        key: 'header_0',
        //width: 350
      },
      {
        title: locale.Engineering.FormTotal,
        align: 'center',
        dataIndex: 'totalNum',
        ellipsis: true,
        key: 'header_1',
        width: 120
      },
      {
        title: locale.Engineering.FormUndo,
        align: 'center',
        dataIndex: 'undoNum',
        ellipsis: true,
        key: 'header_2',
        width: 120
      },
      {
        title: locale.Engineering.FormDoing,
        align: 'center',
        dataIndex: 'doingNum',
        ellipsis: true,
        key: 'header_3',
        width: 120
      },
      {
        title: locale.Engineering.FormDone,
        align: 'center',
        dataIndex: 'doneNum',
        ellipsis: true,
        key: 'header_4',
        width: 120
      },
      {
        title: locale.Engineering.ProgressDone,
        align: 'center',
        dataIndex: '',
        key: 'header_5',
        width: 250,
        customRender: ( t, r ) => this.renderProgressBar( r )
      }
    ]
  }

  private static stopExpendCondition( item: Type.AnalyseQuality ) {
    return !item.leaf && !item.childs.length;
  }

  private loadQINodes( { row }: { row: Type.AnalyseQuality } ) {
    const { id } = row, { projectConfig, projectCode, qiWork } = this;
    if ( !id ) return;
    return new Promise( resolve => {
      Api.getAnalyseNode( {
        appCode: projectCode,
        name: qiWork.conditions as string,
        projectName: projectConfig.projectName as string,
        qbsId: id
      } ).then( res => {
        qiWork.loading = false;
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        if ( res.data ) resolve( Utils.treeStructureAdapter( res.data, 'childs' ) )
      } )
    } )
  }

  private getQIWorkTree( nodeId?: string ) {
    const { qiWork, projectCode, projectConfig } = this;
    if ( qiWork.loading ) return;
    this.qiWork.loading = true;
    Api.getAnalyseNode( {
      appCode: projectCode,
      projectName: projectConfig.projectName as string,
      name: qiWork.conditions as string,
      qbsId: nodeId
    } ).then( res => {
      this.qiWork.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.qiWork.dataSources = Utils.treeStructureAdapter<Type.AnalyseQuality>( res.data, 'childs' ) as Array<Type.AnalyseQuality>;
        // this.ProgressTree.setAllTreeExpanded();
        // this.$nextTick().then( () => {
        //   Utils.deepFind(this.qiWork.dataSources, item => {
        //     item._X_EXPAND = !(!item.leaf && !item.childs.length);
        //     return false;
        //   }, 'childs' );
        // } );
      }
    } )
  }

  private pieDataAdapter( data: Type.AnalyseLineData ) {
    const { locale } = this;
    if ( !data ) return [];
    const { undoCount, doingCount, doneCount } = data;
    return [
      { value: undoCount, name: locale.Engineering.undo },
      { value: doingCount, name: locale.Engineering.doing },
      { value: doneCount, name: locale.Engineering.done }
    ]
  }

  private getLineCharts( nodeId?: string ) {
    const { projectConfig, projectCode, qiNumberTotal, qiStatusTotal, locale } = this;
    Api.getAnalyseLineCharts( {
      appCode: projectCode,
      startTime: moment( qiNumberTotal.startDate ).format( 'YYYY-MM-DD' ),
      endTime: moment( qiNumberTotal.endDate ).format( 'YYYY-MM-DD' ),
      nodeId: nodeId,
      projectName: projectConfig.projectName as string,
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        const total = res.data.undoCount + res.data.doingCount + res.data.doneCount;
        qiStatusTotal.centerData = [ {
          value: 0,
          name: `${ total }`
        } ];
        qiNumberTotal.chartConfig = this.getLineConfig( res.data.timeCount.map( item => {
          return [ item.time, item.num ]
        } ), locale );
        qiStatusTotal.chartConfig = this.getPieConfig( this.pieDataAdapter( res.data ), locale )
      }
    } )
  }

  private getProjectOverView() {
    const { projectConfig, projectCode, overView } = this;
    Api.getAnalyseProject( {
      appCode: projectCode,
      projectName: projectConfig.projectName as string
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        overView.acceptanceReady = res.data.undoCount;
        overView.numberOfPending = res.data.doingCount;
        overView.acceptanceNumber = res.data.doneCount;
        overView.acceptanceOfToday = res.data.dayCount;
        overView.acceptanceTotal = res.data.totalCount;
      }
    } )
  }

  private renderProgressBar( row: Type.AnalyseQuality ): JSX.Element {
    const { colorMap } = this;
    const percent: number = Number( ((row.doingRatio + row.doneRatio) * 100).toFixed( 2 ) );
    let percentRole: { front: string; backend: string } = { front: "#FFF", backend: "#FFF" };
    Array.from( colorMap )?.forEach( ( item, index ) => {
      if ( (row.doingRatio + row.doneRatio) >= item[0] ) percentRole = item[1];
    } );
    return (
      <span class={ Class.progressBarCell } style={ { backgroundColor: percentRole.backend } }>
        <div class={ percent < 5 && Class.minPercent }
             style={ { width: `${ percent }%`, backgroundColor: percentRole.front } }>
          <span>{ percent }%</span>
        </div>
      </span>
    )

  }

  private dataRangeChange( dates: [ Moment, Moment ] | [ string, string ], dateStrings: [ string, string ] ) {
    const { qiNumberTotal, ProgressTree } = this;
    qiNumberTotal.startDate = dates[0];
    qiNumberTotal.endDate = dates[1];
    this.getLineCharts( ProgressTree.getCurrentRow()?.id );
  }

  private getLineConfig<T>( dataSources: Array<T>, locale?: typeof ZhCNEx ) {
    return Charts.getLineConfig( {
      area: true,
      data: dataSources,
      day: false,
      borderColor: '#1E88E5',
      backgroundColor: '#1E88E5',
      extraCssText: 'border-radius: 11px !important;padding:0 !important;',
      tooltipFormat: arg => `<div class="${ Class.tootTip }"><div data-role="badge"></div><span>${ arg[0].value[1] }</span></div>`,
      detailConfig: {
        xLinexColor: '#E6E6E6',
        xLabelColor: '#999999',
        yLinexColor: '#E6E6E6',
        yLabelColor: '#999999',
        dataTitle: '',
        nameTextColor: '#666666',
        unit: locale?.Engineering.Number,
        yAxisFormat:(value,index) => {
          return Math.floor(value) === value ? `${value}`: ''
        }
      }
    } )
  }

  private getPieConfig<T>( dataSources: Array<T>, locale?: typeof ZhCNEx ) {
    const { qiStatusTotal } = this;
    if ( !locale ) return null;
    return Charts.getPieConfig( {
      labelFormat: arg => `${ arg.value }个`,
      textStyle: {
        color: '#3e3e3e'
      },
      legendList: [ locale?.Engineering.done, locale?.Engineering.doing, locale?.Engineering.undo ],
      pieCenterData: qiStatusTotal.centerData,
      data: dataSources
    } );
  }

  private selectQBSNode( { row }: { row: Type.AnalyseQuality } ) {
    this.getLineCharts( row.id );
    this.getProjectOverView();
  }

  private cancelQBSNode() {
    this.ProgressTree.clearCurrentRow();
    this.getLineCharts();
  }

  public mounted() {
    const { qiNumberTotal, qiStatusTotal, locale } = this;
    this.getProjectOverView();
    this.getLineCharts();
    this.getQIWorkTree();
    //qiNumberTotal.chartConfig = this.getLineConfig( [], locale );
    //qiStatusTotal.chartConfig = this.getPieConfig( [], locale );
  }

  public render() {
    const { locale, overView, qiNumberTotal, qiStatusTotal, qiWork } = this;
    return (
      <article class={ Class.main }>
        <nav class={ Class.nav }>
          <Icon src={ 'goBack' } class={ Class.goBack } clickEvent={ () => this.$router.go( -1 ) }/>
          <span>{ locale.Engineering.QualityInspection }</span>
        </nav>
        <aside class={ Class.InspectionOverview }>
          <div>{ locale.Engineering.AcceptanceOfToday }：
            <span>{ overView.acceptanceOfToday }</span>
          </div>
          <div>{ locale.Engineering.AcceptanceNumber }：
            <span>{ overView.acceptanceNumber }</span>
          </div>
          <div>{ locale.Engineering.AcceptanceTotal }：
            <span>{ overView.acceptanceTotal }</span>
          </div>
          <div>{ locale.Engineering.AcceptanceReady }：
            <span>{ overView.acceptanceReady }</span>
          </div>
          <div>{ locale.Engineering.NumberOfPending }：
            <span>{ overView.numberOfPending }</span>
          </div>
        </aside>
        <main class={ `${ Class.mainContainer } ${ Class.chartsCard }` }>
          <section class={ Class.container }>
            <nav>
              <span>{ locale.Engineering.QINumberStatistical }</span>
              <div class={ Class.dateRange }>
                <span>{ locale.Engineering.DateRange }：</span>
                <DatePicker.RangePicker
                  value={ [ qiNumberTotal.startDate, qiNumberTotal.endDate ] }
                  onChange={ this.dataRangeChange } allowClear={ false }
                  inputReadOnly={ true }
                />
              </div>
            </nav>
            <Charts wrapperClass={ Class.chartsContainer }
                    config={ qiNumberTotal.chartConfig as EChartOption }/>
          </section>
          <section class={ Class.container }>
            <nav>
              <span>{ locale.Engineering.QIStatusStatistical }</span>
            </nav>
            <Charts wrapperClass={ Class.chartsContainer }
                    config={ qiStatusTotal.chartConfig as EChartOption }/>
          </section>
        </main>
        <SyncVisualTable
          ref={ 'ProgressTree' }
          config={ {
            wrapperClass: Class.progressTree,
            expendAllNode: true,
            stopExpendCondition: QualityInspection.stopExpendCondition,
            locale: {
              title: locale.Engineering.QIWorkStatistical
            },
            loading: qiWork.loading,
            navNodes: this.renderPTNav(),
            articleNavNodes: [],
            mainTableConfig: {
              size: 'mini',
              align: 'center',
              stripe: false,
              border: true,
              resizable: true,
              showOverflow: true,
              highlightCurrentRow: true,
              autoResize: true,
              rowKey: true,
              rowId: 'id',
              currentChange: this.selectQBSNode,
              cellDBClick: this.cancelQBSNode
            },
            columns: this.getQIWorkProgressColumns( locale ),
            dataSource: qiWork.dataSources,
            lazy: true,
            treeChildField: 'childs',
            hasChildField: 'hasChild',
            loadMethod: this.loadQINodes
          } }
        />
        {/*<main class={ Class.mainContainer }>

        </main>*/ }
      </article>
    );
  }
}
