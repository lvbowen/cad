<template>
  <div class="ConstructionSite">
    <h5>
      安全生产 <span>{{ projectRuntime }}</span> 天
    </h5>
    <div class="ConstructionSite_left">
      <div class="CompletionOutput">
        <div class="OutputTitle">
          <h3>当日值班</h3>
          <p @click="messageModelClick">{{ scheduleModelTitle }}</p>
        </div>
        <div class="ConstructionSite_table">
          <!-- <el-scrollbar style="height: 100%"> -->
          <el-table :data="tableData" height="230" rowKey="name">
            <el-table-column prop="department" label="单位" width="90">
            </el-table-column>
            <el-table-column prop="personName" label="姓名" width="85">
            </el-table-column>
            <!-- <el-table-column prop="position" label="职位" width="60">
            </el-table-column> -->
            <el-table-column prop="phone" label="联系电话" width="130">
            </el-table-column>
          </el-table>
          <!-- </el-scrollbar> -->
        </div>
      </div>
      <div class="environment">
        <div class="environment_title">
          <h3>环境监测</h3>
          <p>时间：{{ deviceTime }}</p>
        </div>
        <div class="environment_img">
          <div class="imgInfo_left">
            <div>
              <img src="../img/device/icon1.png" alt="" />
              <span>风速 ：</span>
              <span>{{ windSpeed }}m/s</span>
            </div>
            <div>
              <img src="../img/device/icon3.png" alt="" />
              <span>风向 ：</span>
              <span>{{ windDirection }}</span>
            </div>
            <div>
              <img src="../img/device/icon5.png" alt="" />
              <span>PM10 ：</span>
              <span>{{ pmTen }}μg/m³</span>
            </div>
            <div>
              <img src="../img/device/icon7.png" alt="" />
              <span>温度 ：</span>
              <span>{{ temperature }}℃</span>
            </div>
            <div>
              <img src="../img/device/icon9.png" alt="" />
              <span>噪音 ：</span>
              <span>{{ noise }}dB</span>
            </div>
          </div>
          <div class="imgInfo_right">
            <div>
              <img src="../img/device/icon2.png" alt="" />
              <span>风力等级 ：</span>
              <span :style="{ color: windScaleColor }">{{ windScale }}</span>
            </div>
            <div>
              <img src="../img/device/icon4.png" alt="" />
              <span>PM2.5 ：</span>
              <span>{{ pmTwoPiontFive }}μg/m³</span>
            </div>
            <div>
              <img src="../img/device/icon6.png" alt="" />
              <span>TSP ：</span>
              <span>{{ tsp }}μg/m³</span>
            </div>
            <div>
              <img src="../img/device/icon8.png" alt="" />
              <span>湿度 ：</span>
              <span>{{ humidity }}%rh</span>
            </div>
          </div>
        </div>
      </div>
      <div class="message">
        <div class="fill_title">
          <h3>风力统计</h3>
        </div>
        <div class="describe">
          <span>六级及以上天数 : {{ aboveDay }}</span>
          <span>六级以下天数 : {{ followingDay }}</span>
        </div>
        <div class="messagEcharts">
          <pie-charts
            :chartData="investmentData1"
            :id="'investment_echart1'"
          ></pie-charts>
        </div>
      </div>
    </div>
    <div class="ConstructionSite_bottom">
      <div class="linecharts_title">
        <h3>异常数据统计</h3>
        <div class="selectType">
          <div :class="spanIndex == 1 ? spanHighlight : ''" @click="SafetyHat">
            <img src="../img/device/btn1.png" alt="" />
            <span>安全帽</span>
          </div>
          <div
            :class="spanIndex == 2 ? spanHighlight : ''"
            @click="Temperature"
          >
            <img src="../img/device/btn2.png" alt="" />
            <span>体温</span>
          </div>
          <div :class="spanIndex == 3 ? spanHighlight : ''" @click="Velocity">
            <img src="../img/device/btn3.png" alt="" />
            <span>车辆测速</span>
          </div>
        </div>
      </div>
      <div class="fillecharts">
        <line-echarts2 :id="'fill'" :chartData="fillData2"></line-echarts2>
      </div>
    </div>
    <div class="ConstructionSite_right">
      <div class="ConstructionSite_time">
        <h4>监控抓拍：</h4>
        <el-date-picker
          v-model="value1"
          align="right"
          @change="handlePick"
          valueFormat="yyyy-MM-dd"
          type="date"
          placeholder="选择日期"
          :pickerOptions="pickerOptions"
        >
        </el-date-picker>
      </div>
      <div class="security">
        <div class="ConstructionSite_info">
          <img src="../img/device/icon_aqm.png" alt="" />
          <span
          >当日未佩戴 <br />
            安全帽人次：
          </span>
          <span>{{ safetyNumber }}</span>
          <span>人次</span>
          <span
          >累计未佩戴 <br />
            安全帽人次：
          </span>
          <span>{{ safetyHelmetExceptionNum }}</span>
          <span>人次</span>
        </div>
        <div class="photo">
          <el-carousel height="170px">
            <el-carousel-item v-for="item in safetyBanner" :key="item">
              <img @click="scale(item)" :src="item" alt="" />
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
      <div class="photograph">
        <div class="Temperature_info">
          <img src="../img/device/icon_aqm.png" alt="" />
          <span
          >当日体温 <br />
            异常人次：
          </span>
          <span>{{ tempNumber }}</span>
          <span>人次</span>
          <span
          >累计体温 <br />
            异常人次：
          </span>
          <span>{{ bodyTemperatureExceptionNum }}</span>
          <span>人次</span>
        </div>
        <div class="photo">
          <el-carousel height="170px">
            <el-carousel-item v-for="item in tempBanner" :key="item">
              <img @click="scale(item)" :src="item" alt="" />
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
      <div class="vehicle">
        <div class="Temperature_info">
          <img src="../img/device/icon_aqm.png" alt="" />
          <span
          >当日车辆 <br />
            超速次数：
          </span>
          <span>{{ carSpeedUnNormalNUm }}</span>
          <span>车次</span>
          <span
          >累计车辆 <br />
            超速次数：
          </span>
          <span>{{ carSpeedMeasurementNum }}</span>
          <span>车次</span>
        </div>
        <div class="vehicle_message">
          <div class="carimg">
            <el-carousel height="170px">
              <el-carousel-item
                v-for="(item,index) in carSpeedMeasurementList"
                :key="index"
              >
                <img @click="scale(item.photo)" :src="item.photo" alt="" />
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>
      </div>
    </div>
    <div class="bigpic" @click="overflow" :style="{ display: bigpicShow }">
      <img :src="picscale" alt />
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Carousel from "element-ui/lib/carousel";
import CarouselItem from "element-ui/lib/carousel-item";
import DatePicker from "element-ui/lib/date-picker";
import PieCharts from "../../ManageViews/components/PieCharts.vue";
import LineEcharts2 from "../Echarts/LineEcharts2.vue";
import { getWisdomSite, getWisdomSitePhoto,getscheduleAnalyseState } from "../server/index.js";
import env from "@/config/env";
import img from "../img/device/pic_1.png";
Vue.use(Carousel);
Vue.use(CarouselItem);
export default {
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      value1: "",
      aboveDay: 0,
      carSpeedMeasurementNum: 0,
      carSpeedUnNormalNUm: 0,
      followingDay: 0,
      safetyHelmetExceptionNum: 0,
      bodyTemperatureExceptionNum: 0,
      projectRuntime: 0,
      spanIndex: 1,
      carSpeedMeasurementList: [],
      tableData: [],
      fillData2: {
        yname: "次数",
        lineColor: "#4AACFF",
        xAxis: [],
        yAxis1: [],
        yName1: "安全帽",
      },
      investmentData1: {
        tileText: "",
        center: ["50%", "45%"],
        right: 50,
        color: ["#FF0042", "#26C974"],
        radius: ["40%", "60%"],
        series: [
          {
            name: "六级及以上天数",
            value: 0,
          },
          {
            name: "六级以下天数",
            value: 0,
          },
        ],
      },
      projectCode: "",
      carTime: "",
      windSpeed: "",
      img1: img,
      windDirection: "",
      pmTen: "",
      temperature: "",
      windScaleColor: "",
      windScale: "",
      deviceTime: "",
      noise: "",
      pmTwoPiontFive: "",
      tsp: "",
      humidity: "",
      spanHighlight: "spanHighlight",
      pColor: "pColor",
      safetyNumber: 0,
      pIndex: 0,
      tempNumber: 0,
      safetyBanner: [],
      tempBanner: [],
      bodyTemperature: [],
      carSpeedMeasurement: [],
      safetyHelmet: [],
      bigpicShow: "none",
      picscale: "",
      scheduleModelTitle: "模型显示",
      AllmodelShow: true,
      scheduleData: [],
      scheduleAllModel: []
    };
  },
  methods: {
    scale(item) {
      this.picscale = item;
      this.bigpicShow = "block";
    },
    overflow() {
      this.bigpicShow = "none";
    },
    SafetyHat() {
      this.spanIndex = 1;
      this.fillData2.yName1 = "安全帽";
      this.fillData2.lineColor = "#4AACFF";
      this.fillData2.xAxis = [];
      this.fillData2.yAxis1 = this.safetyHelmet.value;
      this.safetyHelmet.timeLine.forEach((element) => {
        element = element.split(" ")[0];
        this.fillData2.xAxis.push(element);
      });
    },
    Temperature() {
      this.spanIndex = 2;
      this.fillData2.yName1 = "体温";
      this.fillData2.xAxis = [];
      this.fillData2.lineColor = "#FF575A";
      this.fillData2.yAxis1 = this.bodyTemperature.value;
      this.bodyTemperature.timeLine.forEach((element) => {
        element = element.split(" ")[0];
        this.fillData2.xAxis.push(element);
      });
    },
    Velocity() {
      this.spanIndex = 3;
      this.fillData2.yName1 = "车辆测速";
      this.fillData2.xAxis = [];
      this.fillData2.lineColor = "#26C6DA";
      this.fillData2.yAxis1 = this.carSpeedMeasurement.value;
      this.carSpeedMeasurement.timeLine.forEach((element) => {
        element = element.split(" ")[0];
        this.fillData2.xAxis.push(element);
      });
    },
    //选择时间
    handlePick(val) {
      this.value1 = val;
      this.getinit();
    },
    getinit() {
      getWisdomSitePhoto(
        this.projectCode,
        this.$route.query.projectName,
        this.value1
      ).then((res) => {
        //安全帽
        this.safetyNumber =
          res.data.safetyHelmetException.safetyHelmetUnNormalNUm;
        this.safetyHelmetExceptionNum = res.data.safetyHelmetExceptionNum;
        this.safetyBanner = res.data.safetyHelmetException.picUrlList ?? [
          this.img1,
        ];
        //体温
        this.tempNumber = res.data.bodyTemperatureException.tempUnnormalNum;
        this.bodyTemperatureExceptionNum = res.data.bodyTemperatureExceptionNum;
        this.tempBanner = res.data.bodyTemperatureException.picUrlList ?? [
          this.img1,
        ];
        if(res.data.bodyTemperatureException.picUrlList?.length == 0) {
          this.tempBanner = [ this.img1 ];
        }
        //车辆
        this.carSpeedMeasurementNum = res.data.carSpeedMeasurementNum;
        this.carSpeedUnNormalNUm =
          res.data.carSpeedMeasurementTotalDTO.carSpeedUnNormalNUm;
        this.carSpeedMeasurementList =
          res.data.carSpeedMeasurementTotalDTO.carSpeedMeasurementList
        if(this.carSpeedMeasurementList.length == 0) {
          this.carSpeedMeasurementList =  [{ photo:this.img1 }];
        }
        console.log(this.carSpeedMeasurementList);
      });
    },
    getWisdomSite() {
      getWisdomSite(this.projectCode, this.$route.query.projectName).then(
        (res) => {
          //项目运行时间
          this.projectRuntime = res.data.projectRuntime;
          //环境监测
          this.windSpeed = res.data.environmentMonitoring.windSpeed?.toFixed(2);
          this.windDirection = res.data.environmentMonitoring.windDirection;
          this.deviceTime = res.data.environmentMonitoring.deviceTime;
          this.windScaleColor = res.data.environmentMonitoring.windColor;
          this.pmTen = res.data.environmentMonitoring.pmTen;
          this.temperature = res.data.environmentMonitoring.temperature;
          this.noise = res.data.environmentMonitoring.noise;
          this.windScale = res.data.environmentMonitoring.windScale;
          this.pmTwoPiontFive = res.data.environmentMonitoring.pmTwoPiontFive;
          this.tsp = res.data.environmentMonitoring.tsp;
          this.humidity = res.data.environmentMonitoring.humidity;
          //风力统计
          this.investmentData1.series[0].value =
            res.data.windStatistics.strongWind;
          this.aboveDay = res.data.windStatistics.strongWind;
          this.investmentData1.series[1].value = res.data.windStatistics.weekWind;
          this.followingDay = res.data.windStatistics.weekWind;
          //折线图
          this.fillData2.xAxis = [];
          res.data.exceptionInfoDTO.safetyHelmet.timeLine.forEach((element) => {
            element = element.split(" ")[0];
            this.fillData2.xAxis.push(element);
          });
          this.fillData2.yAxis1 = res.data.exceptionInfoDTO.safetyHelmet.value;
          this.fillData2.yName1 = res.data.exceptionInfoDTO.safetyHelmet.type;
          //安全帽折线图
          this.safetyHelmet = res.data.exceptionInfoDTO.safetyHelmet;
          //体温折线图
          this.bodyTemperature = res.data.exceptionInfoDTO.bodyTemperature;
          //车辆折线图
          this.carSpeedMeasurement =
            res.data.exceptionInfoDTO.carSpeedMeasurement;
          //表格
          this.tableData = res.data.onDutyDTOList;
        }
      );
    },
    //进度状态全部模型显示
    messageModelClick() {
      this.AllmodelShow = !this.AllmodelShow;
      if (this.AllmodelShow) {
        this.scheduleModelTitle = "模型显示";
        this.$emit("clearModel", "releaseModelSchedule");
      } else {
        this.scheduleModelTitle = "取消显示";
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
  },
  mounted() {
    this.projectCode = `${env.project}`;
    this.getinit();
    this.getWisdomSite();
    setInterval(()=> {
      this.getinit();
    },1000 * 60 * 60 )
    setInterval(()=> {
      this.getWisdomSite();
    },1000 * 60 * 5);
    getscheduleAnalyseState(this.projectCode, "", this.$route.query.projectName).then(
      (res) => {
      this.scheduleData = res.data.progressStateAnalyse;
    })
  },
  components: {
    PieCharts,
    LineEcharts2,
    ElDatePicker: DatePicker,
  },
};
</script>

<style lang="less" scoped>
* {
  color: #fff;
}
.ConstructionSite {
  h5 {
    position: absolute;
    top: 118%;
    left: 2.5%;
    height: 20px;
    font-size: 21px;
    font-weight: 700;
    span {
      color: #ffa800;
      font-size: 30px;
    }
  }
  .ConstructionSite_left {
    position: absolute;
    left: 2%;
    width: 330px;
    padding: 10px;
    height: 830px;
    background: rgba(6, 8, 22, 0.7);
    margin-top: 50px;
    .CompletionOutput {
      height: 35%;
      width: 100%;
      .OutputTitle {
        display: flex;
        justify-content: space-around;
        p {
          position: absolute;
          top: 5px;
          right: 5px;
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
      h3 {
        font-weight: bold;
        flex: 1;
        height: 10%;
        margin-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.4);
      }
      .ConstructionSite_table {
        width: 100%;
        height: 85%;
      }
    }
    .environment {
      height: 30%;
      width: 100%;
      .environment_img {
        height: 89%;
        width: 100%;
        display: flex;
        img {
          width: 32px;
          height: 32px;
        }
        .imgInfo_left {
          width: 50%;
          padding: 5px;
          div {
            margin-bottom: 8px;
            :nth-child(2) {
              font-size: 13px;
              color: rgba(255, 255, 255, 0.7);
            }
            :nth-child(3) {
              font-size: 14px;
            }
          }
        }
        .imgInfo_right {
          width: 50%;
          padding: 5px;
          div {
            margin-bottom: 8px;
            :nth-child(2) {
              font-size: 13px;
              color: rgba(255, 255, 255, 0.7);
            }
            :nth-child(3) {
              font-size: 15px;
            }
          }
        }
      }
      .environment_title {
        height: 11%;
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.4);
        h3 {
          width: 40%;
          font-weight: bold;
        }
        p {
          width: 60%;
          font-size: 15px;
        }
      }
    }
    .message {
      height: 35%;
      width: 100%;
      .messagEcharts {
        height: 78%;
        width: 100%;
      }
      .describe {
        height: 10%;
        line-height: 25px;
        text-align: center;
        span {
          font-size: 14px;
          font-weight: 700;
          margin-right: 15px;
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
        p {
          background: #2970ff;
          width: 20%;
          line-height: 24px;
          height: 24px;
          border-radius: 4px;
          text-align: center;
          cursor: pointer;
        }
      }
    }
  }
  .ConstructionSite_bottom {
    position: absolute;
    left: 20%;
    top: 1047%;
    width: 1150px;
    height: 264px;
    background: rgba(6, 8, 22, 0.7);
    .linecharts_title {
      display: flex;
      padding: 12px;
      h3 {
        font-weight: bold;
        width: 70%;
      }
      .selectType {
        width: 30%;
        display: flex;
        div {
          margin-right: 22px;
          cursor: pointer;
          img {
            margin-right: 7px;
            vertical-align: middle;
          }
          span {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5);
            vertical-align: middle;
          }
        }
        .spanHighlight {
          img {
            width: 28px;
            height: 14px;
          }
          span {
            font-weight: 700;
            font-size: 15px;
            color: #fff;
          }
        }
      }
    }
    .fillecharts {
      width: 100%;
      height: 82%;
    }
  }
  .ConstructionSite_right {
    position: absolute;
    right: 1%;
    padding: 10px;
    width: 360px;
    height: 830px;
    background: rgba(6, 8, 22, 0.7);
    margin-top: 50px;
    .ConstructionSite_time {
      height: 5%;
      display: flex;
    }
    .security {
      height: 30%;
    }
    h4 {
      font-size: 14px;
      width: 45%;
      font-weight: 700;
      line-height: 30px;
      margin-bottom: 8px;
    }
    .photo {
      padding: 10px;
      background: url("../img/device/kuang.png");
      background-size: 100% 100%;
      img {
        width: 100%;
        height: 100%;
        cursor: pointer;
      }
    }
    .ConstructionSite_info {
      margin-bottom: 10px;
      img {
        width: 40px;
        height: 40px;
        vertical-align: middle;
        margin-right: 10px;
      }
      :nth-child(2) {
        display: inline-block;
        width: 80px;
        height: 50px;
        vertical-align: middle;
        font-size: 13px;
        padding-top: 8px;
        line-height: 18px;
      }
      :nth-child(3) {
        width: 100px;
        height: 50px;
        color: #ffa800;
        vertical-align: middle;
        font-size: 26px;
        margin-right: 2px;
      }
      :nth-child(4) {
        vertical-align: middle;
        margin-right: 5px;
      }
      :nth-child(5) {
        display: inline-block;
        width: 80px;
        height: 50px;
        vertical-align: middle;
        font-size: 13px;
        padding-top: 8px;
        line-height: 18px;
      }
      :nth-child(6) {
        width: 100px;
        height: 50px;
        color: #ffa800;
        vertical-align: middle;
        font-size: 26px;
        margin-right: 2px;
      }
      :nth-child(7) {
        vertical-align: middle;
      }
    }
    .Temperature_info {
      margin: 10px 0;
      img {
        width: 40px;
        height: 40px;
        vertical-align: middle;
        margin-right: 10px;
      }
      :nth-child(2) {
        display: inline-block;
        width: 70px;
        height: 50px;
        vertical-align: middle;
        font-size: 13px;
        padding-top: 8px;
        line-height: 18px;
      }
      :nth-child(3) {
        width: 100px;
        height: 50px;
        color: #ffa800;
        vertical-align: middle;
        font-size: 26px;
        margin-right: 2px;
      }
      :nth-child(4) {
        vertical-align: middle;
        margin-right: 15px;
      }
      :nth-child(5) {
        display: inline-block;
        width: 70px;
        height: 50px;
        vertical-align: middle;
        font-size: 13px;
        padding-top: 8px;
        line-height: 18px;
      }
      :nth-child(6) {
        width: 100px;
        height: 50px;
        color: #ffa800;
        vertical-align: middle;
        font-size: 26px;
        margin-right: 2px;
      }
      :nth-child(7) {
        vertical-align: middle;
      }
    }
    .photograph {
      height: 30%;
      margin-bottom: 10px;
    }
    .vehicle {
      height: 30%;
      h3 {
        font-weight: bold;
        height: 10%;
        margin-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.4);
      }
      .vehicle_message {
        display: flex;
        height: 80%;
        .carimg {
          width: 100%;
          height: 100%;
          padding: 10px;
          background: url("../img/device/kuang.png");
          background-size: 100% 100%;
          img {
            width: 100%;
            height: 100%;
            cursor: pointer;
          }
        }
      }
    }
    .pColor {
      color: #09aefd;
    }
  }
}
.bigpic {
  position: absolute;
  top: 118px;
  left: 50px;
  width: 95%;
  height: 85vh;
  z-index: 999;
  cursor: pointer;
  img {
    max-width: 100%;
    height: 100%;
     user-select:none;
  }
}
</style>

<style lang="less">
.ConstructionSite {
  .el-carousel__indicators {
    display: none;
  }
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
  .el-table--scrollable-x .el-table__body-wrapper {
    overflow-x: none !important;
  }
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .ConstructionSite_time {
    .el-date-editor.el-input,
    .el-date-editor.el-input__inner {
      width: 170px;
    }
    .el-input--prefix .el-input__inner {
      height: 30px;
    }
    .el-input__icon {
      line-height: 30px;
      height: 30px;
    }
    .el-input__suffix-inner {
      line-height: 30px;
      height: 30px;
    }
  }
}
</style>
