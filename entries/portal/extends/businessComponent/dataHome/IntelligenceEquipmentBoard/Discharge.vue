<template>
  <div class="discharge full-height">
    <CardHeader :title="currentDeviceName" @changeTime="changeTime" @closeModal="closeModal"/>
    <div class="medium card-medium">
      <div class="full-height flex flex-column">
        <CardTitle title="实时运行数据"/>
        <div class="flex flex-auto">
          <div v-for="(item,index) in dischargeData.dischargeTotal" :key="index" class="total-view flex flex-center-align">
            <img :src="require(`./img/xlpt/${item.img}.png`)" alt="">
            <div class="flex flex-column flex-center-align">
              <div class="text"> {{ item.text }}</div>
              <div><span class="value">{{ item.value }}</span>{{ item.dw }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom card-bottom flex flex-column">
      <CardTitle title="设备数据分析"/>
      <div class="flex-1 flex flex-column">
        <div class="card-table-header">
          <div v-for="(item,index) in ['序号','上报时间','设备名称','设备编号','今日工作次数','总重','正向斜角','侧向斜角','报警次数']" :key="index">
            {{ item }}
          </div>
        </div>
        <div v-if="dischargeData.historys.length" class="flex-auto card-table-list" >
          <div
            v-for="(item,index) in dischargeData.historys"
            :key="index"
            :class="index%2?'even':'odd'"
            class="card-table-content scrollbar-default">
            <div class="indexs"><span :class="index===0?'bg-red':index===1?'bg-org':index===2?'bg-ye':index<8?'bg-blue':''" >{{ index+1 }}</span></div>
            <div>{{ item.time }}</div>
            <div>{{ item.deviceName }}</div>
            <div>{{ item.deviceSn }}</div>
            <div>{{ item.totalWorkNum }}</div>
            <div>{{ item.totalWeight }}</div>
            <div>{{ item.positiveAngle }}</div>
            <div>{{ item.sideAngle }}</div>
            <div> {{ item.totalAlarmNum }}</div>
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
import {DefineTypes, DischargeDataInfo} from "../../../type";
import moment from "moment";
import {overviewConfig} from "./EquipmentBoardConfig";
import {getDischargeDataInfo} from "../../../service/api";
import * as Type from "../../../type";
@Component({
  name: 'Discharge',
  components: {
    CardHeader,
    CardTitle,
  }
})
export default class Discharge extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  @Prop() projectName!: string;
  @Prop() currentDeviceSn!: string;
  @Prop() currentDeviceName!:string;
  selectTime: string = '';
  timer: any = null;
  dischargeData:DischargeDataInfo = {
    dischargeTotal:[],
    historys: [],
    latest: {
      deviceName:'',
      deviceSn:'',
      limitWeight:0,
      overWeightPercentage:0,
      positiveAngle:0,
      sideAngle:'',
      time:'',
      totalAlarmNum:0,
      totalWeight:0,
      totalWorkNum:0
    }
  };
  closeModal() {
    clearInterval( this.timer );
    this.$emit('closeModal')
  }
  changeTime(t) {
    this.selectTime = t;
    this.init();
  }
  init() {
    this.dischargeData.historys = [];
    this.dischargeData.latest = {
      deviceName:'',
      deviceSn:'',
      limitWeight:0,
      overWeightPercentage:0,
      positiveAngle:0,
      sideAngle:'',
      time:'',
      totalAlarmNum:0,
      totalWeight:0,
      totalWorkNum:0
    };
    getDischargeDataInfo({appCode:this.projectCode??'',projectName:this.projectName??'',date:this.selectTime,deviceSn:this.currentDeviceSn}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return ;
      this.dischargeData.dischargeTotal?.map((item)=> {
        for (const dataKey in res.data?.latest) {
          if(item.field===dataKey) {
            item.value = res.data?.latest[dataKey]
          }
        }
      })
      this.dischargeData.historys = res.data.historys;
      // for(let i=0;i<5;i++) {
      //   this.dischargeData.historys = this.dischargeData.historys.concat(this.dischargeData.historys)
      // }
      this.dischargeData.latest= res.data.latest;
    })
    console.log(this.dischargeData,'ampere')
  }
  mounted() {
    this.selectTime = moment(new Date()).format('YYYY-MM-DD');
    this.dischargeData.dischargeTotal = overviewConfig.dischargeTotal as Array<DefineTypes>;
    this.init();
    this.timer = setInterval(()=> {
      this.init();
    },2* 60 * 1000)
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';
@import './board-public.less';
.discharge {
  color: white;
  .medium {
    .card-medium-view-total;
  }
  .bottom {
    .card-table(10%,15%,15%,15%,10%,10%,10%,10%,5%)
  }
}
</style>
