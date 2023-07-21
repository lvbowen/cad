import { Component, InjectReactive, Ref, Vue, Watch } from 'vue-property-decorator';
import Class from './ConstructionFill.module.less';
import * as Type from '../../type';
import * as Constant from '../../constant';

import rightFull from '@/assets/extends/icon/rightFull.png';
import leftFull from '@/assets/extends/icon/leftFull.png';

// import VisualList from "./VisualList";
import { Utils } from '@ctesi/core';
import { Icon } from '@ctesi/component';


import EditCell from "./EditCell";

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';

import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';

import DatePicker from 'ant-design-vue/lib/date-picker';
import 'ant-design-vue/lib/date-picker/style/index.css';

import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';

import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';

import ToolTip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';

import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';

import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';

import {
  getAllChild,
  getLazyTreeNode,
  getLogById,
  getLogWBSTree, getProgressFillTemplate,
  getProjectName, importReportBSData,
  updateLogById,
  updateLogWBS
} from "../../service/api";
import omit from "omit.js";
import moment from "moment";

@Component( {
  name: 'ConstructionFill'
} )
export default class ConstructionFill extends Vue {

  @InjectReactive( 'project' ) projectCode?: string;

  @InjectReactive( 'projectConfig' ) projectConfig?: Type.ProjectConfig;

  @Ref() FileInput?: HTMLElement;

  @Ref() DetailMain?: HTMLElement;

  @Ref() MainTree?: HTMLElement;

  @Ref() MainTable?: HTMLElement;

  //PageTable

  private tableUid: string = Utils.uuid();

  private tableScrollCount: number = 0;

  private tablePageSize: number = 20;

  private cacheNum: number = 0;

  private tableScTop: number = 0;

  private maxTableHeight: number = 0;

  private maxTreeHeight: number = 0;

  private batchFill: boolean = false;

  private recoveryFlag: boolean = false;

  //End

  //Batch
  private batchNum: number = 0;

  private batchMoney: number = 0;

  private batchFillLoading: boolean = false;

  private leafDataSaveLoading: boolean = false;
  //lazyTree
  private detailTree: boolean = false;

  private leafData: Array<Type.WBSTreeDataResult> = [];

  private leafDataTable: Partial<Type.TableConfig<Type.WBSTreeDataResult>> = {
    dataSource: [],
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  private treeSelectedArray: Array<string> = [];

  private tableLoading: boolean = false;

  private treeFull: boolean = false;

  private tableFull: boolean = false;

  private expendedKeys: Array<string> = [];
  private treeLoadKeys: Array<string> = [];
  private selectedKeys: Array<string> = [];
  // end

  private tableRef: Element | null = null;

  private importLoading: boolean = false;

  private saveLoading: boolean = false;

  private downloadLoading: boolean = false;

  private fillId: string | null = null;

  private projectNames: Array<string> = [];

  private currentName: string | null = null;

  private reportDate: string | null = null;

  private editedData: Map<string, any> = new Map();

  private logDetail: Type.LogResult = {
    journalTitle: null,
    projectName: null,
    scheduleDate: null,
    ownerName: null,
    ownerDeptName: null,
    remark: null
  }
  private treeTableColumns: Array<any> = [
    // {
    //   title: '序号',
    //   dataIndex: 'projectName',
    //   key: 'header_1',
    // },
    /*{
      title: 'BS',
      dataIndex: 'bs',
      ellipsis: true,
      width: 600,
      key: 'header_2',
    },*/
    {
      title: '名称',
      dataIndex: 'planDetailName',
      ellipsis: true,
      key: 'header_3',
      width: 300,
    },
    {
      title: '单位',
      dataIndex: 'planDetailUnit',
      ellipsis: true,
      key: 'header_4'
    },
    {
      title: '单价',
      ellipsis: true,
      dataIndex: 'planDetailUnitPrice',
      key: 'header_5',
      customRender: ( t, r ) => this.renderToolTip( t )
    },
    {
      title: '计划数量',
      ellipsis: true,
      dataIndex: 'planDetailAmount',
      key: 'header_6',
      customRender: ( t, r ) => this.renderToolTip( t )
    },
    {
      title: '计划产值',
      ellipsis: true,
      dataIndex: 'planDetailMoney',
      key: 'header_7',
      customRender: ( t, r ) => this.renderToolTip( t )
    },
    {
      title: '填报数量',
      ellipsis: true,
      dataIndex: 'dayReportDetailAmount',
      key: 'header_8',
      customRender: ( text, record ) => this.renderEditCell( record, 'dayReportDetailAmount', 'dayReportDetailMoney', 'surplusAmount' )
    },
    {
      title: '填报产值',
      ellipsis: true,
      dataIndex: 'dayReportDetailMoney',
      key: 'header_9',
      customRender: ( text, record ) => this.renderEditCell( record, 'dayReportDetailMoney', undefined, 'surplusMoney' )
    },
    {
      title: '剩余数量',
      ellipsis: true,
      dataIndex: 'surplusAmount',
      key: 'header_10',
      customRender: ( t, r ) => this.renderToolTip( t )
    },
    {
      title: '剩余产值',
      ellipsis: true,
      dataIndex: 'surplusMoney',
      key: 'header_11',
      customRender: ( t, r ) => this.renderToolTip( t )
    },
    {
      title: '完成数量',
      ellipsis: true,
      dataIndex: 'reportDetailAmount',
      key: 'header_12',
      customRender: ( t, r ) => this.renderToolTip( t )
    },
    {
      title: '完成产值',
      ellipsis: true,
      dataIndex: 'reportDetailMoney',
      key: 'header_13',
      customRender: ( t, r ) => this.renderToolTip( t )
    },
  ]
  private debounceGetWBSData = Utils.debounce( ( name: string, vm: ConstructionFill ) => {
    const { currentName, fillId } = vm;
    vm.getLogWBSTree();
  }, 300 )
  private calcTableContentDebounce = Utils.debounce( ( vm ) => this.calcTableContent( vm ), 300 );

  private treeTableDataSource: Array<Type.WBSTreeDataResult> = [];

  private treeTableDataSourceBak: Array<Type.WBSTreeDataResult> = [];

  @Watch( 'currentName', { immediate: true } )
  currentNameListener( val ) {
    if ( !val ) return;
    this.treeTableDataSource = [];
    this.logDetail.projectName = val;
    this.debounceGetWBSData( val, this );
  }

  @Watch( 'fillId', { immediate: true } )
  fillIdListener( val: string ) {
    if ( !val ) return;
    this.getLogId();
  }

  mounted() {
    this.getProjectNames();
    const { id, scheduledate } = Utils.GetRequest();
    if ( id ) this.fillId = id;
    if ( scheduledate ) {
      this.logDetail.scheduleDate = scheduledate;
    } else {
      this.logDetail.scheduleDate = moment( new Date() ).format( 'YYYY-MM-DD' );
    }
    this.calcTableContent( this );
    this.calcTreeMaxHeight();
    window.addEventListener( 'resize', e => this.calcTableContentDebounce( this ) );
  }

  private leafDataTableInit() {
    this.leafDataTable = {
      dataSource: [],
      pageNum: 1,
      pageSize: 10,
      total: 0
    }
  }

  beforeDestroy() {
    this.treeTableDataSource = [];
    window.removeEventListener( 'resize', e => this.calcTableContentDebounce( this ) );
  }

  render() {
    const {
      logDetail,
      treeTableColumns,
      currentName,
      projectNames,
      renderProjectNames,
      treeTableDataSource,
      saveLogDetail,
      debounceGetWBSData,
      fileInput,
      importPlanData,
      dynamicTreeNode,
      lazyLoadTree,
      downloadLoading,
      downloadTemplate,
      treeLazyLoad,
      treeLoadKeys,
      expendedKeys,
      treeSelect,
      leafDataTablePageChange,
      showTotal,
      tableLoading,
      maxTableHeight,
      maxTreeHeight,
      renderOptBar,
      batchFill,
      fillId
    } = this;
    return (
      <article class={ Class.main }>
        <nav class={ Class.optNav }>
          <Icon src={ 'goBack' } class={ Class.navBack } clickEvent={ e => this.$router.go( -1 ) }/>
          <span>{ fillId && '查看' || '新增' }进度填报</span>
          <Button loading={ this.downloadLoading } onClick={ downloadTemplate }>模板下载</Button>
          <Button loading={ this.importLoading } onClick={ e => importPlanData() }>表格导入</Button>
          <Button loading={ this.saveLoading } onClick={ e => saveLogDetail() }
                  type={ 'primary' }>保存修改</Button>
        </nav>
        <section class={ Class.logSection }>
          <nav>
            <span>进度日志</span>
          </nav>
          <main class={ Class.detailContainer }>
            <aside class={ Class.row }>
              <div class={ Class.formItem }>
                <span>项目名称：</span>
                <Select value={ currentName }
                        onChange={ e => {
                          this.currentName = e
                          this.leafDataTableInit();
                          this.editedData.clear();
                        } }>{ renderProjectNames( projectNames ) }</Select>
              </div>
              <div class={ Class.formItem }>
                <span>日志标题：</span>
                <Input
                  value={ logDetail.journalTitle }
                  onChange={ e => this.logDetail.journalTitle = e.currentTarget.value }
                />
              </div>
              <div class={ Class.formItem }>
                <span>填报人：</span>
                <Input disabled={ true } value={ logDetail.ownerName }/>
              </div>
              <div class={ Class.formItem }>
                <span>所属部门：</span>
                <Input disabled={ true } value={ logDetail.ownerDeptName }/>
              </div>
              <div class={ Class.formItem }>
                <span>填报日期：</span>
                <DatePicker value={ logDetail.scheduleDate } onChange={ e => {
                  this.logDetail.scheduleDate = e.format( 'YYYY-MM-DD' );
                } }/>
              </div>
            </aside>
            <aside class={ Class.row }>
              <div class={ Class.areaItem }>
                <span>计划方案备注：</span>
                <Input value={ logDetail.remark } onChange={ e => {
                  this.logDetail.remark = e.currentTarget.value;
                } }/>
                {/*<Input.TextArea value={logDetail.remark} onChange={e => {
                  this.logDetail.remark = e.currentTarget.value;
                }}/>*/ }
              </div>
            </aside>
          </main>
        </section>
        <section class={ Class.treeSection }>
          <input ref={ 'FileInput' } class={ Class.hide } type={ 'file' }
                 onChange={ e => fileInput( e ) }/>
          <nav>
            <span>填报工作明细</span>
            <Button onClick={ e => this.checkBatchStatus() } type={ 'primary' }>批量填报</Button>.
            <Button onClick={ e => {
              this.editedData.clear();
              this.treeSelect( this.treeSelectedArray, null )
            } }>刷新</Button>
            <Button
              loading={ this.leafDataSaveLoading }
              onClick={ e => {
                if ( this.leafDataSaveLoading ) return;
                this.leafDataSaveLoading = true;
                this.saveChange( fillId as string, () => {
                  this.leafDataSaveLoading = false;
                  this.editedData.clear();
                  this.batchFill = false;
                }, true );
              } }
            >保存填报</Button>
          </nav>
          <main ref={ 'DetailMain' } class={ Class.detailMain }>
            <div ref={ 'MainTree' }
                 class={ `${ Class.treeContainer } ${ this.treeFull && Class.fullContainer } ${ this.tableFull && Class.zeroContainer }` }
                 style={ { height: `${ maxTreeHeight + 3 }px` } }>
              <Tree
                loadData={ treeLazyLoad }
                treeData={ treeTableDataSource }
                expandedKeys={ this.expendedKeys }
                loadedKeys={ this.treeLoadKeys }
                selectedKeys={ this.selectedKeys }
                replaceFields={ {
                  children: 'children',
                  title: 'treeName',
                  key: 'id'
                } }
                onSelect={ ( s, e ) => {
                  this.leafDataTable.pageNum = 1;
                  this.selectedKeys = s;
                  treeSelect( s, e );
                } }
                onLoad={ ( l, e ) => this.treeLoadKeys = l }
                onExpand={ ( e ) => this.expendedKeys = e }
              />
            </div>
            <section class={ Class.optBar }>
              { renderOptBar( this.treeFull, this.tableFull ) }
            </section>
            <Table
              class={ `${ this.tableFull && Class.fullContainer } ${ this.treeFull && Class.zeroContainer }` }
              ref={ 'MainTable' }
              loading={ tableLoading }
              rowKey={ 'id' }
              columns={ treeTableColumns }
              dataSource={ this.leafDataTable.dataSource }
              scroll={ { y: maxTableHeight } }
              rowClassName={ this.calcRowClass }
              pagination={ {
                current: this.leafDataTable.pageNum,
                total: this.leafDataTable.total,
                pageSize: this.leafDataTable.pageSize,
                onChange: leafDataTablePageChange,
                showTotal: showTotal,
                showSizeChanger: true,
                pageSizeOptions: [ '10', '20', '50', '100' ],
                onShowSizeChange: ( current, size ) => {
                  this.leafDataTable.pageSize = size;
                  this.treeSelect( this.treeSelectedArray, null );
                }
              } }
            />
          </main>
        </section>
        <Modal
          width={ 600 }
          title={ '批量填报' }
          visible={ batchFill }
          footer={ this.renderModalFooter() }
        >
          <section class={ Class.batchFill }>
            <span>填报数量：</span>
            <Input onChange={ e => this.batchNum = Number( e.currentTarget.value ) }/>
            <span>填报产值：</span>
            <Input onChange={ e => this.batchMoney = Number( e.currentTarget.value ) }/>
          </section>
        </Modal>

      </article>
    );
  }

  private editValueChange( e, key: string, originData, calcKey: string, compareKey: string, originTextBak: string | number, currentCell: EditCell ) {
    console.log( 'inEditValue===>', e );
    // const {id} = originData, {treeTableDataSource} = this;
    const { id } = originData, { leafDataTable } = this;
    const tableDataCopy = [ ...leafDataTable.dataSource ?? [] ];
    tableDataCopy.forEach( item => {
      if ( item.id === id ) {
        console.log( 'Number(e) > Number(item[compareKey])', Number( e ) > Number( item[compareKey] ) );
        if ( Number( e ) > Number( item[compareKey] ) ) {
          item[key] = originTextBak;
          this.recoveryFlag = true;
          currentCell?.setOriginText( originTextBak );
          this.$message.error( '填报不能大于剩余!' );
        } else {
          if ( this.recoveryFlag ) {
            this.recoveryFlag = false;
          } else {
            item[key] = e;
            if ( calcKey ) {
              //@ts-ignore
              if ( !this.recoveryFlag ) item[calcKey] = ((Number( e ) * 1000) * (Number( item['planDetailUnitPrice'] * 1000 ))) / 1000000;
              // console.log('edit');
              // !this.recoveryFlag && this.editedData.set(id, item);
            }
            console.log( 'edit' );
            !this.recoveryFlag && this.editedData.set( id, item );
          }

        }
      }
    } )
    /*    Utils.deepFind(tableDataCopy, item => {
          if (item.id === id) {
            item[key] = e;
            //这里先写死key TODO:wait2 fix
            if (calcKey) {
              item[calcKey] = ((Number(e) * 1000) * (Number(item['planDetailUnitPrice'] * 1000))) / 1000000;
            }
            this.editedData.set(id, item);
            return true;
          } else {
            return false;
          }
        }, 'children');*/
    console.log( tableDataCopy );
    this.leafDataTable.dataSource = tableDataCopy;
  }

  private renderEditCell( record, key: string, calcKey?: string, compareKey?: string ) {
    const { editValueChange } = this;
    return <EditCell textKey={ key } calcKey={ calcKey } value={ record } compareKey={ compareKey }
                     valueChange={ editValueChange }/>
  }

  private renderToolTip( text ) {
    return <ToolTip title={ text }>
      <span>{ text }</span>
    </ToolTip>;
  }

  private getLogId() {
    const { fillId, projectCode } = this;
    getLogById( {
      id: fillId as string,
      projectCode: projectCode as string
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( !res.data ) return;
      const {
        journalTitle,
        projectName,
        ownerName,
        ownerDeptName,
        scheduleDate,
        remark
      } = res.data;
      this.currentName = projectName as string;
      this.logDetail = {
        journalTitle,
        projectName,
        scheduleDate,
        ownerDeptName,
        ownerName,
        remark
      }
    } )
  }

  private getProjectNames(): void {
    //this.projectNames.push(window.Environment.markName)
    const { projectConfig } = this;
    if ( !projectConfig ) return;
    if ( projectConfig.projectLevel === Constant.ProjectLevel['项目'] ) {
      this.projectNames = [ projectConfig.projectName as string ];
      this.currentName = projectConfig.projectName;
    }
  }

  private refreshWBSData() {

  }

  private getLogWBSTree(): void {
    const { projectCode, currentName, reportDate, fillId } = this;
    const reqParam = {
      projectCode: projectCode as string,
      projectName: currentName ?? undefined,
      scheduleLogId: fillId ?? undefined
    }
    const omitProperty: Array<string> = [];
    for ( const originKey in reqParam ) {
      if ( reqParam.hasOwnProperty( originKey ) && !reqParam[originKey] ) omitProperty.push( originKey )
    }

    //@ts-ignore
    getLazyTreeNode( {
      projectCode: this.projectCode as string,
      scheduleLogId: fillId ?? undefined,
      projectName: currentName ?? undefined,
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.treeTableDataSource = res.data.map( item => {
          //@ts-ignore
          item.treeName = `${ item.bs } - ${ item.planDetailName }`;
          console.log( 'item.leaf===>', item );
          //@ts-ignore
          item.isLeaf = item.leaf ? true : false;
          if ( !item.leaf ) {
            item.children = [];
          } else {
            item.children = undefined;
          }
          return item;
        } );
      }
    } )
    /*getLogWBSTree(omit(reqParam, omitProperty)).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        Utils.deepFind(res.data, (item) => {
          if (!item.children.length) item.children = undefined;
          return false;
        }, 'children');
        //TODO: only for test
        const test = res.data.map(item => {
          item.children = [];
          return item;
        });
        this.treeTableDataSource = test;
        //this.treeTableDataSource = res.data.slice(0,20);
        //this.treeTableDataSourceBak = res.data;
      }
    })*/
  }

  private renderProjectNames( names: Array<string> ): Array<JSX.Element> {
    if ( !Array.isArray( names ) ) return [];
    return names.map( item => {
      return (
        <Select.Option key={ item }>{ item }</Select.Option>
      )
    } );
  }

  private saveLogDetail() {
    if ( this.saveLoading ) return;
    this.saveLoading = true;
    const { logDetail, fillId, projectCode } = this;
    /*if (!logDetail.projectName) {
      this.saveLoading = false;
      this.$message.warn('项目名称不能为空！');
      return;
    }*/
    if ( !logDetail.scheduleDate ) {
      this.saveLoading = false;
      this.$message.warn( '填报日期不能为空！' );
      return;
    }
    if ( !logDetail.projectName ) {
      this.saveLoading = false;
      this.$message.warn( '项目名称不能为空！' );
      return;
    }
    updateLogById( {
      id: fillId ?? undefined,
      journalTitle: logDetail.journalTitle as string,
      projectCode: projectCode as string,
      projectName: logDetail.projectName as string,
      remark: logDetail.remark as string,
      scheduleDate: logDetail.scheduleDate as string
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( !res.data ) return;
      this.fillId = res.data;
      this.saveChange( res.data, () => {
        this.saveLoading = false;
      } );
    } )
  }

  private saveChange( id: string, cb?: Function, forbidden?: boolean ) {
    const { editedData, logDetail, fillId } = this;
    if ( !id && !fillId ) return this.$message.warn( '进度日志ID不能为空!' );
    if ( !logDetail.projectName ) return this.$message.warn( '项目名称不能为空!' );
    if ( !logDetail.scheduleDate ) return this.$message.warn( '填报日期不能为空!' );
    if ( !logDetail.scheduleDate ) return;
    const reqList: Array<any> = [];
    editedData.forEach( item => {
      item.state = 'refresh';
      item.reportAmountBS = Number( item.dayReportDetailAmount );
      item.reportMoneyBS = Number( item.dayReportDetailMoney );
      item.metricBS = item.planDetailUnit;
      item.planAmountBS = item.planDetailAmount;
      item.planMoneyBS = item.planDetailMoney;
      item.reportBS = item.bs;
      // item.reportDate = moment(logDetail.scheduleDate).toDate();
      item.unitPriceBS = item.planDetailUnitPrice;
      item.workName = item.planDetailName;
      item.th04bSchedulejournalFk = id ?? fillId as string;
      item.th04aPlandetailFk = item.id;
      reqList.push( item );
    } );
    updateLogWBS( {
      list: reqList,
      projectCode: this.projectCode as string,
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.$router.push( {
        name: 'constructionFill',
        query: {
          id: id ?? fillId
        }
      } );
      if ( !forbidden ) {
        this.treeLoadKeys = [];
        this.expendedKeys = [];
        this.selectedKeys = [];
        this.leafDataTableInit();
        this.editedData.clear();
        cb?.();
        this.debounceGetWBSData( '', this );
      } else {
        cb?.();
        this.treeSelect( this.treeSelectedArray, null );
      }
      /*this.getLogId();
      this.debounceGetWBSData('', this);*/
    } )
  }

  private renderImportFailed( msg: string ) {
    return <div class={ Class.importFailedMsg }>{ msg?.split( '&' ).map( error =>
      <span>{ error }</span> ) }</div>;
  }

  private fileInput( e ) {
    const files = e.target.files, { projectCode, fillId, debounceGetWBSData } = this;
    if ( files && files[0] ) {
      const file = files[0];
      const fileFormat = file.name.slice( file.name.lastIndexOf( '.' ) + 1 ).toLowerCase();
      if ( [ 'xlsx', 'xls' ].indexOf( fileFormat ) === -1 ) {
        this.importLoading = false;
        this.$message.error( '请上传Excel文件!' );
        return;
      }
      const formData = new FormData();
      formData.append( 'file', file );
      formData.append( 'projectCode', projectCode as string );
      formData.append( 'projectName', this.currentName as string );
      //formData.append('schedulePlanId', fillId as string);
      importReportBSData( formData ).then( res => {
        //if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
        if ( res.errcode !== 0 ) return this.$message.warn( this.renderImportFailed( res.errmsg as string ) );
        console.log( 'res===>', res );
        this.importLoading = false;
        if ( res.errcode === 0 ) debounceGetWBSData( null, this )
      } );
    }
  }

  private importPlanData() {
    if ( this.importLoading ) return;
    this.importLoading = true;
    const { fillId } = this;
    if ( !fillId ) {
      this.importLoading = false;
      this.$message.warn( '请先保存计划！' );
      return;
    }
    this.FileInput?.click();
  }

  private downloadTemplate() {
    if ( this.downloadLoading ) return;
    this.downloadLoading = true;
    //TODO: download template
    getProgressFillTemplate().then( res => {
      if ( res.errcode !== 0 ) {
        this.downloadLoading = false;
        this.$message.error( res.errmsg as string );
        return;
      }
      if ( res.data ) {
        const fileUrl = `${ window.config.apiHost }/api/aliyun/download?refId=${ res.data }`;
        window.open( fileUrl );
        this.downloadLoading = false;
      }
    } )
  }

  private handleTableScroll( e ) {
    console.log( 'handleTableScroll', e );
    this.tableScTop = e.target.scrollTop;
    const { tableScTop, tableRef } = this;
    const
      offetH = e.target.offsetHeight,
      scH = e.target.scrollHeight;
    const { treeTableDataSourceBak, treeTableDataSource, tablePageSize, cacheNum } = this;
    if ( treeTableDataSourceBak.length < tablePageSize ) {
      this.treeTableDataSource = treeTableDataSourceBak;
      return;
    }
    //Top
    if ( tableScTop === 0 ) {
      const scTCount = this.tableScrollCount;
      if ( this.tableScrollCount <= 0 ) {
        this.tableScrollCount = 1;
      }
      if ( this.tableScrollCount === 1 ) {
        this.treeTableDataSource = this.treeTableDataSourceBak.slice( 0, tablePageSize );
      } else {
        tableRef?.scrollTo( 0, 10 );
        const start = ((tablePageSize * (tableScTop - 1) - cacheNum));
        const end = tablePageSize * tableScTop;
        this.treeTableDataSource = this.treeTableDataSourceBak.slice( start, end );
        this.tableScrollCount--;
      }
    }
    //Bottom
    if ( (tableScTop + offetH) >= scH ) {
      const scTCount = this.tableScrollCount;
      const isLastPage = tablePageSize - (treeTableDataSourceBak.length - this.tableScrollCount * (this.treeTableDataSourceBak.length - this.cacheNum));
      const lastNum = this.tableScrollCount * (treeTableDataSourceBak.length - cacheNum) - isLastPage;
      if ( isLastPage >= 0 ) {
        this.treeTableDataSource = this.treeTableDataSourceBak.slice( lastNum - cacheNum, this.treeTableDataSourceBak.length );
      } else {
        tableRef?.scrollTo( 0, 100 );
        if ( (tablePageSize * this.tableScrollCount - cacheNum) < 0 ) {
          this.treeTableDataSource = this.treeTableDataSourceBak.slice( (tablePageSize - cacheNum), (tablePageSize * 2) );
          this.tableScrollCount++;
        } else {
          this.treeTableDataSource = this.treeTableDataSourceBak.slice( (tablePageSize * this.tableScrollCount - cacheNum), (tablePageSize * (this.tableScrollCount + 1)) );
          this.tableScrollCount++;
        }
      }
    }
  }

  private dynamicTreeNode( record, index, indent, expanded ) {
    console.log( 'record===>', record, index );
    return <span>{ 1 }</span>
  }

  private openModalTable( tableData: Array<Type.WBSTreeDataResult> ) {
    this.leafData = tableData;
  }

  private lazyLoadTree( expanded, record ) {
    console.log( 'expanded!', record );
    const { id } = record, { treeTableDataSource, treeLazyLoadAdaptor } = this;
    if ( !id ) return;
    //TODO:lazyGetTreeNode
    if ( expanded ) {
      getLazyTreeNode( {
        id: id,
        projectCode: this.projectCode as string,
        projectName: this.currentName as string,
        scheduleLogId: this.fillId as string
      } ).then( res => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        if ( res.data ) treeLazyLoadAdaptor( treeTableDataSource, res.data, id );
      } )
    } else {
      /* Utils.deepFind(treeTableDataSource, item => {
         if (item.id === id) {
           item.children = [];
           return true;
         } else {
           return false;
         }
       }, 'children');*/
    }
  }

  private treeLazyLoadAdaptor(
    origin: Array<Type.WBSTreeDataResult>,
    add: Array<Type.WBSTreeDataResult>,
    id?: string,
    resolve?: Function
  ) {
    Utils.deepFind( origin, item => {
      if ( item.id === id ) {
        item.children = add.map( child => {
          //@ts-ignore
          child.treeName = `${ child.bs } - ${ child.planDetailName }`;
          if ( !child.leaf ) {
            console.log( 'child.childType', child.childType );
            if ( child.childType === 'MBS' ) {
              //@ts-ignore
              child.isLeaf = true;
              child.children = undefined;
            } else {
              child.children = [];
            }
          } else {
            //@ts-ignore
            child.isLeaf = true;
            child.children = undefined;
          }
          return child;
        } );
        resolve?.();
        return true;
      } else {
        resolve?.();
        return false;
      }
    }, 'children' );
  }

  private treeLazyLoad( treeNode ) {
    const { eventKey: id, expanded } = treeNode, {
      treeTableDataSource,
      treeLazyLoadAdaptor
    } = this;
    if ( !id ) return;
    return new Promise( ( resolve, reject ) => {
      if ( !expanded ) {
        getLazyTreeNode( {
          id: id,
          projectCode: this.projectCode as string,
          projectName: this.currentName as string,
          scheduleLogId: this.fillId as string
        } ).then( res => {
          if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
          if ( res.data ) treeLazyLoadAdaptor( treeTableDataSource, res.data, id, resolve );
        } )
      } else {
        /* Utils.deepFind(treeTableDataSource, item => {
           if (item.id === id) {
             item.children = [];
             return true;
           } else {
             return false;
           }
         }, 'children');*/
      }
    } )
  }

  private treeSelect( selectedKeys, e ) {
    console.log( 'treeSelectKeys===>', selectedKeys, e );
    this.treeSelectedArray = selectedKeys;
    const { pageSize, pageNum } = this.leafDataTable;
    this.tableLoading = true;
    getAllChild( {
      id: selectedKeys[0],
      pageNum: pageNum,
      pageSize: pageSize,
      projectCode: this.projectCode as string,
      projectName: this.currentName as string,
      scheduleLogId: this.fillId as string
    } ).then( res => {
      if ( res.errcode !== 0 ) {
        this.tableLoading = false;
        this.$message.error( res.errmsg as string );
        return;
      }
      console.log( res.data );
      if ( !res.data ) return this.tableLoading = false;
      Utils.deepFind( res.data.data, item => {
        item.children = undefined;
        return false;
      }, 'children' );
      this.leafDataTable.dataSource = res.data.data;
      this.leafDataTable.total = res.data.totalSize as number;
      this.tableLoading = false;
      this.calcTableContent( this );
    } )
  }

  private leafDataTablePageChange( page, pageSize ) {
    console.log( 'leafDataTablePageChange===>', page, pageSize );
    const { treeSelectedArray, editedData } = this;
    if ( editedData.size ) return this.$message.warn( '你还有未保存的数据,请先保存!' );
    this.leafDataTable.pageNum = page;
    this.leafDataTable.pageSize = pageSize;
    this.treeSelect( treeSelectedArray, null );
  }

  private showTotal( total, range ) {
    return `总共有 ${ total } 条数据`;
  }

  private calcTableContent( vm: ConstructionFill ) {
    console.log( 'calcTableContent!' );
    const cssKey = '--tableMaxHeight';
    const { DetailMain, leafDataTable } = vm;
    const entireDetailMainHeight = DetailMain?.offsetTop;
    const entireBodyHeight = document.body.offsetHeight;
    const restHeight = entireBodyHeight - (entireDetailMainHeight ?? 0) - 20;
    const tableIns = DetailMain?.ownerDocument.defaultView?.getComputedStyle( DetailMain );
    if ( !tableIns ) return console.warn( 'detailMain ==> height error' );
    const afterCalc = restHeight - 54 - 64;
    if ( !leafDataTable.dataSource?.length ) return;
    DetailMain?.style.setProperty( cssKey, `${ afterCalc }px`.trim() );
    vm.maxTableHeight = afterCalc;
    vm.maxTreeHeight = restHeight;
  }

  private calcTreeMaxHeight() {
    const { DetailMain } = this;
    const entireDetailMainHeight = DetailMain?.offsetTop;
    const entireBodyHeight = document.body.offsetHeight;
    const restHeight = entireBodyHeight - (entireDetailMainHeight ?? 0) - 20;
    this.maxTreeHeight = restHeight;
  }

  private renderOptBar( tree: boolean, table: boolean ) {
    if ( !tree && !table ) {
      return [
        <div onClick={ e => this.treeFull = !tree } class={ Class.rightFull }>
          <img src={ rightFull } alt={ 'rightFull' }/>
        </div>
        ,
        <div onClick={ e => this.tableFull = !table } class={ Class.leftFull }>
          <img src={ leftFull } alt={ 'leftFull' }/>
        </div>
      ]
    } else if ( tree && !table ) {
      return [
        <div style={ { marginTop: 'auto' } } onClick={ e => {
          this.treeFull = !tree;
        } } class={ Class.leftFull }>
          <img src={ leftFull } alt={ 'leftFull' }/>
        </div>
      ]
    } else if ( !tree && table ) {
      return [
        <div style={ { marginTop: 'auto' } } onClick={ e => {
          this.tableFull = !table;
        } } class={ Class.leftFull }>
          <img src={ rightFull } alt={ 'rightFull' }/>
        </div>
      ]
    }
  }

  private checkBatchStatus() {
    const { leafDataTable, fillId } = this;
    if ( !fillId ) return this.$message.error( '请先保存填报!' );
    if ( !leafDataTable.dataSource?.length ) {
      return this.$message.warn( '没有需要填报的子项' );
    }
    if ( !leafDataTable.dataSource.find( item => Number( item.leaf ) === 1 ) ) {
      return this.$message.warn( '没有需要填报的子项' );
    }
    this.batchFill = true;
  }

  private saveBatch( vm: ConstructionFill ) {
    this.batchFillLoading = true;
    const { batchNum, batchMoney, leafDataTable, editedData, fillId } = vm;
    if ( !fillId ) return vm.$message.error( '请先保存填报!' );
    if ( isNaN( batchNum ) || isNaN( batchMoney ) ) {
      this.batchFillLoading = false;
      return vm.$message.warn( '请填入数字' );
    }
    if ( leafDataTable.dataSource?.find( item => {
      if ( batchNum > Number( item.surplusAmount ) ) return item;
      if ( batchMoney > Number( item.surplusMoney ) ) return item;
    } ) ) {
      this.batchFillLoading = false;
      return vm.$message.warn( '填报数量/产值不可大于剩余数量/产值' );
    }
    const leafDataCopy = [ ...leafDataTable.dataSource ?? [] ];
    leafDataCopy.forEach( item => {
      item.dayReportDetailAmount = batchNum;
      item.dayReportDetailMoney = batchMoney;
      editedData.set( item.id, item );
    } );
    vm.saveChange( fillId, () => {
      this.batchFillLoading = false;
      this.editedData.clear();
      vm.batchFill = false;
    }, true );
  }

  private renderModalFooter() {
    const { batchFillLoading, saveBatch } = this;
    return [
      <Button onClick={ () => this.batchFill = false }>取消</Button>,
      <Button loading={ batchFillLoading } onClick={ () => saveBatch( this ) }
              type={ 'primary' }>保存</Button>
    ]
  }

  private calcRowClass( record, index ) {
    return record.leaf === 1 ? Class.editable : null;
  }
}
