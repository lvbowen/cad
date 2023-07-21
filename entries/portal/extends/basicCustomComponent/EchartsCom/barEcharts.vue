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
        unitName:'',
        minInterval:0,
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
      const charts = echarts.init(document.getElementById(this.id));
      const Option = {
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
          show:this.chartData.legendData,
          y: "5%",
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        grid: {
          left: "5px",
          right: "4%",
          top: "18%",
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
            minInterval:this.chartData.minInterval??0,
            type: "value",
            name: this.chartData.unitName,
            splitLine: {     //网格线
              "show": false
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
            name: !this.chartData.legendData?'name':this.chartData.legendData[0],
            type: "bar",
            barWidth: 15,
            data: this.chartData.yAxis1,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: '#8bd46e'
                }, {
                  offset: 1,
                  color: '#09bcb7'
                }]),
                barBorderRadius: 11,
              },
            },
          },
          {
            name: !this.chartData.legendData?'name':this.chartData.legendData[1],
            type: "bar",
            barWidth: 15,
            data: this.chartData.yAxis2,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: '#248ff7'
                }, {
                  offset: 1,
                  color: '#6851f1'
                }]),
                barBorderRadius: 11,
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
