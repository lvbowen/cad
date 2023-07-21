<template>
  <div class="chapter-list line-table-header">
    <div class="flex flex-center-align">
      <span class="line"></span>章节清单</div>
    <div class="flex flex-center-align btn">
      <a-button type="primary" @click="createDesignSpecificationSubTask" v-if="showCreateChapter">一键下发</a-button>
    </div>
    <a-table
      :key="tableKey"
      :columns="chapterColumns"
      :data-source="chapterListData"
      :pagination="false"
      :loading="tableLoading"
      rowKey="id"
      :defaultExpandAllRows="true">
      <template #paraId="text,record,index">
        <div>{{ !text?'':text.sortNum }}</div>
      </template>
      <template #professionTaskId="text,record,index">
        <div class="permit" :class="showCreateChapter?'':'no-permit'" @click="showCreateChapter && (!record.designTaskId || (record.designTaskId && !['PROCESSING','COMPLETED','CANCELED'].includes(record.designTaskId.sequenceStatus)) )?openRelevanceTable(index):''">{{ !text?'':Array.isArray(text.profession_manager ) && text.profession_manager.length?text.profession_manager[0].name:'' }}</div>
      </template>
      <template slot="designPerson" slot-scope="t,r">
        <staff-selector
          :options="personOptions"
          :disabled="!showCreateChapter || (r.designTaskId && ['PROCESSING','COMPLETED','CANCELED'].includes(r.designTaskId.sequenceStatus))"
          @change="(val)=>onValueChangePermission(val,r.id)"
          :value="t"/>
      </template>
      <template #designTaskId="text,record,index">
        <a v-if="text" @click="toDesignTaskById(text.id,text.schemaCode)" :class="text.sequenceStatus==='PROCESSING'?'base-color':text.sequenceStatus==='COMPLETED'?'success-color':''">{{ displaySequenceStatus(text.sequenceStatus) }}</a>
        <!--        <a v-else-if="showCreateChapter" @click="updateDesignSpecificationParagraph(record.id,record.professionTaskId && record.professionTaskId.id,Array.isArray(record.designPerson) && record.designPerson.length?record.designPerson[0].id:'')">确认</a>-->
      </template>
    </a-table>
    <manager-table-modal
      :projectId="projectId"
      :showRelevanceTable="showRelevanceTable"
      @closeRelevanceModal="closeRelevanceModal"
      @bindPerson="bindPerson"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Watch, InjectReactive} from 'vue-property-decorator';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import StaffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import {TableColumn} from "../../../../../type";
import {exampleData} from "../../../../engineeringArchives/mock";
import Utils from "../../../../../utils";
import ManagerTableModal from "./ManagerTableModal.vue";
import { updateDesignSpecificationParagraph,createDesignSpecificationSubTask} from "../../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignTask";

@Component({
  name: 'ChapterList',
  components: {
    ATable: Table,
    AButton: Button,
    StaffSelector,
    ManagerTableModal
  }
})
export default class ChapterList extends Vue {
  @InjectReactive("project") appCode!: string;
  @Prop({required:true}) sjrwdId!: string;
  @Prop() showCreateChapter!: boolean;
  @Prop() projectId!:string;
  @Prop() formDataChapter!:any[];
  @Watch('formDataChapter',{ immediate:true})
  formDataChapterListener(val) {
    if(val&& Array.isArray(val) && val.length) {
      // console.log(val,'val')
      this.chapterListData = val;
      // this.tableKey++
    }
  }
  chapterColumns: TableColumn<any>[] = [
    {
      title: '章节选择',
      dataIndex: 'paraId',
      key: 'paraId',
      width: 100,
      align: 'center',
      scopedSlots: { customRender: 'paraId'}
    },
    {
      title: '章节标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '专业负责人',
      dataIndex: 'professionTaskId',
      key: 'professionTaskId',
      width: 200,
      scopedSlots: { customRender: 'professionTaskId'}
    },
    {
      title: '设计人',
      dataIndex: 'designPerson',
      key: 'designPerson',
      width: 200,
      scopedSlots: { customRender: 'designPerson'}
    },
    {
      title: '相关设计任务',
      dataIndex: 'designTaskId',
      key: 'designTaskId',
      align: 'center',
      scopedSlots: { customRender: 'designTaskId' }
    }
  ];
  chapterListData: any[] = [];
  tableKey: number = 1;
  tableLoading: boolean = false;
  personOptions: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title: '人员单选',
    nonExistentAppCode: true
  };
  onValueChangePermission(val,id:string) {
    // console.log('2222222',val)
    this.chapterListData.map((item) => {
      if(item.id === id) {
        item.designPerson = val;
      }
    })
  }
  projectCode: string = '';
  toDesignTaskById(id: string,schemaCode:string) {
    this.projectCode = this.appCode??'';
    Utils.goForm(this,'edit',null,this.isDingTalk,id,schemaCode)
    // this.$router.push({
    //   name:"ProfessionalDesignTask",
    //   query:{
    //     // projectId: projectId,
    //     projectId: '982e52256e3d4f369c366934ac62e5b5',
    //     // id:id//此处其实是传的设计任务单ID
    //     id: 'ee8586cad9334127b07185c09dbf5882'
    //   }
    // })
    // this.$emit('getDesignTaskById')
  }
  //关联专业负责人
  showRelevanceTable: boolean = false;
  selectedRowIndex: number = -1;
  openRelevanceTable(rowIndex:number) {
    this.selectedRowIndex = rowIndex;
    this.showRelevanceTable = true
  }
  closeRelevanceModal() {
    this.selectedRowIndex = -1;
    this.showRelevanceTable = false;
  }
  bindPerson(data:any) {
    this.$emit('upBindPerson',{data:data,selectedRowIndex:this.selectedRowIndex})
  }
  updateDesignSpecificationParagraph(id:string,professionTaskId:string,designPersonId) {
    // console.log(id,professionTaskId,designPersonId)
    if(!professionTaskId) return this.$message.warning('专业负责人不能为空！')
    if(!designPersonId) return this.$message.warning('设计人不能为空！')
    updateDesignSpecificationParagraph({
      appCode: this.appCode??'',
      id: id,
      professionTaskId: professionTaskId,
      designPerson: designPersonId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.$message.success('确认成功！')
    })
  }
  createDesignSpecificationSubTask() {
    // createDesignSpecificationSubTask({
    //   appCode: this.appCode??'',
    //   id: this.sjrwdId
    // }).then((res)=> {
    //   if(res.errcode!==0) return this.$message.error(res.errmsg as string)
    //   if(!res.data) return;
    //   this.$message.success('下发成功！')
      this.$emit('createDesignSpecificationSubTask')
    // })
  }
  displaySequenceStatus(pop:string) {
    switch (pop) {
      case "DRAFT":
        return '草稿';
      case "PROCESSING":
        return '进行中';
      case "COMPLETED":
        return '已完成';
      case "CANCELED":
        return '已作废';
      default:
        return pop;
        break;
    }
  }
  mounted() {
    this.chapterListData = this.formDataChapter;
    // console.log(this.chapterListData,'111')
    this.tableKey++
  }
}
</script>

<style scoped lang="less">
@import '../../../../../styles/public.module.less';
@import '../../../../../styles/table.modules.less';
@import '../../../../systemConfig/system.module.less';
.chapter-list {
  font-size: 14px;
  font-family: Microsoft YaHei;
  font-weight: bold;
  color: #585859;
  .line {
    width: 2px;
    height: 14px;
    background: #256EFF;
    margin-right: @spacing-base;
  }
  .btn {
    margin: @spacing-base 0;
    .ant-btn {
      margin-right: @spacing-base;
    }
  }
}
.no-permit {
  color: rgba(0, 0, 0, 0.25);
  .disable;
}
.permit {
  border: 1px solid #d9d9d9;
  min-height: 32px;
  border-radius: 4px;
  position: relative;
  padding: 3px 5px 0 5px;
  line-height: 1.4em;
  .flex;
  .flex-center-align;
  .flex-center-justify;
  cursor: pointer;
}
</style>
