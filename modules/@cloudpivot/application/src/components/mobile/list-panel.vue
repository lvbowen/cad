<template>
  <div class="app-list">
    <empty v-if="isEmpty"/>
    <div class="app-list__container" v-else>
      <!--:loadMore="loadMore"-->
      <h3-scroll
        ref="scroll"
        :loadMore="onlyLoadCHApps"
        :pageSize="pageSize"
      >
        <!-- 最近使用 -->
        <biz-models
          class="app-list__recent"
          :title="$t('cloudpivot.application.mobile.RecentlyUsed')"
          :list="recentBizModel"
          :collapsable="true"
          :col="4"
          @onItem="goFormList"
        />

        <div class="app-list__wrap">
          <!--<apps-list
            :list="appList"
            colorKey="code"
            displayName="displayName"
            @toggle="selectSideItem"
          />-->
          <!--<item-list
               class="app-item__main"
               :appItem="appItem"
               v-show="!showSearchPanel && !loading"
               @onItem="goFormList"
           />-->
          <router-view
            :wrapperClass="`content`"
            :menuCardClass="`menuCard`"
            :cardClass="`card`"
            :menuData="appItem"
            :go2Page="goFormList"
            :go2Next="goNextLevel"
            :onlyShowFirst="onlyShowFirst"
            :firstSize="14"
            :leaveMenu="onlyLoadCHApps"
          ></router-view>
          <!--<FlatMenu
              :wrapper-class="`content`"
              :menu-card-class="`menuCard`"
              :card-class="`card`"
              :menu-data="appItem"
              :go2-page="goFormList"
              :only-show-first="true"
              :first-size="14"
          />-->
          <!-- <side-bar
            :staticStyle="true"
            :list="appList"
            :current="currentIdx"
            displayName="displayName"
            @toggle="selectSideItem"
          />
          <app-content
            class="app-list__content"
            v-if="currentApp"
            :app="currentApp"
          /> -->
        </div>
      </h3-scroll>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins, InjectReactive } from 'vue-property-decorator';

import { Mutation } from 'vuex-class';

import mobile from '@cloudpivot/form/src/renderer/components/mobile';

import OpenFormMixin from './open-form';

import { listApi } from '@cloudpivot/api';

import common from '@cloudpivot/common/mobile';

// import AppContent from './app-content.vue';

import BizModels from './app-models.vue';

import { FlatMenu } from '@ctesi/component';

@Component( {
  name: 'app-list',
  components: {
    Empty: common.components.Empty,
    // SideBar: common.components.Sidebar,
    AppsList: common.components.AppsList,
    // AppContent,
    BizModels,
    H3Scroll: mobile.H3Scroll,
    ItemList: common.components.ItemList,
    //new add
    FlatMenu,
  }
} )
export default class AppList extends Mixins( OpenFormMixin ) {
  @Mutation( 'setAppName' ) setAppName!: any;

  @InjectReactive( 'title' ) projectTitle?: string;

  // loading: boolean = true;

  isEmpty: boolean = false;

  appList: any[] = [];

  //new Add
  appCode: string | null = null;

  appItem: any = [];

  showSearchPanel: boolean = false;

  loading: boolean = true;

  onlyShowFirst: boolean = true;
  //end

  recentBizModel: any[] = [];

  activeCode: string = '';

  currentApp: any = null;

  currentIdx: number = 0;

  pageSize: number = 24;

  page: number = 1;

  sourceList: any = [];

  // 是否已加载过至少一次第一页数据
  firstTimeLoad: boolean = false;

  beforeMount() {

    this.getRecentBizModel();

  }


  load( flag?: boolean ) {
    if ( flag ) {
      this.loading = false;
      this.$h3.toast.hide();
    } else {
      this.loading = true;
      this.$h3.toast.show( {
        text: '正在加载',
        iconType: 'loading'
      } );
    }
  }

  loadAppItem( done?: Function ) {
    const params = {
      appCode: this.appCode as string,
      isMobile: true
    }
    listApi.getFolder( params ).then( ( res: any ) => {
      if ( Array.isArray( res.data ) ) {
        res.data.forEach( ( d: any ) => {
          d.open = false;
        } );
        this.appItem = res.data;
        // console.log('this.appItem', this.appItem);
        this.currentApp = {
          code: this.appCode
        };
      }
      this.$nextTick( () => {
        if ( done && typeof (done) === 'function' ) done( 10, 10 );
        this.load( true );
      } )

    } );
  }

  onlyLoadCHApps( page: number, done: Function ) {
    this.load();
    listApi.list( { isMobile: true } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( Array.isArray( res.data ) && res.data.length ) {
        this.sourceList = res.data.map( ( item: any ) => {
          item.displayName = common.utils.BusinessFunctions.getLangName( item );
          return item
        } );
        this.appList = this.sourceList.slice( 0, this.pageSize );
        this.$emit( 'setAppList', this.sourceList );
      }
    } ).then( res => {
      const { appList } = this;
      const targetApp = appList.find( item => item.name === this.projectTitle );
      if ( targetApp ) {
        this.selectSideItem( targetApp, true );
        this.appCode = targetApp.code;
        this.$nextTick( () => {
          this.onlyShowFirst = true;
        } );
        this.loadAppItem( done );
      }
    } )
  }

  goNextLevel( menu: any ) {
    this.appItem = menu.children;
    this.onlyShowFirst = false;
    this.$router.push( { name: 'eachWorkbench' } );
  }

  async loadMore( page: any, done: any ) {
    const vm: any = this;
    if ( !vm.firstTimeLoad ) {
      listApi.list( { isMobile: true } ).then( ( res: any ) => {
        if ( Array.isArray( res.data ) && res.data.length ) {
          vm.sourceList = res.data.map( ( item: any ) => {
            item.displayName = common.utils.BusinessFunctions.getLangName( item );
            return item
          } );
          vm.appList = vm.sourceList.slice( 0, vm.pageSize );
          vm.$emit( 'setAppList', vm.sourceList );
          /* new Add */
          this.$nextTick( () => {
            //new Add 手动设置appCode
            this.load();
            const { appList } = this;
            const targetApp = appList.find( item => item.name === this.projectTitle );
            console.log( targetApp );
            //if(targetApp) this.selectSideItem(targetApp);
            if ( targetApp ) {
              this.selectSideItem( targetApp, true );
              this.appCode = targetApp.code;
              this.loadAppItem();
            }
          } )
          /* end */
          // 这块代码不知作用-暂且保留
          // this.$nextTick(() => {
          //   const appcode: any = sessionStorage.getItem('modelSouceApp');
          //   if (appcode && res.data.some((app: any) => app.code === appcode)) {
          //     this.activeCode = appcode;
          //     this.selectApp(appcode);
          //     sessionStorage.removeItem('modelSouceApp');
          //   } else {
          //     this.activeCode = res.data[0].code;
          //     this.selectApp(this.activeCode);
          //   }
          //   this.load(true);
          // });
        } else {
          vm.isEmpty = true;
        }
        if ( done ) {
          done( vm.pageSize, vm.sourceList.length );
        }
        vm.firstTimeLoad = true;
      } );
      return
    }
    vm.page = page.num;
    if ( page.num === 1 ) {
      // this.appList = this.sourceList.slice(0, this.pageSize);
      if ( done ) {
        done( vm.pageSize, vm.sourceList.length );
      }
      return;
    }
    if ( done ) {
      const delay = setTimeout( () => {
        clearTimeout( delay );
        // TODO: Upgrade 6.2.10
        /*const appCurrentNum = vm.appList.length
        if(appCurrentNum >= vm.sourceList.length) {
          done(vm.pageSize, vm.sourceList.length);
          return
        }*/
        vm.appList = vm.appList.concat( vm.sourceList.slice( (vm.page - 1) * vm.pageSize, vm.page * vm.pageSize ) );
        done( vm.pageSize, vm.sourceList.length );
      }, 500 );
    }
  }

  getRecentBizModel() {

    listApi.listRecentBizModel().then( ( res: any ) => {
      // console.log('最近使用的模型', res);
      if ( Array.isArray( res.data ) && res.data.length ) {
        /* NOTE: 最多展示4个模型 */
        this.recentBizModel = res.data.filter( Boolean ).slice( 0, 4 );
      }
    } );
  }

  selectSideItem( app: any, blockEmit?: boolean ) {
    // console.log('selectSideItem', app);
    this.activeCode = app.code;
    // this.selectApp(app.code);
    // 跳转应用详情
    const name = common.utils.BusinessFunctions.getLangName( app );
    this.setAppName( name );
    if ( !blockEmit ) this.$emit( 'goAppItem', app.code );
  }

  mounted() {
    this.$router.push( { name: 'workbench' } );
  }

}
</script>
<style lang="less">
//new FlatMenu
.flex() {
  display: flex;
}

.textEllipsis() {
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  white-space: nowrap !important;
}

.content {
  .flex;
  flex: 1;
  //flex-direction: column;
  flex-wrap: wrap;
  background-color: #FFF;
  //padding-top: 25px;
  //overflow-y: auto;
  align-content: flex-start;
  padding-bottom: 2.66667vw;

  & > .card {
    //margin-right: 21px;
    margin-right: 8.6667vw;
  }

  & > aside[card-role=single]:last-of-type {
    //margin-bottom: 42px;
    //margin-bottom: 10.66666vw;
    margin-bottom: 9.86666vw;
    //margin-bottom: 1.4vw;
  }

  & > .menuCard {
    margin-left: 3.73333vw;
    margin-right: 3.73333vw;

    & > nav {
      border-bottom: 1px solid #E8E8E8;
      height: 9.86666vw;

      & > aside:first-child {
        display: none;
      }

      & > aside:last-child {
        display: flex;
      }
    }
  }

  & > .firstMenu:nth-child(4n+1) {
    & > aside {
      background-color: #0999F0;
    }
  }

  & > .firstMenu:nth-child(4n+2) {
    & > aside {
      background-color: #19BE6C;
    }
  }

  & > .firstMenu:nth-child(4n+3) {
    & > aside {
      background-color: #FFA800;
    }
  }

  & > .firstMenu:nth-child(4n+4) {
    & > aside {
      background-color: #545EEC;
    }
  }
}

.card {
  .flex;
  flex-direction: column;
  width: 15.6vw;
  margin-top: 4vw;

  & > i {
    width: 9.3333vw;
    height: 9.3333vw;
    overflow: hidden;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 2.5333vw;

    & > img {
      width: 100%;
      height: 100%;
    }
  }

  & > span {
    font-size: 3.2vw;
    font-family: PingFang SC;
    font-weight: 500;
    color: #666666;
  }
}

.menuCard {
  .flex;
  flex-direction: column;
  width: 100%;
  //margin-bottom: 42px;
  //margin-bottom: 10.66666vw;
  margin-bottom: 9.86666vw;
  //transition: margin-bottom 0s;
  transition: all .6s;
  //max-height: 2000px;
  max-height: 666.666666vw;


  & > nav {
    //min-height: 9.86666vw;
    //height: 9.86666vw;
    .flex;
    align-items: center;
    //padding: 6px 3px;
    padding: 2.26667vw 0;
    //border-bottom: 1px solid #99999952;
    cursor: pointer;
    //margin-bottom: 20px;

    & > aside > i > img {
      transition: all .3s;
    }

    & > aside:first-child {
      margin-right: 1.46666vw;
    }

    & > span {
      font-size: 4vw;
      font-family: PingFang SC;
      font-weight: bold;
      color: #222222;
    }

    & > aside:last-child {
      margin-left: auto;
      //margin-right: 10px;
      margin-right: 1.06666vw;
      display: none;

      & > i {
        .flex;
        align-items: center;
        width: 2.4vw;
        height: 2.4vw;

        & > img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  & > article {
    .flex;
    flex-wrap: wrap;
    height: auto;
    width: 100%;
    flex: 1;
    overflow: hidden;
    transition: all .3s;

    & > .card {
      margin-right: 21px;
    }
  }
}

.titleBarge {
  .flex;
  width: 0.53333vw;
  height: 3.2vw;
  background: #004898;
}

div[action-role='narrow'] {
  max-height: 0;
  //margin-bottom: 9.86666vw;
  & > nav > aside > i > img {
    transform: rotate(180deg);
  }

  & > article {
    flex: 0;
    height: 0;
  }
}

.workbench {
  .flex;
  align-items: center;
  width: 100%;
  margin-left: 3.2vw;
  margin-right: 3.2vw;
  padding-top: 2.6667vw;
  padding-bottom: 2.6667vw;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 2vw;

  & > span {
    font-size: 4vw;
    font-family: PingFang SC;
    font-weight: bold;
    color: #222222;
  }
}

.firstMenu {
  .flex;
  flex-direction: column;
  width: 20vw;
  height: 16vw;
  //background-color: yellow;
  margin-top: 2.66667vw;

  & > aside {
    .flex;
    margin-left: auto;
    margin-right: auto;
    width: 10.66667vw;
    height: 10.66667vw;
    border-radius: 50%;
    margin-top: auto;
    margin-bottom: 1.6vw;
    //background-color: red;
    & > i {
      .flex;
      width: 6.6667vw;
      height: 6.6667vw;
      margin: auto;
      overflow: hidden;

      & > img {
        width: 100%;
        height: 100%;
      }
    }
  }

  & > span {
    font-size: 3.2vw;
    font-family: PingFang SC;
    font-weight: 500;
    color: #666666;
    .textEllipsis;
    padding-left: 1.3333vw;
    padding-right: 1.3333vw;
  }

}

.loadMore {
  .firstMenu;

  & > aside {
    background-color: #bbbbbb;

    & > i {
      .flex;
      width: 6.6667vw;
      height: 6.6667vw;
      margin: auto;
      overflow: hidden;

      & > img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>

<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";

.app-list {
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  overflow: hidden;

  /deep/ .empty {
    width: 100%;
    text-align: center;
  }

  &__container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;

    /deep/ .mescroll {
      height: auto;
      .px2rem(top, 88px);
      .px2rem(bottom, 100px);
    }
  }

  &__recent {
    flex: none;
    margin-top: 0;
    border-radius: 0;
    position: relative;
    .hairline("top", #e6ebf6);
  }

  &__wrap {
    flex: 1;
    display: flex;
    align-items: flex-start;
    width: 100%;
    background: #fff;
  }

  &__content {
    flex: 1;
    height: 100%;
    overflow-y: auto;
  }

  & .app-item__main {
    width: 100%;
  }
}
</style>
