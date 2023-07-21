<template>
  <div class="chart" :id="id"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import echarts,{ECharts} from "echarts";
@Component({
  name:"lineChart",
  components:{}
})
export default class lineChart  extends Vue {
  @Prop({required:true})id!:string;
  @Prop({required:true}) option!:{xAxis:string[],seriesData: { name:string,data:number[] }[],color:string[],unitName:string,dataZoom:boolean,start:number,smooth:boolean};

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
      backgroundColor:'',
      color:this.option.color,
      tooltip : {
        show: true,
        trigger: 'axis',
        transitionDuration: 0, //echart防止tooltip的抖动
        axisPointer: {
          type: 'shadow',
        },
      },
      dataZoom: [
        {
          show: this.option.dataZoom,
          type: "inside",
          start:this.option.start,
          end: this.option.xAxis.length > 10 ? 50 : 100,
        },
      ],
      legend:{
        //data，就是取得每个series里面的name属性。
        orient: 'horizontal',
        // icon: 'circle', //图例形状
        padding: 0,
        top: 35,
        right: 40,
        itemWidth: 14, //小圆点宽度
        itemHeight: 14, // 小圆点高度
        itemGap: 21, // 图例每项之间的间隔。[ default: 10 ]横向布局时为水平间隔，纵向布局时为纵向间隔。
        textStyle: {
          fontSize: 14,
          color: '#ffffff',
        },
      },
      grid: {
        top: '20%',
        left: '3%',
        right: '4%',
        bottom: '5%',
        containLabel: true,
      },

      xAxis: {
        show: true, //显示x轴+x轴label文字
        type: 'category',
        boundaryGap: this.option.xAxis.length>5?1:0, //从Y轴出发，这个false很好的
        axisLabel: {
          //坐标轴刻度标签的相关设置。
          interval: this.option.xAxis.length>5?1:0,//设置为 1，表示『隔一个标签显示一个标签』
          //	margin:15,
          textStyle: {
            color: '#9AAFC2',
            fontStyle: 'normal',
            fontFamily: '微软雅黑',
            fontSize: 14,
          },
          rotate: 0,
        },
        axisLine: {
          show: true, //显示x坐标轴轴线
          lineStyle: {
            color: 'rgba(255,255,255,.4)',
          },
        },
        axisTick: {
          show: false, //不显示x坐标1cm刻度
        },
        splitLine: {
          show: false, //不显示grid竖向分割线
        },
        data: this.option.xAxis,
      },
      yAxis: {
        type: 'value',
        name: this.option.unitName || "",
        axisLabel: {
          color: '#ffffff',
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255,255,255,.4)',
          },
        },
        splitNumber: 1,
        splitLine: {
          show: false, //不显示grid水平分割线
        },
      },
      series: this.createseries(),
    }
  }

  commonConfigFn = (index) => {
    return {
      type: 'line',
      smooth: this.option.smooth,//是否平滑
      symbol: 'emptyCircle', //空心小圆点。线条小圆点形状
      symbolSize: 6, //小圆点大小
      itemStyle: {
        //还是小圆点设置
      },

      label: {
        show: false, //不显示小圆点上的label文字
      },
      lineStyle: {
        width: 1, //线条设置

      },

      areaStyle: {
        //填充线条下面的面积区域颜色。（areaStyle只是锦上添花）
        opacity: 0.2,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: this.option.color[index], // 上处的颜色
            },
            {
              offset: 1,
              color: 'transparent', // 下处的颜色
            },
          ],
          global: false, // 缺省为 false
        },
      },
    };
  };

  createseries(){
    //@ts-ignore
    return this.option.seriesData.map((item, index) => ({ ...item, ...this.commonConfigFn(index) }));
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
