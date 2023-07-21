<template>
  <div class="wrap">
    <NavBar title="安全总览" leftArrow @click-left="onClickLeft" />
    <div class="content">
      <div class="HazardData">
        <div class="HazardData-left item">
          <div class="rightBorder">
            <p v-if="data">{{ data.safetyStatistics.totalProblem }}</p>
            <p>全部隐患</p>
          </div>
          <i></i>
        </div>
        <div class="HazardData-middle item">
          <div class="rightBorder">
            <p v-if="data">{{ data.safetyStatistics.monthProblem }}</p>
            <p>本月隐患</p>
          </div>
        </div>
        <!--        <div class="HazardData-right item">-->
        <!--          <div class="rightBorder">-->
        <!--            <p v-if="data">{{ data.safetyStatistics.unfinishProblem }}</p>-->
        <!--            <p>未整改隐患</p>-->
        <!--          </div>-->
        <!--        </div>-->
      </div>
      <div class="PieChart">
        <div class="viewTitleLeft">
          <div class="img">
            <img
              src="../../../src/assets/extends/smartConstruction/hj_title.png"
              alt=""
            />
          </div>
          <div>问题占比</div>
        </div>
        <div class="PieChartContent">
          <AccountedForChart
            id="pieChart"
            :chartData="areaSortData"
            :itemCollor="['#FD6E11','#00C567','#FFA943','#287EFC']"
            :title="titleOne"
          ></AccountedForChart>
          <problemEchart
            id="pieChart2"
            :chartData="problemSortData"
            :title="titleTwo"
            :itemCollor="['#FFA943','#287EFC','#FD6E11','#00C567']"
          ></problemEchart>
        </div>
      </div>
      <div class="LineChart">
        <div class="viewTitleLeft">
          <div class="img">
            <img
              src="../../../src/assets/extends/smartConstruction/hj_title.png"
              alt=""
            />
          </div>
          <div>问题统计</div>
        </div>
        <LineEcharts id="lineChart" :chartData="lineData"></LineEcharts>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, InjectReactive } from "vue-property-decorator";
import { NavBar } from "vant";
import * as Api from "../../service/api";
import AccountedForChart from "./pieEchart.vue";
import problemEchart from "./pieEchart.vue";
import LineEcharts from "./lineEchart.vue";
import echarts from "echarts";
// @ts-ignore
@Component({
  name: "environmentView",
  components: {
    NavBar,
    AccountedForChart,
    problemEchart,
    LineEcharts,
  },
})
export default class securityoverview extends Vue {
  // @ts-ignore
  @InjectReactive("projectConfig") projectConfig;
  // @ts-ignore
  @InjectReactive("project") projectCode;
  data: any = null;
  areaSortData: any = [];
  titleOne: any = "内外\n占比";
  colorOne: Array<any> = ["#feab45", "#fa6f18", "#2a7efa"];
  titleTwo: any = "问题\n分类";
  problemSortData: any = [];

  lineData: any = {};
  onClickLeft() {
    this.$router.back();
  }
  mounted() {
    this.getSecurityData();
    // console.log("lineDataX",this.lineDataX);
  }
  getSecurityData() {
    Api.getSecurityData({
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName ?? "",
    }).then((res) => {
      this.data = res.data;
      res.data.areaSort?.forEach((item) => {
        this.areaSortData.push({ value: item.count, name: item.wtlx1 });
      });
      res.data.problemSort?.forEach((item) => {
        this.problemSortData.push({ value: item.count, name: item.wtlx1 });
      });
      const Xtitle:Array<any> = [];
      const dataX:Array<any> = [];
      res.data.problemStatistics?.forEach((item) => {
        dataX.push(item.count);
        Xtitle.push(item.time);
      });
      this.lineData = {
        Xtitle,
        data: [
          {
            data: dataX,
            type: "line",
            smooth: true,
            symbolSize: 5,
            symbol: "circle",
            showAllSymbol: true,
            lineStyle: {
              normal: {
                width: 5,
                color: "rgba(25,163,223,1)", // 线条颜色
              },
              borderColor: 'rgba(0,0,0,.4)',
            },
            itemStyle: {
              color: "rgba(25,163,223,1)",
              borderColor: "#646ace",
              borderWidth: 2
            },
            tooltip: {
              show: true
            },
            areaStyle: { //区域填充样式
              normal: {
                //线性渐变，前4个参数分别是x0,y0,x2,y2(范围0~1);相当于图形包围盒中的百分比。如果最后一个参数是‘true’，则该四个值是绝对像素位置。
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: "rgba(25,163,223,.3)"
                },
                  {
                    offset: 1,
                    color: "rgba(25,163,223, 0)"
                  }
                ], false),
                shadowColor: 'rgba(25,163,223, 0.5)', //阴影颜色
                shadowBlur: 20 //shadowBlur设图形阴影的模糊大小。配合shadowColor,shadowOffsetX/Y, 设置图形的阴影效果。
              }
            },
          },
        ],
      };
    });
  }
}
</script>

<style scoped lang="less">
@import "~@/styles/mixins.less";
@import "~@/styles/common.less";
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.wrap {
  width: 100%;
  height: 100%;
  background-color: #f6f7fb;
  /deep/.van-nav-bar {
    background-color: #3d7bff;
    .van-icon {
      color: white;
      .px2rem(font-size,40px);
    }
    .van-nav-bar__title {
      color: white;
      .px2rem(font-size,32px);
    }
  }
  /deep/.van-nav-bar::after {
    border: none;
  }

  .content {
    width: 100%;
    height: calc( 100vh - 50px - 13vw);
    overflow-y: auto;

    .px2rem(padding-top,20px);
    .px2rem(padding-left,20px);
    .px2rem(padding-right,20px);

    .HazardData {
      width: 100%;
      height: 15vh;
      background-color: #fff;
      .px2rem(border-radius,10px);
      .px2rem(margin-bottom,20px);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      .px2rem(padding-left,10px);
      .px2rem(padding-right,10px);
      display: flex;

      .item {
        // width: 30%;
        height: 100%;
        flex: 1;
        text-align: center;
        .px2rem(line-height,50px);
        .px2rem(padding-top,50px);
        .px2rem(padding-bottom,50px);
        .rightBorder {
          border-right: 1px solid #f2f2f4;
          & > p:nth-child(1) {
            font-weight: 540;
            .px2rem(font-size,30px);
            color: #000;
          }
          & > p:nth-child(2) {
            .px2rem(font-size,30px);
            color: #b0afbb;
          }
        }
      }
      .HazardData-right {
        .rightBorder {
          border: none;
        }
      }
    }
    .PieChart {
      width: 100%;
      height: 35vh;
      background-color: #fff;
      .px2rem(border-radius,10px);
      .px2rem(margin-bottom,20px);
      .px2rem(padding-top,20px);
      .viewTitleLeft {
        width: 60%;
        .px2rem( height, 50px);
        .px2rem(padding-left, 15px);
        .px2rem(font-size, 35px);
        display: flex;
        .img {
          .px2rem( width, 45px);
          height: 100%;
          img {
            width: 100%;
            height: 100%;
          }
          .px2rem(margin-right,10px);
        }
      }
      .PieChartContent {
        width: 100%;
        height: calc( 35vh - 30px);
        flex: 1;
        display: flex;
        // justify-content:space-between
        & > div {
          flex: 1;
        }
      }
    }
    .LineChart {
      width: 100%;
      height: 27vh;
      background-color: #fff;
      .px2rem(border-radius,10px);
      .px2rem(padding-top,20px);
      .viewTitleLeft {
        width: 60%;
        .px2rem( height, 50px);
        .px2rem(padding-left, 15px);
        .px2rem(font-size, 35px);
        display: flex;
        .img {
          .px2rem( width, 45px);
          height: 100%;
          img {
            width: 100%;
            height: 100%;
          }
          .px2rem(margin-right,10px);
        }
      }
    }
  }
}
</style>
