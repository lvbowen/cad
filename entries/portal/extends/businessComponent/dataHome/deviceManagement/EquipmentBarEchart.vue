<template>
  <div style="width: 100%; height: 90%" :id="id" ref="echarts"></div>
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
        yAxis3: [],
        yAxis4: [],
        legendData: [],
        dataZoom: false,
        unitName: "",
        minInterval: 0,
      }),
    },
    barWidth: {
      type: Number,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  methods: {
    initChart() {
      const charts = echarts.init(document.getElementById(this.id));
      const Option = {
        tooltip: {
          trigger: "axis",
          borderRadius: 11,
          transitionDuration: 0, //echart防止tooltip的抖动
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        legend: {
          orient: "horizontal",
          left: "65%",
          top: "5%",
          itemGap: 40,
          itemWidth: 15,
          selectedMode: false, //取消图例上的点击事件
          data: this.chartData.legendData,
          show: this.chartData.legendData,
          // show: false,
          itemStyle: {
            // borderColor:"#0f47bb",
            borderWidth: 1,
          },
          y: "5%",
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        grid: {
          left: "5px",
          right: "4%",
          top: "20%",
          bottom: "1%",
          containLabel: true,
          height: "80%"
        },
        xAxis: [
          {
            type: "category",
            axisLabel: {
              textStyle: {
                fontFamily: "Microsoft YaHei",
                color: "#fff", // x轴颜色
                fontWeight: "normal",
                fontSize: "14",
                lineHeight: 22,
              },
            },
            axisLine: {
              lineStyle: {
                color: "#11274c",
              },
            },
            data: this.chartData.xAxis,
          },
        ],
        yAxis: [
          {
            nameTextStyle: {
              color: "#fff",
            },
            minInterval: this.chartData.minInterval ?? 0,
            type: "value",
            name: this.chartData.unitName,
            axisLine: {
              lineStyle: {
                color: "#11274c",
              },
            },
            splitLine: {
              //网格线
              show: true,
              lineStyle: {
                // 网格线颜色
                color: "#11274c",
              },
            },
            axisLabel: {
              formatter: "{value}",
              color: "#fff",
              fontSize: 14,
            },
          },
        ],
        series: [
          {
            name: !this.chartData.legendData ? "name" : this.chartData.legendData[0],
            type: "bar",
            barWidth: this.barWidth,
            data: this.chartData.yAxis1,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#1e486a",
                  },
                  // {
                  //   offset: 1,
                  //   color: "#09bcb7",
                  // },
                ]),
                barBorderRadius: 11,
                borderColor: "#19e3ea",
              },
            },
          },
          {
            name: !this.chartData.legendData ? "name" : this.chartData.legendData[1],
            type: "bar",
            barWidth: this.barWidth,
            data: this.chartData.yAxis2,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#165a4d",
                  },
                  // {
                  //   offset: 1,
                  //   color: "#6851f1",
                  // },
                ]),
                barBorderRadius: 11,
                borderColor: "#1de880",
              },
            },
          },
          {
            name: !this.chartData.legendData ? "name" : this.chartData.legendData[2],
            type: "bar",
            barWidth: this.barWidth,
            data: this.chartData.yAxis3,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#15316b",
                  },
                  // {
                  //   offset: 1,
                  //   color: "#6851f1",
                  // },
                ]),
                barBorderRadius: 11,
                borderColor: "#0f47bb",
              },
            },
          },
          {
            name: !this.chartData.legendData ? "name" : this.chartData.legendData[3],
            type: "bar",
            barWidth: this.barWidth,
            data: this.chartData.yAxis4,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#4e4525",
                  },
                  // {
                  //   offset: 1,
                  //   color: "#6851f1",
                  // },
                ]),
                barBorderRadius: 11,
                borderColor: "#9a7414",
              },
            },
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
