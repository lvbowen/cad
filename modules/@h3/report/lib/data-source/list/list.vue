<template>
  <div :class="prefixCls">
    <div :class="[`${comPrefixCls}__left-header`]">
      <label>数据流</label>
      <div>
        <a-dropdown placement="bottomCenter">
          <i class="h3yun_All plus-o"/>
          <a-menu slot="overlay">
            <a-menu-item @click="addGroup">新增分组</a-menu-item>
            <a-menu-item @click="addDataSource">新增数据流</a-menu-item>
          </a-menu>
        </a-dropdown>
        <a-dropdown placement="bottomRight">
          <i class="h3yun_All ellipsis-o"/>
          <a-menu slot="overlay">
            <a-menu-item @click="moveDataSource">批量移动</a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
    <h3-loading v-if="loading"/>
    <div
      v-else
      ref="list"
      :class="[`${comPrefixCls}__list`]"
    >
      <h3-tree
        :treeList="treeList"
        :tile="true"
        :dragging="true"
        :accord="false"
        :disabled="disabled"
        :keyMappings="mappings"
        :allowNodeDrag="allowNodeDrag"
        @node-click="nodeClick"
        @tree-drag-change="treeChange"
      >
        <template v-slot:node="{ treeNode, nodeIcon }">
          <template v-if="!treeNode.rename">
            <i v-if="nodeIcon" :class="nodeIcon"/>
            <div :class="`h3-menu-tree-item__word`" :data-key="treeNode[mappings.key]">
              {{ treeNode[mappings.title] }}
            </div>
            <a-dropdown placement="bottomRight" :trigger="['click']">
              <i class="h3yun_All setting" @click="returnClick"/>
              <a-menu slot="overlay" @click="nodeOptions($event, treeNode)">
                <a-menu-item v-for="(title, key) in nodeMenu(treeNode.folder)" :key="key">{{
                  title
                }}</a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
          <a-input
            v-else
            @click="returnClick"
            ref="rename"
            v-model="treeNode[mappings.title]"
            @blur="renameEnd(treeNode)"
          />
        </template>
      </h3-tree>
    </div>
    <batchMoveModal
      v-if="showBatchMoveModal"
      v-model="showBatchMoveModal"
      :treeList="treeList"
      :list="list"
      @change="loadDataSourceList"
    ></batchMoveModal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Dropdown, Input, Menu, Modal } from "@h3/antd-vue";
import H3Tree from "@h3/report/basics/components/tree";
import H3Loading from "@h3/report/basics/components/loading";
import { dataSourceApi } from "@h3/report/basics/service/data-source";
import BatchMoveModal from "./modal/move.vue";
import { getCursortPosition, setCaretPosition, setInputPosition } from "@h3/report/basics/utils/global";

@Component({
  name: "h3-data-source-left",
  components: {
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AInput: Input,
    H3Tree,
    H3Loading,
    BatchMoveModal
  }
})
export default class DataSourceLeft extends Vue {
  @Prop() comPrefixCls!: string;
  @Prop() initActiveNodeId!: string;

  list: Array<H3.DataSourceAPI.DataSourceNode> = [];

  loading = false;
  // 获取高级数据源列表
  prefixCls: string = `${this.comPrefixCls}__left`;

  mappings = { title: "displayName", key: "objectId", parent: "parentObjectId" };

  showBatchMoveModal: boolean = false;

  lastText: string = ""; // 防止重命名重名
  moveNode: H3.DataSourceAPI.DataSourceNode | null = null;
  moveObjectIds: Array<string> = [];
  moveGroupIds: Array<string> = [];
  disabled: Boolean = false;

  @Watch("initActiveNodeId")
  changeActiveNodeId(id) {
    this.changeInitActiveId();
  }

  get rootObjectId() {
    const node = this.list.find((oNode: H3.DataSourceAPI.DataSourceNode) => !oNode.parentObjectId);
    return node ? node.objectId : "";
  }

  /**
   * 数据源列表
   */
  get treeList() {
    const list: Array<H3.DataSourceAPI.DataSourceNode> = [];
    if (this.list && this.list.length) {
      this.list.sort((itemA, itemB) => {
        return itemA.sort - itemB.sort;
      });
      let nNode: any;
      this.list.forEach((oNode: H3.DataSourceAPI.DataSourceNode) => {
        if (oNode.objectId !== this.rootObjectId) {
          nNode = {};
          if (oNode.parentObjectId == this.rootObjectId) {
            nNode.parentObjectId = null;
          }
          nNode.folder = !oNode.nodeType;
          if (this.initActiveNodeId && this.initActiveNodeId === oNode.objectId) {
            nNode.selected = true;
          }
          list.push(Object.assign({}, oNode, nNode));
        }
      });
    }
    return list;
  }

  createTreeList(list) {}
  /**
   * 分组列表
   */
  get groupList() {
    return this.treeList.filter((oNode: H3.DataSourceAPI.DataSourceNode) => !oNode.nodeType);
  }
  /**
   * 节点点击事件
   * @param node
   */
  nodeClick(node: H3.DataSourceAPI.DataSourceNode) {
    this.$emit("change", node);
  }
  /**
   * 移动高级数据源
   */
  moveDataSource() {
    this.$emit("change", null);
    this.showBatchMoveModal = true;
  }
  /**
   * 阻止i点击的默认行为
   */
  returnClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }
  /**
   * 节点预拖拽 判断时否能够拖拽in的函数 返回false时，不可拖进
   */
  allowNodeDrag(evt) {}
  /**
   * 节点排序发成改变时回调
   */
  async treeChange(res: {
    list: Array<H3.DataSourceAPI.DataSourceNode>;
    moveNode: H3.DataSourceAPI.DataSourceNode;
    to: string;
    from: string;
  }) {
    let moveGroupIds: Array<string> = [];
    let moveObjectIds: Array<string> = [];
    let sortModels: Array<{ objectId: string; sort: number; type: number }> = [];
    res.moveNode.nodeType === 0
      ? moveGroupIds.push(res.moveNode.objectId)
      : moveObjectIds.push(res.moveNode.objectId);
    if (res.to !== res.from) {
      let obj = {
        groupObjectIds: moveGroupIds,
        nodeObjectIds: moveObjectIds,
        parentObjectId: res.to ? res.to : this.rootObjectId
      };
      await dataSourceApi.moveDataSourceNode(obj).then(result => {
        if (result) {
          let tmpIndex = this.list.findIndex((node: H3.DataSourceAPI.DataSourceNode) => {
            return node.objectId === res.moveNode.objectId;
          });
          this.list[tmpIndex].parentObjectId = res.to ? res.to : this.rootObjectId;
        }
      });
    }
    const findList = (list, id) => {
      if (!id) {
        sortModels = list.map((node, number) => {
          return { objectId: node.objectId, sort: number, type: node.nodeType };
        });
        return;
      }
      list.forEach((item: H3.DataSourceAPI.DataSourceNode, index) => {
        if ((item as any).children && (item as any).children.length) {
          if (item.objectId === id) {
            sortModels = (item as any).children.map((node, number) => {
              return { objectId: node.objectId, sort: number, type: node.nodeType };
            });
          }
          findList((item as any).children, id);
        }
      });
    };
    findList(res.list, res.to); // 排序参数
    await dataSourceApi.updateDataSourceNodeSort(sortModels).then(result => {
      if (result) {
        this.list.forEach((node: H3.DataSourceAPI.DataSourceNode, index: number) => {
          sortModels.forEach(item => {
            if (node.objectId === item.objectId) {
              this.list[index].sort = item.sort;
            }
          });
        });
      }
    });
  }

  /**
   * 新增数据流
   */
  addDataSource() {
    this.$emit("add-data-source");
  }
  async addGroup() {
    let sortNumber: number = 0;
    this.treeList.forEach(item => {
      sortNumber = Math.max(item.sort, sortNumber);
    });
    sortNumber += 1;
    const node: H3.DataSourceAPI.DataSourceNode = {
      displayName: "未命名分组",
      objectId: "",
      parentObjectId: this.rootObjectId,
      nodeType: 0,
      sort: sortNumber,
      children: null
    };
    node.objectId = await dataSourceApi.addDataSourceGroup(node);
    this.list.push(node);
    this.$nextTick(() => {
      const list = this.$refs.list as HTMLDivElement;
      list.scrollTo(0, list.scrollHeight);
      this.rename(node);
    });
  }
  /**
   * 节点菜单
   * @param folder
   */
  nodeMenu(folder: boolean) {
    let menu;
    if (folder) {
      menu = {
        rename: "重命名",
        remove: "删除"
      };
    } else {
      menu = {
        rename: "重命名",
        edit: "编辑",
        remove: "删除"
      };
    }
    return menu;
  }
  /**
   * 重命名
   * @param treeNode
   */
  rename(treeNode: H3.DataSourceAPI.DataSourceNode) {
    this.lastText = treeNode.displayName;
    this.$set(treeNode, "rename", true);
    this.$nextTick(() => {
      let element = (this.$refs.rename as Vue).$el as HTMLInputElement;
      setInputPosition(element, element.value.length);
      this.disabled = true;
    });
    this.$emit("change", null);
  }
  /**
   * 重命名结束
   * @param treeNode
   */
  renameEnd(treeNode: H3.DataSourceAPI.DataSourceNode) {
    if (treeNode.displayName !== this.lastText) {
      dataSourceApi.updateDataSourceName({
        name: treeNode.displayName,
        objectId: treeNode.objectId,
        type: treeNode.nodeType
      });
    }
    this.$set(treeNode, "rename", false);
    let index = this.list.findIndex((node: H3.DataSourceAPI.DataSourceNode) => {
      return node.objectId === treeNode.objectId;
    });
    if (index) {
      (this.list[index] as any).rename = false;
      (this.list[index] as any).displayName = treeNode.displayName;
    }
    this.disabled = false;
  }
  /**
   * 删除节点
   * @param treeNode
   */
  remove(treeNode: H3.DataSourceAPI.DataSourceNode) {
    const self = this;
    let title: string = "";
    let content: string = "";
    this.$emit("change", null);
    // nodeType:0组、1节点
    if (!treeNode.nodeType) {
      title = "确定要删除该分组吗？";
      content = "分组及分组内所有数据源将全部删除，请谨慎删除";
    } else {
      title = "确定要删除该数据源吗？";
      content = "删除后将无法恢复，请谨慎操作";
    }
    Modal.confirm({
      title: title,
      content: content,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        const res = self.getNodeChildren(treeNode);
        dataSourceApi.removeDataSourceNode(res).then(() => {
          const ids: Array<string> = [];
          Object.values(res).forEach((gIds: Array<string>) => {
            ids.push(...gIds);
          });
          self.list = self.list.filter(
            (oNode: H3.DataSourceAPI.DataSourceNode) => !ids.includes(oNode.objectId)
          );
        });
      }
    });
  }

  /**
   * 删除节点
   * @param treeNode
   * @param groupObjectIds
   * @param nodeObjectIds
   */
  getNodeChildren(
    treeNode: H3.DataSourceAPI.DataSourceNode,
    groupObjectIds: Array<string> = [],
    nodeObjectIds: Array<string> = []
  ) {
    if (treeNode.nodeType) {
      nodeObjectIds.push(treeNode.objectId);
    } else {
      groupObjectIds.push(treeNode.objectId);
    }
    if ((treeNode as any).children) {
      (treeNode as any).children.forEach((oNode: H3.DataSourceAPI.DataSourceNode) =>
        this.getNodeChildren(oNode, groupObjectIds, nodeObjectIds)
      );
    }
    return {
      groupObjectIds,
      nodeObjectIds
    };
  }
  /**
   * 节点配置
   * @param e
   * @param treeNode
   */
  nodeOptions(e: any, treeNode: H3.DataSourceAPI.DataSourceNode) {
    (e.domEvent as Event).stopPropagation();
    this[e.key](treeNode, e.domEvent);
  }

  /**
   * 编辑
   * @param treeNode
   */
  edit(treeNode: H3.DataSourceAPI.DataSourceNode) {
    this.$emit("edit", { objectId: treeNode.objectId, groupId: treeNode.parentObjectId });
  }
  /**
   * 加载数据源列表
   */
  loadDataSourceList() {
    this.loading = true;
    return new Promise(resolve => {
      dataSourceApi
        .getDataSourceNodes()
        .then((list: Array<H3.DataSourceAPI.DataSourceNode>) => {
          this.list = list;
          this.loading = false;
          resolve();
        })
        .catch(() => {
          this.loading = false;
        });
    });
  }

  /**
   * 更改initActiveId，更新预览界面
   */
  changeInitActiveId() {
    if (this.initActiveNodeId) {
      const node = this.list.filter(tree => {
        return tree.objectId === this.initActiveNodeId;
      });
      if (node.length > 0) {
        this.$emit("change", node[0]);
      } else {
        this.$emit("change", null);
      }
    } else {
      this.$emit("change", null);
    }
  }

  async mounted() {
    await this.loadDataSourceList();
    this.changeInitActiveId();
  }
}
</script>
