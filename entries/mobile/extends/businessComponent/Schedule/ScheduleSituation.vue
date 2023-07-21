<template>
  <div class="ScheduleSituation">
    <div class="app_title">
      <div>
        <img @click="toprev" :src="prev" alt="" />
        <span>填报详情</span>
      </div>
    </div>
    <div class="report_card">
      <h3>{{ scheduleDate }}</h3>
      <div>
        <span>任务数量</span>
        <span>{{ reportBSNum }} 个</span>
        <span>填报产值</span>
        <span> {{ journalMoney }} 万元</span>
      </div>
    </div>
    <div class="collapse">
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item
          v-for="(item, index) in collapseList"
          :key="index"
          :title="item.planDetailName"
          :name="item.id"
        >
          <div class="information">
            <div>
              <p>
                <span>单价：</span> <span>{{ item.planDetailUnitPrice }}</span>
              </p>
              <p>
                <span>计划数量：</span>
                <span>{{ item.planDetailAmount }} 个</span>
              </p>
              <p>
                <span>完成数量：</span>
                <span>{{ item.reportDetailAmount }} 个</span>
              </p>
              <p>
                <span>剩余数量：</span> <span>{{ item.surplusAmount }} 个</span>
              </p>
            </div>
            <div>
              <p>
                <span>填报比例：</span>
                <span>{{ item.cumulativeReportRatio * 100 + '%' }} </span>
              </p>
              <p>
                <span>计划产值：</span>
                <span>{{ item.planDetailMoney }} 元</span>
              </p>
              <p>
                <span>填报产值：</span>
                <span>{{ item.reportDetailMoney }} 元</span>
              </p>
              <p>
                <span>剩余产值：</span> <span>{{ item.surplusMoney }} 元</span>
              </p>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import prev from "../../Img/fanhui.png";
import Collapse from "element-ui/lib/collapse";
import CollapseItem from "element-ui/lib/collapse-item";
import env from "@/config/env";
import { getReportBSByLogId } from "../service/index.js";
export default {
  components: {
    ElCollapse: Collapse,
    ElCollapseItem: CollapseItem,
  },
  data() {
    return {
      prev: prev,
      collapseList: [],
      activeNames: ["0"],
      planDetailName: "213",
      planDetailAmount: "123",
      reportDetailAmount: "533",
      surplusAmount: "112",
      planDetailUnitPrice: "43",
      planDetailMoney: "443",
      reportDetailMoney: "66",
      surplusMoney: "99",
      id: "",
      reportBSNum: "",
      journalMoney: "",
      scheduleDate: "",
      projectCode: "",
    };
  },

  methods: {
    toprev() {
      this.$router.go(-1);
    },
    handleChange(val) {
      console.log(val);
    },
    getinit() {
      getReportBSByLogId(this.projectCode, this.id).then((res) => {
        this.collapseList = res.data;
      });
    },
  },
  mounted() {
    this.projectCode = `${env.project}`;
    this.id = this.$route.query.id;
    this.reportBSNum = this.$route.query.reportBSNum;
    this.scheduleDate = this.$route.query.scheduleDate;
    this.journalMoney = this.$route.query.journalMoney;
    this.getinit();
  },
};
</script>

<style lang="less" scoped>
.ScheduleSituation {
  .collapse {
    padding: 10px;
    .information {
      display: flex;
      padding: 15px;
      div:nth-child(1) {
        width: 55%;
        text-align: left;
      }
      div:nth-child(2) {
        width: 45%;
        text-align: left;
      }
      p {
        color: #666666;
        margin-bottom: 20px;
        font-weight: 300;
      }
    }
  }
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
      line-height: 45px;
      img {
        width: 18px;
        vertical-align: middle;
        height: 18px;
      }
    }
    span {
      color: #fff;
      line-height: 45px;
    }
  }
  .report_card {
    width: 100%;
    height: 105px;
    background: #fff;
    padding: 15px;
    font-size: 16px;
    h3 {
      color: #333;
      height: 30px;
      line-height: 30px;
      text-align: left;
      font-size: 20px;
      padding-left: 15px;
    }
    div {
      span:nth-child(1) {
        margin-right: 10px;
        color: #999;
      }
      span:nth-child(2) {
        margin-right: 20px;
        font-size: 18px;
        color: #666;
      }
      span:nth-child(3) {
        margin-right: 10px;
        color: #999;
      }
      span:nth-child(4) {
        font-size: 18px;
        color: #666;
      }
    }
  }
}
</style>

<style lang="less">
.ScheduleSituation {
  .el-collapse-item__header {
    padding: 10px;
    height: 40px;
    line-height: 40px;
  }
  .el-collapse-item {
    margin-bottom: 15px;
  }
  .el-collapse-item__content {
    padding: 0;
  }
}
</style>
