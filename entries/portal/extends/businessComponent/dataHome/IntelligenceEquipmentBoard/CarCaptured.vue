<template>
  <div class="car-captured full-height">
    <CardHeader :title="deviceName" @changeTime="changeTime" @closeModal="closeModal"/>
    <div class="medium flex">
      <div class="medium-left full-height">
        <CardTitle title="抓拍数据汇总"/>
        <div class="card-info flex flex-column flex-center">
          <div>抓拍总数</div>
          <div class="second"><span>{{ this.carNodes.totalNum }}</span>次</div>
        </div>
        <div class="card-info flex flex-column flex-center">
          <div>异常总数</div>
          <div class="person"><span>{{ this.carNodes.alarmNum }}</span>次</div>
        </div>
      </div>
      <div class="card-pie full-height flex flex-column">
        <CardTitle title="异常类别占比"/>
        <CircleEchart
          id="carWarningPieConfig"
          :chartData="warningPieConfig"
          class="flex-1"
        ></CircleEchart>
      </div>
      <div class="medium-right full-height flex flex-column">
        <CardTitle title="抓拍汇总"/>
        <EchartsCom
          id="'warningLineConfig-car'"
          :config="warningLineConfig"
          class="flex-1"
        ></EchartsCom>
        <div class="line-time card-kind">
          <div
            v-for="(item,index) in ['24小时','30天']"
            :key="index"
            :class="item===activeTime?'active-kind':''"
            class="kind"
            @click="changeLineTime(item)">
            {{ item }}
          </div>
        </div>
      </div>
    </div>
    <div class="bottom flex">
      <div class="bottom-left full-height flex flex-column">
        <CardTitle title="报警信息汇总"/>
        <div v-if="carNodes.details.length" class="flex-1 flex flex-column">
          <div>
            <div
              v-for="(value,key) in carNodes.details"
              :key="key"
              :class="activeCarItemKey===value.key?'active-kind':''"
              class="kind"
              @click="changeActiveAIItemKey(value.key)">
              {{ value.key }}
            </div>
          </div>
          <div class="flex-auto ai-list scrollbar-default">
            <div
              v-for="(item,index) in currentWarringInfo"
              :key="index"
              :class="index%2?'ai-list-item-odd':'ai-list-item-double'"
              class="ai-list-item"
              @click="changeActiveAIItemImg(index)">
              <img alt="" src="img/ai/pic_ai.png">
              <div :class="activeCarItemIndex===index?'active-item':''" class="flex flex-center-align flex-space-between ai-list-item-inner">
                <div class="flex flex-center-align time">
                  <img alt="" src="./img/ai/icon_ai2.png">
                  进场时间：{{ item.inTime }}
                </div>
                <div class="flex flex-center-align time">
                  <img alt="" src="./img/ai/icon_ai2.png">
                  车牌号：{{ item.deviceSn }}
                </div>
                <div class="flex flex-center-align time">
                  <img alt="" src="./img/ai/icon_ai1.png">
                  车牌颜色：{{ item.carPlateColor }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-right full-height" >
        <img :src="activeCarItemImg" alt="">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import CardHeader from "./CardHeader.vue";
import CardTitle from './CardTitle.vue';
import { CarNodes, CarNodesDetails} from "../../../type";
import {getCarCapturedList} from "../../../service/api";
import * as Type from "../../../type";
import moment from 'moment';
import CircleEchart from "../deviceManagement/circleEcharts.vue";
import { EchartsCom } from '../../../basicCustomComponent';
// import {exampleData} from "../../engineeringArchives/mock";
@Component({
  name: 'CarCaptured',
  components: {
    CardHeader,
    CardTitle,
    CircleEchart,
    EchartsCom
  }
})
export default class CarCaptured extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  @Prop() projectName!: string;
  deviceName: string = '车辆抓拍';
  carNodes: CarNodes = {
    totalNum:0,
    alarmNum:0,
    alarmTypes:[],
    dates:[],
    dateTotalNums:[],
    dateTotalAlarmNums:[],
    times:[],
    timeTotalNums:[],
    timeTotalAlarmNums:[],
    details: []
  };
  copyCarNodes: CarNodes|null = null;
  currentWarringInfo: CarNodesDetails[] = [];
  warningPieConfig:any = {
    data: [],
    isLabelLineShow: true,
    midText: "",
    legend: [],
    unitName: "",
    xlegend: "center",
    center: ["50%", "50%"],
    radius: ['50%', '90%'],
  };
  warningLineConfig = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['总车辆数量','报警车辆数量'],
      textStyle: {
        color: '#FFFFFF'
      }
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
      name: '次数',
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#FFFFFF'
        }
      }
    },
    series: [
      {
        name:'总车辆数量',
        data: [],
        type: 'line',
        smooth: true
      },
      {
        name:'报警车辆数量',
        data: [],
        type: 'line',
        smooth: true
      }
    ]
  };
  activeCarItemImg: string = '';
  selectTime: string = '';
  timer: any = null;
  activeTime: string = '30天';
  activeCarItemKey: string = '';
  activeCarItemIndex: number = 0;

  closeModal() {
    clearInterval( this.timer );
    this.$emit('closeModal')
  }

  changeActiveAIItemKey(key:string) {
    this.currentWarringInfo = [];
    this.activeCarItemKey = key;
    this.activeCarItemIndex = 0;
    this.carNodes.details.map((res)=> {
      if(res.key===key) {
        this.currentWarringInfo = res.value
      }
    })
    if(this.currentWarringInfo.length) {
      this.activeCarItemImg = this.currentWarringInfo[0].imgUrl;
    }
  }
  changeActiveAIItemImg(index:number) {
    this.activeCarItemImg = this.currentWarringInfo[index].imgUrl;
    this.activeCarItemIndex = index;
  }
  initParams() {
    this.warningPieConfig.data = [];
    this.warningPieConfig.legend = [];
    this.warningLineConfig.xAxis.data = [];
    this.warningLineConfig.series[0].data = [];
    this.warningLineConfig.series[1].data = [];
    this.activeTime = '30天';
    if(this.copyCarNodes) {
      for (const carNodesKey in this.copyCarNodes) {
        this.carNodes[carNodesKey] = this.copyCarNodes[carNodesKey]
      }
    }
  }
  init() {
    this.copyCarNodes = JSON.parse(JSON.stringify(this.carNodes));
    getCarCapturedList({appCode:this.projectCode??'',projectName:this.projectName??'',date:this.selectTime}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return ;
      for (const carNodesKey in this.carNodes) {
        this.carNodes[carNodesKey] = res.data[carNodesKey]
      }
      if(this.carNodes.alarmTypes && this.carNodes.alarmTypes.length) {
        this.carNodes.alarmTypes.forEach((item) => {
          this.warningPieConfig.data.push({ name: item.type, value: item.num }); //饼图
        });
        this.carNodes.alarmTypes.forEach((item) => {
          this.warningPieConfig.legend.push(item.type);
        });
      }
      if(this.carNodes.details.length) {
        this.currentWarringInfo = this.carNodes.details[0].value as Array<CarNodesDetails>;
        if(this.currentWarringInfo.length) {
          this.activeCarItemImg = this.currentWarringInfo[0].imgUrl;
        }
        this.activeCarItemKey = this.carNodes.details[0].key;
      }
      //@ts-ignore
      this.warningLineConfig.xAxis.data = this.carNodes.dates;
      //@ts-ignore
      this.warningLineConfig.series[0].data = this.carNodes.dateTotalNums;
      //@ts-ignore
      this.warningLineConfig.series[1].data = this.carNodes.dateTotalAlarmNums;
      this.warningLineConfig = JSON.parse(JSON.stringify(this.warningLineConfig))
    })
  }
  changeTime(t) {
    this.selectTime = t;
    this.initParams();
    this.init();
  }
  changeLineTime(item:string) {
    this.activeTime = item;
    if(item==='30天') {
      //@ts-ignore
      this.warningLineConfig.xAxis.data = this.carNodes.dates;
      //@ts-ignore
      this.warningLineConfig.series[0].data = this.carNodes.dateTotalNums;
      //@ts-ignore
      this.warningLineConfig.series[1].data = this.carNodes.dateTotalAlarmNums;
      this.warningLineConfig = JSON.parse(JSON.stringify(this.warningLineConfig))
    }else {
      //@ts-ignore
      this.warningLineConfig.xAxis.data = this.carNodes.times;
      //@ts-ignore
      this.warningLineConfig.series[0].data = this.carNodes.timeTotalNums;
      //@ts-ignore
      this.warningLineConfig.series[1].data = this.carNodes.timeTotalAlarmNums;
      this.warningLineConfig = JSON.parse(JSON.stringify(this.warningLineConfig))
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

<style lang="less" scoped>
@import '../../../styles/public.module.less';
@import './board-public.less';
.car-captured {
  color: white;
  .medium {
    .card-medium;
    .line-time {
      position: absolute;
      right: @spacing-large;

    }
  }
  .bottom {
    .card-bottom;
    .bottom-left {
      width: 70%;
    }
    .bottom-right {
      width: calc(30% - @spacing-large);
    }
  }
}
</style>
