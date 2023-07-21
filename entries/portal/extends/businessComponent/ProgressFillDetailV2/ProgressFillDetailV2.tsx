import { Vue, Prop, Component, InjectReactive, Watch, Ref } from 'vue-property-decorator';
import Class from './ProgressFillDetailV2.module.less';
import * as tsx from 'vue-tsx-support';
import { Icon } from '@ctesi/component';
import { ZhCNEx } from "../../locales/zh-CN-ex";
import * as Type from "../../type";
import * as Api from '../../service/api';
import Utils from "../../utils";
import { Table } from 'vxe-table';

import Pagination from "ant-design-vue/lib/pagination";
import 'ant-design-vue/lib/pagination/style/index.css';

import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';

import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';

import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import { updateFillDetail } from "../../service/api";

interface ProgressDetailList<T> {
  loading: boolean;
  source: Array<T>;
  pageNum: number;
  pageSize: number;
  total: number;
  maxHeight: number;
  ids: Array<string>;
}

interface FillDetailModal {
  visible: boolean;
  loading: boolean;
  percent: number;
  percentConfig: Array<number>;
}

@Component( {
  name: 'ProgressFillDetailV2'
} )
export default class ProgressFillDetailV2 extends Vue {

  _tsx!: tsx.DeclareProps<Pick<ProgressFillDetailV2, 'className' | 'recordId' | 'successCb'>>
  @Prop()
  public className?: string;
  @Prop()
  public recordId?: string;
  @Prop()
  public successCb?: Function;
  @InjectReactive( 'locale' )
  private locale?: typeof ZhCNEx;
  @InjectReactive( 'projectConfig' )
  private projectConfig?: Type.ProjectConfig;
  @InjectReactive( 'project' )
  private projectCode?: string;
  @Ref()
  private MainContainer?: HTMLElement;
  @Ref()
  private MainTable?: Table;
  private taskQueue: Array<string> = [];
  private progressDetailList: ProgressDetailList<Type.WBSTreeV2> = {
    loading: false,
    pageNum: 1,
    pageSize: 10,
    total: 0,
    source: [],
    maxHeight: 0,
    ids: [],
  }
  private fillDetailModal: FillDetailModal = {
    percent: 0,
    percentConfig: [],
    visible: false,
    loading: false
  }
  private colorMap: Map<number, { front: string, backend: string }> = new Map( [
    [ 0, { front: "#e6e6e6", backend: "#e6e6e6" } ],
    [ 0.00001, { front: "#f0c148", backend: "#e6e6e6" } ],
    [ 1, { front: "#00c567", backend: "#e6e6e6" } ]
  ] );

  @Watch( 'progressDetailList.pageNum' )
  pageNumListener() {
    this.getFillDetailList();
  }

  @Watch( 'recordId', { immediate: true } )
  recordIdListener( id?: string ) {
    if ( !id ) return;
    this.getFillDetailList();
  }

  public initFillDetailList() {
    this.progressDetailList.ids = [];
    this.progressDetailList.source = [];
    this.progressDetailList.total = 0;
    this.progressDetailList.pageSize = 10;
    this.progressDetailList.pageNum = 1;
  }

  mounted() {
    const { calcContentHeight } = this;
    this.calcContentHeight();
    this.getPercentConfig();
    window.addEventListener( 'resize', calcContentHeight );
  }

  destroyed() {
    const { calcContentHeight } = this;
    window.removeEventListener( 'resize', calcContentHeight );
  }

  render() {
    const { locale, className, progressDetailList, fillDetailModal } = this;
    return (
      <article class={ `${ Class.main } ${ className }` } ref={ 'MainContainer' }>
        <main class={ Class.mainContainer }>
          <section class={ Class.container }>
            <nav>
              <span>{ locale?.Progress.FillWorkDetail }</span>
              <Button onClick={ this.editDetail } class={ Class.optBtn }>
                {/* <Icon src={ 'edit' }/> */}
                <span>{ locale?.Common.Action.edit }</span>
              </Button>
              <Button onClick={ this.removeDetail } class={ Class.optBtn }>
                {/* <Icon src={ 'remove' }/> */}
                <span>{ locale?.Common.Action.remove }</span>
              </Button>
            </nav>
            <article>
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
                loading={ progressDetailList.loading }
                data={ progressDetailList.source }
                columns={ Utils.generateXTableColumns( this.renderDetailListColumns( locale ) ) }
                height={ progressDetailList.maxHeight }
                checkboxConfig={ {
                  checkField: 'checked',
                  halfField: 'indeterminate'
                } }
                { ...{
                  on: {
                    'current-change': this.selectDetail,
                    'checkbox-change': this.checkDetail,
                    'checkbox-all': this.checkAllDetail
                  }
                } }
              />
              <Pagination
                class={ Class.pagination }
                current={ progressDetailList.pageNum }
                total={ progressDetailList.total }
                onChange={ page => this.progressDetailList.pageNum = page }
              />
            </article>
          </section>
        </main>
        <Modal
          title={ locale?.Progress.DataEdit }
          visible={ fillDetailModal.visible }
          destroyOnClose={ true }
          maskClosable={ false }
          footer={ false }
          wrapClassName={ Class.fillDetailModal }
          onCancel={ ( e ) => {
            this.fillDetailModal.visible = false;
          } }
        >
          <nav class={ Class.fillDetailModalNav }>{ locale?.Progress.DataEditLabel }：</nav>
          <Select class={ Class.fillDetailModalPercent } v-model={ fillDetailModal.percent }>
            {
              fillDetailModal.percentConfig.map(
                item => <Select.Option key={ item } value={ item }>{ item }%</Select.Option>
              )
            }
          </Select>
          <aside class={ Class.modalOption }>
            <Button onClick={ this.submitFillDetailModal }>{ locale?.Common.Action.submit }</Button>
            <Button onClick={ this.closeFillDetailModal }>{ locale?.Common.Action.cancel }</Button>
          </aside>
        </Modal>
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

  private renderDetailListColumns( locale?: typeof ZhCNEx ): Array<Type.TableColumn<Type.WBSTreeV2>> {
    if ( !locale ) return [];
    return [
      {
        type: 'checkbox',
        width: 40,
      },
      {
        title: locale.Progress.TaskName,
        dataIndex: 'planDetailName',
        key: 'header_0',
        width: 200,
      },
      {
        title: locale.Progress.UnitPrice,
        dataIndex: 'planDetailUnitPrice',
        key: 'header_0',
        width: 200,
        customRender: ( r ) =>
          <span>{ (r as Type.WBSTreeV2).planDetailUnitPrice }{ (r as Type.WBSTreeV2).planDetailUnit }</span>
      },
      {
        title: locale.Progress.PlanNumber,
        dataIndex: 'planDetailAmount',
        key: 'header_0',
        width: 400,
      },
      {
        title: locale.Progress.CompleteNumber,
        dataIndex: 'reportDetailAmount',
        key: 'header_0',
        width: 500
      },
      {
        title: locale.Progress.PlanProduction,
        dataIndex: 'planDetailMoney',
        key: 'header_0',
        width: 500
      },
      {
        title: locale.Progress.CompleteProduction,
        dataIndex: 'reportDetailMoney',
        key: 'header_0',
        width: 500
      },
      {
        title: locale.Progress.ResidualProduction,
        dataIndex: 'surplusMoney',
        key: 'header_0',
        width: 500
      },
      {
        title: locale.Progress.FillPercent,
        dataIndex: 'journalMoney',
        key: 'header_0',
        width: 500,
        customRender: ( r ) => this.renderProportion( r as Type.WBSTreeV2, locale )
      }
    ]
  }

  private renderProportion( row: Type.WBSTreeV2, locale: typeof ZhCNEx ): JSX.Element {
    const { colorMap } = this, percent: number = row.cumulativeReportRatio * 100;
    let percentRole: { front: string; backend: string } = { front: "#FFFFF", backend: "#FFFFF" };
    Array.from( colorMap )?.forEach( ( item ) => {
      if ( row.cumulativeReportRatio >= item[0] ) percentRole = item[1];
    } );
    return (
      <span class={ Class.progressBar } style={ { backgroundColor: percentRole.backend } }>
        <div class={ percent < 0.13 && Class.minPercent }
             style={ { width: `${ percent }%`, backgroundColor: percentRole.front } }>
          <span>{ percent }%</span>
        </div>
      </span>
    )
  }

  private getFillDetailList() {
    const { loading, pageNum, pageSize } = this.progressDetailList, {
      recordId,
      projectCode
    } = this;
    if ( loading || !recordId ) return;
    this.progressDetailList.loading = true;
    Api.getFillWorkDetailV2( {
      id: recordId,
      pageNum: pageNum,
      pageSize: pageSize,
      projectCode: projectCode as string
    } ).then( res => {
      this.progressDetailList.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        Utils.deepFind( res.data.records, item => {
          item.checked = false;
          return false;
        }, "null" );
        this.progressDetailList.ids = [];
        this.progressDetailList.source = res.data.records;
        this.progressDetailList.total = res.data.total;
      }
    } )
  }

  private getPercentConfig() {
    if ( !this.projectConfig ) return;
    const { projectName } = this.projectConfig, { projectCode } = this;
    Api.getPercentConfig( {
      projectCode: projectCode as string,
      projectName: projectName as string
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.fillDetailModal.percentConfig = res.data;
        this.fillDetailModal.percent = res.data[0];
      }
    } )
  }

  private selectDetail( { row }: { row: Type.WBSTreeV2 } ) {

  }

  private checkDetail( { records }: { records: Array<Type.WBSTreeV2> } ) {
    this.progressDetailList.ids = records.map( item => item.id );
  }

  private checkAllDetail( { records }: { records: Array<Type.WBSTreeV2> } ) {
    this.progressDetailList.ids = records.map( item => item.id );
  }

  private editDetail() {
    const { ids } = this.progressDetailList, { locale } = this;
    if ( !ids.length ) return this.$message.error( locale?.Progress.IdsRequired ?? "" );
    this.fillDetailModal.visible = true;
  }

  private removeDetail() {
    const { ids } = this.progressDetailList, {
      locale,
      removeDetail,
      hasTask,
      removeTask,
      projectCode
    } = this;
    if ( !ids.length ) return this.$message.error( locale?.Progress.IdsRequired ?? "" );
    if ( hasTask( removeDetail ) ) return;
    Api.deleteFillDetailV2( {
      idList: ids,
      projectCode: projectCode as string
    } ).then( res => {
      removeTask( removeDetail );
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.getFillDetailList();
    } );
  }

  private submitFillDetailModal() {
    const { percent, loading } = this.fillDetailModal, { ids } = this.progressDetailList, {
      locale,
      projectCode
    } = this;
    if ( !percent ) return this.$message.error( locale?.Progress.PercentRequired ?? "" );
    if ( !ids.length ) return this.$message.error( locale?.Progress.IdsRequired ?? "" );
    if ( loading ) return;
    this.fillDetailModal.loading = true;
    Api.updateFillDetail( {
      idList: ids,
      projectCode: projectCode as string,
      ratio: percent,
    } ).then( res => {
      this.fillDetailModal.loading = false;
      this.fillDetailModal.visible = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.getFillDetailList();
      this.successCb?.();
    } )
  }

  private closeFillDetailModal() {
    this.fillDetailModal.visible = false;
  }

  private calcContentHeight() {
    const
      Container = this.MainContainer,
      TableInstance = this.MainTable;
    if ( !Container || !TableInstance ) return;
    const { x, y, width, height } = Container.getClientRects()[0];
    this.progressDetailList.maxHeight = height - 45 - 42 - 44 - 10;
    console.log( 'contentHeight===>', this.progressDetailList.maxHeight );
  }
}
