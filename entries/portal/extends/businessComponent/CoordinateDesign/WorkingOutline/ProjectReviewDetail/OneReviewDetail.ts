import {Component, Mixins, InjectReactive, Prop, Ref} from 'vue-property-decorator';
import {FormModel, Icon, Collapse, DatePicker, Tag, Select, Upload,} from "@h3/antd-vue";
import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';
import Modal from 'ant-design-vue/lib/modal';
import Tabs from 'ant-design-vue/lib/tabs';
import 'ant-design-vue/lib/tabs/style/index.less';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.less';
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
import Radio from 'ant-design-vue/lib/radio';
import 'ant-design-vue/lib/radio/style/index.less';
import {
  UUID,
  replayToken,
  submit,
  save,
  agree,
  reject,
  loadSheetData,
  sheetConfig,
  SheetConfig,
  SheetData,
  uploadFile,
  workflowInstanceFlag
} from "../../../../service/CoordinateDesign/common";
import {ValidationRule} from '@h3/antd-vue/types/form-model/form';
import env from '@cloudpivot/list/env';
import {CommonMixins} from "../commonMixins";
import {
  getCommonReplys,
} from "../../../../service/api";
import {HttpResponse} from "@cloudpivot/api/src/response";
import {listApi} from "@cloudpivot/api";
import RelevanceFormModal from "../../compoents/RelevanceFormModal.vue";
import RichText from '../../../../basicCustomComponent/RichText/RichText'
import EditableCell from "../../../measurePayment/data/editTableCell.vue";
import {
  exportAuthority,
  designReviewAuth,
  findDesignReview,
  selectDesignReviewModel, selectTechnicalSchemeModel, exportAuth
} from '../../../../service/CoordinateDesign/pluginsDownload';
import Utils from "../../../../utils";
import {TableColumns} from "../../../../../../../modules/@cloudpivot/flow-center/src/components/pc/components/common-table/table.typings";
// import { downloadFile } from '../../../../utils'

type ModalConfiguration = { visible: boolean, actionCode: 'submitButton' | 'retainButton' | 'receiveButton' | 'agreeButton' | 'rejectButton', showComment: boolean, title?: string, okText?: string, confirmLoading?: boolean, OK?: () => void, afterClose?: () => void };
type selectorOption = { id: string, name: string, type: number };
import { TableColumn } from "../../../../type";
import {isArray} from "xe-utils";
import {getDecryptFile} from "../../../../service/CoordinateDesign/base";
import moment, {Moment} from "moment";

interface Data {
  id: string | null | undefined,
  workItemId: string | null | undefined,
  workflowTokenId: string | null | undefined,
  workflowInstanceId: string | undefined | null,
  rejectToActivityCode: string | null | undefined,


  submitButton: boolean,
  retainButton: boolean,
  receiveButton: boolean,
  agreeButton: boolean,
  rejectButton: boolean,
  activityCode?: string,
  activityName?: string,
}

type LoadData = {
  projectId: any;// 1关联单选  2string  3.人/部门（选人（部门）控件）
  engineering_name: string;
  projectNumber: string;
  engineering_stage: string;
  engineering_number: string;
  projectIdText: string;
  applicationStartTime: string | null;
  applicationEndTime: string | null;
  projectIntroduction: string;
  project_level: string;
  manufacturer_vice_manager: selectorOption[] | undefined | null;
  professionManager: selectorOption[] | undefined | null;
  reviewApplicants: selectorOption[] | undefined | null;
  reviewType: string;
  techDescribe: string;
  reviewDate: string | null;
  reviewTime: string | null;
  authorized: string;
  authorizer: selectorOption[] | undefined | null;
  inviteExperts: string;
  concreteDescribe: string;
  engineerAssistan: selectorOption[] | undefined | null;
  engineeringSupervisor: selectorOption[] | undefined | null;
  appNewTechnologies: string;
  inviteExpertsType: string;
  company_manager: selectorOption[] | undefined | null;
  manufacturer_chief_engineer: selectorOption[] | undefined | null;
  manufacturer: selectorOption[] | undefined | null;
  applicationNewTechnologies: string;
  company_chief_engine: string;
  number: number | string | undefined | null;
  desReviewComments: string;
  replyReviewComments: string;
  reviewReply: string;
  signAttach: any[] | undefined | null;
  reviewAttach: any[] | undefined | null;
  reviewAttachTwo: any[] | undefined | null;
  company_chief_engineer: selectorOption[] | undefined | null;
  XTSJ_sjps_psyj: any[];
  judge: string;
  opinion: string;
  project_begin_time: string | undefined | null;
  project_end_time: string | undefined | null;
} & Data;

export interface ReviewBizObject {
  id: string,
  data: LoadData;
  schemaCode: "XTSJ_sjps",
  sheetCode: "XTSJ_sjps",
  workflowInstanceId: string | null
}

@Component({
  name: "OneReviewDetail",
  components: {
    [Collapse.name]: Collapse,
    [Collapse.Panel.name]: Collapse.Panel,
    [DatePicker.name]: DatePicker,
    [Select.name]: Select,
    [FormModel.name]: FormModel,
    [FormModel.Item.name]: FormModel.Item,
    [Tag.name]: Tag,
    [Icon.name]: Icon,
    [Button.name]: Button,
    APopover: Popover,
    RelevanceFormModal,
    AModal: Modal,
    AButton: Button,
    ATooltip: Tooltip,
    APopconfirm: Popconfirm,
    AInput: Input,
    [Input.TextArea.name]:Input.TextArea,
    [Radio.Group.name]: Radio.Group,
    RichText,
    ATimeline: Timeline,
    ATimelineItem: Timeline.Item,
    ARadioGroup: Radio.Group,
    ATabs: Tabs,
    Popconfirm: Popconfirm,
    ATable: Table,
    [Upload.name]: Upload,
    EditableCell,

  }
})
export default class OneReviewDetail extends Mixins(CommonMixins) {
  @InjectReactive("project") appCode!: string;
  @Ref("modalForm") form!: FormModel;
  @Ref("dialogForm") dialogForm!: FormModel;
  @Prop({required: true}) projectId!: string;
  // @Prop({ required: true }) zyrwdId!: string;
  @Prop({required: false, default: false}) isCreate!: boolean;
  @Prop({required: false}) deviewId!: any;
  //TODO 主要评审意见 start
  editIndex: number = -1
  commentType: '意见内容'|'意见回复'|'审核回复'|'' = '';
  comment: string = '';
  editComment(type:'意见内容'|'意见回复'|'审核回复',index:number,comment:string) {
    this.commentType = type;
    this.editIndex = index;
    this.comment = comment;
    switch(type){
      case '意见内容':
        this.handleAdd('edit',index);
        this.opinions = comment;
        break;
      case '意见回复':
        // this.revertModal()
        break;
      case '审核回复':
        // this.revertModaleOk();
        break;
    }
  }
  // commentTableMapping:{[key:string]:string} = {
  //   desReviewComments: 'review',
  //   replyReviewComments: 'revert',
  //   reviewReply: 'auditor'
  // }
  reverts: string = '' // 回复清空内容
  reviewDesign: string = '' // 审核清空内容
  revertsObj: any = {};
  //定义表格内容
  dataSource: any = []
  //表头
  columns: TableColumn<any>[] = [
    {
      title: '序号',
      width: '80px',
      align: "center",
      dataIndex: 'nums',
      // @ts-ignore
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '评审意见内容描述',
      width: '25%',
      align: "center",
      dataIndex: 'review',
    },
    {
      title: '评审意见回复（项目经理）',
      width: '25%',
      align: "center",
      dataIndex: 'revert',
    },
    {
      title: '审核回复意见（部门总工）',
      width: '25%',
      align: "center",
      dataIndex: 'auditor',
    },
    {
      title: '操作',
      width: '100px',
      align: "center",
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'},
    },
  ];
  selectedkeys: string[] = [];
  rowSelection: any = {
    onChange: (selectedRowKeys) => {
      this.onSelectedkeys(selectedRowKeys)
    },
  };
  onSelectedkeys(selectedRowKeys:string[]) {
    this.selectedkeys = selectedRowKeys;
  }
  //删除按钮
  removeComments() {
    if (!this.selectedkeys.length) return this.$message.warning('请至少选一条数据！');
    this.dataSource = this.dataSource.filter((r)=> {
      return !this.selectedkeys.includes(r.id)
    })
  }
  //TODO end

  //TODO 主要评审意见-新增意见 start
  opinions: string = '' // 新增清空内容
  visible: boolean = false;  //控制新增弹框
  confirmLoading: boolean = false;  //确定按钮加载效果
  //新增弹框 点击确定关闭弹框
  handleOk(e: any) {
    if (!this.opinions) return this.$message.error('请填写意见内容!')
    if (this.editIndex!==-1) {
      this.dataSource.map((data,index)=> {
        if (this.editIndex===index){
          data.review = this.opinions
        }
      })
    }else {
      const {dataSource} = this;
      const newData = {
        nums: dataSource.length * 1 + 1,
        review: this.opinions,
        revert: '',
        auditor: '',
        id: Utils.uuid()
      };
      this.dataSource = [...dataSource, newData];
    }
    this.visible = false;
    console.log(this.dataSource,'11')
  }
  handleCancel(e: any) {
    this.visible = false;
    this.opinions = '';
    this.editIndex = -1
  }
  //新增按钮 控制新增弹框
  handleAdd(type:'add'|'edit',index?:number) {
    this.visible = true;
    if (type==='add'){
      this.opinions = '';
      this.editIndex = -1
    }else {
      this.editIndex = index??-1
    }
    getCommonReplys({
      appCode: this.appCode ?? '',
      schemaCode: `${this.appCode}_sjps`,
      type: '校审意见'
    }).then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        if (!res.data) return;
        this.commonReplys = res.data.replys;
      })
  }
  //单行删除按钮 点击删除调接口
  onDelete(record: any) {
    const dataSource = [...this.dataSource];
    this.dataSource = dataSource.filter(item => item.nums != record.nums);
  }
  //新增弹框 推荐 tag 标签 按钮
  handleChange(checked: any, item: any) {
    this.ReviewComments.formData = item
    this.opinions = item
  }
  //TODO end
  //TODO 主要评审意见-回复意见  start
  visibility: boolean = false  //控制回复弹框
  //控制打开回复意见按钮弹窗
  revertModal(record: any) {
    this.visibility = true;
    this.reverts = record.revert;
    this.revertsObj = {}
    this.revertsObj = record
  }
  //控制回复弹框 确定按钮 关闭弹框
  revertModaleOk(e: any) {
    if (!this.reverts) return this.$message.error('请填写评审意见回复!')
    this.visibility = false;
    this.revertsObj.revert = this.reverts
    const {nums} = this.revertsObj
    for (let index = 0; index < this.dataSource.length; index++) {
      const item = this.dataSource[index];
      if (item.nums == nums) {
        this.dataSource[index] = this.revertsObj
      }
    }
  }
  //控制回复弹框 取消 关闭弹框
  revertCancel() {
    this.visibility = false;
    this.reviewDesign = '';
    this.editIndex = -1
  }
  //TODO end
  //TODO 主要评审意见-审核意见  start
  reviewFlag: boolean = false;  //控制审核弹框
  //控制审核弹框按钮 点击审核打开弹框
  showConfirm(record: any) {
    this.reviewFlag = true
    //清空审核回复的内容
    this.reviewDesign = record.auditor
    this.revertsObj = {}
    this.revertsObj = record
  }
  //控制审核弹框确定按钮 关闭弹框
  handleConfirm(e: any) {
    if (!this.reviewDesign) return this.$message.error('审核回复意见!')
    this.reviewFlag = false
    this.revertsObj.auditor = this.reviewDesign
    const {nums} = this.revertsObj
    for (let index = 0; index < this.dataSource.length; index++) {
      const item = this.dataSource[index];
      if (item.nums == nums) {
        this.dataSource[index] = this.revertsObj
      }
    }
  }
  //控制审核弹框取消按钮 关闭弹框
  cancelConfirm() {
    this.reviewFlag = false
    this.reviewDesign = '';
    this.editIndex = -1
  }
  //TODO end

  // 定义变量 初始化数据
  editable: boolean | undefined;
  value: any;
  number: number = 1;
  desReviewComments: string = '';
  replyReviewComments: string = '';
  reviewReply: string = '';

  deriveButton: boolean = false //导出按钮权限
  schemaCode: string = "XTSJ_sjps";
  workOutlineDataId: string = '';
  isUploading = false;
  isShow: boolean = true //默认为true 控制按钮显示和隐藏
  addSubButton: boolean = false //新增按钮权限
  delSubButton: boolean = false //删除按钮权限
  updateSubButton: boolean = false //修改按钮权限

  leftButtonLinks = {
    activeIndex: 0,
    buttonLinks: [
      {name: "任务详情"},
      {name: "流程记录"},
    ]
  }

  leftButtonClick(index: number) {
    this.leftButtonLinks.activeIndex = index;
  }

  rightButtonLinks = [
    {name: "提交", type: "primary", visibleKey: "submitButton", showComment: false},
    {name: "暂存", type: "primary", visibleKey: "retainButton", showComment: false},
    {name: "接收", type: "primary", visibleKey: "receiveButton", showComment: false},
    {name: "同意", type: "primary", visibleKey: "agreeButton", showComment: true},
    {name: "驳回", type: "primary", visibleKey: "rejectButton", showComment: true},
  ]
  approvalKey = 1;
  formData: {
    data: LoadData,
    rules: { [key: string]: (ValidationRule | { trigger: 'blur' | 'change' | ['change', 'blur'] })[] },
    sheetConfig: SheetConfig, optionsWatch: { [key: string]: () => void }, options: { [key: string]: { value: string, label: string, key: number, disabled: boolean }[] }
  } = {   //@ts-ignore
    data: {
      id: undefined,
      workItemId: undefined,
      workflowTokenId: undefined,
      workflowInstanceId: undefined,
      rejectToActivityCode: undefined,
      projectId: {},
      engineering_name: '',
      engineering_number: '',
      engineering_stage: '',
      projectIdText: '',
      applicationStartTime: '',
      applicationEndTime: '',
      projectIntroduction: '',
      project_level: '',
      reviewApplicants: undefined,
      manufacturer_vice_manager: undefined,
      professionManager: undefined,
      company_chief_engine: '',
      reviewType: '',
      techDescribe: '',
      reviewDate: '',
      reviewTime: '',
      authorized: '',
      authorizer: undefined,
      inviteExperts: '',
      concreteDescribe: '',
      engineerAssistan: undefined,
      engineeringSupervisor: undefined,
      company_manager: undefined,
      appNewTechnologies: '',
      manufacturer_chief_engineer: undefined,
      company_chief_engineer: undefined,
      manufacturer: undefined,
      inviteExpertsType: '',
      applicationNewTechnologies: '',
      project_begin_time: undefined,
      project_end_time: undefined,
      projectNumber: '',
      number: undefined,
      desReviewComments: '',
      signAttach: undefined,
      reviewAttach: undefined,
      reviewAttachTwo: undefined,
      XTSJ_sjps_psyj: [],
      replyReviewComments: '',
      reviewReply: '',
      judge: '',
      opinion: ''
    },
    rules: {},
    sheetConfig: {},
    optionsWatch: {},
    options: {},
  }
  // 定义表单input框数据
  // 项目基本信息 ---->
  labelCol: any = {span: 2}
  wrapperCol: any = {span: 20}
  //改成这个ReviewComments
  ReviewComments: any = {
    id: '',
    number: '',// 序号
    desReviewComments: '',//评审意见内容描述
    replyReviewComments: '',//评审意见回复（项目经理）
    reviewReply: '',//审核回复意见（部门总工)
    parentId: '',//父id
    sortKey: '',//排序码
    opinion: '',
    judge: ''
  }
  //假设0普通 1项目经理 2部门总工
  roleFlag: any = 2
  auditor: string = ''
  //单选框
  /* 返回上一页 */
  back() {
    this.$router.back();
  }

  // 子表删除接口
  // deleteRow(arr: any) {
  //     listApi
  //         .deleteListData({
  //             ids: arr,
  //             schemaCode: this.schemaCode,
  //         })
  //         .then((res) => {
  //             if (res.errcode === 0) {
  //                 if (res.data.errorCount > 0) {
  //                     this.$message.warn("该用户没有删除权限");
  //                 } else {
  //                     this.$message.success(res.errmsg as string);
  //                     //刷新页面
  //                     this.getListLooksData();
  //                 }
  //             } else {
  //                 this.$message.warn(res.errmsg as string);
  //             }
  //         });record
  // }
  // check() {
  //   this.editable = false;
  //   this.$emit('change', this.value);
  // }
  //
  // edit() {
  //   this.editable = true;
  // }
  async created() {
    this.init()
  }

  //TODO 新增权限
  isCreatePermission: boolean = false;//防止塞入token，权限错误
  getDesignReviewAuth() {
    designReviewAuth({
      appCode: this.appCode ?? '',
      scrwdId: this.projectId ?? ''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      if (!res.data) return;
      this.isCreatePermission = Boolean(res.data)
    })
  }

  //进入页面调接口
  async mounted() {
    // this.getfindDesignReview()
    //
  }

  //初始化
  async init() {
    this.uploadFileList = [];
    this.dataSource = [];
    this.getReplyType();
    const config = await sheetConfig({sheetCode: "XTSJ_sjps", schemaCode: "XTSJ_sjps"});
    if (typeof config === "string") {
      return this.$message.error(`获取设计评审初始配置失败,${config}`);
    }
    this.formData.sheetConfig = config;
    if (this.isCreate) {
      this.getDesignReviewDetail();
    } else {
      findDesignReview({
        appCode: this.appCode ?? '',
        designReviewId: this.deviewId
      }).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
        if (!res.data) return;
        this.workflowInstanceId = res.data.workflowInstanceId;
        this.workItemId = res.data.workItemId;
        this.getDesignReviewDetail();
      })
    }
    this.getexportAuthority()
  }

  //表单初始化
  workItemId: string = '';
  workflowInstanceId: string = ''

  async getDesignReviewDetail() {
    const {appCode, projectId, isCreate} = this;
    try {
      //@ts-ignore
      const {errcode, errmsg, data} = isCreate ?
        await loadSheetData<LoadData>({startWorkflowCode: "XTSJ_sjps"})
        : await loadSheetData<LoadData>({
          workflowInstanceId: this.workflowInstanceId,
          workitemId: this.workItemId ?? '',
        })
      //表单初始化
      //@ts-ignore
      this.formData.data = {
        id: data?.bizObject.id,
        workflowTokenId: data?.workflowTokenId ?? null,
        workItemId: data?.workItemId ?? null,
        workflowInstanceId: data?.workflowInstanceId,
        activityCode: data?.activityCode,
        activityName: data?.activityName,
        projectId: data?.bizObject.data?.projectId ?? {},
        projectIdText: data?.bizObject.data?.projectIdText ?? '',
        manufacturer: data?.bizObject.data?.manufacturer ?? [],
        engineering_name: data?.bizObject.data?.engineering_name ?? '',
        engineering_number: data?.bizObject.data?.engineering_number ?? '',
        projectNumber: data?.bizObject.data?.projectNumber ?? '',
        engineering_stage: data?.bizObject.data?.engineering_stage ?? '',
        project_level: data?.bizObject.data.project_level ?? '',
        applicationStartTime: data?.bizObject.data?.applicationStartTime ?? null,
        applicationEndTime: data?.bizObject.data?.applicationEndTime ?? null,
        projectIntroduction: data?.bizObject.data?.projectIntroduction ?? '',
        reviewApplicants: data?.bizObject.data?.reviewApplicants ?? [],
        manufacturer_vice_manager: data?.bizObject.data?.manufacturer_vice_manager ?? [],
        professionManager: data?.bizObject.data?.professionManager ?? [],
        company_chief_engineer: data?.bizObject.data?.company_chief_engineer ?? [],
        reviewType: data?.bizObject.data?.reviewType ?? '',
        applicationNewTechnologies: data?.bizObject.data?.applicationNewTechnologies ?? '',
        techDescribe: data?.bizObject.data?.techDescribe ?? '',
        reviewDate: data?.bizObject.data?.reviewDate ?? null,
        inviteExpertsType: data?.bizObject.data?.inviteExpertsType ?? '',
        company_manager: data?.bizObject.data?.company_manager ?? [],
        reviewTime: data?.bizObject.data?.reviewTime ?? null,
        authorized: data?.bizObject.data?.authorized ?? '',
        authorizer: data?.bizObject.data?.authorizer ?? [],
        manufacturer_chief_engineer: data?.bizObject.data?.manufacturer_chief_engineer ?? [],
        appNewTechnologies: data?.bizObject.data?.appNewTechnologies ?? '',
        concreteDescribe: data?.bizObject.data?.concreteDescribe ?? '',
        engineeringSupervisor: data?.bizObject.data?.engineeringSupervisor ?? [],
        engineerAssistan: data?.bizObject.data?.engineerAssistan ?? [],
        inviteExperts: data?.bizObject.data?.inviteExperts ?? '',
        signAttach: data?.bizObject.data.signAttach ?? [],
        reviewAttach: data?.bizObject.data?.reviewAttach ?? [],
        reviewAttachTwo: data?.bizObject.data?.reviewAttachTwo ?? [],
        XTSJ_sjps_psyj: data?.bizObject.data?.XTSJ_sjps_psyj ?? [],           //子表字段
        submitButton: this.isCreate && this.isCreatePermission ? false : data?.formPermission?.actionPermission?.submit as boolean ?? false,
        retainButton: this.isCreate && this.isCreatePermission ? false : data?.formPermission?.actionPermission?.save as boolean ?? false,
        agreeButton: this.isCreate && this.isCreatePermission ? false : data?.formPermission?.actionPermission?.agree as boolean ?? false,
        rejectButton: this.isCreate && this.isCreatePermission ? false : data?.formPermission?.actionPermission?.showReject as boolean ?? false,
        rejectToActivityCode: data?.formPermission?.actionPermission?.rejectToActivityCode as string??''
      }
      if (isArray(this.formData.data.XTSJ_sjps_psyj)&&this.formData.data.XTSJ_sjps_psyj.length) {
        this.formData.data.XTSJ_sjps_psyj.map((i,index)=> {
          this.dataSource.push({
            review: i.desReviewComments,
            revert: i.replyReviewComments,
            auditor: i.reviewReply,
            id: i.id,
            nums:index+1
          })
        })
      }
      //新增  新增？判断
      if (this.isCreate) {
        this.listSkipQueryList();
      } else {
        // this.getModelTypeConfig('XTSJ_field_mapping', 'XTSJ_sjps')
      }
      //@ts-ignore
      if (Array.isArray(data.logInfoList) && data.logInfoList.length) {
        //@ts-ignore
        this.activityCode = data.logInfoList[data.logInfoList.length - 1].activityCode;
      }
      this.approvalKey++;

      this.updateSheetConfig(isCreate, data as SheetData<LoadData>);
      console.log(this.formData.rules,'111')
      if (isCreate) {
        // this.formData.data.engineering_name = res.data?.engineeringName;
        // this.formData.data.engineering_stage = res.data?.engineeringStage;
      }
      //创建数据校验规则
      this.createRules();
      //更新节点信息
      if (this.formData.data.workflowInstanceId) {
        await this.getWorkflowBaseInfo(this.formData.data.workflowInstanceId as string);
        this.calcUsedTime();
      }
    } catch (error) {
      return this.$message.error(`审批详情异常,${error}`)
    }
  }

  //表单映射
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
          "propertyValue": this.$route.query.projectId //选择的生产任务单id
        }
      ]
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      if (!res.data) return;
      if (Array.isArray(res.data.content) && res.data.content.length) {
        //映射
        const data = res.data.content[0].data;
        this.formData.data.projectId.id = res.data.content[0].id;
        this.formData.data.projectId.engineering_name = res.data.content[0].name;
        this.formData.data.projectId.schemaCode = res.data.content[0].schemaCode;
        this.formData.data.engineering_name = data.engineering_name;
        this.formData.data.engineering_number = data.engineering_number;
        this.formData.data.engineering_stage = data.engineering_stage;
        this.formData.data.manufacturer_vice_manager = data.manufacturer_vice_manager;
        this.formData.data.company_chief_engineer = data.company_chief_engineer;
        this.formData.data.company_manager = data.company_manager;
        this.formData.data.manufacturer_chief_engineer = data.manufacturer_chief_engineer;
        this.formData.data.project_level = data.project_level;
        this.formData.data.projectNumber = data.id;
        this.formData.data.projectIdText = data.id;
        this.formData.data.manufacturer = data.manufacturer;
        // this.getModelTypeConfig('XTSJ_field_mapping', 'XTSJ_sjps')
      }
    })
  }

  //导出
  downloadLoading: boolean = false;
  deriveExport() {
    this.downloadLoading = true;
    selectDesignReviewModel({
      appCode: this.appCode??'',
      designReviewId: this.deviewId
    }).then((res)=> {
      this.downloadLoading = false;
      const fileName:string = sessionStorage.getItem('selectDesignReviewModel') as string;
      if (fileName) {
        Utils.downloadFile(`.${fileName.split('.')[fileName.split('.').length-1][0]}`, `${fileName}`, res);
      }
    })
  }
  //进入页面获取导出按钮权限
  async getexportAuthority() {
      const res = await exportAuthority({
          appCode: this.appCode??'',
          designReviewId: this.deviewId
      })
      if (res.errcode == 0) {
          this.deriveButton = res.data
      }
  }
  //刷新页面 查找设计评审单接口
  // async getfindDesignReview() {
  //     const res = await findDesignReview({
  //         appCode: "XTSJ",
  //         designReviewId: this.deviewId
  //     })
  //     if (res.errcode == 0) {
  //     }
  // }
  getBizObjectData(id: string): ReviewBizObject {
    const {formData: {data: formData}} = this;
    return {
      id: formData?.id ?? id,
      //存字段  提交  暂存按钮
      //@ts-ignore
      data: {
        id: formData?.id ?? '',
        engineering_name: formData?.engineering_name ?? '',
        engineering_stage: formData?.engineering_stage ?? '',
        manufacturer_vice_manager: formData?.manufacturer_vice_manager ?? null,
        company_chief_engineer: formData?.company_chief_engineer ?? null,
        project_level: formData.project_level ?? '',
        manufacturer: formData?.manufacturer ?? null,
        projectIdText: formData?.projectIdText ?? '',
        applicationStartTime: formData?.applicationStartTime ?? null,
        applicationEndTime: formData?.applicationEndTime ?? null,
        applicationNewTechnologies: formData?.applicationNewTechnologies ?? '',
        engineerAssistan: formData?.engineerAssistan ?? null,
        engineering_number: formData?.engineering_number ?? '',
        projectId: formData?.projectId.id ?? null,
        projectNumber: formData?.projectNumber ?? '',
        projectIntroduction: formData?.projectIntroduction ?? '',
        reviewApplicants: formData?.reviewApplicants ?? null,
        reviewType: formData?.reviewType ?? '',
        techDescribe: formData?.techDescribe ?? '',
        reviewDate: formData?.reviewDate ?? null,
        professionManager: formData?.professionManager ?? null,
        inviteExpertsType: formData?.inviteExpertsType ?? '',
        company_manager: formData?.company_manager ?? [],
        reviewTime: formData?.reviewTime ?? null,
        authorized: formData?.authorized ?? '',
        authorizer: formData?.authorizer ?? null,
        manufacturer_chief_engineer: formData?.manufacturer_chief_engineer ?? null,
        appNewTechnologies: formData?.appNewTechnologies ?? '',
        concreteDescribe: formData?.concreteDescribe ?? '',
        engineeringSupervisor: formData?.engineeringSupervisor ?? null,
        inviteExperts: formData?.inviteExperts ?? '',
        XTSJ_sjps_psyj: this.dataSource.map((i)=> {
          return {
            desReviewComments: i.review,
            replyReviewComments: i.revert,
            reviewReply: i.auditor,
            id: i.id.length>32?null:i.id
          }
        }),
        signAttach: formData?.signAttach ?? null,
        reviewAttach: formData?.reviewAttach ?? null,
        reviewAttachTwo: formData?.reviewAttachTwo ?? null

      },
      schemaCode: "XTSJ_sjps",
      sheetCode: "XTSJ_sjps",
      workflowInstanceId: formData.workflowInstanceId ?? null,
    }
  }

  commonReplys: any = {};//常用回复语
  /*选中常用语*/
  tagChange(item){
    this.dialogTaskForm.formData.comment=item;
  }
  //提交 暂存 同意 驳回 按钮点击事件
  actionButtonClick(item: { visibleKey: string, name: string, showComment: boolean }) {
    this.commonReplys = null;
    if (this.replyType.includes(item.name)) {
      getCommonReplys({
        appCode: this.appCode ?? '',
        schemaCode: this.appCode + '_sjps',
        type: item.name
      })
        .then(res => {
          if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
          if (!res.data) return;
          this.commonReplys = res.data;
        })
    }
    this.dialogModalConfiguration.visible = true,
      this.dialogModalConfiguration.actionCode = item.visibleKey as 'submitButton' | 'retainButton' | 'receiveButton' | 'agreeButton' | 'rejectButton',
      this.dialogModalConfiguration.okText = item.name;
    this.dialogModalConfiguration.showComment = item.showComment;
    this.dialogModalConfiguration.title = `确认${item.name}此设计评审单`
    if (item.visibleKey === "receiveButton") {
      this.dialogTaskForm.formData.comment = "接收任务";
    }
  }

  /* 提交,暂存.接收,同意,驳回Form配置 */
  dialogTaskForm: { formData: { comment: string }, rules: { [key: string]: (ValidationRule | { trigger: 'blur' | 'change' | ['change', 'blur'] })[] } } = {
    formData: {
      comment: ""
    },
    rules: {
      comment: [
        {required: true, message: "请输入意见/建议", trigger: ["change", "blur"],},
      ],
    }
  }
  /*  提交,暂存.接收,同意,驳回弹窗配置 */
  dialogModalConfiguration: ModalConfiguration = {
    visible: false,
    okText: "",
    confirmLoading: false,
    title: "",
    actionCode: 'submitButton',
    showComment: false,
    OK: () => {
      const {actionCode, showComment} = this.dialogModalConfiguration
      this.actions(actionCode, showComment);
    },
    afterClose: () => {
      this.dialogTaskForm.formData.comment = "";
    }
  }

  async actions(actionCode: 'submitButton' | 'retainButton' | 'receiveButton' | 'agreeButton' | 'rejectButton', showComment: boolean) {
    this.dialogModalConfiguration.confirmLoading = true;
    const {userInfo, formData, getBizObjectData} = this;
    const {departmentId} = userInfo;
    //意见建议校验
    if (showComment) {
      let validde = false;
      let errorFields: { [key: string]: { message: string, field: string }[] } = {};
      this.dialogForm.validate((valid, fields) => {
        validde = valid;
        errorFields = fields as { [key: string]: { message: string, field: string }[] };
        if (!valid) {
          return false;
        }
      })
      if (!validde) {
        this.dialogModalConfiguration.confirmLoading = false;
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
      if (actionCode !== "retainButton") {
        //@ts-ignore
        const productionForm = this.form;
        let validde = false;
        let errorFields: { [key: string]: { message: string, field: string }[] } = {};
        productionForm.validate((valid, fields) => {
          errorFields = fields as { [key: string]: { message: string, field: string }[] };
          validde = valid
          if (!valid) return false;
        });
        if (!validde) {
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
      //判断子表是否必填
      if (['submitButton','receiveButton','agreeButton'].includes(actionCode)) { //驳回和暂存不需要验证
        if (this.formData.sheetConfig.hasOwnProperty('XTSJ_sjps_psyj')&& this.formData.sheetConfig.XTSJ_sjps_psyj.required&&!this.dataSource.length) {
          return this.$message.warning('主要评审意见不可为空！')
        }
        if (this.formData.sheetConfig.hasOwnProperty('desReviewComments')&& this.formData.sheetConfig.desReviewComments.required&&this.dataSource.length) {
          if (!this.dataSource.every((i)=> i.review)) {
            return this.$message.warning(`${this.getItemName('desReviewComments')}不可为空！`)
          }
        }
        if (this.formData.sheetConfig.hasOwnProperty('replyReviewComments')&& this.formData.sheetConfig.replyReviewComments.required&&this.dataSource.length) {
          if (!this.dataSource.every((i)=> i.revert)) {
            return this.$message.warning(`${this.getItemName('replyReviewComments')}不可为空！`)
          }
        }
        if (this.formData.sheetConfig.hasOwnProperty('reviewReply')&& this.formData.sheetConfig.reviewReply.required&&this.dataSource.length) {
          if (!this.dataSource.every((i)=> i.auditor)) {
            return this.$message.warning(`${this.getItemName('reviewReply')}不可为空！`)
          }
        }
      }
     //流程判断
      if (actionCode === "submitButton" || actionCode === 'receiveButton' || actionCode === 'agreeButton') {
        const {errcode, errmsg, data} = await workflowInstanceFlag({
          id: formData.data.id ?? '', projectId: this.projectId, schemaCode: 'XTSJ_xmlb',
          workflowInstanceId: formData.data.workflowInstanceId ?? '', appCode: this.appCode,
        });
        if (errcode) return this.$message.warn(`${errmsg}`);
        if (!data.flag) return this.$message.warn(`${data.message}`);
      }
      const token = await replayToken();
      if (!token) return this.$message.error("获取replayToken失败");
      const id = await UUID();
      if (!id) return this.$message.error("获取UUID失败");
      let res: HttpResponse<any>;
      const bizObject = getBizObjectData(id);
      if (actionCode === 'retainButton') {
        res = await save({
          workItemId: formData.data.workItemId ?? null,
          workflowInstanceId: formData.data.workflowInstanceId ?? null,
          bizObject,
          departmentId,
          replayToken: token,
          workflowCode: "XTSJ_sjps"
        });
      } else if (actionCode === "submitButton") {
        res = await submit({
          workItemId: formData.data.workItemId ?? null,
          workflowInstanceId: formData.data.workflowInstanceId ?? null,
          bizObject,
          departmentId,
          replayToken: token,
          workflowCode: "XTSJ_sjps"
        });
      } else if (actionCode === "agreeButton" || actionCode === "receiveButton") {
        const approval = {
          content: this.dialogTaskForm.formData.comment,
          workItemId: formData.data.workItemId as string,
          workflowInstanceId: formData.data.workflowInstanceId as string,
          workflowTokenId: formData.data.workflowTokenId as string,
          activityCode: formData.data.activityCode as string,
          activityName: formData.data.activityName as string,
          result: 1 as 1,
        };
        res = await agree({
          workItemId: formData.data.workItemId as string,
          workflowInstanceId: formData.data.workflowInstanceId as string,
          bizObject: getBizObjectData(id),
          replayToken: token,
          approval: approval,
          workflowCode: "XTSJ_sjps"
        })
      } else if (actionCode === 'rejectButton') {
        const approval = {
          content: this.dialogTaskForm.formData.comment,
          workItemId: formData.data.workItemId as string,
          workflowInstanceId: formData.data.workflowInstanceId as string,
          workflowTokenId: formData.data.workflowTokenId as string,
          activityCode: formData.data.activityCode as string,
          activityName: formData.data.activityName as string,
          result: null
        };
        res = await reject({
          workItemId: formData.data.workItemId as string,
          workflowInstanceId: formData.data.workflowInstanceId as string,
          bizObject,
          replayToken: token,
          approval: approval,
          workflowCode: "XTSJ_sjps",
          rejectToActivityCode: formData.data.rejectToActivityCode as string,
        });
      }
      const {errcode, errmsg, data} = res!;
      if (errcode) {
        return this.$message.error(`${this.dialogModalConfiguration.okText}失败,${errmsg}`);
      }
      this.$message.success(`${this.dialogModalConfiguration.okText}成功`);
      this.dialogModalConfiguration.visible = false;
      if (this.isCreate) {
        this.back();
      } else {
        this.init();
      }
    } catch (error) {
      this.$message.error(`${this.dialogModalConfiguration.okText}异常,${error}`);
    } finally {
      this.dialogModalConfiguration.confirmLoading = false;
      this.dialogModalConfiguration.visible = false;
    }
  }

  uploadFileList: any[] = [];
  //#region 上传附件相关
  /* 上传附件相关 */
  upload = {
    name: "file",
    multiple: true,
    action: `${env.apiHost}/api/aliyun/upload`,
    headers: {Authorization: 'Bearer ' + localStorage.token},
    showUploadList: false,
    beforeUpload: (file: File) => {
      return new Promise((resolve, rejectFile) => {
        const isLt100M = file.size / 1024 / 1024 <= 100;
        if (!isLt100M) {
          this.$message.error("只能上传不大于100M的文件");
          return rejectFile(false);
        }
        return resolve(true);
      });
    },
    change: (info, formDataKey, loadingKey) => this.change(info, formDataKey, loadingKey),
  };

  change(info, formDataKey: string, loadingKey: string) {
    if (info.file.status === 'uploading') {
      this[loadingKey] = true;
    } else if (info.file.status === 'done') {
      this[loadingKey] = false;
      if (this.formData.data[formDataKey]) {
        this.formData.data[formDataKey].push({...info.file.response.data, creater: this.userInfo});
      } else {
        this.$set(this.formData.data, formDataKey, [{
          ...info.file.response.data,
          creater: this.userInfo
        }]);
      }
    } else if (info.file.status === "error") {
      this[loadingKey] = false;
      this.$message.error(`上传文件[${info.file.name}]失败`);
    } else {
      this[loadingKey] = false;
      this.$message.error(`上传文件[${info.file.name}]失败,未知错误`);
    }
  }

  removeFile(files: any[], index: number) {
    files.splice(index, 1);
  }

  // 下载
  download(item) {
    window.open(`${env.apiHost}/api/aliyun/download?refId=${item.refId}`)
  };

  // uploadAcceptFileTypes = [
  //     "text/plain",//.txt
  //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",//.xlsx
  //     "application/vnd.ms-excel",//xls
  // ]
  //预览
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
  }

  beforeUpload(file: File) {
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
  //补充
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
}


