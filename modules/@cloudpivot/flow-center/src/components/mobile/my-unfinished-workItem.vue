<template>
  <div class="workitems" :class="{ searching: true, single: appCode }">
    <template v-if="mode === 'standalone'">
      <div class="toolbar">
        <search-bar
          class="workitems-search combine-search"
          @search="search"
          @cancel="cancel"
          :placeHolder="$t('languages.common.search')"
          :cancelText="$t('languages.common.cancel')"
        />
        <span class="batch-btn" @click="toggleMode">{{
          $t("cloudpivot.flowCenter.mobile.batchHandle")
        }}</span>
      </div>
      <h3-scroll
        ref="scroll"
        :loadMore="loadMore"
        :pageSize="pageSize"
        v-show="isEmpty"
      >
        <div>
          <transition name="fade">
            <toptip
              v-show="showTip"
            >{{ $t("cloudpivot.flowCenter.mobile.youHave") }}{{ totalNewItems
            }}{{ $t("cloudpivot.flowCenter.mobile.todoItems") }}</toptip
            >
          </transition>
          <unfinished-work-item
            v-for="(workitem, index) in workitems"
            :key="index"
            :workitem="workitem"
            :searchWord="keyWords"
            @openForm="openForm(workitem)"
          />
        </div>
      </h3-scroll>
      <Empty v-show="!isEmpty"></Empty>
    </template>
    <template v-if="mode === 'batch'">
      <div class="toolbar batch-toolbar">
        <span class="left">
          <checkbox-item :defaultChecked="checkAll" @change="toggleCheckAll" />
          <span class="select-all aufont">{{
            $t("cloudpivot.flowCenter.mobile.selectAll")
          }}</span>
        </span>

        <!-- <search-bar
          v-show="true"
          class="workitems-search combine-search"
          @search="search"
          @cancel="cancel"
          :placeHolder="$t('languages.common.search')"
          :cancelText="$t('languages.common.cancel')"
        /> -->
        <span class="batch-btn cancel-batch" @click="toggleMode">{{
          $t("cloudpivot.flowCenter.mobile.cancelBatch")
        }}</span>
      </div>
      <h3-scroll
        ref="scroll"
        :loadMore="loadMore"
        :pageSize="pageSize"
        v-show="isEmpty"
      >
        <div>
          <transition name="fade">
            <toptip
              v-show="showTip"
            >{{ $t("cloudpivot.flowCenter.mobile.youHave") }}{{ totalNewItems
            }}{{ $t("cloudpivot.flowCenter.mobile.todoItems") }}</toptip
            >
          </transition>
          <unfinished-work-item
            v-for="(workitem, index) in workitems"
            :key="index"
            :rowKey="index"
            :workitem="workitem"
            :searchWord="keyWords"
            :mode="mode"
            @checkboxChange="checkboxChange"
            @openForm="openForm(workitem)"
          />
        </div>
      </h3-scroll>
      <Empty v-show="!isEmpty"></Empty>
      <div class="bottom-control">
        <span class="num">{{ $t("cloudpivot.flowCenter.mobile.haveSelected") }}:<em>{{ taskIds.length }}</em></span>
        <span class="btn-batch" @click="batchOpt">{{ $t("cloudpivot.flowCenter.mobile.batchApprove") }}</span>
      </div>
    </template>
    <!-- <div class="toolbar">
      <search-bar
        v-show="true"
        class="workitems-search combine-search"
        @search="search"
        @cancel="cancel"
        :placeHolder="$t('languages.common.search')"
        :cancelText="$t('languages.common.cancel')"
      />
      <span class="batch-btn" @click="toggleMode">{{ $t('cloudpivot.flowCenter.mobile.batchHandle') }}</span>
    </div>
    <h3-scroll
      ref="scroll"
      :loadMore="loadMore"
      :pageSize="pageSize"
      v-show="isEmpty">
      <div>
        <transition name="fade">
          <toptip
            v-show="showTip"
          >{{ $t('cloudpivot.flowCenter.mobile.youHave') }}{{ totalNewItems }}{{ $t('cloudpivot.flowCenter.mobile.todoItems') }}</toptip>
        </transition>
        <unfinished-work-item
          v-for="(workitem,index) in workitems"
          :key="index"
          :workitem="workitem"
          :searchWord="keyWords"
          @openForm="openForm(workitem)"
        />
      </div>
    </h3-scroll>
    <Empty v-show="!isEmpty"></Empty> -->
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { homeApi, mobileHome } from "@cloudpivot/api";

// import * as H3Form from '@cloudpivot/form';
import mobile from "@cloudpivot/form/src/renderer/components/mobile";

//import WorkItem from './components/workitem.vue';
import UnfinishedWorkItem from "./components/unfinished-workitem.vue";

// import Common from '@cloudpivot/common';
import Toptip from "@cloudpivot/common/src/components/mobile/toptip.vue";
import Empty from "@cloudpivot/common/src/components/mobile/empty/empty.vue";
import Searchbar from "@cloudpivot/common/src/components/mobile/searchbar.vue";
import common from "@cloudpivot/common/mobile";
import * as pcUtils from "@cloudpivot/common/src/utils/pc/utils";
import { utils } from '@cloudpivot/common';

@Component({
  name: "MyUnfinishedWorkitems",
  components: {
    UnfinishedWorkItem,
    //WorkItem,
    H3Scroll: mobile.H3Scroll,
    Toptip: Toptip,
    Empty: Empty,
    SearchBar: Searchbar,
    checkboxItem: common.components.Checkbox,
    // H3Scroll: H3Form.renderer.components.mobile.H3Scroll,
    // Toptip: Common.components.mobile.Toptip,
    // Empty: Common.components.mobile.Empty,
    // SearchBar: Common.components.mobile.Searchbar
  },
})
export default class MyUnfinishedWorkitems extends Vue {
  @Prop({
    default: () => {
      return window.Environment.appCode;
    },
  })


  appCode!: any;

  workitems: Array<mobileHome.Workitem> = [];

  mode: string = "standalone";

  page: number = 1;

  taskIds: Array<any> = [];

  pageSize: number = 20;

  keyWords: string = "";

  isEmpty: boolean = true;
  // 是否显示顶部搜索框
  showTopbar: boolean = false;

  // 是否已加载过至少一次第一页数据
  firstTimeLoad: boolean = false;

  // 是否有新的条数： 旧的总数减新的总数
  totalNewItems: number = 10;

  // 是否显示顶部提示条
  showTip: boolean = false;

  checkAll: boolean = false;

  get totalItem() {
    return this.$store.state.circulate.totalItem;
  }
  created(){
    localStorage.removeItem('isShowEmailResquest');
    let {pageMode} = this.$route.query as any;
    if(pageMode === 'batch'){
      this.showTopbar = true;
      this.mode = 'batch'
    }else {
      this.mode = 'standalone';
    }
    this.$nextTick(() => {
      this.bottomToolControl();
    });
  }
  beforeRouteEnter (to, from, next) {

  }
  toggleMode() {
    if(this.mode === 'standalone'){ //要切成批量处理模式,先独立发请求,再走他们的请求
      homeApi.searchWorkitems({
        wd: '',
        page: 0,
        size: 20,
        batchOperate: true,
        appCode: window.Environment.appCode,
      }).then((res)=>{
        if(!res.data || res.errcode || !res.data.content || !res.data.content.length){
          this.$h3.modal.show({
            type: 'alert',
            content: `${this.$t('cloudpivot.flowCenter.mobile.noBatchWorkitemTip')}`,
            actions: [
              {
                text: this.$t('languages.common.ok'),
                onPress: ()=> void 0
              }
            ]
          })
        }else {
          // 这儿router中增加query
          this.$router.replace({
            path: '/home/workitems',
            query:{pageMode:'batch'}
          })
          this.mode = this.mode === "standalone" ? "batch" : "standalone";
          this.bottomToolControl();
          this.loadMore({
            num: 1,
            size: 20,
          },null);
        }
      })
    }else {
        this.$router.replace({
          path: '/home/workitems',
          query:{pageMode:'standalone'}
        })
        this.mode = this.mode === "standalone" ? "batch" : "standalone";
        this.bottomToolControl();
        this.loadMore({
          num: 1,
          size: 20,
        },null);
    }
  }

  loadMore(page: any, done: any) {
    const vm: any = this;
    vm.page = page.num;
    // 清空全选数据
    vm.checkAll = false;
    vm.taskIds = [];
    if (page.num === 1) {
      vm.workitems = [];
    }
    const params = {
      wd: vm.keyWords,
      page: page.num - 1,
      size: vm.pageSize,
      batchOperate: this.mode === "batch"? true: false,
      //appCode: this.appCode,
      appCode: window.Environment.appCode,
    };
    homeApi
      .searchWorkitems(params)
      .then((res: any) => {
        if (!res.data || res.errcode) {
          return;
        }

        // 国际化兼容
        res.data.content.forEach((item: any) => {
          item = pcUtils.compatible(item, "activityName");
          // 判断是否为委托任务
          item.isChecked = false;// 增加批量checkbox 是否选中
          item.beTrust = item.workItemTrust ? item.workItemTrust.trust : false;
          // 判断当前用户是否为委托人
          item.currentTrustor = item.workItemTrust
            ? item.workItemTrust.currentTrustor
            : false;
        });

        if (done) {
          this.toastTip(res.data.totalElements);
          done(vm.pageSize, res.data.totalElements);
        }
        vm.workitems = vm.workitems.concat(res.data.content);
        const totalElements = {
          workitem: res.data.totalElements,
        };
        vm.$store.commit("circulate/setTotalItem", totalElements);
        if (!vm.workitems.length) {
          vm.isEmpty = false;
        } else {
          vm.isEmpty = true;
        }
      })
      .then(() => {
        if (vm.page === 1 && vm.isEmpty && !vm.showTopbar) {
          if (vm.firstTimeLoad) {
            vm.showTopbar = true;
          } else {
            vm.firstTimeLoad = true;
          }
        }
      });
  }
  toggleCheckAll(isChecked) {
    if(isChecked){
      this.workitems.forEach((item:any)=>{
        item.isChecked = true;
      })
    }else{
      this.workitems.forEach((item:any)=>{
        item.isChecked = false;
      })
    }
    this.checkAll = isChecked;
    this.taskIds = this.getSelectedItem();
  }
  checkboxChange({index,isChecked}){
    this.workitems[index]['isChecked'] = isChecked;
    let selectedItem = this.getSelectedItem();
    if(selectedItem.length == this.workitems.length){
      this.checkAll = true;
    }else{
      this.checkAll = false;
    }
    this.taskIds = selectedItem;
  }
  getSelectedItem(){ // 返回[id]
    let taskIds = [] as any;
    this.workitems.forEach((item: any)=>{
      if(item.isChecked) taskIds.push(item.id)
    })
    return taskIds;
  }
  bottomToolControl(){ //批量处理 不显示底部导航栏,只显示操作功能
    utils.Bus.$emit('toggleNavbar', this.mode === 'batch' ? false: true);
  }
  batchOpt(){
    if(!this.taskIds.length)
    return this.$h3.toast.show({
      text: `${this.$t('cloudpivot.flowCenter.mobile.unselectWorkitem')}~`,
      autoHide: true,
      duration: 3000,
    });
    this.$router.push({
      path: '/home/batch-opt',
      query: {ids: this.taskIds.join(',')}
    }).catch((err: any) => {err});
  }
  toastTip(total: number) {
    if (total) {
      this.totalNewItems = total - this.totalItem.workitems;
      if (this.totalNewItems > 0) {
        this.showTip = true;
        setTimeout(() => {
          this.showTip = false;
        }, 1500);
      }
    }
  }

  search(keyWords: string) {
    if (keyWords === this.keyWords) {
      return;
    }
    this.keyWords = keyWords;
    this.isEmpty = true;
    this.loadMore({ num: 1 }, null);
  }

  cancel() {
    // 取消搜索
    this.search("");
  }

  // created () {
  //   // 动态注册模块
  //   this.$store.registerModule('circulate', circulate);
  // }

  destroyed() {
    utils.Bus.$emit('toggleNavbar', true);
  }

  /**
   * 抛出事件
   */
  openForm(workitem: any) {
    this.$emit("openForm", workitem);
  }
}
</script>
<style lang="less" scoped>
@import "~@/styles/index.less";
@import "~@cloudpivot/common/styles/mixins.less";
@nav-height: 84px;
@nav-search-height: 172px;
@foot-nav: 100px;
.workitems {
  /deep/.mescroll {
    height: auto;
    .px2rem(top, @nav-height);
    .px2rem(bottom, @foot-nav);
  }
  &.searching {
    /deep/.mescroll {
      .px2rem(top, @nav-search-height);
    }
  }
  &.single {
    /deep/.mescroll {
      bottom: 0;
    }
  }
  .toolbar {
    display: flex;
    align-items: center;
    background-color: #fff;
    .combine-search {
      flex: 1;
    }
  }
  .batch-toolbar {
    .px2rem(height, 88px);
    justify-content: space-between;
    .left {
      //margin-left:16px;
      .px2rem(margin-left, 32px);
    }
    .select-all {
      .px2rem(margin-left, 32px);
      .px2rem(font-size, 32px);
      color: @text-color-main;
    }
  }
  .batch-btn {
    //font-size: 0.4rem;
    .px2rem(font-size, 32px);
    color: @text-color-main;
    .px2rem(padding-top, 16px);
    .px2rem(padding-right, 32px);
    .px2rem(padding-bottom, 16px);
    .px2rem(padding-left, 0);
    //padding: 0.2rem 0.4rem 0.2rem 0rem;
    //display: inline-block;
  }
  .cancel-batch {
    color: @primary-color;
  }
  .bottom-control{
    position:absolute;
    z-index: 10;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    color: @text-color-main;
    .px2rem(font-size, 32px);
    //.px2rem(height, @foot-nav);
    //font-weight: 400;
    .px2rem(padding-top, 20px);
    .px2rem(padding-bottom, 20px);
    .px2rem(padding-left, 30px);
    .px2rem(padding-right, 30px);
    .backgroundline('top');
    background: @white-background;
    z-index: 10;
    //padding: 0 0.4rem;
    em{
      margin-left: 0.2rem;
    }
    // .num{
    //   margin-left: 0.4rem;
    // }
    .btn-batch{
      background-color: @primary-color;
      color: @white-background;
      .px2rem(width, 320px);
      .px2rem(height, 72px);
      .px2rem(line-height, 72px);
      .px2rem(border-radius, 40px);
      //border-radius: 20px;
      //padding: 0.2rem 0.8rem;
    }
  }
}
</style>
