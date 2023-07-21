<template>
  <div class="elec-meter full-height">
    <CardHeader :title="currentDeviceName" @closeModal="closeModal" @changeTime="changeTime"/>
    <div class="medium flex">
      <div class="medium-left full-height">
        <CardTitle title="设备数据"/>
        <div class="card-info flex flex-column flex-center">
          <div>总耗电量</div>
          <div class="second"><span>{{ elecMeterInfo.total }}</span>kW·h</div>
        </div>
        <div class="card-info flex flex-column flex-center">
          <div>当日耗电量</div>
          <div class="person"><span>{{ elecMeterInfo.today }}</span>kW·h</div>
        </div>
        <div class="lately-time">
          <a-icon type="sync" />
          <span>{{ elecMeterInfo.time }}</span>
        </div>
      </div>
      <div class="medium-right full-height flex flex-column">
        <CardTitle title="设备数据分析"/>
        <EchartsCom
          id="warningLineConfig-elec-meter"
          class="flex-1"
          :config="warningLineConfig"
        ></EchartsCom>
      </div>
    </div>
    <div class="card-bottom flex flex-column">
      <CardTitle title="设备数据汇总"/>
      <div class=" flex-1 flex flex-column">
        <div class="card-table-header">
          <div v-for="(item,index) in ['序号','上报时间','设备名称','设备编码','电量']" :key="index">
            {{ item }}
          </div>
        </div>
        <div v-if="elecMeterInfo.historys.length" class="flex-auto card-table-list" >
          <div
            class="card-table-content scrollbar-default"
            v-for="(item,index) in elecMeterInfo.historys"
            :key="index"
            :class="index%2?'even':'odd'">
            <div class="indexs"><span :class="index===0?'bg-red':index===1?'bg-org':index===2?'bg-ye':index<8?'bg-blue':''" >{{ index+1 }}</span></div>
            <div>{{ item.time }}</div>
            <div>{{ item.deviceName }}</div>
            <div>{{ item.deviceSn }}</div>
            <div>{{ item.total }}kW·h</div>
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
import {ElecMeterInfo} from "../../../type";
import {getElecMeterData} from "../../../service/api";
import moment from "moment";
import { EchartsCom } from '../../../basicCustomComponent';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';

@Component({
  name: 'ElecMeter',
  components: {
    CardHeader,
    CardTitle,
    EchartsCom,
    AIcon: Icon
  }

})
export default class ElecMeter extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  @Prop() projectName!: string;
  @Prop() currentDeviceSn!: string;
  @Prop() currentDeviceName!:string;
  selectTime: string = '';
  timer: any = null;
  elecMeterInfo: ElecMeterInfo = {
    total: 0,
    today: 0,
    dates: [],
    time: '',
    elecmeters: [],
    historys: []
  };
  copyElecMeterInfo: ElecMeterInfo|null=null;
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
      name: '电量/kW·h',
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
  initParams() {
    this.warningLineConfig.xAxis.data = [];
    this.warningLineConfig.series[0].data = [];
    if(this.copyElecMeterInfo) {
      for (const carNodesKey in this.copyElecMeterInfo) {
        this.elecMeterInfo[carNodesKey] = this.copyElecMeterInfo[carNodesKey]
      }
    }
  }
  init() {
    // this.elecMeterInfo.total = 0;
    // this.elecMeterInfo.today = 0;
    // this.elecMeterInfo.dates = [];
    // this.elecMeterInfo.elecmeters = [];
    // this.elecMeterInfo.historys = [];
    this.copyElecMeterInfo = JSON.parse(JSON.stringify(this.elecMeterInfo))
    getElecMeterData({appCode:this.projectCode??'',projectName:this.projectName??'',date:this.selectTime,deviceSn:this.currentDeviceSn}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return ;
      for (const waterMeterInfoKey in this.elecMeterInfo) {
        if(res.data[waterMeterInfoKey]) {
          this.elecMeterInfo[waterMeterInfoKey] = res.data[waterMeterInfoKey]
        }
      }
      console.log(this.elecMeterInfo,'1111')
      //@ts-ignore
      this.warningLineConfig.xAxis.data = this.elecMeterInfo.dates;
      //@ts-ignore
      this.warningLineConfig.series[0].data = this.elecMeterInfo.elecmeters;
      this.warningLineConfig = JSON.parse(JSON.stringify(this.warningLineConfig))
      console.log(this.warningLineConfig,'this.warningLineConfig')
      // for(let i=0;i<5;i++) {
      //   this.elecMeterInfo.historys = this.elecMeterInfo.historys.concat(this.elecMeterInfo.historys)
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
.elec-meter {
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
