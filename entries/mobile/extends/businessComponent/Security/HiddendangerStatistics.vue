<template>
  <div class="InspectionAcceptance">
    <apptitle :title="'隐患统计分析'"></apptitle>
    <swiper :options="swiperOption" ref="Swiper">
      <swiper-slide>
        <div class="title_box img0">
          <p>{{ todeyCheck }}</p>
          <p>今日检查</p>
        </div>
      </swiper-slide>
      <swiper-slide>
        <div class="title_box img1">
          <p>{{ totalCheck }}</p>
          <p>累计检查</p>
        </div>
      </swiper-slide>
      <swiper-slide>
        <div class="title_box img2">
          <p>{{ todayProblem }}</p>
          <p>今日问题</p>
        </div>
      </swiper-slide>
      <swiper-slide>
        <div class="title_box img3">
          <p>{{ totalProblem }}</p>
          <p>累计问题</p>
        </div>
      </swiper-slide>
      <swiper-slide>
        <div class="title_box img4">
          <p>{{ alertProblem }}</p>
          <p>超期问题</p>
        </div>
      </swiper-slide>
      <swiper-slide>
        <div class="title_box img5">
          <p>{{ unfinishProblem }}</p>
          <p>未整改问题</p>
        </div>
      </swiper-slide>
    </swiper>
    <div class="lineecharts">
      <contentbox :title="'安全检查'"></contentbox>
      <div class="outputValueLinechat">
        <line-echarts
          :id="'outputValueLinechat'"
          :chartData="outputValueData"
        ></line-echarts>
      </div>
    </div>
    <div class="piecharts">
      <contentbox :title="'检查整改率'"></contentbox>
      <div class="investment_echart3">
        <pie-charts
          :chartData="finishedData"
          :id="'investment_echart3'"
        ></pie-charts>
      </div>
    </div>
    <div class="iframe">
      <contentbox :title="'安全检查整改台账'"></contentbox>
      <iframe :src="iframeUrl" frameborder="0"></iframe>
    </div>
  </div>
</template>

<script>
import apptitle from "../components/appTitle.vue";
import contentbox from "../components/contentBoxs.vue";
import LineEcharts from "../Schedule/components/LineEcharts";
import PieCharts from "../Schedule/components/PieCharts";
import { Swiper } from "vue-awesome-swiper";
import { SwiperSlide } from "vue-awesome-swiper";
import "./swiper/swiper.css";
import { getStatisticalData, getReportUrl } from "../service/index.js";
import env from "@/config/env";
export default {
  components: {
    apptitle,
    contentbox,
    LineEcharts,
    PieCharts,
    Swiper,
    SwiperSlide,
  },
  inject: ["projectConfig"],
  data() {
    return {
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
        center: ["50%", "40%"],
        series: [
          {
            name: "未整改问题",
            value: 0,
          },
          {
            name: "已整改问题",
            value: 0,
          },
        ],
      },
      outputValueData: {
        legend: ["检查人数"],
        yName: "个数",
        xAxis: [],
        yAxis1: [],
        textStyle: "#0A0A0A",
        right: "5%",
        legendColor: "#000",
        formatter: "个",
      },
      projectCode: "",
      projectName: "",
      todeyCheck: "",
      totalCheck: "",
      todayProblem: "",
      totalProblem: "",
      unfinishProblem: "",
      alertProblem: "",
      iframeUrl: "",
      swiperOption: {
        slidesPerView: 3,
        mousewheel: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
          hideOnClick: true,
          hiddenClass: "my-button-hidden",
        },
        direction: "horizontal",
      },
    };
  },

  mounted() {
    // this.projectName = sessionStorage.getItem("projectname");
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
    getStatisticalData(this.projectCode, this.projectName).then((res) => {
      this.todeyCheck = res.data.securityProblemStatics.todeyCheck;
      this.totalCheck = res.data.securityProblemStatics.totalCheck;
      this.todayProblem = res.data.securityProblemStatics.todayProblem;
      this.totalProblem = res.data.securityProblemStatics.totalProblem;
      this.unfinishProblem = res.data.securityProblemStatics.unfinishProblem;
      this.alertProblem = res.data.securityProblemStatics.alertProblem;
      this.outputValueData.xAxis = [];
      this.outputValueData.yAxis1 = [];
      res.data.securityCheckStatics.forEach((e) => {
        this.outputValueData.xAxis.push(e.jcrq);
        this.outputValueData.yAxis1.push(e.count);
      });
      this.finishedData.series[0].value = res.data.checkRectification.unfinishProblem;
      this.finishedData.series[1].value = res.data.checkRectification.finishedProblem;
    });
    getReportUrl("zgtzs", this.projectCode, this.projectName).then(res=>{
      this.iframeUrl = res.data
    })
  },
};
</script>

<style lang="less" scoped>
.InspectionAcceptance {
  .title_box {
    width: 100%;
    height: 80px;

    p {
      margin-bottom: 0px;
    }
    p:nth-child(1) {
      padding-top: 15px;
      line-height: 28px;
      color: #333;
      font-weight: 700;
      font-size: 15px;
    }
    p:nth-child(2) {
      color: #a1a3a7;
      font-size: 13px;
    }
  }
  .img0 {
    background: url("../../Img/1@2x.png");
    background-size: 100% 100%;
  }
  .img5 {
    background: url("../../Img/1@2x.png");
    background-size: 100% 100%;
  }
  .img1 {
    background: url("../../Img/2@2x.png");
    background-size: 100% 100%;
  }
  .img6 {
    background: url("../../Img/2@2x.png");
    background-size: 100% 100%;
  }
  .img2 {
    background: url("../../Img/3@2x.png");
    background-size: 100% 100%;
  }
  .img7 {
    background: url("../../Img/3@2x.png");
    background-size: 100% 100%;
  }
  .img3 {
    background: url("../../Img/4@2x.png");
    background-size: 100% 100%;
  }
  .img8 {
    background: url("../../Img/4@2x.png");
    background-size: 100% 100%;
  }
  .img4 {
    background: url("../../Img/5@2x.png");
    background-size: 100% 100%;
  }
  .img9 {
    background: url("../../Img/5@2x.png");
    background-size: 100% 100%;
  }
  .lineecharts {
    height: 280px;
    background: #fff;
    margin: 10px;
    .outputValueLinechat {
      padding: 10px;
      height: 240px;
    }
  }
  .piecharts {
    height: 280px;
    background: #fff;
    margin: 10px;
    .investment_echart3 {
      height: 240px;
    }
  }
  .iframe {
    height: 500px;
    background: #fff;
    margin: 10px;
    iframe {
      width: 100%;
      height: 95%;
    }
  }
}
</style>
