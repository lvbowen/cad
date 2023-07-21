import { Component, Vue } from "vue-property-decorator";
// import logo from '../../../src/assets/logo/logo.png';
import HeaderMenu from "../headerMenu/headerMenu";
import Class from './navBar.module.less';
import { namespace } from "vuex-class";


import site from "@/config/site";
import env from "@/config/env";
import OAuthApi from "@/apis/oauth";

import { Col, Dropdown, Input, Modal, Row } from "@h3/antd-vue";

import * as localeTemplate from '../../locales/index';
import LoginHelper from "../../../src/views/login/loginHelper";


const WorkflowCenterModule = namespace("WorkflowCenter/WorkflowCenter");

const SystemModule = namespace("System/System");

@Component({
  name: 'navBar',
  components: {
    Dropdown: Dropdown,
    Modal: Modal,
    Input: Input,
    Row: Row,
    Col: Col,
  }
})
export default class NavBar extends Vue {

  @WorkflowCenterModule.Mutation("setAsideTitle") setAsideTitle: any;

  @WorkflowCenterModule.Mutation("setUserId") setUserId: any;

  @SystemModule.State("isAdmin") isAdmin: any;

  @SystemModule.Mutation("setIsAdmin") setIsAdmin: any;

  @SystemModule.Mutation("setAdmin") setAdmin: any;

  @SystemModule.Mutation("setRootAdmin") setRootAdmin: any;

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
    return (window as any).config.apiHost;
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
    surePwd: "",
  };

  oldPwdErrTips: string = "";

  newPwdErrTips: string = "";

  surePwdErr: boolean = false;

  created() {
    // 获取当前选中的菜单名称
    this.getUserInfo();
  }

  // 跳转到个人中心
  toUserInfo() {
    // window.location.href = '/user/info';
    // this.$router.push("/user").catch((err: any) => {
    //   err
    // });
  }

  // 跳转后台管理
  toAdmin() {
    const token = localStorage.getItem("token");
    if (this.isDingTalk && token) {
      window.open(`${env.portalHost}/admin?admin_token=${token}`, "_blank");
    } else {
      window.open(`${env.portalHost}/admin`, "_blank");
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
      },
    });
  }
  loginHelper = new LoginHelper();
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
      this.$router.replace({ name: "login" });
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
        err
      });
    } else {
      this.$router.push({ name: "workbench" }).catch((err: any) => {
        err
      });
      // 如果回到首页, 重新调整顶部导航栏下的 slider
      //(this.$refs.applications as any).initSlider();
    }
    // else {
    //   this.$router.push({name: "myUnfinishedWorkItem"}).catch((err: any) => {
    //     err
    //   });
    //   // 如果回到首页, 重新调整顶部导航栏下的 slider
    //   //(this.$refs.applications as any).initSlider();
    // }
  }

  /*openBlank() {
    const url = `${location.href}${
      location.href.indexOf("?") > -1 ? "&" : "?"
    }access_token=${localStorage.getItem("token")}`;

    window.open(url, "_blank");
  }*/

  openBlank() {
    let href: any = location.href
    const iframeAction: any = href.match(/%26iframeAction%3Ddetail/g)
    if (iframeAction.length > 1) {
      for (let i = 0; i < iframeAction.length - 1; i++) {
        href = href.replace('%26iframeAction%3Ddetail', '')
      }
    }

    const url = `${href}${href.indexOf("?") > -1 ? "&" : "?"
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
        (res.data.relatedSyncType === "PUSH" || this.$store.state.config.loginType === 0 || this.$store.state.config.loginType === 2)
        && res.data.username !== "admin"; // admin这个账号 hide || 或者开启了账号密码登陆的时候
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
        this.$router.replace({ name: "myUnfinishedWorkItem" });
      }
      // 禁止超管访问流程委托页面
      if (isRootAdmin && this.$route.name && ["delegationWorkflow"].includes(this.$route.name)) {
        this.$router.replace({ name: "myUnfinishedWorkItem" });
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
      newPassword: this.params.newPwd,
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
      surePwd: "",
    };
    this.resetErrTips();
  }

  //TODO:remaining Modal


  render() {
    const {
      userInfo, getDownloadUrl, toUserInfo,
      isAdmin, isShowToggle, isShowUpdatePwdBtn, isDingTalk,
      showModal, toggleLanguage, $i18n, logout,
      toAdmin,
    } = this;
    // @ts-ignore
    return (
      <nav class={Class.main}>
        <div class={Class.logo}>
          <img src={this.logo ?? undefined} alt={''} />
          <span>{window.localStorage.getItem('projectTitle')}</span>
        </div>
        <HeaderMenu />
        <aside class={Class.divider} />
        <li>
          <a-dropdown trigger={'click'}>
            <div class='user-info'>
              <div class='avatar-box'>
                {
                  userInfo.imgUrl && userInfo.imgUrl.includes('http') &&
                  <img src={userInfo.imgUrl} />
                }
                {
                  userInfo.imgUrl && !userInfo.imgUrl.includes('http') &&
                  <img src={getDownloadUrl(userInfo.imgUrl)} />
                  ||
                  <div>
                    <i class="icon aufontAll h-icon-all-normal_smile default-avatar" />
                    <span>{userInfo.name}</span>
                    <i class="icon aufontAll h-icon-all-caret-down" />
                  </div>
                }
              </div>
              <div class='info-box' slot='overlay'>
                <ul>
                  <li onClick={() => toUserInfo()} class='user'>
                    <div class="user-name">
                      <span>{userInfo.name}</span>
                      <span class="mobile">{userInfo.mobile}</span>
                    </div>
                  </li>
                  {
                    isAdmin &&
                    <li>
                      <a onClick={() => toAdmin()}>
                        <i class="icon aufontAll h-icon-all-disassembly-o" />
                        {localeTemplate.default("languages.common.backStageManager")}
                      </a>
                    </li>
                  }
                  {
                    isShowToggle &&
                    <li>
                      <a onClick={toggleLanguage} class="toggle-lang">
                        <i class="icon aufontAll h-icon-all-swap-o" />
                        {localeTemplate.default("languages.common.switch")}
                        <span class={$i18n.locale === 'zh' ? 'active' : ''}>中</span> /<span
                          class={$i18n.locale === 'en' ? 'active' : ''}>En</span>
                      </a>
                    </li>
                  }
                  {
                    isShowUpdatePwdBtn &&
                    <li>
                      <a onClick={() => this.showModal = true}>
                        <i class="icon aufontAll h-icon-all-key-o" />
                        {localeTemplate.default("languages.common.changePwd")}
                      </a>
                    </li>
                  }
                  {
                    !isDingTalk &&
                    <li>
                      <a onClick={() => logout()}>
                        <i class="icon aufontAll h-icon-all-poweroff-o" />
                        {localeTemplate.default("languages.common.exitSys")}
                      </a>
                    </li>
                  }
                </ul>
              </div>
            </div>
          </a-dropdown>
        </li>
        <a-modal
          visable={showModal}
          title={localeTemplate.default('languages.common.changePwd')}
          width={'422'}
          cancelText={localeTemplate.default('languages.common.cancel')}
          okText={localeTemplate.default('languages.common.ok')}
          onOk={() => this.changePwd()}
          onCancel={() => this.cancel()}
          maskClosable={false}
          keyboard={false}
        >

        </a-modal>
      </nav>
    );
  }
}
