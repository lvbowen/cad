<template>
  <div class="EquipmentDetails">
    <div class="title">
      <img @click="toprev" src="../../Img/fanhui1.png" alt="" />
      <h2>设备详情</h2>
      <!-- <img src="../../Img/Equipment/添加.png" alt="" /> -->
      <span></span>
    </div>
    <div class="DataInformation">
      <div class="DisplayDiagram">
        <Swipe :autoplay="3000">
          <SwipeItem v-for="(image, index) in pics" :key="index"> <img :src="image" /></SwipeItem>
        </Swipe>
      </div>
      <div class="information">
        <div class="infoTitle">
          <img src="../../Img/title@2x.png" alt="" />
          <h3>基本信息</h3>
        </div>
        <div class="infoData">
          <p>
            <span>设备名称：</span>
            <span>{{ deviceName }}</span>
          </p>
          <p>
            <span>设备类型：</span>
            <span>{{ deviceType }}</span>
          </p>
        </div>
        <div class="infoData">
          <p>
            <span>设备编码：</span>
            <span>{{ deviceSn }}</span>
          </p>
        </div>
        <div class="infoData">
          <p>
            <span>责任人：</span>
            <span>{{ manager }}</span>
          </p>
          <p>
            <span>登记日期：</span>
            <span>{{ registerDate }}</span>
          </p>
        </div>
      </div>
      <div class="information">
        <div class="infoTitle">
          <img src="../../Img/title@2x.png" alt="" />
          <h3>仓库信息</h3>
        </div>
        <div class="infoData">
          <p>
            <span>生产厂家：</span>
            <span>{{ industry }}</span>
          </p>
          <p>
            <span>厂家联系人：</span>
            <span>{{ producer }}</span>
          </p>
        </div>
        <div class="infoData">
          <p>
            <span>联系方式：</span>
            <span>{{ phone }}</span>
          </p>
          <p>
            <span>出厂日期：</span>
            <span>{{ birth }}</span>
          </p>
        </div>
      </div>
      <div class="information">
        <div class="infoTitle">
          <img src="../../Img/title@2x.png" alt="" />
          <h3>设备状态</h3>
        </div>
        <div
          class="state"
          :style="{
            background:
              deviceState == '未入场'
                ? '#ff0000'
                : deviceState == '已入场'
                ? '#296eff'
                : deviceState == '使用中'
                ? '#0ecd62'
                : deviceState == '维修中'
                ? '#ff6200'
                : deviceState == '已报废'
                ? '#b5b3ac'
                : deviceState == '已离场'
                ? '#a93ecf'
                : '',
          }"
        >
          {{ deviceState }}
        </div>
      </div>
      <div class="information">
        <div class="infoTitle">
          <img src="../../Img/title@2x.png" alt="" />
          <h3>设备二维码</h3>
        </div>
        <div class="infoData">
          <img :src="qrCodeUrl" alt="" />
        </div>
      </div>
      <div class="information">
        <div class="infoTitle">
          <img src="../../Img/title@2x.png" alt="" />
          <h3>关联任务</h3>
        </div>
        <div class="infoData">
          <Button @click="jupmInspect">巡检计划</Button>
          <Button @click="jupmPlan">保养计划</Button>
          <Button @click="jumpOrder">维修工单</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Swipe } from "vant";
import { SwipeItem } from "vant";
import { Button } from "vant";
import { getDeviceDetail } from "../service/index.js";
import env from "@/config/env";
export default {
  components: {
    Swipe,
    SwipeItem,
    Button,
  },
  inject: ["projectConfig"],
  data() {
    return {
      deviceState: "已入场",
      projectCode: "",
      projectName: "",
      deviceName: "",
      deviceType: "",
      deviceSn: "",
      deviceSpecification: "",
      manager: "",
      registerDate: "",
      industry: "",
      producer: "",
      birth: "",
      phone: "",
      qrCodeUrl: "",
      pics: [],
    };
  },
  methods: {
    toprev() {
      this.$router.go(-1);
    },
    jupmInspect() {
      this.$router.push({
        name: "InspectPlans",
        query: {
          id: this.$route.query.id,
        },
      });
    },
    jupmPlan() {
      this.$router.push({
        name: "MaintenancePlan",
        query: {
          id: this.$route.query.id,
        },
      });
    },
    jumpOrder() {
      this.$router.push({
        name: "RepairWorkOrder",
        query: {
          id: this.$route.query.id,
        },
      });
    },
  },
  mounted() {
    this.projectName = this.projectConfig.projectName;
    this.projectCode = `${env.project}`;
    getDeviceDetail(this.projectCode, this.projectName, this.$route.query.id).then((res) => {
      this.deviceName = res.data.deviceName;
      this.deviceType = res.data.deviceType;
      this.deviceSn = res.data.deviceSn;
      this.deviceSpecification = res.data.deviceSpecification;
      this.manager = res.data.manager;
      this.registerDate = res.data.registerDate;
      this.industry = res.data.industry;
      this.producer = res.data.producer;
      this.phone = res.data.phone;
      this.birth = res.data.birth;
      this.deviceState = res.data.deviceState;
      this.pics = res.data.pics;
      this.qrCodeUrl = res.data.qrCodeUrl;
    });
  },
};
</script>
<style lang="less" scoped>
* {
  text-align: left;
}
.EquipmentDetails {
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
  .DataInformation {
    padding: 10px;
    .DisplayDiagram {
      margin-bottom: 20px;
      img {
        width: 100%;
        height: 150px;
      }
    }
    .information {
      padding: 5px;
      margin-bottom: 15px;
      .infoTitle {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        height: 30px;
        line-height: 29px;
        img {
          height: 16px;
          width: 16px;
          margin-right: 5px;
        }
      }
      h3 {
        font-size: 15px;
        margin: 0;
        color: #666666;
      }
      .state {
        width: 60px;
        height: 30px;
        border-radius: 19px;
        line-height: 30px;
        margin-left: 20px;
        text-align: center;
        color: #fff;
      }
      .infoData {
        display: flex;
        margin-bottom: 10px;
        padding-left: 20px;
        flex-wrap: wrap;
        img {
          width: 150px;
          height: 150px;
        }
        p:nth-child(1) {
          min-width: 45%;
          margin-right: 20px;
        }
        p {
          span {
            font-size: 14px;
            color: #666666;
          }
        }
        Button {
          margin-right: 20px;
          background: #064897;
          color: #fff;
          height: 35px;
          line-height: 35px;
        }
      }
    }
  }
}
</style>
