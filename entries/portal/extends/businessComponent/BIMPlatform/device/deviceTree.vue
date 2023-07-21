<template>
  <article class="mainContainer">
    <div :class="isScale?'cardShow':'cardHide'" class="left_class">
      <div class="mainTree">
        <a-input-search
          v-if="isScale"
          style="margin: 8px;width: 90%"
          placeholder="请输入关键字"
          @change="onChange"/>
        <a-tree
          v-if="isScale"
          :key="markNum"
          checkable
          :defaultCheckedKeys="defaultCheckedKeys"
          :autoExpandParent="autoExpandParent"
          :treeData="treeData"
          @select="clickTree"
          @expand="onExpand"
          @check="onCheck"
          :expandedKeys="expandedKeys"
          :replaceFields="replaceFields"
        >
          <template slot="title" slot-scope="title">
            <span v-if="title.nodeName.indexOf(searchValue) > -1">
              {{ title.nodeName.substr(0, title.nodeName.indexOf(searchValue)) }}
              <span style="color: #f50">{{ searchValue }}</span>
              {{ title.nodeName.substr(title.nodeName.indexOf(searchValue) + searchValue.length) }}
            </span>
            <span v-else>{{ title.nodeName }}</span>
          </template>
        </a-tree>
      </div>
      <div class="cardOpt">
        <img
          v-show="isScale"
          src="../../../../src/assets/extends/bim/frame_left_a1.png"
          @click="() => {this.isScale = false}"
          style="height: 100%;width: 100%"
        />
        <img
          v-show="!isScale"
          src="../../../../src/assets/extends/bim/frame_left_a.png"
          @click="() => {this.isScale = true}"
          style="height: 100%;width: 100%"
        />
      </div>
    </div>
  </article>
</template>
<script lang="ts">
import Vue from "vue";
import {Tree, Input,} from "@h3/antd-vue";
import {Component, InjectReactive, Prop, Watch,} from "vue-property-decorator";
import * as Type from "../../../type";
import * as Api from "../../../service/api";
import {ProjectLevel} from "../../../constant";

@Component({
  name: "deviceTree",
  components: {
    ATree: Tree,
    AInput: Input,
    AInputSearch: Input.Search,
  },
})
export default class deviceTree extends Vue {
  @Prop() projectCode!: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  replaceFields: { [propsName: string]: string } = {
    children: 'children', title: 'nodeName', key: 'id'
  };
  treeData: Array<{ [propsName: string]: string | boolean | number | null }> = [];
  dataList: Array<{ [propsName: string]: string }> = [];
  isScale: boolean = true;
  autoExpandParent: boolean = true;
  expandedKeys: Array<string | null> = [];
  defaultCheckedKeys: Array<string | null> = [];
  searchValue: string = '';
  markNum: number = 0;
  selectData: any = {};

  mounted() {
    this.getDeviceTree();
  }

  //点击树事件
  clickTree(selectedKeys, e) {
    if(e.node.dataRef.symbolId===null) return this.$message.warn('无对应图标ID!');
    this.$emit('locationMarkerSymbol',e.node.dataRef.symbolId)
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

  //获取左侧项目树
  getDeviceTree() {
    this.treeData = [];
    Api.deviceTreeNew({
      appCode: this.projectCode ?? '',
      currentProjectName: this.projectConfig?.projectName ?? '',
      //@ts-ignore
      currentLevel: ProjectLevel[this.projectConfig?.projectLevel] ?? "",
    }).then(res => {
      //@ts-ignore
      if (!res.data || res.errcode !== 0) return this.$message.warn('获取项目树失败！')
      this.treeData = res.data;
      this.markNum += 1;
      this.generateList(this.treeData);
      if (this.treeData.length === 0) return
      if (this.expandedKeys.length == 0) {
        //@ts-ignore
        this.expandedKeys.push(this.treeData[0]?.id)
        //@ts-ignore
        this.defaultCheckedKeys.push(this.treeData[0]?.id);
      }
    })
  }

  getParentKey(key, tree) {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.id === key)) {
          parentKey = node.id;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  }

  //左侧树的关键字搜索
  onChange(e) {
    const value = e.target.value;
    const expandedKeys = this.dataList
      .map(item => {
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

  onCheck(e, info) {
    if(info.node.dataRef.symbolId===null) return this.$message.warn('无对应图标ID!');
      if (info.checked === false) {
        this.$emit('displayMarkerSymbol', false, [info.node.dataRef.symbolId])
      } else {
        this.$emit('displayMarkerSymbol', true,[info.node.dataRef.symbolId])
      }
  }

  //左侧树的展开事件
  onExpand(expandedKeys) {
    this.expandedKeys = expandedKeys;
    this.autoExpandParent = false;
  }
}
</script>

<style lang="less" scoped>
@import "../../../styles/antd.less";
.mainContainer {
  display: flex;

  & .left_class {
    display: flex;
    position: fixed;
    background: url("../../../../src/assets/extends/bim/frame_left.png");
    background-size: 100% 100%;
    border-color: transparent;
    //padding: 0.625vw;
    width: 20vw !important;
    height: 28.33vw !important;
    //flex-direction: column !important;
    margin-top: 0.52vw !important;
    //margin-left: 2px !important;

    .left_tree {
      width: 100%;
      overflow: auto;
      margin-top: 0;
      position: relative;
      .tree-transparent;
    }

    //树滚轴-透明
    /deep/ ::-webkit-scrollbar-track {
      border-radius: 0;
      background: transparent;
    }
  }
}

.mainTree {
  display: flex;
  width: 100%;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  /deep/ .ant-tree {
    color: white;
    font-size: 16px;
    height: calc(100vh - 200px);
  }

}

.cardOpt {
  //display: flex;
  height: 100%;
  display: flex;
  align-items: center;

  & > img {
    width: 27px !important;
    height: 36px !important;
    cursor: pointer;
  }
}

.cardShow {
  margin-left: 0 !important;
}

.cardHide {
  margin-left: -18vw !important;
}

</style>
