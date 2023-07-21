<template>
  <div style="width: 100%; height: 100%" :id="id"></div>
</template>

<script lang="ts">
import {Component,Vue,Prop,Watch} from "vue-property-decorator";
import echarts,{ECharts,EChartOption} from "echarts";
@Component({
  name:"pieChart",
  components:{}
})
export default class PieChartNew extends Vue{
  @Prop({required:true})
  id!:string;
  @Prop({required:true})
   chartData!: { data: any, isLabelLineShow: boolean, midText: string, unitName: string, radius?: Array<number> };
  chart!:ECharts;

  beforeDestroy(){
    this.chart?this.chart.dispose():null;
  }

  mounted(){
    this.initChart();
    this.chartResize();
  }

  getEchartOption():EChartOption<EChartOption.SeriesPie>{
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
          value: (dataChart[i].value / total * 100) as never as never,
          name: dataChart[i].name as never,
          itemStyle: {
            normal: {
              borderWidth: this.calcVwToPx(0.1042) as never,
              shadowBlur: this.calcVwToPx(1.0417) as never,
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
        center:["50%","33%"],
        radius: ['36%', '43%'],
        hoverAnimation: false,
        itemStyle: {
          normal: {
            label: {
              show: this.chartData.isLabelLineShow,
              position: 'outside',
              color: '#ddd',
              formatter: function (params) {
                if (params.name !== '') {
                  return `{lable|${params.name}}{number|${(params.value / 100 * total).toFixed(0)}}%`;
                } else {
                  return '';
                }
              },
              rich:{
                lable:{
                  fontSize:this.calcVwToPx(.625),
                  fontFamily:"Source Han Sans CN",
                  color: '#6e87a5',
                },
                number:{
                  fontSize:this.calcVwToPx(.9375),
                  fontFamily:"Source Han Sans CN",
                  color: '#fff',
                  padding:[0, 0 ,0 ,10]
                }
              }
            },
            labelLine: {
              length: this.calcVwToPx(0.5208),
              length2: this.calcVwToPx(1.0417),
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
      legend: {
        left: 'center',
        bottom:"5%",
        textStyle:{
          color:"#91b1d5",
          rich:{
            lable:{
              fontSize:this.calcVwToPx(.625),
              fontFamily:"Source Han Sans CN",
              color: '#6e87a5',
            },
            number:{
              fontSize:this.calcVwToPx(.9375),
              fontFamily:"Source Han Sans CN",
              color: '#fff',
              padding:[0, 5 ,0 ,10]
            }
          }
        },
        icon:"rect",
        formatter:name=>{
          return this.legendFormatter(name);
        }
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

  getEchartOption2():EChartOption<EChartOption.SeriesPie>{
    return{
      tooltip: {
        show:false,
      },
      legend: {
        left: 'center',
        bottom:"5%",
        textStyle:{
          color:"#91b1d5",
          rich:{
            lable:{
              fontSize:this.calcVwToPx(.625),
              fontFamily:"Source Han Sans CN",
              color: '#6e87a5',
            },
            number:{
              fontSize:this.calcVwToPx(.9375),
              fontFamily:"Source Han Sans CN",
              color: '#fff',
            }
          }
        },
        icon:"rect",
        formatter:name=>{
          return this.legendFormatter(name);
        }
      },
      series: [
        {
          name: '',
          type: 'pie',
          center:["50%","33%"],
          radius: ['20%', '40%'],
          avoidLabelOverlap: false,
          itemStyle: {
            show:false,
            borderColor: '#0a0f1e',
            borderWidth: 2,
            borderRadius:10,
          },
          label: {
            show: true,
            position: 'outside',
            formatter:"{b}{c}",
            rich:{
              b:{

              },
              c:{

              }
            }
          },
          emphasis: {
            label: {
              show: true,
              // fontSize: 15,
              // fontWeight: 'bold'
            },
          },
          labelLine: {
            show: true
          },
          data: [
            { value: 1048, name: 'Search Engine' },
            { value: 735, name: 'Direct' },
            { value: 580, name: 'Email' },
            { value: 484, name: 'Union Ads' },
            { value: 300, name: 'Video Ads' }
          ],
        },
      ]
    };
  }

  legendFormatter(name:string):string{
    const data=this.chartData.data.find(item=>item.name===name);
    return `{lable|${name}}{number|${data?.value}}{lable|次}`;
  }

  initChart(){
    const chart = echarts.init(document.querySelector(`#${this.id}`) as HTMLDivElement);
    chart.setOption(this.getEchartOption());
    this.chart=chart;
  }

  chartResize():void{
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.position = "absolute";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.zIndex = "-111111111";
    iframe.style.border = "none";
    this.$nextTick(() => {
      iframe.contentWindow?.addEventListener("resize", () => {
        this.chart.setOption(this.getEchartOption());
        this.chart ? this.chart.resize() : null;
      });
    });
    const element = document.querySelector(`#${this.id}`) as HTMLElement;
    element.style.position = "relative";
    element.appendChild(iframe);
  }

  calcVwToPx(fontSizeVw:number){
    return fontSizeVw*(window.screen.width/100)
  }

  @Watch("chartData",{deep:true})
  echartOptionChange(){
    if (this.chart) {
      this.chart.setOption(this.getEchartOption());
    } else {
      this.initChart();
    }
  }
}
</script>
