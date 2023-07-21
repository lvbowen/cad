<template>
  <div>
    <div class="app_title">
      <div>
        <img :src="prev" @click="toprev" alt="" />
        <span>填报任务清单</span>
      </div>
    </div>
    <div class="search">
      <el-input
        @change="search"
        placeholder="搜索"
        v-model="input"
        clearable>
      </el-input>
      <img @click="searchClick" src="../../Img/icon_sx@2x.png" alt="" />
      <div class="shaixuan" v-show="searchShow">
        <p @click="select(item)" v-for="(item, index) in pList" :key="index">
          {{ item.name }}
        </p>
      </div>
    </div>
    <el-table
      ref="multipleTable"
      :data="tableData"
      @row-click="handleClick"
      tooltipEffect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column label="任务名称" prop="planDetailName"></el-table-column>
      <el-table-column
        prop="cumulativeReportRatio"
        label="填报比例"
        align="center"
        width="90"
      >
      </el-table-column>
    </el-table>
    <div class="taskButton">
      <div @click="complete">一键完成</div>
      <h5><i></i></h5>
      <div @click="taskFillIn">任务填报</div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Input from "element-ui/lib/input";
import Message from "element-ui/lib/message";
import Loading from "element-ui/lib/loading";
import prev from "../../Img/fanhui.png";
import { getLeafList, getAddList } from "../service/index.js";
Vue.prototype.$message = Message;
Vue.prototype.$loading = Loading.service;
import env from "@/config/env";
export default {
  components: {
    ElInput: Input,
  },
  inject:['projectConfig'],
  data() {
    return {
      pList: [
        {
          name: "全部",
          value: "",
        },
        {
          name: "已完成",
          value: 0,
        },
        {
          name: "进行中",
          value: 1,
        },
        {
          name: "未开始",
          value: -1,
        },
      ],
      tableData: [],
      prev: prev,
      searchShow: false,
      reportState: "",
      planDetailName: "",
      input: "",
      parentId: "",
      projectCode: "",
      projectName: "",
      //判断是否选择了多个任务
      isChoice: -1,
      taskList: [],
      planDetailAmount: "",
      reportDetailAmount: "",
      surplusAmount: "",
      planDetailUnitPrice: "",
      planDetailMoney: "",
      reportDetailMoney: "",
      surplusMoney: "",
      userName: "",
      id: "",
      idList: [],
      formList: {
        idList: [],
        projectCode: "",
        ratio: 100,
        reportDate: "",
        userId: "",
      },
    };
  },
  methods: {
    complete() {
      this.planDetailName = "";
      this.formList.idList = [];
      this.taskList.forEach((e) => {
        this.formList.idList.push(e.id);
      });
      getAddList(this.formList).then((res) => {
        const loading = this.$loading({
            lock: true,
            text: "Loading",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });
        if (res.data.flag) {
          loading.close();
          this.$message.success(res.data.log);
          this.getinit();
        } else {
          loading.close();
          this.$message.error("填报失败！");
          this.getinit();
        }
      });
    },
    search(val) {
      this.planDetailName = val;
      this.getinit();
    },
    select(val) {
      this.reportState = val.value;
      this.getinit();
      this.searchShow = !this.searchShow;
    },
    handleSelectionChange(val) {
      console.log(val);
      this.taskList = val;
      if (val.length > 1) {
        this.isChoice = 1; //选择了多个任务
      } else if (val.length == 1) {
        this.isChoice = 0; //选择了一个任务
        this.id = val[0].id;
        this.planDetailName = val[0].planDetailName;
        this.planDetailAmount = val[0].planDetailAmount;
        this.reportDetailAmount = val[0].reportDetailAmount;
        this.surplusAmount = val[0].surplusAmount;
        this.planDetailUnitPrice = val[0].planDetailUnitPrice;
        this.planDetailMoney = val[0].planDetailMoney;
        this.reportDetailMoney = val[0].reportDetailMoney;
        this.surplusMoney = val[0].surplusMoney;
        this.userName = val[0].userName;
      } else if (val.length == 0) {
        this.isChoice = -1; //没有选择任务
      }
    },
    toprev() {
      this.$router.go(-1);
    },
    handleClick(row) {
      this.$router.push({
        name: "ScheduleDetails",
        query: {
          id: row.id,
          planDetailName: row.planDetailName,
          planDetailAmount: row.planDetailAmount,
          reportDetailAmount: row.reportDetailAmount,
          surplusAmount: row.surplusAmount,
          planDetailUnitPrice: row.planDetailUnitPrice,
          planDetailMoney: row.planDetailMoney,
          reportDetailMoney: row.reportDetailMoney,
          surplusMoney: row.surplusMoney,
          userName: row.userName,
        },
      });
    },
    taskFillIn() {
      if (this.isChoice == 1) {
        this.idList = [];
        this.taskList.forEach((e) => {
          this.idList.push(e.id);
        });
        this.$store.commit("idListData", this.idList);
        this.$router.push({
          name: "ScheduleDetails",
          query: {
            isMulti: true,
          },
        });
      } else if (this.isChoice == 0) {
        this.$router.push({
          name: "ScheduleDetails",
          query: {
            id: this.id,
            planDetailName: this.planDetailName,
            planDetailAmount: this.planDetailAmount,
            reportDetailAmount: this.reportDetailAmount,
            surplusAmount: this.surplusAmount,
            planDetailUnitPrice: this.planDetailUnitPrice,
            planDetailMoney: this.planDetailMoney,
            reportDetailMoney: this.reportDetailMoney,
            surplusMoney: this.surplusMoney,
            userName: this.userName,
            isMulti: false,
          },
        });
      } else if (this.isChoice == -1) {
        this.$message.error("请先选择任务名称！");
      }
    },
    searchClick() {
      this.searchShow = !this.searchShow;
    },
    getinit() {
      getLeafList(
        this.projectCode,
        this.projectName,
        this.parentId,
        this.reportState,
        this.planDetailName
      ).then((res) => {
        res.data.forEach((element) => {
          element.cumulativeReportRatio =
            element.cumulativeReportRatio * 100 + "%";
        });
        this.tableData = res.data;
      });
    },
  },
  mounted() {
    this.projectCode = `${env.project}`;
    // this.projectName = sessionStorage.getItem("projectname");
    this.projectName = this.projectConfig?.projectName??"";
    this.parentId = this.$route.query.id;
    this.formList.projectCode = this.projectCode;
    var time = new Date();
    this.formList.reportDate =
      time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate();
    this.getinit();
  },
};
</script>

<style lang="less">
.app_title {
  width: 100%;
  height: 45px;
  background: #0e79ed;
  display: flex;
  div:nth-child(1) {
    width: 80%;
    display: flex;
    span {
      width: 95%;
      font-size: 17px;
      padding-left: 15px;
      font-weight: 700;
    }
    img {
      padding-top: 12px;
      padding-left: 5px;
      width: 28px;
      height: 30px;
      margin-right: 40px;
    }
  }
  div:nth-child(2) {
    width: 20%;
    span {
      vertical-align: middle;
      width: 75%;
      font-size: 16px;
    }
    img {
      width: 18px;
      vertical-align: middle;
      margin-right: 3px;
      height: 18px;
    }
  }
  span {
    color: #fff;
    line-height: 45px;
  }
}
.search {
  position: relative;
  padding: 10px 0;
  .el-input {
    width: 83%;
    margin-right: 10px;
  }
  .el-input--suffix .el-input__inner {
    border-radius: 28px;
    height: 33px;
  }
  img {
    width: 38px;
    height: 38px;
  }
  .shaixuan {
    position: absolute;
    top: 48px;
    right: 20px;
    width: 97px;
    height: 182px;
    background: #ffffff;
    border: 1px solid #ebebeb;
    box-shadow: 0px 3px 7px 0px rgba(6, 72, 151, 0.1);
    z-index: 99;
    border-radius: 6px;
    p {
      height: 45px;
      font-size: 16px;
      font-family: Source Han Sans CN;
      font-weight: 400;
      color: #666666;
      margin-bottom: 0;
      line-height: 45px;
    }
  }
}
.taskButton {
  position: fixed;
  width: 100%;
  z-index: 99;
  bottom: 49px;
  height: 13vw;
  background: #ffffff;
  line-height: 50px;
  box-shadow: 0px -4px 10px 0px rgba(0, 0, 0, 0.09);
  display: flex;
  h5 {
    padding-top: 10px;
  }
  i {
    width: 2px;
    height: 28px;
    display: inline-block;
    background: #e7e7e7;
  }
  div {
    width: 49.5%;
    font-size: 15px;
    font-family: PingFang SC;
    color: #0e79ed;
  }
}
</style>

<style lang="less">
.el-table {
  th {
    text-align: center;
  }
}
</style>
