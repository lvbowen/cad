<template>
  <div class="projectCircle">
    <div class="CircleTitle">
      <div>
        <img @click="toprev" src="../../icon.png" alt="" />
        <span>项目圈</span>
      </div>
      <div @click="addCircle">发布项目圈</div>
    </div>
    <div class="CircleContent">
      <!--      <el-select @change="handleSelect" v-model="value" placeholder="请选择">-->
      <!--        <el-option-->
      <!--          v-for="item in options"-->
      <!--          :key="item.value"-->
      <!--          :label="item.label"-->
      <!--          :value="item.value"-->
      <!--        >-->
      <!--        </el-option>-->
      <!--      </el-select>-->
      <h3-scroll
        :ref="`${projectName}scroll-qu`"
        :loadMore="onLoad"
        :pageSize="pageSize"
      >
        <a-timeline mode="alternate">
          <a-timeline-item v-for="(item, index) in lists" :key="index">
            <div class="circle" @click="todetail(item)" v-if="index % 2 !== 0">
              <div class="describe">
                <span v-if="!item.dataUrl">{{ item.dynamicContent }}</span>
                <a v-else>{{ item.dynamicContent }}</a>
                <div class="circle_state">
                  <div>
                    <span>动态分类：{{ item.businessSegments }}</span>
                  </div>
                  <div>
                    <span class="username">{{ item.userInfo.userName }}</span>
                    <img
                      style="margin-left: 10px"
                      v-lazy="item.userInfo.userPicture"
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <div class="circle_img">
                <img
                  v-if="item.imageList[0]"
                  v-lazy="IMGURL + item.imageList[0]"
                  alt=""
                />
              </div>
              <div class="circle_date">{{ item.date }}</div>
            </div>
            <div @click="todetail(item)" class="circle" v-else>
              <div class="circle_date">{{ item.date }}</div>
              <div class="circle_img">
                <img
                  v-if="item.imageList[0]"
                  v-lazy="IMGURL + item.imageList[0]"
                  alt=""
                />
              </div>
              <div class="describe">
                <p v-if="!item.dataUrl">
                  {{ item.dynamicContent }}
                </p>
                <a v-else>{{ item.dynamicContent }}</a>
                <div class="circle_state">
                  <div>
                    <img
                      style="margin-right: 10px"
                      v-lazy="item.userInfo.userPicture"
                      alt=""
                    />
                    <span class="username">{{ item.userInfo.userName }}</span>
                  </div>
                  <div>
                    <span>动态分类：{{ item.businessSegments }}</span>
                  </div>
                </div>
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </h3-scroll>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Timeline } from "@h3/antd-vue";
import Select from "element-ui/lib/select";
import Option from "element-ui/lib/option";
import { getProjectMoments } from "../progressAnalysis/serve/index.js";
import env from "@/config/env";
import mobile from "@cloudpivot/form/src/renderer/components/mobile";
import VueLazyload from 'vue-lazyload'
import {getProjectMomentV2} from "../../service/api";
Vue.use(VueLazyload)
export default {
  data() {
    return {
      options: [
        {
          value: "0",
          label: "项目圈",
        },
        {
          value: "1",
          label: "我的项目圈",
        },
      ],
      value: "0",
      userId: "",
      projectName: "",
      projectCode: "",
      lists: [],
      IMGURL: `${env.apiHost}`,
      //
      pageSize: 8,
      projectMomentTotal: 0,
    };
  },
  inject: ["projectConfig"],
  components: {
    ATimeline: Timeline,
    ATimelineItem: Timeline.Item,
    H3Scroll: mobile.H3Scroll,
    // ElSelect: Select,
    // ElOption: Option,
  },
  methods: {
    async onLoad(page, done) {
      await getProjectMomentV2({
        appCode: this.projectCode,
        projectName: this.projectConfig?.projectName ?? '',
        page:  page.num,
        size: this.pageSize
      }).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg)
        this.projectMomentTotal = res.data.total;
          if (res.data.pages > page.num || res.data.pages === page.num) {
            if (page.num === 1) {
              this.lists = res.data.records
            } else if (res.data.current * this.pageSize > this.lists.length) {
              this.lists = this.lists.concat(res.data.records) //上滑加载
            }
          }
      }).finally(()=>{
        if (done && typeof done === "function") done(this.pageSize, this.projectMomentTotal);
      })
    },
    // handleSelect(val) {
    //   if (val == 0) {
    //     getProjectMoments(this.projectCode, this.projectName).then((res) => {
    //       this.lists = res.data;
    //     });
    //   } else {
    //     this.userId = JSON.parse(sessionStorage.getItem("user")).id;
    //     getProjectMoments(this.projectCode, this.projectName, this.userId).then(
    //       (res) => {
    //         this.lists = res.data;
    //       }
    //     );
    //   }
    // },
    todetail(val) {
      if(val.dataUrl&&val.dataUrl.length) {
        const url = `/form/detail?${val.dataUrl}`
        if(this.isDingTalk) {
          this.$router.push(url)
        }else {
          window.open(`/${ this.projectCode }${url}`)
        }
      }
    },
    toprev() {
      this.$router.go(-1);
    },
    addCircle() {
      const routeData = {
        name: "form-detail",
        query: {
          projectName: this.projectName,
          schemaCode: this.projectCode + "_project_moment",
          queryCode: `${this.projectCode}_project_moment`,
          iframeAction: 'add',
          return: `${this.$route.fullPath}&iframeAction=add`
        },
      };
      const { href,route } = this.$router.resolve(routeData);
      this.isDingTalk?this.$router.push(route.fullPath): window.open(href, "_blank")
    },
  },
  mounted() {
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
    // getProjectMoments(this.projectCode, this.projectName).then((res) => {
    //   this.lists = res.data;
    // });
  },
};
</script>

<style lang="less" scoped>
.projectCircle {
  height: 100%;
  .CircleTitle {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    div:nth-child(1) {
      img {
        cursor: pointer;
      }
    }
    div:nth-child(2) {
      width: 90px;
      cursor: pointer;
      border-radius: 4px;
      background: #2970ff;
      height: 30px;
      line-height: 30px;
      font-size: 13px;
      text-align: center;
      font-family: Source Han Sans CN;
      font-weight: 400;
      color: #ffffff;
    }
  }
  .CircleContent {
    background: #ffffff;
    box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
    padding: 20px;
    height: 825px;
    .circle {
      display: flex;
      height: 150px;
      cursor: pointer;
      .describe {
        width: 55%;
        padding: 20px;
        p {
          text-align: left;
          height: 84px;
          text-indent: 20px;
          margin-bottom: 20px;
          color: #333333;
          word-break: break-all;
          text-overflow: ellipsis;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
        }
        img {
          width: 35px;
          height: 35px;
        }
        .circle_state {
          display: flex;
          justify-content: space-between;
          span {
            color: #999999;
          }
          .username {
            color: #343439;
          }
        }
      }
      .circle_img {
        width: 30%;
        img {
          width: 100%;
        }
      }
      .circle_date {
        width: 15%;
        font-size: 18px;
        font-family: Source Han Sans CN;
        font-weight: bold;
        color: #333333;
      }
    }
  }
}
</style>
<style lang="less" >
.projectCircle {
  .ant-timeline {
    margin-top: 10px;
  }
  .el-scrollbar__wrap {
    overflow-x: hidden !important;
  }
}
</style>
