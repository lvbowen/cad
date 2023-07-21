<template>
  <div class="scheduleAnalysis" :style="{ bottom: boxBottom }">
    <div class="progressAnalysisGannt">
      <div class="checkGannt">
        <CheckBoxGroup
          :value="ganttConditionCheckType"
          @change="ganttConditionChange"
        >
          <!-- <CheckBox value="3">总进度分析</CheckBox> -->
          <CheckBox value="1">里程碑</CheckBox>
          <CheckBox value="2">关键线路</CheckBox>
        </CheckBoxGroup>
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
            icon="el-icon-search"></el-button>
        </div>
        <div class="block">
          <!-- <span>时间筛选：</span> -->
          <el-date-picker
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
          <div @click="modelTimeColor" title="模型上显示某时间段内模型填报情况（颜色区分）" class="submit">{{ modelTimeName }}</div>
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
        :showCriticalPath="showCriticalPath"
        :view="true"
        :treeField="'Name'"
        :rowHeight="32"
        ref="GanttRef"
      />
    </div>
    <div class="progressEcharts">
      <div class="progressTitle">
        <h3>{{ progressTitle }}</h3>
        <p v-if="isShowModelClick" @click="modelCLick">{{ fillModelTitle }}</p>
        <span
          @click="ProgresStatus"
          :style="{ background: ProgressBackGround }"
        >
          进度状态
        </span>
        <span
          @click="OutputValueStatistics"
          :style="{ background: OutputValueBackGround }"
        >
          产值统计
        </span>
      </div>
      <div style="height: 88%">
        <pie-charts
          :chartData="investmentData1"
          :id="'investment_echart1'"
          @contractName="messagEchart($event)"
          @dblclick="dblclicks($event)"
        ></pie-charts>
      </div>
    </div>
    <div class="isshow" @click="isshowClick">
      <img alt="" src="../img/组345.png"/>
    </div>
    <div class="progressTable" v-show="tableShow">
      <div class="tableTitle">
        <h3>进度状态数据</h3>
        <span @click="ShowTable"> × </span>
      </div>
      <div class="table">
        <el-scrollbar style="height: 90%">
          <el-table
            :data="tableData"
            :defaultSort="{ prop: 'date', order: 'descending' }"
            style="width: 100%"
          >
            <el-table-column prop="planDetailName" label="构件名称">
            </el-table-column>
            <el-table-column prop="planDetailAmount" label="计划完成数量" width="90">
            </el-table-column>
            <el-table-column prop="planDetailMoney" label="计划完成产值" width="90">
            </el-table-column>
            <el-table-column prop="reportDetailAmount" label="完成数量" width="80">
            </el-table-column>
            <el-table-column prop="reportDetailMoney" label="完成产值" width="80">
            </el-table-column>
          </el-table>
        </el-scrollbar>
        <div style="float: right">
          <el-pagination
            @current-change="handleCurrentSuper"
            :currentPage.sync="currentPage1"
            :pageSize="5"
            layout="total,prev, pager, next"
            :total="total"
          >
          </el-pagination>
        </div>
      </div>
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
import PieCharts from "../../ManageViews/components/PieCharts.vue";
import { getscheduleAnalyseState, getPageLeafList, getModel, getStateByReportDate } from "../server/index.js";
import env from "@/config/env";
import { Gantt, GanttClass, Icon } from "@ctesi/component";
import * as Type from "../../../type";
import { getTreeList } from "../../../service/api";
import Utils from "../../../utils";
import Input from "element-ui/lib/input";
import omit from "omit.js";
import moment from "moment";
import CheckBox from "ant-design-vue/lib/checkbox";
import CheckBoxGroup from "ant-design-vue/lib/checkbox/Group";
import "ant-design-vue/lib/checkbox/style/index.css";
import Pagination from "element-ui/lib/pagination";
import DatePicker from "element-ui/lib/date-picker";

interface bizGanttData extends Type.WBSNdMBS {
  model: object;
  reportDetailAmount: String;
  reportDetailMoney: String;
}

@Component( {
  name: "scheduleAnalysis",
  components: {
    PieCharts,
    Gantt,
    CheckBox,
    CheckBoxGroup,
    ElPagination: Pagination,
    ElDatePicker: DatePicker,
    ElInput: Input,
  },
} )
export default class scheduleAnalysis extends Vue {
  id: string = "";
  planId: string = "";
  input: string = "";
  startime: string = "";
  endtime: string = "";
  value2: Array<any> = [];
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
  isShowModelClick: boolean = true;
  tableShow: boolean = false;
  AllmodelShow: boolean = true;
  AllmodelTimeShow: boolean = true;
  fillModelTitle: string = "模型显示";
  modelTimeName: string = "模型显示";
  progressState: string = "";
  currentPage1: Number = 1;
  total: Number = 10;
  scheduleModel: object = {};
  scheduleData: Array<object> = [];
  scheduleAllModel: Array<object> = [];
  scheduleTimeModel: Array<object> = [];
  tableData: Array<object> = [];
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
    StartDate: moment( new Date() ).toDate(),
    FinishDate: moment( new Date() ).add( 1, "days" ).toDate(),
    Tasks: [],
    UID: 0,
  };
  investmentData1: object = {
    tileText: "",
    formatter: "",
    right: 50,
    color: [],
    radius: [ "40%", "60%" ],
    series: [],
  };
  // }
  private debounceGetWBSData = Utils.debounce( ( value, vm, id ) => {
    const { year, quarter, month } = value,
      { planId, getWBSData } = vm;
    // if (!planId) return;
    getWBSData( id ?? planId, year, quarter, month );
  }, 500 );

  //甘特图表格点击事件
  ganttCellClick( val ) {
    this.nodeId = val.task.UID;
    getModel( this.projectCode, this.$route.query.projectName, this.nodeId ).then( res => {
      if ( res.data ) {
        this.$emit( "getGanttModel", res.data );
      }
    } )
    if ( this.checkState == 1 ) {
      this.ProgresStatus();
      getPageLeafList(
        this.projectCode,
        this.$route.query.projectName,
        this.nodeId,
        this.progressState,
        this.currentPage1,
        5
      ).then( ( res ) => {
        this.tableData = res.data.data;
        this.total = Number( res.data.totalSize );
        this.currentPage1 = Number( res.data.pageNum );
      } );
    } else if ( this.checkState == 2 ) {
      this.OutputValueStatistics();
    }
  }

  isshowClick() {
    if ( this.boxBottom == "0px" ) {
      this.boxBottom = "-367px";
    } else {
      this.boxBottom = "0px";
    }
  }

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

  //搜索功能
  searchClick() {
    //@ts-ignore
    this.getWBSData( "", "", "", "", this.input )
  }

  projectCode: string = "";
  progressTitle: string = "进度状态占比";
  boxBottom: string = "0px";
  ProgressBackGround: string = "";
  nodeId: string = "";
  OutputValueBackGround: string = "";
  radio: string = "1";
  checkState: number = 1;
  private ganttConditionCheckType: Array<string> = [];
  private showCriticalPath: boolean = false;

  clearClick() {
    //@ts-ignore
    this.getWBSData()
  }

  readyFn( instance: GanttClass.GanttType<bizGanttData> ) {
    if ( instance ) this.ganttInstance = instance;
  }

  ganttConditionChange( val ) {
    this.ganttConditionCheckType = val;
  }

  //筛选时间模型颜色
  modelTimeColor() {
    this.AllmodelTimeShow = !this.AllmodelTimeShow;
    if ( this.AllmodelTimeShow ) {
      this.modelTimeName = "模型显示";
      this.value2 = []
      this.startime = ""
      this.endtime = ""
      this.$emit( "clearModel", "releaseModelSchedule" );
    } else {
      this.modelTimeName = "取消显示";
      this.startime = this.value2[0];
      this.endtime = this.value2[1];
      getStateByReportDate(this.projectCode, this.$route.query.projectName, this.nodeId, this.startime, this.endtime).then(res=>{
        this.scheduleData = res.data.progressStateAnalyse;
        //@ts-ignore
        this.scheduleTimeModel = [];
        if ( this.checkState == 1 ) {
          this.scheduleData.forEach( ( e ) => {
            //@ts-ignore
            if ( e.model ) {
            //@ts-ignore
             this.scheduleTimeModel.push( e.model );
            }
          } );
        } else if ( this.checkState == 2 ) {
         //@ts-ignore
          this.scheduleTimeModel.push( this.scheduleData.completeModel, this.scheduleData.leftModel )
        }
        this.$emit( "getAllModel", this.scheduleTimeModel );
      })
    }
  }
  //所有模型颜色
  modelCLick() {
    this.AllmodelShow = !this.AllmodelShow;
    if ( this.AllmodelShow ) {
      this.fillModelTitle = "模型显示";
      this.$emit( "clearModel", "releaseModelSchedule" );
    } else {
      this.fillModelTitle = "取消显示";
      //@ts-ignore
      this.scheduleAllModel = [];
      if ( this.checkState == 1 ) {
        this.scheduleData.forEach( ( e ) => {
          //@ts-ignore
          if ( e.model ) {
            //@ts-ignore
            this.scheduleAllModel.push( e.model );
          }
        } );
      } else if ( this.checkState == 2 ) {
        //@ts-ignore
        this.scheduleAllModel.push( this.scheduleData.completeModel, this.scheduleData.leftModel )
      }
      this.$emit( "getAllModel", this.scheduleAllModel );
    }
  }

  //进度状态
  ProgresStatus() {
    this.checkState = 1;
    this.progressTitle = "进度状态占比";
    this.ProgressBackGround = "rgba(50, 206, 255, 0.5)";
    this.OutputValueBackGround = "rgba(77, 79, 85, 0.5)";
    getscheduleAnalyseState(
      this.projectCode,
      this.nodeId || "",
      this.$route.query.projectName
    ).then( ( res ) => {
      this.scheduleData = res.data.progressStateAnalyse;
      //@ts-ignore 进度状态
      this.investmentData1.series = res.data.progressStateAnalyse?.map(
        ( item ) => {
          return { value: item.num, name: item.progressStateDesc };
        }
      );
      //@ts-ignore
      this.investmentData1.color = [];
      //@ts-ignore
      this.investmentData1.formatter = ""
      //@ts-ignore
      this.investmentData1.series.forEach( ( e ) => {
        if ( e.name == "未开工" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#C2C2C2" );
        }
        if ( e.name == "进行中" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#377EFF" );
        }
        if ( e.name == "滞后" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#FF0042" );
        }
        if ( e.name == "预警" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#F1B500" );
        }
        if ( e.name == "已完工" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#26C974" );
        }
      } );
    } );
  }

  //产值统计
  OutputValueStatistics() {
    this.progressTitle = "进度产值统计";
    this.ProgressBackGround = "rgba(77, 79, 85, 0.5)";
    this.OutputValueBackGround = "rgba(50, 206, 255, 0.5)";
    this.checkState = 2;
    getscheduleAnalyseState(
      this.projectCode,
      this.nodeId || "",
      this.$route.query.projectName
    ).then( ( res ) => {
      this.scheduleData = res.data.nodeAnalyseValue;
      //@ts-ignore
      this.investmentData1.series = [
        {
          name: "完成产值",
          value: 0,
        },
        {
          name: "剩余产值",
          value: 0,
        },
      ];
      //@ts-ignore
      this.investmentData1.formatter = "万元"
      //@ts-ignore 进度状态
      this.investmentData1.series[0].value =
        res.data.nodeAnalyseValue.completeValue / 10000 ?? 0;
      // //@ts-ignore
      // this.investmentData1.series[0].name = "完成产值";
      //@ts-ignore
      this.investmentData1.series[1].value =
        res.data.nodeAnalyseValue.leftValue / 10000 ?? 0;
      // //@ts-ignore
      // this.investmentData1.series[1].name = "剩余产值";
      //@ts-ignore
      this.investmentData1.color = [];
      //@ts-ignore
      this.investmentData1.series.forEach( ( e ) => {
        if ( e.name == "剩余产值" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#FF0042" );
        }
        if ( e.name == "完成产值" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#26C974" );
        }
      } );
    } );
  }

  // private wbsTreeDataAdapter(item) {
  //   const { ganttInstance, wbsTreeDataAdapter } = this;
  //   if (!ganttInstance) return;
  //   const task = ganttInstance.newTask();
  //   task.Start = moment(item.planDetailStart).toDate();
  //   task.Finish = moment(item.planDetailEnd).toDate();
  //   // task.FixedDate =1;
  //   // task.Duration = item.planDetailPeriod;
  //   task.Name = item.planDetailName;
  //   task.UID = item.id;
  //   task.bs = item.bs;
  //   task.codeType = item.codeType;
  //   task.milestone = item.milestone ?? 0;
  //   task.critical = item.critical ?? 0;
  //   task.PercentComplete= Number(((item.reportDetailAmount / item.planDetailAmount) * 100).toFixed(2));
  //   task.planDetailAmount = item.planDetailAmount ?? 0;
  //   task.reportDetailAmount = item.reportDetailAmount ?? 0;
  //   task.planDetailMoney = item.planDetailMoney ?? 0;
  //   task.planDetailUnit = item.planDetailUnit ?? undefined;
  //   task.planDetailUnitPrice = item.planDetailUnitPrice ?? 0;
  //   task.reportDetailMoney = item.reportDetailMoney ?? 0;
  //   task.th04aPlanschemeFk = item.th04aPlanschemeFk;
  //   task.ta01CodeFk = item.ta01CodeFk;
  //   task.bsSort = item.ID;
  //   task.subPlanType = item.subPlanType;
  //   task.remarks = item.remarks;
  //   task.model = item.model;
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

  //模型联动
  messagEchart( val ) {
    //@ts-ignore
    if ( val.name == "完成产值" ) {
      //@ts-ignore
      this.scheduleModel = this.scheduleData.completeModel;
    } else if ( val.name == "剩余产值" ) {
      //@ts-ignore
      this.scheduleModel = this.scheduleData.leftModel;
    } else {
      this.scheduleData.forEach( ( e ) => {
        //@ts-ignore
        if ( e.model ) {
          //@ts-ignore
          if ( e.progressStateDesc == val.name && val.value == e.num ) {
            //@ts-ignore
            this.scheduleModel = e.model;
          }
        }
      } );
    }
    this.$emit( "getscheduleModel", this.scheduleModel );
  }

  dblclicks( val ) {
    if ( this.checkState == 1 ) {
      this.tableShow = true;
      this.progressState = val.name;
      getPageLeafList(
        this.projectCode,
        this.$route.query.projectName,
        this.nodeId,
        this.progressState,
        this.currentPage1,
        5
      ).then( ( res ) => {
        this.tableData = res.data.data;
        this.total = Number( res.data.totalSize );
        this.currentPage1 = Number( res.data.pageNum );
      } );
    }
  }

  handleCurrentSuper( val ) {
    this.currentPage1 = val;
    getPageLeafList(
      this.projectCode,
      this.$route.query.projectName,
      this.nodeId,
      this.progressState,
      this.currentPage1,
      5
    ).then( ( res ) => {
      this.tableData = res.data.data;
    } );
  }

  getinit() {
    getscheduleAnalyseState(
      this.projectCode,
      "",
      this.$route.query.projectName
    ).then( ( res ) => {
      this.scheduleData = res.data.progressStateAnalyse;
      //@ts-ignore 进度状态
      this.investmentData1.series = res.data.progressStateAnalyse?.map(
        ( item ) => {
          return { value: item.num, name: item.progressStateDesc };
        }
      );
      //@ts-ignore
      this.investmentData1.color = [];
      //@ts-ignore
      this.investmentData1.formatter = ""
      //@ts-ignore
      this.investmentData1.series.forEach( ( e ) => {
        if ( e.name == "未开工" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#C2C2C2" );
        }
        if ( e.name == "进行中" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#377EFF" );
        }
        if ( e.name == "滞后" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#FF0042" );
        }
        if ( e.name == "预警" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#F1B500" );
        }
        if ( e.name == "已完工" ) {
          //@ts-ignore
          this.investmentData1.color.push( "#26C974" );
        }
      } );
    } );
  }

  @Watch( "ganttConditionCheckType", { immediate: true } )
  ganttConditionCheckTypeListener( val: Array<string> ) {
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

  // }
  @Watch( "ganttInstance", { immediate: true } )
  GanttRefListener( instance ) {
    // const { id } = Utils.GetRequest();
    const { getWBSData, year, quarter, month, id } = this;
    console.log( "id===>", id );
    //  if (!id) return;
    this.ganttData.Tasks = [];
    // this.debounceGetWBSData({ year, quarter, month }, this, id);
    // getWBSData(id, year, quarter, month);
  }

  mounted() {
    this.projectCode = `${ env.project }`;
    if ( this.projectCode == "CH" ) {
      this.isShowModelClick = false
    }
    this.getinit();
  }

  //放大缩小
  enlarge() {
    this.GanttRef?.ganttZoomIn();
  }

  narrow() {
    this.GanttRef?.ganttZoomOut();
  }

  ShowTable() {
    this.tableShow = false;
  }

  private renderFillBlank( cell, projectInstance ): string {
    const value = cell.record[cell.field];
    return `<span>${ value ?? "" }</span>`;
  }

  //判断进度状态
  private ProgressStatus( cell ): string {
    let value = cell.record[cell.field];
    if ( value == -1 || value == null ) {
      value = "未开工";
    }
    if ( value == 0 ) {
      value = "已完工";
    }
    if ( value == 1 ) {
      value = "进行中";
    }
    if ( value == 2 ) {
      value = "预警";
    }
    if ( value == 3 ) {
      value = "滞后";
    }
    return `<span>${ value }</span>`;
  }

  //判断开工状态
  private StartStatus( cell ): string {
    let value = cell.record[cell.field];
    if ( value == -1 || value == null ) {
      value = "未开工";
    }
    if ( value == 0 ) {
      value = "正常开工";
    }
    if ( value == 1 ) {
      value = "超前开工";
    }
    if ( value == 2 ) {
      value = "滞后开工";
    }
    return `<span>${ value }</span>`;
  }

  //判断完工状态
  private EndStatus( cell ): string {
    let value = cell.record[cell.field];
    if ( value == -1 || value == null ) {
      value = "未完工";
    }
    if ( value == 0 ) {
      value = "正常完工";
    }
    if ( value == 1 ) {
      value = "超前完工";
    }
    if ( value == 2 ) {
      value = "滞后完工";
    }
    return `<span>${ value }</span>`;
  }

  private renderParentTask( cell, projectInstance ): string {
    return `<span>${
      projectInstance.getTaskByID( cell.record.ParentTaskUID )?.Name ?? ""
    }</span>`;
  }

  private renderDate( cell, projectInstance ): string {
    const dateStr = cell.record.Start ?? null;
    return `<span>${
      dateStr ? moment( dateStr ).format( "YYYY-MM-DD" ) : ""
    }</span>`;
  }

  private renderDateFinish( cell, projectInstance ): string {
    const dateStr = cell.record.Finish ?? null;
    return `<span>${
      dateStr ? moment( dateStr ).format( "YYYY-MM-DD" ) : ""
    }</span>`;
  }

  private renderMarker( cell, projectInstance ): string {
    const { critical, milestone } = cell.record;
    let str: string = "";
    if ( milestone ) {
      str += `<div aria-role="milestone"></div>`;
    }
    if ( critical ) {
      str += `<div aria-role="critical"></div>`;
    }
    return `<span aria-role="identifyCell">${ str }</span>`;
  }

  // get TimeZoneQueryCondition() {
  //   return {
  //     year: this.year === 99 ? undefined : this.year,
  //     quarter: this.quarter === 99 ? undefined : this.quarter,
  //     month: this.month === 99 ? undefined : this.month,
  //   };

  private wbsTreeDataAdapter( item ) {
    const { ganttInstance } = this;
    if ( !ganttInstance ) return;
    item.Start = moment( item.planDetailStart ).toDate();
    item.Finish = moment( item.planDetailEnd ).toDate();
    item.Duration = item.planDetailPeriod;
    item.Name = item.planDetailName;
    item.UID = item.id;
    item.milestone = item.milestone ?? 0;
    // item.critical = item.critical ?? 0;
    item.planDetailAmount = item.planDetailAmount ?? 0;
    item.planDetailMoney = item.planDetailMoney ?? 0;
    item.reportDetailAmount = item.reportDetailAmount ?? 0;
    let percent = item.reportDetailAmount / item.planDetailAmount;
    if ( isNaN( percent ) ) {
      percent = 0
    }
    ;
    item.PercentComplete = Number( percent * 100 ).toFixed( 2 );
    item.reportDetailAmount = item.reportDetailAmount ?? 0;
    item.planDetailUnit = item.planDetailUnit ?? undefined;
    item.planDetailUnitPrice = item.planDetailUnitPrice ?? 0;
    item.bsSort = item.ID;
    item.warningProportion = item.warningProportion ?? 0;
    item.model = item.model;
    item.PredecessorLink = item.predecessorLink;
  }

  private ganttTaskStateAdapter( action: string ) {
    switch ( action ) {
      default:
      case "added":
        // return 'add';
        return "refresh";
      case "edited":
        return "refresh";
    }
  }

  // @Watch("TimeZoneQueryCondition", { immediate: true })
  // TimeZoneQueryConditionListener(value) {
  //   const { year, quarter, month } = value,
  //     { planId, getWBSData } = this;
  //   //  if (!planId) return;
  //   this.ganttData.Tasks = [];
  //   this.debounceGetWBSData(value, this);
  //   // getWBSData(planId, year, quarter, month);

  private wbsDataAdapter( resResult: Array<bizGanttData> ) {
    const { ganttInstance, ganttTaskStateAdapter, wbsTreeDataAdapter } = this;
    if ( !Array.isArray( resResult ) )
      return this.$message.error( "Gantt数据格式无效！" );
    if ( !ganttInstance ) return;
    Utils.deepFind(
      resResult,
      ( item ) => {
        wbsTreeDataAdapter( item );
        item.predecessorLink.forEach(link => {
          link.PredecessorUID = link.predecessorId;
          link.Type = 1;
          link.LinkLag = link.lagDays;
        })
        return false;
      },
      "children"
    );
    this.ganttData.Tasks = (resResult as unknown) as Array<GanttClass.GanttTask<bizGanttData>>;
    this.$nextTick().then( () => {
      this.GanttRef?.ganttInstance?.collapseAll();
      this.GanttRef?.ganttInstance?.expandLevel( 0 );
      // this.GanttRef?.ganttInstance?.expandLevel(1);
    } )
  }

  private getWBSData(
    planId: string,
    year: number,
    season: number,
    month: number,
    planDetailName: string
  ) {
    const { wbsDataAdapter, ganttConditionCheckType } = this;
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
    for ( const requestDataKey in requestData ) {
      if ( requestData.hasOwnProperty( requestDataKey ) ) {
        if ( !requestData[requestDataKey] )
          omitPropertyArray.push( requestDataKey as never );
      }
    }
    getTreeList( omit( requestData, omitPropertyArray ) ).then( ( res ) => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      res.data && wbsDataAdapter( (res.data as unknown) as Array<bizGanttData> );
    } );
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

.scheduleAnalysis {
  width: 100%;
  height: 400px;
  padding: 40px 20px 0 20px;
  position: fixed;
  transition: 1s;
  display: flex;
  bottom: 0;
  background: url("../../../../src/assets/extends/bim/frame_bottom.png");
  background-size: 100% 100%;

  .progressAnalysisGannt {
    width: 75%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .ant-checkbox-group {
      width: 25%;
      line-height: 40px;
    }
    .block {
      width: 34%;
      display: flex;
      justify-content: space-around;
      .submit {
        cursor: pointer;
        width: 80px;
        height: 32px;
        line-height: 32px;
        border-radius: 4px;
        margin-right: 10px;
        font-size: 14px;
        text-align: center;
        background: #5486f4;
      }
    }

    .checkGannt {
      display: flex;
      .search {
        width: 19%;
        margin-right: 8%;

        .el-input {
          width: 80%;
          vertical-align: middle;
        }

        .el-button {
          background: none;
          padding: 9px 10px;
          vertical-align: middle;
        }

        .el-input__icon {
          line-height: 30px;
        }
      }

      .button {
        width: 18%;
        text-align: right;
        font-size: 14px;

        span {
          margin-right: 20px;
          font-size: 15px;
          cursor: pointer;
        }
      }
    }
  }

  .progressEcharts {
    width: 25%;
    height: 100%;

    .progressTitle {
      display: flex;
      height: 10%;
      padding: 20px;

      h3 {
        flex: 1;
      }

      p {
        cursor: pointer;
        width: 65px;
        height: 22px;
        border-radius: 4px;
        margin-right: 10px;
        text-align: center;
        background: #5486f4;
      }

      span {
        display: inline-block;
        cursor: pointer;
        width: 60px;
        height: 22px;
        border-radius: 4px;
        margin-right: 10px;
        text-align: center;
      }

      :nth-child(3) {
        background: rgba(50, 206, 255, 0.5);
      }

      :nth-child(4) {
        background: rgba(77, 79, 85, 0.5);
      }
    }
  }

  .progressTable {
    position: absolute;
    bottom: 103%;
    right: 5%;
    width: 490px;
    height: 380px;
    background: rgba(6, 8, 22, 0.7);

    .tableTitle {
      height: 12%;
      display: flex;
      padding: 8px;

      h3 {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        width: 94%;
      }

      span {
        font-size: 29px;
        color: #31abe3;
        width: 3%;
        text-align: center;
        cursor: pointer;
      }
    }

    .table {
      height: 88%;
      padding: 2px;
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
</style>

<style lang="less">
// .mini-textbox-border{
//   display: none;
// }
body {
  overflow: hidden;
}

.progressAnalysisGannt {
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
  }

  .mini-supergrid-headercell {
    background: none;
  }

  .mini-ganttview-headercell {
    background: none;
    font-size: 16px;
  }

  // .mini-grid *,
  // .mini-supergird *,
  // .mini-gantt *,
  // .mini-panel *,
  // .mini-window * {
  //   background: none;
  // }
  .mini-ganttview-bottomtimescale {
    background: none !important;
  }

  .mini-ganttview-header {
    background: none !important;
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

  .Gantt-module_main_1GQ7B
  div[class="mini-supergrid-cells"]
  > div[class~="mini-supergrid-row"]:nth-child(2n + 1) {
    background: none;
  }

  // .Gantt-module_main_1cMBp
  //   div[class="mini-supergrid-cells"]
  //   > div[class~="mini-supergrid-row"]:nth-child(2n + 1) {
  //   background: none;
  // }
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

  .Gantt-module_main_1cMBp div[class=mini-splitter-border] {
    border: none;
  }
}

.scheduleAnalysis {
  .el-table {
    color: #fff;
    background-color: rgba(234, 237, 243, 0.1); // transparent;
    border: 1px solid rgba(119, 171, 210, 1);
  }

  /deep/ .el-table__fixed {
    height: 100% !important; //设置高优先，以覆盖内联样式
  }

  .el-table th {
    color: rgba(255, 255, 255, 1);
    border: 1px solid #5073a1;
    background-color: transparent;
    font-weight: 800;
    font-size: 14px;
    text-align: center;
  }

  .el-table tr,
  .el-table td {
    font-size: 13px;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: rgba(255, 255, 255, 1);
    border: 1px solid #5073a1;
    background-color: transparent;
    text-align: center;
    cursor: pointer;
  }

  .el-table .warning-row {
    background: rgba(234, 237, 243, 0.1);
  }

  .el-table--enable-row-hover .el-table__body tr:hover > td {
    background: rgba(233, 237, 243, 0.3) !important;
  }

  .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  .el-pagination .btn-next,
  .el-pagination .btn-prev {
    background: none;
    color: #fff;
  }

  .el-pagination__total {
    color: #fff;
  }

  .el-pagination button:disabled {
    background: none;
  }

  .el-dialog,
  .el-pager li {
    background: none;
  }

  .number:before {
    content: none;
  }

  .el-input__inner {
    background: none;
    color: #fff;

    span {
      color: #fff;
    }
  }
  .el-range-editor .el-range-input {
    background: none;
    color: #fff;
  }
  .block {
    .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
    .el-date-editor .el-range__icon {
      line-height: 24px;
    }
    .el-date-editor .el-range-separator {
      line-height: 24px;
    }
  }
}
</style>
