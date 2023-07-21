<template>
  <div class="wrap flex-column">
    <div class="wrap-card flex-space-between">
      <div class="item-card" v-for="(item,index) in cardList" :key="index">
        <img v-if="item.name==='设备总数（个）'" src="../../../../src/assets/extends/datahome/EquipmentStatistics/1.png" alt="">
        <img v-else-if="item.name==='当前使用（个）'" src="../../../../src/assets/extends/datahome/EquipmentStatistics/2.png" alt="">
        <img v-else-if="item.name==='累计巡检（次）'" src="../../../../src/assets/extends/datahome/EquipmentStatistics/3.png" alt="">
        <img v-else-if="item.name==='累计保养（次）'" src="../../../../src/assets/extends/datahome/EquipmentStatistics/4.png" alt="">
        <img v-else src="../../../../src/assets/extends/datahome/EquipmentStatistics/5.png" alt="">
        <a-statistic
          :value="item.value"
          :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}"
        >
          <template #title>
            <span style="color:#fff">{{ item.name }}</span>
          </template>
        </a-statistic>
      </div>
    </div>
    <div class="wrap-piechart flex-space-between">
      <div class="project-num">
        <a-title :value="'项目数量占比'"></a-title>
        <circleEchart :id="'circleEchart1'" :chartData="projectNumData" style="width: 100%; height: 27vh;"></circleEchart>
      </div>
      <div class="device-type">
        <a-title :value="'设备类型占比'"></a-title>
        <circleEchart :id="'circleEchart2'" :chartData="typesData" style="width: 100%; height: 27vh;"></circleEchart>
      </div>
    </div>
    <div class="project-repairOrder">
      <div class="flex-space-between">
        <a-title :value="'项目工单任务统计'"></a-title>
        <div class="flex">
          <div style="line-height: 30px">时间筛选：</div>
          <div v-for="(item,index) in tabList" :key="index">
            <div class="tabItem" @click="activeBar(index)" :class="activeIndex===index?'changeItem':''">{{ item.dateType }}</div>
          </div>
        </div>
      </div>
      <BarEchart :id="'barEchart'" :option="repairOrderData" style="width: 100%; height: 29.5vh;"></BarEchart>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import {Statistic} from "@h3/antd-vue";
import Title from  "./title.vue";
import circleEchart from "./Echart/circleEcharts.vue";
import BarEchart from "../../../basicCustomComponent/EchartsCom/BarEchart.vue"
import {companyAnalyse} from "../../../service/api"
import * as Type from "../../../type";

@Component({
  name: "index",
  components: {
    [Statistic.name]:Statistic,
    ATitle:Title,
    circleEchart,
    BarEchart
  },
})
export default class index extends Vue {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;

  cardList:Array<any>=[
    {
      name: "设备总数（个）",
      time: null,
      value: 0,
    },
    {
      name: "当前使用（个）",
      time: null,
      value: 0,
    },
    {
      name: "累计巡检（次）",
      time: null,
      value: 0,
    },
    {
      name: "累计保养（次）",
      time: null,
      value: 0,
    },
    {
      name: "累计维修（次）",
      time: null,
      value: 0,
    }
  ];
  projectNumData:any= {
    data: [],
    isLabelLineShow: true,
    tooltipShow: true,
    midText: "",
    legend: [],
    unitName: "",
    xlegend: "center",
    center: ["50%", "52%"],
    radius: [82, 70],
    length2:60,
    color: ['#2ca1ff','#0adbfa','#febe13','#65e5dd','#7b2cff','#fd5151','#f071ff', '#85f67a','#0baefd','#fdcd0b','#0bfdab','#ff5353','#ff72cb','#8488ff',],
  };
  typesData:any= {
    data: [],
    isLabelLineShow: true,
    tooltipShow: true,
    midText: "",
    legend: [],
    unitName: "",
    xlegend: "center",
    center: ["50%", "52%"],
    radius: [82, 70],
    length2:60,
    color: ['#2ca1ff','#0adbfa','#febe13','#65e5dd','#7b2cff','#fd5151','#f071ff', '#85f67a','#0baefd','#fdcd0b','#0bfdab','#ff5353','#ff72cb','#8488ff',],
  };

  tasksData:Array<any>=[];
  repairOrderData:{xAxis:string[],seriesData: { name:string,data:number[] }[],color:string[],color1:string[],unitName:string,dataZoom:boolean,start:number,}={
    xAxis:[],
    seriesData: [],
    color:['#00257F','#00257F','#155CE9','#FF6600'],
    color1:['#226BE0','#7FC1FF','#00EAFF','#FFB400'],
    unitName:'次',
    dataZoom:false,
    start:0,
  };
  tabList:Array<any>=[{dateType:'日'},{dateType:'月'},{dateType:'年'}];
  activeIndex:number=1;

  activeBar(index){
    this.activeIndex=index;
    if(index===0){
      this.changeBarData(this.tasksData[0].value)
    }else if(index===1){
      this.changeBarData(this.tasksData[1].value)
    }else if(index===2) {
      this.changeBarData(this.tasksData[2].value)
    }
  };
  changeBarData(data){
    this.repairOrderData.xAxis=[];
    this.repairOrderData.seriesData=[];
    data.forEach(item=>{
      this.repairOrderData.xAxis.push(item.name)
      if(this.repairOrderData.seriesData.length===0){
        item.value.forEach((i)=>{
          this.repairOrderData.seriesData.push({name: i.name,data:[i.value]})
        })
      }else {
        this.repairOrderData.seriesData.forEach((obj)=>{
          item.value.forEach((i)=>{
            if(obj.name===i.name)
              obj.data.push(i.value)
          })
        })
      }
    })
  }
  mounted(){
    companyAnalyse({appCode:this.projectCode??'',projectName:this.projectConfig?.projectName as string}).then(res=>{
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.cardList=res.data.indexs;
      res.data.nums.forEach(item=>{
        this.projectNumData.data.push({name:item.name,value:item.value})
      });
      res.data.types.forEach(item=>{
        this.typesData.data.push({name:item.name,value:item.value})
      })
      this.tasksData=res.data.tasks;
      this.changeBarData(this.tasksData[1].value)
    })
  }
};
</script>
<style lang="less" scoped>
@import "../../../styles/public.module.less";
.wrap-card{
  .item-card{
    display: flex;
    flex-flow: row nowrap;
    width: 16.5625vw;
    height: 10vh;
    background: url(../safetyManagement/img/data_bg.png) no-repeat;
    background-size: 100% 100%;
    margin-bottom:1%;
    img{
      width: 3.3333vw;
      height: 7vh;
      margin-top: 0.7813vw;
      margin-left: 2.6042vw;
    }
    /deep/.ant-statistic{
      margin-top: 0.8854vw;
      margin-left: 7.8125vw-2.6042vw-3.3333vw;
    }
  }
}
.wrap-piechart{
  width: 100%;
  margin-bottom:1%;
  .project-num{
    width:49.5%;
    height:32vh;
    background:url("../../../../src/assets/extends/datahome/equipmentView/k3_jdtj.png") no-repeat;
    background-size: 100% 100%;
    padding: 1.042vw;
  }
  .device-type{
    width:49.5%;
    height:32vh;
    background:url("../../../../src/assets/extends/datahome/equipmentView/k3_jdtj.png") no-repeat;
    background-size: 100% 100%;
    padding: 1.042vw;
  }
}
.project-repairOrder{
  width:100%;
  padding: 1.042vw;
  background:url("../../../../src/assets/extends/datahome/equipmentView/k3_zgqd.png") no-repeat;
  background-size: 100% 100%;
  .tabItem{
    width: 40px;
    height: 30px;
    background: rgba(35,185,255,0.1200);
    border: 1px solid #23B9FF;
    border-radius: 4px;
    text-align: center;
    line-height:30px;
    font-size: 14px;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: #FFFFFF;
    cursor: pointer;
    margin: 0 10px;
  }
  .changeItem{
    color: #23FFF2;
  }
}

</style>
