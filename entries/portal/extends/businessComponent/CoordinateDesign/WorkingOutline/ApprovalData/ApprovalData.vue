<template>
  <div class="approval-data wrap overflow-hidden" :key="approval">
    <a-collapse v-model="activeKey" expandIconPosition="right" :bordered="false">
      <a-collapse-panel key="1">
        <template #header>
          <div class="collapseHeader">
            <div class="collapseHeaderTitle left">审批资料</div>
            <div class="collapseHeaderHandle collapseHeaderItem left">工程分类:<em>{{ approvalData.business }}</em></div>
            <div class="collapseHeaderHandle collapseHeaderItem left">工程类型:<em>{{ approvalData.projectType }}</em></div>
            <div class="collapseHeaderHandle collapseHeaderItem left">工程阶段:<em>{{ approvalData.projectState }}</em></div>
          </div>
        </template>
        <div class="flex-end flex-center-align" v-show="approvalPermission.permit && !showAdd">
          <a-button type="primary" @click="editAttachments">编辑</a-button>
        </div>
        <div class="flex flex-space-between" v-show="approvalPermission.permit && showAdd">
          <div>
            <a-button type="primary" @click="showApproval=true">新增</a-button>
            <a-popconfirm @confirm="deleteRow" title="删除后不可恢复哦，确认删除吗？">
              <a-button>删除</a-button>
            </a-popconfirm>
          </div>
          <div class="flex-center-align">
            <a-button @click="cancelEditAttchments">取消</a-button>
            <a-button type="primary" @click="submit">保存</a-button>
            <a-tooltip>
              <template slot="title">双击表格编辑对应的行数据！</template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </div>
        </div>
        <div class="table-content-scroll">
          <a-table
            rowKey="id"
            :scroll="{y:900}"
            :columns="approvalInstanceColumns"
            :rowSelection="rowSelection"
            :tableKey="tableKey"
            :customRow="customRow"
            :data-source="approvalData.XTSJ_approval_instance"
            :pagination="false"
          >
            <template slot="index" slot-scope="t,r,index">{{ index+1 }}</template>
            <template slot="createdTime" slot-scope="t,r" v-if="Array.isArray(r.attachment) && r.attachment.length">{{ r.attachment[0].createdTime }}</template>
            <div
              class="attachment"
              slot="attachment"
              slot-scope="t, r,index"
              v-if="Array.isArray(r.attachment) && r.editable">
              <a-button size="small" @click="uploadFiles(index)" :loading="activeIndex===index && uploadLoading">上传</a-button>
              <a-tooltip>
                <template slot="title">
                  <div>单击预览</div>
                  <div>双击下载</div>
                </template>
                <a
                  v-for="(item,itemIndex) in r.attachment"
                  :key="itemIndex"
                  @mouseenter="mouseenterIndex(index,itemIndex)"
                  @mouseleave="mouseleaveIndex"
                  @click="preView(item.refId,item.name)"
                  @dblclick="download(item.refId)">
                  <span>{{ item.name }}</span>
                  <a-icon type="scissor" v-if="activeRowIndex===index && activeItemIndex===itemIndex" @click.stop="clearAttachment(index,itemIndex)"></a-icon>
                </a>
              </a-tooltip>
            </div>
            <div
              slot="attachment"
              slot-scope="t,r"
              class="attachment"
              v-else-if="Array.isArray(r.attachment) && r.attachment.length && !r.editable">
              <a-tooltip>
                <template slot="title">
                  <div>单击预览</div>
                  <div>双击下载</div>
                </template>
                <a
                  v-for="(item,index) in r.attachment"
                  :key="index"
                  @click="preView(item.refId,item.name)"
                  @dblclick="download(item.refId)">
                  {{ item.name }}
                </a>
              </a-tooltip>
            </div>
          </a-table>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <add-approval-modal
      :showApproval="showApproval"
      @closeApprovalModal="closeApprovalModal"
      @addRow="addRow"
      :key="modalKey"
      :relevanceFormData="relevanceFormData"
      :business="approvalData.business"
      :projectState="approvalData.projectState"
      :projectType="approvalData.projectType"
      :defaultEssential="defaultEssential"
      :defaultSelected="defaultSelected"
      :defaultDescription="defaultDescription"
      :defaultItemType="defaultItemType"
    />
    <input
      class="file-input"
      ref="fileInput"
      :key="tableKey+1"
      type="file"
      @change="(e) => fileUpload(e)"
    />
  </div>
</template>

<script lang="ts">
import {Vue, Component,InjectReactive,Watch} from 'vue-property-decorator';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import { TableColumn,ApprovalPermissionRes,ApprovalRes,ApprovalRow } from "../../../../type";
import { getApprovalInstancePermission,getDecryptFile } from "../../../../service/CoordinateDesign/base";
import {formApi, listApi} from "@cloudpivot/api";
import { FormObject } from "@cloudpivot/api/src/form-params";
import {exampleData} from "../../../engineeringArchives/mock";
import AddApprovalModal from "./AddApprovalModal.vue";
import env from "@/config/env";
import Utils from "../../../../utils";
import {yunFileUpload} from "../../../../service/CoordinateDesign/documentLibrary";
import { UUID } from "../../../../service/CoordinateDesign/common";

@Component({
  name: 'ApprovalData',
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AButton: Button,
    ATable: Table,
    ATooltip: Tooltip,
    AIcon: Icon,
    AddApprovalModal,
    APopconfirm: Popconfirm
  }
})
export default class ApprovalData extends Vue {
  @InjectReactive('project') projectCode!:string;
  //
  showAdd: boolean = false;
  editAttachments() {
    this.showAdd = true;
    this.approvalData.XTSJ_approval_instance.map((x) => {
      Object.assign(x,{ editable: true })
    })
  }
  cancelEditAttchments() {
    this.showAdd = false;
    this.activeIndex = -1;
    this.approvalData.XTSJ_approval_instance = JSON.parse(JSON.stringify(this.copyXTSJ_approval_instance))
    this.approvalData.XTSJ_approval_instance.map((x) => {
      Object.assign(x,{ editable: false })
    })
  }
  tableKey: number = 1;
  activeKey: string[] = ['1'];
  approvalInstanceColumns: TableColumn<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      scopedSlots: { customRender: 'index' },
    },
    {
      title: '资料名称',
      dataIndex: 'essential',
      key: 'essential'
    },
    {
      title: '是否必填',
      dataIndex: 'selected',
      key: 'selected',
      width: 80
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '清单项类型',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 120
    },
    {
      title: '上传时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      scopedSlots: { customRender: 'createdTime' },
      width: 200
    },
    {
      title: '附件',
      dataIndex: 'attachment',
      key: 'attachment',
      scopedSlots: { customRender: 'attachment' },
      width: 300
    }
  ];
  approvalPermission: ApprovalPermissionRes = {
    projectId: '',
    objectId: '', //d90888cbbc0a4a38a77788ac5f217db6,b878116f7b614e04a845c20a1f77c6e6
    schemaCode: '', //XTSJ_pfzlqdb
    sheetCode: '',
    permit: false
  }
  // approvalInstance: any[] = [];
  formObject: FormObject = {} as any;
  relevanceFormData: any = {};
  approvalData: ApprovalRes = {
    typeId: {},
    business: '',
    projectType: '',
    projectState: '',
    XTSJ_approval_instance: []
  }
  copyXTSJ_approval_instance:any[] = []//取消时使用
  getApprovalInstancePermission() {
    getApprovalInstancePermission({
      appCode: this.projectCode??'',
      projectId: this.$route.query.projectId as string,
      baseType: this.$route.name==='PreviousApprovalData'?'前期资料':'批复验收'
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      for (const approvalPermissionKey in this.approvalPermission) {
        this.approvalPermission[approvalPermissionKey] = res.data[approvalPermissionKey]
      }
      if(this.approvalPermission.objectId) {
        this.getFormInfo();
      }else {
        this.listSkipQueryList()
      }
    })
  }
  getFormInfo() {
    formApi.load({
      schemaCode: this.approvalPermission.schemaCode,
      sheetCode: this.approvalPermission.sheetCode,
      objectId: this.approvalPermission.objectId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.formObject = res.data;
      for (const approvalDataKey in this.approvalData) {
        if(this.formObject.bizObject.data[approvalDataKey]) {
          this.approvalData[approvalDataKey] = this.formObject.bizObject.data[approvalDataKey];
          if(approvalDataKey==='XTSJ_approval_instance' && Array.isArray(this.approvalData[approvalDataKey])) {
            this.approvalData[approvalDataKey].map((item) => {
              if(!item.attachment) {
                item.attachment = []
              }
            })
          }
        }
      }
      this.relevanceFormData = this.formObject.bizObject.data;
      this.copyXTSJ_approval_instance = JSON.parse(JSON.stringify(this.approvalData.XTSJ_approval_instance))
      //筛选清单项类型
      const itemType:{text:string;value:string}[] = Utils.simpleUnique(this.approvalData.XTSJ_approval_instance.map((i)=> i.itemType)).map((m)=> {
        return {
          text: m,
          value: m
        }
      })
      this.$set(this.approvalInstanceColumns[4],'filters',itemType)
      this.$set(this.approvalInstanceColumns[4],'onFilter', (value, record) => record.itemType.indexOf(value) === 0)
      console.log(itemType,'11')
      // console.log(this.formObject)
    })
  }
  timeFn: any = null;
  preView(refId:string,name:string) {
    clearInterval(this.timeFn);
    this.timeFn = setTimeout(()=> {
      //txt  小于kb文件有问题
      if (name.indexOf('.txt')>-1 || name.indexOf('.TXT')>-1) {
        window.open(sessionStorage.getItem('previewUrl')?`${sessionStorage.getItem('previewUrl')}?url=${window.config.apiHost}/api/aliyun/download?refId=${refId}=name=${name}`:`http://10.20.90.213:8012/onlinePreview?url=https://collaborativedesign.ctesi.com.cn/api/api/aliyun/download?refId=${refId}=name=${name}`)
      }else {
        getDecryptFile({
          appCode: this.projectCode??'',
          refId: refId,
          fileName: name
        }).then((res)=> {
          if(res.errcode!==0) return this.$message.error(res.errmsg as string)
          if(!res.data) return;
          window.open(`${sessionStorage.getItem('previewUrl')}?url=${res.data.indexOf('&name=')>-1?res.data.replace('&name=','=name='):res.data}`)
        })
      }
      // window.open(sessionStorage.getItem('previewUrl')?`${sessionStorage.getItem('previewUrl')}?url=${window.config.apiHost}/api/aliyun/download?refId=${refId}=name=${name}`:`http://10.20.90.213:8012/onlinePreview?url=https://collaborativedesign.ctesi.com.cn/api/api/aliyun/download?refId=${refId}=name=${name}`)
    },200)
  }
  download(refId:string) {
    window.open(`${env.apiHost}/api/aliyun/download?refId=${refId}`)
  };
  //add-approval
  showApproval: boolean = false;
  modalKey: number = 1;
  closeApprovalModal() {
    this.showApproval = false;
    this.defaultEssential = '';
    this.defaultSelected = '非必填';
    this.defaultDescription = '';
    this.defaultItemType = '';
    this.selectedRowId = '';
    this.modalKey++
  }
  listSkipQueryList() {
    listApi.listSkipQueryList({
      "queryCode": "XTSJ_xmlb",
      "schemaCode": "XTSJ_xmlb",
      "mobile": false,
      "page": 0,
      "size": 2,
      "filters": [
        {
          "op": "Eq",
          "propertyCode": "id",
          "propertyType": 0,
          "propertyValue": this.approvalPermission.projectId??''
        }
      ]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      if(Array.isArray(res.data.content) && res.data.content.length) {
        const data = res.data.content[0].data;
        this.approvalData.typeId.name = res.data.content[0].name;
        this.approvalData.typeId.id = res.data.content[0].id;
        this.approvalData.typeId.schemaCode = res.data.content[0].schemaCode;
        this.approvalData.business = data.industryType;
        this.approvalData.projectType = data.projectType
        this.approvalData.projectState = data.engineering_stage;
        this.relevanceFormData = this.approvalData;
      }
    })
  }
  //addRow
  addRow(data:ApprovalRow) {
    if(this.selectedRowId) { //编辑
      const rowIndex = this.approvalData.XTSJ_approval_instance.findIndex((i)=> i.id===this.selectedRowId)
      this.approvalData.XTSJ_approval_instance.splice(rowIndex,1,Object.assign(this.approvalData.XTSJ_approval_instance[rowIndex],data))
    }else {
      this.approvalData.XTSJ_approval_instance.push(Object.assign({id:Utils.uuid(),editable:true,attachment:[]},data));
    }
    this.closeApprovalModal();
  }
  //附件上传
  activeIndex: number = -1;
  uploadFiles(index:number) {
    // console.log(index,'index')
    this.activeIndex = index;
    const { $refs } = this;
    if ($refs.fileInput) {
      ($refs.fileInput as HTMLInputElement).click();
    }
  }
  uploadLoading: boolean = false;
  fileUpload(e) {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const fileFormat = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      // if (["doc","docx"].indexOf(fileFormat) === -1)
      //   return this.$message.error("只能上传*.doc/*.docx的文件!");
      // if (file.size > 1024 * 20) return this.$message.error("文件大小不能超过XXX20 kb!");
      // const allIconsNames = this.allIcons.map((item) => item.name);
      // if (allIconsNames.includes(file.name)) return this.$message.error("已有重名文件!");
      const formData = new FormData();
      formData.append("file", file);
      this.uploadLoading = true;
      yunFileUpload(formData).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success("文件上传成功");
        // console.log(res.data)
        this.approvalData.XTSJ_approval_instance[this.activeIndex].attachment.push(res.data);
      }).finally(()=> {
        this.uploadLoading = false
        this.tableKey++;
      });
    }
  }
  showClearBtn: boolean = false;
  activeRowIndex: number = -1;
  activeItemIndex: number = -1;

  clearAttachment(index: number,itemIndex: number) {
    this.approvalData.XTSJ_approval_instance[index].attachment.splice(itemIndex,1);
    this.tableKey++;
    // console.log(this.approvalData)
  }
  mouseenterIndex(index:number,itemIndex:number) {
    this.activeItemIndex=itemIndex;
    this.activeRowIndex=index;
    // console.log(this.activeItemIndex,this.activeRowIndex)
  }
  mouseleaveIndex() {
    this.activeItemIndex=-1;
    this.activeRowIndex=-1
  }
  rowClick(record, index) {
    return {
      on: {
        mouseenter: (event) => {
          this.activeRowIndex = index;
        },  // 鼠标移入行
        mouseleave: (event) => {
          this.activeRowIndex = -1;
        }
      }
    }
  }
  //删除
  rowSelection: any = {
    onChange: (selectedRowKeys,selectedRows)=> {
      this.temRecord(selectedRows);
    }
  };
  selectedRowIds: string[] = [];
  temRecord(selectedRows) {
    this.selectedRowIds = selectedRows.map((i)=> { return i.id});
    // console.log(this.selectedRowIds,'111')
  }
  deleteRow() {
    if (!this.selectedRowIds.length) this.$message.warning('未选择！')
    this.selectedRowIds.map((item) => {
      this.approvalData.XTSJ_approval_instance.splice(this.approvalData.XTSJ_approval_instance.findIndex((i)=> {return i.id===item}),1)
    })
  }
  //提交
  async submit() {
    const objectId = await UUID();
    formApi.save({
      bizObject: {
        id: !this.approvalPermission.objectId?objectId:this.approvalPermission.objectId,
        schemaCode: 'XTSJ_pfzlqdb',
        sheetCode: 'XTSJ_pfzlqdb',
        data: {
          typeId: this.approvalPermission.projectId,
          projectId: '',
          business: this.approvalData.business,
          projectType: this.approvalData.projectType,
          projectState: this.approvalData.projectState,
          baseType: this.$route.name==='PreviousApprovalData'?'前期资料':'批复验收',
          id: !this.approvalPermission.objectId?objectId:this.approvalPermission.objectId,
          XTSJ_approval_instance: this.approvalData.XTSJ_approval_instance.map((i)=> {
            return {
              fzcx: i.fzcx.id,
              essential: i.essential,
              selected: i.selected,
              description: i.description,
              itemType: i.itemType,
              attachment: i.attachment,
              id:i.id.indexOf('-')>-1?null:i.id
            }
          })
        }
      },
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.$message.success('保存成功！');
      this.approvalPermission.objectId = res.data.objectId;
      this.showAdd = false;
      this.getFormInfo();
    })
  }
  approval:number =0;
  @Watch('$route.name', { deep: true})
  routeNameListener(val) {
    if(val){
      this.getApprovalInstancePermission();
      this.showAdd = false;
      this.approvalPermission = {
        projectId: '',
        objectId: '', //d90888cbbc0a4a38a77788ac5f217db6,b878116f7b614e04a845c20a1f77c6e6
        schemaCode: '', //XTSJ_pfzlqdb
        sheetCode: '',
        permit: false
      }
      // approvalInstance: any[] = [];
      this.formObject = {} as any;
      this.approvalData = {
        typeId: {},
        business: '',
        projectType: '',
        projectState: '',
        XTSJ_approval_instance: []
      }
      this.copyXTSJ_approval_instance = []//取消时使用
    }
  }
  //TODO 编辑行数据
  defaultEssential: string = '';
  defaultSelected: string = '非必填';
  defaultDescription: string = '';
  defaultItemType: string = '';
  selectedRowId: string = '';
  customRow(record, index){
    return{
      on: {
        dblclick: (event) => {
          if(this.approvalPermission.permit && this.showAdd) {
            console.log(record)
            this.showApproval = true;
            this.defaultEssential = record.essential;
            this.defaultSelected = record.selected;
            this.defaultDescription = record.description;
            this.defaultItemType = record.itemType;
            this.selectedRowId = record.id;
          }
        }
      }
    }
  }
  mounted() {
    this.getApprovalInstancePermission();
  }
}
</script>

<style scoped lang="less">
@import '../../../../styles/public.module.less';
@import '../ProfessionalTask/index/index.less';
@import '../../../../styles/table.modules.less';
@import '../ProductionTaskList/components/DataForm/index.less';
.approval-data {
  /deep/ .ant-collapse {
    .full-height;
    .ant-collapse-item {
      .full-height;
      .flex;
      .flex-column;
      .ant-collapse-content {
        .flex-auto;
        .overflow-hidden;
        .ant-collapse-content-box {
          .full-height;
          .flex;
          .flex-column;
        }
        .ant-btn {
          margin-right: @spacing-large;
        }
        .table-content-scroll {
          margin-top: @spacing-base;
          .attachment {
            a,.ant-btn {
              display: block;
            }
            a {
              .flex;
              .flex-space-between;
              margin-bottom: 1/2 * @spacing-base;
            }
          }
        }
      }
    }
  }
  .file-input {
    display: none;
  }
}
</style>
