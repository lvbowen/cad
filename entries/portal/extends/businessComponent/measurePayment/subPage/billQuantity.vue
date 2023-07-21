<template>
  <div class="main">
    <a-icon type="close" @click="close" class="close_icon"></a-icon>
    <!-- 工程量清单（表单） -->
    <a-card title="工程量清单方案" size="small" class="form_body">
      <a-button
        @click="saveFormBtn"
        class="buttonSty"
        slot="extra"
        type="primary"
        size="small"
      >保存
      </a-button>
      <a-form-model
        :model="form"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        layout="inline"
        style="margin-top:-10px"
      >
        <a-form-model-item label="方案名称">
          <a-input v-model="form.schemeName"/>
        </a-form-model-item>
        <a-form-model-item label="合同编号">
          <a-input v-model="form.contractNum"/>
        </a-form-model-item>
        <a-form-model-item label="方案金额">
          <a-input v-model="form.schemeMoney" disabled/>
        </a-form-model-item>
        <!--        <a-form-model-item label="合同所属组织">-->
        <!--          <a-input v-model="form.schemeOrgName" disabled/>-->
        <!--        </a-form-model-item>-->
        <br/>
        <a-form-model-item label="编制人员">
          <a-input v-model="form.createdBy" disabled/>
        </a-form-model-item>
        <a-form-model-item label="编制部门">
          <a-input v-model="form.createDiv" disabled/>
        </a-form-model-item>
        <a-form-model-item label="编制时间">
          <a-input v-model="form.createdTime" disabled/>
        </a-form-model-item>
      </a-form-model>
      <a-form-model :model="desc" style="margin-left: 14px;">
        <a-form-model-item label="备注信息" :labelCol="{ span: 1 }" :wrapperCol="{ span: 10 }">
          <a-input v-model="desc.remarks" type="textarea"/>
        </a-form-model-item>
      </a-form-model>
    </a-card>
    <a-row :gutter="16">
      <a-col :span="leftwidth">
        <!-- 工程量清单明细 表格-->
        <a-card title="工程量清单明细" class="left_card" size="small">
          <a-button
            @click="clearAllBtn"
            class="buttonSty"
            slot="extra"
            type="danger"
            size="small"
          >清空
          </a-button>
          <a-button
            @click="addRootBtn"
            class="buttonSty"
            slot="extra"
            type="primary"
            size="small"
          >增加根节点
          </a-button>
          <a-button
            @click="updateBtn"
            class="buttonSty"
            slot="extra"
            type="primary"
            size="small"
          >数据同步
          </a-button>
          <a-button
            @click="() => {this.isExcelVisible = true;}"
            class="buttonSty"
            slot="extra"
            type="primary"
            size="small"
          >EXCEL导入
          </a-button>
          <a-icon
            class="buttonSty"
            type="fullscreen-exit"
            slot="extra"
            @click="backToNor"
            v-show="!isleftFull"/>
          <a-icon
            class="buttonSty"
            type="fullscreen"
            slot="extra"
            @click="enlarge('isleftFull')"
            v-show="isleftFull"/>
          <a-table
            v-if="tableDataContract.length!==0"
            :defaultExpandedRowKeys="expandedTableKeys"
            :columns="tableLabelContract"
            :data-source="tableDataContract"
            :customRow="rowClick"
            :rowClassName="setRowClassName"
            :scroll="scrollNorTable"
            :indentSize="10"
            @expand="expandRows"
          >
            <span slot="操作" slot-scope="record">
              <a-icon type="plus-square" theme="twoTone" @click="() => addRow(record)"/>
              <a-divider type="vertical" style="padding-left: 2%"/>
              <a-icon type="delete" theme="twoTone" @click="() => delRow(record)"/>
            </span>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="midwidth">
        <!-- CBS细项表格 -->
        <a-card title="MBS编码" class="mid_card" size="small">
          <a-button
            @click="addMoreBtn"
            slot="extra"
            type="primary"
            style="margin-left: 10px"
            size="small"
          >批量添加
          </a-button
          >
          <a-icon
            class="buttonSty"
            type="fullscreen-exit"
            slot="extra"
            @click="backToNor"
            v-show="!isMidFull"/>
          <a-icon
            class="buttonSty"
            type="fullscreen"
            slot="extra"
            @click="enlarge('isMidFull')"
            v-show="isMidFull"/>
          <a-tree
            checkable
            v-if="treeData.length!==0"
            :defaultExpandedKeys="expandedTreeKeys"
            :key="treeKey"
            :loadData="onLoadData"
            :treeData="treeData"
            :replaceFields="replaceFields"
            @check="onCheck"
          />
        </a-card>
      </a-col>
      <a-col :span="rightwidth">
        <a-card title="CBS细项" class="right_card" size="small">
          <a-button
            slot="extra"
            type="primary"
            @click="saveCBSBtn"
            class="buttonSty"
            style="margin-left: 0"
            size="small"
          >保存
          </a-button
          >
          <a-button
            @click="setNumber"
            slot="extra"
            type="primary"
            style="margin-left: 10px"
            size="small"
          >批量设置数量
          </a-button
          >
          <a-button
            slot="extra"
            @click="addOnlyOne"
            class="buttonSty"
            size="small"
            type="primary"
          >添加非构件项
          </a-button
          >
          <a-button
            slot="extra"
            type="primary"
            @click="
              () => {
                this.isExcelCBSVisible = true;
              }
            "
            class="buttonSty"
            size="small"
          >EXCEL导入
          </a-button
          >
          <a-button
            slot="extra"
            @click="
              () => {
                this.isShowConfirm = true;
                this.prompt = '确认删除所选项吗？(已选择' + this.selectedRowKeys.length + '项)';
              }
            "
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
              @cancel="cancel"
            >
            </a-popconfirm>
          </a-button>
          <a-icon
            class="buttonSty"
            type="fullscreen-exit"
            slot="extra"
            @click="backToNor"
            v-show="!isRightFull"/>
          <a-icon
            class="buttonSty"
            type="fullscreen"
            slot="extra"
            @click="enlarge('isRightFull')"
            v-show="isRightFull"/>
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
            :scroll="scrollNorCBS"
          >
            <template v-for="item in columnCBS" :slot="item" slot-scope="text, record">
              <div :key="item">
                <editable-cell :text="text" @change="onCellChangeCBS(record.key, item, $event)"/>
              </div>
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
            <editable-cell :text="text" @change="onCellChange(record.key, item, $event)"/>
          </div>
        </template>
        <template slot="listClass" slot-scope="text, record">
          <a-select
            :defaultValue="record.listClass"
            style="width: 120px"
            @change="modeChange(record.key, 'listClass', $event)"
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
    <!-- CBS细项 导入EXCEL数据 -->
    <a-modal
      title="导入数据"
      :visible="isExcelCBSVisible"
      @ok="importCBSExcel"
      @cancel="importCancel"
      okText="确认"
    >
      <a-form>
        <p class="ant-upload-text" style="float:left">
          为确保上传数据与列表内容匹配，请先下载
        </p>
        <a style="float:left" @click="downLoadCBS">示例文件</a>
        <br/>
        <a-upload
          name="file"
          :multiple="false"
          :headers="headers"
          :action="urlCBS"
          :data="dataCBS"
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
          :action="urlCBS"
          :data="dataCBS"
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
  </div>
</template>

<script>
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Icon,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
  Tree
} from "@h3/antd-vue";
import FormModel from 'ant-design-vue/lib/form-model';
import {
  cbsDetailDel,
  cbsDetailGet,
  cbsDetailInsert,
  cbsDetailUpload,
  childTree,
  contractDetailDel,
  contractDetailGetChilds,
  contractDetailInsert,
  contractDetailUpdate,
  contractDetailUpload,
  getSchemeType,
  saveCBSBench,
  schemeManageInsert,
  topTree
} from "../data/url";
import {delListTree, timeDefault} from "../data/util";
import {v4 as uuidv4} from "uuid";
import EditableCell from "../data/editTableCell.vue";
import env from '@/config/env';

import * as Type from '../../../type';
import * as Constant from '../../../constant';
import * as Api from "../../../service/api";

Vue.prototype.$form = Form;
const tableLabelContract = [
  // 表头数据
  {
    align: "left",
    title: "CBS编码",
    key: "cbs",
    dataIndex: "cbs",
    width: "7%",
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
    width: "12%",
  },
  {
    align: "center",
    title: "单位",
    key: "listUnit",
    width: "3%",
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
    title: "已关联合价百分比(%)",
    width: "10%",
    key: "relatedTotalPercent",
    dataIndex: "relatedTotalPercent"
  },
  {
    align: "center",
    title: "备注",
    key: "remarks",
    dataIndex: "remarks",
  },
  {
    align: "center",
    title: "操作",
    key: "操作",
    scopedSlots: {customRender: "操作"}
  }
];
const tableLabelCBS = [
  // 表头数据
  {
    align: "center",
    title: "MBS编码",
    key: "mbs",
    dataIndex: "mbs",
    width: '16%'
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
    scopedSlots: {customRender: "cbsname"},
    width: '28%'
  },
  {
    align: "center",
    title: "CBS单价",
    key: "cbsunitPrice",
    dataIndex: "cbsunitPrice",
    scopedSlots: {customRender: "cbsunitPrice"},
    width: '9%'
  },
  {
    align: "center",
    title: "CBS数量",
    key: "cbsamount",
    dataIndex: "cbsamount",
    scopedSlots: {customRender: "cbsamount"}
  },
  {
    align: "center",
    title: "CBS合价",
    key: "cbstotalPrice",
    dataIndex: "cbstotalPrice",
    render: (text, record, index) => {
      return record.cbsamount * record.cbsunitPrice;
    }
  },
  {
    align: "center",
    title: "备注",
    key: "remarks",
    dataIndex: "remarks",
    width: "15%",
    scopedSlots: {customRender: "remarks"}
  }
];
const modalLabel = [
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
@Component({
  name: "billQuantity",
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    ASpin: Spin,
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
    ATable: Table,
    AFormModel: FormModel,
    ADivider: Divider,
    EditableCell,
    APopconfirm: Popconfirm,
    AModal: Modal
  }
})
export default class allProtect extends Vue {
  @InjectReactive('project') projectCode;

  @InjectReactive('projectConfig') projectConfig;

  leftwidth = 8;
  midwidth = 6;
  rightwidth = 10;
  isleftFull = true;
  isMidFull = true;
  isRightFull = true;
  expandedTableKeys = [];
  expandedTreeKeys = [];
  // 放在data中读取不到
  dataContract = {
    projectCode: "",
    schemeId: ""
  };
  headers = {
    authorization: "authorization-text",
    "Access-Token-PC": localStorage.getItem("token")
  };
  urlContract = contractDetailUpload;
  dataCBS = {
    projectCode: "",
    schemeId: ""
  };
  urlCBS = cbsDetailUpload;
  //非全屏状态table样式
  scrollNorTable = {x: 2200, y: 490};
  scrollNorCBS = {x: 1000, y: 500};

  cbsNumber = 0;
  columnCBS = ["cbsname", "cbsamount", "remarks"];
  columnContract = [
    "cbs",
    "listCode",
    "listName",
    "listUnit",
    "changeAmount",
    "listUnitPrice",
    "listAmount",
    "remarks"
  ];
  cbsKey = 0;

  currentRow = "";
  desc = {remarks: "",};
  editable = false;
  form = {
    schemeName: "",
    contractNum: "",
    schemeMoney: "",
    schemeOrgName: "",
    createdBy: "",
    createDiv: "",
    createdTime: ""
  };
  isExcelCBSVisible = false;
  isExcelVisible = false;
  isMbsShow = false;
  isMBSVisible = false;
  isModalShow = false;
  isShowConfirm = false;
  isShowConfirmMBS = false;

  labelCol = {span: 8};
  loading = false;
  MBSIdentifier = 0;
  detailId = "";
  MBSCBS = "";
  mbsLoading = false;
  MBSUnitPrice = "";
  modalData = [];
  modalLabel;
  modalTitle = "";
  modeData = [];
  pagination = {
    pageSize: 100, //每页中显示50条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["100", "200", "400", "600"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };
  prompt = "";
  replaceFields = {
    key: "id",
    title: "nodeName"
  };
  selectId = [];
  selectedRowKeys = [];// Check here to configure the default column
  schemeId = "";
  tableDataContract = [];
  tableLabelContract;
  tableDataCBS = [];
  tableLabelCBS;
  temptMbs = [];
  treeData = [];
  treeKey = 0;
  value = this.text;
  wrapperCol = {span: 16};


  data() {
    return {
      tableLabelCBS,
      tableLabelContract,
      modalLabel
    }
  }

  mounted() {
    //获取信息
    this.schemeId = this.$route.query.id;
    //清单细项
    this.initContractDetail(this.schemeId, this.projectCode);
    //表单
    this.formInit(this.$route.query);
    //MBS编码树
    this.initMBS();
    this.dataContract.projectCode = this.projectCode;
    this.dataContract.schemeId = this.schemeId;
    this.dataCBS.projectCode = this.projectCode;
    this.dataCBS.schemeId = this.schemeId;
    let _this = this;
    _this.scrollNorTable.y = document.documentElement.clientHeight - 460;
    _this.scrollNorCBS.y = document.documentElement.clientHeight - 460;
    window.onresize = () => {
      return (() => {
        _this.scrollNorTable.y = document.documentElement.clientHeight - 460;
        _this.scrollNorCBS.y = document.documentElement.clientHeight - 460;
      })()
    };
  }

  // 批量添加（mbs）
  addMoreBtn() {
    this.MBSUnitPrice = this.currentRow.listUnitPrice;
    this.MBSCBS = this.currentRow.cbs;
    // 根据选择的节点获取子节点并插入右侧表格
    axios
      .post(saveCBSBench, {
        cbs: this.MBSCBS,
        currentNodeList: this.selectId,
        detailId: this.detailId,
        price: this.MBSUnitPrice,
        projectCode: this.projectCode,
        schemeId: this.schemeId
      })
      .then(res => {
        if (res.errcode === 0) {
          this.initCBSDetail(this.currentRow.id, this.projectCode);
        }
        this.mbsLoading = false;
        this.$message.success("成功添加至数据库");
      })
  }

  // 添加非构建项
  addOnlyOne() {
    if (this.currentRow.id !== "" && this.currentRow.id !== undefined) {
      let temptUuid = uuidv4();
      let uuid = temptUuid.split("-").join("");
      let newRow = {
        id: uuid,
        key: uuid,
        createdTime: timeDefault(),
        tG04aContractSchemeFk: this.schemeId,
        tG04aContractdetailFk: this.currentRow.id,
        cbs: this.currentRow.cbs,
        cbsamount: 0,
        codeid: '',
        cbsname: this.currentRow.listName,
        cbssort: "",
        cbstotalPrice: 0,
        cbstype: "",
        cbsunitPrice: this.currentRow.listUnitPrice,
        createdDeptId: "",
        creater: "",
        graphMBSNum: "",
        graphNum: "",
        mbs: "",
        modifiedTime: "",
        modifier: "",
        name: "",
        owner: "",
        ownerDeptId: "",
        ownerDeptQueryCode: "",
        remarks: "",
        sequenceNo: "",
        sequenceStatus: ""
      };
      this.tableDataCBS.unshift(newRow);
    } else {
      this.$message.warn("请选择所属CBS!");
    }
  }

  // 添加根节点
  addRootBtn() {
    let temptUuid = uuidv4();
    let uuid = temptUuid.split("-").join("");
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

  backToNor() {
    this.isRightFull = true;
    this.isMidFull = true;
    this.isleftFull = true;

    this.leftwidth = 8;
    this.midwidth = 8;
    this.rightwidth = 8;
  }

  // 批量设置
  batchSetAmount(data) {
    // this.isShowEdit = false;
    for (let i = 0; i < this.tableDataCBS.length; i++) {
      for (let j = 0; j < this.selectedRowKeys.length; j++) {
        if (this.tableDataCBS[i].id === this.selectedRowKeys[j]) {
          this.tableDataCBS[i].cbsamount = data;
          this.tableDataCBS[i].cbstotalPrice =
            this.tableDataCBS[i].cbsunitPrice * this.tableDataCBS[i].cbsamount;
        }
      }
    }
    this.cbsKey += 1;
    // this.isShowEdit = true;
  }

  cancel() {
    if (this.MBSIdentifier == 0) {
      this.isShowConfirm = false;
    }else {
      this.isShowConfirmMBS = false;
    }
    message.error("取消删除");
  }

  confirm() {
    if (this.MBSIdentifier == 0) {
      this.isShowConfirm = false;
    }else {
      this.isShowConfirmMBS = false;
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
    axios
      .post(
        `${env.apiHost}/api/runtime/query/export_template`,
        {
          queryCode: this.projectCode + "_T_G_ContrDeta",
          schemaCode: this.projectCode + "_T_G_ContrDeta"
        },
        {responseType: "arraybuffer"}
      )
      .then(res => {
        const blob = new Blob([res], {type: "application/vnd.ms-excel"});

        const fileName = `示例文件.xlsx`;

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

  //示例文件下载 CBS细项
  downLoadCBS() {
    //不写{ responseType: 'arraybuffer'}，获取到的是乱码且Excel文件打不开
    axios
      .post(
        `${env.apiHost}/api/runtime/query/export_template`,
        {
          queryCode: this.projectCode + "_T_G_CBS",
          schemaCode: this.projectCode + "_T_G_CBS"
        },
        {responseType: "arraybuffer"}
      )
      .then(res => {
        const blob = new Blob([res], {type: "application/vnd.ms-excel"});

        const fileName = `CBS示例文件.xlsx`;

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
    axios
      .post(cbsDetailDel, {
        projectCode: this.projectCode,
        ids: this.selectedRowKeys
      })
      .then(res => {
        if (res.errcode == 0) {
          this.$message.success("删除成功");
          this.initCBSDetail(this.currentRow.id, this.projectCode);
        } else {
          this.$message.error("删除失败");
        }
      });
    this.selectedRowKeys = [];
  }

  delRow(record) {
    if (this.tableDataCBS.length > 0) {
      alert("请先删除CBS表中细项！");
    } else {
      delListTree(this.tableDataContract, record.key);
      axios
        .delete(contractDetailDel, {
          params: {
            projectCode: this.projectCode,
            id: record.id
          }
        })
        .then(res => {
          if (res.errcode == 0) {
            this.$message.success("删除成功");
          } else {
            this.$message.error("删除失败");
          }
        });
    }
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

  enlarge(value) {
    if (value == 'isleftFull') {
      this.isleftFull = false;
      this.leftwidth = 24;
      this.midwidth = 0;
      this.rightwidth = 0;
    } else if (value === 'isMidFull') {
      this.isMidFull = false;
      this.leftwidth = 0;
      this.midwidth = 24;
      this.rightwidth = 0;
    } else if (value === 'isRightFull') {
      this.isRightFull = false;
      this.leftwidth = 0;
      this.midwidth = 0;
      this.rightwidth = 24;
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
      if (c.children !== undefined && c.children.length != 0) { // 有值了直接渲染
        resolve()
        return
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      axios
        .get(contractDetailGetChilds, {
          params: {
            projectCode: this.projectCode,
            schemeId: "",
            parentId: c.id,
            // projectName:window.Environment.markName
            projectName: this.projectConfig?.projectName ?? ''
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

  // 表单初始化
  formInit(data) {
    this.form = data;
    this.desc.remarks = data.remarks;
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
      this.$message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      this.$message.error(`${info.file.name} file upload failed.`);
    }
  }

  //点击分页中数字时触发的方法
  handleTableChange(pagination) {
    this.pagination.current = pagination.current;
    this.pagination.pageSize = pagination.pageSize;
    this.initCBSDetail(this.currentRow.id, this.projectCode);
  }

  // 取消导入
  importCancel() {
    this.isExcelVisible = false;
    this.isExcelCBSVisible = false;
  }

  // 导入工程量清单明细 EXCEL
  importExcel() {
    this.initContractDetail(this.schemeId, this.projectCode);
    this.isExcelVisible = false;
  }

  // 导入CBS EXCEL
  importCBSExcel() {
    this.initCBSDetail(this.schemeId, this.projectCode);
    this.isExcelCBSVisible = false;
  }

  // CBS明细表格初始化
  initCBSDetail(id, code) {
    this.tableDataCBS = [];
    this.loading = true;
    this.detailId = id;
    this.selectedRowKeys = [];
    axios
      .get(cbsDetailGet + "ByPage", {
        params: {
          projectCode: code,
          detailId: id,
          like: "",
          page: this.pagination.current,
          size: this.pagination.pageSize
        }
      })
      .then(res => {
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
    axios
      .get(contractDetailGetChilds, {
        params: {
          projectCode: code,
          schemeId: id,
          parentId: "",
          // projectName:window.Environment.markName
          projectName: this.projectConfig?.projectName ?? ''
        }
      })
      .then(res => {
        if (res.errcode == 0) {
          this.tableDataContract = res.data;
          for (let i = 0; i < this.tableDataContract.length; i++) {
            this.expandedTableKeys.push(this.tableDataContract[i].key)
          }
        } else {
          this.$message.warn("获取清单明细失败");
        }
      })
  }

  // MBS编码初始化
  initMBS() {
    this.treeData.length = 0;
    this.treeKey += 1;
    this.expandedTreeKeys.length = 0;
    axios
      .get(topTree, {
        params: {
          projectCode: this.projectCode,
          code: "",
          name: "",
          // projectName: this.$route.query.contractName
          projectName:this.projectConfig?.projectName ?? ''
        }
      })
      .then(res => {
        if (res.errcode == 0) {
          this.treeData = res.data;

          for (let i = 0; i < this.treeData.length; i++) {
            this.expandedTreeKeys.push(this.treeData[i].id)
          }
        }
      })
  }

  mbsCancel() {
    this.isMbsShow = false;
    this.MBSIdentifier = 0;
    this.treeData = [];
    this.tableDataCBS = [];
    this.selectedRowKeys = [];
    this.initCBSDetail(this.currentRow.id, this.projectCode);
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
    const target = dataSource.find(item => item.key === key);
    if (target) {
      target[dataIndex] = value;
      this.modalData = dataSource;
    }
  }

  // 表格单元格值修改
  onCellChange(key, dataIndex, value) {
    const dataSource = [...this.modalData];
    const target = dataSource.find(item => item.key === key);
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
    const target = dataSource.find(item => item.key === key);
    if (target) {
      target[dataIndex] = value;
      // target["cbstotalPrice"] = target["cbsunitPrice"] * target["cbsamount"];
      target["cbstotalPrice"] = this.NumberMul(Number(target["cbsunitPrice"]), Number(target["cbsamount"]));
      this.tableDataCBS = dataSource;
    }
  }

  // 树 异步加载
  onLoadData(treeNode) {
    const _this = this;
    return new Promise(resolve => {
      if (treeNode.dataRef.children != undefined && treeNode.dataRef.children.length != 0) {
        // 有值了直接渲染
        resolve();
        return;
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      axios
        .get(childTree, {
          params: {
            id: treeNode.$vnode.data.key,
            projectCode: this.projectCode,
            code: "",
            name: ""
          }
        })
        .then(res => {
          treeNode.dataRef.children = res.data;
          _this.treeData = [..._this.treeData];
        });
      resolve();
    });
  }

  // 表格多选
  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys;
  }

  onChange(value) {
    this.cbsNumber = value;
  }

  // MBS树形多选
  onCheck(checkedKeys, info) {
    // this.tableDataCBS = [];
    console.log('checkedKeys, info', checkedKeys, info)
    let temptSelect = [];
    let infoData = info.checkedNodes;
    // 获取所选项内容
    for (let i = 0; i < infoData.length; i++) {
      if (
        infoData[i].data.props.dataRef.children == null ||
        infoData[i].data.props.dataRef.children.length == 0
      ) {
        temptSelect.push(infoData[i].data.props.dataRef);
      }
    }
    // 整理所选项id
    this.selectId = [];
    for (let i = 0; i < temptSelect.length; i++) {
      this.selectId.push(temptSelect[i].id);
    }
  }

  // 表格点击事件
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.treeKey += 1;
          this.currentRow = record;
          if (record.children == undefined || record.children.length == 0) {
            this.initCBSDetail(this.currentRow.id, this.projectCode);
          } else {
            this.$message.warn("请选择子节点！");
          }
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
          axios
            .get(getSchemeType, {
              params: {
                projectCode: this.projectCode,
                contractNum: this.form.contractNum
              }
            })
            .then(res => {
              let resData = res.data;
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
    axios
      .post(contractDetailInsert, {
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
      .catch(err => {
        console.log(err);
        this.$message.error("保存失败");
        //刷新
        this.initContractDetail(this.schemeId, this.projectCode);
        this.isModalShow = false;
      });
  }

  // 保存CBS
  saveCBSBtn() {
    if (!this.selectedRowKeys || this.selectedRowKeys.length === 0) return this.$message.warn("请选择需要保存的CBS细项");
    // 绑定选择的行
    let tempt = [];
    for (let i = 0; i < this.selectedRowKeys.length; i++) {
      for (let j = 0; j < this.tableDataCBS.length; j++) {
        if (this.selectedRowKeys[i] == this.tableDataCBS[j].key) {
          tempt.push(this.tableDataCBS[j]);
        }
      }
    }
    axios
      .post(cbsDetailInsert, {
        projectCode: this.projectCode,
        objList: tempt
      })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error("保存失败");
        this.$message.success("保存成功");
        this.updateBtn();
      })
      .catch(err => {
        console.log(err);
        this.$message.error("保存失败");
        this.init();
      });
  }

  // 保存表单
  saveFormBtn() {
    this.form.remarks = this.desc.remarks;
    axios
      .post(schemeManageInsert, {
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
        console.log(err);
        this.$message.error("保存失败");
        this.init();
      });
  }

  // 批量赋值
  setNumber() {
    if (this.selectedRowKeys.length > 0) {
      this.isMBSVisible = true;
    } else {
      this.$message.warning("请选择关联构件");
    }
  }

  setRowClassName(record, index) {
    let rowColor = index % 2 === 0 ? "evenRowStyl" : "";
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }

  // 数据同步
  updateBtn() {
    this.tableDataContract = [];
    axios
      .get(contractDetailUpdate, {
        params: {
          projectCode: this.projectCode,
          schemeId: this.schemeId
        }
      })
      .then(res => {
        let resData = res.data;
        let totalPrice = 0;
        for (let i = 0; i < resData.length; i++) {
          totalPrice += resData[i].finalTotalPrice;
        }
        this.form.schemeMoney = totalPrice;
        this.initContractDetail(this.schemeId, this.projectCode)
        this.$message.info(res.errmsg);
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

<style>

.ant-modal-body {
  padding: 14px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
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

  .form_body {
    width: 100%;
    height: 190px;
  }

  .left_card {
    margin-top: 3px;
    height: calc(100vh - 300px);
  }

  .mid_card {
    margin-top: 3px;
    height: calc(100vh - 300px);
  }

  .right_card {
    margin-top: 3px;
    height: calc(100vh - 300px);
  }
}

/deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
  height: calc(100vh - 442px);
}

/deep/ .ant-table-placeholder {
  display: none;
}

/deep/ .ant-tree {
  height: calc(100vh - 422px);
  overflow: auto;
}

.buttonSty {
  margin-left: 8px;
}
</style>
