<template>
  <div class="main">
    <a-card
      title="工程量清单明细"
      class="left_card"
      size="small"
      v-show="!isBottomFull">
      <a-icon
        class="buttonSty"
        type="fullscreen-exit"
        slot="extra"
        @click="backToNor"
        v-show="isUpFull"/>
      <a-icon
        class="buttonSty"
        type="fullscreen"
        slot="extra"
        @click="enlarge('isUpFull')"
        v-show="!isUpFull"/>
      <a-table
        v-if="topData.length>0"
        class="left_table"
        rowKey="id"
        :columns="topLabel"
        :defaultExpandAllRows="true"
        :data-source="topData"
        :customRow="upRowClick"
        :rowClassName="changeUpRow"
        :scroll="{ x: 1600, y:tableheight }"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :indentSize="10"
      >
        <template slot="qualityState" slot-scope="text, record">
          <span v-if="record.qualityState==='未关联'" style="color: rgb(143,139,139)">未关联</span>
          <span v-else-if="record.qualityState==='已归档'" style="color: rgba(38,201,116,1)">已归档</span>
          <span v-else-if="record.qualityState==='审核中'" style="color:rgba(55,126,255,1)">审核中</span>
          <span v-else-if="record.qualityState==='无状态'" style="color: rgba(241,181,0,1)">无状态</span>
          <span v-else-if="record.qualityState==='未填报'" style="color: rgba(255,0,66,1)">未填报</span>
        </template>
        <template slot="scheduleState" slot-scope="text, record">

          <span v-if="record.scheduleState==='已完工'" style="color: rgba(38,201,116,1)">已完工</span>
          <span v-else-if="record.scheduleState==='进行中'" style="color:rgba(55,126,255,1)">进行中</span>
          <span v-else-if="record.scheduleState==='预警'" style="color: rgba(241,181,0,1)">预警</span>
          <span v-else-if="record.scheduleState==='滞后'" style="color: rgba(255,0,66,1)">滞后</span>
          <span v-else style="color: rgb(143,139,139)">{{ record.scheduleState }}</span>
        </template>
        <template slot="measureState" slot-scope="text, record">
          <span v-if="record.measureState==='已填报完毕'" style="color: rgba(38,201,116,1)">已填报完毕</span>
          <span v-else-if="record.measureState==='已填报,但未填报完毕'" style="color: rgb(8,38,227)">已填报,但未填报完毕</span>
          <span v-else-if="record.measureState==='未填报'" style="color:rgba(255,0,66,1)">未填报</span>
        </template>
      </a-table>
    </a-card>
    <a-card
      title="CBS计量记录"
      class="right_card"
      size="small"
      v-show="!isUpFull">
      <a-button
        @click="addBtn"
        slot="extra"
        type="primary"
        class="buttonSty"
        size="small">添加
      </a-button>
      <a-button
        @click="saveBtn"
        slot="extra"
        type="primary"
        class="buttonSty"
        size="small">保存
      </a-button>
      <a-button
        type="danger"
        slot="extra"
        class="buttonSty"
        @click="() => {this.isShowConfirm = true;this.prompt = '确认删除所选项吗？(已选择' + this.selectedDownKeys.length + '项)';}"
        size="small"
      >删除
        <a-popconfirm
          :title="prompt"
          :visible="isShowConfirm"
          okText="确认"
          cancelText="取消"
          @confirm="confirm"
          @cancel="cancel"
        >
        </a-popconfirm>
      </a-button>
      <a-icon
        class="buttonSty"
        type="fullscreen-exit"
        slot="extra"
        @click="backToNor"
        v-show="isBottomFull"/>
      <a-icon
        class="buttonSty"
        type="fullscreen"
        slot="extra"
        @click="enlarge('isBottomFull')"
        v-show="!isBottomFull"/>
      <a-table
        class="right_table"
        :columns="bottomLabel"
        :data-source="bottomData"
        :rowClassName="changeDownRow"
        rowKey="id"
        :scroll="{ x: 1800, y: tableheight }"
        :rowSelection="{
          selectedRowKeys: selectedDownKeys,
          onChange: onRightChange
        }"
      >
        <template v-for="item in downColumn" :slot="item" slot-scope="text, record">
          <div :key="item">
            <editable-cell :text="text" @change="onCellChange(record.id, item, $event)"/>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts">
/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Vue,} from "vue-property-decorator";
import * as Api from '../../service/api';
import {Button, Card, Icon, Input, Popconfirm, Table, Row, Col} from "@h3/antd-vue";
import {Utils} from '@ctesi/core';
//@ts-ignore
import {v4 as uuidv4} from "uuid";
import EditableCell from "../measurePayment/data/editTableCell.vue";

import * as Type from '../../type';

@Component({
  name: "planMeasureV3",
  components: {
    ARow: Row,
    ACol: Col,
    AIcon: Icon,
    ACard: Card,
    AButton: Button,
    AInput: Input,
    ATable: Table,
    APopconfirm: Popconfirm,
    AInputSearch: Input.Search,
    EditableCell
  }
})
export default class planMeasureV3 extends Vue {
  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  topLabel: Array<{ [propsName: string]: any }> = [// 表头数据
    {
      title: "CBS编码",
      key: "cbs",
      dataIndex: "cbs",
      width: "14%",
    },
    {
      align: "center",
      title: "清单项编码",
      key: "listCode",
      dataIndex: "listCode",
    },
    {
      align: "center",
      title: "清单项名称",
      key: "listName",
      width: "15%",
      dataIndex: "listName"
    },
    {
      align: "center",
      title: "单位",
      width: "4%",
      key: "listUnit",
      dataIndex: "listUnit"
    },
    {
      align: "center",
      title: "单价",
      key: "listUnitPrice",
      dataIndex: "listUnitPrice"
    },
    {
      align: "center",
      title: "变更工程量",
      key: "changeAmount",
      dataIndex: "changeAmount",
    },
    {
      align: "center",
      title: "总工程量",
      key: "finalTotalAmount",
      dataIndex: "finalTotalAmount",
    },
    {
      align: "center",
      title: "总工程款",
      key: "finalTotalPrice",
      dataIndex: "finalTotalPrice",
    },
    {
      align: "center",
      title: "计量状态",
      key: "measureState",
      dataIndex: "measureState",
      scopedSlots: {customRender: "measureState"}
    },
    {
      align: "center",
      title: "进度状态",
      key: "scheduleState",
      dataIndex: "scheduleState",
      scopedSlots: {customRender: "scheduleState"}
    },
    {
      align: "center",
      title: "质量状态",
      key: "qualityState",
      dataIndex: "qualityState",
      scopedSlots: {customRender: "qualityState"}
    }];
  topData: Array<{ [propsName: string]: string | number }> = [];
  bottomLabel: Array<{ [propsName: string]: any }> = [  // 表头数据
    {
      align: "center",
      title: "所属CBS",
      key: "cbs",
      dataIndex: "cbs"
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
      dataIndex: "cbsname"
    },
    {
      align: "center",
      title: "CBS单价",
      key: "schemeCBSUnitPrice",
      dataIndex: "schemeCBSUnitPrice",
      scopedSlots: {customRender: "schemeCBSUnitPrice"}
    },
    {
      align: "center",
      title: "CBS数量",
      key: "schemeCBSAmount",
      dataIndex: "schemeCBSAmount",
      scopedSlots: {customRender: "schemeCBSAmount"}
    },
    {
      align: "center",
      title: "CBS合价",
      key: "schemeCBSMoney",
      dataIndex: "schemeCBSMoney"
    },
    {
      align: "center",
      title: "施工申报量",
      key: "sgAmount",
      dataIndex: "sgAmount",
      scopedSlots: {customRender: "sgAmount"}
    },
    {
      align: "center",
      title: "施工申报金额",
      key: "sgMoney",
      dataIndex: "sgMoney"
    },
    {
      align: "center",
      title: "监理审核量",
      key: "jlAmount",
      dataIndex: "jlAmount",
      scopedSlots: {customRender: "jlAmount"}
    },
    {
      align: "center",
      title: "监理审核金额",
      key: "jlMoney",
      dataIndex: "jlMoney"
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
      dataIndex: "yzMoney"
    },
    {
      align: "center",
      title: "状态",
      key: "currentState",
      dataIndex: "currentState",
      filters: [
        {
          text: "已提交汇总",
          value: "已提交汇总"
        },
        {
          text: "未提交汇总",
          value: "未提交汇总"
        }
      ],
      onFilter: (value, record) => record.currentState.indexOf(value) === 0
    },
    {
      align: "center",
      title: "计量期号",
      key: "tg04cCbscommoninfosFk",
      dataIndex: "tg04cCbscommoninfosFk"
    },
    {
      align: "center",
      title: "创建日期",
      key: "createdTime",
      dataIndex: "createdTime"
    }
  ];
  bottomData: Array<{ [propsName: string]: string | number }> = [];
  downColumn: Array<string> = ["sgAmount"];
  selectedUpKeys: Array<string> = [];
  selectedDownKeys: Array<string> = [];
  downId: string = '';
  like: string = '';//搜索内容

  //确认框
  isShowConfirm: boolean = false;
  prompt: string = "";

  //全屏非全屏
  isUpFull: boolean = false;
  isBottomFull: boolean = false;

  currentRowUp: { [propsName: string]: any } | null = null;
  currentRowBottom: { [propsName: string]: any } | null = null;

  validate: string = '';
  cbsInfo: Array<{ [propsName: string]: string | number }> = [];
  tableheight: number = 270;
  selectedRowKeys: Array<string> = [];
  selectedRowInfo: Array<{ [propsName: string]: string | number }> = [];
  private storageContent: any = null;

  async mounted() {
    await this.getStorage();
    this.initUpTable();
    this.getUpperCode();
    let _this = this;
    _this.tableheight = document.documentElement.clientHeight * 0.5 - 180;
    const cardTempt = document.documentElement.clientHeight * 0.5 - 51;
    document.documentElement.style.setProperty('--tableHeight', `${_this.tableheight}px`);
    document.documentElement.style.setProperty('--cardHeight', `${cardTempt}px`);
    document.documentElement.style.setProperty('--pageHeight', `83px`);
    window.onresize = () => {
      return (() => {
        _this.tableheight = document.documentElement.clientHeight * 0.5 - 180;
        document.documentElement.style.setProperty('--tableHeight', `${_this.tableheight}px`);
        document.documentElement.style.setProperty('--cardHeight', `${cardTempt}px`);
        document.documentElement.style.setProperty('--pageHeight', `83px`);
      })()
    };
  }

  addBtn() {
    if (!this.currentRowUp) return this.$message.warn("请选择工程量清单明细");
    Api.generateCbsMeasureByCbsV3({
      appCode:this.projectCode??'',
      cbsNodeList:this.selectedRowInfo
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      this.bottomData = this.bottomData.concat(res.data);
      this.$message.info(res.errmsg as string);
    })
  }

  backToNor() {
    this.isBottomFull = false;
    this.isUpFull = false;
    this.tableheight = document.documentElement.clientHeight * 0.5 - 180;
    const cardTempt = document.documentElement.clientHeight * 0.5 - 51;
    document.documentElement.style.setProperty('--tableHeight', `${this.tableheight}px`);
    document.documentElement.style.setProperty('--cardHeight', `${cardTempt}px`);
    document.documentElement.style.setProperty('--pageHeight', `83px`);
  }

  // 右下删除取消事件
  cancel() {
    this.isShowConfirm = false;
    this.$message.error("取消删除");
  }

  // 右下删除确认事件
  confirm() {
    if (this.selectedDownKeys.length === 0) return this.$message.warn("请选择需要删除的项！");
    this.isShowConfirm = false;
    this.delCountRow();
  }

  // CBS计量记录表行点击变色
  changeDownRow(record, index) {
    let rowColor: string = '';
    if (!record.hasSave) {
      rowColor = 'yellowRow';
    } else {
      rowColor = ''
    }
    return rowColor;
  }

  // 工程量清单明细表行点击变色
  changeUpRow(record, index) {
    return record === this.currentRowUp ? "clickRowStyl" : '';
  }

  delCountRow() {
    let tempt: Array<string> = [];
    for (let i = 0; i < this.bottomData.length; i++) {
      for (let j = 0; j < this.selectedDownKeys.length; j++) {
        if (this.bottomData[i].id === this.selectedDownKeys[j]) {
          if (this.bottomData[i].currentState !== '已提交汇总') {
            tempt.push(this.bottomData[i].id as string);
          }
        }
      }
    }
    Api.deleteV3({
      projectCode: this.projectCode ?? '',
      cbsMeasureIdList: tempt,
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("删除成功");
    });
    this.selectedDownKeys = [];
  }

  enlarge(value) {
    if (value === 'isUpFull') {
      this.isUpFull = true;
    } else if (value === 'isBottomFull') {
      this.isBottomFull = true;
    }
    const cardTempt = document.documentElement.clientHeight - 80;
    document.documentElement.style.setProperty('--cardHeight', `${cardTempt}px`);
    this.tableheight = document.documentElement.clientHeight - 250;
    document.documentElement.style.setProperty('--tableHeight', `${this.tableheight}px`);
    document.documentElement.style.setProperty('--pageHeight', `120px`);
  }


  /**
   *遍历多棵树（编辑节点）
   *data  多棵树
   *key   关键字
   */
  editListTree(data, key, value) {
    let flag = false;
    for (let i = 0; i < data.length; i++) {
      if (flag) {
        break
      } else {
        if (data[i].id === key) {
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
          if (data.children[i].id === key) {
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

  getUpperCode() {
    Api.getUpperCode({
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      moduleCode: 'payment'
    }).then(res => {
      this.validate = res.data
    })
  }

  //CBS计量记录
  initBottomTable() {
    this.selectedDownKeys = [];
    if (!this.currentRowUp) return this.$message.warn('请选择工程量清单!');
    Api.getByCBSV3({
      cbsCode: this.currentRowUp.cbs as string,
      projectCode: this.projectCode as string,
      schemaId: this.currentRowUp.tg04aContractschemeFk as string,
      like: ''
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      this.bottomData = res.data;
    })
  }

  // 初始化上方表格（工程量清单明细）
  initUpTable() {
    this.topData = []
    Api.getPlanCbsV3({
      projectName: this.projectConfig?.projectName ?? '',
      appCode: this.projectCode ?? '',
      multiProjectFlag: this.projectConfig?.multiProjectFlag ?? true
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('工程量清单明细获取失败');
      this.topData = res.data;
    })
  }

  numberMul(arg1, arg2) {
    let m = 0;
    const s1 = arg1.toString();
    const s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length;
    } catch (e) {
    }
    try {
      m += s2.split(".")[1].length;
    } catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
  }

  //单元格编辑
  onCellChange(key, dataIndex, value) {
    this.selectedDownKeys = []
    let dataSource = [...this.bottomData];
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value;
      target["jlAmount"] = target["sgAmount"];
      target["yzAmount"] = target["sgAmount"];
      target["sgMoney"] = this.numberMul(Number(target["sgAmount"]), Number(target["schemeCBSUnitPrice"]));
      target["jlMoney"] = this.numberMul(Number(target["jlAmount"]), Number(target["schemeCBSUnitPrice"]));
      target["yzMoney"] = this.numberMul(Number(target["yzAmount"]), Number(target["schemeCBSUnitPrice"]));
      this.bottomData = dataSource;
      this.selectedDownKeys.push(key)
      this.saveBtn()
    }
  }

  // 行点击事件
  upRowClick(record, index) {
    return {
      on: {
        click: () => {
          this.currentRowUp = record;
          return this.initBottomTable();
        },
      }
    };
  }

  onRightChange(selectedDownKeys, info) {
    this.selectedDownKeys = selectedDownKeys;
    this.cbsInfo = info;
  }

  onSelectChange(selectedRowInfo, info) {
    this.selectedRowInfo = [];
    this.selectedRowKeys = selectedRowInfo;
    info.forEach((item) => {
      if (item.children === null || item.children?.length === 0) {
        this.selectedRowInfo.push(item)
      }
    })
  }

  saveBtn() {
    let temptDataSon: any = [];
    for (let i = 0; i < this.selectedDownKeys.length; i++) {
      for (let j = 0; j < this.bottomData.length; j++) {
        if (this.selectedDownKeys[i] == this.bottomData[j].id) {
          temptDataSon.push(this.bottomData[j]);
        }
      }
    }
    if (this.selectedDownKeys.length === 0) return this.$message.warn("请选择需要保存的项！");
    // let sgTotal = 0;
    // let jlTotal = 0;
    // let yzTotal = 0;
    // for (let i = 0; i < temptDataSon.length; i++) {
    //   sgTotal += Number(temptDataSon[i].sgAmount);
    //   jlTotal += Number(temptDataSon[i].jlAmount);
    //   yzTotal += Number(temptDataSon[i].yzAmount);
    // }
    // if (
    //   sgTotal > temptDataSon[0].schemeCBSAmount &&
    //   jlTotal > temptDataSon[0].schemeCBSAmount &&
    //   yzTotal > temptDataSon[0].schemeCBSAmount
    // ) return this.$message.warn("施工/监理/业主申报量不能超过CBS数量！");
    Api.insertV3({
      projectCode: this.projectCode ?? '',
      objList: temptDataSon
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error('保存失败');
        this.$message.success('保存成功');
        this.selectedDownKeys = [];
        this.initBottomTable()
      })
  }

  private async getStorage() {
    if (window.location.href.indexOf('mbsKey') == -1) return
    //@ts-ignore
    const mbsKey = window.location.href.split('mbsKey=') ? window.location.href.split('mbsKey=') [1] : null;
    if (mbsKey) {
      const resData: Array<any> = await new Promise((resolve) => {
        Api.getStorge({key: mbsKey}).then(res => {
          if (res.data?.indexOf('@')) return resolve(res.data.split('@'));
          return null
        })
      });
      if (!resData) return null;
      this.storageContent = {
        cbsIds: resData[0],
        cbsMbsIds: resData[1]
      }
    }
  }
}
</script>

<style lang="less" scoped>
:root {
  --tableHeight: 145px;
  --cardHeight: 145px;
  --pageHeight: 83px;
}

.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .left_card {
    height: var(--cardHeight);
    margin-bottom: 6px;

    .left_table {
      /deep/ .ant-table {
        height: calc(var(--cardHeight) - var(--pageHeight));
      }
    }
  }

  /deep/ .clickRowStyl {
    background-color: #bcf5f6;
  }

  .right_card {
    height: var(--cardHeight);

    .right_table {
      /deep/ .ant-table {
        height: calc(var(--cardHeight) - var(--pageHeight));
      }

      /deep/ .yellowRow {
        background-color: #f1e0a2 !important;
      }
    }
  }

  .buttonSty {
    margin-left: 10px;
  }
}

/deep/ .ant-card-body {
  padding: 8px;
}

/deep/ .ant-table-placeholder {
  display: none;
}

/deep/ .ant-table-pagination.ant-pagination {
  margin: 2px 0;
}

/deep/ .ant-table-body {
  height: var(--tableHeight);
}

/deep/ .ant-table-tbody > tr > td {
  padding: 8px 4px;
}

/deep/ .ant-table-thead > tr > th {
  padding: 16px 4px;
}

/deep/ .ant-card-body .ant-table .ant-table-tbody > tr:hover:not(.ant-table-expanded-row) > td {
  background-color: #bcf5f6;
}
</style>
