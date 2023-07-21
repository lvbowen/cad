import { Component, Vue,InjectReactive,Prop,Ref,Watch,Mixins } from 'vue-property-decorator';
import {CommonMixins} from "../../commonMixins"
import {Collapse,Icon,Button,FormModel,Upload,Input,InputNumber,Checkbox,Radio,Select,Modal,Slider,DatePicker,Table,Tooltip,Tabs,} from "@h3/antd-vue";
import { ValidationRule } from '@h3/antd-vue/types/form-model/form';
import moment,{Moment} from 'moment';
import {numberToChinese} from "./numberToChinese";
import AchievementUpload from "./components/AchievementUpload.vue";
import {designTask,createDesignTask,BizObject,designAchievementCount,achievementSubmit,AchievementbizObject,achievementSave,
  designAchievement,getAnnotationFilter,getAnnotationList,getDesignTaskAchievementCode
} from "../../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignTask";
import {UUID,replayToken,submit,save,agree,reject,loadSheetData,sheetConfig, SheetConfig, SheetData} from "../../../../../service/CoordinateDesign/common";
import {HttpResponse} from "@cloudpivot/api/src/response";
import {workflowInstanceFlag} from "../../../../../service/CoordinateDesign/WorkingOutline/ProductionTaskList";
import {getCommonReplys} from "../../../../../service/api";
import { listApi } from "@cloudpivot/api";
import Utils from "../../../../../utils";
import StandardTemplate from '../components/StandardTemplate.vue';
import { createDesignSpecificationSubTask } from "../../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignTask";
import {achievementFormatConfig} from "../../../publicConfig";
import {
  getDesignAnnotations,
  getNewDesignAchievements
} from "../../../../../service/CoordinateDesign/WorkingOutline/DesignAchievement";
import {isArray} from "xe-utils";
import {AchievementFile} from "../../../../../type";
type Pagination={current:number,pageSize:number,showQuickJumper:true,total:number,
  showTotal:(total:number, range)=>string,onChange:(page:number, pageSize:number)=>void};
type Columns={dataIndex?:string,align?:'left'|'right'|'center',title?:string,width?:string|number,scopedSlots?:{customRender?:string,filterDropdown?:string},customRender?:(text:string, record, index:number)=>string|object|void,
  slots?:{filterIcon?:string,title?:string}}[];
type TableConfiguration={loading:boolean,columns:Columns,pagination:Pagination};
type ModalConfiguration={visible:boolean,actionCode:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',showComment:boolean,title?:string,okText?:string,cancelText?:string,confirmLoading?:boolean,OK?:()=>void,rejectFun?:(type:'驳回'|'同意')=>void,afterClose?:()=>void};
type selectorOption = { id:string,name:string,type:number };
interface Data{
  id:string|null|undefined,
  workItemId:string|null|undefined,
  workflowTokenId:string|null|undefined,
  workflowInstanceId:string|undefined|null,
  zyrwd_id:any|null|undefined,
  rejectToActivityCode:string|null|undefined,


  achievementSubmitButton?:boolean,
  achievementRetainButton?:boolean,
  submitButton?:boolean,
  retainButton?:boolean,
  receiveButton?:boolean,
  agreeButton?:boolean,
  rejectButton?:boolean,
  defineSubmitButton?:boolean;
  defineCompanyChief?:boolean;
  activityCode?:string,
  activityName?:string,
  xmlb_id?:any
}
type LoadData = {
  auditor:selectorOption[]|undefined|null,
  checker:selectorOption[]|undefined|null,
  chief_engineer:selectorOption[]|undefined|null,
  collaborate_flag:string|undefined|null,
  company_chief:selectorOption[]|undefined|null,
  company_chief_engineer:selectorOption[]|undefined|null,
  company_manager:selectorOption[]|undefined|null,
  countersign_flag:string|undefined|null,
  add_signer_flag: string;
  countersigned:selectorOption[],
  currentStatus:string|undefined|null,
  department_chief:selectorOption[]|undefined|null,
  design_guider:selectorOption[]|undefined|null,
  design_guider_flag:string|undefined|null,
  designer:selectorOption[]|undefined|null,
  add_signer: selectorOption[],
  engineering_location:string|undefined|null,
  engineering_name: string|undefined|null,
  engineering_number:string|undefined|null,
  engineering_stage: string|undefined|null,
  industryType: string|undefined|null,
  manufacturer:selectorOption[]|undefined|null,
  manufacturer_chief_engineer:selectorOption[]|undefined|null,
  manufacturer_vice_engineer:selectorOption[]|undefined|null,
  manufacturer_vice_manager:selectorOption[]|undefined|null,
  partners:selectorOption[]|undefined|null,
  plan_duration:string|undefined|number|null,
  plan_end_time:string|undefined|null,
  plan_start_time:string|undefined|null,
  profession:selectorOption[]|undefined|null,
  profession_name:string|undefined|null,
  profession_task_name:string|undefined|null,
  projectType:string|undefined|null,
  project_level:string|undefined|null,
  project_manager:selectorOption[]|undefined|null,
  project_manager_audit:string|undefined|null,
  proofread_flag:string|undefined|null,
  proofread_level:string|undefined|null,
  sign_subject:any,
  signed_person:selectorOption[]|undefined|null,
  signer:selectorOption[]|undefined|null,
  task_ratio:string|undefined|null,
  task_time:string|undefined|null,
  task_type:string|undefined|null,
  unsigned_person:selectorOption[]|undefined|null,
  use_software_name:string|undefined|null,
  work_content:string|undefined|null,
  zyrwd_id: any,
  XTSJ_design_para: any[],
  modelType: string;
  engineeringType: string;
  achievement_number: string;
  task_number: string;
} & Data;
@Component({
  name:"ProfessionalDesignTask",
  components:{
    [Collapse.name]:Collapse,
    [Collapse.Panel.name]:Collapse.Panel,
    [Icon.name]:Icon,
    [Button.name]:Button,
    [FormModel.name]:FormModel,
    [FormModel.Item.name]:FormModel.Item,
    [Upload.name]:Upload,
    [Upload.Dragger.name]:Upload.Dragger,
    [Input.name]:Input,
    [InputNumber.name]:InputNumber,
    [Checkbox.name]:Checkbox,
    [Radio.name]:Radio,
    [Radio.Group.name]:Radio.Group,
    [Select.name]:Select,
    [Select.Option.name]:Select.Option,
    [Modal.name]: Modal,
    [Slider.name]:Slider,
    [DatePicker.name]:DatePicker,
    [Input.TextArea.name]:Input.TextArea,
    [Input.Search .name]:Input.Search,
    [Table.name]:Table,
    [Tooltip.name]:Tooltip,
    [Tabs.name]:Tabs,
    [Tabs.TabPane.name]:Tabs.TabPane,
    AchievementUpload,
    StandardTemplate
  },
})
export default class ProfessionalDesignTask extends Mixins(CommonMixins)   {
  @InjectReactive("project") appCode!: string;
  @Prop({required:true}) projectId!:string;
  @Prop({required:true}) sjrwdId!:string;
  @Prop({required:false,default:false}) isCreate!:boolean;
  @Ref("productionForm") productionForm!: FormModel;
  @Ref("dialogForm") dialogForm!:FormModel;
  @Prop({required:false,type:Boolean,default:false}) isBack!:boolean;

  leftButtonLinks={
    activeIndex:0,
    buttonLinks:[
      {name:"任务详情"},
      {name:"流程记录"},
    ]
  }

  leftButtonClick(index:number){
    this.leftButtonLinks.activeIndex=index;
  }

  rightButtonLinks=[
    {name:"提交",type:"primary",visibleKey:"submitButton",showComment:false},
    {name:"暂存",type:"primary",visibleKey:"retainButton",showComment:false},
    {name:"接收",type:"primary",visibleKey:"receiveButton",showComment:false},
    {name:"同意",type:"primary",visibleKey:"agreeButton",showComment:true},
    {name:"驳回",type:"primary",visibleKey:"rejectButton",showComment:true},
    {name:"同意",type:"primary",visibleKey:"defineSubmitButton",showComment:false,actionCode: 'agreeButton'},
    {name:"不同意",type:"primary",visibleKey:"defineSubmitButton",showComment:true,actionCode: 'agreeButton'},
    {name:'院总工审核',type: 'primary',visibleKey: 'defineCompanyChief',showComment: true,actionCode: ''}
  ]

  collapse={
    defaultActiveKeyFirst:['5','6','7','8'],
    defaultActiveKeySecond:['1'],
    defaultActiveKeyThird:['1']
  }

  formData:{data:LoadData,
    rules:{[key:string]:(ValidationRule|{trigger:'blur' | 'change' | ['change', 'blur']})[]},
    sheetConfig:SheetConfig,
    optionsWatch:{[key:string]:()=>void},
    options:{[key:string]:{value:string,label:string,key:number,disabled:boolean}[]}}={
      data:{
        id:undefined,
        workItemId:undefined,
        workflowTokenId:undefined,
        workflowInstanceId:undefined,
        rejectToActivityCode:undefined,

        auditor:undefined,
        checker:undefined,
        chief_engineer:undefined,
        collaborate_flag:undefined,
        company_chief:undefined,
        company_chief_engineer:undefined,
        company_manager:undefined,
        countersign_flag:undefined,
        add_signer_flag: '',
        countersigned:[],
        currentStatus:undefined,
        department_chief:undefined,
        design_guider:undefined,
        design_guider_flag:undefined,
        designer:undefined,
        add_signer: [],
        engineering_location:undefined,
        engineering_name: undefined,
        engineering_number:undefined,
        engineering_stage: undefined,
        industryType: undefined,
        manufacturer:undefined,
        manufacturer_chief_engineer:undefined,
        manufacturer_vice_engineer:undefined,
        manufacturer_vice_manager:undefined,
        partners:undefined,
        plan_duration:undefined,
        plan_end_time:undefined,
        plan_start_time:undefined,
        profession:undefined,
        profession_name:undefined,
        profession_task_name:undefined,
        projectType:undefined,
        project_level:undefined,
        modelType:'',
        engineeringType: '',
        project_manager:undefined,
        project_manager_audit:undefined,
        proofread_flag:undefined,
        proofread_level:undefined,
        sign_subject:'',
        signed_person:undefined,
        signer:undefined,
        task_ratio:undefined,
        task_time:undefined,
        task_type:undefined,
        unsigned_person:undefined,
        use_software_name:undefined,
        work_content:undefined,
        xmlb_id: {},
        zyrwd_id:{},
        XTSJ_design_para: [],
        defineSubmitButton: false,
        defineCompanyChief: false,
        achievement_number: '',
        task_number: ''
      },
      rules:{},
      sheetConfig:{},
      optionsWatch:{},
      options:{},
  }
  commonReplys:any={};//常用回复语
  /*选中常用语*/
  tagChange(item){
    this.dialogTaskForm.formData.comment=item;
  }

  actionButtonClick(item:{visibleKey:string,name:string,showComment:boolean,actionCode?:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton'}){
    this.commonReplys=null;
    if(this.replyType.includes(item.name)){
      getCommonReplys({
        appCode:this.appCode??'',
        schemaCode:this.appCode+'_sjrwd',
        type:item.name
      })
        .then(res=>{
          if(res.errcode!==0) return this.$message.error(res.errmsg as string);
          if(!res.data) return;
          this.commonReplys=res.data;
        })
    }
    this.dialogModalConfiguration.visible=true,
    this.dialogModalConfiguration.actionCode=item.actionCode?item.actionCode:item.visibleKey as 'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',
    this.dialogModalConfiguration.okText=item.name;
    this.dialogModalConfiguration.showComment=item.showComment;
    this.dialogModalConfiguration.title=`确认${item.name}此设计任务单`
    if(item.visibleKey==="receiveButton"){
      this.dialogTaskForm.formData.comment="接收任务";
    }
    if (this.isCountersignedNode) {
      this.$set(this.dialogTaskForm.rules.comment[0],'message','理由说明')
    }
    if (this.isCompanyChief) {
      this.dialogModalConfiguration.okText = '同意';
      this.dialogModalConfiguration.cancelText = '驳回'
    }
  }
  /* 提交,暂存.接收,同意,驳回Form配置 */
  dialogTaskForm:{formData:{comment:string},rules:{[key:string]:(ValidationRule|{trigger:'blur' | 'change' | ['change', 'blur']})[]}} = {
    formData:{
      comment: ""
    },
    rules:{
      comment: [
        {required: true,message: `${this.isCountersignedNode?'理由说明':"请输入意见/建议"}`,trigger: ["change", "blur"],},
      ],
    }
  }

  /*  提交,暂存.接收,同意,驳回弹窗配置 */
  dialogModalConfiguration:ModalConfiguration={
    visible:false,
    okText:"",
    cancelText:'取消',
    confirmLoading:false,
    title:"",
    actionCode:'submitButton',
    showComment:false,
    OK:()=>{
      this.blockActions();
    },
    rejectFun: (type)=> {
      switch (type) {
        case '驳回':
          this.dialogModalConfiguration.okText = '驳回';
          this.dialogModalConfiguration.actionCode = 'rejectButton';
          this.blockActions();
          break;
        case '同意':
          this.dialogModalConfiguration.okText = '同意';
          this.dialogModalConfiguration.actionCode = 'agreeButton';
          this.blockActions();
          break;
      }

    },
    afterClose:()=>{
      this.dialogTaskForm.formData.comment="";
    }
  }
  blockActions() {
    this.collapse.defaultActiveKeyFirst=['2','3','4','5','6','7','8'];
    this.formKey++;
    const {actionCode,showComment} = this.dialogModalConfiguration;
    setTimeout(()=> {
      this.actions(actionCode,showComment);
    },50)
  }

  /* 模型检查标注Table配置 */
  marksConfiguration:TableConfiguration&{dataSource:any,searchKeyWord:string,dataSourceCopy:any}={
    loading:false,
    columns:[
      {title:"序号",align:"center",customRender:(text:string, record, index:number)=>{
        const {pageSize,current}=this.marksConfiguration.pagination as Pagination;
        return `${(current-1)*pageSize+index+1}`;
      }},
      {title:"成果标题",dataIndex:"designFileName",align:"center"},
      {title:"文件类型",dataIndex:"fileType",align:"center"},
      {title:"批注标题",dataIndex:"annotationName",align:"center"},
      {title:"批注描述",dataIndex:"annotationDesc",align:"center",width:300},
      {title:"流程节点",dataIndex:"workflowNode",align:"center"},
      {title:"检查人",dataIndex:"checkerName",align:"center"},
      {title:"检查日期",dataIndex:"checkDate",align:"center"},
      {title:"批注缩略图",align:"center",scopedSlots:{customRender:"thumbnail"}},
    ],
    pagination:{
      current:1,
      pageSize:5,
      showQuickJumper:true,
      total:0,
      showTotal:(total:number, range)=>`共${total}条`,
      onChange:(page:number, pageSize:number)=>this.markTablePaginationChange(page,pageSize),
    },
    dataSource:[],
    dataSourceCopy:[],
    searchKeyWord:"",
  }


  achievementFileList:any[]=[];
  achievementId="";

  achievementTabs:{activeKey:string,panes:{title:string,key:string,component:string,version:number}[]}={
    activeKey:"0",
    panes:[]
  }

  thumbnail:string='';
  versionId:string='';
  checkerId:string='';
  nodeId:string='';
  picShow:boolean = false;
  version:number =1;

  filterData:Array<any>=[];
  checkerData:Array<any>=[];
  nodeData:Array<any>=[];

  created(){
    this.formmatConfig = `${achievementFormatConfig},${achievementFormatConfig.toUpperCase()}`;
    this.init();
  }

  async init() {
    this.collapse.defaultActiveKeyFirst = ['5','6','7','8'];
    this.achievementId = '';
    this.versionButtonLinks.activeIndex = 0;
    this.versionButtonLinks.buttonLinks = [];
    this.achievementTabs.panes = [];
    this.achievementFileList = [];
    this.getReplyType();
    if(this.isCreate){
      this.collapse.defaultActiveKeyFirst=['2','3','4','5','6','7'];
      this.collapse.defaultActiveKeyThird=[];
    }
    const config = await sheetConfig({sheetCode:"XTSJ_sjrwd",schemaCode:"XTSJ_sjrwd"});
    if(typeof config ==="string"){
      return this.$message.error(`获取设计任务单初始配置失败,${config}`);
    }
    this.formData.sheetConfig =  config;
    await this.getDesignTask();
    //获取图纸版本数
    // await this.getDesignAchievementCount();
    this.getNewAchievements();
    this.initKey++
  }

  listSkipQueryList() {
    listApi.listSkipQueryList({
      "queryCode": "XTSJ_zyrwd",
      "schemaCode": "XTSJ_zyrwd",
      "mobile": false,
      "page": 0,
      "size": 2,
      "filters": [
        {
          "op": "Eq",
          "propertyCode": "id",
          "propertyType": 0,
          "propertyValue": this.$route.query.id
        }
      ]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      if(Array.isArray(res.data.content) && res.data.content.length) {
        const data = res.data.content[0].data;
        this.formData.data.zyrwd_id.name = res.data.content[0].name;
        this.formData.data.zyrwd_id.id = res.data.content[0].id;
        this.formData.data.zyrwd_id.schemaCode = res.data.content[0].schemaCode;
        this.formData.data.engineering_name = data.engineering_name;
        this.formData.data.engineering_location = data.engineering_location;
        this.formData.data.industryType = data.industryType;
        this.formData.data.projectType = data.projectType;
        this.formData.data.engineering_number = data.engineering_number;
        this.formData.data.engineering_stage = data.engineering_stage;
        this.formData.data.manufacturer = data.manufacturer;
        this.formData.data.project_level = data.project_level;
        this.formData.data.modelType = data.modelType;
        this.formData.data.engineeringType = data.engineeringType;
        this.formData.data.profession_name = data.profession_name;
        this.formData.data.project_manager = data.profession_manager;
        this.formData.data.xmlb_id = data.xmlb_id;
        // this.formData.data.manufacturer_chief = data.manufacturer_chief_engineer;
        this.formData.data.company_chief = data.company_chief_engineer
        this.formData.data.auditor = data.profession_manager;
        this.getModelTypeConfig('XTSJ_field_mapping','XTSJ_sjrwd')
      }
    })
  }

  checkerChange(value){
    this.checkerId=value;
    this.getAnnotationList();
  }
  nodeChange(value){
    this.nodeId=value;
    this.getAnnotationList();
  }
  //TODO START 设计任务成果
  versionButtonLinks:{activeIndex:number,buttonLinks:string[]}={
    activeIndex:0,buttonLinks:[]
  };

  versionCount={
    total:0,
    release:0
  }
  /* 查询任务成果版本数 */
  async getDesignAchievementCount(){
    try {
      const {errcode,errmsg,data} = await designAchievementCount({appCode:this.appCode,sjrwdId:this.formData.data.id as string});
      if(errcode){
        return this.$message.error(`获取任务成果版本数失败,${errmsg}`);
      }
      this.versionCount=data??{total:0,release:0};
      this.createVersionButtonLinks();
    } catch (error) {
      return this.$message.error(`获取任务成果版本数异常,${error}`);
    }
  }
  /* 新增任务设计成果版本Button */
  // createVersionButtonLinks(){
  //   if(this.versionCount.release>0){
  //     for (let index = 0; index < this.versionCount.release; index++) {
  //       this.versionButtonLinks.buttonLinks.push(`第${numberToChinese(`${index+1}`)}版`);
  //       this.achievementTabs.panes.push({
  //         title:`第${numberToChinese(`${index+1}`)}版`,
  //         key:`${index}`,
  //         component:"AchievementUpload",
  //         version:index+1,
  //       });
  //     }
  //     if(this.formData.data.activityCode==="Activity3"&&this.versionCount.total>this.versionCount.release){
  //       this.versionButtonLinks.buttonLinks.push(`第${numberToChinese(`${this.versionCount.release+1}`)}版`);
  //       this.achievementTabs.panes.push({
  //         title:`第${numberToChinese(`${this.versionCount.release+1}`)}版`,
  //         key:this.versionCount.release+'',
  //         component:"AchievementUpload",
  //         version:this.versionCount.total
  //       });
  //     }
  //   }else{
  //     this.versionButtonLinks.buttonLinks.push(`第${numberToChinese("1")}版`);
  //     this.achievementTabs.panes.push({
  //       title:`第${numberToChinese("1")}版`,
  //       key:"0",
  //       component:"AchievementUpload",
  //       version:1,
  //     });
  //   }
  //   const max=Math.max(this.versionCount.release,this.versionCount.total);
  //   this.verButtonClick(max>0?max-1:0);
  // }

  addVersionButtonLinks(){
    const count = this.versionButtonLinks.buttonLinks.length;
    if(count>=this.versionCount.release+1){
      return this.$message.error(`已增加新版本[第${numberToChinese(count+'')}版]`);
    }
    this.versionButtonLinks.buttonLinks.push(`第${numberToChinese(count+1+'')}版`);
    this.achievementTabs.panes.push({
      title:`第${numberToChinese(count+1+'')}版`,
      key:count+"",
      component:"AchievementUpload",
      version:count+1
    });
    this.verButtonClick(count)
  }

  /* 任务设计成果版本Button Click */
  verButtonClick(index:number){
    this.versionButtonLinks.activeIndex=index;
    this.achievementTabs.activeKey=index+"";
    this.achievementTabs.panes.forEach((item,itemIndex)=>{
      if(index===itemIndex){
        this.version=item.version
      }
    })
    this.designAchievement();
  }
  /*模型检查标注列表*/
  designAchievement(){
    designAchievement({
      appCode:this.appCode,
      sjrwdId:this.sjrwdId??'',
      version:this.version??''
    })
      .then((res) => {
        this.versionId=res.data?.id??""
      })
      .finally(()=> {
        this.getAnnotationFilter();
      })
  }
  async getAnnotationFilter(){
    await getAnnotationFilter({appCode:this.appCode??'',versionId:this.versionId}).then(res=>{
      if(res.errcode!==0) return this.$message.error( res.errmsg as string )
      this.filterData=res?.data??[];
      this.checkerData=[];
      this.nodeData=[];
      if(this.filterData.length===0) return;
      for (const key in this.filterData[0]){
        this.checkerData.push({id:key,value:this.filterData[0][key]})
      }
      for (const key in this.filterData[1]){
        this.nodeData.push({id:key,value:this.filterData[1][key]})
      }
    })
      .finally(()=>{
        this.getAnnotationList()
      })
  }
  async getAnnotationList(){
    this.marksConfiguration.pagination = {
      current:1,
      pageSize:5,
      showQuickJumper:true,
      total:0,
      showTotal:(total:number, range)=>`共${total}条`,
      onChange:(page:number, pageSize:number)=>this.markTablePaginationChange(page,pageSize),
    }
    this.marksConfiguration.dataSource = []
    this.marksConfiguration.dataSourceCopy = [];
    this.marksConfiguration.searchKeyWord = '';

    await getAnnotationList({
      appCode:this.appCode??'',
      versionId:this.versionId,
      checkerId:this.checkerId,
      workflowNode:this.nodeId
    })
      .then(res => {
        if(res.errcode!==0) return this.$message.error(res.errmsg as string)
        if(!res.data) return;
        this.marksConfiguration.dataSourceCopy=res.data;
        this.marksConfiguration.dataSource=res.data;
        // @ts-ignore
        this.marksConfiguration.pagination.total=this.marksConfiguration.dataSource.length;
      })
  }

  /* 模型检查标注Table分页点击 */
  markTablePaginationChange(page:number, pageSize:number){
    this.marksConfiguration.pagination!.current=page;
  }
  /* 显示缩略图 */
  showImg(record,url?:string){
    // if (!url){
    //   this.thumbnail=record.thumbnail;
    // }else {
    this.thumbnail = url as string
    // }
    this.picShow=true;
  }
  /* 隐藏缩略图 */
  picHide(){
    this.picShow=false;
    this.thumbnail='';
  }
  /* 模型检查标注搜索 */
  markSearch(){
    const {searchKeyWord:keyWords}=this.marksConfiguration;
    this.marksConfiguration.dataSource=this.marksConfiguration.dataSourceCopy.filter(item => {
      return item.designFileName.indexOf(keyWords)>-1 || item.fileType.indexOf(keyWords)>-1;
    })
  }
  getAchievementBizObjectData(id:string):AchievementbizObject{
    const {achievementFileList,versionCount,formData} = this;
    //准备数据
    const attachmentData :any=[];
    const designFileData :any=[];
    achievementFileList.forEach((item:any) =>{
      if(!item.schemaCode && (this.formmatConfig.split(',').some((i)=> item.name.indexOf(i)>-1))){
        designFileData.push({
          engine_file_name: item.engineFileName,
          engine_model_id: item.engineModelId,
          engine_project_id:item.engineProjectId,
          file_address: null,
          file_name: item.name,
          file_type: item.name.split('.').reverse()[0],
          id: item.id,
          lightweight_address:item.lightweightAddress===''?null:item.lightweightAddress,
          upload_date: null,
          attachments:[item],
          workload:item.workload,
          feature_extension:item.featureExtension,
          person_id:item.personId,
          status:item.status,
        })
      }else {
        attachmentData.push(item)
      }
    })
    return{
      id:this.achievementId??id,
      data:{
        version:`${versionCount.release+1}`,
        // attachment:attachmentData,
        attachment: [],
        attachment_amount: '0',
        // attachment_amount:`${attachmentData.length}`,
        XTSJ_rwsjcg_file:[],
        XTSJ_design_file: [],
        // XTSJ_design_file:[...designFileData,...attachmentData],
        // XTSJ_design_file: designFileData,
        id:this.achievementId??id,
        sjrwd_id:formData.data.id as string,
      },
      schemaCode: "XTSJ_rwsjcg",
      sheetCode: "XTSJ_rwsjcg",
      workflowInstanceId: null
    }
  }

  //TODO END
  /* 获取或创建设计任务单 */
  async getDesignTask(){
    const {appCode,projectId,sjrwdId,isCreate}=this;
    try {
      let workflowInstanceId = "";
      let workItemId = "";
      const res = isCreate?await createDesignTask({appCode,projectId,zyrwdId:sjrwdId}): await designTask({appCode,projectId,sjrwdId});
      if(res.errcode){
        return this.$message.error(`获取设计任务单失败,${res.errmsg}`);
      }
      if(!isCreate){
        const { data } =  res;
        workflowInstanceId = data!.workflowInstanceId;
        workItemId = data!.workItemId;
      }
      //@ts-ignore
      const { errcode,errmsg,data } = isCreate? await loadSheetData<LoadData>({startWorkflowCode:"XTSJ_sjrwd_workflow",fieldParam1:this.$route.query.id}) : await loadSheetData<LoadData>({workflowInstanceId,workitemId:workItemId,fieldParam1:this.$route.query.id})
      if(errcode){
        return this.$message.error(`获取设计任务单失败,${errmsg}`);
      }
      //@ts-ignore
      if(Array.isArray(data.logInfoList) && data.logInfoList.length) {
        //@ts-ignore
        this.activityCode = data.logInfoList[data.logInfoList.length-1].activityCode;
      }
      // @ts-ignore
      this.formData.data = {
        XTSJ_design_para: data?.bizObject.data?.XTSJ_design_para??[],
        id:data?.bizObject.id,
        workflowTokenId:data?.workflowTokenId??null,
        workItemId:data?.workItemId??null,
        workflowInstanceId:data?.workflowInstanceId,
        // zyrwd_id:data?.bizObject.data.zyrwd_id,
        zyrwd_id:data?.bizObject.data?.zyrwd_id??{},
        xmlb_id:data?.bizObject.data?.xmlb_id??{},
        activityCode:data?.activityCode,
        activityName:data?.activityName,
        rejectToActivityCode:res.data?.rejectToActivityCode,

        auditor:data?.bizObject.data.auditor??null,
        checker:data?.bizObject.data.checker??null,
        chief_engineer:data?.bizObject.data.chief_engineer??null,
        collaborate_flag:data?.bizObject.data.collaborate_flag,
        company_chief:data?.bizObject.data.company_chief??null,
        company_chief_engineer:data?.bizObject.data.company_chief_engineer,
        company_manager:data?.bizObject.data.company_manager,
        countersign_flag:data?.bizObject.data.countersign_flag,
        add_signer_flag:data?.bizObject.data.add_signer_flag??'',
        countersigned:data?.bizObject.data.countersigned??[],
        currentStatus:data?.bizObject.data.currentStatus,
        department_chief:data?.bizObject.data.department_chief??null,
        design_guider:data?.bizObject.data.design_guider??null,
        design_guider_flag:data?.bizObject.data.design_guider_flag,
        designer:data?.bizObject.data.designer??null,
        add_signer: data?.bizObject.data.add_signer??[],
        engineering_location:data?.bizObject.data.engineering_location??null,
        engineering_name:data?.bizObject.data.engineering_name,
        achievement_number: data?.bizObject.data.achievement_number??'',
        task_number: data?.bizObject.data.task_number??'',
        engineering_number:data?.bizObject.data.engineering_number,
        engineering_stage: data?.bizObject.data.engineering_stage,
        industryType: data?.bizObject.data.industryType,
        manufacturer:data?.bizObject.data.manufacturer??null,
        manufacturer_chief_engineer:data?.bizObject.data.manufacturer_chief_engineer??null,
        manufacturer_vice_engineer:data?.bizObject.data.manufacturer_vice_engineer??null,
        manufacturer_vice_manager:data?.bizObject.data.manufacturer_vice_manager??null,
        partners:data?.bizObject.data.partners??null,
        plan_duration:data?.bizObject.data.plan_duration??undefined,
        plan_end_time:data?.bizObject.data.plan_end_time??undefined,
        plan_start_time:data?.bizObject.data.plan_start_time??undefined,
        profession:data?.bizObject.data.profession,
        profession_name:data?.bizObject.data.profession_name,
        profession_task_name:data?.bizObject.data.profession_task_name,
        projectType:data?.bizObject.data.projectType,
        project_level:data?.bizObject.data.project_level,
        modelType: data?.bizObject.data.modelType??'',
        engineeringType: data?.bizObject.data.engineeringType??'',
        project_manager:data?.bizObject.data.project_manager??null,
        project_manager_audit:data?.bizObject.data.project_manager_audit,
        proofread_flag:data?.bizObject.data.proofread_flag,
        proofread_level:data?.bizObject.data.proofread_level,
        sign_subject: !this.getMultiple('sign_subject')?data?.bizObject.data.sign_subject??'':data?.bizObject.data.sign_subject && data?.bizObject.data.sign_subject.length?data?.bizObject.data.sign_subject.split(';'):[],
        // sign_subject:data?.bizObject.data.sign_subject,
        signed_person:data?.bizObject.data.signed_person,
        signer:data?.bizObject.data.signer,
        task_ratio:data?.bizObject.data.task_ratio,
        task_time:data?.bizObject.data.task_time??undefined,
        task_type:data?.bizObject.data.task_type,
        unsigned_person:data?.bizObject.data.unsigned_person,
        use_software_name:data?.bizObject.data.use_software_name,
        work_content:data?.bizObject.data.work_content,

        achievementSubmitButton:res.data?.achievementSubmitButton,
        achievementRetainButton:res.data?.achievementRetainButton,
        submitButton:res.data?.submitButton,
        retainButton:res.data?.retainButton,
        agreeButton:this.isCountersignedNode?false:this.isCompanyChief?false:res.data?.agreeButton,
        rejectButton:this.isCompanyChief?false:res.data?.rejectButton,
        receiveButton:res.data?.receiveButton,
        defineSubmitButton: this.isCountersignedNode && res.data?.agreeButton,
        defineCompanyChief: this.isCompanyChief
      }
      //新增专业设计提纲-带入工作大纲已填字段  新增？判断
      if(this.isCreate) {
        this.listSkipQueryList();
      }else {
        this.getModelTypeConfig('XTSJ_field_mapping','XTSJ_sjrwd')
      }

      this.updateSheetConfig(this.isCreate,data as SheetData<LoadData>);
      //创建时填充部分数据
      if(isCreate){
        this.formData.data.profession = [{id:this.userInfo.id,type:this.userInfo.unitType,name:this.userInfo.name}];
      }
      //创建数据校验规则
      this.createRules();
      //更新节点信息
      if(this.formData.data.workflowInstanceId){
        await this.getWorkflowBaseInfo(this.formData.data.workflowInstanceId as string);
        this.calcUsedTime();
      }
    } catch (error) {
      this.$message.error(`获取设计任务单异常,${error}`);
    }
  }

  /* 返回上一页 */
  back(){
    if(!this.isBack){
      this.$router.push({
        name:"ProfessionalTask",
        query:{
          projectId:this.projectId
        },
        params: {
          zyrwdId: this.$route.params.zyrwdId,
          pageNum: this.$route.params.pageNum,
          pageSize: this.$route.params.pageSize,
          activeMen: this.$route.params.activeMen,
          checkedAll: this.$route.params.checkedAll
        }
      });
    }else{
      this.$router.back();
    }
  }

  /* table点击跳转 */
  rowClick(record:any){
    return{
      on:{
        click:()=>{
          if (!record.lightweightUrl) return;
          window.open(record.lightweightUrl,'_blank')
          // if (!record.engineModelId&&!record.engineProjectId) return
          // const routeUrl= this.$router.resolve({
          //   name:'/ModelAnnotation',
          //   query: {
          //     appCode: this.appCode,
          //     personId: this.userInfo.id,
          //     workflowInstanceId: this.formData.data.workflowInstanceId,
          //     designFileId: record.designFileId,
          //     name:record.designFileName,
          //     VaultID:record.engineProjectId,
          //     ModelID:record.engineModelId,
          //     // FileName:record.engineFileName,
          //     annotationId:record.id,
          //     iframeURL:record.annotationAddress,
          //     FileName: record.layerId
          //   },
          // })
          // window.open(routeUrl.href, "_blank")
        }
      }
    }
  }

  /* 增加上传成果文件 */
  addAchievementFile(file){
    this.achievementFileList.push(file);
    this.actions('retainButton',false,true)
    // this.savaAchievements()
  }
  //暂存新增的成果文件
  savaAchievements = Utils.debounce(()=> {
    this.actions('retainButton',false,true)
  },500)

  /* 移除上传成果文件 */
  removeAchievementFile(refId:string){
    const fileIndex=this.achievementFileList.findIndex(item=>item.refId===refId);
    (fileIndex>-1)&&this.achievementFileList.splice(fileIndex,1);
  }
  /* 更新上传附件 */
  updateAchievement(id:string,files){
    this.achievementId=id;
    this.achievementFileList=files;
  }

  getBizObjectData(id:string):BizObject{
    const { formData:{data:formData} } = this;
    const para = JSON.parse(JSON.stringify(formData.XTSJ_design_para));
    const user:any = sessionStorage.getItem('user');
    let userId:string = '';
    let userName: string = '';
    if (user) {
      userId = JSON.parse(user).id;
      userName = JSON.parse(user).name
    }
    return{
      id:formData.id??id,
      data:{
        //@ts-ignore
        XTSJ_design_para:para.map((item)=> {
          if(item.professionTaskId && item.professionTaskId.id) {
            Object.assign(item,{ professionTaskId: item.professionTaskId && item.professionTaskId.id })
          }
          if(item.professionTaskId && Array.isArray(item.professionTaskId.profession_manager) && item.professionTaskId.profession_manager.length && item.professionTaskId.profession_manager[0].id) {
            Object.assign(item,{ professionManager: [
                {id:item.professionTaskId.profession_manager[0].id,type: 3 }
              ]})
          }
          if(Array.isArray(item.designPerson)) {
            if(item.designPerson.length && item.designPerson[0].id) {
              Object.assign(item,{ designPerson: [
                  {
                   id:item.designPerson[0].id,type: 3
                  }
                ]})
            }else {
              Object.assign(item,{ designPerson: null} )
            }
          }
          return item;
        }),
        auditor:formData.auditor??null,
        checker:formData.checker??null,
        chief_engineer:formData.chief_engineer??null,
        collaborate_flag: formData.collaborate_flag??null,
        company_chief:formData.company_chief??null,
        company_chief_engineer:formData.company_chief_engineer??null,
        company_manager:formData.company_manager??null,
        countersign_flag:formData.countersign_flag??null,
        add_signer_flag:formData.add_signer_flag??'',
        //@ts-ignore
        countersigned:this.activityCode==="Activity15"&&this.itemShow('add_signer') && !formData.countersigned.map((i)=> i.id).includes(userId)?formData.countersigned.push({id:userId,type:3,name: userName}): formData.countersigned??[],
        currentStatus: formData.currentStatus??null,
        department_chief:formData.department_chief??null,
        design_guider:formData.design_guider??null,
        design_guider_flag:formData.design_guider_flag??null,
        designer:formData.designer??null,
        add_signer: formData.add_signer??[],
        engineering_location:formData.engineering_location??null,
        engineering_name:formData.engineering_name??null,
        achievement_number: formData.achievement_number??'',
        task_number: formData.task_number??'',
        engineering_number:formData.engineering_number??null,
        engineering_stage: formData.engineering_stage??null,
        industryType: formData.industryType??null,
        manufacturer:formData.manufacturer??null,
        manufacturer_chief_engineer:formData.manufacturer_chief_engineer??null,
        manufacturer_vice_engineer:formData.manufacturer_vice_engineer??null,
        manufacturer_vice_manager:formData.manufacturer_vice_manager??null,
        partners:formData.partners??null,
        plan_duration:formData.plan_duration??null,
        plan_end_time:formData.plan_end_time??null,
        plan_start_time:formData.plan_start_time??null,
        profession:formData.profession??null,
        profession_name:formData.profession_name??null,
        profession_task_name:formData.profession_task_name??null,
        projectType:formData.projectType??null,
        project_level:formData.project_level??null,
        modelType: formData.modelType??'',
        engineeringType: formData.engineeringType??'',
        project_manager:formData.project_manager??null,
        project_manager_audit:formData.project_manager_audit??null,
        proofread_flag:formData.proofread_flag??null,
        proofread_level:formData.proofread_level??null,
        sign_subject:this.getMultiple('sign_subject')?formData.sign_subject.join(';'):formData.sign_subject??'',
        // sign_subject:formData.sign_subject??null,
        signed_person:formData.signed_person??null,
        signer:formData.signer??null,
        task_ratio:formData.task_ratio??null,
        task_time:formData.task_time??null,
        task_type:formData.task_type??null,
        unsigned_person:formData.unsigned_person??null,
        use_software_name:formData.use_software_name??null,
        work_content:formData.work_content??null,
        zyrwd_id:formData.zyrwd_id?.id??'',
        xmlb_id:formData?.xmlb_id?.id??'',
        // zyrwd_id:formData.zyrwd_id??this.sjrwdId,
        // xmlb_id:this.projectId,
        id: formData.id??id,
      },
      schemaCode:"XTSJ_sjrwd",
      sheetCode:"XTSJ_sjrwd",
      workflowInstanceId:formData.workflowInstanceId??null,
    }
  }

  /**
   *
   * @param actionCode
   * @param showComment
   * @param updateStatus  新增/删除指定成果文件（类型：achievementFormatConfig），进行暂存操作
   */
  async actions(actionCode:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',showComment:boolean,updateStatus?:boolean){
    this.dialogModalConfiguration.confirmLoading=true;
    const {userInfo,formData,getBizObjectData,getAchievementBizObjectData} = this;
    const {departmentId,imgUrl,name,unitType} = userInfo;
    //意见建议校验
    if(showComment){
      let validde = false;
      let errorFields:{[key:string]:{message:string,field:string}[]}={};
      this.dialogForm.validate((valid,fields)=>{
        validde = valid;
        errorFields = fields as {[key:string]:{message:string,field:string}[]};
        if(!valid){
          return false;
        }
      })
      if(!validde){
        this.dialogModalConfiguration.confirmLoading=false;
        for (const key in errorFields) {
          if (Object.prototype.hasOwnProperty.call(errorFields, key)) {
            const element = errorFields[key];
            this.$message.error(`${element[0].message}`);
            break;
          }
        }
        return;
      }
    }
    try {
      //提交数据校验
      if(actionCode!=="retainButton"){
        //@ts-ignore
        let validde = false;
        let errorFields:{[key:string]:{message:string,field:string}[]}={};
        this.productionForm.validate((valid,fields)=>{
          errorFields = fields as {[key:string]:{message:string,field:string}[]};
          validde = valid
          if(!valid)return false;
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
      }
      //流程判断
      if(actionCode==="submitButton"||actionCode==='receiveButton'||actionCode==='agreeButton'){
        const {errcode,errmsg,data} = await workflowInstanceFlag({id:formData.data.id??'',projectId:this.projectId,schemaCode:'XTSJ_xmlb',
          workflowInstanceId:formData.data.workflowInstanceId??'',appCode:this.appCode,});
        if(errcode) return this.$message.warn(`${errmsg}`);

        if(!data.flag) return this.$message.warn(`${data.message}`);
      }
      const token = await replayToken();
      if(!token) return this.$message.error("获取replayToken失败");
      const id = await UUID();
      if(!id) return this.$message.error("获取UUID失败");
      let res:HttpResponse<any>;
      const bizObject = getBizObjectData(id);
      if(actionCode==='retainButton'){
        if (!this.designTaskAttachments.length&&this.activityCode!=='Activity2') return this.$message.warning('任务设计成果不能为空');
        res = await save({
          workItemId:formData.data.workItemId??null,
          workflowInstanceId:formData.data.workflowInstanceId??null,
          bizObject,
          departmentId,
          replayToken:token,
          workflowCode:"XTSJ_sjrwd_workflow"
        });
        // //附件暂存
        // if(formData.data.achievementRetainButton){
        //   if(this.achievementFileList.length===0) return this.$message.warning('任务设计成果不能为空');
        //   if(this.version<=this.versionCount.release) return this.$message.warning(`第${numberToChinese(this.version)}已提交过，请创建新版本。`);
        //   const achievementBizObjec = {
        //     departmentId,
        //     replayToken:token,
        //     bizObject:getAchievementBizObjectData(id),
        //   }
        //   res = await achievementSave(achievementBizObjec);
        // }else{
        //   res = await save({
        //     workItemId:formData.data.workItemId??null,
        //     workflowInstanceId:formData.data.workflowInstanceId??null,
        //     bizObject,
        //     departmentId,
        //     replayToken:token,
        //     workflowCode:"XTSJ_sjrwd_workflow"
        //   });
        // }
      }else if(actionCode==="submitButton"){
        // let achievementAction = false;
        if (!this.designTaskAttachments.length&&this.activityCode!=='Activity2') return this.$message.warning('任务设计成果不能为空');
        // //附件提交和暂存
        // if(formData.data.achievementSubmitButton || formData.data.achievementRetainButton){
        //   // if(this.achievementFileList.length===0) return this.$message.warning('任务设计成果不能为空');
        //   // if(this.version<=this.versionCount.release) return this.$message.warning(`第${numberToChinese(this.version)}已提交过，请创建新版本。`);
        //   const achievementBizObjec = {
        //     departmentId,
        //     replayToken:token,
        //     bizObject:getAchievementBizObjectData(id),
        //   }
        //   const callFun = formData.data.achievementSubmitButton?achievementSubmit:achievementSave;
        //   res = await callFun(achievementBizObjec);
        //   achievementAction=true;
        // }
        //附件没有操作或附件操作结果成功才提交流程
        // if(!achievementAction||!res!.errcode){
          const token2 = await replayToken();
          if(!token2) return this.$message.error("获取replayToken失败");
          res = await submit({
            workItemId:formData.data.workItemId??null,
            workflowInstanceId:formData.data.workflowInstanceId??null,
            bizObject,
            departmentId,
            replayToken:token2,
            workflowCode:"XTSJ_sjrwd_workflow"
          });
        // }
      }else if(actionCode==="agreeButton"||actionCode==="receiveButton"){
        const approval= {
          id:id,
          createdTime: moment().format("YYYY-MM-DD HH:mm:ss"),
          deleted: false as false,
          createdBy: this.userInfo.id,
          workflowInstanceId: formData.data.workflowInstanceId as string,
          content: this.dialogTaskForm.formData.comment,
          actionType: 1,
          result: 1,
          activityCode: formData.data.activityCode as string,
          activityName: formData.data.activityName as string,
          workItemId: formData.data.workItemId as string,
          commentTime: moment().format("YYYY-MM-DD HH:mm:ss"),
          workflowTokenId: formData.data.workflowTokenId as string,
          creater: {
            imgUrl: imgUrl,
            name: name,
            id: this.userInfo.id,
            type: unitType,
          },
        };
        res =  await agree({
          workItemId:formData.data.workItemId as string,
          workflowInstanceId:formData.data.workflowInstanceId as string,
          bizObject:getBizObjectData(id),
          replayToken:token,
          approval:approval,
          workflowCode:"XTSJ_zysjtg_workflow"
        })
      }else if(actionCode==='rejectButton'){
        const approval= {
          content: this.dialogTaskForm.formData.comment,
          workItemId: formData.data.workItemId as string,
          workflowInstanceId: formData.data.workflowInstanceId as string,
          workflowTokenId: formData.data.workflowTokenId as string,
          activityCode: formData.data.activityCode as string,
          activityName: formData.data.activityName as string,
          result: null
        };
        res =  await reject({
          workItemId:formData.data.workItemId as string,
          workflowInstanceId:formData.data.workflowInstanceId as string,
          bizObject,
          replayToken:token,
          approval:approval,
          workflowCode:"XTSJ_sjrwd_workflow",
          rejectToActivityCode:formData.data.rejectToActivityCode as string,
        });
      }
      const { errcode,errmsg,data} = res!;
      if(errcode){
        return this.$message.error(`${this.dialogModalConfiguration.okText}失败,${errmsg}`);
      }
      // console.log(this.$refs[`achievement${this.versionCount.release}`],'11')
      this.dialogModalConfiguration.visible=false;
      if (updateStatus) {
        //@ts-ignore
        // if (this.$refs[`achievement${this.versionCount.release}`] && this.$refs[`achievement${this.versionCount.release}`][0].getDesignAchievement) {
        //   //@ts-ignore
        //   this.$refs[`achievement${this.versionCount.release}`][0].getDesignAchievement();
        // }
        if (this.$refs[`achievement${this.versionCount.release}`] && this.$refs[`achievement${this.versionCount.release}`][0].getNewDesignAchievement) {
          //@ts-ignore
          this.$refs[`achievement${this.versionCount.release}`][0].getNewDesignAchievement();
        }
      }else {
        this.$message.success(`${this.dialogModalConfiguration.okText}成功`);
        this.init();
      }
      // this.back();
    } catch (error) {
      this.$message.error(`${this.dialogModalConfiguration.okText}异常,${error}`);
    }finally{
      this.dialogModalConfiguration.confirmLoading=false;
      this.dialogModalConfiguration.visible=false;
    }
  }

  disabledStartDate(currentDate:Moment){
    const endValue = this.formData.data.plan_end_time;
    if(!endValue||!currentDate) return false;
    return currentDate.valueOf()>moment(endValue).valueOf();
  }

  disabledEndDate(currentDate:Moment){
    const startValue = this.formData.data.plan_start_time;
    if(!startValue||!currentDate) return false;
    return moment(startValue).valueOf()>=currentDate.valueOf();
  }
  @Watch("formData.data.plan_start_time")
  planStartTimeChanged(newVal){
    if(newVal&&this.formData.data.plan_end_time){
      this.formData.data.plan_duration=moment(this.formData.data.plan_end_time).diff(moment(newVal),"days")+1+"";
    }else{
      this.formData.data.plan_duration="";
    }
  }
  @Watch("formData.data.plan_end_time")
  planEndTimeChanged(newVal){
    if(newVal&&this.formData.data.plan_start_time){
      this.formData.data.plan_duration=moment(newVal).diff(moment(this.formData.data.plan_start_time),"days")+1+"";
    }else{
      this.formData.data.plan_duration="";
    }
  }
  //工作大纲报告编制
  formKey: number = 100;
  initKey: number = 1;
  async createDesignSpecificationSubTask() {
    const token = await replayToken();
    if(!token) return this.$message.error("获取replayToken失败");
    const id = await UUID();
    if(!id) return this.$message.error("获取UUID失败");
    const bizObject = this.getBizObjectData(id);
    const {userInfo:{departmentId},formData} = this;
    save({
      workItemId:formData.data.workItemId??null,
      workflowInstanceId:formData.data.workflowInstanceId??null,
      bizObject,
      departmentId,
      replayToken:token,
      workflowCode:"XTSJ_sjrwd_workflow"
      // eslint-disable-next-line no-shadow
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      createDesignSpecificationSubTask({
        appCode: this.appCode??'',
        id: this.sjrwdId
      }).then((task)=> {
        if(task.errcode!==0) return this.$message.error(task.errmsg as string)
        if(!task.data) return;
        this.$message.success('下发成功！')
        this.init()
      })
    });
  }
  activityCode: string = '';
  get showCreateChapter() {
    return this.activityCode==='Activity3'
  }
  get showChapter() {
    return this.formData.data.profession_name === '项目经理' && this.formData.data.task_type === '说明书'
  }
  //专业负责人
  upBindManager(data:any) {
    this.$set(this.formData.data.XTSJ_design_para[data.selectedRowIndex],'professionTaskId',data.data)
    this.$set(this.formData.data.XTSJ_design_para[data.selectedRowIndex],'professionManager',data.data.profession_manager);
  }
  //成果文件格式配置
  formmatConfig: string = '';
  //会签节点-定制流程操作
  get isCountersignedNode() {
    return this.activityCode==='Activity5'
  }
  //院主管总工节点-定制流程操作
  get isCompanyChief() {
    return this.activityCode==='Activity10'
  }
  // get is
  //TODO START 生成成果编码
  taskCodeStage: string[] = ['Activity2','Activity14']
  get mergeCode() {
    return this.formData.data.profession_name && this.formData.data.engineering_name && this.formData.data.task_number && this.taskCodeStage.includes(this.activityCode)
  }
  @Watch('mergeCode', { deep: true })
  mergeCodeListener(val) {
    if (val) {
      this.debounceCode()
    }else {
      this.taskCodeStage.includes(this.activityCode)?this.formData.data.achievement_number = '':''
    }
  }
  debounceCode = Utils.debounceFn(()=> {
    this.getDesignTaskAchievementCode()
  },1000)
  //获取自动成果编号
  getDesignTaskAchievementCode() {
    getDesignTaskAchievementCode({
      appCode: this.projectCode??'',
      projectId: this.projectId??'',
      engineeringName: this.formData.data.engineering_name??'',
      taskNumber: this.formData.data.task_number??'',
      professionName: this.formData.data.profession_name??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.formData.data.achievement_number = res.data;
    })
  }
  //TODO END

  //TODO START 改版成果文件（无版本）

  //TODO 获取新版成果文件
  designTaskAttachments: AchievementFile[] = []
  getNewAchievements() {
    this.designTaskAttachments = [];
    this.versionButtonLinks.buttonLinks = [];
    this.achievementTabs.panes = [];
    this.versionButtonLinks.activeIndex = 0;
    this.achievementFileList = [];
    getNewDesignAchievements({
      appCode: this.projectCode??'',
      taskId: this.sjrwdId??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      if (isArray(res.data.files)) {
        this.designTaskAttachments = res.data.files;
      }
      this.createVersionButtonLinks()
    })
  }
  //TODO 新增任务设计成果版本Button
  createVersionButtonLinks() {
    if (this.designTaskAttachments.length) {
      for(let index=0;index<this.designTaskAttachments.length;index++) {
        this.versionButtonLinks.buttonLinks.push(`成果${numberToChinese(`${index+1}`)}`);
        this.achievementTabs.panes.push({
          title:`成果${numberToChinese(`${index+1}`)}`,
          key:`${index}`,
          component:"AchievementUpload",
          version:index+1,
        });
      }
    }else {
      this.versionButtonLinks.buttonLinks.push(`成果${numberToChinese("1")}`);
      this.achievementTabs.panes.push({
        title:`成果${numberToChinese("1")}`,
        key:"0",
        component:"AchievementUpload",
        version:1,
      });
    }
    this.newVerButtonClick(this.versionButtonLinks.activeIndex===0?0:this.versionButtonLinks.activeIndex-1)
    console.log(this.achievementTabs.activeKey,'achievementTabs.activeKey')
  }
  newVerButtonClick(index:number) {
    this.versionButtonLinks.activeIndex = index;
    this.achievementTabs.activeKey = `${index}`;
    this.newMarksConfiguration.pagination.current = 1;
    this.markSearchKeyWord = '';
    this.nodeName = '';
    this.newMarksConfiguration.pagination.total = 0;
    this.newMarksConfiguration.dataSource = [];
    this.newMarksConfiguration.pagination.current = 0;
    if (this.designTaskAttachments[index]) {
      this.getNewAnnotationList(index);
    }
  }
  //TODO 成果批注
  nodeName: string = '';
  markSearchKeyWord: string = '';
  getNewAnnotationList(index:number) {
    this.newMarksConfiguration.loading = true;
    getDesignAnnotations({
      appCode: this.appCode??'',
      designFileId: this.designTaskAttachments[index].id,
      pageNum:this.newMarksConfiguration.pagination.current,
      pageSize: this.newMarksConfiguration.pagination?.pageSize??5,
      keyword: this.markSearchKeyWord,
      nodeName: this.nodeName==='全部'?'':this.nodeName
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.newMarksConfiguration.dataSource=res.data.records;
      // @ts-ignore
      this.newMarksConfiguration.pagination.total= res.data.total;
    }).finally(()=> {
      this.newMarksConfiguration.loading = false
    })
  }
  newDeleteFile() {
    // this.versionButtonLinks.buttonLinks.length--;
    // this.designTaskAttachments = this.designTaskAttachments.filter((i,index)=> {
    //   return index!==this.versionButtonLinks.activeIndex
    // })
    // this.achievementTabs.panes = this.achievementTabs.panes.filter((j,index)=> {
    //   return index!==this.versionButtonLinks.activeIndex
    // })
    // this.versionButtonLinks.activeIndex = 0;
    // this.getNewAnnotationList(0)
    this.getNewAchievements()
  }
  newAddVersionButtonLinks(){
    const count = this.versionButtonLinks.buttonLinks.length;
    if(!this.designTaskAttachments[count-1]){
      return this.$message.error(`成果${numberToChinese(count+'')}为空，请先上传文件!`);
    }
    this.versionButtonLinks.buttonLinks.push(`成果${numberToChinese(count+1+'')}`);
    this.achievementTabs.panes.push({
      title:`成果${numberToChinese(count+1+'')}`,
      key:count+"",
      component:"AchievementUpload",
      version:count+1
    });
    this.newVerButtonClick(count)
  }
  newAddAchievementFile({file,isAdd}) {
    if (isAdd) {
      this.designTaskAttachments.push(file)
    }else {
      this.designTaskAttachments.splice(this.versionButtonLinks.activeIndex,1,file)
    }
  }
  //TODO 模型检查标注Table配置
  newMarksConfiguration:TableConfiguration&{dataSource:any,searchKeyWord:string,dataSourceCopy:any}={
    loading:false,
    columns:[
      {title:"序号",align:"center",customRender:(text:string, record, index:number)=>{
          const {pageSize,current}=this.marksConfiguration.pagination as Pagination;
          return `${(current-1)*pageSize+index+1}`;
        }},
      {title:"成果标题",dataIndex:"designFileName",align:"center"},
      {title:"文件类型",dataIndex:"fileType",align:"center"},
      {title:"批注标题",dataIndex:"annotationName",align:"center"},
      {title:"批注描述",dataIndex:"desc",align:"center",width:300},
      {title:"流程节点",dataIndex:"workflowNode",align:"center"},
      {title:"检查人",dataIndex:"checkor",align:"center"},
      {title:"检查日期",dataIndex:"checkTime",align:"center"},
      {title:"批注缩略图",align:"center",scopedSlots:{customRender:"imgUrl"}},
    ],
    pagination:{
      current:1,
      pageSize:5,
      showQuickJumper:true,
      total:0,
      showTotal:(total:number, range)=>`共${total}条`,
      onChange:(page:number, pageSize:number)=>this.newMarkTablePaginationChange(page,pageSize),
    },
    dataSource:[],
    dataSourceCopy:[],
    searchKeyWord:"",
  }
  enterSearch(e) {
    this.markSearchKeyWord = e.target.value;
    this.newMarksConfiguration.pagination.current = 0;
    this.getNewAnnotationList(this.versionButtonLinks.activeIndex)
  }
  searchAnnotation(keyword) {
    this.markSearchKeyWord = keyword;
    this.newMarksConfiguration.pagination.current = 0;
    this.getNewAnnotationList(this.versionButtonLinks.activeIndex)
  }
  newNodeChange(nodeName:string) {
    this.nodeName = nodeName;
    this.newMarksConfiguration.pagination.current = 0;
    this.getNewAnnotationList(this.versionButtonLinks.activeIndex)
  }
  newMarkTablePaginationChange(page:number, pageSize:number){
    this.newMarksConfiguration.pagination.current = page;
    this.getNewAnnotationList(this.versionButtonLinks.activeIndex)
  }
  //TODO END
  get isEditOutlineWork() {
    return this.formData.data.submitButton || this.formData.data.retainButton || this.formData.data.receiveButton || this.formData.data.agreeButton || this.formData.data.rejectButton
  }
}
