<template>
  <div>
    <div class="video_title">
      <div @click="toprev">＜</div>
      <div>{{ videoData.name }}</div>
      <div class="jietu" @click="toImages">截图处理</div>
    </div>
    <div class="main">
      <pull-refresh v-model="refreshing" @refresh="onRefresh">
        <LivePlayer
          class="live_player"
          :videoUrl="videoData.url"
          autoplay
          live
          controls
          stretch
          :fluent="false"
          :showCustomButton="true"
          :hideSnapshotButton="true"
          :hideFluentButton="false"
        ></LivePlayer>
      </pull-refresh>
    </div>
    <div class="yuntai" v-show="consoleControl">
      <div class="fangxiang">
        <div class="shang">
          <img
            @mousedown="controlVideo('up')"
            @mouseup="controlVideo('stop')"
            src="./img/shang.png"
            alt=""/>
        </div>
        <div class="yuntaizy">
          <img
            @mousedown="controlVideo('left')"
            @mouseup="controlVideo('stop')"
            src="./img/zuo.png"
            alt=""/>
          <img
            @mousedown="controlVideo('right')"
            @mouseup="controlVideo('stop')"
            src="./img/you.png"
            alt=""/>
        </div>
        <div class="yuntaixia">
          <img
            @mousedown="controlVideo('down')"
            @mouseup="controlVideo('stop')"
            src="./img/xia.png"
            alt=""/>
        </div>
      </div>
      <div class="yuntaijj">
        <img
          @mousedown="controlVideo('zoomin')"
          @mouseup="controlVideo('stop')"
          src="./img/jia.png"
          alt=""/>
        <img
          @mousedown="controlVideo('zoomout')"
          @mouseup="controlVideo('stop')"
          src="./img/jian.png"
          alt=""/>
      </div>
    </div>
    <Overlay :show="loadingShow">
      <Loading
        v-if="loadingShow"
        type="spinner"
        textColor="#0094ff"
        color="#0094ff"
        size="40px"
        vertical
        style="position: fixed;top:43vh;left:40vw">正在截屏中
      </Loading>
    </Overlay>
  </div>
</template>

<script lang="ts">
import {Component, Vue, InjectReactive} from "vue-property-decorator";
import {PullRefresh, Toast,Overlay,Loading} from "vant";
import LivePlayer from '@liveqing/liveplayer';
import * as Api from "../../service/api";
import * as Type from "../../type";

//@ts-ignore
@Component({
  name: "QingShi",
  components: {
    PullRefresh, LivePlayer, Toast,Overlay,Loading
  },
})
export default class QingShi extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive("project") projectCode;

  page: number = 1;
  size: number = 6;
  refreshing: boolean = false;
  loadingShow: boolean = false;
  consoleControl: boolean = false;
  type: string = 'Android';
  videoData: { [propsName: string]: string } = {};

  mounted() {
    console.log('consoleControl', this.$route.query)
    this.type = this.getOSType();
    this.startQingVideo();
  }

  controlVideo(direction) {
    const nowTime:string = String(Math.round(Number(new Date())))
    Api.videoControlQingVideo({
      deviceId: String(this.$route.query.deviceId ?? ""),
      channelId: String(this.$route.query.channelId ?? ''),
      command: direction,
      _:nowTime
    }).then(res => {
    })
  }

  getOSType() {
    // if ('Android' === navigator.platform) {
    //   return 'Android'
    // } else
    if ('iPhone' === navigator.platform || 'iPod' === navigator.platform || 'iPad' === navigator.platform) {
      return 'iOS'
    } else {
      return 'Android'
    }
  }


  onRefresh() {
    // 清空列表数据
    // this.refreshing = false;
    this.startQingVideo()
  }

  startQingVideo() {
    Api.startQingVideo({
      serial: String(this.$route.query?.deviceId ?? ''),
      code: String(this.$route.query?.channelId ?? '')
    }).then(res => {
      if (Object.keys(res).length === 0) return Toast.fail('设备已离线')
      this.videoData = {
        id: res.DeviceID ?? '',
        name: String(this.$route.query.channelName ?? ''),
        channelID: res.ChannelID ?? '',
        url: this.type=='Android' ? `https://standard.wisdombim.com.cn/api/QingLive/sms/${res.FLV.split('/sms/')[1]}` :`https://standard.wisdombim.com.cn/api/QingLive/sms/${res.HLS.split('/sms/')[1]}`,
      };
      this.consoleControl = Number(this.$route.query.consoleControl) !== 0;
    })
  }

  toImages() {
    this.loadingShow = true;
    sessionStorage.removeItem("base64");
    Api.getChannelSnapQingVideo({
      deviceId: String(this.$route.query?.deviceId ?? ''),
      channelId: String(this.$route.query?.channelId ?? '')
    }).then(res => {
      if (res.errcode === 0 && res.data) {
        sessionStorage.setItem("base64", res.data);
        this.$router.push({
          name: "form-detail",
          query: {
            schemaCode: this.projectCode + "_video_problem",
            startWorkflowCode: this.projectCode + "_video_problem",
            return: `${this.$route.fullPath}&iframeAction=add`,
            projectName: this.projectConfig?.projectName,
            type: "Video",
            iframeAction: 'add'
          },
        })
      } else {
        Toast.fail('截屏失败');
        this.loadingShow = false;
      }
    })
  }

  toprev() {
    this.$router.push({
      name: 'VideoSurveillance'
    })
  }
};
</script>

<style lang="less" scoped>
.video_title {
  height: 40px;
  line-height: 40px;
  background: #0e79ed;
  display: flex;
  justify-content: space-between;

  div:nth-child(3) {
    padding-right: 10px;
  }

  div {
    color: #fff;
    font-size: 14px;
    font-weight: 700;
  }

  div:nth-child(1) {
    padding-left: 10px;
    width: 10%;
    font-size: 20px;
  }
  div:nth-child(2) {
    position: absolute;
    transform:translate(-50%,0);
    left: 50%;    //起始是在body中，横向距左50%的位置
    //top:70%;
  }
}

.main {
  height: calc(100vh - 95px);
  overflow: auto;
  width: 100%;
  background: #000;

  .live_player {
    margin-top: 20vh;
  }
}
.yuntai {
  position: absolute;
  transform:translate(-50%,-50%);
  left: 50%;    //起始是在body中，横向距左50%的位置
  top:70%;
  width: 125px;
  height: 160px;
  padding: 10px;

  .fangxiang {
    background: url("./img/bg.png");
    background-size: 100% 100%;
    height: 100px;
    margin-bottom: 10px;

    .shang {
      margin-bottom: 21px;
      padding-top: 7px;
    }
  }

  .yuntaizy {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    margin-bottom: 20px;
  }

  .yuntaixia {
    margin-bottom: 10px;
  }

  .yuntaijj {
    img {
      margin: 0 10px;
      width: 24px;
    }
  }
}
</style>
