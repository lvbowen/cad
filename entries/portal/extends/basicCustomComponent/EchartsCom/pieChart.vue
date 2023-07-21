<template>
  <div class="chart" :id="id"></div>
</template>

<script lang="ts">
  import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
  import echarts,{ EChartOption,ECharts,EChartTitleOption } from "echarts";
  @Component({
    name:"PieChart",
    components:{
    }
  })
  export default class PieChart extends Vue {
    @Prop({required:true,type:String}) id!:string;
    @Prop({required:true,default:()=>({
        radius: ["30%","50%"],
        center:["50%","50%"],
        label: {
          show: true,
          position: 'outside'
        },
        labelLine: {
          show: true
        },
        data: [
          { value: 1048, name: 'Search Engine' },
          { value: 735, name: 'Direct' },
          { value: 580, name: 'Email' },
        ]
      }
    )}) chartData!:EChartOption.SeriesPie;
    @Prop({required:false,default:undefined}) legend!:EChartOption.Legend;
    @Prop({required:false,default:10}) radiusGap!:number;
    @Prop({required:false,default:()=>(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'])}) color!:string[];
    @Prop({required:false,default:()=>({})}) title!:EChartTitleOption|EChartTitleOption[];

    chart!:ECharts;
    iframe!:HTMLIFrameElement;
    divElement!:HTMLDivElement;
    angle=0;
    timerId=0;
    interval=100;

    mounted(){
      this.divElement = document.querySelector(`#${this.id}`) as HTMLDivElement;
      this.initChart();
      this.chartResize();
      this.timerId=setInterval(()=>{
        this.angle+=3;
      },this.interval);
    }
    animationOptions():EChartOption.Series[]{
      const center=this.getCenter();
      const radius=this.getRadius();
      return [
        {
          type: 'custom',
          coordinateSystem: "none",
          renderItem: (params, api)=> {
            return {
              type: 'arc',
              shape: {
                  cx: center[0],
                  cy: center[1],
                  r: Math.min(...radius)-this.radiusGap,
                  startAngle: (0+this.angle) * Math.PI / 180,
                  endAngle: (90+this.angle) * Math.PI / 180
              },
              style: {
                  stroke: "#0CD3DB",
                  fill: "transparent",
                  lineWidth: 1.5
              },
              silent: true,
            };
          },
          data: [0],
        },
        {
          type: 'custom',
          coordinateSystem: "none",
          renderItem: (params, api)=> {
            return {
                type: 'arc',
                shape: {
                    cx: center[0],
                    cy: center[1],
                    r: Math.min(...radius)-this.radiusGap,
                    startAngle: (180+this.angle) * Math.PI / 180,
                    endAngle: (270+this.angle) * Math.PI / 180
                },
                style: {
                    stroke: "#0CD3DB",
                    fill: "transparent",
                    lineWidth: 1.5
                },
                silent: true
            };
          },
          data: [0]
        },
        {
          type: 'custom',
          coordinateSystem: "none",
          renderItem: (params, api)=> {
            return {
                type: 'arc',
                shape: {
                    cx: center[0],
                    cy: center[1],
                    r: Math.max(...radius)+this.radiusGap,
                    startAngle: (270+-this.angle) * Math.PI / 180,
                    endAngle: (40+-this.angle) * Math.PI / 180
                },
                style: {
                    stroke: "#0CD3DB",
                    fill: "transparent",
                    lineWidth: 1.5
                },
                silent: true
            };
          },
          data: [0]
        },
        {
          type: 'custom',
          coordinateSystem: "none",
          renderItem: (params, api)=> {
            return {
                type: 'arc',
                shape: {
                    cx: center[0],
                    cy: center[1],
                    r: Math.max(...radius)+this.radiusGap,
                    startAngle: (90+-this.angle) * Math.PI / 180,
                    endAngle: (220+-this.angle) * Math.PI / 180
                },
                style: {
                    stroke: "#0CD3DB",
                    fill: "transparent",
                    lineWidth: 1.5
                },
                silent: true
            };
          },
          data: [0]
        },
        {
          type: 'custom',
          coordinateSystem: "none",
          renderItem: (params, api)=> {
            let x0 = center[0];
            let y0 = center[1];
            let r = Math.max(...radius)+this.radiusGap;
            let point = this.getCirlPoint(x0, y0, r, (90+-this.angle))
            return {
                type: 'circle',
                shape: {
                    cx: point.x,
                    cy: point.y,
                    r: 4
                },
                style: {
                    stroke: "#0CD3DB",//粉
                    fill: "#0CD3DB"
                },
                silent: true
            };
          },
          data: [0]
        },
        {
         //绿点
          type: 'custom',
          coordinateSystem: "none",
          renderItem: (params, api)=> {
            let x0 = center[0];
            let y0 = center[1];
            let r = Math.max(...radius)+this.radiusGap;
            let point = this.getCirlPoint(x0, y0, r, (270+-this.angle))
            return {
                type: 'circle',
                shape: {
                    cx: point.x,
                    cy: point.y,
                    r: 4
                },
                style: {
                    stroke: "#0CD3DB",      //绿
                    fill: "#0CD3DB"
                },
                silent: true
            };
          },
          data: [0]
        }
      ]
    }

    width():number{
      return this.divElement.offsetWidth;
    }

    height():number{
      return this.divElement.offsetHeight;
    }

    getCenter():number[]{
      if(this.chartData&&this.chartData.center){
        const {center} =this.chartData;
        if(center.length<=0){
          return [this.width()*0.5,this.height()*0.5];
        }else if(center.length===1){
            return [this.conventerToNumber(center[0],this.width())??(this.width()*0.5),this.conventerToNumber(center[0],this.height())??(this.height()*0.5)];
        }else{
          return [this.conventerToNumber(center[0],this.width())??this.width()*0.5,this.conventerToNumber(center[1],this.height())??this.height()*0.5];
        }
      }else{
        return [this.width()*0.5,this.height()*0.5];
      }
    }

    conventerToNumber(source:string|number,ref:number,type:"center"|"radius"="center"):number|undefined{
      if(typeof(source)==="number"){
        return source;
      }else if(!isNaN(Number(source))){
        return Number(source);
      }else if(source.endsWith("%")){
        return type==="center"?parseFloat(source) * ref / 100 : parseFloat(source) * ref / 100 /2
      }else{
        return undefined;
      }
    }

    getRadius():number[]{
      const ref= Math.min(this.width(),this.height());
      if(this.chartData&&this.chartData.radius){
        const { radius } =this.chartData;
        if((radius as [number|string,number|string]).length===2){
          return [this.conventerToNumber(radius[0],ref,"radius")??0,this.conventerToNumber(radius[1],ref,"radius")??0];
        }
        else{
          return [0, (this.conventerToNumber("75%",ref,"radius")??0)/2];
        }
      }else{
        return [0, (this.conventerToNumber("75%",ref,"radius")??0)/2];
      }
    }

    initChart(){
      const options = this.initChartOption();
      const chart = echarts.init(this.divElement);
      chart.setOption(options);
      this.chart = chart;
    }

    initChartOption(): EChartOption{
      let legend:EChartOption.Legend={};
      if(this.legend){
        legend=this.legend;
        legend.selectedMode=false;
      }
      return{
        title : this.title,
        color : this.color,
        legend :this.legend?legend:undefined,
        series: this.createseries(),
      }
    }

    createseries():EChartOption.Series[]{
      if(this.chartData.data){
        let options = this.animationOptions();
        const data={...this.chartData};
        data.type="pie";
        data.avoidLabelOverlap=true;
        data.silent=true;
        data.legendHoverLink=false;
        options.push(data);
        return options;
      }
      return [];
    }

    getCirlPoint(x0:number, y0:number, r:number, angle:number) {
      let x1 = x0 + r * Math.cos(angle * Math.PI / 180)
      let y1 = y0 + r * Math.sin(angle * Math.PI / 180)
      return {
          x: x1,
          y: y1
      }
    }

    chartResize(): void {
      this.iframe = document.createElement("iframe");
      this.iframe.className = "iframe";
      this.$nextTick(() => {
        this.iframe.contentWindow?.addEventListener("resize", this.resize);
      });
      const element = document.querySelector(`#${this.id}`) as HTMLElement;
      element.style.position = "relative";
      element.appendChild(this.iframe);
    }

    resize(){
      if(this.chart){
        this.chart.setOption(this.initChartOption());
        this.chart.resize();
      }
    }

    get optionData(){
      const { chartData,angle } = this;
      return { chartData, angle };
    }

    @Watch("optionData",{deep:true})
    optionDataChange(){
      if (this.chart) {
        const options=this.initChartOption();
        this.chart.setOption(options,true);
      } else {
        this.initChart();
      }
    }

    beforeDestroy(){
      this.timerId&&clearInterval(this.timerId);
      this.chart&&this.chart.isDisposed()&&this.chart.dispose();
      this.iframe.contentWindow?.removeEventListener("resize",this.resize);
    }

  }
</script>

<style lang="less" scoped>
.chart{
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

</style>
