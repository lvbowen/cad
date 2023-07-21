<template>
  <div class="bimView">
    <!-- <div class="phone_title">通讯录</div> -->
    <a-card class="left_class cardShow">
      <div class="mainTree">
        <nav class="title">
          <!-- <search
            v-model="value"
            placeholder="请输入搜索关键词"
            @search="onSearch"
          /> -->
        </nav>
        <div class="left_tree">
          <a-tree
            selectable
            :defaultCheckedKeys="defaultCheckedKeys"
            :selectedKeys="selectedKeys"
            :key="treeKey"
            :loadData="onLoadData"
            :treeData="treeData"
            :replaceFields="replaceFields"
            @select="onSelect"
            :defaultExpandedKeys="treeExpandData"
          >
            <template slot="title" slot-scope="text">
              <span
                v-if="highLightKeys.indexOf(text.eventKey) > -1"
                style="color: #0bcda3"
              >
                {{ text.taskName }}
              </span>
              <span v-else>{{ text.taskName }}</span>
            </template>
          </a-tree>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
// import axios from "axios";
import { Card, Tree } from "@h3/antd-vue";
import env from "@/config/env";
import { getdepartmenttree } from "../../../../mobile/extends/businessComponent/service/index.js";
import { getProjectConfig } from "../../../../mobile/extends/service/api.ts";
export default {
  data() {
    return {
      BIM_URL: env.apiHost,
      selectedKeys: [],
      defaultCheckedKeys: [],
      treeData: [],
      checkedKeys: [],
      treeExpandData: [],
      appCode: "",
      value: "",
      projectCode: "",
      corpId: "",
      treeKey: 0,
      feature: {},
      modalManageData: {},
      replaceFields: {
        key: "id",
        title: "name",
      },
    };
  },
  components: {
    ACard: Card,
    ATree: Tree,
  },

  mounted() {
    this.projectCode = `${env.project}`;
    getProjectConfig({ path: this.projectCode }).then((res) => {
      this.corpId = res.data.corpId;
      this.initTree();
    });
  },

  methods: {
    mapListener(event) {
      this.feature = event.data.feature;
    },
    onSearch(value) {
      if (value) {
        this.$router.push({
          name: "contacts",
          query: {
            value: value,
            corpId: this.corpId,
          },
        });
      }
    },
    //初始化左侧树
    initTree() {
      this.treeExpandData = [];
      //清空树默认勾选
      this.defaultCheckedKeys = [];
      getdepartmenttree(this.corpId, "").then((res) => {
        //@ts-ignore
        if (res.errcode === 0) {
          let resData = res.data.departmentList;
          for (let i = 0; i < resData.length; i++) {
            if (resData[i].children === undefined || resData[i].leaf) {
              resData[i].isLeaf = true;
            }
            this.$set(resData[i], "key", resData[i].id);
            this.treeExpandData.push(resData[i].id);
            this.defaultCheckedKeys.push(resData[i].id);
          }
          this.treeData = resData;
          this.treeKey += 1;
          this.onCheck(this.defaultCheckedKeys, "start");
        } else {
          this.treeData = [];
        }
      });
    },
    // 树-选择
    async onSelect(selectedKeys, val) {
      this.$router.push({
        name: "contacts",
        query: {
          id: selectedKeys[0],
        },
      });
      //   this.onLoadData(val.node);
      //   if (this.treeExpandData.indexOf(selectedKeys[0]) == -1) {
      //     this.treeExpandData.push(selectedKeys[0]);
      //   } else {
      //     this.treeExpandData.forEach((e, index) => {
      //       if (e == selectedKeys[0]) {
      //         this.treeExpandData.splice(index, 1);
      //       }
      //     });
      //   }
    },
    // 树 异步加载
    onLoadData(treeNode) {
      const _this = this;
      return new Promise((resolve) => {
        if (
          treeNode.dataRef.children != undefined &&
          treeNode.dataRef.children.length > 0
        ) {
          // 有值了直接渲染
          //@ts-ignore
          resolve();
          return;
        }
        getdepartmenttree(this.corpId, treeNode.$vnode.data.key).then((res) => {
          for (let i = 0; i < res.data.departmentList.length; i++) {
            if (res.data.departmentList[i].children == undefined || res.data.departmentList[i].leaf) {
              res.data.departmentList[i].isLeaf = true;
            }
          }
          treeNode.dataRef.children = res.data.departmentList;
          _this.treeData = [..._this.treeData];
        });
        //@ts-ignore
        resolve();
      });
    },
  },
};
</script>

<style lang="less" scoped>
* {
  text-align: left;
}
.bimView {
  height: 100%;
  .left_class {
    border-color: transparent;
    padding: 0.625vw;
    height: 100%;
    .left_tree {
      width: 100%;
      height: 90%;
      padding-left: 15px;
      overflow: auto;
    }
  }
  .phone_title {
    text-align: center;
    height: 45px;
    line-height: 45px;
    background: #2758fd;
    font-family: PingFang SC;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .mainTree {
    width: 100%;
  }
}
</style>

<style lang="less">
.bimView {
  .ant-card-body {
    height: 100%;
    padding: 0 !important;
    padding-bottom: 0.5208vw !important;
    display: flex;
    overflow-x: hidden;
    margin-top: 0.5208vw !important;
  }
  .ant-card-bordered {
    border: none;
  }
  /deep/ .ant-btn > span {
    margin-left: -6px !important;
  }

  /deep/ .ant-select-selection {
    background-color: transparent;
    color: #ffffff;
    border: 1px solid #2252cd;
    width: 250px;
    height: 30px;
  }

  .ant-tree li .ant-tree-node-content-wrapper {
    font-size: 17px;
  }
  .ant-tree li .ant-tree-node-content-wrapper:hover {
    // background-color: #366fb1;
  }
  .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
    // background-color: #366fb1;
  }

  /deep/ .ant-select-selection-selected-value {
    font-size: 16px;
    font-weight: bold;
  }

  //树滚轴-透明
  /deep/ ::-webkit-scrollbar-track {
    border-radius: 0;
    background: transparent;
  }

  /deep/ .ant-select-selection-selected-value {
    font-size: 14px;
  }
  .anticon {
    font-size: 24px !important;
  }
  .van-search {
    width: 100%;
  }
}
</style>
