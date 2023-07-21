<template>
  <article style="display: flex">
    <fence
      v-if="fenceShow"
      :projectCode="projectCode"
      :projectName="projectName"
      :isSmart="true"
      @closeFence="closeFence"></fence>
    <person-view
      ref="person"
      v-if="groupId.personId!==null"
      :projectCode="projectCode"
      :projectName="projectName"
      :personId="groupId.personId"></person-view>
    <equip-view
      ref="equip"
      v-if="groupId.equipId!==null"
      :projectCode="projectCode"
      :projectName="projectName"
      :equipId="groupId.equipId"></equip-view>
    <environment-view
      ref="environment"
      v-if="groupId.environId!==null"
      :projectCode="projectCode"
      :projectName="projectName"
      :environId="groupId.environId"></environment-view>
    <video-view
      ref="video"
      v-if="groupId.videoId!==null"
      :projectCode="projectCode"
      :projectName="projectName"
      :videoId="groupId.videoId"></video-view>
    <div class="smartContainer" :role="mainShow?'showContainer':'hideContainer'">
      <div class="tabContainer">
        <nav v-for="(v,i) in tabList" :key="i">
          <div v-if="v==='人员管理'" @click="clickTab('人员管理')">
            <img :src="tabPerson" alt=""/>
            <img v-if="tabHover===v" :src="tabLine" alt=""/>
          </div>
          <div v-if="v==='设备管理'" @click="clickTab('设备管理')">
            <img :src="tabEquip" alt=""/>
            <img v-if="tabHover===v" :src="tabLine" alt=""/>
          </div>
          <div v-if="v==='环境管理'" @click="clickTab('环境管理')">
            <img :src="tabEnvironment" alt=""/>
            <img v-if="tabHover===v" :src="tabLine" alt=""/>
          </div>
          <div v-if="v==='视频监控'" @click="clickTab('视频监控')">
            <img :src="tabVideo" alt=""/>
            <img v-if="tabHover===v" :src="tabLine" alt=""/>
          </div>
        </nav>
      </div>
      <input-search
        placeholder="搜索关键字"
        style="width: 80%;margin-left: 5%"
        size="small"
        enterButton
        v-model="filterText"
        @search="onSearch"></input-search>
      <Tree
        :key="defaultProps.children"
        class="treeContainer"
        :data="treeData"
        :props="defaultProps"
        defaultExpandAll
        :filterNodeMethod="filterNode"
        :expandOnClickNode="false"
        ref="tree">
        <span class="treeNode" slot-scope="{ node, data }" @click="clickTreeNode(data)">
          <img v-if="data.type==='person'" alt="" :src="nodePerson"/>
          <img v-if="data.type==='equipment'" alt="" :src="nodeEquip"/>
          <img v-if="data.type==='environment'" alt="" :src="nodeEnvironment"/>
          <img v-if="data.type==='video'" alt="" :src="nodeVideo"/>
          <span @click="updateView(data)">{{ node.label }}</span>
        </span>
      </Tree>
      <img :src="bluePoint" alt=""/>
      <span @click="openFence()">电子围栏管理</span>
      <img
        :src="arrayClose"
        alt=""
        v-show="mainShow"
        class="array"
        @click="()=>{this.mainShow=false;}"/>
      <img
        :src="arrayOpen"
        alt=""
        v-show="!mainShow"
        class="array"
        @click="()=>{this.mainShow=true;}"/>
    </div>
  </article>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import tabPerson from '../../../../src/assets/extends/bim/smartConstruction/tab_person.png';
import tabEquip from '../../../../src/assets/extends/bim/smartConstruction/tab_equip.png';
import tabEnvironment from '../../../../src/assets/extends/bim/smartConstruction/tab_environment.png';
import tabVideo from '../../../../src/assets/extends/bim/smartConstruction/tab_video.png';
import tabLine from '../../../../src/assets/extends/bim/smartConstruction/tab_line.png';

import nodePerson from '../../../../src/assets/extends/bim/smartConstruction/node_person.png';
import nodeEquip from '../../../../src/assets/extends/bim/smartConstruction/node_equip.png';
import nodeEnvironment from '../../../../src/assets/extends/bim/smartConstruction/node_environment.png';
import nodeVideo from '../../../../src/assets/extends/bim/smartConstruction/node_video.png';


import bluePoint from '../../../../src/assets/extends/bim/smartConstruction/blue_point.png';
import arrayClose from '../../../../src/assets/extends/bim/smartConstruction/array_close.png';
import arrayOpen from '../../../../src/assets/extends/bim/smartConstruction/array_open.png';

import {Input} from "@h3/antd-vue";
import Tree from "element-ui/lib/tree";


import Fence from '../device/fence.vue';
import PersonView from './personView.vue';
import EquipView from './equipView.vue';
import EnvironmentView from './environmentView.vue';
import VideoView from './videoView.vue';

import * as Api from '../../../service/api';

@Component({
  name: 'constructTree',
  components: {
    InputSearch: Input.Search, Tree, Fence, PersonView, EquipView, EnvironmentView, VideoView
  }
})
export default class constructTree extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;

  tabList: Array<string> = ['人员管理', '设备管理', '环境管理', '视频监控'];
  tabHover: string = '人员管理';
  tabPerson: any = tabPerson;
  tabEquip: any = tabEquip;
  tabEnvironment: any = tabEnvironment;
  tabVideo: any = tabVideo;

  nodePerson: any = nodePerson;
  nodeEquip: any = nodeEquip;
  nodeEnvironment: any = nodeEnvironment;
  nodeVideo: any = nodeVideo;

  tabLine: any = tabLine;
  bluePoint: any = bluePoint;
  arrayClose: any = arrayClose;
  arrayOpen: any = arrayOpen;

  filterText: string = '';
  treeData: Array<{ [propsName: string]: string | number | null | boolean }> = []
  defaultProps: { children: string, label: string } = {
    children: 'childs',
    label: 'name'
  };
  mainShow: boolean = true;

  fenceShow: boolean = false;

  groupId: { [propsName: string]: string | null } = {personId: null, equipId: null, environId: null, videoId: null};

  clickTab(v) {
    this.tabHover = v;
  }

  async clickTreeNode(data) {
    if (data.type === 'group') return;
    let resData: any = {};
    await Api.getSingleData({
      appCode: this.projectCode,
      id: data.id as string,
      type: data.type as string
    }).then(res => {
      resData = res.data;
    });
    console.log('clickTreeNode', resData);
    switch (this.tabHover) {
      case '人员管理':
        this.$emit('locationSmartModel', data.id, 'person', resData)
        break;
      case '设备管理':
        this.$emit('locationSmartModel', data.id, 'equipment', resData)
        break;
      case '环境管理':
        this.$emit('locationSmartModel', data.id, 'environment', resData)
        break;
      case '视频监控':
        this.$emit('locationSmartModel', data.id, 'video', resData)
        break;
    }
  }

  closeFence() {
    this.fenceShow = false;
    this.mainShow = true;
    switch (this.tabHover) {
      case '人员管理':
        //@ts-ignore
        this.$refs.person.changeOpen(true);
        break;
      case '设备管理':
        //@ts-ignore
        this.$refs.equip.changeOpen(true);
        break;
      case '环境管理':
        //@ts-ignore
        this.$refs.environment.changeOpen(true);
        break;
      case '视频监控':
        //@ts-ignore
        this.$refs.video.changeOpen(true);
        break;
    }
  }

  onSearch(v) {
    this.filterText = v;
    this.filterTextListener(v)
  }

  filterNode(value, data) {
    if (!value) return true;
    return data.name.indexOf(value) !== -1;
  }

  // @Watch('filterText', {immediate: true})
  filterTextListener(val: string) {
    //@ts-ignore
    this.$refs.tree?.filter(val);
  }

  getPersonTeamList() {
    Api.getPersonTeamList({
      projectCode: this.projectCode,
      projectName: this.projectName
    }).then(res => {
      if (res.errcode !== 0) return;
      this.treeData = res.data;
    })
  }

  getEquipmentGroup() {
    Api.getEquipmentGroup({
      projectCode: this.projectCode,
      projectName: this.projectName
    }).then(res => {
      if (res.errcode !== 0) return;
      this.treeData = res.data;
    })
  }

  getEnvironmentTree() {
    Api.getEnvironmentTree({
      projectCode: this.projectCode,
      projectName: this.projectName
    }).then(res => {
      if (res.errcode !== 0) return;
      this.treeData = res.data;
    })
  }

  getDeviceTree() {
    Api.getBimVideoTree({
      appCode: this.projectCode,
      projectName: this.projectName,
    }).then(res => {
      if (res.errcode !== 0) return;
      this.treeData = res.data;
    })
  }

  openFence() {
    this.fenceShow = true;
    this.mainShow = false;
    switch (this.tabHover) {
      case '人员管理':
        //@ts-ignore
        this.$refs.person.changeOpen(false);
        break;
      case '设备管理':
        //@ts-ignore
        this.$refs.equip.changeOpen(false);
        break;
      case '环境管理':
        //@ts-ignore
        this.$refs.environment.changeOpen(false);
        break;
      case '视频监控':
        //@ts-ignore
        this.$refs.video.changeOpen(false);
        break;
    }
  }

  @Watch('tabHover', {immediate: true})
  tabHoverListener(val: string) {
    this.groupId = {personId: null, equipId: null, environId: null, videoId: null};
    this.filterText = '';

    switch (val) {
      case '人员管理':
        this.groupId.personId = '';
        this.getPersonTeamList();
        break;
      case '设备管理':
        this.groupId.equipId = '';
        this.getEquipmentGroup();
        break;
      case '环境管理':
        this.groupId.environId = '';
        this.getEnvironmentTree();
        break;
      case '视频监控':
        this.groupId.videoId = '';
        this.getDeviceTree();
        break;
    }
  }

  updateView(data) {
    if (data.type !== 'group') return;
    this.groupId = {personId: null, equipId: null, environId: null, videoId: null};
    switch (this.tabHover) {
      case '人员管理':
        this.groupId.personId = data.id;
        break;
      case '设备管理':
        this.groupId.equipId = data.id;
        break;
      case '环境管理':
        this.groupId.environId = data.id;
        break;
      case '视频监控':
        this.groupId.videoId = data.id;
        break;
    }
  }
}
</script>

<style scoped lang="less">
.smartContainer {
  background: url("../../../../src/assets/extends/bim/smartConstruction/left_container.png");
  background-size: 100% 100%;
  width: 305px;
  height: 623px;
  position: fixed;
  top: 12vh;

  & > img {
    margin-left: 15px;
    width: 20px;
    height: 20px;
    opacity: 0.6;
  }

  & > span {
    font-size: 14px;
    color: #0090FF;
    cursor: pointer;
  }

  .array {
    width: 26px;
    height: 35px;
    position: absolute;
    left: 260px;
    top: 295px;
  }

  .tabContainer {
    width: 283px;
    height: 53px;
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;

    & > nav {
      width: 70px;
      height: 53px;


      & > div {
        display: flex;
        flex-direction: column;
        cursor: pointer;
        width: 70px;
        height: 53px;


        & > img:nth-child(1) {
          margin-top: 15px;
          margin-left: 23px;
          width: 23px;
          height: 23px;
        }

        & > img:nth-child(2) {
          margin-top: 13px;
          width: 70px;
          height: 2px;
        }
      }
    }
  }

  .treeContainer {
    width: 265px;
    height: 470px;
    margin: 15px;
    background: transparent;
    color: #FFFFFF;
    overflow-y: auto;

    .treeNode {
      & > img {
        height: 20px;
        width: 20px;
        margin-right: 5px;
      }
    }

    /deep/ .el-tree-node__content:hover {

      background: rgba(255, 255, 255, 0.05);

    }


    /deep/ .el-tree-node:focus > .el-tree-node__content {

      background-color: rgba(28, 174, 231, 0.5);

    }
  }
}

div[role=showContainer] {
  left: 0;
}

div[role=hideContainer] {
  left: -280px;
}

::-webkit-scrollbar-track {
  border-radius: 0;
  background: transparent;
}
</style>
