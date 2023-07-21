<template>
  <div style="height:100%;width:100%" :id="id"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import echarts,{ECharts,EChartOption,EChartTitleOption} from "echarts";
@Component({
  name:"PieChart"
})
export default class PieChart extends Vue {
  @Prop({required:true})id!:string;
  @Prop({required:true})chartData!:{value:number,name:string,color?:string}[];
  @Prop({required:false,default:()=>([0,"75%"])})radius!:string|number|[string|number,string|number];
  @Prop({required:false,default:()=>({top:"0",left:"center"})}) legend!:{[key:string]:any};
  @Prop({required:false,default:()=>({
      show:true,
      position:"outside",
      formatter:params=>'{name|' + params.name + '} ({value|' + params.percent+'%' + ')}',
      rich: {
        b: {
          fontSize: 14,
          fontFamily: 'Microsoft YaHei',
        },
        c: {
          fontSize: 14,
          fontFamily: 'Microsoft YaHei',
        }
      }
    })}) label!:{show?:boolean,position?:"outside"|"inside"|"inner"|"center",formatter?:(params:any)=>string,[key:string]:any};
  @Prop({required:false,default:()=>(['50%','50%'])}) center!:any[];
  @Prop({required:false,default:()=>({name:"",itemStyle:{show:true,position:"center"}})}) title!:{name?:string,itemStyle?:{show:true,position:"center",color?: string,fontStyle?: string,fontWeight?: string | number,fontFamily?: string,fontSize?: number,
      formatter?: Function | string,rich?:{[userStyle: string]:{
          color?: string,fontStyle?: string,fontWeight?: string | number,fontFamily?: string,fontSize?: number
        }}}};

  chart!:ECharts;

  get chartDataFinal():EChartOption.SeriesPie.DataObject[]{
    return this.chartData.map(item=>{
      let color="";
      if(item.color){
        color=item.color;
      }
      return {value:item.value,name:item.name,itemStyle:{color:color}};
    })
  }

  findValueForName(name:string):string{
    const item = this.chartData.find(f=>f.name===name)
    return item?item.value.toString():" ";
  }

  mounted(){
    this.initChart();
    this.chartResize();
  }

  initChart(){
    const divElement = document.querySelector(`#${this.id}`) as HTMLDivElement;
    const options = this.initChartOption();
    const chart = echarts.init(divElement);
    chart.setOption(options);
    this.chart = chart;
  }

  initChartOption(): EChartOption<EChartOption.SeriesPie> {
    return {
      legend:{...this.legend,data:this.chartData.map(item=>item.name)},
      tooltip:{
        show:true,
      },
      series: [
        {
          type: 'pie',
          radius: this.radius,
          hoverOffset:3,
          avoidLabelOverlap: true,
          label: this.label,
          labelLine: {
            show: this.label.show??false,
          },
          center:this.center,
          data: this.chartDataFinal,
        },
        {
          type: 'pie',
          radius: this.radius,
          hoverOffset:0,
          avoidLabelOverlap: false,
          label: this.title.itemStyle,
          silent:true,
          labelLine: {
            show: false,
          },
          center:this.center,
          data: this.chartDataFinal.length>0?[{value:1,name:this.title.name,itemStyle:{ opacity:0}}]:[],
          z:1
        }
      ],
    };
  }

  chartResize(): void {
    const iframe = document.createElement("iframe");
    iframe.className = "iframe";
    this.$nextTick(() => {
      iframe.contentWindow?.addEventListener("resize", () => {
        this.chart.setOption(this.initChartOption());
        this.chart ? this.chart.resize() : null;
      });
    });
    const element = document.querySelector(`#${this.id}`) as HTMLElement;
    element.style.position = "relative";
    element.appendChild(iframe);
  }

  @Watch("chartData",{deep:true})
  chartDataChanged(){
    if (this.chart) {
      const options=this.initChartOption();
      this.chart.setOption(options);
    } else {
      this.initChart();
    }
  }
}
</script>

<style lang="less" scoped>
/deep/.iframe {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -9999;
  height: 100%;
  width: 100%;
  border: none;
}
</style>
