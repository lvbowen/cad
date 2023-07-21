<template>
  <div :id="id" ref="echarts" style="width:100%;height:90%;"></div>
</template>

<script>
import echarts from 'echarts/lib/echarts';
export default {
  name: "BarEcharts",
  props: {
    id: {
      type: String,
      default: "chart"
    },
    chartData: {
      type: Object,
      default: () => ({
        xAxis: [],
        yAxis: [],
        Xtype: "",
        dataZoom: false,
        Ytype: "",
        series: [],
        yName:null,
        yColor:null,
        seriesColor0:null,
        seriesColor1:null,
        grid: {
          top: "20%",
          left: "12%",
          right: "5%",
          bottom: "25%"
        },
        dataAll:[]
      })
    }
  },
  data() {
    return {
      chart: null
    };
  },
  methods: {
    initChart() {
      const _this = this;
      const charts = echarts.init(document.getElementById(this.id));
      const Option = {
        tooltip: {
          transitionDuration: 0,
          formatter: function (params) {
            if(_this.chartData.dataAll.length===0) return "{b}<br/>{a}: {c}"
            for(let i=0;i<_this.chartData.dataAll.length;i++){
              const tempt=_this.chartData.dataAll[i]
              if(tempt.planDetailName===params[0].axisValue){
                return `${tempt.planDetailName}<br/>计划产值: ${tempt.planDetailMoney}元<br/>实际产值: ${tempt.reportDetailMoney}元`
              }}
          },
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          }
        },
        grid: this.chartData.grid,
        xAxis: [
          {
            type: this.chartData.Xtype || "category",
            data: this.chartData.xAxis || [],
            axisLine: {
              show: true,
              lineStyle: {
                color: "#092b5d"
              }
            },
            axisLabel: {
              color: "#000307",
              interval:0,
              margin:25,
              rotate:this.chartData.xAxis.length>20?'5':'0',
              // rotate: "40",
              formatter: function(value) {
                let ret = ""; //拼接加\n返回的类目项
                const maxLength = 8; //每项显示文字个数
                const valLength = value.length; //X轴类目项的文字个数
                const rowN = Math.ceil(valLength / maxLength); //类目项需要换行的行数
                if (rowN > 1) {
                  //如果类目项的文字大于5,
                  for (let i = 0; i < rowN; i++) {
                    let temp = ""; //每次截取的字符串
                    const start = i * maxLength; //开始截取的位置
                    const end = start + maxLength; //结束截取的位置
                    //这里也可以加一个是否是最后一行的判断，但是不加也没有影响，那就不加吧
                    temp = value.substring(start, end) + "\n";
                    ret += temp; //凭借最终的字符串
                  }
                  return ret;
                } else {
                  return value;
                }
              },
              textStyle: {
                fontSize: 12
              }
            }
          }
        ],
        yAxis: [
          {
            name: this.chartData.yName??'金额',
            type: this.chartData.Ytype || "value",
            data: this.chartData.yAxis || [],
            nameTextStyle: {
              color: this.chartData.yColor??"#fff"
            },
            axisLabel: {
              formatter: "{value}",
              color: "#00050c"
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: "#092b5d"
              }
            },
            splitLine: {
              lineStyle: {
                color: "rgba(0,0,0,0.2)"
              }
            }
          }
        ],
        dataZoom: this.chartData.dataZoom,
        series: [
          {
            type: "bar",
            data: this.chartData.series,
            barWidth: this.chartData.series.length>20?"12px":this.chartData.series.length>10?'25px':'35px',
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: this.chartData.seriesColor0??"rgba(240, 226, 3, 1)" // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: this.chartData.seriesColor1??"rgba(255, 150, 0, 0.8)" // 100% 处的颜色
                    }
                  ],
                  false
                ),
                shadowColor:this.chartData.seriesColor0?? "#FF9600",
                shadowBlur: 4,
                label: {
                  // 柱图头部显示值
                  show: true,
                  position: "top",
                  color: "#333",
                  fontSize: "12px",
                  formatter: (params) => {
                    return (params.value).toFixed(2) + '%';
                  },
                },    
              }
            }
          }
        ]
      };
      charts.setOption(Option);
      charts.on("click", function(params) {
        _this.$emit("contractName", params.name);
      });
    }
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
      deep: true
    }
  }
};
</script>

<style></style>
