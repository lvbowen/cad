<template>
  <article style="height: 0;width: 0">
    <!--    底部 信息栏 显示状态-->
    <div class="bottom_class" v-show="isBottomShow">
      <img
        :src="bottomShow"
        @click="() => {this.isBottomShow = false}"
        class="array"/>
      <div style="clear: both;width: 100%">
        <a-row :gutter="4">
          <a-col :span="7">
            <p class="title">合同信息管理</p>
            <div class="divider">
              <a-divider/>
            </div>
            <div class="leftDiv">
              <span>合同</span>
              <a-dropdown :trigger="['click']" class="leftDropdown">
                <a-menu slot="overlay">
                  <template v-for="menuItem in contractMenu">
                    <a-menu-item
                      :key="menuItem.id"
                      @click="changeContract(menuItem)"
                    >
                      {{ menuItem.contractNum }}
                    </a-menu-item>
                  </template>
                </a-menu>
                <a-button size="small">{{ contract ? contract.contractNum : '' }}
                  <a-icon type="down"/>
                </a-button>
              </a-dropdown>
              <span>期号</span>
              <a-dropdown :trigger="['click']" class="leftDropdown">
                <a-menu slot="overlay">
                  <template v-for="menuItem in periodMenu">
                    <a-menu-item
                      :key="menuItem"
                      @click="changePeriod(menuItem)"
                    >
                      {{ menuItem }}
                    </a-menu-item>
                  </template>
                </a-menu>
                <a-button size="small">{{ this.period }}
                  <a-icon type="down"/>
                </a-button>
              </a-dropdown>
              <a-table
                v-if="tableTree.length!==0"
                :defaultExpandedRowKeys="expandedTableKeys"
                size="small"
                class="bottom_table"
                :columns="labelTree"
                :data-source="tableTree"
                :scroll="{ x: 400, y: 160}"
                :pagination="false"
                @expand="expandRows"
                :customRow="rowClickLeft"
                :rowClassName="setRowClassLeft"
              ></a-table>
            </div>
          </a-col>
          <a-col :span="12">
            <p class="title">CBS中间计量</p>
            <a-button class="allshow" @click="showAll" size="small">全部展示</a-button>
            <div class="divider">
              <a-divider/>
            </div>
            <div class="midDiv">
              <a-table
                size="small"
                class="bottom_table"
                :columns="tableLabel"
                :data-source="tableData"
                :scroll="{ x: 900, y: 195}"
                :customRow="rowClickMid"
                :rowClassName="setRowClassMid"
              ></a-table>
            </div>
          </a-col>
          <a-col :span="5">
            <p class="title">分析图</p>
            <div class="divider">
              <a-divider/>
            </div>
            <div class="rightDiv">
              <div id="myChart" style="width: 350px; height: 235px"></div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
    <!--    底部 信息栏 隐藏状态-->
    <div class="bottom_class_hide" v-show="!isBottomShow">
      <img
        :src="bottomHide"
        @click="() => {this.isBottomShow = true}"
        class="array"
      />
    </div>
  </article>
</template>
<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import axios from "axios";
import env from "@/config/env";
import {
  Carousel, Divider, Row, Col, Dropdown, Button, Menu, Table, Icon
} from '@h3/antd-vue';
import bottomShow from "../../../../src/assets/extends/bim/frame_bottom_1.png"
import bottomHide from "../../../../src/assets/extends/bim/frame_bottom_2.png"
import downIcon from '../../../../src/assets/extends/bim/icon_xl.png'
// const echarts = require("echarts");
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';

@Component({
  name: 'measureAnalysis',
  components: {
    ARow: Row,
    ACol: Col,
    AIcon: Icon,
    ATable: Table,
    AButton: Button,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    ADropdown: Dropdown,
    ACarousel: Carousel,
    ADivider: Divider
  }
})
export default class projectView extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName?: string;

  bimURL: string = `${env.apiHost}/`;
  isBottomShow: boolean = true;
  bottomShow: any = bottomShow;
  bottomHide: any = bottomHide;
  downIcon: any = downIcon;


  //合同信息管理
  contractMenu: Array<any> = [];
  periodMenu: Array<any> = [];
  contract: { contractName: string, contractNum: string } | null = null;
  period: string = '';
  tableTree: Array<any> = [];
  labelTree: Array<any> = [// 表头数据
    {
      align: "left",
      title: "清单项",
      key: "cListName",
      dataIndex: "cListName",
      width: '75%',
      scopedSlots: {customRender: "cListName"}
    },
    {
      align: "center",
      title: "本期合价(万元)",
      key: "detailMoney",
      dataIndex: "detailMoney",
      width: '25%',
      scopedSlots: {customRender: "detailMoney"}
    },];
  expandedTableKeys: Array<string> = [];
  currentRowLeft: any = {};


  //CBS中间计量
  tableData: Array<any> = [];
  tableLabel: Array<any> = [
    {
      align: "center",
      title: "MBS编码",
      key: "mbs",
      dataIndex: "mbs",
      scopedSlots: {customRender: "mbs"}
    },
    {
      align: "center",
      title: "清单项编码",
      key: "listCode",
      dataIndex: "listCode",
    },
    {
      align: "center",
      title: "名称",
      key: "cbsname",
      dataIndex: "cbsname",
      scopedSlots: {customRender: "cbsname"}
    },
    {
      align: "center",
      title: "清单CBS数量",
      key: "schemeCBSAmount",
      dataIndex: "schemeCBSAmount",
      scopedSlots: {customRender: "schemeCBSAmount"}
    },
    {
      align: "center",
      title: "清单CBS单价",
      key: "schemeCBSUnitPrice",
      dataIndex: "schemeCBSUnitPrice",
      scopedSlots: {customRender: "schemeCBSUnitPrice"}
    },
    {
      align: "center",
      title: "清单CBS合价",
      key: "schemeCBSMoney",
      dataIndex: "schemeCBSMoney",
      scopedSlots: {customRender: "schemeCBSMoney"}
    },
    {
      align: "center",
      title: "业主核定量",
      key: "yzAmount",
      dataIndex: "yzAmount",
      scopedSlots: {customRender: "yzAmount"}
    },
    {
      align: "center",
      title: "业主核定金额",
      key: "yzMoney",
      dataIndex: "yzMoney",
      scopedSlots: {customRender: "yzMoney"}
    }
  ];
  currentRowMid: any = {};

  mounted() {
    this.bottomShow = bottomShow;
    this.bottomHide = bottomHide;
    this.getAllContract()
  }

  /**
   *切换合同
   */
  changeContract(value) {
    this.contract = value;
    this.getPeriodByContract();
  }

  /**
   *切换期号
   */
  changePeriod(value) {
    this.period = value;
    this.getCbsTree()
  }

  /**
   *画饼图
   */
  drawPie(record) {
    let pieData: Array<{ name: string, value: number }> = [];
    let total: number = record.finalTotalPrice;
    pieData.push({
      name: '上期末计量',
      value: record.detailPreviousMoney as number
    });
    pieData.push({
      name: '本次计量',
      value: record.detailMoney as number
    });
    let tempt: number = record.finalTotalPrice - record.detailMoney - record.detailPreviousMoney
    pieData.push({
      name: '剩余计量',
      value: tempt
    });
    let legend: Array<string> = ['上期末计量', '本次计量', '剩余计量']
    //@ts-ignore
    let myChart = echarts.init(document.getElementById('myChart'));
    myChart.clear()
    myChart.setOption({
      color: ["#F2B302", "#27CA75", "#FF0043"], //环形颜色
      legend: {
        top: "bottom",
        icon: "rect",
        textStyle: {color: "#fff", fontSize: 12},
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      graphic: {
        //图形中间文字
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: "计量分析" + "\n" + total + "\n" + '万元',
          textAlign: "center",
          fill: "#fff",
          fontSize: 18,
        },
      },
      series: [
        {
          name: "分析数据 (万元)",
          type: "pie",
          radius: ["40%", "60%"],
          data: pieData,
        },
      ],
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
    this.getMeasureDetailChilds(record);
  }

  getAllContract() {
    axios
      .get(this.bimURL + `bim/measure/getAllContract`, {
        params: {
          appCode: this.projectCode,
          projectName: this.projectName
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode === 0) {
          this.contractMenu = res.data;
          if (res.data.length !== 0) {
            this.contract = res.data[0];
            this.getPeriodByContract();
          }
        }
      })
  }

  getCbsMeasure(record) {
    axios
      .get(this.bimURL + `bim/measure/getCbsMeasure`, {
        params: {
          appCode: this.projectCode,
          //@ts-ignore
          periodId: record.tG04cMeasureperiodFk,
          //@ts-ignore
          cbs: record.cCBS
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode === 0) {
          this.tableData = res.data;
          for (let i = 0; i < res.data.length; i++) {
            this.$set(this.tableData, 'key', res.data[i].id)
          }
        }
      })
  }

  getPeriodByContract() {
    axios
      .get(this.bimURL + `bim/measure/getPeriodByContract`, {
        params: {
          appCode: this.projectCode,
          contractNum: this.contract?.contractNum
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode === 0) {
          this.periodMenu = res.data;
          if (res.data !== 0) {
            this.period = res.data[0];
            this.getCbsTree();
          }
        }
      })
  }

  getCbsTree() {
    this.tableTree.length = 0;
    axios
      .get(this.bimURL + `bim/measure/getCbsTree`, {
        params: {
          appCode: this.projectCode,
          contractNum: this.contract?.contractNum,
          period: this.period
        }
      })
      .then(res => {
          //@ts-ignore
          if (res.errcode === 0) {
            this.tableTree = res.data;
            if (res.data.length !== 0) {
              this.expandedTableKeys.push(res.data[0].id);
              //初始化CBS中间计量及分析图
              this.getCbsMeasure(res.data[0]);
              this.drawPie(res.data[0])
            }
          }
        }
      )
  }

  //获取子节点
  getMeasureDetailChilds(c) {
    let _this = this
    return new Promise((resolve) => {
      if (c.children !== undefined && c.children.length != 0) { // 有值了直接渲染
        resolve(c)
        return
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      axios
        .get(this.bimURL + `bim/measure/getCbsChild`, {
          params: {
            appCode: this.projectCode,
            parentId: c.id
          }
        })
        .then((res) => {
          c["children"] = res.data;
          c["childCount"] = res.data.length;
          this.editListTree(_this.tableTree, c.key, c);
        })
      resolve(c)
    })
  }

  rowClickLeft(record) {
    return {
      on: {
        click: () => {
          this.currentRowLeft = record;
          this.getCbsMeasure(record);
          this.drawPie(record)
        }
      }
    }
  }

  rowClickMid(record) {
    return {
      on: {
        click: () => {
          this.currentRowMid = record
          this.showCbsMeasure(record);
        }
      }
    }
  }

  setRowClassLeft(record, index) {
    // let rowColor = Number(index) % 2 === 1 ? "evenRowStyl" : "";
    return record === this.currentRowLeft ? "clickRowStyl" : '';
  }

  setRowClassMid(record, index) {
    let rowColor = Number(index) % 2 === 1 ? "evenRowStyl" : "";
    return record === this.currentRowMid ? "clickRowStyl" : rowColor;
  }

  showAll() {
    this.showCbsMeasure(this.tableData)
  }

  showCbsMeasure(record) {
    let dataList: Array<any> = [];
    //@ts-ignore
    if (Array.isArray(record)) {
      dataList = record
    } else {
      dataList.push(record)
    }
    axios
      .post(this.bimURL + `bim/measure/showCbsMeasure`, {
        appCode: this.projectCode,
        projectName: this.projectName,
        dataList: dataList
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          console.log('res.data========================================', res.data)
          this.$emit('modelHight', res.data);
        }
      })
  }

}
</script>

<style lang="less" scoped>
.bottom_class {
  position: fixed;
  background: url("../../../../src/assets/extends/bim/frame_bottom.png");
  background-size: 100% 100%;
  border: 0;
  //height: 32%;
  height: 320px;
  width: 99.8%;
  bottom: -1px;
  margin-left: 0.1%;

  .title {
    color: #FFFFFF;
    font-size: 18px;
    margin-top: 10px;
    margin-left: 25px;
    font-weight: bold;
    float: left;
  }

  .allshow {
    float: right;
    margin-top: 10px;
    color: #17e5fd;
    font-size: 13px;
    margin-right: 25px;
    border: 0;
    background: transparent !important;
    z-index: 99;
  }

  .divider {
    margin-top: -10px;
    width: 97%;
    margin-left: 15px;
    opacity: 50%;
  }

  .leftDiv {
    margin-top: -10px;

    span {
      margin: 0 10px 0 20px;
      color: white;
      font-size: 15px;
    }

    .leftDropdown {
      min-width: 120px;
      max-width: 300px;
      background: rgba(53, 130, 243, 0.4);
      border: 0;
      color: white;
      word-break: keep-all;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :nth-child(5) {
      margin: 10px;
      width: 98%
    }

    /deep/ .ant-table {
      height: 180px;
      border: 0;
    }
  }

  .midDiv {
    margin: -10px 0 0 20px;

    /deep/ .ant-table {
      height: 215px;
      border: 0;
    }
  }

  .rightDiv {
    margin: -10px 0 0 20px;
    height: 235px;
  }

  .bottom_table {
    margin-top: 1%;
    width: 100%;

    /deep/ .ant-table-tbody > tr:hover > td {
      background: #019ce3 !important
    }

    /deep/ .ant-table-tbody > tr.ant-table-row-selected td {
      background: transparent;
      color: #ffffff;
    }

    /deep/ .ant-table-thead > tr > th {
      //表头背景色
      background-color: rgba(53, 130, 243, 0.2) !important;
      padding: 8px 8px !important;
      overflow-wrap: break-word;
      border-bottom: 1px solid transparent;
      color: rgba(248, 245, 245, 0.85);
      font-weight: 400;
      font-size: 13px;
    }

    /deep/ .ant-table-tbody > tr > td {
      padding: 8px 8px !important;
      border-bottom: 1px solid transparent;
      color: #ffffff;
    }

    /deep/ .ant-table-fixed-header .ant-table-scroll .ant-table-header {
      background-color: transparent;
    }

    /deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
      position: relative;
      background-color: transparent;
    }

    /deep/ .ant-table-placeholder {
      position: relative;
      z-index: 1;
      margin-top: -1px;
      padding: 4px 8px;
      color: #ffffff;
      font-size: 12px;
      text-align: center;
      background: transparent;
    }

    /deep/ ::-webkit-scrollbar {
      width: 4px;
    }

    /deep/ ::-webkit-scrollbar-track {
      border-radius: 0;
      background: transparent;
    }

    //表格分页
    /deep/ .ant-pagination-item-active {
      font-weight: 500;
      background: transparent;
      color: white;
      border-color: #2970ff;
    }

    /deep/ .ant-pagination-item {
      color: #ffffff !important;
      background-color: transparent;
      border: 1px solid #d9d9d9;
    }

    /deep/ .ant-table-pagination.ant-pagination {
      float: right;
      margin: 1px !important;
    }

    //表格页码-数字
    /deep/ .ant-pagination-item a {
      color: #ffffff;
    }

    //表格页码-数字-点击
    /deep/ .ant-pagination-item-active a {
      color: #2970ff;
    }

    //表格页码向前向后跳转
    /deep/ .ant-pagination-item-link {
      color: #ffffff;
      background-color: transparent;
    }

    /deep/ .ant-pagination-item-ellipsis {
      color: #ffffff;
    }

    /deep/ .ant-table-row-expand-icon {
      background: transparent;
    }
  }
}

.bottom_class_hide {
  position: fixed;
  background: url("../../../../src/assets/extends/bim/frame_bottom_hide.png");
  background-size: 100% 100%;
  border-color: transparent;
  height: 43px;
  width: 99.8%;
  bottom: -1px;
  margin-left: 0.1%;
}

.array {
  float: left;
  margin-left: 49.1%;
  z-index: 9;
}

/deep/ .clickRowStyl {
  background-color: #6ca2f6;
}

/deep/ .evenRowStyl {
  background-color: rgba(53, 130, 243, 0.1);
}
</style>

