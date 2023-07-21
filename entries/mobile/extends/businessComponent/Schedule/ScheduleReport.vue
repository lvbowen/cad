<template>
  <div class="ScheduleReport">
    <div class="app_title">
      <div>
        <img @click="toprev" :src="prev" alt="" />
        <span>进度填报汇总</span>
      </div>
      <div @click="timeIsShow">
        <img :src="add" alt="" />
      </div>
    </div>
    <div v-show="timePickShow">
      <el-date-picker
        v-model="value1"
        type="daterange"
        rangeSeparator="至"
        valueFormat="yyyy-MM-dd"
        startPlaceholder="开始日期"
        endPlaceholder="结束日期"
        @change="changeTime"
      >
      </el-date-picker>
    </div>
    <div
      class="report_card"
      @click="toSituation(item)"
      :style="
        item.reportState == 1
          ? { background: 'url(' + jinxing + ')', backgroundSize: '100% 100%' }
          : { background: 'url(' + wancheng + ')', backgroundSize: '100% 100%' }
      "
      v-for="(item, index) in listLog"
      :key="index"
    >
      <h3>{{ item.scheduleDate }}</h3>
      <div class="flex">
        <div>
          <span>任务数量</span>
          <span> {{ item.reportBSNum }} 个</span>
        </div>
        <div>
          <span>填报产值</span>
          <span> {{ item.journalMoney }} 万元</span>
        </div>
      </div>
    </div>
    <div @click="addDate" class="addImg">
      <img src="../../Img/btn.png" alt="" />
    </div>
  </div>
</template>

<script>
import prev from "../../Img/fanhui.png";
import add from "../../Img/topicon.png";
import DatePicker from "element-ui/lib/date-picker";
import jinxing from "../../Img/未完成.png";
import { getListLogMobile } from "../service/index.js";
import wancheng from "../../Img/已完成.png";
import env from "@/config/env";
export default {
  components: {
    ElDatePicker: DatePicker,
  },
  inject:['projectConfig'],
  data() {
    return {
      prev: prev,
      add: add,
      jinxing: jinxing,
      wancheng: wancheng,
      projectCode: "",
      value1: "",
      projectName: "",
      listLog: [],
      timePickShow: false,
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
    };
  },
  methods: {
    toSituation(val) {
      this.$router.push({
        name: "ScheduleSituation",
        query: {
          id: val.id,
          scheduleDate: val.scheduleDate,
          journalMoney: val.journalMoney,
          reportBSNum: val.reportBSNum,
        },
      });
    },
    toprev() {
      this.$router.go(-1);
    },
    timeIsShow() {
      this.timePickShow = !this.timePickShow;
    },
    addDate() {
      this.$router.push("/apps/ScheduleTree");
    },
    getinit() {
      getListLogMobile(
        this.projectCode,
        this.projectName,
        this.queryStartDate,
        this.queryEndDate
      ).then((res) => {
        this.listLog = res.data;
      });
    },
    changeTime(val) {
      console.log(val);
      if (val) {
        this.queryStartDate = val[0];
        this.queryEndDate = val[1];
      } else {
        this.queryStartDate = "";
        this.queryEndDate = "";
      }
      this.getinit();
    },
  },
  mounted() {
    this.projectCode = `${env.project}`;
    // this.projectName = sessionStorage.getItem("projectname");
    this.projectName = this.projectConfig?.projectName??"";
    this.getinit();
  },
};
</script>

<style lang="less" scoped>
.ScheduleReport {
  .app_title {
    width: 100%;
    height: 45px;
    background: #0e79ed;
    display: flex;
    margin-bottom: 10px;
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
    height: 125px;
    border-radius: 20px;
    padding: 15px;
    font-size: 16px;
    h3 {
      color: #333;
      height: 40px;
      line-height: 40px;
      text-align: left;
      font-size: 20px;
      padding-left: 15px;
    }
    .flex {
      display: flex;
      div:nth-child(1) {
        width: 40%;
      }
      div:nth-child(2) {
        width: 60%;
      }
      div {
        span:nth-child(1) {
          color: #999;
        }
        span:nth-child(2) {
          font-size: 18px;
          color: #666;
        }
        span:nth-child(3) {
          color: #999;
        }
        span:nth-child(4) {
          font-size:18px;
          color: #666;
        }
      }
    }
  }
  .addImg {
    position: absolute;
    bottom: 80px;
    right: 10px;
    width: 70px;
    height: 70px;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>

<style lang="less">
.el-date-range-picker {
  width: 260px !important;
}
.el-date-range-picker__content {
  float: inherit;
  width: 100%;
}
.el-date-range-picker .el-picker-panel__body {
  min-width: auto;
}
.el-date-editor .el-range-separator {
  width: 7%;
}
</style>
