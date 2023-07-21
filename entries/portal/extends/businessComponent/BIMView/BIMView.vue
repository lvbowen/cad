<template>
  <div class="bimview">
    <Common-Header />
    <rdp-report
      v-if="reportRDPCollections"
      :dataRDP="reportRDPCollections"
      :isScale="isScale"
    ></rdp-report>
    <div class="bim_main">
      <div class="eltree" :style="{ width: isScale ? '256px' : '0' }">
        <!--                <div class="nav-scale">-->
        <!--                  <div class="scale" v-show="isScale">-->
        <!--                    <a-icon type="backward" @click="isScale=false"/>-->
        <!--                  </div>-->
        <!--                  <div class="scale" v-show="!isScale" @click="isScale=true">-->
        <!--                    <a-icon type="forward"></a-icon>-->
        <!--                  </div>-->
        <!--                </div>-->
        <div class="nav flex" :class="backgroundColor" v-show="isScale">
          <div class="search">
            <el-input
              size="small"
              @change="filter"
              placeholder="项目名称"
              v-model="filterText">
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>
          <el-scrollbar style="height: 100%" class="flex-1">
            <el-tree
              class="filter-tree"
              :data="data"
              :props="defaultProps"
              defaultExpandAll
              :filterNodeMethod="filterNode"
              :expandOnClickNode="false"
              ref="tree"
              :highlightCurrent="true"
              @node-click="bimtree"
            >
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span v-if="data.projectState === '准备'">
                  <img :src="preparePic" style="height: 15px; width: 30px; margin-right: 5px" alt=""/>
                </span>
                <span v-else-if="data.projectState === '交工'">
                  <img :src="submitPic" style="height: 15px; width: 30px; margin-right: 5px" alt=""/>
                </span>
                <span v-else-if="data.projectState === '完工'">
                  <img :src="endPic" style="height: 15px; width: 30px; margin-right: 5px" alt=""/>
                </span>
                <span v-else-if="data.projectState === '尾工'">
                  <img :src="finalPic" style="height: 15px; width: 30px; margin-right: 5px" alt=""/>
                </span>
                <span v-else-if="data.projectState === '暂停'">
                  <img :src="pausePic" style="height: 15px; width: 30px; margin-right: 5px" alt=""/>
                </span>
                <span v-else-if="data.projectState === '运行'">
                  <img :src="workPic" style="height: 15px; width: 30px; margin-right: 5px" alt=""/>
                </span>
                <span @dblclick="handleDBClick(data)">{{ data.name }}</span>
              </span>
            </el-tree>
          </el-scrollbar>
        </div>
      </div>
      <div class="map_center">
        <img
          v-show="!isScale"
          src="./pic/open.png"
          class="off-on"
          @click="isScale = true" />
        <img
          v-show="isScale"
          src="./pic/off.png"
          class="off-on"
          @click="isScale = false" />
        <div class="baidumap">
          <baidu-map
            :scrollWheelZoom="true"
            :center="center"
            :zoom="zoom"
            class="baidumap"
            enableDragging="false"
            @ready="handler"
            v-if="!flag"
          >
            <bm-map-type
              :mapTypes="['BMAP_HYBRID_MAP']"
              anchor="BMAP_ANCHOR_TOP_LEFT"
            ></bm-map-type>
            <bml-marker-clusterer
              v-for="(item, index) in markers"
              :averageCenter="true"
              :key="index"
            >
              <bm-marker
                :icon="{ url: item.img1, size: { width: 80, height: 60 } }"
                :position="{ lng: item.longitude, lat: item.latitude }"
                @click="infoWindowOpen(item)"
                :title="item.name"
              >
                <bm-info-window
                  :show="item.show"
                  @close="infoWindowClose(item)"
                  @open="infoWindowOpen(item)"
                >
                  <div class="bminfo">
                    <p>{{ item.name }}</p>
                    <p v-for="(nameitem, nameindex) in item.nameList" :key="nameindex">
                      <i></i> {{ nameitem.title }} ：{{ nameitem.content }}
                    </p>
                    <h3 class="button" @click="getBIMPlatform(item)">进入项目</h3>
                  </div>
                </bm-info-window>
              </bm-marker>
            </bml-marker-clusterer>
          </baidu-map>
          <div class="china-map" v-if="MapData.points.length!==0">
            <a-map
              :key="keyNum"
              id="MapEcharts"
              :chartData="MapData"
              @pointsClick="pointsClick($event)"
              ref="emitChart"
              style="width: 100%; height: 100%"
            ></a-map>
          </div>
        </div>
      </div>
    </div>
    <!-- <div
      :class="[
        isScale ? 'map-normal' : 'map-normal-hide',
        backgroundColor == 'Green' ? 'map-normal-green' : '',
      ]"
      @click="getMapNormal(mapData)"
    >
      普通
    </div>
    <div
      :class="[
        isScale ? 'map-blue' : 'map-blue-hide',
        backgroundColor == 'Green' ? 'map-blue-green' : '',
      ]"
      @click="getMapblue(mapData)"
    >
      午夜蓝
    </div>
    <div
      :class="[
        isScale ? 'map-light' : 'map-light-hide',
        backgroundColor == 'Green' ? 'map-light-green' : '',
      ]"
      @click="getMaplight(mapData)"
    >
      清新蓝
    </div>
    <div
      :class="[
        isScale ? 'map-dark' : 'map-dark-hide',
        backgroundColor == 'Green' ? 'map-dark-green' : '',
      ]"
      @click="getMapdark(mapData)"
    >
      黑夜
    </div>
    <div
      :class="[
        isScale ? 'map-googlelite' : 'map-googlelite-hide',
        backgroundColor == 'Green' ? 'map-googlelite-green' : '',
      ]"
      @click="getMapgooglelite(mapData)"
    >
      精简
    </div>
    <div
      :class="[
        isScale ? 'map-grassgreen' : 'map-grassgreen-hide',
        backgroundColor == 'Green' ? 'map-grassgreen-green' : '',
      ]"
      @click="getMapgrassgreen(mapData)"
    >
      自然绿
    </div>
    <div
      :class="[
        isScale ? 'map-pink' : 'map-pink-hide',
        backgroundColor == 'Green' ? 'map-pink-green' : '',
      ]"
      @click="getMappink(mapData)"
    >
      浪漫粉
    </div>
    <div
      :class="[
        isScale ? 'map-darkgreen' : 'map-darkgreen-hide',
        backgroundColor == 'Green' ? 'map-darkgreen-green' : '',
      ]"
      @click="getMapdarkgreen(mapData)"
    >
      青春绿
    </div>
    <div
      :class="[
        isScale ? 'map-bluish' : 'map-bluish-hide',
        backgroundColor == 'Green' ? 'map-bluish-green' : '',
      ]"
      @click="getMapbluish(mapData)"
    >
      蓝绿
    </div>
    <div
      :class="[
        isScale ? 'map-grayscale' : 'map-grayscale-hide',
        backgroundColor == 'Green' ? 'map-grayscale-green' : '',
      ]"
      @click="getMapgrayscale(mapData)"
    >
      高端灰
    </div>
    <div
      :class="[
        isScale ? 'map-hardedge' : 'map-hardedge-hide',
        backgroundColor == 'Green' ? 'map-hardedge-green' : '',
      ]"
      @click="getMaphardedge(mapData)"
    >
      强边界
    </div>
    <div
      :class="[
        isScale ? 'map-ChinaMap' : 'map-ChinaMap-hide',
        backgroundColor == 'Green' ? 'map-ChinaMap-green' : '',
      ]"
      @click="getChinaMap"
    >
      MAP
    </div> -->
  </div>
</template>

<script>
import Vue from "vue";
import env from "@/config/env";
import CommonHeader from "../../../src/components/shared/header/header.vue";
import Tree from "element-ui/lib/tree";
import Input from "element-ui/lib/input";
import img1 from "./1.png";
import img2 from "./2.png";
import BaiduMap from "vue-baidu-map";
import { BmlMarkerClusterer } from "vue-baidu-map";
import BmMarker from "vue-baidu-map/components/overlays/Marker.vue";
import { getBIMProject, getBimViewRdpReport } from "../../service/api";
import RdpReport from "./rdpReports.vue";
import { ProjectLevel } from "../../constant";
import preparePic from "./pic/准备.png";
import submitPic from "./pic/交工.png";
import endPic from "./pic/完工.png";
import finalPic from "./pic/尾工.png";
import pausePic from "./pic/暂停.png";
import workPic from "./pic/运行.png";
import OAuthApi from "../../../src/apis/oauth";
import Map from "../../basicCustomComponent/Map/ChinaMap.vue";

Vue.use(BaiduMap, {
  ak: "61MnoymEFY5Kp1H2vu6pshGQc0ME6YSM",
});
Vue.use(BmMarker);
export default {
  components: {
    CommonHeader,
    RdpReport,
    ElTree: Tree,
    ElInput: Input,
    BmlMarkerClusterer,
    // AIcon: Icon,
    AMap: Map,
  },
  inject: ["projectConfig"],
  data() {
    return {
      filterText: "",
      mapstyles: "",
      mapData: {},
      show: false,
      img1: img1,
      workPic: workPic,
      pausePic: pausePic,
      finalPic: finalPic,
      preparePic: preparePic,
      submitPic: submitPic,
      endPic: endPic,
      center: "中国",
      zoom: 5,
      data: [],
      markers: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      isScale: true, //放缩
      reportRDPCollections: null,
      backgroundColor: "",
      MapData: {
        HotspotsData: [],
        points: [
          // { value: [118.8062, 31.9208], itemStyle: { color: "#4ab2e5" } },
          // { value: [113.034187, 22.4583] },
        ],
        visualMapShow: false,
        period: 15,
        scale: 4,
        symbolSize: 40,
        tooltipShow: true,
      },
      flag: true,
      keyNum: 0,
    };
  },
  mounted() {
    this.projectCode = `${env.project}`;
    this.backgroundColor = sessionStorage.getItem("BgColor");
    this.refreshProjectTree();
  },
  methods: {
    handleDBClick(item) {
      if (item.modelLat == null || item.modelLng == null) {
        this.$message.warn("暂无模型！");
      } else {
        const { projectConfig } = this;
        projectConfig?.updateProjectConfig(item.name, "项目", null);
        this.$router.push({
          name: "BIMPlatform",
          query: {
            projectId: item.id,
            projectName: item.name,
            projectCode: this.projectCode,
            icon: item.icon,
          },
        });
      }
    },
    pointsClick(val) {
      const item = val.data;
      const { projectConfig } = this;
      projectConfig?.updateProjectConfig(item.name, "项目", null);
      this.$router.push({
        name: "BIMPlatform",
        query: {
          projectId: item.id,
          projectName: item.name,
          projectCode: item.projectCode,
          icon: item.icon,
        },
      });
    },
    /*getChinaMap() {
      this.flag = true;
    },
    getMaphardedge(mapData) {
      let mapStyle = { style: "hardedge" };
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
      this.flag = false;
    },
    getMapgrayscale(mapData) {
      let mapStyle = { style: "grayscale" };
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
      this.flag = false;
    },
    getMapbluish(mapData) {
      let mapStyle = { style: "bluish" };
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
      this.flag = false;
    },
    getMapdarkgreen(mapData) {
      let mapStyle = { style: "darkgreen" };
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
      this.flag = false;
    },
    getMappink(mapData) {
      let mapStyle = { style: "pink" };
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
      this.flag = false;
    },
    getMapgrassgreen(mapData) {
      let mapStyle = { style: "grassgreen" };
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
      this.flag = false;
    },
    getMapgooglelite(mapData) {
      let mapStyle = { style: "googlelite" };
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
      this.flag = false;
    },
    getMapdark(mapData) {
      let mapStyle = { style: "dark" };
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
      this.flag = false;
    },
    getMaplight(mapData) {
      let mapStyle = { style: "light" };
      mapData.setMapStyle(mapStyle);
      mapData.setMapType(BMAP_NORMAL_MAP);
      this.flag = false;
    },*/
    /*    getMapblue(mapData) {
          let mapStyle = { style: "midnight" }; //"midnight"
          mapData.setMapStyle(mapStyle);
          mapData.setMapType(BMAP_NORMAL_MAP);
          this.flag = false;
        },
        getMapNormal(mapData) {
          let mapStyle = { style: "" };
          mapData.setMapStyle(mapStyle);
          mapData.setMapType(BMAP_NORMAL_MAP);
          this.flag = false;
        },*/
    getBIMPlatform(item) {
      console.log(item, "getBIMPlatform");
      const { projectConfig } = this;
      projectConfig?.updateProjectConfig(item.name, "项目", null);
      this.$router.push({
        name: "BIMPlatform",
        query: {
          projectId: item.id,
          projectName: item.name,
          projectCode: item.projectCode,
          icon: item.icon,
        },
      });
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
          });
        } else {
          this.findop(item.children, arr);
        }
      }
      return arr;
    },
    bimtree(val) {
      console.log(val);
      this.getRdpReport(val.name);
      if (val.modelLat && val.modelLng) {
        this.center = { lat: val.modelLat, lng: val.modelLng };
        this.zoom = 16;
      }
    },
    handler({ map }) {
      console.log(map);
      this.mapData = map;
      let mapStyle = { style: "midnight" }; //默认午夜蓝=>"midnight"
      map.setMapStyle(mapStyle);
      this.flag = false;
    },
    infoWindowOpen(item) {
      item.show = true;
      item.img1 = img2;
    },
    infoWindowClose(item) {
      item.show = false;
      item.img1 = img1;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    getRdpReport(projectName) {
      this.reportRDPCollections = [];
      const params = {
        appCode: this.projectCode,
        projectName: projectName,
      };
      getBimViewRdpReport(params).then((res) => {
        console.log("getBimViewRdpReport", res);
        if (!res.data) return;
        this.reportRDPCollections = res.data;
      });
    },
    /**
     * 初始化项目树
     * 解决：同一页面，切换不同项目，projectConfig配置还是之前的项目的问题
     */
    refreshProjectTree() {
      const { projectConfig } = this;
      OAuthApi.getProjectTree({
        appCode: this.projectCode ? this.projectCode : "",
      }).then((res) => {
        if (!res.data) return;
        if (res.data.length !== 0) {
          const name = res.data[0].title;
          const level = ProjectLevel[res.data[0].value.split("-")[1]];
          projectConfig?.updateProjectConfig(name, level, res.data[0].key);
          this.projectSelect = { label: name, value: res.data[0].key };
          this.getBimProject({
            appCode: this.projectCode ?? "",
            currentProjectName: name ?? "",
            currentLevel: level ?? "",
          });
        }
      });
    },
    getBimProject(params) {
      getBIMProject(params).then((res) => {
        if (res.errcode === 0) {
          if (!res.data) this.refreshProjectTree();
          this.data = res.data;
          this.findop(this.data, this.markers);
          this.MapData.points = this.markers;
          this.MapData.points.map((item) => {
            item["value"] = [item.longitude, item.latitude];
            item["itemStyle"] = { color: "#ff0000" };
          });
          if (this.data.length === 0) return;
          this.getRdpReport(this.data[0].name);
        }
      });
    },
    filter(val) {
      this.$refs.tree.filter(val);
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../styles/public.module.less";

.bimview {
  .search {
    display: flex;
  }

  .bim_main {
    display: flex;
    height: 93%;
    flex: 1;
    background: url("../../../src/components/shared/img/bg.png");
    background-size: 100% 100%;
    .eltree {
      transition: all 0.5s;
      overflow: hidden;
      .nav {
        transition: all 0.5s;
        width: 100%;
        //width: calc(100% - 15px);
        display: flex;
        padding-left: 10px;
        padding-right: 10px;
        flex-direction: column;
        // min-height: 100%;
        height: 100%;
        overflow-y: auto;
        padding-top: 15px;
      }
      .Blue {
        background: #202431 !important;
      }
      .TecBlue {
        background: url("../../../src/components/shared/img/cm.png");
        background-size: 100% 100%;
        .el-tree {
          background: transparent !important;
          .nav, .flex ,.Blue{
            background: #202431;
          }

        }
      }
      .Green {
        background: url("../../../src/components/shared/img/组2626.png");
        background-size: 100% 100%;
        .el-tree {
          background: transparent !important;
        }
      }
    }

    .map_center {
      height: 100%;
      background: #202431;
      display: flex;
      flex: 1;
      flex-direction: column;

      .off-on {
        width: max-content;
        position: absolute;
        top: 50%;
        z-index: 50;
      }

      .img-pos {
        display: flex;
        align-items: flex-end;
        align-content: flex-end;
        justify-content: center;

        img {
          width: 100%;
          //position: absolute;
          //bottom: 0;
          max-height: 250px;
          //width: 1048px;
          margin-bottom: 4px;
        }
      }
    }

    .baidumap {
      display: flex;
      flex: 1;
      border: 0;
      //margin-left: 5px;
      height: 100%;
      .china-map {
        height: calc(100vh - 64px);
        // width: calc(100vw - 264px);
        width: 100%;
        position: relative;
        background: url("../../../src/assets/extends/bim/map_bg.png");
        background-size: 100% 100%;
        //background: red;
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

  .map-normal-common {
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
  }

  .map-normal {
    .map-normal-common;
    inset: 74px auto auto 355px;
  }
  .map-normal-green {
    .map-normal-common;
    inset: 90px auto auto 355px;
  }

  .map-normal-hide {
    .map-normal-common;
    inset: 90px auto auto 48px;
  }
  .map-normal-hide-green {
    .map-normal-common;
    inset: 90px auto auto 99px;
  }

  .map-blue-common {
    transition: all 0.5s;
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

  .map-blue {
    .map-blue-common;
    inset: 74px auto auto 304px;
  }
  .map-blue-green {
    .map-blue-common;
    inset: 90px auto auto 304px;
  }

  .map-blue-hide {
    .map-blue-common;
    inset: 90px auto auto 84px;
  }

  .map-light {
    .map-blue-common;
    inset: 74px auto auto 391px;
  }
  .map-light-green {
    .map-blue-common;
    inset: 90px auto auto 391px;
  }
  .map-light-hide {
    .map-blue-common;
    inset: 90px auto auto 135px;
  }

  .map-dark {
    .map-blue-common;
    inset: 74px auto auto 442px;
  }
  .map-dark-green {
    .map-blue-common;
    inset: 90px auto auto 442px;
  }
  .map-dark-hide {
    .map-blue-common;
    inset: 90px auto auto 186px;
  }

  .map-googlelite {
    .map-blue-common;
    inset: 74px auto auto 493px;
  }
  .map-googlelite-green {
    .map-blue-common;
    inset: 90px auto auto 493px;
  }
  .map-googlelite-hide {
    .map-blue-common;
    inset: 90px auto auto 237px;
  }

  .map-grassgreen {
    .map-blue-common;
    inset: 74px auto auto 544px;
  }
  .map-grassgreen-green {
    .map-blue-common;
    inset: 90px auto auto 544px;
  }
  .map-grassgreen-hide {
    .map-blue-common;
    inset: 90px auto auto 288px;
  }

  .map-pink {
    .map-blue-common;
    inset: 74px auto auto 595px;
  }
  .map-pink-green {
    .map-blue-common;
    inset: 90px auto auto 595px;
  }
  .map-pink-hide {
    .map-blue-common;
    inset: 90px auto auto 339px;
  }
  //darkgreen
  .map-darkgreen {
    .map-blue-common;
    inset: 74px auto auto 646px;
  }
  .map-darkgreen-green {
    .map-blue-common;
    inset: 90px auto auto 646px;
  }
  .map-darkgreen-hide {
    .map-blue-common;
    inset: 90px auto auto 390px;
  }

  .map-bluish {
    .map-blue-common;
    inset: 74px auto auto 697px;
  }
  .map-bluish-green {
    .map-blue-common;
    inset: 90px auto auto 697px;
  }
  .map-bluish-hide {
    .map-blue-common;
    inset: 90px auto auto 441px;
  }
  //grayscale
  .map-grayscale {
    .map-blue-common;
    inset: 74px auto auto 748px;
  }
  .map-grayscale-green {
    .map-blue-common;
    inset: 90px auto auto 748px;
  }
  .map-grayscale-hide {
    .map-blue-common;
    inset: 90px auto auto 492px;
  }
  //hardedge
  .map-hardedge {
    .map-blue-common;
    inset: 74px auto auto 799px;
  }
  .map-hardedge-green {
    .map-blue-common;
    inset: 90px auto auto 799px;
  }
  .map-hardedge-hide {
    .map-blue-common;
    inset: 90px auto auto 543px;
  }
  //ChinaMap
  .map-ChinaMap {
    .map-blue-common;
    inset: 74px auto auto 850px;
  }
  .map-ChinaMap-green {
    .map-blue-common;
    inset: 90px auto auto 850px;
  }
  .map-ChinaMap-hide {
    .map-blue-common;
    inset: 90px auto auto 594px;
  }
}
</style>

<style lang="less">
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

::-webkit-scrollbar-track {
  border-radius: 0;
  background: transparent;
}
.bimview {
  .el-tree {
    background: transparent;
    color: #fff;
  }
  .el-tree-node:focus > .el-tree-node__content {
    background-color: #1584ff !important;
  }

  .el-tree-node__content:hover {
    background-color: #1584ff !important;
  }

  .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: #1584ff !important;
  }
  .Blue {
    .el-tree {
      background: #202431;
      color: #fff;
    }

    .el-tree-node:focus > .el-tree-node__content {
      background-color: #1584ff !important;
    }

    .el-tree-node__content:hover {
      background-color: #1584ff !important;
    }

    .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
      background-color: #1584ff !important;
    }

    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }
  .Green {
    .el-tree {
      background: #202431;
      color: #fff;
    }

    .el-tree-node:focus > .el-tree-node__content {
      background: linear-gradient(90deg, #26d4c7, #05a2a6);
      background-size: 100% 100%;
    }

    .el-tree-node__content:hover {
      background: linear-gradient(90deg, #26d4c7, #05a2a6);
      background-size: 100% 100%;
    }

    .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
      background: linear-gradient(90deg, #26d4c7, #05a2a6);
      background-size: 100% 100%;
    }

    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }
  .TecBlue {
    .search {
      width: 84%;
      background: url("../../../src/components/shared/img/ss.png");
      background-size: 100% 100%;
      margin-bottom: 10px;
    }
    .el-input__inner {
      border: none;
    }
    .el-input-group {
      width: 100%;
    }
    .el-input__inner {
      background: transparent;
      color: #fff;
    }
    .el-input-group__append {
      background-color: transparent;
      padding: 0 10px;
      border: none;
    }
    .el-tree-node {
      width: 90%;
    }
    .el-tree {
      background: #202431;
      color: #fff;
    }

    .el-tree-node:focus > .el-tree-node__content {
      background: url("../../../src/components/shared/img/组26351.png") !important;
      background-size: 100% 100%;
    }

    .el-tree-node__content:hover {
      background: url("../../../src/components/shared/img/组26351.png") !important;
      background-size: 100% 100%;
    }

    .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
      background: url("../../../src/components/shared/img/组26351.png") !important;
      background-size: 100% 100%;
    }

    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }
}
</style>
