<template>
  <div class="main">
    <div class="top">
      <div class="Progress">
        <div class="gennerl_title">
          <h4>进度运行情况</h4>
        </div>
        <div class="descriptionData">
          <div v-for="(item, index) in descriptionData" :key="index">
            <p>{{ item.name }}</p>
            <h5>
              <span> {{ item.value }}</span>
              <span>{{ item.type }}</span>
            </h5>
          </div>
        </div>
      </div>
      <div class="Output">
        <div class="gennerl_title">
          <h4>产值完成情况</h4>
        </div>
        <div class="outputValue_progress">
          <h5>总产值</h5>
          <div style="display: flex">
            <el-progress
              :textInside="true"
              :strokeWidth="26"
              :percentage="100"
            ></el-progress>
            <span>{{ totalOutputValue }}万元</span>
          </div>
          <h5>实际完成产值</h5>
          <div style="display: flex">
            <el-progress
              :textInside="true"
              :strokeWidth="22"
              :percentage="Number(completeRatio)"
              status="success"
            ></el-progress>
            <span>{{ completeValue }}万元</span>
          </div>
          <h5>剩余完成产值</h5>
          <div style="display: flex">
            <el-progress
              :textInside="true"
              :strokeWidth="22"
              :percentage="Number(leftRatio)"
              status="warning"
            ></el-progress>
            <span>{{ surplusValue }}万元</span>
          </div>
        </div>
      </div>
      <div class="status">
        <div class="gennerl_title">
          <h4>进度状态占比</h4>
        </div>
        <div class="piecharts">
          <CircleEchart
            :chartData="circleData"
            :isShowTitle="false"
            id="CircleEchart"
            style="width: 95%; height: 30vh; margin-left: 3%"></CircleEchart>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="gennerl_title">
        <h4>产品分析</h4>
      </div>
      <div style="height: 88%; width: 98%;">
        <LinEcharts :id="'fill'" :chartData="fillData"></LinEcharts>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component,Vue,Prop,Watch} from "vue-property-decorator";
import Progress from "element-ui/lib/progress";
import CircleEchart from "../MateriaManagement/circleEcharts.vue";
import LinEcharts from "./LineEcharts.vue";
import { getdeviation, getscheduleAnalyse, getScheduleAnalyseDate } from "./index.js";
import env from "@/config/env";
@Component({
  name:"ProgressOverview",
  components:{
    CircleEchart,
    [Progress.name]:Progress,
    LinEcharts
  }
})
export default class ProgressOverview extends Vue{
  projectCode: string = "";
  @Prop() projectName!: String;
  @Prop() projectLevel!: String;
  @Prop() treeId!: String;
  totalOutputValue: number = 0;
  completeValue: number = 0;
  surplusValue: number = 0;
  leftRatio: number = 0;
  completeRatio: number = 0;
  fillData: object = {
    xAxis: [],
    yAxis1: [],
    yAxis2: [],
    lengendLeft: "right",
    yname: "",
    yName1: "计划总产值",
    yName2: "实际总产值",
    lengend: ["计划总产值", "实际总产值"],
    start:90,
  };
  descriptionData: Array<any> = [
    {
      name: "总工期",
      value: 0,
      type: "天",
    },
    {
      name: "已施工",
      value: 0,
      type: "天",
    },
    {
      name: "开工日期",
      value: 0,
      type: "",
    },
  ];
  circleData: any = {
    data: [],
    isLabelLineShow: true,
    midText: "",
    legend: [],
    unitName: "元",
    xlegend: "right",
    center: ["50%", "50%"],
    radius: [100, 80],
    orient: "vertical",
    bottom: 100,
    fontSize: 28,
  };
  getinit() {
    getScheduleAnalyseDate(this.projectCode, this.projectName).then(res=>{
        if(!res.data.beginDate) return
        this.descriptionData[0].value = res.data.totalDays
        this.descriptionData[1].value = res.data.workDays
        this.descriptionData[2].value = res.data.beginDate.split("T")[0]
    })
    getdeviation(this.projectCode, this.treeId, this.projectName).then((res) => {
        if(!res.data) return
        //@ts-ignore
        this.fillData.yname ="总金额（万元）"
        //@ts-ignore
        this.fillData.xAxis = res.data.dateAxis;
        res.data.realValueAxis.forEach(e => {
          e =(e).toFixed(2)
        });
        res.data.planValueAxis.forEach(e => {
          e =(e).toFixed(2)
        });
        //@ts-ignore
        this.fillData.yAxis2=res.data.realValueAxis.map((item)=>{
          return item.toFixed(2)
        })
        //@ts-ignore
        this.fillData.yAxis1=res.data.planValueAxis.map((item)=>{
          return item.toFixed(2)
        })
      });
    getscheduleAnalyse(this.projectCode, this.treeId, this.projectName).then((res) => {
      if (res.data) {
        this.totalOutputValue = Number(((res.data.nodeAnalyseValue?.totalValue) / 10000).toFixed(2)) ;
        this.completeValue = Number(((res.data.nodeAnalyseValue?.completeValue) / 10000 ).toFixed(2)) ;
        this.completeRatio = Number((res.data.nodeAnalyseValue?.completeRatio * 100).toFixed(2));
        this.surplusValue = Number(((res.data.nodeAnalyseValue?.leftValue) / 10000).toFixed(2));
        this.leftRatio = Number((res.data.nodeAnalyseValue?.leftRatio * 100).toFixed(2));

        res.data.progressStateAnalyse.forEach((item) => {
          this.circleData.legend.push(item.progressStateDesc);
        });
        this.circleData.data = res.data.progressStateAnalyse.map(
          (item) => {
            return { value: item.num, name: item.progressStateDesc };
          }
        );
      }
    });
  }
  mounted() {
    //@ts-ignore
    this.projectCode = `${env.project}`;
    this.getinit();
  }
}
</script>

<style lang="less" scoped>
@import url("./ProgressOverview.less");
</style>
