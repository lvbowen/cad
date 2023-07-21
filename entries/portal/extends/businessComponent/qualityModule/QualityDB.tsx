/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import { Component, InjectReactive, Ref, Vue } from 'vue-property-decorator';
import Class from './qualityModule.module.less';
import { Icon } from '@ctesi/component';
import { ZhCNEx} from "../../locales/zh-CN-ex";
import Utils from "../../utils";
import * as Api from "../../service/api";
import * as Type from "../../type";
import { isEmpty, isEqual } from "lodash";
import Websocket from "../systemConfig/websocket_base";
import axios from "axios";
import { Table as VXETable } from "vxe-table";

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';

import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';

import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';

import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css'
import env from "../../../../mobile/src/config/env";
import {getQBSTreeComplete} from "../../service/api";

interface MainTableType<T,V> {
  loading: boolean;
  checkAble: boolean;
  currentRow?: T | null;
  treeField: string;
  hasChild: string;
  dataSource: Array<Type.QualityTable>;
  treeData: Array<any>;
  conditions: string | null;
  status: V | null
}

interface RightTableType {
  loading: boolean,
  dataSource: Array<Type.QualityQBS>,
  current: number,
  total: number,
  pageSize: number
}

// eslint-disable-next-line no-shadow
/*enum QBSLevel {
  CHECK_POINT = -1,
  UNIT_PROJECT,
  PARTITION_PROJECT,
  SUB_PARTITION_PROJECT,
  ITEM_PROJECT,
  SUB_ITEM_PROJECT,
  INSPECTION_LOT,
  MODEL,
  CHECK_STEP
}*/
// eslint-disable-next-line no-shadow
enum ProgressStatus {
  undo = 0,
  doing,
  done
}

@Component( {
  name: 'qualityDB'
} )
export default class QualityDB extends Vue {

  @InjectReactive( 'project' ) projectCode?: string;

  @InjectReactive( 'projectName' ) projectName?: string;

  @InjectReactive( 'projectConfig' ) projectConfig?: Type.ProjectConfig;

  @InjectReactive( 'locale' ) locale?: typeof ZhCNEx;

  @Ref() TreeContainer?: HTMLElement;

  @Ref() TreeNav?: HTMLElement;

  @Ref() MainTable?: VXETable;

  private maxHeight: number = 0;

  private searchParts: boolean = false;

  private validate: boolean | undefined = false;

  private mainTable: MainTableType<Type.QualityTable,ProgressStatus> = {
    loading: false,
    checkAble: false,
    currentRow: null,
    conditions: null,
    treeField: 'childs',
    hasChild: 'hasChild',
    dataSource: [],
    treeData: [],
    status: null
  }

  private checkedRow: Array<Type.QualityTable> = [];

  private rightTable: RightTableType = {
    loading: false,
    dataSource: [],
    current: 0,
    total: 0,
    pageSize: 10
  }

  socket: any = null;
  num: number = 1;

  private adapterImpl<T>( dataSource: Array<T>, childrenKey: string ): void {
    Utils.deepFind( dataSource, item => {
      item.checked = false;
      item.hasChild = !item.leaf;
      item.childs = item.leaf ? undefined : item.childs;
      item.isLeaf = !!item.leaf;
      return false;
    }, childrenKey );
  }

  private setAllTreeExpanded() {
    const { mainTable, MainTable } = this;
    MainTable?.setAllTreeExpand( true );
    this.$nextTick().then( () => {
      Utils.deepFind( mainTable.dataSource, item => {
        item._X_EXPAND = !(!item.leaf && !item.childs.length);
        return false;
      }, mainTable.treeField );
    } );
  }

  private treeStructureAdapter( tree: Array<Type.QualityTable>, autoSet?: boolean ): void | Array<Type.QualityTable> {
    const { treeField } = this.mainTable;
    if ( Array.isArray( tree ) ) {
      tree.forEach( item => this.adapterImpl<Type.QualityTable>( [ item ], treeField ) )
    } else {
      [ tree ].forEach( item => this.adapterImpl<Type.QualityTable>( [ item ], treeField ) );
    }
    if ( autoSet ) {
      this.mainTable.dataSource = tree;
    } else {
      return tree;
    }
  }

  private renderTreeStatus( row: Type.QualityTable ) {
    const { locale } = this;
    return [<span class={row.status===2?Class.done:row.status===1?Class.doing:row.status===0?Class.undo:''}>{ '(' + Number(row.doingNum + row.doneNum) + '/' + row.totalNum + ')' }</span>]
    // switch ( row.status ) {
    //   /* case '未填报':
    //      return [ <span class={ Class.undo }>{ row.status }</span> ];
    //    case '审核中':
    //      return [ <span class={ Class.doing }>{ row.status }</span> ];
    //    case '已归档':
    //      return [ <span class={ Class.done }>{ row.status }</span> ];*/
    //   case -1:
    //     return [ <span class={ Class.undo }>{ locale?.Engineering.stateless }</span> ];
    //   case 0:
    //     return [ <span class={ Class.undo }>{ locale?.Engineering.undo }</span> ];
    //   case 1:
    //     return [ <span class={ Class.doing }>{ locale?.Engineering.doing }</span> ];
    //   case 2:
    //     return [ <span class={ Class.done }>{ '(' + Number(row.doingNum + row.doneNum) + '/' + row.totalNum + ')' }</span> ];
    // }
  }

  private renderTreeProgressState(row: Type.QualityTable) {
    const { locale } = this;
    switch (row.progressState) {
      case -1:
        return [ <span class={Class.done}>{ locale?.Progress.Done}</span>]
      case 0:
        return [ <span class={Class.undo}>{ locale?.Progress.NotFinished}</span>]
      case 1:
        return [ <span class={Class.done}>{ locale?.Progress.Done}</span>]
    }
  }

  private vxTreeColumns( locale?: typeof ZhCNEx, checkAble?: boolean ): Array<Type.TableColumn<any>> {
    if ( !locale ) return [];
    let defaultColumn = [
      {
        type: 'checkbox',
        width: 40,
        align: 'center'
      },
      {
        title: locale.Engineering.name,
        field: 'qbsName',
        treeNode: true,
        // width: '50%'
        width: 300
      },
      {
        title: locale.Engineering.status,
        field: 'status',
        align: 'center',
        //width: '23%',
        slots: {
          default: ( { row } ) => this.renderTreeStatus( row )
        }
      },
      // {
      //   title: locale.Engineering.progressState,
      //   field: 'progressExpr',
      //   align: 'center'
      // },
      {
        title: locale.Engineering.progressState,
        field: 'progressState',
        align: 'center',
        slots: {
          default: ({row})=>this.renderTreeProgressState(row)
        }
      }
      /*{
        title: locale.Engineering.progressState,
        field: 'progressState',
        treeNode: false,
        // width: '25%',
        slots: {
          default: ( { row } ) => this.renderTreeStatus2( row )
        }
      }*/
    ];
    if(!this.validate) {
      defaultColumn = defaultColumn.filter((i)=> {
        return i.title !==locale.Engineering.progressState
      })
    }
    if ( !checkAble ) {
      defaultColumn.shift();
    }
    return defaultColumn;
  }

  private tableSelected( { row }: { row: Type.QualityTable } ) {
    const { mainTable } = this;
    if ( !mainTable.checkAble ) {
      this.mainTable.currentRow = row;
      this.treeSelect();
    } else {
      //this.MainTable?.setCurrentRow( [] );
    }
  }

  private cellClick() {
    this.MainTable?.setCurrentRow( [] );
    this.mainTable.currentRow = null;
  }

  private clearSelectedRow() {
    this.MainTable?.setCurrentRow( [] );
    this.mainTable.currentRow = null;
  }

  private clearAllCheckBox() {
    const { mainTable } = this;
    Utils.deepFind( mainTable.dataSource, item => {
      item.checked = false;
      return false;
    }, 'childs' );
  }

  private getQBSTree( nodeId?: string ) {
    const { mainTable, projectCode, projectConfig, treeStructureAdapter } = this;
    if ( mainTable.loading ) return;
    this.mainTable.loading = true;
    return Api.getQBSTree( {
      appCode: projectCode as string,
      projectName: projectConfig?.projectName as string,
      name: mainTable.conditions??undefined,
      qbsId: nodeId,
      status: mainTable.status ?? undefined,
      flag: true
    } ).then( res => {
      this.mainTable.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.checkedRow = [];
        this.mainTable.dataSource = treeStructureAdapter( res.data ) as Array<Type.QualityTable>;
      }
    } )
  }

  private getQBSTreeComplete(nodeId?: string ) {
    const { mainTable, projectCode, projectConfig, treeStructureAdapter } = this;
    if ( mainTable.loading ) return;
    this.mainTable.loading = true;
    return Api.getQBSTreeComplete( {
      appCode: projectCode as string,
      projectName: projectConfig?.projectName as string
    } ).then( res => {
      this.mainTable.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.checkedRow = [];
        this.mainTable.dataSource = treeStructureAdapter( res.data ) as Array<Type.QualityTable>;
      }
    } )
  }

  private getBizSheetTable( checkedRows?: Array<Type.QualityTable>, page?: number ) {
    const { mainTable, rightTable } = this;
    if ( rightTable.loading ) return;
    this.rightTable.loading = true;
    return Api.getBindBizSheet( {
      qbsIds: checkedRows ? checkedRows.map( item => item.id ) : [ mainTable.currentRow?.id as string ],
      pageNum: page ?? 10,
      currentPage: 1
    } ).then( res => {
      this.rightTable.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.rightTable.dataSource = res.data.hits;
        this.rightTable.total = res.data.totalHits;
        this.num++;
      }
    } )
  }

  private searchMainTable() {
    this.clearSelectedRow();
    this.clearAllCheckBox();
    this.initBizSheetTable();
    this.getQBSTree()?.then( () => {
      this.setAllTreeExpanded();
    } );
  }

  private enableChecked() {
    const { mainTable } = this;
    this.mainTable.checkAble = !this.mainTable.checkAble;
    this.clearAllCheckBox();
    this.initBizSheetTable();
    if ( mainTable.currentRow ) {
      this.treeSelect();
    }
    if ( mainTable.checkAble && mainTable.currentRow ) {
      mainTable.currentRow.checked = true;
      this.checkedRow = [ mainTable.currentRow ];
    }
    if ( !mainTable.checkAble && this.MainTable?.getCurrentRecord() ) {
      this.tableSelected( { row: this.MainTable?.getCurrentRecord() as Type.QualityTable } );
    }
  }

  private initBizSheetTable() {
    this.rightTable.dataSource = [];
    this.rightTable.total = 0;
    this.rightTable.current = 1;
  }

  private treeSelect( checkedRows?: Array<Type.QualityTable> ) {
    if ( checkedRows && !checkedRows.length ) {
      this.rightTable.loading = false;
      this.rightTable.dataSource = [];
      this.rightTable.total = 0;
      return;
    }
    this.getBizSheetTable( checkedRows );
  }

  private generateQBSCode() {
    const { mainTable, checkedRow } = this;
    if ( mainTable.checkAble ) {
      return checkedRow.map( item => item.qbsCode ).join( ',' );
    } else {
      return mainTable.currentRow?.qbsCode;
    }
  }

  private async goForm( record: Type.QualityQBS, mark: string) {
    const { schemaCode, sheetCode,bizObjId, workFlowCode } = record;
    const { currentRow } = this.mainTable, { projectCode, projectConfig } = this;
    const urlProjectCode = projectCode;
    const urlProjectName = projectConfig?.projectName;
    const urlAction = mark==='edit' ? 'detail' : 'add';
    let urlReturn = `/${ urlProjectCode }/QualityDB?code=${ schemaCode }&openMode&pcUrl&queryCode=&iframeAction=${ urlAction }`;
    if(this.isDingTalk) {
      urlReturn = `${this.$route.fullPath}&iframeAction=${ urlAction }`
    }
    let url = `/form/detail?schemaCode=${ schemaCode }&sheetCode=${ schemaCode }&queryCode=${ schemaCode }&qbsCode=${ this.generateQBSCode() }&projectName=${ urlProjectName }`;
    if(workFlowCode) {
      url += `&startWorkflowCode=${ workFlowCode }&return=${ encodeURIComponent( urlReturn ) }`;
    }else {
      url += `&return=${ encodeURIComponent( urlReturn ) }`;
    }
    let urlDetail = '';
    if ( bizObjId ) {
      const target = await Api.getWorkFlowFormDetailUrl( {
        schemaCode,
        bizObjectId: bizObjId as string
      } ) as string;
     urlDetail = `${ target }&qbsCode=${ this.generateQBSCode() }&return=${ encodeURIComponent( urlReturn ) }`;
    }
    if(this.isDingTalk) {
      mark==='edit'?this.$router.push(urlDetail):this.$router.push(url)
    }else {
      window.open( mark === 'edit' ? `/${ urlProjectCode }${urlDetail}` : `/${ urlProjectCode }${url}` );
    }
  }

  private async go2View( record: Type.QualityQBS, mark: string) {
    console.log( 'record===>', record );
    const { schemaCode, sheetCode, datas, workFlowCode } = record;
    const { currentRow } = this.mainTable, { projectCode, projectConfig } = this;
    const urlProjectCode = projectCode;
    const urlProjectName = projectConfig?.projectName;
    const urlAction = datas?.[0].bizObjId ? 'detail' : 'add';
    const urlReturn = `/${ urlProjectCode }/QualityDB?code=${ schemaCode }&openMode&pcUrl&queryCode=&iframeAction=${ urlAction }`;
    let url = `/${ urlProjectCode }/form/detail?schemaCode=${ schemaCode }&sheetCode=${ schemaCode }&queryCode=${ schemaCode }&qbsCode=${ this.generateQBSCode() }&projectName=${ urlProjectName }`;
    let urlDetail = `/${ urlProjectCode }/form/detail?sheetCode=${ schemaCode }&objectId=${ datas?.[0].bizObjId }&schemaCode=${ schemaCode }&qbsCode=${ this.generateQBSCode() }&isWorkFlow=false&return=${ encodeURIComponent( urlReturn ) }`;
    if ( workFlowCode ) {
      url += `&startWorkflowCode=${ workFlowCode }&return=${ encodeURIComponent( urlReturn ) }`;
      if ( datas?.[0].bizObjId ) {
        const target = await Api.getWorkFlowFormDetailUrl( {
          schemaCode,
          bizObjectId: datas?.[0].bizObjId as string
        } ) as string;
        urlDetail = `/${ urlProjectCode }${ target }`;
      }
    } else {
      url += `&return=${ encodeURIComponent( urlReturn ) }`;
    }
    if(this.isDingTalk) {
      mark==='view'?this.$router.push(urlDetail):this.$router.push(url)
    }else {
    window.open( mark === 'view' ? urlDetail : url );
    }
  }

  private renderOptionsColumn( text: string, record: Type.QualityQBS, locale: typeof ZhCNEx ): JSX.Element {
    const { goForm,validate,mainTable} = this;
    const viewHtml =  (<div class={Class.optionColumn}  style={{cursor: validate===true && mainTable.currentRow?.progressState===0 || mainTable.currentRow?.done ? 'not-allowed': 'point'}}>
      <span class={validate===true && mainTable.currentRow?.progressState===0 || mainTable.currentRow?.done?Class.disabled:''}>
         <span class={Class.go2View} aria-role={'tdCell'}
               onClick={() => goForm(record, 'add')}
              >{locale?.Common.Action.add}</span>
      </span>
    </div>)
   return viewHtml;
    // console.log( 'renderOptionsColumn', text, record, locale, this.mainTable.currentRow )
    // const { go2View, validate, mainTable } = this;
    // const editHtml = (
    //   <div class={ Class.optionColumn }>
    //     <span class={Class.go2View} aria-role={'tdCell'}
    //           onClick={ () => go2View( record, 'edit' ) }>{ locale?.Common.Table.goToEdit }</span>
    //   </div>
    // )
    // const viewHtml = (
    //   <div class={ Class.optionColumn }>
    //     <span class={Class.go2View} aria-role={'tdCell'}
    //           onClick={ () => go2View( record, 'view' ) }>{ locale?.Common.Table.goToView }</span>
    //   </div>
    // )
    // const noClickHtml = (
    //   <div class={ Class.optionColumn }>
    //     <span class={ Class.noClick } aria-role={ 'tdCell' }
    //     >{ locale?.Common.Table.noClick }</span>
    //   </div>
    // )
    // console.log( "goto", record.status, mainTable.currentRow?.progressState, validate );
    // if ( !record.datas ) {
    //   return editHtml;
    // } else if ( record.datas[0].status !== '未填报' ) {
    //   return viewHtml;
    // } else {
    //   return editHtml;
    // }
    /*if ( record.status !== '未填报' ) {
      return viewHtml;
    } else if ( validate && mainTable?.currentRow?.progressState === '未完成' ) {
      return noClickHtml;
    }
    return editHtml;*/
  }

  private renderWorkFlowState( text: string, record: Type.QualityTable, locale: typeof ZhCNEx ): JSX.Element | Array<JSX.Element> {
    const vNode: Array<JSX.Element> = [];
    if ( record.datas?.[0].status ) {
      switch ( record.datas[0].status ) {
        case '未填报':
          vNode.push(
            <span aria-role={ 'tdCell' } class={ Class.undo }>{ record.datas[0].status }</span> );
          break;
        case '审核中':
          vNode.push(
            <span aria-role={ 'tdCell' } class={ Class.doing }>{ record.datas[0].status }</span> );
          break;
        case '已归档':
          vNode.push(
            <span aria-role={ 'tdCell' } class={ Class.done }>{ record.datas[0].status }</span> );
          break;
      }
    }
    return vNode;
  }

  private previewAccessory( data: Type.QualityAttachment ) {
    const { previewUrl, name } = data;
    window.open( previewUrl );
    //window.open( `https://cloudpivotkkfileview.wisdombim.com.cn/onlinePreview?url=${ previewUrl }&name=${ name }` );
  }

  private downloadAccessory( url: string ) {
    window.open( url );
  }

  private renderAccessoryColumn( text: string, record: Type.QualityTable, locale: typeof ZhCNEx ): JSX.Element | Array<JSX.Element> {
    const vNdoe: Array<JSX.Element> = [];
    if ( !text  || (text && !text.length) ) return [];
    const { attachments } = record;
    return attachments?.map( item => {
      return (
        <div class={ Class.attachments }>
          <span onClick={ () => this.previewAccessory( item ) }>{ item.name }</span>
          <Icon src={ 'download' } clickEvent={ () => this.downloadAccessory( item.downloadUrl ) }/>
        </div>
      )
    } );
  }

  private getTableColumn( locale?: typeof ZhCNEx ): Array<Type.TableColumn<any> | undefined> {
    if ( !locale ) return [];
    const { projectCode, projectConfig } = this;
    const columns = [
      // {
      //   title: locale.Engineering.code,
      //   dataIndex: 'datas[0].sequenceNo',
      //   ellipsis: true,
      //   key: 'header_0',
      //   width: 100
      // },
      {
        title: locale.Progress.docName,
        dataIndex: 'sheetName',
        ellipsis: true,
        key: 'header_1',
      },
      // {
      //   title: locale.Engineering.prepareDate,
      //   dataIndex: 'datas[0].modifyTime',
      //   key: 'header_2',
      //   width: 120
      // },
      // {
      //   title: locale.Engineering.preparer,
      //   dataIndex: 'datas[0].userName',
      //   key: 'header_3',
      //   width: 80
      // },
      // {
      //   title: locale.Engineering.currentWorkflow,
      //   dataIndex: 'datas[0].status',
      //   key: 'header_4',
      //   width: 100,
      //   customRender: ( t, r ) => this.renderWorkFlowState( t, r, locale )
      // },
      {
        title: '记录数',
        dataIndex: 'dataSizes',
        key: 'dataSizes',
      },
      {
        title: locale.Engineering.optionsFn,
        key: 'header_5',
        customRender: ( t, r ) => this.renderOptionsColumn( t, r, locale )
      }
    ];
    // if ( projectConfig?.simpleQualityFlag ) {
    //   columns.push( {
    //     title: locale.Engineering.Accessory,
    //     dataIndex: '',
    //     key: 'header_6',
    //     width: 300,
    //     customRender: ( t, r ) => <span
    //       class={ Class.attachmentsRow }>{ this.renderAccessoryColumn( t, r, locale ) }</span>
    //   } );
    // }
    return columns;
  }

  private expandedRowRender( record:any,locale?: typeof ZhCNEx ) {
    if ( !locale ) return [];
    const { projectConfig } = this;
    const columns = [
      {
        title:'记录号',
        dataIndex: 'sequenceNo',
        ellipsis: true,
        key: 'sequenceNo',
        width: 140
      },
      {
        title: '部位名称',
        dataIndex: 'sheetName',
        ellipsis: true,
        key: 'sheetName',
        // width: 170
      },
      {
        title: '日期',
        dataIndex: 'modifyTime',
        key: 'modifyTime',
        width: 180
      },
      {
        title: '填报人',
        dataIndex: 'userName',
        key: 'userName',
        width: 80
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        customRender: ( t, row ) => {
          return [<span class={row.status==='已归档'?Class.done:row.status==='审核中'?Class.doing:Class.undo}>{ t }</span>]
        }
      },
      {
        title: '编辑',
        key: 'operate',
        width: 80,
        customRender: ( t, r ) => {
          return [(<div class={Class.optionColumn}>
            <span class={Class.go2View} aria-role={'tdCell'} onClick={() => this.goForm(r, 'edit')}>{locale?.Common.Action.view}</span>
          </div>)]
        }
      }
    ];
    if ( projectConfig?.simpleQualityFlag ) {
      columns.push( {
        title: locale.Engineering.Accessory,
        dataIndex: 'attachments',
        key: 'header_6',
        width: 250,
        // @ts-ignore
        customRender: ( t, r ) => <span
          class={ Class.attachmentsRow }>{ this.renderAccessoryColumn( t, r, locale ) }</span>
      } );
    }
    return <Table scroll={{ y:200 }} columns={columns} class={ Class.table_sty } dataSource={record.datas} pagination={false}/>
  }

  private paginationChange( page: number, pageSize: number ) {
    const { checkedRow } = this;
    this.rightTable.current = page;
    this.$nextTick().then( () => {
      this.getBizSheetTable( checkedRow.length ? checkedRow : undefined, page );
    } );
  }

  private tableLazyLoad( { row }: { row: Type.QualityTable } ) {
    const { id } = row, {
      treeStructureAdapter,
      mainTable,
      projectCode,
      projectConfig
    } = this;
    if ( !id ) return;
    return new Promise( resolve => {
      Api.getQBSTree( {
        appCode: projectCode as string,//projectCode
        projectName: projectConfig?.projectName as string,//projectName
        //nodeId: id,
        qbsId: id,
        name: mainTable.conditions ?? undefined,
        flag: true,
        status: mainTable.status?? undefined
      } ).then( res => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        if ( res.data ) resolve( treeStructureAdapter( res.data ) )
      } )
    } );
  }

  private static getCheckFn( { row }: { row: Type.QualityTable } ) {
    // return !isEmpty( row.jbsId );
    return !!row.jbs.length
  }

  private judgeCheckble( row ) {
    const { checkedRow } = this;
    const target = checkedRow[0].jbs.map( item => {
      return {
        jbsId: item.jbsId,
        jbsCode: item.jbsCode
      }
    } );
    const sample = row.jbs.map( item => {
      return {
        jbsId: item.jbs,
        jbsCode: item.jbsCode
      }
    } );
    return isEqual( target, sample );
  }

  private checkBoxChange(
    {
      records,
      row,
      checked
    }: { records: Array<Type.QualityTable>, row: Type.QualityTable, checked: boolean }
  ) {
    console.log( 'records', records, row );
    const { checkedRow, locale } = this;
    if ( !checkedRow.length ) {
      this.checkedRow = records;
      this.MainTable?.setCheckboxRow( row, checked );
    } else if ( checked ) {
      const standard = checkedRow[0].jbsId;
      /*if ( row.jbsId !== standard ) {*/
      if ( !this.judgeCheckble( row ) ) {
        this.$message.error( locale?.Engineering.batchFillTypeError as string );
        this.MainTable?.setCheckboxRow( row, false );
      } else {
        this.checkedRow = records;
      }
    } else if ( !checked ) {
      console.log( checkedRow, records );
      this.checkedRow = records;
    }
    this.$nextTick().then( () => {
      this.treeSelect( this.checkedRow );
    } )
  }

  private calcContentHeight() {
    const { TreeContainer, TreeNav } = this;
    if ( !TreeContainer || !TreeNav ) return;
    const
      containerH = TreeContainer.getClientRects()[0].height - 44,
      navH = TreeNav.getClientRects()[0].height + 10;
    this.maxHeight = containerH - navH;
  }

  private getModuleConfig() {
    const { projectCode, projectConfig } = this;
    return Api.getModuleConfig( {
      appCode: projectCode as string,//projectCode
      projectName: projectConfig?.projectName as string,//projectName
      moduleCode: 'quality'
    } ).then( res => {
      if ( res.errcode === 0 ) return this.validate = res.data;
    } )
  }

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

  setFilterStatus(status:null | number) {
    this.mainTable.status = status;
    if(this.validate) {
      this.getQBSTreeComplete()?.then(() => this.setAllTreeExpanded() )
    }else {
      this.searchMainTable();
    }
  }

  qbDone() {
    axios.put(
      env.apiHost + "/api/quality/v2/qbs/complete" + '?qbsId=' + this.mainTable.currentRow?.id
    ).then((res)=> {
      // @ts-ignore
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.$message.success('质检完成');
      this.searchMainTable()
    });
  }

  mounted() {
    if(this.projectConfig?.projectKey) {
      this.socket = new Websocket();
      this.socket.initWebsocket(this.projectConfig?.projectKey.split('-')[0],'qualityDB',this.init)
    }else {
      this.init()
    }
  }

  init() {
    const { calcContentHeight } = this;
    this.calcContentHeight();
    this.getModuleConfig().then(()=> {
      if(this.validate) {
        this.getQBSTreeComplete()?.then(() => this.setAllTreeExpanded() )
      }else {
        this.getQBSTree()?.then( () => this.setAllTreeExpanded() );
      }
      setTimeout(()=> {
        !this.mainTable.currentRow?'' : this.tableSelected({row:this.mainTable.currentRow})
      },500)
    });
    window.addEventListener( 'resize', calcContentHeight );
  }

  destroyed() {
    const { calcContentHeight } = this;
    this.socket.close();
    window.removeEventListener( 'resize', calcContentHeight );
  }

  render() {
    const {
      locale,
      searchParts,
      searchMainTable,
      mainTable,
      rightTable,
      getTableColumn,
      paginationChange,
      expandedRowRender,
      validate
    } = this;
    const tips = (
      <div class={Class.tips}>
        <span>部位名称(已验收/总验收)施工进度状态</span>
        <br/>
        <span>黑色</span>
        <span>:无表单,</span>
        <span class={Class.red}>红色</span>
        <span>:未填报,</span>
        <span class={Class.org}>黄色</span>
        <span>:进行中,</span>
        <span class={Class.gre}>绿色</span>
        <span>:已完成</span>
      </div>)

    return (
      <article class={ Class.main }>
        <nav class={ Class.nav }>
          <Icon src={ 'goBack' } class={ Class.goBack } clickEvent={ () => this.$router.go( -1 ) }/>
          <span>{ locale?.Engineering.qualityDB }</span>
        </nav>
        <main class={ Class.qbsMainContainer }>
          <section class={ Class.container }>
            <nav>
              <span>{ locale?.Engineering.qbsTree }</span>
            </nav>
            <article ref={ 'TreeContainer' }>
              <nav ref={ 'TreeNav' } class={ Class.mainTableOptionNav }>
                {!validate?<Input.Search
                  class={ Class.searchInput }
                  placeholder={ locale?.Engineering.searchPlaceHolder }
                  loading={ searchParts }
                  v-model={ mainTable.conditions }
                  enterButton
                  onSearch={ searchMainTable }
                />:''}
                <div class={ Class.batchFillBtn } onClick={ this.enableChecked }>
                  <Icon src={ 'commonEdit' }/>
                  <span>{ locale?.Engineering.batchFill }</span>
                  <Popover content={tips} class={Class.help}>
                    <Icon src={'help'}/>
                  </Popover>
                </div>
                {!validate?<Tooltip placement={'right'} overlayClassName={Class.filterContainer}
                                   title={this.getFilterTip(locale as typeof ZhCNEx,mainTable.status)}>
                  <div class={Class.icon}>
                    <Icon src={'filter'}/>
                  </div>
                </Tooltip>:''}
              </nav>
              <main class={ Class.qbsTree }>
                {!validate?<vxe-virtual-tree
                  size={ 'mini' }
                  border={ true }
                  resizable={ true }
                  showOverflow={ true }
                  rowKey={ true }
                  highlightCurrentRow={ true }
                  ref={ 'MainTable' }
                  rowId={ 'id' }
                  loading={ mainTable.loading }
                  data={ mainTable.dataSource }
                  columns={ this.vxTreeColumns( locale, mainTable.checkAble ) }
                  treeConfig={ {
                    lazy: true,
                    children: mainTable.treeField,
                    hasChild: mainTable.hasChild,
                    loadMethod: this.tableLazyLoad,
                  } }
                  checkboxConfig={ {
                    checkField: 'checked',
                    halfField: 'indeterminate',
                    showHeader: false,
                    checkMethod: QualityDB.getCheckFn,
                    checkStrictly: true
                  } }
                  height={ this.maxHeight }
                  { ...{
                    on: {
                      'current-change': this.tableSelected,
                      'checkbox-change': this.checkBoxChange,
                      'cell-dblclick': this.cellClick
                    }
                  } }
                />: <vxe-virtual-tree
                  size={ 'mini' }
                  border={ true }
                  resizable={ true }
                  showOverflow={ true }
                  rowKey={ true }
                  highlightCurrentRow={ true }
                  ref={ 'MainTable' }
                  rowId={ 'id' }
                  loading={ mainTable.loading }
                  data={ mainTable.dataSource }
                  columns={ this.vxTreeColumns( locale, mainTable.checkAble ) }
                  treeConfig={ {
                    lazy: false,
                    children: mainTable.treeField,
                    hasChild: mainTable.hasChild,
                  } }
                  checkboxConfig={ {
                    checkField: 'checked',
                    halfField: 'indeterminate',
                    showHeader: false,
                    checkMethod: QualityDB.getCheckFn,
                    checkStrictly: true
                  } }
                  height={ this.maxHeight }
                  { ...{
                    on: {
                      'current-change': this.tableSelected,
                      'checkbox-change': this.checkBoxChange,
                      'cell-dblclick': this.cellClick
                    }
                  } }
                />}
              </main>
            </article>
          </section>
          <section class={ Class.container }>
            <nav class={Class.tbNav}>
              <span>{ locale?.Engineering.fileDB }</span>
            </nav>
            <article>
              <nav class={Class.btnFinish}>
                <span></span>
                <Button size={'small'} type={'primary'} disabled={!mainTable.currentRow || mainTable.currentRow?.done} onClick={()=> { this.qbDone()}}>{ locale?.Engineering.QBDone }</Button>
              </nav>
              <Table
                // size={'small'}
                bordered
                class={ Class.table }
                loading={ rightTable.loading }
                rowKey={ 'id' }
                columns={ getTableColumn( locale ) }
                dataSource={ rightTable.dataSource }
                expandedRowRender={record=> expandedRowRender(record,locale)}
                pagination={ {
                  position: 'bottom',
                  total: rightTable.total,
                  onChange: paginationChange
                } }
                defaultExpandAllRows={true}
                key={this.num}
              />
            </article>
          </section>
        </main>
      </article>
    );
  }
}
