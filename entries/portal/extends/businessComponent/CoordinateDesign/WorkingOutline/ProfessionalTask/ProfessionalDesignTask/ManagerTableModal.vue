<template>
  <a-modal
    :visible="showRelevanceTable"
    title="关联表单"
    @ok="bind"
    :width="950"
    :destroyOnClose="true"
    class="manager-table-modal"
    @cancel="onModalCancel">
    <div class="flex flex-space-between">
      <div class="flex flex-center-align condition">
        <div class="flex flex-center-align">
          <span class="label-c">任务名称</span>
          <a-input-search
            placeholder="请输入任务名称"
            v-model="projectMajorKeyword"
            @pressEnter="enterSearch"
            @search="getDocumentList"></a-input-search>
        </div>
<!--        <div class="flex flex-center-align">-->
<!--          <span class="label-c">所属事业部</span>-->
<!--          <staff-selector-->
<!--            :options="depOptionsSingle"-->
<!--            :disabled="false"-->
<!--            @change="onValueChangeDep"-->
<!--            :value="depValue"/>-->
<!--        </div>-->
      </div>
      <a-button type="primary" @click="getRelevanceList">查询</a-button>
    </div>
    <div class="table-content-scroll flex-auto line-table-header">
      <a-table
        :key="num"
        rowKey="id"
        :data-source="lists"
        :columns="listsColumns"
        :scroll="{ y: 500 }"
        :loading="tableLoading"
        :customRow="customRow"
        :pagination="{
          pageSize: this.pageSize,
          total: this.curTotal,
          pageNum: this.pageNum,
          onChange: this.paginationChange
        }">
        <template slot="index" slot-scope="t,r,index">
          <template v-if="activeRadio === index+1 || selectedRadioIndex===index+1">
            <a-radio :value="radioChecked" @change="()=> changeRadioChecked(radioChecked=!radioChecked,index+1)"></a-radio>
          </template>
          <div v-else>{{ index+1 }}</div>
        </template>
<!--        <template slot="department_id" slot-scope="t,r">-->
<!--          {{ r.data.department_id[0] && r.data.department_id[0].name }}-->
<!--        </template>-->
        <template slot="profession_manager" slot-scope="t,r">
          {{ r.data.profession_manager[0] && r.data.profession_manager[0].name }}
        </template>
        <template slot="profession_name" slot-scope="t,r">
          {{ r.data.profession_name }}
        </template>
        <template slot="plan_start_time" slot-scope="t,r">
          {{ r.data.plan_start_time }}
        </template>
        <template slot="plan_end_time" slot-scope="t,r">
          {{ r.data.plan_end_time }}
        </template>
        <template slot="plan_duration" slot-scope="t,r">
          {{ r.data.plan_duration }}
        </template>
      </a-table>
    </div>
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
import Radio from 'ant-design-vue/lib/radio';
import 'ant-design-vue/lib/radio/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import {TableColumn} from "../../../../../type";
import {getTableList, } from "../../../../../service/api";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
@Component({
  name: 'RelevanceTable',
  components: {
    AModal: Modal,
    AInputSearch: Input.Search,
    ATable: Table,
    ARadio: Radio,
    AButton: Button,
    staffSelector
  }
})
export default class ManagerTableModal extends Vue {
  @Prop() projectId!:string;
  @Prop() showRelevanceTable!:boolean;
  @Watch('showRelevanceTable',{ immediate: true})
  showModalListener(val){
    if(val) {
      this.pageNum = 0;
      this.selectedRadioIndex = -1;
      this.getRelevanceList()
    }
  }
  onModalCancel() {
    this.$emit('closeRelevanceModal')
  }
  //table
  num: number = 1;
  lists: any[] = [];
  listsColumns: TableColumn<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      scopedSlots: {customRender: 'index'},
    },
    {
      title: '任务名称',
      dataIndex: 'profession_name',
      key: 'profession_name',
      scopedSlots: {customRender: 'profession_name'}
    },
    // {
    //   title: '所属事业部',
    //   key: 'department_id',
    //   scopedSlots: {customRender: 'department_id'},
    //   align: 'center'
    // },
    {
      title: '专业负责人',
      key: 'profession_manager',
      scopedSlots: {customRender: 'profession_manager'},
      align: 'center',
      width: 120
    },
    {
      title: '计划开始日期',
      dataIndex: 'plan_start_time',
      key: 'plan_start_time',
      scopedSlots: {customRender: 'plan_start_time'}
    },
    {
      title: '计划结束日期',
      dataIndex: 'plan_end_time',
      key: 'plan_end_time',
      scopedSlots: {customRender: 'plan_end_time'}
    },
    {
      title: '计划工期',
      dataIndex: 'plan_duration',
      key: 'plan_duration',
      scopedSlots: {customRender: 'plan_duration'}
    }
    // {
    //   title: '从事专业',
    //   key: 'major',
    //   scopedSlots: {customRender: 'major'},
    //   align: 'center',
    //   width: 150
    // },
    // {
    //   title: '所属角色',
    //   key: 'job',
    //   scopedSlots: {customRender: 'job'},
    //   align: 'center'
    // }
  ];
  tableLoading: boolean = false;
  pageNum: number = 0;
  pageSize: number = 10;
  curTotal: number = 0;
  paginationChange(page: number, pageSize: number) {
    this.pageNum = page-1;
    this.pageSize = pageSize;
    this.radioChecked = false;
    this.selectedRadioIndex = -1;
    this.getRelevanceList();
  }
  getRelevanceList() {
    this.tableLoading = true;
    this.lists = []
    getTableList({
      filters: [
        {
          "propertyCode": "profession_name",
          "propertyType": 0,
          "propertyValue": this.projectMajorKeyword,
          "propertyValueName": ''
        },
        {
          "propertyCode": "xmlb_id",
          "propertyType": 0,
          "propertyValue": this.projectId??'',
          "propertyValueName": ''
        }
      ],
      mobile:false,
      page: this.pageNum,
      queryCode: 'XTSJ_zyrwd',
      schemaCode: 'XTSJ_zyrwd',
      size: this.pageSize //0
      // //res
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.lists = res.data?.content??[];
      this.curTotal = res.data?.totalElements??0;
    }).finally(()=> {
      this.tableLoading = false;
    })
  }
  //单选
  activeRadio: number|null = null;
  radioChecked: boolean = false;
  customRow(record, index) {
    return {
      on: {
        // 鼠标移入
        mouseenter: (event) => {
          this.activeRadio=index+1
        },
        mouseleave: (event)=> {
          this.activeRadio=null
        }
      }
    }
  };
  selectedRadioIndex: number = -1;
  changeRadioChecked(isChecked:boolean,selectedIndex: number) {
    this.radioChecked = isChecked;
    this.selectedRadioIndex = selectedIndex
  }
  //search
  projectMajorKeyword: string = '';
  enterSearch(e) {
    this.projectMajorKeyword = e.target.value;
    this.pageNum = 0;
    this.radioChecked = false;
    this.selectedRadioIndex = -1;
    this.getRelevanceList();
  }
  getDocumentList(keyword) {
    this.projectMajorKeyword = keyword;
    this.pageNum = 0;
    this.radioChecked = false;
    this.selectedRadioIndex = -1;
    this.getRelevanceList();
  }
  //部门单选
  depValue: any[] = [];
  depOptionsSingle:any = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title: '部门选择'
  };
  onValueChangeDep(val) {
    this.depValue = val
  }
  //bind
  bind() {
    if(this.selectedRadioIndex!==-1) {
      this.$emit('bindPerson',this.lists[this.selectedRadioIndex-1].data);
      this.onModalCancel();
    }else {
      this.$message.warning('请先选择！')
    }
  }
}
</script>

<style scoped lang="less">
@import '../../../../../styles/public.module.less';
.manager-table-modal {
  .condition {
    margin-bottom: @spacing-base;
    >div {
      margin-right: @spacing-large;
      .label-c {
        word-break: keep-all;
        margin-right: @spacing-base;
      }
    }
  }
}
</style>
