<template>
  <div class="chart" :id="id"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import echarts,{ECharts} from "echarts";
@Component({
  name:"barChart",
  components:{}
})
export default class lineChart  extends Vue {
  @Prop({required:true})id!:string;
  @Prop({required:true}) option!:{xAxis:string[],seriesData: { name:string,data:number[] }[],color:string[],color1:string[],unitName:string,dataZoom:boolean,start:number,};

  chart!:ECharts;

  initChart(){
    const divElement = document.querySelector(`#${this.id}`) as HTMLDivElement;
    const options = this.initChartOption();
    const chart = echarts.init(divElement);
    chart.setOption(options);
    this.chart = chart;
  }

  initChartOption(): any{
    return{
      backgroundColor: '',
      tooltip: {
        //提示框组件
        trigger: 'axis',
        transitionDuration: 0, //echart防止tooltip的抖动
        backgroundColor: "#343537",
        borderColor: "rgba(0, 243, 230, 0.4)", // 边框颜色
        axisPointer: {
          type: 'shadow',
          label: {
            backgroundColor: 'rgba(17, 27, 54, 1)',
          },
        },
        textStyle: {
          color: '#fff',
          fontStyle: 'normal',
          fontFamily: '微软雅黑',
          fontSize: 14,
        },
      },
      grid: {
        top: '20%',
        left: '3%',
        right:'4%',
        bottom:'5%',
        containLabel: true,
      },
      dataZoom: [
        {
          show: this.option.dataZoom,
          type: "inside",
          start:this.option.start,
          end: this.option.xAxis.length > 10 ? 50 : 100,
        },
      ],
      legend: {
        //图例组件，颜色和名字
        padding: 0,
        top: 35,
        right: 40,
        itemGap: 21,
        itemWidth: 18,
        itemHeight: 10,
        selectedMode: false,
        textStyle: {
          color: '#fff',
          fontStyle: 'normal',
          fontFamily: '微软雅黑',
          fontSize: 14,
        },
      },
      xAxis: [
        {
          type: 'category',
          // 	boundaryGap: true,//坐标轴两边留白
          axisLabel: {
            //坐标轴刻度标签的相关设置。
            //		interval: 0,//设置为 1，表示『隔一个标签显示一个标签』
            //	margin:15,
            textStyle: {
              color: '#9AAFC2',
              fontStyle: 'normal',
              fontFamily: '微软雅黑',
              fontSize: 14,
            },
            rotate: 0,
          },
          axisTick: {
            //坐标轴刻度相关设置。
            show: false,
          },
          axisLine: {
            //坐标轴轴线相关设置
            lineStyle: {
              color: '#506B98',
            },
          },
          splitLine: {
            show: false,
            lineStyle: {
                color: 'rgba(255,255,255,0.2)',
            }
          },
          data: this.option.xAxis,
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: this.option.unitName || "",
          nameTextStyle: {
            color: "#9AAFC2",
            lineHeight: 20,
            padding: [0, 0, 10, 0],
          },
          splitNumber: 1,
          axisLabel: {
            textStyle: {
              color: '#9AAFC2',
              fontStyle: 'normal',
              fontFamily: '微软雅黑',
              fontSize: 14,
            },
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#506B98',
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: ['#fff'],
              opacity: 0.06,
            },
          },
        },
      ],
      series: this.createseries(),
    }
  }

  createseries(){
    return this.option.seriesData.map((item,index) => {
      return {
        name: item.name,
        type: 'bar',
        barWidth: 15,
        barGap: 0.5, //柱间距离
        itemStyle: {
          normal: {
            show: true,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: this.option.color[index],
              },
              {
                offset: 1,
                color: this.option.color1?this.option.color1[index]:'transparent',
              },
            ]),
            opacity: 0.8,
            borderRadius: [5, 5, 0, 0],
          },
        },
        data: item.data,
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

  mounted():void{
    this.initChart();
    this.chartResize();
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
.chart{
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
