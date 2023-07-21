import {
  initCard,
  getSubTab,
  getAllCardData,
  getMeasureCardV3,
  getMeasureCardV2,
  getScheduleCardV3,
  getScheduleCardV2,
  getColumns,
  getFormUrl,
  getQualityCard,
  getModelPropertyBimCard
} from './infoPop.api';
import {Button, Tabs, Spin, Table, Icon} from "@h3/antd-vue";
import {Component, InjectReactive, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import VueDragResize from 'vue-drag-resize';
import Attachments from './attachments.vue';
import FormDetail from './formDetail.vue';
//@ts-ignore
import env from "@/config/env";
//@ts-ignore
import closeIcon from '../../../../src/assets/extends/bim/infoPop/close.png'
//@ts-ignore
import titleQQ from '../../../../src/assets/extends/bim/infoPop/titleQQ.png'
//@ts-ignore
import icon_arr1 from '../../../../src/assets/extends/bim/infoPop/icon_arr1.png'
//@ts-ignore
import lineIcom from '../../../../src/assets/extends/bim/infoPop/形状1312.png'
//@ts-ignore
import fileIcon from '../../../../src/assets/extends/bim/infoPop/11.png'
import {QbsBiz} from "./type/type";
import onActionClick from "../../../../../../modules/@cloudpivot/list/src/components/pc/scripts/onActionClick";
import {BimModelAttribute, TableColumn} from "../../../type";
import ClassLibraryProperty from "./ClassLibraryProperty.vue";

@Component({
  name: "infoPopTs",
  components: {
    AButton: Button,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ATable: Table,
    AIcon: Icon,
    ASpin: Spin,
    VueDragResize,
    Attachments,
    FormDetail,
    ClassLibraryProperty
  }
})
export default class infoPopTs extends Vue {
  @Prop() projectCode!: string;

  @Prop() projectId!: string;

  @Prop() SMID!: Array<any>;

  @Prop() LAYERNAME!: string;

  @Prop() projectName!: string;

  @Prop() modelType!:string;

  @Prop() codeValue!: string;

  closeIcon: any = closeIcon;
  titleQQ: any = titleQQ;
  icon_arr1: any = icon_arr1;
  lineIcom: any = lineIcom;
  fileIcon: any = fileIcon;

  vw: number = 0;
  vh: number = 0;
  top: number = 0;
  left: number = 0;
  showID: string = '';

  markStr: string = '';
  markId: string = '';
  tabShow: boolean = true;//判断是否有第二级菜单
  collapseClose: boolean = true;//与markId一起控制折叠面板的折叠
  closeTableID: Array<string> = [];//控制表格内容折叠
  showSpin: boolean = false;
  // isShowTable: boolean = true;//与closeTableID一起控制表格内容折叠


  fatherButtonData: Array<object> | null = [];
  subButtonData: Array<object> | null = [];
  tableData: Array<object> | null = [];
  horizontalData: object = {};
  verticalData: object = {};
  isHorizontal: boolean = false;
  formDetailCode: string | null = null;

  activeKey:string="";
  enableEdit:boolean=true;

  @Watch('SMID', {immediate: true})
  SMIDListener(val: Array<any>) {
    this.markStr = val[0];
    this.vw = 350;
    this.vh = 700;
    this.top = 100;
    this.left = 1100;
    this.initTab();
    // this.isShowTable= true;
  }

  @Watch('codeValue', {immediate: true})
  codeValueListener(val: Array<any>) {
    if(!val) return;
    this.markStr = val[0];
    this.vw = 350;
    this.vh = 700;
    this.top = 100;
    this.left = 1100;
    this.initTab();
    // this.isShowTable= true;
  }


  /**
   * 初始化tab
   */
  initTab() {
    this.subButtonData = [];
    this.tableData = [];
    this.horizontalData = {};
    this.verticalData = {};
    this.fatherButtonData = [];
    const {projectCode, projectId} = this;
    initCard({
      appCode: projectCode,
      projectId: projectId
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.fatherButtonData = res.data as unknown as Array<object> | null;
      if (this.fatherButtonData !== null && this.fatherButtonData.length !== 0) {
        // @ts-ignore
        document.documentElement.style.setProperty('--foo', Number(350 / this.fatherButtonData.length) + 'px');
      }
      // @ts-ignore
      this.pressFather(this.fatherButtonData[0]?.id)
      //@ts-ignore
      this.activeKey=this.fatherButtonData?.[0]?.id;
    });
  }

  /**
   * 初始化按钮（点击tab触发）
   * @param fatherId 所点击tab的key
   */
  initButton(fatherId) {
    const {projectCode, projectId} = this;
    this.tabShow = true;
    getSubTab({
      appCode: projectCode,
      projectId: projectId,
      fatherTabId: fatherId
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.subButtonData = res.data as unknown as Array<object> | null;
      if (this.subButtonData?.length == 0) {
        this.tabShow = false;
        this.pressSubButton({id: fatherId});
      }
    });
  }

  /**
   * 变换tab触发事件
   * @param key 所点击tab的key
   */
  pressFather(key) {
    this.subButtonData = [];
    this.tableData = [];
    this.horizontalData = {};
    this.verticalData = {};
    this.markId = '';
    this.collapseClose = true;
    this.initButton(key);
    this.getModelPropertyBimCard(key)
    this.initSubModalProperty()
  }

  //模型属性-类库定义-一级
  modelPropertyData:BimModelAttribute[] = [];
  modelPropertyTitle: string = '';
  modelPropertyColumns: TableColumn<any>[] = [
    {
      title: '属性名称',
      dataIndex: 'propertyName',
      width: '100px',
      key: 'propertyName'
    },
    {
      title: '属性内容',
      dataIndex: 'propertyContent',
      key: 'propertyContent',
      width: '230px',
      scopedSlots: {customRender: 'propertyContent'},
    }];
  propertyLoading: boolean = false;
  showModelPropertyTable: boolean = false;
  getModelPropertyBimCard(bimCardId:string) {
    this.showModelPropertyTable = false;
    this.modelPropertyData = [];
    this.propertyLoading = true;
    getModelPropertyBimCard({
      appCode: this.projectCode??'',
      projectName: this.projectName??'',
      projectId: this.projectId??'',
      bimCardId: bimCardId,
      modelType: this.modelType??'',
      smid: this.SMID[0]??'',
      dataSource: this.LAYERNAME??'',
      codeValue: this.codeValue??''
    }).then((res)=> {
      if(res.errcode===1000) return console.log(res.errmsg as string)
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.showModelPropertyTable = true;
      // for (const key in res.data.tableDatas) {
      this.modelPropertyTitle = '类库信息';
      this.modelPropertyData = res.data;
      // this.modelPropertyData = res.data.tableDatas[key]
      // }
    }).finally(()=> {
      this.propertyLoading = false
    })
  }
  closeModalProTable() {
    this.showModelPropertyTable = !this.showModelPropertyTable;
    //@ts-ignore
    this.activeKey=this.fatherButtonData?.[0]?.id;
  }

  //类库属性-二级
  subModelPropertyData:BimModelAttribute[] = [];
  subModelPropertyTitle: string = '';
  subModelPropertyColumns: TableColumn<any>[] = [
    {
      title: '属性名称',
      dataIndex: 'propertyName',
      width: '100px',
      key: 'propertyName'
    },
    {
      title: '属性内容',
      dataIndex: 'propertyContent',
      key: 'propertyContent',
      width: '250px',
      scopedSlots: {customRender: 'propertyContent'},
    }];
  subPropertyLoading: boolean = false;
  subShowModelPropertyTable: boolean = false;
  getSubModelPropertyBimCard(bimCardId:string) {
    this.subShowModelPropertyTable = false;
    this.subModelPropertyData = [];
    this.subPropertyLoading = true;
    getModelPropertyBimCard({
      appCode: this.projectCode??'',
      projectName: this.projectName??'',
      projectId: this.projectId??'',
      bimCardId: bimCardId,
      modelType: this.modelType??'',
      smid: this.SMID[0]??'',
      dataSource: this.LAYERNAME??'',
      codeValue: this.codeValue??''
    }).then((res)=> {
      if(res.errcode===1000) return console.log(res.errmsg as string)
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.subShowModelPropertyTable = true;
      this.subModelPropertyTitle = '模型属性';
      this.subModelPropertyData = res.data;
      // for (const key in res.data.tableDatas) {
      //   this.subModelPropertyTitle = key;
      //   this.subModelPropertyData = res.data.tableDatas[key]
      // }
    }).finally(()=> {
      this.subPropertyLoading = false
    })
  }
  closeSubModalProTable() {
    this.subShowModelPropertyTable = !this.subShowModelPropertyTable
  }
  initSubModalProperty() {
    this.subModelPropertyData = [];
    this.subModelPropertyTitle = '';
    this.subPropertyLoading = false;
    this.subShowModelPropertyTable = false;
  }

  pressSubButton(value) {
    this.showSpin = true;
    this.markId = value.id;
    this.collapseClose = !this.collapseClose;
    this.horizontalData = {};
    this.verticalData = {};
    this.initSubModalProperty();
    if (!this.collapseClose) {
      const {projectCode, projectId, LAYERNAME, markStr, projectName} = this;
      switch (value.buttonName) {
        case '计量信息':
          if (value.moduleVersion == 'v2') {
            getMeasureCardV2({
              appCode: projectCode,
              projectId: projectId,
              projectName: projectName,
              bimCardId: value.id,
              dataSource: LAYERNAME,
              smid: markStr,
              modelType: this.modelType??'',
              codeValue: this.codeValue??''
            }).then(res => {
              if (res.data?.dataDisplay == "纵向") return this.verticalTable(res.data.tableDatas)
            });
          } else {
            getMeasureCardV3({
              appCode: projectCode,
              projectId: projectId,
              projectName: projectName,
              bimCardId: value.id,
              dataSource: LAYERNAME,
              smid: markStr,
              modelType: this.modelType??'',
              codeValue: this.codeValue??''
            }).then(res => {
              if (res.data?.dataDisplay == "纵向") return this.verticalTable(res.data.tableDatas)
            });
          }
          //获取二级阶段类库属性
          this.getSubModelPropertyBimCard(value.id);
          break;
        case '进度信息':
          if (value.moduleVersion == 'v2') {
            getScheduleCardV2({
              appCode: projectCode,
              projectId: projectId,
              projectName: projectName,
              bimCardId: value.id,
              dataSource: LAYERNAME,
              smid: markStr,
              modelType: this.modelType??'',
              codeValue: this.codeValue??''
            }).then(res => {
              if (res.data?.dataDisplay == "纵向") return this.verticalTable(res.data.tableDatas)
            });
          } else {
            getScheduleCardV3({
              appCode: projectCode,
              projectId: projectId,
              projectName: projectName,
              bimCardId: value.id,
              dataSource: LAYERNAME,
              smid: markStr,
              modelType: this.modelType??'',
              codeValue: this.codeValue??''
            }).then(res => {
              if (res.data?.dataDisplay == "纵向") return this.verticalTable(res.data.tableDatas)
            });
          }
          //获取二级阶段类库属性
          this.getSubModelPropertyBimCard(value.id);
          break;
        case '质量信息':
          getQualityCard({
            appCode: projectCode,
            projectName: projectName,
            smid: markStr,
            dataSource: LAYERNAME,
            modelType: this.modelType??'',
            codeValue: this.codeValue??''
          }).then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
            this.qualityTable(res.data)
          });
          //获取二级阶段类库属性
          this.getSubModelPropertyBimCard(value.id);
          break;
        default:
          if(value.buttonLevel && value.buttonLevel === '2'){
            this.getSubModelPropertyBimCard(value.id)
          }
          getAllCardData({
            appCode: projectCode,
            projectId: projectId,
            projectName: projectName,
            bimCardId: value.id,
            dataSource: LAYERNAME,
            smid: markStr,
            modelType: this.modelType??'',
            codeValue: this.codeValue??''
          }).then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
            if (res.data?.dataDisplay == "横向") return this.horizontalTable(res.data.tableDatas)
            return this.verticalTable(res.data?.tableDatas)
          });
      }
    }
  }

  winOpen(val, val1) {
    const {datas} = val;
    const urlAction = datas?.[0].bizObjId ? 'detail' : 'add';
    // const urlReturn = `/${this.projectCode}/QualityDB?code=${val.schemaCode}&openMode&pcUrl&queryCode=&iframeAction=${urlAction}`;
    let urlReturn:string = '';
    if(this.isDingTalk) {
      const projectLength:number = window.config.project.length;
      const pathName = location.pathname.substring(location.pathname.search(window.config.project) + projectLength,location.pathname.length);
      urlReturn = `${pathName}?code=${val.schemaCode}&openMode&pcUrl&queryCode=&iframeAction=${urlAction}`;
    }else{
      urlReturn = `${location.pathname}?code=${val.schemaCode}&openMode&pcUrl&queryCode=&iframeAction=${urlAction}`
    }
    let url = `/form/detail?schemaCode=${val.schemaCode}&sheetCode=${val.sheetCode}&queryCode=${val.schemaCode}&qbsCode=${val.qbsCode}&projectName=${this.projectName}`;
    let urlDetail = `/form/detail?sheetCode=${val.schemaCode}&objectId=${datas?.[0].bizObjId}&schemaCode=${val.schemaCode}&isWorkFlow=false&return=${encodeURIComponent(urlReturn)}`;
    if (val.workFlowCode) {
      url += `&startWorkflowCode=${val.workFlowCode}&return=${encodeURIComponent(urlReturn)}`;
      getFormUrl({
        //bizObjectId: val.recordId,
        bizObjectId: datas?.[0].bizObjId as string,
        schemaCode: val.schemaCode,
        //formCode: val.workFlowCode,
      }).then(res => {
        urlDetail = `${res}`;
        if(this.isDingTalk) {
          urlAction === 'add' ? this.$router.push(url) : this.$router.push(urlDetail)
        }else{
          window.open(urlAction === 'add' ? `/${this.projectCode}${url}` : `/${this.projectCode}${urlDetail}`);
        }
      })
    } else {
      url += `&return=${encodeURIComponent(urlReturn)}`;
      if(this.isDingTalk) {
        urlAction === 'add' ? this.$router.push(url) : this.$router.push(urlDetail)
      }else{
        window.open(urlAction === 'add' ? `/${this.projectCode}${url}` : `/${this.projectCode}${urlDetail}`);
      }
    }

  }

  addForm(r: QbsBiz) {
    const routeData = this.$router.resolve({
      name: "form-detail",
      query: {
        schemaCode: r.schemaCode,
        sheetCode: r.schemaCode,
        iframeAction: 'add',
        projectName: r.projectName,
        qbsCode: r.qbsCode,
        startWorkflowCode: r.workFlowCode,
        return: `${this.$route.fullPath}&iframeAction=add`,
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }

  getFormList(r: QbsBiz) {
    if (r.completeFraction === '0/0') return;
    if(r.datas.length===1) {
      getFormUrl({
        bizObjectId: r.datas[0].bizObjId?? '',
        schemaCode: r.datas[0].schemaCode
      }).then((res)=> {
        // 如果报错, 会返回一个对象
        // @ts-ignore
        if ( typeof res === "object" && res.errcode !== 0 ) {
          // @ts-ignore
          return this.$message.error( res.errmsg as string, 3 );
        }
        // 否则返回一个字符串
        else if ( typeof res === "string" ) {
          let search = location.search;
          search = search
            ? `${search}&iframeAction=detail`
            : `?iframeAction=detail`;
          let url:string = '';
          if(this.isDingTalk) {
            const projectLength:number = window.config.project.length;
            const pathName =  location.pathname.substring(location.pathname.search(window.config.project) + projectLength,location.pathname.length);
            url = `${ res }&return=${ pathName + encodeURIComponent( search )}`;
          }else{
            url = `${ res }&return=${ location.pathname + encodeURIComponent( search )}`;
          }
          if(this.isDingTalk) {
            this.$router.push(url)
          }else {
          const formUrl = onActionClick.getFormRealUrl( this, url );
          window.open( formUrl );
        }
        }
      })
    }else {
      let idStr: string = '';
      r.datas?.map((i) => {
        idStr += i.bizObjId + ';'
      })
      const routeData = this.$router.resolve({
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
      })
      window.open(routeData.href, '_blank');
    }
  }

  horizontalTable(value) {
    this.horizontalData = {};
    this.isHorizontal = true;
    for (const key in value) {
      getColumns({
        code: key,
        schemaCode: key,
        source: 1
      }).then(res => {
        const temptData: object = {};
        const columns: Array<any> = res.data?.queryColumns;
        for (let i = 0; i < columns.length; i++) {
          this.$set(columns[i], 'key', columns[i].id);
          this.$set(columns[i], 'title', columns[i].name);
          this.$set(columns[i], 'dataIndex', columns[i].propertyCode);
        }
        this.$set(temptData, 'columns', columns);
        this.$set(temptData, 'data', value[key]);
        this.$set(this.horizontalData, key, temptData);
        this.showSpin = false;
      })
    }
  }

  qualityTable(value) {
    if (!value) return;
    const {mbsQbsBizs} = value;
    mbsQbsBizs.forEach(item => {
      const temptData: object = {};
      this.$set(temptData, 'columns', [{
        title: '文件名称',
        dataIndex: 'bizSheetName',
        // width: '30%',
        key: 'sheetName',
        scopedSlots: {customRender: 'bizSheetName'},
      },
        // {
        // title: '状态',
        // dataIndex: 'status',
        // key: 'status',
        // width: 80,
        // scopedSlots: { customRender: 'status' },},
        {
          title: '记录数',
          dataIndex: 'header_2',
          width: 80,
          customRender: (t, r) => {
            return r.datas?.length ?? 0
          }
        },
        {
          title: '操作',
          dataIndex: 'header_3',
          width: 100,
          align: 'center',
          scopedSlots: {customRender: 'operate'}
        }
      ]);
      this.$set(temptData, 'data', item.qbsBizs)
      this.$set(temptData, 'mbsCode', value.mbsCode)
      this.$set(this.verticalData, item.qbsName, temptData)
    });
    this.showSpin = false;
  }

  verticalTable(value) {
    for (const key in value) {
      const temptData: object = {};
      this.$set(temptData, 'columns', [{
        title: '文件名称',
        dataIndex: 'name',
        width: '100px',
        key: 'name',
        scopedSlots: {customRender: 'name'},
      }, {
        title: '状态',
        dataIndex: 'msg',
        key: 'msg',
        width: '250px',
        scopedSlots: {customRender: 'msg'},
      }]);
      this.$set(temptData, 'data', value[key]);
      this.$set(this.verticalData, key, temptData)
    }
    this.showSpin = false;
  }

  toUrl(value) {
    const token = localStorage.getItem("token");
    if (value.property.indexOf("/") != -1) return window.open(`${env.apiHost}/${value.property}&access_token=${token}`)
    if (value.property.indexOf("/") == -1) {
      getFormUrl({
        bizObjectId: value.property,
        schemaCode: value.schemaCode,
      }).then(res => {
        return window.open(`${env.portalHost}${res}&access_token=${token}`)
      })
    }
  }

  closeTable(value) {

    if (this.closeTableID.indexOf(value) != -1) {
      this.closeTableID = this.closeTableID.filter(function (item) {
        return item != value
      });
    } else {
      this.closeTableID.push(value)
    }
  }

  openFormDetail(v) {
    this.formDetailCode = v?.schemaCode;
  }

  clickHandle(e:MouseEvent){
    //@ts-ignore
    // if (e.target?.nodeName === 'INPUT' || e.target?.nodeName === 'TEXTAREA') {
      //@ts-ignore
    	e.target.focus()
  //  }
  }

  infoPopClose(){
    this.markStr="";
    //@ts-ignore
    this.activeKey=this.fatherButtonData?.[0]?.id;

  }

  updateModelProperty(){
    this.pressFather(this.activeKey);
  }
}
