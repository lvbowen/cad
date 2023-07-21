<template>
  <div class="MaintenancePlan">
    <div class="title">
      <img @click="toprev" src="../../Img/fanhui1.png" alt="" />
      <h2>保养计划</h2>
      <img @click="imgClick" src="../../Img/Equipment/添加.png" alt="" />
    </div>
    <div style="padding: 15px">
      <div class="report_card" v-for="(item, index) in MaintainPlans" :key="index">
        <img
          class="cycle"
          :src="
            item.type.includes('周')
              ? zhou
              : item.type.includes('月')
              ? yue
              : item.type.includes('年')
              ? nian
              : ''
          "
          alt=""
        />
        <div class="reportTitle">
          <p>{{ item.level }}</p>
          <h3>{{ item.name }}</h3>
        </div>
        <div class="flex" @click="JumpClick(item)">
          <div>
            <p>已保养次数</p>
            <p>{{ item.doneNum }}</p>
          </div>
          <div>
            <p>下一次保养</p>
            <p>{{ item.nextMaintainDate }}</p>
          </div>
          <div>
            <p>是否延期</p>
            <p
              class="state"
              :style="{
                background:
                  item.status == '待保养'
                    ? '#0ecd62'
                    : item.status == '保养延期'
                    ? '#ff0000'
                    : item.status == '今日截止'
                    ? '#ff6200'
                    : '',
              }"
            >
              {{ item.status }}
            </p>
          </div>
        </div>
        <div>
          <Collapse v-model="activeNames">
            <CollapseItem title="保养项：" :name=index>
              <div style="padding-left: 15px">
                <p v-html="item.maintainContent.replace(/\n/gm, '<br/>')"></p>
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
import { getMaintainPlans } from "../service/index.js";
import env from "@/config/env";
import zhou from "../../Img/Equipment/zhou.png";
import yue from "../../Img/Equipment/yue.png";
import nian from "../../Img/Equipment/nian.png";
export default {
  inject: ["projectConfig"],
  components: {
    Collapse,
    CollapseItem,
  },
  data() {
    return {
      activeNames: [],
      MaintainPlans: [],
      projectCode: "",
      projectName: "",
      zhou: zhou,
      yue: yue,
      nian: nian,
    };
  },
  methods: {
    toprev() {
      this.$router.go(-1);
    },
    JumpClick(val) {
      this.$router.push({
        name: "MaintainDetails",
        query: {
          id: val.id,
        },
      });
    },
    imgClick() {
      this.$router.push({
        name: "form-detail",
        query: {
          sheetCode: this.projectCode + "_device_maintainPlan",
          schemaCode: this.projectCode + "_device_maintainPlan",
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
    getMaintainPlans(this.projectCode, this.projectName, this.$route.query.id).then((res) => {
      this.MaintainPlans = res.data;
    });
  },
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
    padding: 15px;
    font-size: 16px;
    border-radius: 10px;
    position: relative;
    box-shadow: 0px 10px 30px 0px rgba(153, 153, 153, 0.4);
    margin-bottom: 20px;
    .cycle {
      position: absolute;
      top: 0;
      right: 20px;
      width: 20px;
    }
    .reportTitle {
      display: flex;
      align-items: center;
      height: 40px;
      line-height: 40px;
      p {
        margin: 0;
        width: 34px;
        height: 22px;
        text-align: center;
        line-height: 22px;
        font-size: 13px;
        color: #fff;
        background: #fe7654;
        border-radius: 2px;
      }
    }
    h3 {
      color: #333;
      height: 40px;
      line-height: 40px;
      text-align: left;
      font-size: 17px;
      padding-left: 5px;
      margin: 0;
    }
    .flex {
      display: flex;
      margin-bottom: 15px;
      div {
        width: 33%;
        margin-right: 5px;
        p:nth-child(1) {
          color: #666;
          font-size: 15px;
          margin-bottom: 5px;
          text-align: center;
        }
        p:nth-child(2) {
          font-size: 15px;
          color: #666;
          text-align: center;
        }
      }
      .state {
        width: 80px;
        border-radius: 19px;
        margin-left: 12px;
        text-align: center;
        height: 20px;
        line-height: 20px;
        color: #fff !important;
      }
    }
  }
  [class*="van-hairline"]::after {
    content: none;
  }
}
</style>
