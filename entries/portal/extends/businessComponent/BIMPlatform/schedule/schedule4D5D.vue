<template>
  <div class="progress4D5D" :style="{ bottom: boxBottom }">
    <div class="progressGannt">
      <div class="checkGannt">
        <div class="forwardGannt">
          <span
            v-for="(item, index) in forwardList"
            :key="index"
            @click="forwardClick(item)"
            :class="number == index ? active : ''"
          >
            {{ item.label }}
          </span>
        </div>
        <div class="search">
          <el-input
            v-model="input"
            placeholder="请输入内容"
            clearable
            @keyup.enter.native="searchClick"
            @clear="clearClick"
          ></el-input>
          <el-button
            slot="append"
            @click="searchClick"
            icon="el-icon-search"
          ></el-button>
        </div>
        <el-select
          v-model="value"
          placeholder="选择颗粒"
          popperClass="selectOption"
          clearable
          @change="handleSelect"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <div class="gattType">
          <check-box-group
            v-model="ganttConditionCheckType"
            @change="ganttConditionChange"
          >
            <check-box :value="'1'">里程碑</check-box>
            <check-box :value="'2'">关键线路</check-box>
          </check-box-group>
        </div>
        <div class="button">
          <span @click="enlarge">
            <img alt="" src="../img/icon_7.png"/>
            放大
          </span>
          <span @click="narrow">
            <img alt="" src="../img/icon_8.png"/>
            缩小
          </span>
        </div>
      </div>
      <Gantt
        :ganttData="ganttData"
        :readyFn="readyFn"
        :ganttColumns="ganttColumns"
        :ganttCellClick="ganttCellClick"
        :treeField="'Name'"
        :timeLines="timeLines"
        :rowHeight="32"
        :showCriticalPath="showCriticalPath"
        ref="GanttRef"
      />
    </div>
    <div class="progressEcharts">
      <div class="progressTitle">
        <h3>产值分析</h3>
        <div class="block">
          <span>日期设置：</span>
          <el-date-picker
            @change="handlePick"
            v-model="value2"
            type="daterange"
            align="right"
            unlinkPanels
            valueFormat="yyyy-MM-dd"
            rangeSeparator="至"
            startPlaceholder="开始日期"
            endPlaceholder="结束日期"
            :pickerOptions="pickerOptions"
          >
          </el-date-picker>
        </div>
      </div>
      <div style="height: 88%">
        <time-line-echarts
          :id="'fill'"
          :chartData="fillData2"
        ></time-line-echarts>
      </div>
    </div>
    <div class="isshow" @click="isshowClick">
      <img alt="" src="../img/组345.png"/>
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
import env from "@/config/env";
import {Gantt, GanttClass, Icon} from "@ctesi/component";
import DatePicker from "element-ui/lib/date-picker";
import Option from "element-ui/lib/option";
import Select from "element-ui/lib/select";
import Input from "element-ui/lib/input";
import * as Type from "../../../type";
import {getTreeList} from "../../../service/api";
import {
  getscheduleAnalyseDeviation,
  getscheduleAnalyseBimview,
  getModel
} from "../server/index.js";
import Utils from "../../../utils";
import omit from "omit.js";
import moment from "moment";
import "ant-design-vue/lib/checkbox/style/index.css";
import TimeLineEcharts from "../Echarts/TimeLineEcharts.vue";
import Class from "../../constructionPlan/ConstructionPlan.module.less";
import CheckBox from "ant-design-vue/lib/checkbox";
import CheckBoxGroup from "ant-design-vue/lib/checkbox/Group";
import "ant-design-vue/lib/checkbox/style/index.css";

interface bizGanttData extends Type.WBSNdMBS {
  model: object;
  reportDetailAmount: String;
  reportDetailMoney: String;
}

@Component({
  name: "schedule4D5D",
  components: {
    TimeLineEcharts,
    Gantt,
    ElDatePicker: DatePicker,
    ElSelect: Select,
    ElOption: Option,
    ElInput: Input,
    CheckBox: CheckBox,
    CheckBoxGroup: CheckBoxGroup
  },
})
export default class schedule4D5D extends Vue {
  id: string = "";
  planId: string = "";
  input: string = "";
  realTimeClData: string = "";
  XTimeClData: string = "";
  timeLines: Array<object> = [];
  timeNumber: number = 0;
  private year: number = 99;
  private quarter: 1 | 2 | 3 | 4 | 99 = 99;
  private month: number | 99 = 99;
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
  pickerOptions: object = {
    shortcuts: [
      {
        text: "最近一周",
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近一个月",
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近三个月",
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
          picker.$emit("pick", [start, end]);
        },
      },
    ],
  };
  fillData2: object = {
    xAxis: [],
    yAxis1: [],
    yAxis2: [],
    TimexAxis: 0,
    startValue: 0,
    endValue: 5,
    yName1: "计划产值",
    yName2: "实际产值",
    lengend: ["计划产值", "实际产值"],
  };
  projectCode: string = "";
  boxBottom: string = "0px";

  ganttColumns: Array<GanttClass.GanttColumn<bizGanttData>> = [
    {
      field: "Name",
      text: "名称",
      align: "center",
      width: 200,
      // editor: {
      //   type: "textbox",
      // },
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
  projectName: string = "";

  modelDeduceManager: object = {
    methodName: "modelDeduceManager",
    actionName: "readyDeduce",
    options: {
      duration: 2000,
      speed: 1,
      isLocation: true,
    },
    actionData: {},
  };
  forwardList: object = [
    {
      value: "0",
      label: "快退",
    },
    {
      value: "1",
      label: "后退",
    },
    {
      value: "2",
      label: "播放",
    },
    {
      value: "3",
      label: "暂停",
    },
    {
      value: "4",
      label: "停止",
    },
    {
      value: "5",
      label: "快进",
    },
  ];
  options: object = [
    {
      value: "0",
      label: "年",
    },
    {
      value: "1",
      label: "月",
    },
    {
      value: "2",
      label: "周",
    },
    {
      value: "3",
      label: "日",
    },
  ];
  value: string = "1";
  value1: string = "";
  value2: Array<string> = [];
  active: string = "active";
  periodType: number = 1;
  number: string = "10";
  startime: string = "";
  endtime: string = "";
  ProgressBackGround: string = "";
  nodeId: string = "";
  OutputValueBackGround: string = "";
  radio: string = "1";
  checkState: number = 1;
  private debounceGetWBSData = Utils.debounce((value, vm, id) => {
    const {year, quarter, month} = value,
      {planId, getWBSData} = vm;
    // if (!planId) return;
    getWBSData(id ?? planId, year, quarter, month);
  }, 500);

  //关键路径（新补充功能21.10.19）
  private ganttConditionCheckType: Array<string> = [];
  private showCriticalPath: boolean = false;

  private ganttConditionChange(value: Array<string>): void {
    this.ganttConditionCheckType = value;
  }

  @Watch("ganttConditionCheckType", {immediate: true})
  ganttConditionCheckTypeListener(val: Array<string>) {
    const {year, quarter, month, debounceGetWBSData} = this;
    this.ganttData.Tasks = [];
    if (val.includes('2')&&!val.includes('1')) {
      //关键线路
      this.showCriticalPath = true;
    } else{
      this.showCriticalPath = false;
    }
    debounceGetWBSData({year, quarter, month}, this);
  }

  get TimeZoneQueryCondition() {
    return {
      year: this.year === 99 ? undefined : this.year,
      quarter: this.quarter === 99 ? undefined : this.quarter,
      month: this.month === 99 ? undefined : this.month,
    };
  }

  isshowClick() {
    if (this.boxBottom == "0px") {
      this.boxBottom = "-367px";
    } else {
      this.boxBottom = "0px";
    }
  }

  //转换时间
  formatTime(dates, fmt) {
    const date = new Date(dates);
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    var o = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
    };
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        var str = o[k] + "";
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? str : ("00" + str).substr(str.length)
        );
      }
    }
    return fmt;
  }

  //甘特图表格点击事件
  ganttCellClick(val) {
    this.value2 = [];
    let Finish = this.formatTime(val.record.Finish, "yyyy-MM-dd");
    let Start = this.formatTime(val.record.Start, "yyyy-MM-dd");
    this.nodeId = val.task.UID;
    this.value2.push(Start);
    this.value2.push(Finish);
    this.getinit();
    getModel(this.projectCode, this.projectName, this.nodeId).then(res => {
      if (res.data) {
        this.$emit("getGanttModel", res.data);
      }
    })
  }

  //搜索功能
  searchClick() {
    //@ts-ignore
    this.getWBSData("", "", "", "", this.input);
  }

  readyFn(instance: GanttClass.GanttType<bizGanttData>) {
    if (instance) this.ganttInstance = instance;
  }

  //选择颗粒
  handleSelect(val) {
    this.periodType = val;
    this.getinit();
  }

  //选择时间
  handlePick(val) {
    console.log(this.value2);
    this.startime = val[0];
    this.endtime = val[1];
    this.getinit();
  }

  //播放暂停
  forwardClick(item) {
    this.number = item.value;
    if (item.value == "0") {
      //@ts-ignore
      this.fillData2.startValue = this.fillData2.TimexAxis - 5
      //@ts-ignore
      this.fillData2.endValue = this.fillData2.TimexAxis
      //@ts-ignore
      clearInterval(this.realTimeClData);
      //@ts-ignore
      clearInterval(this.XTimeClData);
      //@ts-ignore
      this.realTimeClData = setInterval(() => {
        //@ts-ignore
        if (this.fillData2.TimexAxis <= 0) {
          //@ts-ignore
          clearInterval(this.realTimeClData);
          //@ts-ignore
          clearInterval(this.XTimeClData);
        } else {
          //@ts-ignore
          this.fillData2.TimexAxis--;
        }
        this.timeLines = [
          {
            //@ts-ignore
            date: new Date(this.fillData2.xAxis[this.fillData2.TimexAxis]),
            text: '',
            position: 'top',
            render: this.renderTimeline,
            renderTitle: this.renderTimelineTitle
          }
        ]
      }, 500);
      //@ts-ignore
      this.XTimeClData = setInterval(() => {
        //@ts-ignore
        this.fillData2.startValue -= 5;
        //@ts-ignore
        this.fillData2.endValue -= 5;
      }, 2500);
      //@ts-ignore
      this.modelDeduceManager.actionData = {
        direction: "back", // 'back', 'forward'
        amount: 2, // 跨越的节点数
      };
      //@ts-ignore
      this.modelDeduceManager.actionName = "rewindDeduce";
    }
    if (item.value == "1") {
      //@ts-ignore
      this.fillData2.startValue = this.fillData2.TimexAxis - 5
      //@ts-ignore
      this.fillData2.endValue = this.fillData2.TimexAxis
      //@ts-ignore
      clearInterval(this.realTimeClData);
      //@ts-ignore
      clearInterval(this.XTimeClData);
      //@ts-ignore
      this.realTimeClData = setInterval(() => {
        //@ts-ignore
        if (this.fillData2.TimexAxis <= 0) {
          //@ts-ignore
          clearInterval(this.realTimeClData);
          //@ts-ignore
          clearInterval(this.XTimeClData);
        } else {
          //@ts-ignore
          this.fillData2.TimexAxis--;
        }
        this.timeLines = [
          {
            //@ts-ignore
            date: new Date(this.fillData2.xAxis[this.fillData2.TimexAxis]),
            text: '',
            position: 'top',
            render: this.renderTimeline,
            renderTitle: this.renderTimelineTitle
          }
        ]
      }, 1000);
      //@ts-ignore
      this.XTimeClData = setInterval(() => {
        //@ts-ignore
        this.fillData2.startValue -= 5;
        //@ts-ignore
        this.fillData2.endValue -= 5;
      }, 5000);
      //@ts-ignore
      this.modelDeduceManager.actionData = {
        speed: 2,
      };
      //@ts-ignore
      this.modelDeduceManager.actionName = "rewindDeduce";
    }
    if (item.value == "2") {

      //@ts-ignore
      this.fillData2.startValue = this.fillData2.TimexAxis
      //@ts-ignore
      this.fillData2.endValue = this.fillData2.TimexAxis + 5
      //@ts-ignore
      clearInterval(this.realTimeClData);
      //@ts-ignore
      clearInterval(this.XTimeClData);
      //@ts-ignore
      this.realTimeClData = setInterval(() => {
        //@ts-ignore
        this.fillData2.TimexAxis++;
        //@ts-ignore
        if (this.fillData2.TimexAxis + 1 == this.fillData2.xAxis.length) {
          //@ts-ignore
          clearInterval(this.realTimeClData);
          //@ts-ignore
          clearInterval(this.XTimeClData);
        }

        this.timeLines = [
          {
            //@ts-ignore
            date: new Date(this.fillData2.xAxis[this.fillData2.TimexAxis]),
            text: '',
            position: 'top',
            render: this.renderTimeline,
            renderTitle: this.renderTimelineTitle
          }
        ]
      }, 1000);
      //@ts-ignore
      this.XTimeClData = setInterval(() => {
        //@ts-ignore
        this.timeNumber++
        //@ts-ignore
        this.fillData2.startValue += 5;
        //@ts-ignore
        this.fillData2.endValue += 5;
      }, 5000);
      //@ts-ignore
      this.modelDeduceManager.actionData = {
        currentIndex: 0, // 开始播放的索引值
      };
      //@ts-ignore
      this.modelDeduceManager.actionName = "startDeduce";
    }
    if (item.value == "3") {
      //@ts-ignore
      clearInterval(this.realTimeClData);
      //@ts-ignore
      clearInterval(this.XTimeClData);
      //@ts-ignore
      this.modelDeduceManager.actionData = null;
      //@ts-ignore
      this.modelDeduceManager.actionName = "pauseDeduce";
    }
    if (item.value == "4") {
      this.timeLines = [
        {
          date: new Date(""),
          text: '',
          position: 'top',
          render: this.renderTimeline,
          renderTitle: this.renderTimelineTitle
        }
      ]
      //@ts-ignore
      clearInterval(this.XTimeClData);
      //@ts-ignore
      clearInterval(this.realTimeClData);
      //@ts-ignore
      this.fillData2.TimexAxis = 0;
      //@ts-ignore
      this.fillData2.startValue = 0;
      //@ts-ignore
      this.timeNumber = 0
      //@ts-ignore
      this.fillData2.endValue = 5;
      //@ts-ignore
      this.modelDeduceManager.actionData = null;
      //@ts-ignore
      this.modelDeduceManager.actionName = "stopDeduce";
    }
    if (item.value == "5") {
      this.timeLines = []
      //@ts-ignore
      this.fillData2.startValue = this.fillData2.TimexAxis
      //@ts-ignore
      this.fillData2.endValue = this.fillData2.TimexAxis + 5
      //@ts-ignore
      clearInterval(this.realTimeClData);
      //@ts-ignore
      clearInterval(this.XTimeClData);
      //@ts-ignore
      this.realTimeClData = setInterval(() => {
        //@ts-ignore
        this.fillData2.TimexAxis++;
        //@ts-ignore
        if (this.fillData2.TimexAxis + 1 == this.fillData2.xAxis.length) {
          //@ts-ignore
          clearInterval(this.realTimeClData);
          //@ts-ignore
          clearInterval(this.XTimeClData);
        }
        this.timeLines = [
          {
            //@ts-ignore
            date: new Date(this.fillData2.xAxis[this.fillData2.TimexAxis]),
            text: '',
            position: 'top',
            render: this.renderTimeline,
            renderTitle: this.renderTimelineTitle
          }
        ]
      }, 500);
      //@ts-ignore
      this.XTimeClData = setInterval(() => {
        //@ts-ignore
        this.fillData2.startValue += 5;
        //@ts-ignore
        this.fillData2.endValue += 5;
      }, 2500);
      //@ts-ignore
      this.modelDeduceManager.actionData = {
        speed: 2, // 表示相对于当前播放速度的倍率
      };
      //@ts-ignore
      this.modelDeduceManager.actionName = "forwardDeduce";
    }
    this.$emit("modelDeduceManager", this.modelDeduceManager);
  }

  getinit() {
    getscheduleAnalyseDeviation(
      this.projectCode,
      this.projectName,
      this.nodeId,
      this.periodType,
      this.startime,
      this.endtime
    ).then((res) => {
      //@ts-ignore
      this.fillData2.xAxis = res.data?.dateAxis;
      //@ts-ignore
      this.fillData2.yAxis1 = res.data?.planValueAxis;
      //@ts-ignore
      this.fillData2.yAxis2 = res.data?.realValueAxis;
      //@ts-ignore
      this.fillData2.startValue = 0;
      //@ts-ignore
      this.fillData2.endValue = 5;
      //@ts-ignore
      this.fillData2.TimexAxis = 0;
    });
    //@ts-ignore
    this.modelDeduceManager.actionName = "readyDeduce";
    getscheduleAnalyseBimview(
      this.projectCode,
      this.projectName,
      this.nodeId,
      this.periodType,
      this.startime,
      this.endtime
    ).then((res) => {
      if (res.data) {
        //@ts-ignore
        this.modelDeduceManager.actionData = res.data;
        this.$emit("modelDeduceManager", this.modelDeduceManager);
      }
    });
  }

  // private wbsTreeDataAdapter(item) {
  //   const { ganttInstance, wbsTreeDataAdapter } = this;
  //   if (!ganttInstance) return;
  //   const task = ganttInstance.newTask();
  //   task.Start = moment(item.planDetailStart).toDate();
  //   task.Finish = moment(item.planDetailEnd).toDate();
  //   // task.FixedDate =1;
  //   task.Duration = item.planDetailPeriod;
  //   task.Name = item.planDetailName;
  //   // task.ConstraintType = 4;
  //   // task.ConstraintDate = moment(item.planDetailStart).toDate();
  //   // task.ParentTaskUID = item.th04aPlandetailFk;
  //   task.UID = item.id;
  //   task.bs = item.bs;
  //   task.codeType = item.codeType;
  //   task.milestone = item.milestone ?? 0;
  //   task.planDetailAmount = item.planDetailAmount ?? 0;
  //   task.reportDetailAmount = item.reportDetailAmount ?? 0;
  //   task.reportDetailMoney = item.reportDetailMoney ?? 0;
  //   task.critical = item.critical ?? 0;
  //   task.planDetailMoney = item.planDetailMoney ?? 0;
  //   task.planDetailUnit = item.planDetailUnit ?? undefined;
  //   task.planDetailUnitPrice = item.planDetailUnitPrice ?? 0;
  //   task.th04aPlanschemeFk = item.th04aPlanschemeFk;
  //   task.ta01CodeFk = item.ta01CodeFk;
  //   task.bsSort = item.ID;
  //   task.subPlanType = item.subPlanType;
  //   task.remarks = item.remarks;
  //   task.model = item.model;
  //   task.PercentComplete = Number(
  //     ((item.reportDetailAmount / item.planDetailAmount) * 100).toFixed(2)
  //   );
  //   // task.state = 'exist';
  //   if (item.th04aPlandetailFk) {
  //     ganttInstance.addTask(
  //       task,
  //       "add",
  //       ganttInstance.getTask(item.th04aPlandetailFk)
  //     );
  //   } else {
  //     ganttInstance.addTask(task);
  //   }
  //   // console.log("afterTreeAdapter==>", ganttInstance.getData());
  // }

  @Watch("TimeZoneQueryCondition", {immediate: true})
  TimeZoneQueryConditionListener(value) {
    const {year, quarter, month} = value,
      {planId, getWBSData} = this;
    // if (!planId) return;
    this.ganttData.Tasks = [];
    this.debounceGetWBSData(value, this);
    // getWBSData(planId, year, quarter, month);
  }

  @Watch("ganttInstance", {immediate: true})
  GanttRefListener(instance) {
    // const { id } = Utils.GetRequest();

    const {getWBSData, year, quarter, month, id} = this;
    console.log("id===>", id);
    // if (!id) return;
    this.ganttData.Tasks = [];
    this.debounceGetWBSData({year, quarter, month}, this, id);
    // getWBSData(id, year, quarter, month);
  }

  mounted() {
    this.projectCode = `${env.project}`;
    //@ts-ignore
    this.projectName = this.$route.query.projectName;

    this.getinit();
  }

  clearClick() {
    //@ts-ignore
    this.getWBSData();
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

  private wbsTreeDataAdapter(item) {
    const {ganttInstance} = this;
    if (!ganttInstance) return;
    item.Start = moment(item.planDetailStart).toDate();
    item.Finish = moment(item.planDetailEnd).toDate();
    item.Duration = item.planDetailPeriod;
    item.Name = item.planDetailName;
    item.UID = item.id;
    item.milestone = item.milestone ?? 0;
    // item.critical = item.critical ?? 0;
    item.planDetailAmount = item.planDetailAmount ?? 0;
    item.reportDetailAmount = item.reportDetailAmount ?? 0;
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
    item.model = item.model;
    item.PredecessorLink = item.predecessorLink;
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
    planDetailName: string
  ) {
    const {wbsDataAdapter,ganttConditionCheckType} = this;
    // this.ganttData.Tasks = [];
    const requestData = {
      projectCode: this.projectCode,
      projectName: this.$route.query.projectName,
      milestone: ganttConditionCheckType.includes("1") ? 1 : 0,
      critical: ganttConditionCheckType.includes("2") && ganttConditionCheckType.includes("1") ? 1 : 0,
      month: month === 99 ? undefined : month,
      planDetailName: planDetailName,
      predecessor: "",
      schedulePlanId: planId,
      season: season === 99 ? undefined : season,
      year: year === 99 ? undefined : year,
      model: 1
    };
    const omitPropertyArray = [];
    for (const requestDataKey in requestData) {
      if (requestData.hasOwnProperty(requestDataKey)) {
        if (!requestData[requestDataKey])
          omitPropertyArray.push(requestDataKey as never);
      }
    }
    getTreeList(omit(requestData, omitPropertyArray)).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      res.data && wbsDataAdapter(res.data as unknown as Array<bizGanttData>);
    });
  }

  private renderTimeline(timeline: GanttClass.GanttTimeLine, pos: GanttClass.GanttTimeLinePos): string {
    const left = `${pos.left}px`;
    const top = `${pos.top ?? 0}px`;
    const height = `${pos.height ?? 'auto'}px`;
    return `<div class="TimeLine" style="position:${'absolute'};left:${left};height:${height};top: ${top}"  ></div>`;
  }

  private renderTimelineTitle(timeline: GanttClass.GanttTimeLine, pos: GanttClass.GanttTimeLinePos): string {
    const left = `${pos.left}px`;
    const top = `${pos.top ?? 0}px`;
    const height = `${pos.height ?? 'auto'}px`;
    return `<div class="${Class.testTimeLineTitle}" style="position:${'absolute'};left:${left};height:${height};top: ${top}"  >${timeline.text}</div>`;
  }
}
</script>

<style lang="less" scoped>
@import "../BIMPlatform.module.less";

* {
  font-family: Source Han Sans CN;
  color: #ffffff;
  box-sizing: border-box;
}

.progress4D5D {
  width: 100%;
  height: 400px;
  padding: 40px 20px 0 20px;
  position: fixed;
  display: flex;
  transition: 1s;
  bottom: 0;
  background: url("../../../../src/assets/extends/bim/frame_bottom.png");
  background-size: 100% 100%;

  .progressGannt {
    width: 66%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .checkGannt {
      display: flex;

      .forwardGannt {
        width: 34%;
        padding-left: 10px;
        padding-top: 5px;

        span {
          display: inline-block;
          width: 45px;
          cursor: pointer;
          font-size: 15px;
          height: 25px;
          background: rgba(77, 79, 85, 0.5);
          border-radius: 4px;
          text-align: center;
          margin-right: 10px;
        }

        .active {
          background: rgba(50, 206, 255, 0.5);
        }
      }

      .search {
        width: 18%;
        margin-right: 8%;

        .el-input {
          width: 80%;
          vertical-align: middle;
          background: none;
        }

        .el-input__inner {
          background: none;
        }

        .el-button {
          background: none;
          padding: 9px 10px;
          vertical-align: middle;
        }

        .el-input__icon {
          line-height: 37px;
        }
      }

      .gattType {
        width: 20%;
        flex-direction: row;

        .ant-checkbox-wrapper {
          font-size: 15px;
        }
      }

      .button {
        width: 20%;
        text-align: right;
        padding-top: 5px;
        font-size: 14px;

        span {
          margin-right: 20px;
          cursor: pointer;
          font-size: 15px;
        }
      }
    }
  }

  .progressEcharts {
    width: 34%;
    height: 100%;
    padding-left: 20px;

    .progressTitle {
      display: flex;
      height: 10%;
      padding: 5px;

      h3 {
        flex: 1;
        padding-top: 5px;
        font-size: 15px;
        font-weight: 700;
      }
    }
  }

  .isshow {
    position: absolute;
    bottom: 92%;
    left: 48.5%;
    width: 59px;
    height: 29px;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>

<style lang="less">

body {
  overflow: hidden;
}

.progress4D5D {
  .TimeLine {
    width: 4px;
    z-index: 99;
    margin-left: -1px;
    background-color: #F55B54;
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

  .mini-supergrid {
    background: none;
  }

  .mini-gantt .mini-ganttview {
    background: none;
    height: 300px !important;
  }

  .mini-ganttview-headercell {
    background: none;
    font-size: 16px;
  }

  .mini-supergrid-headercell {
    background: none;
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

  .mini-ganttview-bottomtimescale {
    background: none !important;
  }

  .mini-ganttview-header {
    background: none !important;
  }

  .mini-gantt-column {
    border-right: solid 1px rgba(255, 255, 255, 0.2);
  }

  .mini-splitter-pane2 {
    border-left: solid 1px #267996;
  }

  .mini-splitter-pane1 {
    border-right: solid 1px #267996;
  }

  .mini-splitter-pane1-button {
    background: url("../img/组597.png");
    background-size: 100% 100%;
    height: 50px;
  }

  .mini-splitter-pane2-button {
    background: url("../img/组595.png");
    background-size: 100% 100%;
    height: 50px;
  }

  div[class~="mini-supergrid-row"]:nth-child(2n + 1) {
    background: rgba(53, 130, 243, 0.1) !important;
  }

  .mini-supergrid .mini-supergrid-viewport .mini-supergrid-cellselected {
    background: rgba(255, 255, 255, 0.2);
  }

  .mini-supergrid .mini-supergrid-viewport .mini-supergrid-rowselected {
    background: rgba(255, 255, 255, 0.1);
  }

  .mini-supergrid-border {
    height: 300px;
  }

  .ant-checkbox-group {
    padding-left: 30px;
  }

  .el-range-editor .el-range-input {
    background: none;
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

  .Gantt-module_main_1cMBp div[class="mini-splitter-border"] {
    border: none;
  }

  .checkGannt {
    .el-input__inner {
      height: 34px;
      line-height: 34px;

      .el-input__icon {
        line-height: 34px;
      }
    }
  }

  .search {
    .el-input__inner {
      background: none;
      color: #fff;

      .el-input__icon {
        line-height: 34px;
      }
    }
  }

  .el-select {
    width: 8%;

    .el-input__inner {
      color: #fff;
      background: none;

      .el-input__icon {
        line-height: 34px;
      }
    }
  }

  .block {
    .el-input__inner {
      height: 34px;
      line-height: 34px;
    }

    .el-input__icon {
      line-height: 28px;
    }
  }
}

.selectOption {
  background: rgba(0, 8, 8, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);


  /deep/ .el-select-dropdown__wrap {
    background: none !important;
  }

  /deep/ .el-select-dropdown {
    background: none !important;
  }

  /deep/ .el-select-dropdown__item {
    background: none;
    color: #99ddf9;
  }

  /deep/ .el-select-dropdown__item:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}
</style>
