import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import { LiveStreamComponent } from "../../type";
import LiveStreamAbstract from "./LiveStreamAbstract";

@Component({
  name: 'LiveStream'
})
export default class LiveStream extends LiveStreamAbstract {

  @Ref() streamElement?: HTMLVideoElement;

  @Prop() streamType?: string;

  @Prop() streamUrl!: string;

  @Prop() projectId?: string;

  @Prop() appCode?: string;

  get videoSourcesUpdate():boolean{
    const {streamType,streamUrl} = this;
    return !!(streamType && streamUrl);
  }

  @Watch('videoSourcesUpdate')
  videoSourcesUpdateListener(){
    super.playerInit();
    this.init();
  }

  player?: LiveStreamComponent['player'];

  init(): void {
    this.player?.load();
  }

  pause(): void {
    this.player?.pause();
  }

  play(): void {
    this.player?.play();
  }

  destroy(): void {
    console.log('this.player',this.player);
    this.player?.destroy();
  }

  mounted() {
    super.playerInit();
    this.init();
    this.pause();
  }

  render() {
    return (
      <article>
        <video ref={'streamElement'} class="centeredVideo" controls autoplay>
          Your browser is too old which doesn't support HTML5 video.
        </video>
      </article>
    );
  }


}
