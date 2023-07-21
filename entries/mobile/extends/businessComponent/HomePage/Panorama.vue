<template>
  <div class="panorama" v-if="panoramaCoverImg">
    <!-- 720全景 -->
    <div class="public_title">
      <div>720全景</div>
      <div @click="topanoramicView">
        <span>更多</span>
        <span> > </span>
      </div>
    </div>
    <div class="panorama_content">
      <div>
        <img @click="to720detail" :src="IMGURL + panoramaCoverImg" alt=""/>
        <p>{{ panoramaTitle }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive,Prop,Watch} from 'vue-property-decorator';
import * as Type from "../../type";
import {getMoblieFrontPage720} from "../../service/api";
import env from "@/config/env";

@Component({
  name: 'Panorama',
  components: {}
})
export default class Panorama extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode!: string;
  @Prop() projectName!:string;
  panoramaCoverImg:string[]=[];
  panoramaUrl:string='';
  panoramaTitle:string='';
  IMGURL:string= `${env.apiHost}`;
  @Watch('projectName',{immediate:true})
  watchProjectName(val) {
    this.init()
  }
  topanoramicView() {
    this.$router.push({
      name: "panoramicView",
    });
  }
  to720detail() {
    window.open(this.panoramaUrl);
  }
  init() {
    //@ts-ignore
    const userInfo = JSON.parse(sessionStorage.getItem("user"));
    getMoblieFrontPage720({
      projectName: this.projectConfig?.projectName ?? '',
      projectCode: this.projectCode,
      userId: userInfo?.id??''
    }).then(
      (res) => {
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.panoramaCoverImg = res.data.panoramic720?.panoramaCoverList
        this.panoramaUrl = res.data.panoramic720?.panoramaUrl;
        this.panoramaTitle = res.data.panoramic720.panoramaTitle;
      }
    );
  }

  mounted() {
    // this.init();
  }
}
</script>

<style scoped lang="less">
@import "~@/styles/mixins.less";
@import "~@/styles/common.less";
.panorama {
  // height: 260px;
  background: #ffff;
  border-radius: 10px;
  .px2rem(padding, 20);
  .px2rem(margin-top, 15);
  .px2rem(margin-bottom, 15);
  .px2rem(margin-left, 20);
  .px2rem(margin-right, 20);
  .public_title {
    display: flex;
    height: 45px;
    line-height: 45px;
    border-bottom: 1px solid #f0f1f6;
    margin-bottom: 15px;
    text-align: left;

    div:nth-child(1) {
      width: 85%;
      color: #333333;
      font-size: 16px;
      font-weight: 700;
    }

    div:nth-child(2) {
      width: 15%;

      span {
        color: #999;
        font-size: 14px;
      }
    }
  }
  .panorama_content{
    display: flex;
    .px2rem(padding-bottom,15);

    div {
      width: 100%;
      // height: 180px;
      padding: 10px;
    }

    div {
      img {
        width: 100%;
        margin-bottom: 14px;
        height: 80%;
      }

      p:nth-child(2) {
        color: #000;
        margin-bottom: 5px;
        font-size: 15px;
      }

      p:nth-child(3) {
        color: #666;
        margin-bottom: 0;
      }
    }
  }
}
</style>
