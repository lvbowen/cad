<template>
  <div class="panoramic-view">
    <div class="header flex-center-align">
      <!-- <Icon name="arrow-left" @click="$router.go(-1)"/> -->
      <div>720全景</div>
    </div>
    <div class="content">
      <template v-if="dataArr.length">
        <TimeLine :data-arr="dataArr"/>
      </template>
      <div v-else class="blank">
        <img src="../../Img/blank.png"/>
        <p>暂无</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import { Icon } from 'vant';
//@ts-ignore
import TimeLine from "./timeLineBox/timeLineBox";
import { getPanoramicManage } from "../../service/business";
import env from '@/config/env'

@Component({
  name: 'PanoramicView',
  components: {
    Icon,
    TimeLine
  }
})
export default class PanoramicView extends Vue{
  @InjectReactive('projectConfig') projectConfig;
  dataArr: Array<any> = [];
  mounted() {
    getPanoramicManage({
      projectCode: env.project,
      multiProjectFlag:this.projectConfig?.multiProjectFlag??false,
      projectName: this.projectConfig?.projectName??'',
    }).then((res)=> {
      //@ts-ignore
      if(res.errcode === 0) {
        if(!res.data) return;
        if(Array.isArray(res.data) && res.data.length) {
          this.dataArr = res.data;
        }
      }
    })
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
.panoramic-view {
  display: flex;
  flex-direction: column;
  .header {
    .px2rem(padding, @spacing-large);
    color: @font-color-base;
    .px2rem(font-size, 32);
    background-color: #2758fd;
    .px2rem(height, 88px);
    > div {
      margin: 0 auto;
      font-weight: bold;
    }
  }
  .content {
    overflow: auto;
    height: inherit;
    background-color: @font-color-base;
    .px2rem(padding, @spacing-large);
    .blank {
      color: #8D8C8C;
      p {
        .px2rem(margin-top, 20);
        .px2rem(margin-bottom, 20);
      }
      img {
        width: 50%;
      }
    }
  }
}
</style>
