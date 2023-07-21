<template>
  <div class="detailContainer">
    <apptitle :title="'验收明细'"></apptitle>
    <div class="content">
      <div
        v-for="(v,i) in dataArr"
        :key="i"
        class="cardContainer"
        @click="go2detail(v)">
        <div class="areaContainer">
          <p>{{ v.title }}</p>
          <van-divider/>
          <div class="detailList">
            <div>
              <div>
                <span>验收人 : </span>
                <span>{{ v.jcfzr }}</span>
              </div>
              <!--              <div>-->
              <!--                <span>整改人 : </span>-->
              <!--                <span>{{ v.zrr }}</span>-->
              <!--              </div>-->
              <div>
                <span>验收日期 : </span>
                <span>{{ v.jcrq }}</span>
              </div>
              <div>
                <!--    TODO:变色            -->
                <span>是否合格 : </span>
                <span v-if="v.sfhg==='是'" style="color: #0ab104">{{ v.sfhg }}</span>
                <span v-else style="color: #db0a0a">{{ v.sfhg }}</span>

              </div>
            </div>
            <img :src="v.url!==null?v.url:noPic" alt="" :οnerrοr="noPic"/>
          </div>
        </div>
      </div>
    </div>
    <van-divider/>
    <div class="comment">
      <div class="title">
        <span>评论</span>
        <span @click="()=>{this.modalShow=true}">@</span>
        <span @click="submit">提交</span>
      </div>
      <text-area
        class="textArea"
        v-model="comment"
        placeholder="评论区"
        :autoSize="{ minRows: 1, maxRows:1 }"
      />
      <div class="commentDetail">
        <article v-for="(v,i) in commentArr" :key="i">
          <main @click="commentToWho(v)">
            <img :src="v.commentPersonImg!==null?v.commentPersonImg:noPic" alt="" :οnerrοr="noPic"/>
            <span style="color: #6788A2">{{ v.commentName }}</span>
            <span v-if="v.beCommentName">@</span>
            <span v-if="v.beCommentName" style="color: #6788A2">{{ v.beCommentName }}</span>
            <span>:</span>
            <span>{{ v.commentContent }}</span></main>
          <div><span>{{ v.commentTime }}</span>
            <span
              v-if="v.delete"
              style="color:#0b8ef5;margin-left:5px"
              @click="deleteComment(v)">删除
            </span>
            <span v-else style="color:#606366;margin-left:5px">删除</span>
          </div>
        </article>
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
          :data="treeData"
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

<script lang="ts">
import {Vue, Component, InjectReactive, Watch} from 'vue-property-decorator';
import apptitle from "../components/appTitle.vue";
import {Card, Input, Icon} from '@h3/antd-vue';
import * as Api from "../../service/api";
import noPic from "../../Img/safety/noPiv.png"
import Tree from "element-ui/lib/tree";
import {Divider, ActionSheet, Search} from 'vant';

@Component({
  name: 'QualityInspectionDetails',
  components: {
    apptitle, ACard: Card, TextArea: Input.TextArea, Icon, Tree, VanActionSheet: ActionSheet,
    VanSearch: Search, VanDivider: Divider
  }
})
export default class QualityInspectionDetails extends Vue {
  @InjectReactive('projectConfig') projectConfig;
  @InjectReactive('project') projectCode;
  dataArr: Array<any> = [];
  commentArr: Array<any> = [];
  comment: string = '';
  commentId: string = '';
  noPic: HTMLImageElement = noPic;
  commentSave: string = '';
  filterText: string = '';
  modalShow: boolean = false;
  mark: string = 'department';
  defaultProps: { children: string, label: string } = {
    children: 'children',
    label: 'name'
  };
  treeData: Array<any> = [];

  mounted() {
    this.getZlysByDate(this.$route.query);
    this.getCommentListPage(this.$route.query);
  }

  clickDepartment(c, node, info) {
    if (this.mark === 'department') {
      Api.userByDepId({
        deptId: c.id as string,
        size: 9999,
        page: 0
      }).then(res => {
        if (res.errcode !== 0) return;
        this.mark = 'people';
        this.treeData = res.data.content;
      })
    } else if (this.mark === 'people') {
      this.modalShow = false;
      this.commentSave = `@${c.name}:`;
      this.comment = `@${c.name}:`;
      this.commentId = c.id;
    }

  }

  closeModal() {
    if (this.mark === 'department') {
      this.modalShow = false;
    } else if (this.mark === 'people') {
      this.getDepartments();
    }
  }

  commentToWho(v) {
    this.commentSave = `@${v.commentName}:`;
    this.comment = `@${v.commentName}:`;
    this.commentId = v.personId;
  }

  deleteComment(v) {
    Api.deleteComment({appCode: this.projectCode ?? '', dataId: v.id}).then(res => {
      if (res.errcode === 0) return this.getCommentListPage(this.$route.query);
    })
  }

  filterNode(value, data) {
    if (!value) return true;
    return data.name.indexOf(value) !== -1;
  }

  getZlysByDate(v) {
    Api.getZlysByDate({
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      date: v.checkDate,
    }).then(res => {
      if (!res.data) return;
      this.dataArr = res.data
    })
  }

  getCommentListPage(v) {
    Api.getCommentListPage({
      projectName: this.projectConfig?.projectName ?? '',
      appCode: this.projectCode ?? '',
      type: 'quality',
      checkArea: v.area as string,
      checkDate: v.checkDate as string,
      current: 0,
      size: 999999999
    }).then(res => {
      if (!res.data) return;
      //@ts-ignore
      this.commentArr = res.data.records ?? []
    })
  }

  getDepartments() {
    this.filterText = '';
    this.treeData = [];
    Api.getDepartments({appCode: this.projectCode ?? ''}).then(res => {
      if (res.errcode !== 0) return;
      this.modalShow = true;
      this.mark = 'department';
      this.treeData = res.data ?? [];
    })
  }

  go2detail(v) {
    const urlDetail: any = {
      return: `/apps/apps-form-list/${this.projectCode}_xcxjjb`,
      // sheetCode: `${this.projectCode}_zgtzs`,
      // startWorkflowCode: `${this.projectCode}_wtyhzglc`,
      workflowInstanceId: v.workflowInstanceId,
      // bizObjectId: v.id,
      isWorkFlow: true
    };
    this.$router.push({
      // 业务表单
      name: "form-detail",
      query: urlDetail
    })
  }

  submit() {
    let commentAll: string = '';
    if (this.commentSave.length !== 0 && this.comment.indexOf(this.commentSave) !== -1) {
      const tempt = this.comment.split(':');
      tempt.forEach((item, i) => {
        if (i !== 0) {
          commentAll += String(item);
        }
      })
    } else {
      commentAll = this.comment
    }

    Api.insertComment({
      appCode: this.projectCode ?? '',
      commentRecord: {
        checkArea: this.$route.query.area,
        checkDate: this.$route.query.checkDate,
        commentContent: commentAll,
        commentType: 'quality',
        projectName: this.projectConfig?.projectName ?? '',
        pid: this.commentSave.length !== 0 && this.comment.indexOf(this.commentSave) !== -1 ? this.commentId : null,//被@人id
      }
    }).then(res => {
      if (res.errcode === 0) return this.getCommentListPage(this.$route.query);
    })
  }


  @Watch('modalShow')
  modalShowListener(v) {
    if (v) {
      this.getDepartments();
    }
  }

  @Watch('filterText', {immediate: true})
  filterTextListener(val: string) {
    //@ts-ignore
    this.$refs.tree?.filter(val);
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';

.detailContainer {
  display: flex;
  flex-direction: column;

  .content {
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(79vh - 45px);

    .cardContainer {
      height: 170px;
      background-image: url("../../Img/safety/k3.png");
      background-size: 100% 100%;
      text-align: left;
      padding: 15px;
      display: flex;
      flex-direction: row;

      .areaContainer {
        display: flex;
        flex-direction: column;
        width: calc(100vw - 30px);

        & > p {
          white-space: nowrap;
          text-overflow: ellipsis;
          width: calc(100vw - 40px);
          margin: 5px 10px 10px 10px;
          overflow: hidden;
          font-size: 17px;
          font-weight: bold;
          color: #333333;
        }

        .detailList {
          display: flex;
          flex-direction: row;
          margin: 10px;

          & > div {
            display: flex;
            flex-direction: column;
            width: 50vw;

            & > div {
              text-align: left;
              margin: 4px auto 4px 0;

              & > span:nth-child(1) {
                .px2rem(width, 180px);
                font-size: 12px;
                font-weight: bold;
                color: #9392A3;
              }

              & > span:nth-child(2) {
                //.px2rem(width, 200px);
                font-size: 12px;
                font-weight: bold;
                color: #333333;
              }
            }
          }

          & > img {
            width: 40vw;
            height: 80px;
          }
        }
      }
    }
  }

  .comment {
    height: 30vh;

    .title {
      display: flex;
      flex-direction: row;

      & > span:nth-child(1) {
        text-align: left;
        width: 60vw;
        padding: 10px 15px;
        font-size: 17px;
        font-weight: bold;
        color: #333333;
      }

      & > span {
        text-align: right;
        width: 20vw;
        padding: 10px 15px;
        font-size: 17px;
        font-weight: bold;
        color: #3D7BFF;
      }
    }

    .textArea {
      margin: 0 2vh;
      width: 90vw;
      overflow-y: auto;
      font-size: 15px;
      min-height: 35px !important;
      max-height: 35px !important;
      line-height: 26px !important;
    }

    .commentDetail {
      margin: 10px 15px;
      background: rgba(248, 171, 5, 0.1);
      border-radius: 10px;
      height: calc(25vh - 82px);
      overflow-y: auto;
      text-align: left;

      & > article {
        padding: 5px;

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
          }
        }

        & > div {
          text-align: right;

        }
      }

    }
  }
}

.modalContent {
  height: 60vh;
  padding: 10px 15px;
}

.van-divider {
  margin: 0px 10px;
  color: #3c3838;
  border-color: #433e3e;
}
</style>
