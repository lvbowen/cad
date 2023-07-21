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
  @Prop() chartData!: { data: any, isLabelLineShow: boolean, midText: string, unitName: string, legend: Array<any>,center: Array<any>, radius: Array<any>,length: number,length2:number,orient: string, bottom: number,xlegend:string,fontSize: number};

  // @Prop() Config?: EChartOption;
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

  beforeDestroy() {
    const {timerId} = this;
    if (timerId) {
      clearInterval(timerId);
    }
    //@ts-ignore
    const pieChart = echarts.init(document.getElementById(this.id));
    pieChart.clear();
  }

  getOption(angle, dataChart, unitName) {
    const {getCirlPoint} = this;
    let data = [];
    let total = 0;
    const color = ['#00FE65','#FF801C', '#F5FF46',  '#00FEFF', '#ffa800', '#ff5b00', '#ff3000'];
    for (let i = 0; i < dataChart.length; i++) {
      total += dataChart[i].value;
    }
    for (let i = 0; i < dataChart.length; i++) {
      data.push(
        {
          //@ts-ignore
          value: (dataChart[i].value / total * 100),
          //@ts-ignore
          name: dataChart[i].name,
          itemStyle: {
            normal: {
              //@ts-ignore
              borderWidth: 5,
              //@ts-ignore
              shadowBlur: 20,
              //@ts-ignore
              borderColor: color[i],
              //@ts-ignore
              shadowColor: color[i],
            },
          },
        },
        {
          value: 2,
          name: '',
          itemStyle: {
            normal: {
              label: {
                show: false,
              },
              labelLine: {
                show: false,
              },
              color: 'rgba(0, 0, 0, 0)',
              borderColor: 'rgba(0, 0, 0, 0)',
              borderWidth: 0,
            },
          },
        }
      );
    }

    const seriesOption = [
      {
        name: '',
        type: 'pie',
        clockWise: false,
        radius: this.chartData.radius,
        hoverAnimation: false,
        center: this.chartData.center ||  ['50%', '50%'],
        itemStyle: {
          normal: {
            label: {
              show: this.chartData.isLabelLineShow,
              position: 'outside',
              color: '#fff',
              fontSize: 15,
              formatter: function (params) {
                if (params.name !== '') {
                  if(unitName == "万元") {
                    return ((params.value / 100 * total) / 10000).toFixed(2) + unitName;
                  }else {
                    return (params.value / 100 * total).toFixed(0) + unitName;
                  }
                } else {
                  return '';
                }
              },
            },
            labelLine: {
              length: 35,
              // length2: this.chartData.length2 || 35,
              show: this.chartData.isLabelLineShow,
              color: '#00ffff',
            },
          },
        },
        data: data,
      },
      // 紫色
      {
        name: 'ring5',
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: function (params, api) {
          return {
            type: 'arc',
            shape: {
              cx: api.getWidth() / 2,
              cy: api.getHeight() / 2,
              r: Math.min(api.getWidth(), api.getHeight()) / 2.3,
              startAngle: ((0 + angle) * Math.PI) / 180,
              endAngle: ((90 + angle) * Math.PI) / 180,
            },
            style: {
              stroke: '#00FEFF',
              fill: 'transparent',
              lineWidth: 1.5,
            },
            silent: true,
          };
        },
        data: [0],
      },
      {
        name: 'ring5', //紫点
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: function (params, api) {
          let x0 = api.getWidth() / 2;
          let y0 = api.getHeight() / 2;
          let r = Math.min(api.getWidth(), api.getHeight()) / 2.3;
          const point = getCirlPoint(x0, y0, r, 90 + angle);
          return {
            type: 'circle',
            shape: {
              cx: point.x,
              cy: point.y,
              r: 4,
            },
            style: {
              stroke: '#00FEFF', //绿
              fill: '#00FEFF',
            },
            silent: true,
          };
        },
        data: [0],
      },
      // 蓝色
      {
        name: 'ring5',
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: function (params, api) {
          return {
            type: 'arc',
            shape: {
              cx: api.getWidth() / 2,
              cy: api.getHeight() / 2,
              r: Math.min(api.getWidth(), api.getHeight()) / 2.3,
              startAngle: ((180 + angle) * Math.PI) / 180,
              endAngle: ((270 + angle) * Math.PI) / 180,
            },
            style: {
              stroke: '#00FEFF',
              fill: 'transparent',
              lineWidth: 1.5,
            },
            silent: true,
          };
        },
        data: [0],
      },
      {
        name: 'ring5', // 蓝色
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: function (params, api) {
          let x0 = api.getWidth() / 2;
          let y0 = api.getHeight() / 2;
          let r = Math.min(api.getWidth(), api.getHeight()) / 2.3;
          let point = getCirlPoint(x0, y0, r, 180 + angle);
          return {
            type: 'circle',
            shape: {
              cx: point.x,
              cy: point.y,
              r: 4,
            },
            style: {
              stroke: '#00FEFF', //绿
              fill: '#00FEFF',
            },
            silent: true,
          };
        },
        data: [0],
      },
      {
        name: 'ring5',
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: function (params, api) {
          return {
            type: 'arc',
            shape: {
              cx: api.getWidth() / 2,
              cy: api.getHeight() / 2,
              r: Math.min(api.getWidth(), api.getHeight()) / 4,
              startAngle: ((270 + -angle) * Math.PI) / 180,
              endAngle: ((40 + -angle) * Math.PI) / 180,
            },
            style: {
              stroke: '#00FEFF',
              fill: 'transparent',
              lineWidth: 1.5,
            },
            silent: true,
          };
        },
        data: [0],
      },
      // 橘色
      {
        name: 'ring5',
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: function (params, api) {
          return {
            type: 'arc',
            shape: {
              cx: api.getWidth() / 2,
              cy: api.getHeight() / 2,
              r: Math.min(api.getWidth(), api.getHeight()) / 4,
              startAngle: ((90 + -angle) * Math.PI) / 180,
              endAngle: ((220 + -angle) * Math.PI) / 180,
            },
            style: {
              stroke: '#00FEFF',
              fill: 'transparent',
              lineWidth: 1.5,
            },
            silent: true,
          };
        },
        data: [0],
      },
      {
        name: 'ring5',
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: function (params, api) {
          let x0 = api.getWidth() / 2;
          let y0 = api.getHeight() / 2;
          let r = Math.min(api.getWidth(), api.getHeight()) / 4;
          let point = getCirlPoint(x0, y0, r, 90 + -angle);
          return {
            type: 'circle',
            shape: {
              cx: point.x,
              cy: point.y,
              r: 4,
            },
            style: {
              stroke: '#00FEFF', //粉
              fill: '#00FEFF',
            },
            silent: true,
          };
        },
        data: [0],
      },
      {
        name: 'ring5', //绿点
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: function (params, api) {
          let x0 = api.getWidth() / 2;
          let y0 = api.getHeight() / 2;
          let r = Math.min(api.getWidth(), api.getHeight()) / 4;
          let point = getCirlPoint(x0, y0, r, 270 + -angle);
          return {
            type: 'circle',
            shape: {
              cx: point.x,
              cy: point.y,
              r: 4,
            },
            style: {
              stroke: '#00FEFF', //绿
              fill: '#00FEFF',
            },
            silent: true,
          };
        },
        data: [0],
      },
    ];
    return {
      color: color,
      tooltip: {
        show: false,
        transitionDuration: 0,
      },
      legend: {
        icon: "circle",
        show:false,
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
      graphic: {
        //图形中间文字
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: this.chartData.unitName == "人"?this.chartData.midText + "\n" + total : this.chartData.midText + "\n" + (total/10000).toFixed(2),
          textAlign: "center",
          fill: "#00FFFC",
          fontFamily: 'MicrosoftYaHei',
          fontSize: this.chartData.fontSize || 18,
        },
      },
      toolbox: {
        show: false,
      },
      series: seriesOption,
    };
  }

  angle: number = 0;

  draw() {
    //@ts-ignore
    const pieChart = echarts.init(document.getElementById(this.id));
    this.angle += 3;
    const option = this.getOption(this.angle, this.chartData.data, this.chartData.unitName);
    //@ts-ignore
    pieChart.setOption(option, true);
    window.onresize = function () {
      pieChart.resize();
    };
  }

  //获取圆上面某点的坐标(x0,y0表示坐标，r半径，angle角度)
  getCirlPoint(x0, y0, r, angle) {
    let x1 = x0 + r * Math.cos((angle * Math.PI) / 180);
    let y1 = y0 + r * Math.sin((angle * Math.PI) / 180);
    return {
      x: x1,
      y: y1,
    };
  }
}
</script>
