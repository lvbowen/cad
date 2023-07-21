import {Component, InjectReactive, Vue, Prop} from "vue-property-decorator";
import {
  Collapse,
  Table,
  Checkbox,
  Button,
  Icon,
  FormModel,
  DatePicker,
  Input,
  Select,
  Upload,
  Modal,
  Popconfirm,
  Tag
} from "@h3/antd-vue";
// @ts-ignore
import moment from "moment";
import * as Type from "../../../../../type";
import EditableCell from "./editTableCell.vue";
import {
  getWorkOutlineInfo,
  createWorkOutline,
  getChildTableData,
  getInstanceBaseinfo,
  loadSave,
  getReplayToken,
  loadSubmit,
  getWorkOutlineBindModel,
  loadRejectWorkItem,
  getContentItemRule,
  workflowInstanceFlag, getProfessionalTask, getCommonReplys
} from "../../../../../service/api"
import flow from "@cloudpivot/flow/pc";
import {timeTranslate} from '@cloudpivot/common/src/utils/date';
// @ts-ignore
import env from "@/config/env";

import ApplicationList from "@cloudpivot/list/src/components/pc/application-list.vue";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import Workflow from "../../../../../../src/views/form/workflow-track/workflow-trackNew.vue";
import WorkOutlineModels from "./WorkOutlineModels.vue";
import EditWorkOutlinePanel from "./EditWorkOutlinePanel.vue";
import RelevanceTable from "./RelevanceTable.vue";
@Component({
  name: "index",
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ATable: Table,
    ATableColumn: Table.Column,
    ACheckbox: Checkbox,
    AButton: Button,
    AIcon: Icon,
    AFormModel: FormModel,
    AFormModelItem: FormModel.Item,
    ADatePicker: DatePicker,
    AInput: Input,
    Atextarea: Input.TextArea,
    ASelect: Select,
    ASelectOption: Select.Option,
    AUpload: Upload,
    EditableCell,
    AModal: Modal,
    Approval: flow.components.Approval,
    APopconfirm: Popconfirm,
    ApplicationList,
    staffSelector,
    Workflow,
    WorkOutlineModels,
    EditWorkOutlinePanel,
    ATag:Tag,
    RelevanceTable
  },
})
export default class index extends Vue {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;
  @Prop() wProjectName!: string;
  activeKey: Array<string> = ['3', '4', '5',];

  userInfo: any = {};
  processObj: any = {};
  status: string = '';
  dateFormat: any = 'YYYY-MM-DD';

  form: any = {
    /*工程基本信息----左侧*/
    projectName: '',
    engineeringStage: '',
    taskNumber: '',
    specialNumber: '',
    taskTypeVal: true,
    /*工程基本信息----左侧*/
    constructionSite: '',
    projectNumber: '',
    resultNumber: '',
    versionNumber: '',
    oneTypeVal: false,
    twoTypeVal: false,
    /*评审人员列表----左侧*/
    productionUnit: '',
    chiefEngineer: '',
    companyChiefEngineer: '',
    /*评审人员列表----右侧*/
    projectManager: '',
    chargeManager: '',
    generalManager: '',
    /*指导意见创建人*/
    opinionCreator: ''
  };

  labelCol: any = {span: 1}
  wrapperCol: any = {span: 14}

  rules: any = {
    /*工程基本信息----左侧*/
    projectName: [
      {required: true, message: '项目名称不能为空', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
    engineeringStage: [
      {required: true, message: '工程阶段不能为空', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
    taskNumber: [
      {required: false, message: '', trigger: 'blur'},
    ],
    specialNumber: [
      {required: false, message: '', trigger: 'blur'},
    ],
    /*工程基本信息----右侧*/
    constructionSite: [
      {required: true, message: '工程建设地点不能为空', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
    projectNumber: [
      {required: true, message: '工程编号不能为空', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
    achievementNumber: [
      {required: false, message: '', trigger: 'blur'},
    ],
    versionNumber: [
      {required: false, message: '', trigger: 'blur'},
    ],
    /*评审人员列表----左侧*/
    productionUnit: [
      {required: true, message: '生产单位不能为空', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
    chiefEngineer: [
      {required: true, message: '生产单位分管总工不能为空', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
    companyChiefEngineer: [
      {required: true, message: '公司主管总工不能为空', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
    /*评审人员列表----右侧*/
    projectManager: [
      {required: true, message: '项目经理不能为空', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
    chargeManager: [
      {required: true, message: '生产单位分管经理不能为空', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
    generalManager: [
      {required: true, message: '公司主管总经理不能为空', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
    /*指导意见创建人*/
    opinionCreator: [
      {required: true, message: '', trigger: 'blur'},
      {min: 2, max: 10, message: '', trigger: 'blur'},
    ],
  };
  instructions: string = '';
  /*专业任务划分*/
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
  count: number = 0;
  taskColumnsTwo: Array<any> = [
    {
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      // eslint-disable-next-line no-shadow
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      dataIndex: 'project_major',
      key: 'project_major',
      slots: {title: 'project_major'},
      scopedSlots: {customRender: 'project_major-content'},
      align: 'center'
    },
    // {
    //   dataIndex: 'official_chief',
    //   key: 'official_chief',
    //   slots: {title: 'official_chief'},
    //   scopedSlots: {customRender: 'official_chief-content'},
    //   align: 'center'
    // },
    // {
    //   dataIndex: 'official_manager',
    //   key: 'official_manager',
    //   slots: {title: 'official_manager'},
    //   scopedSlots: {customRender: 'official_manager-content'},
    //   align: 'center'
    // },
    {
      dataIndex: 'professionManagePermit',
      key: 'professionManagePermit',
      slots: {title: 'professionManagePermit'},
      scopedSlots: {customRender: 'professionManagePermit-content'},
      align: 'center'
    },
    {
      dataIndex: 'professionPermit',
      key: 'professionPermit',
      slots: {title: 'professionPermit'},
      scopedSlots: {customRender: 'professionPermit-content'},
      align: 'center'
    },
    {
      dataIndex: 'plan_begin_time',
      key: 'plan_begin_time',
      slots: {title: 'plan_begin_time'},
      scopedSlots: {customRender: 'plan_begin_time-content'},
      align: 'center',
      width: 150,
    },
    {
      dataIndex: 'plan_end_time',
      key: 'plan_end_time',
      slots: {title: 'plan_end_time'},
      scopedSlots: {customRender: 'plan_end_time-content'},
      align: 'center',
      width: 150,
    },
    {
      dataIndex: 'plan_duration',
      key: 'plan_duration',
      slots: {title: 'plan_duration'},
      align: 'center',
      width: 100,
    },
    {
      title: '专业设计提纲',
      dataIndex: 'offical_outline',
      key: 'offical_outline',
      align: 'center',
      width: 100,
      scopedSlots: {customRender: 'offical_outline-content'},
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor: '#bfbfff',
        },
      }),
    },
    {
      title: '是否公司总工审核',
      dataIndex: 'chief_audit_flag',
      key: 'chief_audit_flag',
      align: 'center',
      width: 130,
      scopedSlots: {customRender: 'chief_audit_flag-content'},
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor: '#bfbfff',
        },
      }),
    },
    {
      title: '计算书',
      dataIndex: 'calculation',
      key: 'calculation',
      align: 'center',
      width: 100,
      scopedSlots: {customRender: 'calculation-content'},
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor: '#bfbfff',
        },
      }),
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
  taskTableObj: any = {};
  taskRowSelectedRowKeys: Array<any> = []
  taskRowSelectedRows: Array<any> = []
  taskDataTwoNum: number = 0;

  projectProfessionalColumns: Array<any> = [
    {
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      width: 60,
    },
    {
      title: '项目名称',
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

  personnelListColumn: Array<any> = [
    {
      title: '未签收人员列表',
      dataIndex: 'unsignPersonnelList',
      key: 'unsignPersonnelList',
      align: 'center',
      scopedSlots: {customRender: 'unsignPersonnelList'},
    },
    {
      title: '已签收人员列表',
      dataIndex: 'signPersonnelList',
      key: 'signPersonnelList',
      align: 'center',
      scopedSlots: {customRender: 'signPersonnelList'},
    },
  ];
  personnelList: any = [
    {
      key: '1',
      unsignPersonnelList: [],
      signPersonnelList: [],
    }
  ];

  projectId: any = '';
  workOutlineDataId: string = '';

  /*判断按钮是否存在*/
  createButton: boolean = true;//新建按钮
  editButton: boolean = true;//编辑按钮
  reciveButton: boolean = true;//签收按钮
  rejectButton: boolean = true;//驳回按钮
  saveButton: boolean = true;//暂存按钮
  submitButton: boolean = true;//提交按钮
  agreeButton: boolean = true;//同意按钮


  /*判断是否可编辑*/
  disabledOnetwo: boolean = true;
  baseData: boolean = true;
  cheifInstruction: boolean = true;
  professionTask: boolean = true;
  showInput: boolean = false;

  visible: boolean = false;
  project: any = {};
  tableIndex: number = 0;

  workflowCode: string | null = '';
  workflowInstanceId: string | null = '';
  workitemFinishId: string | null = '';
  workItemId: string | null = '';
  workflowTokenId: string | null = '';
  sheetCode: string | null = '';
  schemaCode: string | null = '';
  usedTime: string = '';

  action = `${env.apiHost}/api/aliyun/upload`;
  headers = {Authorization: 'Bearer ' + localStorage.token};
  attachment: Array<any> = [];
  defaultFileList: Array<any> = [];

  replayToken: string = '';

  bizObject: any = {
    data: {
      engineering_name: null,
      engineering_location: null,
      engineering_stage: null,
      engineering_number: null,
      project_level: null,
      'XTSJ_design_person': null,
      'attachment': null,
      'chief_feedback': '',
      'company_chief': null,//[]
      'company_manager': null,//[]
      'feedback_creater': null,
      'id': '',
      'manufacturer': null,//[]
      'manufacturer_chief': null,
      'manufacturer_manager': null,
      'picture': null,
      'project_begin_time': null,
      'project_end_time': null,
      'project_id': '',
      'project_manager': null,//[]
      'result_number': '',
      'signed_ids': '',
      'special_number': '',
      'status': '',
      'task_number': '',
      'task_type': null,
      'unsigned_ids': '',
      'version_number': '',
    },
    id: null,
    schemaCode: null,
    sheetCode: null,
    workflowInstanceId: null,
  }
  projectManagerId: string = '';
  depatmentId: string = '';
  workItemSubmit: any = {//提交
    actionCode: 'submit',
    agree: true,
    bizObject: this.bizObject,
    depatmentId: '',
    formType: '1',
    replayToken: '',
    workItemId: '',
    workflowCode: '',
    workflowInstanceId: '',
  }


  createFlag: boolean = false;
  workOutlineEditAreaAuth: any = {};//保存编辑权限数据

  nowTime: string = '';
  showComment: boolean = false;
  approvalComments: string = '';
  clickType: string = '';
  approval: any = {//审批意见
    actionType: 1,
    activityCode: 'manu_cheif_audit',
    activityName: '生产单位主管总工',
    bizObjectId: null,
    bizPropertyCode: 'x_placeholder_comment_',
    commentTime: '',
    content: '',
    createdBy: '',
    createdTime: '',
    creater: {id: '', imgUrl: null, name: '', type: 3,},
    deleted: false,
    id: this.uuid(),
    modifiedBy: null,
    modifiedTime: null,
    relUsers: [],
    remarks: null,
    resources: [],
    result: 1,
    schemaCode: null,
    tokenId: 1,
    workItemId: null,
    workflowInstanceId: null,
    workflowTokenId: null,
  }
  approvalSubmit: any = {
    actionCode: 'agree',
    agree: true,
    approval: this.approval,
    bizObject: this.bizObject,
    formType: '1',
    replayToken: '',
    workItemId: '',
    workflowCode: '',
    workflowInstanceId: '',
  }
  workItemReject: any = {//驳回
    approval: this.approval,
    bizObject: this.bizObject,
    formType: '1',
    rejectToActivityCode: 'edit_workoutline',
    submitToReject: false,
    workItemId: '',
    workflowCode: '',
    workflowInstanceId: '',
  }
  approvalKey: number = 0;
  svg: string = 'M779.3 196.6c-94.2-94.2-247.6-94.2-341.7' +
    ' 0l-261 260.8c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9' +
    ' 36.9a9 9 0 0 0 12.7 0l261-260.8c32.4-32.4 75.5-50.2' +
    ' 121.3-50.2s88.9 17.8 121.2 50.2c32.4 32.4 50.2 75.5' +
    ' 50.2 121.2 0 45.8-17.8 88.8-50.2 121.2l-266 265.9-43.1' +
    ' 43.1c-40.3 40.3-105.8 40.3-146.1 0-19.5-19.5-30.2-45.4-30.2-73s10.7-53.5' +
    ' 30.2-73l263.9-263.8c6.7-6.6 15.5-10.3 24.9-10.3h.1c9.4 ' +
    '0 18.1 3.7 24.7 10.3 6.7 6.7 10.3 15.5 10.3 24.9 0 9.3-3.7' +
    ' 18.1-10.3 24.7L372.4 653c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9' +
    ' 36.9a9 9 0 0 0 12.7 0l215.6-215.6c19.9-19.9 30.8-46.3' +
    ' 30.8-74.4s-11-54.6-30.8-74.4c-41.1-41.1-107.9-41-149 ' +
    '0L463 364 224.8 602.1A172.22 172.22 0 0 0 174 724.8c0 ' +
    '46.3 18.1 89.8 50.8 122.5 33.9 33.8 78.3 50.7 122.7 50.7 ' +
    '44.4 0 88.8-16.9 122.6-50.7l309.2-309C824.8 492.7 850 432' +
    ' 850 367.5c.1-64.6-25.1-125.3-70.7-170.9z';

  projectManager: any = {}
  showUploadListShow: boolean = true;

  personOptions: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title: '选择联系人',
    nonExistentAppCode: true
  };

  tabName: string = '任务详情';

  commonReplys:any={};//常用回复语


  get rowSelection() {
    return {
      onChange: this.taskRowSelect,
      selectedRowKeys: this.taskRowSelectedRows.map((item) => item.id),
      getCheckboxProps: (record) => {
        return {
          props: {
            disabled: record.disabled === !this.professionTask,
            name: record.name,
          }
        };
      }
    };
  }

  onValueChange(key, record, value) {
    if (value.length > 0) {
      record['official_chief'] = value;
    } else {
      record['official_chief'] = null;
    }
  }

  onValueChange1(key, record, value) {
    if (value.length > 0) {
      record['official_manager'] = value;
    } else {
      record['official_manager'] = null;
    }
  }

  /*参加项目专业*/
  editchange(key, record, value) {
    this.project = record;
    this.visible = true;
    this.OkType = '编辑';
    this.selectedRowKeys = [];
    this.selectedRows = [];
  }

  handleCancel() {
    this.visible = false;
    this.showComment = false;
  }

  handleOk() {
    this.visible = false;
    if (this.OkType === '新增') {
      const {count, taskDataTwo} = this;
      const newTaskDataTwo: any = []
      this.selectedRows.forEach(item => {
        newTaskDataTwo.push({
          id: this.uuid(),
          'project_major': item.name,
          'official_chief': null,
          'professionManagePermit':{},
          'professionPermit':{},
          'official_manager': null,
          'plan_begin_time': null,
          'plan_end_time': null,
          'plan_duration': null,
          'offical_outline': '否',
          'chief_audit_flag': '否',
          calculation: '否',
          disabled: false,
        })
      })
      this.taskDataTwo = [...taskDataTwo, ...newTaskDataTwo];
      this.count = count + this.selectedRowKeys.length;
    } else if (this.OkType === '编辑') {
      const record = this.selectedRows[0];
      this.project['project_major'] = record.name;
    }
    this.taskDataTwoNum++;
  }

  /*选中常用语*/
  tagChange(item){
    this.approvalComments=item;
  }

  CommentOk() {
    this.showComment = false;
    this.changeBiz();
    this.changeApproval();
    if (this.clickType === 'agreeClick' || this.clickType === 'reciveClick') {
      getReplayToken({}).then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.replayToken = res.data;
      })
        .finally(() => {
          this.approvalSubmit.replayToken = this.replayToken;
          this.approvalSubmit.workItemId = this.workItemId;
          this.approvalSubmit.workflowCode = this.workflowCode;
          this.approvalSubmit.workflowInstanceId = this.workflowInstanceId;
          loadSubmit(this.approvalSubmit).then((ress) => {
            if (ress.errcode !== 0) return this.$message.error(ress.errmsg as string);
            this.getWorkOutlineInfo();
            if (ress.errcode === 0) return this.$message.success(ress.errmsg as string);
          })
        })
    } else if (this.clickType === 'rejectClick') {
      this.workItemReject.workItemId = this.workItemId;
      this.workItemReject.workflowCode = this.workflowCode;
      this.workItemReject.workflowInstanceId = this.workflowInstanceId;
      loadRejectWorkItem(this.workItemReject).then((res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.getWorkOutlineInfo();
        if (res.errcode === 0) return this.$message.success(res.errmsg as string);
      }))
    }
    this.approvalComments = '';
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

  startTimeChangeTwo(date: string, dateString: string) {
    this.taskTableObj['plan_begin_time'] = date;
  }

  endTimeChangeTwo(date: string, dateString: string) {
    this.taskTableObj['plan_end_time'] = date;
    const time = new Date(this.taskTableObj['plan_end_time']).getTime() - new Date(this.taskTableObj['plan_begin_time']).getTime();
    this.taskTableObj['plan_duration'] = Math.floor(time / (24 * 3600 * 1000))
  }

  taskRowClick(record, index) {
    return {
      on: { // 事件
        click: () => {
          this.taskTableObj = record;
        },
      },
    }
  }

  taskRowSelect(selectedRowKeys, selectedRows) {
    this.taskRowSelectedRowKeys = selectedRowKeys;
    this.taskRowSelectedRows = selectedRows;
  }

  taskTypeChange(val) {
    console.log(val, 'taskTypeChange')
  }

  oneTypeChange(val) {
    console.log(val, 'oneTypeChange')
  }

  twoTypeChange(val) {
    console.log(val, 'twoTypeChange')
  }

  beforeUpload(file) {
    const isLt20M = file.size < 1024 * 1024 * 20;
    // const fileFormat = file.name.slice( file.name.lastIndexOf( '.' ) + 1 ).toLowerCase();
    // const isPic = ['xlsx', 'xls'].includes(fileFormat);
    // if (!isPic) {
    //   this.$message.error('请上传表格类型的文件');
    //   return false;
    // }
    if (!isLt20M) {
      this.$message.error('所选文件单个超过20M，已自动过滤，请检查~');
      return false;
    }
    return isLt20M;
  }

  fileUpload(info) {
    if (info.file.status === 'uploading') {
    } else if (info.file.status === 'done') {
      this.attachment.push(info.file.response.data)
      if (info.file.response.errcode === 0) return this.$message.success(info.file.response.errmsg as string);
      if (info.file.response.errcode !== 0) return this.$message.error(info.file.response.errmsg as string);
    } else if (info.file.status === 'error') {
      this.$message.error(`${info.file.name} 导入失败.`);
    } else {
      this.$message.error("导入异常")
    }
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

  async getContentItemRule() {
    this.projectProfessionalList = [];
    try {
      const {errcode, errmsg, data} = await getContentItemRule({appCode: this.projectCode ?? ''})
      if (errcode !== 0) return this.$message.error(errmsg as string);
      // @ts-ignore
      // eslint-disable-next-line no-shadow
      data.professionTypes.forEach((item, index) => {
        // @ts-ignore
        this.projectProfessionalList.push({name: item, key: index})
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

  onSelectChange(selectedRowKeys, selectedRows) {
    if (this.OkType === '新增') {
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRows = selectedRows;
    } else if (this.OkType === '编辑') {
      this.selectedRowKeys = selectedRowKeys.length > 0 ? [selectedRowKeys.reverse()[0]] : selectedRowKeys;
      this.selectedRows.push(selectedRows.reverse()[0]);
    }
  }

  customHeaderRow(column) {
    const cellStyle = "color: #333;background:#ffff;font-weight:bold;text-align:center"
    return {
      style: cellStyle
    }
  };

  goTaskDetail() {
    if (this.tabName === '任务详情') return this.$message.error('已在当前页面')
    this.tabName = '任务详情';
    // this.$router.back();
  }

  goflowTrackLogs() {
    if (this.tabName === '流程记录') return this.$message.error('已在当前页面')
    this.tabName = '流程记录';
    // this.$router.push({
    //   path: `ProjectPlanning/from/workflow-track/${this.workflowInstanceId}/${this.workitemFinishId}`
    // }).catch((err: any) => {
    //   err;
    // });
  }

  async createClick() {
    await workflowInstanceFlag({
      appCode: this.projectCode ?? '', projectId: this.projectId as string ?? '',
      workflowInstanceId: this.workflowInstanceId ?? '', schemaCode: this.schemaCode ?? "",
      id: this.bizObject.id
    }).then(res => {
      if (!res.data.flag) {
        this.$message.warn(res.data.message as string)
        return
      }
    })
    this.createWorkOutline();
  }

  editClick() {
    /*判断是否可编辑*/
    this.baseData = !this.workOutlineEditAreaAuth.baseData;//任务基本信息编辑权限
    this.cheifInstruction = !this.workOutlineEditAreaAuth.cheifInstruction;//专业任务划分编辑权限
    this.professionTask = !this.workOutlineEditAreaAuth.professionTask;//总工指导意见编辑权限
    this.showInput = true;
    this.taskDataTwoNum++;
  }
  /*获取常用回复语*/
  getCommonReplys(type){
    this.commonReplys=null;
    getCommonReplys({
      appCode:this.projectCode??'',
      schemaCode:this.projectCode+'_xmsqb',
      type:type
    })
      .then(res=>{
        if(res.errcode!==0) return this.$message.error(res.errmsg as string);
        if(!res.data) return;
        this.commonReplys=res.data;
      })
  }

  reciveClick() {//签收
    this.clickType = 'reciveClick';
    this.showComment = true;
  }

  rejectClick() {//驳回
    this.clickType = 'rejectClick';
    this.showComment = true;
    this.getCommonReplys('驳回')
  }

  agreeClick() {//同意
    this.clickType = 'agreeClick';
    this.showComment = true;
    this.getCommonReplys('同意')
  }

  saveClick() {//暂存
    this.changeBiz();
    getReplayToken({}).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.replayToken = res.data;
    })
      .finally(() => {
        loadSave({
          bizObject: this.bizObject,
          replayToken: this.replayToken,
          workItemId: this.workItemId,
          workflowCode: this.workflowCode,
          workflowInstanceId: this.workflowInstanceId,
        })
          .then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
            if (this.createFlag) {
              this.workflowInstanceId = res.data.workflowInstanceId;
            }
            this.baseData = true;//任务基本信息编辑权限
            this.cheifInstruction = true;//专业任务划分编辑权限
            this.professionTask = true;//总工指导意见编辑权限
            this.getWorkOutlineInfo();
            this.showUploadListShow = false;
            this.$message.success('暂存成功');
            this.createFlag = false;
            this.disabledOnetwo = true
            this.cheifInstruction = true
          })
      })
  };

  async submitClick() {//提交
    await workflowInstanceFlag({
      appCode: this.projectCode ?? '', projectId: this.projectId as string ?? '',
      workflowInstanceId: this.workflowInstanceId ?? '', schemaCode: this.schemaCode ?? "",
      id: this.bizObject.id
    }).then(res => {
      if (!res.data.flag) {
        this.$message.warn(res.data.message as string)
        return
      }
    })
    let num = 0;
    if (this.taskDataOne[0].startTime === '') return this.$message.error('专业任务划分:工作大纲计划开始时间不能为空');
    if (this.taskDataOne[0].endTime === '') return this.$message.error('专业任务划分:工作大纲计划结束时间不能为空');
    if (this.taskDataTwo.length > 0) {
      this.taskDataTwo.forEach((item, index) => {
        if (item['project_major'] === null || item['project_major'] === '') return this.$message.error('设计组人员：参加项目专业不能为空');
        if (item['plan_begin_time'] === null || item['plan_begin_time'] === '') return this.$message.error('设计组人员：计划开始时间不能为空');
        if (item['plan_end_time'] === null || item['plan_end_time'] === '') return this.$message.error('设计组人员：计划结束时间不能为空');
        num++;
      })
    }
    if (num === this.taskDataTwo.length || this.createFlag) {
      this.changeBiz();
      getReplayToken({}).then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.replayToken = res.data;
      })
        .finally(() => {
          this.depatmentId = this.userInfo.depatmentId;
          this.workItemSubmit.replayToken = this.replayToken;
          this.workItemSubmit.depatmentId = this.depatmentId;
          this.workItemSubmit.workItemId = this.workItemId;
          this.workItemSubmit.workflowCode = this.workflowCode;
          this.workItemSubmit.workflowInstanceId = this.workflowInstanceId;
          loadSubmit(this.workItemSubmit).then((ress) => {
            if (ress.errcode !== 0) return this.$message.error(ress.errmsg as string);
            this.baseData = true;//任务基本信息编辑权限
            this.cheifInstruction = true;//专业任务划分编辑权限
            this.professionTask = true;//总工指导意见编辑权限
            this.getWorkOutlineInfo();
            this.showUploadListShow = false;
            this.createFlag = false;
            if (ress.errcode === 0) return this.$message.success(ress.errmsg as string);
          })
        })
    }
  }

  changeApproval() {
    this.formatDate();
    this.approval.activityCode = this.processObj.activityCode;
    this.approval.activityName = this.processObj.activityName;
    this.approval.bizObjectId = this.bizObject.id;
    this.approval.commentTime = this.nowTime;
    this.approval.content = this.approvalComments;
    this.approval.createdBy = this.userInfo.id;
    this.approval.createdTime = this.nowTime;
    this.approval.creater.id = this.userInfo.id;
    this.approval.creater.name = this.userInfo.name;
    this.approval.creater.type = this.userInfo.unitType;
    this.approval.workItemId = this.workItemId;
    this.approval.workflowInstanceId = this.workflowInstanceId;
    this.approval.workflowTokenId = this.workflowTokenId;
  }

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

  changeBiz() {
    if (this.createFlag) {
      this.bizObject.id = this.uuid();
      this.bizObject.data.id = this.bizObject.id;
    }
    this.bizObject.schemaCode = this.workflowCode;
    this.bizObject.sheetCode = this.workflowCode;
    this.bizObject.data['project_id'] = this.projectId;
    this.bizObject.data['attachment'] = this.attachment.length === 0 ? this.defaultFileList.length === 0 ? null : this.defaultFileList : this.attachment;
    /*设计组人员*/
    if (this.taskDataTwo.length > 0) {
      this.bizObject.data['XTSJ_design_person'] = JSON.parse(JSON.stringify(this.taskDataTwo));
      console.log(this.bizObject.data.XTSJ_design_person,this.taskDataTwo,'111111111111')
      this.bizObject.data['XTSJ_design_person'].map((item,itemIndex) => {
        item['project_manager'] = [{
          name: this.projectManager.name,
          id: this.projectManager.id,
          type: this.projectManager.type
        }]
        item.professionPermit = this.taskDataTwo[itemIndex].professionPermit.id;
        item.professionManagePermit = this.taskDataTwo[itemIndex].professionManagePermit.id;
        item.official_manager = [
          {
            id: this.taskDataTwo[itemIndex].official_manager[0].id,
            type: 3
          }
        ]
        item.official_chief = [
          {
            id: this.taskDataTwo[itemIndex].official_chief[0].id,
            type: 3
          }
        ]
        item['plan_begin_time'] = (typeof item['plan_begin_time'] === 'string') ? item['plan_begin_time'] === '' ? null : item['plan_begin_time'].substring(0,10) : item['plan_begin_time'] === null ? null : item['plan_begin_time'].format('YYYY-MM-DD');
        item['plan_end_time'] = (typeof item['plan_end_time'] === 'string') ? item['plan_end_time'] === '' ? null : item['plan_end_time'].substring(0,10) : item['plan_end_time'] === null ? null : item['plan_end_time'].format('YYYY-MM-DD');
      })
      console.log(this.bizObject.data.XTSJ_design_person,this.taskDataTwo,'2222')
    } else {
      this.bizObject.data['XTSJ_design_person'] = this.taskDataTwoCopy;
    }
    /*工程基本信息*/
    this.bizObject.data['engineering_name'] = this.form.projectName === '' ? null : this.form.projectName;//工程名称
    this.bizObject.data['engineering_site'] = this.form.constructionSite === '' ? null : this.form.constructionSite;//工程建设地点
    this.bizObject.data['engineering_number'] = this.form.projectNumber === '' ? null : this.form.projectNumber;//工程编号
    this.bizObject.data['engineering_stage'] = this.form.engineeringStage === '' ? null : this.form.engineeringStage;//工程阶段
    this.bizObject.data['task_type'] = this.form.taskTypeVal === '' ? null : this.form.taskTypeVal;//任务类型
    this.bizObject.data['project_level'] = this.form.oneTypeVal === '' ? null : this.form.oneTypeVal;//项目级别

    this.bizObject.data['task_number'] = this.form.taskNumber === '' ? null : this.form.taskNumber;//任务编号
    this.bizObject.data['special_number'] = this.form.specialNumber === '' ? null : this.form.specialNumber;//特殊编号
    this.bizObject.data['result_number'] = this.form.resultNumber === '' ? null : this.form.resultNumber;//自动成果编号
    this.bizObject.data['version_number'] = this.form.versionNumber === '' ? null : this.form.versionNumber;//版本编号
    /*专业任务划分*/
    this.bizObject.data['project_begin_time'] = this.taskDataOne[0].startTime === '' ? null : (this.taskDataOne[0].startTime).format('YYYY-MM-DD');//工作大纲计划开始时间
    this.bizObject.data['project_end_time'] = this.taskDataOne[0].endTime === '' ? null : (this.taskDataOne[0].endTime).format('YYYY-MM-DD');//工作大纲计划开始时间
    /*总工指导意见区域*/
    this.bizObject.data['feedback_creater'] = this.form.opinionCreator;//指导意见创建人
    this.bizObject.data['chief_feedback'] = this.instructions;//输入或附件（文档）总工指导意见
  }

  getWorkOutlineInfo() {
    getWorkOutlineInfo({
      appCode: this.projectCode ?? '',
      projectId: this.projectId as string | null
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.workOutlineEditAreaAuth = res.data.workOutlineEditAreaAuth
      this.showBtn(res);
      this.getForm(res);
      this.getWorkOutlineBindModel();
      if (res.data.workOutlineData !== null) {
        this.getFromLoad();
      }
      if (this.workflowInstanceId !== '') {
        this.getInstanceBaseinfo();
        this.approvalKey++;
      }
      this.sheetCode = res.data.workOutlineData?.sheetCode ?? '';
      this.schemaCode = res.data.workOutlineData?.schemaCode ?? '';
    })
  }

  createWorkOutline() {
    createWorkOutline({
      appCode: this.projectCode ?? '',
      projectId: this.projectId as string | null
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.createFlag = true;
      this.showBtn(res);
      /*判断是否可编辑*/
      this.baseData = !res.data.workOutlineEditAreaAuth.baseData;//任务基本信息编辑权限
      this.cheifInstruction = !res.data.workOutlineEditAreaAuth.cheifInstruction;//专业任务划分编辑权限
      this.professionTask = !res.data.workOutlineEditAreaAuth.professionTask;//总工指导意见编辑权限
      this.getForm(res)
      if (this.workflowInstanceId !== null || '') return this.getInstanceBaseinfo();
    })
  }

  getFromLoad() {
    getChildTableData({
      workflowInstanceId: this.workflowInstanceId ?? '',
      fieldParam1: this.projectId??''
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        //@ts-ignore
        if(Array.isArray(res.data.logInfoList) && res.data.logInfoList.length) {
          //@ts-ignore
          this.activityCode = res.data.logInfoList[res.data.logInfoList.length-1].activityCode;
        }
        //@ts-ignore
        const bizObj = res.data.bizObject
        for (const key in bizObj) {
          this.bizObject.data = bizObj.data;
          this.bizObject.id = bizObj.id;
          this.bizObject.schemaCode = bizObj.schemaCode;
          this.bizObject.sheetCode = bizObj.sheetCode;
          this.bizObject.workflowInstanceId = bizObj.workflowInstanceId;
        }
        //@ts-ignore
        const bizObject = res.data.bizObject.data;
        this.form.taskNumber = bizObject.task_number ?? '';//任务编号
        this.form.specialNumber = bizObject.special_number ?? '';//特殊编号
        this.form.resultNumber = bizObject.result_number ?? '';//自动成果编号
        this.form.versionNumber = bizObject.version_number ?? '';//版本编号
        /*工作大纲计划开始时间*/
        this.taskDataOne[0].startTime = bizObject['project_begin_time'] === null ? '' : moment(bizObject['project_begin_time'], 'YYYY-MM-DD');
        /*工作大纲计划结束时间*/
        this.taskDataOne[0].endTime = bizObject['project_end_time'] === null ? '' : moment(bizObject['project_end_time'], 'YYYY-MM-DD');
        /*设计组人员*/
        bizObject.XTSJ_design_person.map(item => {
          if (item['plan_begin_time'] === null || item['plan_end_time'] === null) {
            item['plan_duration'] = ''
          } else {
            const time = new Date(item['plan_end_time']).getTime() - new Date(item['plan_begin_time']).getTime();
            item['plan_duration'] = Math.floor(time / (24 * 3600 * 1000))
          }
          item['plan_begin_time'] = item['plan_begin_time'] === null ? '' : moment(item['plan_begin_time'], 'YYYY-MM-DD');
          item['plan_end_time'] = item['plan_end_time'] === null ? '' : moment(item['plan_end_time'], 'YYYY-MM-DD');
        })
        this.taskDataTwo = bizObject['XTSJ_design_person'];
        this.taskDataTwo.map(item => item['disabled'] = false)
        this.instructions = bizObject['chief_feedback'];//输入或附件（文档）总工指导意见
        this.form.opinionCreator = bizObject['feedback_creater'];//指导意见创建人
        this.defaultFileList = bizObject?.attachment ?? [];
      })
      .finally(() => {
        this.taskDataTwoNum++;
      })
  }

  getInstanceBaseinfo() {
    getInstanceBaseinfo({
      workflowInstanceId: this.workflowInstanceId
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.status = res.data.status === 'PROCESSING' ? '进行中' : '';
        this.processObj = res.data.participants[0];
        this.usedTime = timeTranslate(res.data.usedTime);
      })
  }

  showBtn(res) {
    this.createButton = res.data.buttonAuth.createButton;
    this.editButton = res.data.buttonAuth.editButton;
    this.reciveButton = res.data.buttonAuth.reciveButton;
    this.rejectButton = res.data.buttonAuth.rejectButton;
    this.saveButton = res.data.buttonAuth.saveButton;
    this.submitButton = res.data.buttonAuth.submitButton;
    this.agreeButton = res.data.buttonAuth.agreeButton;
  }

  getForm(res) {
    if (res.data.workOutlineData === null) return; //this.$message.error('暂无数据')
    this.workItemId = res.data.workOutlineData?.workitemId;
    this.workflowCode = res.data.workOutlineData?.workflowCode;
    this.workflowInstanceId = res.data.workOutlineData?.workflowInstanceId;
    this.workitemFinishId = res.data.workOutlineData?.workitemFinishId;
    this.workOutlineDataId = res.data.workOutlineData?.id;
    this.projectManagerId = res.data.workOutlineData?.project_manager[0].id;
    this.workflowTokenId = res.data.workOutlineData?.workflowTokenId;
    /*工程基本信息*/
    this.form.projectName = res.data.workOutlineData?.projectName ?? '';//工程名称
    this.form.constructionSite = res.data.workOutlineData?.projectLocation ?? '';//工程建设地点
    this.form.projectNumber = res.data.workOutlineData?.projectCode ?? '';//工程编码
    this.form.engineeringStage = res.data.workOutlineData?.projectStage ?? '';//工程阶段
    if (res.data.workOutlineData?.taskType === '工作大纲') {//项目级别
      this.form.taskTypeVal = true;
    }
    if (res.data.workOutlineData?.projectLevel === '一类项目') {//项目级别
      this.form.oneTypeVal = true;
    }
    if (res.data.workOutlineData?.projectLevel === '二类项目') {//项目级别
      this.form.twoTypeVal = true;
    }
    /*评审人员列表*/
    this.form.companyChiefEngineer = res.data.workOutlineData?.company_chief?.name;//公司主管总工
    const companyChief: any[] = []
    companyChief.push(res.data.workOutlineData?.company_chief)
    this.bizObject.data['company_chief'] = companyChief;
    this.bizObject.data['company_chief'].map(item => {
      item['type'] = item["unitType"]
    });
    this.form.generalManager = res.data.workOutlineData?.company_manager?.name;//公司主管总经理
    const companyManager: any[] = []
    companyManager.push(res.data.workOutlineData?.company_manager)
    this.bizObject.data['company_manager'] = companyManager;
    this.bizObject.data['company_manager'].map(item => {
      item['type'] = item["unitType"]
    });
    if (res.data.workOutlineData?.manufacturer !== null) {
      this.bizObject.data['manufacturer'] = res.data.workOutlineData?.manufacturer;
      this.bizObject.data['manufacturer'].map(item => {
        item['type'] = item["unitType"]
      });
      res.data.workOutlineData?.manufacturer.forEach(item => {//生产单位
        let str = ''
        res.data.workOutlineData?.manufacturer.forEach(item => {
          if (res.data.workOutlineData?.manufacturer.length > 1) {
            str += item.name + '，'
          } else {
            str += item.name
          }
          this.form.productionUnit = str
        });//项目经理
      })
    }
    this.form.chiefEngineer = res.data.workOutlineData?.manufacturer_chief?.name;//生产单位分管总工
    const manufacturerChief: any[] = []
    manufacturerChief.push(res.data.workOutlineData?.manufacturer_chief)
    this.bizObject.data['manufacturer_chief'] = manufacturerChief;
    this.bizObject.data['manufacturer_chief'].map(item => {
      item['type'] = item["unitType"]
    });
    this.form.chargeManager = res.data.workOutlineData?.manufacturer_manager?.name;//生产单位经理
    const manufacturerManager: any[] = []
    manufacturerManager.push(res.data.workOutlineData?.manufacturer_manager)
    this.bizObject.data['manufacturer_manager'] = manufacturerManager;
    this.bizObject.data['manufacturer_manager'].map(item => {
      item['type'] = item["unitType"]
    });
    this.projectManager = res.data.workOutlineData?.project_manager[0];
    if (res.data.workOutlineData?.project_manager !== null) {
      this.bizObject.data['project_manager'] = res.data.workOutlineData?.project_manager;
      this.bizObject.data['project_manager'].map(item => {
        item['type'] = item["unitType"]
      });
      let str = ''
      res.data.workOutlineData?.project_manager.forEach(item => {//项目经理
        if (res.data.workOutlineData?.project_manager.length > 1) {
          str += item.name + '，'
        } else {
          str += item.name
        }
        this.form.projectManager = str
      });
    }
    /*未签收人员列表*/
    this.personnelList.unsignPersonnelList = res.data.workOutlineData?.unsignPersonnelList ?? [];
    /*已签收人员列表*/
    this.personnelList.signPersonnelList = res.data.workOutlineData?.signPersonnelList ?? [];
  }

  goDetail(item) {
    if (this.editorUrl && this.activityCode==='edit_workoutline') {
      this.showEditWorkOutlinePanel = true;
    } else {
      window.open(sessionStorage.getItem('previewUrl')?`${sessionStorage.getItem('previewUrl')}?url=${window.config.apiHost}/api/aliyun/download?refId=${item.refId}=name=${item.name}`:`http://10.20.90.213:8012/onlinePreview?url=https://collaborativedesign.ctesi.com.cn/api/api/aliyun/download?refId=${item.refId}=name=${item.name}`)
    }
  }

  download(item) {
    window.open(`${env.apiHost}/api/aliyun/download?refId=${item.refId}`)
  }

  formatDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month: string | number = date.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    let day: string | number = date.getDate();
    day = day < 10 ? "0" + day : day;
    let hour: string | number = date.getHours();
    hour = hour < 10 ? "0" + hour : hour;
    let minute: string | number = date.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;
    let second: string | number = date.getSeconds();
    second = second < 10 ? "0" + second : second;
    this.nowTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  //一键生成工作大纲成果文件 -start
  //一键生成逻辑
  createWorkOutlineFile() {
    this.showWorkOutlineModels = true
  }

  showWorkOutlineModels: boolean = false;

  getWorkOutlineBindModel() {
    getWorkOutlineBindModel({
      appCode: this.projectCode ?? '',
      workOutlineId: this.workOutlineDataId
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      if (!res.data) return;
      this.editorUrl = res.data.editorUrl
    })
  }

  closeWorkOutlineModels() {
    this.showWorkOutlineModels = false
  }

  showEditWorkOutlinePanel: boolean = false;

  openEditWorkOutlinePanel() {
    this.showEditWorkOutlinePanel = true;
  }

  closeEditWorkOutlinePanel() {
    this.showEditWorkOutlinePanel = false;
  }

  editorUrl: string = '';
  defaultFileType: string = '';
  defaultBussiness: string = '';
  defaultProjectState: string = '';
  defaultProfessionType: string = '';
  eidtWorkOutlineFile(row: Type.WorkOutlineModel) {
    this.editorUrl = row.editorUrl;
    this.defaultFileType = row.fileType;
    this.defaultBussiness = row.bussiness;
    this.defaultProjectState = row.projectState;
    this.defaultProfessionType = row.professionType;
  }
  refreshAttachment() {
    getChildTableData({
      workflowInstanceId: this.workflowInstanceId ?? '',
      fieldParam1: this.projectId??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      //@ts-ignore
      const bizObject = res.data.bizObject.data;
      this.defaultFileList = bizObject?.attachment ?? [];
    })
  }
  //控制工作大纲-一键生成显影
  activityCode: string = '';

  OneTouch(){
    getProfessionalTask({
      appCode:this.projectCode??'',
      projectId:this.projectId
    }).then(res=>{
      if(res.errcode===0){
        const {count, taskDataTwo} = this;
        const newTaskDataTwo: any = []
        res.data.forEach(item => {
          newTaskDataTwo.push({
            id: this.uuid(),
            'project_major': item,
            'official_chief': null,
            'professionManagePermit':{},
            'professionPermit':{},
            'official_manager': null,
            'plan_begin_time': null,
            'plan_end_time': null,
            'plan_duration': null,
            'offical_outline': '否',
            'chief_audit_flag': '否',
            calculation: '否',
            disabled: false,
          })
        })
        this.taskDataTwo = [...taskDataTwo, ...newTaskDataTwo];
        this.taskDataTwoNum++;
      }else {
        this.$message.warn('一键生成失败')
      }
    })
  }

  //end
  //关联任职资格 -start
  showRelevanceTable: boolean = false;
  selectedRowIndex: number = -1;
  selectedType: string = '';// 'professionManagePermit'| 'professionPermit';
  searchProjectMajor: string = '';
  openRelevanceTable(rowIndex:number,type:string,projectMajor:any) {
    console.log(projectMajor,'r')
    this.selectedRowIndex = rowIndex;
    this.selectedType = type;
    this.searchProjectMajor = projectMajor;
    this.showRelevanceTable = true
  }
  closeRelevanceModal() {
    this.selectedRowIndex = -1;
    this.selectedType = '';
    this.searchProjectMajor = '';
    this.showRelevanceTable = false;
  }
  bindPerson(data:any) {
    console.log(data,'11',this.taskDataTwo,'taskDataTwo')
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
  //end

  mounted() {
    // @ts-ignore
    this.userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.count = Number(this.taskDataTwo.length + 1);
    this.projectId = this.$route.query.projectId;
    this.getWorkOutlineInfo();
  }
}
