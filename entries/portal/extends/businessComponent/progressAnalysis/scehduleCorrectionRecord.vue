<template>
  <div class="main">
    <!--  模型页面，可参照此页面基本结构 -->
    <a-card title="进度纠偏记录" class="box">
      <a-table
        :columns="tableLabel"
        :data-source="tableData"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
      >
        <template slot="操作" slot-scope="record">
          <a @click="handleEdit(record,'detail')">查看|</a>
          <a @click="handleEdit(record,'edit')">编辑|</a>
          <a @click="deleteRow(record)">删除</a>
        </template>
        <!--        <template slot="progressState" slot-scope="record">-->
        <!--          <span v-if="record==='预警'" style="color:rgba(241,181,0,1)">预警</span>-->
        <!--          <span v-else-if="record==='滞后'" style="color:rgba(255,0,66,1)">滞后</span>-->
        <!--          <span v-else-if="record==='进行中'" style="color:rgba(55,126,255,1)">进行中</span>-->
        <!--          <span v-else-if="record==='已完工'" style="color:rgba(38,201,116,1)">已完工</span>-->
        <!--          <span v-else style="color:rgba(255,255,255,0.3)">未开工</span>-->
        <!--        </template>-->
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import {Card, Table,} from "@h3/antd-vue";

import OAuthApi from "@/apis/oauth";
import * as Type from '../../type';
import ScheduleDeviationDetail from './scheduleDeviationDetail.vue'

@Component({
  name: "scehduleCorrectionRecord",
  components: {
    ACard: Card,
    ATable: Table,
    ScheduleDeviationDetail
  }
})
export default class scehduleCorrectionRecord extends Vue {
  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  tableData: Array<any> = [];
  tableLabel: Array<any> = [
    {
      align: "center",
      width: '30%',
      title: "工程部位",
      key: "planDetailName",
      dataIndex: "planDetailName",
    },
    {
      align: "center",
      title: "所属类型",
      key: "type",
      dataIndex: "type",
    },
    {
      align: "center",
      title: "纠偏人",
      key: "creater",
      dataIndex: "creater",
      scopedSlots: {customRender: "creater"}
    },
    {
      align: "center",
      title: "发生时间",
      key: "deviationDate",
      dataIndex: "deviationDate",
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      scopedSlots: {customRender: "操作"}
    },
  ];

  pagination = {
    pageSize: 20, //每页中显示20条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["20", "50", "100", "200"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };

  mounted() {
    this.deviationAnalysisTree();
  }

  deviationAnalysisTree() {
    this.tableData = [];
    OAuthApi.deviationAnalysisPage({
      projectCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      pageNum: this.pagination.current,
      pageSize: this.pagination.pageSize
    })
      .then(res => {
        if (res.errcode !== 0) return
        this.tableData = res.data.records;
        this.pagination.total = res.data.total;
      })
  }

  //点击分页中数字时触发的方法
  handleTableChange(pagination) {
    this.pagination.current = pagination.current;
    this.pagination.pageSize = pagination.pageSize;
    this.deviationAnalysisTree();
  }

  handleEdit(record, type) {
    console.log('handleEdit', record)
    if (type === 'edit' && !record.isEdit) return this.$message.warn('该记录不可编辑')
    // @ts-ignore
    this.$router.push({
      path: "/scheduleDeviationDetail",
      query: {
        data: record,
        type: type
      }
    });
  }

  deleteRow(record) {
    console.log('deleteRow', record)
    if (!record.isDelete) return this.$message.warn('该记录不可删除');
    OAuthApi.deleteDeviationDetail({
      projectCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      scheduleDeviationdetail: record
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.warn('删除失败');
        this.deviationAnalysisTree();
      })
  }
}
</script>

<style lang="less" scoped>
@import (reference) "../../styles/theme.less";

.box {
  height: 100%;
  width: 100%;

  /deep/ .ant-table {
    .flex;
    flex: 1;
    flex-direction: column;
    height: calc(91vh - 165px);
  }
}

.main {
  .flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
}


.toprev {
  position: absolute;
  top: 2%;
  left: 0.1%;
  z-index: 999;
  cursor: pointer;
  font-size: 19px;
}

/deep/ .ant-card-head-title {
  font-size: 16px;
  font-weight: 500;
  color: #0a0a0a;
  padding-left: 5px !important;
  font-family: Source Han Sans CN;
}
</style>
