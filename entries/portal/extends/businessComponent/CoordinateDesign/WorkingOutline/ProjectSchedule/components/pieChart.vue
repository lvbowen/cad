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
  @Prop({required:true})chartData!:{value:number,value1:number,name:string,color?:string;dw?:string}[];
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
  @Prop({required:false,default: ()=>({ text:'', subtext:''})}) pieCharTitle!: { text:string, subtext:string };

  chart!:ECharts;

  get chartDataFinal():EChartOption.SeriesPie.DataObject[]{
    return this.chartData.map((item,index)=>{
      let color="";
      if(item.color){
        color=item.color;
      }
      return {value:item.value,value1:item.value1,name:item.name,dw:item?.dw??'',itemStyle:{color:color}};
    })
  }

  mounted(){
    this.initChart();
    this.chartResize();
  }

  initChart(){
    this.chart = eCharts.init(this.divElement);
    //@ts-ignore
    this.chart.setOption(this.initChartOption());
  }

  initChartOption(): {
    color: string[]; legend: { [p: string]: any; data: string[] }; series: ({ data: echarts.EChartOption.SeriesPie.DataObject[]; roseType: boolean | "radius" | "area"; center: any[]; avoidLabelOverlap: boolean; hoverOffset: number; label: { show?: boolean; position?: "outside" | "inside" | "inner" | "center"; formatter?: (params: any) => string; [p: string]: any }; labelLine: { length2: number; show: boolean; length: number }; type: string; radius: string | number | [(string | number), (string | number)] } | { silent: boolean; data: { name: string | undefined; itemStyle: { opacity: number }; value: number }[]; center: any[]; avoidLabelOverlap: boolean; hoverOffset: number; z: number; label: { show: true; position: "center"; color?: string; fontStyle?: string; fontWeight?: string | number; fontFamily?: string; fontSize?: number; formatter?: Function | string; rich?: { [p: string]: { color?: string; fontStyle?: string; fontWeight?: string | number; fontFamily?: string; fontSize?: number } } } | undefined; labelLine: { show: boolean }; type: string; radius: string | number | [(string | number), (string | number)] })[]; tooltip: { formatter: (params) => any; padding: number[]; backgroundColor: string; extraCssText: string; show: boolean | undefined }; title: { subtext: string; x: string; y: string; text: string; textStyle: { color: string; fontSize: number; fontWeight: string }; subtextStyle: { color: string; fontSize: number; fontWeight: string } }
  } {
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
            <div>{{{marker}}}<span class="templateContent">{{name}}: {{data.value1}} ${!params.data.dw?'个':params.data.dw}</span></div>
            {{/params}}
          `
          return Mustache.render(template,{params});
        }
      },
      title: {
        text: this.pieCharTitle.text,
        subtext: this.pieCharTitle.subtext,
        x: 'center',
        y: '40%',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal',
          color: '#666666',
        },
        subtextStyle: {
          fontSize: 16,
          fontWeight: 'normal',
          color: '#666666',
        },
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
            length: 8,
            length2: 12
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
          z:1,
        }
      ],
    };
  }

  chartResize(): void {
    const iframe = document.createElement("iframe");
    iframe.className = "iframe";
    this.$nextTick(() => {
      iframe.contentWindow?.addEventListener("resize", () => {
        //@ts-ignore
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
      //@ts-ignore
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
