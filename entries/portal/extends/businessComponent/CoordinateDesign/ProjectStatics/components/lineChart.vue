<template>
  <div ref="divElement" class="lineChart"></div>
</template>

<script lang="ts">
  import { Component, Vue, Prop, Watch,Ref } from 'vue-property-decorator';
  import eCharts,{ECharts,EChartOption} from "echarts";
  import Mustache from "mustache";
  @Component({name:"lineChart"})
  export default class  extends Vue {
    @Prop({required:true}) option!:{legend:string[],legendShow:boolean,xAxis:string[],series:number[][]|{data:number[],color?:string,labelShow?:boolean}[]};
    @Prop({required:false,default:()=>({})}) grid!:{top?:number|string,left?:number|string,right?:number|string,bottom?:number|string};
    @Prop({required:false,default:()=>([])}) dataZoom!:{[key:string]:any}[];
    @Prop({required:false,default:""}) yAxis!:{name:string};
    @Ref("divElement") divElement!:HTMLDivElement;

    chart!:ECharts


    mounted(){
      this.initChart();
      this.chartResize();
    }

    initChart(){
      this.chart = eCharts.init(this.divElement);
      this.chart.setOption(this.initChartOption());
    }

    initChartOption(): EChartOption{
      return{
        color:['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272',
            '#fc8452', '#9a60b4', '#ea7ccc'],
        dataZoom:this.dataZoom,
        tooltip: {
          trigger: 'axis',
          backgroundColor:"#FFFFFF",
          extraCssText:"box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;border-radius: 10px;",
          padding:[9,27,11,12],
          axisPointer:{
            lineStyle:{
              type:"dashed"
            }
          },
          formatter:params=>{
            const template=`
              <div class="templateTitle">截止至{{name}}</div>
              {{#params}}
              <div>{{{marker}}}<span class="templateContent">{{seriesName}}数 {{value}} 个</span></div>
              {{/params}}
            `
            return Mustache.render(template,{params,name:params?.[0].name});
          }
        },
        legend: {
          show:this.option.legendShow,
          data: this.option.legend?this.option.legend:undefined,
          itemGap:30,
          icon:"roundRect",
          top:"5%"
        },
        grid: {
          top:this.grid.top??10,
          left: this.grid.left??"4%",
          right: this.grid.right??'4%',
          bottom: this.grid.bottom??10,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          nameLocation:"start",
          boundaryGap: false,
          data: this.option.xAxis?this.option.xAxis:undefined,
          axisTick:{
            show:false
          },
          axisLine:{
            show:true,
            lineStyle:{
              color:"#DBDBDB"
            }
          },
          axisLabel:{
            color:"#C9C9C9",
            interval:this.option.xAxis.length>12?Math.floor(this.option.xAxis.length/12):undefined
          }
        },
        yAxis: {
          type: 'value',
          name:this.yAxis.name,
          nameTextStyle:{
            align:"right",
          },
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
        series: this.createseries(),
      }
    }

    createseries(){
      return this.option.series.map((item,index)=>{
        if(Array.isArray(item)){
          return {
            name: this.option.legend?this.option.legend[index]:"",
            type: 'line',
            data: item
          }
        }else{
          const itemData:{name:string,type:string,data:number[],lineStyle?:{[key:string]:any},
            itemStyle?:{[key:string]:any},label?:{[key:string]:any},symbol?:string,symbolSize?:number,areaStyle?: {color?:string}}={
            name: this.option.legend?this.option.legend[index]:"",
            type: 'line',
            data: item.data,
            itemStyle:item.color?{
              color:item.color,
              borderWidth:2,
              borderType:"solid",
              borderColor:item.color,
            }:{},
            label:item.labelShow?{
              show:false,
            }:{},
            lineStyle:item.color?{
              color:item.color
            }:{},
            symbol:"emptyCircle",
            symbolSize:0.5,
            areaStyle: {
              color:"#EAF2FD"
            }
          };
          return itemData;
        }
      })
    }

    chartResize(){
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
      this.divElement.style.position="relative";
      this.divElement.appendChild(iframe);
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
.lineChart{
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
