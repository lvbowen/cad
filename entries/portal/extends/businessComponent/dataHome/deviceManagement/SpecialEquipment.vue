<template>
  <div class="SpecialEquipment">
    <div class="general_top">
      <div class="gennerl_title">设备统计</div>
      <div class="descriptionData">
        <div v-for="(item, index) in titleDataList" :key="index" class="item">
          <div class="icon">
            <img
              src="../../../../src/assets/extends/datahome/equipmentView/设备总台数.png"
              alt=""
              v-if="item.name=='设备总台数'">
            <img
              src="../../../../src/assets/extends/datahome/equipmentView/在场设备数.png"
              alt=""
              v-else-if="item.name=='在场设备数'">
            <img
              src="../../../../src/assets/extends/datahome/equipmentView/退场设备数.png"
              alt=""
              v-else-if="item.name=='退场设备数'">
            <img
              src="../../../../src/assets/extends/datahome/equipmentView/维修设备数.png"
              alt=""
              v-else>
          </div>
          <div class="val">
            <p>{{ item.name }}</p>
            <h5>
              <span> {{ item.value }}</span>
              <span>{{ item.type }}</span>
            </h5>
          </div>
        </div>
      </div>
    </div>
    <div class="piecharts">
      <div class="gennerl_title">设备状态</div>
      <CircleEchart
        :chartData="circleData"
        id="CircleEchart"
        style="width: 95%; height: 34vh; margin-left: 3%"
      ></CircleEchart>
    </div>
    <div class="equipmentTree">
      <div class="tree">
        <div class="gennerl_title">特种设备分类</div>
        <div style="padding: 0 22px">
          <el-input placeholder="请输入关键字搜索" v-model="input" clearable>
          </el-input>
        </div>
        <div class="shebeiList">
          <div
            @click="equimentHandle(item, index)"
            v-for="(item, index) in equipmentLists"
            :key="index"
          >
            <img src="./Img/shebei.png" alt=""/>
            <span :style="{ color: equipmentNum == index ? '#0071fe' : '' }">
              {{ item.deviceName }} - {{ item.deviceNum }}
            </span>
          </div>
        </div>
      </div>
      <div style="width: 77%">
        <div class="equipmentInformation">
          <div class="gennerl_title">设备信息</div>
          <div class="message_box">
            <!-- <div>
              <h4>设备编号：</h4>
              <p>{{ deviceNum }}</p>
            </div> -->
            <div>
              <h4>总部预审批：</h4>
              <p>{{ preApproval }}</p>
            </div>
            <div>
              <h4>入场联合验收：</h4>
              <p style="cursor: pointer" @click="toFile">{{ file }}</p>
            </div>
            <div>
              <h4>进场日期：</h4>
              <p>{{ inTime }}</p>
            </div>
            <div>
              <h4>维保次数：</h4>
              <p>{{ fixAndUpkeepNum }}</p>
            </div>
            <div>
              <h4>退场日期：</h4>
              <p>{{ outTime }}</p>
            </div>
            <div>
              <h4>设备在场时长：</h4>
              <p>{{ onlineTime }}</p>
            </div>
            <div>
              <h4>使用登记证：</h4>
              <p style="cursor: pointer" @click="toCertificate">
                {{ certificate }}
              </p>
            </div>
            <div>
              <h4>定期检验报告：</h4>
              <p style="cursor: pointer" @click="toCheckReport">
                {{ checkReport }}
              </p>
            </div>
          </div>
        </div>
        <div class="lineCharts">
          <div class="timePick">
            <div class="gennerl_title">设备监测</div>
            <div>
              <el-date-picker
                v-model="value"
                align="right"
                type="date"
                :clearable="false"
                valueFormat="yyyy-MM-dd"
                @change="timeCheck"
                placeholder="选择日期"
                :pickerOptions="pickerOptions"
              >
              </el-date-picker>
            </div>
          </div>
          <div class="lineCharts_content">
            <div class="lineCharts_tab">
              <div
                v-for="(item, index) in tabList"
                :key="index"
                :style="{ background: tabType == item.type ? '#0071fe' : '' }"
                @click="tabClick(item)"
              >
                {{ item.name }}
              </div>
            </div>
            <div class="LinechartsData">
              <line-echarts :id="'fill'" :chartData="fillData"></line-echarts>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CircleEchart from "./circleEcharts.vue";
import Input from "element-ui/lib/input";
import DatePicker from "element-ui/lib/date-picker";
import LineEcharts from "../../BIMPlatform/Echarts/LineEcharts2.vue";
import {getEquipmentScreenInfo, getTowerCraneTrend} from "./server/index.js";
import env from "@/config/env";

export default {
  components: {
    CircleEchart,
    ElInput: Input,
    LineEcharts,
    ElDatePicker: DatePicker,
  },
  props: {
    projectName: String,
    projectLevel: String,
  },
  data() {
    return {
      fillData: {
        yname: "m",
        lineColor: "#4AACFF",
        xAxis: [],
        left: "5%",
        yAxis1: [],
        interval: [],
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      value: "",
      input: "",
      circleData: {
        data: [
          {
            name: "进场",
            value: 0,
          },
          {
            name: "退场",
            value: 0,
          },
        ],
        isLabelLineShow: true,
        midText: "总设备",
        legend: ["进场", "退场"],
        unitName: "台",
        xlegend: "center",
        center: ["50%", "50%"],
        radius: [110, 90],
      },
      tabList: [
        {
          name: "高度",
          company: "m",
          type: 0,
        },
        {
          name: "幅度",
          company: "m",
          type: 1,
        },
        {
          name: "吊重",
          company: "t",
          type: 2,
        },
        {
          name: "回转",
          company: "角度",
          type: 3,
        },
        {
          name: "安全吊重",
          company: "t",
          type: 4,
        },
        {
          name: "力矩",
          company: "N·m",
          type: 5,
        },
        {
          name: "力矩百分比",
          company: "%",
          type: 6,
        },
        {
          name: "风级",
          company: "级",
          type: 7,
        },
      ],
      titleDataList: [
        {
          name: "设备总台数",
          value: 0,
          type: "台",
        },
        {
          name: "在场设备数",
          value: 0,
          type: "台",
        },
        {
          name: "退场设备数",
          value: 0,
          type: "台",
        },
        {
          name: "重复进场设备占比",
          value: 0,
          type: "%",
        },
      ],
      projectCode: "",
      deviceType: 2,
      equipmentList: [],
      deviceNum: "",
      preApproval: "",
      inTime: "",
      outTime: "",
      onlineTime: "",
      certificate: "",
      fixAndUpkeepNum: "",
      checkReport: "",
      file: "",
      certificateUrl: "",
      checkReportUrl: "",
      fileUrl: "",
      tabType: 0,
      equipmentNum: 0,
    };
  },
  methods: {
    equimentHandle(val, index) {
      //初始化
      this.deviceNum = ""
      this.preApproval = ""
      this.onlineTime = ""
      this.fixAndUpkeepNum = ""
      this.inTime = ""
      this.outTime = ""
      this.certificate = ""
      this.certificateUrl = ""
      this.checkReport = ""
      this.checkReportUrl = ""
      this.file = ""
      this.fileUrl = ""

      this.equipmentNum = index;
      this.deviceNum = val?.deviceNum;
      this.preApproval = val?.preApproval;
      this.onlineTime = val?.onlineTime;
      this.fixAndUpkeepNum = val?.fixAndUpkeepNum;
      this.inTime = val?.inTime?.split("T")[0];
      this.outTime = val?.outTime?.split("T")[0];
      for (const key in val.certificate) {
        if (Object.hasOwnProperty.call(val.certificate, key)) {
          this.certificate = key;
          this.certificateUrl = val.certificate[key];
        }
      }
      for (const key in val.checkReport) {
        if (Object.hasOwnProperty.call(val.checkReport, key)) {
          this.checkReport = key;
          this.checkReportUrl = val.checkReport[key];
        }
      }
      for (const key in val.file) {
        if (Object.hasOwnProperty.call(val.file, key)) {
          this.file = key;
          this.fileUrl = val.file[key];
        }
      }
      this.getLinEcharts();
    },
    timeCheck(val) {
      this.value = val;
      this.getLinEcharts();
    },
    toFile() {
      window.open(this.fileUrl);
    },
    toCertificate() {
      window.open(this.certificateUrl);
    },
    toCheckReport() {
      window.open(this.checkReportUrl);
    },
    tabClick(val) {
      this.tabType = val.type;
      this.fillData.yname = val.company
      this.getLinEcharts();
    },
    getLinEcharts() {
      getTowerCraneTrend(
        this.projectCode,
        this.projectName,
        this.tabType,
        this.value,
        this.deviceNum
      ).then((ress) => {
        this.fillData.xAxis = [];
        this.fillData.yAxis1 = [];
        this.fillData.interval = ress.data[0]?.hnum;
        ress.data.forEach((e) => {
          this.fillData.xAxis.push(e.time);
          this.fillData.yAxis1.push(e.number);
        });
      });
    },
    getinit() {
      getEquipmentScreenInfo(
        this.projectCode,
        this.projectName,
        this.projectLevel,
        this.deviceType
      ).then((res) => {
        this.titleDataList[0].value = res.data.totalNum;
        this.titleDataList[1].value = res.data.inNum;
        this.titleDataList[2].value = res.data.outNum;
        this.titleDataList[3].value = (res.data.repeatRatio * 100).toFixed(2);
        this.circleData.data[0].value = res.data.inNum;
        this.circleData.data[1].value = res.data.outNum;
        this.equipmentList = res.data.equipmentDTOList;
        this.deviceNum = res.data.equipmentDTOList[0]?.deviceNum;
        this.preApproval = res.data.equipmentDTOList[0]?.preApproval;
        this.onlineTime = res.data.equipmentDTOList[0]?.onlineTime;
        this.fixAndUpkeepNum = res.data.equipmentDTOList[0]?.fixAndUpkeepNum;
        this.inTime = res.data.equipmentDTOList[0]?.inTime?.split("T")[0];
        this.outTime = res.data.equipmentDTOList[0]?.outTime?.split("T")[0];
        for (const key in res.data.equipmentDTOList[0].certificate) {
          if (
            Object.hasOwnProperty.call(
              res.data.equipmentDTOList[0].certificate,
              key
            )
          ) {
            this.certificate = key;
            this.certificateUrl = res.data.equipmentDTOList[0].certificate[key];
          }
        }
        for (const key in res.data.equipmentDTOList[0].checkReport) {
          if (
            Object.hasOwnProperty.call(
              res.data.equipmentDTOList[0].checkReport,
              key
            )
          ) {
            this.checkReport = key;
            this.checkReportUrl = res.data.equipmentDTOList[0].checkReport[key];
          }
        }
        for (const key in res.data.equipmentDTOList[0].file) {
          if (
            Object.hasOwnProperty.call(res.data.equipmentDTOList[0].file, key)
          ) {
            this.file = key;
            this.fileUrl = res.data.equipmentDTOList[0].file[key];
          }
        }
        this.getLinEcharts();
      });
    },
  },
  computed: {
    //设置计算属性
    equipmentLists() {
      if (this.input) {
        return this.equipmentList.filter((value) => {
          //过滤数组元素
          return value.deviceNum.indexOf(this.input) > -1 || value.deviceName.indexOf(this.input) > -1; //如果包含字符返回true
        });
      } else {
        return this.equipmentList;
      }
    },
  },
  mounted() {
    const date = new Date();
    this.value =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) +
      "-" +
      date.getDate();
    this.projectCode = `${env.project}`;
    this.getinit();
  },
  watch: {
    projectName() {
      if (this.projectLevel == "项目") {
        this.getinit();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.SpecialEquipment {
  width: 100%;
  height: 100%;
  .gennerl_title {
    width: 326px;
    font-size: 16px;
    //border-left: 4px solid #0074ff;
    background: url("../../../../src/assets/extends/datahome/equipmentView/title_bg.png");
    background-size: 100% 100%;
    padding-left: 30px;
    height: 29px;
    line-height: 20px;
    margin-bottom: 10px;
    font-weight: 700;
  }

  .general_top {
    width: 76%;
    height: 18vh;
    margin-bottom: 10px;
    //background: rgba(54, 126, 255, 0.15);
    background: url("../../../../src/assets/extends/datahome/equipmentView/k3_zgqd.png");
    background-size: 100% 100%;
    display: inline-block;
    padding: 10px;

    .descriptionData {
      display: flex;

      .item {
        width: 22%;
        margin-right: 3%;
        height: 10vh;
        padding: 2vh 2vh 2vh 3vh;
        background: url("../../../../src/assets/extends/datahome/equipmentView/data_bg.png");
        background-size: 100% 100%;
        display: flex;
        margin: auto;

        .val {
          p {
            color: #fff;
            margin-left: 22px;
          }

          h5 {
            margin-left: 22px;

            :nth-child(1) {
              font-size: 3vh;
              color: #00fcf9;
              font-weight: 700;
              font-family: Arial, Helvetica, sans-serif;
              margin-right: 5px;
            }

            :nth-child(2) {
              font-size: 1vh;
              color: rgba(255, 255, 255, 0.5);
            }
          }
        }

        .icon {
          width: 50px;
          height: 50px;
          margin-right: 10%;
          display: block;

          img {
            width: 100%;
            height: 100%;
          }
        }
      }

      //div:nth-child(1) {
      //  background: url("./Img/sbtj1.png");
      //  background-size: 100% 100%;
      //}
      //
      //div:nth-child(2) {
      //  background: url("./Img/sbtj2.png");
      //  background-size: 100% 100%;
      //}
      //
      //div:nth-child(3) {
      //  background: url("./Img/sbtj3.png");
      //  background-size: 100% 100%;
      //}
      //
      //div:nth-child(4) {
      //  background: url("./Img/sbtj4.png");
      //  background-size: 100% 100%;
      //}
      //
      //div:nth-child(5) {
      //  background: url("./Img/sbtj5.png");
      //  background-size: 100% 100%;
      //}
    }
  }

  .piecharts {
    position: absolute;
    right: 8px;
    width: 23%;
    height: 40.2vh;
    //background: rgba(54, 126, 255, 0.15);
    background: url("../../../../src/assets/extends/datahome/equipmentView/k1_xmxx.png");
    background-size: 100% 100%;
    padding: 10px;
    top: 10px;
  }

  .equipmentTree {
    display: flex;
    height: 60vh;

    .tree {
      width: 23%;
      //height: 65.3vh;
      //background: rgba(54, 126, 255, 0.15);
      background: url("../../../../src/assets/extends/datahome/equipmentView/k1_zzjg.png");
      background-size: 100% 100%;
      margin-right: 10px;
      padding: 10px;

      .gennerl_title {
        margin-bottom: 20px;
      }
    }

    .shebeiList {
      padding: 20px;
      height: 48vh;
      overflow-y: auto;

      div {
        margin-bottom: 20px;
        height: 26px;
        cursor: pointer;
      }

      img {
        margin-right: 5px;
        vertical-align: middle;
      }

      span {
        color: rgba(255, 255, 255, 0.8);
        vertical-align: middle;
        font-size: 14px;
      }

      div:hover span {
        color: #0071fe;
      }
    }
  }

  .equipmentInformation {
    width: 68.7%;
    height: 200px;
    margin-bottom: 10px;
    //background: rgba(54, 126, 255, 0.15);
    background: url("../../../../src/assets/extends/datahome/equipmentView/k3_zgqd.png");
    background-size: 100% 100%;
    padding: 10px;

    .message_box {
      display: flex;
      flex-wrap: wrap;
      padding: 15px;
      height: 140px;;
      overflow: hidden;
      overflow-y: auto;

      div {
        // width: 25%;
        display: flex;
        margin-bottom: 15px;
        margin-right: 40px;

        h4 {
          color: rgba(255, 255, 255, 0.5);
          margin-right: 5px;
          margin-bottom: 0;
        }

        p {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 500px
        }
      }
    }
  }

  .lineCharts {
    width: 100%;
    height: calc(100% - 210px);
    //background: rgba(54, 126, 255, 0.15);
    background: url("../../../../src/assets/extends/datahome/equipmentView/k1_aqfx.png");
    background-size: 100% 100%;
    padding: 10px;

    .timePick {
      display: flex;
      justify-content: space-between;
      padding-right: 10px;
      line-height: 30px;
      margin-bottom: 10px;
    }

    .lineCharts_content {
      height: calc(100% - 50px);

      .lineCharts_tab {
        display: flex;
        margin-bottom: 10px;

        div {
          padding: 0 10px;
          height: 28px;
          text-align: center;
          line-height: 28px;
          border: 1px solid #0071fe;
          border-radius: 2px;
          margin-right: 10px;
          cursor: pointer;
        }

        div:hover {
          background: #0071fe;
        }
      }

      .LinechartsData {
        height: calc(100% - 40px);
      }
    }
  }
}
</style>

<style lang="less">
.equipmentTree {
  .el-input__inner {
    height: 30px;
    line-height: 30px;
  }

  .el-input__icon {
    height: 30px;
    line-height: 30px;
  }

  .lineCharts {
    .el-input__inner {
      background: rgba(17, 65, 125, 0.72);
      border: none;
      border-radius: 12px;
      color: rgba(115, 218, 252, 1);
    }
  }
}
</style>
