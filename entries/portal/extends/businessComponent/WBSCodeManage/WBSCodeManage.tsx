import { Component, InjectReactive, Prop, Vue, Watch } from "vue-property-decorator";
import Class from './WBSCodeManage.module.less';
import * as tsx from 'vue-tsx-support';
import { getMBSBottom, getMBSChild, getMBSTop } from "../../service/api";
import { TableColumn as TableColumnType, AggregationTable, WBSreport } from "../../type";

import Table from 'element-ui/lib/table';
import TableColumn from "element-ui/lib/table-column";
import 'element-ui/lib/theme-chalk/index.css';
import type { TableColumn as elTableColumn } from 'element-ui/types/table-column';
import { Button, Input } from '@h3/antd-vue';
import { MergeWBSStructure } from '../../construction';
import omit from 'omit.js';
import Utils from "../../utils";
import { GanttClass } from '@ctesi/component';
import * as Type from '../../type';

import * as ATable from 'ant-design-vue/lib/table/Table';
import 'ant-design-vue/lib/table/style/index.css';

import Inputs from "element-ui/lib/input";

import axios from "axios";
import env from "@/config/env";
interface reduceWork {
  [propsName: string]: boolean
}

interface CommonTableColumn<T> extends Omit<TableColumnType<T>, 'type'>, elTableColumn {
}

@Component( {
  name: 'WBSCodeMange',
  components: {
    ETable: Table,
    ETableColumn: TableColumn,
    AButton: Button,
    AInput: Input,
    ElInput: Inputs,
  }
} )
export default class WBSCodeManage extends Vue {

  _tsx!: tsx.DeclareProps<Pick<WBSCodeManage, 'logId' | 'leftColumn' | 'rightColumn' | 'rightTableData' | 'closeModal' | 'ganttRef' | 'withWBS' | 'bsRemoveFn'>>

  @InjectReactive( 'project' ) projectCode?: string;
  @InjectReactive( 'projectConfig' ) projectConfig?: Type.ProjectConfig;

  @Prop() logId?: number | string;
  @Prop() leftColumn?: Array<TableColumnType<unknown>>;
  @Prop() rightColumn?: Array<TableColumnType<unknown>>;
  @Prop() rightTableData?: Array<unknown>;
  @Prop() closeModal?: Function;
  @Prop() withWBS?: any;
  @Prop() ganttRef?: any;
  @Prop() bsRemoveFn?: Function;

  private rightTableSelection: Array<string> = [];

  private saveLoading: boolean = false;

  private delLoading: boolean = false;

  private mainTablePageConfig: AggregationTable<GanttClass.GanttTask<Type.WBSNdMBS>, GanttClass.GanttTask<Type.WBSNdMBS>> = {
    leftDataSource: [],
    rightDataSource: []
  }

  private temporaryOperationData: AggregationTable<GanttClass.GanttTask<Type.WBSNdMBS>, GanttClass.GanttTask<Type.WBSNdMBS>> = {
    rightDataSource: [],
    rightTempData: []
  }

  private mouseDown: boolean = false;

  private cursorRef: number | null = null;

  private mouseDistance: number = 0;

  private dragging: boolean | null = null;

  private selectionRow: Array<GanttClass.GanttTask<Type.WBSNdMBS>> | null = null;

  private editTd: NodeList | null = null;

  private showBatchBtn: boolean = false;

  private batchAmount: number = 0;
  private batchMoney: number = 0;

  private pageSize: string = "";
  private tableKeyword: string = "";

  private tableBackups: Array<any> = [];

  private LeftTableColumn: Array<TableColumnType<WBSreport>> = [
    // {
    //   title: '序号',
    //   dataIndex: 'NonexistentData',
    //   key: 'header_1',
    //   type: 'index',
    //   width:55
    // },
    {
      title: '编码',
      // dataIndex: 'wbs',
      dataIndex: 'codeValue',
      key: 'id',
      // render: this.renderCode,
      width: 200
    },
    {
      title: '任务名称',
      // dataIndex: 'plandetailname',
      dataIndex: 'nodeName',
      key: 'wbs'
    }
  ]

  private RightTableColumn: Array<TableColumnType<WBSreport>> = [
    {
      title: '编码',
      // dataIndex: 'reportwbs',
      dataIndex: 'bs',
      key: 'header_0',
      //width: 100,
    },
    {
      title: '名称',
      // dataIndex: 'worknamewbs',
      dataIndex: 'Name',
      key: 'header_1',
      //width: 100,
    },
    /*{
      title: '子计划开始',
      // dataIndex: 'plandetailstart',
      dataIndex:'Start',
      key: 'header_99',
      width: 110,
    },
    {
      title: '子计划结束',
      // dataIndex: 'plandetailend',
      dataIndex:'End',
      key: 'header_98',
      width: 110,
    },
    {
      title: '子计划工期',
      // dataIndex: 'planedTimeLimit',
      dataIndex:'Duration',
      key: 'header_97',
      width: 110,
      render: this.renderWorkTL
    },
    {
      title: '单位',
      // dataIndex: 'metricwbs',
      dataIndex:'planDetailUnit',
      key: 'header_3',
      //width: 80,
    },
    {
      title: '单价',
      // dataIndex: 'unitpricewbs',
      dataIndex:'planDetailUnitPrice',
      key: 'header_5',
    },
    {
      title: '计划数量',
      // dataIndex: 'planamountwbs',
      dataIndex:'planDetailAmount',
      key: 'header_6',
    },
    {
      title: '计划产值',
      // dataIndex: 'planmoneywbs',
      dataIndex:'planDetailMoney',
      key: 'header_7',
    },
    {
      title: '填报数量',
      dataIndex: 'reportamountwbs',
      key: 'header_8',
      editCmpnt: 'input'
    },
    {
      title: '填报产值',
      dataIndex: 'reportmoneywbs',
      key: 'header_9',
      editCmpnt: 'input'
    }*/
  ]

  private action: 'add' | 'delete' | null = null;

  @Watch( 'withWBS', { immediate: true } )
  withWBSListener( tasks ) {
    if ( tasks.children ) {
      this.action = 'add';
      this.mainTablePageConfig.rightDataSource = tasks.children.concat( [] );
      this.$nextTick().then( () => {
        this.action = null;
      } )
    }
  }

  mounted() {
    const { logId, rightTableData } = this.$props, { $refs } = this;
    // getMBSTop( { projectCode: this.projectCode } ).then( res => {
    //   if ( res.errcode !== 0 ) this.$message.error( res.errmsg as string );
    //   this.mainTablePageConfig.leftDataSource = res.data;
    // } );
    axios.get(env.apiHost + "/api/code_mbs/top_tree_list", {
      params: {
        projectCode: this.projectCode,
        projectName: this.projectConfig?.projectName,
      },
    }).then(res=>{
      this.mainTablePageConfig.leftDataSource = res.data;
      this.tableBackups = res.data;
    })
    if ( rightTableData ) {
      console.log( 'rightTableData', rightTableData );
      try {
        this.mainTablePageConfig.rightDataSource = JSON.parse( JSON.stringify( rightTableData ) );
      } catch ( e ) {
        console.error( 'parse RightDataSource Error ====>', e );
      }
    }
    if ( $refs ) {
      this.cursorRef = (this.$refs.cursor as HTMLElement).offsetLeft;
      this.$nextTick( () => {
        (this.$refs.tableContentLeft as HTMLElement).style.display = 'flex';
        (this.$refs.tableContentRight as HTMLElement).style.display = 'flex';
      } )
    }
  }

  render() {
    const {
        mainTablePageConfig,
        LeftTableColumn,
        RightTableColumn,
        generateColumn,
        regNumber,
        onTableSelectionChange,
        wbsDBClick,
        wbsCtxMenu,
        rowClassName,
        lazyLoad,
        mouseDown,
        setLeftTableWidth,
        showBatchBtn,
        rightTableSelection,
        saveLoading
      } = this,
      { leftDataSource, rightDataSource } = mainTablePageConfig;
    return (
      <article
        class={ Class.main }
        onContextmenu={ ( e: MouseEvent ) => {
          e.preventDefault();
        } }
        onMousemove={ ( e: MouseEvent ) => {
          if ( !mouseDown ) return;
          this.dragging = true;
          const standards: number = this.cursorRef as number;
          const distance = e.clientX - standards;
          this.mouseDistance = distance;
        } }
        onMouseup={ ( e: MouseEvent ) => {
          if ( !this.dragging ) return;
          this.mouseDown = false;
          this.cursorRef = e.clientX;
          setLeftTableWidth();
          this.dragging = false;
        } }
      >
        <main ref={ 'tableContentLeft' } class={ Class.tableContent }>
          <e-table
            ref={ 'tableLeft' }
            data={ leftDataSource }
            height="750"
            border={ true }
            style="width: 100%"
            rowKey='id'
            lazy
            load={ lazyLoad }
            treeProps={ { children: 'children', hasChildren: 'childCount' } }
            { ...{
              on: {
                'row-dblclick': wbsDBClick,
                'row-contextmenu': wbsCtxMenu,
              }
            } }
          >
            { generateColumn( LeftTableColumn, 'left' ) }
          </e-table>
        </main>
        <div
          ref={ 'cursor' }
          class={ Class.dragLine }
          onMousedown={ ( e: MouseEvent ) => {
            this.mouseDown = true;
            this.cursorRef = e.clientX;
          } }
          onMouseup={ ( e: MouseEvent ) => {
            this.mouseDown = false;
            this.cursorRef = e.clientX;
            setLeftTableWidth();
            this.dragging = false;
          } }
        />
        <main ref={ 'tableContentRight' } class={ Class.tableContentRight }>
          <nav class={ Class.optPanel }>
            <span>新增选择表</span>
            <aside>
              <a-button loading={ saveLoading } onClick={ this.save }>确认选择</a-button>
              <a-button loading={ this.delLoading } onClick={ this.delete }>删除</a-button>
              <a-button onClick={ this.close }>关闭</a-button>
              <el-input v-model={ this.tableKeyword } onInput={this.searchTable}/>
              {/*<a-button onClick={this.batchOpt}>批量设置</a-button>*/ }
              <div class={ `${ Class.batchOperation } ${ showBatchBtn && Class.out || Class.in }` }>
                <span>批量填报数量：</span>
                <a-input onBlur={ ( e ) => this.regNumber( e, 'batchAmount' ) }
                         value={ this.batchAmount }
                         onChange={ ( e ) => this.batchAmount = e.currentTarget.value }/>
                <span>批量填报产值：</span>
                <a-input onBlur={ ( e ) => this.regNumber( e, 'batchMoney' ) }
                         value={ this.batchMoney }
                         onChange={ ( e ) => this.batchMoney = e.currentTarget.value }/>
                {/*<a-button onClick={this.batchInput}>确定设置</a-button>*/ }
              </div>
            </aside>
          </nav>
          <ATable.default
            rowKey={ 'ID' }
            ref={ 'tableRight' }
            rowSelection={ {
              // hideDefaultSelections: true,
              // type: 'radio',
              selectedRowKeys: rightTableSelection,
              onChange: onTableSelectionChange
            } }
            columns={ RightTableColumn }
            dataSource={ rightDataSource }
            scroll={ {y: 560} }
            pagination={ { 
              pageSize: this.pageSize,
              pageSizeOptions: [ '10', '50', '100' ],
              showSizeChanger: true,
            } }
          />
          {/* <e-table
            ref={'tableRight'}
            data={rightDataSource}
            height="750"
            border={true}
            style="width: 100%"
            rowKey='id'
            rowClassName={rowClassName}
            {...{
              on: {
                'selection-change': onTableSelectionChange,
              }
            }}
          >
            {generateColumn(RightTableColumn, 'right', true, true)}
          </e-table>*/ }
        </main>
      </article>
    );
  }

  private removeOrActive( nodes: NodeList, way: 'active' | 'passive' ): void {
    if ( !nodes ) return;
    switch ( way ) {
      case "active":
        (nodes[0] as HTMLElement).style.display = 'none';
        (nodes[1] as HTMLElement).style.display = 'flex';
        (nodes[1] as HTMLElement).focus();
        break;
      case "passive":
        (nodes[0] as HTMLElement).style.display = 'flex';
        (nodes[1] as HTMLElement).style.display = 'none';
        break;
    }
  }

  //find extraProperty
  private findExtra<T>( key: string, tableColumn: Array<TableColumnType<T>> ): TableColumnType<T> | undefined {
    if ( !tableColumn ) return;
    const target = tableColumn.find( ( item ) => item.dataIndex === key );
    return target;
  }

  private columnRender<T>( {
                             column,
                             row,
                             $index,
                             targetColumn
                           }: { column: CommonTableColumn<T>, row: WBSreport, $index: number, targetColumn: Array<TableColumnType<T>> } ): JSX.Element {
    if ( !targetColumn ) return (<div></div>);
    const
      { findExtra, removeOrActive, editTd } = this,
      dataIndex: string = column.property,
      extraProperty: TableColumnType<T> = findExtra<T>( dataIndex, targetColumn ) as TableColumnType<T>,
      Pointer: string = typeof extraProperty?.editCmpnt === "function" ? Class.pointer : '';
    if ( extraProperty.render ) return extraProperty.render( column, row, $index );
    return (
      <div onDblclick={ ( e ) => {
        if ( editTd ) removeOrActive( editTd, 'passive' );
        if ( extraProperty?.editCmpnt !== 'input' ) return;
        const targetTd: NodeList = (e.currentTarget as HTMLElement).childNodes;
        this.editTd = targetTd;
        removeOrActive( targetTd, 'active' );
      } }>
        <span>{ row[dataIndex] }{ extraProperty?.unit }</span>
        {
          extraProperty?.editCmpnt === 'input' &&
          <a-input
            class={ `${ Class.tdInput } ${ Class.hide }` }
            value={ row[dataIndex] }
            maxLength={ 25 }
            onChange={ ( e ) => {
              row[dataIndex] = e.currentTarget.value;
              row.edited = true;
              console.log( 'afterEdit', row );
            } }
            onBlur={ ( e ) => {
              const reg = Utils.isAmount( e.currentTarget.value );
              if ( !reg ) {
                row[dataIndex] = 0;
              } else {
                row[dataIndex] = reg;
              }
              removeOrActive( editTd as NodeList, 'passive' );
            } }
          />
        }
      </div>
    )
  }

  private columnLeftRender( {
                              column,
                              row,
                              $index
                            }: { column: CommonTableColumn<WBSreport>, row: WBSreport, $index: number } ): JSX.Element {
    const { columnRender, LeftTableColumn } = this;
    return columnRender<WBSreport>( {
      column: column,
      row: row,
      $index: $index,
      targetColumn: LeftTableColumn
    } );
  }

  private columnRightRender( {
                               column,
                               row,
                               $index
                             }: { column: CommonTableColumn<WBSreport>, row: WBSreport, $index: number } ): JSX.Element {
    const { columnRender, RightTableColumn } = this;
    return columnRender<WBSreport>( {
      column: column,
      row: row,
      $index: $index,
      targetColumn: RightTableColumn
    } );
  }

  private generateColumn( columns: Array<TableColumnType<WBSreport>>, way: 'left' | 'right', index?: boolean, check?: boolean ): Array<JSX.Element> {
    const vDom: Array<JSX.Element> = [], { columnLeftRender, columnRightRender } = this;
    let renderFunc: Function | null = null;
    switch ( way ) {
      case "left":
        renderFunc = columnLeftRender;
        break;
      case "right":
        renderFunc = columnRightRender;
        break;
      default:
        renderFunc = columnLeftRender;
        break;
    }
    if ( columns.length < 1 ) return vDom;
    columns.forEach( ( item ) => {
      vDom.push(
        <e-table-column
          type={ item.type }
          // index={item.indexFunc}
          width={ `${ item.width }` }
          prop={ item.dataIndex }
          label={ item.title }
          className={ Class.bodyCell }
          scopedSlots={ {
            default: !item.render && renderFunc || item.render,
          } }
        />
      )
    } );
    if ( index ) {
      vDom.unshift(
        <e-table-column
          type="index"
          width="55"
          label={ '序号' }
          index={ i => i + 1 }
        />
      )
    }
    if ( check ) {
      vDom.unshift(
        <e-table-column
          type="selection"
          width="55"
          labelClassName={ Class.checkBox }
          className={ Class.checkCell }
        />
      )
    }
    return vDom;
  }

  private onTableSelectionChange( selection: Array<string> ): void {
    console.log( 'selectionRow', selection );
    this.rightTableSelection = selection;
    //this.selectionRow = selection;
    if ( !selection.length ) this.showBatchBtn = false;
  }

  private wbsDBClick( row: GanttClass.GanttTask<Type.WBSNdMBS>, column?: CommonTableColumn<GanttClass.GanttTask<Type.WBSNdMBS>>, $index?: number, rightClick?: boolean ) {
    if ( row.childCount && !rightClick ) return this.$message.warn( '请使用右键添加' );
    const { rightDataSource: rightTemp } = this.temporaryOperationData, { rightDataSource: rightOrigin } = this.mainTablePageConfig;
    if ( rightOrigin?.find( item => item.Name === row.taskName ) ) return;
    /* new Task Add */
    const ganttInstance = this.ganttRef.ganttInstance as GanttClass.GanttType<any>;
    const addTask = ganttInstance.newTask();
    addTask.bs = row.codeValue;
    addTask.ID = row.id;
    addTask.Name = row.taskName;
    addTask.codeType = 'MBS';
    addTask.id = row.id;
    addTask.ta01CodeFk = row.id;
    addTask.edited = true;
    addTask.tempData = true;
    if ( rightOrigin?.find( item => item.Name === addTask.Name ) ) return;
    rightOrigin?.push( addTask );
    //@ts-ignore
    this.mainTablePageConfig.rightDataSource = rightOrigin?.concat( [] );
    //@ts-ignore
    this.tableBackups =  this.mainTablePageConfig.rightDataSource
  }

  private wbsCtxMenu( row: GanttClass.GanttTask<Type.WBSNdMBS>, column: CommonTableColumn<GanttClass.GanttTask<Type.WBSNdMBS>>, $index: number ) {
    console.log(row);
    
    const { leftDataSource, rightDataSource } = this.mainTablePageConfig, { id } = row;
    const rightForce = [];
    getMBSBottom( { currentId: (id as string), projectCode: this.projectCode } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      // res.data?.forEach(item => this.wbsDBClick(item, undefined, undefined, true))
      res.data?.forEach( item => {
        if ( rightDataSource?.find( dataItem => dataItem.Name === item.taskName ) ) return;
        const ganttInstance = this.ganttRef.ganttInstance as GanttClass.GanttType<any>;
        const addTask = ganttInstance.newTask();
        addTask.bs = item.codeValue;
        addTask.ID = item.id;
        addTask.Name = item.taskName;
        addTask.codeType = 'MBS';
        addTask.id = item.id;
        addTask.ta01CodeFk = item.id;
        addTask.edited = true;
        addTask.tempData = true;
        // @ts-ignore
        // rightForce.push( addTask );
        this.mainTablePageConfig.rightDataSource.push(addTask);
        //@ts-ignore
        this.tableBackups =  this.mainTablePageConfig.rightDataSource
      } );
      // console.log( 'rightForce--->', rightForce );
      // this.mainTablePageConfig.rightDataSource = rightForce.concat( [] );
    } )
  }

  private rowClassName( { row, rowIndex }: { row: MergeWBSStructure, rowIndex: number } ): string {
    if ( row.tempData ) return Class.tempRow;
    return '';
  }

  private collectSelectionRows() {
    const { rightTableSelection, mainTablePageConfig } = this;
    const wait2SetSelection = [];
    rightTableSelection.forEach( item => {
      const target = mainTablePageConfig.rightDataSource?.find( row => (row.ID as unknown as string) === item );
      if ( target ) {
        // @ts-ignore
        wait2SetSelection.push( target );
      }
    } );
    console.log( 'wait2SetSelection===>', wait2SetSelection );
    if(sessionStorage.getItem("Start")) {
      wait2SetSelection.forEach(e => {
        // @ts-ignore
        e.Finish = sessionStorage.getItem("Finish")
        // @ts-ignore
        e.Start = sessionStorage.getItem("Start")
      });
    }
    this.selectionRow = wait2SetSelection;
    console.log( 'afterThis===>', this.selectionRow );
  }

  private save(): void {
    if ( this.saveLoading ) return;
    this.saveLoading = true;
    this.collectSelectionRows();
    const { rightDataSource } = this.mainTablePageConfig;
    const { ganttRef, withWBS, selectionRow } = this;
    //Todo: first remove all task
    const childTasks = ganttRef.ganttInstance.getAllChildTasks( withWBS );
    // const childTasksBak = childTasks.concat( [] );
    // const rightDataSourceBak = rightDataSource?.concat( [] );
    ganttRef.ganttInstance.removeTasks( childTasks );
    // if ( selectionRow?.length ) {
    //   const afterDiffSection: Array<GanttClass.GanttTask<Type.WBSNdMBS>> = [];
    //   selectionRow.forEach( item => {
    //     if ( !childTasksBak.find( diffTarget => diffTarget.UID === item.UID ) ) afterDiffSection.push( item );
    //   } );
    //   const argsTasks = childTasksBak.concat( afterDiffSection );
    //   //argsTasks.forEach(item => ganttRef?.ganttInstance.addTask(item, 'add', withWBS));
    //   ganttRef?.ganttInstance.addTasks( argsTasks, 'add', withWBS );
    // } else {
      ganttRef?.ganttInstance.addTasks( rightDataSource, 'add', withWBS );
      // rightDataSourceBak?.forEach(item => {
      //   ganttRef.ganttInstance?.addTask(item, 'add', withWBS);
      // });
    // }
    this.$nextTick().then( () => this.saveLoading = false );
    this.$props.closeModal();
  }

  private delete(): void {
    if ( this.delLoading ) return;
    this.delLoading = true;
    this.collectSelectionRows();
    const { selectionRow, bsRemoveFn, collectSelectionRows } = this;
    if ( !selectionRow?.length ) {
      this.delLoading = false;
      this.$message.warn( '没有选中任何数据' );
    } else {
      const
        dispose = selectionRow.map( ( item ) => {
          return { ...item }
        } ),
        //@ts-ignore
        params = dispose.map( item => omit<GanttClass.GanttTask<Type.WBSNdMBS>, 'cid' | 'edited'>( item, [ 'cid', 'edited' ] ) );
      console.log( '删除数据', params );
      const existRemove: Array<GanttClass.GanttTask<Type.WBSNdMBS>> = [];
      const target: Array<GanttClass.GanttTask<Type.WBSNdMBS>> = [];
      dispose.forEach( item => !item.tempData && existRemove.push( item ) );
      const originCopy = this.mainTablePageConfig.rightDataSource?.concat( [] );
      originCopy?.forEach( originItem => {
        if ( selectionRow.find( deleteRow => deleteRow.Name === originItem.Name ) ) return;
        target.push( originItem );
      } )
      this.mainTablePageConfig.rightDataSource = target;
      this.tableBackups =  this.mainTablePageConfig.rightDataSource
      this.delLoading = false;
      bsRemoveFn?.( existRemove );
    }
  }

  private close(): void {
    this.$props.closeModal();
  }

  private lazyLoad( tree: GanttClass.GanttTask<Type.WBSNdMBS>, treeNode, resolve ): void {
    const { id } = tree;
    // getMBSChild( { id: (id as string), projectCode: this.projectCode } ).then( res => {
    //   if ( res.errcode !== 0 ) this.$message.error( res.errmsg as string );
    //   resolve( res.data );
    // } );
    axios.get(env.apiHost + "/api/code_mbs/child_tree_list", {
        params: {
          projectCode: this.projectCode,
          id: id,
        },
      }).then(res=>{
        //@ts-ignore
        if ( res.errcode !== 0 ) this.$message.error( res.errmsg as string );
        resolve( res.data );
      })
  }

  private setLeftTableWidth() {
    const { mouseDistance } = this;
    const leftWidth = (this.$refs.tableContentLeft as HTMLElement).getClientRects()[0].width;
    (this.$refs.tableContentLeft as HTMLElement).style.width = `${ leftWidth + mouseDistance }px`;
  }

  private regNumber( e, key: string ): void {
    const reg = Utils.isAmount( e.currentTarget.value );
    if ( !reg ) {
      this[key] = 0;
    } else {
      this[key] = reg;
    }
  }

  private searchTable(){
    this.mainTablePageConfig.rightDataSource = this.tableBackups.filter(data => !this.tableKeyword || data.Name.toLowerCase().includes(this.tableKeyword.toLowerCase()));
  }
}
