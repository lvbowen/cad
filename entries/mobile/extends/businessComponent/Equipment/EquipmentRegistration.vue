<template>
  <div class="EquipmentRegistration">
    <div class="title">
      <img style="margin-right: 18px" @click="toprev" src="../../Img/fanhui1.png" alt="" />
      <h2>设备登记</h2>
      <div>
        <img
          @click="clickCode"
          style="margin-right: 15px"
          src="../../Img/Equipment/扫码.png"
          alt=""
        />
        <img @click="imgClick" src="../../Img/Equipment/添加.png" alt="" />
      </div>
    </div>
    <div class="EquipmentContent">
      <div class="search">
        <Search @search="searchClick" v-model="keyword" placeholder="请输入搜索关键词" />
        <img @click="showSelect = true" src="../../Img/icon_sx@2x.png" alt="" />
      </div>
      <div
        class="report_card"
        @click="JumpClick(item)"
        v-for="(item, index) in EquipmentList"
        :key="index"
        :style="{
          borderTop:
            item.deviceState == '未入场'
              ? '3px solid #ff0000'
              : item.deviceState == '已入场'
              ? '3px solid #296eff'
              : item.deviceState == '使用中'
              ? '3px solid #0ecd62'
              : item.deviceState == '维修中'
              ? '3px solid #ff6200'
              : item.deviceState == '已报废'
              ? '3px solid #b5b3ac'
              : item.deviceState == '已离场'
              ? '3px solid #a93ecf'
              : '',
        }"
      >
        <div class="listTitle">
          <h3>{{ item.deviceName }}</h3>
          <h4>({{ item.deviceSn }})</h4>
        </div>
        <div class="flex">
          <div>
            <p>设备类型</p>
            <p>{{ item.deviceType }}</p>
          </div>
          <div>
            <p>责任人</p>
            <p>{{ item.manager }}</p>
          </div>
          <div>
            <p>设备状态</p>
            <p
              :style="{
                color:
                  item.deviceState == '未入场'
                    ? '#ff0000'
                    : item.deviceState == '已入场'
                    ? '#296eff'
                    : item.deviceState == '使用中'
                    ? '#0ecd62'
                    : item.deviceState == '维修中'
                    ? '#ff6200'
                    : item.deviceState == '已报废'
                    ? '#b5b3ac'
                    : item.deviceState == '已离场'
                    ? '#a93ecf'
                    : '',
              }"
            >
              {{ item.deviceState }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <overlay :show="showSelect">
      <div class="overlayData">
        <div class="wrapper">
          <h5>筛选条件</h5>
          <Button class="reset" @click="resetClick" plain type="info">重置</Button>
          <div class="select">
            <Cell title="选择日期区间：" :value="date" @click="showCalendar = true" />
            <Calendar
              :min-date="minDate"
              :max-date="maxDate"
              v-model="showCalendar"
              type="range"
              color="#1989fa"
              @confirm="onConfirm"
            />
          </div>
          <div class="select">
            <p>设备类型：</p>
            <el-select v-model="type" placeholder="请选择">
              <el-option
                v-for="item in optionsType"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="select">
            <p>责任人：</p>
            <el-select v-model="person" placeholder="请选择">
              <el-option
                v-for="item in optionsManager"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="select">
            <p>状态：</p>
            <el-select v-model="state" placeholder="请选择">
              <el-option
                v-for="item in optionsState"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="radioStyle">
            <RadioGroup @change="radioClick" v-model="radio" direction="horizontal">
              <Radio name="1">全部设备</Radio>
              <Radio name="2">自身相关设备</Radio>
            </RadioGroup>
          </div>
          <div class="btn">
            <Button @click="confirm" type="info">确认</Button>
            <Button @click="cancel">取消</Button>
          </div>
        </div>
      </div>
    </overlay>
    <qrcode
      :qrcode="qrcode"
      v-show="qrcode"
      :camera="camera"
      :torchActive="torchActive"
      @turnCameraOff="turnCameraOff"
      @onDecode="onDecode"
      @onInit="onInit"
    />
  </div>
</template>

<script>
import { Overlay } from "vant";
import { Button } from "vant";
import { Search } from "vant";
import { Calendar } from "vant";
import { Cell } from "vant";
import { Radio } from "vant";
import { RadioGroup } from "vant";
import Option from "element-ui/lib/option";
import Select from "element-ui/lib/select";
import { getSearchDevice, getSearchRule } from "../service/index.js";
import env from "@/config/env";
import qrcode from "./qrcode.vue";
export default {
  components: {
    Search,
    Overlay,
    Button,
    Calendar,
    Cell,
    Radio,
    RadioGroup,
    ElSelect: Select,
    ElOption: Option,
    qrcode,
  },
  inject: ["projectConfig"],
  data() {
    return {
      qrcode: false,
      torchActive: false,
      camera: "off",
      showSelect: false,
      showCalendar: false,
      EquipmentList: [],
      optionsType: [],
      optionsManager: [],
      optionsState: [],
      type: "",
      projectCode: "",
      projectName: "",
      keyword: "",
      type: "",
      person: "",
      state: "",
      startEntryDate: "",
      endEntryDate: "",
      currentDate: "",
      date: "",
      minDate: new Date(2015, 1, 1),
      maxDate: new Date(2024, 12, 31),
      radio: "1",
      relatedFlag: false,
    };
  },
  methods: {
    toprev() {
      this.$router.go(-1);
    },
    JumpClick(val) {
      this.$router.push({
        name: "EquipmentDetails",
        query: {
          id: val.id,
        },
      });
    },
    getinit() {
      getSearchDevice(
        this.projectCode,
        this.projectName,
        this.keyword,
        this.type,
        this.person,
        this.state,
        this.startEntryDate,
        this.endEntryDate,
        this.relatedFlag
      ).then((res) => {
        this.EquipmentList = res.data;
      });
    },
    resetClick() {
      this.relatedFlag = false;
      this.type = "";
      this.person = "";
      this.state = "";
      this.startEntryDate = "";
      this.endEntryDate = "";
      this.date = "";
      this.radio = "1";
    },
    confirm() {
      this.showSelect = false;
      this.getinit();
    },
    cancel() {
      this.showSelect = false;
      this.resetClick();
    },
    formatDate(date) {
      return `${date.getFullYear()}-${
        date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
      }-${date.getDate()}`;
    },
    radioClick() {
      if (this.radio == 1) {
        this.relatedFlag = false;
      } else {
        this.relatedFlag = true;
      }
    },
    searchClick() {
      this.getinit();
    },
    imgClick() {
      this.$router.push({
        name: "form-detail",
        query: {
          schemaCode: this.projectCode + "_device_info",
          sheetCode: this.projectCode + "_device_info",
          return: `${this.$route.fullPath}&iframeAction=add`,
          projectName: this.projectConfig?.projectName ?? "",
        },
      });
    },
    // 检查是否调用摄像头
    async onInit(promise) {
      try {
        await promise;
      } catch (error) {
        if (error.name === "StreamApiNotSupportedError") {
        } else if (error.name === "NotAllowedError") {
          this.errorMessage = "Hey! I need access to your camera";
        } else if (error.name === "NotFoundError") {
          this.errorMessage = "Do you even have a camera on your device?";
        } else if (error.name === "NotSupportedError") {
          this.errorMessage =
            "Seems like this page is served in non-secure context (HTTPS, localhost or file://)";
        } else if (error.name === "NotReadableError") {
          this.errorMessage = "Couldn't access your camera. Is it already in use?";
        } else if (error.name === "OverconstrainedError") {
          this.errorMessage =
            "Constraints don't match any installed camera. Did you asked for the front camera although there is none?";
        } else {
          this.errorMessage = "UNKNOWN ERROR: " + error.message;
        }
      }
    },
    clickCode() {
      // camera:: 'rear'--前摄像头，'front'后摄像头，'off'关闭摄像头，会获取最后一帧显示，'auto'开始获取摄像头
      this.qrcode = true;
      this.camera = "rear";
    },
    onDecode(result) {
      // result, 扫描结果，可以根据自己的需求来实现相应的功能
      this.turnCameraOff();
      this.$router.push({
        name: "EquipmentDetails",
        query: {
          id: result,
        },
      });
    },
    // 关闭相机？？？？？？
    turnCameraOff() {
      this.camera = "off";
      this.qrcode = false;
    },
    onConfirm(val) {
      const [start, end] = val;
      this.date = `${this.formatDate(start)} ~ ${this.formatDate(end)}`;
      this.startEntryDate = this.formatDate(start);
      this.endEntryDate = this.formatDate(end);
      this.showCalendar = false;
    },
  },
  mounted() {
    this.projectName = this.projectConfig.projectName;
    this.projectCode = `${env.project}`;
    this.getinit();
    getSearchRule(this.projectCode, this.projectName).then((res) => {
      res.data.forEach((e) => {
        if (e.name == "type") {
          this.optionsType = e.value.map((item) => {
            return {
              name: item,
              value: item,
            };
          });
        }
        if (e.name == "manager") {
          this.optionsManager = e.value;
        }
        if (e.name == "state") {
          this.optionsState = e.value.map((item) => {
            return {
              name: item,
              value: item,
            };
          });
        }
      });

      this.optionsState.map((item) => {
        return {
          name: item,
          value: item,
        };
      });
    });
  },
};
</script>

<style lang="less" scoped>
* {
  margin: 0;
}
.EquipmentRegistration {
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
      width: 22px;
      height: 22px;
    }
  }
  .EquipmentContent {
    padding: 0 15px;
    .van-search__content {
      border-radius: 15px;
    }
  }
  .search {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    img {
      width: 28px;
      height: 30px;
    }
    .van-search {
      width: 92%;
    }
  }
  .report_card {
    width: 100%;
    height: 125px;
    border-radius: 20px;
    padding: 10px 15px;
    box-shadow: 0px 10px 30px 0px rgba(153, 153, 153, 0.4);
    border-radius: 10px;
    font-size: 16px;
    margin-bottom: 20px;
    .listTitle {
      height: 45px;
      line-height: 45px;
      text-align: left;
      align-items: center;
      white-space: nowrap;
      h4 {
        color: #9392a3;
        display: inline-block;
        font-size: 14px;
      }
    }
    h3 {
      color: #333;
      display: inline-block;
      height: 40px;
      line-height: 40px;
      text-align: left;
      font-size: 16px;
      padding-left: 5px;
      margin-bottom: 10px;
    }
    .flex {
      display: flex;
      div {
        width: 33%;
        margin-right: 5px;
        p:nth-child(1) {
          color: #999;
          margin-bottom: 8px;
          font-size: 15px;
        }
        p:nth-child(2) {
          font-size: 16px;
          font-weight: 800;
          color: #1f1d41;
        }
      }
    }
  }
  .overlayData {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    .wrapper {
      width: 85%;
      height: 50%;
      background-color: #fff;
      border-radius: 20px;
      padding: 15px 0;
      text-align: right;
      h5 {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 10px;
        color: #337df7;
        text-align: center;
      }
      .radioStyle {
        padding-left: 20px;
        margin-bottom: 20px;
        margin-top: 10px;
        .van-radio {
          margin-right: 20px;
        }
        .van-radio__label {
          font-size: 15px;
        }
      }
      .select {
        display: flex;
        height: 40px;
        align-items: center;
        margin-bottom: 20px;
        p {
          margin-right: 5px;
          font-size: 15px;
          width: 28%;
        }
      }
      .btn {
        Button {
          margin: 0 10px;
          width: 23%;
          height: 32px;
          border-radius: 10px;
        }
      }
      .reset {
        height: 25px;
        margin-right: 15px;
        margin-bottom: 10px;
      }
    }
  }
  .van-popup--bottom {
    bottom: 50px;
  }
  .van-cell {
    text-align: left;
  }
  .van-cell__title {
    flex: auto;
    width: 30%;
  }
  .van-cell__value {
    flex: auto;
    color: #333;
    font-size: 15px;
    text-align: left;
  }
}
</style>

<style lang="less">
.overlayData {
  .el-input__inner {
    height: 32px;
    line-height: 32px;
  }
  .el-input__icon {
    line-height: 32px;
  }
}
</style>
