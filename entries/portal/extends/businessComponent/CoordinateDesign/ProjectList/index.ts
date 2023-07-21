import { Component, Vue, InjectReactive, Ref } from 'vue-property-decorator';
import {Input,Button,Icon,Tree,Progress,Spin,Modal,FormModel,Tooltip} from "@h3/antd-vue"
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style";
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Checkbox from 'ant-design-vue/lib/checkbox';
import 'ant-design-vue/lib/checkbox/style/index.css';
import Pagination from 'ant-design-vue/lib/pagination';
import 'ant-design-vue/lib/pagination/style/index.css';
import {exampleData} from "../../engineeringArchives/mock";
import {favorite,recentUse,Project,queryFavorite,queryRecentUse,projectListV1,projectListV2,queryDropBox} from "../../../service/CoordinateDesign/ProjectList";
import {UUID,replayToken,submit,save,sheetConfig,loadSheetData,SheetData} from "../../../service/CoordinateDesign/common"
import moment from "moment"
import { BizObject } from "../../../service/CoordinateDesign/WorkingOutline/ProductionTaskList";
import DataForm,{FormData} from "../WorkingOutline/ProductionTaskList/components/DataForm";
import { ControlHelper } from '@cloudpivot/form/src/common/controls/control-helper';
import {DataItemType} from "@cloudpivot/form/src/schema/data-item-type";
import {FormControlType} from "@cloudpivot/form/src/schema/form-control-type";
import {DateItemOperatorType,logicDataItemOperators,numberDataItemOperators,sequenceStatusOperators,staffDataItemOperators,textDataItemOperators} from "@cloudpivot/form/src/common/data-item/data-item2";
import {form, formApi, listApi} from "../../../../../../modules/@cloudpivot/api";
import BaseSelect from "../../deviceManagement/BaseSelect.vue";
import {DefineTypes, ProjectListConditions, TableColumn} from "../../../type";
import {Table as VXETable} from "vxe-table";
import * as Type from "../../../../../mobile/extends/type";
import Utils from "../../../../../mobile/extends/utils";
import { projectLevelSort } from "../publicConfig";
import {formatterUploadImgNumber} from "@cloudpivot/form/utils";
import { queryProjectListV4 } from "../../../service/CoordinateDesign/myHomePage";

@Component({
  name:"ProjectList",
  components:{
    [Input.name]:Input,
    [Input.Search.name]:Input.Search,
    [Button.name]:Button,
    [Icon.name]:Icon,
    [Tree.name]:Tree,
    [Tree.DirectoryTree.name]:Tree.DirectoryTree,
    [Table.name]:Table,
    [Progress.name]:Progress,
    [Spin.name]:Spin,
    [Modal.name]:Modal,
    [FormModel.name]:FormModel,
    [FormModel.Item.name]:FormModel.Item,
    [Tooltip.name]:Tooltip,
    DataForm,
    ASelect: Select,
    ASelectOption: Select.Option,
    ACheckBox: Checkbox,
    APagination: Pagination,
    BaseSelect
  },
  filters:{
    engineeringStage:function(value:string){
      if(value){
        if(value.indexOf('阶段')>-1) {
          return value.substring(0,value.length-2)
        }else {
          return value
        }
      }else{
        return "无阶段"
      }
    }
  }
})
export default class ProjectList  extends Vue {
  @InjectReactive("project") appCode!:string;
  @Ref("projectTable") projectTable!:HTMLDivElement;
  @Ref("cardGroups") cardGroups!:HTMLDivElement;
  //TODO 改版项目管理 start
  projectLevelSortConfig:DefineTypes[] = [];
  getTreeTable(text:string,dynamicColumnType:number) {
    this.dynamicColumnHeader = text;
    this.dynamicColumnType = dynamicColumnType;
    this.getProjectTree();
  }
  dynamicColumnType: number = 1
  dynamicColumnHeader: string = '';
  tableLoading: boolean = false;
  projectTree:any = [];
  projectTreeColumns:TableColumn<any>[] = [
    {
      title: '年份',
      dataIndex: 'dynamicColumn',
      key: 'dynamicColumn'
    },
    {
      title: '省份',
      dataIndex: 'engineeringName',
      key: 'engineeringName'
    },
    {
      title: '工程类别',
      dataIndex: 'engineeringName',
      key: 'engineeringName'
    },
    {
      title: '生产单位',
      dataIndex: 'workflowName',
      key: 'workflowName',
    },
  ]
  @Ref() MainTable?: VXETable;
  private mainTable: any = {
    loading: false,
    checkAble: false,
    currentRow: null,
    conditions: null,
    status: null,
    treeField: 'dynamicColumnList',
    hasChild: 'hasChild',
    dataSource: [],
    columns: [
      {
        title: "总数",
        field: 'count',
        width: 50,
        align: 'center',
        slots: { default: "count"},
        className: 'count'
      },
      {
        title: "年度",
        field: 'dynamicColumn',
        mixWidth: '300',
        treeNode: true, // 树节点声明--重点
        slots: {default: "dynamicColumn",header:'dynamicColumnHeader'} // 插槽声明
      },
      // {
      //   title: "省份",
      //   field: '',
      // },
      // {
      //   title: "项目名称",
      //   field: '',
      // },
      {
        title: "工程类别",
        field: 'industryType',
        align: 'center',
        width: 100
      },
      {
        title: "生产单位",
        field: 'manufacturer',
        align: 'center',
      },
      {
        title: "项目阶段",
        field: 'engineeringStage',
        align: 'center',
        width: 120
      },
      {
        title: "当前状态",
        field: 'manufactureStatus',
        align: 'center',
        width: 100,
        slots: {default: "manufactureStatus"} // 插槽声明
      },
      {
        title: "当前处理人",
        field: 'currentHandler',
        align: 'center',
        width: 120
      },
      {
        title: "计划开始日期",
        field: 'planStartTime',
        align: 'center',
        width: 120,
      },
      {
        title: "计划结束日期",
        field: 'planEndTime',
        align: 'center',
        width: 120
      },
      {
        title: "计划工期（天）",
        field: 'planDuration',
        align: 'center',
        width: 120
      },
      ]
  }
  private adapterImpl<T>(dataSource: Array<T>, childrenKey: string): void {
    Utils.deepFind(dataSource, item => {
      item.checked = false;
      item.hasChild = !item.isLeafNode;
      item.childs = item.isLeafNode ? undefined : item.dynamicColumnList;
      item.isLeaf = !!item.isLeafNode;
      return false;
    }, childrenKey);
  }
  getProjectTree() {
    this.mainTable.dataSource = [];
    this.mainTable.loading = true;
    // this.mainTable.dataSource = exampleData.response.data.projectData.data;
    // this.adapterImpl(this.mainTable.dataSource,this.mainTable.treeField)
    // setTimeout(()=> {
    //   this.mainTable.loading = false
    // },1000)
    queryProjectListV4({
      appCode: this.appCode??'',
      engineeringName: this.projectName??'',
      type: this.menuIndex===0?1:this.menuIndex===1?2:this.menuIndex===2?3:0,
      dynamicColumnType: this.dynamicColumnType
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.mainTable.dataSource = res.data;
      this.adapterImpl(this.mainTable.dataSource,this.mainTable.treeField)
    }).finally(()=> {
      this.mainTable.loading = false;
    })
    console.log(this.mainTable.dataSource,'11')
  }
  toProductionTaskList(notesURL:string,id:string) {
    if (notesURL) {
      //@ts-ignore
      this.toNotes(notesURL)
    }else {
      this.$router.push({
        name:"ProductionTaskList",
        query:{
          projectId:id,
        }
      })
    }
  }
  getAllProject() {
    this.checkedAll = true;
    this.getProjectListV2()
  }
  //TODO end

  userInfo:{id:string,name:string,departmentId:string,departmentName:string;imgUrl:string|null,unitType:number}={id:"",name:"",departmentId:"",departmentName:'',imgUrl:null,unitType:0};
  projectName="";
  /* Menu */
  menuIndex=0;
  async menuClick(index:number){
    this.dynamicColumnType = 1;
    this.dynamicColumnHeader = JSON.parse(JSON.stringify(projectLevelSort[0].text))
    if(this.menuIndex===index)return;
    this.resetCondition();
    this.menuIndex=index;
    localStorage.setItem("menuIndex",index+'');
    // this.currentColumns=this.menuIndex===0?this.expandColumns:this.columns;
    if(this.menuIndex===0){
      this.getProjectListV2();
    }else if(this.menuIndex==1){
      // await this.getRecentUse();
      this.getAllProject()
    }else{
      if (this.listStyleIndex===0) {
        this.getProjectTree();
      }else {
        await this.getFavorite();
      }
    }
  }
  /* 新增修改弹窗配置 */
  modal={
    title:"",
    centered:true,
    visible:false,
    confirmLoading:false,
    destroyOnClose:true,
    maskClosable:false,
    afterClose:this.resetFormData,
    cancel:()=>{
      this.modal.visible=false;
    },
  }
  /* 初始化表单数据 */
  resetFormData(){
    this.formData.data = {
      glid:{},
      engineeringType: '',
      sequenceNo: '',
      constructionPhase: '',
      id:undefined,
      workItemId:undefined,
      workflowTokenId:undefined,
      workflowInstanceId:undefined,
      rejectToActivityCode:undefined,

      engineering_name: undefined,
      engineering_location: undefined,
      industryType:undefined,
      projectType:undefined,
      engineering_stage: undefined,
      modelType: '',
      engineering_number: undefined,
      manufacturer_admin:undefined,
      manufacturer_depart_manager: undefined,
      manufacturer:undefined,
      manufacturer_manager:undefined,
      collaboration:undefined,
      collaboration_manager:undefined,
      company_manager:undefined,
      archivist:undefined,
      actual_contract_money:undefined,
      evaluation_contract_money:undefined,
      evaluation_contract_remark:undefined,
      company_chief_engineer:undefined,
      project_level:undefined,
      company_review_flag:undefined,
      manufacturer_chief_engineer:undefined,
      project_manager:undefined,
      manufacturer_vice_engineer:undefined,
      manufacturer_vice_manager:undefined,
      year:undefined,
      quarter:undefined,
      task_priority:undefined,
      risk_level:undefined,
      plan_end_time:undefined,
      plan_start_time:undefined,
      plan_duration:undefined,
      actual_end_time:undefined,
      warning_date1:undefined,
      warning_date2:undefined,
      work_content:undefined,
      schedule:undefined,
      scattered_contract_flag:undefined,
      manufacture_status:undefined,
      task_type:undefined,
      remark:undefined,
      remaining_problem:undefined,
      current_person:undefined,
      departHeaders:undefined,
      picture:undefined,
      workday_duration:undefined,
      submitButton:true,
    };
    for (const key in this.formData.sheetConfig) {
      if (Object.prototype.hasOwnProperty.call(this.formData.sheetConfig, key)) {
        const element = this.formData.sheetConfig[key];
        if(element.defaultValue){
          let value = element.defaultValue;
          if(typeof value ==="string"){
            if(this.formData.sheetConfig[key].type === 50){
              value = JSON.parse(value);
            }
            if(this.formData.sheetConfig[key].type === 3 && value==="none"){
              value = undefined;
            }
          }
          this.formData.data[key] = value;
        }
        if(element.defaultValueType){
          if(element.defaultValueType === "originator"){
            this.formData.data[key] =[
                {id:this.userInfo.id,name:this.userInfo.name,type:this.userInfo.unitType}
            ];
          }
        }
      }
    }
  }

  formData:FormData = {
    data:{
      glid: {},
      engineeringType: '',
      sequenceNo: '',
      constructionPhase: '',
      id:undefined,
      workItemId:undefined,
      workflowTokenId:undefined,
      workflowInstanceId:undefined,
      rejectToActivityCode:undefined,

      engineering_name: undefined,
      engineering_location: undefined,
      industryType:undefined,
      projectType:undefined,
      engineering_stage: undefined,
      modelType: '',
      engineering_number: undefined,
      manufacturer_admin:undefined,
      manufacturer_depart_manager: undefined,
      manufacturer:undefined,
      manufacturer_manager:undefined,
      collaboration:undefined,
      collaboration_manager:undefined,
      company_manager:undefined,
      archivist:undefined,
      actual_contract_money:undefined,
      evaluation_contract_money:undefined,
      evaluation_contract_remark:undefined,
      company_chief_engineer:undefined,
      project_level:undefined,
      company_review_flag:undefined,
      manufacturer_chief_engineer:undefined,
      project_manager:undefined,
      manufacturer_vice_engineer:undefined,
      manufacturer_vice_manager:undefined,
      year:undefined,
      quarter:undefined,
      task_priority:undefined,
      risk_level:undefined,
      plan_end_time:undefined,
      plan_start_time:undefined,
      plan_duration:undefined,
      actual_end_time:undefined,
      warning_date1:undefined,
      warning_date2:undefined,
      work_content:undefined,
      schedule:undefined,
      scattered_contract_flag:undefined,
      manufacture_status:undefined,
      task_type:undefined,
      remark:undefined,
      remaining_problem:undefined,
      current_person:undefined,
      departHeaders:undefined,
      picture:undefined,
      workday_duration:undefined,
      submitButton:true,
    },
    rules:{},
    sheetConfig:{},
    optionsWatch:{},
    options:{}
  };

  /* 收藏数量 */
  favoritesCount=0;
  /* listStyle */
  listStyleIndex=1;

  async listStyleClick(index:number,reloaded=false){
    if(this.listStyleIndex===index&&!reloaded)return;
    this.listStyleIndex=index;
    localStorage.setItem("listStyleIndex",index+'');
    try{
      if(this.menuIndex===0){
        this.dynamicColumnType = 1;
        this.dynamicColumnHeader = JSON.parse(JSON.stringify(projectLevelSort[0].text))
        if(index===0){
          this.cardDataSource=[];
        }else{
          this.dataSource=[];
        }
        await this.getProjectListV2();
      }else if(this.menuIndex===1){
        // await this.getRecentUse();
        this.getAllProject()
      }else{
        if (this.listStyleIndex===0) {
          this.getProjectTree();
        }else {
          await this.getFavorite();
        }
      }
    }finally{
    }

  }
  /*Tree*/
  treeData=[
    // {name:"项目阶段",value:"engineeringStage",},
    {name:"省份地区",value:"engineeringLocation"},
    // {name:"生产单位",value:"manufacturer",},
    {name:"年度",value:"year",},
    {name:"工程分类",value:"industryType",},
    // {name:"项目状态",value:"status",},
    // {name:"项目经理",value:"projectManager",},
  ]

  selectedKey=0;
  hoverKey:number|null=null;
  selecteValue=this.treeData[0].value;

  /* Table */
  columns:{title:string,key?:string,dataIndex:string,align?:'left' | 'right' | 'center',scopedSlots?:{customRender:string},
    customRender?:(text:string, record, index:number)=>string,width?:string|number,colSpan?:number}[]=[
    {title:"项目名称",dataIndex:"engineeringName"},
    {title:"当前状态",dataIndex:"manufactureStatus",align:"center",},
    {title:"开始日期",dataIndex:"planStartTime",align:"center",},
    {title:"结束日期",dataIndex:"planEndTime",align:"center",},
    {title:"计划工期(天)",dataIndex:"planDuration",align:"center",},
    {title:"项目进度",dataIndex:"projectRatio",scopedSlots:{customRender:"ProgressBar"},},
  ];
  expandColumns:{title?:string,key?:string,dataIndex:string,align?:'left' | 'right' | 'center',scopedSlots?:{customRender:string},slots?:{[key:string]:string}
    customRender?:(text:string, record, index:number)=>string|object,width?:string|number,colSpan?:number}[]=[
    {dataIndex:"title",width:280,slots:{title:"engineeringNameTitle"},align:"left",scopedSlots:{customRender:"engineeringTitle"},},
    // {title: '项目名称',dataIndex: 'engineeringName',key: 'engineeringName'},
    // {title: '年份',dataIndex: 'year',key: 'year',width: 80},
    // {title: '省份',dataIndex: 'engineeringLocation',key: 'engineeringLocation'},
    // {title: '工程分类',dataIndex: 'industryType',key: 'industryType'},
    {title: '生产单位',dataIndex: 'manufacturer',key: 'manufacturer',width:200},
    {title:"当前阶段",dataIndex:"engineeringStage",align:"center",width:100},
    {title:"当前状态",dataIndex:"manufactureStatus",align:"center",scopedSlots:{customRender:"manufactureStatus"},width:150},
    {title:"当前处理人",dataIndex:"currentHandler",align:"center",width: 150},
    {title:"计划开始日期",dataIndex:"planStartTime",align:"center",width: 120},
    {title:"计划结束日期",dataIndex:"planEndTime",align:"center",width: 120},
    {title:"计划工期",dataIndex:"planDuration",align:"center",width:100},
    {dataIndex:"projectRatio",slots:{title:"projectRatioTitle"},scopedSlots:{customRender:"ProgressBar"},width: 120},
  ];
  currentColumns = this.expandColumns;
  dataSource:any[]=[];
  scroll = {
    y:260
  };
  loading=false;
  expandedRowKeys:string[]=[];

  // cardDataSource:{[key:string]:any[]}|null=null;
  cardDataSource:Project[] = [];
  cardLoadSpinning=false;
  created() {
    this.projectLevelSortConfig = JSON.parse(JSON.stringify(projectLevelSort))
    const conditionJson:string|null = sessionStorage.getItem('condition')
    if (conditionJson) {
      const conditions:ProjectListConditions = JSON.parse(conditionJson)
      for (const conditionsKey in conditions) {
        if (conditions[conditionsKey]) {
          this[conditionsKey] = conditions[conditionsKey]
        }
      }
    }
  }

  async mounted(){
    this.userInfo=JSON.parse(sessionStorage.getItem("user") as string);
    const index = localStorage.getItem("listStyleIndex");
    if(index){
      this.listStyleIndex = +index;
    }
    const menuIndex = localStorage.getItem("menuIndex");
    if(menuIndex){
      this.menuIndex = +menuIndex;
    }
    const selectedKey = localStorage.getItem("selectedKey");
    if(selectedKey){
      this.selectedKey = +selectedKey;
    }
    this.listSkipQueryList()
    // this.projectName = localStorage.getItem("projectName")??"";
    this.treeSelect(this.treeData[this.selectedKey],this.selectedKey,true);
    this.getFavorite(true);
    const config = await sheetConfig({sheetCode:"XTSJ_xmlb",schemaCode:"XTSJ_xmlb",appCode: this.appCode??'XTSJ'});
    if(typeof config ==="string"){
      return this.$message.error(`获取生产任务单初始配置失败,${config}`);
    }
    this.formData.sheetConfig =  config;
    // console.log(this.formData.sheetConfig,'11')
    this.formData.data.constructionPhase = this.getMultiple('constructionPhase')?[]:''
    await this.getProductionTask();
    this.queryDropBox();
    window.addEventListener("resize",this.windowReSize);
  }

  // mounted(){
  //   // this.cardGroups.addEventListener("scroll",this.setTitleStyle);
  // }

  setTitleStyle(){
    const titles = document.querySelectorAll(".cardGroupTitle");
    for (let index = 0; index < titles.length; index++) {
      const element = titles[index] as HTMLDListElement;
      const top = element.getBoundingClientRect().top
      if(top<=250){
        element.style.color = "#85adff"
      }else{
        element.style.color = "#85adff"
      }
    }
  }

  updated(){
    this.$nextTick().then(()=>{
      this.windowReSize();
      // this.setTitleStyle();
    });
  }
  beforeDestroy(){
    window.removeEventListener("resize",this.windowReSize);
    // this.cardGroups.removeEventListener("scroll",this.setTitleStyle);
  }
  /* 动态计算Table高度 */
  windowReSize(){
    const tableHeader = document.querySelector(".projectTable .ant-table-header") as HTMLDivElement;
    if(tableHeader)
    this.scroll.y=this.projectTable.offsetHeight-1-tableHeader.offsetHeight;
  }

  async treeSelect(item:{name:string,value:string},index:number,isReload:boolean=false){
    if(!isReload && item.value===this.selecteValue) return;
    this.selecteValue=item.value;
    this.selectedKey=index;
    localStorage.setItem("selectedKey",this.selectedKey+'');
    if(this.menuIndex===0){
      this.getProjectListV2();
    }else if(this.menuIndex==1){
      // await this.getRecentUse();
      this.getAllProject()
    }else{
      if (this.listStyleIndex===0) {
        this.getProjectTree();
      }else {
        await this.getFavorite();
      }
    }
  }
  mouseenterFn(item:{name:string,value:string},index:number){
    this.hoverKey=index;
  }
  mouseleaveFn(item:{name:string,value:string},index:number){
    this.hoverKey=null;
  }

  async getProjectListV1(){
    const {appCode,selecteValue:queryCode,projectName} = this;
    if(this.listStyleIndex===1){
      this.cardLoadSpinning=true;
    }else{
      this.loading=true;
    }
    this.cardDataSource=[];
    this.dataSource=[];
    try {
      const {errcode,errmsg,data} =await projectListV1({appCode,queryCode,engineeringName:projectName});
      if(errcode){
        return this.$message.error(`获取项目列表失败,${errmsg}`);
      }
      // for (const key in data) {
      //   if (Object.prototype.hasOwnProperty.call(data, key)) {
      //     const element = data[key];
      //     const children = element.map((item)=>{
      //       return {...item,key:item.id,title:item.engineeringName}
      //     })
      //     this.dataSource.push({
      //       id:key,
      //       key:key,
      //       title:key,
      //       children:children,
      //     })
      //   }
      // }
      this.cardDataSource=data??[];
      // this.handlerCardExpandState(this.cardDataSource as {[key:string]:any[]});
      const hits = data ?? [];
      hits.map((item) => {
        const children: Project[] = [];
        // @ts-ignore
        const r: Project[] = item.produceTasks.map(produceTask => {
          return {...produceTask, key: produceTask.id, isLink: true};
        });
        // @ts-ignore
        r.unshift({...item, key: item.id, title: item.engineeringName});
        children.push(...r);
        this.dataSource.push({
          id: item.id,
          key: item.id,
          title: item.engineeringName,
          children: children,
        })
      })
      this.expandedRowKeys = this.expandedAllRow(this.dataSource);
      console.log(this.dataSource,'1111111')
    } catch (error) {
      return this.$message.error(`获取项目列表失败,${error}`);
    }finally{
      this.listStyleIndex?this.cardLoadSpinning=false:this.loading=false;
    }
  }

  async getProjectListV2(){
    const {appCode,selecteValue:queryCode,projectName} = this;
    if(this.listStyleIndex===1){
      this.cardLoadSpinning=true;
    }else{
      this.loading=true;
    }
    this.cardDataSource=[];
    this.dataSource=[];
    // this.cardDataSource = exampleData.response.data.projectInfo.hits;
    // this.projectTotal = exampleData.response.data.projectInfo.totalHits
    try {
      const {errcode,errmsg,data} =await projectListV2({
        appCode: this.appCode,
        year: this.selectedYears,
        location: this.selectedProvinces,
        industryType: this.selectedIndustryTypes,
        departments: this.selectedDepartments,
        states: this.selectedStates,
        lotus: this.selectedDataSource==='lotus'?true:this.selectedDataSource==='系统内'?false:null,
        engineeringName:projectName,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        condition: this.checkedAll
      });
      if(errcode){
        return this.$message.error(`获取项目列表失败,${errmsg}`);
      }
      if(this.listStyleIndex===1) {
        this.cardDataSource = data?.hits??[];
        this.projectTotal = data?.totalHits??0;
        // this.cardDataSource=data??null;
        // this.handlerCardExpandState(this.cardDataSource as {[key:string]:any[]});
      }else {
        this.getProjectTree();
        const hits = data?.hits??[];
        this.projectTotal = data?.totalHits??0;
        hits.map((item)=> {
          const children:Project[] = [];
          // @ts-ignore
          const r:Project[] = item.produceTasks.map(produceTask=>{
            return {...produceTask,key:produceTask.id,isLink:true};
          });
          // @ts-ignore
          r.unshift({...item,key:item.id,title:item.engineeringName});
          children.push(...r);
          this.dataSource.push({
            id:item.id,
            key:item.id,
            title:item.engineeringName,
            children:children,
          })
        })
        // for (const key in data) {
        //   if (Object.prototype.hasOwnProperty.call(data, key)) {
        //     const element = data[key];
        //     const children:any[] = [];
        //     element.forEach(item=>{
        //       const r:{[key:string]:any}[] = item.produceTasks.map(produceTask=>{
        //         return {...produceTask,key:produceTask.id,isLink:true};
        //       });
        //       r.unshift({...item,key:item.id,title:item.engineeringName});
        //       children.push(...r);
        //     })
        // this.dataSource.push({
        //   id:key,
        //   key:key,
        //   title:key,
        //   children:children,
        // })
        //   }
        // }
        this.expandedRowKeys = this.expandedAllRow(this.dataSource);
      }
      // console.timeEnd('timer')
    } catch (error) {
      return this.$message.error(`获取项目列表失败,${error}`);
    }finally{
      this.listStyleIndex?this.cardLoadSpinning=false:this.loading=false;
    }
  }

  expandedAllRow(data: any[]): string[] {
    const keys: string[] = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      keys.push(element.id);
      if (element.children) {
        keys.push(...this.expandedAllRow(element.children));
      }
    }
    return keys;
  }

  async getFavorite(onlyQueryCount:boolean=false){
    const {appCode,selecteValue:queryCode,projectName:engineeringName}=this;
    if(!onlyQueryCount){
      if(this.listStyleIndex===1){
        this.cardLoadSpinning=true;
      }else{
        this.loading=true;
      }
      this.cardDataSource=[];
      this.dataSource=[];
    }
    try {
      const {errcode,errmsg,data}= await queryFavorite({appCode,queryCode,engineeringName});
      if(errcode!==0){
        this.$message.error(`获取我的收藏失败,${errmsg}`)
        return;
      }
      const hits = data ?? [];
      this.favoritesCount = data?.length??0;
      hits.map((item) => {
        const children: Project[] = [];
        // @ts-ignore
        const r: Project[] = item.produceTasks.map(produceTask => {
          return {...produceTask, key: produceTask.id, isLink: true};
        });
        // @ts-ignore
        r.unshift({...item, key: item.id, title: item.engineeringName});
        children.push(...r);
        this.dataSource.push({
          id: item.id,
          key: item.id,
          title: item.engineeringName,
          children: children,
        })
      })
      if(!onlyQueryCount) {
        this.cardDataSource = data??[];
        this.favoritesCount = data?.length??0;
        this.expandedRowKeys = this.expandedAllRow(this.dataSource);
      }
      // let count = 0;
      // for (const key in data) {
      //   if (Object.prototype.hasOwnProperty.call(data, key)) {
      //     const element = data[key];
      //     count += element.length;
      //     if(onlyQueryCount)continue;
      //     const children:any[] = [];
      //     element.forEach(item=>{
      //       const r:{[key:string]:any}[] = item.produceTasks.map(produceTask=>{
      //         return {...produceTask,key:produceTask.id,isLink:true};
      //       });
      //       r.unshift({...item,key:item.id,title:item.engineeringName});
      //       children.push(...r);
      //     })
      //     this.dataSource.push({
      //       id:key,
      //       key:key,
      //       title:key,
      //       children:children,
      //     })
      // }
      // if(!onlyQueryCount)
      //   this.cardDataSource=data??[];
      //   // this.handlerCardExpandState(this.cardDataSource as {[key:string]:any[]});
      //   this.expandedRowKeys = this.expandedAllRow(this.dataSource);
      // }
      // this.favoritesCount=count;
    } catch (error) {
      this.$message.error(`获取我的收藏异常,${error}`);
    }finally{
      if(!onlyQueryCount){
        this.listStyleIndex?this.cardLoadSpinning=false:this.loading=false;
      }
    }
  }

  async getRecentUse(){
    const {appCode,selecteValue:queryCode,projectName:engineeringName}=this;
    if(this.listStyleIndex===1){
      this.cardLoadSpinning=true;
    }else{
      this.loading=true;
    }
    this.cardDataSource=[];
    this.dataSource=[];
    try {
      const {errcode,errmsg,data}= await queryRecentUse({appCode,queryCode,engineeringName});
      if(errcode!==0){
        this.$message.error(`获取最近使用失败,${errmsg}`)
        return;
      }
      // for (const key in data) {
      //   if (Object.prototype.hasOwnProperty.call(data, key)) {
      //     const element = data[key];
      //     const children:any[] = [];
      //     element.forEach(item=>{
      //       const r:{[key:string]:any}[] = item.produceTasks.map(produceTask=>{
      //         return {...produceTask,key:produceTask.id,isLink:true};
      //       });
      //       r.unshift({...item,key:item.id,title:item.engineeringName});
      //       children.push(...r);
      //     })
      //     this.dataSource.push({
      //       id:key,
      //       key:key,
      //       title:key,
      //       children:children,
      //     })
      //   }
      // }
      this.cardDataSource=data??[];
      // this.handlerCardExpandState(this.cardDataSource as {[key:string]:any[]});
      const hits = data ?? [];
      hits.map((item) => {
        const children: Project[] = [];
        // @ts-ignore
        const r: Project[] = item.produceTasks.map(produceTask => {
          return {...produceTask, key: produceTask.id, isLink: true};
        });
        // @ts-ignore
        r.unshift({...item, key: item.id, title: item.engineeringName});
        children.push(...r);
        this.dataSource.push({
          id: item.id,
          key: item.id,
          title: item.engineeringName,
          children: children,
        })
      })
      this.expandedRowKeys = this.expandedAllRow(this.dataSource);
    } catch (error) {
      this.$message.error(`获取最近使用异常,${error}`)
    }finally{
      this.listStyleIndex?this.cardLoadSpinning=false:this.loading=false;
    }
  }

  getProgressPercent(percent:number|string){
    const value:number=typeof percent==="string"?+percent:percent;
    return +((value*100).toFixed(1));
  }

  //跳转
  async projectCardClick(record:Project,id:string){
    await this.setRecentUse(id);
    // this.$store.commit("setMenuFlag", false);
    this.$router.push({
      name:"ProductionTaskList",
      query:{
        projectId:record.id,
      }
    })
  }
  toNotes(url:string) {
    window.open(url)
  }

  async setRecentUse(id:string){
    try {
      const {errcode,errmsg} = await recentUse({appCode:this.appCode,id});
      if(errcode!==0){
        this.$message.error(`添加最近收藏失败,${errmsg}`);
        return;
      }
    } catch (error) {
      this.$message.error(`添加最近收藏异常,${error}`);
    }
  }
  //收藏
  async favorites(record:Project){
    const prefix=record.favorite?"取消":"添加";
    try {
      const {errcode,errmsg} = await favorite({appCode:this.appCode,add:!record.favorite,id:record.id});
      if(errcode!==0){
        this.$message.error(`${prefix}收藏失败,${errmsg}`);
        return;
      }
      record.favorite=!record.favorite;
      this.getFavorite(this.menuIndex!==2);
    } catch (error) {
      this.$message.error(`${prefix}收藏异常,${error}`);
    }
  }

  //跳转
  customRow(record:Project){
    return{
      on:{
        click:async ()=>{
          if(record["children"])return;
          if(!record["isLink"]) return;
          await this.setRecentUse(record['glid']);
          //@ts-ignore
          if (record.notesURL) {
            //@ts-ignore
            this.toNotes(record.notesURL)
          }else {
            this.$router.push({
              name:"ProductionTaskList",
              query:{
                projectId:record.id,
              }
            })
          }
        }
      }
    }
  }

  async searchProjectName(){
    localStorage.setItem("projectName",this.projectName);
    if(this.menuIndex===0){
      this.pageNum = 1;
      this.getProjectListV2();
    }else if(this.menuIndex==1){
      // await this.getRecentUse();
      this.getAllProject()
    }else{
      await this.getFavorite();
    }
  }

  getColor(record:{children?:[]}){
    if(!record.children){
      return "fontColorLast"
    }
  }
  rowClassName(record,index:number){
    return record.hasOwnProperty('currentHandler') && index%2?"table-row-odd":"table-row-even";
  }

  customExpandIcon(props:any){
    const { expanded, onExpand, record,expandable } = props;
    const h = this.$createElement;
    if(expanded){
      return h("span",{},[
        h("a-icon",{
          staticStyle:{
            paddingRight:"10px",
            fontSize:"20px",
            verticalAlign: "middle",
          },
          attrs:{
            type:expanded?"caret-down":"caret-right",
          },
          on:{
            click:(event:Event)=>{
              onExpand(record,event);
            }
          }
        })
      ]);
    }else{
      return h("span",{
         staticStyle:{
            paddingRight:"10px",
          },
        },
      );
    }
  }

  /* 增加新建生产任务单 */
  async addProject(){
    this.modal.title="新增生产任务单"
    this.modal.visible = true;
  }

  /* 获取生产任务单(初始表单数据) */
  async getProductionTask(){
    try {
      const { errcode,errmsg,data } = await loadSheetData<any>({startWorkflowCode:"XTSJ_xmlb"});
      if(errcode){
        return this.$message.error(`获取生产任务单失败,${errmsg}`);
      }
      this.updateSheetConfig(true,data as SheetData<any>);
    } catch (error) {
      // debugger
      // return this.$message.error(`获取生产任务单异常,${error}`)
    }
  }

  /* 更新SheetConfig */
  updateSheetConfig(isCreate:boolean,data:SheetData<{[key:string]:any}>){
    for (const key in data?.formPermission.dataPermissions) {
      if (Object.prototype.hasOwnProperty.call(data?.formPermission.dataPermissions, key)) {
        const element = data?.formPermission.dataPermissions[key];
        if(!element||!this.formData.sheetConfig[key])continue;
        this.formData.sheetConfig[key] = {
          ...this.formData.sheetConfig[key],
          visible:element.v,
          readonly:!element.e,
          required:element.r||this.checkRequired(this.formData.sheetConfig[key].requiredFormula)||this.formData.sheetConfig[key].required,
        }
        if(isCreate){
          if(this.formData.sheetConfig[key].defaultValue){
            let value = this.formData.sheetConfig[key].defaultValue;
            if(typeof value ==="string"){
              if(this.formData.sheetConfig[key].type === 50){
                value = JSON.parse(value);
              }
              if(this.formData.sheetConfig[key].type === 3){
                if(value==="none"){
                  value = undefined;
                }else if(value === "current"){
                  value = moment().format(this.formData.sheetConfig[key].format);
                }
              }
            }
            this.formData.data[key] = value;
          }
          if(this.formData.sheetConfig[key].defaultValueType){
            if(this.formData.sheetConfig[key].defaultValueType === "originator"){
              this.formData.data[key] =[
                  {id:this.userInfo.id,name:this.userInfo.name,type:this.userInfo.unitType}
              ];
            }else if(this.formData.sheetConfig[key].defaultValueType === 'originatorDept') {
              this.formData.data[key] = [
                {
                  id: this.userInfo.departmentId,name: this.userInfo.departmentName
                }
              ]
            }
          }
        }
      }
    }
  }
  /* 判断条件显示 */
  checkCondition(option:string):boolean{
    const isVisible = false;
    const factors = option.trim().split( " " );
    if(Array.isArray(factors) && factors.length > 1 ){
      const propertyName = factors[0].substring( 1, factors[0].length - 1 );
      const propertyVal = this.formData.data[propertyName];
      const operator = factors[1];
      let val: any = null;
      if ( factors.length > 2 ) {
        val = factors[2];
      }
      const type = ControlHelper.mapToDataItemType(FormControlType[FormControlType[this.formData.sheetConfig[propertyName].type]]);
      let op: any = null;
      switch(<DataItemType>type){
        case DataItemType.Number:
        case DataItemType.Date:
          op = numberDataItemOperators.find( ( item ) => {
            return item.label === operator;
          });
          if (op) {
            switch ( op.value ) {
              case DateItemOperatorType.IsNull:
                return propertyVal == null;
              case DateItemOperatorType.IsNotNull:
                return propertyVal != null;
              case DateItemOperatorType.Equal:
                return propertyVal == val;
              case DateItemOperatorType.NotEqual:
                return propertyVal != val;
              case DateItemOperatorType.GreaterThan:
                return propertyVal > val;
              case DateItemOperatorType.GreaterThanOrEqual:
                return propertyVal >= val;
              case DateItemOperatorType.LessThan:
                return propertyVal < val;
              case DateItemOperatorType.LessThanOrEqual:
                return propertyVal <= val;
              default:
                return false;
            }
          } else {
            return false;
          }
        case DataItemType.Logic:
          op = logicDataItemOperators.find( ( item ) => {
            return item.label === operator;
          } );
          if ( op ) {
            switch ( op.value ) {
              case DateItemOperatorType.Equal:
                return propertyVal == val;
              default:
                return false;
            }
          } else {
            return false;
          }
        case DataItemType.ShortText:
        case DataItemType.LongText:
          if ( this.formData.sheetConfig[propertyName].type === FormControlType.SequenceStatus ) {
            op = sequenceStatusOperators.find( ( item ) => {
              return item.label === operator;
            } );
            if ( op ) {
              switch ( op.value ) {
                case DateItemOperatorType.IsNull:
                  return propertyVal == null;
                case DateItemOperatorType.IsNotNull:
                  return propertyName != null;
                case DateItemOperatorType.Equal:
                  return propertyVal == val;
                case DateItemOperatorType.NotEqual:
                  return propertyVal != val;
                default:
                  return false;
              }
            } else {
              return false;
            }
          } else {
            op = textDataItemOperators.find( ( item ) => {
              return item.label === operator;
            } );
            if ( op ) {
              switch ( op.value ) {
                case DateItemOperatorType.IsNull:
                  return propertyVal == null;
                case DateItemOperatorType.IsNotNull:
                  return propertyName != null;
                case DateItemOperatorType.Equal:
                  return propertyVal == val.substring( 1, val.length - 1 );
                case DateItemOperatorType.NotEqual:
                  return propertyVal != val.substring( 1, val.length - 1 );
                case DateItemOperatorType.Contains:
                  return propertyVal.indexOf( val ) > -1;
                case DateItemOperatorType.NotEqual:
                  return propertyVal.indexOf( val ) === -1;
                case DateItemOperatorType.In:
                  return val.indexOf( propertyVal ) > -1;
                case DateItemOperatorType.NotIn:
                  return val.indexOf( propertyVal ) === -1;
                default:
                  return false;
              }
            } else {
              return false;
            }
          }
        case DataItemType.StaffSelector:
          op = staffDataItemOperators.find( ( item ) => {
            return item.label === operator;
          } );
          const valJSONObj = val ? JSON.parse( val ) : null;
          if ( op ) {
            switch ( op.value ) {
              case DateItemOperatorType.IsNull:
                return propertyVal == null;
              case DateItemOperatorType.IsNotNull:
                return propertyVal != null;
              case DateItemOperatorType.Contains:
              case DateItemOperatorType.Have:
                return propertyVal.every( ( item ) => {
                  return (
                    valJSONObj.findIndex( ( x ) => {
                      return x.parentId === item.id || x.id === item.id;
                    } ) > -1
                  );
                } );
              case DateItemOperatorType.NotContains:
              case DateItemOperatorType.NotHave:
                return propertyVal.every( ( item ) => {
                  return (
                    valJSONObj.findIndex( ( x ) => {
                      return x.parentId === item.id || x.id === item.id;
                    } ) === -1
                  );
                } );

              case DateItemOperatorType.Of:
              case DateItemOperatorType.In:
                return propertyVal.every( ( item ) => {
                  return (
                    valJSONObj.findIndex( ( x ) => {
                      return x.id === item.parentId || x.id === item.id;
                    } ) > -1
                  );
                } );
              case DateItemOperatorType.NotOf:
              case DateItemOperatorType.NotIn:
                return propertyVal.every( ( item ) => {
                  return (
                    valJSONObj.findIndex( ( x ) => {
                      return x.id === item.parentId || x.id === item.id;
                    } ) === -1
                  );
                } );
              default:
                return false;
            }
          } else {
            return false;
          }
        case DataItemType.RelevanceForm:
            // todo
            return true;
      }
    }
    return isVisible;
  }
  /* 检查是否必须 */
  checkRequired(requiredFormula:string):boolean{
    if(!requiredFormula)return false;
    if(requiredFormula.trim()==="true") return true;
    if ( requiredFormula.indexOf( "&&" ) > -1 ) {
      // 多个And条件解析
      const andArr: any[] = requiredFormula.split( "&&" );
      return andArr.every( ( item ) => {
        return this.checkCondition(item);
      } );
    } else if ( requiredFormula.indexOf( "||" ) > -1 ) {
      // 多个Or条件解析
      const orArr: any[] = requiredFormula.split( "||" );
      return orArr.some( ( item ) => {
        return this.checkCondition(item);
      } );
    } else {
      // 只有一个条件解析
      return this.checkCondition(requiredFormula);
    }
  }
  getMultiple(key:string){
    return this.formData.sheetConfig[key].multi;
  }
  getBizObjectData(id:string):BizObject{
    const { formData:{data:formData} } = this;
    return{
      id:id,
      data:{
        glid: formData.glid.id??'',
        engineeringType: formData.engineeringType??'',
        sequenceNo: formData.sequenceNo??'',
        constructionPhase: this.getMultiple('constructionPhase')?formData.constructionPhase.join(';'):formData.constructionPhase??'',
        engineering_name:formData.engineering_name??null,
        engineering_location:formData.engineering_location??null,
        industryType:formData.industryType??null,
        projectType:formData.projectType??null,
        engineering_stage:formData.engineering_stage??null,
        modelType: formData.modelType??'',
        engineering_number:formData.engineering_number??null,
        manufacturer_admin:formData.manufacturer_admin??null,
        manufacturer_depart_manager:formData.manufacturer_depart_manager??null,
        manufacturer:formData.manufacturer??null,
        manufacturer_manager:formData.manufacturer_manager??null,
        collaboration:formData.collaboration??null,
        collaboration_manager:formData.collaboration_manager??null,
        company_manager:formData.company_manager??null,
        archivist:formData.archivist??null,
        actual_contract_money:formData.actual_contract_money??null,
        evaluation_contract_money:formData.evaluation_contract_money??null,
        evaluation_contract_remark:formData.evaluation_contract_remark??null,
        company_chief_engineer:formData.company_chief_engineer??null,
        project_level:formData.project_level??null,
        company_review_flag:formData.company_review_flag??null,
        manufacturer_chief_engineer:formData.manufacturer_chief_engineer??null,
        project_manager:formData.project_manager??null,
        manufacturer_vice_manager:formData.manufacturer_vice_manager??null,
        manufacturer_vice_engineer:formData.manufacturer_vice_engineer??null,
        year:formData.year??null,
        quarter:formData.quarter??null,
        task_priority:formData.task_priority??null,
        risk_level:formData.risk_level??null,
        plan_start_time:(!formData.plan_start_time || formData.plan_start_time === 'none' )?null:formData.plan_start_time,
        plan_end_time:(!formData.plan_end_time || formData.plan_end_time === 'none' )?null:formData.plan_end_time,
        plan_duration:formData.plan_duration?formData.plan_duration+'':null,
        actual_end_time:(!formData.actual_end_time || formData.actual_end_time === 'none' )?null:formData.actual_end_time,
        warning_date1:(!formData.warning_date1 || formData.warning_date1 === 'none' )?null:formData.warning_date1,
        warning_date2:(!formData.warning_date2 || formData.warning_date2 === 'none' )?null:formData.warning_date2,
        work_content:formData.work_content??null,
        schedule:formData.schedule??null,
        scattered_contract_flag:formData.scattered_contract_flag??null,
        manufacture_status:formData.manufacture_status??null,
        task_type:formData.task_type??null,
        remark:formData.remark??null,
        remaining_problem:formData.remaining_problem??null,
        departHeaders:formData.departHeaders??null,
        picture:formData.picture??null,
        workday_duration:formData.workday_duration?formData.workday_duration+'':null,
        current_person:null,
        project_ratio:null,
        id:formData.id??id,
      },
      schemaCode:"XTSJ_xmlb",
      sheetCode:"XTSJ_xmlb",
      workflowInstanceId:formData.workflowInstanceId??null,
    }
  }

  showDialog(title:string,callBack:()=>any){
    Modal.confirm({
      title: title,
      okText:"确定",
      cancelText:"取消",
      centered:true,
      onOk:callBack,
    })
  }

  async saveData(){
    const {userInfo:{departmentId}} = this;
    //@ts-ignore
    // const productionForm =  this.$refs.dataForm.productionForm;
    // let validde = false
    // productionForm.validate(valid=>{
    //   validde = valid
    // });
    // if(!validde){
    //   return;
    // }
    try {
      const token = await replayToken();
      if(!token) return this.$message.error("获取replayToken失败");
      const id =await UUID();
      if(!id) return this.$message.error("获取UUID失败");
      //暂存
      const {errcode,errmsg,data}  = await save({
        workItemId:null,
        workflowInstanceId:null,
        bizObject:this.getBizObjectData(id),
        departmentId:departmentId,
        replayToken:token,
        workflowCode:"XTSJ_xmlb"
      });
      if(errcode){
        return this.$message.error(`暂存生成任务单失败,${errmsg}`);
      }
      this.$message.success("暂存生成任务单成功");
      this.getProjectListV2();
      this.modal.visible=false;
    } catch (error) {
      return this.$message.error(`暂存生成任务单异常,${error}`);
    }
  }

  async submitData(){
    let departmentId = '';
    if(this.userInfo){
      departmentId = this.userInfo.departmentId;
    }else {
      this.userInfo=JSON.parse(sessionStorage.getItem("user") as string);
      departmentId = this.userInfo.departmentId;
    }
    //@ts-ignore
    const productionForm =  this.$refs.dataForm.productionForm;
    let validde = false;
    let errorFields:{[key:string]:{message:string,field:string}[]}={};
    productionForm.validate((valid,fields)=>{
      errorFields = fields as {[key:string]:{message:string,field:string}[]};
      validde = valid
    });
    if(!validde){
      for (const key in errorFields) {
        if (Object.prototype.hasOwnProperty.call(errorFields, key)) {
          const element = errorFields[key];
          this.$message.error(`${element[0].message}`);
          break;
        }
      }
      return;
    }
    try {
      const token = await replayToken();
      if(!token) return this.$message.error("获取replayToken失败");
      const id =await UUID();
      if(!id) return this.$message.error("获取UUID失败");
      //提交
      const {errcode,errmsg,data} = await submit({
        workItemId:null,
        workflowInstanceId:null,
        bizObject:this.getBizObjectData(id),
        departmentId:departmentId,
        replayToken:token,
        workflowCode:"XTSJ_xmlb"
      });
      if(errcode){
        return this.$message.error(`提交生成任务单失败,${errmsg}`);
      }
      this.$message.success("提交生成任务单成功");
      this.getProjectListV2();
      this.modal.visible=false;
      if(this.$route.name==='ETaskList') {
        this.$router.push({
          name: 'ProjectList'
        })
      }
    } catch (error) {
      return this.$message.error(`提交生成任务单异常,${error}`);
    }
  }
  closeWindow() {
    window.opener = null;
    window.open('', '_self', '');
    window.close();
  }

  setIcon({expanded,isLeaf}){
    const h = this.$createElement;
    if(isLeaf){
      return h("span",{},[
        h("a-icon",{
          staticStyle:{
            paddingRight: ".5208vw",
            fontSize: ".8333vw",
            // verticalAlign: "middle",
            color:"#ffca28"
          },
          attrs:{
            type: 'folder',
            theme:"filled",
          }
        })
      ]);
    }else{
      return h("span",{},[
        h("a-icon",{
          staticStyle:{
            paddingRight: ".5208vw",
            fontSize: ".8333vw",
            // verticalAlign: "middle",
            color:"#ffca28"
          },
          attrs:{
            type: expanded ? 'folder-open':'folder',
            theme:"filled",
          }
        })
      ]);
    }
  }
  //card-expand
  cardExpandState: {[key:string]:boolean} = {}
  handlerCardExpandState(data:{[key:string]:any[]}) {
    for (const dataKey in data) {
      this.$set(this.cardExpandState,dataKey,true)
    }
  }
  changeCardExpandState(key:string,expandState:boolean) {
    this.cardExpandState[key] = expandState;
  }

  setProduceTask(index){
    if(index%3===0){
      return "setProduceTask1"
    }
    if(index%3===1){
      return "setProduceTask2"
    }
    if(index%3===2){
      return "setProduceTask"
    }
  }
  stateImg(val){
    let img = '';
    switch (val) {
      case '项目运行':
        img='runPic'
        break;
      case '项目终止':
        img='terminatedPic'
        break;
      case '项目完成':
        img='archivePic'
        break;
    }
    return img
  }
  //TODO 项目查询条件
  pageNum: number = 1;
  pageSize: number = 12;
  projectTotal: number = 0;
  years:string[] = [];
  selectedYears: string[] = [];
  provinces:string[] = [];
  selectedProvinces: string[] = [];
  industryTypes:string[] = [];
  selectedIndustryTypes: string[] = [];
  departments: string[] = [];
  selectedDepartments: string[] = [];
  states: string[] = [];
  selectedStates: string[] = [];
  selectedDataSource: string = '';
  getListByType(type:string,value:any[]|string) {
    switch (type) {
      case 'year':
        this.selectedYears = value as string[];
        break;
      case 'province':
        this.selectedProvinces = value as string[];
        break;
      case 'industryType':
        this.selectedIndustryTypes =value as string[];
        break;
      case 'departments':
        this.selectedDepartments = value as string[];
        break;
      case 'states':
        this.selectedStates = value as string[];
        break;
      case 'dataSource':
        this.selectedDataSource = value as string;
    }
  };
  checkedAll: boolean = false;
  get isEveryCheck() {
    let num = 0;
    if (this.selectedYears.length) {num++}
    if (this.selectedProvinces.length) {num++}
    if (this.selectedIndustryTypes.length) {num++}
    if (this.selectedDepartments.length) {num++}
    if (this.selectedStates.length) {num++}
    if (this.selectedDataSource.length) {num++}
    return num
  }
  changeCheckState(e: any) {
    this.checkedAll = e.target.checked;
    this.selectedYears = [];
    this.selectedProvinces = [];
    this.selectedIndustryTypes = [];
    this.selectedDepartments = [];
    this.selectedStates = [];
    this.selectedDataSource = ''
    this.queryDropBox();
  }
  resetCondition(flag?:boolean) {
    this.showMoreCondition = false;
    this.checkedAll = false;
    this.selectedYears = [];
    this.selectedProvinces = [];
    this.selectedIndustryTypes = [];
    this.selectedDepartments = [];
    this.selectedStates = [];
    this.selectedDataSource = '';
    this.projectName = '';
    this.pageNum = 1;
    this.pageSize = 12;
    if(flag) {
      this.getProjectListV2();
    }
  }
  queryDropBox() {
    queryDropBox({
      appCode: this.appCode,
      condition: this.checkedAll
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.years = res.data?.year??[];
      this.provinces = res.data?.location??[];
      this.industryTypes = res.data?.industryType??[];
      this.departments = res.data?.departments??[];
      this.states = res.data?.states??[];
    })
  }
  paginationChange(page: number, pageSize: number) {
    this.pageNum = page;
    this.pageSize = pageSize;
    this.getProjectListV2();
  }
  getProjectList() {
    this.showMoreCondition = false;
    this.pageNum = 1;
    this.getProjectListV2()
  }
  showMoreCondition: boolean = false;
  //TODO START 新增生产任务单权限
  isCreateProductPermission: boolean = false
  //获取
  listSkipQueryList() {
    listApi.listSkipQueryList({
      "queryCode": "XTSJ_role_permission",
      "schemaCode": "XTSJ_role_permission",
      "mobile": false,
      "page": 0,
      "size": 999,
      "filters": [
        {
          "op": "Eq",
          "propertyCode": "tableCode",
          "propertyType": 0,
          "propertyValue": 'XTSJ_xmlb'
        }
      ]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      if(Array.isArray(res.data.content) && res.data.content.length) {
        this.isCreateProductPermission = res.data.content.some((r)=> {
          return r.data.person.some((o)=> {
            return o.id === this.userInfo.id
          })
        })
      }
    })
  }
  //TODO END
  destroyed() {
    sessionStorage.setItem('condition',JSON.stringify({
      selectedYears: this.selectedYears,
      selectedProvinces: this.selectedProvinces,
      selectedIndustryTypes: this.selectedIndustryTypes,
      selectedDepartments: this.selectedDepartments,
      selectedStates: this.selectedStates,
      selectedDataSource: this.selectedDataSource,
      projectName: this.projectName,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      checkedAll: this.checkedAll
    }))
  }
}
