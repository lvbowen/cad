<template>
  <div style="width: 100%; height: 100%" :id="id"></div>
</template>

<script lang="ts">
import {Component,Vue,Prop,Watch} from "vue-property-decorator";
import echarts,{ECharts,EChartOption} from "echarts";
@Component({
  name:"lineChartNew",
  components:{}
})
export default class LineChartNew extends Vue{
  @Prop({required:true})
  id!:string;
  @Prop({required:true})
  lineData!:{xAxis: [],yAxis: [],yAxisName:string,name:string,xAxisInterval:number};
  chart!:ECharts;

  mounted(){
    this.init();
    this.chartResize();
    window.addEventListener("resize",()=>{
      this.chart?this.chart.dispose():null;
      this.init();
    })
  }

  getEchartOption():EChartOption<EChartOption.SeriesLines>{
    return {
      color:["#2f6ab5"],
      xAxis:{
        type:"category",
        data:this.lineData.xAxis,
        boundaryGap: false,
        axisTick:{show:false},
        axisLabel:{
          color:"#c3c3c5",
          interval:this.lineData.xAxisInterval
        }
      },
      yAxis: {
        type: 'value',
        name: this.lineData.yAxisName,
        nameTextStyle:{
          align:"right",
          color:"#c3c3c5",
          padding:[0,this.calcVwToPx(0.4167),this.calcVwToPx(0.2604),0]
        },
        axisTick:{show:false},
        axisLine:{show:false},
        axisLabel:{color:"#c3c3c5"},
        splitLine:{
          lineStyle:{
            color:"rgba(43, 54, 81,.5)",
            width:1.5
          }
        }
      },
      series:[
        {
          type:"line",
          name:this.lineData.name,
          symbol:"none",
          data: this.lineData.yAxis,
          markLine:{
            silent:false,
            symbol: ['none', 'none'],
            label: { show: false },
            lineStyle:{
              type:"solid",
              color:"rgba(43, 54, 81,.5)",
              width:1.5
            },
            // @ts-ignore
            data:this.markLineData()
          }
        }
      ],
      tooltip:{
        show:true,
        trigger: "axis",
        // transitionDuration: 0,
        // padding:0,
        // borderWidth:0,
        // formatter:(params,tichet,callback)=>{
        //   let html=this.tooltip(params);
        //   return html;
        // }
      },
      legend:{
        show:true,
        textStyle:{
          color:"#fff"
        }
      },
      grid: {
        left: this.calcVwToPx(3.125),
        right: this.calcVwToPx(3.125),
        bottom: this.calcVwToPx(2.0833),
        top:this.calcVwToPx(3),
      },
      dataZoom:[
        {
          type: 'inside',
          // xAxisIndex: [0],
          start: 0,
          end: 100
        }
      ]
    }
  }

  tooltip(params):string{
    // @ts-ignore
    return `<div style="color: #dcdcde;width: 7.4479vw;height: 3.4896vw;background: url(${require("./img/data_bg.png")}) no-repeat;background-size: 100% 100%;padding-top: 0.5854vw">
      <span style="padding-top: 0.8854vw;margin-left: 1.3021vw;">${params[0].axisValue}</span>
      <div style="position:relative;margin-left: 1.1979vw;">
        <span style="display:inline-block;width: 0.5208vw;height: 0.5208vw;background-color: #ffffff;border-radius: 0.2604vw;margin-right: 0.5208vw;"></span><span>${params[0].seriesName}:&nbsp;${params[0].data}</span>
        <span style="position:absolute;display:inline-block;width: 0.3125vw;height: 0.3125vw;background-color: ${params[0].color};border-radius:0.1563vw;top:0.4167vw;left:0.1042vw"></span>
      </div>
    </div>`
  }

  markLineData(){
    let data:{xAxis:number}[]=[];
    this.lineData.xAxis.forEach((item,index)=>{
      data.push({xAxis:index});
    });
    return data;
  }

  init(){
    const chart = echarts.init(document.querySelector(`#${this.id}`) as HTMLDivElement);
    chart.setOption(this.getEchartOption());
    this.chart=chart;
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
        this.chart?this.chart.dispose():null;
        this.init();
      })
    });
    const element = document.querySelector(`#${this.id}`) as HTMLElement;
    element.style.position="relative";
    element.appendChild(iframe);
  }

  calcVwToPx(fontSizeVw:number){
    return fontSizeVw*(window.screen.width/100)
  }

  @Watch("lineData",{deep:true})
  echartOptionChange(){
    if(this.chart){
      this.chart.isDisposed()?null:this.chart.dispose();
    }
    this.init();
  }
}
</script>
