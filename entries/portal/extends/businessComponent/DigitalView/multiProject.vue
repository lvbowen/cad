<template>
  <article class="multi-project">
    <CommonHeader ></CommonHeader>
    <a-spin :spinning="spinning" size="large">
      <div class="main-container">
        <div class="bim-tree">
          <a-tree
            v-if="treeData.length>0"
            :treeData="treeData"
            :replaceFields="{children:'children', title:'title', key:'id' }"
            :defaultExpandAll="true"
            @select="selectTree"
            @rightClick="go2DigitalView"
          ></a-tree>
        </div>
        <div class="china-map">
          <china-map
            v-if="MapData.points.length!==0"
            id="MapEcharts"
            :chartData="MapData"
            @pointsClick="pointsClick($event)"
            ref="emitChart"
            style="width: 100%;height: 100%"></china-map>
        </div>
      </div>
    </a-spin>
  </article>
</template>

<script lang="ts">
/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import CommonHeader from "../../../src/components/shared/header/header.vue";
import * as Type from "../../type";
import {ChinaMap} from '../../basicCustomComponent';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import OAuthApi from "@/apis/oauth";
import * as Api from "../../service/api";
import Utils from "../../utils";
import {ProjectLevel} from '../../constant';
import img1 from "../../../src/assets/extends/cim/point.png";

@Component({
  name: "multiProject",
  components: {CommonHeader, ChinaMap, ATree: Tree, ASpin:Spin},
})
export default class multiProject extends Vue {
  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  MapData: any = {
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
  };
  treeData: Array<any> = [];
  treeClickCount: number = 0;
  timer: any = null;
  markers: Array<any> = [];
  img1: HTMLImageElement = img1;
  spinning:boolean=true;

  mounted() {
    this.spinning=true;
    this.refreshProjectTree();
  }

  destroyed() {
    this.timer = null;
  }

  findop(data, arr) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.children || item.children?.length == 0) {
        arr.push({
          name: item.name,
          latitude: item.modelLat,
          longitude: item.modelLng,
          nameList: item.windowDataList,
        });
      } else {
        this.findop(item.children, arr);
      }
    }
    return arr;
  }

  /**
   * 初始化项目树
   * 解决：同一页面，切换不同项目，projectConfig配置还是之前的项目的问题
   */
  refreshProjectTree() {
    // const {projectConfig} = this;
    OAuthApi.getProjectTree({
      appCode: this.projectCode ? this.projectCode : ''
    }).then((res) => {
      if (!res.data) return
      if (res.data.length !== 0) {
        this.getBimProject({
          appCode: this.projectCode ?? "",
          currentProjectName: res.data[0].title ?? "",
          currentLevel: ProjectLevel[res.data[0].value.split('-')[1]] ?? "",
        })
        this.treeData = res.data;
      }
    });
  }

  pointsClick(val) {
    const item = val.data;
    Utils.deepFind( this.treeData, value => {
      if(item.name===value.title){
        item.id=value.id;
        item.appKey=value.appKey;
        item.appSecret=value.appSecret;
      }
      return false;
    }, 'children');

    this.$router.push({
      name: "DigitalView",
      query: {
        projectName: item.name,
        projectId: item.id,
        appKey:item.appKey,
        appSecret:item.appSecret,
      },
    });
  }

  getBimProject(params) {
    Api.getBIMProject(params).then((res) => {
      if (res.errcode === 0) {
        if (!res.data) this.refreshProjectTree();
        this.findop(res.data, this.markers);
        this.MapData.points = this.markers;
        this.MapData.points.map((item) => {
          item['value'] = [item.longitude, item.latitude]
          item['itemStyle'] = {color: "#ff0000"}
        });
        this.spinning = false;
        //@ts-ignore
        Utils.deepFind(res.data??[], data => {
          Utils.deepFind(this.treeData, value => {
            if (data.name === value.title) {
              value.appKey = data.appKey;
              value.appSecret = data.appSecret;
            }
            return false;
          }, 'children');
        }, 'children');
      }
    });
  }

  go2DigitalView(e) {
    if (e.node.dataRef.value.split('-')[1] === '项目') {
      this.$router.push({
        name: "DigitalView",
        query: {
          projectName: e.node.dataRef.title,
          projectId: e.node.dataRef.id,
          appKey:e.node.dataRef.appKey,
          appSecret:e.node.dataRef.appSecret
        },
      });
    }
  }

  selectTree(selectedKeys, e) {
    //记录点击次数
    this.treeClickCount++;
    //单次点击次数超过2次不作处理,直接返回,也可以拓展成多击事件
    if (this.treeClickCount >= 2) {
      if (e.node.dataRef.value.split('-')[1] === '项目') {
        this.$router.push({
          name: "DigitalView",
          query: {
            projectName: e.node.dataRef.title,
            projectId: e.node.dataRef.id,
            appKey:e.node.dataRef.appKey,
            appSecret:e.node.dataRef.appSecret
          },
        });
      }
      return;
    }
    //计时器,计算300毫秒为单位,可自行修改
    this.timer = window.setTimeout(() => {
      if (this.treeClickCount == 1) {
        //把次数归零
        this.treeClickCount = 0;
      } else if (this.treeClickCount > 1) {
        //把次数归零
        this.treeClickCount = 0;
        //双击事件
      }
    }, 300);
  }
}
</script>

<style lang="less" scoped>
@import "../../styles/antd.less";
@import "../../styles/public.module.less";

.multi-project {
  .flex-column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .main-container {
    height: calc(100vh - 64px);
    width: 100vw;
    .flex;
    flex-direction: row;

    .bim-tree {
      height: 100%;
      width: 15vw;
      background-color: #202431;
      .tree-transparent;
    }

    .china-map {
      height: 100%;
      width: 85vw;
      //position: relative;
      background: url("../../../src/assets/extends/cim/map_bg.png");
      background-size: 100% 100%;
    }
  }
}

/deep/.ant-spin-nested-loading > div > .ant-spin .ant-spin-dot {
  top:45vh;
}
/deep/.ant-spin-nested-loading {
  background: rgb(0, 0, 0, 0.85);
}
</style>
