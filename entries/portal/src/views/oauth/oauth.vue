<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import OAuthApi from '@/apis/oauth';
import { utils } from '@cloudpivot/common';
import env from '@/config/env';

@Component({
  name: 'OAuth'
})
export default class OAuth extends Vue {
  code: string | null = null;
  loginType :string | null='';

  created() {
    this.loginType=localStorage.getItem("loginType")
    console.log(this.loginType,'this.loginType')
    console.log('oauth');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expireTime');
    sessionStorage.removeItem('user');
    this.getOauthCode();
  }

  render(h:any) {

  }

  getOauthCode() {
    this.code = utils.parseUrlParam(window.location.href, 'code');
    if (this.code) {
      this.getOAuthToken();
    }
  }

  async getOAuthToken() {
    const params: OAuth.RequestParams = {
      client_id: `${env.client_id}`,
      client_secret: `${env.secret}`,
      grant_type: 'authorization_code',
      redirect_uri: `${env.redirectHost}/oauth`,
      code: this.code,
    };
    const res = await OAuthApi.getSSOToken(params);
    const token = (res as any).access_token;
    const refresh_tokens = (res as any).refresh_token;
    const expireTime = (res as any).exp;
    const isAdmin = (res as any).user_name === 'admin';
    localStorage.setItem('_isAdmin', isAdmin + '');
    // const expires = res.data.expires_in;
    localStorage.setItem('refresh_token', refresh_tokens);
    localStorage.setItem('expireTime', expireTime);
    localStorage.setItem('token', token);
    // this.$router.push({ name: 'myUnfinishedWorkItem' }).catch((err: any) => {err});
    if(this.loginType==='loginExternal'){
      // this.$router.push({ name: 'ProjectTask' }).catch((err: any) => {err});//协同设计轻量化
      const userAgent:string = navigator.userAgent;
      if (userAgent.indexOf('Revit')>-1) {
        this.getUserInfo(this.goOldProjectTask);
      }else {
        this.getUserInfo(this.goProjectTask);
      }
    }else {
      // this.$router.push({ name: 'Workbench' }).catch((err: any) => {err});//协同设计
      this.getUserInfo(this.goWorkbench);
    }
  }
  private goProjectTask() {
    this.$router.push({ name: 'ProjectTask' }).catch((err: any) => {err});//协同设计轻量化
  }
  private goOldProjectTask() {
    this.$router.push({ name: 'OldProjectTask' }).catch((err: any) => {err});//协同设计轻量化
  }
  private goWorkbench() {
    this.$router.push({ name: 'Workbench' }).catch((err: any) => {err});//协同设计
  }

  private async getUserInfo(callback: Function) {
    const res = await OAuthApi.getUserInfo();

    if (res.errcode === 0) {
      const info: any = res.data;
      sessionStorage.setItem("user", JSON.stringify(info));
      callback?.();
    }
  }
  destroyed() {
    localStorage.removeItem('loginType');
  }
}

</script>
