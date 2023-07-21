<template>
  <div class="model-attribute full-height flex">
    <model-code-tree class="left" @setCodeValue="setCodeValue"/>
    <a-card title="模型属性" class="right flex flex-column" :loading="attributeLoading">
      <a-menu v-model="currentStage" mode="horizontal" @click="changeCurrentStage">
        <a-menu-item v-for="item in topBimCards" :key="item.id" :disabled="selectedCodeValue===''">
          {{ item.buttonName }}
        </a-menu-item>
      </a-menu>
      <a-menu v-model="currentStage" mode="horizontal" @click="changeCurrentSubStage">
        <a-menu-item v-for="item in subBimCards" :key="item.id" :disabled="selectedCodeValue===''">
          {{ item.buttonName }}
        </a-menu-item>
      </a-menu>
      <a slot="extra" @click="editAttribute" v-show="!isEditing && attributeList.length">编辑</a>
      <a slot="extra" @click="saveAttribute" v-show="isEditing">保存</a>
      <a slot="extra" @click="cancelAttribute" v-show="isEditing">取消</a>
      <div class="title" v-show="attributeList.length">属性信息</div>
      <div
        v-for="(item,index) in attributeList"
        :key="index"
        @mouseenter="currentArrIndex=index"
        @mouseleave="currentArrIndex=null"
        class="att-info flex flex-center-align">
        <span class="label">{{ item.propertyName }}</span>
        <span class="value" v-show="!isEditing && item.propertyType!=='附件'">{{ item.propertyContent }}</span>
        <div v-if="!isEditing && item.propertyType==='附件'">
          <div
            v-for="(file,fileKey) in item.attachments"
            :key="fileKey"
            class="fj"
            @mouseenter="isExitHover=true;currentIndex=fileKey"
            @mouseleave="isExitHover=false;currentIndex=null">
            <a @click="downLoadFile(file.refId)">{{ file.name }}</a>
            <img v-show="isExitHover && currentArrIndex===index && currentIndex===fileKey && file.mimeType.indexOf('image')>-1" :src="file.base64ImageStr" alt="" >
          </div>
        </div>
        <a-input v-show="isEditing && item.propertyType!=='附件'" v-model="item.propertyContent" @change="(val)=> changeValue(val)"></a-input>
        <template v-if="isEditing && item.propertyType==='附件'">
          <a-upload
            :fileList="attributeList[index].resetAttachments"
            :multiple="true"
            :remove="(file)=> handleRemove(file,item.id)"
            :beforeUpload="(file)=> beforeUpload(file,item.id)">
            <a-button> <a-icon type="upload" />选择文件</a-button>
          </a-upload>
        </template>
      </div>
      <div class="model-imgs flex flex-space-between" v-show="selectedCodeValue!==''">
        <div class="title">模型图片</div>
        <a-button
          type="primary"
          v-show="!showUploadModelPics"
          @click="showUploadModelPics=true"
          size="small">修改</a-button>
        <div v-show="showUploadModelPics">
          <a-button
            type="primary"
            @click="updateModelImgs"
            size="small">保存</a-button>
          <a-button
            type="primary"
            @click="getModelImg"
            size="small">取消</a-button>
        </div>
      </div>
      <a-upload
        v-show="showUploadModelPics"
        :fileList="modelFilesList"
        :beforeUpload="beforeUploadImgs"
        :remove="removeModelImgs"
        :multiple="true"
      >
        <a-button> <a-icon type="upload" />选择文件</a-button>
      </a-upload>
      <template v-show="modelImgs.attachments && modelImgs.attachments.length && !showUploadModelPics">
        <a-carousel autoplay>
          <div class="pic" v-for="(item,index) in this.modelImgs.attachments" :key="index">
            <img :src="item.base64ImageStr" alt="">
          </div>
        </a-carousel>
      </template>
    </a-card>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
//@ts-ignore
import ModelCodeTree from "./ModelCodeTree.tsx";
import Card from 'ant-design-vue/lib/card';
import 'ant-design-vue/lib/card/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Carousel from 'ant-design-vue/lib/carousel';
import 'ant-design-vue/lib/carousel/style/index.css';
import Menu from 'ant-design-vue/lib/menu';
import 'ant-design-vue/lib/menu/style/index.css';
import Upload from 'ant-design-vue/lib/upload';
import 'ant-design-vue/lib/upload/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import { getModelProperty,updateModelProperty,getModelImg,getTopBimCard,getSubBimCard,uploadFile, updateModelPictures} from "../../service/classLibrary";
import {
  ProjectConfig,
  ClassLibraryModelProperty,
  ModelImgs,
  BaseOptionType,
  BimCardMenu, ModelPropertyAttachment
} from "../../type";
import {getFormUrl} from "../../service/api";
import onActionClick
  from "../../../../../modules/@cloudpivot/list/src/components/pc/scripts/onActionClick";
import {baseConfig} from "./config";
import env from "@/config/env";

@Component({
  name: 'ModelAttribute',
  components: {
    ModelCodeTree,
    ACard: Card,
    AInput: Input,
    AButton: Button,
    ACarousel: Carousel,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AUpload: Upload,
    AIcon: Icon
  }
})
export default class ModelAttribute extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?:ProjectConfig
  currentStage: string[] = [];
  topBimCards: BimCardMenu[] = [];
  subBimCards: BimCardMenu[] = [];
  isEditing: boolean = false;
  selectedCodeValue: string = '';
  selectedCodeName: string = '';
  attributeList: ClassLibraryModelProperty[] =[];
  cacheAttributeList: ClassLibraryModelProperty[] =[];
  //imgs
  showUploadModelPics: boolean = false;
  // uploadUrl: string = `http://10.20.90.212/api/api/deliveryLibrary/modelPictures`;
  modelFilesList: any[] =[];
  modelImgs:ModelImgs = {
    id: '',
    codeName: '',
    codeValue: '',
    projectName: '',
    // schemaCode: '',
    attachments: []
  };
  // isExistRef: boolean = false;
  attributeLoading: boolean = false;
  //附件上传
  fileList: any = [];
  uploading:boolean = false;
  isExitHover: boolean = false;
  currentIndex: number | null = null;
  currentArrIndex: number | null = null;

  handleRemove(file,id:string) {
    // console.log(file,'file')
    // const index = this.fileList.indexOf(file);
    // const newFileList = this.fileList.slice();
    // newFileList.splice(index, 1);
    // this.fileList = newFileList;
    //删除
    this.attributeList.map((att) => {
      if(att.id === id) {
        att.attachments = att.attachments.filter((item)=> {
          return item.name!==file.name
        })
        //@ts-ignore
        att.resetAttachments = att.resetAttachments.filter((i)=> {
          return i.name !== file.name
        })
      }
    })
    // console.log(this.attributeList,'move')
  }
  beforeUpload(file,id:string) {
    // this.fileList = [...this.fileList, file];
    this.attributeList.map((item) => {
      if(item.id === id) {
        item.resetAttachments = [...item?.resetAttachments??[],file]
      }
    })
    const formData = new FormData();
    formData.append( `file`, file );
    this.uploadFile(formData,id)
    // console.log(this.fileList,'fileList',id,'id')
    return false;
  }
  uploadFile(formData,id:string) {
    uploadFile(formData).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.attributeList.map((item) => {
        if(item.id === id) {
          item.attachments.push(res.data)
        }
      })
    })
    // console.log(this.attributeList,'attributeList')
  }
  downLoadFile(id:string) {
    const downloadUrl = `${env.apiHost}/api/aliyun/download?refId=` + id;
    window.open(downloadUrl);
  }
  changeCurrentStage({keyPath}:{keyPath:string[]}) {
    this.currentStage = keyPath;
    this.getModelProperty();
    this.getModelImg();
    // this.isExistRef = true;
    this.getSubBimCards();
  }

  changeCurrentSubStage({keyPath}:{keyPath:string[]}) {
    this.currentStage = keyPath;
    this.getModelProperty();
    this.getModelImg();
    // this.isExistRef = true;
  }

  initParams() {
    this.selectedCodeValue = '';
    this.selectedCodeName = '';
    this.attributeList = [];
    this.subBimCards = [];
    this.isEditing = false;
    // this.isExistRef = false;
    // this.attributeLoading = true;
    this.modelImgs = {
      id: '',
      codeName: '',
      codeValue: '',
      projectName: '',
      // schemaCode: '',
      attachments: []
    }
  }

  getModelProperty() {
    this.attributeList = [];
    this.isEditing = false;
    // this.isExistRef = false;
    this.attributeLoading = true;
    getModelProperty({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      codeValue: this.selectedCodeValue,
      codeName: this.selectedCodeName,
      propertyStageId: this.currentStage[0]
    }).then((res)=> {
      this.attributeLoading = false;
      if(res.errcode===1000) return this.$message.warning(res.errmsg as string)
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      const data = res.data;
      this.reset(data,'attachments')
      // console.log(data,'data')
      this.attributeList = JSON.parse(JSON.stringify(data??[]));
      // for (let i = 0; i < 5; i++) {
      //   this.attributeList = this.attributeList.concat(this.attributeList)
      // }
      this.cacheAttributeList = JSON.parse(JSON.stringify(data??[]));
      // this.isExistRef = true;
      // console.log(this.fileList,'fileList')
    })
  }

  reset(data:ClassLibraryModelProperty[],key:string,) {
    data.map((item) => {
      if(item.propertyType === '附件') {
        if(Array.isArray(item[key]) && item[key].length) {
          Object.assign(item,{ resetAttachments: item[key].map((file)=> {
              return {
                name: file.name,
                url: file.base64ImageStr,
                uid: file.id,
                status: 'done',
                linkProps: '{"download": "image"}'
              }
            })})
          this.fileList.push(item.resetAttachments)
        }else {
          item.attachments = [];
          Object.assign(item,{resetAttachments:[]})
        }
      }
    })
  }
  //模型图片
  getModelImg() {
    this.modelFilesList = [];
    this.showUploadModelPics = false;
    this.modelImgs = {
      id: '',
      codeName: '',
      codeValue: '',
      projectName: '',
      // schemaCode: '',
      attachments: []
    }
    getModelImg({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      codeValue: this.selectedCodeValue,
      codeName: this.selectedCodeName,
      propertyStageId: this.currentStage[0]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      for (const modelImgsKey in this.modelImgs) {
        this.modelImgs[modelImgsKey] = res.data[modelImgsKey]
      }
      this.modelFilesList = this.modelImgs.attachments.map((file)=> {
        return {
          name: file.name,
          url: file.base64ImageStr,
          uid: file.id,
          status: 'done',
          linkProps: '{"download": "image"}'
        }
      })
    })
  }
  beforeUploadImgs(file) {
    this.modelFilesList.push(file)
    const formData =  new FormData();
    formData.append('file',file);
    this.uploadFileModel(formData);
    return false;
  }
  uploadFileModel(formData) {
    uploadFile(formData).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.modelImgs.attachments.push(res.data)
    })
  }
  removeModelImgs(file) {
    this.modelFilesList = this.modelFilesList.filter((i)=> {
      return i.name!==file.name
    })
    this.modelImgs.attachments = this.modelImgs.attachments.filter((i)=> {
      return i.name!==file.name
    })
  }
  updateModelImgs() {
    updateModelPictures({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      updateModelPics: this.modelImgs
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.$message.success('修改成功')
      this.getModelImg();
    })
  }

  editAttribute() {
    this.isEditing = true;
    this.attributeList = JSON.parse(JSON.stringify(this.cacheAttributeList))
  }
  changeValue(val:string) {

  }
  saveAttribute() {
    // console.log(this.attributeList,'保存')
    updateModelProperty({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      updateContents: [...this.attributeList]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.$message.success('保存成功！')
      this.getModelProperty()
    })
  }
  cancelAttribute() {
    this.isEditing = false;
    this.attributeList = JSON.parse(JSON.stringify(this.cacheAttributeList))
  }
  setCodeValue({codeValue,codeName,hasChild}:{codeValue:string,codeName:string,hasChild:boolean}) {
    if(hasChild) return this.initParams();
    this.selectedCodeValue = codeValue;
    this.selectedCodeName = codeName;
    if(!this.topBimCards.length) return;
    this.currentStage = [this.topBimCards[0].id];
    this.getModelProperty();
    this.getModelImg();
    this.getSubBimCards();
  }
  getTopBimCard() {
    getTopBimCard({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      this.topBimCards = res.data
    })
  }
  getSubBimCards() {
    this.subBimCards = [];
    getSubBimCard({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      fatherTabId: this.currentStage[0]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      this.subBimCards = res.data
    })
  }
  mounted() {
    this.getTopBimCard();
    // this.topBimCards = baseConfig.stageOptions as BaseOptionType[]
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
.model-attribute {
  /deep/ .ant-menu-item-selected {
    background: transparent !important;
  }
  .left {
    width: 65%;
  }
  .right {
    margin-left: @spacing-large;
    width: calc(35% - @spacing-large);
    /deep/ .ant-card-head {
      height: 42px;
      min-height: auto;
      .ant-card-head-wrapper {
        .full-height;
        .ant-card-extra {
          padding: 0;
        }
      }
    }
    /deep/ .ant-card-body {
      flex: 1;
      overflow: auto;
    }
    a {
      margin-right: @spacing-base;
    }
    .title {
      margin-bottom: @spacing-large;
      font-weight: bold;
      margin-top: @spacing-large;
    }
    .att-info {
      margin-bottom: @spacing-medium;
      .label {
        color: #000000  !important;
        width: 120px;
      }
      .value {

      }
      .ant-input {
        width: 200px;
      }
      .fj {
        position: relative;
        img {
          width: 50px;
          height: 50px;
          position: absolute;
          left: 40px;
          top: -25px;
        }
      }
    }
    .model-imgs {
      margin-top: 2 * @spacing-large;
      .ant-btn {
        margin-left: @spacing-large;
      }
    }
    img {
      width: 100%;
      height: 330px;
    }
  }
}
</style>
