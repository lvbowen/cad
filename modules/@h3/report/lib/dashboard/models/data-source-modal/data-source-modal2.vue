<!-- 数据源选择弹窗 -->
<template>
  <div :class="prefixCls">
    <div :class="[`${prefixCls}__wrap`]">
      <div :class="[`${prefixCls}__header`]">
        <label>数据源选择</label>
        <i class="h3yun_All close" @click="hideDataSourceModal"></i>
      </div>
      <div :class="[`${prefixCls}__content`]">
        <div :class="[`${prefixCls}__search`]">
          <a-input
            placeholder="搜索"
            v-model="searchValue"
            @change="onSearch()"
          >
            <a-icon slot="prefix" type="search"/>
          </a-input>
          <i
            class="h3yun_All close-circle empty-search"
            v-if="searchValue.length !== 0"
            @click="empty()"
          >
          </i>
        </div>
        <h3-scroll
          style="height: calc(100% - 42px);"
          ref="scroll"
          :scrollXBtn="false"
          :buttonColor="'rgba(0, 0, 0, 0.45)'"
          @scroll= "scrollReady"
        >
          <!-- 菜单栏 -->
          <div :class="[`${prefixCls}__menu-wrap`]" ref="menu">
            <!-- 树形图 -->
            <h3-tree
              v-if="!isSearch && deepCopyDataSourceList.length"
              :tile="true"
              :class="'modal-tree'"
              :accord="false"
              :multiple="false"
              :folderSelected="false"
              :openKeys="openKeys"
              :folderIcon="folderIcon"
              :treeList="deepCopyDataSourceList"
              :keyMappings="keyMappings"
              @node-click="nodeClick"
              @folder-click="folderClick"
            >
            </h3-tree>
            <!-- 搜索 -->
            <ul class="search-content" v-else>
              <li
                v-html="item.content"
                v-for="(item, index) in searchContentList"
                :key="index"
                :class="{'selected' : searchSelected === item.key}"
                @click="clickOnSearch(item.key)"
              >
              </li>
            </ul>
          </div>
        </h3-scroll>
      </div>
      <div :class="[`${prefixCls}__button`]">
        <H3-button @click="hideDataSourceModal">取消</H3-button>
        <H3-button type="primary" @click="makeSure">确定</H3-button>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { State, Action, Mutation, namespace } from 'vuex-class';
import { ReportMutation, ReportAction } from '@h3/report/basics/store/dashboard/types';
import H3Scroll from '@h3/report/basics/components/scroll';
import { H3Button } from '@h3/awesome-ui';
import { Input, Icon, Modal, Menu, message } from '@h3/antd-vue';
import H3Tree from '@h3/report/basics/components/tree';
import { NodeType } from '../../../data-source/enum/node';
const ReportPro = namespace('report');
@Component({
  name: 'h3-report-data-source-modal',
  components: {
    H3Button,
    AInput: Input,
    AIcon: Icon,
    H3Scroll,
    AModal: Modal,
    H3Tree
  }
})
export default class Home extends Vue {
  // 数据源数据 - 用于展开下拉菜单以及预留字段处理
  @Prop({ default: () => ({}) }) dataSource!: H3.Report.DataSource;
  @Prop({ default: () => ({}) }) activeChart!: H3.Report.Chart;
  @ReportPro.State('dataSourceList') dataSourceList!: Array<H3.ReportAPI.DataSourceList>;
  @ReportPro.State('dataSourceListBase') dataSourceListBase!: Array<H3.ReportAPI.DataSourceList>;
  @ReportPro.State('lastDataSourceId') lastDataSourceId;
  @ReportPro.State('charts') charts!: Array<H3.Report.Chart>;
  @ReportPro.Mutation(ReportMutation.SETACTIVECHART) setActiveChart!: Function;
  @ReportPro.Mutation(ReportMutation.SETLASTDATASOURCEID) storeLastDataSourceId!: Function;
  @ReportPro.Mutation(ReportMutation.CLEARCHARTRELATION) clearChartRelation!: Function;
  prefixCls = 'h3-report-data-source-modal';
  // 数据源列表数据 - 深度copy
  deepCopyDataSourceList: Array<any> = [];
  // 输入框值
  searchValue:string = '';
  // 是否搜索
  isSearch = false;
  // 搜索内容list
  searchContentList:any[] = [];
  // 搜索内容选中的值
  searchSelected: string = '';
  // 存储点击的数据源ID
  storeDataSourceId: string = '';
  // 存储点击的数据源ID
  storeDataSourceId: string = '';
  // tree打开节点
  openKeys: any[] = [];
  // icon
  folderIcon: object = { open: 'h3yun_All folder-open-fill', close: 'h3yun_All folder-fill' };
  // 滚动高度
  scrollHeight:any = 0;
  // tree组件的key值
  keyMappings: any = {
    title: 'displayName',
    key: 'objectId',
    parent: 'parentObjectId',
    folder: 'folder'
  }
  @Watch('searchValue')
  watchSearchValue(val) {
    if (val === '') {
      this.isSearch = false;
    }
    // 计算所选数据源滚动条位置
    this.refreshScroll();
  }

  /**
 * 隐藏数据源弹窗
 */
  hideDataSourceModal() {
    this.$emit('hide-data-source-modal');
  }
  /**
   * 搜索
   */
  onSearch() {
    // 重置
    this.searchContentList = [];
    if (this.searchValue) {
      this.isSearch = true;
      // 保存模糊搜索结果
      this.getSearch(this.deepCopyDataSourceList);
      if (!this.searchContentList.length) {
        const container = { content: '无查询结果！' };
        this.searchContentList.push(container);
      }
    } else {
      this.isSearch = false;
    }
  }
  // 搜索
  getSearch(list) {
    list.forEach((item: any, index: number) => {
      if (item.dataSourceId) {
        if (item[this.keyMappings.title].indexOf(this.searchValue) > -1) {
          let container = {
            content: '',
            openkey: '',
            key: item.dataSourceId
          };
          // 判断相同dataSourceId
          if (this.dataSource.dataSourceId === item.dataSourceId) {
            this.searchSelected = this.dataSource.dataSourceId;
            this.storeDataSourceId = this.dataSource.dataSourceId;
            container.content = item.title;
            container.openkey = item.key;
          }
          const newName = item[this.keyMappings.title];
          // 修改的值
          const content = `<span class="highlight">${ this.searchValue }</span>`;
          // 被修改的值
          const replace = new RegExp(this.searchValue, 'g');
          container.content = newName.replace(replace, content);
          this.searchContentList.push(container);
        }
      }
    });
  }
  /**
   * 清空搜索框内容
   */
  empty() {
    this.searchValue = '';
    this.isSearch = false;
    // 重置
    this.searchContentList = [];
    // 计算所选数据源滚动条位置
    this.refreshScroll();
  }
  /**
   * 搜索内容 - 点击
   * @param dataSourceId
   */
  clickOnSearch(dataSourceId: string,) {
    this.storeDataSourceId = dataSourceId;
    this.searchSelected = dataSourceId;
  }
  /**
   * 计算所选数据源滚动条位置
   */
  countScrollTop() {
    let keyCount = 0;
    let sum;
    // 是否为搜索
    if (this.isSearch) {
      this.scrollHeight = Number(this.searchContentList.findIndex(item => item.key === this.storeDataSourceId));
    } else if (this.openKeys.length && this.openKeys[0]) {
      const keys:any[] = this.openKeys[0].split('-');
      keys.forEach((val: any, index) => {
        keyCount += Number(val);
      });
      sum = (keyCount + 1) * 40;
      this.scrollHeight = sum;
    }
  }
  /**
   * 成功事件处理逻辑
   */
  handleSuccess() {
    // 保存上一次点击的数据源ID
    this.storeLastDataSourceId(this.storeDataSourceId);
    // 设置dataSourceId
    this.$set(this.activeChart, 'dataSourceId', this.storeDataSourceId);
    // 关闭弹窗
    this.$emit('close-data-source-modal');
    // 清空维度、指标、排序、过滤
    this.activeChart.data.dimension = [];
    (this.activeChart.data.groupDimension as any) = [] || null;
    this.activeChart.data.metric = [];
    this.activeChart.data.metricGroup = [];
    this.activeChart.data.sort = [];
    this.activeChart.data.filter = [];
    // 设置激活状态
    this.setActiveChart(this.activeChart);
  }
  /**
   * 弹窗
   */
  alertModal() {
    const self = this;
    const modalConfirm = Modal.confirm({
      class: `${self.prefixCls}__modal`,
      title: '更改数据源',
      content: '更改数据源后，将清空图表所有配置内容，确定需要更改吗？',
      okText: '确定',
      cancelText: '取消',
      width: 433,
      destroyOnClose: true,
      centered: true,
      confirmLoading: true,
      iconType: 'exclamation-circle-o',
      onOk: () => {
        // 成功事件处理逻辑
        self.handleSuccess();
        // 清空图表联动关系
        this.clearChartRelation(this.activeChart);
        // 销毁
        modalConfirm.destroy();
      }
    } as any);
  }
  /**
   * 确定
   */
  makeSure() {
    if (!this.storeDataSourceId) {
      message.error('请选择数据源!');
    } else {
      if (Object.keys(this.dataSource).length === 0) {
        // 成功事件处理逻辑
        this.handleSuccess();
      } else {
        // 弹窗
        this.alertModal();
      }
    }
  }
  /**
   * nodeClick
   */
  nodeClick(val) {
    const selectedItem = this.deepCopyDataSourceList.find(i => i.dataSourceId === this.storeDataSourceId)
    if (selectedItem) {
      selectedItem.selected = false
    }
    this.storeDataSourceId = val.dataSourceId;
  }


  /**
   * 构造数据
   * @param list
   * @param key
   */
  createData(list: any[], key?: string): Array<H3.ReportAPI.DataSourceList>{
    return list.map((item:any, index) => {
      item.open = false;
      item.folder = item.nodeType === 0;
      if (this.dataSource) {
        if (Object.keys(this.dataSource).length !== 0) {
          if (item.dataSourceId === this.dataSource.dataSourceId) {
            this.storeLastDataSourceId(this.dataSource.dataSourceId);
            this.storeDataSourceId = this.dataSource.dataSourceId;
            this.openKeys = [item.parentObjectId];
            item.selected = true;
          }
        } else if (item.dataSourceId === this.lastDataSourceId) {
          this.storeDataSourceId = this.lastDataSourceId;
          this.openKeys = [item.parentObjectId];
          item.selected = true;
        }
      }
      return item
    })
  }

  /**
   * 获取数据源列表数据
   */
  getDataSourceList() {
    if (!this.dataSourceList) {
      this.$emit('data-source-list');
    }
    if (this.dataSourceList) {
      // 构造数据
      this.deepCopyDataSourceList = this.createData(this.dataSourceListBase);
      // 计算所选数据源滚动条位置
      this.countScrollTop();
    }
  }
  /**
   * 更新滚动条
   */
  refreshScroll() {
    if (this.$refs.scroll) {
      (this.$refs.scroll as any).setScrollBar();
    }
  }
  folderClick(treeNode) {
    // 更新滚动条
    this.$nextTick(()=> {
      this.refreshScroll();
    });
  }
  scrollReady() {
    if (this.scrollHeight) {
      this.$nextTick(() => {
        (this.$refs.scroll as any).setScroll(0, this.scrollHeight);
        this.scrollHeight = 0;
      });
    }
  }
  mounted() {
    // 获取数据源列表数据
    this.getDataSourceList();
  }
}
</script>

<style lang='less'>
  .h3-report-data-source-modal {
    
  }
</style>
