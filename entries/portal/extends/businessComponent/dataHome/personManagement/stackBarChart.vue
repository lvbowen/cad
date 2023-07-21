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
      type: Array,
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
      let series = [];
      const color = ['#F5FF46', '#00FE65', '#00FEFF', '#ffa800', '#ff5b00', '#ff3000', '#FF801C',];
      console.log('dddd', this.chartData)
      this.chartData.forEach((item, index) => {
        series.push({
          name: item.name,
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              formatter: item.name,
              show: true,
              position: 'insideRight',
              color: "#343232",
            }
          },
          color:color[index],
          data: item.value
        });
      });
      const Option = {
        tooltip: {
          position: ['50%'],
          trigger: 'axis',
          axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '80%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          show: false,
          type: 'category',
          data: ['年龄分布']
        },
        series: series
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
