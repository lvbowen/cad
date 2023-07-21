<template>
  <div class="progressSummary">
    <div style="display:inline-flex; flex-direction: row">
      <apptitle :title="'进度日志'" routeUrl="'business'"></apptitle>
      <div class="calendar">
        <img @click="selectDate" :src="imgCalendar" alt=""/>
      </div>
    </div>
    <div v-show="timePickShow">
      <el-date-picker
        v-model="value"
        type="date"
        placeholder="选择日期"
        @change="changeDate"
        valueFormat="yyyy-MM-dd"
      >
      </el-date-picker>
    </div>
    <div class="content">
      <div
        v-for="(v,i) in dataArr"
        :key="i"
        class="cardContainer"
        @click="go2Deatil(v)"
      >
        <div class="areaContainer">
          <p>{{ v.scheduleDate }}</p>
          <div style="display: flex; flex-direction: row">
            <div>
              <span>填报人 : </span>
              <span>{{ v.ownerName }}</span>
            </div>
            <div>
              <span>填报产值 : </span>
              <span>{{ v.journalMoney }}元</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <a-divider style="margin:15px 0 5px 0"/>
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
            <span v-if="v.beCommentName">回复</span>
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
import {Card, Input, Icon, Divider} from '@h3/antd-vue';
import * as Api from "../../service/api";
import imgCalendar from "../../Img/topicon.png";
import DatePicker from "element-ui/lib/date-picker";
import Tree from "element-ui/lib/tree";
import {ActionSheet, Search} from 'vant';

@Component({
  name: 'ProgressSummary',
  components: {
    apptitle,
    ACard: Card,
    TextArea: Input.TextArea,
    Icon,
    ElDatePicker: DatePicker,
    ADivider: Divider,
    Tree,
    VanActionSheet: ActionSheet,
    VanSearch: Search
  }
})
export default class ProgressSummary extends Vue {
  @InjectReactive('projectConfig') projectConfig;
  @InjectReactive('project') projectCode;
  dataArr: Array<any> = [];
  commentArr: Array<any> = [];
  comment: string = '';
  commentId: string = '';
  commentSave: string = '';
  imgCalendar: any = imgCalendar;
  value: any = '';
  timePickShow: boolean = false;
  date: string = '';
  filterText: string = '';
  modalShow: boolean = false;
  mark: string = 'department';
  defaultProps: { children: string, label: string } = {
    children: 'children',
    label: 'name'
  };
  treeData: Array<any> = [];

  mounted() {
    //@ts-ignore
    if(this.$route.query.scheduleDate) {
      //@ts-ignore
      this.value = this.$route.query.scheduleDate
      //@ts-ignore
      this.date = this.$route.query.scheduleDate
    }
    this.getQueryLog();
    this.getCommentListPage();
  }

  selectDate() {
    this.timePickShow = !this.timePickShow;
  }

  changeDate(val) {
    if (val) {
      this.date = val;
    } else {
      this.date = "";
    }
    this.getQueryLog();
    this.getCommentListPage();
  }

  go2Deatil(v) {
    this.$router.push({name: 'ProgressDetails', query: v})
  }

  getQueryLog() {
    if (!this.date) {
      const nowDate = new Date();
      const date = {
        year: nowDate.getFullYear(),
        month: nowDate.getMonth() + 1,
        date: nowDate.getDate(),
      }
      const newMonth = date.month > 10 ? date.month : '0' + date.month;
      const day = date.date > 10 ? date.date : '0' + date.date;
      const final = date.year + '-' + newMonth + '-' + day;
      this.date = final.toString();
    }
    Api.getQueryLog({
      projectCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      queryStartDate: this.date,
    }).then(res => {
      if (!res.data) return;
      this.dataArr = res.data
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

  getCommentListPage() {
    Api.getCommentListPage({
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      type: 'schedule',
      checkArea: '',
      checkDate: this.date as string,
      current: 0,
      size: 9999
    }).then(res => {
      if (!res.data) {
        this.commentArr = [];
        return;
      }
      //@ts-ignore
      this.commentArr = res.data.records ?? []
    })
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

  filterNode(value, data) {
    if (!value) return true;
    return data.name.indexOf(value) !== -1;
  }

  closeModal() {
    if (this.mark === 'department') {
      this.modalShow = false;
    } else if (this.mark === 'people') {
      this.getDepartments();
    }
  }

  commentToWho(v) {
    this.commentSave = `回复${v.commentName}:`;
    this.comment = `回复${v.commentName}:`;
    this.commentId = v.personId;
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
        checkArea: '',
        checkDate: this.date,
        commentContent: commentAll,
        commentType: 'schedule',
        projectName: this.projectConfig?.projectName ?? '',
        pid: this.commentSave.length !== 0 && this.comment.indexOf(this.commentSave) !== -1 ? this.commentId : null,//被回复人id
      }
    }).then(res => {
      if (res.errcode === 0) return this.getCommentListPage();
    })
  }

  deleteComment(v) {
    Api.deleteComment({appCode: this.projectCode ?? '', dataId: v.id}).then(res => {
      if (res.errcode === 0) return this.getCommentListPage();
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

<style lang="less" scoped>
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';

.progressSummary {
  display: flex;
  flex-direction: column;

  .content {
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(69vh - 45px);

    .cardContainer {
      height: 120px;
      background-image: url("../../Img/safety/k3.png");
      background-size: 100% 100%;
      text-align: left;
      .px2rem(padding, @spacing-large);
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
          // margin: 5px 10px 10px 10px;
          height: 40px;
          line-height: 40px;
          margin-left: 10px;
          margin-bottom: 0;
          overflow: hidden;
          font-size: 18px;
          font-weight: bold;
          color: #333333;
        }

        & > div > div {
          text-align: left;
          // width: calc(50vw - 20px);
          padding: 5px 10px 10px 10px;

          & > span:nth-child(1) {
            // .px2rem(width, 180px);
            font-size: 14px;
            font-weight: bold;
            color: #9392A3;
          }

          & > span:nth-child(2) {
            //.px2rem(width, 200px);
            font-size: 15px;
            font-weight: bold;
            color: #333333;
          }
        }
      }

      & > img {
        width: 35vw;
        height: 100px;
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
      min-height: 35px!important;
      max-height: 35px!important;
      line-height: 26px!important;
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

  .calendar {
    width: 15%;
    height: 45px;
    background: #0e79ed;

    img {
      width: 25px;
      height: 25px;
      margin-top: 10px;
    }
  }

  /deep/ .app_title > div > span {
    padding-left: 15%;
  }

  .el-input {
    width: 100%;
  }
}

.modalContent {
  height: 60vh;
  padding: 10px 15px;
}
</style>
