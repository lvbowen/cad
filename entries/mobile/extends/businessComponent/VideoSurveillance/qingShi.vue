<template>
  <div>
    <apptitle :title="'视频监控'" routeUrl="business"></apptitle>
    <div class="main">
      <pull-refresh v-model="refreshing" @refresh="onRefresh">
        <list
          v-model="loading"
          :finished="finished"
          finishedText="没有更多了"
          @load="onLoad"
        >
          <grid :border="false" :columnNum="2">
            <grid-item
              :text="item.channelName"
              v-for="(item,i) in videoList"
              :key="i"
              @click="go2Detail(item)">
              <img :src="item.snapLocal?item.snapLocal:videoImg" :alt="item.channelName" class="grid_item_img"/>
              <p class="grid_item_text" :style="{color:item.deviceOnline===0?'red':'green'}">{{ item.channelName }}</p>
            </grid-item>
          </grid>
        </list>
      </pull-refresh>
    </div>
  </div>
</template>

<script lang="ts">
import apptitle from "../components/appTitle.vue";
import {Component, Vue, InjectReactive} from "vue-property-decorator";
import {List, PullRefresh, Grid, GridItem, Toast} from "vant";
import * as Api from "../../service/api";
import * as Type from "../../type";
import videoImg from "../../Img/videoimg.png"
//@ts-ignore
@Component({
  name: "QingShi",
  components: {
    apptitle, List, PullRefresh, Grid, GridItem, Toast
  },
})
export default class QingShi extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive("project") projectCode;

  videoImg:HTMLImageElement=videoImg;
  page: number = 1;
  size: number = 6;
  loading: boolean = false;
  finished: boolean = false;
  refreshing: boolean = false;
  videoList: Array<Type.QingShiDeviceData> = []

  async getDevicePageByProjectName() {
    let data: any = [];
    await Api.getDevicePageByProjectNameQingShi({
      appCode: this.projectCode ?? "",
      projectName: this.projectConfig?.projectName ?? "",
      page: this.page,
      size: this.size
    }).then(res => {
      if (res.errcode === 0 && res.data?.records) {
        data = res.data;
      }
    })
    return data;
  }

  go2Detail(item) {
    if (item.deviceOnline === 0) return Toast.fail('设备已离线')
    this.$router.push({
      name: "QingshiDetail",
      query: item,
    });
  }

  onRefresh() {
    // 清空列表数据
    this.videoList = [];
    this.finished = false;
    this.page = 1;
    // 重新加载数据
    // 将 loading 设置为 true，表示处于加载状态
    this.loading = true;
    this.onLoad();
  }

  async onLoad() {
    // setTimeout(() => {
    if (this.refreshing) {
      this.videoList = [];
      this.refreshing = false;
    }
    const resData = await this.getDevicePageByProjectName();
    if (resData) {
      this.videoList.push(...resData.records);
      this.page++;
    }
    this.loading = false;
    if (this.videoList.length >= resData.total) {
      this.finished = true;
    }
  }
};
</script>

<style lang="less" scoped>
.main {
  height: calc(100vh - 95px);
  overflow: auto;

  .grid_item_img {
    height: calc(30vh - 80px);
    width: 42vw;
  }

  .grid_item_text {
    margin: 5px;
    font-size: 15px;
  }

}
/deep/ ::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 5px transparent;
  background: transparent
}
</style>
