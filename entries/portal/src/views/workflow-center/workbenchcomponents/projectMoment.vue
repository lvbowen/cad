<template>
  <div>
    <div class="workbench_echarts">
      <div class="workBenchTitle">
        <h3>项目圈</h3>
        <!--        <div @click="toLinkCircle">查看更多＞</div>-->
        <div @click="toLinkCircle">查看更多＞</div>
      </div>
      <!--      <swiper :options="swiperOption" ref="Swiper">-->
      <!--        <swiper-slide v-for="(item, index) in lists" :key="index">-->
      <el-carousel
        :autoplay="false"
        class="comment-list"
        @change="changeCommentList"
        :loop="false">
        <el-carousel-item v-for="i in pages" :key="i">
          <template v-if="page===i">
            <div
              v-for="(item, index) in lists"
              :key="index"
              class="comment-item">
              <div @click="messageDialog(item,index)" class="swiperProjectcircle">
                <div class="swiper_title">
                  <el-scrollbar style="height: 100%">
                    <p>{{ item.dynamicContent }}</p>
                  </el-scrollbar>
                </div>
                <div class="imgList">
                  <img
                    v-if="item.imageList[0]"
                    v-lazy="IMGURL + item.imageList[0].split('?')[0] + '?webp=true&' + item.imageList[0].split('?')[1]"
                    alt=""
                  />
                  <img
                    v-if="item.imageList[1]"
                    v-lazy="IMGURL + item.imageList[1].split('?')[0] + '?webp=true&' + item.imageList[1].split('?')[1]"
                    alt=""
                  />
                </div>
                <div class="username">
                  <img :src="item.userInfo.userPicture" alt=""/>
                  <h5>{{ item.userInfo.userName }}</h5>
                  <p>{{ item.date }}</p>
                </div>
              </div>
            </div>
          </template>
        </el-carousel-item>
      </el-carousel>
      <!--        </swiper-slide>-->
      <!--      </swiper>-->
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="30%"
      @close="closeProCommentDialog"
      :closeOnPressEscape="false"
      :closeOnClickModal="false">
      <div class="name_Time">
        <div>
          <img :src="userPicture" alt=""/>
        </div>
        <div>
          <p>{{ dialogUserName }}</p>
          <p>{{ dialogDepartment }}</p>
        </div>
        <div>{{ dialogDate }}</div>
      </div>
      <div class="moments_content">
        <div class="imageText">
          <div>
            {{ dialogDynamicContent }}
          </div>
          <div v-if="dialogImage1.concat(currentProComment.videoList).length !== 0">
            <el-carousel height="360px">
              <el-carousel-item v-for="(item,index) in dialogImage1.concat(currentProComment.videoList)" :key="index">
                <el-image
                  v-if="!item.match(/.mp4/g)"
                  :previewSrcList="dialogImage1"
                  :src="item">
                </el-image>
                <video
                  controls
                  muted
                  :autoplay="false"
                  v-else>
                  <source :src="IMGURL + item" type="video/mp4">
                </video>
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>
        <div class="location">
          <div v-if="dialogBusinessSegments">
            动态分类：{{ dialogBusinessSegments }}
          </div>
          <div v-if="dialogAddress">
            <img alt="" src="../../../assets/images/wechat_icon3.png"/>
            <!-- {{ item.position.provinceName }} -->
            <!-- {{ item.position.cityName }} -->
            <span> {{ dialogDistrictName }}{{ dialogAddress }} </span>
          </div>
        </div>
        <div class="operation flex flex-space-between">
          <div class="delete">
            <span
              v-if="currentProComment.canDelete"
              style="color:#0b8ef5"
              @click="deleteProjectMoment(currentProComment)">删除</span>
            <!--                  <span v-else style="color:#606366">删除</span>-->
          </div>
          <a-popover
            placement="left"
            trigger="click"
            :getPopupContainer="triggerNode=> { return triggerNode.parentNode; }"
          >
            <template slot="content">
              <div class="like-box" @click="doLike(currentProComment,!currentProComment.hasLike)">
                <div v-if="!currentProComment.hasLike">赞</div>
                <div v-else>取消赞</div>
              </div>
              <div @click="doComment()">评论</div>
            </template>
            <a-button size="small">...</a-button>
          </a-popover>
        </div>
        <div class="all-list">
          <div class="divider-line"></div>
          <div class="inputArea flex flex-center-align flex-justify-between" v-if="isCommenting">
            <a-text-area
              class="textArea"
              v-model="comment"
              :placeholder="commentSave.length?commentSave:'评论区'"
              :autoSize="{ minRows: 1, maxRows:1 }"
            />
            <div class="title flex flex-center-align">
              <div @click="()=>{modalShow=true}">@</div>
              <div @click="submitMessage(currentProComment)">提交</div>
            </div>
          </div>
          <div class="likes-list" v-if="currentProComment.likeList && currentProComment.likeList.length">
            <a-icon type="heart" theme="twoTone" twoToneColor="#eb2f96"></a-icon>
            <span v-for="(v,i) in currentProComment.likeList" :key="i">
              {{ v.personName }}<span v-if="(i+1)!==currentProComment.likeList.length">,</span>
            </span>
          </div>
          <div class="comments-list" v-show="currentProComment.commentList.length> 0">
            <article v-for="(v,i) in currentProComment.commentList" :key="i">
              <main @click="commentToWho(v)">
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
            </article>
          </div>
          <!--        <div class="reply_message" v-if="dialogSequenceStatus">-->
          <!--          <div>-->
          <!--            <h4>{{ dialogHandler }}</h4>-->
          <!--            <p>回复</p>-->
          <!--            <h4>{{ dialogUserName }}</h4>-->
          <!--            <p>：</p>-->
          <!--          </div>-->
          <!--          <div>{{ dialogHandlingOpinions }}</div>-->
          <!--          <img-->
          <!--            v-if="dialogSequenceStatus == 'COMPLETED'"-->
          <!--            :src="imgState1"-->
          <!--            alt=""-->
          <!--          />-->
          <!--          <img-->
          <!--            v-if="dialogSequenceStatus == 'PROCESSING'"-->
          <!--            :src="imgState2"-->
          <!--            alt=""-->
          <!--          />-->
          <!--        </div>-->
        </div>
        <el-dialog
          :visible.sync="modalShow"
          customClass="inner-dialog-class"
          @close="closeModal"
          :closeOnPressEscape="false"
          :closeOnClickModal="false"
          :destroyOnClose="true"
          appendToBody
          width="25%">
          <template slot="title">
            <div v-show="mark==='department'" class="header">
              组织架构
            </div>
            <div v-show="mark!=='department'" class="flex flex-center-align">
              <a-icon type="left" @click="getDepartments"></a-icon>
              <span class="header">人员列表</span>
            </div>
          </template>
          <a-input-search style="margin-bottom: 8px" placeholder="请输入关键字" @search="searchPersonByKeyword"/>
          <Tree
            class="treeContainer"
            :data="treeDepartmentData"
            :props="defaultProps"
            defaultExpandAll
            @node-click="clickDepartment"
            :filterNodeMethod="filterNode"
            ref="tree">
          </Tree>
        </el-dialog>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {workflowCenterApi} from "@cloudpivot/api";
import {
  getrefreshProjectWarningNotice,
  getAddUserMessageRelatio
} from "../../../config/index.js";
import env from "@/config/env";
// import {getProjectMoments} from "../../../../extends/businessComponent/progressAnalysis/serve/index.js";
// import {Swiper} from "vue-awesome-swiper";
// import {SwiperSlide} from "vue-awesome-swiper";
import Carousel from "element-ui/lib/carousel";
import Image from "element-ui/lib/image";
import CarouselItem from "element-ui/lib/carousel-item";
import "../../../../../portal/extends/businessComponent/ManageViews/swiper/swiper.css";
import imgState1 from "../../../assets/images/wechat_icon1.png";
import imgState2 from "../../../assets/images/wechat_icon2.png";
import Vue from "vue";
import VueLazyload from 'vue-lazyload'
import {getProjectMomentV2,deleteProjectMoment,doLikeOrComment,cancelLike} from "../../../../extends/service/api";
import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import noPic from '../../../../src/assets/images/noPiv.png';
import Tree from "element-ui/lib/tree";
import {DoLike, PersonLocation, ProjectComment, ProjectCommentPerson} from "../../../../extends/type";
import * as Api from "../../../../../mobile/extends/service/api";

Vue.use(VueLazyload)

export default {
  components: {
    // Swiper,
    // SwiperSlide,
    ElCarouselItem: CarouselItem,
    ElCarousel: Carousel,
    ElImage: Image,
    APopover: Popover,
    AButton: Button,
    // eslint-disable-next-line vue/no-unused-components
    ATextArea: Input.TextArea,
    AInputSearch: Input.Search,
    AIcon: Icon,
    Tree
  },
  data() {
    return {
      noticeTitle: "",
      uploadTime: "",
      noticeContent: "",
      userPicture: "",
      imgState1: imgState1,
      imgState2: imgState2,
      borerbottom: "borerbottom",
      dialogUserName: "",
      dialogDepartment: "",
      dialogDate: "",
      dialogDynamicContent: "",
      dialogImage1: [],
      dialogBusinessSegments: "",
      dialogAddress: "",
      dialogDistrictName: "",
      dialogSequenceStatus: "",
      projectName: "",
      // dialogHandler: "",
      // dialogHandlingOpinions: "",
      isRead: "",
      userId: "",
      messageType: 0,
      noticeList: [],
      lists: [],
      unfinishedIshow: true,
      dialogVisible: false,
      noticeDiaolog: false,
      IMGURL: `${env.apiHost}`,
      unfinishTable: [],
      finishedData: [],
      projectCode: "",
      totalFinished: 0,
      unfinishTotal: 0,
      unreadData: 0,
      readData: 0,
      workflowData: 0,
      swiperOption: {
        slidesPerView: 5,
        mousewheel: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
          hideOnClick: true,
          hiddenClass: "my-button-hidden",
        },
        direction: "horizontal",
      },
      //start
      page: 1,
      size: 5,
      total: 0,
      pages: 0,
      currentProComment: {
        businessSegments: '',
        canDelete: '',
        commentList: [],
        dataUrl:'',
        date:'',
        dynamicContent:'',
        hasLike:'',
        id:'',
        imageList:[],
        likeList:[],
        position:[],
        projectName:'',
        userInfo:{},
        videoList:[]
      },
      currentProCommentIndex:0,
      isCommenting: false,
      comment: '',
      commentSave: '',
      commentId: '',
      noPic: noPic,
      //人员选择
      modalShow: false,
      mark: 'department',
      treeDepartmentData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      //end
    }
  },
  inject: ["projectConfig"],
  watch: {
    modalShow: {
      handler(v) {
        if (v) {
          this.getDepartments();
        }
      }
    }
  },
  mounted() {
    this.projectCode = `${env.project}`;
    this.projectName = this.projectConfig?.projectName;
    // this.userId = JSON.parse(sessionStorage.getItem("user")).id;
    this.getinit();
    // getProjectMoments(this.projectCode, this.projectName).then((res) => {
    //   this.lists = res.data;
    // });
    this.getProjectMomment();
    // this.getSorMessage()
  },

  methods: {
    isReadClick() {
      if (this.isRead === "") {
        //只看未读
        this.isRead = false;
        this.getSorMessage()
      } else {
        //已读
        this.isRead = "";
        this.getSorMessage()
      }
    },
    noticeDialogClick(val) {
      val.isRead = true;
      if (val.noticeSort == 2) {
        this.$router.push({
          path: "/application/" + this.projectCode + "/ProjectLocation",
          query: {
            code: this.projectCode + "_ProjectLocation",
            pcUrl: "/application/" + this.projectCode + "/ProjectLocation",
            isAllDisplay: true,
          },
        });
      } else {
        this.noticeTitle = val.noticeTitle;
        this.uploadTime = val.uploadTime;
        this.noticeContent = val.noticeContent;
        this.noticeDiaolog = true;
      }
      const cmd = {
        isRead: false,
        messageId: val.id,
        messageType: val.noticeSort,
        projectCode: this.projectCode,
        projectName: this.projectName,
        userId: this.userId,
      };
      getAddUserMessageRelatio(cmd).then((res) => {
        console.log(res);
      });

    },
    tolinkDetail() {
      if (this.unfinishedIshow) {
        this.tomyunfinishedworkitem();
      } else {
        this.tomyFinishedWorkItem();
      }
    },
    noticeClick() {
      this.messageType = 0;
      this.getSorMessage()
    },
    warnClick() {
      this.messageType = 1;
      this.getSorMessage()
    },
    unfinishedClick() {
      this.unfinishedIshow = true;
    },
    finishedClick() {
      this.unfinishedIshow = false;
    },
    messageDialog(val,index) {
      for (const valKey in this.currentProComment) {
        this.currentProComment[valKey] = val[valKey]
      }
      this.currentProCommentIndex = index;
      this.dialogImage1 = [];
      this.userPicture = val.userInfo.userPicture;
      this.dialogUserName = val.userInfo.userName;
      this.dialogDepartment = val.userInfo.department;
      this.dialogDate = val.date;
      this.dialogDynamicContent = val.dynamicContent;
      this.dialogBusinessSegments = val.businessSegments;
      this.dialogAddress = val.position?.address;
      this.dialogDistrictName = val.position?.districtName;
      this.dialogSequenceStatus = val.sequenceStatus;
      // this.dialogHandler = val.handler;
      // this.dialogHandlingOpinions = val.handlingOpinions;
      if (val.imageList) {
        val.imageList.forEach(element => {
          this.dialogImage1.push(this.IMGURL + element)
        });
      }
      this.dialogVisible = true;
    },
    //项目圈
    toLinkCircle() {
      this.$router.push({
        path: "/application/LHG/ProjectCircle",
      });
    },
    //我的待办
    tomyunfinishedworkitem() {
      this.$router.push({
        name: "myUnfinishedWorkItem",
      });
    },
    //我的待阅
    tomyUnReadWorkItem() {
      this.$router.push({
        name: "myUnReadWorkItem",
      });
    },
    //我的已办
    tomyFinishedWorkItem() {
      this.$router.push({
        name: "myFinishedWorkItem",
      });
    },
    //我的已阅
    tomyReadWorkItem() {
      this.$router.push({
        name: "myReadWorkItem",
      });
    },
    //我的流程
    tomyWorkflow() {
      this.$router.push({
        name: "myWorkflow",
      });
    },
    formatMsgTime(timespan) {
      var date1 = new Date(timespan); //开始时间
      var date2 = new Date(); //结束时间
      var date3 = date2.getTime() - date1.getTime(); //时间差秒
      //计算出相差天数
      var days = Math.floor(date3 / (24 * 3600 * 1000));

      //计算出小时数
      var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
      var hours = Math.floor(leave1 / (3600 * 1000));

      //计算相差分钟数
      var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
      var minutes = Math.floor(leave2 / (60 * 1000));

      timespan = days + "天" + hours + "时" + minutes + "分";
      return timespan;
    },
    openDetail(val) {
      let routeUrl = this.$router.resolve({
        name: "form-detail",
        query: {
          workitemId: val.id,
          workflowInstanceId: val.instanceId,
          return: this.$route.fullPath,
          workitemType: "finishedWorkitem",
        },
      });
      this.isDingTalk?this.$router.push(routeUrl.route.fullPath):window.open(routeUrl.href, "_blank");
    },
    async getinit() {
      //已办
      const p = {
        page: 0,
        size: 99999,
        appCode: this.projectCode,
      };
      const res = await workflowCenterApi.listFinishedWorkitems(p);
      res.data.content.forEach((e) => {
        if (e.workflowInstanceState == "DRAFT") {
          e.workflowInstanceState = "草稿";
        }
        if (e.workflowInstanceState == "PROCESSING") {
          e.workflowInstanceState = "进行中";
        }
        if (e.workflowInstanceState == "COMPLETED") {
          e.workflowInstanceState = "已完成";
        }
        if (e.workflowInstanceState == "CANCELED") {
          e.workflowInstanceState = "被取消";
        }
        if (e.workflowInstanceState == "EXCEPTION") {
          e.workflowInstanceState = "异常";
        }

        if (e.approval == "1") {
          e.approval = "同意";
        }
        if (e.approval == "2") {
          e.approval = "驳回";
        }
        if (e.approval == "3") {
          e.approval = "转办";
        }
        if (e.approval == "4") {
          e.approval = "取消";
        }
        if (e.approval == "5") {
          e.approval = "未处理";
        }
      });
      this.finishedData = res.data.content;
      this.totalFinished = res.data.totalElements;
      //待办
      const unfinsh = {
        batchOperate: false,
        page: 0,
        size: 99999,
        appCode: this.projectCode,
      };
      const unfinishres = await workflowCenterApi.searchWorkitems(unfinsh);
      unfinishres.data.content.forEach((e) => {
        if (e.receiveTime) {
          e.receiveTime = this.formatMsgTime(e.receiveTime);
        }
      });
      this.unfinishTable = unfinishres.data.content;
      this.unfinishTotal = unfinishres.data.totalElements;
      //待阅
      const unreadres = await workflowCenterApi.searchCirculates(p);
      this.unreadData = unreadres.data.totalElements;
      //已阅
      const readres = await workflowCenterApi.listReadWorkitems(p);
      this.readData = readres.data.totalElements;
      //流程
      const l = {
        instanceState: "PROCESSING,EXCEPTION,DRAFT",
        page: 0,
        size: 20,
        appCode: this.projectCode,
      };
      const workflowres = await workflowCenterApi.getMyInstanceList(l);
      this.workflowData = workflowres.data.totalElements;
    },
    //add 评论、点赞、删除
    async getProjectMomment() {
      this.lists = [];
      await getProjectMomentV2({
        appCode: this.projectCode,
        projectName: this.projectConfig?.projectName??'',
        page: this.page,
        size: this.size
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg)
        this.lists = res.data.records;
        this.total = res.data.total;
        this.pages = res.data.pages;
      })
    },
    changeCommentList(val) {
      this.page = val+1;
      this.getProjectMomment();
    },
    deleteProjectMoment(v) {
      deleteProjectMoment({
        appCode: this.projectCode,
        projectMomentId: v.id
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg);
        this.$message.success('删除成功');
        this.initProMomentParams();
        this.getProjectMomment();
      }).finally(()=> {
        this.dialogVisible = false
      });
    },
    doLike(v,hasLike) {
      if(hasLike) {
        //点赞
        const params = {
          appCode: this.projectCode,
          beCommentPersonId: '',
          commentContent: '',
          likeOrComment: 0,
          noticePersonId: '',
          projectMomentId: v.id,
          projectName: this.projectName
        };
        doLikeOrComment(params).then((res)=> {
          if(res.errcode!==0) return this.$message.error(res.errmsg);
          this.renderProMomentDialog();
        })
      }else {
        //取消赞
        cancelLike({
          appCode: this.projectCode,
          projectMomentId: v.id
        }).then((res)=> {
          if(res.errcode!==0) return this.$message.error(res.errmsg);
          this.renderProMomentDialog()
        })
      }
    },
    renderProMomentDialog() {
      this.getProjectMomment().then(()=> {
        this.lists.map((item, index) => {
          if(index===this.currentProCommentIndex) {
            for (const valKey in this.currentProComment) {
              this.currentProComment[valKey] = item[valKey]
            }
          }
        })
      });
    },
    doComment() {
      this.isCommenting =!this.isCommenting;
      this.comment = '';
      this.commentSave = '';
      this.commentId = '';
    },
    commentToWho(v) {
      this.isCommenting = this.isCommenting?this.commentId !== v.commentPerson.id:true
      if(this.isCommenting) {
        this.commentSave = `@${v.commentPerson.userName}:`;
        this.commentId = v.commentPerson.id;
      }else {
        this.comment = '';
        this.commentSave = '';
        this.commentId = '';
      }
    },
    submitMessage(v) {
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
        if(res.errcode!==0) return this.$message.error(res.errmsg);
        this.isCommenting = false;
        this.comment = '';
        this.commentSave = '';
        this.commentId = '';
        this.renderProMomentDialog()
      })
    },
    closeProCommentDialog() {
      this.initProMomentParams()
    },
    initProMomentParams () {
      this.currentProComment = this.$options.data(this).currentProComment;
      this.currentProCommentIndex = 0;
      this.isCommenting = false;
      this.comment = '';
      this.commentSave = '';
      this.commentId = '';
    },
    //人员选择 statr
    getDepartments() {
      this.treeDepartmentData = [];
      Api.getDepartments({appCode: this.projectCode ?? ''}).then(res => {
        if (res.errcode !== 0) return;
        this.modalShow = true;
        this.mark = 'department';
        this.treeDepartmentData = res.data ?? [];
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
      this.mark === 'department';
      this.modalShow = false;
      this.treeDepartmentData = [];
      // if (this.mark === 'department') {
      //   this.modalShow = false;
      // } else if (this.mark === 'people') {
      //   this.getDepartments();
      // }
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
        this.commentId = c.id;
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    searchPersonByKeyword(value) {
      if (value === '') {
        this.getDepartments();
      } else {
        this.getSearchUser(value);
      }
    }
    //end
  },
};
</script>

<style lang="less" scoped>

.workbench {
  .workbench_data {
    display: flex;
    padding: 0 12px;

    .data_box {
      flex: 1;
      margin-right: 15px;
      height: 75px;
      cursor: pointer;
      background: url("../../../assets/images/kuang.png");
      background-size: 100% 100%;
      line-height: 75px;
      text-align: center;

      h3 {
        display: inline-block;
        color: #0a0a0a;
        font-size: 20px;
        font-weight: 700;
        vertical-align: middle;
        margin-bottom: 0;
      }

      p {
        display: inline-block;
        color: #004898;
        font-size: 32px;
        font-weight: 700;
        vertical-align: middle;
        margin-left: 20px;
        margin-bottom: 0;
      }
    }
  }

  .workbench_icon {
    padding-left: 2px;
    font-size: 16px;
    font-weight: 700;
    color: #0a0a0a;
    margin-bottom: 10px;

    img {
      width: 19px;
      height: 19px;
      cursor: pointer;
    }
  }

  .workbench_work {
    display: flex;
    padding: 20px;

    h3 {
      width: 12%;
      height: 50px;
      margin-left: 20px;
      line-height: 50px;
      font-size: 17px;
      font-family: Microsoft YaHei;
      font-weight: bold;
      cursor: pointer;
      color: #333333;
      text-align: center;
    }

    .borerbottom {
      border-bottom: 2px solid #2970ff;
    }

    .workbench_unfinished {
      width: 50%;
      height: 360px;
      margin-right: 20px;
      background: #ffffff;
      box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);

      .finish_tab {
        display: flex;
        border-bottom: 2px solid #f3f6fa;

        div {
          margin-left: auto;
          line-height: 50px;
          padding-right: 20px;
          cursor: pointer;
        }
      }
    }

    .workbench_finished {
      width: 50%;
      height: 360px;
      margin-right: 20px;
      background: #ffffff;
      box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);

      .finish_tab {
        display: flex;
        border-bottom: 2px solid #f3f6fa;
        margin-bottom: 15px;

        div {
          margin-left: auto;
          line-height: 50px;
          padding-right: 20px;
          cursor: pointer;
        }
      }

      .noticeBox {
        height: 290px;
      }

      .Notice {
        display: flex;
        height: 40px;
        line-height: 40px;
        padding: 0 10px;

        img {
          width: 20px;
          height: 20px;
          margin-right: 10px;
        }

        p:nth-child(2) {
          width: 83%;
          margin-right: 20px;
          cursor: pointer;
        }

        p {
          font-size: 14px;
          font-family: Microsoft YaHei;
          font-weight: 400;
          color: #666666;
          word-break: break-all;
          text-overflow: ellipsis;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      }
    }
  }

  .workbench_echarts {
    width: 96.5%;
    margin: 0px 20px;
    background: #ffffff;
    box-shadow: 0px 0px 7px 0px rgba(0, 72, 152, 0.1);
    height: 360px;

    .workBenchTitle {
      display: flex;
      justify-content: space-between;

      div {
        line-height: 50px;
        padding-right: 20px;
        cursor: pointer;
      }
    }

    h3 {
      height: 50px;
      padding-left: 20px;
      line-height: 50px;
      font-size: 17px;
      font-family: Microsoft YaHei;
      font-weight: bold;
      color: #333333;
      border-bottom: 2px solid #f3f6fa;
    }

    .swiperProjectcircle {
      cursor: pointer;
      padding: 20px;

      .swiper_title {
        height: 88px;
        margin-bottom: 10px;

        p {
          font-size: 14px;
          font-family: Source Han Sans CN;
          font-weight: 400;
          color: #333333;
          text-indent: 20px;
        }
      }

      .imgList {
        width: 100%;
        display: flex;
        height: 110px;
        margin-bottom: 10px;

        img {
          width: 50%;
          margin-right: 10px;
        }
      }

      .username {
        display: flex;
        line-height: 40px;

        img {
          width: 40px;
          height: 40px;
          margin-right: 10px;
        }

        h5 {
          font-size: 13px;
          font-family: Source Han Sans CN;
          font-weight: 700;
          color: #343439;
          margin-right: auto;
        }

        p {
          font-size: 12px;
          font-family: PingFang SC;
          font-weight: 400;
          color: #b2b2b2;
        }
      }
    }

    .swiperProjectcircle:hover {
      background: rgba(148, 150, 158, 0.2);
    }
  }

  .outputValue_line {
    width: 100%;
    height: 85%;
    padding: 10px;
  }

  .ProgressEcharts {
    width: 100%;
    height: 85%;
    padding: 10px;
  }
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
      width: 55%;
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
      width: 30%;
    }
  }

  .moments_content {
    position: relative;
    margin-bottom: 20px;
    // height: 300px;
    background: #ffffff;
    border-radius: 12px;
    max-height: 450px;
    overflow: auto;

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
        max-height: 360px;

        .el-image {
          width: 100%;
          height: 100%;
        }

        img {
          width: 100%;
          height: 100%;
          margin-right: 5px;
        }
        video {
          width: 100%;
          height: 100%;
        }
      }
    }

    .location {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      div {
        text-align: left;
      }

      img {
        width: 12px;
      }
    }

    .location:before {
      content: none;
    }

    .reply_message {
      height: 80px;
      border-radius: 10px;
      background: rgba(248, 171, 5, 0.1);
      padding: 17px;

      div:nth-child(1) {
        display: flex;

        h4 {
          color: #1d8afd;
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
}

.block {
  background-color: #fff;
  padding: 20px;
  width: 100%;

  .block_time {
    text-align: center;
    font-size: 14px;
    margin-bottom: 10px;
  }

  .block_title {
    display: flex;
    justify-content: center;
    width: 100%;

    div {
      width: 30%;
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
    width: 40%;
    font-size: 18px;
    font-weight: 700;
    font-family: Adobe Heiti Std;
    text-align: center;
    color: #337df7;
  }

  p {
    font-family: Source Han Sans CN;
    font-size: 15px;
    letter-spacing: 1px;
    line-height: 25px;
    margin-bottom: 20px;
    text-indent: 20px;
  }

  .button {
    height: 40px;
    background: #337df7;
    color: #fff;
    line-height: 40px;
    font-size: 15px;
    cursor: pointer;
    text-align: center;
  }
}
</style>

<style lang="less">
.workbench {
  .el-table th > .cell {
    color: #333333;
    font-size: 15px;
  }

  .el-table th {
    padding: 8px 0;
  }

  .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  .el-dialog {
    border-radius: 12px;
  }

  .el-dialog__header {
    padding: 0 0 10px;
  }
}
</style>
<style lang="less" scoped>
@import '../../../../extends/styles/public.module.less';
.comment-list {
  /deep/ .el-carousel__item {
    display: flex;
  }
  .comment-item {
    width: 20%;
  }
}
.operation {
  padding:@spacing-base @spacing-large @spacing-base @spacing-base;
  //margin-bottom: @spacing-large;
  .delete {
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  /deep/ .ant-popover-inner-content {
    .flex;
    .like-box {
      margin-right: @spacing-medium;
    }
    >div {
      &:hover {
        color: #0e7fe1;
        cursor: pointer;
      }
      &:active {
        opacity: 0.8;
      }
    }
  }
}
.all-list {
  .divider-line {
    border-top: 1px solid #dcdfe6;
    margin: @spacing-base;
  }
  .inputArea {
    margin-right: @spacing-base;
    margin-bottom: @spacing-base;
    .title {
      & > div:nth-child(1) {
        font-size: 17px;
        font-weight: bold;
        color: #333333;
        margin-left:@spacing-base;
        margin-right: @spacing-base;
        &:active {
          opacity: 0.5;
        }
      }
      & > div {
        font-size: 17px;
        font-weight: bold;
        color: #3D7BFF;
        word-break: keep-all;
        cursor: pointer;
      }
    }
  }
  .base-bg {
    background-color: hsl(0deg 79% 99%);
    border-radius:10px;
    padding:@spacing-base;
    margin-bottom:1/2 * @spacing-base;
  }
  .likes-list {
    font-size: 15px;
    font-family: Source Han Sans CN;
    font-weight: 600;
    color: rgb(103, 136, 162);
    word-wrap: break-word;
    .base-bg;
    margin-top: @spacing-base;
  }
  .comments-list {
    .base-bg;
    & > article {
      padding: 5px 0;

      & > main {
        & > img {
          width: 18px;
          height: 18px;
          margin-bottom: 3px;
        }

        & > span {
          font-size: 15px;
          font-family: Source Han Sans CN;
          font-weight: 600;
          color: #666666;
          word-wrap: break-word;
        }
      }

      & > div {
        text-align: right;

      }
    }
  }
}
/deep/ .inner-dialog-class {
  border-radius: 12px;
  margin-top: 10%;
  margin-left: 121px;
  .el-dialog__body {
    height: 500px;
    overflow: auto;
  }
  .header {
    font-size: 15px;
    font-weight: bold;
  }
}
/deep/ .el-carousel__indicator--horizontal {
  display: none;
}
</style>
