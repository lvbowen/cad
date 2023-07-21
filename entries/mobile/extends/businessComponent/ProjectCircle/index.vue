<template>
  <div>
    <div class="phone_title">
      <span></span>
      <span>项目圈</span>
      <div @click="toformdetail">
        <img src="../../Img/img/top_release.png" alt="" />
      </div>
    </div>
    <!-- 项目圈 -->
    <pull-refresh v-model="refreshing" @refresh="onRefresh">
      <list
        v-model="loading"
        :finished="finished"
        finishedText="没有更多了"
        @load="onLoad"
      >
        <div class="project_moments">
          <div
            class="moments_content"
            v-for="(item, index) in list"
            :key="index"
          >
            <div class="name_Time">
              <div>
                <img :src="item.userInfo.userPicture || imgUser" alt="" />
              </div>
              <div>
                <p>{{ item.userInfo.userName }}</p>
                <p>{{ item.userInfo.department }}</p>
              </div>
              <div>{{ item.date }}</div>
            </div>
            <div class="imageText">
              <div>
                {{ item.dynamicContent }}
              </div>
              <div>
                <img
                  v-for="(itemimg,indeximg) in item.imageList"
                  :key="indeximg"
                  @click="showImgClick(item.imageList,indeximg)"
                  :style="{maxHeight: item.imageList.length == 1? '999px':'115px'}"
                  :src="IMGURL + itemimg"
                  :class="{ 'width100': item.imageList.length == 1, 'width50': item.imageList.length == 2 || item.imageList.length == 4, 'width30': item.imageList.length >4 || item.imageList.length == 3}"
                  alt="" />
              </div>
            </div>
            <div class="location">
              <div v-if="item.businessSegments">动态分类：{{ item.businessSegments }}</div>
              <div v-if="item.position">
                <img src="../../Img/img/wechat_icon3.png" alt="" />
                <!-- {{ item.position.provinceName }} -->
                <!-- {{ item.position.cityName }} -->
                <span>
                  {{ item.position.districtName }}{{ item.position.address }}
                </span>
              </div>
            </div>
            <div class="reply_message" v-if="item.handlingOpinions">
              <div>
                <h4>{{ item.handler }}</h4>
                <p>回复</p>
                <h4>{{ item.userInfo.userName }}</h4>
                <p>：</p>
              </div>
              <div>{{ item.handlingOpinions }} </div>
              <img v-if="item.sequenceStatus == 'COMPLETED'" :src="imgState1" alt="" />
              <img v-if="item.sequenceStatus == 'PROCESSING'" :src="imgState2" alt="" />
            </div>
          </div>
        </div>
      </list>
    </pull-refresh>
  </div>
</template>

<script>
import { PullRefresh } from "vant";
import { List } from "vant";
import { getProjectMoments } from "../service/index.js";
import env from "@/config/env";
import imgState1 from "../../Img/img/wechat_icon1.png"
import imgState2 from "../../Img/img/wechat_icon2.png"
import imgUser from "../../Img/img/user.png"
// import { Swipe } from 'vant';
// import { SwipeItem } from 'vant';
import { ImagePreview } from 'vant';
export default {
  components: {
    PullRefresh,
    List,
    // Swipe,
    // SwipeItem,
    [ImagePreview.Component.name]: ImagePreview.Component,
  },
  inject: ["projectConfig"],
  data() {
    return {
      lists: [],
      list: [],
      page: 0,
      loading: false,
      IMGURL: `${env.apiHost}`,
      imgState1: imgState1,
      imgState2: imgState2,
      imgUser: imgUser,
      finished: false,
      refreshing: false,
      projectName: "",
      projectCode: "",
      imgState: "",
      width100: "width100",
      width50: "width50",
      width30: "width30",
    };
  },
  methods: {
    showImgClick(val,index){
      const arrImg = []
      val.forEach(element => {
        arrImg.push( this.IMGURL + element)
      });
      ImagePreview({
        images: arrImg,
        startPosition: index,
      });
    },
    toformdetail() {
      this.$router.push({
        name: "form-detail",
        query: {
          startWorkflowCode: this.projectCode + "_project_circle",
          // return:`${this.$route.fullPath}`,
          return: `${this.$route.fullPath}&iframeAction=add`,
          projectName: this.projectConfig?.projectName,
          iframeAction: 'add'
        },
      });
    },
    onLoad() {
      setTimeout(() => {
        if (this.refreshing) {
          this.list = [];
          this.refreshing = false;
        }
        getProjectMoments(this.projectCode, this.projectName).then((res) => {
          this.lists = res.data;
          this.page++;
          if (this.page == 1) {
            this.list = this.lists.slice(0, 5);
          } else {
            this.list.push(
              ...this.lists.slice((this.page - 1) * 5, this.page * 5)
            );
          }
          this.loading = false;
          if (this.list.length >= this.lists.length) {
            this.finished = true;
          }
        });
      }, 500);
    },
    onRefresh() {
      // 清空列表数据
      this.finished = false;
      this.page = 0;
      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      this.loading = true;
      this.onLoad();
    },
    tohomePage() {
      this.$router.push({
        name: "homePage",
      });
    },
  },
  mounted() {
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
  },
};
</script>

<style lang="less" scoped>
* {
  font-family: Source Han Sans CN;
  text-align: left;
}
.phone_title {
  display: flex;
  text-align: center;
  height: 45px;
  line-height: 45px;
  background: #2758fd;
  font-family: PingFang SC;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  justify-content: space-between;
  margin-bottom: 10px;
  span:nth-child(1) {
    font-size: 26px;
    margin-left: 10px;
  }
  img {
    margin-right: 10px;
    width: 22px;
    height: 22px;
  }
}
.project_moments {
  border-radius: 8px;
  padding: 10px;
  background: #fff;
  margin-bottom: 10px;
  .moments_content {
    position: relative;
    // height: 400px;
    margin-bottom: 20px;
    .name_Time {
      display: flex;
      height: 40px;
      margin-bottom: 20px;
      div:nth-child(1) {
        width: 15%;
        height: 100%;
        img {
          width: 40px;
          height: 40px;
        }
      }
      div:nth-child(2) {
        width: 60%;
        padding-top: 5px;
        p:nth-child(1) {
          color: #343439;
          font-size: 15px;
        }
        p:nth-child(2) {
          color: #b2b2b2;
          font-size: 12px;
        }
        p {
          margin-bottom: 5px;
        }
      }
      div:nth-child(3) {
        padding-top: 15px;
        width: 25%;
        font-size: 13px;
        text-align: right;
      }
    }
    .imageText {
      // height: 220px;
      margin-bottom: 15px;
      div:nth-child(1) {
        color: #333;
        // height: 50px;
        font-size: 14px;
        margin-bottom: 10px;
        // word-break: break-all;
        // text-overflow: ellipsis;
        // overflow: hidden;
        // display: -webkit-box;
        // -webkit-line-clamp: 3;
        // -webkit-box-orient: vertical;
      }
      div:nth-child(2) {
        // height: 125px;
        flex-wrap: wrap;
        display: flex;
        img {
          // width: 48%;
          // height: 100%;
          max-height: 115px;
          margin-right: 5px;
          margin-bottom: 5px;
        }
      }
      .width30 {
        width: 30%;
      }
      .width50 {
        width: 48%;
      }
      .width100 {
        width: 100%;
      }
    }
    .location {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      div {
            min-width: 35%;
            word-break: break-all;
            text-overflow: ellipsis;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
          }
      img {
        width: 12px;
      }
    }
    .reply_message {
      height: 80px;
      border-radius: 10px;
      background: rgba(248, 171, 5, 0.1);
      padding: 17px;
      div:nth-child(1) {
        display: flex;
        h4 {
          color: #1D8AFD;
          font-weight: 700;
          font-size: 14px;
        }
        p {
          color: #000000;
          font-size: 14px;
          font-weight: 700;
          margin: 0 3px;
        }
      }
      div:nth-child(2) {
        text-indent: 20px;
        letter-spacing: 1px;
        word-break: break-all;
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: 14px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      img {
        position: absolute;
        bottom: 40px;
        right: 10px;
        width: 80px;
      }
    }
  }
}
 .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    img {
      width: 100%;
    }
  }
</style>
