<template>
  <div style="width: 100%; height: 100%" :id="id" ref="echarts"></div>
</template>

<script>
import echarts from 'echarts'

export default {
  name: "PieCharts",
  props: {
    id: {
      type: String,
      default: "chart",
    },
    chartData: {
      type: Object,
      default: () => ({
        series: [],
        legend: [],
        color: [],
        tileText: "",
        tileTexts: "",
        right: 0,
        radius: [],
        center: [],
        id: "",
        textX: "",
        formatter: "",
        textY: "",
        orient: "",
        textStyle: "",
        fontWeight: "",
        legendScroll: '',
        legendItemGap: 0
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
      var Option = {
        tooltip: {
          show: true,
          transitionDuration: 0,
          trigger: "item",
          formatter: "{b} :  {c}" + (this.chartData.formatter || ""),
        },
        title: [
          {
            text: this.chartData.tileText,
            x: this.chartData.textX || "center",
            y: this.chartData.textY || "center",
            textStyle: {
              color: this.chartData.textStyle || "#fff",
              fontSize: 15,
              fontWeight: this.chartData.fontWeight || "normal",
              align: "center",
            },
          },
          {
            text: this.chartData.tileTexts,
            x: this.chartData.textX || "center",
            y: this.chartData.textsY || 100,
            textStyle: {
              color: this.chartData.textStyle || "#fff",
              fontSize: 20,
              fontWeight: this.chartData.fontWeight || "normal",
              align: "center",
            },
          },
        ],
        legend: {
          type: this.chartData.legendScroll || '',
          // icon: "circle",
          orient: this.chartData.orient || "",
          // x: 'left',
          data: this.chartData.legend,
          right: this.chartData.right || 360,
          bottom: 10,
          // left: 'left',
          // align: "right",
          textStyle: {
            color: this.chartData.textStyle || "#fff",
          },
          itemGap: this.chartData.legendItemGap || 20,
        },
        series: [
          //未找到方法同时展示外部指示线和中间大字
          //采用两个series重叠的方法实现
          {
            type: "pie",
            radius: this.chartData.radius || "65%",
            center: this.chartData.center || ["50%", "49%"],
            color: this.chartData.color,
            itemStyle: {
              normal: {
                label: {
                  normal: {
                    formatter: "{c}",
                  },
                  show: true,
                  position: "outside",
                  color: "#ddd",
                },
                labelLine: {
                  length: 10,
                  length2: 30,
                  show: true,
                  color: "#00ffff",
                },
              }
            },
            label: {//饼图中间文字设置
              normal: {
                show: !!this.chartData.midText,
                position: 'center',
                color: '#9A9EBA',
                formatter: this.chartData.midText,
                textStyle: {
                  fontWeight: 300,
                  fontSize: 20,    //文字的字体大小
                  color: '#333333'
                }
              },
              emphasis: {//中间文字显示
                show: true,
              }
            },
            data: this.chartData.series,
          },
          {
            type: "pie",
            radius: this.chartData.radius || "65%",
            center: this.chartData.center || ["50%", "49%"],
            color: this.chartData.color,
            label: {
              normal: {
                formatter: "{c}",
              },
              show: true,
              position: "outside",
              color: "#ddd",
            },
            labelLine: {
              length: 10,
              length2: 30,
              show: true,
              color: "#00ffff",
            },
            data: this.chartData.series,
          },
        ],
      };
      charts.setOption(Option);
      var timer = null
      charts.on("click", function (params) {
        clearTimeout(timer)
        timer = setTimeout(() => {
          _this.$emit("contractName", params);
        }, 500);
        // charts.off('dblclick')
      });
      charts.on("dblclick", function (params) {
        clearTimeout(timer)
        console.log("双击事件！！！", params);
        _this.$emit("dblclick", params);
        //  charts.off('click')
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
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
