import {Component, Prop, Vue} from 'vue-property-decorator';
import {EchartsCom} from '../../../basicCustomComponent';
import Class from './Charts.module.less';
import * as tsx from 'vue-tsx-support';
import {EChartOption} from 'echarts';
import echarts from "echarts/lib/echarts";

export interface yAxisFormat {
  (value: number, index: number): string;
}

interface echartsFormat extends EChartOption.Tooltip.Formatter {
  (arg: string | object): string;
}

export interface detailConfigType {
  xLinexColor?: string;
  xLabelColor?: string;
  yLinexColor?: string;
  yLabelColor?: string;
  dataTitle?: string;
  unit?: string;
  nameTextColor?: string;
  yAxisFormat?: yAxisFormat;
}

export interface GetConfigProps<T> {
  area?: boolean;
  data: Array<T>;
  borderColor?: string;
  backgroundColor?:string;
  extraCssText?:string;
  day?: boolean;
  week?: boolean;
  tooltipFormat?: echartsFormat;
  detailConfig?: detailConfigType;
}


@Component({
  name: 'Charts',
  components: {
    EchartsCom
  }
})
export default class Charts extends Vue {

  _tsx!: tsx.DeclareProps<Pick<Charts, 'className' | 'Config' | 'title'>>

  @Prop() className?: string;
  @Prop() title?: string;
  @Prop() Config?: EChartOption;

  public static getLineConfig: (props: GetConfigProps<[string, number]>) => EChartOption = (props) => {
    const {tooltipFormat, detailConfig, day, week,borderColor,backgroundColor,extraCssText} = props;
    let interval = day ? 1 : 7;
    if(week){
      interval = day? 28:31;
    }
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: backgroundColor,//'#207CFF'
        formatter: tooltipFormat,
        extraCssText: extraCssText,
        axisPointer: {
          lineStyle: {
            color: borderColor //#207CFF
          }
        }
      },
      grid: {
        left: '3%',
        right: '3%',
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLine: {
          show: true,
          lineStyle: {
            color: detailConfig?.xLinexColor,
            width: 0.5,
            type: 'solid'
          },
        },
        axisLabel: {
          fontSize: 10,
          color: detailConfig?.xLabelColor,
          // interval: /* day ? 2 : 24, */ interval,
          //interval: auto,
          showMaxLabel: true,
          formatter: (value, index) => value.split(' ')[0]
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: detailConfig?.xLinexColor,
            width: 1,
            type: 'solid'
          },
        }
      },
      yAxis: {
        type: 'value',
        name: detailConfig?.unit,
        nameTextStyle: {
          color: detailConfig?.nameTextColor || '#666666'
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: detailConfig?.yLinexColor,
            width: 0.5,
            type: 'solid'
          },
        },
        axisTick: {
          inside: true
        },
        axisLabel: {
          margin: 2,
          fontSize: 10,
          color: detailConfig?.yLabelColor,
          formatter: detailConfig?.yAxisFormat,
        },
        splitLine: {
          lineStyle: {
            color: detailConfig?.yLinexColor,
          }
        },
      },
      // visualMap: {
      //   type: 'piecewise',
      //   show: false,
      //   dimension: 0,
      //   seriesIndex: 0,
      // },
      series: [
        {
          type: 'line',
          smooth: 0.6,
          backgroundColor: backgroundColor,//'#207CFF'
          symbol: 'circle',
          symbolSize:8,
          itemStyle:{
            normal:{
              color:backgroundColor,
              borderColor:'#FFFFFF',
              borderWidth:2
            }
          },
          lineStyle: {
            color: borderColor, //'#207CFF'
            width: 3
          },
          areaStyle: props.area ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(32, 124, 255, 0.34)'
            }, {
              offset: 1,
              color: 'rgba(32, 124, 255, 0)'
            }])
          } : undefined,
          data: props.data,
        }
      ]
    }
  }

  render() {
    const {className, Config, title} = this.$props;
    return (
      <article class={`${Class.main} ${className ?? ''}`}>
        <nav>
          <span>{title}</span>
          <div>长江航道水位环比统计图</div>
        </nav>
        <section>
          <EchartsCom wrapperClass={Class.echarts} config={Config}/>
        </section>
      </article>
    );
  }
}
