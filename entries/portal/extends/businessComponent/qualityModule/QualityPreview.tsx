import { Component, Vue, Prop, InjectReactive, Ref } from "vue-property-decorator";
import Class from './qualityModule.module.less';
import * as Type from "../../type";
import * as Api from '../../service/api';
import { ZhCNEx } from "../../locales/zh-CN-ex";
import { Utils } from '@ctesi/core';
import { Icon, Charts } from "@ctesi/component";
import { Table } from 'vxe-table';

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';

import DatePicker from 'ant-design-vue/lib/date-picker';
import 'ant-design-vue/lib/date-picker/style/index.css';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import moment, { Moment } from "moment";
import type { EChartOption } from "echarts";

interface EngineeringParts<T> {
  current: T | null;
  loading: boolean;
  conditions: string | null;
  dataSources: Array<T>;
  maxHeight: number;
  status: number | null
}

interface QIDoneTotal {
  chartConfig: EChartOption | null;
  startDate: Moment | string;
  endDate: Moment | string;
}

interface QIDoneFillTotal {
  chartConfig: EChartOption | null;
  centerData: Array<{ value: number, name: string }>;
}

interface HeightConfig {
  tree: number;
  line: number;
  pie: number;
}
// eslint-disable-next-line no-shadow
enum ProgressStatus {
  undo = 0,
  doing,
  done
}

@Component( {
  name: 'QualityPreview'
} )
export default class QualityPreview extends Vue {

  @InjectReactive( 'project' )
  public projectCode!: string;

  @InjectReactive( 'projectConfig' )
  public projectConfig!: Type.ProjectConfig;

  @InjectReactive( 'locale' )
  public locale!: typeof ZhCNEx;

  @Prop()
  public modelHight?: Function;

  @Ref()
  public Container!: HTMLElement;

  @Ref()
  public TreeContainer!: HTMLElement;

  @Ref()
  public PartsTree!: Table;

  private heightConfig: HeightConfig = {
    line: 0, pie: 0, tree: 0
  }

  private panelStatus: boolean = false;

  private engineeringParts: EngineeringParts<any> = {
    current: null,
    conditions: null,
    dataSources: [],
    loading: false,
    maxHeight: 0,
    status: null
  }

  private qiDoneTotal: QIDoneTotal = {
    chartConfig: null,
    startDate: moment( new Date( new Date().setDate( new Date().getDate() - 7 ) ) ),
    endDate: moment( new Date() )
  }

  private qiDoneFillTotal: QIDoneFillTotal = {
    chartConfig: null,
    centerData: [],
  }

  private expand: boolean = true;
  private handData:Type.AnalyseLineData|null = null;
  private num:number = 1;
  getFilterTip(locale: typeof ZhCNEx,status: ProgressStatus | null) {
    if (!locale) return [];
    return (
      <div class={Class.filterTip}>
         <span
           role={status === null && 'filterActive' || undefined}
           onClick={e => {this.setFilterStatus(null)}}>{locale.Progress.All}</span>
        <span
          role={status === ProgressStatus.undo && 'filterActive' || undefined}
          onClick={e => {this.setFilterStatus(ProgressStatus.undo)}}>{locale.Engineering.undo}</span>
        <span
          role={status === ProgressStatus.doing && 'filterActive' || undefined}
          onClick={e => {this.setFilterStatus(ProgressStatus.doing)}}>{locale.Progress.OnGoing}</span>
        <span
          role={status === ProgressStatus.done && 'filterActive' || undefined}
          onClick={e => {this.setFilterStatus(ProgressStatus.done)}}>{locale.Engineering.done}</span>
      </div>
    )
  }
  getClickPiePart(data) {
    let selectedBimData:any;
    if(data && data.name) {
      switch (data.name) {
        case '未填报':
          selectedBimData = this.handData?.['undoNodes']
         break;
        case '审核中':
          selectedBimData = this.handData?.['doingNodes']
         break;
        case '已归档':
          selectedBimData = this.handData?.['doneNodes']
         break;
      }
    }
    console.log(data,'pie',this.handData,'handData',selectedBimData,'selectedBimData')
    if(selectedBimData)this.$emit('modelHight',selectedBimData)
  }

  render() {
    const {
      locale,
      panelStatus,
      engineeringParts,
      qiDoneTotal,
      qiDoneFillTotal,
      heightConfig
    } = this;
    return (
      <article ref={ 'Container' } class={ `${Class.previewContainer } ${ this.expand ? Class.expand : Class.narrow }`}>
        <nav>
          {/*<Icon src={ panelStatus && 'close' || 'append' }/>*/}
          <Icon src={'goBack'} clickEvent={()=> this.expand=!this.expand}  class={`${Class.panelExpand} ${this.expand?Class.hideCursor:Class.showCursor}`}/>
        </nav>
        <section class={ Class.previewDetail }>
          <div ref={ 'TreeContainer' } class={ Class.previewTreeContainer }>
            <nav class={ Class.containerNav }>
              <span>{ locale.Engineering.Parts }</span>
              <div class={Class.op}>
                <Input.Search
                  class={ Class.partsSearch }
                  placeholder={ locale.Engineering.searchPlaceHolder }
                  loading={ engineeringParts.loading }
                  v-model={ engineeringParts.conditions }
                  enterButton
                  onSearch={ this.getPartsTree }
                />
                <Tooltip placement={'right'} overlayClassName={Class.filterContainer}
                         title={this.getFilterTip(locale as typeof ZhCNEx,engineeringParts.status)}>
                  <div class={Class.icon}>
                    <Icon src={'filter'}/>
                  </div>
                </Tooltip>
              </div>
            </nav>
            <vxe-virtual-tree
              ref={ 'PartsTree' }
              size={ 'mini' }
              resizable={ true }
              showOverflow={ true }
              rowKey={ true }
              rowId={ 'id' }
              loading={ engineeringParts.loading }
              highlightCurrentRow={ true }
              // height={ engineeringParts.maxHeight }
              height={ heightConfig.tree }
              data={ engineeringParts.dataSources }
              columns={ Utils.generateXTableColumns( this.getEngineeringColumn( locale ) ) }
              treeConfig={ {
                lazy: true,
                children: 'childs',
                hasChild: 'hasChild',
                loadMethod: this.loadPartsTree
              } }
              { ...{
                on: {
                  'current-change': this.partsChange
                }
              } }
            />
          </div>
          <div class={ Class.previewTotalContainer }>
            <nav class={ `${ Class.containerNav } ${ Class.lineChartsNav }` }>
              <span>{ locale.Engineering.QIDoneNumberStatistical }</span>
              <div class={ Class.datePickerPanel }>
                <span>{ locale.Engineering.DateRange }：</span>
                <DatePicker.RangePicker
                  value={ [ qiDoneTotal.startDate, qiDoneTotal.endDate ] }
                  onChange={ this.dateRangeChange }
                  allowClear={ false }
                  inputReadOnly={ true }
                />
              </div>
            </nav>
            <Charts
              style={ { height: `${ heightConfig.line }px` } }
              wrapperClass={ Class.chartsContainer }
              config={ qiDoneTotal.chartConfig as EChartOption }
            />
          </div>
          <div class={ Class.previewFillContainer }>
            <nav class={ Class.containerNav }>
              <span>{ locale.Engineering.QIDoneNumberStatistical }</span>
            </nav>
            <Charts
              style={ { height: `${ heightConfig.line }px` } }
              wrapperClass={ Class.chartsContainer }
              config={ qiDoneFillTotal.chartConfig as EChartOption }
              on-clickPart={(d)=>this.getClickPiePart(d)}
              key={this.num}
            />
          </div>
        </section>
      </article>
    );
  }

  private partsChange( { row } ) {
    const { modelHight, projectCode, projectConfig } = this;
    //console.log( 'row===>', row );
    this.engineeringParts.current = row;
    Api.getHighLightModel( {
      appCode: projectCode as string,
      nodeId: row.id,
      projectName: projectConfig.projectName as string
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        console.log( res.data );
        modelHight?.( res.data );
        this.getLineCharts( row.id );
      }
    } );
  }
  setFilterStatus(status:null | number) {
    this.engineeringParts.status = status;
    this.getPartsTree();
  }
  private getPartsTree() {
    this.getQIWorkTree();
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
    const { qiDoneFillTotal } = this;
    if ( !locale ) return null;
    return Charts.getPieConfig( {
      labelFormat: arg => `${ arg.value }个`,
      legendList: [ locale?.Engineering.done, locale?.Engineering.doing, locale?.Engineering.undo ],
      pieCenterData: qiDoneFillTotal.centerData,
      data: dataSources,
      centerLabelColor: '#FFFFFF',
      labelColor: '#FFFFFF',
      lineColor: '#FFFFFF',
      orient: 'vertical',
      legendX: 'right',
      legendY: 'center',
      legendTop: '30%',
      legendAlign: 'left',
      pieTop: -400,
      textStyle: {
        color: '#FFFFFF'
      }
    } );
  }

  private getLineCharts( nodeId?: string ) {
    const { projectConfig, projectCode, qiDoneTotal, qiDoneFillTotal, locale } = this;
    this.handData = null;
    Api.getAnalyseLineCharts( {
      appCode: projectCode,
      startTime: moment( qiDoneTotal.startDate ).format( 'YYYY-MM-DD' ),
      endTime: moment( qiDoneTotal.endDate ).format( 'YYYY-MM-DD' ),
      nodeId: nodeId,
      projectName: projectConfig.projectName as string,
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.handData = res.data;
        const total = res.data.undoCount + res.data.doingCount + res.data.doneCount;
        qiDoneFillTotal.centerData = [ {
          value: 0,
          name: `${ total }`
        } ];
        qiDoneTotal.chartConfig = this.getLineConfig( res.data.timeCount.map( item => {
          return [ item.time, item.num ]
        } ), locale );
        qiDoneFillTotal.chartConfig = this.getPieConfig( this.pieDataAdapter( res.data ), locale );
        this.num++;
      }
    } )
  }

  private loadPartsTree( { row } ) {
    const { id } = row, { projectCode, engineeringParts, projectConfig } = this;
    if ( !id ) return;
    return new Promise( resolve => {
      Api.getAnalyseNode( {
        appCode: projectCode,
        projectName: projectConfig.projectName as string,
        name: engineeringParts.conditions as string,
        qbsId: id,
        status: engineeringParts.status??undefined
      } ).then( res => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        if ( res.data ) resolve( Utils.treeStructureAdapter<Type.AnalyseQuality>( res.data, 'childs' ) as Array<Type.AnalyseQuality> )
      } )
    } )
  }

  private dateRangeChange( dates: [ Moment, Moment ] | [ string, string ], dateStrings: [ string, string ] ) {
    const { qiDoneTotal, engineeringParts } = this;
    qiDoneTotal.startDate = dates[0];
    qiDoneTotal.endDate = dates[1];
    this.getLineCharts( engineeringParts.current?.id ?? undefined );
  }

  private renderProgressCell( row: Type.AnalyseQuality ) {
    /*return <span>{ ((row.doingRatio + row.doneRatio) * 100).toFixed( 2 ) }%</span>*/
    return <span>{ `${ row.doingNum }/${ row.totalNum }` }</span>
  }

  private getEngineeringColumn( locale: typeof ZhCNEx ): Array<Type.TableColumn<Type.AnalyseQuality>> {
    return [
      {
        title: locale.Engineering.name,
        dataIndex: 'qbsName',
        treeNode: true,
        ellipsis: true,
        key: 'header_0',
        width: 250
      },
      {
        title: locale.Engineering.FormTotal,
        align: 'center',
        dataIndex: 'totalNum',
        ellipsis: true,
        key: 'header_1',
        width: 100
      },
      {
        title: locale.Engineering.FormDone,
        align: 'center',
        dataIndex: 'doneNum',
        ellipsis: true,
        key: 'header_4',
        width: 50
      },
      {
        title: locale.Engineering.status,
        key: 'status',
        align: 'center',
        //width: '23%',
        customRender: (t,row)=> {
          return [<span class={row.status===2?Class.done:row.status===1?Class.doing:row.status===0?Class.undo:''}>{ '(' + Number(row.doingNum + row.doneNum) + '/' + row.totalNum + ')' }</span>]
        }
      },
      // {
      //   title: locale.Engineering.ProgressDone,
      //   align: 'center',
      //   dataIndex: '',
      //   key: 'header_5',
      //   /*width: 50,*/
      //   customRender: ( t, r ) => this.renderProgressCell( r )
      // }
    ]
  }

  private calcContainerHeight() {
    const { Container, TreeContainer } = this;
    const [ ContainerCHeight, TreeContainerCHeight ] = [ Container.getClientRects()[0].height, TreeContainer.getClientRects()[0].height ];
    this.heightConfig.tree = ContainerCHeight - 50 - 84;
    this.heightConfig.line = ContainerCHeight - 50 - 52;
  }

  public mounted() {
    const { calcContainerHeight } = this;
    calcContainerHeight();
    window.addEventListener( 'resize', calcContainerHeight );
    this.getLineCharts();
    this.getQIWorkTree();
  }

  public destroyed() {
    const { calcContainerHeight } = this;
    window.removeEventListener( 'resize', calcContainerHeight );
  }

  private getQIWorkTree( nodeId?: string ) {
    const { engineeringParts, projectCode, projectConfig } = this;
    if ( engineeringParts.loading ) return;
    this.engineeringParts.loading = true;
    Api.getAnalyseNode( {
      appCode: projectCode,
      projectName: projectConfig.projectName as string,
      name: engineeringParts.conditions as string,
      qbsId: nodeId,
      status: engineeringParts.status??undefined
    } ).then( res => {
      this.engineeringParts.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.engineeringParts.dataSources = Utils.treeStructureAdapter<Type.AnalyseQuality>( res.data, 'childs' ) as Array<Type.AnalyseQuality>;
        this.$nextTick().then( () => {
          this.PartsTree?.setAllTreeExpand( true );
          this.$nextTick().then( () => {
            Utils.deepFind( this.engineeringParts.dataSources, item => {
              item._X_EXPAND = !(!item.leaf && !item.childs.length);
              return false;
              // if ( !item.leaf && !item.childs ) {
              //   item._X_EXPAND = false;
              // } else {
              //   item._X_EXPAND = true;
              // }
              // return false;
            }, 'childs' );
          } );
        } )
      }
    } )
  }
}
