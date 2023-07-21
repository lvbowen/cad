<template>
  <div class="empty-page">
    <div class="main">
      <!-- <img src="@/components/global/empty.png"> -->
      <div class="main-qrcode">
        <img :src="qrCode" />
      </div>
      <p class="main--success">
        提交数据成功
      </p>

      <p class="main__tip" style="color: red;font-size: 15px">
        长按保存上方二维码
      </p>
      <p class="main__tip">
        随时扫描查看数据信息
      </p>

      <!-- <div class="main__btn">
        <a-button @click="download">下载二维码</a-button>

        <a-button @click="close" type="primary">关闭当前页面</a-button>
      </div> -->

      <!-- <a-button @click="close" v-if="showClose">{{ $t('languages.common.close') }}</a-button> -->
    </div>
  </div>

</template>

<script lang="ts">

import {
  Component, Vue
} from 'vue-property-decorator';


import env from '@/config/env';

import { externalLinkApi } from '@cloudpivot/api';
import OAuthApi from '@/apis/oauth';


@Component({
  name: 'empty-page',
  components: {
  }
})
export default class EmptyPage extends Vue {

  qrCode = '';

  created() {
    const projectCode = this.$root.$children[0].$el.baseURI.split("/")[3];
    OAuthApi.getSystemConfig().then((res:any) => {
      if (res) {
        let url = `${window.location.protocol}//${window.location.host}/${projectCode}/mobile/el.html?c=${this.shortCode}`;
        if ((window as any).isStartWorkflow) {
          url = `${window.location.protocol}//${window.location.host}/${projectCode}/mobile/el.html?w=${this.shortCode}`;
        }
        this.qrCode = `${env.apiHost}/api/qrcode/generate_qrcode?text=` + url;
      }
    });

    setTimeout(()=>{
      this.$h3.toast.hide();
    },1000);
  }

  get shortCode() {
    return this.$route.params.shortCode;
  }

  close() {
    window.opener = null;
    window.open('', '_self');
    window.close();
  }

  download() {

  }

  downloadFile(blob: any, fileName: string) {
    //@ts-ignore
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  }



  // get showClose(){
  //   if(this.isExternalLink){
  //     return false;
  //   }

  //   if(this.isDingtalk){
  //     return false;
  //   }

  //   return true;
  // }

  // get isExternalLink() {
  //   const token = (window as any).externalLinkToken;
  //   return Boolean(token);

  // }

  // get isDingtalk(){
  //   return isDingtalk;
  // }
}
</script>
<style lang="less">
  .empty-page{
    .main{
      padding-top: 3.55rem;
      // display: flex;
      // flex-direction: column;
      // justify-content: center;
      // align-items: center;
      text-align: center;

      &__tip{
        margin: 0 auto;
        width: 6.67rem;
        font-size: 0.29rem;
        font-weight:400;
        color:rgba(0,0,0,0.45);
        line-height:17px;
        margin-top: 8px;
        margin-bottom: 14px;
      }

      &__btn {
        button{
          margin-right: 8px;
        }
      }
    }
    .main-qrcode{
      margin: 0 auto;
      width: 6.67rem;
      height: 4.85rem;
      background: url('./el-success.png');
      background-size: 100%;
      img{
        width: 3.92rem;
        height: 3.92rem;
        margin: 0.39rem auto;
        border-radius: 0.2rem;
        border:1px solid rgba(221,221,221,1);
      }
    }
    .main--success {
      font-size: 0.4rem;
      font-weight:400;
      color:rgba(0,0,0,0.85);
      // line-height:25px;
    }

  }
</style>
