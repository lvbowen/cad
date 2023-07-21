<template>
  <div>
    <NavBar title="验收总览" leftArrow @click-left="clickLeft" />
    <div class="container description">
      <span>
        <i>{{ qualityViewData.全部验收 }}</i>
        <em>全部验收</em>
      </span>
      <i></i>
      <span>
        <i>{{ qualityViewData.今日验收 }}</i>
        <em>今日验收</em>
      </span>
      <i></i>
      <span>
        <i>{{ qualityViewData.不合格 }}</i>
        <em>不合格</em>
      </span>
    </div>
    <div class="container pieCharts">
      <div class="charts-title">
        <img src="../../Img/hj_title.png" />
        <em>验收类型</em>
      </div>
      <div class="pieCharts-charts">
        <PieEcharts
          id="problemArea"
          :chartData="problemAreaData"
          :itemCollor="['#FD6E11','#00C567','#FFA943','#287EFC']"
          :title="problemAreaTitle"
        />
        <PieEcharts
          id="problemType"
          :chartData="problemTypeData"
          :itemCollor="['#287EFC','#00C567','#FFA943','#FD6E11',]"
          :title="problemTypeTitle"
        />
      </div>
    </div>
    <div class="container lineCharts">
      <div class="charts-title">
        <img src="../../Img/hj_title.png" />
        <em>验收统计</em>
      </div>
      <div class="lineCharts-charts">
        <LineEcharts id="problemDay" :chartData="problemDayData" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue,} from "vue-property-decorator";
import { Icon, NavBar } from "vant";
import PieEcharts from "../securityoverview/pieEchart.vue";
import LineEcharts from "../securityoverview/lineEchart.vue";
import * as Api from "../../service/api";
import echarts from "echarts";

@Component({
  name: "QualityOverview",
  components: {
    Icon,
    NavBar,
    PieEcharts,
    LineEcharts,
  },
})
export default class QualityOverview extends Vue {
  @InjectReactive("projectConfig") projectConfig;
  @InjectReactive("project") projectCode;
  bbb: any = [
    {
      name: "Email",
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: "line",
      smooth: true,
    },
    {
      name: "Union Ads",
      data: [20, 32, 91, 93, 190, 130, 120],
      type: "line",
      smooth: true,
    },
  ];
  qualityViewData: any = [];

  problemAreaTitle: string = "部位\n分类";
  problemAreaData: any = [];
  problemTypeTitle: string = "工序\n分类";
  problemTypeData: any = [];

  problemDayData: any = {};

  mounted() {
    this.getQualityView();
  }
  //返回事件
  clickLeft() {
    this.$router.back();
  }
  getQualityView() {
    Api.getQualityView({
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName ?? "",
    }).then((res) => {
      if (res.errcode === 0) {
        this.qualityViewData = res.data.problemOverview;
        for (let key in res.data.problemArea) {
          this.problemAreaData.push({
            value: res.data.problemArea[key],
            name: key,
          });
        }
        for (let key in res.data.problemType) {
          this.problemTypeData.push({
            value: res.data.problemType[key],
            name: key,
          });
        }
        let xData: number[] = [];
        let xTitle: string[] = [];
        for (let key in res.data.problemDay) {
          xTitle.push(key);
          xData.push(res.data.problemDay[key]);
        }
        this.problemDayData = {
          xTitle: xTitle,
          data: [
            {
              data: xData,
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
      }
    });
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/mixins.less";
@import "~@/styles/common.less";
/deep/.van-nav-bar {
  background-color: #3e7bff;
  border-bottom: 1px solid #d7d7d7;
  .van-nav-bar__title {
    color: #e4f8ff;
    font-weight: 500;
    .px2rem(font-size,35px);
  }
  .van-icon {
    color: #e4f8ff;
    .px2rem(font-size,45px);
  }
}
.container {
  margin: 0 auto;
  //.px2rem(width,706px);
  width: 96vw;
  border-radius: 5px;
  box-shadow: 0px 5px 20px 5px #e2e1e6;
}
.charts-title {
  align-self: flex-start;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  .px2rem(margin-left,27px);
  .px2rem(padding-top,25px);
  img {
    .px2rem(width,30px);
    .px2rem(height,30px);
  }
  em {
    .px2rem(margin-left,10px);
    .px2rem(font-size,30px);
    color: #323234;
  }
}
.description {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  .px2rem(margin-top,20px);
  height: 12vh;
  span {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    flex: 1;
    i {
      .px2rem(margin-bottom,11px);
      .px2rem(font-size,35px);
      font-weight: 700;
    }
    em {
      .px2rem(margin-top,11px);
      .px2rem(font-size,30px);
      color: #a6a5ae;
    }
  }
  & > i {
    height: 20px;
    width: 2px;
    background-color: #efeef1;
  }
}
.pieCharts {
  display: flex;
  flex-flow: column nowrap;
  .px2rem(margin-top,25px);
  height: 35vh;
  .pieCharts-charts {
    flex: 1;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-evenly;
    & > div {
      flex: 1;
    }
  }
}
.lineCharts {
  display: flex;
  flex-flow: column nowrap;
  .px2rem(margin-top,25px);
  //.px2rem(height,435px);
  height: calc( 50vh - 130px);
  .lineCharts-charts {
    flex: 1;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-evenly;
    & > div {
      flex: 1;
    }
  }
}
</style>
