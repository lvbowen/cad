<template>
  <div :id="id" style="width:100%; height:100%"></div>
</template>


<script lang="ts">
import {Component,Vue,Prop,Watch} from "vue-property-decorator";
import echarts,{ECharts,EChartOption} from "echarts"
@Component({
  name:"lineChart",
  components:{}
})
export default class LineChart extends Vue{
  @Prop({required:true})
  id!:string;
  @Prop({required:true})
  lineData:any;
  lineChart!:ECharts;
  get lineChartOption():EChartOption{
    return {
      xAxis:{
        type:"category",
        data:this.lineData.xAxis,
        boundaryGap: true,
        axisTick:{show:false},
        axisLabel:{color:"#c3c3c5"}
      },
      yAxis: {
        type: 'value',
        name: "亿元",
        nameTextStyle:{
          align:"right",
          color:"#c3c3c5",
          padding:[0,8,10,0]
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
          symbol:"none",
          data: this.lineData.yAxis,
          markLine:{
            silent:true,
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
        transitionDuration: 0,
        padding:0,
        borderWidth:0,
        formatter:(params,tichet,callback)=>{
          let html=this.tooltip(params);
          return html;
        }
      }
    }
  }
  markLineData(){
    let data:{xAxis:number}[]=[];
    this.lineData.xAxis.forEach((item,index)=>{
      data.push({xAxis:index});
    });
    return data;
  }
  mounted():void{
    this.lineChartInit();
    this.lineChartResize();
  }
  tooltip(params):string{
    // @ts-ignore
    return `<div style="color: #dcdcde;width: 7.4479vw;height: 3.4896vw;background: url(${require("./img/data_bg.png")}) no-repeat;background-size: 100% 100%;padding-top: 17px">
      <span style="padding-top: 17px;margin-left: 25px;">${params[0].axisValue}</span>
      <div style="position:relative;margin-left: 23px;">
        <span style="display:inline-block;width: 10px;height: 10px;background-color: #ffffff;border-radius: 5px;margin-right: 10px;"></span><span>产值额:&nbsp;${params[0].data}</span>
        <span style="position:absolute;display:inline-block;width: 6px;height: 6px;background-color: ${params[0].color};border-radius:3px;top:8px;left:2px"></span>
      </div>
    </div>`
  }
  lineChartInit():void{
    const chart = echarts.init(document.querySelector(`#${this.id}`) as HTMLDivElement);
    chart.showLoading();
    chart.setOption(this.lineChartOption);
    chart.hideLoading();
    this.lineChart=chart;
  }
  beforeDestroy(){
    if(this.lineChart){
      this.lineChart.isDisposed()?null:this.lineChart.dispose();
    }
  }
  @Watch("lineChartOption",{deep:true})
  lineChartOptionChange(newVal:EChartOption,oldVale:EChartOption):void{
    if(this.lineChart){
      this.lineChart.isDisposed()?null:this.lineChart.dispose();
    }
    this.lineChartInit();
  }
  lineChartResize():void{
    const iframe=document.createElement("iframe");
    iframe.style.width="100%";
    iframe.style.height="100%";
    iframe.style.position="absolute";
    iframe.style.top="0";
    iframe.style.left="0";
    iframe.style.zIndex="-11111";
    this.$nextTick(()=>{
      iframe.contentWindow?.addEventListener("resize",()=>{
        if(this.lineChart){
          this.lineChart.dispose();
          this.lineChartInit();
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
