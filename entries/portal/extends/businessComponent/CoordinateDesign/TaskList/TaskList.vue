<template>
  <div class="TaskListWrap flex flex-column">
    <div class="headerTitle">
      <img src="../../../../src/assets/extends/coordinate/项目信息.png" style="padding: 0 10px" alt="">
      <span>专业任务划分</span>
    </div>
    <div class="taskListContent flex-1 flex flex-column">
      <div class="taskTitle">
        <span v-for="(v,i) in titleList" :key="i" @click="goTo(i)">
          <span v-if="i!==0"> > </span>
          {{ v }}
        </span>
      </div>
      <div class="taskListContentHeader clearfix">
        <div class="actions left">
          <a-button @click="addButton" class="button" type="primary">新增</a-button>
          <a-button @click="refreshButton" class="button" type="primary">刷新</a-button>
          <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteButton">
            <a-button class="button" type="danger">删除</a-button>
          </a-popconfirm>
          <!--          <a-button @click="deleteQualification" class="button" type="primary">导入</a-button>-->
        </div>
        <div class="right extra flex">
          <div class="flex-center-align" v-if="stateNum===0">
            <span style="margin: auto 5px">工程分类</span>
            <a-select v-model="industryDefault" @change="changeIndustry" style="width:200px">
              <a-select-option
                v-for="(v,i) in industryTypeList"
                :key="i"
                :value="v"
                :title="v">{{ v }}
              </a-select-option>
            </a-select>
          </div>
          <div class="flex-center-align" v-if="stateNum===0">
            <span style="margin: auto 5px">工程阶段</span>
            <a-select v-model="taskDefault" @change="changeTask" style="width:200px">
              <a-select-option v-for="(v,i) in taskNameList" :key="i" :value="v" :title="v">{{ v }}
              </a-select-option>
            </a-select>
          </div>
          <div class="flex-center-align" v-if="stateNum===2">
            <span style="margin: auto 5px">设计任务类型</span>
            <a-select v-model="taskTypeDefault" @change="changeTaskType" style="width:200px">
              <a-select-option v-for="(v,i) in taskTypeList" :key="i" :value="v" :title="v">{{ v }}
              </a-select-option>
            </a-select>
          </div>
        </div>
      </div>
      <div class="clearfix flex-1">
        <a-table
          size="small"
          rowKey="id"
          class="table-content-scroll"
          :columns="tableColunms"
          :scroll="{ y: 750 }"
          :loading="tableDataLoading"
          :dataSource="tableData"
          :customRow="rowClick"
          :rowClassName="setRowClass"
          :pagination="false"
          bordered>
          <template slot="fileName" slot-scope="t,r">
            <a-tooltip>
              <template slot="title">
                <div>单击预览</div>
                <div>双击下载</div>
              </template>
              <a @click="previewUrl(r.previewUrl)" @dblclick="downloadUrl(r.downloadUrl)">{{ r.attachmentName }}</a>
            </a-tooltip>
          </template>
          <template v-slot:operation="record">
            <a v-if="stateNum===0" style="color: #08ad99" @click="goTo(1,record)">进入</a>
            <a v-else-if="stateNum===1" style="color: #08ad99" @click="goTo(2,record)">进入</a>
          </template>
          <template slot="dataHeaderManage" slot-scope="t,r">
            <a @click.stop="editRow(r.id)">编辑</a>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.css";
import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';

import * as Api from "../../../service/api";
import env from '@/config/env';
import {listApi} from '@cloudpivot/api';
import Utils from "../../../utils";

@Component({
  name: "TaskList",
  components: {
    AButton: Button, ATable: Table, ASelect: Select, ASelectOption: Select.Option,
    APopconfirm: Popconfirm,
    ATooltip: Tooltip
  },
})
export default class TaskList extends Vue {
  @InjectReactive("project") projectCode?: string;

  tableData: Array<any> = [];
  tableDataLoading: boolean = false;
  consData: Array<any> = [];
  tableColunms: Array<any> = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      //@ts-ignore
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '工程分类',
      dataIndex: 'industryType',
      key: 'industryType',
    },
    {
      title: '工程类型',
      dataIndex: 'projectType',
      key: 'projectType',
    },
    {
      title: '工程阶段',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: '操作',
      key: 'operation',
      width: 80,
      scopedSlots: {customRender: 'operation'},
    }
  ];
  titleList: Array<string> = ['所有行业工程阶段'];
  stateNum: number = 0;
  currentRow: any = null;
  firstSelect: any = {};
  secondSelect: any = {};
  industryTypeList: string[] = ['全部'];
  taskNameList: string[] = ['全部'];
  taskTypeList: string[] = ['全部'];
  industryDefault: string = '全部';
  taskDefault: string = '全部';
  taskTypeDefault: string = '全部';
  editRow(id:string) {
    Utils.goForm(this,'edit',null,this.isDingTalk,id,'XTSJ_rwdbzk')
  }
  mounted() {
    this.getTaskSheetStandardLibraryList()
  }

  addButton() {
    // const token = localStorage.getItem("token");
    const addFormQuery = {
      schemaCode: `${this.projectCode}_rwdbzk`,
      sheetCode: `${this.projectCode}_rwdbzk`,
      queryCode: `${this.projectCode}_rwdbzk`,
      return:`${this.$route.fullPath}&iframeAction=add`,
      iframeAction: 'add',
    }
    Utils.goForm(this,'add',addFormQuery,this.isDingTalk)
    // window.open(`${env.portalHost}/form/detail?schemaCode=${this.projectCode ?? 'XTSJ'}_rwdbzk&sheetCode=${this.projectCode ?? 'XTSJ'}_rwdbzk&queryCode=${this.projectCode ?? 'XTSJ'}_rwdbzk&access_token=${token}`)
  }

  changeIndustry(v) {
    this.industryDefault = v;
    if (v === '全部') {
      this.tableData = this.consData;
    } else {
      this.tableData = [];
      this.consData.forEach(item => {
        if (item.industryType === v) {
          this.tableData.push(item)
        }
      })
    }
  }

  changeTask(v) {
    this.taskDefault = v;
    if (v === '全部') {
      this.tableData = this.consData;
    } else {
      this.tableData = [];
      this.consData.forEach(item => {
        if (item.taskName === v) {
          this.tableData.push(item)
        }
      })
    }
  }

  changeTaskType(v) {
    this.taskTypeDefault = v;
    if (v === '全部') {
      this.tableData = this.consData;
    } else {
      this.tableData = [];
      this.consData.forEach(item => {
        if (item.taskType === v) {
          this.tableData.push(item)
        }
      })
    }
  }

  deleteButton() {
    if (!this.currentRow) return this.$message.warn('请选择行！')
    listApi.deleteListData({
      ids: [this.currentRow.id],
      schemaCode: `${this.projectCode ?? ""}_rwdbzk`
    }).then(res => {
      console.log('deleteListData', res);
      if (res.errcode === 0) {
        if(res.data.errorCount > 0){
          this.$message.warn('该用户没有删除权限');
        }else{
          this.$message.success(res.errmsg as string);
          this.refreshButton()
        }
      } else {
        this.$message.warn(res.errmsg as string)
      }
    })
  }

  getTaskSheetStandardLibraryList(v?: any) {
    this.industryTypeList = ['全部'];
    this.taskNameList = ['全部'];
    this.taskTypeList = ['全部'];
    if (this.stateNum === 0) {
      this.tableColunms = [
        {
          title: '序号',
          dataIndex: 'index',
          key: 'index',
          width: 80,
          //@ts-ignore
          customRender: (text, record, index) => `${index + 1}`,
        },
        {
          title: '工程分类',
          dataIndex: 'industryType',
          key: 'industryType',
        },
        {
          title: '工程类型',
          dataIndex: 'projectType',
          key: 'projectType',
        },
        {
          title: '工程阶段',
          dataIndex: 'taskName',
          key: 'taskName',
        },
        {
          title: '操作',
          key: 'operation',
          width: 80,
          scopedSlots: {customRender: 'operation'},
        }
      ];
    } else if (this.stateNum === 1) {
      this.tableColunms = [
        {
          title: '序号',
          dataIndex: 'index',
          key: 'index',
          width: 80,
          //@ts-ignore
          customRender: (text, record, index) => `${index + 1}`,
        },
        {
          title: '专业任务名称',
          dataIndex: 'taskName',
          key: 'taskName',
        },
        {
          title: '操作',
          key: 'operation',
          width: 80,
          scopedSlots: {customRender: 'operation'},
        }
      ];
      this.firstSelect = v;
    } else if (this.stateNum === 2) {
      this.tableColunms = [
        {
          title: '序号',
          dataIndex: 'index',
          key: 'index',
          width: 80,
          //@ts-ignore
          customRender: (text, record, index) => `${index + 1}`,
        },
        {
          title: '设计任务类型',
          dataIndex: 'taskType',
          key: 'taskType',
        },
        {
          title: '设计任务名称',
          dataIndex: 'taskName',
          key: 'taskName',
        },
        {
          title: '标准模板',
          dataIndex: 'attachmentName',
          key: 'attachmentName',
          scopedSlots: { customRender: 'fileName'}
        },
        {
          title: '编辑',
          dataIndex: 'dataHeaderManage',
          key: 'dataHeaderManage',
          scopedSlots: { customRender: 'dataHeaderManage'},
          width: 80,
        }
      ];
      this.secondSelect = v;
    }
    this.tableData = [];
    this.consData = [];
    this.tableDataLoading = true;
    Api.getTaskSheetStandardLibraryList({
      appCode: this.projectCode ?? '',
      pid: v ? v.id : ''
    }).then(res => {
      if (res.errcode === 0) {
        this.tableData = res.data;
        this.consData = res.data;
        res.data.forEach(item => {
          if (this.taskNameList.indexOf(item.taskName) === -1) {
            this.taskNameList.push(item.taskName as string)
          }
          if (this.industryTypeList.indexOf(item.industryType) === -1) {
            this.industryTypeList.push(item.industryType as string)
          }
          if (this.taskTypeList.indexOf(item.taskType) === -1) {
            this.taskTypeList.push(item.taskType as string)
          }
        })
      }
    }).finally(()=> {
      this.tableDataLoading = false
    })
  }

  goTo(v: number, record?: any) {
    this.taskDefault='全部';
    this.taskTypeDefault='全部';
    this.industryDefault='全部';
    this.stateNum = v;
    if (v === 0) {
      this.titleList = ['所有行业工程阶段']
      this.getTaskSheetStandardLibraryList();
    } else if (v === this.titleList.length) {
      if(record.industryType){
        this.titleList.push(record.industryType + '-' + record.taskName);
      }else {
        this.titleList.push( record.taskName);
      }
      this.getTaskSheetStandardLibraryList(record);
    } else {
      const title = this.titleList;
      this.titleList = [];
      title.forEach((item, i) => {
        if (i <= v) {
          this.titleList.push(item)
        }
      })
      if(v===1){
        this.getTaskSheetStandardLibraryList(this.firstSelect)
      }
    }
  }

  refreshButton() {
    let val: any = null;
    if (this.stateNum === 1) {
      val = this.firstSelect
    } else if (this.stateNum === 2) {
      val = this.secondSelect
    }
    this.getTaskSheetStandardLibraryList(val)
  }

  rowClick(record, index) {
    return {
      on: {
        click: () => {
          if (this.currentRow && record.id===this.currentRow.id) {
            this.currentRow = null
          }else {
            this.currentRow = record;
          }
        }
      }
    };
  }

  setRowClass(record, index) {
    return record === this.currentRow ? "clickRowStyl" : '';
  }
  //url
  timeFn: any = null;
  previewUrl(url: string) {
    clearTimeout( this.timeFn );
    this.timeFn = setTimeout(()=> {
      if (!url) return this.$message.warning('暂无预览地址！')
      window.open(url)
    },300)
  }
  downloadUrl(url: string) {
    clearInterval( this.timeFn );
    if (!url) return this.$message.warning('暂无下载地址！')
    window.open(url)
  }
}
</script>

<style lang="less" scoped>
@import "../../../styles/public.module.less";
@import "../../../styles/table.modules.less";
//@import
//@import url("./index.less");
.TaskListWrap {
  width: 100%;
  height: 100%;
  .overflow-hidden;
  //padding: 20px;
  //background-color: #f1f2f6;
}

.headerTitle {
  font-size: 18px;
  font-family: Source Han Sans CN;
  font-weight: bold;
  color: #FFFFFF;
}

.taskListContent {
  margin-top: 20px;
  padding: 10px;
  background-color: #fff;

  .taskTitle {
    height: 40px;
    line-height: 40px;
    font: 16px;
    font-weight: bold;
    cursor: pointer;

    & > span:first-child {
      font-weight: normal;
    }
  }
}

.taskListContentHeader {
  margin-bottom: 20px;

  .actions {
    & > :not(:last-child) {
      margin-right: 10px;
    }
  }

  .extra {
    span {
      //margin-right: 20px;
    }

    .search {
      width: 300px;
    }
  }

}

//form-item
/deep/ .ant-form-item {
  margin-bottom: 0;

  .ant-form-item-label,
  .ant-form-item-control-wrapper {
    display: inline-block;
  }

  .ant-form-item-label {
    width: 100px;
    padding-left: 10px;
    vertical-align: top;
  }

  .ant-form-item-control-wrapper {
    width: calc(100% - 100px);
  }
}

.rowFlexWrap {
  display: flex;
  flex-flow: row wrap;

  .rowFlexItem {
    width: 50%;
  }
}
/*Table style*/
/deep/ .ant-table-wrapper {
  .ant-table {
    .ant-table-body {
      overflow-y: auto !important;
      margin: 0;

      & > table > .ant-table-tbody > tr > td {
        padding: 9px 8px;
        // border-bottom: unset;
        color: #717375;
      }
    }

    .ant-table-hide-scrollbar {
      //margin-bottom: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    }
  }
}

/deep/ .ant-table-small {
  // border: unset;
  table {
    border-collapse: collapse;
  }

  .ant-table-thead {
    & > tr {
      background-color: #fff !important;
    }

    & > tr > th {
      position: relative;
      font-weight: 700;
      border-right: 0 !important;
      border-bottom: unset;
      padding: 12px;
      // background-color: #f2f2f4!important;
      color: #717375;

      &:not(:last-child):after {
        position: absolute;
        top: 50%;
        right: 0;
        height: 100%;
        width: 1px;
        transform: translateY(-50%);
        content: "";
        border-right: 1px solid #e8e8e8;
      }
    }
  }
}

/deep/ .ant-pagination {
  margin: 10px 10px 2px 0;
}

/deep/ .customHeaderCellA {
  background-color: #ecf2fd !important;
}

/deep/ .customHeaderCellB {
  background-color: #e1e1fc !important;
}

.left {
  float: left;
}

.right {
  float: right;
}

.clearfix:before,
.clearfix:after {
  content: "";
  display: table;
}

.clearfix:after {
  clear: both;
  overflow: hidden;
}

.clearfix {
  *zoom: 1;
}

/deep/ .ant-table-wrapper {
  min-height: 70vh;
}

/deep/ .ant-table-small.ant-table-bordered .ant-table-placeholder {
  min-height: 70vh;
}

/deep/ .clickRowStyl {
  background-color: #bce7f6;
}
</style>
