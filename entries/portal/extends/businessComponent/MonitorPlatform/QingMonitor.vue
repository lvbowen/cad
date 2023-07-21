<template>
  <div class="main">
    <div :style="{ width: isScale ? '13%' : '0' }" class="left_tree">
      <a-input-search
        v-if="isScale"
        style="margin: 8px; width: 90%"
        placeholder="请输入关键字"
        @pressEnter="EnterSearchOne"
        @search="onSearchOne"
      />
      <a-tree
        v-if="isScale&&treeData.length>0"
        :autoExpandParent="autoExpandParent"
        :treeData="treeData"
        @select="clickTree"
        @expand="onExpand"
        :expandedKeys="expandedKeys"
        :replaceFields="replaceFields"
        :defaultSelectedKeys="defaultselectedkeys"
      >
        <template v-slot:title="title">
          <span>
            <img
              v-if="title.projectLevel==='device'&&title.deviceOnline===1"
              src="./img/在线(1).png"
              alt="">
            <img
              v-if="title.projectLevel==='device'&&title.deviceOnline===0"
              src="./img/离线(1).png"
              alt="">
          </span>
          <span v-if="title.nodeName.indexOf(searchValue) > -1">
            {{
              title.nodeName.substr(0, title.nodeName.indexOf(searchValue))
            }}
            <span style="color: #f50">{{ searchValue }}</span>
            {{ title.nodeName.substr(title.nodeName.indexOf(searchValue) + searchValue.length) }}
          </span>
          <span v-else>{{ title.nodeName }}</span>
        </template>
      </a-tree>
    </div>
    <div class="middle">
      <img
        v-show="!isScale"
        src="../BIMView/pic/open.png"
        class="off-on"
        @click="isScale = true"
      />
      <img
        v-show="isScale"
        src="../BIMView/pic/off.png"
        class="off-on"
        @click="isScale = false"
      />
    </div>
    <div :style="{ width: isScale ? '87%' : '100%'}" class="right_div" v-if="PanoramicViewShow">
      <div class="select_div">
        <div class="yuntaibutton" @click="RotationClick">{{ isRotation ? "关闭轮播" : "开启轮播" }}</div>
        <div class="yuntaibutton" @click="yuntaiShow = !yuntaiShow">云台控制</div>
        <a-select :defaultValue="1" style="width: 120px" @change="sizeChange">
          <a-select-option value="1"> 1*1</a-select-option>
          <a-select-option value="4"> 2*2</a-select-option>
          <a-select-option value="6"> 2*3</a-select-option>
        </a-select>
      </div>
      <div class="video_container" v-if="videoData.length>0">
        <div v-for="(v, i) in videoData" :key="i" :class="videoSize === 6? 'six_videos': videoSize === 4? 'four_videos': isHasAi?'has_ai_videos':'one_videos'">
          <div class="video_title">
            <div>
              <img :src="videoTitle"/>
              <span style="color: #fff">{{ v.name }}</span>
              <img :src="v.deviceState === '1' ? greenPot : redPot" class="pot_state"/>
            </div>
            <div>
              <p></p>
            </div>
          </div>
          <!--视频播放逻辑：isErr判断网络是否有问题，isStart判断是否开始加载视频，deviceState判断设备是否在线-->
          <div class="videos">
            <img v-if="v.deviceState === '0'" :alt="liXian" :src="liXian"/>
            <img v-else-if="v.isErr" :alt="netErr" :src="netErr"/>
            <img v-else-if="!v.isStart" :src="loading" :alt="loading"/>
            <LivePlayer
              v-else-if="v.deviceState === '1'&& v.isStart"
              :videoUrl="v.url"
              :poster="loading"
              :alt="liXian"
              autoplay
              live
              controls
              stretch
              :fluent="false"
              :showCustomButton="true"
              :hideFluentButton="false"
              @error="getErr($event,v,i)"
            ></LivePlayer>
          </div>
          <div class="yuntai" v-if="yuntaiShow&&v.consoleControl===1">
            <div class="fangxiang">
              <div class="shang">
                <img
                  @click="controlVideo('up',v)"
                  src="./img/shang.png"
                  alt=""/>
              </div>
              <div class="yuntaizy">
                <img
                  @mousedown="controlVideo('left',v)"
                  @mouseup="controlVideo('stop',v)"
                  src="./img/zuo.png"
                  alt=""/>
                <img
                  @mousedown="controlVideo('right',v)"
                  @mouseup="controlVideo('stop',v)"
                  src="./img/you.png"
                  alt=""/>
              </div>
              <div class="yuntaixia">
                <img
                  @mousedown="controlVideo('down',v)"
                  @mouseup="controlVideo('stop',v)"
                  src="./img/xia.png"
                  alt=""/>
              </div>
            </div>
            <div class="yuntaijj">
              <img
                @mousedown="controlVideo('zoomin',v)"
                @mouseup="controlVideo('stop',v)"
                src="./img/jia.png"
                alt=""/>
              <img
                alt=""
                src="./img/jian.png"
                @mousedown="controlVideo('zoomout',v)"
                @mouseup="controlVideo('stop',v)"/>
            </div>
          </div>
        </div>
        <a-i-realtime-alarm
          v-if="isHasAi"
          :deviceSn="videoData[0].id"
          :channelNo="videoData[0].channelID"
          style="width: 20%;float: right"></a-i-realtime-alarm>
      </div>
      <div class="pagination_div" v-if="videoData.length !== 0">
        <a-pagination
          v-model="current"
          :total="videoTotal"
          :pageSize="Number(videoSize)"
          @change="pagChange"
        />
      </div>
    </div>
    <PanoramicView v-show="btnShow" @imgShow="imgShow" :projectval="selectData"/>
  </div>
</template>

<script lang="ts">
/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import Vue from "vue";
import {Component, InjectReactive, Prop, Watch} from "vue-property-decorator";
import * as Api from "../../service/api";
import LivePlayer from '@liveqing/liveplayer';
import videoTitle from "../../../src/assets/extends/monitor/sp_jt拷贝.png";
import greenPot from "../../../src/assets/extends/monitor/椭圆1056.png";
import redPot from "../../../src/assets/extends/monitor/椭圆1056拷贝2.png";
import {Input, Pagination, Select, Tree} from "@h3/antd-vue";
import liXian from './img/lixian.png';
//@ts-ignore
import loading from './img/loading.jpg';
import netErr from './img/netUnstable.png';
import PanoramicView from "./PanoramicView/index.vue";
import AIRealtimeAlarm from "./AIRealtimeAlarm/AIRealtimeAlarm.vue";


@Component({
  name: "QingMonitor",
  components: {
    AIRealtimeAlarm,
    ATree: Tree,
    AInput: Input,
    AInputSearch: Input.Search,
    ASelect: Select,
    ASelectOption: Select.Option,
    APagination: Pagination,
    LivePlayer,
    PanoramicView
  },
})
export default class QingMonitor extends Vue {
  @InjectReactive("project") projectCode?: string;
  @Prop() projectName!: string;
  @Prop() projectLevel!: string;
  @Prop() treeId!: string;
  @Prop({required: false, default: () => []}) expandKeys!: Array<string>;

  liXian: HTMLImageElement = liXian;
  loading: HTMLImageElement = loading;
  netErr: HTMLImageElement = netErr;

  replaceFields: { [propsName: string]: string } = {
    children: "children",
    title: "nodeName",
    key: "id",
  };
  treeData: Array<{ [propsName: string]: string | boolean | number | null }> = [];
  dataList: Array<{ [propsName: string]: string }> = [];
  isScale: boolean = true;
  autoExpandParent: boolean = true;
  expandedKeys: Array<string | null> = [];
  searchValue: string = "";
  flvPlayer: any = null;
  //右侧
  current: number = 1;
  videoSize: number = 1;
  videoData: Array<{ [propsName: string]: string | number | null | boolean }> = [];
  selectData: any = {};
  videoTotal: number = 0;
  defaultselectedkeys: Array<string> = [];
  //图
  videoTitle: HTMLImageElement = videoTitle;
  greenPot: HTMLImageElement = greenPot;
  redPot: HTMLImageElement = redPot;

  yuntaiShow: boolean = false;
  PanoramicViewShow: boolean = true;
  btnShow: boolean = false;
  isRotation: boolean = false;
  isHasAi: boolean = false;

  @Watch('imgShows', {immediate: true})
  imgShow(v) {
    this.PanoramicViewShow = !v
  }

  @Watch('projectName', {immediate: true})
  projectNameListener(v) {
    if (v) {
      this.selectData.name = v;
      this.selectData.projectLevel = this.projectLevel;
      this.selectData.id = this.treeId;
      this.getDeviceTree();
    }
  }

  mounted() {
    this.getDeviceTree();
  }

  controlVideo(direction, v) {
    Api.videoControlQingVideo({
      deviceId: v.id,
      channelId: v.channelID,
      command: direction
    }).then(res => {
    })
  }

  //点击树事件
  clickTree(selectedKeys, e) {
    if (e.node.dataRef.projectLevel == "compony" || e.node.dataRef.projectLevel == "group") {
      this.btnShow = false
      this.PanoramicViewShow = true
    } else {
      this.btnShow = true
    }
    this.selectData = e.node.dataRef;
    this.videoData = [];
    this.videoTotal = 0;
    this.current = 1;
    this.getDeviceDetail();
  }

  generateList(data) {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.nodeName;
      this.dataList.push({key: node.id, title: key});
      if (node.children) {
        this.generateList(node.children);
      }
    }
  }

  //获取右侧视频数据
  getDeviceDetail() {
    this.videoData = [];
    const _this = this;
    if (this.selectData.projectLevel == 'device') {
      _this.videoData.push({
        id: this.selectData.deviceId,
        deviceState: String(this.selectData.deviceOnline),
        name: this.selectData.channelName,
        channelID: this.selectData.channelId,
        consoleControl: this.selectData.consoleControl ?? 0,
        url: this.selectData.manufacturer=='萤石云'?this.selectData.videoUrl:null,
        manufacturer:this.selectData.manufacturer,
        token:this.selectData.token,
        SnapURl: loading,
        isErr: false,
        isStart: this.selectData.manufacturer=='萤石云',
      })
      this.videoTotal = 1;
      if (this.videoSize === 1) {
        this.hasAi();
      }
      if (this.selectData.deviceOnline === 0) return;
      if(this.selectData.manufacturer=='萤石云') return;
      return this.startVideo(this.selectData.deviceId, this.selectData.channelId)
    }
    Api.getByParentIdQingVideo({
      appCode: this.projectCode ?? '',
      projectName: this.selectData.name,
      currentLevel: this.selectData.projectLevel,
      parentId: this.selectData.id,
      refreshState: true
    }).then((res) => {
      if (!res.data) return this.$message.warn(res.errmsg as string);
      _this.videoTotal = res.data.length;
      res.data.forEach((item, i) => {
        if (i >= (_this.current - 1) * _this.videoSize && i < _this.current * _this.videoSize) {
          this.videoData.push({
            id: item.deviceId,
            deviceState: String(item.deviceOnline),
            name: item.channelName,
            channelID: item.channelId,
            consoleControl: item.consoleControl ?? 0,
            url: item.manufacturer=='萤石云'?item.videoUrl:null,
            SnapURl: loading,
            manufacturer:item.manufacturer,
            token:item.token,
            isErr: false,
            isStart:  item.manufacturer=='萤石云'
          })
          if(item.manufacturer!=='萤石云'){
            _this.startVideo(item.deviceId, item.channelId);
          }
        }
      })
      if (this.videoSize === 1) {
        this.hasAi();
      }
    });
  }

  RotationClick() {
    this.isRotation = !this.isRotation
    const timeout = setInterval(() => {
      if (!this.isRotation) return clearInterval(timeout)
      this.current++
      const num = (Number(this.videoTotal / this.videoSize)).toFixed(0)
      //@ts-ignore
      if (this.current > num) {
        this.current = 1
      }
      this.getDeviceDetail()
    }, 60000);
  }

  async startVideo(serial: string, code: string) {
    for (const item of this.videoData) {
      const i = this.videoData.indexOf(item);
      if (item.channelID === code) {
        await Api.startQingVideo({serial: serial, code: code}).then(res => {
          if (typeof res == 'object') {
            this.videoData[i].isStart = true;
            return this.videoData[i].url = res.FLV ? `https://standard.wisdombim.com.cn/api/QingLive/sms/${res.FLV.split('/sms/')[1]}` : ""
          }
        }).catch((err: any) => {
          this.videoData[i].isErr = true;
        });
      }
    }
  }

  //获取左侧项目树
  getDeviceTree() {
    this.treeData = [];
    Api.getDeviceTreeQingVideo({
      appCode: this.projectCode ?? "",
      // currentProjectName: this.projectConfig?.projectName ?? "",
      currentProjectName: ''
    }).then((res) => {
      if (!res.data || res.errcode !== 0) return this.$message.warn("获取项目树失败！");
      this.treeData = res.data;
      this.defaultselectedkeys.push(this.treeData[0].id as string);
      this.selectData = {
        name: this.treeData[0].name,
        id: this.treeData[0].projectId,
        projectLevel: this.treeData[0].projectLevel
      };
      if (this.selectData.projectLevel == "compony" || this.selectData.projectLevel == "group") {
        this.btnShow = false
        this.PanoramicViewShow = true
      } else {
        this.btnShow = true
      }
      if (this.treeId) {
        this.defaultselectedkeys.push(this.treeId)
      }
      this.generateList(this.treeData);
      if (this.treeData.length !== 0) {
        this.videoData = [];
        this.videoTotal = 0;
        this.current = 1;
        this.getDeviceDetail();
      }
      this.expandedKeys = this.expandKeys;
      if (this.expandedKeys.length == 0) {
        this.expandedKeys.push(this.treeId ? this.treeId as string : this.treeData[0].id as string);
      }
    });
  }

  getErr(e, v, i) {
    console.log('getErr', e, v, i)
    this.videoData[i] = {
      id: v.id,
      deviceState: v.deviceState,
      name: v.name,
      channelID: v.channelID,
      consoleControl: v.consoleControl,
      url: v.url,
      SnapURl: netErr,
      isErr: true
    }
  }

  getParentKey(key, tree) {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item) => item.id === key)) {
          parentKey = node.id;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  }

  Search(value) {
    const expandedKeys = this.dataList
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, this.treeData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    //@ts-ignore
    Object.assign(this, {
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  }

  //左侧树回车搜索
  EnterSearchOne(e) {
    const value = e.target.value;
    this.Search(value)
  }

  //左侧树点击搜索
  onSearchOne(value) {
    this.Search(value)
  }

  //左侧树的展开事件
  onExpand(expandedKeys) {
    this.expandedKeys = expandedKeys;
    this.autoExpandParent = false;
  }

  //翻页
  pagChange(e) {
    this.current = e;
    this.getDeviceDetail();
  }

  //每页视频数变化
  sizeChange(e) {
    console.log('sizeChange', e)
    this.videoSize = Number(e);
    if (this.videoSize !== 1) {
      this.isHasAi = false;
    }
    this.current = 1;
    this.getDeviceDetail();
  }

  hasAi() {
    Api.videoHasAi({
      deviceSn: String(this.videoData[0].id ?? ''),
      channelNo: String(this.videoData[0].channelID ?? ''),
    }).then(res => {
      this.isHasAi = res.data ?? false;
    })
  }

  beforeDestroy() {
    window.stop();
  }

}
</script>

<style lang="less" scoped>
@import '../../styles/antd.less';
.main {
  display: flex;
  height: 100%;
  flex: 1;
  //background: #000;
  .left_tree {
    background: #202431;
    //box-shadow: 7px 7px 10px 0px #000000;
    flex-direction: column;
    display: flex;
    .tree-transparent;

    /deep/ .ant-tree {
      color: white;
      font-size: 16px;
      height: calc(100vh - 200px);
      overflow: auto;
      background: #202431;
    }


    .close_pic {
      height: 25px;
      width: 25px;
      position: fixed;
      bottom: 10px;
      right: 87%;
    }

    .open_pic {
      height: 25px;
      width: 25px;
      position: fixed;
      bottom: 10px;
      right: 98%;
    }
  }

  .right_div {
    display: flex;
    height: 100%;
    flex: 1;
    flex-direction: column;
    background: #101019;

    .select_div {
      margin-top: 8px;
      text-align: right;
      margin-right: 1.5%;
      display: flex;
      justify-content: flex-end;

      .yuntaibutton {
        color: #fff;
        width: 85px;
        text-align: center;
        line-height: 30px;
        height: 30px;
        margin-right: 10px;
        cursor: pointer;
        background-color: rgba(21, 132, 255, 0.1);
      }

      /deep/ .ant-select-selection {
        background: rgba(21, 132, 255, 0.1);
        color: #fff;
        border: 0;
        border-radius: 0;
        font-size: 16px;
        font-family: Source Han Sans CN;
      }

      /deep/ .ant-select-arrow {
        color: #fff;
        font-size: 16px;
        font-weight: bold;
      }
    }

    .video_container {
      width: 100%;
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
      margin: 8px 0;
      flex-wrap: wrap;

      .video_title {
        height: 20px;
        line-height: 20px;
        display: flex;
        margin-bottom: 15px;
        padding: 0 15px;
        justify-content: flex-start;

        div:nth-child(1) {
          // width: 30%;
          margin-right: 10px;

          :nth-child(1) {
            height: 15px;
            width: 15px;
            margin-right: 5px;
          }
        }

        div:nth-child(2) {
          height: 20px;
          line-height: 20px;
          flex-direction: row;
          align-items: center;
          display: flex;
          flex-grow: 1;

          p {
            width: 100%;
            height: 1px;
            background: rgba(255, 255, 255, 0.4);
          }
        }
      }

      .pot_state {
        height: 10px;
        width: 10px;
        //margin: 2.5px 4px 2.5px 15px;
        margin-left: 5px;
      }

      .six_videos {
        position: relative;
        width: 32%;
        height: calc((100vh - 173px) / 2);
        margin: 3px 0.5% 3px 0.5%;
        //background-image: url("../../../src/assets/extends/monitor/k.png");
        //background-size: 100% 100%;
        .yuntai {
          position: absolute;
          bottom: 90px;
          right: 18px;
          width: 22%;
          height: 160px;
          padding: 10px;
          text-align: center;

          .fangxiang {
            background: url("./img/bg.png");
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
          width: 96%;
          margin-left: 2%;
          height: 100%;

          & > img {
            width: 100%;
            height: 35vh;
          }

          /deep/ .video-wrapper {
            //height: 80% !important;
            padding-bottom: 35vh !important;
          }
        }
      }

      .four_videos {
        position: relative;
        width: 45%;
        height: calc((100vh - 180px) / 2);
        margin: 5px 2.5% 5px 2.5%;
        //background-image: url("../../../src/assets/extends/monitor/k.png");
        //background-size: 100% 100%;
        .yuntai {
          position: absolute;
          bottom: 90px;
          right: 18px;
          width: 16%;
          height: 160px;
          padding: 10px;
          text-align: center;

          .fangxiang {
            background: url("./img/bg.png");
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
          width: 96%;
          margin-left: 2%;
          height: 100%;

          & > img {
            width: 100%;
            height: 35vh;
          }

          /deep/ .video-wrapper {
            //height: 80% !important;
            padding-bottom: 35vh !important;
          }
        }
      }

      .one_videos {
        position: relative;
        width: 90%;
        height: calc((100vh - 173px));
        margin: 10px 2.5% 10px 2.5%;
        //background-image: url("../../../src/assets/extends/monitor/k.png");
        //background-size: 100% 100%;
        .yuntai {
          position: absolute;
          bottom: 90px;
          right: 18px;
          width: 8%;
          height: 160px;
          padding: 10px;
          text-align: center;

          .fangxiang {
            background: url("./img/bg.png");
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
          width: 96%;
          margin-left: 2%;
          height: 100%;

          & > img {
            width: 100%;
            height: 78vh;
          }

          /deep/ .video-wrapper {
            //height: 80% !important;
            padding-bottom: 78vh !important;
          }
        }
      }

      .has_ai_videos {
        position: relative;
        width: 76%;
        height: calc((100vh - 173px));
        margin: 10px 1% 10px 1%;

        .yuntai {
          position: absolute;
          bottom: 90px;
          right: 18px;
          width: 8%;
          height: 160px;
          padding: 10px;
          text-align: center;

          .fangxiang {
            background: url("./img/bg.png");
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
          width: 96%;
          margin-left: 2%;
          height: 100%;

          & > img {
            width: 100%;
            height: 78vh;
          }

          /deep/ .video-wrapper {
            //height: 80% !important;
            padding-bottom: 78vh !important;
          }
        }
      }

    }

    .pagination_div {
      position: fixed;
      text-align: center;
      margin-left: calc((100% - 850px) / 2);
      width: 600px;
      bottom: 5px;
      .pagnition-transparent;
    }
  }

  .middle {
    background-color: #101019;
    display: flex;

    .off-on {
      width: 15px;
      height: max-content;
      cursor: pointer;
      margin: auto 0;
    }
  }

  ::-webkit-scrollbar-track {
    border-radius: 0;
    background: transparent;
  }
}
</style>
