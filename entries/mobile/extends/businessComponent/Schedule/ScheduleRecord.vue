<template>
  <div class="ScheduleRecord">
    <div class="app_title">
      <div>
        <img :src="prev" @click="toprev" alt="" />
        <span>填报记录</span>
      </div>
    </div>
    <div style="padding: 15px">
      <el-table
        :data="tableData"
        @row-click="handleClick"
        stripe
        style="width: 100%">
        <el-table-column
          align="center"
          prop="reportDate"
          label="日期"
          width="110"
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="userName"
          label="操作人"
          width="70"
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="reportRatio"
          width="80"
          label="完成比例"
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="reportState"
          label="填报状态"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.reportState == '0'" style="color: #00c567">
              已完成
            </span>
            <span
              v-else-if="scope.row.reportState == '1'"
              style="color: #efb70d"
            >
              进行中
            </span>
            <span
              v-else-if="scope.row.reportState == '-1'"
              style="color: #ff7175"
            >
              未填报
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import prev from "../../Img/fanhui.png";
import { getReportInfo } from "../service/index.js";
import env from "@/config/env";
export default {
  data() {
    return {
      tableData: [],
      prev: prev,
      id: "",
      projectCode: "",
    };
  },
  methods: {
    handleClick(row){
      this.$router.push(
        {
          name: "ProgressData",
          query: {
            workName: row.workName,
            userName: row.userName,
            reportDate: row.reportDate,
            cumulativeReportRatio: row.cumulativeReportRatio,
            reportContent: row.reportContent,
            imgList: row.imgList?.toString(),
          }
        }
      )
    },
    toprev() {
      this.$router.go(-1);
    },
  },
  mounted() {
    this.projectCode = `${env.project}`;
    this.id = this.$route.query.id;
    getReportInfo(this.projectCode, this.id).then((res) => {
      res.data.forEach((element) => {
        element.reportRatio = (element.reportRatio * 100).toFixed(2) + "%";
        element.reportDate = element.reportDate.split("T")[0];
      });
      this.tableData = res.data;
    });
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
</style>

<style lang="less">
.ScheduleRecord {
  .el-table {
    border: 1px solid #d9d9d9;
  }
}
</style>
