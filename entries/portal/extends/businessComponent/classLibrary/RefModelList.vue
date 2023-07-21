<template>
  <div class="ref-model-list full-height flex flex-column">
    <div class="search-btn flex flex-space-between">
      <a-input-search
        placeholder="请输入关键词"
        v-model="keyWords"
        :disabled="classLibraryId===''"
        @pressEnter="enterSearch"
        @search="getModalList"></a-input-search>
      <div>
        <a-button
          @click="showModalTree = true"
          :disabled="classLibraryId===''"
          type="primary">新增关联项</a-button>
        <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteRefModal()">
          <a-button
            :disabled="classLibraryId===''"
            type="primary">删除</a-button>
        </a-popconfirm>
      </div>
    </div>
    <div class="model-table flex-auto">
      <a-table
        bordered
        :key="num"
        rowKey="id"
        :data-source="defaultPagesData"
        :columns="defaultPagesColumns"
        :loading="tableLoading"
        :rowSelection="{
          selectedRowKeys: selectedModalIds,
          onChange: onSelectChange
        }"
        :pagination="{
          pageSize: this.pageSize,
          total: this.curNodeUsersTotal,
          pageNum: this.pageNum,
          onChange: this.paginationChange
        }">
      </a-table>
    </div>
    <model-code-tree-modal
      class="full-height"
      v-show="showModalTree"
      :showModalTree="showModalTree"
      :classLibraryId="classLibraryId"
      @confirmModel="confirmModel"
      @closeModelCodeModal="closeModelCodeModal"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Watch, InjectReactive} from 'vue-property-decorator';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Popconfirm from "ant-design-vue/lib/popconfirm";
import 'ant-design-vue/lib/popconfirm/style/index';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import {ProjectConfig, TableColumn,RelationModelPage} from "../../type";
//@ts-ignore
import ModelCodeTreeModal from "./ModelCodeTreeModal.tsx";
import {deleteRalation, relationModelPage} from "../../service/classLibrary";

@Component({
  name: 'RefModelList',
  components: {
    AInputSearch: Input.Search,
    AButton: Button,
    APopconfirm: Popconfirm,
    ATable: Table,
    ModelCodeTreeModal
  }
})
export default class RefModelList extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?:ProjectConfig
  @Prop() classLibraryId!:string;
  @Watch('classLibraryId',{deep:true})
  classlibraryIdListener(val){
    this.num++;
    this.selectedModalIds = [];
    this.keyWords = '';
    this.pageNum = 1;
    if(val) {
      this.getRefModalList();
      //刷新列表
    }else {
      this.defaultPagesData = [];
      this.cacheDefaultPagesData = []
    }
  }
  //search
  keyWords: string = '';
  pageNum: number = 1;
  pageSize: number = 15;
  curNodeUsersTotal: number = 0;
  enterSearch(e) {
    this.keyWords = e.target.value;
    this.pageNum = 1;
    this.selectedModalIds = [];
    this.getRefModalList();
  }
  getModalList(keyword) {
    this.keyWords = keyword;
    this.pageNum = 1;
    this.selectedModalIds = [];
    this.getRefModalList();
  }
  //modal-dialog
  showModalTree: boolean = false;
  closeModelCodeModal() {
    this.showModalTree = false;
    this.num++;
    this.selectedModalIds = [];
  }
  confirmModel() {
    this.closeModelCodeModal();
    this.getRefModalList();
  }
  //table
  num: number = 0;
  defaultPagesData:RelationModelPage[]=[];
  cacheDefaultPagesData:RelationModelPage[]=[];
  editingKey: string = '';
  tableLoading: boolean = false;
  defaultPagesColumns: TableColumn<any>[] = [
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
      title: '模型编码',
      dataIndex: 'codeValue',
      key: 'codeValue'
    },
    {
      title: '模型名称',
      dataIndex: 'codeName',
      key: 'codeName',
    }
  ];
  onSelectChange(selectedRowKeys) {
    this.selectedModalIds = selectedRowKeys;
  }
  selectedModalIds: string[] = [];
  getRefModalList() {
    this.tableLoading = true;
    //modal-list接口
    relationModelPage({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      classLibraryId: this.classLibraryId,
      keyWords: this.keyWords,
      pageNum: this.pageNum,
      pageSize: this.pageSize
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.defaultPagesData = JSON.parse(JSON.stringify(res.data?.records??[]));
      this.cacheDefaultPagesData = JSON.parse(JSON.stringify(res.data?.records??[]));
      this.curNodeUsersTotal =  res.data?.total??0;
    }).finally(()=> {
      this.tableLoading = false
    })
  }
  deleteRefModal() {
    if(!this.selectedModalIds.length) {return this.$message.warning('请至少选择一项！')}
    deleteRalation({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      deleteIds: this.selectedModalIds
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("删除成功！");
      this.selectedModalIds = [];
      this.num++;
      this.getRefModalList();
    });
  }
  paginationChange( page: number, pageSize: number ) {
    this.pageNum = page;
    this.pageSize = pageSize;
    this.getRefModalList();
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
@import './classLibrary.modules.less';
.ref-model-list {
  .model-table {
    overflow: auto;
    .ant-table-wrapper {
      .full-height;
      .overflow-hidden;
    }
    /deep/ .ant-spin-nested-loading {
      .full-height;
      .ant-spin-container {
        .full-height;
        .flex;
        .flex-column;
        .ant-table {
          .full-height;
          .overflow-hidden;
          .ant-table-content {
            .full-height;
            overflow-y: auto;
          }
        }
        .ant-pagination {
          text-align: right;
          padding-right: @spacing-large;
        }
      }
    }
  }
}
</style>
