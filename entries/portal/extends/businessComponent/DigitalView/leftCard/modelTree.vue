<template>
  <article class="main-container">
    <div :class="isScale?'cardShow':'cardHide'" class="tree-container">
      <a-input-search
        class="search-input"
        v-if="isScale"
        placeholder="请输入关键字"
        @change="searchTree"/>
      <div class="left-tree">
        <a-tree
          v-if="isScale&&treeData.length>0"
          checkable
          selectable
          :defaultCheckedKeys="defaultCheckedKeys"
          :selectedKeys="selectedKeys"
          :loadData="onLoadData"
          :treeData="treeData"
          :replaceFields="replaceFields"
          @select="onSelect"
          @check="onCheck"
          :defaultExpandedKeys="treeExpandData"
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
      alt=""
      :src="closePng"
      @click="() => {this.isScale = !this.isScale}"
      class="array-png"
      :style="{marginLeft:isScale?'16.6vw':'1vw',transform:isScale?'rotateY(-180deg)':'rotateY(0deg)' }"/>
  </article>
</template>

<script lang="ts">
import Vue from "vue";
import {Component, InjectReactive, Prop,} from "vue-property-decorator";

import {difference} from "lodash";
import Input from "ant-design-vue/lib/input";
import "ant-design-vue/lib/input/style/index.css";
import Tree from "ant-design-vue/lib/tree";
import "ant-design-vue/lib/tree/style/index.css";
import OAuthApi from "@/apis/oauth";
import {Utils} from "@ctesi/core";
import closePng from "@/assets/extends/cim/tree_array.png";

@Component({
  name: "modelTree",
  components: {ATree: Tree, AInput: Input, AInputSearch: Input.Search}
})
export default class modelTree extends Vue {
  @InjectReactive('project') projectCode?: string;

  @Prop() private projectName!: string;

  replaceFields: { [propsName: string]: string } = {
    children: 'children', title: 'taskName', key: 'id'
  };
  treeData: Array<any> = [];
  treeExpandData: Array<string> = [];
  defaultCheckedKeys: Array<string> = [];
  selectedKeys: Array<string> = [];
  selectInfo: any = null;
  searchKeys: Array<any> = [];
  isScale: boolean = true;
  autoExpandParent: boolean = true;
  searchValue: string = '';
  markNum: number = 0;
  closePng: HTMLImageElement = closePng;
  oldCheckedKeys: Array<string> = [];

  mounted() {
    this.getTopTreeList();
  }

  //点击树事件
  async onSelect(selectedKeys, info?) {
    if (selectedKeys.length == 0) {
      await this.onSelect(this.selectedKeys, this.selectInfo);
    } else {
      this.selectedKeys = selectedKeys;
      this.selectInfo = info;
      this.$emit("submitMessage", 'Model_Positioning', {'code': info.node.dataRef.codeValue});
      this.$emit("submitMessage", 'Model_Highlight', {'code': info.node.dataRef.codeValue, "isHigh": 1});
    }
  }

  //获取左侧项目树
  getTopTreeList() {
    this.treeExpandData = [];
    this.defaultCheckedKeys = [];//清空树默认勾选
    this.treeData = [];
    OAuthApi.topTreeList({
      projectCode: this.projectCode ?? '',
      projectName: this.projectName ?? '',
      codeType: '',
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('获取模型树失败！');
      if (!res.data || res.data.length === 0) return this.$message.warn('模型数据为空！');
      const resData = res.data;
      resData.forEach((item, i) => {
        if (!item.children) {
          resData[i].isLeaf = true;
        }
        this.treeExpandData.push(item.id);
        this.defaultCheckedKeys.push(item.id);
      })
      this.slotAdapter(resData);
      this.treeData = resData;
      this.onCheck(this.defaultCheckedKeys, "start");
    })
  }

  // 树 异步加载
  onLoadData(treeNode) {
    const _this = this;
    return new Promise((resolve) => {
      // 有值了直接渲染
      if (treeNode.dataRef.children && treeNode.dataRef.children.length > 0) {
        //@ts-ignore
        resolve();
        return;
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      OAuthApi.childTreeList({
        projectCode: this.projectCode ?? "",
        projectName: this.projectName ?? '',
        id: treeNode.$vnode.data.key,
        codeType: "MBS",
      }).then((res) => {
        res.data?.forEach((item, i) => {
          res.data[i].isLeaf = !!item.children;
        })
        this.slotAdapter(res.data);
        treeNode.dataRef.children = res.data;
        _this.treeData = [..._this.treeData];
      });
      //@ts-ignore
      resolve();
    });
  }

  //左侧树的关键字搜索
  searchTree(e) {
    const value = e.target.value;
    this.treeExpandData = [];
    this.treeData = [];
    this.searchKeys = [];
    if (value.length == 0) {
      this.getTopTreeList();
    } else {
      OAuthApi.getByCodeName({
        codeType: "MBS",
        projectCode: this.projectCode ?? '',
        projectName: this.projectName ?? '',
        name: value,
      }).then((res) => {
        if (res.errcode !== 0) return;
        this.slotAdapter(res.data.tree);
        this.treeData = res.data.tree;
        this.searchKeys = res.data.selectedIds;
        this.treeExpandData = res.data.fatherIds;
      });
    }
  }

  private slotAdapter(datas) {
    if (!Array.isArray(datas)) return;
    Utils.deepFind(datas, (item) => {
      item.scopedSlots = {title: "title"};
      item.isLeaf = !item.hasChild;
      return false;
    }, "children");
  }

  onCheck(checkedKeys, info) {
    if (info == "start") {
      let codeValue: string = '';
      Utils.deepFind(this.treeData, item => {
        if (item.id === checkedKeys[0]) {
          codeValue = item.codeValue;
        }
        return false;
      }, 'children');
      this.$emit("submitMessage", 'Model_Visuality', {'code': codeValue, "isHidden": 0,});
      this.oldCheckedKeys = checkedKeys;
    } else {
      let value: string = '';
      let newCheckKey: Array<string> = []
      if (!info.checked) {
        newCheckKey = difference(this.oldCheckedKeys, checkedKeys);
      } else {
        newCheckKey = difference(checkedKeys, this.oldCheckedKeys,);
      }
      value = newCheckKey[0] ?? '';
      let codeValue: string = '';
      Utils.deepFind(this.treeData, item => {
        if (item.id === value) {
          codeValue = item.codeValue;
        }
        return false;
      }, 'children');
      this.$emit("submitMessage", 'Model_Visuality', {
        'code': codeValue,
        "isHidden": !info.checked ? 1 : 0,
      });
      this.oldCheckedKeys = checkedKeys;
    }
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
  .scrollbar-default;

  & .tree-container {
    .flex-column;
    transition: all .3s;
    position: fixed;
    background: url("../../../../src/assets/extends/cim/frame_left.png");
    background-size: 100% 100%;
    width: 18vw;
    height: 28vw;
    padding: 1vh 1.5vw;

    .search-input {
      width: 100%;
    }

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
