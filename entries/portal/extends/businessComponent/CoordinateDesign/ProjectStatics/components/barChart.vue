<template>
  <div ref="divElement" class="barChart"></div>
</template>

<script lang="ts">
  import { Component, Vue, Prop, Watch,Ref } from 'vue-property-decorator';
  import eCharts,{ECharts,EChartOption} from "echarts";
  import Mustache from "mustache";
  @Component({name:"BarChart"})
  export default class BarChart extends Vue {
    @Ref("divElement") divElement!:HTMLDivElement;
    @Prop({required:true})chartData!:{value:number,name:string,color?:string}[];
    @Prop({required:false,default:()=>({})}) grid!:{top?:number|string,left?:number|string,right?:number|string,bottom?:number|string};
    colors=['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272',
      '#fc8452', '#9a60b4', '#ea7ccc'];
    chart!:ECharts


    mounted(){
      this.initChart();
      this.chartResize();
    }

    initChart(){
      this.chart = eCharts.init(this.divElement);
      this.chart.setOption(this.initChartOption() as EChartOption);
    }

    initChartOption():EChartOption{
      return{
        grid: {
          top:this.grid.top??10,
          left: this.grid.left??"4%",
          right: this.grid.right??'4%',
          bottom: this.grid.bottom??10,
          containLabel: true
        },
        tooltip:{
          show:true,
          trigger: 'axis',
          backgroundColor:"#FFFFFF",
          extraCssText:"box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;border-radius: 10px;",
          padding:[8,39,14,13],
          axisPointer:{
            lineStyle:{
              type:"dashed"
            }
          },
          formatter:params=>{
            const template=`
              {{#params}}
              <div class="templateTitle">{{name}}</div>
              <div>{{{marker}}}<span class="templateContent">项目数量{{value}}个</span></div>
              {{/params}}
            `
            return Mustache.render(template,{params});
          }
        },
        xAxis:{
          type:"category",
          data:this.chartData.map(item=>(item.name)),
          axisTick:{
            show:false,
          },
          axisLine:{
            show:true,
            lineStyle:{
              color:"#DBDBDB"
            }
          },
          axisLabel:{
            show:true,
            color:"#C9C9C9"
          }
        },
        yAxis:{
          type:"value",
          axisLine:{
            show:false,
          },
          axisTick:{
            show:false,
          },
          splitLine:{
            show:true,
            lineStyle:{
              color:"#f4f4f4"
            }
          },
          axisLabel:{
            show:true,
            formatter:(value,index)=>{
              return value>0?`${value}个`:`${value}`;
            },
            color:"#C9C9C9",
          }
        },
        series:[
          {
            type:"bar",
            data:this.chartData.map((item,index)=>{
              return{
                value:item.value,
                itemStyle:{
                  color:item.color?item.color:this.colors[index%this.colors.length],
                }
              }
            })
          }
        ]
      }
    }

    chartResize(){
      const iframe = document.createElement("iframe");
      iframe.className = "iframe";
      this.$nextTick(() => {
        iframe.contentWindow?.addEventListener("resize", () => {
          if(this.chart){
            this.chart.setOption(this.initChartOption() as EChartOption);
            this.chart.resize();
          }
        });
      });
      this.divElement.style.position="relative";
      this.divElement.appendChild(iframe);
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
.barChart{
  width: 100%;
  height: 100%;
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
/deep/.templateTitle{
  font-size: 12px;
  font-family: "Source Han Sans CN";
  color: #C0C0C0;
}
/deep/.templateContent{
  font-size: 12px;
  font-family: "Source Han Sans CN";
  color: #6E6E6E;
}
</style>
