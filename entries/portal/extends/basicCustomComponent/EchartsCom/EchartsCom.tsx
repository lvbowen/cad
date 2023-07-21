import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { EChartOption, ECharts } from 'echarts';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';

interface EchartsComputed {
  echartsInstance: ECharts;
  config: EChartOption;
}

@Component( {
  name: 'EchartsCom'
} )
export default class EchartsCom extends Vue {

  _tsx!: tsx.DeclareProps<Pick<EchartsCom, 'wrapperClass' | 'config'>>

  @Prop()
  public wrapperClass?: string;
  @Prop()
  public config?: EChartOption;

  private echartsInstance: ECharts | null = null;
  private echartsResize: EventListenerOrEventListenerObject | null = null;
  private echartsContainerInstance: HTMLElement | null = null;

  private get echartsConfig() {
    const { echartsInstance, $props } = this, { config } = $props;
    return { echartsInstance, config }
  }

  @Watch( 'echartsContainerInstance', { immediate: true } )
  domInstanceListener( instance ) {
    if ( instance ) {
      this.echartsInstance = echarts.init( instance, undefined, { devicePixelRatio: window.devicePixelRatio } );
      this.echartsResize = () => this.echartsInstance?.resize();
      window.addEventListener( 'resize', this.echartsResize );
    } else {
      window.removeEventListener( 'resize', (this.echartsResize as EventListenerOrEventListenerObject) );
    }
  }

  @Watch( 'echartsConfig' )
  echartsConfigListener( computed: EchartsComputed ) {
    const { echartsInstance, config } = computed;
    if ( echartsInstance && config ) echartsInstance.setOption( config );
  }

  mounted() {
    if ( this.$refs.instance ) {
      this.echartsContainerInstance = (this.$refs.instance as HTMLElement);
    }
  }

  render() {
    const { wrapperClass } = this.$props;
    return <div class={ wrapperClass } ref={ 'instance' }/>
  }
}
