<template>
  <div class="equipment-overvie">
    <div class="equipmentovervie-top">
      <div class="equipment-top">
        <div class="equipment-title">设备统计</div>
        <div class="equipmenttop-content">
          <div class="description-data">
            <div v-for="(item, index) in descriptionData" :key="index" class="data-item">
              <div class="item-icon">
                <img
                  src="../../../../src/assets/extends/datahome/equipmentView/设备总台数.png"
                  alt=""
                  v-if="item.name=='设备总台数'">
                <img
                  src="../../../../src/assets/extends/datahome/equipmentView/在场设备数.png"
                  alt=""
                  v-else-if="item.name=='在场设备数'">
                <img
                  src="../../../../src/assets/extends/datahome/equipmentView/退场设备数.png"
                  alt=""
                  v-else>
              </div>
              <div class="item-val">
                <p>{{ item.name }}</p>
                <h5>
                  <span>{{ item.value }}</span>
                  <span>{{ item.type }}</span>
                </h5>
              </div>
            </div>
          </div>
          <div class="statistics-piecharts">
            <CircleEchart
              :chartData="circleData"
              id="CircleEchart"
              style="width: 95%; height: 30vh; margin-left: 3%"
            ></CircleEchart>
          </div>
        </div>
      </div>
      <div class="present-time">
        <div class="equipment-title">在场时间</div>
        <div class="content-data" v-for="(item, index) in PresentData" :key="index">
          <p>{{ item.type }}</p>
          <div class="progress-bar">
            <div
              class="progress-item"
              :style="{ width: item.num/365>1?'400px':item.num/365*400+ 'px' }"
              :class="changeBackground(item)"
            ></div>
            <div>{{ item.num }}天</div>
          </div>
        </div>
      </div>
      <div class="repeat-play">
        <div class="equipment-title">设备重复进场</div>
        <div
          class="repeatplay-list"
          v-for="(item, index) in RepeatPlayData"
          :key="index"
        >
          <div class="item-img" :class="changeImg(item)"></div>
          <div class="item-text">{{ item.type }}</div>
          <div class="item-totalnum">{{ item.num }}</div>
        </div>
      </div>
    </div>
    <div class="equipment-bottom">
      <div class="equipment-title bottom-title">
        设备统计
        <div class="chart-tab">
          <div
            class="tab-item"
            v-for="(item, index) in TabData"
            :key="index"
            @click="itemChange(index)"
            :class="ActiveIndex == index ? 'active-style' : ''"
          >
            {{ item.tabName }}
          </div>
        </div>
      </div>
      <BarEcharts
        id="barEcharts"
        :chartData="barData"
        :barWidth="15"
      ></BarEcharts>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import CircleEchart from "./circleEcharts.vue";
import BarEcharts from "./EquipmentBarEchart.vue";
import env from "@/config/env";
import {getEquipmentScreenInfo} from "./server/index.js";

@Component({
  name: "Equipmentoverview",
  components: {
    CircleEchart,
    BarEcharts,
  },
})
export default class Equipmentoverview extends Vue {
  deviceType: Number = 4;
  projectCode: String = "";
  @Prop() projectName!: String;
  @Prop() projectLevel!: String;
  descriptionData: Array<any> = [
    {
      name: "设备总台数",
      value: 0,
      type: "台",
    },
    {
      name: "在场设备数",
      value: 0,
      type: "台",
    },
    {
      name: "退场设备数",
      value: 0,
      type: "台",
    },
  ];
  circleData: any = {
    data: [],
    isLabelLineShow: true,
    midText: "",
    legend: [],
    unitName: "",
    xlegend: "center",
    center: ["50%", "50%"],
    radius: [100, 80],
  };
  barData: {
    xAxis: Array<string>;
    yAxis1: Array<string>;
    yAxis2: Array<string>;
    yAxis3: Array<string>;
    yAxis4: Array<string>;
    legendData: Array<string>;
    unitName: string;
    minInterval: number;
  } = {
    xAxis: [],
    yAxis1: [],
    yAxis2: [],
    yAxis3: [],
    yAxis4: [],
    legendData: ["一般陆地机械设备", "特种设备", "临时用电设备", "船舶"],
    unitName: "台",
    minInterval: 1,
  };
  TabData: Array<any> = [
    {id: 1, tabName: "进场"},
    {id: 2, tabName: "退场"},
  ];
  TabList1: any = {};
  TabList2: any = {};
  ActiveIndex: Number = 0;
  PresentData: Array<any> = [];
  RepeatPlayData: Array<any> = [];

  itemChange(index) {
    this.ActiveIndex = index;
    if (index == 0) {
      this.barData.xAxis = this.TabList1.dateList;
      this.barData.yAxis1 = this.TabList1.commonNum;
      this.barData.yAxis2 = this.TabList1.specialNum;
      this.barData.yAxis3 = this.TabList1.tempNum;
      this.barData.yAxis4 = this.TabList1.shipNum;
    } else if (index == 1) {
      this.barData.xAxis = this.TabList2.dateList;
      this.barData.yAxis1 = this.TabList2.commonNum;
      this.barData.yAxis2 = this.TabList2.specialNum;
      this.barData.yAxis3 = this.TabList2.tempNum;
      this.barData.yAxis4 = this.TabList2.shipNum;
    }
  }

  changeImg(item) {
    if (item.type.indexOf("一般陆地机械设备") > -1) {
      return "img-one";
    } else if (item.type.indexOf("特种设备") > -1) {
      return "img-two";
    } else if (item.type.indexOf("临时用电设备") > -1) {
      return "img-three";
    } else if (item.type.indexOf("船舶") > -1) {
      return "img-four";
    }
  }

  changeBackground(item) {
    if (item.type.indexOf("特种设备") > -1) {
      return "progress-one";
    } else if (item.type.indexOf("船舶") > -1) {
      return "progress-one";
    }
  }

  getinit() {
    getEquipmentScreenInfo(
      this.projectCode,
      this.projectName,
      this.projectLevel,
      this.deviceType
    ).then((res) => {
      this.descriptionData[0].value = res.data.totalNum;
      this.descriptionData[1].value = res.data.inNum;
      this.descriptionData[2].value = res.data.outNum;
      res.data.pieChartDTOList.forEach((item) => {
        this.circleData.data.push({name: item.type, value: item.num}); //饼图
      });
      res.data.pieChartDTOList.forEach((item) => {
        this.circleData.legend.push(item.type);
      });
      this.PresentData = res.data.onlineTime;
      this.RepeatPlayData = res.data.repeatEntry;
      this.barData.xAxis = res.data.entry.dateList;
      this.barData.yAxis1 = res.data.entry.commonNum;
      this.barData.yAxis2 = res.data.entry.specialNum;
      this.barData.yAxis3 = res.data.entry.tempNum;
      this.barData.yAxis4 = res.data.entry.shipNum;
      this.TabList1 = res.data.entry;
      this.TabList2 = res.data.exit;
    });
  }

  mounted() {
    this.projectCode = `${env.project}`;
    this.getinit();
  }
}
</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.equipment-overvie {
  width: 100%;
  height: 100%;
  padding: 10px;

  .equipment-title {
    width: 326px;
    font-size: 16px;
    //border-left: 4px solid #0074ff;
    background: url("../../../../src/assets/extends/datahome/equipmentView/title_bg.png");
    background-size: 100% 100%;
    padding-left: 30px;
    height: 9%;
    line-height: 20px;
    margin-bottom: 10px;
    font-weight: 700;
  }

  .equipmentovervie-top {
    width: 100%;
    display: flex;
    margin-bottom: 0.5%;

    .equipment-top {
      width: 48%;
      //   height: 16vw;
      min-height: 16vw;
      //background: rgba(54, 126, 255, 0.15);
      background: url("../../../../src/assets/extends/datahome/equipmentView/k3_jdtj.png");
      background-size: 100% 100%;
      padding: 10px;
      margin-right: 1%;

      .equipmenttop-content {
        width: 100%;
        overflow: hidden;

        .description-data {
          width: 30%;
          float: left;

          .data-item {
            width: 100%;
            //margin-right: 2%;
            height: 8vh;
            padding: 2vh;
            margin-bottom: 5.5%;
            background: url("../../../../src/assets/extends/datahome/equipmentView/data_bg.png");
            background-size: 100% 100%;
            display: flex;

            .item-val {
              p {
                color: #fff;
              }

              h5 {
                :nth-child(1) {
                  font-size: 2.5vh;
                  color: #00fcf9;
                  font-weight: 700;
                  font-family: Arial, Helvetica, sans-serif;
                  margin-right: 5px;
                }

                :nth-child(2) {
                  font-size: 1vh;
                  color: rgba(255, 255, 255, 0.5);
                }
              }
            }

            .item-icon {
              width: 50px;
              height: 50px;
              margin-right: 10%;
              display: block;

              img {
                width: 100%;
                height: 100%;
              }
            }
          }
        }

        .statistics-piecharts {
          width: 70%;
          height: 300px;
          float: left;
        }
      }
    }

    .present-time {
      width: 30%;
      min-height: 16vw;
      //background: rgba(54, 126, 255, 0.15);
      background: url("../../../../src/assets/extends/datahome/equipmentView/k7_zlgl.png");
      background-size: 100% 100%;
      padding: 10px;
      margin-right: 1%;

      .content-data {
        margin-bottom: 20px;

        p {
          margin-bottom: 10px;
        }

        .progress-bar {
          display: flex;
          height: 16px;
          line-height: 16px;
          color: #666666;

          .progress-item {
            min-width: 1px;
            height: 16px;
            background-color: #2068fd;
            border-radius: 8px;
            margin-right: 10px;
          }

          .progress-one {
            background-color: #eca608;
          }
        }
      }
    }

    .repeat-play {
      width: 20%;
      min-height: 16vw;
      //background: rgba(54, 126, 255, 0.15);
      background: url("../../../../src/assets/extends/datahome/equipmentView/k1_xmxx.png");
      background-size: 100% 100%;
      padding: 10px;

      .repeatplay-list {
        width: 100%;
        height: 55px;
        display: flex;
        line-height: 55px;
        margin-bottom: 18px;

        .item-img {
          width: 55px;
          height: 55px;
          margin-right: 20px;
        }

        .img-one {
          background: url("./Img/pic1.png");
          background-size: 100% 100%;
        }

        .img-two {
          background: url("./Img/pic2.png");
          background-size: 100% 100%;
        }

        .img-three {
          background: url("./Img/pic3.png");
          background-size: 100% 100%;
        }

        .img-four {
          background: url("./Img/pic4.png");
          background-size: 100% 100%;
        }

        .item-text {
          width: 170px;
        }
      }
    }
  }

  .equipment-bottom {
    width: 100%;
    height: 19.7vw;
    //background: rgba(54, 126, 255, 0.15);
    background: url("../../../../src/assets/extends/datahome/equipmentView/k2_jctj.png");
    background-size: 100% 100%;
    padding: 10px;
    position: relative;

    .bottom-title {
      height: 8%;

      .chart-tab {
        width: 150px;
        position: absolute;
        top: 12px;
        right: 40px;
        display: flex;
        justify-content: space-around;

        .tab-item {
          cursor: pointer;
          width: 50px;
          height: 25px;
          text-align: center;
          line-height: 25px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #103788;
        }
      }
    }
  }

  .active-style {
    background-color: #0a55fd;
  }
}
</style>
