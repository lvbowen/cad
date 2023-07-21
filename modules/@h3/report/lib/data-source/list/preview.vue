<template>
  <div :class="prefixCls">
    <h3-loading v-if="loading"/>
    <div v-else-if="previewInfo !== null" :class="`${prefixCls}-wrap`">
      <div :class="`${prefixCls}-header`">
        <div :class="`${prefixCls}-name`">{{ node.displayName }}</div>
        <a-button type="primary" @click="editDataSource">
          编辑数据流
        </a-button>
      </div>
      <div :class="`${prefixCls}-content`">
        <a-tabs defaultActiveKey="1">
          <a-tab-pane tab="数据预览" key="1">
            <!-- 表格 -->
            <div
              v-if="previewInfo"
              :class="`${prefixCls}-table`"
              ref="table"
            >
              <a-table
                :dataSource="dateSource"
                :columns="columns"
                :scroll="scrollData"
                :pagination="false"
                bordered
              >
              </a-table>
            </div>

            <div :class="`${prefixCls}-empty`" v-else>
              <img
                :src="require(`@h3/report/basics/assets/data-source-list/empty-source.png`)"
                :class="`${prefixCls}-empty-img`"
              />
              <p>高级数据源配置出错了，请重新配置</p>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { dataSourceApi } from "@h3/report/basics/service/data-source";
import H3Loading from "@h3/report/basics/components/loading";
import { Button, Pagination, Modal, Input, Tabs, Table } from "@h3/antd-vue";

@Component({
  name: "h3-data-source-right",
  components: {
    H3Loading,
    AButton: Button,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ATable: Table,
    H3TableColumn: Table.Column
  }
})
export default class DataSourceRight extends Vue {
  @Prop() comPrefixCls!: string;
  @Prop() node!: H3.DataSourceAPI.DataSourceNode;
  prefixCls: string = `${this.comPrefixCls}__right`;
  loading: boolean = false;
  tabList: Array<string> = ["数据预览", "数据族谱", "数据更新", "数据历史", "权限设置"]; // 工具栏数据
  previewInfo: H3.DataSourceAPI.Preview | null | undefined = null;
  tableHeight: number = 0;

  @Watch("node", { immediate: true })
  changeDataSourceId(activeNode: H3.DataSourceAPI.DataSourceNode) {
    if (activeNode) {
      this.loadPreviewList(activeNode.objectId);
    } else {
      this.previewInfo = null;
    }
  }

  // 列表数据
  get dateSource() {
    if (this.previewInfo && this.previewInfo.data) {
      return this.previewInfo.data.map((item, index) => {
        return Object.assign({ key: index }, item);
      });
    } else {
      return [];
    }
  }

  // 列表头部数据
  get columns() {
    if (this.previewInfo && this.previewInfo.headers) {
      return this.previewInfo.headers.map(item => {
        return {
          title: item.title,
          dataIndex: item.name,
          width: "192px"
        };
      });
    } else {
      return [];
    }
  }

  // 滚动设定
  get scrollData() {
    if (this.previewInfo && this.previewInfo.headers) {
      return {
        x: this.previewInfo.headers.length * 192,
        y: this.tableHeight
      };
    } else {
      return {
        x: 1200,
        y: 400
      };
    }
  }

  /**
   * 编辑数据源
   */
  editDataSource() {
    this.$emit("edit", { objectId: this.node.objectId, groupId: this.node.parentObjectId });
  }

  /**
   * 预览数据源数据
   * @param id: dataSourceId
   */
  loadPreviewList(id: string) {
    this.loading = true;
    dataSourceApi
      .previewAdvancedData(id)
      .then((preview: H3.DataSourceAPI.Preview) => {
        this.loading = false;
        if (preview) {
          this.previewInfo = preview;
          this.$nextTick(() => {
            this.tableHeight = (this.$refs.table as any).offsetHeight - 50;
          });
        } else {
          this.previewInfo = undefined;
        }
      })
      .catch(() => {
        this.loading = false;
        this.previewInfo = undefined;
      });
  }

  mounted() {}
}
</script>
