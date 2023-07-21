<template>
  <div class="PersonnelAttendance">
    <div class="treeTable">
      <div class="eltree">
        <h3>组织架构</h3>
        <el-tree
          class="filter-tree"
          :data="data"
          :props="defaultProps"
          defaultExpandAll
          ref="tree"
          @node-click="handleClick"
          :expandOnClickNode="false"
          highlightCurrent
        >
        </el-tree>
      </div>
      <div class="eltable">
        <h3>组织架构</h3>
        <div class="screen">
          <div class="btninput">
            <el-input
              @change="search"
              placeholder="输入关键字进行搜索"
              v-model="filterText"
            >
            </el-input>
            <el-button type="primary" slot="append" icon="el-icon-search"></el-button>
          </div>
          <div class="btnClick">
            <el-button @click="exportExcel" type="primary">导出</el-button>
            <el-date-picker
              v-model="attendanceDate"
              align="right"
              type="month"
              placeholder="选择月"
              valueFormat="yyyy-MM"
              @change="selectDate"
              :pickerOptions="pickerOptions"
            >
            </el-date-picker>
          </div>
        </div>
        <div class="tableBox">
          <el-table
            :data="tableData.slice((currentPage1 - 1) * 17, currentPage1 * 17)"
            ref="elTable"
            style="width: 100%"
            emptyText="暂无数据"
            height="100%"
            border
          >
            <el-table-column
              fixed
              align="center"
              prop="name"
              label="人员姓名"
              width="110"
            >
            </el-table-column>
            <el-table-column
              align="center"
              prop="date1"
              label="1"
              width="50">
              <template slot-scope="scope">
                <img v-if="scope.row.date1 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date1 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date2"
              label="2"
              width="50">
              <template slot-scope="scope">
                <img v-if="scope.row.date2 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date2 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date3"
              label="3"
              width="50">
              <template slot-scope="scope">
                <img v-if="scope.row.date3 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date3 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date4"
              label="4"
              width="50">
              <template slot-scope="scope">
                <img v-if="scope.row.date4 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date4 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date5"
              label="5"
              width="50">
              <template slot-scope="scope">
                <img v-if="scope.row.date5 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date5 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date6"
              label="6"
              width="50">
              <template slot-scope="scope">
                <img v-if="scope.row.date6 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date6 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date7"
              label="7"
              width="50">
              <template slot-scope="scope">
                <img v-if="scope.row.date7 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date7 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date8"
              label="8"
              width="50">
              <template slot-scope="scope">
                <img v-if="scope.row.date8 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date8 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date9"
              label="9"
              width="50">
              <template slot-scope="scope">
                <img v-if="scope.row.date9 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date9 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date10"
              label="10"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date10 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date10 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date11"
              label="11"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date11 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date11 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date12"
              label="12"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date12 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date12 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date13"
              label="13"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date13 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date13 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date14"
              label="14"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date14 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date14 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date15"
              label="15"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date15 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date15 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date16"
              label="16"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date16 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date16 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date17"
              label="17"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date17 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date17 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date18"
              label="18"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date18 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date18 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date19"
              label="19"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date19 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date19 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date20"
              label="20"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date20 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date20 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date21"
              label="21"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date21 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date21 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date22"
              label="22"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date22 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date22 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date23"
              label="23"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date23 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date23 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date24"
              label="24"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date24 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date24 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date25"
              label="25"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date25 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date25 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date26"
              label="26"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date26 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date26 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date27"
              label="27"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date27 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date27 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date28"
              label="28"
              width="50"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date28 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date28 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <!--v-if true 显示 false 隐藏（2月份且不是闰年） -->
            <el-table-column
              align="center"
              prop="date29"
              label="29"
              width="50"
              v-if="isLeapYear"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date29 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date29 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date30"
              label="30"
              width="50"
              v-if="monthDate !== '02'"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date30 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date30 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="date31"
              label="31"
              width="50"
              v-if="Single"
            >
              <template slot-scope="scope">
                <img v-if="scope.row.date31 == '1'" alt="" src="extends/businessComponent/dataHome/PersonnelAttendance/Img/1.png" />
                <img
                  v-else-if="scope.row.date31 == '0'"
                  src="extends/businessComponent/dataHome/PersonnelAttendance/Img/2.png"
                  alt=""
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div style="float: right">
          <el-pagination
            @current-change="handleCurrentSuper"
            :currentPage.sync="currentPage1"
            :pageSize="17"
            layout="total,prev, pager, next"
            :total="tableData.length"
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
import Pagination from "element-ui/lib/pagination";
import DatePicker from "element-ui/lib/date-picker";
import { getPersonAttendance, getTeamTree, downloadPersonAttendanceInfo } from "./server";
import env from "@/config/env";
export default {
  inject: ["projectConfig"],
  components: {
    ElTree: Tree,
    ElPagination: Pagination,
    ElDatePicker: DatePicker,
    ElInput: Input,
  },
  data() {
    return {
      currentPage1: 1,
      isLeapYear: false,
      attendanceDate: "",
      Single: false,
      filterText: "",
      monthDate: "",
      projectCode: "",
      projectName: "",
      teamId: "",
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      data: [],
      defaultProps: {
        children: "childs",
        label: "name",
      },
      tableData: [],
    };
  },
  methods: {
    exportExcel(){
      downloadPersonAttendanceInfo(
        this.projectCode,
        this.projectName,
        this.teamId,
        this.attendanceDate,
        this.filterText
      ).then((res) => {
        if (res.errcode !== 0) return;
        window.open(res.data)
      });
    },
    handleClick(val) {
      this.teamId = val.id;
      this.projectName=val.projectName;
      this.getInit();
    },
    selectDate(val) {
      this.attendanceDate = val;
      this.monthDate = val.split("-")[1];
      if (this.monthDate == "01" || this.monthDate == "03"|| this.monthDate == "05"|| this.monthDate == "07"|| this.monthDate == "08"|| this.monthDate == "10"|| this.monthDate == "12") {
        this.Single = true;
      } else {
        this.Single = false;
      }
      const year = val.split("-")[0]
      if(this.monthDate == "02" && !(year % 4 == 0 && year % 100 != 0 || year % 400 == 0)) {
        this.isLeapYear = false
      }else {
        this.isLeapYear = true
      }
      this.getInit();
    },
    handleCurrentSuper(val) {
      this.currentPage1 = val;
    },
    search(val) {
      this.filterText = val;
      this.getInit();
    },
    getInit() {
      getPersonAttendance(
        this.projectCode,
        this.projectName,
        this.teamId,
        this.attendanceDate,
        this.filterText
      ).then((res) => {
        if (res.errcode !== 0) return (this.tableData = []);
        this.tableData = res.data;
        this.$nextTick(()=>{
          this.$refs.elTable.doLayout();
        });
      });
    },
  },
  mounted() {
    this.projectName = this.projectConfig?.projectName;
    this.projectCode = `${env.project}`;
    const date = new Date();
    const month = date.getMonth() > 8 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    this.attendanceDate = `${date.getFullYear()}-${month}`;
    this.monthDate = month;
    if (this.monthDate == "01" || this.monthDate == "03"|| this.monthDate == "05"|| this.monthDate == "07"|| this.monthDate == "08"|| this.monthDate == "10"|| this.monthDate == "12") {
      this.Single = true;
    } else {
      this.Single = false;
    }
    const year = date.getFullYear()
    if(year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
        this.isLeapYear = true
      }else {
        this.isLeapYear = false
      }
    // this.getInit();
    getTeamTree(this.projectCode, this.projectName).then((res) => {
      this.data = res.data;
      if(this.data&&this.data.length>0){
        this.teamId=this.data[0].id;
        this.projectName=this.data[0].projectName;
        this.getInit();
      }
    });
  },
};
</script>

<style lang="less" scoped>
.PersonnelAttendance {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  h3 {
    background: #f8fbff;
    border: 1px solid #e8e8e8;
    padding: 6px 10px;
    font-size: 14px;
  }
  .treeTable {
    height: 99%;
    display: flex;
    .eltree {
      width: 20%;
      background: #fff;
      margin-right: 20px;
      height: 100%;
      box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
      .el-tree {
        padding: 20px;
        overflow: auto;
        height: 96%;
      }
    }
    .eltable {
      width: 79%;
      background: #fff;
      height: 100%;
      box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
      .tableBox {
        padding: 11px;
        height: 85%;
      }
      .screen {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        padding-bottom: 0;
        .el-input {
          width: 75%;
          vertical-align: top;
        }
        .btninput {
          width: 20%;
          .el-button {
            padding: 9.4px 15px;
            border-radius: 0;
            border-left: 0px;
            vertical-align: middle;
          }
        }
      }
      .btnClick {
        display: flex;
        .el-input {
          width: 75%;
        }
        .el-button {
          margin-right: 10px;
          padding: 9px 20px;
          vertical-align: middle;
        }
      }
    }
  }
}
/deep/.el-table__fixed::before{
  display: none!important
}
</style>

<style lang="less">
.PersonnelAttendance {
  .el-tree-node__content {
    height: 30px;
    color: #000;
  }
  .screen {
    .el-input__inner {
      border-radius: 0;
    }
  }
  .el-table__header-wrapper {
    background: #edeff9;
  }
  .el-table td, .el-table th {
    padding: 7px 0;
  }
  .el-table--border td,
  .el-table--border th,
  .el-table__body-wrapper
    .el-table--border.is-scrolling-left
    ~ .el-table__fixed {
    border-color: rgba(217, 217, 217, 0.4);
  }
  // .el-table th,
  // .el-table tr {
  //   // background: none;
  // }
  .el-input__inner {
    height: 35px;
    line-height: 35px;
  }
  .el-pagination__total {
    font-size: 14px !important;
  }
  .el-pager li {
    font-size: 14px;
  }
}
.number:before {
  content: none;
}
</style>
