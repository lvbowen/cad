<template>
  <div class="homePage">
    <div class="homePage_title">
      <div class="project_select" @click="isModalShow = true">
        <!--        <span>{{ this.projectName }}</span>-->
        <span>{{ this.projectConfig.projectName }}</span>
        <i class="el-icon-caret-bottom arrow-icon"></i>
      </div>
      <!-- 项目信息 -->
      <div class="project_message">
        <swipe class="my-swipe" :autoplay="3000">
          <swipe-item v-for="(item, index) in Img" :key="index">
            <img
              @click="showImgClick(Img, index)"
              class="lunbo"
              :src="IMGURL + item"
              alt=""
            />
          </swipe-item>
        </swipe>

        <div v-if="companyList">
          <div
            v-for="(item, index) in companyList"
            :key="index"
            class="projectName"
          >
            <span>{{ item.title }}：</span>
            <span>{{ item.content }}</span>
          </div>
        </div>
        <!-- <div v-if="constructorBim" class="projectName">
          <span>施工单位：</span>
          <span>{{ constructorBim }}</span>
        </div>
        <div v-if="designunitBim" class="projectName">
          <span>设计单位：</span>
          <span>{{ designunitBim }}</span>
        </div> -->
        <div class="projectTime">
          <img src="../../Img/img/home_icon_start.png" alt=""/>
          <span>项目工期：</span>
          <span>{{ kgrq1 }}~{{ jgrq1 }}</span>
          <!--                    <div v-if="jgrq1">
                    <img src="../../Img/img/home_icon_complete.png" alt=""/>
                    <span>完工时间：</span>
                    <span>{{ jgrq1 }}</span>
                    </div>-->
        </div>
      </div>
    </div>
    <div class="project_content">
      <!-- 通知公告 -->
      <!-- <div class="notice">
        <div class="public_title">
          <div>通知公告</div>
          <div @click="tonotice">
            <span>更多</span>
            <span> > </span>
          </div>
        </div>
        <div class="notice_content" @click="overLatShow()">
          <img :src="noticeImg" alt="" />
          <div>
            <p>
              {{ noticeTitle }}
            </p>
            <p>{{ createdTime }}</p>
          </div>
        </div>
      </div> -->
      <!-- 项目圈 -->
      <div :key="projectMomentKey" class="scroll-pro">
        <h3-scroll
          :ref="`${projectName}scroll-qu`"
          :loadMore="onLoad"
          :pageSize="pageSize"
        >
          <div class="project_moments">
            <div class="public_title">
              <div>项目圈</div>
              <img
                src="../../Img/home/pyq.png"
                alt="发布"
                class="release"
                @click="toformdetail">
            </div>
            <a-button
              class="newMessage"
              v-show="aboutMeCount !== 0"
              style="font-size: 15px"
              @click="toAboutMeMoment"
            >
              <span style="color: red">{{ aboutMeCount }}</span>
              <span>条新消息</span>
            </a-button>
            <div
              class="moments_content"
              v-for="(item, index) in list"
              :key="index"
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
              <div class="imageText">
                <div @click="go2page(item)">
                  <span v-if="!item.dataUrl">{{ item.dynamicContent }}</span>
                  <a v-else>{{ item.dynamicContent }}</a>
                </div>
                <div>
                  <div
                    class="image-video"
                    v-for="(videoImgItem,videoImgKey) in item.imageList.concat(item.videoList)"
                    :key="videoImgKey"
                    :style="{maxHeight: item.imageList.concat(item.videoList).length === 1? '999px':'115px'}"
                    :class="computedWH(item.imageList.concat(item.videoList).length)">
                    <img
                      v-if="!videoImgItem.match(/.mp4/g)"
                      @click="showImgClick(item.imageList,videoImgKey)"
                      :src="IMGURL + videoImgItem"
                      :style="{maxHeight: item.imageList.concat(item.videoList).length === 1? '999px':'115px'}"
                      alt=""/>
                    <video
                      controls
                      muted
                      :class="computedWH(item.imageList.concat(item.videoList).length)"
                      :autoplay="false"
                      v-else>
                      <source :src="IMGURL + videoImgItem" type="video/mp4">
                    </video>
                  </div>
                </div>
              </div>
              <div class="location">
                <div v-if="item.businessSegments">动态分类：{{ item.businessSegments }}</div>
                <div v-if="item.position">
                  <img src="../../Img/img/wechat_icon3.png" alt=""/>
                  <!-- {{ item.position.provinceName }} -->
                  <!-- {{ item.position.cityName }} -->
                  <span>{{ item.position.districtName }}{{ item.position.address }}</span>
                </div>
              </div>
              <div class="operation">
                <div class="delete">
                  <span
                    v-if="item.canDelete"
                    style="color:#0b8ef5"
                    @click="deleteProjectMoment(item)">删除</span>
                  <!--                  <span v-else style="color:#606366">删除</span>-->
                </div>
                <a-popover
                  class="panel-box"
                  placement="left"
                  trigger="click"
                  :getPopupContainer="triggerNode=> { return triggerNode.parentNode; }"
                >
                  <template slot="content">
                    <div class="like-box" @click="doLike(item, index)">
                      <div v-if="!isLike[index]">赞</div>
                      <div v-else>取消赞</div>
                    </div>
                    <div class="comment-box" @click="doComment(index)">
                      <div> 评论</div>
                    </div>
                  </template>
                  <a-button size="small">...</a-button>
                </a-popover>
              </div>
              <div class="all-list">
                <a-divider style="margin: 4px 0"></a-divider>
                <div class="inputArea" v-if="isCommenting[index]">
                  <text-area
                    class="textArea"
                    v-model="comment"
                    :placeholder="commentSave.length?commentSave:'评论区'"
                    :autoSize="{ minRows: 1, maxRows:1 }"
                  />
                  <div class="title">
                    <div @click="()=>{modalShow=true}">@</div>
                    <div @click="submit(item,index+1)">提交</div>
                  </div>
                </div>
                <div class="likes-list" v-if="item.likeList&& item.likeList.length">
                  <a-icon type="heart" theme="twoTone" twoToneColor="#eb2f96"></a-icon>
                  <span v-for="(v,i) in item.likeList" :key="i">
                    {{ v.personName }}<span v-if="(i+1)!==item.likeList.length">,</span>
                  </span>
                </div>
                <div class="comments-list" v-show="item.commentList.length> 0">
                  <div class="commentDetail">
                    <article v-for="(v,i) in item.commentList" :key="i">
                      <main @click="commentToWho(v,index)">
                        <img
                          :src="v.commentPerson.userPicture!==null?v.commentPerson.userPicture:noPic"
                          alt=""
                          :οnerrοr="noPic"/>
                        <span style="color: #6788A2">{{ v.commentPerson.userName }}</span>
                        <span v-if="v.beCommentPerson !== null">@</span>
                        <span v-if="v.beCommentPerson !== null" style="color: #6788A2">
                          {{ v.beCommentPerson.userName }}
                        </span>
                        <span>:</span>
                        <span>{{ v.commentContent }}</span>
                      </main>
                      <!--                      <div>-->
                      <!--                        <span-->
                      <!--                          v-if="v.canDelete"-->
                      <!--                          style="color:#0b8ef5"-->
                      <!--                          @click="deleteComment(v,index+1,item.id)">删除</span>-->
                      <!--                        &lt;!&ndash; <span v-else style="color:#606366">删除</span>&ndash;&gt;-->
                      <!--                        <span>{{ v.createdTime }}</span>-->
                      <!--                      </div>-->
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="inner" v-show="!loading">
            <div class="scroll-load">{{ projectMomentTotal === list.length ? '' : '向上滑动加载' }}</div>
          </div>
        </h3-scroll>
      </div>

    </div>
    <Modal
      :visible="isModalShow"
      :maskClosable="true"
      @cancel="modalCancel"
      footer=""
    >
      <a-tree
        :treeData="treeData"
        :defaultSelectedKeys="defaultSelectedKeys"
        :defaultExpandAll="true"
        @select="onSelect"
      />
    </Modal>
    <overlay :show="show" @click="show = false">
      <div class="wrapper">
        <div class="block" @click.stop>
          <div class="block_title">
            <div>
              <span></span>
            </div>
            <h2>{{ noticeTitle }}</h2>
            <div>
              <span></span>
            </div>
          </div>
          <div class="block_time">{{ createdTime }}</div>
          <p>
            {{ noticeContent }}
          </p>
          <div @click="show = false" class="button">确 定</div>
        </div>
      </div>
    </overlay>
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
import {getTreeData} from "../../service/business.js";
import {
  getMoblieFrontPage,
  getInfo_login,
  getProjectMoment,
  getAboutMeMoment,
  doLikeOrComment,
  cancelLike,
  deleteComment,
  deleteProjectMoment,
  markAboutMeAsRead,
  // getProjectMomentStatus
} from "../service/index.js";
import tree from "ant-design-vue/lib/tree";
import Tree from "element-ui/lib/tree";
import Modal from "ant-design-vue/lib/modal";
import env from "@/config/env";
import img1 from "../../Img/img/news_icon1.png";
import img2 from "../../Img/img/news_icon2.png";
import imgUser from "../../Img/img/user.png";
import {Swipe} from "vant";
import {SwipeItem} from "vant";
import {ImagePreview} from "vant";
import {Overlay} from "vant";
import {PullRefresh, List, ActionSheet, Search} from "vant";
import {Button, Input, Popover, Icon, Divider} from "@h3/antd-vue";
import * as Api from "../../service/api";
import mobile from "@cloudpivot/form/src/renderer/components/mobile";
import noPic from "../../Img/safety/noPiv.png";
import Utils from "@/utils";
import {Utils as CoreUtils} from '@ctesi/core';

export default {
  components: {
    // PullRefresh,
    // List,
    ADivider: Divider,
    AIcon: Icon,
    APopover: Popover,
    AButton: Button,
    VanActionSheet: ActionSheet,
    VanSearch: Search,
    TextArea: Input.TextArea,
    Tree,
    ATree: tree,
    Modal,
    Swipe,
    Overlay,
    SwipeItem,
    [ImagePreview.Component.name]: ImagePreview.Component,
    H3Scroll: mobile.H3Scroll
  },
  data() {
    return {
      // lists: [],
      list: [],
      page: 1,
      pageSize: 3,
      loading: false,
      // finished: false,
      // refreshing: false,
      isLike: [],
      isCommenting: [],
      modalShow: false,
      mark: 'department',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      treeDepartmentData: [],
      aboutMeList: [],
      aboutMeCount: 0,
      comment: '',
      commentId: '',
      noPic: noPic,
      commentSave: '',
      filterText: null,
      isModalShow: false,
      show: false,
      IMGURL: `${env.apiHost}`,
      constructorBim: "",
      showImg: false,
      designunitBim: "",
      kgrq1: "",
      jgrq1: "",
      imgUser: imgUser,
      BigImg: "",
      Img: "",
      noticeImg: "",
      createdTime: "",
      noticeTitle: "",
      projectName: "",
      panoramaTitle: "",
      width100: "width100",
      width50: "width50",
      width30: "width30",
      projectCode: "",
      panoramaUrl: "",
      noticeContent: "",
      userId: "",
      // recentProjectCircle: [],
      treeData: [],
      companyList: [],
      defaultSelectedKeys: [],
      panoramaCoverImg: "",
      //
      currentCommentId: '',
      projectMomentTotal: 0,
      projectMomentKey: 1
    };
  },
  inject: ["projectConfig", "corpId", "logo"],
  mounted() {
    this.projectName = this.projectConfig.projectName;
    this.projectCode = `${env.project}`;
    this.getTreeData();
    this.getAboutMeMoment();
  },
  methods: {
    overLatShow() {
      this.show = true;
    },

    //与我相关的条数和列表
    getAboutMeMoment() {
      getAboutMeMoment(this.projectCode, this.projectName).then((res) => {
        this.aboutMeList = res.data;
        this.aboutMeCount = res.data.length;
      })
    },

    getinit() {
      getMoblieFrontPage(this.projectConfig?.projectName ?? '', this.projectCode, this.userId).then(
        (res) => {
          this.Img = res.data.gcjsxx1?.imageList;
          this.companyList = res.data.gcjsxx1.windowDataList;
          // this.constructorBim = res.data.gcjsxx1.constructionunitbim?? "";
          // this.designunitBim = res.data.gcjsxx1.designunitbim;
          this.kgrq1 = res.data.gcjsxx1.kgrq1?.split("T")[0];
          this.jgrq1 = res.data.gcjsxx1.jgrq1?.split("T")[0];
          this.panoramaCoverImg = res.data.panoramic720?.panoramaCoverList
          this.panoramaUrl = res.data.panoramic720?.panoramaUrl;
          this.panoramaTitle = res.data.panoramic720.panoramaTitle;
          this.noticeTitle = res.data.recentTicketMessage.noticeTitle;
          this.createdTime =
            res.data.recentTicketMessage.createdTime?.split("T")[0];
          if (res.data.recentTicketMessage.noticeSort == 0) {
            this.noticeImg = img1;
          } else {
            this.noticeImg = img2;
          }
          // this.recentProjectCircle = res.data.recentProjectCircle;
          this.noticeContent = res.data.recentTicketMessage.noticeContent;
        }
      );
    },
    toformdetail() {
      this.$router.push({
        name: "form-detail",
        query: {
          // startWorkflowCode: this.projectCode + "_project_moment",
          // return:`${this.$route.fullPath}`,
          schemaCode: `${this.projectCode}_project_moment`,
          // sheetCode: null,
          queryCode: `${this.projectCode}_project_moment`,
          projectName: this.projectConfig?.projectName,
          return: `${this.$route.fullPath}?iframeAction=add`,
          iframeAction: 'add'
        },
      });
    },
    onLoad(page, done) {
      this.loading = true;
      const userId = sessionStorage.user.split('"')[3];
      const size = this.pageSize; //
      this.projectName = this.projectConfig.projectName;
      getProjectMoment(this.projectCode, this.projectName, page.num, size).then((res) => {
        // this.lists = res.data.records;
        if (res.errcode !== 0) return this.$message.error(res.errmsg)
        if (res.data) {
          this.projectMomentTotal = res.data.total;
          if (res.data.pages > page.num || res.data.pages === page.num) {
            if (page.num === 1) {
              this.list = res.data.records
            } else if (res.data.current * this.pageSize > this.list.length) {
              this.list = this.list.concat(res.data.records) //上滑加载
            } else {
              //删除，点赞，评论
              this.list.map((item, index) => {
                if (item.id === this.currentCommentId) {
                  res.data.records.map((val) => {
                    if (val.id === item.id) {
                      this.list.splice(index, 1, val)
                    }
                  })
                }
              })
            }
            for (let i = 0; i < this.list.length; i++) {
              this.isCommenting.push(false);
            }
            for (let i = 0; i < this.list.length; i++) {
              this.isLike.push(false);
            }
            for (let k = 0; k < this.list.length; k++) {
              for (let j = 0; j < this.list[k].likeList.length; j++) {
                if (this.list[k].likeList[j].personId === userId) {
                  this.isLike[k] = true;
                }
              }
            }
          }
        }
      }).finally((res) => {
        if (done && typeof done === "function") done(this.pageSize, this.projectMomentTotal);
        this.currentCommentId = '';
        this.loading = false
      });
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

    commentToWho(v, index) {
      const oldIndex = this.isCommenting.indexOf(true);
      if (oldIndex !== index) {
        this.doComment(index);
      } else if (this.commentId === v.commentPerson.id) {
        this.isCommenting[index] = !this.isCommenting[index];
        this.comment = '';
        this.commentSave = '';
        this.commentId = '';
        return;
      }
      this.commentSave = `@${v.commentPerson.userName}:`;
      // this.comment = `@${v.commentPerson.userName}:`;
      this.commentId = v.commentPerson.id;
    },

    deleteProjectMoment(v, index) {
      deleteProjectMoment(this.projectCode, v.id);
      //假删除动态，不刷新
      this.list = this.list.filter((item) => {
        return item.id !== v.id
      })
    },

    deleteComment(v, index, id) {
      deleteComment(this.projectCode, v.id);
      this.currentCommentId = id;
      this.onLoad({num: Math.ceil(index / this.pageSize)}, null)
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },

    submit(v, mesIndex) {
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
        noticePersonId: this.commentSave.length !== 0 ? this.commentId : v.userInfo.id,//被@人id,
        projectMomentId: v.id,
        projectName: this.projectConfig?.projectName ?? '',
      };
      doLikeOrComment(params).then(res => {
        if (res.errcode === 0) {
          this.isCommenting = this.isCommenting.map((val) => {
            return false
          })
          this.comment = '';
          this.commentSave = '';
          this.commentId = '';
          this.currentCommentId = v.id;
          this.onLoad({num: Math.ceil((mesIndex) / this.pageSize)}, null)
        }
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
      const userInfo = JSON.parse(sessionStorage.getItem("user"));
      this.mark = 'people';
      Api.getSearchUser({
        wd: val, page: 0, size: 9999999, corpId: userInfo.corpId
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
    doLike(v, i) {
      this.isLike[i] = !this.isLike[i];
      if (this.isLike[i]) {
        const params = {
          appCode: this.projectCode,
          beCommentPersonId: '',
          commentContent: '',
          likeOrComment: 0,
          noticePersonId: this.commentSave.length !== 0 ? this.commentId : v.userInfo.id,
          projectMomentId: v.id,
          projectName: this.projectName
        };
        doLikeOrComment(params);
      } else {
        cancelLike(this.projectCode, v.id);
      }
      this.currentCommentId = v.id;
      this.onLoad({num: Math.ceil((i + 1) / this.pageSize)}, null)
    },
    doComment(index) {
      this.isCommenting[index] = !this.isCommenting[index];
      this.isCommenting = this.isCommenting.map((val, key) => {
        return index !== key ? false : val
      })
      this.comment = '';
      this.commentSave = '';
      this.commentId = '';
    },
    to720detail() {
      window.open(this.panoramaUrl);
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
    tonotice() {
      this.$router.push({
        name: "notice",
      });
    },
    topanoramicView() {
      this.$router.push({
        name: "panoramicView",
      });
    },
    // toProjectCircle() {
    //   this.$router.push({
    //     name: "ProjectCircle",
    //   });
    // },
    toAboutMeMoment() {
      markAboutMeAsRead(this.projectCode, this.projectName);
      // console.log('this.aboutMeList',this.aboutMeList);
      this.$emit('getMomentStatus')
      this.$router.push({name: 'AboutMeMoment', query: this.aboutMeList})
    },
    modalCancel() {
      this.isModalShow = false;
    },
    parseQueryString(url) {
      const obj = {};
      const params = url.slice(1);
      const arr = (params.split('&'));
      arr.forEach((v, i) => {/*  */
        let str = v.split('=')[1];
        if (str.indexOf('%') === -1) {
          obj[v.split("=")[0]] = v.split("=")[1];
        } else {
          obj[v.split("=")[0]] = JSON.parse(decodeURIComponent(v.split("=")[1]));
        }
      })
      console.log(obj)
      return obj;
    },
    go2page(item) {
      const urlDetail = Utils.parseQueryString(`?${item.dataUrl}`);
      urlDetail.isWorkFlow = urlDetail.isWorkFlow === 'true';
      this.$router.push({
        // 业务表单
        name: "form-detail",
        query: urlDetail
      })
    },
    onSelect(selectedKeys, selectedNodes) {
      const temptKey = selectedNodes.node.dataRef;
      if (temptKey.value.split("-")[1] == "项目") {
        if (JSON.stringify(temptKey) !== "{}") {
          this.defaultSelectedKeys[0] = temptKey.id;
          console.log(temptKey);
          this.projectConfig?.updateProjectConfig(
            temptKey.title,
            temptKey.value.split("-")[1] == "集团"
              ? 0
              : temptKey.value.split("-")[1] == "公司"
                ? 1
                : 2,
            null
          );
          sessionStorage.setItem("projectname", temptKey.title);
          sessionStorage.setItem("projectId", temptKey.id);
        }
        // this.projectName = temptKey.title;
        this.list = [];
        this.getinit();
        this.initCommentParams();
        this.onLoad({num: 1}, null);
        this.projectMomentKey++;
        this.isModalShow = false;
      }
    },
    // findop(data, arr) {
    //   for (let i = 0; i < data.length; i++) {
    //     const item = data[i];
    //     if (item.children.length == 0) {
    //       arr.push({ title: item.title, value: item.value });
    //       return;
    //     } else {
    //       this.findop(item.children, arr);
    //     }
    //   }
    //   return arr;
    // },
    initCommentParams() {
      this.comment = '';
      this.commentSave = '';
      this.commentId = '';
      this.currentCommentId = '';
      this.isCommenting = this.isCommenting.map((val) => {
        return false
      })
    },
    async getTreeData() {
      this.treeData.length = 0;
      this.defaultSelectedKeys.length = 0;
      //@ts-ignore
      const {data, errcode, errmsg} = await getTreeData({
        appCode: env.project,
      });
      if (errcode === 0) {
        this.treeData = data;
        CoreUtils.deepFind(this.treeData,(item)=> {
          if(item.value.split('-')[1]!=='项目') {
            item.disabled = true;
            item.title = `${item.title}（${item.value.split('-')[1]}级）`
          }
          return false;
        },'children')
        console.log(this.treeData,'tree')
        if (this.treeData.length > 0) {
          //默认
          if (
            this.projectConfig &&
            (!this.projectConfig.projectName ||
              (this.projectConfig.projectName &&
                (!this.projectConfig.projectName.length)))
          ) {
            this.defaultSelectedPro(this.treeData, 'children')
          } else {
            const item = this.treeArrFilter(
              this.treeData,
              "children",
              "title",
              this.projectConfig?.projectName
            );
            //@ts-ignore
            this.defaultSelectedKeys.push(item[0].id);
          }
          sessionStorage.setItem("projectId", this.defaultSelectedKeys[0]);
        }
        getInfo_login().then((res) => {
          this.userId = res.data.id;
          this.getinit();
        });
        console.log(this.treeData, '1')
      } else {
        Notify({type: "warning", message: `${errmsg}`});
      }
    },
    treeArrFilter(arr, attChildren = "children", key, value) {
      let finalArr = [];
      arr.map((item) => {
        if (item[key] === value) {
          //@ts-ignore
          finalArr.push(item);
        }
        if (item[attChildren]) {
          const p = this.treeArrFilter(
            item[attChildren],
            attChildren,
            key,
            value
          );
          finalArr = finalArr.concat(p);
        }
      });
      return finalArr;
    },
    defaultSelectedPro(arr = [], attChildren = 'children') {
      for (let i = 0; i < arr.length; i++) {
        let type = arr[i].value.split("-")[1] === '集团' ? 0 : arr[i].value.split("-")[1] === '公司' ? 1 : 2;
        if (type === 2) {
          this.defaultSelectedKeys.push(arr[i].id);
          this.projectConfig?.updateProjectConfig(arr[i].title, type, null);
          return;
        }
        if (arr[i][attChildren] && !this.defaultSelectedKeys.length) {
          this.defaultSelectedPro(arr[i][attChildren], attChildren);
        }
      }
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
};
</script>

<style lang="less" scoped>
@import "~@/styles/mixins.less";
@import "~@/styles/common.less";
@import "./projectMoment.less";

* {
  font-family: Source Han Sans CN;
  text-align: left;
}

.homePage {
  display: flex;
  flex-direction: column;

  .homePage_title {
    width: 100%;
    // height: 37%;
    background: url("../../Img/img/bg.png");
    background-size: 100% 100%;
    padding: 20px 14px 0 14px;
    // margin-bottom: 47vw;

    .project_select {
      color: #fff;
      font-size: 20px;
      font-weight: 700;
      text-align: left;
      margin-bottom: 15px;
    }

    .project_message {
      background: #fff;
      border-radius: 8px;
      padding: 8px;
      // height: 345px;
      margin-bottom: 10px;

      .lunbo {
        width: 100%;
        height: 70%;
        margin-bottom: 15px;
        border-radius: 8px;
      }

      .projectName {
        border-bottom: 1px solid #f0f1f6;
        margin-bottom: 15px;

        span:nth-child(1) {
          color: #666;
          font-size: 14px;
          margin-right: 5px;
        }

        span:nth-child(2) {
          color: #000;
          font-weight: 700;
          font-size: 15px;
        }
      }

      .projectTime {
        display: flex;
        align-items: center;

        img {
          width: 15px;
          height: 15px;
          vertical-align: middle;
          margin-right: 3px;
        }

        //div {
        //  margin-bottom: 5px;
        //
        //  span:nth-child(2) {
        //    font-size: 14px;
        //    color: #666;
        //    vertical-align: middle;
        //  }
        //
        //  span:nth-child(3) {
        //    font-size: 15px;
        //    color: #000;
        //    vertical-align: middle;
        //    margin-right: 5px;
        //  }
        //}
      }
    }
  }

  .project_content {
    //margin: 0 16px;\
    //overflow: ;
    display: flex;
    flex-direction: column;
    flex: 1;

    .scroll-pro {
      flex: 1;
      position: relative;

      .mescroll {
        position: absolute;
        top: 0;
      }
    }

    .notice {
      height: 120px;
      border-radius: 8px;
      padding: 0 10px;
      background: #fff;
      margin-bottom: 15px;

      img {
        width: 35px;
        height: 35px;
        margin-right: 10px;
      }

      .notice_content {
        display: flex;

        p {
          margin-bottom: 5px;
        }

        p:nth-child(1) {
          color: #333;
          font-size: 15px;
          font-weight: 400;
          word-break: break-all;
          text-overflow: ellipsis;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        p:nth-child(2) {
          color: #b2b2b2;
          font-size: 12px;
          font-weight: 400;
        }
      }
    }

    .project_moments {
      .project_moments
    }

    .inner {
      position: relative;

      .scroll-load {
        position: absolute;
        font-size: 12px;
        color: grey;
        text-align: center;
        left: 50%;
        transform: translateX(-50%);
        .px2rem(top, 40)
      }
    }
  }

  .public_title {
    display: flex;
    //height: 45px;
    //line-height: 45px;
    border-bottom: 1px solid #f0f1f6;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    .px2rem(margin-top,10);
    .px2rem(padding-bottom,20);

    div:nth-child(1) {
      width: 85%;
      color: #000;
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

    .release {
      .px2rem(width,50);
      .px2rem(height,50  )
    }
  }

  .newMessage {
    //font-size: 15px;
    //padding: 0 50px;
    //margin: 0 115px;
    line-height: normal;
    display: block;
    margin: 0 auto;
    .px2rem(padding-left, 80);
    .px2rem(padding-right, 80);
    .px2rem(margin-bottom, 40)
  }

}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  .block {
    width: 300px;
    background-color: #fff;
    border-radius: 20px;
    padding: 20px;

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

.van-action-sheet__cancel {
  text-align: center;
}

.van-action-sheet__header {
  text-align: center;
}
</style>

<style lang="less">
.van-swipe__indicators {
  display: none !important;
}
</style>
