<template>
  <div>
    <div class="video_title">
      <div @click="toprev">＜</div>
      <div>{{ videoName }}</div>
      <div class="jietu" @click="toImages">截图处理</div>
    </div>
    <div class="index2">
      <video
        v-if="type!=='iOS'"
        autoplay
        loop
        controls
        :id="vid"></video>
      <iframe
        v-else
        :src="this.$route.query.url"
        frameborder="0"
        id="mainIframe"
        style="width: 100%;height: 200px"></iframe>
      <canvas
        style="position: absolute; top: 57px; z-index: -1"
        ref="imageWrapper"
        id="myCanvas"
      >
      </canvas>
    </div>
    <div class="yuntai" v-if="consoleControl">
      <div class="fangxiang">
        <div class="shang">
          <img @click="shang" src="./img/shang.png" alt=""/>
        </div>
        <div class="yuntaizy">
          <img @click="zuo" src="./img/zuo.png" alt=""/>
          <img @click="you" src="./img/you.png" alt=""/>
        </div>
        <div class="yuntaixia">
          <img @click="xia" src="./img/xia.png" alt=""/>
        </div>
      </div>
      <div class="yuntaijj">
        <img @click="enlarge" src="./img/jia.png" alt=""/>
        <img @click="narrow" src="./img/jian.png" alt=""/>
      </div>
    </div>
    <van-overlay :show="loadingShow">
      <van-loading
        v-if="loadingShow"
        type="spinner"
        textColor="#0094ff"
        color="#0094ff"
        size="40px"
        vertical
        style="position: fixed;top:43vh;left:40vw">正在截屏中
      </van-loading>
    </van-overlay>

  </div>
</template>

<script>
import Hls from "hls.js";
import FlvJs from "flv.js";
import html2canvas from "html2canvas";
import {getUpdateImage, getPtzStart, getPtzStop} from "../service/index.js";
import {Overlay, Loading, Toast} from 'vant';
import axios from "axios";
import env from "@/config/env";

export default {
  data() {
    return {
      imgUrls: null,
      imgUrl: "",
      projectCode: "",
      vid: "",
      videoName: "",
      token: "",
      sn: "",
      channel: "",
      consoleControl: 0,
      loadingShow: false,
      type: '',
      videoUrl: ''
    };
  },
  // eslint-disable-next-line vue/no-unused-components
  components: {VanLoading: Loading, VanOverlay: Overlay, Toast},
  inject: ["projectConfig"],
  mounted() {
    this.type = this.getOSType();
    this.vid = this.$route.query.id;
    this.videoName = this.$route.query.name;
    this.token = this.$route.query.token
    this.channel = this.$route.query.channel
    this.sn = this.$route.query.sn
    this.consoleControl = Number(this.$route.query.consoleControl)
    this.projectCode = `${env.project}`;
    clearInterval();
    this.$nextTick(() => {
      this.playFLV();
    });
    setTimeout(() => {
      const v = document.getElementById(this.vid);
      const c = document.getElementById("myCanvas");
      const ctx = c.getContext("2d");
      const w = parseInt(window.getComputedStyle(v).width);
      const h = parseInt(window.getComputedStyle(v).height);
      c.width = w * 4;
      c.height = h * 7;
      c.style.width = w + "px";
      c.style.height = h + "px";
      ctx.scale(5, 8);
      v.addEventListener(
        "play",
        function () {
          const i = window.setInterval(function () {
            ctx.drawImage(v, 0, 0, 371, 200);
          }, 20);
        },
        false
      );
      v.addEventListener(
        "pause",
        function () {
          window.clearInterval(i);
        },
        false
      );
      v.addEventListener(
        "ended",
        function () {
          clearInterval(i);
        },
        false
      );
    }, 500);
  },
  methods: {
    getOSType() {
      if ('Android' === navigator.platform) {
        return 'Android'
      } else if ('iPhone' === navigator.platform || 'iPod' === navigator.platform || 'iPad' === navigator.platform) {
        // this.videoUrl=`https://standard.wisdombim.com.cn/ys7`+this.$route.query.url.split(`https://open.ys7.com/v3/openlive`)[1]
        return 'iOS'
      }
    },
    //操作命令：0-上，1-下，2-左，3-右，4-左上，5-左下，6-右上，7-右下，8-放大，9-缩小，10-近焦距，11-远焦距
    //云台速度：0-慢，1-适中，2-快
    shang() {
      if (this.token) {
        getPtzStart(this.token, this.sn, this.channel, 0, 0).then((res) => {
          console.log(res);
        });
        setTimeout(() => {
          getPtzStop(this.token, this.sn, this.channel, 0).then((res) => {
            console.log(res);
          });
        }, 800);
      } else {
        this.$message.warn("无token，暂不支持");
      }
    },

    zuo() {
      if (this.token) {
        getPtzStart(this.token, this.sn, this.channel, 2, 0).then((res) => {
          console.log(res);
        });
        setTimeout(() => {
          getPtzStop(this.token, this.sn, this.channel, 2).then((res) => {
            console.log(res);
          });
        }, 800);
      } else {
        this.$message.warn("无token，暂不支持");
      }
    },

    you() {
      if (this.token) {
        getPtzStart(this.token, this.sn, this.channel, 3, 0).then((res) => {
          console.log(res);
        });
        setTimeout(() => {
          getPtzStop(this.token, this.sn, this.channel, 3).then((res) => {
            console.log(res);
          });
        }, 800);
      } else {
        this.$message.warn("无token，暂不支持");
      }
    },

    xia() {
      if (this.token) {
        getPtzStart(this.token, this.sn, this.channel, 1, 0).then((res) => {
          console.log(res);
        });
        setTimeout(() => {
          getPtzStop(this.token, this.sn, this.channel, 1).then((res) => {
            console.log(res);
          });
        }, 800);
      } else {
        this.$message.warn("无token，暂不支持");
      }
    },

    enlarge() {
      if (this.token) {
        getPtzStart(this.token, this.sn, this.channel, 8, 0).then((res) => {
          console.log(res);
        });
        setTimeout(() => {
          getPtzStop(this.token, this.sn, this.channel, 8).then((res) => {
            console.log(res);
          });
        }, 800);
      } else {
        this.$message.warn("无token，暂不支持");
      }
    },

    narrow() {
      if (this.token) {
        getPtzStart(this.token, this.sn, this.channel, 9, 0).then((res) => {
          console.log(res);
        });
        setTimeout(() => {
          getPtzStop(this.token, this.sn, this.channel, 9).then((res) => {
            console.log(res);
          });
        }, 800);
      } else {
        this.$message.warn("无token，暂不支持");
      }
    },

    toprev() {
      this.$router.push({
        name: "VideoSurveillance"
      })
    },

    toImages() {
      sessionStorage.removeItem("base64");
      this.loadingShow = true;
      axios
        .get(`${env.apiHost}/` + "api/video/getVideoCapture", {
          params: {
            accessToken: this.$route.query.token,
            deviceSerial: this.$route.query.sn,
            channelNo: this.$route.query.channel,
          },
        })
        .then((res) => {
          if (res.errcode === 0 && res.data) {
            sessionStorage.setItem("base64", res.data);
            this.$router.push({
              name: "form-detail",
              query: {
                // img: this.imgUrls,
                schemaCode: this.projectCode + "_video_problem",
                startWorkflowCode: this.projectCode + "_video_problem",
                return: `${this.$route.fullPath}&iframeAction=add`,
                projectName: this.projectConfig?.projectName,
                type: "Video",
                iframeAction: 'add'
              },
            })
          } else {
            this.loadingShow = false;
            if (this.type !== 'iOS') {
              html2canvas(this.$refs.imageWrapper).then((canvas) => {
                console.log('canvas', canvas)
                const dataURL = canvas.toDataURL("image/png");
                this.imgUrls = dataURL;
                sessionStorage.setItem("base64", this.imgUrls);
                this.$router.push({
                  name: "form-detail",
                  query: {
                    // img: this.imgUrls,
                    schemaCode: this.projectCode + "_video_problem",
                    startWorkflowCode: this.projectCode + "_video_problem",
                    return: `${this.$route.fullPath}&iframeAction=add`,
                    projectName: this.projectConfig?.projectName,
                    type: "Video",
                    iframeAction: 'add'
                  },
                });
              });
            } else {
              Toast('截屏失败');
            }
          }
        })
      // }
    },
    playFLV() {
      const v = this.$route.query;
      if (Hls.isSupported()) {
        var video = document.getElementById(v.id);
        var hls = new Hls();
        hls.loadSource(v.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          // video.load();
          video.play();
        });
      }
    },
    fullScreen() {
      if (Math.abs(window.orientation) === 90) {
        const videoEle = document.getElementsByClassName('video')[0]
        if (videoEle.requestFullscreen) {
          console.log(videoEle, 'videoEle')
          videoEle.requestFullscreen();
        } else if (videoEle.msRequestFullscreen) {
          videoEle.msRequestFullscreen();
        } else if (videoEle.mozRequestFullScreen) {
          videoEle.mozRequestFullScreen();
        } else if (videoEle.webkitRequestFullScreen) {
          videoEle.webkitRequestFullScreen();
        }
      } else {
        this.exitFullscreen();
      }
    },
    exitFullscreen() {
      if (document.exitFullScreen) {
        document.exitFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (element.msExitFullscreen) {
        element.msExitFullscreen();
      }
    }
  },
  beforeDestroy() {
    window.stop()
  },
  watch: {
    imgUrls(val) {
      if (val) {
        this.loadingShow = false
      }
    }
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
}

.index2 {
  width: 100%;
  height: calc(100% - 40px);
  background: #000;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .jietu {
    color: #fff;
    font-size: 14px;
  }

  img {
    width: 100%;
    height: 200px;
  }
}

video {
  width: 100%;
  height: 225px;
}

.yuntai {
  position: absolute;
  bottom: 10%;
  right: 32%;
  width: 125px;
  height: 160px;
  padding: 10px;
  text-align: center;

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

