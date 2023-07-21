<!--
 * @Author: Zeng Yu
 * @Date: 2020-11-04 08:54:04
 * @LastEditTime: 2020-11-19 14:17:59
 * @LastEditors: Please set LastEditors
 * @Description: 支付汇总（编辑页面）
 * @FilePath: \frontend\entries\portal\extends\measurePayment\subPage\paymentEdit.vue
-->

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
        :columns="tableLabelPayment"
        :data-source="tableDataPayment"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
        :scroll="{ x: 1850, y: yHeight }"
      >
        <span slot="操作" slot-scope="record">
          <a @click="() => detail(record)">明细</a>
        </span>
        <template v-for="item in columnPay" :slot="item" slot-scope="text, record">
          <div :key="item">
            <editable-cell :text="text" @change="onCellChange(record.key, item, $event)"/>
          </div>
        </template>
        <template slot="measurePeriod" slot-scope="text, record">
          <a :disabled="record.isAbled" @click="periodPick(record)">{{ record.measurePeriod }}</a>
        </template>
        <template slot="calculateMode" slot-scope="text, record">
          <a-select
            :defaultValue="record.calculateMode"
            style="width: 75px"
            @change="modeChange(record.key, 'calculateMode', $event)"
          >
            <a-select-option v-for="d in modeData" :key="d.value" :value="d.value">{{
              d.text
            }}
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
      width="900"
    >
      <template slot="footer">
        <a-button @click="periodCancel">无上期计量周期</a-button>
        <a-button type="primary" @click="periodOk">完成选择</a-button>
      </template>
      <a-table
        :columns="tableLabelPeriod"
        :data-source="tableDataPeriod"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
      >
      </a-table>
    </a-modal>
  </div>
</template>

<script>
import {Component, Vue} from "vue-property-decorator";
import axios from "axios";
import env from '@/config/env';
import {
  Button,
  Card,
  Icon,
  Table,
  Input,
  Select,
  Popconfirm,
  Modal,
  Form,
  Col,
  Row,
  InputNumber,
  Divider,
  Tree
} from "@h3/antd-vue";
import FormModel from 'ant-design-vue/lib/form-model';
import {
  list,
  insertPayPeriod,
  importPayDetail,
  getPayDetail,
  payManageStartWorkflow,
  deletePayDetail,
  updatePayDetail,
  selectMeasurePeriod,
  getPayPeriod
} from "../data/url";
import {timeDefault, capitalize} from "../data/util";
import EditableCell from "../data/editTableCell.vue";

Vue.prototype.$form = Form;
//js乘法
Vue.prototype.NumberMul = function (arg1, arg2) {
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
const tableLabelPayment = [
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
    width: "4.5%",
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
  {
    align: "center",

    title: "备注",
    key: "remarks",
    dataIndex: "remarks",
    scopedSlots: {customRender: "remarks"}
  },
  {
    align: "center",

    title: "操作",
    key: "操作",
    scopedSlots: {customRender: "操作"}
  }
];
const tableLabelPeriod = [
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

    title: "上期计量周期",
    key: "lastPeriod",
    dataIndex: "lastPeriod",
    scopedSlots: {customRender: "lastPeriod"}
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
  {
    align: "center",

    title: "操作",
    key: "操作",
    scopedSlots: {customRender: "操作"},
  }
];
@Component({
  name: "paymentEdit",
  components: {
    AInputNumber: InputNumber,
    ARow: Row,
    ATree: Tree,
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
    ADivider: Divider,
    EditableCell,
    APopconfirm: Popconfirm,
    AModal: Modal,
    ASelectOption: Select.Option
  }
})
export default class allProtect extends Vue {
  data() {
    return {
      columnPay: [
        "payDetailRatio",
        "sgPaydetailmoney",
        // "jlPaydetailmoney",
        // "yzPaydetailmoney",
        // "lastYZDetailMoney",
        // "totalYZDetailMoney",
        // "actualDetailMoney",
        // "lastActualDetailMoney",
        // "totalLastActualDetailMoney",
        "remarks"
      ],
      currentRow: "",
      desc: {
        remarks: ""
      },
      form: {
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
      },
      isPeriodShow: false,
      labelCol: {span: 9},
      labelColExtra: {span: 12},
      modalKey: "",
      modeData: [{value: "支付", text: "支付"}, {value: "扣回", text: "扣回"}],
      selectedRowKeys: [],
      projectCode: "",
      tableDataPayment: [],
      tableLabelPayment,
      tableLabelPeriod,
      tableDataPeriod: [],
      wrapperCol: {span: 15},
      wrapperColExtra: {span: 12},
      yHeight: 410
    };
  }

  mounted() {
    if (this.$route.query.symbol == 1) {
      this.projectCode = this.$route.query.project;
      this.schemeId = this.$route.query.schemeId;
    } else {
      this.projectCode = this.$route.query.project;
      this.schemeId = this.$route.query.id;
    }
    //表单
    this.formInit();
    //支付明细
    this.initPayment();
    let _this = this;
    _this.yHeight = document.documentElement.clientHeight - 525;
    window.onresize = () => {
      return (() => {
        _this.yHeight = document.documentElement.clientHeight - 525;
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
    if (this.tableDataPayment.length != 0) {
      axios
        .post(deletePayDetail, {
          gpayper: this.form,
          projectCode: this.projectCode,
          objList: []
        })
        .then(res => {
          if (res.errcode == 0) {
            this.$message.success(res.errmsg);
            this.tableDataPayment = [];
          } else {
            this.$message.error(res.errmsg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.success("清空失败");
        });
    } else {
      this.$message.warn("合同清单已经为空！");
    }
  }

  //转入明细界面
  detail(record) {
    if (record.isMeasure == "是" && record.tG04cMeasureperiodFk != "") {
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
    } else {
      this.$message.warn("请选择对应的计量汇总周期");
    }
  }

  detailProcessBtn() {
    const url = `/form/detail?workflowInstanceId=${this.form.workflowInstanceId}`
    const urlReturn = `${this.$route.fullPath}`;
    this.isDingTalk?this.$router.push(`${url}&return=${encodeURIComponent(urlReturn )}`):window.open(`${env.portalHost}${url}`)
  }

  // 表单初始化
  formInit() {
    axios
      .get(getPayPeriod, {
        params: {
          projectCode: this.projectCode,
          id: this.schemeId
        }
      })
      .then(res => {
        if (res.errcode == 0) {
          // this.$message.success("成功获取数据");
          this.form = res.data;
          this.form.paymentStart = this.form.paymentStart.slice(0, 10);
          this.form.paymentEnd = this.form.paymentEnd.slice(0, 10);
          this.desc.remarks = this.form.remarks;
        } else {
          this.$message.error(res.errmsg);
        }
      })
      .catch(err => {
        console.log(err);
        this.$message.error("获取数据失败");
      });
  }

  // 支付明细初始化
  initPayment() {
    this.tableDataPayment = [];
    axios
      .get(getPayDetail, {
        params: {
          projectCode: this.projectCode,
          periodId: this.schemeId
        }
      })
      .then(res => {
        let resData = res.data;
        let tempt = {};
        if (res.errcode == 0) {
          if (resData.length === 0) return;
          for (let i = 0; i < resData.length; i++) {
            this.$set(resData[i], "key", resData[i].id);
            if (resData[i].isMeasure == "是") {
              resData[i].measurePeriod =
                resData[i].measurePeriod == "" || undefined ? "请选择" : resData[i].measurePeriod;
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
        } else {
          this.$message.error(res.errmsg);
        }
      })
      .catch(err => {
        this.$message.success("导入费用项失败");
      });
  }

  insertPayment() {
    if (this.tableDataPayment.length == 0) {
      axios
        .post(importPayDetail, {
          projectCode: this.projectCode,
          id: this.form.id,
          lastPaymentFK: this.form.lastPaymentFK,
          contractNum: this.form.contractNum
        })
        .then(res => {
          let resData = res.data;
          let tempt = {};
          if (res.errcode == 0) {
            for (let i = 0; i < resData.length; i++) {
              this.$set(resData[i], "key", resData[i].id);
              if (resData[i].isMeasure == "是") {
                resData[i].measurePeriod =
                  resData[i].measurePeriod == "" || undefined ? "请选择" : resData[i].measurePeriod;
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
          } else {
            this.$message.error(res.errmsg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.success("导入费用项失败");
        });
    } else {
      this.$message.warn("请清空费用项！");
    }
  }

  // 表格内置下拉框
  modeChange(key, dataIndex, value) {
    const dataSource = [...this.tableDataPayment];
    const target = dataSource.find(item => item.key === key);
    if (target) {
      target[dataIndex] = value;
      this.tableDataPayment = dataSource;
    }
  }

  // 支付明细表格编辑事件
  onCellChange(key, dataIndex, value) {
    const dataSource = [...this.tableDataPayment];
    this.tableDataPayment = [];
    const target = dataSource.find(item => item.key === key);
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
      if (this.tableDataPayment[i].key == this.modalKey) {
        this.tableDataPayment[i].measurePeriod = "无上期计量周期";
        this.tableDataPayment[i].tG04cMeasureperiodFk = "";
      }
    }
  }

  periodOk() {
    if (this.currentRow != "" && this.currentRow != undefined) {
      this.isPeriodShow = false;
      for (let i = 0; i < this.tableDataPayment.length; i++) {
        if (this.tableDataPayment[i].id == this.modalKey) {
          this.tableDataPayment[i].measurePeriod = this.currentRow.measurePeriod;
          this.tableDataPayment[i].tG04cMeasureperiodFk = this.currentRow.id;
          axios
            .post(selectMeasurePeriod, {
              projectCode: this.projectCode,
              objList: [this.tableDataPayment[i]]
            })
            .then(res => {
              if (res.errcode == 0) {
                let resData = res.data;
                this.tableDataPeriod[i] = res.data;
                this.$message.success(res.errmsg);
              } else {
                this.$message.warn(res.errmsg);
              }
            })
            .catch(err => {
              console.log(err); //错误信息
            });
        }
      }
    }
  }

  periodPick(record) {
    this.modalKey = "";
    if (record.contractNum == "" || record.contractNum == "请选择合同") {
      this.$message.warn("请选择合同");
    } else {
      this.tableDataPeriod = [];
      this.currentRow = "";
      this.isPeriodShow = true;
      this.modalKey = record.id;
      axios
        .post(list, {
          filters: [
            {
              propertyCode: "ContractNum",
              propertyType: 0,
              propertyValue: this.form.contractNum,
              propertyValueName: ""
            }
          ],
          mobile: false,
          page: 0,
          queryCode: this.projectCode + "_T_G_MeasuPer0",
          schemaCode: this.projectCode + "_T_G_MeasuPer",
          size: 999999
        })
        .then(res => {
          if (res.errcode == 0) {
            let resData = res.data;
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
                this.$set(updatePeriod, capitalize(key), temptPeriod[key]);
              }
              this.tableDataPeriod.push(updatePeriod);
            }
            this.$message.success("成功获取数据");
          } else {
            this.$message.warn(res.errmsg);
          }
        })
        .catch(err => {
          console.log(err); //错误信息
        });
    }
  }

  // 点击表格行事件
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          // console.log(record, record.listAmount * record.listUnitPrice);
          this.currentRow = record;
          if (record.isMeasure == "是") {
            this.$message.warn("工程量清单计量费用不能修改金额！");
          }
        }
      }
    };
  }

  // 保存表单
  saveFormBtn() {
    this.form.remarks = this.desc.remarks;
    axios
      .post(insertPayPeriod, {
        projectCode: this.projectCode,
        objList: [this.form]
      })
      .then(res => {
        if (res.errcode == 0) {
          this.$message.success("保存成功");
        } else {
          this.$message.error(res.errmsg);
        }
      })
      .catch(err => {
        this.$message.error("保存失败");
        this.formInit();
      });
  }

  // 表格行变色
  setRowClassName(record, index) {
    let rowColor = index % 2 === 0 ? "evenRowStyl" : "";
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }

  // 启动流程
  startProcessBtn() {
    this.form.remarks = this.desc.remarks;
    axios
      .post(payManageStartWorkflow, {
        projectCode: this.projectCode,
        objList: [this.form]
      })
      .then(res => {
        if (res.errcode == 0) {
          this.$message.success(res.errmsg);
          this.form.workflowInstanceId = res.data;
        } else {
          this.$message.error(res.errmsg);
        }
      })
      .catch(err => {
        this.$message.success("启动失败");
      });
  }

  updatePayment() {
    if (this.tableDataPayment.length == 0) {
      this.$message.warn("请先导入费用项");
    } else {
      axios
        .post(updatePayDetail, {
          projectCode: this.projectCode,
          gpayper: this.form,
          objList: this.tableDataPayment
        })
        .then(res => {
          if (res.errcode == 0) {
            this.initPayment();
            this.formInit();
          }
        })
        .catch(err => {
          this.$message.success("数据同步失败");
        });
    }
  }
}
</script>
<style lang="less" scoped>
@import (reference) "../../../styles/theme.less";

.main {
  .flex;
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


</style>
<style>
@import "../data/measure.css";
</style>
