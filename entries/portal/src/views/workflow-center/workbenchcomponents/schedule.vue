<template>
  <el-card shadow="hover" class="card">
    <div slot="header" class="clearfix">
      <span class="card_title">进度管理</span>
      <el-button v-if="false" style="float: right; margin-right: 20px" type="text">操作按钮&nbsp;&gt;</el-button>
    </div>
    <div class="container">
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
      <div class="ProgressStatus">
        <pie-charts
          :chartData="ProgressData"
          :id="'investment_echart1'"
        >
        </pie-charts>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, InjectReactive } from "vue-property-decorator";
import Progress from "element-ui/lib/progress";
import Card from "element-ui/lib/card";
import LineEcharts from "../../../../extends/businessComponent/ManageViews/components/LineEcharts.vue";
import PieCharts from "../../../../extends/businessComponent/ManageViews/components/PieCharts.vue";
import env from "@/config/env";
import {
  getdeviation,
  getscheduleAnalyse,
  getscheduleAnalyseTree,
} from "../../../../extends/businessComponent/progressAnalysis/serve/index";
import * as Type from "../../../../extends/type";
@Component({
  name: "Schedule",
  components: {
    ElProgress: Progress,
    LineEcharts,
    PieCharts,
    ElCard:Card,
  },
})
export default class Schedule extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  projectCode="";
  projectName:string|null|undefined="";
  totalOutputValue:string="0";
  completeValue:string="0";
  surplusValue:string="0";
  completeRatio:string="0";
  leftRatio:string="0";
  total=10;
  outputValueData= {
        legend: ["计划总产值", "实际总产值"],
        yName: "总金额（万元）",
        xAxis: [],
        yAxis1: [],
        yAxis2: [],
        textStyle: "#0A0A0A",
        legendColor: "#000",
        formatter: "万元",
  };
  ProgressData= {
        tileText: "进度状态占比",
        tileTexts: "",
        right: 420,
        color:[] as any,
        textStyle: "#0A0A0A",
        fontWeight: "700",
        textY: "10",
        radius: ["40%", "60%"],
        center: ["50%", "57%"],
        series: []as any,
  };
  startData= {
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
  };
  finishedData= {
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
  }
  mounted(){
    this.projectName = this.projectConfig?.projectName;
    this.projectCode = `${env.project}`;
    this.getinit("");
  }
  getinit(id) {
    getdeviation(this.projectCode, id, this.projectName).then((res) => {
      this.outputValueData.xAxis = res.data.dateAxis;
      res.data.realValueAxis.forEach(e => {
        e =(e).toFixed(2)
      });
      res.data.planValueAxis.forEach(e => {
        e =(e).toFixed(2)
      });
      this.outputValueData.yAxis2 = res.data.realValueAxis;
      this.outputValueData.yAxis1 = res.data.planValueAxis;
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
  }
    
}
</script>

<style lang="less" scoped>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
.card {
  margin: 10px;
  /deep/.el-card__header {
    font-size: 17px;
    font-weight: 700;
    padding: 0;
    height: 40px;
    border-bottom: 0;
    .card_title {
      display: inline-block;
      padding-left: 20px;
      line-height: 40px;
      border-bottom: 1px solid #ebeef5;
    }
  }
}
.container{
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  // align-items: center;
  width: 100%;
  h4 {
    font-size: 14px;
    font-weight: 700;
    color: #0a0a0a;
  }
  .outputValue_progress{
    flex: 1.8;
  }
  .outputValue_echarts{
    flex: 2;
    h4 {
      padding-left: 38px;
      margin-bottom: 10px;
    }
    .outputValue_line {
        // width: 100%;
      height: 100%;
    }
  }
  .ProgressStatus{
    flex: 1;
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
    // height: 25vh;
    // box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
    // padding: 20px;
    // padding-top: 10px;
    .outputValue_progress {
      flex: 1;
      h4 {
        margin-bottom: 20px;
      }
      h5 {
        margin-bottom: 5px;
      }
    }
  }
  /deep/.ProgressStatus {
    display: flex;
    height: 25vh;
    background: #ffffff;
    margin-bottom: 15px;
    padding: 20px;
    .ProgressEcharts {
      flex: 1;
      height: 100%;
    }
  }
  /deep/.el-progress-bar__outer {
    border-radius: 0;
  }
  /deep/.el-progress-bar__inner {
    border-radius: 0;
  }
  .el-progress-bar {
    margin-bottom: 10px;
  }
  .outputValue_progress {
    /deep/.el-progress {
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