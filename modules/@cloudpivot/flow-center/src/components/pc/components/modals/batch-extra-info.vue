<template>
  <a-modal
    v-model="showModal"
    :title="$t('cloudpivot.flowCenter.pc.batchHandleFlow')"
    :width="552"
    :cancelText="$t('languages.common.cancel')"
    :okText="$t('cloudpivot.flowCenter.pc.batchApprove')"
    @ok="batchSubmit"
    @cancel="cancel"
    :destroyOnClose="true"
    :maskClosable="false"
    :keyboard="false"
  >
    <a-row type="flex">
      <a-col :span="4">{{ $t("cloudpivot.flowCenter.pc.approveSuggestion") }}:</a-col>
      <a-col :span="19">
        <a-textarea placeholder="请输入审批意见" :rows="4" v-model="remark"/>
      </a-col>
    </a-row>
    <a-row type="flex" class="row2">
      <a-col :span="4"></a-col>
      <a-col :span="19">
        <a-upload
          :multiple="true"
          :fileList="fileList"
          :headers="header"
          :accept="accept"
          :action="uploadUrl"
          @change="handleFileChange"
        >
          <a-button>
            <a-icon type="upload"/>{{ $t('cloudpivot.form.renderer.tip.clickAndDropUpload') }}
          </a-button>
          <div class="tips" @click="preventFileUpload">{{ $t("cloudpivot.flowCenter.pc.onlySupportMobileWrite") }}</div>
        </a-upload>
      </a-col>
    </a-row>
  </a-modal>  
</template>

<script lang="ts">

import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Modal,Input,Row, Col,Upload,Icon,Button} from "@h3/antd-vue";
import "@/config/h3-form";
import { renderer } from '@cloudpivot/form';
//import ApproveOpinion from "@cloudpivot/form/src/renderer/components/pc/approve-opinion.vue";
@Component({
  name: "BatchInfo",
  components: {
    AModal: Modal,
    ATextarea: Input.TextArea,
    ARow: Row,
    ACol: Col,
    AIcon: Icon,
    AButton:Button,
    AUpload: Upload,
  },
})
export default class BatchInfo extends Vue {
  @Prop() value!: any;

  @Prop() data!: any;

  showModal:boolean = false;
  remark:string = '';
 
  fileList:any =  [];// 已上传的文件信息列表
  userInfo: any = {};
  image_types:string[] = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".tif"];
  doc_types:string[] = [".docx", ".xlsx", ".pptx", ".doc", ".xls", ".ppt", ".wpt", ".dot", ".rtf", ".txt", ".xml", ".pdf"];

  batchSubmit(){
    let postFileList = [] as any;
    this.fileList.forEach((item: any)=>{
      postFileList.push(item.response && item.response.data)
    })
    this.showModal = false;
    this.$emit('batchHandle',{remark: this.remark,resources: postFileList});
    this.resetData();
  }
  get uploadUrl(){
    return  renderer.UploadControl.service.getUploadUrl();
  }
  get accept(){
    const { image_types, doc_types } = this;
    return  image_types.concat(doc_types).join(',')
  }

  handleFileChange(info){
    console.log('info--->',info);
    //debugger;
    let fileList = [...info.fileList];
    //fileList = fileList.slice(-2);
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    this.fileList = fileList;
  }
  preventFileUpload(event){
    event.preventDefault();
    event.stopPropagation();

  }
  handleValueChange(value : any){
    // if(this.uploading){
    //   this.uploading = false;
    //   return;
    // }
    // if (value && value.resources) {
    //   this.fileList = value.resources.map((x: any) => this.map(x));
    // }
  }
  get header() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`
    };
  }
  resetData(){
    this.remark = '';
    this.fileList = [];
  }
  cancel(){
    this.resetData();
    this.$emit('input',false)
  }
  @Watch('value')
  valueChange(val){
    this.showModal = val;
  }
}
</script>

<style lang="less" scoped>
 .row2{
   margin-top:20px;
 }
 .tips{
   font-size:14px;
   color:rgba(0,0,0,0.45);
   margin-top:8px;
 }
</style>
