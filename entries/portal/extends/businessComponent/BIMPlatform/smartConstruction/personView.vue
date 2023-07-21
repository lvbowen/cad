<template>
  <article style="display: flex">
    <div class="personContainer" :role="mainShow?'showContainer':'hideContainer'">
      <section>
        <div class="viewTitle">
          <span>人员统计</span>
        </div>
        <div style="display: flex;flex-direction: row">
          <img :src="describeAll" alt="" style="width: 55px;height: 55px"/>
          <div class="describeTitle">
            <p>{{ data.workerStatics['在案总人数'] }}</p>
            <span>在案总人数</span>
          </div>
          <img :src="describePerson" alt="" style="width: 55px;height: 55px"/>
          <div class="describeTitle">
            <p>{{ data.workerStatics['进场'] }}</p>
            <span>进场总人数</span>
          </div>
        </div>
      </section>
      <section>
        <div class="viewTitle">
          <span>人员分析</span>
        </div>
        <nav class="littleTitle">♦ 年龄分析</nav>
        <div style="width: 100%;height: 180px">
          <donut-echarts
            id="DonutEcharts"
            :chartData="donutData"
            :radius="['55%','65%']"
            :elseDescribe="{
              title: {
                text: '年龄占比',
                x: 'center',
                y: 'center',
                textStyle: {
                  fontSize: 20,
                  color: '#29EEF3'
                }
              }}"></donut-echarts>
        </div>
        <nav class="littleTitle">♦ 地域统计</nav>
        <div style="width: 100%;height: 150px">
          <line-echarts
            id="lineChart"
            :chartData="lineData"></line-echarts>
        </div>
      </section>
      <section>
        <div class="viewTitle">
          <span>定位状态</span>
        </div>
        <div style="width: 100%;height: 180px">
          <donut-echarts
            id="pieChart"
            :radius="['0%','65%']"
            :chartData="donutDataOther"
            :colorList="['#00DE44','#FF0000','#FFD643']"
          ></donut-echarts>
        </div>
      </section>

      <img
        :src="arrayClose"
        alt=""
        v-show="!mainShow"
        class="array"
        @click="changeOpen(true)"/>
      <img
        :src="arrayOpen"
        alt=""
        v-show="mainShow"
        class="array"
        @click="changeOpen(false)"/>
    </div>
  </article>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

import arrayClose from '../../../../src/assets/extends/bim/smartConstruction/array_close.png';
import arrayOpen from '../../../../src/assets/extends/bim/smartConstruction/array_open.png';

import describeAll from '../../../../src/assets/extends/bim/smartConstruction/describe_all.png';
import describePerson from '../../../../src/assets/extends/bim/smartConstruction/describe_person.png';
import {DonutEcharts, LineEcharts} from '../../../basicCustomComponent';
import * as Api from '../../../service/api';

@Component({
  name: 'constructTree',
  components: {DonutEcharts, LineEcharts}
})
export default class constructTree extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;
  @Prop() personId?: string;

  arrayClose: any = arrayClose;
  arrayOpen: any = arrayOpen;

  describeAll: any = describeAll;
  describePerson: any = describePerson;

  data: any = {workerStatics:{'在案总人数':0, '进场':0}};
  mainShow: boolean = true;
  donutData: Array<{ value: number, name: string }> = [];
  donutDataOther: Array<{ value: number, name: string }> = [];
  lineData: { xAxis: Array<string>, yAxis: Array<string>, yName: string,minInterval:number } = {xAxis: [], yAxis: [], yName: "人",minInterval:1};

  mounted() {
    this.getBimPersonData();
  }

  getBimPersonData(val?: string) {
    this.donutData = [];
    this.donutDataOther = [];
    this.data = {workerStatics:{'在案总人数':0, '进场':0}};
    this.lineData = {xAxis: [], yAxis: [], yName: "人",minInterval:1};
    Api.getBimPersonData({
      appCode: this.projectCode,
      projectName: this.projectName,
      groupId: val ?? ''
    }).then(res => {
      if (res.errcode !== 0) return;
      if (!res.data) return;
      this.data = res.data;
      for (let key in res.data.ageStatics) {
        this.donutData.push({
          name: key,
          value: res.data.ageStatics[key] as number
        })
      }
      for (let key in res.data.alertStateStatics) {
        this.donutDataOther.push({
          name: key,
          value: res.data.alertStateStatics[key] as number
        })
      }
      for (let key in res.data.addressStatics) {
        this.lineData.xAxis.push(key);
        this.lineData.yAxis.push(res.data.addressStatics[key]);
      }
    })

  }

  changeOpen(v){
    this.mainShow=v;
  }

  @Watch("personId")
  personIdListener(val: string) {
    this.getBimPersonData(val)
  }
}
</script>

<style scoped lang="less">
.personContainer {
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

  .viewTitle {
    background: url("../../../../src/assets/extends/bim/smartConstruction/view_title.png");
    background-size: 100% 100%;
    width: 317px;
    height: 27px;
    margin: 20px auto 15px 5px;

    & > span {
      margin-left: 30px;
      width: 64px;
      font-size: 16px;
      font-family: Source Han Sans CN;
      font-weight: bold;
      color: #FFFFFF;
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
}

div[role=showContainer] {
  right: 15px;
}

div[role=hideContainer] {
  right: -330px;
}
</style>
