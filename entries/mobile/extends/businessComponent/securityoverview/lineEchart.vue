<template>
  <div style="width: 100%; height: 99%" :id="id"></div>
</template>

<script>
import echarts from "echarts";
import object from '@h3/report/basics/utils/object';
export default {
  name: "LineEcharts",
  props: {
    id: {
      type: String,
      default: "chart",
    },
    chartData: {
    //   type: object,
    },
  },
  data() {
    return {
      charts: null,
    };
  },
  computed: {
    chartsData: function () {
      return this.chartData;
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
  methods: {
    initChart() {
      const charts = echarts.init(document.getElementById(this.id));
      const option = {
        legend: {
          right: 15,
          data: ["Email", "Union Ads"], //title
          textStyle: {
            color: "#b5b7b8",
          },
        },
        tooltip: {
          trigger: "item",
          padding: 0,
          borderWidth: 0,
          position: function (pos, params, dom, rect, size) {
            var obj = { left: rect.x + 20, top: rect.y - 5 };
            return obj;
          },
          formatter: function (params) {
            return `<span class="spc">${params.data}</span>
                    <style>
                        .spc{
                            display: inline-block;
                            height: 20px;
                            line-height: 20px;
                            border-radius: 10px;
                            background-color: ${params.color};
                            font-size: 12px;
                            padding-right: 8px;
                            color:#fff;
                        }
                        .spc::before{
                            content: '';
                            display: inline-block;
                            height: 6px;
                            width:6px;
                            border-radius: 3px;
                            background-color: #fff;
                            margin: 0 5px;
                            margin-bottom: 2px;
                        }
                    </style>`;
          },
          extraCssText: "width:0;",
        },
        grid: {
          top: "20%",
          left: "8%",
          right: "5%",
          bottom: "12%",
          // containLabel: true
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          axisTick: {
            show: false,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "#b6b7bc",
            },
          },
          axisLabel: {
            show: true,
            fontSize: this.newSize(12),
          },
          data: this.chartsData.Xtitle, //X轴
        },
        yAxis: {
          type: "value",
          minInterval:1,
          show: true,
          boundaryGap: false,
          axisTick: {
            show: false,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "#b6b7bc",
            },
          },
          axisLabel: {
            show: true,
            fontSize: this.newSize(12),
          },
        },
        series: this.chartsData.data,
      };
      charts.setOption(option);
      this.charts = charts;
    },
    newSize(val) {
      let width = document.documentElement.clientWidth;
      return val * (width / 484);
    },
  },
  watch: {
    chartsData: {
      handler(newOption) {
        if (newOption) {
          this.initChart();
        }
      },
      deep: true,
    },
  },
};
</script>
