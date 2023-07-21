<template>
  <div class="apps">
    <!-- 搜索框 -->
    <div style="display: flex; align-items: center; background-color: #fff">
      <search-bar
        class="apps__search"
        :value="wd"
        :onclear="onClear"
        @focus="focusSearch"
        @cancel="cancelSearch"
        @search="search"
        style="width: 330px"
      />
      <img
        :src="projectPng"
        style="width: 25px; height: 25px; display: inline"
        @click="
          () => {
            this.isModalShow = true;
          }
        "
      />
    </div>

    <!-- 主体内容 -->
    <search-panel
      v-if="showSearchPanel"
      v-model="wd"
      @goAppItem="goAppItem"
      :appSearch="true"
      :appList="appList"
      class="apps__main"
    />
    <app-list
      class="apps__main"
      @goAppItem="goAppItem"
      @setAppList="setAppList"
      v-show="!showSearchPanel"
    />
    <Modal
      :visible="isModalShow"
      :maskClosable="true"
      :title="modalTitle"
      @cancel="modalCancel"
      footer=""
    >
      <div style="height: 240px">
        <el-scrollbar style="height: 90%">
          <tree
            v-if="treeData.length"
            :treeData="treeData"
            :defaultSelectedKeys="defaultSelectedKeys"
            :defaultExpandAll="true"
            @select="onSelect"
          />
        </el-scrollbar>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import Scrollbar from "element-ui/lib/scrollbar";
import { Component, InjectReactive, Vue } from "vue-property-decorator";

import common from "@cloudpivot/common/mobile";

const Bus: any = common.utils.Bus;

import SearchPanel from "./search-panel.vue";
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import Tree from "ant-design-vue/lib/tree";
import "ant-design-vue/lib/tree/style/index.css";
import AppList from "./list-panel.vue";
import projectPng from "@cloudpivot/common/src/components/mobile/assets/选项目.png";
import env from "../../../../../../entries/portal/src/config/env";
import axios from "axios";
import * as Type from "../../../../../../entries/portal/extends/type";

@Component({
  name: "apps",
  components: {
    SearchBar: common.components.Searchbar,
    SearchPanel,
    AppList,
    Modal,
    Tree,
    ElScrollbar: Scrollbar,
  },
})
export default class Apps extends Vue {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;


  showSearchPanel: boolean = false;
  projectPng: any = projectPng;

  wd: string = "";

  appList: any = [];

  BIM_URL: string = `${env.apiHost}/`;
  isModalShow: boolean = false;
  modalTitle: string = "项目选择";
  treeData: Array<any> = [];
  defaultSelectedKeys: Array<string> = [];

  modalOk() {}

  modalCancel() {
    this.isModalShow = false;
  }

  onSelect(selectedKeys, selectedNodes) {
    const temptKey = selectedNodes.node.dataRef;
    if (JSON.stringify(temptKey) !== "{}") {
      this.defaultSelectedKeys[0] = temptKey.id;
      this.projectConfig?.updateProjectConfig(temptKey.title, temptKey.value.split("-")[1]=='集团'?0:temptKey.value.split("-")[1]=='公司'?1:2,null);
    }
    this.isModalShow = false;
  }

  created() {
    this.getTreeData();
  }

  getTreeData() {
    this.treeData.length = 0;
    this.defaultSelectedKeys.length = 0;
    axios
      .get(this.BIM_URL + `api/groupView/getProjectTree`, {
        params: {
          appCode: this.projectCode,
        },
      })
      .then((res) => {
        //@ts-ignore
        if (res.errcode === 0) {
          this.treeData = res.data;
          if (this.treeData.length > 0) {
            this.defaultSelectedKeys.push(this.treeData[0].id);
            // window.Environment.level = this.treeData[0].value.split("-")[1];
            // window.Environment.projectName = this.treeData[0].title;
            const temptKey=this.treeData[0];
            this.projectConfig?.updateProjectConfig(temptKey.title, temptKey.value.split("-")[1]=='集团'?0:temptKey.value.split("-")[1]=='公司'?1:2,null);
          }
        }
      });
  }

  setAppList(data: any) {
    if (data && data.length) {
      this.appList = data;
    }
  }

  /**
   * 开始搜索，展示搜索面板
   */
  focusSearch() {
    this.showSearchPanel = true;
    Bus.$emit("toggleNavbar", !this.showSearchPanel);
  }

  /**
   * 取消搜索，隐藏搜索面板
   */
  cancelSearch() {
    this.showSearchPanel = false;
    Bus.$emit("toggleNavbar", !this.showSearchPanel);
  }

  /**
   * 清空搜索框
   */
  onClear() {
    this.wd = "";
  }

  /**
   * 开始搜索
   */
  search(wd: string) {
    this.wd = wd;
  }

  goAppItem(appCode: any) {
    this.$router
      .push({
        name: "app-item",
        params: {
          appCode,
        },
      })
      .catch((err: any) => {
        err;
      });
  }

  beforeDestroy() {
    Bus.$emit("toggleNavbar", true);
  }
}
</script>

<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";

/deep/ .ant-modal {
  max-width: calc(100vw - 24px);
  margin: 16px auto;

  .ant-modal-content {
    border-radius: 15px 15px 15px 15px;
    min-height: 300px;
    max-height: calc(100vw - 240px);
  }

  .ant-modal-header {
    padding: 12px 24px;
    /* color: #50A4FF; */
    background: #50a4ff;
    border-bottom: 1px solid #e8e8e8;
    border-radius: 15px 15px 0 0;
  }

  .ant-modal-title {
    font-size: 24px;
    font-family: Source Han Sans CN;
    font-weight: bold;
    color: #ffffff;
  }

  .anticon svg {
    display: inline-block;
    //margin-bottom:12px;
    font-size: 28px;
    color: #cccccc;
  }
  .ant-tree {
    font-size: 22px;
    font-family: PingFang SC;
    //font-weight: bold;
    color: #333333;
  }
}

.apps {
  display: flex;
  height: inherit;
  flex-direction: column;
  overflow: hidden;

  &__search {
    flex: none;
  }

  &__main {
    flex: 1;
  }
}
</style>
