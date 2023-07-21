<template>
  <div style="width: 100%; height: 100%" :id="id" ref="echarts"></div>
</template>

<script>
import echarts from 'echarts/lib/echarts';
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
        yAxis4: [],
        yName: "",
        legendColor: "",
        interval: 0,
        right: "",
        top:'15%',
        legend: [],
        ySplitLineShow:true,
      }),
    },
  },
  data() {
    return {
      chart: null,
      end:this.chartData.yAxis1.length> 15 ? 35 : 100
    };
  },
  methods: {
    initChart() {
      const _this = this;
      // var echarts = require("echarts");
      var charts = echarts.init(document.getElementById(this.id));
      let dataList4 = this.chartData.yAxis4;
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
            color: this.chartData.legendColor || "#fff",
          },
        },
        grid: {
          left: "5%",
          right: this.chartData.right || "3%",
          bottom: "5%",
          top:this.chartData.top|| "15%",
          containLabel: true,
        },
        dataZoom: [
          {
            show: this.chartData.dataZoomShow || true,
            type: "inside",
            start: 0,
            // end: dataList?.length > 15 ? 35 : 100,
            end:this.end
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
                color: "#11366e",
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
                width: 0,
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
          {
            name: this.chartData.legend[3],
            type: "line",
            smooth: true, //是否平滑曲线显示
            showSymbol: false,
            itemStyle: {
              color: "#26c974",
              borderColor: "#26c974",
              borderWidth: 1,
            },
            lineStyle: {
              normal: {
                width: 0,
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
                shadowColor: "#26c974",
                shadowBlur: 12,
                shadowOffsetY: 5,
              },
            },
            data: dataList4,
          },
        ],
      };
      charts.setOption(Option);
      this.chart=charts;
    },
  },
  mounted() {
    this.initChart();
    window.addEventListener("resize",()=>{
      if(this.chart)
      this.chart.resize();
    })
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
