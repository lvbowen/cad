<template>
  <div class="relay-route">
    <span v-if="showTip">请从pc端交建通打开该消息！</span>
  </div>
</template>

<script lang="ts">
import {Component,Vue} from "vue-property-decorator";
import Utils from "../../../utils";
import { getRealUrl } from "../../../service/api";
import axios from "axios";
import env from "@/config/env"; //IS_WECHAT
import { IS_WECHAT } from "@cloudpivot/platform";

@Component({
  name:"RelayRoute",
  components: {
  }
})
export default class RelayRoute extends Vue {
  showTip: boolean = false;
  created() {
    const query = Utils.GetRequest();//code
    // window.location.href = `http://localhost:9101/XTSJ/mobile/#/MobileRelayRoute?${decodeURIComponent(window.location.href.substring(window.location.href.indexOf('param')))}`
    if (IS_WECHAT) {
      location.href = `${env.portalHost}/mobile/#/MobileRelayRoute?${decodeURIComponent(location.href.substring(location.href.indexOf('param')))}` //
    }else {
      if (query.hasOwnProperty('code')) {
        axios.get(`${env.apiHost}/login/xtsjiam`, {
          params: {code: query.code},
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res0:any)=> {
          console.log(res0,'res0')
          if(res0.errcode===0&&res0.access_token) {
            localStorage.setItem('token',res0.access_token);
            localStorage.setItem('refresh_token',res0.refresh_token)
            setTimeout(()=> {
              getRealUrl({
                appCode: 'XTSJ',
                param: query.param,
                client: 'pc'
              }).then((res)=> {
                if(res.errcode!==0) return this.$message.error(res.errmsg as string)
                if(!res.data) return;
                window.location.href = res.data;
              })
            },200)
          }
        })
      }
    }
}
}
</script>

<style scoped lang="less">
.relay-route {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin-top: 16px;
}
</style>
