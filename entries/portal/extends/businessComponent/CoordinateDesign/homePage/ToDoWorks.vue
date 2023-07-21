<template>
  <div class="to-do-works table-content-scroll">
    <a-table
      :key="tableKey"
      :dataSource="tableData"
      :columns="tableColumns"
      rowkey="id"
      :scroll="{ y: 800}"
      :customRow="toWorksRowClick"
      :pagination="{
        pageSize: pageSize,
        total: curTotal,
        pageNum: pageNum,
        onChange: paginationChange
      }"
      :loading="loading">
      <template slot="index" slot-scope="t,r,index">{{ (pageNum-1) * pageSize + index+1 }}</template>
      <template #workflowName="workflowName"><a>{{ workflowName }}</a></template>
      <template #activityName="activityName"><b>{{ activityName }}</b></template>
    </a-table>
  </div>
</template>

<script lang='ts'>
import { Vue,Component,Prop,InjectReactive } from 'vue-property-decorator';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import { ToDoWorksItem,TableColumn } from "../../../type";
import Utils from "../../../utils";
import {exampleData} from "../../engineeringArchives/mock";
import { queryMyWorkItemsNewV3 } from "../../../service/CoordinateDesign/myHomePage";
import { homeRouterKeyValue } from "../publicConfig";

@Component({
  name: 'ToDoWorks',
  components: {
    ATable: Table
  }
})
export default class ToDoWorks extends Vue {
  @Prop() workflowType!:string;
  @Prop() keywords!:string;
  @Prop() nodeName!:string;
  @InjectReactive('project') projectCode!:string;
  loading: boolean = false;
  obj:any ={}
  tableData: ToDoWorksItem[] = [];
  tableColumns: TableColumn<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      scopedSlots: { customRender: 'index'}
      //@ts-ignore
      // customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '项目名称',
      dataIndex: 'engineeringName',
      key: 'engineeringName'
    },
    {
      title: '任务名称',
      dataIndex: 'workflowName',
      key: 'workflowName',
      scopedSlots: { customRender: 'workflowName'}
    },
    {
      title: '项目经理',
      dataIndex: 'projectManager',
      key: 'projectManager',
      width: 120
    },
    {
      title: '当前节点',
      dataIndex: 'activityName',
      key: 'activityName',
      width: 120,
      scopedSlots: { customRender: 'activityName'}
    },
    {
      title: '发起时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 220
    },
    {
      title:"停留时间",
      dataIndex:"",
      width: 180,
      //@ts-ignore
      customRender:(text:string, record, index:number)=>{
        return Utils.calcUsedTime(record.startTime);
      }
    },
  ];
  pageNum: number = 1;
  pageSize: number = 20;
  curTotal: number = 0;
  tableKey: number = 1;
  paginationChange(page: number, pageSize: number) {
    this.pageNum = page;
    this.pageSize = pageSize;
    this.getToDoWorks();
  }
  getToDoWorks() {
    this.tableData = [];
    // this.tableData = exampleData.response.data.toDoList as ToDoWorksItem[]
    this.loading = true;
    queryMyWorkItemsNewV3({
      appCode: this.projectCode??'',
      pageSize: this.pageSize,
      pageNum: this.pageNum,
      type: this.workflowType??'',
      searchName: this.keywords??'',
      activityName: this.nodeName??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.curTotal = res.data.totalHits;
      this.tableData = res.data.hits;
    }).finally(()=> {
      this.loading = false
    })
  }
  toWorksRowClick(record) {
    return {
      on: {
        click: () => {
          if (!record.pendingType) return;
          if (record.pendingType==='wlzl') {
            Utils.goForm(this,'edit',null,this.isDingTalk,record.extendId,record.workflowCode)
          }else {
            this.$router.push({
              name: homeRouterKeyValue[record.pendingType],
              query: {
                projectId: record.projectId,
                id: record.extendId
              }
            });
          }
        }
      }
    }
  }
  created() {
    this.getToDoWorks();
  }
}
</script>

<style lang='less' scoped>
@import '../../../styles/public.module.less';
@import '../../../styles/table.modules.less';
.to-do-works{
}
</style>
