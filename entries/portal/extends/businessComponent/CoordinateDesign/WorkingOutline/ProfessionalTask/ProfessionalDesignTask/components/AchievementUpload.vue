<template>
  <div>
    <div class="achievementWrap">
      <div class="uploaderWarap floatLeft" v-if="showCreateChapter">
        <a-tooltip :visible="showTooltip" @mouseenter="()=> {!!achievementFileList[0]?showTooltip=true:showTooltip=false}" @mouseleave="showTooltip=false">
          <template slot="title">
            <span class="error">{{ `注意：将会覆盖成果${activeAchievement}哦(历史批注将会保留)，请确认！` }}</span>
          </template>
          <a-upload-dragger
            :disabled="achievementUploadeLoading"
            :action="achievementUploadeAction"
            :headers="achievementUploadeHeaders"
            :showUploadList="false"
            :beforeUpload="achievementUploadBeforeUpload"
            @change="achievementUploadHandleChange"
            name="file"
            :multiple="false">
            <p class="ant-upload-drag-icon">
              <a-icon v-if="!achievementUploadeLoading" type="cloud-upload"/>
              <a-icon v-else type="loading"/>
            </p>
            <p class="ant-upload-text">
              点击或将文件拖拽到这里上传
            </p>
            <p class="ant-upload-hint">
              支持文件格式: doc,docx,pdf,dwg,rvt,nwd等等
            </p>
          </a-upload-dragger>
        </a-tooltip>
      </div>
      <div
        v-if="achievementFileList&&achievementFileList.length>0"
        class="spaceLine"></div>
      <div class="uploadFiles flex">
        <div>
          <div class="flex">
            <h4 v-if="achievementFileList&&achievementFileList.length>0">共计上传<em
              class="uploadFileCount">{{ achievementFileList.length }}</em>个附件</h4>
          </div>
          <ul class="uploadFileList flex flex-space-between file-list">
            <div>
              <li
                @click="newClickFile(item.fileName,item.lightweightUrl,item.previewUrl,item.refId)"
                v-for="(item,index) in this.achievementFileList"
                :key="index"
                class="uploadFile flex flex-center-align flex-space-between">
                <div>
                  <a-icon
                    class="fileIcon"
                    :type="getIconType(item.fileType)"
                    theme="twoTone"
                    :twoToneColor="getIconColor(item.fileType)"/>
                  <a-tooltip>
                    <template slot="title">
                      <span>{{ item.fileName }}</span>
                    </template>
                    <span :class="!item.schemaCode && showTransferModal(item.fileName)?'':'fileName'">{{
                      item.fileName
                    }}</span>
                  </a-tooltip>
                  <span class="fileName" v-if="!item.schemaCode && showTransferModal(item.fileName)">
                    <span v-if="item.status">（</span><span
                      :style="{color:item.status==='成功'?'#32b683':item.status==='转换中'?'#ffba00':'red'}">{{
                      item.status
                    }}</span><span v-if="item.status">）</span>
                  </span>
                </div>
                <div class="flex flex-center-align">
                  <span class="fileSize" v-if="item.filesize">{{ formatFileSize(item.filesize) }}</span>
                  <span class="splitLine"></span>
                  <a-tooltip
                    title="文档编辑"
                    v-if="item.fileName.indexOf('.docx')>-1 && isEditOutlineWork">
                    <a-icon
                      class="actionIcon"
                      type="form"
                      @click.stop="editFile(item.refId,index,item)"/>
                  </a-tooltip>
                  <a-tooltip title="下载">
                    <a-icon
                      class="actionIcon download"
                      type="download"
                      @click.stop="downloadFile(item)"/>
                  </a-tooltip>
                  <!--                  <a-icon-->
                  <!--                    v-if="showCreateChapter"-->
                  <!--                    @click.stop="removeFile(item)"-->
                  <!--                    class="actionIcon delete"-->
                  <!--                    type="delete"/>-->
                  <a-popconfirm title="确认删除吗？删除后无法恢复哦！" @confirm.stop="deleteFile(item.id)">
                    <a-tooltip title="删除">
                      <a-icon
                        @click.stop="()=> {}"
                        v-if="showCreateChapter"
                        class="actionIcon delete"
                        type="delete"/>
                    </a-tooltip>
                  </a-popconfirm>
                  <a-tooltip title="轻量化转换" v-if="!item.schemaCode && showTransferModal(item.fileName)">
                    <a-icon
                      type="line-height"
                      :spin="transSpin && transformingIndex===index"
                      @click.stop="getTransferModel(item,index)"
                      class="transfer"></a-icon>
                  </a-tooltip>
                  <a-tooltip title="建模数量查看" v-if="!item.schemaCode && showTransferModal(item.fileName)">
                    <a-icon
                      type="ordered-list"
                      @click.stop="workLoadClick(item)"
                      class="sync"></a-icon>
                  </a-tooltip>
                  <a-tooltip title="刷新" v-if="!item.schemaCode && showTransferModal(item.fileName)">
                    <a-icon
                      v-if="item.status!=='成功'"
                      type="sync"
                      @click.stop="newSyncClick(item.refId)"
                      class="sync"
                      :spin="item.spinFlag"/>
                  </a-tooltip>
                </div>
              </li>
            </div>
          </ul>
        </div>
        <div v-if="mergeAttachment && mergeAttachment.refId">
          <h4 class="total-title">汇总成果</h4>
          <div class="uploadFile total-file">
            <a-icon
              class="fileIcon"
              :type="getIconType(mergeAttachment.mimeType)"
              theme="twoTone"
              :twoToneColor="getIconColor(mergeAttachment.mimeType)"/>
            <a-tooltip>
              <template slot="title">
                <span>{{ mergeAttachment.name }}</span>
              </template>
              <span @click="fileClick(mergeAttachment)" class="fileName">{{
                mergeAttachment.name
              }}</span>
            </a-tooltip>
            <span class="splitLine"></span>
            <a-icon
              title="下载"
              class="actionIcon download"
              type="download"
              @click.stop="downloadFile(mergeAttachment)"/>
          </div>
        </div>
      </div>
    </div>
    <chapter-list
      v-if="showChapter"
      :projectId="projectId"
      @createDesignSpecificationSubTask="createDesignSpecificationSubTask"
      :showCreateChapter="showCreateChapter"
      :formDataChapter="formDataChapter"
      @upBindPerson="upBindPerson"
      :sjrwdId="sjrwdId"/>
    <edit-work-outline-panel
      :showEditWorkOutlinePanel="showEditWorkOutlinePanel"
      :editorUrl="selectDesignFile.editorUrl"
      :modalTitle="modalTitle"
      :okText="okText"
      @saveEditFile="saveEditFile"
      :showExtendButton="showExtendButton"
      :extendBtnText="extendBtnText"
      @extendFn="extendFn"
      :defaultFileType="selectDesignFile.fileType"
      :defaultBussiness="selectDesignFile.bussiness"
      :defaultProjectType="selectDesignFile.projectType"
      :defaultProjectState="selectDesignFile.projectState"
      :defaultProfessionType="selectDesignFile.professionType"
      @closeEditWorkOutlinePanel="closeEditWorkOutlinePanel"
    />
    <a-modal
      :title="'建模数量查看'"
      :visible="workLoad"
      :footer="null"
      :width="300"
      @cancel="handleCancel"
      class="table-height-auto"
    >
      <a-table :columns="workNumColumns" :data-source="workloadData"></a-table>
    </a-modal>
    <!--    <input-->
    <!--      class="file-input"-->
    <!--      ref="fileInput"-->
    <!--      type="file"-->
    <!--      accept="xlsx,xls"-->
    <!--    />-->
  </div>
</template>

<script lang="ts">
import {Component, Vue, Prop, InjectReactive} from 'vue-property-decorator';
import Icon from "ant-design-vue/lib/icon";
import "ant-design-vue/lib/icon/style";
import Upload from "ant-design-vue/lib/upload";
import "ant-design-vue/lib/upload/style";
import Tooltip from "ant-design-vue/lib/tooltip";
import "ant-design-vue/lib/tooltip/style";
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table';
import env from '@/config/env';
import {
  AchievementFile,
  TableColumn,
  WorkOutlineModel,
  YunAttachmentFile
} from "../../../../../../type";
import { getDecryptFile } from "../../../../../../service/CoordinateDesign/base";
import {
  designAchievement,
  getModelTrans,
  getTransferModel,
  createOnlineWebFile,
  saveOnlineWebFile, delOnlineWebFile
} from "../../../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignTask";
import ChapterList from "../ChapterList.vue";
import EditWorkOutlinePanel from "../../../ProjectPlanning/components/EditWorkOutlinePanel.vue";
import {Modal} from "@h3/antd-vue";
import "ant-design-vue/lib/modal/style";
import { getNewDesignAchievements,uploadDesignFile,deleteDesignFile,getNewModelTransGeneral } from "../../../../../../service/CoordinateDesign/WorkingOutline/DesignAchievement";
import {isArray} from "xe-utils";
import {transferModelGeneral} from "../../../../../../service/CoordinateDesign/WorkingOutline/ProjectPlanning";
@Component({
  name: "AchievementUpload",
  components: {
    [Icon.name]: Icon,
    [Upload.Dragger.name]: Upload.Dragger,
    [Tooltip.name]: Tooltip,
    [Modal.name]: Modal,
    ChapterList,
    EditWorkOutlinePanel,
    APopconfirm: Popconfirm,
    ATable: Table
  }
})
export default class AchievementUpload extends Vue {
  @InjectReactive("project") appCode!: string;
  @Prop({required: true}) sjrwdId!: string;
  @Prop({required: true}) version!: number;
  @Prop({required: true}) personId!: string;
  @Prop({required: true}) workflowInstanceId!: string;
  @Prop() formDataChapter!: any[];
  @Prop() showCreateChapter!: boolean;
  @Prop() showChapter!: boolean;
  @Prop() projectId!: string;
  @Prop() formmatConfig!: string;
  @Prop() activeKey!:number;
  @Prop() activeAchievement!:string;
  @Prop() isEditOutlineWork!: boolean;
  achievementUploadeLoading = false;
  achievementUploadeAction = `${env.apiHost}/api/aliyun/upload`;
  achievementUploadeHeaders = {Authorization: 'Bearer ' + localStorage.token};
  achievementFileList: AchievementFile[] = [];
  mergeAttachment: YunAttachmentFile | null = null;
  sequenceStatus = "";

  workLoad: boolean = false;
  workloadData: Array<any> = [];
  workNumColumns: TableColumn<any>[] = [
    {
      title: '专业-建模人',
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: '数量',
      key: 'amount',
      dataIndex: 'amount'
    }
  ]

  handleCancel() {
    this.workLoad = false;
  }

  workLoadClick(item) {
    if (!item.workload) return this.$message.warning('暂无数据')
    this.workLoad = true;
    this.workloadData = item.workload;
  }

  sjrwdIdtrans: string = '';
  curAchievementId: string = '';

  async getDesignAchievement() {
    this.curAchievementId = '';
    try {
      const {errcode, errmsg, data} = await designAchievement({
        appCode: this.appCode,
        sjrwdId: this.sjrwdId,
        version: this.version
      });
      if (errcode) {
        return this.$message.error(`获取第${this.version}版任务设计成果失败,${errmsg}`);
      }
      if (data?.attachment ?? [].length > 0) {
        data?.attachment.map(item => item['spinFlag'] = false)
      }
      this.achievementFileList = data?.attachment ?? [];
      this.mergeAttachment = data.mergeAttachment;
      this.sequenceStatus = data?.sequenceStatus ?? '';
      this.sjrwdIdtrans = data?.sjrwdId ?? ''
      this.curAchievementId = data?.id ?? ''
      if (this.sequenceStatus === "DRAFT")
        this.$emit("updateAchievement", data?.id ?? "", [...this.achievementFileList]);
    } catch (error) {
      return this.$message.error(`获取第${this.version}版任务设计成果异常,${error}`);
    }
  }

  /* 成果文件上传前检查 */
  achievementUploadBeforeUpload(file: File & { uid: string }, fileList: (File & { uid: string })[]) {
    // const isAcceptFileType = this.uploadAcceptFileTypes.includes(file.type);
    return new Promise((resolve, reject) => {
      const isLt100M = file.size / 1024 / 1024 <= 100;
      // if (!isLt100M) {
      //   this.$message.error("只能上传不大于100M的文件");
      //   return reject(false);
      // }
      // this.$message.warning('将会覆盖原有设计任务成果文件，请确认？')
      return resolve(true);
    });
  }

  /* 成果文件上传 */
  achievementUploadHandleChange(info) {
    console.log(info,'info')
    const file:any = info.file.originFileObj;
    if (info.file.status === 'uploading') {
      this.achievementUploadeLoading = true;
    } else if (info.file.status === 'done') {
      this.achievementUploadeLoading = false;
      if (info.file.response.errcode) {
        this.$message.error(`上传文件[${info.file.name}]失败`);
      } else {
        if (info.file.response.data.length > 0) {
          info.file.response.data.map(item => item['spinFlag'] = false)
        }
        // this.achievementFileList.push(info.file.response.data);
        // this.$emit("addFile", info.file.response.data)
        if (file) {
          this.uploadDesignFile(file)
        }
      }
    } else if (info.file.status === "error") {
      this.achievementUploadeLoading = false;
      this.$message.error(`上传文件[${info.file.name}]失败`);
    } else {
      this.achievementUploadeLoading = false;
      this.$message.error(`上传文件[${info.file.name}]失败,未知错误`);
    }
  }
  /* 删除已上传成果文件 */
  removeFile(file: { refId: string }) {
    const fileIndex = this.achievementFileList.findIndex(item => item.refId === file.refId);
    (fileIndex > -1) && this.achievementFileList.splice(fileIndex, 1);
    this.$emit("removeFile", file.refId);
  }

  /* 格式化文件大小 */
  formatFileSize(fileSize: number) {
    if (fileSize === null) return "";
    let temp;
    if (fileSize < 1024) {
      return fileSize.toFixed(2) + 'B';
    } else if (fileSize < (1024 * 1024)) {
      temp = fileSize / 1024;
      temp = temp.toFixed(2);
      return temp + 'KB';
    } else if (fileSize < (1024 * 1024 * 1024)) {
      temp = fileSize / (1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'MB';
    } else {
      temp = fileSize / (1024 * 1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'GB';
    }
  }

  fileIcon = [
    {fileType: "application/pdf", iconType: "file-pdf", color: "#dd0011"},
    {fileType: "application/xls", iconType: "file-excel", color: "#00c090"},
    {fileType: "application/xlsx", iconType: "file-excel", color: "#00c090"},
    {fileType: "application/ppt", iconType: "file-ppt", color: "#f2733d"},
    {fileType: "application/pptx", iconType: "file-ppt", color: "#f2733d"},
    {fileType: "application/doc", iconType: "file-word", color: "#558ff2"},
    {fileType: "application/docx", iconType: "file-word", color: "#558ff2"},
  ]

  getIconType(fileType: string) {
    const index = this.fileIcon.findIndex(item => item.fileType.indexOf(fileType)>-1);
    if (index > -1) {
      return this.fileIcon[index].iconType;
    } else {
      return "file"
    }
  }

  getIconColor(fileType: string) {
    const index = this.fileIcon.findIndex(item => item.fileType.indexOf(fileType)>-1);
    if (index > -1) {
      return this.fileIcon[index].color;
    } else {
      return ""
    }
  }

  fileClick(item,fileName: string,lightweightUrl: string,previewUrl: string,refId:string) {
    if (item.fileSize === null) {
      let routeUrl = this.$router.resolve({
        name: '/ModelAnnotation',
        query: {
          appCode: this.appCode,
          personId: this.personId,
          workflowInstanceId: this.workflowInstanceId,
          designFileId: item.id,
          name: item.name,
          VaultID: item.engineProjectId,
          ModelID: item.engineModelId,
          FileName: item.engineFileName,
          iframeURL: item.onlinePrewView,
        },
      })
      window.open(routeUrl.href, "_blank")
    } else {
      if (this.showTransferModal(fileName)) {
        if (!lightweightUrl){
          return this.$message.warning('暂无轻量化地址！')
        }else {
          window.open(lightweightUrl)
        }
      }else {
        if (previewUrl) { //
          window.open(previewUrl)
        }else { //在线编辑大纲
          window.open(sessionStorage.getItem('previewUrl')?`${sessionStorage.getItem('previewUrl')}?url=${window.config.apiHost}/api/aliyun/download?refId=${refId}=name=${fileName}`:`http://10.20.90.213:8012/onlinePreview?url=https://collaborativedesign.ctesi.com.cn/api/api/aliyun/download?refId=${refId}=name=${fileName}`)
        }
      }
      // window.open(`${item.lightweightAddress}`, "_blank")
    }
  }

  downloadFile(item) {
    if (item.downloadUrl) {
      window.open(item.downloadUrl, "_blank")
    }else {//在线编辑docx
      window.open(`${env.apiHost}/api/aliyun/download?refId=${item.refId}`)
    }
  }
  transSpin: boolean = false;
  transformingIndex: number = -1;
  getTransferModel(item,index:number) {
    if (item.status === '转换中') return this.$message.warning('转换中');
    if (item.status === '成功') return this.$message.success('转换成功！');
    //轻量化转换
    this.transSpin = true;
    this.transformingIndex = index;
    transferModelGeneral({
      appCode: this.appCode ?? '',
      url: item.downloadUrl,
      name: item.fileName,
      vaultId: this.designAchieveId,
      fileId: item.refId,
      schemaCode: 'XTSJ_design_file',
      force: true,
      userId: this.userId
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      if (!res.data) return;
      this.$message.success('转换开始！')
    }).finally(()=> {
      this.transSpin = false;
      this.transformingIndex = -1;
    })
  }

  //控制轻量化转换相关操作显影权限
  showTransferModal(name: string) {
    if (!name) return false;
    return this.formmatConfig.split(',').some((item)=> name.indexOf(item)>-1)
  }

  syncClick(item) {//刷新状态
    getModelTrans({
      appCode: this.appCode ?? '',
      id: item.id,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.achievementFileList.map(i => {
        if (i.id === item.id) {
          i.spinFlag = true;
          //@ts-ignore
          i['status'] = res?.data?.status;
          if (i['status'] === '成功') {
            //@ts-ignore
            i['engineProjectId'] = res?.data?.vaultId;
            //@ts-ignore
            i['engineModelId'] = res?.data?.modelId;
          }
        }
      })
    })
      .finally(() => {
        setTimeout(() => {
          item.spinFlag = false;
        }, 300)
      })
  }

  //章节指定
  upBindPerson(data: any) {
    this.$emit('upBindManager', data)
  }

  createDesignSpecificationSubTask() {
    this.$emit('createDesignSpecificationSubTask')
  }

  //TODO START 编辑.docx文件
  modalTitle: string = '文档编辑';
  okText: string = '保存';
  showEditWorkOutlinePanel = false;
  selectDesignFile: WorkOutlineModel = {
    id: '',
    editorUrl: '',
    fileName: '',
    tmpFileName: '',
    refId: '',
    workOutline: '',
    fileType: '',
    bussiness: '',
    projectType: '',
    projectState: '',
    professionType: ''
  }
  activeIndex: number = -1;
  editFile(refId: string, index: number, item,title?:string) {
    createOnlineWebFile({
      refId: refId,
      schemaCode: `${this.appCode}_sjrwd`,
      id: this.sjrwdId
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      if (!res.data) return;
      if (!res.data.editorUrl) {
        this.$message.warning('改文档暂无可编辑地址！')
      } else {
        this.activeIndex = index;
        for (const selectDesignFileKey in this.selectDesignFile) {
          this.selectDesignFile[selectDesignFileKey] = res.data[selectDesignFileKey]
        }
        this.showEditWorkOutlinePanel = true;
      }
    })
  }
  //待添加附件
  temFile: YunAttachmentFile = {
    id: '',
    bizObjectId: '',
    bizPropertyCode: '',
    createdTime: '',
    creater: '',
    fileExtension: '',
    fileSize: 0,
    base64ImageStr: '',
    mimeType: 1,
    name: '',
    parentBizObjectId: '',
    parentSchemaCode: '',
    refId: '',
    schemaCode: '',
    onlinePrewView: '',
    download: '',
    engineProjectId: '',
    engineModelId: '',
    engineFileName: '',
  }
  saveEditFile() {
    if (this.selectDesignFile.fileName) {
      saveOnlineWebFile({
        fileName: this.selectDesignFile?.fileName ?? '',
        tmpFileName: this.selectDesignFile?.tmpFileName ?? ''
      }).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
        if (!res.data) return;
        for (const temFileKey in this.temFile) {
          this.temFile[temFileKey] = res.data[temFileKey]
        }
        this.$message.success('保存成功！')
      })
    }
  }
  extendBtnText: string = '确认';
  showExtendButton: boolean = true;
  extendFn() {
    if (!this.temFile.refId) return this.showEditWorkOutlinePanel = false;
    this.uploadDesignFile('',this.temFile.refId)
    //push,不需要覆盖
    // this.achievementFileList.splice(this.activeIndex, 1, JSON.parse(JSON.stringify(this.temFile)))
    // this.achievementFileList.push(JSON.parse(JSON.stringify(this.temFile)));
    // this.$emit("addFile",JSON.parse(JSON.stringify(this.temFile)));
    // this.$emit("updateAchievement", this.curAchievementId, [...this.achievementFileList]);
    this.showEditWorkOutlinePanel = false;
    this.temFile = {
      id: '',
      bizObjectId: '',
      bizPropertyCode: '',
      createdTime: '',
      creater: '',
      fileExtension: '',
      fileSize: 0,
      base64ImageStr: '',
      mimeType: 1,
      name: '',
      parentBizObjectId: '',
      parentSchemaCode: '',
      refId: '',
      schemaCode: '',
      onlinePrewView: '',
      download: '',
      engineProjectId: '',
      engineModelId: '',
      engineFileName: '',
    }
  }
  closeEditWorkOutlinePanel() {
    delOnlineWebFile({
      tmpFileName: this.selectDesignFile?.tmpFileName ?? ''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      if (!res.data) return;
    }).finally(() => {
      this.showEditWorkOutlinePanel = false;
      this.selectDesignFile.fileType = '';
      this.selectDesignFile.bussiness = '';
      this.selectDesignFile.projectType = '';
      this.selectDesignFile.projectState = '';
      this.selectDesignFile.professionType = '';
      this.selectDesignFile.fileName = '';
      this.selectDesignFile.tmpFileName = '';
    })
  }
  //TODO END

  //TODO START 改版成果文件（无版本）
  designAchieveId: string = '';
  getNewDesignAchievement() {
    this.achievementFileList = [];
    getNewDesignAchievements({
      appCode: this.appCode??'',
      taskId: this.sjrwdId??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      const data = res.data;
      this.designAchieveId = res.data.id;
      if(isArray(data.files) && data.files.length && data.files[this.activeKey]) {
        const currentFile = data.files[this.activeKey];
        Object.assign(currentFile, { spinFlag: false })
        this.achievementFileList.push(currentFile);
        //@ts-ignore
        // this.mergeAttachment = currentFile.mergeAttachment??null;
        this.curAchievementId = currentFile?.id ?? ''
      }
    })
  }
  userId: string = '';
  uploadDesignFile(file?:any,refId?:string) {
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    if (refId){
      formData.append("refId", refId??'');
    }
    formData.append("designAchieveId", this.designAchieveId);
    formData.append('appCode', this.appCode ?? '');
    formData.append('designFileId', this.achievementFileList[0]?this.achievementFileList[0].id:'');
    const isAddFile:any = !this.achievementFileList[0]
    // this.uploadLoading = true;
    uploadDesignFile(formData).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      this.$message.success('上传成功！')
      if (this.achievementFileList[0]) {
        Object.assign(this.achievementFileList[0],res.data)
      }else {
        Object.assign(res.data,{ spinFlag: false})
        this.achievementFileList.push(res.data as AchievementFile);
      }
      this.$emit('newAddFile',{
        file: res.data,
        isAdd: isAddFile
      })}).finally(() => {
    })
  }
  deleteFile(id:string) {
    deleteDesignFile({
      appCode: this.appCode??'',
      designFileId: id,
      force: true
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.$message.success('删除成功！')
      this.$emit('newDeleteFile')
    })
  }
  newSyncClick(refId:string) {
    this.achievementFileList[0].spinFlag = true;
    getNewModelTransGeneral({
      appCode: this.appCode??'',
      refId:refId,
      relatedId: this.sjrwdId??'',
      schemaCode: 'XTSJ_design_file'
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      Object.assign(this.achievementFileList[0],{lightweightUrl:res.data.lightweightAddress,status:res.data.status})
      this.$message.success('刷新成功！')
    }).finally(()=> {
      this.achievementFileList[0].spinFlag = false
    })
  }
  newClickFile(fileName: string,lightweightUrl: string,previewUrl: string,refId:string) {
    if (this.showTransferModal(fileName)) {
      if (!lightweightUrl){
        return this.$message.warning('暂无轻量化地址！')
      }else {
        window.open(lightweightUrl)
      }
    }else {
      if (previewUrl) { //
        window.open(previewUrl)
      }else { //在线编辑大纲
        if (fileName.indexOf('.txt')>-1 || fileName.indexOf('.TXT')>-1) {
          window.open(sessionStorage.getItem('previewUrl')?`${sessionStorage.getItem('previewUrl')}?url=${window.config.apiHost}/api/aliyun/download?refId=${refId}=name=${fileName}`:`http://10.20.90.213:8012/onlinePreview?url=https://collaborativedesign.ctesi.com.cn/api/api/aliyun/download?refId=${refId}=name=${fileName}`)
        }else {
          getDecryptFile({
            appCode: this.appCode??'',
            refId: refId,
            fileName: fileName
          }).then((res)=> {
            if(res.errcode!==0) return this.$message.error(res.errmsg as string)
            if(!res.data) return;
            window.open(`${sessionStorage.getItem('previewUrl')}?url=${res.data.indexOf('&name=')>-1?res.data.replace('&name=','=name='):res.data}`)
          })
        }

        // window.open(sessionStorage.getItem('previewUrl')?`${sessionStorage.getItem('previewUrl')}?url=${window.config.apiHost}/api/aliyun/download?refId=${refId}=name=${fileName}`:`http://10.20.90.213:8012/onlinePreview?url=https://collaborativedesign.ctesi.com.cn/api/api/aliyun/download?refId=${refId}=name=${fileName}`)
      }
    }
  }
  // showTooltip(show:boolean) {
  //  return !!this.achievementFileList[this.activeKey]
  // }
  showTooltip: boolean = false
  //TODO END

  async created() {
    this.getNewDesignAchievement();
    const user:any = sessionStorage.getItem('user')
    if (user) {
      this.userId = JSON.parse(user).id
    }
    // await this.getDesignAchievement();
  }
}
</script>

<style lang="less" scoped>
.achievementWrap {
  //height: 225px;
  //overflow: auto;
  display: flex;
  padding: 20px;

  .uploaderWarap {
    width: 450px;
    padding: 0 20px;

  }

  .spaceLine {
    height: 100%;
    border-left: 1px solid #d7d7d7;
  }

  .uploadFiles {
    padding-left: 20px;
    height: 100%;
    flex: 1;

    .uploadFileList {
      height: 100%;
      //height: calc(100% - 30px);
      overflow-y: scroll;
    }

    .uploadFile {
      background-color: #f2f2f7;
      margin-bottom: 10px;
      cursor: pointer;

      .fileIcon {
        padding-right: 2px;
        font-size: 30px;
        vertical-align: middle;
      }

      .fileName,
      .fileSize,
      .splitLine {
        display: inline-block;
        vertical-align: middle;
      }

      .fileName {
        font-size: 12px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        //min-width: 250px;
        width: 250px;
      }

      .fileSize {
        width: 70px;
        text-align: right;
        padding-right: 5px;
      }

      .splitLine {
        margin: 0 3px;
        width: 1px;
        height: 18px;
        border-left: 2px solid #d7d7d7;
      }

      .actionIcon {
        padding: 0 5px;
        cursor: pointer;
        font-size: 18px;
        vertical-align: middle;
      }

      .download {
        color: #409eff;
      }

      .delete {
        color: #c31e1e;
      }
    }
  }
}

.floatLeft {
  float: left;
}

.uploadFileCount {
  color: #2970ff;
  padding: 0 5px;
}
</style>
<style lang="less" scoped>
@import '../../../../../../styles/public.module.less';
@import "../../../../../../styles/table.modules.less";
.download {
  margin-right: @spacing-base;
}

.uploadFile {
  padding-right: @base-color;
  .transfer {
    margin-right: @spacing-base;
  }

  .sync {
    margin: 0 @spacing-base;
  }
}

.file-list {
  align-items: flex-start;
}

.total-file {
  //margin-left: @spacing-large;
  .splitLine {
    margin-left: @spacing-base !important;
  }
}

.total-title {
  //position: absolute;
  //top: 20px;
}

.fileName {
  margin-right: @spacing-large;
}

.work-content {
  width: 100%;
  max-height: 30vh;
  overflow: auto;
  .scrollbar-default;
}
</style>
<style>
.error {
  color: #E6A23C;
  font-weight: bold;
}
</style>
