import { Component, Mixins,InjectReactive ,Prop ,Ref ,Watch } from 'vue-property-decorator';
import { FormModel,Collapse,DatePicker,Switch,Select } from "@h3/antd-vue";
import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Timeline from 'ant-design-vue/lib/timeline';
import 'ant-design-vue/lib/timeline/style/index.css';
import OpinionsModal from "./OpinionsModal.vue";
import { yunFileUpload } from "../../../../service/CoordinateDesign/documentLibrary";
import {UUID,replayToken,submit,save,agree,reject,loadSheetData,sheetConfig, SheetConfig, SheetData,uploadFile,workflowInstanceFlag} from "../../../../service/CoordinateDesign/common";
import { ValidationRule } from '@h3/antd-vue/types/form-model/form';
//@ts-ignore
import env from '@/config/env';
import moment,{Moment} from 'moment';
import { CommonMixins } from "../commonMixins";
import {
  getCommonReplys,
  getWorkOutlineInfo,
  getProfessionalTask,
  getContentItemRule,
  getChildTableData,
} from "../../../../service/api";
import {HttpResponse} from "@cloudpivot/api/src/response";
import EditableCell from "./components/editTableCell.vue";
import EditWorkOutlinePanel from "./components/EditWorkOutlinePanel.vue";
import WorkOutlineModels from "./components/WorkOutlineModels.vue";
import AchievementUpload
  from "../ProfessionalTask/ProfessionalDesignTask/components/AchievementUpload.vue";
import {
  BizObject,
  exportWorkOutlineInfoTemplate,
  importWorkOutlineInfoTemplate,
  mergeWorkOutlinePara,
  getWorkOutlineAdjustPermission,
  updateWorkOutlineStatus,
  exportDesignPersonGroup,
  activateActivity,
  getChiefOpinion,
  signChiefOpinion,
  getModelTransGeneral,
  // saveDesignFile,
  transferModelGeneral
} from "../../../../service/CoordinateDesign/WorkingOutline/ProjectPlanning";
import {listApi} from "@cloudpivot/api";
import RelevanceFormModal from "../../compoents/RelevanceFormModal.vue";
import {
  WorkOutlineChapter,
  WorkOutlineModel,
  YunAttachmentFile,
  TableColumn,
  ChiefOpinion,
  ModelAttachment,
} from "../../../../type";
import {
  createOnlineWebFile, delOnlineWebFile,
  saveOnlineWebFile
} from "../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignTask";
import { isArray } from "xe-utils";
import Utils from "../../../../utils";
import RichText from '../../../../basicCustomComponent/RichText/RichText'
import {achievementFormatConfig} from "../../publicConfig";
import { getNewModelTransGeneral } from "../../../../service/CoordinateDesign/WorkingOutline/DesignAchievement";
import {getDecryptFile} from "../../../../service/CoordinateDesign/base";

type ModalConfiguration={visible:boolean,actionCode:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',showComment:boolean,title?:string,okText?:string,confirmLoading?:boolean,OK?:()=>void,afterClose?:()=>void};
type selectorOption = { id:string,name:string,type:number };
interface Data{
  id:string|null|undefined,
  workItemId:string|null|undefined,
  workflowTokenId:string|null|undefined,
  workflowInstanceId:string|undefined|null,
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
  project_id:any|null|undefined,
  engineering_name: string|undefined|null,
  engineering_number:string|undefined|null,
  engineering_location:string|undefined|null,
  manufacturer_chief_engineer: string,
  industryType:string|undefined|null,
  projectType:string|undefined|null,
  engineering_stage:string|undefined|null,
  task_type:string|undefined|null,
  project_level:string|undefined|null,
  modelType: string;

  manufacturer:selectorOption[]|undefined|null,
  project_manager:selectorOption[]|undefined|null,
  manufacturer_chief:selectorOption[]|undefined|null,
  manufacturer_manager:selectorOption[]|undefined|null,
  company_chief:selectorOption[]|undefined|null,
  company_manager:selectorOption[]|undefined|null,
  project_begin_time:string|undefined|null,
  project_end_time:string|undefined|null,
  XTSJ_design_person:{id:string,offical_outline:"是"|"否"}[]|null|undefined,
  XTSJ_workoutline_para:any[],
  attachment:any[],
  feedback_creater:string|undefined|null,
  chief_feedback:string|undefined|null,
  unsigned_ids:[]|null|undefined,
  signed_ids:[]|null|undefined,
  official_chief?: any[];
  official_manager?: any[];
  modelReviewFlag:string|null|undefined,
  modelAttachment:any[]|undefined,
  modelers:selectorOption[]|undefined|null,
  engineeringType: string
} & Data;
@Component({
  name:"ProjectPlanning",
  components:{
    [Collapse.name]:Collapse,
    [Collapse.Panel.name]:Collapse.Panel,
    [DatePicker.name]:DatePicker,
    [Select.name]:Select,
    EditableCell,
    EditWorkOutlinePanel,
    WorkOutlineModels,
    APopover: Popover,
    RelevanceFormModal,
    AModal: Modal,
    AButton: Button,
    ATooltip: Tooltip,
    APopconfirm: Popconfirm,
    AInput: Input,
    AchievementUpload,
    RichText,
    ATimeline: Timeline,
    ATimelineItem: Timeline.Item,
    OpinionsModal
  }
})
export default class ProjectPlanning extends Mixins(CommonMixins) {
  @InjectReactive("project") appCode!: string;
  @Prop({required:true}) projectId!:string;
  @Prop() wProjectName!: string;
  @Ref("modalForm") productionForm!: FormModel;
  @Ref("dialogForm") dialogForm!:FormModel;

  approvalKey = 1;

  showWorkOutlineModels = false;
  workOutlineDataId: string = '';

  //#region 头部按钮切换
  leftButtonLinks={
    activeIndex:0,
    buttonLinks:[
      {name:"任务详情"},
      {name:"流程记录"},
      {name:"总工意见"}
    ]
  }
  leftButtonClick(index:number){
    this.leftButtonLinks.activeIndex=index;
  }
  //#endregion

  //权限按钮
  rightButtonLinks=[
    {name:"提交",type:"primary",visibleKey:"submitButton",showComment:false},
    {name:"暂存",type:"primary",visibleKey:"retainButton",showComment:false},
    {name:"接收",type:"primary",visibleKey:"receiveButton",showComment:false},
    {name:"同意",type:"primary",visibleKey:"agreeButton",showComment:true},
    {name:"驳回",type:"primary",visibleKey:"rejectButton",showComment:true},
  ]

  //表单数据
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
        project_id:{},
        engineering_name: undefined,
        engineering_number:undefined,
        engineering_location:undefined,
        manufacturer_chief_engineer: '',
        industryType:undefined,
        projectType:undefined,
        engineering_stage:undefined,
        task_type:undefined,
        project_level:undefined,
        modelType: '',
        engineeringType: '',
        manufacturer:undefined,
        project_manager:undefined,
        manufacturer_chief:undefined,
        manufacturer_manager:undefined,
        company_chief:undefined,
        company_manager:undefined,
        project_begin_time:undefined,
        project_end_time:undefined,
        XTSJ_design_person:undefined,
        XTSJ_workoutline_para:[],
        attachment:[],
        feedback_creater:undefined,
        chief_feedback:undefined,
        unsigned_ids:undefined,
        signed_ids:undefined,
        modelReviewFlag:undefined,
        modelAttachment:undefined,
        modelers:undefined,
      },
      rules:{},
      sheetConfig:{},
      optionsWatch:{},
      options:{},
  }

  //#region 表格配置
  columns = [
    {title:'序号',align:'center',customRender:(text,record,index)=>`${index+1}`,width: 80,},
    {dataIndex:'project_major',key:'project_major',slots:{title:'project_major'},scopedSlots: {customRender: 'project_major-content'},align: 'center',},
    // {dataIndex: 'professionManagePermit',key: 'professionManagePermit',slots: {title: 'professionManagePermit'},scopedSlots: {customRender: 'professionManagePermit-content'},align: 'center'},
    // {dataIndex: 'professionPermit',key: 'professionPermit',slots: {title: 'professionPermit'},scopedSlots: {customRender: 'professionPermit-content'},align: 'center'},
    {
      dataIndex: 'official_manager',
      key: 'official_manager',
      slots: {title: 'official_manager'},
      scopedSlots: {customRender: 'official_manager-content'},
      align: 'center'
    },
    // {
    //   dataIndex: 'official_chief',
    //   key: 'official_chief',
    //   slots: {title: 'official_chief'},
    //   scopedSlots: {customRender: 'official_chief-content'},
    //   align: 'center'
    // },
    {dataIndex: 'plan_begin_time',key: 'plan_begin_time',slots: {title: 'plan_begin_time'},scopedSlots: {customRender: 'plan_begin_time-content'},align: 'center',width: 200,},
    {dataIndex: 'plan_end_time',key: 'plan_end_time',slots: {title: 'plan_end_time'},scopedSlots: {customRender: 'plan_end_time-content'},align: 'center',width: 200,},
    {dataIndex: 'plan_duration',key: 'plan_duration',slots: {title: 'plan_duration'},align: 'center',width: 130,},
    {title: '专业设计提纲',dataIndex: 'offical_outline',key: 'offical_outline',align: 'center',width: 150,scopedSlots: {customRender: 'offical_outline-content'},
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor: '#bfbfff',
        },
      }),},
  ];

  get rowSelection() {
    return {
      onChange: this.taskRowSelect,
      selectedRowKeys: this.taskRowSelectedRows.map((item) => item.id),
      getCheckboxProps: (record) => {
        return {
          props: {
            disabled: record.disabled === !this.itemEdit("XTSJ_design_person"),
            name: record.name,
          }
        };
      }
    };
  }

  taskRowSelect(selectedRowKeys, selectedRows) {
    this.taskRowSelectedRowKeys = selectedRowKeys;
    this.taskRowSelectedRows = selectedRows;
  }

  /*专业设计提纲-checkbox*/
  designOutlineChange(record) {
    record['offical_outline'] = record['offical_outline'] === '是' ? '否' : '是';
    this.taskDataTwoNum++;
  }

  /*是否公司总工审核-checkbox*/
  auditChange(record) {
    record['chief_audit_flag'] = record['chief_audit_flag'] === '是' ? '否' : '是';
    this.taskDataTwoNum++;
  }

  /*计算书-checkbox*/
  calculationBookChange(record) {
    record.calculation = record.calculation === '是' ? '否' : '是';
    this.taskDataTwoNum++;
  }
  /*专业任务划分*/
  startTimeChangeOne(date: string, dateString: string) {
    this.taskDataOne[0].startTime = date;
  }

  endTimeChangeOne(date: string, dateString: string) {
    this.taskDataOne[0].endTime = date;
  }

  startTimeChangeTwo(date: string, dateString: string,index:number,id:string) {
    if (this.taskRowSelectedRowKeys.includes(id)) {
      this.taskDataTwo.map((item,itemIndex)=> {
        if (this.taskRowSelectedRowKeys.includes(item.id)) {
          let duration:number|null = null;
          if(date&&this.taskDataTwo[itemIndex]['plan_end_time']){
            duration=parseInt(moment(this.taskDataTwo[itemIndex]['plan_end_time']).diff(moment(date),"days")+1+"");
            if(!duration || duration<0 || duration===0) {
              return this.$message.error(`设计组人员：序号:${itemIndex+1},开始时间不得大于结束时间！`);
            }
            this.taskDataTwo[itemIndex]['plan_begin_time'] = date;
            this.taskDataTwo[itemIndex]['plan_duration'] = duration;
          }
        }
      })
    } else {
      this.taskDataTwo[index]['plan_begin_time'] = date;
      if(this.taskDataTwo[index]['plan_begin_time']&&this.taskDataTwo[index]['plan_end_time']){
        this.taskDataTwo[index]['plan_duration']=moment(this.taskDataTwo[index]['plan_end_time']).diff(moment(this.taskDataTwo[index]['plan_begin_time']),"days")+1+"";
      }
    }
  }

  endTimeChangeTwo(date: string, dateString: string,index:number,id:string) {
    if (this.taskRowSelectedRowKeys.includes(id)) {
      this.taskDataTwo.map((item,itemIndex)=> {
        if (this.taskRowSelectedRowKeys.includes(item.id)) {
          let duration:number|null = null;
          if (this.taskDataTwo[itemIndex]['plan_begin_time'] && date) {
            duration = parseInt(moment(date).diff(moment(this.taskDataTwo[itemIndex]['plan_begin_time']), "days") + 1 + "");
            if(!duration || duration<0 || duration===0) {
              return this.$message.error(`设计组人员：序号:${itemIndex+1},开始时间不得大于结束时间！`);
            }
            this.taskDataTwo[itemIndex]['plan_end_time'] = date;
            this.taskDataTwo[itemIndex]['plan_duration'] = duration;
          }
        }
      })
    } else {
      this.taskDataTwo[index]['plan_end_time'] = date;
      if(this.taskDataTwo[index]['plan_begin_time']&&this.taskDataTwo[index]['plan_end_time']){
        this.taskDataTwo[index]['plan_duration']=moment(this.taskDataTwo[index]['plan_end_time']).diff(moment(this.taskDataTwo[index]['plan_begin_time']),"days")+1+"";
      }
    }
  }
  rangeStartPicker( val: Moment,index:number) {
    return moment( val ).valueOf() > moment( this.taskDataTwo[index]['plan_end_time'] ).valueOf();
  }
  rangeEndPicker( val: Moment,index:number  ) {
    return moment( this.taskDataTwo[index]['plan_begin_time'] ).valueOf() > moment( val ).valueOf();
  }
  project: any = {};
  async editchange(key, record, value) {
    this.project = record;
    this.visible = true;
    this.OkType = '编辑';
    this.selectedRowKeys = [];
    this.selectedRows = [];
    await this.getContentItemRule();
  }

  //#endregion

  //#region 常用回复语
  commonReplys:any={};//常用回复语
  /*选中常用语*/
  tagChange(item){
    this.dialogTaskForm.formData.comment=item;
  }
  //#endregion

  projectProfessionalColumns: Array<any> = [
    {
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      width: 60,
    },
    {
      title: '专业名称',
      dataIndex: 'name',
      key: 'name',
      scopedSlots: {customRender: 'projectProfessional-name'},
      align: 'center',
    },
  ]
  projectProfessionalList: Array<any> = []
  selectedRowKeys: Array<any> = []
  selectedRows: any = []
  OkType: string = '';
  professionalName: string = '';
  copyProjectProfessionalList: any[] = [];
  filterProfessional(e:any) {
    this.professionalName = e.target.value;
    this.projectProfessionalList = this.copyProjectProfessionalList.filter((item)=> {
      return item.name.indexOf(this.professionalName)>-1
    })
  }
  /* 专业任务划分 */
  taskColumnsOne: Array<any> = [
    {
      dataIndex: 'startTime',
      key: 'startTime',
      slots: {title: 'startTime'},
      scopedSlots: {customRender: 'startTime-content'},
      align: 'center'
    },
    {
      dataIndex: 'endTime',
      key: 'endTime',
      slots: {title: 'endTime'},
      scopedSlots: {customRender: 'endTime-content'},
      align: 'center'
    },
  ];
  taskDataOne: Array<any> = [
    {
      key: '1',
      startTime: '',
      endTime: '',
    },
  ];
  taskDataTwo: Array<any> = [];
  taskDataTwoCopy: Array<any> = [
    {
      id: null,
      'project_major': '',
      'official_chief': null,
      'professionManagePermit':{},
      'professionPermit':{},
      'official_manager': null,
      'plan_begin_time': null,
      'plan_end_time': null,
      'plan_duration': null,
      'project_manager': null,
      'offical_outline': '否',
      'chief_audit_flag': '否',
      calculation: '否',
    }
  ];
  taskRowSelectedRowKeys: Array<any> = []
  taskRowSelectedRows: Array<any> = []
  taskDataTwoNum: number = 0;

  async created(){
    this.getReplyType();
    this.modelAttachmentFormatConfig = `${achievementFormatConfig},${achievementFormatConfig.toUpperCase()}`;
    const config = await sheetConfig({sheetCode:"XTSJ_xmsqb",schemaCode:"XTSJ_xmsqb"});
    if(typeof config ==="string"){
      return this.$message.error(`获取专业任务提纲初始配置失败,${config}`);
    }
    this.formData.sheetConfig =  config;
    this.getWorkOutline();
  }
  //TODO 驳回 （项目经理）
  isShowRejectBtn: boolean = false;
  getShowRejectBtnPermission() {
    getWorkOutlineAdjustPermission({
      id: this.formData.data.id??'',
      appCode: this.appCode??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.isShowRejectBtn = res.data.adjust;
      this.rejectActiveCode = res.data.activityCode;
    })
  }
  rejectActiveCode: string  = '';
  rejectNode() {
    activateActivity({
      activityCode: this.rejectActiveCode,
      workflowInstanceId: this.formData.data.workflowInstanceId??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      updateWorkOutlineStatus({
        id: this.formData.data.id??'',
        appCode: this.appCode??''
      }).then((r)=> {
        this.$message.success('变更成功！')
        this.getWorkOutline();
      })
    })
  }
  //TODO end

  async getWorkOutline(){
    // this.copyDataModelAttachment = [];
    const {appCode,projectId} = this;
    try {
      const res = await getWorkOutlineInfo({appCode,projectId});
      if(res.errcode){
        return this.$message.error(`获取项目策划失败,${res.errmsg}`);
      }

      let workflowInstanceId = "";
      let workItemId = "";
      workflowInstanceId = res.data.workOutlineData?.workflowInstanceId;
      workItemId = res.data.workOutlineData?.workitemId;
      this.workOutlineDataId =  res.data.workOutlineData?.id??'';
      if (this.workOutlineDataId) {
        this.getChiefOpinion();
      }
      // if (this.workOutlineDataId && !this.modelAttachments.length) {
      //   this.getModelAttachments();
      // }
      const isCreate = !Boolean(workflowInstanceId);
      const {errcode,errmsg,data} = isCreate? await loadSheetData<LoadData>({startWorkflowCode:"XTSJ_xmsqb"}) : await loadSheetData<LoadData>({workflowInstanceId,workitemId:workItemId})
      if(res.errcode){
        return this.$message.error(`获取项目策划失败,${res.errmsg}`);
      }
      if(isCreate && !res.data.buttonAuth.createButton){
        return this.$message.warning("此工作大纲尚未创建！")
      }
      //@ts-ignore
      if(Array.isArray(data.logInfoList) && data.logInfoList.length) {
        //@ts-ignore
        this.activityCode = data.logInfoList[data.logInfoList.length-1].activityCode;
      }
      this.formData.data = {
        ...data!.bizObject.data,
        id:data?.bizObject.id,
        workflowTokenId:data?.workflowTokenId??null,
        workItemId:data?.workItemId??null,
        workflowInstanceId:data?.workflowInstanceId,
        activityCode:data?.activityCode,
        activityName:data?.activityName,
        rejectToActivityCode:res.data?.rejectToActivityCode,
        project_begin_time:data?.bizObject.data.project_begin_time??undefined,
        project_end_time:data?.bizObject.data.project_end_time??undefined,
        modelAttachment:data?.bizObject.data.modelAttachment??[],
        attachment: data?.bizObject.data.attachment??[],
        submitButton: res.data.buttonAuth.submitButton as boolean,
        retainButton: res.data.buttonAuth.saveButton as boolean,
        receiveButton : res.data.buttonAuth.reciveButton as boolean,
        agreeButton:res.data.buttonAuth.agreeButton as boolean,
        rejectButton:res.data.buttonAuth.rejectButton as boolean,
        //@ts-ignore
        engineering_location: data?.bizObject.data.engineering_location??'',
        manufacturer_chief_engineer: data?.bizObject.data.manufacturer_chief_engineer??'',
        modelReviewFlag:data?.bizObject.data.modelReviewFlag??null,
        //@ts-ignore
        project_id: data?.bizObject.data?.project_id??{},
        modelers: data?.bizObject.data?.modelers??[]
      }
      // this.copyDataModelAttachment = JSON.parse(JSON.stringify(this.formData.data.modelAttachment))
      this.getModelAttachment();
      this.getShowRejectBtnPermission();
      //更新专业任务
      this.taskDataTwo = this.formData.data.XTSJ_design_person?.map((item,index)=>{
        return {
          ...item,
          offical_outline:item.offical_outline
        }
      })??[];
      this.designParaKey++;
      if(!workflowInstanceId) {
        this.listSkipQueryList();
      }else {
        this.getModelTypeConfig('XTSJ_field_mapping','XTSJ_xmsqb');
      }
      this.updateSheetConfig(isCreate,data as SheetData<LoadData>);
      //创建数据校验规则
      this.createRules();
      //更新节点信息
      if(this.formData.data.workflowInstanceId){
        await this.getWorkflowBaseInfo(this.formData.data.workflowInstanceId as string);
        this.calcUsedTime();
        // this.getWorkOutlineBindModel();
      }

    } catch (error) {
      return this.$message.error(`获取项目策划异常,${error}`)
    }
  }


  actionButtonClick(item:{visibleKey:string,name:string,showComment:boolean}){
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
    if (this.isValidate) {
      this.showOpinionModal = true;
      this.opinionTitle = item.name
    }else {
      this.dialogModalConfiguration.visible=true
    }
    this.dialogModalConfiguration.actionCode=item.visibleKey as 'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',
    this.dialogModalConfiguration.okText=item.name;
    this.dialogModalConfiguration.showComment=item.showComment;
    this.dialogModalConfiguration.title=`确认${item.name}此项目策划`
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
    const {data:formatDate} = this.formData;
    return {
      id:formatDate.id??id,
      data: {
        XTSJ_design_person:this.taskDataTwo.map(item=>{
          return {
            ...item,
            project_manager: formatDate.project_manager,
            // official_chief:[
            //   {id:item.professionPermit.user_id[0].id,type:3}
            // ]
          }
        })??[],
        XTSJ_workoutline_para: formatDate.XTSJ_workoutline_para,
        attachment:formatDate.attachment??[],
        chief_feedback:formatDate.chief_feedback??null,
        company_chief:formatDate.company_chief??null,
        company_manager:formatDate.company_manager??null,
        engineering_location:formatDate.engineering_location??null,
        manufacturer_chief_engineer: formatDate.manufacturer_chief_engineer??'',
        engineering_name: formatDate.engineering_name??null,
        engineering_number:formatDate.engineering_number??null,
        engineering_stage: formatDate.engineering_stage??null,
        feedback_creater: formatDate.feedback_creater??null,
        industryType: formatDate.industryType??null,
        manufacturer:formatDate.manufacturer??null,
        manufacturer_chief:formatDate.manufacturer_chief??null,
        manufacturer_manager:formatDate.manufacturer_manager??null,

        projectType:formatDate.projectType??null,
        project_begin_time:formatDate.project_begin_time??null,
        project_end_time:formatDate.project_end_time??null,
        project_level:formatDate.project_level??null,
        modelType: formatDate.modelType??'',
        engineeringType: formatDate.engineeringType??'',
        project_manager:formatDate.project_manager??null,
        signed_ids:formatDate.signed_ids??null,
        task_type:formatDate.task_type??null,
        unsigned_ids:formatDate.unsigned_ids??null,
        modelReviewFlag:formatDate.modelReviewFlag??null,
        modelAttachment:formatDate.modelAttachment??null,
        modelers:formatDate.modelers??null,

        id: formatDate.id??id,
        project_id:formatDate.project_id.id??'',
      },
      schemaCode: "XTSJ_xmsqb",
      sheetCode: "XTSJ_xmsqb",
      workflowInstanceId: formatDate.workflowInstanceId??null,
    }
  }
  /**
   *
   * @param actionCode
   * @param showComment
   * @param updateStatus
   */
  async actions(actionCode:'submitButton'|'retainButton'|'receiveButton'|'agreeButton'|'rejectButton',showComment:boolean,updateStatus?:boolean){
    this.dialogModalConfiguration.confirmLoading=true;
    const {userInfo,formData,getBizObjectData} = this;
    const {departmentId,imgUrl,name,unitType} = userInfo;
    //意见建议校验
    if (!this.isValidate){
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
        if (!this.taskDataTwo.length && this.activityCode==='edit_workoutline') return this.$message.error('设计组人员必填!')
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
      for (let index = 0; index < this.taskDataTwo.length; index++) {
        const item = this.taskDataTwo[index];
        if (item['project_major'] === null || item.project_major === undefined || item['project_major'] === '') return this.$message.error(`设计组人员：序号:${index+1},参加项目专业不能为空`);
        if (item['plan_begin_time'] === null || item.plan_begin_time === undefined || item['plan_begin_time'] === '') return this.$message.error(`设计组人员：序号:${index+1},计划开始时间不能为空`);
        if (item['plan_end_time'] === null || item.plan_end_time === undefined || item['plan_end_time'] === '') return this.$message.error(`设计组人员：序号:${index+1},计划结束时间不能为空`);
        // if (item['professionPermit'] === null || !item['professionPermit']["user_id"]) return this.$message.error(`设计组人员：序号:${index+1},专业负责人不能为空`);
        if(item.official_manager === null || item.official_manager === undefined || (Array.isArray(item.official_manager) && !item.official_manager.length)){
          return this.$message.error(`设计组人员：序号:${index+1},专业负责人不能为空`)
        }
        if (!item.hasOwnProperty('participant')&&this.activityCode==='edit_workoutline') {
          // eslint-disable-next-line no-shadow
          const userInfo = sessionStorage.getItem('user');
          if (userInfo) {
            Object.assign(item, {participant: [{"id":JSON.parse(userInfo).id,"type":3}]})
          }
        }
        //TODO 专业负责人可以为多个

        // else if (item.official_manager.length>1) {
        //   return this.$message.error(`设计组人员：序号:${index+1},专业负责人只能选一个`)
        // };
        // if(item.official_chief === null || (Array.isArray(item.official_chief) && !item.official_chief.length)) return this.$message.error(`设计组人员：序号:${index+1},专业主管总工不能为空`);
      }
      const bizObject = getBizObjectData(id);
      if(actionCode==='retainButton'){
        res = await save({
          workItemId:formData.data.workItemId??null,
          workflowInstanceId:formData.data.workflowInstanceId??null,
          bizObject,
          departmentId,
          replayToken:token,
          workflowCode:"XTSJ_xmsqb"
        });
      }else if(actionCode==="submitButton"){
        res = await submit({
          workItemId:formData.data.workItemId??null,
          workflowInstanceId:formData.data.workflowInstanceId??null,
          bizObject,
          departmentId,
          replayToken:token,
          workflowCode:"XTSJ_xmsqb"
        });
        this.taskDataTwoNum++;
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
          workflowCode:"XTSJ_xmsqb"
        })
        this.taskDataTwoNum++;
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
          workflowCode:"XTSJ_xmsqb",
          rejectToActivityCode:'edit_workoutline',
        });
      }
      const { errcode,errmsg,data} = res!;
      if(errcode){
        return this.$message.error(`${this.dialogModalConfiguration.okText}失败,${errmsg}`);
      }
      this.dialogModalConfiguration.visible=false;
      if (this.activityCode==='Activity12' && actionCode==="retainButton") {
      }else {
        this.$message.success(`${this.dialogModalConfiguration.okText}成功`);
      }
      if (this.activityCode&&this.activityCode!=='receieve') {
        setTimeout(()=> {
          this.getWorkOutline();
        },1000)
      }else if (this.activityCode==='receieve'||!this.activityCode){
        setTimeout(()=> {
          this.getWorkOutline();
        },2800)
      }else {
        setTimeout(()=> {
          this.getWorkOutline();
        },1500)
      }
      this.approvalKey++;
    } catch (error) {
      this.$message.error(`${this.dialogModalConfiguration.okText}异常,${error}`);
    }finally{
      this.dialogModalConfiguration.confirmLoading=false;
      this.dialogModalConfiguration.visible=false;
    }
  }

  disabledStartDate(currentDate:Moment,endDateKey:string){
    const endValue = this.formData.data[endDateKey];
    if(!endValue||!currentDate) return false;
    return currentDate.valueOf()>moment(endValue).valueOf();
  }

  disabledEndDate(currentDate:Moment,startDateKey:string){
    const startValue = this.formData.data[startDateKey];
    if(!startValue||!currentDate) return false;
    return moment(startValue).valueOf()>=currentDate.valueOf();
  }
  //控制工作大纲-一键生成显影
  activityCode: string = '';
  OneTouch(){
    getProfessionalTask({
      appCode:this.appCode??'',
      projectId:this.projectId
    }).then(res=>{
      if(res.errcode===0){
        if (isArray(res.data) && !res.data.length) this.$message.warning('暂无数据！')
        const {taskDataTwo} = this;
        const newTaskDataTwo: any = []
        res.data.forEach(item => {
          if(this.taskDataTwo.some(el=>el.project_major===item)) return;
          newTaskDataTwo.push({
            id: this.uuid(),
            'project_major': item,
            'official_chief': null,
            'professionManagePermit':{},
            'professionPermit':{},
            'official_manager': null,
            'plan_begin_time': this.formData.data.project_begin_time,
            'plan_end_time': this.formData.data.project_end_time,
            'plan_duration': this.formData.data.project_end_time && this.formData.data.project_begin_time && moment(this.formData.data.project_end_time).diff(moment(this.formData.data.project_begin_time),"days")+1+"",
            'offical_outline': this.formData.data.engineering_stage==="施工图设计"?'是':'否',
            'chief_audit_flag': '否',
            calculation: '否',
            disabled: false,
          })
        })
        this.taskDataTwo = [...taskDataTwo, ...newTaskDataTwo];
      }else {
        this.$message.warn('一键生成失败')
      }
    })
  }

  visible=false;
  async getContentItemRule() {
    this.projectProfessionalList = [];
    this.copyProjectProfessionalList = [];
    try {
      const {errcode, errmsg, data} = await getContentItemRule({appCode: this.appCode ?? ''})
      if (errcode !== 0) return this.$message.error(errmsg as string);
      // @ts-ignore
      // eslint-disable-next-line no-shadow
      data.professionTypes.forEach((item, index) => {
        if(this.taskDataTwo.some(el=>el.project_major===item))return;
        // @ts-ignore
        this.projectProfessionalList.push({name: item, key: this.projectProfessionalList.length+1});
        this.copyProjectProfessionalList = JSON.parse(JSON.stringify(this.projectProfessionalList))
      })
    } catch (error) {
      this.$message.error(`error: ${error}`)
    }
  }
  async handleAdd() {
    this.visible = true;
    this.OkType = '新增';
    this.selectedRowKeys = [];
    this.selectedRows = [];
    await this.getContentItemRule();
  }

  customHeaderRow(column) {
    const cellStyle = "color: #333;background:#ffff;font-weight:bold;text-align:center"
    return {
      style: cellStyle
    }
  };

  onSelectChange(selectedRowKeys, selectedRows) {
    if (this.OkType === '新增') {
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRows = [];
      if (!this.selectedRowKeys.length) return;
      this.copyProjectProfessionalList.map((item)=> {
        if (this.selectedRowKeys.includes(item.key)) {
          this.selectedRows.push(item)
        }
      })
      // this.selectedRows = selectedRows;
    } else if (this.OkType === '编辑') {
      this.selectedRowKeys = selectedRowKeys.length > 0 ? [selectedRowKeys.reverse()[0]] : selectedRowKeys;
      this.selectedRows.push(selectedRows.reverse()[0]);
    }
  }

  handleCancel() {
    this.professionalName = '';
    this.visible = false;
  }

  handleOk() {
    this.professionalName = '';
    this.visible = false;
    if (this.OkType === '新增') {
      const {taskDataTwo} = this;
      const newTaskDataTwo: any = []
      this.selectedRows.forEach(item => {
        newTaskDataTwo.push({
          id: this.uuid(),
          'project_major': item.name,
          'official_chief': null,
          'professionManagePermit':{},
          'professionPermit':{},
          'official_manager': null,
          'plan_begin_time': this.formData.data.project_begin_time,
          'plan_end_time': this.formData.data.project_end_time,
          'plan_duration': moment(this.formData.data.project_end_time).diff(moment(this.formData.data.project_begin_time),"days")+1+"",
          'offical_outline': this.formData.data.engineering_stage==="施工图设计"?'是':'否',
          'chief_audit_flag': '否',
          calculation: '否',
          disabled: false,
        })
      })
      this.taskDataTwo = [...taskDataTwo, ...newTaskDataTwo];
    } else if (this.OkType === '编辑') {
      const record = this.selectedRows[0];
      this.project['project_major'] = record.name;
    }
    this.taskDataTwoNum++;

  }
  onDelete() {
    if (this.taskRowSelectedRowKeys.length === 0) return this.$message.info('请先选择删除对象')
    for (let i = 0; i < this.taskRowSelectedRowKeys.length; i++) {
      const index = this.taskDataTwo.findIndex(item => item.id === this.taskRowSelectedRowKeys[i]);
      if (index > -1) {
        this.taskDataTwo.splice(index, 1);
      }
    }
  }

  //TODO 关联任职资格 -start
  showRelevanceTable: boolean = false;
  relevanceCode: string = '';
  relevanceQueryCode: string = '';
  relevanceConditions: string = '';
  relevanceParentKey: string = '';
  selectedRowIndex: number = -1;
  selectedType: string = '';// 'professionManagePermit'| 'professionPermit';
  searchProjectMajor: string = '';
  openRelevanceTable(rowIndex:number,type:string,projectMajor:any) {
    this.selectedRowIndex = rowIndex;
    this.selectedType = type;
    this.relevanceConditions = this.formData.sheetConfig[type].conditions as string;
    this.relevanceCode = this.formData.sheetConfig[type].schemaCode as string;
    this.relevanceParentKey = this.formData.sheetConfig[type].parentKey as string;
    this.relevanceQueryCode = this.formData.sheetConfig[type].queryCode as string;
    this.showRelevanceTable = true
  }
  closeRelevanceModal() {
    this.selectedRowIndex = -1;
    this.selectedType = '';
    this.searchProjectMajor = '';
    this.showRelevanceTable = false;
  }
  bindPerson(data:any) {
    if(this.selectedType==='professionPermit') {
      this.$set(this.taskDataTwo[this.selectedRowIndex].professionPermit,'user_id',data.user_id)
      this.$set(this.taskDataTwo[this.selectedRowIndex].professionPermit,'id',data.id)
      this.taskDataTwo[this.selectedRowIndex].official_manager = data.user_id;
    }else if(this.selectedType==='professionManagePermit') {
      this.$set(this.taskDataTwo[this.selectedRowIndex].professionManagePermit,'user_id',data.user_id)
      this.$set(this.taskDataTwo[this.selectedRowIndex].professionManagePermit,'id',data.id)
      this.taskDataTwo[this.selectedRowIndex].official_chief = data.user_id;
    }
  }
  //TODO end

  //TODO 合成大纲
  modalTitle: string = '大纲成果制作区';
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
      workflowCode:"XTSJ_xmsqb"
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      mergeWorkOutlinePara({
        appCode: this.appCode??'',
        workOutlineId: this.workOutlineDataId
      }).then((r)=> {
        if(r.errcode!==0) return this.$message.error(r.errmsg as string)
        if(!r.data) return;
        this.$message.success('合成大纲成功！');
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
      schemaCode: `${this.appCode}_xmsqb`,
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
        console.log(this.selectWorkOutlineFile,'111')
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
      this.formData.data.XTSJ_workoutline_para.map((att) => {
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
    this.formData.data.XTSJ_workoutline_para.map((att) => {
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
        this.formData.data.XTSJ_workoutline_para.map((att) => {
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
  refreshAttachment() {
    getChildTableData({
      workflowInstanceId: this.formData.data.workflowInstanceId ?? '',
      fieldParam1: this.projectId??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      //@ts-ignore
      const bizObject = res.data.bizObject.data;
      this.formData.data.attachment = bizObject?.attachment ?? [];
    })
  }
  isUploading=false;
  isUploadingModelAttachment=false;
  uploadFileList:any[]=[];
  uploadFileListPicture:any[]=[];
  get isEditOutlineWork() {
    return this.formData.data.submitButton || this.formData.data.retainButton || this.formData.data.receiveButton || this.formData.data.agreeButton || this.formData.data.rejectButton
  }
  //TODO END
  //#region 上传附件相关
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
  removeFile(files:any[],index:number){
    files.splice(index,1);
  }
  removeFileModelAttachment(files:any[],index:number,refId?:string){
    // files.splice(index,1);
    this.formData.data.modelAttachment = this.formData.data.modelAttachment?.filter((i)=> {
      return i.refId!==refId
    })
    this.modelAttachments.splice(index,1);
    // this.copyDataModelAttachment = this.copyDataModelAttachment.filter((i)=> {
    //   return i.refId!==refId
    // })
    console.log(this.copyDataModelAttachment,'copyDataModelAttachment',this.formData.data.modelAttachment)
  }
  download(item) {
    window.open(`${env.apiHost}/api/aliyun/download?refId=${item.refId}`)
  };

  goDetail(item) {
    // if (this.editorUrl && this.activityCode==='edit_workoutline') {
    //   this.showEditWorkOutlinePanel = true;
    // } else {
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
    // }
  }

  upload={
    name:"file",
    multiple:true,
    action:`${env.apiHost}/api/aliyun/upload`,
    headers:{Authorization: 'Bearer ' + localStorage.token},
    showUploadList:false,
    beforeUpload:(file:File,key?:string)=>{
      return new Promise((resolve,rejectFile)=>{
        if (key==='modelAttachment') {
          if (!this.showTransferModal(file.name)){
            this.$message.warning(`${file.name},格式错误，请上传正确格式的模型文件！`);
            return rejectFile(this.showTransferModal(file.name))
          }
          return resolve(true);
        }
        // const isLt100M = file.size / 1024 / 1024 <= 100;
        // if (!isLt100M) {
        //   this.$message.error("只能上传不大于100M的文件");
        //   return rejectFile(false);
        // }
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
      //暂存 - 上传模型文件
      if (formDataKey==='modelAttachment') {
        if (isArray(this.formData.data.modelAttachment) && this.formData.data.modelAttachment.length) {
          this.formData.data.modelAttachment.splice(0,1,{...info.file.response.data,creater:this.userInfo})
        }else {
          this.$set(this.formData.data,formDataKey,[{...info.file.response.data,creater:this.userInfo}]);
        }
        this.actions('retainButton',false)
        // this.savaAchievements()
      }else {
        if(this.formData.data[formDataKey]){
          this.formData.data[formDataKey].push({...info.file.response.data,creater:this.userInfo});
        }else{
          this.$set(this.formData.data,formDataKey,[{...info.file.response.data,creater:this.userInfo}]);
        }
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
  //#endregion

  uuid() {
    const s = [];
    const hexDigits = "0123456789abcdef";
    for (let i = 0; i < 32; i++) {
      // @ts-ignore
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    // @ts-ignore
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    // @ts-ignore
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    const uuid = s.join("");
    return uuid;
  }

  listSkipQueryList() {
    listApi.listSkipQueryList({
      "queryCode": "XTSJ_xmlb",
      "schemaCode": "XTSJ_xmlb",
      "mobile": false,
      "page": 0,
      "size": 2,
      "filters": [
        {
          "op": "Eq",
          "propertyCode": "id",
          "propertyType": 0,
          "propertyValue": this.projectId??''
        }
      ]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      if(Array.isArray(res.data.content) && res.data.content.length) {
        const data = res.data.content[0].data;
        this.formData.data.project_id.name = res.data.content[0].name;
        this.formData.data.project_id.id = res.data.content[0].id;
        this.formData.data.project_id.schemaCode = res.data.content[0].schemaCode;
        this.formData.data.engineering_name = data.engineering_name;
        this.formData.data.engineering_location = data.engineering_location;
        this.formData.data.manufacturer_chief_engineer = data.manufacturer_chief_engineer;
        this.formData.data.industryType = data.industryType;
        this.formData.data.projectType = data.projectType;
        this.formData.data.engineering_number = data.engineering_number;
        this.formData.data.engineering_stage = data.engineering_stage;
        this.formData.data.manufacturer = data.manufacturer;
        this.formData.data.manufacturer_manager = data.manufacturer_vice_manager;
        this.formData.data.manufacturer_chief = data.manufacturer_vice_engineer;
        this.formData.data.project_level = data.project_level;
        this.formData.data.modelType = data.modelType;
        this.formData.data.engineeringType = data.engineeringType;
        // this.formData.data.profession_name = data.profession_name;
        this.formData.data.project_manager = data.project_manager;
        this.formData.data.xmlb_id = data.xmlb_id;
        this.formData.data.company_chief = data.company_chief_engineer
        this.formData.data.company_manager = data.company_manager;
        this.formData.data.project_begin_time = data.plan_start_time;
        this.formData.data.project_end_time = data.plan_end_time;
        this.getModelTypeConfig('XTSJ_field_mapping','XTSJ_xmsqb');
      }
    })
  }
  //批量修改专业负责人
  defaultValue: any[] = [];
  batchUpdatePerson(val) {
    // if(!this.taskRowSelectedRowKeys.length) return this.$message.warning('请先选择修改人员！')
    this.taskDataTwo.map((t) => {
      if(this.taskRowSelectedRowKeys.includes(t.id)) {
        t.official_manager = val.map(item=>({id:item.id,name:item.name,type:item.type?item.type:item.unitType}));
      }
    })
  };
  openStaff() {
    //@ts-ignore
    this.$refs['official-manager'].$children[0].focus()
  }
  parseSelectorValueCopy(value:{id:string,name:string,type:number,[key:string]:any}[]|null,id:string){
    if(!value||value.length<=0){
      return undefined;
    }else{
      if (!this.taskRowSelectedRowKeys.includes(id)) return value.map(item=>({id:item.id,name:item.name,type:item.type?item.type:item.unitType,departmentName:item.departmentName||''}));
      this.taskDataTwo.map((t) => {
        if(this.taskRowSelectedRowKeys.includes(t.id)) {
          t.official_manager = value.map(item=>({id:item.id,name:item.name,type:item.type?item.type:item.unitType,departmentName:item.departmentName||''}));
        }
      })
      return value.map(item=>({id:item.id,name:item.name,type:item.type?item.type:item.unitType,departmentName:item.departmentName||''}));
    }
  }
  //showDeleteModal
  showDeleteModal() {
    this.$warning({
      title: '确认删除吗？',
      content: '删除后不可恢复哦！',
      okText: '确定',
      maskClosable: true,
      // @ts-ignore
      closable: true,
      onOk: ()=> {
        this.onDelete();
      }
    });
  }
  //TODO 导入设计人员组 start
  showDesignPersonModal: boolean = false;
  uploadLoading: boolean = false;
  closeDesignPersonModal() {
    this.showDesignPersonModal = false;
  }
  downloadTemplate() {
    const manufacturer = this.formData.data.manufacturer && this.formData.data.manufacturer.length && this.formData.data.manufacturer[0]
    if (!manufacturer) return this.$message.warning('生产单位必填！');
    exportWorkOutlineInfoTemplate({
      appCode: this.appCode??'',
      projectName: this.wProjectName??'',
      projectId: this.projectId??'',
      //@ts-ignore
      departmentId: manufacturer.id as string
    }).then((res)=> {
      Utils.downloadFile("xlsx", `${this.wProjectName}_工作大纲设计人员组导入模板`, res)
    })
  }
  fileKey: number = 1;
  importWorkOutlineInfoTemplate() {
    const {$refs} = this;
    if ($refs.fileInput) {
      ($refs.fileInput as HTMLInputElement).click();
    }
  }
  fileInput(e) {
    const manufacturer = this.formData.data.manufacturer && this.formData.data.manufacturer.length && this.formData.data.manufacturer[0]
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const fileFormat = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      if (["xlsx", "xls"].indexOf(fileFormat) === -1)
        return this.$message.error("请上传Excel文件!");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", this.projectId??'');
      formData.append('appCode', this.appCode ?? '');
      formData.append('projectName', this.wProjectName??'');
      // @ts-ignore
      formData.append('outlineFlag',this.formData.data.engineering_stage==='施工图设计')
      //@ts-ignore
      formData.append('departmentId', manufacturer.id as string);
      this.uploadLoading = true;
      importWorkOutlineInfoTemplate(formData).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
        this.$message.success('导入成功！')
        //增量增加设计人
        this.taskDataTwo = [...this.taskDataTwo,...res.data];
        this.showDesignPersonModal = false;
      }).finally(() => {
        this.uploadLoading = false;
        this.fileKey++;
      })
    }
  }
  //TODO end

  //TODO 修改选人控件 - 从事专业参数
  taskCustomRow(row) {
    return {
      on: {
        click: ()=> {
          this.$set(this.formData.sheetConfig.official_manager,'majors',row.project_major);
          this.$set(this.formData.sheetConfig.official_manager,'certifications','专业负责人')
        },
        dblclick:()=> {
          this.$set(this.formData.sheetConfig.official_manager,'majors',row.project_major);
          this.$set(this.formData.sheetConfig.official_manager,'certifications','专业负责人')
        }
      }
    }
  }
  //TODO end

  //导出专业任务单
  exportDesignPersonGroup() {
    if (!this.taskDataTwo.length) return this.$message.warning('暂无可导出的数据！')
    exportDesignPersonGroup({
      appCode: this.projectCode??'',
      professionTask: this.taskDataTwo
    }).then((res)=> {
      const userInfo = sessionStorage.getItem('user');
      if (userInfo) {
        Utils.downloadFile("xlsx", `${this.wProjectName}_${JSON.parse(userInfo).name}_专业任务单列表导出数据_${moment(new Date()).format('YYYY-MM-DD HH.mm')}`, res);
      }
    })
  }
  //TODO 模型文件 start
  modelAttachments: ModelAttachment[] = [];
  modelAttachmentFormatConfig: string = '';
  copyDataModelAttachment: YunAttachmentFile[] = [];
  initKey: number = 1;
  transSpinType: string = '';
  transformingIndex: number = -1;
  showTransferModal(name: string) {
    if (!name) return false;
    return this.modelAttachmentFormatConfig.split(',').some((item)=> name.indexOf(item)>-1)
  }
  // getModelAttachments(refId?:string,index?:number,type?:string) {
  //   this.modelAttachments = []
  //   if (refId) {
  //     this.transSpinType = type??'';
  //     this.transformingIndex = index??-1;
  //     getModelTransGeneral({
  //       appCode: this.appCode??'',
  //       schemaCode:"XTSJ_xmsqb",
  //       relatedId: this.workOutlineDataId,
  //       refId: refId??''
  //     }).then((res)=> {
  //       // if(res.errcode!==0) return this.$message.error(res.errmsg as string)
  //       if(res.errcode!==0) return
  //       if(!res.data) return;
  //       if (refId) {
  //         // @ts-ignore
  //         this.modelAttachments.splice(index,1,res.data);
  //         this.$message.success('刷新成功！')
  //       }else {
  //         this.modelAttachments = res.data;
  //       }
  //     }).finally(()=>{
  //       this.transSpinType = '';
  //       this.transformingIndex = -1;
  //     })
  //   }else {
  //     this.modelAttachments = [];
  //   }
  // }
  // savaAchievements = Utils.debounce(()=> {
  //   this.actions('retainButton',false)
  // },500)
  getModelAttachment() {
    if (isArray(this.formData.data.modelAttachment)&& this.formData.data.modelAttachment.length) {
      this.modelAttachments = [];
      getNewModelTransGeneral({
        appCode: this.appCode??'',
        refId: this.formData.data.modelAttachment[0].refId,
        relatedId: this.workOutlineDataId,
        schemaCode: 'XTSJ_xmsqb'
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg as string)
        if(!res.data) return;
        // this.$message.success('刷新成功！')
        this.modelAttachments.push(res.data)
      })
    }
  }
  // saveDesignFile() {
  //   const refId: string[] = this.formData.data.modelAttachment?.filter((i)=> {
  //     return !this.copyDataModelAttachment.map((j)=> j.refId).includes(i.refId)
  //   }).map((m)=> m.refId) as string[]
  //   if (refId.length) {
  //     saveDesignFile({
  //       appCode: this.appCode??'',
  //       refId: refId,
  //       relatedId: this.workOutlineDataId,
  //       schemaCode: 'XTSJ_xmsqb'
  //     }).then((res)=> {
  //       if(res.errcode!==0) return this.$message.error(res.errmsg as string)
  //       if(!res.data) return;
  //       this.getModelAttachments()
  //     })
  //   }
  // }
  openUploadModel() {
    console.log(this.$refs.modelAttachment)
    // this.$refs.modelAttachment.onChange()
  }
  transferModelGeneral(item:ModelAttachment,index:number,type:string) {
    //轻量化转换
    this.transSpinType = type;
    this.transformingIndex = index;
    transferModelGeneral({
      appCode: this.appCode ?? '',
      url: `${env.apiHost}/api/aliyun/download?refId=${item.refId}`,
      name: item.name,
      vaultId: item.vaultId,
      fileId: item.refId,
      schemaCode: 'XTSJ_xmsqb',
      force: true,
      userId: this.userInfo.id
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      if (!res.data) return;
      this.$message.success('转换开始！')
    }).finally(()=> {
      this.transSpinType = '';
      this.transformingIndex = -1;
    })
  }
  previewModel(url:string) {
    window.open(`${url}`)
  }
  //TODO END

  //TODO START 总工指导意见
  chiefOpinions: ChiefOpinion[] = [];
  getChiefOpinion() {
    // this.chiefOpinions = exampleData.response.data.opinions;
    getChiefOpinion({
      appCode: this.appCode??'',
      workoutlineId: this.workOutlineDataId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.chiefOpinions = res.data;
    })
  }
  showOpinionModal: boolean = false;
  opinionTitle: string = '';
  updateForm() {
    const {actionCode,showComment} = this.dialogModalConfiguration
    this.actions(actionCode,showComment);
    this.closeOpinionModal();
    this.getChiefOpinion();
  }
  closeOpinionModal() {
    this.showOpinionModal = false;
  }
  signChiefOpinion(id:string) {
    signChiefOpinion({
      appCode: this.appCode??'',
      workoutlineId: this.workOutlineDataId,
      id: id
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.$message.success('签收成功')
      this.getChiefOpinion();
    })
  }
  get isValidate() {
    return ['manu_cheif_audit','company_cheif_audit'].includes(this.activityCode)
  }
  //TODO END
}
