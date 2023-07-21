<template>
  <div class="Equipmentovervie">
    <div class="Top">
      <div class="EquipmentTop">
        <div class="EquipmentTitle">进度运行情况</div>
        <div class="EquipmentTopContent">
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
      </div>
      <div class="PresentTime">
        <div class="EquipmentTitle">产值完成情况</div>
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
      <div class="RepeatPlay">
        <div class="EquipmentTitle">进度状态占比</div>
        <div class="piecharts">
          <CircleEchart
            :chartData="circleData"
            id="CircleEchart"
            style="width: 95%; height: 30vh; margin-left: 3%"
          ></CircleEchart>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="EquipmentTitle">产品分析</div>
      <div style="height: 88%; width: 98%;">
        <LinEcharts :id="'fill'" :chartData="fillData"></LinEcharts>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import CircleEchart from "./Echarts/pieEcharts.vue";
import env from "@/config/env";
import { getdeviation, getscheduleAnalyse, getScheduleAnalyseDate } from "./server/index.js";
import Progress from "element-ui/lib/progress";
import LinEcharts from "../../BIMPlatform/Echarts/LineEcharts2.vue";

@Component({
  name: "Equipmentoverview",
  components: {
    LinEcharts,
    CircleEchart,
    ElProgress: Progress,
  },
})
export default class Equipmentoverview extends Vue {
  projectCode: String = "";
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
    unitName: "万元",
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
        this.fillData.yAxis2 = res.data.realValueAxis;
        //@ts-ignore
        this.fillData.yAxis1 = res.data.planValueAxis;
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
    this.projectCode = `${env.project}`;
    this.getinit();
  }
}
</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.Equipmentovervie {
  width: 100%;
  height: 100%;
  padding: 10px;
  .EquipmentTitle {
    font-size: 16px;
    border-left: 4px solid #0074ff;
    padding-left: 10px;
    height: 20px;
    line-height: 20px;
    margin-bottom: 10px;
    font-weight: 700;
  }
  .Top {
    width: 100%;
    display: flex;
    margin-bottom: 1%;
    .EquipmentTop {
      width: 20%;
      min-height: 16vw;
      background: rgba(54, 126, 255, 0.15);
      padding: 10px;
      margin-right: 1%;
      .EquipmentTopContent {
        width: 100%;
        overflow: hidden;
        .descriptionData {
          width: 100%;
          div {
            width: 65%;
            height: 83px;;
            padding: 10px 20px;
            margin: 0 auto;
            margin-bottom: 15px;
            background: url("./img/k.png");
            background-size: 100% 100%;
            p {
              color: #c3eaff;
              font-size: 14px;
              margin: 0;
            }
            h5 {
              text-align: right;
              :nth-child(1) {
                font-size: 24px;
                color: #fff;
                font-weight: 700;
                font-family: HuXiaoBo-NanShen;
                margin-right: 5px;
              }
              :nth-child(2) {
                font-size: 1vh;
                color: #03eba1;
              }
            }
          }
        }
      }
    }
    .piecharts {
      width: 100%;
      height: 300px;
    }
    .PresentTime {
      width: 35%;
      min-height: 16vw;
      background: rgba(54, 126, 255, 0.15);
      padding: 10px;
      margin-right: 1%;
      .outputValue_progress {
        margin-bottom: 15px;
        height: 25vh;
        padding: 20px;
        padding-top: 10px;
        h4 {
          margin-bottom: 20px;
        }
        span {
          vertical-align: sup;
          font-size: 14px;
        }
        h5 {
          margin-bottom: 5px;
          text-align: left;
          color: #fff;
          font-size: 13px;
        }
      }
    }
    .RepeatPlay {
      width: 45%;
      min-height: 16vw;
      background: rgba(54, 126, 255, 0.15);
      padding: 10px;
    }
  }
  .bottom {
    width: 100%;
    height: 45vh;
    background: rgba(54, 126, 255, 0.15);
    padding: 10px;
  }
  .activeStyle {
    background-color: #0a55fd;
  }
}
</style>

<style lang="less">
.Equipmentovervie {
  .el-progress {
    display: inline-block;
    width: 80%;
    margin-right: 10px;
    margin-bottom: 40px;
  }
  .el-progress-bar__outer {
    border-radius: 0;
  }
  .el-progress-bar__inner {
    border-radius: 0;
  }
  .el-progress.is-success .el-progress-bar__inner {
    background-color: #00da8e;
  }
  .el-progress.is-warning .el-progress-bar__inner {
    background-color: #f1b500;
  }
}
</style>
