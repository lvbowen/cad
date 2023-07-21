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
        yAxis: [],
        yName: "",
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
      var data = {
        city: this.chartData.xAxis,
        num: this.chartData.yAxis,
      };
      var Option = {
        tooltip: {
          trigger: "axis",
          transitionDuration: 0, //echart防止tooltip的抖动
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
                    color: "rgba(255,255,255,0)", // 0% 处的颜色
                  },
                  {
                    offset: 0.5,
                    color: "rgba(255,255,255,1)", // 100% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "rgba(255,255,255,0)", // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
          },
        },
        grid: {
          top: "18%",
          left: "15%",
          right: "5%",
          bottom: "25%",
          // containLabel: true
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: true,
            axisLine: {
              //坐标轴轴线相关设置。数学上的x轴
              show: true,
              lineStyle: {
                color: 'color:"#092b5d"',
              },
            },
            axisLabel: {
              //坐标轴刻度标签的相关设置
              textStyle: {
                color: "#fff",
                margin: 15,
              },
              // eslint-disable-next-line no-shadow
              formatter: function (data) {
                return data;
              },
            },
            axisTick: {
              show: false,
            },
            data: data.city,
          },
        ],
        yAxis: [
          {
            min: 0,
            splitLine: {
              show: true,
              lineStyle: {
                color: "#092b5d",
              },
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: "#092b5d",
              },
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: "#fff",
              },
              // formatter: function (value) {
              //   if (value === 0) {
              //     return value;
              //   }
              //   return value + "%";
              // },
            },
            axisTick: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: this.chartData.yName,
            type: "line",
            symbol: "circle", // 默认是空心圆（中间是白色的），改成实心圆
            showAllSymbol: true,
            symbolSize: 6,
            lineStyle: {
              normal: {
                color: "#00A0FC", // 线条颜色
              },
              borderColor: "rgba(0,0,0,.4)",
            },
            itemStyle: {
              color: "rgba(14,30,73,1)",
              borderColor: "#00A0FC",
              borderWidth: 2,
            },
            label: {
              // normal: {
              //   show: true,
              //   position: "top",
              //   formatter: [" {a|{c}%}"].join(","),
              //   rich: {
              //     a: {
              //       color: "#fff",
              //       align: "center",
              //     },
              //   },
              // },
            },
            tooltip: {
              show: true,
            },
            areaStyle: {
              //区域填充样式
              normal: {
                //线性渐变，前4个参数分别是x0,y0,x2,y2(范围0~1);相当于图形包围盒中的百分比。如果最后一个参数是‘true’，则该四个值是绝对像素位置。
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: "rgba(53,142,215, 0.5)",
                    },
                    {
                      offset: 1,
                      color: "rgba(0, 160, 252, 0.3)",
                    },
                  ],
                  false
                ),
                shadowColor: "rgba(53,142,215, 0.5)", //阴影颜色
                shadowBlur: 20, //shadowBlur设图形阴影的模糊大小。配合shadowColor,shadowOffsetX/Y, 设置图形的阴影效果。
              },
            },
            data: data.num,
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
