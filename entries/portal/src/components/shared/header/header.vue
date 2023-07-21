<template>
  <div class="header common-header" :class="backgroundColor">
    <!--    <div class="logo" @click="goHome">-->
    <div class="logo">
      <img :src="projectLogo" alt/>
      <!--<a class="open-blank" v-if="isDingTalk" @click="openBlank">在浏览器中打开</a>-->
      <span>{{ projectTitle }}</span>
      <!--      <span>{{ projectConfig.projectName }}</span>-->
      <span v-if="subtitle"> - {{ subtitle }}</span>
      <div class="select" v-if="projectConfig.multiProjectFlag" :style="{display : selectIsShow}">
        <a-tree-select
          v-model="projectSelect"
          @select="treeSelect"
          style="width: 100%"
          :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
          :treeData="treeData"
          placeholder="Please select"
          labelInValue
          treeDefaultExpandAll
          dropdownMatchSelectWidth
        >
        </a-tree-select>
      </div>
    </div>

    <div class="header-right">
      <div class="menu">
        <ul>
          <!--<application-header ref="applications" />-->
          <HeaderMenu :key="markKey"/>
          <img
            @click="showDrawer"
            class="theme"
            src="../img/theme.png"
            alt="">
          <a-drawer
            title="主题"
            placement="right"
            :closable="false"
            :visible="visible"
            @close="onClose"
            width="400"
          >
            <h5>颜色</h5>
            <div class="themeColor">
              <span @click="isClickColor('Blue')">
                <i :style="{opacity: choiceColor == 'Blue'? 1 : 0 }" class="icon aufontAll h-icon-all-check"></i>
              </span>
              <span @click="isClickColor('Green')">
                <i :style="{opacity: choiceColor == 'Green'? 1 : 0 }" class="icon aufontAll h-icon-all-check"></i>
              </span>
              <span @click="isClickColor('TecBlue')">
                <i :style="{opacity: choiceColor == 'TecBlue'? 1 : 0 }" class="icon aufontAll h-icon-all-check"></i>
              </span>
            </div>
            <h5>外观</h5>
            <img src="../img/appearance.png" alt="">
            <div
              :style="{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e8e8e8',
                padding: '10px 16px',
                textAlign: 'right',
                left: 0,
                background: '#fff',
                borderRadius: '0 0 4px 4px',
              }"
            >
              <el-button style="marginRight: 8px" @click="onClose">
                取消
              </el-button>
              <el-button type="primary" @click="Submit">
                确认
              </el-button>
            </div>
            <transition name="Fade">
              <div v-if="appearanceShow" class="viewTemplate">
                <img :src="ThemeTemplate" alt="">
              </div>
            </transition>
          </a-drawer>

          <img
            src="../../../assets/extends/search.png"
            alt="全局搜索"
            class="search-icon"
            @click="$router.push('/GlobalSearch')">
          <a-badge
            :count="infoNum"
            title="我的待办"
            @click="toMyWorkitem"
            :numberStyle="{cursor:'pointer',marginRight: '15px',boxShadow: '0 0 0 0 #fff'}">
            <img
              style="cursor:pointer;width: 28px;margin-right: 20px"
              src="../../../assets/extends/icon/myMessage.png"
              alt=""
              @click="toMyWorkitem"
            />
          </a-badge>
          <a
            v-if="enhanced"
            :title="projectTitle"
            href="http://cjhd.ctesi.com.cn/"
            target="_blank">
            <img
              style="margin-right: 11px;"
              src="../../../assets/extends/icon/icon_yc.png"
              alt=""
            />
          </a>
          <li>
            <a-dropdown :trigger="['click']">
              <div class="user-info">
                <div class="avatar-box">
                  <img
                    v-if="userInfo.imgUrl && userInfo.imgUrl.includes('http')"
                    :src="userInfo.imgUrl"
                  />
                  <img v-else-if="userInfo.imgUrl" :src="getDownloadUrl(userInfo.imgUrl)"/>
                  <!-- <img v-if="userInfo.imgUrl" :src="userInfo.imgUrl" /> -->
                  <i v-else class="icon aufontAll h-icon-all-normal_smile default-avatar"></i>
                  <span>{{ userInfo.name }}</span>
                  <i class="icon aufontAll h-icon-all-caret-down"></i>
                </div>
              </div>
              <div class="info-box" slot="overlay">
                <ul>
                  <li class="user" @click="toUserInfo">
                    <div class="user-name">
                      <span>{{ userInfo.name }}</span>
                      <span class="mobile">{{ userInfo.mobile }}</span>
                    </div>
                  </li>
                  <!--v-if="isAdmin"-->
                  <li>
                    <a @click="toAdmin">
                      <i class="icon aufontAll h-icon-all-disassembly-o"></i>
                      {{ $t("languages.common.backStageManager") }}
                    </a>
                  </li>
                  <!-- <li>
                    <a @click="toUserInfo">
                      <i class="icon aufontAll h-icon-all-team-singlechoice-o"></i>
                      {{ $t('languages.common.personalInfo') }}
                    </a>
                  </li>-->
                  <li v-if="isShowToggle">
                    <a @click="toggleLanguage" class="toggle-lang">
                      <i class="icon aufontAll h-icon-all-swap-o"></i>
                      {{ $t("languages.common.switch") }}
                      <span :class="$i18n.locale === 'zh' ? 'active' : ''">中</span> /
                      <span :class="$i18n.locale === 'en' ? 'active' : ''">En</span>
                    </a>
                  </li>
                  <!-- <li v-if="isCloudPivot">
                    <a @click="showModal = true">
                      <i class="icon aufontAll h-icon-all-key-o"></i>
                      {{ $t('languages.common.changePwd') }}
                    </a>
                  </li>-->
                  <li v-if="isShowUpdatePwdBtn">
                    <a @click="showModal = true">
                      <i class="icon aufontAll h-icon-all-key-o"></i>
                      {{ $t("languages.common.changePwd") }}
                    </a>
                  </li>
                  <!-- <li>
                    <a href="http://help.cloudpivot.cn/" target="_blank">
                      <i class="icon aufontAll h-icon-all-question-circle-o"></i>
                      {{ $t("languages.common.helpCenter") }}
                    </a>
                  </li>-->
                  <li v-if="!isDingTalk">
                    <a @click="logout">
                      <i class="icon aufontAll h-icon-all-poweroff-o"></i>
                      {{ $t("languages.common.exitSys") }}
                    </a>
                  </li>
                  <li>
                    <a @click="$router.push('/HelpDoc')">
                      <i class="icon aufontAll h-icon-all-list-work"></i>
                      帮助文档
                    </a>
                  </li>
                </ul>
              </div>
            </a-dropdown>
          </li>
        </ul>
      </div>
    </div>

    <!-- 修改密码 -->
    <a-modal
      v-model="showModal"
      :title="$t('languages.common.changePwd')"
      :width="422"
      :cancelText="$t('languages.common.cancel')"
      :okText="$t('languages.common.ok')"
      @ok="changePwd"
      @cancel="cancel"
      :maskClosable="false"
      :keyboard="false"
    >
      <a-row class="row-flex" :class="{ 'err-input': oldPwdErrTips }" type="flex">
        <a-col class="required" :span="5">{{ $t("languages.common.oldPwd") }}</a-col>
        <a-col :span="19">
          <a-input v-model="params.oldPwd" type="password"/>
          <p class="err-tips" v-if="oldPwdErrTips">{{ oldPwdErrTips }}</p>
        </a-col>
      </a-row>
      <a-row class="row-flex" :class="{ 'err-input': newPwdErrTips }" type="flex">
        <a-col class="required" :span="5">{{ $t("languages.common.newPwd") }}</a-col>
        <a-col :span="19">
          <a-input v-model="params.newPwd" type="password"/>
          <p class="err-tips" v-if="newPwdErrTips">{{ newPwdErrTips }}</p>
        </a-col>
      </a-row>
      <a-row class="row-flex" :class="{ 'err-input': surePwdErr }" type="flex">
        <a-col class="required" :span="5">{{ $t("languages.common.surePwd") }}</a-col>
        <a-col :span="19">
          <a-input v-model="params.surePwd" type="password"/>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script lang="ts">

import {Component, InjectReactive, Prop, Vue, ProvideReactive, Inject} from "vue-property-decorator";

import Application from "@cloudpivot/application/pc";

import {Col, Dropdown, Input, Modal, Row, Select, TreeSelect, Badge,Drawer} from "@h3/antd-vue";
import 'ant-design-vue/lib/drawer/style/index.css'
import {namespace} from "vuex-class";

import OAuthApi from "@/apis/oauth";
import {homeApi} from '@cloudpivot/api';
import env from "@/config/env";
import site from "@/config/site";
//CustomComponent
import {HeaderMenu} from "../../../../extends/basicCustomComponent/index";
import {ProjectConfig} from "../../../../extends/type";
import {ProjectLevel} from '../../../../extends/constant';
import LoginHelper from "../../../views/login/loginHelper";
import blueImg from "../img/Blue.png"
import GreenImg from "../img/Green.png"
import TecBlueImg from "../img/TecBlue.png"

const icon = require("@/assets/icons/appicon.svg");

const WorkflowCenterModule = namespace("WorkflowCenter/WorkflowCenter");

const SystemModule = namespace("System/System");

@Component({
  name: "common-header",
  components: {
    ADropdown: Dropdown,
    [Modal.name]: Modal,
    ABadge: Badge,
    AInput: Input,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ApplicationHeader: Application.ApplicationHeader,
    HeaderMenu: HeaderMenu,
    ATreeSelect: TreeSelect,
    [Drawer.name]:Drawer
  }
})
export default class CommonHeader extends Vue {
  @WorkflowCenterModule.Mutation("setAsideTitle") setAsideTitle: any;

  @WorkflowCenterModule.Mutation("setUserId") setUserId: any;

  @SystemModule.State("isAdmin") isAdmin: any;

  @SystemModule.Mutation("setIsAdmin") setIsAdmin: any;

  @SystemModule.Mutation("setAdmin") setAdmin: any;

  @SystemModule.Mutation("setRootAdmin") setRootAdmin: any;

  @InjectReactive('project') projectCode?: string;

  @InjectReactive('single') isSingleProject?: boolean;

  @InjectReactive('singleHost') hostAddr?: string;

  @InjectReactive('title') projectTitle?: string;

  @InjectReactive('logo') projectLogo?: string;

  @InjectReactive('projectConfig') projectConfig?: ProjectConfig;

  @Inject()
  routerRefresh!: Function;

  @Inject()
  reload!: Function;

  private enhanced: boolean = window.projectRoute === 'CH';


  @Prop() subtitle?: string;

  get logo() {
    return site.logo;
  }

  get isShowToggle() {
    return this.$store.state.config.multiLanguageSwitch;
  }

  get isCloudPivot() {
    // 是否已打开内部维护组织开关
    return this.$store.state.config.cloudPivot;
  }

  get apiHost() {
    return window.config.apiHost;
  }

  get token() {
    return window.localStorage.getItem("token");
  }

  // 只有自维护的用户并且不是admin这个账户才能有修改密码入口 #39826
  isShowUpdatePwdBtn: boolean = true;

  // 用户信息
  userInfo: any = {};

  showModal: boolean = false;

  params: any = {
    oldPwd: "",
    newPwd: "",
    surePwd: ""
  };

  oldPwdErrTips: string = "";

  selectIsShow: string = "block";

  newPwdErrTips: string = "";

  surePwdErr: boolean = false;
  infoNum: number = 0;

  treeData: Array<any> = [];
  projectSelect: { label: any, value: any } | null = null;

  markKey: number = 0;

  colorId: string = ""
  backgroundColor: string = ""
  visible: boolean = false
  appearanceShow: boolean = false
  choiceColor: string = ""
  ThemeTemplate: string = ""

  loginHelper = new LoginHelper();
  created() {
    // 获取当前选中的菜单名称
    this.getUserInfo();
    this.getTreeSelect();
    this.getWorkCount();
    OAuthApi.getTheme({appCode:this.projectCode??''}).then(res=>{
      this.backgroundColor = res.data.themeCode
      this.choiceColor = res.data.themeCode
      sessionStorage.setItem("BgColor",this.backgroundColor)
      this.colorId = res.data.id??""
      if(this.choiceColor == "Blue") return this.ThemeTemplate = blueImg;
      if(this.choiceColor == "Green") return this.ThemeTemplate = GreenImg;
      if(this.choiceColor == "TecBlue") return this.ThemeTemplate = TecBlueImg;
    })

  }

  getTreeSelect() {
    const {projectConfig} = this;
    this.treeData.length = 0;
    OAuthApi.getProjectTree({
      appCode: this.projectCode ? this.projectCode : ''
    }).then((res: any) => {
      if (!res.data) return;
      this.treeData = res.data;
      if (this.treeData.length != 0) {
        //判断是否登录进入
        if (window.sessionStorage.getItem('firstLogin')==='true'||!projectConfig?.projectName) {
          const name = res.data[0].title;
          const level = ProjectLevel[res.data[0].value.split('-')[1] as string];
          projectConfig?.updateProjectConfig(name, level, res.data[0].key);
          this.projectSelect = {label: name, value: res.data[0].key};
          window.sessionStorage['firstLogin'] = 'false';
        } else {
          this.projectSelect = {label: projectConfig?.projectName, value: projectConfig?.projectKey};
          this.markKey += 1;
        }
      }
    });
  };

  private getProjectConfigFromValue(val: { value: string, label: string }) {
    const {value, label} = val;
    const levelStr = value.split('-')[1];
    if (levelStr) {
      return {
        name: label,
        level: ProjectLevel[levelStr],
        key: value,
      }
    } else {
      return null;
    }
  }

  treeSelect(value, node, extra) {
    const {projectConfig} = this;
    this.projectSelect = extra.node.dataRef.title;
    //only for test
    const config = this.getProjectConfigFromValue(value);
    if (config) {
      projectConfig?.updateProjectConfig(config.name, config.level, config.key);
    }
    return;
  }

  async getWorkCount() {
    const res = await homeApi.getWorkCount(this.projectCode);
    //@ts-ignore
    this.infoNum = res.data.workItemCount;
  }

  toMyWorkitem() {
    this.$router.push({name: "myUnfinishedWorkItem"}).catch((err: any) => {
      err;
    });
  }

  // 跳转到个人中心
  toUserInfo() {
    // window.location.href = '/user/info';
    this.$router.push("/user").catch((err: any) => {
      err;
    });
  }

  // 跳转后台管理
  toAdmin() {
    const token = localStorage.getItem("token");
    if (this.isDingTalk && token) {
      //env.portalHost
      window.open(`${env.host}/admin?admin_token=${token}`, "_blank");
    } else {
      //env.portalHost
      window.open(`${env.host}/admin`, "_blank");
    }
  }

  // 退出登录confirm
  logoutConfirm() {
    const vm = this;
    vm.$confirm({
      title: this.$t("languages.common.tip.sureToLogOut").toString(),
      okText: this.$t("languages.common.tip.confirm").toString(),
      cancelText: this.$t("languages.common.tip.cancel").toString(),
      onOk() {
        vm.logout();
      }
    });
  }

  // 退出登录
  logout() {
    const logoutIP = env.oauthHost;
    const redirectIP = env.redirectHost;
    const token: string = localStorage.getItem("token") || "";

    // window.location.href = `${logoutIP}/logout?redirect_uri=${redirectIP}/login&access_token=${token}`;
    // this.loginHelper.removeUserPassword();
    // this.loginHelper.saveUserPasswordToLocalStorage();
    OAuthApi.logout({
      redirect_uri: `${redirectIP}/login`,
      access_token: token
    }).then((res: any) => {
      // console.log(res);
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("expireTime");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem('searchParams');
      this.$router.replace({name: "login"});
    });
  }

  // 跳转到首页
  goHome() {
    const appCode = window.Environment ? window.Environment.appCode : null;
    if (appCode) {
      this.$router.push({
        name: "singleApp",
        params: {
          appCode
        }
      }).catch((err: any) => {
        err;
      });
    } else {
      this.$router.push({name: "myUnfinishedWorkItem"}).catch((err: any) => {
        err;
      });
      // 如果回到首页, 重新调整顶部导航栏下的 slider
      //(this.$refs.applications as any).initSlider();
    }
  }

  openBlank() {
    let href: any = location.href
    const iframeAction: any = href.match(/%26iframeAction%3Ddetail/g)
    if (iframeAction.length > 1) {
      for (let i = 0; i < iframeAction.length - 1; i++) {
        href = href.replace('%26iframeAction%3Ddetail', '')
      }
    }

    const url = `${href}${
      href.indexOf("?") > -1 ? "&" : "?"
    }access_token=${localStorage.getItem("token")}`;

    window.open(url, "_blank");
  }

  // 获取当前用户信息
  async getUserInfo() {
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      this.userInfo = info;
      this.setUserId(info);
      this.isShowUpdatePwdBtn =
        (res.data.relatedSyncType === "PUSH" ||
          this.$store.state.config.loginType === 0 ||
          this.$store.state.config.loginType === 2) &&
        res.data.username !== "admin"; // admin这个账号 hide || 或者开启了账号密码登陆的时候
      sessionStorage.setItem("user", JSON.stringify(info));
      // 判断当前用户角色
      const isAppAdmin: boolean = info.permissions.includes("APP_MNG");
      const isSysAdmin: boolean = info.permissions.includes("SYS_MNG");
      const isRootAdmin: boolean = info.permissions.includes("ADMIN");
      const isAdmin: boolean = isAppAdmin || isSysAdmin || isRootAdmin;
      this.setIsAdmin(isAdmin);
      this.setRootAdmin(isRootAdmin);
      this.setAdmin(isSysAdmin || isRootAdmin);
      // 禁止无权限访问流程查询页面
      if (
        !isSysAdmin &&
        !isRootAdmin &&
        this.$route.name &&
        ["queryInstance", "queryParticipantWorkItem"].includes(this.$route.name)
      ) {
        this.$router.replace({name: "myUnfinishedWorkItem"});
      }
      // 禁止超管访问流程委托页面
      if (isRootAdmin && this.$route.name && ["delegationWorkflow"].includes(this.$route.name)) {
        this.$router.replace({name: "myUnfinishedWorkItem"});
      }
    }
  }

  getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if (this.token) {
      url += "&access_token=" + this.token;
    }
    return url;
  }

  /**
   * 切换多语言
   */
  toggleLanguage() {
    if (this.$i18n.locale === "zh") {
      this.$i18n.locale = "en";
    } else {
      this.$i18n.locale = "zh";
    }
    this.$forceUpdate();
    localStorage.setItem("locale", this.$i18n.locale);
  }

  /*
   * 修改密码
   */
  async changePwd() {
    this.resetErrTips();
    if (!this.params.oldPwd) {
      this.oldPwdErrTips = this.$t("languages.common.oldPwdRequied").toString();
      return;
    }
    if (!this.params.newPwd) {
      this.newPwdErrTips = this.$t("languages.common.newPwdRequied").toString();
      return;
    }
    if (this.params.newPwd !== this.params.surePwd) {
      this.surePwdErr = true;
      this.newPwdErrTips = this.$t("languages.common.newPwdNotSame").toString();
      return;
    }

    const params = {
      username: this.userInfo.username,
      corpId: this.userInfo.corpId,
      oldPassword: this.params.oldPwd,
      newPassword: this.params.newPwd
    };
    const res = await OAuthApi.changePassword(params);
    if (res.errcode) {
      this.$message.error(res.errmsg);
      return;
    }

    this.$message.success(`${this.$t("languages.common.changePwdSuccess")}`);
    this.logout();
  }

  /*
   * 重置密码错误提示
   */
  resetErrTips() {
    this.oldPwdErrTips = "";
    this.newPwdErrTips = "";
    this.surePwdErr = false;
  }

  cancel() {
    this.showModal = false;
    this.params = {
      oldPwd: "",
      newPwd: "",
      surePwd: ""
    };
    this.resetErrTips();
  }
  showDrawer() {
    this.visible = true;
    setTimeout(() => {
      this.appearanceShow = true;
    }, 500);
  }


  onClose() {
    this.visible = false;
    this.appearanceShow = false;
    this.choiceColor = this.backgroundColor
    if(this.choiceColor == "Blue") return this.ThemeTemplate = blueImg
    if(this.choiceColor == "Green") return this.ThemeTemplate = GreenImg
    if(this.choiceColor == "TecBlue") return this.ThemeTemplate = TecBlueImg
  }

  isClickColor(val) {
    this.choiceColor = val
    if(val == "Blue") return this.ThemeTemplate = blueImg
    if(val == "Green") return this.ThemeTemplate = GreenImg
    if(val == "TecBlue") return this.ThemeTemplate = TecBlueImg
  }

  Submit() {
    if(this.choiceColor == "Blue") {
      this.toBlue()
      this.ThemeTemplate = blueImg
    }
    if(this.choiceColor == "Green") {
      this.toGrenn()
      this.ThemeTemplate = GreenImg
    }
    if(this.choiceColor == "TecBlue") {
      this.toTechnology()
      this.ThemeTemplate = TecBlueImg
    }
    this.visible = false;
    this.appearanceShow = false;
  }


  toBlue() {
    if (this.backgroundColor == "Blue") return this.$message.warn("目前是该主题颜色！")
    OAuthApi.updateTheme({appCode: this.projectCode??'', id: this.colorId, themeCode: "Blue",}).then(res => {
      //@ts-ignore
      this.$message.success(res.errmsg)
      sessionStorage.setItem("BgColor", "Blue")
      sessionStorage.setItem("colorId",this.colorId)
      this.reload()
    })
  }
  toGrenn() {
    if (this.backgroundColor == "Green") return this.$message.warn("目前是该主题颜色！")
    OAuthApi.updateTheme(  {appCode: this.projectCode??'', id: this.colorId, themeCode: "Green"}).then(res => {
      //@ts-ignore
      this.$message.success(res.errmsg)
      sessionStorage.setItem("BgColor", "Green")
      this.reload()
    })
  }

  toTechnology() {
    if (this.backgroundColor == "TecBlue") return this.$message.warn("目前是该主题颜色！")

    OAuthApi.updateTheme({appCode: this.projectCode??'', id: this.colorId, themeCode: "TecBlue"}).then(res => {
      //@ts-ignore
      this.$message.success(res.errmsg)
      sessionStorage.setItem("BgColor", "TecBlue")
      sessionStorage.setItem("colorId",this.colorId)
      this.reload()
    })
  }
  mounted(){
    if(this.$route.name == "BIMView"||this.$route.name == "GatewayHome"||this.$route.name == "PreliminaryStudy" ||this.$route.name == "InformationPortal") {
      this.selectIsShow = "none"
    }else {
      this.selectIsShow = "block"
    }
  }
}
</script>
<style lang="less" scoped>
@import "../../../styles/themes/default.less";

@menu-box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.1);
.common-header {
  height: 64px;
  //add
  //background: #004898;
  //background-color: #064897;
  //end
  padding: 0 @base4-padding-lg !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @base4-padding-lg;
  box-shadow: @menu-box-shadow;
  //add
  padding-left: 0 !important;
  //end
  .logo {
    //margin-right: 10px;
    //cursor: pointer;
    //width: 444px;
    height: 100%;
    //end
    //padding-left: 10px;
    //add
    padding-left: 22px;
    //end
    //background: url("../../../assets/logo/top.png");
    //background-size: 100% 100%;
    cursor: pointer;

    & > img {
      max-height: 30px !important;
    }

    span {
      margin-left: 10px;
      color: #fff;
      //font-size: 24px;
      font-size: 22px;
    }
  }

  .header-right {
    .menu {
      height: 100%;

      ul {
        display: flex;
        align-items: center;
        margin: 0;
      }

      .search-icon {
        width: 24px;
        height: 24px;
        margin-right: 20px;
        &:hover {
          opacity: 0.8;
          cursor: pointer;
        }
      }
    }

    .menu > ul > li {
      flex: none;
      margin-right: @base4-padding-lg * 2;

      &:last-of-type {
        margin-right: 0;
      }

      a {
        font-size: @font-size-14;
        color: @light-color-1;
        text-decoration: none;
        position: relative;
        display: block;
        line-height: 64px;

        span {
          max-width: 7em;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        &:hover {
          color: @primary-color;
        }

        &.router-link-active {
          color: @primary-color;

          &::after {
            content: "";
            display: block;
            position: absolute;
            left: -7px;
            bottom: 1px;
            width: calc(100% + 14px);
            height: 3px;
            border-radius: 2px;
            background: @primary-color;
          }
        }
      }

      &.more {
        position: relative;
        height: 64px;
        width: 33px;
        margin-right: 20px;
        cursor: pointer;

        .icon {
          display: block;
          height: 100%;
          line-height: 64px;
          color: @light-color-3;

          &.active {
            color: @primary-color;
            //   &::after {
            //   content: '';
            //   display: block;
            //   position: absolute;
            //   left: -7px;
            //   width: 100%;
            //   height: 3px;
            //   border-radius: 2px;
            //   background: @primary-color;
            // }
          }
        }

        &.active {
          color: @primary-color;

          &::after {
            content: "";
            display: block;
            position: absolute;
            left: -7px;
            width: calc(100% + 14px);
            height: 3px;
            border-radius: 2px;
            background: @primary-color;
          }
        }
      }

      & > .user-info {
        position: relative;
        display: flex;
        align-items: center;
        height: 64px;
        cursor: pointer;
        //test
        transition: all 3s;
        //end
        &::before {
          content: "";
          display: none;
          width: 1px;
          height: 30px;
          background-color: rgba(234, 237, 243, 1);
          position: absolute;
          left: -101px;
          top: 17px;
        }

        .avatar-box {

          //test
          transition: all 3s;
          //end

          & > img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
          }

          & > span {

            //test
            transition: all 3s;
            //end

            padding-left: 8px;
            //color: rgba(0, 0, 0, 0.85);
            color: white;
          }

          & > .icon {
            margin-left: 5px;
            display: inline-block;
            vertical-align: middle;
            font-size: 14px;
            color: #8c8c8c;

            &.default-avatar {
              font-size: 32px;
              color: #7165ff;
            }

            &.h-icon-all-caret-down {
              transform: scale(0.7);
            }
          }
        }
      }
    }
  }
}

.info-box {
  background-color: white;
  text-align: left;
  box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.15);
  border-radius: @border-radius-lg;

  & > ul > li {
    padding: 5px @base10-padding-md;

    &.user {
      cursor: pointer;
      border-bottom: 1px solid @base-border-color;

      &::before {
        display: none;
      }
    }

    & > .user-name {
      text-align: left;

      span {
        display: block;
        color: @light-color-1;

        &.mobile {
          color: @light-color-3;

          &::before {
            display: none;
          }
        }
      }
    }

    a {
      color: @light-color-1;

      & > .icon {
        margin-right: 8px;
      }
    }

    &:hover {
      background-color: rgba(240, 247, 255, 1);
    }
  }

  .toggle-lang {
    & span.active {
      color: @primary-color;
    }
  }
}

.row-flex {
  margin-bottom: 16px;
  align-items: center;

  &:last-child {
    margin-bottom: 0;
  }

  &.err-input {
    position: relative;
    margin-bottom: 24px;

    /deep/ .ant-input {
      border-color: #f5222d !important;

      &:focus {
        box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
      }
    }

    .err-tips {
      font-size: 12px;
      color: #f5222d;
      text-align: left;
      line-height: 20px;
      position: absolute;
      top: 32px;
      left: 8px;
    }
  }

  .required {
    position: relative;

    &:before {
      content: "*";
      color: @error-color;
      position: absolute;
      left: -0.5em;
    }
  }
}

//new
.logo {
  & > span {
    font-size: 32px;
    font-family: Microsoft YaHei;
    font-weight: bold;
    color: #ffffff;
  }
}

.select {
  width: 270px;
  //margin-left: -45%;
  /deep/ .ant-select {
    color: rgba(0, 0, 0, 0.65) !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
  }
}
.theme {
  width: 35px;
  height: 35px;
  margin-right: 12px;
  cursor: pointer;
}
.themeColor {
  margin-bottom: 30px;
  span {
    display: inline-block;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin-right: 24px;
    text-align: center;
    cursor: pointer;
  }
  span:nth-child(1) {
    background: rgb(41, 112, 255);
  }
  span:nth-child(2) {
    background: rgb(24, 191, 164);
  }
  span:nth-child(3) {
    background: #091b39;
  }
  i {
    color: #fff;
    font-size: 12px;
    opacity: 0;
  }
}

</style>
<style lang="less">
                  .ant-drawer-content-wrapper {
                    .viewTemplate {
                      position: fixed;
                      top: 50%;
                      left: 50%;
                      margin-left: -210px;
                      transform: translate(-50%,-50%);
                      width: 800px;
                      height: 480px;
                      background-color: #f1f2f6;
                      display: flex;
                      flex-direction: column;
                    }
                    .ant-drawer-title {
                      font-weight: 700;
                    }
                    .el-button {
                      height: 28px;
                      padding: 0px 20px;
                    }
                    h5 {
                      border-left: 4px solid #2970ff;
                      padding-left: 10px;
                      font-size: 14px;
                      font-weight: 700;
                      height: 17px;
                      line-height: 16px;
                      margin-bottom: 20px;
                    }
                    .themeColor {
                      margin-bottom: 30px;
                      span {
                        display: inline-block;
                        width: 24px;
                        height: 24px;
                        border-radius: 4px;
                        margin-right: 24px;
                        text-align: center;
                        cursor: pointer;
                      }
                      span:nth-child(1) {
                        background: rgb(41, 112, 255);
                      }
                      span:nth-child(2) {
                        background: rgb(24, 191, 164);
                      }
                      span:nth-child(3) {
                        background: #091b39;
                      }
                      i {
                        color: #fff;
                        font-size: 12px;
                        opacity: 0;
                      }
                    }
                    .Fade-enter,
                    .Fade-leave-to {
                      opacity: 0;
                    }
                    .Fade-enter-to,
                    .Fade-leave {
                      opacity: 1;
                    }

                    .Fade-enter-active,
                    .Fade-leave-active {
                      transition: all 0.3s ease-in-out;
                    }
                  }

.Blue {
  height: 64px;
  background-color: #064897 !important;
}

.Green {
  height: 80px;
  background: url("../img/new_top.png");
  background-size: 100% 100%;
  .header-right{
    padding-top: 14px;
  }

  div[class~=menu] {
    padding-bottom: 17px;
  }

  .select {
    margin-left: 70px !important;
  }

  .default-avatar {
    color: #b9e50a !important;
  }
}

.TecBlue {
  height: 64px;
  background: url("../img/top_bg.png");
  background-size: 100% 100%;

  .select {
    margin-left: 70px !important;
  }
}

</style>
