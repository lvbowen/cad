<template>
  <div class="ProjectLocation">
    <!-- <div style="width: 800px; height: 600px; overflow: hidden; border: 0px"> -->
    <!-- <div style="width: 500px; height: 800px; margin: -175px 0px 0px 0px">
        <iframe
          src="http://tianqi.2345.com/air-59134.htm"
          hspace="1100"
          vspace="-150"
          width="500px"
          height="600"
          scrolling="no"
          frameborder="0"
        ></iframe>
      </div>
    </div> -->
    <div class="ProjectLocation_left">
      <h2>工程部位</h2>
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
          :expandOnClickNode="false"
          ref="tree"
          @node-click="treeClick"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span> {{ node.label }} </span>
            <i v-if="data.leaf && !data.done"></i>
          </span>
        </el-tree>
      </div>
    </div>
    <div class="ProjectLocation_right">
      <div class="title_right flex">
        <h2>隐患列表</h2>
      </div>
      <div class="functionBtn flex">
        <div>
          <el-button @click="handle">批量处理</el-button>
        </div>
        <div style="width: 68%" class="flex">
          <div class="search">
            <span>搜索：</span>
            <el-input v-model="value1" @change="inputSearch"></el-input>
          </div>
          <div class="datepicker">
            <span class="demonstration">开始时间：</span>
            <el-date-picker
              v-model="value2"
              type="daterange"
              align="right"
              unlinkPanels
              rangeSeparator="至"
              startPlaceholder="开始日期"
              endPlaceholder="结束日期"
              valueFormat="yyyy-MM-dd"
              :pickerOptions="pickerOptions"
              @change="changeDate"
            >
            </el-date-picker>
          </div>
          <div class="checkbox">
            <el-checkbox v-model="checked">只显示子级内容</el-checkbox>
          </div>
        </div>
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
          <el-table-column prop="num" label="序号"> </el-table-column>
          <el-table-column prop="qbsCode" label="所属部位"></el-table-column>
          <el-table-column
            prop="planDetailStart"
            label="计划开始时间"
          ></el-table-column>
          <el-table-column prop="pcnr" label="隐患内容"></el-table-column>
          <el-table-column prop="yhlx" label="隐患类型"></el-table-column>
          <el-table-column prop="yhlb" label="隐患类别"></el-table-column>
          <el-table-column prop="yyfx" label="隐患原因分析"></el-table-column>
          <el-table-column
            prop="processState"
            label="预警状态"
          ></el-table-column>
          <el-table-column
            prop="processMethod"
            label="处理状态"
          ></el-table-column>
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
    <div>
      <el-dialog title="批量处理" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="处理状态" labelWidth="100px">
            <el-select
              @change="changeOption"
              v-model="form.region1"
              placeholder="请选择处理状态"
            >
              <el-option
                v-for="item in options1"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="处理方式" labelWidth="100px">
            <el-select v-model="form.region2" placeholder="请选择处理方式">
              <el-option
                v-for="item in options2"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submit"> 确 定 </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Tree from "element-ui/lib/tree";
import Input from "element-ui/lib/input";
import Button from "element-ui/lib/button";
import Checkbox from "element-ui/lib/checkbox";
import Dialog from "element-ui/lib/dialog";
import Form from "element-ui/lib/form";
import FormItem from "element-ui/lib/form-item";
import Select from "element-ui/lib/select";
import Option from "element-ui/lib/option";
import Pagination from "element-ui/lib/pagination";
import DatePicker from "element-ui/lib/date-picker";
import {
  getUnProcessQbsTree,
  getqbsDangerSchedule,
  getupdateQbsDangerRelation,
} from "./server/index.js";
import env from "@/config/env";
export default {
  components: {
    ElTree: Tree,
    ElInput: Input,
    ElButton: Button,
    ElCheckbox: Checkbox,
    ElDatePicker: DatePicker,
    ElDialog: Dialog,
    ElForm: Form,
    ElFormItem: FormItem,
    ElSelect: Select,
    ElOption: Option,
    ElPagination: Pagination,
  },
  inject: ["projectConfig"],
  data() {
    return {
      form: {
        region1: "",
        region2: "",
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      value1: "",
      value2: "",
      filterText: "",
      dialogFormVisible: false,
      checked: false,
      tableData: [],
      data: [],
      defaultProps: {
        children: "childs",
        label: "qbsName",
      },
      isAllDisplay: true,
      projectCode: "",
      projectName: "",
      qbsId: "",
      qbsCode: "",
      currentPage1: 1,
      total: 0,
      startTime: "",
      endTime: "",
      keyWords: "",
      isCheckData: [],
      options1: [
        {
          value: "已处理",
          label: "已处理",
        },
        {
          value: "已查阅",
          label: "已查阅",
        },
      ],
      options2: [],
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    spanClick(val, vals) {
      console.log(val);
      console.log(vals);
    },
    getTableData() {
      getqbsDangerSchedule(
        this.projectCode,
        this.projectName,
        this.qbsId,
        this.qbsCode,
        this.currentPage1,
        10,
        this.startTime,
        this.endTime,
        this.checked,
        this.keyWords
      ).then((res) => {
        this.tableData = res.data.records;
        this.total = res.data.total;
      });
    },
    submit() {
      this.dialogFormVisible = false;
      const cmd = {
        appCode: this.projectCode,
        projectName: this.projectName,
        updateList: [
          {
            processMethod: "",
            processState: "",
            relationId: "",
          },
        ],
      };
      cmd.updateList = this.isCheckData.map((val) => {
        return {
          relationId: val.relationId,
          processMethod: this.form.region1,
          processState: this.form.region2,
        };
      });
      getupdateQbsDangerRelation(cmd).then((res) => {
        this.$message.success(res.errmsg);
        this.getTableData();
        getUnProcessQbsTree(
          this.projectCode,
          this.projectName,
          this.isAllDisplay
        ).then((resData) => {
          this.data = resData.data;
        });
      });
    },
    inputSearch(val) {
      this.keyWords = val;
      this.currentPage1 = 1;
      this.getTableData();
    },
    changeDate(val) {
      if (val) {
        this.startTime = val[0];
        this.endTime = val[1];
      } else {
        this.startTime = "";
        this.endTime = "";
      }
      this.currentPage1 = 1;
      this.getTableData();
    },
    handleCurrentSuper(val) {
      this.currentPage1 = val;
      this.getTableData();
    },
    changeOption(val) {
      if (val == "已处理") {
        this.options2 = [
          {
            value: "已采用控制办法，降低隐患类别",
            label: "已采用控制办法，降低隐患类别",
          },
          {
            value: "已查看隐患内容，暂无风险发生",
            label: "已查看隐患内容，暂无风险发生",
          },
        ];
      } else if (val == "已查阅") {
        this.options2 = [
          {
            value: "无需处理，可忽略",
            label: "无需处理，可忽略",
          },
        ];
      }
    },
    handle() {
      if (this.isCheckData.length === 0) {
        this.$message.error("请先勾选隐患项！");
      } else {
        this.form = {
          region1: "",
          region2: "",
        };
        this.dialogFormVisible = true;
      }
    },
    treeClick(val) {
      this.qbsId = val.id;
      this.qbsCode = val.qbsCode;
      this.getTableData();
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    handleSelectionChange(val) {
      this.isCheckData = val;
    },
  },
  mounted() {
    console.log(this.$route);
    this.projectCode = `${env.project}`;
    this.projectName = this.projectConfig?.projectName ?? "";
    if (this.$route.query.isAllDisplay) {
      this.isAllDisplay = false;
    }
    getUnProcessQbsTree(
      this.projectCode,
      this.projectName,
      this.isAllDisplay
    ).then((res) => {
      this.data = res.data;
    });
  },
};
</script>

<style lang="less" scoped>
.ProjectLocation {
  height: 100%;
  background: #fff;
  display: flex;
  .ProjectLocation_left {
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
      padding: 15px;
      height: 95%;
      .el-tree {
        width: 100%;
        height: 100%;
        overflow-x: auto;
      }
    }
  }
  .ProjectLocation_right {
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
    .search {
      width: 30%;
    }
    .datepicker {
      width: 65%;
      .demonstration {
        margin-right: 10px;
      }
    }
    .checkbox {
      line-height: 34px;
    }
    .eltable {
      padding: 10px;
    }
  }
  .flex {
    display: flex;
  }
}
.custom-tree-node {
  i {
    display: inline-block;
    width: 6px;
    height: 6px;
    vertical-align: middle;
    border-radius: 50%;
    margin-left: 5px;
    background: red;
  }
}
</style>

<style lang="less">
.ProjectLocation {
  .el-select {
    width: 80%;
  }
  .el-dialog {
    width: 30%;
  }
  .el-button {
    padding: 7px 16px !important;
  }
  .el-input {
    width: 80%;
  }
  .search {
    .el-input__inner {
      width: 95%;
      height: 32px;
      line-height: 32px;
    }
  }
  .datepicker {
    .el-input__inner {
      width: 80%;
      height: 36px;
      line-height: 32px;
    }
    .el-input__icon {
      line-height: 25px;
    }
  }
  .el-table__row {
    .el-input__inner {
      width: 100%;
    }
  }
}
.number:before {
  content: none;
}
</style>
