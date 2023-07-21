<template>
  <div :class="prefixCls">
    <list
      :class="[`${prefixCls}__left`]"
      :comPrefixCls="prefixCls"
      :initActiveNodeId="initActiveNodeId"
      @add-data-source="addDataSource"
      @change="changeDataSource"
      @edit="editDataSource"
    />
    <preview
      v-if="activeNode || initActiveNodeId"
      :comPrefixCls="prefixCls"
      :class="[`${prefixCls}__right`]"
      :node="activeNode"
      @edit="editDataSource"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue } from "vue-property-decorator";
import { dataSourceApi } from "@h3/report/basics/service/data-source";
import List from "./list.vue";
import Preview from "./preview.vue";
import options from "@h3/report/dist/options";
import { message } from "@h3/antd-vue";
import { getUrlNodeId } from "@h3/report/basics/utils/url";

options.message = message;

@Component({
  name: "h3-data-source-list",
  components: {
    List,
    Preview
  }
})
export default class DataSourceList extends Vue {
  @Prop({ default: () => "" }) corpId!: string;
  @Prop({ default: () => () => ({}) }) config!: any;
  prefixCls: string = "h3-data-source-list";
  // 激活的数据流节点
  activeNode: H3.DataSourceAPI.DataSourceNode | null = null;
  // 初始化时默认选中的节点id
  initActiveNodeId: string | null = null;

  /**
   * 新建数据
   * @param groupId
   */
  addDataSource(groupId?: string) {
    this.$emit("add-data-source", groupId);
  }

  /**
   * 改变源
   * @param node
   */
  changeDataSource(node: H3.DataSourceAPI.DataSourceNode | null) {
    this.activeNode = node;
  }
  /**
   * 改变源Id
   * @param dataSourceId
   */
  editDataSource({ objectId, groupId }) {
    //判断url是否相同
    let originId = getUrlNodeId();
    if (originId !== objectId) {
      let newUrl = "";
      if (originId) {
        let paramExp = new RegExp(`id=${originId}`);
        newUrl = location.href.replace(paramExp, `id=${objectId}`);
      } else {
        newUrl = location.href + `?id=${objectId}`;
      }
      window.history.replaceState({ objectId, groupId }, null, newUrl);
    }
    this.$emit("edit-data-source", { objectId, groupId });
  }

  hashChange(e) {
    if (e.oldURL !== e.newURL) {
      this.initActiveNodeId = getUrlNodeId();
    }
  }

  created() {
    this.initActiveNodeId = getUrlNodeId();

    //hashchange
    window.onhashchange = this.hashChange;

    //读取
    dataSourceApi.setConfig({
      corpId: this.corpId,
      config: this.config
    });
  }
}
</script>
