<template>
  <div class="ai-recognition full-height">
    <CardHeader title="AI识别" @changeTime="changeTime" @closeModal="closeModal"/>
    <div class="medium flex">
      <div class="medium-left full-height">
        <CardTitle title="报警信息"/>
        <div class="card-info flex flex-column flex-center">
          <div>当日报警次数</div>
          <div class="second"><span>{{ aIRecognitionData.alarmNum }}</span>次</div>
        </div>
        <div class="card-info flex flex-column flex-center">
          <div>当日违规人数</div>
          <div class="person"><span>{{ aIRecognitionData.personNum }}</span>人</div>
        </div>
      </div>
      <div class="card-pie full-height flex flex-column">
        <CardTitle title="报警类别占比"/>
        <CircleEchart
          id="warningPieConfig"
          :chartData="warningPieConfig"
          class="flex-1"
        ></CircleEchart>
        <!--        <EchartsCom :config="warningPieConfig"/>-->
      </div>
      <div class="medium-right full-height flex flex-column">
        <CardTitle title="报警月度统计"/>
        <EchartsCom
          id="'warningLineConfig'"
          :config="warningLineConfig"
          class="flex-1"
        ></EchartsCom>
      </div>
    </div>
    <div class="bottom flex">
      <div class="bottom-left full-height flex flex-column">
        <CardTitle title="报警信息汇总"/>
        <div v-if="aIRecognitionData.details.length" class="flex-1 flex flex-column">
          <div>
            <div
              v-for="(value,key) in aIRecognitionData.details"
              :key="key"
              :class="activeAIItemKey===value.key?'active-kind':''"
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
              <img alt="" src="./img/ai/pic_ai.png">
              <div class="flex flex-center-align flex-space-between ai-list-item-inner" :class="activeAIItemIndex===index?'active-item':''">
                <div>{{ item.type }}  </div>
                <div class="flex flex-center-align time">
                  <img alt="" src="./img/ai/icon_ai2.png">
                  预警时间：{{ item.time }}
                </div>
                <div class="flex flex-center-align time">
                  <img alt="" src="./img/ai/icon_ai1.png">
                  识别人数：{{ item.num }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-right full-height" >
        <img :src="activeAIItemImg" alt="">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import { EchartsCom,LineEcharts } from '../../../basicCustomComponent';
import CircleEchart from "../deviceManagement/circleEcharts.vue";
import { exampleData } from "../../engineeringArchives/mock";
import {AIRecognitionnNodes, AIRecognitionnNodesDetails} from "../../../type";
import CardTitle from './CardTitle.vue';
import CardHeader from './CardHeader.vue';
import { getAIRecognitionInfo } from "../../../service/api";
import * as Type from "../../../type";
import moment from "moment";

@Component({
  name: 'AIRecognition',
  components: {
    EchartsCom,
    LineEcharts,
    CircleEchart,
    CardTitle,
    CardHeader
  }
})
export default class AIRecognition extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  @Prop() projectName!: string;
  selectTime: string = '';
  aIRecognitionData: AIRecognitionnNodes = {
    alarmNum: 0,
    personNum: 0,
    alarmTypes:[],
    dates:[],
    nums: [],
    details:[]
  };
  copyAIRecognitionData:AIRecognitionnNodes|null = null;
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
        data: [],
        type: 'line',
        smooth: true
      }
    ]
  };
  currentWarringInfo: AIRecognitionnNodesDetails[] = [];
  activeAIItemKey: string = '';
  activeAIItemImg: string = '';
  timer: any = null;
  activeAIItemIndex: number = 0;
  initParams() {
    this.warningPieConfig.data = [];
    this.warningPieConfig.legend = [];
    this.warningLineConfig.xAxis.data = [];
    this.warningLineConfig.series[0].data = [];
    if(this.copyAIRecognitionData) {
      for (const carNodesKey in this.copyAIRecognitionData) {
        this.aIRecognitionData[carNodesKey] = this.copyAIRecognitionData[carNodesKey]
      }
    }
  }
  init() {
    this.copyAIRecognitionData = JSON.parse(JSON.stringify(this.aIRecognitionData))
    getAIRecognitionInfo({appCode: this.projectCode??'',projectName:this.projectName??'',date:this.selectTime}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      for (const aIRecognitionDataKey in this.aIRecognitionData) {
        // this.aIRecognitionData[aIRecognitionDataKey] = exampleData.response.data.ai[aIRecognitionDataKey]
        this.aIRecognitionData[aIRecognitionDataKey] = res.data[aIRecognitionDataKey];
      }
      if(this.aIRecognitionData.alarmTypes.length) {
        this.aIRecognitionData.alarmTypes.forEach((item) => {
          this.warningPieConfig.data.push({ name: item.type, value: item.num }); //饼图
        });
        this.aIRecognitionData.alarmTypes.forEach((item) => {
          this.warningPieConfig.legend.push(item.type);
        });
      }
      if(this.aIRecognitionData.details.length) {
        this.currentWarringInfo = this.aIRecognitionData.details[0].value as Array<AIRecognitionnNodesDetails>;
        if(this.currentWarringInfo.length) {
          this.activeAIItemImg = this.currentWarringInfo[0].imgUrl;
        }
        this.activeAIItemKey = this.aIRecognitionData.details[0].key;
      }
      //@ts-ignore
      this.warningLineConfig.xAxis.data = this.aIRecognitionData.dates;
      //@ts-ignore
      this.warningLineConfig.series[0].data = this.aIRecognitionData.nums;
      this.warningLineConfig = JSON.parse(JSON.stringify(this.warningLineConfig))
    })
  }
  changeActiveAIItemKey(key:string) {
    this.currentWarringInfo = [];
    this.activeAIItemKey = key;
    this.activeAIItemIndex = 0;
    this.aIRecognitionData.details.map((res)=> {
      if(res.key===key) {
        this.currentWarringInfo = res.value;
      }
    });
    if(this.currentWarringInfo.length) {
      this.activeAIItemImg = this.currentWarringInfo[0].imgUrl;
    }
  }
  changeActiveAIItemImg(index:number) {
    this.activeAIItemImg = this.currentWarringInfo[index].imgUrl;
    this.activeAIItemIndex = index;
  }
  mounted() {
    this.selectTime = moment(new Date()).format('YYYY-MM-DD');
    this.init();
    this.timer = setInterval(()=> {
      this.initParams();
      this.init();
    },2* 60 * 1000)
    // console.log(this.warningLineConfig,'1111111',this.aIRecognitionData)
  };
  changeTime(t) {
    this.selectTime = t;
    this.initParams();
    this.init();
  }
  closeModal() {
    clearInterval( this.timer );
    this.$emit('closeModal')
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';
@import './board-public.less';
.ai-recognition {
  color: white;
  .medium {
    .card-medium;
  }
  .bottom {
    .card-bottom;
  }
}
</style>
