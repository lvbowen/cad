<template>
  <div style="width: 100%; height: 100%" :id="id" ref="echarts"></div>
</template>

<script lang="ts">
/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import echarts from "echarts/lib/echarts";
import 'echarts/lib/chart/gauge';

@Component({
  name: "gaugeEcharts",
  components: {}
})
export default class gaugeEcharts extends Vue {
  @Prop() id!: string;
  @Prop() chartData!: number;//[{name,value,color,maxData,colorStart,colorEnd}

  @Watch("chartData")
  personIdListener(val: Array<{ name: string, value: number }>) {
    if (val.length !== 0) return this.draw();
  }

  mounted() {
    this.draw();
  }

  destroy() {
    //@ts-ignore
    const gaugeChart = echarts.init(document.getElementById(this.id));
    gaugeChart.clear();
  }

  getOption(value) {
    const splitNumber = 40;
    const axisWidth = 15;
    const max = value.maxData??100;
    const min = 0;

    const common = {
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      splitLine: {
        show: true,
        length: axisWidth,
        lineStyle: {
          width: 3,
          color: 'rgba(0, 0, 0, 0.16)'
        },
      },
    };
    return {
      tooltip: {
        formatter: '{a} <br/>{b} : {c}%'
      },
      series: [{
        name: '指标',
        type: 'gauge',
        radius: '100%',
        min,
        max,
        detail:{
          color:'#fff'
        },
        data: [{
          value: value.value,
          name: value.name,
        }],
        title: {
          offsetCenter: [0, '-30%'],
          color: value.color,
          fontSize: '20',
          fontWeight:'bold'
        },
        pointer: {
          length: '100%',
          width: 3
        },
        splitNumber,
        axisLine: { // 坐标轴线
          show: true,
          lineStyle: { // 属性lineStyle控制线条样式
            width: axisWidth - 1,
            color: [
              [1, new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {offset: 1, color:value.colorEnd?? '#2bf308'},
                {offset: 0.5, color: '#f6e650'},
                {offset:0, color:value.colorStart?? '#fa0303'}])]
            ]
          }
        },
        ...common,
        // axisLabel: {
        //   show: true
        // },
      },
        // 阴影层
        {
          type: 'gauge',
          axisLine: {
            show: true,
            lineStyle: {
              width: axisWidth,
              color: [
                [0, 'rgba(0, 0, 0, .1)'],
                [1, 'rgba(0, 0, 0, .2)']
              ]
            }
          },
          detail: {
            show: false,
          },
          pointer: {
            show: false
          },
          ...common,
        },
        // 外围灰色条纹
        {
          type: 'gauge',
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          pointer: {
            show: false
          },
          radius: '100%',
          detail: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [0, 'rgba(0, 0, 0, 0.08)'],
                [1, 'rgba(0, 0, 0, 0.08)']
              ]
            }
          }
        },
        // 外围刻度
        {
          type: 'gauge',
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          pointer: {
            show: false
          },
          radius: '100%',
          detail: {
            show: false
          },
          axisLine: {
            lineStyle: {
              width: 2,
              color: [
                [0, 'rgba(0, 0, 0, 0.08)'],
                [1, 'rgba(0, 0, 0, 0.08)']
              ]
            }
          },
          splitLine: {
            length: -16,
            lineStyle: {
              width: 2,
              color: 'rgba(0, 0, 0, 0.08)'
            }
          }
        }
      ]
    };
  }


  draw() {
    //@ts-ignore
    const gaugeChart = echarts.init(document.getElementById(this.id));
    const option = this.getOption(this.chartData);
    //@ts-ignore
    gaugeChart.setOption(option, true);
    window.onresize = function () {
      gaugeChart.resize();
    };
  }

}
</script>
