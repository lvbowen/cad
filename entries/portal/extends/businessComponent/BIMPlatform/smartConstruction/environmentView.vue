<template>
  <article style="display: flex">
    <div class="environmentContainer" :role="mainShow?'showContainer':'hideContainer'" v-if="data">
      <section>
        <div class="viewTitle">
          <span>天气数据</span>
        </div>
        <iframe :src="data.weather" frameborder="0" style="z-index: 1"></iframe>
        <div class="mask"></div>
      </section>
      <section>
        <div class="viewTitle">
          <span>空气质量</span>
        </div>
        <div style="width: 100%;height: 130px;margin-top:10px">
          <gauge-echarts
            id="ddd"
            :chartData="gaugeData"></gauge-echarts>
        </div>
      </section>
      <section>
        <div class="viewTitle">
          <span>环境数值</span>
        </div>
        <div class="environmentalContents">
          <div
            style="cursor:pointer"
            v-for="(item,key) in environArray"
            :key="key"
            @click="environmentalItemClick(item.type,item.unit,item.title)">
            <div class="environmentalcontent" :class="getenvironmentalBackground(key)">
              <em>{{ item.value|numFixed(2) }}</em>
              <i v-html="item.unit"></i>
            </div>
            <h4 class="environmentalTitle">{{ item.title }}</h4>
          </div>
        </div>
      </section>
      <section>
        <div class="viewTitle">
          <span>趋势分析</span>
        </div>
        <div style="width: 100%;height: 180px;margin-top:10px">
          <line-echarts
            id="lineChart"
            :chartData="lineData"></line-echarts>
        </div>
      </section>

      <img
        :src="arrayClose"
        alt=""
        v-show="!mainShow"
        class="array"
        @click="()=>{this.mainShow=true;}"/>
      <img
        :src="arrayOpen"
        alt=""
        v-show="mainShow"
        class="array"
        @click="()=>{this.mainShow=false;}"/>
    </div>
  </article>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

import arrayClose from '../../../../src/assets/extends/bim/smartConstruction/array_close.png';
import arrayOpen from '../../../../src/assets/extends/bim/smartConstruction/array_open.png';

import * as Api from '../../../service/api';

import {GaugeEcharts} from '../../../basicCustomComponent';
import LineEcharts from './lineEchartsEnvironment.vue';

@Component({
  name: 'environmentView',
  components: {GaugeEcharts, LineEcharts}
})
export default class environmentView extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;
  @Prop() environId?: string;

  arrayClose: any = arrayClose;
  arrayOpen: any = arrayOpen;


  mainShow: boolean = true;
  gaugeData: { value: number, name: string, color: string, maxData: number, colorStart?: string, colorEnd?: string, } = {
    value: 0,
    name: '',
    color: "#fff",
    maxData: 400
  }
  data: any = null;
  lineData: any = {
    legend: ["风速"],
    yName: "m/s",
    xAxis: [],
    yAxis1: [],
    textStyle: "#0A0A0A",
    legendColor: "#fff",
    formatter: "",
    end: 100,
    interval: [],
  };
  time: string = '';
  type: number = 0;
  unit: string = '';
  title: string = '';
  environArray: { title: string, unit: string, type: number, value: string }[] = []

  mounted() {
    this.addDate();
    this.getBimEnvironmentData();
  }

  addDate() {
    const nowDate = new Date();
    const date = {
      year: nowDate.getFullYear(),
      month: nowDate.getMonth() + 1,
      date: nowDate.getDate(),
    }
    const newmonth = date.month > 10 ? date.month : '0' + date.month
    const day = date.date > 10 ? date.date : '0' + date.date
    this.time = date.year + '-' + newmonth + '-' + day

  }



  environmentalItemClick(type: number, unit: string, title: string) {
    this.type = type;
    this.unit = unit;
    this.title = title;
    this.EnvironmentTrend();
  }

  getenvironmentalBackground(index: number) {
    if (index % 3 === 0) {
      return "backgroundY";
    } else if (index % 3 === 1) {
      return "backgroundG";
    } else {
      return "backgroundB";
    }
  }

  @Watch("environId")
  personIdListener(val: string) {
    this.getBimEnvironmentData(val)
  }

  getBimEnvironmentData(val?: string) {
    this.gaugeData = {
      value: 0,
      name: '',
      color: '#fff',
      maxData: 400,
      colorStart: '#2bf308',
      colorEnd: '#fa0303',
    };
    this.data = null;
    Api.getBimEnvironmentData({
      appCode: this.projectCode,
      projectName: this.projectName,
      groupId: val ?? ''
    }).then(res => {
      if (res.errcode !== 0) return;
      if (!res.data) return;
      this.data = res.data;
      this.gaugeData.value = res.data.airData.airQuality.airPollutionIndex;
      this.gaugeData.name = res.data.airData.airQuality.airPollutionRank;
      this.gaugeData.color = res.data.airData.airQuality.color;
      this.environArray = [];
      res.data.airData.environmentItemDTOList.forEach((item, i) => {
        if (i <= 7) {
          this.environArray.push({
            title: item.name,
            unit: item.unit,
            value: item.value,
            type: item.elementType
          })
        }
      });
      if (this.environArray.length !== 0) {
        this.type = this.environArray?.[0].type as number;
        this.unit = this.environArray?.[0].unit as string;
        this.title = this.environArray?.[0].title as string;
      }
      this.lineData.xAxis = [];
      this.lineData.yAxis1 = [];
      this.lineData.interval = res.data?.trendList[0]?.hnum ?? 0;
      res.data?.trendList.forEach((e) => {
        this.lineData.xAxis.push(e.time);
        this.lineData.yAxis1.push(e.number);
      });
    })

  }

  EnvironmentTrend() {
    this.lineData = {
      legend: [this.title],
      yName: this.unit,
      xAxis: [],
      yAxis1: [],
      textStyle: "#0A0A0A",
      legendColor: "#fff",
      formatter: "",
      end: 100,
      interval: [],
    };
    Api.getEnvironmentDataTrend(
      {
        projectCode: this.projectCode,
        projectName: this.projectName,
        elementType: String(this.type),
        time: this.time
      }
    ).then((res) => {
      if (!res.data) return;
      this.lineData.xAxis = [];
      this.lineData.yAxis1 = [];
      this.lineData.interval = res.data?.[0]?.hnum ?? 0
      res.data?.forEach((e) => {
        this.lineData.xAxis.push(e.time);
        this.lineData.yAxis1.push(e.number);
      });
    });
  }
}
</script>

<style scoped lang="less">
.environmentContainer {
  background: url("../../../../src/assets/extends/bim/smartConstruction/right_container.png");
  background-size: 100% 100%;
  width: 355px;
  height: 800px;
  position: fixed;
  top: 12vh;
  right: 15px;

  .array {
    width: 26px;
    height: 35px;
    position: absolute;
    right: 330px;
    top: 383px;
  }

  & > section {
    margin: 10px 5px 0 30px;
  }

  .viewTitle {
    background: url("../../../../src/assets/extends/bim/smartConstruction/view_title.png");
    background-size: 100% 100%;
    width: 317px;
    height: 27px;

    & > span {
      margin-left: 30px;
      width: 64px;
      font-size: 16px;
      font-family: Source Han Sans CN;
      font-weight: bold;
      color: #FFFFFF;
    }
  }

  .mask {
    width: 300px;
    height: 150px;
    margin-top: -150px;
    z-index: 9999999999;
    filter: alpha(opacity=0);
    opacity: 0;
    background: transparent;
  }
}

.environmentalContents {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-items: center;
  flex: 1;

  .environmentalcontent {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    min-width: 55px;
    min-height: 55px;
    margin: 3px 10px;

    & > em,
    & > i {
      font: 12px 'SourceHanSansCN-Regular';
      color: #fff;
    }
  }

  .environmentalTitle {
    margin-top: 2px;
    text-align: center;
    font: 13px 'SourceHanSansCN-Regular';
    color: #fff;
  }

  .backgroundB {
    background: url("../../../../src/assets/extends/bim/smartConstruction/envi_green.png") no-repeat;
    background-size: 100% 100%;
  }

  .backgroundG {
    background: url("../../../../src/assets/extends/bim/smartConstruction/envi_yellow.png") no-repeat;
    background-size: 100% 100%;
  }

  .backgroundY {
    background: url("../../../../src/assets/extends/bim/smartConstruction/envi_blue.png") no-repeat;
    background-size: 100% 100%;
  }
}


div[role=showContainer] {
  right: 15px;
}

div[role=hideContainer] {
  right: -330px;
}
</style>
