<template>
  <div>
    <YingShiYun v-if="type===0"/>
    <QingShi v-if="type===1"/>
  </div>
</template>

<script lang="ts">
import { Component,Vue, InjectReactive } from "vue-property-decorator";
import YingShiYun from "./yingShiYun.vue";
import QingShi from "./qingShi.vue";
import * as Api from '../../service/api';
import * as Type from "../../type";

@Component({
  name: "VideoSurveillance",
  components: {
    YingShiYun,QingShi
  }
})
export default class VideoSurveillance extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  @InjectReactive("project") projectCode;
  type: number=0;

  mounted() {
    this.getVideoType();
  }

  getVideoType() {
    Api.getVideoType({appCode: this.projectCode ?? ""}).then(res => {
      if (res.errcode === 0) {
        this.type = res.data;
      }
    })
  }
};
</script>

