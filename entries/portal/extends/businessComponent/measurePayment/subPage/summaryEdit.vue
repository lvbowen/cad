<template>
  <div class="main">
    <a-icon
      type="close"
      v-show="!isCbsShow"
      @click="close"
      class="close_icon"></a-icon>
    <a-card
      v-show="!isCbsShow"
      title="周期计量汇总"
      class="form_card"
      size="small">
      <a-button
        :disabled="disable"
        @click="saveFormBtn"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small"
      >保存
      </a-button>
      <a-button
        :disabled="disable"
        @click="startProcessBtn"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small"
      >启动流程
      </a-button>
      <a-button
        @click="detailProcessBtn"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small"
      >查看审批过程
      </a-button>
      <a-button
        @click="outputReportBtn"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small">输出报表
      </a-button>
      <a-button
        @click="downloadAppendix"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small"
      >附件
      </a-button>
      <a-form-model
        :model="form"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        layout="inline"
        style="margin-top:-10px"
      >
        <a-form-model-item label="计量周期">
          <a-input v-model="form.measurePeriod"/>
        </a-form-model-item>
        <a-form-model-item label="合同编号">
          <a-input v-model="form.contractNum" disabled/>
        </a-form-model-item>
        <a-form-model-item label="汇总金额">
          <a-input v-model="form.measureTotalMoney" disabled/>
        </a-form-model-item>
        <br/>
        <a-form-model-item label="上期期号">
          <a-input v-model="form.lastPeriod" disabled/>
        </a-form-model-item>
        <a-form-model-item label="审核状态">
          <a-input v-model="form.verifyStatus" disabled/>
        </a-form-model-item>
        <a-form-model-item label="审核人员">
          <a-input v-model="form.verifyPerson" disabled/>
        </a-form-model-item>
        <br/>
        <a-form-model-item label="起始日期">
          <a-input v-model="form.measureStart" disabled/>
        </a-form-model-item>
        <a-form-model-item label="截止日期">
          <a-input v-model="form.measureEnd" disabled/>
        </a-form-model-item>
        <a-form-model-item label="编制人员">
          <a-input v-model="form.createdBy" disabled/>
        </a-form-model-item>
        <a-form-model-item label="编制部门">
          <a-input v-model="form.createDiv" disabled/>
        </a-form-model-item>
      </a-form-model>
      <a-form-model :model="desc" style="padding-left:14px">
        <a-form-model-item label="备注信息" :labelCol="{ span: 1 }" :wrapperCol="{ span: 10 }">
          <a-input v-model="desc.remarks" type="textarea"/>
        </a-form-model-item>
      </a-form-model>
    </a-card>
    <a-row :gutter="8">
      <a-col :span="leftWidth">
        <a-card
          class="left_card"
          v-show="!isCbsShow"
          title="计量清单明细项"
          size="small">
          <a-button
            :disabled="disable"
            @click="insertContract"
            class="buttonSty"
            type="primary"
            slot="extra"
            size="small"
          >导入合同清单
          </a-button
          >
          <a-button
            :disabled="disable"
            @click="updateContract"
            class="buttonSty"
            type="primary"
            slot="extra"
            size="small"
          >数据同步
          </a-button
          >
          <a-button
            :disabled="disable"
            @click="delContract"
            class="buttonSty"
            type="danger"
            slot="extra"
            size="small"
          >清空合同清单
          </a-button
          >
          <a-icon
            class="buttonSty"
            type="fullscreen-exit"
            slot="extra"
            @click="backToNor"
            v-show="isLeftFull"/>
          <a-icon
            class="buttonSty"
            type="fullscreen"
            slot="extra"
            @click="enlarge('left')"
            v-show="!isLeftFull"/>
          <a-table
            v-if="tableDataContract.length!==0"
            class="left_table"
            :defaultExpandedRowKeys="expandedTableKeys"
            :columns="tableLabelContract"
            :data-source="tableDataContract"
            :customRow="rowClick"
            :rowClassName="setRowClassName"
            :scroll="scrollTableContract"
            :indentSize="10"
            @expand="expandRows"
          >
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="rightWidth">
        <a-card
          class="right_card"
          v-show="!isCbsShow"
          title="CBS计量记录"
          size="small">
          <a-input-search
            slot="extra"
            placeholder="输入关键字"
            enterButton
            size="small"
            style="width: 250px"
            @search="onSearch"/>
          <a-button
            :disabled="disable"
            @click="autoAdd"
            class="buttonSty"
            type="primary"
            slot="extra"
            size="small"
          >一键添加
          </a-button>
          <a-button
            :disabled="disable"
            @click="manuAdd"
            class="buttonSty"
            type="primary"
            slot="extra"
            size="small"
          >手动添加
          </a-button>
          <a-button
            :disabled="disable"
            @click="removeCBS"
            class="buttonSty"
            slot="extra"
            size="small"
            type="danger"
          >移除
          </a-button>
          <a-icon
            class="buttonSty"
            type="fullscreen-exit"
            slot="extra"
            @click="backToNor"
            v-show="isRightFull"/>
          <a-icon
            type="fullscreen"
            slot="extra"
            class="buttonSty"
            @click="enlarge('right')"
            v-show="!isRightFull"/>
          <a-table
            class="right_table"
            :columns="tableLabelCBS"
            :data-source="tableDataCBS"
            :pagination="pagination"
            :rowSelection="{
              selectedRowKeys: selectedRowKeys,
              onChange: onSelectChange
            }"
            :scroll="scrollTableCBS"
            @change="handleTableChange"
          >
            <template slot="footer">
              <template v-for="(v,i) in totalRow">
                <div :key="i" style="width:220px;float: left;margin-top: 1px">
                  <span>{{ v.name + ":" + totalMeasure[v.value] }}</span>
                </div>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
    <cbsCount v-show="isCbsShow" :params="params"></cbsCount>
    <!--附件清单-->
    <a-modal
      title="选择清单方案"
      :visible="isFileShow"
      @ok="saveFile"
      @cancel="()=>{this.isFileShow=false}"
      width="1000px"
    >
      <span>附件上传 :  </span>
      <a-upload
        name="file"
        :action="action"
        :headers="headers"
        :showUploadList="false"
        @change="importChange"
      >
        <a-button type="primary">选择附件</a-button>
      </a-upload>
      <a-table
        rowKey="refId"
        :columns="fileLabel"
        :data-source="constTable"
      >
        <template slot="操作" slot-scope="record">
          <a @click="doAct(record,'预览')">预览</a>|
          <a @click="doAct(record,'下载')">下载</a>|
          <a @click="doAct(record,'删除')">删除</a>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script>
import {Component, Vue,} from "vue-property-decorator";
import axios from "axios";
import {
  Button, Card, Icon, Table, Input, Select, Popconfirm, Upload,
  Modal, FormModel, Col, Row, InputNumber, Divider, Tree
} from "@h3/antd-vue";
import {
  measureTotalInsert,
  measureTotalStartWorkflow,
  deleteMeasureDetail,
  importMeasureDetail,
  getByCBSAndPeriodPage,
  removeCBSMeasure,
  selectAllCBSMeasure,
  updateMeasureDetail,
  getMeasurePeriod,
  getMeasureDetailChilds,
} from "../data/url";
import EditableCell from "../data/editTableCell.vue";
import cbsCount from './cbsCount';
import env from '@/config/env';
import * as Api from '../../../service/api';
import OAuthApi from "../../../../src/apis/oauth";

const tableLabelContract = [
  // 表头数据
  {
    align: "left",
    title: "清单项CBS",
    key: "cCBS",
    dataIndex: "cCBS"
  },
  {
    align: "center",
    title: "编码",
    key: "cListCode",
    dataIndex: "cListCode"
  },
  {
    align: "center",
    title: "名称",
    width: "10%",
    key: "cListName",
    dataIndex: "cListName"
  },
  {
    align: "center",
    title: "单位",
    width: "3%",
    key: "cListUnit",
    dataIndex: "cListUnit"
  },
  {
    align: "center",
    title: "单价",
    key: "cListUnitPrice",
    dataIndex: "cListUnitPrice"
  },
  // {
  //   align: "center",
  //
  //   title: "变更单价",
  //   key: "cChangeUnitPrice",
  //   dataIndex: "cChangeUnitPrice"
  // },
  {
    align: "center",
    title: "数量",
    key: "cListAmount",
    dataIndex: "cListAmount"
  },
  {
    align: "center",
    title: "合价",
    key: "cListTotalPrice",
    dataIndex: "cListTotalPrice"
  },
  {
    align: "center",
    title: "变更工程量",
    key: "changeAmount",
    dataIndex: "changeAmount",
    scopedSlots: {customRender: "changeAmount"},
  },
  {
    align: "center",

    title: "总工程量",
    key: "finalTotalAmount",
    dataIndex: "finalTotalAmount",
    scopedSlots: {customRender: "finalTotalAmount"},
  },
  {
    align: "center",
    title: "总工程款",
    key: "finalTotalPrice",
    dataIndex: "finalTotalPrice",
    scopedSlots: {customRender: "finalTotalPrice"},
  },
  {
    align: "center",

    title: "类别",
    key: "cListClass",
    dataIndex: "cListClass"
  },
  {
    align: "center",

    title: "备注",
    key: "cRemarks",
    dataIndex: "cRemarks"
  },
  {
    align: "center",

    title: "本期数量",
    key: "detailAmount",
    dataIndex: "detailAmount"
  },
  {
    align: "center",
    title: "本期合价",
    key: "detailMoney",
    dataIndex: "detailMoney"
  },
  {
    align: "center",
    title: "上期末数量",
    key: "detailPreviousAmount",
    dataIndex: "detailPreviousAmount"
  },
  {
    align: "center",
    title: "上期末合价",
    key: "detailPreviousMoney",
    dataIndex: "detailPreviousMoney"
  },
  {
    align: "center",
    title: "本期末数量",
    key: "detailTotalAmount",
    dataIndex: "detailTotalAmount"
  },
  {
    align: "center",
    title: "本期末合价",
    key: "detailTotalMoney",
    dataIndex: "detailTotalMoney"
  },
  {
    align: "center",
    title: "本年累计工程量",
    width: '6%',
    key: "yearAmount",
    dataIndex: "yearAmount"
  },
  {
    align: "center",

    title: "本年累计工程款",
    width: '6%',
    key: "yearMoney",
    dataIndex: "yearMoney"
  },
];
const tableLabelCBS = [
  {
    align: "center",
    title: "所属CBS",
    width: '6%',
    key: "cbs",
    dataIndex: "cbs"
  },
  {
    align: "center",
    width: '8%',
    title: "MBS编码",
    key: "mbs",
    dataIndex: "mbs"
  },
  {
    align: "center",
    title: "清单项编码",
    key: "listCode",
    dataIndex: "listCode",
  },
  {
    align: "center",
    width: '8%',
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
  }
];
@Component({
  name: "summaryEdit",
  components: {
    AInputNumber: InputNumber,
    ARow: Row,
    ATree: Tree,
    ACol: Col,
    AIcon: Icon,
    ACard: Card,
    AFormModelItem: FormModel.Item,
    AButton: Button,
    AInput: Input,
    ASelect: Select,
    ATable: Table,
    AFormModel: FormModel,
    ADivider: Divider,
    EditableCell,
    APopconfirm: Popconfirm,
    AUpload: Upload,
    AModal: Modal,
    cbsCount
  }
})
export default class allProtect extends Vue {
  leftWidth = 12;
  rightWidth = 12;
  isLeftFull = false;
  isRightFull = false;
  markNum = 0;
  pagination = {
    pageSize: 20, //每页中显示20条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["20", "50", "100", "200"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };
  totalRow = [
    {name: '施工申报总量 ', value: 'sgAmount'},
    {name: '监理审核总量 ', value: 'jlAmount'},
    {name: '业主核定总量 ', value: 'yzAmount'},
    {name: '施工申报总金额 ', value: 'sgMoney'},
    {name: '监理审核总金额 ', value: 'jlMoney'},
    {name: '业主核定总金额 ', value: 'yzMoney'},
  ];
  totalMeasure = {'sgAmount': 0, 'jlAmount': 0, 'yzAmount': 0, 'sgMoney': 0, 'jlMoney': 0, 'yzMoney': 0};
  expandedTableKeys = [];
  //  table样式
  scrollTableContract = {x: 2300, y: 400};
  scrollTableCBS = {x: 2200, y: 340};
  isFileShow = false;
  fileLabel = [
    {
      title: '序号',
      align: "center",
      width: 100,
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      align: "center",
      title: "文件名",
      key: "name",
      dataIndex: "name",
    },
    {
      align: "center",
      title: "上传时间",
      key: "createdTime",
      dataIndex: "createdTime",
      scopedSlots: {customRender: "createdTime"}
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      scopedSlots: {customRender: "操作"}
    },];
  fileData = [];
  constTable = [];
  action = `${env.apiHost}/api/aliyun/upload`;
  headers = {Authorization: 'Bearer ' + localStorage.token};

  data() {
    return {
      currentRow: null,
      desc: {
        remarks: ""
      },
      disable: false,
      form: {
        measurePeriod: "",
        contractNum: "",
        contractOrgName: "",
        measureTotalMoney: 0,
        measureStart: "",
        measureEnd: "",
        createdBy: "",
        createDiv: "",
        lastPeriod: "",
        verifyStatus: "",
        verifyPerson: ""
      },
      labelCol: {span: 8},
      isCbsShow: false,
      selectedRowKeys: [],
      params: {},
      projectCode: "",
      tableDataCBS: [],
      tableLabelCBS,
      tableDataContract: [],
      tableLabelContract,
      wrapperCol: {span: 16}
    };
  }

  mounted() {
    this.currentRow = null;
    if (this.$route.query.symbol == 1) {
      //支付汇总-支付明细-明细转入
      this.projectCode = this.$route.query.project;
      this.schemeId = this.$route.query.id;
      this.disable = true;
    } else {
      //或计量支付界面转入
      this.projectCode = this.$route.query.project;
      this.schemeId = this.$route.query.id;
    }
    //表单
    this.formInit();
    this.initContract();
    let _this = this;
    _this.scrollTableContract.y = document.documentElement.clientHeight - 500;
    _this.scrollTableCBS.y = document.documentElement.clientHeight - 560;
    window.onresize = () => {
      return (() => {
        _this.scrollTableContract.y = document.documentElement.clientHeight - 500;
        _this.scrollTableCBS.y = document.documentElement.clientHeight - 560;
      })()
    };
  }

  // 一键添加(CBS计量表)
  autoAdd() {
    axios
      .post(selectAllCBSMeasure, {
        contractNum: this.$route.query.contractNum,
        periodId: this.$route.query.id,
        periodNum: this.$route.query.measurePeriod,
        projectCode: this.projectCode
      })
      .then(res => {
        this.$message.success(res.errmsg);
        if (res.errcode === 0) return this.updateContract();
      })
      .catch(err => {
        this.$message.error("添加失败");
        this.formInit(this.$route.query);
      });
  }

  // 关闭编辑界面
  close() {
    if (this.$route.query.symbol === 1) {
      let routeMessage = {};
      this.$set(routeMessage, "symbol", 1);
      this.$router.go(-1);
    } else {
      this.$router.go(-1);
    }
  }

  // 清空合同清单事件
  delContract() {
    if (this.tableDataContract.length === 0) return this.$message.warn("合同清单已经为空！");
    axios
      .delete(deleteMeasureDetail, {
        params: {
          projectCode: this.projectCode,
          periodId: this.form.id
        }
      })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg);
        this.$message.success(res.errmsg);
        this.tableDataContract = [];
      })
      .catch(err => {
        this.$message.success("清空失败");
      });

  }

  // 查看审批过程
  detailProcessBtn() {
    const url = `/form/detail?workflowInstanceId=${this.form.workflowInstanceId}`;
    const urlReturn = `${this.$route.fullPath}`;
    this.isDingTalk?this.$router.push(`${url}&return=${encodeURIComponent(urlReturn )}`):window.open(`${env.portalHost}${url}`)
  }

  /**
   *遍历多棵树（编辑节点）
   *data  多棵树
   *key   关键字
   */
  editListTree(data, key, value) {
    let flag = false
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

  enlarge(value) {
    if (value === 'left') {
      this.isLeftFull = true;
      this.leftWidth = 24;
      this.rightWidth = 0;
    } else if (value === 'right') {
      this.isRightFull = true;
      this.leftWidth = 0;
      this.rightWidth = 24;
    }
  }

  // 点击展开图标时触发
  expandRows(expanded, record) {
    this.getChildTree(record);
  }

  //获取子节点
  getChildTree(c) {
    let _this = this
    return new Promise((resolve) => {
      if (c.children != undefined && c.children != null && c.children.length != 0) { // 有值了直接渲染
        resolve()
        return
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      axios
        .get(getMeasureDetailChilds, {
          params: {
            projectCode: this.projectCode,
            periodId: this.schemeId,
            parentId: c.id
          },
        })
        .then((res) => {
          c["children"] = res.data;
          c["childCount"] = res.data.length;
          this.editListTree(_this.tableDataContract, c.key, c);
        })
      resolve()
    })
  }

  // 表单初始化(第一个card)
  formInit() {
    axios
      .get(getMeasurePeriod, {
        params: {
          projectCode: this.projectCode,
          id: this.schemeId
        }
      })
      .then(res => {
        if (res.errcode == 0) {
          this.form = res.data;
          this.form.measureStart = this.form.measureStart.slice(0, 10);
          this.form.measureEnd = this.form.measureEnd.slice(0, 10);
          this.desc.remarks = this.form.remarks;
        } else {
          this.$message.error(res.errmsg);
        }
      })
      .catch(err => {
        this.$message.error("获取数据失败");
      });
  }

  handleTableChange(pagination) {
    this.pagination.current = pagination.current;
    this.pagination.pageSize = pagination.pageSize;
    this.initCBSDetail(this.currentRow.tG04aContractdetailFk, this.projectCode);
  }

  // CBS表格初始化
  initCBSDetail(id, code) {
    this.selectedRowKeys = [];
    this.tableDataCBS = [];
    this.totalMeasure = {};
    axios
      .get(getByCBSAndPeriodPage, {
        params: {
          projectCode: code,
          cbsId: id,
          periodId: this.form.id,
          page: this.pagination.current - 1,
          size: this.pagination.pageSize,
          like: '',
        }
      })
      .then(res => {
        if (res.errcode == 0) {
          let resData = res.data.dataList;
          this.totalMeasure = res.data.totalMeasure;
          this.pagination['total'] = resData.total;
          for (let i = 0; i < resData.records?.length; i++) {
            this.$set(resData.records[i], "key", resData.records[i].id);
          }
          this.tableDataCBS = resData.records;
        }
      })
  }

  // 计量清单明细项表格初始化（页面中间表格）
  initContract() {
    this.expandedTableKeys.length = 0
    axios
      .get(getMeasureDetailChilds, {
        params: {
          projectCode: this.projectCode,
          periodId: this.schemeId,
          parentId: ""
        }
      })
      .then(res => {
        if (res.errcode == 0) {
          this.tableDataContract = res.data;
          for (let i = 0; i < this.tableDataContract.length; i++) {
            this.expandedTableKeys.push(this.tableDataContract[i].id)
          }
        }
      })
  }

  // 导入合同清单
  insertContract() {
    if (this.tableDataContract.length == 0) {
      axios
        .post(importMeasureDetail, {
          projectCode: this.projectCode,
          measurePeriodId: this.form.id,
          lastMeasurePeriodId: this.form.lastperiodFk,
          contractNum: this.form.contractNum
        })
        .then(res => {
          if (res.errcode == 0) {
            this.$message.success(res.errmsg);
            this.tableDataContract = res.data;
          } else {
            this.$message.error(res.errmsg);
          }
        })
    } else {
      this.$message.warn("请清空合同清单！");
    }
  }

  // 手动添加（跳转中间计量编辑界面）
  manuAdd() {
    if (this.currentRow == null) return this.$message.warn("请选择计量清单明细项！");
    this.isCbsShow = true;
    this.$set(this.params, 'code', this.projectCode);
    this.$set(this.params, 'id', this.currentRow.tG04aContractdetailFk);
    this.$set(this.params, 'symbol', 0);
    this.$set(this.params, 'isShow', this.isCbsShow);
    this.$set(this.params, 'measurePeriod', this.$route.query.measurePeriod);
    this.$set(this.params, 'measurePeriodFk', this.currentRow.tG04cMeasureperiodFk);
    this.$set(this.params, 'measureId', this.$route.query.id);
    this.$set(this.params, 'oldDataCBS', this.tableDataCBS);
    this.$set(this.params, 'currentRow', this.currentRow);
  }

  //搜索
  onSearch(value) {
    this.selectedRowKeys = [];
    this.tableDataCBS = [];
    axios
      .get(getByCBSAndPeriodPage, {
        params: {
          projectCode: this.projectCode,
          cbsId: this.currentRow.tG04aContractdetailFk,
          periodId: this.form.id,
          page: this.pagination.current - 1,
          size: this.pagination.pageSize,
          like: value,
        }
      })
      .then(res => {
        if (res.errcode == 0) {
          let resData = res.data.dataList;
          this.pagination['total'] = resData.total;
          for (let i = 0; i < resData.records?.length; i++) {
            this.$set(resData.records[i], "key", resData.records[i].id);
          }
          this.tableDataCBS = resData.records;
        }
      })
  }

  // 表格多选
  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys;
  }

  downloadAppendix() {
    // window.open(
    //   "http://frx.ctesi.com.cn/webroot/decision/view/report?viewlet=BimProject%252FCHPM%252FA_CHPM_BS.cpt&ref_t=design&ref_c=3a14811b-7fc2-401e-baa9-eda77368352a&" +
    //   "measurePeriod=" +
    //   this.form.measurePeriod +
    //   "&contractNum=" +
    //   this.form.contractNum
    // );
    this.fileData = [];
    this.constTable = [];
    this.isFileShow = true;
    Api.getAllFileMeasure({
      periodId: this.form.id,
    }).then(res => {
      this.constTable = res.data;
    })
  }

  outputReportBtn() {
    console.log('outputReportBtn', this.$route.query)
    window.open(`${env.host}/RDP-SERVER/rdppage/main/f0d73158b62c8274c662859ec466c94a?xmjc_1=${this.$route.query.xmjc_1}&ContractNum=${this.$route.query.contractNum}&MeasurePeriod=${this.$route.query.measurePeriod}`)
  }

  importChange(info) {
    const _this = this;
    if (info.file.status === 'uploading') {
    } else if (info.file.status === 'done') {
      if (info.file.response.errcode !== 0) {
        _this.$message.error(`${info.file.response.errmsg} ,导入失败.`);
      } else {
        _this.fileData.push(info.file.response.data);
        _this.constTable.push(info.file.response.data);
      }
    } else if (info.file.status === 'error') {
      _this.$message.error(`${info.file.name} 导入失败.`);
    } else {
      _this.$message.error("导入异常")
    }
  }

  saveFile() {
    Api.uploadFileMeasure({
      periodId: this.form.id,
      appCode: this.projectCode,
      attachmentModelList: this.fileData
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('保存失败');
      this.$message.success('保存成功');
      this.isFileShow = false;
    })
  }

  doAct(record, type) {
    const token = localStorage.getItem('token')
    const downloadUrl = `${env.apiHost}/api/aliyun/download?refId=` + record.refId;
    if (type === '下载') return window.open(downloadUrl);
    if (type === '预览') return window.open("https://cloudpivotkkfileview.wisdombim.com.cn/onlinePreview" + "?url=" + downloadUrl + "=name=" + record.name);
    let noSave = false;
    for (let i = 0; i < this.fileData.length; i++) {
      if (record.refId === this.fileData[i].refId) {
        this.fileData.splice(i, 1);
        noSave = true;
      }
    }
    if (noSave) {
      for (let i = 0; i < this.constTable.length; i++) {
        if (record.refId === this.constTable[i].refId) {
          this.constTable.splice(i, 1);
        }
      }
    } else {
      Api.deleteFileMeasure({
        fileId: record.id
      }).then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg);
        this.$message.success('删除成功！')
        for (let i = 0; i < this.constTable.length; i++) {
          if (record.id === this.constTable[i].id) {
            this.constTable.splice(i, 1);
          }
        }
      })
    }


  }

  // CBS计量记录(移除事件)
  removeCBS() {
    if (this.selectedRowKeys.length === 0) return this.$message.warn("请选择行");
    let temptInput = [];
    for (let i = 0; i < this.selectedRowKeys.length; i++) {
      const selectTempt = this.selectedRowKeys[i];
      for (let j = 0; j < this.tableDataCBS.length; j++) {
        let cbsTempt = this.tableDataCBS[j];
        if (selectTempt === cbsTempt.id) {
          this.tableDataCBS[j].currentState = "未提交汇总";
          this.tableDataCBS[j].lastPeriod = "";
          this.tableDataCBS[j].lastperiodFk = "";
          temptInput.push(this.tableDataCBS[j]);
        }
      }
    }
    axios
      .post(removeCBSMeasure, {
        projectCode: this.projectCode,
        objList: temptInput
      })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg);
        this.$message.success("移除成功");
        //移除相应行
        for (let key in this.selectedRowKeys) {
          this.tableDataCBS = this.tableDataCBS.filter(
            item => item.id !== this.selectedRowKeys[key]
          );
        }
      })
      .catch(err => {
        this.$message.error("保存失败");
        this.formInit();
      });
  }

  // 点击行事情
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.currentRow = record;
          this.initCBSDetail(this.currentRow.tG04aContractdetailFk, this.projectCode);
        }
      }
    };
  }

  // 保存表单
  saveFormBtn() {
    this.form.remarks = this.desc.remarks;
    axios
      .post(measureTotalInsert, {
        projectCode: this.projectCode,
        objList: [this.form]
      })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg);
        this.$message.success("保存成功");
      })
      .catch(err => {
        this.$message.error("保存失败");
        this.formInit(this.$route.query);
      });
  }

  // 表格行点击变色
  setRowClassName(record, index) {
    let rowColor = index % 2 === 0 ? "evenRowStyl" : "";
    if (record.detailMoney !== 0 && record !== this.currentRow) return 'noEqualToZero'
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }

  // 启动流程
  startProcessBtn() {
    this.form.remarks = this.desc.remarks;
    axios
      .post(measureTotalStartWorkflow, {
        projectCode: this.projectCode,
        objList: [this.form]
      })
      .then(res => {
        this.$message.success(res.errmsg);
        if (res.errcode == 0) return this.form.workflowInstanceId = res.data;
      })
  }

  // 数据同步
  updateContract() {
    if (this.tableDataContract.length === 0) return this.$message.warn("请先导入合同清单");
    this.tableDataContract = [];
    axios
      .get(updateMeasureDetail, {
        params: {
          projectCode: this.projectCode,
          periodId: this.form.id,
          contractNum: this.form.contractNum,
          lastPeriodId: this.form.lastperiodFk == null ? "无上期计量周期" : this.form.lastperiodFk == undefined ? "无上期计量周期" : this.form.lastperiodFk,
          measurePeriod: this.form.measurePeriod
        }
      })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg);
        this.$message.success(res.errmsg);
        let tempt = 0;
        let tempt1 = 0;
        let tempt2 = 0;
        for (let i = 0; i < res.data.length; i++) {
          tempt += Number(res.data[i].detailMoney);
          tempt1 += Number(res.data[i].detailTotalMoney);
          tempt2 += Number(res.data[i].detailPreviousMoney);
        }
        this.form.measureTotalMoney = tempt;
        this.form.totalPeriodMoney = tempt1;
        this.form.lastPeriodMoney = tempt2;
        this.initContract();
      })
  }

  backToNor() {
    this.isLeftFull = false;
    this.isRightFull = false;
    this.leftWidth = 12;
    this.rightWidth = 12;
  }
}
</script>

<style>
.ant-modal-body {
  padding: 14px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.noEqualToZero {
  background: #FF9085;
}
</style>

<style lang="less" scoped>
@import "../data/measure.css";
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

  .form_card {
    width: 100%;
    height: 230px;
    margin-bottom: 5px;
  }

  .left_card {
    margin-top: 3px;
    height: calc(100vh - 350px);
  }

  .right_card {
    margin-top: 3px;
    height: calc(100vh - 350px);
  }
}

.left_table {
  /deep/ .ant-table-body {
    height: calc(100vh - 450px);
  }
}

.right_table {
  /deep/ .ant-table-body {
    height: calc(100vh - 420px) !important;
  }
}

/deep/ .ant-table-placeholder {
  display: none;
  position: relative;
  height: calc(100vh - 440px)
}

/deep/ .ant-table-footer {
  position: relative;
  /* padding: 32px 16px; */
  color: rgba(0, 0, 0, 0.85);
  background: #f3e2bf;
  border-top: 1px solid #e8e8e8;
  border-radius: 0 0 4px 4px;
  height: 60px;
}

.buttonSty {
  margin-left: 10px;
}
</style>
