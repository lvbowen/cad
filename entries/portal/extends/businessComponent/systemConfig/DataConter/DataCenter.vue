<template>
  <div class="data-center full-height">
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0" />
      </template>
      <a-collapse-panel key="1" header="数据中心" class="custom-style full-height flex-column">
        <div class="bts flex">
          <a-button
            type="primary"
            :disabled="!(curSelectedTreeNode && curSelectedTreeNode.flag)"
            v-show="!(curSelectedTreeNode && !curSelectedTreeNode.flag && editingKey === '')"
            @click="openPro"
          >新增项目组
          </a-button>
          <a-button
            type="primary"
            v-show="curSelectedTreeNode && !curSelectedTreeNode.flag && editingKey === ''"
            @click="openPro1"
          >新增项目
          </a-button>

          <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteProGroup()">
            <a-button
              :disabled="!(curSelectedTreeNode && !curSelectedTreeNode.flag)"
            >删除</a-button
            >
          </a-popconfirm>
        </div>
        <div class="flex inner">
          <a-card class="left full-height">
            <div class="_title">项目组</div>
            <a-tree
              :treeData="treeData"
              :replaceFields="replaceFields"
              :defaultExpandAll="true"
              @select="selectTreeNode"
              :key="treeKey"
            >
              <template slot="custom" slot-scope="selected">
                <div>
                  <Tag
                    closable
                    @close="tag(item, selected)"
                    v-for="(item, index) in selected.names"
                    :key="index"
                  >{{ item }}</Tag
                  >
                </div>
              </template>
            </a-tree>
          </a-card>
          <a-card class="right full-height">
            <ref-menu :selectedKeys="selectedKeys"/>
          </a-card>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <a-modal
      :visible="visiblePro"
      title="项目架构"
      @cancel="handleCancelPro"
      @ok="okPro"
      v-show="!(curSelectedTreeNode && !curSelectedTreeNode.flag && editingKey === '')"
    >
      <a-table
        :data-source="tableProList"
        :columns="proListColumns"
        :rowSelection="proRowSelection"
        :key="proTableKey"
        :pagination="false"
        :expandIconColumnIndex="-1"
      >
      </a-table>
    </a-modal>

    <a-modal
      :visible="visiblePro"
      title="项目架构"
      @cancel="handleCancelPro"
      @ok="okPro1"
      v-show="curSelectedTreeNode && !curSelectedTreeNode.flag && editingKey === ''"
    >
      <a-table
        :data-source="tableProList"
        :columns="proListColumns"
        :rowSelection="proRowSelection"
        :key="proTableKey"
        :pagination="false"
        :expandIconColumnIndex="-1"
      >
      </a-table>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, InjectReactive } from "vue-property-decorator";
import Collapse from "ant-design-vue/lib/collapse";
import "ant-design-vue/lib/collapse/style/index.css";
import Icon from "ant-design-vue/lib/icon";
import "ant-design-vue/lib/icon/style/index.css";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import Popconfirm from "ant-design-vue/lib/popconfirm";
import "ant-design-vue/lib/popconfirm/style/index";
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import Tree from "ant-design-vue/lib/tree";
import "ant-design-vue/lib/tree/style/index.css";
import Card from "ant-design-vue/lib/card";
import "ant-design-vue/lib/card/style/index.css";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.css";

import Dropdown from "ant-design-vue/lib/dropdown";
import "ant-design-vue/lib/dropdown/style/index.css";
import Menu from "ant-design-vue/lib/menu";
import { DataCenterPro, CenterPro, Rdp, CenterMenu, Routes, IconDataType } from "../type";
import "ant-design-vue/lib/menu/style/index.css";
import mockData from "./mockData";
import Tag from "ant-design-vue/lib/tag";
import "ant-design-vue/lib/tag/style/index.css";
import {
  addRefProject,
  getDataCenterGroups,
  getDataCenterProList,
  addProGroup,
  deleteProGroup,
  getRdpList,
  deleteRdp,
  updateRdp,
  getMenuTree,
  updateMenuTree,
  deleteMenu,
  getReportList,
  getRouteList,
  getIcons,
  addIcon,
  addPro,
  delPro,
} from "../../../service/api";
import Utils from "../../../utils";
import RefMenu from "./RefMenu.vue";

@Component({
  name: "DataCenter",
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AIcon: Icon,
    AButton: Button,
    APopconfirm: Popconfirm,
    AModal: Modal,
    ATree: Tree,
    ACard: Card,
    ATable: Table,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    Tag,
    RefMenu
  },
})
export default class DataCenter extends Vue {
  @InjectReactive("project") projectCode!: string;
  activeKey: string[] = ["1"];
  //tree
  treeData: DataCenterPro[] = [];
  replaceFields: { [propsName: string]: string } = {
    children: "childrens",
    title: "names",
    key: "id",
  };
  curSelectedTreeNode: DataCenterPro | null = null;
  treeKey: number = 1;
  //modal
  visible: boolean = false;
  addGroupName: string = "";
  //Pro-modal
  visiblePro: boolean = false;
  tableProList: CenterPro[] = [];
  proListColumns: any[] = [
    {
      title: "项目名称",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
  ];
  proRowSelection: any = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.record(selectedRows);
    },
  };
  proSeletedIds: Array<any> = [];
  proTableKey: number = 1;

  editingKey: string = ''; //待删除

  //icon-group


  selectedKeys: any = "";
  projectName: string = "";
  nameArray: Array<any> = [];
  init() {
    getDataCenterGroups({ appCode: this.projectCode ?? "" }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        let tree: DataCenterPro[] = [
          {
            id: this.rndNum(4),
            names: "项目级",
            type: "pro",
            flag: true,
            childrens: [],
          },
        ];

        //tree结构
        if (res.data.defaultType === "multi") {
          tree.splice(
            0,
            0,
            {
              id: this.rndNum(4),
              names: "集团级",
              type: "group",
              childrens: [],
              flag: true,
            },
            {
              id: this.rndNum(4),
              names: "公司级",
              type: "company",
              childrens: [],
              flag: true,
            }
          );
          !res.data.groups ? "" : (tree[0].childrens = [...res.data.groups]);
          !res.data.companys ? "" : (tree[1].childrens = [...res.data.companys]);
          !res.data.projects ? "" : (tree[2].childrens = [...res.data.projects]);
        } else {
          !res.data.projects ? "" : (tree[0].childrens = [...res.data.projects]);
        }

        this.disableTreeArrFilter(tree, "childrens", "names");
        this.treeData = [...tree];
        for (let i = 0; i < this.treeData.length; i++) {
          // @ts-ignore
          for (let j = 0; j < this.treeData[i].childrens.length; j++) {
            // @ts-ignore
            this.treeData[i].childrens[j].scopedSlots = { title: "custom" };
          }
        }

        this.treeKey++;
      }
    });
  }

  rndNum(n) {
    let rnd = "";
    for (let i = 0; i < n; i++) rnd += Math.floor(Math.random() * 10);
    return rnd;
  }

  disableTreeArrFilter(arr, attChildren = "children", key: string) {
    arr.map((item) => {
      if (Array.isArray(item[key])) {
        let keyArr:Array<any> = [];
        item[key].map((i) => {
          keyArr.push(i as any);
        });
      }
      if (item[attChildren] && item[attChildren].length) {
        this.disableTreeArrFilter(item[attChildren], attChildren, key);
      }
    });
  }

  selectTreeNode(selectedKeys, e) {
    this.selectedKeys = e.node.dataRef.id;
    selectedKeys.includes(e.node.dataRef.id)
      ? (this.curSelectedTreeNode = e.node.dataRef)
      : (this.curSelectedTreeNode = null);
  }

  //pro
  openPro() {
    this.visiblePro = true;
    this.getProList();
  }
  openPro1() {
    this.visiblePro = true;
    this.getProList1();
  }

  getProList() {
    this.tableProList = [];
    getDataCenterProList({
      appCode: this.projectCode ?? "",
      type: this.curSelectedTreeNode?.type ?? "",
    }).then((res) => {
      console.log("res", res);
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.tableProList = res.data;
        this.proTableKey++;
      }
    });
  }

  getProList1() {
    this.tableProList = [];
    getDataCenterProList({
      appCode: this.projectCode ?? "",
      type: this.curSelectedTreeNode?.type ?? "",
    }).then((res) => {
      console.log("res", res);
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        for (let i = 0; i < this.treeData.length; i++) {
          // @ts-ignore
          for (let j = 0; j < this.treeData[i].childrens.length; j++) {
            // @ts-ignore
            if (this.selectedKeys === this.treeData[i].childrens[j].id) {
              // @ts-ignore
              for (let k = 0; k < res.data.length; k++) {
                let falg = false;
                // @ts-ignore
                for (let l = 0; l < this.treeData[i].childrens[j].names.length; l++) {
                  // @ts-ignore
                  if (this.treeData[i]?.childrens[j].names[l] == res.data[k].name) {
                    falg = true;
                  }
                }
                if (!falg) {
                  this.tableProList.push(res.data[k]);
                }
              }
            }
          }
        }
        this.proTableKey++;
      }
    });
  }

  record(selectedRows) {
    this.proSeletedIds = selectedRows.map((i) => {
      return i.id;
    });
    this.projectName = selectedRows.map((i) => {
      return i.name;
    });
  }

  handleCancelPro() {
    this.visiblePro = false;
  }

  okPro() {
    if (!this.proSeletedIds.length) {
      return this.$message.warning("至少选择一项！");
    }
    addProGroup({
      appCode: this.projectCode ?? "",
      projectIds: this.proSeletedIds,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("新增成功！");
      this.visiblePro = false;
      this.init(); //刷新分组
      this.curSelectedTreeNode = null;
    });
  }
  okPro1() {
    //新增项目
    console.log("this.proSeletedIds", this.proSeletedIds);
    console.log("this.projectName", this.projectName);
    console.log("this.selectedKeys", this.selectedKeys);

    if (!this.proSeletedIds.length) {
      return this.$message.warning("至少选择一项！");
    }
    addPro({
      appCode: this.projectCode ?? "",
      projectIds: this.proSeletedIds,
      id: this.selectedKeys,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("新增成功！");
      this.visiblePro = false;
      this.init(); //刷新分组
      this.curSelectedTreeNode = null;
    });
  }
  tag(item, selected) {
    //删除项目
    console.log("tag", item, selected.eventKey);
    delPro({
      appCode: this.projectCode ?? "",
      projectName: item,
      id: selected.eventKey,
    }).then((res) => {
      this.$message.success("删除成功！");
      this.init(); //刷新分组
    });
  }

  deleteProGroup() {
    deleteProGroup({
      appCode: this.projectCode ?? "",
      id: this.curSelectedTreeNode?.id ?? "",
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("删除成功！");
      this.init();
      this.curSelectedTreeNode = null;
    });
  }

  treeFilter(arr: any[] = [], attChildren = "children", key, value) {
    let finalArr = [];
    arr.map((item) => {
      if (item[key] === value) {
        //@ts-ignore
        finalArr.push(item);
      }
      if (item[attChildren]) {
        const p = this.treeFilter(item[attChildren], attChildren, key, value);
        finalArr = finalArr.concat(p);
      }
    });
    return finalArr;
  }

  treeArrFilter(arr: any[] = [], attChildren = "children") {
    arr.map((item) => {
      this.$set(item, "scopedSlots", { icon: "custom" });
      if (item[attChildren]) {
        this.treeArrFilter(item[attChildren], attChildren);
      }
    });
  }
  onContextMenuClick(treeKey, menuKey) {
    console.log(`treeKey: ${treeKey}, menuKey: ${menuKey}`);
  }

  mounted() {
    this.init();
  }
}
</script>

<style scoped lang="less">
@import "../../../styles/public.module.less";
@import "../system.module.less";

.data-center {
  .bts {
    /deep/ .ant-btn {
      margin-right: @spacing-base;
    }
  }

  .inner {
    height: calc(100% - 48px);

    .left {
      width: calc(30% - @spacing-large);
      margin-right: @spacing-large;
      overflow: auto;
    }

    .right {
      width: 70%;
      //overflow: auto;

      /deep/ .ant-btn {
        width: fit-content;
        margin-right: @spacing-base;
      }

      .edit-span {
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        min-height: 30px;
        padding-left: @spacing-base;
        transition: all 0.3s;

        &:hover {
          border-color: #0e7fe1;
        }
      }
      //
      /deep/ .ant-card-body {
        overflow: hidden;
        display: flex;
        .full-height;
      }
    }
  }
}

.icon-img {
  width: 18px;
  height: 18px;
  background: #9cc1ec;
}

.menu {
  /deep/ .ant-modal-body {
    height: 400px;
    overflow: auto;
  }
}

/deep/ .ant-collapse {
  height: 100%;

  .ant-collapse-content {
    flex: 1;
  }

  .ant-collapse-content-box {
    height: calc(100% - 8px);
  }
}
</style>
