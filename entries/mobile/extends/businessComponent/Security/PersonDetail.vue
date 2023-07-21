<template>
  <div class="PersonDetail">
    <apptitle :title="'人员信息'"></apptitle>
    <div class="PersonDetail_content">
      <div class="PersonDetail_message">
        <div class="message_img">
          <img :src="photo" alt="" />
        </div>
        <div class="message_info">
          <div>
            <span>姓名：</span>
            <span>{{ personName }}</span>
          </div>
          <div>
            <span>手机号：</span>
            <span>{{ phone }}</span>
          </div>
          <div>
            <span>身份证号：</span>
            <span>{{ Identity }}</span>
          </div>
          <div>
            <span>所属公司：</span>
            <span>{{ company }}</span>
          </div>
          <div>
            <span>所属部门：</span>
            <span>{{ department }}</span>
          </div>
        </div>
      </div>
      <div class="PersonDetail_table">
        <el-tabs v-model="activeName">
          <el-tab-pane label="证件信息" name="first">
            <el-table :data="tableData1" stripe style="width: 100%">
              <el-table-column
                prop="certificateName"
                label="证件名称"
              ></el-table-column>
              <el-table-column
                prop="certificateAttachment"
                label="附件"
              ></el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="考勤信息" name="second">
            <el-table :data="tableData2" stripe style="width: 100%">
              <el-table-column prop="InOrOut" label="进出场"></el-table-column>
              <el-table-column
                prop="InorOutDate"
                label="进出日期"
              ></el-table-column>
              <el-table-column prop="place" label="地点"></el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="培训信息" name="third">
            <el-table :data="tableData3" stripe style="width: 100%">
              <el-table-column
                prop="planName"
                label="培训名称"
                width="120px"
              ></el-table-column>
              <el-table-column
                prop="progressPercentage"
                label="完成情况"
                width="80px"
              ></el-table-column>
              <el-table-column
                prop="planStatus"
                label="状态"
                width="80px"
              ></el-table-column>
              <el-table-column
                prop="beginTime"
                label="开始时间"
                width="140px"
              ></el-table-column>
              <el-table-column
                prop="endTime"
                label="结束时间"
                width="140px"
              ></el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import apptitle from "../components/appTitle.vue";
import Tabs from "element-ui/lib/tabs";
import TabPane from "element-ui/lib/tab-pane";
import {
  getLoad,
  getUserPlanRecordFromNXB,
  getList,
} from "../service/index.js";
import env from "@/config/env";
export default {
  components: {
    apptitle,
    ElTabs: Tabs,
    ElTabPane: TabPane,
  },
  data() {
    return {
      activeName: "first",
      personName: "",
      phone: "",
      Identity: "",
      company: "",
      photo: "",
      department: "",
      tableData1: [],
      tableData2: [],
      tableData3: [],
    };
  },
  mounted() {
    this.projectCode = `${env.project}`;
    const sheetCode = this.projectCode + "_PersonInfo";
    getLoad(sheetCode, this.$route.query.id, sheetCode).then((res) => {
      console.log(res.data.bizObject?.data);
      this.personName = res.data?.bizObject?.data.personName;
      this.phone = res.data?.bizObject?.data.phone;
      this.Identity = res.data?.bizObject?.data.Identity;
      this.company = res.data?.bizObject?.data.company;
      this.department = res.data?.bizObject?.data.department;
      this.photo = res.data?.bizObject?.data.photo[0]?.base64ImageStr ?? "";
      getUserPlanRecordFromNXB(this.phone, 1, 999).then((ress) => {
        ress.data.entity.forEach((e) => {
          if (e.planStatus == 0) {
            e.planStatus = "未开始";
          } else if (e.planStatus == 1) {
            e.planStatus = "已开始";
          } else {
            e.planStatus = "已结束";
          }
          e.progressPercentage = e.progressPercentage + "%";
        });
        this.tableData3 = ress.data.entity;
      });
      let cer_key = `${this.projectCode}_certificate`;
      this.tableData1 = res.data.bizObject?.data[cer_key];
      const obj = {
        filters: [
          {
            propertyCode: "personId",
            propertyType: 0,
            propertyValue: this.$route.query.id,
            propertyValueName: "",
          },
        ],
        mobile: true,
        page: 0,
        queryCode: `${this.projectCode}_personAttendance`,
        schemaCode: `${this.projectCode}_personAttendance`,
        size: 99,
      };
      getList(obj).then((resss) => {
        this.tableData2 = resss.data.content;
      });
    });
  },
};
</script>

<style lang="less" scoped>
.PersonDetail_content {
  padding: 10px;
  .PersonDetail_message {
    background: #fff;
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: 0px 5px 10px 0px rgba(210, 210, 210, 0.2);
    display: flex;
    .message_img {
      width: 42%;
      height: 180px;
      padding: 10px 8px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .message_info {
      width: 80%;
      padding: 10px 5px;
      div {
        margin-bottom: 16px;
        font-family: Source Han Sans CN;
        text-align: left;
        :nth-child(1) {
          color: #666;
          font-size: 14px;
        }
        :nth-child(2) {
          color: #333;
          font-size: 14px;
        }
      }
    }
  }
  .PersonDetail_table {
    background: #fff;
    padding: 15px;
  }
}
</style>