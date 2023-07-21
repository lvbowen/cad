<template>
  <div :class="[`${prefixCls}-warp`]">
    <div :class="[`${prefixCls}-header`]">
      <label>可用函数</label>
    </div>
    <div :class="prefixCls">
      <div :class="[`${prefixCls}-search`]">
        <a-input
          placeholder="搜索函数"
          v-model="searchText"
        >
          <a-icon slot="prefix" type="search"/>
        </a-input>
      </div>
      <div
        :class="[`${prefixCls}-list`]"
        v-if="searchText"
      >
        <div
          v-for="(func, i) in getSearchList"
          :class="[`${prefixCls}-list-item`]"
          :key="i"
          @click="nodeClick(func.formula)"
          @mousemove="nodeHover(func)"
        >
          {{ func.formula }}
        </div>
      </div>
      <div
        v-else
        :class="[`${prefixCls}-list`]"
      >
        <h3-tree
          :treeList="getTreeList"
          :accord="true"
          :folderIcon="{open:'h3yun_All down-o', close: 'h3yun_All right-o'}"
          @node-click="nodeClick"
          @node-hover="nodeHover"
        ></h3-tree>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {Component, Prop, Vue} from 'vue-property-decorator';
import { Input, Icon } from '@h3/antd-vue';
import formulaTypes from './formula-type';
import H3Tree from '@h3/report/basics/components/tree';
import H3Scroll from '@h3/report/basics/components/scroll';
@Component({
  name: 'h3-compute-editor-func',
  components: {
    H3Tree,
    H3Scroll,
    AInput: Input,
    AIcon: Icon
  }
})
export default class ComputeEditorFunc extends Vue {
  @Prop({ default: null }) comPrefixCls: string;
  prefixCls: string = `${this.comPrefixCls}__func`;
  searchText: string = '';
  
  get getSearchList() {
    const keys = [];
    Object.values(formulaTypes).forEach((formulas: {[key: string]: string }) => {
      Object.keys(formulas).forEach((formula: string) => {
        if(formula.includes(this.searchText.toUpperCase())) {
          keys.push({formula, doc: formulas[formula]});
        }
      });
    });
    return keys;
  }
  get getTreeList() {
    const treeList: Array<H3.Tree.TreeNode> = [];
    let treeChildren = [];
    let treeKeysNum = 1;
    Object.keys(formulaTypes).forEach((key: string) => {
      treeChildren = [];
      treeChildren = Object.keys(formulaTypes[key]).map((formulaKey: string) => ({ 
        title: formulaKey, 
        key: `tree-${treeKeysNum++}`,
        doc: formulaTypes[key][formulaKey]
      }));
      treeList.push({
        title: key,
        key: `tree-${treeKeysNum++}`,
        children: treeChildren
      });
    });
    return treeList;
  }

  

  /**
   * 子节点点击事件
   * @param treeNode
   */
  nodeClick(treeNode: H3.Tree.TreeNode | string) {
    if(treeNode instanceof Object) {
      this.$emit('insert-formula', treeNode.title);
    }else {
      this.$emit('insert-formula', treeNode);
    }
  }

  /**
   * 字段hover事件
   * @param treeNode 树节点或者文本
   */
  nodeHover(treeNode: H3.Tree.TreeNode | string){
    if(treeNode instanceof Object) {
      if(!treeNode.folder) {
        this.$emit('show-formula-doc',{ formula:treeNode.title, doc: (treeNode as any).doc });
      }
    }else{
      this.$emit('show-formula-doc', treeNode);
    }
  }
  mounted() {
  }
}
</script>
