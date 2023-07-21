<template>
  <div class="main">
    <a-row :gutter="8">
      <a-col :span="8">
        <a-card class="top_left" title="施工投资完成情况" size="small">
          <!--          <span class="toprev" @click="toprev">-->
          <!--            <img :src="toPrev" alt=""/>-->
          <!--          </span>-->
          <a-row :gutter="8">
            <a-col :span="12">
              <div class="up_statics">
                <p>项目总投资</p>
                <span>{{ totalNum }}</span>
                <span>万元</span>
              </div>
              <div class="mid_statics">
                <p>已完成投资</p>
                <span>{{ doneNum }}</span>
                <span>万元</span>
              </div>
              <div class="down_statics">
                <p>未完成投资</p>
                <span>{{ undoNum }}</span>
                <span>万元</span>
              </div>
            </a-col>
            <a-col :span="12">
              <div id="pieChart" class="pie_chart"></div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card class="top_right" title="每期计量金额" size="small">
          <div id="barChart" class="bar_chart"></div>
        </a-card>
      </a-col>
    </a-row>
    <br/>
    <a-card class="bottom_div">
      <a-select
        size="small"
        :value="selectedPeriod"
        class="period_select"
        @change="filterChange">
        <a-select-option v-for="(value,index) in allPeriod" :key="index" :value="value">{{ value }}</a-select-option>
      </a-select>
      <br/>
      <a-table
        v-if="tableData.length!==0"
        :defaultExpandedRowKeys="expandedTableKeys"
        :columns="tableLabel"
        :data-source="tableData"
        :customRow="rowClick"
        :scroll="{x: 1000, y: yHeight}"
        @expand="expandRows"
      >
        <template slot="finishPercent" slot-scope="record">
          <a-progress :percent="record" size="small"/>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import axios from "axios";
import {Icon, Row, Col, Card, Table, Progress, Select,} from "@h3/antd-vue";
import {getMeasureViewChilds, getLatestCBS, getCbsStatics, getCBSByPeriod, getAllPeriod} from "../data/url";
import * as Type from '../../../type';
import toprev from '../../../../src/assets/extends/icon/icon.png';
// 引入基本模板
// const echarts = require("echarts");
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';

@Component({
  name: "investmentOverview",
  components: {
    AIcon: Icon,
    ARow: Row,
    ACol: Col,
    ACard: Card,
    ATable: Table,
    ASelect: Select,
    AProgress: Progress,
    ASelectOption: Select.Option,
  }
})
export default class allProtect extends Vue {
  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  projectName: string = '';
  totalNum: number = 0;
  doneNum: number = 0;
  undoNum: number = 0;

  tableData: Array<any> = [];
  tableLabel: Array<any> = [
    // 表头数据
    {
      align: "left",
      title: "cbs编码",
      key: "cCBS",
      dataIndex: "cCBS",
      scopedSlots: {customRender: "cCBS"},
      width: '8%'
    },
    {
      align: "center",
      title: "名称",
      key: "cListName",
      dataIndex: "cListName",
      scopedSlots: {customRender: "cListName"},
      width: '12%'
    },
    {
      align: "center",
      title: "总工程量",
      key: "finalTotalAmount",
      dataIndex: "finalTotalAmount",
      scopedSlots: {customRender: "finalTotalAmount"}
    },
    {
      align: "center",
      title: "总工程款",
      key: "finalTotalPrice",
      dataIndex: "finalTotalPrice",
      scopedSlots: {customRender: "finalTotalPrice"}
    },
    {
      align: "center",
      title: "本期数量",
      key: "detailAmount",
      dataIndex: "detailAmount",
      scopedSlots: {customRender: "detailAmount"}
    },
    {
      align: "center",
      title: "本期合价",
      key: "detailMoney",
      dataIndex: "detailMoney",
      scopedSlots: {customRender: "detailMoney"}
    },
    {
      align: "center",
      title: "上期末数量",
      key: "detailPreviousAmount",
      dataIndex: "detailPreviousAmount",
      scopedSlots: {customRender: "detailPreviousAmount"}
    },
    {
      align: "center",
      title: "上期末合价",
      key: "detailPreviousMoney",
      dataIndex: "detailPreviousMoney",
      scopedSlots: {customRender: "detailPreviousMoney"}
    },
    {
      align: "center",
      title: "本期末数量",
      key: "detailTotalAmount",
      dataIndex: "detailTotalAmount",
      scopedSlots: {customRender: "detailTotalAmount"}
    },
    {
      align: "center",
      title: "本期末合价",
      key: "detailTotalMoney",
      dataIndex: "detailTotalMoney",
      scopedSlots: {customRender: "detailTotalMoney"}
    },
    {
      align: "center",
      title: "进度(%)",
      key: "finishPercent",
      dataIndex: "finishPercent",
      scopedSlots: {customRender: "finishPercent"}
    },
  ];
  expandedTableKeys: Array<string> = [];
  selectedPeriod: string = '';
  allPeriod: Array<string> = [];
  toPrev: any = toprev;
  yHeight:number = 395;

  mounted() {
    //@ts-ignore
    this.projectName = this.projectConfig?.projectName as string;
    this.getLatestCBS();
    this.getAllPeriod();
    let _this = this;
    _this.yHeight = document.documentElement.clientHeight * 0.75  - 330;
    window.onresize = () => {
      return (() => {
        _this.yHeight = document.documentElement.clientHeight * 0.75  - 330;
      })()
    };
  }

  close() {
    //@ts-ignore
    this.$router.go(-1)
  }

  drawPie(value) {
    let piedata: Array<object> = [];
    for (let key in value) {
      piedata.push({
        value: value[key],
        name: key
      })
    }
    //@ts-ignore
    const myChart = echarts.init(document.getElementById('pieChart'));
    myChart.clear()
    myChart.setOption({
      color: ['#FFA73F', '#33b322'],
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'horizontal',
        bottom: '20',
      },
      series: [
        {
          name: '详情',
          type: 'pie',
          radius: '55%',
          center: ['50%', '35%'],
          data: piedata,
          label: {
            normal: {
              formatter(v) {
                let text = v.name
                return text.length < 3 ? text : `${text.slice(0, 3)}\n${text.slice(3)}`
              }
            }
          },
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

  drawBar(value) {
    let xAxisData: Array<string> = [];
    let seriesData: Array<string> = [];
    for (let i = 0; i < value.length; i++) {
      xAxisData.push(value[i].period);
      seriesData.push(value[i].money);
    }
    //@ts-ignore
    const myChart = echarts.init(document.getElementById('barChart'));
    myChart.clear()
    //@ts-ignore
    myChart.setOption({
      color: ['#4B88F5'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '1%',
        top: '12%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            //@ts-ignore//加上这个强制显示
            interval: xAxisData.length>15?1:0
          },
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '万元',
          splitLine: {show: false},
        }
      ],
      series: [
        {
          name: '计量金额(万元)',
          type: 'bar',
          barWidth: '60%',
          data: seriesData
        }
      ]
    });
    window.onresize = function () {
      myChart.resize();
    };
  }

  /**
   *遍历多棵树（编辑节点）
   *data  多棵树
   *key   关键字
   */
  editListTree(data, key, value) {
    var flag = false
    for (let i = 0; i < data.length; i++) {
      if (flag) {
        break
      } else {
        if (data[i].key === key) {
          data[i] = value;
          flag = true
          break
        } else {
          this.editTree(data[i], key, flag, value)
        }
      }
    }
  }

  /**
   *遍历多棵树（编辑节点）
   *data  单数
   *key   关键字
   */
  editTree(data, key, flag, value) {
    if (data.children && data.children.length > 0) {
      for (let i = 0; i < data.children.length; i++) {
        if (flag) {
          break
        } else {
          if (data.children[i].key === key) {
            data.children[i] = value;
            flag = true
            return
          } else {
            this.editTree(data.children[i], key, flag, value)
          }
        }
      }
    }
  }

  // 点击展开图标时触发
  expandRows(expanded, record) {
    this.getChildTree(record);
  }

  filterChange(value) {
    this.selectedPeriod = value;
    if (value === '当前计量状态') {
      this.getLatestCBS()
    } else {
      this.getCBSByPeriod(value)
    }
  }

  getAllPeriod() {
    this.allPeriod.length = 0
    axios
      .get(getAllPeriod, {
        params: {
          appCode: this.projectCode,
          projectName: this.projectName
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.allPeriod = res.data
        }
        this.allPeriod.unshift('当前计量状态');
        this.selectedPeriod = '当前计量状态'
      })
  }

  getCBSByPeriod(period) {
    this.expandedTableKeys.length = 0;
    this.tableData.length = 0;
    axios
      .get(getCBSByPeriod, {
        params: {
          appCode: this.projectCode,
          projectName: this.projectName,
          period: period
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.tableData = res.data;
          for (let i = 0; i < this.tableData.length; i++) {
            this.expandedTableKeys.push(this.tableData[i].key)
          }
        }
      })
  }

  //获取子节点
  getChildTree(c) {
    let _this = this
    return new Promise((resolve) => {
      if (c.children !== undefined && c.children.length != 0) { // 有值了直接渲染
        resolve(c)
        return
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      axios
        .get(getMeasureViewChilds, {
          params: {
            appCode: this.projectCode,
            parentId: c.id
          },
        })
        .then((res) => {
          c["children"] = res.data;
          c["childCount"] = res.data.length;
          this.editListTree(_this.tableData, c.key, c);
        })
      resolve(c)
    })
  }

  getLatestCBS() {
    this.expandedTableKeys.length = 0;
    this.tableData.length = 0;
    axios
      .get(getLatestCBS, {
        params: {
          appCode: this.projectCode,
          projectName: this.projectName
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.drawPie(res.data.pieData);
          this.tableData = res.data.treeData;
          this.undoNum=res.data.pieData['未完成投资'];
          if (this.tableData.length > 0) {
            this.getCbsStatics(this.tableData[0].tG04aContractdetailFk)
          }
          this.totalNum = res.data.textData['项目总产值'];
          this.doneNum = res.data.textData['已完成产值'];
          for (let i = 0; i < this.tableData.length; i++) {
            this.expandedTableKeys.push(this.tableData[i].key)
          }
        }
      })
  }

  getCbsStatics(id) {
    axios
      .get(getCbsStatics, {
        params: {
          appCode: this.projectCode,
          cbsId: id
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.drawBar(res.data)
        }
      })
  }

  // 表格点击事件
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.getCbsStatics(record.tG04aContractdetailFk)
        },
      }
    };
  }

  toprev() {
    //@ts-ignore
    this.$router.go(-1);
  }
}
</script>
<style lang="less" scoped>
@import "../data/measure.css";

@import (reference) "../../../styles/theme.less";

.main {
  .flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .top_left {
    height: calc( 100vh * 0.35 );

    .toprev {
      position: absolute;
      top: 5px;
      left: 0px;
      z-index: 999;
      cursor: pointer;
      font-size: 19px;
    }

    .pie_chart{
      width:100%;
      height: calc( 100vh * 0.35 - 50px );
    }
  }

  .top_right{
    height: calc( 100vh * 0.35  );
    width: 100%;

    .bar_chart{
      height: calc( 100vh * 0.35 - 50px );
      width:  100%;
    }
  }

  .bottom_div{
    height:calc( 100vh * 0.75 - 160px);
  }
  /deep/ .ant-card-head-title {
    font-size: 16px;
    font-weight: 500;
    color: #0a0a0a;
    padding-left: 15px !important;
    font-family: Source Han Sans CN;
  }
}


.up_statics {
  width: 100%;
  height: 40%;
  padding: calc( 100vh * 0.01);

  :nth-child(2) {
    font-size: 36px;
    color: #05aefc;
    padding-left:calc( 100vh * 0.02);
    margin-right: 10px;
  }
}
.mid_statics{
  width: 100%;
  height: 40%;
  padding: calc( 100vh * 0.01);

  :nth-child(2) {
    font-size: 36px;
    color: #3fcf2c;
    padding-left: calc( 100vh * 0.02);
    margin-right: 10px;
  }
}
.down_statics {
  width: 100%;
  height: 40%;
  padding: calc( 100vh * 0.01);

  :nth-child(2) {
    font-size: 36px;
    color: #ffa800;
    padding-left: calc( 100vh * 0.02);
    margin-right: 10px;
  }
}

.period_select {
  float: left;
  margin: 0 4px 0 0;
  width: 120px
}

/deep/ .ant-table {
  height: calc(100vh * 0.75 - 280px)
}

/deep/ .ant-table-placeholder {
  display: none;
}
/deep/.ant-table-pagination.ant-pagination {
  float: right;
  margin:0px 0;
}
/deep/.ant-card-body {
  padding: 8px;
  zoom: 1;
}
</style>
