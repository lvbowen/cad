<template>
  <div>
    <div class="workbench_data">
      <div @click="tomyunfinishedworkitem" class="data_box">
        <h3>我的待办</h3>
        <p>{{ unfinishTotal }}</p>
      </div>
      <div @click="tomyUnReadWorkItem" class="data_box">
        <h3>我的待阅</h3>
        <p>{{ unreadData }}</p>
      </div>
      <div @click="tomyFinishedWorkItem" class="data_box">
        <h3>我的已办</h3>
        <p>{{ totalFinished }}</p>
      </div>
      <div @click="tomyReadWorkItem" class="data_box">
        <h3>我的已阅</h3>
        <p>{{ readData }}</p>
      </div>
      <div @click="tomyWorkflow" class="data_box">
        <h3>我的流程</h3>
        <p>{{ workflowData }}</p>
      </div>
    </div>
    <div class="workbench_work">
      <div class="workbench_unfinished">
        <div class="finish_tab">
          <h3
            @click="unfinishedClick"
            :class="unfinishedIshow ? borerbottom : ''"
          >
            我的待办
          </h3>
          <h3
            @click="finishedClick"
            :class="!unfinishedIshow ? borerbottom : ''"
          >
            我的已办
          </h3>
          <div @click="tolinkDetail">查看更多></div>
        </div>
        <el-table
          v-show="unfinishedIshow"
          :data="unfinishTable"
          stripe
          height="300"
          style="width: 100%"
        >
          <el-table-column
            align="center"
            prop="startTime"
            label="发起时间"
            width="180"
          >
          </el-table-column>
          <el-table-column align="center" label="流程名称" width="180">
            <template slot-scope="scope">
              <p style="cursor: pointer" @click="openDetail(scope.row)">
                {{ scope.row.instanceName }}
              </p>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="originatorName" label="发起人">
          </el-table-column>
          <el-table-column align="center" prop="activityName" label="当前节点">
          </el-table-column>
          <el-table-column
            align="center"
            prop="receiveTime"
            label="停留时间"
          ></el-table-column>
        </el-table>
        <el-table
          v-show="!unfinishedIshow"
          :data="finishedData"
          stripe
          height="300"
          style="width: 100%"
        >
          <el-table-column
            align="center"
            prop="finishTime"
            label="处理时间"
            width="180"
          >
          </el-table-column>
          <el-table-column align="center" label="流程名称">
            <template slot-scope="scope">
              <p style="cursor: pointer" @click="openDetail(scope.row)">
                {{ scope.row.instanceName }}
              </p>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="workflowInstanceState"
            label="流程状态"
            width="120"
          >
          </el-table-column>
          <el-table-column
            align="center"
            prop="approval"
            label="处理结果"
            width="120"
          >
          </el-table-column>
        </el-table>
      </div>
      <div class="workbench_finished flex flex-column">
        <div class="finish_tab">
          <h3 @click="noticeClick" :class="messageType === 0 ? borerbottom : ''">
            项目公告
          </h3>
          <h3 @click="warnClick" :class="messageType === '' ? borerbottom : ''">
            预警通知
          </h3>
          <h3 @click="filesClick" :class="messageType === 1 ? borerbottom : ''">
            归档通知
          </h3>
          <div
            :style="{ color: isRead === false ? '#409eff' : '#333' }"
            @click="isReadClick"
          >
            只看未读
          </div>
        </div>
        <div class="flex-1 flex flex-column">
          <div class="notice-box full-height">
            <div
              @click="noticeDialogClick(item)"
              class="Notice"
              :style="{ background: index / 2 == 0 ? '#F8F9FE' : '' }"
              v-for="(item, index) in noticeList"
              :key="index"
            >
              <div v-if="!item.isRead">
                <img alt="" src="../../../assets/images/tips.png" />
              </div>
              <div v-else>
                <img alt="" src="../../../assets/images/laba.png" />
              </div>
              <p v-if="messageType!==1">{{ item.noticeTitle }}</p>
              <p v-if="messageType!==1">{{ item.uploadTime }}</p>
              <p v-if="messageType==1">{{ item.name }}中有一条数据待归档，请及时归档</p>
              <p v-if="messageType==1">{{ item.createTime }}</p>
            </div>
          </div>
          <a-pagination
            showQuickJumper
            :total="noticeTotal"
            :current="currentPage"
            :pageSize="pageSize"
            @change="onChangePage"/>
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="noticeDiaolog" width="30%" @close="closeNoticeDiaolog">
      <div class="wrapper">
        <div class="block" @click.stop>
          <div class="block_title">
            <div>
              <span></span>
            </div>
            <h2 v-if="messageType!==1">{{ noticeTitle }}</h2>
            <h2 v-if="messageType==1">{{ noticeName }}</h2>
            <div>
              <span></span>
            </div>
          </div>
          <div class="block_time" v-if="messageType!==1">{{ uploadTime }}</div>
          <div class="block_time" v-if="messageType==1">{{ createTime }}</div>
          <p>
            {{ noticeContent }}
          </p>
          <div @click="toForm" class="button">确 定</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, InjectReactive } from "vue-property-decorator";
import { workflowCenterApi } from "@cloudpivot/api";
import { getrefreshProjectWarningNotice, getAddUserMessageRelatio,getUnfiled } from "../../../config/index.js";
import env from "@/config/env";
import Carousel from "element-ui/lib/carousel";
import Image from "element-ui/lib/image";
import CarouselItem from "element-ui/lib/carousel-item";
import * as Type from "../../../../extends/type";
import Utils from "@/utils";
import { UrlDetail} from "../../../../extends/type";
import { getMyMessage} from "../../../../extends/service/api";
import Pagination from 'ant-design-vue/lib/pagination';
import 'ant-design-vue/lib/pagination/style/index.css';

@Component({
  name: "WorkTable",
  components: {
    ElCarouselItem: CarouselItem,
    ElCarousel: Carousel,
    ElImage: Image,
    APagination: Pagination
  },
})
export default class WorkTable extends Vue {
    @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
    totalFinished = 0;
    unfinishTotal = 0;
    unreadData = 0;
    readData= 0;
    workflowData= 0;
    messageType:number|string= 0;
    unfinishTable:any=[];
    finishedData:any=[];
    unfinishedIshow:boolean=true;
    projectCode:string="";
    projectName:string|null|undefined="";
    userId:string="";
    isRead:string|boolean="";
    noticeList:any=[];
    noticeTitle:string="";
    uploadTime:string="";
    noticeName:string="";
    createTime:string="";
    noticeContent:string="";
    noticeDiaolog:boolean=false;
    borerbottom="borerbottom";
    //
    formUrl: string = '';
    currentPage: number = 1;
    pageSize: number = 10;
    noticeTotal: number = 0;

    created(){
      window.addEventListener("message", this.receiveMessage, false);
      this.getSorMessage();
    }
    beforeDestroy(){
      window.removeEventListener("message",this.receiveMessage);
    }
    async receiveMessage(event){
      const origin = event.origin || event.originalEvent.origin;
      if(origin!==top?.origin)return;
      let data=event.data;
      if(data==="archive"){
        console.log(6666)
        await this.getSorMessage();
      }
    }

    mounted(){
      this.projectCode = `${ env.project }`;
      this.projectName = this.projectConfig?.projectName;
      this.getinit();
      this.getSorMessage();
      // this.openhtml()
    }
    async getinit() {
      //已办
      const res = await workflowCenterApi.listFinishedWorkitems({page:0,size:99999,appCode:this.projectCode});
      res.data.content.forEach( ( e ) => {
        if ( e.workflowInstanceState == "DRAFT" ) {
          e.workflowInstanceState = "草稿";
        }
        if ( e.workflowInstanceState == "PROCESSING" ) {
          e.workflowInstanceState = "进行中";
        }
        if ( e.workflowInstanceState == "COMPLETED" ) {
          e.workflowInstanceState = "已完成";
        }
        if ( e.workflowInstanceState == "CANCELED" ) {
          e.workflowInstanceState = "被取消";
        }
        if ( e.workflowInstanceState == "EXCEPTION" ) {
          e.workflowInstanceState = "异常";
        }

        if ( e.approval == "1" ) {
          e.approval = "同意";
        }
        if ( e.approval == "2" ) {
          e.approval = "驳回";
        }
        if ( e.approval == "3" ) {
          e.approval = "转办";
        }
        if ( e.approval == "4" ) {
          e.approval = "取消";
        }
        if ( e.approval == "5" ) {
          e.approval = "未处理";
        }
      } );
      this.finishedData = res.data.content;
      this.totalFinished = res.data.totalElements;
      //待办
      const unfinishres = await workflowCenterApi.searchWorkitems({batchOperate: false,page: 0,size: 99999,appCode: this.projectCode});
      unfinishres.data.content.forEach( ( e ) => {
        if ( e.receiveTime ) {
          e.receiveTime = this.formatMsgTime( e.receiveTime );
        }
      } );
      this.unfinishTable = unfinishres.data.content;
      this.unfinishTotal = unfinishres.data.totalElements;
      //待阅
      const unreadres = await workflowCenterApi.searchCirculates({page:0,size:99999,appCode:this.projectCode});
      this.unreadData = unreadres.data.totalElements;
      //已阅
      const readres = await workflowCenterApi.listReadWorkitems({page:0,size:99999,appCode:this.projectCode});
      this.readData = readres.data.totalElements;
      //流程
      const workflowres = await workflowCenterApi.getMyInstanceList({instanceState: "PROCESSING,EXCEPTION,DRAFT", page: 0,size: 20,appCode: this.projectCode});
      this.workflowData = workflowres.data.totalElements;
    }
    formatMsgTime( timespan ) {
      var date1 = new Date( timespan ); //开始时间
      var date2 = new Date(); //结束时间
      var date3 = date2.getTime() - date1.getTime(); //时间差秒
      //计算出相差天数
      var days = Math.floor( date3 / (24 * 3600 * 1000) );

      //计算出小时数
      var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
      var hours = Math.floor( leave1 / (3600 * 1000) );

      //计算相差分钟数
      var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
      var minutes = Math.floor( leave2 / (60 * 1000) );

      timespan = days + "天" + hours + "时" + minutes + "分";
      return timespan;
    }
    isReadClick() {
      this.currentPage = 1;
      if ( this.isRead === "" ) {
        //只看未读
        this.isRead = false;
        this.getSorMessage()
      } else {
        //已读
        this.isRead = "";
        this.getSorMessage()
      }
    }
    getSorMessage(){
      getrefreshProjectWarningNotice(this.projectCode).then((res) => {
        getMyMessage({
          projectName: this.projectName??'',
          projectCode: this.projectCode,
          userId: this.userId,
          messageType: this.messageType,
          isRead: this.isRead,
          page: this.currentPage,
          size: this.pageSize
        }).then((result)=> {
          if (result.errcode !== 0) return this.$message.error(result.errmsg as string)
          this.noticeTotal = result.data?.total??0;
          this.noticeList = result.data?.records??[]
        })
      });
    }
  onChangePage(pageNumber: number) {
    this.currentPage = pageNumber
    //更新列表
    this.getSorMessage();
  }
    noticeClick() {
      this.currentPage = 1;
      this.messageType = 0;
      this.getSorMessage()
    }
    warnClick() {
      this.currentPage = 1;
      this.messageType = '';
      this.getSorMessage()
    }
    filesClick(){
      this.messageType = 1;
      getUnfiled(this.projectCode, this.projectName).then((res)=>{
        // if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
        this.noticeList=res.data
      })
    }
    openDetail( val ) {
      let routeUrl = this.$router.resolve( {
        name: "form-detail",
        query: {
          workitemId: val.id,
          workflowInstanceId: val.instanceId,
          return: this.$route.fullPath,
          workitemType: "finishedWorkitem",
        },
      } );
      this.isDingTalk?this.$router.push(routeUrl.route.fullPath):window.open(routeUrl.href, "_blank");
    }
    tolinkDetail() {
      if ( this.unfinishedIshow ) {
        this.tomyunfinishedworkitem();
      } else {
        this.tomyFinishedWorkItem();
      }
    }
    unfinishedClick() {
      this.unfinishedIshow = true;
    }
    finishedClick() {
      this.unfinishedIshow = false;
    }
    //我的待办
    tomyunfinishedworkitem() {
      this.$router.push( {
        name: "myUnfinishedWorkItem",
      } );
    }
    //我的待阅
    tomyUnReadWorkItem() {
      this.$router.push( {
        name: "myUnReadWorkItem",
      } );
    }
    //我的已办
    tomyFinishedWorkItem() {
      this.$router.push( {
        name: "myFinishedWorkItem",
      } );
    }
    //我的已阅
    tomyReadWorkItem() {
      this.$router.push( {
        name: "myReadWorkItem",
      } );
    }
    //我的流程
    tomyWorkflow() {
      this.$router.push( {
        name: "myWorkflow",
      } );
    }
    noticeDialogClick(val) {
      val.isRead = true;
      if(val.noticeSort == 2) {
        this.$router.push({
          path: "/application/" + this.projectCode +"/ProjectLocation",
          query: {
            code: this.projectCode + "_ProjectLocation",
            pcUrl: "/application/" + this.projectCode +"/ProjectLocation",
            isAllDisplay: "1",
          },
        });
      }else if(this.messageType==1){
        let routeData = this.$router.resolve({
          // 业务表单
          name: "form-detail",
          query: {
            schemaCode: val.schemaCode,
            objectId:val.objectId,
            sheetCode: val.schemaCode,
            return: `${this.$route.fullPath}`,
            projectName: this.projectConfig?.projectName,
          },
        });
        this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, "_blank");
      }else {
        this.noticeTitle = val.noticeTitle;
        this.noticeName = val.name;
        this.createTime = val.createTime;
        this.uploadTime = val.uploadTime;
        this.noticeContent = val.noticeContent;
        this.formUrl = val.url as string;
        this.noticeDiaolog = true;
      }
      if(this.messageType!==1){
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
      }
    }
    toForm() {
      if(this.formUrl) {
        this.go2page(this.formUrl);
      }
      this.closeNoticeDiaolog();
    }
    closeNoticeDiaolog() {
      this.noticeDiaolog = false;
      this.formUrl = '';
    }
    go2page(url:string) {
      const urlDetail:UrlDetail =  Utils.parseQueryString(`?${url}`);
      urlDetail.isWorkFlow = urlDetail.isWorkFlow === 'true';
      const page = this.$router.resolve({
        // 业务表单
        name: "form-detail",
        //@ts-ignore
        query: urlDetail
      })
      this.isDingTalk?this.$router.push(page.route.fullPath):window.open(page.href, "_blank");
    }
}
</script>

<style lang="less" scoped>
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
  .el-table th > .cell {
    color: #333333;
    font-size: 15px;
  }

  .el-table th {
    padding: 8px 0;
  }
</style>

<style lang="less" scoped>
@import '../../../../extends/styles/public.module.less';
.notice-box {
  overflow: auto;
  margin-bottom: @spacing-base;
}
/deep/ .ant-pagination {
  text-align: right;
  padding: 0 @spacing-base @spacing-base 0;
}
</style>
