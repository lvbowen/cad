<template>
  <div class="main">
    <!--  模型页面，可参照此页面基本结构 -->
    <a-card title="计量汇总" class="box">
      <a-input-group
        compact
        slot="extra"
        style="width:500px;float:left">
        <a-input
          style="width:30%"
          placeholder="关键字：计量周期"
          v-model="measurePeriodSearch"
          @pressEnter="onSearch"/>
        <a-input
          style="width:30%"
          placeholder="关键字：合同编号"
          @pressEnter="onSearch"
          v-model="contractNumSearch"/>
        <a-input-search
          placeholder="关键字：支付周期"
          enterButton
          style="width: 40%"
          v-model="payPeriodSearch"
          @search="onSearch"
          @pressEnter="onSearch"/>
      </a-input-group>
      <a-button
        @click="addBtn"
        style="margin-left: 10px"
        type="primary"
        slot="extra">添加
      </a-button>
      <a-button
        @click="saveBtn"
        style="margin-left: 10px"
        type="primary"
        slot="extra">保存
      </a-button>
      <a-button
        @click="delBtn"
        type="danger"
        style="margin-left: 10px"
        slot="extra"
      >删除
        <a-popconfirm
          title="确认删除此行？"
          :visible="isShowConfirm"
          okText="确认"
          cancelText="取消"
          @confirm="confirm"
          @cancel="cancel"
        >
        </a-popconfirm>
      </a-button>
      <a-table
        rowKey="id"
        :columns="tableLabelPeriod"
        :data-source="tableDataPeriod"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
        :scroll="{ x: 1632, y: yHeight }"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <span slot="操作" slot-scope="record">
          <a @click="() => handleEdit(record)">编辑</a>
        </span>
        <template slot="measurePeriod" slot-scope="text, record">
          <editable-cell :text="text" @change="onCellChange(record.id, 'measurePeriod', $event)"/>
        </template>
        <template slot="schema_name" slot-scope="text, record">
          <a @click="schemePick(record)">{{ record.schema_name }}</a>
        </template>
        <template slot="lastPeriod" slot-scope="text, record">
          <a @click="periodPick(record)">{{ record.lastPeriod }}</a>
        </template>
        <template v-for="item in columnContract" :slot="item" slot-scope="text, record">
          <div :key="item">
            <a-date-picker
              size="small"
              placeholder="请选择时间"
              :value="momentDateStr(text)"
              @change="onChangeDate(record.id, item, $event)"
            />
          </div>
        </template>
      </a-table>
    </a-card>
    <!-- 选择清单方案 -->
    <a-modal
      title="选择清单方案"
      :visible="isContractShow"
      @ok="modalOk"
      @cancel="modalCancel"
      okText="完成选择"
      width="1600px"
    >
      <a-table
        rowKey="id"
        :columns="modalLabel"
        :data-source="modalData"
        :rowClassName="setRowClassName"
        :customRow="rowClick"
      >
      </a-table>
    </a-modal>
    <a-modal
      title="选择计量周期"
      :visible="isPeriodShow"
      @ok="periodOk"
      @cancel="closePeriodShow"
      okText="完成选择"
      cancelText="无上期计量周期"
      width="1500px"
    >
      <template slot="footer">
        <a-button @click="periodCancel">无上期计量周期</a-button>
        <a-button type="primary" @click="periodOk">完成选择</a-button>
      </template>
      <a-table
        rowKey="id"
        :columns="lastPeriodLabel"
        :data-source="lastPeriodData"
        :rowClassName="setRowClassName"
        :customRow="rowClick"
      >
      </a-table>
    </a-modal>
  </div>
</template>

<script lang="ts">
/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import moment from "moment";
import {Card, Button, Table, Input, Popconfirm, Modal, DatePicker} from "@h3/antd-vue";
import * as Api from '../../service/api';
import {timeDefault, capitalize} from "../measurePayment/data/util";
//@ts-ignore
import {v4 as uuidv4} from "uuid";
import EditableCell from "../measurePayment/data/editTableCell.vue";

import * as Type from '../../type';

@Component({
  name: "measureSummaryV3",
  components: {
    ACard: Card,
    AButton: Button,
    AInput: Input,
    ATable: Table,
    APopconfirm: Popconfirm,
    EditableCell,
    AInputGroup: Input.Group,
    AModal: Modal,
    AInputSearch: Input.Search,
    ADatePicker: DatePicker,
  }
})
export default class measureSummaryV3 extends Vue {

  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  //  搜索
  measurePeriodSearch: string = "";
  contractNumSearch: string = "";
  payPeriodSearch: string = '';
  columnContract: Array<string> = ["measureStart", "measureEnd"];
  currentRow: null | { [propsName: string]: string | number } = null;
  editable: boolean = false;
  isContract: boolean = true;
  isContractShow: boolean = false;
  isShowConfirm: boolean = false;
  lastPeriodLabel: Array<{ [propsName: string]: any }> = [
    // 表头数据
    {
      align: "center",
      title: "计量周期",
      key: "measurePeriod",
      dataIndex: "measurePeriod"
    },
    {
      align: "center",
      title: "合同编号",
      key: "contractNum",
      dataIndex: "contractNum"
    },
    {
      align: "center",
      title: "起始日期",
      key: "measureStart",
      dataIndex: "measureStart"
    },
    {
      align: "center",
      title: "截止日期",
      key: "measureEnd",
      dataIndex: "measureEnd"
    },
    {
      align: "center",
      title: "计量汇总金额",
      key: "measureTotalMoney",
      dataIndex: "measureTotalMoney"
    },
    {
      align: "center",
      title: "上期计量周期",
      key: "lastPeriod",
      dataIndex: "lastPeriod"
    },
    {
      align: "center",
      title: "上期末计量金额",
      key: "lastPeriodMoney",
      dataIndex: "lastPeriodMoney"
    },
    {
      align: "center",
      title: "本期末计量金额",
      key: "totalPeriodMoney",
      dataIndex: "totalPeriodMoney"
    },
    {
      align: "center",

      title: "支付周期",
      key: "paymentPeriod",
      dataIndex: "paymentPeriod"
    },
    {
      align: "center",
      title: "审核状态",
      key: "verifyStatus",
      dataIndex: "verifyStatus"
    },
    {
      align: "center",
      title: "创建日期",
      key: "createdTime",
      dataIndex: "createdTime"
    }
  ];
  lastPeriodData: Array<{ [propsName: string]: string | number }> = [];
  modalLabel: Array<{ [propsName: string]: any }> = [
    // 表头数据
    {
      align: "center",
      title: "方案名称",
      key: "schemeName",
      dataIndex: "schemeName",
      scopedSlots: {customRender: "schemeName"}
    },
    {
      align: "center",
      title: "合同编号",
      key: "contractNum",
      dataIndex: "contractNum",
      scopedSlots: {customRender: "contractNum"}
    },
    {
      align: "center",
      title: "合同名称",
      key: "contractName",
      dataIndex: "contractName",
      width: '6%'
    },
    {
      align: "center",
      title: "方案金额",
      key: "schemeMoney",
      dataIndex: "schemeMoney"
    },
    {
      align: "center",
      title: "编制人",
      key: "createdBy",
      dataIndex: "createdBy",
      width: '5%'
    },
    {
      align: "center",
      title: "编制部门",
      key: "createDiv",
      dataIndex: "createDiv"
    },
    {
      align: "center",
      title: "创建日期",
      key: "createdTime",
      dataIndex: "createdTime"
    },
    {
      align: "center",
      title: "当前方案",
      key: "schemeState",
      dataIndex: "schemeState",
      width: '6%'
    },
  ];
  modalData: Array<{ [propsName: string]: string | number }> = [];
  modalKey: string = "";
  isPeriodShow: boolean = false;
  pagination: object = {
    pageSize: 20, //每页中显示20条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "50"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };
  tableDataPeriod: Array<any> = [];
  tableLabelPeriod: Array<{ [propsName: string]: any }> = [  // 表头数据
    {
      align: "center",
      title: "计量周期",
      key: "measurePeriod",
      dataIndex: "measurePeriod",
      scopedSlots: {customRender: "measurePeriod"}
    },
    {
      align: "center",
      title: "清单方案",
      key: "schema_name",
      dataIndex: "schema_name",
      scopedSlots: {customRender: "schema_name"}
    },
    {
      align: "center",
      title: "起始日期",
      key: "measureStart",
      dataIndex: "measureStart",
      scopedSlots: {customRender: "measureStart"}
    },
    {
      align: "center",

      title: "截止日期",
      key: "measureEnd",
      dataIndex: "measureEnd",
      scopedSlots: {customRender: "measureEnd"}
    },
    {
      align: "center",
      title: "计量汇总金额",
      key: "measureTotalMoney",
      dataIndex: "measureTotalMoney"
    },
    {
      align: "center",

      title: "上期计量周期",
      key: "lastPeriod",
      dataIndex: "lastPeriod",
      scopedSlots: {customRender: "lastPeriod"}
    },
    {
      align: "center",
      title: "上期末计量金额",
      key: "lastPeriodMoney",
      dataIndex: "lastPeriodMoney"
    },
    {
      align: "center",
      title: "本期末计量金额",
      key: "totalPeriodMoney",
      dataIndex: "totalPeriodMoney"
    },
    {
      align: "center",

      title: "支付周期",
      key: "paymentPeriod",
      dataIndex: "paymentPeriod"
    },
    {
      align: "center",

      title: "审核状态",
      key: "verifyStatus",
      dataIndex: "verifyStatus"
    },
    {
      align: "center",

      title: "创建日期",
      key: "createdTime",
      dataIndex: "createdTime"
    },
    {
      align: "center",

      title: "操作",
      key: "操作",
      scopedSlots: {customRender: "操作"}
    }];
  yHeight: number = 675;

  // 添加行
  addBtn() {
    const temptUuid = uuidv4();
    let uuid = temptUuid.split("-").join("");
    let newRow = {
      businessState: "",
      contractName: "",
      contractNum: "请选择合同",
      contractOrgName: "",
      contractOrgOID: "",
      schema_name: "请选择清单方案",
      schema_id: '',
      createDiv: "",
      createdBy: "",
      flowID: "",
      flowTitle: "",
      instanceID: "",
      lastPeriod: "请选择",
      lastPeriodMoney: 0,
      lastPeriod_FK: "",
      measureEnd: timeDefault(),
      measureFinishDate: "",
      measureLaunchDate: "",
      measureNum: "",
      measurePeriod: "",
      measureStart: timeDefault(),
      measureTotalMoney: 0,
      paymentPeriod: "",
      paymentPeriodOID: "",
      remarks: "",
      startFlowFlag: "",
      totalPeriodMoney: 0,
      verifyPerson: "",
      verifyStatus: "未提交汇总",
      createdDeptId: "",
      createdTime: timeDefault(),
      creater: "",
      id: uuid,
      key: uuid,
      modifiedTime: null,
      modifier: "",
      name: "",
      owner: "",
      ownerDeptId: "",
      sequenceNo: "",
      sequenceStatus: "",
      workflowInstanceId: ""
    };
    this.tableDataPeriod.unshift(newRow);
  }

  // 弹窗取消删除事件
  cancel() {
    this.isShowConfirm = false;
    this.$message.error("取消删除");
  }

  //关闭选择周期弹窗
  closePeriodShow() {
    this.isPeriodShow = false;
  }

  // 选择清单方案绑定事件
  schemePick(record) {
    this.modalKey = record.id;
    this.currentRow = null;
    this.isContractShow = true;
    this.modalData = [];
    const filters: Array<any> = [];
    if (this.projectConfig?.multiProjectFlag) {
      filters.push({
          propertyCode: "xmjc_1",
          propertyType: 0,
          propertyValue: this.projectConfig?.projectName ?? '',
          propertyValueName: "",
        },
        {
          propertyCode: "SchemeState",
          propertyType: 0,
          propertyValue: '是',
          propertyValueName: "",
        });
    }
    Api.getTableList({
      customized: !!this.projectConfig?.multiProjectFlag,
      filters: filters,
      mobile: false,
      queryCode: this.projectCode + "_T_G_ContrSche",
      schemaCode: this.projectCode + "_T_G_ContrSche",
      page: 0,
      size: 99999
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
        let resData = res.data;
        if (!resData) return;
        this.pagination['total'] = resData?.totalElements ?? 0;
        if (!resData.content) return;
        for (let i = 0; i < resData.content.length; i++) {
          let temptPeriod = {};
          let temptData = resData.content[i].data;
          for (let key in temptData) {
            let tempt = temptData[key];
            if (key == "createdDeptId" || key == "creater" || key == "modifier" || key == "owner" || key == "ownerDeptId") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else {
              this.$set(temptPeriod, key, tempt);
            }
          }
          // key值大写转换为小写
          let updatePeriod = {};
          for (let key in temptPeriod) {
            //@ts-ignore
            this.$set(updatePeriod, capitalize(key), temptPeriod[key]);
          }
          this.modalData.push(updatePeriod);
        }
      })
  }

  // 确认删除行时间
  confirm() {
    this.isShowConfirm = false;
    this.delTableRow();
  }

  // 删除按钮绑定事件
  delBtn() {
    this.isShowConfirm = true;
  }

  // 删除表格行
  delTableRow() {
    if (!this.currentRow) return this.$message.warn('请选择方案')
    this.tableDataPeriod.forEach((v, i) => {
      if (this.currentRow?.['id'] === v.id) {
        Api.deleteMeasurePeriodV3({
          projectCode: this.projectCode ?? '',
          id: v.id as string
        }).then(res => {
          if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
          this.$message.success("删除成功");
          this.tableDataPeriod.splice(i, 1);
        });
      }
    });
    this.currentRow = null;
  }

  // 跳转summaryEdit.vue
  handleEdit(record) {
    if (record.schema_name == "" || record.schema_name == "请选择清单方案") return this.$message.warn("请选择清单方案");
    this.currentRow = record;
    this.saveBtn();
    let routeMessage: {};
    routeMessage = record;
    this.$set(routeMessage, "project", this.projectCode);
    this.$router.push({
      path: "/summaryEditV3",
      query: routeMessage
    });
  }

  handleTableChange(pagination) {
    this.pagination['current'] = pagination.current;
    this.pagination['pageSize'] = pagination.pageSize;
    this.initmeasurePeriod();
  }

  // 初始化
  initmeasurePeriod() {
    this.tableDataPeriod = [];
    const filters: Array<any> = [];
    if (this.projectConfig?.multiProjectFlag) {
      filters.push({
        propertyCode: "xmjc_1",
        propertyType: 0,
        propertyValue: this.projectConfig?.projectName ?? '',
        propertyValueName: "",
      });
    }
    Api.getTableList({
      customized: !!this.projectConfig?.multiProjectFlag,
      filters: filters,
      mobile: false,
      queryCode: this.projectCode + "_T_G_MeasuPer0",
      schemaCode: this.projectCode + "_T_G_MeasuPer",
      page: this.pagination['current'] - 1,
      size: this.pagination['pageSize']
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
        const resData = res.data;
        if (!resData) return;
        if (!resData.content) return;
        this.pagination['total'] = resData.totalElements ?? 0;
        for (let i = 0; i < resData.content.length; i++) {
          let temptPeriod = {};
          const temptData = resData.content[i].data;
          for (let key in temptData) {
            let tempt = temptData[key];
            if (key == "createdDeptId" || key == "creater" || key == "modifier" || key == "owner" || key == "ownerDeptId") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else {
              this.$set(temptPeriod, key, tempt);
            }
          }
          // 调云枢接口得到的key首字母为大写
          // 此处方法将key首字母转化为小写
          let updatePeriod = {};
          for (let key in temptPeriod) {
            //@ts-ignore
            this.$set(updatePeriod, capitalize(key), temptPeriod[key]);
          }
          this.tableDataPeriod.push(updatePeriod);
        }
      })
  }

  // 选择清单方案弹窗 确认选择事件
  modalOk() {
    if (!this.currentRow || this.currentRow?.['schemeName'] === "") return this.$message.warn("请选择清单方案");
    this.isContractShow = false;
    for (let i = 0; i < this.tableDataPeriod.length; i++) {
      if (this.tableDataPeriod[i].id == this.modalKey) {
        this.tableDataPeriod[i].contractName = this.currentRow['contractName'];
        this.tableDataPeriod[i].contractNum = this.currentRow['contractNum'];
        this.tableDataPeriod[i].contractOrgName = this.currentRow['contractOrgName'];
        this.tableDataPeriod[i].contractOrgOID = this.currentRow['contractOrgOID'];
        this.tableDataPeriod[i].schema_name = this.currentRow['schemeName'];
        this.tableDataPeriod[i].schema_id = this.currentRow['id'];
      }
    }
    this.currentRow = null;
  }

  // 选择合同弹窗 取消选择事件
  modalCancel() {
    this.isContractShow = false;
  }

  // 将时间字符串 转换 为 Moment
  momentDateStr(dateStr) {
    return moment(dateStr);
  }

  mounted() {
    this.initmeasurePeriod();
    let _this = this;
    _this.yHeight = document.documentElement.clientHeight * 0.90 - 200;
    window.onresize = () => {
      return (() => {
        _this.yHeight = document.documentElement.clientHeight * 0.90 - 200;
      })()
    };
  }

  // 单元格修改事件
  onCellChange(key, dataIndex, value) {
    const dataSource = [...this.tableDataPeriod];
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value;
      this.tableDataPeriod = dataSource;
    }
  }

  //表格内单元格日期选择
  onChangeDate(key, dataIndex, value) {
    const dataSource = [...this.tableDataPeriod];
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value.format("YYYY-MM-DD HH:mm:ss");
      moment['suppressDeprecationWarnings'] = true;
      this.tableDataPeriod = dataSource;
    }
  }

  //搜索
  onSearch(value) {
    this.tableDataPeriod = [];
    Api.queryMeasure({
      projectCode: this.projectCode ?? '',
      page: this.pagination['current'] - 1,
      size: this.pagination['pageSize'] as number,
      contractNum: this.contractNumSearch,
      measurePeriod: this.measurePeriodSearch,
      payPeriod: this.payPeriodSearch
    })
      .then(resData => {
        if (!resData) return;
        if (!resData.total) return;
        if (!resData.content) return;
        this.pagination['total'] = resData.total;
        for (let i = 0; i < resData.content.length; i++) {
          let temptPeriod = {};
          const temptData = resData.content[i].data;
          for (let key in temptData) {
            let tempt = temptData[key];
            if (key == "createdDeptId" || key == "creater" || key == "modifier" || key == "owner" || key == "ownerDeptId") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else {
              this.$set(temptPeriod, key, tempt);
            }
          }
          // 调云枢接口得到的key首字母为大写
          // 此处方法将key首字母转化为小写
          let updatePeriod = {};
          for (let key in temptPeriod) {
            //@ts-ignore
            this.$set(updatePeriod, capitalize(key), temptPeriod[key]);
          }
          this.tableDataPeriod.push(updatePeriod);
        }
      })
  }

  // 选择无上期计量周期弹窗
  periodCancel() {
    this.isPeriodShow = false;
    for (let i = 0; i < this.tableDataPeriod.length; i++) {
      if (this.tableDataPeriod[i].id == this.modalKey) {
        this.tableDataPeriod[i].lastPeriod = "无上期计量周期";
        this.tableDataPeriod[i].lastPeriod_FK = "";
        this.tableDataPeriod[i].lastPeriodMoney = 0;
        this.tableDataPeriod[i].totalPeriodMoney = this.tableDataPeriod[i].measureTotalMoney;
      }
    }
  }

  // 选择上期计量周期弹窗 确认选择事件
  periodOk() {
    if (!this.currentRow) return this.$message.warn("请选择合同");
    this.isPeriodShow = false;
    for (let i = 0; i < this.tableDataPeriod.length; i++) {
      if (this.tableDataPeriod[i].id == this.modalKey) {
        this.tableDataPeriod[i].lastPeriod = this.currentRow['measurePeriod'];
        this.tableDataPeriod[i].lastPeriod_FK = this.currentRow['id'];
        this.tableDataPeriod[i].lastPeriodMoney = this.currentRow['totalPeriodMoney'];
        this.tableDataPeriod[i].totalPeriodMoney =
          this.tableDataPeriod[i].lastPeriodMoney + this.tableDataPeriod[i].measureTotalMoney;
      }
    }
    this.currentRow = null;
  }

  // 选择上期计量周期事件
  async periodPick(record) {
    this.modalKey = "";
    if (record.schema_name == "" || record.contractNum == "请选择清单方案") return this.$message.warn("请选择清单方案");
    this.currentRow = null;
    this.isPeriodShow = true;
    this.lastPeriodData = [];
    this.modalKey = record.id;
    const filters: Array<any> = [{
      propertyCode: "ContractNum",
      propertyType: 0,
      propertyValue: record.contractNum,
      propertyValueName: "",
    }];
    if (this.projectConfig?.multiProjectFlag) {
      filters.push({
          propertyCode: "xmjc_1",
          propertyType: 0,
          propertyValue: this.projectConfig?.projectName ?? '',
          propertyValueName: "",
        },
        {
          propertyCode: "schema_id",
          propertyType: 0,
          propertyValue: record['schema_id'],
          propertyValueName: "",
        });
    }
    await Api.getTableList({
      customized: !!this.projectConfig?.multiProjectFlag,
      filters: filters,
      mobile: false,
      queryCode: this.projectCode + "_T_G_MeasuPer0",
      schemaCode: this.projectCode + "_T_G_MeasuPer",
      page: 0,
      size: 999999
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
        const resData = res.data;
        if (!resData) return;
        if (!resData.content) return;
        for (let i = 0; i < resData.content.length; i++) {
          let temptPeriod = {};
          const temptData = resData.content[i].data;
          for (let key in temptData) {
            let tempt = temptData[key];
            if (key == "createdDeptId" || key == "creater" || key == "modifier" || key == "owner" || key == "ownerDeptId") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else {
              this.$set(temptPeriod, key, tempt);
            }
          }
          // 调云枢接口得到的key首字母为大写
          // 此处方法将key首字母转化为小写
          let updatePeriod = {};
          for (let key in temptPeriod) {
            //@ts-ignore
            this.$set(updatePeriod, capitalize(key), temptPeriod[key]);
          }
          this.lastPeriodData.push(updatePeriod);
        }
      })
    this.currentRow = null;
  }

  // 行点击事件
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.currentRow = record;
        }
      }
    };
  }

  // 保存（单行保存）
  saveBtn() {
    if (!this.currentRow) return this.$message.warn("请选择方案");
    let tempt: Array<any> = [];
    this.currentRow["measureStart"] = String(this.currentRow["measureStart"]).slice(0, 10);
    this.currentRow["measureEnd"] = String(this.currentRow["measureEnd"]).slice(0, 10);
    tempt.push(this.currentRow);
    this.$set(tempt[0], "lastperiodFk", this.currentRow['lastPeriod_FK']);
    Api.measureTotalInsert({
      projectCode: this.projectCode ?? '',
      objList: tempt
    })
      .then(res => {
        if (res.errcode == 0) {
          this.$message.success("保存成功");
        } else {
          this.$message.error(res.errmsg as string);
        }
        this.initmeasurePeriod();
      })
  }

  // 点击选择行变色
  setRowClassName(record, index) {
    return record === this.currentRow ? "clickRowStyl" : '';
  }
}
</script>

<style lang="less" scoped>
.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.box {
  height: 100%;
  width: 100%;

  /deep/ .ant-table {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: calc(91vh - 165px);
  }
}

/deep/ .ant-card-head-title {
  font-size: 16px;
  color: #0a0a0a;
  padding-left: 5px !important;
}

/deep/ .ant-table-tbody > tr > td {
  padding: 16px 4px;
}

/deep/ .clickRowStyl {
  background-color: #bcf5f6;
}

/deep/ .ant-card-body .ant-table .ant-table-tbody > tr:hover:not(.ant-table-expanded-row) > td {
  background-color: #bcf5f6;
}
</style>
