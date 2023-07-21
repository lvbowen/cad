<template>
  <el-card shadow="hover" class="card">
    <div slot="header" class="clearfix">
      <span class="card_title">安全管理</span>
      <el-button v-if="false" style="float: right; margin-right: 20px" type="text">操作按钮&nbsp;&gt;</el-button
      >
    </div>
    <div class="container">
      <div class="left">
        <div class="title">隐患整改</div>
        <div class="risks">
          <div class="risksCardContainer">
            <div class="risksCard">
              <i>问题总数</i>
              <em>{{ totalProblem }}</em>
            </div>
            <div class="risksCard">
              <i>已整改总数</i>
              <em>{{ finishedProblem }}</em>
            </div>
            <div class="risksCard">
              <i>未整改总数</i>
              <em>{{ unfinishProblem }}</em>
            </div>
          </div>
          <div class="problemPercentage">
            <em>问题类别占比</em>
            <div
              style="width: 90%; height: 80%; flex: 1"
              ref="problemPercentageChart"
            ></div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title">安全问题</div>
        <div style="width: 100%; height: 100%" ref="problemChart"></div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, InjectReactive,Watch } from "vue-property-decorator";
import echarts, { EChartOption, ECharts } from "echarts";
import Progress from "element-ui/lib/progress";
import Card from "element-ui/lib/card";
import { getSecurityData } from "../../../../../mobile/extends/service/api";
import env from "@/config/env";
import * as Type from "../../../../extends/type";
@Component({
  name: "Schedule",
  components: {
    ElCard: Card,
  },
})
export default class Schedule extends Vue {
  @InjectReactive("projectConfig") projectConfig;
  @InjectReactive("project") projectCode;

  finishedProblem = 0;
  totalProblem = 0;
  unfinishProblem = 0;
  problemPercentageChart!: ECharts;
  problemPercentageChartData: { name: string; value: number }[] = [];
  problemChart!: ECharts;
  problemChartData: {
    legend: string[],
    xAxis:string[],
    series: {
      name: string;
      type: string;
      symbol: string;
      symbolSize: number;
      smooth: boolean;
      data: number[];
    }[];
  } = { legend: [], series: [] ,xAxis:[]};

  mounted() {
    getSecurityData({
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName,
    }).then((res) => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.finishedProblem = res.data?.safetyStatistics.finishedProblem;
      this.totalProblem = res.data?.safetyStatistics.totalProblem;
      this.unfinishProblem = res.data?.safetyStatistics.unfinishProblem;
      res.data?.problemSort.forEach((element) => {
        this.problemPercentageChartData.push({value: element.count,name: element.wtlx1,});
      });
      res.data?.problemStatistics.forEach((item) => {
        this.problemChartData.xAxis.push(item.time);
        if(this.problemChartData.series.length<=0){
            this.problemChartData.series.push({name:item.time,type: 'line',symbol: 'circle',symbolSize: 5,smooth: true,data:[item.count]})
        }
        else{
            this.problemChartData.series[0].data.push(item.count);
        }
      });
    });
    this.problemChartInit();
    this.problemPercentageChartInit();
  }
  problemChartInit(){
    const problemChart = echarts.init(this.$refs.problemChart as HTMLDivElement);
    const problemChartoption: EChartOption<EChartOption.SeriesLine> = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          label: {
            backgroundColor: "#6a7985",
          },
        },
        formatter:'{c}'
      },
      legend: {
        top: "10",
        data: this.problemChartData.legend,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: this.problemChartData.xAxis,
        },
      ],
      yAxis: [
        {
          type: "value",
          minInterval:1,
        },
      ],
      series: this.problemChartData.series,
      graphic: [
        {
          type: "text",
          z: 100,
          left: "center",
          top: "middle",
          invisible: this.problemChartData.series.length > 0,
          style: {
            fill: "#333",
            width: 220,
            overflow: "break",
            text: "无数据",
            font: "20px Microsoft YaHei",
          },
        },
      ],
    };
    problemChart.showLoading();
    problemChart.setOption(problemChartoption);
    problemChart.hideLoading();
    this.problemChart = problemChart;
    window.addEventListener("resize", () => {
      if (this.problemChart) {
        this.problemChart.resize();
      }
    });
  }
  problemPercentageChartInit(){
    const problemPercentageChart = echarts.init(this.$refs.problemPercentageChart as HTMLDivElement);
    const option: EChartOption = {
      tooltip: {
        trigger: "item",
      },
      legend: {
        bottom: "10",
      },
      series: [
        {
          type: "pie",
          radius: ["20%", "50%"],
          center: ["50%", "40%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: "{d}%",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 15,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: true,
          },
          data: this.problemPercentageChartData,
        },
      ],
      graphic: [
        {
          type: "text",
          z: 100,
          left: "center",
          top: "middle",
          invisible: this.problemPercentageChartData.length > 0,
          style: {
            fill: "#333",
            width: 220,
            overflow: "break",
            text: "无数据",
            font: "20px Microsoft YaHei",
          },
        },
      ],
    };
    problemPercentageChart.showLoading();
    problemPercentageChart.setOption(option);
    problemPercentageChart.hideLoading();
    this.problemPercentageChart = problemPercentageChart;
    window.addEventListener("resize", () => {
      if (this.problemPercentageChart) {
        this.problemPercentageChart.resize();
      }
    });
  }
  beforeDestroy() {
    if (this.problemPercentageChart) {
      this.problemPercentageChart.dispose();
    }
    if (this.problemChart) {
      this.problemChart.dispose();
    }
  }
  @Watch("problemChartData",{deep:true})
  problemChartDataChange(newVal,oldVal){
    if(this.problemChart){
        const problemChartoption: EChartOption<EChartOption.SeriesLine> = {
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "line",
                label: {
                  backgroundColor: "#6a7985",
                },
              },
              formatter:'{c}'
            },
            legend: {
                top: "10",
                data: newVal.legend,
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
            },
            xAxis: [
                {
                type: "category",
                boundaryGap: false,
                data: newVal.xAxis,
                },
            ],
            yAxis: [
                {
                    type: "value",
                    minInterval:1,
                },
            ],
            series: newVal.series,
            graphic: [
                {
                type: "text",
                z: 100,
                left: "center",
                top: "middle",
                invisible: newVal.series.length > 0,
                style: {
                    fill: "#333",
                    width: 220,
                    overflow: "break",
                    text: "无数据",
                    font: "20px Microsoft YaHei",
                },
                },
            ],
        };
        this.problemChart.setOption(problemChartoption);
    }else{
        this.problemChartInit();
    }
  }
  @Watch("problemPercentageChartData",{deep:true})
  problemPercentageChartDataChange(newVal,oldVal){
    if(this.problemPercentageChart){
        const option: EChartOption = {
        tooltip: {
            trigger: "item",
        },
        legend: {
            bottom: "10",
        },
        series: [
            {
            type: "pie",
            radius: ["20%", "50%"],
            center: ["50%", "40%"],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: "#fff",
                borderWidth: 2,
            },
            label: {
                show: true,
                formatter: "{d}%",
            },
            emphasis: {
                label: {
                show: true,
                fontSize: 15,
                fontWeight: "bold",
                },
            },
            labelLine: {
                show: true,
            },
            data: newVal,
            },
        ],
        graphic: [
            {
            type: "text",
            z: 100,
            left: "center",
            top: "middle",
            invisible: newVal.length > 0,
            style: {
                fill: "#333",
                width: 220,
                overflow: "break",
                text: "无数据",
                font: "20px Microsoft YaHei",
            },
            },
        ],
    };
    this.problemPercentageChart.setOption(option);
    }else{
        this.problemPercentageChartInit();
    }
  }
}
</script>

<style lang="less" scoped>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
.card {
  margin: 10px;
  background: #f2f2f2;
  /deep/.el-card__header {
    font-size: 17px;
    font-weight: 700;
    padding: 0;
    height: 40px;
    border-bottom: 0;
    .card_title {
      display: inline-block;
      padding-left: 20px;
      line-height: 40px;
      border-bottom: 1px solid #ebeef5;
    }
  }
}
.container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: flex-start;
  width: 100%;
  height: 362px;
  .left,
  .right {
    flex: 1;
    margin: 10px;
    height: 100%;
    border: 1px solid #fff;
    border-radius: 5px;
    background: #fff;
  }
  .right {
    flex: 2;
    display: flex;
    flex-flow: column nowrap;
  }
  .title {
    margin: 0 10px;
    height: 40px;
    font-size: 15px;
    font-weight: 700;
    line-height: 40px;
    border-bottom: 1px solid #ebeef5;
  }
  .risks {
    display: flex;
    flex-flow: row nowrap;
    height: 322px;
    .risksCardContainer {
      height: 100%;
      display: flex;
      flex-flow: column nowrap;
      justify-content: space-evenly;
      padding: 0 10px;
      .risksCard {
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-around;
        width: 160px;
        height: 60px;
        border: 1px solid #618bbd;
        border-radius: 10px;
        & > i,
        & > em {
          padding: 0 10px;
        }
        & > em {
          align-self: flex-end;
          color: #429d8a;
          font-size: 15px;
          font-weight: 700;
        }
      }
    }
    .problemPercentage {
      flex: 1;
      & > em {
        font-size: 15px;
        font-weight: 700;
        &::before {
          display: inline-block;
          content: " ";
          width: 4px;
          height: 15px;
          background: #064897;
          margin-right: 10px;
          vertical-align: middle;
        }
      }
    }
  }
}
</style>