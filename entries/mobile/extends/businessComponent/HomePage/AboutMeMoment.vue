<template>
  <div class="aboutMeMoment">
    <apptitle :title="'与我相关'" routeUrl="homePage"></apptitle>
    <div class="project_moments">
      <list @load="onLoad">
        <div
          class="moments_content"
          v-for="(item, index) in list"
          :key="index"
          @click="toMomentDetail(item)"
        >
          <div class="name_Time">
            <div>
              <img :src="item.userInfo.userPicture || imgUser" alt=""/>
            </div>
            <div>
              <p>{{ item.userInfo.userName }}</p>
              <p>{{ item.userInfo.department }}</p>
            </div>
            <div>{{ item.date }}</div>
          </div>
          <div class="content">
            <div v-if="item.aboutMeType === 0 " class="likeImg">
              <a-icon type="heart" theme="twoTone" twoToneColor="#eb2f96"></a-icon>
            </div>
            <div v-else class="commentContent">
              <span>{{ item.commentContent }}</span>
            </div>
          </div>
        </div>
      </list>
    </div>
  </div>
</template>

<script>
import apptitle from "../components/appTitle.vue";
import { Icon } from "@h3/antd-vue"
import { List } from "vant";


export default {
  components: {
    apptitle,
    AIcon: Icon,
    List
  },
  data() {
    return {
      list: [],
    };
  },
  inject: ["projectConfig", "corpId"],
  mounted(){
    //进入n条新消息页面，传递 与我相关列表
    console.log('this.$route.query',this.$route.query)
  },
  methods:{
    onLoad(){
      this.list = this.$route.query;
      console.log(this.list)
    },
    toMomentDetail(item){
      this.$router.push({name: 'AboutMeDetail', query: {item: item,list:this.list }});
    }
  },
}
</script>

<style lang="less" scoped>
* {
  font-family: Source Han Sans CN;
  text-align: left;
}

.aboutMeMoment {
  .app_title{
    text-align: center!important;
  }
  .project_moments {
    border-radius: 8px;
    padding: 10px;
    background: #fff;
    margin-bottom: 10px;

    .moments_content {
      position: relative;
      // max-height: 280px;
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
            margin-top: 5px;
          }
        }

        div:nth-child(2) {
          width: 18%;
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
          width: 67%;
          font-size: 13px;
          text-align: right;
        }
      }

      .content {
        margin-bottom: 15px;

        div {
          font-size: 15px;
          padding-left: 8vh;
          & >span {
            word-break: break-all;
          }
        }
      }
    }
  }
}

</style>
