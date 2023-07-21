<template>
  <div class="add-annotation flex flex-column">
    <div class="header flex-center-align">
      <van-icon name="arrow-left" @click="goBack"/>
      <div>增加批注</div>
    </div>
    <div class="content">
      <!--      <van-field-->
      <!--        v-model="annotationName"-->
      <!--        label="批注标题"-->
      <!--        required-->
      <!--        clearable-->
      <!--        :error="!annotationName.trim().length"-->
      <!--        :errorMessage="!annotationName.trim().length?'请输入批注标题':''"-->
      <!--      />-->
      <van-field
        v-model="annotationDesc"
        label="批注说明"
        required
        :autosize="true"
        :error="!annotationDesc.trim().length"
        :errorMessage="!annotationDesc.trim().length?'请输入批注说明':''"
        type="textarea"
        maxlength="800"
        clearable
        showWordLimit/>
      <div class="upload-img">
        上传图片
      </div>
      <van-uploader
        :multiple="true"
        :afterRead="afterRead"
        @delete="deleteFile"
        v-model="files"
        capture="camera"
        accept="image/*"/>
      <van-button type="info" @click="submit">提交</van-button>
    </div>
  </div>
</template>

<script lang='ts'>
import {Vue, Component, Prop, InjectReactive,Watch} from 'vue-property-decorator';
import {Icon,ImagePreview,Field,Uploader,Toast,Button} from "vant";
import {utils} from "@cloudpivot/common";
import { yunFileUpload,saveAnnotationH5 } from "../../service/api";
import { YunAttachmentFile } from '../../type'
@Component({
  name: 'AddAnnotation',
  components: {
    VanIcon: Icon,
    [ImagePreview.Component.name]: ImagePreview.Component,
    VanField: Field,
    VanUploader: Uploader,
    VanButton: Button
  }
})
export default class AddAnnotation extends Vue {
  @InjectReactive('project') appCode?: string;
  annotationName: string = '';
  annotationDesc: string = '';
  // files: YunAttachmentFile[] = [];
  files: any[] = [];
  fileList: any[] =[];
  androidAttrs: boolean = true;
  afterRead(file) {
    console.log(file,'111')
    if (Array.isArray(file)) {
      for (let i = 0; i < file.length; i++) {
        const formData = new FormData();
        file[i].status = 'uploading';
        file[i].message = '上传中...';
        formData.append("file", file[i].file);
        formData.append("appCode", this.appCode??'');
        yunFileUpload(formData).then((res) => {
          if (res.errcode !== 0) return Toast.fail(res.errmsg as string);
          Toast('文件上传成功')
          this.fileList.push({
            url: res.data.base64ImageStr,
            isImage: true,
            refId: res.data.refId,
            name: res.data.name,
            mimeType: res.data.mimeType,
            fileSize: res.data.fileSize
          })
        })
      }
    }else {
      file.status = 'uploading';
      file.message = '上传中...';
      const formData = new FormData();
      formData.append("file", file.file);
      formData.append("appCode", this.appCode??'');
      yunFileUpload(formData).then((res) => {
        if (res.errcode !== 0) return Toast.fail(res.errmsg as string);
        Toast('文件上传成功')
        this.fileList.push({
          url: res.data.base64ImageStr,
          isImage: true,
          refId: res.data.refId,
          name: res.data.name,
          mimeType: res.data.mimeType,
          fileSize: res.data.fileSize
        })
      })
    }
  }
  deleteFile(file) {
    this.fileList =this.fileList.filter((item)=> {
      return item.refId!==file.refId
    })
  }
  @Watch('fileList',{ deep: true})
  fileListListener() {
    this.files = JSON.parse(JSON.stringify(this.fileList))
  }
  submit() {
    if (!this.annotationDesc.trim()) return Toast.fail('批注说明必填！')
    if (!this.fileList.length) return Toast.fail('至少上传一张图片！')
    saveAnnotationH5({
      //@ts-ignore
      id: this.$route.query?.currentAttachmentId??'',
      //@ts-ignore
      sjrwdId: this.$route.query?.sjrwdId??'',
      personId: this.userId,
      annotationName: this.annotationName,
      annotationDesc: this.annotationDesc,
      attachmentList: this.fileList,
      appCode: this.appCode??''
    }).then((res)=> {
      if(res.errcode!==0) return Toast.fail(res.errmsg as string)
      if(!res.data) return;
      Toast.success('保存成功！')
      this.goBack()// 之后换记住状态
    })
  }
  userId: string = '';
  goBack() {
    this.$router.push({
      name: 'DesignTaskDetail',
      query: {
        sjrwdId: this.$route.query.sjrwdId,
        currentAttachmentId: this.$route.query?.currentAttachmentId??'',
      }
    })
  }
  mounted() {
    const user:any = sessionStorage.getItem('user')
    if (user) {
      this.userId = JSON.parse(user).id
    }
    utils.Bus.$emit('toggleNavbar', false)
    // const model=navigator.userAgent;
    // // 判断是否是安卓手机，是则是true
    // this.androidAttrs=model.indexOf('Android') > -1 || model.indexOf('Linux') >-1
  }
}
</script>

<style lang='less' scoped>
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
@import './designTask.public.less';
.add-annotation{
  font-size: 14px;
  color: #646566;
  text-align: left;
  height: inherit;
  background-color: white;
  font-weight: bold;
  .content {
    overflow: auto;
    .px2rem(padding-bottom,@spacing-medium);
    >.upload-img {
      padding: 10px 16px;
      &:before {
        position: absolute;
        left: 8px;
        color: #ee0a24;
        font-size: 14px;
        content: '*';
      }
    }
    .van-uploader {
      .px2rem(padding,@spacing-base);
    }
    .van-button {
      display: block;
      width: 100%;
      border-radius: 12px;
      box-shadow: 0px 4px 8px 0px rgba(68,141,241,0.5);
    }
  }
}
</style>
