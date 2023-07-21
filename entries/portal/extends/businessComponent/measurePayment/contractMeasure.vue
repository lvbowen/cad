<template>
  <div class="main">
    <a-card title="工程量清单方案" class="box" :bodyStyle="bodyStyle">
      <a-button slot="extra" @click="addBtn" type="primary">添加</a-button>
      <a-button
        slot="extra"
        type="primary"
        @click="saveBtn"
        style="margin-left: 10px"
      >保存
      </a-button
      >
      <a-button
        slot="extra"
        type="primary"
        @click="curBtn"
        style="margin-left: 10px"
      >设为当前版本
      </a-button
      >
      <a-button
        slot="extra"
        @click="delBtn"
        type="danger"
        style="margin-left: 10px"
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
        :columns="tableLabel"
        :data-source="tableData"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
        :scroll="{ x: 1632, y: yHeight }"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <span slot="操作" slot-scope="record">
          <a @click="() => handleEdit(record)">编辑</a>
        </span>
        <template slot="contractNum" slot-scope="text, record">
          <a @click="contractPick(record)">{{ record.contractNum }}</a>
        </template>
        <template slot="schemeName" slot-scope="text, record">
          <editable-cell :text="text" @change="onCellChange(record.key, 'schemeName', $event)"/>
        </template>
      </a-table>
    </a-card>
    <!-- modal宽度属性写在style中不奏效 -->
    <!-- 选择合同弹窗 -->
    <a-modal
      title="选择合同"
      :visible="isModalShow"
      @ok="modalOk"
      @cancel="modalCancel"
      width="1500px"
    >
      <a-table
        :columns="modalLabel"
        :data-source="modalData"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
      >
      </a-table>
    </a-modal>
  </div>
</template>

<script lang="ts">
/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import * as Type from '../../type';
//@ts-ignore
import {v4 as uuidv4} from "uuid";
import {Card, Button, Table, Input, Popconfirm, Modal, Divider} from "@h3/antd-vue";
import * as Api from '../../service/api';
import {timeDefault, capitalize} from "./data/util";
import EditableCell from "./data/editTableCell.vue";

@Component({
  name: "contractMeasure",
  components: {
    ACard: Card, AButton: Button, ATable: Table, AInput: Input, ADivider: Divider,
    APopconfirm: Popconfirm, AModal: Modal,EditableCell
  }
})
export default class allProtect extends Vue {
  @InjectReactive('project') projectCode?: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  currentRow: string = ""; //点击表格行，保存当前行数据
  isModalShow: boolean = false; //控制选择合同弹窗
  isShowConfirm: boolean = false;//控制删除弹窗
  modalData: Array<any> = [];
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
      width: "12%",
      key: "projectName",
      dataIndex: "projectName"
    },
    {
      align: "center",

      width: "8%",
      title: "合同名称",
      key: "contractName",
      dataIndex: "contractName"
    },
    /*    {
          align: "center",
          title: "合同所属组织",
          width: "15%",
          key: "contractOrgName",
          dataIndex: "contractOrgName"
        },*/
    {
      align: "center",

      title: "合同金额",
      key: "contractTotalMoney",
      dataIndex: "contractTotalMoney"
    },
    {
      align: "center",

      title: "施工单位",
      width: "12%",
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
      width: "12%",
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
      width: "12%",
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
  modalKey: string = "";
  pagination = {
    pageSize: 20, //每页中显示20条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "50"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };
  search: string = "";
  tableData: Array<any> = [];
  tableLabel: Array<any> = [
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
      width: '4%'
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
      width: '5%'
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      scopedSlots: {customRender: "操作"},
      width: '4%'
    }
  ];
  visible: boolean = false;
  yHeight: number = 675;
  bodyStyle: any = {
    'display': 'flex',
    'flex': 1,
    'flexDirection': 'column',
    'height': '97%'
  };

  //添加方案
  addBtn() {
    let contract = "请选择合同";
    let temptUuid = uuidv4();
    let uuid = temptUuid.split("-").join("");
    let row = {
      contractNum: contract,
      schemeState: "否",
      id: uuid,
      key: uuid,
      verifyStatus: "未提交",
      createdTime: timeDefault(),
      workflowInstanceId: "",
      sequenceStatus: ""
    };
    this.tableData.unshift(row);
  }

  //点击删除弹窗-取消按钮
  cancel() {
    this.isShowConfirm = false;
    this.$message.warn("取消删除");
  }

  //点击删除弹窗-确认按钮
  confirm() {
    this.isShowConfirm = false;
    this.delTableRow();
  }

  //设为当前行
  curBtn() {
    if (this.currentRow != null && this.currentRow != "") {
      this.tableData.forEach((v, i) => {
        if (this.currentRow['id'] === v.id) {
          if (this.tableData[i].schemeState == "是") {
            this.tableData[i].schemeState = "否";
            this.saveBtn();
          } else {
            // i 为选中的索引
            this.tableData[i].schemeState = "是";
            this.saveBtn();
          }
        }
      });
    } else {
      this.$message.warn("请选择方案");
    }
  }

  //删除行
  delBtn() {
    this.isShowConfirm = true;
  }

  //确认后，执行删除行操作
  delTableRow() {
    if (!this.currentRow) return alert("请选择方案");
    this.tableData.forEach((v, i) => {
      if (this.currentRow['id'] === v.id) {
        Api.schemeManageDel({
          projectCode: this.projectCode ?? '',
          schemeId: v.id as string
        })
          .then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
            this.$message.success("删除成功");
            this.tableData.splice(i, 1);
          });
      }
    });
    //@ts-ignore
    this.currentRow = null;
  }

  //选择合同
  contractPick(record) {
    // 清空相关变量
    this.modalData = [];
    this.isModalShow = true;
    this.modalKey = record.key;
    const filters: Array<any> = [];
    if (this.projectConfig?.multiProjectFlag) {
      filters.push({
        propertyCode: "xmjc_1",
        propertyType: 0,
        propertyValue: this.projectConfig?.projectName ?? '',
        propertyValueName: "",
      });
    }
    //获取合同
    Api.getTableList({
      customized: this.projectConfig?.multiProjectFlag ? true : false,
      //@ts-ignore
      filters: filters,
      mobile: false,
      page: 0,
      queryCode: this.projectCode + "_T_G_ContrMan",
      schemaCode: this.projectCode + "_T_G_ContrMan",
      size: 999999
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
        let resData = res.data;
        if (!resData) return;
        if (!resData.content) return;
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
          this.modalData.push(updatePeriod);
        }
        this.$message.success("成功获取数据");
      })
  }

  //跳转至编辑页面（billQuantity）并传参
  handleEdit(record) {
    let routeMessage = {};
    for (let key in record) {
      this.$set(routeMessage, key, record[key]);
    }
    this.$set(routeMessage, "project", this.projectCode);
    this.currentRow = record;
    this.saveBtn();
    //@ts-ignore
    this.$router.push({
      path: "/billQuantity",
      query: routeMessage
    });
  }

  //点击分页中数字时触发的方法
  handleTableChange(pagination) {
    this.pagination['current'] = pagination.current;
    this.pagination['pageSize'] = pagination.pageSize;
    this.init();
  }

  //页面初始化
  init() {
    this.tableData = [];
    let filters: Array<any> = [];
    if (this.projectConfig?.multiProjectFlag) {
      filters.push({
        propertyCode: "xmjc_1",
        propertyType: 0,
        propertyValue: this.projectConfig?.projectName??'',
        propertyValueName: "",
      });
    }
    Api.getTableList({
      customized: this.projectConfig?.multiProjectFlag ? true : false,
      //@ts-ignore
      filters: filters,
      mobile: false,
      queryCode: this.projectCode + "_T_G_ContrSche",
      schemaCode: this.projectCode + "_T_G_ContrSche",
      page: this.pagination['current'] - 1,
      size: this.pagination['pageSize']
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
          // key值大写转换为小写
          let updatePeriod = {};
          for (let key in temptPeriod) {
            //@ts-ignore
            this.$set(updatePeriod, capitalize(key), temptPeriod[key]);
          }
          this.tableData.push(updatePeriod);
        }
      })
  }

  //确认合同选择
  modalOk() {
    // 判断有没有选择合同
    if (this.currentRow['contractName'] != "" && this.currentRow['contractName'] != undefined) {
      this.isModalShow = false;
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].key == this.modalKey) {
          this.tableData[i].contractName = this.currentRow['contractName'];
          this.tableData[i].contractNum = this.currentRow['contractNum'];
          this.tableData[i].schemeOrgName = this.currentRow['contractOrgName'];
        }
      }
      this.currentRow = "";
    } else {
      this.$message.warn("请选择合同");
      this.currentRow = "";
    }
  }

  //取消合同选择（弹窗关闭）
  modalCancel() {
    this.isModalShow = false;
  }

  mounted() {
    this.init();
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
    const dataSource = [...this.tableData];
    const target = dataSource.find(item => item.key === key);
    if (target) {
      target[dataIndex] = value;
      this.tableData = dataSource;
    }
  }

  //点击表格行，执行操作
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.currentRow = record;
        }
      }
    };
  }

  // 保存行（单行）
  saveBtn() {
    if (this.currentRow == "" || this.currentRow == undefined) return this.$message.warn("请选择行！");
    if (this.currentRow['contractName'] == "" || this.currentRow['contractName'] == undefined) return this.$message.warn("请选择合同！");
    Api.schemeManageInsert({
      projectCode: this.projectCode ?? '',
      objList: [this.currentRow]
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.error("保存失败");
        this.$message.success("保存成功");
        this.init();
      })
  }

  // 点击行变色
  setRowClassName(record, index) {
    let rowColor = index % 2 === 0 ? "evenRowStyl" : "";
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }

  toprev() {
    //@ts-ignore
    this.$router.go(-1);
  }
}
</script>

<style lang="less" scoped>
@import (reference) "../../styles/theme.less";

.main {
  .flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.box {
  height: 100%;
  width: 100%;

  /deep/ .ant-table-body {
    .flex;
    flex: 1;
    flex-direction: column;
    height: calc(91vh - 165px);
  }
}

.toprev {
  position: absolute;
  top: 2%;
  left: 0.1%;
  z-index: 999;
  cursor: pointer;
  font-size: 19px;
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
