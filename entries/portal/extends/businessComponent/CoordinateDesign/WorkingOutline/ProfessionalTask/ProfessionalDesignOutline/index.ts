import { Component, Vue, Prop,InjectReactive,Ref,Mixins} from 'vue-property-decorator';
import {CommonMixins} from "../../commonMixins"
import {Collapse,Icon,Button,FormModel,Upload,Input,Checkbox,Radio,Select,Modal} from "@h3/antd-vue";
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import {QuerryPermissions,CreatePermissions,uploadFile,BizObject} from "../../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignOutline";
import { ValidationRule } from '@h3/antd-vue/types/form/form';
import {UUID,replayToken,submit,save,agree,reject,loadSheetData,sheetConfig, SheetConfig,professionNameOptions,SheetData} from "../../../../../service/CoordinateDesign/common";
import {HttpResponse} from "@cloudpivot/api/src/response";
import {workflowInstanceFlag} from "../../../../../service/CoordinateDesign/WorkingOutline/ProductionTaskList";
import {getCommonReplys} from "../../../../../service/api";
import EditWorkOutlinePanel from "../../ProjectPlanning/components/EditWorkOutlinePanel.vue";
type ModalConfiguration={visible:boolean,actionCode:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',showComment:boolean,title?:string,okText?:string,confirmLoading?:boolean,OK?:()=>void,afterClose?:()=>void};
type selectorOption = { id:string,name:string,type:number };
import { listApi } from "@cloudpivot/api";
import {
  TableColumn,
  WorkOutlineChapter,
  WorkOutlineModel,
  YunAttachmentFile
} from "../../../../../type";
import {
  createOnlineWebFile, delOnlineWebFile,
  saveOnlineWebFile,mergeProfessionePara
} from "../../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignTask";
import moment from "moment/moment";
import {yunFileUpload} from "../../../../../service/CoordinateDesign/documentLibrary";
import env from "@/config/env";
import StandardTemplate from "../components/StandardTemplate.vue";
import {getDecryptFile} from "../../../../../service/CoordinateDesign/base";

interface Data{
  id:string|null|undefined,
  workItemId:string|null|undefined,
  workflowTokenId:string|null|undefined,
  workflowInstanceId:string|undefined|null,
  zyrwd_id:any|null|undefined,
  rejectToActivityCode:string|null|undefined,

  submitButton?:boolean,
  retainButton?:boolean,
  receiveButton?:boolean,
  agreeButton?:boolean,
  rejectButton?:boolean,
  activityCode?:string,
  activityName?:string,
  xmlb_id?:any
}
type LoadData = {
  attachment:any[],
  XTSJ_profession_para: any[];
  company_chief:selectorOption[]|undefined,
  company_chief_engineer_flag:string|undefined|null,
  engineering_location:string|undefined|null,
  engineering_name: string|undefined|null,
  engineering_number:string|undefined|null,
  engineering_stage: string|undefined|null,
  industryType:string|undefined|null,
  manufacturer:selectorOption[]|undefined|null,
  manufacturer_chief:selectorOption[]|undefined,
  outline_auditor:selectorOption[]|undefined,
  profession_name:string|undefined|null,
  profession_person:selectorOption[]|undefined,
  projectType:string|undefined|null,
  project_level:string|undefined|null,
  project_manager:selectorOption[]|undefined,
  read_designer:selectorOption[]|undefined,
  task_type:string|undefined|null,
  zyrwd_id: any,
  modelType: string;
  engineeringType: string;
} & Data;
@Component({
  name:"ProfessionalDesignOutline",
  components:{
    [Collapse.name]:Collapse,
    [Collapse.Panel.name]:Collapse.Panel,
    [Icon.name]:Icon,
    [Button.name]:Button,
    [FormModel.name]:FormModel,
    [FormModel.Item.name]:FormModel.Item,
    [Upload.name]:Upload,
    [Input.name]:Input,
    [Checkbox.name]:Checkbox,
    [Checkbox.Group.name]:Checkbox.Group,
    [Radio.name]:Radio,
    [Radio.Group.name]:Radio.Group,
    [Select.name]:Select,
    [Select.Option.name]:Select.Option,
    [Modal.name]: Modal,
    ATable: Table,
    EditWorkOutlinePanel,
    StandardTemplate
  },
})
export default class ProfessionalDesignOutline extends Mixins(CommonMixins) {
  @InjectReactive("project") appCode!: string;
  @Ref("modalForm") form!: FormModel;
  @Ref("dialogForm") dialogForm!:FormModel;
  @Prop({required:true}) projectId!:string;
  @Prop({required:true}) zyrwdId!:string;
  @Prop({required:false,default:false}) isCreate!:boolean;

  approvalKey = 1;

  professionOptions:{value:string,label:string,key:number}[]=[];

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
  ]

  formData:{data:LoadData,
    rules:{[key:string]:(ValidationRule|{trigger:'blur' | 'change' | ['change', 'blur']})[]},
    sheetConfig:SheetConfig,optionsWatch:{[key:string]:()=>void},options:{[key:string]:{value:string,label:string,key:number,disabled:boolean}[]}}={
      data:{
        id:undefined,
        workItemId:undefined,
        workflowTokenId:undefined,
        workflowInstanceId:undefined,
        rejectToActivityCode:undefined,

        attachment:[],
        XTSJ_profession_para: [],
        company_chief:undefined,
        company_chief_engineer_flag:undefined,
        engineering_location:undefined,
        engineering_name: undefined,
        engineering_number:undefined,
        engineering_stage: undefined,
        industryType:undefined,
        manufacturer:undefined,
        manufacturer_chief:undefined,
        outline_auditor:undefined,
        profession_name:undefined,
        profession_person:undefined,
        modelType: '',
        engineeringType: '',
        projectType:undefined,
        project_level:undefined,
        project_manager:undefined,
        read_designer:undefined,
        task_type:undefined,
        xmlb_id: {},
        zyrwd_id:{}
      },
      rules:{},
      sheetConfig:{},
      optionsWatch:{},
      options:{},
  }

  async created(){
   this.init()
  }

  async init() {
    this.uploadFileList = [];
    this.formData.data.attachment = [];
    this.getReplyType();
    const config = await sheetConfig({sheetCode:"XTSJ_zysjtg",schemaCode:"XTSJ_zysjtg"});
    if(typeof config ==="string"){
      return this.$message.error(`获取专业任务提纲初始配置失败,${config}`);
    }
    this.formData.sheetConfig =  config;
    this.getProfessionalDesignOutline();
  }

  async mounted(){
    //专业名称Options
    const options = await professionNameOptions({appCode:this.appCode});
    this.professionOptions = options?.map((option,index)=>{
      return {
        value:option,
        label:option,
        key:index
      }
    })??[];
    this.$nextTick(()=>{
      this.form.clearValidate([]);
    });
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
        this.formData.data.profession_name = data.profession_name;
        this.formData.data.profession_person = data.profession_manager;
        this.formData.data.modelType = data.modelType;
        this.formData.data.engineeringType = data.engineeringType;
        this.formData.data.project_manager = data.project_manager;
        this.formData.data.xmlb_id = data.xmlb_id;
        this.formData.data.manufacturer_chief = data.manufacturer_chief_engineer;
        this.formData.data.company_chief = data.company_chief_engineer;
        this.formData.data.engineeringType = data.engineeringType;
        this.getModelTypeConfig('XTSJ_field_mapping','XTSJ_zysjtg')
      }
    })
  }

  async getProfessionalDesignOutline(){
    const {appCode,projectId,zyrwdId:zysjtgId,isCreate}=this;
    try {
      let workflowInstanceId = "";
      let workItemId = "";
      const res = isCreate? await CreatePermissions({appCode,projectId,zyrwdId:zysjtgId}) : await QuerryPermissions({appCode,projectId,zysjtgId});
      if(res.errcode){
        return this.$message.error(`获取专业任务提纲失败,${res.errmsg}`);
      }
      if(!isCreate){
        const { data } =  res;
        workflowInstanceId = data!.workflowInstanceId;
        workItemId = data!.workItemId;
        this.workOutlineDataId = data?.id??''
      }
      //@ts-ignore
      const { errcode,errmsg,data } = isCreate? await loadSheetData<LoadData>({startWorkflowCode:"XTSJ_zysjtg_workflow",fieldParam1:this.$route.query.id}) : await loadSheetData<LoadData>({workflowInstanceId,workitemId:workItemId,fieldParam1:this.$route.query.id})
      if(errcode){
        return this.$message.error(`获取专业任务提纲失败,${errmsg}`);
      }
      this.formData.data = {
        id:data?.bizObject.id,
        workflowTokenId:data?.workflowTokenId??null,
        workItemId:data?.workItemId??null,
        workflowInstanceId:data?.workflowInstanceId,
        zyrwd_id:data?.bizObject.data?.zyrwd_id??{},
        xmlb_id:data?.bizObject.data?.xmlb_id??{},
        activityCode:data?.activityCode,
        activityName:data?.activityName,
        rejectToActivityCode:res.data?.rejectToActivityCode,

        attachment:data?.bizObject.data.attachment??[],
        XTSJ_profession_para: data?.bizObject.data.XTSJ_profession_para??[],
        company_chief: data?.bizObject.data.company_chief,
        company_chief_engineer_flag: data?.bizObject.data.company_chief_engineer_flag,
        engineering_location:data?.bizObject.data.engineering_location,
        engineering_name: data?.bizObject.data.engineering_name,
        engineering_number:data?.bizObject.data.engineering_number,
        engineering_stage: data?.bizObject.data.engineering_stage,
        industryType:data?.bizObject.data.industryType,
        manufacturer:data?.bizObject.data.manufacturer??null,
        manufacturer_chief: data?.bizObject.data.manufacturer_chief,
        outline_auditor: data?.bizObject.data.outline_auditor,
        profession_name: data?.bizObject.data.profession_name?data?.bizObject.data.profession_name:undefined,
        profession_person: data?.bizObject.data.profession_person,
        modelType: data?.bizObject.data.modelType??'',
        engineeringType: data?.bizObject.data.engineeringType??'',
        projectType:data?.bizObject.data.projectType,
        project_level :data?.bizObject.data.project_level,
        project_manager: data?.bizObject.data.project_manager,
        read_designer: data?.bizObject.data.read_designer,
        task_type : data?.bizObject.data.task_type,
        submitButton:res.data?.submitButton,
        retainButton:res.data?.retainButton,
        agreeButton:res.data?.agreeButton,
        rejectButton:res.data?.rejectButton,
      }
      //新增专业设计提纲-带入工作大纲已填字段  新增？判断
      if(this.isCreate) {
        this.listSkipQueryList();
      }else {
        this.getModelTypeConfig('XTSJ_field_mapping','XTSJ_zysjtg')
      }
      //@ts-ignore
      if(Array.isArray(data.logInfoList) && data.logInfoList.length) {
        //@ts-ignore
        this.activityCode = data.logInfoList[data.logInfoList.length-1].activityCode;
      }
      this.approvalKey++;
      this.uploadFileList=(this.formData.data.attachment as {onlinePrewView:string,id:string,name:string}[]).map(item=>{
        return {
          uid:item.id,
          name:item.name,
          status:"done",
          response:item,
          url: item.onlinePrewView,
        }
      });

      this.updateSheetConfig(isCreate,data as SheetData<LoadData>);

      if(isCreate){
        this.formData.data.engineering_name = res.data?.engineeringName;
        this.formData.data.engineering_stage =res.data?.engineeringStage;
      }
      //创建数据校验规则
      this.createRules();
      //更新节点信息
      if(this.formData.data.workflowInstanceId){
        await this.getWorkflowBaseInfo(this.formData.data.workflowInstanceId as string);
        this.calcUsedTime();
      }
    } catch (error) {
      return this.$message.error(`获取专业任务提纲异常,${error}`)
    }
  }

  isUploading=false;
  uploadFileList:any[]=[];

  commonReplys:any={};//常用回复语

  back(){
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
    })
    // this.$router.back();
  }

  /*选中常用语*/
  tagChange(item){
    this.dialogTaskForm.formData.comment=item;
  }

  actionButtonClick(item:{visibleKey:string,name:string,showComment:boolean}){
    this.commonReplys=null;
    if(this.replyType.includes(item.name)){
      getCommonReplys({
        appCode:this.appCode??'',
        schemaCode:this.appCode+'_zysjtg',
        type:item.name
      })
        .then(res=>{
          if(res.errcode!==0) return this.$message.error(res.errmsg as string);
          if(!res.data) return;
          this.commonReplys=res.data;
        })
    }
    this.dialogModalConfiguration.visible=true,
    this.dialogModalConfiguration.actionCode=item.visibleKey as 'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',
    this.dialogModalConfiguration.okText=item.name;
    this.dialogModalConfiguration.showComment=item.showComment;
    this.dialogModalConfiguration.title=`确认${item.name}此生产任务单`
    if(item.visibleKey==="receiveButton"){
      this.dialogTaskForm.formData.comment="接收任务";
    }
  }
  /* 提交,暂存.接收,同意,驳回Form配置 */
  dialogTaskForm:{formData:{comment:string},rules:{[key:string]:(ValidationRule|{trigger:'blur' | 'change' | ['change', 'blur']})[]}} = {
    formData:{
      comment: ""
    },
    rules:{
      comment: [
        {required: true,message: "请输入意见/建议",trigger: ["change", "blur"],},
      ],
    }
  }

  /*  提交,暂存.接收,同意,驳回弹窗配置 */
  dialogModalConfiguration:ModalConfiguration={
    visible:false,
    okText:"",
    confirmLoading:false,
    title:"",
    actionCode:'submitButton',
    showComment:false,
    OK:()=>{
      const {actionCode,showComment} = this.dialogModalConfiguration
      this.actions(actionCode,showComment);
    },
    afterClose:()=>{
      this.dialogTaskForm.formData.comment="";
    }
  }

  getBizObjectData(id:string):BizObject{
    const { formData:{data:formData} } = this;
    return{
      id:formData.id??id,
      data:{
        attachment: formData.attachment??null,
        XTSJ_profession_para: formData.XTSJ_profession_para??[],
        company_chief: formData.company_chief??null,
        company_chief_engineer_flag: formData.company_chief_engineer_flag??null,
        engineering_location:formData.engineering_location??null,
        engineering_name: formData.engineering_name??null,
        engineering_number:formData.engineering_number??null,
        engineering_stage: formData.engineering_stage??null,
        industryType:formData.industryType??null,
        manufacturer: formData.manufacturer??null,
        manufacturer_chief: formData.manufacturer_chief??null,
        outline_auditor: formData.outline_auditor??null,
        profession_name: formData.profession_name??null,
        profession_person: formData.profession_person??null,
        modelType: formData.modelType??'',
        engineeringType: formData.engineeringType??'',
        projectType:formData.projectType??null,
        project_level: formData.project_level??null,
        project_manager: formData.project_manager??null,
        read_designer: formData.read_designer??null,
        task_type: formData.task_type??null,
        zyrwd_id:formData.zyrwd_id?.id??'',
        xmlb_id:formData?.xmlb_id?.id??'',
        id:formData.id??id,
      },
      schemaCode:"XTSJ_zysjtg",
      sheetCode:"XTSJ_zysjtg",
      workflowInstanceId:formData.workflowInstanceId??null,
    }
  }

  async actions(actionCode:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',showComment:boolean){
    this.dialogModalConfiguration.confirmLoading=true;
    const {userInfo,formData,getBizObjectData} = this;
    const {departmentId} = userInfo;
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
        const productionForm =  this.form;
        let validde = false;
        let errorFields:{[key:string]:{message:string,field:string}[]}={};
        productionForm.validate((valid,fields)=>{
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
      const id =await UUID();
      if(!id) return this.$message.error("获取UUID失败");
      let res:HttpResponse<any>;
      const bizObject = getBizObjectData(id);
      if(actionCode==='retainButton'){
        res = await save({
          workItemId:formData.data.workItemId??null,
          workflowInstanceId:formData.data.workflowInstanceId??null,
          bizObject,
          departmentId,
          replayToken:token,
          workflowCode:"XTSJ_zysjtg_workflow"
        });
      }else if(actionCode==="submitButton"){
        res = await submit({
          workItemId:formData.data.workItemId??null,
          workflowInstanceId:formData.data.workflowInstanceId??null,
          bizObject,
          departmentId,
          replayToken:token,
          workflowCode:"XTSJ_zysjtg_workflow"
        });
      }else if(actionCode==="agreeButton"||actionCode==="receiveButton"){
        const approval= {
          content: this.dialogTaskForm.formData.comment,
          workItemId: formData.data.workItemId as string,
          workflowInstanceId: formData.data.workflowInstanceId as string,
          workflowTokenId: formData.data.workflowTokenId as string,
          activityCode: formData.data.activityCode as string,
          activityName: formData.data.activityName as string,
          result: 1 as 1,
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
          workflowCode:"XTSJ_zysjtg_workflow",
          rejectToActivityCode:formData.data.rejectToActivityCode as string,
        });
      }
      const { errcode,errmsg,data} = res!;
      if(errcode){
        return this.$message.error(`${this.dialogModalConfiguration.okText}失败,${errmsg}`);
      }
      this.$message.success(`${this.dialogModalConfiguration.okText}成功`);
      this.dialogModalConfiguration.visible=false;
      // this.back();
      if (this.isCreate) {
        this.back();
      }else {
        this.init();
      }
    } catch (error) {
      this.$message.error(`${this.dialogModalConfiguration.okText}异常,${error}`);
    }finally{
      this.dialogModalConfiguration.confirmLoading=false;
      this.dialogModalConfiguration.visible=false;
    }
  }

  //#region 上传附件相关
  /* 上传附件相关 */
  upload={
    name:"file",
    multiple:true,
    action:`${env.apiHost}/api/aliyun/upload`,
    headers:{Authorization: 'Bearer ' + localStorage.token},
    showUploadList:false,
    beforeUpload:(file:File)=>{
      return new Promise((resolve,rejectFile)=>{
        const isLt100M = file.size / 1024 / 1024 <= 100;
        if (!isLt100M) {
          this.$message.error("只能上传不大于100M的文件");
          return rejectFile(false);
        }
        return resolve(true);
      });
    },
    change:(info,formDataKey,loadingKey)=>this.change(info,formDataKey,loadingKey),
  };

  change(info,formDataKey:string,loadingKey:string){
    if (info.file.status === 'uploading'){
      this[loadingKey]=true;
    }else if (info.file.status === 'done'){
      this[loadingKey]=false;
      if(this.formData.data[formDataKey]){
        this.formData.data[formDataKey].push({...info.file.response.data,creater:this.userInfo});
      }else{
        this.$set(this.formData.data,formDataKey,[{...info.file.response.data,creater:this.userInfo}]);
      }
    } else if(info.file.status==="error"){
      this[loadingKey]=false;
      this.$message.error(`上传文件[${info.file.name}]失败`);
    }
    else{
      this[loadingKey]=false;
      this.$message.error(`上传文件[${info.file.name}]失败,未知错误`);
    }
  }
  removeFile(files:any[],index:number){
    files.splice(index,1);
  }

  uploadAcceptFileTypes=[
    "text/plain",//.txt
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",//.xlsx
    "application/vnd.ms-excel",//xls
  ]

  beforeUpload(file:File){
    // const isAcceptFileType = this.uploadAcceptFileTypes.includes(file.type);
    // if(!isAcceptFileType){
    //   this.$message.error("只能上传文本文件(.txt)和Excel文件(.xls,.xlsx)");
    // }
    const isLt5M = file.size / 1024 / 1024 <= 100;
    if (!isLt5M) {
      this.$message.error("只能上传不大于100M的文件");
    }
    return isLt5M;
  }

  // removeFile(file){
  //   this.uploadFileList=this.uploadFileList.filter(item=>item.uid!==file.uid);
  //   this.formData.data.attachment=this.formData.data.attachment.filter(item=>item.refId!==file.response.refId);
  // }

  async customUploadFile(options){
    const {file,onError,onProgress,onSuccess} = options;
    this.isUploading=true;
    try {
      const {errcode,errmsg,data} = await uploadFile({files:{"file":file}});
      if(errcode){
        return this.$message.error(`上传文件[${file.name}]失败,${errmsg}`);
      }
      this.uploadFileList.push(file);
      this.formData.data.attachment.push(data);
      onSuccess(data);
    } catch (error) {
      onError(error);
    }
    finally{
      this.isUploading=false;
    }
  }
  //#endregion
  //TODO 合成专业任务提纲
  activityCode: string = '';//控制合成按钮显影
  workOutlineDataId: string = '';
  modalTitle: string = '专业提纲制作区';
  okText: string = '保存';
  showEditWorkOutlinePanel: boolean = false;
  mergeLoading: boolean = false;
  async createWorkOutlineFile() {
    this.mergeLoading = true;
    const token = await replayToken();
    if(!token) return this.$message.error("获取replayToken失败");
    const id =await UUID();
    if(!id) return this.$message.error("获取UUID失败");
    const bizObject = this.getBizObjectData(id);
    const {userInfo:{departmentId},formData} = this;
    save({
      workItemId:formData.data.workItemId??null,
      workflowInstanceId:formData.data.workflowInstanceId??null,
      bizObject,
      departmentId,
      replayToken:token,
      workflowCode:"XTSJ_zysjtg_workflow"
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      mergeProfessionePara({
        appCode: this.appCode??'',
        professionOutlineId: this.workOutlineDataId
      }).then((r)=> {
        if(r.errcode!==0) return this.$message.error(r.errmsg as string)
        if(!r.data) return;
        this.$message.success('合成章节成功！');
        this.formData.data.attachment.push(JSON.parse(JSON.stringify(Object.assign(r.data,{ creater:this.userInfo }))));
      }).finally(()=> {
        this.mergeLoading = false
      })
    });

  }
  selectWorkOutlineFile: WorkOutlineModel = {
    id: '',
    editorUrl: '',
    fileName: '',
    tmpFileName: '',
    refId: '',
    workOutline: '',
    fileType: '',
    bussiness: '',
    projectType: '',
    projectState: '',
    professionType: '',
    defaultTitle: ''
  }
  currentSelectedId: string = '';
  currentSelectedRefId: string = '';
  designParaKey: number =1;
  editFile(refId:string,id:string,flag:string,title?:string) {
    this.flag = flag;
    createOnlineWebFile({
      refId: refId,
      schemaCode: `${this.appCode}_zysjtg`,
      id:  this.formData.data?.id??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      if(!res.data.editorUrl){
        this.$message.warning('改文档暂无可编辑地址！')
      }else {
        this.currentSelectedId = id;
        this.currentSelectedRefId = refId;
        for (const selectDesignFileKey in this.selectWorkOutlineFile) {
          this.selectWorkOutlineFile[selectDesignFileKey] = res.data[selectDesignFileKey]
        }
        this.selectWorkOutlineFile.defaultTitle = title as string
        this.showEditWorkOutlinePanel = true;
      }
    })
  }
  //待添加附件
  temFile: YunAttachmentFile = {
    id: '',
    bizObjectId: '',
    bizPropertyCode: '',
    createdTime: '',
    creater: '',
    fileExtension: '',
    fileSize: 0,
    base64ImageStr: '',
    mimeType: 1,
    name: '',
    parentBizObjectId: '',
    parentSchemaCode: '',
    refId: '',
    schemaCode: '',
    onlinePrewView: '',
    download: '',
    engineProjectId:'',
    engineModelId: '',
    engineFileName: '',
  }
  saveEditFile() {
    if(this.selectWorkOutlineFile.fileName) {
      saveOnlineWebFile({
        fileName: this.selectWorkOutlineFile?.fileName??'',
        tmpFileName: this.selectWorkOutlineFile?.tmpFileName??''
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg as string)
        if(!res.data) return;
        for (const temFileKey in this.temFile) {
          this.temFile[temFileKey] = res.data[temFileKey]
        }
        Object.assign(this.temFile,{ creater:this.userInfo,createdTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss") });
        this.$message.success('保存成功！')
      })
    }
  }
  extendBtnText: string = '确认';
  showExtendButton: boolean = true;
  flag: string = '';//'total/sub'
  extendFn() {
    if(!this.temFile.refId) return this.showEditWorkOutlinePanel = false;
    //新增-大纲附件/子表章节附件
    if(this.flag==='total') {
      this.formData.data.attachment.splice(this.formData.data.attachment.findIndex((i)=> i.id===this.currentSelectedId),1,JSON.parse(JSON.stringify(this.temFile)))
      // this.formData.data.attachment.push(JSON.parse(JSON.stringify(this.temFile)));
    }else if(this.flag==='sub'){
      this.formData.data.XTSJ_profession_para.map((att) => {
        if(att.id===this.currentSelectedId) {
          if(!att.attach) {
            att.attach = []
          }
          att.attach.splice(att.attach.findIndex((i)=> i.refId===this.currentSelectedRefId),1,JSON.parse(JSON.stringify(this.temFile)))
          // att.attach.push(JSON.parse(JSON.stringify(this.temFile)))
        }
      })
    }
    this.showEditWorkOutlinePanel = false;
    this.temFile = {
      id: '',
      bizObjectId: '',
      bizPropertyCode: '',
      createdTime: '',
      creater: '',
      fileExtension: '',
      fileSize: 0,
      base64ImageStr: '',
      mimeType: 1,
      name: '',
      parentBizObjectId: '',
      parentSchemaCode: '',
      refId: '',
      schemaCode: '',
      onlinePrewView: '',
      download: '',
      engineProjectId:'',
      engineModelId: '',
      engineFileName: '',
    };
    this.flag = '';
    this.currentSelectedId = '';
    this.currentSelectedRefId = '';
  }
  closeEditWorkOutlinePanel() {
    delOnlineWebFile({
      tmpFileName: this.selectWorkOutlineFile?.tmpFileName??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
    }).finally(()=> {
      this.showEditWorkOutlinePanel = false;
      this.selectWorkOutlineFile.fileType = '';
      this.selectWorkOutlineFile.bussiness = '';
      this.selectWorkOutlineFile.projectType = '';
      this.selectWorkOutlineFile.projectState = '';
      this.selectWorkOutlineFile.professionType = '';
      this.selectWorkOutlineFile.defaultTitle = '';
      this.selectWorkOutlineFile.fileName = '';
      this.selectWorkOutlineFile.tmpFileName = '';
      this.flag = '';
      this.currentSelectedId = '';
      this.currentSelectedRefId = '';
    })
  }
  removeParaFile(attId:string,subAttId:string) {
    this.formData.data.XTSJ_profession_para.map((att) => {
      if(att.id===attId) {
        att.attach.splice(att.attach.findIndex((subAtt)=> { return subAtt.id===subAttId}),1)
      }
    })
  }
  // 大纲章节
  workOutlineChapterData:WorkOutlineChapter[]=[];
  workOutlineChapterColumns: TableColumn<any>[] = [
    {
      title: '序号',
      dataIndex: 'sortNum',
      key: 'sortNum',
      align: 'center',
      width: 120
    },
    {
      title: '章节标题',
      dataIndex: 'title',
      key: 'title',
      width: 500
    },
    {
      title: '章节模板',
      dataIndex: 'attach',
      key: 'attach',
      scopedSlots: { customRender: 'attach' }
    }
  ]
  uploadFile(id:string) { //chapterFileInput
    this.currentSelectedId = id;
    const {$refs} = this;
    if ($refs.chapterFileInput) {
      ($refs.chapterFileInput as HTMLInputElement).click();
    }
  }
  fileKey: number = 1;
  chapterFileInput(e) {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const fileFormat = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      if (["docx"].indexOf(fileFormat) === -1) return this.$message.error("只能上传*.docx的文件!");
      const formData = new FormData();
      formData.append("file", file);
      yunFileUpload(formData).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success("文件上传成功");
        this.formData.data.XTSJ_profession_para.map((att) => {
          if(att.id===this.currentSelectedId) {
            if(!att.attach) {
              att.attach = []
            }
            att.attach.push(JSON.parse(JSON.stringify(res.data)))
          }
        })
      }).finally(()=> {
        this.fileKey++;
      });
    }
  }
  download(item) {
    window.open(`${env.apiHost}/api/aliyun/download?refId=${item.refId}`)
  };
  get isEditOutlineWork() {
    return this.formData.data.submitButton || this.formData.data.retainButton || this.formData.data.receiveButton || this.formData.data.agreeButton || this.formData.data.rejectButton
  }

  goDetail(item) {
    if (item.name.indexOf('.txt')>-1 || item.name.indexOf('.TXT')>-1) {
      window.open(sessionStorage.getItem('previewUrl')?`${sessionStorage.getItem('previewUrl')}?url=${window.config.apiHost}/api/aliyun/download?refId=${item.refId}=name=${item.name}`:`http://10.20.90.213:8012/onlinePreview?url=https://collaborativedesign.ctesi.com.cn/api/api/aliyun/download?refId=${item.refId}=name=${item.name}`)
    }else {
      getDecryptFile({
        appCode: this.projectCode??'',
        refId: item.refId,
        fileName: item.name
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg as string)
        if(!res.data) return;
        window.open(`${sessionStorage.getItem('previewUrl')}?url=${res.data.indexOf('&name=')>-1?res.data.replace('&name=','=name='):res.data}`)
      })
    }
    // window.open(sessionStorage.getItem('previewUrl')?`${sessionStorage.getItem('previewUrl')}?url=${window.config.apiHost}/api/aliyun/download?refId=${item.refId}=name=${item.name}`:`http://10.20.90.213:8012/onlinePreview?url=https://collaborativedesign.ctesi.com.cn/api/api/aliyun/download?refId=${item.refId}=name=${item.name}`)
  }
}
