<template>
  <div id="mainLive">
    <div class="title-container">
      <div class="header-menu"><span>{{ projectName }}</span></div>
      <div class="button-list">
        <template v-for="item in buttonList">
          <a-dropdown :key="item.id" :trigger="['click']">
            <a-menu slot="overlay" v-if="dropMenu.length !== 0">
              <a-menu-item v-for="(menuItem, i) in dropMenu" :key="i" @click="clickMenu(menuItem)">
                {{ menuItem.tabName }}
              </a-menu-item>
            </a-menu>
            <a-button
              :class="clickTab === item.tabName ? 'button-hover' : 'button'"
              size="large"
              @click="getButtonList(item)">
              {{ item.tabName }}
            </a-button>
          </a-dropdown>
        </template>
      </div>
      <span style="color: #fff">{{ date }}</span>
      <iframe
        allowtransparency="true"
        frameborder="0"
        style="z-index: 10"
        width="180"
        height="36"
        scrolling="no"
        src="//tianqi.2345.com/plugin/widget/index.htm?s=3&z=2&t=0&v=0&d=3&bd=0&k=&f=ffffff&ltf=009944&htf=cc0000&q=1&e=1&a=1&c=54511&w=180&h=36&align=center"></iframe>
      <div class="workflow-center">
        <a-tooltip style="margin-right: 0.5vw">
          <template slot="title"> 导航页</template>
          <img :src="infoPortal" @click="toInfo" alt=""/>
        </a-tooltip>
        <!--        <a-tooltip>-->
        <!--          <template slot="title"> 在线标绘</template>-->
        <!--          <img :src="drawOnline" @click="()=>{this.isPlotting=!this.isPlotting}" alt=""/>-->
        <!--        </a-tooltip>-->
      </div>
    </div>
    <!--模型管理-->
    <ModelTree
      v-if="componentCode==='modelManage'"
      :projectName="projectName"
      @submitMessage="submitMessage"></ModelTree>
    <!--设备管理-->
    <DeviceList
      v-if="componentCode==='deviceList'"
      :projectName="projectName"
      @submitMessage="submitMessage"></DeviceList>
    <!--表单分析（配置化）-->
    <FormAnalysis
      v-if="isAnalysisShow"
      :projectName="projectName"
      :componentCode="componentCode"
      :location="location"
      @submitMessage="submitMessage"
    ></FormAnalysis>
    <!--表单分析图标弹窗-->
    <AnalysisPop
      v-if="analysisDetail"
      :projectName="projectName"
      :analysisDetail="analysisDetail"
      @closePop="closePop"
    ></AnalysisPop>
    <!--模型信息弹窗-->
    <InfoPop
      v-show="infoCode"
      :codeValue="infoCode"
      :projectCode="projectCode"
      :projectId="projectId"
      :projectName="projectName"
      modelType="unity"
      SMID=""
      LAYERNAME=""
      @closePop="closePop"></InfoPop>
    <!--在线标绘-->
    <OnlinePlotting
      v-if="isWebsocketOpen"
      v-show="isPlotting"
      :projectName="projectName"
      :onlinePlotValue="onlinePlotValue"
      @closePop="closePop"
      @submitMessage="submitMessage"></OnlinePlotting>
    <RelatedResources
      v-if="relatedResources"
      :projectName="projectName"
      :relatedResources="relatedResources"
      @closePop="closePop"
      @submitMessage="submitMessage"></RelatedResources>
  </div>
</template>

<script lang="ts">
/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Vue, Watch} from "vue-property-decorator";
import * as Type from "../../type";
import * as Api from "../../service/api";
import moment from "moment";

import infoPortal from "../../../src/assets/extends/icon/infoPortal.png";

import Dropdown from "ant-design-vue/lib/dropdown";
import "ant-design-vue/lib/dropdown/style/index.css";
import Menu from "ant-design-vue/lib/menu";
import "ant-design-vue/lib/menu/style/index.css";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import Tooltip from "ant-design-vue/lib/tooltip";
import "ant-design-vue/lib/tooltip/style/index.css";

import ModelTree from "./leftCard/modelTree.vue";
import DeviceList from "./leftCard/deviceList.vue";
import ModelAttribute from "./PopUp/ModelAttribute.vue";
import InfoPop from '../BIMPlatform/infoPop/infoPop';
import AnalysisPop from './PopUp/AnalysisPop.vue';
import FormAnalysis from './analysis/analysis.vue';
import OnlinePlotting from './PopUp/OnlinePlotting.vue';
import RelatedResources from './PopUp/RelatedResources.vue';

const {Launcher} = require("live-cat");

@Component({
  name: "DigitalView",
  components: {
    InfoPop,
    ADropdown: Dropdown, AButton: Button, AMenu: Menu, AMenuItem: Menu.Item, ATooltip: Tooltip,
    ModelTree, DeviceList, ModelAttribute, AnalysisPop, FormAnalysis, OnlinePlotting,RelatedResources
  }
})
export default class DigitalView extends Vue {
  @InjectReactive('project') projectCode?: string;

  msgReceived: string = '';//用于保存地图发来信息
  infoCode: string | null = null;//用于判断是否展示infoPop
  isAnalysisShow: boolean = false;//用于判断是否展示表单分析模块
  analysisDetail: any = null;//用于判断是否展示表单弹窗
  isPlotting: boolean = false;//用于判断是否展示在线标绘模块
  isWebsocketOpen: boolean = false;//用于判断模型是否加载完成
  onlinePlotValue: any = null;
  location: any = {};
  relatedResources:any=null;//用于判断在线标绘图标的弹窗是否展示

  projectName: string = '黄石新港';
  projectId: string = '';
  date: string = '';
  buttonList: Array<Type.ButtonDetail> = [];
  componentCode: string | null = null;
  dropMenu: Array<Type.ButtonDetail> = [];
  clickTab: string | null = null;
  tabName: string | null = null;
  infoPortal: HTMLImageElement = infoPortal;

  mounted() {
    this.projectName = this.$route.query.projectName as string;
    this.projectId = this.$route.query.projectId as string;
    this.bootstrap();
    setInterval(() => {
      this.date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    }, 1000);
  }


  @Watch('msgReceived', {immediate: true})
  msgReceivedListener(v) {
    console.log('msgReceived', v)
    if (!v || v === '') return;
    const value = JSON.parse(v);
    this.isPlotting = value.onlinemapping_Toggle ? !!value.onlinemapping_Toggle : this.isPlotting;//判断是否显示在线标绘弹窗
    if (value.pointdata) return this.location = value.pointdata;//获取位置信息
    if (value.icondata) return this.analysisDetail = value.icondata;//展示分析表单中图标的弹窗
    if (value.imagemark_positiondata) return this.onlinePlotValue = value.imagemark_positiondata;//在线标绘弹窗(图片)
    if (value.labelmark_positiondata) return this.onlinePlotValue = value.labelmark_positiondata;//在线标绘弹窗(文字)
    if (value.labelmark_data_1) return this.relatedResources = value.labelmark_data_1;
    if (value.imagemark_data_1) return this.relatedResources = value.imagemark_data_1;
    if (value.data === 'websocket_is_open') return this.isWebsocketOpen = true;
    if (value.data?.code) {
      //模型信息弹窗
      this.infoCode = JSON.parse(v)['data'].code ?? null;
    }
  }

  async bootstrap() {
    try {
      const appKey: string = this.$route.query.appKey as string;
      const address: string = "https://app.3dcat.live";
      // const appSecret:string=this.$route.query.appSecret as string;
      //@ts-ignore
      const launch = new Launcher({
        baseOptions: {address, appKey, startType: 1},
        extendOptions: {
          onPlay: () => {
            (window as any).livePlayer.handleChangeLandscapeType(2);
            (window as any).livePlayer.playerElement.style.top = '0';
            (window as any).livePlayer.playerElement.style.left = '0';
            (window as any).livePlayer.playerElement.style.width = '100%';
            (window as any).livePlayer.playerElement.style.height = '100%';
            (window as any).livePlayer.videoElement.style.objectFit = 'fill';
            //通信开启后进行操作
            this.getButtonList();
          }, startBitrate: 3000, maxBitrate: 3000
        }
      })
      const player = document.getElementById('mainLive');
      document.getElementById('mainLive')!.style.width = '100%';
      document.getElementById('mainLive')!.style.height = '100%';
      await launch.automata(player)
      const connection = launch.getConnection()
      const livePlayer = launch.getPlayer();
      (window as any).launch = launch;
      (window as any).connection = connection;
      (window as any).livePlayer = livePlayer;
      //接收应用程序发送过来的消息
      connection.event.interaction.on((msg) => {
        console.log('接收到消息', msg);
        this.msgReceived = msg
      })
    } catch (error) {
      console.error(error)
    }
  }

  clickMenu(v) {
    //加载不同组件
    this.componentCode = v.componentCode;
    this.isAnalysisShow = v.analysisColumn === '是';
    this.submitMessage('CameraView_Toggle', {isOn: v.analysisColumn === '是' ? 0 : 1})
  }

  closePop(v?: string) {
    this.msgReceived = '';
    this.infoCode = null;
    this.location = {};
    this.submitMessage('Model_DeselectItem')
    if (v === 'OnlineMapping') {
      this.isPlotting = false;//关闭在线标绘弹窗
      this.submitMessage('OnlineMapping_Toggle', {"isOn": 0})//关闭在线标绘弹窗
    } else if (v === 'AnalysisDetailPop') {
      this.analysisDetail = null;
    }else if(v==='relatedResources'){
      this.relatedResources=null;
    }
  }

  /**
   * 按钮初始化
   */
  getButtonList(v?: Type.ButtonDetail) {
    //未传入v,表示初始化第一层级按钮
    if (!v) {
      this.buttonList = []; //清空按钮容器
    } else {
      this.dropMenu = [];
    }
    Api.getBimTabsWithReport({
      projectName: this.projectName,
      projectId: this.projectId,
      appCode: this.projectCode ?? '',
      parentId: v ? v.id : '',
    }).then(res => {
      if (res.errcode !== 0 || !res.data) return this.$message.warn(res.errmsg as string);
      if (!v) {
        this.buttonList = res.data;
        if (this.buttonList.length == 0) return this.componentCode = null;
        this.componentCode = this.buttonList[0].componentCode ?? '';
        this.clickTab = this.buttonList[0].tabName ?? '';
        this.isAnalysisShow = this.buttonList[0].analysisColumn === '是';
        this.submitMessage('CameraView_Toggle', {isOn: this.buttonList[0].analysisColumn === '是' ? 0 : 1})
      } else {
        //加载不同组件
        this.componentCode = v.componentCode;
        this.clickTab = v.tabName;
        this.tabName = v.tabName;
        this.dropMenu = res.data;
        this.isAnalysisShow = v.analysisColumn === '是';
        this.submitMessage('CameraView_Toggle', {isOn: v.analysisColumn === '是' ? 0 : 1})
      }
    })
  }

  /*
   * @methodName:调取的接口名称
   * @data:参数（例如{code:'000',type:1}）
   */
  submitMessage(methodName: string, data?: { [propsName: string]: any }) {
    let value = {methodName: methodName};
    if (data) {
      //@ts-ignore
      this.$set(value, 'data', data)
    }
    (window as any).connection.emitUIInteraction(JSON.stringify(value)).then(res => console.log('发送消息', res, value));
  }

  toInfo() {
    const {href} = this.$router.resolve({
      name: "multiProject"
    });
    window.location.href = href;
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/public.module.less';

.commonButton {
  border: 0px;
  font-size: 17px;
  margin: 0 0.5vw;
  width: 6vw;
}

#mainLive {
  .full;
  .scrollbar-default;
  .flex;
  overflow: hidden;

  .title-container {
    background: url("../../../src/assets/extends/cim/top_bg.png");
    background-size: 100% 100%;
    .flex;
    height: 80px;
    width: 100%;
    z-index: 2;
    padding-top: 10px;

    & > span {
      color: #fff;
      line-height: 40px;
      text-align: center;
    }

    .header-menu {
      line-height: 30px;
      padding-left: 1.25vw;
      width: 32vw;
      font-size: 32px;
      font-weight: bold;
      color: #bdf6f9;
      background: radial-gradient(#66c7e2 0%, #b6e9f3 100%);
      -webkit-background-clip: text;
    }

    .button-list {
      display: flex;
      z-index: 9;
      width: 45vw;

      .button {
        background: url("../../../src/assets/extends/cim/btn_nor.png");
        background-size: 100% 100%;
        color: white;
        .commonButton;
      }

      .button-hover {
        background: url("../../../src/assets/extends/cim/btn_pr.png");
        background-size: 100% 100%;
        color: #7aecff;
        .commonButton;
      }
    }

    .workflow-center {
      padding-top: 5px;
      margin-left: 2vw;
    }
  }
}

ul[class~="ant-dropdown-menu"] {
  background: url("../../../src/assets/extends/bim/kuang.png");
  background-size: 100% 100%;
}

li[class~="ant-dropdown-menu-item"] {
  color: #ffffff;
  font-size: 15px;
  font-family: SimHei, serif;
  text-align: center;
  background: url("../../../src/assets/extends/bim/line.png");
  background-size: 100% 100%;
}

li[class~="ant-dropdown-menu-item"]:hover {
  background-color: transparent;
  color: #009bc6;
}
</style>
