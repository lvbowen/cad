<template>
  <div class="main">
    <a-row :gutter="8">
      <a-col :span="leftWidth">
        <a-card title="工程量清单明细" class="left_card">
          <a-icon
            class="buttonSty"
            type="fullscreen-exit"
            slot="extra"
            @click="backToNor"
            v-show="isleftFull"/>
          <a-icon
            class="buttonSty"
            type="fullscreen"
            slot="extra"
            @click="enlarge('isleftFull')"
            v-show="!isleftFull"/>
          <a-table
            class="left_table"
            rowKey="id"
            :columns="leftLabel"
            :data-source="leftData"
            :customRow="leftRowClick"
            :rowClassName="changeLeftRow"
            :scroll="{ x: 1800, y:leftHeight }"
            @expand="expandRows"
            :indentSize="10"
          />
        </a-card>
      </a-col>
      <a-col :span="rightWidth">
        <a-card
          title="CBS细项"
          class="right_top"
          size="small"
          v-show="!isrightDownFull">
          <a-input-search
            slot="extra"
            placeholder="请输入关键字"
            style="width: 200px"
            size="small"
            enterButton
            @search="onSearch"/>
          <a-button
            @click="lotMeasureBtn"
            slot="extra"
            type="primary"
            style="margin-left:10px"
            size="small"
          >批量计量
          </a-button
          >
          <a-icon
            class="buttonSty"
            type="fullscreen-exit"
            slot="extra"
            @click="backToNor"
            v-show="isrightUpFull"/>
          <a-icon
            class="buttonSty"
            type="fullscreen"
            slot="extra"
            @click="enlarge('isrightUpFull')"
            v-show="!isrightUpFull"/>
          <a-table
            class="up_table"
            :columns="rightUpLabel"
            :data-source="rightUpData"
            rowKey="id"
            :customRow="rightUpRowClick"
            :pagination="pagination"
            @change="changeUpPage"
            :rowClassName="changeRightUpRow"
            :scroll="{ x: 1000, y: upY }"
            :rowSelection="{
              selectedRowKeys: selectedUpKeys,
              onChange: onUpChange
            }"
          >
          </a-table>
        </a-card>
        <br v-show="!isrightUpFull&&!isrightDownFull"/>
        <a-card
          title="CBS计量记录"
          class="right_bottom"
          size="small"
          v-show="!isrightUpFull">
          <a-button
            @click="addBtn"
            slot="extra"
            type="primary"
            class="buttonSty"
            size="small"
          >添加
          </a-button
          >
          <a-button
            @click="saveBtn"
            slot="extra"
            type="primary"
            class="buttonSty"
            size="small"
          >保存
          </a-button
          >
          <a-button
            type="danger"
            slot="extra"
            class="buttonSty"
            @click="
              () => {
                this.isShowConfirm = true;
                this.prompt = '确认删除所选项吗？(已选择' + this.selectedDownKeys.length + '项)';
              }
            "
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
            v-show="isrightDownFull"/>
          <a-icon
            class="buttonSty"
            type="fullscreen"
            slot="extra"
            @click="enlarge('isrightDownFull')"
            v-show="!isrightDownFull"/>
          <a-table
            class="down_table"
            :columns="rightDownLabel"
            :data-source="rightDownData"
            rowKey="id"
            :scroll="{ x: 1800, y: downY }"
            :rowSelection="{
              selectedRowKeys: selectedDownKeys,
              onChange: onDownChange
            }"
          >
            <template v-for="item in downColumn" :slot="item" slot-scope="text, record">
              <div :key="item">
                <editable-cell :text="text" @change="onCellChange(record.id, item, $event)"/>
              </div>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue,} from "vue-property-decorator";
import * as Api from '../../service/api';
import {Button, Card, Icon, Input, Popconfirm, Table, Row, Col} from "@h3/antd-vue";
import {Utils} from '@ctesi/core';
import {timeDefault} from "./data/util";
//@ts-ignore
import {v4 as uuidv4} from "uuid";
import EditableCell from "./data/editTableCell.vue";

import * as Type from '../../type';

@Component({
  name: "midMeasure",
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
export default class allProtect extends Vue {
  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  leftWidth: number = 7;
  rightWidth: number = 17;

  leftLabel: Array<object> = [// 表头数据
    {
      align: "left",
      title: "CBS编码",
      key: "cbs",
      dataIndex: "cbs",
      width: "6%",
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
      title: "清单项数量",
      key: "listAmount",
      dataIndex: "listAmount"
    },
    {
      align: "center",
      title: "清单项合价",
      width: "10%",
      key: "listTotalPrice",
      dataIndex: "listTotalPrice"
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
      title: "清单项类别",
      key: "listClass",
      dataIndex: "listClass"
    },
    {
      align: "center",
      title: "已关联数量",
      key: "relatedAmount",
      dataIndex: "relatedAmount"
    },
    {
      align: "center",
      title: "已关联合价",
      key: "relatedTotalPrice",
      dataIndex: "relatedTotalPrice"
    },
    {
      align: "center",
      title: "备注",
      key: "remarks",
      dataIndex: "remarks"
    }];
  leftData: Array<any> = [];
  rightUpLabel: Array<object> = [  // 表头数据
    {
      align: "center",
      title: "MBS编码",
      key: "mbs",
      dataIndex: "mbs",
      width: '25%'
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
      key: "cbsunitPrice",
      dataIndex: "cbsunitPrice"
    },
    {
      align: "center",
      title: "CBS数量",
      key: "cbsamount",
      dataIndex: "cbsamount"
    },
    {
      align: "center",
      title: "CBS合价",
      key: "cbstotalPrice",
      dataIndex: "cbstotalPrice"
    },
    {
      align: "center",
      title: "质量状态",
      key: "qualityState",
      dataIndex: "qualityState"
    },
    {
      align: "center",
      title: "进度状态",
      key: "scheduleState",
      dataIndex: "scheduleState"
    },
    {
      align: "center",
      title: "计量填报状态",
      key: "remarks",
      dataIndex: "remarks",
      scopedSlots: {customRender: "remarks"}
    }];
  rightUpData: Array<any> = [];
  rightDownLabel: Array<object> = [  // 表头数据
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
      title: "MBS编码",
      key: "mbs",
      dataIndex: "mbs"
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
      key: "tG04cCbscommoninfosFk",
      dataIndex: "tG04cCbscommoninfosFk"
    },
    {
      align: "center",
      title: "创建日期",
      key: "createdTime",
      dataIndex: "createdTime"
    },
    {
      align: "center",
      title: "备注",
      key: "remarks",
      dataIndex: "remarks",
      scopedSlots: {customRender: "remarks"}
    }];
  rightDownData: Array<any> = [];
  downColumn: Array<string> = ["sgAmount", "remarks"];
  pagination: { total: number; current: number; pageSizeOptions: string[]; showTotal: (total) => string; pageSize: number; showSizeChanger: boolean } = {
    pageSize: 100, //每页中显示50条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["100", "200", "400", "600"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };
  selectedUpKeys: Array<string> = [];
  selectedDownKeys: Array<string> = [];
  upId: string = '';
  downId: string = '';
  like: string = '';//搜索内容

  //确认框
  isShowConfirm: boolean = false;
  prompt: string = "";

  //全屏非全屏
  isleftFull: boolean = false;
  isrightUpFull: boolean = false;
  isrightDownFull: boolean = false;
  topHight: number = 21.6;//右边上部分
  downHight: number = 21.65;//右边下部分
  upY: number = 270;
  downY: number = 270;

  currentRowLeft: { [propsName: string]: any } | null = {};
  currentRowRightUp: { [propsName: string]: any } | null = {};

  validate: string = '';
  selectedUpData: Array<any> = [];

  leftHeight: number = 690;

  private isFromBim: boolean = false;

  private storageContent: any = null;

  async mounted() {
    await this.getStorage();
    this.initLeftTable(true);
    this.getUpperCode();
    let _this = this;
    _this.leftHeight = document.documentElement.clientHeight - 250;
    this.upY = document.documentElement.clientHeight * 0.55 - 215;
    this.downY = document.documentElement.clientHeight * 0.45 - 200;
    document.documentElement.style.setProperty('--fooUp', '164px');
    document.documentElement.style.setProperty('--fooDown', '132px');
    document.documentElement.style.setProperty('--topHeight', '0px');
    document.documentElement.style.setProperty('--downHeight', '0px');
    window.onresize = () => {
      return (() => {
        _this.leftHeight = document.documentElement.clientHeight - 250;
        this.upY = document.documentElement.clientHeight * 0.55 - 215;
        this.downY = document.documentElement.clientHeight * 0.45 - 200;
      })()
    };
  }

  addBtn() {
    if (!this.currentRowRightUp) return this.$message.warn("请选择CBS项");
    if (this.validate == 'quality') {
      if (!this.currentRowRightUp.mbs || this.currentRowRightUp.mbs === '') return this.addData();
      if (this.currentRowRightUp.qualityState === '已归档' || this.currentRowRightUp.qualityState === '未关联') return this.addData();
    }
    if (this.validate == 'schedule') {
      if (this.currentRowRightUp.mbs === null || this.currentRowRightUp.mbs === '') return this.addData();
      if (this.currentRowRightUp.scheduleState === '已完工' || this.currentRowRightUp.scheduleState === '未关联') return this.addData();
    }
    if (this.validate == '') return this.addData();
    this.$message.warn('所选构件不满足计量条件，请检查进度或质检状态！')
  }

  addData() {
    //@ts-ignore
    if (this.currentRowRightUp == null) return this.$message.warn("请选择CBS项");
    this.selectedDownKeys = [];
    let temptUuid = uuidv4();
    let uuid = temptUuid.split("-").join("");
    let sgAmountTempt = this.currentRowRightUp.cbsamount;
    let jlAmountTempt = this.currentRowRightUp.cbsamount;
    let yzAmountTempt = this.currentRowRightUp.cbsamount;
    for (let i = 0; i < this.rightDownData.length; i++) {
      sgAmountTempt = sgAmountTempt - this.rightDownData[i].sgAmount;
      jlAmountTempt = jlAmountTempt - this.rightDownData[i].jlAmount;
      yzAmountTempt = yzAmountTempt - this.rightDownData[i].yzAmount;
    }
    let sgMoneyTempt = sgAmountTempt * this.currentRowRightUp.cbsunitPrice;
    let jlMoneyTempt = jlAmountTempt * this.currentRowRightUp.cbsunitPrice;
    let yzMoneyTempt = yzAmountTempt * this.currentRowRightUp.cbsunitPrice;
    let newRow = {
      id: uuid,
      key: uuid,
      createdTime: timeDefault(),
      cbs: this.currentRowRightUp.cbs,
      mbs: this.currentRowRightUp.mbs,
      cbsname: this.currentRowRightUp.cbsname,
      schemeCBSUnitPrice: this.currentRowRightUp.cbsunitPrice,
      schemeCBSAmount: this.currentRowRightUp.cbsamount,
      schemeCBSMoney: this.currentRowRightUp.cbstotalPrice,
      jlAmount: jlAmountTempt,
      jlMoney: jlMoneyTempt,
      sgAmount: sgAmountTempt,
      sgMoney: sgMoneyTempt,
      yzAmount: yzAmountTempt,
      yzMoney: yzMoneyTempt,
      currentState: "未提交汇总",
      tG04aCbsFk: this.currentRowRightUp.id,
      tG04aContractdetailFk: this.currentRowRightUp.tG04aContractdetailFk,
      tG04cCbscommoninfosFk: "",
      tG04cMeasureperiodFk: "",
    };
    this.rightDownData.unshift(newRow);
    this.selectedDownKeys.push(uuid);
    this.saveBtn();
  }

  backToNor() {
    this.isrightUpFull = false;
    this.isrightDownFull = false;
    this.isleftFull = false;
    this.leftWidth = 7;
    this.rightWidth = 17;
    this.topHight = 21.54;
    this.downHight = 21.54;
    this.upY = document.documentElement.clientHeight * 0.55 - 215;
    this.downY = document.documentElement.clientHeight * 0.45 - 200;
    document.documentElement.style.setProperty('--fooUp', '145px');
    document.documentElement.style.setProperty('--fooDown', '142px');
    document.documentElement.style.setProperty('--topHeight', '0vh');
    document.documentElement.style.setProperty('--downHeight', '0vh');
  }

  // 右下删除取消事件
  cancel() {
    this.isShowConfirm = false;
    this.$message.error("取消删除");
  }

  // 右下删除确认事件
  confirm() {
    if (this.selectedDownKeys.length == 0) {
      //@ts-ignore
      this.$message.warn("请选择需要删除的项！");
    } else {
      this.isShowConfirm = false;
      this.delCountRow();
    }
  }

  // 行点击变色
  changeLeftRow(record, index) {
    let rowColor: string = '';
    if (record.measureState === '已填报完毕') {
      rowColor = 'greenRow';
    } else if (record.measureState === '已填报,但未填报完毕') {
      rowColor = 'blueRow';
    } else if (record.measureState === '未计量') {
      rowColor = 'redRow';
    }
    return record === this.currentRowLeft ? "clickRowStyl" : rowColor;
  }

  // 行变色
  changeRightUpRow(record, index) {
    let rowColor: string = 'redRow';
    if (record.remarks === '已填报完毕') {
      rowColor = 'greenRow'
    } else if (record.remarks === '已填报,但未填报完毕') {
      rowColor = 'blueRow'
    }
    return record === this.currentRowRightUp ? "clickRowStyl" : rowColor;
  }

  changeUpPage(pagination) {
    this.pagination.current = pagination.current;
    this.pagination.pageSize = pagination.pageSize;
    this.initUpTable();
  }

  delCountRow() {
    for (let key in this.selectedDownKeys) {
      this.rightDownData = this.rightDownData.filter(item => item.id != this.selectedDownKeys[key]);
    }
    Api.cbsMeasureDel({
      projectCode: this.projectCode ?? '',
      ids: this.selectedDownKeys,
      cbsId: this.currentRowRightUp?.id as string
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error("删除失败");
      this.$message.success("删除成功");
    });
    this.selectedDownKeys = [];
  }

  enlarge(value) {
    if (value === 'isleftFull') {
      this.isleftFull = true;
      this.leftWidth = 24;
      this.rightWidth = 0;
    } else if (value === 'isrightUpFull') {
      this.isrightUpFull = true;
      this.upY = document.documentElement.clientHeight - 230;
      document.documentElement.style.setProperty('--fooUp', '-43vh');
      document.documentElement.style.setProperty('--topHeight', '43vh');
    } else if (value === 'isrightDownFull') {
      this.isrightDownFull = true;
      this.downY = document.documentElement.clientHeight - 230;
      document.documentElement.style.setProperty('--fooDown', '-48vh');
      document.documentElement.style.setProperty('--downHeight', '48vh');
    }

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

  // 点击展开图标时触发
  expandRows(expanded, record) {
    this.getChildTree(record);
  }

  //获取子节点
  getChildTree(c) {
    const {cbsIds, cbsMbsIds} = Utils.GetRequest();
    let _this = this;
    return new Promise((resolve) => {
      if (c.children != undefined && c.children.length != 0) { // 有值了直接渲染
        //@ts-ignore
        resolve()
        return
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      Api.getModelChildsWithState({
        cbsIds: this.isFromBim ? this.storageContent.cbsIds.split(',') ?? undefined : cbsIds?.split(',') ?? undefined,
        cbsMbsIds: this.isFromBim ? this.storageContent.cbsMbsIds.split(',') ?? undefined : cbsMbsIds?.split(',') ?? undefined,
        projectCode: this.projectCode ?? '',
        schemeId: "",
        parentId: c.id,
        multiProjectFlag: this.projectConfig?.multiProjectFlag ?? false,
        projectName: this.projectConfig?.projectName ?? ''
      }).then((res) => {
        c["children"] = res.data;
        c["childCount"] = res.data.length;
        this.editListTree(_this.leftData, c.id, c);
      })
      //@ts-ignore
      resolve()
    })
  }

  getUpperCode() {
    Api.getUpperCode({
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      moduleCode: 'payment'
    }).then(res => {
      if(!res.data) return this.validate='';
      this.validate = res.data
    })
  }

  //CBS计量记录
  initDownTable() {
    this.selectedDownKeys = [];
    Api.cbsMeasureGet({
      projectCode: this.projectCode ?? '',
      cbsId: this.downId
    }).then(res => {
      this.rightDownData = res.data;
    })
  }

  // 初始化CBS细项
  initUpTable() {
    const {cbsIds, cbsMbsIds} = Utils.GetRequest();
    this.selectedUpKeys = [];
    Api.getModelCbsWithState({
      cbsIds: this.isFromBim ? this.storageContent.cbsIds.split(',') ?? undefined : cbsIds?.split(',') ?? undefined,
      cbsMbsIds: this.isFromBim ? this.storageContent.cbsMbsIds.split(',') ?? undefined : cbsMbsIds?.split(',') ?? undefined,
      projectCode: this.projectCode ?? '',
      detailId: this.upId,
      like: this.like,
      page: this.pagination.current,
      size: this.pagination.pageSize
    }).then(res => {
      if (!res.data) return this.rightUpData = [];
      this.pagination.total = res.data.total;
      this.rightUpData = res.data.records;
    })
  }

  // 初始化左侧表格（工程量清单明细）
  initLeftTable(firstLoad?: boolean) {
    const {cbsIds, cbsMbsIds} = Utils.GetRequest();
    this.leftData = []
    Api.getModelChildsWithState({
      cbsIds: this.isFromBim ? this.storageContent.cbsIds.split(',') ?? undefined : cbsIds?.split(',') ?? undefined,
      cbsMbsIds: this.isFromBim ? this.storageContent.cbsMbsIds.split(',') ?? undefined : cbsMbsIds?.split(',') ?? undefined,
      projectCode: this.projectCode ?? '',
      schemeId: "",
      parentId: "",
      multiProjectFlag: this.projectConfig?.multiProjectFlag ?? false,
      projectName: this.projectConfig?.projectName ?? ''
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('工程量清单明细获取失败');
      this.leftData = res.data;
      //todo search uptable
      if (firstLoad && cbsIds && cbsMbsIds) {
        this.firstLoadSearchUpTable();
      }
    })
  }

  //批量计量
  lotMeasureBtn() {
    let listKey: Array<string> = []
    if (this.selectedUpKeys.length == 0) return this.$message.warn("请选择行");
    if (this.validate == '') {
      listKey = this.selectedUpKeys
    }
    if (this.validate == 'quality') {
      for (let i = 0; i < this.selectedUpData.length; i++) {
        if (!this.selectedUpData[i].mbs || this.selectedUpData[i].mbs === '') {
          listKey.push(this.selectedUpData[i].id);
          continue;
        }
        if (this.selectedUpData[i].qualityState === '已归档' || this.selectedUpData[i].qualityState === '未关联') {
          listKey.push(this.selectedUpData[i].id);
        }
      }
    }
    if (this.validate == 'schedule') {
      for (let i = 0; i < this.selectedUpData.length; i++) {
        if (this.selectedUpData[i].mbs === null || this.selectedUpData[i].mbs === '') {
          listKey.push(this.selectedUpData[i].id);
          continue;
        }
        if (this.selectedUpData[i].scheduleState === '已完工' || this.selectedUpData[i].scheduleState === '未关联') {
          listKey.push(this.selectedUpData[i].id)
        }
      }
    }
    if (listKey.length === 0) return this.$message.warn('所选构件不满足计量条件，请检查进度或质检状态！')
    Api.banchRecord({
      projectCode: this.projectCode ?? '',
      cbsIdList: listKey,
      detailId: this.upId,
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error("添加失败");
        this.$message.success("添加成功");
      })
  }

  numberMul(arg1, arg2) {
    var m = 0;
    var s1 = arg1.toString();
    var s2 = arg2.toString();
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
    let dataSource = [...this.rightDownData];
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value;
      target["jlAmount"] = target["sgAmount"];
      target["yzAmount"] = target["sgAmount"];
      target["sgMoney"] = this.numberMul(Number(target["sgAmount"]), Number(target["schemeCBSUnitPrice"]));
      target["jlMoney"] = this.numberMul(Number(target["jlAmount"]), Number(target["schemeCBSUnitPrice"]));
      target["yzMoney"] = this.numberMul(Number(target["yzAmount"]), Number(target["schemeCBSUnitPrice"]));
      this.rightDownData = dataSource;
      this.selectedDownKeys.push(key)
      this.saveBtn()
    }
  }

  //搜索
  onSearch(value) {
    this.like = value;
    this.initUpTable()
  }

  // 行点击事件
  leftRowClick(record, index) {
    return {
      on: {
        click: () => {
          this.upId = record.id;
          this.pagination = {
            pageSize: 100, //每页中显示50条数据
            total: 0,
            current: 1,
            showSizeChanger: true,
            pageSizeOptions: ["100", "200", "400", "600"], //每页中显示的数据
            showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
          };
          this.initUpTable();
          return this.currentRowLeft = record;
        }
      }
    };
  }

  onUpChange(selectedUpKeys, e) {
    this.selectedUpKeys = selectedUpKeys;
    this.selectedUpData = e;
  }

  onDownChange(selectedDownKeys) {
    this.selectedDownKeys = selectedDownKeys;
  }

  rightUpRowClick(record, index) {
    return {
      on: {
        click: () => {
          this.downId = record.id;
          this.initDownTable()
          return this.currentRowRightUp = record;
        }
      }
    };
  }

  saveBtn() {
    let temptDataSon: any = [];
    for (let i = 0; i < this.selectedDownKeys.length; i++) {
      for (let j = 0; j < this.rightDownData.length; j++) {
        if (this.selectedDownKeys[i] == this.rightDownData[j].id) {
          temptDataSon.push(this.rightDownData[j]);
        }
      }
    }
    if (this.selectedDownKeys.length = 0) return this.$message.warn("请选择需要保存的项！");
    let sgTotal = 0;
    let jlTotal = 0;
    let yzTotal = 0;
    for (let i = 0; i < temptDataSon.length; i++) {
      sgTotal += Number(temptDataSon[i].sgAmount);
      jlTotal += Number(temptDataSon[i].jlAmount);
      yzTotal += Number(temptDataSon[i].yzAmount);
    }
    if (
      sgTotal > temptDataSon[0].schemeCBSAmount &&
      jlTotal > temptDataSon[0].schemeCBSAmount &&
      yzTotal > temptDataSon[0].schemeCBSAmount
    ) return this.$message.warn("施工/监理/业主申报量不能超过CBS数量！");
    ;
    Api.cbsMeasureInsert({
      projectCode: this.projectCode ?? '',
      objList: temptDataSon
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error('保存失败');
        this.$message.success('保存成功');
        this.selectedDownKeys = []
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
      this.isFromBim = true;
      this.storageContent = {
        cbsIds: resData[0],
        cbsMbsIds: resData[1]
      }
    }
  }

  private firstLoadSearchUpTable() {
    this.pagination = {
      pageSize: 100, //每页中显示50条数据
      total: 0,
      current: 1,
      showSizeChanger: true,
      pageSizeOptions: ["100", "200", "400", "600"], //每页中显示的数据
      showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
    };
    this.initUpTable();
  }
}
</script>

<style lang="less" scoped>
@import "./data/measure.css";
@import (reference) "../../styles/theme.less";

:root {
  --fooUp: 145px;
  --fooDown: 142px;
  --topHeight: 0vh;
  --downHeight: 0vh;
}

.main {
  .flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .left_card {
    height: calc(100vh - 96px);

    /deep/ .ant-card-head-title {
      font-size: 16px;
      font-weight: 500;
      color: #0a0a0a;
      padding-left: 5px !important;
      font-family: Source Han Sans CN;
    }

    .left_table {
      /deep/ .ant-table {
        height: calc(100vh - 200px);
      }
    }
  }

  .right_top {
    height: calc(55vh - 78px + var(--topHeight));

    .up_table {
      /deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
        height: calc(55vh - var(--fooUp));
      }
    }
  }

  .right_bottom {
    height: calc(45vh - 40px + var(--downHeight));

    /deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
      height: calc(45vh - var(--fooDown));
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
</style>
