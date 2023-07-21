<template>
  <div class="ShipView">
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
    <div class="general_mid">
      <div class="mid_left">
        <div class="gennerl_title">设备分析</div>
        <CircleEchart
          :chartData="circleData"
          id="CircleEchart"
          style="width: 95%; height: 240px; margin-left: 3%"
        ></CircleEchart>
      </div>
      <div class="mid_right">
        <div class="gennerl_title">每月进场设备数</div>
        <div>
          <BarEcharts
            :chartData="BarData"
            :id="'BarEchart'"
            style="width: 95%; height: 280px"
          ></BarEcharts>
        </div>
      </div>
    </div>
    <div class="general_bot">
      <div class="bot_title">
        <div class="flex_title">设备进退场</div>
        <div>
          <el-input
            placeholder="请输入关键字搜索"
            v-model="input"
            suffixIcon="el-icon-search"
            @change="onChange"
            clearable>
          </el-input>
        </div>
      </div>
      <div style="height: 88%;">
        <el-table
          ref="table"
          :data="tableData"
          stripe
          height="100%"
          style="width: 100%"
        >
          <el-table-column
            align="center"
            type="index"
            width="80px"
            label="序号"
          >
          </el-table-column>
          <el-table-column
            align="center"
            prop="deviceName"
            width="80px"
            label="船舶名称"
          >
          </el-table-column>
          <el-table-column
            align="center"
            prop="deviceNature"
            width="140px"
            label="设备性质"
          >
          </el-table-column>
          <el-table-column align="center" prop="deviceName" label="设备名称">
          </el-table-column>
          <el-table-column
            align="center"
            prop="type"
            width="150px"
            label="船舶类型"
          >
          </el-table-column>
          <el-table-column
            align="center"
            prop="shipWeight"
            width="150px"
            label="总吨/净吨"
          >
          </el-table-column>
          <el-table-column
            align="center"
            prop="certificateValidity"
            width="140px"
            label="证书有效期"
          >
          </el-table-column>
          <el-table-column
            align="center"
            prop="rentalUnit"
            label="分包/租凭单位名称"
          >
          </el-table-column>
          <el-table-column
            align="center"
            prop="inTime"
            width="140px"
            label="进场时间"
          >
          </el-table-column>
          <el-table-column
            align="center"
            prop="outTime"
            label="退场日期"
            width="130px"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import CircleEchart from "./circleEcharts.vue";
import BarEcharts from "./BarEcharts.vue";
import Input from "element-ui/lib/input";
import env from "@/config/env";
import {getEquipmentScreenInfo} from "./server";

@Component({
  name: "ShipView",
  components: {
    BarEcharts,
    CircleEchart,
    ElInput: Input,
  },
})
export default class ShipView extends Vue {
  deviceType: Number = 3;
  projectCode: String = "";
  @Prop() projectName!: String;
  @Prop() projectLevel!: String;
  titleDataList: Array<any> = [
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
  ];
  circleData: any = {
    data: [
      {
        name: "在场",
        value: 0,
      },
      {
        name: "退场",
        value: 0,
      },
    ],
    isLabelLineShow: true,
    midText: "总设备",
    legend: ["在场", "退场"],
    unitName: "台",
    orient: "vertical",
    bottom: 100,
    center: ["50%", "50%"],
  };
  BarData: any = {
    xAxis: [],
    yAxis: [],
    height: "65%"
  };
  tableData: Array<any> = [];
  tableDataCopy: Array<any> = [];
  input: string = "";

  onChange(val) {//回车点击搜索
    this.tableData = this.tableDataCopy.filter((item) => {
      return item.deviceName.indexOf(this.input) > -1;
    })
  }

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
      this.BarData.xAxis = res.data.dateList;
      this.BarData.yAxis = res.data.monthNum;
      res.data.equipmentDTOList?.forEach((e) => {
        e.inTime = e.inTime?.split("T")[0];
        e.outTime = e.outTime?.split("T")[0];
        e.certificateValidity = e.certificateValidity?.split("T")[0];
        // e.file = Object.keys(e.file).map((key) => {
        //   return {
        //     url: e.file[key],
        //     name: key
        //   };
        // });
      });
      this.tableDataCopy = res.data.equipmentDTOList;
      this.tableData = this.tableDataCopy;
    })
  }

  mounted() {
    this.projectCode = `${env.project}`;
    this.getinit()
  }
}
</script>
<style lang="less" scoped>
* {
  font-family: Source Han Sans CN;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.ShipView {
  width: 100%;
  height: 100%;
  padding: 10px;

  .gennerl_title {
    width: 326px;
    font-size: 16px;
    //border-left: 4px solid #0074ff;
    background: url("../../../../src/assets/extends/datahome/equipmentView/title_bg.png");
    background-size: 100% 100%;
    padding-left: 30px;
    height: 29px;
    line-height: 20px;
    margin-bottom: 8px;
    font-weight: 700;
  }

  .general_top {
    width: 100%;
    height: 15vh;
    margin-bottom: 10px;
    //background: rgba(54, 126, 255, 0.15);
    background: url("../../../../src/assets/extends/datahome/equipmentView/k3_zgqd.png");
    background-size: 100% 100%;
    padding: 10px;

    .descriptionData {
      display: flex;

      .item {
        width: 18%;
        margin-right: 2%;
        height: 9vh;
        padding: 2vh;
        margin: auto;
        background: url("../../../../src/assets/extends/datahome/equipmentView/data_bg.png");
        background-size: 100% 100%;
        display: flex;

        .val {
          p {
            color: #fff;
            margin: 0;
          }

          h5 {
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

  .general_mid {
    width: 100%;
    display: flex;
    height: 30vh;
    margin-bottom: 10px;

    .mid_left {
      width: 40%;
      padding: 10px;
      margin-right: 10px;
      //background: rgba(54, 126, 255, 0.15);
      background: url("../../../../src/assets/extends/datahome/equipmentView/k2_qdtj.png");
      background-size: 100% 100%;
    }

    .mid_right {
      width: 60%;
      padding: 10px;
      //background: rgba(54, 126, 255, 0.15);
      background: url("../../../../src/assets/extends/datahome/equipmentView/k1_aqfx.png");
      background-size: 100% 100%;
    }
  }

  .general_bot {
    width: 100%;
    height: 31vh;
    //background: rgba(54, 126, 255, 0.15);
    background: url("../../../../src/assets/extends/datahome/equipmentView/k2_jctj.png");
    background-size: 100% 100%;
    padding: 15px;

    .bot_title {
      display: flex;
      justify-content: space-between;
      padding-right: 15px;
      margin-bottom: 10px;

      .flex_title {
        width: 326px;
        font-size: 16px;
        //border-left: 4px solid #0074ff;
        background: url("../../../../src/assets/extends/datahome/equipmentView/title_bg.png");
        background-size: 100% 100%;
        padding-left: 30px;
        height: 30px;
        line-height: 20px;
        font-weight: 700;
      }
    }
  }
}
</style>
<style lang="less">
.ShipView {
  .el-table {
    color: #fff;
    background-color: rgba(53, 130, 243, 0.1); // transparent;
    border: 1px solid rgba(119, 171, 210, 1);
  }

  .el-table th {
    color: rgba(255, 255, 255, 1);
    border: 1px solid #5073a1;
    background: rgba(53, 130, 243, 0.2);
    font-weight: 800;
    font-size: 14px;
    text-align: center;
  }

  .el-table tr,
  .el-table td {
    font-size: 13px;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: rgba(255, 255, 255, 1);
    border: 1px solid #5073a1;
    background-color: transparent;
    text-align: center;
    cursor: pointer;
  }

  .el-table--striped .el-table__body tr.el-table__row--striped td {
    background: rgba(53, 130, 243, 0.2);
  }

  .el-table .warning-row {
    background: rgba(234, 237, 243, 0.1);
  }

  .el-table--enable-row-hover .el-table__body tr:hover > td {
    background: rgba(233, 237, 243, 0.3) !important;
  }

  .el-input__inner {
    height: 28px;
    line-height: 28px;
    background: rgba(17, 65, 125, 0.72);
    border: none;
    border-radius: 50px;
    color: #fff;
  }

  .el-input__icon {
    height: 28px;
    line-height: 26px;
    color: #fff;
  }
}
::-webkit-scrollbar-track {
  border-radius: 0;
  background: transparent;
}

</style>
