<template>
  <div class="main">
    <!--  模型页面，可参照此页面基本结构 -->
    <a-card title="支付汇总" class="box">
      <a-input-group
        compact
        slot="extra"
        style="width:500px;float:left">
        <a-input
          style="width:30%"
          v-model="payPeriodSearch"
          placeholder="关键字：支付周期"
          @pressEnter="onSearch"/>
        <a-input
          style="width:30%"
          placeholder="关键字：合同编号"
          @pressEnter="onSearch"
          v-model="contractNumSearch"/>
        <a-input-search
          enterButton
          style="width: 40%"
          placeholder="关键字：计量周期"
          v-model="measurePeriodSearch"
          @search="onSearch"
          @pressEnter="onSearch"/>
      </a-input-group>
      <a-button
        slot="extra"
        type="primary"
        style="margin-left: 10px"
        @click="addBtn"
      >添加</a-button>
      <a-button
        slot="extra"
        @click="saveBtn"
        style="margin-left: 10px"
        type="primary"
      >保存</a-button>
      <a-button
        slot="extra"
        @click="delBtn"
        type="danger"
        style="margin-left:10px"
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
        <template slot="paymentPeriod" slot-scope="text, record">
          <editable-cell :text="text" @change="onCellChange(record.key, 'paymentPeriod', $event)"/>
        </template>
        <template slot="contractNum" slot-scope="text, record">
          <a @click="contractPick(record)">{{ record.contractNum }}</a>
        </template>
        <template slot="lastPayment" slot-scope="text, record">
          <a @click="paymentPick(record)">{{ record.lastPayment }}</a>
        </template>
        <template v-for="item in columnContract" :slot="item" slot-scope="text, record">
          <div :key="item">
            <a-date-picker
              size="small"
              placeholder="请选择时间"
              :value="momentDateStr(text)"
              @change="onChangeDate(record.key, item, $event)"
            />
          </div>
        </template>
      </a-table>
    </a-card>
    <a-modal
      title="选择合同"
      :visible="isContractShow"
      @ok="modalOk"
      @cancel="modalCancel"
      okText="完成选择"
      width="1800px"
    >
      <a-table
        :columns="modalLabel"
        :data-source="modalData"
        :rowClassName="setRowClassName"
        :customRow="rowClick"
      >
      </a-table>
    </a-modal>
    <a-modal
      title="选择支付周期"
      :visible="isPeriodShow"
      @ok="periodOk"
      @cancel="closePeriodShow"
      okText="完成选择"
      cancelText="无上期支付周期"
      width="1600px"
    >
      <template slot="footer">
        <a-button @click="periodCancel">无上期支付周期</a-button>
        <a-button type="primary" @click="periodOk">完成选择</a-button>
      </template>
      <a-table
        :columns="lastPeriodLabel"
        :data-source="lastPaymentData"
        :rowClassName="setRowClassName"
        :customRow="rowClick"
      >
      </a-table>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import * as Api from '../../service/api';
import moment from "moment";
import {Card, Button, Icon, Table, Input, DatePicker, Popconfirm, Modal, Form, Divider} from "@h3/antd-vue";
import {timeDefault, capitalize} from "./data/util";
//@ts-ignore
import {v4 as uuidv4} from "uuid";
import EditableCell from "./data/editTableCell.vue";

import * as Type from '../../type';

@Component({
  name: "paySummary",
  components: {
    AIcon: Icon,
    ACard: Card,
    AForm: Form,
    AButton: Button,
    AInput: Input,
    ATable: Table,
    ADivider: Divider,
    APopconfirm: Popconfirm,
    EditableCell,
    ADatePicker: DatePicker,
    AModal: Modal,
    AInputSearch: Input.Search,
    AInputGroup: Input.Group,

  }
})
export default class allProtect extends Vue {
  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  //搜索
  measurePeriodSearch: string = "";
  contractNumSearch: string = "";
  payPeriodSearch: string = ''
  columnContract: Array<any> = ["paymentStart", "paymentEnd"];
  currentRow: any = {};
  editable: boolean = false;
  isContract: boolean = true;
  isContractShow: boolean = false;
  isShowConfirm: boolean = false;
  lastPeriodLabel: Array<any> = [
    // 表头数据
    {
      align: "center",
      title: "支付周期",
      key: "paymentPeriod",
      dataIndex: "paymentPeriod",
      scopedSlots: {customRender: "paymentPeriod"}
    },
    {
      align: "center",
      title: "合同编号",
      width:'6%',
      key: "contractNum",
      dataIndex: "contractNum",
      scopedSlots: {customRender: "contractNum"}
    },
    {
      align: "center",
      title: "起始日期",
      key: "paymentStart",
      dataIndex: "paymentStart",
      scopedSlots: {customRender: "paymentStart"}
    },
    {
      align: "center",
      title: "截止日期",
      key: "paymentEnd",
      dataIndex: "paymentEnd",
      scopedSlots: {customRender: "paymentEnd"}
    },
    {
      align: "center",
      title: "上期支付周期",
      key: "lastPayment",
      dataIndex: "lastPayment",
      scopedSlots: {customRender: "lastPayment"}
    },
    {
      align: "center",
      title: "本期申报金额",
      key: "applyMoney",
      dataIndex: "applyMoney"
    },
    {
      align: "center",
      title: "本期支付金额",
      key: "actualPaymentMoney",
      dataIndex: "actualPaymentMoney",
      scopedSlots: {customRender: "actualPaymentMoney"}
    },
    {
      align: "center",
      title: "本期末支付金额",
      key: "totalPaymentMoney",
      dataIndex: "totalPaymentMoney"
    },
    //   {
    //     title: "累计支付百分比",
    //     key: "totalPeriodMoney",
    //     dataIndex: "totalPeriodMoney",
    //
    //     className: 'column-class',
    //   },
    {
      align: "center",
      title: "计量周期",
      key: "measurePeriod",
      dataIndex: "measurePeriod"
    },
    {
      align: "center",
      title: "审核状态",
      width:'6%',
      key: "verifyStatus",
      dataIndex: "verifyStatus",
    },
    // {
    //   title: "当前审核人",
    //   key: "verifyPerson",
    //   dataIndex: "verifyPerson",
    //
    //   className: 'column-class',
    // },
    {
      align: "center",
      title: "创建日期",
      key: "createdTime",
      dataIndex: "createdTime"
    },
    // {
    //   align: "center",
    //   title: "操作",
    //   key: "操作",
    //   scopedSlots: {customRender: "操作"}
    // }
  ];
  lastPaymentData: Array<any> = [];
  modalLabel: Array<any> = [
    // 表头数据
    {
      align: "center",

      title: "合同编号",
      key: "contractNum",
      dataIndex: "contractNum"
    },
    {
      align: "center",

      title: "项目名称",
      key: "projectName",
      dataIndex: "projectName"
    },
    {
      align: "center",

      title: "合同名称",
      key: "contractName",
      dataIndex: "contractName"
    },
    {
      align: "center",

      title: "合同所属组织",
      key: "contractOrgName",
      dataIndex: "contractOrgName"
    },
    {
      align: "center",

      title: "合同金额",
      key: "contractTotalMoney",
      dataIndex: "contractTotalMoney"
    },
    {
      align: "center",

      title: "施工单位",
      width: "9%",
      key: "sgcompany",
      dataIndex: "sgcompany"
    },
    {
      align: "center",

      title: "施工代表",
      key: "sgdelegate",
      dataIndex: "sgdelegate"
    },
    {
      align: "center",

      title: "监理单位",
      width: "18%",
      key: "jlcompany",
      dataIndex: "jlcompany"
    },
    {
      align: "center",

      title: "监理代表",
      key: "jldelegate",
      dataIndex: "jldelegate"
    },
    {
      align: "center",

      title: "业主单位",
      key: "yzcompany",
      dataIndex: "yzcompany"
    },
    {
      align: "center",

      title: "业主代表",
      key: "yzdelegate",
      dataIndex: "yzdelegate"
    }
  ];
  modalData: Array<any> = [];
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
  // projectCode:string= "";
  tableDataPeriod: Array<any> = [];
  tableLabelPeriod: Array<any> = [
    // 表头数据
    {
      align: "center",

      title: "支付周期",
      key: "paymentPeriod",
      dataIndex: "paymentPeriod",
      scopedSlots: {customRender: "paymentPeriod"}
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

      title: "起始日期",
      key: "paymentStart",
      dataIndex: "paymentStart",
      scopedSlots: {customRender: "paymentStart"}
    },
    {
      align: "center",

      title: "截止日期",
      key: "paymentEnd",
      dataIndex: "paymentEnd",
      scopedSlots: {customRender: "paymentEnd"}
    },
    {
      align: "center",

      title: "上期支付周期",
      key: "lastPayment",
      dataIndex: "lastPayment",
      scopedSlots: {customRender: "lastPayment"}
    },
    {
      align: "center",

      title: "本期申报金额",
      key: "applyMoney",
      dataIndex: "applyMoney"
    },
    {
      align: "center",

      title: "本期支付金额",
      key: "actualPaymentMoney",
      dataIndex: "actualPaymentMoney",
      scopedSlots: {customRender: "actualPaymentMoney"}
    },
    {
      align: "center",

      title: "本期末支付金额",
      key: "totalPaymentMoney",
      dataIndex: "totalPaymentMoney"
    },
    //   {
    //     title: "累计支付百分比",
    //     key: "totalPeriodMoney",
    //     dataIndex: "totalPeriodMoney",
    //
    //     className: 'column-class',
    //   },
    {
      align: "center",

      title: "计量周期",
      key: "measurePeriod",
      dataIndex: "measurePeriod"
    },
    {
      align: "center",

      title: "审核状态",
      key: "verifyStatus",
      dataIndex: "verifyStatus"
    },
    // {
    //   title: "当前审核人",
    //   key: "verifyPerson",
    //   dataIndex: "verifyPerson",
    //
    //   className: 'column-class',
    // },
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
    }
  ];
  yHeight: number = 675;

  // 添加行
  addBtn() {
    let temptUuid = uuidv4();
    let uuid = temptUuid.split("-").join("");
    let newRow = {
      actualPaymentMoney: 0,
      applyMoney: 0,
      businessState: "",
      contractNum: "请选择合同",
      contractOrgName: "",
      contractOrgOID: "",
      createDiv: "",
      createdBy: "",
      createdDeptId: "",
      createdTime: timeDefault(),
      creater: "",
      flowID: "",
      flowTitle: "",
      id: uuid,
      instanceID: "",
      key: uuid,
      lastApplyMoney: 0,
      lastPayment: "请选择",
      lastPaymentFK: "",
      lastPaymentMoney: 0,
      measurePeriod: "",
      measurePeriod_FK: "",
      modifiedTime: "",
      modifier: "",
      name: "",
      owner: "",
      ownerDeptId: "",
      paymentEnd: timeDefault(),
      paymentFinishDate: "",
      paymentLaunchDate: "",
      paymentPeriod: "",
      paymentRatio: 1,
      paymentStart: timeDefault(),
      paymentType: "",
      remarks: "",
      sequenceNo: "",
      sequenceStatus: "",
      startFlowFlag: "",
      totalApplyMoney: 0,
      totalPaymentMoney: 0,
      verifyPerson: "",
      verifyStatus: "未提交汇总",
      workflowInstanceId: ""
    };
    this.tableDataPeriod.unshift(newRow);
  }

  // 取消删除行
  cancel() {
    this.isShowConfirm = false;
    //@ts-ignore
    this.$message.error("取消删除");
  }

  //关闭选择周期弹窗
  closePeriodShow() {
    this.isPeriodShow = false;
  }

  // 合同选择
  contractPick(record) {
    this.modalKey = record.key;
    this.currentRow = "";
    this.isContractShow = true;
    this.modalData = [];
    const filters: Array<any> = [];
    if (this.projectConfig?.multiProjectFlag) {
      filters.push({
        propertyCode: "xmjc_1",
        propertyType: 0,
        // propertyValue: window.Environment.markName,
        propertyValue: this.projectConfig?.projectName ?? '',
        propertyValueName: "",
      });
    }
    Api.getTableList({
      customized: !!this.projectConfig?.multiProjectFlag,
      filters: filters,
      mobile: false,
      page: 0,
      queryCode: this.projectCode + "_T_G_ContrMan",
      schemaCode: this.projectCode + "_T_G_ContrMan",
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
            if (key == "createdDeptId") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else if (key == "creater") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else if (key == "modifier") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else if (key == "owner") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else if (key == "ownerDeptId") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else if (key == "JLCompany") {
              this.$set(temptPeriod, "Jlcompany", tempt);
            } else if (key == "JLDelegate") {
              this.$set(temptPeriod, "Jldelegate", tempt);
            } else if (key == "YZCompany") {
              this.$set(temptPeriod, "Yzcompany", tempt);
            } else if (key == "YZDelegate") {
              this.$set(temptPeriod, "Yzdelegate", tempt);
            } else if (key == "SGCompany") {
              this.$set(temptPeriod, "Sgcompany", tempt);
            } else if (key == "SGDelegate") {
              this.$set(temptPeriod, "Sgdelegate", tempt);
            } else {
              this.$set(temptPeriod, key, tempt);
            }
            this.$set(temptPeriod, "key", temptData["id"]);
          }
          let updatePeriod = {};
          for (let key in temptPeriod) {
            //@ts-ignore
            this.$set(updatePeriod, capitalize(key), temptPeriod[key]);
          }
          this.modalData.push(updatePeriod);
        }
      })
  }

  // 确认删除行
  confirm() {
    this.isShowConfirm = false;
    this.delTableRow();
  }

  // 删除按钮 绑定事件
  delBtn() {
    this.isShowConfirm = true;
  }

  // 执行删除行 并将数据库对应行删除
  delTableRow() {
    if (this.currentRow != null && this.currentRow != "") {
      this.tableDataPeriod.forEach((v, i) => {
        //@ts-ignore
        if (this.currentRow.id === v.id) {
          Api.deletePayPeriod({
            projectCode: this.projectCode ?? '',
            periodId: v.id
          })
            .then(res => {
              if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
              this.$message.success("删除成功");
              this.tableDataPeriod.splice(i, 1);
            });
        }
      });
      //@ts-ignore
      this.currentRow = null;
    } else {
      alert("请选择方案");
    }
  }

  // 跳转paymenEdit.vue并传参
  handleEdit(record) {
    if (record.contractName == "" || record.contractName == "请选择合同") {
      //@ts-ignore
      this.$message.warn("请选择合同");
    } else {
      this.currentRow = record;
      this.saveBtn();
      let routeMessage: {};
      routeMessage = record;
      this.$set(routeMessage, "project", this.projectCode);
      //@ts-ignore
      this.$router.push({
        path: "/paymentEdit",
        query: routeMessage
      });
    }
  }

  handleTableChange(pagination) {
    this.pagination['current'] = pagination.current;
    this.pagination['pageSize'] = pagination.pageSize;
    this.initpayPeriod();
  }

  // 初始化表格
  initpayPeriod() {
    this.tableDataPeriod = [];
    let filters: Array<any> = [];
    if (this.projectConfig?.multiProjectFlag) {
      filters.push({
        propertyCode: "xmjc_1",
        propertyType: 0,
        // propertyValue: window.Environment.markName,
        propertyValue: this.projectConfig?.projectName ?? '',
        propertyValueName: "",
      });
    }
    Api.getTableList({
      customized: this.projectConfig?.multiProjectFlag ? true : false,
      filters: filters,
      mobile: false,
      queryCode: this.projectCode + "_T_G_PayPer0",
      schemaCode: this.projectCode + "_T_G_PayPer",
      page: this.pagination['current'] - 1,
      size: this.pagination['pageSize']
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      const resData = res.data;
      if (!resData) return;
      if (!resData.content) return;
      this.pagination["total"] = resData.totalElements;
      for (let i = 0; i < resData.content.length; i++) {
        let temptPeriod = {};
        let temptData = resData.content[i].data;
        for (let key in temptData) {
          let tempt = temptData[key];
          if (key == "createdDeptId") {
            this.$set(temptPeriod, key, tempt[0].id);
          } else if (key == "creater") {
            this.$set(temptPeriod, key, tempt[0].id);
          } else if (key == "modifier") {
            this.$set(temptPeriod, key, tempt[0].id);
          } else if (key == "owner") {
            this.$set(temptPeriod, key, tempt[0].id);
          } else if (key == "ownerDeptId") {
            this.$set(temptPeriod, key, tempt[0].id);
          } else {
            this.$set(temptPeriod, key, tempt);
          }
          this.$set(temptPeriod, "key", temptData["id"]);
        }
        let updatePeriod = {};
        for (let key in temptPeriod) {
          //@ts-ignore
          this.$set(updatePeriod, capitalize(key), temptPeriod[key]);
        }
        this.tableDataPeriod.push(updatePeriod);
      }
    })
  }

  // 确认选择合同
  modalOk() {
    //@ts-ignore
    if (this.currentRow.contractName != "" && this.currentRow.contractName != undefined) {
      this.isContractShow = false;
      for (let i = 0; i < this.tableDataPeriod.length; i++) {
        if (this.tableDataPeriod[i].key == this.modalKey) {
          //@ts-ignore
          this.tableDataPeriod[i].contractName = this.currentRow.contractName;
          //@ts-ignore
          this.tableDataPeriod[i].contractNum = this.currentRow.contractNum;
          //@ts-ignore
          this.tableDataPeriod[i].contractOrgName = this.currentRow.contractOrgName;
          //@ts-ignore
          this.tableDataPeriod[i].contractOrgOID = this.currentRow.contractOrgOID;
          //@ts-ignore
          this.tableDataPeriod[i].contractOrgOID = this.currentRow.contractOrgOID;
          //@ts-ignore
          this.tableDataPeriod[i].projectMoney = this.currentRow.contractTotalMoney;
        }
      }
      this.currentRow = "";
    } else {
      //@ts-ignore
      this.$message.warn("请选择合同");
    }
  }

  // 取消选择合同
  modalCancel() {
    this.isContractShow = false;
    // this.modalData = [];
  }

  // 将时间字符串 转换 为 Moment
  momentDateStr(dateStr) {
    return moment(dateStr);
  }

  mounted() {
    this.initpayPeriod();
    let _this = this;
    _this.yHeight = document.documentElement.clientHeight * 0.90 - 200;
    window.onresize = () => {
      return (() => {
        _this.yHeight = document.documentElement.clientHeight * 0.90 - 200;
      })()
    };
  }

  // 行内编辑
  onCellChange(key, dataIndex, value) {
    const dataSource = [...this.tableDataPeriod];
    const target = dataSource.find(item => item.key === key);
    if (target) {
      target[dataIndex] = value;
      this.tableDataPeriod = dataSource;
    }
  }

  //表格内单元格日期选择
  onChangeDate(key, dataIndex, value) {
    const dataSource = [...this.tableDataPeriod];
    const target = dataSource.find(item => item.key === key);
    if (target) {
      target[dataIndex] = value.format("YYYY-MM-DD HH:mm:ss");
      moment['suppressDeprecationWarnings'] = true;
      this.tableDataPeriod = dataSource;
    }
  }

  //搜索
  onSearch(value) {
    this.tableDataPeriod = [];
    Api.queryPay({
      projectCode: this.projectCode ?? '',
      page: this.pagination['current'] - 1,
      size: this.pagination['pageSize'],
      contractNum: this.contractNumSearch,
      measurePeriod: this.measurePeriodSearch,
      payPeriod: this.payPeriodSearch
    })
      .then(resData => {
        if (!resData) return;
        this.pagination['total'] = resData.total;
        if (!resData.content) return;
        for (let i = 0; i < resData.content.length; i++) {
          let temptPeriod = {};
          const temptData = resData.content[i].data;
          for (let key in temptData) {
            let tempt = temptData[key];
            if (key == "createdDeptId") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else if (key == "creater") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else if (key == "modifier") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else if (key == "owner") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else if (key == "ownerDeptId") {
              this.$set(temptPeriod, key, tempt[0].id);
            } else {
              this.$set(temptPeriod, key, tempt);
            }
            this.$set(temptPeriod, "key", temptData["id"]);
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

  // 上期计量周期选择 取消按钮
  periodCancel() {
    this.isPeriodShow = false;
    for (let i = 0; i < this.tableDataPeriod.length; i++) {
      if (this.tableDataPeriod[i].key == this.modalKey) {
        this.tableDataPeriod[i].lastPayment = "无上期支付周期";
        this.tableDataPeriod[i].lastPaymentFK = "";
        this.tableDataPeriod[i].lastPaymentMoney = 0;
        this.tableDataPeriod[i].lastApplyMoney = 0;
        this.tableDataPeriod[i].totalPaymentMoney = this.tableDataPeriod[i].actualPaymentMoney;
      }
    }
  }

  // 上期计量周期选择 确认按钮按钮
  periodOk() {
    if (this.currentRow != "" && this.currentRow != undefined) {
      this.isPeriodShow = false;
      for (let i = 0; i < this.tableDataPeriod.length; i++) {
        if (this.tableDataPeriod[i].key == this.modalKey) {
          this.tableDataPeriod[i].lastPayment = this.currentRow.paymentPeriod;
          this.tableDataPeriod[i].lastPaymentFK = this.currentRow.id;
          this.tableDataPeriod[i].lastPaymentMoney = this.currentRow.totalPaymentMoney;
          this.tableDataPeriod[i].lastApplyMoney = this.currentRow.totalApplyMoney;
          this.tableDataPeriod[i].totalPaymentMoney = this.tableDataPeriod[i].actualPaymentMoney + this.tableDataPeriod[i].lastPaymentMoney;
        }
      }
      this.currentRow = "";
    } else {
      //@ts-ignore
      this.$message.warn("请选择合同");
    }
  }

  // 合同选择事件
  async paymentPick(record) {
    this.modalKey = "";
    if (record.contractNum == "" || record.contractNum == "请选择合同") {
      //@ts-ignore
      this.$message.warn("请选择合同");
    } else {
      this.currentRow = "";
      this.isPeriodShow = true;
      this.lastPaymentData = [];
      this.modalKey = record.id;
      let tmpTable: any[] = [];
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
          // propertyValue: window.Environment.markName,
          propertyValue: this.projectConfig?.projectName ?? '',
          propertyValueName: "",
        });
      }
     await Api.getTableList({
        customized: !!this.projectConfig?.multiProjectFlag,
        filters: filters,
        mobile: false,
        queryCode: this.projectCode + "_T_G_PayPer0",
        schemaCode: this.projectCode + "_T_G_PayPer",
        page: this.pagination['current'] - 1,
        size: this.pagination['pageSize']
      })
        .then(res => {
          if (res.errcode !== 0) return this.$message.warn(res.errmsg as string) ;
          const resData = res.data;
          if (!resData) return;
          if (!resData.content) return;
          this.pagination['total'] = resData.totalElements;
          for (let i = 0; i < resData.content.length; i++) {
            let temptPeriod = {};
            let temptData = resData.content[i].data;
            for (let key in temptData) {
              let tempt = temptData[key];
              if (key == "createdDeptId") {
                this.$set(temptPeriod, key, tempt[0].id);
              } else if (key == "creater") {
                this.$set(temptPeriod, key, tempt[0].id);
              } else if (key == "modifier") {
                this.$set(temptPeriod, key, tempt[0].id);
              } else if (key == "owner") {
                this.$set(temptPeriod, key, tempt[0].id);
              } else if (key == "ownerDeptId") {
                this.$set(temptPeriod, key, tempt[0].id);
              } else {
                this.$set(temptPeriod, key, tempt);
              }
              this.$set(temptPeriod, "key", temptData["id"]);
            }
            let updatePeriod = {};
            for (let key in temptPeriod) {
              //@ts-ignore
              this.$set(updatePeriod, capitalize(key), temptPeriod[key]);
            }
            tmpTable.push(updatePeriod);
          }
        })
      for (let i = 0; i < tmpTable.length; i++) {
        let tempt = tmpTable[i];
        if (record.contractNum == tempt.contractNum && record.id != tempt.id) {
          this.lastPaymentData.push(tempt);
        }
      }
      this.currentRow = "";
    }
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

  // 保存单行
  saveBtn() {
    if (this.currentRow != null && this.currentRow != "") {
      let tempt: any = [];
      this.currentRow["paymentStart"] = this.currentRow["paymentStart"].slice(0, 10);
      this.currentRow["paymentEnd"] = this.currentRow["paymentEnd"].slice(0, 10);
      tempt.push(this.currentRow);
      this.$set(tempt[0], "measureperiodFk", this.currentRow["measurePeriod_FK"]);
      Api.insertPayPeriod( {
          projectCode: this.projectCode??'',
          objList: tempt
        })
        .then(res => {
          if (res.errcode == 0) {
            this.$message.success("保存成功");
          } else {
            this.$message.error(res.errmsg as string);
          }
          this.initpayPeriod();
        })
    } else {
      //@ts-ignore
      this.$message.warn("请选择方案");
    }
  }

  // 单击行后变色
  setRowClassName(record, index) {
    let rowColor = index % 2 === 0 ? "evenRowStyl" : "";
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }

}
</script>
<style lang="less" scoped>
@import (reference) "../../styles/theme.less";

.box {
  height: 100%;
  width: 100%;

  /deep/ .ant-table {
    .flex;
    flex: 1;
    flex-direction: column;
    height: calc(91vh - 165px);
  }
}

.main {
  .flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

/deep/ .ant-card-head-title {
  font-size: 16px;
  font-weight: 500;
  color: #0a0a0a;
  padding-left: 5px !important;
  font-family: Source Han Sans CN;
}
</style>
<style>
@import "./data/measure.css";
</style>

