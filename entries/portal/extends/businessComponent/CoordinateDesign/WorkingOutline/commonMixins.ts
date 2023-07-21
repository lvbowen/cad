import {Component, InjectReactive, Vue} from 'vue-property-decorator';
import {message} from "@h3/antd-vue";
import moment from "moment";
import { ValidationRule } from '@h3/antd-vue/types/form/form';
import { SheetConfig,SheetData } from '../../../service/CoordinateDesign/common';
import {workflowBaseInfo,WorkFlowInfo} from "../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignOutline"
import { ControlHelper } from '@cloudpivot/form/src/common/controls/control-helper';
import {DataItemType} from "@cloudpivot/form/src/schema/data-item-type";
import {FormControlType} from "@cloudpivot/form/src/schema/form-control-type";
import {DateItemOperatorType,logicDataItemOperators,numberDataItemOperators,sequenceStatusOperators,staffDataItemOperators,textDataItemOperators} from "@cloudpivot/form/src/common/data-item/data-item2";
import { listApi } from '@cloudpivot/api';
import flow from "@cloudpivot/flow/pc";
import Workflow from "../../../../src/views/form/workflow-track/workflow-trackNew.vue"
import ApplicationList from "@cloudpivot/list/src/components/pc/application-list.vue";
import staffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import Utils from '../../../utils';
import common from "../../../../../../modules/@cloudpivot/common";
import {ModelTypeConfig} from "../../../type";
import {getTableList} from "../../../service/api";
import { isArray } from "xe-utils";
import { triggerProfessionTask } from "../../../service/CoordinateDesign/WorkingOutline/ProjectPlanning";

@Component({
  name:"commonMixins",
  components:{
    Workflow,
    ApplicationList,
    staffSelector,
    Approval: flow.components.Approval,
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
export class CommonMixins extends Vue{
  @InjectReactive("project") projectCode!: string;
  userInfo:{id:string,name:string,departmentId:string,departmentName:string;imgUrl:string|null,unitType:number}={id:"",name:"",departmentId:"",departmentName:'',imgUrl:null,unitType:0};

  formData:{data:{[key:string]:any},
    rules:{[key:string]:(ValidationRule|{trigger:'blur' | 'change' | ['change', 'blur']})[]},
    sheetConfig:SheetConfig,
    optionsWatch:{[key:string]:()=>void},
    options:{[key:string]:{value:string,label:string,key:number,disabled:boolean}[]}}={
      data:{},
      rules:{},
      sheetConfig:{},
      optionsWatch:{},
      options:{},
  }
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
    if(this.formData.sheetConfig[key]){
      return this.formData.sheetConfig[key].name;
    }else{
      console.error(`无法获取字段[${key}]数据字段名称`);
      return "";
    }
  }
  /* 获取是否多选 */
  getMultiple(key:string){
    if(this.formData.sheetConfig[key]){
      return this.formData.sheetConfig[key].multi;
    }else{
      console.error(`无法获取字段[${key}]是否多选`);
      return false;
    }
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
    // debugger
    if(!displayFormula)return false;
    if ( displayFormula.indexOf( "&&" ) > -1 ) {
      // 多个And条件解析
      const andArr: any[] = displayFormula.split( "&&" );
      return andArr.every( ( item ) => {
        return this.checkCondition(item);
      } );
    } else if ( displayFormula.indexOf( "||" ) > -1 ) {
      // 多个Or条件解析
      const orArr: any[] = displayFormula.split( "||" );
      return orArr.some( ( item ) => {
        return this.checkCondition(item);
      } );
    } else {
      // 只有一个条件解析
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
                return propertyVal == Boolean(val);
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
                  return propertyVal && propertyVal.indexOf( val ) > -1;
                case DateItemOperatorType.NotEqual:
                  return propertyVal && propertyVal.indexOf( val ) === -1;
                case DateItemOperatorType.In:
                  return val && val.indexOf( propertyVal ) > -1;
                case DateItemOperatorType.NotIn:
                  return val && val.indexOf( propertyVal ) === -1;
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
    if(this.formData.sheetConfig[propertyName]){
      return this.formData.sheetConfig[propertyName].readonly;
    }else{
      console.error(`无法获取字段[${propertyName}]是否可编辑`);
      return true;
    }
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
          this.$set(this.formData.options,key,[])
        }
        return this.formData.options[key];
      }
    }
  }
  updateOptions(key:string,isRadio:boolean=false,isUseSoftwareName?:boolean){
    const {sheetConfig:config} = this.formData;
    const value = config[key].options;
    this.formData.options[key] = [];
    if(!value)return;
    const optionsSet = this.isJSONString(value)?JSON.parse(value):value;
    const schemaCode = optionsSet.schemaCode;
    const sheetDataItem = optionsSet.sheetDataItem;
    const orderByFields: string[] = optionsSet.orderByFields ? [ optionsSet.orderByFields ] : [];
    const orderType: number = optionsSet.orderType ? Number(optionsSet.orderType) : 3;
    const filters: any[] = [];
    if(optionsSet.condition && !isUseSoftwareName){
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
        this.formData.options[key] = data;
        //定制-设计任务单-使用软件名称
        if (key==='use_software_name' && isArray(data) && (!data.length || data.length===1 && data[0].label==="请选择")) {
          debugger
          this.updateOptions(key,isRadio,true)
        }
      }
    });
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
  /* 更新SheetConfig(生产任务单需单独更新)  待处理：重名子表字段处理？*/
  updateSheetConfig(isCreate:boolean,data:SheetData<{[key:string]:any}>,entry?:boolean){
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
        //@ts-ignore
        if(element.subDataPermission) {
          element.subDataPermission.map((subD) => {
            if(!this.formData.sheetConfig[subD.propertyCode]) return;
            //暂时处理 XTSJ_xmsqb（工作大纲）表格  重名子表字段处理
            if (subD.propertyCode === 'project_manager') return;
            this.formData.sheetConfig[subD.propertyCode] = {
              ...this.formData.sheetConfig[subD.propertyCode],
              visible:subD.v,
              readonly:!subD.e,
              required:subD.r||this.checkRequired(this.formData.sheetConfig[subD.propertyCode].requiredFormula)||this.formData.sheetConfig[subD.propertyCode].required,
            }
          })
        }
        if(isCreate){
          if(this.formData.sheetConfig[key].defaultValue){
            let value = this.formData.sheetConfig[key].defaultValue;
            if(typeof value ==="string"){
              if (entry) {
                value = this.formData.data[key];
              }else {
                if(this.formData.sheetConfig[key].type === 50){
                  value = JSON.parse(value);
                }
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
  /* 流程信息 */
  async getWorkflowBaseInfo(workflowInstanceId:string){
    try {
      const {errcode,errmsg,data} = await workflowBaseInfo({workflowInstanceId});
      if(errcode){
        return this.$message.error(`获取流程状态失败,${errmsg}`);
      }
      this.workFlowInfo = data??this.workFlowInfo;
      if (this.workFlowInfo.participants && this.workFlowInfo.participants.length && this.workFlowInfo.participants[0].activityName==='专业任务单下发') {
        this.triggerProfessionTask();
      }
    } catch (error) {
      this.$message.error(`获取流程状态异常,${error}`);
    }
  }
  //工作大纲-所有人签收完成-调用
  triggerProfessionTask() {
    triggerProfessionTask({
      appCode: this.projectCode??'',
      id:  this.formData.data.id??""
    }).then((res)=> {})
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
  //relevance -start
  goFormDetail(schemaCode:string,objectId:string) {
    if(!schemaCode||!objectId) return;
    Utils.goForm(this,'edit',null,this.isDingTalk,objectId,schemaCode)
  }
  // 显示字段 控件值解析
  trnasDisplayFieldValue(val: any, field: string) {
    // console.log(val,field,'fieldValue')
    if (val === null || val===undefined || val==='') return "";
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
        } else if(val.hasOwnProperty('displayCode')) {
          // @ts-ignore
          return val[val.displayCode] || val
        }else {
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
  //end
  created(){
    this.userInfo=JSON.parse(sessionStorage.getItem("user") as string);
    setTimeout(()=> {
      this.userInfo=JSON.parse(sessionStorage.getItem("user") as string);
      console.log(this.userInfo,'userInfo')
    },2000)
  }
  //TODO 模式选项  - label动态处理
  modelTypeConfig: ModelTypeConfig[] = [];
  //TODO 获取模式下拉框配置
  getModelTypeConfig(schemaCode:string,tableCode:string) {
    getTableList({
      filters: [],
      mobile:false,
      page: 0,
      queryCode: schemaCode,
      schemaCode: schemaCode,
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
        return i.tableCode === tableCode
      })
      this.changeLabelByModelTypeValue();
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
  replyType:string[] = [];
  getReplyType() {
    this.replyType = [];
    listApi.listSkipQueryList({
      "filters": [],
      "mobile": false,
      "page": 0,
      "queryCode": "XTSJ_cyhfy",
      "schemaCode": "XTSJ_cyhfy",
      "size": 999
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.replyType = res.data.content.map((item)=> {
        return item.data.replyType
      })
    })
  }
}
