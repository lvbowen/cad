<template>
  <div class="PanoramicView" :style="{ width: PanoramicViewShow ? '87%' : '' }">
    <span class="btn" :style="{background: PanoramicViewShow?'rgba(21, 132, 255, 0.5)':'rgba(21, 132, 255, 0.1)'}" @click="btnCLick">{{ PanoramicViewShow?'视频矩阵':'全景视图' }}</span>
    <div v-if="PanoramicViewShow" style="width: 100%; height: 100%">
      <img class="imgBg" :src="bgImg" alt="" />
      <div v-for="(item, index) in markedEquipment" :key="index" class="imgMonitor">
        <drag-resize
          :isDraggable="isDragClick"
          :x="item.width || 1 + index * 100"
          :y="item.height || 20"
          @clicked="openDeviceDialog(item)"
          @dragging="dragging"
          @dragstop="(e) => dragstop(e, item)"
        >
          <img @click="ImgClick(item)" src="../img/NUTRISK.png" alt="" />
          <p>{{ type == 0 ? item.name : item.channelName }}</p>
        </drag-resize>
      </div>
      <div>
        <a-modal v-model="MonitorShow" :footer="null" wrapClassName="deviceModal">
          <video
            v-if="type == 0"
            class="videos"
            autoplay
            loop
            controls
            muted
            :id="id"></video>
          <div v-if="type == 1" class="videos">
            <img v-if="deviceState == 0 " :alt="liXian" :src="liXian"/>
            <img v-else-if="isErr" :alt="netErr" :src="netErr"/>
            <img v-else-if="!isStart" :src="loading" :alt="loading"/>
            <LivePlayer
              v-if="deviceState == 1 && isStart"
              :videoUrl="videoQingUrl"
              :poster="loading"
              autoplay
              live
              controls
              stretch
              :fluent="false"
              :showCustomButton="true"
              :hideFluentButton="false"
            ></LivePlayer>
          </div>
          <div class="yuntai" v-if="type == 0">
            <div class="fangxiang">
              <div class="shang">
                <img @click="shang()" src="../img/shang.png" alt="" />
              </div>
              <div class="yuntaizy">
                <img @click="zuo()" src="../img/zuo.png" alt="" />
                <img @click="you()" src="../img/you.png" alt="" />
              </div>
              <div class="yuntaixia">
                <img @click="xia()" src="../img/xia.png" alt="" />
              </div>
            </div>
            <div class="yuntaijj">
              <img @click="enlarge()" src="../img/jia.png" alt="" />
              <img @click="narrow()" src="../img/jian.png" alt="" />
            </div>
          </div>
          <div class="yuntai" v-if="type == 1&&consoleControl == 1">
            <div class="fangxiang">
              <div class="shang">
                <img @click="controlVideo('up',videoDataVal)" src="../img/shang.png" alt=""/>
              </div>
              <div class="yuntaizy">
                <img
                  @mousedown="controlVideo('left',videoDataVal)"
                  @mouseup="controlVideo('stop',videoDataVal)"
                  src="../img/zuo.png"
                  alt=""/>
                <img
                  @mousedown="controlVideo('right',videoDataVal)"
                  @mouseup="controlVideo('stop',videoDataVal)"
                  src="../img/you.png"
                  alt=""/>
              </div>
              <div class="yuntaixia">
                <img
                  @mousedown="controlVideo('down',videoDataVal)"
                  @mouseup="controlVideo('stop',videoDataVal)"
                  src="../img/xia.png"
                  alt=""/>
              </div>
            </div>
            <div class="yuntaijj">
              <img
                @mousedown="controlVideo('zoomin',videoDataVal)"
                @mouseup="controlVideo('stop',videoDataVal)"
                src="../img/jia.png"
                alt=""/>
              <img
                alt=""
                src="../img/jian.png"
                @mousedown="controlVideo('zoomout',videoDataVal)"
                @mouseup="controlVideo('stop',videoDataVal)"/>
            </div>
          </div>
          <div class="yuntai" v-if="type == 1&&consoleControl == 1">
            <div class="fangxiang">
              <div class="shang">
                <img @click="controlVideo('up',videoDataVal)" src="../img/shang.png" alt=""/>
              </div>
              <div class="yuntaizy">
                <img
                  @mousedown="controlVideo('left',videoDataVal)"
                  @mouseup="controlVideo('stop',videoDataVal)"
                  src="../img/zuo.png"
                  alt=""/>
                <img
                  @mousedown="controlVideo('right',videoDataVal)"
                  @mouseup="controlVideo('stop',videoDataVal)"
                  src="../img/you.png"
                  alt=""/>
              </div>
              <div class="yuntaixia">
                <img
                  @mousedown="controlVideo('down',videoDataVal)"
                  @mouseup="controlVideo('stop',videoDataVal)"
                  src="../img/xia.png"
                  alt=""/>
              </div>
            </div>
            <div class="yuntaijj">
              <img
                @mousedown="controlVideo('zoomin',videoDataVal)"
                @mouseup="controlVideo('stop',videoDataVal)"
                src="../img/jia.png"
                alt=""/>
              <img
                alt=""
                src="../img/jian.png"
                @mousedown="controlVideo('zoomout',videoDataVal)"
                @mouseup="controlVideo('stop',videoDataVal)"/>
            </div>
          </div>
        </a-modal>
      </div>
      <div class="dragBtn" @click="dragClick" v-if="canDrag">
        {{ dragTitle }}
      </div>
    </div>
  </div>
</template>

<script>
import DragResize from "vue-drag-resize";
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import * as Api from "../../../service/api";
import FlvJs from "flv.js";
import env from "@/config/env";
import img1 from "../img/bg-device.png";
import LivePlayer from "@liveqing/liveplayer";
import loading from '../img/loading.jpg';
import netErr from '../img/netUnstable.png';
import liXian from '../img/lixian.png';

import {
  getBackGround,
  getdeviceDetails,
  getPtzStart,
  getPtzStop,
  getQingupdateDevice,
  getupdateDevice,
} from "../index.js";

export default {
  components: {
    DragResize,
    AModal: Modal,
    LivePlayer,
  },
  props: {
    projectval: Object,
  },
  data() {
    return {
      selectValue: {},
      id: "",
      type: "",
      projectName: "",
      img1: img1,
      bgImg: "",
      current: 1,
      size: 1,
      MonitorShow: false,
      isMonitorShow: true,
      PanoramicViewShow: false,
      switchMark: false,
      isDragging: false,
      isDragClick: false,
      isStart: false,
      isErr: false,
      projectCode: "",
      markedEquipment: [],
      videoData: {},
      videoQingUrl: "",
      dragTitle: "设备拖动",
      loading: loading,
      liXian: liXian,
      netErr: netErr,
      deviceState: 0,
      videoDataVal: "",
      consoleControl: 0,
      canDrag:false,
    };
  },
  methods: {
    startVideo(serial, code) {
      Api.startQingVideo({ serial: serial, code: code }).then((res) => {
        if (typeof res == "object") {
          this.isStart = true
          this.videoQingUrl = res.FLV? `https://standard.wisdombim.com.cn/api/QingLive/sms/${res.FLV.split("/sms/")[1]}`: "";
        }
      }).catch((err) => {
          this.isErr = true;
      });
    },
    //云台控制
    controlClick(val, operation) {
      if (val.token) {
        getPtzStart(val.token, val.sn, val.channel, operation, 0).then((res) => {
          console.log(res);
        });
        setTimeout(() => {
          getPtzStop(val.token, val.sn, val.channel, operation).then((res) => {
            console.log(res);
          });
        }, 800);
      } else {
        this.$message.warn("无token，暂不支持");
      }
    },
    shang() {
      this.controlClick(this.videoData, 0);
    },
    xia() {
      this.controlClick(this.videoData, 1);
    },
    zuo() {
      this.controlClick(this.videoData, 2);
    },
    you() {
      this.controlClick(this.videoData, 3);
    },
    enlarge() {
      this.controlClick(this.videoData, 8);
    },
    narrow() {
      this.controlClick(this.videoData, 9);
    },
    controlVideo(direction, v) {
      Api.videoControlQingVideo({deviceId: v.deviceId, channelId: v.channelId, command: direction}).then(res => {})
    },
    getinit2() {
      if (this.type == 0) {
        getdeviceDetails(
          this.projectCode,
          this.selectValue.name,
          this.selectValue.projectLevel,
          this.selectValue.id
        ).then((res) => {
          this.markedEquipment = res.data;
        });
      } else if (this.type == 1) {
        this.markedEquipment = [];
        if (this.selectValue.projectLevel == "device") {
          Api.getByParentIdQingVideo({
            appCode: this.projectCode ?? "",
            projectName: this.projectName,
            currentLevel: "pro",
            parentId: this.selectValue.parentId,
            refreshState: true,
          }).then((res) => {
            res.data.forEach((e) => {
              if (e.id == this.selectValue.id) {
                this.markedEquipment.push(e);
                this.deviceState = e.deviceOnline
              }
            });
          });
        } else {
          Api.getByParentIdQingVideo({
            appCode: this.projectCode ?? "",
            projectName: this.projectName,
            currentLevel: "pro",
            parentId: this.selectValue.id,
            refreshState: true,
          }).then((res) => {
            this.markedEquipment = res.data;
          });
        }
      }
      getBackGround(this.projectCode, this.projectName).then((res) => {
        if (res.data.url) {
          this.canDrag=res.data.canDrag;
          this.bgImg = res.data.url;
        } else {
          this.bgImg = img1;
        }
      });
    },
    getinit(val) {
      this.id = val.id;
      this.videoDataVal = val
      if (this.type == 0) {
        this.$nextTick(() => {
          this.playFLV(val);
        });
      } else {
        if(this.deviceState == 0) return;
        this.startVideo(val.deviceId, val.channelId);
      }
    },
    playFLV(videoData) {
      const v = videoData;
      if (FlvJs.isSupported()) {
        var videoElement = document.getElementById(v.id);
        this.flvPlayer = FlvJs.createPlayer({
          type: "flv",
          isLive: true,
          hasAudio: false,
          url: v.url,
        });
        if (!videoElement) return;
        this.flvPlayer?.attachMediaElement(videoElement);
        this.flvPlayer?.load();
        setTimeout(() => {
          this.flvPlayer?.play();
        }, 10);
      }
    },
    btnCLick() {
      this.PanoramicViewShow = !this.PanoramicViewShow;
      this.$emit("imgShow", this.PanoramicViewShow);
    },
    ImgClick(val) {
      setTimeout(() => {
        if (this.isMonitorShow) {
          this.isStart = false
          this.isErr = false
          this.MonitorShow = true;
          this.videoData = val;
          this.consoleControl = val.consoleControl??0
          this.deviceState = val.deviceOnline
          this.getinit(val);
        }
      }, 200);
    },
    openDeviceDialog(val) {
      if (!this.isDragClick) return;
      setTimeout(() => {
        if (!this.isDragging) {
          this.isMonitorShow = true;
        }
      }, 200);
    },
    dragging(val) {
      if (!this.isDragClick) return;
      this.isDragging = true;
    },
    dragstop(val, vals) {
      if (!this.isDragClick) return;
      if (this.type == 0) {
        const cmd = {
          appCode: this.projectCode,
          height: val.top,
          id: vals.id,
          projectName: this.projectName ?? "",
          width: val.left,
        };
        getupdateDevice(cmd).then((res) => {
          // console.log(res);
        });
      } else {
        const cmd = {
          appCode: this.projectCode,
          height: val.top,
          id: vals.id,
          projectName: this.projectName ?? "",
          width: val.left,
        };
        getQingupdateDevice(cmd).then((res) => {
          // console.log(res);
        });
      }
      this.isMonitorShow = false;
      this.isDragging = false;
    },
    dragClick() {
      this.isDragClick = !this.isDragClick;
      this.isMonitorShow = true;
      if (this.isDragClick) {
        this.dragTitle = "取消拖动";
      } else {
        this.dragTitle = "设备拖动";
      }
    },
  },
  watch: {
    projectval(val) {
      this.selectValue = val;
      this.projectName = val.xmjc1;
      if (val.projectLevel == "集团" || val.projectLevel == "公司") return (this.PanoramicViewShow = false);
      if (val.projectLevel == "compony" || val.projectLevel == "group") return (this.PanoramicViewShow = false);
      this.$emit("imgShow", this.PanoramicViewShow);
      if (!this.PanoramicViewShow) return;
      this.projectCode = `${env.project}`;
      this.getinit2();
    },
    PanoramicViewShow(val) {
      if (val) {
        this.projectCode = `${env.project}`;
        this.getinit2();
      }
    },
  },
  mounted() {
    this.projectCode = `${env.project}`;
    Api.getVideoTypeQingVideo({ appCode: this.projectCode ?? "" }).then((res) => {
      this.type = res.data;
    });
  },
};
</script>

<style lang="less" scoped>
.PanoramicView {
  position: relative;
  .btn {
    position: absolute;
    top: 8px;
    right: 340px;
    z-index: 99;
    cursor: pointer;
    padding: 5px;
    width: 70px;
    background: rgba(21, 132, 255, 0.4);
    color: #fff;
  }
  .imgBg {
    width: 100%;
    height: 100%;
  }
  .imgMonitor {
    position: absolute;
    top: 100px;
    left: 300px;
    img {
      display: block;
      cursor: pointer;
    }
    p {
      position: absolute;
      width: 105px;
      top: 78px;
      left: -30px;
      min-height: 32px;
      padding: 8px;
      color: #fff;
      text-align: left;
      text-decoration: none;
      word-wrap: break-word;
      background-color: rgba(0, 0, 0, 0.75);
      border-radius: 4px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
    }
  }
}
.dragBtn {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 80px;
  height: 35px;
  line-height: 35px;
  text-align: center;
  background: #1584ff;
  z-index: 99;
  color: #fff;
  cursor: pointer;
}
</style>

<style lang="less">
.imgMonitor {
  .content-container {
    width: 44px !important;
    height: 65px !important;
    z-index: 10;
  }
  .vdr.active:before {
    content: none;
  }
  .vdr-stick {
    display: none;
  }
}
.deviceModal {
  .ant-modal {
    width: 1200px !important;
    margin-left: 27%;
    top: 163px;
    video {
      width: 100%;
      height: 641px;
    }
  }
  .ant-modal-body {
    padding: 30px;
  }
  .ant-modal-content {
    background: url("../img/k3_jtc.png");
    background-size: 100% 100%;
  }
  .ant-modal-close-x {
    width: 40px;
    line-height: 40px;
    height: 40px;
    color: #fff;
  }
  .yuntai {
    position: absolute;
    bottom: 90px;
    right: 18px;
    width: 10%;
    height: 160px;
    padding: 10px;
    text-align: center;
    .fangxiang {
      background: url("../img/bg.png");
      background-size: 100% 100%;
      height: 100px;
      margin-bottom: 10px;
      .shang {
        margin-bottom: 16px;
      }
    }
    img {
      cursor: pointer;
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
      }
    }
  }
  .videos {
    img {
      width: 1140px;
      height: 641px;
    }
  }
}
</style>
