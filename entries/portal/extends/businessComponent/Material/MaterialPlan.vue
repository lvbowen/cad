<template>
  <div class="MaterialPlan">
    <div class="title">
      <h3>物资计划</h3>
      <div class="flex">
        <PayTypesPop @changePayType="changePayType"/>
        <el-button @click="toLink('add')" type="primary" :disabled="!isProjectLevel">新增计划</el-button>
        <el-button @click="toLink('fix')" type="primary" :disabled="!isProjectLevel">修改计划</el-button>
        <el-button @click="exportPlan" type="primary">导出</el-button>
      </div>
    </div>
    <div class="content">
      <div class="screen">
        <div class="full-height">
          <el-tabs v-model="activeName" @tab-click="handleClick" class="full-height flex flex-column">
            <el-tab-pane label="年度" name="first">
              <template v-if="yearList.length">
                <p
                  :style="{background: date === item.date?'#f0f7ff':''}"
                  @click="selectDate(item.date,item.id)"
                  v-for="(item,index) in yearList"
                  :key="index">{{ item.date }}</p>
              </template>
            </el-tab-pane>
            <el-tab-pane label="月度" name="second">
              <template v-if="monthList.length">
                <p
                  :style="{background: date === item.date?'#f0f7ff':''}"
                  @click="selectDate(item.date,item.id)"
                  v-for="(item,index) in monthList"
                  :key="index">{{ item.date }}</p>
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div class="table">
        <h4>计划详情</h4>
        <div class="eltable">
          <h3>{{ date }}<span v-if="dateType==='年度'">年</span>物资采购计划清单</h3>
          <div>
            <div class="search">
              <el-input v-model="search" size="mini" placeholder="输入关键字搜索" />
              <el-button slot="append" icon="el-icon-search"></el-button>
            </div>
            <!--            <el-table height="670px" :data="tableData.filter((data) =>!search || data.materialName.toLowerCase().includes(search.toLowerCase()))" style="width: 100%">-->
            <el-table height="670px" :data="tableListData">
              <el-table-column type="index"> </el-table-column>
              <el-table-column label="项目名称" prop="projectName"></el-table-column>
              <el-table-column label="物资名称" prop="type"> </el-table-column>
              <el-table-column label="物资类别" prop="materialName"> </el-table-column>
              <el-table-column label="物资编号" prop="code"> </el-table-column>
              <el-table-column label="物资规格" prop="specification"> </el-table-column>
              <el-table-column label="物资单位" prop="unit"> </el-table-column>
              <el-table-column label="设计使用量" prop="value"> </el-table-column>
              <el-table-column label="采购类型" prop="payType"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Tabs from "element-ui/lib/tabs";
import TabPane from "element-ui/lib/tab-pane";
import Input from "element-ui/lib/input";
import { getPlanDates, getPlanDetail } from "./server/index.js"
import env from "@/config/env";
import { getFormUrl} from "../../service/api";
import PayTypesPop from './PayTypesPop.vue';

export default {
  components: {
    ElTabs: Tabs,
    ElTabPane: TabPane,
    ElInput: Input,
    PayTypesPop
  },
  inject: ["projectConfig"],
  data() {
    return {
      activeName: 'first',
      tableData: [],
      yearList: [],
      monthList: [],
      projectCode: '',
      projectName: '',
      search: '',
      date: '',
      dateType: '年度',
      selectedObjId: '',
      schemaCode: '',
      workflowCode: '',
      selectPayType: ''
    }
  },
  methods: {
    toLink(val) {
      if (val === 'fix') {
        if(!this.selectedObjId) return this.$message.warning('请先选择时间!')
        getFormUrl({
          schemaCode: this.schemaCode,
          bizObjectId: this.selectedObjId
        }).then((res)=> {
          let search = location.search;
          search = search
            ? `${search}&iframeAction=detail`
            : `?iframeAction=detail`;
          let url= '';
          if(this.isDingTalk) {
            const projectLength = window.config.project.length;
            const pathName =  location.pathname.substring(location.pathname.search(window.config.project) + projectLength,location.pathname.length);
            url = `${ res }&return=${ pathName + encodeURIComponent( search )}`;
          }
          this.isDingTalk?this.$router.push(url):window.open(`/${this.projectCode}${res}`);
        })
        // this.$router.push(
        //   {
        //     name: "EditPlan",
        //     query: {
        //       dateType: this.dateType,
        //       date: this.date,
        //       name: "修改计划"
        //     }
        //   })
      } else {
        const url = {
          name: 'form-detail',
          query: {
            return: `${this.$route.fullPath}&iframeAction=add`,
            iframeAction: 'add',
            projectName: this.projectConfig?.projectName,
            schemaCode: this.schemaCode,
            sheetCode:  this.schemaCode
          },
        }
        if(this.workflowCode) {
          Object.assign(url.query, {startWorkflowCode: this.workflowCode, isWorkFlow: true})
        }
        const routerUrl = this.$router.resolve(url)
        this.isDingTalk?this.$router.push(routerUrl.route.fullPath):window.open(routerUrl.href,'_blank')
        // this.$router.push(
        //   {
        //     name: "EditPlan",
        //     query: {
        //       name: "新增计划"
        //     }
        //   })
      }
    },
    handleClick(val) {
      this.date = '';
      if (val.label === "月度") {
        this.dateType = "月度"
        this.date = this.monthList.length?this.monthList[0].date:''
        this.selectedObjId = this.monthList.length?this.monthList[0].id:''
      } else {
        this.dateType = "年度"
        this.date = this.yearList.length?this.yearList[0].date:''
        this.selectedObjId = this.yearList.length?this.yearList[0].id:''
      }
      this.getTableData(this.dateType, this.date)
    },
    selectDate(val,id) {
      this.date = val
      this.selectedObjId = id
      this.getTableData(this.dateType, val)
    },
    getTableData(dateType, date) {
      this.tableData = [];
      if(!date) return;
      getPlanDetail(this.projectCode, this.projectName, dateType, date,this.isProjectLevel,this.selectPayType).then(res => {
        if(res.errcode!==0) return this.$message.error(res.errmsg)
        this.tableData = res.data
      })
    },
    exportPlan() {
      window.open( `/api/api/materialManage/exportPlanDetail?appCode=${ this.projectCode }&projectName=${encodeURIComponent(`${this.projectConfig?.projectName }`)}&singleProject=${this.isProjectLevel}&dateType=${this.dateType}&date=${this.date}&payType=${this.selectPayType}` )
    },
    changePayType(selectPayType) {
      this.selectPayType = selectPayType;
      this.getTableData(this.dateType,this.date)
    }
  },
  computed: {
    isProjectLevel() {
      return !this.projectConfig?.projectKey?false:this.projectConfig.projectKey.indexOf('-')>-1?this.projectConfig.projectKey.split('-')[1]?.indexOf('项目')>-1:false
    },
    tableListData() {
      return this.tableData.filter((data) =>!this.search || data.materialName.toLowerCase().includes(this.search.toLowerCase()) || data.projectName.indexOf(this.search)>-1 || data.type.indexOf(this.search)>-1 || data.specification.indexOf(this.search)>-1)
    }
  },
  mounted() {
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
    getPlanDates(this.projectCode, this.projectName,this.isProjectLevel).then(res => {
      if(res.errcode!==0) return this.$message.error(res.errmsg)
      if (!res.data) this.$message.error("暂无数据")
      this.yearList = res.data.years
      this.monthList = res.data.months
      this.schemaCode = res.data.schemaCode
      this.workflowCode = res.data.workflowCode;
      if(this.yearList.length) {
        this.date = this.yearList[0].date;
        this.selectedObjId = this.yearList[0].id;
      }
      this.getTableData("年度", this.date)
    })
  },
}
</script>


<style lang="less" scoped>
.MaterialPlan {
  height: 100%;
  .title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .content {
    display: flex;
    height: 95%;
    .screen {
      width: 20%;
      background: #fff;
      height: 100%;
      border: 1px solid #e4e4e4;
      p {
        font-size: 14px;
        cursor: pointer;
        padding: 5px 10px;
      }
      p:hover {
        background: #f0f7ff;
      }
    }
    .table {
      width: 80%;
      height: 100%;
      background: #fff;
      border: 1px solid #e4e4e4;
      h4 {
        background: #f0f7ff;
        font-size: 14px;
        padding: 9px;
        border-bottom: 1px solid #e4e4e4;
      }
      .eltable {
        padding: 20px;
        .search {
          display: flex;
          margin-bottom: 10px;
        }
        h3 {
          text-align: center;
          font-weight: 700;
          font-family: Source Han Sans CN;
        }
      }
    }
  }
}
</style>

<style lang="less">
.MaterialPlan {
  .screen {
    .el-tabs__nav-wrap {
      background: #f0f7ff;
      padding: 0 20px;
    }
    .el-tabs__content {
      padding: 0 10px;
      overflow: auto;
    }
  }
  .eltable {
    .el-input {
      width: 17%;
    }
    .el-button {
      padding: 0px 10px;
    }
    .el-table thead {
      background: #f4f5fc !important;
    }
    .el-table th,
    .el-table tr {
      background: transparent;
    }
  }
  .title {
    .el-button {
      padding: 9px;
    }
  }
}
</style>

<style lang="less" scoped>
@import '../../styles/public.module.less';
</style>
