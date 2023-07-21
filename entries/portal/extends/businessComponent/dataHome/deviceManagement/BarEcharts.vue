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
        xAxis: [],
        yAxis: [],
        height: "",
        Xtype: "",
        dataZoom: false,
        Ytype: "",
        series: [],
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
      var charts = echarts.init(document.getElementById(this.id));
      let categoryData = this.chartData.xAxis;
      let chartdata = this.chartData.yAxis;
      var Option = {
        textStyle: {
          color: "#c0c3cd",
          fontSize: 14,
        },
        toolbox: {
          show: false,
          feature: {
            saveAsImage: {
              backgroundColor: "#031245",
            },
            restore: {},
          },
          iconStyle: {
            borderColor: "#c0c3cd",
          },
        },
        legend: {
          top: 10,
          itemWidth: 8,
          itemHeight: 8,
          icon: "circle",
          left: "center",
          padding: 0,
          textStyle: {
            color: "#c0c3cd",
            fontSize: 14,
            padding: [2, 0, 0, 0],
          },
        },
        color: ["#00D7E9", "rgba(0, 215, 233, 0.9)"],
        grid: {
          containLabel: true,
          left: 40,
          right: 20,
          bottom: 40,
          top: 40,
          height: this.chartData.height
        },
        dataZoom: [
          {
            type: "inside", //slider表示有滑动块的，inside表示内置的
            show: false,
            start: 60,
            end: 100,
          },
        ],
        xAxis: {
          nameTextStyle: {
            color: "#c0c3cd",
            padding: [0, 0, -10, 0],
            fontSize: 14,
          },
          axisLabel: {
            color: "#c0c3cd",
            fontSize: 14,
            interval: 0,
          },
          axisTick: {
            show: false,
            lineStyle: {
              color: "#384267",
              width: 1,
            },
          },
          splitLine: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: "#335971",
            },
            show: true,
          },
          data: categoryData,
          type: "category",
        },
        yAxis: {
          nameTextStyle: {
            color: "#c0c3cd",
            padding: [0, 0, 5, 0],
            fontSize: 14,
          },
          axisLabel: {
            color: "#c0c3cd",
            fontSize: 14,
          },
          axisTick: {
            lineStyle: {
              color: "#668092",
              width: 1,
            },
            show: true,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "#335971",
              // "type": "dashed"
            },
          },
          axisLine: {
            lineStyle: {
              color: "#668092",
              width: 1,
              // "type": "dashed"
            },
            show: true,
          },
          name: "台",
        },
        series: [
          {
            data: chartdata,
            type: "bar",
            barMaxWidth: "auto",
            barWidth: 20,
            itemStyle: {
              color: {
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                type: "linear",
                colorStops: [
                  {
                    offset: 0,
                    color: "#00D7E9",
                  },
                  {
                    offset: 1,
                    color: "rgba(0, 167, 233,0.3)",
                  },
                ],
              },
            },
            label: {
              show: true,
              position: "top",
              distance: 10,
              color: "#fff",
            },
          },
          {
            data: [1, 1, 1, 1, 1, 1],
            type: "pictorialBar",
            barMaxWidth: "20",
            symbol: "diamond",
            symbolOffset: [0, "50%"],
            symbolSize: [20, 10],
          },
          {
            data: chartdata,
            type: "pictorialBar",
            barMaxWidth: "20",

            symbolPosition: "end",
            symbol: "diamond",
            symbolOffset: [0, "-50%"],
            symbolSize: [20, 12],
            zlevel: 2,
          },
        ],
        tooltip: {
          show: true,
          formatter: "{b}:{c0}",
        },
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
