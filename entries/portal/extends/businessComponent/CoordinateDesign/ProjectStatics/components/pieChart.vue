<template>
  <div ref="divElement" class="pieChart"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch,Ref } from 'vue-property-decorator';
import eCharts,{ECharts,EChartOption} from "echarts";
import Mustache from "mustache";
@Component({
  name:"PieChart"
})
export default class PieChart extends Vue {
  @Prop({required:true})chartData!:{value:number,name:string,color?:string}[];
  @Prop({required:false,default:()=>([0,"85%"])})radius!:string|number|[string|number,string|number];
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
  @Prop({required:false,default:false}) roseType!:boolean|"radius"|"area";
  @Ref("divElement") divElement!:HTMLDivElement;

  chart!:ECharts;

  get chartDataFinal():EChartOption.SeriesPie.DataObject[]{
    return this.chartData.map((item,index)=>{
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
      this.chart = eCharts.init(this.divElement);
      this.chart.setOption(this.initChartOption());
  }

  initChartOption(): EChartOption<EChartOption.SeriesPie> {
    return {
      color:['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272',
            '#fc8452', '#9a60b4', '#ea7ccc'],
      legend:{...this.legend,data:this.chartData.map(item=>item.name)},
      tooltip:{
        show:true,
        backgroundColor:"#FFFFFF",
        padding:[8,11,14,12],
        extraCssText:"box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;border-radius: 10px;",
        formatter:params=>{
          const template=`
            {{#params}}
            <div class="templateTitle">{{name}}</div>
            <div>{{{marker}}}<span class="templateContent">项目数量: {{value}}个</span></div>
            {{/params}}
          `
          return Mustache.render(template,{params});
        }
      },
      series: [
        {
          type: 'pie',
          radius: this.radius,
          hoverOffset:3,
          avoidLabelOverlap: true,
          label: this.label,
          roseType:this.roseType,
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
.pieChart{
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
