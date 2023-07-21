<template>
  <div class="aboutMeDetail">
    <apptitle :title="'项目动态'"></apptitle>
    <div class="project_moments">
      <div
        class="moments_content"
      >
        <div class="name_Time">
          <div>
            <img :src="theMoment.userInfo && theMoment.userInfo.userPicture || imgUser" alt=""/>
          </div>
          <div>
            <p>{{ theMoment.userInfo && theMoment.userInfo.userName }}</p>
            <p>{{ theMoment.userInfo && theMoment.userInfo.department }}</p>
          </div>
          <div>{{ theMoment.date }}</div>
        </div>
        <div class="imageText">
          <div @click="go2page(theMoment)">
            <span v-if="!theMoment.dataUrl">{{ theMoment.dynamicContent }}</span>
            <a v-else>{{ theMoment.dynamicContent }}</a>
          </div>
          <div v-if="theMoment.imageList && theMoment.videoList && (theMoment.imageList.length || theMoment.videoList.length)">
            <!--            <img
              v-for="(itemimg,indeximg) in theMoment.imageList"
              :key="indeximg"
              @click="showImgClick(theMoment.imageList,indeximg)"
              :style="{maxHeight: theMoment.imageList.length == 1? '999px':'115px'}"
              :src="IMGURL + itemimg"
              :class="{ 'width100': theMoment.imageList.length == 1, 'width50': theMoment.imageList.length == 2 || theMoment.imageList.length == 4, 'width30': theMoment.imageList.length >4 || theMoment.imageList.length == 3}"
              alt=""/>-->
            <div
              class="image-video"
              v-for="(videoImgItem,videoImgKey) in theMoment.imageList.concat(theMoment.videoList)"
              :key="videoImgKey"
              :style="{maxHeight: theMoment.imageList.concat(theMoment.videoList).length === 1? '999px':'115px'}"
              :class="computedWH(theMoment.imageList.concat(theMoment.videoList).length)">
              <img
                v-if="!videoImgItem.match(/.mp4/g)"
                @click="showImgClick(theMoment.imageList,videoImgKey)"
                :src="IMGURL + videoImgItem"
                :style="{maxHeight: theMoment.imageList.concat(theMoment.videoList).length === 1? '999px':'115px'}"
                alt=""/>
              <video
                controls
                muted
                :class="computedWH(theMoment.imageList.concat(theMoment.videoList).length)"
                :autoplay="false"
                v-else>
                <source :src="IMGURL + videoImgItem" type="video/mp4">
              </video>
            </div>
          </div>
        </div>
        <div class="location">
          <div v-if="theMoment.businessSegments">动态分类：{{ theMoment.businessSegments }}</div>
          <div v-if="theMoment.position">
            <img src="../../Img/img/wechat_icon3.png" alt=""/>
            <!-- {{ item.position.provinceName }} -->
            <!-- {{ item.position.cityName }} -->
            <span>{{ theMoment.position.districtName }}{{ theMoment.position.address }}</span>
          </div>
        </div>
        <div class="operation">
          <div class="delete">
            <span
              v-if="theMoment.canDelete"
              style="color:#0b8ef5"
              @click="deleteProjectMoment(theMoment)">删除</span>
            <span v-else style="color:#606366">删除</span>
          </div>
          <a-popover
            class="panel-box"
            placement="left"
            trigger="click"
            :getPopupContainer="triggerNode=> { return triggerNode.parentNode; }"
          >
            <template slot="content">
              <div class="like-box" @click="doLike(theMoment)">
                <div v-if="!isLike">赞</div>
                <div v-else>取消赞</div>
              </div>
              <div class="comment-box" @click="doComment">
                <div> 评论</div>
              </div>
            </template>
            <a-button size="small">...</a-button>
          </a-popover>
        </div>
        <div class="all-list">
          <a-divider style="margin: 4px 0"></a-divider>
          <div class="inputArea" v-if="isCommenting">
            <text-area
              class="textArea"
              v-model="comment"
              :placeholder="commentSave.length?commentSave:'评论区'"
              :autoSize="{ minRows: 1, maxRows:1 }"
            />
            <div class="title">
              <div @click="()=>{modalShow=true}">@</div>
              <div @click="submit(theMoment)">提交</div>
            </div>
          </div>
          <div class="likes-list" v-if="theMoment.likeList&&theMoment.likeList.length">
            <a-icon type="heart" theme="twoTone" twoToneColor="#eb2f96"></a-icon>
            <span v-for="(v,i) in theMoment.likeList" :key="i">
              {{ v.personName }}<span v-if="(i+1)!==theMoment.likeList.length">,</span>
            </span>
          </div>
          <div class="comments-list" v-show="theMoment.commentList && theMoment.commentList.length> 0">
            <div class="commentDetail">
              <article v-for="(v,i) in theMoment.commentList" :key="i">
                <main @click="commentToWho(v)">
                  <img :src="v.commentPerson.userPicture!==null?v.commentPerson.userPicture:noPic" alt="" :οnerrοr="noPic"/>
                  <span style="color: #6788A2">{{ v.commentPerson.userName }}</span>
                  <span v-if="v.beCommentPerson !== null">@</span>
                  <span v-if="v.beCommentPerson !== null" style="color: #6788A2">
                    {{ v.beCommentPerson.userName }}
                  </span>
                  <span>:</span>
                  <span>{{ v.commentContent }}</span>
                </main>
                <!--                <div>{{ v.createdTime }}</div>-->
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
    <van-action-sheet
      v-model="modalShow"
      :title="mark==='department'?'组织架构':'人员列表'"
      :cancelText="mark==='department'?'取消':'返回'"
      @cancel="closeModal"
      :closeable="false">
      <div class="modalContent">
        <van-search v-model="filterText" placeholder="请输入搜索关键词"/>
        <Tree
          class="treeContainer"
          :data="treeDepartmentData"
          :props="defaultProps"
          defaultExpandAll
          @node-click="clickDepartment"
          :filterNodeMethod="filterNode"
          ref="tree">
        </Tree>
      </div>
    </van-action-sheet>
  </div>
</template>

<script>
import * as Api from "../../service/api";
import env from "@/config/env";
import apptitle from "../components/appTitle.vue";
import {Button, Input, Popover, Icon, Divider} from "@h3/antd-vue"
import { ActionSheet, Search, ImagePreview} from "vant";
import {
  getMomentById,
  doLikeOrComment,
  cancelLike,
  deleteComment,
  deleteProjectMoment, getProjectMoment
} from "../service/index.js";
import Tree from "element-ui/lib/tree";
import noPic from "../../Img/safety/noPiv.png";
import imgState1 from "../../Img/img/wechat_icon1.png";
import imgState2 from "../../Img/img/wechat_icon2.png";
import imgUser from "../../Img/img/user.png";
import Utils from "@/utils";
export default {
  components: {
    apptitle,
    ADivider: Divider,
    AIcon: Icon,
    APopover: Popover,
    AButton: Button,
    VanActionSheet: ActionSheet,
    VanSearch: Search,
    TextArea: Input.TextArea,
    Tree,
    [ImagePreview.Component.name]: ImagePreview.Component,
  },
  data() {
    return {
      theMoment: {},
      isLike: false,
      isCommenting: false,
      modalShow: false,
      mark: 'department',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      treeDepartmentData: [],
      comment: '',
      commentId: '',
      noPic: noPic,
      commentSave: '',
      filterText: null,
      IMGURL: `${env.apiHost}`,
      imgUser: imgUser,
      createdTime: "",
      projectName: "",
      projectCode: "",
      defaultSelectedKeys: [],
      width100: "width100",
      width50: "width50",
      width30: "width30",
    };
  },
  inject: ["projectConfig", "corpId"],
  mounted() {
    this.projectName = this.projectConfig.projectName;
    this.projectCode = `${env.project}`;
    console.log('this.$route.query', this.$route.query)
    this.getTheMoment(this.$route.query.item);

  },
  methods: {
    getTheMoment(v) {
      const userId = sessionStorage.user.split('"')[3];
      getMomentById(this.projectCode, v.projectMomentId, v.id).then((res) => {
        this.theMoment = res.data;
        if(!this.theMoment.likeList.length) return;
        for (let j = 0; j < this.theMoment.likeList.length; j++) {
          if (this.theMoment.likeList[j].personId === userId) this.isLike = true;
        }
      })
    },

    clickDepartment(c, node, info) {
      if (this.mark === 'department') {
        Api.userByDepId({
          deptId: c.id,
          size: 9999,
          page: 0
        }).then(res => {
          if (res.errcode !== 0) return;
          this.mark = 'people';
          this.treeDepartmentData = res.data.content;
        })
      } else if (this.mark === 'people') {
        this.modalShow = false;
        this.commentSave = `@${c.name}:`;
        // this.comment = `@${c.name}:`;
        this.commentId = c.id;
      }

    },

    commentToWho(v) {
      if(this.commentId===v.commentPerson.id) {
        this.isCommenting = false;
        this.comment = '';
        this.commentSave = '';
        this.commentId = '';
        return;
      }else{
        this.isCommenting = true;
        this.commentSave = `@${v.commentPerson.userName}:`;
        // this.comment = `@${v.commentPerson.userName}:`;
        this.commentId = v.commentPerson.id;
      }
    },

    deleteProjectMoment(v) {
      deleteProjectMoment(this.projectCode, v.id);
      this.$router.push({name:'homePage'})
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },

    submit(v) {
      // let commentAll = '';
      // if (this.commentSave.length !== 0 && this.comment.indexOf(this.commentSave) !== -1) {
      //   const tempt = this.comment.split(':');
      //   tempt.forEach((item, i) => {
      //     if (i !== 0) {
      //       commentAll += String(item);
      //     }
      //   })
      // } else {
      //   commentAll = this.comment
      // }

      const params = {
        appCode: this.projectCode,
        beCommentPersonId: this.commentSave.length !== 0 ? this.commentId : '',//被@人id,,
        commentContent: this.comment,
        likeOrComment: 1,
        noticePersonId: this.commentSave.length !== 0? this.commentId : v.userInfo.id,//被@人id,
        projectMomentId: v.id,
        projectName: this.projectConfig?.projectName ?? '',
      };
      doLikeOrComment(params).then(res => {
        if (res.errcode === 0)
          this.isCommenting = false;
          this.comment = '';
          this.commentSave = '';
          this.commentId = '';
          return this.getTheMoment(this.$route.query.item);
      })
    },

    getDepartments() {
      this.filterText = '';
      this.treeDepartmentData = [];
      Api.getDepartments({appCode: this.projectCode ?? ''}).then(res => {
        if (res.errcode !== 0) return;
        this.modalShow = true;
        this.mark = 'department';
        this.treeDepartmentData = res.data ?? [];
        console.log(this.treeDepartmentData)
      })
    },

    getSearchUser(val) {
      Api.getSearchUser({
        wd: val, page: 0, size: 9999999, corpId: this.corpId
      }).then(res => {
        if (res.errcode !== 0) return;
        this.treeDepartmentData = res.data.content;
      })
    },

    closeModal() {
      if (this.mark === 'department') {
        this.modalShow = false;
      } else if (this.mark === 'people') {
        this.getDepartments();
      }
    },
    //点赞
    async doLike(v) {
      this.isLike = !this.isLike;
      if (this.isLike) {
        const params = {
          appCode: this.projectCode,
          beCommentPersonId: '',
          commentContent: '',
          likeOrComment: 0,
          noticePersonId: v.userInfo.id,
          projectMomentId: v.id,
          projectName: this.projectName
        };
        await doLikeOrComment(params);
      } else {
        await cancelLike(this.projectCode, v.id);
      }
      this.getTheMoment(this.$route.query.item);
    },
    doComment() {
      if (!this.isCommenting) {
        this.isCommenting = true;
      } else {
        this.isCommenting = false;
      }
      this.comment = '';
      this.commentSave = '';
      this.commentId = '';
      // this.onRefresh();
    },
    showImgClick(val, index) {
      const arrImg = [];
      val.forEach((element) => {
        arrImg.push(this.IMGURL + element);
      });
      ImagePreview({
        images: arrImg,
        startPosition: index,
      });
    },
    go2page(item) {
      const urlDetail =  Utils.parseQueryString(`?${item.dataUrl}`);
      urlDetail.isWorkFlow = urlDetail.isWorkFlow === 'true';
      this.$router.push({
        // 业务表单
        name: "form-detail",
        query: urlDetail
      })
    },

  },
  computed: {
    computedWH() {
      return function(num) {
        if(num===1) {
          return 'width100';
        }else if(num===2 || num===4){
          return 'width50';
        }else if(num>4 || num===3){
          return 'width30'
        }
      }
    }
  },
  watch: {
    modalShow: {
      handler(v) {
        if (v) {
          this.getDepartments();
        }
      }
    },
    filterText: {
      handler(val) {
        if (val === '') {
          this.getDepartments();
        } else {
          this.getSearchUser(val);
        }
      },
      immediate: true
    }
  }

}
</script>

<style lang="less" scoped>
@import "~@/styles/mixins.less";
@import "~@/styles/common.less";
@import "./projectMoment.less";
* {
  font-family: Source Han Sans CN;
  text-align: left;
}
.aboutMeDetail{
  .app_title{
    text-align: center!important;
  }
  .project_moments {
    .project_moments
  }

}

.van-action-sheet__cancel {
  text-align: center;
}

.van-action-sheet__header {
  text-align: center;
}
</style>
