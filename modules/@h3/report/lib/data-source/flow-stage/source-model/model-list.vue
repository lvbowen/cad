<template>
  <div :class="prefixCls">
    <div :class="[`${prefixCls}__search`]">
      <a-input
        placeholder="搜索"
        v-model="searchValue"
        @change="onSearch"
      >
        <a-icon slot="prefix" type="search"/>
      </a-input>
      <i
        class="h3yun_All close-circle empty-search"
        v-if="searchValue"
        @click="empty()"
      > </i>
    </div>
    <div :class="`${prefixCls}__tree`">
      <h3-tree
        v-if="!searchValue.length && treeList"
        :accord="false"
        :treeList="treeList"
        :folderIcon="folderIcon"
        :nodeIcon="nodeIcon"
        :folderSelected="true"
        :openKeys="openKeys"
        @node-click="nodeClick"
      >
      </h3-tree>
      <!-- 搜索 -->
      <ul :class="`${prefixCls}__search-content`" v-else>
        <li
          v-for="(item, index) in searchContentList"
          :key="index"
          :class="{ selected: searchSelected === item.value }"
        >
          <div
            class="ellipsis"
            v-if="item.content && item.value !== ''"
            v-html="item.content"
            @click="clickOnSearch(item, index)"
            :title="item.content"
          ></div>
          <div
            v-else
            class="empty"
            v-html="item.content"
          ></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { Input, Icon } from "@h3/antd-vue";
import H3Tree from "@h3/report/basics/components/tree";
import { source } from "../mock.js";

const ReportDataSource = namespace("dataSource");
@Component({
  name: "h3-report-model-list",
  components: {
    AInput: Input,
    AIcon: Icon,
    H3Tree
  }
})
export default class ReportModelList extends Vue {
  @Prop({ default: () => [] }) modelList!: Array<H3.Falls.SourceModel>;
  @Prop({ default: () => "" }) selectSchemaCode!: string; // 默认打开
  prefixCls: string = "h3-report-model-list";
  // 树组件
  treeList: Array<H3.Tree.TreeNode> = [];
  // 搜索内容选中的值
  searchSelected: string = "";
  // 默认打开文件夹
  openKeys: Array<string> = [];
  // 输入框值
  searchValue: string = "";
  // 搜索内容list
  searchContentList: Array<H3.Input.searchGroup> = [];
  // 目录级icon
  folderIcon: object = { open: "h3yun_All folder-open-fill", close: "h3yun_All folder-fill" };
  // 子级icon
  nodeIcon: string = "h3yun_All sales-order-o";

  /**
   * 搜索内容 - 点击
   * @param item
   */
  clickOnSearch(item: H3.Input.searchGroup) {
    this.searchSelected = item.value;
    this.$emit("change-source", item.value);
  }
  /**
   * 点击数据源节点
   * @param treeNode
   */
  nodeClick(treeNode: H3.Tree.TreeNode) {
    if (!treeNode.folder) {
      this.$emit("change-source", treeNode.value);
    }
  }

  /**
   * 生成树结构
   * @param modelList
   * @param objectId 节点
   */
  createTreeList(modelList: Array<H3.Falls.SourceModel>, objectId?: string | null) {
    let treeArr: Array<any> = [];
    modelList.forEach((item: H3.Falls.SourceModel) => {
      let tmpItem: any = {
        key: item.objectId,
        title: item.displayName,
        parent: item.parentObjectId,
        folder: !item.nodeType,
        value: item.schemaCode
      };
      if ((!objectId && !item.parentObjectId) || (objectId && item.parentObjectId === objectId)) {
        if (this.selectSchemaCode === item.schemaCode && item.parentObjectId) {
          this.openKeys = [item.parentObjectId];
          tmpItem.selected = true;
        }
        let tmpChildren = this.createTreeList(modelList, item.objectId);
        if (!((tmpChildren && tmpChildren.length === 0) || item.parentObjectId)) {
          tmpItem.children = tmpChildren;
        }
        treeArr.push(tmpItem);
      }
    });
    return treeArr;
  }

  /**
   * 搜索
   */
  onSearch() {
    this.searchContentList = [];
    if (this.searchValue) {
      this.modelList.forEach((item: H3.Falls.SourceModel, index: number) => {
        if (item.nodeType === 1 && item.displayName.indexOf(this.searchValue) > -1) {
          let container: any = {
            content: "",
            value: item.schemaCode
          };
          const newName = item.displayName;
          const content = `<span class="highlight">${this.searchValue}</span>`;
          const replace = new RegExp(this.searchValue, "g");
          container.content = newName.replace(replace, content);
          this.searchContentList.push(container);
        }
      });
      if (!this.searchContentList.length) {
        let container = { content: "无查询结果！", value: "" };
        this.searchContentList.push(container);
      }
    }
  }

  /**
   * 清空搜索框内容
   */
  empty() {
    this.searchValue = "";
    this.searchContentList = [];
  }
  mounted() {
    this.treeList = this.createTreeList(this.modelList);
    console.log(this.treeList, "this.treeList");
    console.log(this.openKeys, "openKeys===");
  }
}
</script>
<style lang="less">
@import "~@h3/report/basics/styles/index";
@import "~@h3/report/basics/styles/utils";

.h3-report-model-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  &__search {
    position: relative;
    padding-right: 12px;
    margin-bottom: 8px;
    .ant-input-affix-wrapper {
      .ant-input-prefix {
        color: #d8d8d8;
      }
      input {
        min-height: auto;
        &::placeholder {
          font-size: 14px;
          color: #c9ccd8;
          font-weight: 400;
        }
      }
    }
    .empty-search {
      position: absolute;
      top: 0;
      right: 24px;
      cursor: pointer;
      line-height: 32px;
      color: #c9ccd8;
      font-size: 14px;
    }
  }
  /** 搜索内容 **/
  &__search-content {
    padding: 4px 26px 0 25px;
    margin-bottom: 0;
    li {
      font-size: 14px;
      color: #304265;
      font-weight: 400;
      line-height: 32px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      cursor: pointer;

      .empty {
        cursor: default;
      }

      .ellipsis {
        .setEllipsisStyle();
      }
    }
    .selected {
      background-color: #f0f8fe;
    }
    .highlight {
      color: #107ff0;
    }
  }
  &__tree {
    flex: 1;
    .bothway-scrollbar();
    .folder-open-fill,
    .folder-fill,
    .sales-order-o {
      padding-right: 8px;
    }
    .h3-menu-tree-item {
      height: 32px;
      line-height: 32px;
    }
    .h3-menu-tree-item__word {
      white-space: nowrap;
    }
  }
}
</style>
