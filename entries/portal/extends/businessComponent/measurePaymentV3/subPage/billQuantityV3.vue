<template>
  <div class="main">
    <a-icon type="close" @click="close" class="close_icon"></a-icon>
    <a-row :gutter="16">
      <a-col :span="5">
        <a-card title="部位码" class="left_tree" size="small">
          <a-tree
            v-if="treeData.length!==0"
            :defaultExpandAll="true"
            :key="treeKey"
            :treeData="treeData"
            :replaceFields="replaceFields"
            @select="treeSelect"
          />
        </a-card>
      </a-col>
      <a-col :span="19">
        <!-- 工程量清单明细 表格-->
        <a-card title="工程量清单明细" class="rightTop" size="small">
          <a-button
            @click="clearAllBtn"
            class="buttonSty"
            slot="extra"
            type="danger"
            size="small">清空
          </a-button>
          <a-button
            @click="addMoreBtn"
            slot="extra"
            type="primary"
            style="margin-left: 10px"
            size="small"
          >批量关联
          </a-button>
          <a-button
            @click="addRootBtn"
            class="buttonSty"
            slot="extra"
            type="primary"
            size="small">增加根节点
          </a-button>
          <a-button
            @click="updateBtn"
            class="buttonSty"
            slot="extra"
            type="primary"
            size="small">数据同步
          </a-button>
          <a-button
            @click="() => {this.isExcelVisible = true;}"
            class="buttonSty"
            slot="extra"
            type="primary"
            size="small">EXCEL导入
          </a-button>
          <a-table
            v-if="tableDataContract.length!==0"
            :defaultExpandedRowKeys="expandedTableKeys"
            :columns="tableLabelContract"
            :data-source="tableDataContract"
            :customRow="rowClick"
            :rowClassName="setRowClassName"
            :scroll="{x: 1300, y: 490}"
            :indentSize="10"
            :pagination="false"
            :rowSelection="{ selectedRowKeys: contractRowKeys, onChange: onContractChange }"
          >
            <span slot="操作" slot-scope="record">
              <a-icon type="plus-square" theme="twoTone" @click="() => addRow(record)"/>
              <a-divider type="vertical" style="padding-left: 2%"/>
              <a-icon type="delete" theme="twoTone" @click="() => delRow(record)"/>
            </span>
          </a-table>
        </a-card>
        <a-card title="关联细项" class="rightBottom" size="small">
          <a-button
            slot="extra"
            type="primary"
            @click="saveCBSBtn"
            class="buttonSty"
            style="margin-left: 0"
            size="small"
          >保存
          </a-button>
          <a-button
            @click="setNumber"
            slot="extra"
            type="primary"
            style="margin-left: 10px"
            size="small"
          >批量设置数量
          </a-button>
          <a-button
            slot="extra"
            @click="() => {this.isShowConfirm = true;this.prompt = '确认删除所选项吗？(已选择' + this.selectedRowKeys.length + '项)';}"
            type="danger"
            class="buttonSty"
            size="small"
          >删除
            <a-popconfirm
              :title="prompt"
              :visible="isShowConfirm"
              okText="确认"
              cancelText="取消"
              @confirm="confirm"
              @cancel="cancel">
            </a-popconfirm>
          </a-button>
          <a-table
            :key="cbsKey"
            :columns="tableLabelCBS"
            :data-source="tableDataCBS"
            :pagination="pagination"
            @change="handleTableChange"
            :loading="loading"
            :rowSelection="{
              selectedRowKeys: selectedRowKeys,
              onChange: onSelectChange
            }"
            :scroll="{x: 1000, y: 530}"
          >
            <template v-for="item in columnCBS" :slot="item" slot-scope="text, record">
              <div :key="item">
                <editable-cell :text="text" @change="onCellChangeCBS(record.id, item, $event)"/>
              </div>
            </template>
            <template slot="操作" slot-scope="text, record">
              <a @click="toDetail(record)">详情</a>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
    <!-- modal宽度属性写在style中不奏效 -->
    <!-- 编辑表格行弹窗   -->
    <a-modal
      :title="modalTitle"
      :visible="isModalShow"
      @ok="modalOk"
      @cancel="modalCancel"
      width="1500px"
    >
      <a-table :columns="modalLabel" :data-source="modalData" :rowClassName="setRowClassName">
        <template v-for="item in columnContract" :slot="item" slot-scope="text, record">
          <div :key="item">
            <editable-cell :text="text" @change="onCellChange(record.id, item, $event)"/>
          </div>
        </template>
        <template slot="listClass" slot-scope="text, record">
          <a-select
            :defaultValue="record.listClass"
            style="width: 120px"
            @change="modeChange(record.id, 'listClass', $event)"
          >
            <a-select-option v-for="d in modeData" :key="d.value" :value="d.value">{{ d.text }}</a-select-option>
          </a-select>
        </template>
      </a-table>
    </a-modal>
    <!-- 批量操作 右侧点击批量设置数量弹窗 -->
    <a-modal
      title="批量设置CBS数量"
      :visible="isMBSVisible"
      @ok="handleOk"
      @cancel="handleCancel">
      CBS数量：
      <a-input-number
        id="inputNumber"
        v-model="cbsNumber"
        @change="onChange"
        :min="0"/>
    </a-modal>
    <!-- 工程量清单表格 导入EXCEL数据 -->
    <a-modal
      title="导入数据"
      :visible="isExcelVisible"
      @ok="importExcel"
      @cancel="importCancel"
      okText="确认"
    >
      <a-form>
        <p class="ant-upload-text" style="float:left">
          为确保上传数据与列表内容匹配，请先下载
        </p>
        <a style="float:left" @click="downLoad">示例文件</a>
        <br/>
        <a-upload
          name="file"
          :multiple="false"
          :headers="headers"
          :action="urlContract"
          :data="dataContract"
          accept=".xlsx, .xls"
          @change="handleChange"
        >
          <a-button>
            <a-icon type="upload"/>
            点击上传
          </a-button>
        </a-upload>
        <a-upload-dragger
          name="file"
          :multiple="false"
          :headers="headers"
          :action="urlContract"
          :data="dataContract"
          accept=".xlsx, .xls"
          @change="handleChange"
        >
          <p class="ant-upload-drag-icon">
            <a-icon type="inbox"/>
          </p>
          <p class="ant-upload-text">
            拖拽到此处上传
          </p>
          <p style="font-size:12px;float:left">
            支持.xlsx格式，文件大小不限
          </p>
          <p style="color:red;font-size:10px;float:left">
            不支持导入流程数据，导入前请仔细核对!
          </p>
        </a-upload-dragger>
      </a-form>
    </a-modal>
    <!-- 关联细项(详情)-->
    <a-modal
      title="关联细项详情"
      :visible="isDetailShow"
      @ok="()=>{this.isDetailShow=false}"
      @cancel="()=>{this.isDetailShow=false;}"
      okText="确认"
      width="1000px"
    >
      <a-table
        rowKey="id"
        :columns="detailLabel"
        :data-source="detailData"
        :scroll="{x: 800, y: 350}">
      </a-table>
    </a-modal>
  </div>
</template>

<script lang="ts">
/// <reference path="../../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import {
  Button, Card, Col, Divider, Icon, Input, InputNumber,
  Modal, Popconfirm, Row, Select, Table, Tree, Form
} from "@h3/antd-vue";
import {delListTree, timeDefault} from "../../measurePayment/data/util";
import {v4 as uuidv4} from "uuid";
import EditableCell from "../../measurePayment/data/editTableCell.vue";
import env from '@/config/env';
import * as Api from "../../../service/api";

@Component({
  name: "billQuantityV3",
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    AInputNumber: InputNumber,
    ARow: Row,
    ATree: Tree,
    ACol: Col,
    AIcon: Icon,
    ACard: Card,
    AButton: Button,
    AInput: Input,
    ATable: Table,
    AForm: Form,
    ADivider: Divider,
    EditableCell,
    APopconfirm: Popconfirm,
    AModal: Modal
  }
})
export default class billQuantityV3 extends Vue {
  @InjectReactive('project') projectCode;

  @InjectReactive('projectConfig') projectConfig;

  expandedTableKeys: Array<string> = [];
  cbsToRelateList: Array<{ [propsName: string]: string | number }> = [];
  tableLabelCBS: Array<{ [propsName: string]: any }> = [
    // 表头数据
    {
      align: "center",
      title: "CBS编码",
      key: "cbsCode",
      dataIndex: "cbsCode",
      width: '15%'
    },
    {
      align: "center",
      title: "部位码",
      key: "qbsCode",
      dataIndex: "qbsCode",
      width: '15%'
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
      key: "qbsName",
      dataIndex: "qbsName",
      scopedSlots: {customRender: "qbsName"},
      width: '16%'
    },
    {
      align: "center",
      title: "单价",
      key: "unitPrice",
      dataIndex: "unitPrice",
      scopedSlots: {customRender: "unitPrice"},
      width: '9%'
    },
    {
      align: "center",
      title: "数量",
      key: "amount",
      dataIndex: "amount",
      scopedSlots: {customRender: "amount"}
    },
    {
      align: "center",
      title: "合价",
      key: "totalPrice",
      dataIndex: "totalPrice",
      render: (text, record, index) => {
        return record['unitPrice'] * record['amount'];
      }
    },
    {
      align: "center",
      title: "备注",
      key: "remark",
      dataIndex: "remark",
      width: "10%",
      scopedSlots: {customRender: "remark"}
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      dataIndex: "操作",
      width: "3.5%",
      scopedSlots: {customRender: "操作"}
    }
  ];
  modalLabel: Array<{ [propsName: string]: any }> = [
    {
      align: "center",
      title: "CBS编码",
      key: "cbs",
      dataIndex: "cbs",
      scopedSlots: {customRender: "cbs"}
    },
    {
      align: "center",
      title: "清单项编码",
      key: "listCode",
      dataIndex: "listCode",
      scopedSlots: {customRender: "listCode"}
    },
    {
      align: "center",
      title: "清单项名称",
      key: "listName",
      dataIndex: "listName",
      width: "15",
      scopedSlots: {customRender: "listName"}
    },
    {
      align: "center",
      title: "单位",
      key: "listUnit",
      dataIndex: "listUnit",
      scopedSlots: {customRender: "listUnit"}
    },
    {
      align: "center",
      title: "单价",
      key: "listUnitPrice",
      dataIndex: "listUnitPrice",
      scopedSlots: {customRender: "listUnitPrice"}
    },
    {
      align: "center",
      title: "清单项数量",
      key: "listAmount",
      dataIndex: "listAmount",
      scopedSlots: {customRender: "listAmount"}
    },
    {
      align: "center",
      title: "清单项合价",
      key: "listTotalPrice",
      dataIndex: "listTotalPrice",
      scopedSlots: {customRender: "listTotalPrice"},
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
      title: "清单项类别",
      width: "15%",
      key: "listClass",
      dataIndex: "listClass",
      scopedSlots: {customRender: "listClass"}
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
      dataIndex: "remarks",
      scopedSlots: {customRender: "remarks"}
    }
  ];
  tableLabelContract: Array<{ [propsName: string]: any }> = [
    // 表头数据
    {
      align: "left",
      title: "CBS编码",
      key: "cbs",
      dataIndex: "cbs",
      width: "9%",
      scopedSlots: {customRender: "cbs"}
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
      dataIndex: "listName",
      width: "10%",
    },
    {
      align: "center",
      title: "单位",
      key: "listUnit",
      width: "2.8%",
      dataIndex: "listUnit",
    },
    {
      align: "center",
      title: "单价",
      key: "listUnitPrice",
      dataIndex: "listUnitPrice",
    },
    {
      align: "center",
      title: "清单项数量",
      key: "listAmount",
      dataIndex: "listAmount",
    },
    {
      align: "center",
      title: "清单项合价",
      width: "6%",
      key: "listTotalPrice",
      dataIndex: "listTotalPrice",
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
      dataIndex: "listClass",
    },
    {
      align: "center",
      title: "已关联合价",
      key: "relatedTotalPrice",
      dataIndex: "relatedTotalPrice"
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      width: '4.5%',
      scopedSlots: {customRender: "操作"}
    }
  ];
  detailLabel: Array<{ [propsName: string]: any }> = [
    {
      align: "center",
      title: "构件编码",
      key: "modelCode",
      dataIndex: "modelCode"
    },
    {
      align: "center",
      title: "构件名称",
      key: "name",
      dataIndex: "name"
    },
  ];
  detailData: Array<{ [propsName: string]: string | number }> = [];
  isDetailShow: boolean = false;
  contractRowKeys: Array<string> = [];
  dataContract: { [propsName: string]: string } = {
    projectCode: "",
    schemeId: ""
  };
  headers: { authorization: string, "Access-Token-PC": string | null } = {
    authorization: "authorization-text",
    "Access-Token-PC": localStorage.getItem("token")
  };
  urlContract: string = `${env.apiHost}/api/measurePayment/contractDetail/uploadExcel`;

  cbsNumber: number = 0;
  columnCBS: Array<string> = ["qbsName", "amount", "remark"];
  columnContract: Array<string> = [
    "cbs",
    "listCode",
    "listName",
    "listUnit",
    "changeAmount",
    "listUnitPrice",
    "listAmount",
    "remarks"
  ];
  cbsKey: number = 0;

  currentRow: null | { [propsName: string]: string | number } = null;
  isExcelVisible: boolean = false;
  isMBSVisible: boolean = false;
  isModalShow: boolean = false;
  isShowConfirm: boolean = false;

  loading: boolean = false;
  MBSIdentifier: number = 0;
  detailId: string = "";
  modalData: Array<{ [propsName: string]: string | number }> = [];
  modalTitle: string = "";
  modeData: Array<{ [propsName: string]: string | number }> = [];
  pagination: { total: number; current: number; pageSizeOptions: string[]; showTotal: (total) => string; pageSize: number; showSizeChanger: boolean } = {
    pageSize: 100, //每页中显示50条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["100", "200", "400", "600"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };
  prompt: string = "";
  replaceFields: object = {
    key: "id",
    title: "qbsName",
    children: 'childs'
  };
  selectedRowKeys: Array<string> = [];// Check here to configure the default column
  schemeId: string = "";
  tableDataContract: Array<{ [propsName: string]: string | number }> = [];
  tableDataCBS: Array<{ [propsName: string]: string | number }> = [];
  treeData: Array<{ [propsName: string]: string | number }> = [];
  treeKey: number = 0;
  treeChoose: { [propsName: string]: string | number } | null = null;

  mounted() {
    //获取信息
    this.schemeId = this.$route.query.id as string;
    //清单细项
    this.initContractDetail(this.schemeId, this.projectCode);
    //MBS编码树
    this.initMBS();
    this.dataContract.projectCode = this.projectCode;
    this.dataContract.schemeId = this.schemeId;
  }

  // 批量关联（mbs）
  addMoreBtn() {
    if (!this.treeChoose) return this.$message.warn('请选择部位码！')
    // 根据选择的节点获取子节点并插入右侧表格
    Api.createQbsCbsRelateV3({
      cbsToRelateList: this.cbsToRelateList,//表格所有子节点
      projectCode: this.projectCode ?? '',
      qbsDTO: this.treeChoose,//树的点击行
      schemaId: this.schemeId
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string)
      this.initCBSDetail(this.currentRow?.['tg04aContractschemeFk'] as string, this.projectCode, this.currentRow?.['cbs'] as string);
      this.$message.success("成功添加至数据库");
    })
  }

  // 添加根节点
  addRootBtn() {
    let temptUuid = uuidv4();
    const uuid = temptUuid.split("-").join("");
    let newRow = {
      id: uuid,
      key: uuid,
      createdTime: timeDefault(),
      tG04aContractschemeFk: this.schemeId,
      cbs: "",
      createdDeptId: "",
      creater: "",
      listAmount: 0,
      listClass: "",
      listCode: "",
      listLayerType: "",
      listName: "",
      listTotalPrice: 0,
      listUnit: "",
      listUnitPrice: 0,
      modifiedTime: "",
      modifier: "",
      name: "",
      owner: "",
      changeAmount: 0,
      finalTotalAmount: 0,
      finalTotalPrice: 0,
      ownerDeptId: "",
      ownerDeptQueryCode: "",
      relatedAmount: 0,
      relatedTotalPercent: 0,
      relatedTotalPrice: 0,
      remarks: ""
    };
    this.isModalShow = true;
    this.modalTitle = "新增根节点";
    this.modalData.unshift(newRow);
  }

  // 添加子节点
  addRow(record) {
    this.isModalShow = true;
    this.modalTitle = "新增子节点";
    let temptUuid = uuidv4();
    let uuid = temptUuid.split("-").join("");
    let newRow = {
      id: uuid,
      key: uuid,
      createdTime: timeDefault(),
      tG04aContractschemeFk: this.schemeId,
      tG04aContractdetailFk: record.id,
      cbs: "",
      createdDeptId: "",
      creater: "",
      listAmount: 0,
      listClass: "",
      listCode: "",
      listLayerType: "",
      listName: "",
      listTotalPrice: 0,
      listUnit: "",
      listUnitPrice: 0,
      modifiedTime: "",
      modifier: "",
      name: "",
      owner: "",
      changeAmount: 0,
      finalTotalAmount: 0,
      finalTotalPrice: 0,
      ownerDeptId: "",
      ownerDeptQueryCode: "",
      relatedAmount: 0,
      relatedTotalPercent: 0,
      relatedTotalPrice: 0,
      remarks: ""
    };
    this.modalData.unshift(newRow);
  }

  // 批量设置
  batchSetAmount(data) {
    for (let i = 0; i < this.tableDataCBS.length; i++) {
      for (let j = 0; j < this.selectedRowKeys.length; j++) {
        if (this.tableDataCBS[i].id === this.selectedRowKeys[j]) {
          this.tableDataCBS[i].amount = data;
          //@ts-ignore
          this.tableDataCBS[i].totalPrice = this.tableDataCBS[i].unitPrice * this.tableDataCBS[i].amount;
        }
      }
    }
    this.saveCBSBtn();
    this.cbsKey += 1;
  }

  cancel() {
    if (this.MBSIdentifier == 0) {
      this.isShowConfirm = false;
    }
    this.$message.error("取消删除");
  }

  confirm() {
    if (this.MBSIdentifier == 0) {
      this.isShowConfirm = false;
    }
    this.delCBSRow();
  }

  clearAllBtn() {
    Api.deleteAllContractDetail({projectCode: this.projectCode, schemaId: this.schemeId}).then(res => {
      if (res.errcode === 0) this.tableDataContract = [];
    })
  }

  close() {
    this.$router.go(-1);
  }

  //示例文件下载 工程量清单明细表格
  downLoad() {
    //不写{ responseType: 'arraybuffer'}，获取到的是乱码且Excel文件打不开
    Api.exportTemplate({
        queryCode: this.projectCode + "_T_G_ContrDeta" as string,
        schemaCode: this.projectCode + "_T_G_ContrDeta" as string
      }
    ).then(res => {
      // @ts-ignore
      const blob = new Blob([res], {type: "application/vnd.ms-excel"});
      const fileName = `示例文件.xlsx`;
      //@ts-ignore
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName);
      } else {
        const a = document.createElement("a");
        const url = URL.createObjectURL(blob);
        a.download = fileName;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      }
    })
  }

  // 删除CBS行
  delCBSRow() {
    Api.deleteCbsQbsRelate({
      projectCode: this.projectCode ?? '',
      ids: this.selectedRowKeys
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error("删除失败");
        this.$message.success("删除成功");
        this.initCBSDetail(this.currentRow?.['tg04aContractschemeFk'] as string, this.projectCode, this.currentRow?.['cbs'] as string);
        this.updateBtn();
      });
    this.selectedRowKeys = [];
  }

  delRow(record) {
    if (this.tableDataCBS.length > 0) return alert("请先删除CBS表中细项！");
    delListTree(this.tableDataContract, record.id);
    Api.deleteSingleContractDetail({
      projectCode: this.projectCode as string,
      //@ts-ignore
      schemaId: record.id as string,
      cbsCode: ''
    }).then(res => {
      if (res.errcode == 0) return this.$message.success("删除成功");
      this.$message.error("删除失败");
    });
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

  handleOk() {
    this.batchSetAmount(this.cbsNumber);
    this.isMBSVisible = false;
  }

  handleCancel() {
    this.isMBSVisible = false;
  }

  handleChange(info) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      this.$message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === "error") {
      this.$message.error(`${info.file.name} 上传失败`);
    }
  }

  //点击分页中数字时触发的方法
  handleTableChange(pagination) {
    this.pagination.current = pagination.current;
    this.pagination.pageSize = pagination.pageSize;
    this.initCBSDetail(this.currentRow?.['tg04aContractschemeFk'] as string, this.projectCode, this.currentRow?.['cbs'] as string);
  }

  // 导入工程量清单明细 EXCEL
  importExcel() {
    this.initContractDetail(this.schemeId, this.projectCode);
    this.isExcelVisible = false;
  }

  // 取消导入
  importCancel() {
    this.isExcelVisible = false;
  }

  // CBS明细表格初始化
  initCBSDetail(id: string, code: string, cbs: string) {
    this.tableDataCBS = [];
    this.loading = true;
    this.detailId = id;
    this.selectedRowKeys = [];
    Api.getCbsQbsPage({
      projectCode: code,
      schemaId: id,
      cbsCode: cbs,
      current: this.pagination.current,
      size: this.pagination.pageSize
    }).then(res => {
      let resData = res.data.records;
      for (let i = 0; i < resData.length; i++) {
        this.$set(resData[i], "key", resData[i].id);
      }
      this.tableDataCBS = resData;
      this.pagination.total = res.data.total;
      this.loading = false;
    })
  }

  // 清单明细初始化
  initContractDetail(id, code) {
    this.tableDataContract.length = 0;
    this.expandedTableKeys.length = 0;
    Api.getCbsTreeSyncV3({
      projectCode: this.projectCode ?? '',
      schemaId: this.schemeId
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn("获取清单明细失败");
      this.tableDataContract = res.data;
      for (let i = 0; i < this.tableDataContract.length; i++) {
        this.expandedTableKeys.push(this.tableDataContract[i].id as string)
      }
    })
  }

  // MBS编码初始化
  initMBS() {
    this.treeData.length = 0;
    this.treeKey += 1;
    Api.simplifiedTree({
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    }).then(res => {
      if (res.errcode !== 0) return
      this.treeData = res.data;
    })
  }

  mbsCancel() {
    this.MBSIdentifier = 0;
    this.treeData = [];
    this.tableDataCBS = [];
    this.selectedRowKeys = [];
    this.initCBSDetail(this.currentRow?.['tg04aContractschemeFk'] as string, this.projectCode, this.currentRow?.['cbs'] as string);
  }

  modalOk() {
    this.saveBtn();
  }

  modalCancel() {
    this.isModalShow = false;
    this.modalData = [];
  }

  modeChange(key, dataIndex, value) {
    const dataSource = [...this.modalData];
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value;
      this.modalData = dataSource;
    }
  }

  // 表格单元格值修改
  onCellChange(key, dataIndex, value) {
    const dataSource = [...this.modalData];
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value;
      target["listTotalPrice"] = this.NumberMul(Number(target["listUnitPrice"]), Number(target["listAmount"]));
      target["finalTotalAmount"] = Number(target["changeAmount"]) + Number(target["listAmount"]);
      target["finalTotalPrice"] = this.NumberMul(Number(target["listUnitPrice"]), Number(target["finalTotalAmount"]));
      this.modalData = dataSource;
    }
  }

  onCellChangeCBS(key, dataIndex, value) {
    const dataSource = [...this.tableDataCBS];
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value;
      target["totalPrice"] = this.NumberMul(Number(target["unitPrice"]), Number(target["amount"]));
      this.tableDataCBS = dataSource;
    }
  }

  // 表格多选
  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys;
  }

  onContractChange(key, info) {
    this.cbsToRelateList = [];
    this.contractRowKeys = key;
    info.forEach(item => {
      if (item.children === null) {
        this.cbsToRelateList.push(item)
      }
    })
  }

  onChange(value) {
    this.cbsNumber = value;
  }

  // // MBS树形多选
  // onCheck(checkedKeys, info) {
  //   this.checkData = [];
  //   let infoData = info.checkedNodes;
  //   // 获取所选项内容
  //   for (let i = 0; i < infoData.length; i++) {
  //     if (
  //       infoData[i].data.props.dataRef.childs == null ||
  //       infoData[i].data.props.dataRef.childs.length == 0
  //     ) {
  //       this.checkData.push(infoData[i].data.props.dataRef);
  //     }
  //   }
  // }

  // 表格点击事件
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.treeKey += 1;
          this.currentRow = record;
          this.initCBSDetail(this.currentRow?.['tg04aContractschemeFk'] as string, this.projectCode, this.currentRow?.['cbs'] as string);
        },
        dblclick: () => {
          this.modeData = [];
          this.isModalShow = true;
          this.modalTitle = "编辑行";
          let tempt = {};
          for (let key in record) {
            if (
              key != "children" &&
              key != "tg04aContractschemeFk" &&
              key != "tg04aContractdetailFk"
            ) {
              this.$set(tempt, key, record[key]);
            }
          }
          this.$set(tempt, "tG04aContractSchemeFk", record["tg04aContractschemeFk"]);
          this.$set(tempt, "tG04aContractschemeFk", record["tg04aContractschemeFk"]);
          this.$set(tempt, "tG04aContractdetailFk", record["tg04aContractdetailFk"]);
          Api.getSchemeType({
            projectCode: this.projectCode as string,
            contractNum: this.$route.query.contractNum as string
          }).then(res => {
            const resData = res.data;
            if (!resData) return
            for (let i = 0; i < resData.length; i++) {
              this.modeData.push({
                value: resData[i].schemaType,
                text: resData[i].schemaType
              });
            }
          })
          this.modalData.push(tempt);
        }
      }
    };
  }

  // 保存工程量清单
  saveBtn() {
    Api.contractDetailInsert({
      projectCode: this.projectCode,
      objList: this.modalData
    })
      .then(res => {
        if (res.errcode == 0) {
          this.$message.success("保存成功");
        } else {
          this.$message.error("保存失败");
        }
        this.initContractDetail(this.schemeId, this.projectCode);
      })
  }

  // 保存CBS
  saveCBSBtn() {
    if (!this.selectedRowKeys || this.selectedRowKeys.length === 0) return this.$message.warn("请选择需要保存的CBS细项");
    // 绑定选择的行
    let tempt: Array<any> = [];
    for (let i = 0; i < this.selectedRowKeys.length; i++) {
      for (let j = 0; j < this.tableDataCBS.length; j++) {
        if (this.selectedRowKeys[i] == this.tableDataCBS[j].id) {
          tempt.push(this.tableDataCBS[j]);
        }
      }
    }
    Api.updateCbsQbsRelate({
      projectCode: this.projectCode ?? '',
      qbsCbsList: tempt
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error("保存失败");
      this.updateBtn();
    })
  }

  // 批量赋值
  setNumber() {
    if (this.selectedRowKeys.length > 0) return this.isMBSVisible = true;
    this.$message.warning("请选择关联构件");
  }

  setRowClassName(record, index) {
    let rowColor = index % 2 === 0 ? "evenRowStyl" : "";
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }

  toDetail(record) {
    this.detailData = [];
    this.isDetailShow = true;
    Api.mbsInfo({
      appCode: this.projectCode as string,
      projectName: this.projectConfig?.projectName ?? '',
      qbsCodes: [record.qbsCode]
    }).then(res => {
      if (!res.data || res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      this.detailData = res.data['mbses'];
    })
  }

  treeSelect(key, info) {
    this.treeChoose = info.node.dataRef
  }

  // 数据同步
  updateBtn() {
    this.tableDataContract = [];
    Api.updateContractDetail({
      projectCode: this.projectCode as string,
      schemaId: this.schemeId ?? ''
    }).then(res => {
      const resData = res.data ?? [];
      let totalPrice = 0;
      for (let i = 0; i < resData.length; i++) {
        totalPrice += resData[i].finalTotalPrice;
      }
      this.initContractDetail(this.schemeId, this.projectCode)
      this.$message.info(res.errmsg as string);
    })
  }

  //js乘法
  NumberMul(arg1, arg2) {
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
    height: 190px;
  }

  .rightTop {
    margin-top: 3px;
    height: calc(50vh - 62px);

    /deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
      height: calc(50vh - 176px);
    }
  }

  .left_tree {
    margin-top: 3px;
    height: calc(100vh - 120px);
  }

  .rightBottom {
    margin-top: 3px;
    height: calc(50vh - 62px);

    /deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
      height: calc(50vh - 215px);
    }
  }

  /deep/ .ant-table-placeholder {
    display: none;
  }

  /deep/ .ant-tree {
    height: calc(100vh - 200px);
    overflow: auto;
  }

  .buttonSty {
    margin-left: 8px;
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

  /deep/ .ant-modal-body {
    padding: 14px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
  }

  /deep/ .clickRowStyl {
    background-color: #bcf5f6;
  }
}


</style>
