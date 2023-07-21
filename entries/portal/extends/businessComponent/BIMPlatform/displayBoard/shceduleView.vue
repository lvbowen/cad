<template>
  <div class="ProgressOverview">
    <div class="ProgressOverviewLeft">
      <div class="CompletionOutput">
        <h3>总进度计划</h3>
        <div class="ConstructionPeriod">
          <p>总工期：</p>
          <span>{{ planDetailPeriod }}</span>
          <span>天数</span>
        </div>
        <div class="Construction">
          <p>已施工：</p>
          <span>{{ reportDetailPeriod }}</span>
          <span>天数</span>
        </div>
      </div>
      <div class="fillingInformation">
        <div class="fill_title">
          <h3>进度产值统计</h3>
        </div>
        <div class="fillecharts">
          <p v-if="isShowModelClick" @click="showFillModelClick">{{ showFillModelTitle }}</p>
          <p v-if="isShowModelClick" @click="fillModelClick">{{ fillModelTitle }}</p>
          <pie-charts
            :chartData="investmentData1"
            :id="'investment_echart1'"
            @contractName="fillingEchart($event)"
          ></pie-charts>
        </div>
      </div>
      <div class="message">
        <div class="fill_title">
          <h3>进度状态分析</h3>
        </div>
        <div class="messagEcharts">
          <p v-if="isShowModelClick" @click="showMessageModelClick">{{ showScheduleModelTitle }}</p>
          <p v-if="isShowModelClick" @click="messageModelClick">{{ scheduleModelTitle }}</p>
          <pie-charts
            :chartData="investmentData2"
            :id="'investment_echart2'"
            @contractName="messagEchart($event)"
          ></pie-charts>
        </div>
      </div>
    </div>
    <div class="ProgressOverviewRight">
      <div class="CompletionOutput">
        <div class="outputTitle">
          <h3>产值完成情况</h3>
          <div class="outputCheck">
            <span @click="yearClick" :style="{ background: yearBackGround }">
              年
            </span>
            <span @click="monthClick" :style="{ background: monthBackGround }">
              月
            </span>
          </div>
        </div>
        <div class="outputFinsh">
          <bar-echarts
            :id="'finshed'"
            :chartData="finshedData2"
            @contractName="finshechart($event)"
          ></bar-echarts>
        </div>
      </div>
      <div class="fillingInformation">
        <h3>产值填报情况</h3>
        <div class="fillecharts">
          <line-echarts
            @contractName="fillechart($event)"
            :id="'fill'"
            :chartData="fillData2"
          ></line-echarts>
        </div>
      </div>
      <div class="message">
        <div class="messageNotice">
          <h3>消息通知</h3>
          <div class="messageCheck">
            <span @click="construction" :style="{ color: spancolor1 }">
              施工内容
            </span>
            <span @click="warning" :style="{ color: spancolor2 }">
              预警通知
            </span>
          </div>
        </div>
        <!-- 施工内容 -->
        <div v-if="!tableShow" class="messageTable">
          <el-scrollbar style="height: 100%">
            <el-table
              :data="reportsData"
              style="width: 100%; margin-bottom: 20px"
              rowKey="id"
              border
              @row-click="handleReportsClick"
              defaultExpandAll
              :treeProps="{ children: 'children', hasChildren: 'hasChildren' }"
            >
              <el-table-column prop="name" label="构建名称"> </el-table-column>
              <el-table-column prop="num" label="数量"> </el-table-column>
              <el-table-column prop="reportTime" label="填报日期">
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </div>
        <!-- 预警通知 -->
        <div v-if="tableShow" class="messageTable">
          <el-scrollbar style="height: 100%">
            <el-table
              :data="alarmsData"
              style="width: 100%; margin-bottom: 20px"
              rowKey="id"
              border
              defaultExpandAll
              :treeProps="{ children: 'children', hasChildren: 'hasChildren' }"
            >
              <el-table-column prop="name" label="任务名称"> </el-table-column>
              <el-table-column prop="alarmTime" label="预警时间">
              </el-table-column>
              <el-table-column prop="source" label="预警来源">
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import BarEcharts from "../Echarts/BarEcharts.vue";
import LineEcharts from "../Echarts/LineEcharts.vue";
import PieCharts from "../../ManageViews/components/PieCharts.vue";
import env from "@/config/env";
import {
  getscheduleAnalyseValue,
  getscheduleAnalyseState,
  getscheduleAnalyseBimState,
} from "../server/index.js";
@Component({
  name: "shceduleView",
  components: {
    BarEcharts,
    LineEcharts,
    PieCharts,
  },
})
export default class shceduleView extends Vue {
  tableShow: boolean = false;
  AllmodelShow: boolean = true;
  isShowModelClick: boolean = true;
  AllfillmodelShow: boolean = true;
  spancolor1: string = "";
  spancolor2: string = "";
  yearBackGround: string = "";
  monthBackGround: string = "";
  projectCode: string = "";
  scheduleModel: string = "";
  showFillModelTitle: string = "模型显示";
  fillModelTitle: string = "进度状态";
  showScheduleModelTitle: string = "模型显示";
  scheduleModelTitle: string = "进度状态";
  fillingModel: string = "";
  projectName: string = "";
  finshModel: object = {};
  fillModel: object = {};
  scheduleData: Array<object> = [];
  fillingData: any;
  stateData: Array<object> = [];
  fillData: Array<object> = [];
  scheduleAllModel: Array<object> = [];
  planDetailPeriod: string = "";
  reportDetailPeriod: string = "";
  alarmsData: Array<object> = [];
  reportsData: Array<object> = [];
  investmentData1: object = {
    tileText: "",
    right: 50,
    orient: "horizontal",
    formatter: "万元",
    color: ["#26C974", "#FF0042"],
    radius: ["40%", "60%"],
    series: [
      { value: 0, name: "完成产值" },
      { value: 0, name: "剩余产值" },
    ],
  };
  investmentData2: object = {
    tileText: "",
    orient: "horizontal",
    right: 50,
    color: [],
    radius: ["40%", "60%"],
    series: [],
  };
  finshedData2: object = {
    xAxis: [],
    yAxis1: [],
    yAxis2: [],
    legendData: ["实际完成产值", "计划完成产值"],
  };
  fillData2: object = {
    xAxis: [],
    yAxis: [],
    legendData: ["产值"],
  };
  // 表格点击事件
  handleReportsClick(val) {
    this.$emit("getReportModel", val.model);
  }
  construction() {
    this.tableShow = false;
    this.spancolor1 = "#31ABE3";
    this.spancolor2 = "#fff";
  }
  warning() {
    this.tableShow = true;
    this.spancolor1 = "#fff";
    this.spancolor2 = "#31ABE3";
  }
  messagEchart(val) {
    this.scheduleData.forEach((e) => {
      //@ts-ignore
      if (e.model) {
        //@ts-ignore
        if (val.value == e.num && val.name == e.progressStateDesc) {
          //@ts-ignore
          this.scheduleModel = e.model;
        }
      }
    });
    this.$emit("getscheduleModel", this.scheduleModel);
  }
  fillingEchart(val) {
    if (this.fillingData) {
      //@ts-ignore
      if (val.dataIndex == 0) {
        //@ts-ignore
        this.fillingModel = this.fillingData.completeModel;
      } else if (val.dataIndex == 1) {
        //@ts-ignore
        this.fillingModel = this.fillingData.leftModel;
      }
    }
    this.$emit("getfillingModel", this.fillingModel);
  }
  finshechart(val) {
    if (val.seriesName == "实际完成产值") {
      this.stateData.forEach((e) => {
        //@ts-ignore
        if(e.model) {
        //@ts-ignore
        if (val.data == e.value && val.name == e.date) {
          //@ts-ignore
          this.finshModel = e.model;
        }
        }
      });
      this.$emit("getfinshModel", this.finshModel);
    }
  }
  fillechart(val) {
    this.fillData.forEach((e) => {
      //@ts-ignore
      if(e.model) {
      //@ts-ignore
      if (val.data == e.value && val.name == e.date) {
        //@ts-ignore
        this.fillModel = e.model;
      }
      }
    });
    this.$emit("getfillModel", this.fillModel);
  }

  //进度产值所有模型显示
  showFillModelClick(){
    this.AllfillmodelShow = !this.AllfillmodelShow;
    this.AllmodelShow = true;
    if (this.AllfillmodelShow) {
      this.showFillModelTitle = "模型显示";
      this.$emit("clearModel", "releaseModelSchedule");
    } else {
      this.showFillModelTitle = "取消显示";
      this.fillModelTitle = "进度状态";
      this.scheduleModelTitle = "进度状态";
      this.showScheduleModelTitle = "模型显示";
      //@ts-ignore
      this.scheduleAllModel = [];
      //@ts-ignore
      this.scheduleAllModel.push(this.fillingData.leftModel??"",this.fillingData.completeModel??"");
      this.$emit("getControlModelDisplay", this.scheduleAllModel);
    }
  }
  //进度产值所有模型进度状态显示（颜色区分）
  fillModelClick() {
    this.AllfillmodelShow = !this.AllfillmodelShow;
    this.AllmodelShow = true;
    if (this.AllfillmodelShow) {
      this.fillModelTitle = "进度状态";
      this.$emit("clearModel", "releaseModelSchedule");
    } else {
      this.fillModelTitle = "取消显示";
      this.showFillModelTitle = "模型显示";
      this.scheduleModelTitle = "进度状态";
      this.showScheduleModelTitle = "模型显示";
      //@ts-ignore
      this.scheduleAllModel = [];
      //@ts-ignore
      this.scheduleAllModel.push(this.fillingData.leftModel??"",this.fillingData.completeModel??"");
      this.$emit("getAllModel", this.scheduleAllModel);
    }
  }
  //进度状态全部模型显示
  showMessageModelClick(){
    this.AllfillmodelShow = !this.AllfillmodelShow;
    this.AllmodelShow = true;
    if (this.AllfillmodelShow) {
      this.showScheduleModelTitle = "模型显示";
      this.$emit("clearModel", "releaseModelSchedule");
    } else {
      this.showScheduleModelTitle = "取消显示";
      this.scheduleModelTitle = "进度状态";
      this.fillModelTitle = "进度状态";
      this.showFillModelTitle = "模型显示";
      //@ts-ignore
      this.scheduleAllModel = [];
      this.scheduleData.forEach((e) => {
        //@ts-ignore
        if (e.model) {
          //@ts-ignore
          this.scheduleAllModel.push(e.model);
        }
      });
      this.$emit("getControlModelDisplay", this.scheduleAllModel);
    }
  }
  //进度状态所有模型进度状态显示（颜色区分）
  messageModelClick() {
    this.AllmodelShow = !this.AllmodelShow;
    this.AllfillmodelShow = true;
    if (this.AllmodelShow) {
      this.scheduleModelTitle = "进度状态";
      this.$emit("clearModel", "releaseModelSchedule");
    } else {
      this.scheduleModelTitle = "取消显示";
      this.showScheduleModelTitle = "模型显示";
      this.fillModelTitle = "进度状态";
      this.showFillModelTitle = "模型显示";
      //@ts-ignore
      this.scheduleAllModel = [];
      this.scheduleData.forEach((e) => {
        //@ts-ignore
        if (e.model) {
          //@ts-ignore
          this.scheduleAllModel.push(e.model);
        }
      });
      this.$emit("getAllModel", this.scheduleAllModel);
    }
  }
  yearClick() {
    this.yearBackGround = "#2970ff";
    this.monthBackGround = "rgba(180, 195, 222, 0.5)";
    getscheduleAnalyseValue(this.projectCode, 0, this.projectName).then(
      (res) => {
        this.stateData = res.data.realValueAxis ?? [];
        //@ts-ignore
        this.finshedData2.xAxis = res.data.dateAxis ?? [];
        //@ts-ignore
        this.finshedData2.yAxis1 = [];
        //@ts-ignore
        this.finshedData2.yAxis2 = [];
        res.data.realValueAxis?.forEach((element) => {
          //@ts-ignore
          // if(element.value) {
          //@ts-ignore
          this.finshedData2.yAxis1.push(element.value / 10000);
          // }
        });
        res.data.planValueAxis?.forEach((element) => {
          //@ts-ignore
          // if(element.value) {
           //@ts-ignore
          this.finshedData2.yAxis2.push(element.value / 10000);
        //  }
        });
      }
    );
  }
  monthClick() {
    this.monthBackGround = "#2970ff";
    this.yearBackGround = "rgba(180, 195, 222, 0.5)";
    getscheduleAnalyseValue(this.projectCode, 1, this.projectName).then(
      (res) => {
        this.stateData = res.data.realValueAxis ?? [];
        //@ts-ignore
        this.finshedData2.xAxis = res.data.dateAxis;
        //@ts-ignore
        this.finshedData2.yAxis1 = [];
        //@ts-ignore
        this.finshedData2.yAxis2 = [];
        res.data.realValueAxis?.forEach((element) => {
          //@ts-ignore
          // if(element.value) {
          //@ts-ignore
          this.finshedData2.yAxis1.push(element.value / 10000);
          // }
        });
        res.data.planValueAxis?.forEach((element) => {
             //@ts-ignore
          // if(element.value) {
          //@ts-ignore
          this.finshedData2.yAxis2.push(element.value / 10000);
          // }
        });
      }
    );
  }
  getinit() {
    getscheduleAnalyseValue(this.projectCode, 0, this.projectName).then(
      (res) => {
        this.stateData = res.data.realValueAxis ?? [];
        //@ts-ignore
        this.finshedData2.xAxis = res.data.dateAxis;
        //@ts-ignore
        this.finshedData2.yAxis1 = [];
        //@ts-ignore
        this.finshedData2.yAxis2 = [];
        res.data.realValueAxis?.forEach((element) => {
          //@ts-ignore
          // if(element.value) {
          //@ts-ignore
          this.finshedData2.yAxis1.push(element.value / 10000);
          // }
        });
        res.data.planValueAxis?.forEach((element) => {
          //@ts-ignore
          //  if(element.value) {
            //@ts-ignore
          this.finshedData2.yAxis2.push(element.value / 10000);
          // }
        });
      }
    );
    getscheduleAnalyseState(this.projectCode, "", this.projectName).then(
      (res) => {
        console.log(res.data.nodeAnalyseValue);
        this.scheduleData = res.data.progressStateAnalyse;
        this.fillingData = res.data.nodeAnalyseValue;
        this.planDetailPeriod = res.data.nodeAnalyseValue.planDetailPeriod;
        this.reportDetailPeriod = res.data.nodeAnalyseValue.reportDetailPeriod;
        //@ts-ignore
        this.investmentData2.series = res.data.progressStateAnalyse.map(
          (item) => {
            return { value: item.num, name: item.progressStateDesc };
          }
        );
        //@ts-ignore
        this.investmentData2.series.forEach((e) => {
          if (e.name == "未开工") {
            //@ts-ignore
            this.investmentData2.color.push("#C2C2C2");
          }
          if (e.name == "进行中") {
            //@ts-ignore
            this.investmentData2.color.push("#377EFF");
          }
          if (e.name == "滞后") {
            //@ts-ignore
            this.investmentData2.color.push("#FF0042");
          }
          if (e.name == "预警") {
            //@ts-ignore
            this.investmentData2.color.push("#F1B500");
          }
          if (e.name == "已完工") {
            //@ts-ignore
            this.investmentData2.color.push("#26C974");
          }
        });
        //@ts-ignore
        this.investmentData1.series[0].value =
          (res.data.nodeAnalyseValue.completeValue / 10000) ?? 0;
        //@ts-ignore
        this.investmentData1.series[1].value =
          (res.data.nodeAnalyseValue.leftValue / 10000) ?? 0;
      }
    );
    getscheduleAnalyseBimState(this.projectCode, this.projectName).then(
      (res) => {
        this.fillData = res.data.realValueAxis;
        this.alarmsData = res.data.alarms;
        this.reportsData = res.data.reports;
        //@ts-ignore
        this.fillData2.yAxis = [];
        //@ts-ignore
        this.fillData2.xAxis = res.data.dateAxis;
        res.data.realValueAxis?.forEach((element) => {
          //@ts-ignore
          // if(element.value) {
          //@ts-ignore
          this.fillData2.yAxis.push(element.value);
          // }
        });
      }
    );
  }
  mounted() {
    this.projectCode = `${env.project}`;
    if(this.projectCode == "CH") {
      this.isShowModelClick = false
    }
    //@ts-ignore
    this.projectName = this.$route.query.projectName;
    this.getinit();
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
.ProgressOverviewLeft {
  position: absolute;
  left: 1%;
  margin-top: 17px;
  width: 334px;
  height: 850px;
  padding: 10px;
  background: rgba(6, 8, 22, 0.7);
  .CompletionOutput {
    height: 30%;
    width: 100%;
    h3 {
      font-weight: bold;
      flex: 1;
      height: 8%;
      padding-bottom: 35px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    }
    p {
      font-size: 16px;
    }
    .ConstructionPeriod {
      width: 100%;
      height: 40%;
      padding: 20px;

      :nth-child(2) {
        font-size: 36px;
        color: #ffa800;
        padding-left: 50px;
        margin-right: 10px;
      }
    }
    .Construction {
      width: 100%;
      height: 40%;
      padding: 20px;
      :nth-child(2) {
        font-size: 36px;
        color: #3fcf2c;
        padding-left: 50px;
        margin-right: 10px;
      }
    }
  }
  .fillingInformation {
    height: 35%;
    width: 100%;
    .fillecharts {
      height: 89%;
      width: 100%;
      position: relative;
      p:nth-of-type(1){
        right: 72px;
      }
      p:nth-of-type(2){
        right: 5px;
      }
      p {
        position: absolute;
        top: 5px;
        background: #2970ff;
        width: 20%;
        line-height: 24px;
        height: 24px;
        border-radius: 4px;
        text-align: center;
        cursor: pointer;
        z-index: 99;
      }
    }
    .fill_title {
      display: flex;
      height: 11%;
      border-bottom: 1px solid rgba(255, 255, 255, 0.4);
      h3 {
        width: 80%;
        font-weight: bold;
      }
    }
  }
  .message {
    height: 35%;
    width: 100%;
    .messagEcharts {
      height: 89%;
      width: 100%;
      position: relative;
      p:nth-of-type(1){
        right: 72px;
      }
      p:nth-of-type(2){
        right: 5px;
      }
      p {
        position: absolute;
        top: 5px;
        background: #2970ff;
        width: 20%;
        line-height: 24px;
        height: 24px;
        border-radius: 4px;
        text-align: center;
        cursor: pointer;
        z-index: 99;
      }
    }
    .fill_title {
      display: flex;
      height: 11%;
      border-bottom: 1px solid rgba(255, 255, 255, 0.4);
      h3 {
        width: 80%;
        font-weight: bold;
      }
    }
  }
}
.ProgressOverviewRight {
  position: absolute;
  right: 1%;
  margin-top: 17px;
  width: 334px;
  height: 850px;
  padding: 10px;
  background: rgba(6, 8, 22, 0.7);
  h3 {
    font-weight: bold;
    flex: 1;
  }
  .CompletionOutput {
    height: 33%;
    width: 100%;
    .outputFinsh {
      height: 90%;
      width: 100%;
    }

    .outputTitle {
      display: flex;
      height: 8%;
      padding-bottom: 35px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.4);
      .outputCheck {
        width: 30%;
        :nth-child(1) {
          background: #2970ff;
        }
        span {
          display: inline-block;
          width: 22px;
          height: 22px;
          background: rgba(180, 195, 222, 0.5);
          border-radius: 4px;
          text-align: center;
          margin-right: 15px;
          cursor: pointer;
        }
      }
    }
  }
  .fillingInformation {
    height: 33%;
    width: 100%;
    .fillecharts {
      height: 90%;
      width: 100%;
    }
    h3 {
      height: 8%;
      padding-bottom: 35px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    }
  }
  .message {
    height: 33%;
    width: 100%;
    .messageNotice {
      display: flex;
      height: 8%;
      margin-bottom: 10px;
      padding-bottom: 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    }
    .messageCheck {
      flex: 1;
      :nth-child(1) {
        color: #31abe3;
      }
      span {
        margin-right: 10px;
        cursor: pointer;
      }
    }
    .messageTable {
      height: 86%;
      width: 100%;
    }
  }
}
</style>
<style lang="less">
.ProgressOverview {
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
}
</style>
