<template>
  <div class="DataHome">
    <Common-Header v-show="false" />
    <div class="data-header flex flex-center-align flex-space-between">
      <div class="logo flex flex-center-align">
        <img :src="projectLogo" alt />
        <span>{{ titleName }}</span>
      </div>
      <div class="menus flex full-height">
        <div
          class="full-height flex flex-center-align"
          :class="isMenuBG == index ? 'active' : ''"
          v-for="(item, index) in menuLists"
          :key="index"
          @click="toHome(item, index)"
        >
          <img v-if="item.icon" :src="item.icon" />
          {{ item.tabName }}
        </div>
        <img
          src="../../../src/assets/extends/icon/infoPortal.png"
          style="height: 28px; width: 28px; margin: 17px 10px; cursor: pointer"
          @click="backToMenu()"
        />
        <span class="line"></span>
        <ul>
          <li>
            <a-dropdown :trigger="['click']">
              <div class="user-info">
                <div class="avatar-box">
                  <img
                    v-if="userInfo.imgUrl && userInfo.imgUrl.includes('http')"
                    :src="userInfo.imgUrl"
                  />
                  <img
                    v-else-if="userInfo.imgUrl"
                    :src="getDownloadUrl(userInfo.imgUrl)"
                  />
                  <i
                    v-else
                    class="
                      icon
                      aufontAll
                      h-icon-all-normal_smile
                      default-avatar
                    "
                  ></i>
                  <span>{{ userInfo.name }}</span>
                  <i class="icon aufontAll h-icon-all-caret-down"></i>
                </div>
              </div>
              <div class="info-box" slot="overlay">
                <ul>
                  <li>
                    <a @click="toAdmin">
                      <i class="icon aufontAll h-icon-all-disassembly-o"></i>
                      {{ $t("languages.common.backStageManager") }}
                    </a>
                  </li>
                  <li>
                    <a @click="logout">
                      <i class="icon aufontAll h-icon-all-poweroff-o"></i>
                      {{ $t("languages.common.exitSys") }}
                    </a>
                  </li>
                  <li>
                    <a @click="$router.push('/HelpDoc')">
                      <i class="icon aufontAll h-icon-all-list-work"></i>
                      帮助文档
                    </a>
                  </li>
                </ul>
              </div>
            </a-dropdown>
          </li>
        </ul>
      </div>
    </div>
    <!-- 首页 -->
    <div class="flex-1">
      <div class="data_content">
        <div
          class="data_left"
          :style="{ width: isScale ? '13%' : '0' }"
          v-show="!isMonitor"
        >
          <div>
            <el-input
              size="small"
              placeholder="请输入关键字"
              @change="filter"
              v-model="filterText"
              :style="{ width: isScale ? '' : '0' }"
            >
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>
          <div class="full-height">
            <el-scrollbar class="full-height">
              <el-tree
                :data="data"
                :props="defaultProps"
                defaultExpandAll
                :filterNodeMethod="filterNode"
                :expandOnClickNode="false"
                ref="tree"
                nodeKey="id"
                :highlightCurrent="true"
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
                  <span>{{ data.name }}</span>
                </span>
              </el-tree>
            </el-scrollbar>
          </div>
        </div>
        <div class="middle" v-show="!isMonitor">
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
        <!-- 报表 -->
        <div :style="{ paddingLeft: isMonitor ? '0' : '8px' }" class="rdpBB">
          <div v-if="this.secMenuLists.length > 0">
            <Tabbar
              :appCode="project"
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
                width: '86vw',
                height: '84vh',
              }"
            ></iframe>
          </template>
          <div v-else class="box">
            <template>
              <component
                :is="routeName"
                :appCode="project"
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
                class="route"
                @currentId="currentId"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { getBIMProject } from "../../service/api";
import CommonHeader from "../../../src/components/shared/header/header.vue";
import Tree from "element-ui/lib/tree";
import Input from "element-ui/lib/input";
import env from "@/config/env";
import img1 from "./Img/1.png";
import img2 from "./Img/2.png";
import { getMenuById, getRdpByProjectNameAndTabName } from "./server";
import allRouter from "../../routes";
import tools from "./utils";
import OAuthApi from "../../../src/apis/oauth";
import Dropdown from "ant-design-vue/lib/dropdown";
import "ant-design-vue/lib/dropdown/style/index.css";
import preparePic from "../BIMView/pic/准备.png";
import submitPic from "../BIMView/pic/交工.png";
import endPic from "../BIMView/pic/完工.png";
import finalPic from "../BIMView/pic/尾工.png";
import pausePic from "../BIMView/pic/暂停.png";
import workPic from "../BIMView/pic/运行.png";
import LoginHelper from "../../../src/views/login/loginHelper";
import tabbar from "./Tabbar.vue";
import allmap from "./deviceManagement/AllMap.vue";
export default {
  data() {
    return {
      workPic: workPic,
      pausePic: pausePic,
      finalPic: finalPic,
      preparePic: preparePic,
      submitPic: submitPic,
      endPic: endPic,
      data: [],
      isMenuBG: 0,
      isChoose: 0,
      // isHome: true,
      hightBg: "hightBg",
      currentKey: "",
      expandKeys: [],
      menuId: "",
      projectTitle: "",
      treeName: "",
      projectName: "",
      projectLevel: "",
      allRdp: "",
      filterText: "",
      center: "中国",
      zoom: 5,
      img1: img1,
      secMenuLists: [],
      menuLists: [],
      markers: [],
      markerss: [],
      markersMap: [],
      newData: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      isRdp: true,
      routeName: "",
      test: "",
      projectLogo: "",
      isScale: true,
      isMonitor: false,
      userInfo: {},
      notProTreeRouteName: ["MonitorPlatform"],
      treeId: "",
      titleName: "",
      tabName: "",
      parentMenuId: "",
      modelLat: 0,
      modelLng: 0,
      treeItem: {},
      loginHelper: new LoginHelper(),
    };
  },
  inject: ["projectConfig", "logo", "project"],
  components: {
    ElTree: Tree,
    ElInput: Input,
    ADropdown: Dropdown,
    Tabbar: tabbar,
    Allmap: allmap,
    CommonHeader
  },
  mounted() {
    this.projectCode = `${env.project}`;
    this.projectTitle = this.projectConfig?.projectName;
    this.projectLogo = window.localStorage.getItem("projectLogo");
    this.userInfo = JSON.parse(sessionStorage.getItem("user"));
    this.getinit();
  },
  methods: {
    filter(val) {
      this.$refs.tree.filter(val);
    },
    // choose(val, index) {
    //   this.routeName = "";
    //   this.menuId = val.id;
    //   this.isMonitor = false;
    //   getRdpByProjectNameAndTabName(this.projectCode, this.treeName, this.menuId).then((ress) => {
    //     this.isRdp = ress.data.isRdp;
    //     if (ress.data.isRdp === false) {
    //       const route = tools.getRoute(allRouter, ress.data.routing);
    //       this.routeName = route.component;
    //       //视频监控
    //       if (this.notProTreeRouteName.includes(ress.data.routing)) {
    //         this.isMonitor = true;
    //       }
    //     } else {
    //       this.allRdp = ress.data.allRdp;
    //     }
    //   });
    //   this.isChoose = index;
    // },
    getinit() {
      let bimProjectReqParams;
      bimProjectReqParams = {
        appCode: this.projectCode ?? "",
        currentProjectName: "",
        currentLevel: "",
      };
      getBIMProject(bimProjectReqParams).then((res) => {
        if (res.errcode == 0) {
          this.data = res.data;
          this.titleName = this.data[0].name;
          this.findop(this.data, this.markers);
          if (this.projectLevel == "集团") {
            this.findop(this.data, this.markersMap);
          }
          if (this.data.length === 0) return;
          this.treeName = this.data[0].name;
          this.projectLevel = this.projectConfig?.projectKey.split("-")[1];
          this.treeId = this.currentKey;
          this.$nextTick(() => {
            this.projectLevel = this.projectConfig?.projectKey.split("-")[1];
            if (this.projectConfig?.projectKey.split("-")[1] === "项目") {
              this.currentKey = this.projectConfig.projectKey.split("-")[0];
              this.treeId = this.currentKey;
              this.treeName = this.projectConfig.projectName;
            } else {
              this.currentKey = this.data[0].children[0].id;
              this.treeId = this.currentKey;
              this.treeName = this.data[0].children[0].name;
            }
            this.$refs["tree"].setCurrentKey(this.currentKey);
          });
          getMenuById(this.projectCode).then((ress) => {
            if (ress.errcode === 0 && ress.data) {
              this.menuLists = ress.data;
              if (ress.data.length) {
                this.toHome(ress.data[0], 0);
              }
            }
          });
        }
      });
    },
    toHome(val, index) {
      console.log("tohome",val,index)
      this.tabName = val.tabName;
      this.parentMenuId = val.id;
      this.routeName = "";
      this.isMonitor = false;
      this.isMenuBG = index;
      // if (val.tabName == "首页") {
      //   this.isHome = true;
      // } else {
      getMenuById(this.projectCode, this.parentMenuId, this.treeName).then((res) => {
        this.secMenuLists = res.data;
        if (res.data.length == 0) {
          this.menuId = val.id;
          getRdpByProjectNameAndTabName(this.projectCode, this.treeName, val.id).then((ress) => {
            this.isRdp = ress.data.isRdp;
            if (ress.data.isRdp === false) {
              const route = tools.getRoute(allRouter, ress.data.routing);
              //注意，import是静态执行，所以不能使用表达式和变量
              this.routeName = route.component;
              if (this.notProTreeRouteName.includes(ress.data.routing)) {
                this.isMonitor = true;
              }
            } else {
              this.allRdp = ress.data.allRdp;
            }
          });
        } else {
          this.menuId = res.data[0].id;
          getRdpByProjectNameAndTabName(this.projectCode, this.treeName, res.data[0].id).then(
            (ress) => {
              this.isRdp = ress.data.isRdp;
              if (ress.data.isRdp === false) {
                const route = tools.getRoute(allRouter, ress.data.routing);
                //注意，import是静态执行，所以不能使用表达式和变量
                this.routeName = route.component;
                if (this.notProTreeRouteName.includes(ress.data.routing)) {
                  this.isMonitor = true;
                }
              } else {
                this.allRdp = ress.data.allRdp;
              }
            }
          );
        }
      });
      // this.isHome = false;
      // }
    },
    // toElse() {
    //   this.isHome = false
    // },
    getMapblue(mapData) {
      let mapStyle = { style: "midnight" }; //"midnight"
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
    },
    getMapNormal(mapData) {
      let mapStyle = { style: "" };
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
    },
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
          });
        } else {
          this.findop(item.children, arr);
        }
      }
      return arr;
    },
    getBIMPlatform(item) {
      const { href } = this.$router.resolve({
        name: "BIMPlatform",
        query: {
          projectId: item.id,
          projectName: item.name,
          projectCode: item.projectCode,
          icon: item.icon,
        },
      });
      window.open(href, "_blank");
    },
    getExpand(v) {
      if (v.expanded) {
        this.expandKeys.push(v.data.id);
        if (v.parent) {
          this.getExpand(v.parent);
        }
      }
    },
    bimtree(val, info, v) {
      console.log(val, info, v)
      this.modelLat = val.modelLat;
      this.modelLng = val.modelLng;
      this.expandKeys = [];
      this.getExpand(v.node);
      this.treeId = val.id;
      this.routeName = "";
      this.isMonitor = false;
      this.treeName = val.name;
      this.projectLevel = val.projectLevel;
      this.toHome({ tabName: this.tabName, id: this.parentMenuId }, this.isMenuBG);

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
          res.data[0].children.forEach((item) => {
            if (item.name == this.treeName) {
              this.newData.push(item);
            }
          });
          let newArr=[this.newData.reverse()[0]]
          this.findop(newArr, this.markersMap);
        });
      }
    },
    infoWindowOpen(item) {
      item.show = true;
      item.img1 = img2;
    },
    infoWindowClose(item) {
      item.show = false;
      item.img1 = img1;
    },
    handler({ map }) {
      this.mapData = map;
      // let mapStyle = { style: "normal" }; //"midnight"
      // map.setMapStyle(mapStyle);
      map.setMapType(BMAP_HYBRID_MAP);
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    getDownloadUrl(refId) {
      let url = `${window.config.apiHost}/api/aliyun/download?refId=${refId}`;
      if (window.localStorage.getItem("token")) {
        url += "&access_token=" + window.localStorage.getItem("token");
      }
      return url;
    },
    // 跳转后台管理
    toAdmin() {
      const token = localStorage.getItem("token");
      if (this.isDingTalk && token) {
        //env.portalHost
        window.open(`${env.host}/admin?admin_token=${token}`, "_blank");
      } else {
        //env.portalHost
        window.open(`${env.host}/admin`, "_blank");
      }
    },
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
        sessionStorage.removeItem('searchParams');
        this.$router.replace({name: "login"});
      });
    },
    backToMenu() {
      this.$router.push({ name: "InformationPortal" });
    },
    currentId: function (currentId) {
      this.$refs["tree"].setCurrentKey(currentId);
    },
  },
  // watch: {
  //   filterText(val) {
  //     this.$refs.tree.filter(val);
  //   },
  // },
};
</script>
<style lang="less" scoped>
* {
  color: #fff;
}

.DataHome {
  height: 100%;

  .data_content {
    width: 100%;
    height: 100%;
    display: flex;

    .data_left {
      //width: 19%;
      //padding: 20px;
      height: 100%;
      background: #202431;
      flex-direction: column;
      display: flex;
      transition: all 0.5s;
    }

    .data_center {
      width: 80.7%;
      height: 100%;
      display: flex;

      iframe {
        width: 100%;
        height: 15%;
      }

      .baidumap {
        width: 100%;
        height: 100%;

        .baidu-map {
          height: 100%;
        }

        .bminfo {
          display: flex;
          flex-direction: column;
          overflow: auto;
          width: 356px;
          height: 300px;
          padding: 10px;
          color: #fff;
          font-size: 15px;
          background: none !important;

          i {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #67d4ff !important;
            border-radius: 50%;
            margin-right: 5px;
            vertical-align: middle;
          }

          p {
            background: none !important;
            line-height: 28px;
          }

          .button {
            display: flex;
            flex-direction: column;
            margin-left: auto;
            border-radius: 5px;
            background: #064897;
            border: none;
            cursor: pointer;
            color: #fff;
            font-size: 15px;
            outline: none;
            justify-content: center;
            padding: 0 10px;
            min-height: 33px;
          }
        }
      }
    }

    // .data_right {
    //   width: 20%;
    //   height: 100%;
    //   iframe {
    //     width: 100%;
    //     height: 100%;
    //   }
    // }
    .data_map {
      width: 100%;
      height: 100%;
      padding: 0 10px;
    }

    .rdpBB {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow-x: auto;

      .menu {
        cursor: pointer;
        z-index: 99;
        display: inline-block;
        width: 150px;
        margin-bottom: 11.5px;
        text-align: center;
        line-height: 40px;
        margin-left: 15px;
        height: 40px;
        background: url("./Img/btn_nor.png");
        background-size: 100% 100%;
        font-size: 15px;
        color: #147bd7;
        font-weight: bold;
      }

      .hightBg {
        background: url("./Img/btn_pre.png");
        background-size: 100% 100%;
        color: #ffffff;
      }

      iframe {
        width: 100%;
        flex: 1;
      }
      .route {
        padding: 8px;
        width: 100%;
        flex: 1;
        position: relative;
        overflow: hidden;
        min-width: 1520px;
      }
    }
  }
}

.top-menu-container {
  height: 100px;
  padding-right: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: url("./Img/top.png");
  background-size: cover;
  margin-bottom: 10px;

  .top-nav {
    display: flex;
    width: 80%;
    height: 66px;
    background-size: 100%;

    h1 {
      margin-left: 100px;
      width: 40%;
      display: inline-block;
      height: 100%;
      color: #02eeff;
      font-size: 1.25vw;
      line-height: 66px;
      font-family: MicrosoftYaHei;
      vertical-align: middle;
      font-weight: 700;
    }

    .menu-item-container {
      height: 3.125vw;
      width: 100%;
      display: flex;
      align-items: center;

      div {
        width: 15%;
        margin-right: 10px;
        font-size: 18px;
        text-align: center;
        color: #b5d1ff;
        height: 37px;
        line-height: 36px;
        cursor: pointer;
      }

      .hightBg {
        color: #16f2f3;
        font-weight: 700;
        background: url("./Img/top_btn.png");
        background-size: 100% 100%;
      }

      div:hover {
        color: #16f2f3;
        font-weight: 700;
      }
    }
  }
}

.map-normal {
  transition: all 0.5s;
  position: absolute;
  white-space: nowrap;
  cursor: pointer;
  z-index: 2;
  text-size-adjust: none;
  width: 36px;
  box-shadow: rgba(0, 0, 0, 0.35) 2px 2px 3px;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(139, 164, 220);
  background: rgb(255, 255, 255);
  padding: 2px 5px;
  font-style: normal;
  font-variant: normal;
  font-stretch: normal;
  font-size: 12px;
  line-height: 1.3em;
  font-family: arial, sans-serif;
  text-align: center;
  border-radius: 3px;
  color: rgb(0, 0, 0);
  inset: 120px auto auto 474px;
}

.map-blue {
  transition: all 0.5s;
  inset: 120px auto auto 423px;
  position: absolute;
  white-space: nowrap;
  cursor: pointer;
  z-index: 2;
  text-size-adjust: none;
  width: 51px;
  box-shadow: rgba(0, 0, 0, 0.35) 2px 2px 3px;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(139, 164, 220);
  background: rgb(255, 255, 255);
  padding: 2px 5px;
  font-style: normal;
  font-variant: normal;
  font-stretch: normal;
  font-size: 12px;
  line-height: 1.3em;
  font-family: arial, sans-serif;
  text-align: center;
  border-radius: 3px;
  color: rgb(0, 0, 0);
}
</style>

<style lang="less">
.DataHome {
  .box {
    width: 100%;
    height: 100%;
    overflow-x: inherit !important;
  }
}
.data_left {
  //.el-input__inner {
  //  height: 33px;
  //  line-height: 33px;
  //  margin-bottom: 10px;
  //}

  .el-tree {
    background: none;
    color: #fff;
  }

  .el-tree-node__content {
    background-color: #202431;
  }

  .el-tree-node:focus > .el-tree-node__content {
    background-color: #1584ff !important;
  }

  .el-tree-node__content:hover {
    background-color: #1584ff !important;
  }

  .el-tree--highlight-current
    .el-tree-node.is-current
    > .el-tree-node__content {
    background-color: #1584ff !important;
  }

  .is-current > .el-tree-node__content {
    .el-tree-node__label {
      background-color: #1584ff !important;
    }
  }

  .el-scrollbar__wrap {
    overflow: hidden;
  }
}

.BMap_Marker {
  img {
    width: 50%;
  }
}

.baidumap {
  .bminfo {
    background: none !important;

    p {
      background: none !important;
    }
  }

  .BMap_pop {
    :nth-child(1) {
      :nth-child(1) {
        background: rgba(28, 54, 106, 0.8) !important;
      }
    }

    :nth-child(3) {
      :nth-child(1) {
        background: rgba(28, 54, 106, 0.8) !important;
      }
    }

    :nth-child(5) {
      :nth-child(1) {
        background: rgba(28, 54, 106, 0.8) !important;
      }
    }

    :nth-child(7) {
      :nth-child(1) {
        background: rgba(28, 54, 106, 0.8) !important;
      }
    }
  }

  .BMap_pop {
    img {
      display: none;
    }

    .BMap_center {
      background: rgba(28, 54, 106, 0.8) !important;
    }

    .BMap_top {
      background: rgba(28, 54, 106, 0.8) !important;
    }

    .BMap_bottom {
      background: rgba(28, 54, 106, 0.8) !important;
    }
  }

  .info-window::-webkit-scrollbar {
    width: 6px;

    height: 1px;
  }

  .info-window::-webkit-scrollbar-thumb {
    border-radius: 6px;

    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);

    background: #535353;
  }

  .info-window::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);

    border-radius: 6px;

    background: #ededed;
  }
}
</style>

<style lang="less" scoped>
@import "../../styles/public.module.less";

.data-header {
  height: 64px;
  background-color: #064897;
  padding: 0 24px;

  .logo {
    img {
      max-height: 30px !important;
      margin-right: @spacing-base;
    }

    & > span {
      font-size: 22px;
      font-family: Microsoft YaHei;
      font-weight: bold;
      color: #ffffff;
    }
  }

  .menus {
    .line {
      width: 1px;
      height: 55%;
      background: #bfbfbf;
      margin: auto 16px;
    }

    > div {
      padding-right: 20px;
      padding-left: 20px;
      cursor: pointer;
      font-size: 16px;
      font-family: Source Han Sans CN;
      font-weight: 400;
      color: #fff;

      img {
        width: 24px;
        height: 24px;
        margin-right: @spacing-base;
      }
    }

    .active {
      background-color: #012a67;
    }

    .user-info {
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
        transition: all 3s;

        & > img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        & > span {
          transition: all 3s;
          padding-left: 8px;
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

      ul > li {
        margin-bottom: 4px;
      }
    }
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

.data_left {
  > div:first-child {
    padding: @spacing-base @spacing-medium @spacing-base @spacing-medium;
  }

  > div:last-child {
    padding: 0 0 0 @spacing-medium;
  }

  /deep/ .el-tree {
    .el-tree-node {
      margin-bottom: 4px;
    }

    .el-tree-node__label {
      font-size: 16px;
      padding: 2px;

      &:hover {
        background-color: #1584ff;
      }
    }
  }
  /deep/ .el-scrollbar {
    .el-scrollbar__wrap {
      margin: 0 !important;
      padding-right: 1/2 * @spacing-base;
    }
  }
}

.rdpBB {
  background-color: #101019;
  padding: 10px;
  ::-webkit-scrollbar-track {
    border-radius: 0;
    background: #10254e;
  }
}

.show {
  display: block;
}

.hidden {
  display: none;
}
</style>
