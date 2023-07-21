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
            <a-select-option v-for="(item,index) in alarmTypes" :key="index" :value="item">{{ item }}</a-select-option>
          </a-select>
          <a-select class="last" v-model="selectTimeType" @change="handleTimeTypeChange">
            <a-select-option v-for="(item,index) in timeTypes" :key="index" :value="item.value">{{ item.title }}</a-select-option>
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
            <img :src="item" alt="">
          </div>
        </a-carousel>
      </div>
    </div>
    <div class="right">
      <div class="title">
        <h4 class="titleContent">今日离线告警</h4>
      </div>
      <a-select v-model="selectAlarmType" @change="handleAlarmChange">
        <a-select-option v-for="(item,index) in alarmTypes" :key="index" :value="item">{{ item }}</a-select-option>
      </a-select>
      <div class="rightMessages">
        <div
          @click="messageClick(item)"
          class="message"
          v-for="(item,index) in todayAlarms"
          :key="index">
          <h4 class="messageTitle">{{ item.safeRuleTypeName }}</h4>
          <div class="messageBody">
            <img :src="item.smallPic" alt="">
            <div class="messageContents">
              <span>设备:<em>{{ item.deviceName }}</em></span>
              <span>时间:<em>{{ item.captureTime }}</em></span>
              <span>告警类型:<em>{{ item.safeRuleTypeName }}</em></span>
            </div>
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
      centered>
      <div class="modalBody">
        <div class="small">
          <div>
            <img :src="selectAlarmItem.smallPic" alt="">
          </div>
          <h4>{{ selectAlarmItem.safeRuleTypeName }}</h4>
        </div>
        <div class="big">
          <div>
            <img :src="selectAlarmItem.bigPic" alt="">
          </div>
          <p><span>告警地点:</span><span>{{ selectAlarmItem.devicePosition }}</span></p>
          <p><span>告警时间:</span><span>{{ selectAlarmItem.captureTime }}</span></p>
          <p><span>规则名称:</span><span>{{ selectAlarmItem.safeRuleName }}</span></p>
        </div>
      </div>
      <template #footer>
        <a-button type="primary" @click="visible=false">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script src="./AIAnalyse.ts" lang="ts"></script>

<style lang="less" scoped>
@import url("./AIAnalyse.less");
</style>
