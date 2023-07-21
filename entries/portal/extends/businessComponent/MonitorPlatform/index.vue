<template>
  <div>
    <Common-Header />
    <MonitorPlatform style="height: calc(100% - 64px)" v-if="type===0"/>
    <QingMonitor style="height: calc(100% - 64px)" v-if="type===1"/>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import CommonHeader from "../../../src/components/shared/header/header.vue";
import {Component, InjectReactive} from "vue-property-decorator";
import MonitorPlatform from "./MonitorPlatform.vue";
import QingMonitor from "./QingMonitor.vue"
import * as Api from "../../service/api";

@Component({
  name: "monitorIndex",
  components: {
    CommonHeader,
    MonitorPlatform,
    QingMonitor
  },
})
export default class monitorIndex extends Vue {
  @InjectReactive("project") projectCode?: string;

  type: number = 0;

  mounted() {
    Api.getVideoTypeQingVideo({appCode: this.projectCode ?? ''}).then(res => {
      if (res.errcode === 0) {
          this.type = res.data??0;
      }
    })
  }
}
</script>

<style lang="less" scoped>

</style>
