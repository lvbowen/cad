<template>
  <div class="quailtyInspection">
    <div class="quailty_title">
      <!--      <img @click="toprev" src="../../icon.png" alt="" />-->
      <span>质量检验情况</span>
    </div>
    <div class="quailty_data">
      <div class="data_box" v-for="(item, index) in dataLists" :key="index">
        <h3>{{ item.levelName }}</h3>
        <p>{{ item.count }}</p>
      </div>
    </div>
    <div class="quailty_echarts">
      <div class="quailty_line">
        <div class="echarts_title">
          <h4>质量数量统计</h4>
          <span>日期维度：</span>
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
        <div class="outputValueLinechat">
          <line-echarts
            :id="'outputValueLinechat'"
            :chartData="outputValueData"
          ></line-echarts>
        </div>
      </div>
      <div class="quailty_pie">
        <div class="echarts_title">
          <h4>质检状态统计</h4>
        </div>
        <div class="investment_echart3">
          <pie-charts
            :chartData="finishedData"
            :id="'investment_echart3'"
          ></pie-charts>
        </div>
      </div>
    </div>
    <div class="quailty_table">
      <div class="table_report">
        <div class="echarts_title">
          <h4>质检工作统计</h4>
          <div class="table_input">
            <el-input
              placeholder="请输入内容"
              @clear="clearClick"
              v-model="input"
              clearable>
            </el-input>
            <img @click="searchClick" src="./img/search.png" alt="" />
          </div>
        </div>
        <el-table
          :data="tableData"
          @row-click="handleTreeCLick"
          rowKey="id"
          defaultExpandAll
          :treeProps="{children: 'childs'}"
          stripe
          style="width: 100%"
          height="400">
          <el-table-column prop="name" label="工程部位"> </el-table-column>
          <el-table-column prop="totalNum" label="总表单数"> </el-table-column>
          <el-table-column prop="waitNum" label="未填报表单"> </el-table-column>
          <el-table-column prop="auditNum" label="审核中表单">
          </el-table-column>
          <el-table-column prop="completeNum" label="已归档表单">
          </el-table-column>
          <el-table-column prop="doneRatio" label="已填报进度">
            <template slot-scope="scope">
              <el-progress
                type="line"
                :percentage="Number((scope.row.doneRatio * 100).toFixed(2))"
              ></el-progress>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import LineEcharts from "../ManageViews/components/LineEcharts";
import PieCharts from "../ManageViews/components/PieCharts";
import DatePicker from "element-ui/lib/date-picker";
import Input from "element-ui/lib/input";
import Progress from "element-ui/lib/progress";
import env from "@/config/env";
import { getAnalyseProject, getBizHandle, getAnalyseNode } from "./index.js";
export default {
  components: {
    ElDatePicker: DatePicker,
    ElProgress: Progress,
    ElInput: Input,
    LineEcharts,
    PieCharts,
  },

  inject:['projectConfig'],
  data() {
    return {
      tableData: [],
      value2: "",
      pickerOptions: {
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
      },
      input: "",
      axisType: 3,
      projectName: "",
      dataLists: [],
      startime: "",
      endtime: "",
      projectCode: "",
      outputValueData: {
        legend: ["质量检验数"],
        yName: "个数",
        xAxis: [],
        yAxis3: [],
        textStyle: "#0A0A0A",
        legendColor: "#000",
        formatter: "个",
      },
      finishedData: {
        orient: "horizontal",
        tileTexts: "",
        textStyle: "#0A0A0A",
        fontWeight: "700",
        // textY: "10",
        right: 30,
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
        // tileText: "完工状态情况",
        center: ["50%", "40%"],
        series: [
          {
            name:"未填报",value:0
          },
          {
            name:"审核中",value:0
          },
          {
            name:"已归档",value:0
          },
        ],
      },
    };
  },
  methods: {
    handleTreeCLick(val){
      console.log(val);
      if(val.childs.length == 0) {
        getAnalyseNode(this.projectCode, this.projectName,"",val.id,val.level).then((res) => {
          if(res.data.length !== 0){
        val.childs = res.data;
          }
      });
      }
    },
    //选择时间
    handlePick(val) {
      this.startime = val[0];
      this.endtime = val[1];
      getBizHandle(this.projectCode, this.projectName,this.startime,this.endtime).then((res) => {
        this.outputValueData.xAxis = [];
        this.outputValueData.yAxis3 = [];
        res.data.timeCount.forEach((e) => {
          this.outputValueData.xAxis.push(e.time);
          this.outputValueData.yAxis3.push(e.num);
        });
      });
    },
    searchClick() {
      getAnalyseNode(this.projectCode, this.projectName ,this.input).then((res) => {
        this.tableData = res.data;
      });
    },
    clearClick() {
      getAnalyseNode(this.projectCode, this.projectName).then((res) => {
        this.tableData = res.data;
      });
    },
    toprev() {
      this.$router.go(-1);
    },
    getinit(appCode, projectName) {
      getAnalyseProject(appCode, projectName).then((res) => {
        if (res.data) {
          this.dataLists = res.data.qbsNodeDataCount;
          this.finishedData.series[0].value = res.data.bizSheetDataCount[0].count
          this.finishedData.series[1].value = res.data.bizSheetDataCount[1].count
          this.finishedData.series[2].value = res.data.bizSheetDataCount[2].count
        }
      });
      getBizHandle(appCode, projectName,this.startime,this.endtime).then((res) => {
        this.outputValueData.xAxis = [];
        this.outputValueData.yAxis3 = [];
        res.data.timeCount.forEach((e) => {
          this.outputValueData.xAxis.push(e.time);
          this.outputValueData.yAxis3.push(e.num);
        });
      });
      getAnalyseNode(appCode, projectName).then((res) => {
        this.tableData = res.data;
      });
    },
  },
  mounted() {
    this.projectName = this.projectConfig.projectName;
    // this.projectName = window.Environment.markName;
    this.projectCode = `${env.project}`;
    this.getinit(this.projectCode, this.projectName);
  },
};
</script>

<style lang="less" scoped>
* {
  font-family: Source Han Sans CN;
}
.quailtyInspection {
  .echarts_title {
    display: flex;
    height: 35px;
    background: #f8fbff;
    line-height: 35px;
    padding-left: 20px;
    span {
      margin-left: auto;
    }
    h4 {
      color: #0a0a0a;
      font-weight: 700;
      width: 20%;
    }
    .table_input {
      img {
        cursor: pointer;
      }
    }
  }
  .quailty_title {
    padding-left: 2px;
    font-size: 14px;
    font-weight: 700;
    color: #0a0a0a;
    margin-bottom: 20px;
    img {
      width: 19px;
      height: 19px;
      cursor: pointer;
    }
  }
  .quailty_data {
    display: flex;
    margin-bottom: 10px;
    .data_box {
      flex: 1;
      margin-right: 15px;
      height: 68px;
      background: #ffffff;
      border: 1px solid #e8e8e8;
      box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
      line-height: 68px;
      text-align: center;
      h3 {
        display: inline-block;
        color: #0a0a0a;
        font-size: 20px;
        font-weight: 700;
        vertical-align: middle;
      }
      p {
        display: inline-block;
        color: #004898;
        font-size: 32px;
        font-weight: 700;
        vertical-align: middle;
        margin-left: 20px;
      }
    }
  }
  .quailty_echarts {
    display: flex;
    width: 100%;
    height: 270px;
    margin-bottom: 10px;
    .quailty_line {
      width: 79%;
      margin-right: 10px;
      background: #fff;
      .outputValueLinechat {
        height: 85%;
      }
    }
    .quailty_pie {
      width: 19.5%;
      background: #fff;
      .investment_echart3 {
        height: 85%;
      }
    }
  }
  .quailty_table {
    display: flex;
    height: 470px;
    .table_report {
      width: 100%;
      margin-right: 10px;
      background: #fff;
    }
  }
}
</style>

<style lang="less">
.echarts_title {
  .el-input__inner {
    height: 30px;
    line-height: 30px;
  }
  .el-input__icon {
    line-height: 30px;
  }
  .table_input {
    width: 93%;
    display: inline-block;
    text-align: right;
    .el-input {
      width: 20%;
    }
  }
}
</style>
