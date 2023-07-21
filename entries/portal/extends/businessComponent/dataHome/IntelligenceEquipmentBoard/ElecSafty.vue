<template>
  <div class="elec-safty full-height">
    <CardHeader :title="currentDeviceName" @changeTime="changeTime" @closeModal="closeModal"/>
    <div class="elec-type flex flex-end-justify">
      <div
        v-for="(item,index) in ['A相','B相','C相']"
        :key="index"
        :class="selectType===item?'active':''"
        class="flex flex-center-align"
        @click="changeElecType(item)">
        {{ item }}
      </div>
    </div>
    <div class="medium">
      <div class="full-height flex flex-column">
        <CardTitle title="实时运行数据"/>
        <div class="recent-time">
          <a-icon type="sync" />
          <div>数据更新：{{ elecSaftyData.latest.time }}</div>
        </div>
        <div class="flex flex-auto">
          <div v-for="(item,index) in elecSaftyData.elecTotal" :key="index" class="total-view flex flex-center-align">
            <img :src="require(`./img/aqyd/${item.img}.png`)" alt="">
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
          <div v-for="(item,index) in ['序号','最新更新时间','设备名称','设备编号','电流','频率','温度','电压']" :key="index">
            {{ item }}
          </div>
        </div>
        <div v-if="elecSaftyData.historys.length" class="flex-auto card-table-list" >
          <div
            v-for="(item,index) in elecSaftyData.historys"
            :key="index"
            :class="index%2?'even':'odd'"
            class="card-table-content scrollbar-default">
            <div class="indexs"><span :class="index===0?'bg-red':index===1?'bg-org':index===2?'bg-ye':index<8?'bg-blue':''" >{{ index+1 }}</span></div>
            <div>{{ item.time }}</div>
            <div>{{ item.deviceName }}</div>
            <div>{{ item.deviceSn }}</div>
            <div>{{ item.ampere }}A</div>
            <div>{{ item.frequency }}Hz</div>
            <div>{{ item.temperature }}°C</div>
            <div>{{ item.voltage }}V</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import CardTitle from './CardTitle.vue';
import CardHeader from './CardHeader.vue'
import * as Type from "../../../type";
import {DefineTypes, ElecSaftyHistory, ElecSaftyInfo} from "../../../type";
import moment from "moment";
import {overviewConfig} from "./EquipmentBoardConfig";
import {getElecSaftyData} from "../../../service/api";
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
@Component({
  name: 'ElecSafty',
  components: {
    CardHeader,
    CardTitle,
    AIcon: Icon
  }
})
export default class ElecSafty extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  @Prop() projectName!: string;
  @Prop() currentDeviceSn!: string;
  @Prop() currentDeviceName!:string;
  selectTime: string = '';
  selectType: string = 'A相';
  elecSaftyData:ElecSaftyInfo = {
    elecTotal:[],
    historys: [],
    latest: {
      ampere:0,
      deviceName:'',
      deviceSn:'',
      frequency:0,
      temperature:0,
      time:'',
      voltage:0
    }
  };
  timer: any = null;
  closeModal() {
    clearInterval( this.timer );
    this.$emit('closeModal')
  }
  changeTime(t) {
    this.selectTime = t;
    this.init();
  }
  changeElecType(type:string) {
    this.selectType = type;
    this.init();
  }
  init() {
    this.elecSaftyData.historys = [];
    this.elecSaftyData.latest = {
      ampere:0,
      deviceName:'',
      deviceSn:'',
      frequency:0,
      temperature:0,
      time:'',
      voltage:0
    };
    getElecSaftyData({appCode:this.projectCode??'',projectName:this.projectName??'',date:this.selectTime,deviceSn:this.currentDeviceSn,type:this.selectType}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return ;
      this.elecSaftyData.elecTotal?.map((item)=> {
        for (const dataKey in res.data?.latest) {
          if(item.field===dataKey) {
            item.value = res.data?.latest[dataKey]
          }
        }
      })
      this.elecSaftyData.historys = res.data.historys;
      this.elecSaftyData.latest= res.data.latest;
      // for(let i=0;i<5;i++) {
      //   this.elecSaftyData.historys = this.elecSaftyData.historys.concat(this.elecSaftyData.historys)
      // }
    })
    console.log(this.elecSaftyData,'ampere')
  }
  mounted() {
    this.selectTime = moment(new Date()).format('YYYY-MM-DD');
    //ts-ignore
    this.elecSaftyData.elecTotal = overviewConfig.elecTotal as Array<DefineTypes>;
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
.elec-safty {
  color: white;
  .elec-type {
    position: absolute;
    top: 0;
    height: 7.42738%;
    left: 50%;
    transform: translateX(-50%);
    >div {
      padding: 0 @spacing-large;
      height: 80%;
      transition: all 0.5s;
      cursor: pointer;
      font-size: 18px;
      color: #F3FCFF;;
    }
    .active {
      background-image: url("./img/aqyd/aqyd_btn_bg.png");
      background-size: cover;
    }
  }
  .medium {
    .card-medium-view-total;
  }
  .bottom {
    .card-table(10%,15%,15%,15%,15%,10%,10%,10%,0%)
  }
}
</style>
