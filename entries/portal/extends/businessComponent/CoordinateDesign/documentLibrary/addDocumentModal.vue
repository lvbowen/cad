<template>
  <a-modal
    :visible="showModal"
    :dialogStyle="{top:`${modalTop}px`,left:`${modalLeft}px`}"
    @ok="onModalOk"
    :destroyOnClose="true"
    class="add-document-modal"
    @cancel="onModalCancel">
    <template slot="title">
      {{ modalTitle }}
      <vue-drag-resize
        :w="vw"
        :h="vh"
        :x="left"
        :y="top"
        :key="dragKey"
        @dragstop="dragstopHandle"
        :isResizable="false">
      </vue-drag-resize>
    </template>
    <div class="title">基础信息</div>
    <div class="flex flex-center-align item" :class="isClickOk && !inputState.fileName?'required-text':''">
      <span class="doc-label required">文档名称：</span>
      <a-input v-model="fileName"></a-input>
    </div>
    <!--    <div>-->
    <!--      <div class="flex item flex-center-align" v-for="(item,index) in addConditionConfig" :key="index">-->
    <!--        <span class="doc-label required">{{ item.text }}：</span>-->
    <!--        <base-select-->
    <!--          @changeValue="(val)=>handleChange(val,item)"-->
    <!--          :options="item.options"-->
    <!--          :value="item.selected"/>-->
    <!--      </div>-->
    <!--    </div>-->
    <div class="flex">
      <div class="flex item flex-center-align" :class="isClickOk && !inputState.modelType?'required-text':''">
        <span class="doc-label required">工作类型：</span>
        <base-select
          :showSearch="(addConditionConfig.find((i)=> {return i.field==='fileTypes'})).showSearch"
          :options="(addConditionConfig.find((i)=> {return i.field==='fileTypes'})).options"
          :value="(addConditionConfig.find((i)=> {return i.field==='fileTypes'})).selected"
          @changeValue="(val)=>handleChange(val,addConditionConfig.find((i)=> {return i.field==='fileTypes'}))"/>
      </div>
      <div class="flex item flex-center-align" :class="isClickOk && !inputState.bussiness?'required-text':''">
        <span class="doc-label required">工程分类：</span>
        <base-select
          :showSearch="(addConditionConfig.find((i)=> {return i.field==='bussinesses'})).showSearch"
          :options="(addConditionConfig.find((i)=> {return i.field==='bussinesses'})).options"
          :value="(addConditionConfig.find((i)=> {return i.field==='bussinesses'})).selected"
          @changeValue="(val)=>handleChange(val,addConditionConfig.find((i)=> {return i.field==='bussinesses'}))"/>
      </div>
    </div>
    <div class="flex">
      <div class="flex item flex-center-align" :class="isClickOk && !inputState.projectType?'required-text':''">
        <span class="doc-label required">工程类型：</span>
        <base-select
          :showSearch="(addConditionConfig.find((i)=> {return i.field==='projectTypes'})).showSearch"
          :disabled="!(addConditionConfig.find((i)=> {return i.field==='projectTypes'})).disabled?false:(addConditionConfig.find((i)=> {return i.field==='projectTypes'})).disabled"
          :options="(addConditionConfig.find((i)=> {return i.field==='projectTypes'})).options"
          :value="(addConditionConfig.find((i)=> {return i.field==='projectTypes'})).selected"
          @changeValue="(val)=>handleChange(val,addConditionConfig.find((i)=> {return i.field==='projectTypes'}))"/>
      </div>
      <div class="flex item flex-center-align" :class="isClickOk && !inputState.projectState?'required-text':''">
        <span class="doc-label required">工程阶段：</span>
        <base-select
          :showSearch="(addConditionConfig.find((i)=> {return i.field==='projectStates'})).showSearch"
          :options="(addConditionConfig.find((i)=> {return i.field==='projectStates'})).options"
          :value="(addConditionConfig.find((i)=> {return i.field==='projectStates'})).selected"
          @changeValue="(val)=>handleChange(val,addConditionConfig.find((i)=> {return i.field==='projectStates'}))"/>
      </div>
    </div>
    <div class="flex">
      <div class="flex item flex-end-align" :class="isClickOk && !inputState.professionType?'required-text':''">
        <span class="doc-label" :class="['专业提纲','设计任务'].includes((addConditionConfig.find((i)=> {return i.field==='fileTypes'})).selected)?'required':'pro'">专业类别：</span>
        <base-select
          :showSearch="(addConditionConfig.find((i)=> {return i.field==='professionTypes'})).showSearch"
          :options="(addConditionConfig.find((i)=> {return i.field==='professionTypes'})).options"
          :value="(addConditionConfig.find((i)=> {return i.field==='professionTypes'})).selected"
          @changeValue="(val)=>handleChange(val,addConditionConfig.find((i)=> {return i.field==='professionTypes'}))"/>
      </div>
    </div>
    <div class="title">文档上传</div>
    <div class="flex flex-center-align" @mouseleave="showCloseCircle=false">
      <span class="doc-label required">附件上传</span>
      <a-button type="primary" size="small" @click="uploadIcon" :loading="uploading">上传</a-button>
      <span class="required-text-upload" v-show="isClickOk && !inputState.refId">必填</span>
      <span
        class="current-file"
        @click="getDownloadUrl(refId)"
        @mouseenter="showCloseCircle=true">{{ uploadFileName }}</span>
      <a-icon type="close-circle" v-show="showCloseCircle" @click="clearUploadFile"/>
    </div>
    <input
      class="file-input"
      ref="fileInput"
      :key="fileKey"
      type="file"
      @change="(e) => fileUpload(e)"
    />
  </a-modal>
</template>

<script lang="ts">
import {Vue, Component, Prop, Watch, InjectReactive} from 'vue-property-decorator';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Form from 'ant-design-vue/lib/form';
import 'ant-design-vue/lib/form/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import {DefineTypes} from "../../../type";
import BaseSelect from "../../deviceManagement/BaseSelect.vue";
import VueDragResize from 'vue-drag-resize';
import {addIcon} from "../../../service/api";
import { yunFileUpload,addAchievementModel,uploadContentFile } from "../../../service/CoordinateDesign/documentLibrary";

@Component({
  name: 'AddDocumentModal',
  components: {
    AModal: Modal,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    AForm: Form,
    AButton: Button,
    AFormItem: Form.Item,
    BaseSelect,
    AIcon: Icon,
    VueDragResize
  }
})
export default class AddDocumentModal extends Vue {
  @InjectReactive("project") projectCode?: string;
  @Prop() entrance!: string;
  @Prop() modalTitle!: string;
  @Prop() showModal!:boolean;
  @Watch('showModal',{ immediate: true})
  showModalListener(val){
    if(val) {
      this.addConditionConfig = JSON.parse(JSON.stringify(this.conditionConfig));
      console.log(this.addConditionConfig,'111')
    }
  }
  @Prop() conditionConfig?: DefineTypes[];
  addConditionConfig: DefineTypes[] = [];
  fileName: string = '';
  //TODO 弹窗拖拽
  modalTop: number = 100;
  modalLeft: number = 0;
  vw: number = 520;
  vh: number = 470;
  top: number = 0;
  left: number = 0;
  dragKey: number = 1;
  preModalTop: number = 100;
  preModalLeft: number = 0;
  dragstopHandle(e:ClientRect){
    this.modalLeft = e.left + this.preModalLeft;
    this.modalTop = e.top + this.preModalTop;
    this.preModalLeft = this.modalLeft;
    this.preModalTop = this.modalTop;
    this.top = 0;
    this.left = 0;
    this.dragKey++
  }
  //必填-非必填状态
  isClickOk: boolean = false;
  inputState:{fileName:boolean;modelType:boolean;bussiness:boolean;projectType:boolean;projectState:boolean;professionType:boolean;refId:boolean} = {
    fileName: false,
    modelType: false,
    bussiness: false,
    projectType: false,
    projectState: false,
    professionType: true, //是否必填：true:必填并且已填  false:必填并且未填
    refId: false
  }
  onModalOk() {
    this.isClickOk = true;
    let pass: boolean = false;
    this.inputRequired();
    console.log(this.inputState)
    pass = this.inputState.fileName && this.inputState.modelType && this.inputState.bussiness&& this.inputState.projectType && this.inputState.projectState && this.inputState.professionType && (this.refId.trim()!=='')
    if(pass) {
      const api = this.entrance==='document'?addAchievementModel:uploadContentFile;
      const params = {
        appCode: this.projectCode??'',
        fileName: this.fileName,
        bussiness: (this.addConditionConfig.find((i)=> {return i.field==='bussinesses'}))?.selected??'',
        projectType: (this.addConditionConfig.find((i)=> {return i.field==='projectTypes'}))?.selected??'',
        professionType: (this.addConditionConfig.find((i)=> {return i.field==='professionTypes'}))?.selected??'',
        projectState: (this.addConditionConfig.find((i)=> {return i.field==='projectStates'}))?.selected??'',
        refId: this.refId
      }
      if(this.entrance==='document') {
        Object.assign(params,{
          avaliable: true,
          modelType: (this.addConditionConfig.find((i)=> {return i.field==='fileTypes'}))?.selected??''
        })
      }else if(this.entrance==='source') {
        Object.assign(params,{
          fileType: (this.addConditionConfig.find((i)=> {return i.field==='fileTypes'}))?.selected??''
        })
      }
      //@ts-ignore
      api(params).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg as string)
        if(!res.data) return;
        this.$message.success(this.entrance==='document'?'新增文档模板成功！':'新增素材文件成功！');
        this.onModalCancel();
        this.$emit('refreshDocumentList')
      })
    }
  }
  onModalCancel() {
    this.$emit('closeModal')
  }
  handleChange(val:string,item:DefineTypes) {
    this.addConditionConfig.map((i) => {
      if(i.field === item.field) {
        i.selected = val;
      }
    })
    //处理工程分类和工程类型的级联关系
    if (item.field==='bussinesses'){
      const types = this.addConditionConfig.filter((i)=> i.field==='projectTypes')
      if (types.length) {
        if (!val){
          types[0].disabled = true;
          types[0].selected = '';
        }else {
          types[0].disabled = false;
          types[0].selected = '';
          // @ts-ignore
          this.conditionConfig.map((c)=> {
            if (c.field==='projectTypes') {
              //@ts-ignore
              const options = c.options.filter(( o)=> o.name===val)
              types[0].options = JSON.parse(JSON.stringify(options[0].value))
            }
          })
        }
      }
    }
    this.inputRequired();
  }
  inputRequired() {
    for (const inputStateKey in this.inputState) {
      if (inputStateKey==='professionType') {
        this.inputState[inputStateKey] = true
      }else {
        this.inputState[inputStateKey] = false
      }
    }
    this.inputState.fileName = this.fileName.trim()!=='';
    this.inputState.refId = this.refId!=='';
    this.addConditionConfig.map((item) => {
      if(item.field==='fileTypes'&&item.selected) {
        this.inputState.modelType = true
        if(['专业提纲','设计任务'].includes(item.selected)) {
          this.inputState.professionType = false
        }else {
          this.inputState.professionType = true
        }
      }else if(item.field==='bussinesses'&&item.selected){
        this.inputState.bussiness = true
      }else if(item.field==='projectTypes'&&item.selected){
        this.inputState.projectType = true
      }else if(item.field==='projectStates'&&item.selected){
        this.inputState.projectState = true
      }
      if(!this.inputState.professionType){
        if(item.field==='professionTypes'&&item.selected) {
          this.inputState.professionType = true
        }
      }
    })
  }
  //file
  fileKey: number = 1;
  refId: string = '';
  uploadFileName: string = '';
  showCloseCircle: boolean = false;
  uploading: boolean = false;
  uploadIcon() {
    const { $refs } = this;
    if ($refs.fileInput) {
      ($refs.fileInput as HTMLInputElement).click();
    }
  }
  fileUpload(e) {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const fileFormat = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      if (["doc","docx"].indexOf(fileFormat) === -1)
        return this.$message.error("只能上传*.doc/*.docx的文件!");
      // if (file.size > 1024 * 20) return this.$message.error("文件大小不能超过XXX20 kb!");
      // const allIconsNames = this.allIcons.map((item) => item.name);
      // if (allIconsNames.includes(file.name)) return this.$message.error("已有重名文件!");
      const formData = new FormData();
      formData.append("file", file);
      this.uploading = true;
      yunFileUpload(formData).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success("文件上传成功");
        console.log(res.data)
        this.refId = res.data.refId;
        this.inputState.refId = true;
        this.uploadFileName = res.data.name;
      }).finally(()=> {
        this.uploading = false;
        this.fileKey++;
      });
    }
  }
  getDownloadUrl(refId: string) {
    let url = `${window.config.apiHost}/api/aliyun/download?refId=${refId}`;
    const token = window.localStorage.getItem("token")
    if (token) {
      url += "&access_token=" + token;
    }
    window.open(url);
  }
  clearUploadFile() {
    this.refId  = '';
    this.uploadFileName = '';
    this.inputState.refId = false;
    this.showCloseCircle = false;
    this.$message.success('删除成功！')
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
.add-document-modal {
  /deep/ .ant-modal {
    //margin: 0;
  }
  /deep/ .ant-modal-title {
    font-weight: bold;
  }
  /deep/ .ant-modal-body {
    padding:0 @spacing-large @spacing-large @spacing-large;
    .title {
      font-weight: bold;
      font-size: 15px;
      padding-left: @spacing-base;
      border-left: 3px solid #0E90FE;
      margin: @spacing-medium 0;
      color: #000000bf;
    }
    .pro {
      &:before {
        content:'*';
        color: white;
      }
    }
    .required {
      &::before {
        content: '*';
        color: red;
      }
    }
    .doc-label {
      width: 85px;
      display: inline-block;
      white-space: nowrap;
      font-weight: bold;
    }
    .ant-select {
      width: 120px;
      margin-right: @spacing-base;
    }
    .item {
      margin-bottom: @spacing-base;
      margin-right: @spacing-large;
    }
    .required-text {
      .ant-select-selection {
        border: 1px solid red;
      }
      .ant-input {
        border: 1px solid red;
      }
    }
    .required-text-upload {
      color: red;
      white-space: nowrap;
      margin-left: 1/4 * @spacing-base;
    }
    .current-file {
      margin-left: @spacing-base;
      margin-right: @spacing-base;
      color: #0E90FE;
      cursor: pointer;
    }
  }
  .file-input {
    display: none;
  }
}
</style>
