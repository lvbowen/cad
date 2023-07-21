<!--* @Description: 支付汇总（编辑页面）-->
<template>
  <div class="main">
    <a-icon type="close" @click="close" class="close_icon"></a-icon>
    <a-card title="支付周期汇总" class="form_body" size="small">
      <a-button
        @click="saveFormBtn"
        style="margin-left:10px"
        type="primary"
        slot="extra"
        size="small"
      >保存
      </a-button
      >
      <a-button
        @click="startProcessBtn"
        style="margin-left:10px"
        type="primary"
        slot="extra"
        size="small"
      >启动流程
      </a-button
      >
      <a-button
        @click="detailProcessBtn"
        style="margin-left:10px"
        type="primary"
        slot="extra"
        size="small"
      >查看审批过程
      </a-button
      >
      <a-button
        @click="outputReportBtn"
        style="margin-left:10px"
        type="primary"
        slot="extra"
        size="small"
      >审批附件
      </a-button
      >
      <a-form-model
        :model="form"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        layout="inline"
        style="margin-top:-10px"
      >
        <a-form-model-item label="支付期号">
          <a-input v-model="form.paymentPeriod"/>
        </a-form-model-item>
        <a-form-model-item label="合同编号" style="margin-left:10px">
          <a-input v-model="form.contractNum" style="width:173px" disabled/>
        </a-form-model-item>
        <!--        <a-form-model-item label="所属组织" style="margin-left:21px">-->
        <!--          <a-input v-model="form.contractOrgName" disabled/>-->
        <!--        </a-form-model-item>-->
        <a-form-model-item label="创建时间">
          <a-input v-model="form.createdTime" disabled/>
        </a-form-model-item>
        <a-form-model-item label="编制人员">
          <a-input v-model="form.createdBy" disabled/>
        </a-form-model-item>
        <br/>
        <a-form-model-item label="计量周期">
          <a-input v-model="form.measurePeriod" disabled/>
        </a-form-model-item>
        <a-form-model-item label="上期支付期号">
          <a-input v-model="form.lastPayment" disabled/>
        </a-form-model-item>
        <a-form-model-item label="起始日期">
          <a-input v-model="form.paymentStart" disabled/>
        </a-form-model-item>
        <a-form-model-item label="截止日期">
          <a-input v-model="form.paymentEnd" disabled/>
        </a-form-model-item>
        <a-form-model-item label="编制部门">
          <a-input v-model="form.createDiv" disabled/>
        </a-form-model-item>
      </a-form-model>
      <a-form-model
        :model="form"
        :labelCol="labelColExtra"
        :wrapperCol="wrapperColExtra"
        layout="inline"
      >
        <a-form-model-item label="上期末实际核定金额">
          <a-input v-model="form.lastApplyMoney" disabled/>
        </a-form-model-item>
        <a-form-model-item label="本期末实际核定金额">
          <a-input v-model="form.applyMoney" disabled/>
        </a-form-model-item>
        <a-form-model-item label="*支付系数" style="margin-left:39px">
          <a-input v-model="form.paymentRatio" style="width:156px"/>
        </a-form-model-item>
        <br/>
        <a-form-model-item label="上期末最终支付金额">
          <a-input v-model="form.lastPaymentMoney" disabled/>
        </a-form-model-item>
        <a-form-model-item label="本期末最终支付金额">
          <a-input v-model="form.totalPaymentMoney" disabled/>
        </a-form-model-item>
        <a-form-model-item label="*本期最终支付金额">
          <a-input v-model="form.actualPaymentMoney" disabled/>
        </a-form-model-item>
      </a-form-model>
      <a-form-model :model="desc" style="margin-left:22px">
        <a-form-model-item label="备注信息" :labelCol="{ span: 1 }" :wrapperCol="{ span: 10 }">
          <a-input v-model="desc.remarks" type="textarea"/>
        </a-form-model-item>
      </a-form-model>
    </a-card>
    <a-card
      title="支付明细"
      class="table_body"
      size="small">
      <a-button
        @click="insertPayment"
        style="margin-left:10px"
        type="primary"
        slot="extra"
        size="small"
      >导入费用项
      </a-button
      >
      <a-button
        @click="updatePayment"
        style="margin-left:10px"
        type="primary"
        slot="extra"
        size="small"
      >数据同步
      </a-button
      >
      <a-button
        @click="delPayment"
        style="margin-left:10px"
        type="danger"
        slot="extra"
        size="small"
      >清空费用项
      </a-button
      >
      <a-table
        rowKey="id"
        :columns="tableLabelPayment"
        :data-source="tableDataPayment"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
        :scroll="{ x: 1650, y: yHeight }"
      >
        <span slot="操作" slot-scope="record">
          <a @click="() => detail(record)">明细</a>
        </span>
        <template v-for="item in columnPay" :slot="item" slot-scope="text, record">
          <div :key="item">
            <editable-cell :text="text" @change="onCellChange(record.id, item, $event)"/>
          </div>
        </template>
        <template slot="measurePeriod" slot-scope="text, record">
          <a :disabled="record.isAbled" @click="periodPick(record)">{{ record.measurePeriod }}</a>
        </template>
        <template slot="calculateMode" slot-scope="text, record">
          <a-select
            :defaultValue="record.calculateMode"
            style="width: 75px"
            @change="modeChange(record.id, 'calculateMode', $event)"
          >
            <a-select-option v-for="d in modeData" :key="d.value" :value="d.value">{{ d.text }}
            </a-select-option>
          </a-select>
        </template>
      </a-table>
    </a-card>
    <a-modal
      title="计量周期选择"
      :visible="isPeriodShow"
      @ok="periodOk"
      @cancel="closePeriodShow"
      okText="完成选择"
      cancelText="无上期计量周期"
      width="1400px"
    >
      <template slot="footer">
        <a-button @click="periodCancel">无上期计量周期</a-button>
        <a-button type="primary" @click="periodOk">完成选择</a-button>
      </template>
      <a-table
        rowKey="id"
        :columns="tableLabelPeriod"
        :data-source="tableDataPeriod"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
      >
      </a-table>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import env from '@/config/env';
import {
  Button, Card, Icon, Table, Input, Select,
  Popconfirm, Modal, Form, Col, Row, FormModel
} from "@h3/antd-vue";
import {capitalize} from "../../measurePayment/data/util";
import EditableCell from "../../measurePayment/data/editTableCell.vue";
import * as Api from '../../../service/api';
import * as Type from "../../../type";

@Component({
  name: "paymentEditV3",
  components: {
    ARow: Row,
    ACol: Col,
    AIcon: Icon,
    ACard: Card,
    AForm: Form,
    AFormModelItem: FormModel.Item,
    AFormItem: Form.Item,
    AButton: Button,
    AInput: Input,
    ASelect: Select,
    ATable: Table,
    AFormModel: FormModel,
    EditableCell,
    APopconfirm: Popconfirm,
    AModal: Modal,
    ASelectOption: Select.Option
  }
})
export default class paymentEditV3 extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  columnPay: Array<string> = ["payDetailRatio", "sgPaydetailmoney", "remarks"];
  currentRow: null | { [propsName: string]: string | number } = null;
  desc: { remarks: string } = {
    remarks: ""
  };
  form: { [propsName: string]: string } = {
    paymentPeriod: "",
    contractNum: "",
    contractOrgName: "",
    createdTime: "",
    lastApplyMoney: "",
    applyMoney: "",
    paymentRatio: "",
    actualPaymentMoney: "",
    measurePeriod: "",
    lastPayment: "",
    lastPaymentMoney: "",
    totalPaymentMoney: "",
    paymentStart: "",
    paymentEnd: "",
    createdBy: "",
    createDiv: ""
  };
  isPeriodShow: boolean = false;
  labelCol: { span: number } = {span: 9};
  labelColExtra: { span: number } = {span: 12};
  modalKey: string = "";
  modeData: Array<({ text: string; value: string })> = [{value: "支付", text: "支付"}, {value: "扣回", text: "扣回"}];
  selectedRowKeys: Array<string> = [];
  projectCode: string = "";
  tableDataPayment: Array<{ [propsName: string]: string | number }> = [];
  tableDataPeriod: Array<{ [propsName: string]: string | number }> = [];
  tableLabelPayment: Array<{ [propsName: string]: any }> = [
    // 表头数据
    {
      align: "center",
      title: "合价计算模式",
      key: "calculateMode",
      dataIndex: "calculateMode",
      width: "6.5%",
      scopedSlots: {customRender: "calculateMode"}
    },
    {
      align: "center",
      title: "支付费用类型",
      key: "payDetailType",
      dataIndex: "payDetailType",
      width: "6%"
    },
    {
      align: "center",
      width: "8%",
      title: "支付费用类型编码",
      key: "payDetailTypeNum",
      dataIndex: "payDetailTypeNum"
    },
    {
      align: "center",
      title: "计量周期",
      key: "measurePeriod",
      dataIndex: "measurePeriod",
      width: "3.8%",
      scopedSlots: {customRender: "measurePeriod"}
    },
    {
      align: "center",
      title: "施工申报金额",
      key: "sgPaydetailmoney",
      dataIndex: "sgPaydetailmoney",
      width: "7.5%",
      scopedSlots: {customRender: "sgPaydetailmoney"}
    },
    {
      align: "center",
      title: "监理审核金额",
      width: "6.5%",
      key: "jlPaydetailmoney",
      dataIndex: "jlPaydetailmoney",
      scopedSlots: {customRender: "jlPaydetailmoney"}
    },
    {
      align: "center",
      title: "本期业主核定金额",
      width: "8%",
      key: "yzPaydetailmoney",
      dataIndex: "yzPaydetailmoney",
      scopedSlots: {customRender: "yzPaydetailmoney"}
    },
    {
      align: "center",
      title: "上期末核定金额",
      width: "8%",
      key: "lastYZDetailMoney",
      dataIndex: "lastYZDetailMoney",
      scopedSlots: {customRender: "lastYZDetailMoney"}
    },
    {
      align: "center",
      title: "本期末核定金额",
      width: "7.5%",
      key: "totalYZDetailMoney",
      dataIndex: "totalYZDetailMoney",
      scopedSlots: {customRender: "totalYZDetailMoney"}
    },
    {
      align: "center",
      title: "费用系数",
      key: "payDetailRatio",
      dataIndex: "payDetailRatio",
      width: "3.8%",
      scopedSlots: {customRender: "payDetailRatio"}
    },
    {
      align: "center",
      title: "本期实际核定金额",
      width: "8%",
      key: "actualDetailMoney",
      dataIndex: "actualDetailMoney",
      scopedSlots: {customRender: "actualDetailMoney"}
    },
    {
      align: "center",
      title: "上期末实际核定金额",
      width: "8%",
      key: "lastActualDetailMoney",
      dataIndex: "lastActualDetailMoney",
      scopedSlots: {customRender: "lastActualDetailMoney"}
    },
    {
      align: "center",
      title: "本期末实际核定金额",
      width: "8%",
      key: "totalLastActualDetailMoney",
      dataIndex: "totalLastActualDetailMoney",
      scopedSlots: {customRender: "totalLastActualDetailMoney"}
    },
    // {
    //   align: "center",
    //   title: "备注",
    //   key: "remarks",
    //   dataIndex: "remarks",
    //   scopedSlots: {customRender: "remarks"}
    // },
    {
      align: "center",
      title: "操作",
      key: "操作",
      width: '3%',
      scopedSlots: {customRender: "操作"}
    }
  ];
  tableLabelPeriod: Array<{ [propsName: string]: any }> = [
    // 表头数据
    {
      align: "center",
      title: "计量周期",
      key: "measurePeriod",
      dataIndex: "measurePeriod",
      scopedSlots: {customRender: "measurePeriod"}
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
      dataIndex: "measureTotalMoney",
    },
    {
      align: "center",

      title: "上期末计量金额",
      key: "lastPeriodMoney",
      dataIndex: "lastPeriodMoney",
    },
    {
      align: "center",

      title: "本期末计量金额",
      key: "totalPeriodMoney",
      dataIndex: "totalPeriodMoney",
    },
    {
      align: "center",

      title: "支付周期",
      key: "paymentPeriod",
      dataIndex: "paymentPeriod",
    },
    {
      align: "center",
      title: "审核状态",
      key: "verifyStatus",
      dataIndex: "verifyStatus",
    },
    {
      align: "center",
      title: "创建日期",
      key: "createdTime",
      dataIndex: "createdTime",
    },
  ];
  wrapperCol: { span: number } = {span: 15};
  wrapperColExtra: { span: number } = {span: 12};
  yHeight: number = 390;
  schemeId: string = '';

  mounted() {
    if (Number(this.$route.query.symbol) == 1) {
      this.projectCode = this.$route.query.project as string;
      this.schemeId = this.$route.query.schemeId as string;
    } else {
      this.projectCode = this.$route.query.project as string;
      this.schemeId = this.$route.query.id as string;
    }
    //表单
    this.formInit();
    //支付明细
    this.initPayment();
    let _this = this;
    _this.yHeight = document.documentElement.clientHeight - 560;
    window.onresize = () => {
      return (() => {
        _this.yHeight = document.documentElement.clientHeight - 560;
      })()
    };
  }

  close() {
    this.$router.go(-1);
  }

  //关闭选择周期弹窗
  closePeriodShow() {
    this.isPeriodShow = false;
  }

  delPayment() {
    if (this.tableDataPayment.length == 0) return this.$message.warn("合同清单已经为空！");
    Api.deletePayDetail({
      gpayper: this.form,
      projectCode: this.projectCode,
      objList: []
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success(res.errmsg as string);
        this.tableDataPayment = [];
      })
  }

  //转入明细界面
  detail(record) {
    if (record.isMeasure !== "是" || record.tG04cMeasureperiodFk === "") return this.$message.warn("请选择对应的计量汇总周期");
    let routeMessage = {};
    this.$set(routeMessage, "project", this.projectCode);
    let oldData = this.tableDataPayment;
    //返回计量周期的id
    this.$set(routeMessage, "id", record.tG04cMeasureperiodFk);
    this.$set(routeMessage, "schemeId", this.schemeId);
    this.$set(routeMessage, "oldData", oldData);
    this.$set(routeMessage, "symbol", 1);
    this.$router.push({
      path: "summaryEdit",
      query: routeMessage
    });
  }

  detailProcessBtn() {
    const url =`/form/detail?workflowInstanceId=${this.form.workflowInstanceId}`;
    const urlReturn = `${this.$route.fullPath}`;
    this.isDingTalk?this.$router.push(`${url}&return=${encodeURIComponent(urlReturn )}`):window.open(`${env.portalHost}${url}`)
  }

  // 表单初始化
  formInit() {
    Api.getPayPeriod({
      projectCode: this.projectCode,
      id: this.schemeId
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.form = res.data;
        this.form.paymentStart = String(this.form.paymentStart).slice(0, 10);
        this.form.paymentEnd = String(this.form.paymentEnd).slice(0, 10);
        this.desc.remarks = String(this.form.remarks);
      })
  }

  // 支付明细初始化
  initPayment() {
    this.tableDataPayment = [];
    Api.getPayDetail({
      projectCode: this.projectCode,
      periodId: this.schemeId
    })
      .then(res => {
        const resData = res.data;
        let tempt = {};
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        if (!resData || resData.length === 0) return;
        for (let i = 0; i < resData.length; i++) {
          if (resData[i].isMeasure == "是") {
            resData[i].measurePeriod =
              !resData[i].measurePeriod || resData[i].measurePeriod == "" ? "请选择" : resData[i].measurePeriod;
            this.$set(resData[i], "measurePeriod", resData[i].measurePeriod);
            this.$set(resData[i], "isAbled", false);
            tempt = resData[i];
            resData.splice(i, 1);
            i = i - 1;
          } else {
            this.$set(resData[i], "measurePeriod", "请选择");
            this.$set(resData[i], "isAbled", true);
          }
        }
        resData.unshift(tempt);
        this.tableDataPayment = resData;
      })
  }

  insertPayment() {
    if (this.tableDataPayment.length !== 0) return this.$message.warn("请清空费用项！");
    Api.importPayDetail({
      projectCode: this.projectCode,
      id: this.form.id as string,
      lastPaymentFK: this.form.lastPaymentFK as string,
      contractNum: this.form.contractNum as string,
    })
      .then(res => {
        const resData = res.data;
        let tempt = {};
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        if (!resData) return
        for (let i = 0; i < resData.length; i++) {
          if (resData[i].isMeasure == "是") {
            resData[i].measurePeriod = !resData[i].measurePeriod || resData[i].measurePeriod == "" ? "请选择" : resData[i].measurePeriod;
            this.$set(resData[i], "measurePeriod", resData[i].measurePeriod);
            this.$set(resData[i], "isAbled", false);
            tempt = resData[i];
            resData.splice(i, 1);
          } else {
            this.$set(resData[i], "measurePeriod", "请选择");
            this.$set(resData[i], "isAbled", true);
          }
        }
        resData.unshift(tempt);
        this.tableDataPayment = resData;
      })

  }

  // 表格内置下拉框
  modeChange(key, dataIndex, value) {
    const dataSource = [...this.tableDataPayment];
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value;
      this.tableDataPayment = dataSource;
    }
  }

  // 支付明细表格编辑事件
  onCellChange(key, dataIndex, value) {
    const dataSource = [...this.tableDataPayment];
    this.tableDataPayment = [];
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value;
      // 顺序不可调整
      target["jlPaydetailmoney"] = target["sgPaydetailmoney"];
      target["yzPaydetailmoney"] = target["sgPaydetailmoney"];
      target["totalYZDetailMoney"] = Number(target["lastYZDetailMoney"]) + Number(target["yzPaydetailmoney"]);
      target["actualDetailMoney"] = this.NumberMul(Number(target["payDetailRatio"]), Number(target["yzPaydetailmoney"]));
      target["totalLastActualDetailMoney"] = Number(target["actualDetailMoney"]) + Number(target["lastActualDetailMoney"]);
      this.tableDataPayment = dataSource;
    }
  }

  outputReportBtn() {
    window.open(
      "http://frx.ctesi.com.cn/webroot/decision/view/report?viewlet=BimProject%252FCHPM%252FA_CHPM_ZF.cpt&ref_t=design&ref_c=3a14811b-7fc2-401e-baa9-eda77368352a&" +
      "paymentPeriod=" +
      this.form.paymentPeriod +
      "&contractNum=" +
      this.form.contractNum
    );
  }

  periodCancel() {
    this.isPeriodShow = false;
    for (let i = 0; i < this.tableDataPayment.length; i++) {
      if (this.tableDataPayment[i].id == this.modalKey) {
        this.tableDataPayment[i].measurePeriod = "无上期计量周期";
        this.tableDataPayment[i].tG04cMeasureperiodFk = "";
      }
    }
  }

  periodOk() {
    if (this.currentRow) {
      this.isPeriodShow = false;
      for (let i = 0; i < this.tableDataPayment.length; i++) {
        if (this.tableDataPayment[i].id == this.modalKey) {
          this.tableDataPayment[i].measurePeriod = this.currentRow.measurePeriod;
          this.tableDataPayment[i].tG04cMeasureperiodFk = this.currentRow.id;
          Api.selectMeasurePeriodV3({
            projectCode: this.projectCode,
            objList: [this.tableDataPayment[i]]
          })
            .then(res => {
              if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
              this.tableDataPeriod[i] = res.data;
            })
        }
      }
    }
  }

  periodPick(record) {
    this.modalKey = "";
    this.tableDataPeriod = [];
    if (record.contractNum == "" || record.contractNum == "请选择合同") return this.$message.warn("请选择合同");
    this.currentRow = null;
    this.isPeriodShow = true;
    this.modalKey = record.id as string;
    Api.getTableList({
      filters: [
        {
          propertyCode: "schema_id",
          propertyType: 0,
          propertyValue: this.form.schema_id as string,
          propertyValueName: "",
        }
      ],
      mobile: false,
      page: 0,
      queryCode: this.projectCode + "_T_G_MeasuPer0",
      schemaCode: this.projectCode + "_T_G_MeasuPer",
      size: 999999
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
        const resData = res.data;
        if (!resData || !resData.content) return
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
          let updatePeriod = {};
          for (let key in temptPeriod) {
            //@ts-ignore
            this.$set(updatePeriod, capitalize(key), temptPeriod[key]);
          }
          this.tableDataPeriod.push(updatePeriod);
        }
      })
  }

  // 点击表格行事件
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.currentRow = record;
          if (record.isMeasure == "是") return this.$message.warn("工程量清单计量费用不能修改金额！");
        }
      }
    };
  }

  // 保存表单
  saveFormBtn() {
    this.form.remarks = this.desc.remarks;
    Api.insertPayPeriod({
      projectCode: this.projectCode,
      objList: [this.form]
    })
      .then(res => {
        if (res.errcode == 0) return this.$message.success("保存成功");
        this.$message.error(res.errmsg as string);
      })
  }

  // 表格行变色
  setRowClassName(record, index) {
    let rowColor = index % 2 === 0 ? "evenRowStyl" : "";
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }

  // 启动流程
  startProcessBtn() {
    this.form.remarks = this.desc.remarks;
    Api.payManageStartWorkflow({
      projectCode: this.projectCode,
      objList: [this.form]
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success(res.errmsg as string);
        this.form.workflowInstanceId = res.data;
      })
  }

  updatePayment() {
    if (this.tableDataPayment.length == 0) return this.$message.warn("请先导入费用项");
    Api.updatePayDetailV3({
      projectCode: this.projectCode,
      gpayper: this.form,
      objList: this.tableDataPayment
    })
      .then(res => {
        if (res.errcode !== 0) return
        this.initPayment();
        this.formInit();
      })
  }

  NumberMul(arg1, arg2) {
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
}
</script>

<style lang="less" scoped>

.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .close_icon {
    text-align: right;
  }

  .form_body {
    width: 100%;
    height: 270px;
    margin-bottom: 8px;
  }

  .table_body {
    width: 100%;
    height: calc(100vh - 390px);

    /deep/ .ant-table {
      height: calc(100vh - 500px);
    }

    /deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
      height: 21.5vw;
    }
  }

}

/deep/ .ant-card-body .ant-table .ant-table-tbody > tr:hover:not(.ant-table-expanded-row) > td {
  background-color: #bcf5f6;
}

/deep/ .clickRowStyl {
  background-color: #bcf5f6;
}

/deep/ .evenRowStyl {
  background-color: #aad4fd46 !important;
}
/deep/ .ant-table-tbody > tr > td {
  padding: 4px 2px;
}

/deep/ .ant-table-thead > tr > th {
  padding: 16px 2px;
}
</style>
