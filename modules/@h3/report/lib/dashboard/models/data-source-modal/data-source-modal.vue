<template>
  <h3-loading :class="prefixCls" v-if="loading"/>
  <div :class="prefixCls" v-else>
    <div :class="[`${prefixCls}__search`]">
      <a-input
        placeholder="搜索"
        v-model="searchValue"
        @change="search"
      >
        <a-icon slot="prefix" type="search"/>
      </a-input>
    </div>
    <a-tabs v-model="activeTabKey">
      <template v-for="tab in tabOptions">
        <a-tab-pane
          v-if="tab.display"
          :key="tab.value"
          :tab="tab.label"
        >
          <div
            :class="[`${prefixCls}__tree`]"
            v-if="renderDatasource && renderDatasource.length > 0"
          >
            <a-tree
              :autoExpandParent="true"
              :treeData="renderDatasource"
              :defaultSelectedKeys="selectedKeys"
              :defaultExpandedKeys="expandedKeys"
              @select="onSelect"
            >
              <template slot="title" slot-scope="{ title }">
                <span v-if="title.indexOf(searchValue) > -1">
                  {{ title.substr(0, title.indexOf(searchValue)) }}
                  <span style="color: #1070ff">{{ searchValue }}</span>
                  {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
                </span>
                <span v-else>{{ title }} </span>
              </template>
            </a-tree>
          </div>
          <div v-else :class="[`${prefixCls}__empty`]">
            <img :src="require(`@h3/report/basics/assets/empty-new.svg`)"/>
            <span v-if="searchValue">无搜索结果</span>
            <span v-else>
              <template v-if="activeTabKey === 'advanced'">
                暂无高级数据源，请点击<span class="high-light" @click="goToAdd">添加</span>
              </template>
              <template v-else>暂无数据</template>
            </span>
          </div>
        </a-tab-pane>
      </template>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { Input, Icon, Modal, Tabs, Tree } from "@h3/antd-vue";
import { ReportMutation, ReportAction } from "@h3/report/basics/store/dashboard/types";
import H3SearchTree from "@h3/report/basics/components/search-tree";
import H3Loading from "@h3/report/basics/components/loading";
import options from "@h3/report/dist/options";
import H3Tree from "@h3/report/basics/components/tree";

const ReportPro = namespace("report");
@Component({
  name: "h3-report-data-source-modal",
  components: {
    AInput: Input,
    AIcon: Icon,
    H3SearchTree,
    H3Loading,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ATree: Tree,
    H3Tree
  }
})
export default class ReportDataSourceModal extends Vue {
  @Prop({ default: () => null }) dataSource!: H3.ReportAPI.DataSourceNode;
  @Prop({ default: () => null }) activeChart!: H3.Report.Chart;
  @Prop({ default: () => null }) addDataSource!: Function;

  prefixCls: string = "h3-report-data-source-modal";
  @ReportPro.State("lastDataSourceNode") lastDataSourceNode!: H3.ReportAPI.DataSourceNode;
  @ReportPro.State("showAdvancedDataSource") showAdvancedDataSource!: boolean;
  @ReportPro.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function;
  @ReportPro.Action(ReportAction.GETDATASOURCELIST) getDataSourceList!: Function;
  @ReportPro.Mutation(ReportMutation.SETLASTDATASOURCE) setLastDataSource!: Function;
  @ReportPro.Mutation(ReportMutation.CLEARCHARTRELATION) clearChartRelation!: Function;
  searchValue = "";
  sourceList: Array<H3.ReportAPI.DataSourceNode> = [];
  loading = true;
  mappings: any = {
    title: "displayName",
    key: "objectId",
    parent: "parentObjectId"
  };
  activeNode: H3.ReportAPI.DataSourceNode | null = null;

  activeTabKey: any = "form";
  tabOptions: Array<any> = [
    {
      value: "form",
      label: "表单",
      datasource: "formDataSource",
      display: true
    },
    {
      value: "advanced",
      label: "高级数据源",
      datasource: "advancedDataSource",
      display: false
    }
  ];

  /**
   * 当选择完数据源之后
   */
  onSelect(val) {
    const id = val[0];
    this.activeNode = this.sourceList.find(i => i.objectId === id) || null;
  }
  // 搜索框搜索
  search(val) {}

  /**
   * 目标数据源
   */
  get targetDatasource(): Array<H3.ReportAPI.DataSourceNode> {
    let list =
      this.activeTabKey === "form"
        ? this.sourceList.filter(f => f.useType !== 100)
        : this.sourceList.filter(f => f.useType === 100);
    return this.searchValue
      ? list.filter(i => i.displayName.indexOf(this.searchValue) > -1)
      : this.sourceList;
  }

  /**
   * 默认选择的数据源
   */
  get selectedKeys() {
    return this.activeNode ? [this.activeNode.objectId] : [];
  }
  /**
   * 默认展开选中的数据源的父级
   */
  get expandedKeys() {
    return this.activeNode ? [this.activeNode.parentObjectId] : [];
  }
  /**
   * 获取需要打开的树节点
   */
  get openKeys() {
    return this.dataSource ? [this.dataSource.objectId] : [];
  }

  /**
   * old todo delect 获取数据源列表
   */
  get getSourceList() {
    let list: any = [];
    if (this.sourceList.length) {
      list = this.sourceList.map((node: H3.ReportAPI.DataSourceNode) => {
        const folder = !node.nodeType;
        // 如果数据源Id和当前数据源一致
        if (this.lastDataSourceNode && node.objectId === this.lastDataSourceNode.objectId) {
          this.activeNode = node;
        }
        return Object.assign({}, node, { folder });
      });
      const sourceIndex = list.findIndex(
        (node: H3.ReportAPI.DataSourceNode) => node.useType === 100 && !node.parentObjectId
      );
      if ((sourceIndex > 0 || sourceIndex === 0) && list[sourceIndex]) {
        list[sourceIndex].displayName = "高级数据源";
      }
      list.unshift(list.splice(sourceIndex, 1)[0]);
    }
    return list;
  }

  /**
   * 表单的应用树形结构
   */
  get formDataSource() {
    const list = this.targetDatasource.filter(f => f.useType !== 100);
    return this.getParent(list);
  }

  /**
   * 获取高级数据源数据
   */
  get advancedDataSource() {
    let list = this.targetDatasource.filter(f => f.useType === 100);
    return this.getParent(list, true);
  }

  /**
   * 搜索树
   */
  get searchTree() {
    const list = this.showAdvancedDataSource
      ? [...this.advancedDataSource, ...this.formDataSource]
      : this.formDataSource;
    return list;
  }

  get renderDatasource() {
    return this.searchValue
      ? this.searchTree
      : this.activeTabKey === "form"
      ? this.formDataSource
      : this.advancedDataSource;
  }

  /**
   * 获取tree文件夹
   */
  getParent(list: Array<H3.ReportAPI.DataSourceNode>, rootParent: boolean = false) {
    let folder = list
      .filter(f => {
        if (!rootParent) {
          return !f.nodeType;
        } else {
          return !f.nodeType && !f.parentObjectId;
        }
        return !f.nodeType;
      })
      .map((item: H3.ReportAPI.DataSourceNode) => {
        return {
          key: item.objectId,
          title: item.displayName,
          children: [],
          useType: item.useType,
          selectable: false,
          isLeaf: false,
          scopedSlots: { title: "title" }
        };
      });

    if (folder && folder.length > 0) {
      folder.forEach(parent => {
        (parent.children as Array<any>) = this.getChild(list, parent);
      });
    } else {
      folder = this.getChild(list);
    }

    return folder;
  }

  /**
   * 获取孩子节点
   */
  getChild(list: Array<H3.ReportAPI.DataSourceNode>, parent?: any) {
    const l = parent
      ? list.filter(c => c.parentObjectId === parent.key || c.parentObjectId === parent.objectId)
      : list;
    return l.map(citem => {
      // 如果数据源Id和当前数据源一致
      if (this.lastDataSourceNode && citem.objectId === this.lastDataSourceNode.objectId) {
        this.activeNode = citem;
      }
      if (citem.nodeType) {
        // 数据源
        return {
          key: citem.objectId,
          title: citem.displayName,
          selectable: !!citem.nodeType,
          isLeaf: !!citem.nodeType,
          scopedSlots: { title: "title" }
        };
      } else {
        // 文件夹
        const c = this.getChild(list, citem);
        return {
          key: citem.objectId,
          title: citem.displayName,
          selectable: !!citem.nodeType,
          isLeaf: !!citem.nodeType,
          children: c,
          scopedSlots: { title: "title" }
        };
      }
    });
  }

  /**
   * 添加高级数据源
   */
  goToAdd() {
    this.addDataSource();
    this.$emit("addDataSource");
  }

  /**
   * 确认替换数据源
   */
  confirmDateSourceChange(callback: Function) {
    const modalConfirm = Modal.confirm({
      class: `${this.prefixCls}__modal`,
      title: "更改数据源",
      content: "更改数据源后，将清空图表所有配置内容，确定需要更改吗？",
      okText: "确定",
      cancelText: "取消",
      width: 433,
      destroyOnClose: true,
      centered: true,
      confirmLoading: true,
      iconType: "exclamation-circle-o",
      onOk: () => {
        this.updateDateSource();
        // 清空图表联动关系
        this.clearChartRelation(this.activeChart);
        // 销毁
        modalConfirm.destroy();
        callback(true);
      },
      cancel: () => {
        callback(false);
      }
    });
  }

  /**
   * 修改数据源信息
   */
  updateDateSource() {
    // 保存上一次点击的数据源ID
    this.setLastDataSource(this.activeNode);
    // 设置dataSourceId
    this.$set(this.activeChart, "dataSourceId", this.activeNode && this.activeNode.objectId);
    this.$set(this.activeChart, "useType", this.activeNode && this.activeNode.useType);
    // 清空维度、指标、排序、过滤
    if (this.dataSource) {
      this.activeChart.data.dimension = [];
      if (this.activeChart.data.groupDimension) {
        this.activeChart.data.groupDimension = [];
      }
      this.activeChart.data.metric = [];
      this.activeChart.data.metricGroup = [];
      this.activeChart.data.sort = [];
      this.activeChart.data.filter = [];
    }
    // 设置激活状态
    this.setActiveChart(this.activeChart);
  }

  /**
   * 提交检查
   */
  check() {
    return new Promise(resolve => {
      // 如果没有选中的节点提示选中数据源
      if (!this.activeNode) {
        options.message.error("请选择数据源");
        resolve(false);
      }
      //如果当前选中的数据源和原始的数据源不一致
      else if (this.dataSource && this.activeNode.objectId !== this.dataSource.objectId) {
        this.confirmDateSourceChange(resolve);
      } else {
        this.updateDateSource();
        resolve(true);
      }
    });
  }

  /**
   * 滚动到选中的数据源的位置
   */
  scrollToTarget() {
    console.log("scrollToTarget");
    if (this.activeNode) {
      const selected = document.getElementsByClassName(
        "ant-tree-treenode-selected"
      )[0] as HTMLElement;
      const tree = document.getElementsByClassName(
        "h3-report-data-source-modal__tree"
      )[0] as HTMLElement;

      let top = selected.offsetTop;
      let listHeight = tree.offsetHeight;

      tree.scrollTop = top - listHeight / 2;
    }
  }

  created() {
    // 设置显示高级数据源
    this.tabOptions[1].display = this.showAdvancedDataSource;
  }
  async mounted() {
    // 处理大数据量的时候弹窗出现慢的问题
    this.loading = true;
    setTimeout(() => {
      this.getDataSourceList().then(sourceList => {
        this.sourceList = sourceList;
        if (this.dataSource) {
          this.setLastDataSource(this.dataSource);
        }
        this.loading = false;
        this.$nextTick(() => {
          this.scrollToTarget();
        });
      });
    }, 100);
  }
}
</script>
