<template>
  <div class="equipmentInspectioncontainer">
    <div class="pageHeader">
      <a-icon class="pageHeaderIcon" type="left" @click="back" />
      <span class="pageHeaderTitle">设备巡检分析</span>
    </div>
    <div class="itemNums">
      <div class="itemChart">
        <item-num title="本月已完成" :value="inspectedTotal" valueColor="#29A1FC"></item-num>
      </div>
      <div class="itemChart">
        <item-num title="本月待完成" :value="waitInspectionTotal" valueColor="#52DFB5"></item-num>
      </div>
      <div class="itemChart">
        <item-num title="今日已完成" :value="inspectedTotalToday" valueColor="#FEA278"></item-num>
      </div>
      <div class="itemChart">
        <item-num title="今日待完成" :value="waitInspectionTotalToday" valueColor="#F66982"></item-num>
      </div>
    </div>
    <div class="charts clearfix">
      <div class="lineChart left">
        <div class="title">
          <span class="titleContent">巡检数量统计</span>
        </div>
        <div class="chart">
          <line-chart
            id="lineChart"
            :option="option"
            :grid="grid"
            :dataZoom="[{'type':'inside'}]"
            :yAxis="{name:'次'}"></line-chart>
        </div>
      </div>
      <div class="itemChart right">
        <div class="title">
          <span class="titleContent">今日待检</span>
        </div>
        <div class="itemChartContainer">
          <my-card title="今日待检分布" :total="waitInspectionTotalToday" :dataSource="waitInspectionData"></my-card>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="title">
        <h4 class="titleContent">巡检记录明细</h4>
      </div>
      <div class="bottomBody">
        <a-table
          :scroll="{y:220}"
          size="small"
          rowKey="id"
          bordered
          :loading="loading"
          :rowClassName="rowClassName"
          :columns="columns"
          :pagination="pagination"
          :dataSource="dataSource">
          <template #inspectCode="text,record">
            <span :style="{color:text==='正常'?'green':'red'}">{{ text }}</span>
          </template>
          <template slot="actions" slot-scope="text,record">
            <a-button type="link" @click="itemView(record)">查看</a-button>
          </template>
          <template slot="repair" slot-scope="text,record">
            <a-button v-if="text" type="link" @click="repairItemView(record)">{{ text }}</a-button>
            <span v-else>------</span>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script src="./index.ts"/>

<style lang="less" scoped>
@import url("./index.less");
</style>
