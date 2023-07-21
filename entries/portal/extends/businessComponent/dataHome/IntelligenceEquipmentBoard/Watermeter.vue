<template>
  <div class="water-meter full-height">
    <CardHeader :title="currentDeviceName" @closeModal="closeModal" @changeTime="changeTime"/>
    <div class="medium flex">
      <div class="medium-left full-height">
        <CardTitle title="设备数据"/>
        <div class="card-info flex flex-column flex-center">
          <div>总耗水量</div>
          <div class="second"><span>{{ waterMeterInfo.total }}</span>吨</div>
        </div>
        <div class="card-info flex flex-column flex-center">
          <div>当日耗水量</div>
          <div class="person"><span>{{ waterMeterInfo.today }}</span>吨</div>
        </div>
        <div class="lately-time">
          <a-icon type="sync" />
          <span>{{ waterMeterInfo.time }}</span>
        </div>
      </div>
      <div class="medium-right full-height flex flex-column">
        <CardTitle title="设备数据分析"/>
        <EchartsCom
          id="'warningLineConfig-water-meter'"
          class="flex-1"
          :config="warningLineConfig"
        ></EchartsCom>
      </div>
    </div>
    <div class="card-bottom flex flex-column">
      <CardTitle title="设备数据汇总"/>
      <div class=" flex-1 flex flex-column">
        <div class="card-table-header">
          <div v-for="(item,index) in ['序号','上报时间','设备名称','设备编码','水量']" :key="index">
            {{ item }}
          </div>
        </div>
        <div v-if="waterMeterInfo.historys.length" class="flex-auto card-table-list" >
          <div
            class="card-table-content scrollbar-default"
            v-for="(item,index) in waterMeterInfo.historys"
            :key="index"
            :class="index%2?'even':'odd'">
            <div class="indexs"><span :class="index===0?'bg-red':index===1?'bg-org':index===2?'bg-ye':index<8?'bg-blue':''" >{{ index+1 }}</span></div>
            <div>{{ item.time }}</div>
            <div>{{ item.deviceName }}</div>
            <div>{{ item.deviceSn }}</div>
            <div>{{ item.total }}吨</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import CardTitle from './CardTitle.vue';
import CardHeader from './CardHeader.vue';
import * as Type from "../../../type";
import {WaterMeterInfo} from "../../../type";
import { getWaterMeterInfo } from "../../../service/api";
import moment from "moment";
import { EchartsCom } from '../../../basicCustomComponent';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';

@Component({
  name: 'WaterMeter',
  components: {
    CardHeader,
    CardTitle,
    EchartsCom,
    AIcon:Icon
  }
})
export default class WaterMeter extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  @Prop() projectName!: string;
  @Prop() currentDeviceSn!: string;
  @Prop() currentDeviceName!:string;
  selectTime: string = '';
  waterMeterInfo: WaterMeterInfo = {
    total: 0,
    today: 0,
    time: '',
    dates: [],
    watermeters: [],
    historys: []
  };
  copyWaterMeterInfo: WaterMeterInfo|null= null;
  timer: any = null;
  warningLineConfig = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      name: '日期',
      type: 'category',
      axisLine: {
        lineStyle: {
          color: '#FFFFFF'
        }
      },
      data: []
    },
    yAxis: {
      name: '水量/吨',
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#FFFFFF'
        }
      }
    },
    series: [
      {
        data: [],
        type: 'line',
        smooth: true
      }
    ]
  };
  init() {
    // this.waterMeterInfo.total = 0;
    // this.waterMeterInfo.today = 0;
    // this.waterMeterInfo.dates = [];
    // this.waterMeterInfo.watermeters = [];
    // this.waterMeterInfo.historys = [];
    this.copyWaterMeterInfo = JSON.parse(JSON.stringify(this.waterMeterInfo))
    getWaterMeterInfo({appCode:this.projectCode??'',projectName:this.projectName??'',date:this.selectTime,deviceSn:this.currentDeviceSn}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return ;
      for (const waterMeterInfoKey in this.waterMeterInfo) {
        if(res.data[waterMeterInfoKey]) {
          this.waterMeterInfo[waterMeterInfoKey] = res.data[waterMeterInfoKey]
        }
      }
      //@ts-ignore
      this.warningLineConfig.xAxis.data = this.waterMeterInfo.dates;
      //@ts-ignore
      this.warningLineConfig.series[0].data = this.waterMeterInfo.watermeters;
      this.warningLineConfig = JSON.parse(JSON.stringify(this.warningLineConfig))
      // for(let i=0;i<5;i++) {
      //   this.waterMeterInfo.historys = this.waterMeterInfo.historys.concat(this.waterMeterInfo.historys)
      // }
    })
  }
  closeModal() {
    clearInterval( this.timer );
    this.$emit('closeModal')
  }
  changeTime(t) {
    this.selectTime = t;
    this.initParams();
    this.init();
  }
  initParams() {
    this.warningLineConfig.xAxis.data = [];
    this.warningLineConfig.series[0].data = [];
    if(this.copyWaterMeterInfo) {
      for (const carNodesKey in this.copyWaterMeterInfo) {
        this.waterMeterInfo[carNodesKey] = this.copyWaterMeterInfo[carNodesKey]
      }
    }
  }
  mounted() {
    this.selectTime = moment(new Date()).format('YYYY-MM-DD');
    this.init();
    this.timer = setInterval(()=> {
      this.initParams();
      this.init();
    },2* 60 * 1000)
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import './board-public.less';
.water-meter {
  color: white;
  .medium {
    .card-medium;
    .medium-right {
      margin-left: @spacing-large;
      width: calc(78.763% - @spacing-large);
    }
  }
  .card-bottom {
    .card-table(10%,20%,30%,30%,10%,0%,0%,0%,0%)
  }
}
</style>
