<template>
  <div style="width: 100%; height: 100%" :id="id" ref="echarts"></div>
</template>

<script>
import echarts from "echarts/lib/echarts";
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
        xAxis: [],
        yAxis1: [],
        yAxis2: [],
        lengend: [],
        interval: [],
        yName1: "",
        yname: "",
        yName2: "",
        left: "",
        lineColor: "",
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
      var charts = echarts.init(document.getElementById(this.id));
      var Option = {
        tooltip: {
          trigger: "axis",
          transitionDuration: 0,
          axisPointer: {
            lineStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(0, 255, 233,0)",
                  },
                  {
                    offset: 0.5,
                    color: "rgba(255, 255, 255,1)",
                  },
                  {
                    offset: 1,
                    color: "rgba(0, 255, 233,0)",
                  },
                ],
                global: false,
              },
            },
          },
        },
        legend: {
          data: this.chartData.lengend || [],
          color: ["#4AACFF", "#A582EA"],
          left: "left",
          show: true,
          textStyle: {
            color: "#fff",
          },
        },
        color: ["#4AACFF", "#A582EA"],
        grid: {
          top: "15%",
          left: this.chartData.left || "10%",
          right: "5%",
          bottom: "15%",
          // containLabel: true
        },
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: this.chartData.yAxis1.length > 10 ? 100 : 100,
          },
        ],
        xAxis: [
          {
            type: "category",
            axisLine: {
              show: false,
              color: "#fff",
              lineStyle: {
                color: "#FFFFFF",
              },
            },

            axisLabel: {
              color: "#fff",
              show: true,
              width: 100,
              interval: this.chartData.interval,
            },
            splitLine: {
              show: false,
            },
            boundaryGap: false,
            data: this.chartData.xAxis, //this.$moment(data.times).format("HH-mm") ,
          },
        ],
        yAxis: [
          {
            type: "value",
            min: 0,
            name: this.chartData.yname || "",
            nameTextStyle: {
              color: "#fff",
              fontSize: 14,
            },
            // max: 140,
            splitNumber: 4,
            splitLine: {
              show: true,
              lineStyle: {
                color: "#00BFF3",
                opacity: 0.23,
              },
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: "#00BFF3",
              },
            },
            axisLabel: {
              show: true,
              margin: 20,
              textStyle: {
                color: "#fff",
              },
            },
            axisTick: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: this.chartData.yName1,
            type: "line",
            // showAllSymbol: true,
            // symbol: "circle",
            symbolSize: 10,
            lineStyle: {
              normal: {
                color: this.chartData.lineColor || "#4AACFF",
              },
            },
            label: {
              show: true,
              position: "top",
              textStyle: {
                color: this.chartData.lineColor || "#4AACFF",
              },
            },
            itemStyle: {
              color: "#fff",
              // borderColor: "#4AACFF",
              // borderWidth: 2,
              normal: {
                color: "#4AACFF",
              },
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: "rgba(43,193,145,0.3)",
                    },
                    {
                      offset: 1,
                      color: "rgba(43,193,145,0)",
                    },
                  ],
                  false
                ),
              },
            },
            data: this.chartData.yAxis1, //data.values
          },
          {
            name: this.chartData.yName2,
            type: "line",
            // showAllSymbol: true,
            // symbol: "circle",
            symbolSize: 10,
            lineStyle: {
              normal: {
                color: "#A582EA",
              },
            },
            label: {
              show: true,
              position: "top",
              textStyle: {
                color: "#A582EA",
              },
            },
            itemStyle: {
              color: "#fff",
              // borderColor: "#A582EA",
              // borderWidth: 2,
              normal: {
                color: "#A582EA",
              },
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: "rgba(81,150,164,0.3)",
                    },
                    {
                      offset: 1,
                      color: "rgba(81,150,164,0)",
                    },
                  ],
                  true
                ),
              },
            },
            data: this.chartData.yAxis2, //data.values
          },
        ],
      };
      charts.setOption(Option);
      charts.on("click", function (params) {
        _this.$emit("contractName", params);
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
