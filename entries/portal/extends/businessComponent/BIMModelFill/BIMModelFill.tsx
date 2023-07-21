/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import { Vue, Prop, Ref, Watch, Component, InjectReactive } from 'vue-property-decorator';
import Class from './BIMModelFIll.module.less';
import { ZhCNEx } from "../../locales/zh-CN-ex";
import { Icon } from '@ctesi/component';
import { Utils } from '@ctesi/core'
import VirtualList from 'vue-virtual-scroll-list';
import * as Type from '../../type';
import * as Api from '../../service/api';
import { RowInfo, Table } from 'vxe-table';
import { isEmpty, searchTree, findTree, remove } from "xe-utils";

import { namespace } from "vuex-class";

import BIMModelListItem from "./BIMModelListItem";

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';

import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';

import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css'
import {ModelFillInfoQuality} from "../../type";

interface PanelStatus<T, K> {
  expand: boolean;
  treeExpand: boolean;
  modelList: Array<T>;
  myList: Array<K>;
  maxHeight: number;
  saveListLoading: boolean;
  removeLoading: boolean;
  removeListItemLoading: boolean;
}

interface ModelWBSTRee<T> {
  loading: boolean;
  dataSources: Array<T>;
  dataSourcesBak: Array<T>;
  treeField: string;
  hasChild: string;
  maxHeight: number;
}

interface MyFillForm {
  dataSource: Type.ModelFillInfo | null;
  loading: boolean;
  panelActive: 'Progress' | 'Quality' | 'Measure' | 'Security';
}

const WorkflowCenterModule = namespace( "WorkflowCenter/WorkflowCenter" );

BIMModelListItem.wrapperClass = Class.modelListItem;

@Component( {
  name: "BIMModelFill"
} )
export default class BIMModelFill extends Vue {

  @WorkflowCenterModule.State( 'userId' )
  public readonly userId?: string;

  @InjectReactive( 'projectConfig' )
  public projectConfig?: Type.ProjectConfig;

  @InjectReactive( 'project' )
  public projectCode?: string;

  @InjectReactive( 'locale' )
  public locale?: typeof ZhCNEx;

  @Ref()
  public ModelListVirtualList: VirtualList;

  @Ref()
  public ModelTree!: Table;

  @Ref()
  public LeftMenu!: HTMLElement;

  @Ref()
  public Panel!: HTMLElement;

  @Ref()
  public PanelNav!: HTMLElement;

  @Prop()
  public modelHighLight?: Function;

  private isClear: boolean = true;

  private listId: string = '';

  private listName: string = '';

  private isSpinning: boolean = false;

  private checkKey: Array<RowInfo> = [];

  private modelWBSTree: ModelWBSTRee<Type.ModelFIllWBSTreeNode> = {
    maxHeight: 0,
    dataSources: [],
    dataSourcesBak: [],
    loading: false,
    treeField: 'children',
    hasChild: 'hasChild'
  }

  private panelStatus: PanelStatus<Type.ModelFIllWBSTreeNode, Type.MyFillList> = {
    expand: true,
    treeExpand: true,
    saveListLoading: false,
    removeLoading: false,
    removeListItemLoading: false,
    modelList: [],
    myList: [],
    maxHeight: 0,
  }

  private myFillForm: MyFillForm = {
    dataSource: null,
    loading: false,
    panelActive: 'Quality'
  }

  public getModelWBSTree() {
    const { modelWBSTree, ModelTree, projectConfig, projectCode } = this;
    if ( modelWBSTree.loading ) return;
    Api.getModelTree( {
      appCode: projectCode as string,
      projectName: projectConfig?.projectName as string,
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        const afterAdapter = Utils.treeStructureAdapter( res.data, 'children' ) as Array<Type.ModelFIllWBSTreeNode>;
        modelWBSTree.dataSources = JSON.parse( JSON.stringify( afterAdapter ) );
        modelWBSTree.dataSourcesBak = JSON.parse( JSON.stringify( afterAdapter ) );
        this.$nextTick().then( () => {
          ModelTree.toggleTreeExpand( modelWBSTree.dataSources?.[0] as RowInfo );
        } )
      }
    } )
  }

  private removeModelListItem( id: string ) {
    this.isSpinning = true;
    const {panelStatus, locale,ModelTree} = this;
    if ( !id ) return;
    if ( panelStatus.removeListItemLoading ) return this.$message.warn( locale?.BIMModelFill.WaitToLoadForm as string );
    panelStatus.removeListItemLoading = true;
    remove( this.panelStatus.modelList, item => item.id === id );
    const checkRows: Array<RowInfo> = [];
    if(ModelTree.getRowById(id)) checkRows.push(ModelTree.getRowById(id))
    ModelTree.setCheckboxRow(checkRows, false);
    this.closeUnIndeterminateNode();
    this.getFillForm( () => {
      panelStatus.removeListItemLoading = false;
      this.isSpinning = false;
    } )
  }

  public mounted() {
    const { calcSyncContentHeight } = this;
    calcSyncContentHeight();
    this.getModelWBSTree();
    this.getMyList();
    window.addEventListener( 'resize', calcSyncContentHeight )
  }

  public destroyed() {
    const { calcSyncContentHeight } = this;
    window.removeEventListener( 'resize', calcSyncContentHeight );
  }

  public render() {
    const {panelStatus, modelWBSTree, locale, myFillForm, isSpinning} = this;
    return (
      <article ref={ 'Panel' }
               class={ `${ Class.main } ${ panelStatus.expand ? Class.expand : Class.narrow }` }>
        <nav ref={ 'PanelNav' }>
          <Icon
            src={ 'goBack' }
            clickEvent={ this.expandPanel }
            class={ `${ Class.panelExpand } ${ panelStatus.expand ? Class.hideCursor : Class.showCursor }` }
          />
        </nav>
        <main class={ Class.content }>
          <section class={ Class.inventoryList }>
            <nav class={ Class.modulesNav }>
              <span>{ locale?.BIMModelFill.ModelOperation }</span>
            </nav>
            <article class={ Class.inventoryListContent }>
              <section class={ Class.inventoryModelList }>
                <nav class={ Class.contentNav }>
                  <span>{ locale?.BIMModelFill.ModelList }</span>
                  <span
                    onClick={ this.modelHighlight }>{ locale?.BIMModelFill.ModelHighLight }</span>
                  <span onClick={ this.clearAllModelList }>{ locale?.BIMModelFill.Empty }</span>
                  <span onClick={ this.saveMyList }
                        role={'highlight'}>{this.isClear ? locale?.BIMModelFill.Collect : locale?.BIMModelFill.Save}</span>
                </nav>
                <Spin spinning={isSpinning} class={Class.spinning} size={"large"}>
                <main>
                  <VirtualList
                    ref={ 'ModelListVirtualList' }
                    class={ Class.modelList }
                    style={ {
                      overflowY: 'auto',
                      width: `100%`,
                      height: `${ panelStatus.maxHeight }px`
                    } }
                    dataKey={ 'id' }
                    dataSources={ panelStatus.modelList }
                    dataComponent={ BIMModelListItem }
                    extraProps={ {
                      /*wrapperClass: Class.BIMModelFillItem,*/
                      onClick: () => {
                      },
                      delEvent: this.removeModelListItem
                    } }
                    keeps={ 15 }
                  />
                </main>
                </Spin>
              </section>
              <section class={ Class.inventoryMyList }>
                <nav class={ Class.contentNav }>
                  <span>{ locale?.BIMModelFill.MyList }</span>
                  {/* <span>{ locale?.BIMModelFill.Cancel }</span>
                  <span role={ 'highlight' }>{ locale?.BIMModelFill.Save }</span>*/ }
                </nav>
                <main>
                  { this.renderUserProfile() }
                </main>
              </section>
            </article>
          </section>
          <section class={ Class.bizFill }>
            <nav class={ Class.modulesNav }>
              <span>{ locale?.BIMModelFill.BizFil }</span>
            </nav>
            <main>
              <nav class={ Class.bizFillNav }>
                {/*{ this.renderSystemModulesNav() }*/ }
                <span
                  role={ myFillForm.panelActive === 'Progress' && 'active' || 'deActive' }
                  onClick={ () => this.switchToForm( 'Progress' ) }>{ locale?.BIMModelFill.Progress }</span>
                <span
                  role={ myFillForm.panelActive === 'Quality' && 'active' || 'deActive' }
                  onClick={ () => this.switchToForm( 'Quality' ) }>{ locale?.BIMModelFill.Quality }</span>
                <span
                  role={ myFillForm.panelActive === 'Measure' && 'active' || 'deActive' }
                  onClick={ () => this.switchToForm( 'Measure' ) }>{ locale?.BIMModelFill.Measure }</span>
                <span
                  role={ myFillForm.panelActive === 'Security' && 'active' || 'deActive' }
                  onClick={ () => this.switchToForm( 'Security' ) }
                >{ locale?.BIMModelFill.Security }</span>
              </nav>
              <section class={ Class.formContainer }>
                {/*{ this.renderQuality() }*/ }
                { this.renderSystemModulesNav( myFillForm.panelActive ) }
              </section>
            </main>
          </section>
        </main>
        <section
          ref={ 'LeftMenu' }
          class={ `${ Class.leftMenu } ${ panelStatus.treeExpand ? Class.treePanelExpand : Class.treePanelNarrow } ` }>
          <main>
            <nav>
              <span>{ locale?.BIMModelFill.Title }</span>
              <span class={ Class.add2ListBtn }
                    onClick={ this.addToList }>{ locale?.BIMModelFill.AddToList }</span>
            </nav>
            <Input.Search
              //enterButton
              onSearch={ this.searchModelTree }
            />
            <vxe-virtual-tree
              class={ Class.modelTree }
              ref={ 'ModelTree' }
              size={ 'mini' }
              border={ true }
              resizable={ true }
              showOverflow={ true }
              rowKey={ true }
              highlightCurrentRow={ true }
              rowId={ 'id' }
              loading={ modelWBSTree.loading }
              data={ modelWBSTree.dataSources }
              columns={ Utils.generateXTableColumns( this.modelTreeColumn( locale ) ) }
              treeConfig={ {
                lazy: false,
                children: modelWBSTree.treeField,
                hasChild: modelWBSTree.hasChild,
                //loadMethod: this.tableLazyLoad,
              } }
              checkboxConfig={ {
                checkField: 'checked',
                halfField: 'indeterminate',
                showHeader: false,
                //checkMethod: QualityDB.getCheckFn,
                //checkStrictly: true
              } }
              height={ modelWBSTree.maxHeight }
              { ...{
                on: {
                  'current-change': this.modelTreeSelected,
                  'checkbox-change': this.modelTreeCheckChange,
                  'cell-dblclick': this.modelTreeCellClick
                }
              } }
            />
          </main>
          <nav>
            <Icon
              src={ 'goBack' }
              clickEvent={ () => this.expandPanel( "tree" ) }
              class={ `${ Class.leftMenuExpand } ${ panelStatus.treeExpand ? Class.treeHide : Class.treeShow }` }
            />
          </nav>
        </section>
      </article>
    );
  }

  private modelTreeColumn( locale?: typeof ZhCNEx ) {
    if ( !locale ) return [];
    return [
      {
        type: 'checkbox',
        width: 30,
      },
      {
        title: '',
        dataIndex: 'taskName',
        key: 'header_0',
        width: 210,
        treeNode: true
      }
    ]
  }

  private modelTreeSelected() {

  }

  private modelTreeCheckChange() {

  }

  private modelTreeCellClick() {

  }

  private removeMyList( id: string ) {
    const {panelStatus, locale,ModelTree} = this;
    if ( panelStatus.removeLoading ) return;
    panelStatus.removeLoading = true;
    this.$confirm( {
      title: locale?.BIMModelFill.ConfirmDeleteList,
      okText: locale?.Common.Action.ok,
      onOk: () => {
        return new Promise( ( resolve, reject ) => {
          Api.delMyFillList( {
            id: id
          } ).then( res => {
            panelStatus.removeLoading = false;
            if ( res.errcode !== 0 ) {
              this.$message.error( res.errmsg as string );
              reject( res.errmsg );
            } else {
              resolve( this.getMyList() );
            }
          } )
        } )
      },
      onCancel: () => {
        panelStatus.removeLoading = false;
      }
    } )
  }

  private renderUserProfile() {
    const { panelStatus } = this;
    return panelStatus.myList.map( item => {
      return (
        <div class={ Class.myListItem }>
          <Tooltip title={ item.name }>
            <span onClick={() => this.getMyListDetail(item.id, item.name)}>{item.name}</span>
          </Tooltip>
          <i onClick={ () => this.removeMyList( item.id ) }
             domPropsInnerHTML={ BIMModelListItem.delIcon }/>
        </div>
      )
    } )
  }

  private expandPanel( tag?: 'tree' ): void {
    const { panelStatus } = this;
    if ( tag ) {
      panelStatus.treeExpand = !panelStatus.treeExpand;
    } else {
      panelStatus.expand = !panelStatus.expand;
    }
  }

  private addToList() {
    const { ModelTree, panelStatus, myFillForm, locale } = this;
    if ( myFillForm.loading ) return this.$message.warn( locale?.BIMModelFill.WaitToLoadForm as string );
    const allSelects = ModelTree.getCheckboxRecords( true ).filter( item => item.leaf );
    panelStatus.modelList = allSelects as Array<Type.ModelFIllWBSTreeNode>;
    this.getFillForm();
  }

  private searchModelTree( condition?: string ) {
    const { modelWBSTree, ModelTree } = this;
    if ( isEmpty( condition ) ) {
      this.getModelWBSTree();
    } else {
      const filter = searchTree( JSON.parse( JSON.stringify( modelWBSTree.dataSourcesBak ) ), ( item, index, items, path, parent, nodes ) => {
        if ( item.taskName.includes( condition as string ) ) {
          nodes.forEach( ( node, nodeIndex ) => {
            if ( (nodeIndex + 1) < nodes.length ) {
              node.inPath = true
            }
          } );
          return true;
        }
        return false;
      }, { original: true } );
      modelWBSTree.dataSources = filter;
      this.$nextTick().then( () => {
        Utils.deepFind( modelWBSTree.dataSources, item => {
          if ( item.inPath ) ModelTree.setTreeExpand( item, true );
          return false;
        }, 'children' );
      } );
    }
  }

  private renderMeasure() {
    const { locale } = this;
    return [
      <div
        onClick={ this.go2Measure }
        class={ Class.modelFillCard }>
        <Icon src={ 'doc' }/>
        <section>
          <nav>{ locale?.BIMModelFill.MeasureSecTitle }</nav>
          <aside>{ locale?.BIMModelFill.MeasureAside }</aside>
        </section>
      </div>
    ];
  }

  private renderProgress() {
    const { locale } = this;
    return [
      <div
        onClick={ this.go2Progress }
        class={ Class.modelFillCard }>
        <Icon src={ 'doc' }/>
        <section>
          <nav>{ locale?.BIMModelFill.ProgressFill }</nav>
          <aside>{ locale?.BIMModelFill.ProgressFillAside }</aside>
        </section>
      </div>
    ];
  }

  private renderQuality() {
    const { myFillForm, locale } = this;
    const formNodes: Array<JSX.Element> = [
      <div
        onClick={ () => {
          if ( myFillForm.dataSource?.qualityControlData ) {
            this.go2Form( myFillForm.dataSource?.qualityControlData, myFillForm.dataSource.qualityControlData.mbsIds.toString() )
          } else {
            return this.$message.warn( locale?.BIMModelFill.NoMBSIds as string );
          }
        } }
        class={ Class.modelFillCard }>
        <Icon src={ 'doc' }/>
        <section>
          <nav>{ locale?.BIMModelFill.QualityInspection }</nav>
          <aside>{ locale?.BIMModelFill.QualityInspectionAside }</aside>
        </section>
      </div>
    ];
    if ( !myFillForm.dataSource?.qualityData?.qbsBizs?.length ) return formNodes;
    // formNodes.length = 0;
    const { qbsBizs } = myFillForm.dataSource.qualityData;
    if ( qbsBizs?.length ) {
      qbsBizs.forEach( item => {
        if ( item.sheetName.includes( 'zlxj' ) ) {
          formNodes.push(
            <div
              onClick={ () => this.go2Form( item, item.mbsIds.toString() ) }
              class={ Class.modelFillCard }>
              <Icon src={ 'doc' }/>
              <section>
                <nav>{ locale?.BIMModelFill.QualityInspection }</nav>
                <aside>{ locale?.BIMModelFill.QualityInspectionAside }</aside>
              </section>
            </div>
          )
        } else {
          /* formNodes.push(
             <span class={ Class.formItem } onClick={ () => this.go2Form( item ) }>
             { item.sheetName }
           </span>
           )*/
          formNodes.push(
            <div
              class={ `${Class.modelFillCard} ${Class.quality}` }>
              <div class={Class.doc}>
                <Icon src={ 'doc' }/>
                <span class={item.dataStatus === 1?Class.doing:item.dataStatus=== 2?Class.done:Class.undo}>{ item.completeFraction}</span>
              </div>
              <section class={Class.inner}>
                <nav class={`${Class.fj} ${item.completeFraction && item.completeFraction.trim()==='0/0'?Class.disable:''}`}>
                  <Tooltip title={item.sheetName}>
                    <span class={Class.link}
                          onClick={() => this.getFormList(item)}>{item.sheetName.length>12?`${item.sheetName.substr(0,12)}...`:item.sheetName}</span>
                  </Tooltip>
                </nav>
                <aside>{ locale?.BIMModelFill.QualityFillAside }</aside>
              </section>
              <Button icon={'plus'} onClick={()=> this.addForm(item)}/>
            </div>
          )
        }
      } )
    }
    return formNodes;
  }

  addForm(r: ModelFillInfoQuality) {
    const routeData = this.$router.resolve({
      name: "form-detail",
      query: {
        schemaCode: r.schemaCode,
        sheetCode: r.schemaCode,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName??'',
        qbsCode: r.qbsCode,
        startWorkflowCode: r.workFlowCode
      },
    });
    this.isDingTalk?this.$router.push(routeData.href):window.open(routeData.href, '_blank');
  }

  getFormList(r: ModelFillInfoQuality) {
    if(r.completeFraction.trim()==='0/0') return;
    let idStr:string='';
    r.datas?.map((i)=> {
      idStr+=i.bizObjId + ';'
    })
    const routeData = this.$router.resolve( {
      name: 'applicationList',
      params: {
        appCode: r.appCode,
        schemaCode: r.schemaCode
      },
      query: {
        code: r.schemaCode,
        filters: JSON.stringify([
          {
            propertyCode: 'id',
            propertyType: 0,
            propertyValue: idStr
          }
        ])
      },
    } )
    window.open(routeData.href, '_blank');
  }

  private renderSecurity() {
    const { myFillForm, locale } = this;
    return [
      <div
        onClick={ () => {
          if ( myFillForm.dataSource?.saftyData ) {
            this.go2Form( myFillForm.dataSource?.saftyData, myFillForm.dataSource.saftyData.mbsIds.toString() )
          } else {
            return this.$message.warn( locale?.BIMModelFill.NoMBSIds as string );
          }
        } }
        class={ Class.modelFillCard }>
        <Icon src={ 'doc' }/>
        <section>
          <nav>{ locale?.BIMModelFill.SecurityCheck }</nav>
          <aside>{ locale?.BIMModelFill.SecurityCheckAside }</aside>
        </section>
      </div>
    ];
  }

  /**
   * 渲染进度/质量/计量/安全对应的模块子菜单
   *
   */
  private renderSystemModulesNav( panelActive ) {
    switch ( panelActive ) {
      case "Measure":
        return this.renderMeasure();
      case "Progress":
        return this.renderProgress();
      case "Quality":
        return this.renderQuality();
      case "Security":
        return this.renderSecurity();
    }
  }

  private async go2Form( params: Type.ModelFillInfoQuality, mbsIds?: string ) {
    const { schemaCode, datas, qbsCode, workFlowCode } = params;
    const { projectConfig, projectCode } = this;
    const urlAction = datas?.[0].bizObjId ? 'detail' : 'add';
    // const urlReturn = `/${projectCode}/QualityDB?code=${schemaCode}&openMode&pcUrl&queryCode=&iframeAction=${urlAction}`;
    let urlReturn:string = '';
    if(this.isDingTalk) {
      const projectLength:number = window.config.project.length;
      const pathName = location.pathname.substring(location.pathname.search(window.config.project) + projectLength,location.pathname.length);
      urlReturn = `${pathName}?code=${schemaCode}&openMode&pcUrl&queryCode=&iframeAction=${urlAction}`;
    }else{
      urlReturn = `${location.pathname}?code=${schemaCode}&openMode&pcUrl&queryCode=&iframeAction=${urlAction}`
    }
    let url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${schemaCode}&queryCode=${schemaCode}&qbsCode=${qbsCode}&projectName=${projectConfig?.projectName}`;
    let urlDetail = `/form/detail?sheetCode=${schemaCode}&objectId=${datas?.[0].bizObjId}&schemaCode=${schemaCode}&qbsCode=${qbsCode}&isWorkFlow=false&return=${encodeURIComponent(urlReturn)}`;
    if (mbsIds) {
      const mbsKey: any = await this.setStorage(mbsIds, 'quality');
      if (mbsKey) url += `&mbsKey=${mbsKey}`;
    }
    if (workFlowCode) {
      /*url += `&startWorkflowCode=${ datas?.[0].workFlowCode }&return=${ encodeURIComponent( urlReturn ) }`;*/
      url += `&startWorkflowCode=${ workFlowCode }&return=${ encodeURIComponent( urlReturn ) }`;
      if ( datas?.[0].bizObjId ) {
        const target = await Api.getWorkFlowFormDetailUrl( {
          schemaCode,
          bizObjectId: datas?.[0].bizObjId as string
        } ) as string;
        urlDetail = `${ target }`;
      }
    } else {
      url += `&return=${ encodeURIComponent( urlReturn ) }`;
    }
    if(this.isDingTalk) {
      urlAction === 'detail' ? this.$router.push(urlDetail) : this.$router.push(url)
    }else{
      window.open( urlAction === 'detail' ? `/${projectCode}${urlDetail}` : `/${projectCode}${url}` );
    }
  }

  private async setStorage(content: string, keyPrefix: string, expireTimeStamp?: number) {
    const param = {content: content, keyPrefix: keyPrefix};
    if (expireTimeStamp) this.$set(param, 'expireTimeStamp', expireTimeStamp);
    const resData = await new Promise((resolve) => {
      Api.setStorge(param).then(res => {
        return resolve(res.data);
      })
    })
    return resData;
  }

  private switchToForm(module: MyFillForm['panelActive'], callback?: Function) {
    const {myFillForm} = this;
    myFillForm.panelActive = module;
    callback?.();
  }

  /**
   * 跳转到进度填报
   *
   */
  private async go2Progress() {
    const {projectCode, locale} = this;
    const {dataSource} = this.myFillForm;
    if (!dataSource) return this.$message.warn(locale?.BIMModelFill.NoMBSIds as string);
    const {progressData} = dataSource;
    if (!progressData) return this.$message.warn(locale?.BIMModelFill.noneProgressData as string);
    let url = `${window.config.portalHost}/application/${projectCode}/constructionFill?`
    const mbsKey: any = await this.setStorage(progressData.wbsIds.toString() + '@' + progressData.wbsMbsIds.toString(), 'progress')
    if (mbsKey) url += `mbsKey=${mbsKey}`;
    window.open(`${url}`);
  }

  /**
   * 跳转到计量支付
   *
   */
  private async go2Measure() {
    const { projectCode, locale } = this;
    const { dataSource } = this.myFillForm;
    if ( !dataSource ) return this.$message.warn( locale?.BIMModelFill.NoMBSIds as string );
    const { paymentData } = dataSource;
    if ( !paymentData ) return this.$message.warn( locale?.BIMModelFill.nonePaymentData as string );
    let url = `${ window.config.portalHost }/application/${ projectCode }/midMeasure?`;
    const mbsKey: any = await this.setStorage(paymentData.cbsIds.toString() + '@' + paymentData.cbsMbsIds.toString(), 'progress')
    if (mbsKey) url += `mbsKey=${mbsKey}`;
    window.open( `${url}` );
  }

  /**
   *  跳转到质量巡检新增
   */
  private go2Quality() {

  }

  /**
   *  跳转到安全模块
   */
  private go2Security() {
    const { projectCode, locale } = this;
    const { dataSource } = this.myFillForm;
    if ( !dataSource ) return;
  }

  private calcSyncContentHeight() {
    const {
      LeftMenu,
      ModelTree,
      modelWBSTree,
      Panel,
      PanelNav,
      ModelListVirtualList,
      panelStatus
    } = this;
    const
      leftMenuSize = LeftMenu.getClientRects()[0],
      panelSize = Panel.getClientRects()[0],
      panelNavSize = PanelNav.getClientRects()[0];
    modelWBSTree.maxHeight = leftMenuSize.height - 28 - 36 - 32 - 15;
    panelStatus.maxHeight = panelSize.height - panelNavSize.height - 67 - 32 - 40;
  }

  /**
   * 保存至我的清单，自动生成清单名称
   *
   */
  private async saveMyList() {
    const {panelStatus, userId, locale, listId, listName, saveList, isClear} = this;
    //if ( panelStatus.saveListLoading ) return;
    if (!panelStatus.modelList.length) return;
    const modelSelects = JSON.parse(JSON.stringify(panelStatus.modelList)).map(item => {
      return {
        id: item.listId ?? undefined,
        modelCode: item.codeValue,
        modelCodeId: item.id,
        name: item.taskName,
        selectId: item.selectId ?? undefined
      }
    });
    if (isClear) return this.$confirm({
      title: locale?.BIMModelFill.InputListName,
      content: <Input ref={'ListName'} placeholder={locale?.BIMModelFill.InputListName}/>,
      okText: locale?.Common.Action.ok,
      onOk: () => {
        const listNameValue = (this.$refs.ListName as Input)?.stateValue;
        if (isEmpty(listNameValue)) return this.$message.error(locale?.BIMModelFill.InputListName as string);
        //panelStatus.saveListLoading = true;
        return new Promise(async (resolve, reject) => {
          const res = await saveList(modelSelects, listNameValue, userId, listId);
          if (res.errcode !== 0) {
            this.$message.error(res.errmsg as string);
            reject();
          } else {
            // panelStatus.modelList = [];
            this.isClear = false;
            this.getMyList();
            resolve({})
          }
        })
      },
      cancelText: locale?.Common.Action.cancel,
    });
    const res = await saveList(modelSelects, listName, userId, listId);
    if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
    // panelStatus.modelList = [];
    this.getMyList();
    this.isClear = false;//button（收藏）成功后转为button（保存）
  }

  private saveList(modelSelects, listNameValue, userId, listId?) {
    const {projectCode, projectConfig} = this;
    return Api.saveMyFillList({
      appCode: projectCode as string,
      modelSelects,
      selectId: listId ?? '',
      name: listNameValue,
      projectName: projectConfig?.projectName as string,
      userId: userId as string
    })
  }

  /**
   * 获取我的清单
   */
  private getMyList() {
    const { projectConfig, projectCode, userId, panelStatus } = this;
    Api.getMyFillList( {
      appCode: projectCode as string,
      projectName: projectConfig?.projectName as string,
      userId: userId as string
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) panelStatus.myList = res.data;
    } )
  }

  /**
   *  关闭非半勾选和全勾选节点
   * */
  private closeUnIndeterminateNode() {
    const { modelWBSTree, ModelTree } = this;
    const needCloseExpandNodes: Array<Type.ModelFIllWBSTreeNode> = [];
    Utils.deepFind( modelWBSTree.dataSources, item => {
      if ( item.checked !== !item.indeterminate ) {
        needCloseExpandNodes.push( item );
      }
      return false;
    }, 'children' );
    ModelTree.setTreeExpand( needCloseExpandNodes, false );
  }

  /**
   * 获取清单详情
   * @param id 清单id
   */
  private getMyListDetail(id: string, name: string) {
    this.isSpinning = true;
    this.isClear = false;
    this.listId = id;
    this.listName = name;
    const { panelStatus, myFillForm, ModelTree, ModelListVirtualList, locale } = this;
    if ( myFillForm.loading ) return this.$message.warn( locale?.BIMModelFill.WaitToLoadForm as string );
    Api.getFillListDetail( {
      id: id
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        ModelTree.setAllTreeExpand( true );
        ModelTree.clearCheckboxRow();
        this.$nextTick().then( () => {
          if ( !res.data ) return;
          ModelListVirtualList.scrollToIndex( 0 );
          const checkRows: Array<RowInfo> = [];
          panelStatus.modelList = res.data.map( item => {
            checkRows.push( ModelTree.getRowById( item.modelCodeId ) );
            return {
              listId: item.id,
              codeValue: item.modelCode,
              id: item.modelCodeId,
              taskName: item.name,
              selectId: item.selectId
            }
          } );
          this.isSpinning = false;
          this.checkKey = checkRows;
          ModelTree.setCheckboxRow( checkRows, true );
          this.closeUnIndeterminateNode();
          this.getFillForm();
        } );
      }
    } );
  }

  /**
   * 获取需要填报的表单
   */
  private getFillForm( cb?: Function ) {
    const { panelStatus, myFillForm, projectCode, projectConfig } = this;
    if ( myFillForm.loading ) return;
    myFillForm.loading = true;
    const modelSelects = panelStatus.modelList.map( item => {
      return {
        id: item.listId ?? '',
        modelCode: item.codeValue,
        modelCodeId: item.id,
        name: item.taskName,
        selectId: item.selectId ?? ''
      }
    } );
    Api.getModelInfo( {
      appCode: projectCode as string,
      modelSelects,
      projectName: projectConfig?.projectName as string
    } ).then( res => {
      myFillForm.loading = false;
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        myFillForm.dataSource = res.data;
        cb?.();
      }
    } );
  }

  private modelHighlight() {
    //todo:modelHighlight
    const { panelStatus, projectCode, projectConfig, modelHighLight } = this;
    if ( !panelStatus.modelList.length ) return;
    Api.getListBIMInfo( {
      appCode: projectCode as string,
      mbsIds: panelStatus.modelList.map( item => item.id ),
      projectName: projectConfig?.projectName as string
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        modelHighLight?.( res.data );
      }
    } )
  }

  private clearAllModelList() {
    const {panelStatus, ModelTree} = this;
    panelStatus.modelList = [];
    ModelTree.clearCheckboxRow();
    this.isClear = true;
    this.checkKey = [];
  }

  public receiveLayersMSGFromBim(data) {
    this.isSpinning = true;
    const {
      projectCode,
      projectConfig,
      ModelListVirtualList,
      panelStatus,
      ModelTree,
      listId,
      isClear,
      checkKey
    } = this;
    if (data.length === 0) return;
    Api.getModelCodeFromBim({
      appCode: projectCode ?? '',
      projectName: projectConfig?.projectName ?? '',
      datas: data
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      ModelTree.setAllTreeExpand(true);
      ModelTree.clearCheckboxRow();
      this.$nextTick().then(() => {
        if (!res.data) return;
        ModelListVirtualList.scrollToIndex(0);
        const checkRows: Array<RowInfo> = [];
        const modelListBim: Array<any> = [];
        res.data.forEach(item => {
          checkRows.push(ModelTree.getRowById(item.modelCodeId));
          let isExist = false;
          for (let j = 0; j < panelStatus.modelList.length; j++) {
            const taskName = panelStatus.modelList[j].taskName;
            if (item.name == taskName) {
              isExist = true;
              break;
            }
          }
          if (!isExist) {
            modelListBim.push({
              codeValue: item.modelCode,
              id: item.modelCodeId,
              taskName: item.name,
              selectId: listId ?? ''
            });
          }
        });
        this.isSpinning = false;
        // eslint-disable-next-line prefer-spread
        if (!isClear) checkRows.push.apply(checkRows, checkKey);
        // eslint-disable-next-line prefer-spread
        panelStatus.modelList.push.apply(panelStatus.modelList, modelListBim);
        ModelTree.setCheckboxRow(checkRows, true);
        this.closeUnIndeterminateNode();
        this.getFillForm();
      })
    })
  }
}
