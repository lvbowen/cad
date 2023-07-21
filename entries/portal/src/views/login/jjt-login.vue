<template>
  <div class="qrcode-wrap" :class="qrCodeStyle!==''?'qrcode-wrap-copy':'qrcode-wrap'">
    <div id="jjt-reg" :class="qrCodeStyle!==''?'external-reg':'jjt-reg'"></div>
    <a @click="goLoginBox" :style="{paddingLeft:qrCodeStyle!==''?'0':'60px',paddingRight:qrCodeStyle!==''?'20px':'',}">使用AD域账号登录</a>
  </div>
</template>
<script lang="ts">
import {Component, Vue,Prop} from "vue-property-decorator";

@Component({
  name: "index",
  components: {},
})
export default class index extends Vue {
  @Prop({type: String, default: ''}) qrCodeStyle!:string;
  show:boolean = false;

  loginType:string|null = '';
  goLoginBox(){
    this.$emit('myEvent',false)
  }

  mounted(){
    this.loginType=localStorage.getItem('loginType')
    const url=`https://collaborativedesign.ctesi.com.cn/api/login/jjtoAuth`
    //@ts-ignore
    window.WwLogin({
      id : "jjt-reg",
      appid : "wl2c5e89d5c4",
      agentid : "1002436",
      redirect_uri :encodeURIComponent(url),
      state : "web_login@gyoss9",
      href : this.qrCodeStyle
    })
  }
}
</script>
<style lang="less" scoped>
.qrcode-wrap{
  width: 380px;
  height: 100%;
  padding: 20px 66px 0;
  text-align: center;
  position: relative;

  .jjt-reg{
    width:300px;
    height: 405px;
  }
  .external-reg{
    width:300px;
    height: 340px;
    overflow: hidden;
  }
}
.qrcode-wrap-copy{
  width: 380px;
  height: 100%;
  padding-left: 80px;
  text-align: center;
  position: relative;
}
</style>
