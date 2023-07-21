<template>
  <div class="myBarChart" :id="id"></div>
</template>

<script lang="ts">
  import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
  import echarts,{ECharts,EChartOption} from "echarts";
import { key } from 'localforage';
  @Component({
    name:"myBarChart"
  })
  export default class  extends Vue {
    @Prop({required:true})id!:string;
    @Prop({required:true}) option!:{legend:string[],xAxis:string[],series:((number[])|({data:(number|{value:number,itemStyle?:{color?:string,[key:string]:any}})[],color?:string,label?:{[key:string]:any}}))[]};
    @Prop({required:false,default:()=>({})}) grid!:{top?:number|string,left?:number|string,right?:number|string,bottom?:number|string};
    @Prop({required:false,default:()=>([])}) dataZoom!:{[key:string]:any}[];
    @Prop({required:false,default:""}) yAxis!:{name:string};
    chart!:ECharts;

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

    initChartOption(): EChartOption{
      return{
        dataZoom:this.dataZoom,
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: this.option.legend?this.option.legend:undefined,
          itemGap:30,
          icon:"roundRect",
          top:"5%"
        },
        grid: {
          top:this.grid.top??60,
          left: this.grid.left??"4%",
          right: this.grid.right??'4%',
          bottom: this.grid.bottom??"10%",
          containLabel: true
        },
        xAxis: {
          type: 'category',
          nameLocation:"start",
          boundaryGap: true,
          data: this.option.xAxis?this.option.xAxis:undefined,
          axisTick:{
            show:false
          },
          axisLine:{
            lineStyle:{
              width:2,
              color:"#848484"
            }
          },
          axisLabel:{
            interval:this.option.xAxis.length>7?Math.floor(this.option.xAxis.length/7):undefined
          }
        },
        yAxis: {
          type: 'value',
          name:this.yAxis.name,
          nameTextStyle:{
            align:"right"
          },
          axisLine:{
            show:true,
          },
          axisTick:{
            show:false,
          },
          splitLine:{
            show:false,
            lineStyle:{
              type:"dashed"
            }
          }
        },
        series: this.createseries(),
      }
    }

    createseries(){
      return this.option.series.map((item,index)=>{
        if(Array.isArray(item)){
          return {
            name: this.option.legend?this.option.legend[index]:"",
            type: 'bar',
            data: item
          }
        }else{
          const itemData={
            name: this.option.legend?this.option.legend[index]:"",
            type: 'bar',
            data: item.data,
            itemStyle:{
              color:item.color?item.color:'',
            },
            label:{
              show:item.label&&item.label.show?true:false,
              position:item.label?.position??"inside",
            },
          };
          return itemData;
        }
      })
    }

    chartResize(): void {
      const iframe = document.createElement("iframe");
      iframe.className = "iframe";
      this.$nextTick(() => {
        iframe.contentWindow?.addEventListener("resize", () => {
          if(this.chart){
            this.chart.setOption(this.initChartOption());
            this.chart.resize();
          }
        });
      });
      const element = document.querySelector(`#${this.id}`) as HTMLElement;
      element.style.position = "relative";
      element.appendChild(iframe);
    }

    @Watch("option",{deep:true})
    optionChanged(){
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
.myBarChart{
  height: 100%;
  width: 100%;
}
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
