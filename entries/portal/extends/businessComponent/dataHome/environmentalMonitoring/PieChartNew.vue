<template>
  <div style="width: 100%; height: 100%" :id="id"></div>
</template>

<script lang="ts">
import {Component,Vue,Prop,Watch} from "vue-property-decorator";
import echarts,{ECharts,EChartOption} from "echarts"
@Component({
  name:"pieChart",
  components:{}
})
export default class PieChart extends Vue{
  @Prop({required:true})
  id!:string;
  @Prop({required:true,default:()=>{return{value:0,name:"",color:"#f88c54"}}})
  chartData!:{value:number,name:string,color:string}

  chart!:ECharts;

  getEchartOption():EChartOption<EChartOption.SeriesPie>{
    return {
      series:[
        {
          id:this.id,
          type:"pie",
          clockwise:false,
          avoidLabelOverlap: false,
          radius:["60%","80%"],
          label:{
            position: 'center',
            rich:{
              a: {
                color: "#CB8B04",
                align: "center",
                fontSize: this.calcVwToPx(2.6042),
                fontWeight: 700,
              },
              b: {
                color: "#fff",
                align: "center",
                fontSize: this.calcVwToPx(1.0417),
              },
            },
            formatter:this.chartData.name?`{a|${this.chartData.value}}\n{b|${this.chartData.name}}`:`{b|暂无数据}`,
          },
          itemStyle:{
            shadowBlur:0,
            shadowColor:"#203665",
          },
          labelLine:{
            show:false,
          },
          hoverAnimation:false,
          center:["50%","50%"],
          data:[
            {
              value:this.chartData.value,
              itemStyle:{
                color:this.chartData.color
              }
            },
            {
              value:350-this.chartData.value,
              itemStyle:{
                color:"#24375c"
              }
            },
          ]
        }
      ],
    }
  }

  calcVwToPx(fontSizeVw:number){
    return fontSizeVw*(window.screen.width/100)
  }

  mounted(){
    this.init();
    this.chartResize();
    window.addEventListener("resize",()=>{
      this.chart?this.chart.dispose():null;
      this.init();
    })
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

  @Watch("chartData",{deep:true})
  echartOptionChange(){
    if(this.chart){
      this.chart.isDisposed()?null:this.chart.dispose();
    }
    this.init();
  }
}
</script>
