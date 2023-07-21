<template>
  <div class="header-wrap">
    <div class="header common-header">
      <div class="logo">
        <div class="left-log flex">
          <img style="background-color:#edeff0" :src="projectLogo" alt/>
          <div>
            <span>{{ projectTitle }}</span>
            <span v-if="subtitle"> - {{ subtitle }}</span>
            <div class="en-title">2D and 3D collaborative design platform</div>
          </div>
        </div>
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
      <div class="header-right flex">
        <div class="header-menu flex-center-justify flex-auto flex-center-align">
          <div v-for="(item,index) in headerList" :key="index" class="flex-space-between">
            <div
              class="menu-item"
              @click="menuTab(item.name)"
              :class="activeMenu===item.name?'activeMenColor':''">
              <div class="flex flex-center-align">
                <template v-if="item.icon">
                  <img :src="item.icon" alt="" v-if="item.icon.indexOf('base64')>-1">
                  <i v-else class="icon aufontAll" :class="item.icon"></i>
                </template>
                <span>{{ item.name }}</span>
              </div>
              <div class="bottom-border"></div>
            </div>
            <div class="line" v-if="index!==headerList.length-1"></div>
          </div>
        </div>
        <div class="menu">
          <ul>
            <li @click="menuTab('系统管理')" class="iconSetting">
              <a-icon type="setting" />
            </li>
            <li>
              <a-dropdown :trigger="['click']">
                <div class="user-info">
                  <div class="avatar-box">
                    <img
                      v-if="userInfo.imgUrl && userInfo.imgUrl.includes('http')"
                      :src="userInfo.imgUrl"
                    />
                    <img v-else-if="userInfo.imgUrl" :src="getDownloadUrl(userInfo.imgUrl)"/>
                    <i v-else class="icon aufontAll h-icon-all-normal_smile default-avatar"></i>
                    <span>{{ userInfo.name }}</span>
                    <img src="../../../../src/assets/extends/coordinate/top_s.png" style="width:18px;height:18px;margin-left: 5px" alt="">
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
                    <li>
                      <a @click="toAdmin">
                        <i class="icon aufontAll h-icon-all-disassembly-o"></i>
                        {{ $t("languages.common.backStageManager") }}
                      </a>
                    </li>
                    <li v-if="isShowToggle">
                      <a @click="toggleLanguage" class="toggle-lang">
                        <i class="icon aufontAll h-icon-all-swap-o"></i>
                        {{ $t("languages.common.switch") }}
                        <span :class="$i18n.locale === 'zh' ? 'active' : ''">中</span> /
                        <span :class="$i18n.locale === 'en' ? 'active' : ''">En</span>
                      </a>
                    </li>
                    <li v-if="isShowUpdatePwdBtn">
                      <a @click="showModal = true">
                        <i class="icon aufontAll h-icon-all-key-o"></i>
                        {{ $t("languages.common.changePwd") }}
                      </a>
                    </li>
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
  </div>
</template>

<script lang="ts">

import {Component, InjectReactive, Prop, Vue, Watch} from "vue-property-decorator";

import Application from "@cloudpivot/application/pc";

import {Col, Dropdown, Input, Modal, Row, Select, TreeSelect, Badge,Icon} from "@h3/antd-vue";
import 'ant-design-vue/lib/drawer/style/index.css'
import {namespace} from "vuex-class";

import OAuthApi from "@/apis/oauth";
import {homeApi} from '@cloudpivot/api';
import env from "@/config/env";
import site from "@/config/site";
//CustomComponent
import {ProjectConfig} from "../../../../extends/type";
import {ProjectLevel} from '../../../../extends/constant';
import LoginHelper from "../../../../src/views/login/loginHelper";

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
    ATreeSelect: TreeSelect,
    [Icon.name]:Icon,
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

  // @InjectReactive('title') projectTitle?: string;
  //
  // @InjectReactive('logo') projectLogo?: string;

  @InjectReactive('projectConfig') projectConfig?: ProjectConfig;

  @Prop() subtitle?: string;

  @Prop() treeArr!: Array<any>;

  @Prop({required:true}) activeMenu!:string;

  @Prop({required:true}) activeMenuConfig!:{[key:string]:string};

  projectLogo:any =null;
  projectTitle:any =null;

  get headerList(){
    return this.treeArr.filter(item=>item.pcAble).filter(item=>item.name!=="系统管理");
  }

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

  treeData: Array<any> = [];
  projectSelect: { label: any, value: any } | null = null;

  markKey: number = 0;

  loginHelper = new LoginHelper();

  activeMen:string | null='';

  leftMenuList:Array<any> = [];

  menuTab(val){
    console.log(this.activeMenu,val,'activeMenu')
    this.leftMenuList=[];
    this.activeMen=val;
    const menuItem=this.treeArr.find(item=>item.name===val);
    if(!menuItem) return this.$message.error(`无效的菜单配置,${val}`)
    if(menuItem.type.toLowerCase()==="page"){
      if(!menuItem.pcUrl) this.$message.error('页面地址未设置，请联系管理员！');
      this.$router.push({path:menuItem.pcUrl});
    } else if(menuItem.type.toLowerCase()==="bizModel"){
      this.goRouteBizModel(menuItem);
    }else{
      this.leftMenuList = menuItem.children
      if(menuItem.children && menuItem.children.length>0){
        if(menuItem.children[0].pcUrl){
          this.$router.push({path:menuItem.children[0].pcUrl});
        }else{
          const key = Object.keys(this.activeMenuConfig).find(item=>this.activeMenuConfig[item]===val) as string;
          this.$router.push({name:key});
          this.$message.error('页面地址未设置，请联系管理员！');
        }

      }
    }
    let obj={
      menuTitle:val,
      leftMenuList:this.leftMenuList,
      activeIndex:0,
    }
    this.$emit('menuTab',obj)
  }

  goRouteBizModel(item){
    this.$router
      .push({
        name: "applicationList",
        params: {
          appCode: item.appCode,
          schemaCode: item.code,
        },
        query: {
          parentId: item.parentId,
          code: item.code,
          openMode: item.openMode,
          pcUrl: item.pcUrl,
          queryCode: '',
        },
      })
      .catch((err: any) => {
        err;
      });
  }

  created() {
    this.projectLogo =localStorage.getItem("projectLogo")
    this.projectTitle =localStorage.getItem("projectTitle")
    // 获取当前选中的菜单名称
    this.getUserInfo();
    this.getTreeSelect();
    this.activeMen=sessionStorage.getItem("activeMen")!==null?sessionStorage.getItem("activeMen"):'工作台'
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
@import "../../../../src/styles/themes/default.less";
@import "../../../styles/public.module.less";
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}
.header-wrap{
  width: 100%;
  height: 64px;
  background:#004898;
}
.common-header {
  height: 64px;
  padding: 0 @base4-padding-lg !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @base4-padding-lg;
  padding-left: 0 !important;
  background:url('../../../../src/assets/extends/coordinate/top_bg.png') no-repeat;
  background-size: 100% 100%;
  //end
  .logo {
    width:18%;
    height: 100%;
    padding-left: 22px;
    cursor: pointer;
    .left-log{
      padding: 5px 0;
      & > img {
        max-height: 42px !important;
      }
      span {
        margin-left: 10px;
        color: rgba(255, 255, 255,.9);
        font-size: 20px;
        font-weight: 400;
        letter-spacing: 4px;
      }
      .en-title{
        margin-left: 6px;
        color: rgba(255, 255, 255,.9);
        font-size: 8px;
        font-weight: 300;
        line-height: 16px;
      }
    }

  }

  .header-right {
    width:82%;
    position: relative;
    .header-menu{
      .menu-item{
        padding:20px 0px;
        font-family: Microsoft YaHei;
        font-size: 16px;
        cursor: pointer;
        position:relative;
        color: rgba(255, 255, 255,.9);
        img,i {
          margin-right: 1/4 * @spacing-base;
        }
        img {
          width: 16px;
          height: 18px;
        }
        //img{
        //  max-height:20px;
        //  margin-right:12px;
        //}
      }
      .line {
        margin: 0 @spacing-large;
        width: 1px;
        height: 16px;
        background-color: white;
      }
      .activeMenColor{
        overflow: hidden;
        .bottom-border{
          width:100%;
          height:4px;
          background-color:#00AEEF;
          position:absolute;
          left: 0;
          bottom: 2px;
          transition:all 1.5s ease-out;
        }
      }
    }

    .menu {
      height: 100%;
      ul {
        display: flex;
        align-items: center;
        margin: 0;
      }

      .sz-icon {
        width: 24px;
        height: 24px;
        margin-right: 20px;
        &:hover {
          opacity: 0.8;
          cursor: pointer;
        }
      }
      .dn-icon{
        width: 18px;
        height: 18px;
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
//.logo {
//  & > span {
//    font-size: 32px;
//    font-family: Microsoft YaHei;
//    font-weight: bold;
//    color: #ffffff;
//  }
//}

.select {
  width: 270px;
  //margin-left: -45%;
  /deep/ .ant-select {
    color: rgba(0, 0, 0, 0.65) !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
  }
}
/deep/.iconSetting{
  font-size: 24px;
  color: #e6fcff;
  cursor: pointer;
  margin-right: 15px!important;
  &:hover{
    opacity: 0.8;
  }
}

</style>
<style lang="less">


</style>
