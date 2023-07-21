<template>
  <div class="main">
    <div class="leftContainer">
      <div class="gennerl_title">
        <h4>交底培训</h4>
      </div>
      <div class="shebeiList">
        <div
          @click="equimentHandle(item, index)"
          v-for="(item, index) in equipmentLists"
          :key="index"
        >
          <img src="./img/shebei.png" alt="" />
          <span :style="{ color: equipmentNum == index ? '#0071fe' : '' }">
            {{ item.jdmc1 }}
          </span>
        </div>
      </div>
    </div>
    <div class="rightContainer">
      <div class="titleCard">
        <div class="card">
          <img src="./img/ryjd_jdzs.png" alt="">
          <a-statistic
            :value="total"
            :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}"
          >
            <template #title>
              <span style="color:#fff">总交底人数(个)</span>
            </template>
          </a-statistic>
        </div>
        <div class="card">
          <img src="./img/ryjd_yqd.png" alt="">
          <a-statistic
            :value="checkedIn"
            :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}"
          >
            <template #title>
              <span style="color:#fff">已签到人数(个)</span>
            </template>
          </a-statistic>
        </div>
        <div class="card">
          <img src="./img/ryjd_wqd.png" alt="">
          <a-statistic
            :value="noCheckIn"
            :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}"
          >
            <template #title>
              <span style="color:#fff">未签到人数(个)</span>
            </template>
          </a-statistic>
        </div>
        <div class="card">
          <img src="./img/ryjd_wqd.png" alt="">
          <a-statistic
            :value="totalOutputValue"
            :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}"
          >
            <template #title>
              <span style="color:#fff">已完成人数(个)</span>
            </template>
          </a-statistic>
        </div>
      </div>
      <div class="statistics">
        <div class="chart">
          <div class="gennerl_title">
            <h4>签到统计</h4>
          </div>
          <div style="flex:1">
            <CircleEchart :chartData="circleData" id="CircleEchart"></CircleEchart>
          </div>
        </div>
        <div class="progress">
          <div class="gennerl_title">
            <h4>交底统计</h4>
          </div>
          <div class="outputValue_progress">
            <h5>已完成人数</h5>
            <div style="display: flex">
              <el-progress
                :textInside="true"
                :strokeWidth="26"
                :percentage="Number(FinishRatio)"
                status="success"
              ></el-progress>
              <span>{{ totalOutputValue }}人</span>
            </div>
            <h5>进行中人数</h5>
            <div style="display: flex">
              <el-progress
                :textInside="true"
                :strokeWidth="22"
                :percentage="Number(leftRatio)"
                status="warning"
              ></el-progress>
              <span>{{ surplusValue }}人</span>
            </div>
            <h5>未完成人数</h5>
            <div style="display: flex">
              <el-progress
                :textInside="true"
                :strokeWidth="22"
                :percentage="Number(completeRatio)"
                status="exception"
              ></el-progress>
              <span>{{ completeValue }}人</span>
            </div>
          </div>
        </div>
      </div>
      <div class="detail">
        <div class="gennerl_title">
          <h4>交底明细</h4>
        </div>
        <div class="detailTable">
          <el-table
            stripe
            height="310"
            :data="tableData.filter(data => !search || data.personName.toLowerCase().includes(search.toLowerCase()))"
            style="width: 100%">
            <el-table-column align="center" type="index"></el-table-column>
            <el-table-column
              width="80"
              align="center"
              label="姓名"
              prop="personName"></el-table-column>
            <el-table-column align="center" label="工种" prop="workType"></el-table-column>
            <el-table-column align="center" label="手机号" prop="phone"></el-table-column>
            <el-table-column align="center" label="签到时间" prop="checkInDate"></el-table-column>
            <el-table-column width="100" align="center" label="签到状态">
              <template slot-scope="scope">
                <span :style="{color: scope.row.signState == '已签到'?'#00c567': '#FF0042'}">
                  {{ scope.row.signState }}
                </span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="完成时间" prop="finishDate"></el-table-column>
            <el-table-column align="center" label="总交底时长" prop="studyTimeStr"></el-table-column>
            <el-table-column width="100" align="center" label="交底状态">
              <template slot-scope="scope">
                <span :style="{color: scope.row.finishState == '已完成'?'#00c567': scope.row.finishState == '未开始'?'#FF0042': scope.row.finishState == '进行中'?'#ffc62c': ''}">
                  {{ scope.row.finishState }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component,Vue,Prop,Watch} from "vue-property-decorator";
import {Statistic} from "@h3/antd-vue";
import Progress from "element-ui/lib/progress";
import { getSjjdList, getStatistical } from "./index.js";
import CircleEchart from "./pieEcharts.vue";
import env from "@/config/env";
@Component({
  name:"TechnicalDisclosure",
  components:{
    [Statistic.name]:Statistic,
    ElProgress: Progress,
    CircleEchart
  }
})
export default class TechnicalDisclosure extends Vue{
  @Prop({required:true})
  projectName!: string;
  @Prop({required:true})
  projectLevel!: string;

  totalOutputValue= 0;
  completeValue= 0;
  FinishRatio= 0;
  surplusValue= 0;
  leftRatio= 0;
  completeRatio= 0;
  tableData= [];
  equipmentLists= [];
  projectId= "";
  search= "";
  checkedIn=0;
  noCheckIn=0;
  projectCode='';
  circleData= {
    data: [],
    isLabelLineShow: true,
    midText: "",
    legend: ["已签到", "未签到"],
    unitName: "人",
    xlegend: "right",
    orient: "vertical",
    bottom: 100,
    fontSize: 28,
    radius:['70%', '60%']
  };

  titleDataList= [
    {
      name: "总交底人数",
      value: 0,
      type: "人",
    },
    {
      name: "已签到人数",
      value: 0,
      type: "人",
    },
    {
      name: "未签到人数",
      value: 0,
      type: "人",
    },
    {
      name: "已完成人数",
      value: 0,
      type: "人",
    },
  ];
  equipmentNum= 0;
  total= 0;

  equimentHandle(val, index) {
    this.projectId = val.id
    this.equipmentNum = index;
    this.getinit()
  };

  getLists() {
    getSjjdList(this.projectCode, this.projectName).then((res) => {
      this.equipmentLists = res.data;
      this.projectId = res.data[0].id
      this.getinit()
    });
  };
  getinit() {
    //@ts-ignore
    getStatistical(this.projectCode,this.projectId, this.projectName).then(res=>{
      this.circleData.data = []
      this.tableData = []
      this.totalOutputValue = 0
      this.completeValue = 0
      this.surplusValue = 0
      this.completeRatio = 0
      this.FinishRatio = 0
      this.leftRatio = 0
      this.total = 0
      this.circleData.data = res.data.signChart
      this.totalOutputValue = res.data.finishChart[0].value
      this.completeValue = res.data.finishChart[1].value
      this.surplusValue = res.data.finishChart[2].value
      this.total = this.totalOutputValue + this.completeValue + this.surplusValue
      //@ts-ignore
      this.completeRatio = (this.completeValue * 100 / ( this.totalOutputValue + this.completeValue + this.surplusValue)).toFixed(2)
      //@ts-ignore
      this.leftRatio = (this.surplusValue * 100 / ( this.totalOutputValue + this.completeValue + this.surplusValue)).toFixed(2)
      //@ts-ignore
      this.FinishRatio = (this.totalOutputValue * 100 / ( this.totalOutputValue + this.completeValue + this.surplusValue)).toFixed(2)
      this.titleDataList[0].value = this.total
      //@ts-ignore
      this.checkedIn=this.circleData.data[0].value;
      //@ts-ignore
      this.noCheckIn=this.circleData.data[1].value;
      this.titleDataList[3].value = this.totalOutputValue
      res.data.trainingList.forEach(e => {
        if(e.checkInDate) {
          e.checkInDate = e.checkInDate.split("T")[0] + " " + e.checkInDate.split("T")[1]
        }
        if(e.finishDate) {
          e.finishDate = e.finishDate.split("T")[0] + " " + e.finishDate.split("T")[1]
        }
      });
      this.tableData = res.data.trainingList
    })
  };

  mounted() {
    //@ts-ignore
    this.projectCode = `${env.project}`;
    this.getLists();
  }
  @Watch("projectName",{deep:true})
  projectNameChange(){
    if(this.projectLevel == "项目"){
      this.getinit();
    }
  }
}
</script>
<style lang="less" scoped>
@import url("./TechnicalDisclosure.less");
</style>
