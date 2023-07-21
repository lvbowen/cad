<template>
  <div class="InventoryStatistics">
    <h3>库存统计</h3>
    <div class="InventoryStatistics_content">
      <div class="InventoryStatistics_left flex flex-column">
        <h4>物资种类</h4>
        <div class="eltree flex-1">
          <el-tree
            :expandOnClickNode="false"
            defaultExpandAll
            highlightCurrent
            :data="data"
            class="full-height flex-auto"
            :props="defaultProps"
            @node-click="handleNodeClick">
            <span class="custom-tree-node" slot-scope="{ data }">
              <img src="./img/1.png" alt="">
              <span>{{ data.taskName }}</span>
            </span>
          </el-tree>
        </div>
      </div>
      <div class="InventoryStatistics_right full-height">
        <div class="full-height flex flex-column">
          <h4>基本信息</h4>
          <div class="selectBtn">
            <!--<div class="search">
              <el-input v-model="search" size="mini" placeholder="输入关键字搜索" />
              <el-button slot="append" icon="el-icon-search"></el-button>
            </div>-->
            <div class="flex">
              <PayTypesPop @changePayType="changePayType"/>
              <el-button type="primary" @click="exportReserveDetail">导出</el-button>
              <el-button @click="warehousing" type="primary" :disabled="!isProjectLevel">新增入库</el-button>
              <el-button @click="warehouse" type="primary" :disabled="!isProjectLevel">新增出库</el-button>
              <el-button @click="refreshClick" type="primary" :disabled="!selectedId">刷新</el-button>
            </div>
          </div>
          <div class="eltable flex-1 flex flex-column">
            <el-table :data="tableData">
              <!-- <el-table-column type="selection" width="55"></el-table-column> -->
              <el-table-column type="index"> </el-table-column>
              <el-table-column prop="data.xmjc_1" label="项目名称"></el-table-column>
              <el-table-column prop="data.material_name" label="物资类型"></el-table-column>
              <el-table-column prop="data.code" label="物资编号"></el-table-column>
              <el-table-column prop="data.type" label="物资名称"></el-table-column>
              <el-table-column prop="data.specification" label="物资规格"></el-table-column>
              <el-table-column prop="data.unit" label="物资单位"></el-table-column>
              <el-table-column prop="data.value" label="当前库存量"></el-table-column>
              <el-table-column prop="data.payType" label="采购类型"></el-table-column>
              <el-table-column prop="address" label="操作">
                <template slot-scope="scope">
                  <a @click="toDetail(scope.row.data)">查看明细</a>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              layout="prev, pager, next"
              @current-change="handlerPage"
              :total="dataTotal"
              background
              :pageSize="pageSize"
              :currentPage="currentPage">
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    <el-dialog title="查看明细" :visible.sync="dialogTableVisible">
      <h5>物资信息</h5>
      <div class="information">
        <div>
          <span>物资名称：</span>
          <span>{{ materialName }}</span>
        </div>
        <div>
          <span>物资类型：</span>
          <span>{{ type }}</span>
        </div>
        <div>
          <span>物资编号：</span>
          <span>{{ code }}</span>
        </div>
        <div>
          <span>物资规格：</span>
          <span>{{ specification }}</span>
        </div>
        <div>
          <span>物资单位：</span>
          <span>{{ unit }}</span>
        </div>
        <div>
          <span>生产厂家：</span>
          <span>{{ industry }}</span>
        </div>
        <div>
          <span>联系人：</span>
          <span>{{ producer }}</span>
        </div>
        <div>
          <span>联系方式：</span>
          <span>{{ phone }}</span>
        </div>
      </div>
      <h5>库存明细</h5>
      <div class="inventory">
        <div>
          <span>总入库量：</span>
          <span>{{ totalSave }}{{ unit }}</span>
        </div>
        <div>
          <span>总出库量：</span>
          <span>{{ totalQuit }}{{ unit }}</span>
        </div>
        <div>
          <span>现库存量：</span>
          <span>{{ currentValue }}{{ unit }}</span>
        </div>
      </div>
      <el-table border height="450px" :data="gridData">
        <el-table-column type="index"> </el-table-column>
        <el-table-column property="type" label="出入库类型" width="120px"></el-table-column>
        <el-table-column property="code" label="单据编号"></el-table-column>
        <el-table-column property="handlePerson" label="签收人" width="100px"></el-table-column>
        <el-table-column property="createdTime" label="出入库时间"></el-table-column>
        <el-table-column property="value" label="出入库数量">
          <template slot-scope="scope">
            <span :class="scope.row.operateType==='出库'?'out-color':scope.row.operateType==='入库'?'in-color':''">{{ scope.row.value }}</span>
          </template>
        </el-table-column>
        <el-table-column property="current" label="当前库存数"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import Tree from "element-ui/lib/tree";
// import Input from "element-ui/lib/input";
import Dialog from "element-ui/lib/dialog";
import Pagination from 'element-ui/lib/pagination';
import { getListTree, getReserveDetail, getListData } from "./server/index.js"
import env from "@/config/env";
import Websocket from "../systemConfig/websocket_base";
import {getStockList,getReserveSchema,getTableList} from "../../service/api";
import PayTypesPop from "./PayTypesPop";

export default {
  components: {
    PayTypesPop,
    ElTree: Tree,
    // ElInput: Input,
    ElDialog: Dialog,
    ElPagination: Pagination
  },
  inject: ["projectConfig"],
  data() {
    return {
      dialogTableVisible: false,
      // search: "",
      gridData: [],
      tableData: [],
      data: [],
      defaultProps: {
        children: 'children',
        label: 'taskName'
      },
      projectName: "",
      projectCode: "",
      materialName: "",
      phone: "",
      unit: "",
      code: "",
      specification: "",
      totalSave: "",
      totalQuit: "",
      currentValue: "",
      producer: "",
      type: "",
      industry: "",
      selectedId:"",
      selectedCodeValue: '',
      socket:null,
      currentPage: 1,
      pageSize: 20,
      dataTotal: 0,
      exportBizForm: {
        saveSchemaCode: '',
        saveWorkflowCode: '',
        quitSchemaCode: '',
        quitWorkflowCode: '',
        payTypes: []
      },
      selectPayType: '',

    };
  },
  methods: {
    handleNodeClick(data) {
      this.selectedId = data.id;
      this.selectedCodeValue = data.codeValue;
      this.currentPage = 1;
      this.getStockList();
      // getListData(this.projectCode, this.projectName, this.projectCode + "_material_reserve", data.id, this.projectConfig.multiProjectFlag, data.codeValue, this.currentPage-1, this.pageSize).then(res => {
      //   this.dataTotal = res.data.totalElements
      //   this.tableData = res.data.content
      // })
    },
    toDetail(val) {
      this.dialogTableVisible = true
      getReserveDetail(this.projectCode, this.projectName, val.id).then(res => {
        this.materialName = res.data.materialName
        this.phone = res.data.phone
        this.unit = res.data.unit
        this.industry = res.data.industry
        this.code = res.data.code
        this.specification = res.data.specification
        this.totalSave = res.data.totalSave
        this.totalQuit = res.data.totalQuit
        this.currentValue = res.data.currentValue
        this.producer = res.data.producer
        this.type = res.data.type
        // res.data.details.forEach(e => {
        //   e.createdTime = e.createdTime.split(" ")[0]
        // });
        this.gridData = res.data.details
      })
    },
    getinit() {
      getListTree(this.projectCode, this.projectName, this.projectCode + "_material_reserve", this.projectConfig.multiProjectFlag).then(res => {
        if(res.errcode!==0) return this.$message.error(res.errmsg)
        this.data = res.data
      })
    },
    refreshClick() {
      this.getStockList()
    },
    warehousing() {
      let url = `/form/detail?schemaCode=${this.exportBizForm.saveSchemaCode}&sheetCode=${this.exportBizForm.saveSchemaCode}&queryCode=${this.exportBizForm.saveSchemaCode}&projectName=${this.projectName}&typeId=${this.selectedId}&return=${encodeURIComponent(`${this.$route.fullPath}&iframeAction=add`)}`;
      if(this.exportBizForm.saveWorkflowCode) {
        url = `${url}&isWorkFlow=true&startWorkflowCode=${this.exportBizForm.saveWorkflowCode}`
      }
      this.isDingTalk?this.$router.push(url):window.open(`/${this.projectCode}${url}`)
    },
    warehouse() {
      let url = `/form/detail?schemaCode=${this.exportBizForm.quitSchemaCode}&sheetCode=${this.exportBizForm.quitSchemaCode}&queryCode=${this.exportBizForm.quitSchemaCode}&projectName=${this.projectName}&typeId=${this.selectedId}&return=${encodeURIComponent(`${this.$route.fullPath}&iframeAction=add`)}`;
      if(this.exportBizForm.quitWorkflowCode) {
        url = `${url}&isWorkFlow=true&startWorkflowCode=${this.exportBizForm.quitWorkflowCode}`
      }
      this.isDingTalk?this.$router.push(url):window.open(`/${this.projectCode}${url}`)
    },
    handlerPage(currPage) {
      this.currentPage = currPage;
      if(this.selectedId) {
        this.getStockList();
      }else {
        this.getBizTableList();
      }
    },
    getStockList() {
      this.tableData = [];
      if(!this.selectedId.length) return
      getStockList({
        appCode: this.projectCode??'',
        projectName: this.projectName??'',
        schemaCode: `${this.projectCode}_material_reserve`,
        codeId: this.selectedId,
        codeValue: this.selectedCodeValue,
        multiProjectFlag: this.projectConfig?.multiProjectFlag??true,
        page: this.currentPage-1,
        size: this.pageSize,
        filters: [
          {
            propertyCode: "payType",
            propertyType: 0,
            propertyValue: this.selectPayType
          }
        ]
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg)
        this.dataTotal = res.data.totalElements
        this.tableData = res.data.content
      })
    },
    exportReserveDetail() {
      window.open(`/api/api/materialManage/exportReserveDetail?appCode=${ this.projectCode }&projectName=${encodeURIComponent(`${this.projectConfig?.projectName }`)}&singleProject=${this.isProjectLevel}&payType=${this.selectPayType}` )
    },
    getReserveSchemaFn() {
      getReserveSchema({appCode: this.projectCode}).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg)
        for (const exportBizFormKey in this.exportBizForm) {
          this.exportBizForm[exportBizFormKey] = res.data[exportBizFormKey]
        }
      })
    },
    getBizTableList() {
      getTableList({
        customized: true,
        display: true,
        mobile: false,
        page: this.currentPage-1,
        size: this.pageSize,
        queryCode:`${this.projectCode}_material_reserve`,
        schemaCode: `${this.projectCode}_material_reserve`,
        filters:[
          {
            propertyCode: "xmjc_1",
            propertyType: 0,
            propertyValue: this.projectName??'',
            propertyValueName: ""
          },
          {
            propertyCode: "payType",
            propertyType: 0,
            propertyValue: this.selectPayType,
            propertyValueName: ""
          }
        ]
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg)
        this.dataTotal = res.data.totalElements
        this.tableData = res.data.content
      })
    },
    changePayType(selectPayType) {
      this.selectPayType = selectPayType;
      if(this.selectedId) {
        this.getStockList();
      }else {
        this.getBizTableList();
      }
    }
  },
  computed: {
    isProjectLevel() {
      return !this.projectConfig?.projectKey?false:this.projectConfig.projectKey.indexOf('-')>-1?this.projectConfig.projectKey.split('-')[1]?.indexOf('项目')>-1:false
    }
  },
  destroyed () {
    this.socket.close();
  },
  mounted() {
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
    this.getinit();
    this.getReserveSchemaFn();
    this.socket = new Websocket();
    this.socket.initWebsocket(this.projectCode??'','materialReserve',this.getStockList);
    setTimeout(()=> {
      this.getBizTableList();
    },500)
  },
};
</script>

<style lang="less" scoped>
.InventoryStatistics {
  height: 100%;
  h3 {
    margin-bottom: 10px;
  }
  .InventoryStatistics_content {
    display: flex;
    height: 96%;
    h4 {
      background: #f0f7ff;
      font-size: 14px;
      padding: 9px;
      border-bottom: 1px solid #e4e4e4;
    }
    .InventoryStatistics_left {
      width: 20%;
      background: #fff;
      height: 100%;
      border: 1px solid #e4e4e4;
      .eltree {
        padding: 10px;
        img {
          width: 17px;
          height: 17px;
          margin-right: 5px;
          vertical-align: middle;
        }
        span {
          vertical-align: middle;
        }
      }
    }
    .InventoryStatistics_right {
      width: 80%;
      height: 100%;
      background: #fff;
      border: 1px solid #e4e4e4;
      .selectBtn {
        display: flex;
        justify-content: right;
        //justify-content: space-between;
        padding: 10px;
        .search {
          display: flex;
        }
      }
      .eltable {
        padding: 10px;
      }
    }
  }
  h5 {
    padding-left: 10px;
    border-left: 3px solid #3b7cff;
    font-size: 15px;
    height: 18px;
    line-height: 17px;
    vertical-align: middle;
  }
  .information {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    div {
      margin-right: 50px;
      margin-bottom: 20px;
    }
  }
  .inventory {
    display: flex;
    margin-bottom: 10px;
    padding: 10px;
    div {
      padding: 10px;
      border: 1px solid #333;
      margin-right: 20px;
      :nth-child(2) {
        font-weight: 700;
        font-size: 18px;
      }
    }
  }
}
/deep/.el-dialog__body {
  padding: 10px 20px;
}
</style>

<style lang="less">
.InventoryStatistics {
  .el-input {
    width: 100%;
  }
  .el-button {
    padding: 6px 10px;
  }
  .el-table thead {
    background: #f4f5fc !important;
  }
  .el-table th,
  .el-table tr {
    background: transparent;
  }
}
</style>

<style lang="less" scoped>
@import '../../styles/public.module.less';
/deep/ .el-pagination {
  .el-pager {
    .number:before {
      content: '';
    }
  }
}
/deep/ .el-table {
  margin-bottom: @spacing-base;
  .el-table__body-wrapper {
    height: 100%;
    overflow: auto;
  }
}
/deep/ .el-tree {
  overflow: auto;
}
.out-color {
  color: red;
}
.in-color {
  color: #0ab104;
}
</style>
