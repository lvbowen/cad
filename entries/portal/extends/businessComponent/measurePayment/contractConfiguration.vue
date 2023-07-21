<template>
  <div style="overflow: auto; height: 46.95vw">
    <a-card title="清单信息管理" class="box" style="width: 100%; height: 44.34vw">
      <a-button slot="extra" type="primary" @click="addBtn">添加</a-button>
      <a-button
        slot="extra"
        type="primary"
        @click="saveBtn"
        style="margin-left:10px">保存</a-button>
      <a-button
        slot="extra"
        @click="delBtn"
        type="danger"
        style="margin-left:10px">删除
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
        :columns="tableLabelContract"
        :data-source="tableDataContract"
        :pagination="pagination"
        :customRow="rowClick"
        rowKey="id"
        :rowClassName="setRowClassName"
        :scroll="{ x: 1200, y: 675 }"
        @change="handleTableChange"
      >
        <template v-for="item in columnContract" :slot="item" slot-scope="text, record">
          <div :key="item">
            <editable-cell :text="text" @change="onCellChange(record.key, item, $event)"/>
          </div>
        </template>
        <span slot="操作" slot-scope="record">
          <a @click="() => setUp(record)">设置</a>
        </span>
        <span slot="contractOrgName" slot-scope="text, record">
          <a @click="() => initOrg(record)">{{ record.contractOrgName }}</a>
        </span>
        <template slot="projectName" slot-scope="text, record">
          <a @click="projectPick(record)">{{ record.projectName }}</a>
        </template>
      </a-table>
    </a-card>
    <a-modal
      title="合同所属组织"
      :visible="isOrgShow"
      @cancel="cancel"
      footer="">
      <a-tree
        selectable
        :key="treeKey"
        :loadData="onLoadData"
        :treeData="treeData"
        :replaceFields="replaceFields"
        @select="onSelect"
      >
        <template slot="title" slot-scope="{ title }">
          <span v-if="title.indexOf(searchValue) > -1">
            {{ title.substr(0, title.indexOf(searchValue)) }}
            <span style="color: #f50">{{ searchValue }}</span>
            {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
          </span>
          <span v-else>{{ title }}</span>
        </template>
      </a-tree>
    </a-modal>
    <a-modal
      title="参数设置"
      :visible="isSetUpShow"
      @cancel="cancel"
      :footer="null"
      width="900px">
      <a-tabs :activeKey="activeKey" @change="callback">
        <a-tab-pane key="1" tab="清单项类别管理">
          <div>
            <a-button
              slot="extra"
              type="primary"
              size="small"
              @click="addBtn">添加
            </a-button>
            <a-button
              slot="extra"
              size="small"
              type="primary"
              @click="saveBtn"
              style="margin-left:10px"
            >保存
            </a-button>
            <a-button
              slot="extra"
              @click="delBtn"
              type="danger"
              size="small"
              style="margin-left:10px"
            >删除
              <a-popconfirm
                title="确认删除此行？"
                :visible="isShowTab1Confirm"
                okText="确认"
                cancelText="取消"
                @confirm="confirm"
                @cancel="cancelTab"/>
            </a-button>
          </div>
          <a-table
            rowKey="id"
            :columns="tableLabelTab1"
            :data-source="tableDataTab1"
            :customRow="rowClick"
            :rowClassName="setRowClassName"
          >
            <template v-for="item in columnTab1" :slot="item" slot-scope="text, record">
              <div :key="item">
                <editable-cell :text="text" @change="onCellChangeTab1(record.id, item, $event)"/>
              </div>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="2" tab="支付项类别管理" forceRender>
          <div>
            <a-button
              slot="extra"
              type="primary"
              @click="addBtn"
              size="small">添加
            </a-button>
            <a-button
              slot="extra"
              @click="saveBtn"
              size="small"
              type="primary"
              style="margin-left:10px"
            >保存
            </a-button>
            <a-button
              slot="extra"
              @click="delBtn"
              size="small"
              type="danger"
              style="margin-left:10px"
            >删除
              <a-popconfirm
                title="确认删除此行？"
                :visible="isShowTab2Confirm"
                okText="确认"
                cancelText="取消"
                @confirm="confirm"
                @cancel="cancelTab"
              />
            </a-button>
          </div>
          <a-table
            rowKey="id"
            :columns="tableLabelTab2"
            :data-source="tableDataTab2"
            :customRow="rowClick"
            :rowClassName="setRowClassName"
          >
            <template v-for="item in columnTab2" :slot="item" slot-scope="text, record">
              <div :key="item">
                <editable-cell :text="text" @change="onCellChangeTab2(record.id, item, $event)"/>
              </div>
            </template>
            <span slot="操作" slot-scope="record">
              <a @click="() => setUp(record)">设置</a>
            </span>
            <span slot="contractOrgName" slot-scope="text, record">
              <a @click="() => initOrg(record)">{{ record.contractOrgName }}</a>
            </span>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
    <a-modal
      title="项目选择"
      :visible="isProjectShow"
      @cancel="handleCancel"
      @ok="handleOk"
      width="900px">
      <a-table
        rowKey="id"
        :columns="projectLabel"
        :data-source="projectData"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
      >
      </a-table>
    </a-modal>
  </div>
</template>

<script lang="ts">
/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Vue,} from "vue-property-decorator";
import {Card, Button, Table, Tabs, Input, Popconfirm, Modal, Form, Tree, Divider} from "@h3/antd-vue";
import {timeDefault, capitalize} from "./data/util";
//@ts-ignore
import {v4 as uuidv4} from "uuid";
import EditableCell from "./data/editTableCell.vue";
import * as Type from '../../type';
import * as Api from '../../service/api';

const {TabPane} = Tabs;

const TreeNode = Tree.TreeNode;
const Search = Input.Search;
@Component({
  name: "contractConfiguration",
  components: {
    EditableCell,
    AInputSearch: Input.Search,
    ACard: Card,
    AForm: Form,
    ATabs: Tabs,
    ATabPane: TabPane,
    ATree: Tree,
    AButton: Button,
    AInput: Input,
    ATable: Table,
    AModal: Modal,
    ADivider: Divider,
    APopconfirm: Popconfirm
  }
})
export default class contractConfiguration extends Vue {
  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  selectedKeys: Array<any> = [];
  activeKey: string = "1";
  columnContract: Array<any> = [
    "contractNum",
    "contractTotalMoney",
    "sgcompany",
    "sgdelegate",
    "jlcompany",
    "jldelegate",
    "yzcompany",
    "yzdelegate"
  ];
  columnTab1: Array<any> = ["schemaType", "remarks", "typeCode"];
  columnTab2: Array<any> = ["payDetailType", "remarks", "payDetailTypeNum"];
  contractNum: string = "";
  currentRow: string = "";
  editable: boolean = false;
  orgRowKey: string = ""; //用于记录选中的行
  isSetUpShow: boolean = false;
  isShowConfirm: boolean = false;
  isShowTab1Confirm: boolean = false;
  isShowTab2Confirm: boolean = false;
  isOrgShow: boolean = false;
  pagination: object = {
    pageSize: 20, //每页中显示20条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "50"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };
  // projectCode: string = "";
  tableDataContract: Array<any> = [];
  tableLabelContract: Array<any> = [
    // 表头数据
    {
      align: "center",
      title: "合同编号",
      key: "contractNum",
      dataIndex: "contractNum",
      scopedSlots: {customRender: "contractNum"}
    },
    {
      align: "center",

      title: "项目名称",
      width: '13%',
      key: "projectName",
      dataIndex: "projectName",
      scopedSlots: {customRender: "projectName"}
    },
    {
      align: "center",

      title: "项目简称",
      key: "contractName",
      dataIndex: "contractName",
      scopedSlots: {customRender: "contractName"}
    },
    {
      align: "center",

      title: "合同金额",
      key: "contractTotalMoney",
      dataIndex: "contractTotalMoney",
      scopedSlots: {customRender: "contractTotalMoney"}
    },
    {
      align: "center",

      title: "施工单位",
      width: '10%',
      key: "sgcompany",
      dataIndex: "sgcompany",
      scopedSlots: {customRender: "sgcompany"}
    },
    {
      align: "center",

      title: "施工代表",
      key: "sgdelegate",
      dataIndex: "sgdelegate",
      scopedSlots: {customRender: "sgdelegate"}
    },
    {
      align: "center",

      title: "监理单位",
      key: "jlcompany",
      width: '10%',
      dataIndex: "jlcompany",
      scopedSlots: {customRender: "jlcompany"}
    },
    {
      align: "center",

      title: "监理代表",
      key: "jldelegate",
      dataIndex: "jldelegate",
      scopedSlots: {customRender: "jldelegate"}
    },
    {
      align: "center",

      title: "业主单位",
      width: '10%',
      key: "yzcompany",
      dataIndex: "yzcompany",
      scopedSlots: {customRender: "yzcompany"}
    },
    {
      align: "center",

      title: "业主代表",
      key: "yzdelegate",
      dataIndex: "yzdelegate",
      scopedSlots: {customRender: "yzdelegate"}
    },
    {
      align: "center",

      title: "操作",
      key: "操作",
      scopedSlots: {customRender: "操作"}
    }
  ];
  tableDataTab1: Array<any> = [];
  tableLabelTab1: Array<any> = [
    // 表头数据
    {
      align: "center",

      title: "清单项类型",
      key: "schemaType",
      dataIndex: "schemaType",
      scopedSlots: {customRender: "schemaType"}
    },
    {
      align: "center",

      title: "编号",
      key: "typeCode",
      dataIndex: "typeCode",
      scopedSlots: {customRender: "typeCode"}
    },
    {
      align: "center",

      title: "所属页面",
      key: "page",
      dataIndex: "page",
      scopedSlots: {customRender: "page"}
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

      title: "所属合同编号",
      key: "contractNum",
      dataIndex: "contractNum",
      scopedSlots: {customRender: "contractNum"}
    }
  ];
  tableDataTab2: Array<any> = [];
  tableLabelTab2: Array<any> = [
    // 表头数据
    {
      align: "center",

      title: "支付明细类型",
      key: "payDetailType",
      dataIndex: "payDetailType",
      scopedSlots: {customRender: "payDetailType"}
    },
    {
      align: "center",

      title: "编号",
      key: "payDetailTypeNum",
      dataIndex: "payDetailTypeNum",
      scopedSlots: {customRender: "payDetailTypeNum"}
    },
    {
      align: "center",

      title: "所属页面",
      key: "page",
      dataIndex: "page",
      scopedSlots: {customRender: "page"}
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

      title: "所属合同编号",
      key: "contractNum",
      dataIndex: "contractNum",
      scopedSlots: {customRender: "contractNum"}
    }
  ];
  tabKey: number = 0;
  treeKey: number = 0;
  replaceFields: object = {
    key: "id",
    title: "name"
  };
  expandedKeys: Array<any> = [];
  searchValue: string = "";
  treeData: Array<any> = [];
  projectData: Array<any> = [];
  projectLabel: Array<any> = [
    // 表头数据
    {
      align: "center",

      title: "项目名称",
      key: "projectName",
      dataIndex: "projectName",
    },
    {
      align: "center",

      title: "项目简称",
      key: "shortName",
      dataIndex: "shortName",
    },
    {
      align: "center",

      title: "合同编号",
      key: "contractNum",
      dataIndex: "contractNum",
    },
    {
      align: "center",

      title: "创建时间",
      key: "createdTime",
      dataIndex: "createdTime",
    },

  ];
  isProjectShow: boolean = false;
  markNum: string = '';

  // 增加行按钮事件（0为主表格，1为设置中tab1表格—清单项，2为tab2表格—支付类别）
  addBtn() {
    if (this.tabKey == 0) {
      let temptUuid = uuidv4();
      let uuid = temptUuid.split("-").join("");
      let newRow = {
        contractName: "请选择项目！",
        contractNum: "请保证合同编号唯一",
        contractOrgName: "请选择所属组织",
        contractOrgOID: "",
        contractTotalMoney: 0,
        createdDeptId: "",
        createdTime: timeDefault(),
        creater: "",
        id: uuid,
        key: uuid,
        jlcompany: "",
        jldelegate: "",
        modifiedTime: "",
        modifier: "",
        name: "",
        owner: "",
        ownerDeptId: "",
        projectName: "请选择项目！",
        sgcompany: "",
        sgdelegate: "",
        sequenceNo: "",
        sequenceStatus: "",
        workflowInstanceId: "",
        yzcompany: "",
        yzdelegate: ""
      };
      this.tableDataContract.unshift(newRow);
    } else if (this.tabKey == 1) {
      let temptUuid = uuidv4();
      let uuid = temptUuid.split("-").join("");
      let newRow = {
        contractNum: this.contractNum,
        createdDeptId: "",
        createdTime: timeDefault(),
        creater: "",
        id: uuid,
        key: uuid,
        modifiedTime: "",
        modifier: "",
        name: "",
        owner: "",
        ownerDeptId: "",
        ownerDeptQueryCode: "",
        page: "清单管理",
        remarks: "",
        schemaType: "",
        sequenceNo: "",
        sequenceStatus: "",
        typeCode: "",
        workflowInstanceId: ""
      };
      this.tableDataTab1.unshift(newRow);
    } else if (this.tabKey == 2) {
      let temptUuid = uuidv4();
      let uuid = temptUuid.split("-").join("");
      let newRow = {
        contractNum: this.contractNum,
        createdDeptId: "",
        createdTime: timeDefault(),
        creater: "",
        id: uuid,
        key: uuid,
        modifiedTime: "",
        modifier: "",
        name: "",
        owner: "",
        ownerDeptId: "",
        ownerDeptQueryCode: "",
        page: "支付汇总",
        payDetailName: "",
        payDetailType: "",
        payDetailTypeNum: "",
        remarks: "",
        sequenceNo: "",
        sequenceStatus: "",
        workflowInstanceId: ""
      };
      this.tableDataTab2.unshift(newRow);
    }
  }

  // tab页跳转
  callback(key) {
    this.activeKey = key;
    this.currentRow = "";
    this.tabKey = key;
    if (key == 1) {
      this.getScheme();
    } else if (key == 2) {
      this.getPayment();
    }
  }

  cancel() {
    if (this.tabKey == 1111) {
      // 选择合同所属组织弹窗关闭
      this.isOrgShow = false;
      //@ts-ignore
      let tempt = this.selectedKeys.node.$vnode.data.props.dataRef;
      this.orgChange(this.orgRowKey, "contractOrgName", tempt.name);
      this.orgChange(this.orgRowKey, "contractOrgOID", tempt.id);
      this.orgRowKey = "";
      this.tabKey = 0;
      this.treeData = [];
      this.selectedKeys = [];
    } else if (this.tabKey == 1) {
      this.isSetUpShow = false;
      this.tabKey = 0;
      this.tableDataTab1 = [];
      this.tableDataTab2 = [];
    } else if (this.tabKey == 0) {
      this.isShowConfirm = false;
    } else if (this.tabKey == 2) {
      this.isSetUpShow = false;
      this.tabKey = 0;
      this.tableDataTab1 = [];
      this.tableDataTab2 = [];
    }
    this.activeKey = "";
    this.currentRow = "";
  }

  // tab页中删除弹窗中的取消按钮事件
  cancelTab() {
    this.isShowTab1Confirm = false;
    this.isShowTab2Confirm = false;
    this.currentRow = "";
  }

  // 删除合同（主表格）
  delContract() {
    this.tableDataContract.forEach((v, i) => {
      if (this.currentRow['id'] === v.id) {
        Api.contractManageDelete({
          projectCode: this.projectCode ?? "",
          contractNum: this.currentRow['contractNum']
        })
          .then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
            this.$message.success(res.errmsg as string);
            this.tableDataContract.splice(i, 1);
          });
      }
    });
  }

  // 删除支付类别（tab2表格）
  delPay() {
    this.tableDataTab2.forEach((v, i) => {
      if (this.currentRow['id'] === v.id) {
        Api.deletePayType({
          projectCode: this.projectCode ?? '',
          id: this.currentRow['id']
        })
          .then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
            this.$message.success(res.errmsg as string);
            this.tableDataTab2.splice(i, 1);
          });
      }
    });
  }

  // 删除清单项类别（tab1表格）
  delSchema() {
    this.tableDataTab1.forEach((v, i) => {
      if (this.currentRow['id'] === v.id) {
        Api.deleteSchemaType({
          projectCode: this.projectCode ?? '',
          id: this.currentRow['id']
        }).then(res => {
          if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
          this.$message.success(res.errmsg as string);
          this.tableDataTab1.splice(i, 1);
        });
      }
    });
  }

  // 确认删除按钮事件（0为主表格，1为设置中tab1表格—清单项，2为tab2表格—支付类别）
  confirm() {
    if (this.tabKey == 0) {
      this.delContract();
      this.isShowConfirm = false;
    } else if (this.tabKey == 1) {
      this.delSchema();
      this.isShowTab1Confirm = false;
    } else if (this.tabKey == 2) {
      this.delPay();
      this.isShowTab2Confirm = false;
    }
  }

  // 删除按钮事件（0为主表格，1为设置中tab1表格—清单项，2为tab2表格—支付类别）
  delBtn() {
    if (this.currentRow == undefined || this.currentRow == "") {
      //@ts-ignore
      this.$message.warn("请选择行");
    } else {
      if (this.tabKey == 0) {
        this.isShowConfirm = true;
      } else if (this.tabKey == 1) {
        this.isShowTab1Confirm = true;
      } else if (this.tabKey == 2) {
        this.isShowTab2Confirm = true;
      }
    }
  }

  // 获取清单项类别
  getScheme() {
    this.tableDataTab1 = [];
    Api.getSchemeType({
      projectCode: this.projectCode ?? '',
      contractNum: this.contractNum
    })
      .then(res => {
        if (res.errcode !== 0) return;
        this.tableDataTab1 = res.data;
      })
  }

  // 获取支付类别
  getPayment() {
    this.tableDataTab2 = [];
    Api.getPayType({
        projectCode: this.projectCode ?? "",
        contractNum: this.contractNum
      }
    ).then(res => {
      if (res.errcode !== 0) return;
      this.tableDataTab2 = res.data;
    })
  }


  handleCancel() {
    this.isProjectShow = false;
    this.projectData = [];
    this.currentRow = '';
    this.markNum = ''
  }

  handleOk() {
    if (this.currentRow != undefined && this.currentRow != "" && this.currentRow != null) {
      for (let i = 0; i < this.tableDataContract.length; i++) {
        if (this.markNum == this.tableDataContract[i].id) {
          // this.tableDataContract[i].nameShort=this.currentRow.shortName;
          this.tableDataContract[i].projectName = this.currentRow['projectName'];
          this.tableDataContract[i].contractName = this.currentRow['shortName'];
        }
      }
      this.isProjectShow = false;
      this.projectData = [];
      this.currentRow = '';
      this.markNum = ''
    } else {
      //@ts-ignore
      this.$message.warn("请选择项目！")
    }
  }

  handleTableChange(pagination) {
    this.pagination['current'] = pagination.current;
    this.pagination['pageSize'] = pagination.pageSize;
    this.initContract();
  }

  // 初始化组织机构
  initOrg(record) {
    this.tabKey = 1111;
    this.isOrgShow = true;
    this.orgRowKey = record.key;
    this.treeData = [];
    this.treeKey += 1;
    Api.contractOrg({
      filterType: "admin",
      deptId: "",
      }).then(res => {
      if (res.errcode === 0) this.treeData = res.data;
    })
  }

  // 初始化合同配置
  initContract() {
    this.tableDataContract = [];
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
    Api.getTableList( {
        customized: this.projectConfig?.multiProjectFlag ? true : false,
        filters: filters,
        mobile: false,
        queryCode: this.projectCode + "_T_G_ContrMan",
        schemaCode: this.projectCode + "_T_G_ContrMan",
        page: this.pagination['current'] - 1,
        size: this.pagination['pageSize']
      })
      .then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
        const resData = res.data;
        if(!resData) return
        if(!resData.content) return
        this.pagination['total'] = resData.totalElements??0;
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
          this.tableDataContract.push(updatePeriod);
        }
      })
  }

  mounted() {
    this.initContract();
  }

  // 主表格编辑
  onCellChange(key, dataIndex, value) {
    const dataSource = [...this.tableDataContract];
    // eslint-disable-next-line no-shadow
    const target = dataSource.find(item => item.key === key);
    if (target) {
      target[dataIndex] = value;
      this.tableDataContract = dataSource;
    }
  }

  // 设置——tab1表格编辑
  onCellChangeTab1(key, dataIndex, value) {
    const dataSource = [...this.tableDataTab1];
    // eslint-disable-next-line no-shadow
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value;
      this.tableDataTab1 = dataSource;
    }
  }

  // 设置——tab2表格编辑
  onCellChangeTab2(key, dataIndex, value) {
    const dataSource = [...this.tableDataTab2];
    // eslint-disable-next-line no-shadow
    const target = dataSource.find(item => item.id === key);
    if (target) {
      target[dataIndex] = value;
      this.tableDataTab2 = dataSource;
    }
  }

  // 树 异步加载
  onLoadData(treeNode) {
    const _this = this;
    return new Promise(resolve => {
      if (treeNode.dataRef.children.length > 0) {
        // 有值了直接渲染
        //@ts-ignore
        resolve();
        return;
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      Api.contractOrg({
            deptId: treeNode.$vnode.data.key,
            filterType: "admin"
          }
        ).then(res => {
          treeNode.dataRef.children = res.data;
          _this.treeData = [..._this.treeData];
        });
      //@ts-ignore
      resolve();
    });
  }

  // 树-选择
  onSelect(selectedKeys, info) {
    this.selectedKeys = info;
  }

  // 合同所属组织变化
  orgChange(key, dataIndex, value) {
    const dataSource = [...this.tableDataContract];
    const target = dataSource.find(item => item.key === key);
    if (target) {
      target[dataIndex] = value;
      this.tableDataContract = dataSource;
    }
  }

  //选择项目
  projectPick(record) {
    this.markNum = record.id;
    this.currentRow = '';
    this.isProjectShow = true;
    this.projectData = [];
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
      customized: this.projectConfig?.multiProjectFlag ? true : false,
      filters: filters,
      mobile: false,
      queryCode: 'xiangmujichushuju0',
      schemaCode: this.projectCode + '_gcjsxx_1',
      page: 0,
      size: 999999
    }).then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
          const resData = res.data;
          if(!resData ) return ;
          if(!resData.content) return ;
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
              } else if (key == "xmjc_1") {
                this.$set(temptPeriod, "shortName", tempt);
              } else if (key == "xmmc_1") {
                this.$set(temptPeriod, "projectName", tempt);
              } else if (key == "sghtbh_1") {
                this.$set(temptPeriod, "contractNum", tempt);
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
            this.projectData.push(updatePeriod);
          }
      })
  }

  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.currentRow = record;
        }
      }
    };
  }

  // 保存行
  saveBtn() {

    if (this.tabKey == 0) {
      if (this.currentRow == undefined || this.currentRow === "") {
        //@ts-ignore
        this.$message.warn("请选择行");
      } else {
        this.saveContract();
      }
    } else if (this.tabKey == 1) {
      this.saveTab1();
    } else if (this.tabKey == 2) {
      this.saveTab2();
    }
  }

  saveContract() {
    Api.contractManageInsert({
        projectCode: this.projectCode??'',
        objList: [this.currentRow]
      })
      .then(res => {
        if (res.errcode == 0) {
          this.$message.success("保存成功");
        } else {
          this.$message.error("保存失败");
        }
        this.initContract();
      })
  }

  saveTab1() {
    Api.insertSchemaType({
        projectCode: this.projectCode??'',
        objList: this.tableDataTab1
      })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error("保存失败");
        this.$message.success("保存成功");
        this.isShowTab1Confirm = false;
      })
  }

  saveTab2() {
    Api.insertPayType( {
        projectCode: this.projectCode??'',
        objList: this.tableDataTab2
      })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error("保存失败");
        this.$message.success("保存成功");
        this.isShowTab2Confirm = false;
      })
  }

  setRowClassName(record, index) {
    let rowColor = index % 2 === 0 ? "evenRowStyl" : "";
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }

  setUp(record) {
    // 打开参数设置弹窗
    this.tabKey = 1;
    this.activeKey = "1";
    this.currentRow = "";
    this.isSetUpShow = true;
    this.contractNum = record.contractNum;
    this.getScheme();
  }
}
</script>

<style lang="less" scoped>
@import "./data/measure.css";

.box {
  /deep/ .ant-table {
    height: 36.52vw;
  }
}

/deep/ .ant-card-head-title {
  font-size: 16px;
  font-weight: 500;
  color: #0a0a0a;
  padding-left: 5px !important;
  font-family: Source Han Sans CN;
}
</style>
