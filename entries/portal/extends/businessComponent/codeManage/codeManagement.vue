<template>
  <div class="codeManage" style="overflow: auto; height: 46.95vw">
    <a-card title="项目编码管理" style="width: 100%; height: 43.30vw">
      <!-- 外包div 按钮失效  原因未明 -->
      <a-button slot="extra" @click="addBtn" type="primary">添加</a-button>
      <a-button
        slot="extra"
        type="primary"
        @click="saveBtn"
        style="margin-left: 10px"
      >保存
      </a-button>
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
      <!-- 工程量清单表格，此处方案名不能修改，在编辑页面修改 -->
      <a-table
        :columns="tableLabel"
        :data-source="tableData"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
        :scroll="{ x: 1632, y: 675 }"
      >
        <span slot="操作" slot-scope="record">
          <a @click="() => handleEdit(record)">编辑</a>
        </span>
        <template slot="projectName" slot-scope="text, record">
          <a @click="projectPick(record)">{{ record.projectName }}</a>
        </template>
        <template v-for="item in columnSon" :slot="item" slot-scope="text, record">
          <div :key="item">
            <editable-cell
              :text="text"
              @change="onCellChange(record.key, item, $event)"
            />
          </div>
        </template>
      </a-table>
    </a-card>
    <a-modal
      title="项目选择"
      :visible="isProjectShow"
      @cancel="handleCancel"
      @ok="handleOk"
      width="900px"
    >
      <a-table
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
import { Component, Vue, InjectReactive } from "vue-property-decorator";
import axios from "axios";
//@ts-ignore
import { v4 as uuidv4 } from "uuid";
import { Card, Button, Table, Popconfirm, Modal } from "@h3/antd-vue";
import { timeDefault, capitalize } from "../measurePayment/data/util";
import EditableCell from "../measurePayment/data/editTableCell.vue";
import env from "@/config/env";
import * as Type from '../../type';

@Component({
  name: "codeManagement",
  components: {
    ACard: Card,
    AButton: Button,
    ATable: Table,
    APopconfirm: Popconfirm,
    AModal: Modal,
    EditableCell,
  },
})
export default class allProtect extends Vue {
  @InjectReactive("project") projectCode;
  @InjectReactive('projectConfig') projectConfig?:Type.ProjectConfig;
  columnSon: Array<any> = ["remarks"];
  currentRow: string = ""; //点击表格行，保存当前行数据
  isShowConfirm: boolean = false; //控制删除弹窗
  tableData: Array<any> = [];
  tableLabel: Array<any> = [
    // 表头数据
    {
      align: "center",
      className: "column-class",
      title: "项目名称",
      key: "projectName",
      dataIndex: "projectName",
      scopedSlots: { customRender: "projectName" },
    },
    {
      align: "center",
      className: "column-class",
      title: "项目简称",
      key: "nameShort",
      dataIndex: "nameShort",
      scopedSlots: { customRender: "nameShort" },
    },
    {
      align: "center",
      className: "column-class",
      title: "创建时间",
      key: "createdTime",
      dataIndex: "createdTime",
    },
    {
      align: "center",
      className: "column-class",
      title: "备注",
      key: "remarks",
      dataIndex: "remarks",
      scopedSlots: { customRender: "remarks" },
    },
    {
      align: "center",
      className: "column-class",
      title: "操作",
      key: "操作",
      scopedSlots: { customRender: "操作" },
    },
  ];
  projectData: Array<any> = [];
  projectLabel: Array<any> = [
    // 表头数据
    {
      align: "center",
      className: "column-class",
      title: "项目名称",
      key: "projectName",
      dataIndex: "projectName",
    },
    {
      align: "center",
      className: "column-class",
      title: "项目简称",
      key: "shortName",
      dataIndex: "shortName",
    },
    {
      align: "center",
      className: "column-class",
      title: "合同编号",
      key: "contractNum",
      dataIndex: "contractNum",
    },
    {
      align: "center",
      className: "column-class",
      title: "创建时间",
      key: "createdTime",
      dataIndex: "createdTime",
    },
  ];
  isProjectShow: boolean = false;
  markNum: string = "";

  //添加方案
  addBtn() {
    let temptUuid = uuidv4();
    let uuid = temptUuid.split("-").join("");
    let row = {
      projectName: "请选择项目！",
      nameShort: "请选择项目！",
      id: uuid,
      key: uuid,
      createdTime: timeDefault(),
      remarks: "",
    };
    this.tableData.unshift (row);
  }

  //点击删除弹窗-取消按钮
  cancel() {
    this.isShowConfirm = false;
    //@ts-ignore
    this.$message.warn("取消删除");
  }

  //点击删除弹窗-确认按钮
  confirm() {
    this.isShowConfirm = false;
    this.delTableRow();
    // message.success("Next step.");
  }

  //删除行
  delBtn() {
    this.isShowConfirm = true;
  }

  //确认后，执行删除行操作
  delTableRow() {
    if (this.currentRow != null && this.currentRow != "") {
      this.tableData.forEach((v, i) => {
        if (this.currentRow["id"] === v.id) {
          axios
            //@ts-ignore
            .get(`${env.apiHost}/codeManage/mbs_project/deleteById`, {
              params: {
                projectCode: this.projectCode,
                id: v.id,
              },
            })
            .then((res) => {
              //@ts-ignore
              if (res.errcode == 0) {
                //@ts-ignore
                this.$message.success("删除成功");
                this.tableData.splice(i, 1);
              } else {
                //@ts-ignore
                this.$message.error(res.errmsg);
              }
            });
        }
      });
      //@ts-ignore
      this.currentRow = null;
    } else {
      alert("请选择方案");
    }
    // console.log(this.tableData);
  }

  //跳转至编辑页面（list）并传参
  async handleEdit(record) {
    this.currentRow = record;
    this.saveBtn();
    let routeMessage = {};
    for (let key in record) {
      this.$set(routeMessage, key, record[key]);
    }
    this.$set(routeMessage, "projectCode", this.projectCode);
    //@ts-ignore
    this.$router.push({
      path: "/ganttVue",
      query: routeMessage,
    });
  }

  handleCancel() {
    this.isProjectShow = false;
    this.projectData = [];
    this.currentRow = "";
    this.markNum = "";
  }

  handleOk() {
    if (
      this.currentRow != undefined &&
      this.currentRow != "" &&
      this.currentRow != null
    ) {
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.markNum == this.tableData[i].id) {
          this.tableData[i].nameShort = this.currentRow["shortName"];
          this.tableData[i].projectName = this.currentRow["projectName"];
          // this.tableData[i].contractNum=this.currentRow.contractNum;
        }
      }
      this.isProjectShow = false;
      this.projectData = [];
      this.currentRow = "";
      this.markNum = "";
    } else {
      //@ts-ignore
      this.$message.warn("请选择项目！");
    }
  }

  //页面初始化
  init() {
    this.tableData = [];
    const filters:Array<any> = [];
    if(this.projectConfig?.multiProjectFlag){
      filters.push({
        propertyCode: "xmjc_1",
        propertyType: 0,
        // propertyValue: window.Environment.markName,
        propertyValue: this.projectConfig?.projectName??'',
        propertyValueName: "",
      });
    }
    axios
      //@ts-ignore
      .post(`${env.apiHost}/api/runtime/query/list`, {
        customized: this.projectConfig?.multiProjectFlag?true:false,
        filters: filters,
        mobile: false,
        page: 0,
        queryCode: this.projectCode + "_mbs_project",
        schemaCode: this.projectCode + "_mbs_project",
        size: 999999,
      })
      .then((res) => {
        console.log("项目编码管理数据获取", res);
        //@ts-ignore
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
              this.$set(temptPeriod, "key", temptData.id);
            }
            this.tableData.push(temptPeriod);
          }
        } else {
          //@ts-ignore
          this.$message.warn(res.errmsg);
        }
      })
      .catch((err) => {
        console.log(err); //错误信息
      });
  }

  mounted() {
    // this.projectCode=this.$route.params.appCode;
    //this.projectCode="CH";
    this.init();
  }

  // 表格单元格值修改
  onCellChange(key, dataIndex, value) {
    const dataSource = [...this.tableData];
    const target = dataSource.find((item) => item.key === key);
    if (target) {
      target[dataIndex] = value;
      this.tableData = dataSource;
    }
  }

  projectPick(record) {
    this.markNum = record.id;
    this.currentRow = "";
    this.isProjectShow = true;
    this.projectData = [];
    const filters:Array<any> = [];
    if(this.projectConfig?.multiProjectFlag){
      filters.push({
        propertyCode: "xmjc_1",
        propertyType: 0,
        // propertyValue: window.Environment.markName,
        propertyValue: this.projectConfig?.projectName??'',
        propertyValueName: "",
      });
    }
    axios
      //@ts-ignore
      .post(`${env.apiHost}/api/runtime/query/list`, {
        customized: this.projectConfig?.multiProjectFlag?true:false,
        filters: filters,
        mobile: false,
        queryCode: "xiangmujichushuju0",
        schemaCode: this.projectCode + "_gcjsxx_1",
        page: 0,
        size: 999999,
      })
      .then((res) => {
        // console.log("读取合同", res);
        //@ts-ignore
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
          // console.log("合同信息管理", this.projectData);
          // this.$message.success(res.errmsg);
        } else {
          //@ts-ignore
          this.$message.warn(res.errmsg);
        }
      })
      .catch((err) => {
        console.log(err); //错误信息
      });
  }

  //点击表格行，执行操作
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.currentRow = record;
        },
      },
    };
  }

  // 保存行（单行）
  saveBtn() {
    if (this.currentRow == "" || this.currentRow == undefined) {
      //@ts-ignore
      this.$message.warn("请选择行！");
    } else {
      console.log("保存输入", this.currentRow);
      axios
        //@ts-ignore
        .post(`${env.apiHost}/codeManage/mbs_project/insert`, {
          projectCode: this.projectCode,
          mbsProject: this.currentRow,
        })
        .then((res) => {
          console.log(res);
          //@ts-ignore
          if (res.errcode !== 0)  return this.$message.error("保存失败");
          this.init();
        })
        .catch((err) => {
          //@ts-ignore
          this.$message.error("保存失败");
          this.init();
        });
    }
  }

  // 点击行变色
  setRowClassName(record, index) {
    let rowColor = index % 2 === 0 ? "evenRowStyl" : "";
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }
}
</script>

<style>
@import "../measurePayment/data/measure.css";
</style>
<style lang="less">
.codeManage {
  .ant-card-head-title {
    padding-left: 10px;
  }
}
</style>

