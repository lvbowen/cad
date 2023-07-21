<template>
  <div class="nav-viewer">
    <!--<div class="nav-head">
      这是头部
    </div>-->
    <div :class="['nav-viewer__box', { normal: !showNav }]">
      <router-view class="nav-viewer__wrap" @getMomentStatus="getMomentStatus"/>
    </div>

    <div class="nav-viewer__bar" v-show="showNav">
      <router-link to="/business" tag="div">
        <span class="nav-img">
          <img
            class="defaultIcon"
            src="../../extends/Img/img/bottom_icon_home.png"
            alt=""
          />
          <img
            class="activeIcon"
            src="../../extends/Img/img/bottom_icon_home_pre.png"
            alt=""
          />
        </span>
        <p>首页</p>
      </router-link>
      <router-link to="/mailList" tag="div">
        <span class="nav-img">
          <img
            class="defaultIcon"
            src="../../extends/Img/img/bottom_icon_maillist.png"
            alt=""
          />
          <img
            class="activeIcon"
            src="../../extends/Img/img/bottom_icon_maillist_pre.png"
            alt=""
          />
        </span>
        <p>通讯录</p>
      </router-link>
      <router-link to="/homePage" tag="div">
        <span class="nav-img" @click="markAboutMeAsRead">
          <template v-if="likeAndCommentCount === 0 && momentStatusCount === 0">
            <img
              class="defaultIcon"
              src="../../extends/Img/img/bottom_icon_workbench.png"
              alt=""
            />
            <img
              class="activeIcon"
              src="../../extends/Img/img/bottom_icon_workbench_pre.png"
              alt=""
            />
          </template>
          <Badge
            v-else-if="likeAndCommentCount!==0"
            :content="likeAndCommentCount"
            max="99">
            <img
              class="defaultIcon"
              src="../../extends/Img/img/bottom_icon_workbench.png"
              alt=""
            />
            <img
              class="activeIcon"
              src="../../extends/Img/img/bottom_icon_workbench_pre.png"
              alt=""
            />
          </Badge>
          <Badge dot v-else>
            <img
              class="defaultIcon"
              src="../../extends/Img/img/bottom_icon_workbench.png"
              alt=""
            />
            <img
              class="activeIcon"
              src="../../extends/Img/img/bottom_icon_workbench_pre.png"
              alt=""
            />
          </Badge>
        </span>
        <p>项目圈</p>
      </router-link>
      <!--      <router-link to="/notice" tag="div">-->
      <!--        <span class="nav-img" style="margin-top: 15px">-->
      <!--          <Badge-->
      <!--            v-if="messageCount!==0"-->
      <!--            :content="messageCount"-->
      <!--            max="99">-->
      <!--            <img-->
      <!--              class="defaultIcon"-->
      <!--              src="../../extends/Img/img/bottom_icon_news.png"-->
      <!--              alt=""-->
      <!--            />-->
      <!--            <img-->
      <!--              class="activeIcon"-->
      <!--              src="../../extends/Img/img/bottom_icon_news_pre.png"-->
      <!--              alt=""-->
      <!--            />-->
      <!--          </Badge>-->
      <!--          <img-->
      <!--            v-if="messageCount===0"-->
      <!--            class="defaultIcon"-->
      <!--            src="../../extends/Img/img/bottom_icon_news.png"-->
      <!--            alt=""-->
      <!--          />-->
      <!--          <img-->
      <!--            v-if="messageCount===0"-->
      <!--            class="activeIcon"-->
      <!--            src="../../extends/Img/img/bottom_icon_news_pre.png"-->
      <!--            alt=""-->
      <!--          />-->
      <!--          <p>消息</p>-->
      <!--        </span>-->


      <!--      </router-link>-->
      <router-link to="/MyIndex/MyIndex" tag="div">
        <span class="nav-img">
          <img
            class="defaultIcon"
            src="../../extends/Img/img/bottom_icon_my.png"
            alt=""
          />
          <img
            class="activeIcon"
            src="../../extends/Img/img/bottom_icon_my_pre.png"
            alt=""
          />
        </span>
        <p>我的</p>
      </router-link>
      <!-- <router-link
        v-for="router of extendNavRoutes"
        :to="router.path"
        tag="div"
        :key="router.path">
        <span class="nav-img"> -->
      <!--<i class="icon aufontAll h-icon-all-home-o"></i>
          <i class="icon active aufontAll h-icon-all-home"></i>-->
      <!-- <img class="defaultIcon" :src="router.default" alt=""/>
          <img class="activeIcon" :src="router.active" alt=""/>
        </span>
        <p>{{ $t(`${router.locale}`) }}</p>
      </router-link> -->
      <!-- <router-link to="/setting" tag="div" v-if="isShowSetting">
        <span>
          <i class="icon aufontAll h-icon-all-setting-o"></i>
          <i class="icon active aufontAll h-icon-all-setting"></i>
        </span>
        <p>{{ $t('languages.common.settings') }}</p>
      </router-link> -->
      <!--<router-link to="/home" tag="div">
        <span>
          <i class="icon aufontAll h-icon-all-home-o"></i>
          <i class="icon active aufontAll h-icon-all-home"></i>
        </span>
        <p>{{ $t('languages.common.homePage') }}</p>
      </router-link>
      <router-link to="/apps" tag="div">
        <span>
          <i class="icon aufontAll h-icon-all-appstore-o"></i>
          <i class="icon active aufontAll h-icon-all-appstore"></i>
        </span>
        &lt;!&ndash;<p>{{ $t('languages.common.apps') }}</p>&ndash;&gt;
        <p>{{ $t('languages.common.business') }}</p>
      </router-link>
      &lt;!&ndash;<router-link to="/my-instances" tag="div">
        <span>
          <i class="icon aufontAll h-icon-all-process-o"></i>
          <i class="icon active aufontAll h-icon-all-process"></i>
        </span>
        <p>{{ $t('languages.common.workflows') }}</p>
      </router-link>&ndash;&gt;

      <router-link
        to="/setting"
        tag="div"
        v-if="isShowSetting"
      >
        <span>
          <i class="icon aufontAll h-icon-all-setting-o"></i>
          <i class="icon active aufontAll h-icon-all-setting"></i>
        </span>
        <p>{{ $t('languages.common.settings') }}</p>
      </router-link>-->
    </div>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue, Watch} from "vue-property-decorator";
import {Badge} from "vant";
import {utils} from "@cloudpivot/common";

import routes from "@/routes";
import {CustomerComponentRouters, CustomerRouter} from "../../extends/type";
import * as Api from "../../extends/service/api";
import {getProjectMomentStatus} from "../../extends/businessComponent/service/index.js"
import bimDefault from "@/assets/extends/bimDefault.png";
import bim from "@/assets/extends/bim.png";
import homeDefault from "@/assets/extends/homePageDefault.png";
import home from "@/assets/extends/homePage.png";
import businessDefault from "@/assets/extends/businessDefault.png";
import business from "@/assets/extends/business.png";
import myIndexDefault from "@/assets/extends/myIndexDefault.png";
import myIndex from "@/assets/extends/myIndex.png";
import mobile from "@cloudpivot/form/src/renderer/components/mobile";
import Bim from "../../extends/businessComponent/BIM/BIM";

interface filterRoutes extends CustomerRouter {
  default?: string;
  active?: string;
}

@Component({
  name: "NavViewer",
  components: {Badge},
})
export default class NavViewer extends Vue {
  @InjectReactive('projectConfig') projectConfig;
  @InjectReactive('project') projectCode;

  @Watch('projectConfig', {deep: true})
  changeUnReadMessageCount() {
    this.getUnReadMessageCount()
  }

  // 是否展示底部导航栏
  showNav: boolean = true;

  //new added
  private extendNavRoutes: Array<CustomerComponentRouters | CustomerRouter> =
    [];
  private imgMap: Map<string, { [propertyName: string]: string }> = new Map([
    //   ["home", { defaultImg: homeDefault, activeImg: home }],
    //   ["business", { defaultImg: businessDefault, activeImg: business }],
    //   ["bim", { defaultImg: bimDefault, activeImg: bim }],
    //   ["apps", { defaultImg: businessDefault, activeImg: business }],
    //   ["myIndex", { defaultImg: myIndexDefault, activeImg: myIndex }],
  ]);
  private messageCount: number = 0;
  private momentStatusCount: number = 0;
  private likeAndCommentCount: number = 0;

  //end

  get isShowSetting() {
    return this.$store.state.config.multiLanguageSwitch;
  }

  created() {
    utils.Bus.$on("toggleNavbar", (val: boolean) => {
      this.showNav = val;
    });
  }

  mounted() {
    const {imgMap} = this;
    //new add
    const filterRoutesList = (routes as Array<unknown>)
      .filter((item: CustomerRouter) => item.isNav)
      .sort(
        (a: CustomerRouter, b: CustomerRouter) =>
          (a?.navIndex as number) - (b?.navIndex as number)
      ) as Array<CustomerRouter>;
    filterRoutesList.forEach((item: filterRoutes) => {
      // const { defaultImg, activeImg } = imgMap.get(item.name) as {
      //   [propertyName: string]: string;
      // };
      // item.default = defaultImg;
      // item.active = activeImg;
    });
    this.extendNavRoutes = filterRoutesList;
    this.getUnReadMessageCount();
    this.getMomentStatus();
  }

  getUnReadMessageCount() {
    Api.getUnReadMessageCount({
      projectCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    }).then(res => {
      if (res.errcode === 0) this.messageCount = res.data;
    })
  }

  markAboutMeAsRead() {
    this.getUnReadMessageCount();
    this.getMomentStatus();
  }

  getMomentStatus() {
    getProjectMomentStatus(this.projectCode ?? '', this.projectConfig?.projectName).then(res => {
      this.likeAndCommentCount = res.data.likeAndCommentCount;
      this.momentStatusCount = res.data.momentStatusCount;
    })
  }

  beforeDestroy() {
    utils.Bus.$off("toggleNavbar");
  }
}
</script>

<style lang="less">
@import "~@/styles/index.less";

@foot-height: 100px;
.nav-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  background: @main-background;

  &__box {
    flex: 1;
    height: 100%;
    .px2rem(padding-bottom, @foot-height);
    overflow: hidden;

    &.normal {
      padding-bottom: 0;
    }
  }

  &__wrap {
    height: inherit;
    overflow-y: auto;
  }

  // todo ios flex布局在iOS上点击透传兼容问题，目前用absolute避免；
  .nav-viewer__bar {
    position: absolute;
    z-index: 10;
    bottom: 0;
    display: flex;
    align-items: center;
    width: 100%;
    //.px2rem(height, @foot-height);
    height: 13.06666vw;
    font-weight: 400;
    background: @white-background;
    // background: #004898;
    z-index: 10;
    .backgroundline("top");

    & > div > p {
      .px2rem(font-size, 20px) !important;
      margin: 0;
      // color: #1481FF;
    }

    div {
      // .px2rem(padding-top, @vertical-padding-md);
      // .px2rem(padding-bottom, @vertical-padding-md);
      flex: 1;
      display: block;
      text-align: center;
      font-weight: bold;
      //color: #2c3e50;
      // color: #99b6d6;
      //color: #333;
    }

    span {
      display: inline-block;
      .px2rem(min-height, @line-height-xxs);
    }

    img {
      width: 6.6666vw;
      height: 6.6666vw;
      margin-bottom: 5px
    }

    i {
      .px2rem(font-size, @line-height-xxs);

      &.active {
        display: none;
      }
    }

    .defaultIcon {
      display: inline-block;
    }

    .activeIcon {
      display: none;
    }

    .router-link-active {
      .defaultIcon {
        display: none;
      }

      .activeIcon {
        display: inline-block;
      }

      i {
        display: none;
      }

      i.active {
        display: inline-block;
      }

      //color: @primary-color;
      color: #1481FF;
    }
  }
}

.nav-head {
  position: fixed;
  z-index: 99;
  width: 100vw;
  display: flex;
  align-items: center;
  background-color: #fff;
  height: 11.73333vw;
  box-shadow: 0 0.266667vw 0.53333vw 0 rgba(0, 0, 0, 0.09);
}
</style>
