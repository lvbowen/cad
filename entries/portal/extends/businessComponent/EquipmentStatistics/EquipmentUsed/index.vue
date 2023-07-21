<template>
  <div class="equipmentUsedContainer">
    <div class="pageHeader">
      <a-icon class="pageHeaderIcon" type="left" @click="back" />
      <span class="pageHeaderTitle">设备使用分析</span>
    </div>
    <div class="top">
      <div class="title clearfix">
        <h4 class="titleContent left">设备使用情况</h4>
        <div class="titleExtra right">
          <span class="titleExtraTitle">日期选择:</span>
          <a-button
            :type="buttonIndex===0?'primary':''"
            @click="titleExtraButtonClick(0)"
            class="titleExtraButton"
            size="small">年</a-button>
          <a-button
            :type="buttonIndex===1?'primary':''"
            @click="titleExtraButtonClick(1)"
            class="titleExtraButton"
            size="small">月</a-button>
          <a-button
            :type="buttonIndex===3?'primary':''"
            @click="titleExtraButtonClick(3)"
            class="titleExtraButton"
            size="small">日</a-button>
        </div>
      </div>
      <div class="body clearfix">
        <div class="barChart left">
          <h4 class="barChartTitle">数量统计</h4>
          <div class="barChartContent">
            <my-bar-chart
              id="myBarChart"
              :option="barChartOption"
              :dataZoom="[{'type':'inside'}]"
              :yAxis="{name:'次'}"></my-bar-chart>
          </div>
        </div>
        <div class="pieChart right">
          <h4 class="pieChartTitle">使用类型统计</h4>
          <div class="pieChartContent">
            <pie-echart
              id="pieChart"
              :radius="radius"
              :chartData="pieChartData"
              :legend="pieChartLegend"
              :center="center"
              :title="title"
              :label="pieChartLabel"></pie-echart>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="title">
        <h4 class="titleContent">设备单据汇总明细</h4>
      </div>
      <div class="bottomBody">
        <a-table
          :scroll="{y:240}"
          size="small"
          rowKey="id"
          bordered
          :loading="loading"
          :rowClassName="rowClassName"
          :columns="columns"
          :pagination="pagination"
          :dataSource="dataSource">
          <template #auditResult="text,record">
            <span :style="{color:text=='通过'?'green':'red'}">{{ text }}</span>
          </template>
          <template slot="actions" slot-scope="text,record">
            <a-button type="link" @click="itemView(record)">跳转</a-button>
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
