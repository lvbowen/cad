<template>
  <div class="Notice notice">
    <!-- <div class="phone_title">消息</div> -->
    <div class="menuSelect">
      <dropdown-menu activeColor="#1989fa">
        <dropdown-item
          @change="menuChose()"
          v-model="value"
          :options="option"
        />
      </dropdown-menu>
      <div style="padding-top: 12px" @click="isReadClick">
        <checkbox v-model="checked" shape="square" iconSize="14px">
          只看未读
        </checkbox>
      </div>
    </div>
    <div class="notice_content" :key="messageListKey">
      <h3-scroll
        :ref="`${projectName}scroll-mes`"
        class="message-list"
        :loadMore="onLoad"
        :pageSize="pageSize"
      >
        <div
          class="news_box"
          @click="openDetailMessage(item)"
          v-for="(item, index) in list"
          :key="index"
        >
          <template v-for="(iconItem,index) in iconConfig">
            <div v-if="item.noticeSort === iconItem.noticeSort && item.isRead===iconItem.isRead" :key="index">
              <img :src="iconItem.url" alt=""/>
            </div>
          </template>
          <div class="subject">
            <div>
              <h4>{{ item.noticeTitle }}</h4>
              <h5>{{ item.uploadTime }}</h5>
            </div>
            <div>
              {{ item.noticeContent }}
            </div>
          </div>
        </div>
        <div class="inner">
          <div class="scroll-load">{{ messageTotal === list.length ? '已加载全部数据' : '向上滑动加载' }}</div>
        </div>
      </h3-scroll>
    </div>
    <DetailMessage
      :showMessage="showMessage"
      :message="selectedMessage"
      @closeMessageOverlay="closeMessageOverlay"/>
  </div>
</template>
<script>
import {
  DropdownMenu,
  DropdownItem,
  Checkbox
} from "vant";
import {
  getrefreshProjectWarningNotice,
} from "../service/index.js";
import env from "@/config/env";
import mobile from "@cloudpivot/form/src/renderer/components/mobile";
import {addUserMessageRelatio, getMyMessage} from "../../service/api";
import moment from 'moment';
import noticeConfig from './noticeConfig';
import DetailMessage from "./detailMessage.vue";
import Utils from "../../../src/utils";
export default {
  components: {
    DropdownMenu,
    DropdownItem,
    Checkbox,
    // eslint-disable-next-line vue/no-unused-components
    H3Scroll: mobile.H3Scroll,
    DetailMessage
  },
  inject: ["projectConfig"],
  data() {
    return {
      projectName: "",
      isRead: "",
      messageType: "",
      userId: "",
      projectCode: "",
      lists: [],
      list: [],
      show: false,
      loading: false,
      refreshing: false,
      isNotice: false,
      checked: false,
      url: '',
      value: "",
      option: [
        {text: "全部消息", value: ""},
        {text: "项目公告", value: 0},
        {text: "进度预警", value: 1},
        {text: "风险预警", value: 2},
        {text: "船舶预警", value: 3},
        {text: 'AI预警', value: 4},
        {text:'其他消息',value: 10}
      ],
      //
      pageSize: 10,
      messageTotal: 0,
      messageListKey: 1,
      iconConfig: noticeConfig.iconConfig,
      showMessage: false,
      selectedMessage: null
    };
  },
  methods: {
    isReadClick() {
      if (this.isRead === "") {
        this.isRead = false;
      } else {
        this.isRead = "";
      }
      this.onRefresh();
    },
    menuChose() {
      this.messageType = this.value;
      this.onRefresh();
    },
    openDetailMessage(item) {
      this.showMessage = true;
      this.selectedMessage = item;
      if(item.isRead) return
      item.isRead = true;
      addUserMessageRelatio({
        projectCode: this.projectCode??'',
        projectName: this.projectConfig?.projectName??'',
        isRead: false,
        messageId: item.id,
        messageType: item.noticeSort,
        userId: ''
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg)
      })
    },
    onLoad(page, done) {
      getrefreshProjectWarningNotice(this.projectCode).then((res) => {
        if(res.errcode!==0) {
          if (done && typeof done === "function") done(this.pageSize, this.messageTotal);
          return this.$message.error(res.errmsg)
        }
        getMyMessage({
          projectName: this.projectName,
          projectCode: this.projectCode,
          userId: this.userId,
          messageType: this.messageType,
          isRead: this.isRead,
          page: page.num,
          size: this.pageSize
        }).then((result)=> {
          if (result.errcode !== 0) return this.$message.error(result.errmsg)
          this.messageTotal = result.data.total;
          if (result.data.pages > page.num || result.data.pages === page.num) {
            if (page.num === 1) {
              this.list = result.data.records
            } else if (result.data.current * this.pageSize > this.list.length) {
              this.list = this.list.concat(result.data.records) //上滑加载
            }
          }
          this.list.map((item) => {
            item.uploadTime = moment(item.createdtime).format('YYYY-MM-DD')
          })
        }).finally(()=>{
          if (done && typeof done === "function") done(this.pageSize, this.messageTotal);
        })
      })
    },
    onRefresh() {
      this.list = [];
      this.messageListKey++;
      this.loading = true;
      this.onLoad({num: 1}, null);
    },
    closeMessageOverlay(obj) {
      this.showMessage = false;
      if(obj.url&&!obj.isModal) {
        this.go2page(obj.url)
      }
    },
    go2page(url) {
      const urlDetail =  Utils.parseQueryString(`?${url}`);
      urlDetail.isWorkFlow = urlDetail.isWorkFlow === 'true';
      this.$router.push({
        // 业务表单
        name: "form-detail",
        //@ts-ignore
        query: urlDetail
      })
    }
  },
  mounted() {
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
  },
};
</script>

<style lang="less" scoped>
* {
  text-align: left;
}

.Notice {
  .phone_title {
    text-align: center;
    height: 45px;
    line-height: 45px;
    background: #2758fd;
    font-family: PingFang SC;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
  }

  .menuSelect {
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    box-shadow: 0 2px 12px rgb(100 101 102 / 12%);
    padding: 0 20px;
    margin-bottom: 10px;

    .van-dropdown-menu {
      width: 70%;
    }
  }

  .notice_content {
    width: 100%;
    //padding: 0 20px;

    .news_box {
      width: 100%;
      height: 90px;
      background: #ffffff;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      padding: 15px;
      margin-bottom: 15px;
      overflow: hidden;

      div:nth-child(1) {
        width: 12%;

        img {
          width: 35px;
          height: 35px;
        }
      }

      .subject {
        width: 85%;

        div:nth-child(1) {
          display: flex;
          width: 100%;
          justify-content: space-between;
          padding-right: 10px;

          h4 {
            color: #333;
            font-weight: 700;
            font-size: 15px;
            font-family: Adobe Heiti Std;
          }

          h5 {
            color: #bfbfbf;
            font-family: AlibabaPuHuiTi;
            font-size: 13px;
          }
        }

        div:nth-child(2) {
          color: #888888;
          font-size: 13px;
          line-height: 18px;
          font-family: Source Han Sans CN;
          word-break: break-all;
          text-overflow: ellipsis;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }
  }

  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .block {
    width: 90%;
    background-color: #fff;
    border-radius: 20px;
    padding: 20px 0;

    .block_time {
      text-align: center;
      font-size: 14px;
      color: #b2b2b2;
      margin-bottom: 10px;
    }

    .block_title {
      display: flex;
      justify-content: center;

      div {
        // width: 20%;
        // min-width: 10%;
        width: 15%;
        max-width: 30%;
        height: 30px;
        line-height: 20px;

        span {
          display: inline-block;
          width: 100%;
          background: rgba(51, 125, 247, 0.35);
          height: 1px;
        }
      }
    }

    h2 {
      // min-width: 40%;
      // max-width: 100%;
      font-size: 18px;
      line-height: 25px;
      font-weight: 700;
      font-family: Adobe Heiti Std;
      text-align: center;
      color: #337df7;
      margin: 0 10px;
    }

    p {
      font-family: Source Han Sans CN;
      font-size: 15px;
      letter-spacing: 2px;
      line-height: 25px;
      text-indent: 20px;
    }

    .button {
      height: 40px;
      background: #337df7;
      color: #fff;
      line-height: 40px;
      font-size: 15px;
      text-align: center;
    }
  }
}
</style>

<style lang="less">
.Notice {
  .van-dropdown-menu__bar {
    background: none;
    box-shadow: none;
  }

  .van-dropdown-menu__item {
    justify-content: left;
  }

  .van-dropdown-menu__title {
    color: #000;
  }

  .van-checkbox__label {
    color: #000;
    font-size: 14px;
    margin-left: 4px;
  }
}
</style>

<style lang="less" scoped>
@import "~@/styles/mixins.less";
@import "~@/styles/common.less";
.notice {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .notice_content {
    flex: 1;
    overflow: auto;
    position: relative;
    .mescroll {
      position: absolute;
      top: 0;
      /deep/ .mescroll-upwarp {
        display: none !important;
      }
    }
    .message-list {
      .px2rem(padding,15);
      .inner {
        position: relative;
        .px2rem(height,20);
        .px2rem(margin-bottom,10);
        .scroll-load {
          position: absolute;
          .px2rem(font-size,15);
          color: grey;
          text-align: center;
          left: 50%;
          transform: translateX(-50%);
        }
      }
    }
  }
  .van-overlay {
    z-index: 10;
  }
}
</style>
