import { Vue, Prop, Component, InjectReactive, Ref, Watch } from 'vue-property-decorator';
import Class from './ProgressFillRecordV2.module.less';
import { Icon } from "@ctesi/component";
import * as tsx from 'vue-tsx-support';
import * as Api from '../../service/api';
import * as Type from '../../type';
import Utils from "../../utils";
import { ZhCNEx } from "../../locales/zh-CN-ex";
import moment, { Moment } from 'moment';
import { Table } from 'vxe-table';

import DatePicker from "ant-design-vue/lib/date-picker";
import 'ant-design-vue/lib/date-picker/style/index.css';

import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';

import Pagination from 'ant-design-vue/lib/pagination';
import 'ant-design-vue/lib/pagination/style/index.css';

import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';

import Progress from 'ant-design-vue/lib/progress';
import 'ant-design-vue/lib/progress/style/index.css';


interface ProgressLogList<T> {
  queryStartDate: string;
  queryEndDate: string;
  pageNum: number;
  pageSize: number;
  total: number;
  source: Array<T>;
  loading: boolean;
  maxHeight: number;
  checkIds: Array<string>;
}

@Component( {
  name: 'ProgressFillRecordV2'
} )
export default class ProgressFillRecordV2 extends Vue {

  _tsx!: tsx.DeclareProps<Pick<ProgressFillRecordV2, 'className' | 'selectRowFn' | 'startDateChange' | 'receiveDate' | 'getLogListCb'>>

  @InjectReactive( 'locale' )
  private locale?: typeof ZhCNEx;

  @InjectReactive( 'projectConfig' )
  private projectConfig?: Type.ProjectConfig;

  @InjectReactive( 'project' )
  private projectCode?: string;

  @Prop()
  public className?: string;

  @Prop()
  public selectRowFn?: Function;

  @Prop()
  public startDateChange?: Function;

  @Prop()
  public getLogListCb?: Function;

  @Prop()
  public receiveDate?: Moment | null;

  @Ref()
  private MainContainer?: HTMLElement;

  @Ref()
  private MainTable?: Table;

  @Ref() FileInput?: HTMLElement;
  private progressLogList: ProgressLogList<Type.ProgressLogV2> = {
    queryEndDate: moment( new Date() ).format( 'YYYY-MM-DD' ),
    queryStartDate: moment( new Date() ).format( 'YYYY-MM-DD' ),
    pageNum: 1,
    pageSize: 10,
    total: 0,
    source: [],
    loading: false,
    maxHeight: 0,
    checkIds: []
  }
  private taskQueue: Array<string> = [];
  private isDownload: string = "正在导入中...";
  private isModalVisible: boolean = false;
  private percent: number = 0;

  @Watch( 'progressLogList.pageNum' )
  pageNumListener( val: number ) {
    this.getLogList();
  }

  @Watch( 'progressLogList.queryStartDate' )
  queryStartDateListener( dateString: Moment ) {
    this.getLogList();
    this.startDateChange?.( moment( dateString ).format( 'YYYY-MM-DD' ) );
  }

  @Watch( 'progressLogList.queryEndDate' )
  queryEndDateListener() {
    this.getLogList();
  }

  @Watch( 'receiveDate' )
  receiveDateListener( date: Moment ) {
    if ( !date ) return;
    this.progressLogList.queryStartDate = moment( date ).format( 'YYYY-MM-DD' );
    this.progressLogList.queryEndDate = moment( date ).format( 'YYYY-MM-DD' );
  }

  public initCheckIds() {
    this.progressLogList.checkIds = [];
    this.MainTable?.setCurrentRow( [] );
  }

  public getLogList() {
    const { progressLogList, projectCode, projectConfig } = this;
    if ( progressLogList.loading ) return;
    this.progressLogList.loading = true;
    Api.getLogQueryV2( {
      pageNum: progressLogList.pageNum,
      pageSize: progressLogList.pageSize,
      projectCode: projectCode as string,
      projectName: projectConfig?.projectName as string,
      queryEndDate: moment( progressLogList.queryEndDate ).format( 'YYYY-MM-DD' ),
      queryStartDate: moment( progressLogList.queryStartDate ).format( 'YYYY-MM-DD' )
    } ).then( ( res ) => {
      this.progressLogList.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        Utils.deepFind( res.data.records, item => {
          item.checked = false;
          return false;
        }, "null" )
        this.progressLogList.checkIds = [];
        this.progressLogList.source = res.data.records;
        this.progressLogList.total = res.data.total;
        this.getLogListCb?.();
      }
    } )
  }

  mounted() {
    const { calcContentHeight } = this;
    this.getDateParamsFromUrlQuery();
    this.calcContentHeight();
    this.getLogList();
    window.addEventListener( 'resize', calcContentHeight );
  }

  destroyed() {
    const { calcContentHeight } = this;
    window.removeEventListener( 'resize', calcContentHeight );
  }

  render() {
    const {
      locale,
      progressLogList,
      className,
      FileInput,
      isModalVisible,
      handleOk,
      handleCancel,
      percent,
      isDownload
    } = this;
    return (
      <article class={ `${ Class.main } ${ className }` } ref={ 'MainContainer' }>
        <input ref={ 'FileInput' } class={ Class.hide } type={ 'file' }
               onChange={ e => this.fileInput( e ) }/>
        {/*<nav class={Class.nav}>
          <Icon src={'goBack'} className={Class.goBack} clickEvent={e => this.$router.go(-1)}/>
          <span>{locale?.Progress.Log}</span>
        </nav>*/ }
        <main class={ Class.mainContainer }>
          <section class={ Class.container }>
            <nav>
              <span>{ locale?.Progress.LogSummary }</span>
            </nav>
            <article>
              <nav class={ Class.optNav }>
                <span>{ locale?.Progress.FillDate }：</span>
                <DatePicker
                  v-model={ progressLogList.queryStartDate }
                  format={ 'YYYY-MM-DD' }
                  allowClear={ false }
                  disabledDate={ this.rangeStartPicker }
                />
                <span class={ Class.division }>-</span>
                <DatePicker
                  v-model={ progressLogList.queryEndDate }
                  format={ 'YYYY-MM-DD' }
                  allowClear={ false }
                  disabledDate={ this.rangeEndPicker }
                />
             
                <Button onClick={ this.go2NewFillRecord } class={ Class.newFillRecord }>{ locale?.Progress.NewFillRecord }</Button>
                <Button onClick={ this.removeRecord }>{ locale?.Common.Action.remove }</Button>
                <Button onClick={ this.downloadTemplate }>模板下载</Button>
                <Button onClick={ this.importPlanData }>表格导入</Button>
                <Button onClick={ this.importExport }>表格导出</Button>
              </nav>
              <Modal footer={ [] } bodyStyle={ { textAlign: 'center' } } title="表格导入"
                     visible={ isModalVisible } onOk={ handleOk } onCancel={ handleCancel }>
                <Progress type="circle" percent={ percent }/>
                <p>{ isDownload }</p>
              </Modal>
              <vxe-virtual-tree
                size={ 'mini' }
                align={ 'center' }
                stripe
                border
                resizable
                showOverflow
                rowKey
                highlightCurrentRow
                autoResize
                ref={ 'MainTable' }
                rowId={ 'id' }
                loading={ progressLogList.loading }
                data={ progressLogList.source }
                columns={ Utils.generateXTableColumns( this.renderRecordListColumns( locale ) ) }
                height={ progressLogList.maxHeight }
                checkboxConfig={ {
                  checkField: 'checked',
                  halfField: 'indeterminate'
                } }
                { ...{
                  on: {
                    'current-change': this.selectLog,
                    'checkbox-change': this.checkLog,
                    'checkbox-all': this.checkAllLog
                  }
                } }
              />
              <Pagination
                class={ Class.pagination }
                current={ progressLogList.pageNum }
                total={ progressLogList.total }
                // showTotal={this.showTotal}
                onChange={ page => this.progressLogList.pageNum = page }
              />
            </article>
          </section>
        </main>
      </article>
    );
  }

  private hasTask( taskFunc: Function ): boolean {
    const taskName = Utils.getFnName( taskFunc.name );
    const flag = this.taskQueue.findIndex( item => item === taskName ) !== -1;
    if ( !flag ) {
      this.taskQueue.push( taskName );
      return false;
    } else {
      return true;
    }
  }

  private removeTask( taskFunc: Function ): void {
    const taskName = Utils.getFnName( taskFunc.name );
    if ( this.hasTask( taskFunc ) ) {
      const index = this.taskQueue.findIndex( item => item === taskName );
      this.taskQueue.splice( index, 1 );
    }
  }

  private rangeStartPicker( val: Moment ) {
    const { queryEndDate } = this.progressLogList;
    return moment( val ).valueOf() > moment( queryEndDate ).valueOf();
  }

  private rangeEndPicker( val: Moment ) {
    const { queryStartDate } = this.progressLogList;
    return moment( queryStartDate ).valueOf() >= moment( val ).valueOf();
  }

  private renderRecordListColumns( locale?: typeof ZhCNEx ): Array<Type.TableColumn<Type.ProgressLogV2>> {
    if ( !locale ) return [];
    return [
      {
        type: 'checkbox',
        width: 40,
      },
      {
        title: locale.Progress.FillDate,
        dataIndex: 'scheduleDate',
        key: 'header_0',
        width: 200,
      },
      {
        title: locale.Progress.Filler,
        dataIndex: 'ownerName',
        key: 'header_0',
        width: 200,
      },
      {
        title: locale.Progress.FillDepartment,
        dataIndex: 'ownerDeptName',
        key: 'header_0',
        width: 400,
      },
      {
        title: locale.Progress.FillAllProduction,
        dataIndex: 'journalMoney',
        key: 'header_0',
        width: 500,
        customRender: ( r ) =>
          <span>{ `${ (r as Type.ProgressLogV2).journalMoney } ${ locale.Progress.ProductionUnit }` }</span>
      }
    ]
  }

  private calcContentHeight() {
    const
      Container = this.MainContainer,
      Tree = this.MainTable;
    if ( !Container || !Tree ) return;
    const { x, y, width, height } = Container.getClientRects()[0];
    this.progressLogList.maxHeight = height - 45 - 42 - 44 - 100;
    console.log( 'contentHeight===>', this.progressLogList.maxHeight );
  }

  private getDateParamsFromUrlQuery() {
    const { scheduledate } = Utils.GetRequest();
    if ( !scheduledate ) return;
    this.progressLogList.queryStartDate = moment( scheduledate ).format( 'YYYY-MM-DD' );
    this.progressLogList.queryEndDate = moment( scheduledate ).format( 'YYYY-MM-DD' );
  }

  private selectLog( { row }: { row: Type.ProgressLogV2 } ) {
    const { selectRowFn } = this;
    console.log( 'selectLog===>', row );
    selectRowFn?.( row );
  }

  private checkLog( { records }: { records: Array<Type.ProgressLogV2> } ) {
    this.progressLogList.checkIds = records.map( item => item.id );
  }

  private checkAllLog( { records }: { records: Array<Type.ProgressLogV2> } ) {
    this.progressLogList.checkIds = records.map( item => item.id );
  }

  private go2NewFillRecord() {
    this.$router.push( {
      name: 'constructionFill'
    } );
  }

  private importPlanData() {
    this.FileInput?.click();
  }

  private handleOk() {
    if ( this.percent == 0 || this.percent == 100 ) {
      this.isModalVisible = false
    } else {
      this.$message.error( '导入数据过程中请不要关闭页面，避免导入错误' );
    }
  }

  private handleCancel() {
    if ( this.percent == 0 || this.percent == 100 ) {
      this.isModalVisible = false
    } else {
      this.$message.error( '导入数据过程中请不要关闭页面，避免导入错误' );
    }
  }

  private downloadTemplate() {
    Api.downloadBSDataTemplateV3().then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        const fileUrl = `${ window.config.apiHost }/api/aliyun/download?refId=${ res.data }`;
        window.open( fileUrl );
      }
    } )
  }

  private importExport() {
    const { projectConfig, progressLogList } = this;
    Api.downloadBSDataFileV3( {
      projectCode: this.projectCode as string,
      projectName: projectConfig?.projectName ?? "",
      queryEndDate: moment( progressLogList.queryEndDate ).format( 'YYYY-MM-DD' ),
      queryStartDate: moment( progressLogList.queryStartDate ).format( 'YYYY-MM-DD' )
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        const fileUrl = `${ window.config.apiHost }/api/aliyun/download?refId=${ res.data }`;
        window.open( fileUrl );
      }
    } )
  }

  private fileInput( e ) {
    const files = e.target.files, { projectCode, projectConfig } = this;
    if ( files && files[0] ) {
      const file = files[0];
      const fileFormat = file.name.slice( file.name.lastIndexOf( '.' ) + 1 ).toLowerCase();
      if ( [ 'xlsx', 'xls' ].indexOf( fileFormat ) === -1 ) {
        this.$message.error( '请上传Excel文件!' );
        return;
      }
      const formData = new FormData();
      formData.append( 'file', file );
      formData.append( 'projectCode', projectCode as string );
      formData.append( 'projectName', projectConfig?.projectName ?? "" );
      this.isDownload = "正在导入中..."
      this.isModalVisible = true
      this.percent = 0
      const timer = setInterval( () => {
        this.percent++
        if ( this.percent == 99 ) {
          clearInterval( timer )
        }
      }, 500 );
      Api.importReportBSData3( formData ).then( res => {
        if ( res.errcode !== 0 ) {
          this.$message.error( res.errmsg as string );
          this.isDownload = "导入失败！"
          this.percent = 0
          clearInterval( timer )
        }
        if ( res.errcode == 0 ) {
          this.percent = 100
          clearInterval( timer )
          this.isDownload = "导入成功！"
          console.log( 'res===>', res );
        }
      } );

    }
  }

  private removeRecord() {
    const { checkIds } = this.progressLogList, {
      locale,
      removeRecord,
      hasTask,
      removeTask,
      projectCode
    } = this;
    if ( !checkIds.length ) return this.$message.error( locale?.Progress.IdsRequired ?? "" );
    if ( hasTask( removeRecord ) ) return;
    Api.deleteProgressLog( {
      idList: checkIds,
      projectCode: projectCode as string
    } ).then( res => {
      removeTask( removeRecord );
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.getLogList();
    } );
  }
}
