<template>
  <div class="MaintenancePlan">
    <div class="title">
      <img @click="toprev" src="../../Img/fanhui1.png" alt="" />
      <h2>保养工单</h2>
      <img @click="imgClick" src="../../Img/Equipment/添加.png" alt="" />
    </div>
    <div style="padding: 15px">
      <div class="report_card" v-for="(item,index) in MaintainPlans" :key="index">
        <div class="reportTitle">
          <h3>{{ item.name }}</h3>
        </div>
        <div class="flex">
          <div>
            <span>工单状态：</span>
            <span
              class="state"
              :style="{
                background: item.status.includes('完成')  ? '#0ecd62' : '#ff6200',
              }"
              >{{ item.status }}</span
            >
          </div>
          <div>
            <span>创建日期：</span>
            <span>{{ item.maintainDate }}</span>
          </div>
          <div>
            <span>处理人：</span>
            <span>{{ item.maintainer }}</span>
          </div>
          <div>
            <span>关联设备：</span>
            <span>{{ item.deviceName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMaintainTasks } from "../service/index.js"
import env from "@/config/env";
export default {
  inject: ["projectConfig"],
  data() {
    return {
      state: "已完成",
      projectCode: "",
      projectName: "",
      MaintainPlans: []
    };
  },
  methods: {
    toprev() {
      this.$router.go(-1);
    },
    imgClick() {
      this.$router.push({
        name: "form-detail",
        query: {
          sheetCode: this.projectCode + "_device_maintainTask",
          schemaCode: this.projectCode + "_device_maintainTask",
          fieldParam1: this.$route.query.id,
          return: `${this.$route.fullPath}&iframeAction=add`,
          projectName: this.projectConfig?.projectName ?? "",
        },
      });
    },
  },
  mounted() {
    this.projectName = this.projectConfig.projectName;
    this.projectCode = `${env.project}`;
    getMaintainTasks(this.projectCode, this.projectName, this.$route.query.id).then(res=>{
      this.MaintainPlans = res.data
    })
  }
};
</script>

<style lang="less" scoped>
.MaintenancePlan {
  background: #fff;
  .title {
    padding: 0 10px;
    height: 45px;
    background: #0e79ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    h2 {
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 0;
    }
    img {
      width: 20px;
      height: 20px;
    }
  }
  .report_card {
    width: 100%;
    border-radius: 20px;
    padding: 10px;
    box-shadow: 0px 10px 30px 0px rgba(153, 153, 153, 0.4);
    margin-bottom: 15px;
    border-radius: 10px;
    .reportTitle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      line-height: 40px;
      p {
        margin: 0;
      }
    }
    h3 {
      color: #333;
      height: 40px;
      line-height: 40px;
      text-align: left;
      font-size: 16px;
      padding-left: 5px;
      margin: 0;
    }
    .flex {
      display: flex;
      flex-wrap: wrap;
      text-align: left;
      padding-left: 15px;
      .state {
        border-radius: 17px;
        color: #fff;
        padding: 5px 7px 5px 12px;
        font-size: 12px;
      }
      div {
        min-width: 45%;
        margin-right: 10px;
        margin-bottom: 10px;
        span {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
