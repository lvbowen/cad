<template>
  <div class="main">
    <div :style="{ width: isScale ? '13%' : '0' }" class="left_tree">
      <a-input-search
        v-if="isScale"
        style="margin: 8px; width: 90%"
        placeholder="请输入关键字"
        @change="onChange"
        @pressEnter="EnterSearchOne"
        @search="onSearchOne"
      />
      <a-tree
        v-if="isScale"
        :key="markNum"
        :autoExpandParent="autoExpandParent"
        :treeData="treeData"
        @select="clickTree"
        @expand="onExpand"
        :expandedKeys="expandedKeys"
        :replaceFields="replaceFields"
        :defaultSelectedKeys="defaultselectedkeys"
      >
        <template slot="title" slot-scope="title">
          <span>
            <img
              v-if="title.projectLevel=='设备'&&title.deviceOnline==1"
              src="./img/在线(1).png"
              alt="">
            <img
              v-if="title.projectLevel=='设备'&&title.deviceOnline==0"
              src="./img/离线(1).png"
              alt="">
          </span>
          <span v-if="title.nodeName.indexOf(searchValue) > -1">
            {{
              title.nodeName.substr(0, title.nodeName.indexOf(searchValue))
            }}
            <span style="color: #f50">{{ searchValue }}</span>
            {{
              title.nodeName.substr(
                title.nodeName.indexOf(searchValue) + searchValue.length
              )
            }}
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
    <div
      :style="{ width: isScale ? '87%' : '100%', height: '100%' }"
      class="right_div"
      v-if="PanoramicViewShow">
      <div class="select_div">
        <div class="yuntaibutton" @click="RotationClick">{{ isRotation ? "关闭轮播" : "开启轮播" }}</div>
        <div class="yuntaibutton" @click="yuntaiShow = !yuntaiShow">云台控制</div>
        <a-select
          class="select"
          defaultValue="4"
          style="width: 120px"
          @change="sizeChange"
        >
          <a-select-option value="1"> 1*1</a-select-option>
          <a-select-option value="4"> 2*2</a-select-option>
          <a-select-option value="6"> 2*3</a-select-option>
        </a-select>
      </div>
      <div class="video_container" :key="selectNum">
        <div
          v-if="videoData.length !== 0"
          v-for="(v, i) in videoData"
          :key="i"
          :class="videoSize === 6? 'six_videos': videoSize === 4? 'four_videos': isHasAi?'has_ai_videos':'one_videos' ">
          <div>
            <img :src="videoTitle" class="video_title"/>
            <span style="color: #fff">{{ v.name }}</span>
            <img
              :src="v.deviceState === '1' ? greenPot : redPot"
              class="pot_state"
            />
          </div>
          <video
            class="videos"
            autoplay
            loop
            controls
            muted
            :id="v.id">
            Your browser is too old which doesn't support HTML5 video.
          </video>
          <div class="yuntai" v-if="yuntaiShow&&v.consoleControl===1">
            <div class="fangxiang">
              <div class="shang">
                <img @click="shang(v)" src="./img/shang.png" alt=""/>
              </div>
              <div class="yuntaizy">
                <img @click="zuo(v)" src="./img/zuo.png" alt=""/>
                <img @click="fw(v)" src="./img/fw1.png" alt="">
                <img @click="you(v)" src="./img/you.png" alt=""/>
              </div>
              <div class="yuntaixia">
                <img @click="xia(v)" src="./img/xia.png" alt=""/>
              </div>
            </div>
            <div class="yuntaijj">
              <img @click="enlarge(v)" src="./img/jia.png" alt=""/>
              <img @click="narrow(v)" src="./img/jian.png" alt=""/>
            </div>
          </div>
        </div>
        <a-i-realtime-alarm
          v-if="isHasAi"
          :deviceSn="videoData[0].sn"
          :channelNo="videoData[0].channel"
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
import Vue from "vue";
import FlvJs from "flv.js";
import {Tree, Input, Select, Pagination} from "@h3/antd-vue";
import {Component, InjectReactive, Watch, Prop} from "vue-property-decorator";
import * as Api from "../../service/api";
import * as Type from "../../type";
import videoTitle from "../../../src/assets/extends/monitor/sp_jt拷贝.png";
import closePic from "../../../src/assets/extends/monitor/2.png";
import openPic from "../../../src/assets/extends/monitor/1.png";
import greenPot from "../../../src/assets/extends/monitor/椭圆1056.png";
import redPot from "../../../src/assets/extends/monitor/椭圆1056拷贝2.png";
import {ProjectLevel} from "../../constant";
import {getPtzStart, getPtzStop, getPresetMove} from "./index.js";
import PanoramicView from "./PanoramicView/index.vue"
import AIRealtimeAlarm from "./AIRealtimeAlarm/AIRealtimeAlarm.vue";

@Component({
  name: "monitorPlatform",
  components: {
    ATree: Tree,
    AInput: Input,
    AInputSearch: Input.Search,
    ASelect: Select,
    ASelectOption: Select.Option,
    APagination: Pagination,
    PanoramicView, AIRealtimeAlarm
  },
})
export default class monitorPlatform extends Vue {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;
  @Prop() projectName!: string;
  @Prop() projectLevel!: string;
  @Prop() treeId!: string;
  @Prop({required: false, default: () => []}) expandKeys!: Array<string>;

  replaceFields: { [propsName: string]: string } = {
    children: "children",
    title: "nodeName",
    key: "id",
  };
  treeData: Array<{ [propsName: string]: string | boolean | number | null }> =
    [];
  dataList: Array<{ [propsName: string]: string }> = [];
  isScale: boolean = true;
  autoExpandParent: boolean = true;
  expandedKeys: Array<string | null> = [];
  searchValue: string = "";
  markNum: number = 0;
  flvPlayer: any = null;
  //右侧
  current: number = 1;
  videoSize: number = 4;
  videoData: Array<{ [propsName: string]: string }> = [];
  selectData: any = {};
  videoTotal: number = 0;
  selectNum: number = 0;
  defaultselectedkeys: Array<string> = [];
  //图
  videoTitle: HTMLImageElement = videoTitle;
  greenPot: HTMLImageElement = greenPot;
  redPot: HTMLImageElement = redPot;

  yuntaiShow: boolean = false;
  PanoramicViewShow: boolean = false;
  btnShow: boolean = false;
  isRotation: boolean = false;
  isHasAi: boolean = false;

  @Watch('imgShows', {immediate: true})
  imgShow(v) {
    this.PanoramicViewShow = !v
    if (!v) {
      this.getDeviceDetail();
    }
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

  fw(val) {
    getPresetMove(val.token, val.sn, val.channel, 1).then(res=>{
      //@ts-ignore
      if(res?.code == 200) {
      //@ts-ignore
        this.$message.success(res.msg??"");
      }else {
        //@ts-ignore
        this.$message.warn(res.msg??"");
      }
    })
  }

  //操作命令：0-上，1-下，2-左，3-右，4-左上，5-左下，6-右上，7-右下，8-放大，9-缩小，10-近焦距，11-远焦距
  //云台速度：0-慢，1-适中，2-快
  shang(val) {
    if (val.token) {
      getPtzStart(val.token, val.sn, val.channel, 0, 0).then((res) => {
        console.log(res);
      });
      setTimeout(() => {
        getPtzStop(val.token, val.sn, val.channel, 0).then((res) => {
          console.log(res);
        });
      }, 800);
    } else {
      this.$message.warn("无token，暂不支持");
    }
  }

  zuo(val) {
    if (val.token) {
      getPtzStart(val.token, val.sn, val.channel, 2, 0).then((res) => {
        console.log(res);
      });
      setTimeout(() => {
        getPtzStop(val.token, val.sn, val.channel, 2).then((res) => {
          console.log(res);
        });
      }, 800);
    } else {
      this.$message.warn("无token，暂不支持");
    }
  }

  you(val) {
    if (val.token) {
      getPtzStart(val.token, val.sn, val.channel, 3, 0).then((res) => {
        console.log(res);
      });
      setTimeout(() => {
        getPtzStop(val.token, val.sn, val.channel, 3).then((res) => {
          console.log(res);
        });
      }, 800);
    } else {
      this.$message.warn("无token，暂不支持");
    }
  }

  xia(val) {
    if (val.token) {
      getPtzStart(val.token, val.sn, val.channel, 1, 0).then((res) => {
        console.log(res);
      });
      setTimeout(() => {
        getPtzStop(val.token, val.sn, val.channel, 1).then((res) => {
          console.log(res);
        });
      }, 800);
    } else {
      this.$message.warn("无token，暂不支持");
    }
  }

  enlarge(val) {
    if (val.token) {
      getPtzStart(val.token, val.sn, val.channel, 8, 0).then((res) => {
        console.log(res);
      });
      setTimeout(() => {
        getPtzStop(val.token, val.sn, val.channel, 8).then((res) => {
          console.log(res);
        });
      }, 800);
    } else {
      this.$message.warn("无token，暂不支持");
    }
  }

  narrow(val) {
    if (val.token) {
      getPtzStart(val.token, val.sn, val.channel, 9, 0).then((res) => {
        console.log(res);
      });
      setTimeout(() => {
        getPtzStop(val.token, val.sn, val.channel, 9).then((res) => {
          console.log(res);
        });
      }, 800);
    } else {
      this.$message.warn("无token，暂不支持");
    }
  }

  //点击树事件
  clickTree(selectedKeys, e) {
    if (e.node.dataRef.projectLevel == "公司" || e.node.dataRef.projectLevel == "集团") {
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
    if (this.projectConfig?.multiProjectFlag || this.selectData.projectLevel == "设备") {
      Api.deviceDetail({
        appCode: this.projectCode,
        currentProjectName: this.selectData.name,
        currentLevel: this.selectData.projectLevel,
        id: this.selectData.id,
        current: this.current,
        size: this.videoSize,
      }).then((res) => {
        if (!res.data) return this.$message.warn(res.errmsg as string);
        this.selectNum += 1;
        this.videoData = res.data['records'] ?? 0;

        if (this.videoData.length !== 0) {
          this.$nextTick(() => {
            this.playFLV(this.videoData);
          });
        }
        if (this.videoSize === 1) {
          this.hasAi();
        }
        //@ts-ignore
        this.videoTotal = res.data.total; //总页数
      });
    } else {
      Api.deviceDetail({
        appCode: this.projectCode,
        currentProjectName: this.selectData.name,
        currentLevel: this.selectData.projectLevel,
        id: this.selectData.id,
        current: this.current,
        size: this.videoSize,
      }).then((res) => {
        //@ts-ignore
        if (!res.data) return this.$message.warn(res.errmsg);
        this.selectNum += 1;
        //@ts-ignore
        this.videoData = res.data.records;

        if (this.videoData.length !== 0) {
          this.$nextTick(() => {
            this.playFLV(this.videoData);
          });
        }
        if (this.videoSize === 1) {
          this.hasAi();
        }
        //@ts-ignore
        this.videoTotal = res.data.total; //总页数
      });
    }
  }

  RotationClick() {
    this.isRotation = !this.isRotation
    const timeout = setInterval(() => {
      if (!this.isRotation) return clearInterval(timeout)
      this.current++
      const num = Math.ceil(this.videoTotal / this.videoSize)
      //@ts-ignore
      if (this.current > num) {
        this.current = 1
      }
      this.getDeviceDetail()
    }, 60000);
  }

  //获取左侧项目树
  getDeviceTree() {
    this.treeData = [];
    Api.deviceTreeNew({
      appCode: this.projectCode ?? "",
      currentProjectName: this.projectConfig?.projectName ?? "",
      //@ts-ignore
      currentLevel: ProjectLevel[this.projectConfig?.projectLevel] ?? "",
    }).then((res) => {
      //@ts-ignore
      if (!res.data || res.errcode !== 0) return this.$message.warn("获取项目树失败！");
      this.treeData = res.data;
      if (this.projectConfig?.projectKey) {
        this.defaultselectedkeys.push(this.projectConfig?.projectKey?.split('-')[0] as string);
        this.selectData = {
          name: this.projectConfig?.projectName,
          id: this.projectConfig?.projectKey?.split('-')[0],
          projectLevel: this.treeData[0].projectLevel as string
        };
        if (this.selectData.projectLevel == "公司" || this.selectData.projectLevel == "集团") {
          this.btnShow = false
          this.PanoramicViewShow = true
        } else {
          this.btnShow = true
        }
      }
      if (this.treeId) {
        this.defaultselectedkeys.push(this.treeId)
      }

      this.markNum += 1;
      this.generateList(this.treeData);
      if (this.treeData.length !== 0) {
        // this.selectData = this.treeData[0];
        this.videoData = [];
        this.videoTotal = 0;
        this.current = 1;
        this.getDeviceDetail();
      }
      this.expandedKeys = this.expandKeys;
      // //@ts-ignore
      if (this.expandedKeys.length == 0) this.expandedKeys.push(this.treeId ? this.treeId as string : this.treeData[0].id as string);
    });
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

  hasAi() {
    Api.videoHasAi({
      deviceSn: String(this.videoData[0].sn ?? ''),
      channelNo: String(this.videoData[0].channel ?? ''),
    }).then(res => {
      this.isHasAi = res.data ?? false;
    })
  }

  //左侧树的关键字搜索
  onChange(e) {
    const value = e.target.value;
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

  playFLV(videoData) {
    for (let i = 0; i < videoData.length; i++) {
      const v = videoData[i];
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
    }
  }

  //每页视频数变化
  sizeChange(e) {
    this.videoSize = Number(e);
    if (this.videoSize !== 1) {
      this.isHasAi = false;
    }
    this.current = 1;
    this.getDeviceDetail();
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

  .left_tree {
    background: #202431;
    box-shadow: 7px 7px 10px 0px #000000;
    flex-direction: column;
    display: flex;
    .tree-transparent;

    /deep/ .ant-tree {
      color: white;
      font-size: 16px;
      height: calc(100vh - 200px);
      overflow: auto;
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
        // border: 1px solid #d9d9d9;
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
      //justify-content: flex-start;
      flex-wrap: wrap;
      flex-direction: row;
      box-sizing: border-box;
      margin: 8px 0;

      .video_title {
        height: 15px;
        width: 15px;
        margin: 2.5px 4px 2.5px 15px;
      }

      .pot_state {
        height: 10px;
        width: 10px;
        margin: 2.5px 4px 2.5px 15px;
      }

      .six_videos {
        position: relative;
        width: 32%;
        height: calc((100vh - 173px) / 2);
        margin: 3px 0.5% 3px 0.5%;
        background-image: url("../../../src/assets/extends/monitor/k.png");
        background-size: 100% 100%;

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
            margin-bottom: 10px;
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
      }

      .four_videos {
        position: relative;
        width: 45%;
        height: calc((100vh - 180px) / 2);
        margin: 5px 2.5% 5px 2.5%;
        background-image: url("../../../src/assets/extends/monitor/k.png");
        background-size: 100% 100%;

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
            margin-bottom: 8px;
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
      }

      .one_videos {
        position: relative;
        width: 90%;
        height: calc((100vh - 173px));
        margin: 10px 2.5% 10px 2.5%;
        background-image: url("../../../src/assets/extends/monitor/k.png");
        background-size: 100% 100%;

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
            margin-bottom: 10px;
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
      }

      .has_ai_videos {
        position: relative;
        width: 77%;
        height: calc((100vh - 173px));
        margin: 10px 1% 10px 1%;
        background-image: url("../../../src/assets/extends/monitor/k.png");
        background-size: 100% 100%;
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
            margin-bottom: 10px;
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
      }

      .videos {
        width: 96%;
        margin-left: 2%;
        height: calc(100% - 35px);
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
