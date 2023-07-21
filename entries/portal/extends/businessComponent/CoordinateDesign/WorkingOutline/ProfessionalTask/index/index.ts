import {Component, Vue, InjectReactive, Ref, Prop, Watch} from "vue-property-decorator";
import {
  Input,
  Button,
  Icon,
  Table,
  FormModel,
  Collapse,
  Checkbox,
  Modal,
  Tabs,
  Select
} from "@h3/antd-vue";
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import AddDesignTask from "../components/AddDesignTask";
import CreateDesignTask from "../components/CreateDesignTask";
import ItemSelect from "../components/ItemSelect";
import {
  professionTaskList,
  ProfessionTask,
  professionOutlineList,
  submitProfessionTask,
  rejectProfessionTask,
  getProfessionTaskById,
  designTaskPermission,
  designTaskListV2,
  produceDesignTask,
  DesignTaskV2,
  createDesignTaskV2,
  exportDesignTaskTemplate, importDesignTaskInfoTemplate, exportDesignTaskList
} from "../../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask";
import moment from "moment";
import {createDesignTask, getCommonReplys, workflowInstanceFlag} from "../../../../../service/api";
import Utils from "../../../../../utils";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import {designTaskMapping} from "../../../publicConfig";
import {TableColumn} from "../../../../../type";

type tableItem = {
  id: string;
  projectName: string;
  children?: tableItem[];
};
type selectorOption = { id: string, name: string, type: number };

interface LoadData {
  profession_task_name: string | undefined | null,
  engineering_name: string | undefined | null,
  manufacturer: selectorOption[] | undefined | null,
  profession_name: string | undefined | null,
  use_software_name: string | undefined | null,

  proofread_level: string | undefined | null,
  design_guider_flag: string | undefined | null,
  countersign_flag: string | undefined | null,
  project_manager_audit: string | undefined | null,

  designer: selectorOption[] | undefined | null,
  design_guider: selectorOption[] | undefined | null,
  partners: selectorOption[] | undefined | null,
  checker: selectorOption[] | undefined | null,
  auditor: selectorOption[] | undefined | null,
  project_manager: selectorOption[] | undefined | null,
  countersigned: selectorOption[] | undefined | null,
  department_chief: selectorOption[] | undefined | null,
  company_chief: selectorOption[] | undefined | null,
  task_time: string | undefined | null,
  plan_duration: string | undefined | number | null,
  plan_end_time: string | undefined | null,
  plan_start_time: string | undefined | null,
  engineering_stage: string | undefined | null,

  industryType: string | undefined | null,
  projectType: string | undefined | null,
  modelType: string
}

interface TempDesignData {
  oneTouchState: boolean;
  professionalId: string;
  designTaskData: any[]
}

@Component({
  name: "professionalTask",
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ATable: Table,
    ACheckbox: Checkbox,
    AButton: Button,
    AIcon: Icon,
    [Tabs.name]: Tabs,
    [Tabs.TabPane.name]: Tabs.TabPane,
    [Input.TextArea.name]: Input.TextArea,
    [Input.Search.name]: Input.Search,
    [Modal.name]: Modal,
    [FormModel.name]: FormModel,
    [FormModel.Item.name]: FormModel.Item,
    [Select.name]: Select,
    AddDesignTask,
    CreateDesignTask,
    ItemSelect,
    staffSelector,
    ATooltip: Tooltip
  },
})
export default class ProfessionalTask extends Vue {
  @InjectReactive("project") appCode!: string;
  @Ref("modalForm") form!: FormModel;
  @Prop({required: true}) projectId!: string;
  activeKey: Array<string> = ["1", "2"];

  changeActiveKey(key: string[]) {
    if (key.includes('1')) return;
    this.activeKey.push('1')
  }

  current: Array<string> = ["1", "2"];
  activeMen = 1;

  tableRowKey = 1;
  esignTaskTableRowKey = 1;
  tabsActiveKey = "tab1";

  visible = false;
  selectRecord: (ProfessionTask & { actionIndex?: number }) | null = null;
  selectId: string = "";
  professionalTask: string = '';
  modalTitle = "";
  modalForm = {comment: ""};
  modalRules = {
    comment: [
      {
        required: true,
        message: "请输入意见/建议",
        trigger: ["change", "blur"],
      },
    ],
  };
  okText = "";
  confirmLoading = false;

  ProfessionalTaskColumns: {
    title: string;
    key?: string;
    dataIndex: string;
    align?: "left" | "right" | "center";
    scopedSlots?: { customRender: string };
    customRender?: (text: string, record, index: number) => string;
    width?: string | number;
    customHeaderCell?: (column) => object;
  }[] = [
    {
      title: "任务编号",
      dataIndex: "taskNumber",
      align: "center",
      customHeaderCell: (column) => ({class: "customHeaderCell2"}),
    },
    {
      title: "专业名称",
      dataIndex: "professionName",
      align: "center",
      scopedSlots: {customRender: "ProfessionalName"},
      customHeaderCell: (column) => ({class: "customHeaderCell2"}),
    },
    {
      title: "当前状态",
      dataIndex: "currentStatus",
      align: "center",
      scopedSlots: {customRender: "CurrentState"},
      customHeaderCell: (column) => ({class: "customHeaderCell2"}),
    },
    {
      title: "当前处理人",
      dataIndex: "currentAuditorName",
      align: "center",
      customHeaderCell: (column) => ({class: "customHeaderCell2"}),
    },
    {
      title: "专业负责人",
      dataIndex: "professionManagerName",
      align: "center",
      customHeaderCell: (column) => ({class: "customHeaderCell2"}),
    },
    {
      title: "计划开始时间",
      dataIndex: "planStartTime",
      align: "center",
      width: 100,
      customHeaderCell: (column) => ({class: "customHeaderCell2"}),
    },
    {
      title: "计划结束日期",
      dataIndex: "planEndTime",
      align: "center",
      width: 100,
      customHeaderCell: (column) => ({class: "customHeaderCell2"}),
    },
    {
      title: "计划工期(天)",
      dataIndex: "planDuration",
      align: "center",
      width: 95,
      customHeaderCell: (column) => ({class: "customHeaderCell2"}),
    },
    {
      title: "专业提纲",
      dataIndex: "outlineFlag",
      align: "center",
      scopedSlots: {customRender: "ProfessionalOutline"},
      customHeaderCell: (column) => ({class: "customHeaderCell"}),
    },
    // {
    //   title: "计算书",
    //   dataIndex: "calculationFlag",
    //   align: "center",
    //   scopedSlots: { customRender: "calculation" },
    //   customHeaderCell: (column) => ({ class: "customHeaderCell" }),
    // },
    {
      title: "操作",
      dataIndex: "button",
      align: "center",
      width: 140,
      scopedSlots: {customRender: "actions"},
      customHeaderCell: (column) => ({class: "customHeaderCell2"}),
    },
  ];

  ProfessionalTaskList: ProfessionTask[] = [];

  pagination = {
    hideOnSinglePage: true,
    current: 1,
    pageSize: 5,
    total: 0,
    onChange: (page: number) => this.paginationChange(page)
  };

  columns: Array<any> = [
    {title: "项目名称", dataIndex: "name", width: "30%"},
    {title: "任务编号", dataIndex: "taskNumber", align: "center"},
    {
      title: "设计任务名称",
      dataIndex: "taskName",
      align: "center",
      scopedSlots: {customRender: "DesignTaskName"},
    },
    // { title: "成果编号", dataIndex: "achievementNumber", align: "center" },
    {title: "当前状态", dataIndex: "currentStatus", align: "center"},
    {title: "当前评审人", dataIndex: "currentAuditorName", align: "center"},
  ];
  data: any = [];
  expandedRowKeys: any = [];

  designTaskColumns = [
    // { title: "任务类型", dataIndex: "taskType", width: "10%" },
    {
      title: "任务名称",
      dataIndex: "taskName",
      width: 240,
      customHeaderCell: (column) => ({class: "customHeaderCell"}),
      ellipsis: true,
      fixed: 'left',
      scopedSlots: {customRender: "taskName"}
    },
    {
      title: "任务编号",
      dataIndex: "taskNumber",
      align: "center",
      width: 200
    },
    {
      title: "当前状态",
      dataIndex: "state",
      width: 120,
      align: "center",
      scopedSlots: {customRender: "state"},
    },
    {
      title: "当前处理人",
      dataIndex: "currentAuditorName",
      align: "center",
      width: 150
    },
    {
      title: "设计人",
      dataIndex: "designer",
      align: "center",
      width: 150,
      scopedSlots: {customRender: "designer"},
      customHeaderCell: (column) => ({class: "customHeaderCell2"})
    },
    {
      title: "设计指导",
      dataIndex: "designGuider",
      align: "center",
      width: 150,
      scopedSlots: {customRender: "designGuider"},
      customHeaderCell: (column) => ({class: "customHeaderCell2"})
    },
    {
      title: "校核人",
      dataIndex: "checkor",
      align: "center",
      width: 150,
      scopedSlots: {customRender: "checkor"},
      customHeaderCell: (column) => ({class: "customHeaderCell2"})
    },
    {
      title: "审核人",
      dataIndex: "auditor",
      align: "center",
      width: 150,
      scopedSlots: {customRender: "auditor"},
      customHeaderCell: (column) => ({class: "customHeaderCell2"})
    },
    {
      title: "项目经理",
      dataIndex: "projectManager",
      align: "center",
      width: 150,
      scopedSlots: {customRender: "projectManager"},
      customHeaderCell: (column) => ({class: "customHeaderCell2"})
    },
    {
      title: "会签人",
      dataIndex: "countersigned",
      align: "center",
      width: 150,
      scopedSlots: {customRender: "countersigned"},
      customHeaderCell: (column) => ({class: "customHeaderCell2"})
    },
    // { title: "计划开始日期", dataIndex: "startTime", align: "center",customRender:(text,record)=>this.parseDataFormat(text,record),customHeaderCell: (column) => ({ class: "customHeaderCell2" }),},
    // { title: "计划结束日期", dataIndex: "endTime", align: "center" ,customRender:(text,record)=>this.parseDataFormat(text,record),customHeaderCell: (column) => ({ class: "customHeaderCell2" }),},
    // { title: "计划工期(天)", dataIndex: "days", align: "center",customHeaderCell: (column) => ({ class: "customHeaderCell2" }), },
    {
      title: "操作",
      dataIndex: "actions",
      width: 100,
      align: "center",
      fixed: 'right',
      scopedSlots: {customRender: 'action'},
      customHeaderCell: (column) => ({class: "customHeaderCell"})
    },
  ];
  designTaskData: any = [];
  designTaskKey: number = 1;
  designTaskExpandedRowKeys: string[] = [];
  /* 专业设计提纲按钮权限 */
  designOutlinePermissions = {
    create: false
  }
  /* 设计任务单按钮权限 */
  designTaskPermissions = {
    create: false,
  }

  designStatus = "全部";
  options = [
    {value: "全部", label: "全部", key: -1},
    {value: "待接收", label: "待接收", key: 0},
    {value: "设计中", label: "设计中", key: 1},
    {value: "校核中", label: "校核中", key: 2},
    {value: "审核中", label: "审核中", key: 3},
    {value: "项目经理审核中", label: "项目经理审核中", key: 4},
    {value: "复审中", label: "复审中", key: 5},
    {value: "审定中", label: "审定中", key: 6},
    {value: "已归档", label: "已归档", key: 7},
  ]

  commonReplys: any = {};//常用回复语

  menuClick(val) {
    this.activeMen = val;
    this.tabsActiveKey = `tab${val}`;
    this.selectedRowsDesignTask = [];
    this.selectedRowKeys = [];
    this.preSelectId = this.selectId
    if (val === 0) {
      this.getProfessionOutlineList();
    } else {
      // this.getDesignTaskList();
      this.tempStorageDesignTaskData();
    }
    this.getDesignTaskPermission();
  }

  created() {
    this.initTaskState();
    this.getProfessionTaskList();
  }

  initTaskState() {
    this.pagination.current = parseInt(this.$route.params.pageNum ?? 1);
    this.pagination.pageSize = parseInt(this.$route.params.pageSettings ?? 5);
    this.activeMen = parseInt(this.$route.params.activeMen ?? 1);
    this.selectId = this.$route.params.zyrwdId ?? '';
    this.checkedAll = Boolean(this.$route.params.checkedAll ?? false);
    this.tabsActiveKey = `tab${this.activeMen}`;
  }

  async getProfessionTaskList() {
    this.data = [];
    const userInfo = sessionStorage.getItem('user')
    const {appCode, projectId, pagination: {pageSize, current: pageNum},} = this;
    try {
      const {errcode, errmsg, data} = await professionTaskList({
        appCode,
        pageNum,
        pageSize,
        projectId,
        professionManagerId: userInfo && !this.checkedAll ? JSON.parse(userInfo).id : ''
      });
      if (errcode) {
        this.$message.error(`获取专业任务列表失败,${errmsg}`);
        return;
      }
      this.ProfessionalTaskList =
        data?.records.map((record) => {
          //处理一键生成状态下，设计任务单最新逻辑
          if (this.tempDesignData.findIndex((t) => t.professionalId === record.id) === -1) {
            this.tempDesignData.push({
              oneTouchState: false,
              professionalId: record.id,
              designTaskData: []
            })
          }
          return {...record};
        }) ?? [];
      this.pagination.total = data?.total ?? 0;
      if (this.ProfessionalTaskList.length) {
        this.professionalTask = this.ProfessionalTaskList[0].professionName;
        if (!this.$route.params.zyrwdId || (this.$route.params.zyrwdId && this.$route.params.zyrwdId !== this.selectId)) {
          this.selectId = this.ProfessionalTaskList[0].id;
        }
        //@ts-ignore
        this.manufacturerId = JSON.parse(this.ProfessionalTaskList[0].manufacturer)[0].id
        if (this.activeMen === 0) {
          this.getProfessionOutlineList();
        } else {
          // this.getDesignTaskList();
          this.tempStorageDesignTaskData();
        }
        this.getDesignTaskPermission();
      }
    } catch (error) {
      this.$message.error(`获取专业任务列表异常,${error}`);
    }
  }

  async getProfessionOutlineList() {
    this.data = [];
    const {appCode, selectId: zyrwdId} = this;
    try {
      const {errcode, errmsg, data} = await professionOutlineList({appCode, zyrwdId});
      if (errcode) {
        return this.$message.error(`获取专业设计提纲列表失败,${errmsg}`);
      } else {
        //@ts-ignore
        this.data = data[0]?.children ?? [];
      }
      // let count = 0;
      // const tableData: tableItem[] = [];
      // for (const key in data) {
      //   if (Object.prototype.hasOwnProperty.call(data, key)) {
      //     const projectNames = key.split("@");
      //     tableData.push({
      //       id: this.tableRowKey++ + "",
      //       projectName: projectNames[0],
      //       children: [],
      //     });
      //     for (let index = 1; index < projectNames.length; index++) {
      //       const record: tableItem = {
      //         id: this.tableRowKey++ + "",
      //         projectName: projectNames[index],
      //         children: [],
      //       };
      //       if (index === projectNames.length - 1) {
      //         record.children = data[key].map((item) => {
      //           return { ...item, projectName: item.engineeringName };
      //         });
      //       }
      //       const children = this.findLastChildren(tableData[count]);
      //       children.push(record);
      //     }
      //   }
      //   count++;
      // }
      // this.expandedRowKeys = this.expandedAllRow(tableData);
      // this.data = tableData;
    } catch (error) {
      this.$message.error(`获取专业设计提纲列表异常,${error}`);
    }
  }

  findLastChildren(data: tableItem): tableItem[] {
    if (data.children && data.children.length <= 0) {
      return data.children;
    } else if (data.children) {
      return this.findLastChildren(data.children[0]);
    } else {
      return [];
    }
  }

  expandedAllRow(data: tableItem[]): string[] {
    const keys: string[] = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      keys.push(element.id);
      if (element.children) {
        keys.push(...this.expandedAllRow(element.children));
      }
    }
    return keys;
  }

  /**
   * 获取设计任务单
   * @param isBatchCreate 唯一标识状态：一键生成后，一键下达，部分下达成功，部分下达失败
   * @param sentIds 已下达任务ids
   */
  async getDesignTaskList(isBatchCreate?:boolean,sentIds?:string[]) {
    if (!isBatchCreate) {this.designTaskData=[]}
    const {appCode, selectId: zyrwdId} = this;
    try {
      const {errcode, errmsg, data} = await designTaskListV2({
        appCode: this.appCode,
        zyrwdId: zyrwdId,
        projectId: this.projectId,
        self: false
      });
      if (errcode) {
        return this.$message.error(`获取设计任务单列表失败,${errmsg}`);
      }
      if (!isBatchCreate) {
        this.designTaskData = data.map(item => {
          const children = item.children.map(child => {
            return {
              ...child,
              editable: false,
            }
          })
          return {
            ...item,
            children,
            editable: true,
          }
        }) ?? [];
      }else {
        Utils.deepFind(this.designTaskData,(item)=> {
          if (sentIds?.includes(item.id)) {
            Utils.deepFind(data,(resItem)=> {
              if (sentIds?.includes(resItem.id)) {
                Object.assign(item,{...resItem,editable: false})
              }
              return false;
            },'children')
          }
          return false
        },'children')
      }
      this.designTaskKey++;
      this.designTaskExpandedRowKeys = this.expandedAllRow(this.designTaskData)
    } catch (error) {
      this.$message.error(`获取设计任务单列表异常,${error}`);
    }
  }

  /* 获取设计任务单权限 */
  async getDesignTaskPermission() {
    if (!this.selectRecordId) {
      this.designTaskPermissions.create = false;
      this.designOutlinePermissions.create = false;
    }
    // eslint-disable-next-line prefer-const
    let {appCode, selectId: zyrwdId} = this;
    zyrwdId = this.selectRecordId?this.selectRecordId:zyrwdId
    try {
      const {errcode, errmsg, data} = await designTaskPermission({appCode,zyrwdId});
      if (errcode) {
        return this.$message.error(`获取设计任务单权限失败,${errmsg}`);
      }
      if (!this.selectRecordId || this.selectRecordId===this.selectId) {
        this.designTaskPermissions.create = data ?? false;
        this.designOutlinePermissions.create = data ?? false;
      }
    } catch (error) {
      this.$message.error(`获取设计任务单权限异常,${error}`);
    } finally {
      this.selectRecordId = ''
    }
  }

  customExpandIcon(props: any) {
    const {expanded, onExpand, record, expandable} = props;
    const h = this.$createElement;
    if (expandable) {
      return h("span", {}, [
        h("a-icon", {
          staticStyle: {
            paddingRight: "10px",
            fontSize: "20px",
            verticalAlign: "middle",
          },
          attrs: {
            type: expanded ? "caret-down" : "caret-right",
          },
          on: {
            click: (event: Event) => {
              onExpand(record, event);
            },
          },
        }),
      ]);
    } else {
      return h("span", {
        staticStyle: {
          paddingRight: "10px",
        },
      });
    }
  }

  actionClick(record: ProfessionTask, index: number) {
    this.selectRecord = record;
    this.selectRecord.actionIndex = index;
    let actionString = "";
    if (index === 0) {
      actionString = "提交";
    } else if (index === 1) {
      actionString = "接收";
    } else {
      actionString = "驳回";
      this.getCommonReplys(actionString)
    }
    this.modalTitle = `确认${actionString}此任务`;
    this.okText = actionString;
    this.visible = true;
  }
  selectRecordId: string = ''

  getCommonReplys(type) {
    this.commonReplys = {};
    getCommonReplys({
      appCode: this.appCode ?? '',
      schemaCode: this.appCode + '_zyrwd',
      type: type
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        if (!res.data) return;
        this.commonReplys = res.data;
      })
  }

  /*选中常用语*/
  tagChange(item) {
    this.modalForm.comment = item;
  }

  async modalOK() {
    const {appCode} = this;
    const {id, workflowInstanceId, xmlbId: projectId} = this.selectRecord as ProfessionTask;
    this.selectRecordId = this.selectRecord?.id??''
    this.confirmLoading = true;
    if (this.selectRecord?.actionIndex == 0 || this.selectRecord?.actionIndex == 1) {
      await workflowInstanceFlag({
        appCode: appCode ?? '', projectId: projectId as string ?? '',
        workflowInstanceId: workflowInstanceId ?? '', schemaCode: 'XTSJ_zyrwd',
        id: id
      }).then(res => {
        if (!res.data.flag) {
          this.$message.warn(res.data.message as string)
          this.confirmLoading = false;
          return
        }
      })
    }
    try {
      let validde = true;
      let comment = "接收任务";
      if (this.form) {
        this.form.validate(valid => {
          validde = valid;
        });
        comment = this.modalForm.comment;
      }
      if (!validde) return;
      if (this.selectRecord?.actionIndex === 0 || this.selectRecord?.actionIndex === 1) {
        //提交 and 接收
        const {errcode, errmsg, data} = await submitProfessionTask({
          appCode,
          workflowInstanceId,
          id,
          comment,
          agree: "true",
          projectId
        });
        if (errcode) {
          this.$message.error(`异常,${errmsg}`);
          return;
        }else {
          this.getProfessionTaskById((this.selectRecord as ProfessionTask).id);
        }
      } else {
        //驳回
        const {errcode, errmsg, data} = await rejectProfessionTask({
          appCode,
          workflowInstanceId,
          id,
          comment,
        });
        if (errcode) {
          this.$message.error(`${this.okText}异常,${errmsg}`);
          return;
        }else {
          this.getProfessionTaskById((this.selectRecord as ProfessionTask).id);
        }
      }
      this.visible = false;
    } catch (error) {
      this.$message.error(`${this.okText}异常,${error}`);
    } finally {
      this.confirmLoading = false;
      this.getDesignTaskPermission();
    }
  }

  async getProfessionTaskById(id: string) {
    const {appCode} = this;
    try {
      const {errcode, errmsg, data} = await getProfessionTaskById({appCode, id});
      if (errcode) {
        this.$message.error(`更新专业任务失败,${errmsg}`);
        return;
      }
      const index = this.ProfessionalTaskList.findIndex(item => item.id === id);
      index > -1 && (this.$set(this.ProfessionalTaskList, index, data));
    } catch (error) {
      this.$message.error(`更新专业任务失败,${error}`);
    }
  }

  afterClose() {
    this.modalForm.comment = "";
    this.selectRecord = null;
    setTimeout(()=> {
      this.selectRecordId = ''
    },1000)
  }

  professionalDesignOutlineAdd() {
    this.$router.push({
      name: "ProfessionalDesignOutline",
      query: {
        projectId: this.projectId,
        id: this.selectId,
        isCreate: "true",
      }
    })
  }

  professionalDesignTaskAdd() {
    this.$router.push({
      name: "ProfessionalDesignTask",
      query: {
        projectId: this.projectId,
        id: this.selectId,//此处其实是传的专业任务单ID
        isCreate: "true",
      }
    })
  }

  customRow(record: ProfessionTask) {
    return {
      on: {
        click: () => {
          this.professionalTask = record.professionName;
          this.preSelectId = this.selectId;
          this.selectId = record.id;
          this.selectedRowKeys = [];
          this.selectedRowsDesignTask = []
          //@ts-ignore
          this.manufacturerId = JSON.parse(record.manufacturer)[0].id
          if (this.activeMen === 0) {
            this.getProfessionOutlineList();
          } else {
            // this.getDesignTaskList(record.id);
            this.tempStorageDesignTaskData()
          }
          this.getDesignTaskPermission();
        }
      }
    }
  }

  expand(expanded: boolean, record: { id: string }, key: string) {
    if (expanded) {
      this[key].push(record.id);
    } else {
      const itemIndex = this[key].indexOf(record.id);
      if (itemIndex > -1) {
        this[key].splice(itemIndex, 1)
      }
    }
  }

  rowClassName(record: ProfessionTask, index: number) {
    if (record.id === this.selectId) {
      return "ant-table-row-selected tableBackColor"
    } else {
      return ""
    }
  }

  /* 点击专业提纲行 */
  customRowDesignOutline(record: { children?: [], id: string }) {
    return {
      on: {
        click: () => {
          if (record.children) return;
          // @ts-ignore
          this.$router.push({
            name: "ProfessionalDesignOutline",
            query: {
              projectId: this.projectId,
              id: record.id
            },
            params: {
              zyrwdId: this.selectId,
              pageNum: this.pagination.current,
              pageSize: this.pagination.pageSize,
              activeMen: this.activeMen,
              checkedAll: this.checkedAll
            }
          })
        }
      }
    }
  }

  /* 设计任务单行 */
  customRowDesignTask(record: { children?: [], id: string, editable: string }) {
    return {
      on: {
        click: () => {
          if (record.children) return;
          // this.$router.push({
          //   name:"ProfessionalDesignTask",
          //   query:{
          //     projectId:this.projectId,
          //     id:record.id,
          //   }
          // })
        },
        // eslint-disable-next-line no-shadow
        dblclick: () => {
          if (record.children || (!record.children && !record.editable)) return this.$message.warning('只有一键生成的数据才可进行编辑！');
          if (record.editable) {
            this.createDesignTaskVisible = true;
            this.selectedDesignTaskId = record.id;
            this.updateDesignTaskForm = JSON.parse(JSON.stringify(record));
          }
        }
      }
    }
  }

  /* 点击分页事件 */
  paginationChange(page: number) {
    this.pagination.current = page;
    //获取分页数据
    this.getProfessionTaskList();
    this.preSelectId = this.selectId;
    this.selectId = "";
    this.selectedRowsDesignTask = [];
    this.selectedRowKeys = [];
    this.designTaskPermissions.create = false;
    //清除数据
    this.data = [];
    // this.designTaskData=[];
  }

  parseDataFormat(text: string, record: { childred?: [] }) {
    if (text) {
      return moment(text).format("YYYY-MM-DD");
    }
    return "";
  }

  // OneTouch(){
  //   if(this.selectId==='') return this.$message.warn('请选择行！')
  //   createDesignTask({
  //     appCode:this.appCode,
  //     projectId:this.projectId,
  //     professionalTask:this.professionalTask,
  //     id:this.selectId??''
  //   }).then(res=>{
  //     if(res.errcode===0&&res.data){
  //       this.menuClick(1);
  //       this.getDesignTaskList();
  //     }else {
  //       this.$message.warn('一键生成失败,请手动添加')
  //     }
  //   })
  // }


  addDesignTaskVisible = false;
  createDesignTaskVisible = false;
  itemSelectVisible = false;
  designTaskLoading = false;
  showItems: string[] = [];
  totalCount = 0;
  selectItemNames: string[] = [];

  /* 新增设计任务单(弹窗) */
  createDesignTask() {
    this.createDesignTaskVisible = true;
  }

  /* 新增设计任务单后(更新数据) */
  affterCreatedDesignTask() {
    this.createDesignTaskVisible = false;
    this.closeAddDesignModal();
    this.getDesignTaskList();
    this.resetTempData();
  }

  selectedRowsDesignTask: any[] = [];
  selectedRowKeys: string[] = [];

  /* 设计任务单行选择 */
  get designTaskRowSelection() {
    return {
      onSelect: (record: { id: string, taskType: string, editable: boolean, parentId: string, children: { id: string, editable: boolean, [key: string]: any }[], [key: string]: any },
                 selected: boolean, selectedRows: { id: string, [key: string]: any }[], nativeEvent) => {
        if (!record.taskType) {
          //可以编辑的子项
          const children = record.children.filter(item => item.editable);
          const changeIds = children.map(item => item.id);
          this.selectedRowsDesignTask = this.selectedRowsDesignTask.filter(item => !changeIds.includes(item.id));
          this.selectedRowKeys = this.selectedRowKeys.filter(item => !changeIds.includes(item)).filter(item => item !== record.id);
          if (selected) {
            this.selectedRowsDesignTask.push(...children);
            this.selectedRowKeys.push(...[...changeIds, record.id]);
          }
        } else {
          const parent = this.designTaskData.find(item => item.id === record.parentId);
          let childrenIds: string[] = [];
          if (parent) {
            childrenIds = parent.children.map(item => item.id);
          }
          if (selected) {
            this.selectedRowsDesignTask.push(record)
            this.selectedRowKeys.push(record.id);
          } else {
            this.selectedRowsDesignTask = this.selectedRowsDesignTask.filter(item => item.id !== record.id);
            this.selectedRowKeys = this.selectedRowKeys.filter(item => item !== record.id);
          }
          //处理父节点勾选,任意一个子节点勾选，父节点勾选，
          if (this.selectedRowKeys.some(item => childrenIds.includes(item))) {
            if (!this.selectItemNames.includes(record.parentId)) this.selectedRowKeys.push(record.parentId);
          } else {
            this.selectedRowKeys = this.selectedRowKeys.filter(item => item !== record.parentId);
          }
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        this.selectedRowsDesignTask = selectedRows.filter(item => item.taskType && item.editable);
        this.selectedRowKeys = selected ? selectedRows.map(item => item.id) : [];
      },
      getCheckboxProps: record => {
        if (record.taskType) {
          return {
            props: {
              disabled: !record.editable
            }
          }
        } else {
          const parent = this.designTaskData.find(item => item.id === record.id);
          return {
            props: {
              disabled: !parent.children.some(item => item.editable),
            }
          };
        }
      },
      selectedRowKeys: this.selectedRowKeys,
    }
  }

  /* 查看设计任务单 */
  designTaskView(id: string) {
    //@ts-ignore
    this.$router.push({
      name: "ProfessionalDesignTask",
      query: {
        projectId: this.projectId,
        id
      },
      params: {
        zyrwdId: this.selectId,
        pageNum: this.pagination.current,
        pageSize: this.pagination.pageSize,
        activeMen: this.activeMen,
        checkedAll: this.checkedAll
      }
    })
  }

  /* 删除设计任务单 */
  designTaskDelete(id: string) {
    this.$confirm({
      title: '确认要删除选择的数据?',
      okText: '确认',
      cancelText: "取消",
      okType: 'danger',
      centered: true,
      onOk: () => {
        this.designTaskData = this.designTaskData.map(item => {
          let children: any = null;
          if (item.children.some(child => child.id === id)) {
            children = item.children.filter(child => child.id !== id)
          } else {
            children = item.children;
          }
          return {
            ...item,
            children
          }
        });
        //删除空节点
        this.designTaskData.forEach(item => {
          if (item.children.length <= 0) {
            const index = this.designTaskData.findIndex(el => el.id === item.id);
            if (index > -1) {
              this.designTaskData.splice(index, 1);
            }
          }
        })
        this.selectedRowsDesignTask = this.selectedRowsDesignTask.filter(item => item.id !== id);
      }
    })
  }

  desginTaskSearchKeyWords = "";

  /* 设计任务单搜索 */
  onSearchDesignTask(value) {
    this.desginTaskSearchKeyWords = value;
  }

  // designStatus
  deepFind(data: any[]) {
    const arr: any[] = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if (element.children && element.children.length) {
        const findData = this.deepFind(element.children);
        if (findData && findData.length) {
          const parentData = {...element, children: findData};
          arr.push(parentData);
        } else if (this.filterOption(element)) {
          arr.push({...element});
        }
      } else if (this.filterOption(element)) {
        arr.push({...element});
      }
    }
    return arr;
  }

  filterOption(data) {
    if (this.designStatus === "全部") {
      return data.taskName.includes(this.desginTaskSearchKeyWords) || this.formatSelector(data.designer).includes(this.desginTaskSearchKeyWords);
    } else {
      return (data.taskName.includes(this.desginTaskSearchKeyWords) || this.formatSelector(data.designer).includes(this.desginTaskSearchKeyWords)) && data.state === this.designStatus;
    }
  }

  get designTaskDataFilter() {
    return this.deepFind(this.designTaskData);
  }

  /* 一键生成 */
  async batchCreateDesignTask() {
    const {appCode, projectId, selectId: id, professionalTask} = this;
    try {
      this.designTaskLoading = true;
      const {errcode, errmsg, data} = await produceDesignTask({
        appCode,
        projectId,
        professionalTask,
        id
      });
      if (errcode) return this.$message.error(`获取一键生成专业任务失败,${errmsg}`);
      if (data.length <= 0) {
        return this.$message.info("没有专业任务数据");
      }
      const designTaskData = data.map(item => {
        const children = item.children.map(child => {
          return {
            ...child,
            editable: true,
          }
        })
        return {
          ...item,
          children: [...children],
          editable: true,
        }
      }) ?? [];
      this.$info({
        title: '下一步操作为批量修改！',
        okText: '知道了',
      })
      for (let index = 0; index < designTaskData.length; index++) {
        //@ts-ignore
        const element = designTaskData[index];
        const indexTaskName = this.designTaskData.findIndex(item => item.taskName === element.taskName);
        if (indexTaskName > -1) {
          this.designTaskData[indexTaskName].children.push(...element.children);
        } else {
          if (this.designTaskData) {
            this.designTaskData.push(element);
          } else {
            this.designTaskData = [element];
          }
        }
      }
      this.designTaskExpandedRowKeys = this.expandedAllRow(this.designTaskData);
      //一键生成状态-暂存
      for (let i = 0; i < this.tempDesignData.length; i++) {
        if (this.tempDesignData[i].professionalId === this.selectId) {
          this.tempDesignData[i].oneTouchState = true;
          break;
        }
      }
    } catch (error) {
      return this.$message.error(`获取一键生成专业任务异常,${error}`)
    } finally {
      this.designTaskLoading = false;
    }
  }

  /* 一键生成案件状态 */
  get batchCreateStatus() {
    if (!this.designOutlinePermissions.create) {
      return true;
      //一键生成-状态初始化
    } else if (this.tempDesignData.findIndex((i) => i.professionalId === this.selectId) !== -1) {
      return this.tempDesignData[this.tempDesignData.findIndex((i) => i.professionalId === this.selectId)].oneTouchState
    } else {
      for (let index = 0; index < this.designTaskData.length; index++) {
        const element = this.designTaskData[index];
        if (element.children.some(child => child.editable)) {
          return true;
        }
      }
      return false;
    }
  }

  /* 批量修改(弹窗) */
  batchModify() {
    if (!this.selectedRowsDesignTask.length) {
      return this.$message.info("请选择要修改的数据");
    }
    this.itemSelectVisible = true;
  }

  affterItemSelect(data: string[]) {
    if (!data.length) {
      return this.$message.warning("请选择要修改项目");
    }
    this.itemSelectVisible = false;
    this.selectItemNames = this.selectedRowsDesignTask.filter(item => item.editable).map(item => item.taskName);
    this.totalCount = 0;
    for (let index = 0; index < this.designTaskData.length; index++) {
      const element = this.designTaskData[index];
      this.totalCount += element["children"].filter(item => item.editable).length
    }
    this.showItems = data;
    this.addDesignTaskVisible = true;
  }

  formatSelector(value: string | (string | { id: string, name: string, type: number })[] | null) {
    if (!value) return "";
    if (typeof value === "string") {
      return value;
    }
    const arr = value.map(item => {
      if (typeof item === "string") {
        return item;
      } else {
        return item.name;
      }
    });
    return arr.join(";");
  }

  valuesMapping: { [key: string]: string } = {
    auditor: "auditor",
    checkor: "checker",
    countersigned: "countersigned",
    days: "plan_duration",
    designGuider: "design_guider",
    designer: "designer",
    endTime: "plan_end_time",
    projectManager: "project_manager",
    startTime: "plan_start_time",
    proofreadLevel: "proofread_level",
    designGuiderFlag: "design_guider_flag",
    countersignFlag: "countersign_flag",
    projectManagerAudit: "project_manager_audit",
    partners: "partners",
    checker: "checker",
    departmentChief: "department_chief",
    companyChief: "company_chief",
    planStartStr: "plan_start_time",
    planEndStr: "plan_end_time",
    // modelType: 'modelType'
  };

  /* 批量修改 */
  async batchModifyAction(data: LoadData, showItems: string[]) {
    this.addDesignTaskVisible = false;
    for (let index = 0; index < this.selectedRowsDesignTask.length; index++) {
      const selectItem = this.selectedRowsDesignTask[index];
      const item = this.deepFindById(this.designTaskData, selectItem.id);
      //add modelType
      Object.assign(item, {modelType: data.modelType})
      if (!item.taskType || !item.editable) continue;
      showItems.forEach(it => {
        for (const key in this.valuesMapping) {
          if (Object.prototype.hasOwnProperty.call(this.valuesMapping, key)) {
            const element = this.valuesMapping[key];
            if (it === element) {
              item[key] = data[element];
            }
          }
        }
      })
      // item.auditor = data.auditor;
      // item.checkor =  data.checker;
      // item.countersigned = data.countersigned;
      // item.days = data.plan_duration;
      // item.designGuider = data.design_guider;
      // item.designer = data.designer;
      // item.endTime = data.plan_end_time;
      // item.projectManager = data.project_manager;
      // item.startTime = data.plan_start_time;
      //附件值
      item.professionName = this.professionalTask;
      item.zyrwdId = this.selectId;
      item.professionTaskName = item.taskName;
      // item.proofreadLevel = data.proofread_level;
      // item.designGuiderFlag = data.design_guider_flag;
      // item.countersignFlag = data.countersign_flag;
      // item.projectManagerAudit = data.project_manager_audit;
      // item.partners = data.partners;
      // item.checker = data.checker;
      // item.departmentChief = data.department_chief;
      // item.companyChief = data.company_chief;
      // item.planStartStr = data.plan_start_time;
      // item.planEndStr = data.plan_end_time;
      item.proofreadFlag = "";
      item.collaborateFlag = "";
      //add
      item.manufacturer = data.manufacturer;
      item.engineeringName = data.engineering_name;
      item.engineeringStage = data.engineering_stage;
    }
  }

  deepFindById(data: any[], id: string) {
    let findData: any = null;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if (element.id === id) {
        findData = element;
      } else if (element.children && element.children.length) {
        findData = this.deepFindById(element.children, id);
      }
      if (findData) break;
    }
    return findData;
  }

  /* 一键下达 */
  async batchCreate() {
    this.errorDesignTask = [];
    const {appCode, projectId, selectId: zyrwdId, professionalTask: professionalTask} = this;
    const designTaskList: DesignTaskV2[] = [];
    for (let index = 0; index < this.designTaskData.length; index++) {
      const element = this.designTaskData[index];
      for (let index2 = 0; index2 < element["children"].length; index2++) {
        const item = element["children"][index2];
        if (item.editable && this.selectedRowKeys.includes(item.id)) {
          if (item.designer && Array.isArray(item.designer) && item.designer.length > 1) return this.$message.warning(`任务名称：${item.taskName}：只能选择一个设计人！请重新选择`)
          // if(item.designGuider && Array.isArray(item.designGuider) && item.designGuider.length>1) return this.$message.warning('存在重复的人员！请重新选择')
          if (item.checkor && Array.isArray(item.checkor) && item.checkor.length > 1) return this.$message.warning(`任务名称：${item.taskName}：只能选择一个校核人！请重新选择`)
          if (item.auditor && Array.isArray(item.auditor) && item.auditor.length > 1) return this.$message.warning(`任务名称：${item.taskName}：只能选择一个审核人！请重新选择`)
          // if(item.projectManager && Array.isArray(item.projectManager) && item.projectManager.length>2) return this.$message.warning('存在重复的人员！请重新选择')
          // if(item.countersigned && Array.isArray(item.countersigned) && item.countersigned.length>2) return this.$message.warning('存在重复的人员！请重新选择')
          //数据校验 todo
          designTaskList.push({
            ...item,
            professionTaskName: item.professionTaskName ? item.professionTaskName : item.taskName,
            designer: item.designer ? JSON.stringify(item.designer.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
            designGuider: item.designGuider ? JSON.stringify(item.designGuider.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
            partners: item.partners ? JSON.stringify(item.partners.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
            checker: item.checker ? JSON.stringify(item.checker.map(el => ({
              id: el.id,
              type: el.type
            }))) : item.checkor ? JSON.stringify(item.checkor.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
            auditor: item.auditor ? JSON.stringify(item.auditor.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
            projectManager: item.projectManager ? JSON.stringify(item.projectManager.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
            countersigned: item.countersigned ? JSON.stringify(item.countersigned.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
            departmentChief: item.departmentChief ? JSON.stringify(item.departmentChief.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
            companyChief: item.companyChief ? JSON.stringify(item.companyChief.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
            startTime: item.startTime ? item.startTime.substring(0, 10) : '',
            endTime: item.endTime ? item.endTime.substring(0, 10) : '',
            planStartStr: item.planStartStr ? item.planStartStr.substring(0, 10) : '',
            planEndStr: item.planEndStr ? item.planEndStr.substring(0, 10) : '',
            manufacturer: item.manufacturer ? JSON.stringify(item.manufacturer.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
            checkor: item.checkor ? JSON.stringify(item.checkor.map(el => ({
              id: el.id,
              type: el.type
            }))) : "",
          });
        }
      }
    }

    if (!designTaskList.length) {
      return this.$message.warning("没有可以下达的设计任务单");
    }
    try {
      this.designTaskLoading = true;
      const {errcode, errmsg, data} = await createDesignTaskV2({
        appCode,
        zyrwdId,
        projectId,
        designTaskList,
        professionalTask
      });
      if (errcode) {
        return this.$message.error(`一键下达任务失败,${errmsg}`);
      }
      if (!data?.flag) {
        this.errorMes = [];
        this.showErrorMes = true;
        this.errorDesignTask = data?.designTaskList??[];
        const errorData = data?.designTaskList??[];
        //部分下达成功，部分下达失败情景
        if (errorData.length!==designTaskList.length) {
          //获取已经下达成功任务单id列表
          const sentIds:string[] = [];
          designTaskList.map((v)=>{
            if (!errorData.map((i)=> i.id).includes(v.id)) {
              sentIds.push(v.id)
            }
          })
          return this.getDesignTaskList(true,sentIds??[]);
        }
        return
        // return this.errorMes = (data?.designTaskList as any[]).map((i) => i.errorMsg)
      }
      this.$message.success("一键下达设计任务单完成");
      this.resetTempData();
      this.getDesignTaskList();
    } catch (error) {
      return this.$message.error(`一键下达任务异常,${error}`);
    } finally {
      this.designTaskLoading = false;
    }
  }

  //一键下达 - 显示错误信息
  showErrorMes: boolean = false;
  errorMes: string[] = []

  /* 批量删除 */
  batchDelete() {
    if (!this.selectedRowsDesignTask.length) {
      return this.$message.info("请选择要删除的数据");
    }
    this.$confirm({
      title: '确认要删除选择的数据?',
      okText: '确认',
      cancelText: "取消",
      okType: 'danger',
      centered: true,
      onOk: () => {
        const deleteItemIds: string[] = [];
        for (let index = 0; index < this.selectedRowsDesignTask.length; index++) {
          const selectItem = this.selectedRowsDesignTask[index];
          const item = this.deepFindById(this.designTaskData, selectItem.id);
          if (!item.taskType || !item.editable) continue;
          deleteItemIds.push(item.id);
        }
        this.designTaskData = this.designTaskData.map(item => {
          let children: any = null;
          if (item.children.some(child => deleteItemIds.includes(child.id))) {
            children = item.children.filter(child => !deleteItemIds.includes(child.id))
          } else {
            children = item.children;
          }
          return {
            ...item,
            children
          }
        });
        //删除空节点
        this.designTaskData.forEach(item => {
          if (item.children.length <= 0) {
            const index = this.designTaskData.findIndex(el => el.id === item.id);
            if (index > -1) {
              this.designTaskData.splice(index, 1);
            }
          }
        })
        this.selectedRowsDesignTask = this.selectedRowsDesignTask.filter(item => !deleteItemIds.includes(item.id));
      }
    })
  }

  //TODO 一键导入设计任务单 start
  showDesignTaskModal: boolean = false;
  uploadLoading: boolean = false;
  manufacturerId: string = '';

  closeDesignTaskModal() {
    this.showDesignTaskModal = false;
  }

  downloadTemplate() {
    exportDesignTaskTemplate({
      appCode: this.appCode ?? '',
      zyrwdId: this.selectId ?? '',
      departmentId: this.manufacturerId,
    }).then((res) => {
      this.isExcel("xlsx", `${this.professionalTask}设计任务单模板导入模板`, res);
    })
  }

  isExcel(type, name, data) {
    const link = document.createElement("a");
    const blob = new Blob([data]);
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${name}.` + type);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  importDesignTaskInfoTemplate() {
    const {$refs} = this;
    if ($refs.fileInput) {
      ($refs.fileInput as HTMLInputElement).click();
    }
  }

  fileInput(e) {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const fileFormat = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      if (["xlsx", "xls"].indexOf(fileFormat) === -1)
        return this.$message.error("请上传Excel文件!");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("zyrwdId", this.selectId ?? '');
      formData.append('appCode', this.appCode ?? '');
      formData.append('departmentId', this.manufacturerId);
      this.uploadLoading = true;
      importDesignTaskInfoTemplate(formData).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
        this.$message.success('导入成功！')
        this.resetTempData();
        //增量增加设计人
        for (let index = 0; index < res.data.length; index++) {
          //@ts-ignore
          const element = res.data[index];
          element.editable = true;
          element.children = null;
          element.taskName = element.professionTaskName;
          const indexTaskName = this.designTaskData.findIndex(item => item.taskName === element.taskType);
          if (indexTaskName > -1) {
            this.designTaskData[indexTaskName].children.push(element);
          } else {
            this.designTaskData.push({
              id: Utils.uuid(),
              taskName: element.taskType,
              editable: true,
              children: [element]
            });
          }
        }
        this.designTaskExpandedRowKeys = this.expandedAllRow(this.designTaskData);
        this.showDesignTaskModal = false;
      }).finally(() => {
        this.uploadLoading = false;
        this.inputKey++;
      })
    }
  }

  personOptionsSingle: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title: '选择人'
  };
  inputKey: number = 1;

  //TODO end
  onValueChangePerson(val, id, key) {
    Utils.deepFind(this.designTaskData, (item) => {
      if (id === item.id) {
        item[key] = val
      }
      return false;
    }, 'children')
  }

  //TODO 设计任务单：一键生成状态，仅切换专业任务单-取最新状态 start
  preSelectId: string = '';
  tempDesignData: TempDesignData[] = []

  //TODO 暂存前一个设计任务单（oneTouchState为true），取后一个设计任务单（oneTouchState为true）
  tempStorageDesignTaskData() {
    //暂存-切换前专业任务单对应的设计任务单list
    for (let i = 0; i < this.tempDesignData.length; i++) {
      if (this.tempDesignData[i].professionalId === this.preSelectId) {
        if (this.tempDesignData[i].oneTouchState) {
          this.tempDesignData[i].designTaskData = JSON.parse(JSON.stringify(this.designTaskData))
        }
      }
    }
    //取-初始化切换后专业任务单对应的设计任务单list
    for (let i = 0; i < this.tempDesignData.length; i++) {
      if (this.tempDesignData[i].professionalId === this.selectId) {
        if (this.tempDesignData[i].oneTouchState) {
          this.designTaskData = JSON.parse(JSON.stringify(this.tempDesignData[i].designTaskData));
          this.designTaskExpandedRowKeys = this.expandedAllRow(this.designTaskData)
        } else {
          this.getDesignTaskList();
        }
        break;
      }
    }
  }

  resetTempData() {
    this.preSelectId = '';
    this.tempDesignData.map((i) => {
      i.oneTouchState = false;
      i.designTaskData = [];
    })
  }

  //TODO end

  //TODO 修改设计任务单 -  批量编辑状态 start
  updateDesignTaskForm: any = {};
  selectedDesignTaskId: string = '';

  closeAddDesignModal() {
    this.createDesignTaskVisible = false;
    this.updateDesignTaskForm = {};
    this.selectedDesignTaskId = '';
  }

  updateDesignTask(formData: LoadData) {
    Utils.deepFind(this.designTaskData, (item) => {
      if (item.id === this.selectedDesignTaskId) {
        for (const designTaskMappingKey in designTaskMapping) {
          item[designTaskMappingKey] = formData[designTaskMapping[designTaskMappingKey]]
          if (designTaskMappingKey === 'taskName') {
            item.professionTaskName = item[designTaskMappingKey]
          }
        }
        item.zyrwdId = this.selectId;
        this.closeAddDesignModal();
      }
      return false;
    }, 'children')
  }

  //TODO end
  //查看全部专业任务单
  checkedAll: boolean = false;

  changeCheckState(e: any) {
    this.pagination.current = 1;
    this.checkedAll = e.target.checked;
    this.selectId = '';
    this.getProfessionTaskList();
  }

  //导出设计任务单
  exportLoading: boolean = false;

  exportDesignTask() {
    this.exportLoading = true
    exportDesignTaskList({
      appCode: this.appCode ?? '',
      zyrwdId: this.selectId
    }).then((res) => {
      const userInfo = sessionStorage.getItem('user');
      if (userInfo) {
        Utils.downloadFile("xlsx", `${JSON.parse(userInfo).name}_${this.professionalTask}_设计任务单列表导出数据_${moment(new Date()).format('YYYY-MM-DD HH.mm')}`, res)
      }
    }).finally(() => {
      this.exportLoading = false
    })
  }
  //TODO start 一键下达设计任务单错误项提示
  errorDesignTask:any[] = [];
  errorDesignTaskColumns: TableColumn<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      scopedSlots: {customRender: 'index'},
    },
    {
      title: '任务名称',
      dataIndex: 'professionTaskName',
      key: 'professionTaskName',
      ellipsis: true
    },
    {
      title: '必填项',
      dataIndex: 'errorMsg',
      key: 'errorMsg',
      width: 200,
      scopedSlots: {customRender: 'errorMsg'}
    },
  ];
  updateDesignTaskByFlag(designTsk:any[]) {
    const designTaskData = designTsk.map(item => {
      return {
        ...item,
        editable: true,
        taskName: item.professionTaskName
      }
    }) ?? [];
    for (let index = 0; index < designTaskData.length; index++) {
      //@ts-ignore
      const element = designTaskData[index];
      const indexTaskName = this.designTaskData.findIndex(item => item.taskName === element.taskName);
      if (indexTaskName > -1) {
        this.designTaskData[indexTaskName].children.push(...element);
      } else {
        if (this.designTaskData) {
          this.designTaskData.push(element);
        } else {
          this.designTaskData = [element];
        }
      }
    }
  }
  //TODO end
  fullTable: boolean = false;
  scrollTableX: number = 850;
  scrollTableY: number = 440
}

