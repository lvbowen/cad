<template>
  <div class="HiddenDangerCorrelation">
    <div class="HiddenDangerCorrelation_left">
      <h2>工程划分</h2>
      <div class="eltree">
        <!-- <el-input placeholder="输入关键字进行过滤" v-model="filterText">
        </el-input> -->
        <el-tree
          class="filter-tree"
          :data="data"
          :props="defaultProps"
          defaultExpandAll
          highlightCurrent
          :filterNodeMethod="filterNode"
          ref="tree"
          @node-click="treeClick"
        >
        </el-tree>
      </div>
    </div>
    <div class="HiddenDangerCorrelation_right">
      <div class="title_right flex">
        <h2>隐患清单</h2>
        <div class="btn">
          <el-button v-if="btnShow" @click="deleteRelation">删除</el-button>
          <el-button v-if="btnShow" @click="relation">关联设置</el-button>
          <el-button v-if="!btnShow" @click="cancel">取消</el-button>
          <el-button v-if="!btnShow" @click="handleAddDetails">
            创建关联
          </el-button>
        </div>
      </div>
      <div class="functionBtn flex">
        <span>关键字搜索：</span>
        <el-input @change="search" v-model="inputValue" clearable></el-input>
      </div>
      <div class="eltable">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltipEffect="dark"
          style="width: 100%"
          :headerCellStyle="{ background: 'rgb(235, 235, 235)' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column prop="xh" label="序号"></el-table-column>
          <el-table-column prop="pcxm" label="排查部位"></el-table-column>
          <el-table-column prop="yhlx" label="隐患类型"></el-table-column>
          <el-table-column prop="pcnr" label="隐患内容"></el-table-column>
          <el-table-column prop="yyfx" label="隐患原因"></el-table-column>
          <el-table-column prop="yhlb" label="隐患类别"></el-table-column>
          <el-table-column prop="pcbz" label="排查标准"></el-table-column>
        </el-table>
        <div style="float: right">
          <el-pagination
            class="paging-container"
            @current-change="handleCurrentSuper"
            :currentPage.sync="currentPage1"
            :pageSize="10"
            layout="total,prev, pager, next"
            :total="total"
          >
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Tree from "element-ui/lib/tree";
import Input from "element-ui/lib/input";
import Button from "element-ui/lib/button";
import Message from "element-ui/lib/message";
import Pagination from "element-ui/lib/pagination";
import Vue from "vue";
import MessageBox from "element-ui/lib/message-box";
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$message = Message;
import {
  getSimplifiedTree,
  getRiskListByQbs,
  getAddQbsDangerRelation,
  DeleteQbsDangerRelation,
} from "./server/index.js";
import env from "@/config/env";
export default {
  components: {
    ElTree: Tree,
    ElInput: Input,
    ElButton: Button,
    ElPagination: Pagination,
  },
  data() {
    return {
      qbsCode: "",
      qbsName: "",
      inputValue: "",
      filterText: "",
      qbsId: "",
      projectName: "",
      projectCode: "",
      total: 0,
      currentPage1: 1,
      btnShow: true,
      dangerId: [],
      idList: [],
      tableData: [],
      data: [],
      defaultProps: {
        children: "childs",
        label: "qbsName",
      },
    };
  },
  inject: ["projectConfig"],
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    deleteRelation() {
      if (this.idList.length == 0)
        return this.$message.warning("请先勾选需要删除的隐患项！");
      this.$confirm("是否确认删除该隐患项？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.idList.forEach((e) => {
            DeleteQbsDangerRelation(this.projectCode, this.projectName, e).then(
              (res) => {
                this.inputValue = "";
                this.getRelationTable();
              }
            );
          });
          this.$message({
            type: "success",
            message: "删除成功！",
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //关联表单
    getRelationTable() {
      getRiskListByQbs(
        this.projectCode,
        this.projectName,
        this.qbsId,
        this.currentPage1,
        10,
        this.btnShow,
        this.inputValue
      ).then((res) => {
        this.tableData = res.data.records;
        this.total = res.data.total;
      });
    },
    //树点击
    treeClick(val) {
      console.log(val);
      if (val.leaf) {
        this.qbsName = val.qbsName;
        this.qbsCode = val.qbsCode;
        this.qbsId = val.id;
        this.currentPage1 = 1;
        this.inputValue = "";
        this.btnShow = true;
        this.getRelationTable();
      }
    },
    //分页查询
    handleCurrentSuper(val) {
      this.currentPage1 = val;
      this.getRelationTable();
    },
    //创建关联
    handleAddDetails() {
      if (this.dangerId.length == 0)
        return this.$message.warning("请先勾选隐患清单！");
      this.$confirm("是否确认将勾选的隐患项关联到该部位上？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const cmd = {
          addDTO: {
            dangerId: this.dangerId,
            qbsCode: this.qbsCode,
            qbsId: this.qbsId,
            qbsName: this.qbsName,
          },
          appCode: this.projectCode,
          projectName: this.projectName,
        };
        getAddQbsDangerRelation(cmd).then((res) => {
          if (res.data.sucFlag) {
            this.$message({
              type: "success",
              message: res.data.message,
            });
            this.btnShow = true;
            this.inputValue = "";
            this.getRelationTable();
          } else {
            this.$message({
              type: "info",
              message: res.data.message,
            });
          }
        });
      });
      // .catch(() => {
      //   this.$message({
      //     type: "info",
      //     message: "已取消删除",
      //   });
      // });
    },
    //搜索
    search(val) {
      this.inputValue = val;
      this.currentPage1 = 1;
      this.getRelationTable();
    },
    //关联设置 未关联表单
    relation() {
      this.btnShow = false;
      this.currentPage1 = 1;
      this.inputValue = "";
      this.getRelationTable();
    },
    //取消
    cancel() {
      this.btnShow = true;
      this.inputValue = "";
      this.getRelationTable();
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //勾选表格
    handleSelectionChange(val) {
      if (!this.btnShow) {
        this.dangerId = [];
        val.forEach((e) => {
          this.dangerId.push(e.id);
        });
      } else {
        this.idList = [];
        val.forEach((e) => {
          this.idList.push(e.relationId);
        });
      }
    },
  },
  mounted() {
    this.projectCode = `${env.project}`;
    this.projectName = this.projectConfig?.projectName ?? "";
    getSimplifiedTree(this.projectCode, this.projectName).then((res) => {
      this.data = res.data;
    });
  },
};
</script>

<style lang="less" scoped>
.HiddenDangerCorrelation {
  height: 100%;
  background: #fff;
  display: flex;
  .HiddenDangerCorrelation_left {
    width: 20.5%;
    border: 1px solid #e8e8e8;
    margin-right: 10px;
    h2 {
      width: 100%;
      height: 40px;
      font-size: 15px;
      line-height: 40px;
      background: #f8fbff;
      border-bottom: 1px solid #e8e8e8;
      padding: 2px 15px;
    }
    .eltree {
      padding: 10px;
      height: 94%;
      overflow: auto;
    }
  }
  .HiddenDangerCorrelation_right {
    width: 79%;
    border: 1px solid #e8e8e8;
    .title_right {
      height: 40px;
      line-height: 40px;
      background: #f8fbff;
      border-bottom: 1px solid #e8e8e8;
      padding: 2px 15px;
      margin-bottom: 10px;
      justify-content: space-between;
      .btn {
        line-height: 35px;
      }
      h2 {
        font-size: 15px;
      }
    }
    .functionBtn {
      justify-content: space-between;
      padding: 2px 15px;
      span {
        line-height: 31px;
      }
    }
    .eltable {
      padding: 10px;
    }
  }
  .flex {
    display: flex;
  }
}
</style>

<style lang="less">
.HiddenDangerCorrelation {
  .number:before {
    content: none;
  }
  .el-button {
    padding: 7px 16px !important;
  }
  .el-input {
    width: 93%;
  }
  .el-input__inner {
    width: 25%;
    height: 32px;
    line-height: 32px;
  }
  .el-table__row {
    .el-input__inner {
      width: 100%;
    }
  }
}
</style>
