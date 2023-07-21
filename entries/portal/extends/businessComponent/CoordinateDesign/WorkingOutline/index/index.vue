<template>
  <div class="wrap flex-column flex-space-between">
    <div class="wrap-header flex-space-between">
      <div class="name-state flex">
        <div class="header-name flex">
          <img
            style="cursor: pointer"
            src="../../../../../src/assets/extends/CoordinateDesign/ProductionTaskList/return.png"
            @click="back"
          />
          <p>{{ projectState.engineeringName }}</p>
        </div>
        <div class="now-state" :class="stateImg(projectState.activityName)">
          <span style="color: #fff">{{ projectState.activityName }}</span>
        </div>
      </div>
    </div>
    <div class="wrap-content flex flex-1">
      <div class="left-tree scrollbar-default">
        <div class="tree-title">
          <img src="../../../../../src/assets/extends/coordinate/xmcd.png" alt="" />
          <span>项目菜单</span>
        </div>
        <a-tree
          :treeData="leftTreeData"
          :replaceFields="replaceFields"
          @select="onSelect"
          :expandedKeys="expandedKeys"
          :autoExpandParent="autoExpandParent"
          :defaultSelectedKeys="defaultSelectedKeys"
          @expand="onExpand"
          showIcon
          blockNode
        >
          <template #folder="{ folder, expanded }">
            <!--            <a-icon :type="!expanded?'folder':'folder-open'" theme="filled" style="color:#ffca28"/>-->
            <img src="../../../../../src/assets/extends/coordinate/组44拷贝3.png" alt="" />
          </template>
          <template #file>
            <a-icon type="file-text" />
          </template>
          <template #title="r">
            <span>{{ r.title }}</span>
            <span v-if="r.routerName === 'empty'" class="developing">开发中</span>
          </template>
        </a-tree>
      </div>
      <div
        class="right-components"
        :class="treeItemType === 'file' ? 'active-components' : isShowCenterFiles ? 'files' : ''"
        style="padding: 10px"
      >
        <router-view :wProjectName="projectState.engineeringName" @updateNodeState="init" />
        <CenterFiles v-if="isShowCenterFiles" :projectId="projectId" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, InjectReactive, Watch, Prop } from "vue-property-decorator";
import { Tree, Icon } from "@h3/antd-vue";
import Utils from "../../../../utils";
import * as Type from "../../../../type";
import { queryProjectNodeInfo } from "../../../../service/api";
import CenterFiles from "./CenterFiles.vue";
@Component({
  name: "index",
  components: {
    ATree: Tree,
    [Icon.name]: Icon,
    CenterFiles,
  },
})
export default class index extends Vue {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;
  @Prop({ required: true }) projectId!: string;
  @Prop({ required: false, type: Boolean, default: false }) isBack!: boolean;

  replaceFields = {
    key: "key",
    title: "title",
    children: "children",
  };
  leftTreeData: Array<any> = [
    {
      title: "生产任务单",
      key: "0-0",
      scopedSlots: { icon: "folder" },
      type: "route",
      routerName: "ProductionTaskList",
      children: [],
    },
    {
      title: "项目运行",
      key: "0-1",
      scopedSlots: { icon: "folder" },
      type: "route",
      routerName: "",
      code: "",
      children: [
        {
          title: "项目成员",
          key: "0-1-1",
          scopedSlots: { icon: "file" },
          type: "BizModel",
          routerName: "ApplicationList",
          objectId: "",
          code: "XTSJ_xmcy",
        },
        {
          title: "前期资料",
          key: "0-1-2",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "PreviousApprovalData",
          objectId: "",
          code: "",
        },
        {
          title: "项目策划",
          key: "0-1-3",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "ProjectPlanning",
          objectId: "",
          children: [],
          code: "",
        },
        {
          title: "专业任务",
          key: "0-1-4",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "ProfessionalTask",
          objectId: "",
          code: "",
        },
        {
          title: "设计任务",
          key: "0-1-5",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "DesignTask",
          objectId: "",
          code: "",
        },
        {
          title: "中间资料",
          key: "0-1-6",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "IntermediateData",
          objectId: "5ab1c924cda744c3a1a4f89b23255017",
          code: "",
        },
        {
          title: "设计成果",
          key: "0-1-7",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "DesignAchievement",
          objectId: "",
          code: "",
        },
        {
          title: "出版管理",
          key: "0-1-8",
          scopedSlots: { icon: "file", title: "title" },
          type: "route",
          routerName: "empty",
        },
        {
          title: "外来资料",
          key: "0-1-9",
          scopedSlots: { icon: "file" },
          type: "BizModel",
          routerName: "ApplicationList",
          objectId: "",
          code: "XTSJ_wlzl",
        },
        {
          title: "项目进度",
          key: "0-1-10",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "ProjectSchedule",
          objectId: "",
          code: "",
        },
        {
          title: "竣工图",
          key: "0-1-11",
          scopedSlots: { icon: "file", title: "title" },
          type: "route",
          routerName: "empty",
        },
        {
          title: "批复验收",
          key: "0-1-12",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "LaterApprovalData",
          objectId: "",
          code: "",
        },
      ],
    },
    {
      title: "项目评审",
      key: "0-2",
      scopedSlots: { icon: "folder" },
      type: "route",
      routerName: "DesignReview",
      children: [
        {
          title: "设计评审",
          key: "0-2-1",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "DesignReview",
          objectId: "",
          code: "",
        },
        {
          title: "技术方案",
          key: "0-2-2",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "TechnicalProtocols",
          objectId: "",
          code: "",
        },
      ]
    },
    {
      title: "创新创优",
      key: "0-3",
      scopedSlots: { icon: "folder", title: "title" },
      type: "route",
      routerName: "empty",
      children: [
        {
          title: "策划",
          key: "0-3-1",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "empty",
        },
        {
          title: "申报",
          key: "0-3-2",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "empty",
        },
      ],
    },
    // {
    //   title: "修改通知单",
    //   key: "0-2",
    //   scopedSlots: { icon: "folder" },
    //   type: "BizModel",
    //   routerName: "ApplicationList",
    //   code: "XTSJ_xgtzd",
    //   children: [],
    // },
    {
      title: "往来文件",
      key: "0-4",
      scopedSlots: { icon: "folder" },
      type: "BizModel",
      routerName: "ApplicationList",
      code: "XTSJ_wlwj",
      children: [],
    },
    {
      title: "存档管理",
      key: "0-5",
      scopedSlots: { icon: "folder", title: "title" },
      type: "route",
      routerName: "empty",
      children: [],
    },
    {
      title: "设计服务文件",
      key: "0-6",
      scopedSlots: { icon: "folder", title: "title" },
      type: "BizModel",
      routerName: "ApplicationList",
      code: 'XTSJ_design_service',
      children: [
        {
          title: "施工期技术服务文件",
          key: "0-6-1",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "empty",
        },
        {
          title: "技术接口文件",
          key: "0-6-2",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "empty",
        },
        {
          title: "规建申报文件",
          key: "0-6-3",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "empty",
        },
        {
          title: "设计代表现场服务",
          key: "0-6-4",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "empty",
        },
        {
          title: "设计修改及设计变更",
          key: "0-6-5",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "empty",
        },
        {
          title: "为报批编制的专项报告",
          key: "0-6-6",
          scopedSlots: { icon: "file" },
          type: "route",
          routerName: "empty",
        },
      ],
    },
    {
      title: "质量检查",
      key: "0-7",
      scopedSlots: { icon: "folder", title: "title" },
      type: "route",
      routerName: "empty",
    },
  ];
  expandedKeys: Array<string> = ['0-1'];
  defaultSelectedKeys: Array<string> = [];
  autoExpandParent: boolean = true;
  treeItemType: string = "";

  projectState: any = {};

  onSelect(selectedKeys: Array<string>, e) {
    if (selectedKeys.includes("0-1-1")) {
      this.isShowCenterFiles = true;
    } else {
      this.isShowCenterFiles = false;
    }
    const items = e.node.dataRef;
    this.treeItemType = items.type;
    if (this.treeItemType === "route") {
      this.showRight(items.routerName, this.goRoute(items));
    } else if (this.treeItemType === "BizModel") {
      this.showRight(items.code, this.goBizModel(items));
    } else if (this.treeItemType === "YunShu") {
      this.showRight(items.objectId, this.goformDetail(items));
    }
  }
  //中心文件夹
  isShowCenterFiles: boolean = false;
  //左侧树的展开事件
  onExpand(expandedKeys) {
    this.expandedKeys = expandedKeys;
    this.autoExpandParent = false;
  }
  getTreeItemType(data) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item.routerName === this.$route.name) {
        if (item.type === "route") {
          this.treeItemType = item.type;
          this.defaultSelectedKeys.push(item.key);
          break;
        } else if (item.type === "BizModel") {
          if (item.code === this.$route.params.schemaCode) {
            this.treeItemType = item.type;
            this.defaultSelectedKeys.push(item.key);
            break;
          }
        }
      } else if (item.type === "YunShu") {
        if (item.objectId === this.$route.query.objectId) {
          this.treeItemType = item.type;
          this.defaultSelectedKeys.push(item.key);
          break;
        }
      } else {
        this.treeItemType = "history";
        if (this.$route.name === "WorkingOutline") return this.empty();
      }
      if (item.children) {
        this.getTreeItemType(item.children);
      }
    }
  }

  showRight(str, fun) {
    if (str === "") {
      this.$message.error("暂无相关页面");
      this.empty();
    } else {
      fun;
    }
  }

  empty() {
    this.$router
      .push({
        name: "empty",
        query: {
          projectId: this.projectId,
        },
      })
      .catch((err: any) => {
        err;
      });
  }

  goRoute(item) {
    this.$router
      .push({
        name: item.routerName,
        query: {
          projectId: this.projectId
        },
      })
      .catch((err: any) => {
        err;
      });
  }
  goBizModel(item) {
    this.$router
      .push({
        name: item.routerName,
        params: {
          appCode: this.projectCode ?? "",
          schemaCode: item.code,
        },
        query: {
          parentId: "",
          code: item.code,
          projectId: this.projectId,
          treeItemType: "BizModel",
          addScrwdId: this.projectId,
        },
      })
      .catch((err: any) => {
        err;
      });
  }
  goformDetail(item) {
    this.$router
      .push({
        name: "formDetail",
        query: {
          sheetCode: this.projectCode + "_xmsqb",
          objectId: item.objectId,
          schemaCode: this.projectCode + "_xmsqb",
          projectName: this.projectConfig?.projectName,
          projectId: this.projectId,
        },
      })
      .catch((err: any) => {
        err;
      });
  }

  async init() {
    try {
      const { errcode, errmsg, data } = await queryProjectNodeInfo({
        appCode: this.projectCode ?? "",
        projectId: this.projectId,
      });
      if (errcode !== 0) return this.$message.error(errmsg as string);
      this.projectState = data;
    } catch (error) {
      error;
    }
  }
  stateImg(val) {
    let img = "";
    switch (val) {
      case "项目运行":
        img = "runPic";
        break;
      case "项目终止":
        img = "terminatedPic";
        break;
      case "项目暂停":
        img = "pausePic";
        break;
      case "归档":
        img = "archivePic";
        break;
    }
    return img;
  }

  back() {
    // this.$store.commit("setMenuFlag", true);
    if (!this.isBack) {
      this.$router.push({
        name: "ProjectList",
      });
    } else {
      this.$router.back();
    }
    // this.$router.push({name:'ProjectList'}).catch((err: any) => {
    //   err;
    // });
  }

  created() {
    // this.$store.commit("setMenuFlag", false);
  }

  mounted() {
    console.log(window.config, "window");
    // Utils.deepFind(
    //   this.leftTreeData,
    //   (item) => {
    //     if (item.children && item.children.length > 0 && item.routerName!=='empty') {
    //       this.expandedKeys.push(item.key);
    //     }
    //     return false;
    //   },
    //   "children"
    // );
    //@ts-ignore
    if (this.$router.history.current.name === "formDetail") {
      this.treeItemType = "file";
    }
    if (this.$route.path.indexOf("XTSJ_xmcy") > -1) {
      this.isShowCenterFiles = true;
    }
    this.getTreeItemType(this.leftTreeData);
    this.init();
  }
}
</script>
<style lang="less" scoped>
@import "../../../../styles/public.module.less";
@import "../index/index.less";
@import "../ProductionTaskList/components/DataForm/index.less";
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.wrap {
  width: 100%;
  height: 100%;
  padding: 0 4.6875vw;
  font-family: Microsoft YaHei;
  // background-color:#fff;
  .wrap-header {
    width: 100%;
    // height: 5%;
    height: 50px;
    padding: 8px 0;
    color: #fff;
    background-color: #004898;
    .header-name {
      img {
        width: 1.302vw;
        height: 2.315vh;
        margin-right: 10px;
      }
      p {
        font-size: 16px;
        font-weight: bold;
      }
    }
    .fgx {
      height: 30px;
      padding: 0 15px;
    }
    .now-state {
      position: relative;
      margin-left: 15px;
      background-color: #ff6c00;
      padding: 0 5px;
      border-radius: 2px;
      &::before {
        position: absolute;
        left: -6px;
        top: 50%;
        transform: translateY(-50%);
        content: "";
        width: 0;
        height: 0;
        border-top: 3px solid transparent;
        border-right: 6px solid #ff6c00;
        border-bottom: 3px solid transparent;
      }
    }
    .review-people {
      color: #7990bb;
    }
  }
  .wrap-content {
    width: 100%;
    flex: 1;
    .left-tree {
      width: auto;
      height: 100%;
      background: #fff;
      padding: 10px;
      border-right: 1px solid #f1f5f9;
      overflow: auto;
      img {
        width: 1.042vw;
        height: 1.852vh;
        margin-right: 10px;
      }
      .tree-title {
        font-size: 16px;
        font-weight: bold;
      }
      .developing {
        background-color: #e79d08;
        color: white;
        font-size: 10px;
        font-weight: bold;
        border-radius: 5px;
        padding: 1px;
        margin-left: 1/3 * @spacing-base;
      }
    }
    .right-components {
      //width: calc(~"100% - 14%");
      width: auto;
      overflow: auto;
      padding-right: 1%;
      .scrollbar-default;
      flex: 1;
      background: #fff;
    }
    .files {
      .flex;
      .flex-column;
      .app-menu {
        height: 65%;
        /deep/ .application-box {
          .flex;
          .flex-column;
          .full-height;
          .table-box {
            .full-height;
            min-height: 0;
          }
        }
        /deep/ .ant-card-body {
          .flex;
          .flex-column;
          .spinContainer,
          .ant-spin-container,
          .custom-template-container {
            .full-height !important;
          }
        }
      }
    }
    .active-components {
      padding-right: 0;
      padding-top: 3%;
      background: #fff;
      flex: 1;
    }
  }
  .runPic {
    background-color: #ff6c00 !important;
    &::before {
      border-right-color: #ff6c00 !important;
    }
  }
  .terminatedPic {
    background-color: #232222 !important;
    &::before {
      border-right-color: #232222 !important;
    }
  }
  .pausePic {
    background-color: #dd1515 !important;
    &::before {
      border-right-color: #dd1515 !important;
    }
  }
  .archivePic {
    background-color: #00bf31 !important;
    &::before {
      border-right-color: #00bf31 !important;
    }
  }
}
</style>
<style scoped lang="less">
/deep/.ant-tree li span.ant-tree-switcher.ant-tree-switcher_open .ant-tree-switcher-icon {
  font-size: 24px;
}
/deep/.ant-tree li span.ant-tree-switcher.ant-tree-switcher_close .ant-tree-switcher-icon {
  font-size: 24px;
}

/deep/.application-box .content-top {
  margin-bottom: 10px !important;
}
/deep/.load-fail-box {
  padding-top: 0px !important;
}
/deep/.custom-template-container {
  height: calc(100vh - 220px) !important;
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #99a9bf;
  }
  &::-webkit-scrollbar-track {
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track-piece {
    background: transparent;
    border-radius: 10px;
  }
}
</style>
