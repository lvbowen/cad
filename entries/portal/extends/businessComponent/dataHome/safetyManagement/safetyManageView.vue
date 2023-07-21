<template>
  <div class="main">
    <div v-if="imgShow" class="empty">
      <img src="./1.png" alt="">
    </div>
    <div v-else>
      <div class="titleCard">
        <div class="card">
          <img src="./img/aqgl_icon_jrjc.png" alt="">
          <a-statistic
            :value="todayCheck"
            :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}"
          >
            <template #title>
              <span style="color:#fff">今日检查(个)</span>
            </template>
          </a-statistic>
        </div>
        <div class="card">
          <img src="./img/aqgl_icon_ljjc.png" alt="">
          <a-statistic
            :value="totalCheck"
            :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}"
          >
            <template #title>
              <span style="color:#fff">累计检查(个)</span>
            </template>
          </a-statistic>
        </div>
        <div class="card">
          <img src="./img/aqgl_icon_jrwt.png" alt="">
          <a-statistic
            :value="todayProblem"
            :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}"
          >
            <template #title>
              <span style="color:#fff">今日问题(个)</span>
            </template>
          </a-statistic>
        </div>
        <div class="card">
          <img src="./img/aqgl_icon_ljwt.png" alt="">
          <a-statistic
            :value="totalProblem"
            :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}"
          >
            <template #title>
              <span style="color:#fff">累计问题(个)</span>
            </template>
          </a-statistic>
        </div>
        <div class="card">
          <img src="./img/aqgl_icon_jrjc.png" alt="">
          <a-statistic
            :value="unfinishProblem"
            :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}"
          >
            <template #title>
              <span style="color:#fff">未整改问题(个)</span>
            </template>
          </a-statistic>
        </div>
      </div>
      <div class="charts">
        <div class="leftCharts">
          <div class="gennerl_title">
            <h4>安全分析</h4>
          </div>
          <div class="circleEcharts">
            <div class="circleEchart">
              <CircleEchart :id="CircleEchart1" :chartData="circleData1"></CircleEchart>
            </div>
            <div class="circleEchart">
              <CircleEchart :id="CircleEchart2" :chartData="circleData2"></CircleEchart>
            </div>
          </div>
        </div>
        <div class="rightChart">
          <div class="gennerl_title">
            <h4>问题统计</h4>
          </div>
          <div class="lineChart">
            <line-chart :id="lineChart" :lineData="lineData"></line-chart>
          </div>
        </div>
      </div>
      <div class="contentTable">
        <div class="gennerl_title">
          <h4>整改清单</h4>
        </div>
        <div class="tableBody">
          <div class="search">
            <a-input-search
              v-model="keyWord"
              class="searchInput"
              size="small"
              placeholder="请输入关键字"
              @pressEnter="pressEnter"
              @search="onSearch">
            </a-input-search>
          </div>
          <div class="timeSelect">
            <!-- <a-input readOnly class="timeInput" placeholder="开始时间"></a-input>
            <a-icon type="minus" />
            <a-input
              readOnly
              @click="isOpen=true"
              class="timeInput"
              placeholder="结束时间"></a-input> -->
            <a-range-picker
              :disabledDate="disabledDate"
              size="small"
              style="width:240px"
              @calendarChange="calendarChange"
              @change="trailTime">
            </a-range-picker>
          </div>
          <a-table
            size="small"
            :rowClassName="setRowClassName"
            :columns="tableColumns"
            :data-source="tableData"
            :pagination="false"
            :scroll="{ y: 300 }"
            rowKey="id">
            <template #index="text,record,index">
              <span :class="tableIndexClass(index)"><em>{{ index+1 }}</em></span>
            </template>
          </a-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {Table, Button, DatePicker,Statistic, Input,Icon} from "@h3/antd-vue";
import * as Api from '../../../service/api';
import CircleEchart from './circleEcharts.vue';
import LineChart from "./lineChart.vue";
import moment from "moment";
@Component({
  name: "safetyManageView",
  components: {
    [Statistic.name]:Statistic,
    [Table.name]:Table,
    [Input.Search.name]:Input.Search,
    [Input.name]:Input,
    [Icon.name]:Icon,
    LineChart,
    CircleEchart,
    // LineEcharts,
    // ARangePicker:
    [DatePicker.RangePicker.name]:DatePicker.RangePicker
  }
})
export default class allProtect extends Vue {
  @Prop() projectName!: string;
  @Prop() appCode!: string;
  isOpen=false;
  isShow: boolean = true;
  lineChart="lineChart";
  CircleEchart1="CircleEchart1";
  CircleEchart2="CircleEchart2";

  todayCheck=0;
  totalCheck=0;
  todayProblem=0;
  totalProblem=0;
  unfinishProblem=0;

  tableData: Array<{ [propsName: string]: string | number | null | boolean }> = [];
  allData: { [propsName: string]: any } | null = {};
  stackData: Array<{ [propsName: string]: any }> = [];
  get tableIndexClass(){
    return (index:number)=>{
      if(index==0){
        return ["tableIndex","backgroundColor1st"]
      }else if(index===1){
        return ["tableIndex","backgroundColor2nd"]
      }else if(index===2){
        return ["tableIndex","backgroundColor3th"]
      }
      else{
        return ["tableIndex"]
      }
    }
  }
  setRowClassName(record, index) {
    const rowColor = Number(index) % 2 === 1 ? "evenRowStyl" : "";
    return rowColor;
  }

  tableColumns: Array<{ [propsName: string]: any }> = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 70,
      scopedSlots: {customRender:"index"},
    },
    {
      title: '存在隐患',
      align: 'center',
      dataIndex: 'czyh',
      key: 'czyh',
    },
    {
      title: '隐患类型',
      align: 'center',
      dataIndex: 'yhlx',
      key: 'yhlx',
      width: 90,
    },
    {
      title: '隐患分类',
      align: 'center',
      dataIndex: 'yhfl',
      key: 'yhfl',
      width: 100,
    },
    {
      title: '项目名称',
      align: 'center',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
    },
    {
      title: '检查日期',
      align: 'center',
      dataIndex: 'jcrq',
      key: 'jcrq',
      width: 120,
      customRender:(text, record, index)=>{
        return moment(text).format("YYYY-MM-DD");
      }
    },
    {
      title: '整改措施及要求',
      align: 'center',
      dataIndex: 'zgcs',
      key: 'zgcs'
    },
    {
      title: '整改情况',
      align: 'center',
      dataIndex: 'zgqk',
      key: 'zgqk',
    },
    {
      title: '整改时间',
      align: 'center',
      dataIndex: 'zgsj',
      key: 'zgsj',
      width: 120,
      customRender:(text, record, index)=>{
        return moment(text).format("YYYY-MM-DD");
      }
    },
    {
      title: ' 复查情况',
      align: 'center',
      dataIndex: 'fcqk',
      key: 'fcqk',
    }];
  circleData1: { data: any, isLabelLineShow: boolean, midText: string, unitName: string } = {
    data: [],
    isLabelLineShow: true,
    midText: '问题\n分类',
    unitName: '个'
  }
  circleData2: { data: any, isLabelLineShow: boolean, midText: string, unitName: string } = {
    data: [],
    isLabelLineShow: true,
    midText: '整改\n占比',
    unitName: '个'
  }
  lineData: { [propsName: string]: any } = {
    xAxis: [],
    yAxis: [],
  };
  selectPriceDate: string = '';
  offsetDays: number = 259200 * 1000000 //最多选择范围;
  endTime: string = '';
  startTime: string = '';
  imgShow: boolean= false;
  keyWord: string ='';

  mounted() {
    this.getSafetyView();
  }
 async onSearch(value){
    await this.search();
  }
  async pressEnter(event:KeyboardEvent){
    await this.search();
  }
  async search(){
    await this.getTableList();
    if(this.keyWord){
       this.tableData=this.tableData.filter(item=>(item["czyh"] as string).includes(this.keyWord));
    }
    if(this.startTime && this.endTime){
      this.tableData=this.tableData.filter(item=>moment(item["jcrq"] as string).isBetween(this.startTime,this.endTime,null,'[]'));
    }
  }

  getSafetyView() {
    this.allData = {};
    Api.getSafetyView({appCode: this.appCode, projectName: this.projectName}).then(res => {
      if(res.errmsg == "暂无安全数据") {
        this.imgShow = true
      }else {
        this.imgShow = false
      }
      if (res.errcode !== 0) return;
      if (!res.data) return;
      this.allData = res.data;
      this.todayCheck=this.allData?.safetyStatistics.todayCheck;
      this.totalCheck=this.allData?.safetyStatistics.totalCheck;
      this.todayProblem=this.allData?.safetyStatistics.todayProblem;
      this.totalProblem=this.allData?.safetyStatistics.totalProblem;
      this.unfinishProblem=this.allData?.safetyStatistics.unfinishProblem;
      for (let key in this.allData?.['problemSort']) {
        this.circleData1.data.push({
          'name': this.allData?.['problemSort'][key].wtlx1 as string,
          'value': this.allData?.['problemSort'][key].count as number
        })
      }
      for (let key in this.allData?.['correctionRatio']) {
        this.circleData2.data.push({
          'name': this.allData?.['correctionRatio'][key].wtlx1 as string,
          'value': this.allData?.['correctionRatio'][key].count as number
        })
      }
      for (let key in this.allData?.['problemStatistics']) {
        this.lineData.xAxis.push(this.allData?.['problemStatistics']?.[key].time.replace("-","."));
        this.lineData.yAxis.push(this.allData?.['problemStatistics']?.[key].count);
      }
      this.tableData = this.allData?.rectificationListDTOList;
    });
  }

  async getTableList(){
    this.tableData = [];
    await Api.getSafetyView({appCode: this.appCode, projectName: this.projectName}).then(res => {
      if (res.errcode !== 0) return;
      if (!res.data) return;
      this.tableData = res.data?.rectificationListDTOList;
    });
  }

  trailTime(dates, dateStrings) {
    this.startTime = dateStrings[0];
    this.endTime = dateStrings[1];
    this.search();
  }

  disabledDate(current) {
    if (this.selectPriceDate) {
      let selectV = moment(this.selectPriceDate, 'YYYY-MM-DD').valueOf()
      return current > moment(this.formatDate(new Date(selectV + this.offsetDays).getTime()), 'YYYY-MM-DD') ||
        current > moment().endOf('day')
    } else {
      return current > moment().endOf('day')
    }
  }

  //选择开始时间/结束时间
  calendarChange(date) {
    this.selectPriceDate = date[0]
  }

  formatDate(value) {
    let date = new Date(value)
    let Y = date.getFullYear() + '-'
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    let D = date.getDate()
    return Y + '-' + M + '-' + D
  }
}
</script>

<style lang="less" scoped>
@import url("./safetyManageView.less");
</style>
