<template>
  <div class="main">
    <!--    <span class="toprev" @click="toprev">-->
    <!--      <img src="../../../src/assets/extends/icon/icon.png" alt=""/>质检验收统计-->
    <!--    </span>-->
    <a-card
      title="质量问题统计"
      class="statics"
      size="small">
      <a-col :span="10">
        <div id="pieChart1" class="pie_chart"></div>
      </a-col>
      <a-col :span="2"></a-col>
      <a-col :span="12">
        <div id="pieChart2" class="pie_chart"></div>
      </a-col>
    </a-card>
    <a-card
      title="问题列表详情"
      class="detail"
      size="small">
      <a-input-search
        size="small"
        placeholder="输入关键字"
        enterButton
        class="search"
        @search="onTableSearch"/>
      <br/>
      <a-table
        size="small"
        class="table"
        :columns="tableLabel"
        :data-source="tableData"
        :scroll="{ x: maxWidth, y: 350}"
      >
        <template
          slot="操作"
          slot-scope="text, record,index"
        >
          <a @click="showConnect(record,index)">查看详情</a>
        </template>
        <template
          v-for="(val,key) in allOptions"
          :slot="key"
          slot-scope="text, record"
        >
          <template v-for="(value,index) in val.data">
            <div
              v-show="record[key]==value.optionName"
              :key="index"
              :style="{ background: [record[key]==value.optionName?value.color:''],width:'100%',height:'100%'}">
              {{ record[key] }}
            </div>
          </template>
        </template>
        <template
          v-for="(val,index) in attachment"
          :slot="val"
          slot-scope="text, record"
        >
          <a :key="index" v-if="record[val]!==undefined" @click="download(record,val)">{{
            record[val].split('name=')[1]
          }}</a>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import {Card, Col, Table, Icon} from "@h3/antd-vue";

import * as Type from '../../type';
import axios from "axios";
import env from "@/config/env";

import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';
@Component({
  name: "qualityManage",
  components: {
    ACard: Card,
    ACol: Col,
    ATable: Table,
    AIcon: Icon
  }
})
export default class qualityManage extends Vue {
  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  tableLabel: Array<any> = [];
  tableData: Array<any> = [];
  attachment: Array<string> = [];//用于保存附件列的dataIndex
  maxWidth: number = 2000;
  bimURL: string = `${env.apiHost}/`;
  allOptions: any = {};

  mounted() {
    this.getTableLabel();
    this.getAllListData();
  }

  /**
   *画饼图
   *Data  画图数据[{name:,value:}]
   *totalNum   总数
   */
  drawPie(name: string, title: string, data: any) {
    //@ts-ignore
    const myChart = echarts.init(document.getElementById(name));
    myChart.clear()
    myChart.setOption({
      color: ['#82b1d7', '#f1b500', '#54d1ff', '#00c567', '#ffa943'],
      title: {
        text: title,
        left: '30%',
        top: 'bottom'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'right',
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['40%', '60%'],
          center: ['40%', '45%'],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
    window.onresize = function () {
      myChart.resize();
    };
  }

  /**
   * 点击表格附件下载
   */
  download(record, val) {
    console.log('recordddddddddd', record)
    const token = localStorage.getItem("token");
    if (record[val] == undefined) {
      //@ts-ignore
      this.$message.warn('文件为空！')
    } else {
      window.open(`${env.apiHost}/${record[val]}&access_token=${token}`)
    }
  }

  /**
   * 获取列表表头
   */
  getTableLabel() {
    this.tableLabel = [{
      title: '序号',
      align: "center",
      className: "column-class",
      width: 50,
      customRender: (text, record, index) => `${index + 1}`,
    }];
    axios
      .get(this.bimURL + `api/app/query/get`, {
        params: {
          schemaCode: this.projectCode + '_zlxj',
          code: this.projectCode + '_zlxj',
          source: 1
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          const resColumn = res.data.queryColumns;
          for (let i = 0; i < resColumn.length; i++) {
            //排除子表
            if (resColumn[i].propertyType !== 8) {
              if (resColumn[i].propertyType == 6) {
                this.tableLabel.push({
                  align: "center",
                  title: resColumn[i].name,
                  dataIndex: resColumn[i].propertyCode,
                  key: resColumn[i].propertyCode,
                  ellipsis: true,
                  scopedSlots: {customRender: resColumn[i].propertyCode,}
                })
                this.attachment.push(resColumn[i].propertyCode)
              } else {
                this.tableLabel.push({
                  align: "center",
                  // ellipsis: true,
                  title: resColumn[i].name,
                  dataIndex: resColumn[i].propertyCode,
                  key: resColumn[i].propertyCode,
                  width: resColumn[i].width,
                })
              }
            }
          }
        }
        this.tableLabel.push({
          align: "center",
          title: "操作",
          key: "操作",
          width: 160,
          scopedSlots: {customRender: "操作"}
        });
        this.maxWidth = (this.tableLabel.length - 1) * 160 + 50;
        this.getAllOptions();
      })
  }

  /**
   * 获取列表所有数据
   */
  getAllListData() {
    this.tableData.length = 0;
    axios
      .get(this.bimURL + `bim/analysis/getAllListData`, {
        params: {
          schemaCode: this.projectCode + '_zlxj',
          projectName: this.projectConfig?.multiProjectFlag ? this.projectConfig.projectName : '全部项目',
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          const temptData = res.data.content;
          for (let i = 0; i < temptData.length; i++) {
            this.$set(temptData[i].data, 'key', temptData[i].data.id)
            this.tableData.push(temptData[i].data);
          }
          this.initPiePic('pcgzlb');
          this.initPiePic('zglx');
        }
      })
  }

  /**
   * 获取表单所有分析列和选项
   */
  getAllOptions() {
    this.allOptions = [];
    axios
      .get(this.bimURL + `bim/analysis/getAllOptions`, {
        params: {
          appCode: this.projectCode,
          schemaCode: this.projectCode + '_zlxj',
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.allOptions = res.data;
          for (let i = 0; i < this.tableLabel.length; i++) {
            for (const k in res.data) {
              if (k === this.tableLabel[i].key) {
                const temptOptins: Array<object> = [];
                for (let j = 0; j < res.data[k].data.length; j++) {
                  temptOptins.push({
                    text: res.data[k].data[j].optionName,
                    value: res.data[k].data[j].optionName,
                  });
                }
                this.$set(this.tableLabel[i], 'filters', temptOptins);
                const name = this.tableLabel[i].dataIndex;
                this.$set(this.tableLabel[i], 'scopedSlots', {'customRender': name});
                this.$set(this.tableLabel[i], 'onFilter', (value, record) => record[name].indexOf(value) === 0);
              }
            }
          }

        }
      })
  }

  initPiePic(value) {
    //@ts-ignore
    const myChart1 = echarts.init(document.getElementById('pieChart1'));
    myChart1.clear();
    //@ts-ignore
    const myChart2 = echarts.init(document.getElementById('pieChart2'));
    myChart2.clear()
    axios
      .post(this.bimURL + `bim/analysis/getStaticData`, {
        appCode: this.projectCode,
        dataList: this.tableData,
        optionCode: value,
        projectName: this.projectConfig?.multiProjectFlag ? this.projectConfig.projectName : '全部项目',
        schemaCode: this.projectCode + '_zlxj',
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          const color: Array<string> = [];
          const name: Array<string> = [];
          const data: Array<object> = [];
          if (JSON.stringify(res.data) !== '{}') {
            for (const key in res.data) {
              name.push(key);
              color.push(res.data[key].color);
              data.push({
                  value: res.data[key].count,
                  name: key
                }
              )
            }
            if (value === 'zglx') return this.drawPie('pieChart2' as string, '问题状态统计' as string, data);
            if (value === "pcgzlb") return this.drawPie('pieChart1' as string, '质量问题分类' as string, data);
          }
        }
      })
  }

  onTableSearch(v) {
    this.tableData = [];
    axios
      .get(this.bimURL + `bim/analysis/getAllListData`, {
        params: {
          schemaCode: this.projectCode + '_zlxj',
          projectName: this.projectConfig?.multiProjectFlag ? this.projectConfig.projectName : '全部项目',
          keyWord: v
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          const temptData = res.data.content;
          for (let i = 0; i < temptData.length; i++) {
            this.$set(temptData[i].data, 'key', temptData[i].data.id)
            this.tableData.push(temptData[i].data);
          }
        }
      })
  }

  showConnect(record, index) {
    const token = localStorage.getItem("token");
    const schemaCode = this.projectCode + '_zlxj';
    console.log('portalHost', record, index)
    const url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${schemaCode}&objectId=${record.id}&access_token=${token}`;
    const urlReturn = `${this.$route.fullPath}&iframeAction=detail`;
    this.isDingTalk?this.$router.push(`${url}&return=${urlReturn}`):window.open(`${env.portalHost}${url}`)
  }

  toprev() {
    //@ts-ignore
    this.$router.go(-1);
  }
}
</script>


<style lang="less" scoped>
.main {
  flex-direction: column;
  height: 100%;
  width: 100%;

  .toprev {
    //position: absolute;
    font-size: 16px;
    top: 2%;
    left: 0.1%;
    z-index: 9;
    cursor: pointer;
  }

  .statics {
    height: 300px;

    .pie_chart {
      height: 240px;
      width: 600px;
    }
  }

  .detail {
    height: 500px;

    .search {
      float: right;
      margin: auto 0 8px auto;
      width: 200px;
    }

    .table {
      /deep/ .ant-table {
        height: 360px;
        border: 0;
      }
    }
  }
}
</style>

