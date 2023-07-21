<template>
  <div class="MeasurementPayment">
    <apptitle :title="'投资总览'"></apptitle>
    <div class="title_data">
      <div>
        <p>项目总投资</p>
        <p>
          <span class="green">{{ total }}</span
          ><span>万元</span>
        </p>
      </div>
      <div>
        <p>已计量产值</p>
        <p>
          <span class="blue">{{ measure }}</span
          ><span>万元</span>
        </p>
      </div>
      <div>
        <p>已支付产值</p>
        <p>
          <span class="orange">{{ pay }}</span
          ><span>万元</span>
        </p>
      </div>
    </div>
    <div class="output_content">
      <contentbox :title="'产值统计'"></contentbox>
      <div class="outputCheck">
        <span
          @click="monthClick"
          :style="{ background: monthBackGround, color: monthcolor }"
        >
          月
        </span>
        <span
          @click="yearClick"
          :style="{ background: yearBackGround, color: yearcolor }"
        >
          年
        </span>
      </div>
      <div class="outputFinsh">
        <bar-echarts :id="'sdfgsfsa'" :chartData="finshedData2"></bar-echarts>
      </div>
    </div>
  </div>
</template>

<script>
import apptitle from "../components/appTitle.vue";
import contentbox from "../components/contentBoxs.vue";
import BarEcharts from "../components/BarEcharts.vue";
import { getMeasureMobile } from "../service/index.js";
import env from "@/config/env";
export default {
  components: {
    apptitle,
    contentbox,
    BarEcharts,
  },
  inject:['projectConfig'],
  data() {
    return {
      monthcolor: "#fff",
      yearcolor: "#666",
      yearBackGround: "#F6F7FB",
      monthBackGround: "#2970FF",
      projectName: "",
      projectCode: "",
      finshedData2: {
        payMoneyList: [],
        unpayMoneyList: [],
        contractNameList: [],
        legendArr: ["已计量产值", "已支付产值"],
        legendName1: "已计量产值",
        legendName2: "已支付产值",
      },
      monthpayList:[],
      monthmeasureList:[],
      monthdateList:[],
      yearpayList:[],
      yearmeasureList:[],
      yeardateList:[],
      total: 0,
      measure: 0,
      pay: 0,
    };
  },
  methods: {
    yearClick() {
      this.yearBackGround = "#2970ff";
      this.monthcolor = "#666";
      this.yearcolor = "#fff";
      this.monthBackGround = "rgba(180, 195, 222, 0.5)";
      this.finshedData2.payMoneyList = this.yearpayList
      this.finshedData2.unpayMoneyList = this.yearmeasureList
      this.finshedData2.contractNameList = this.yeardateList
    },
    monthClick() {
      this.monthBackGround = "#2970ff";
      this.monthcolor = "#fff";
      this.yearcolor = "#666";
      this.yearBackGround = "rgba(180, 195, 222, 0.5)";
      this.finshedData2.payMoneyList = this.monthpayList
      this.finshedData2.unpayMoneyList = this.monthmeasureList
      this.finshedData2.contractNameList = this.monthdateList
    },
  },
  mounted() {
    // this.projectName = sessionStorage.getItem("projectname");
    this.projectName = this.projectConfig?.projectName??"";
    this.projectCode = `${env.project}`;
    getMeasureMobile(this.projectCode, this.projectName).then((res) => {
      this.total = res.data.totalMoney.total;
      this.measure = res.data.totalMoney.measure;
      this.pay = res.data.totalMoney.pay;
      res.data.monthData.forEach(e => {
          this.monthpayList.push(e.pay)
          this.monthmeasureList.push(e.measure)
          this.monthdateList.push(e.date)
      });
      res.data.yearData.forEach(e => {
          this.yearpayList.push(e.pay)
          this.yearmeasureList.push(e.measure)
          this.yeardateList.push(e.date)
      });
      this.finshedData2.payMoneyList = this.monthpayList
      this.finshedData2.unpayMoneyList = this.monthmeasureList
      this.finshedData2.contractNameList = this.monthdateList
    });
  },
};
</script>

<style lang="less" scoped>
.MeasurementPayment {
  .title_data {
    display: flex;
    height: 70px;
    background: #fff;

    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.09);
    margin-bottom: 20px;
    div {
      flex: 1;
      padding-top: 10px;
      p:nth-child(1) {
        line-height: 20px;
        color: #333;
        font-size: 14px;
      }
      p:nth-child(2) {
        span:nth-child(1) {
          font-size: 23px;
          font-weight: 700;
        }
        span:nth-child(2) {
          font-size: 12px;
          color: #a1a3a7;
        }
      }
    }
    .green {
      color: #22b62a;
    }
    .blue {
      color: #4889f0;
    }
    .orange {
      color: #ffa943;
    }
    p {
      margin-bottom: 0;
    }
  }
  .output_content {
    height: 280px;
    background: #fff;
    box-shadow: 0px 5px 10px 0px rgba(210, 210, 210, 0.2);
    .outputFinsh {
      height: 220px;
    }
    .outputCheck {
      text-align: right;
      span {
        display: inline-block;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        border-radius: 5px;
        margin-right: 10px;
      }
    }
  }
}
</style>
