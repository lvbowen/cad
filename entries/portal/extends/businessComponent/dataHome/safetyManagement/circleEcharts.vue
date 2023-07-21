<template>
  <div :id="id" style="width:100%; height:100%"></div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import echarts,{ECharts,EChartOption} from "echarts"
@Component({
  name: "pieEcharts",
  components: {}
})
export default class pieEcharts extends Vue {
  @Prop() id!: string;
  @Prop() chartData!: { data: any, isLabelLineShow: boolean, midText: string, unitName: string, radius?: Array<number> };
  pieCharts!:ECharts;
  mounted() {
    this.draw();
    this.chartResize();
  }

  beforeDestroy(){
    if(this.pieCharts){
      this.pieCharts.isDisposed()?null:this.pieCharts.dispose();
    }
  }

  get pieOption() {
    const dataChart=this.chartData.data;
    const unitName=this.chartData.unitName;
    let data = [];
    let total = 0;
    let color: string[] = [];
    for (let i = 0; i < dataChart.length; i++) {
      total += dataChart[i].value;
      if (dataChart[i].color) {
        color.push(dataChart[i].color)
      }
    }
    if (color.length === 0) {
      color = ['#00FE65', '#FF801C', '#F5FF46', '#00FEFF', '#ffa800', '#ff5b00', '#ff3000'];
    }


    for (let i = 0; i < dataChart.length; i++) {
      data.push(
        {
          value: (dataChart[i].value / total * 100) as never,
          name: dataChart[i].name as never,
          itemStyle: {
            normal: {
              borderWidth: 5 as never,
              shadowBlur: 20 as never,
              borderColor: dataChart[i].color ?? color[i] as never,
              shadowColor: dataChart[i].color ?? color[i] as never,
            } as never,
          } as never,
        } as never,
        {
          value: 2 as never,
          name: '' as never,
          itemStyle: {
            normal: {
              label: {
                show: false as never,
              },
              labelLine: {
                show: false as never,
              },
              color: 'rgba(0, 0, 0, 0)' as never,
              borderColor: 'rgba(0, 0, 0, 0)' as never,
              borderWidth: 0 as never,
            } as never,
          } as never,
        } as never,
      );
    }
    const seriesOption = [
      {
        name: '',
        type: 'pie',
        clockWise: false,
        // top:"28",
        // left:"28",
        radius: this.chartData.radius ?? (window.outerWidth > 2500 ? [88, 98] : window.outerWidth > 1800 ? [78, 88] : [55, 65]),
        hoverAnimation: false,
        itemStyle: {
          normal: {
            label: {
              show: this.chartData.isLabelLineShow,
              position: 'outside',
              color: '#ddd',
              formatter: function (params) {
                if (params.name !== '') {
                  return params.name + '\n' + (params.value / 100 * total).toFixed(0) + unitName;
                } else {
                  return '';
                }
              },
            },
            labelLine: {
              length: 10,
              length2: 20,
              show: this.chartData.isLabelLineShow,
              color: '#00ffff',
            },
          },
        },
        data: data,
      },
    ];
    return {
      color: color,
      tooltip: {
        show: false,
      },
      graphic: {
        //图形中间文字
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: this.chartData.midText,
          textAlign: "center",
          fill: "#ffffff",
          fontFamily: 'MicrosoftYaHei',
          fontSize: 22,
        },
      },
      toolbox: {
        show: false,
      },
      series: seriesOption,
    };
  }

  draw() {
    const pieChart = echarts.init(document.querySelector(`#${this.id}`) as HTMLDivElement);
    pieChart.showLoading();
    pieChart.setOption(this.pieOption);
    pieChart.hideLoading();
    this.pieCharts=pieChart;
  }
  @Watch("pieOption",{deep:true})
  pieOptionChange(newVal:EChartOption,oldVale:EChartOption){
    if(this.pieCharts){
      this.pieCharts.isDisposed()?null:this.pieCharts.dispose();
    }
    this.draw();
  }
  chartResize():void{
    const iframe=document.createElement("iframe");
    iframe.style.width="100%";
    iframe.style.height="100%";
    iframe.style.position="absolute";
    iframe.style.top="0";
    iframe.style.left="0";
    iframe.style.zIndex="-11111";
    this.$nextTick(()=>{
      iframe.contentWindow?.addEventListener("resize",()=>{
        if(this.pieCharts){
          this.pieCharts.dispose();
          this.draw();
        }
      })
    });
    const element = document.querySelector(`#${this.id}`) as HTMLElement;
    element.style.position="relative";
    element.appendChild(iframe);
  }
}
</script>

<style lang="less" scoped>
</style>
