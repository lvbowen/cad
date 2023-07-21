import { Component, Prop, Vue } from 'vue-property-decorator';
import Class from './qualityModule.module.less';

@Component( {
  name: 'QualityProgress'
} )
export default class QualityProgress<T> extends Vue {

  @Prop() source?: any;

  @Prop() job?: Promise<any>;

  @Prop() success?: Function;

  @Prop() fail?: Function;

  private progress: number = 0;

  private timer: number | null = null;

  mounted() {
    const { source, progress, success } = this;
    console.log( 'inProgress===>', source );

    if ( source.others.job ) {
      source.others.job( source.others.data ).then( () => {
        this.progress = 100;
        this.success?.( source );
      } ).catch( error => {
        clearInterval( this.timer as number );
        this.fail?.( source.others.data, error );
      } )
    }

    this.timer = setInterval( () => {
      if ( this.progress === 100 ) {
        clearInterval( this.timer as number );
      } else {
        this.progress++;
      }
    }, 1000 );
  }

  render() {
    const { source, progress } = this;
    return (
      <div class={ Class.progressContainer }>
        <span>{ source.others.data.name }</span>
        <main class={ Class.progressBgBar }>
          <div class={ Class.progressBar } style={ { width: `${ progress }%` } }/>
        </main>
        <span>{ progress }%</span>
      </div>
    );
  }

}
