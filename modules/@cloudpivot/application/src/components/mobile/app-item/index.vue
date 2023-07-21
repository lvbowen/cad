<template>
  <div class="app-item">
    <!-- 搜索框 -->
    <search-bar
      class="app-item__search"
      :value="wd"
      :onclear="onClear"
      @focus="focusSearch"
      @cancel="cancelSearch"
      @search="search"
    />
    <!-- 主体内容 -->
    <search-panel
      v-if="showSearchPanel"
      v-model="wd"
      class="app-item__main"
    />
    <item-list
      class="app-item__main"
      :appItem="appItem"
      v-show="!showSearchPanel && !loading"
      @onItem="goFormList"
    />

    
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';

import common from '@cloudpivot/common/mobile';

import { listApi } from '@cloudpivot/api';

import OpenFormMixin from '../open-form';

const Bus:any = common.utils.Bus;

import SearchPanel from '../search-panel.vue';

@Component({
  name: 'app-item',
  components: {
    SearchBar: common.components.Searchbar,
    SearchPanel,
    ItemList: common.components.ItemList,
  }
})
export default class AppItem extends Mixins(OpenFormMixin) {
  @Prop() appCode!: any;

  appItem:any = [];

  showSearchPanel: boolean = false;

  currentApp: any = null;

  wd: string = '';

  loading: boolean = true;

  created() {
    this.load();
    this.loadAppItem();
  }

  load(flag?: boolean) {
    if (flag) {
      this.loading = false;
      this.$h3.toast.hide();
    } else {
      this.loading = true;
      this.$h3.toast.show({
        text: '正在加载',
        iconType: 'loading'
      });
    }
  }

  /**
   * 开始搜索，展示搜索面板
   */
  focusSearch() {
    this.showSearchPanel = true;
    Bus.$emit('toggleNavbar', !this.showSearchPanel);
  }

  /**
   * 取消搜索，隐藏搜索面板
   */
  cancelSearch() {
    this.showSearchPanel = false;
    Bus.$emit('toggleNavbar', !this.showSearchPanel);
  }

  /**
   * 清空搜索框
   */
  onClear() {
    this.wd = '';
  }

  /**
   * 开始搜索
   */
  search(wd: string) {
    this.wd = wd;
  }

  loadAppItem() {
    const params = {
      appCode: this.appCode,
      isMobile: true
    }
    listApi.getFolder(params).then((res: any) => {
      if (Array.isArray(res.data)) {
        res.data.forEach((d:any) => {
          d.open = false;
        });
        this.appItem = res.data;
        this.currentApp = {
          code: this.appCode
        };
      }
      this.load(true);
    });
  }

  beforeDestroy() {
    Bus.$emit('toggleNavbar', true);
  }
}
</script>

<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.app-item {
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
