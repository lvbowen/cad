<template>
  <div class="design-task-detail flex flex-column">
    <div class="header flex-center-align">
      <van-icon name="todo-list-o" @click="$router.push('TodoWorks')"/>
      <div>设计任务单</div>
    </div>
    <div class="task-detail">
      <van-collapse v-model="expandCollapse">
        <van-collapse-item title="任务基本信息" name="1">
          <div class="sub-title flex flex-center-align flex-justify-between">
            <div class="flex flex-center-align">
              <div class="line"></div>
              <span class="sub-title-name">专业任务</span>
            </div>
            <div>
              <van-button
                v-if="designTask.checkButton"
                type="info"
                size="small"
                @click="()=> {opinionType='check';showOpinionModal=true;opinion=''}">校审意见</van-button>
              <van-button
                v-if="designTask.rejectButton"
                type="info"
                size="small"
                @click="()=> {showOpinionModal=true;opinionType='reject';opinion=''}">驳回</van-button>
            </div>
          </div>
          <div class="form">
            <div class="flex"><span class="form-label">专业任务名称：</span><span class="form-value">{{ designTask.professionName }}</span></div>
            <div class="flex"><span class="form-label">设计任务名称：</span><span class="form-value">{{ designTask.professionTaskName }}</span></div>
          </div>
          <div class="sub-title flex flex-center-align">
            <div class="line"></div>
            <span class="sub-title-name">审核设定</span>
          </div>
          <div class="form">
            <div class="flex">
              <span class="form-label">是否需要校审：</span>
              <span class="form-value">
                <a-radio-group v-model="designTask.designFlag" :options="radioOptions"></a-radio-group>
              </span>
            </div>
            <div class="flex">
              <span class="form-label">校审级别：</span>
              <span class="form-value">
                <a-radio-group v-model="designTask.proofreadLevel" :options="levelOptions"></a-radio-group>
              </span>
            </div>
            <div class="flex">
              <span class="form-label">是否需要会签：</span>
              <span class="form-value">
                <a-radio-group v-model="designTask.countersignFlag" :options="radioOptions"></a-radio-group>
              </span>
            </div>
            <div class="flex">
              <span class="form-label">项目经理审核：</span>
              <span class="form-value">
                <a-radio-group v-model="designTask.projectManagerAudit" :options="radioOptions"></a-radio-group>
              </span>
            </div>
          </div>
          <div class="sub-title flex flex-center-align">
            <div class="line"></div>
            <span class="sub-title-name">任务安排</span>
          </div>
          <div class="form">
            <div class="flex flex-center-align">
              <div class="flex flex-auto"><span class="form-label">设计人：</span><span class="form-value">{{ designTask.designerName }}</span></div>
              <div class="flex flex-auto"><span class="form-label">设计指导：</span><span class="form-value">{{ designTask.designGuiderName }}</span></div>
            </div>
            <div class="flex flex-center-align">
              <div class="flex flex-auto"><span class="form-label">校核人：</span><span class="form-value">{{ designTask.auditorName }}</span></div>
              <div class="flex flex-auto"><span class="form-label">审核人：</span><span class="form-value">{{ designTask.checkerName }}</span></div>
            </div>
            <div class="flex flex-center-align flex-wrap">
              <div class="flex flex-auto nowrap"><span class="form-label">任务下达时间：</span><span class="form-value">{{ designTask.taskTime }}</span></div>
              <div class="flex flex-auto nowrap"><span class="form-label">任务开始时间：</span><span class="form-value">{{ designTask.planStartTime }}</span></div>
            </div>
            <div class="flex flex-center-align flex-wrap">
              <div class="flex flex-auto nowrap"><span class="form-label">任务结束时间：</span><span class="form-value">{{ designTask.planEndTime }}</span></div>
              <div class="flex flex-auto"><span class="form-label">计划工期：</span><span class="form-value">{{ designTask.planDuration }}</span></div>
            </div>
            <div class="flex"><span class="form-label">工作内容及要求：</span><span class="form-value">{{ designTask.workContent }}</span></div>
          </div>
        </van-collapse-item>
        <van-collapse-item title="任务设计成果" name="2">
          <div
            v-for="attachment in designTask.attachmentList"
            :key="attachment.id"
            :class="currentAttachmentId===attachment.id?'active-attachment':''"
            class="flex flex-justify-between flex-center-align attachment"
            @click="getAnnotations(attachment.id)">
            <div class="flex flex-center-align">
              <img src="../../../src/assets/extends/file.png" alt="">
              <span>{{ attachment.name }}</span>
            </div>
            <div v-if="attachment.fileSize">{{ attachment.fileSize }}MB</div>
          </div>
        </van-collapse-item>
        <van-collapse-item title="模型检查批注" name="3">
          <van-swipe-cell v-for="a in annotation.annotationList" :key="a.id">
            <div class="flex p-list flex-center-align" @click.stop="toPage(a.id)" :class="currentAnnotationId===a.id?'active-attachment':''">
              <img :src="a.thumbnail?a.thumbnail:a.pictureAnnotations.length?a.pictureAnnotations[0].downloadUrl:''" alt="" v-if="a.thumbnail || a.pictureAnnotations.length">
              <div class="flex flex-justify-between flex-auto">
                <div>
                  <div class="p-title flex flex-center-align line-clamp">{{ a.annotationDesc }}</div>
                  <div>{{ a.fileName }}<span class="instance-name">{{ a.instanceName }}</span></div>
                </div>
                <div>
                  {{ a.createdTime }}
                </div>
              </div>
            </div>
            <template #right>
              <van-button type="danger" @click.stop="deleteAnnotation(a.id)">删除</van-button>
            </template>
          </van-swipe-cell>
        </van-collapse-item>
      </van-collapse>
    </div>
    <span class="add-annotation" @click="toAddAnnotationPage" v-if="designTask.attachmentList.length && designTask.checkButton"><div>添加</div>批注</span>
    <van-dialog
      v-model="showOpinionModal"
      :title="opinionType==='check'?'校审意见':'驳回意见'"
      :showCancelButton="true"
      @confirm="()=> opinionType==='check'?submitDesignTask():opinionType==='reject'?rejectDesignTask():''">
      <van-field
        v-model="opinion"
        type="textarea"
        :placeholder="opinionType==='check'?'请输入校审意见':'请输入驳回意见'"
        maxlength="600"
        :autosize="true"
        clearable
        showWordLimit></van-field>
    </van-dialog>
  </div>
</template>

<script lang='ts'>
import {Vue, Component, Prop, InjectReactive} from 'vue-property-decorator';
import {utils} from "@cloudpivot/common";
import { Collapse,CollapseItem,SwipeCell,Button,Dialog,Field,Toast,Icon } from "vant";
import {exampleData} from "../appMaterialManage/mock";
import {AnnotationList, Attachment, DesignTaskInfo} from "../../type";
import Radio from "ant-design-vue/lib/radio";
import "ant-design-vue/lib/radio/style/index.css";
import {listApi} from "@cloudpivot/api";
import { getDesignTaskInfoByH5,getAnnotationListByDesignFileH5,deleteAnnotation,submitDesignTaskWorkflowH5,rejectDesignTaskWorkflowH5} from "../../service/api";
import * as FormCommentIns from "@cloudpivot/api";

@Component({
  name: 'DesignTaskDetail',
  components: {
    VanCollapse: Collapse,
    VanCollapseItem: CollapseItem,
    VanSwipeCell: SwipeCell,
    VanButton: Button,
    ARadioGroup: Radio.Group,
    [Dialog.Component.name]: Dialog.Component,
    VanField: Field,
    VanIcon: Icon
  }
})
export default class DesignTaskDetail extends Vue {
  @Prop() sjrwdId!: string;
  @InjectReactive('project') appCode?: string;
  userId: string = '';
  expandCollapse: string[] = ['1','2','3'];
  designTask: DesignTaskInfo = {
    id: '',
    professionName: '',
    designFlag: '',
    proofreadLevel: '',
    countersignFlag: '',
    projectManagerAudit: '',
    designer: '',
    designerName: '',
    designGuider: '',
    designGuiderName: '',
    auditor: '',
    auditorName: '',
    checker: '',
    checkerName: '',
    taskTime: '',
    planStartTime: '',
    planEndTime: '',
    planDuration: '',
    workContent: '',
    attachmentList: [],
    modelType: '',
    checkButton: false,
    rejectButton: false,
    workflowInstanceId: '',
    professionTaskName: ''
  };
  resetDesignTask() {
    this.designTask = {
      id: '',
      professionName: '',
      designFlag: '',
      proofreadLevel: '',
      countersignFlag: '',
      projectManagerAudit: '',
      designer: '',
      designerName: '',
      designGuider: '',
      designGuiderName: '',
      auditor: '',
      auditorName: '',
      checker: '',
      checkerName: '',
      taskTime: '',
      planStartTime: '',
      planEndTime: '',
      planDuration: '',
      workContent: '',
      attachmentList: [],
      modelType: '',
      checkButton: false,
      rejectButton: false,
      workflowInstanceId: '',
      professionTaskName: ''
    };
  }
  getDesignTaskDetails() {
    this.resetDesignTask();
    getDesignTaskInfoByH5({
      //@ts-ignore
      id: this.sjrwdId || this.$route.query.sjrwdId,//8c204e822124462a90130157913fbdc8
      personId: this.userId,
      appCode: this.appCode??''
    }).then((res)=> {
      if(res.errcode!==0) return Toast.fail(res.errmsg as string)
      if(!res.data) return;
      // eslint-disable-next-line no-shadow
      const data = res.data;
      for (const designTaskKey in this.designTask) {
        if (data[designTaskKey]) {
          this.designTask[designTaskKey] = data[designTaskKey]
        }
      }
      this.getCheckLevel();
      if (this.designTask.attachmentList.length) {
        this.currentAttachmentId = !this.currentAttachmentId?this.designTask.attachmentList[0].id:this.currentAttachmentId;
        this.getAnnotations(this.currentAttachmentId);
      }
    })
    // const data = exampleData.data.designTask;
    // for (const designTaskKey in this.designTask) {
    //   if (data[designTaskKey]) {
    //     this.designTask[designTaskKey] = data[designTaskKey]
    //   }
    // }
    // if (this.designTask.attachmentList.length) {
    //   this.currentAttachmentId = !this.currentAttachmentId?this.designTask.attachmentList[0].id:this.currentAttachmentId;
    //   this.getAnnotations(this.currentAttachmentId);
    // }
  }
  radioOptions: {label:string;value:string;disabled:boolean}[] = [
    {
      label: '需要',
      value: "需要",
      disabled: true
    },
    {
      label: '不需要',
      value: '不需要',
      disabled: true
    }
  ];
  levelOptions: {label:string;value:string;disabled:boolean}[] = [];
  getCheckLevel() {
    listApi.listSkipQueryList({
      "mobile": false,
      "page": 0,
      "queryCode": "XTSJ_checkLevel",
      "schemaCode": "XTSJ_checkLevel",
      "filters": [
        {
          "op": "Eq",
          "propertyCode": "modelType",
          "propertyType": 0,
          "propertyValue": this.designTask.modelType
        }
      ],
      "size": 999
    }).then((res)=> {
      if(res.errcode!==0) return Toast.fail(res.errmsg as string)
      if(!res.data) return;
      this.levelOptions = res.data.content.map((i)=> {
        return {
          label: i.data.level,
          value: i.data.level,
          disabled: true
        }
      })
      console.log(this.levelOptions)
    })
  }
  annotation: AnnotationList = {
    id: '',
    annotationList: []
  };
  currentAttachmentId: string = '';
  currentAnnotationId: string = '';
  getAnnotations(id:string) {
    this.currentAttachmentId = id;
    this.annotation.id = '';
    this.annotation.annotationList = [];
    // this.annotation = exampleData.data.annotation;
    getAnnotationListByDesignFileH5({
      id: this.designTask.id,
      designFileId: id,
      personId: this.userId,
      appCode: this.appCode??''
    }).then((res)=> {
      if(res.errcode!==0) return Toast.fail(res.errmsg as string)
      if(!res.data) return;
      for (const annotationKey in this.annotation) {
        if (res.data[annotationKey]) {
          this.annotation[annotationKey] = res.data[annotationKey]
        }
      }
    })
  }
  deleteAnnotation(id:string) {
    if (!this.designTask.checkButton) return Toast.fail('无删除权限！')
    Dialog.alert({
      message: '确认删除吗？删除后不可恢复哦',
      showCancelButton: true
    }).then(()=> {
      deleteAnnotation({
        id: id,
        personId: this.userId,
        appCode: this.appCode??''
      }).then((res)=> {
        if(res.errcode!==0) return Toast.fail(res.errmsg as string)
        if(!res.data) return;
        Toast.success('删除成功！');
        this.getAnnotations(this.currentAttachmentId)
      })
    })
  }
  toPage(id: string) {
    this.$router.push({
      name: 'Annotation',
      query: {
        id: id,
        currentAttachmentId: this.currentAttachmentId,
        sjrwdId: this.sjrwdId || this.$route.query.sjrwdId,
        currentAnnotationId: id
      }
    })
  }
  toAddAnnotationPage() {
    this.$router.push({
      name: 'AddAnnotation',
      query: {
        currentAttachmentId: this.currentAttachmentId,
        sjrwdId: this.designTask.id
      }
    })
  }
  opinionType: 'check'|'reject' = 'check';
  showOpinionModal: boolean = false;
  opinion: string = '';

  submitDesignTask() {
    submitDesignTaskWorkflowH5({
      sjrwdId: this.sjrwdId,
      desc: this.opinion,
      appCode: this.appCode??''
    }).then((res)=> {
      if(res.errcode!==0) return Toast.fail(res.errmsg as string)
      if(!res.data) return;
      Toast.success('保存成功！')
      this.getDesignTaskDetails();
    })
  }
  rejectDesignTask() {
    rejectDesignTaskWorkflowH5({
      id: this.sjrwdId,
      appCode: this.appCode??'',
      comment: this.opinion,
      workflowInstanceId: this.designTask.workflowInstanceId
    }).then((res)=> {
      if(res.errcode!==0) return Toast.fail(res.errmsg as string)
      if(!res.data) return;
      Toast.success('驳回成功！')
      this.getDesignTaskDetails();
    })
  }
  created() {
    const user:any = sessionStorage.getItem('user')
    if (user) {
      this.userId = JSON.parse(user).id
    }
    console.log(this.userId,'11')
  }
  mounted() {
    this.currentAttachmentId = this.$route.query.currentAttachmentId as string;
    this.currentAnnotationId = this.$route.query.currentAnnotationId as string;
    FormCommentIns.FormCommentApi.getUserInfo().then((res:any) => {
      if (res.errcode === 0) {
        sessionStorage.setItem("user", JSON.stringify(res.data));
      }
    });
    this.getDesignTaskDetails();
    console.log(this.designTask,'1')
    utils.Bus.$emit('toggleNavbar',false)
  }
}
</script>

<style lang='less' scoped>
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
@import './designTask.public.less';
.design-task-detail{
  text-align: left;
  height: inherit;
  background: @base-bg;
  @base-bg: #EBECF0;
  overflow: hidden;
  position: relative;
  .task-detail {
    overflow: auto;
    .px2rem(padding-bottom,@spacing-base);
    /deep/ .van-collapse {
      .van-cell {
        background: @base-bg;
        color: #6D6D6D;
        .px2rem(font-size, 26);
        font-weight: bold;
        opacity: 0.9;
      }
      .van-collapse-item__wrapper {
        margin: 0 16px;
        background: #FFFFFF;
        border: 1px solid #D0D1D5;
        box-shadow: 0 4px 8px 0 rgba(153,153,153,0.1);
        border-radius: 6px;
        .van-collapse-item__content {
          .px2rem(padding-top,@spacing-base);
          .px2rem(padding-bottom,@spacing-base);
          .px2rem(padding-left,@spacing-base);
          .px2rem(padding-right,@spacing-base);
          .active-attachment {
            .p-title {
              color: #FFFFFF !important;
            }
            background-color: rgba(41,112,255,0.9) !important;
            color: #FFFFFF !important;
          }
          .attachment {
            border: 2px solid #F3F3F3;
            border-radius: 8px;
            .px2rem(margin-bottom,1/2 * @spacing-base);
            .px2rem(padding-right,1/2 * @spacing-base);
            >div {
              >img {
                .px2rem(margin-right,@spacing-base);
                transform: scale(0.8);
              }
            }
          }
          .p-list {
            //.px2rem(margin-left,@spacing-base);
            .px2rem(margin-bottom,@spacing-base);
            background: rgba(220,240,254,0.49);
            border-radius: 6px;
            .px2rem(padding,3/4 * @spacing-base);
            >img {
              .px2rem(margin-right,@spacing-base);
              .px2rem(width,50);
              .px2rem(heigt,50);
            }
            >div {
              align-items: end;
              .p-title {
                color: #000000;
                .px2rem(font-size,@spacing-medium);
              }
              .instance-name {
                white-space: nowrap;
                border-radius: 4px;
                background: linear-gradient(-32deg, #FE3C33, #FC6F6B);
                color: white;
                .px2rem(font-size,@spacing-base);
                .px2rem(margin-left,3/4 * @spacing-base);
                .px2rem(padding-left,1/4 * @spacing-base);
                .px2rem(padding-right,1/4 * @spacing-base)
              }
            }
          }
          .van-swipe-cell {
            .van-button {
              .full-height
            }
          }
        }
      }
    }
  }
  .add-annotation {
    position: fixed;
    .px2rem(right,4 * @spacing-base);
    .px2rem(bottom,5 * @spacing-large);
    .px2rem(padding,@spacing-base);
    .px2rem(padding-left,@spacing-base+1/3 * @spacing-base);
    .px2rem(padding-right,@spacing-base+1/3 * @spacing-base);
    border: 2px solid #FFFFFF;
    border-radius: 50%;
    color: white;
    background: linear-gradient(-37deg, rgba(188,0,0,0.55), rgba(252,102,98,0.95));
    box-shadow: 1px 10px 20px 0 rgba(254,81,74,0.5);
    >div {
      .px2rem(margin-bottom,1/3 * @spacing-base)
    }
  }
}
</style>
