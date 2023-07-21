<template>
  <div>
    <div class="staticsHeader">
      <img class="infoImage" src="../../../../src/assets/extends/CoordinateDesign/ProjectStatics/info.png" alt="">
      <span class="headerTitle">项目统计</span>
    </div>
    <div class="staticsContents">
      <div class="staticsWrap">
        <div class="contentTile clearfix">
          <span class="contentTileContent left">数据指标</span>
        </div>
        <div class="staticsContent">
          <div v-for="(item,index) in statics" :key="index" class="staticsContentItem">
            <div class="staticsContentItemText">
              <h4>{{ item.value|formatNum }}</h4>
              <p>{{ item.name }}</p>
            </div>
            <div class="staticsContentItemImage" :class="item.className">
            </div>
          </div>
        </div>
      </div>
      <div class="lineChartWrap">
        <div class="contentTile clearfix">
          <span class="contentTileContent left">数据分析</span>
          <div class="right">
            <a-select
              class="yearSelect"
              size="small"
              v-model="year"
              :options="yearOptions">
              <a-icon class="suffixIcon" slot="suffixIcon" type="caret-down" />
            </a-select>
            <a-select
              class="departmenSelect"
              size="small"
              v-model="department"
              :disabled="true"
              :options="departmentOptions">
              <a-icon class="suffixIcon" slot="suffixIcon" type="caret-down" />
            </a-select>
          </div>
        </div>
        <div class="lineChart">
          <LineChart :option="lineChartOption"></LineChart>
        </div>
      </div>
      <div class="chartsWrap">
        <div class="contentTile clearfix">
          <span class="contentTileContent left">数据汇总</span>
        </div>
        <div class="chartsContent clearfix">
          <div class="left pieCharts">
            <PieChart
              :chartData="pieChartData"
              :radius="['40%','80%']"
              :legend="{show:false}"
              :label="{show:false}"
              roseType="radius"></PieChart>
          </div>
          <div class="left barCharts">
            <BarChart :chartData="barChartData"></BarChart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
</style>
