<template>
  <article style="display: flex">
    <db-enlarge v-if="bigImg.length!==0" :imgSrc="bigImg" @clickit="viewImg"></db-enlarge>
    <div class="videoContainer" :role="mainShow?'showContainer':'hideContainer'" v-if="data">
      <section>
        <div class="viewTitle">
          <span>监控设备</span>
        </div>
        <div style="display: flex;flex-direction: row">
          <div class="describeTitle">
            <p>{{ data.stateStatics['在线设备数'] }}</p>
            <span>运行设备数</span>
          </div>
          <div class="describeTitle">
            <p>{{ data.stateStatics['离线设备数'] }}</p>
            <span>离线设备数</span>
          </div>
        </div>
      </section>
      <section>
        <div class="viewTitle">
          <span>运行状态</span>
        </div>
        <div style="width: 100%;height: 180px">
          <donut-echarts
            id="DonutEcharts"
            :chartData="donutData"
            :radius="['55%','65%']"
            :colorList="['#00DE44','#8d8c8c']"
            :elseDescribe="{
              title: {
                text: '设备占比',
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
          <span>最新抓拍</span>
        </div>
        <div style="height: 440px;overflow-y: auto;margin-top: 10px">
          <div v-for="(v,i) in data.photoList" :key="i" @dblclick="enlargePic(v)">
            <Tooltip>
              <template slot="title">
                {{ v.videoName }}
                {{ v.captureTime }}
              </template>
              <img :src="v.url" alt="" style="width: 300px;height: 150px;margin-bottom: 10px"/>
            </Tooltip>
          </div>
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


import {Tooltip} from "@h3/antd-vue";

import * as Api from '../../../service/api';


import {DonutEcharts, DbEnlarge} from '../../../basicCustomComponent';


@Component({
  name: 'constructTree',
  components: {DonutEcharts, DbEnlarge, Tooltip}
})
export default class constructTree extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;
  @Prop() videoId?: string;

  arrayClose: any = arrayClose;
  arrayOpen: any = arrayOpen;


  mainShow: boolean = true;

  bigImg: string = '';

  data: any = null;
  donutData: Array<{ value: number, name: string }> = [];

  mounted() {
    this.getBimVideoData();
  }

  changeOpen(v) {
    this.mainShow = v;
  }

  @Watch("videoId")
  personIdListener(val: string) {
    this.getBimVideoData(val)
  }

  enlargePic(v) {
    this.bigImg = v.url;
  }

  getBimVideoData(val?: string) {
    this.donutData = [];
    this.data = null;
    Api.getBimVideoData({
      appCode: this.projectCode,
      projectName: this.projectName,
      groupId: val ?? ''
    }).then(res => {
      if (res.errcode !== 0) return;
      if (!res.data) return;
      this.data = res.data;
      for (let key in res.data.stateStatics) {
        this.donutData.push({
          name: key,
          value: res.data.stateStatics[key] as number
        })
      }
    })

  }

  viewImg() {
    this.bigImg = '';
  }
}
</script>

<style scoped lang="less">
.videoContainer {
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
    width: 160px;
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

::-webkit-scrollbar-track {
  border-radius: 0;
  background: transparent;
}

</style>
