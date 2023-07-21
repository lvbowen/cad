<template>
  <div class="ScheduleDetails">
    <div class="app_title">
      <div>
        <img @click="toprev" :src="prev" alt="" />
        <span>填报明细</span>
      </div>
    </div>
    <div>
      <div class="info_title">
        <div>
          <img src="../../Img/title@2x.png" alt="" />
          <span>基本信息</span>
        </div>
        <div v-if="infoIsshow" @click="toRecord">
          <span>填报记录</span>
          <i> ＞ </i>
        </div>
      </div>
      <div class="information" v-if="infoIsshow">
        <div>
          <p>
            <span>任务名称：</span> <span>{{ planDetailName }}</span>
          </p>
          <p>
            <span>计划数量：</span> <span>{{ planDetailAmount }} 个</span>
          </p>
          <p>
            <span>完成数量：</span> <span>{{ reportDetailAmount }} 个</span>
          </p>
          <p>
            <span>剩余数量：</span> <span>{{ surplusAmount }} 个</span>
          </p>
        </div>
        <div>
          <p>
            <span>单价：</span> <span>{{ planDetailUnitPrice }} 元</span>
          </p>
          <p>
            <span>计划产值：</span> <span>{{ planDetailMoney }} 元</span>
          </p>
          <p>
            <span>完成产值：</span> <span>{{ reportDetailMoney }} 元</span>
          </p>
          <p>
            <span>剩余产值：</span> <span>{{ surplusMoney }} 元</span>
          </p>
        </div>
      </div>
      <div class="information" v-if="!infoIsshow">
        <div>
          <p>
            <span>任务数量：</span> <span>{{ planDetailName }} 个</span>
          </p>
          <p>
            <span>总计划数量：</span> <span>{{ planDetailAmount }} 个</span>
          </p>
          <p>
            <span>总完成数量：</span> <span>{{ reportDetailAmount }} 个</span>
          </p>
          <p>
            <span>总剩余数量：</span> <span>{{ surplusAmount }} 个</span>
          </p>
        </div>
        <div>
          <p>
            <span>总计划产值：</span> <span>{{ planDetailMoney }} 元</span>
          </p>
          <p>
            <span>总完成产值：</span> <span>{{ reportDetailMoney }} 元</span>
          </p>
          <p>
            <span>总剩余产值：</span> <span>{{ surplusMoney }} 元</span>
          </p>
        </div>
      </div>
    </div>
    <div>
      <div class="info_title">
        <div>
          <img src="../../Img/title@2x.png" alt="" />
          <span>填报内容</span>
        </div>
      </div>
      <div>
        <div class="info_content">
          <span>填报人</span>
          <el-input
            placeholder="请输入内容"
            v-model="userName"
            :disabled="true"
          >
          </el-input>
        </div>
        <el-form ref="form" :model="form" labelWidth="100px">
          <el-form-item label="填报日期">
            <el-date-picker
              @change="timeChange"
              type="date"
              placeholder="选择日期"
              v-model="form.date1"
              style="width: 90%"
              valueFormat="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="填报产值">
            <el-input
              placeholder="1-100的百分比"
              v-model="input"
              clearable
            >
            </el-input>
            <!-- <el-select
              @change="regionChange"
              v-model="form.region"
              placeholder="请选择"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select> -->
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div @click="submit" class="submit"><span>提交</span></div>
  </div>
</template>

<script>
import prev from "../../Img/fanhui.png";
import Input from "element-ui/lib/input";
import Form from "element-ui/lib/form";
import Loading from "element-ui/lib/loading";
import FormItem from "element-ui/lib/form-item";
import DatePicker from "element-ui/lib/date-picker";
import {
  getAddList,
  getMultipleReportDetail,
  getReportRatio,
} from "../service/index.js";
import env from "@/config/env";
import Message from "element-ui/lib/message";
import Vue from "vue";
import { Toast } from 'vant';
Vue.prototype.$message = Message;
Vue.prototype.$loading = Loading.service;
export default {
  components: {
    ElFormItem: FormItem,
    ElForm: Form,
    ElDatePicker: DatePicker,
    ElInput: Input,
  },
  inject: ["projectConfig"],
  data() {
    return {
      prev: prev,
      input: 0,
      planDetailName: "",
      options: [],
      planDetailAmount: "",
      reportDetailAmount: "",
      surplusAmount: "",
      planDetailUnitPrice: "",
      planDetailMoney: "",
      reportDetailMoney: "",
      surplusMoney: "",
      projectCode: "",
      projectname: "",
      id: "",
      userName: "",
      infoIsshow: true,
      form: {
        name: "",
        region: "100%",
        date1: new Date(),
      },
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
    submit() {
      var k = /^(\d|[1-9]\d|100)(\.\d{1,2})?%$/;
      if (k.test(this.input + "%")) {
        this.formList.ratio = this.input
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
          } else {
            loading.close();
            this.$message.error("填报失败！");
          }
        });
      }else {
        Toast('请输入1-100的整数或者保留两位小数的百分比');
      }
    },
    timeChange(val) {
      this.formList.reportDate = val;
    },
    // regionChange(val) {
    //   this.formList.ratio = val;
    // },
    toprev() {
      this.$router.go(-1);
    },
    toRecord() {
      this.$router.push({
        name: "ScheduleRecord",
        query: {
          id: this.id,
        },
      });
    },
  },
  computed: {
    idList() {
      return this.$store.state.idLists;
    },
  },
  mounted() {
    if (this.$route.query.isMulti) {
      this.infoIsshow = false;
      this.formList.idList = this.idList;
      getMultipleReportDetail(this.formList).then((res) => {
        this.planDetailName = res.data.taskNum;
        this.planDetailAmount = res.data.planDetailAmount;
        this.reportDetailAmount = res.data.reportDetailAmount;
        this.surplusAmount = res.data.surplusAmount;
        this.planDetailMoney = res.data.planDetailMoney;
        this.reportDetailMoney = res.data.reportDetailMoney;
        this.surplusMoney = res.data.surplusMoney;
        this.userName = res.data.userName;
      });
    } else {
      this.infoIsshow = true;
      this.id = this.$route.query.id;
      this.planDetailName = this.$route.query.planDetailName;
      this.planDetailAmount = this.$route.query.planDetailAmount;
      this.reportDetailAmount = this.$route.query.reportDetailAmount;
      this.surplusAmount = this.$route.query.surplusAmount;
      this.planDetailUnitPrice = this.$route.query.planDetailUnitPrice;
      this.planDetailMoney = this.$route.query.planDetailMoney;
      this.reportDetailMoney = this.$route.query.reportDetailMoney;
      this.surplusMoney = this.$route.query.surplusMoney;
      this.userName = this.$route.query.userName;
      this.formList.idList.push(this.id);
    }
    this.projectCode = `${env.project}`;
    // this.projectname = sessionStorage.getItem("projectname");
    this.projectName = this.projectConfig?.projectName ?? "";
    getReportRatio(this.projectCode, this.projectname).then((res) => {
      this.options = res.data.map((item) => {
        return { value: item, label: item + "%" };
      });
    });
    var time = new Date();
    this.formList.reportDate =
      time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate();
    this.formList.projectCode = this.projectCode;
  },
};
</script>

<style lang="less">
* {
  font-size: 14px;
  font-family: Source Han Sans CN;
}
.ScheduleDetails {
  .el-date-editor {
    width: 90%;
  }
  .el-input__inner {
    height: 30px;
    // width: 80%;
  }
  .inputName {
    width: 90%;
  }
  .el-select {
    width: 90%;
  }
  .el-form-item__label {
    text-align: left;
    padding: 0 12px 0 25px;
  }
  .el-input {
    text-align: left;
  }
  .el-form-item__content {
    text-align: left;
    margin-left: 110px !important;
  }
  .info_title {
    display: flex;
    padding: 20px;
    div {
      flex: 1;
    }
    div:nth-child(1) {
      text-align: left;
      line-height: 25px;
    }
    div:nth-child(2) {
      text-align: right;
    }
    img {
      width: 20px;
      height: 20px;
      margin-right: 5px;
      vertical-align: middle;
    }
    i {
      display: inline-block;
      vertical-align: middle;
      font-size: 25px;
    }
    span {
      font-size: 16px;
      vertical-align: middle;
      color: #666666;
    }
  }
  .information {
    display: flex;
    padding: 0 20px;
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
      margin-bottom: 30px;
      font-weight: 300;
    }
  }
  .info_content {
    margin-bottom: 20px;
    .el-input {
      width: 66%;
      margin-left: 30px;
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
  .submit {
    position: fixed;
    width: 100%;
    bottom: 49px;
    height: 13vw;
    background: #ffffff;
    line-height: 50px;
    box-shadow: 0px -4px 10px 0px rgba(0, 0, 0, 0.09);
    span {
      font-size: 16px;
      font-family: PingFang SC;
      text-align: center;
      color: #0e79ed;
    }
  }
  .el-input {
    width: 90%;
  }
}
</style>
