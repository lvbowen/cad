<template>
  <div class="CommonOpinions-wrap full-height flex flex-column overflow-hidden">
    <div class="flex menu">
      <div
        class="inline-block active-menu">
        常用意见回复
      </div>
    </div>
    <div class="content-wrap flex-1 flex flex-column">
      <div>
        <a-button type="primary" @click="add">新增</a-button>
      </div>
      <div class="table-content-scroll flex-auto line-table-header">
        <a-table
          rowKey="id"
          :columns="columns"
          :data-source="dataSource"
          :pagination="pagination"
          :loading="tableLoading"
          :scroll="{ y: 800 }"
          @change="handleTableChange">
          <template #amount="text, record"><a @click="showModal(record)">{{ text }}</a></template>
          <template #operation="text, record">
            <a @click="goDetail(record)">编辑</a>
            <a-popconfirm
              title="删除后不可恢复哦，确认删除吗？"
              @confirm="deleteClick(record)"
            >
              <a style="margin-left: 10px;color:red">删除</a>
            </a-popconfirm>
          </template>
        </a-table>
      </div>
    </div>
    <a-modal
      title="常用意见"
      :width="800"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-button type="primary" @click="handleAdd">新增</a-button>
      <a-popconfirm
        title="删除后不可恢复哦，确认删除吗？"
        @confirm="onDelete"
      >
        <a-button
          :disabled="this.selectedRowKeys.length===0"
          type="danger"
          style="margin-bottom: 10px;margin-left: 10px">删除</a-button>
      </a-popconfirm>
      <a-table
        rowKey="id"
        :columns="recordsDatacolumns"
        :data-source="recordsDataSource"
        :pagination="recordsPagination"
        :scroll="{ y: 500 }"
        :row-selection="rowSelection"
        :customRow="rowClick"
        @change="recordsTableChange">
        <template #commonReply="text, record">
          <a-input v-if="record.operationFlag" type="text" :value="text" @change="changeInput" size="small"/>
          <span v-else>{{text}}</span>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>
<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import {Button,Table,Popconfirm,Modal,Input} from "@h3/antd-vue"
import {deleteMyReplyTemplate, getTableList, queryMyReplyTemplates,addMyReplyTemplates,deleteCommonReply} from "../../../service/api"
import env from "../../../../src/config/env";
import Utils from "../../../utils";

@Component({
  name: "index",
  components: {
    AButton:Button,
    ATable:Table,
    APopconfirm:Popconfirm,
    AModal:Modal,
    AInput:Input
  },
})
export default class index extends Vue {
  @InjectReactive("project") appCode!: string;
  columns :Array<any>= [
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
      title: '任务单名称',
      dataIndex: 'taskName',
      key: 'taskName',
      align: 'center',
      scopedSlots: { customRender: 'taskName' },
    },
    {
      title: '操作类型',
      dataIndex: 'replyType',
      key: 'replyType',
      align: 'center',
    },
    {
      title: '常用意见数量',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      scopedSlots: { customRender: 'amount' },
    },
    {
      title: '操作',
      key: 'operation',
      align: 'center',
      scopedSlots: { customRender: 'operation' },
    },
  ];
  tableLoading: boolean = false;
  dataSource :Array<any>= [];
  pagination:any={
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "50"], //每页中显示的数据
    showTotal: (total) => `共有 ${total} 条数据`, //分页中显示总的数据
  }

  visible:boolean=false;
  count:number=1;
  commonReply:Array<any>= [];
  recordsDatacolumns:Array<any>= [
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
      title: '序号',
      dataIndex: 'commonReply',
      key: 'commonReply',
      align: 'center',
      scopedSlots: { customRender: 'commonReply' },
    },
  ];
  recordsDataSource:Array<any>= [];
  recordsPagination:any={
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "50"], //每页中显示的数据
    showTotal: (total) => `共有 ${total} 条数据`, //分页中显示总的数据
  };
  itemId:string = '';
  selectedRowKeys: Array<any> = []
  selectedRows: Array<any> = []
  tableObj:any = {};

  add(){
    const addFormQuery: any = {
      schemaCode: 'XTSJ_cyhfy',
      sheetCode: 'XTSJ_cyhfy',
      queryCode: 'XTSJ_cyhfy',
      return:`${this.$route.fullPath}&iframeAction=add`,
      iframeAction: 'add',
    }
    Utils.goForm(this,'add',addFormQuery,this.isDingTalk)
  }
  goDetail(item){
    Utils.goForm(this,'edit',null,this.isDingTalk,item.id,'XTSJ_cyhfy')
  }
  deleteClick(item){
    this.dataSource=[];
    deleteCommonReply({appCode:this.appCode??'',id:item.id}).then(res=>{
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      this.getTableList();
      if(res.errcode===0) return this.$message.success(res.data as string);
    })
  }
  showModal(item){
    this.itemId=item.id;
    this.queryMyReplyTemplates(item.id);
    this.commonReply=[];
    this.visible=true;
  }

  handleOk(){
    this.visible=false;
    if(this.commonReply.length===0) return;
    this.dataSource=[];
    const commonReply=this.commonReply.map(item=>item.commonReply);
    addMyReplyTemplates({
      appCode:this.appCode??'',
      id:this.itemId,
      commonReply:commonReply
    })
      .then(res=>{
        if(res.errcode!==0) return this.$message.error(res.errmsg as string);
        this.queryMyReplyTemplates(this.itemId);
        this.getTableList();
        if(res.errcode===0) return this.$message.success(res.data as string);
      })
  }
  handleCancel(){
    this.visible=false;
  }

  handleAdd(){
    const { count, recordsDataSource } = this;
    const newObj = {
      key: count,
      id: this.uuid(),
      commonReply:'',
      operationFlag:true,
    };
    this.recordsDataSource = [...recordsDataSource, newObj];
    this.count = count + 1;
    this.commonReply.push(newObj);
  }
  onDelete(){
    if (this.selectedRowKeys.length === 0) return this.$message.info('请先选择删除对象')
    this.dataSource=[];
    deleteMyReplyTemplate({
      appCode:this.appCode??'',
      ids:this.selectedRowKeys,
      type:this.itemId
    })
      .then(res => {
        if(res.errcode!==0) return this.$message.error(res.errmsg as string);
        this.queryMyReplyTemplates(this.itemId);
        this.getTableList();
        if(res.errcode===0) return this.$message.success(res.data as string);
      })
  }

  changeInput(e){
    if(e.target.value.length>20) return this.$message.warning('常用意见长度请控制在20字以内')
    this.commonReply.map(item=>{
      if(this.tableObj.id===item.id){
        item['commonReply']=e.target.value;
      }
    })
  }
  rowClick(record, index) {
    return {
      on: { // 事件
        click: () => {
          this.tableObj = record;
        },
      },
    }
  }

  get rowSelection() {
    return {
      onChange: this.taskRowSelect,
      selectedRowKeys: this.selectedRows.map((item) => item.id),
      getCheckboxProps: (record) => {
        return {
          props: {
            name: record.name,
          }
        };
      }
    };
  }
  taskRowSelect(selectedRowKeys, selectedRows) {
    this.selectedRowKeys = selectedRowKeys;
    this.selectedRows = selectedRows;
  }

  /* 点击分页事件 */
  handleTableChange(pagination){
    this.pagination.current = pagination.current;
    this.pagination.pageSize = pagination.pageSize;
    this.getTableList();
  }
  recordsTableChange(pagination){
    this.recordsPagination.current = pagination.current;
    this.queryMyReplyTemplates(this.itemId);
  }

  async getTableList(){
    this.dataSource = [];
    this.tableLoading = true;
    try {
      let params = {
        filters:[],
        mobile: false,
        page: this.pagination.current-1,
        queryCode: `${this.appCode}_cyhfy`,
        schemaCode: `${this.appCode}_cyhfy`,
        size: this.pagination.pageSize
      }
      const { errcode,errmsg,data } = await getTableList(params);
      if(errcode !== 0) return this.$message.error( errmsg as string);
      data?.content?.forEach(item=>{
        const obj=item.data;
        this.dataSource.push({
          id:item.id,
          taskName:obj.taskName,
          replyType:obj.replyType,
          amount:obj.amount,
        })
      });
      this.pagination.total = data?.totalElements ?? 0;
    }catch (error) {
      return this.$message.error(`获取常用意见数据异常,${error}`);
    }finally {
      this.tableLoading = false;
    }
  }

  async queryMyReplyTemplates(id){
    try {
      const { errcode,errmsg,data } = await queryMyReplyTemplates({appCode:this.appCode??'',id:id,pageNum:this.recordsPagination.current-1,pageSize:this.recordsPagination.pageSize});
      if(errcode !== 0) return this.$message.error( errmsg as string);
      data.records.map(item=>{
        item['operationFlag']=false;
      })
      this.recordsDataSource=data.records;
      this.recordsPagination.total = data?.total;
    }catch (error) {
      return this.$message.error(`获取常用意见数据异常,${error}`);
    }
  }

  uuid() {
    const s = [];
    const hexDigits = "0123456789abcdef";
    for (let i = 0; i < 32; i++) {
      // @ts-ignore
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    // @ts-ignore
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    // @ts-ignore
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    const uuid = s.join("");
    return uuid;
  }
  async mounted() {
    await this.getTableList();
  }
}
</script>
<style lang="less" scoped>
@import '../../../styles/public.module.less';
@import "../../../styles/table.modules.less";
.CommonOpinions-wrap{
  width: 100%;
  height: 100%;
  .menu{
    margin-bottom: @spacing-medium;
    .inline-block {
      margin-right: @spacing-large;
      color: white;
      font-weight: bold;
      font-size: 17px;
      cursor: pointer;
    }
    .active-menu {
      padding-bottom: @spacing-base;
      border-bottom: 2px solid #ffffff;
    }
  }
  .content-wrap{
    background-color: white;
    padding: @spacing-medium @spacing-medium 0 @spacing-medium;
    margin-bottom: @spacing-medium;
    .table-content-scroll {
      margin-top: @spacing-base;
    }
  }
}
</style>
