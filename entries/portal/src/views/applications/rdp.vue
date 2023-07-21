<template>
  <div style="height: 100%;width: 100%">
    <iframe
      :src="iframeUrl"
      style="height: 100%;width: 100%"
      frameborder="0"
      :key="iframeUrl"></iframe>
  </div>

</template>

<script lang="ts">

import {Component, Vue, Prop, Watch, InjectReactive} from 'vue-property-decorator'
import OAuthApi from "@/apis/oauth";
import * as Type from "../../../extends/type";

@Component({
  name: "app-rdp",
  components: {},
})
export default class AppReport extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  iframeUrl: string = '';

  mounted() {
    OAuthApi.getRdpView({
      reportCode: this.$route.params.reportCode,
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    }).then(res => {
      this.iframeUrl = res.data
    })
  }

  @Watch( "$route" )
  onRouteChange( to, from ) {
    if ( to.path === from.path ) return;
    OAuthApi.getRdpView({
      reportCode: this.$route.params.reportCode,
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    }).then(res => {
      this.iframeUrl = res.data
    })
  }
}
</script>


<style lang="less" scoped>

.report {
  height: 100%;
}

</style>
