import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { EChartOption, ECharts } from 'echarts';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';

interface yAxisFormat {
    ( value: number, index: number ): string;
}

interface echartsFormat extends EChartOption.Tooltip.Formatter {
    ( arg: string | object ): string;
}

interface detailConfigType {
    xLinexColor?: string;
    xLabelColor?: string;
    yLinexColor?: string;
    yLabelColor?: string;
    dataTitle?: string;
    unit?: string;
    nameTextColor?: string;
    yAxisFormat?: yAxisFormat;
}

interface EchartsComputed {
    echartsInstance: ECharts;
    config: EChartOption;
}

interface ConfigProps<T> {
    area?: boolean;
    data: Array<T>;
    borderColor?: string;
    backgroundColor?: string;
    centerLabelColor?: string;
    extraCssText?: string;
    day?: boolean;
    week?: boolean;
    tooltipFormat?: echartsFormat;
    labelFormat?: echartsFormat;
    labelColor?: string;
    lineColor?: string;
    detailConfig?: detailConfigType;
    legendList?: Array<string>;
    legendX?: 'left' | 'center' | 'right';
    legendY?: 'top' | 'center' | 'bottom';
    legendAlign?: 'left' | 'auto' | 'right';
    pieTop?: number | string;
    legendTop?: string;
    itemWidth?: number | string;
    itemHeight?: number | string;
    itemGap?: number | string;
    orient?: 'horizontal' | 'vertical';
    textStyle?: EChartOption.TextStyle;

}

interface PieConfig<T> extends ConfigProps<T> {
    pieCenterData?: Array<{ value: number, name: string }>;
}

@Component( {
    name: 'Charts'
} )
export default class Charts<T> extends Vue {

    public _tsx!: tsx.DeclareProps<Pick<Charts<T>, 'wrapperClass' | 'config'>>;

    @Prop()
    public wrapperClass?: string;

    @Prop()
    public config?: EChartOption;

    private echartsInstance: ECharts | null = null;

    //EventListenerOrEventListenerObject
    public echartsResize: (() => void) | null = null;

    private echartsContainerInstance: HTMLElement | null = null;

    private time: number = 0;

    private timer: any = null;

    public static getLineConfig: ( lineProps: ConfigProps<any> ) => EChartOption = lineProps => {
        let interval = lineProps.day ? 1 : 7;
        if ( lineProps.week ) interval = lineProps.day ? 28 : 31;
        return {
            tooltip: {
                trigger: 'axis',
                backgroundColor: lineProps.backgroundColor,//'#207CFF'
                formatter: lineProps.tooltipFormat,
                extraCssText: lineProps.extraCssText,
                axisPointer: {
                    lineStyle: {
                        color: lineProps.borderColor //#207CFF
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
                        color: lineProps.detailConfig?.xLinexColor,
                        width: 0.5,
                        type: 'solid'
                    },
                },
                axisLabel: {
                    fontSize: 10,
                    color: lineProps.detailConfig?.xLabelColor,
                    // interval: /* day ? 2 : 24, */ interval,
                    //interval: auto,
                    showMaxLabel: true,
                    formatter: ( value, index ) => value.split( ' ' )[0]
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: lineProps.detailConfig?.xLinexColor,
                        width: 1,
                        type: 'solid'
                    },
                }
            },
            yAxis: {
                type: 'value',
                name: lineProps.detailConfig?.unit,
                nameTextStyle: {
                    color: lineProps.detailConfig?.nameTextColor || '#666666'
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: lineProps.detailConfig?.yLinexColor,
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
                    color: lineProps.detailConfig?.yLabelColor,
                    formatter: lineProps.detailConfig?.yAxisFormat,
                },
                splitLine: {
                    lineStyle: {
                        color: lineProps.detailConfig?.yLinexColor,
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
                    backgroundColor: lineProps.backgroundColor,//'#207CFF'
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: {
                        normal: {
                            color: lineProps.backgroundColor,
                            borderColor: '#FFFFFF',
                            borderWidth: 2
                        }
                    },
                    lineStyle: {
                        color: lineProps.borderColor, //'#207CFF'
                        width: 3
                    },
                    areaStyle: lineProps.area ? {
                        color: new echarts.graphic.LinearGradient( 0, 0, 0, 1, [ {
                            offset: 0,
                            color: 'rgba(32, 124, 255, 0.34)'
                        }, {
                            offset: 1,
                            color: 'rgba(32, 124, 255, 0)'
                        } ] )
                    } : undefined,
                    data: lineProps.data,
                }
            ]
        }
    }

    public static getPieConfig: ( pieProps: PieConfig<any> ) => EChartOption = pieProps => {
        return {
            legend: {
                x: pieProps.legendX || 'center',
                y: pieProps.legendY || 'bottom',
                top: pieProps.legendTop || '80%',
                orient: pieProps.orient || undefined,
                align: pieProps.legendAlign || 'auto',
                icon: 'circle',
                data: pieProps.legendList,
                textStyle: pieProps.textStyle || undefined
            },
            color: [ '#333333', '#ffa045', '#41cafc', '#00be62' ],
            series: [
                {
                    type: 'pie',
                    hoverAnimation: false,
                    center: [ '50%', '40%' ],
                    radius: [ 0, 0 ],
                    top: -200,
                    label: {
                        position: 'center',
                        fontSize: 36,
                        color: pieProps.centerLabelColor || '#333333'
                    },
                    labelLine: {
                        show: false
                    },
                    data: pieProps.pieCenterData
                },
                {
                    type: 'pie',
                    center: [ '50%', '40%' ],
                    radius: [ '40%', '60%' ],
                    top: pieProps.pieTop || -200,
                    bottom: 100,
                    label: {
                        alignTo: 'center',
                        color: pieProps.labelColor || '#333333',
                        formatter: pieProps.labelFormat
                    },
                    labelLine: {
                        length: 5,
                        length2: 4,
                        lineStyle: {
                            color: pieProps.lineColor || '#333333'
                        }
                    },
                    data: pieProps.data
                }
            ]
        }
    }

    private get echartsConfig() {

        const { echartsInstance, $props } = this, { config } = $props;

        return { echartsInstance, config }
    }

    @Watch( 'echartsContainerInstance', { immediate: true } )
    private domInstanceListener( instance ) {
        if ( instance ) {
            this.echartsInstance = echarts.init( instance, undefined, {
                devicePixelRatio: window.devicePixelRatio
            } );
            this.echartsResize = () => this.echartsInstance?.resize();
            window.addEventListener( 'resize', this.echartsResize );
        } else {
            window.removeEventListener( 'resize', (this.echartsResize as EventListenerOrEventListenerObject) );
        }
    }

    @Watch( 'echartsConfig' )
    private echartsConfigListener( computed: EchartsComputed ) {
        const { echartsInstance, config } = computed;
        if ( echartsInstance && config ) {
            echartsInstance.setOption( config );
            // eslint-disable-next-line no-shadow
            echartsInstance.on('click',(echartsInstance)=> {
                this.time = 0;
                this.timer = setInterval(()=> {
                    if(this.time === 0.2) {
                        clearInterval(this.timer)
                        this.$emit('clickPart',echartsInstance);
                    }
                    this.time+=0.2;
                },200)
            })
        };
    }

    public mounted() {
        if ( this.$refs.instance ) {
            this.echartsContainerInstance = (this.$refs.instance as HTMLElement);
        }
    }

    public destroyed() {
        const { echartsResize } = this;
        if ( echartsResize ) window.removeEventListener( 'resize', echartsResize );
    }

    render() {
        const { wrapperClass } = this;
        return <div class={ wrapperClass } ref={ 'instance' }/>
    }
}