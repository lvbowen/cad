<template>
  <div class="work-outline-source full-height flex flex-column">
    <div class="flex flex-space-between">
      <div class="flex">
        <a-button type="primary" @click="showModal=true">上传</a-button>
      </div>
      <div class="flex">
        <a-input-search
          placeholder="请输入文档名称/上传人关键字"
          v-model="keywords"
          @pressEnter="enterSearch"
          @search="getDocumentList"></a-input-search>
        <div v-for="(item,index) in workConditionConfig" :key="index" class="flex condition flex-center-align">
          <div class="text">{{ item.text }}：</div>
          <base-select
            @changeValue="(val)=>getListByWorkType(val,item)"
            :options="item.options"
            :showSearch="item.showSearch"
            :disabled="!item.disabled?false:item.disabled"
            :value="item.selected"/>
        </div>
        <a-button type="primary" @click="resetCondition">重置</a-button>
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
        <template slot="fileName" slot-scope="t,r">
          <a-tooltip>
            <template slot="title">
              单击预览<br>双击下载
            </template>
            <a @click="previewUrl(r.previewUrl)" @dblclick="downloadUrl(r.downloadUrl)"> {{ t }}</a>
          </a-tooltip>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <div class="flex flex-space-between flex-center-align">
            <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteDocument(record.id)">
              <a href="#">删除</a>
            </a-popconfirm>
            <a @click="searchChildrenList(record.id)">查看</a>
          </div>
        </template>
      </a-table>
    </div>
    <add-document-modal
      v-if="showModal"
      :showModal="showModal"
      :modalTitle="modalTitle"
      :entrance="'source'"
      @closeModal="closeModal"
      @refreshDocumentList="getSourceList"
      :conditionConfig="conditionConfig"/>
    <a-modal
      :visible="showPanel"
      @cancel="showPanel=false"
      :footer="null"
      wrapClassName="panel"
      :destroyOnClose="true">
      <iframe :src="iframePreviewUrl" frameborder="0"></iframe>
    </a-modal>
    <search-content-modal
      :showContentModal="showContentModal"
      @closeContentModal="closeContentModal"
      :contentParentId="contentParentId"
      :conditionConfig="conditionConfig"></search-content-modal>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive,Prop,Watch} from 'vue-property-decorator';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import BaseSelect from "../../deviceManagement/BaseSelect.vue";
import {DefineTypes, TableColumn, WorkOutlineSourceList} from "../../../type";
import {exampleData} from "../../engineeringArchives/mock";
import AddDocumentModal from "./addDocumentModal.vue";
import { searchContentItem,updateAchievementModel,deleteContentItem} from "../../../service/CoordinateDesign/documentLibrary";
import SearchContentModal from "./SearchContentModal.vue";
@Component({
  name: 'WorkOutlineSource',
  components: {
    AInputSearch: Input.Search,
    AButton: Button,
    ATable: Table,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATooltip: Tooltip,
    BaseSelect,
    AddDocumentModal,
    APopconfirm: Popconfirm,
    AModal: Modal,
    SearchContentModal
  }
})
export default class WorkOutlineSource extends Vue {
  @InjectReactive("project") projectCode?: string;
  @Prop() conditionConfig?: DefineTypes[];
  workConditionConfig: DefineTypes[] = [];
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
      align: 'center'
    },
    {
      title: '文档名称',
      dataIndex: 'fileName',
      key: 'fileName',
      align: 'center',
      scopedSlots: {customRender: 'fileName'}
    },
    {
      title: '拆分素材数量',
      dataIndex: 'childNum',
      key: 'childNum',
      align: 'center'
    },
    {
      title: '上传人',
      dataIndex: 'creator',
      key: 'creator',
      align: 'center',
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
    },
    {
      title: '专业类型',
      dataIndex: 'professionType',
      key: 'professionType',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      width: 100,
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
    this.getSourceList();
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
    this.getSourceList();
  }
  getDocumentList(keyword) {
    this.keywords = keyword;
    this.pageNum = 0;
    this.getSourceList();
  }

  handleChange(val:string,item:DefineTypes) {
    this.workConditionConfig.map((i) => {
      if(i.field === item.field) {
        i.selected = val;
      }
    })
  }
  //workType
  getListByWorkType(value:string,item:DefineTypes) {
    this.pageNum = 0;
    this.handleChange(value,item);
    //处理工程分类和工程类型的级联关系
    if (item.field==='bussinesses'){
      const types = this.workConditionConfig.filter((i)=> i.field==='projectTypes')
      if (types.length) {
        if (!value){
          types[0].disabled = true;
          types[0].selected = '';
        }else {
          types[0].disabled = false;
          types[0].selected = '';
          // @ts-ignore
          this.conditionConfig.map((c)=> {
            if (c.field==='projectTypes') {
              //@ts-ignore
              const options = c.options.filter(( o)=> o.name===value)
              types[0].options = JSON.parse(JSON.stringify(options[0].value))
            }
          })
        }
      }
    }
    this.getSourceList();
  }
  getSourceList() {
    // this.lists = exampleData.response.data.workOutlineModels as WorkOutlineTemplate[];
    this.lists = [];
    this.tableLoading = true;
    searchContentItem({
      appCode: this.projectCode??'',
      bussiness: this.workConditionConfig.find((i)=> i.field==='bussinesses')?.selected??'',
      projectType: this.workConditionConfig.find((i)=> i.field==='projectTypes')?.selected??'',
      projectState: this.workConditionConfig.find((i)=> i.field==='projectStates')?.selected??'',
      fileType: this.workConditionConfig.find((i)=> i.field==='fileTypes')?.selected??'',
      professionType: this.workConditionConfig.find((i)=> i.field==='professionTypes')?.selected??'',
      childFlag: false,
      parentId: '',
      keyWord: this.keywords,
      pageNum: this.pageNum,
      pageSize: this.pageSize
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.lists = res.data.records??[]
      this.curTotal = res.data.total;
    }).finally(()=> {
      this.tableLoading = false
    })
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
      this.getSourceList()
    })
  }
  //add
  showModal: boolean = false;
  modalTitle: string = '新增内容素材';
  closeModal() {
    this.showModal = false
  }
  //children-modal
  showContentModal: boolean = false;
  contentParentId: string = '';
  closeContentModal() {
    this.showContentModal = false;
    this.contentParentId = '';
  }
  searchChildrenList(id:string) {
    this.contentParentId = id;
    this.showContentModal = true;
  }
  resetCondition() {
    this.workConditionConfig.map((i)=> {
      i.selected = ''
    })
    this.pageNum = 0;
    this.getListByWorkType('',this.workConditionConfig.filter((item)=> item.field==='bussinesses')[0])
  }
  mounted(){
    this.workConditionConfig = JSON.parse(JSON.stringify(this.conditionConfig));
    this.getSourceList()
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import "../../../styles/table.modules.less";
@import '../../systemConfig/system.module.less';
@import './docment.public.less';
.work-outline-source {
  .ant-btn {
    margin-right: @spacing-base;
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
    width: 250px;
  }
}
/deep/ .panel {
  .document-preview;
}
</style>

