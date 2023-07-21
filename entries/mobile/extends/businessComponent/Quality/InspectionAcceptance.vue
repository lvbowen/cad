<template>
  <div class="InspectionAcceptance">
    <apptitle :title="'质检验收'"></apptitle>
    <div class="contentContainer">
      <swiper :options="swiperOption" ref="Swiper">
        <swiper-slide v-for="(v, k,index) in dataLists" :key="k">
          <div class="title_box" :class="'img' + index">
            <p>{{ v }}</p>
            <p v-if="k==='dayCount'">今日验收数</p>
            <p v-if="k==='doneCount'">已验收数</p>
            <p v-if="k==='totalCount'">总验收数</p>
            <p v-if="k==='undoCount'">待验收数</p>
            <p v-if="k==='doingCount'">待审批数</p>
          </div>
        </swiper-slide>
      </swiper>
      <div class="lineecharts">
        <contentbox :title="'质检数量统计'"></contentbox>
        <div class="outputValueLinechat">
          <line-echarts
            :id="'outputValueLinechat'"
            :chartData="outputValueData"
          ></line-echarts>
        </div>
      </div>
      <div class="piecharts">
        <contentbox :title="'质检状态统计'"></contentbox>
        <div class="investment_echart3">
          <pie-charts
            :chartData="finishedData"
            :id="'investment_echart3'"
          ></pie-charts>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apptitle from "../components/appTitle.vue";
import contentbox from "../components/contentBoxs.vue";
import LineEcharts from "../../basicCustomComponent/echarts/LineCharts";
import PieCharts from "../../basicCustomComponent/echarts/PieCharts";
import {Swiper} from "vue-awesome-swiper";
import {SwiperSlide} from "vue-awesome-swiper";
import "../Security/swiper/swiper.css";
import * as Api from "../../service/api";

export default {
  components: {
    apptitle,
    contentbox,
    LineEcharts,
    PieCharts,
    Swiper,
    SwiperSlide,
  },
  inject: ['projectConfig', 'project'],
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
        // tileText: "完工状态情况",
        center: ["50%", "40%"],
        series: [
          {
            name: "未填报",
            value: 0,
          },
          {
            name: "审核中",
            value: 0,
          },
          {
            name: "已归档",
            value: 0,
          },
        ],
        midText:0
      },
      outputValueData: {
        legend: ["质量检验数"],
        yName: "个数",
        xAxis: [],
        yAxis3: [],
        textStyle: "#0A0A0A",
        legendColor: "#000",
        formatter: "个",
        ySplitLineShow:false,
        smooth:true,
        symbol:'circle'
      },
      projectCode: "",
      projectName: "",
      dataLists: [],
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
    this.projectCode = this.project;
    Api.getAnalyseProject({appCode: this.projectCode, projectName: this.projectName}).then((res) => {
      if (res.data) {
        this.dataLists = res.data;
        this.finishedData.series[0].value = res.data.undoCount;
        this.finishedData.series[1].value = res.data.doingCount;
        this.finishedData.series[2].value = res.data.doneCount;
        this.finishedData.midText=res.data.totalCount.toString();
      }
    });
    Api.getBizHandle({appCode: this.projectCode, projectName: this.projectName}).then((res) => {
      this.outputValueData.xAxis = [];
      this.outputValueData.yAxis3 = [];
      res.data.timeCount.forEach((e) => {
        this.outputValueData.xAxis.push(e.time);
        this.outputValueData.yAxis3.push(e.num);
      });
    });
  },
};
</script>

<style lang="less" scoped>
.InspectionAcceptance {
  height: 100vh;

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

  .contentContainer {
    height: calc(100vh - 80px);
    overflow-y: auto;

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
      margin: -10px 10px 15px 10px;

      .outputValueLinechat {
        margin: 10px 2px;
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
  }

}
</style>
