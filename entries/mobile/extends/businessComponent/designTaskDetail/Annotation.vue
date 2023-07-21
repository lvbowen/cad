<template>
  <div class="annotation flex flex-column">
    <div class="header flex-center-align">
      <van-icon name="arrow-left" @click="goBack"/>
      <div>查看批注</div>
    </div>
    <div class="details">
      <div class="sub-title flex flex-center-align">
        <div class="line"></div>
        <span class="sub-title-name">基本信息</span>
      </div>
      <div class="form">
        <div class="flex"><span class="form-label">成果名称：</span><span class="form-value">{{ annotation.fileName }}</span></div>
        <div class="flex"><span class="form-label">文件类型：</span><span class="form-value">{{ annotation.fileType }}</span></div>
        <div class="flex"><span class="form-label">流程节点：</span><span class="form-value">{{ annotation.instanceName }}</span></div>
        <!--        <div class="flex"><span class="form-label">批注标题：</span><span class="form-value">{{ annotation.annotationName }}</span></div>-->
        <div class="flex"><span class="form-label">检查人：</span><span class="form-value">{{ annotation.checkerName }}</span></div>
        <div class="flex"><span class="form-label">检查时间：</span><span class="form-value">{{ annotation.checkTime }}</span></div>
        <div class="flex"><span class="form-label">批注说明：</span><span class="form-value">{{ annotation.annotationDesc }}</span></div>
      </div>
      <div class="sub-title flex flex-center-align">
        <div class="line"></div>
        <span class="sub-title-name">附件信息</span>
      </div>
      <div class="form">
        <template v-if="annotation.thumbnail">
          <img :src="annotation.thumbnail" alt="" @click="previewImg(0)">
        </template>
        <div
          v-else
          v-for="(a,index) in annotation.pictureAnnotations"
          :key="a.refId"
          class="img-list">
          <img
            :src="a.downloadUrl"
            alt=""
            @click="previewImg(index)">
          <van-icon name="down" @click.stop="downloadImg(a.downloadUrl)"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {Vue, Component, Prop, InjectReactive} from 'vue-property-decorator';
import { getAnnotationByAnnotationIdH5 } from "../../service/api";
import { AnnotationDetails } from "../../type";
import {utils} from "@cloudpivot/common";
import {Icon, ImagePreview, Toast} from "vant";
import {exampleData} from "../appMaterialManage/mock";
@Component({
  name: 'Annotation',
  components: {
    VanIcon: Icon,
    [ImagePreview.Component.name]: ImagePreview.Component,
  }
})
export default class Annotation extends Vue {
  @InjectReactive('project') appCode?: string;
  annotation:AnnotationDetails = {
    id: '',
    createdTime: '',
    instanceName: '',
    annotationName: '',
    annotationDesc: '',
    thumbnail: '',
    fileName: '',
    fileType: '',
    checker: '',
    checkerName: '',
    checkTime: '',
    pictureAnnotations: []
  }
  goBack() {
    this.$router.push({
      name: 'DesignTaskDetail',
      query: {
        sjrwdId: this.$route.query.sjrwdId,
        currentAnnotationId:  this.$route.query.currentAnnotationId
      }
    })
  }
  getAnnotationByAnnotationIdH5() {
    // for (const annotationKey in this.annotation) {
    //   if (exampleData.data.annotationDetails[annotationKey]) {
    //     this.annotation[annotationKey] = exampleData.data.annotationDetails[annotationKey]
    //   }
    // }
    getAnnotationByAnnotationIdH5({
      //@ts-ignore
      annotationId: this.$route.query?.id??'',
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
  previewImg(index:number) {
    ImagePreview({
      images: this.annotation.pictureAnnotations.map((i)=> i.downloadUrl),
      startPosition: index
    })
  }
  downloadImg(url:string) {
    window.open(url, "_blank")
  }
  mounted() {
    utils.Bus.$emit('toggleNavbar',false)
    this.getAnnotationByAnnotationIdH5();
  }
}
</script>

<style lang='less' scoped>
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
@import './designTask.public.less';
.annotation{
  text-align: left;
  height: inherit;
  >.details {
    font-size: 14px;
    overflow: auto;
    .px2rem(padding,@spacing-base);
    .form {
      >div {
        line-height: 1.5;
      }
      img {
        .px2rem(widht,200);
        .px2rem(height,200);
        .px2rem(margin-right,@spacing-base);
        .px2rem(margin-bottom,@spacing-base)
      }
      .img-list {
        display: inline-block;
        position: relative;
        align-items: end;
        .van-icon {
          position: absolute;
          .px2rem(right,@spacing-base);
          .px2rem(bottom,@spacing-base);
          color: rgba(0, 0, 0, 0.65);
        }
      }
    }
  }
}
</style>
