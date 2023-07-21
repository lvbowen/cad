<template>
  <div style="width: 100%; height: 90%" :id="id" ref="echarts"></div>
</template>

<script>
import echarts from 'echarts';
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
        yAxis3: [],
        yName: "",
        legendColor: "",
        interval: 0,
        right: "",
        legend: [],
        ySplitLineShow:true,
        end:null
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
      let dataList3 = this.chartData.yAxis3;
      let dataList2 = this.chartData.yAxis2;
      let dataList = this.chartData.yAxis1;
      let ySplitLineShow= this.chartData.ySplitLineShow??true;
      var Option = {
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: this.chartData.legend,
          textStyle: {
            color: this.chartData.legendColor || "#d7dade",
          },
        },
        grid: {
          left: "3%",
          right: this.chartData.right || "3%",
          bottom: "5%",
          top: "18%",
          containLabel: true,
        },
        dataZoom: [
          {
            type: 'inside',
            show: false,
            xAxisIndex: [0],
            start: this.chartData.end,
            end: 100,
          },
        ],
        xAxis: {
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: "#A3ABB4",
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          //轴线上的字
          axisLabel: {
            show: true,
            interval: this.chartData.interval,
            // rotate: 30,
            textStyle: {
              color: "#A3ABB4",
              fontSize: "14",
            },
          },
          data: this.chartData.xAxis,
        },
        yAxis: [
          {
            name: this.chartData.yName,
            nameTextStyle: {
              color: "#A3ABB4",
              fontSize: 14,
            },
            type: "value",
            splitNumber: 4,
            axisTick: {
              show: false,
            },

            //轴线上的字
            axisLabel: {
              textStyle: {
                fontSize: "12",
                color: "#A3ABB4",
              },
            },
            axisLine: {
              lineStyle: {
                color: "#A3ABB4",
              },
            },
            //网格线
            splitLine: {
              lineStyle: {
                // color: "#11366e",
              },
              show:ySplitLineShow
            },
          },
        ],
        series: [
          {
            name: this.chartData.legend[0],
            type: "line",
            smooth: true, //是否平滑曲线显示
            showSymbol: false,
            itemStyle: {
              color: "#3eb5dd",
              borderColor: "#f1f1f1",
              borderWidth: 1,
            },
            lineStyle: {
              normal: {
                width: 2,
                color: {
                  type: "linear",
                  colorStops: [
                    {
                      offset: 0,
                      color: "#3790FF", // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "#3790FF", // 100% 处的颜色
                    },
                  ],
                  globalCoord: false, // 缺省为 false
                },
                shadowColor: "rgba(55, 144, 255, 0.5)",
                shadowBlur: 30,
                shadowOffsetY: 5,
              },
            },
            data: dataList,
          },
          {
            name: this.chartData.legend[1],
            type: "line",
            smooth: true, //是否平滑曲线显示
            showSymbol: false,
            itemStyle: {
              color: "#ff6b71",
              borderColor: "#f1f1f1",
              borderWidth: 1,
            },
            lineStyle: {
              normal: {
                width: 2,
                color: {
                  type: "linear",

                  colorStops: [
                    {
                      offset: 0,
                      color: "#ff6b71", // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "#ff6b71", // 100% 处的颜色
                    },
                  ],
                  globalCoord: false, // 缺省为 false
                },
                shadowColor: "rgba(84, 255, 177, 0.4)",
                shadowBlur: 12,
                shadowOffsetY: 5,
              },
            },
            data: dataList2,
          },
          {
            name: this.chartData.legend[2],
            type: "line",
            smooth: true, //是否平滑曲线显示
            showSymbol: false,
            itemStyle: {
              color: "rgba(255, 104, 0, 1)",
              borderColor: "#f1f1f1",
              borderWidth: 1,
            },
            lineStyle: {
              normal: {
                width: 2,
                color: {
                  type: "linear",

                  colorStops: [
                    {
                      offset: 0,
                      color: "rgba(255, 104, 0, 1)", // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "rgba(255, 104, 0, 1)", // 100% 处的颜色
                    },
                  ],
                  globalCoord: false, // 缺省为 false rgba(255, 104, 0, 1)
                },
                shadowColor: "rgba(255, 104, 0, 0.5)",
                shadowBlur: 12,
                shadowOffsetY: 5,
              },
            },
            data: dataList3,
          },
        ],
      };
      charts.setOption(Option);
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
