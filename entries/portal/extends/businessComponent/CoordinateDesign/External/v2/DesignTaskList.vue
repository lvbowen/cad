<template>
  <div class="design-task-list full-height overflow-hidden" :class="themeType==='dark'?'dark':'light'">
    <!--    <div :style="{ width: '300px', border: '1px solid #d9d9d9', borderRadius: '4px' }">-->
    <!--      <a-calendar :fullscreen="false" @panelChange="onPanelChange" />-->
    <!--    </div>-->
    <UserInfo :showBack="true" @init="getDesignTask"/>
    <div class="flex flex-center-align contacts">
      <img src="../../../../../src/assets/extends/CoordinateDesign/External/服务项目.png" alt="">
      <span @click="go()" class="name">{{ designTasks.taskName }}</span><span class="design-task-state" v-if="designTasks.state"> {{ designTasks.state }}</span><span class="design-task-state" v-if="['待接收','设计中'].includes(designTasks.state)&&!designTasks.isDesigner">{{ designTasks.designerName }}</span>
    </div>
    <div class="flex btns">
      <a-button
        :type="designTasks.state==='待接收'&&isDesigner?'primary':''"
        :class="designTasks.state==='待接收'&&isDesigner?'btn-click-active':'bg-gray'"
        :disabled="!(designTasks.state==='待接收'&&isDesigner)"
        @click="receiveTask">接收任务</a-button>
      <a-button
        :type="designTasks.state==='设计中'&&isDesigner?'primary':''"
        :class="designTasks.state==='设计中'&&isDesigner?'btn-click-active':'bg-gray'"
        :disabled="!(designTasks.state==='设计中'&&isDesigner)"
        @click="addAchievementFile">新增成果文件</a-button>
      <a-button
        :type="designTasks.state==='设计中'&&isDesigner?'primary':''"
        :class="designTasks.state==='设计中'&&isDesigner?'btn-click-active':'bg-gray'"
        :disabled="!(designTasks.state==='设计中'&&isDesigner)"
        @click="submitDesignTask">提交任务</a-button>
      <a-button
        :type="designTasks.state==='设计中'&&isDesigner?'primary':''"
        :class="designTasks.state==='设计中'&&isDesigner?'btn-click-active':'bg-gray'"
        :disabled="!(designTasks.state==='设计中'&&isDesigner)"
        @click="importAcheivement">导入</a-button>
    </div>
    <a-spin
      :spinning="loading"
      size="large"
      tip="努力加载中……">
      <div class="flex-auto achievements">
        <div
          v-for="(attachment,index) in designTasks.achievements"
          :key="index+achievementsKey"
          @click="activateAcheivement(attachment.id,index)"
          :class="index===currentActiveCard?'active-card':''">
          <div class="file-name">{{ attachment.fileName }}<span v-if="attachment.lightStates" >(<span :style="{color:attachment.lightStates==='成功'?'#32b683':attachment.lightStates==='转换中'?'#ffba00':'red'}">{{ attachment.lightStates }}</span>)</span></div>
          <div class="base-operate flex flex-center-align">
            <div class="flex flex-center-align" @click="loadAchievement(attachment.refId,attachment.fileName,attachment.id)">
              <img src="../../../../../src/assets/extends/CoordinateDesign/External/载入.png"/><span>载入</span>
            </div>
            <div class="flex flex-center-align" :class="!designing?'disable':''" @click="saveAchievement(attachment.id)">
              <img src="../../../../../src/assets/extends/CoordinateDesign/External/暂存.png"/><span>暂存</span>
            </div>
            <div class="flex flex-center-align" :class="!designing?'disable':''" @click="deleteAchievement(attachment.id)">
              <img src="../../../../../src/assets/extends/CoordinateDesign/External/删除.png"/><span>删除</span>
            </div>
            <div class="flex flex-center-align" :class="!designing?'disable':''" @click="transformModel(attachment.id)">
              <img src="../../../../../src/assets/extends/CoordinateDesign/External/轻量化.png"/><span>轻量化</span>
            </div>
          </div>
          <div class="annotations">
            <div class="flex flex-center-align flex-center-justify" @click="changeExpandState(index,attachment.expand)">
              <a-icon type="double-left" :class="attachment.expand?'expand-anticon':'not-expand-anticon'"/><span>批注</span>
            </div>
            <div
              v-for="(comment,key) in attachment.comments"
              :key="key"
              class="comment"
              v-show="attachment.expand">
              <a class="full-width" @click="showAnnotation(comment)" >{{ comment.title }}</a>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts">
import {Component,Vue,Prop} from "vue-property-decorator";
import UserInfo from "../components/UserInfo.vue";
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Calendar from 'ant-design-vue/lib/calendar';
import 'ant-design-vue/lib/calendar/style/index.css';
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import {DesignTask, Achievement,Comments} from "../../../../type";
import {exampleData} from "../../../engineeringArchives/mock";
import { getDesignTask,receiveDesignTask,lightDesignAcheivement} from "../../../../service/CoordinateDesign/External";
import {EventBus} from "./bus";
import env from "@/config/env";

@Component({
  name:"DesignTaskList",
  components: {
    UserInfo,
    AIcon: Icon,
    AButton: Button,
    ACalendar: Calendar,
    ASpin: Spin
  }
})
export default class DesignTaskList extends Vue {
  @Prop() taskName!:string;
  @Prop() designTaskId!:string;
  @Prop() productionId!:string;
  @Prop() clientId!:string;
  // onPanelChange() {
  //
  // }
  loading: boolean = false;
  designTasks: DesignTask = {
    id: '',
    state: '',
    taskName: '',
    achievements: [],
    isDesigner: false,
    designer: '',
    designerName: ''
  }
  currentActiveCard: number = -1;
  achievementsKey: number = 1;
  changeExpandState(index:number,expand:boolean) {
    this.$set(this.designTasks.achievements[index],'expand',!expand);
    this.achievementsKey++
    // const {href} = this.$router.resolve({
    //   name: '11111',
    //   query: {
    //     projectId: '22',
    //   }
    // })
    // console.log(href)
  }
  go() {
    const {origin} = location;
    const {href} = this.$router.resolve({
      name: 'ProfessionalDesignTask',
      query: {
        projectId: this.productionId,
        id: this.designTasks.id
      }
    })
    window.open(`${origin}${href}`, "_blank");
  }
  themeType: string = '';
  getDesignTask() {
    this.loading = true
    this.designTasks = {
      id: '',
      state: '',
      taskName: '',
      achievements: [],
      isDesigner: false,
      designer: '',
      designerName: ''
    }
    getDesignTask({
      appCode: 'XTSJ',
      id: this.designTaskId??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      for (const designTasksKey in this.designTasks) {
        if (res.data[designTasksKey]) {
          this.designTasks[designTasksKey] = res.data[designTasksKey];
          // if (res.data[designTasksKey]) {
          //   this.designTasks[designTasksKey] = res.data[designTasksKey];
          if (designTasksKey==='achievements' && this.designTasks[designTasksKey].length) {
            this.designTasks[designTasksKey].map((i)=> {
              Object.assign(i, { expand: true })
            })
          }
        }
      }
      console.log(this.designTasks)
    }).finally(()=> {
      this.loading = false
    })
  }
  receiveTask() {
    receiveDesignTask({
      appCode: 'XTSJ',
      id: this.designTaskId??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.$message.success('接收成功！')
      this.getDesignTask()
    })
  }
  get designing() {
    return this.designTasks.state==='设计中'
  }
  get isDesigner() {
    return this.designTasks.isDesigner;
  }
  activateAcheivement(id:string,index: number) {
    this.currentActiveCard = index;
    try {
      //@ts-ignore
      let txt = jsdesigntool.activateAcheivement(this.clientId??'',this.productionId??'',this.designTasks.id,id);
      console.log(txt, 'activateAcheivement');
      if (JSON.parse(txt).errCode===0) {
      }
    }catch (error) {
      console.log(`error==>${error}`)
    }
  }
  addAchievementFile() {
    try {
      //@ts-ignore
      let txt = jsdesigntool.addDesignAcheivement(this.clientId??'',this.productionId??'',this.designTasks.id,`${env.host}/api/api/xtsjProject/client/addDesignAcheivement`);
      console.log(txt, 'addDesignAcheivement');
      if (JSON.parse(txt).errCode===0) {
        this.getDesignTask();
      }
    }catch (error) {
      console.log(`error==>${error}`)
    }
  }
  importAcheivement() {
    try {
      //@ts-ignore
      let txt = jsdesigntool.importAcheivement(this.clientId??'',this.productionId??'',this.designTasks.id,`${env.host}/api/api/xtsjProject/client/addDesignAcheivement`);
      console.log(txt, 'importAcheivement');
      if (JSON.parse(txt).errCode===0) {
        this.getDesignTask();
      }
    }catch (error) {
      console.log(`error==>${error}`)
    }
  }
  submitDesignTask() {
    try {
      //@ts-ignore
      let txt = jsdesigntool.submitDesignTask(this.clientId??'',this.productionId??'',this.designTasks.id,`${env.host}/api/api/xtsjProject/client/submitDesignTask`)
      console.log(txt, 'submitDesignTask');
      if (JSON.parse(txt).errCode===0) {
        this.getDesignTask();
      }
    }catch (error) {
      console.log(`error==>${error}`)
    }
  }
  loadAchievement(refId:string,fileName:string,id:string) {
    try {
      //@ts-ignore
      let txt = jsdesigntool.loadAcheivenmentsFromServer(this.clientId??'',this.productionId??'',this.designTasks.id,id,`${env.host}/api/api/aliyun/download?refId=${refId}&fileName=${fileName}`)
      console.log(txt, 'loadAcheivenmentsFromServer');
    }catch (error) {
      console.log(`error==>${error}`)
    }
  }
  saveAchievement(id:string) {
    if (!this.designing) return
    try {
      //@ts-ignore
      let txt = jsdesigntool.saveDesignAcheivement(this.clientId??'',this.productionId??'',this.designTasks.id,id,`${env.host}/api/api/xtsjProject/client/saveDesignAcheivement`)
      if (JSON.parse(txt).errCode===0) {
        this.getDesignTask();
      }
      console.log(txt, 'saveDesignAcheivement');
    }catch (error) {
      console.log(`error==>${error}`)
    }
  }
  deleteAchievement(id:string) {
    if (!this.designing) return
    try {
      //@ts-ignore
      let txt = jsdesigntool.delDesignAcheivement(this.clientId??'',this.productionId??'',this.designTasks.id,id,`${env.host}/api/api/xtsjProject/client/delDesignAcheivement`)
      console.log(txt, 'delDesignAcheivement');
      if (JSON.parse(txt).errCode===0) {
        this.getDesignTask();
      }
    }catch (error) {
      console.log(`error==>${error}`)
    }
  }
  transformModel(id: string) {
    if (!this.designing) return
    lightDesignAcheivement({
      id: id,
      taskId: this.designTaskId,
      appCode: 'XTSJ',
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.$message.success('转换成功！')
      this.getDesignTask();
    })
  }
  showAnnotation(comment:Comments) {
    const { origin } = location;
    const { href } = this.$router.resolve({
      name: 'Annotation',
      query: {
        id: comment.id,
        title: comment.title,
        comment: comment.comment,
        capturePicUrl: comment.capturePicUrl,
        bimUrl: comment.bimUrl,
        auditor: comment.auditor,
        auditTime: comment.auditTime,
      }
    })
    window.open(`${origin}${href}`,"_blank")
  }

  mounted() {
    //@ts-ignore
    window.getToken = ()=> {
      return localStorage.getItem('token')
    }
    this.themeType = sessionStorage.getItem('themeType') as string
    EventBus.$on('themeType',(themeType)=> {
      this.themeType = themeType;
    })
    this.getDesignTask();
    // for (const designTasksKey in this.designTasks) {
    //   if (exampleData.response.data.task[designTasksKey]) {
    //     this.designTasks[designTasksKey] = exampleData.response.data.task[designTasksKey];
    //     if (designTasksKey==='achievements' && this.designTasks[designTasksKey].length) {
    //       this.designTasks[designTasksKey].map((i)=> {
    //         Object.assign(i, { expand: true })
    //       })
    //     }
    //   }
    // }
    console.log(this.designTasks)
  }
}
</script>

<style scoped lang="less">
@import url('../../../../styles/public.module.less');
@import "./v2-public.less";

.design-task-list {
  padding: @spacing-base;
  img {
    //width: 12px;
    //height: 12px;
    margin-right: @spacing-base;
  }
  .contacts {
    font-weight: bold;
    border-bottom: 1px solid #F0F0F0;
    padding-bottom: @spacing-base;
    margin-right: @spacing-base;
    .name {
      cursor: pointer;
      &:hover {
        color: #0A28A9;
        border-bottom: 1px solid #909399;
      }
    }
    .anticon-contacts {
      color: #2573F1;
      font-size: 18px;
      margin:@spacing-base @spacing-base;
    }
  }
  .btns {
    margin: @spacing-base 0;
    .ant-btn {
      font-weight: bold;
      margin-right: @spacing-base;
    }
  }
  .bg-gray {
    background: #E9E9E9;
  }
  .ant-spin-nested-loading {
    .flex-auto;
    overflow: auto;
    .scrollbar-default;
  }
  .achievements {
    overflow: auto;
    .scrollbar-default;
    >div:first-child {
      margin-top: @spacing-base;
    }
    >div {
      border: 1px solid #90B5FF;
      box-shadow: 0 3px 7px 0 rgba(113,157,246,0.35);
      background: #FFFFFF;
      padding: @spacing-base;
      border-radius: 5px;
      margin-bottom: @spacing-base;
      &:hover {
        border-color: #1890ff;
        box-shadow: none;
      }
      .file-name {
        font-weight: bold;
        color: #333333
      }
      .base-operate {
        border-bottom: 1px solid #F0F0F0;
        padding-bottom: @spacing-base;
        >div {
          margin: @spacing-base @spacing-base @spacing-base 0;
          color: #333333;
          font-size: 12px;
          font-weight: bold;
          &:hover {
            color: #0a55fd;
            cursor: pointer;
            transition: all 0.1s;
            transform: scale(1.1);
          }
        }
      }
      .annotations {
        >div{
          cursor: pointer;
          >.anticon,>span {
            &:hover {
              transition: all 0.1s;
              transform: scale(1.1);
            }
          }
        }
        .expand-anticon {
          transform: rotate(-90deg);
        }
        .not-expand-anticon {
          transform: rotate(90deg);
        }
        .comment {
          transition: all .3s;
          >a {
            display: inline-block;
            border-bottom: 1px solid #5965BB;
            color: #1e5ddd;
            margin-bottom: 1/3 * @spacing-base;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            &:hover {
              font-weight: bold;
            }
          }
        }
      }
    }
    .active-card {
      border-color: #c38b1b  !important;
    }
  }
}
.bpm-container {
  min-width: unset !important;;
}
</style>
