import { Component, Mixins, InjectReactive ,Prop,Watch ,VModel ,Ref} from 'vue-property-decorator';
import { CommonMixins } from "../../../commonMixins";
import { Input,Radio,DatePicker,FormModel,Modal} from "@h3/antd-vue";
import { ValidationRule } from '@h3/antd-vue/types/form-model/form';
import moment,{Moment} from "moment"
import { listApi } from "@cloudpivot/api";
import {loadSheetData,sheetConfig, SheetConfig, SheetData} from "../../../../../../service/CoordinateDesign/common";
type selectorOption = { id:string,name:string,type:number };
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
interface LoadData{
  profession_task_name:string|undefined|null,
  engineering_name: string|undefined|null,
  manufacturer:selectorOption[]|undefined|null,
  profession_name:string|undefined|null,
  use_software_name:string|undefined|null,
  // engineering_location: string;
  // engineering_number: string;
  // project_level: string;

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
  modelType: string
  industryType: string|undefined|null,
  projectType:string|undefined|null
}
@Component({
  name:"AddDesignTask",
  components:{
    [Input.name]:Input,
    [Radio.name]:Radio,
    [DatePicker.name]:DatePicker,
    [FormModel.name]:FormModel,
    [FormModel.Item.name]:FormModel.Item,
    [Modal.name]:Modal,
    ATooltip: Tooltip,
    AIcon: Icon
  }
})
export default class AddDesignTask  extends Mixins(CommonMixins) {
  @InjectReactive("project") appCode!: string;
  @Prop({required:true}) projectId!:string;
  @Prop({required:true}) sjrwdId!:string;
  @VModel({type:Boolean}) addDesignTaskVisible!:boolean;
  @Ref("productionForm") productionForm!:FormModel;
  @Prop({required:true}) showItems!:string[];
  @Prop({required:true}) totalCount!:number;
  @Prop({required:true}) selectItemNames!:string[];

  confirmLoading=false;

  formData:{data:LoadData,
    rules:{[key:string]:(ValidationRule|{trigger:'blur' | 'change' | ['change', 'blur']})[]},
    sheetConfig:SheetConfig,
    optionsWatch:{[key:string]:()=>void},
    options:{[key:string]:{value:string,label:string,key:number,disabled:boolean}[]}}={
      data:{
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
        // engineering_location: '',
        // engineering_number: '',
        // project_level: '',
        manufacturer:undefined,

        partners:undefined,
        plan_duration:undefined,
        plan_end_time:undefined,
        plan_start_time:undefined,

        profession_name:undefined,
        profession_task_name:undefined,
        project_manager:undefined,
        project_manager_audit:undefined,
        proofread_level:undefined,
        task_time:undefined,
        use_software_name:undefined,
        engineering_stage:undefined,
        modelType:'',
        industryType: undefined,
        projectType:undefined,
      },
      rules:{},
      sheetConfig:{},
      optionsWatch:{},
      options:{},
  }

  /* 字段是否显示 */
  itemShow(propertyName:string){
    if(this.formData.sheetConfig[propertyName]){
      const {visible,displayFormula,required,requiredFormula} = this.formData.sheetConfig[propertyName];
      let isShow = visible;
      isShow = this.showItems.includes(propertyName);
      //先确认流程上是否要显示,如果显示，再确认条件显示
      if(isShow && displayFormula) isShow = this.checkVisible(displayFormula)
      if(isShow){
        const isRequired = required || this.checkRequired(requiredFormula);
        if(isRequired){
          this.formData.rules[propertyName] = [
            {required:true,message:()=>`${this.formData.sheetConfig[propertyName].placeholder}${this.formData.sheetConfig[propertyName].name}`,trigger:['change','blur']},
          ]
        }else{
          this.formData.rules[propertyName]&& delete this.formData.rules[propertyName];
        }
      }
      else{
        this.formData.rules[propertyName]&& delete this.formData.rules[propertyName];
      }
      return isShow;
    }else{
      return false;
    }
  }

  async created(){
    const config = await sheetConfig({sheetCode:"XTSJ_sjrwd",schemaCode:"XTSJ_sjrwd"});
    if(typeof config ==="string"){
      return this.$message.error(`获取设计任务单初始配置失败,${config}`);
    }
    this.formData.sheetConfig =  config;
    this.getDesignTask();
  }

  /* 获取或创建设计任务单 */
  async getDesignTask(){
    const {appCode,projectId,sjrwdId}=this;
    try {
      const { errcode,errmsg,data } =  await loadSheetData<LoadData>({startWorkflowCode:"XTSJ_sjrwd_workflow"});
      if(errcode){
        return this.$message.error(`获取设计任务单失败,${errmsg}`);
      }
      this.formData.data = {
        // id:data?.bizObject.id,
        // workflowTokenId:data?.workflowTokenId??null,
        // workItemId:data?.workItemId??null,
        // workflowInstanceId:data?.workflowInstanceId,
        // zyrwd_id:data?.bizObject.data?.zyrwd_id,
        // xmlb_id:data?.bizObject.data?.xmlb_id,
        // activityCode:data?.activityCode,
        // activityName:data?.activityName,


        auditor:data?.bizObject.data.auditor??null,
        checker:data?.bizObject.data.checker??null,

        company_chief:data?.bizObject.data.company_chief??null,


        countersign_flag:data?.bizObject.data.countersign_flag,
        countersigned:data?.bizObject.data.countersigned??null,

        department_chief:data?.bizObject.data.department_chief??null,
        design_guider:data?.bizObject.data.design_guider??null,
        design_guider_flag:data?.bizObject.data.design_guider_flag,
        designer:data?.bizObject.data.designer??null,

        engineering_name:data?.bizObject.data.engineering_name,



        manufacturer:data?.bizObject.data.manufacturer??null,



        partners:data?.bizObject.data.partners??null,
        plan_duration:data?.bizObject.data.plan_duration??undefined,
        plan_end_time:data?.bizObject.data.plan_end_time??undefined,
        plan_start_time:data?.bizObject.data.plan_start_time??undefined,

        profession_name:data?.bizObject.data.profession_name,
        profession_task_name:data?.bizObject.data.profession_task_name,


        project_manager:data?.bizObject.data.project_manager??null,
        project_manager_audit:data?.bizObject.data.project_manager_audit,

        proofread_level:data?.bizObject.data.proofread_level,
        modelType: data?.bizObject.data.modelType??'',

        task_time:data?.bizObject.data.task_time??undefined,

        use_software_name:data?.bizObject.data.use_software_name,

        engineering_stage:undefined,
        industryType: undefined,
        projectType:undefined,

      };
      this.listSkipQueryList();
      //新增专业设计提纲-带入工作大纲已填字段  新增？判断
      this.updateSheetConfig(true,data as SheetData<LoadData>);
      //创建数据校验规则
      this.createRules();
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
        // this.formData.data.zyrwd_id.name = res.data.content[0].name;
        // this.formData.data.zyrwd_id.id = res.data.content[0].id;
        // this.formData.data.zyrwd_id.schemaCode = res.data.content[0].schemaCode;

        // this.formData.data.engineering_location = data.engineering_location;
        // this.formData.data.engineering_number = data.engineering_number;
        // this.formData.data.project_level = data.project_level;
        // this.formData.data.xmlb_id = data.xmlb_id;
        // this.formData.data.manufacturer_chief = data.manufacturer_chief_engineer;

        this.formData.data.engineering_name = data.engineering_name;
        this.formData.data.industryType = data.industryType;
        this.formData.data.projectType = data.projectType;
        this.formData.data.engineering_stage = data.engineering_stage;
        this.formData.data.manufacturer = data.manufacturer;
        this.formData.data.profession_name = data.profession_name;
        this.formData.data.project_manager = data.project_manager;
        this.formData.data.company_chief = data.company_chief_engineer
        this.formData.data.auditor = data.profession_manager;
        this.formData.data.plan_start_time = data.plan_start_time;
        this.formData.data.plan_end_time = data.plan_end_time;
        this.formData.data.plan_duration = data.plan_duration;
        this.formData.data.department_chief = data.manufacturer_chief_engineer;
        this.formData.data.modelType = data.modelType;
        this.getModelTypeConfig('XTSJ_field_mapping','XTSJ_sjrwd')
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
    this.$emit("batchModify",this.formData.data,this.showItems);
  }

  afterClose(){
    this.formData.data = {
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

      manufacturer:undefined,

      partners:undefined,
      plan_duration:undefined,
      plan_end_time:undefined,
      plan_start_time:undefined,

      profession_name:undefined,
      profession_task_name:undefined,
      project_manager:undefined,
      project_manager_audit:undefined,
      proofread_level:undefined,
      modelType:'',
      task_time:undefined,
      use_software_name:undefined,
      engineering_stage:undefined,

      industryType: undefined,
      projectType:undefined,
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
  @Watch("addDesignTaskVisible")
  designTaskVisibleChange(newVal:boolean){
    if(newVal){
      this.getDesignTask();
      this.$nextTick(()=>{
        this.productionForm&&this.productionForm.clearValidate([]);
      });
    }
  }
}
