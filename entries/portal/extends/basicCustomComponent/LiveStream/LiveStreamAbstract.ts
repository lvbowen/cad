import { Prop, Vue } from 'vue-property-decorator';
import { LiveStreamComponent } from "../../type";
import * as tsx from 'vue-tsx-support';
import FlvJs from 'flv.js';


export default abstract class LiveStreamAbstract extends Vue implements LiveStreamComponent {

  _tsx!: tsx.DeclareProps<Pick<LiveStreamAbstract, 'autoPlay' | 'streamUrl' | 'streamType'>>

  @Prop() autoPlay!: boolean;

  @Prop() streamUrl!: string;

  @Prop() streamType?: string = 'flv';

  @Prop() projectId?: string;

  @Prop() appCode?: string;

  player?: FlvJs.Player;

  protected streamElement?: HTMLVideoElement;

  protected playerInit(): FlvJs.Player | undefined {
    if (this.streamElement && FlvJs.isSupported()) {
      const { streamType, streamUrl, streamElement } = this;
      const flvPlayer = FlvJs.createPlayer({
        type: streamType ?? 'flv',
        url: streamUrl
      });
      flvPlayer.attachMediaElement(streamElement);
      this.player = flvPlayer;
      return flvPlayer;
    }
  }

  abstract play(): void;

  abstract pause(): void;

  abstract init(): void;

  abstract destroy():void;

  abstract render(): VueTsxSupport.JSX.Element;

}
