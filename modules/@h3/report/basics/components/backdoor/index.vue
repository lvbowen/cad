<template>
  <div :class="[prefixCls, hasSlot ? '' : `${prefixCls}-free`]" @click="showVersion">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Modal } from "@h3/antd-vue";
import fetch from "@h3/report/basics/config/fetch";
import axios from "axios";
import env from "../../config/env";

/**
 * 用法：
 * 1.嵌套使用，例如<backdoor><item></backdoor>，此时点击item即可触发
 * 2.直接使用，例如<backdoor />，此时会绝对定位在页面右下角20*20的区域，点击触发
 */

@Component({
  name: "h3-report-backdoor"
})
export default class Backdoor extends Vue {
  prefixCls: string = "h3-report-backdoor";
  count: number = 0;
  countdown: any = 0;
  canGetVersion: boolean = true;
  version: string = "";
  buildTimestamp: string = "";
  pomVersion: string = "";
  modal: any;

  get hasSlot() {
    return this.$slots.default && this.$slots.default.length > 0;
  }

  //点击开始计时，3秒内点击10次
  showVersion() {
    if (this.canGetVersion) {
      this.count++;
      if (!this.countdown) {
        this.countdown = setTimeout(() => {
          this.deleteTimeout();
        }, 3000);
      }

      if (this.count >= 10) {
        this.getVersion().then((res: any) => {
          const { buildTimestamp, pomVersion, version } = res;
          this.modal.update({
            content: this.createModalContent(buildTimestamp, pomVersion, version)
          });
        });
        const h = this.$createElement;
        this.modal = Modal.info({
          title: "系统版本号",
          class: `${this.prefixCls}-modal`,
          content: h("div", {}),
          onOk() {}
        });
        this.deleteTimeout();
      }
    }
  }

  createModalContent(buildTimestamp, pomVersion, version) {
    const h = this.$createElement;
    return h("div", {}, [
      h("p", `前端版本号: ${(window as any).rx_report}`),
      h("p", `后端版本号: ${version}`),
      h("p", `代码版本: ${pomVersion}`),
      h("p", `构建时间: ${buildTimestamp}`)
    ]);
  }

  getVersion() {
    if (this.canGetVersion) {
      this.canGetVersion = false;
      setTimeout(() => {
        this.canGetVersion = true;
      }, 5000);

      return new Promise((resolve, reject) => {
        const req = fetch<H3.ReportAPI.ProResponse>({
          url: `dashboard/v1/service/info`,
          method: "get",
          data: {}
        }).promise;

        req
          .then((res: H3.ReportAPI.ProResponse) => {
            if (res && res.data) {
              resolve(res.data);
            } else {
              reject();
            }
          })
          .catch(() => {
            reject();
          });
      });
    } else {
      return new Promise(resolve => {
        resolve();
      });
    }
  }

  deleteTimeout() {
    this.count = 0;
    clearTimeout(this.countdown);
    this.countdown = null;
  }
}
</script>
<style lang="less">
.h3-report-backdoor-free {
  width: 20px;
  height: 20px;
  position: fixed;
  bottom: 0;
  right: 0;
}
.h3-report-backdoor-modal {
  .ant-modal-confirm-content {
    margin-top: 20px;

    p {
      margin-bottom: 0.5em;
    }
  }
}
</style>
