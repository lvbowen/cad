<template>
  <article class="main">
    <!--挂载报表-->
    <report
      :key="index"
      :options="item"
      v-for="(item, index) in reportCollections"
    ></report>
    <rdp-report
      v-if="reportRDPCollections"
      :dataRDP="reportRDPCollections"
    ></rdp-report>
    <!--END-->
    <a-spin
      wrapperClassName="spinContainer"
      :spinning="spinShow"
      size="large"
      :tip="spinText"
    >
      <iframe
        id="iframe"
        class="map"
        :src="BIMURL"
        allowfullscreen="true">
      </iframe>
      <div class="content">
        <div class="header">
          <img v-if="icons" :src="icons" alt="" />
          <p class="headerName">{{ projectName }}</p>
        </div>
        <div class="button_list">
          <template v-for="item in buttonList">
            <a-dropdown :key="item.id" :trigger="['click']">
              <a-menu slot="overlay" v-if="dropMenu.length !== 0">
                <template v-for="menuItem in dropMenu">
                  <a-menu-item
                    :key="menuItem.id"
                    @click="clickButtonMenu(menuItem)"
                  >{{ menuItem.tabName }}
                  </a-menu-item>
                </template>
              </a-menu>
              <a-button
                :class="
                  clickTab === item.tabName ? 'button_hover' : 'button_only'
                "
                size="large"
                @click="clickButton(item)"
              >{{ item.tabName }}
              </a-button>
            </a-dropdown>
          </template>
        </div>
        <iframe
          allowtransparency="true"
          frameborder="0"
          style="margin-left: 0.52vw; z-index: 1; margin-top: -10px"
          width="255"
          height="75"
          scrolling="no"
          src="//tianqi.2345.com/plugin/widget/index.htm?s=1&z=1&t=1&v=0&d=1&bd=0&k=&f=ffffff&ltf=009944&htf=cc0000&q=1&e=0&a=1&c=54511&w=255&h=98&align=center"
        ></iframe>
        <div class="header_pic">
          <a-tooltip v-if="levelShow">
            <template slot="title"> BIM平台</template>
            <img :src="top_icon1" @click="toBIMView" class="header_img" />
          </a-tooltip>
          <a-tooltip>
            <template slot="title"> 业务平台</template>
            <img
              :src="top_icon3"
              @click="toWorkFlowCenter"
              class="header_img"
            />
          </a-tooltip>
          <a-dropdown :trigger="['click']">
            <div class="user-info">
              <div class="avatar-box">
                <a-tooltip>
                  <template slot="title"> 当前用户</template>
                  <img
                    :src="pic1"
                    style="height: 39px; width: 39px; margin-right: 5px"
                  />
                </a-tooltip>
                <span style="color: #ffffff">{{ userInfo.name }}</span>
                <i class="icon aufontAll h-icon-all-caret-down"></i>
              </div>
            </div>
            <div class="info-box" slot="overlay">
              <ul>
                <li class="user" @click="toUserInfo">
                  <div class="user-name">
                    <span style="margin-left: 3px">{{ userInfo.name }}</span>
                  </div>
                </li>
                +
                <li>
                  <a @click="toAdmin">
                    <i class="icon aufontAll h-icon-all-disassembly-o"></i>
                    {{ $t("languages.common.backStageManager") }}
                  </a>
                </li>
                <li v-if="isShowToggle">
                  <a @click="toggleLanguage" class="toggle-lang">
                    <i class="icon aufontAll h-icon-all-swap-o"></i>
                    {{ $t("languages.common.switch") }}
                    <span
                      :class="$i18n.locale === 'zh' ? 'active' : ''"
                    >中</span
                    >
                    /
                    <span
                      :class="$i18n.locale === 'en' ? 'active' : ''"
                    >En</span
                    >
                  </a>
                </li>
                <li v-if="isShowUpdatePwdBtn">
                  <a @click="showModal = true">
                    <i class="icon aufontAll h-icon-all-key-o"></i>
                    {{ $t("languages.common.changePwd") }}
                  </a>
                </li>
                <li v-if="!isDingTalk">
                  <a @click="logout">
                    <i class="icon aufontAll h-icon-all-poweroff-o"></i>
                    {{ $t("languages.common.exitSys") }}
                  </a>
                </li>
              </ul>
            </div>
          </a-dropdown>
        </div>
      </div>
    </a-spin>
    <measure-overall
      v-if="componentCode === 'measureOverall'"
      :projectCode="projectCode"
      :projectName="projectName"
      @modelHight="modelHight"
      @getShowHideData="getShowHideData"
    ></measure-overall>
    <schedule-analysis
      @getShowHideData="getShowHideData"
      @getGanttModel="getGanttModel"
      @getscheduleModel="getScheduleModel"
      @getAllModel="getAllModel"
      @clearModel="clearModel"
      v-if="componentCode == 'scheduleAnalysis'"
    ></schedule-analysis>
    <schedule-analysis-v3
      @getShowHideData="getShowHideData"
      @getGanttModel="getGanttModel"
      @getscheduleModel="getScheduleModel"
      @getAllModel="getAllModel"
      @clearModel="clearModel"
      v-if="componentCode == 'scheduleAnalysisV3'"
    ></schedule-analysis-v3>
    <measure-overall-v3
      v-if="componentCode === 'measureOverallV3'"
      :projectCode="projectCode"
      :projectName="projectName"
      @modelHight="modelHight"
      @getShowHideData="getShowHideData"
    ></measure-overall-v3>
    <measure-analysis-v3
      :projectCode="projectCode"
      :projectName="projectName"
      @modelHight="modelHight"
      v-if="componentCode === 'measureAnalysisV3'"
    ></measure-analysis-v3>
    <measure-view-v3
      v-if="componentCode === 'measureAnalysisV3'"
      :projectCode="projectCode"
      :projectName="projectName"
    ></measure-view-v3>
    <preview
      :modelHight="modelHight"
      v-if="componentCode === 'qualityBimInspect'"
      @modelHight="modelHight"
    />
    <measure-analysis
      :projectCode="projectCode"
      :projectName="projectName"
      @modelHight="modelHight"
      v-if="componentCode === 'measureAnalysis'"
    ></measure-analysis>
    <schedule-4D5D
      @getShowHideData="getShowHideData"
      @getGanttModel="getGanttModel"
      @modelDeduceManager="modelDeduceManager"
      v-if="componentCode === 'schedule4D5D'"
    ></schedule-4D5D>
    <schedule-4D5D-v3
      @getShowHideData="getShowHideData"
      @getGanttModel="getGanttModel"
      @modelDeduceManager="modelDeduceManager"
      v-if="componentCode === 'schedule4D5DV3'"
    ></schedule-4D5D-v3>
    <model-manage
      ref="ModelManageInstance"
      v-if="componentCode === 'modelManage'"
      :projectCode="projectCode"
      :projectName="projectName"
      :tTreeData="sceneLayers"
      @modelHight="modelHight"
      @getShowHideData="getShowHideData"
      @getSceneLayers="getSceneLayers"
      @getSymbolLayers="getSymbolLayers"
      @locationSymbolLayer="locationSymbolLayer"
      @setLayersVisible="setLayersVisible"
      @setSceneLayerOpacity="setSceneLayerOpacity"
    ></model-manage>
    <info-pop
      v-if="infoShow === 'popShow'"
      :projectCode="projectCode"
      :projectId="projectId"
      :projectName="projectName"
      modelType="superMap"
      :SMID="SMID"
      :LAYERNAME="LAYERNAME"
    ></info-pop>
    <boat-info
      :devicesData="devicesData"
      :projectCode="projectCode"
      @drawPolyTrail="drawPolyTrail"
      @clearTail="clearTail"
      v-if="componentCode === 'boatInfo'"
    ></boat-info>
    <mark-pop
      v-if="infoShow === 'coordinate'"
      :projectCode="projectCode"
      :dataId="dataId"
      :schemaCode="schemaCode"
    ></mark-pop>
    <!--    <devices-->
    <!--      :devicesData="devicesData"-->
    <!--      v-if="componentCode === 'equipmentInfo'"-->
    <!--    ></devices>-->
    <devices-tree
      v-if="
        componentCode === 'equipmentTree' ||
          componentCode === 'equipmentInfo' ||
          componentCode === 'boatInfo'
      "
      :projectCode="projectCode"
      @displayMarkerSymbol="displayMarkerSymbol"
      @locationMarkerSymbol="locationMarkerSymbol"
    ></devices-tree>
    <measure-view
      v-if="componentCode === 'measureAnalysis'"
      :projectCode="projectCode"
      :projectName="projectName"
    ></measure-view>
    <shcedule-view
      @getfillModel="getFillModel"
      @getfinshModel="getFinshModel"
      @getReportModel="getReportModel"
      @getscheduleModel="getScheduleModel"
      @getfillingModel="getFillingModel"
      @getAllModel="getAllModel"
      @getControlModelDisplay="getControlModelDisplay"
      @clearModel="clearModel"
      v-if="componentCode === 'shceduleView'"
    ></shcedule-view>
    <shcedule-view-v3
      @getfillModel="getFillModel"
      @getfinshModel="getFinshModel"
      @getReportModel="getReportModel"
      @getscheduleModel="getScheduleModel"
      @getfillingModel="getFillingModel"
      @getAllModel="getAllModel"
      @clearModel="clearModel"
      v-if="componentCode === 'shceduleViewV3'"
    ></shcedule-view-v3>
    <analysis
      :key="markNum"
      v-if="isAnalysisShow"
      :projectCode="projectCode"
      :projectName="projectName"
      :tabName="tabName"
      :componentCode="componentCode"
      :locationData="locationData"
      @createCustomEntity="createCustomEntity"
      @clearCustomEntity="clearCustomEntity"
      @modelHight="modelHight"
    ></analysis>
    <person-manage
      v-if="componentCode === 'personMonitor'"
      :projectCode="projectCode"
      :projectName="projectName"
      @drawMonitorMarker="drawMonitorMarker"
      @trajectoryPlayback="trajectoryPlayback"
      @locationMonitorMarker="locationMonitorMarker"
      @removeTrajectory="removeTrajectory"
      @removeAllElectMonitor="removeAllElectMonitor"
      @addElectFence="addElectFence"
      @removeElectFence="removeElectFence"
    ></person-manage>
    <ship-manage
      v-if="componentCode === 'boatMonitor'"
      :projectCode="projectCode"
      :projectName="projectName"
      @drawMonitorMarker="drawMonitorMarker"
      @trajectoryPlayback="trajectoryPlayback"
      @locationMonitorMarker="locationMonitorMarker"
      @removeTrajectory="removeTrajectory"
      @removeAllElectMonitor="removeAllElectMonitor"
      @addElectFence="addElectFence"
      @removeElectFence="removeElectFence"
    ></ship-manage>
    <vehicle-manage
      v-if="componentCode === 'carMonitor'"
      :projectCode="projectCode"
      :projectName="projectName"
      @drawMonitorMarker="drawMonitorMarker"
      @trajectoryPlayback="trajectoryPlayback"
      @locationMonitorMarker="locationMonitorMarker"
      @removeTrajectory="removeTrajectory"
      @removeAllElectMonitor="removeAllElectMonitor"
      @addElectFence="addElectFence"
      @removeElectFence="removeElectFence"
    ></vehicle-manage>
    <b-i-m-fill
      v-if="componentCode === 'bimFill'"
      ref="BimFillInstance"
      :modelHighLight="modelHight"
    />
    <smart-construction
      v-if="componentCode === 'smartConstruction'"
      :projectCode="projectCode"
      :projectName="projectName"
      @locationSmartModel="locationSmartModel"
    ></smart-construction>
    <construction-site
      v-if="componentCode === 'ConstructionSite'"
      @getAllModel="getAllModel"
      @clearModel="clearModel"
    ></construction-site>
  </article>
</template>

<script lang="ts">
/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import {
  Component,
  InjectReactive,
  Prop,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import env from "@/config/env";
import * as Api from "../../service/api";
import { Button, Icon, Dropdown, Menu, Spin, Tooltip } from "@h3/antd-vue";
//计量组件
import MeasureOverall from "./measure/measureOverall.vue";
import MeasureAnalysis from "./measure/measureAnalysis.vue";
import MeasureOverallV3 from "./measureV3/measureOverallV3.vue";
import MeasureAnalysisV3 from "./measureV3/measureAnalysisV3.vue";
//进度组件
import ScheduleAnalysis from "./schedule/scheduleAnalysis.vue";
import ScheduleAnalysisV3 from "./schedule/scheduleAnalysisV3.vue";
import schedule4D5D from "./schedule/schedule4D5D.vue";
import schedule4D5DV3 from "./schedule/schedule4D5DV3.vue";
//质量组件
import QualityBimInspect from "./quality/qualityBimInspect.vue";
import QualityPreview from "../qualityModule/QualityPreview";
import BIMModelFill from "../BIMModelFill/BIMModelFill";
//安全分析组件
import Analysis from "./analysis/analysis.vue";
//模型管理组件
import ModelManage from "./modelManage/modelManage.vue";
//设备管理组件
import DevicesTree from "./device/deviceTree.vue";
import PersonManage from "./device/personnelEquipment.vue"; //人员管理
import ShipManage from "./device/shipEquipment.vue"; //船舶管理
import VehicleManage from "./device/vehicleEquipment.vue"; //车辆管理
//弹窗组件
import InfoPop from "./infoPop/infoPop.vue";
// import Devices from "../Devices/Devices"; //弹窗-设备监控设备组件
import BoatInfo from "./infoPop/boatInfo.vue"; //弹窗-传播监控设备组件
import MarkPop from "./infoPop/markPop.vue"; //弹窗-标签组件（安全分析）

//智慧工地
import smartConstruction from "./smartConstruction/constructTree.vue";

//报表
import RdpReport from "./rdpReports/rdpReports.vue"; //RdpReport
import Report from "../../basicCustomComponent/IndependentReport/Report"; //云枢报表

//看板
import ShceduleView from "./displayBoard/shceduleView.vue";
import ShceduleViewV3 from "./displayBoard/shceduleViewV3.vue";
import MeasureView from "./displayBoard/measureView.vue";
import ConstructionSite from "./device/ConstructionSite.vue";

import MeasureViewV3 from "./displayBoard/measureViewV3.vue";

import OAuthApi from "@/apis/oauth";
import { namespace } from "vuex-class";
import site from "@/config/site";
import top_icon3 from "../../../src/assets/extends/bim/top_icon3.png";
import top_icon1 from "../../../src/assets/extends/bim/top_icon1.png";
import pic1 from "../../../src/assets/extends/bim/pic1.png";

import * as Type from "../../../extends/type";
import * as Constant from "../../../extends/constant";

import { IndependentReportControl } from "../../basicCustomComponent";

import { Layer } from "./type";

import LoginHelper from "../../../src/views/login/loginHelper";

const icon = require("@/assets/icons/appicon.svg");

const WorkflowCenterModule = namespace("WorkflowCenter/WorkflowCenter");

const SystemModule = namespace("System/System");


class LayerC implements Layer {
  constructor(
    public layerName: string,
    public layerType: string,
    public layerID: string,
    public layerAlias: string,
    public visable: boolean,
    public opacity: number,
    public symbolPath?: string,
    public symbolId?: string
  ) {}
}

@Component({
  name: "BIMPlatform",
  components: {
    Report,
    RdpReport,
    ASpin: Spin,
    ADropdown: Dropdown,
    ATooltip: Tooltip,
    AButton: Button,
    AIcon: Icon,
    AMenuDivider: Menu.Divider,
    AMenu: Menu,
    AMenuItem: Menu.Item,

    Preview: QualityPreview,
    BIMFill: BIMModelFill,

    MeasureOverall,
    MeasureAnalysis,
    MeasureOverallV3,
    MeasureAnalysisV3,
    MeasureViewV3,
    MeasureView,
    ModelManage,
    ScheduleAnalysis,
    ScheduleAnalysisV3,
    schedule4D5D,
    schedule4D5DV3,
    QualityBimInspect,
    InfoPop,
    // Devices,
    DevicesTree,
    ShceduleView,
    ShceduleViewV3,
    BoatInfo,
    MarkPop,
    PersonManage,
    ShipManage,
    VehicleManage,
    Analysis,
    ConstructionSite,
    smartConstruction,
  },
})
export default class BIMPlatform extends Vue {
  @InjectReactive("bimUrl") BIMURL?: string;

  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;

  @Ref()
  public ModelManageInstance?: ModelManage;

  @Ref()
  public BimFillInstance?: BIMModelFill;
  /* 报表相关  */

  //报表控制器实例
  reportControl: IndependentReportControl = new IndependentReportControl(this);

  //template语法使用配置List
  reportCollections: Array<unknown> = [];
  reportRDPCollections: any = null;

  /* End */

  BIM_URL: string = `${env.apiHost}/`;

  top_icon3: any = top_icon3;
  top_icon1: any = top_icon1;
  pic1: any = pic1;

  buttonList: Array<any> = [];
  componentCode: string = ""; //用于保存选择按钮
  tabName: string = "";
  dropMenu: Array<any> = [];
  projectName: string = "二七路隧道";
  projectCode: string = "KCGL";
  projectId: string = "";
  icons: string = "";

  SMID: Array<any> = [];
  LAYERNAME: string = "";
  devicesData: object = {};
  indexDevices: number = 0;
  clickTab: string = "";
  devicesId: string = "";
  releaseModelSchedule: string = "";
  idList: object = {};
  boatFenceList: Array<object> = [];
  timer: any = null;
  devicesIdentifier: number = 1;
  spinShow: boolean = false;
  fillModel: object = {};
  finshModel: object = {};
  reportModel: object = {};
  scheduleAllModel: Array<object> = [];
  scheduleModel: object = {};
  QualityModel: object = {};
  fillingModel: object = {};
  GantModel: object = {};
  DeduceManager: object = {};
  isAnalysisShow: boolean = false; //控制分析模块显隐
  infoShow: string = ""; //用于判断是否展示infoPop
  spinText: string = "加载中，请稍后！"; //用于展示地图加载进度
  locationData: object = {
    longitude: "",
    latitude: "",
    height: "",
  };
  dataId: Array<any> = [];
  schemaCode: string = "";

  globeViewer = null;
  feature = null;
  projectInfo = null;
  location = null;
  levelShow: boolean = false;
  markNum: number = 0;
  getinitData: boolean = true;
  isSmartWindowShow: boolean = false; //智慧工地操作栏显隐

  sceneLayers: {
    S3MLayers: Layer[];
    OSGBLayers: Layer[];
    DOMLayers: Layer[];
    DEMLayers: Layer[];
    markerLayers: Layer[];
    modelLayers: Layer[];
    planeLayers: Layer[];
  } = {
    S3MLayers: [],
    OSGBLayers: [],
    DOMLayers: [],
    DEMLayers: [],
    markerLayers: [],
    modelLayers: [],
    planeLayers: [],
  };

  /**
   * 点击按钮
   */
  clickButton(item) {
    this.dropMenu = [];
    this.reportCollections = [];
    this.reportRDPCollections = null;
    if (item.reportCode) {
      this.getReport(item.reportCode);
      this.componentCode = "";
    }
    if (item.rdpReport) {
      this.reportRDPCollections = item.rdpReport;
      this.componentCode = "";
    }
    this.rightMenuItem(this.componentCode === "bimFill");
    Api.getBimTabsWithReport({
      projectName: this.projectName as string,
      projectId: this.projectId as string,
      appCode: this.projectCode as string, //this.projectCode,
      parentId: item.id as string,
    }).then((res) => {
      if (!res.data) return;
      if (res.data.length > 0 && this.getinitData) {
        this.getinitData = false;
        this.clickButtonMenu(res.data[0]);
      }
      if (res.data.length !== 0) return (this.dropMenu = res.data);
      this.isAnalysisShow = item.analysisColumn === "是";
      this.markNum += 1;
      //加载不同组件
      this.componentCode = item.componentCode;
      this.clearModelControl()
      this.clickTab = item.tabName;
      this.tabName = item.tabName;
      if (this.componentCode !== "equipmentTree") {
        //清除围栏/船舶
        this.clearBoatFence();
        //  清除轨迹
        this.clearTail();
        //清除安全分析标签
        this.clearCustomEntity();
      }
    });
  }

  /**
   * 点击按钮下拉框选项
   */
  clickButtonMenu(menuItem) {
    let _resultobj = {
      actionData: null,
      actionName: "stopDeduce",
      methodName: "modelDeduceManager",
      options: {
        duration: 2000,
        isLocation: true,
        speed: 1,
      },
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
    this.isAnalysisShow = menuItem.analysisColumn === "是";
    this.markNum += 1;
    this.componentCode = menuItem.componentCode;
    this.clickTab = menuItem.parentTabName;
    this.tabName = menuItem.tabName;
    this.reportCollections = [];
    this.reportRDPCollections = null;
    if (menuItem.reportCode) {
      this.getReport(menuItem.reportCode);
      this.componentCode = "";
    }
    if (menuItem.rdpReport) {
      this.reportRDPCollections = menuItem.rdpReport;
      this.componentCode = "";
    }
    if (this.componentCode != "equipmentTree") {
      // this.clearVideo()
      //清除围栏/船舶
      this.clearBoatFence();
      //清除轨迹
      this.clearTail();
      //清除安全分析标签
      this.clearCustomEntity();
      //进入模型控制
      this.clearModelControl();
    } else {
      this.indexDevices = 0;
      this.drawBoatFence();
    }
    this.rightMenuItem(this.componentCode === "bimFill");
  }

  /**
   * 模型右键菜单栏添加(移除)模型填报接口
   */
  rightMenuItem(isShow) {
    const data = isShow
      ? {
          type: "GET-LAYERS-MSG",
          text: "模型填报",
          method: "getLayersMsg",
          childs: [],
        }
      : { type: "REMOVE-LAYERS-MSG", method: "removeLayersMsg", childs: [] };
    let _resultobj = {
      methodName: isShow ? "addRightMenuItem" : "removeRightMenuItem",
      data: data,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 进入模型控制
   */
  clearModelControl() {
    if(this.componentCode == "shceduleViewV3" || this.componentCode =="shceduleView") {
      let _resultobj = {
        methodName: "enterModelControl",
        data: {
          isOpen: true,
        }
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }else {
      let _resultobj = {
        methodName: "enterModelControl",
        data: {
          isOpen: false,
        }
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  /**
   * 清除船舶和围栏（boatInfo.vue）
   */
  clearBoatFence() {
    let _resultobj = {
      methodName: "removePolygons",
      data: this.boatFenceList,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 清除轨迹（boatInfo.vue）
   */
  clearTail() {
    let _resultobj = {
      methodName: "removePolyLine",
      data: this.idList,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
    this.idList = {};
  }

  /**
   * 清除安全标签
   */
  clearCustomEntity() {
    let _resultobj = {
      methodName: "clearCustomEntity",
      data: [],
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 画船舶和围栏（boatInfo.vue）
   */
  drawBoatFence() {
    this.boatFenceList = [];
    //显示围栏
    Api.getBoatFence({
      appCode: this.projectCode as string,
      projectName: this.projectName as string,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      let _resultobj = {
        methodName: "drawMultiPolygon",
        data: res.data,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
      for (let i = 0; i < res.data.properties?.id.length; i++) {
        this.boatFenceList.push({ id: res.data.properties?.id[i] });
      }
    });
  }

  drawDevice() {
    Api.listAllDevice({
      appCode: this.projectCode,
      projectId: this.projectId,
    }).then((res) => {
      if (!res.data) return;
      let _resultobj = {
        methodName: "drawImageEntity",
        data: res.data,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    });
    this.indexDevices = 1;
    this.devicesIdentifier = 1;
  }

  moveEntity() {
    Api.listAllDevice({
      appCode: this.projectCode,
      projectId: this.projectId,
    }).then((res) => {
      if (!res.data) return;
      let _resultobj = {
        methodName: "moveEntity",
        data: res.data,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    });
  }

  /**
   * 画轨迹（boatInfo.vue）
   */
  drawPolyTrail(data) {
    let _resultobj = {
      methodName: "drawMultiPolyLine",
      data: data,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
    //保存id————用于后面清除
    this.$set(this.idList, "id", data.properties?.id);
    // this.idList.push({id:res.data.properties?.id});
  }

  /**
   * 数据定位(智慧工地)
   * modelData  数据
   * modelType string 类型（person、equipment、environment、video）
   */
  locationSmartModel(modelId: string, modelType: string, modelData: any) {
    let _resultobj = {
      methodName: "locationSmartModel",
      data: {
        modelId: modelId,
        modelType: modelType,
        modelData: modelData,
      },
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    console.log("locationSmartModel", _resultobj);
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 控制操作面板(智慧工地)
   * isShow boolean 是否显示操作面板
   */
  showOrHideSmartWindow(isShow: boolean) {
    this.clearModelControl()
    this.isSmartWindowShow = isShow;
    const _resultobj = {
      methodName: "showOrHideSmartWindow",
      data: {
        isShow: isShow,
      },
    };
    console.log("showOrHideSmartWindow", _resultobj);
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  getShowHideData(isShow, tabName, idList) {
    Api.getSelectedModel({
      tabName: tabName,
      idList: idList.length == 0 ? [] : idList,
      appCode: this.projectCode,
      projectName: this.projectName,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      if (!res.data) return;
      //与地图交互(显)
      let _resultobj = {
        methodName: isShow ? "controlFeatureShow" : "controlFeatureHide", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
        data: res.data,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    });
  }

  displayMarkerSymbol(isShow, idList) {
    //图片标注显隐控制
    let _resultobj = {
      methodName: "displayMarkerSymbol",
      data: {
        symbolId: idList,
        isShow: isShow,
      },
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  locationMarkerSymbol(idList) {
    //图片标注显隐控制
    let _resultobj = {
      methodName: "locationMarkerSymbol",
      data: {
        symbolId: idList,
      },
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 创建标签，定位标签
   * @param value 传入数据
   */
  createCustomEntity(value) {
    let _resultobj = {
      methodName: "createCustomEntity", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
      data: value,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  modelHight(dataList) {
    //与地图交互(高亮)
    console.log(dataList);
    let _resultobj = {
      methodName: "controlFeatureHighlight", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
      data: dataList,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 初始化项目模型
   */
  init3dServer() {
    const token = localStorage.getItem("token");
    let _resultobj = {
      methodName: "change3Dserver", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
      data: {
        list: {
          url: this.BIM_URL + `api/runtime/query/list`,
          params: {
            filters: [
              {
                propertyCode: "owner_project",
                propertyType: 0,
                propertyValue: this.projectName,
                propertyValueName: "",
              },
            ],
            mobile: false,
            queryCode: this.projectCode + "_model_config",
            schemaCode: this.projectCode + "_model_config",
            page: 0,
            size: 999999,
          },
        },
        datasource: {
          url: this.BIM_URL + `api/runtime/form/load`,
          params: {
            schemaCode: this.projectCode + `_model_config`,
            objectId: "",
            sheetCode: this.projectCode + `_model_config`,
          },
        },
        token: token,
      },
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 按钮初始化
   */
  initButton() {
    const { projectConfig } = this;
    if (!projectConfig) return;
    if (projectConfig.projectLevel !== Constant.ProjectLevel["项目"]) {
      this.levelShow = true;
    } else {
      this.levelShow = false;
    }
    this.buttonList = []; //清空按钮容器
    Api.getBimTabsWithReport({
      projectName: this.projectName,
      projectId: this.projectId,
      appCode: this.projectCode, //this.projectCode,
      parentId: "",
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      if (res.data) {
        this.buttonList = res.data;
        if (this.buttonList.length == 0) return (this.componentCode = "");
        this.clickButton(this.buttonList[0]);
        this.componentCode = this.buttonList[0]["componentCode"];
      }
    });
  }

  //子向父传值 监听 实现模型交互
  @Watch("GantModel")
  getGanttModel(val: object) {
    if (val) {
      let _resultobj = {
        methodName: "controlFeatureHighlight", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
        data: val,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  @Watch("DeduceManager")
  modelDeduceManager(val: object) {
    if (val) {
      let _resultobj = val;
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  @Watch("fillModel")
  getFillModel(val: object) {
    if (val) {
      let _resultobj = {
        methodName: "modelLocationAndSetLayerColor", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
        data: val,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  @Watch("finshModel")
  getFinshModel(val: object) {
    if (val) {
      let _resultobj = {
        methodName: "controlFeatureHighlight", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
        data: val,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  @Watch("reportModel")
  getReportModel(val: object) {
    if (val) {
      let _resultobj = {
        methodName: "modelLocationAndSetLayerColor", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
        data: val,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  @Watch("scheduleModel")
  getScheduleModel(val: object) {
    if (val) {
      let _resultobj = {
        methodName: "controlFeatureHighlight", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
        data: val,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  @Watch("QualityModel")
  getQualityModel(val: object) {
    if (val) {
      let _resultobj = {
        methodName: "controlFeatureHighlight", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
        data: val,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  @Watch("fillingModel")
  getFillingModel(val: object) {
    if (val) {
      let _resultobj = {
        methodName: "controlFeatureHighlight", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
        data: val,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  @Watch("scheduleAllModel")
  getAllModel(val: object) {
    if (val) {
      let _resultobj = {
        methodName: "controlModelSchedule", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
        location: true,
        data: val,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  getControlModelDisplay(val: object) {
    if (val) {
      let _resultobj = {
        methodName: "controlModelDisplay", //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
        location: true,
        data: val,
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  @Watch("releaseModelSchedule")
  clearModel(val: string) {
    if (val) {
      let _resultobj = {
        methodName: val, //调用BIM模型平台的方法名称（选中图层的方法名是在这个）
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(_resultobj, "*");
    }
  }

  @Watch("devicesIdentifier", { immediate: true })
  devicesIdentifierListener(code: number) {
    this.timer = setInterval(() => {
      this.moveEntity();
    }, 30000);
  }

  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
    this.devicesIdentifier = 0;
    const { mapListener } = this;
    window.removeEventListener("message", mapListener);
  }

  created() {
    this.getUserInfo();
  }

  mounted() {
    this.spinShow = true;
    this.spinText = "加载模型\n20%";
    this.projectCode = this.$route.query.projectCode as string;
    this.projectId = this.$route.query.projectId as string;
    this.projectName = this.$route.query.projectName as string;
    this.icons = this.$route.query.icon as string;
    this.initButton();
    const { mapListener } = this;
    window.addEventListener("message", (event) => mapListener(event));
  }

  destroyed() {
    window.removeEventListener("message", (event) => this.mapListener(event));
    this.$message.destroy();
  }

  mapListener(event) {
    //工程算量
    if (
      event.data.modelInfo &&
      event.data.layerInfo &&
      this.componentCode === "modelManage"
    ) {
      this.ModelManageInstance?.receiveModelInfoFromBim(
        event.data.modelInfo,
        event.data.layerInfo
      );
    }
    //模型填报
    if (event.data.layersMsg && this.componentCode === "bimFill") {
      this.BimFillInstance?.receiveLayersMSGFromBim(event.data.layersMsg);
    }
    if (event.data.sceneLayers) {
      //场景图层
      this.sceneLayers.S3MLayers = [];
      this.sceneLayers.OSGBLayers = [];
      this.sceneLayers.DOMLayers = [];
      this.sceneLayers.DEMLayers = [];
      for (let key in event.data.sceneLayers) {
        if (key === "S3MLayers") {
          if (event.data.sceneLayers[key].length > 0) {
            event.data.sceneLayers[key].forEach((e) => {
              this.sceneLayers.S3MLayers.push(
                new LayerC(
                  e.layerName,
                  e.layerType,
                  e.layerID,
                  e.layerAlias,
                  e.visable,
                  e.opacity
                )
              );
            });
          }
        } else if (key === "OSGBLayers") {
          if (event.data.sceneLayers[key].length > 0) {
            event.data.sceneLayers[key].forEach((e) => {
              this.sceneLayers.OSGBLayers.push(
                new LayerC(
                  e.layerName,
                  e.layerType,
                  e.layerID,
                  e.layerAlias,
                  e.visable,
                  e.opacity
                )
              );
            });
          }
        } else if (key === "DOMLayers") {
          if (event.data.sceneLayers[key].length > 0) {
            event.data.sceneLayers[key].forEach((e) => {
              this.sceneLayers.DOMLayers.push(
                new LayerC(
                  e.layerName,
                  e.layerType,
                  e.layerID,
                  e.layerAlias,
                  e.visable,
                  e.opacity
                )
              );
            });
          }
        } else if (key === "DEMLayers") {
          if (event.data.sceneLayers[key].length > 0) {
            event.data.sceneLayers[key].forEach((e) => {
              this.sceneLayers.DEMLayers.push(
                new LayerC(
                  e.layerName,
                  e.layerType,
                  e.layerID,
                  e.layerAlias,
                  e.visable,
                  e.opacity
                )
              );
            });
          }
        }
      }
    }
    if (event.data.symbolLayers) {
      this.sceneLayers.markerLayers = [];
      this.sceneLayers.modelLayers = [];
      this.sceneLayers.planeLayers = [];
      for (let key in event.data.symbolLayers) {
        if (key === "markerLayers") {
          if (event.data.symbolLayers[key].length > 0) {
            event.data.symbolLayers[key].forEach((e) => {
              let visable = true;
              if (e.optionConfig) {
                const optionConfig = JSON.parse(e.optionConfig);
                if (optionConfig) {
                  if (optionConfig.hasOwnProperty("isShowIcon")) {
                    visable = optionConfig.isShowIcon;
                  }
                }
              }
              this.sceneLayers.markerLayers.push(
                new LayerC(
                  e.symbolName,
                  "MARKER",
                  e.id,
                  e.modelName,
                  visable,
                  e.opacity,
                  e.symbolPath,
                  e.symbolId
                )
              );
            });
          }
        } else if (key === "modelLayers") {
          if (event.data.symbolLayers[key].length > 0) {
            event.data.symbolLayers[key].forEach((e) => {
              let visable = true;
              if (e.optionConfig) {
                const optionConfig = JSON.parse(e.optionConfig);
                if (optionConfig) {
                  if (optionConfig.hasOwnProperty("isShowIcon")) {
                    visable = optionConfig.isShowIcon;
                  }
                }
              }
              this.sceneLayers.modelLayers.push(
                new LayerC(
                  e.symbolName,
                  "MODEL",
                  e.id,
                  e.modelName,
                  visable,
                  e.opacity,
                  e.symbolPath,
                  e.symbolId
                )
              );
            });
          }
        } else if (key === "planeLayers") {
          if (event.data.symbolLayers[key].length > 0) {
            event.data.symbolLayers[key].forEach((e) => {
              let visable = true;
              if (e.optionConfig) {
                const optionConfig = JSON.parse(e.optionConfig);
                if (optionConfig) {
                  if (optionConfig.hasOwnProperty("isShowIcon")) {
                    visable = optionConfig.isShowIcon;
                  }
                }
              }
              this.sceneLayers.planeLayers.push(
                new LayerC(
                  e.symbolName,
                  "PLANE",
                  e.id,
                  e.modelName,
                  visable,
                  e.opacity,
                  e.symbolPath,
                  e.symbolId
                )
              );
            });
          }
        }
      }
    }
    this.globeViewer = event.data.globeViewer;
    this.feature = event.data.feature;
    this.projectInfo = event.data.projectInfo;
    this.location = event.data.location;
  }

  getReport(reportCode) {
    /**
     * 挂载报表
     */
    if (this.$el) {
      this.reportControl.setOptions({
        projectCode: this.projectCode,
        reportCode: reportCode,
        element: this.$el,
        update: (a) => (this.reportCollections = a),
        top: 70,
      });
    }
    /*
     * 挂载报表结束
     * */
  }

  @Watch("componentCode", { immediate: true })
  componentCodeListener(val: string) {
    if (val === "smartConstruction" && !this.isSmartWindowShow) {
      this.showOrHideSmartWindow(true);
    }
    if (val !== "smartConstruction" && this.isSmartWindowShow) {
      this.showOrHideSmartWindow(false);
    }
  }

  @Watch("globeViewer", { immediate: true })
  globeViewerListener(val: number) {
    if (val) {
      if (val == 0.5) {
        console.log("已加载50%,加载页面配置中");
        this.spinText = "加载页面配置中\n50%";
        this.init3dServer();
      } else if (val == 0.8) {
        console.log("已加载80%,构建场景并渲染");
        this.spinText = "构建场景并渲染\n80%";
        this.drawDevice();
      } else if (val == 1) {
        console.log("已加载100%，加载渲染配置");
        this.spinText = "加载渲染配置\n100%";
        this.getSceneLayers();
        this.getSymbolLayers();
        this.spinShow = false; //取消蒙层
      } else if (val == -1) {
        console.log("地图传来数据");
        //@ts-ignore
        this.$message.error("地图加载失败！");
        this.spinShow = false; //取消蒙层
      }
    }
  }

  @Watch("feature", { immediate: true })
  featureListener(val: object) {
    if (val) {
      this.infoShow = "popShow";
      this.SMID = val["ids"];
      this.LAYERNAME = val["layerName"];
    }
  }

  @Watch("projectInfo", { immediate: true })
  projectInfoListener(val: object) {
    if (val) {
      console.log("event.data.projectInfo", val);
      this.devicesData = [val];
      //@ts-ignore
      if (this.devicesData[0].type === "video") {
        this.componentCode = "equipmentInfo";
      } else if (this.devicesData[0].type === "coordinate") {
        this.infoShow = "coordinate";
        this.dataId = [this.devicesData[0].id];
        this.schemaCode = this.devicesData[0].schemaCode;
      } else {
        this.componentCode = "boatInfo";
      }
    }
  }

  @Watch("location", { immediate: true })
  locationListener(val: object) {
    if (val) {
      this.locationData = val;
    }
  }

  toWorkFlowCenter() {
    this.projectConfig?.updateProjectConfig(this.projectName, 2, null);
    //@ts-ignore
    this.$router.push({ name: "workbench" }).catch((err: any) => {
      err;
    });
  }

  toBIMView() {
    //@ts-ignore
    this.$router.push({ name: "BIMView" }).catch((err: any) => {
      err;
    });
  }

  @WorkflowCenterModule.Mutation("setAsideTitle") setAsideTitle: any;

  @WorkflowCenterModule.Mutation("setUserId") setUserId: any;

  @SystemModule.State("isAdmin") isAdmin: any;

  @SystemModule.Mutation("setIsAdmin") setIsAdmin: any;

  @SystemModule.Mutation("setAdmin") setAdmin: any;

  @SystemModule.Mutation("setRootAdmin") setRootAdmin: any;

  @Prop() subtitle?: string;

  get logo() {
    return site.logo;
  }

  get isShowToggle() {
    // @ts-ignore
    return this.$store.state.config.multiLanguageSwitch;
  }

  get isCloudPivot() {
    // 是否已打开内部维护组织开关
    // @ts-ignore
    return this.$store.state.config.cloudPivot;
  }

  get apiHost() {
    // @ts-ignore
    return window.config.apiHost;
  }

  get token() {
    return window.localStorage.getItem("token");
  }

  // 只有自维护的用户并且不是admin这个账户才能有修改密码入口 #39826
  isShowUpdatePwdBtn: boolean = true;

  // 用户信息
  userInfo: any = {};

  showModal: boolean = false;

  params: any = {
    oldPwd: "",
    newPwd: "",
    surePwd: "",
  };

  oldPwdErrTips: string = "";

  newPwdErrTips: string = "";

  surePwdErr: boolean = false;

  // 跳转到个人中心
  toUserInfo() {
    // @ts-ignore
    this.$router.push("/user").catch((err: any) => {
      err;
    });
  }

  // 跳转后台管理
  toAdmin() {
    const token = localStorage.getItem("token");
    // @ts-ignore
    if (this.isDingTalk && token) {
      //env.portalHost
      window.open(`${env.host}/admin?admin_token=${token}`, "_blank");
    } else {
      //env.portalHost
      window.open(`${env.host}/admin`, "_blank");
    }
  }

  // 退出登录confirm
  logoutConfirm() {
    console.log("退出登录confirm");
    const vm = this;
    // @ts-ignore
    vm.$confirm({
      // @ts-ignore
      title: this.$t("languages.common.tip.sureToLogOut").toString(),
      // @ts-ignore
      okText: this.$t("languages.common.tip.confirm").toString(),
      // @ts-ignore
      cancelText: this.$t("languages.common.tip.cancel").toString(),
      onOk() {
        vm.logout();
      },
    });
  }
  loginHelper = new LoginHelper();
  // 退出登录
  logout() {
    const redirectIP = env.redirectHost;
    const token: string = localStorage.getItem("token") || "";
    // this.loginHelper.removeUserPassword();
    // this.loginHelper.saveUserPasswordToLocalStorage();
    OAuthApi.logout({
      redirect_uri: `${redirectIP}/login`,
      access_token: token,
    }).then((res: any) => {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("expireTime");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("searchParams");
      // @ts-ignore
      this.$router.replace({ name: "login" });
    });
  }

  // 获取当前用户信息
  async getUserInfo() {
    const res = await OAuthApi.getUserInfo();

    if (res.errcode === 0) {
      const info: any = res.data;
      this.userInfo = info;
      this.setUserId(info);
      //@ts-ignore
      this.isShowUpdatePwdBtn =
        (res.data.relatedSyncType === "PUSH" ||
          this.$store.state.config.loginType === 0 ||
          this.$store.state.config.loginType === 2) &&
        res.data.username !== "admin"; // admin这个账号 hide || 或者开启了账号密码登陆的时候
      sessionStorage.setItem("user", JSON.stringify(info));
      // 判断当前用户角色
      const isAppAdmin: boolean = info.permissions.includes("APP_MNG");
      const isSysAdmin: boolean = info.permissions.includes("SYS_MNG");
      const isRootAdmin: boolean = info.permissions.includes("ADMIN");
      const isAdmin: boolean = isAppAdmin || isSysAdmin || isRootAdmin;
      this.setIsAdmin(isAdmin);
      this.setRootAdmin(isRootAdmin);
      this.setAdmin(isSysAdmin || isRootAdmin);
      // 禁止无权限访问流程查询页面
      //@ts-ignore
      if (
        !isSysAdmin &&
        !isRootAdmin &&
        this.$route.name &&
        ["queryInstance", "queryParticipantWorkItem"].includes(this.$route.name)
      ) {
        // @ts-ignore
        this.$router.replace({ name: "workbench" });
      }
      // 禁止超管访问流程委托页面
      // @ts-ignore
      if (
        isRootAdmin &&
        this.$route.name &&
        ["delegationWorkflow"].includes(this.$route.name)
      ) {
        // @ts-ignore
        this.$router.replace({ name: "workbench" });
        // this.$router.replace({name: "myUnfinishedWorkItem"});
      }
    }
  }

  /**
   * 切换多语言
   */
  toggleLanguage() {
    // @ts-ignore
    if (this.$i18n.locale === "zh") {
      // @ts-ignore
      this.$i18n.locale = "en";
    } else {
      // @ts-ignore
      this.$i18n.locale = "zh";
    }
    this.$forceUpdate();
    // @ts-ignore
    localStorage.setItem("locale", this.$i18n.locale);
  }

  /*
   * 重置密码错误提示
   */
  resetErrTips() {
    this.oldPwdErrTips = "";
    this.newPwdErrTips = "";
    this.surePwdErr = false;
  }

  cancel() {
    this.showModal = false;
    this.params = {
      oldPwd: "",
      newPwd: "",
      surePwd: "",
    };
    this.resetErrTips();
  }

  //设备（人、车、船）相关地图交互
  /**
   * 绘制船舶、车辆、人员接口
   */
  drawMonitorMarker(data) {
    let _resultobj = {
      methodName: "drawMonitorMarker",
      data: data,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 绘制轨迹，绘制轨迹的同时完成以下几个工作：
   * 1. 绘制设备移动的轨迹图
   * 2. 设置关联设备的位置为轨迹的起始点
   * 3. 启动设备沿轨迹移动至重点暂停
   */
  trajectoryPlayback(data) {
    let _resultobj = {
      methodName: "trajectoryPlayback",
      data: data,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 批量删除设备
   */
  removeMonitorMarkers(data) {
    let _resultobj = {
      methodName: "removeMonitorMarkers",
      data: data,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 删除轨迹
   */
  removeTrajectory(data) {
    let _resultobj = {
      methodName: "removeTrajectory",
      data: data,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 定位设备
   */
  locationMonitorMarker(data) {
    let _resultobj = {
      methodName: "locationMonitorMarker",
      data: data,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 删除所有设备、轨迹以及电子围栏
   */
  removeAllElectMonitor() {
    let _resultobj = {
      methodName: "removeAllElectMonitor",
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   * 显示电子围栏
   */
  addElectFence(data) {
    let _resultobj = {
      methodName: "addElectFence",
      data: data,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  /**
   *  删除电子围栏
   */
  removeElectFence(data) {
    let _resultobj = {
      methodName: "removeElectFence",
      data: data,
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
  }

  //获取场景图层
  getSceneLayers(): void {
    let obj = {
      methodName: "getSceneLayers",
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(obj, "*");
  }

  //设置图层显隐
  setSceneLayerVisible(
    layerId: string,
    layerType: string,
    visible: boolean
  ): void {
    let obj = {
      methodName: "setSceneLayerVisible",
      data: {
        layerId,
        layerType,
        visible,
      },
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(obj, "*");
  }

  setLayersVisible(item: { layers: Layer[]; visible: boolean }): void {
    item.layers.forEach((layer) => {
      if (layer.symbolId) {
        this.setSymbolLayerVisible(
          layer.layerID,
          layer.layerType,
          item.visible,
          layer.symbolPath as string
        );
      } else {
        this.setSceneLayerVisible(layer.layerID, layer.layerType, item.visible);
      }
    });
  }

  //设置图层透明度
  setSceneLayerOpacity(item: {
    layerId: string;
    layerType: string;
    opacity: number;
  }): void {
    let obj = {
      methodName: "setSceneLayerOpacity",
      data: {
        layerId: item.layerId,
        layerType: item.layerType,
        opacity: item.opacity,
      },
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(obj, "*");
  }

  //获取标号图层
  getSymbolLayers(): void {
    let obj = {
      methodName: "getSymbolLayers",
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(obj, "*");
  }

  //标号图层显隐控制
  setSymbolLayerVisible(
    symbolId: string,
    symbolType: string,
    visible: boolean,
    symbolPath: string
  ): void {
    let obj = {
      methodName: "setSymbolLayerVisible",
      data: {
        symbolId,
        symbolType,
        visible,
        symbolPath,
      },
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(obj, "*");
  }

  //标号图层定位
  locationSymbolLayer(layer: Layer): void {
    if (layer && layer.symbolId) {
      let obj = {
        methodName: "locationSymbolLayer",
        data: {
          symbolId: layer.layerID,
          symbolType: layer.layerType,
          symbolPath: layer.symbolPath,
        },
      };
      //@ts-ignore
      let frame1 = document.getElementById("iframe").contentWindow;
      frame1.postMessage(obj, "*");
    }
  }
}
</script>

<style lang="less" scoped>
@import "./BIMPlatform.module.less";

ul,
li {
  padding: 0;
  margin: 0;
  list-style: none;
}

.main {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  //height: calc(100vh);
  & > .spinContainer {
    white-space: pre;
  }

  /deep/ .ant-spin-nested-loading > div > .ant-spin .ant-spin-dot {
    position: absolute;
    top: 110%;
    left: 50%;
    margin: -10px;
  }

  /deep/ .ant-spin-nested-loading > div > .ant-spin .ant-spin-text {
    position: absolute;
    top: 112%;
    width: 100%;
    padding-top: 15px;
    text-shadow: 0 1px 2px #fff;
    font-size: 18px;
    font-weight: 500;
  }

  /deep/ .ant-spin-blur {
    height: calc(100vh);
  }

  .map {
    position: absolute;
    left: 0;
    width: 100%;
    border: 0;
    height: calc(100vh);
  }

  .content {
    z-index: 999;

    .header {
      width: 33.8541vw;
      height: 100%;
      display: flex;
      align-items: center;
      background: url("../../../src/assets/extends/bim/top_bg拷贝.png");
      background-size: 100% 100%;
      padding-left: 10px;
      z-index: 9;

      img {
        width: 55px;
        height: 55px;
        vertical-align: middle;
      }

      .headerName {
        margin-left: 20px;
        line-height: 50px;
        margin-right: 0px;
        margin-bottom: 19px;
        width: 393px;
        font-size: 32px;
        font-family: FZTieJinLiShu-S17S;
        font-weight: bold;
        color: #bdf6f9;
        background: radial-gradient(#66c7e2 0%, #b6e9f3 100%);
        -webkit-background-clip: text;
      }
    }

    .commonBtn() {
      width: 6.77vw;
      margin-left: 1.145vw;
    }

    .button_list {
      margin-left: -10.02vw;
      display: flex;
      z-index: 12;

      .button_only {
        .commonBtn;
        background: url("../../../src/assets/extends/bim/btn_nor.png");
        background-size: 100% 100%;
        border: 0px;
        color: white;
        font-family: SimHei;
        font-size: 17px;
      }

      .button_hover {
        .commonBtn;
        background: url("../../../src/assets/extends/bim/btn_pr.png");
        background-size: 100% 100%;
        border: 0px;
        color: #04c3ad;
        font-family: SimHei;
        font-size: 17px;
      }
    }

    .header_pic {
      display: flex;
      align-items: center;
      z-index: 9999999;
      margin-left: auto;

      .header_img {
        height: 40px;
        width: 40px;
        margin-right: 10px;
      }

      ul > li {
        flex: none;
        margin-right: @base4-padding-lg * 2;

        &:last-of-type {
          margin-right: 0;
        }

        a {
          font-size: @font-size-14;
          color: @light-color-1;
          text-decoration: none;
          position: relative;
          display: block;
          line-height: 64px;

          span {
            max-width: 7em;
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          &:hover {
            color: @primary-color;
          }

          &.router-link-active {
            color: @primary-color;

            &::after {
              content: "";
              display: block;
              position: absolute;
              left: -7px;
              bottom: 1px;
              width: calc(100% + 14px);
              height: 3px;
              border-radius: 2px;
              background: @primary-color;
            }
          }
        }
      }

      &.more {
        position: relative;
        height: 64px;
        width: 33px;
        margin-right: 20px;
        cursor: pointer;

        .icon {
          display: block;
          height: 100%;
          line-height: 64px;
          color: @light-color-3;

          &.active {
            color: @primary-color;
          }
        }

        &.active {
          color: @primary-color;

          &::after {
            content: "";
            display: block;
            position: absolute;
            left: -7px;
            width: calc(100% + 14px);
            height: 3px;
            border-radius: 2px;
            background: @primary-color;
          }
        }
      }

      & > .user-info {
        position: relative;
        display: flex;
        align-items: center;
        height: 64px;
        cursor: pointer;
        //test
        transition: all 3s;
        //end
        &::before {
          content: "";
          display: none;
          width: 1px;
          height: 30px;
          background-color: rgba(234, 237, 243, 1);
          position: absolute;
          left: -101px;
          top: 17px;
        }

        .avatar-box {
          //test
          transition: all 3s;
          //end

          & > img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
          }

          & > span {
            //test
            transition: all 3s;
            //end

            padding-left: 8px;
            //color: rgba(0, 0, 0, 0.85);
            color: white;
          }

          & > .icon {
            margin-left: 5px;
            display: inline-block;
            vertical-align: middle;
            font-size: 14px;
            color: #8c8c8c;

            &.default-avatar {
              font-size: 32px;
              color: #7165ff;
            }

            &.h-icon-all-caret-down {
              transform: scale(0.7);
            }
          }
        }
      }
    }
  }
}

.info-box {
  background-color: white;
  text-align: left;
  box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.15);
  border-radius: @border-radius-lg;

  & > ul > li {
    padding: 5px @base10-padding-md;

    &.user {
      cursor: pointer;
      border-bottom: 1px solid @base-border-color;

      &::before {
        display: none;
      }
    }

    & > .user-name {
      text-align: left;

      span {
        display: block;
        color: @light-color-1;

        &.mobile {
          color: @light-color-3;

          &::before {
            display: none;
          }
        }
      }
    }

    a {
      color: @light-color-1;

      & > .icon {
        margin-right: 8px;
      }
    }

    &:hover {
      background-color: rgba(240, 247, 255, 1);
    }
  }

  .toggle-lang {
    & span.active {
      color: @primary-color;
    }
  }
}

ul[class~="ant-dropdown-menu"] {
  background: url("../../../src/assets/extends/bim/kuang.png");
  background-size: 100% 100%;
}

/deep/ .ant-dropdown-menu-item {
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
