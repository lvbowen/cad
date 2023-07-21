<template>
  <div class="MaintenancePlan">
    <div class="title">
      <img @click="toprev" src="../../Img/fanhui1.png" alt="" />
      <h2>维修工单</h2>
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
                background: item.status == '维修完毕' ? '#0ecd62' : '#ff6200',
              }"
              >{{ item.status }}</span>
          </div>
          <div>
            <span>创建日期：</span>
            <span>{{ item.repairTime.split(" ")[0] }}</span>
          </div>
          <div>
            <span>处理人：</span>
            <span>{{ item.repairPerson }}</span>
          </div>
          <div>
            <span>关联设备：</span>
            <span>{{ item.deviceName }}</span>
          </div>
        </div>
        <div>
          <Collapse v-model="activeNames">
            <CollapseItem title="故障说明：" :name=index>
              <div style="padding-left: 15px">
                <p>{{ item.scrapDesc }}</p>
              </div>
            </CollapseItem>
          </Collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Collapse } from "vant";
import { CollapseItem } from "vant";
import { getRepairTasks } from "../service/index.js"
import env from "@/config/env";
export default {
  inject: ["projectConfig"],
  components: {
    Collapse,
    CollapseItem,
  },
  data() {
    return {
      state: "已完成",
      projectCode: "",
      projectName: "",
      activeNames: [],
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
          sheetCode: this.projectCode + "_device_repair",
          schemaCode: this.projectCode + "_device_repair",
          fieldParam1: this.$route.query.id,
          return: `${this.$route.fullPath}&iframeAction=add`,
          iframeAction: "add",
          projectName: this.projectConfig?.projectName ?? "",
        },
      });
    },
  },
  mounted() {
    this.projectName = this.projectConfig.projectName;
    this.projectCode = `${env.project}`;
    getRepairTasks(this.projectCode, this.projectName, this.$route.query.id).then(res=> {
      this.MaintainPlans = res.data
    })
  }
};
</script>

<style lang="less" scoped>
* {
  margin: 0;
  text-align: left;
}
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
        padding: 5px;
        font-size: 12px;
      }
      div {
        width: 48%;
        margin-bottom: 10px;
        span {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
  [class*="van-hairline"]::after {
    content: none;
  }
}
</style>
