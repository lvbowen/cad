<template>
  <div class="mobile-rdp">
    <iframe
      :src="iframeUrl"
      style="height: 100%;width: 100%"
      frameborder="0"
      :key="iframeUrl"></iframe>
  </div>

</template>

<script lang="ts">

import {Component, Vue, Prop, Watch, InjectReactive} from 'vue-property-decorator'
import * as Type from "../../type";
import { getRdpView } from "../../service/api";
import {utils} from "@cloudpivot/common";
@Component({
  name: "app-rdp",
  components: {},
})
export default class AppReport extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  iframeUrl: string = '';
  // iframeUrl: string = 'https://standard.wisdombim.com.cn/ReportMobile/show?uuid=rpf36068f79eb14639';

  mounted() {
    utils.Bus.$emit('toggleNavbar',false)
    getRdpView({
      reportCode: this.$route.query.code as string,
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      type: 'mobile'
    }).then(res => {
      this.iframeUrl = res.data
    })
  }
  @Watch( "$route" )
  onRouteChange( to, from ) {
    if ( to.path === from.path ) return;
    getRdpView({
      reportCode: this.$route.params.reportCode,
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      type: 'mobile'
    }).then(res => {
      this.iframeUrl = res.data
    })
  }
}
</script>


<style lang="less" scoped>
.mobile-rdp {
  height: 100%;
  width: 100%;
  >iframe {
    height: 99% !important;
  }
}
</style>
