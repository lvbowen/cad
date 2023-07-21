/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import { Vue, Prop, Component, InjectReactive, Ref } from 'vue-property-decorator';
import Class from './qualityModule.module.less';
import { QualityNode, QualityNodeChain } from "./QualityNode";
import { Utils } from '@ctesi/core';
import { Icon, SyncVisualTable } from "@ctesi/component";
import * as Type from "../../type";
import * as Api from '../../service/api';
import { ZhCNEx } from "../../locales/zh-CN-ex";
import VirtualList from 'vue-virtual-scroll-list';

import QualityTemplate from './QualityTemplate';

import QualityProgress from "./QualityProgress";

import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';

interface BizSheet<T> {
  dataSources: Array<T>;
  selectNode: T | null;
}

interface JBSNodes<T> {
  loading: boolean;
  enableCheck: boolean;
  dataSources: Array<T>;
}

interface ProjectTree<T> {
  loading: boolean;
  dataSources: Array<T>;
}

interface SyncPanel {
  visible: boolean;
  jobQueue: Array<any>;
  jobStatus: null | 'success' | 'fail'
}

interface LocationOptions {
  options: Array<{ code: string, name: string }>;
  state: boolean;
  selection: { code: string, name: string } | null;
}

@Component( {
  name: 'QualityRelevance'
} )
export default class QualityRelevance extends Vue {

  @InjectReactive( 'project' )
  public projectCode!: string;

  @InjectReactive( 'projectConfig' )
  public projectConfig!: Type.ProjectConfig;

  @InjectReactive( 'locale' )
  public locale!: typeof ZhCNEx;

  @Ref()
  public JBSTree!: SyncVisualTable<Type.SyncSheetNode>;

  @Ref()
  public ProjectJBSTree!: SyncVisualTable<any>;

  @Ref()
  public ProgressList!: VirtualList;

  private qualityQuene: QualityNodeChain<any> | null = null;

  private qualityEnum: Type.QualityEnumInstance = {
    Industry: null,
    Geo: null,
  }

  private geoOptions: LocationOptions = {
    options: [],
    selection: null,
    state: false
  };

  private industryOptions: LocationOptions = {
    options: [],
    selection: null,
    state: false
  }

  private bizSheet: BizSheet<Type.SheetNode> = {
    dataSources: [],
    selectNode: null
  }

  private jbsNodes: JBSNodes<Type.SystemTree> = {
    enableCheck: true,
    dataSources: [],
    loading: false
  }

  private projectTree: ProjectTree<any> = {
    dataSources: [],
    loading: false
  }

  private syncPanel: SyncPanel = {
    visible: false,
    jobQueue: [],
    jobStatus: null,
  }

  private static virtualListAdaptor( origin: Array<Type.SheetNode> ) {
    return origin.map( item => {
      return {
        id: item.schemaCode,
        bizSheetName: item.sheetName,
        others: item
      }
    } );
  }

  private static virtualProgressAdapter( origin: Array<any> ) {
    return origin.map( item => {
      return {
        id: item.data.id,
        others: item
      }
    } )
  }

  private static checkMethod( { row }: { row: Type.SystemTree } ) {
    // return row.leaf && row.bindType === 0;
    //return row.bindType === 0;
    if ( !row.leaf ) {
      return true;
    } else {
      return row.bindType === 0;
    }
  }

  private checkBoxChange() {
    const { jbsNodes } = this;
    Utils.deepFind( jbsNodes.dataSources, item => {
      if ( !QualityRelevance.checkMethod( { row: item } ) && item.checked ) {
        item.checked = false;
      }
      return false;
    }, 'children' );
  }

  private allLeafSheetNodes() {
    const { jbsNodes, JBSTree } = this;
    return JBSTree.getCheckedRows().filter( item => item.leaf );
  }

  private initJob() {
    this.syncPanel.visible = false;
    this.syncPanel.jobQueue = [];
    this.syncPanel.jobStatus = null;
  }

  private closeSyncPanel() {
    this.initJob();
    //this.getBizSheet();
    this.getBizTree();
    this.getJBSTree();
  }

  private jobFinish() {
    this.syncPanel.jobStatus = 'success';
  }

  private jobSuccess( item ) {
    if ( item.others.next ) {
      this.syncPanel.jobQueue.push( item.others.next );
    } else {
      this.jobFinish();
    }
  }

  private jobFailed( item, msg ) {
    //failedJob--->item
    this.syncPanel.jobStatus = 'fail';
  }

  private renderSyncPanelTitle( state: SyncPanel['jobStatus'] ) {
    const { locale } = this;
    switch ( state ) {
      case 'success':
        return locale.Engineering.syncSuccess;
      case 'fail':
        return locale.Engineering.syncFail;
      case null:
        return locale.Engineering.syncing;
    }
  }

  private renderSyncPanelIcon( state: SyncPanel['jobStatus'] ) {
    switch ( state ) {
      case 'success':
        return 'syncSuccess';
      case 'fail':
        return 'syncFail';
      case null:
        return 'syncSpin'
    }
  }

  private buildQualityJob( item ) {
    const { projectCode, geoOptions, industryOptions, ProgressList } = this;
    return new Promise( ( resolve, reject ) => {
      Api.syncBisSheet( {
        appCode: projectCode,
        geoCode: geoOptions.selection?.code as string,
        fieldCode: industryOptions.selection?.code as string,
        nodes: [ item ]
      } ).then( res => {
        if ( res.errcode !== 0 ) {
          this.$message.error( res.errmsg as string );
          reject( res.errmsg )
        }
        ProgressList.scrollToBottom();
        resolve( {} );
      } )
    } );
  }

  private startSync() {
    const { JBSTree, locale, allLeafSheetNodes } = this;
    const syncRows = allLeafSheetNodes() as Array<any>;
    if ( !syncRows.length ) return this.$message.error( locale.Engineering.syncNodeRequired as string );
    this.syncPanel.visible = true;
    this.qualityQuene = new QualityNodeChain<any>();
    syncRows.forEach( item => this.qualityQuene?.add( QualityNodeChain.createQualityNode( item, this.buildQualityJob ) ) );
    this.syncPanel.jobQueue.push( this.qualityQuene.head );
  }

  private renderJBSNav() {
    const { locale } = this;
    return [
      <Button
        type={ 'primary' }
        onClick={ this.startSync }
      >
        { locale.Engineering.addSync }
      </Button>
    ];
  }

  public created() {
    this.getQualityEnum();
  }

  private getJBSNodesColumn( locale: typeof ZhCNEx, checkAble: boolean ) {
    const defaultColumn = [
      {
        type: 'checkbox',
        width: 40,
        align: 'center'
      },
      /*{
        title: locale.Engineering.code,
        align: 'left',
        dataIndex: 'codeValue',
        ellipsis: true,
        key: 'header_0',
        treeNode: true,
        width: 300
      },*/
      {
        title: locale.Engineering.name,
        dataIndex: 'name',
        align: 'left',
        ellipsis: true,
        treeNode: true,
        key: 'header_1',
        customRender:(t,r)=> {
          return <span class={Class.docFolder}>
            <Icon src={`${t.type==='BizModel'?'doc':t.type==='Folder'?'folder':''}`}/> <span>{t.name}</span>
          </span>
        }
      }
    ];
    if ( !checkAble ) {
      defaultColumn.shift();
    }
    return defaultColumn;
  }

  private getProjectTreeNodesColumn( locale: typeof ZhCNEx ) {
    return [
      {
        title: locale.Engineering.name,
        dataIndex: 'name',
        align: 'left',
        ellipsis: true,
        treeNode: true,
        key: 'header_1',
        customRender:(t,r)=> {
          return <span class={Class.docFolder}>
            <Icon src={`${t.type==='BizModel'?'doc':t.type==='Folder'?'folder':''}`}/> <span>{t.name}</span>
          </span>
        }
      }
    ]
  }

  private loadJBSNodes() {

  }

  private selectBizSheet( source ) {
    //this.bizSheet.selectNode = source;
  }

  private checkSelected( source ) {
    const { bizSheet } = this;
    if ( !bizSheet.selectNode ) return false;
    return bizSheet.selectNode.id === source.id;
  }

  private getBizSheet() {
    const { projectCode, bizSheet } = this;
    Api.getSystemQualitySheet( {
      appCode: projectCode
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        bizSheet.dataSources = res.data;
      }
    } );
  }

  render() {
    const { locale, bizSheet, jbsNodes, syncPanel } = this;
    return (
      <article class={ Class.main }>
        <nav class={ Class.nav }>
          <Icon src={ 'goBack' } class={ Class.goBack } clickEvent={ () => this.$router.go( -1 ) }/>
          <span>{ locale.Engineering.listConfig }</span>
        </nav>
        <main class={ Class.mainContainer }>
          {/*<section class={ `${ Class.container } ${ Class.sheetContainer }` }>
            <nav>
              <span>{ locale.Engineering.mySheet }</span>
            </nav>
            <article>
              <VirtualList
                class={ Class.relevanceList }
                style={ {
                  overflowY: 'auto',
                  height: `${ this.JBSTree?.getMaxHeight() }px`
                } }
                dataKey={ 'id' }
                dataSources={ QualityRelevance.virtualListAdaptor( bizSheet.dataSources ) }
                dataComponent={ QualityTemplate }
                extraProps={ {
                  titleEvent: this.selectBizSheet,
                  select: this.checkSelected
                } }
                keeps={ 30 }
              />

            </article>
          </section>*/ }
          <SyncVisualTable
            ref={ 'ProjectJBSTree' }
            config={ {
              wrapperClass: Class.sheetContainer,
              expendAllNode: true,
              dontReloadExpandNode: true,
              locale: {
                title: locale.Engineering.mySheet
              },
              loading: this.projectTree.loading,
              navNodes: [],
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
                checkboxChange: this.checkBoxChange
              },
              columns: this.getProjectTreeNodesColumn( locale ),
              dataSource: this.projectTree.dataSources,
              lazy: false,
              treeChildField: 'children',
              hasChildField: 'hasChild',
              //loadMethod: this.loadJBSNodes,
              // checkConfig: {
              //   checkField: 'checked',
              //   halfField: 'indeterminate',
              //   showHeader: false,
              //   checkMethod: QualityRelevance.checkMethod
              // },
              rowClassName: this.showSyncRow
            } }
          />
          <SyncVisualTable
            ref={ 'JBSTree' }
            config={ {
              wrapperClass: Class.relevanceTree,
              expendAllNode: true,
              dontReloadExpandNode: true,
              locale: {
                title: locale.Engineering.sheetLibrary
              },
              loading: jbsNodes.loading,
              navNodes: this.renderJBSNav(),
              articleNavWrapperClass: Class.navWrapper,
              articleNavNodes: this.renderJBSOptionNav(),
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
                checkboxChange: this.checkBoxChange
              },
              columns: this.getJBSNodesColumn( locale, jbsNodes.enableCheck ),
              dataSource: jbsNodes.dataSources,
              lazy: false,
              treeChildField: 'children',
              hasChildField: 'hasChild',
              loadMethod: this.loadJBSNodes,
              checkConfig: {
                checkField: 'checked',
                halfField: 'indeterminate',
                showHeader: false,
                checkMethod: QualityRelevance.checkMethod
              },
              rowClassName: this.showSyncRow
            } }
          />
        </main>
        <div
          class={ `${ Class.syncMask } ${ syncPanel.visible ? Class.maskShow : Class.maskHide }` }
        >
          <Icon src={ this.renderSyncPanelIcon( syncPanel.jobStatus ) }
                className={ Class.syncSpin }/>
          <span>{ this.renderSyncPanelTitle( syncPanel.jobStatus ) }</span>
          <main class={ Class.syncList }>
            <VirtualList
              ref={ 'ProgressList' }
              class={ Class.syncVisualList }
              style={ {
                overflowY: 'auto',
                height: `${ this.getMaskListHeight() }px`
              } }
              dataKey={ 'id' }
              dataSources={ QualityRelevance.virtualProgressAdapter( syncPanel.jobQueue ) }
              dataComponent={ QualityProgress }
              extraProps={ {
                success: this.jobSuccess,
                fail: this.jobFailed
              } }
              keeps={ 9999 }
            />
          </main>
          {
            syncPanel.jobStatus &&
            <Button
              type={ syncPanel.jobStatus === 'success' ? 'primary' : 'danger' }
              onClick={ this.closeSyncPanel }
            >
              { locale.Common.Action.goBack }
            </Button>
          }
        </div>
      </article>
    );
  }

  private getJBSTree() {
    const { projectCode, jbsNodes, geoOptions, industryOptions } = this;
    jbsNodes.loading = true;
    Api.getSystemJBSTree( {
      fieldCode: industryOptions.selection?.code as string,
      geoCode: geoOptions.selection?.code as string,
      appCode: projectCode
    } ).then( res => {
      jbsNodes.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) jbsNodes.dataSources = Utils.treeStructureAdapter( res.data, 'children' ) as Array<Type.SystemTree>;
      // if ( res.data?.nodes ) {
      //   jbsNodes.dataSources = Utils.treeStructureAdapter( res.data.nodes, 'children' ) as Array<Type.SyncSheetNode>;
      // }
    } )
  }

  private showSyncRow( { row } ) {
    return row.bindType && Class.synced || ""
  }

  private getMaskListHeight() {
    const height = document.body.clientHeight;
    return height - 296 - 22 - 150;
  }

  public mounted() {
    //this.getBizSheet();
    // this.generateGeoOptions();
    // this.generateIndustryOptions();
    // this.initAllSelection();
    // this.getBizTree();
    // this.getJBSTree();
  }

  private renderJBSOptionNav() {
    const { locale, geoOptions, industryOptions } = this;
    return [
      <span>
        { locale.Engineering.CurrentPosition }：
      </span>,
      <span class={ Class.geoLabel } onClick={ () => this.triggerSelector( 'Geo' ) }>
        { geoOptions.selection?.name }
      </span>,
      <div
        role={ 'GSelector' }
        class={ geoOptions.state ? Class.optionsShow : Class.optionsHide }
      >
        { geoOptions.options.map( item =>
          <div
            class={ Class.optionsCard }
            onClick={ () => this.selector( 'Geo', item ) }
          >
            { item.name }
          </div>
        ) }
      </div>,
      <span>—</span>,
      <span class={ Class.industryLabel } onClick={ () => this.triggerSelector( 'Industry' ) }>
        { industryOptions.selection?.name }
      </span>,
      <div
        role={ 'ISelector' }
        class={ industryOptions.state ? Class.optionsShow : Class.optionsHide }
      >
        { industryOptions.options.map( item =>
          <div
            class={ Class.optionsCard }
            onClick={ () => this.selector( 'Industry', item ) }
          >
            { item.name }
          </div>
        ) }
      </div>
    ]
  }

  private triggerSelector( type: 'Geo' | 'Industry' ) {
    const { geoOptions, industryOptions } = this;
    switch ( type ) {
      case "Geo":
        geoOptions.state = !geoOptions.state;
        industryOptions.state = false;
        return;
      case "Industry":
        industryOptions.state = !industryOptions.state;
        geoOptions.state = false;
        return;
    }
  }

  private selector( type: 'Geo' | 'Industry', item: { code: string, name: string } ) {
    const prefixProperty = type.toLocaleLowerCase( type );
    const target: LocationOptions = this[`${ prefixProperty }Options`];
    target.state = false;
    target.selection = item;
    this.$nextTick().then( this.getJBSTree );
  }

  private initAllSelection() {
    const { geoOptions, industryOptions } = this;
    geoOptions.selection = geoOptions.options[0];
    industryOptions.selection = industryOptions.options[0];
  }

  private generateGeoOptions() {
    const { qualityEnum, geoOptions } = this;
    if ( !qualityEnum.Geo ) return;
    const options: typeof geoOptions.options = [];
    for ( const key in qualityEnum.Geo ) {
      options.push( {
        code: key,
        name: qualityEnum.Geo[key]
      } );
    }
    this.geoOptions.options = options;
  }

  private generateIndustryOptions() {
    const { qualityEnum, industryOptions } = this;
    if ( !qualityEnum.Industry ) return;
    const options: typeof industryOptions.options = [];
    for ( const industryKey in qualityEnum.Industry ) {
      options.push( {
        code: industryKey,
        name: qualityEnum.Industry[industryKey]
      } )
    }
    this.industryOptions.options = options;
  }

  private qualityEnumAdapter( result: Type.QualityEnum ): Type.QualityEnumInstance {
    if ( !result ) return { Industry: null, Geo: null };
    const enumInstance = {
      Industry: new Map(),
      Geo: new Map()
    };
    result.fields.forEach( item => {
      enumInstance.Industry.set( item.fieldCode, item.name );
    } );
    result.geos.forEach( item => {
      enumInstance.Geo.set( item.geoCode, item.name );
    } );
    enumInstance.Industry = Object.fromEntries( enumInstance.Industry );
    enumInstance.Geo = Object.fromEntries( enumInstance.Geo );
    return enumInstance as unknown as Type.QualityEnumInstance;
  }

  private getQualityEnum() {
    Api.getQualityEnum( {} ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.qualityEnum = this.qualityEnumAdapter( res.data );
        this.generateGeoOptions();
        this.generateIndustryOptions();
        this.initAllSelection();
        this.getBizTree();
        this.getJBSTree();
      }
    } )
  }

  private getBizTree() {
    const { projectCode, projectTree } = this;
    this.projectTree.loading = true;
    Api.getSystemBizTree( {
      appCode: projectCode
    } ).then( res => {
      this.projectTree.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        projectTree.dataSources = Utils.treeStructureAdapter( res.data, 'children' ) as Array<any>;
      }
    } )
  }
}
