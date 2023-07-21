<template>
  <div class="relay-route">
  </div>
</template>

<script lang="ts">
import {Component,Vue} from "vue-property-decorator";
import Utils from "../../utils";
import axios from "axios";
import env from "@/config/env";
import {utils} from "@cloudpivot/common";
import { getRealUrl } from "../../service/api";
import { Toast } from "vant";

@Component({
  name:"MobileRelayRoute",
  components: {
  }
})
export default class MobileRelayRoute extends Vue {
  getRequest() {
    const url = decodeURIComponent(`?${location.href.substring(location.href.indexOf('param'))}`);
    const theRequest = {};
    if (url.indexOf("?") != -1) {
      const str = url.substr(1), strs = str.split("&");
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].substring(strs[i].split("=")[0].length+1));
      }
    }
    return theRequest;
  }
  created() {
    utils.Bus.$emit('toggleNavbar', false)
    console.log(location.href,'href')
    // const query = Utils.GetRequest();//code
    const query = this.getRequest();
    if (query.hasOwnProperty('code')) {
      axios.get(`${env.apiHost}/login/xtsjiam`, {
        //@ts-ignore
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
              //@ts-ignore
              param: query.param,
              client: 'wxwork'
            }).then((res)=> {
              if(res.errcode!==0) return Toast.fail(res.errmsg as string)
              if(!res.data) return;
              location.href = res.data;
            })
          },200)
        }
      })
  }
}
}
</script>

<style scoped lang="less">
</style>
