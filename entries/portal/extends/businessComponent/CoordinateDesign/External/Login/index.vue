<template>
  <div class="formModel">
    <div class="loginWrap">
      <div class="formModelTitle">
        <img class="formModelTitleImg" src="../../../../../src/assets/extends/CoordinateDesign/External/login.logo.png" alt="">
        <p class="formModelTitleContent" :style="{marginBottom:!loginChange? '20px':''}">{{ projectTitle }}</p>
      </div>
      <div v-if="!loginChange" style="text-align: center">
        <a-form-model
          ref="loginForm"
          :model="formModel.model"
          :rules="formModel.rules">
          <a-form-model-item ref="userName" prop="userName">
            <a-input
              @pressEnter="onSubmit"
              v-model="formModel.model.userName"
              placeholder="请输入AD域账号"
              allowClear>
              <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item ref="password" prop="password">
            <a-input-password
              @pressEnter="onSubmit"
              v-model="formModel.model.password"
              placeholder="请输入密码"
              allowClear>
              <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)" />
            </a-input-password>
          </a-form-model-item>
          <div class="operator flex flex-space-between flex-center-align">
            <a-checkbox :checked="remember" @change="rememberInfo"><span class="rememberPwd">记住密码</span></a-checkbox>
            <p class="forgetPwd" @click="modifyPassword">忘记密码?</p>
          </div>
          <a-button type="primary" block @click="onSubmit" style="margin-bottom: 20px"><a-icon v-if="logging" type="loading"/>登录</a-button>
        </a-form-model>
        <a @click="goQrCodeLogin">使用扫码登录</a>
      </div>
      <JjtLogin v-else-if="loginChange" :qrCodeStyle="qrCodeStyle" @myEvent="goLoginBox"></JjtLogin>
    </div>
  </div>

</template>
<script lang="ts">
  import { Component, Vue, Ref, InjectReactive, Watch } from 'vue-property-decorator';
  import {FormModel,Input,Icon,Button,Modal} from "@h3/antd-vue";

  import * as Type from '../../../../../extends/type';
  import OAuthApi from '@/apis/oauth';
  import env from '@/config/env';
  import common from '@cloudpivot/common';
  import Checkbox from 'ant-design-vue/lib/checkbox';
  import 'ant-design-vue/lib/checkbox/style/index.css';

  import JjtLogin from "../../../../../src/views/login/jjt-login.vue";
  import LoginHelper from "../../../../../src/views/login/loginHelper";

  @Component({
    name:"ExternalLogin",
    components:{
      [Input.name]:Input,
      [Input.Password.name]:Input.Password,
      [FormModel.name]:FormModel,
      [FormModel.Item.name]:FormModel.Item,
      [Icon.name]:Icon,
      [Button.name]:Button,
      [Modal.name]:Modal,
      ACheckbox: Checkbox,
      JjtLogin
    }
  })
  export default class ExternalLogin extends Vue {
    @InjectReactive('project') private projectCode!: string;
    @InjectReactive('projectConfig') private projectConfig?: Type.ProjectConfig;
    @Ref("loginForm") loginForm!:FormModel;
    @InjectReactive('title') projectTitle?: string;

    redirectUrl: string = '';  // 登陆回跳地址
    depts: any[] = [];
    deptId: string = '';

    appId: string = '';
    agentid: string = ''; // 微信扫码登陆需要agentid
    corpId = '';


    formModel={
      model:{
        userName:"",
        password:"",
      },
      rules:{
        userName:[
          { required: true, message: '请输入AD域账号', trigger: ['change', 'blur'] },
        ],
        password:[
          { required: true, message: '请输入密码', trigger: ['change', 'blur'] },
        ],
      },
    }

    getTokenParams: any = {
      code: '',
      url: '',
      client_secret: '',
      client_id: '',
      redirect_uri: ''
    };

    qrCodeStyle:string = "data:text/css;base64,LmltcG93ZXJCb3h7dGV4dC1hbGlnbjogbGVmdDt9Ci5pbXBvd2VyQm94IC50aXRsZSB7ZGlzcGxheTogbm9uZTt9Ci5zdGF0dXNfaWNvbiB7ZGlzcGxheTogbm9uZX0KLmltcG93ZXJCb3ggLmluZm8ge3dpZHRoOiAyMTBweDttYXJnaW46MH0K";

    // qrCodeStyle:string=''
    loginChange:boolean=true;

    modifyPassword() {
      window.open('https://jjt.ctesi.com.cn/Update/check')
    }

    /*切换账号密码登录*/
    goLoginBox(val){
      this.loginChange=val;
    }
    /*切换交建通扫码登录*/
    goQrCodeLogin(){
      this.loginChange=true;
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

    created(){
      localStorage.setItem('loginType','loginExternal')
      this.generateUrls();
    }

    async mounted(){
      sessionStorage.setItem('isExternal','1')
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expireTime');
      const flag = localStorage.getItem('checked') === 'true';
      if (!flag) {
        localStorage.removeItem('user_name');
        localStorage.removeItem('pwd');
        localStorage.removeItem('checked');
      }else {
        this.remember = flag;
        this.formModel.model.userName = localStorage.getItem('user_name') as string;
        this.formModel.model.password = localStorage.getItem('pwd') as string;
        // let userPassword=this.loginHelper.getUserPassword();
        // if (userPassword) {
        //   this.formModel.model.password=userPassword?.password as string;
        //   this.formModel.model.userName=userPassword?.userName as string;
        // }
      }
      const res: any = await OAuthApi.getDepts();
      if (res.errcode !== 0) {
        this.$message.error(res.errmsg);
        return;
      }
      this.depts = res.data;
      if (this.depts.length > 0) {
        let deptId = this.depts[0].corpId;
        this.deptId = deptId;
        this.onDeptChange(deptId, {});
      } else {
        this.$router.push({
          name: 'loginError'
        }).catch((err: any) => {err});
        return;
      }
    }

    onDeptChange(deptId: string, obj: any) {
      const dept = this.depts.find(d => d.corpId === deptId);
      if (!dept) {
        Modal.error({
          title: "找不到组织机构记录"
        });
        return;
      }

      // 切换登录界面的组织时，获取到组织变化，拿到选择的组织对应的pcServerUrl地址，变更浏览器地址栏地址
      let pcServerUrl: string = '';
      // debugger;
      if (obj.key) {
        for (let item of this.depts) {
          if (item.corpId === deptId) {
            pcServerUrl = item.pcServerUrl;
            break;
          }
        }

        const index: number = pcServerUrl.indexOf('/');
        if (index > -1) pcServerUrl = pcServerUrl.substring(0, index);
        //window.location.href = pcServerUrl + '/login?corpId=' + dept.corpId;
        // window.location.href = env.portalHost  + '/login?corpId=' + dept.corpId;
        this.$router.push({
          name: 'loginExternal'
        }).catch((err: any) => {err});
      }
      this.appId = dept.scanAppId;
      this.agentid = dept.agentId;
      this.corpId = dept.corpId;
    }
    logging: boolean = false;
    onSubmit(){
      let valided:boolean=false
      this.loginForm.validate(valid=>{
        valided=valid;
      });
      if(!valided){
        return;
      }
      // this.login();
      this.logging = true
      OAuthApi.getLogin({
        username: this.formModel.model.userName,
        password: this.formModel.model.password
      }).then((res)=> {
        this.logging = false
        if(res.errcode!==0) return this.$message.error(res.data as string)
        if(!res.data) return;
        localStorage.setItem('checked', this.remember.toString());
        // this.loginHelper.setUserPassword({userName:this.formModel.model.userName,password:this.formModel.model.password});
        // if(this.remember){
        //   this.loginHelper.saveUserPasswordToLocalStorage();
        // }
        localStorage.setItem('user_name', this.formModel.model.userName as string);
        localStorage.setItem('pwd', this.formModel.model.password)
        window.open(`${env.apiHost}/login/ldapoAuth?code=${res.data}`,'_self')
      }).finally(()=> {
        this.logging = false
      })
    }

    /**
     * 账户密码登录
     */
    async login() {
      window.sessionStorage.clear();
      sessionStorage.setItem("firstLogin", 'true');
      // rsa加密
      const result = await OAuthApi.getRsaKey();
      const flag: boolean = typeof result === 'object' && result.hasOwnProperty('index') && result.hasOwnProperty('key');
      if (!flag) {
        return;
      }
      const {index, key} = result;
      const password: any = common.utils.RsaEncrypt(this.formModel.model.password, key);
      // rsa加密结束
      const params = {
        username: this.formModel.model.userName,
        password,
        url: this.redirectUrl,
        portal: true,
        index,
        //corpId:'RELEVANCE-04ef20b24bf24b4ba2a7daa6be08f150'
        corpId: this.corpId,
        appCode: `${env.project}`
      };
      const res = await OAuthApi.login(params);
      if (res.errcode === 200 && res.code) {
        this.getTokenParams.code = res.code;
        await this.getToken(this.getTokenParams);
      } else{
        this.$message.error(`登录失败,${res.errmsg}`);
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
        localStorage.setItem('user_name', this.formModel.model.userName);
        localStorage.setItem('pwd', this.formModel.model.password);
        this.getUserInfo(this.go2FlatMenu);
      }
    }
    private go2FlatMenu() {
      this.$router.push({
        name: 'ProjectTask',//协调设计
      });
    }
    //TODO START 记住密码
    loginHelper = new LoginHelper();
    remember: boolean = false;
    private rememberInfo(e) {
      const status = e.target.checked;
      if (status) {
        this.remember = true;
      } else {
        this.remember = false;
        localStorage.removeItem('user_name');
        localStorage.removeItem('pwd');
        // this.loginHelper.removeUserPassword();
        // this.loginHelper.saveUserPasswordToLocalStorage();
      }
    }
    //TODO END
    private async getUserInfo(callback: Function) {
      const res = await OAuthApi.getUserInfo();

      if (res.errcode === 0) {
        const info: any = res.data;
        sessionStorage.setItem("user", JSON.stringify(info));
        sessionStorage.setItem('isExternal','1')
        callback?.();
      }
    }

      // 切换组织的时候需要重新初始化
  @Watch('corpId', {immediate: true})
  onSyncCorpIdChange(corpId: any) {
    if (corpId) {
      this.generateUrls();
    }
  }

  }
</script>

<style lang="less" scoped>
@import '../../../../styles/public.module.less';
.bpm-container{
  min-width: unset!important;;
}
@media screen and (min-width: 451px){
  .formModel{
    width: 400px;
  }
}
@media screen and (max-width: 450px){
  .formModel{
    width: 80%;
  }
}
@media screen and (max-width: 320px){
  .formModel{
    width: 90%;
  }
}
.loginWrap{
  width: 100%;
  .flex-column; .flex-center;
}
.formModel{
  width: 100%;
  height: 100%;
  .flex-column; .flex-center;
}
.formModelTitle{
  text-align: center;
  .formModelTitleImg{
    margin-bottom: 20px;
  }
  .formModelTitleContent{
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 3px;
  }
}
.operator {
  margin-bottom: 8px;
  .forgetPwd {
    font-size: 14px;
    cursor: pointer;
    font-family: Source Han Sans CN;
    font-weight: 300;
    color: #999999;
    text-align: right;
  }
  .rememberPwd {
    width: 68px;
    font-family: Source Han Sans CN;
    font-weight: 300;
    color: #999999;
  }
}
</style>
