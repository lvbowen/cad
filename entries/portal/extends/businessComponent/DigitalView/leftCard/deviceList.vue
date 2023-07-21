<template>
  <article class="main-container">
    <div :class="isScale?'cardShow':'cardHide'" class="tree-container">
      <!--      <a-input-search-->
      <!--        class="search-input"-->
      <!--        v-if="isScale"-->
      <!--        placeholder="请输入关键字"-->
      <!--        @change="searchTree"/>-->
      <div class="left-tree">
        <a-tree
          v-if="isScale&&treeData.length>0"
          selectable
          :selectedKeys="selectedKeys"
          :treeData="treeData"
          :replaceFields="replaceFields"
          @select="onSelect"
        >
          <template v-slot:title="item">
            <span
              v-if="searchKeys.indexOf(item.eventKey) > -1"
              style="color: #0bcda3">{{ item.taskName }}</span>
            <span v-else>{{ item.taskName }}</span>
          </template>
        </a-tree>
      </div>
    </div>
    <img
      :src="closePng"
      @click="() => {this.isScale = !this.isScale}"
      class="array-png"
      :style="{marginLeft:isScale?'16.6vw':'1vw',transform:isScale?'rotateY(-180deg)':'rotateY(0deg)' }"/>
  </article>
</template>

<script lang="ts">
import Vue from "vue";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import {Component, InjectReactive, Prop,} from "vue-property-decorator";
import * as Type from "../../../type";
import * as Api from "../../../service/api";
import closePng from "@/assets/extends/cim/tree_array.png";

@Component({
  name: "deviceList",
  components: {
    ATree: Tree,
    AInput: Input,
    AInputSearch: Input.Search,
  },
})
export default class deviceList extends Vue {
  @InjectReactive('project') projectCode?: string;

  // @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  @Prop() private projectName!: string;


  replaceFields: { [propsName: string]: string } = {
    children: 'children', title: 'deviceName', key: 'id'
  };
  treeData: Array<any> = [];
  deviceData: any = [];
  selectedKeys: Array<string> = [];
  selectInfo: any = null;
  searchKeys: Array<any> = [];
  isScale: boolean = true;
  closePng: HTMLImageElement = closePng;

  mounted() {
    this.getDevicesWaterInd();
  }

  //点击树事件
  async onSelect(selectedKeys, info?) {
    if (selectedKeys.length == 0) {
      await this.onSelect(this.selectedKeys, this.selectInfo);
    } else {
      this.selectedKeys = selectedKeys;
      this.selectInfo = info;
      this.$emit("submitMessage", 'Device_Positioning', {"deviceType": info.node.dataRef.deviceType==='监控'?0:info.node.dataRef.deviceType==='水质监测站'?2:1,"deviceID": info.node.dataRef.id});
    }
  }

  //获取左侧项目树
  getDevicesWaterInd() {
    this.treeData = [];
    Api.getDevicesWaterInd({
      appCode: this.projectCode ?? '',
      projectName: this.projectName ?? '',
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('获取设备列表失败！');
      if (!res.data || res.data.length === 0) return this.$message.warn('设备列表为空！');
      const resData = res.data;
      resData.forEach(item => {
        this.$emit('submitMessage','Device_Show', {"deviceType": item.deviceType==='监控'?0:item.deviceType==='水质监测站'?2:1, "deviceID": item.id});
        if (this.deviceData[item.deviceType]) {
          this.deviceData[item.deviceType].push(item);
        } else {
          this.$set(this.deviceData, item.deviceType, [item])
        }
      })
      let numbers = 0
      for (let key in this.deviceData) {
        this.treeData.push({
          deviceName: key,
          children: this.deviceData[key],
          id: String(numbers)
        })
        numbers++;
      }
    })
  }
}
</script>

<style lang="less" scoped>
@import "../../../styles/antd.less";
@import "../../../styles/public.module.less";

.main-container {
  width: 0;
  height: 0;
  .flex;
  .tree-transparent;
  z-index: 5;

  & .tree-container {
    .flex-column;
    transition: all .3s;
    position: fixed;
    background: url("../../../../src/assets/extends/cim/frame_left.png");
    background-size: 100% 100%;
    width: 18vw;
    height: 28vw;
    padding: 1vh 1.5vw;

    .left-tree {
      width: 100%;
      overflow: auto;
      margin-top: 0;
      position: relative;
      .tree-transparent;
      .scrollbar-default;
    }

  }

  & .array-png {
    transition: all .3s;
    position: relative;
    width: 40px;
    height: 80px;
    z-index: 9;
    margin-top: 22vh;
    cursor: pointer;
  }

  .cardShow {
    margin-left: 0;
  }

  .cardHide {
    margin-left: -16.5vw;
  }

}


</style>
