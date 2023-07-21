<template>
  <a-modal
    :visible="showContentModal"
    title="素材内容"
    :footer="null"
    :width="1600"
    :destroyOnClose="true"
    class="search-content-modal"
    @cancel="onModalCancel">
    <div class="flex flex-end">
      <div class="flex">
        <a-input-search
          placeholder="请输入素材标题/素材内容关键字"
          v-model="keywords"
          @pressEnter="enterSearch"
          @search="getDocumentList"></a-input-search>
        <!--        <div v-for="(item,index) in workConditionConfig" :key="index" class="flex condition flex-center-align">-->
        <!--          <div class="text">{{ item.text }}：</div>-->
        <!--          <base-select-->
        <!--            @changeValue="(val)=>getListByWorkType(val,item)"-->
        <!--            :options="item.options"-->
        <!--            :value="item.selected"/>-->
        <!--        </div>-->
      </div>
    </div>
    <div class="table-content-scroll flex-auto line-table-header">
      <a-table
        :key="num"
        rowKey="id"
        :data-source="lists"
        :columns="listsColumns"
        :scroll="{ y: 800 }"
        :loading="tableLoading"
        :pagination="{
          pageSize: this.pageSize,
          total: this.curTotal,
          pageNum: this.pageNum,
          onChange: this.paginationChange
        }">
        <template slot="paragraph" slot-scope="t,r">
          <a-tooltip>
            <template slot="title">
              <span v-html="t"></span>
            </template>
            <div style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;" v-html="t"></div>
          </a-tooltip>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <div class="flex flex-space-between flex-center-align">
            <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteDocument(record.id)">
              <a href="#">删除</a>
            </a-popconfirm>
            <a @click="previewUrl(record.previewUrl)">预览</a>
            <a @click="downloadUrl(record.downloadUrl)">下载</a>
          </div>
        </template>
      </a-table>
    </div>
    <a-modal
      :visible="showPanel"
      @cancel="showPanel=false"
      :footer="null"
      wrapClassName="panel"
      :destroyOnClose="true">
      <iframe :src="iframePreviewUrl" frameborder="0"></iframe>
    </a-modal>
  </a-modal>
</template>

<script lang="ts">
import {Vue, Component, Prop, Watch, InjectReactive} from 'vue-property-decorator';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import BaseSelect from "../../deviceManagement/BaseSelect.vue";
import {DefineTypes, TableColumn, WorkOutlineSourceList} from "../../../type";
import {searchContentItem,deleteContentItem} from "../../../service/CoordinateDesign/documentLibrary";
import {exampleData} from "../../engineeringArchives/mock";
@Component({
  name: 'SearchContentModal',
  components: {
    AModal: Modal,
    AInputSearch: Input.Search,
    ATable: Table,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATooltip: Tooltip,
    APopconfirm: Popconfirm,
    BaseSelect,
  }
})
export default class SearchContentModal extends Vue {
  @InjectReactive("project") projectCode?: string;
  @Prop() conditionConfig?: DefineTypes[];
  workConditionConfig: DefineTypes[] = [];
  @Prop() showContentModal!:boolean;
  @Prop() contentParentId!:string;
  @Watch('showContentModal',{ immediate: true})
  showModalListener(val){
    if(val) {
      this.pageNum = 0;
      this.getSourceListById()
    }
  }
  getSourceListById() {
    // this.lists = exampleData.response.data.workOutlineModels as WorkOutlineSourceList[];
    this.lists = [];
    this.tableLoading = true;
    searchContentItem({
      parentId: this.contentParentId,
      appCode: this.projectCode??'',
      bussiness: this.workConditionConfig.find((i)=> i.field==='bussinesses')?.selected??'',
      projectType: this.workConditionConfig.find((i)=> i.field==='projectTypes')?.selected??'',
      projectState: this.workConditionConfig.find((i)=> i.field==='projectStates')?.selected??'',
      fileType: this.workConditionConfig.find((i)=> i.field==='fileTypes')?.selected??'',
      professionType: this.workConditionConfig.find((i)=> i.field==='professionTypes')?.selected??'',
      childFlag: false,
      keyWord: this.keywords,
      pageNum: this.pageNum,
      pageSize: this.pageSize
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.lists = res.data.records??[];
      // for (let i = 0; i < 5; i++) {
      //   this.lists = this.lists.concat(this.lists)
      // }
      this.curTotal = res.data.total;
    }).finally(()=> {
      this.tableLoading = false
    })
  }
  onModalCancel() {
    this.$emit('closeContentModal')
  }
  //table
  num: number = 1;
  lists: WorkOutlineSourceList[] = [];
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
      title: '工作类型',
      dataIndex: 'fileType',
      key: 'fileType',
      align: 'center',
      width: 120
    },
    {
      title: '素材标题',
      dataIndex: 'title',
      key: 'title',
      align: 'center'
    },
    {
      title: '素材内容',
      dataIndex: 'paragraph',
      key: 'paragraph',
      align: 'center',
      // ellipsis: true,
      scopedSlots: {customRender: 'paragraph'}
    },
    {
      title: '上传人',
      dataIndex: 'creator',
      key: 'creator',
      align: 'center',
      width: 120
    },
    {
      title: '上传日期',
      dataIndex: 'createdTime',
      key: 'createdTime',
      align: 'center',
    },
    {
      title: '工程分类',
      dataIndex: 'bussiness',
      key: 'bussiness',
      align: 'center',
      width: 120
    },
    {
      title: '工程类型',
      dataIndex: 'projectType',
      key: 'projectType',
      align: 'center',
    },
    {
      title: '工程阶段',
      dataIndex: 'projectState',
      key: 'projectState',
      align: 'center',
      width: 120
    },
    {
      title: '专业类型',
      dataIndex: 'professionType',
      key: 'professionType',
      align: 'center',
      width: 120
    },
    {
      title: '所属文档名称',
      dataIndex: 'fileName',
      key: 'fileName',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      width: 130,
      scopedSlots: {customRender: 'operation'}
    }
  ];
  tableLoading: boolean = false;
  pageNum: number = 0;
  pageSize: number = 20;
  curTotal: number = 0;
  paginationChange(page: number, pageSize: number) {
    this.pageNum = page-1;
    this.pageSize = pageSize;
    this.getSourceListById();
  }
  deleteDocument(id:string) {
    deleteContentItem({
      appCode: this.projectCode??'',
      id: id
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.$message.success('删除成功！');
      this.pageNum = 0;
      this.getSourceListById()
    })
  }
  //url
  iframePreviewUrl: string = '';
  showPanel: boolean = false;
  timeFn: any = null;
  previewUrl(url: string) {
    clearTimeout( this.timeFn );
    this.timeFn = setTimeout(()=> {
      this.showPanel = true;
      this.iframePreviewUrl = url;
    },300)
  }
  downloadUrl(url: string) {
    clearInterval( this.timeFn );
    window.open(url)
  }
  //search
  keywords: string = '';
  enterSearch(e) {
    this.keywords = e.target.value;
    this.pageNum = 0;
    this.getSourceListById();
  }
  getDocumentList(keyword) {
    this.keywords = keyword;
    this.pageNum = 0;
    this.getSourceListById();
  }

  handleChange(val:string,item:DefineTypes) {
    this.workConditionConfig.map((i) => {
      if(i.field === item.field) {
        i.selected = val;
      }
    })
  }
  getListByWorkType(value:string,item:DefineTypes) {
    this.pageNum = 0;
    this.handleChange(value,item)
    this.getSourceListById();
  }
  mounted(){
    this.workConditionConfig = JSON.parse(JSON.stringify(this.conditionConfig));
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import "../../../styles/table.modules.less";
@import '../../systemConfig/system.module.less';
@import './docment.public.less';
.search-content-modal {
  /deep/ .ant-modal {
    height:800px;
    .ant-modal-content {
      .full-height;
      .flex;
      .flex-column;
      .ant-modal-close-x {
        font-weight: bold;
        font-size: 20px;
      }
      .ant-modal-body {
        .flex-auto;
        overflow: hidden;
        .flex;
        .flex-column;
      }
    }
  }
  .condition {
    margin-left: @spacing-base;
    .text {
      white-space: nowrap;
    }
    /deep/ .ant-select {
      min-width: 120px;
      margin-right: @spacing-base;
    }
  }
  .table-content-scroll {
    margin-top: @spacing-base;
  }
  /deep/ .ant-input {
    width: 280px;
  }
}
/deep/ .panel {
  .document-preview;
}
</style>
