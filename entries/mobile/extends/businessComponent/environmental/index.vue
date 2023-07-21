<template>
  <div class="wrap">
    <div class="wrapTop">
      <NavBar title="环境监测" leftArrow @click-left="onClickLeft" />
      <iframe
        allowtransparency="true"
        frameborder="0"
        width="140"
        height="128"
        scrolling="no"
        :src="mobileWeatherSrc"
      ></iframe>
      <div class="mask"></div>
    </div>
    <div class="wrapBottom">
      <div class="chart">
        <div class="chartOne">
          <div
            v-for="(item,index) in environmentItems"
            :key="index"
            :class="itemClasses[index%itemClasses.length]"
            @click="changeShowItem(item.elementType,item.name,item.unit)">
            <p>{{ item.value }}</p>
            <p>{{ item.unit }}</p>
            <span>{{ item.name }}</span>
          </div>
        </div>
        <div class="chartTwo">
          <div class="viewTitle">
            <div class="viewTitleLeft">
              <div class="img">
                <img
                  src="../../../src/assets/extends/smartConstruction/hj_title.png"
                  alt=""
                />
              </div>
              <div>趋势分析</div>
            </div>
            <div class="calendar" >
              <Icon
                class="calendar_icon"
                classPrefix="icon"
                @click="showDatetimePicker"
                name="calendar"/>
              <Cell class="calendar_Cell" @click="showDatetimePicker">{{ showDate }}</Cell>
              <Popup
                v-model="isShow"
                position="bottom"
                round
                @click-overlay="cancel"
              >
                <DatetimePicker
                  type="date"
                  v-model="currentDate"
                  :maxDate="maxDate"
                  @cancel="cancel"
                  @confirm="confirm"
                  title="选择日期">
                </DatetimePicker>
              </Popup>
            </div>
          </div>
          <LineEcharts id="lineChart" :chartData="lineData"></LineEcharts>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, InjectReactive, Watch } from "vue-property-decorator";
import { NavBar, Icon , Cell, DatetimePicker, Popup } from "vant";
import LineEcharts from "./lineEchartsEnvironment.vue";
import * as Api from "../../service/api";
import moment from "moment";
@Component({
  name: "environmentView",
  components: {
    NavBar,
    LineEcharts,
    Icon,
    Cell,
    DatetimePicker,
    Popup
  },
})
export default class environmentView extends Vue {
  isShow=false;
  currentDate=moment().toDate();
  lastSelectDate!:Date;
  maxDate=moment().toDate();

  itemClasses=["yellowEnvi","greenEnvi","blueEnvi"];

  environmentItems:{elementType:number,name:string,unit:string,value:string}[]=[];

  get showDate(){
    return moment(this.currentDate).format("YYYY-MM-DD");
  }
  // @ts-ignore
  @InjectReactive("projectConfig") projectConfig;
  // @ts-ignore
  @InjectReactive("project") projectCode;

  date: any = "";
  show: boolean = false;
  elseDescribe: any = {};
  colorList: Array<string> = [];
  data: any = null;
  lineData: any = {
    legend: ["温度"],
    yName: "℃",
    xAxis: [],
    yAxis1: [],
    textStyle: "#0A0A0A",
    legendColor: "#d7dade",
    formatter: "",
    end: null,
    interval: [],
  };
  time: string = "";
  elementType: any = 6;
  mobileWeatherSrc:string='';

  onClickLeft() {
    // @ts-ignore
    this.$router.back();
  }
  timeCheck(val) {
    this.time = val;
    this.EnvironmentTrend();
  }

  mounted() {
    this.getBimEnvironmentData();
  }

  confirm(){
    this.timeCheck(this.showDate);
    this.isShow=false;
  }
  cancel(){
    this.isShow=false;
    this.currentDate=this.lastSelectDate;
  }

  showDatetimePicker(){
    this.lastSelectDate=moment(this.currentDate).toDate();
    this.isShow=true;
  }

  changeShowItem(elementType:number,showName:string,unit:string){
    this.elementType=elementType;
    this.lineData.legend[0]=showName;
    this.lineData.yName=unit;
    this.EnvironmentTrend();
  }

  getBimEnvironmentData(val?: string) {
    Api.getBimEnvironmentData({
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName ?? "",
      groupId: val ?? "",
    }).then((res) => {
      if (res.errcode !== 0) return;
      if (!res.data) return;
      this.environmentItems=res.data.environmentItemDTOList;
      this.mobileWeatherSrc=res.data.mobileWeather;
      this.changeShowItem(this.environmentItems[0].elementType,this.environmentItems[0].name,this.environmentItems[0].unit);
    });
  }

  EnvironmentTrend() {
    Api.getEnvironmentDataTrend({
      projectCode: this.projectCode,
      projectName: this.projectConfig?.projectName ?? "",
      elementType: this.elementType,
      time: this.time,
    }).then((res) => {
      if (!res.data) return;
      this.lineData.xAxis = [];
      this.lineData.yAxis1 = [];
      this.lineData.interval = res.data?.[0]?.hnum ?? 0;
      this.lineData.end=res.data.length/res.data?.[0]?.hnum>10? Math.trunc((1-10/(res.data.length/res.data?.[0]?.hnum))*100):null;
      res.data?.forEach((e) => {
        this.lineData.xAxis.push(e.time);
        this.lineData.yAxis1.push(e.number);
      });
    });
  }
}
</script>

<style scoped lang="less">
@import "~@/styles/mixins.less";
@import "~@/styles/common.less";
* {
  margin: 0;
  // padding: 0;
}
.wrap {
  width: 100%;
  height: 100%;
  .wrapTop {
    width: 100%;
    height: 45%;
    background-image: url("../../../src/assets/extends/smartConstruction/hj_bg.png");
    background-size: 100%;
    position: relative;
    /deep/.van-nav-bar {
      background-color: transparent;
      .px2rem(margin-bottom,20px);
      .van-icon {
        color: white;
        .px2rem(font-size,40px);
      }
      .van-nav-bar__title {
        color: white;
        .px2rem(font-size,32px);
      }
    }
    /deep/.van-nav-bar::after {
      border: none;
    }
    .mask {
      .px2rem(width, 200px);
      .px2rem( height, 280px);
      background-color: transparent;
      position: absolute;
      left: 50%;
      transform: translate(-50%);
      top: 12%;
    }
  }
  .wrapBottom {
    width: 100%;
    height: 55%;
    background-color: #f3f5fa;
    position: relative;
    .chart {
      width: 100%;
      height: 100%;
      padding: 0 12px;
      position: absolute;
      top: -17.5%;
      .chartOne {
        width: 100%;
        height: 35%;
        .px2rem(margin-bottom,18px);
        .px2rem(border-radius, 5px);
        background-color: white;
        display: flex;
        justify-content: space-evenly;
        .px2rem(padding-top, 25px);
        .blueEnvi {
          display: flex;
          flex-direction: column;
          .px2rem(margin-top,10px);
          .px2rem(margin-left,10px);
          .px2rem(margin-right,10px);
          .px2rem(margin-bottom,10px);
          .px2rem(width, 130px);
          .px2rem(height, 130px);
          background-image: url("../../../src/assets/extends/smartConstruction/envi_blue.png");
          background-size: 100% 100%;
          text-align: center;

          & > p:nth-child(1) {
            .px2rem(margin-top, 20px);
            .px2rem(width, 130px);
            .px2rem(font-size, 20px);
            color: #ffffff;
            .px2rem(line-height,40px);
          }

          & > p:nth-child(2) {
            .px2rem(width, 130px);
            .px2rem(font-size, 20px);
            color: #ffffff;
            .px2rem(line-height,40px);
            .px2rem(margin-bottom, 60px);
          }

          & > span {
            color: black;
            .px2rem(font-size, 30px);
          }
        }

        .yellowEnvi {
          display: flex;
          flex-direction: column;
          .px2rem(margin-top,10px);
          .px2rem(margin-left,10px);
          .px2rem(margin-right,10px);
          .px2rem(margin-bottom,10px);
          .px2rem(width, 130px);
          .px2rem(height, 130px);
          background-image: url("../../../src/assets/extends/smartConstruction/envi_yellow.png");
          background-size: 100% 100%;
          text-align: center;

          & > p:nth-child(1) {
            .px2rem(margin-top, 20px);
            .px2rem(width, 130px);
            .px2rem(font-size, 20px);
            color: #ffffff;
            .px2rem(line-height,40px);
          }

          & > p:nth-child(2) {
            .px2rem(width, 130px);
            .px2rem(font-size, 20px);
            color: #ffffff;
            .px2rem(line-height,40px);
            .px2rem(margin-bottom, 60px);
          }

          & > span {
            color: black;
            .px2rem(font-size, 30px);
          }
        }

        .greenEnvi {
          display: flex;
          flex-direction: column;
          .px2rem(margin-top,10px);
          .px2rem(margin-left,10px);
          .px2rem(margin-right,10px);
          .px2rem(margin-bottom,10px);
          .px2rem(width, 130px);
          .px2rem(height, 130px);
          background-image: url("../../../src/assets/extends/smartConstruction/envi_green.png");
          background-size: 100% 100%;
          text-align: center;

          & > p:nth-child(1) {
            .px2rem(margin-top, 20px);
            .px2rem(width, 130px);
            .px2rem(font-size, 20px);
            color: #ffffff;
            .px2rem(line-height,40px);
          }

          & > p:nth-child(2) {
            .px2rem(width, 130px);
            .px2rem(font-size, 20px);
            color: #ffffff;
            .px2rem(line-height,40px);
            .px2rem(margin-bottom, 60px);
          }

          & > span {
            color: black;
            .px2rem(font-size, 30px);
          }
        }
      }
      .chartTwo {
        width: 100%;
        height: 75%;
        background-color: white;
        .px2rem(border-radius, 5px);
        .px2rem(padding-top ,20px);
        .viewTitle {
          width: 100%;
          height: 10%;
          display: flex;
          justify-content: space-between;
          .viewTitleLeft {
            width: 60%;
            .px2rem(padding-left, 15px);
            .px2rem(font-size, 40px);
            display: flex;
            .img {
              .px2rem( width, 45px);
              .px2rem( height, 50px);
              // background-image: url("../../../src/assets/extends/smartConstruction/hj_title.png");
              height: 100%;
              img {
                width: 100%;
                height: 100%;
              }
              .px2rem(margin-right,10px);
            }
          }
          .calendar {
            width: 35%;
            height: 100%;
            .px2rem(margin-right,20px);
            .px2rem( height, 50px);
            display: flex;
            background-color: #f5f6fa;
            border-radius: 20px;
            overflow: hidden;
            .calendar_icon{
              .px2rem(font-size,25px);
              .px2rem(padding-top,13px);
              .px2rem(padding-bottom,13px);
              .px2rem(padding-left,16px);
              .px2rem(padding-right,20px);
            }
            /deep/.calendar_Cell{
              background-color: #f5f6fa;
              padding: 0;
            }
          }
        }
      }
    }
  }
}
@font-face {
  font-family: 'icomoon';
  src:  url('fonts/icomoon.eot?w3dj81');
  src:  url('fonts/icomoon.eot?w3dj81#iefix') format('embedded-opentype'),
    url('fonts/icomoon.ttf?w3dj81') format('truetype'),
    url('fonts/icomoon.woff?w3dj81') format('woff'),
    url('fonts/icomoon.svg?w3dj81#icomoon') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

[class^="icon-"], [class*=" icon-"] {
  /* use !important to prevent issues with browser extensions that change fonts */
  font-family: 'icomoon' !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;

  /* Better Font Rendering =========== */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.icon-calendar:before {
  content: "\e953";
}
</style>