<template>
  <div class="main">
    <!--  模型页面，可参照此页面基本结构 -->
    <a-card title="进度偏差分析" class="box">
      <a-table
        v-if="tableData.length!==0"
        :columns="tableLabel"
        :data-source="tableData"
        :defaultExpandedRowKeys="expandedTableKeys"
        childrenColumnName="childs"
        rowKey="id"
        :indentSize="20"
        @expand="expandRows"
      >
        <template slot="操作" slot-scope="record">
          <a @click="() => handleEdit(record)" v-if="record.progressState==='预警'||record.progressState==='滞后'">纠偏</a>
          <a style="color: grey" v-else>纠偏</a>
        </template>
        <template slot="progressState" slot-scope="record">
          <span v-if="record==='预警'" style="color:rgba(241,181,0,1)">预警</span>
          <span v-else-if="record==='滞后'" style="color:rgba(255,0,66,1)">滞后</span>
          <span v-else-if="record==='进行中'" style="color:rgba(55,126,255,1)">进行中</span>
          <span v-else-if="record==='已完工'" style="color:rgba(38,201,116,1)">已完工</span>
          <span v-else style="color:rgba(255,255,255,0.3)">未开工</span>
        </template>
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
  name: "scheduleDeviationAnalysis",
  components: {
    ACard: Card,
    ATable: Table,
    ScheduleDeviationDetail
  }
})
export default class scheduleDeviationAnalysis extends Vue {
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
      key: "remarks",
      dataIndex: "remarks",
    },
    {
      align: "center",
      title: "预警状态",
      key: "progressState",
      dataIndex: "progressState",
      scopedSlots: {customRender: "progressState"}
    },
    {
      align: "center",
      title: "发生时间",
      key: "modifiedTime",
      dataIndex: "modifiedTime",
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      scopedSlots: {customRender: "操作"}
    },
  ];
  // detailShow: boolean = false;
  // formData: any = {};
  expandedTableKeys: Array<string> = [];

  mounted() {
    this.deviationAnalysisTree();
  }

  deviationAnalysisTree() {
    this.expandedTableKeys = [];
    this.tableData = [];
    OAuthApi.deviationAnalysisTree({
      projectCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    })
      .then(res => {
        if (res.errcode !== 0) return
        this.tableData = res.data.nodes??[];
        for (let i = 0; i < this.tableData.length; i++) {
          this.expandedTableKeys.push(this.tableData[i].id)
        }
      })
  }

  handleEdit(record) {
    this.$router.push({
        path: "/scheduleDeviationDetail",
        query: {
          data: record,
          type: 'add'
        }
      }
    );
  }

  // 点击展开图标时触发
  expandRows(expanded, record) {
    this.getChildTree(record);
  }

  //获取子节点
  getChildTree(c) {
    let _this = this
    return new Promise((resolve) => {
      if (c.childs !== undefined && c.childs.length != 0) { // 有值了直接渲染
        //@ts-ignore
        resolve()
        return
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      OAuthApi.deviationAnalysisTree({
        projectCode: this.projectCode ?? '',
        nodeId: c.id,
        projectName: this.projectConfig?.projectName ?? ''
      })
        .then((res) => {
          c["childs"] = res.data.nodes;
          this.editListTree(_this.tableData, c.id, c);
        })
      //@ts-ignore
      resolve()
    })
  }

  /**
   *遍历多棵树（编辑节点）
   *data  多棵树
   *key   关键字
   */
  editListTree(data, key, value) {
    var flag = false
    for (let i = 0; i < data.length; i++) {
      if (flag) {
        break
      } else {
        if (data[i].key === key) {
          data[i] = value;
          flag = true
          break
        } else {
          this.editTree(data[i], key, flag, value)
        }
      }
    }
  }

  /**
   *遍历多棵树（编辑节点）
   *data  单数
   *key   关键字
   */
  editTree(data, key, flag, value) {
    if (data.childs && data.childs.length > 0) {
      for (let i = 0; i < data.childs.length; i++) {
        if (flag) {
          break
        } else {
          if (data.childs[i].id === key) {
            data.childs[i] = value;
            flag = true
            return
          } else {
            this.editTree(data.childs[i], key, flag, value)
          }
        }
      }
    }
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
    overflow-y: auto;
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
