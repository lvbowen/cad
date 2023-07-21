<template>
  <div class="ScheduleOperation">
    <div class="progress_title">
      <span>进度运行状况</span>
    </div>
    <div class="outputValue">
      <div class="outputValue_echarts">
        <h4>进度产值情况</h4>
        <div class="outputValue_line">
          <pie-charts
            @contractName="messagEchart($event)"
            :chartData="ProgressData"
            :id="'investment_echart1'"
          ></pie-charts>
        </div>
      </div>
      <div class="outputValue_progress">
        <h4>产值分析</h4>
        <div class="outputValueProportion">
          <line-echarts
            :id="'outputValueLinechat'"
            :chartData="outputValueData"
          ></line-echarts>
        </div>
      </div>
    </div>
    <div class="progressGannt">
      <div class="checkGannt">
        <div class="search">
          <el-input
            v-model="input"
            placeholder="请输入内容"
            clearable
            size="small"
            @keyup.enter.native="searchClick"
            @clear="clearClick"
          ></el-input>
          <el-button
            slot="append"
            size="small"
            @click="searchClick"
            icon="el-icon-search"
          ></el-button>

        </div>
        <div class="gattType">
          <check-box-group
            v-model="ganttConditionCheckType"
            @change="ganttConditionChange"
          >
            <check-box :value="'1'">里程碑</check-box>
            <check-box :value="'2'">关键线路</check-box>
          </check-box-group>
          <el-button
            slot="append"
            size="small"
            style="margin-left:15px"
            @click="reset"
          >重置
          </el-button>
        </div>
        <div class="button">
          <span @click="enlarge">
            <img alt="" src="../BIMPlatform/img/icon_7.png"/>
            放大
          </span>
          <span @click="narrow">
            <img alt="" src="../BIMPlatform/img/icon_8.png"/>
            缩小
          </span>
        </div>
      </div>
      <Gantt
        :showCriticalPath="showCriticalPath"
        :ganttData="ganttData"
        :readyFn="readyFn"
        :ganttColumns="ganttColumns"
        :ganttCellClick="ganttCellClick"
        :treeField="'Name'"
        :rowHeight="32"
        ref="GanttRef"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  InjectReactive,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import PieCharts from "../ManageViews/components/PieCharts.vue";
import env from "@/config/env";
import {Gantt, GanttClass } from "@ctesi/component";
import * as Type from "../../type";
import {getTreeListV3} from "../../service/api";
import Utils from "../../utils";
import omit from "omit.js";
import Input from "element-ui/lib/input";
import moment from "moment";
import {getdeviation, getscheduleAnalyseState} from "./serve/index.js";
import Progress from "element-ui/lib/progress";
import LineEcharts from "../ManageViews/components/LineEcharts.vue";
import CheckBox from "ant-design-vue/lib/checkbox";
import CheckBoxGroup from "ant-design-vue/lib/checkbox/Group";
import "ant-design-vue/lib/checkbox/style/index.css";

interface bizGanttData extends Type.WBSNdMBS {
  model: object;
  reportDetailAmount: String;
  reportDetailMoney: String;
}

@Component({
  name: "scheduleAnalysis",
  components: {
    ElProgress: Progress,
    PieCharts,
    LineEcharts,
    Gantt,
    ElInput: Input,
    CheckBox: CheckBox,
    CheckBoxGroup: CheckBoxGroup
  },
})
export default class scheduleAnalysis extends Vue {
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;

  id: string = "";
  planId: string = "";
  input: string = "";
  projectName: string = "";
  private year: number = 99;
  private quarter: 1 | 2 | 3 | 4 | 99 = 99;
  private month: number | 99 = 99;

  private ganttConditionCheckType: Array<string> = [];
  private showCriticalPath: boolean = false;

  swiperOption1: object = {
    slidesPerView: 3,
    // spaceBetween: 100,
    mousewheel: true,
    autoHeight: true,
    observer: true,
    observeParents: true,
    speed: 2000,
    freeMode: true,
    loop: true,
    autoplay: {
      //自动滚动
      delay: 1000,
      stopOnLastSlide: false,
      disableOnInteraction: false,
    },
    direction: "vertical",
  };
  @Ref() GanttRef?: Gantt<bizGanttData>;
  ganttInstance: GanttClass.GanttType<bizGanttData> | null = null;
  ganttData: GanttClass.GanttDataType<bizGanttData> = {
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
  ProgressData: object = {
    tileText: "进度状态情况",
    textsY: 120,
    right: 500,
    color: [],
    textStyle: "#0A0A0A",
    fontWeight: "700",
    textY: "10",
    radius: ["40%", "60%"],
    center: ["50%", "57%"],
    series: [],
    formatter: "元",
  };
  outputValueData: any = {
    legend: ["计划总产值", "实际总产值"],
    yName: "总金额（万元）",
    xAxis: [],
    yAxis1: [],
    yAxis2: [],
    textStyle: "#0A0A0A",
    legendColor: "#000",
    formatter: "万元",
    ySplitLineShow: false,
  };
  private debounceGetWBSData = Utils.debounce((value, vm, id) => {
    const {year, quarter, month} = value,
      {planId, getWBSData} = vm;
    getWBSData(id ?? planId, year, quarter, month);
  }, 500);

  private ganttConditionChange(value: Array<string>): void {
    this.ganttConditionCheckType = value;
  }


  @Watch("ganttConditionCheckType", {immediate: true})
  ganttConditionCheckTypeListener(val: Array<string>) {
    const {year, quarter, month, debounceGetWBSData} = this;
    this.ganttData.Tasks = [];
    // if (val.includes('2')&&!val.includes('1')){
    //   //关键线路
    //   this.showCriticalPath = true;
    // } else{
    //   this.showCriticalPath = false;
    // }
    debounceGetWBSData({year, quarter, month}, this);
  }

  private refreshGantt() {
    const {id} = Utils.GetRequest();
    const {getWBSData, year, quarter, month} = this;
    if (!id) return;
    this.ganttData.Tasks = [];
    getWBSData(id, year, quarter, month);
  }

  get TimeZoneQueryCondition() {
    return {
      year: this.year === 99 ? undefined : this.year,
      quarter: this.quarter === 99 ? undefined : this.quarter,
      month: this.month === 99 ? undefined : this.month,
    };
  }

  ganttColumns: Array<GanttClass.GanttColumn<bizGanttData>> = [
    {
      field: "Name",
      text: "名称",
      align: "center",
      width: 240,
    },
    {
      field: "progressState",
      text: "进度状态",
      align: "center",
      width: 100,
      // editor: {
      //   type: "textbox",
      // },
      renderer: this.ProgressStatus,
    },
    {
      // field: 'planDetailPeriod',
      field: "Duration",
      text: "计划工期",
      align: "center",
      width: 80,
      /* editor: {
         type: 'textbox'
       }*/
    },
    {
      field: "Start",
      text: "计划开始时间",
      align: "center",
      width: 120,
      // editor: {
      //   type: "datepicker",
      // },
      renderer: this.renderDate,
    },

    {
      field: "Finish",
      text: "计划完成时间",
      align: "center",
      width: 120,
      // editor: {
      //   type: "datepicker",
      // },
      renderer: this.renderDateFinish,
    },
    {
      field: "planDetailAmount",
      text: "计划数量",
      align: "center",
      width: 100,
      // editor: {
      //   type: "textbox",
      // },
      renderer: this.renderFillBlank,
      // editor:{
      //   type:'spinner'
      // }
    },
    {
      field: "planDetailMoney",
      text: "计划产值",
      align: "center",
      width: 80,
      // editor: {
      //   type: "textbox",
      // },
      renderer: this.renderFillBlank,
    },
    {
      field: "reportDetailAmount",
      text: "完成数量 ",
      align: "center",
      width: 80,
      // editor: {
      //   type: "textbox",
      // },
      renderer: this.renderFillBlank,
    },
    {
      field: "reportDetailMoney",
      text: "完成产值",
      align: "center",
      width: 80,
      // editor: {
      //   type: "textbox",
      // },
      renderer: this.renderFillBlank,
    },

    {
      field: "planDetailUnit",
      text: "单位",
      align: "center",
      width: 80,
      // editor: {
      //   type: "textbox",
      // },
      renderer: this.renderFillBlank,
    },
    {
      field: "planDetailUnitPrice",
      text: "综合单价",
      align: "center",
      width: 100,
      // editor: {
      //   type: "textbox",
      // },
      renderer: this.renderFillBlank,
    },
    {
      field: "startWorkState",
      text: "开工状态",
      align: "center",
      width: 100,
      // editor: {
      //   type: "textbox",
      // },
      renderer: this.StartStatus,
    },
    {
      field: "endWorkState",
      text: "完工状态",
      align: "center",
      width: 100,
      // editor: {
      //   type: "textbox",
      // },
      renderer: this.EndStatus,
    },
    {
      field: "reportStart",
      text: "实际开始时间",
      align: "center",
      width: 120,
      // editor: {
      //   type: "textbox",
      // },
      renderer: this.renderFillBlank,
    },
    {
      field: "reportEnd",
      text: "实际结束时间",
      align: "center",
      width: 120,
      // editor: {
      //   type: "textbox",
      // },
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
      width: 80,
      align: "center",
    },
    {
      field: "preTask",
      text: "前置任务",
      align: "center",
      width: 60,
    },
  ];

  //甘特图表格点击事件
  ganttCellClick(val) {
    this.nodeId = val.task.UID;
    this.getinit();
    this.getdeviation()
  }

  messagEchart(e) {
    const state = e.data.name;
    let progressStr: string = '';
    if (state === "未开工") {
      progressStr = '-1'
    } else if (state === "已完工") {
      progressStr = '0'
    } else if (state === "进行中") {
      progressStr = '1'
    } else if (state === "预警") {
      progressStr = '2'
    } else if (state === "滞后") {
      progressStr = '3'
    }
    const {getWBSData, year, quarter, month, id} = this;
    this.ganttData.Tasks = [];
    this.getWBSData(id, year, quarter, month, '', progressStr);
  }

  toprev() {
    this.$router.go(-1);
  }

  projectCode: string = "";
  totalValue: string = "";
  ProgressBackGround: string = "";
  nodeId: string = "";
  OutputValueBackGround: string = "";
  radio: string = "1";

  //搜索功能
  searchClick() {
    //@ts-ignore
    this.getWBSData("", "", "", "", this.input);
  }

  readyFn(instance: GanttClass.GanttType<bizGanttData>) {
    if (instance) this.ganttInstance = instance;
  }


  getinit() {
    getscheduleAnalyseState(
      this.projectCode,
      this.nodeId,
      this.projectName
    ).then((res) => {
      console.log(res);
      
      //@ts-ignore
      this.ProgressData.series = res.data?.map(
        (item) => {
          return {value: item.money, name: item.progressStateDesc};
        }
      );
      //@ts-ignore
      this.ProgressData.series.forEach((e) => {
        if (e.name == "未开工") {
          //@ts-ignore
          this.ProgressData.color.push("#C2C2C2");
        }
        if (e.name == "进行中") {
          //@ts-ignore
          this.ProgressData.color.push("#377EFF");
        }
        if (e.name == "滞后") {
          //@ts-ignore
          this.ProgressData.color.push("#FF0042");
        }
        if (e.name == "预警") {
          //@ts-ignore
          this.ProgressData.color.push("#F1B500");
        }
        if (e.name == "已完工") {
          //@ts-ignore
          this.ProgressData.color.push("#26C974");
        }
      });
    });
  }

  getdeviation() {
    this.outputValueData = {
      legend: ["计划总产值", "实际总产值"],
      yName: "总金额（万元）",
      xAxis: [],
      yAxis1: [],
      yAxis2: [],
      yAxis3: [],
      yAxis4: [],
      textStyle: "#0A0A0A",
      legendColor: "#000",
      formatter: "万元",
      ySplitLineShow: false,
      specialName: true,
    };
    getdeviation(this.projectCode, this.nodeId, this.projectName).then((res) => {
      this.outputValueData.xAxis = res.data.dateAxis;
      res.data.realValueAxis?.forEach(e => {
        e = (e / 10000).toFixed(2)
      });
      res.data.planValueAxis?.forEach(e => {
        e = (e / 10000).toFixed(2)
      });
      this.outputValueData.yAxis2 = res.data.realValueAxis;
      this.outputValueData.yAxis1 = res.data.planValueAxis;
      this.outputValueData.yAxis3 = res.data?.dayPlanValueAxis;
      this.outputValueData.yAxis4 = res.data?.dayRealValueAxis;
    });
  }

  @Watch("TimeZoneQueryCondition", {immediate: true})
  TimeZoneQueryConditionListener(value) {
    const {year, quarter, month} = value,
      {planId, getWBSData} = this;
    // if (!planId) return;
    this.ganttData.Tasks = [];
    this.debounceGetWBSData(value, this);
    // getWBSData(planId, year, quarter, month);
  }

  private wbsTreeDataAdapter(item) {
    const {ganttInstance} = this;
    if (!ganttInstance) return;

    item.Start = moment(item.planDetailStart).toDate();
    item.Finish = moment(item.planDetailEnd).toDate();
    item.Duration = item.planDetailPeriod;
    item.Name = item.planDetailName;
    item.UID = item.id;
    item.milestone = item.milestone ?? 0;
    //item.critical = item.critical ?? 0;
    item.planDetailAmount = item.planDetailAmount ?? 0;
    let percent = item.reportDetailAmount / item.planDetailAmount;
    if (isNaN(percent)) {
      percent = 0;
    }
    item.PercentComplete = Number(percent * 100).toFixed(2);
    item.planDetailMoney = item.planDetailMoney ?? 0;
    item.planDetailUnit = item.planDetailUnit ?? undefined;
    item.planDetailUnitPrice = item.planDetailUnitPrice ?? 0;
    item.bsSort = item.ID;
    item.warningProportion = item.warningProportion ?? 0;
    item.ConstraintDate = moment(item.planDetailStart).toDate();
    item.ConstraintType = 4;
    item.PredecessorLink = item.predecessorLink;
  }

  @Watch("ganttInstance", {immediate: true})
  GanttRefListener(instance) {
    const {getWBSData, year, quarter, month, id} = this;
    this.ganttData.Tasks = [];
    this.debounceGetWBSData({year, quarter, month}, this, id);
  }

  mounted() {
    this.projectName = this.projectConfig?.projectName as string;
    this.projectCode = `${env.project}`;
    this.getinit();
    this.getdeviation();
  }

  clearClick() {
    this.nodeId='';
    //@ts-ignore
    this.getWBSData();
  }

  reset() {
    this.nodeId='';
    this.getinit();
    this.getdeviation();
    this.ganttConditionCheckType = [];
  }

  //放大缩小
  enlarge() {
    this.GanttRef?.ganttZoomIn();
  }

  narrow() {
    this.GanttRef?.ganttZoomOut();
  }

  private renderFillBlank(cell, projectInstance): string {
    const value = cell.record[cell.field];
    return `<span>${value ?? ""}</span>`;
  }

  //判断进度状态
  private ProgressStatus(cell): string {
    let value = cell.record[cell.field];
    if (value == -1 || value == null) {
      value = "未开工";
    }
    if (value == 0) {
      value = "已完工";
    }
    if (value == 1) {
      value = "进行中";
    }
    if (value == 2) {
      value = "预警";
    }
    if (value == 3) {
      value = "滞后";
    }
    return `<span>${value}</span>`;
  }

  //判断开工状态
  private StartStatus(cell): string {
    let value = cell.record[cell.field];
    if (value == -1 || value == null) {
      value = "未开工";
    }
    if (value == 0) {
      value = "正常开工";
    }
    if (value == 1) {
      value = "超前开工";
    }
    if (value == 2) {
      value = "滞后开工";
    }
    return `<span>${value}</span>`;
  }

  //判断完工状态
  private EndStatus(cell): string {
    let value = cell.record[cell.field];
    if (value == -1 || value == null) {
      value = "未完工";
    }
    if (value == 0) {
      value = "正常完工";
    }
    if (value == 1) {
      value = "超前完工";
    }
    if (value == 2) {
      value = "滞后完工";
    }
    return `<span>${value}</span>`;
  }

  private renderParentTask(cell, projectInstance): string {
    return `<span>${
      projectInstance.getTaskByID(cell.record.ParentTaskUID)?.Name ?? ""
    }</span>`;
  }

  private renderDate(cell, projectInstance): string {
    const dateStr = cell.record.Start ?? null;
    return `<span>${
      dateStr ? moment(dateStr).format("YYYY-MM-DD") : ""
    }</span>`;
  }

  private renderDateFinish(cell, projectInstance): string {
    const dateStr = cell.record.Finish ?? null;
    return `<span>${
      dateStr ? moment(dateStr).format("YYYY-MM-DD") : ""
    }</span>`;
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

  private wbsDataAdapter(resResult: Array<bizGanttData>) {
    const {ganttInstance, ganttTaskStateAdapter, wbsTreeDataAdapter} = this;
    if (!Array.isArray(resResult))
      return this.$message.error("Gantt数据格式无效！");
    if (!ganttInstance) return;
    Utils.deepFind(
      resResult,
      (item) => {
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
    this.ganttData.Tasks = resResult as unknown as Array<GanttClass.GanttTask<bizGanttData>>;
    this.$nextTick().then(() => {
      this.GanttRef?.ganttInstance?.collapseAll();
      this.GanttRef?.ganttInstance?.expandLevel(0);
      // this.GanttRef?.ganttInstance?.expandLevel(1);
    });
  }

  private getWBSData(
    planId: string,
    year: number,
    season: number,
    month: number,
    planDetailName?: string,
    progressState?: string
  ) {
    const {wbsDataAdapter, ganttConditionCheckType} = this;
    // this.ganttData.Tasks = [];
    const requestData = {
      projectCode: this.projectCode,
      projectName: this.projectName,
      model: 1,
      milestone: ganttConditionCheckType.includes("1") ? 1 : 0,
      critical: ganttConditionCheckType.includes("2") ? 1 : 0,
      month: month === 99 ? undefined : month,
      planDetailName: planDetailName,
      predecessor: "",
      schedulePlanId: planId,
      season: season === 99 ? undefined : season,
      year: year === 99 ? undefined : year,
      id:this.nodeId
    };
    if (progressState!==undefined) {
      this.$set(requestData, 'progressState', progressState)
    }
    const omitPropertyArray = [];
    for (const requestDataKey in requestData) {
      if (requestData.hasOwnProperty(requestDataKey)) {
        if (!requestData[requestDataKey])
          omitPropertyArray.push(requestDataKey as never);
      }
    }
    getTreeListV3(omit(requestData, omitPropertyArray)).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      res.data && wbsDataAdapter(res.data as unknown as Array<bizGanttData>);
    });
  }
}
</script>

<style lang="less" scoped>
@import "../BIMPlatform/BIMPlatform.module.less";

* {
  font-family: Source Han Sans CN;
  box-sizing: border-box;
}

.ScheduleOperation {
  width: 100%;
  height: 100%;

  .progress_title {
    padding-left: 2px;
    font-size: 16px;
    font-weight: 500;
    color: #0a0a0a;
    margin-bottom: 5px;

    img {
      margin-right: 5px;
      cursor: pointer;
    }
  }

  .outputValue {
    background: #ffffff;
    display: flex;
    margin-bottom: 15px;
    height: 31%;
    box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
    padding: 20px;
    padding-top: 10px;

    .outputValue_progress {
      width: 60%;
      height: 100%;

      h4 {
        margin-bottom: 20px;
      }

      .outputValueProportion {
        height: 90%;

        span {
          display: inline-block;
          margin-bottom: 5px;
          margin-right: 15px;
        }

        .output_progress {
          font-size: 15px;
          font-weight: 700;
        }
      }
    }

    .outputValue_echarts {
      width: 40%;
      height: 100%;

      h4 {
        padding-left: 38px;
        margin-bottom: 10px;
      }

      .outputValue_line {
        width: 100%;
        height: 98%;
      }
    }
  }

  .progressGannt {
    width: 100%;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    height: 64%;
    padding-top: 15px;

    .checkGannt {
      display: flex;
      margin-bottom: 2px;

      .search {
        width: 18%;
        padding-left: 20px;

        .el-input {
          width: 70%;
          vertical-align: middle;
        }

        .el-button {
          background: none;
          vertical-align: middle;
          padding: 8.5px 12px;
        }

        .el-input__icon {
          line-height: 37px;
        }
      }

      .gattType {
        width: 18%;
        flex-direction: row;

        .ant-checkbox-wrapper {
          font-size: 15px;
        }
      }

      .button {
        width: 77%;
        text-align: right;
        font-size: 14px;

        span {
          margin-right: 20px;
          cursor: pointer;
          font-size: 15px;
        }
      }
    }
  }

  .swiper1 {
    height: 100%;
  }
}
</style>

<style lang="less">
body {
  overflow: hidden;
}

.ScheduleOperation {
  .el-input__inner {
    color: #333;
  }

  .Gantt-module_ganttViewItem_1cQsa {
    height: 8px !important;
  }

  .Gantt-module_ganttViewItem_1vVJd {
    height: 8px !important;
  }

  .mini-splitter-border {
    border: none;
  }

  .mini-supergrid-border {
    height: 490px !important;
  }

  .mini-splitter-border {
    height: 490px !important;
  }

  .mini-gantt {
    height: 490px !important;
  }

  .mini-splitter-pane1 {
    height: 490px !important;
  }

  .mini-splitter-pane2 {
    height: 490px !important;
  }

  .mini-ganttview {
    height: 490px !important;
  }

  .mini-supergrid-row {
    height: 35px !important;
  }

  .mini-supergrid-cell {
    height: 35px !important;
  }

  .mini-supertree-ec-icon {
    top: 9px;
  }

  .mini-supergrid-cell-inner {
    font-size: 16px;
    font-family: Source Han Sans CN;
    margin: 0 auto;
  }

  .mini-ganttview-headercell {
    background: none;
    font-size: 16px;
  }

  .Gantt-module_ganttTHead_1K1cN {
    font-size: 16px;
  }

  .Gantt-module_ganttTHead_dXnPc {
    font-size: 16px;
  }

  .mini-ganttview-toptimescale .mini-ganttview-headercell {
    font-size: 16px;
  }
}
</style>
