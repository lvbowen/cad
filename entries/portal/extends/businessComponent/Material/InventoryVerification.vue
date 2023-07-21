<template>
  <div class="InventoryVerification">
    <h3>盘点核销</h3>
    <div class="eltable">
      <div class="title">
        <div class="datePick">
          <span>统计类型：</span>
          <el-button :style="{background: type === 'year'?'#2761db':'',color:type === 'year'?'#fff':''}" @click="yearType">年度盘点</el-button>
          <el-button :style="{background: type === 'monthrange'?'#2761db':'',color:type === 'monthrange'?'#fff':''}" @click="monthType">月度盘点</el-button>
          <el-date-picker
            @change="datePick"
            :valueFormat="valueFormat"
            :rangeSeparator="type==='monthrange'?'至':''"
            :type="type"
            :key="type"
            v-model="value1"
            :startPlaceholder="type==='monthrange'?'开始月份':''"
            :endPlaceholder="type==='monthrange'?'结束月份':''"
            :pickerOptions="type==='monthrange'?pickerOptions:{}"
            :placeholder="type==='monthrange'?'选择月范围':'选择年份'">
          </el-date-picker>
        </div>
        <div class="flex">
          <PayTypesPop @changePayType="changePayType"/>
          <el-button @click="download" type="primary">导出</el-button>
        </div>
        <!--        <div>-->
        <!--          &lt;!&ndash; <el-button>打印</el-button> &ndash;&gt;-->
        <!--        </div>-->
      </div>
      <div class="tableContent">
        <h4>{{ projectTitle }}</h4>
        <h5>{{ subtitle }}</h5>
        <div>
          <!-- <el-input v-model="search" size="mini" placeholder="输入关键字搜索" /> -->
          <el-table height="670px" :data="tableData" style="width: 100%">
            <el-table-column type="index"> </el-table-column>
            <el-table-column label="项目名称" prop="projectName"></el-table-column>
            <el-table-column label="物资名称" prop="type"> </el-table-column>
            <el-table-column label="物资编号" prop="code"> </el-table-column>
            <el-table-column label="物资类型" prop="materialName"> </el-table-column>
            <el-table-column label="物资规格" prop="specification"> </el-table-column>
            <el-table-column label="物资单位" prop="unit"> </el-table-column>
            <el-table-column label="月度设计量" prop="designValue"> </el-table-column>
            <el-table-column label="月度入库数" prop="saveValue"> </el-table-column>
            <el-table-column label="月度出库数" prop="quitValue"> </el-table-column>
            <el-table-column label="当前库存数" prop="currentValue"> </el-table-column>
            <el-table-column label="节超量" prop="saveBeyondValue"> </el-table-column>
            <el-table-column label="损耗率" prop="saveBeyondRatio"> </el-table-column>
            <el-table-column label="采购类型" prop="payType"></el-table-column>
            <el-table-column prop="operate" label="操作">
              <template slot-scope="scope">
                <a @click="openDetailDialog(scope.row)">查看明细</a>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <el-dialog title="查看明细" :visible.sync="dialogTableVisible">
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
import DatePicker from "element-ui/lib/date-picker";
// import Input from "element-ui/lib/input";
import env from "@/config/env";
import Button from 'element-ui/lib/button';
import { getMaterialManageAnalyse } from "../../service/api";
import PayTypesPop from './PayTypesPop.vue';
export default {
  components: {
    ElDatePicker: DatePicker,
    // ElInput: Input,
    PayTypesPop,
    ElButton: Button
  },
  data() {
    return {
      type: 'year',
      valueFormat: 'yyyy',
      dateType: '年度',
      search: '',
      value1: '',
      tableData: [],
      projectCode: '',
      projectName: '',
      subtitle: '',
      projectTitle: '',
      pickerOptions: {
        shortcuts: [
          {
            text: '本月',
            onClick(picker) {
              picker.$emit('pick', [new Date(), new Date()]);
            }
          },
          {
            text: '今年至今',
            onClick(picker) {
              const end = new Date();
              const start = new Date(new Date().getFullYear(), 0);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近六个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setMonth(start.getMonth() - 6);
              picker.$emit('pick', [start, end]);
            },
          }
        ]
      },
      dialogTableVisible: false,
      gridData: [],
      selectPayType: ''
    }
  },
  inject: ["projectConfig"],
  methods: {
    yearType() {
      this.type = "year"
      this.valueFormat = "yyyy"
      this.value1 = ""
      this.dateType = "年度"
    },
    monthType() {
      this.type = "monthrange"
      this.valueFormat = "yyyy-MM"
      this.dateType = "月度"
      this.value1 = ""
    },
    datePick() {
      this.getinit(this.dateType, this.value1)
    },
    download() {
      if(!this.value1) return this.$message.error("请选择日期！")
      let url = `/api/api/materialManage/exportAnalyse?appCode=${this.projectCode}&projectName=${this.projectName}&singleProject=${this.isProjectLevel}&dateType=${this.dateType}&payType=${this.selectPayType}`;
      if(this.dateType==='年度') {
        url = `${url}&year=${this.value1}`
      }else{
        url = `${url}&startMonth=${this.value1[0]}&endMonth=${this.value1[1]}`
      }
      window.open(url)
      // window.open(`/api/materialManage/exportAnalyse?appCode=${this.projectCode}&projectName=${this.projectName}&singleProject=${this.isProjectLevel}&dateType=${this.dateType}&year=${this.value1}`)
    },
    getinit(dateType, date) {
      const params = {
        appCode: this.projectCode,
        projectName: this.projectName,
        dateType: dateType,
        singleProject: this.isProjectLevel,
        payType: this.selectPayType
      }
      if(dateType==='年度') {
        Object.assign(params,{year:date})
      }else if(dateType==='月度'){
        Object.assign(params,{startMonth:date[0],endMonth:date[1]})
      }
      getMaterialManageAnalyse(params).then(res => {
        if(res.errcode!==0) return this.$message.error(res.errmsg)
        this.tableData = res.data.datas
        this.projectTitle = res.data.projectTitle
        this.subtitle = res.data.title
      })
    },
    openDetailDialog(row) {
      this.gridData = [];
      this.dialogTableVisible = true;
      this.gridData = row.details;
    },
    changePayType(selectPayType) {
      this.selectPayType = selectPayType;
      this.getinit(this.dateType,this.value1)
    }
  },
  computed: {
    isProjectLevel() {
      return !this.projectConfig?.projectKey?false:this.projectConfig.projectKey.indexOf('-')>-1?this.projectConfig.projectKey.split('-')[1]?.indexOf('项目')>-1:false
    }
  },
  mounted() {
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
    //动态获取季度
    let mappingMonth = Math.ceil((new Date().getMonth()+1)/3);
    // let mappingMonth = Math.ceil((Math.random()*11+1)/3);
    const arr = [];
    const timer = setInterval(()=> {
      // console.log(mappingMonth,'11',arr,'arr')
      if(mappingMonth===0) {
        clearInterval(timer)
        arr.map((item) => {
          this.pickerOptions.shortcuts.push({
            text: `第${item===1?'一':item===2?'二':item===3?'三':'四'}季度`,
            onClick(picker) {
              const start = new Date(new Date().getFullYear(),(item-1)*3);
              const end = new Date(new Date().getFullYear(),(item-1)*3+2);
              picker.$emit('pick',[start,end])
            }
          })
        })
      }else {
        arr.unshift(mappingMonth);
        mappingMonth--
      }
    },0)
  },
};
</script>

<style lang="less" scoped>
.InventoryVerification {
  height: 100%;
  h3 {
    margin-bottom: 10px;
  }
  .eltable {
    padding: 10px;
    background: #fff;
    .title {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 2px solid #d7d7d7;
      margin-bottom: 10px;
      padding-bottom: 15px;
      .datePick {
        width: 40%;
        :nth-child(3) {
          margin-right: 10px;
        }
      }
    }
    .tableContent {
      h4 {
        text-align: center;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 5px;
      }
      h5 {
        text-align: center;
        font-size: 14px;
        font-weight: 700;
        color: #2760a5;
        margin-bottom: 20px;
      }
    }
  }
}
</style>

<style lang="less">
.InventoryVerification {
  .el-input {
    width: 30%;
  }
  .el-input__inner {
    //height: 35px;
    //line-height: 35px;
  }
  .el-input__icon {
    line-height: 35px;
  }
  //.el-button {
  //  padding: 10px 17px;
  //}
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
@import "../../styles/public.module.less";
.out-color {
  color: red;
}
.in-color {
  color: #0ab104;
}
</style>
