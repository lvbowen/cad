import { Component, Mixins, InjectReactive ,Prop,Watch ,VModel ,Ref} from 'vue-property-decorator';
import { CommonMixins } from "../../../commonMixins";
import { Input,Radio,DatePicker,FormModel,Modal} from "@h3/antd-vue";
import { ValidationRule } from '@h3/antd-vue/types/form-model/form';
import moment,{Moment} from "moment"
import { listApi } from "@cloudpivot/api";
import {UUID,replayToken,submit,save,agree,reject,loadSheetData,sheetConfig, SheetConfig, SheetData} from "../../../../../../service/CoordinateDesign/common";
import {createDesignTask,BizObject,getDesignTaskAchievementCode} from "../../../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignTask";
import {HttpResponse} from "@cloudpivot/api/src/response";
import {workflowInstanceFlag} from "../../../../../../service/CoordinateDesign/WorkingOutline/ProductionTaskList";
type ModalConfiguration={visible:boolean,actionCode:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',showComment:boolean,title?:string,okText?:string,confirmLoading?:boolean,OK?:()=>void,afterClose?:()=>void};
type selectorOption = { id:string,name:string,type:number };
import {designTaskMapping} from "../../../../publicConfig";
import Utils from "../../../../../../utils";
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import InputNumber from 'ant-design-vue/lib/input-number';
import 'ant-design-vue/lib/input-number/style/index.css';
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
  profession_task_name:string|undefined|null,
  engineering_name: string|undefined|null,
  manufacturer:selectorOption[]|undefined|null,
  profession_name:string|undefined|null,
  use_software_name:string|undefined|null,
  proofread_level:string|undefined|null,
  design_guider_flag:string|undefined|null,
  countersign_flag:string|undefined|null,
  project_manager_audit:string|undefined|null,
  designer:selectorOption[]|undefined|null,
  design_guider:selectorOption[]|undefined|null,
  partners:selectorOption[]|undefined|null,
  checker:selectorOption[]|undefined|null,
  auditor:selectorOption[]|undefined|null,
  project_manager:selectorOption[]|undefined|null,
  countersigned:selectorOption[]|undefined|null,
  department_chief:selectorOption[]|undefined|null,
  company_chief:selectorOption[]|undefined|null,
  task_time:string|undefined|null,
  plan_duration:string|undefined|number|null,
  plan_end_time:string|undefined|null,
  plan_start_time:string|undefined|null,
  engineering_stage:string|undefined|null,
  industryType: string|undefined|null,
  projectType:string|undefined|null,
  task_type:string|undefined|null,
  project_level:string|undefined|null,
  engineering_location:string|undefined|null,
  engineering_number:string|undefined|null,
  profession:selectorOption[]|undefined|null,
  modelType: string,
  engineeringType: string;
  achievement_number: string;
  task_number: string;
  fieldParam1?: string;
  projectId?: string;
}& Data;
@Component({
  name:"CreateDesignTask",
  components:{
    [Input.name]:Input,
    Atextarea: Input.TextArea,
    [Radio.name]:Radio,
    [Radio.Group.name]:Radio.Group,
    [DatePicker.name]:DatePicker,
    [FormModel.name]:FormModel,
    [FormModel.Item.name]:FormModel.Item,
    [Modal.name]:Modal,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    AInputNumber: InputNumber,
  }
})
export default class CreateDesignTask extends Mixins(CommonMixins) {
  @InjectReactive("project") appCode!: string;
  @Prop({required:true}) projectId!:string;
  @Prop({required:true}) sjrwdId!:string;
  @VModel({type:Boolean}) createDesignTaskVisible!:boolean;
  @Ref("productionForm") productionForm!:FormModel;
  @Ref("dialogForm") dialogForm!:FormModel;
  @Prop() renderFormData!:any;
  confirmLoading=false;

  rightButtonLinks=[
    {name:"提交",type:"primary",visibleKey:"submitButton",showComment:false},
    {name:"暂存",type:"primary",visibleKey:"retainButton",showComment:false},
    {name:"接收",type:"primary",visibleKey:"receiveButton",showComment:false},
    {name:"同意",type:"primary",visibleKey:"agreeButton",showComment:true},
    {name:"驳回",type:"primary",visibleKey:"rejectButton",showComment:true},
  ]

  actionButtonClick(item:{visibleKey:string,name:string,showComment:boolean}){
    this.dialogModalConfiguration.visible=true,
    this.dialogModalConfiguration.actionCode=item.visibleKey as 'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',
    this.dialogModalConfiguration.okText=item.name;
    this.dialogModalConfiguration.showComment=item.showComment;
    this.dialogModalConfiguration.title=`确认${item.name}此设计任务单`
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
      company_chief:undefined,
      countersign_flag:undefined,
      countersigned:undefined,
      department_chief:undefined,
      design_guider:undefined,
      design_guider_flag:undefined,
      designer:undefined,
      engineering_name: undefined,
      achievement_number: '',
      task_number: '',
      manufacturer:undefined,
      partners:undefined,
      plan_duration:undefined,
      plan_end_time:undefined,
      plan_start_time:undefined,
      profession_name:undefined,
      profession_task_name:undefined,
      project_manager:undefined,
      project_manager_audit:undefined,
      proofread_level:'',
      task_time:undefined,
      use_software_name:undefined,
      engineering_stage:undefined,
      industryType: undefined,
      projectType:undefined,
      task_type:undefined,
      project_level:undefined,
      engineering_location:undefined,
      engineering_number:undefined,
      profession:undefined,
      xmlb_id: {},
      zyrwd_id:{},
      modelType: '',
      engineeringType: '',
      fieldParam1: '',
      projectId: ''
    },
    rules:{},
    sheetConfig:{},
    optionsWatch:{},
    options:{},
  }

  async created(){
    const config = await sheetConfig({sheetCode:"XTSJ_sjrwd",schemaCode:"XTSJ_sjrwd"});
    if(typeof config ==="string"){
      return this.$message.error(`获取设计任务单初始配置失败,${config}`);
    }
    this.formData.sheetConfig =  config;
    // this.getDesignTask();
  }

  /* 获取或创建设计任务单 */
  async getDesignTask(){
    const {appCode,projectId,sjrwdId}=this;
    try {
      const res = await createDesignTask({appCode,projectId,zyrwdId:sjrwdId});
      if(res.errcode){
        return this.$message.error(`获取设计任务单失败,${res.errmsg}`);
      }
      const { errcode,errmsg,data } =  await loadSheetData<LoadData>({startWorkflowCode:"XTSJ_sjrwd_workflow"});
      if(errcode){
        return this.$message.error(`获取设计任务单失败,${errmsg}`);
      }
      this.formData.data = {
        id:data?.bizObject.id,
        workflowTokenId:data?.workflowTokenId??null,
        workItemId:data?.workItemId??null,
        workflowInstanceId:data?.workflowInstanceId,
        activityCode:data?.activityCode,
        activityName:data?.activityName,
        zyrwd_id:data?.bizObject.data?.zyrwd_id??{},
        xmlb_id:data?.bizObject.data?.xmlb_id??{},
        rejectToActivityCode:res.data?.rejectToActivityCode,

        auditor:this.isUpdateDesignTask?this.formData.data.auditor:data?.bizObject.data.auditor??null,
        checker:this.isUpdateDesignTask?this.formData.data.checker:data?.bizObject.data.checker??null,
        company_chief:this.isUpdateDesignTask?this.formData.data.company_chief:data?.bizObject.data.company_chief??null,
        countersign_flag:this.isUpdateDesignTask?this.formData.data.countersign_flag:data?.bizObject.data.countersign_flag,
        countersigned:this.isUpdateDesignTask?this.formData.data.countersigned:data?.bizObject.data.countersigned??null,
        department_chief:this.isUpdateDesignTask?this.formData.data.department_chief:data?.bizObject.data.department_chief??null,
        design_guider:this.isUpdateDesignTask?this.formData.data.design_guider:data?.bizObject.data.design_guider??null,
        design_guider_flag:this.isUpdateDesignTask? this.formData.data?.design_guider_flag:data?.bizObject.data.design_guider_flag,
        designer:this.isUpdateDesignTask?this.formData.data.designer:data?.bizObject.data.designer??null,
        engineering_name:data?.bizObject.data.engineering_name,
        achievement_number: data?.bizObject.data.achievement_number??'',
        task_number: this.isUpdateDesignTask?this.formData.data.task_number:data?.bizObject.data.task_number??'',
        manufacturer:data?.bizObject.data.manufacturer??null,
        partners:data?.bizObject.data.partners??null,
        plan_duration:this.isUpdateDesignTask?this.formData.data.plan_duration:data?.bizObject.data.plan_duration??undefined,
        plan_end_time:this.isUpdateDesignTask?this.formData.data.plan_end_time:data?.bizObject.data.plan_end_time??undefined,
        plan_start_time:this.isUpdateDesignTask?this.formData.data.plan_start_time:data?.bizObject.data.plan_start_time??undefined,
        profession_name:data?.bizObject.data.profession_name,
        profession_task_name:this.isUpdateDesignTask?this.formData.data.profession_task_name:data?.bizObject.data.profession_task_name,
        project_manager:this.isUpdateDesignTask?this.formData.data.project_manager:data?.bizObject.data.project_manager??null,
        project_manager_audit:this.isUpdateDesignTask?this.formData.data.project_manager_audit:data?.bizObject.data.project_manager_audit,
        proofread_level:this.isUpdateDesignTask?this.formData.data.proofread_level:data?.bizObject.data.proofread_level??'',
        task_time:data?.bizObject.data.task_time??undefined,
        use_software_name:data?.bizObject.data.use_software_name,
        engineering_stage: data?.bizObject.data.engineering_stage,
        industryType: data?.bizObject.data.industryType,
        projectType:data?.bizObject.data.projectType,
        task_type:this.isUpdateDesignTask?this.formData.data.task_type:data?.bizObject.data.task_type,
        project_level:data?.bizObject.data.project_level,
        engineering_location:data?.bizObject.data.engineering_location??null,
        engineering_number:data?.bizObject.data.engineering_number,
        modelType: data?.bizObject.data.modelType??'',
        engineeringType: data?.bizObject.data.engineeringType??'',
        profession:null,
        // proofread_flag: this.isUpdateDesignTask?this.formData.data.proofread_flag:data?.bizObject.data.proofread_flag,
        submitButton:this.isUpdateDesignTask?false:res.data?.submitButton,
        retainButton:this.isUpdateDesignTask?false:res.data?.retainButton,
        agreeButton:this.isUpdateDesignTask?false:res.data?.agreeButton,
        rejectButton:this.isUpdateDesignTask?false:res.data?.rejectButton,
        receiveButton:this.isUpdateDesignTask?false:res.data?.receiveButton,
      };
      this.formData.data.profession = [{id:this.userInfo.id,type:this.userInfo.unitType,name:this.userInfo.name}];
      this.listSkipQueryList();
      //新增专业设计提纲-带入工作大纲已填字段  新增？判断
      this.updateSheetConfig(true,data as SheetData<LoadData>,!!this.isUpdateDesignTask);
      //创建数据校验规则
      this.createRules();
      setTimeout(()=> {
        console.log(this.formData.data)
      },2000)
    } catch (error) {
      this.$message.error(`获取设计任务单异常,${error}`);
    }
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
          "propertyValue": this.sjrwdId
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
        this.isUpdateDesignTask?'':this.formData.data.project_manager = data.project_manager;
        this.formData.data.xmlb_id = data.xmlb_id;
        this.formData.data.fieldParam1 = res.data.content[0].id;
        this.formData.data.projectId = data.xmlb_id.id;
        // this.formData.data.manufacturer_chief = data.manufacturer_chief_engineer;

        this.isUpdateDesignTask?'':this.formData.data.company_chief = data.company_chief_engineer
        this.isUpdateDesignTask?'':this.formData.data.auditor = data.profession_manager;
        this.isUpdateDesignTask?'':this.formData.data.plan_start_time = data.plan_start_time;
        this.isUpdateDesignTask?'':this.formData.data.plan_end_time = data.plan_end_time;
        this.isUpdateDesignTask?'':this.formData.data.plan_duration = data.plan_duration;
        this.isUpdateDesignTask?'':this.formData.data.department_chief = data.manufacturer_chief_engineer;
        this.formData.data.engineeringType = data.engineeringType;
        this.formData.data.modelType = data.modelType;
        this.getModelTypeConfig('XTSJ_field_mapping','XTSJ_sjrwd');
      }
    })
  }

  addDesignTask(){
    this.confirmLoading=true;
    let validde = false;
    let errorFields:{[key:string]:{message:string,field:string}[]}={};
    this.productionForm.validate((valid,fields)=>{
      validde = valid;
      errorFields = fields as {[key:string]:{message:string,field:string}[]};
      if(!valid){
        return false;
      }
    })
    if(!validde){
      this.confirmLoading=false;
      for (const key in errorFields) {
        if (Object.prototype.hasOwnProperty.call(errorFields, key)) {
          const element = errorFields[key];
          this.$message.error(`${element[0].message}`);
          break;
        }
      }
      return;
    }
    this.$emit("batchModify",this.formData.data)
  }

  afterClose(){
    this.formData.data = {
      id:undefined,
      workItemId:undefined,
      workflowTokenId:undefined,
      workflowInstanceId:undefined,
      rejectToActivityCode:undefined,

      auditor:undefined,
      checker:undefined,
      company_chief:undefined,
      countersign_flag:undefined,
      countersigned:undefined,
      department_chief:undefined,
      design_guider:undefined,
      design_guider_flag:undefined,
      designer:undefined,
      engineering_name: undefined,
      achievement_number: '',
      task_number: '',
      manufacturer:undefined,
      partners:undefined,
      plan_duration:undefined,
      plan_end_time:undefined,
      plan_start_time:undefined,
      profession_name:undefined,
      profession_task_name:undefined,
      project_manager:undefined,
      project_manager_audit:undefined,
      proofread_level:'',
      task_time:undefined,
      use_software_name:undefined,
      engineering_stage:undefined,
      industryType: undefined,
      projectType:undefined,
      task_type:undefined,
      project_level:undefined,
      engineering_location:undefined,
      engineering_number:undefined,
      profession:undefined,
      xmlb_id: {},
      zyrwd_id:{},
      modelType: '',
      engineeringType: ''
    }
    this.createDesignTaskVisible = false;
    this.$emit('closeAddDesignModal')
  }

  getBizObjectData(id:string):BizObject{
    const { formData:{data:formData} } = this;
    return{
      id:formData.id??id,
      //@ts-ignore
      data:{
        auditor:formData.auditor??null,
        checker:formData.checker??null,
        chief_engineer:null,
        collaborate_flag:null,
        company_chief:formData.company_chief??null,
        company_chief_engineer:null,
        company_manager:null,
        countersign_flag:formData.countersign_flag??null,
        countersigned:formData.countersigned??null,
        currentStatus: null,
        department_chief:formData.department_chief??null,
        design_guider:formData.design_guider??null,
        design_guider_flag:formData.design_guider_flag??null,
        designer:formData.designer??null,
        engineering_location:formData.engineering_location??null,
        engineering_name:formData.engineering_name??null,
        achievement_number: formData.achievement_number??'',
        task_number: formData.task_number??'',
        engineering_number:formData.engineering_number??null,
        engineering_stage: formData.engineering_stage??null,
        industryType: formData.industryType??null,
        manufacturer:formData.manufacturer??null,
        manufacturer_chief_engineer:null,
        manufacturer_vice_engineer:null,
        manufacturer_vice_manager:null,
        partners:formData.partners??null,
        plan_duration:formData.plan_duration??null,
        plan_end_time:formData.plan_end_time??null,
        plan_start_time:formData.plan_start_time??null,
        profession:formData.profession??null,
        profession_name:formData.profession_name??null,
        fieldParam1:formData.fieldParam1??'',
        projectId:formData.projectId??'',
        profession_task_name:formData.profession_task_name??null,
        projectType:formData.projectType??null,
        project_level:formData.project_level??null,
        project_manager:formData.project_manager??null,
        project_manager_audit:formData.project_manager_audit??null,
        proofread_flag:null,
        proofread_level:formData.proofread_level??'',
        sign_subject:null,
        signed_person:null,
        signer:null,
        task_ratio:null,
        task_time:formData.task_time??null,
        task_type:formData.task_type??null,
        unsigned_person:null,
        use_software_name:formData.use_software_name??null,
        work_content:null,
        zyrwd_id:formData.zyrwd_id?.id??'',
        xmlb_id:formData?.xmlb_id?.id??'',
        id: formData.id??id,
        XTSJ_design_para: [],
        modelType: formData?.modelType??'',
        engineeringType: formData?.engineeringType??''
      },
      schemaCode:"XTSJ_sjrwd",
      sheetCode:"XTSJ_sjrwd",
      workflowInstanceId:formData.workflowInstanceId??null,
    }
  }

  validateFn() {
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
      return validde;
    }else {
      return validde;
    }
  }

  async actions(actionCode:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',showComment:boolean){
    this.dialogModalConfiguration.confirmLoading=true;
    const {userInfo,formData,getBizObjectData} = this;
    const {departmentId,imgUrl,name,unitType} = userInfo
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
      // if(actionCode!=="retainButton"){
      if (!this.validateFn()) return
      // }
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
            workflowCode:"XTSJ_sjrwd_workflow"
          });
      }else if(actionCode==="submitButton"){
          res = await submit({
            workItemId:formData.data.workItemId??null,
            workflowInstanceId:formData.data.workflowInstanceId??null,
            bizObject,
            departmentId,
            replayToken:token,
            workflowCode:"XTSJ_sjrwd_workflow"
          });
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
      this.$message.success(`${this.dialogModalConfiguration.okText}成功`);
      this.dialogModalConfiguration.visible=false;
      this.$emit("affterCreated");
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
  formKey: number = 1;
  @Watch("createDesignTaskVisible",{deep: true})
  designTaskVisibleChange(newVal:boolean){
    if(newVal){
      if (this.isUpdateDesignTask) {
        for (const designTaskMappingKey in designTaskMapping) {
          if (['checker','planStartStr','planEndStr'].includes(designTaskMappingKey)){
            continue
          }
          if (this.formData.data.hasOwnProperty(designTaskMapping[designTaskMappingKey])) {
            this.formData.data[designTaskMapping[designTaskMappingKey]] = this.renderFormData[designTaskMappingKey];
          }
        }
        if (this.renderFormData.zyrwdId) { //区分：1 进行批量操作  2 未进行批量操作
          loadSheetData<LoadData>({startWorkflowCode:"XTSJ_sjrwd_workflow"}).then((res)=> {
            //@ts-ignore
            if (res.errcode!==0) return this.$message.error(res.message)
            this.updateSheetConfig(false,res.data as SheetData<LoadData>);
            this.getModelTypeConfig('XTSJ_field_mapping','XTSJ_sjrwd');
            //创建数据校验规则
            this.createRules();
          })
          //暂处理 proofread_level自动清空问题（原因未明）
          setTimeout(()=> {
            this.formData.data.proofread_level = this.renderFormData.proofreadLevel;
          },200)
        }else {
          this.getDesignTask();
        }
      }else {
        this.getDesignTask();
      }
      this.$nextTick(()=>{
        this.productionForm&&this.productionForm.clearValidate([]);
      });
    }
  }
  get isUpdateDesignTask() {
    return typeof this.renderFormData === 'object' && this.renderFormData && Object.keys(this.renderFormData).length
  }
  saveUpdateDesignTask() {
    if (!this.validateFn()) return;
    this.$emit('updateDesignTask',this.formData.data)
  }
  //TODO START 生成成果编码
  debounceCode = Utils.debounceFn(()=> {
    this.getDesignTaskAchievementCode()
  },1000)
  get mergeCode() {
    return this.formData.data.profession_name && this.formData.data.engineering_name && this.formData.data.task_number
  }
  @Watch('mergeCode', { deep: true })
  mergeCodeListener(val) {
    if (val) {
      this.debounceCode()
    }else {
      this.formData.data.achievement_number = ''
    }
  }
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
}
