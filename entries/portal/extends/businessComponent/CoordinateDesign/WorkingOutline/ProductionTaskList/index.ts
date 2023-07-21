import { Component, Vue, Prop, InjectReactive,Ref } from 'vue-property-decorator';
import {Button, Modal,FormModel,Icon,Tag} from "@h3/antd-vue";
import DataForm,{FormData} from "./components/DataForm";
import Workflow from "../../../../../src/views/form/workflow-track/workflow-trackNew.vue"
import {
  productionTask,
  BizObject,
  workflowInstanceFlag
} from "../../../../service/CoordinateDesign/WorkingOutline/ProductionTaskList";
import { ValidationRule } from '@h3/antd-vue/types/form/form';
import {UUID,replayToken,submit,save,agree,reject,loadSheetData,sheetConfig,SheetData} from "../../../../service/CoordinateDesign/common"
import {HttpResponse} from "@cloudpivot/api/src/response";
import { ControlHelper } from '@cloudpivot/form/src/common/controls/control-helper';
import {DataItemType} from "@cloudpivot/form/src/schema/data-item-type";
import {FormControlType} from "@cloudpivot/form/src/schema/form-control-type";
import {DateItemOperatorType,logicDataItemOperators,numberDataItemOperators,sequenceStatusOperators,staffDataItemOperators,textDataItemOperators} from "@cloudpivot/form/src/common/data-item/data-item2";
type selectorOption = { id:string,name:string,type:number };
type LoadData = {
  glid:any;
  engineeringType: string;
  sequenceNo: string;
  constructionPhase: any;
  id:string|null|undefined,
  workItemId:string|null|undefined,
  workflowTokenId:string|null|undefined,
  workflowInstanceId:string|undefined|null,

  engineering_name: string|undefined|null,
  engineering_location: string|undefined|null,
  industryType:string|undefined|null,
  projectType:string|undefined|null,
  engineering_stage: string|undefined|null,
  modelType: string;
  engineering_number: string|undefined|null,
  manufacturer_admin:selectorOption[]|undefined,
  manufacturer_depart_manager: selectorOption[]|undefined,
  manufacturer:selectorOption[]|undefined,
  manufacturer_manager: selectorOption[]|undefined,
  collaboration: selectorOption[]|undefined,
  collaboration_manager:  selectorOption[]|undefined,
  company_manager: selectorOption[]|undefined,
  archivist:  selectorOption[]|undefined,
  actual_contract_money: number|undefined|null,
  evaluation_contract_money:number|undefined|null,
  evaluation_contract_remark:string|undefined|null,
  company_chief_engineer: selectorOption[]|undefined,
  project_level:string|undefined|null,
  company_review_flag:string|undefined|null,
  manufacturer_chief_engineer: selectorOption[]|undefined,
  project_manager: selectorOption[]|undefined,
  manufacturer_vice_engineer: selectorOption[]|undefined,
  manufacturer_vice_manager: selectorOption[]|undefined,
  year:string|undefined|null,
  quarter:string|undefined|null,
  task_priority:string|undefined|null,
  risk_level:string|undefined|null,
  plan_end_time:string|undefined|null,
  plan_start_time:string|undefined|null,
  plan_duration:string|undefined|number|null,
  actual_end_time:string|undefined|null,
  warning_date1:string|undefined|null,
  warning_date2:string|undefined|null,
  work_content:string|undefined|null,
  schedule:string|undefined|null,
  scattered_contract_flag:string|undefined|null,
  manufacture_status:string|undefined|null,
  task_type:string|undefined|null,
  remark:string|undefined|null,
  remaining_problem:string|undefined|null,
  current_person:selectorOption[]|undefined,
  departHeaders:selectorOption[]|undefined,
  picture:any[]|null|undefined,
  workday_duration:string|undefined|number|null,
};
type ModalConfiguration={visible:boolean,actionCode:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',showComment:boolean,title?:string,okText?:string,confirmLoading?:boolean,OK?:()=>void,afterClose?:()=>void};

import {getCommonReplys} from "../../../../service/api"
@Component({
  name:"ProductionTaskList",
  components:{
    [Button.name]:Button,
    [Modal.name]:Modal,
    [FormModel.name]:FormModel,
    [FormModel.Item.name]:FormModel.Item,
    [Icon.name]:Icon,
    DataForm,
    Workflow,
    [Tag.name]:Tag
  }
})
export default class ProductionTaskList extends Vue {
  @InjectReactive("project") appCode!:string;
  @Prop({required:true}) projectId!:string;
  @Ref("dialogForm") dialogForm!:FormModel;
  @Ref("dataForm") dataForm!:FormModel;

  userInfo:{id:string,name:string,departmentId:string,departmentName:string;imgUrl:string|null,unitType:number}={id:"",name:"",departmentId:"",departmentName: '',imgUrl:null,unitType:0};

  leftButtonLinks={
    activeIndex:0,
    buttonLinks:[
      {name:"任务详情",componentName:"DataForm"},
      {name:"流程记录",componentName:"Workflow"},
    ]
  }
  componentName="DataForm"

  leftButtonClick(item:{name:string,componentName:string},index:number){
    this.leftButtonLinks.activeIndex=index;
    this.componentName=item.componentName;
  }

  commonReplys:any={};//常用回复语

  rightButtonLinks=[
    {name:"提交",type:"primary",visibleKey:"submitButton",showComment:false},
    {name:"暂存",type:"primary",visibleKey:"retainButton",showComment:false},
    {name:"接收",type:"primary",visibleKey:"receiveButton",showComment:false},
    {name:"同意",type:"primary",visibleKey:"agreeButton",showComment:true},
    {name:"驳回",type:"primary",visibleKey:"rejectButton",showComment:true},
  ]

  /*选中常用语*/
  tagChange(item){
    this.dialogTaskForm.formData.comment=item;
  }

  actionButtonClick(item:{visibleKey:string,name:string,showComment:boolean}){
    this.commonReplys=null;
    if(item.name==='同意'||item.name==='驳回'){
      getCommonReplys({
        appCode:this.appCode??'',
        schemaCode:this.appCode+'_xmlb',
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

  formData:FormData & {submitButton?:boolean,retainButton?:boolean,receiveButton?:boolean,agreeButton?:boolean,rejectButton?:boolean,rejectToActivityCode?:string} = {
    data:{
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
    },
    rules:{},
    sheetConfig:{},
    optionsWatch:{},
    options:{},
  };

  async created(){
    this.userInfo=JSON.parse(sessionStorage.getItem("user") as string);
    setTimeout(()=> {
      this.userInfo=JSON.parse(sessionStorage.getItem("user") as string);
    },2000)
    const config = await sheetConfig({sheetCode:"XTSJ_xmlb",schemaCode:"XTSJ_xmlb",appCode:this.appCode??'XTSJ'});
    if(typeof config ==="string"){
      return this.$message.error(`获取生产任务单初始配置失败,${config}`);
    }
    this.formData.sheetConfig =  config;
    await this.getProductionTask();
  }
  getMultiple(key:string){
    return this.formData.sheetConfig[key].multi;
  }
  async getProductionTask(){
    const {appCode,projectId} = this;
    try {
      const res = await productionTask({appCode,projectId});
      if(res.errcode){
        return this.$message.error(`获取生产任务单失败,${res.errmsg}`);
      }
      const workflowInstanceId = res.data!.workflowInstanceId;
      const workItemId =  res.data?.workItemId??"";
      const { errcode,errmsg,data } = await loadSheetData<LoadData>({workflowInstanceId,workitemId:workItemId});
      if(errcode){
        return this.$message.error(`获取生产任务单失败,${errmsg}`);
      }
      this.formData.data = {
        glid: data?.bizObject.data?.glid??{},
        engineeringType: data?.bizObject.data.engineeringType??'',
        sequenceNo: data?.bizObject.data.sequenceNo??'',
        constructionPhase:!this.getMultiple('constructionPhase')?data?.bizObject.data.constructionPhase??'':data?.bizObject.data.constructionPhase && data?.bizObject.data.constructionPhase.length?data?.bizObject.data.constructionPhase.split(';'):[],
        id:data?.bizObject.id,
        workflowTokenId:data?.workflowTokenId??null,
        workItemId:data?.workItemId??null,
        workflowInstanceId:data?.workflowInstanceId,
        rejectToActivityCode:res.data?.rejectToActivityCode,

        engineering_name: data?.bizObject.data.engineering_name,
        engineering_location: data?.bizObject.data.engineering_location,
        industryType:data?.bizObject.data.industryType??undefined,
        projectType:data?.bizObject.data.projectType??undefined,
        engineering_stage: data?.bizObject.data.engineering_stage??undefined,
        modelType: data?.bizObject.data.modelType??'',
        engineering_number: data?.bizObject.data.engineering_number,
        manufacturer_admin: data?.bizObject.data.manufacturer_admin,
        manufacturer_depart_manager: data?.bizObject.data.manufacturer_depart_manager,
        manufacturer:data?.bizObject.data.manufacturer,
        manufacturer_manager: data?.bizObject.data.manufacturer_manager,
        collaboration: data?.bizObject.data.collaboration,
        collaboration_manager: data?.bizObject.data.collaboration_manager,
        company_manager: data?.bizObject.data.company_manager,
        archivist: data?.bizObject.data.archivist,
        actual_contract_money: data?.bizObject.data.actual_contract_money,
        evaluation_contract_money:data?.bizObject.data.evaluation_contract_money,
        evaluation_contract_remark:data?.bizObject.data.evaluation_contract_remark,
        company_chief_engineer: data?.bizObject.data.company_chief_engineer,
        project_level:data?.bizObject.data.project_level,
        company_review_flag:data?.bizObject.data.company_review_flag,
        manufacturer_chief_engineer:data?.bizObject.data.manufacturer_chief_engineer,
        project_manager:data?.bizObject.data.project_manager,
        manufacturer_vice_engineer:data?.bizObject.data.manufacturer_vice_engineer,
        manufacturer_vice_manager:data?.bizObject.data.manufacturer_vice_manager,
        year:data?.bizObject.data.year,
        quarter:data?.bizObject.data.quarter??undefined,
        task_priority:data?.bizObject.data.task_priority??undefined,
        risk_level:data?.bizObject.data.risk_level??undefined,
        plan_end_time:data?.bizObject.data.plan_end_time??undefined,
        plan_start_time:data?.bizObject.data.plan_start_time??undefined,
        plan_duration:data?.bizObject.data.plan_duration??undefined,
        actual_end_time:data?.bizObject.data.actual_end_time??undefined,
        warning_date1:data?.bizObject.data.warning_date1??undefined,
        warning_date2:data?.bizObject.data.warning_date2??undefined,
        work_content:data?.bizObject.data.work_content,

        schedule:data?.bizObject.data.schedule,
        scattered_contract_flag:data?.bizObject.data.scattered_contract_flag,
        manufacture_status:data?.bizObject.data.manufacture_status,
        task_type:data?.bizObject.data.task_type,
        remark:data?.bizObject.data.remark,
        remaining_problem:data?.bizObject.data.remaining_problem,
        current_person:data?.bizObject.data.current_person,

        departHeaders:data?.bizObject.data.departHeaders,
        picture:data?.bizObject.data.picture,
        workday_duration:data?.bizObject.data.workday_duration,

        submitButton:res.data?.submitButton,
        retainButton:res.data?.retainButton,
        receiveButton:res.data?.receiveButton,
        agreeButton:res.data?.agreeButton,
        rejectButton:res.data?.rejectButton,
        activityCode:data?.activityCode,
        activityName:data?.activityName,
      };

      this.updateSheetConfig(false,data as SheetData<LoadData>);
    } catch (error) {
      return this.$message.error(`获取生产任务单失败,${error}`)
    }
  }

  /* 更新SheetConfig(生产任务单需单独更新) */
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
              if(this.formData.sheetConfig[key].type === 3 && value==="none"){
                value = undefined;
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


  getBizObjectData(id:string):BizObject{
    const { formData:{data:formData} } = this;
    return{
      id:formData.id??id,
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

  async actions(actionCode:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',showComment:boolean){
    this.dialogModalConfiguration.confirmLoading=true;
    const {userInfo,formData,getBizObjectData} = this;
    const {departmentId} = userInfo
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
        const productionForm =  this.dataForm.productionForm as FormModel;
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
          workflowCode:"XTSJ_xmlb"
        });
      }else if(actionCode==="submitButton"){
        res = await submit({
          workItemId:formData.data.workItemId??null,
          workflowInstanceId:formData.data.workflowInstanceId??null,
          bizObject,
          departmentId,
          replayToken:token,
          workflowCode:"XTSJ_xmlb"
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
          workflowCode:"XTSJ_xmlb"
        })
      }else if(actionCode==='rejectButton'){
        const approval= {
          content: this.dialogTaskForm.formData.comment,
          workItemId: formData.data.workItemId as string,
          workflowInstanceId: formData.data.workflowInstanceId as string,
          workflowTokenId: formData.data.workflowTokenId as string,
          activityCode:formData.data.activityCode as string,
          activityName:formData.data.activityName as string,
          result: null
        };
        res =  await reject({
          workItemId:formData.data.workItemId as string,
          workflowInstanceId:formData.data.workflowInstanceId as string,
          bizObject,
          replayToken:token,
          approval:approval,
          workflowCode:"XTSJ_xmlb",
          rejectToActivityCode:formData.data.rejectToActivityCode as string,
        });
      }
      const { errcode,errmsg,data} = res!;
      if(errcode){
        return this.$message.error(`${this.dialogModalConfiguration.okText}失败,${errmsg}`);
      }
      this.$message.success(`${this.dialogModalConfiguration.okText}成功`);
      this.dialogModalConfiguration.visible=false;
      await this.getProductionTask();
    } catch (error) {
      this.$message.error(`${this.dialogModalConfiguration.okText}异常,${error}`);
    }finally{
      this.dialogModalConfiguration.confirmLoading=false;
      this.dialogModalConfiguration.visible=false;
      this.$emit('updateNodeState')
    }
  }
}
