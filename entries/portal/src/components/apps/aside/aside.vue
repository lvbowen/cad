<template>
  <aside class="aside" :style="{ width: `${dragWidth}px` }" :class="backgroundColor" >
    <a-layout-sider
      ref="slider"
      :trigger="null"
      theme="dark"
      collapsible
      collapsedWidth="52"
      v-model="isShow"
      class="aside-menu"
      :class="backgroundColor"
      width="100%"
    >
      <div
        :class="isShow ? 'aside-top hide-text' : 'aside-top'"
        v-if="curMenu === 'AggregationMenu'"
      >
        {{ $t("languages.common.workflowCenter") }}
      </div>
      <div
        :class="isShow ? 'aside-top hide-text' : 'aside-top'"
        v-else
        :title="isChinese ? menuTitle : menuTitleI18n[$i18n.locale]"
      >
        {{ isChinese ? menuTitle : menuTitleI18n[$i18n.locale] }}
      </div>
      <component :is="curMenu" :flatMenu="false" :noQueue="false"/>
      <!-- <workflow-center-menu/> -->
      <!-- <apps-menu/> -->
      <div :class="isShow ? 'hide-menu' : 'hide-menu open'" @click="hideMenu"></div>
    </a-layout-sider>
  </aside>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue, Watch} from "vue-property-decorator";

import {Layout} from "@h3/antd-vue";

import {namespace} from "vuex-class";

// import * as FlowCenter from '@cloudpivot/flow-center';
// import * as Application from '@cloudpivot/application';
// import AppsMenu from './menu/apps-menu.vue';
import common from "@cloudpivot/common";

// import WorkflowCenterMenu from '@cloudpivot/flow-center/src/components/pc/menu/workflow-center-menu.vue';

import OAuthApi from "@/apis/oauth";

import {AggregationMenu} from "../../../../extends/basicCustomComponent/index";

const WorkflowCenterModule = namespace("WorkflowCenter/WorkflowCenter");

@Component({
  name: "Aside",
  components: {
    ALayoutSider: Layout.Sider,
    // WorkflowCenterMenu: FlowCenter.components.pc.WorkflowCenterMenu,
    // AppsMenu: Application.components.pc.AppsMenu
    //WorkflowCenterMenu,
    AggregationMenu
    //AppsMenu
  }
})
export default class Aside extends Vue {
  @InjectReactive('project') projectCode?: string;
  @WorkflowCenterModule.State("asideTitle") asideTitle: any;

  @WorkflowCenterModule.State("asideTitleI18n") asideTitleI18n: any;

  // 判断当前是否是中文版本
  get isChinese() {
    return this.$i18n.locale === "zh";
  }

  // 侧边栏可拖拽初始宽度
  dragWidth: number = 200;

  startX: number = 200;

  // false 展开 true收起
  isShow: boolean = false;

  // curMenu: string = 'WorkflowCenterMenu';
  curMenu: string = "AggregationMenu";

  menuTitle: string = "流程中心";

  menuTitleI18n: any = {};

  backgroundColor: string = ""

  created() {
    this.backgroundColor = sessionStorage.getItem("BgColor") as string;
    OAuthApi.getTheme({appCode: this.projectCode ?? ''}).then(res => {
      this.backgroundColor = res.data.themeCode
    })
  }

  mounted() {
    this.switchMenu();
    // 拖拽功能
    this.$nextTick(() => {
      const dragLine: any = document.querySelector("#jDragLine");
      let that = this;
      let maxClientWidth;
      let minWidth;
      let maxWidth;
      dragLine.addEventListener(
        "mousedown",
        (e: any) => {
          maxClientWidth = document.body.clientWidth / 3;
          minWidth = that.dragWidth - 8;
          maxWidth = that.dragWidth + 8;
          document.body.setAttribute("unselectable", "on");
          document.body.setAttribute("onselectstart", "return false;");
          if (e.clientX >= minWidth && e.clientX <= maxWidth) {
            document.onmousemove = function (ev: any) {
              // 收缩的时候不允许拖拽
              if (that.isShow) return;
              that.dragWidth = ev.clientX;
              if (ev.clientX > maxClientWidth) {
                that.dragWidth = maxClientWidth;
              } else if (ev.clientX < that.startX) {
                that.dragWidth = that.startX;
              }
              common.utils.Bus.$emit("resize");
            };
            document.onmouseup = function () {
              document.body.removeAttribute("unselectable");
              document.body.removeAttribute("onselectstart");
              document.onmousemove = null;
              document.onmouseup = null;
            };
          }
        },
        false
      );
    });

    const curDom: any = this.$refs.slider;
    curDom.$el.addEventListener("transitionend", this.transitionendEvent, false);
  }

  transitionendEvent(e: any) {
    if (e.propertyName === "width") {
      common.utils.Bus.$emit("resize");
    }
  }

  beforeDestroy() {
    const curDom: any = this.$refs.slider;
    curDom.$el.removeEventListener("transitionend", this.transitionendEvent, false);
  }

  // 切换菜单
  switchMenu() {
    if (!this.$route) return;
    const {fullPath} = this.$route;
    const isWorkflowCenterRoute = fullPath.includes("workflow-center");
    const isApplicationRoute = fullPath.includes("application");
    if (isWorkflowCenterRoute) {
      //this.curMenu = 'WorkflowCenterMenu';
      this.curMenu = "AggregationMenu";
    } else if (isApplicationRoute) {
      //this.curMenu = 'AppsMenu';
      this.curMenu = "AggregationMenu";
      this.menuTitle = this.asideTitle;
      this.menuTitleI18n = this.asideTitleI18n;
    }
  }

  hideMenu() {
    this.isShow = !this.isShow;
    if (this.isShow) {
      this.dragWidth = 52;
      this.startX = 52;
    } else {
      this.dragWidth = 200;
      this.startX = 200;
    }
  }

  @Watch("$route")
  onRouterChange() {
    this.switchMenu();
  }

  @Watch("asideTitle")
  onAsideTitleChange(v: any) {
    if (v) {
      this.menuTitle = v;
    }
  }

  @Watch("asideTitleI18n")
  onAsideTitleI18nChange(v: any) {
    if (v) {
      this.menuTitleI18n = v;
    }
  }

  // @Watch('dragWidth')
}
</script>

<style lang="less">
@import "../../../styles/themes/default.less";

.ant-menu-vertical > .ant-menu-item, .ant-menu-vertical-left > .ant-menu-item, .ant-menu-vertical-right > .ant-menu-item,
.ant-menu-inline > .ant-menu-item,
.ant-menu-vertical > .ant-menu-submenu > .ant-menu-submenu-title, .ant-menu-vertical-left > .ant-menu-submenu > .ant-menu-submenu-title, .ant-menu-vertical-right > .ant-menu-submenu > .ant-menu-submenu-title,
.ant-menu-inline > .ant-menu-submenu > .ant-menu-submenu-title {
  height: 42px;
  line-height: 42px;
}

.ant-menu-submenu-title span img {
  margin: 0 0 0 -1px !important;
}

.ant-menu-submenu-vertical > .ant-menu-submenu-title span i {
  margin: 0 0 0 -5px !important;
}

.ant-menu-submenu-vertical > .ant-menu-submenu-title span img {
  margin: 0 0 0 -6px !important;
}

.ant-menu-vertical > .ant-menu-submenu > .ant-menu-submenu-title span span.search-flow,
.ant-menu-vertical > .ant-menu-submenu > .ant-menu-submenu-title span span,
.ant-menu-vertical-left > .ant-menu-submenu > .ant-menu-submenu-title span span,
.ant-menu-vertical-right > .ant-menu-submenu > .ant-menu-submenu-title span span {
  margin-left: 15px;
}

.ant-menu-submenu-selected > .ant-menu-submenu-title span span.search-flow,
.ant-menu-submenu-inline > .ant-menu-submenu-title span span.search-flow {
  margin-left: 0;
}

.ant-menu-submenu-inline > .ant-menu-submenu-title span span,
.ant-menu-submenu-inline > .ant-menu-submenu-open > .ant-menu-submenu-active.ant-menu-submenu-selected > .ant-menu-submenu-title span span {
  margin-left: 7px;
}

.aside {
  height: 100%;
  position: relative;
  overflow-y: scroll;
  //background: #001529;
  background-color: #064897;

  &::-webkit-scrollbar {
    width: 0;
  }

  .aside-menu {
    height: calc(100vh - 64px);
  }
  .aside-menu.Blue{
    background-color: #064897 !important;
  }

  .aside-top {
    width: 100%;
    height: 50px;
    overflow: hidden;
    padding: 0 14px 0 @base4-padding-xs;
    line-height: 50px;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
  }

  .hide-text {
    text-indent: -999px;
  }

  .hide-menu {
    width: 14px;
    height: 28px;
    line-height: 28px;
    border-radius: 2px 0px 0px 2px;
    position: absolute;
    top: 10px;
    right: 0;
    z-index: 10;
    background: url("../../../assets/icons/arrow-right.png") no-repeat center;
    background-color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
  }

  .open {
    background: url("../../../assets/icons/arrow-left.png") no-repeat center;
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected {
  background-color: unset;

  a {
    color: white !important;

    .icon {
      margin-right: @base4-padding-xs;
    }
  }
}

.ant-menu-item > a {
  & > .icon,
  & > span {
    height: 40px;
    vertical-align: top !important;
  }
}

.ant-menu-inline-collapsed-tooltip a {
  color: white !important;

  .icon {
    margin-right: @base4-padding-xs;
  }

  .ant-badge {
    margin-bottom: 3px;
  }
}

.ant-layout-sider {
  transition: unset !important;
}

// .ant-layout-sider-children {
//   margin-left: 4px;
// }
.ant-layout-sider-children {
  margin-left: 4px;
}

.Green {
  .ant-menu.ant-menu-dark .ant-menu-item-selected, .ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected {
    background: linear-gradient(90deg, #26D4C7, #05A2A6) !important;
  }

  .ant-menu, .ant-menu-inline, .ant-menu-root, .ant-menu-dark {
    background: transparent !important;
  }
}

.TecBlue {
  .ant-menu.ant-menu-dark .ant-menu-item-selected, .ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected {
    background: #064897 !important;
    background-size: 100% 100%;
  }

  .ant-menu, .ant-menu-inline, .ant-menu-root, .ant-menu-dark {
    background: transparent !important;
  }
}
</style>

<style lang="less" scoped>
.aside {
  .Blue {
    background-color: #064897;
  }

  .Green {
    background: rgb(5, 66, 83) !important;
    background-size: 100% 100% !important;
  }

  .TecBlue {
    background-color: #0A2154 !important;
  }
}
.aside.Green {
  background: rgb(5,66,83) !important;
  background-size: 100% 100% !important;
}
.aside.TecBlue{
  background:#0A2154 !important;

}
</style>
