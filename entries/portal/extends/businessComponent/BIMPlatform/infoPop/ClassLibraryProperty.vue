<template>
  <div class="class-library-property">
    <div class="table_title" @click="closeModalProTable">
      <p class="table_p">
        <img
          v-show="showModelPropertyTable"
          style="cursor: pointer"
          :src="icon_arr1"
        />
        <img v-show="!showModelPropertyTable" :src="icon_arr1" class="table_img_close"/>{{ modelPropertyTitle }}
      </p>
    </div>
    <a-table
      v-show="showModelPropertyTable"
      class="devOps_table"
      :loading="propertyLoading"
      :pagination="false"
      :columns="modelPropertyColumns"
      :data-source="modelPropertyData"
      :customRow="rowMouseenter"
    >
      <template slot="propertyContent" slot-scope="text, record, index">
        <div v-if="record.propertyType==='附件'">
          <a-upload
            v-if="editable"
            :multiple="true"
            :remove="(file)=>removeFile(file,index)"
            :beforeUpload="beforeUpload"
            :customRequest="(file)=>customRequest(file,index)"
            :defaultFileList="getDefaultFileList(cacheData[index].attachments)">
            <a-button type="link"> <a-icon type="upload" />上传附件</a-button>
          </a-upload>
          <div v-else>
            <div v-if="Array.isArray(record.attachments) && record.attachments.length">
              <div
                v-for="(file,fileKey) in record.attachments"
                :key="fileKey"
                class="fj"
                @mouseenter="isExitHover=true;currentIndex=fileKey"
                @mouseleave="isExitHover=false;currentIndex=null">
                <a @click="downLoadFile(file.refId)">{{ file.name }}</a>
                <img v-show="isExitHover && currentArrIndex===index && currentIndex===fileKey && file.mimeType.indexOf('image')>-1" :src="file.base64ImageStr" alt="" >
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <a-input
            v-if="editable"
            class="inputStyle"
            size="small"
            style="width:205px"
            v-model="cacheData[index].propertyContent"/>
          <span tabindex = "-1" v-else>{{ record.propertyContent }}</span>
        </div>
      </template>
      <div v-if="editable" slot="footer">
        <a-button type="link" @click="saveChange">保存</a-button>
        <a-button type="link" @click="cancelChange">取消</a-button>
      </div>
    </a-table>
  </div>
</template>

<script lang="ts">
import {Vue, Component,Prop,Watch,InjectReactive} from 'vue-property-decorator';
import icon_arr1 from '../../../../src/assets/extends/bim/infoPop/icon_arr1.png'
import {TableColumn} from "../../../type";
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import env from "@/config/env";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Upload from 'ant-design-vue/lib/upload';
import 'ant-design-vue/lib/upload/style/index.css';
import {ProjectConfig,} from "../../../type";
import { updateModelProperty,uploadFile} from "../../../service/classLibrary";
@Component({
  name: 'ClassLibraryProperty',
  components: {
    ATable: Table,
    [Input.name]:Input,
    [Button.name]:Button,
    [Icon.name]:Icon,
    [Upload.name]:Upload,
  }
})
export default class ClassLibraryProperty extends Vue {
  @InjectReactive('project') appCode!: string;
  @InjectReactive('projectConfig') projectConfig?:ProjectConfig
  @Prop() modelPropertyData!:{name:string;msg:string}[];
  @Prop() modelPropertyTitle!: string;
  @Prop() modelPropertyColumns!:TableColumn<any>[];
  @Prop() propertyLoading!: boolean;
  @Prop() showModelPropertyTable!: boolean;
   @Prop({required:false,default:false}) enableEdit!:boolean
  icon_arr1: any = icon_arr1;
  isExitHover: boolean = false;
  currentArrIndex: number | null = null;
  currentIndex: number | null = null;
  editable:boolean=false;
  cacheData:any[]=[];

  closeModalProTable() {
    this.$emit('closeModalProTable')
  }
  downLoadFile(id:string) {
    const downloadUrl = `${env.apiHost}/api/aliyun/download?refId=` + id;
    window.open(downloadUrl);
  }
  rowMouseenter(record, index) {
    return {
      on: {
        mouseenter: (e) => {
          this.currentArrIndex = index;
        },
        mouseleave: () => {
          this.currentArrIndex = null;
        },
        dblclick :()=>{
          this.enableEdit&&(this.editable=true);
        },
      }
    }
  };

  getDefaultFileList(record){
    return record.map(item=>{
      return{
        name:item.name,
        url:item.base64ImageStr,
        uid:item.refId,
        status: 'done',
        linkProps: '{"download": "image"}'
      }
    })
  }

  beforeUpload(file:File, fileList:File[]){
    const isLt = file.size / 1024 / 1024 < 500
    if (!isLt) {
        this.$message.error('Image must smaller than 500MB!');
    }
    return isLt;
  }

  async customRequest(file,index:number){
    const formData=new FormData();
    formData.append("file",file.file);
    try {
      const {errcode,errmsg,data}=await uploadFile(formData);
      if(errcode!==0){
        this.$message.error(`上传文件失败,${errmsg}`)
        file.onError(data,file);
        return;
      }
      this.cacheData[index].attachments.push(data);
      file.onSuccess(data,file);
    } catch (error) {
      this.$message.error(`上传文件异常,${error}`)
      file.onError(error,file);
    }
  }

  removeFile(file:File,index:number){
    //@ts-ignore
    this.cacheData[index].attachments=this.cacheData[index].attachments.filter(item=>item.refId!==file.uid)
  }

  cancelChange(){
    this.cacheData=this.modelPropertyData.map(item=>({...item}));
    this.editable=false;
  }

  saveChange(){
    updateModelProperty({
      appCode: this.appCode,
      projectName: this.projectConfig?.projectName??"",
      updateContents: [...this.cacheData]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.editable=false;
      this.$message.success('保存成功！')
      this.$emit("updateModelProperty");
    })
    }

  @Watch("modelPropertyData",{deep:true})
  modelPropertyDataChange(newVal,oldVal){
    if(newVal===oldVal)return;
    this.cacheData=this.modelPropertyData.map(item=>({...item}));
    this.editable=false;
  }
}
</script>

<style scoped lang="less">
@import './infoPop.public.less';
.class-library-property {
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
  .inputStyle{
    color: #fff;
    border-color: #2c72d1;
    background-color: transparent;
    text-align: center;
  }
  /deep/.ant-table-footer{
    background-color: transparent;
    padding: 8px;
    border: unset;
    text-align: center;
    &::before{
      height: 0;
    }
  }
  /deep/.anticon-paper-clip{
    color: #2c72d1;
  }
  /deep/.ant-upload-list-item-name{
    padding-left: unset;
    margin-top: unset;
    color: #2c72d1;
  }
  /deep/.ant-upload-list-item-card-actions{
    opacity: 1;
    right: 4px;
    .anticon-delete{
      color: red;
    }
  }

}
</style>
