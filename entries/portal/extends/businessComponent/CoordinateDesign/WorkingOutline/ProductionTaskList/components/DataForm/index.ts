import { Component, Vue, Prop,InjectReactive,VModel,Ref,Watch } from 'vue-property-decorator';
import {Button,Collapse,Icon,FormModel,Input,InputNumber,Radio,Modal,DatePicker,Select} from "@h3/antd-vue";
//@ts-ignore
import env from '@/config/env';
import { ValidationRule } from '@h3/antd-vue/types/form-model/form';
import flow from "@cloudpivot/flow/pc";
import {workflowBaseInfo,WorkFlowInfo} from "../../../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignOutline";
import ApplicationList from "@cloudpivot/list/src/components/pc/application-list.vue";
import staffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import YearPicker from "../YearPicker/index.vue";
import {SheetConfig,engineeringStageOptions} from "../../../../../../service/CoordinateDesign/common";
import moment,{Moment} from "moment";
import { listApi } from '@cloudpivot/api';
import { ControlHelper } from '@cloudpivot/form/src/common/controls/control-helper';
import {DataItemType} from "@cloudpivot/form/src/schema/data-item-type";
import {FormControlType} from "@cloudpivot/form/src/schema/form-control-type";
import {DateItemOperatorType,logicDataItemOperators,numberDataItemOperators,sequenceStatusOperators,staffDataItemOperators,textDataItemOperators} from "@cloudpivot/form/src/common/data-item/data-item2";
import Utils from "../../../../../../utils";
import common from "../../../../../../../../../modules/@cloudpivot/common";
import RelevanceFormModal from "../../../../compoents/RelevanceFormModal.vue";
import {getTableList} from "../../../../../../service/api";
import {ModelTypeConfig} from "../../../../../../type";
type selectorOption = { id:string,name:string,type:number };
interface Data{
  glid:any;
  engineeringType: string;
  sequenceNo: string;
  constructionPhase: any;
  id:string|null|undefined,
  workItemId:string|null|undefined,
  workflowTokenId:string|null|undefined,
  workflowInstanceId:string|undefined|null,
  rejectToActivityCode:string|undefined|null,

  engineering_name: string|undefined|null,

  engineering_location: string|undefined|null,
  engineering_stage: string|undefined|null,
  industryType:string|undefined|null,
  modelType: string;
  projectType:string|undefined|null,
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
  submitButton?:boolean,
  retainButton?:boolean,
  receiveButton?:boolean,
  agreeButton?:boolean,
  rejectButton?:boolean,
  activityCode?:string,
  activityName?:string,
  picture:any[]|undefined|null,
  workday_duration:string|undefined|number|null,
}
export interface FormData{
  data:Data,
  rules:{[key:string]:(ValidationRule|{trigger:'blur' | 'change' | ['change', 'blur']})[]},
  sheetConfig:SheetConfig,
  optionsWatch:{[key:string]:()=>void},
  options:{[key:string]:{value:string,label:string,key:number,disabled:boolean}[]}
}
@Component({
  name:"DataForm",
  components:{
    [Button.name]:Button,
    [Collapse.name]:Collapse,
    [Collapse.Panel.name]:Collapse.Panel,
    [Icon.name]:Icon,
    [FormModel.name]:FormModel,
    [FormModel.Item.name]:FormModel.Item,
    [Input.name]:Input,
    [Input.TextArea.name]:Input.TextArea,
    [InputNumber.name]:InputNumber,
    [Radio.name]:Radio,
    [Radio.Group.name]:Radio.Group,
    [Modal.name]: Modal,
    [DatePicker.name]:DatePicker,
    [Select.name]:Select,
    [Select.Option.name]:Select.Option,
    YearPicker,
    Approval: flow.components.Approval,
    ApplicationList,
    staffSelector,
    RelevanceFormModal
  },
  filters:{
    formatSelector:function(value:string|(string|{id:string,name:string,type:number})[]|null){
      if(!value)return "";
      if(typeof value ==="string"){
        return value;
      }
      const arr = value.map(item=>{
        if(typeof item ==="string"){
          return item;
        }else{
          return item.name;
        }
      });
      return arr.join(";");
    },
    formatDate:function(value:string|undefined|null,formatString:string="YYYY-MM-DD"){
      if(!value) return "";
      if(!moment(value).isValid()) return value;
      return moment(value).format(formatString);
    }
  }
})
export default class DataForm extends Vue {
  @InjectReactive("project") appCode!: string;
  @Ref("productionForm") productionForm!:FormModel;
  @Prop({required:true}) projectId!:string;
  @VModel({required:true,type:Object})formData!:FormData;

  approvalKey = 1;
  collapseActiveKey = ['2','3','4','5','6'];
  userInfo:{id:string,name:string,departmentId:string,imgUrl:string|null,unitType:number}={id:"",name:"",departmentId:"",imgUrl:null,unitType:0};

  //#region
  /* StaffSelector Change event */
  staffSelectorChange(value,key:string){
    const newValue = this.parseSelectorValue(value);
    this.$set(this.formData.data,key,newValue);
  }
  parseSelectorValue(value:{id:string,name:string,type:number,[key:string]:any}[]|null){
    if(!value||value.length<=0){
      return undefined;
    }else{
      return value.map(item=>({id:item.id,name:item.name,type:item.type?item.type:item.unitType}));
    }
  }
  /* StaffSelectorOptionS */
  setStaffSelectorOptions(key:string,placeholder:string='新增变更'){
    this.formData.sheetConfig[key].placeholder = placeholder
    const rootNode = this.parseRootNode(this.formData.sheetConfig[key].orgRoot,this.formData.sheetConfig[key].orgRootValueType);
    return {
      selectOrg: ['all','org'].includes(this.formData.sheetConfig[key].deptVisible??''),
      selectUser: ['all','user'].includes(this.formData.sheetConfig[key].deptVisible??''),
      showModel: true,
      mulpitle: this.getMultiple(key),//判断是否为单选
      showSelect: true,
      placeholder: `${this.formData.sheetConfig[key].placeholder}${this.formData.sheetConfig[key].name}`,
      title: `${this.formData.sheetConfig[key].name}`,
      nonExistentAppCode: true,
      visiblePart:true,
      rootNode,
      role:this.formData.sheetConfig[key].roles??undefined,
      projectId:this["projectId"]??"",
      jobs: this.formData.sheetConfig[key].jobs??'',
      majors: this.formData.sheetConfig[key].majors??'',
      certifications: this.formData.sheetConfig[key].certifications??'',
    }
  }
  parseRootNode(rootNode:string|{id:string}[]|undefined,orgRootValueType:""|"ref"|"originatorDept"|undefined,){
    if(!rootNode) return undefined;
    if(orgRootValueType ===""){
      if(typeof rootNode ==="string"){
        if(!this.isJSONString(rootNode)) return undefined;
        const node = JSON.parse(rootNode);
        return node;
      }
      return rootNode;
    }else if(orgRootValueType === "ref"){
      const startIndex = (<string>rootNode).indexOf("{");
      const endIndex = (<string>rootNode).indexOf("}");
      const str = (<string>rootNode).slice(startIndex+1,endIndex)
      return this.formData.data[str]??undefined;
    }else if(orgRootValueType === "originatorDept"){
      return [{id:this.userInfo.departmentId}];
    }
    else{
      return undefined;
    }
  }
  /* 设置placeholder */
  setPlaceholder(key:string,placeholder:string='请选择'){
    this.formData.sheetConfig[key].placeholder = placeholder
    return this.placeholder(key);
  }
  /* 获取数据字段名称 */
  getItemName(key:string){
    return this.formData.sheetConfig[key].name;
  }
  /* 获取是否多选 */
  getMultiple(key:string){
    return this.formData.sheetConfig[key].multi;
  }
  /* 字段是否显示 */
  itemShow(propertyName:string){
    if(this.formData.sheetConfig[propertyName]){
      const {visible,displayFormula,required,requiredFormula} = this.formData.sheetConfig[propertyName];
      let isShow = visible;
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
    //   if(!this.formData.sheetConfig[propertyName].visible){
    //     return this.formData.sheetConfig[propertyName].visible;
    //   }
    //   if(this.formData.sheetConfig[propertyName].displayFormula){
    //     const isShow = this.checkVisible(this.formData.sheetConfig[propertyName].displayFormula);
    //     if(isShow&&this.formData.sheetConfig[propertyName]&&this.checkRequired(this.formData.sheetConfig[propertyName].requiredFormula)){
    //       this.formData.rules[propertyName] = [
    //         {required:true,message:()=>`${this.formData.sheetConfig[propertyName].placeholder}${this.formData.sheetConfig[propertyName].name}`,trigger:['change','blur']},
    //       ]
    //     }else{
    //       this.formData.rules[propertyName]&&delete this.formData.rules[propertyName];
    //     }
    //     return isShow;
    //   }
    //   return this.formData.sheetConfig[propertyName].visible;
    }else{
      return false;
    }
  }
  /* 检查字段条件显示 */
  checkVisible(displayFormula:string):boolean{
    if(!displayFormula)return false;
    if ( displayFormula.indexOf( "&&" ) > -1 ) {
      // 多个And条件解析 判断isShow
      const andArr: any[] = displayFormula.split( "&&" );
      return andArr.every( ( item ) => {
        return this.checkCondition(item);
      } );
    } else if ( displayFormula.indexOf( "||" ) > -1 ) {
      // 多个Or条件解析 判断isVisible
      const orArr: any[] = displayFormula.split( "||" );
      return orArr.some( ( item ) => {
        return this.checkCondition(item);
      } );
    } else {
      // 只有一个条件解析 判断isVisible
      return this.checkCondition(displayFormula);
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
                return !Boolean(propertyVal);
              case DateItemOperatorType.IsNotNull:
                return Boolean(propertyVal);
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
                  return !Boolean(propertyVal);
                case DateItemOperatorType.IsNotNull:
                  return Boolean(propertyVal);
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
                  return !Boolean(propertyVal);
                case DateItemOperatorType.IsNotNull:
                  return Boolean(propertyVal);
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
                return !Boolean(propertyVal);
              case DateItemOperatorType.IsNotNull:
                return Boolean(propertyVal);
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
  /* 字段是否可编辑 */
  itemEdit(propertyName:string){
    return this.formData.sheetConfig[propertyName].readonly;
  }
  /* 字段placeholder */
  placeholder(key:string){
    return `${this.formData.sheetConfig[key].placeholder}${this.formData.sheetConfig[key].name}`;
  }
  /* selectOptins */
  getOptions(key:string,isRadio:boolean=false){
    const {sheetConfig:config} = this.formData;
    const value = config[key].options;
    if(value){
      if(!this.isJSONString(value)){
        const values = <string[]>(config[key].options?.split(";"))
        const options = values.map((item,index)=>{
          return {
            value:item,
            label:item,
            key:index,
            disabled:false,
          }
        });
        if(!isRadio)
        options.unshift({value:'请选择',label:'请选择',key:-1,disabled:true})
        return options;
      }
      else{
        if(!this.formData.options[key]){
          this.$set(this.formData.options,key,[]);
        }
        return this.formData.options[key];
      }
    }
  }
  changeOptions() {
    this.changeLabelByModelTypeValue()
  }
  updateOptions(key:string,isRadio:boolean=false){
    const {sheetConfig:config} = this.formData;
    const value = config[key].options;
    this.formData.options[key] = [];
    if(!value)return;
    const optionsSet = this.isJsonString(value)?JSON.parse(value):value;
    const schemaCode = optionsSet.schemaCode;
    const sheetDataItem = optionsSet.sheetDataItem;
    const orderByFields: string[] = optionsSet.orderByFields ? [ optionsSet.orderByFields ] : [];
    const orderType: number = optionsSet.orderType ? Number(optionsSet.orderType) : 3;
    const filters: any[] = [];
    if(optionsSet.condition){
      const conditionStr: string[] = optionsSet.condition.split("&&").filter((res: string | string[]) => res.indexOf("===") < 0);
      conditionStr.forEach((res) => {
        const item: any = res.split(" ");
        filters.push({
          propertyCode: item[0],
          propertyValue: this.formData.data[item[2]],
          op: "Eq"
        });
        const propertyName = `formData.data.${item[2]}`;
        this.formData.optionsWatch[key]&&this.formData.optionsWatch[key]();
        this.formData.optionsWatch[key] = this.$watch(propertyName,()=>{
          this.formData.data[key] = undefined;
        })
      });
    }
    const options = {
      customDisplayColumns: [sheetDataItem]
    };
    const obj: any = {
      queryCode:"",
      schemaCode,
      options,
      orderByFields,
      orderType,
      page: 0,
      size: 1000,
      filters,
      condition:optionsSet.condition
    };
    listApi.listSkipQueryList(obj).then(res => {
      if (res.errcode === 0) {
        let data: any[] = [];
        res.data.content.forEach((x: any,index:number) => {
          const s = x.data[sheetDataItem];
          data.push({
            value:s,
            label:s,
            key:index,
            disabled:false,
          })
        });
        //去重处理
        data = Utils.unique(data,'value')
        if(!isRadio)
        data.unshift({value:'请选择',label:'请选择',key:-1,disabled:true});
        // this.$set(this.formData.options,key,data);
        this.formData.options[key] = data;
      }
    });
  }
  isJsonString(str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  isJSONString(value:string){
    try {
      if(typeof JSON.parse(value)){
        return true
      }
    } catch (error) {
    }
    return false;
  }
  /* 创建数据校验规则 */
  createRules(){
    this.formData.rules = {};
    for (const key in this.formData.data) {
      if (Object.prototype.hasOwnProperty.call(this.formData.data, key)) {
        const element = this.formData.data[key];
        if(!this.formData.sheetConfig[key]||!this.formData.sheetConfig[key].required||!this.itemShow(key))continue;
        this.formData.rules[key] = [
          {required:true,message:()=>`${this.formData.sheetConfig[key].placeholder}${this.formData.sheetConfig[key].name}`,trigger:['change','blur']},
        ]
      }
    }
  }

  workFlowInfo:WorkFlowInfo={
    startTime:"",
    status:"",
    participants:[],
    usedTime:0
  }

  usedDays=0;
  usedHours=0;
  usedMinutes=0;

  /* 流程信息 */
  async getWorkflowBaseInfo(workflowInstanceId:string){
    try {
      const {errcode,errmsg,data} = await workflowBaseInfo({workflowInstanceId});
      if(errcode){
        return this.$message.error(`获取流程状态失败,${errmsg}`);
      }
      this.workFlowInfo = data??this.workFlowInfo;
      this.calcUsedTime();
    } catch (error) {
      this.$message.error(`获取流程状态异常,${error}`);
    }
  }

  calcUsedTime(){
    if(!this.workFlowInfo.usedTime)return;
    const timestamp=this.workFlowInfo.usedTime/1000;
    this.usedDays = parseInt(timestamp/60/60/24+'');
    this.usedHours = parseInt(timestamp/60/60%24+'');
    this.usedMinutes = parseInt(timestamp/60%60+'');
  }
  /* 单据状态转换 */
  getSequenceString(value: string) {
    let sequenceString = value;
    switch (value) {
      case 'DRAFT':
        sequenceString = '草稿';
        break;
      case 'PROCESSING':
        sequenceString = '进行中';
        break;
      case 'COMPLETED':
        sequenceString = '已完成';
        break;
      case 'CANCELED':
        sequenceString = '已作废';
        break;
      default:
        break;
    }
    return sequenceString;
  }
  //#endregion
  isUploading=false;
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
  removeFile(files:any[],index:number){
    files.splice(index,1);
  }
  download(item) {
    window.open(`${env.apiHost}/api/aliyun/download?refId=${item.refId}`)
  };
  change(info,formDataKey:string,loadingKey:string){
    console.log('change',info,formDataKey,loadingKey);
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

  created(){
    this.userInfo=JSON.parse(sessionStorage.getItem("user") as string);
    setTimeout(()=> {
      this.userInfo=JSON.parse(sessionStorage.getItem("user") as string);
      console.log(this.userInfo,'userInfo')
    },2000)
    //创建数据校验规则
    this.createRules();
    if(this.formData.data.workflowInstanceId)
    this.getWorkflowBaseInfo(this.formData.data.workflowInstanceId);
    this.getModelTypeConfig()
  }

  async mounted(){
    this.$nextTick(()=>{
      this.productionForm&&this.productionForm.clearValidate([]);
    });
  }

  selectFilterOption(inputValue:string, option){
    return option.componentOptions.children[0].text.indexOf(inputValue) >= 0
  }



  disabledStartDate(currentDate:Moment){
    const endValue = this.formData.data.plan_end_time;
    if(!endValue||!currentDate) return false;
    return currentDate.valueOf()>moment(endValue).valueOf();
  }

  disabledEndDate(currentDate:Moment){
    const startValue = this.formData.data.plan_start_time;
    if(!startValue||!currentDate) return false;
    return moment(startValue).valueOf()>currentDate.valueOf();
  }

  @Watch("formData.data.workflowInstanceId")
  workflowInstanceIdChanged(newValue:string){
    if(newValue){
      this.getWorkflowBaseInfo(newValue);
    }
  }

  @Watch("formData.data",{deep:true})
  formDataChanged(){
    if(this.formData.data.workflowInstanceId)
    this.getWorkflowBaseInfo(this.formData.data.workflowInstanceId);
    this.approvalKey++;
  }
  @Watch("formData.sheetConfig",{deep:true})
  sheetConfigChange(){
    this.createRules();
    this.$nextTick(()=>{
      this.productionForm&&this.productionForm.clearValidate([]);
    });
  }


  planChange(){
    if(this.formData.data.plan_start_time && this.formData.data.plan_end_time){
      const startDate = moment(this.formData.data.plan_start_time);
      const endDate = moment(this.formData.data.plan_end_time);
      const stareDateWeek = startDate.day();
      const endDateWeek = endDate.day();
      const diffDays = endDate.diff(startDate,"days") + 1;
      const diffWeekDays = diffDays - (stareDateWeek==0?0:7-stareDateWeek) - endDateWeek;
      const weeks = Math.floor(diffWeekDays/7);
      const duration = weeks*5 + (stareDateWeek==0?0:(6-stareDateWeek)) + (endDateWeek===0?0:endDateWeek<=5?endDateWeek:5);
      this.formData.data.plan_duration = diffDays + "";
      this.formData.data.workday_duration = duration + "";
    }else{
      this.formData.data.plan_duration = "";
      this.formData.data.workday_duration = "";
    }
  }

  planDurationChange(){
    if(this.formData.data.plan_start_time && this.formData.data.plan_duration){
      const startDate = moment(this.formData.data.plan_start_time);
      const endDate = moment(this.formData.data.plan_start_time).add(+this.formData.data.plan_duration-1,"days");
      const stareDateWeek = startDate.day();
      const endDateWeek = endDate.day();
      const diffDays = endDate.diff(startDate,"days") + 1;
      const diffWeekDays = diffDays - (stareDateWeek==0?0:7-stareDateWeek) - endDateWeek;
      const weeks = Math.floor(diffWeekDays/7);
      const duration = weeks*5 + (stareDateWeek==0?0:(6-stareDateWeek)) + (endDateWeek===0?0:endDateWeek<=5?endDateWeek:5);
      this.formData.data.plan_end_time = endDate.format(this.formData.sheetConfig["plan_end_time"].format);
      this.formData.data.workday_duration = duration + "";
    }else{
      this.formData.data.plan_end_time = undefined;
      this.formData.data.workday_duration = "";
    }
  }
  //关联单选
  showRelevanceTable: boolean = false;
  relevanceCode: string = '';
  relevanceQueryCode: string = '';
  relevanceConditions: string = '';
  relevanceParentKey: string = '';
  addFormQuery: any = {
    schemaCode: 'XTSJ_project',
    sheetCode: 'XTSJ_project',
    queryCode: 'XTSJ_project',
    return:`${this.$route.fullPath}&iframeAction=add`,
    iframeAction: 'add',
  }
  openRelevanceTable(type:string) {
    this.relevanceConditions = this.formData.sheetConfig[type].conditions as string;
    this.relevanceCode = this.formData.sheetConfig[type].schemaCode as string;
    this.relevanceParentKey = this.formData.sheetConfig[type].parentKey as string;
    this.relevanceQueryCode = this.formData.sheetConfig[type].queryCode as string;
    this.showRelevanceTable = true
  }
  //relevance -start
  projectCode: string = '';
  goFormDetail(schemaCode:string,objectId:string) {
    if(!schemaCode||!objectId) return;
    this.projectCode = this.appCode??'';
    Utils.goForm(this,'edit',null,this.isDingTalk,objectId,schemaCode)
  }
  // 显示字段 控件值解析
  trnasDisplayFieldValue(val: any, field: string) {
    // console.log(val,field,'fieldValue')
    if (val === null || val===undefined || val==='') return "请选择";
    if (typeof val === "object") {
      try {
        if (val instanceof Date) {
          return common.utils.DateHandle.dateFormat(val, "YYYY-MM-DD HH:mm:ss");
        } else if (Array.isArray(val)) {
          if (val.length === 1) {
            return val[0].name;
          } else {
            return val.reduce((c, item) => `${c}、${item.name}`, "").slice(1);
          }
        } else if (
          val &&
          (val.hasOwnProperty("adress") ||
            val.hasOwnProperty("provinceName") ||
            val.hasOwnProperty("cityName") ||
            val.hasOwnProperty("districtName"))
        ) {
          return `${val.provinceName || ""}${val.cityName || ""}${
            val.districtName || ""
          }${val.address || ""}`;
        } else {
          return val;
        }
      } catch (e) {
        return val;
      }
    } else {
      try {
        let a = JSON.parse(val);
        if (typeof a === "object") {
          return `${a.provinceName || ""}${a.cityName || ""}${
            a.districtName || ""
          }${a.address || ""}`;
        } else {
          if (field === "sequenceStatus") {
            switch (a) {
              case "DRAFT":
                a = "草稿";
                break;
              case "PROCESSING":
                a = "进行中";
                break;
              case "COMPLETED":
                a = "已完成";
                break;
              case "CANCELED":
                a = "已作废";
                break;
              default:
                break;
            }
            return a;
          }
          if (a === true) {
            return "是";
          } else if (a === false) {
            return "否";
          }
          if (field === "createdTime") {
            if (!val) return "";
            let theDate = val;
            if (val.indexOf("T") > 0) {
              theDate = val;
            } else {
              theDate = val.replace(/-/g, "/");
            }
            return common.utils.DateHandle.dateFormat(
              new Date(theDate),
              "YYYY-MM-DD HH:mm:ss"
            );
          }
          return val;
        }
      } catch (e) {
        if (field === "sequenceStatus") {
          switch (val) {
            case "DRAFT":
              val = "草稿";
              break;
            case "PROCESSING":
              val = "进行中";
              break;
            case "COMPLETED":
              val = "已完成";
              break;
            case "CANCELED":
              val = "已作废";
              break;
            default:
              break;
          }
        }
        if (val === true) {
          return "是";
        } else if (val === false) {
          return "否";
        }
        if (field === "createdTime") {
          if (!val) return "";
          let theDate = val;
          if (val.indexOf("T") > 0) {
            theDate = val;
          } else {
            theDate = val.replace(/-/g, "/");
          }
          return common.utils.DateHandle.dateFormat(
            new Date(theDate),
            "YYYY-MM-DD HH:mm:ss"
          );
        }
        return val;
      }
    }
  }
  closeRelevanceModal() {
    this.showRelevanceTable = false;
  }
  bindPerson(data:any) {
    this.formData.data.glid.engineering_name = data.engineering_name;
    this.formData.data.glid.id = data.id;
    this.formData.data.engineering_number = data.engineering_number;
    this.formData.data.engineering_name = data.engineering_name;
    this.formData.data.engineering_location = data.engineering_location;
    this.formData.data.year = data.year;
    this.formData.data.industryType = data.industryType;
    this.formData.data.projectType = data.projectType;
    this.formData.data.engineeringType = data.engineeringType;
    this.formData.data.constructionPhase =  !this.getMultiple('constructionPhase')?data.constructionPhase:data.constructionPhase && data.constructionPhase.length?data.constructionPhase.split(';'):[];
  }
  //TODO 模式选项  - label动态处理
  modelTypeConfig: ModelTypeConfig[] = [];
  //TODO 获取模式下拉框配置
  getModelTypeConfig() {
    getTableList({
      filters: [],
      mobile:false,
      page: 0,
      queryCode: 'XTSJ_field_mapping',
      schemaCode: 'XTSJ_field_mapping',
      size: 99999
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      if(!res.data.content) return;
      this.modelTypeConfig = res.data.content.map((item)=> {
        const m:ModelTypeConfig = {
          modelType: item.data.modelType,
          tableCode: item.data.tableCode,
          propertyCode: item.data.propertyCode,
          appearance: item.data.appearance
        }
        return m;
      })
      this.modelTypeConfig = this.modelTypeConfig.filter((i)=> {
        return i.tableCode === 'XTSJ_xmlb'
      })
      this.changeLabelByModelTypeValue()
      console.log(this.modelTypeConfig,1111)
    })
  }
  //TODO 改变表单选项label
  changeLabelByModelTypeValue() {
    if (!this.formData.data.modelType) return;
    let m: ModelTypeConfig[] =[];
    m = this.modelTypeConfig.filter((item)=> item.modelType===this.formData.data.modelType)
    m.map((i)=> {
       if (this.formData.data.hasOwnProperty(i.propertyCode)) {
         this.formData.sheetConfig[i.propertyCode].name = i.appearance
       }
    })
  }
  @Watch('formData.data.modelType',{ deep:true})
  modelTypeListener(val) {
    this.changeLabelByModelTypeValue()
  }
}
