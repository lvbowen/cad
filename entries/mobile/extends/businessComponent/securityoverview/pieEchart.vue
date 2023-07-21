<template>
  <div style="width: 100%; height: 90%" :id="id"></div>
</template>

<script>
import echarts from "echarts";
export default {
  name: "PieEcharts",
  props: {
    id: {
      type: String,
      default: "chart",
    },
    chartData: {
      type: Array,
    },
    title: {
      type: String,
    },
    itemCollor: {
      type: [],
      default: () => [],
    },
  },
  computed: {
    chartsData: function () {
      return this.chartData;
    },
  },
  data() {
    return {
      charts: null,
    };
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
        title: {
          text: this.title,
          left: "center",
          top: '29%',
          textStyle: {
            fontSize: this.newSize(20),
          },
        },
        tooltip: {
          show: false,
        },
        color: this.itemCollor,
        legend: {
          show: true,
          orient: "horizontal",
          bottom: this.newSize(5).toString(),
          icon: "circle",
          itemGap: this.newSize(15),
          itemHeight: this.newSize(13),
          itemWidth: this.newSize(13),
          textStyle: {
            fontSize: this.newSize(15),
          },
        },
        series: [
          {
            name: "Access From",
            type: "pie",
            radius: ["45%", "65%"],
            center: ["50%", "40%"], // 默认全局居中
            // color: ["#feab45", "#fa6f18", "#2a7efa"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              position: "outside",
              formatter: "{c}个",
              fontSize: this.newSize(10),
              color: "#454545",
            },
            emphasis: {
              scale: false,
            },
            labelLine: {
              show: true,
              length: this.newSize(10),
              length2: this.newSize(7),
              lineStyle: {
                color: "#ceced1",
              },
            },
            data: this.chartsData,
          },
        ],
      };
      charts.setOption(option);
      this.echarts = charts;
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
