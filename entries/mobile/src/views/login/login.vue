<template>
  <div class="login-account" :class="{ 'login-err-box': passwordErr }">
    <div class="login-account-login">
      <img :src="projectLogo" alt=""/>
    </div>
    <span class="login-title">{{ projectTitle }}</span>
    <div class="login-account-form">
      <login-input
        class="login-input"
        :placeholder="'请输入账号'"
        :lable="'账号'"
        v-model="userName"
        @change="becanLogin"
        :type="'text'"
      />
      <!--class="login-last-input"-->
      <login-input
        class="login-input"
        :placeholder="'请输入密码'"
        :lable="'账号密码'"

        v-model="passWord"
        @change="becanLogin"
        :type="'password'"
      />
    </div>

    <div class="login-option">
      <aside>
        <a-checkbox :checked="remember" @change="rememberInfo">记住密码</a-checkbox>
      </aside>
      <aside>
        <span @click="toggle">忘记密码？</span>
      </aside>
    </div>

    <div class="login-account-button">
      <h3-button @click="login" :loading="loading"><span class="login-r">登&nbsp;录</span></h3-button>
    </div>

    <!--<div class="login-forget-tips clearfix">
    <span @click="toggle">忘记密码</span>
    </div>-->

    <div>
      <h3-dialog v-model="showToast" class="dialog-main">
        <div>
          <div class="dialog-content">
            <p>请联系系统管理员重置密码</p>
          </div>

          <div class="dialog-footer">
            <span @click="showToast = false">确定</span>
          </div>
        </div>
        <!-- <div @click="showToast=false">
          <span class="h3-close"></span>
        </div> -->
      </h3-dialog>
    </div>
    <div>
      <h3-dialog v-model="showTips" class="dialog-main">
        <div>
          <div class="dialog-content">
            <p>请先选择组织</p>
          </div>
          <div class="dialog-footer">
            <span @click="showTips = false">确定</span>
          </div>
        </div>
      </h3-dialog>
    </div>

    <div class="blank"></div>

    <!--<div class="switch-org">
      <p> {{ orgName }} </p>
      <h3-radio-list
        showMode="0"
        :defaultValue="autoSelect"
        :options="options"
        title="切换组织"
        :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
        :clearText="$t('cloudpivot.form.renderer.clear')"
        :confirmText="$t('cloudpivot.form.renderer.ok')"
        @onShow="show"
        @onHide="close"
        @onChange="onChange"
        @onClear="onChange"
      >
      </h3-radio-list>
    </div>-->
  </div>
</template>
<script lang="ts">
import { Component, InjectReactive, Prop, Vue, Watch } from "vue-property-decorator";

import OAuthApi from "./oauth-api";

import env from "@/config/env";

import LoginInput from "./login-input.vue";
//@ts-ignore
import { H3Button, H3Modal, H3RadioList } from "h3-mobile-vue";

import { Checkbox } from '@h3/antd-vue';
//@ts-ignore
import H3Dialog from "h3-mobile-vue/src/components/h3-dialog/index";

import common from '@cloudpivot/common';
import Axios from "axios";

// eslint-disable-next-line no-shadow
enum loginError {
  passwordErr = 1000,
  overThreeErr = 10001
}

@Component( {
  name: "login-account",
  components: {
    LoginInput,
    H3Button,
    H3Dialog,
    H3Modal,
    H3RadioList,
    ACheckbox: Checkbox,
  }
} )
export default class LoginAccount extends Vue {
  @Prop( {
    default: false
  } )
  toggleMode!: boolean;

  redirectUrl: string = ""; // 登陆回跳地址

  getTokenParams: any = {
    code: "",
    url: "",
    client_secret: "",
    client_id: "",
    redirect_uri: ""
  };

  depts: any[] = [];

  deptId: string = '';

  corpId = '';

  config: any = null;

  options: any = [];

  orgName: string = '';

  showModal: boolean = false;

  autoSelect: any = '';

  showTips: boolean = false;

  private remember: boolean = !!localStorage.getItem( "pwd" );

  private rememberInfo( e ) {
    const status = e.target.checked;
    if ( status ) {
      this.remember = true;
    } else {
      this.remember = false;
      localStorage.removeItem( 'name' );
      localStorage.removeItem( 'pwd' );
    }
  }

  show() {
    this.showModal = true;
  }

  close() {
    this.showModal = false;
  }

  onChange( value: any ) {
    if ( value && value.key && value.label ) {
      this.onDeptChange( value.key, value.label )
    }
  }

  passwordErr: boolean = false; // 账户密码错误

  passwordType: string = "password"; // 密码的展示形式

  showPassword: boolean = false;

  overflowTips: boolean = false; // 密码输入已超过3次提示

  loginDisabled: boolean = false; // 登录禁用状态

  userName: string = ""; // 登录账号

  passWord: string = ""; // 登录密码

  visible: boolean = false; // 忘记密码提示窗

  rememberTokenExpired: boolean = false; //token过期前，记住密码状态
  loading: boolean = false;

  @InjectReactive( 'project' ) projectCode?: string;

  @InjectReactive( 'logo' ) projectLogo?: string;

  @InjectReactive( 'title' ) projectTitle?: string;

  @InjectReactive( 'corpId' ) projectCorpId?: string;

  @InjectReactive( 'thread' ) bimThreadWorker?: Worker;

  async mounted() {
    const res: any = await OAuthApi.getDepts();
    if ( this.remember ) {
      this.userName = localStorage.getItem( 'name' ) as string;
      this.passWord = localStorage.getItem( 'pwd' ) as string;
      this.login()
    }
    if ( res.errcode !== 0 ) {
      this.showError( res.errmsg );
      return;
    }
    this.depts = res.data;
    this.options = [];
    let optList = {};
    res.data.forEach( ( r: any ) => {
      optList = {
        key: r.corpId,
        value: r.name || '主组织',
        label: r.name || '主组织'
      }
      this.options.push( optList );
    } );
    //hard-coding 硬编码 长江航道整治工程智慧管控系统
    // const {corpId,name} = res.data.find(item=>item.name==='长江航道整治工程智慧管控系统');
    /* 目标组织 */
    const targetCorp = res.data.find( item => item.corpId === this.projectCorpId );
    if ( targetCorp && targetCorp.corpId && targetCorp.name ) {
      this.onDeptChange( targetCorp.corpId, targetCorp.name );
    }
    /*this.autoSelect = this.options[0].label;
    if (this.depts.length > 0) {
      let deptId = this.depts[0].corpId;
      if (this.$route.query.deptId) {
        deptId = this.$route.query.deptId;
      }
      this.deptId = deptId;
      this.onDeptChange(this.deptId, this.depts[0].name);
    }*/
  }

  @Watch( 'projectCorpId', { immediate: true } )
  projectCorpIdListener( val: string ) {
    if ( val ) {
      const targetCorp = this.depts.find( item => item.corpId === this.projectCorpId );
      if ( targetCorp && targetCorp.corpId && targetCorp.name ) {
        this.onDeptChange( targetCorp.corpId, targetCorp.name );
      }
    }
  }

  onDeptChange( deptId: string, name: string ) {
    const dept = this.depts.find( d => d.corpId === deptId );
    if ( !dept ) {
      this.showError( "找不到组织机构记录" );
      return;
    }
    this.corpId = dept.corpId;
  }


  created() {
    this.generateUrls();
  }

  /**
   * 初始化地址和固定传参
   */
  generateUrls() {
    const { oauthHost, client_id, scope, secret, redirectHost, host } = env;
    // debugger;
    //redirectHost
    // 回跳地址
    this.redirectUrl = `${ oauthHost }/login?redirect_uri=${ encodeURIComponent(
      `${ oauthHost }/oauth/authorize?client_id=${ client_id }&response_type=code&scope=${ scope }&redirect_uri=${ host }/oauth`
    ) }`;
    // 请求token参数
    this.getTokenParams = {
      code: "",
      url: oauthHost,
      client_secret: secret,
      client_id: client_id,
      //redirectHost switch to host
      redirect_uri: `${ host }/oauth`
    };
  }

  passwordVisible() {
    if ( this.showPassword ) {
      this.passwordType = "password";
    } else {
      this.passwordType = "text";
    }
    this.showPassword = !this.showPassword;
  }

  becanLogin() {
    // debugger;
    if ( this.userName && this.passWord ) {
      this.loginDisabled = true;
    } else {
      this.loginDisabled = false;
    }
  }

  /**
   * 账户密码登录
   */
  async login() {
    this.loading = true;
    /* if (!this.loginDisabled) {
       return;
     }*/

    this.passwordErr = false;
    // rsa加密
    const result = await OAuthApi.getRsaKey();
    const flag: boolean = typeof result === 'object' && result.hasOwnProperty( 'index' ) && result.hasOwnProperty( 'key' );
    if ( !flag ) {
      this.loading = false;
      return;
    }
    const { index, key } = result;
    /*

    let password: string | null = null;
    let redisIndex: string | null = null;

    const cachePwd: string | null = localStorage.getItem('pwd');

    if (this.remember && !cachePwd) {
      const pwd: string = common.utils.RsaEncrypt(this.passWord, key);
      password = pwd;
      redisIndex = index;
      localStorage.setItem('name', this.userName);
      localStorage.setItem('pwd', pwd);
      localStorage.setItem('index', index);
    }

    if (this.remember && cachePwd) {
      password = cachePwd;
      redisIndex = localStorage.getItem('index');
    }

    if (!this.remember) {
      password = common.utils.RsaEncrypt(this.passWord, key);
      redisIndex = index;
    }

    if (!password) return;*/

    const cacheToken: string | null = localStorage.getItem( 'token' );

    if ( this.remember && cacheToken ) {
      return this.getToken( this.getTokenParams );
    }

    const password: any = common.utils.RsaEncrypt( this.passWord, key );
    localStorage.setItem("userName",this.userName)
    localStorage.setItem("passWord",this.passWord)

    // rsa加密结束
    const params = {
      corpId: this.corpId,
      username: this.userName,
      password,
      url: this.redirectUrl,
      portal: true,
      index,
      // index:redisIndex,
      appCode: `${ env.project }`
    };
    const res = await OAuthApi.login( params );
    this.loading = false;
    if ( res.errcode === 200 && res.code ) {
      this.getTokenParams.code = res.code;
      this.getToken( this.getTokenParams );
    } else if ( res.errcode === loginError.passwordErr ) {
      this.passwordErr = true;
      this.showError( "用户名或密码错误，请重新输入" );
    } else if ( res.errcode === loginError.overThreeErr ) {
      this.passwordErr = true;
      this.overflowTips = true; // 超过3次
      this.showError( "密码输入错误已超过3次,请1分钟后再尝试" );
    } else if ( res.errcode === 1001 ) {
      this.showError( res.errmsg );
    }
  }

  showError( text: string ) {
    this.$h3.toast.show( {
      text,
      autoHide: true,
      iconType: text.length < 8 ? "close" : ""
    } );
  }

  /**
   * 获取token
   */
  async getToken( params: any ) {
    const { remember } = this;
    const cacheToken: string | null = localStorage.getItem( 'token' );

    if ( remember && cacheToken ) {
      await this.getUserInfo();
      this.bimThreadWorker?.postMessage( {
        action: 'getBimLayer',
        projectCode: this.projectCode,
        token: cacheToken
      } );
      const isShowEmailResquest = localStorage.getItem( 'isShowEmailResquest' );
      if ( isShowEmailResquest ) {
        window.location.href = isShowEmailResquest;
      } else {
        this.$router.push( { name: "business" } ).catch( ( err: any ) => {
          err
        } );
      }
      return;
    }
    const res = await OAuthApi.getToken( params );
    this.loading = false;
    if ( res && res.success ) {
      // debugger;
      const token = (res as any).access_token;
      const refresh_tokens = (res as any).refresh_token;
      const expireTime = (res as any).exp;

      localStorage.setItem( "refresh_token", refresh_tokens );
      localStorage.setItem( "expireTime", expireTime );
      localStorage.setItem( "token", token );
      await this.getUserInfo();
      const isShowEmailResquest = localStorage.getItem( 'isShowEmailResquest' );
      console.log( 'tokenis====>', token );
      //TODO:bimThreadWorker start threadWork
      this.bimThreadWorker?.postMessage( {
        action: 'getBimLayer',
        projectCode: this.projectCode,
        token: token
      } );
      if ( isShowEmailResquest ) {
        window.location.href = isShowEmailResquest;
      } else {
        this.$router.push( { name: "business" } ).catch( ( err: any ) => {
          err
        } );
      }
      /*this.$router.push({name: "home"}).catch((err: any) => {
        err
      });*/
    }
  }

  showToast = false;

  toggle() {
    // this.showError('请联系系统管理员重置密码');
    this.showToast = true;
  }

  async getUserInfo() {
    const res: any = await Axios.get( "/api/organization/user/info_login" ).catch( err => {
      if ( err.response.status === 401 ) {
        //token过期处理
        if(this.remember) {
          this.userName = localStorage.getItem('name')??'';
          this.passWord = localStorage.getItem('pwd')??'';
          this.remember = false;
          localStorage.removeItem( 'name' );
          localStorage.removeItem( 'pwd' );
          localStorage.removeItem( 'token' );
          this.rememberTokenExpired = true
          this.login();
        }
        // this.showError( '登录超时，请重新登录' );
        // this.userName = '';
        // this.passWord = '';
        // this.remember = false;
        // localStorage.removeItem( 'name' );
        // localStorage.removeItem( 'pwd' );
        // localStorage.removeItem( 'token' );
      }
    } ).finally(()=> {
      this.loading = false;
    });
    if ( res.errcode === 0 ) {
      const info: any = res.data;
      sessionStorage.setItem( 'user', JSON.stringify( info ) );
      if(this.rememberTokenExpired){
        this.remember = true
      }
      if ( this.remember ) {
        localStorage.setItem( 'name', this.userName );
        localStorage.setItem( 'pwd', this.passWord );
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";

@loginInputHeight: 13.493vw;
@contentWidth: 84.506vw;
@checkboxSize: 2.7066vw;

.login-account {
  background: #fff;


  //overflow: hidden;
  height: 100%;
  //new add
  overflow-y: auto;
  background: url("../../assets/extends/loginBg.png") no-repeat;
  background-size: cover;
  //-webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 0;
    display: none;
  }

  .login-account-login {
    /*padding-top: 2rem;
    padding-bottom: 1.76rem;*/
    //margin-top: ;
    display: flex;
    align-items: center;
    width: 30.1866vw;
    height: 30.1866vw;
    margin-left: auto;
    margin-right: auto;
    margin-top: 24.266vw;
    margin-bottom: 3.866vw;

    img {
      display: flex;
      margin-left: auto;
      margin-right: auto;
      //width: 1.86rem;
      //width: 26.133vw;
      width: 100%;
    }
  }

  .login-title {
    font-size: 4.4vw;
    font-family: Source Han Sans CN;
    font-weight: 300;
    color: #F2F2FC;
  }

  .login-account-form {
    //margin: 0 0.86rem;
    width: 84.506vw;
    margin-top: 19.33vw;
    margin-left: auto;
    margin-right: auto;

    .login-input {
      width: 100%;
      height: 13.493vw;
      margin-bottom: 4.6666vw;
    }

    .login-last-input {
      margin-top: 0.387rem;
    }
  }

  .login-account-button {
    //margin: 0 0.86rem;
    //margin-top: 1.6rem;
    width: 84.506vw;
    height: @loginInputHeight;
    margin-left: auto;
    margin-right: auto;
    //margin-bottom: 39.2vw;

    /deep/ .h3-button {
      //border-radius: 47px;
      //background-color: @primary-color;
      color: #fff;
      //new add
      border-radius: 2vw;
      background: linear-gradient(270deg, #70A3FF, #054DB7);
      height: @loginInputHeight;
      //line-height:@loginInputHeight;
      display: flex;
      align-items: center;

      & > .login-r {
        font-size: 4.6666vw;
        font-family: Source Han Sans CN;
        font-weight: 300;
        color: #FFFFFF;
        margin-left: auto;
        margin-right: auto;
      }
      .h3-loading-spinner {
        position: absolute !important;
        left: calc(50% - 8px) !important;
      }
    }
    /deep/ .h3-button:before {
      border: none !important;
    }
  }

  .login-forget-tips {
    margin: 0 0.86rem;
    padding-top: 0.63rem;

    span {
      float: right;
      color: rgba(153, 153, 153, 1);
      font-size: 0.373rem;
    }
  }

  .dialog-main {
    border-radius: 0.186rem;

    .dialog-footer {
      span {
        line-height: 1.33rem;
        color: @primary-color;
        font-size: 0.453rem;
      }

      position: relative;
      .hairline("top", rgba(221, 221, 221, 1));
    }

    .dialog-content {
      min-height: 2.266rem;
      display: flex;
      justify-content: center;
      // justify-items: center;
      align-items: center;

      p {
        font-size: 0.4rem;
        color: rgba(51, 51, 51, 1);
      }
    }
  }

  .switch-org {
    margin: 1rem 0.35rem 1rem 0.5rem;

    p {
      margin-bottom: 0.2rem;
      font-size: 0.4rem;
    }
  }

  .login-option {
    display: flex;
    align-items: center;
    width: @contentWidth;
    height: 2.8vw;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 5.466vw;

    & > aside:first-child {
      margin-right: auto;
      margin-left: 3.3333vw;
    }

    & > aside {
      display: flex;
      align-items: center;

      & > label {
        display: flex;
        align-items: center;
      }
    }

    & /deep/ span[class=ant-checkbox-inner] {
      background-color: transparent;
    }

    & /deep/ span[class=ant-checkbox-inner]:after {
      border-color: #13C763;
    }

    & /deep/ span {
      font-size: 2.9333vw;
      font-family: PingFang SC;
      font-weight: 400;
      color: #FFFFFF;
    }
  }

}

.blank {
  width: 100%;
  height: 39.2vw;
}
</style>
