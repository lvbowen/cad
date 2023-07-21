<template>
  <div class="login-account" :class="{'login-err-box':passwordErr}">
    <p v-if="passwordErr" class="err-tips">{{ errTips }}</p>
    <a-input
      placeholder="请输入AD域账号登录"
      autocomplete="off"
      class="newInput bottom22"
      v-model="userName"
      @change="becanLogin"
    >
      <i class="newInputIcon" slot="prefix">
        <img src="@/assets/extends/icon/user.png" alt=""/>
      </i>
    </a-input>
    <!--style="width: 280px;margin-bottom: 16px;"-->
    <a-input
      placeholder="请输入密码"
      class="newInput bottom29"
      v-model="passWord"
      @change="becanLogin"
      @pressEnter="newLogin"
      :type="passwordType"
      autocomplete="off"
    >
      <i class="newInputIcon" slot="prefix">
        <img src="@/assets/extends/icon/password.png" alt=""/>
      </i>
      <i
        class="icon aufontAll"
        :class="{'h-icon-all-eye-close': !showPassword,'h-icon-all-eye-o': showPassword}"
        slot="suffix"
        @click="passwordVisible"
      ></i>
    </a-input>
    <div class="operator">
      <a-check-box :checked="remember" @change="rememberInfo"><span class="rememberPwd">记住密码</span></a-check-box>
      <!--      <p class="forgetPwd" @click="visible = true">忘记密码?</p>-->
      <p class="forgetPwd" @click="modifyPassword">忘记密码?</p>
    </div>
    <div
      class="login-btn loginButton"
      :class="{'loginDisabled': !loginDisabled}"
      @click="newLogin"><a-icon v-if="logging" type="loading"/>登 录
    </div>
    <a @click="gologinBoxJJT">使用扫码登录</a>
    <!-- 弹窗 -->
    <a-modal
      title="提示"
      :bodyStyle="{'text-align':'center'}"
      v-model="visible"
      :maskClosable="false"
      :keyboard="false"
    >
      <template slot="footer">
        <a-button
          key="ok"
          class="ok-btn"
          type="primary"
          @click="visible = false">确认
        </a-button>
      </template>
      <img class="img" src="../../assets/images/forget.png"/>
      <p class="img-text">请联系系统管理员重置密码</p>
    </a-modal>
    <a-modal
      title="提示"
      :bodyStyle="{'text-align':'center'}"
      v-model="overflowTips"
      :maskClosable="false"
      :keyboard="false"
    >
      <template slot="footer">
        <a-button
          key="ok"
          class="ok-btn"
          type="primary"
          @click="overflowTips = false">确认
        </a-button>
      </template>
      <p class="overflow-text">密码输入错误已超过3次,请1分钟后再尝试</p>
    </a-modal>
    <!-- 未授权 -->
    <a-modal
      title="提示"
      :bodyStyle="{'text-align':'center'}"
      v-model="unAuthed"
      :maskClosable="false"
      :keyboard="false">
      <p class="overflow-text">当前账号用户未被授权，请联系管理员</p>
      <template slot="footer">
        <a-button
          key="ok"
          class="ok-btn"
          type="primary"
          @click="unAuthed = false">确认
        </a-button>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts">
import {Component, Inject, InjectReactive, Prop, PropSync, ProvideReactive, Vue, Watch} from 'vue-property-decorator';
// import axios from "axios";
import * as Type from '../../../extends/type';

import OAuthApi from '@/apis/oauth';

import env from '@/config/env';

import {ProjectLevel} from '../../../extends/constant';
import common from '@cloudpivot/common';
import {Button, Checkbox, Input, Modal, Tooltip,Icon} from '@h3/antd-vue';
import LoginHelper from "./loginHelper";
import { getPreConfig } from "../../../extends/service/CoordinateDesign/base";

@Component({
  name: "login-account",
  components: {
    AInput: Input,
    AModal: Modal,
    AButton: Button,
    ATooltip: Tooltip,
    ACheckBox: Checkbox,
    AIcon: Icon
  }
})
export default class LoginAccount extends Vue {
  @Prop({
    default: false
  }) toggleMode!: boolean;

  @PropSync('corpId') syncCorpId!: string;

  @InjectReactive('project') private projectCode!: string;

  @InjectReactive('projectConfig') private projectConfig?: Type.ProjectConfig;

  redirectUrl: string = '';  // 登陆回跳地址

  getTokenParams: any = {
    code: '',
    url: '',
    client_secret: '',
    client_id: '',
    redirect_uri: ''
  };

  passwordErr: boolean = false; // 账户密码错误

  passwordType: string = 'password'; // 密码的展示形式

  showPassword: boolean = false;

  overflowTips: boolean = false; // 密码输入已超过3次提示

  loginDisabled: boolean = false; // 登录禁用状态

  userName: string = ''; // 登录账号

  passWord: string = ''; // 登录密码

  visible: boolean = false; // 忘记密码提示窗

  unAuthed: boolean = false; // 未授权提示窗

  userTips: string = '';

  errTips: string = '';

  // remember: boolean = !!localStorage.getItem("pwd");
  remember: boolean = false;

  loginHelper = new LoginHelper();
  created() {
    this.remember = Boolean(localStorage.getItem('checked'))
    if (this.remember) {
      this.userName = localStorage.getItem('user_name') as string;
      this.passWord = localStorage.getItem('pwd') as string;
      this.loginDisabled = true;
      // let userPassword=this.loginHelper.getUserPassword();
      // if (userPassword) {
      //   this.passWord=userPassword?.password as string;
      //   this.userName=userPassword?.userName as string;
      // }
    }
    // let userPassword=this.loginHelper.getUserPassword();
    // if (userPassword) {
    //   // this.userName = localStorage.getItem('user_name') as string;
    //   // this.passWord = localStorage.getItem('pwd') as string;
    //   this.remember=true;
    //   this.passWord=userPassword?.password as string;
    //   this.userName=userPassword?.userName as string;
    //   this.loginDisabled = true;
    //   this.$nextTick(()=>{
    //     this.login();
    //   })
    // }else{
    //   this.remember=false;
    //   this.loginDisabled=false;
    // }
    this.generateUrls();
  }

  // 切换组织的时候需要重新初始化
  @Watch('syncCorpId', {immediate: true})
  onSyncCorpIdChange(syncCorpId: any) {
    if (syncCorpId) {
      this.generateUrls();
    }
  }


  /**
   * 初始化地址和固定传参
   */
  generateUrls() {
    const {
      oauthHost,
      client_id,
      scope,
      secret,
      redirectHost,
      //new add
      host
    } = env;
    // 回跳地址
    this.redirectUrl = `${oauthHost}/login?redirect_uri=${encodeURIComponent(`${oauthHost}/oauth/authorize?client_id=${client_id}&response_type=code&scope=${scope}&redirect_uri=${host}/oauth`)}`;
    // 请求token参数
    this.getTokenParams = {
      code: '',
      url: oauthHost,
      client_secret: secret,
      client_id: client_id,
      redirect_uri: `${host}/oauth`
    };
  }

  passwordVisible() {
    if (this.showPassword) {
      this.passwordType = 'password';
    } else {
      this.passwordType = 'text';
    }
    this.showPassword = !this.showPassword;
  }

  becanLogin() {
    if (this.userName && this.passWord) {
      this.loginDisabled = true;
    } else {
      this.loginDisabled = false;
    }
  }

  /**
   * 回车登陆
   */
  enterLogin() {
    const {userName, passWord} = this;

    if (!passWord || !userName) return;

    this.login();
  }

  /* fixed info_login after */
  private async getUserInfo(callback: Function) {
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      sessionStorage.setItem("user", JSON.stringify(info));
      this.getPreConfig();
      callback?.();
    }
  }
  getPreConfig() {
    getPreConfig().then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      sessionStorage.setItem('previewUrl',res.data.idocvServiceUrl)
    })
  }
  logging: boolean = false;
  newLogin() {
    this.passwordErr = false;
    this.userTips = '';
    const {userName, passWord} = this;
    if (!userName.trim()) return this.$message.warning('用户名不能为空！')
    if (!passWord.trim()) return this.$message.warning('密码不能为空！');
    window.sessionStorage.clear();
    sessionStorage.setItem("firstLogin", 'true');
    if (this.$route.name==='administratorLogin') {
      this.login();
    }else {
      this.logging = true
      OAuthApi.getLogin({
        username: this.userName,
        password: this.passWord
      }).then((res)=> {
        this.logging = false
        if(res.errcode!==0) {
          this.passwordErr = true;
          this.errTips = '用户名密码错误';
          return this.$message.error(res.data as string)
        }
        if(!res.data) return;
        localStorage.setItem('checked', this.remember.toString());
        localStorage.setItem('user_name', this.userName);
        localStorage.setItem('pwd', this.passWord);
        sessionStorage.setItem('appCode',this.projectCode);
        //根据Project存放用户密码
        // this.loginHelper.setUserPassword({userName:this.userName,password:this.passWord});
        // if(this.remember){
        //   this.loginHelper.saveUserPasswordToLocalStorage();
        // }
        window.open(`${env.apiHost}/login/ldapoAuth?code=${res.data}`,'_self')
      }).finally(()=> {
        this.logging = false
      })
      // axios.get('https://collaborativedesign.ctesi.com.cn/api/api/xtsjProject/ldap/ldapCheck', {
      //   params: {
      //     username: this.userName,
      //     password: this.passWord
      //   }
      // }).then((res:any)=> {
      //   if(res.errcode!==0) return this.$message.error(res.data as string)
      //   if(!res.data) return;
      //   window.open(`https://collaborativedesign.ctesi.com.cn/api/login/ldapoAuth?code=${this.userName}`,'_self')
      // })
    }
  }
  /**
   * 账户密码登录
   */
  async login() {
    if (!this.loginDisabled || !this.userName || !this.passWord) {
      return;
    }
    window.sessionStorage.clear();
    sessionStorage.setItem("firstLogin", 'true');
    sessionStorage.setItem('appCode',this.projectCode);
    this.passwordErr = false;
    this.userTips = '';
    // rsa加密
    const result = await OAuthApi.getRsaKey();
    const flag: boolean = typeof result === 'object' && result.hasOwnProperty('index') && result.hasOwnProperty('key');
    if (!flag) {
      return;
    }
    const {index, key} = result;
    const password: any = common.utils.RsaEncrypt(this.passWord, key);
    // rsa加密结束
    const params = {
      username: this.userName,
      password,
      url: this.redirectUrl,
      portal: true,
      index,
      //corpId:'RELEVANCE-04ef20b24bf24b4ba2a7daa6be08f150'
      corpId: this.syncCorpId,
      appCode: `${env.project}`
    };
    const res = await OAuthApi.login(params);
    if (res.errcode === 200 && res.code) {
      this.getTokenParams.code = res.code;
      await this.getToken(this.getTokenParams);
    } else if (res.errcode === 1000) {
      this.passwordErr = true;
      this.errTips = res.errmsg;
    } else if (res.errcode === 10001) {
      this.passwordErr = true;
      this.overflowTips = true;
      this.errTips = res.errmsg;
    } else if (res.errcode === 10002) {
      this.unAuthed = true;
    } else if (res.errcode === 1001) {
      this.userTips = res.errmsg;
      this.passwordErr = true;
      this.errTips = res.errmsg;
    }
    if(res.errcode !== 200){
      this.loginHelper.removeUserPassword();
    }
  }

  // private go2FlatMenu() {
  //   this.$router.push({
  //     name: 'workbench',//业务平台
  //   });
  // }
  private go2FlatMenu() {
    this.$router.push({
      name: 'Workbench',//协调设计
    });
  }

  // private go2FlatMenu() {
  //   this.$router.push({
  //     name: 'flatMenu',
  //     query: {
  //       id: 'index'
  //     }
  //   });
  // }

  private go2BimView() {
    this.$router.push({
      name: 'BIMView',
    });
  }

  private go2InformationPortal() {
    const {projectConfig} = this;
    if (!projectConfig?.multiProjectFlag) {
      this.$router.push({
        name: 'workbench',
        // query: {
        //   id: 'index'
        // }
      });
    } else {
      this.$router.push({
        name: 'InformationPortal',
      });
    }
  }

  private async getProjectInfo() {
    const {projectConfig} = this;
    if (!projectConfig?.multiProjectFlag) {
      //单项目需判断是否直接进bimplatForm
      if (projectConfig?.projectLevel === ProjectLevel['项目']) {
        OAuthApi.getProjectInfo({
          appCode: this.projectCode,
          projectName: projectConfig?.projectName as string,
        }).then(res => {
          if (res.errcode === 0) return this.$router.push({name: 'BIMPlatform', query: res.data});
        })
      } else {
        this.$router.push({name: 'BIMView'});
      }
    } else {
      OAuthApi.getProjectTree({
        appCode: this.projectCode ? this.projectCode : ''
      }).then((res: any) => {
        if (!res.data) return
        if (res.data.length === 0) return;
        const name = res.data[0].title;
        const level = ProjectLevel[res.data[0].value.split('-')[1] as string];
        //多项目如果只存在项目级，默认进入第一个项目
        if (level !== 2) {
          this.$router.push({name: "BIMView"})
        } else {
          OAuthApi.getProjectInfo({
            appCode: this.projectCode,
            projectName: name as string,
          }).then(ress => {
            if (ress.errcode === 0) return this.$router.push({name: 'BIMPlatform', query: ress.data});
          })
        }
      });
    }
  }

  /**
   * 获取token
   */
  async getToken(params: any) {
    const res = await OAuthApi.getToken(params);
    if (res && res.success) {
      const token = (res as any).access_token;
      const refresh_tokens = (res as any).refresh_token;
      const expireTime = (res as any).exp;
      const isAdmin = (res as any).user_name === 'admin';

      localStorage.setItem('refresh_token', refresh_tokens);
      localStorage.setItem('expireTime', expireTime);
      localStorage.setItem('token', token);
      localStorage.setItem('_isAdmin', isAdmin + '');
      //@ts-ignore
      localStorage.setItem('checked', this.remember);
      localStorage.setItem('user_name', this.userName);
      localStorage.setItem('pwd', this.passWord)
      //根据Project存放用户密码
      this.loginHelper.setUserPassword({userName:this.userName,password:this.passWord});
      if(this.remember){
        this.loginHelper.saveUserPasswordToLocalStorage();
      }
      const initPage = await OAuthApi.getLoginPage({
        appCode: this.projectCode ?? '',
        level: this.projectConfig?.projectLevel ?? 2
      });
      if (initPage?.data) {
        if (initPage.data == 'BIMView') return this.getProjectInfo();
        return this.$router.push({name: initPage.data});
      }

      // if (this.projectConfig?.projectLevel == 2) return this.getUserInfo(this.go2FlatMenu)
      this.getUserInfo(this.go2FlatMenu);
    }
  }

  private rememberInfo(e) {
    const status = e.target.checked;
    if (status) {
      this.remember = true;
    } else {
      this.remember = false;
      localStorage.removeItem('user_name');
      localStorage.removeItem('pwd');
      this.loginHelper.removeUserPassword();
      this.loginHelper.saveUserPasswordToLocalStorage();
    }
  }
  gologinBoxJJT(){
    this.$emit('myJjt',true)
  }
  modifyPassword() {
    window.open('https://jjt.ctesi.com.cn/Update/check')
  }
}
</script>
<style lang="less" scoped>
.login-account {
  padding-top: 40px;
  width: 400px;
  &-header {
    font-size: 30px;
    color: #333;
    line-height: 40px;
    margin: 50px 0 42px 0;
  }

  &-type {
    position: absolute;
    top: 32px;
    right: 32px;
    cursor: pointer;

    img {
      width: 44px;
    }
  }

  &-forget {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    text-align: right;
    cursor: pointer;
  }

  .login-btn {
    width: 280px;
    background: #17bc94;
    border-radius: 4px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    color: #fff;
    margin: 42px auto;
    cursor: pointer;
    .anticon {
      margin-right: 4px;
    }
  }

  .loginDisabled {
    color: rgba(255, 255, 255, 0.6);
  }

  .icon {
    cursor: pointer;
  }

  .login-account-forget {
    float: right;
  }
}

.login-err-box {
  position: relative;

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
    top: 5px;
    left: 0;
  }
}

.ant-modal-content {
  .ok-btn {
    background: #17bc94;
    border: 1px solid #17bc94;
  }

  .ant-modal-body {
    .img {
      margin-top: 26px;
    }

    .img-text {
      margin: 16px 0 18px 0;
    }

    .overflow-text {
      font-size: 16px;
    }
  }
}


//newCJHDJ
.newInput {
  width: 381px;
  //width:277px;
  height: 62px;
   //height: 40px;
  /deep/ input[class=ant-input] {
    height: 100%;
  }
}

/deep/ .ant-input-affix-wrapper .ant-input:not(:first-child) {
  padding-left: 45px;
  background: #fff;
  border: 1px solid #DDDDDD;
  border-radius: 6px;
  font-size: 17px;
}

/deep/ .ant-input-affix-wrapper .ant-input:not(:first-child)::placeholder {
  font-family: Source Han Sans CN;
  font-weight: 400;
  color: #BBBBBB;
}

.newInputIcon {
  & > img {
    width: 100%;
    height: 100%;
  }
}

.login-account {
  padding-top: 40px;
}

.bottom22 {
  margin-bottom: 22px;
}

.bottom29 {
  margin-bottom: 29px;
}


.operator {
  display: flex;
  align-items: center;
  width: 381px;
  height: 20px;
  //font


  .rememberPwd {
    width: 68px;
    height: 16px;
    font-size: 16px;
    font-family: Source Han Sans CN;
    font-weight: 300;
    color: #999999;
  }
}

.forgetPwd {
  width: 78px;
  font-size: 16px;
  font-family: Source Han Sans CN;
  font-weight: 300;
  color: #999999;
  margin-left: auto;
  cursor: pointer;
}

/deep/ .ant-checkbox-checked .ant-checkbox-inner {
  background-color: white;
  border-color: #999999;
}

/deep/ .ant-checkbox-checked .ant-checkbox-inner::after {
  border-color: #999999;
}

.loginButton {
  //width: 176px;
  width: 381px !important;
  //width: 277px !important;
  height: 48px !important;
  line-height: 48px !important;
  //background: #0783E5 !important;
  background: #2e50a1 !important;
  box-shadow: 0px 3px 15px 0px rgba(6, 138, 236, 0.39);
  border-radius: 6px !important;
  margin: 42px 0 30px 0 !important;
  font-size: 18px;
  font-family: Source Han Sans CN;
  font-weight: 400;
  color: #FFFFFF !important;
}


</style>
