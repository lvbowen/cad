<template>
  <div style="width: 100%; height: 100%" :id="id" ref="echarts"></div>
</template>

<script lang="ts">
/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import echarts from "echarts/lib/echarts";
import 'echarts/lib/chart/gauge';

@Component({
  name: "circleEcharts",
  components: {}
})
export default class circleEcharts extends Vue {
  @Prop() id!: string;
  @Prop() chartData!: Array<{ name: string, value: number }>;//[{name,value}]
  @Prop() elseDescribe?: any;
  @Prop() radius?: Array<string>;
  @Prop() colorList?: Array<string>;
  @Prop() isLabelShow?: boolean;

  @Watch("chartData")
  personIdListener(val: Array<{ name: string, value: number }>) {
    if (val.length !== 0) return this.draw();
  }

  mounted() {
    this.draw();
  }

  destroy() {
    //@ts-ignore
    const circleChart = echarts.init(document.getElementById(this.id));
    circleChart.clear();
  }

  getOption(value, elseDescribe?, radius?, color?) {
    let option = {
      tooltip: {
        trigger: 'item',
      },
      color: color,
      series: [
        {
          type: 'pie',
          radius: radius,
          minAngle: 10,//最小角度
          startAngle:150, //起始角度
          data: value,
          emphasis: {
            label: {
              show: true,
            },
          },
          itemStyle: {
            // borderColor: '#fff',
            borderWidth: 10,
          },
          label: {
            show: this.isLabelShow ?? true,
            formatter: '{a|{b}}\n{hr|}\n{c|{c}}{u1|个}      {per|{d}}{u2|%}',
            rich: {
              a: {
                color: '#fff',
                lineHeight: 20,
                fontSize: 15,
                align: 'center',
              },
              hr: {
                borderColor: '#245ECF',
                width: '100%',
                borderWidth: 1,
                height: 0,
                borderType: 'dashed',
              },
              c: {
                lineHeight: 20,
                fontSize: 15,
              },
              u1: {
                fontSize: 12,
                lineHeight: 18,
              },
              per: {
                fontSize: 20,
                lineHeight: 40,
              },
              u2: {
                fontSize: 12,
                lineHeight: 18,
              },
            },
          },
          labelLine: {
            show: this.isLabelShow ?? true,
            length: 0,
            length2: 0,
            lineStyle: {
              width: 2,
            },
          },
        },
      ],
    }
    if (elseDescribe) {
      option = Object.assign({}, option, elseDescribe)
    }
    return option;
  }


  draw() {
    //@ts-ignore
    const circleChart = echarts.init(document.getElementById(this.id));
    const color = ['#FF5B4C', '#F7EB00', '#3CE1F1', '#4370C5'];
    const option = this.getOption(this.chartData, this.elseDescribe ?? {}, this.radius ?? ['40%', '50%'], this.colorList ?? color);
    //@ts-ignore
    circleChart.setOption(option, true);
    window.onresize = function () {
      circleChart.resize();
    };
  }

}
</script>
