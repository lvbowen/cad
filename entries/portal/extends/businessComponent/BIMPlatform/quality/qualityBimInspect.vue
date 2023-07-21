<template>
  <div class="qualityBimInspect" :style="{ bottom: boxBottom }">
    <div class="inspect_tree">
      <h3 class="bimInspect_title">工程部位</h3>
      <div class="table_input">
        <el-input
          placeholder="请输入内容"
          @clear="clearClick"
          v-model="input"
          clearable
        >
        </el-input>
        <img @click="searchClick" src="../img/search.png" alt="" />
      </div>
      <el-scrollbar style="height: 85%">
        <el-tree
          class="filter-tree"
          :data="data"
          :expandOnClickNode="false"
          :props="defaultProps"
          @node-click="handleCLick"
          defaultExpandAll
          :filterNodeMethod="filterNode"
          ref="tree"
        >
        </el-tree>
      </el-scrollbar>
    </div>
    <div class="inspect_linechart">
      <div class="time_title">
        <h3 class="bimInspect_title">质检验收数量统计</h3>
        <div class="time_select">
          <span>日期维度：</span>
          <el-date-picker
            @change="handlePick"
            v-model="value2"
            type="daterange"
            align="right"
            unlinkPanels
            valueFormat="yyyy-MM-dd"
            rangeSeparator="至"
            startPlaceholder="开始日期"
            endPlaceholder="结束日期"
            :pickerOptions="pickerOptions"
          >
          </el-date-picker>
        </div>
      </div>
      <div style="height: 88%">
        <line-echarts2 :id="'fill'" :chartData="fillData2"></line-echarts2>
      </div>
    </div>
    <div class="progressEcharts">
      <h3 class="bimInspect_title">质检验收填报情况</h3>
      <div style="height: 88%">
        <pie-charts
          :chartData="investmentData1"
          :id="'investment_echart1'"
        ></pie-charts>
      </div>
      <div class="isshow" @click="isshowClick">
        <img src="../img/组345.png" alt="" />
      </div>
    </div>
  </div>
</template>

<script>
import PieCharts from "../../ManageViews/components/PieCharts.vue";
import LineEcharts2 from "../Echarts/LineEcharts2.vue";
import DatePicker from "element-ui/lib/date-picker";
import Input from "element-ui/lib/input";
import env from "@/config/env";
import Tree from "element-ui/lib/tree";
import {
  getAnalyseNode,
  getAnalyseHandle,
  getMbsList,
} from "../server/index.js";
export default {
  components: {
    PieCharts,
    LineEcharts2,
    ElInput: Input,
    ElTree: Tree,
    ElDatePicker: DatePicker,
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  data() {
    return {
      fillData2: {
        yname: "个数",
        lineColor: "#4AACFF",
        xAxis: [],
        yAxis1: [],
        yName1: "验收数量",
      },
      investmentData1: {
        tileText: "",
        formatter: "",
        orient: "vertical",
        right: 10,
        color: ["#00C567", "#FFA943", "#54D1FF"],
        radius: ["40%", "60%"],
        center: ["40%", "50%"],
        series: [
          {
            name: "已归档",
            value: 0,
          },
          {
            name: "审核中",
            value: 0,
          },
          {
            name: "未填报",
            value: 0,
          },
        ],
      },
      boxBottom: "0px",
      filterText: "",
      data: [],
      defaultProps: {
        children: "childs",
        label: "name",
      },
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
      value2: "",
      startime: "",
      endtime: "",
      projectName: "",
      projectCode: "",
      nodeId: "",
      type: "",
      input: "",
    };
  },
  methods: {
    searchClick() {
      getAnalyseNode(this.projectCode, this.projectName, true,this.input).then(
        (res) => {
          this.data = res.data;
        }
      );
    },
    clearClick() {
      getAnalyseNode(this.projectCode, this.projectName,true).then((res) => {
        this.data = res.data;
      });
    },
    handleCLick(data, node) {
      this.nodeId = data.id;
      this.type = data.type;
      this.investmentData1.series[0].value = data.completeNum;
      this.investmentData1.series[1].value = data.auditNum;
      this.investmentData1.series[2].value = data.waitNum;
      this.getinit();
      getMbsList(
        this.projectCode,
        this.projectName,
        this.nodeId,
        this.type,
        ""
      ).then((res) => {
        this.QualityModel = res.data;
        this.$emit("getQualityModel", this.QualityModel);
      });
      if (node.isLeaf) {
        getAnalyseNode(
          this.projectCode,
          this.projectName,
          true,
          "",
          data.id,
          data.level
        ).then((res) => {
          data.childs = res.data;
        });
      }
    },
    getinit() {
      getAnalyseHandle(
        this.projectCode,
        this.projectName,
        this.nodeId,
        this.type,
        this.startime,
        this.endtime
      ).then((res) => {
        this.fillData2.xAxis = [];
        this.fillData2.yAxis1 = [];
        res.data.timeCount.forEach((element) => {
          this.fillData2.xAxis.push(element.time);
          this.fillData2.yAxis1.push(element.num);
        });
      });
    },
    //选择时间
    handlePick(val) {
      this.startime = val[0];
      this.endtime = val[1];
      this.getinit();
    },
    isshowClick() {
      if (this.boxBottom == "0px") {
        this.boxBottom = "-367px";
      } else {
        this.boxBottom = "0px";
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
  },
  mounted() {
    this.projectName = this.$route.query.projectName;
    this.projectCode = `${env.project}`;
    getAnalyseNode(this.projectCode, this.projectName, true).then((res) => {
      this.data = res.data;
      this.investmentData1.series[0].value = res.data[0].completeNum;
      this.investmentData1.series[1].value = res.data[0].auditNum;
      this.investmentData1.series[2].value = res.data[0].waitNum;
    });
    this.getinit();
  },
};
</script>

<style lang="less" scoped>
* {
  font-family: Source Han Sans CN;
  color: #ffffff;
  box-sizing: border-box;
}
.qualityBimInspect {
  width: 100%;
  height: 400px;
  padding: 40px 20px 0 20px;
  position: fixed;
  transition: 1s;
  display: flex;
  bottom: 0;
  background: url("../../../../src/assets/extends/bim/frame_bottom.png");
  background-size: 100% 100%;
  .bimInspect_title {
    height: 10%;
    font-weight: bold;
    font-size: 16px;
    padding-left: 20px;
  }
  .inspect_tree {
    width: 20%;
    height: 100%;
    .table_input {
      img {
        cursor: pointer;
      }
    }
  }
  .progressEcharts {
    width: 25%;
    height: 100%;
  }
  .inspect_linechart {
    width: 55%;
    height: 100%;
    .time_title {
      display: flex;
    }
    .time_select {
      width: 46%;
      margin-left: auto;
      span {
        font-size: 15px;
        margin-right: 10px;
      }
      .el-input__inner {
        height: 34px;
        line-height: 34px;
      }
      .el-input__icon {
        line-height: 28px;
      }
      // p {
      //   display: inline-block;
      //   width: 40px;
      //   height: 22px;
      //   cursor: pointer;
      //   text-align: center;
      //   line-height: 22px;
      //   margin-right: 10px;
      //   background: rgba(77, 79, 85, 0.7);
      //   border-radius: 4px;
      // }
      // p:hover {
      //   background: rgba(50, 206, 255, 0.5);
      // }
    }
  }
  .isshow {
    position: absolute;
    bottom: 92%;
    left: 48.5%;
    width: 59px;
    height: 29px;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>

<style lang="less">
.qualityBimInspect {
  .el-tree {
    background: none;
  }
  .el-tree-node__content:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  .el-tree-node:focus > .el-tree-node__content {
    background-color: rgba(255, 255, 255, 0.2);
  }
  .el-input__inner {
    background: none;
    color: #fff;
  }
  .el-scrollbar__wrap {
    overflow: scroll;
    height: 95%;
  }
  .time_select {
    .el-date-editor .el-range-input {
      color: #fff;
      background: none;
    }
  }
  .table_input {
    width: 93%;
    display: inline-block;
    text-align: right;
    .el-input__inner {
      height: 30px;
      line-height: 30px;
    }
    .el-input__icon {
      line-height: 30px;
    }
    .el-input {
      width: 90%;
    }
  }
}
</style>
