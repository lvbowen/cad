<template>
  <article style="display: flex">
    <div class="equipContainer" :role="mainShow?'showContainer':'hideContainer'">
      <section>
        <div class="viewTitle">
          <span>设备统计</span>
        </div>
        <div style="display: flex;flex-direction: row">
          <div class="describeTitle">
            <p>{{ data.equipRunStatics['总数'] }}</p>
            <span>设备总台数</span>
          </div>
          <div class="describeTitle">
            <p>{{ data.equipRunStatics['正常'] }}</p>
            <span>运行设备数</span>
          </div>
          <div class="describeTitle">
            <p>{{ data.equipRunStatics['离线'] }}</p>
            <span>离线设备数</span>
          </div>
        </div>
        <nav class="littleTitle" style="margin-top: 15px">♦ 类型分布</nav>
        <div style="width: 100%;height: 170px">
          <bar-echart
            id="barEcharts"
            :chartData="barData"
          ></bar-echart>
        </div>
      </section>
      <section>
        <div class="viewTitle">
          <span>设备登记</span>
        </div>
        <div style="display: flex;flex-direction: row;margin-top: 10px">
          <img :src="describeIn" alt="" style="width: 40px;height: 40px"/>
          <div class="describeTitle">
            <p>{{ data.inOutStateStatics['进场'] }}</p>
            <span>进场数量</span>
          </div>
          <img :src="describeOut" alt="" style="width: 40px;height: 40px"/>
          <div class="describeTitle">
            <p>{{ data.inOutStateStatics['退场'] }}</p>
            <span>出场数量</span>
          </div>
        </div>
        <div style="width: 100%;height: 180px">
          <donut-echarts
            id="DonutEcharts1"
            :chartData="donutData"
            :radius="['55%','65%']"
            :elseDescribe="{
              title: {
                text: '设备登记',
                x: 'center',
                y: 'center',
                textStyle: {
                  fontSize: 20,
                  color: '#29EEF3'
                }
              }}"></donut-echarts>
        </div>
      </section>
      <section>
        <div class="viewTitle">
          <span>定位状态</span>
        </div>
        <div style="width: 100%;height: 180px;margin-top: 10px">
          <donut-echarts
            id="DonutEcharts2"
            :chartData="pieData"
            :colorList="['#00DE44','#FF0000','#FFD643']"
            :radius="['0%','65%']"></donut-echarts>
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

import describeIn from '../../../../src/assets/extends/bim/smartConstruction/describe_in.png';
import describeOut from '../../../../src/assets/extends/bim/smartConstruction/describe_out.png';

import * as Api from '../../../service/api';

import {DonutEcharts, BarEchart} from '../../../basicCustomComponent';

@Component({
  name: 'constructTree',
  components: {DonutEcharts, BarEchart}
})
export default class constructTree extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;
  @Prop() equipId?: string;

  arrayClose: any = arrayClose;
  arrayOpen: any = arrayOpen;

  describeIn: any = describeIn;
  describeOut: any = describeOut;

  mainShow: boolean = true;

  data: any = {equipRunStatics: {'总数': 0, '正常': 0, '离线': 0}, inOutStateStatics: {'进场': 0, '退场': 0}};
  barData: { xAxis: Array<string>, yAxis1: Array<string>, unitName: string, minInterval: number } = {
    xAxis: [],
    yAxis1: [],
    unitName: "台",
    minInterval: 1,
  };
  pieData: Array<{ value: number, name: string }> = [];
  donutData: Array<{ value: number, name: string }> = [];


  mounted() {
    this.getBimEquipData();
  }

  changeOpen(v) {
    this.mainShow = v;
  }

  @Watch("equipId")
  personIdListener(val: string) {
    this.getBimEquipData(val)
  }

  getBimEquipData(val?: string) {
    this.data = {equipRunStatics: {'总数': 0, '正常': 0, '离线': 0}, inOutStateStatics: {'进场': 0, '退场': 0}};
    this.barData = {xAxis: [], yAxis1: [], unitName: "台", minInterval: 1,};
    this.donutData = [];
    this.pieData = []
    Api.getBimEquipData({
      appCode: this.projectCode,
      projectName: this.projectName,
      groupId: val ?? ''
    }).then(res => {
      if (res.errcode !== 0) return;
      if (!res.data) return;
      this.data = res.data;
      for (let key in res.data.equipClassStatics) {
        this.barData.xAxis.push(key);
        this.barData.yAxis1.push(res.data.equipClassStatics[key]);
      }
      for (let key in res.data.inOutStateStatics) {
        this.donutData.push({
          name: key,
          value: res.data.inOutStateStatics[key] as number
        })
      }
      for (let key in res.data.alertStateStatics) {
        this.pieData.push({
          name: key,
          value: res.data.alertStateStatics[key] as number
        })
      }
    })
  }

}
</script>

<style scoped lang="less">
.equipContainer {
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

  .describeTitle {
    width: 120px;
    text-align: center;

    & > p {
      width: 100%;
      font-size: 18px;
      font-family: Arial;
      font-weight: bold;
      color: #FFFFFF;
      line-height: 27px;
      margin-bottom: 0;
    }

    & > span {
      width: 100%;
      font-size: 12px;
      font-family: Source Han Sans CN;
      font-weight: bold;
      color: #fffaea;
    }
  }

  .littleTitle {
    width: 120px;
    font-size: 14px;
    font-family: Source Han Sans CN;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 27px;
    margin-left: 15px;
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
}

div[role=showContainer] {
  right: 15px;
}

div[role=hideContainer] {
  right: -330px;
}
</style>
