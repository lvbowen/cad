<template>
  <div>
    <div class="box" v-if="this.secMenuLists.length > 0">
      <Tabbar
        :secMenuLists="secMenuLists"
        :projectName="projectName"
        :projectLevel="projectLevel"
        :treeId="treeId"
        :appCode="appCode"
        :expandKeys="expandKeys"
        :isMonitor="isMonitor"
        @tabItemId="tabItemId"
      ></Tabbar>
    </div>
    <div class="baidumap" v-else>
      <baidu-map
        class="baidumap"
        :center="center"
        :zoom="zoom"
        :scrollWheelZoom="true"
        enableDragging="false"
        @ready="handler"
      >
        <bm-map-type :mapTypes="['BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_LEFT"></bm-map-type>
        <bml-marker-clusterer
          v-for="(item, index) in markersMap"
          :averageCenter="true"
          :key="index"
        >
          <bm-marker
            :icon="{ url: item.img1, size: { width: 80, height: 60 } }"
            :position="{ lng: item.longitude, lat: item.latitude }"
            @click="infoWindowOpen(item)"
            :title="item.name"
            v-if="item.longitude!==null&&item.latitude!==null"
          >
            <bm-info-window
              :show="item.show"
              @close="infoWindowClose(item)"
              @open="infoWindowOpen(item)"
            >
              <div class="bminfo">
                <p class="name">{{ item.name }}</p>
                <div class="inNum">在场设备数：{{ inNum }}台</div>
                <p>
                  <span>一般陆地机械设备数：</span><span>{{ num1 }}台</span>
                </p>
                <p>
                  <span>特种设备数：</span><span>{{ num2 }}台</span>
                </p>
                <p>
                  <span>临时用电设备数：</span><span>{{ num3 }}台</span>
                </p>
                <p>
                  <span>船舶数：</span><span>{{ num4 }}台</span>
                </p>
                <h3 class="button" @click="getBIMPlatform(item)">数据统计</h3>
              </div>
            </bm-info-window>
          </bm-marker>
        </bml-marker-clusterer>
      </baidu-map>
      <div :class="isScale ? 'map-normal' : 'map-normal-hide'" @click="getMapNormal(mapData)">
        普通
      </div>
      <div :class="isScale ? 'map-blue' : 'map-blue-hide'" @click="getMapblue(mapData)">午夜蓝</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import BaiduMap from "vue-baidu-map";
import { BmlMarkerClusterer } from "vue-baidu-map";
import BmMarker from "vue-baidu-map/components/overlays/Marker.vue";
import img1 from "./Img/blue.png";
import img2 from "./Img/yellow.png";
import tabbar from "../Tabbar.vue";
import { getMenuById, getRdpByProjectNameAndTabName } from "../server";
import { getEquipmentScreenInfo } from "./server/index.js";

Vue.use(BaiduMap, {
  ak: "61MnoymEFY5Kp1H2vu6pshGQc0ME6YSM",
});
// @ts-ignore
Vue.use(BmMarker);
// @ts-ignore
@Component({
  name: "AllMap",
  components: {
    BmlMarkerClusterer,
    Tabbar: tabbar,
  },
})
export default class AllMap extends Vue {
  secMenuLists: Array<any> = [];
  // @Prop() secMenuLists!: Array<any>;
  projectName: String = "";
  // @Prop() projectName!: String;
  @Prop() projectLevel!: String;
  // @Prop() treeId!: any;
  treeId: any = "";
  @Prop() appCode!: String;
  // @Prop() expandKeys!: Array<any>;
  expandKeys: Array<any> = [];
  @Prop() isMonitor!: Boolean;
  @Prop() parentMenuId!: string;
  @Prop() toHomeVal!: object;

  @Prop() markersMap!: Array<any>;
  @Prop() modelLng!: Number;
  @Prop() modelLat!: Number;
  center: any = { lng: 0, lat: 0 };
  zoom: Number = 5;
  isScale: Boolean = true;
  mapData: Object = {};
  mapstyles: string = "";
  projectCode: string = "";
  deviceType: Number = 4;
  tabId: string = "";
  num1: number = 0;
  num2: number = 0;
  num3: number = 0;
  num4: number = 0;

  inNum: Number = 0;
  PresentData: Array<any> = [];

  isRdp: Boolean = true;
  routeName: String = "";
  allRdp: String = "";
  notProTreeRouteName: Array<any> = ["MonitorPlatform"];

  @Watch("modelLat", { immediate: true })
  changemodelLat(val: number) {
    this.center = { lng: this.modelLng, lat: val };
    if (val > 0) {
      this.zoom = 10;
    } else {
      this.zoom = 5;
      this.center = "北京";
    }
  }
  handler({ BMap, map }) {
    this.mapData = map;
    let mapStyle = { style: "normal" }; //"midnight"
    map.setMapStyle(mapStyle);
  }
  infoWindowOpen(item) {
    getEquipmentScreenInfo(item.projectCode, item.name, item.projectLevel, this.deviceType).then(
      (res) => {
        this.inNum = res.data.inNum;
        this.num1 = res.data.onlineTime[0].num;
        this.num2 = res.data.onlineTime[1].num;
        this.num3 = res.data.onlineTime[2].num;
        this.num4 = res.data.onlineTime[3].num;
      }
    );
    item.show = true;
    item.img1 = img2;
  }
  infoWindowClose(item) {
    item.show = false;
    item.img1 = img1;
  }
  getMapblue(mapData) {
    let mapStyle = { style: "midnight" }; //"midnight"
    mapData.setMapStyle(mapStyle);
    // @ts-ignore
    mapData.setMapType(BMAP_NORMAL_MAP);
  }
  getMapNormal(mapData) {
    let mapStyle = { style: "" };
    mapData.setMapStyle(mapStyle);
    // @ts-ignore
    mapData.setMapType(BMAP_NORMAL_MAP);
  }
  tabItemId(tabItemId) {
    this.tabId = tabItemId;
    console.log("tabId", this.tabId);
  }
  getBIMPlatform(item) {
    getMenuById(this.appCode, this.parentMenuId, item.name).then((res) => {
      this.secMenuLists = res.data;
      if (this.secMenuLists.length > 0) {
        this.$emit("currentId", this.treeId);
      }
    });
    this.projectName = item.name;
    this.treeId = item.id;
  }
  mounted() {
    console.log(this.markersMap,"markersMap")
  }
}
</script>

<style lang="less" scoped>
.baidumap {
  width: 100%;
  height: 89.5vh;
  .bminfo {
    display: flex;
    flex-direction: column;
    overflow: auto;
    width: 220px;
    height: 300px;
    padding: 10px;
    color: #fff;
    font-size: 15px;
    background: none !important;
    position: relative;

    .name {
      margin-bottom: 30px;
    }
    .inNum {
      height: 30px;
      line-height: 20px;
      border-bottom: 2px solid #8593ae;
      margin-bottom: 10px;
    }
    .p-list {
      margin-bottom: 10px;
    }

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
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }
  /deep/.BMap_pop {
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
  .bminfo {
    background: none !important;

    p {
      background: none !important;
    }
  }
}
/deep/.BMap_top {
  width: 202px !important;
  background: rgba(28, 54, 106, 0.8) !important;
}
/deep/.BMap_center {
  width: 250px !important;
  background: rgba(28, 54, 106, 0.8) !important;
}
/deep/.BMap_bottom {
  width: 202px !important;
  background: rgba(28, 54, 106, 0.8) !important;
  z-index: 2 !important;
}
</style>
<style lang="less" scoped>
@import "../../../styles/public.module.less";
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
  inset: 28px auto auto 72px;
}

.map-normal-hide {
  .map-normal-common;
  inset: 20px auto auto 99px;
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
  inset: 28px auto auto 117px;
}

.map-blue-hide {
  .map-blue-common;
  inset: 20px auto auto 48px;
}
</style>
