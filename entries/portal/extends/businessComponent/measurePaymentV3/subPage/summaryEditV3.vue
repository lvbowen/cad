<!--* @Description: 计量汇总（编辑页面）-->
<template>
  <div class="main">
    <a-icon
      type="close"
      @click="close"
      class="close_icon"></a-icon>
    <a-card
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
        size="small">启动流程
      </a-button>
      <a-button
        @click="detailProcessBtn"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small">查看审批过程
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
        size="small">附件
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
        <a-form-model-item label="起始日期">
          <a-input v-model="form.measureStart" disabled/>
        </a-form-model-item>
        <a-form-model-item label="截止日期">
          <a-input v-model="form.measureEnd" disabled/>
        </a-form-model-item>
        <a-form-model-item label="编制人员">
          <a-input v-model="form.createdBy" disabled/>
        </a-form-model-item>
      </a-form-model>
    </a-card>
    <a-card
      class="mid_card"
      title="计量清单明细项"
      size="small">
      <a-button
        :disabled="disable"
        @click="insertContract"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small">导入合同清单
      </a-button>
      <a-button
        :disabled="disable"
        @click="updateContract"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small">数据同步
      </a-button>
      <a-button
        :disabled="disable"
        @click="addMeasure"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small">添加计量
      </a-button>
      <a-button
        :disabled="disable"
        @click="delContract"
        class="buttonSty"
        type="danger"
        slot="extra"
        size="small">清空合同清单
      </a-button>
      <a-table
        v-if="tableDataContract.length!==0"
        rowKey="id"
        class="mid_card"
        :defaultExpandedRowKeys="expandedTableKeys"
        :columns="tableLabelContract"
        :data-source="tableDataContract"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
        :scroll="scrollTableContract"
        :indentSize="10"
        :pagination="false"
        @expand="expandRows">
      </a-table>
    </a-card>
    <a-card
      class="bottom_card"
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
        size="small">一键关联
      </a-button>
      <a-button
        :disabled="disable"
        @click="manuAdd"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small">手动关联
      </a-button>
      <a-button
        :disabled="disable"
        @click="saveCbs"
        class="buttonSty"
        type="primary"
        slot="extra"
        size="small">保存
      </a-button>
      <a-button
        :disabled="disable"
        @click="removeCBS"
        class="buttonSty"
        slot="extra"
        size="small"
        type="danger">移除
      </a-button>
      <a-table
        class="bottom_card"
        :columns="tableLabelCBS"
        :data-source="tableDataCBS"
        :rowSelection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange
        }"
        rowKey="id"
        :rowClassName="changeRightRow"
        :scroll="scrollTableCBS"
        @change="handleTableChange">
        <template slot="footer">
          <template v-for="(v,i) in totalRow">
            <div :key="i" style="width:220px;float: left;margin-top: 1px">
              <span>{{ v.name + ":" + totalMeasure[v.value] }}</span>
            </div>
          </template>
        </template>
        <template slot="操作" slot-scope="text, record">
          <a @click="toDetail(record)">详情</a>
        </template>
      </a-table>
    </a-card>
    <a-modal
      title="添加关联"
      :visible="isCbsShow"
      @ok="measureOk"
      @cancel="measureCancel"
      okText="添加关联"
      cancelText="取消"
      width="1600px"
    >
      <a-table
        rowKey="id"
        :columns="modalLabelCBS"
        :data-source="modalDataCBS"
        :rowSelection="{
          selectedRowKeys:modalKeys,
          onChange:selectChange
        }"
      >
      </a-table>
    </a-modal>
    <!-- 构件详情  -->
    <a-modal
      title="构件详情"
      :visible="isDetailShow"
      @ok="saveOrUpdateMbsRecord()"
      @cancel="()=>{this.isDetailShow=false;}"
      okText="确认"
      width="1000px"
    >
      <a-table
        rowKey="id"
        :columns="detailLabel"
        :data-source="detailData"
        :scroll="{x: 800, y: 350}"
        :rowSelection="{ selectedRowKeys: detailRowKeys, onChange: onDetailChange }">
      </a-table>
    </a-modal>
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

<script lang="ts">
/// <reference path="../../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Vue,} from "vue-property-decorator";
import {Button, Card, Icon, Table, Input, Popconfirm, Modal, FormModel, Upload,} from "@h3/antd-vue";
import EditableCell from "../../measurePayment/data/editTableCell.vue";
import env from '@/config/env';

import * as Api from '../../../service/api';
import * as Type from "../../../type";

@Component({
  name: "summaryEdit",
  components: {
    AIcon: Icon,
    ACard: Card,
    AFormModelItem: FormModel.Item,
    AButton: Button,
    AInput: Input,
    ATable: Table,
    AUpload: Upload,
    AFormModel: FormModel,
    EditableCell,
    APopconfirm: Popconfirm,
    AModal: Modal,
  }
})
export default class allProtect extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  markNum = 0;
  pagination: { [propsName: string]: any } = {
    pageSize: 20, //每页中显示20条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["20", "50", "100", "200"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };
  periodId: string = '';
  totalRow: Array<{ name: string, value: string }> = [
    {name: '施工申报总量 ', value: 'sgAmount'},
    {name: '监理审核总量 ', value: 'jlAmount'},
    {name: '业主核定总量 ', value: 'yzAmount'},
    {name: '施工申报总金额 ', value: 'sgMoney'},
    {name: '监理审核总金额 ', value: 'jlMoney'},
    {name: '业主核定总金额 ', value: 'yzMoney'},
  ];
  totalMeasure: { [propsName: string]: number } = {
    'sgAmount': 0,
    'jlAmount': 0,
    'yzAmount': 0,
    'sgMoney': 0,
    'jlMoney': 0,
    'yzMoney': 0
  };
  expandedTableKeys: Array<string> = [];
  //  table样式
  scrollTableContract: { x: number; y: number } = {x: 1650, y: 250};
  scrollTableCBS: { x: number; y: number } = {x: 1650, y: 340};
  currentRow: null | { [propsName: string]: string | number } = null;
  disable: boolean = false;
  labelCol: object = {span: 8};
  isCbsShow: boolean = false;
  selectedRowKeys: Array<string> = [];
  params: object = {};
  projectCode: string = "";
  tableDataCBS: Array<{ [propsName: string]: string | number }> = [];
  tableLabelCBS: Array<{ [propsName: string]: any }> = [  // 表头数据
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
    // {
    //   align: "center",
    //   title: "状态",
    //   key: "currentState",
    //   dataIndex: "currentState",
    //   filters: [
    //     {
    //       text: "已提交汇总",
    //       value: "已提交汇总"
    //     },
    //     {
    //       text: "未提交汇总",
    //       value: "未提交汇总"
    //     }
    //   ],
    //   onFilter: (value, record) => record.currentState.indexOf(value) === 0
    // },
    {
      align: "center",
      title: "计量期号",
      width: '4%',
      key: "tg04cCbscommoninfosFk",
      dataIndex: "tg04cCbscommoninfosFk"
    },
    // {
    //   align: "center",
    //   title: "创建日期",
    //   key: "createdTime",
    //   dataIndex: "createdTime"
    // },
    // {
    //   align: "center",
    //   title: "备注",
    //   key: "remarks",
    //   dataIndex: "remarks",
    //   scopedSlots: {customRender: "remarks"}
    // }
    {
      align: "center",
      title: "构件",
      key: "操作",
      dataIndex: "操作",
      width: '3%',
      scopedSlots: {customRender: "操作"}
    }
  ];
  tableLabelContract: Array<{ [propsName: string]: any }> = [
    // 表头数据
    {
      align: "left",
      title: "CBS编码",
      key: "ccbs",
      dataIndex: "ccbs",
      width: '9.5%'
    },
    {
      align: "center",
      title: "清单项编码",
      key: "clistCode",
      dataIndex: "clistCode",
      width: '5%'
    },
    {
      align: "center",
      title: "名称",
      width: "9%",
      key: "clistName",
      dataIndex: "clistName"
    },
    {
      align: "center",
      title: "单位",
      width: "2.2%",
      key: "clistUnit",
      dataIndex: "clistUnit"
    },
    {
      align: "center",
      title: "单价",
      key: "clistUnitPrice",
      width: "3.5%",
      dataIndex: "clistUnitPrice"
    },
    {
      align: "center",
      title: "数量",
      width: "4.5%",
      key: "clistAmount",
      dataIndex: "clistAmount"
    },
    {
      align: "center",
      title: "合价",
      key: "clistTotalPrice",
      dataIndex: "clistTotalPrice"
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
      width: "7%",
    },
    {
      align: "center",
      title: "类别",
      key: "clistClass",
      width: '4.8%',
      dataIndex: "clistClass"
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
    // {
    //   align: "center",
    //   title: "本年累计工程量",
    //   width: '6%',
    //   key: "yearAmount",
    //   dataIndex: "yearAmount"
    // },
    // {
    //   align: "center",
    //   title: "本年累计工程款",
    //   width: '6%',
    //   key: "yearMoney",
    //   dataIndex: "yearMoney"
    // },
  ];
  tableDataContract: Array<{ [propsName: string]: string | number }> = [];
  modalLabelCBS: Array<{ [propsName: string]: any }> = [  // 表头数据
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
      title: "创建日期",
      key: "createdTime",
      dataIndex: "createdTime"
    },
    // {
    //   align: "center",
    //   title: "备注",
    //   key: "remarks",
    //   dataIndex: "remarks",
    //   scopedSlots: {customRender: "remarks"}
    // }
  ];
  modalDataCBS: Array<{ [propsName: string]: string | number }> = [];
  wrapperCol: object = {span: 16};
  form: { [propsName: string]: string | number } = {}
  modalKeys: Array<string> = [];
  modalRow: Array<{ [propsName: string]: string | number }> = [];
  cbsRows: Array<{ [propsName: string]: string | number }> = [];


  detailLabel: Array<{ [propsName: string]: any }> = [
    {
      title: '序号',
      align: "center",
      width: "4%",
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      align: "center",
      title: "构件编码",
      key: "mbsCode",
      dataIndex: "mbsCode"
    },
    {
      align: "center",
      title: "构件名称",
      key: "mbsName",
      dataIndex: "mbsName"
    },
    {
      align: "center",
      title: "最新计量时间",
      key: "createdTime",
      dataIndex: "createdTime"
    },
  ];
  detailData: Array<{ [propsName: string]: string | number }> = [];
  isDetailShow: boolean = false;
  detailRowKeys: Array<string> = [];
  detailRecord: Array<{ [propsName: string]: string | number }> = [];
  cbsMeasureId: string = '';

  isFileShow: boolean = false;
  fileLabel: Array<{ [propsName: string]: any }> = [
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
  fileData: Array<{ [propsName: string]: string | number }> = [];
  constTable: Array<{ [propsName: string]: string | number }> = [];
  action: string = `${env.apiHost}/api/aliyun/upload`;
  headers: any = {Authorization: 'Bearer ' + localStorage.token};


  mounted() {
    this.currentRow = null;
    if (Number(this.$route.query.symbol) == 1) {
      //支付汇总-支付明细-明细转入
      this.projectCode = this.$route.query.project as string;
      this.periodId = this.$route.query.id as string;
      this.disable = true;
    } else {
      //或计量支付界面转入
      this.projectCode = this.$route.query.project as string;
      this.periodId = this.$route.query.id as string;
    }
    //表单
    this.formInit();
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

  // 一键关联(CBS计量表)
  autoAdd() {
    Api.selectAllCBSMeasureV3({
      schemaId: this.$route.query.schema_id as string,
      periodId: this.$route.query.id as string,
      periodName: this.$route.query.measurePeriod as string,
      projectCode: this.projectCode
    }).then(res => {
      this.$message.success(res.errmsg as string);
      if (res.errcode === 0) return this.updateContract();
    })
  }

  addMeasure() {
    if (!this.currentRow) return;
    Api.getCbsToMeasureV3({
      projectCode: this.projectCode,
      projectName: this.projectConfig?.projectName ?? "",
      cbsCode: this.currentRow.ccbs as string,
      schemaId: this.currentRow.tg04aContractschemeFk as string,
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      this.tableDataCBS = this.tableDataCBS.concat(res.data);
      this.$message.info(res.errmsg as string);
    })
  }

  changeRightRow(record, index) {
    let rowColor: string = '';
    if (!record.hasSave) {
      rowColor = 'yellowRow';
    } else {
      rowColor = ''
    }
    return rowColor;
  }

  // 关闭编辑界面
  close() {
    if (Number(this.$route.query.symbol) == 1) {
      let routeMessage = {};
      this.$set(routeMessage, "symbol", 1);
    }
    this.$router.go(-1);
  }

  // 清空合同清单事件
  delContract() {
    if (this.tableDataContract.length === 0) return this.$message.warn("合同清单已经为空！");
    Api.deleteMeasureDetailV3({
      projectCode: this.projectCode ?? '',
      periodId: this.form.id as string
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success(res.errmsg as string);
        this.tableDataContract = []
      })
  }

  // 查看审批过程
  detailProcessBtn() {
    const url =`/form/detail?workflowInstanceId=${this.form.workflowInstanceId}`;
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
    let _this = this;
    return new Promise((resolve) => {
      if (c.children && c.children.length != 0) { // 有值了直接渲染
        //@ts-ignore
        resolve()
        return
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      Api.getMeasureDetailChildsV3({
        projectCode: this.projectCode,
        periodId: this.periodId,
        parentId: c.id as string,
        schemaId: c.tg04aContractschemeFk as string,
        projectName: this.projectConfig?.projectName ?? ''
      })
        .then((res) => {
          c["children"] = res.data;
          this.editListTree(_this.tableDataContract, c.id, c);
        })
      //@ts-ignore
      resolve()
    })
  }

  // 表单初始化(第一个card)
  formInit() {
    Api.getMeasurePeriod({
      projectCode: this.projectCode,
      id: this.periodId
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.form = res.data;
      this.form.measureStart = String(this.form.measureStart).slice(0, 10);
      this.form.measureEnd = String(this.form.measureEnd).slice(0, 10);
      this.initContract();
    })
  }

  handleTableChange(pagination) {
    this.pagination.current = pagination.current;
    this.pagination.pageSize = pagination.pageSize;
    this.initCBSDetail(this.currentRow?.ccbs as string, this.projectCode, this.currentRow?.['schema_id'] as string);
  }

  // CBS表格初始化
  initCBSDetail(id: string, code: string, schemaId: string) {
    this.selectedRowKeys = [];
    this.tableDataCBS = [];
    this.totalMeasure = {};
    Api.getByCBSAndPeriodPageV3({
      projectCode: code,
      cbsCode: id,
      periodId: this.form.id as string,
      schemaId: schemaId,
    }).then(res => {
      if (res.errcode !== 0) return;
      const resData = res.data.dataList;
      if (!resData || resData.length === 0) return;
      this.totalMeasure = res.data.totalMeasure;
      this.tableDataCBS = resData;
    })
  }

  // 计量清单明细项表格初始化（页面中间表格）
  initContract() {
    this.expandedTableKeys.length = 0
    Api.getMeasureDetailChildsV3({
      projectCode: this.projectCode,
      periodId: this.periodId,
      parentId: '',
      schemaId: this.form.schema_id as string,
      projectName: this.projectConfig?.projectName ?? ''
    }).then(res => {
      if (res.errcode !== 0) return;
      this.tableDataContract = res.data;
      for (let i = 0; i < this.tableDataContract.length; i++) {
        this.expandedTableKeys.push(String(this.tableDataContract[i].id))
      }
    })
  }

  // 导入合同清单
  insertContract() {
    if (this.tableDataContract.length !== 0) return this.$message.warn("请清空合同清单！");
    Api.importMeasureDetailV3({
      projectCode: this.projectCode as string,
      measurePeriodId: this.form.id as string,
      lastMeasurePeriodId: this.form.lastperiodFk as string,
      contractNum: this.form.contractNum as string,
      schemaId: this.form.schema_id as string,
      projectName: this.projectConfig?.projectName ?? ''
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success(res.errmsg as string);
        this.tableDataContract = res.data;
      })
  }

  // 手动关联（跳转中间计量编辑界面）
  manuAdd() {
    if (!this.currentRow) return this.$message.warn("请选择计量清单明细项！");
    Api.getUnrelateByCBSV3({
      projectCode: this.projectCode,
      schemaId: this.form.schema_id as string,
      cbsCode: this.currentRow.ccbs as string
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      this.modalDataCBS = res.data;
      if (this.modalDataCBS.length === 0) return this.$message.info('暂无中间计量记录');
      this.isCbsShow = true;
    })
  }

  measureOk() {
    Api.selectCBSMeasureV3({
      projectCode: this.projectCode,
      cbsMeasureIdList: this.modalKeys,
      periodId: this.$route.query.id as string,
      periodName: this.$route.query.measurePeriod as string,
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('添加失败');
      this.$message.success('添加成功');
      this.tableDataCBS = this.tableDataCBS.concat(this.modalRow);
      // this.initCBSDetail(this.currentRow?.['tG04aContractdetailFk'] as string, this.projectCode, this.currentRow?.['schema_id'] as string);
      this.isCbsShow = false;
    })
  }

  measureCancel() {
    this.isCbsShow = false;
  }

  //搜索
  onSearch(value: string) {
    this.selectedRowKeys = [];
    this.tableDataCBS = [];
    Api.getByCBSAndPeriodPageV3({
      projectCode: this.projectCode,
      cbsCode: this.currentRow?.ccbs as string,
      periodId: this.periodId,
      schemaId: this.form.schema_id as string,
      like: value
    }).then(res => {
      if (res.errcode !== 0) return
      const resData = res.data.dataList;
      if (!resData || resData.length === 0) return;
      this.tableDataCBS = resData;
    })
  }

  // 表格多选
  onSelectChange(selectedRowKeys, info) {
    this.selectedRowKeys = selectedRowKeys;
    this.cbsRows = info;
  }

  onDetailChange(keys, info) {
    this.detailRowKeys = keys;
    this.detailRecord = info;
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
      periodId: this.form.id as string,
    }).then(res => {
      this.constTable = res.data;
    })
  }

  importChange(info) {
    const _this = this;
    if (info.file.status === 'uploading') {
    } else if (info.file.status === 'done') {
      if (info.file.response.errcode !== 0) return;
      _this.$message.error(`${info.file.response.errmsg} ,导入失败.`);
      //@ts-ignore
      _this.fileData.push(info.file.response.data);
      //@ts-ignore
      _this.constTable.push(info.file.response.data);
    } else if (info.file.status === 'error') {
      _this.$message.error(`${info.file.name} 导入失败.`);
    } else {
      _this.$message.error("导入异常")
    }
  }

  saveFile() {
    Api.uploadFileMeasure({
      periodId: this.form.id as string,
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
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
        this.$message.success('删除成功！')
        for (let i = 0; i < this.constTable.length; i++) {
          if (record.id === this.constTable[i].id) {
            this.constTable.splice(i, 1);
          }
        }
      })
    }


  }

  outputReportBtn() {
    console.log('outputReportBtn',this.$route.query)
    window.open(`${env.host}/RDP-SERVER/rdppage/main/f0d73158b62c8274c662859ec466c94a?xmjc_1=${this.$route.query.xmjc_1}&ContractNum=${this.$route.query.contractNum}&MeasurePeriod=${this.$route.query.measurePeriod}`)
  }

  // CBS计量记录(移除事件)
  removeCBS() {
    if (this.selectedRowKeys.length === 0) return this.$message.warn("请选择行");
    Api.removeCBSMeasureV3({
      projectCode: this.projectCode,
      cbsMeasureIdList: this.selectedRowKeys,
      periodId: this.$route.query.id as string,
      periodName: this.$route.query.measurePeriod as string,
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success("移除成功");
        //移除相应行
        for (let key in this.selectedRowKeys) {
          this.tableDataCBS = this.tableDataCBS.filter(
            item => item.id != this.selectedRowKeys[key]
          );
        }
      })
  }

  // 点击行事情
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.currentRow = record;
          this.initCBSDetail(this.currentRow?.ccbs as string, this.projectCode, this.currentRow?.['tg04aContractschemeFk'] as string);
        }
      }
    };
  }

  saveCbs() {
    Api.insertV3({
      objList: this.cbsRows,
      projectCode: this.projectCode,
      periodId: this.$route.query.id as string,
      periodName: this.$route.query.measurePeriod as string,
    }).then(res => {
      this.$message.info(res.errmsg as string);
      this.initCBSDetail(this.currentRow?.ccbs as string, this.projectCode, this.currentRow?.['tg04aContractschemeFk'] as string);
    })
  }

  // 保存表单
  saveFormBtn() {
    Api.measureTotalInsert({
      projectCode: this.projectCode,
      objList: [this.form]
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success("保存成功");
      })
  }

  saveOrUpdateMbsRecord() {
    Api.saveOrUpdateMbsRecordV3({
      appCode: this.projectCode,
      cbsMeasureId: this.cbsMeasureId,
      mbsRecordList: this.detailRecord,
      schemaId: this.currentRow?.tg04aContractschemeFk as string
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      this.$message.success(res.errmsg as string);
      this.isDetailShow = false;
      this.detailRowKeys = [];
      this.detailData = [];
      this.detailRecord = [];
      this.cbsMeasureId = '';
    })
  }

  selectChange(keys, info) {
    this.modalKeys = keys;
    this.modalRow = info;
  }

  // 表格行点击变色
  setRowClassName(record, index) {
    let rowColor = index % 2 === 0 ? "evenRowStyl" : "";
    if (record.detailMoney !== 0 && record !== this.currentRow) return 'noEqualToZero'
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }

  // 启动流程
  startProcessBtn() {
    Api.measureTotalStartWorkflow({
      projectCode: this.projectCode,
      objList: [this.form]
    })
      .then(res => {
        if (res.errcode !== 0) return
        this.$message.success(res.errmsg as string);
        this.form.workflowInstanceId = res.data;
      })
  }

  toDetail(record) {
    this.detailData = [];
    this.isDetailShow = true;
    this.cbsMeasureId = record.id;
    this.detailRowKeys = [];
    Api.getMbsRecordV3({
      projectName: this.projectConfig?.projectName ?? '',
      cbsMeasureId: record.id as string,
      projectCode: this.projectCode,
      schemaId: record.schemaId as string,
      cbsQbsCode: record.cbs as string
    }).then(res => {
      if (!res.data || res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      this.detailData = res.data;
      for (let i = 0; i < this.detailData.length; i++) {
        if (this.detailData[i].checked) {
          this.detailRowKeys.push(this.detailData[i].id as string);
        }
      }
    })
  }

  // 数据同步
  updateContract() {
    if (this.tableDataContract.length === 0) return this.$message.warn("请先导入合同清单");
    this.tableDataContract = [];
    Api.updateMeasureDetailV3({
      projectCode: this.projectCode,
      periodId: this.form.id as string,
      schemaId: this.form.schema_id as string,
      lastPeriodId: !this.form.lastperiodFk ? "无上期计量周期" : this.form.lastperiodFk as string,
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        let tempt = 0;
        let tempt1 = 0;
        let tempt2 = 0;
        if (!res.data || res.data.length === 0) return;
        for (let i = 0; i < res.data.length; i++) {
          tempt += Number(res.data[i]?.detailMoney);
          tempt1 += Number(res.data[i]?.detailTotalMoney);
          tempt2 += Number(res.data[i]?.detailPreviousMoney);
        }
        this.form.measureTotalMoney = tempt;
        this.form.totalPeriodMoney = tempt1;
        this.form.lastPeriodMoney = tempt2;
        this.initContract();
      })
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

  .form_card {
    width: 100%;
    height: 94px;
    //margin-bottom: 5px;
  }

  .mid_card {
    height: calc(50vh - 110px);
  }

  .bottom_card {
    height: calc(50vh - 110px);
  }
}

.mid_card {
  /deep/ .ant-table-body {
    height: calc(50vh - 200px);
  }
}

.bottom_card {
  /deep/ .ant-table-body {
    height: calc(50vh - 280px);
  }
}

/deep/ .ant-table-placeholder {
  display: none;
  position: relative;
  height: calc(100vh - 440px)
}

/deep/ .ant-table-footer {
  position: relative;
  ///* padding: 32px 16px; */
  padding: 4px 16px;
  color: rgba(0, 0, 0, 0.85);
  background: #f3e2bf;
  border-top: 1px solid #e8e8e8;
  border-radius: 0 0 4px 4px;
  height: 30px;
}

.buttonSty {
  margin-left: 10px;
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

/deep/ .noEqualToZero {
  background: #ff8585;
}

/deep/ .ant-modal-body {
  padding: 14px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

/deep/ .yellowRow {
  background-color: #f1e0a2 !important;
}

/deep/ .ant-table-tbody > tr > td {
  padding: 5px 3px;
}

/deep/ .ant-table-thead > tr > th {
  padding: 10px 3px;
}
</style>
