<template>
  <div style="width: 100%; height: 90%" :id="id" ref="echarts"></div>
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
        legendData: [],
        dataZoom: false,
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
        tooltip: {
          trigger: "axis",
          transitionDuration: 0, //echart防止tooltip的抖动
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        legend: {
          selectedMode: false, //取消图例上的点击事件
          data: this.chartData.legendData,
          y: "5%",
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        grid: {
          left: "5px",
          right: "4%",
          top: "30%",
          bottom: "1%",
          containLabel: true,
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
            data: this.chartData.xAxis,
          },
        ],
        yAxis: [
          {
            nameTextStyle: {
              color: "#fff",
            },
            type: "value",
            name: "万元",
            // interval: 20,
            axisLabel: {
              formatter: "{value}",
              color: "#fff",
              fontSize: 14,
            },
          },
        ],
        // dataZoom: [
        //   {
        //     xAxisIndex: [0],
        //     handleIcon:
        //       "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        //   },
        // ],
        series: [
          {
            name: this.chartData.legendData[0],
            type: "bar",
            barWidth: 15,
            data: this.chartData.yAxis1,
            itemStyle: {
              normal: {
                color: "#3FCF2C",
              },
            },
          },
          {
            name: this.chartData.legendData[1],
            type: "bar",
            barWidth: 15,
            data: this.chartData.yAxis2,
            itemStyle: {
              normal: {
                color: "#ff0000",
              },
            },
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
