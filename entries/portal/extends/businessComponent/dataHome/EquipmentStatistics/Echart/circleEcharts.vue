<template>
  <div style="width: 100%; height: 100%" :id="id" ref="echarts"></div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import echarts from "echarts/lib/echarts";
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/custom';
import 'echarts/lib/component/graphic';

@Component({
  name: "pieEcharts",
  components: {}
})
export default class pieEcharts extends Vue {
  @Prop() id!: string;
  @Prop() chartData!: { data: any, isLabelLineShow: boolean, tooltipShow: boolean, midText: string, unitName: string, legend: Array<any>, center: Array<any>, radius: Array<any>, length: number, length2: number, orient: string, bottom: number, xlegend: string, fontSize: number, legendShow: boolean, noTotal: boolean, color: string[] };

  timerId: any;

  mounted() {
    const {draw} = this;
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.timerId = setInterval(function () {
      // 用setInterval做动画感觉有问题
      draw();
    }, 100);
  }

  getOption(angle, dataChart, unitName) {
    // const {getCirlPoint} = this;
    let data = [];
    let total = 0;
    const color = this.chartData.color ?? ['#00FE65', '#FF801C', '#F5FF46', '#00FEFF', '#ffa800', '#ff5b00', '#ff3000'];
    for (let i = 0; i < dataChart.length; i++) {
      total += dataChart[i].value;
      data.push({
        //@ts-ignore
        value: dataChart[i].value,
        //@ts-ignore
        name: dataChart[i].name,
        itemStyle: {
          normal: {
            //@ts-ignore
            borderWidth: 5,
            //@ts-ignore
            shadowBlur: 20,
            //@ts-ignore
            borderColor: color[i%color.length],
            //@ts-ignore
            shadowColor: color[i%color.length],
          },
        },
      });
    }
    ;
    const seriesOption = [
      {
        name: '',
        type: 'pie',
        clockWise: false,
        radius: this.chartData.radius ?? (window.outerWidth > 2500 ? [105, 98] : window.outerWidth > 1800 ? [78, 88] : [55, 65]),
        hoverAnimation: false,
        center: this.chartData.center || ['50%', '50%'],
        itemStyle: {
          normal: {
            label: {
              show: this.chartData.isLabelLineShow,
              position: 'outside',
              color: '#ddd',
              fontSize: 15,
              containLabel: true,
              formatter: function (params) {
                if (params.name !== '') {
                  return [`{a|${params.name}}` +'：'+ `{b|${(params.value/total*100).toFixed(2)}}` + `{c|%}`];
                } else {
                  return '';
                }
              },
              padding: [0, 0, 30, -30],
              rich: {
                a: {
                  color: '#fff',
                  fontSize: 16,
                },
                b: {
                  color: '#04e3dc',
                  fontSize: 16,
                },
                c: {
                  color: '#fff',
                  fontSize: 16,
                }
              },
            },
            labelLine: {
              length: this.chartData.length || 25,
              length2: this.chartData.length2 || 25,
              show: this.chartData.isLabelLineShow,
              color: '#00ffff',
            },
          },
        },
        minAngle: 10,
        data: data,
      },
    ];
    return {
      color: color,
      tooltip: {
        show: this.chartData.tooltipShow,
        transitionDuration: 0,
        formatter: function (params) {
          if (params.name !== '') {
            return '\n' + params.name + ':' + `<span style="color:#04D6E3;font-size: 14px;font-weight: bold;"};font-weight:800; ">${(params.value )}</span>` + unitName;
          } else {
            return '';
          }
        },
      },
      legend: {
        icon: "circle",
        show: this.chartData.legendShow ?? true,
        orient: this.chartData.orient || 'horizontal',
        x: this.chartData.xlegend || 'left',
        data: this.chartData.legend || [],
        // right: 340,
        bottom: this.chartData.bottom || 1,
        align: 'right',
        textStyle: {
          color: "#fff"
        },
        itemGap: 20
      },
      toolbox: {
        show: false,
      },
      series: seriesOption,
    };
  }

  draw() {
    //@ts-ignore
    const pieChart = echarts.init(document.getElementById(this.id));
    const option = this.getOption(0, this.chartData.data, this.chartData.unitName);
    //@ts-ignore
    pieChart.setOption(option, true);
    window.onresize = function () {
      pieChart.resize();
    };
  }
}
</script>
