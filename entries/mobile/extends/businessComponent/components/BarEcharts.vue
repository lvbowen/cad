<template>
  <div style="width: 100%; height: 90%" :id="id" ref="echarts"></div>
</template>

<script>
import echarts from "echarts";
export default {
  name: "BarEcharts",
  props: {
    id: {
      type: String,
      default: "chart",
    },
    chartData: {
      type: Object,
      default: () => ({
        payMoneyList: [],
        unpayMoneyList: [],
        contractNameList: [],
        legendArr: [],
        proportionList: [],
        yName: "",
        legendName1: "",
        legendName2: "",
        showDataZoom: false,
        girdBottom: ''
      }),
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  methods: {
    initChart() {
      const _this = this;
      // var echarts = require("echarts");
      //@ts-ignore
      var charts = echarts.init(document.getElementById(this.id));
      var Option = {
        grid: {
          top: "15%",
          bottom: this.chartData.girdBottom || "12%",
          left:"15%"
        },
        tooltip: {
          trigger: "axis",
          transitionDuration: 0,
          axisPointer: {
            type: "shadow",
            label: {
              show: false,
            },
          },
        },
        legend: {
          data: this.chartData.legendArr || [
            "已支付占比",
            "已支付工程款",
            "未支付工程款",
          ],
          top: "2%",
          right: "10",
          textStyle: {
            color: "#A3ABB4",
            fontSize: 14,
          },
        },
        xAxis: {
          data: this.chartData.contractNameList,
          axisLine: {
            show: true, //隐藏X轴轴线
            lineStyle: {
              color: "#F3F6FA",
              width: 2,
            },
          },
          position: '30px',
          axisTick: {
            show: true, //隐藏X轴刻度
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: "#A3ABB4", //X轴文字颜色
              fontSize: 14,
            },
          },
        },
        yAxis: [
          {
            type: "value",
            name: this.chartData.yName || "",
            nameTextStyle: {
              color: "#A3ABB4",
              fontSize: 14,
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: true,
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: "#F3F6FA",
                width: 2,
              },
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: "#A3ABB4",
                fontSize: 14,
              },
            },
          },
          {
            type: "value",
            /*name: "同比",*/
            nameTextStyle: {
              color: "#A3ABB4",
              fontSize: 14,
            },
            position: "right",
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            axisLabel: {
              show: true,
              formatter: "{value} %", //右侧Y轴文字显示
              textStyle: {
                color: "rgba(250,250,250,1)",
                fontSize: 14,
              },
            },
          },
        ],
        dataZoom: [
          {
            show: this.chartData.showDataZoom || false,
            height: 12,
            xAxisIndex: [0],
            bottom: 10,
            start: 0,
            end: 20,
            handleIcon:
              "path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z",
            handleSize: "110%",
            handleStyle: {
              color: "#d3dee5",
            },
            textStyle: {
              color: "#fff",
            },
            borderColor: "##0067ff",
          },
          // {
          //   type: "inside",
          //   show: true,
          //   height: 15,
          //   start: 0,
          //   end: 15,
          // },
        ],
        series: [
          {
            name: "已支付占比",
            type: "line",
            yAxisIndex: 1, //使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用
            smooth: true, //平滑曲线显示
            showAllSymbol: true, //显示所有图形。
            symbol: "circle", //标记的图形为实心圆
            symbolSize: 8, //标记的大小
            itemStyle: {
              //折线拐点标志的样式
              color: "#1045A0",
              borderColor: "#3D7EEB",
              width: 2,
              shadowColor: "#3D7EEB",
              shadowBlur: 4,
            },
            lineStyle: {
              color: "#3D7EEB",
              width: 2,
              shadowColor: "#3D7EEB",
              shadowBlur: 4,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "rgba(61,126,235, 0.5)",
                },
                {
                  offset: 1,
                  color: "rgba(61,126,235, 0)",
                },
              ]),
            },
            data: this.chartData.proportionList,
          },
          {
            name: this.chartData.legendName1 || "已支付工程款",
            type: "bar",
            barWidth: 15,
            itemStyle: {
              normal: {
                color: "#377EFF",
              },
            },
            data: this.chartData.payMoneyList,
          },
          {
            name: this.chartData.legendName2 || "未支付工程款",
            type: "bar",
            barWidth: 15,
            itemStyle: {
              normal: {
                color: "#F8CA3C",
              },
            },
            data: this.chartData.unpayMoneyList,
          },
        ],
      };
      charts.setOption(Option);
      charts.on("click", function (params) {
        _this.$emit("contractName", params.name);
      });
    },
  },
  mounted() {
    this.initChart();
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  watch: {
    // 监听chartData数据变化
    chartData: {
      handler(newVal, oldVal) {
        if (this.charts) {
          if (newVal) {
            this.charts.setOption(newVal);
          } else {
            this.charts.setOption(oldVal);
          }
        } else {
          this.initChart();
        }
      },
      deep: true,
    },
  },
};
</script>

<style></style>
