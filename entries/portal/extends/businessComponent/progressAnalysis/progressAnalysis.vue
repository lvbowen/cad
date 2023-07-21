<template>
  <div class="progressAnalysis">
    <div class="progress_title">
      <!--      <img @click="toprev" src="../../icon.png" alt="" />-->
      <span>进度分析</span>
    </div>
    <div class="outputValue">
      <div class="outputValue_progress">
        <h4>产值完成情况</h4>
        <div>
          <h5>总产值</h5>
          <el-progress
            :textInside="true"
            :strokeWidth="26"
            :percentage="100"
          ></el-progress>
          <span>{{ totalOutputValue }}万元</span>
          <h5>实际完成产值</h5>
          <el-progress
            :textInside="true"
            :strokeWidth="22"
            :percentage="Number(completeRatio)"
            status="warning"
          ></el-progress>
          <span>{{ completeValue }}万元</span>
          <h5>剩余完成产值</h5>
          <el-progress
            :textInside="true"
            :strokeWidth="22"
            :percentage="Number(leftRatio)"
            status="warning"
          ></el-progress>
          <span>{{ surplusValue }}万元</span>
        </div>
      </div>
      <div class="outputValue_echarts">
        <h4>产值分析</h4>
        <div class="outputValue_line">
          <line-echarts
            :id="'outputValueLinechat'"
            :chartData="outputValueData"
          ></line-echarts>
        </div>
      </div>
    </div>
    <div class="ProgressStatus">
      <div class="ProgressEcharts">
        <pie-charts
          :chartData="ProgressData"
          :id="'investment_echart1'"
        ></pie-charts>
      </div>
      <div class="ProgressEcharts">
        <pie-charts
          :chartData="startData"
          :id="'investment_echart2'"
        ></pie-charts>
      </div>
      <div class="ProgressEcharts">
        <pie-charts
          :chartData="finishedData"
          :id="'investment_echart3'"
        ></pie-charts>
      </div>
    </div>
    <div class="ProgressTable">
      <div class="screen">
        <div class="select">
          <span>进度状态：</span>
          <el-select
            v-model="progressValue"
            placeholder="请选择"
            clearable
            @change="selectProgress"
          >
            <el-option
              v-for="item in progressOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <span>开工状态：</span>
          <el-select
            clearable
            v-model="startValue"
            placeholder="请选择"
            @change="selectStart"
          >
            <el-option
              v-for="item in startOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <span>完工状态：</span>
          <el-select
            clearable
            v-model="finishedValue"
            placeholder="请选择"
            @change="selectEnd"
          >
            <el-option
              v-for="item in finishedOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
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
      </div>
      <div class="tableSelect">
        <div class="table">
          <a-table
            :columns="columns"
            :data-source="tableData"
            :scroll="{ y: 240 }"
            rowKey="id"
            :customRow="handleClick"
            @expandedRowsChange="expandedRowsChange"
            childrenColumnName= "childs"
          />
          <!-- <el-table
            :data="tableData"
            @row-click="handleClick"
            :treeProps="{ children: 'childs', hasChildren: 'hasChildren' }"
            rowKey="planDetailName"
            :defaultSort="{ prop: 'date', order: 'descending' }"
            height="275"
            border
            stripe
            lazy
            :load="loadNode"
            style="width: 100%"
          >

            <el-table-column prop="planDetailName" label="名称">
            </el-table-column>
            <el-table-column prop="planDetailStart" label="计划开始时间">
            </el-table-column>
            <el-table-column prop="planDetailEnd" label="计划完成时间">
            </el-table-column>
            <el-table-column prop="reportStart" label="实际开始时间">
            </el-table-column>
            <el-table-column prop="reportEnd" label="实际完成时间">
            </el-table-column>
            <el-table-column prop="planDetailMoney" label="总产值">
            </el-table-column>
            <el-table-column
              prop="planDetailMoney"
              label="计划完成产值（万元）"
            >
            </el-table-column>
            <el-table-column
              prop="reportDetailMoney"
              label="实际完成产值（万元）"
            >
            </el-table-column>
            <el-table-column prop="progressState" label="进度状态">
            </el-table-column>
            <el-table-column prop="startWorkState" label="开工状态">
            </el-table-column>
            <el-table-column prop="endWorkState" label="完工状态">
            </el-table-column>
          </el-table> -->
        </div>
        <!-- <div style="float: right">
          <el-pagination
            :currentPage.sync="currentPage1"
            :pageSize="5"
            layout="total,prev, pager, next"
            :total="total"
          >
          </el-pagination>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Progress from "element-ui/lib/progress";
import Input from "element-ui/lib/input";
import Select from "element-ui/lib/select";
import Option from "element-ui/lib/option";
// import Pagination from "element-ui/lib/pagination";
import LineEcharts from "../ManageViews/components/LineEcharts";
import PieCharts from "../ManageViews/components/PieCharts";
import env from "@/config/env";
import { Table } from "@h3/antd-vue";
import {
  getdeviation,
  getscheduleAnalyse,
  getscheduleAnalyseTree,
} from "./serve/index.js";

import * as Type from '../../type';
import * as Constant from '../../constant';

export default {
  data() {
    return {
      columns: [
        {
          title: "名称",
          dataIndex: "planDetailName",
          width: 300
        },
        {
          title: "计划开始时间",
          dataIndex: "planDetailStart",
        },
        {
          title: "计划完成时间",
          dataIndex: "planDetailEnd",
        },
        {
          title: "实际开始时间",
          dataIndex: "reportStart",
        },
        {
          title: "实际完成时间",
          dataIndex: "reportEnd",
        },
        {
          title: "计划完成产值（万元）",
          dataIndex: "planDetailMoney",
        },
        {
          title: "实际完成产值（万元）",
          dataIndex: "reportDetailMoney",
        },
        {
          title: "进度状态",
          dataIndex: "progressState",
        },
        {
          title: "开工状态",
          dataIndex: "startWorkState",
        },
        {
          title: "完工状态",
          dataIndex: "endWorkState",
        },
      ],
      tableData: [],
      name: "",
      progressState: "",
      input: "",
      projectName: "",
      startWorkState: "",
      endWorkState: "",
      projectCode: "",
      currentPage1: 1,
      totalOutputValue: 0,
      completeValue: 0,
      surplusValue: 0,
      completeRatio: 0,
      leftRatio: 0,
      total: 10,
      progressOptions: [
        {
          value: "-1",
          label: "未开工",
        },
        {
          value: "1",
          label: "进行中",
        },
        {
          value: "3",
          label: "滞后",
        },
        {
          value: "2",
          label: "预警",
        },
        {
          value: "0",
          label: "已完工",
        },
      ],
      progressValue: "",
      startOptions: [
        {
          value: "2",
          label: "滞后",
        },
        {
          value: "1",
          label: "超前",
        },
        {
          value: "0",
          label: "正常",
        },
      ],
      startValue: "",
      finishedOptions: [
        {
          value: "2",
          label: "滞后",
        },
        {
          value: "1",
          label: "超前",
        },
        {
          value: "0",
          label: "正常",
        },
      ],
      finishedValue: "",
      outputValueData: {
        legend: ["计划总产值", "实际总产值"],
        yName: "总金额（万元）",
        xAxis: [],
        yAxis1: [],
        yAxis2: [],
        textStyle: "#0A0A0A",
        legendColor: "#000",
        formatter: "万元",
        interval: 10,
      },
      ProgressData: {
        tileText: "进度状态占比",
        tileTexts: "",
        right: 420,
        color: [],
        textStyle: "#0A0A0A",
        fontWeight: "700",
        textY: "10",
        radius: ["40%", "60%"],
        center: ["50%", "57%"],
        series: [],
      },
      startData: {
        right: 420,
        tileTexts: "",
        tileText: "开工状态情况",
        textStyle: "#0A0A0A",
        fontWeight: "700",
        textY: "10",
        color: [
          "#00C567",
          "#0096FF",
          "#FFA943",
          "#E271DE",
          "#F8456B",
          "#00FFFF",
          "#4AEAB0",
        ],
        radius: ["40%", "60%"],
        center: ["50%", "57%"],
        series: [],
      },
      finishedData: {
        tileTexts: "",
        textStyle: "#0A0A0A",
        fontWeight: "700",
        textY: "10",
        right: 420,
        color: [
          "#00C567",
          "#0096FF",
          "#FFA943",
          "#E271DE",
          "#F8456B",
          "#00FFFF",
          "#4AEAB0",
        ],
        radius: ["40%", "60%"],
        tileText: "完工状态情况",
        center: ["50%", "57%"],
        series: [],
      },
    };
  },
  inject:['projectConfig'],
  methods: {
    expandedRowsChange(val){
      var nodeid = val[val.length - 1]
      if(val.length > 1) {
        getscheduleAnalyseTree(
          this.projectCode,
          this.progressState,
          this.startWorkState,
          this.endWorkState,
          nodeid,
          this.projectName,
          this.name
        ).then((res) => {
          this.findop(this.tableData ,nodeid , res.data.nodes )
        });
      }
    },
    findop(data, val, arr) {
        if(!data){
          data = []
        }
        for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.id == val) {
          item.childs = arr
        } else {
          this.findop(item.childs, val,arr);
        }
      }
      return data;
    },
    toprev() {
      this.$router.go(-1);
    },
    getinit(id) {
      getdeviation(this.projectCode, id, this.projectName).then((res) => {
        this.outputValueData.xAxis = res.data?.dateAxis;
        res.data?.realValueAxis.forEach(e => {
          e =(e).toFixed(2)
        });
        res.data?.planValueAxis.forEach(e => {
          e =(e).toFixed(2)
        });
        this.outputValueData.yAxis2 = res.data?.realValueAxis;
        this.outputValueData.yAxis1 = res.data?.planValueAxis;
      });
      getscheduleAnalyse(this.projectCode, id, this.projectName).then((res) => {
        if (res.data) {
          this.totalOutputValue = (Number(res.data.nodeAnalyseValue?.totalValue) / 10000).toFixed(2) ;
          this.completeValue = (Number(res.data.nodeAnalyseValue?.completeValue) / 10000 ).toFixed(2) ;
          this.completeRatio = Number(
            res.data.nodeAnalyseValue?.completeRatio * 100
          ).toFixed(2);
          this.surplusValue = (Number(res.data.nodeAnalyseValue?.leftValue) / 10000).toFixed(2);
          this.leftRatio = Number(
            res.data.nodeAnalyseValue?.leftRatio * 100
          ).toFixed(2);
          this.ProgressData.series = res.data.progressStateAnalyse.map(
            (item) => {
              return { value: item.num, name: item.progressStateDesc };
            }
          );
          this.startData.series = res.data.startWorkStateAnalyse.map((item) => {
            return { value: item.num, name: item.startWorkStateDesc };
          });
          this.finishedData.series = res.data.endWorkStateAnalyse.map(
            (item) => {
              return { value: item.num, name: item.endWorkStateDesc };
            }
          );
          this.ProgressData.tileTexts = res.data.progressNodeNum;
          //@ts-ignore
          this.ProgressData.color = []
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
          this.startData.tileTexts = res.data.startWorkNodeNum;
          this.finishedData.tileTexts = res.data.endWorkNodeNum;
        }
      });
    },
    selectProgress(val) {
      this.progressState = val;
      getscheduleAnalyseTree(
        this.projectCode,
        this.progressState,
        this.startWorkState,
        this.endWorkState,
        "",
        this.projectName
      ).then((res) => {
        res.data?.nodes.forEach(e => {
        if(e.planDetailMoney) {
          e.planDetailMoney = (e.planDetailMoney).toFixed(2)
          e.reportDetailMoney = (e.reportDetailMoney).toFixed(2)
        }
      });
        this.tableData = res.data?.nodes;
      });
    },
    selectStart(val) {
      this.startWorkState = val;
      getscheduleAnalyseTree(
        this.projectCode,
        this.progressState,
        this.startWorkState,
        this.endWorkState,
        "",
        this.projectName
      ).then((res) => {
        res.data?.nodes.forEach(e => {
        if(e.planDetailMoney) {
          e.planDetailMoney = (e.planDetailMoney).toFixed(2)
          e.reportDetailMoney = (e.reportDetailMoney).toFixed(2)
        }
      });
        this.tableData = res.data?.nodes;
      });
    },
    selectEnd(val) {
      this.endWorkState = val;
      getscheduleAnalyseTree(
        this.projectCode,
        this.progressState,
        this.startWorkState,
        this.endWorkState,
        "",
        this.projectName
      ).then((res) => {
        res.data?.nodes.forEach(e => {
        if(e.planDetailMoney) {
          e.planDetailMoney = (e.planDetailMoney).toFixed(2)
          e.reportDetailMoney = (e.reportDetailMoney).toFixed(2)
        }
      });
        this.tableData = res.data?.nodes;
      });
    },
    handleClick(val) {
      return {
        on: {
          click:()=>{
             this.getinit(val.id);
          }
        }
      }
    },
    //搜索功能
    searchClick() {
      this.name = this.input;
      getscheduleAnalyseTree(
        this.projectCode,
        this.progressState,
        this.startWorkState,
        this.endWorkState,
        "",
        this.projectName,
        this.input
      ).then((res) => {
        res.data?.nodes.forEach(e => {
        if(e.planDetailMoney) {
          e.planDetailMoney = (e.planDetailMoney).toFixed(2)
          e.reportDetailMoney = (e.reportDetailMoney).toFixed(2)
        }
      });
        this.tableData = [];
        this.tableData = res.data?.nodes;
      });
    },
    clearClick() {
      this.name = this.input;
      getscheduleAnalyseTree(
        this.projectCode,
        this.progressState,
        this.startWorkState,
        this.endWorkState,
        "",
        this.projectName,
        this.input
      ).then((res) => {
        res.data?.nodes.forEach(e => {
        if(e.planDetailMoney) {
          e.planDetailMoney = (e.planDetailMoney).toFixed(2)
          e.reportDetailMoney = (e.reportDetailMoney).toFixed(2)
        }
      });
        this.tableData = res.data?.nodes;
      });
    },
  },
  mounted() {
    //@ts-ignore
    // this.projectName = window.Environment.markName;
    this.projectName = this.projectConfig?.projectName;
    this.projectCode = `${env.project}`;
    this.getinit("");
    getscheduleAnalyseTree(
      this.projectCode,
      this.progressState,
      this.startWorkState,
      this.endWorkState,
      "",
      this.projectName,
      this.name
    ).then((res) => {
      res.data?.nodes.forEach(e => {
        if(e.planDetailMoney) {
          e.planDetailMoney = (e.planDetailMoney).toFixed(2)
          e.reportDetailMoney = (e.reportDetailMoney).toFixed(2)
        }
      });
      this.tableData = res.data?.nodes;
    });
  },
  components: {
    ATable: Table,
    ElProgress: Progress,
    ElSelect: Select,
    ElOption: Option,
    // ElPagination: Pagination,
    ElInput: Input,
    LineEcharts,
    PieCharts,
  },
};
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
  font-family: Source Han Sans CN;
}
.progressAnalysis {
  h4 {
    font-size: 14px;
    font-weight: 700;
    color: #0a0a0a;
  }
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
    height: 25vh;
    box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
    padding: 20px;
    padding-top: 10px;
    .outputValue_progress {
      width: 45%;
      height: 100%;
      h4 {
        margin-bottom: 20px;
      }
      h5 {
        margin-bottom: 5px;
      }
    }
    .outputValue_echarts {
      width: 55%;
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
  .ProgressStatus {
    display: flex;
    height: 25vh;
    background: #ffffff;
    box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
    margin-bottom: 15px;
    padding: 20px;
    .ProgressEcharts {
      flex: 1;
      height: 100%;
    }
  }
  .ProgressTable {
    background: #ffffff;
    height: 36vh;
    box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
    padding: 10px;
    .screen {
      display: flex;
      margin-bottom: 5px;
      .select {
        width: 36%;
      }
      .search {
        width: 17%;
        padding-left: 20px;
        .el-input {
          width: 70%;
          vertical-align: middle;
        }
        .el-button {
          background: none;
          vertical-align: middle;
          padding: 7px 11px;
        }
        .el-input__icon {
          line-height: 37px;
        }
      }
    }
  }
  .tableSelect {
    height: 30vh;
    .table {
      height: 28vh;
    }
  }
}
</style>
<style lang="less">
.progressAnalysis {
  .el-select {
    width: 110px;
    margin-right: 15px;
  }
  .el-input__inner {
    height: 30px;
    line-height: 30px;
    color: #333;
  }
  .el-input__icon {
    line-height: 25px;
  }
  .el-progress-bar__outer {
    border-radius: 0;
  }
  .el-progress-bar__inner {
    border-radius: 0;
  }
  .el-progress-bar {
    margin-bottom: 10px;
  }
  .outputValue_progress {
    .el-progress {
      display: inline-block;
      width: 76%;
      margin-right: 15px;
    }
    span {
      vertical-align: text-bottom;
      font-size: 16px;
      font-weight: 700;
    }
  }
}
</style>
