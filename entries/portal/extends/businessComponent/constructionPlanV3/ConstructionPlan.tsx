import {Component, InjectReactive, Ref, Vue, Watch} from "vue-property-decorator";
import Class from "./ConstructionPlan.module.less";
import moment from "moment";
import {Gantt, GanttClass, Icon} from "@ctesi/component";
import * as Type from "../../type";
import * as Constant from '../../constant';
import WBSCodeManage from "../WBSCodeManage/WBSCodeManageV3";
import ConstructionBase from "../constructionBase/ConstructionBase";

import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";

import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";

import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";

import CheckBox from "ant-design-vue/lib/checkbox";
import CheckBoxGroup from "ant-design-vue/lib/checkbox/Group";
import "ant-design-vue/lib/checkbox/style/index.css";

import Progress from 'ant-design-vue/lib/progress';
import 'ant-design-vue/lib/progress/style/index.css';

import * as testData from './project.json';

import Association from "./Association.vue"

import {
  addSchedulePlan,
  getSchedulePlanById,
  getTreeListV3,
  getYearsById,
  importWBSDataV3,
  exportWBSDataV3,
  launchSchedulePlanProcess,
  refreshWBSListV3,
  getPreTasks,
  addPreTasks,
  deletePreTasks,
  updatePreTasks,
  getProgressBSTemplateV3,
} from "../../service/api";
import Utils from "../../utils";
import omit from "omit.js";

@Component({
  name: "ConstructionPlan",
})
export default class ConstructionPlan extends Vue {
  @InjectReactive("project") projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  @Ref() GanttRef?: Gantt<Type.WBSNdMBS>;

  @Ref() FileInput?: HTMLElement;

  private templateLoading: boolean = false;

  private planId: string | null = null;

  private ganttInstance: GanttClass.GanttType<Type.WBSNdMBS> | null = null;

  private receiveYear: Array<string> = ["2021", "2022"];

  private year: number = 99;

  private changeQuarter: boolean = false;

  private quarter: 1 | 2 | 3 | 4 | 99 = 99;

  private changeMonth: boolean = false;

  private month: number | 99 = 99;

  private launchLoading: boolean = false;

  private saveLoading: boolean = false;

  private isModalVisible: boolean = false;

  private percent: number = 0;

  private isDownload: string = "正在导入中...";

  private basicInfo: Type.SchedulePlan = {
    planSchemeName: "",
    projectCode: "",
    projectName: "",
    remarks: "",
    schedulePlanId: "",
    schemeMoney: 0,
    schemePeriod: 0,
    schemePlanAmount: 0,
    schemePlanEnd: moment(new Date()).add(1, "days"),
    schemePlanStart: moment(new Date()),
    state: "",
    businessState: "未审核",
  };

  private wbsCodeManageVisible: boolean = false;

  private ganttFullView: boolean = false;

  private wbsCodeMangeWithWBS: GanttClass.GanttTask<Type.WBSNdMBS> | null = null;

  private showCriticalPath: boolean = false;

  private ganttConditionCheckType: Array<string> = [];

  businessState: string = ""

  isRelation: boolean = false

  @Watch('projectConfig', {immediate: true, deep: true})
  projectConfigListener(config: Type.ProjectConfig) {
    if (config.projectName && config.projectLevel === Constant.ProjectLevel['项目']) this.basicInfo.projectName = config.projectName;
  }

  private ganttConditionChange(value: Array<string>): void {
    this.ganttConditionCheckType = value;
  }

  get TimeZoneQueryCondition() {
    return {
      year: this.year === 99 ? undefined : this.year,
      quarter: this.quarter === 99 ? undefined : this.quarter,
      month: this.month === 99 ? undefined : this.month,
    };
  }

  private renderParentTask(cell, projectInstance): string {
    return `<span>${projectInstance.getTaskByID(cell.record.ParentTaskUID)?.Name ?? ""}</span>`;
  }

  private renderDate(cell, projectInstance): string {
    const dateStr = cell.record.Start ?? null;
    return `<span>${dateStr ? moment(dateStr).format("YYYY-MM-DD") : ""}</span>`;
  }

  private renderDateFinish(cell, projectInstance): string {
    const dateStr = cell.record.Finish ?? null;
    return `<span>${dateStr ? moment(dateStr).format("YYYY-MM-DD") : ""}</span>`;
  }

  private renderMarker(cell, projectInstance): string {
    const {critical, milestone} = cell.record;
    let str: string = "";
    if (milestone) {
      str += `<div aria-role="milestone"></div>`;
    }
    if (critical) {
      str += `<div aria-role="critical"></div>`;
    }
    return `<span aria-role="identifyCell">${str}</span>`;
  }

  private renderFillBlank(cell, projectInstance): string {
    const value = cell.record[cell.field];
    return `<span>${value ?? ""}</span>`;
  }

  private renderWarningProportion(cell, projectInstance): string {
    const value = cell.record[cell.field];
    return `<span>${Number(value)}</span>`;
  }

  private ganttColumns: Array<GanttClass.GanttColumn<Type.WBSNdMBS>> = [
    {
      field: "wbs",
      text: "编码",
      width: 120,
      editor: {
        type: "textbox",
      },
      renderer: this.renderFillBlank,
    },
    {
      field: "Name",
      text: "名称",
      align: "center",
      width: 200,
      editor: {
        type: "textbox",
      },
    },
    /*{
      field: 'ParentTaskUID',
      text: '前置任务',
      align: 'center',
      width: 120,
      renderer: this.renderParentTask
    },*/
    {
      // field: 'planDetailPeriod',
      field: "Duration",
      text: "计划工期",
      align: "center",
      width: 60,
      /* editor: {
         type: 'textbox'
       }*/
    },
    {
      field: "Start",
      text: "计划开始时间",
      align: "center",
      width: 100,
      editor: {
        type: "datepicker",
      },
      renderer: this.renderDate,
    },
    {
      field: "Finish",
      text: "计划完成时间",
      align: "center",
      width: 100,
      editor: {
        type: "datepicker",
      },
      renderer: this.renderDateFinish,
    },
    {
      field: "planDetailUnit",
      text: "单位",
      align: "center",
      width: 60,
      editor: {
        type: "textbox",
      },
      renderer: this.renderFillBlank,
    },
    {
      field: "planDetailUnitPrice",
      text: "综合单价",
      align: "center",
      width: 60,
      editor: {
        type: "textbox",
      },
      renderer: this.renderFillBlank,
    },
    {
      field: "planDetailAmount",
      text: "计划数量",
      align: "center",
      width: 60,
      editor: {
        type: "textbox",
      },
      renderer: this.renderFillBlank,
      // editor:{
      //   type:'spinner'
      // }
    },
    {
      field: "planDetailMoney",
      text: "计划产值",
      align: "center",
      width: 60,
      editor: {
        type: "textbox",
      },
      renderer: this.renderFillBlank,
    },
    {
      field: "Milestone",
      text: "标注",
      align: "center",
      width: 80,
      renderer: this.renderMarker,
    },
    {
      field: "codeType",
      text: "编码类别",
      width: 60,
      align: "center",
    },
    // {
    //   field: "subPlanType",
    //   text: "分类",
    //   align: "center",
    //   width: 60,
    //   editor: {
    //     type: "textbox",
    //   },
    //   renderer: this.renderFillBlank,
    // },
    {
      field: "warningProportion",
      text: "预警",
      align: "center",
      width: 60,
      editor: {
        type: "textbox",
      },
      renderer: this.renderWarningProportion,
    },
    {
      field: "preTask",
      text: "前置任务",
      align: "center",
      width: 60,
    },
  ];

  private ganttData: GanttClass.GanttDataType<Type.WBSNdMBS> = {
    CalendarUID: 1,
    Calendars: [
      {
        UID: 1,
        Name: "CalendarName",
        WeekDays: [
          //工作周: DayType(1~7)
          {
            DayType: 1,
            DayWorking: 1, //工作日1, 非工作日0
            WorkingTimes: [
              {
                fromTime: "08:00:00",
                toTime: "20:00:00",
              },
            ],
          },
          {
            DayType: 2,
            DayWorking: 1, //工作日1, 非工作日0
            WorkingTimes: [
              {
                fromTime: "08:00:00",
                toTime: "20:00:00",
              },
            ],
          },
          {
            DayType: 3,
            DayWorking: 1, //工作日1, 非工作日0
            WorkingTimes: [
              {
                fromTime: "08:00:00",
                toTime: "20:00:00",
              },
            ],
          },
          {
            DayType: 4,
            DayWorking: 1, //工作日1, 非工作日0
            WorkingTimes: [
              {
                fromTime: "08:00:00",
                toTime: "20:00:00",
              },
            ],
          },
          {
            DayType: 5,
            DayWorking: 1, //工作日1, 非工作日0
            WorkingTimes: [
              {
                fromTime: "08:00:00",
                toTime: "20:00:00",
              },
            ],
          },
          {
            DayType: 6,
            DayWorking: 1, //工作日1, 非工作日0
            WorkingTimes: [
              {
                fromTime: "08:00:00",
                toTime: "20:00:00",
              },
            ],
          },
          {
            DayType: 7,
            DayWorking: 1, //工作日1, 非工作日0
            WorkingTimes: [
              {
                fromTime: "08:00:00",
                toTime: "20:00:00",
              },
            ],
          },
        ],
      },
    ],
    Departments: [],
    Name: "",
    Principals: [],
    Resources: [],
    /*StartDate:this.basicInfo.schemePlanStart.toDate(),
    FinishDate:this.basicInfo.schemePlanEnd.toDate(),*/
    StartDate: moment(new Date()).toDate(),
    FinishDate: moment(new Date()).add(1, "days").toDate(),
    Tasks: [],
    UID: 0,
  };

  private ganttOptions: Array<unknown> = [];

  private renderGanttOptions(options: Array<unknown>): Array<JSX.Element> {
    if (!Array.isArray(options)) return [];
    return options.map((item) => {
      return (
        <div class={Class.ganttOption} onClick={(e) => item.event?.(e)}>
          <Icon src={item.icon}/>
          <span>{typeof item.name === 'function' ? item.name() : item.name}</span>
        </div>
      );
    });
  }

  private renderCurrentYear(yearArray: Array<string>): Array<JSX.Element> {
    if (!Array.isArray(yearArray)) return [];
    return yearArray.map((item) => <Select.Option key={Number(item)}>{item}</Select.Option>);
  }

  private renderCurrentQuarter(year: number, changeQuarter?: boolean): Array<JSX.Element> {
    if (isNaN(year)) return [];
    let vNode: Array<JSX.Element> = [];
    if (year === 99) {
      vNode.push(<Select.Option key={99}>全部</Select.Option>);
      this.quarter = 99;
    } else {
      vNode = [
        <Select.Option key={99}>全部</Select.Option>,
        <Select.Option key={1}>第一季度</Select.Option>,
        <Select.Option key={2}>第二季度</Select.Option>,
        <Select.Option key={3}>第三季度</Select.Option>,
        <Select.Option key={4}>第四季度</Select.Option>,
      ];
      if (!changeQuarter) {
        // this.quarter = 1;
        this.quarter = 99;
        this.changeQuarter = false;
      }
    }
    return vNode;
  }

  private renderCurrentMonth(quarter: number, changeMonth?: boolean): Array<JSX.Element> {
    if (isNaN(quarter)) return [];
    const vNode: Array<JSX.Element> = [];
    let startMonth: number | null = null;
    if (quarter === 99) {
      vNode.push(<Select.Option key={99}>全部</Select.Option>);
      this.month = 99;
    } else {
      vNode.push(<Select.Option key={99}>全部</Select.Option>);
      switch (quarter) {
        default:
        case 1:
          startMonth = 1;
          break;
        case 2:
          startMonth = 4;
          break;
        case 3:
          startMonth = 7;
          break;
        case 4:
          startMonth = 10;
          break;
      }
      for (let i = startMonth; i < startMonth + 3; i++) {
        vNode.push(<Select.Option key={i}>{`${i}月`}</Select.Option>);
      }
      if (!changeMonth) {
        // this.month = startMonth;
        this.month = 99;
        this.changeMonth = false;
      }
    }
    return vNode;
  }

  private ganttCellEditCB(e: GanttClass.GanttEvent<Type.WBSNdMBS>["cellEditType"]) {
    const {task} = e;
    switch (e.field) {
      case "planDetailUnitPrice":
        if ("planDetailAmount" in task && task.planDetailAmount) {
          task.planDetailMoney =
            (Number(task.planDetailAmount) * 1000 * Number(e.value) * 1000) / 1000000;
        }
        break;
      case "planDetailAmount":
        if ("planDetailUnitPrice" in task && task.planDetailUnitPrice) {
          task.planDetailMoney =
            (Number(e.value) * 1000 * Number(task.planDetailUnitPrice) * 1000) / 1000000;
        }
        break;
      case "warningProportion":
        const originNum = Number(e.value);
        let finalNum: number = 0;
        if (isNaN(originNum)) {
          finalNum = 0;
        } else {
          if (originNum >= 1) {
            finalNum = 1;
          } else if (originNum <= 0) {
            finalNum = 0;
          } else if (originNum >= 0 && originNum <= 1) {
            finalNum = originNum;
          }
        }
        e.value = finalNum;
        break;
      /*case 'Start':
        if(task)task.ConstraintType = 0;
        if(task)task.constraintType = 0;
        break;
      case 'Finish':
        if(task)task.ConstraintType = 0;
        if(task)task.constraintType = 0;
        break;*/
      default:
        break;
    }
  }

  private addMBSFn(task: GanttClass.GanttTask<Type.WBSNdMBS>) {
    this.wbsCodeMangeWithWBS = task;
    console.log(task);
    
    this.wbsCodeManageVisible = true;
  }

  private ganttTaskStateAdapter(action: string) {
    switch (action) {
      default:
      case "added":
        // return 'add';
        return "refresh";
      case "edited":
        return "refresh";
    }
  }

  private getPlanDetail(planId: string) {
    getSchedulePlanById({
      projectCode: this.projectCode as string,
      schedulePlanId: planId,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.basicInfo = {...res.data};
      }
    });
  }

  private saveGantt(planId: string, cb?: Function, obj?: object) {
    const {GanttRef, ganttTaskStateAdapter} = this;
    const realGanttData = GanttRef?.ganttInstance?.getData();
    // Utils.deepFind(
    //   realGanttData?.Tasks ?? [],
    //   (item) => {
    //     item.milestone = item.milestone ?? 0;
    //     //item.critical = item.critical ?? 0;
    //     item.planDetailAmount = item.planDetailAmount ?? 0;
    //     item.planDetailMoney = item.planDetailMoney ?? 0;
    //     item.planDetailUnit = item.planDetailUnit ?? undefined;
    //     item.planDetailUnitPrice = item.planDetailUnitPrice ?? 0;
    //     item.th04aPlandetailFk = item.ParentTaskUID === -1 ? "" : item.ParentTaskUID;
    //     item.id = item.UID;
    //     item.planDetailPeriod = item.Duration;
    //     item.planDetailName = item.Name;
    //     item.planDetailStart = moment(item.Start).format("YYYY-MM-DD");
    //     item.planDetailEnd = moment(item.Finish).format("YYYY-MM-DD");
    //     item.state = ganttTaskStateAdapter(item._state);
    //     item.th04aPlanschemeFk = planId;
    //     return false;
    //   },
    //   "children"
    // );
    // const flatRealGanttDataArray: Array<GanttClass.GanttTask<Type.WBSNdMBS>> = [];
    // Utils.deepFind(
    //   realGanttData?.Tasks ?? [],
    //   (item) => {
    //     item.state = "refresh";
    //     item.bsSort = item.ID;
    //     // item.warningProportion = 0.9;
    //     flatRealGanttDataArray.push(item);
    //     return false;
    //   },
    //   "children"
    // );
    console.log(realGanttData);
    
    refreshWBSListV3({
      list: realGanttData?.Tasks ?? [],
      listRemove: [],
      projectCode: this.projectCode as string,
      reqDto: obj as object
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (this.$route.query.id !== planId) {
        this.$router.replace({
          name: "constructionPlanV3",
          query: {
            id: planId,
          },
        });
      }
      this.$nextTick().then(() => {
        cb?.();
        this.planId = planId;
        this.refreshGantt();
        this.getPlanDetail(this.planId);
      });
    });
  }

  private refreshGantt() {
    const {id} = Utils.GetRequest();
    const {getWBSData, year, quarter, month} = this;
    if (!id) return;
    this.ganttData.Tasks = [];
    getWBSData(id, year, quarter, month);
  }

  private savePlan() {
    if (this.saveLoading) return;
    this.saveLoading = true;
    const {basicInfo, planId, saveGantt} = this;
    const reqBasicInfo: Type.SchedulePlan = {
      planSchemeName: basicInfo.planSchemeName,
      projectCode: this.projectCode as string,
      //projectCode: 'CH',
      projectName: basicInfo.projectName,
      remarks: basicInfo.remarks,
      schemeMoney: basicInfo.schemeMoney,
      schemePeriod: basicInfo.schemePeriod,
      schemePlanAmount: basicInfo.schemePlanAmount,
      schemePlanEnd: basicInfo.schemePlanEnd,
      schemePlanStart: basicInfo.schemePlanStart,
    };
    if (planId) {
      reqBasicInfo.schedulePlanId = planId;
      // updateSchedulePlan(reqBasicInfo).then((res) => {
        // if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        saveGantt(planId, () => {
          this.saveLoading = false;
        },reqBasicInfo);
      // });
    } else {
      addSchedulePlan(reqBasicInfo).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        if (res.data) {
          reqBasicInfo.schedulePlanId = res.data as unknown as string
          saveGantt((res.data as unknown) as string, () => {
            this.saveLoading = false;
          }, reqBasicInfo);
        }
      });
    }
  }

  private saveCritical() {
    this.saveGantt(this.planId as string)
  }

  private getPlanDetailTimeZone(planId: string) {
    getYearsById({
      schedulePlanId: planId,
      projectCode: this.projectCode as string,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.receiveYear = res.data;
      }
    });
  }

  private wbsTreeDataAdapter(item) {
    const {ganttInstance} = this;
    if (!ganttInstance) return;

    item.Start = moment(item.planDetailStart).toDate();
    item.Finish = moment(item.planDetailEnd).toDate();
    item.Duration = item.planDetailPeriod;
    item.Name = item.planDetailName;
    item.UID = item.id;
    item.wbs = item.bs;
    item.milestone = item.milestone ?? 0;
    //item.critical = item.critical ?? 0;
    item.planDetailAmount = item.planDetailAmount ?? 0;
    item.planDetailMoney = item.planDetailMoney ?? 0;
    item.planDetailUnit = item.planDetailUnit ?? undefined;
    item.planDetailUnitPrice = item.planDetailUnitPrice ?? 0;
    item.bsSort = item.ID;
    item.warningProportion = item.warningProportion ?? 0;
    item.ConstraintDate = moment(item.planDetailStart).toDate();
    item.ConstraintType = 4;
    item.PredecessorLink = item.predecessorLink;
  }

  private renderTimeline(timeline: GanttClass.GanttTimeLine, pos: GanttClass.GanttTimeLinePos): string {
    const left = `${pos.left}px`;
    const top = `${pos.top ?? 0}px`;
    const height = `${pos.height ?? 'auto'}px`;
    return `<div class="${Class.testTimeLine}" style="position:${'absolute'};left:${left};height:${height};top: ${top}"  ></div>`;
  }

  private renderTimelineTitle(timeline: GanttClass.GanttTimeLine, pos: GanttClass.GanttTimeLinePos): string {
    const left = `${pos.left}px`;
    const top = `${pos.top ?? 0}px`;
    const height = `${pos.height ?? 'auto'}px`;
    return `<div class="${Class.testTimeLineTitle}" style="position:${'absolute'};left:${left};height:${height};top: ${top}"  >${timeline.text}</div>`;
  }

  private timeLines: Array<GanttClass.GanttTimeLines> = []

  private wbsDataAdapter(resResult: Array<Type.WBSNdMBS>) {
    const {ganttInstance, ganttTaskStateAdapter, wbsTreeDataAdapter} = this;
    if (!Array.isArray(resResult)) return this.$message.error("Gantt数据格式无效！");
    if (!ganttInstance) return;

    Utils.deepFind(
      resResult,
      (item) => {
        // delete item.critical;
        delete item.Critical;
        wbsTreeDataAdapter(item);
        item.predecessorLink.forEach(link => {
          link.PredecessorUID = link.predecessorId;
          link.Type = 1;
          link.LinkLag = link.lagDays;
        })
        return false;
      },
      "children"
    );

    this.ganttData.Tasks = (resResult as unknown) as Array<GanttClass.GanttTask<Type.WBSNdMBS>>;
    console.log(this.ganttData.Tasks );
    
    // this.ganttData.Tasks = testData.Tasks;
    this.$nextTick().then(() => {
      this.GanttRef?.ganttInstance?.collapseAll();
      this.GanttRef?.ganttInstance?.expandLevel(0);
      // this.GanttRef?.ganttInstance?.expandLevel(1);
    });
  }

  private getWBSData(planId: string, year: number, season: number, month: number) {
    const {wbsDataAdapter, ganttConditionCheckType} = this;
    const requestData = {
      projectCode: this.projectCode,
      model: 1,
      milestone: ganttConditionCheckType.includes("1") ? 1 : 0,
      critical: ganttConditionCheckType.includes("2") && ganttConditionCheckType.includes("1") ? 1 : 0,
      month: month === 99 ? undefined : month,
      predecessor: "",
      schedulePlanId: planId,
      season: season === 99 ? undefined : season,
      year: year === 99 ? undefined : year,
    };
    const omitPropertyArray = [];
    for (const requestDataKey in requestData) {
      if (requestData.hasOwnProperty(requestDataKey)) {
        if (!requestData[requestDataKey]) omitPropertyArray.push(requestDataKey as never);
      }
    }
    getTreeListV3(omit(requestData, omitPropertyArray)).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      res.data && wbsDataAdapter(res.data);
    });
  }

  private debounceGetWBSData = Utils.debounce((value, vm, id) => {
    const {year, quarter, month} = value,
      {planId, getWBSData} = vm;
    if (!planId) return;
    getWBSData(id ?? planId, year, quarter, month);
  }, 500);

  private launchProcess(): void {
    if (this.launchLoading) return;
    this.launchLoading = true;
    const {planId} = this;
    if (!planId) {
      this.$message.error("没有需要提交审核的计划");
      this.launchLoading = false;
      return;
    }
    launchSchedulePlanProcess({
      projectCode: this.projectCode as string,
      schedulePlanId: this.planId as string,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$router.go(-1);
      this.launchLoading = false;
    });
  }

  private readyFn(instance: GanttClass.GanttType<Type.WBSNdMBS>) {
    if (instance) this.ganttInstance = instance;
  }

  @Watch("TimeZoneQueryCondition", {immediate: true})
  TimeZoneQueryConditionListener(value) {
    const {year, quarter, month} = value,
      {planId, getWBSData} = this;
    if (!planId) return;
    this.ganttData.Tasks = [];
    this.debounceGetWBSData(value, this);
    // getWBSData(planId, year, quarter, month);
  }

  @Watch("ganttInstance", {immediate: true})
  GanttRefListener(instance) {
    const {id} = Utils.GetRequest();
    const {getWBSData, year, quarter, month} = this;
    if (!id) return;
    this.ganttData.Tasks = [];
    //TODO: Interim solution
    //this.debounceGetWBSData({ year, quarter, month }, this, id);
    //getWBSData(id, year, quarter, month);
  }

  @Watch("ganttConditionCheckType", {immediate: true})
  ganttConditionCheckTypeListener(val: Array<string>) {
    const {year, quarter, month, debounceGetWBSData} = this;
    this.ganttData.Tasks = [];
    if (val.includes('2') && !val.includes('1')) {
      //关键线路
      this.showCriticalPath = true;
    } else {
      this.showCriticalPath = false;
    }
    debounceGetWBSData({year, quarter, month}, this);
  }

  private removeFn(task) {
    const {basicInfo} = this;
    const reqBasicInfo = {
      planSchemeName: basicInfo.planSchemeName,
      projectCode: this.projectCode as string,
      schedulePlanId: this.$route.query.id,
      projectName: basicInfo.projectName,
      remarks: basicInfo.remarks,
      schemeMoney: basicInfo.schemeMoney,
      schemePeriod: basicInfo.schemePeriod,
      schemePlanAmount: basicInfo.schemePlanAmount,
      schemePlanEnd: basicInfo.schemePlanEnd,
      schemePlanStart: basicInfo.schemePlanStart,
    };
    refreshWBSListV3({
      list: [],
      listRemove: [task.UID],
      projectCode: this.projectCode as string,
      reqDto: reqBasicInfo
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
    });
  }

  private bsRemoveFn(tasks: Array<GanttClass.GanttTask<Type.WBSNdMBS>>) {
    const {basicInfo} = this;
    const reqBasicInfo = {
      planSchemeName: basicInfo.planSchemeName,
      projectCode: this.projectCode as string,
      schedulePlanId: this.$route.query.id,
      projectName: basicInfo.projectName,
      remarks: basicInfo.remarks,
      schemeMoney: basicInfo.schemeMoney,
      schemePeriod: basicInfo.schemePeriod,
      schemePlanAmount: basicInfo.schemePlanAmount,
      schemePlanEnd: basicInfo.schemePlanEnd,
      schemePlanStart: basicInfo.schemePlanStart,
    };
    if (!Array.isArray(tasks) || !tasks.length) return;
    refreshWBSListV3({
      list: [],
      listRemove: tasks.map((item) => item.UID),
      projectCode: this.projectCode as string,
      reqDto: reqBasicInfo
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.refreshGantt();
    });
  }

  private gradeCb(task: GanttClass.GanttTask<Type.WBSNdMBS>) {
    if (task.ParentTaskUID === -1) {
      task.th04aPlandetailFk = "";
    } else {
      task.th04aPlandetailFk = task.ParentTaskUID;
    }
  }

  private renderImportFailed(msg: string) {
    return <div class={Class.importFailedMsg}>{msg?.split('&').map(error =>
      <span>{error}</span>)}</div>;
  }

  private fileInput(e) {
    const files = e.target.files,
      {projectCode, planId, year, quarter, month, debounceGetWBSData, basicInfo} = this;
    if (files && files[0]) {
      const file = files[0];
      const fileFormat = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      if (["xlsx", "xls"].indexOf(fileFormat) === -1)
        return this.$message.error("请上传Excel文件!");
      // if (file.size > 1024 * 1024 * 3) return this.$message.error('文档大小不能超过3M!');
      // this.$message.loading('上传模板中');
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectCode", projectCode as string);
      formData.append("projectName", basicInfo.projectName);
      formData.append("schedulePlanId", planId as string);
      this.isDownload = "正在导入中..."
      this.isModalVisible = true
      this.percent = 0
      const timer = setInterval(() => {
        this.percent++
        if (this.percent == 99) {
          clearInterval(timer)
        }
      }, 500);
      importWBSDataV3(formData).then((res) => {
        // if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
        if (res.errcode !== 0) return this.$message.warn(this.renderImportFailed(res.errmsg as string)), this.percent = 0, clearInterval(timer), this.isDownload = "导入失败！";
        if (res.errcode === 0) debounceGetWBSData({
          year,
          quarter,
          month
        }, this), clearInterval(timer), this.percent = 100, this.isDownload = "导入成功！";
      });
    }
  }

  private importWBSDataV3() {
    if(this.businessState == "审核中" || this.businessState == "已审核") {
      this.$message.warn("已审核或者审核中的项目无法导入！")
    }else {
      const {planId} = this;
      if (!planId) return this.$message.warn("请先保存计划！");
      this.FileInput?.click();
    }
  }

  private exportWBSDataV3() {
    const {planId, projectCode, basicInfo} = this;
    exportWBSDataV3({
      projectCode: projectCode as string,
      projectName: basicInfo.projectName,
      schedulePlanId: planId as string,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        const fileUrl = `${window.config.apiHost}/api/aliyun/download?refId=${res.data}`;
        window.open(fileUrl);
      }
    });
  }

  private downloadTemplate() {
    const {templateLoading} = this;
    if (templateLoading) return;
    this.templateLoading = true;
    getProgressBSTemplateV3().then((res) => {
      if (res.errcode !== 0) {
        this.$message.error(res.errmsg as string);
        this.templateLoading = false;
        return;
      }
      if (res.data) {
        const fileUrl = `${window.config.apiHost}/api/aliyun/download?refId=${res.data}`;
        window.open(fileUrl);
      }
    });
  }

  private getPreTaskArr(id: string) {
    return new Promise((resolve, reject) => {
      getPreTasks({
        planDetailId: id,
        projectCode: this.projectCode as string,
      }).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        resolve(res);
      });
    });
  }

  private addPreTaskArr(preTasks: Array<Type.PreTask>) {
    return new Promise((resolve, reject) => {
      addPreTasks(preTasks).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        resolve(res);
      });
    });
  }

  private deletePreTaskArr(preTasks: Array<Type.PreTask>) {
    return new Promise((resolve, reject) => {
      console.log('deletePreTasks', preTasks)
      deletePreTasks(preTasks).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        resolve(res);
      });
    });
  }

  private updatePreTaskArr(preTasks: Array<Type.PreTask>) {
    return new Promise((resolve, reject) => {
      updatePreTasks(preTasks).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        resolve(res);
      });
    });
  }

  private getOptionName() {
    return this.ganttFullView ? '收起' : '展开';
  }

  private handleOk() {
    if (this.percent == 0 || this.percent == 100) {
      this.isModalVisible = false
    } else {
      this.$message.error('导入数据过程中请不要关闭页面，避免导入错误');
    }
  }

  private handleCancel() {
    if (this.percent == 0 || this.percent == 100) {
      this.isModalVisible = false
    } else {
      this.$message.error('导入数据过程中请不要关闭页面，避免导入错误');
    }
  }

  private renderExpended() {
    this.ganttFullView = !this.ganttFullView;
    this.$nextTick().then(() => {
      setTimeout(() => {
        this.GanttRef?.setFullGanttView();
      }, 400);
    });
  }

  private AssociationClick(){
    this.isRelation = true
  }

  private handleRelationCancel(){
    //@ts-ignore
    this.getWBSData(this.planId,this.year,this.quarter,this.month)
    this.isRelation = false
  }


  mounted() {
    this.ganttOptions = [
      {
        icon: "save",
        name: "保存",
        event: () => this.savePlan(),
      },
      {
        icon: "add",
        name: "新增",
        event: () => this.GanttRef?.ganttAdd(),
      },
      {
        icon: "edit",
        name: "修改",
        event: () => this.GanttRef?.ganttEdit(),
      },
      {
        icon: "remove",
        name: "删除",
        event: () => this.GanttRef?.ganttRemove(),
      },
      {
        icon: "upgrade",
        name: "升级",
        event: () => this.GanttRef?.ganttUpgrade(),
      },
      {
        icon: "downgrade",
        name: "降级",
        event: () => this.GanttRef?.ganttDowngrade(),
      },
      {
        icon: "zoomIn",
        name: "放大",
        event: () => this.GanttRef?.ganttZoomIn(),
      },
      {
        icon: "zoomOut",
        name: "缩小",
        event: () => this.GanttRef?.ganttZoomOut(),
      },
      {
        icon: "IImport",
        name: "导入",
        event: () => this.importWBSDataV3(),
      },
      {
        icon: "IExport",
        name: "导出",
        event: () => this.exportWBSDataV3(),
      },
      {
        icon: "save",
        name: "保存关键线路",
        event: () => this.saveCritical(),
      },
    ];
    const {id} = Utils.GetRequest();
    const {getPlanDetailTimeZone, getWBSData, year, quarter, month} = this;
    if (id) {
      this.planId = id;
      getSchedulePlanById({
        projectCode: this.projectCode as string,
        schedulePlanId: id,
      }).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        if (res.data) {
          this.basicInfo = {...res.data};
        }
      });
      getPlanDetailTimeZone(id);
    }
    setTimeout(() => {
      // this.ganttConditionCheckType = ["2"]
      if (this.basicInfo.projectName !== this.projectConfig?.projectName)  this.$router.push({path: "constructionList"});
    }, 500);
    getSchedulePlanById({
      projectCode: this.projectCode as string,
      schedulePlanId: this.$route.query.id as string
    }).then((res) => {
      this.businessState = res.data?.businessState?? ""
    });
  }

  render() {
    const {
      planId,
      GanttRef,
      launchProcess,
      basicInfo,
      ganttData,
      ganttColumns,
      renderGanttOptions,
      ganttOptions,
      receiveYear,
      year,
      changeQuarter,
      quarter,
      changeMonth,
      month,
      renderCurrentYear,
      renderCurrentMonth,
      renderCurrentQuarter,
      ganttCellEditCB,
      wbsCodeManageVisible,
      addMBSFn,
      wbsCodeMangeWithWBS,
      savePlan,
      removeFn,
      bsRemoveFn,
      gradeCb,
      getWBSData,
      ganttConditionCheckType,
      ganttConditionChange,
      readyFn,
      fileInput,
      addPreTaskArr,
      getPreTaskArr,
      deletePreTaskArr,
      updatePreTaskArr,
      downloadTemplate,
      ganttFullView,
      isModalVisible,
      handleOk,
      percent,
      handleCancel,
      isDownload,
      isRelation,
      handleRelationCancel
    } = this;
    return (
      <article class={Class.main}>
        <nav class={Class.navTitle}>
          <Icon src={"goBack"} className={Class.navBack} clickEvent={(e) => this.$router.go(-1)}/>
          <span>{(planId && "查看") || "新增"}施工总进度计划</span>
          {basicInfo.businessState === Type.SchedulePlanBizState.Unaudited && (
            <Button loading={this.launchLoading} onClick={launchProcess} type={"primary"}>
              提交审核
            </Button>
          )}
          <Button onClick={(e) => this.$router.go(-1)}>取消</Button>
          <Button loading={this.saveLoading} onClick={savePlan}>
            保存
          </Button>
        </nav>
        <input ref={"FileInput"} class={Class.hide} type={"file"} onChange={(e) => fileInput(e)}/>
        <ConstructionBase className={`${ganttFullView && Class.closed}`} baseInfo={basicInfo}/>
        <article class={Class.ganttPanel}>
          <nav>
            <span>计划信息</span>
            <span class={Class.expendedBtn}
                  onClick={this.renderExpended}>{this.ganttFullView ? '收起' : '展开'}</span>
          </nav>
          <aside class={Class.optionPanel}>
            <Button type={"primary"} onClick={(e) => this.$router.go(-1)}>
              总进度计划
            </Button>
            <Button loading={this.templateLoading} onClick={downloadTemplate}>
              模板下载
            </Button>
            <span>日期设置：</span>
            <Select
              placeholder={"年度"}
              defaultValue={99}
              onChange={(e) => {
                this.year = e;
                this.quarter = 1;
                this.changeMonth = false;
                //planId&&getWBSData(planId,e,1,1);
              }}
            >
              <Select.Option key={99}>全部</Select.Option>
              {renderCurrentYear(receiveYear)}
            </Select>
            <Select
              placeholder={"季度"}
              value={quarter}
              onChange={(e) => {
                this.quarter = e;
                this.changeQuarter = true;
                this.changeMonth = false;
                //planId&&getWBSData(planId,year,e,month);
              }}
            >
              {renderCurrentQuarter(year, changeQuarter)}
            </Select>
            <Select
              placeholder={"月度"}
              value={month}
              onChange={(e) => {
                this.month = e;
                this.changeMonth = true;
                //planId&&getWBSData(planId,year,quarter,e);
              }}
            >
              {renderCurrentMonth(quarter, changeMonth)}
            </Select>
            {this.projectCode == "ZSPT" && <Button type={"primary"} onClick={this.AssociationClick}>
              编码配置
            </Button>}
          </aside>
          <main class={Class.ganttContainer}>
            <aside class={Class.ganttOptions}>
              {renderGanttOptions(ganttOptions)}
              <CheckBoxGroup
                class={Class.ganttType}
                value={ganttConditionCheckType}
                onChange={ganttConditionChange}
              >
                <CheckBox value={"1"}>里程碑</CheckBox>
                <CheckBox value={"2"}>关键线路</CheckBox>
              </CheckBoxGroup>
            </aside>
            <Gantt
              action={"add"}
              ref={"GanttRef"}
              readyFn={readyFn}
              readOnly={basicInfo.businessState !== Type.SchedulePlanBizState.Unaudited}
              ganttColumns={ganttColumns}
              enableOrderProject={false}
              ganttCellEditCB={ganttCellEditCB}
              ganttData={ganttData}
              treeField={"wbs"}
              addMBSFn={addMBSFn}
              removeFn={removeFn}
              downgradeCb={gradeCb}
              upgradeCb={gradeCb}
              showCriticalPath={this.showCriticalPath}
              preTaskFnCollection={{
                get: getPreTaskArr,
                add: addPreTaskArr,
                update: updatePreTaskArr,
                delete: deletePreTaskArr,
              }}
              timeLines={this.timeLines}
            />
            <Modal
              visible={wbsCodeManageVisible}
              destroyOnClose={true}
              maskClosable={false}
              footer={false}
              wrapClassName={Class.wbsTree}
              onCancel={(e) => {
                this.wbsCodeManageVisible = false;
              }}
            >
              <WBSCodeManage
                ganttRef={GanttRef}
                withWBS={wbsCodeMangeWithWBS}
                bsRemoveFn={bsRemoveFn}
                closeModal={() => {
                  this.wbsCodeManageVisible = false;
                }}
              />
            </Modal>
            <Modal footer={[]} bodyStyle={{textAlign: 'center'}} title="表格导入"
                   visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
              <Progress type="circle" percent={percent}/>
              <p>{isDownload}</p>
            </Modal>
            <Modal footer={[]} title="关联设置" visible={isRelation} onCancel={handleRelationCancel} dialogClass={Class.ModelClass}>
              {/* @ts-ignore */}
              <Association />
            </Modal>
          </main>
        </article>
      </article>
    );
  }
}
