<template>
  <div class="progress_analy_mobile">
    <apptitle :title="'进度分析'"></apptitle>
    <div class="title_description">
      <div>
        <img src="../../Img/icon_kgrq@2x.png" alt="" />
        <h4>
          <p>{{ beginDate }}</p>
          <p>开工日期</p>
        </h4>
      </div>
      <div>
        <img src="../../Img/icon_zgq@2x.png" alt="" />
        <h4>
          <p>{{ totalDays }}天</p>
          <p>总工期</p>
        </h4>
      </div>
      <div>
        <img src="../../Img/icon_ysg@2x.png" alt="" />
        <h4>
          <p>{{ workDays }}天</p>
          <p>已施工</p>
        </h4>
      </div>
    </div>
    <!-- 饼状图 -->
    <div class="pie_situation">
      <el-carousel :autoplay="false">
        <el-carousel-item>
          <pie-charts
            :chartData="ProgressData"
            :id="'investment_echart0'"
          ></pie-charts>
        </el-carousel-item>
        <el-carousel-item>
          <pie-charts
            :chartData="startData"
            :id="'investment_echart1'"
          ></pie-charts>
        </el-carousel-item>
        <el-carousel-item>
          <pie-charts
            :chartData="finishedData"
            :id="'investment_echart2'"
          ></pie-charts>
        </el-carousel-item>
      </el-carousel>
      <!-- <div class="ProgressEcharts">
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
      </div> -->
    </div>
    <!-- 进度条 -->
    <div class="outputValue">
      <contentbox :title="'产值完成情况'"></contentbox>
      <div class="outputValue_progress">
        <h5>总产值</h5>
        <div style="display: flex">
          <el-progress
            :textInside="true"
            :strokeWidth="26"
            :percentage="100"
          ></el-progress>
          <span>{{ totalOutputValue }}万元</span>
        </div>
        <h5>实际完成产值</h5>
        <div style="display: flex">
          <el-progress
            :textInside="true"
            :strokeWidth="22"
            :percentage="Number(completeRatio)"
            status="warning"
          ></el-progress>
          <span>{{ completeValue }}万元</span>
        </div>
        <h5>剩余完成产值</h5>
        <div style="display: flex">
          <el-progress
            :textInside="true"
            :strokeWidth="22"
            :percentage="Number(leftRatio)"
            status="warning"
          ></el-progress>
          <span>{{ surplusValue }}万元</span>
        </div>
      </div>
    </div>
    <!-- 折线图 -->
    <div class="outputValueAnalysis">
      <contentbox :title="'产值分析'"></contentbox>
      <div class="outputValue_line">
        <line-echarts
          :id="'outputValueLinechat'"
          :chartData="outputValueData"
        ></line-echarts>
      </div>
    </div>
  </div>
</template>

<script>
import apptitle from "../components/appTitle.vue";
import Progress from "element-ui/lib/progress";
import contentbox from "../components/contentBoxs.vue";
import Carousel from "element-ui/lib/carousel";
import CarouselItem from "element-ui/lib/carousel-item";
import LineEcharts from "./components/LineEcharts";
import PieCharts from "./components/PieCharts";
import env from "@/config/env";
import {
  getdeviation,
  getscheduleAnalyse,
} from "./index.js";
import { getscheduleAnalyseState } from "./index.js";
import { getScheduleAnalyseDate } from "../service/index.js"
export default {
  data() {
    return {
      outputValueData: {
        legend: ["计划总产值", "实际总产值"],
        yName: "万元",
        xAxis: [],
        yAxis1: [],
        yAxis2: [],
        textStyle: "#333",
        legendColor: "#000",
        formatter: "万元",
      },
      ProgressData: {
        tileText: "进度状态占比",
        tileTexts: "",
        textsY: 120,
        right: 20,
        color: [],
        textStyle: "#0A0A0A",
        fontWeight: "700",
        textY: "10",
        radius: ["40%", "60%"],
        center: ["50%", "57%"],
        series: [],
      },
      startData: {
        right: 20,
        tileTexts: "",
        tileText: "开工状态情况",
        textStyle: "#0A0A0A",
        fontWeight: "700",
        textsY: 120,
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
        center: ["50%", "55%"],
        series: [],
      },
      finishedData: {
        tileTexts: "",
        textStyle: "#0A0A0A",
        fontWeight: "700",
        textsY: 120,
        textY: "10",
        right: 20,
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
      totalOutputValue: 1.46,
      completeValue: 1.24,
      surplusValue: 100,
      completeRatio: 50,
      leftRatio: 55,
      projectName:"",
      projectCode:"",
      workDays:"",
      beginDate:"",
      nodeId:"",
      totalDays:"",
    };
  },
  components: {
    apptitle,
    contentbox,
    ElProgress: Progress,
    ElCarouselItem: CarouselItem,
    ElCarousel: Carousel,
    LineEcharts,
    PieCharts,
  },
  inject: ["projectConfig"],
  mounted() {
    // this.projectName = sessionStorage.getItem("projectname");
    this.projectName = this.projectConfig?.projectName??"";
    this.projectCode = `${env.project}`;
    getdeviation(this.projectCode, "", this.projectName).then((res) => {
      this.outputValueData.xAxis = res.data.dateAxis;
      this.outputValueData.yAxis2 = []
      this.outputValueData.yAxis1 = []
      res.data.realValueAxis.forEach((e) => {
        e = (e / 10000).toFixed(2);
        this.outputValueData.yAxis2.push(e)
      });
      res.data.planValueAxis.forEach((e) => {
        e = (e / 10000).toFixed(2);
        this.outputValueData.yAxis1.push(e)
      });
    });
    getscheduleAnalyseState(
      this.projectCode,
      this.nodeId,
      this.projectName
    ).then((res) => {
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
    getscheduleAnalyse(this.projectCode, "", this.projectName).then((res) => {
      if (res.data) {
        this.totalOutputValue = (
          Number(res.data.nodeAnalyseValue.totalValue) / 10000
        ).toFixed(2);
        this.completeValue = (
          Number(res.data.nodeAnalyseValue.completeValue) / 10000
        ).toFixed(2);
        this.completeRatio = Number(
          res.data.nodeAnalyseValue.completeRatio * 100
        ).toFixed(2);
        this.surplusValue = (
          Number(res.data.nodeAnalyseValue.leftValue) / 10000
        ).toFixed(2);
        this.leftRatio = Number(
          res.data.nodeAnalyseValue.leftRatio * 100
        ).toFixed(2);
        // this.ProgressData.series = res.data.progressStateAnalyse.map((item) => {
        //   return { value: item.num, name: item.progressStateDesc };
        // });
        this.startData.series = res.data.startWorkStateAnalyse.map((item) => {
          return { value: item.num, name: item.startWorkStateDesc };
        });
        this.finishedData.series = res.data.endWorkStateAnalyse.map((item) => {
          return { value: item.num, name: item.endWorkStateDesc };
        });
        // this.ProgressData.tileTexts = res.data.progressNodeNum;
        //@ts-ignore
        // this.ProgressData.color = [];
        // this.ProgressData.series.forEach((e) => {
        //   if (e.name == "未开工") {
        //     //@ts-ignore
        //     this.ProgressData.color.push("#C2C2C2");
        //   }
        //   if (e.name == "进行中") {
        //     //@ts-ignore
        //     this.ProgressData.color.push("#377EFF");
        //   }
        //   if (e.name == "滞后") {
        //     //@ts-ignore
        //     this.ProgressData.color.push("#FF0042");
        //   }
        //   if (e.name == "预警") {
        //     //@ts-ignore
        //     this.ProgressData.color.push("#F1B500");
        //   }
        //   if (e.name == "已完工") {
        //     //@ts-ignore
        //     this.ProgressData.color.push("#26C974");
        //   }
        // });
        this.startData.tileTexts = res.data.startWorkNodeNum;
        this.finishedData.tileTexts = res.data.endWorkNodeNum;
      }
    });
    getScheduleAnalyseDate(this.projectCode,this.projectName).then(res=>{
        this.beginDate = res.data.beginDate.split("T")[0]
        this.totalDays = res.data.totalDays
        this.workDays = res.data.workDays
    })
  },
};
</script>

<style lang="less" scoped>
.progress_analy_mobile {
  .title_description {
    height: 55px;
    display: flex;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.09);
    background: #fff;
    margin-bottom: 20px;
    div {
      width: 30%;
      h4 {
        display: inline-block;
        vertical-align: middle;
        padding-top: 8px;
        p:nth-child(1) {
          color: #333;
          line-height: 23px;
          font-weight: 700;
          margin-bottom: 3px;
          font-size: 15px;
        }
        p:nth-child(2) {
          margin-bottom: 0;
          color: #a1a3a7;
        }
      }
    }
    div:nth-child(1) {
      width: 40%;
    }
    img {
      width: 40px;
      height: 40px;
      vertical-align: middle;
      margin-right: 5px;
    }
  }
  .pie_situation {
    display: flex;
    box-shadow: 0px 5px 10px 0px rgba(210, 210, 210, 0.2);
    height: 240px;
    margin-bottom: 20px;
    background: #fff;
    .ProgressEcharts {
      flex: 1;
      height: 100%;
    }
  }
  .outputValue {
    background: #ffffff;
    box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
    margin-bottom: 20px;
    .outputValue_progress {
      margin-bottom: 15px;
      height: 25vh;
      padding: 20px;
      padding-top: 10px;
      h4 {
        margin-bottom: 20px;
      }
      span {
        vertical-align: sup;
        font-size: 14px;
      }
      h5 {
        margin-bottom: 5px;
        text-align: left;
        color: #333333;
        font-size: 13px;
      }
    }
  }
  .outputValueAnalysis {
    height: 250px;
    width: 100%;
    padding: 10px;
    background: #fff;
    .outputValue_line {
      width: 100%;
      height: 200px;
    }
  }
}
</style>
<style lang="less">
.progress_analy_mobile {
  .el-progress {
    display: inline-block;
    width: 70%;
    margin-right: 10px;
  }
  .el-carousel__container {
    height: 100%;
    width: 100%;
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
  .el-carousel {
    width: 100%;
    height: 100%;
  }
}
</style>
