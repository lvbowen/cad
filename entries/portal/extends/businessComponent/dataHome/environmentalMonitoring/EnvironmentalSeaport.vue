<template>
  <div v-if="isShowEmpty">
    <img src="./img/1.png" alt="" srcset="">
  </div>
  <div v-else>
    <div v-if="isLoad" class="loading">
      <a-spin size="large" tip="Loading..." :spinning="isLoad"></a-spin>
    </div>
    <div v-else class="container">
      <div class="environmental">
        <div class="weather">
          <div class="title">
            <h4 class="titleContent">天气数据</h4>
          </div>
          <div class="weatherContent">
            <iframe
              scrolling="no"
              frameborder="0"
              allowtransparency="true"
              :src="iframeUrl"></iframe>
          </div>
        </div>
        <div class="environmentalData">
          <div class="title">
            <h4 class="titleContent">环境数据</h4>
          </div>
          <div class="environmentalContents">
            <div
              style="cursor:pointer"
              v-for="(item,key) in array"
              :key="key"
              @click="environmentalItemClick(item.type,item.unit,item.title)">
              <div class="environmentalcontent" :class="getenvironmentalBackground(key)">
                <em>{{ item.value|numFixed(2) }}</em>
                <i v-html="item.unit"></i>
              </div>
              <h4 class="environmentalTitle">{{ item.title }}</h4>
            </div>
          </div>
        </div>
      </div>
      <div class="charts">
        <div class="airQuality">
          <div class="title">
            <h4 class="titleContent">空气质量</h4>
          </div>
          <div class="piechart">
            <pie-charts :id="'pieChart'" :chartData="airQuality"></pie-charts>
          </div>
        </div>
        <div class="trendAnalysis">
          <div class="title">
            <h4 class="titleContent">趋势分析</h4>
          </div>
          <div class="lineChart">
            <div class="dateSelect">
              <a-date-picker
                class="monthInput"
                placeholder="请选择日期"
                :allowClear="false"
                :disabledDate="disabledDate"
                :defaultValue="defaultDateValue"
                @change="onDateChange"
                size="small"/>
            </div>
            <line-charts :id="lineChart" :lineData="lineData"></line-charts>
          </div>
        </div>
      </div>
      <div class="historyRecord">
        <div class="title">
          <h4 class="titleContent">历史记录</h4>
        </div>
        <div class="dataTable">
          <a-table
            size="small"
            rowKey="id"
            :key="tableKey"
            :rowClassName="setRowClassName"
            :scroll="{ y:200 }"
            :columns="tableColumns"
            :dataSource="tableData"
            :pagination="paginationOption"
            @change="handleTableChange"
          >
          </a-table>
        </div>
      </div>
    </div >
  </div>
</template>
<script src="./EnvironmentalSeaport.ts"></script>
<style lang="less" scoped>
@import "./EnvironmentalMonitoring.less";
</style>
