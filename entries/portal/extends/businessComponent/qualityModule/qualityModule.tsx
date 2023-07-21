/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import { Component, InjectReactive, Ref, Vue, Watch } from 'vue-property-decorator';
import Class from './qualityModule.module.less';
import { ZhCNEx } from "../../locales/zh-CN-ex";
import { Icon, SyncVisualTable } from '@ctesi/component';
import Utils from "../../utils";
import * as Type from '../../type';
import * as Api from '../../service/api';
import QualityTemplate from "./QualityTemplate";
import { Table as VXETable } from "vxe-table";
import VirtualList from 'vue-virtual-scroll-list';

import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index';

import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';

import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';

import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';

import Checkbox from 'ant-design-vue/lib/checkbox';
import 'ant-design-vue/lib/checkbox/style/index.css';

import Radio from 'ant-design-vue/lib/radio';
import 'ant-design-vue/lib/radio/style/index.css';

import Tooltip from "ant-design-vue/lib/tooltip";
import 'ant-design-vue/lib/tooltip/style/index.css';

import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';

interface MainTableType {
  deleteOpt: boolean;
  loading: boolean;
  dataSource: Array<Type.QualityTable>;
  selectRow: Type.QualityTable | null;
  conditions: string | null;
  batch: boolean;
  edit: boolean;
  treeData: Array<any>;
}

interface QBSForm {
  engineeringParts: string | null;
  correspondingCode: string | null;
  dividedCategories: number | null;
  associationMBS: {
    id: string | null;
    mbsCode: string | null;
    name: string | null;
  };
}

interface JBSForm {
  associationJBS: {
    id: string | null;
    jbsCode: string | null;
    name: string | null;
  }
}

interface BizSheet {
  loading: boolean;
  templateLoading: boolean;
  unbind: Array<Type.QualityQBS>;
}

interface JBSTypeModal {
  loading: boolean;
  visible: boolean;
  FirstLevelOptions: Array<Type.JBSBizDTO>;
  FirstLevel: string | null;
  SecondLevelOptions: Array<Type.JBSBizDTO>;
  SecondLevel: string | null;
}

interface MbsStatus<T, V> {
  dataSource: Array<T>;
  modelDataSource: Array<V>;
  loading: boolean;
  mountLoading: boolean;
  checkEnable: boolean;
  checkKeys: Array<string>;
  selectKey: T | null;
  selectRow: T | null;
  conditions: string | null;
  operation: boolean;
}

interface QBSModal {
  edit: boolean;
  level: number | undefined;
  visible: boolean;
  loading: boolean;
  codeValue: string | null;
  taskName: string | null;
  isINSPECTION_LOT: boolean;
  modelTypeId: string | null;
  jbsId: string | null;
  mbsCode: string | null;
  projectOptions: Array<any>;
  projectDefault: string | null;
  structureOptions: Array<any>;
}

interface JBSModal {
  visible: boolean;
  loading: boolean;
  allOptions: Array<any>;
  projectOptions: Array<any>;
  projectDefault: string | null;
  structureOptions: Array<any>;
  structureDefault: string | null;
  processOptions: Array<any>;
  processDefault: string | null;
}

interface JBSNode<T> {
  activeNode: T | null;
  checkedKeys: Array<string>;
  removePanel: boolean;
  dataSource: Array<T>;
  expandKeys: Array<string>;
}

// eslint-disable-next-line no-shadow
enum QBSLevel {
  // CHECK_POINT = -1,
  UNIT_PRO_PROJECT = 0,
  UNIT_PROJECT,
  SUB_UNIT_PROJECT,
  PARTITION_PROJECT,
  SUB_PARTITION_PROJECT,
  ITEM_PROJECT,
  // SUB_ITEM_PROJECT,
  INSPECTION_LOT,
  // MODEL,
  // CHECK_STEP
}

@Component( {
  name: 'qualityModule'
} )
export default class QualityModule extends Vue {

  @InjectReactive( 'project' )
  public projectCode?: string;

  @InjectReactive( 'projectName' )
  public projectName?: string;

  @InjectReactive( 'projectConfig' )
  public projectConfig?: Type.ProjectConfig;

  @InjectReactive( 'locale' )
  public locale?: typeof ZhCNEx;

  @Ref()
  public QBSTree!: SyncVisualTable<Type.QualityTable>;

  @Ref()
  public MBSTree!: SyncVisualTable<any>;

  @Ref()
  public UploadForm!: HTMLFormElement;

  @Ref()
  public ProjectSelector!: Select;

  @Ref()
  public StructureSelector!: Select;

  @Ref()
  public ProcessSelector!: Select;

  @Ref()
  public MainTable?: VXETable;

  @Ref()
  public FileInput?: HTMLElement;

  @Ref()
  public TemplateList?: HTMLElement;

  @Ref()
  public MBSSearch?: Input;

  @Ref()
  public JBSSearch?: Input;

  @Ref()
  public MainContainer?: HTMLElement;

  private qbsImportModalVisible: boolean = false;

  private uploadFile: FormData | null = null;

  private uploadFileProgress: number = 0;

  private uploadFileTimer: number | null = null;

  private uploadLoading: boolean = false;

  private qbsExportModalVisible: boolean = false;

  private JBSTreeConfig = {
    loadedKeys: [],
    expendedKeys: []
  }

  private MBSTreeConfig = {
    loadedKeys: [],
    expendedKeys: []
  }

  private currentRow: Type.QualityTable | null = null;

  private qbsTreeModal: boolean = false;

  private jbsTreeModal: boolean = false;

  private searchParts: boolean = false;

  private editMode: boolean = false;

  private showAdd: boolean = false;

  private showTemplateAdd: boolean = false;

  private qbsSelectedLoading: boolean = false;

  private jbsSelectedLoading: boolean = false;

  private jbsTreeName: string | null = null;

  private cantAddMBS: boolean = true;

  private qbsModalLoading: boolean = false;

  private bindRemoveLoading: boolean = false;

  private oneKeyImportLoading: boolean = false;

  private disabledAdd: boolean = true;

  private treeChild: string = 'childs';

  private condition: string | null = null;

  private templateHeight: number = 0;

  private canAddLevel: number = 0;

  private unbindSelectedKeys: Array<string> = [];

  private selectedRowKeys: Array<string> = [];

  private qbsSelected: Array<string> = [];

  private jbsSelected: Array<string> = [];

  private vxTableTreeExpanded: Array<string> = [];

  private qbsFormModal: QBSForm = {
    //工程部位
    engineeringParts: null,
    //对应编码
    correspondingCode: null,
    //划分分类
    dividedCategories: null,
    //关联MBS
    associationMBS: {
      id: null,
      name: null,
      mbsCode: null
    }
  }

  private jbsFormModal: JBSForm = {
    associationJBS: {
      id: null,
      name: null,
      jbsCode: null
    }
  }

  private bizSheet: BizSheet = {
    loading: false,
    unbind: [],
    templateLoading: false,
  }

  private jbsTypeModal: JBSTypeModal = {
    loading: false,
    FirstLevel: null,
    FirstLevelOptions: [],
    SecondLevel: null,
    SecondLevelOptions: [],
    visible: false
  }

  private sheetImportType: number = 0;

  private templateConfigDet: boolean = false;

  /*@Watch( 'qbsTreeModal', { immediate: true } )
  qbsTreeModalListener( state: boolean ) {
    if ( state ) {
      const { MBSSearch, findCurrent, selectedRowKeys, projectConfig, projectCode } = this;
      const target = findCurrent( selectedRowKeys[0] );
      if ( !target ) return;
      this.getQBSTreeDebounce(
        projectCode,
        projectConfig?.projectName,
        target.level,
        target.id,
        target.type,
        MBSSearch?.value,
        true
      );
    }
  }*/

  @Watch( 'jbsTreeModal', { immediate: true } )
  jbsTreeModalListener( state: boolean ) {
    if ( state ) {
      const { JBSSearch, findCurrent, selectedRowKeys, projectConfig, projectCode } = this;
      const target = findCurrent( selectedRowKeys[0] );
      if ( !target ) return;
      this.getJSBTreeDebounce(
        projectCode,
        projectConfig?.projectName,
        undefined,
        [],
        JBSSearch?.value,
        true
      );
    }
  }

  private qbsModal: QBSModal = {
    projectDefault: null,
    jbsId: null,
    mbsCode: null,
    level: undefined,
    loading: false,
    edit: false,
    codeValue: null,
    isINSPECTION_LOT: false,
    modelTypeId: null,
    taskName: null,
    visible: false,
    projectOptions: [],
    structureOptions: []
  }

  private adapterImpl<T>( dataSource: Array<T>, childrenKey: string ): void {
    Utils.deepFind( dataSource, item => {
      item.checked = false;
      item.hasChild = !item.leaf;
      // item.childs = item.leaf ? undefined : [];
      // item.childs = item.leaf ? undefined : item.childs;
      item[childrenKey] = item.leaf ? undefined : item[childrenKey];
      item.isLeaf = !!item.leaf;
      return false;
    }, childrenKey );
  }

  private clearChecked<T>( dataSource: Array<T>, childrenKey: string ): void {
    Utils.deepFind( dataSource, item => {
      item.checked = false;
      return false;
    }, childrenKey );
  }


  private QBSTreeAdapter<T>( tree: Array<T>, treeField: string, collection?: Array<T>, autoSet?: boolean ): void | Array<T> {
    if ( Array.isArray( tree ) ) {
      tree.forEach( item => this.adapterImpl<T>( [ item ], treeField ) )
    } else {
      [ tree ].forEach( item => this.adapterImpl<T>( [ item ], treeField ) );
    }
    if ( autoSet && collection ) {
      collection = tree;
    } else {
      return tree;
    }
  }

  private setAllTreeExpanded() {
    const { mainTable, MainTable, treeChild } = this;
    MainTable?.setAllTreeExpand( true );
    this.$nextTick().then( () => {
      Utils.deepFind( mainTable.dataSource, item => {
        if ( item.level === QBSLevel.INSPECTION_LOT ) item._X_EXPAND = false;
        return false;
      }, treeChild );
    } );
  }

  private initQBSImportModal() {
    this.qbsImportModalVisible = false;
    this.uploadFile = null;
    this.uploadFileProgress = 0;
    clearInterval( this.uploadFileTimer as number );
    this.uploadFileTimer = null;
    this.uploadLoading = false;
    this.UploadForm?.reset();
  }

  private openJBSTypeModal() {
    this.jbsTypeModal.FirstLevel = null;
    this.jbsTypeModal.SecondLevel = null;
    this.jbsTypeModal.SecondLevelOptions = [];
    setTimeout( () => {
      console.log( 'selectRow===>', this.currentRow );
      this.getJBSBizFromJBSCode( this.currentRow?.jbsCode, ( data ) => {
        this.jbsTypeModal.visible = true;
        this.jbsTypeModal.FirstLevel = data.id;
        this.jbsTypeModal.SecondLevel = data.childs?.[0]?.id ?? null;
        this.getBizJBSTreeDebounce( data.id, undefined, StructureOptions => {
          this.jbsTypeModal.SecondLevelOptions = StructureOptions;
        } );
      } )
    } )
  }

  private initJBSTypeModal() {
    this.jbsTypeModal.FirstLevel = null;
    this.jbsTypeModal.SecondLevel = null;
    this.jbsTypeModal.SecondLevelOptions = [];
    this.jbsTypeModal.visible = false;
    this.jbsTypeModal.loading = false;
  }

  /*private saveJBSTypeModal() {
    const { loading, SecondLevel, SecondLevelOptions } = this.jbsTypeModal, {
      currentRow,
      locale,
      projectCode,
      projectConfig,
    } = this;
    if ( loading ) return;
    if ( !SecondLevel ) {
      this.jbsTypeModal.loading = false;
      return this.$message.error( locale?.Engineering.JBSTypeRequired as string );
    }
    this.jbsTypeModal.loading = true;
    Api.updateQBSNodeInfo( {
      appCode: projectCode as string,
      projectName: projectConfig?.projectName as string,
      jbsCode: SecondLevelOptions.find( item => item.id === SecondLevel )?.jbsCode as string,
      name: currentRow?.name as string,
      nodeId: currentRow?.id as string,
      type: "QBS"
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.initJBSTypeModal();
      this.initQbsModal( true );
    } );
  }*/

  private renderLevelOptions( dataSource: Array<Type.JBSBizDTO> ) {
    const vNode: Array<JSX.Element> = [];
    if ( !dataSource.length ) return vNode;
    dataSource.forEach( item => {
      vNode.push( <Select.Option key={ item.id } value={ item.id }>{ item.name }</Select.Option> )
    } );
    return vNode;
  }

  private jbsFirstLevelChange( value ) {
    console.log( 'firstLevelSelect===>', value );
    this.jbsTypeModal.SecondLevel = null;
    this.getBizJBSTreeDebounce( value, undefined, data => {
      this.jbsTypeModal.SecondLevelOptions = data;
    } );
  }

  private jbsSecondLevelChange( value ) {
    console.log( 'secondLevelSelect===>', value );
    this.jbsTypeModal.SecondLevel = value;
  }

  /*private renderOptionsColumn( text: string, record: Type.QualityTable, locale: typeof ZhCNEx ): JSX.Element {
    const { removeMainTableRow, editMainTableRow, openJBSTypeModal } = this;
    /!*return (
      <div class={Class.optionColumn}>
        {
          record.level !== QBSLevel.MODEL && record.level !== QBSLevel.CHECK_STEP && record.level !== QBSLevel.CHECK_POINT &&
          [
            <div onClick={e => removeMainTableRow(text, record, locale)}>
              <Icon src={'qbsDelete'}/>
              <span>{locale?.Common?.Action?.remove}</span>
            </div>,
            /!*<div onClick={e => openJBSTypeModal()}>
              <Icon src={'qbsEdit'}/>
              <span>{locale?.Engineering.changeJBSType}</span>
            </div>*!/
            // <div onClick={e => editMainTableRow(text, record, locale)}>
            //   <Icon src={'qbsEdit'}/>
            //   <span>{locale?.Common?.Action?.edit}</span>
            // </div>
          ]
          ||
          <div onClick={e => removeMainTableRow(text, record, locale)}>
            <Icon src={'qbsDelete'}/>
            <span>{locale?.Common?.Action?.remove}</span>
          </div>
        }
        {/!*<div onClick={e => removeMainTableRow(text, record, locale)}>
          <Icon src={'qbsDelete'}/>
          <span>{locale?.Common?.Action?.remove}</span>
        </div>
        <div onClick={e => editMainTableRow(text, record, locale)}>
          <Icon src={'qbsEdit'}/>
          <span>{locale?.Common?.Action?.edit}</span>
        </div>*!/}
      </div>
    );*!/
    return (
      <div class={ Class.optionColumn }>
        {
          record.level === QBSLevel.INSPECTION_LOT &&
          [
            <div onClick={ e => removeMainTableRow( text, record, locale ) }>
              <Icon src={ 'qbsDelete' }/>
              <span>{ locale?.Common?.Action?.remove }</span>
            </div>,
            <div onClick={ e => openJBSTypeModal() }>
              <Icon src={ 'qbsEdit' }/>
              <span>{ locale?.Engineering.changeJBSType }</span>
            </div>
          ]
          ||
          <div onClick={ e => removeMainTableRow( text, record, locale ) }>
            <Icon src={ 'qbsDelete' }/>
            <span>{ locale?.Common?.Action?.remove }</span>
          </div>
        }
      </div>
    )
  }*/

  /*private renderRelationCode( text: string, record: Type.QualityTable, locale: typeof ZhCNEx ): JSX.Element {
    const { type, mbsCode, qbsCode } = record;
    return <span>{ type === 'MBS' ? mbsCode : qbsCode }</span>
  }*/

  @Watch( 'mainTable.selectRow', { immediate: true } )
  mainTableSelectRowListener( val ) {
    console.log( 'val===>', val );
    this.initMbsStateCollection( true );
    this.getMBSModelTreeDebounce( val?.id ?? null );
    //openMBSOpt
    if ( this.mbsStateCollection.operation && val ) this.openMBSOpt();
    /*if ( val ) {
      //version 3.0.0
      //this.getMBSModelTree( val.id );
      this.getMBSModelTreeDebounce( val.id );
      //this.getMBSTree( val.id );
    } else {

    }*/
  }

  private renderRelationEnum( text: string, record: Type.QualityTable, locale: typeof ZhCNEx ): JSX.Element {
    const { level } = record;
    let showText: string | null = null;
    switch ( level ) {
      /* case QBSLevel.CHECK_POINT:
         showText = locale?.Engineering.CHECK_POINT
         break;*/
      case QBSLevel.UNIT_PRO_PROJECT:
        showText = locale?.Engineering.UNIT_PRO_PROJECT;
        break;
      case QBSLevel.UNIT_PROJECT:
        showText = locale?.Engineering.UNIT_PROJECT;
        break;
      case QBSLevel.SUB_UNIT_PROJECT:
        showText = locale?.Engineering.SUB_UNIT_PROJECT;
        break;
      case QBSLevel.PARTITION_PROJECT:
        showText = locale?.Engineering.PARTITION_PROJECT;
        break;
      case QBSLevel.SUB_PARTITION_PROJECT:
        showText = locale?.Engineering.SUB_PARTITION_PROJECT;
        break;
      /* case QBSLevel.SUB_PARTITION_PROJECT:
         showText = locale?.Engineering.SUB_PARTITION_PROJECT;
         break;*/
      case QBSLevel.ITEM_PROJECT:
        showText = locale?.Engineering.ITEM_PROJECT;
        break;
      // case QBSLevel.SUB_ITEM_PROJECT:
      //   showText = locale?.Engineering.SUB_ITEM_PROJECT;
      //   break;
      case QBSLevel.INSPECTION_LOT:
        showText = locale?.Engineering.INSPECTION_LOT;
        break;
      /* case QBSLevel.MODEL:
         showText = locale?.Engineering.MODEL;
         break;
       case QBSLevel.CHECK_STEP:
         showText = locale?.Engineering.CHECK_STEP
         break;*/
    }
    return <span>{ showText ?? "" }</span>
  }

  private getMBSTableColumn( locale?: typeof ZhCNEx, checkEnable?: boolean ): Array<Type.TableColumn<any>> {
    if ( !locale ) return [];
    const defaultColumn = [
      {
        type: 'checkbox',
        width: 40,
        align: 'center'
      },
      {
        title: locale.Engineering.mbsCode,
        align: 'left',
        dataIndex: 'codeValue',
        ellipsis: true,
        key: 'header_0',
        treeNode: true,
        width: 300
      },
      {
        title: locale.Engineering.name,
        dataIndex: 'taskName',
        align: 'center',
        ellipsis: true,
        key: 'header_1'
      }
    ];
    if ( !checkEnable ) {
      defaultColumn.shift();
    }
    return defaultColumn;
  }

  private getRelevanceListColumn( locale?: typeof ZhCNEx ): Array<Type.TableColumn<any>> {
    if ( !locale ) return [];
    return [
      {
        title: locale.Engineering.code,
        align: 'center',
        dataIndex: 'codeValue',
        ellipsis: true,
        key: 'header_0',
      },
      {
        title: locale.Engineering.ModelName,
        align: 'center',
        dataIndex: 'taskName',
        ellipsis: true,
        key: 'header_0',
      }
    ]
  }

  private generateXTableColumns( columns: Array<Type.TableColumn<any>> ) {
    if ( !columns || !columns.length ) return [];
    return columns.map( ( item, index ) => {
      return (
        <vxe-table-column
          treeNode={ index === 0 }
          title={ item.title }
          field={ item.dataIndex }
        />
      )
    } )
  }

  private generateXTableColumnsData( columns: Array<Type.TableColumn<any>> ) {
    if ( !columns || !columns.length ) return [];
    return columns.map( ( item, index ) => {
      return {
        title: item.title,
        field: item.dataIndex,
        treeNode: index === 0 && true,
        slots: item.customRender && {
          default: ( { row } ) => [ item.customRender?.( row, row, index ) ]
        } || undefined
      }
    } );
  }

  private mainTable: MainTableType = {
    deleteOpt: false,
    conditions: null,
    selectRow: null,
    loading: false,
    dataSource: [],
    batch: false,
    edit: false,
    treeData: []
  }

  private qbsMBSTree: Array<Type.QualityTable> = [];

  private qbsJBSTree: Array<any> = [];

  private mainTableTreeAdapter( res: Array<Type.QualityTable>, notMainTree?: boolean ): Array<Type.QualityTable> {
    console.log( 'noMainTree===>', notMainTree );
    const { treeChild } = this;
    if ( !res.length ) return [];
    Utils.deepFind( res, item => {
      if ( !item.leaf ) {
        if ( notMainTree ) {
          item.childs = [];
          item.isLeaf = false;
        }
        //item.childs = [];
        item.hasChild = true;
      } else {
        item.isLeaf = true;
        item.childs = undefined;
        item.hasChild = false;
      }
      //if (!item?.childs?.length) item.childs = undefined;
      return false;
    }, treeChild );
    return res;
  }

  private jbsNode: JBSNode<any> = {
    activeNode: null,
    removePanel: false,
    dataSource: [],
    checkedKeys: [],
    expandKeys: []
  }

  private initModalTree() {
    this.MBSTreeConfig.expendedKeys = [];
    this.MBSTreeConfig.loadedKeys = [];
    this.JBSTreeConfig.expendedKeys = [];
    this.JBSTreeConfig.loadedKeys = [];
  }

  private updateTree( treeData, jbs?: boolean, callBack?: Function ) {
    if ( jbs ) {
      this.qbsJBSTree = treeData;
      callBack?.();
    } else {
      this.qbsMBSTree = treeData;
      callBack?.();
    }
  }

  private getMainTableDebounce = Utils.debounce( ( level: number, projectCode: string, projectName: string, nodeId?: string, name?: string, callBack?: Function ) => {
    const { mainTableTreeAdapter } = this;
    if ( !projectCode ) return this.mainTable.loading = false;
    Api.queryQualityTable( {
      appCode: projectCode,
      projectName: projectName,
      //nodeId: nodeId,
      qbsId: nodeId,
      level: level,
      name: name
    } ).then( res => {
      this.mainTable.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.mainTable.dataSource = mainTableTreeAdapter( res.data );
        this.$nextTick().then( () => callBack?.() );
      }
    } )
  }, 300 );

  private getQBSTreeDebounce = Utils.debounce( ( projectCode: string, projectName: string, level: number, qbsNodeId: string, type: string, name?: string, notMainTree?: boolean, callBack?: Function ) => {
    const { mainTableTreeAdapter } = this;
    if ( !projectCode ) return this.qbsSelectedLoading = false;
    Api.queryUnbindQBSTree( {
      appCode: projectCode,
      projectName: projectName,
      level: level,
      // mbsNodeId: "",
      name: name,
      qbsNodeId: qbsNodeId,
      type: type
    } ).then( res => {
      this.qbsModalLoading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) this.updateTree( mainTableTreeAdapter( res.data, notMainTree ), false, callBack );
    } )
  }, 300 );

  private getTreeDataDebounce = Utils.debounce( ( projectCode: string, projectName: string, mbsCode: string, qbsId: string, qbsCode: string, type: string, name?: string, hasMbs?: boolean, level?: number ) => {
    Api.queryQualityBizSheetList( {
      appCode: projectCode,
      projectName: projectName,
      mbsCode: mbsCode,
      qbsId: qbsId,
      qbsCode: qbsCode,
      type: type,
      name: name,
      hasMbs: hasMbs,
      level: level
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) this.mainTable.treeData = res.data.hits ?? [];
    } )
  }, 300 );

  private getTreeDataDebounceV2 = Utils.debounce( ( qbsId: string, jbsId: string ) => {
    Api.queryQualityBizSheetListV2( {
      qbsId: qbsId,
      jbsId: jbsId
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) this.mainTable.treeData = res.data.hits ?? [];
    } )
  }, 300 );

  private getJSBTreeDebounce = Utils.debounce( ( projectCode: string, projectName: string, nodeId: string, excludeJbsCodes: Array<string>, name?: string, notMainTree?: boolean, callBack?: Function ) => {
    if ( !projectCode ) return;
    const { getRowSelectedCurrent, findCurrent, mainTableTreeAdapter } = this;
    const target = getRowSelectedCurrent();
    if ( !target ) return;
    const parentLot = findCurrent( target.parentId );
    console.log( 'nodeId===>', nodeId );
    //jbsCode: !nodeId ? parentLot?.jbsCode as string : undefined,
    //name: name as string,
    //nodeId: nodeId
    Api.queryJBSTree( {
      appCode: projectCode as string,
      qbsId: parentLot?.id,
      name: name,
    } ).then( res => {
      this.qbsModalLoading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) this.updateTree( mainTableTreeAdapter( res.data, notMainTree ), true, callBack );
    } )
  }, 300 );

  private getJBSBizFromJBSCode = Utils.debounce( ( jbsCode: string, callBack?: Function ) => {
    // if (!jbsCode) return;
    Api.getJBSBiz( {
      jbsCode: jbsCode
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        console.log( 'JBSBizForm===>', res.data );
        callBack?.( res.data );
      }
    } )
  }, 300 );

  private getBizJBSTreeDebounce = Utils.debounce( ( nodeId?: string, name?: string, callBack?: Function ) => {
    Api.queryBizJBSTree( {
      nodeId: nodeId,
      name: name
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        callBack?.( res.data );
      }
    } )
  }, 300 );

  private getRowSelectedCurrent() {
    const { findCurrent, selectedRowKeys } = this;
    if ( !selectedRowKeys.length ) return;
    return findCurrent( selectedRowKeys[0] );
  }

  private fileInput( e ) {
    const files = e.target.files,
      { projectCode, projectName, setAllTreeExpanded, projectConfig } = this;
    if ( files && files[0] ) {
      const file = files[0];
      const fileFormat = file.name.slice( file.name.lastIndexOf( "." ) + 1 ).toLowerCase();
      if ( [ "xlsx", "xls" ].indexOf( fileFormat ) === -1 )
        return this.$message.error( "请上传Excel文件!" );
      const formData = new FormData();
      formData.append( "file", file );
      // formData.append("appCode", projectCode as string);
      formData.append( "appCode", projectCode as string );
      //formData.append("projectName", projectName as string);
      formData.append( "projectName", projectConfig?.projectName as string );
      this.uploadFile = formData;
      console.log( this.uploadFile.get( 'file' ) );
      //TODO:upload Excel
      /* Api.importQBSTree( formData ).then( res => {
         if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
         this.qbsImportModalVisible = false;
         this.getQBSTree();
       } );*/
      /*switch ( sheetImportType ) {
        case 1:
          //global
          Api.qbsImportGlobal( formData ).then( res => {
            if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
            //TODO:refresh table
            this.getMainTableDebounce( 0, projectCode, projectConfig?.projectName, undefined, this.condition && undefined, setAllTreeExpanded );
          } )
          break;
        case 2:
          //part
          Api.qbsImportPart( formData ).then( res => {
            if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
            this.getMainTableDebounce( 0, projectCode, projectConfig?.projectName, undefined, this.condition && undefined, setAllTreeExpanded );
          } )
          break;
        case 3:
          Api.qbsOneKeyImport( formData ).then( res => {
            if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
            this.getMainTableDebounce( 0, projectCode, projectConfig?.projectName, undefined, this.condition && undefined, setAllTreeExpanded );
          } )
          //oneKey
          break;
      }*/
    }
  }

  private startUpload() {
    const { locale } = this;
    if ( this.uploadLoading ) return;
    if ( !this.uploadFile ) return this.$message.error( locale?.Engineering.fileRequired as string );
    this.uploadLoading = true;
    this.uploadFileTimer = setInterval( () => {
      if ( this.uploadFileProgress === 100 ) {
        clearInterval( this.uploadFileTimer as number );
      } else {
        this.uploadFileProgress++;
      }
    }, 1000 );
    Api.importQBSTree( this.uploadFile ).then( res => {
      this.uploadLoading = false;
      if ( res.errcode !== 0 ) {
        return this.$message.error( res.errmsg as string );
      } else {
        this.uploadFileProgress = 100;
        this.initQBSImportModal();
        this.initMbsStateCollection();
        this.mainTable.treeData = [];
        this.getQBSTree();
      }
    } )
  }

  private searchMainTable( value ) {
    const { projectCode, projectName, setAllTreeExpanded, projectConfig } = this;
    this.condition = value;
    this.getMainTableDebounce( 0, projectCode, projectConfig?.projectName, undefined, value, setAllTreeExpanded );
  }

  /*private qbsSelectedSearch( value ) {
    const { projectCode, projectName, MBSSearch, currentRow, initModalTree, projectConfig } = this;
    if ( !currentRow ) return;
    this.getQBSTreeDebounce( projectCode, projectConfig?.projectName, currentRow.level, currentRow.id, currentRow.type, MBSSearch?.$refs.input.stateValue, true, initModalTree );
  }*/

  private jbsSelectedSearch( value ) {
    const { projectCode, projectName, JBSSearch, initModalTree, projectConfig } = this;
    this.jbsTreeName = value;
    this.getJSBTreeDebounce( projectCode, projectConfig?.projectName, undefined, [], JBSSearch?.$refs.input.stateValue, true, initModalTree );
  }

  /*private removeMainTableRow( text: string, record: Type.QualityTable, locale: typeof ZhCNEx ) {
    console.log( 'removeRecord===>', record );
    const { type, id, name, parentId, level, qbsCode, mbsCode } = record, {
      projectCode,
      projectName,
      projectConfig,
    } = this;
    if ( type === 'QBS' ) {
      Api.removeQBSNode( {
        appCode: projectCode as string, //projectCode
        nodeId: id,
        projectName: projectConfig?.projectName as string,
        type: type
      } ).then( res => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.initQbsModal( true );
      } );
    } else {
      Api.batchOptMBSNode( {
        addNodes: [],
        appCode: projectCode as string,
        delNodes: [ {
          id: id,
          /!*name: name,
          projectName: "弥河工程",//projectName
          parentId: parentId,
          qbsCode: qbsCode,
          level: level,
          mbsCode: mbsCode,*!/
        } ],
        level: QBSLevel.INSPECTION_LOT,
        projectName: projectConfig?.projectName as string,
        qbsNodeId: parentId,
        type: 'QBS'
      } ).then( res => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.initQbsModal( true );
      } )
    }
  }*/

  private editMainTableRow( text: string, record: Type.QualityTable, locale: typeof ZhCNEx ) {
    console.log( 'editRecord===>', record );
  }

  /*private vxTableCellClick( { row }: { row: Type.QualityTable } ) {
    const { projectConfig, projectCode } = this;
    console.log( 'vxTableCellClick===>', row );
    this.currentRow = row;
    this.cantBeAddedVXTable( row );
    this.selectedRowKeys = [ row.id ];
    const { id, type, hasMbsNode, level, qbsCode, jbsId } = row;
    this.canAddLevel = row.level;
    //TODO:searchTreeData
    const rowParentNode = this.findCurrent( row.id );
    if ( row.level !== QBSLevel.MODEL ) {
      this.getTreeDataDebounceV2( row.id, row.jbsId );
    }
    /!*!/!*if (row.hasMbsNode && row.level === QBSLevel.INSPECTION_LOT) {
      this.mainTable.treeData = [];
    } else*!/ if (row.level === QBSLevel.CHECK_STEP) {
      this.getTreeDataDebounce(projectCode, projectConfig?.projectName, rowParentNode?.mbsCode, row.id, row.qbsCode, row.type, undefined, hasMbsNode, level);
    } else if (row.level > QBSLevel.INSPECTION_LOT) {
      this.getTreeDataDebounce(projectCode, projectConfig?.projectName, rowParentNode?.mbsCode, row.parentId, row.qbsCode, row.type, undefined, hasMbsNode, level);
    } else {
      this.getTreeDataDebounce(projectCode, projectConfig?.projectName, row.mbsCode, id, qbsCode, type, undefined, hasMbsNode, level);
    }*!/
  }*/

  private importMethod( val ) {
    console.log( 'importMethod===>', val );
    switch ( val ) {
      case 1:
        this.sheetImportType = 1;
        this.FileInput?.click();
        return;
      case 2:
        this.sheetImportType = 2;
        this.FileInput?.click();
        return;
      case 3:
        this.sheetImportType = 3;
        this.FileInput?.click();
      default:
        this.sheetImportType = 0;
        return;
    }
  }

  private exportMethod( val ) {
    switch ( val ) {
      case 1:
        window.open( '/api/api/quality/qbs/excel/importTemplate/total' );
        return;
      case 2:
        window.open( '/api/api/quality/qbs/excel/importTemplate/part' );
        return;
    }
  }

  private initQBSForm() {
    this.qbsFormModal = {
      engineeringParts: null,
      correspondingCode: null,
      dividedCategories: null,
      associationMBS: {
        id: null,
        name: null,
        mbsCode: null
      }
    }
  }

  private initJBSForm() {
    this.jbsFormModal = {
      associationJBS: {
        id: null,
        name: null,
        jbsCode: null
      }
    }
  }

  private initQbsModal( refresh?: boolean ) {
    const { projectCode, projectName, MainTable, setAllTreeExpanded, projectConfig } = this;
    this.qbsModalLoading = false;
    this.showAdd = false;
    this.initQBSForm();
    this.initJBSForm();
    //@ts-ignore
    MainTable?.setCurrentRow( null );
    if ( refresh ) {
      this.mainTable.loading = true;
      this.selectedRowKeys = [];
      this.getMainTableDebounce( 0, projectCode, projectConfig?.projectName, undefined, this.condition && undefined, setAllTreeExpanded );
    }
  }

  private initTemplateModal( refresh?: boolean ) {
    this.showTemplateAdd = false;
    this.unbindSelectedKeys = [];
    if ( refresh ) {
      const { findCurrent, selectedRowKeys, projectConfig } = this;
      const target = findCurrent( selectedRowKeys[0] );
      if ( !target ) return;
      console.log( 'initTemplate====>', target );
      const rowParentNode = findCurrent( target.parentId );
      console.log( 'parentNode====>', rowParentNode );
      /*if (target.hasMbsNode && target.level === QBSLevel.INSPECTION_LOT) {
        //not search
        this.mainTable.treeData = [];
      } else*/
      /*if ( target.level === QBSLevel.CHECK_STEP ) {
        this.getTreeDataDebounce( this.projectCode, projectConfig?.projectName, rowParentNode?.mbsCode, target.id, target.qbsCode, target.type, undefined, target.hasMbsNode, target.level );
      } else if ( target.level > QBSLevel.INSPECTION_LOT ) {
        this.getTreeDataDebounce( this.projectCode, projectConfig?.projectName, rowParentNode?.mbsCode, target.parentId, target.qbsCode, target.type, undefined, target.hasMbsNode, target.level );
      } else {
        this.getTreeDataDebounce( this.projectCode, projectConfig?.projectName, target.mbsCode, target.id, target.qbsCode, target.type, undefined, target.hasMbsNode, target.level );
      }*/
    }
  }

  render() {
    const {
      locale,
      searchParts,
      mainTable,
      mbsStateCollection,
      selectedRowKeys,
      fileInput,
      getTableColumn,
      treeChild,
      searchMainTable,
      editMode,
      templateHeight,
      qbsFormModal,
      jbsTypeModal
    } = this, { associationMBS } = qbsFormModal;

    // this.calcContentHeight();

    return (
      <article class={ Class.main } ref={ 'MainContainer' }>
        <form ref={ 'UploadForm' }>
          <input ref={ "FileInput" } class={ Class.hide } type={ "file" }
                 onChange={ ( e ) => fileInput( e ) }
                 accept={ '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' }/>
        </form>
        <nav class={ Class.nav }>
          <Icon src={ 'goBack' } className={ Class.goBack }
                clickEvent={ e => this.$router.go( -1 ) }/>
          <span>{ locale?.Engineering.listConfig }</span>
          {/*<Button*/}
          {/*  type={ 'primary' }*/}
          {/*  onClick={ e => this.qbsImportModalVisible = true }*/}
          {/*>*/}
          {/*  { locale?.Common.Action.import }*/}
          {/*</Button>*/}
          {/*<Button*/}
          {/*  type={ 'primary' }*/}
          {/*  onClick={ e => window.open( `/api/api/quality/v2/qbs/export?appCode=${ this.projectCode }&projectName=${ this.projectConfig?.projectName }` ) }*/}
          {/*>*/}
          {/*  { locale?.Common.Action.export }*/}
          {/*</Button>*/}
          {/*{*/ }
          {/*  !editMode &&*/ }
          {/*  <Button*/ }
          {/*    onClick={ e => this.editMode = true }*/ }
          {/*    type={ 'primary' }>{ locale?.Common.Action.edit }</Button>*/ }
          {/*  ||*/ }
          {/*  <div>*/ }
          {/*    <Button*/ }
          {/*      onClick={ e => this.editMode = false }>{ locale?.Common.Action.cancel }</Button>*/ }
          {/*    /!*<Button type={'primary'}>{locale?.Common.Action.save}</Button>*/ }
          {/*  </div>*/ }
          {/*}*/ }
        </nav>
        <main class={ Class.mainContainer }>
          {/*<section class={Class.container}>
            <nav>
              <span>{locale?.Engineering.title}</span>
              {
                editMode &&
                <div class={Class.containerOptions}>
                  <Button
                    onClick={e => this.oneKeyImport()}>{locale?.Engineering.oneKeyImport}</Button>
                  <div class={Class.division}/>
                  <Select
                    defaultValue={0}
                    onChange={this.importMethod}
                  >
                    <Select.Option value={0}>{locale?.Engineering.tableImport}</Select.Option>
                    <Select.Option value={1}>{locale?.Engineering.globalImport}</Select.Option>
                    <Select.Option value={2}>{locale?.Engineering.deltaImport}</Select.Option>
                  </Select>
                  <Select
                    defaultValue={0}
                    onChange={this.exportMethod}
                  >
                    <Select.Option value={0}>{locale?.Engineering.templateExport}</Select.Option>
                    <Select.Option value={1}>{locale?.Engineering.globalImport}</Select.Option>
                    <Select.Option value={2}>{locale?.Engineering.deltaImport}</Select.Option>
                  </Select>
                  <Button>{locale?.Engineering.templateExport}</Button>
                </div>
              }
            </nav>
            <article>
              <nav class={Class.mainTableOptionNav}>
                <Input.Search
                  class={Class.searchInput}
                  placeholder={locale?.Engineering.searchPlaceHolder}
                  loading={searchParts}
                  enterButton
                  onSearch={searchMainTable}
                />
                {
                  editMode &&
                  <Button disabled={this.disabledAdd}
                          onClick={e => this.showAdd = true}
                          type={'primary'}>{locale?.Engineering.addChild}</Button>
                }
              </nav>
              <vxe-virtual-tree
                size={'mini'}
                border
                resizable
                showOverflow
                rowKey
                highlightCurrentRow
                ref={'MainTable'}
                rowId={'id'}
                loading={mainTable.loading}
                data={mainTable.dataSource}
                columns={this.generateXTableColumnsData(getTableColumn(locale, editMode))}
                treeConfig={{
                  lazy: true,
                  children: treeChild,
                  hasChild: 'hasChild',
                  loadMethod: lazyLoadVXTree,
                  expandRowKeys: this.vxTableTreeExpanded
                }}
                height={this.templateHeight - 42 - 54}
                {...{
                  on: {
                    'current-change': this.vxTableCellClick,
                    'toggle-tree-expand': this.treeVXTableExpand,
                    // 'setCurrentRow':this.setCurrentRow
                  }
                }}
              >
                {this.generateXTableColumns(getTableColumn(locale, editMode))}
              </vxe-virtual-tree>
              <Table
                bordered
                class={Class.table}
                loading={mainTable.loading}
                childrenColumnName={treeChild}
                rowKey={'id'}
                columns={getTableColumn(locale, editMode)}
                dataSource={mainTable.dataSource}
                pagination={false}
                onExpand={lazyLoadTree}
                rowSelection={{
                  selectedRowKeys: selectedRowKeys,
                  hideDefaultSelections: true,
                  type: 'radio',
                  onChange: mainTableSelect
                }}
                // expandedRowRender={this.expandedRow}
                expandable={{
                  rowExpandable: record => {
                    console.log('rowExpandable===>', record);
                    return false;
                  }
                }}
                scroll={{
                  y: this.templateHeight - 42 - 54
                }}
              />
            </article>
          </section>*/ }
          <SyncVisualTable
            ref={ 'QBSTree' }
            config={ {
              wrapperClass: Class.QBSTree,
              expendAllNode: true,
              stopExpendCondition: QualityModule.stopExpendQBSTree,
              locale: {
                title: locale?.Engineering.title ?? ""
              },
              // navNodes: [],
              navNodes: this.renderQBSTreeNav(),
              articleNavNodes: this.renderQBSMainNav(),
              loading: mainTable.loading,
              mainTableConfig: {
                size: 'mini',
                align: 'center',
                stripe: true,
                border: true,
                resizable: true,
                showOverflow: true,
                highlightCurrentRow: true,
                autoResize: true,
                rowKey: true,
                rowId: 'id',
                currentChange: this.qbsChange,
                cellDBClick: this.qbsDBClick
              },
              columns: this.getTableColumn( locale, mainTable.deleteOpt ),
              dataSource: mainTable.dataSource,
              lazy: true,
              treeChildField: 'childs',
              hasChildField: 'hasChild',
              loadMethod: this.loadQBSTree,
              checkConfig: {
                checkStrictly: true,
                checkField: 'checked',
                halfField: 'indeterminate',
                showHeader: false,
              },
            } }
          />
          {/*<SyncVisualTable*/}
          {/*  ref={ 'MBSTree' }*/}
          {/*  config={ {*/}
          {/*    wrapperClass: Class.MBSTree,*/}
          {/*    expendAllNode: true,*/}
          {/*    stopExpendCondition: QualityModule.stopExpendMBSTree,*/}
          {/*    locale: {*/}
          {/*      title: locale?.Engineering.mbsCode ?? ""*/}
          {/*    },*/}
          {/*    loading: mbsStateCollection.loading,*/}
          {/*    navNodes: this.renderMBSNav(),*/}
          {/*    articleNavNodes: [],*/}
          {/*    mainTableConfig: {*/}
          {/*      size: 'mini',*/}
          {/*      align: 'center',*/}
          {/*      stripe: false,*/}
          {/*      border: true,*/}
          {/*      resizable: true,*/}
          {/*      showOverflow: true,*/}
          {/*      highlightCurrentRow: true,*/}
          {/*      autoResize: true,*/}
          {/*      rowKey: true,*/}
          {/*      rowId: 'id',*/}
          {/*      currentChange: this.mbsChange,*/}
          {/*      cellDBClick: this.mbsDBClick,*/}
          {/*    },*/}
          {/*    columns: !mbsStateCollection.operation && this.getRelevanceListColumn( locale ) || this.getMBSTableColumn( locale, mbsStateCollection.checkEnable ),*/}
          {/*    dataSource: !mbsStateCollection.operation && mbsStateCollection.modelDataSource || mbsStateCollection.dataSource,*/}
          {/*    lazy: true,*/}
          {/*    treeChildField: 'children',*/}
          {/*    hasChildField: 'hasChild',*/}
          {/*    loadMethod: this.loadMBSTree,*/}
          {/*    checkConfig: {*/}
          {/*      checkField: 'checked',*/}
          {/*      halfField: 'indeterminate',*/}
          {/*      showHeader: false,*/}
          {/*      //checkMethod: QualityModule.checkAble,*/}
          {/*    },*/}
          {/*    rowClassName: this.showLinkCell*/}
          {/*  } }*/}
          {/*/>*/}
          <section class={ Class.container }>
            <nav class={ Class.templateOptionNav }>
              <span>{ locale?.Engineering.templateConfig }</span>
              
              {/*{
                this.jbsNode.removePanel &&
                <Button onClick={ this.closeRemove }>{ locale?.Common.Action.cancel }</Button>
              }*/ }
              {/* {
                editMode &&
                <Button
                  loading={ this.bizSheet.loading }
                  onClick={ e => this.openTemplateModal () }>{ locale?.Common.Action.append }</Button>
              }*/ }
            </nav>
            <article ref={ 'TemplateList' }>
              <nav class={ Class.templateOptionNav }>
                {/*{
                  this.mainTable.selectRow &&
                  <span>{ this.renderJBSOptions( this.mainTable.selectRow ) }</span>
                }*/ }
                <Button
                style={{
                  display: `${!this.templateConfigDet?'block':'none'}`
                }}
                type={ 'primary' }
                loading={ this.bizSheet.loading }
                //onClick={ this.openTemplateModal }
                onClick={ () => {
                  this.jbsNode.activeNode = null;
                  this.editJBSBindShip();
                } }
              >
                { locale?.Common.Action.append }
              </Button>
              <Button
                style={{
                  display: `${!this.templateConfigDet?'block':'none'}`
                }}
                type={ 'danger' }
                ref={ 'RemoveJBSNode' }
                onClick={ this.removeTemplateConfigDet }
              >
                { locale?.Common.Action.remove }
              </Button>
              <Button
                class={Class.detBtn}
                style={{
                  display: `${this.templateConfigDet?'block':'none'}`,
                }}
                onClick={ this.cancelTemplateConfigDet }
              >
                { locale?.Common.Action.cancel }
              </Button>
              <Button
                style={{
                  display: `${this.templateConfigDet?'block':'none'}`
                }}
                type={ 'danger' }
                onClick={ this.toRemove }
              >
                { locale?.Common.Action.confirmRemove }
              </Button>
              </nav>
              <section class={ Class.jbsCardContainer } style={ {
                overflowY: 'auto',
                height: `${ this.QBSTree?.getMaxHeight() }px`,
              } }>
                { this.renderJBSNodes() }
              </section>
              {/*<VirtualList
                class={ Class.virtualList }
                style={ {
                  // height: `${ templateHeight }px`,
                  overflowY: 'auto',
                  height: `${ this.QBSTree?.getMaxHeight() }px`,
                } }
                dataKey={ 'id' }
                //TODO:replace testData this.viralList()
                dataSources={ this.virtualListAdaptor( this.mainTable.treeData ) }
                dataComponent={ QualityTemplate }
                extraProps={ {
                  // editMode: editMode,
                  editMode: true,
                  titleEvent: this.viewQBSSheet,
                  removeEvent: this.removeQBSSheet
                } }
                keeps={ 30 }
              />*/ }
              {/*<Tree
                treeData={mainTable.treeData}
                replaceFields={{
                  children: 'children',
                  title: 'bizSheetName',
                  key: 'id'
                }}
              />*/ }
            </article>
          </section>
        </main>
        <Modal
          closable={ false }
          visible={ this.qbsImportModalVisible }
          destroyOnClose={ true }
          maskClosable={ false }
          footer={ false }
          onCancel={ e => this.qbsImportModalVisible = false }
          width={ 500 }
        >
          <article class={ Class.qbsModal }>
            <nav>
              <span class={ Class.topDivision }/>
              <span>{ locale?.Engineering.qbsImportTitle }</span>
            </nav>
            <main class={ Class.modalForm }>
              <aside class={ Class.row }>
                <span>{ locale?.Engineering.qbsImportTips }
                  <span class={ Class.link }
                        onClick={ e => window.open( '/api/api/quality/v2/qbs/excel/importTemplate' ) }>{ locale?.Engineering.qbsImportDownloadTemplate }</span>
                </span>
              </aside>
              <aside class={ Class.row }>
                <span>{ locale?.Engineering.qbsImportLocal }：</span>
                <div
                  class={ Class.uploadBtn }
                  onClick={ e => this.importQBSFile( e ) }
                  onDrop={ this.importQBSFile }
                >
                  { locale?.Engineering.qbsImportFileInput }
                </div>
              </aside>
              <aside class={ Class.row }>
                {
                  this.uploadFile && <span>{ this.uploadFile.get( 'file' )?.['name'] }</span>
                }
                {
                  this.uploadFile && this.uploadLoading &&
                  <span class={ Class.uploadProgress }>{ this.uploadFileProgress }%</span>
                }
              </aside>
            </main>
            <div class={ Class.footer }>
              <Button
                onClick={ this.initQBSImportModal }
              >
                { locale?.Common.Action.cancel }
              </Button>
              <Button
                type={ 'primary' }
                loading={ this.uploadLoading }
                onClick={ this.startUpload }
              >
                { locale?.Common.Action.ok }
              </Button>
            </div>
          </article>
        </Modal>
        <Modal
          closable={ false }
          visible={ this.qbsExportModalVisible }
          destroyOnClose={ true }
          maskClosable={ false }
          footer={ false }
          onCancel={ e => this.qbsExportModalVisible = false }
          width={ 600 }
        >

        </Modal>
        <Modal
          closable={ false }
          visible={ this.qbsModal.visible }
          destroyOnClose={ true }
          maskClosable={ false }
          footer={ false }
        >
          <article class={ Class.qbsModal }>
            <nav>
              <span class={ Class.topDivision }/>
              <span>{ this.qbsModal.edit ? locale?.Engineering.editTitle : locale?.Engineering.addTitle }</span>
            </nav>
            <main class={ Class.qbsModalForm }>
              <nav>
                <i/>
                <span>{ locale?.Engineering.baseInfo }</span>
              </nav>
              <aside class={ Class.row }>
                <span>{ locale?.Engineering.taskName }：</span>
                <Input v-model={ this.qbsModal.taskName }/>
                <span>{ locale?.Engineering.partCode }：</span>
                <Input placeholder={ locale?.Common.Action.optional }
                       disabled={ this.qbsModal.edit }
                       v-model={ this.qbsModal.codeValue }/>
              </aside>
              <nav>
                <i/>
                <span>{ locale?.Engineering.type }</span>
              </nav>
              <aside class={ `${ Class.row }  ${ Class.fullRow }` }>
                <span>{ locale?.Engineering.type }：</span>
                <Select v-model={ this.qbsModal.level }>
                  <Select.Option key={ 0 } value={ 0 }>
                    { locale?.Engineering.UNIT_PROJECT }
                  </Select.Option>
                  <Select.Option key={ 1 } value={ 1 }>
                    { locale?.Engineering.PARTITION_PROJECT }
                  </Select.Option>
                  <Select.Option key={ 3 } value={ 3 }>
                    { locale?.Engineering.ITEM_PROJECT }
                  </Select.Option>
                </Select>
              </aside>
              {
                this.qbsModal.edit &&
                [
                  <nav>
                    <i/>
                    <span>{ locale?.Engineering.inspectionLot }</span>
                  </nav>,
                  <aside class={ `${ Class.row } ${ Class.fullRow }` }>
                    <span>{ locale?.Engineering.isInspectionLot }</span>
                    <Checkbox v-model={ this.qbsModal.isINSPECTION_LOT }/>
                  </aside>,
                  this.qbsModal.isINSPECTION_LOT &&
                  <aside class={ Class.row }>
                    <span>{ locale?.Engineering.projectCategory }：</span>
                    <Select defaultValue={ this.qbsModal.projectDefault }
                            onChange={ this.filterStructure }>
                      { this.qbsModal.projectOptions.map( item =>
                        <Select.Option key={ item.id }
                                       value={ item.id }>{ item.name }</Select.Option>
                      ) }
                    </Select>
                    <span>{ locale?.Engineering.structureCategory }：</span>
                    <Select
                      v-model={ this.qbsModal.modelTypeId }>{ this.qbsModal.structureOptions.map( item =>
                      <Select.Option key={ item.id } value={ item.id }>{ item.name }</Select.Option>
                    ) }</Select>
                  </aside>
                  ||
                  <div/>
                ] }
            </main>
            <div class={ Class.footer }>
              <Button onClick={ this.initQBSModal }>{ locale?.Common.Action.cancel }</Button>
              <Button onClick={ this.submitQBSModal }>{ locale?.Common.Action.ok }</Button>
            </div>
          </article>
        </Modal>
        <Modal
          closable={ false }
          visible={ this.jbsModal.visible }
          destroyOnClose={ true }
          maskClosable={ false }
          footer={ false }
          width={ 1000 }
        >
          <article class={ Class.qbsModal }>
            <nav>
              <span class={ Class.topDivision }/>
              <span>{ locale?.Engineering.editJBSBindShip }</span>
            </nav>
            <main class={ Class.qbsModalForm }>
              <aside class={ Class.row }>
                <span>{ locale?.Engineering.projectCategory }：</span>
                <Select
                  ref={ 'ProjectSelector' }
                  defaultValue={ this.jbsModal.projectDefault }
                  onChange={ key => {
                    if ( !this.$refs.ProjectSelector || !this.$refs.StructureSelector || !this.$refs.ProcessSelector ) return;
                    const selector: Select = this.$refs.ProjectSelector,
                      structureSelector: Select = this.$refs.StructureSelector,
                      processSelector: Select = this.$refs.ProcessSelector;
                    selector.value = key;
                    let options: Array<{ [props: string]: string | Array<any> }> = [];
                    Utils.deepFind( this.jbsModal.projectOptions, item => {
                      if ( item.id === key ) {
                        options = item.childs.concat( [] );
                        return true;
                      } else {
                        return false;
                      }
                    }, 'childs' );
                    console.log( 'projectOptions===>', options );
                    this.jbsModal.structureOptions = options;
                    //this.jbsModal.processOptions = [];
                    structureSelector.value = options[0]?.id ?? null;
                    this.jbsModal.processOptions = options[0]?.childs as Array<any> ?? [];
                    processSelector.value = options[0]?.childs?.[0]?.id ?? null;
                    //processSelector.value = null;
                  } }
                >
                  { this.jbsModal.projectOptions.map( item =>
                    <Select.Option key={ item.id } value={ item.id }>
                      <Tooltip title={item.name}>
                        { item.name }
                      </Tooltip>
                    </Select.Option>
                  ) }
                </Select>
                <span>{ locale?.Engineering.structureCategory }：</span>
                <Select
                  ref={ 'StructureSelector' }
                  defaultValue={ this.jbsModal.structureDefault }
                  onChange={ e => {
                    if ( !this.$refs.StructureSelector || !this.$refs.ProcessSelector ) return;
                    const
                      selector: Select = this.$refs.StructureSelector,
                      processSelector: Select = this.$refs.ProcessSelector;
                    selector.value = e;
                    let options: Array<{ [props: string]: string }> = [];
                    Utils.deepFind( this.jbsModal.structureOptions, item => {
                      if ( item.id === e ) {
                        options = item.childs.concat( [] );
                        return true;
                      } else {
                        return false;
                      }
                    }, 'childs' );
                    console.log( 'structureOptions===>', options );
                    this.jbsModal.processOptions = options;
                    processSelector.value = options[0]?.id ?? null;

                  } }
                >
                  { this.jbsModal.structureOptions.map( item =>
                    <Select.Option key={ item.id } value={ item.id }>
                      <Tooltip title={item.name}>
                        { item.name }
                      </Tooltip>
                    </Select.Option>
                  ) }
                </Select>
                <span>{ locale?.Engineering.processCategory }：</span>
                <Select
                  ref={ 'ProcessSelector' }
                  defaultValue={ this.jbsModal.processDefault }
                  onChange={ e => {
                    if ( !this.$refs.ProcessSelector ) return;
                    const selector: Select = this.$refs.ProcessSelector;
                    selector.value = e;
                  } }
                >
                  { this.jbsModal.processOptions.map( item =>
                    <Select.Option key={ item.id } value={ item.id }>
                      <Tooltip title={item.name}>
                        { item.name }
                      </Tooltip>
                    </Select.Option>
                  ) }
                </Select>
              </aside>
            </main>
            <div class={ Class.footer }>
              <Button onClick={ this.initJBSModal }>{ locale?.Common.Action.cancel }</Button>
              <Button loading={ this.jbsModal.loading }
                      onClick={ () => this.submitJBSModal( true ) }>{ locale?.Common.Action.ok }</Button>
            </div>
          </article>
        </Modal>
        {/*<Modal*/ }
        {/*  closable={ false }*/ }
        {/*  visible={ this.showAdd }*/ }
        {/*  destroyOnClose={ true }*/ }
        {/*  maskClosable={ false }*/ }
        {/*  footer={ false }*/ }
        {/*  onCancel={ e => this.initQbsModal }*/ }
        {/*  width={ 500 }*/ }
        {/*>*/ }
        {/*  <article class={ Class.qbsModal }>*/ }
        {/*    <nav>*/ }
        {/*      <span class={ Class.topDivision }/>*/ }
        {/*      <span>{ locale?.Engineering.modalTitle }</span>*/ }
        {/*    </nav>*/ }
        {/*    <main class={ Class.qbsModalForm }>*/ }
        {/*      <aside class={ Class.row }>*/ }
        {/*        <span>{ locale?.Engineering.engineeringParts }：</span>*/ }
        {/*        <Input v-model={ qbsFormModal.engineeringParts }/>*/ }
        {/*        <span>{ locale?.Engineering.correspondingCode }：</span>*/ }
        {/*        <Input v-model={ qbsFormModal.correspondingCode }/>*/ }
        {/*      </aside>*/ }
        {/*      <aside class={ Class.row }>*/ }
        {/*        <span>{ locale?.Engineering.dividedCategories }：</span>*/ }
        {/*        /!*<Input v-model={qbsFormModal.correspondingCode}/>*/ }
        {/*        <Select*/ }
        {/*          v-model={ qbsFormModal.dividedCategories }*/ }
        {/*        >*/ }
        {/*          <Select.Option*/ }
        {/*            disabled={ this.canAddLevel > QBSLevel.INSPECTION_LOT }*/ }
        {/*            value={ QBSLevel.CHECK_POINT }>{ locale?.Engineering.CHECK_POINT }</Select.Option>*/ }
        {/*          <Select.Option*/ }
        {/*            disabled={ this.canAddLevel >= QBSLevel.UNIT_PROJECT }*/ }
        {/*            value={ QBSLevel.UNIT_PROJECT }>{ locale?.Engineering.UNIT_PROJECT }</Select.Option>*/ }
        {/*          <Select.Option*/ }
        {/*            disabled={ this.canAddLevel >= QBSLevel.PARTITION_PROJECT }*/ }
        {/*            value={ QBSLevel.PARTITION_PROJECT }>{ locale?.Engineering.PARTITION_PROJECT }</Select.Option>*/ }
        {/*          <Select.Option*/ }
        {/*            disabled={ this.canAddLevel >= QBSLevel.SUB_PARTITION_PROJECT }*/ }
        {/*            value={ QBSLevel.SUB_PARTITION_PROJECT }>{ locale?.Engineering.SUB_PARTITION_PROJECT }</Select.Option>*/ }
        {/*          <Select.Option*/ }
        {/*            disabled={ this.canAddLevel >= QBSLevel.ITEM_PROJECT }*/ }
        {/*            value={ QBSLevel.ITEM_PROJECT }>{ locale?.Engineering.ITEM_PROJECT }</Select.Option>*/ }
        {/*          <Select.Option*/ }
        {/*            disabled={ this.canAddLevel >= QBSLevel.SUB_ITEM_PROJECT }*/ }
        {/*            value={ QBSLevel.SUB_ITEM_PROJECT }>{ locale?.Engineering.SUB_ITEM_PROJECT }</Select.Option>*/ }
        {/*          <Select.Option*/ }
        {/*            disabled={ this.canAddLevel >= QBSLevel.INSPECTION_LOT }*/ }
        {/*            value={ QBSLevel.INSPECTION_LOT }>{ locale?.Engineering.INSPECTION_LOT }</Select.Option>*/ }
        {/*          <Select.Option*/ }
        {/*            disabled={ this.canAddLevel !== QBSLevel.INSPECTION_LOT }*/ }
        {/*            value={ QBSLevel.MODEL }>{ locale?.Engineering.MODEL }</Select.Option>*/ }
        {/*          <Select.Option*/ }
        {/*            disabled={ this.canAddLevel !== QBSLevel.MODEL }*/ }
        {/*            value={ QBSLevel.CHECK_STEP }>{ locale?.Engineering.CHECK_STEP }</Select.Option>*/ }
        {/*        </Select>*/ }
        {/*        { this.renderMBSorJBS( this.selectedRowKeys, locale as typeof ZhCNEx ) }*/ }
        {/*        /!*<span>{locale?.Engineering.associationMBS}：</span>*/ }
        {/*        <Input disabled={this.cantAddMBS} onClick={e => this.qbsTreeModal = true} readOnly*/ }
        {/*               v-model={associationMBS.name}/>*/ }
        {/*      </aside>*/ }
        {/*    </main>*/ }
        {/*    <div class={ Class.footer }>*/ }
        {/*      <Button onClick={ this.initQbsModal }>{ locale?.Common.Action.cancel }</Button>*/ }
        {/*      <Button loading={ this.qbsModalLoading }*/ }
        {/*              onClick={ this.saveQBSModal }>{ locale?.Common.Action.ok }</Button>*/ }
        {/*    </div>*/ }
        {/*  </article>*/ }
        {/*</Modal>*/ }
        <Modal
          wrapClassName={ Class.templateWrapper }
          closable={ false }
          visible={ this.showTemplateAdd }
          destroyOnClose={ true }
          maskClosable={ false }
          footer={ false }
          onCancel={ e => this.initTemplateModal() }
          width={ 267 }
          dialogStyle={ {
            right: '20px',
            margin: 0,
            marginLeft: 'auto',
            marginRight: '40px',
            top: '180px'
          } }
        >
          <article class={ Class.templateModal }>
            <nav>
              <span class={ Class.topDivision }/>
              <span>{ locale?.Engineering.addTemplate }</span>
            </nav>
            <main class={ Class.templateForm }>
              <VirtualList
                class={ Class.templateUnbindList }
                dataKey={ 'id' }
                dataSources={ this.virtualListAdaptor( this.bizSheet.unbind ) }
                dataComponent={ QualityTemplate.QualityRadio }
                style={ {
                  height: '300px',
                  overflowY: 'auto'
                } }
                extraProps={ {
                  unbindSelectedKeys: this.unbindSelectedKeys,
                  unbindSelectEvent: this.unbindSelectEvent
                } }
                keeps={ 10 }
              />
            </main>
            <div class={ Class.footer }>
              <Button onClick={ this.initTemplateModal }>{ locale?.Common.Action.cancel }</Button>
              <Button loading={ this.bizSheet.templateLoading }
                      onClick={ this.saveTemplate }>{ locale?.Common.Action.ok }</Button>
            </div>
          </article>
        </Modal>
        {/*<Modal*/ }
        {/*  wrapClassName={ Class.qbsTreeWrapper }*/ }
        {/*  closable={ false }*/ }
        {/*  visible={ this.qbsTreeModal }*/ }
        {/*  destroyOnClose={ true }*/ }
        {/*  maskClosable={ false }*/ }
        {/*  footer={ false }*/ }
        {/*  onCancel={ e => this.initQBSTreeModal }*/ }
        {/*  width={ 373 }*/ }
        {/*>*/ }
        {/*  <article class={ Class.qbsTreeSelectModal }>*/ }
        {/*    <nav>*/ }
        {/*      <span class={ Class.topDivision }/>*/ }
        {/*      <span>{ locale?.Engineering.associationMBS }</span>*/ }
        {/*    </nav>*/ }
        {/*    <main class={ Class.qbsForm }>*/ }
        {/*      <nav class={ Class.qbsFormNavOptions }>*/ }
        {/*        <Input.Search*/ }
        {/*          ref={ 'MBSSearch' }*/ }
        {/*          class={ Class.searchInput }*/ }
        {/*          placeholder={ locale?.Engineering.searchPlaceHolder }*/ }
        {/*          enterButton*/ }
        {/*          loading={ this.qbsSelectedLoading }*/ }
        {/*          onSearch={ this.qbsSelectedSearch }*/ }
        {/*        />*/ }
        {/*        <Button onClick={ this.initQBSTreeModal }>{ locale?.Common.Action.cancel }</Button>*/ }
        {/*        <Button onClick={ this.saveQBSTreeModal }>{ locale?.Common.Action.save }</Button>*/ }
        {/*      </nav>*/ }
        {/*      <article class={ Class.qbsTreeContainer }>*/ }
        {/*        <Tree*/ }
        {/*          treeData={ this.qbsMBSTree }*/ }
        {/*          expandedKeys={ this.MBSTreeConfig.expendedKeys }*/ }
        {/*          loadedKeys={ this.MBSTreeConfig.loadedKeys }*/ }
        {/*          //checkedKeys={this.qbsSelected}*/ }
        {/*          selectedKeys={ this.qbsSelected }*/ }
        {/*          onSelect={ this.selectMBSTree }*/ }
        {/*          onExpand={ e => this.MBSTreeConfig.expendedKeys = e }*/ }
        {/*          //checkable={true}*/ }
        {/*          //onCheck={(c, e) => this.qbsSelected = c}*/ }
        {/*          loadData={ this.loadQBSMBSTree }*/ }
        {/*          replaceFields={ {*/ }
        {/*            children: 'childs',*/ }
        {/*            title: 'name',*/ }
        {/*            key: 'id'*/ }
        {/*          } }*/ }
        {/*        />*/ }
        {/*      </article>*/ }
        {/*    </main>*/ }
        {/*  </article>*/ }
        {/*</Modal>*/ }
        {/*<Modal*/ }
        {/*  wrapclass={ Class.qbsTreeWrapper }*/ }
        {/*  closable={ false }*/ }
        {/*  visible={ this.jbsTreeModal }*/ }
        {/*  destroyOnClose={ true }*/ }
        {/*  maskClosable={ false }*/ }
        {/*  footer={ false }*/ }
        {/*  onCancel={ e => this.initJBSTreeModal }*/ }
        {/*  width={ 373 }*/ }
        {/*>*/ }
        {/*  <article class={ Class.qbsTreeSelectModal }>*/ }
        {/*    <nav>*/ }
        {/*      <span class={ Class.topDivision }/>*/ }
        {/*      <span>{ locale?.Engineering.associationJBS }</span>*/ }
        {/*    </nav>*/ }
        {/*    <main class={ Class.qbsForm }>*/ }
        {/*      <nav class={ Class.qbsFormNavOptions }>*/ }
        {/*        <Input.Search*/ }
        {/*          ref={ 'JBSSearch' }*/ }
        {/*          class={ Class.searchInput }*/ }
        {/*          placeholder={ locale?.Engineering.searchPlaceHolder }*/ }
        {/*          enterButton*/ }
        {/*          loading={ this.jbsSelectedLoading }*/ }
        {/*          onSearch={ this.jbsSelectedSearch }*/ }
        {/*        />*/ }
        {/*        <Button onClick={ this.initJBSTreeModal }>{ locale?.Common.Action.cancel }</Button>*/ }
        {/*        <Button onClick={ this.saveJBSTreeModal }>{ locale?.Common.Action.save }</Button>*/ }
        {/*      </nav>*/ }
        {/*      <article class={ Class.qbsTreeContainer }>*/ }
        {/*        <Tree*/ }
        {/*          ref={ 'JBSTree' }*/ }
        {/*          treeData={ this.qbsJBSTree }*/ }
        {/*          expandedKeys={ this.JBSTreeConfig.expendedKeys }*/ }
        {/*          loadedKeys={ this.JBSTreeConfig.loadedKeys }*/ }
        {/*          //checkedKeys={this.qbsSelected}*/ }
        {/*          selectedKeys={ this.jbsSelected }*/ }
        {/*          onSelect={ this.selectJBSTree }*/ }
        {/*          onExpand={ e => this.JBSTreeConfig.expendedKeys = e }*/ }
        {/*          //checkable={true}*/ }
        {/*          //onCheck={(c, e) => this.qbsSelected = c}*/ }
        {/*          loadData={ this.loadQBSJBSTree }*/ }
        {/*          replaceFields={ {*/ }
        {/*            children: 'childs',*/ }
        {/*            title: 'name',*/ }
        {/*            key: 'id'*/ }
        {/*          } }*/ }
        {/*        />*/ }
        {/*      </article>*/ }
        {/*    </main>*/ }
        {/*  </article>*/ }
        {/*</Modal>*/ }
        {/*<Modal*/ }
        {/*  wrapclass={ Class.qbsTreeWrapper }*/ }
        {/*  closable={ false }*/ }
        {/*  visible={ this.jbsTypeModal.visible }*/ }
        {/*  destroyOnClose={ true }*/ }
        {/*  maskClosable={ false }*/ }
        {/*  footer={ false }*/ }
        {/*  onCancel={ e => this.jbsTypeModal.visible = false }*/ }
        {/*  width={ 373 }*/ }
        {/*>*/ }
        {/*  <article class={ Class.qbsTreeSelectModal }>*/ }
        {/*    <nav>*/ }
        {/*      <span class={ Class.topDivision }/>*/ }
        {/*      <span>{ locale?.Engineering.changeJBSType }</span>*/ }
        {/*    </nav>*/ }
        {/*    <main class={ Class.qbsForm }>*/ }
        {/*      <div class={ Class.jbsTypeSelection }>*/ }
        {/*        <nav>{ locale?.Engineering.choseJBSType }：</nav>*/ }
        {/*        <div class={ Class.selector }>*/ }
        {/*          <Select*/ }
        {/*            v-model={ jbsTypeModal.FirstLevel }*/ }
        {/*            onChange={ this.jbsFirstLevelChange }*/ }
        {/*          >*/ }
        {/*            { this.renderLevelOptions( this.jbsTypeModal.FirstLevelOptions ) }*/ }
        {/*          </Select>*/ }
        {/*          <Select*/ }
        {/*            v-model={ jbsTypeModal.SecondLevel }*/ }
        {/*            onChange={ this.jbsSecondLevelChange }*/ }
        {/*          >*/ }
        {/*            { this.renderLevelOptions( this.jbsTypeModal.SecondLevelOptions ) }*/ }
        {/*          </Select>*/ }
        {/*        </div>*/ }
        {/*      </div>*/ }
        {/*    </main>*/ }
        {/*    <div class={ Class.SelectTypeFooter }>*/ }
        {/*      <Button onClick={ this.initJBSTypeModal }>{ locale?.Common.Action.cancel }</Button>*/ }
        {/*      <Button onClick={ this.saveJBSTypeModal } loading={ this.jbsTypeModal.loading }*/ }
        {/*              type={ 'primary' }>{ locale?.Common.Action.save }</Button>*/ }
        {/*    </div>*/ }
        {/*  </article>*/ }
        {/*</Modal>*/ }
      </article>
    );
  }

  private initQBSTreeModal() {
    this.qbsTreeModal = false;
    this.qbsSelected = [];
    this.initModalTree();
  }

  private initJBSTreeModal() {
    this.jbsTreeModal = false;
    this.jbsTreeName = null;
    this.jbsSelected = [];
    this.initModalTree();
  }

  /*private saveQBSTreeModal() {
    if ( !this.qbsSelected.length ) return;
    const {
      qbsSelected,
      projectName,
      projectCode,
      selectedRowKeys,
      findCurrent,
      qbsMBSTree
    } = this;
    this.initQBSTreeModal();
    const target = findCurrent( qbsSelected[0], qbsMBSTree );
    if ( !target ) return;
    this.qbsFormModal.associationMBS = {
      mbsCode: target.mbsCode,
      id: qbsSelected[0],
      name: target.name
    };
  }

  private saveJBSTreeModal() {
    //TODO:wait2 finish JBSTree
    if ( !this.jbsSelected.length ) return;
    const {
      jbsSelected,
      findCurrent,
      qbsJBSTree
    } = this;
    this.initJBSTreeModal();
    const target = findCurrent( jbsSelected[0], qbsJBSTree );
    if ( !target ) return;

    this.jbsFormModal.associationJBS = {
      name: target.name,
      jbsCode: target.jbsCode,
      id: target.id
    }
  }

  private saveQBSModal() {
    if ( this.qbsModalLoading ) return;
    this.qbsModalLoading = true;
    const {
      qbsSelected,
      projectName,
      projectCode,
      selectedRowKeys,
      jbsFormModal,
      findCurrent,
      cantAddMBS,
      locale,
      projectConfig
    } = this;
    const target = findCurrent( selectedRowKeys[0] );
    if ( !target ) return;
    const {
      engineeringParts,
      correspondingCode,
      dividedCategories,
      associationMBS
    } = this.qbsFormModal;
    if ( !engineeringParts ) {
      this.qbsModalLoading = false;
      return this.$message.error( locale?.Engineering.engineeringPartsRequired ?? '' );
    }
    if ( !correspondingCode ) {
      this.qbsModalLoading = false;
      return this.$message.error( locale?.Engineering.correspondingCodeRequired ?? '' );
    }
    if ( !dividedCategories ) {
      this.qbsModalLoading = false;
      return this.$message.error( locale?.Engineering.dividedCategoriesRequired ?? '' );
    }
    const parentLot = findCurrent( target.parentId );
    if ( dividedCategories === QBSLevel.CHECK_STEP ) {
      Api.addQBSNode( {
        appCode: projectCode as string,
        projectName: this.projectConfig?.projectName as string,
        level: QBSLevel.CHECK_STEP,
        // name: engineeringParts,
        name: jbsFormModal.associationJBS.name ?? "",
        parentName: parentLot?.name as string,
        parentId: parentLot?.id as string,
        parentLevel: parentLot?.level as number,
        parentQbsCode: parentLot?.qbsCode as string,
        qbsCode: `${ parentLot?.qbsCode }&${ jbsFormModal.associationJBS.jbsCode }`
      } ).then( res => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.initQbsModal( true );
      } )
    } else if ( dividedCategories === QBSLevel.CHECK_POINT ) {
      Api.addQBSNode( {
        appCode: projectCode as string,
        projectName: this.projectConfig?.projectName as string,
        level: QBSLevel.CHECK_POINT,
        name: engineeringParts,
        parentName: parentLot?.name as string,
        parentId: target.id,
        parentLevel: target.level,
        parentQbsCode: target.qbsCode,
        qbsCode: `${ target.qbsCode }.P${ correspondingCode }`
      } ).then( res => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.initQbsModal( true );
      } )
    } else if ( cantAddMBS ) {
      Api.addQBSNode( {
        appCode: projectCode as string,
        projectName: projectConfig?.projectName as string,
        level: dividedCategories,
        name: engineeringParts,
        parentName: target?.name as string,
        parentId: target.id,
        parentLevel: target.level,
        parentQbsCode: target.qbsCode,
        qbsCode: correspondingCode
      } ).then( res => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.initQbsModal( true );
      } )
    } else {
      if ( !associationMBS.name || !associationMBS.mbsCode || !associationMBS.id ) return this.$message.error( locale?.Engineering.associationMBSRequired ?? '' );
      Api.batchOptMBSNode( {
        addNodes: [ {
          id: associationMBS.id,
          name: engineeringParts,
          projectName: this.projectConfig?.projectName as string,
          parentId: target.id,
          qbsCode: target.qbsCode,
          level: dividedCategories,
          mbsCode: associationMBS.mbsCode,
          mbsName: associationMBS.name,
        } ],
        delNodes: [],
        appCode: projectCode as string,
        level: target.level,
        projectName: this.projectConfig?.projectName as string,
        qbsNodeId: target.id,
        type: target.type
      } ).then( res => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.initQbsModal( true );
      } )
    }

  }*/

  private viralList() {
    const data: Array<{ id: string, qbsName: string }> = [];
    const count = 1000;
    let idCounter = 0;
    for ( let index = 0; index < count; index++ ) {
      data.push( {
        id: String( idCounter++ ),
        qbsName: Math.random()
          .toString( 16 )
          .substr( 10 )
      } )
    }
    return data
  }

  private calcContentHeight() {
    const dom = this.TemplateList, main = this.MainContainer;
    if ( !dom || !main ) return;
    //dom
    const { x, y, width, height } = main.getClientRects()[0];
    // this.templateHeight = height - 42 - 22;
    this.templateHeight = height - 57 - 42 - 44;
    console.log( 'calcContentHeight====>', this.templateHeight );
  }

  private unbindSelectEvent( id?: string ) {
    if ( id ) this.unbindSelectedKeys = [ id ];
  }

  private async viewQBSSheet( source: Type.QualityQBSBiz ) {
    console.log( 'viewQBSSheet=====>', source );
    return;
    /*if ( !source.others ) return;
    //const { schemaCode, sheetCode, status, recordId, workFlowCode,datas } = source.others;
    const {
      schemaCode,
      mbsCode,
      datas,
      workFlowCode,
      sheetCode,
      qbsCode,
      bizAppCode
    } = source.others;
    const { projectCode, currentRow, projectConfig } = this;
    //todo: only for test
    //todo: should add workflow
    // const urlProjectCode = projectCode;
    const urlProjectCode = bizAppCode;
    const urlProjectName = this.projectConfig?.projectName as string;
    //const urlAction = recordId ? 'detail' : 'add';
    let targetObj: Type.QualityQBSBiz | null = null;
    if ( datas && datas.length ) {
      targetObj = datas[0];
    }
    const urlAction = targetObj ? 'detail' : 'add';
    const urlReturn = `/${ urlProjectCode }/QualityDB?code=${ schemaCode }&openMode&pcUrl&queryCode=&iframeAction=${ urlAction }`;
    let url = `/${ urlProjectCode }/form/detail?schemaCode=${ schemaCode }&sheetCode=${ schemaCode }&queryCode=${ schemaCode }&mbsCode=${ currentRow?.mbsCode }&qbsCode=${ currentRow?.qbsCode }&projectName=${ urlProjectName }`;
    let urlDetail = `/${ urlProjectCode }/form/detail?sheetCode=${ schemaCode }&objectId=${ targetObj?.bizObjId }&schemaCode=${ schemaCode }&isWorkFlow=false&return=${ encodeURIComponent( urlReturn ) }`;
    //if(workFlowCode)
    if ( workFlowCode ) {
      url += `&startWorkflowCode=${ workFlowCode }&return=${ encodeURIComponent( urlReturn ) }`;
      const target = await Api.getWorkFlowFormDetailUrl( {
        schemaCode,
        bizObjectId: targetObj?.bizObjId as string
      } ) as string;
      console.log( 'target===>', target );
      urlDetail = `/${ urlProjectCode }${ target }`;
    } else {
      url += `&return=${ encodeURIComponent( urlReturn ) }`;
    }
    ;
    console.log( 'url===>', url );
    console.log( 'urlDetail===>', urlDetail );
    window.open( urlAction === 'add' ? url : urlDetail );*/
  }

  private getTableColumn( locale?: typeof ZhCNEx, checkBoxEnable?: boolean ): Array<Type.TableColumn<any>> {
    if ( !locale ) return [];
    const defaultColumns: Array<Type.TableColumn<any>> = [
      {
        type: 'checkbox',
        width: 40,
        align: 'center'
      },
      {
        title: locale.Engineering.partCode,
        align: 'left',
        dataIndex: 'qbsCode',
        ellipsis: true,
        key: 'header_0',
        treeNode: true,
        width: 300
      },
      {
        title: locale.Engineering.taskName,
        dataIndex: 'qbsName',
        align: 'center',
        ellipsis: true,
        key: 'header_1',
        // width: 150,
        //customRender: (t, r) => this.renderRelationCode (t, r, locale)
      },
      /*{
        title: locale.Engineering.codeType,
        dataIndex: 'type',
        ellipsis: true,
        key: 'header_2',
        width: 100
      },*/
      {
        title: locale.Engineering.type,
        dataIndex: 'level',
        ellipsis: true,
        key: 'header_3',
        width: 100,
        customRender: ( t, r ) => this.renderRelationEnum( t, r, locale )
      }

    ];
    if ( !checkBoxEnable ) {
      defaultColumns.shift();
    }
    /*if ( edit ) defaultColumns.push ({
      title: locale.Engineering.optionsFn,
      ellipsis: true,
      key: 'options_1',
      width: 150,
      customRender: (t, r) => this.renderOptionsColumn (t, r, locale)
    });*/
    return defaultColumns;
  }

  /*private treeLazyLoadAdaptor( origin: Array<Type.QualityTable>, add: Array<Type.QualityTable>, id?: string, resolve?: Function ) {
    Utils.deepFind( origin, item => {
      if ( item.id === id ) {
        item.childs = add.map( child => {
          if ( !child.leaf ) {
            child.childs = [];
            child.hasChild = true;
          } else {
            //@ts-ignore
            child.isLeaf = true;
            child.childs = undefined;
            child.hasChild = false;
          }
          return child;
        } );
        resolve?.();
        return true;
      } else {
        resolve?.();
        return false;
      }
    }, 'childs' );
  }*/

  /*private lazyLoadTree( expanded, record ) {
    console.log( 'expanded!', record );
    const { id, level } = record, {
      projectName,
      projectCode,
      treeLazyLoadAdaptor,
      mainTable
    } = this;
    if ( !id ) return;
    //TODO:lazyGetTreeNode
    if ( expanded ) {
      Api.queryQualityTable( {
        appCode: projectCode as string,//projectCode,
        projectName: this.projectConfig?.projectName as string,
        //nodeId: id,
        qbsId: id,
        level: level,
        name: this.condition ? this.condition : undefined
      } ).then( res => {
        this.mainTable.loading = false;
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        if ( res.data ) treeLazyLoadAdaptor( mainTable.dataSource, res.data, id )
      } )
    }
  }*/

  /* private vxTreeAdapter( record: Array<Type.QualityTable> ) {
     if ( !record || !record.length ) return;
     record.forEach( item => {
       /!*!//TODO:merge jbsCodeID
       //@ts-ignore
       if (item.jbsCode && item.leaf) {
         item.id = `${item.id}-${item.parentId}-${Utils.uuid()}`
       }*!/
       if ( !item.leaf ) {
         item.childs = [];
         item.hasChild = true;
       } else {
         item.isLeaf = true;
         item.childs = undefined;
         item.hasChild = false;
       }
     } );
     return record;
   }*/

  /*private lazyLoadVXTree( { row }: { row: Type.QualityTable } ) {
    const { id, level } = row, {
      projectName,
      projectCode,
      vxTreeAdapter,
      mainTable
    } = this;
    if ( !id ) return;
    return new Promise( resolve => {
      Api.queryQualityTable( {
        appCode: projectCode as string,//projectCode,
        projectName: this.projectConfig?.projectName as string,
        //nodeId: id,
        qbsId: id,
        level: level,
        name: this.condition ? this.condition : undefined
      } ).then( res => {
        this.mainTable.loading = false;
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        if ( res.data ) resolve( vxTreeAdapter( res.data ) );
        /!*if (res.data) treeLazyLoadAdaptor(mainTable.dataSource, res.data, id)*!/
      } )
    } )
  }*/

  private findCurrent( id: string, source?: Array<Type.QualityTable> ): Type.QualityTable | null {
    const { mainTable, treeChild } = this;
    let target: Type.QualityTable | null = null;
    Utils.deepFind( source ? source : mainTable.dataSource, ( item: Type.QualityTable ) => {
      if ( item.id === id ) {
        target = item;
        return true;
      } else {
        return false
      }
    }, treeChild );
    return target;
  }

  /*private loadQBSMBSTree( treeNode ) {
    const { eventKey: id, expanded } = treeNode, {
      projectCode,
      projectName,
      treeLazyLoadAdaptor,
      qbsMBSTree,
      findCurrent,
      MBSSearch,
      selectedRowKeys,
    } = this;
    if ( !id ) return;
    const target = findCurrent( selectedRowKeys[0] );
    return new Promise( ( resolve, reject ) => {
      if ( !expanded ) {
        Api.queryUnbindQBSTree( {
          appCode: projectCode as string,//projectCode,
          projectName: this.projectConfig?.projectName as string,
          level: target?.level as number,
          mbsNodeId: id,
          name: MBSSearch?.$refs.input.stateValue,
          qbsNodeId: target?.id as string,
          type: target?.type as string
        } ).then( res => {
          if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
          if ( res.data ) treeLazyLoadAdaptor( qbsMBSTree, res.data, id, resolve )
        } )
      }
    } );
  }

  private loadQBSJBSTree( treeNode ) {
    const { eventKey: id, expanded } = treeNode, {
      treeLazyLoadAdaptor,
      qbsJBSTree,
      findCurrent,
      JBSSearch,
      selectedRowKeys,
    } = this;
    if ( !id ) return;
    const target = findCurrent( id, qbsJBSTree );
    return new Promise( ( resolve, reject ) => {
      if ( !expanded ) {
        Api.queryJBSTree( {
          nodeId: id,
          name: JBSSearch?.$refs.input.stateValue as string,
        } ).then( res => {
          if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
          if ( res.data ) treeLazyLoadAdaptor( qbsJBSTree, res.data, id, resolve )
        } )
      }
    } )
  }*/

  private selectMBSTree( selectedKeys, { selected, selectedNodes, event } ) {
    const { findCurrent, qbsMBSTree } = this;
    const target = findCurrent( selectedKeys[0], qbsMBSTree );
    if ( target?.leaf ) this.qbsSelected = selectedKeys;

  }

  private selectJBSTree( selectedKeys, { selected, selectedNodes, event } ) {
    const { findCurrent, qbsJBSTree } = this;
    const target = findCurrent( selectedKeys[0], qbsJBSTree );
    if ( target?.leaf ) this.jbsSelected = selectedKeys;
  }

  /*private cantBeAdded( selectedRowKeys: string ) {
    const { findCurrent } = this;
    if ( !selectedRowKeys ) return this.disabledAdd = true;
    const target = findCurrent( selectedRowKeys );
    if ( !target ) return this.disabledAdd = true;
    switch ( target.level ) {
      case QBSLevel.INSPECTION_LOT:
        this.cantAddMBS = true;
        break;
      default:
        this.cantAddMBS = false;
        break;
    }
    if ( target.type === 'MBS' ) return this.disabledAdd = true;
    this.disabledAdd = false;
  }*/

  // private cantBeAddedVXTable( row: Type.QualityTable ) {
  //   if ( !row ) return this.disabledAdd = true;
  //   switch ( row.level ) {
  //     case QBSLevel.INSPECTION_LOT:
  //       this.cantAddMBS = false;
  //       break;
  //     default:
  //       this.cantAddMBS = true;
  //       break;
  //   }
  //   //if (row.type === 'MBS') return this.disabledAdd = true;
  //   if ( row.level === QBSLevel.CHECK_STEP ) return this.disabledAdd = true;
  //   if ( row.level === QBSLevel.CHECK_POINT ) return this.disabledAdd = true;
  //   this.disabledAdd = false;
  // }

  private virtualListAdaptor( origin: Array<Type.QualityQBS> ) {
    return origin.map( item => {
      return {
        id: item.schemaCode,
        //bizSheetName: item.bizSheetName,
        bizSheetName: item.sheetName,
        others: item
      }
    } );
  }

  // private renderMBSorJBS( selectedKeys: Array<string>, locale: typeof ZhCNEx ) {
  //   const {
  //     findCurrent,
  //     qbsFormModal,
  //     jbsFormModal
  //   } = this, { associationMBS } = qbsFormModal, { associationJBS } = jbsFormModal;
  //   if ( !selectedKeys.length ) return [];
  //   let vNode: Array<JSX.Element> = [];
  //   const target = findCurrent( selectedKeys[0] );
  //   if ( !target ) return vNode;
  //   switch ( target.level ) {
  //     case QBSLevel.INSPECTION_LOT:
  //       vNode = [
  //         <span>{ locale?.Engineering.associationMBS }：</span>,
  //         <Input
  //           disabled={ this.cantAddMBS }
  //           onClick={ e => this.qbsTreeModal = true }
  //           readOnly
  //           v-model={ associationMBS.name }
  //         />
  //       ]
  //       break;
  //     case QBSLevel.MODEL:
  //       vNode = [
  //         <span>{ locale?.Engineering.associationJBS }：</span>,
  //         <Input
  //           disabled={ target.level !== QBSLevel.MODEL }
  //           onClick={ e => this.jbsTreeModal = true }
  //           readOnly
  //           v-model={ associationJBS.name }
  //         />
  //       ]
  //       break;
  //     default:
  //       vNode = [
  //         <span style={ { visibility: 'hidden' } }/>,
  //         <Input style={ { visibility: 'hidden', width: '200px' } }/>
  //       ]
  //       break;
  //   }
  //   return vNode;
  // }

  private oneKeyImport() {
    const {
      oneKeyImportLoading,
      projectCode,
      projectName,
      setAllTreeExpanded,
      projectConfig
    } = this;
    if ( oneKeyImportLoading ) return;
    this.oneKeyImportLoading = true;
    Api.setOneKeyImport( {
      appCode: projectCode as string,
      projectName: projectConfig?.projectName as string,
    } ).then( res => {
      this.oneKeyImportLoading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.getMainTableDebounce( 0, projectCode, projectConfig?.projectName, undefined, this.condition && undefined, setAllTreeExpanded );
    } )
  }

  private treeVXTableExpand( { expanded, row } ) {
    const index = this.vxTableTreeExpanded.findIndex( item => item === row.id );
    if ( expanded && index === -1 ) {
      this.vxTableTreeExpanded.push( row.id );
    } else {
      this.vxTableTreeExpanded.splice( index, 1 );
    }
  }

  private setCurrentRow() {

  }

  created() {
    //only for test
    //this.projectConfig?.updateProjectConfig('弥河工程', 1,null);
    //end
  }

  //quality V2.0

  private mbsStateCollection: MbsStatus<Type.MBSTable, Type.MBSModelNode> = {
    checkKeys: [],
    dataSource: [],
    modelDataSource: [],
    loading: false,
    mountLoading: false,
    checkEnable: false,
    selectKey: null,
    selectRow: null,
    conditions: null,
    operation: false
  };

  private openTemplateModal( qbsJbsId?: string ) {
    const {
      projectName,
      projectCode,
      selectedRowKeys,
      findCurrent,
      bizSheet,
      projectConfig,
      mainTable,
    } = this;
    if ( bizSheet.loading ) return;
    if ( !mainTable.selectRow ) return;
    //const target = findCurrent( selectedRowKeys[0] );
    // if ( !target ) return;
    //if (target.type !== 'MBS') return this.bizSheet.unbind = [];
    this.bizSheet.loading = true;
    Api.getUnbindBizSheet( {
      currentPage: 0,
      pageNum: 999999,
      //qbsId: mainTable.selectRow.id
      qbsJbsId: qbsJbsId as string
    } ).then( res => {
      this.showTemplateAdd = true;
      this.bizSheet.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) this.bizSheet.unbind = res.data.hits ?? [];
    } )
    /*Api.queryAllQualitySheetUnbind( {
      appCode: projectCode as string,
      projectName: projectConfig?.projectName as string,
      qbsCode: target.qbsCode,
      qbsId: target.type === 'MBS' ? target.parentId : target.id,
      type: target.type,
      level: target.level
    } ).then( res => {
      this.showTemplateAdd = true;
      this.bizSheet.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) this.bizSheet.unbind = res.data.hits ?? [];
    } )*/
  }

  private jbsModal: JBSModal = {
    loading: false,
    processDefault: null,
    projectDefault: null,
    structureDefault: null,
    allOptions: [],
    processOptions: [],
    projectOptions: [],
    structureOptions: [],
    visible: false
  }

  private saveTemplate() {
    const { unbind, templateLoading } = this.bizSheet, {
      unbindSelectedKeys,
      mainTable,
      projectName,
      projectCode,
      selectedRowKeys,
      findCurrent,
      projectConfig,
      jbsNode
    } = this;
    if ( templateLoading ) return;
    this.bizSheet.templateLoading = true;
    const target = unbind.find( item => item.schemaCode === unbindSelectedKeys[0] );
    //const qbsTarget = findCurrent( selectedRowKeys[0] );
    if ( !mainTable.selectRow || !target ) return;
    console.log( 'saveTemplate===>', target );
    Api.editBindBizSheet( {
      addNodes: [ {
        bizId: target.bizId,
        jbsId: mainTable.selectRow.jbsId,
        appCode: target.appCode,
        schemaCode: target.schemaCode,
      } ],
      delNodes: [],
      // qbsJbsId: jbsNode.currentId as string
      qbsJbsId: jbsNode.activeNode.id as string
      /*jbsId: mainTable.selectRow.jbsId,
      qbsId: mainTable.selectRow.id*/
    } ).then( res => {
      this.bizSheet.templateLoading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.getBindBizSheet();
      this.initTemplateModal();
    } )
    //TODO:add Request
    /* Api.batchBindOptBizSheet( {
       addNodes: [ {
         bizSheetName: target.bizSheetName,
         projectName: this.projectConfig?.projectName as string,
         schemaCode: target.schemaCode,
         sheetCode: target.sheetCode,
         qbsName: qbsTarget.name,
         qbsId: qbsTarget.type === 'MBS' ? qbsTarget.parentId : qbsTarget.id,
         qbsCode: qbsTarget.qbsCode,
       } ],
       appCode: projectCode as string,
       projectName: projectConfig?.projectName as string,
       qbsNodeId: qbsTarget.type === 'MBS' ? qbsTarget.parentId : qbsTarget.id,
       type: qbsTarget.type
     } ).then( res => {
       this.bizSheet.templateLoading = false;
       if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
       this.initTemplateModal( true );
     } );*/
  }

  private initMbsStateCollection( freeze?: boolean ) {
    this.mbsStateCollection.loading = false;
    this.mbsStateCollection.dataSource = [];
    this.mbsStateCollection.checkKeys = [];
    this.mbsStateCollection.selectKey = null;
    this.mbsStateCollection.conditions = null;
    //version 3.0.0
    this.mbsStateCollection.modelDataSource = [];
    if ( freeze ) {
      //nothing to do
    } else {
      this.mbsStateCollection.operation = false;
    }

  }

  private enableMount() {
    this.mbsStateCollection.checkEnable = true;
  }

  private cancelMount() {
    const { mbsStateCollection } = this;
    this.clearChecked<Type.MBSTable>( mbsStateCollection.dataSource, 'children' );
    this.mbsStateCollection.checkEnable = false;
  }

  private confirmMount() {
    const { locale, mainTable, mbsStateCollection, projectConfig, projectCode } = this;
    const checkRows = this.MBSTree.getCheckedRows( true ).filter( item => item.leaf && !item.mark );
    if ( mbsStateCollection.mountLoading ) return;
    if ( !checkRows.length ) {
      return this.$message.warn( locale?.Engineering.EmptyMBSNode as string );
      //return this.cancelMBSOpt();
    }
    mbsStateCollection.mountLoading = true;
    Api.mountQBSTree( {
      appCode: projectCode as string,
      //@ts-ignore
      addNodes: checkRows.map( item => {
        return {
          codeValue: item.codeValue,
          taskName: item.taskName,
          modelTypeId: item.modelTypeId
        }
      } ),
      projectName: projectConfig?.projectName ?? "",
      qbsId: mainTable.selectRow?.id ?? ""
    } ).then( res => {
      mbsStateCollection.mountLoading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      //if ( res.errcode === 0 ) this.cancelMount();
      this.cancelMBSOpt();
      // this.getQBSTree()?.then( () => {
      //   return this.autoSetFirstInit();
      // } );
    } )
  }

  private initJBSModal() {
    const { jbsModal } = this;
    jbsModal.visible = false;
    jbsModal.structureOptions = [];
    jbsModal.processOptions = [];
  }

  private getJBSTree( nodeId?: string ) {
    const { qbsModal, jbsModal } = this;
    return Api.queryJBSTree( {
      nodeId: nodeId,
      appCode: this.projectCode
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      qbsModal.projectOptions = res.data.map( item => item );
      jbsModal.projectOptions = res.data.map( item => item );
      jbsModal.allOptions = res.data;
      this.initJBSModal();
    } );
  }

  private getBindBizSheet() {
    const { mainTable } = this;
    /*return Api.getBindBizSheet( {
      currentPage: 0,
      pageNum: 999999,
      qbsId: mainTable.selectRow?.id ?? ""
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.mainTable.treeData = res.data.hits ?? [];
      }
    } )*/
    return this.getJBSNodes();
  }

  private filterStructure( key: string ) {
    console.log( key );
    const { qbsModal } = this;
    let options = [];
    Utils.deepFind( qbsModal.projectOptions, item => {
      if ( item.id === key ) {
        options = item.childs;
        return true;
      } else {
        return false;
      }
    }, 'childs' );
    qbsModal.structureOptions = options;
  }

  private initQBSModal() {
    const { qbsModal } = this;
    qbsModal.jbsId = null;
    qbsModal.mbsCode = null;
    qbsModal.modelTypeId = null;
    qbsModal.visible = false;
    qbsModal.edit = false;
    qbsModal.isINSPECTION_LOT = false;
    qbsModal.taskName = null;
    qbsModal.codeValue = null;
    qbsModal.level = undefined;
    //qbsModal.structureOptions = [];
    this.filterStructure( qbsModal.projectDefault as string );
  }

  private autoSetProjectDefault( modelTypeId: string ) {
    const { qbsModal } = this;
    let parentId: string;
    Utils.deepFind( qbsModal.projectOptions, item => {
      if ( item.id === modelTypeId ) {
        parentId = item.parentId;
        return true;
      } else {
        return false;
      }
    }, 'childs' );
    return qbsModal.projectOptions.find( item => item.id === parentId ).id;
  }

  private editQBSTreeNode() {
    //todo edit
    const { mainTable, qbsModal } = this;
    if ( !mainTable.selectRow ) return;
    qbsModal.edit = true;
    qbsModal.visible = true;
    qbsModal.modelTypeId = mainTable.selectRow.modelTypeId;
    qbsModal.level = mainTable.selectRow.level === null ? 0 : mainTable.selectRow.level;
    if ( qbsModal.modelTypeId ) {
      qbsModal.isINSPECTION_LOT = true;
      qbsModal.projectDefault = this.autoSetProjectDefault( qbsModal.modelTypeId );
    }
    qbsModal.taskName = mainTable.selectRow.qbsName;
    qbsModal.codeValue = mainTable.selectRow.qbsCode;
  }

  private addQBSTreeNode() {
    //todo edit
    const { mainTable, qbsModal } = this;
    //if ( !mainTable.selectRow ) return;
    qbsModal.visible = true;
    if ( qbsModal.modelTypeId ) {
      qbsModal.isINSPECTION_LOT = true;
    }
  }

  /* 修改逻辑 */
  private relevanceQBSndMBS() {
    const { locale, MBSTree, mainTable, mbsStateCollection, $refs } = this;
    //if ( !mbsStateCollection.selectRow ) return;  QualityVersion 3.0.0
    if ( !$refs.RelevanceBtn ) return;
    //if ( !mainTable.selectRow || !mbsStateCollection.selectRow ) return; QualityVersion 3.0.0
    if ( !mainTable.selectRow ) return;
    const checkRows = this.MBSTree.getCheckedRows( true ).filter( item => item.leaf );
    if ( checkRows.length > 1 ) {
      //return this.$message.warn( locale?.Engineering.OnlyOneMBSNode as string );
    } else if ( !checkRows.length ) {
      return this.$message.warn( locale?.Engineering.EmptyMBSNode as string );
    }
    //const target = checkRows[0];

    const btn: Button = $refs.RelevanceBtn;
    if ( btn.loading ) return;
    btn.loading = true;
    Api.editQBSTreeNode( {
      appCode: mainTable.selectRow.appCode,
      projectName: mainTable.selectRow.projectName,
      jbsId: mainTable.selectRow.jbsId,
      // mbsCode: mbsStateCollection.selectRow.codeValue, QualityVersion 3.0.0
      //mbsCode: target.codeValue,
      mbsCodes: checkRows.map( item => item.codeValue ),
      modelTypeId: mainTable.selectRow.modelTypeId,
      name: mainTable.selectRow.qbsName,
      qbsCode: mainTable.selectRow.qbsCode,
      qbsId: mainTable.selectRow.id
    } ).then( res => {
      btn.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.getQBSTree()?.then( () => {
        this.autoSetFirstInit();
      } );
    } )
  }

  private submitQBSModal() {
    const { mainTable, qbsModal, projectConfig, projectCode, locale } = this;
    if ( qbsModal.loading ) return;
    qbsModal.loading = true;
    if ( qbsModal.edit && !qbsModal.codeValue ) return this.$message.error( locale?.Engineering.correspondingCodeRequired as string );
    if ( !qbsModal.taskName ) return this.$message.error( locale?.Engineering.taskNameRequired as string );
    if ( qbsModal.isINSPECTION_LOT && !qbsModal.modelTypeId ) return this.$message.error( locale?.Engineering.structureCategoryRequired as string );
    if ( qbsModal.edit ) {
      Api.editQBSTreeNode( {
        appCode: mainTable.selectRow?.appCode ?? undefined,
        projectName: mainTable.selectRow?.projectName ?? undefined,
        jbsId: mainTable.selectRow?.jbsId ?? undefined,
        //mbsCode: mainTable.selectRow?.mbsCode ?? undefined,
        //mbsCodes: mainTable.selectRow ? [ mainTable.selectRow.mbsCode ] : undefined,
        mbsCodes: mainTable.selectRow ? mainTable.selectRow.mbs.map( item => item.mbsCode ) : undefined,
        modelTypeId: qbsModal.isINSPECTION_LOT && qbsModal.modelTypeId || "",
        name: qbsModal.taskName ?? "",
        qbsCode: qbsModal.codeValue ?? "",
        level: qbsModal.level,
        qbsId: mainTable.selectRow?.id ?? undefined
      } ).then( res => {
        qbsModal.loading = false;
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.initQBSModal();
        this.getQBSTree()?.then( () => {
          this.autoSetFirstInit();
        } );
      } )
    } else {
      Api.addQBSTreeNode( {
        appCode: projectCode,
        projectName: projectConfig?.projectName ?? "",
        name: qbsModal.taskName ?? "",
        parentId: mainTable.selectRow?.id ?? "",
        level: qbsModal.level,
        qbsCode: qbsModal.codeValue ?? ""
      } ).then( res => {
        qbsModal.loading = false;
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.initQBSModal();
        this.getQBSTree()?.then( () => {
          this.autoSetFirstInit();
        } )
      } );
    }
  }

  private getQBSTree( qbsId?: string ) {
    const { mainTable, QBSTreeAdapter, projectConfig, projectCode } = this;
    if ( mainTable.loading ) return;
    mainTable.loading = true;
    return Api.getQBSTree( {
      appCode: projectCode as string,
      name: mainTable.conditions ?? undefined,
      projectName: projectConfig?.projectName ?? "",
      qbsId: qbsId,
      flag: true
    } ).then( res => {
      this.mainTable.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.QBSTree.clearCurrentRow();
        this.mainTable.selectRow = null;
        this.mainTable.treeData = [];
        this.mainTable.dataSource = QBSTreeAdapter<Type.QualityTable>( res.data, 'childs' ) as Array<Type.QualityTable>;
      }
    } );
  }

  private static stopExpendQBSTree( item: Type.QualityTable ) {
    return !item.leaf && !item.childs.length;
  }

  private static stopExpendMBSTree( item: Type.MBSTable ) {
    return !!item.childCount && !item.children.length;
  }

  private static checkAble( { row }: { row: Type.QualityTable | Type.MBSTable } ) {
    return row.leaf ?? false;
  }

  private treeLazyAdapter<T>( records: Array<T>, childField?: string ) {
    const { QBSTreeAdapter } = this;
    if ( !records || !records.length ) return;
    return QBSTreeAdapter( records, childField ?? 'childs' );
  }

  private loadQBSTree( { row }: { row: Type.QualityTable } ) {
    const { id } = row, { projectCode, mainTable, projectConfig } = this;
    if ( !id ) return;
    return new Promise( resolve => {
      Api.getQBSTree( {
        appCode: projectCode as string,
        name: mainTable.conditions ?? "",
        projectName: projectConfig?.projectName as string,
        qbsId: id,
        flag: true
      } ).then( res => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        if ( res.data ) resolve( this.treeLazyAdapter( res.data ) );
      } )
    } )
  }

  private getMBSTree( qbsId: string, mbsId?: string ) {
    const { mainTable, mbsStateCollection, QBSTreeAdapter } = this;
    if ( !mainTable.dataSource.length ) return;
    if ( mbsStateCollection.loading ) return;
    mbsStateCollection.loading = true;
    Api.getMBSTree( {
      qbsId: qbsId,
      name: mbsStateCollection.conditions ?? "",
      mbsId: mbsId,
    } ).then( res => {
      this.mbsStateCollection.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) this.mbsStateCollectionAdapter( res.data );
    } );
  }

  private getMBSModelTree( qbsId: string ) {
    const { mbsStateCollection, projectConfig, projectCode } = this;
    if ( mbsStateCollection.loading ) return;
    mbsStateCollection.loading = true;
    Api.getMBSModelList( {
      qbsId: qbsId
    } ).then( res => {
      mbsStateCollection.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) mbsStateCollection.modelDataSource = res.data;
    } )
  }

  private getMBSModelTreeDebounce = Utils.debounce( ( qbsId: string ) => {
    if ( qbsId ) {
      this.getMBSModelTree( qbsId );
    } else {
      this.initMbsStateCollection();
      //this.mbsStateCollection.modelDataSource = [];
    }
  }, 300 );

  private loadMBSTree( { row }: { row: Type.MBSTable } ) {
    const { id } = row, { projectCode, projectConfig, mainTable, mbsStateCollection } = this;
    if ( !id || !mainTable.selectRow ) return;
    return new Promise( resolve => {
      Api.getMBSTree( {
        qbsId: mainTable.selectRow?.id,
        name: mbsStateCollection.conditions ?? "",
        mbsId: id
      } ).then( res => {
          this.mbsStateCollection.loading = false;
          if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
          if ( res.data ) resolve( this.treeLazyAdapter( res.data, 'children' ) );
        }
      )
    } )
  }

  private mbsStateCollectionAdapter( resolveData: Array<Type.MBSTable> ) {
    const { QBSTreeAdapter } = this;
    this.MBSTree.clearCurrentRow();
    this.mbsStateCollection.selectKey = null;
    const dataSource = QBSTreeAdapter<Type.MBSTable>( resolveData, 'children' ) as Array<Type.MBSTable>;
    Utils.deepFind( dataSource, item => {
      if ( item.mark ) item.checked = true
      return false;
    }, 'children' );
    this.mbsStateCollection.dataSource = dataSource;
  }

  private getHasRelevance() {
    const { mbsStateCollection, mainTable, locale, mbsStateCollectionAdapter } = this;
    if ( !mainTable.selectRow ) return this.$message.warn( locale?.Engineering.QBSNodeSelectedRequired as string );
    if ( mbsStateCollection.loading ) return;
    if ( this.$refs.HasRelevanceBtn ) {
      const btn = this.$refs.HasRelevanceBtn as Button;
      btn.loading = true;
      mbsStateCollection.loading = true;
      Api.getMBSTree( {
        qbsId: mainTable.selectRow.id,
        bind: true
      } ).then( res => {
        mbsStateCollection.loading = false;
        btn.loading = false;
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        if ( res.data ) mbsStateCollectionAdapter( res.data );
      } )
    }
  }

  private getNoRelevance() {
    const { mbsStateCollection, mainTable, mbsStateCollectionAdapter, locale } = this;
    if ( !mainTable.selectRow ) return this.$message.warn( locale?.Engineering.QBSNodeSelectedRequired as string );
    if ( mbsStateCollection.loading ) return;
    if ( this.$refs.NoRelevanceBtn ) {
      const btn = this.$refs.NoRelevanceBtn as Button;
      btn.loading = true;
      mbsStateCollection.loading = true;
      Api.getMBSTree( {
        qbsId: mainTable.selectRow.id,
        bind: false
      } ).then( res => {
        mbsStateCollection.loading = false;
        btn.loading = false;
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        if ( res.data ) mbsStateCollectionAdapter( res.data );
      } )
    }

  }

  private removeQBSTreeNode() {
    const {
      QBSTree,
      mainTable,
      locale,
      projectConfig,
      projectCode,
      $message,
      getQBSTree,
      autoSetFirstInit,
      cancelMainTableDelete
    } = this;
    const checkRows = QBSTree.getCheckedRows( true );
    if ( !checkRows.length ) return this.$message.error( locale?.Engineering.syncNodeRequired as string );
    Modal.confirm( {
      title: locale?.Engineering.qbsRemove,
      content: locale?.Engineering.qbsRemoveDescriptions,
      okText: locale?.Common.Action.ok,
      okType: 'danger',
      cancelText: locale?.Common.Action.cancel,
      onOk() {
        return new Promise( resolve => {
          Api.removeQBSTreeNode( {
            appCode: projectCode as string,
            projectName: projectConfig?.projectName ?? "",
            //qbsId: mainTable.selectRow?.id ?? "", QualityVersion 3.0.0
            qbsIds: checkRows.map( item => item.id )
          } ).then( res => {
            if ( res.errcode !== 0 ) return $message.error( res.errmsg as string );
            //QualityVersion 3.0.0
            cancelMainTableDelete();
            getQBSTree()?.then( () => {
              return autoSetFirstInit()
            } ).then( () => {
              resolve( {} );
            } )
          } )
        } )
      },
      onCancel() {
        console.log( 'Cancel' );
      },
    } );
  }

  private autoSetFirstInit() {
    this.mainTable.selectRow = this.mainTable.dataSource[0];
    this.QBSTree.setCurrentRow( this.mainTable.dataSource[0] );
    this.mbsStateCollection.checkEnable = false;
    if ( !this.mainTable.selectRow ) return;
    this.getBindBizSheet();
    //version 3.0.0 search MBSModelList
    this.getMBSModelTree( this.mainTable.selectRow?.id );
    //this.getMBSTree( this.mainTable.selectRow?.id );
  }

  private renderQBSTreeNav() {
    return [
        <Button
          type={ 'primary' }
          onClick={ ()=> this.$router.push({path:'CodeMbsManagement'}) }
        >
          编码配置
        </Button>
    ]
  }

  // private renderQBSTreeNav() {
  //   const { locale, mainTable } = this;
  //   const defaultNav = [
  //     <Button
  //       type={ 'primary' }
  //       onClick={ this.addQBSTreeNode }
  //     >
  //       { locale?.Common.Action.add }
  //     </Button>,
  //     <Button
  //       disabled={ !mainTable.selectRow }
  //       onClick={ this.editQBSTreeNode }
  //     >
  //       { locale?.Common.Action.edit }
  //     </Button>,
  //     <Button
  //       disabled={ !mainTable.selectRow }
  //       type={ 'danger' }
  //       //onClick={ this.removeQBSTreeNode }
  //       onClick={ this.openMainTableDelete }
  //     >
  //       { locale?.Common.Action.remove }
  //     </Button>
  //   ];
  //   const deleteNav = [
  //     <Button
  //       onClick={ this.cancelMainTableDelete }
  //     >
  //       { locale?.Common.Action.cancel }
  //     </Button>,
  //     <Button
  //       type={ 'danger' }
  //       onClick={ this.removeQBSTreeNode }
  //     >
  //       { locale?.Common.Action.confirmRemove }
  //     </Button>
  //   ];
  //   return mainTable.deleteOpt ? deleteNav : defaultNav;
  // }

  private cancelMainTableDelete() {
    const { mainTable } = this;
    mainTable.deleteOpt = false;
  }

  private openMainTableDelete() {
    const { mainTable } = this;
    mainTable.deleteOpt = true;
  }

  private cancelTemplateConfigDet() {
    this.templateConfigDet = false;
  }

  private removeTemplateConfigDet() {
    this.templateConfigDet = true;
  }

  private cancelMBSOpt() {
    const { mainTable, mbsStateCollection } = this;
    mbsStateCollection.operation = false;
    mbsStateCollection.checkEnable = false;
    if ( !mainTable.selectRow ) {
      mbsStateCollection.modelDataSource = [];
    } else {
      this.getMBSModelTree( mainTable.selectRow.id );
    }
  }

  private openMBSOpt() {
    const { locale, mainTable, mbsStateCollection } = this;
    if ( !mainTable.selectRow ) return this.$message.error( locale?.Engineering.QBSNodeSelectedRequired as string );
    mbsStateCollection.operation = true;
    mbsStateCollection.checkEnable = true;
    this.getMBSTree( mainTable.selectRow?.id );
  }

  private renderMBSNav() {
    const { locale, mbsStateCollection } = this;
    const defaultNav = [
      <Button
        onClick={ this.openMBSOpt }
      >
        { locale?.Common.Action.edit }
      </Button>
    ];
    const tips = (
      <div class={Class.tips}>
        <div><span class={Class.org}>挂载</span>：创建n个子节点，创建n对对应的绑定关系</div>
        <div><span class={Class.org}>关联</span>：节点与选定n个构件建立绑定关系</div>
      </div>)
    const operationNav = [
      /* mbsStateCollection.checkEnable &&
       <Button
         onClick={ this.cancelMount }
       >
         { locale?.Common.Action.cancel }
       </Button>
       ||
       <div/>*/
      mbsStateCollection.operation &&
      <Button
        onClick={ this.cancelMBSOpt }
      >
        { locale?.Common.Action.cancel }
      </Button>
      ||
      <div/>
      ,
      /*mbsStateCollection.operation && !mbsStateCollection.checkEnable &&
      <Button
        onClick={ this.cancelMBSOpt }
      >
        { locale?.Common.Action.cancel }
      </Button>
      ,*/
      /*<Button
        type={ mbsStateCollection.checkEnable ? 'primary' : null }
        loading={ mbsStateCollection.mountLoading }
        onClick={ e => {
          if ( mbsStateCollection.checkEnable ) {
            this.confirmMount();
          } else {
            this.enableMount();
          }
        } }
      >
        { mbsStateCollection.checkEnable ? locale?.Engineering.confirmMount : locale?.Engineering.mount }
      </Button>,*/
      <Button ref={ 'HasRelevanceBtn' }
              onClick={ this.getHasRelevance }>{ locale?.Engineering.HasRelevance }</Button>,
      <Button ref={ 'NoRelevanceBtn' }
              onClick={ this.getNoRelevance }>{ locale?.Engineering.NoRelevance }</Button>,
      <Button
        type={ 'primary' }
        loading={ mbsStateCollection.mountLoading }
        onClick={ this.confirmMount }
      >
        { locale?.Engineering.confirmMount }
      </Button>,
      <Button
        ref={ 'RelevanceBtn' }
        type={ 'primary' }
        onClick={ this.relevanceQBSndMBS }
      >
        { locale?.Engineering.confirmRelevance }
      </Button>,
      <Popover content={tips} class={Class.help}>
        <Icon src={'help'}/>
      </Popover>
      /*<Button
        ref={ 'RelevanceBtn' }
        onClick={ this.relevanceQBSndMBS }
      >
        { locale?.Engineering.relevance }
      </Button>*/
    ]
    return mbsStateCollection.operation ? operationNav : defaultNav;
  }

  private renderQBSMainNav() {
    const { locale, mainTable } = this;
    return [
      <Input.Search
        class={ Class.searchInput }
        placeholder={ locale?.Engineering.searchPlaceHolder }
        loading={ mainTable.loading }
        value={ mainTable.conditions }
        onChange={ e => this.mainTable.conditions = e.target.value }
        enterButton
        onSearch={ e => this.getQBSTree() }
      />
    ]
  }

  private renderJBSOptions( row: Type.QualityTable ) {
    const { locale } = this;
    if ( !row ) return null;
    if ( row.jbsId ) {
      return <span>{ locale?.Engineering.qbsHasJbsTips }，
        <span onClick={ () => this.editJBSBindShip() }
              role={ 'activeLink' }>{ locale?.Engineering.editJBSBindShip }</span></span>
    } else {
      return <span>{ locale?.Engineering.qbsHasntJbsTips }，
        <span onClick={ () => this.editJBSBindShip() }
              role={ 'activeLink' }>{ locale?.Engineering.editJBSBindShip }</span></span>
    }
  }

  private showLinkCell( { row }: { row: Type.MBSTable } ): string {
    /*if ( row.mark ) {
      row.checked = true;
    }*/
    return row.mark ? Class.path : "";
  }

  private qbsChange( { row }: { row: Type.QualityTable } ) {
    this.mainTable.selectRow = row;
    this.mbsStateCollection.loading = true;
    this.getBindBizSheet();
  }

  private mbsChange( { row }: { row: Type.MBSTable } ) {
    this.mbsStateCollection.selectRow = row;
  }

  private mbsDBClick() {

  }

  private qbsDBClick() {
    this.QBSTree.clearCurrentRow();
    this.mainTable.selectRow = null;
    this.mainTable.treeData = [];
    //quality version 3.0.0
    this.mbsStateCollection.modelDataSource = [];
    this.mbsStateCollection.checkEnable = false;
  }

  private removeQBSSheet( source: Type.QualityQBS ) {
    console.log( 'removeQBSSheet=====>', source, this.mainTable.selectRow );
    const {
      findCurrent,
      selectedRowKeys,
      mainTable,
      projectName,
      projectCode,
      bindRemoveLoading,
      projectConfig
    } = this, {
      id,
      others
    } = source;
    //if ( bindRemoveLoading ) return;
    //this.bindRemoveLoading = true;
    //const target = findCurrent( selectedRowKeys[0] );
    if ( !mainTable.selectRow ) return;
    Api.editBindBizSheet( {
      addNodes: [],
      // delNodes: [ { id: source.others?.id as string } ],
      delNodes: [ { id: source?.id } ],
      qbsJbsId: source.others?.id as string
      /*jbsId: mainTable.selectRow.jbsId,
      qbsId: mainTable.selectRow?.id*/
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.getBindBizSheet();
    } )
    /*Api.batchBindOptBizSheet( {
      addNodes: [],
      delNodes: [ {
        id: others?.id as string
      } ],
      appCode: projectCode as string,
      projectName: projectConfig?.projectName as string,
      qbsNodeId: target.type === 'MBS' ? target.parentId : target.id,
      type: target.type
    } ).then( res => {
      this.bindRemoveLoading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.initTemplateModal( true );
    } )*/

  }

  private submitJBSModal( direct?: boolean ) {
    const { mainTable, jbsModal, locale } = this;
    if ( !mainTable.selectRow || jbsModal.loading ) return;
    const { ProjectSelector, StructureSelector, ProcessSelector } = this;
    if ( !ProjectSelector.value && !ProjectSelector.defaultValue ) return this.$message.error( locale?.Engineering.allOptionsRequired as string );
    if ( !StructureSelector.value && !StructureSelector.defaultValue ) return this.$message.error( locale?.Engineering.allOptionsRequired as string );
    if ( !ProcessSelector.value && !ProcessSelector.defaultValue ) return this.$message.error( locale?.Engineering.allOptionsRequired as string );
    //if ( !ProjectSelector.value || !StructureSelector.value || !ProcessSelector.value ) return this.$message.error (locale?.Engineering.allOptionsRequired as string);
    jbsModal.loading = true;
    if ( !direct ) {
      Api.editQBSTreeNode( {
        appCode: mainTable.selectRow.appCode,
        projectName: mainTable.selectRow.projectName,
        jbsId: ProcessSelector.value ?? ProcessSelector.defaultValue,
        modelTypeId: mainTable.selectRow.modelTypeId,
        //mbsCode: mainTable.selectRow.mbsCode,
        // mbsCodes: [ mainTable.selectRow.mbsCode ],
        mbsCodes: mainTable.selectRow.mbs.map( item => item.mbsCode ),
        qbsId: mainTable.selectRow.id
      } ).then( res => {
        jbsModal.loading = false;
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.initJBSModal();
        /*this.getQBSTree()?.then( () => {
          this.autoSetFirstInit();
        } )*/
      } )
    } else {
      this.addJBSNode( ProcessSelector.value ?? ProcessSelector.defaultValue, () => {
        this.initJBSModal();
      } );
    }

  }

  private importQBSFile( e ) {
    if ( e.type == 'drop' ) {
      this.fileInput( {
        target: {
          files: e.dataTransfer.files
        }
      } );
    } else if ( e.type == 'click' ) {
      this.FileInput?.click();
    }
  }

  /*
  *  质量绑定多个JBS节点
  * */

  private jbsNodesDataAdapter( sources ) {
    const { jbsNode } = this;
    jbsNode.dataSource = sources;
  }

  private getJBSNodes() {
    const { mainTable, locale } = this;
    if ( !mainTable.selectRow ) return this.$message.error( locale?.Engineering.QBSNodeSelectedRequired as string );
    Api.getJBSNodes( {
      qbsId: mainTable.selectRow.id
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) this.jbsNodesDataAdapter( res.data );
    } )
  }

  private addJBSNode( jbsId: string, callback?: () => void ) {
    const { jbsNode, locale, projectCode, projectConfig, mainTable, jbsModal } = this;
    if ( !jbsId ) return;
    if ( !mainTable.selectRow ) return this.$message.error( locale?.Engineering.QBSNodeSelectedRequired as string );
    const params = {
      appCode: projectCode as string,
      jbsId: jbsId,
      projectName: projectConfig?.projectName as string,
      qbsId: mainTable.selectRow.id,
      qbsJbsId: jbsNode.activeNode?.id ?? undefined,
    };
    if ( jbsNode.activeNode ) {
      Api.editJBSNodes( params ).then( res => {
        jbsModal.loading = false;
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        callback?.();
        this.getJBSNodes();
      } )
    } else {
      Api.addJBSNodes( params ).then( res => {
        jbsModal.loading = false;
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        callback?.();
        this.getJBSNodes();
      } )
    }
  }

  private editJBSNode() {
    const { jbsNode, locale, projectCode, projectConfig, mainTable } = this;
    if ( !jbsNode.activeNode ) return this.$message.error( locale?.Engineering.JBSNodeSelectedRequired as string );
    if ( !mainTable.selectRow ) return this.$message.error( locale?.Engineering.QBSNodeSelectedRequired as string );
    Api.editJBSNodes( {
      appCode: projectCode as string,
      jbsId: jbsNode.activeNode.jbsId as string,
      projectName: projectConfig?.projectName as string,
      qbsId: mainTable.selectRow.id,
      qbsJbsId: jbsNode.activeNode.qbsJbsId as string,
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.getJBSNodes();
    } )
  }

  private initJBSNode() {
    const { jbsNode } = this;
    jbsNode.activeNode = null;
    jbsNode.removePanel = false;
    jbsNode.dataSource = [];
    jbsNode.checkedKeys = [];
    jbsNode.expandKeys = [];
  }

  private removeJBSNode() {
    const { jbsNode, locale, projectCode, projectConfig, mainTable } = this;
    if ( !jbsNode.checkedKeys.length ) return this.$message.error( locale?.Engineering.JBSNodeSelectedRequired as string );
    if ( !mainTable.selectRow ) return this.$message.error( locale?.Engineering.QBSNodeSelectedRequired as string );
    this.$confirm( {
      title: locale?.BIMModelFill.ConfirmDeleteList,
      okText: locale?.Common.Action.ok,
      onOk: () => {
        return new Promise( ( resolve, reject ) => {
          Api.deleteJBSNode( {
            appCode: projectCode as string,
            projectName: projectConfig?.projectName as string,
            qbsId: mainTable.selectRow?.id as string,
            qbsJbsIds: jbsNode.checkedKeys
          } ).then( res => {
            if ( res.errcode !== 0 ) {
              this.$message.error( res.errmsg as string );
              reject( res.errmsg );
            } else {
              this.initJBSNode();
              this.getJBSNodes();
              resolve( {} );
            }
          } )
        } )
      }
    } )
  }

  private toRemove() {
    const { jbsNode } = this;
    // jbsNode.removePanel = true;
    this.removeJBSNode();
  }

  private closeRemove() {
    const { jbsNode } = this;
    jbsNode.removePanel = false;
  }

  private jbsNodeActiveChange( activeNode ) {
    const { jbsNode } = this;
    jbsNode.activeNode = activeNode;
  }

  private jbsNodeCheckChange( node ) {
    const { jbsNode: { checkedKeys } } = this;
    if ( checkedKeys.includes( node.id ) ) {
      const index = checkedKeys.findIndex( item => item === node.id );
      checkedKeys.splice( index, 1 );
    } else {
      checkedKeys.push( node.id );
    }
  }

  private toExpandKeys( key: string ) {
    const { jbsNode: { expandKeys } } = this;
    if ( expandKeys.includes( key ) ) {
      const index = expandKeys.findIndex( item => item === key );
      expandKeys.splice( index, 1 );
      //this.jbsNode.expandKeys
    } else {
      this.jbsNode.expandKeys.push( key );
    }
  }

  private addJBSSheet( node ) {
    const { id } = node;
    /* this.jbsNode.currentId = id;*/
    this.jbsNode.activeNode = node;
    this.openTemplateModal( id );
  }

  private changeJBS( node ) {
    const { jbsId } = node;
    this.jbsNode.activeNode = node;
    this.editJBSBindShip( jbsId );
  }

  private renderJBSNodeSheets( node ) {
    const { qbsBizs, id } = node;
    console.log( 'node===>', node );
    return qbsBizs.map( item =>
      <QualityTemplate
        editMode={ true }
        source={ {
          bizSheetName: item.sheetName,
          others: node,
        } }
        removeEvent={ () => this.removeQBSSheet( {
          others: node,
          id: item.id
        } as Type.QualityQBS ) }
      />
    )
  }

  private renderJBSNodes() {
    const { jbsNode, locale } = this;
    if ( !locale ) return [];
    return jbsNode.dataSource.map( item => {
      const active = jbsNode.expandKeys.includes( item.id );
      const checked = jbsNode.checkedKeys.includes( item.id );
      console.log( active );
      return (
        <div
          class={ `${ Class.jbsCard } ${ active && Class.expandJBS || '' }` }
        >
          <nav>
            {/*<Radio
              onChange={ () => this.jbsNodeActiveChange( item ) }
              checked={ jbsNode.activeNode?.id === item.id }
            />*/ }
            <Checkbox
              onChange={ () => this.jbsNodeCheckChange( item ) }
              checked={ checked }
              style={{
                display: `${this.templateConfigDet?'block':'none'}`
              }}
            />
            <span>{ locale.Engineering.CHECK_STEP }：</span>
            <span
              onClick={ () => this.changeJBS( item ) }>{ item.jbsName ?? locale.Common.System.empty }</span>
            <Icon
              clickEvent={ () => this.toExpandKeys( item.id ) }
              src={ 'arrow' }
              class={ active && Class.narrow }
            />
          </nav>
          <aside>
            { active && this.renderJBSNodeSheets( item ) }
            <div class={ Class.addSheetBtn } onClick={ () => this.addJBSSheet( item ) }>
              +
            </div>
          </aside>
        </div>
      )
    } )
  }

  mounted() {
    /* const { projectCode, projectName, projectConfig, calcContentHeight, setAllTreeExpanded } = this;
     this.mainTable.loading = true;
     this.getMainTableDebounce (0, projectCode, projectConfig?.projectName, undefined, undefined, setAllTreeExpanded);
     this.getBizJBSTreeDebounce (undefined, undefined, (data) => {
       console.log ('getData===>', data);
       this.jbsTypeModal.FirstLevelOptions = data;
     });
     this.calcContentHeight ();
     window.addEventListener ('resize', calcContentHeight);*/
    this.getJBSTree().then( () => {
      this.qbsModal.projectDefault = this.qbsModal.projectOptions[0]?.id ?? null;
      this.qbsModal.structureOptions = this.qbsModal.projectOptions[0]?.childs ?? [];
    } );
    this.getQBSTree()?.then( () => {
      return this.autoSetFirstInit();
    } );

  }

  destroyed() {
    const { calcContentHeight } = this;
    window.removeEventListener( 'resize', calcContentHeight );
  }

  private editJBSBindShip( jbsId?: string ) {
    const { jbsModal, mainTable } = this;
    //jbsModal.visible = true;
    if ( !mainTable.selectRow ) return;
    console.log( 'jbsModal.allOptions', jbsModal.allOptions );
    const defaultQueue = Utils.deepFind( jbsModal.allOptions, item => item.id === (jbsId ?? mainTable.selectRow?.jbsId), 'childs' );
    console.log( 'defaultQueue', defaultQueue );
    if ( defaultQueue.length ) {
      this.jbsModal.projectDefault = defaultQueue[0]?.id;
      this.jbsModal.structureOptions = defaultQueue[0]?.childs ?? [];
      this.jbsModal.structureDefault = defaultQueue[1]?.id;
      this.jbsModal.processOptions = defaultQueue[1]?.childs ?? [];
      /*this.jbsModal.processDefault = defaultQueue[2]?.id;*/
      this.jbsModal.processDefault = defaultQueue[2]?.id ?? this.jbsModal.processOptions[0]?.id;
    } else {
      this.jbsModal.projectDefault = jbsModal.allOptions[0].id;
      this.jbsModal.structureOptions = jbsModal.allOptions[0]?.childs ?? [];
      this.jbsModal.structureDefault = jbsModal.allOptions[0]?.childs[0]?.id;
      this.jbsModal.processOptions = jbsModal.allOptions[0]?.childs[0]?.childs ?? [];
      this.jbsModal.processDefault = jbsModal.allOptions[0]?.childs[0]?.childs[0].id;
    }
    this.$nextTick().then( () => jbsModal.visible = true );
  }

}
