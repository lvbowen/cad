<template>
  <div>
    <apptitle :title="'视频监控'" routeUrl="business"></apptitle>
    <van-overlay :show="loadingShow">
      <van-loading
        v-if="loadingShow"
        type="spinner"
        textColor="#0094ff"
        color="#0094ff"
        size="40px"
        vertical
        style="position: fixed;top:43vh;left:40vw">正在加载
      </van-loading>
    </van-overlay>
    <div v-if="videoData.length!==0&&!loadingShow" class="VideoSurveillance">
      <div
        @click="videoClick(item)"
        class="video"
        v-for="(item, index) in videoData"
        :key="index"
      >
        <img
          v-if="!item.imageStr"
          class="videoImg"
          src="../../Img/videoimg.png"
          alt=""
        />
        <img
          v-else
          class="videoImg"
          v-lazy="item.imageStr"
          alt=""/>
        <div class="videoName">
          <!-- <img src="../../Img/videoicon.png" alt="" /> -->
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>
    <img
      v-if="videoData.length===0&&!loadingShow"
      src="../../Img/home/noContent.png"
      alt=""
      style="margin-top: 13vh"/>
  </div>
</template>

<script>
import apptitle from "../components/appTitle.vue";
import axios from "axios";
import env from "@/config/env";
import Vue from 'vue';
import {Lazyload,Loading,Overlay} from 'vant';
Vue.use(Lazyload, {
  loading: img1
});
import img1 from "./img/loading.jpg"

export default {
  data() {
    return {
      img1: img1,
      value: "",
      projectId: "",
      projectName: "",
      projectCode: "",
      ProjectLevel: "",
      videoData: [],
      ProjectLevelList: ["集团", "公司", "项目"],
      loadingShow: false
    };
  },
  components: {VanLoading: Loading,VanOverlay:Overlay,apptitle},
  inject: ["projectConfig"],
  mounted() {
    this.projectName = this.projectConfig.projectName;
    this.projectCode = `${env.project}`;
    this.projectId = sessionStorage.getItem("projectId");
    this.ProjectLevel = this.ProjectLevelList[this.projectConfig.projectLevel];
    this.getDeviceDetail();
  },
  methods: {
    videoClick(val) {
      this.$router.push({
        name: "yingShiYunDetail",
        query: {
          id: val.id,
          name: val.name,
          url: val.url,
          channel: val.channel,
          sn: val.sn,
          consoleControl: val.consoleControl,
          token: val.token,
        },
      });
    },
    getDeviceDetail() {
      this.videoData = [];
      this.loadingShow = true;
      axios
        .get(`${env.apiHost}/` + "api/video/deviceDetailHls", {
          params: {
            appCode: this.projectCode,
            currentProjectName: this.projectName,
            currentLevel: this.ProjectLevel,
            id: this.projectId,
            current: 1,
            size: 999,
          },
        })
        .then((res) => {
          if (res.data) {
            this.videoData = res.data.records;
            this.loadingShow = false;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

<style lang="less" scoped>
.VideoSurveillance {
  padding: 20px;
  display: flex;
  padding: 20px;
  flex-wrap: wrap;


  .search {
    margin-bottom: 28px;
  }

  .video {
    width: 48%;
    margin-right: 2%;
    margin-bottom: 40px;
    height: 105px;

    .videoImg {
      width: 100%;
      height: 100%;
      margin-bottom: 10px;
    }

    .videoName {
      img {
        height: 25px;
        width: 35px;
      }

      span {
        font-size: 15px;
        color: #000;
      }
    }
  }
}

video {
  width: 100%;
  height: 300px;
}

img {
  width: 100%;
  height: 300px;
}

canvas {
  width: 100%;
  height: 400px;
}
</style>
