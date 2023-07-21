<template>
  <a-modal
    title="工作大纲模板文件列表"
    :visible="showWorkOutlineModels"
    @cancel="closeWorkOutlineModels"
    @ok="next"
    okText="下一步"
    wrapClassName="work-outline-models"
    :destroyOnClose="true">
    <div class="table-content-scroll flex-auto">
      <a-table
        rowKey="id"
        :pagination="false"
        :data-source="lists"
        :columns="listsColumns"
        :customRow="rowClick"
        :rowClassName="setRowClassName"
        :scroll="{ y: 300 }"
        :loading="tableLoading">
        <template slot="operation" slot-scope="text, record, index">
          <div class="operator">
            <a @click="previewUrl(record.previewUrl)">预览</a>
            <a @click="downloadUrl(record.downloadUrl)">下载</a>
          </div>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop, Watch} from 'vue-property-decorator';
import {getWorkOutlineModels,selectWorkOutlineModel} from "../../../../../service/api";
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import {exampleData} from "../../../../engineeringArchives/mock";
import {WorkOutlineTemplate, TableColumn, WorkOutlineModel} from "../../../../../type";

@Component({
  name: 'WorkOutlineModels',
  components: {
    AModal: Modal,
    ATable: Table
  }
})
export default class WorkOutlineModels extends Vue {
  @InjectReactive("project") projectCode?: string;
  @Prop() workOutlineDataId!:string;
  @Prop() showWorkOutlineModels!:boolean;
  @Prop() wProjectName!:string;
  @Watch('showWorkOutlineModels',{ deep: true})
  showWorkOutlineModelsListner(val) {
    this.lists = [];
    if(val) {
      this.getWorkOutlineModels();
      this.currentRow = null;
    }
  }
  lists: WorkOutlineTemplate[] = [];
  listsColumns: TableColumn<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      //@ts-ignore
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '文件名称',
      dataIndex: 'fileName',
      key: 'fileName',
      align: 'center'
    },
    {
      title: '工程分类',
      dataIndex: 'bussiness',
      key: 'bussiness',
      align: 'center'
    },
    {
      title: '工程类型',
      dataIndex: 'projectType',
      key: 'projectType',
      align: 'center'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 130,
      scopedSlots: {customRender: 'operation'}
    }
  ];
  tableLoading: boolean = false;
  currentRow: WorkOutlineTemplate|null = null;
  selectWorkOutlineTemplate: WorkOutlineModel = {
    id: '',
    editorUrl: '',
    refId: '',
    workOutline: '',
    fileType: '',
    bussiness: '',
    projectType: '',
    projectState: '',
    professionType: ''
  }
  rowClick(record, index) {
    return {
      on: {
        click: (e) => {
          if(!this.currentRow) {
            this.currentRow = record;
          }else if(record.id === this.currentRow.id) {
            this.currentRow = null;
          }else {
            this.currentRow = record;
          }
        }
      }
    }
  };
  // 行样式
  setRowClassName(record, index) {
    if (!this.currentRow) {
      return
    }
    return record.id === this.currentRow.id ? "clickRowStyl" : '';//赋予点击行样式
  }
  getWorkOutlineModels() {
    // this.lists = exampleData.response.data.workOutlineModels as WorkOutlineTemplate[];
    this.tableLoading = true;
    getWorkOutlineModels({
      appCode: this.projectCode??'',
      workOutlineId: this.workOutlineDataId??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.lists = res.data??[]
    }).finally(()=> {
      this.tableLoading = false;
    })
  }
  closeWorkOutlineModels() {
    this.$emit('closeWorkOutlineModels')
  }
  next() {
    if(!this.currentRow) return this.$message.warning('请先选择工作大纲模板！');
    selectWorkOutlineModel({
      appCode: this.projectCode??'',
      projectName: this.wProjectName??'',
      workOutlineId: this.workOutlineDataId,
      modelId: this.currentRow.id
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      for (const selectWorkOutlineTemplateKey in this.selectWorkOutlineTemplate) {
        this.selectWorkOutlineTemplate[selectWorkOutlineTemplateKey] = res.data[selectWorkOutlineTemplateKey]
      }
      this.$emit('openEditWorkOutlinePanel');
      this.$emit('closeWorkOutlineModels');
      this.$emit('eidtWorkOutlineFile',this.selectWorkOutlineTemplate)
    })
  }
  previewUrl(url:string) {
    window.open(url)
  }
  downloadUrl(url:string) {
    window.open(url)
  }
}
</script>

<style scoped lang="less">
@import '../../../../../styles/public.module.less';
@import '../../../../../styles/table.modules.less';
@import '../../../../systemConfig/system.module.less';
/deep/ .work-outline-models {
  .ant-modal {
    width: 700px !important;
  }
  .ant-modal-body {
    max-height: 500px;
    overflow: hidden;
    //overflow: auto;
    .operator {
      a {
        margin-right: @spacing-base;
      }
    }
  }
}
</style>
