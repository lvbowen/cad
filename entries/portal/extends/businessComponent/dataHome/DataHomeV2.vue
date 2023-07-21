<template>
  <div class="data-home">
    <Common-Header v-show="false" />
    <div class="data-header flex flex-center-align flex-space-between">
      <div
        class="tree-name flex flex-center-align"
        @click="
          () => {
            this.isLeftShow = true;
          }
        "
      >
        <img src="../../../src/assets/extends/datahome/top_qh.png" alt="" />
        <span>{{ treeName }}</span>
      </div>
      <a-switch
        checkedChildren="关闭轮播"
        unCheckedChildren="开启轮播"
        @change="switchPage"
      />
      <div class="header-title flex flex-center-align">
        {{ titleName }}
      </div>
      <div class="title-lr flex">
        <div class="now-time">
          <img
            src="../../../src/assets/extends/datahome/top_icon_time.png"
            alt=""
          />
          {{ nowTime }}
        </div>
        <div class="user-info">
          <img
            src="../../../src/assets/extends/datahome/top_icon_tx.png"
            alt=""
          />
          <span>{{ userInfo.name }}</span>
        </div>
        <div @click="logout" style="cursor: pointer">
          <img
            src="../../../src/assets/extends/datahome/top_close.png"
            alt=""
          />
        </div>
      </div>
    </div>
    <div>
      <a-card class="left-class" :class="isLeftShow ? 'cardShow' : 'cardHide'">
        <div class="left-tree">
          <div class="tree-search" style="width: 100%">
            <el-input
              size="small"
              placeholder="请输入关键字"
              @change="filterTreeData"
              v-model="filterText"
              style="width: 100%"
            >
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>
          <el-tree
            ref="tree"
            :data="data"
            :props="defaultProps"
            defaultExpandAll
            :filterNodeMethod="filterNode"
            :expandOnClickNode="false"
            :highlightCurrent="true"
            nodeKey="id"
            :currentNodeKey="currentKey"
            @node-click="bimtree"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span v-if="data.projectState == '准备'">
                <img
                  :src="preparePic"
                  style="height: 15px; width: 30px; margin-right: 5px"
                />
              </span>
              <span v-else-if="data.projectState == '交工'">
                <img
                  :src="submitPic"
                  style="height: 15px; width: 30px; margin-right: 5px"
                />
              </span>
              <span v-else-if="data.projectState == '完工'">
                <img
                  :src="endPic"
                  style="height: 15px; width: 30px; margin-right: 5px"
                />
              </span>
              <span v-else-if="data.projectState == '尾工'">
                <img
                  :src="finalPic"
                  style="height: 15px; width: 30px; margin-right: 5px"
                />
              </span>
              <span v-else-if="data.projectState == '暂停'">
                <img
                  :src="pausePic"
                  style="height: 15px; width: 30px; margin-right: 5px"
                />
              </span>
              <span v-else-if="data.projectState == '运行'">
                <img
                  :src="workPic"
                  style="height: 15px; width: 30px; margin-right: 5px"
                />
              </span>
              <span :class="isHigColor == data.id ? 'activeColor' : ''">{{
                data.name
              }}</span>
            </span>
          </el-tree>
        </div>
        <div class="tree-back" :class="isLeftShow ? 'backShow' : 'backHide'">
          <img
            src="../../../src/assets/extends/datahome/menu_1.png"
            alt=""
            @click="
              () => {
                this.isLeftShow = !this.isLeftShow;
              }
            "
          />
        </div>
      </a-card>
    </div>
    <div class="levelone-menus">
      <div
        class="full-height flex flex-center-align"
        :class="isMenuBG == index ? 'active' : ''"
        v-for="(item, index) in menuLists"
        :key="index"
        @click="toHome(item, index)"
      >
        {{ item.tabName }}
      </div>
    </div>
    <div :style="{ paddingLeft: isMonitor ? '0' : '8px' }" class="rdp-b">
      <div v-if="this.secMenuLists.length > 0">
        <Tabbar
          ref="tabs"
          :appCode="projectCode"
          :expandKeys="expandKeys"
          :isMonitor="isMonitor"
          :projectLevel="projectLevel"
          :projectName="treeName"
          :secMenuLists="secMenuLists"
          :treeId="treeId"
        ></Tabbar>
      </div>
      <template v-else-if="isRdp">
        <iframe
          :src="allRdp"
          frameborder="0"
          :style="{
            display: isRdp ? 'block' : 'none',
            width: '100vw',
            height: '100vh',
          }"
        ></iframe>
      </template>
      <div v-else style="width: 100%; height: 100%; overflow: auto">
        <template>
          <component
            :is="routeName"
            :appCode="projectCode"
            :expandKeys="expandKeys"
            :isMonitor="isMonitor"
            :markersMap="markersMap"
            :modelLat="modelLat"
            :modelLng="modelLng"
            :parentMenuId="parentMenuId"
            :projectLevel="projectLevel"
            :projectName="treeName"
            :style="{ paddingLeft: isMonitor ? '0' : '8px' }"
            :treeId="treeId"
            :treeItem="treeItem"
            class="tab-route"
            @currentId="currentId"
          />
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, InjectReactive, Vue } from "vue-property-decorator";
import CommonHeader from "../../../src/components/shared/header/header.vue";
import img1 from "./Img/1.png";
import { Card } from "@h3/antd-vue";
import Dropdown from "ant-design-vue/lib/dropdown";
import "ant-design-vue/lib/dropdown/style/index.css";
import Tree from "element-ui/lib/tree";
import Input from "element-ui/lib/input";
import { getBIMProject } from "../../service/api";
import { getMenuById, getRdpByProjectNameAndTabName } from "./server/index.js";
import tools from "./utils";
import allRouter from "../../routes";
import * as Type from "../../type";
import tabbar from "./Tabbar.vue";
import env from "@/config/env";
import OAuthApi from "@/apis/oauth";
import Utils from "../../utils";
import LoginHelper from "../../../src/views/login/loginHelper";
import preparePic from "../BIMView/pic/准备.png";
import submitPic from "../BIMView/pic/交工.png";
import endPic from "../BIMView/pic/完工.png";
import finalPic from "../BIMView/pic/尾工.png";
import pausePic from "../BIMView/pic/暂停.png";
import workPic from "../BIMView/pic/运行.png";
import Switch from "ant-design-vue/lib/switch";
import "ant-design-vue/lib/switch/style/index.css";
@Component({
  name: "DataHomeV2",
  components: {
    ADropdown: Dropdown,
    ACard: Card,
    ElTree: Tree,
    ElInput: Input,
    Tabbar: tabbar,
    CommonHeader,
    ASwitch: Switch,
  },
})
export default class DataHomeV2 extends Vue {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;

  workPic: HTMLImageElement = workPic;
  pausePic: HTMLImageElement = pausePic;
  finalPic: HTMLImageElement = finalPic;
  preparePic: HTMLImageElement = preparePic;
  submitPic: HTMLImageElement = submitPic;
  endPic: HTMLImageElement = endPic;

  projectLogo: any = "";
  titleName: any = "";
  nowTime: string = "";
  userInfo: any = {};
  data: any = [];
  currentKey: string = "";
  treeName: string | null = "";
  treeId: string = "";
  projectLevel: string = "";
  menuLists: Array<any> = [];
  markers: Array<any> = [];
  defaultProps: object = {
    children: "children",
    label: "name",
    isLeaf: "leaf",
  };
  isRdp: Boolean = true;
  routeName: string = "";
  isMonitor: Boolean = false;
  isMenuBG: number = 0;
  secMenuLists: Array<any> = [];
  notProTreeRouteName: any = ["MonitorPlatform"];
  menuId: string = "";
  allRdp: string = "";
  expandKeys: Array<any> = [];
  tabName: string = "";
  parentMenuId: string = "";
  modelLat: number = 0;
  modelLng: number = 0;
  treeItem: object = {};
  markersMap: Array<any> = [];
  center: string = "中国";
  zoom: number = 5;
  newData: Array<any> = [];
  isLeftShow: boolean = true;
  isHigColor: string = "";
  filterText: string = "";

  timerId: any = null;
  switchPageTimer: any = null;

  currentId: any = function (currentId) {
    //@ts-ignore
    this.$refs["tree"].setCurrentKey(currentId);
  };

  filterTreeData(val) {
    //@ts-ignore
    this.$refs.tree.filter(val);
  }

  bimtree(val, info, v) {
    this.isHigColor = val.id;
    this.modelLat = val.modelLat;
    this.modelLng = val.modelLng;
    this.expandKeys = [];
    this.getExpand(v.node);
    this.treeId = val.id;
    this.routeName = "";
    this.isMonitor = false;
    this.treeName = val.name;
    this.projectLevel = val.projectLevel;
    this.toHome(
      { tabName: this.tabName, id: this.parentMenuId },
      this.isMenuBG
    );

    let bimProjectReqParams;
    bimProjectReqParams = {
      appCode: this.projectCode ?? "",
      currentProjectName: "",
      currentLevel: "",
    };
    this.markersMap = [];
    if (this.projectLevel === "集团") {
      // this.markersMap = [];
      getBIMProject(bimProjectReqParams).then((res) => {
        this.data = res.data;
        this.findop(this.data, this.markersMap);
      });
    } else if (this.projectLevel === "公司") {
      getBIMProject(bimProjectReqParams).then((res) => {
        if (res.errcode === 0 && res.data)
          res?.data?.[0].children.forEach((item) => {
            if (item.name == this.treeName) {
              this.newData.push(item);
            }
          });
        let newArr = [this.newData.reverse()[0]];
        this.findop(newArr, this.markersMap);
      });
    }
  }

  getExpand(v) {
    if (v.expanded) {
      this.expandKeys.push(v.data.id);
      if (v.parent) {
        this.getExpand(v.parent);
      }
    }
  }

  filterNode(value, data) {
    if (!value) return true;
    return data.name.indexOf(value) !== -1;
  }

  toHome(val, index) {
    this.tabName = val.tabName;
    this.parentMenuId = val.id;
    this.routeName = "";
    this.isMonitor = false;
    this.isLeftShow = false;
    this.isMenuBG = index;
    getMenuById(this.projectCode, this.parentMenuId, this.treeName).then(
      (res) => {
        this.secMenuLists = res.data;
        if (res.data.length == 0) {
          this.menuId = val.id;
          getRdpByProjectNameAndTabName(
            this.projectCode,
            this.treeName,
            val.id,
            ""
          ).then((ress) => {
            this.isRdp = ress.data.isRdp;
            if (ress.data.isRdp === false) {
              const route = tools.getRoute(allRouter, ress.data.routing);
              //注意，import是静态执行，所以不能使用表达式和变量
              //@ts-ignore
              this.routeName = route.component;
              // console.log(this.routeName,'11')
              if (this.notProTreeRouteName.includes(ress.data.routing)) {
                this.isMonitor = true;
              }
            } else {
              this.allRdp = ress.data.allRdp;
            }
          });
        } else {
          // this.menuId = res.data[0].id;
          // getRdpByProjectNameAndTabName(
          //   this.projectCode,
          //   this.treeName,
          //   res.data[0].id,
          //   ""
          // ).then((ress) => {
          //   this.isRdp = ress.data.isRdp;
          //   if (ress.data.isRdp === false) {
          //     const route = tools.getRoute(allRouter, ress.data.routing);
          //     // 注意，import是静态执行，所以不能使用表达式和变量
          //     //@ts-ignore
          //     this.routeName = route.component;
          //     if (this.notProTreeRouteName.includes(ress.data.routing)) {
          //       this.isMonitor = true;
          //     }
          //   } else {
          //     this.allRdp = ress.data.allRdp;
          //   }
          // });
        }
      }
    );
  }

  getinit() {
    let bimProjectReqParams;
    bimProjectReqParams = {
      appCode: this.projectCode ?? "",
      currentProjectName: "",
      currentLevel: "",
    };
    getBIMProject(bimProjectReqParams).then((res) => {
      if (res.errcode == 0 && res.data) {
        Utils.deepFind(
          res.data,
          (item) => {
            item.scopedSlots = { label: "label" };
            return false;
          },
          "children"
        );
        this.data = res.data;
        this.titleName = this.data[0].name;
        this.findop(this.data, this.markers);
        if (this.projectLevel == "集团") {
          this.findop(this.data, this.markersMap);
        }
        if (this.data.length === 0) return;
        this.treeName = this.data[0].name;
        this.treeId = this.currentKey;
        this.$nextTick(() => {
          this.projectLevel = this.projectConfig?.projectKey
            ? this.projectConfig?.projectKey.split("-")[1]
            : "";
          if (this.projectLevel == "项目") {
            this.currentKey = this.projectConfig?.projectKey
              ? this.projectConfig?.projectKey.split("-")[0]
              : "";
            this.treeId = this.currentKey;
            this.treeName = this.projectConfig?.projectName ?? "";
          } else {
            this.currentKey = this.data[0].children[0].id;
            this.treeId = this.currentKey;
            this.treeName = this.data[0].children[0].name;
          }
          //@ts-ignore
          this.$refs["tree"].setCurrentKey(this.currentKey);
        });
        getMenuById(this.projectCode, "", "").then((ress) => {
          //@ts-ignore
          if (ress.errcode === 0 && ress.data) {
            this.menuLists = ress.data;
            if (ress.data.length) {
              this.toHome(ress.data[0], 0);
            }
          }
        });
      }
    });
  }

  formatDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let week = date.getDay();
    const weekArr = [
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ];
    let hour: string | number = date.getHours();
    hour = hour < 10 ? "0" + hour : hour;
    let minute: string | number = date.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;
    let second: string | number = date.getSeconds();
    second = second < 10 ? "0" + second : second;
    this.nowTime = `${year}年${month}月${day}日  ${weekArr[week]}  ${hour}:${minute}:${second}`;
  }

  findop(data, arr) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.children || item.children?.length == 0) {
        arr.push({
          name: item.name,
          show: false,
          latitude: item.modelLat,
          longitude: item.modelLng,
          id: item.id,
          sgdw1: item.sgdw1,
          jldw1: item.jldw1,
          xmzj1: item.xmzj1,
          xmjl1: item.xmjl1,
          projectCode: this.projectCode,
          nameList: item.windowDataList,
          img1: img1,
          icon: item.icon,
          projectLevel: item.projectLevel,
          scopedSlots: item.scopedSlots,
        });
      } else {
        this.findop(item.children, arr);
      }
    }
    return arr;
  }
  loginHelper = new LoginHelper();
  // 退出登录
  logout() {
    const redirectIP = env.redirectHost;
    const token = localStorage.getItem("token") || "";
    // this.loginHelper.removeUserPassword();
    // this.loginHelper.saveUserPasswordToLocalStorage();
    OAuthApi.logout({
      redirect_uri: `${redirectIP}/login`,
      access_token: token,
    }).then((res) => {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("expireTime");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("searchParams");
      this.$router.replace({ name: "login" });
    });
  }

  switchPage(checked: boolean) {
    if (checked) {
      if (this.menuLists.length === 1)
        return clearInterval(this.switchPageTimer);
      this.switchPageTimer = setInterval(() => {
        const tabsComponent = this.$refs.tabs as any;
        // console.log(this.$refs.tabs,this.menuLists.length-1,this.isMenuBG)
        if (this.menuLists.length - 1 > this.isMenuBG) {
          //存在二级目录
          if (
            this.secMenuLists.length &&
            tabsComponent &&
            this.secMenuLists.length - 1 > tabsComponent.isChoose
          ) {
            tabsComponent.isChoose++;
            tabsComponent.choose(
              this.secMenuLists[tabsComponent.isChoose],
              tabsComponent.isChoose
            );
          } else {
            this.isMenuBG++;
            this.toHome(this.menuLists[this.isMenuBG], this.isMenuBG);
          }
        } else {
          this.isMenuBG = 0;
          this.toHome(this.menuLists[this.isMenuBG], this.isMenuBG);
        }
      }, 60 * 1000);
    } else {
      clearInterval(this.switchPageTimer);
    }
  }

  mounted() {
    const { formatDate } = this;
    this.timerId = setInterval(function () {
      formatDate();
    }, 1000);
    this.projectLogo = window.localStorage.getItem("projectLogo");
    this.userInfo = JSON.parse(sessionStorage.getItem("user") ?? "");
    this.getinit();
  }

  beforeDestroy() {
    clearInterval(this.switchPageTimer);
    const { timerId } = this;
    if (timerId) {
      clearInterval(timerId);
    }
  }
}
</script>
<style lang="less" scoped>
* {
  color: #fff;
  margin: 0;
  padding: 0;
}

.data-home {
  height: 100%;
  background: url("../../../src/assets/extends/datahome/bg.png");
  position: relative;

  .tree-back {
    position: absolute;
    left: 15%;
    top: 35.3%;
    z-index: 10000;
  }

  .left-class {
    z-index: 10000;
    position: absolute;
    left: 0;
    top: 33px;
    background: url("../../../src/assets/extends/datahome/menu_k.png");
    background-size: 100% 100%;
    border-color: transparent;
    padding: 0.05vw;
    width: 15%;
    height: 94%;
    .left-tree {
      width: 100%;
      height: 88vh;
      overflow: auto;
    }

    /deep/ .doc-folder {
      .img_left {
        margin-right: 5px;
        width: 16px;
        height: 16px;
      }
    }

    .activeColor {
      color: #06e1f2;
    }

    .el-tree {
      background: none;
      color: #fff;
    }

    .el-tree-node__content {
      background-color: #202431;
    }

    .el-tree-node:focus > .el-tree-node__content {
      background-color: #202431 !important;
    }

    /deep/ .el-tree-node__content:hover {
      background-color: transparent !important;
    }

    /deep/ .el-tree-node__content {
      background-color: transparent;
    }

    .tree-search {
      .el-input-group {
        background: url("../../../src/assets/extends/datahome/ss_bga(1).png");
        background-size: 100% 100%;
      }

      /deep/ .el-input__inner {
        background-color: transparent;
        border: none;
        color: #ffff;
      }

      /deep/ .el-input-group__append {
        background-color: transparent;
        border: none;

        .el-icon-search:before {
          color: #ffff;
        }
      }
    }
  }

  .cardShow {
    left: 0 !important;
  }

  .cardHide {
    left: -15% !important;
  }

  .backShow {
    left: 100% !important;
  }

  .backHide {
    left: 100% !important;
  }
}
</style>
<style lang="less" scoped>
@import "../../styles/public.module.less";

.data-header {
  height: 64px;
  padding: 20px 24px 0 24px;
  background: url("../../../src/assets/extends/datahome/top_bg.png");
  background-size: 100%;
  position: relative;
  margin-bottom: 10px;

  /deep/ .ant-switch {
    position: absolute;
    left: 18%;
    background-color: #133256;
  }
  .ant-switch-checked {
    background-color: #1890ff !important;
  }

  .tree-name {
    cursor: pointer;

    img {
      margin-right: 20px;
    }
  }

  .header-title {
    width: 40%;
    height: 100%;
    font-size: 35px;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    color: #00fffc;
    text-shadow: 0px 3px 7px rgba(0, 0, 0, 0.22);
    justify-content: center;
  }

  .title-lr {
    line-height: 64px;

    .user-info {
      font-size: 16px;
      margin: 0 20px 0 20px;

      span {
        margin-left: 10px;
      }
    }
  }
}

.levelone-menus {
  height: 42px;
  background-image: url("../../../src/assets/extends/datahome/top_button_bg.png");
  display: flex;
  padding-top: 1px;

  > div {
    cursor: pointer;
    z-index: 99;
    display: inline-block;
    width: 174px;
    margin-bottom: 11.5px;
    text-align: center;
    line-height: 27px;
    margin-left: 15px;
    height: 40px;
    background: url("../../../src/assets/extends/datahome/first_button.png");
    background-size: 100% 100%;
    font-size: 15px;
    color: #147bd7;
    font-weight: bold;

    img {
      width: 24px;
      height: 24px;
      margin-right: @spacing-base;
    }
  }

  .active {
    color: #e6de06;
    //width: 174px;
    height: 38px;
    background-size: 100% 100%;
    background: url("../../../src/assets/extends/datahome/first_button_pre.png");
  }
}

.rdp-b {
  //width: 100%;
  height: calc(100% - 120px);
  padding: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  //overflow-x: hidden;

  iframe {
    width: 100%;
    flex: 1;
  }

  .tab-route {
    padding: 8px;
    width: 100%;
    flex: 1;
    overflow: auto;
  }
}

::-webkit-scrollbar-track {
  border-radius: 0;
  background: transparent;
}
</style>
