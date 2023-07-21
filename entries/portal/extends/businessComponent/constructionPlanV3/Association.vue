<template>
  <div class="Association">
    <div class="engineering">
      <h3>编码树</h3>
      <div class="table">
        <div class="search">
          <a-input-search
            v-model="valWbs"
            placeholder="请输入关键字"
            enterButton
            @search="onSearchWbs"
          />
          <el-button @click="addRootClick">新增根节点</el-button>
          <el-button @click="addSonClick">新增子节点</el-button>
          <el-button @click="fixClick">批量修改</el-button>
          <el-button type="danger" @click="deleteClick">删除</el-button>
        </div>
        <div class="atable">
          <vxe-table
            :columnConfig="{ resizable: true }"
            showOverflow
            autoResize
            class="mytable-scrollbar"
            rowId="id"
            height="620"
            ref="xTree"
            :treeConfig="{
              reserve: true,
              transform: true,
              rowField: 'id',
              parentField: 'parentId',
              lazy: true,
              hasChild: 'hasChild',
              loadMethod: expandChange,
              expandRowKeys: expandedTableKeys,
            }"
            :rowConfig="{ isCurrent: true, isHover: true }"
            :editConfig="{ trigger: 'click', mode: 'row' }"
            :data="tableData"
            @checkbox-change="onSelectChange"
            @current-change="rowClick"
          >
            <vxe-column type="checkbox" width="60"></vxe-column>
            <vxe-column
              field="bs"
              title="编码"
              minWidth="160"
              treeNode
              :editRender="{}">
              <template #edit="{ row }">
                <a-input @blur="EnterClick(row)" v-model="row.bs"></a-input>
              </template>
            </vxe-column>
            <vxe-column field="planDetailName" minWidth="120" title="名称"></vxe-column>
            <vxe-column field="planDetailPeriod" minWidth="120" title="计划工期"></vxe-column>
            <vxe-column field="planDetailStart" minWidth="120" title="计划开始时间"></vxe-column>
            <vxe-column field="planDetailEnd" minWidth="120" title="计划完成时间"></vxe-column>
            <vxe-column field="planDetailUnit" minWidth="100" title="单位"></vxe-column>
            <vxe-column field="planDetailUnitPrice" minWidth="120" title="综合单价"></vxe-column>
            <vxe-column field="planDetailAmount" minWidth="120" title="计划数量"></vxe-column>
            <vxe-column field="planDetailMoney" minWidth="120" title="计划产值"></vxe-column>
            <vxe-column field="codeType" minWidth="120" title="编码类别"></vxe-column>
            <vxe-column field="warningProportion" minWidth="100" title="预警"></vxe-column>
          </vxe-table>
        </div>
      </div>
    </div>
    <div class="MBS">
      <h3>QBS编码</h3>
      <div class="table">
        <div class="search">
          <a-input-search
            v-if="!relation"
            v-model="valMbs"
            placeholder="请输入关键字"
            enterButton
            @search="onSearchMbs"
          />
          <el-button v-if="!relation" @click="ConfirmClick" type="primary">确认关联</el-button>
          <el-button v-if="!relation" @click="NoAssociateClick" type="primary">{{ NoAssociateTitle }}</el-button>
          <el-button @click="relationClick" type="primary">{{ relationTitle }}</el-button>
        </div>
        <vxe-table
          v-if="relation"
          resizable
          rowId="id"
          class="mytable-scrollbar"
          height="620"
          :data="tableDataQbs"
          :treeConfig="{ transform: true }"
          :checkboxConfig="{ labelField: 'qbsCode', children: 'childs' }"
          @checkbox-change="selectChangeEvent"
        >
          <vxe-column type="checkbox" title="QBS编码" treeNode></vxe-column>
          <vxe-column field="qbsName" title="构件名称"></vxe-column>
        </vxe-table>
        <vxe-table
          v-if="!relation"
          class="mytable-scrollbar"
          height="620"
          resizable
          rowId="id"
          :data="tableDataQbs"
          :treeConfig="{
            rowField: 'id',
            expandRowKeys: expandedMbsKeys,
            children: 'childs',
          }"
          :checkboxConfig="{
            labelField: 'qbsCode',
            checkRowKeys: checkRowKeys,
          }"
          @checkbox-change="selectChangeEvent"
        >
          <vxe-column type="checkbox" title="QBS编码" treeNode></vxe-column>
          <vxe-column field="qbsName" title="名称"></vxe-column>
        </vxe-table>
      </div>
    </div>
    <a-modal
      title="批量修改"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel">
      <div>
        <span>计划开始时间：</span>
        <a-date-picker v-model="planDetailStart" @change="onChangeStart" />
      </div>
      <div>
        <span>计划完成时间：</span>
        <a-date-picker v-model="planDetailEnd" @change="onChangeEnd" />
      </div>
      <div>
        <span>计划数量：</span>
        <a-input :defaultValue="planDetailAmount" size="small" @change="stateChangeAmount" />
      </div>
      <div>
        <span>计划产值：</span>
        <a-input :defaultValue="planDetailMoney" size="small" @change="stateChangeMoney" />
      </div>
    </a-modal>
    <a-modal
      :title="addTitle"
      :visible="Addvisible"
      @ok="handleAddOk"
      @cancel="handleAddCancel">
      <a-form-model :model="form">
        <a-form-model-item label="编码">
          <a-input v-model="form.wbs" />
        </a-form-model-item>
        <a-form-model-item label="名称">
          <a-input v-model="form.planDetailName" />
        </a-form-model-item>
        <a-form-model-item label="单位">
          <a-input v-model="form.planDetailUnit" />
        </a-form-model-item>
        <a-form-model-item label="综合单价">
          <a-input v-model="form.planDetailUnitPrice" />
        </a-form-model-item>
        <a-form-model-item label="计划数量">
          <a-input v-model="form.planDetailAmount" />
        </a-form-model-item>
        <a-form-model-item label="计划产值">
          <a-input v-model="form.planDetailMoney" />
        </a-form-model-item>
        <a-form-model-item label="预警">
          <a-input v-model="form.warningProportion" />
        </a-form-model-item>
        <!-- <a-form-model-item label="计划工期">
          <a-input v-model="form.planDetailPeriod" />
        </a-form-model-item> -->
        <a-form-model-item label="计划开始时间">
          <a-date-picker
            v-model="form.planDetailStart"
            placeholder="计划开始时间"
            style="width: 100%"
          />
        </a-form-model-item>
        <a-form-model-item label="计划完成时间">
          <a-date-picker
            v-model="form.planDetailEnd"
            placeholder="计划完成时间"
            style="width: 100%"
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import Input from "ant-design-vue/lib/input";
import "ant-design-vue/lib/input/style/index.css";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.css";
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import FormModel from "ant-design-vue/lib/form-model";
import "ant-design-vue/lib/form-model/style/index.css";
import {
  getTreeChildList,
  getMBSModelList,
  refreshWBSList2,
  getMBSBottom,
} from "../../service/api";
import DatePicker from "ant-design-vue/lib/date-picker";
import "ant-design-vue/lib/date-picker/style/index.css";
import env from "@/config/env";
import axios from "axios";
import moment from "moment";
import { Utils } from "@ctesi/core";

import Vue from "vue";
import VXETable from "vxe-table";
import "vxe-table/lib/style.css";

Vue.use(VXETable);
export default {
  components: {
    AInputSearch: Input.Search,
    AFormModel: FormModel,
    AFormModelItem: FormModel.Item,
    // ATable: Table,
    AModal: Modal,
    ADatePicker: DatePicker,
  },
  inject: ["projectConfig"],
  data() {
    return {
      valWbs: "",
      valMbs: "",
      bs: "",
      tableData: [],
      selectedRowKeys: [],
      expandedTableKeys: [],
      expandedMbsKeys: [],
      columns: [
        {
          dataIndex: "bs",
          title: "编码",
          width: "300px",
          scopedSlots: { customRender: "bs" },
        },
        {
          dataIndex: "planDetailName",
          title: "名称",
          align: "center",
          editor: {
            type: "textbox",
          },
        },
        {
          dataIndex: "planDetailPeriod",
          title: "计划工期",
          align: "center",
          // scopedSlots: { customRender: "planDetailPeriod" },
        },
        {
          dataIndex: "planDetailStart",
          title: "计划开始时间",
          align: "center",
          // scopedSlots: { customRender: "planDetailStart" },
        },
        {
          dataIndex: "planDetailEnd",
          title: "计划完成时间",
          align: "center",
          // scopedSlots: { customRender: "planDetailEnd" },
        },
        {
          dataIndex: "planDetailUnit",
          title: "单位",
          align: "center",
        },
        {
          dataIndex: "planDetailUnitPrice",
          title: "综合单价",
          align: "center",
        },
        {
          dataIndex: "planDetailAmount",
          title: "计划数量",
          align: "center",
        },
        {
          dataIndex: "planDetailMoney",
          title: "计划产值",
          align: "center",
        },
        {
          dataIndex: "codeType",
          title: "编码类别",
          align: "center",
        },
        {
          dataIndex: "warningProportion",
          title: "预警",
          align: "center",
        },
      ],
      tableDataQbs: [],
      columnsMbs: [],
      listRemove: [],
      columnsMbsTable: [
        {
          title: "QBS编码",
          dataIndex: "bs",
          key: "bs",
        },
        {
          title: "名称",
          dataIndex: "planDetailName",
          key: "planDetailName",
        },
      ],
      columnsMbsTree: [
        {
          title: "QBS编码",
          dataIndex: "bs",
          key: "bs",
        },
        {
          title: "名称",
          dataIndex: "taskName",
          key: "taskName",
        },
      ],
      projectCode: "",
      schedulePlanId: "",
      qbsId: "",
      relation: true,
      relationTitle: "关联设置",
      planDetailStart: "",
      planDetailEnd: "",
      planDetailMoney: "",
      planDetailPeriod: "",
      planDetailAmount: "",
      id: "",
      mbsData: {},
      visible: false,
      Addvisible: false,
      fixLists: [],
      isCheckedLists: [],
      form: {
        id: "",
        Name: "",
        bs: "",
        wbs: "",
        codeType: "WBS",
        state: "add",
        th04aPlanschemeFk: "",
        th04aPlandetailFk: "",
        planDetailName: "",
        planDetailUnitPrice: "",
        planDetailPeriod: "",
        warningProportion: "",
        planDetailUnit: "",
        planDetailStart: "",
        planDetailEnd: "",
        planDetailMoney: "",
        planDetailAmount: "",
      },
      addTitle: "",
      checkRowKeys: [],
      NoAssociateTitle: "未关联编码树",
      isAssociate: true
    };
  },
  methods: {
    selectChangeEvent({ $table }) {
      const records = $table.getCheckboxRecords();
      this.isCheckedLists = records;
    },
    //计算日期天数
    getDiffDay(date_1, date_2) {
      // 计算两个日期之间的差值
      let totalDays, diffDate;
      let myDate_1 = Date.parse(date_1);
      let myDate_2 = Date.parse(date_2);
      // 将两个日期都转换为毫秒格式，然后做差
      diffDate = Math.abs(myDate_1 - myDate_2); // 取相差毫秒数的绝对值
      totalDays = Math.floor(diffDate / (1000 * 3600 * 24)); // 向下取整
      return totalDays; // 相差的天数
    },
    handleAddOk() {
      if (this.addTitle == "新增子节点") {
        this.form.th04aPlandetailFk = this.qbsId;
      }
      this.form.id = Utils.uuid();
      this.form.bs = this.form.wbs;
      this.form.Name = this.form.planDetailName;
      this.form.th04aPlanschemeFk = this.schedulePlanId;
      if (this.form.planDetailStart && this.form.planDetailEnd) {
        this.form.planDetailStart = moment(this.form.planDetailStart).format("YYYY-MM-DD");
        this.form.planDetailEnd = moment(this.form.planDetailEnd).format("YYYY-MM-DD");
        this.form.planDetailPeriod = this.getDiffDay(
          this.form.planDetailStart,
          this.form.planDetailEnd
        );
      }
      const list = [];
      list.push(this.form);
      refreshWBSList2({ list: list, projectCode: this.projectCode }).then((ress) => {
        this.getinitTable();
      });
      this.Addvisible = false;
    },
    handleAddCancel() {
      this.Addvisible = false;
    },
    addRootClick() {
      this.addTitle = "新增根节点";
      this.form = {
        id: "",
        Name: "",
        bs: "",
        wbs: "",
        codeType: "WBS",
        state: "add",
        th04aPlanschemeFk: "",
        th04aPlandetailFk: "",
        planDetailName: "",
        planDetailUnitPrice: "1",
        planDetailPeriod: "",
        warningProportion: "1",
        planDetailUnit: "1",
        planDetailStart: "",
        planDetailEnd: "",
        planDetailMoney: "1",
        planDetailAmount: "1",
      };
      this.Addvisible = true;
    },
    addSonClick() {
      if (!this.qbsId) return this.$message.error("请先选择wbs编码");
      this.addTitle = "新增子节点";
      this.form = {
        id: "",
        Name: "",
        bs: "",
        wbs: "",
        codeType: "WBS",
        state: "add",
        th04aPlanschemeFk: "",
        th04aPlandetailFk: "",
        planDetailName: "",
        planDetailUnitPrice: "1",
        planDetailPeriod: "",
        warningProportion: "1",
        planDetailUnit: "1",
        planDetailStart: "",
        planDetailEnd: "",
        planDetailMoney: "1",
        planDetailAmount: "1",
      };
      this.Addvisible = true;
    },
    fixClick() {
      this.visible = true;
    },
    handleOk() {
      this.planDetailPeriod = this.getDiffDay(this.planDetailStart, this.planDetailEnd);
      this.fixLists?.forEach((item) => {
        item.planDetailStart = this.planDetailStart;
        item.planDetailEnd = this.planDetailEnd;
        item.planDetailPeriod = this.planDetailPeriod;
        item.planDetailAmount = this.planDetailAmount;
        item.planDetailMoney = this.planDetailMoney;
        item.th04aPlanschemeFk = this.schedulePlanId;
        item.state = "refresh";
        item.Name = item.planDetailName;
      });
      refreshWBSList2({
        list: this.fixLists,
        projectCode: this.projectCode,
      }).then((ress) => {
        this.visible = false;
        if (ress.errcode == 0) return this.getinitTable();
      });
    },
    handleCancel() {
      this.visible = false;
    },
    deleteClick() {
      const idLists = [];
      this.listRemove.forEach((e) => {
        idLists.push(e.id);
      });
      refreshWBSList2({
        list: [],
        projectCode: this.projectCode,
        listRemove: idLists,
      }).then((res) => {
        if (res.errcode == 0) {
          this.listRemove = [];
          this.getinitTable();
        }
      });
    },
    EnterClick(vals) {
      vals.state = "refresh";
      vals.wbs = vals.bs;
      const arr = [];
      arr.push(vals);
      refreshWBSList2({ list: arr, projectCode: this.projectCode }).then((ress) => {
        // if (ress.errcode == 0) return this.getinitTable();
      });
    },
    stateChangeAmount(val) {
      this.planDetailAmount = val.target.value;
    },
    stateChangeMoney(val) {
      this.planDetailMoney = val.target.value;
    },
    onChangeStart(val) {
      this.planDetailStart = moment(val).format("YYYY-MM-DD");
    },
    onChangeEnd(val) {
      this.planDetailEnd = moment(val).format("YYYY-MM-DD");
    },
    expandChange({ row }) {
      return new Promise((resolve) => {
        getTreeChildList({
          projectCode: this.projectCode,
          schedulePlanId: this.schedulePlanId,
          model: "1",
          id: row.id,
        }).then((res) => {
          setTimeout(() => {
            resolve(res.data);
          }, 500);
        });
      });
    },
    onSelectChange({ $table }) {
      const records = $table.getCheckboxRecords();
      this.fixLists = records;
      this.listRemove = records;
    },
    onSearchWbs(val) {
      getTreeChildList({
        projectCode: this.projectCode,
        schedulePlanId: this.schedulePlanId,
        model: "1",
        id: "",
        planDetailName: val,
      }).then((res) => {
        this.expandedTableKeys = [];
        this.$nextTick().then(() => {
          res.data?.forEach((e) => {
            this.expandedTableKeys.push(e.id);
          });
        });
        //haschild = false
        this.tableData = res.data;
      });
    },
    onSearchMbs(val) {
      this.getMbsTree(val);
    },
    rowClick({ row }) {
      this.id = row.id;
      console.log(row);
      if (row.codeType == "WBS") {
        this.qbsId = row.id;
      }
      this.planDetailStart = row.planDetailStart;
      this.planDetailEnd = row.planDetailEnd;
      this.planDetailMoney = row.planDetailMoney;
      this.planDetailAmount = row.planDetailAmount;
      if (this.relation) {
        getMBSModelList({
          qbsId: this.qbsId,
        }).then((res) => {
          this.tableDataQbs = res.data;
        });
      } else {
        this.getMbsTree("");
      }
    },
    getMbsTree(val,vals) {
      axios
        .get(`${env.apiHost}/api/quality/v2/qbs/simplifiedTree`, {
          params: {
            appCode: this.projectCode,
            name: val,
            projectName: this.projectConfig?.projectName ?? "",
            noAssociated: vals??false
          },
        })
        .then((res) => {
          this.$nextTick().then(() => {
            this.expandedMbsKeys = [];
            res.data.forEach((e) => {
              this.expandedMbsKeys.push(e.id);
            });
          });
          this.tableDataQbs = res.data;
          res.data?.forEach((e) => {
            if (e.mark) {
              this.checkRowKeys.push(e.id);
            }
            if (e.hasOwnProperty("children")) {
              // eslint-disable-next-line no-shadow
              const generator = (val) => {
                //这里做一个递归查找
                val?.forEach((item) => {
                  if (item.mark) {
                    this.checkRowKeys.push(item.id);
                  }
                  if (item.children && item.children.length > 0) {
                    generator(item.children);
                  }
                });
              };
              generator(e.children);
            }
          });
          this.selectedRowKeys = [];
        });
    },
    relationClick() {
      this.relation = !this.relation;
      if (this.relation) {
        this.relationTitle = "关联设置";
        this.columnsMbs = this.columnsMbsTable;
        this.tableDataQbs = [];
      } else {
        this.relationTitle = "取消关联";
        this.NoAssociateTitle = "未关联编码树"
        this.isAssociate = true
        this.columnsMbs = this.columnsMbsTree;
        this.getMbsTree("");
      }
    },
    //确认关联
    ConfirmClick() {
      if (!this.qbsId) return this.$message.error("请先选择wbs编码");
      this.planDetailPeriod = this.getDiffDay(this.planDetailStart, this.planDetailEnd);
      var qwer = [];
      this.isCheckedLists.forEach((e) => {
        if (e.leaf) {
          e.leaf = 1;
          qwer.push(e);
        }
      });
      qwer.forEach((e) => {
        e.bs = e.qbsCode;
        e.UID = Utils.uuid();
        e.wbs = e.qbsCode;
        e.ta01CodeFk = e.id;
        e.Name = e.qbsName;
        e.codeType = "QBS";
        e.state = "add";
        e.Critical = 0;
        e.warningProportion = 1;
        e.id = Utils.uuid();
        e.planDetailName = e.qbsName;
        e.planDetailStart = this.planDetailStart;
        e.planDetailEnd = this.planDetailEnd;
        e.planDetailMoney = this.planDetailMoney;
        e.th04aPlanschemeFk = this.schedulePlanId;
        e.th04aPlandetailFk = this.qbsId;
      });
      refreshWBSList2({ list: qwer, projectCode: this.projectCode }).then((res) => {
        this.getinitTable();
      });
      this.relation = true;
      this.relationTitle = "关联设置";
      this.tableDataQbs = [];
    },
    getinitTable() {
      getTreeChildList({
        projectCode: this.projectCode,
        schedulePlanId: this.schedulePlanId,
        model: "1",
        id: "",
      }).then((res) => {
        this.expandedTableKeys = [];
        this.$nextTick().then(() => {
          res.data?.forEach((e) => {
            this.expandedTableKeys.push(e.id);
          });
        });
        this.tableData = res.data;
      });
    },
    //未关联树
    NoAssociateClick(){
      this.isAssociate = !this.isAssociate
      if(this.isAssociate) {
        this.NoAssociateTitle = "未关联编码树"
        this.getMbsTree("",false)
      }else {
        this.NoAssociateTitle = "全部编码树"
        this.getMbsTree("",true)
      }
    }
  },
  mounted() {
    this.projectCode = `${env.project}`;
    this.schedulePlanId = this.$route.query.id;
    this.columnsMbs = this.columnsMbsTable;
    this.getinitTable();
  },
};
</script>

<style lang="less" scoped>
.Association {
  display: flex;
  height: 100%;
  h3 {
    background: #f8fbff;
    border-bottom: 1px solid #e8e8e8;
    height: 42px;
    line-height: 42px;
    padding-left: 10px;
  }
  .search {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
  }
  .engineering {
    width: 60%;
    border: 1px solid #e8e8e8;
    height: 100%;
    .table {
      padding: 20px;
    }
    /deep/ .selectedClass {
      background: #e6f7ff;
    }
  }
  .MBS {
    width: 40%;
    border: 1px solid #e8e8e8;
    .table {
      padding: 20px;
    }
    /deep/ .ant-table-tbody > tr.ant-table-row-selected td {
      background: #fff0a6;
    }
  }
}
/deep/.ant-form {
  display: flex;
  flex-wrap: wrap;
}
/deep/.ant-form-item {
  width: 47%;
  margin-right: 10px;
  margin-bottom: 0;
}
/*滚动条整体部分*/
.mytable-scrollbar ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
/*滚动条的轨道*/
.mytable-scrollbar ::-webkit-scrollbar-track {
  background-color: #ffffff;
}
/*滚动条里面的小方块，能向上向下移动*/
.mytable-scrollbar ::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 5px;
  border: 1px solid #f1f1f1;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
.mytable-scrollbar ::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}
.mytable-scrollbar ::-webkit-scrollbar-thumb:active {
  background-color: #787878;
}
/*边角，即两个滚动条的交汇处*/
.mytable-scrollbar ::-webkit-scrollbar-corner {
  background-color: #ffffff;
}
</style>

<style lang="less">
.Association {
  .el-button {
    padding: 8px 16px;
  }
  .engineering {
    .ant-input-group {
      width: 50%;
    }
  }
  .MBS {
    .ant-input-group {
      width: 70%;
    }
  }
  .atable {
    .el-button {
      padding: 4px;
    }
    .ant-input {
      width: 65%;
      margin-right: 10px;
    }
  }
}
</style>
