<template>
  <div class="container">
    <div class="left">
      <div class="top">
        <div class="title">
          <h4 class="titleContent">今日告警类型分析</h4>
        </div>
        <div class="pieChart">
          <pie-chart :id="pieChartId" :chartData="pieData"></pie-chart>
        </div>
      </div>
      <div class="bottom">
        <div class="title">
          <h4 class="titleContent">告警趋势</h4>
        </div>
        <div class="selects">
          <a-select v-model="selectAlarmTypeTrend" @change="handleAlarmChangeTrend">
            <a-select-option v-for="(item,index) in alarmTypes" :key="index" :value="item">{{
              item
            }}
            </a-select-option>
          </a-select>
          <a-select class="last" v-model="selectTimeType" @change="handleTimeTypeChange">
            <a-select-option v-for="(item,index) in timeTypes" :key="index" :value="item.value">
              {{ item.title }}
            </a-select-option>
          </a-select>
        </div>
        <div class="lineChart">
          <line-Chart :id="lineChartId" :lineData="lineData"></line-Chart>
        </div>
      </div>
    </div>
    <div class="center">
      <h4 class="centerTitle">今日各类告警统计</h4>
      <div class="centerStatistics">
        <div class="statisticsCards" v-for="(item,index) in alarmTypeStatistics" :key="index">
          <div class="statisticsCard">
            <span>{{ item.alarmType }}</span>
            <em><i>{{ item.number }}</i>次</em>
          </div>
        </div>
      </div>
      <div class="centerPics">
        <a-carousel autoplay>
          <div class="pic" v-for="(item,index) in carouselSrcs" :key="index">
            <img :src="item" alt="" style="width: 100%;height: 100%">
          </div>
        </a-carousel>
      </div>
    </div>
    <div class="right">
      <div class="title">
        <h4 class="titleContent">最新告警</h4>
      </div>
      <div class="selectClass">
        <a-select v-model="selectAlarmType" @change="handleAlarmChange">
          <a-select-option v-for="(item,index) in alarmTypes" :key="index" :value="item">{{ item }}
          </a-select-option>
        </a-select>
        <a-select v-model="selectDeviceType" @change="handleDeviceChange">
          <a-select-option v-for="(item,index) in deviceTypes" :key="index" :value="item.id">
            {{ item.value }}
          </a-select-option>
        </a-select>
      </div>
      <div class="rightMessages">
        <div class="alarm_content" v-for="(v,i) in todayAlarms" :key="i">
          <div class="alarm_title">
            <span>{{ v.videoName }}</span>
          </div>
          <div class="alarm_main">
            <a-tooltip>
              <template slot="title">
                点击查看大图
              </template>
              <img
                :src="v.signAvatar"
                alt=""
                @click="getBigSignAvatar(v.id)"
                class="alarm_small_pic"/></a-tooltip>
            <main>
              <article class="alarm_detail">
                <span>聚集 : </span>
                <strong>{{ v.gatherStatus === 1 ? '是' : '否' }}</strong>
              </article>
              <article class="alarm_detail">
                <span>闯入 : </span>
                <strong>{{ v.tooling === 0 ? '未知' : v.tooling === 2 ? '是' : '否' }}</strong>
              </article>
              <article class="alarm_detail">
                <span>人数 : </span>
                <strong>{{ v.personCount }}</strong>
              </article>
              <article class="alarm_detail">
                <span>记录时间 : </span>
                <strong>{{ v.signTime }}</strong>
              </article>
              <article class="alarm_detail">
                <span>打电话 : </span>
                <strong>{{ v.calling === 0 ? '未知' : v.calling === 1 ? '是' : '否' }}</strong>
              </article>
              <article class="alarm_detail">
                <span>安全帽 : </span>
                <strong>{{ v.safetyhat === 0 ? '未知' : v.safetyhat === 1 ? '未带' : '已戴' }}</strong>
              </article>
              <article class="alarm_detail">
                <span>抽烟 : </span>
                <strong>{{ v.smoking === 0 ? '未知' : v.smoking === 1 ? '是' : '否' }}</strong>
              </article>
            </main>
          </div>
        </div>
      </div>
    </div>
    <a-modal
      v-model="visible"
      forceRender
      destroyOnClose
      title="告警详情"
      :wrapClassName="modalwrapClassName"
      :footer="null"
      centered>
      <img :src="selectAlarmItem.signBigAvatar" alt="" style="width: 472px;height: 300px">
    </a-modal>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Prop, InjectReactive} from "vue-property-decorator";
import {Select, Icon, Modal, Button, Carousel} from "@h3/antd-vue";
import * as Api from "../../../service/alarmApi";
import LineChart from "./LineChart.vue";
import PieChart from "./PieChart.vue";
import * as Type from "../../../type";
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';

@Component({
  name: "AIAnalyseNew",
  components: {
    [Select.name]: Select,
    [Select.Option.name]: Select.Option,
    [Icon.name]: Icon,
    [Modal.name]: Modal,
    [Button.name]: Button,
    [Carousel.name]: Carousel,
    ATooltip: Tooltip,
    LineChart,
    PieChart
  }
})
export default class AIAnalyseNew extends Vue {
  @InjectReactive("project") projectCode?: string;
  // @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;
  @Prop({required:true})
  projectName!: string;
  // projectName: string = '';
  // projectCode:string="";
  visible: boolean = false;
  modalwrapClassName: string = "modalwrapClassName";

  alarmTypes: Array<string> = ["全部", "聚集", "闯入", "打电话", "抽烟", "未佩戴安全帽", "未穿工装"];
  deviceTypes: Array<any> = [{value: '全部', id: '全部--'}];
  deviceChoose: Array<string> = [];
  selectAlarmType: string = this.alarmTypes[0];
  selectDeviceType: string = this.deviceTypes[0].value;
  selectAlarmTypeTrend: string = this.alarmTypes[0];
  timeTypes: Array<any> = [{title: "今天", value: 1}, {title: "近七天", value: 2}, {
    title: "近30天",
    value: 3
  }];
  selectTimeType: number = this.timeTypes[0].value;
  todayAlarms: { bigPic: string, captureTime: string, deviceName: string, devicePosition: string, safeRuleName: string, safeRuleTypeName: string, smallPic: string }[] = [];
  selectAlarmItem: any = {};
  alarmTypeStatistics: { alarmType: string, number: number, proportion: number }[] = [
    {alarmType: "聚集", number: 0, proportion: 0},
    {alarmType: "闯入", number: 0, proportion: 0},
    {alarmType: "打电话", number: 0, proportion: 0},
    {alarmType: "抽烟", number: 0, proportion: 0},
    {alarmType: "未佩戴安全帽", number: 0, proportion: 0},
    {alarmType: "未穿工装", number: 0, proportion: 0},
  ]
  carouselSrcs: string[] = [];

  lineChartId: string = "lineChartId";
  lineData: { xAxis: Array<string>, yAxis: Array<string>, yAxisName: string, name: string, xAxisInterval: number } = {
    xAxis: [],
    yAxis: [],
    yAxisName: "次",
    name: "",
    xAxisInterval: 0
  };

  pieChartId: string = "pieChartId";
  pieData: { data: any, isLabelLineShow: boolean, midText: string, unitName: string } = {
    data: [],
    isLabelLineShow: true,
    midText: '',
    unitName: '个'
  }


  async mounted() {
    // this.projectName = this.projectConfig?.projectName ?? '';
    // this.projectCode = `${env.project}`;
    this.getVideoByProjectName()
    await this.getAlarmTypeStatistics();
    await this.getTodayAlarm();
    await this.getAlarmTrend();
  }

  async getVideoByProjectName() {
    this.deviceTypes = [{value: '全部', id: '全部--'}];
    const {data, errcode} = await Api.getVideoByProjectName({
      appCode: this.projectCode ?? "",
      projectName: this.projectName
    });
    if (data) {
      data.forEach(item => {
        this.deviceTypes.push({
          value: item.channelName,
          id: item.channelName + '-' + item.deviceId + '-' + item.channelId
        })
      })
    }
  }

  async getTodayAlarm() {
    const {data, errcode} = await Api.getRecentAlarm({
      appCode: this.projectCode ?? "",
      projectName: this.projectName,
      alarmType: this.selectAlarmType === "全部" ? "" : this.selectAlarmType,
      deviceSn: this.selectDeviceType === "全部" ? "" : this.deviceChoose[1],
      deviceChannel: this.selectDeviceType === "全部" ? "" : this.deviceChoose[2]
    });
    this.todayAlarms = [];
    data?.forEach(item => {
      this.todayAlarms.push({...item})
    });
  }

  async getAlarmTypeStatistics() {
    const {data, errcode} = await Api.getAlarmTypeStatisticsNew({
      appCode: this.projectCode ?? "",
      projectName: this.projectName
    });
    this.carouselSrcs = [];
    this.pieData.data = [];
    data?.alarmType.forEach(item => {
      const index = this.alarmTypeStatistics.findIndex(at => at.alarmType === item.alarmType);
      if (index > -1) {
        this.$set(this.alarmTypeStatistics[index], "number", item.number);
        this.$set(this.alarmTypeStatistics[index], "proportion", item.proportion);
      }
      this.pieData.data.push({
        'name': item?.alarmType as string,
        'value': item?.number as number
      })
    });
    this.carouselSrcs = data?.attachments;
  }

  async getAlarmTrend() {
    this.lineData.xAxis = [];
    this.lineData.yAxis = [];
    const {data, errcode} = await Api.getAlarmTrendNew({
      appCode: this.projectCode ?? '',
      projectName: this.projectName,
      alarmType: this.selectAlarmTypeTrend === "全部" ? "" : this.selectAlarmTypeTrend,
      timeType: this.selectTimeType
    });
    this.lineData.xAxis = data?.times;
    this.lineData.yAxis = data?.numbers;
    this.lineData.xAxisInterval = this.lineData.xAxis.length <= 9 ? 0 : parseInt((this.lineData.xAxis.length / 9).toString());
  }


  async handleAlarmChange() {
    await this.getTodayAlarm();
  }

  async handleDeviceChange(e, v) {
    this.deviceChoose = e.split('-');
    this.selectDeviceType = this.deviceChoose[0]
    await this.getTodayAlarm();
  }

  async handleAlarmChangeTrend() {
    await this.getAlarmTrend();
  }

  async handleTimeTypeChange() {
    await this.getAlarmTrend();
  }

  getBigSignAvatar(id) {
    console.log('getBigSignAvatar', id)
    this.selectAlarmItem = {};
    Api.videoGetAiMessageById({appCode: this.projectCode ?? '', id: id as string}).then(res => {
      if (res.errcode === 0) {
        this.selectAlarmItem = res.data;
        this.visible = true;
      }
    })
  }

  messageClick(item: { bigPic: string, captureTime: string, deviceName: string, devicePosition: string, safeRuleName: string, safeRuleTypeName: string, smallPic: string }) {
    this.selectAlarmItem = item;
    this.visible = true;
  }
}

</script>

<style lang="less" scoped>
@import url("./AIAnalyse.less");
@import '../../../styles/public.module.less';

.alarm_content {
  background: url("./img/组2661.png") no-repeat;
  background-size: 100% 100%;
  .flex;
  flex-direction: column;
  height: 120px;
  margin: 15px;

  .alarm_main {
    .flex;
    flex-direction: row;
    height: 90px;
    //padding-top: 30px;
    width: 18vw;

    .alarm_small_pic {
      width: 60px;
      height: 80px;
      margin: 0 5px;
      border: transparent;
    }

    & > main {
      .flex-column;
      color: #fff;
      .flex-wrap;

      .alarm_detail {
        flex-direction: row;
        width: 100px;
        overflow: visible;
        white-space: nowrap;
      }

      //.flex-space-between;
    }
  }


  & > .alarm_title {
    color: #fff;
    line-height: 30px;
  }
}
</style>
